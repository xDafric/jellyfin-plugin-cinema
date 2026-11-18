# Cinema Desktop (Tauri 2)

Desktop shell around the Jellyfin web UI with the Cinema overlay. Phase 3 of `PLATFORM.md`, version 0.1 (Windows first).

## What it does
- First start: asks for the server address, checks it via `GET /System/Info/Public`, saves it (`%APPDATA%\net.dafric.cinema.desktop\config.json`), restarts and loads `<server>/web/index.html`. Tray menu "Change server..." resets it.
- Token: the Jellyfin web client keeps its session in `localStorage["jellyfin_credentials"]`. The shell intercepts that key, so it lives only in memory and in the OS keystore (Windows Credential Manager, macOS Keychain, Secret Service) via the `keyring` crate. It is injected back before the page starts. An old value found in `localStorage` is migrated and removed.
- Window size, position, maximised and full screen state are remembered (window-state plugin). F11 toggles full screen.
- Media keys (play/pause, stop, next, previous) are global shortcuts. They dispatch a cancelable `cinema-media-key` event (`detail`: `playpause|stop|next|previous`) on `window`; if the UI does not call `preventDefault()`, play/pause and stop act on the first `<video>`/`<audio>` element. WebView2's own media key handling is disabled to avoid double triggering.
- Tray icon: open, toggle full screen, change server, quit. Closing the window quits the app.
- Deep links: `cinema://item/<id>`, `cinema://c/<page>`, `cinema://home` (single instance, the running window navigates).
- Security: navigation is limited to the configured server origin (other links open in the system browser, http/https only). IPC is granted only to that origin through a runtime capability, and each command re-checks the caller origin. No remote debugging port in release builds.

## `window.CinemaNative` (apiLevel 1)
Only injected on the server origin; the UI feature-detects it.

| Member | Behaviour in 0.1 |
|---|---|
| `capabilities()` | `{apiLevel:1, platform:'desktop', os, appVersion, player:'browser', nativePlayer:false, download:false, mediaKeys:true, deepLink:true, openExternal:true, exit:true, fullscreen:true}` |
| `play(item, startTicks, opts)` | returns `false`: the UI plays with its own `<video>`. Returns `true` once libmpv is added (`player:'mpv'`) |
| `stop()` | returns `false` (nothing native playing) |
| `openExternal(url)` | opens http(s) URLs in the system browser, returns boolean |
| `exit()` | quits the app |
| `setFullscreen(on?)` | window full screen for the video player: `true`/`false`, or no argument to toggle. Resolves to the previous state so the player can restore it |

Not implemented yet (capability flags are `false`): `download`, `downloads`, `setBrightness/setVolume`. The UI hands playback to `CinemaNative.play()` and falls back to its own `<video>` player when that returns `false`.

## Build (Windows)
Prerequisites: Node 22, Rust stable (MSVC toolchain), Visual Studio Build Tools with the C++ workload, WebView2 (included in Windows 11).
```
cd desktop
npm install
npm run tauri build
```
Output: `src-tauri/target/release/bundle/nsis/Cinema_0.1.0_x64-setup.exe` (per-user install, no admin needed, registers `cinema://`). For an MSI add `"msi"` to `bundle.targets` in `src-tauri/tauri.conf.json` or run `npm run tauri build -- --bundles msi` (downloads WiX). `npm run tauri dev` runs it with live Rust rebuilds. `npm run icons` regenerates icons from `app-icon.png` (use a 1024 px PNG for best results).

## Updates (to set up before the first public release)
Uses `tauri-plugin-updater` with signed manifests. Not enabled in 0.1 because it needs a key pair.
1. Generate the key once: `npx tauri signer generate -w %USERPROFILE%\.tauri\cinema.key`. Keep the private key and password secret (repository secrets `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`).
2. Add the plugin (`cargo add tauri-plugin-updater`, `npm i @tauri-apps/plugin-updater` only if called from JS) and in `tauri.conf.json`:
```json
"bundle": { "createUpdaterArtifacts": true },
"plugins": { "updater": {
  "pubkey": "<contents of cinema.key.pub>",
  "endpoints": ["https://jellyfin.dafric.net/Cinema/app/manifest/desktop-{{target}}-{{arch}}"],
  "windows": { "installMode": "passive" }
} }
```
3. Building with the key set in the environment writes `Cinema_<v>_x64-setup.exe` plus `.exe.sig`.
4. The endpoint (served by the plugin's `/Cinema/app/manifest`) returns, per target:
```json
{ "version": "0.2.0", "notes": "What changed", "pub_date": "2026-12-01T12:00:00Z",
  "platforms": { "windows-x86_64": { "signature": "<content of the .sig file>", "url": "https://github.com/.../Cinema_0.2.0_x64-setup.exe" } } }
```
The updater refuses any package whose signature does not match `pubkey`, so the manifest host does not have to be trusted for integrity.

## Signing the installer
Update signing (above) is separate from Windows code signing. Without an Authenticode certificate the NSIS installer is unsigned and SmartScreen shows "Unknown publisher" (More info, Run anyway). With a certificate set `bundle.windows.certificateThumbprint` (or `signCommand` for a cloud/HSM signer) and `timestampUrl` in `tauri.conf.json`; Tauri signs the app and the installer during `tauri build`. macOS needs an Apple developer account for notarisation; Linux needs no signing.

## Layout
- `ui/` server selection page (plain HTML/JS, no bundler)
- `src-tauri/src/lib.rs` window, commands, keystore, tray, media keys, deep links
- `src-tauri/src/cinema-native.js` injected bridge and credential interception
- `src-tauri/capabilities/default.json` local page permissions; the server origin gets its runtime capability in `build_window`

## Next (Desktop 1.0)
libmpv player behind `CinemaNative.play`, now-playing in the tray, global hotkeys, auto start option, updater, macOS and Linux bundles.
