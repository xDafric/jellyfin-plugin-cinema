using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.Cinema;

/// <summary>Cinema: backend for the Cinema UI (Seerr, Radarr/Sonarr and Aurral proxies, early script injection).</summary>
public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    public static Plugin? Instance { get; private set; }

    public override Guid Id => Guid.Parse("8f3b6a1e-5d2c-4c7a-9e41-3b7d0c1a2f64");

    public override string Name => "Cinema";

    public override string Description => "Netflix and Spotify style interface with built-in Seerr, Radarr, Sonarr and Aurral support.";

    public IEnumerable<PluginPageInfo> GetPages()
    {
        yield return new PluginPageInfo
        {
            Name = "Cinema",
            EmbeddedResourcePath = GetType().Namespace + ".Configuration.config.html",
            EnableInMainMenu = true,
            MenuSection = "server",
            MenuIcon = "movie",
            DisplayName = "Cinema"
        };
    }
}
