/* ---------- Cinema UI core: utils, api, router, Netflix shell ---------- */
const L = /^de/i.test(document.documentElement.lang || navigator.language || '') ? 'de' : 'en';
const TX = {
  en: { home: 'Home', movies: 'Movies', shows: 'TV Shows', mylist: 'My List', music: 'Music', search: 'Search', play: 'Play', resume: 'Resume', info: 'More info', trailer: 'Trailer',
    continue: 'Continue watching', nextup: 'Next up', newMovies: 'Recently added movies', newShows: 'Recently added shows', top: 'Top rated', random: 'Picked for you', recentAlbums: 'New in music',
    favs: 'My List', cast: 'Cast', similar: 'More like this', episodes: 'Episodes', season: 'Season', seasons: 'Seasons', empty: 'Nothing here yet.', results: 'Results for', noRes: 'No results found.',
    prefs: 'Settings', dash: 'Dashboard', logout: 'Sign out', watched: 'Watched', list: 'List', genres: 'Genres', director: 'Director', studio: 'Studio', min: 'min', collection: 'Collection', inCollection: 'In this collection',
    gm: 'Good morning', ga: 'Good afternoon', ge: 'Good evening', liked: 'Liked Songs', playlists: 'Playlists', albums: 'Albums', artists: 'Artists', songs: 'Songs', library: 'Your Library', createPl: 'Create playlist',
    recent: 'Recently played', yourPl: 'Your playlists', mixes: 'Made for you', newAlb: 'Recently added', popular: 'Popular', searchMusic: 'What do you want to play?', top1: 'Top result', browse: 'Browse all',
    queue: 'Queue', nowPlaying: 'Now playing', nextIn: 'Next in queue', shuffle: 'Shuffle', addQ: 'Add to queue', playNext: 'Play next', addPl: 'Add to playlist', newPl: 'New playlist', goArtist: 'Go to artist', goAlbum: 'Go to album',
    like: 'Save to Liked Songs', unlike: 'Remove from Liked Songs', rmPl: 'Remove from this playlist', name: 'Name', cancel: 'Cancel', create: 'Create', title: 'Title', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Artist', mix: 'Mix',
    popularTracks: 'Popular', discography: 'Discography', moviesTv: 'Movies & TV', songsN: 'songs', trackN: 'song', random2: 'Shuffle play', myMix: 'Mix', added: 'Added to playlist', queued: 'Added to queue', ofN: 'min', discover: 'Discover', requests: 'Requests', calendar: 'Calendar', bookmarks: 'Bookmarks', more: 'More', pskin: 'Plugin page styling', on: 'On', off: 'Off', inLib: 'In library', requested: 'Requested', notOwned: 'Not in library', request: 'Request', trending: 'Trending', popMovies: 'Popular movies', popShows: 'Popular shows', upMovies: 'Upcoming movies', upShows: 'Upcoming shows', notInLib: 'Not in your library yet', all: 'All', watchlist: 'Watchlist', wlAdded: 'Added to watchlist', wlRemoved: 'Removed from watchlist', wlAdd: 'Add to watchlist', wlRemove: 'Remove from watchlist', favAdd: 'Add to My List', favRemove: 'Remove from My List', markWatched: 'Mark as watched', markUnwatched: 'Mark as unwatched', markedWatched: 'Marked as watched', markedUnwatched: 'Marked as unwatched', openDetails: 'Open details', editMeta: 'Edit metadata', editImages: 'Edit images', identify: 'Identify', refreshMeta: 'Refresh metadata', openNative: 'Open in Jellyfin', delete: 'Delete', cmdNA: 'That action is not available here', because: 'Because you watched', genresRandom: 'Random genre rows', seerrRec: 'Recommended for you', settings: 'Settings', general: 'General', setHero: 'Billboard on home', setHeroHint: 'Show the large rotating banner at the top.', setPeek: 'Hover preview cards', setPeekHint: 'Show a preview card when you hover a poster.', setInfinite: 'Infinite scroll', setInfiniteHint: 'Load more rows and grids as you scroll.', setSeerrWl: 'Sync watchlist with Seerr', setSeerrWlHint: 'Also add to your Seerr watchlist when you add a title to your watchlist.', appearance: 'Appearance', accent: 'Accent color', accentHint: 'Used for the logo and progress bars.', homeSections: 'Home sections', homeSectionsHint: 'Reorder, hide or add rows. Changes sync to all your devices.', custom: 'custom', secGenre: 'Genre row', secLibrary: 'Library row', add: 'Add', reset: 'Reset', rqPending: 'Waiting', rqProcessing: 'In progress', rqAvailable: 'Available', rqDeclined: 'Declined', rqWaiting: 'Waiting for approval', rqPartial: 'Partly available', rqDownloading: 'Downloading', rqApproved: 'Approved', approve: 'Approve', decline: 'Decline', downloads: 'Downloads', noDownloads: 'Nothing is downloading right now.', today: 'Today', arrOff: 'Radarr and Sonarr are not connected yet. Add them in Dashboard, Plugins, Cinema.', cal_digital: 'Digital release', cal_physical: 'Physical release', cal_cinema: 'In cinemas', cal_episode: 'Episode', close: 'Close', musicRequestArtists: 'Request artists', musicRequestAlbums: 'Request albums', discoverMusic: 'Discover new music', globalTopArtists: 'Top artists worldwide', all2: 'All', sortPop: 'Popularity', sortRating: 'Rating', sortNew: 'Newest', hideOwned: 'Hide what I have', moreToExplore: 'More to explore', moreOf: 'More', miTitle: 'Media info', miFile: 'File', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'audience', similarNew: 'More like this (not in your library yet)', forYou: 'Made for you', notOwnedMix: 'not in your library', requestAlbum: 'Request album', noPreview: 'No preview available', discoverShort: 'Discover', aurralOff: 'Aurral is not connected yet. Add it in Dashboard, Plugins, Cinema.', discoverCta: 'Find new tracks, artists and albums and request them.', open: 'Open', pluginsH: 'Plugins', plPreparing: 'Preparing stream…', plRetry: 'Reconnecting…', plAudio: 'Audio', plSubs: 'Subtitles', plOff: 'Off', plSpeed: 'Speed', plFail: 'Playback failed', plRetryBtn: 'Try again', plTranscode: 'Force transcoding', plNative: 'Use Jellyfin player', plNext: 'Next episode', setNative: 'Use the Jellyfin player', plBurn: 'burned in', featOff: 'This feature is turned off on this server.', showAll: 'Show all', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Enter the code shown on your TV (or other device) to sign it in.', qcCode: 'Code', qcOk: 'Device signed in', qcBad: 'Code not accepted', qcGo: 'Authorize', setTv: 'TV mode', setTvHint: 'Remote control layout with big focus ring. Only for this device; the page reloads.', imgPrimary: 'Poster', imgBackdrop: 'Backdrops', imgLogo: 'Logo', imgThumb: 'Thumbnail', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Search online', upload: 'Upload', noImages: 'No images', allLangs: 'All languages', back: 'Back', save: 'Save', saved: 'Saved', fName: 'Title', fOrig: 'Original title', fSort: 'Sort title', fOverview: 'Overview', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Year', fPremiere: 'Release date', fRating: 'Age rating', fCommunity: 'Community rating', fCritic: 'Critic rating', fLock: 'Lock metadata (do not overwrite on refresh)', fComma: 'Separate with commas', idSearch: 'Search', idNone: 'Nothing found', idApplied: 'Applied', idHint: 'Pick the correct result to replace metadata and images.', rfScan: 'Scan for new and updated files', rfScanHint: 'Only picks up changes.', rfMissing: 'Search for missing metadata', rfMissingHint: 'Fills gaps, keeps what you edited.', rfReplace: 'Replace all metadata', rfReplaceHint: 'Overwrites everything with fresh data from the providers.', rfImages: 'Also replace images', rfStart: 'Refresh', rfStarted: 'Refresh started', delConfirm: '"{n}" and its files will be deleted permanently. This cannot be undone.', delDone: 'Deleted', setDevPlayer: 'Player on this device', setDevPlayerHint: 'Applies only to this phone or computer. Other devices keep their own choice.', plOwn: 'Cinema player', plStd: 'Jellyfin standard', sortName: 'Name', sortRating: 'Rating', sortAdded: 'Recently added', sortYear: 'Release year', sortRandom: 'Random', browseAll: 'All', tagline: 'Tagline', factDirector: 'Director', factWriter: 'Writer', factStatus: 'Status', factLang: 'Original language', factRuntime: 'Runtime', factBudget: 'Budget', factRevenue: 'Box office', factStudio: 'Studio', factNetwork: 'Network', factSeasons: 'Seasons', reqOptions: 'Request options', reqServer: 'Server', reqProfile: 'Quality profile', reqFolder: 'Folder', reqAdvanced: 'Advanced (admin)', watchTrailer: 'Trailer', moreCast: 'Cast', noFilter: 'Default', setGeneral: 'General', setHome: 'Home', setPlayer: 'Player', setLook: 'Appearance', setServices: 'Services', setAdv: 'Advanced', setPeekDelay: 'Preview delay', setPeekDelayHint: 'How long to hover before the preview card opens.', fast: 'Fast', normal: 'Normal', slow: 'Slow', setHeroItems: 'Billboard titles', setHeroItemsHint: 'How many titles rotate in the billboard.', setHeroInterval: 'Billboard speed', setHeroIntervalHint: 'Seconds before the next title.', setCardSize: 'Card size', setCardSizeHint: 'Size of posters and thumbnails.', small: 'Small', medium: 'Medium', large: 'Large', pskinHint: 'Applies the Cinema style to Seerr, calendar and other plugin pages.', connected: 'Connected', notConnected: 'Not connected', serverSettings: 'Server settings', askAdmin: 'Ask your administrator to connect services.', setWatchlist: 'Watchlist', exportSet: 'Export / import settings', exportSetHint: 'Copy your settings as text or paste them on another account.', copy: 'Copy', impt: 'Import', pasteSet: 'Paste settings JSON', copied: 'Copied', resetAll: 'Reset all my settings', resetAllHint: 'Go back to the server defaults.', clearCache: 'Clear caches', clearCacheHint: 'Reload library and request data.', clear: 'Clear', killSwitch: 'Emergency switch', killSwitchHint: 'Type this in the browser console to turn Cinema off.', about: 'About', resetDefault: 'Reset to default', lockedBy: 'Turned off by the server administrator.', moreActions: 'More actions (plugins)', fromDecade: 'From the', unwatched: 'Not watched yet', plSubStyle: 'Subtitle appearance…', plChapters: 'Chapters', plSkipCredits: 'Skip credits', plSkipRecap: 'Skip recap', plSkipIntro: 'Skip intro', plNextIn: 'Next episode in', plBack: 'Back', plInfo: 'Playback info', plBack10: 'Back 10 seconds', plFwd10: 'Forward 10 seconds', plSettings: 'Settings', plFs: 'Fullscreen', plQuality: 'Quality', plAuto: 'Auto (original)', plQualityHint: 'Lower quality is transcoded by the server.', plAutoNext: 'Play next episode', plAutoNextHint: 'Continue with the next episode automatically.', plAutoSkip: 'Skip intros automatically', plAutoSkipHint: 'Needs intro detection on the server.', plRemember: 'Remember volume', plSubSize: 'Size', plSubPos: 'Position', plLow: 'Low', plMid: 'Middle', plHigh: 'High', plSubBg: 'Background', plShadow: 'Shadow', plBox: 'Box', plNone: 'None', plSubColor: 'Color', plWhite: 'White', plYellow: 'Yellow', plGreen: 'Green', plSubBold: 'Bold text', plSubFont: 'Font', plSubPreview: 'This is how subtitles look', plKPlay: 'Play / pause', plKVol: 'Volume', plKFs: 'Fullscreen', plKMute: 'Mute', plKBack: 'Close menu / leave', plTab_quality: 'Video', plTab_playback: 'Playback', plTab_subs: 'Subtitles', plTab_keys: 'Keys', plMethod: 'Method', plSource: 'Source', plPlaying: 'Playing', plBitrate: 'Bitrate', plBuffer: 'Buffer', plDropped: 'Dropped frames', setNativeHint: 'Turn on if the built-in player gives you trouble.' },
  de: { home: 'Startseite', movies: 'Filme', shows: 'Serien', mylist: 'Meine Liste', music: 'Musik', search: 'Suchen', play: 'Abspielen', resume: 'Fortsetzen', info: 'Mehr Infos', trailer: 'Trailer',
    continue: 'Weiterschauen', nextup: 'Als Nächstes', newMovies: 'Neu hinzugefügte Filme', newShows: 'Neu hinzugefügte Serien', top: 'Bestbewertet', random: 'Für dich ausgewählt', recentAlbums: 'Neu in der Musik',
    favs: 'Meine Liste', cast: 'Besetzung', similar: 'Ähnliche Titel', episodes: 'Folgen', season: 'Staffel', seasons: 'Staffeln', empty: 'Noch nichts vorhanden.', results: 'Ergebnisse für', noRes: 'Keine Ergebnisse gefunden.',
    prefs: 'Einstellungen', dash: 'Dashboard', logout: 'Abmelden', watched: 'Gesehen', list: 'Liste', genres: 'Genres', director: 'Regie', studio: 'Studio', min: 'Min.', collection: 'Sammlung', inCollection: 'In dieser Sammlung',
    gm: 'Guten Morgen', ga: 'Guten Tag', ge: 'Guten Abend', liked: 'Lieblingssongs', playlists: 'Playlists', albums: 'Alben', artists: 'Künstler', songs: 'Titel', library: 'Deine Bibliothek', createPl: 'Playlist erstellen',
    recent: 'Zuletzt gehört', yourPl: 'Deine Playlists', mixes: 'Für dich gemacht', newAlb: 'Zuletzt hinzugefügt', popular: 'Beliebt', searchMusic: 'Was möchtest du hören?', top1: 'Top-Ergebnis', browse: 'Alle durchsuchen',
    queue: 'Warteschlange', nowPlaying: 'Läuft gerade', nextIn: 'Als Nächstes', shuffle: 'Zufällig', addQ: 'Zur Warteschlange', playNext: 'Als Nächstes spielen', addPl: 'Zur Playlist hinzufügen', newPl: 'Neue Playlist', goArtist: 'Zum Künstler', goAlbum: 'Zum Album',
    like: 'Zu Lieblingssongs', unlike: 'Aus Lieblingssongs entfernen', rmPl: 'Aus dieser Playlist entfernen', name: 'Name', cancel: 'Abbrechen', create: 'Erstellen', title: 'Titel', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Künstler', mix: 'Mix',
    popularTracks: 'Beliebt', discography: 'Diskografie', moviesTv: 'Filme & Serien', songsN: 'Titel', trackN: 'Titel', random2: 'Zufallswiedergabe', myMix: 'Mix', added: 'Zur Playlist hinzugefügt', queued: 'Zur Warteschlange hinzugefügt', ofN: 'Min.', discover: 'Entdecken', requests: 'Anfragen', calendar: 'Kalender', bookmarks: 'Lesezeichen', more: 'Mehr', pskin: 'Plugin-Seiten-Design', on: 'An', off: 'Aus', inLib: 'In Bibliothek', requested: 'Angefragt', notOwned: 'Nicht vorhanden', request: 'Anfragen', trending: 'Angesagt', popMovies: 'Beliebte Filme', popShows: 'Beliebte Serien', upMovies: 'Bald im Kino', upShows: 'Bald neue Serien', notInLib: 'Noch nicht in deiner Bibliothek', all: 'Alle', watchlist: 'Watchlist', wlAdded: 'Zur Watchlist hinzugefügt', wlRemoved: 'Aus Watchlist entfernt', wlAdd: 'Zur Watchlist', wlRemove: 'Von Watchlist entfernen', favAdd: 'Zu Meine Liste', favRemove: 'Aus Meine Liste entfernen', markWatched: 'Als gesehen markieren', markUnwatched: 'Als ungesehen markieren', markedWatched: 'Als gesehen markiert', markedUnwatched: 'Als ungesehen markiert', openDetails: 'Details öffnen', editMeta: 'Metadaten bearbeiten', editImages: 'Bilder bearbeiten', identify: 'Identifizieren', refreshMeta: 'Metadaten aktualisieren', openNative: 'In Jellyfin öffnen', delete: 'Löschen', cmdNA: 'Diese Aktion ist hier nicht verfügbar', because: 'Weil du gesehen hast', genresRandom: 'Zufällige Genre-Reihen', seerrRec: 'Empfohlen für dich', settings: 'Einstellungen', general: 'Allgemein', setHero: 'Billboard auf der Startseite', setHeroHint: 'Zeigt das große rotierende Banner oben.', setPeek: 'Vorschau beim Hovern', setPeekHint: 'Zeigt eine Vorschaukarte, wenn du ein Poster überfährst.', setInfinite: 'Endloses Scrollen', setInfiniteHint: 'Lädt weitere Reihen und Listen beim Scrollen.', setSeerrWl: 'Watchlist mit Seerr synchronisieren', setSeerrWlHint: 'Fügt Titel auch deiner Seerr-Watchlist hinzu.', appearance: 'Aussehen', accent: 'Akzentfarbe', accentHint: 'Für Logo und Fortschrittsbalken.', homeSections: 'Startseiten-Bereiche', homeSectionsHint: 'Reihen sortieren, ausblenden oder hinzufügen. Änderungen synchronisieren auf alle Geräte.', custom: 'eigene', secGenre: 'Genre-Reihe', secLibrary: 'Bibliotheks-Reihe', add: 'Hinzufügen', reset: 'Zurücksetzen', rqPending: 'Wartend', rqProcessing: 'In Arbeit', rqAvailable: 'Verfügbar', rqDeclined: 'Abgelehnt', rqWaiting: 'Wartet auf Genehmigung', rqPartial: 'Teilweise verfügbar', rqDownloading: 'Lädt', rqApproved: 'Genehmigt', approve: 'Genehmigen', decline: 'Ablehnen', downloads: 'Downloads', noDownloads: 'Gerade lädt nichts herunter.', today: 'Heute', arrOff: 'Radarr und Sonarr sind noch nicht verbunden. Trage sie unter Dashboard, Plugins, Cinema ein.', cal_digital: 'Digitale Veröffentlichung', cal_physical: 'Physische Veröffentlichung', cal_cinema: 'Im Kino', cal_episode: 'Folge', close: 'Schließen', musicRequestArtists: 'Künstler anfragen', musicRequestAlbums: 'Alben anfragen', discoverMusic: 'Neue Musik entdecken', globalTopArtists: 'Top-Künstler weltweit', all2: 'Alle', sortPop: 'Beliebtheit', sortRating: 'Bewertung', sortNew: 'Neueste', hideOwned: 'Bereits vorhandene ausblenden', moreToExplore: 'Mehr zum Entdecken', moreOf: 'Mehr', miTitle: 'Medien-Info', miFile: 'Datei', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'Publikum', similarNew: 'Ähnliche Titel (noch nicht in deiner Bibliothek)', forYou: 'Für dich gemacht', notOwnedMix: 'nicht in deiner Bibliothek', requestAlbum: 'Album anfragen', noPreview: 'Keine Vorschau verfügbar', discoverShort: 'Entdecken', aurralOff: 'Aurral ist noch nicht verbunden. Trage es unter Dashboard, Plugins, Cinema ein.', discoverCta: 'Neue Titel, Künstler und Alben finden und anfragen.', open: 'Öffnen', pluginsH: 'Plugins', plPreparing: 'Stream wird vorbereitet…', plRetry: 'Verbindung wird wiederhergestellt…', plAudio: 'Ton', plSubs: 'Untertitel', plOff: 'Aus', plSpeed: 'Tempo', plFail: 'Wiedergabe fehlgeschlagen', plRetryBtn: 'Erneut versuchen', plTranscode: 'Transkodierung erzwingen', plNative: 'Jellyfin-Player nutzen', plNext: 'Nächste Folge', setNative: 'Jellyfin-Player verwenden', plBurn: 'eingebrannt', featOff: 'Diese Funktion ist auf diesem Server deaktiviert.', showAll: 'Alle anzeigen', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Gib den Code ein, der auf deinem Fernseher (oder anderen Gerät) angezeigt wird.', qcCode: 'Code', qcOk: 'Gerät angemeldet', qcBad: 'Code nicht akzeptiert', qcGo: 'Freigeben', setTv: 'TV-Modus', setTvHint: 'Layout für die Fernbedienung mit großem Fokusrahmen. Nur für dieses Gerät, die Seite lädt neu.', imgPrimary: 'Poster', imgBackdrop: 'Hintergründe', imgLogo: 'Logo', imgThumb: 'Vorschaubild', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Online suchen', upload: 'Hochladen', noImages: 'Keine Bilder', allLangs: 'Alle Sprachen', back: 'Zurück', save: 'Speichern', saved: 'Gespeichert', fName: 'Titel', fOrig: 'Originaltitel', fSort: 'Sortiertitel', fOverview: 'Beschreibung', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Jahr', fPremiere: 'Erscheinungsdatum', fRating: 'Altersfreigabe', fCommunity: 'Community-Bewertung', fCritic: 'Kritiker-Bewertung', fLock: 'Metadaten sperren (beim Aktualisieren nicht überschreiben)', fComma: 'Mit Komma trennen', idSearch: 'Suchen', idNone: 'Nichts gefunden', idApplied: 'Übernommen', idHint: 'Wähle das richtige Ergebnis, um Metadaten und Bilder zu ersetzen.', rfScan: 'Nach neuen und geänderten Dateien suchen', rfScanHint: 'Übernimmt nur Änderungen.', rfMissing: 'Fehlende Metadaten suchen', rfMissingHint: 'Füllt Lücken, behält deine Änderungen.', rfReplace: 'Alle Metadaten ersetzen', rfReplaceHint: 'Überschreibt alles mit frischen Daten der Anbieter.', rfImages: 'Auch Bilder ersetzen', rfStart: 'Aktualisieren', rfStarted: 'Aktualisierung gestartet', delConfirm: '„{n}“ und die zugehörigen Dateien werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.', delDone: 'Gelöscht', setDevPlayer: 'Player auf diesem Gerät', setDevPlayerHint: 'Gilt nur für dieses Handy bzw. diesen Computer. Andere Geräte behalten ihre eigene Wahl.', plOwn: 'Cinema-Player', plStd: 'Jellyfin-Standard', sortName: 'Name', sortRating: 'Bewertung', sortAdded: 'Zuletzt hinzugefügt', sortYear: 'Erscheinungsjahr', sortRandom: 'Zufällig', browseAll: 'Alle', tagline: 'Tagline', factDirector: 'Regie', factWriter: 'Drehbuch', factStatus: 'Status', factLang: 'Originalsprache', factRuntime: 'Laufzeit', factBudget: 'Budget', factRevenue: 'Einspielergebnis', factStudio: 'Studio', factNetwork: 'Sender', factSeasons: 'Staffeln', reqOptions: 'Anfrage-Optionen', reqServer: 'Server', reqProfile: 'Qualitätsprofil', reqFolder: 'Ordner', reqAdvanced: 'Erweitert (Admin)', watchTrailer: 'Trailer', moreCast: 'Besetzung', noFilter: 'Standard', setGeneral: 'Allgemein', setHome: 'Startseite', setPlayer: 'Player', setLook: 'Aussehen', setServices: 'Dienste', setAdv: 'Erweitert', setPeekDelay: 'Vorschau-Verzögerung', setPeekDelayHint: 'Wie lange du hovern musst, bis die Vorschaukarte öffnet.', fast: 'Schnell', normal: 'Normal', slow: 'Langsam', setHeroItems: 'Billboard-Titel', setHeroItemsHint: 'Wie viele Titel im Billboard wechseln.', setHeroInterval: 'Billboard-Tempo', setHeroIntervalHint: 'Sekunden bis zum nächsten Titel.', setCardSize: 'Kartengröße', setCardSizeHint: 'Größe von Postern und Vorschaubildern.', small: 'Klein', medium: 'Mittel', large: 'Groß', pskinHint: 'Wendet den Cinema-Stil auf Seerr, Kalender und andere Plugin-Seiten an.', connected: 'Verbunden', notConnected: 'Nicht verbunden', serverSettings: 'Servereinstellungen', askAdmin: 'Bitte deinen Administrator, Dienste zu verbinden.', setWatchlist: 'Watchlist', exportSet: 'Einstellungen exportieren / importieren', exportSetHint: 'Kopiere deine Einstellungen als Text oder füge sie in einem anderen Konto ein.', copy: 'Kopieren', impt: 'Importieren', pasteSet: 'Einstellungen-JSON einfügen', copied: 'Kopiert', resetAll: 'Alle meine Einstellungen zurücksetzen', resetAllHint: 'Zurück zu den Server-Standards.', clearCache: 'Caches leeren', clearCacheHint: 'Bibliotheks- und Anfragedaten neu laden.', clear: 'Leeren', killSwitch: 'Notschalter', killSwitchHint: 'Gib das in der Browser-Konsole ein, um Cinema auszuschalten.', about: 'Über', resetDefault: 'Auf Standard zurücksetzen', lockedBy: 'Vom Server-Administrator deaktiviert.', moreActions: 'Weitere Aktionen (Plugins)', fromDecade: 'Aus den', unwatched: 'Noch nicht gesehen', plSubStyle: 'Untertitel-Darstellung…', plChapters: 'Kapitel', plSkipCredits: 'Abspann überspringen', plSkipRecap: 'Rückblick überspringen', plSkipIntro: 'Intro überspringen', plNextIn: 'Nächste Folge in', plBack: 'Zurück', plInfo: 'Wiedergabe-Info', plBack10: '10 Sekunden zurück', plFwd10: '10 Sekunden vor', plSettings: 'Einstellungen', plFs: 'Vollbild', plQuality: 'Qualität', plAuto: 'Auto (Original)', plQualityHint: 'Niedrigere Qualität wird vom Server umgewandelt.', plAutoNext: 'Nächste Folge abspielen', plAutoNextHint: 'Automatisch mit der nächsten Folge weitermachen.', plAutoSkip: 'Intros automatisch überspringen', plAutoSkipHint: 'Benötigt Intro-Erkennung auf dem Server.', plRemember: 'Lautstärke merken', plSubSize: 'Größe', plSubPos: 'Position', plLow: 'Unten', plMid: 'Mitte', plHigh: 'Hoch', plSubBg: 'Hintergrund', plShadow: 'Schatten', plBox: 'Box', plNone: 'Keiner', plSubColor: 'Farbe', plWhite: 'Weiß', plYellow: 'Gelb', plGreen: 'Grün', plSubBold: 'Fetter Text', plSubFont: 'Schrift', plSubPreview: 'So sehen Untertitel aus', plKPlay: 'Abspielen / Pause', plKVol: 'Lautstärke', plKFs: 'Vollbild', plKMute: 'Stumm', plKBack: 'Menü schließen / verlassen', plTab_quality: 'Video', plTab_playback: 'Wiedergabe', plTab_subs: 'Untertitel', plTab_keys: 'Tasten', plMethod: 'Methode', plSource: 'Quelle', plPlaying: 'Wiedergabe', plBitrate: 'Bitrate', plBuffer: 'Puffer', plDropped: 'Verworfene Frames', setNativeHint: 'Aktivieren, falls der eingebaute Player Probleme macht.' }
};
const t = k => (TX[L][k] || TX.en[k] || k);

/* DOM helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(3)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
const IC = {
  play: 'M8 5v14l11-7z', pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z', next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z', prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  heart: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  heartOn: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  home: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z', search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  lib: 'M4 4h2v16H4zM8 4h2v16H8zM12.5 4.5l1.9-.7 5.6 15.2-1.9.7z', plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', queue: 'M4 10h12v2H4zM4 6h12v2H4zM4 14h8v2H4zM16 13v6l5-3z',
  vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z', info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z',
  left: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z', right: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z', close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  more: 'M6 10a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z', check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', down: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z',
  note: 'M12 3v10.55A4 4 0 1014 17V7h4V3h-6z', film: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z', tv: 'M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h5v2h8v-2h5a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H3V5h18v12z',
  cal: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z', edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z', refresh: 'M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z', fs: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z', star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', list: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
};
const ic = (n, cls) => { const s = LUMAP[n] ? luSvg(LUMAP[n], LUFILL[n]) : (() => { const x = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); x.setAttribute('viewBox', '0 0 24 24'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', IC[n] || ''); x.append(p); return x; })(); return cls ? h('span', { class: cls }, s) : s; };

/* API */
const uid = () => ApiClient.getCurrentUserId();
const api = (path, params) => ApiClient.getJSON(ApiClient.getUrl(path, params));
const F_BASE = 'PrimaryImageAspectRatio,Overview,Genres,ProductionYear,CommunityRating,OfficialRating,RunTimeTicks,DateCreated,ParentBackdropImageTags,ParentBackdropItemId,SeriesPrimaryImageTag,ParentLogoItemId,ParentLogoImageTag';
const items = p => api('Users/' + uid() + '/Items', Object.assign({ Recursive: true, Fields: F_BASE, ImageTypeLimit: 1, EnableImageTypes: 'Primary,Backdrop,Thumb,Logo' }, p));
const getItem = id => ApiClient.getItem(uid(), id);
const fmtMin = ticks => { const m = Math.round((ticks || 0) / 600000000); return m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m + 'm'; };
const fmtTime = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const shuffleArr = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const U = (id, type, w, tag, extra) => ApiClient.getUrl('Items/' + id + '/Images/' + type + (extra || ''), { maxWidth: w, tag, quality: 85 });
function imgUrl(it, type, w) {
  type = type || 'Primary'; w = w || 400;
  if (typeof TVM !== 'undefined' && TVM) w = Math.max(180, Math.round(w * (type === 'Backdrop' ? .66 : .6))); // TV: smaller pictures, less memory and decoding work
  if (type === 'Backdrop' && it._bd) return it._bd;
  if ((type === 'Primary' || type === 'Thumb') && it._img) return it._img;
  if (type === 'Backdrop') {
    if ((it.BackdropImageTags || []).length) return U(it.Id, 'Backdrop', w, it.BackdropImageTags[0], '/0');
    if ((it.ParentBackdropImageTags || []).length) return U(it.ParentBackdropItemId, 'Backdrop', w, it.ParentBackdropImageTags[0], '/0');
    return '';
  }
  if (type === 'Logo') {
    if (it.ImageTags && it.ImageTags.Logo) return U(it.Id, 'Logo', w, it.ImageTags.Logo);
    if (it.ParentLogoItemId && it.ParentLogoImageTag) return U(it.ParentLogoItemId, 'Logo', w, it.ParentLogoImageTag);
    return '';
  }
  if (type === 'Thumb') {
    if (it.ImageTags && it.ImageTags.Thumb) return U(it.Id, 'Thumb', w, it.ImageTags.Thumb);
    return imgUrl(it, 'Backdrop', w) || imgUrl(it, 'Primary', w);
  }
  if (it.ImageTags && it.ImageTags.Primary) return U(it.Id, 'Primary', w, it.ImageTags.Primary);
  if (it.Type === 'Audio' && it.AlbumId && it.AlbumPrimaryImageTag) return U(it.AlbumId, 'Primary', w, it.AlbumPrimaryImageTag);
  if (it.SeriesId && it.SeriesPrimaryImageTag) return U(it.SeriesId, 'Primary', w, it.SeriesPrimaryImageTag);
  return '';
}
const bg = u => u ? { style: 'background-image:url("' + u + '")' } : {};
const ud = it => it.UserData || {};
const pct = it => { const p = ud(it).PlayedPercentage; return p && p > 1 && p < 98 ? p : 0; };
const yearOf = it => it.ProductionYear || (it.PremiereDate || '').slice(0, 4);
const toast = msg => { const e = h('div', { style: 'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);background:#fff;color:#000;padding:10px 18px;border-radius:6px;font-weight:700;font-size:14px;z-index:9900;box-shadow:0 8px 24px rgba(0,0,0,.5)' }, msg); document.body.append(e); setTimeout(() => e.remove(), 2200); };

/* ---------- routing ---------- */
let BRAND = 'Jellyfin';
const refreshBrand = () => { try { const d = (C.status && C.status.defaults) || {}; const n = d.brand || ApiClient.serverInfo().Name; if (n) BRAND = n; } catch (e) { } };
const C = { mode: null, allowNative: false, scrollPos: {} };
const root = h('div', { id: 'cx' });
const parse = () => { const raw = location.hash.replace(/^#\/?/, ''); const [p, q] = raw.split('?'); return { parts: p.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(q || ''), raw }; };
const go = hash => { if (location.hash === hash) route(); else location.hash = hash; };
function itemHash(it) {
  switch (it.Type) {
    case 'Movie': case 'Series': case 'Season': case 'Episode': case 'BoxSet': case 'Video': return '#/c/item/' + it.Id;
    case 'Person': return '#/c/person/' + it.Id;
    case 'MusicAlbum': return '#/c/music/album/' + it.Id;
    case 'MusicArtist': return '#/c/music/artist/' + it.Id;
    case 'Playlist': return it.MediaType === 'Audio' ? '#/c/music/playlist/' + it.Id : '#/c/item/' + it.Id;
    case 'Audio': return it.AlbumId ? '#/c/music/album/' + it.AlbumId : null;
    default: return null;
  }
}
/* playing video: hand off to the native Jellyfin player */
async function playVideo(it, opts) {
  opts = opts || {};
  COVER.show();
  let id = it.Id;
  try {
    if (it.Type === 'Series' || it.Type === 'Season') {
      const nu = await api('Shows/NextUp', { userId: uid(), seriesId: it.Type === 'Series' ? it.Id : it.SeriesId, limit: 1 });
      if (nu.Items && nu.Items[0]) id = nu.Items[0].Id;
      else { const ep = await api('Shows/' + (it.Type === 'Series' ? it.Id : it.SeriesId) + '/Episodes', { userId: uid(), limit: 1 }); if (ep.Items[0]) id = ep.Items[0].Id; }
    } else if (it.Type === 'BoxSet') {
      const ch = await items({ ParentId: it.Id, Limit: 1, SortBy: 'SortName' }); if (ch.Items[0]) id = ch.Items[0].Id;
    }
  } catch (e) { }
  if (window.CinemaTV) { try { const full = await getItem(id); COVER.hide(); CinemaTV.play(id, opts.startTicks != null ? opts.startTicks : (ud(full).PlaybackPositionTicks || 0)); } catch (e) { COVER.hide(); toast('⚠ ' + (e.message || 'error')); } return; }
  if (playerMode() === 'native') { playNative(id); return; }
  try { const full = await getItem(id); COVER.hide(); await openPlayer(full, opts.startTicks); } catch (e) { console.warn('[cinema] player', e); COVER.hide(); playNative(id); }
}

/* ---------- Netflix shell ---------- */
function card(it, kind, opts) {
  opts = opts || {};
  kind = kind || 'thumb';
  const poster = kind === 'poster';
  const isEp = it.Type === 'Episode';
  const src = poster ? imgUrl(it, 'Primary', 400) : (isEp ? imgUrl(it, 'Primary', 600) || imgUrl(it, 'Backdrop', 600) : imgUrl(it, 'Thumb', 600));
  const title = isEp ? (it.SeriesName || it.Name) : it.Name;
  const sub = isEp ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : '';
  const hash = itemHash(it) || ('#/details?id=' + it.Id);
  const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title));
  if (pct(it)) im.append(h('div', { class: 'prog' }, h('i', { style: 'width:' + pct(it) + '%' })));
  const el = h('div', { class: 'nf-card ' + kind, onclick: () => go(hash), oncontextmenu: e => itemMenu(e, it) }, im, h('div', { class: 'title ell' }, title));
  if (HID.on && HID.ids.has(it.Id)) { el.classList.add('hx'); im.append(h('span', { class: 'hx-badge', title: t('hxIsHidden') }, ic('eyeOff', 'ic-s'))); }
  attachPeek(el, im, () => libDesc(it, poster));
  return el;
}

function row(title, list, kind, opts) {
  opts = opts || {};
  const cardOf = (i, idx) => opts.make ? opts.make(i) : kind === 'top10' ? top10Card(i, idx) : kind === 'spotlight' ? spotCard(i) : card(i, kind === 'top10' ? 'poster' : kind);
  const sc = h('div', { class: 'nf-scroller' }, list.map(cardOf));
  if (typeof TVM !== 'undefined' && TVM && opts.href) sc.append(h('a', { class: 'nf-card more ' + (kind || 'thumb'), href: opts.href }, h('div', { class: 'im' }, h('div', { class: 'mr' }, ic('right'), h('span', {}, t('showAll'))))));
  const L_ = h('button', { class: 'nf-arrow l', 'aria-label': 'Previous', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .85 }) }, ic('left'));
  const R_ = h('button', { class: 'nf-arrow r', 'aria-label': 'Next', onclick: () => sc.scrollBy({ left: sc.clientWidth * .85 }) }, ic('right'));
  return h('section', { class: 'nf-row' + (kind === 'top10' ? ' top10' : kind === 'spotlight' ? ' spot' : '') }, h('h2', {}, opts.href ? h('a', { href: opts.href }, title + ' ›') : title), L_, sc, R_);
}
/* numbered "Top 10" poster and wide spotlight card with synopsis */
function top10Card(it, idx) { const c = card(it, 'poster'); c.classList.add('t10c'); c.prepend(h('span', { class: 'n' }, String(idx + 1))); return c; }
function spotCard(it) {
  const bd = imgUrl(it, 'Backdrop', 900) || imgUrl(it, 'Primary', 600); const logo = imgUrl(it, 'Logo', 420);
  const meta = [it.ProductionYear, it.OfficialRating, it.CommunityRating ? '★ ' + it.CommunityRating.toFixed(1) : ''].filter(Boolean).join('  ·  ');
  const im = h('div', { class: 'im' }, h('div', Object.assign({ class: 'bgi' }, bg(bd))), h('div', { class: 'spot-info' }, logo ? h('img', { class: 'spot-logo', src: logo, alt: it.Name, loading: 'lazy' }) : h('b', {}, it.Name), meta ? h('small', {}, meta) : null));
  const el = h('div', { class: 'nf-card thumb spot', onclick: () => go(itemHash(it) || ('#/details?id=' + it.Id)), oncontextmenu: e => itemMenu(e, it) }, im);
  return el;
}
/* async row: placeholder is inserted immediately to keep order, filled when data arrives */
function lazyRow(container, title, fn, kind, opts) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  Promise.resolve().then(fn).then(list => { const arr = (list && list.Items) || list || []; if (arr.length >= ((opts && opts.min) || 1)) ph.replaceWith(row(title, arr, kind, opts)); else ph.remove(); }).catch(e => { console.warn('[cinema] row failed', title, e); ph.remove(); });
}

function heroEl(list) {
  const hero = h('div', { class: 'nf-hero' });
  const slides = list.map((it, i) => h('div', Object.assign({ class: 'nf-slide' + (i ? '' : ' on') }, bg(imgUrl(it, 'Backdrop', 1920)))));
  const body = h('div', { class: 'nf-hero-body' });
  const dots = h('div', { class: 'nf-dots' }, list.map((_, i) => h('i', { class: i ? '' : 'on', onclick: () => { set(i); restart(); } })));
  let cur = 0, timer;
  function fill(it) {
    const logo = imgUrl(it, 'Logo', 700);
    body.replaceChildren(
      logo ? h('img', { class: 'nf-hero-logo', src: logo, alt: it.Name }) : h('h1', { class: 'nf-hero-title' }, it.Name),
      h('div', { class: 'nf-meta' }, it.CommunityRating ? h('span', { class: 'match' }, Math.round(it.CommunityRating * 10) + '% ★') : null, yearOf(it) ? h('span', {}, yearOf(it)) : null, it.OfficialRating ? h('span', { class: 'badge' }, it.OfficialRating) : null, it.RunTimeTicks ? h('span', {}, fmtMin(it.RunTimeTicks)) : (it.Type === 'Series' ? h('span', {}, t('shows')) : null), (it.Genres || []).slice(0, 3).map(g => h('span', {}, g))),
      h('p', { class: 'nf-overview clamp3' }, it.Overview || ''),
      h('div', { class: 'nf-hero-btns' }, h('button', { class: 'btn white', onclick: () => (it._primary ? it._primary.fn() : playVideo(it)) }, ic(it._primary ? it._primary.icon : 'play'), it._primary ? it._primary.label : t('play')), h('button', { class: 'btn grey', onclick: () => (it._secondary ? it._secondary.fn() : go(itemHash(it))) }, ic(it._secondary ? it._secondary.icon : 'info'), it._secondary ? it._secondary.label : t('info'))));
  }
  function set(i) { cur = i; slides.forEach((s, k) => s.classList.toggle('on', k === i)); $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i)); body.style.opacity = 0; setTimeout(() => { fill(list[i]); body.style.opacity = 1; }, 250); }
  function restart() { clearInterval(timer); if (list.length > 1) timer = setInterval(() => { if (!hero.isConnected || root.style.display === 'none' || document.hidden || C.mode !== 'nf' || (typeof TVM !== 'undefined' && TVM && hero.contains(document.activeElement))) return; set((cur + 1) % list.length); }, (+cfg('heroInterval') || 11) * 1000); }
  body.style.transition = 'opacity .25s';
  hero.append(...slides, body, dots); fill(list[0]); restart();
  hero.addEventListener('remove', () => clearInterval(timer));
  return hero;
}
async function heroFor(types) {
  const r = await items({ IncludeItemTypes: types, SortBy: 'Random', Limit: 60, ImageTypes: 'Backdrop' });
  const withBd = r.Items.filter(i => (i.BackdropImageTags || []).length && i.Overview);
  const withLogo = withBd.filter(i => i.ImageTags && i.ImageTags.Logo);
  return (withLogo.length >= 5 ? withLogo : withBd).slice(0, Math.max(1, +cfg('heroItems') || 8));
}

function showSpinner() { C.nf.main.replaceChildren(h('div', { class: 'spinner' })); }

async function renderNF(r) {
  if (!C.nf) buildNF();
  const [a, b, c] = [r.parts[0], r.parts[1], r.parts[2]]; const c3 = r.parts[3];
  const main = C.nf.main; const key = r.raw;
  C.scrollPos[C.lastKey] = C.nf.el.scrollTop; C.lastKey = key;
  const view = (a === 'c' ? b : 'home') || 'home';
  C.nf.el.style.scrollBehavior = 'auto';
  const page = h('div', {}); main.replaceChildren(page);
  const token = (C.token = (C.token || 0) + 1);
  const done = () => { if (C.scrollPos[key]) C.nf.el.scrollTop = C.scrollPos[key]; else C.nf.el.scrollTop = 0; C.nf.el.style.scrollBehavior = ''; };
  if (view === 'home') await homeView2(page);
  else if (view === 'movies') await browseView(page, 'Movie');
  else if (view === 'shows') await browseView(page, 'Series');
  else if ((view === 'discover' && !feat('discover')) || (view === 'watchlist' && !feat('watchlist')) || (view === 'requests' && !feat('requests')) || (view === 'calendar' && !feat('calendar'))) page.append(h('div', { class: 'nf-page-pad' }, h('div', { class: 'nf-empty' }, t('featOff'))));
  else if (view === 'discover') await discoverView2(page);
  else if (view === 'watchlist') await watchlistView(page);
  else if (view === 'settings') await settingsView(page);
  else if (view === 'browse') await browseListView(page, c, c3 ? decodeURIComponent(c3) : '');
  else if (view === 'requests') await requestsView(page);
  else if (view === 'calendar') await calendarView(page);
  else if (view === 'person') await personView(page, c);
  else if (view === 'list') await listView(page);
  else if (view === 'search') await searchView(page, decodeURIComponent(c || ''));
  else if (view === 'item') await itemView(page, c);
  else if (view === 'archive') await archiveView(page);
  else page.append(h('div', { class: 'nf-empty' }, '404'));
  done();
}

async function homeView(page) {
  const hero = await heroFor('Movie,Series').catch(() => []);
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const u = uid();
  lazyRow(rows, t('continue'), () => api('Users/' + u + '/Items/Resume', { Limit: 16, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), 'thumb');
  lazyRow(rows, t('nextup'), () => api('Shows/NextUp', { userId: u, Limit: 16, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), 'thumb');
  lazyRow(rows, t('newMovies'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), 'poster', { href: '#/c/movies' });
  lazyRow(rows, t('newShows'), () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), 'poster', { href: '#/c/shows' });
  lazyRow(rows, t('top'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), 'thumb');
  lazyRow(rows, t('favs'), () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 24 }), 'poster', { href: '#/c/list' });
  lazyRow(rows, t('random'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), 'thumb');
  genreRows(rows, 'Movie', 4);
}
function genreRows(rows, type, n) {
  api('Genres', { userId: uid(), IncludeItemTypes: type, SortBy: 'Random', Limit: n }).then(g => (g.Items || []).forEach(gn => lazyRow(rows, gn.Name, () => items({ IncludeItemTypes: type, Genres: gn.Name, SortBy: 'Random', Limit: 20 }), 'thumb', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(gn.Name) }))).catch(() => { });
}
async function browseView(page, type) {
  const hero = await heroFor(type).catch(() => []);
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  lazyRow(rows, type === 'Movie' ? t('newMovies') : t('newShows'), () => items({ IncludeItemTypes: type, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), 'poster');
  lazyRow(rows, t('top'), () => items({ IncludeItemTypes: type, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20 }), 'thumb');
  genreRows(rows, type, 8);
  const all = h('div', { class: 'nf-page-pad', style: 'padding-top:10px' }, h('h1', { style: 'font-size:22px' }, type === 'Movie' ? t('movies') + ' A–Z' : t('shows') + ' A–Z')); rows.append(all);
  infiniteGrid(all, (s, n) => items({ IncludeItemTypes: type, SortBy: 'SortName', StartIndex: s, Limit: n }), i => card(i, 'poster'));
}
async function listView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('favs'))); page.append(wrap);
  infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: 'Movie,Series,BoxSet', Filters: 'IsFavorite', SortBy: 'SortName', StartIndex: s, Limit: n }), i => card(i, 'poster'));
}
Object.assign(TX.en, { srTop: 'Top result', srPeople: 'People', srMusic: 'Music', srEps: 'Episodes', srAll: 'All' });
Object.assign(TX.de, { srTop: 'Bestes Ergebnis', srPeople: 'Personen', srMusic: 'Musik', srEps: 'Folgen', srAll: 'Alle' });
async function searchView(page, q) {
  const wrap = h('div', { class: 'nf-page-pad srx-page' }, h('h1', {}, t('results') + ' “' + q + '”')); page.append(wrap);
  if (C.nf.sInput.value !== q) { C.nf.sInput.value = q; C.nf.sInput.parentElement.classList.add('open'); }
  wrap.append(h('div', { class: 'spinner', style: 'margin:60px auto' }));
  const get = types => items({ searchTerm: q, IncludeItemTypes: types, Limit: 40 }).then(r => r.Items).catch(() => []);
  const [mv, sh, ep, box, music, ppl] = await Promise.all([get('Movie'), get('Series'), get('Episode'), get('BoxSet'), get('MusicAlbum,MusicArtist,Audio'),
    api('Persons', { searchTerm: q, userId: uid(), Limit: 16, Fields: 'PrimaryImageAspectRatio' }).then(r => r.Items).catch(() => [])]);
  wrap.querySelector('.spinner').remove();
  const groups = [['mv', t('movies'), mv, 'poster'], ['sh', t('shows'), sh, 'poster'], ['ep', t('srEps'), ep, 'thumb'], ['box', t('collection'), box, 'poster'], ['ppl', t('srPeople'), ppl, 'person'], ['mu', t('srMusic'), music, 'poster']].filter(g => g[2].length);
  if (!groups.length) { wrap.append(h('div', { class: 'nf-empty' }, t('noRes'))); seerrSearchRow(wrap, q); return; }
  const ql = q.toLowerCase(); const pool = mv.concat(sh); const best = pool.find(i => i.Name.toLowerCase() === ql) || pool.find(i => i.Name.toLowerCase().startsWith(ql)) || pool[0];
  const body = h('div', {}); let active = 'all';
  const tabs = h('div', { class: 'nf-seasons' }, [['all', t('srAll')]].concat(groups.map(g => [g[0], g[1] + ' · ' + g[2].length])).map(([k, l]) => h('button', { class: 'nf-chip' + (k === active ? ' on' : ''), onclick: e => { active = k; $$('.nf-chip', tabs).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, l)));
  const personCard = p => h('a', { class: 'nf-card person', href: '#/c/person/' + p.Id }, h('div', Object.assign({ class: 'pi' }, bg(imgUrl(p, 'Primary', 300)))), h('div', { class: 'title ell' }, p.Name));
  function topCard(it) {
    const bd = imgUrl(it, 'Backdrop', 1280) || imgUrl(it, 'Primary', 600); const ov = (it.Overview || '').replace(/<[^>]+>/g, '');
    return h('div', { class: 'srx-top', onclick: () => go(itemHash(it)) }, h('div', Object.assign({ class: 'srx-top-bg' }, bg(bd))),
      h('div', { class: 'srx-top-in' }, h('small', {}, t('srTop')), h('h2', {}, it.Name), h('div', { class: 'nf-meta' }, [it.ProductionYear, it.OfficialRating, it.CommunityRating ? '★ ' + it.CommunityRating.toFixed(1) : '', it.Type === 'Series' ? t('shows') : t('movies')].filter(Boolean).map(x => h('span', {}, x))), ov ? h('p', {}, ov) : null,
        h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: e => { e.stopPropagation(); playVideo(it); } }, ic('play'), t('play')), h('button', { class: 'btn grey', onclick: e => { e.stopPropagation(); go(itemHash(it)); } }, ic('info'), t('info')))));
  }
  function draw() {
    body.replaceChildren();
    if (active === 'all' && best) body.append(topCard(best));
    groups.filter(g => active === 'all' || g[0] === active).forEach(([k, title, list, kind]) => {
      const mk = kind === 'person' ? personCard : null;
      if (active === 'all') body.append(row(title + ' · ' + list.length, list.slice(0, 20), kind, mk ? { make: mk } : {}));
      else body.append(h('h2', { class: 'srx-h' }, title), h('div', { class: 'nf-grid' + (kind === 'person' ? ' srx-people' : '') }, list.map(i => mk ? mk(i) : card(i, kind))));
    });
  }
  wrap.append(tabs, body); draw(); seerrSearchRow(wrap, q);
}

/* detail */
async function itemView(page, id) {
  let it = await getItem(id);
  let focusEp = null;
  if (it.Type === 'Episode') { focusEp = it; it = await getItem(it.SeriesId); }
  if (it.Type === 'Season') { focusEp = { SeasonId: it.Id }; it = await getItem(it.SeriesId); }
  const d = h('div', { class: 'nf-detail' });
  const bd = imgUrl(it, 'Backdrop', 1920) || imgUrl(it, 'Primary', 1200);
  d.append(h('div', Object.assign({ class: 'nf-dback' }, bg(bd))));
  const logo = imgUrl(it, 'Logo', 700);
  const isSeries = it.Type === 'Series', isBox = it.Type === 'BoxSet';
  const prog = pct(it);
  const favBtn = h('button', { class: 'btn round' + (ud(it).IsFavorite ? ' on' : ''), 'aria-label': t('mylist'), onclick: async () => { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData.IsFavorite = on; favBtn.classList.toggle('on', on); favBtn.replaceChildren(ic(on ? 'heartOn' : 'heart')); favBtn.title = on ? t('favRemove') : t('favAdd'); } }, ic(ud(it).IsFavorite ? 'heartOn' : 'heart'));
  favBtn.title = ud(it).IsFavorite ? t('favRemove') : t('favAdd');
  const seenBtn = !isSeries && !isBox ? h('button', { class: 'btn round' + (ud(it).Played ? ' on' : ''), 'aria-label': t('watched'), onclick: async () => { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData.Played = on; seenBtn.classList.toggle('on', on); seenBtn.title = on ? t('markUnwatched') : t('markWatched'); } }, ic('eye')) : null;
  if (seenBtn) seenBtn.title = ud(it).Played ? t('markUnwatched') : t('markWatched');
  const moreBtn = h('button', { class: 'btn round', 'aria-label': t('more'), onclick: e => itemMenu(e, it) }, ic('more'));
  const trailer = (it.RemoteTrailers || [])[0];
  const people = (it.People || []);
  const dir = people.filter(p => p.Type === 'Director').map(p => p.Name).join(', ');
  const info = h('div', { class: 'nf-dinfo' },
    logo ? h('img', { class: 'nf-dlogo', src: logo, alt: it.Name }) : h('h1', {}, it.Name),
    h('div', { class: 'nf-meta' }, it.CommunityRating ? h('span', { class: 'match' }, Math.round(it.CommunityRating * 10) + '% ★') : null, yearOf(it) ? h('span', {}, yearOf(it)) : null, it.OfficialRating ? h('span', { class: 'badge' }, it.OfficialRating) : null, it.RunTimeTicks && !isSeries ? h('span', {}, fmtMin(it.RunTimeTicks)) : null, isSeries && it.ChildCount ? h('span', {}, it.ChildCount + ' ' + t('seasons')) : null),
    (it.Taglines || [])[0] ? h('p', { class: 'nf-tagline' }, it.Taglines[0]) : null,
    h('p', { class: 'ov', onclick: e => e.currentTarget.classList.toggle('open') }, it.Overview || ''),
    h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: () => playVideo(it) }, ic('play'), prog ? t('resume') : t('play')),
      trailer ? h('a', { class: 'btn grey', href: trailer.Url, target: '_blank', rel: 'noopener' }, ic('film'), t('trailer')) : null, favBtn, seenBtn, moreBtn),
    prog ? h('div', { class: 'nf-resume-bar' }, h('i', { style: 'width:' + prog + '%' })) : null,
    h('dl', { class: 'nf-facts' }, (it.Genres || []).length ? [h('dt', {}, t('genres')), h('dd', {}, it.Genres.join(', '))] : null, dir ? [h('dt', {}, t('director')), h('dd', {}, dir)] : null, (it.Studios || []).length ? [h('dt', {}, t('studio')), h('dd', {}, it.Studios.map(s => s.Name).join(', '))] : null));
  const poster = imgUrl(it, 'Primary', 500);
  d.append(h('div', { class: 'nf-dbody' }, h('div', { class: 'nf-dhead' }, poster ? h('div', Object.assign({ class: 'nf-dposter' }, bg(poster))) : null, info)));
  page.append(d);
  const body = $('.nf-dbody', d);
  if (isSeries) {
    const sect = h('section', { class: 'nf-sect' }, h('h2', {}, t('episodes'))); body.append(sect);
    const seasons = (await api('Shows/' + it.Id + '/Seasons', { userId: uid(), Fields: 'ItemCounts' })).Items;
    const chips = h('div', { class: 'nf-seasons' }); const list = h('div', { class: 'nf-eps' });
    sect.append(seasons.length > 1 ? chips : '', list);
    async function loadSeason(s) {
      $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c.dataset.id === s.Id));
      list.replaceChildren(h('div', { class: 'spinner', style: 'margin:40px auto' }));
      const eps = (await api('Shows/' + it.Id + '/Episodes', { userId: uid(), seasonId: s.Id, Fields: F_BASE + ',MediaStreams' })).Items;
      list.replaceChildren(...eps.map(ep => h('div', { class: 'nf-ep', 'data-id': ep.Id, onclick: () => playVideo(ep) },
        h('div', { class: 'n' }, ep.IndexNumber != null ? ep.IndexNumber : ''),
        h('div', Object.assign({ class: 'th' }, bg(imgUrl(ep, 'Primary', 500) || imgUrl(ep, 'Backdrop', 500))), pct(ep) ? h('div', { class: 'prog' }, h('i', { style: 'width:' + pct(ep) + '%' })) : null),
        h('div', {}, h('div', { class: 'tt' }, h('span', {}, ep.Name), ud(ep).Played ? h('span', { class: 'seen' }, '✓') : null), h('div', { class: 'ds clamp3' }, ep.Overview || '')),
        h('div', { class: 'rt', style: 'color:#bbb' }, ep.RunTimeTicks ? fmtMin(ep.RunTimeTicks) : ''))));
      if (focusEp && focusEp.Id) { const el = $('[data-id="' + focusEp.Id + '"]', list); if (el) { el.style.background = '#2a2a2a'; setTimeout(() => el.scrollIntoView({ block: 'center' }), 50); } focusEp = null; }
    }
    seasons.forEach(s => chips.append(h('button', { class: 'nf-chip', 'data-id': s.Id, onclick: () => loadSeason(s) }, s.Name)));
    let start = seasons[0];
    if (focusEp) start = seasons.find(s => s.Id === (focusEp.SeasonId || focusEp.ParentId)) || start;
    else { const nu = await api('Shows/NextUp', { userId: uid(), seriesId: it.Id, limit: 1 }).catch(() => null); const ne = nu && nu.Items && nu.Items[0]; if (ne) start = seasons.find(s => s.Id === ne.SeasonId) || start; }
    if (start) await loadSeason(start);
  }
  if (isBox) {
    const ch = await items({ ParentId: it.Id, SortBy: 'PremiereDate', Limit: 100 });
    body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('inCollection')), h('div', { class: 'nf-grid' }, ch.Items.map(i => card(i, 'poster')))));
  }
  if (people.length) body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('cast')), h('div', { class: 'nf-cast' }, people.filter(p => p.Type === 'Actor').slice(0, 20).map(p => h('a', { class: 'nf-person', href: '#/c/person/' + p.Id }, h('div', Object.assign({ class: 'pi' }, bg(p.PrimaryImageTag ? U(p.Id, 'Primary', 200, p.PrimaryImageTag) : ''))), p.Name, h('small', {}, p.Role || ''))))));
  if (feat('mediaInfo')) { const admin = (await me()).Policy.IsAdministrator; const mi = mediaInfoSection(it, admin); if (mi) body.append(mi); }
  if (feat('ratings')) ratingsRow(it, d); if (feat('seerrSimilar')) seerrSimilarRow(it, body);
  if (!isBox) { const sim = await api('Items/' + it.Id + '/Similar', { userId: uid(), limit: 14, Fields: F_BASE }).catch(() => null); if (sim && sim.Items && sim.Items.length) { const sec = h('section', { class: 'nf-sect', style: 'margin-left:calc(-1 * var(--pad));margin-right:calc(-1 * var(--pad))' }); sec.append(row(t('similar'), sim.Items, 'poster')); body.append(sec); } }
}
