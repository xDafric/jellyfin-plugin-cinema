using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Jellyfin.Data.Enums;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.Audio;
using MediaBrowser.Controller.Library;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>
/// Cinema Jam: a user shares a link, guests (no account) open it, search the user's music and put songs in the queue, like Spotify Jam.
/// Guests can do exactly three things: search music, add a song, read the queue. They never get access to Jellyfin itself, files or other users.
/// Everything is in memory; a jam ends on its own after its time, when the host ends it, or when the server restarts.
/// </summary>
[ApiController]
[Route("Cinema/jam")]
public class JamController : ControllerBase
{
    private sealed class Guest
    {
        public string Id = string.Empty;
        public string Name = string.Empty;
        public DateTime Joined = DateTime.UtcNow;
        public DateTime LastAdd = DateTime.MinValue;
        public DateTime LastSearch = DateTime.MinValue;
        public bool Kicked;
    }

    private sealed class Req
    {
        public string Id = string.Empty;
        public string Track = string.Empty;
        public string Name = string.Empty;
        public string Artist = string.Empty;
        public string GuestId = string.Empty;
        public string GuestName = string.Empty;
        public string Status = "pending";   // pending, queued, rejected
        public bool Delivered;
        public DateTime At = DateTime.UtcNow;
    }

    private sealed class Jam
    {
        public string Code = string.Empty;
        public string Host = string.Empty;
        public string? HostDevice;
        public string Title = "Jam";
        public DateTime Expires;
        public int MaxGuests = 20;
        public bool Approve;
        public readonly ConcurrentDictionary<string, Guest> Guests = new();
        public readonly List<Req> Reqs = new();
        public readonly object Lock = new();
    }

    private static readonly ConcurrentDictionary<string, Jam> ByCode = new();
    private static readonly ConcurrentDictionary<string, string> ByHost = new();
    private static readonly ConcurrentDictionary<string, (int N, DateTime Start)> Rate = new();
    private static ILibraryManager? _lib;
    private static IUserManager? _users;

    public JamController(ILibraryManager lib, IUserManager users)
    {
        _lib = lib;
        _users = users;
    }

    private string? Uid => User.FindFirst("Jellyfin-UserId")?.Value?.Replace("-", string.Empty, StringComparison.Ordinal).ToLowerInvariant();

    private static string Token(int bytes) => Convert.ToBase64String(RandomNumberGenerator.GetBytes(bytes)).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static string Clean(string? s, int max)
    {
        var sb = new StringBuilder();
        foreach (var c in (s ?? string.Empty).Trim())
        {
            if (!char.IsControl(c) && c != '<' && c != '>' && c != '"' && c != '\'' && c != '&')
            {
                sb.Append(c);
            }
        }

        return sb.Length > max ? sb.ToString(0, max) : sb.ToString();
    }

    /// <summary>At most <paramref name="n"/> calls per <paramref name="secs"/> seconds for one key.</summary>
    private static bool Allow(string key, int n, int secs)
    {
        var now = DateTime.UtcNow;
        var cur = Rate.AddOrUpdate(key, _ => (1, now), (_, v) => now - v.Start > TimeSpan.FromSeconds(secs) ? (1, now) : (v.N + 1, v.Start));
        if (Rate.Count > 5000)
        {
            foreach (var k in Rate.Where(kv => now - kv.Value.Start > TimeSpan.FromMinutes(5)).Select(kv => kv.Key).ToList())
            {
                Rate.TryRemove(k, out _);
            }
        }

        return cur.N <= n;
    }

    private string Ip => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "?";

    private static void Sweep()
    {
        var now = DateTime.UtcNow;
        foreach (var j in ByCode.Values.Where(x => x.Expires < now).ToList())
        {
            End(j);
        }
    }

    private static void End(Jam j)
    {
        ByCode.TryRemove(j.Code, out _);
        ByHost.TryRemove(j.Host, out _);
        ConnectController.BumpUser(j.Host);
    }

    private Jam? MyJam()
    {
        Sweep();
        var u = Uid;
        return u is not null && ByHost.TryGetValue(u, out var code) && ByCode.TryGetValue(code, out var j) ? j : null;
    }

    private static JsonObject HostView(Jam j)
    {
        lock (j.Lock)
        {
            return new JsonObject
            {
                ["code"] = j.Code,
                ["title"] = j.Title,
                ["expires"] = new DateTimeOffset(j.Expires, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                ["maxGuests"] = j.MaxGuests,
                ["approve"] = j.Approve,
                ["guests"] = new JsonArray(j.Guests.Values.Where(g => !g.Kicked).OrderBy(g => g.Joined).Select(g => (JsonNode)new JsonObject { ["id"] = g.Id, ["name"] = g.Name }).ToArray()),
                ["requests"] = new JsonArray(j.Reqs.OrderByDescending(r => r.At).Take(40).Select(r => (JsonNode)new JsonObject { ["id"] = r.Id, ["name"] = r.Name, ["artist"] = r.Artist, ["by"] = r.GuestName, ["status"] = r.Status }).ToArray()),
            };
        }
    }

    // ------------------------------------------------------------------ host (signed in)

    /// <summary>Starts a jam (or returns the running one).</summary>
    [HttpPost("start")]
    [Authorize]
    public IActionResult Start([FromQuery] string? device, [FromQuery] int minutes = 240, [FromQuery] int guests = 20, [FromQuery] bool approve = false, [FromQuery] string? title = null)
    {
        var u = Uid;
        if (u is null || CastLinks.Config?.FeatConnect != true)
        {
            return BadRequest();
        }

        var j = MyJam();
        if (j is null)
        {
            if (ByCode.Count >= 50)
            {
                return StatusCode(429);
            }

            j = new Jam { Code = Token(16), Host = u, HostDevice = device is { Length: <= 64 } ? device : null, Title = Clean(title, 40) is { Length: > 0 } t ? t : "Jam", Expires = DateTime.UtcNow.AddMinutes(Math.Clamp(minutes, 10, 720)), MaxGuests = Math.Clamp(guests, 1, 50), Approve = approve };
            ByCode[j.Code] = j;
            ByHost[u] = j.Code;
        }
        else if (device is { Length: <= 64 })
        {
            j.HostDevice = device;
        }

        return Content(HostView(j).ToJsonString(), "application/json");
    }

    [HttpGet("mine")]
    [Authorize]
    public IActionResult Mine()
    {
        var j = MyJam();
        _ = j is not null ? Flush(j.Host) : Task.CompletedTask;
        return Content(j is null ? "{}" : HostView(j).ToJsonString(), "application/json");
    }

    [HttpPost("settings")]
    [Authorize]
    public IActionResult Settings([FromQuery] bool? approve, [FromQuery] int? guests, [FromQuery] int? extend)
    {
        var j = MyJam();
        if (j is null)
        {
            return NotFound();
        }

        if (approve is not null)
        {
            j.Approve = approve.Value;
        }

        if (guests is not null)
        {
            j.MaxGuests = Math.Clamp(guests.Value, 1, 50);
        }

        if (extend is not null)
        {
            j.Expires = DateTime.UtcNow.AddMinutes(Math.Clamp(extend.Value, 10, 720));
        }

        return Content(HostView(j).ToJsonString(), "application/json");
    }

    [HttpPost("stop")]
    [Authorize]
    public IActionResult Stop()
    {
        var j = MyJam();
        if (j is not null)
        {
            End(j);
        }

        return NoContent();
    }

    [HttpPost("kick")]
    [Authorize]
    public IActionResult Kick([FromQuery] string id)
    {
        var j = MyJam();
        var g = j?.Guests.Values.FirstOrDefault(x => x.Id == id);
        if (g is null)
        {
            return NotFound();
        }

        g.Kicked = true;
        return NoContent();
    }

    [HttpPost("decide")]
    [Authorize]
    public async Task<IActionResult> Decide([FromQuery] string id, [FromQuery] bool ok)
    {
        var j = MyJam();
        Req? r;
        if (j is null)
        {
            return NotFound();
        }

        lock (j.Lock)
        {
            r = j.Reqs.FirstOrDefault(x => x.Id == id && x.Status == "pending");
            if (r is null)
            {
                return NotFound();
            }

            r.Status = ok ? "queued" : "rejected";
        }

        if (ok)
        {
            await Flush(j.Host).ConfigureAwait(false);
        }

        return NoContent();
    }

    /// <summary>Sends accepted songs that are not on a device yet to the host's playing device.</summary>
    internal static async Task Flush(string host)
    {
        if (!ByHost.TryGetValue(host, out var code) || !ByCode.TryGetValue(code, out var j))
        {
            return;
        }

        var ids = new JsonArray();
        List<Req> take;
        lock (j.Lock)
        {
            take = j.Reqs.Where(r => r.Status == "queued" && !r.Delivered).ToList();
            foreach (var r in take)
            {
                r.Delivered = true;
                ids.Add(r.Track);
            }
        }

        if (take.Count > 0 && !await ConnectController.PushQueue(host, j.HostDevice, ids).ConfigureAwait(false))
        {
            lock (j.Lock)
            {
                foreach (var r in take)
                {
                    r.Delivered = false;   // no device is playing yet: try again with the next sign of life
                }
            }
        }
    }

    // ------------------------------------------------------------------ guests (no account, the code is the key)

    private Jam? Open(string code)
    {
        Sweep();
        return code.Length is >= 16 and <= 40 && ByCode.TryGetValue(code, out var j) ? j : null;
    }

    private Guest? Who(Jam j)
    {
        var s = Request.Headers["X-Jam-Guest"].ToString();
        return s.Length is >= 16 and <= 64 && j.Guests.TryGetValue(s, out var g) && !g.Kicked ? g : null;
    }

    private IActionResult Secure(IActionResult r)
    {
        Response.Headers["Cache-Control"] = "no-store";
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers["Referrer-Policy"] = "no-referrer";
        return r;
    }

    [HttpPost("{code}/join")]
    [AllowAnonymous]
    public IActionResult Join(string code, [FromQuery] string? name)
    {
        if (!Allow("join|" + Ip, 12, 60))
        {
            return StatusCode(429);
        }

        var j = Open(code);
        if (j is null)
        {
            return Secure(NotFound());
        }

        if (j.Guests.Values.Count(g => !g.Kicked) >= j.MaxGuests)
        {
            return Secure(StatusCode(423));
        }

        var secret = Token(16);
        var nm = Clean(name, 24);
        j.Guests[secret] = new Guest { Id = Token(5), Name = nm.Length > 0 ? nm : "Guest" };
        return Secure(Content(new JsonObject { ["guest"] = secret, ["name"] = j.Guests[secret].Name, ["title"] = j.Title }.ToJsonString(), "application/json"));
    }

    [HttpGet("{code}/state")]
    [AllowAnonymous]
    public IActionResult State(string code)
    {
        if (!Allow("st|" + Ip, 90, 60))
        {
            return StatusCode(429);
        }

        var j = Open(code);
        var g = j is null ? null : Who(j);
        if (j is null)
        {
            return Secure(NotFound());
        }

        if (g is null)
        {
            return Secure(StatusCode(401));
        }

        var now = ConnectController.NowOf(j.Host);
        JsonArray q;
        lock (j.Lock)
        {
            q = new JsonArray(j.Reqs.Where(r => r.Status != "rejected" || r.GuestId == g.Id).OrderByDescending(r => r.At).Take(30).Select(r => (JsonNode)new JsonObject { ["name"] = r.Name, ["artist"] = r.Artist, ["by"] = r.GuestName, ["status"] = r.Status, ["mine"] = r.GuestId == g.Id }).ToArray());
        }

        return Secure(Content(new JsonObject { ["title"] = j.Title, ["now"] = now, ["queue"] = q, ["approve"] = j.Approve, ["guests"] = j.Guests.Values.Count(x => !x.Kicked) }.ToJsonString(), "application/json"));
    }

    [HttpGet("{code}/search")]
    [AllowAnonymous]
    public IActionResult Search(string code, [FromQuery] string q)
    {
        if (!Allow("se|" + Ip, 60, 60))
        {
            return StatusCode(429);
        }

        var j = Open(code);
        var g = j is null ? null : Who(j);
        q = (q ?? string.Empty).Trim();
        if (j is null)
        {
            return Secure(NotFound());
        }

        if (g is null)
        {
            return Secure(StatusCode(401));
        }

        if (q.Length < 2 || q.Length > 60 || DateTime.UtcNow - g.LastSearch < TimeSpan.FromMilliseconds(600) || _lib is null || _users is null)
        {
            return Secure(Content("[]", "application/json"));
        }

        g.LastSearch = DateTime.UtcNow;
        var user = Guid.TryParse(j.Host, out var hostGuid) ? _users.GetUserById(hostGuid) : null;
        if (user is null)
        {
            return Secure(Content("[]", "application/json"));
        }

        var res = _lib.GetItemList(new InternalItemsQuery(user) { SearchTerm = q, IncludeItemTypes = new[] { BaseItemKind.Audio }, Limit = 20, Recursive = true, IsVirtualItem = false });
        var arr = new JsonArray();
        foreach (var it in res.OfType<Audio>().Take(20))
        {
            arr.Add(new JsonObject { ["id"] = it.Id.ToString("N"), ["name"] = it.Name, ["artist"] = string.Join(", ", it.Artists ?? Array.Empty<string>()), ["album"] = it.Album ?? string.Empty });
        }

        return Secure(Content(arr.ToJsonString(), "application/json"));
    }

    [HttpPost("{code}/add")]
    [AllowAnonymous]
    public async Task<IActionResult> Add(string code, [FromQuery] string id)
    {
        if (!Allow("ad|" + Ip, 30, 60))
        {
            return StatusCode(429);
        }

        var j = Open(code);
        var g = j is null ? null : Who(j);
        if (j is null)
        {
            return Secure(NotFound());
        }

        if (g is null)
        {
            return Secure(StatusCode(401));
        }

        if (DateTime.UtcNow - g.LastAdd < TimeSpan.FromSeconds(4))
        {
            return Secure(StatusCode(429));
        }

        if (_lib is null || _users is null || !Guid.TryParse(id, out var gid) || _lib.GetItemById(gid) is not Audio a || !Guid.TryParse(j.Host, out var hg) || _users.GetUserById(hg) is not { } host || !a.IsVisible(host))
        {
            return Secure(BadRequest());
        }

        Req r;
        lock (j.Lock)
        {
            var mine = j.Reqs.Count(x => x.GuestId == g.Id && x.Status == "pending");
            var recent = j.Reqs.Any(x => x.Track == gid.ToString("N") && x.Status != "rejected" && DateTime.UtcNow - x.At < TimeSpan.FromMinutes(20));
            if (mine >= 5 || j.Reqs.Count >= 300 || recent)
            {
                return Secure(StatusCode(409));
            }

            r = new Req { Id = Token(6), Track = gid.ToString("N"), Name = Clean(a.Name, 120), Artist = Clean(string.Join(", ", a.Artists ?? Array.Empty<string>()), 120), GuestId = g.Id, GuestName = g.Name, Status = j.Approve ? "pending" : "queued" };
            j.Reqs.Add(r);
            g.LastAdd = DateTime.UtcNow;
        }

        ConnectController.BumpUser(j.Host);
        if (!j.Approve)
        {
            await Flush(j.Host).ConfigureAwait(false);
        }

        return Secure(Content(new JsonObject { ["status"] = r.Status }.ToJsonString(), "application/json"));
    }

    /// <summary>The page guests open from the link.</summary>
    [HttpGet("{code}")]
    [AllowAnonymous]
    public IActionResult Page(string code)
    {
        if (!Allow("pg|" + Ip, 60, 60))
        {
            return StatusCode(429);
        }

        var nonce = Token(12);
        Response.Headers["Content-Security-Policy"] = $"default-src 'none'; script-src 'nonce-{nonce}'; style-src 'nonce-{nonce}'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
        Response.Headers["X-Frame-Options"] = "DENY";
        var open = Open(code) is not null;
        return Secure(Content(JamPage.Html(nonce, open), "text/html; charset=utf-8"));
    }
}
