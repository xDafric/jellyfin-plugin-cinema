# Cinema TV (Android TV / Chromecast with Google TV)

Remote-controlled client for the Cinema Jellyfin plugin. The interface is the same web UI as on desktop and phone
(served by the plugin, in TV mode with D-pad navigation); video is played by a native ExoPlayer screen.

* Install: sideload `releases/CinemaTV-1.1.1.apk` (e.g. with the "Downloader" app, or `adb install`).
* First start: enter the server address (servers on your network are listed), then sign in with Quick Connect
  (Jellyfin → Settings → Quick Connect on your phone) or with your password.
* Needs the Cinema plugin 1.1.5.0 or newer on the server.
* Remote: arrows move focus, OK selects, Back goes back (Back on the home screen exits). In the player: left/right seek,
  OK pauses and shows the controls, up/down shows the controls, Menu button opens the account menu in the app.

Build: `./gradlew assembleRelease` (JDK 17+, Android SDK 35). The signing keystore is not part of the repository.
