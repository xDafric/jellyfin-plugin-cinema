using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

[ApiController]
[Route("Cinema")]
public class CinemaController : ControllerBase
{
    private static readonly Dictionary<string, string> SeerrUserCache = new();
    private static readonly SemaphoreSlim SeerrUserLock = new(1, 1);
    private readonly IHttpClientFactory _http;

    public CinemaController(IHttpClientFactory http) => _http = http;

    private static PluginConfiguration Cfg => Plugin.Instance!.Configuration;

    private bool IsAdmin => User.IsInRole("Administrator");

    private string? JellyfinUserId => User.FindFirst("Jellyfin-UserId")?.Value;

    // ---------------------------------------------------------------- UI script

    [HttpGet("ui.js")]
    [AllowAnonymous]
    public IActionResult UiScript()
    {
        var version = typeof(Plugin).Assembly.GetName().Version?.ToString() ?? "0";
        var overridePath = Path.Combine(Plugin.Instance!.DataFolderPath, "ui-" + version + ".js");
        if (System.IO.File.Exists(overridePath))
        {
            Response.Headers.CacheControl = "no-cache";
            return Content(System.IO.File.ReadAllText(overridePath), "application/javascript; charset=utf-8");
        }

        var asm = typeof(Plugin).Assembly;
        using var stream = asm.GetManifestResourceStream("Jellyfin.Plugin.Cinema.Web.cinema.js");
        if (stream is null)
        {
            return NotFound();
        }

        using var reader = new StreamReader(stream, Encoding.UTF8);
        Response.Headers.CacheControl = "no-cache";
        return Content(reader.ReadToEnd(), "application/javascript; charset=utf-8");
    }

    /// <summary>Admin only: replace the interface script without rebuilding the plugin (kept per plugin version).</summary>
    [HttpPost("admin/ui")]
    [Authorize]
    public async Task<IActionResult> UploadUi(CancellationToken ct)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var body = await reader.ReadToEndAsync(ct).ConfigureAwait(false);
        if (body.Length < 1000)
        {
            return BadRequest(new { error = "Script too small" });
        }

        var version = typeof(Plugin).Assembly.GetName().Version?.ToString() ?? "0";
        Directory.CreateDirectory(Plugin.Instance!.DataFolderPath);
        await System.IO.File.WriteAllTextAsync(Path.Combine(Plugin.Instance.DataFolderPath, "ui-" + version + ".js"), body, ct).ConfigureAwait(false);
        return Ok(new { ok = true, bytes = body.Length });
    }

    [HttpDelete("admin/ui")]
    [Authorize]
    public IActionResult ResetUi()
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        var version = typeof(Plugin).Assembly.GetName().Version?.ToString() ?? "0";
        var path = Path.Combine(Plugin.Instance!.DataFolderPath, "ui-" + version + ".js");
        if (System.IO.File.Exists(path))
        {
            System.IO.File.Delete(path);
        }

        return Ok(new { ok = true });
    }

    // ---------------------------------------------------------------- hidden titles (extended mode code)

    private static int _hiddenFails;

    private static string HashCode(string salt, string code)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(salt + "|" + code));
        return Convert.ToHexString(bytes);
    }

    [HttpGet("hidden/status")]
    [Authorize]
    public IActionResult HiddenStatus() => Ok(new { hasCode = !string.IsNullOrEmpty(Cfg.HiddenCodeHash) });

    [HttpPost("hidden/verify")]
    [Authorize]
    public async Task<IActionResult> HiddenVerify([FromBody] JsonObject body, CancellationToken ct)
    {
        var code = body?["code"]?.ToString() ?? string.Empty;
        if (string.IsNullOrEmpty(Cfg.HiddenCodeHash) || string.IsNullOrEmpty(code))
        {
            return Ok(new { ok = false });
        }

        var ok = System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(HashCode(Cfg.HiddenCodeSalt, code)),
            Encoding.UTF8.GetBytes(Cfg.HiddenCodeHash));
        if (ok)
        {
            Interlocked.Exchange(ref _hiddenFails, 0);
            return Ok(new { ok = true });
        }

        var fails = Interlocked.Increment(ref _hiddenFails);
        await Task.Delay(Math.Min(fails, 10) * 500, ct).ConfigureAwait(false);
        return Ok(new { ok = false });
    }

    /// <summary>Admin only: set or change the code. An empty code removes it (extended mode can then not be unlocked).</summary>
    [HttpPost("hidden/code")]
    [Authorize]
    public IActionResult HiddenSetCode([FromBody] JsonObject body)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        var code = body?["code"]?.ToString() ?? string.Empty;
        if (code.Length == 0)
        {
            Cfg.HiddenCodeHash = string.Empty;
            Cfg.HiddenCodeSalt = string.Empty;
        }
        else
        {
            Cfg.HiddenCodeSalt = Guid.NewGuid().ToString("N");
            Cfg.HiddenCodeHash = HashCode(Cfg.HiddenCodeSalt, code);
        }

        Plugin.Instance!.SaveConfiguration();
        return Ok(new { ok = true, hasCode = code.Length > 0 });
    }

    // ---------------------------------------------------------------- status / test

    [HttpGet("status")]
    [Authorize]
    public IActionResult Status()
    {
        var c = Cfg;
        return Ok(new
        {
            version = typeof(Plugin).Assembly.GetName().Version?.ToString(),
            seerr = !string.IsNullOrWhiteSpace(c.SeerrUrl) && !string.IsNullOrWhiteSpace(c.SeerrApiKey),
            radarr = !string.IsNullOrWhiteSpace(c.RadarrUrl) && !string.IsNullOrWhiteSpace(c.RadarrApiKey),
            sonarr = !string.IsNullOrWhiteSpace(c.SonarrUrl) && !string.IsNullOrWhiteSpace(c.SonarrApiKey),
            aurral = !string.IsNullOrWhiteSpace(c.AurralUrl) && !string.IsNullOrWhiteSpace(c.AurralApiKey),
            admin = IsAdmin,
            features = new
            {
                hero = c.FeatHero, peek = c.FeatPeek, discover = c.FeatDiscover, watchlist = c.FeatWatchlist, requests = c.FeatRequests,
                calendar = c.FeatCalendar, music = c.FeatMusic, musicDiscovery = c.FeatMusicDiscovery, ownPlayer = c.FeatOwnPlayer,
                letterboxd = c.FeatLetterboxd, archive = c.FeatArchive, archiveRadarr = c.ArchiveRadarr, mediaInfo = c.FeatMediaInfo, ratings = c.FeatRatings, seerrSimilar = c.FeatSeerrSimilar, infiniteScroll = c.FeatInfiniteScroll,
                pluginMenus = c.FeatPluginMenus, itemMenu = c.FeatItemMenu
            },
            defaults = new
            {
                allowUserOverrides = c.AllowUserOverrides, accent = c.AccentColor, brand = c.BrandText, heroItems = c.HeroItems,
                heroInterval = c.HeroIntervalSeconds, peekDelay = c.PeekDelayMs, cardSize = c.CardSize, seerrWatchlistSync = c.SeerrWatchlistSync,
                pl_autoNext = c.PlayerAutoNext, pl_autoSkip = c.PlayerAutoSkipIntro, pl_quality = c.PlayerQuality,
                hiddenNav = c.HiddenNav, sections = c.DefaultSections
            }
        });
    }

    [HttpGet("test/{service}")]
    [Authorize]
    public async Task<IActionResult> Test(string service, CancellationToken ct)
    {
        if (!IsAdmin)
        {
            return Forbid();
        }

        var (url, key, path, header) = service.ToLowerInvariant() switch
        {
            "seerr" => (Cfg.SeerrUrl, Cfg.SeerrApiKey, "/api/v1/status", "X-Api-Key"),
            "radarr" => (Cfg.RadarrUrl, Cfg.RadarrApiKey, "/api/v3/system/status", "X-Api-Key"),
            "sonarr" => (Cfg.SonarrUrl, Cfg.SonarrApiKey, "/api/v3/system/status", "X-Api-Key"),
            "aurral" => (Cfg.AurralUrl, Cfg.AurralApiKey, "/api/health", "X-Api-Key"),
            _ => (string.Empty, string.Empty, string.Empty, string.Empty)
        };
        if (string.IsNullOrWhiteSpace(url))
        {
            return Ok(new { ok = false, message = "Not configured" });
        }

        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, Join(url, path));
            req.Headers.TryAddWithoutValidation(header, key);
            using var resp = await Client().SendAsync(req, ct).ConfigureAwait(false);
            return Ok(new { ok = resp.IsSuccessStatusCode, status = (int)resp.StatusCode, message = resp.ReasonPhrase });
        }
        catch (Exception ex)
        {
            return Ok(new { ok = false, message = ex.Message });
        }
    }

    // ---------------------------------------------------------------- Seerr

    [AcceptVerbs("GET", "POST", "PUT", "DELETE")]
    [Route("seerr/{**path}")]
    [Authorize]
    public async Task<IActionResult> Seerr(string path, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(Cfg.SeerrUrl))
        {
            return StatusCode(503, new { error = "Seerr is not configured" });
        }

        var headers = new Dictionary<string, string> { ["X-Api-Key"] = Cfg.SeerrApiKey };
        var seerrUser = await ResolveSeerrUser(ct).ConfigureAwait(false);
        if (seerrUser is not null)
        {
            headers["X-Api-User"] = seerrUser;
        }
        else if (!IsAdmin && Request.Method != "GET")
        {
            return StatusCode(403, new { error = "Your Jellyfin user is not linked to a Seerr user" });
        }

        return await Forward(Join(Cfg.SeerrUrl, "/api/v1/" + path), headers, ct).ConfigureAwait(false);
    }

    private async Task<string?> ResolveSeerrUser(CancellationToken ct)
    {
        var jf = JellyfinUserId?.Replace("-", string.Empty, StringComparison.Ordinal).ToLowerInvariant();
        if (jf is null)
        {
            return null;
        }

        await SeerrUserLock.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            if (SeerrUserCache.TryGetValue(jf, out var cached))
            {
                return cached;
            }

            using var req = new HttpRequestMessage(HttpMethod.Get, Join(Cfg.SeerrUrl, "/api/v1/user?take=500"));
            req.Headers.TryAddWithoutValidation("X-Api-Key", Cfg.SeerrApiKey);
            using var resp = await Client().SendAsync(req, ct).ConfigureAwait(false);
            if (!resp.IsSuccessStatusCode)
            {
                return null;
            }

            var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false));
            foreach (var u in node?["results"]?.AsArray() ?? new JsonArray())
            {
                var j = u?["jellyfinUserId"]?.GetValue<string>()?.Replace("-", string.Empty, StringComparison.Ordinal).ToLowerInvariant();
                var id = u?["id"]?.ToString();
                if (j is not null && id is not null)
                {
                    SeerrUserCache[j] = id;
                }
            }

            return SeerrUserCache.GetValueOrDefault(jf);
        }
        catch
        {
            return null;
        }
        finally
        {
            SeerrUserLock.Release();
        }
    }

    // ---------------------------------------------------------------- Radarr / Sonarr

    [HttpGet("arr/queue")]
    [Authorize]
    public async Task<IActionResult> Queue(CancellationToken ct)
    {
        if (!Cfg.ShareQueue && !IsAdmin)
        {
            return Forbid();
        }

        var result = new JsonArray();
        var tasks = new List<Task>();
        if (!string.IsNullOrWhiteSpace(Cfg.RadarrUrl))
        {
            tasks.Add(CollectQueue(result, "radarr", Cfg.RadarrUrl, Cfg.RadarrApiKey, "/api/v3/queue?page=1&pageSize=200&includeMovie=true", ct));
        }

        if (!string.IsNullOrWhiteSpace(Cfg.SonarrUrl))
        {
            tasks.Add(CollectQueue(result, "sonarr", Cfg.SonarrUrl, Cfg.SonarrApiKey, "/api/v3/queue?page=1&pageSize=200&includeSeries=true&includeEpisode=true", ct));
        }

        await Task.WhenAll(tasks).ConfigureAwait(false);
        return Content(result.ToJsonString(), "application/json");
    }

    private async Task CollectQueue(JsonArray into, string source, string url, string key, string path, CancellationToken ct)
    {
        try
        {
            var node = await GetJson(url, path, key, ct).ConfigureAwait(false);
            foreach (var r in node?["records"]?.AsArray() ?? new JsonArray())
            {
                if (r is null)
                {
                    continue;
                }

                var size = r["size"]?.GetValue<double>() ?? 0;
                var left = r["sizeleft"]?.GetValue<double>() ?? 0;
                var item = new JsonObject
                {
                    ["source"] = source,
                    ["title"] = r["movie"]?["title"]?.ToString() ?? r["series"]?["title"]?.ToString() ?? r["title"]?.ToString(),
                    ["subtitle"] = r["episode"] is null ? null : $"S{r["episode"]?["seasonNumber"]}E{r["episode"]?["episodeNumber"]} {r["episode"]?["title"]}",
                    ["tmdbId"] = r["movie"]?["tmdbId"]?.DeepClone(),
                    ["tvdbId"] = r["series"]?["tvdbId"]?.DeepClone(),
                    ["tmdbSeriesId"] = r["series"]?["tmdbId"]?.DeepClone(),
                    ["status"] = r["status"]?.ToString(),
                    ["trackedDownloadState"] = r["trackedDownloadState"]?.ToString(),
                    ["size"] = size,
                    ["sizeleft"] = left,
                    ["progress"] = size > 0 ? Math.Round((1 - (left / size)) * 100, 1) : 0,
                    ["timeleft"] = r["timeleft"]?.ToString(),
                    ["protocol"] = r["protocol"]?.ToString(),
                    ["client"] = r["downloadClient"]?.ToString()
                };
                lock (into)
                {
                    into.Add(item);
                }
            }
        }
        catch
        {
            // a down arr instance must not break the others
        }
    }

    [HttpGet("arr/calendar")]
    [Authorize]
    public async Task<IActionResult> Calendar([FromQuery] string start, [FromQuery] string end, CancellationToken ct)
    {
        if (!Cfg.ShareQueue && !IsAdmin)
        {
            return Forbid();
        }

        var result = new JsonArray();
        var q = $"start={Uri.EscapeDataString(start)}&end={Uri.EscapeDataString(end)}&unmonitored=true";
        async Task Collect(string source, string url, string key, string path)
        {
            try
            {
                var node = await GetJson(url, path + (path.Contains('?', StringComparison.Ordinal) ? "&" : "?") + q, key, ct).ConfigureAwait(false);
                foreach (var r in node?.AsArray() ?? new JsonArray())
                {
                    if (r is null)
                    {
                        continue;
                    }

                    var isMovie = source == "radarr";
                    var images = (isMovie ? r["images"] : r["series"]?["images"])?.AsArray();
                    var poster = images?.FirstOrDefault(i => i?["coverType"]?.ToString() == "poster")?["remoteUrl"]?.ToString();
                    var date = isMovie
                        ? (r["digitalRelease"] ?? r["physicalRelease"] ?? r["inCinemas"])?.ToString()
                        : r["airDateUtc"]?.ToString();
                    var kind = isMovie
                        ? (r["digitalRelease"] is not null ? "digital" : r["physicalRelease"] is not null ? "physical" : "cinema")
                        : "episode";
                    var item = new JsonObject
                    {
                        ["source"] = source,
                        ["kind"] = kind,
                        ["date"] = date,
                        ["title"] = isMovie ? r["title"]?.ToString() : r["series"]?["title"]?.ToString(),
                        ["subtitle"] = isMovie ? null : $"S{r["seasonNumber"]}E{r["episodeNumber"]} {r["title"]}",
                        ["year"] = isMovie ? r["year"]?.DeepClone() : r["series"]?["year"]?.DeepClone(),
                        ["tmdbId"] = isMovie ? r["tmdbId"]?.DeepClone() : r["series"]?["tmdbId"]?.DeepClone(),
                        ["tvdbId"] = isMovie ? null : r["series"]?["tvdbId"]?.DeepClone(),
                        ["hasFile"] = r["hasFile"]?.DeepClone(),
                        ["monitored"] = r["monitored"]?.DeepClone(),
                        ["poster"] = poster
                    };
                    lock (result)
                    {
                        result.Add(item);
                    }
                }
            }
            catch
            {
                // ignore a single failing instance
            }
        }

        var tasks = new List<Task>();
        if (!string.IsNullOrWhiteSpace(Cfg.RadarrUrl))
        {
            tasks.Add(Collect("radarr", Cfg.RadarrUrl, Cfg.RadarrApiKey, "/api/v3/calendar"));
        }

        if (!string.IsNullOrWhiteSpace(Cfg.SonarrUrl))
        {
            tasks.Add(Collect("sonarr", Cfg.SonarrUrl, Cfg.SonarrApiKey, "/api/v3/calendar?includeSeries=true"));
        }

        await Task.WhenAll(tasks).ConfigureAwait(false);
        return Content(result.ToJsonString(), "application/json");
    }

    // ---------------------------------------------------------------- Aurral

    private static readonly string[] AurralReadPrefixes =
    {
        "api/search", "api/discover", "api/library/artists", "api/library/albums", "api/library/tracks", "api/library/recent",
        "api/library/downloads", "api/library/canonical", "api/requests", "api/artists", "api/health/bootstrap", "api/deezer"
    };

    private static readonly string[] AurralWritePrefixes =
    {
        "api/library/albums/request", "api/library/artists", "api/library/albums", "api/library/downloads/album",
        "api/discover/feedback", "api/discover/refresh"
    };

    [AcceptVerbs("GET", "POST", "PUT", "DELETE")]
    [Route("aurral/{**path}")]
    [Authorize]
    public async Task<IActionResult> Aurral(string path, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(Cfg.AurralUrl))
        {
            return StatusCode(503, new { error = "Aurral is not configured" });
        }

        var p = path.Trim('/');
        var write = Request.Method != "GET";
        var allowed = (write ? AurralWritePrefixes : AurralReadPrefixes).Any(x => p.StartsWith(x, StringComparison.OrdinalIgnoreCase));
        if (!allowed && !IsAdmin)
        {
            return StatusCode(403, new { error = "This Aurral endpoint is not available through Cinema" });
        }

        var headers = new Dictionary<string, string> { ["X-Api-Key"] = Cfg.AurralApiKey };
        return await Forward(Join(Cfg.AurralUrl, "/" + p), headers, ct).ConfigureAwait(false);
    }

    // ---------------------------------------------------------------- song search (public catalogue, popularity ranked)

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (DateTime At, string Json)> SongCache = new();

    /// <summary>Song lookup for requests. Only the typed search words leave the server (to Apple's public search API); results come back ranked by popularity.</summary>
    [HttpGet("music/search")]
    [Authorize]
    public async Task<IActionResult> MusicSearch([FromQuery] string q, CancellationToken ct)
    {
        q = (q ?? string.Empty).Trim();
        if (q.Length < 2 || q.Length > 120 || !Cfg.ExternalSongSearch)
        {
            return Content("[]", "application/json");
        }

        var key = q.ToLowerInvariant();
        if (SongCache.TryGetValue(key, out var hit) && DateTime.UtcNow - hit.At < TimeSpan.FromMinutes(15))
        {
            return Content(hit.Json, "application/json");
        }

        try
        {
            var url = "https://itunes.apple.com/search?media=music&entity=song&limit=50&term=" + Uri.EscapeDataString(q);
            using var req = new HttpRequestMessage(HttpMethod.Get, url);
            using var resp = await Client().SendAsync(req, ct).ConfigureAwait(false);
            if (!resp.IsSuccessStatusCode)
            {
                return StatusCode(502, new { error = "Song catalogue " + (int)resp.StatusCode });
            }

            var node = JsonNode.Parse(await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false));
            var list = new JsonArray();
            foreach (var r in node?["results"]?.AsArray() ?? new JsonArray())
            {
                if (r is null || r["kind"]?.ToString() != "song")
                {
                    continue;
                }

                list.Add(new JsonObject
                {
                    ["title"] = r["trackName"]?.ToString(),
                    ["artist"] = r["artistName"]?.ToString(),
                    ["album"] = r["collectionName"]?.ToString(),
                    ["length"] = r["trackTimeMillis"]?.DeepClone(),
                    ["preview"] = r["previewUrl"]?.ToString(),
                    ["image"] = r["artworkUrl100"]?.ToString()?.Replace("100x100", "300x300", StringComparison.Ordinal),
                    ["id"] = r["trackId"]?.ToString()
                });
            }

            var json = list.ToJsonString();
            SongCache[key] = (DateTime.UtcNow, json);
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }

    // ---------------------------------------------------------------- helpers

    private HttpClient Client()
    {
        var c = _http.CreateClient("Cinema");
        c.Timeout = TimeSpan.FromSeconds(30);
        return c;
    }

    private static string Join(string baseUrl, string path) => baseUrl.TrimEnd('/') + (path.StartsWith('/') ? path : "/" + path);

    private async Task<JsonNode?> GetJson(string baseUrl, string path, string key, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, Join(baseUrl, path));
        req.Headers.TryAddWithoutValidation("X-Api-Key", key);
        using var resp = await Client().SendAsync(req, ct).ConfigureAwait(false);
        resp.EnsureSuccessStatusCode();
        return JsonNode.Parse(await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false));
    }

    private async Task<IActionResult> Forward(string target, Dictionary<string, string> headers, CancellationToken ct)
    {
        try
        {
            using var req = new HttpRequestMessage(new HttpMethod(Request.Method), target + Request.QueryString);
            foreach (var h in headers)
            {
                req.Headers.TryAddWithoutValidation(h.Key, h.Value);
            }

            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (Request.Method is "POST" or "PUT" or "PATCH")
            {
                using var ms = new MemoryStream();
                await Request.Body.CopyToAsync(ms, ct).ConfigureAwait(false);
                var content = new ByteArrayContent(ms.ToArray());
                content.Headers.ContentType = MediaTypeHeaderValue.TryParse(Request.ContentType, out var ctype) ? ctype : new MediaTypeHeaderValue("application/json");
                req.Content = content;
            }

            using var resp = await Client().SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct).ConfigureAwait(false);
            var bytes = await resp.Content.ReadAsByteArrayAsync(ct).ConfigureAwait(false);
            var type = resp.Content.Headers.ContentType?.ToString() ?? "application/json";
            Response.StatusCode = (int)resp.StatusCode;
            return new FileContentResult(bytes, type);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }
}
