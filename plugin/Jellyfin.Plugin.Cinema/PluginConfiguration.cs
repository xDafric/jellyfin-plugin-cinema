using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.Cinema;

public class PluginConfiguration : BasePluginConfiguration
{
    // ---- connections (keys stay on the server) ----
    public string SeerrUrl { get; set; } = string.Empty;

    public string SeerrApiKey { get; set; } = string.Empty;

    public string RadarrUrl { get; set; } = string.Empty;

    public string RadarrApiKey { get; set; } = string.Empty;

    public string SonarrUrl { get; set; } = string.Empty;

    public string SonarrApiKey { get; set; } = string.Empty;

    public string AurralUrl { get; set; } = string.Empty;

    public string AurralApiKey { get; set; } = string.Empty;

    // ---- loading ----
    public bool InjectEarly { get; set; } = true;

    public bool ShareQueue { get; set; } = true;

    // ---- features (server wide switches; a disabled feature is hidden for every user) ----
    public bool FeatHero { get; set; } = true;

    public bool FeatPeek { get; set; } = true;

    public bool FeatDiscover { get; set; } = true;

    public bool FeatWatchlist { get; set; } = true;

    public bool FeatRequests { get; set; } = true;

    public bool FeatCalendar { get; set; } = true;

    public bool FeatMusic { get; set; } = true;

    public bool FeatMusicDiscovery { get; set; } = true;

    public bool FeatOwnPlayer { get; set; } = true;

    public bool FeatMediaInfo { get; set; } = true;

    public bool FeatRatings { get; set; } = true;

    public bool FeatSeerrSimilar { get; set; } = true;

    public bool FeatInfiniteScroll { get; set; } = true;

    public bool FeatPluginMenus { get; set; } = true;

    public bool FeatItemMenu { get; set; } = true;

    /// <summary>Film Quiz: learn faces, names and films of the actors from watched films.</summary>
    public bool FeatQuiz { get; set; } = true;

    /// <summary>Cinema Wrapped: the viewing year as a story.</summary>
    public bool FeatWrapped { get; set; } = true;

    // ---- defaults for every user (users can override unless AllowUserOverrides is off) ----
    public bool AllowUserOverrides { get; set; } = true;

    public string AccentColor { get; set; } = "#e50914";

    public string BrandText { get; set; } = string.Empty;

    public int HeroItems { get; set; } = 8;

    public int HeroIntervalSeconds { get; set; } = 11;

    public int PeekDelayMs { get; set; } = 320;

    public string CardSize { get; set; } = "m";

    public bool SeerrWatchlistSync { get; set; }

    public bool PlayerAutoNext { get; set; } = true;

    public bool PlayerAutoSkipIntro { get; set; }

    public string PlayerQuality { get; set; } = "auto";

    // ---- Film Quiz and Wrapped defaults (users can override) ----
    public int QuizNewPerDay { get; set; } = 10;

    public int QuizDailyGoalXp { get; set; } = 100;

    public int QuizBlitzSeconds { get; set; } = 60;

    public bool QuizAutoAdvance { get; set; } = true;

    /// <summary>Only learn actors that appear in at least this many watched films (1 = everyone).</summary>
    public int QuizMinFilms { get; set; } = 1;

    /// <summary>auto = on the home page from mid November to the end of January, always, never.</summary>
    public string WrappedBanner { get; set; } = "auto";

    public bool WrappedIncludeShows { get; set; } = true;

    public bool WrappedAutoPlay { get; set; } = true;

    /// <summary>Comma separated navigation entries to hide, e.g. "calendar,requests".</summary>
    public string HiddenNav { get; set; } = string.Empty;

    /// <summary>JSON array of default home sections, e.g. [{"id":"continue","on":true}]. Empty = built-in order.</summary>
    public string DefaultSections { get; set; } = string.Empty;

    /// <summary>Salted SHA-256 of the code that unlocks the extended (hidden titles) mode. Never leaves the server.</summary>
    public string HiddenCodeHash { get; set; } = string.Empty;

    public string HiddenCodeSalt { get; set; } = string.Empty;

    /// <summary>Song search for music requests uses a public catalogue (only the typed words are sent, by the server). Turn off to stay fully local.</summary>
    public bool ExternalSongSearch { get; set; } = true;

    /// <summary>Show films watched on Letterboxd as watched here (read only, never written back).</summary>
    public bool FeatLetterboxd { get; set; }

    /// <summary>Archive movies: remove the file, keep the metadata in an archive section.</summary>
    public bool FeatArchive { get; set; }

    /// <summary>When archiving, also delete the file in Radarr and stop monitoring the movie.</summary>
    public bool ArchiveRadarr { get; set; } = true;
}
