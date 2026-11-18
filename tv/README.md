# Cinema TV (Android TV / Chromecast with Google TV)

Remote-controlled client for the Cinema Jellyfin plugin. The interface is the same web UI as on desktop and phone
(served by the plugin, in TV mode with D-pad navigation); video is played by a native ExoPlayer screen.

* Install: sideload `releases/CinemaTV-1.2.0.apk` (e.g. with the "Downloader" app, or `adb install`).
* First start: enter the server address (servers on your network are listed), then sign in with Quick Connect
  (Jellyfin → Settings → Quick Connect on your phone) or with your password.
* Needs the Cinema plugin 1.1.6.0 or newer on the server.
* Remote: arrows move focus, OK selects, Back goes back (Back on the home screen exits). In the player: left/right seek,
  OK pauses and shows the controls, up/down shows the controls, Menu button opens the account menu in the app.

Build: `./gradlew assembleRelease` (JDK 17+, Android SDK 35). The signing keystore is not part of the repository.

## 2.1.0: player
- Up next: a card with the next episode appears when the credits start (Jellyfin `Outro` media segment) or 20 s before the end, counts down 10 s and plays it. "Watch credits" hides it for this episode (no autoplay at the end). Remote: left/right between the buttons, OK presses, Back dismisses.
- Audio and subtitle language chosen in the player is remembered per series and applied to the following episodes (also to server transcodes for audio).
- Skip button for intros, recaps and credits (credits only when no next episode follows).

## 2.0.0: one APK for TV, phone and tablet
`UiMode` (UiModeManager) picks the interface at start. TV mode is unchanged. Phone/tablet mode loads the responsive web UI (no `cx-tv`, bridge `window.CinemaNative`),
with touch player (edge swipes for brightness/volume, double tap +-10 s, pinch fit/fill, timeline drag, picture in picture), media notification/lock-screen
controls (video and music), offline downloads (Media3 DownloadManager + WorkManager, Wi-Fi-only option, Downloads page in the web UI) and an update hint from the GitHub release list.
The Downloads page and music notification need the plugin build containing the new `src/appnative.js` (`node build.js`).
