using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.Cinema;

public class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>Base URL of Seerr / Jellyseerr / Overseerr, e.g. http://seerr:5055 .</summary>
    public string SeerrUrl { get; set; } = string.Empty;

    /// <summary>API key of an administrator in Seerr (Settings, General).</summary>
    public string SeerrApiKey { get; set; } = string.Empty;

    public string RadarrUrl { get; set; } = string.Empty;

    public string RadarrApiKey { get; set; } = string.Empty;

    public string SonarrUrl { get; set; } = string.Empty;

    public string SonarrApiKey { get; set; } = string.Empty;

    public string AurralUrl { get; set; } = string.Empty;

    public string AurralApiKey { get; set; } = string.Empty;

    /// <summary>Inject the Cinema UI script into the web client's index.html through File Transformation.</summary>
    public bool InjectEarly { get; set; } = true;

    /// <summary>Allow every signed-in user to see Radarr/Sonarr download progress and the calendar.</summary>
    public bool ShareQueue { get; set; } = true;
}
