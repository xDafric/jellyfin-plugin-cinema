using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>Letterboxd watched films (read only) and the movie archive (metadata kept, file removed).</summary>
[ApiController]
[Route("Cinema")]
public class ExtrasController : ControllerBase
{
    private static readonly Regex UserRx = new("^[A-Za-z0-9_]{1,40}$", RegexOptions.Compiled);
    private static readonly SemaphoreSlim LbLock = new(1, 1);
    private static readonly Dictionary<string, DateTime> LbFetched = new();
    private static readonly SemaphoreSlim ArchLock = new(1, 1);
    private readonly IHttpClientFactory _http;

    public ExtrasController(IHttpClientFactory http) => _http = http;

    private static PluginConfiguration Cfg => Plugin.Instance!.Configuration;

    private bool IsAdmin => User.IsInRole("Administrator");

    private static string Dir(string sub)
    {
        var p = Path.Combine(Plugin.Instance!.DataFolderPath, sub);
        Directory.CreateDirectory(p);
        return p;
    }

    // ---------------------------------------------------------------- Letterboxd (read only)

    private static string Norm(string? s) => Regex.Replace((s ?? string.Empty).ToLowerInvariant(), @"[^\p{L}\p{N}]+", " ").Trim();

    private static string LbKey(int? tmdb, string? title, int? year) => tmdb is > 0 ? "t" + tmdb : "n" + Norm(title) + "|" + year;

    private static async Task<Dictionary<string, JsonObject>> LbLoad(string user)
    {
        var path = Path.Combine(Dir("letterboxd"), user.ToLowerInvariant() + ".json");
        if (!System.IO.File.Exists(path))
        {
            return new Dictionary<string, JsonObject>();
        }

        try
        {
            var arr = JsonNode.Parse(await System.IO.File.ReadAllTextAsync(path).ConfigureAwait(false))?.AsArray() ?? new JsonArray();
            var d = new Dictionary<string, JsonObject>();
            foreach (var n in arr)
            {
                if (n is JsonObject o)
                {
                    d[LbKey(o["tmdb"]?.GetValue<int?>(), o["title"]?.ToString(), o["year"]?.GetValue<int?>())] = o;
                }
            }

            return d;
        }
        catch
        {
            return new Dictionary<string, JsonObject>();
        }
    }

    private static async Task LbSave(string user, Dictionary<string, JsonObject> d)
    {
        var arr = new JsonArray();
        foreach (var o in d.Values)
        {
            arr.Add(o.DeepClone());
        }

        await System.IO.File.WriteAllTextAsync(Path.Combine(Dir("letterboxd"), user.ToLowerInvariant() + ".json"), arr.ToJsonString()).ConfigureAwait(false);
    }

    private static void LbMerge(Dictionary<string, JsonObject> d, int? tmdb, string title, int? year, string? date, double? rating, string? slug)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return;
        }

        // a film first imported by name gets its TMDb id later: drop the name based duplicate
        var key = LbKey(tmdb, title, year);
        if (tmdb is > 0)
        {
            d.Remove(LbKey(null, title, year));
        }

        if (d.TryGetValue(key, out var old))
        {
            var od = old["date"]?.ToString() ?? string.Empty;
            if (!string.IsNullOrEmpty(date) && string.CompareOrdinal(date, od) <= 0)
            {
                date = od; // keep the latest viewing
            }

            rating ??= old["rating"]?.GetValue<double?>();
            slug ??= old["slug"]?.ToString();
        }

        d[key] = new JsonObject { ["tmdb"] = tmdb, ["title"] = title, ["year"] = year, ["date"] = date, ["rating"] = rating, ["slug"] = slug };
    }

    private async Task<int> LbFetchRss(string user, Dictionary<string, JsonObject> d, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "https://letterboxd.com/" + user + "/rss/");
        req.Headers.TryAddWithoutValidation("User-Agent", "Mozilla/5.0 (compatible; JellyfinPluginCinema/1.0; +https://github.com/xDafric/jellyfin-plugin-cinema)");
        var c = _http.CreateClient("Cinema");
        c.Timeout = TimeSpan.FromSeconds(30);
        using var resp = await c.SendAsync(req, ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("Letterboxd answered " + (int)resp.StatusCode);
        }

        var doc = XDocument.Parse(await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false));
        XNamespace lb = "https://letterboxd.com";
        XNamespace tm = "https://themoviedb.org";
        var n = 0;
        foreach (var item in doc.Descendants("item"))
        {
            var watched = item.Element(lb + "watchedDate")?.Value;
            var title = item.Element(lb + "filmTitle")?.Value;
            if (string.IsNullOrEmpty(watched) || string.IsNullOrEmpty(title))
            {
                continue; // list entries and the like
            }

            int? year = int.TryParse(item.Element(lb + "filmYear")?.Value, out var y) ? y : null;
            int? tmdb = int.TryParse(item.Element(tm + "movieId")?.Value, out var t) ? t : null;
            double? rating = double.TryParse(item.Element(lb + "memberRating")?.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var r) ? r : null;
            var link = item.Element("link")?.Value ?? string.Empty;
            var m = Regex.Match(link, @"/film/([^/]+)/");
            LbMerge(d, tmdb, title, year, watched, rating, m.Success ? m.Groups[1].Value : null);
            n++;
        }

        return n;
    }

    /// <summary>Films watched on Letterboxd (diary RSS feed plus everything imported from the CSV export). Read only: nothing is ever written to Letterboxd.</summary>
    [HttpGet("letterboxd/watched")]
    [Authorize]
    public async Task<IActionResult> LbWatched([FromQuery] string user, [FromQuery] bool refresh, CancellationToken ct)
    {
        if (!Cfg.FeatLetterboxd || string.IsNullOrEmpty(user) || !UserRx.IsMatch(user))
        {
            return Content("{\"items\":[],\"enabled\":" + (Cfg.FeatLetterboxd ? "true" : "false") + "}", "application/json");
        }

        await LbLock.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            var d = await LbLoad(user).ConfigureAwait(false);
            string? error = null;
            var key = user.ToLowerInvariant();
            if (refresh || !LbFetched.TryGetValue(key, out var at) || DateTime.UtcNow - at > TimeSpan.FromMinutes(20))
            {
                try
                {
                    await LbFetchRss(user, d, ct).ConfigureAwait(false);
                    LbFetched[key] = DateTime.UtcNow;
                    await LbSave(user, d).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    error = ex.Message;
                }
            }

            var arr = new JsonArray();
            foreach (var o in d.Values)
            {
                arr.Add(o.DeepClone());
            }

            return Content(new JsonObject { ["enabled"] = true, ["items"] = arr, ["error"] = error }.ToJsonString(), "application/json");
        }
        finally
        {
            LbLock.Release();
        }
    }

    /// <summary>Adds films from the Letterboxd CSV export (watched.csv / diary.csv), parsed in the browser: [{title, year, date}].</summary>
    [HttpPost("letterboxd/import")]
    [Authorize]
    public async Task<IActionResult> LbImport([FromQuery] string user, [FromBody] JsonArray body, CancellationToken ct)
    {
        if (!Cfg.FeatLetterboxd || string.IsNullOrEmpty(user) || !UserRx.IsMatch(user))
        {
            return BadRequest(new { error = "Letterboxd sync is off or the user name is invalid" });
        }

        await LbLock.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            var d = await LbLoad(user).ConfigureAwait(false);
            var n = 0;
            foreach (var o in body.OfType<JsonObject>().Take(20000))
            {
                var title = o["title"]?.ToString();
                if (string.IsNullOrWhiteSpace(title))
                {
                    continue;
                }

                int? year = int.TryParse(o["year"]?.ToString(), out var y) ? y : null;
                LbMerge(d, null, title, year, o["date"]?.ToString(), null, null);
                n++;
            }

            await LbSave(user, d).ConfigureAwait(false);
            return Ok(new { imported = n, total = d.Count });
        }
        finally
        {
            LbLock.Release();
        }
    }

    // ---------------------------------------------------------------- archive

    private static string ArchIndex => Path.Combine(Dir("archive"), "index.json");

    private static async Task<JsonArray> ArchRead()
    {
        if (!System.IO.File.Exists(ArchIndex))
        {
            return new JsonArray();
        }

        try
        {
            return JsonNode.Parse(await System.IO.File.ReadAllTextAsync(ArchIndex).ConfigureAwait(false))?.AsArray() ?? new JsonArray();
        }
        catch
        {
            return new JsonArray();
        }
    }

    [HttpGet("archive/list")]
    [Authorize]
    public async Task<IActionResult> ArchList()
    {
        if (!Cfg.FeatArchive)
        {
            return Content("[]", "application/json");
        }

        return Content((await ArchRead().ConfigureAwait(false)).ToJsonString(), "application/json");
    }

    /// <summary>Admin: store the metadata and pictures of a movie before its file is removed.</summary>
    [HttpPost("archive/add")]
    [Authorize]
    public async Task<IActionResult> ArchAdd([FromBody] JsonObject body)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        if (!Cfg.FeatArchive)
        {
            return BadRequest(new { error = "The archive is turned off" });
        }

        await ArchLock.WaitAsync().ConfigureAwait(false);
        try
        {
            var arr = await ArchRead().ConfigureAwait(false);
            var tmdb = body["tmdb"]?.ToString();
            var title = body["title"]?.ToString() ?? "?";
            var key = Guid.NewGuid().ToString("N");
            foreach (var n in arr.ToList())
            {
                if (n is JsonObject o && !string.IsNullOrEmpty(tmdb) && o["tmdb"]?.ToString() == tmdb)
                {
                    key = o["key"]?.ToString() ?? key; // archiving it again updates the entry
                    arr.Remove(n);
                }
            }

            foreach (var kind in new[] { "primary", "backdrop" })
            {
                var b64 = body[kind + "B64"]?.ToString();
                if (!string.IsNullOrEmpty(b64))
                {
                    await System.IO.File.WriteAllBytesAsync(Path.Combine(Dir("archive"), key + "-" + kind + ".jpg"), Convert.FromBase64String(b64)).ConfigureAwait(false);
                }
            }

            var entry = new JsonObject
            {
                ["key"] = key,
                ["tmdb"] = tmdb,
                ["title"] = title,
                ["year"] = body["year"]?.DeepClone(),
                ["overview"] = body["overview"]?.ToString(),
                ["tagline"] = body["tagline"]?.ToString(),
                ["genres"] = body["genres"]?.DeepClone(),
                ["runtime"] = body["runtime"]?.DeepClone(),
                ["rating"] = body["rating"]?.DeepClone(),
                ["officialRating"] = body["officialRating"]?.ToString(),
                ["played"] = body["played"]?.DeepClone(),
                ["size"] = body["size"]?.DeepClone(),
                ["archived"] = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                ["hasPrimary"] = !string.IsNullOrEmpty(body["primaryB64"]?.ToString()),
                ["hasBackdrop"] = !string.IsNullOrEmpty(body["backdropB64"]?.ToString())
            };
            arr.Insert(0, entry);
            await System.IO.File.WriteAllTextAsync(ArchIndex, arr.ToJsonString()).ConfigureAwait(false);
            return Ok(new { ok = true, key });
        }
        finally
        {
            ArchLock.Release();
        }
    }

    [HttpDelete("archive/{key}")]
    [Authorize]
    public async Task<IActionResult> ArchRemove(string key)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        if (!Regex.IsMatch(key, "^[a-f0-9]{32}$"))
        {
            return BadRequest();
        }

        await ArchLock.WaitAsync().ConfigureAwait(false);
        try
        {
            var arr = await ArchRead().ConfigureAwait(false);
            foreach (var n in arr.ToList())
            {
                if (n is JsonObject o && o["key"]?.ToString() == key)
                {
                    arr.Remove(n);
                }
            }

            await System.IO.File.WriteAllTextAsync(ArchIndex, arr.ToJsonString()).ConfigureAwait(false);
            foreach (var kind in new[] { "primary", "backdrop" })
            {
                var f = Path.Combine(Dir("archive"), key + "-" + kind + ".jpg");
                if (System.IO.File.Exists(f))
                {
                    System.IO.File.Delete(f);
                }
            }

            return Ok(new { ok = true });
        }
        finally
        {
            ArchLock.Release();
        }
    }

    [HttpGet("archive/img/{key}/{kind}")]
    [Authorize]
    public IActionResult ArchImage(string key, string kind)
    {
        if (!Regex.IsMatch(key, "^[a-f0-9]{32}$") || (kind != "primary" && kind != "backdrop"))
        {
            return NotFound();
        }

        var f = Path.Combine(Dir("archive"), key + "-" + kind + ".jpg");
        if (!System.IO.File.Exists(f))
        {
            return NotFound();
        }

        Response.Headers.CacheControl = "public, max-age=86400";
        return PhysicalFile(f, "image/jpeg");
    }

    // ---------------------------------------------------------------- Radarr: archive / restore

    private async Task<(JsonObject? Movie, string? Error)> RadarrMovie(int tmdb, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, Cfg.RadarrUrl.TrimEnd('/') + "/api/v3/movie?tmdbId=" + tmdb);
        req.Headers.TryAddWithoutValidation("X-Api-Key", Cfg.RadarrApiKey);
        using var resp = await Http().SendAsync(req, ct).ConfigureAwait(false);
        if (!resp.IsSuccessStatusCode)
        {
            return (null, "Radarr answered " + (int)resp.StatusCode);
        }

        var arr = JsonNode.Parse(await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false))?.AsArray();
        return (arr?.FirstOrDefault() as JsonObject, null);
    }

    private HttpClient Http()
    {
        var c = _http.CreateClient("Cinema");
        c.Timeout = TimeSpan.FromSeconds(30);
        return c;
    }

    private async Task<HttpResponseMessage> RadarrSend(HttpMethod method, string path, JsonNode? body, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(method, Cfg.RadarrUrl.TrimEnd('/') + path);
        req.Headers.TryAddWithoutValidation("X-Api-Key", Cfg.RadarrApiKey);
        if (body is not null)
        {
            req.Content = new StringContent(body.ToJsonString(), Encoding.UTF8, MediaTypeHeaderValue.Parse("application/json"));
        }

        return await Http().SendAsync(req, ct).ConfigureAwait(false);
    }

    /// <summary>Admin: delete the movie file in Radarr and stop monitoring it (the entry stays in Radarr, so nothing is downloaded again).</summary>
    [HttpPost("arr/radarr/archive")]
    [Authorize]
    public async Task<IActionResult> RadarrArchive([FromBody] JsonObject body, CancellationToken ct)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(Cfg.RadarrUrl) || !int.TryParse(body["tmdbId"]?.ToString(), out var tmdb))
        {
            return Ok(new { ok = false, found = false, message = "Radarr is not configured" });
        }

        try
        {
            var (movie, err) = await RadarrMovie(tmdb, ct).ConfigureAwait(false);
            if (err is not null)
            {
                return Ok(new { ok = false, found = false, message = err });
            }

            if (movie is null)
            {
                return Ok(new { ok = true, found = false });
            }

            var id = movie["id"]?.GetValue<int>() ?? 0;
            var fileId = movie["movieFile"]?["id"]?.GetValue<int?>();
            if (fileId is > 0)
            {
                using var del = await RadarrSend(HttpMethod.Delete, "/api/v3/moviefile/" + fileId, null, ct).ConfigureAwait(false);
            }

            movie["monitored"] = false;
            using var put = await RadarrSend(HttpMethod.Put, "/api/v3/movie/" + id, movie, ct).ConfigureAwait(false);
            return Ok(new { ok = put.IsSuccessStatusCode, found = true, fileDeleted = fileId is > 0 });
        }
        catch (Exception ex)
        {
            return Ok(new { ok = false, found = false, message = ex.Message });
        }
    }

    /// <summary>Admin: monitor the movie again in Radarr and search for it.</summary>
    [HttpPost("arr/radarr/restore")]
    [Authorize]
    public async Task<IActionResult> RadarrRestore([FromBody] JsonObject body, CancellationToken ct)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(Cfg.RadarrUrl) || !int.TryParse(body["tmdbId"]?.ToString(), out var tmdb))
        {
            return Ok(new { ok = false, found = false, message = "Radarr is not configured" });
        }

        try
        {
            var (movie, err) = await RadarrMovie(tmdb, ct).ConfigureAwait(false);
            if (err is not null || movie is null)
            {
                return Ok(new { ok = false, found = false, message = err ?? "Not in Radarr" });
            }

            var id = movie["id"]?.GetValue<int>() ?? 0;
            movie["monitored"] = true;
            using var put = await RadarrSend(HttpMethod.Put, "/api/v3/movie/" + id, movie, ct).ConfigureAwait(false);
            using var cmd = await RadarrSend(HttpMethod.Post, "/api/v3/command", new JsonObject { ["name"] = "MoviesSearch", ["movieIds"] = new JsonArray(id) }, ct).ConfigureAwait(false);
            return Ok(new { ok = put.IsSuccessStatusCode && cmd.IsSuccessStatusCode, found = true });
        }
        catch (Exception ex)
        {
            return Ok(new { ok = false, found = false, message = ex.Message });
        }
    }
}
