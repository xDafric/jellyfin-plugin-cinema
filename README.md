# Jellyfin Cinema

A Netflix and Spotify style interface for Jellyfin 12, with a server plugin that connects Seerr, Radarr, Sonarr and Aurral.

- Netflix-style home, movie, show and cast pages, with a preview card on hover and a menu for editing metadata and images.
- Spotify-style music app with its own player, playlists, queue and search.
- Watchlist, Seerr discovery and requests, download progress, release calendar, music requests through Aurral.
- Home sections you can reorder and add to, stored per user.
- Film Quiz (`#/c/quiz`): learn the actors from the films you watched (Jellyfin and Letterboxd) with spaced repetition, several games, levels, streaks and badges. Progress is stored per user.
- Cinema Wrapped (`#/c/wrapped`): your viewing year as a story with a share image and a home page banner around the turn of the year.
- Storage assistant (`#/c/storage`, administrators): free space, biggest movies, growth forecast and clean-up suggestions with bulk archive.
- Requests page with status steps and live download progress, personalised Discover rows (labelled on the home page), "What shall we watch tonight?", and a calendar with download and watch history.
- Settings with a Features gallery (illustrations, options per feature) and a first-run setup wizard; the server page lists every feature with its defaults.

Needs Jellyfin 12.4. No other plugin is required: Cinema loads its interface itself before the page renders.

## Downloads
Everything is in one place: the [latest release](https://github.com/xDafric/jellyfin-plugin-cinema/releases/latest) holds the plugin zip, the Android app (phone, tablet, TV) and the Windows installer, with checksums. The plugin is also installable through the repository below and is what the apps load their interface from, so install or update it first.

To publish all three together: build each part, then `python scripts/release.py v<suite version>`.

## Install through the plugin repository
1. Jellyfin Dashboard, Plugins, Repositories, add:
   `https://raw.githubusercontent.com/xDafric/jellyfin-plugin-cinema/main/manifest.json`
2. Catalog, install "Cinema", restart Jellyfin.
3. Dashboard, Plugins, Cinema: enter the URL and API key of each service and press "Test connection".
4. Reload the web client with Ctrl+Shift+R.

## Kill switch
Add `#nocinema` to the web address, or run `cinemaUI.off()` in the browser console. Disabling the plugin removes the interface.

## Build
```
node build.js
copy dist\cinema.js plugin\Jellyfin.Plugin.Cinema\Web\cinema.js
dotnet build plugin\Jellyfin.Plugin.Cinema -c Release
```
The interface source is in `src/`, the plugin in `plugin/`.

## Release a new version
1. Bump the version in `plugin/Jellyfin.Plugin.Cinema/Jellyfin.Plugin.Cinema.csproj` and in `meta.json`.
2. Zip the DLL and `meta.json` (no folder inside the zip) as `releases/Cinema_<version>.zip`.
3. Add a version entry with the zip's MD5 checksum to `manifest.json`.
