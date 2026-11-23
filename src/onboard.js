/* ---------- feature registry (grouped, with dependencies), the settings gallery and the first-run setup ---------- */
Object.assign(TX.en, {
  setFeatures: 'Features', ftIntro: 'Everything Cinema can do, grouped by area. Switch features on or off, and open Options to fine-tune each one. Features that need a service show what is missing.', ftOn: 'On', ftOff: 'Off', ftLocked: 'Turned off by the server', ftNoSrv: 'Not enabled on the server', ftOptions: 'Options', ftOpen: 'Open', ftRunSetup: 'Run the setup again', ftGoServices: 'Set up', ftAll: 'All', ftManage: 'Manage', ftSearch: 'Search features…', ftShowOn: 'On', ftShowOff: 'Off', ftNeeds: 'Needs', ftReload: 'Applied after a reload', ftReloadDo: 'Reload now', ftNone: 'No feature matches.',
  ftGBrowse: 'Browsing and home page', ftGBrowseD: 'How the home page and the lists look and behave.', ftGDisc: 'Discover and requests', ftGDiscD: 'Find new films and shows, ask for them, and see what is on the way.', ftGMusic: 'Music', ftGMusicD: 'The music app, music discovery and music requests.', ftGLearn: 'Learn and look back', ftGLearnD: 'Games and statistics built from what you watched.', ftGPlay: 'Playback', ftGPlayD: 'The video player.', ftGLib: 'Library and connections', ftGLibD: 'Letterboxd, the archive and storage.', ftGMenu: 'Menu', ftGMenuD: 'Which pages appear in your navigation bar.',
  ftHeroN: 'Billboard', ftHeroD: 'Big rotating titles at the top of the home page, with logo, synopsis and a play button.', ftPeekN: 'Hover preview', ftPeekD: 'Rest the pointer on a poster to see a card with synopsis, rating and quick actions.', ftInfN: 'Endless home page', ftInfD: 'Keeps adding rows by genre, decade and more while you scroll.',
  ftHomeN: 'Smart home page', ftHomeD: 'Watched films get a check mark, new arrivals a label, and Discover rows are clearly tagged so you never mistake them for your library.', ftTnN: 'What shall we watch tonight?', ftTnD: 'Pick a time and a mood and get three films from your library, based on your taste, your watchlist and what is new.',
  ftMenuN: 'Item menu', ftMenuD: 'The three-dot menu on films and shows: edit metadata and images, mark as watched, archive and more.', ftPlugN: 'Plugin entries in the account menu', ftPlugD: 'Shows the entries other Jellyfin plugins add to the account menu.',
  ftDiscN: 'Discover', ftDiscD: 'Seerr recommendations with filters, genres and search. Request anything that is not in your library yet.', ftWlN: 'Watchlist', ftWlD: 'Your saved titles, optionally kept in sync with the Seerr watchlist.', ftReqN: 'Requests and downloads', ftReqD: 'Your Seerr requests with status steps and live download progress.', ftCalN: 'Release calendar', ftCalD: 'Upcoming releases and episodes from Radarr and Sonarr, with download and watch history.',
  ftRecoN: 'Personal recommendations', ftRecoD: 'Picked for you, more with your favourite actor or director, and a taste profile, based on what you watched.', ftSimN: 'Similar titles from Seerr', ftSimD: 'On detail pages, shows similar titles you do not own yet.', ftRateN: 'Rotten Tomatoes and IMDb', ftRateD: 'Critic and audience scores on detail pages.', ftInfoN: 'Media info', ftInfoD: 'File, video, audio and subtitle details on detail pages.',
  ftMusicN: 'Music app', ftMusicD: 'A Spotify style music app: library, playlists, mixes, queue and a full-screen player.', ftLyrN: 'Lyrics', ftLyrD: 'Synced lyrics in the music player.', ftMdN: 'Music discovery', ftMdD: 'New music from Aurral: recommendations, editorial playlists and charts.', ftMrN: 'Music requests', ftMrD: 'Request artists, albums and songs through Aurral.',
  ftQuizN: 'Film Quiz', ftQuizD: 'Learn the faces, names and films of the actors from the films you watched. Daily training, games, levels and badges.', ftWrN: 'Wrapped', ftWrD: 'Your viewing year as a story: hours, favourite genres, the actor you saw most, your highlights and more.',
  ftPlayerN: 'Cinema player', ftPlayerD: 'Our own video player: subtitle styling, skip intro, auto next episode and quality choice.',
  ftLbN: 'Letterboxd', ftLbD: 'Films you logged on Letterboxd count as watched here, with your ratings and dates. Read only.', ftArchN: 'Movie archive', ftArchD: 'Free up disk space but keep title, poster and details in an archive. Restore a movie any time.', ftStoreN: 'Storage assistant', ftStoreD: 'Free disk space, biggest movies and clean-up suggestions (administrators).',
  ftPagesN: 'Menu entries', ftPagesD: 'Choose which pages appear in your navigation bar. The pages stay reachable by address.', navMyList: 'My list', navBookmarks: 'Bookmarks', navLive: 'Live TV', navGames: 'Games',
  svcSeerr: 'Seerr', svcArr: 'Radarr or Sonarr', svcRadarr: 'Radarr', svcAurral: 'Aurral',
  qNew: 'New faces per day', qNewH: 'How many new actors the daily training introduces.', qGoal: 'Daily goal (XP)', qGoalH: 'The ring on the dashboard fills with XP. Reaching it keeps your streak alive.', qBlitz: 'Blitz round length', qAuto: 'Continue after a correct answer', qAutoH: 'Jump to the next question by itself. Turn off to read the film details first.',
  qMin: 'Which actors to learn', qMinH: 'Focus on actors you really know from several films.', qMinAll: 'Everyone', qMin2: '2+ films', qMin3: '3+ films', qLb: 'Include Letterboxd-only films', qLbH: 'Also learn the casts of films you only logged on Letterboxd. Needs Seerr; each cast is looked up once.', qGames: 'Games', qGamesH: 'Hide the games you do not like on the dashboard.',
  qReset: 'Reset progress', qResetH: 'Sets level, XP, streak and learning progress back to zero. This cannot be undone.', qResetDo: 'Reset', qResetOk: 'Progress reset', qResetAsk: 'Really reset all quiz progress?',
  wrBanner: 'Home page banner', wrBannerH: 'When the Wrapped card appears on the home page.', wrBSeason: 'Season', wrBAlways: 'Always', wrBNever: 'Never', wrShowsL: 'Include series', wrShowsH: 'Also count the episodes of series you watched.', wrAutoL: 'Advance automatically', wrAutoH: 'Slides move on by themselves. Otherwise tap or use the arrow keys.',
  calHistL: 'History in the calendar', calHistH: 'Show downloads and the films you watched in the calendar.',
  obWelcome: 'Welcome to Cinema', obWelcomeSub: 'A few quick questions to set everything up the way you like it. You can change all of it later in Settings.', obHi1: 'Browse', obHi1d: 'Billboard, previews and rows for every mood.', obHi2: 'Discover and request', obHi2d: 'Find what is next and ask for it.', obHi3: 'Listen', obHi3d: 'A music app with discovery and requests.', obHi4: 'Learn and look back', obHi4d: 'Film quiz and your year in review.',
  obStart: 'Let us go', obSkip: 'Skip for now', obNext: 'Next', obBack: 'Back', obFinish: 'Finish', obStep: 'Step {n} of {t}', obLook: 'Make it yours', obLookSub: 'Pick an accent colour and how large the posters should be.',
  obMenu: 'Your menu', obMenuSub: 'Which pages do you want in the navigation bar? Pages that need a service the server does not have are not listed.', obBrowse: 'Home page and browsing', obBrowseSub: 'Switch on what you like. The home page rows can be changed later in Settings, Home.', obSeenT: 'Watched and new films', obDetail: 'Detail pages and playback', obDetailSub: 'What you see on a film page and how videos play.',
  obMusic: 'Music', obMusicSub: 'How you want to use the music app.', obLearn: 'Learning, statistics and connections', obLearnSub: 'Pace for the film quiz, your Wrapped banner, and your Letterboxd account.', obQuizPace: 'Film quiz pace', obRelaxed: 'Relaxed', obRelaxedD: '5 new faces, 50 XP', obSteady: 'Steady', obSteadyD: '10 new faces, 100 XP', obKeen: 'Ambitious', obKeenD: '20 new faces, 200 XP', obLbT: 'Letterboxd username (optional)', obLbH: 'Films you watched there count as watched here and feed the quiz. Import the full list later in Settings, Connections.',
  obDone: 'All set', obDoneSub: 'Here is what you chose. You can change every part of it in Settings, Features.', obOnN: 'features on', obMenuN: 'menu entries'
});
Object.assign(TX.de, {
  setFeatures: 'Funktionen', ftIntro: 'Alles, was Cinema kann, nach Bereichen gruppiert. Schalte Funktionen ein oder aus und passe sie unter „Optionen" genau an. Funktionen, die einen Dienst brauchen, zeigen, was fehlt.', ftOn: 'An', ftOff: 'Aus', ftLocked: 'Vom Server ausgeschaltet', ftNoSrv: 'Auf dem Server nicht aktiviert', ftOptions: 'Optionen', ftOpen: 'Öffnen', ftRunSetup: 'Einrichtung erneut starten', ftGoServices: 'Einrichten', ftAll: 'Alle', ftManage: 'Verwalten', ftSearch: 'Funktionen suchen…', ftShowOn: 'An', ftShowOff: 'Aus', ftNeeds: 'Braucht', ftReload: 'Gilt nach dem Neuladen', ftReloadDo: 'Jetzt neu laden', ftNone: 'Keine Funktion passt.',
  ftGBrowse: 'Stöbern und Startseite', ftGBrowseD: 'Wie die Startseite und die Listen aussehen und sich verhalten.', ftGDisc: 'Entdecken und Anfragen', ftGDiscD: 'Neue Filme und Serien finden, anfragen und sehen, was unterwegs ist.', ftGMusic: 'Musik', ftGMusicD: 'Die Musik-App, Musik entdecken und Musik anfragen.', ftGLearn: 'Lernen und Rückblick', ftGLearnD: 'Spiele und Statistiken aus dem, was du geschaut hast.', ftGPlay: 'Wiedergabe', ftGPlayD: 'Der Videoplayer.', ftGLib: 'Bibliothek und Verbindungen', ftGLibD: 'Letterboxd, das Archiv und der Speicher.', ftGMenu: 'Menü', ftGMenuD: 'Welche Seiten in deiner Navigationsleiste erscheinen.',
  ftHeroN: 'Billboard', ftHeroD: 'Große, wechselnde Titel oben auf der Startseite mit Logo, Beschreibung und Abspielknopf.', ftPeekN: 'Hover-Vorschau', ftPeekD: 'Halte den Mauszeiger auf einem Poster, um eine Karte mit Handlung, Bewertung und Schnellaktionen zu sehen.', ftInfN: 'Endlose Startseite', ftInfD: 'Fügt beim Scrollen immer neue Reihen nach Genre, Jahrzehnt und mehr hinzu.',
  ftHomeN: 'Schlaue Startseite', ftHomeD: 'Gesehene Filme bekommen ein Häkchen, neue ein Label, und Entdecken-Reihen sind klar gekennzeichnet, damit du sie nie mit deiner Bibliothek verwechselst.', ftTnN: 'Was schauen wir heute?', ftTnD: 'Wähle Zeit und Stimmung und bekomm drei Filme aus deiner Bibliothek, passend zu Geschmack, Watchlist und Neuzugängen.',
  ftMenuN: 'Objektmenü', ftMenuD: 'Das Drei-Punkte-Menü bei Filmen und Serien: Metadaten und Bilder bearbeiten, als gesehen markieren, archivieren und mehr.', ftPlugN: 'Plugin-Einträge im Kontomenü', ftPlugD: 'Zeigt die Einträge, die andere Jellyfin-Plugins zum Kontomenü hinzufügen.',
  ftDiscN: 'Entdecken', ftDiscD: 'Seerr-Empfehlungen mit Filtern, Genres und Suche. Frage alles an, was noch nicht in deiner Bibliothek ist.', ftWlN: 'Watchlist', ftWlD: 'Deine gemerkten Titel, auf Wunsch mit der Seerr-Watchlist abgeglichen.', ftReqN: 'Anfragen und Downloads', ftReqD: 'Deine Seerr-Anfragen mit Status-Schritten und Download-Fortschritt in Echtzeit.', ftCalN: 'Veröffentlichungskalender', ftCalD: 'Kommende Filme und Folgen aus Radarr und Sonarr, mit Download- und Seh-Verlauf.',
  ftRecoN: 'Persönliche Empfehlungen', ftRecoD: 'Für dich ausgesucht, mehr mit deinem Lieblingsschauspieler oder -regisseur und ein Geschmacksprofil, basierend auf dem, was du geschaut hast.', ftSimN: 'Ähnliche Titel von Seerr', ftSimD: 'Zeigt auf Detailseiten ähnliche Titel, die du noch nicht besitzt.', ftRateN: 'Rotten Tomatoes und IMDb', ftRateD: 'Kritiker- und Publikumswertungen auf Detailseiten.', ftInfoN: 'Medieninfo', ftInfoD: 'Datei-, Video-, Audio- und Untertitel-Details auf Detailseiten.',
  ftMusicN: 'Musik-App', ftMusicD: 'Eine Musik-App im Spotify-Stil: Bibliothek, Playlists, Mixe, Warteschlange und ein Vollbild-Player.', ftLyrN: 'Songtexte', ftLyrD: 'Mitlaufende Songtexte im Musik-Player.', ftMdN: 'Musik entdecken', ftMdD: 'Neue Musik von Aurral: Empfehlungen, redaktionelle Playlists und Charts.', ftMrN: 'Musik anfragen', ftMrD: 'Frage Künstler, Alben und Songs über Aurral an.',
  ftQuizN: 'Filmwissen-Quiz', ftQuizD: 'Lerne Gesichter, Namen und Filme der Schauspieler aus den Filmen, die du gesehen hast. Tägliches Training, Spiele, Level und Abzeichen.', ftWrN: 'Wrapped', ftWrD: 'Dein Filmjahr als Story: Stunden, Lieblingsgenres, der meistgesehene Schauspieler, deine Highlights und mehr.',
  ftPlayerN: 'Cinema-Player', ftPlayerD: 'Unser eigener Videoplayer: Untertitel-Stil, Intro überspringen, automatisch nächste Folge und Qualitätswahl.',
  ftLbN: 'Letterboxd', ftLbD: 'Filme, die du auf Letterboxd eingetragen hast, gelten hier als gesehen, mit deinen Bewertungen und Daten. Nur lesend.', ftArchN: 'Filmarchiv', ftArchD: 'Speicherplatz freigeben, aber Titel, Poster und Details im Archiv behalten. Filme lassen sich jederzeit wiederherstellen.', ftStoreN: 'Speicher-Assistent', ftStoreD: 'Freier Speicherplatz, größte Filme und Aufräum-Vorschläge (Administratoren).',
  ftPagesN: 'Menüeinträge', ftPagesD: 'Wähle, welche Seiten in deiner Navigationsleiste erscheinen. Die Seiten bleiben über ihre Adresse erreichbar.', navMyList: 'Meine Liste', navBookmarks: 'Lesezeichen', navLive: 'Live-TV', navGames: 'Spiele',
  svcSeerr: 'Seerr', svcArr: 'Radarr oder Sonarr', svcRadarr: 'Radarr', svcAurral: 'Aurral',
  qNew: 'Neue Gesichter pro Tag', qNewH: 'Wie viele neue Schauspieler das tägliche Training einführt.', qGoal: 'Tagesziel (XP)', qGoalH: 'Der Ring im Dashboard füllt sich mit XP. Wer ihn erreicht, behält seine Serie.', qBlitz: 'Länge der Blitzrunde', qAuto: 'Nach richtiger Antwort weitergehen', qAutoH: 'Springt von selbst zur nächsten Frage. Ausschalten, um zuerst die Filmdetails zu lesen.',
  qMin: 'Welche Schauspieler lernen', qMinH: 'Konzentriere dich auf Schauspieler, die du aus mehreren Filmen wirklich kennst.', qMinAll: 'Alle', qMin2: 'ab 2 Filmen', qMin3: 'ab 3 Filmen', qLb: 'Filme nur von Letterboxd einbeziehen', qLbH: 'Lerne auch die Besetzung von Filmen, die du nur auf Letterboxd eingetragen hast. Braucht Seerr; jede Besetzung wird einmal nachgeschlagen.', qGames: 'Spiele', qGamesH: 'Blende Spiele aus, die du nicht magst.',
  qReset: 'Fortschritt zurücksetzen', qResetH: 'Setzt Level, XP, Serie und Lernstand auf null. Das lässt sich nicht rückgängig machen.', qResetDo: 'Zurücksetzen', qResetOk: 'Fortschritt zurückgesetzt', qResetAsk: 'Wirklich den gesamten Quiz-Fortschritt zurücksetzen?',
  wrBanner: 'Banner auf der Startseite', wrBannerH: 'Wann die Wrapped-Karte auf der Startseite erscheint.', wrBSeason: 'Saison', wrBAlways: 'Immer', wrBNever: 'Nie', wrShowsL: 'Serien einbeziehen', wrShowsH: 'Zähle auch die gesehenen Serienfolgen.', wrAutoL: 'Automatisch weiter', wrAutoH: 'Die Folien laufen von selbst weiter. Sonst tippen oder die Pfeiltasten nutzen.',
  calHistL: 'Verlauf im Kalender', calHistH: 'Zeige Downloads und die Filme, die du gesehen hast, im Kalender.',
  obWelcome: 'Willkommen bei Cinema', obWelcomeSub: 'Ein paar kurze Fragen, damit alles so eingerichtet ist, wie du es magst. Alles lässt sich später in den Einstellungen ändern.', obHi1: 'Stöbern', obHi1d: 'Billboard, Vorschau und Reihen für jede Stimmung.', obHi2: 'Entdecken und anfragen', obHi2d: 'Finde, was als Nächstes kommt, und frage es an.', obHi3: 'Hören', obHi3d: 'Eine Musik-App mit Entdecken und Anfragen.', obHi4: 'Lernen und Rückblick', obHi4d: 'Filmquiz und dein Jahresrückblick.',
  obStart: 'Los geht\'s', obSkip: 'Jetzt überspringen', obNext: 'Weiter', obBack: 'Zurück', obFinish: 'Fertig', obStep: 'Schritt {n} von {t}', obLook: 'Mach es zu deinem', obLookSub: 'Wähle eine Akzentfarbe und wie groß die Poster sein sollen.',
  obMenu: 'Dein Menü', obMenuSub: 'Welche Seiten sollen in der Navigationsleiste stehen? Seiten, die einen Dienst brauchen, den der Server nicht hat, werden nicht angezeigt.', obBrowse: 'Startseite und Stöbern', obBrowseSub: 'Schalte ein, was dir gefällt. Die Reihen der Startseite änderst du später unter Einstellungen, Startseite.', obSeenT: 'Gesehene und neue Filme', obDetail: 'Detailseiten und Wiedergabe', obDetailSub: 'Was du auf einer Filmseite siehst und wie Videos abgespielt werden.',
  obMusic: 'Musik', obMusicSub: 'Wie du die Musik-App nutzen möchtest.', obLearn: 'Lernen, Statistiken und Verbindungen', obLearnSub: 'Tempo für das Filmquiz, dein Wrapped-Banner und dein Letterboxd-Konto.', obQuizPace: 'Tempo beim Filmquiz', obRelaxed: 'Entspannt', obRelaxedD: '5 neue Gesichter, 50 XP', obSteady: 'Stetig', obSteadyD: '10 neue Gesichter, 100 XP', obKeen: 'Ehrgeizig', obKeenD: '20 neue Gesichter, 200 XP', obLbT: 'Letterboxd-Benutzername (optional)', obLbH: 'Filme, die du dort gesehen hast, gelten hier als gesehen und füttern das Quiz. Die vollständige Liste importierst du später unter Einstellungen, Verbindungen.',
  obDone: 'Alles bereit', obDoneSub: 'Das hast du gewählt. Du kannst jeden Teil davon unter Einstellungen, Funktionen ändern.', obOnN: 'Funktionen an', obMenuN: 'Menüeinträge'
});

/* ----- little illustrations for the cards ----- */
const fa = (cls, ...k) => h('div', { class: 'fa ' + cls }, k);
const faEmoji = (e, lines) => fa('fa-emo', h('span', {}, e), h('div', {}, (lines || [70, 45]).map(w => h('i', { style: 'width:' + w + 'px' }))));
const FART = {
  hero: () => fa('fa-hero', h('i', { class: 'l1' }), h('i', { class: 'l2' }), h('span', { class: 'pl' }), h('span', { class: 'gr' }), h('div', { class: 'dots' }, h('u', { class: 'on' }), h('u'), h('u'))),
  peek: () => fa('fa-peek', h('i'), h('i', { class: 'mid' }, h('b'), h('b'), h('b', { class: 'w' })), h('i')),
  inf: () => fa('fa-inf', [0, 1, 2].map(r => h('div', { style: '--o:' + (1 - r * .3) }, h('i'), h('i'), h('i'), h('i'), h('i')))),
  player: () => fa('fa-player', h('span', { class: 'big' }), h('span', { class: 'skip' }, 'Skip ›'), h('div', { class: 'bar' }, h('i'))),
  quiz: () => fa('fa-quiz', h('span', { class: 'face' }, '🙂'), h('div', {}, h('i'), h('i', { class: 'ok' }), h('i'), h('i'))),
  wrapped: () => fa('fa-wr', h('b', {}, '2026'), h('div', {}, [30, 55, 40, 85, 60, 35].map(v => h('i', { style: 'height:' + v + '%' })))),
  lb: () => fa('fa-lb', h('div', {}, h('i', { class: 'g' }), h('i', { class: 'o' }), h('i', { class: 'b' })), h('span', {}, '★★★★½')),
  arch: () => fa('fa-arch', h('i'), h('i'), h('i'), h('span', {}, '📦')),
  pages: () => fa('fa-pages', ['Home', 'Movies', 'Quiz', 'Music'].map((x, i) => h('i', { class: i === 2 ? 'on' : '' }, x))),
  tonight: () => fa('fa-tn', h('i', {}), h('i', { class: 'mid' }), h('i', {}), h('span', {}, '🍿')),
  home: () => fa('fa-home', h('div', {}, h('i', { class: 'a' }), h('i', { class: 'b' }), h('i', { class: 'c' })), h('em', {}, 'NEW'), h('u', {}, '✓')),
  disc: () => fa('fa-disc', h('div', {}, [0, 1, 2, 3].map(i => h('i', { class: i === 1 ? 'p' : '' }))), h('span', {}, '＋')),
  watch: () => fa('fa-watch', h('i', {}), h('i', { class: 'mid' }), h('i', {}), h('span', {}, '🔖')),
  req: () => fa('fa-req', h('div', {}, [1, 1, 0, 0].map((d, i) => h('i', { class: d ? 'on' : i === 2 ? 'cur' : '' }))), h('b', {}, h('i', { style: 'width:62%' }))),
  cal: () => fa('fa-cal', [...Array(14).keys()].map(i => h('i', { class: i === 9 ? 'on' : i === 4 || i === 12 ? 'dot' : '' }))),
  reco: () => faEmoji('✨', [90, 60, 40]),
  sim: () => faEmoji('🎞️', [80, 50]),
  rate: () => fa('fa-rate', h('span', { class: 'rt' }, '🍅 94%'), h('span', { class: 'im' }, 'IMDb 8.1')),
  info: () => fa('fa-info', [90, 70, 80, 55].map(w => h('div', {}, h('i', {}), h('b', { style: 'width:' + w + 'px' })))),
  menu: () => fa('fa-menu', h('i', {}), h('div', {}, h('b', {}), h('b', {}), h('b', {}))),
  plug: () => faEmoji('🧩', [70, 40]),
  music: () => fa('fa-music', h('span', { class: 'disc' }, '🎵'), h('div', {}, [40, 70, 55, 90, 45, 65].map(v => h('i', { style: 'height:' + v + '%' })))),
  lyr: () => fa('fa-lyr', [80, 110, 70, 95].map((w, i) => h('i', { class: i === 1 ? 'on' : '', style: 'width:' + w + 'px' }))),
  md: () => faEmoji('🎧', [90, 60]),
  mr: () => fa('fa-mr', h('span', {}, '🎶'), h('b', {}, '＋ Request')),
  store: () => fa('fa-store', h('div', {}, h('i', { style: 'width:78%' })), h('div', {}, h('i', { style: 'width:42%' })), h('span', {}, '💾'))
};

/* ----- services a feature may need ----- */
const SVC = { seerr: () => !!(C.status && C.status.seerr), arr: () => !!(C.status && (C.status.radarr || C.status.sonarr)), radarr: () => !!(C.status && C.status.radarr), aurral: () => !!(C.status && C.status.aurral) };
const SVC_N = { seerr: 'svcSeerr', arr: 'svcArr', radarr: 'svcRadarr', aurral: 'svcAurral' };
const adminHidden = k => (((C.status && C.status.defaults && C.status.defaults.hiddenNav) || '') + '').split(',').map(x => x.trim()).includes(k);
const GROUPS = [['browse', '', 'ftGBrowse', 'ftGBrowseD'], ['disc', '', 'ftGDisc', 'ftGDiscD'], ['music', '', 'ftGMusic', 'ftGMusicD'], ['learn', '', 'ftGLearn', 'ftGLearnD'], ['play', '▶', 'ftGPlay', 'ftGPlayD'], ['lib', '', 'ftGLib', 'ftGLibD'], ['menu', '', 'ftGMenu', 'ftGMenuD']];
const NAV_ENTRIES = [['discover', 'discover', 'discover'], ['watchlist', 'Watchlist', 'watchlist'], ['requests', 'requests', 'requests'], ['calendar', 'calendar', 'calendar'], ['music', 'music', 'music'], ['quiz', 'gTitle', 'quiz'], ['wrapped', 'wrTitle', 'wrapped'], ['tonight', 'tnTitle', 'tonight'], ['favorites', 'navMyList', null], ['bookmarks', 'navBookmarks', null], ['live', 'navLive', null], ['games', 'navGames', null]];
const navLabel = k => { const e = NAV_ENTRIES.find(x => x[0] === k); return e ? (TX[L][e[1]] || TX.en[e[1]] || e[1]) : k; };

/* ----- the catalogue: one entry per feature ----- */
function featCatalog(X) {
  const modeChips = () => h('div', { class: 'ft-chips' }, G_MODES.map(k => { const lbl = { blitz: t('gBlitz'), memory: t('gMemory'), type: t('gTypeM'), cast: t('gCastM'), cards: t('gCards') }[k]; const b = h('button', { class: 'nf-chip' + (gModeOn(k) ? ' on' : ''), onclick: async () => { const m = Object.assign({}, cfg('quizModes') || {}); m[k] = !gModeOn(k); await saveCfg({ quizModes: m }); b.classList.toggle('on', gModeOn(k)); } }, lbl); return b; }));
  const pageChips = () => h('div', { class: 'ft-chips' }, NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k)).map(([k]) => {
    const hidden = () => (CFGU.navHide || []).includes(k); const b = h('button', { class: 'nf-chip' + (hidden() ? '' : ' on'), onclick: async () => { const s = new Set(CFGU.navHide || []); hidden() ? s.delete(k) : s.add(k); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !hidden()); X.reload(); } }, navLabel(k)); return b; }));
  const lbOn = () => optOn('letterboxd');
  const T = (label, key, hint, needs) => { const r = X.toggle(label, key, hint); if (r && needs && !needs.every(n => SVC[n]())) r.classList.add('locked'); return r; };
  return [
    /* browsing and home */
    { id: 'hero', g: 'browse', ic: '🖼️', hue: '#e50914', name: 'ftHeroN', desc: 'ftHeroD', art: 'hero', key: 'hero', feat: 'hero', opts: () => [X.row(t('setHeroItems'), t('setHeroItemsHint'), X.seg([[4, '4'], [6, '6'], [8, '8'], [12, '12']], 'heroItems'), 'heroItems'), X.row(t('setHeroInterval'), t('setHeroIntervalHint'), X.seg([[6, '6 s'], [11, '11 s'], [16, '16 s'], [30, '30 s']], 'heroInterval'), 'heroInterval')] },
    { id: 'peek', g: 'browse', ic: '👁️', hue: '#0a84ff', name: 'ftPeekN', desc: 'ftPeekD', art: 'peek', key: 'peek', feat: 'peek', opts: () => [X.row(t('setPeekDelay'), t('setPeekDelayHint'), X.seg([[180, t('fast')], [320, t('normal')], [520, t('slow')]], 'peekDelay'), 'peekDelay')] },
    { id: 'inf', g: 'browse', ic: '♾️', hue: '#8b5cf6', name: 'ftInfN', desc: 'ftInfD', art: 'inf', key: 'infinite', feat: 'infiniteScroll' },
    { id: 'home', g: 'browse', ic: '✨', hue: '#5e5ce6', name: 'ftHomeN', desc: 'ftHomeD', art: 'home', on: () => cfg('homeSeen') !== 'off', tab: 'home', actionLbl: 'ftManage', opts: () => [X.row(t('rcSeenSet'), t('rcSeenHint'), X.seg([['badge', t('rcSeenBadge')], ['hide', t('rcSeenHide')], ['off', t('rcSeenOff')]], 'homeSeen'), 'homeSeen')] },
    { id: 'menu', g: 'browse', ic: '⋯', hue: '#8d8d97', name: 'ftMenuN', desc: 'ftMenuD', art: 'menu', key: 'itemMenu', feat: 'itemMenu' },
    { id: 'plug', g: 'browse', ic: '🧩', hue: '#64d2ff', name: 'ftPlugN', desc: 'ftPlugD', art: 'plug', key: 'pluginMenus', feat: 'pluginMenus' },
    /* discover and requests */
    { id: 'disc', g: 'disc', ic: '🔭', hue: '#bf5af2', name: 'ftDiscN', desc: 'ftDiscD', art: 'disc', nav: 'discover', feat: 'discover', needs: ['seerr'], open: '#/c/discover' },
    { id: 'reco', g: 'disc', ic: '✨', hue: '#ff6482', name: 'ftRecoN', desc: 'ftRecoD', art: 'reco', key: 'recommendations', feat: 'recommendations', needs: ['seerr'] },
    { id: 'wl', g: 'disc', ic: '🔖', hue: '#ffd60a', name: 'ftWlN', desc: 'ftWlD', art: 'watch', nav: 'watchlist', feat: 'watchlist', open: '#/c/watchlist', opts: () => [T(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint'), ['seerr'])] },
    { id: 'req', g: 'disc', ic: '📥', hue: '#0a84ff', name: 'ftReqN', desc: 'ftReqD', art: 'req', nav: 'requests', feat: 'requests', needs: ['seerr'], open: '#/c/requests' },
    { id: 'cal', g: 'disc', ic: '📅', hue: '#30d158', name: 'ftCalN', desc: 'ftCalD', art: 'cal', nav: 'calendar', feat: 'calendar', needs: ['arr'], open: '#/c/calendar', opts: () => [X.toggle(t('calHistL'), 'calendarHistory', t('calHistH'))] },
    { id: 'sim', g: 'disc', ic: '🎞️', hue: '#ff9f0a', name: 'ftSimN', desc: 'ftSimD', art: 'sim', key: 'seerrSimilar', feat: 'seerrSimilar', needs: ['seerr'] },
    { id: 'rate', g: 'disc', ic: '🍅', hue: '#ff453a', name: 'ftRateN', desc: 'ftRateD', art: 'rate', key: 'ratings', feat: 'ratings', needs: ['seerr'] },
    { id: 'info', g: 'disc', ic: '📋', hue: '#8e8e93', name: 'ftInfoN', desc: 'ftInfoD', art: 'info', key: 'mediaInfo', feat: 'mediaInfo' },
    /* music */
    { id: 'music', g: 'music', ic: '🎵', hue: '#1ed760', name: 'ftMusicN', desc: 'ftMusicD', art: 'music', nav: 'music', feat: 'music', open: '#/c/music' },
    { id: 'lyr', g: 'music', ic: '🎤', hue: '#ff375f', name: 'ftLyrN', desc: 'ftLyrD', art: 'lyr', key: 'musicLyrics', feat: 'musicLyrics', needsFeat: 'music' },
    { id: 'md', g: 'music', ic: '🎧', hue: '#bf5af2', name: 'ftMdN', desc: 'ftMdD', art: 'md', key: 'musicDiscovery', feat: 'musicDiscovery', needs: ['aurral'], needsFeat: 'music' },
    { id: 'mr', g: 'music', ic: '🎶', hue: '#64d2ff', name: 'ftMrN', desc: 'ftMrD', art: 'mr', key: 'musicRequests', feat: 'musicRequests', needs: ['aurral'], needsFeat: 'music' },
    /* learn and look back */
    { id: 'quiz', g: 'learn', ic: '🎭', hue: '#1ed760', name: 'ftQuizN', desc: 'ftQuizD', art: 'quiz', key: 'quiz', feat: 'quiz', open: '#/c/quiz', opts: () => [
      X.row(t('qNew'), t('qNewH'), X.seg([[5, '5'], [10, '10'], [20, '20'], [30, '30']], 'quizNew'), 'quizNew'), X.row(t('qGoal'), t('qGoalH'), X.seg([[50, '50'], [100, '100'], [200, '200'], [300, '300']], 'quizGoal'), 'quizGoal'),
      X.row(t('qBlitz'), '', X.seg([[30, '30 s'], [60, '60 s'], [90, '90 s']], 'quizBlitz'), 'quizBlitz'), X.toggle(t('qAuto'), 'quizAuto', t('qAutoH')),
      X.row(t('qMin'), t('qMinH'), X.seg([[1, t('qMinAll')], [2, t('qMin2')], [3, t('qMin3')]], 'quizMin'), 'quizMin'),
      lbOn() ? X.toggle(t('qLb'), 'quizLb', t('qLbH')) : null, X.row(t('qFamous'), t('qFamousH'), X.seg([['both', t('qFamousBoth')], ['seen', t('qFamousSeen')]], 'quizFamous'), 'quizFamous'), X.toggle(t('qScenes'), 'quizScenes', t('qScenesH')), X.row(t('qGames'), t('qGamesH'), modeChips()),
      X.row(t('qReset'), t('qResetH'), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { if (!confirm(t('qResetAsk'))) return; await gLoad(); Object.assign(GM.st, gDef(), { ts: Date.now() }); await gFlush(); toast(t('qResetOk')); } }, t('qResetDo')))] },
    { id: 'wrapped', g: 'learn', ic: '🎬', hue: '#ff2d92', name: 'ftWrN', desc: 'ftWrD', art: 'wrapped', key: 'wrapped', feat: 'wrapped', open: '#/c/wrapped', opts: () => [
      X.row(t('wrBanner'), t('wrBannerH'), X.seg([['auto', t('wrBSeason')], ['always', t('wrBAlways')], ['never', t('wrBNever')]], 'wrappedBanner'), 'wrappedBanner'), X.toggle(t('wrShowsL'), 'wrappedShows', t('wrShowsH')), X.toggle(t('wrAutoL'), 'wrappedAuto', t('wrAutoH'))] },
    /* playback */
    { id: 'player', g: 'play', ic: '▶️', hue: '#ff6a3d', name: 'ftPlayerN', desc: 'ftPlayerD', art: 'player', feat: 'ownPlayer', on: () => playerMode() === 'own', tab: 'player', opts: () => [
      X.row(t('setDevPlayer'), t('setDevPlayerHint'), h('div', { class: 'pl-seg set-seg' }, playerChoices().map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); X.reload(); } }, l)))),
      X.toggle(t('plAutoNext'), 'pl_autoNext', t('plAutoNextHint')), X.toggle(t('plAutoSkip'), 'pl_autoSkip', t('plAutoSkipHint')), h('p', { class: 'set-hint' }, h('a', { href: '#', onclick: e => { e.preventDefault(); X.go('player'); } }, t('setPlayer') + ' ›'))] },
    /* library and connections */
    { id: 'lb', g: 'lib', ic: '🟢', hue: '#00b020', name: 'ftLbN', desc: 'ftLbD', art: 'lb', avail: lbOn, on: () => lbOn() && !!lbUser(), tab: 'services', actionLbl: 'ftGoServices' },
    { id: 'arch', g: 'lib', ic: '📦', hue: '#f5b301', name: 'ftArchN', desc: 'ftArchD', art: 'arch', avail: () => optOn('archive'), on: () => optOn('archive'), open: '#/c/archive' },
    { id: 'store', g: 'lib', ic: '💾', hue: '#64d2ff', name: 'ftStoreN', desc: 'ftStoreD', art: 'store', avail: () => !!(C.status && C.status.admin) && feat('storage'), on: () => true, noPill: true, open: '#/c/storage' },
    /* menu */
    { id: 'pages', g: 'menu', ic: '🧭', hue: '#34c759', name: 'ftPagesN', desc: 'ftPagesD', art: 'pages', on: () => true, noPill: true, startOpen: true, opts: () => [pageChips(), h('p', { class: 'set-hint' }, t('ftReload') + ' · ', h('a', { href: '#', onclick: e => { e.preventDefault(); location.reload(); } }, t('ftReloadDo')))] }
  ];
}
const FT = { open: new Set(), q: '', f: 'all' };
const ftNeedsOk = f => (f.needs || []).every(n => SVC[n]()) && (!f.needsFeat || feat(f.needsFeat));
function ftAvail(f) { const base = f.avail ? f.avail() : (!f.feat || feat(f.feat)); return base && !(f.nav && adminHidden(f.nav)) && ftNeedsOk(f); }
function ftOn(f) { return ftAvail(f) && (f.key ? !!cfg(f.key) : f.nav ? navOn(f.nav) : (f.on ? f.on() : true)); }
function ftLockText(f) { const miss = (f.needs || []).filter(n => !SVC[n]()); if (miss.length) return t('ftNeeds') + ' ' + miss.map(n => t(SVC_N[n])).join(', '); if (f.needsFeat && !feat(f.needsFeat)) return t('ftLocked'); return f.avail ? t('ftNoSrv') : t('ftLocked'); }
/* the switch of one feature: a user setting or a menu entry */
function ftSwitch(f, onset) {
  if (f.key) { const b = h('button', { class: 'set-switch' + (cfg(f.key) ? ' on' : ''), role: 'switch', onclick: async () => { const v = !cfg(f.key); b.classList.toggle('on', v); await saveCfg({ [f.key]: v }); onset && onset(v); } }, h('i')); return b; }
  if (f.nav) { const b = h('button', { class: 'set-switch' + (navOn(f.nav) ? ' on' : ''), role: 'switch', onclick: async () => { const s = new Set(CFGU.navHide || []); const nowOn = navOn(f.nav); nowOn ? s.add(f.nav) : s.delete(f.nav); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !nowOn); onset && onset(!nowOn); } }, h('i')); return b; }
  return null;
}
function featuresTab(X) {
  const cat = featCatalog(X); const root = h('div', {});
  const needs = f => (f.needs || []).length ? h('div', { class: 'ft-needs' }, f.needs.map(n => h('i', { class: SVC[n]() ? 'ok' : 'bad' }, (SVC[n]() ? ' ' : ' ') + t(SVC_N[n])))) : null;
  function apply() {
    let any = false;
    $$('.ft-card', root).forEach(c => { const hit = (!FT.q || c.dataset.s.includes(FT.q)) && (FT.f === 'all' || (FT.f === 'on') === c.classList.contains('on')); c.hidden = !hit; if (hit) any = true; });
    $$('.ft-sec', root).forEach(s => { s.hidden = !$$('.ft-card:not([hidden])', s).length; }); const n = $('.ft-none', root); if (n) n.hidden = any;
  }
  const q = h('input', { type: 'search', class: 'ft-search', placeholder: t('ftSearch'), value: FT.q, oninput: e => { FT.q = e.target.value.trim().toLowerCase(); apply(); } });
  const chips = h('div', { class: 'ft-fchips' }, [['all', t('ftAll')], ['on', t('ftShowOn')], ['off', t('ftShowOff')]].map(([v, l]) => h('button', { class: 'nf-chip' + (FT.f === v ? ' on' : ''), onclick: e => { FT.f = v; $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); apply(); } }, l)));
  root.append(h('div', { class: 'ft-head' }, h('p', {}, t('ftIntro')), h('button', { class: 'btn grey', style: 'height:38px', onclick: () => onboardWizard(true) }, ic('refresh', 'ic-s'), t('ftRunSetup'))), h('div', { class: 'ft-bar' }, h('div', { class: 'dc-q' }, ic('search', 'ic-s'), q), chips));
  GROUPS.forEach(([id, e, name, desc]) => {
    const list = cat.filter(f => f.g === id); if (!list.length) return; const grid = h('div', { class: 'ft-grid' }); list.forEach(f => grid.append(ftCard(f, X, needs)));
    root.append(h('section', { class: 'ft-sec' }, h('div', { class: 'ft-sh' }, h('div', {}, h('h3', {}, t(name)), h('p', {}, t(desc)))), grid));
  });
  root.append(h('div', { class: 'nf-empty ft-none', hidden: true }, t('ftNone'))); apply(); return [root];
}
function ftCard(f, X, needsEl) {
  const avail = ftAvail(f); const openNow = avail && (FT.open.has(f.id) || (f.startOpen && !FT.open.has('-' + f.id)));
  const card = h('div', { class: 'ft-card' + (ftOn(f) ? ' on' : '') + (avail ? '' : ' locked') + (openNow ? ' open' : ''), style: '--hue:' + f.hue, 'data-s': (t(f.name) + ' ' + t(f.desc)).toLowerCase() });
  const pill = h('span', { class: 'ft-pill' });
  const setPill = () => { pill.textContent = !avail ? ftLockText(f) : f.noPill ? '' : ftOn(f) ? t('ftOn') : t('ftOff'); card.classList.toggle('on', ftOn(f)); }; setPill();
  const foot = h('div', { class: 'ft-foot' });
  if (avail) { const sw = ftSwitch(f, () => setPill()); if (sw) foot.append(sw); }
  const opts = avail && f.opts ? f.opts() : null;
  if (opts) foot.append(h('button', { class: 'ft-more', onclick: () => { const open = !card.classList.contains('open'); card.classList.toggle('open', open); open ? (FT.open.add(f.id), FT.open.delete('-' + f.id)) : (FT.open.delete(f.id), FT.open.add('-' + f.id)); } }, t('ftOptions'), ic('down', 'ic-s')));
  if (avail && f.tab) foot.append(h('button', { class: 'ft-more', onclick: () => X.go(f.tab) }, t(f.actionLbl || 'ftManage'), ic('right', 'ic-s')));
  if (avail && f.open) foot.append(h('a', { class: 'ft-more go', href: f.open }, t('ftOpen'), ic('right', 'ic-s')));
  card.append(h('div', { class: 'ft-art' }, FART[f.art](), h('span', { class: 'ft-ic' }, f.ic)), h('div', { class: 'ft-body' }, h('div', { class: 'ft-title' }, h('b', {}, t(f.name)), pill), h('p', {}, t(f.desc)), needsEl ? needsEl(f) : null, foot), ...(opts ? [h('div', { class: 'ft-opts' }, opts.filter(Boolean))] : []));
  return card;
}

/* ----- first-run setup: walks through everything, step by step ----- */
function maybeOnboard() {
  try { if (TVM || CFGU.onb === 1 || devGet('noonb') === '1' || $('.cxd-bg')) return; if (/video|login|wizard/.test(location.hash)) return; } catch (e) { return; }
  onboardWizard(false);
}
function onboardWizard(manual) {
  if ($('.ob-dlg')) return; const d = cxDialog('', { wide: false }); d.el.classList.add('ob-dlg'); let step = 0; saveCfg({ onb: 1 });
  const X = { sw: null, row: () => null, seg: () => null, toggle: () => null, go: () => { }, reload: () => { } };
  const cat = () => featCatalog(X); const find = ids => cat().filter(f => ids.includes(f.id) && ftAvail(f));
  const rowOf = f => { const sw = ftSwitch(f, v => row.classList.toggle('on', v)); const row = h('div', { class: 'ob-f' + (ftOn(f) ? ' on' : ''), style: '--hue:' + f.hue }, h('div', { class: 'ob-fa' }, FART[f.art](), h('span', { class: 'ft-ic' }, f.ic)), h('div', { class: 'ob-ft' }, h('b', {}, t(f.name)), h('small', {}, t(f.desc))), sw); return row; };
  const seg = (opts, key) => h('div', { class: 'pl-seg set-seg' }, opts.map(([v, l]) => h('button', { class: String(cfg(key)) === String(v) ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ [key]: v }); } }, l)));
  const lab = txt => h('div', { class: 'ob-lab' }, txt);
  /* every step is built when it is shown and skipped when the server offers nothing there */
  const STEPS = {
    welcome: () => ({ first: true, body: h('div', { class: 'ob-body ob-welcome' }, h('div', { class: 'ob-logo' }, BRAND.toUpperCase()), h('h2', {}, t('obWelcome')), h('p', { class: 'ob-sub' }, t('obWelcomeSub')), h('div', { class: 'ob-hi' }, [[null, 'obHi1', 'obHi1d', true], [null, 'obHi2', 'obHi2d', feat('discover') || feat('requests')], [null, 'obHi3', 'obHi3d', feat('music')], [null, 'obHi4', 'obHi4d', feat('quiz') || feat('wrapped')]].filter(x => x[3]).map(([e, a, b]) => h('div', {}, h('div', {}, h('b', {}, t(a)), h('small', {}, t(b))))))) }),
    look: () => {
      const SZ = { s: .8, m: 1, l: 1.25 }; const prev = h('div', { class: 'ob-prev' }, [0, 1, 2, 3].map(i => h('div', { class: 'ob-pc', style: '--h:' + (i * 70 + 10) }, h('i')))); prev.style.setProperty('--sz', SZ[cfg('cardSize')] || 1);
      const sw = h('div', { class: 'set-sw ob-sw' }, ['#e50914', '#ff6a3d', '#f5b301', '#34c759', '#0a84ff', '#8b5cf6', '#ff2d92', '#ffffff'].map(c => h('button', { style: 'background:' + c, class: cfg('accent') === c ? 'on' : '', 'aria-label': c, onclick: async e => { await saveCfg({ accent: c }); $$('button', sw).forEach(b => b.classList.toggle('on', b === e.currentTarget)); } })));
      const sz = h('div', { class: 'pl-seg set-seg' }, [['s', t('small')], ['m', t('medium')], ['l', t('large')]].map(([v, l]) => h('button', { class: cfg('cardSize') === v ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ cardSize: v }); prev.style.setProperty('--sz', SZ[v]); } }, l)));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obLook')), h('p', { class: 'ob-sub' }, t('obLookSub')), lab(t('accent')), sw, lab(t('setCardSize')), sz, prev) };
    },
    menu: () => {
      const entries = NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k) && !((k === 'discover' || k === 'requests') && !SVC.seerr()) && !(k === 'calendar' && !SVC.arr())); if (entries.length < 2) return null; const hidden = k => (CFGU.navHide || []).includes(k);
      const chips = h('div', { class: 'ob-chips' }, entries.map(([k]) => { const b = h('button', { class: 'nf-chip' + (hidden(k) ? '' : ' on'), onclick: async () => { const s = new Set(CFGU.navHide || []); hidden(k) ? s.delete(k) : s.add(k); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !hidden(k)); } }, navLabel(k)); return b; }));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obMenu')), h('p', { class: 'ob-sub' }, t('obMenuSub')), chips) };
    },
    browse: () => {
      const fs = find(['hero', 'peek', 'inf', 'tonight', 'reco']); const seen = h('div', { class: 'ob-seen' }, lab(t('obSeenT')), seg([['badge', t('rcSeenBadge')], ['hide', t('rcSeenHide')], ['off', t('rcSeenOff')]], 'homeSeen'), h('small', {}, t('rcSeenHint')));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obBrowse')), h('p', { class: 'ob-sub' }, t('obBrowseSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf)), seen) };
    },
    detail: () => {
      const fs = find(['sim', 'rate', 'info', 'menu', 'plug']); const pl = feat('ownPlayer') ? h('div', { class: 'ob-seen' }, lab(t('setDevPlayer')), h('div', { class: 'pl-seg set-seg' }, playerChoices().map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); } }, l))), h('small', {}, t('setDevPlayerHint'))) : null; if (!fs.length && !pl) return null;
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obDetail')), h('p', { class: 'ob-sub' }, t('obDetailSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf)), pl) };
    },
    music: () => { if (!feat('music') || adminHidden('music')) return null; const fs = find(['lyr', 'md', 'mr']); if (!fs.length) return null; return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obMusic')), h('p', { class: 'ob-sub' }, t('obMusicSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf))) }; },
    learn: () => {
      const parts = [];
      if (cfg('quiz')) { const presets = [['obRelaxed', 'obRelaxedD', 5, 50, ''], ['obSteady', 'obSteadyD', 10, 100, ''], ['obKeen', 'obKeenD', 20, 200, '']]; const cur = () => presets.findIndex(p => +cfg('quizNew') === p[2] && +cfg('quizGoal') === p[3]);
        const cards = h('div', { class: 'ob-presets' }, presets.map(([a, b, n, g, e], i) => h('button', { class: 'ob-preset' + (cur() === i ? ' on' : ''), onclick: async () => { await saveCfg({ quizNew: n, quizGoal: g }); $$('.ob-preset', cards).forEach((x, k) => x.classList.toggle('on', k === i)); } }, h('b', {}, t(a)), h('small', {}, t(b))))); parts.push(lab(t('obQuizPace')), cards); }
      if (cfg('wrapped')) parts.push(lab(t('wrBanner')), seg([['auto', t('wrBSeason')], ['always', t('wrBAlways')], ['never', t('wrBNever')]], 'wrappedBanner'));
      if (optOn('letterboxd')) parts.push(h('div', { class: 'ob-lb' }, lab(t('obLbT')), h('input', { type: 'text', value: lbUser(), placeholder: 'username', maxlength: 40, onchange: async e => { const v = e.target.value.trim().replace(/^@/, '').replace(/^https?:\/\/letterboxd\.com\//, '').replace(/\/.*$/, ''); await saveCfg({ lbUser: v || null }); if (v) lbSync(true); } }), h('small', {}, t('obLbH'))));
      if (!parts.length) return null; return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obLearn')), h('p', { class: 'ob-sub' }, t('obLearnSub')), parts) };
    },
    done: () => {
      const feats = cat().filter(f => ftOn(f) && !f.noPill).length; const menu = NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k) && navOn(k)).length;
      return { last: true, body: h('div', { class: 'ob-body ob-welcome' }, h('div', { class: 'ob-big' }, ic('check')), h('h2', {}, t('obDone')), h('p', { class: 'ob-sub' }, t('obDoneSub')), h('div', { class: 'ob-sum' }, h('div', {}, h('b', {}, String(feats)), h('span', {}, t('obOnN'))), h('div', {}, h('b', {}, String(menu)), h('span', {}, t('obMenuN'))))) };
    }
  };
  const ORDER = ['welcome', 'look', 'menu', 'browse', 'detail', 'music', 'learn', 'done'];
  function draw() {
    const list = ORDER.map(k => STEPS[k]()).filter(Boolean); step = Math.min(step, list.length - 1); const cur = list[step]; d.setTitle(''); d.foot.replaceChildren();
    const dots = h('div', { class: 'ob-dots' }, list.map((_, i) => h('i', { class: i === step ? 'on' : i < step ? 'done' : '' })));
    const back = step ? h('button', { class: 'btn grey', onclick: () => { step--; draw(); } }, t('obBack')) : null;
    if (cur.first) d.foot.append(h('button', { class: 'btn grey', onclick: () => d.close() }, t('obSkip')), h('button', { class: 'btn white', onclick: () => { step++; draw(); } }, t('obStart')));
    else if (cur.last) d.foot.append(back, h('button', { class: 'btn white', onclick: () => d.close() }, ic('check'), t('obFinish')));
    else d.foot.append(back, h('button', { class: 'btn white', onclick: () => { step++; draw(); } }, t('obNext')));
    d.body.replaceChildren(dots, cur.body); d.body.classList.add('ob-wrap'); d.body.scrollTop = 0;
    d.foot.prepend(h('span', { class: 'ob-step' }, t('obStep').replace('{n}', step + 1).replace('{t}', list.length)));
  }
  draw();
}
