using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using MediaBrowser.Controller.Entities.Audio;
using MediaBrowser.Controller.Library;

namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>
/// Signed one-song links. A network speaker cannot sign in, so the apps hand it a link that is the key itself:
/// valid for one song, expires after a few hours, and says nothing about the user. The speakers are controlled by the apps on the home network, never by the server.
/// </summary>
internal static class CastLinks
{
    private static readonly byte[] Secret = RandomNumberGenerator.GetBytes(32);
    private static ILibraryManager? _lib;

    /// <summary>The plugin settings (replaceable so this code can be tested without a Jellyfin server).</summary>
    internal static PluginConfiguration? TestConfig;

    internal static PluginConfiguration? Config => TestConfig ?? Plugin.Instance?.Configuration;

    public static bool Enabled => Config?.FeatConnect == true;

    public static void Init(ILibraryManager lib) => _lib = lib;

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

    /// <summary>The audio item behind an id, only for audio.</summary>
    public static Audio? AudioOf(string itemId) => _lib is not null && Guid.TryParse(itemId, out var g) ? _lib.GetItemById(g) as Audio : null;

    public static string? PathFor(string itemId) => AudioOf(itemId) is { } a && System.IO.File.Exists(a.Path) ? a.Path : null;
}
