using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Http;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using MediaBrowser.Controller.Entities.Audio;
using MediaBrowser.Controller.Library;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>One UPnP / DLNA media renderer (network speaker, TV, receiver) found on the local network, plus the play queue the server runs for it.</summary>
internal sealed class Speaker
{
    public string Id = string.Empty;
    public string Name = string.Empty;
    public string Udn = string.Empty;
    public string AvUrl = string.Empty;
    public string RcUrl = string.Empty;
    public string Location = string.Empty;
    public DateTime Seen = DateTime.UtcNow;

    // session (run by the server, owned by the user who sent music to it)
    public string? Owner;
    public List<string> Queue = new();
    public int Index;
    public bool Playing;
    public double Pos;
    public double Dur;
    public double Vol = -1;
    public string BaseUrl = string.Empty;
    public JsonObject? Item;
    public bool SawPlaying;
    public bool Advancing;
    public DateTime Started = DateTime.MinValue;
    public DateTime StateAt = DateTime.UtcNow;
    public DateTime Paused = DateTime.MinValue;
    public CancellationTokenSource? Loop;
    public readonly SemaphoreSlim Gate = new(1, 1);
}

/// <summary>
/// Finds speakers (SSDP), sends them signed one-item links, and keeps their queue going (next track when one ends).
/// Nothing is stored; the list is rebuilt by a scan. Speakers only appear when the administrator turned the feature on.
/// </summary>
internal static class SpeakerService
{
    private static readonly ConcurrentDictionary<string, Speaker> All = new();
    private static readonly byte[] Secret = RandomNumberGenerator.GetBytes(32);
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(8) };
    private static ILibraryManager? _lib;
    private static DateTime _lastScan = DateTime.MinValue;
    private static int _scanning;

    /// <summary>The plugin settings (replaceable so the speaker code can be tested without a Jellyfin server).</summary>
    internal static PluginConfiguration? TestConfig;

    /// <summary>Test only: skip the network search so a test never talks to real devices.</summary>
    internal static bool TestNoSsdp;

    private static PluginConfiguration? Config => TestConfig ?? Plugin.Instance?.Configuration;

    public static bool Enabled => Config?.FeatSpeakers == true;

    public static void Init(ILibraryManager lib) => _lib = lib;

    public static IEnumerable<Speaker> List() => All.Values.Where(s => (DateTime.UtcNow - s.Seen).TotalMinutes < 20).OrderBy(s => s.Name, StringComparer.OrdinalIgnoreCase);

    public static Speaker? Get(string id) => All.TryGetValue(id, out var s) ? s : null;

    // ------------------------------------------------------------------ discovery

    private static bool IsPrivate(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip))
        {
            return true;
        }

        if (ip.AddressFamily != AddressFamily.InterNetwork)
        {
            return ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal;
        }

        var b = ip.GetAddressBytes();
        return b[0] == 10 || (b[0] == 172 && b[1] >= 16 && b[1] <= 31) || (b[0] == 192 && b[1] == 168) || (b[0] == 169 && b[1] == 254);
    }

    private static async Task<bool> SafeUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var u) || (u.Scheme != "http" && u.Scheme != "https"))
        {
            return false;
        }

        try
        {
            var ips = IPAddress.TryParse(u.Host, out var one) ? new[] { one } : await Dns.GetHostAddressesAsync(u.Host).ConfigureAwait(false);
            return ips.Length > 0 && ips.All(IsPrivate);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>Looks for renderers on every network interface and reads the manually added addresses. At most one scan runs at a time.</summary>
    public static async Task Scan(bool force)
    {
        if (!Enabled || (!force && (DateTime.UtcNow - _lastScan).TotalMinutes < 5) || Interlocked.Exchange(ref _scanning, 1) == 1)
        {
            return;
        }

        try
        {
            _lastScan = DateTime.UtcNow;
            var locs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var l in (Config!.SpeakerManual ?? string.Empty).Split(new[] { '\n', '\r', ' ' }, StringSplitOptions.RemoveEmptyEntries))
            {
                locs.Add(l);
            }

            foreach (var l in TestNoSsdp ? new List<string>() : await Ssdp().ConfigureAwait(false))
            {
                locs.Add(l);
            }

            foreach (var l in locs.Take(40))
            {
                await Describe(l).ConfigureAwait(false);
            }
        }
        finally
        {
            Interlocked.Exchange(ref _scanning, 0);
        }
    }

    private static async Task<List<string>> Ssdp()
    {
        var found = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var msg = Encoding.ASCII.GetBytes("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 2\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n");
        var dest = new IPEndPoint(IPAddress.Parse("239.255.255.250"), 1900);
        var clients = new List<UdpClient>();
        try
        {
            foreach (var nic in NetworkInterface.GetAllNetworkInterfaces())
            {
                if (nic.OperationalStatus != OperationalStatus.Up || !nic.SupportsMulticast || nic.NetworkInterfaceType == NetworkInterfaceType.Loopback)
                {
                    continue;
                }

                foreach (var ua in nic.GetIPProperties().UnicastAddresses.Where(a => a.Address.AddressFamily == AddressFamily.InterNetwork))
                {
                    try
                    {
                        var c = new UdpClient(new IPEndPoint(ua.Address, 0));
                        c.Client.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.MulticastTimeToLive, 2);
                        await c.SendAsync(msg, dest).ConfigureAwait(false);
                        await c.SendAsync(msg, dest).ConfigureAwait(false);
                        clients.Add(c);
                    }
                    catch
                    {
                        // an interface that cannot send multicast is simply skipped
                    }
                }
            }

            var until = DateTime.UtcNow.AddSeconds(3.5);
            var tasks = clients.Select(async c =>
            {
                while (DateTime.UtcNow < until)
                {
                    var rt = c.ReceiveAsync();
                    if (await Task.WhenAny(rt, Task.Delay(until - DateTime.UtcNow)).ConfigureAwait(false) != rt)
                    {
                        break;
                    }

                    var txt = Encoding.ASCII.GetString(rt.Result.Buffer);
                    foreach (var line in txt.Split('\n'))
                    {
                        if (line.StartsWith("LOCATION:", StringComparison.OrdinalIgnoreCase))
                        {
                            var loc = line[9..].Trim();
                            if (Uri.TryCreate(loc, UriKind.Absolute, out var lu) && IPAddress.TryParse(lu.Host, out var lip) && lip.Equals(rt.Result.RemoteEndPoint.Address))
                            {
                                lock (found)
                                {
                                    found.Add(loc);
                                }
                            }
                        }
                    }
                }
            }).ToArray();
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }
        catch
        {
            // no multicast on this host (for example a container without host networking): manual addresses still work
        }
        finally
        {
            foreach (var c in clients)
            {
                c.Dispose();
            }
        }

        return found.ToList();
    }

    private static string Id(string udn)
    {
        using var sha = SHA256.Create();
        return "spk_" + Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(udn)))[..16].ToLowerInvariant();
    }

    private static async Task Describe(string location)
    {
        try
        {
            if (!await SafeUrl(location).ConfigureAwait(false))
            {
                return;
            }

            var xml = await Http.GetStringAsync(location).ConfigureAwait(false);
            var doc = XDocument.Parse(xml);
            XNamespace ns = "urn:schemas-upnp-org:device-1-0";
            var root = doc.Root;
            var dev = root?.Descendants(ns + "device").FirstOrDefault(d => ((string?)d.Element(ns + "deviceType") ?? string.Empty).Contains("MediaRenderer", StringComparison.OrdinalIgnoreCase));
            if (dev is null)
            {
                return;
            }

            var udn = (string?)dev.Element(ns + "UDN") ?? location;
            var name = (string?)dev.Element(ns + "friendlyName") ?? "Speaker";
            var baseUri = new Uri(((string?)root!.Element(ns + "URLBase")) ?? location);
            string? av = null, rc = null;
            foreach (var s in dev.Descendants(ns + "service"))
            {
                var type = (string?)s.Element(ns + "serviceType") ?? string.Empty;
                var ctl = (string?)s.Element(ns + "controlURL");
                if (ctl is null)
                {
                    continue;
                }

                var abs = new Uri(baseUri, ctl).ToString();
                if (type.Contains("AVTransport", StringComparison.OrdinalIgnoreCase))
                {
                    av = abs;
                }
                else if (type.Contains("RenderingControl", StringComparison.OrdinalIgnoreCase))
                {
                    rc = abs;
                }
            }

            if (av is null || !await SafeUrl(av).ConfigureAwait(false))
            {
                return;
            }

            var id = Id(udn);
            var sp = All.GetOrAdd(id, _ => new Speaker { Id = id });
            name = System.Text.RegularExpressions.Regex.Replace(name, @"\s*-?\s*RINCON_\w+$", string.Empty).Replace(" Media Renderer", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
            sp.Name = name.Length > 48 ? name[..48] : name;
            sp.Udn = udn;
            sp.AvUrl = av;
            sp.RcUrl = rc ?? string.Empty;
            sp.Location = location;
            sp.Seen = DateTime.UtcNow;
        }
        catch
        {
            // not a usable device
        }
    }

    // ------------------------------------------------------------------ UPnP control

    private static async Task<XDocument?> Soap(string url, string service, string action, string args)
    {
        var body = $"<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><s:Body><u:{action} xmlns:u=\"urn:schemas-upnp-org:service:{service}:1\">{args}</u:{action}></s:Body></s:Envelope>";
        using var req = new HttpRequestMessage(HttpMethod.Post, url) { Content = new StringContent(body, Encoding.UTF8, "text/xml") };
        req.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/xml") { CharSet = "utf-8" };
        req.Headers.TryAddWithoutValidation("SOAPACTION", $"\"urn:schemas-upnp-org:service:{service}:1#{action}\"");
        try
        {
            using var resp = await Http.SendAsync(req).ConfigureAwait(false);
            var txt = await resp.Content.ReadAsStringAsync().ConfigureAwait(false);
            return resp.IsSuccessStatusCode ? XDocument.Parse(txt) : null;
        }
        catch
        {
            return null;
        }
    }

    private static string Esc(string s) => System.Security.SecurityElement.Escape(s) ?? string.Empty;

    private static string Pick(XDocument? d, string name) => d?.Descendants().FirstOrDefault(e => e.Name.LocalName == name)?.Value ?? string.Empty;

    private static double Hms(string s)
    {
        var p = s.Split(':');
        if (p.Length != 3)
        {
            return 0;
        }

        return double.TryParse(p[0], NumberStyles.Any, CultureInfo.InvariantCulture, out var h) && double.TryParse(p[1], NumberStyles.Any, CultureInfo.InvariantCulture, out var m) && double.TryParse(p[2], NumberStyles.Any, CultureInfo.InvariantCulture, out var sec) ? (h * 3600) + (m * 60) + sec : 0;
    }

    private static string ToHms(double s) => TimeSpan.FromSeconds(Math.Max(0, s)).ToString(@"hh\:mm\:ss", CultureInfo.InvariantCulture);

    private static Task<XDocument?> Av(Speaker s, string action, string extra = "") => Soap(s.AvUrl, "AVTransport", action, "<InstanceID>0</InstanceID>" + extra);

    // ------------------------------------------------------------------ signed links for the speaker (it cannot log in)

    public static string Sign(string itemId, TimeSpan life)
    {
        var payload = itemId + "|" + DateTimeOffset.UtcNow.Add(life).ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var p = Convert.ToBase64String(Encoding.UTF8.GetBytes(payload)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        using var h = new HMACSHA256(Secret);
        var sig = Convert.ToBase64String(h.ComputeHash(Encoding.UTF8.GetBytes(p))).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        return p + "." + sig;
    }

    public static string? Verify(string token)
    {
        var i = token.IndexOf('.', StringComparison.Ordinal);
        if (i < 1 || token.Length > 300)
        {
            return null;
        }

        var p = token[..i];
        using var h = new HMACSHA256(Secret);
        var want = Convert.ToBase64String(h.ComputeHash(Encoding.UTF8.GetBytes(p))).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        if (!CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(want), Encoding.ASCII.GetBytes(token[(i + 1)..])))
        {
            return null;
        }

        try
        {
            var b64 = p.Replace('-', '+').Replace('_', '/');
            b64 = b64.PadRight(b64.Length + ((4 - (b64.Length % 4)) % 4), '=');
            var parts = Encoding.UTF8.GetString(Convert.FromBase64String(b64)).Split('|');
            return parts.Length == 2 && long.Parse(parts[1], CultureInfo.InvariantCulture) > DateTimeOffset.UtcNow.ToUnixTimeSeconds() ? parts[0] : null;
        }
        catch
        {
            return null;
        }
    }

    public static string Mime(string path) => System.IO.Path.GetExtension(path).ToLowerInvariant() switch
    {
        ".mp3" => "audio/mpeg",
        ".flac" => "audio/flac",
        ".m4a" or ".mp4" => "audio/mp4",
        ".aac" => "audio/aac",
        ".ogg" or ".opus" => "audio/ogg",
        ".wav" => "audio/wav",
        ".wma" => "audio/x-ms-wma",
        _ => "application/octet-stream",
    };

    /// <summary>The audio file behind a link, only for audio items.</summary>
    public static string? PathFor(string itemId)
    {
        if (_lib is null || !Guid.TryParse(itemId, out var g))
        {
            return null;
        }

        return _lib.GetItemById(g) is Audio a && System.IO.File.Exists(a.Path) ? a.Path : null;
    }

    // ------------------------------------------------------------------ play queue

    private static JsonObject? Describe(string itemId, out string path)
    {
        path = string.Empty;
        if (_lib is null || !Guid.TryParse(itemId, out var g) || _lib.GetItemById(g) is not Audio a)
        {
            return null;
        }

        path = a.Path;
        return new JsonObject { ["id"] = itemId, ["name"] = a.Name ?? string.Empty, ["artist"] = string.Join(", ", a.Artists ?? Array.Empty<string>()), ["album"] = a.Album ?? string.Empty, ["albumId"] = string.Empty, ["tag"] = string.Empty, ["dur"] = (a.RunTimeTicks ?? 0) / 1e7 };
    }

    private static async Task<bool> Load(Speaker s, int index, double pos, bool play)
    {
        if (index < 0 || index >= s.Queue.Count)
        {
            return false;
        }

        var id = s.Queue[index];
        var item = Describe(id, out var path);
        if (item is null)
        {
            return false;
        }

        var url = s.BaseUrl.TrimEnd('/') + "/Cinema/cast/" + Sign(id, TimeSpan.FromHours(8)) + "/track" + System.IO.Path.GetExtension(path).ToLowerInvariant();
        var mime = Mime(path);
        var didl = "<DIDL-Lite xmlns=\"urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:upnp=\"urn:schemas-upnp-org:metadata-1-0/upnp/\">"
            + $"<item id=\"0\" parentID=\"-1\" restricted=\"1\"><dc:title>{Esc(item["name"]!.GetValue<string>())}</dc:title><dc:creator>{Esc(item["artist"]!.GetValue<string>())}</dc:creator><upnp:album>{Esc(item["album"]!.GetValue<string>())}</upnp:album>"
            + $"<upnp:class>object.item.audioItem.musicTrack</upnp:class><res protocolInfo=\"http-get:*:{mime}:*\">{Esc(url)}</res></item></DIDL-Lite>";
        var ok = await Av(s, "SetAVTransportURI", $"<CurrentURI>{Esc(url)}</CurrentURI><CurrentURIMetaData>{Esc(didl)}</CurrentURIMetaData>").ConfigureAwait(false);
        if (ok is null)
        {
            return false;
        }

        s.Index = index;
        s.Item = item;
        s.Dur = item["dur"]!.GetValue<double>();
        s.Pos = pos;
        s.SawPlaying = false;
        s.Started = DateTime.UtcNow;
        if (play)
        {
            await Av(s, "Play", "<Speed>1</Speed>").ConfigureAwait(false);
            s.Playing = true;
            if (pos > 1)
            {
                await Task.Delay(700).ConfigureAwait(false);
                await Av(s, "Seek", $"<Unit>REL_TIME</Unit><Target>{ToHms(pos)}</Target>").ConfigureAwait(false);
            }
        }

        s.StateAt = DateTime.UtcNow;
        return true;
    }

    private static void Watch(Speaker s)
    {
        s.Loop?.Cancel();
        var cts = s.Loop = new CancellationTokenSource();
        _ = Task.Run(async () =>
        {
            while (!cts.IsCancellationRequested && s.Queue.Count > 0)
            {
                try
                {
                    await Task.Delay(2000, cts.Token).ConfigureAwait(false);
                    await s.Gate.WaitAsync(cts.Token).ConfigureAwait(false);
                    try
                    {
                        if (s.Advancing)
                        {
                            continue;
                        }

                        var ti = await Av(s, "GetTransportInfo").ConfigureAwait(false);
                        var state = Pick(ti, "CurrentTransportState");
                        var pi = await Av(s, "GetPositionInfo").ConfigureAwait(false);
                        var rel = Hms(Pick(pi, "RelTime"));
                        var dur = Hms(Pick(pi, "TrackDuration"));
                        var was = s.Playing;
                        if (state is "PLAYING" or "TRANSITIONING")
                        {
                            s.Playing = true;
                            s.SawPlaying = true;
                            s.Pos = rel;
                            if (dur > 0)
                            {
                                s.Dur = dur;
                            }
                        }
                        else if (state == "PAUSED_PLAYBACK")
                        {
                            s.Playing = false;
                            s.Pos = rel;
                            if (was)
                            {
                                s.Paused = DateTime.UtcNow;
                            }
                        }
                        else if (state is "STOPPED" or "NO_MEDIA_PRESENT" && s.SawPlaying && s.Playing)
                        {
                            // the track ended on its own: next one, or finish
                            s.Advancing = true;
                            if (!await Load(s, s.Index + 1, 0, true).ConfigureAwait(false))
                            {
                                s.Playing = false;
                                s.Pos = 0;
                            }

                            s.Advancing = false;
                        }

                        s.StateAt = DateTime.UtcNow;
                        if (!s.Playing && s.Paused != DateTime.MinValue && DateTime.UtcNow - s.Paused > TimeSpan.FromMinutes(30))
                        {
                            s.Queue.Clear();
                            s.Item = null;
                            s.Owner = null;
                        }

                        if (s.Owner is not null)
                        {
                            ConnectController.BumpUser(s.Owner);
                        }
                    }
                    finally
                    {
                        s.Gate.Release();
                    }
                }
                catch (OperationCanceledException)
                {
                    return;
                }
                catch
                {
                    // the speaker is unreachable for a moment: try again
                }
            }
        });
    }

    public static JsonObject? StateOf(Speaker s)
    {
        if (s.Item is null)
        {
            return null;
        }

        var q = new JsonArray();
        foreach (var x in s.Queue.Take(500))
        {
            q.Add(x);
        }

        var pos = s.Playing ? s.Pos + (DateTime.UtcNow - s.StateAt).TotalSeconds : s.Pos;
        return new JsonObject
        {
            ["playing"] = s.Playing,
            ["pos"] = Math.Min(pos, s.Dur > 0 ? s.Dur : pos),
            ["dur"] = s.Dur,
            ["vol"] = s.Vol < 0 ? null : s.Vol,
            ["muted"] = false,
            ["shuffle"] = false,
            ["repeat"] = "off",
            ["index"] = s.Index,
            ["item"] = s.Item.DeepClone(),
            ["queue"] = q,
        };
    }

    /// <summary>Runs one hub command for a speaker. Moving music to it ("transfer") may take it over; everything else only the owner.</summary>
    public static async Task<bool> Command(Speaker s, string uid, JsonObject b, string baseUrl)
    {
        var cmd = b["cmd"]?.GetValue<string>() ?? string.Empty;
        await s.Gate.WaitAsync().ConfigureAwait(false);
        try
        {
            if (cmd == "transfer")
            {
                var ids = new List<string>();
                if (b["queue"] is JsonArray qa)
                {
                    foreach (var x in qa.Take(500))
                    {
                        var id = x?.GetValue<string>();
                        if (id is not null && Describe(id, out _) is not null)
                        {
                            ids.Add(id);
                        }
                    }
                }

                if (ids.Count == 0)
                {
                    return false;
                }

                var prev = s.Owner;
                s.Owner = uid;
                s.Queue = ids;
                s.BaseUrl = Config!.SpeakerBaseUrl is { Length: > 0 } cfg ? cfg : baseUrl;
                var idx = Math.Min(Math.Max(0, b["index"]?.GetValue<int>() ?? 0), ids.Count - 1);
                var pos = b["pos"]?.GetValue<double>() ?? 0;
                var ok = await Load(s, idx, pos, b["playing"]?.GetValue<bool>() ?? true).ConfigureAwait(false);
                if (ok)
                {
                    Watch(s);
                }

                if (prev is not null && prev != uid)
                {
                    ConnectController.BumpUser(prev);
                }

                return ok;
            }

            if (s.Owner != uid || s.Queue.Count == 0)
            {
                return false;
            }

            switch (cmd)
            {
                case "pause":
                    await Av(s, "Pause").ConfigureAwait(false);
                    s.Playing = false;
                    s.Paused = DateTime.UtcNow;
                    break;
                case "play":
                    await Av(s, "Play", "<Speed>1</Speed>").ConfigureAwait(false);
                    s.Playing = true;
                    break;
                case "toggle":
                    if (s.Playing)
                    {
                        await Av(s, "Pause").ConfigureAwait(false);
                        s.Playing = false;
                        s.Paused = DateTime.UtcNow;
                    }
                    else
                    {
                        await Av(s, "Play", "<Speed>1</Speed>").ConfigureAwait(false);
                        s.Playing = true;
                    }

                    break;
                case "next":
                    if (!await Load(s, s.Index + 1, 0, true).ConfigureAwait(false))
                    {
                        await Av(s, "Stop").ConfigureAwait(false);
                        s.Playing = false;
                    }

                    break;
                case "prev":
                    await Load(s, s.Pos > 3 ? s.Index : Math.Max(0, s.Index - 1), 0, true).ConfigureAwait(false);
                    break;
                case "seek":
                    var to = b["pos"]?.GetValue<double>() ?? 0;
                    await Av(s, "Seek", $"<Unit>REL_TIME</Unit><Target>{ToHms(to)}</Target>").ConfigureAwait(false);
                    s.Pos = to;
                    break;
                case "volume":
                    if (s.RcUrl.Length > 0)
                    {
                        var v = Math.Min(1, Math.Max(0, b["vol"]?.GetValue<double>() ?? 0));
                        await Soap(s.RcUrl, "RenderingControl", "SetVolume", $"<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>{(int)Math.Round(v * 100)}</DesiredVolume>").ConfigureAwait(false);
                        s.Vol = v;
                    }

                    break;
                case "queueAdd":
                    if (b["queue"] is JsonArray add)
                    {
                        foreach (var x in add.Take(200))
                        {
                            var id = x?.GetValue<string>();
                            if (id is not null && Describe(id, out _) is not null && s.Queue.Count < 500)
                            {
                                s.Queue.Add(id);
                            }
                        }
                    }

                    break;
                default:
                    return false;
            }

            s.StateAt = DateTime.UtcNow;
            return true;
        }
        finally
        {
            s.Gate.Release();
        }
    }
}
