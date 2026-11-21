using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Controller.Library;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>
/// Cinema Connect: every signed-in Cinema client (phone app, desktop app, browser, TV) of one user registers here, publishes what it is playing,
/// and can send play, pause, skip, seek, volume and "play here instead" to the user's other clients, like Spotify Connect.
/// The hub lives in memory (nothing is stored on disk), is strictly per Jellyfin user, and uses long polling so it works through any reverse proxy.
/// </summary>
[ApiController]
[Route("Cinema/connect")]
[Authorize]
public class ConnectController : ControllerBase
{
    private static readonly Regex IdRx = new("^[A-Za-z0-9_-]{6,64}$", RegexOptions.Compiled);
    private static readonly HashSet<string> Commands = new() { "play", "pause", "toggle", "next", "prev", "seek", "volume", "transfer", "queueAdd", "shuffle", "repeat" };
    private static readonly HashSet<string> Kinds = new() { "phone", "tablet", "desktop", "web", "tv", "speaker" };
    private static readonly ConcurrentDictionary<string, Hub> Hubs = new();
    private const int MaxBody = 24 * 1024;
    private const int MaxDevices = 12;
    private static readonly TimeSpan Alive = TimeSpan.FromSeconds(75);

    private sealed class Dev
    {
        public string Id = string.Empty;
        public string Name = string.Empty;
        public string Kind = "web";
        public DateTime Seen = DateTime.UtcNow;
        public JsonObject? State;
        public DateTime StateAt = DateTime.MinValue;
        public ConcurrentQueue<JsonObject> Cmds = new();
    }

    private sealed class Hub
    {
        public readonly ConcurrentDictionary<string, Dev> Devs = new();
        public long Ver;
        public TaskCompletionSource<bool> Changed = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public readonly object Lock = new();

        public void Bump()
        {
            lock (Lock)
            {
                Ver++;
                var old = Changed;
                Changed = new(TaskCreationOptions.RunContinuationsAsynchronously);
                old.TrySetResult(true);
            }
        }
    }

    public ConnectController(ILibraryManager lib) => SpeakerService.Init(lib);

    /// <summary>Wakes the polling clients of one user (a speaker changed).</summary>
    internal static void BumpUser(string uid)
    {
        if (Hubs.TryGetValue(uid, out var h))
        {
            h.Bump();
        }
    }

    private string? Uid => User.FindFirst("Jellyfin-UserId")?.Value?.Replace("-", string.Empty, StringComparison.Ordinal).ToLowerInvariant();

    private Hub? MyHub(bool create)
    {
        var u = Uid;
        if (string.IsNullOrEmpty(u))
        {
            return null;
        }

        if (create)
        {
            return Hubs.GetOrAdd(u, _ => new Hub());
        }

        return Hubs.TryGetValue(u, out var h) ? h : null;
    }

    private static void Sweep(Hub h)
    {
        var cut = DateTime.UtcNow - Alive;
        var gone = false;
        foreach (var kv in h.Devs)
        {
            if (kv.Value.Seen < cut && h.Devs.TryRemove(kv.Key, out _))
            {
                gone = true;
            }
        }

        if (gone)
        {
            h.Bump();
        }
    }

    private async Task<JsonObject?> Body()
    {
        using var ms = new MemoryStream();
        var buf = new byte[4096];
        int n;
        while ((n = await Request.Body.ReadAsync(buf.AsMemory(0, buf.Length)).ConfigureAwait(false)) > 0)
        {
            ms.Write(buf, 0, n);
            if (ms.Length > MaxBody)
            {
                return null;
            }
        }

        try
        {
            return JsonNode.Parse(Encoding.UTF8.GetString(ms.ToArray())) as JsonObject;
        }
        catch
        {
            return null;
        }
    }

    private static string Clean(string? s, int max)
    {
        s = (s ?? string.Empty).Trim();
        var sb = new StringBuilder();
        foreach (var c in s)
        {
            if (!char.IsControl(c) && c != '<' && c != '>')
            {
                sb.Append(c);
            }
        }

        return sb.Length > max ? sb.ToString(0, max) : sb.ToString();
    }

    private static JsonArray Snapshot(Hub h, string self, string? uid)
    {
        var arr = new JsonArray();
        foreach (var d in h.Devs.Values.OrderBy(x => x.Name, StringComparer.OrdinalIgnoreCase))
        {
            var st = d.State;
            arr.Add(new JsonObject
            {
                ["id"] = d.Id,
                ["name"] = d.Name,
                ["kind"] = d.Kind,
                ["self"] = d.Id == self,
                ["at"] = new DateTimeOffset(d.StateAt == DateTime.MinValue ? d.Seen : d.StateAt, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                ["state"] = st?.DeepClone(),
            });
        }

        if (SpeakerService.Enabled)
        {
            foreach (var sp in SpeakerService.List())
            {
                arr.Add(new JsonObject
                {
                    ["id"] = sp.Id,
                    ["name"] = sp.Name,
                    ["kind"] = "speaker",
                    ["self"] = false,
                    ["at"] = new DateTimeOffset(sp.StateAt, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                    ["state"] = sp.Owner is not null && sp.Owner == uid ? SpeakerService.StateOf(sp) : null,
                });
            }
        }

        return arr;
    }

    private IActionResult Out(Hub h, string self, JsonArray? cmds)
    {
        var o = new JsonObject { ["v"] = h.Ver, ["devices"] = Snapshot(h, self, Uid), ["commands"] = cmds ?? new JsonArray() };
        return Content(o.ToJsonString(), "application/json");
    }

    /// <summary>Announces this client (call again every ~30 s, or just keep polling). Returns the current device list.</summary>
    [HttpPost("hello")]
    public async Task<IActionResult> Hello()
    {
        var b = await Body().ConfigureAwait(false);
        var h = MyHub(true);
        var id = b?["id"]?.GetValue<string>();
        if (b is null || h is null || id is null || !IdRx.IsMatch(id))
        {
            return BadRequest();
        }

        Sweep(h);
        var isNew = !h.Devs.ContainsKey(id);
        if (isNew && h.Devs.Count >= MaxDevices)
        {
            return StatusCode(429);
        }

        var kind = b["kind"]?.GetValue<string>() ?? "web";
        var d = h.Devs.GetOrAdd(id, _ => new Dev { Id = id });
        d.Name = Clean(b["name"]?.GetValue<string>(), 48);
        if (d.Name.Length == 0)
        {
            d.Name = "Cinema";
        }

        d.Kind = Kinds.Contains(kind) ? kind : "web";
        d.Seen = DateTime.UtcNow;
        if (isNew)
        {
            h.Bump();
        }

        return Out(h, id, null);
    }

    /// <summary>This client says what it plays now (item, queue, position, volume). Only the playing device needs to send it.</summary>
    [HttpPost("state")]
    public async Task<IActionResult> State()
    {
        var b = await Body().ConfigureAwait(false);
        var h = MyHub(false);
        var id = b?["id"]?.GetValue<string>();
        if (b is null || h is null || id is null || !h.Devs.TryGetValue(id, out var d) || b["state"] is not JsonObject st)
        {
            return BadRequest();
        }

        // keep only the fields the clients use, with limits, so a client cannot push arbitrary data to the others
        var clean = new JsonObject
        {
            ["playing"] = st["playing"]?.GetValue<bool>() ?? false,
            ["pos"] = Num(st["pos"], 0, 86400 * 2),
            ["dur"] = Num(st["dur"], 0, 86400 * 2),
            ["vol"] = Num(st["vol"], 0, 1),
            ["muted"] = st["muted"]?.GetValue<bool>() ?? false,
            ["shuffle"] = st["shuffle"]?.GetValue<bool>() ?? false,
            ["repeat"] = Clean(st["repeat"]?.GetValue<string>(), 8),
            ["index"] = (int)Num(st["index"], 0, 100000),
            ["item"] = st["item"] is JsonObject it ? Item(it) : null,
        };
        if (st["queue"] is JsonArray q)
        {
            var qa = new JsonArray();
            foreach (var x in q.Take(500))
            {
                var s = x?.GetValue<string>();
                if (s is not null && IdRx.IsMatch(s.Length < 6 ? s.PadRight(6, '0') : s))
                {
                    qa.Add(s);
                }
            }

            clean["queue"] = qa;
        }

        var wasPlaying = d.State?["playing"]?.GetValue<bool>() ?? false;
        var wasItem = d.State?["item"]?["id"]?.GetValue<string>();
        d.State = clean;
        d.StateAt = DateTime.UtcNow;
        d.Seen = DateTime.UtcNow;
        var nowItem = clean["item"]?["id"]?.GetValue<string>();
        if (wasPlaying != (clean["playing"]?.GetValue<bool>() ?? false) || wasItem != nowItem || b["push"]?.GetValue<bool>() == true)
        {
            h.Bump();
        }

        return NoContent();
    }

    private static double Num(JsonNode? n, double lo, double hi)
    {
        try
        {
            var v = n is null ? 0 : n.GetValue<double>();
            return double.IsNaN(v) ? lo : Math.Min(hi, Math.Max(lo, v));
        }
        catch
        {
            return lo;
        }
    }

    private static JsonObject Item(JsonObject it)
    {
        string S(string k, int max) => Clean(it[k]?.GetValue<string>(), max);
        return new JsonObject { ["id"] = S("id", 64), ["name"] = S("name", 160), ["artist"] = S("artist", 160), ["album"] = S("album", 160), ["albumId"] = S("albumId", 64), ["tag"] = S("tag", 64) };
    }

    /// <summary>Sends a command to another client of the same user.</summary>
    [HttpPost("command")]
    public async Task<IActionResult> Command()
    {
        var b = await Body().ConfigureAwait(false);
        var h = MyHub(false);
        var to = b?["to"]?.GetValue<string>();
        var cmd = b?["cmd"]?.GetValue<string>();
        if (b is not null && h is not null && to is not null && cmd is not null && to.StartsWith("spk_", StringComparison.Ordinal) && Commands.Contains(cmd) && SpeakerService.Enabled && SpeakerService.Get(to) is { } sp)
        {
            var done = await SpeakerService.Command(sp, Uid!, b, Request.Scheme + "://" + Request.Host).ConfigureAwait(false);
            h.Bump();
            return done ? NoContent() : StatusCode(409);
        }

        if (b is null || h is null || to is null || cmd is null || !Commands.Contains(cmd) || !h.Devs.TryGetValue(to, out var d))
        {
            return BadRequest();
        }

        var c = new JsonObject { ["cmd"] = cmd, ["from"] = Clean(b["from"]?.GetValue<string>(), 64) };
        switch (cmd)
        {
            case "seek":
                c["pos"] = Num(b["pos"], 0, 86400 * 2);
                break;
            case "volume":
                c["vol"] = Num(b["vol"], 0, 1);
                break;
            case "transfer":
            case "queueAdd":
                var qa = new JsonArray();
                if (b["queue"] is JsonArray q)
                {
                    foreach (var x in q.Take(500))
                    {
                        var s = x?.GetValue<string>();
                        if (s is not null && IdRx.IsMatch(s.Length < 6 ? s.PadRight(6, '0') : s))
                        {
                            qa.Add(s);
                        }
                    }
                }

                c["queue"] = qa;
                c["index"] = (int)Num(b["index"], 0, 100000);
                c["pos"] = Num(b["pos"], 0, 86400 * 2);
                c["playing"] = b["playing"]?.GetValue<bool>() ?? true;
                break;
            case "shuffle":
                c["on"] = b["on"]?.GetValue<bool>() ?? false;
                break;
            case "repeat":
                c["mode"] = Clean(b["mode"]?.GetValue<string>(), 8);
                break;
        }

        while (d.Cmds.Count >= 50)
        {
            d.Cmds.TryDequeue(out _);
        }

        d.Cmds.Enqueue(c);
        h.Bump();
        return NoContent();
    }

    /// <summary>Waits (up to ~25 s) for a command for this client or any change in the device list, then answers. Call again right away.</summary>
    [HttpGet("poll")]
    public async Task<IActionResult> Poll([FromQuery] string id, [FromQuery] long v, CancellationToken ct)
    {
        var h = MyHub(false);
        if (h is null || id is null || !IdRx.IsMatch(id) || !h.Devs.TryGetValue(id, out var d))
        {
            return StatusCode(404);   // the client says hello again
        }

        if (SpeakerService.Enabled)
        {
            _ = SpeakerService.Scan(false);
        }

        var until = DateTime.UtcNow.AddSeconds(25);
        while (!ct.IsCancellationRequested)
        {
            d.Seen = DateTime.UtcNow;
            if (!d.Cmds.IsEmpty || h.Ver != v)
            {
                break;
            }

            var left = until - DateTime.UtcNow;
            if (left <= TimeSpan.Zero)
            {
                break;
            }

            Task changed;
            lock (h.Lock)
            {
                changed = h.Changed.Task;
            }

            await Task.WhenAny(changed, Task.Delay(left, ct)).ConfigureAwait(false);
        }

        var cmds = new JsonArray();
        while (d.Cmds.TryDequeue(out var c))
        {
            cmds.Add(c);
        }

        Sweep(h);
        return Out(h, id, cmds);
    }

    private static DateTime _lastManualScan = DateTime.MinValue;

    /// <summary>Looks for network speakers now (at most every 20 seconds).</summary>
    [HttpPost("speakers/scan")]
    public async Task<IActionResult> ScanSpeakers()
    {
        if (!SpeakerService.Enabled)
        {
            return NotFound();
        }

        if ((DateTime.UtcNow - _lastManualScan).TotalSeconds < 20)
        {
            return StatusCode(429);
        }

        _lastManualScan = DateTime.UtcNow;
        await SpeakerService.Scan(true).ConfigureAwait(false);
        MyHub(true)?.Bump();
        return Content(new JsonObject { ["count"] = SpeakerService.List().Count() }.ToJsonString(), "application/json");
    }

    /// <summary>Client is closing: remove it right away.</summary>
    [HttpPost("bye")]
    public async Task<IActionResult> Bye()
    {
        var b = await Body().ConfigureAwait(false);
        var h = MyHub(false);
        var id = b?["id"]?.GetValue<string>();
        if (h is not null && id is not null && h.Devs.TryRemove(id, out _))
        {
            h.Bump();
        }

        return NoContent();
    }
}
