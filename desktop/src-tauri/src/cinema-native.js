// Injected before any page script. Runs only on the configured server origin.
// window.__CINEMA_CFG is prepended by the Rust side: { origin, appVersion, platform, creds }.
(function () {
  var cfg = window.__CINEMA_CFG;
  if (!cfg || location.origin !== cfg.origin) return;
  var internals = window.__TAURI_INTERNALS__;
  function call(cmd, args) {
    try { return internals.invoke(cmd, args || {}); } catch (e) { return Promise.reject(e); }
  }

  // ---- Token storage: jellyfin_credentials lives in memory + OS keystore, never in localStorage ----
  var KEY = 'jellyfin_credentials';
  var mem = cfg.creds || null;
  var P = Storage.prototype, rawGet = P.getItem, rawSet = P.setItem, rawRemove = P.removeItem;
  try {
    var legacy = rawGet.call(localStorage, KEY);
    if (legacy) { if (!mem) { mem = legacy; call('store_credentials', { value: mem }).catch(function () { }); } rawRemove.call(localStorage, KEY); }
  } catch (e) { }
  P.getItem = function (k) { if (this === localStorage && k === KEY) return mem; return rawGet.apply(this, arguments); };
  P.setItem = function (k, v) {
    if (this === localStorage && k === KEY) { mem = String(v); call('store_credentials', { value: mem }).catch(function () { }); return; }
    return rawSet.apply(this, arguments);
  };
  P.removeItem = function (k) {
    if (this === localStorage && k === KEY) { mem = null; call('clear_credentials').catch(function () { }); return; }
    return rawRemove.apply(this, arguments);
  };

  // ---- CinemaNative bridge (apiLevel 1) ----
  var caps = {
    apiLevel: 1,
    platform: 'desktop',
    os: cfg.os,
    appVersion: cfg.appVersion,
    player: 'browser',       // 'mpv' once libmpv lands
    nativePlayer: false,
    download: false,
    mediaKeys: true,
    deepLink: true,
    openExternal: true,
    exit: true
  };
  var bridge = {
    capabilities: function () { return JSON.parse(JSON.stringify(caps)); },
    // No native player yet: returning false tells the UI to use its own <video> player.
    play: function (item, startTicks, opts) { return false; },
    stop: function () { return false; },
    openExternal: function (url) {
      try {
        var u = new URL(String(url), location.href);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
        call('open_external', { url: u.href }).catch(function () { });
        return true;
      } catch (e) { return false; }
    },
    exit: function () { call('exit_app').catch(function () { }); }
  };
  Object.defineProperty(window, 'CinemaNative', { value: Object.freeze(bridge), configurable: false });

  // ---- Media keys (pushed by Rust) and F11 ----
  // Detached media elements (new Audio()) are not in the DOM: remember the last one that played.
  var lastMedia = null, rawPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { lastMedia = this; return rawPlay.apply(this, arguments); };
  // Skip works with any UI version: the UI registers Media Session handlers, we call them.
  var msHandlers = {};
  try {
    var rawSet = MediaSession.prototype.setActionHandler;
    MediaSession.prototype.setActionHandler = function (a, h) { msHandlers[a] = h; return rawSet.apply(this, arguments); };
  } catch (e) { }
  window.__cinemaMediaKey = function (action) {
    var ev = new CustomEvent('cinema-media-key', { detail: action, cancelable: true });
    if (!window.dispatchEvent(ev)) return;
    if (typeof window.cxMedia === 'function' && window.cxMedia(action) !== false) return;
    var ms = { next: 'nexttrack', previous: 'previoustrack' }[action];
    if (ms) { if (typeof msHandlers[ms] === 'function') { try { msHandlers[ms]({ action: ms }); } catch (e) { } } return; }
    var m = lastMedia && !lastMedia.ended && (lastMedia.currentSrc || lastMedia.src) ? lastMedia : document.querySelector('video, audio');
    if (!m) return;
    if (action === 'playpause') { if (m.paused) m.play(); else m.pause(); }
    else if (action === 'stop') { m.pause(); }
  };
  window.addEventListener('keydown', function (e) {
    if (e.key === 'F11') { e.preventDefault(); call('toggle_fullscreen').catch(function () { }); }
  }, true);
})();
