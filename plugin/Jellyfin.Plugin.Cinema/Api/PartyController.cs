using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.TV;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.MediaEncoding;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>
/// Cinema Watch Party: a user shares a link, friends (no account) open it and watch the same film or episode in sync.
/// Guests can do exactly four things: read the party state, watch the one film of this party, chat and send reactions, and (if the host allows it) pause, play and seek.
/// They never get access to Jellyfin itself, other files or other users. Everything is in memory; a party ends on its own, when the host ends it or when the server restarts.
/// </summary>
[ApiController]
[Route("Cinema/party")]
public class PartyController : ControllerBase
{
    private sealed class Member
    {
        public string Id = string.Empty;
        public string Name = string.Empty;
        public bool IsHost;
        public bool Kicked;
        public DateTime Seen = DateTime.UtcNow;
        public DateTime LastSay = DateTime.MinValue;
        public DateTime LastReact = DateTime.MinValue;
    }

    private sealed class Msg
    {
        public long N;
        public string Kind = "chat";   // chat, react, join, leave
        public string Who = string.Empty;
        public string Text = string.Empty;
    }

    private sealed class Party
    {
        public string Code = string.Empty;
        public string Host = string.Empty;
        public string HostSecret = string.Empty;
        public string ItemId = string.Empty;
        public DateTime Expires;
        public int MaxGuests = 12;
        public bool Control;
        public bool Playing;
        public double Pos;
        public DateTime Stamp = DateTime.UtcNow;
        public long Rev = 1;
        public long MsgN;
        public string By = string.Empty;
        public readonly ConcurrentDictionary<string, Member> Members = new();
        public readonly List<Msg> Msgs = new();
        public readonly object Lock = new();
        public TaskCompletionSource<bool> Changed = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public double NowPos() => Playing ? Pos + (DateTime.UtcNow - Stamp).TotalSeconds : Pos;

        public void Bump()
        {
            TaskCompletionSource<bool> old;
            lock (Lock)
            {
                Rev++;
                old = Changed;
                Changed = new(TaskCreationOptions.RunContinuationsAsynchronously);
            }

            old.TrySetResult(true);
        }
    }

    private static readonly string[] Emojis = { "❤️", "😂", "😮", "👏", "🔥", "😢", "👍", "🍿" };
    private static readonly ConcurrentDictionary<string, Party> ByCode = new();
    private static readonly ConcurrentDictionary<string, string> ByHost = new();
    private static readonly ConcurrentDictionary<string, (int N, DateTime Start)> Rate = new();
    private static ILibraryManager? _lib;
    private static IUserManager? _users;
    private readonly IServiceProvider _sp;

    public PartyController(ILibraryManager lib, IUserManager users, IServiceProvider sp)
    {
        _lib = lib;
        _users = users;
        _sp = sp;
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
        foreach (var p in ByCode.Values.Where(x => x.Expires < now).ToList())
        {
            End(p);
        }
    }

    private static void End(Party p)
    {
        ByCode.TryRemove(p.Code, out _);
        ByHost.TryRemove(p.Host, out _);
        p.Rev += 1000;   // wakes everyone, who then find the party gone
        p.Bump();
    }

    private Party? MyParty()
    {
        Sweep();
        var u = Uid;
        return u is not null && ByHost.TryGetValue(u, out var code) && ByCode.TryGetValue(code, out var p) ? p : null;
    }

    private IActionResult Secure(IActionResult r)
    {
        Response.Headers["Cache-Control"] = "no-store";
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers["Referrer-Policy"] = "no-referrer";
        return r;
    }

    private static Video? VideoOf(string id) => _lib is not null && Guid.TryParse(id, out var g) ? _lib.GetItemById(g) as Video : null;

    private static bool Visible(Party p, Video v) => _users is not null && Guid.TryParse(p.Host, out var hg) && _users.GetUserById(hg) is { } host && v.IsVisible(host);

    private static JsonObject ItemJson(Party p)
    {
        var v = VideoOf(p.ItemId);
        var o = new JsonObject { ["id"] = p.ItemId };
        if (v is not null)
        {
            o["name"] = Clean(v.Name, 160);
            o["series"] = Clean((v as Episode)?.SeriesName, 160);
            o["year"] = v.ProductionYear ?? 0;
            o["secs"] = (v.RunTimeTicks ?? 0) / 10_000_000L;
        }

        return o;
    }

    private static string HostName(Party p) => Guid.TryParse(p.Host, out var g) && _users?.GetUserById(g) is { } u ? Clean(u.Username, 30) : string.Empty;

    private static JsonObject HostView(Party p) => new()
    {
        ["code"] = p.Code,
        ["secret"] = p.HostSecret,
        ["item"] = ItemJson(p),
        ["expires"] = new DateTimeOffset(p.Expires, TimeSpan.Zero).ToUnixTimeMilliseconds(),
        ["control"] = p.Control,
        ["maxGuests"] = p.MaxGuests,
        ["members"] = Members(p),
    };

    private static JsonArray Members(Party p)
    {
        var cut = DateTime.UtcNow.AddSeconds(-50);
        return new JsonArray(p.Members.Values.Where(m => !m.Kicked && m.Seen > cut).OrderByDescending(m => m.IsHost).ThenBy(m => m.Name).Select(m => (JsonNode)new JsonObject { ["id"] = m.Id, ["name"] = m.Name, ["host"] = m.IsHost }).ToArray());
    }

    // ------------------------------------------------------------------ host (signed in)

    /// <summary>Starts a party for a film or episode (or points the running one at it).</summary>
    [HttpPost("start")]
    [Authorize]
    public IActionResult Start([FromQuery] string item, [FromQuery] double pos = 0, [FromQuery] bool control = false, [FromQuery] int minutes = 360)
    {
        var u = Uid;
        if (u is null || CastLinks.Config?.FeatWatchParty != true || VideoOf(item) is not { } v || _users is null || !Guid.TryParse(u, out var ug) || _users.GetUserById(ug) is not { } user || !v.IsVisible(user))
        {
            return BadRequest();
        }

        var p = MyParty();
        if (p is null)
        {
            if (ByCode.Count >= 30)
            {
                return StatusCode(429);
            }

            p = new Party { Code = Token(16), Host = u, HostSecret = Token(16), Expires = DateTime.UtcNow.AddMinutes(Math.Clamp(minutes, 30, 720)), Control = control };
            p.Members[p.HostSecret] = new Member { Id = Token(5), Name = Clean(user.Username, 24), IsHost = true };
            ByCode[p.Code] = p;
            ByHost[u] = p.Code;
        }

        p.ItemId = v.Id.ToString("N");
        p.Playing = false;
        p.Pos = Math.Clamp(pos, 0, 86400);
        p.Stamp = DateTime.UtcNow;
        p.By = string.Empty;
        p.Bump();
        return Content(HostView(p).ToJsonString(), "application/json");
    }

    [HttpGet("mine")]
    [Authorize]
    public IActionResult Mine()
    {
        var p = MyParty();
        return Content(p is null ? "{}" : HostView(p).ToJsonString(), "application/json");
    }

    [HttpPost("settings")]
    [Authorize]
    public IActionResult Settings([FromQuery] bool? control, [FromQuery] int? guests, [FromQuery] int? extend)
    {
        var p = MyParty();
        if (p is null)
        {
            return NotFound();
        }

        if (control is not null)
        {
            p.Control = control.Value;
        }

        if (guests is not null)
        {
            p.MaxGuests = Math.Clamp(guests.Value, 1, 30);
        }

        if (extend is not null)
        {
            p.Expires = DateTime.UtcNow.AddMinutes(Math.Clamp(extend.Value, 30, 720));
        }

        p.Bump();
        return Content(HostView(p).ToJsonString(), "application/json");
    }

    [HttpPost("stop")]
    [Authorize]
    public IActionResult Stop()
    {
        if (MyParty() is { } p)
        {
            End(p);
        }

        return NoContent();
    }

    [HttpPost("kick")]
    [Authorize]
    public IActionResult Kick([FromQuery] string id)
    {
        var m = MyParty()?.Members.Values.FirstOrDefault(x => x.Id == id && !x.IsHost);
        if (m is null)
        {
            return NotFound();
        }

        m.Kicked = true;
        MyParty()?.Bump();
        return NoContent();
    }

    // ------------------------------------------------------------------ guests and host client (the secret is the key)

    private Party? Open(string code)
    {
        Sweep();
        return code.Length is >= 16 and <= 40 && ByCode.TryGetValue(code, out var p) ? p : null;
    }

    private Member? Who(Party p)
    {
        var s = Request.Headers["X-Party-Guest"].ToString();
        if (s.Length == 0)
        {
            s = Request.Query["g"].ToString();
        }

        return s.Length is >= 16 and <= 64 && p.Members.TryGetValue(s, out var m) && !m.Kicked ? m : null;
    }

    private static void Say(Party p, string kind, string who, string text)
    {
        lock (p.Lock)
        {
            p.Msgs.Add(new Msg { N = ++p.MsgN, Kind = kind, Who = who, Text = text });
            if (p.Msgs.Count > 120)
            {
                p.Msgs.RemoveRange(0, p.Msgs.Count - 100);
            }
        }
    }

    [HttpPost("{code}/join")]
    [AllowAnonymous]
    public IActionResult Join(string code, [FromQuery] string? name)
    {
        if (!Allow("pj|" + Ip, 12, 60))
        {
            return StatusCode(429);
        }

        var p = Open(code);
        if (p is null)
        {
            return Secure(NotFound());
        }

        if (p.Members.Values.Count(g => !g.Kicked && !g.IsHost) >= p.MaxGuests)
        {
            return Secure(StatusCode(423));
        }

        var secret = Token(16);
        var nm = Clean(name, 24);
        var m = new Member { Id = Token(5), Name = nm.Length > 0 ? nm : "Guest" };
        p.Members[secret] = m;
        Say(p, "join", m.Name, string.Empty);
        p.Bump();
        return Secure(Content(new JsonObject { ["guest"] = secret, ["name"] = m.Name, ["host"] = HostName(p) }.ToJsonString(), "application/json"));
    }

    /// <summary>Waits (up to ~20 s) for a change, then answers with the whole state. Call again right away with the new rev.</summary>
    [HttpGet("{code}/sync")]
    [AllowAnonymous]
    public async Task<IActionResult> Sync(string code, [FromQuery] long rev, [FromQuery] long ev, CancellationToken ct)
    {
        if (!Allow("ps|" + Ip, 240, 60))
        {
            return StatusCode(429);
        }

        var p = Open(code);
        if (p is null)
        {
            return Secure(NotFound());
        }

        var me = Who(p);
        if (me is null)
        {
            return Secure(StatusCode(401));
        }

        var until = DateTime.UtcNow.AddSeconds(20);
        while (!ct.IsCancellationRequested)
        {
            me.Seen = DateTime.UtcNow;
            long r;
            Task changed;
            lock (p.Lock)
            {
                r = p.Rev;
                changed = p.Changed.Task;
            }

            var left = until - DateTime.UtcNow;
            if (r != rev || left <= TimeSpan.Zero || !ByCode.ContainsKey(p.Code))
            {
                break;
            }

            await Task.WhenAny(changed, Task.Delay(left, ct)).ConfigureAwait(false);
        }

        if (!ByCode.ContainsKey(p.Code))
        {
            return Secure(NotFound());
        }

        JsonArray msgs;
        lock (p.Lock)
        {
            msgs = new JsonArray(p.Msgs.Where(x => x.N > ev).Take(60).Select(x => (JsonNode)new JsonObject { ["n"] = x.N, ["kind"] = x.Kind, ["who"] = x.Who, ["text"] = x.Text }).ToArray());
        }

        return Secure(Content(new JsonObject
        {
            ["rev"] = p.Rev,
            ["now"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ["item"] = ItemJson(p),
            ["playing"] = p.Playing,
            ["pos"] = p.NowPos(),
            ["by"] = p.By,
            ["control"] = p.Control,
            ["host"] = HostName(p),
            ["you"] = new JsonObject { ["id"] = me.Id, ["host"] = me.IsHost, ["name"] = me.Name },
            ["members"] = Members(p),
            ["msgs"] = msgs,
            ["subs"] = Subs(p),
        }.ToJsonString(), "application/json"));
    }

    private JsonArray Subs(Party p)
    {
        var a = new JsonArray();
        try
        {
            if (_sp.GetService<IMediaSourceManager>() is { } msm && Guid.TryParse(p.ItemId, out var g))
            {
                foreach (var s in msm.GetMediaStreams(g).Where(x => x.Type == MediaBrowser.Model.Entities.MediaStreamType.Subtitle && x.IsTextSubtitleStream).Take(40))
                {
                    a.Add(new JsonObject { ["i"] = s.Index, ["lang"] = Clean(s.Language, 8), ["title"] = Clean(s.DisplayTitle ?? s.Title ?? s.Language, 60) });
                }
            }
        }
        catch (Exception)
        {
            // no subtitles listed
        }

        return a;
    }

    /// <summary>Play, pause, seek (host always, guests only if the host allows it), and the host's heartbeat.</summary>
    [HttpPost("{code}/ctl")]
    [AllowAnonymous]
    public IActionResult Ctl(string code, [FromQuery] string cmd, [FromQuery] double pos = 0)
    {
        if (!Allow("pc|" + Ip, 120, 60))
        {
            return StatusCode(429);
        }

        var p = Open(code);
        var me = p is null ? null : Who(p);
        if (p is null)
        {
            return Secure(NotFound());
        }

        if (me is null)
        {
            return Secure(StatusCode(401));
        }

        if (!(me.IsHost || (p.Control && cmd != "beat")) || double.IsNaN(pos))
        {
            return Secure(StatusCode(403));
        }

        pos = Math.Clamp(pos, 0, 86400);
        var drift = Math.Abs(p.NowPos() - pos);
        switch (cmd)
        {
            case "play":
                p.Playing = true;
                break;
            case "pause":
                p.Playing = false;
                break;
            case "seek":
                break;
            case "beat":
                if (!p.Playing || drift < 1.0)
                {
                    p.Pos = pos;
                    p.Stamp = DateTime.UtcNow;
                    return Secure(NoContent());   // small drift: keep the server clock right, no need to wake the guests
                }

                break;
            default:
                return Secure(BadRequest());
        }

        p.Pos = pos;
        p.Stamp = DateTime.UtcNow;
        p.By = me.Id;
        p.Bump();
        return Secure(NoContent());
    }

    [HttpPost("{code}/say")]
    [AllowAnonymous]
    public IActionResult SayIt(string code, [FromQuery] string? text, [FromQuery] string? emoji)
    {
        if (!Allow("pm|" + Ip, 60, 60))
        {
            return StatusCode(429);
        }

        var p = Open(code);
        var me = p is null ? null : Who(p);
        if (p is null)
        {
            return Secure(NotFound());
        }

        if (me is null)
        {
            return Secure(StatusCode(401));
        }

        var now = DateTime.UtcNow;
        if (emoji is not null)
        {
            if (!Emojis.Contains(emoji) || now - me.LastReact < TimeSpan.FromMilliseconds(250))
            {
                return Secure(BadRequest());
            }

            me.LastReact = now;
            Say(p, "react", me.Name, emoji);
        }
        else
        {
            var t = Clean(text, 200);
            if (t.Length == 0 || now - me.LastSay < TimeSpan.FromMilliseconds(700))
            {
                return Secure(BadRequest());
            }

            me.LastSay = now;
            Say(p, "chat", me.Name, t);
        }

        p.Bump();
        return Secure(NoContent());
    }

    private static string Mime(string path) => System.IO.Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".mp4" or ".m4v" => "video/mp4",
        ".webm" => "video/webm",
        ".mkv" => "video/x-matroska",
        ".mov" => "video/quicktime",
        ".ogv" => "video/ogg",
        _ => "application/octet-stream",
    };

    /// <summary>The film itself (the party's one item, with range support so skipping works).</summary>
    [HttpGet("{code}/video")]
    [HttpHead("{code}/video")]
    [AllowAnonymous]
    public IActionResult Video(string code)
    {
        var p = Open(code);
        var me = p is null ? null : Who(p);
        if (p is null || me is null || VideoOf(p.ItemId) is not { } v || !Visible(p, v) || v.Path is null || !System.IO.File.Exists(v.Path))
        {
            return NotFound();
        }

        me.Seen = DateTime.UtcNow;
        Response.Headers["Cache-Control"] = "no-store";
        return PhysicalFile(v.Path, Mime(v.Path), enableRangeProcessing: true);
    }

    /// <summary>One subtitle track as WebVTT.</summary>
    [HttpGet("{code}/sub/{index:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> Sub(string code, int index, CancellationToken ct)
    {
        var p = Open(code);
        var me = p is null ? null : Who(p);
        if (p is null || me is null || VideoOf(p.ItemId) is not { } v || !Visible(p, v) || _sp.GetService<ISubtitleEncoder>() is not { } enc)
        {
            return NotFound();
        }

        if (!Allow("psub|" + Ip, 40, 60))
        {
            return StatusCode(429);
        }

        try
        {
            var st = await enc.GetSubtitles(v, v.Id.ToString("N"), index, "vtt", 0, 0, false, ct).ConfigureAwait(false);
            Response.Headers["Cache-Control"] = "private, max-age=3600";
            return File(st, "text/vtt; charset=utf-8");
        }
        catch (Exception)
        {
            return NotFound();
        }
    }

    /// <summary>The page guests open from the link.</summary>
    [HttpGet("{code}")]
    [AllowAnonymous]
    public IActionResult Page(string code)
    {
        if (!Allow("ppg|" + Ip, 60, 60))
        {
            return StatusCode(429);
        }

        var nonce = Token(12);
        Response.Headers["Content-Security-Policy"] = $"default-src 'none'; script-src 'nonce-{nonce}'; style-src 'nonce-{nonce}'; connect-src 'self'; media-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
        Response.Headers["X-Frame-Options"] = "DENY";
        return Secure(Content(PartyPage.Html(nonce, Open(code) is not null), "text/html; charset=utf-8"));
    }
}
