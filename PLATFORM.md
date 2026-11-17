# Cinema platform: native apps

Decision: **shell apps around the shared web UI** (the Cinema overlay served by the plugin), with native players and system integration as plugins. One UI codebase, three delivery targets. Order: TV, then Android phone/tablet, then desktop. iOS is out of scope for now.

```
                ┌──────────────── Jellyfin server + Cinema plugin ────────────────┐
                │  /Cinema/ui.js (UI)   /Cinema/* (API)   /Cinema/app/manifest    │
                └───────────────┬───────────────────────┬─────────────────────────┘
                                │                       │
        ┌───────────────────────┴───────┐     ┌─────────┴──────────┐
        │ Android app (one APK)         │     │ Desktop (Tauri)    │
        │  - phone/tablet UI mode       │     │  - WebView2/WKWebView
        │  - TV mode (Leanback, D-pad)  │     │  - mpv/libmpv player│
        │  - WebView shell + Media3     │     │  - tray, media keys │
        └───────────────────────────────┘     └────────────────────┘
```

## Shared contract (build once, used by all shells)
- **Native bridge** `window.CinemaNative` with a stable, versioned interface: `play(item, startTicks, opts)`, `stop()`, `capabilities()`, `download(item)`, `downloads()`, `setBrightness/Volume`, `openExternal(url)`, `exit()`. The web UI feature-detects it, so the same UI runs in a plain browser.
- **Server pairing:** first start asks for the server address, then Jellyfin Quick Connect or user/password. Token is stored in the platform keystore, never in the WebView.
- **Self update:** the plugin publishes `/Cinema/app/manifest` (latest version per platform, checksum, release notes). Apps check it and prompt; Android installs via the package installer, desktop via Tauri updater.
- **Crash and diagnostics:** local ring buffer log, "Copy diagnostics" button in settings (no telemetry leaves the device).

## Phase 1: TV stabilisation (1.x of the TV app)
Goal: no freezes, no decoder surprises, predictable D-pad.
- Memory: cap WebView image cache, drop page while the native player runs (already), watchdog that reloads the page when the renderer dies (`onRenderProcessGone`).
- Player: one `PlayerController` shared by TV and phone (Media3 1.5+), hardware decoder first, software only as an explicit retry, track selection UI, audio passthrough option, resume position sync to Jellyfin every 10 s, error report screen with "retry / transcode / close".
- Navigation: back stack handled natively (back from player returns to the same hash), focus restore after dialogs, long-press for context menu.
- Test matrix: Android 9, 11, 14 emulators, a low-RAM profile (1.5 GB), Chromecast with Google TV and Shield on hardware.
- Done when: 8 h soak test without a crash, 50 start/stop cycles of the player without memory growth, cold start under 4 s.

## Phase 2: Android phone and tablet
- Same module as TV: `UiMode` decided at start (`UiModeManager`), manifest declares both `LAUNCHER` and `LEANBACK_LAUNCHER`.
- Touch: gestures in the player (swipe volume/brightness, double tap seek, pinch to fit), picture in picture, orientation handling, system back gesture.
- Offline: download manager (WorkManager, resumable, Wi-Fi only option) writing to app storage, `downloads` page in the UI backed by the bridge, offline playback through Media3 cache/`DownloadService`.
- System: media notification and lock-screen controls (MediaSession), Android Auto not planned, Chromecast sender (Cast SDK) as an option.
- Release: signed APK on GitHub releases, in-app update; Play Store later (needs privacy policy and review).

## Phase 3: Desktop (Windows, macOS, Linux)
- **Tauri 2** shell (small installers, system WebView). Alternatives rejected: Electron (size), native toolkits (duplicate UI).
- Playback through **libmpv** embedded (HDR, all codecs, direct play) behind the same `CinemaNative.play` contract; browser `<video>` fallback if mpv is unavailable.
- Desktop extras: media keys, tray with now playing, global hotkeys, window state, fullscreen/borderless, deep links `cinema://item/<id>`, auto start option.
- Installers: MSI/NSIS (Windows), DMG (macOS, notarisation needs an Apple developer account, otherwise unsigned with a documented workaround), AppImage and deb (Linux). Auto update via Tauri updater with signed manifests.

## Cross-cutting
- **Versioning:** apps follow `appVersion` independent of the plugin; the bridge has `apiLevel`; the UI refuses features the shell does not advertise.
- **Security:** WebView restricted to the configured server origin, `setAllowFileAccess(false)`, no remote debugging in release, bridge methods validate arguments, tokens in Keystore/Keychain/Credential Manager.
- **CI:** GitHub Actions builds Android (Gradle), desktop (Tauri matrix), signs with repository secrets, uploads release assets, and updates the manifest.
- **Docs:** one page per platform (install, update, troubleshooting).

## Milestones
| Version | Content |
|---|---|
| TV 1.4 | Stability pass, watchdog, shared PlayerController, soak-tested |
| App 2.0 | One Android app for phone, tablet and TV, bridge v1, self update |
| App 2.1 | Downloads, PiP, MediaSession, Cast |
| Desktop 0.1 | Tauri shell, login, browser player, installers (Windows first) |
| Desktop 1.0 | libmpv player, media keys, tray, auto update on all three systems |
