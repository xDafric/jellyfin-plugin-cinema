/* ---------- Cinema video player v2: PlaybackInfo, direct play / HLS, custom controls, subtitles, skip intro, chapters ---------- */
const HLS_URLS = ['https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js', 'https://unpkg.com/hls.js@1.5.13/dist/hls.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.13/hls.min.js'];
let hlsLoading = null;
const loadHls = () => window.Hls ? Promise.resolve(window.Hls) : (hlsLoading || (hlsLoading = (async () => {
  for (const u of HLS_URLS) { try { await new Promise((res, rej) => { const s = document.createElement('script'); s.src = u; s.onload = res; s.onerror = () => { s.remove(); rej(new Error('x')); }; document.head.append(s); }); if (window.Hls) return window.Hls; } catch (e) { } }
  hlsLoading = null; throw new Error('hls.js failed to load');
})()));
const tok = () => ApiClient.accessToken();
const absUrl = u => /^https?:/i.test(u) ? u : ApiClient.serverAddress().replace(/\/$/, '') + (u.startsWith('/') ? u : '/' + u);
const withKey = u => /[?&](api_key|ApiKey)=/i.test(u) ? u : u + (u.includes('?') ? '&' : '?') + 'ApiKey=' + encodeURIComponent(tok());

/* player icons: clear, consistent set */
const PIC = {
  play: 'M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z', pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  vol: 'M4 9v6h4l5 4V5L8 9H4zm12.5 3a4 4 0 00-2-3.46v6.92a4 4 0 002-3.46zM14.5 4.3v2.1a6.5 6.5 0 010 11.2v2.1a8.5 8.5 0 000-15.4z', mute: 'M4 9v6h4l5 4V5L8 9H4zm11.6 3l2.2-2.2-1.4-1.4-2.2 2.2-2.2-2.2-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4z',
  cc: 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zm1.5 4.5v5h2.6v-1.3H8v-2.4h1.1V9.5H6.5zm6 0v5h2.6v-1.3H14v-2.4h1.1V9.5h-2.6z',
  audio: 'M12 3a9 9 0 00-9 9v6a3 3 0 003 3h1a1 1 0 001-1v-6a1 1 0 00-1-1H5v-1a7 7 0 0114 0v1h-3a1 1 0 00-1 1v6a1 1 0 001 1h1a3 3 0 003-3v-6a9 9 0 00-9-9z',
  gear: 'M19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-1.7-1L15 3.4h-4l-.4 2.6a7.4 7.4 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 001.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 001.7-1l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z',
  pip: 'M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm9 6h7v5h-7z', fs: 'M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z', fsx: 'M8 4h2v6H4V8h4V4zm6 0h2v4h4v2h-6V4zM4 14h6v6H8v-4H4v-2zm10 0h6v2h-4v4h-2v-6z',
  chap: 'M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z', next: 'M6 6.5v11a1 1 0 001.5.86L16 13.4V17h2V7h-2v3.6L7.5 5.64A1 1 0 006 6.5z', back: 'M15.5 5.5L9 12l6.5 6.5-1.5 1.5L6 12l8-8 1.5 1.5z', info: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  eps: 'M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h10v2H4v-2zm14-1.5l4 2.5-4 2.5v-5z', skip: 'M5 5l8 7-8 7V5zm9 0h2v14h-2V5z'
};
const PICMAP = { play: 'player-play', pause: 'player-pause', vol: 'volume', mute: 'volume-3', cc: 'badge-cc', audio: 'language', gear: 'settings', pip: 'picture-in-picture', fs: 'maximize', fsx: 'minimize', chap: 'list-details', next: 'player-skip-forward', back: 'chevron-left', info: 'info-circle', eps: 'list-numbers', skip: 'player-skip-forward' };
const PICFILL = { play: 1, pause: 1 };
function pic(name) { return luSvg(PICMAP[name] || 'player-play', PICFILL[name]); }
const skipLen = () => { const n = +pcfg('skipLen', 10); return [5, 10, 15, 30].includes(n) ? n : 10; };
function skipIcon(dir) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'lu lu-skip');
  const g = dir > 0 ? '<g>' : '<g transform="translate(24 0) scale(-1 1)">';
  s.innerHTML = g + '<path d="M14.74 4.98A8 8 0 1 1 9.26 4.98"/><path d="M12.3 3.9L10.1 7.4L8.4 2.5z" fill="currentColor"/></g><text class="skn" x="12.4" y="15.8" text-anchor="middle" font-size="7.6" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="currentColor" stroke="none" style="letter-spacing:-.03em">' + skipLen() + '</text>';
  return s;
}
const updSkipIcons = () => $$('.lu-skip .skn', PL.el || document).forEach(x => { x.textContent = skipLen(); });
const FIT = { contain: 'contain', cover: 'cover', fill: 'fill' };
const applyFit = () => { if (PL.v) PL.v.style.objectFit = FIT[pcfg('fit', 'contain')] || 'contain'; };
function applySubDelay() { const d = +(PL.subDelay || 0); const tr = PL.v && [...PL.v.textTracks].find(x => x.mode === 'hidden' || x.mode === 'showing'); if (!tr || !tr.cues) return; for (const c of tr.cues) { if (c._os == null) { c._os = c.startTime; c._oe = c.endTime; } c.startTime = Math.max(0, c._os + d); c.endTime = Math.max(.01, c._oe + d); } }

function deviceProfile() {
  const hevc = !PL.safe && !!(window.MediaSource && MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L120.90,mp4a.40.2"'));
  const vcodecs = 'h264' + (hevc ? ',hevc' : '');
  const tp = [];
  if (hevc) tp.push({ Container: 'mp4', Type: 'Video', AudioCodec: 'aac,mp3,opus,flac', VideoCodec: 'hevc,h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  tp.push({ Container: 'ts', Type: 'Video', AudioCodec: PL.safe ? 'aac' : 'aac,mp3', VideoCodec: 'h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: PL.safe ? '2' : '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  return { Name: 'Cinema', MaxStreamingBitrate: 120000000, MaxStaticBitrate: 100000000, MusicStreamingTranscodingBitrate: 384000,
    DirectPlayProfiles: [{ Container: 'mp4,m4v,mov', Type: 'Video', VideoCodec: vcodecs, AudioCodec: 'aac,mp3,opus,flac,vorbis' }, { Container: 'webm', Type: 'Video', VideoCodec: 'vp8,vp9,av1', AudioCodec: 'vorbis,opus' }],
    TranscodingProfiles: tp, ContainerProfiles: [],
    CodecProfiles: [{ Type: 'Video', Codec: 'h264', Conditions: [{ Condition: 'LessThanEqual', Property: 'VideoBitDepth', Value: '8', IsRequired: false }] }],
    SubtitleProfiles: [{ Format: 'vtt', Method: 'External' }] };
}

const QUALITIES = [['auto', 120000000], ['20', 20000000], ['8', 8000000], ['4', 4000000], ['1.5', 1500000]];
const PL = { el: null, v: null, hls: null, item: null, ms: null, psid: null, method: null, audio: null, sub: -1, started: false, lastRep: 0, idleT: 0, open: false, nextItem: null, segments: [], encodeSub: false, subTouched: false, speed: 1 };
const pcfg = (k, d) => (cfg('pl_' + k) != null ? cfg('pl_' + k) : d);
const psave = (k, v) => saveCfg({ ['pl_' + k]: v });

/* per-item state, reset for every movie or episode */
const freshItemState = () => ({ ms: null, audio: null, sub: -1, encodeSub: false, subTouched: false, forceTx: false, safe: false, netRetry: 0, prefDone: false, ncDismiss: false, ncStart: null, lastPos: 0, segments: [] });
/* audio and subtitle language chosen for a series, so the next episode keeps them */
const prefKey = it => it && it.SeriesId ? 'cx-pltr-' + it.SeriesId : null;
function trackPref(it) { const k = prefKey(it); if (!k) return {}; try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
function saveTrackPref(it, patch) { const k = prefKey(it); if (!k) return; try { localStorage.setItem(k, JSON.stringify(Object.assign(trackPref(it), patch))); } catch (e) { } }
const sameLang = (a, b) => !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();

async function openPlayer(it, startTicks) {
  closePlayer(true);
  Object.assign(PL, freshItemState(), { item: it, open: true, started: false, nextItem: null });
  buildPlayerUI(it);
  history.pushState({ cxplayer: 1 }, '');
  window.addEventListener('popstate', onPop); document.addEventListener('keydown', onKey, true);
  P.audio && !P.audio.paused && P.audio.pause();
  let full = it; try { full = await getItem(it.Id); } catch (e) { }
  PL.item = full; setTitle(full); loadNext(full); loadSegments(full); updMediaSession();
  await startStream(startTicks != null ? startTicks : (ud(full).PlaybackPositionTicks || 0));
}
async function startStream(startTicks, opts) {
  opts = opts || {}; const it = PL.item; setStatus(opts.status || t('plPreparing')); stopTimers(); detach();
  if (opts.forceTranscode) PL.forceTx = true; if (opts.safe) PL.safe = true;
  const forceTx = PL.forceTx; const gen = PL.gen = (PL.gen || 0) + 1;
  try {
    const qual = QUALITIES.find(x => x[0] === String(pcfg('quality', 'auto'))) || QUALITIES[0];
    const prof = deviceProfile(); prof.MaxStreamingBitrate = qual[1];
    const q = { UserId: uid(), StartTimeTicks: startTicks || 0, MaxStreamingBitrate: qual[1], AutoOpenLiveStream: true };
    if (PL.audio != null) q.AudioStreamIndex = PL.audio;
    if (PL.ms) q.MediaSourceId = PL.ms.Id;
    if (PL.encodeSub && PL.sub >= 0) q.SubtitleStreamIndex = PL.sub;
    const body = { DeviceProfile: prof }; if (forceTx) Object.assign(body, { EnableDirectPlay: false, EnableDirectStream: false });
    const info = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Items/' + it.Id + '/PlaybackInfo', q), data: JSON.stringify(body), contentType: 'application/json', dataType: 'json' });
    if (!PL.open || !PL.item || PL.item.Id !== it.Id || gen !== PL.gen) return;
    if (info.ErrorCode) throw new Error(info.ErrorCode);
    const ms = (info.MediaSources || [])[0]; if (!ms) throw new Error('No playable source');
    PL.ms = ms; PL.psid = info.PlaySessionId || ('cx' + Date.now());
    /* first stream of an episode: keep the audio language picked for this series */
    if (PL.audio == null && !PL.prefDone) {
      const want = trackPref(it).audio; const a = want && (ms.MediaStreams || []).find(s => s.Type === 'Audio' && sameLang(s.Language, want));
      if (a && a.Index !== ms.DefaultAudioStreamIndex) { PL.audio = a.Index; return startStream(startTicks, opts); }
    }
    if (PL.audio == null && ms.DefaultAudioStreamIndex != null) PL.audio = ms.DefaultAudioStreamIndex;
    let url, method;
    if (ms.SupportsDirectPlay && !forceTx && qual[0] === 'auto') { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid + (ms.ETag ? '&Tag=' + ms.ETag : ''); }
    else if (ms.TranscodingUrl) { method = /m3u8/.test(ms.TranscodingUrl) ? 'Transcode' : 'DirectStream'; url = absUrl(ms.TranscodingUrl); }
    else if (ms.SupportsDirectPlay) { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid; }
    else throw new Error('Server offered no stream');
    PL.method = method; PL.url = withKey(url);
    await attach(PL.url, startTicks ? startTicks / 1e7 : 0);
    if (gen !== PL.gen) return;
    buildTrackMenus(); buildChapters();
  } catch (e) { console.warn('[cinema player]', e); if (gen === PL.gen) showError(e.message || String(e)); }
}
async function attach(url, startSec) {
  const v = PL.v; v.removeAttribute('src'); v.load(); v.playbackRate = PL.speed;
  const isHls = /m3u8/i.test(url);
  const apple = /Apple/.test(navigator.vendor || '') && !/Chrome|Chromium|Edg/.test(navigator.userAgent);
  let HlsLib = null; if (isHls && !apple) { try { HlsLib = await loadHls(); if (!HlsLib.isSupported()) HlsLib = null; } catch (e) { HlsLib = null; } }
  if (isHls && (HlsLib || !v.canPlayType('application/vnd.apple.mpegurl'))) {
    const Hls = HlsLib || await loadHls(); if (!Hls.isSupported()) throw new Error('This browser cannot play HLS');
    const hls = new Hls({ startPosition: startSec || -1, maxBufferLength: 40, backBufferLength: 30, enableWorker: true, manifestLoadingMaxRetry: 3, levelLoadingMaxRetry: 3, fragLoadingMaxRetry: 4 });
    PL.hls = hls; let netRetry = 0, mediaRetry = 0;
    hls.on(Hls.Events.ERROR, (e, d) => { if (!d.fatal) return; if (d.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry++ < 3) { setStatus(t('plRetry')); hls.startLoad(); } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetry++ < 3) hls.recoverMediaError(); else escalate((d.details || 'Playback error') + (d.response && d.response.code ? ' (' + d.response.code + ')' : '')); });
    hls.loadSource(url); hls.attachMedia(v);
  } else { v.src = url; if (startSec) v.addEventListener('loadedmetadata', () => { v.currentTime = startSec; }, { once: true }); }
  try { await v.play(); } catch (e) { if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') throw e; }
}
function detach() { if (PL.hls) { try { PL.hls.destroy(); } catch (e) { } PL.hls = null; } if (PL.v) { PL.v.pause(); PL.v.removeAttribute('src'); PL.v.querySelectorAll('track').forEach(t_ => t_.remove()); } if (PL.subsEl) PL.subsEl.replaceChildren(); }
function stopTimers() { clearInterval(PL.statT); }
const ticks = () => Math.floor((PL.v ? PL.v.currentTime : 0) * 1e7);
function report(kind, extra) { if (!PL.item || !PL.ms) return; try { ApiClient['reportPlayback' + kind](Object.assign({ ItemId: PL.item.Id, MediaSourceId: PL.ms.Id, PlaySessionId: PL.psid, PlayMethod: PL.method || 'DirectPlay', PositionTicks: ticks(), IsPaused: PL.v ? PL.v.paused : false, CanSeek: true, AudioStreamIndex: PL.audio, SubtitleStreamIndex: PL.sub, QueueableMediaTypes: ['Video'] }, extra)); } catch (e) { } }
function closePlayer(silent) {
  if (!PL.open) return;
  if (PL.started) { report('Stopped'); try { if (PL.method === 'Transcode') ApiClient.stopActiveEncodings(PL.psid); } catch (e) { } }
  stopTimers(); detach(); if (PL.el) { PL.el.remove(); PL.el = null; PL.v = null; }
  window.removeEventListener('popstate', onPop); document.removeEventListener('keydown', onKey, true);
  if (PL.nfs) setNativeFs(false);
  if (PL.dfs && PL.dfsPrev === false) setDeskFs(false);
  PL.dfs = false; PL.dfsPrev = null; clearMediaSession();
  if (fsEl()) try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { }
  try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { }
  PL.open = false; PL.started = false; COVER.hide();
  if (!silent) setTimeout(() => refreshView(), 120);
}
function onPop() { closePlayer(); }
/* closing the tab or the app: save the position with a request that survives the page */
window.addEventListener('pagehide', () => {
  if (!PL.open || !PL.started || !PL.item || !PL.ms) return;
  try {
    const body = { ItemId: PL.item.Id, MediaSourceId: PL.ms.Id, PlaySessionId: PL.psid, PositionTicks: ticks(), PlayMethod: PL.method || 'DirectPlay' };
    fetch(withKey(ApiClient.getUrl('Sessions/Playing/Stopped')), { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => { });
    PL.started = false;
  } catch (e) { }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && PL.open && PL.started) report('Progress', { EventName: 'timeupdate' }); });
function backFromPlayer() { try { invalidatePages(true); } catch (e) { } if (history.state && history.state.cxplayer) history.back(); else closePlayer(); }

async function loadNext(it) {
  PL.nextItem = null; if (PL.el) PL.el.classList.remove('has-next');
  if (it.Type !== 'Episode' || !it.SeriesId) return;
  try { const r = await api('Shows/' + it.SeriesId + '/Episodes', { userId: uid(), startItemId: it.Id, limit: 2, Fields: F_BASE }); const n = (r.Items || []).find(x => x.Id !== it.Id); PL.nextItem = n || null; PL.el && PL.el.classList.toggle('has-next', !!n); updMediaSession(); } catch (e) { }
}
async function loadSegments(it) {
  PL.segments = [];
  try { const r = await api('MediaSegments/' + it.Id); PL.segments = (r.Items || []).map(s => ({ type: s.Type, start: s.StartTicks / 1e7, end: s.EndTicks / 1e7 })); } catch (e) { }
}
function playNextEp() {
  if (!PL.nextItem) return; const n = PL.nextItem;
  report('Stopped'); PL.started = false; Object.assign(PL, freshItemState(), { item: n });
  if (PL.el) $('.pl-nextcard', PL.el).classList.remove('show');
  setTitle(n); loadNext(n); loadSegments(n); updMediaSession();
  getItem(n.Id).then(f => { if (PL.item && PL.item.Id === f.Id) { PL.item = f; buildChapters(); updMediaSession(); } }).catch(() => { });
  startStream(0);
}
function playEpisode(ep) { PL.nextItem = ep; playNextEp(); }

/* ---------- UI helpers ---------- */
function setTitle(it) {
  if (!PL.el) return; const ep = it.Type === 'Episode';
  $('.pl-title', PL.el).textContent = ep ? (it.SeriesName || '') : it.Name;
  $('.pl-sub', PL.el).textContent = ep ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : [yearOf(it), it.OfficialRating, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : ''].filter(Boolean).join(' · ');
  $('.pl-btn-eps', PL.el).classList.toggle('hide', !ep);
}
function setStatus(msg) { if (!PL.el) return; PL.el.classList.remove('err'); PL.el.classList.add('loading'); $('.pl-status', PL.el).textContent = msg || ''; }
/* a failing stream never ends on the error screen straight away: direct play, then a transcode, then the safest transcode (H.264 + stereo AAC) */
function escalate(why) {
  if (!PL.open) return; const pos = Math.floor((PL.lastPos || (PL.v && PL.v.currentTime) || 0) * 1e7);
  if (!PL.forceTx) { console.warn('[cinema player] falling back to a server transcode:', why); startStream(pos, { forceTranscode: true, status: t('plFallback') }); }
  else if (!PL.safe) { console.warn('[cinema player] falling back to the safest transcode:', why); startStream(pos, { forceTranscode: true, safe: true, status: t('plFallback') }); }
  else showError(why);
}
function showError(msg) { if (!PL.el) return; PL.el.classList.remove('loading'); PL.el.classList.add('err'); $('.pl-errmsg', PL.el).textContent = msg; }
const closeMenus = () => PL.el && $$('.pl-menu', PL.el).forEach(m => m.classList.remove('open'));
function toggleMenu(cls) { const m = $(cls, PL.el); const was = m.classList.contains('open'); closeMenus(); if (!was) m.classList.add('open'); wake(); }
const mbtn = (label, on, fn, extra) => h('button', { class: on ? 'on' : '', onclick: fn }, h('span', {}, label), extra || null);
const fmtT = s => { s = Math.max(0, Math.floor(s || 0)); const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };

/* audio + subtitle menus */
function buildTrackMenus() {
  if (!PL.el || !PL.ms) return;
  const streams = PL.ms.MediaStreams || []; const audios = streams.filter(s => s.Type === 'Audio'); const subs = streams.filter(s => s.Type === 'Subtitle' && (s.DeliveryUrl || s.DeliveryMethod === 'Encode'));
  const am = $('.pl-menu-audio', PL.el), sm = $('.pl-menu-subs', PL.el);
  am.replaceChildren(h('div', { class: 'pl-mh' }, t('plAudio')), ...audios.map(a => mbtn(a.DisplayTitle || a.Language || ('#' + a.Index), a.Index === PL.audio, () => { if (a.Index === PL.audio) return; PL.audio = a.Index; if (a.Language) saveTrackPref(PL.item, { audio: a.Language }); closeMenus(); startStream(ticks()); })));
  sm.replaceChildren(h('div', { class: 'pl-mh' }, t('plSubs')), mbtn(t('plOff'), PL.sub === -1, () => setSub(-1)), ...subs.map(s => mbtn(s.DisplayTitle || s.Language || ('#' + s.Index), s.Index === PL.sub, () => setSub(s.Index), s.DeliveryMethod === 'Encode' ? h('small', {}, t('plBurn')) : null)), h('div', { class: 'pl-sep' }), mbtn(t('plSubStyle'), false, () => { closeMenus(); openSettings('subs'); }));
  $('.pl-btn-audio', PL.el).classList.toggle('hide', audios.length < 2); $('.pl-btn-subs', PL.el).classList.toggle('hide', !subs.length);
  if (PL.prefDone || PL.subTouched || PL.encodeSub || PL.sub !== -1) { PL.prefDone = true; return; }
  PL.prefDone = true;
  /* the subtitle choice made for this series wins over the file's default */
  const pref = trackPref(PL.item).sub;
  if (pref === 'off') return;
  const pick = pref && pref.lang ? (subs.find(s => sameLang(s.Language, pref.lang) && !!s.IsForced === !!pref.forced && s.DeliveryUrl) || subs.find(s => sameLang(s.Language, pref.lang) && s.DeliveryUrl) || subs.find(s => sameLang(s.Language, pref.lang)))
    : subs.find(s => s.DeliveryUrl && s.IsDefault);
  if (pick) setSub(pick.Index, true);
}
function setSub(idx, auto) {
  setTimeout(applySubDelay, 900);
  const v = PL.v; const s = idx >= 0 ? PL.ms.MediaStreams.find(x => x.Index === idx) : null;
  if (!auto) { PL.subTouched = true; saveTrackPref(PL.item, { sub: s ? (s.Language ? { lang: s.Language, forced: !!s.IsForced } : undefined) : 'off' }); }
  const wasEncode = PL.encodeSub; PL.sub = idx; v.querySelectorAll('track').forEach(x => x.remove()); PL.subsEl.replaceChildren();
  if (s && s.DeliveryMethod === 'Encode' && !s.DeliveryUrl) { PL.encodeSub = true; closeMenus(); startStream(ticks()); return; }
  PL.encodeSub = false; if (wasEncode) { closeMenus(); startStream(ticks()); return; }
  if (s && s.DeliveryUrl) {
    const tr = document.createElement('track'); tr.kind = 'subtitles'; tr.label = s.DisplayTitle || 'Sub'; tr.srclang = s.Language || 'und'; tr.src = withKey(absUrl(s.DeliveryUrl)); v.append(tr);
    const hook = () => { tr.track.mode = 'hidden'; tr.track.oncuechange = renderCues; };
    tr.addEventListener('load', hook); setTimeout(hook, 300);
  }
  buildTrackMenus(); closeMenus();
}
function renderCues() {
  const track = PL.v && [...PL.v.textTracks].find(x => x.mode === 'hidden' || x.mode === 'showing'); if (!track || !PL.subsEl) return;
  const act = [...(track.activeCues || [])]; PL.subsEl.replaceChildren();
  act.forEach((c, i) => { const line = h('div', { class: 'pl-subline' }); line.append(c.getCueAsHTML()); PL.subsEl.append(line); });
}
function applySubStyle() {
  if (!PL.el) return; const sizes = { s: 1.35, m: 1.9, l: 2.5, xl: 3.2 }; const st = PL.el.style;
  st.setProperty('--sub-size', 'clamp(15px, ' + (sizes[pcfg('subSize', 'm')] || 1.9) + 'vw, 44px)');
  st.setProperty('--sub-pos', (pcfg('subPos', 9)) + '%'); st.setProperty('--sub-color', pcfg('subColor', '#ffffff'));
  PL.el.dataset.subbg = pcfg('subBg', 'shadow'); PL.el.dataset.subfont = pcfg('subFont', 'sans'); st.setProperty('--sub-weight', pcfg('subBold', false) ? '700' : '500');
}

/* chapters + skip segments */
function buildChapters() {
  if (!PL.el) return; const chs = (PL.item.Chapters || []).filter(c => c.StartPositionTicks > 0 || true);
  const wrap = $('.pl-chapters', PL.el); wrap.replaceChildren(); const d = (PL.item.RunTimeTicks || 0) / 1e7;
  if (d) chs.forEach((c, i) => { if (i === 0) return; wrap.append(h('i', { style: 'left:' + (c.StartPositionTicks / 1e7 / d * 100) + '%' })); });
  const menu = $('.pl-menu-chap', PL.el); menu.replaceChildren(h('div', { class: 'pl-mh' }, t('plChapters')), ...chs.map((c, i) => h('button', { onclick: () => { PL.v.currentTime = c.StartPositionTicks / 1e7; closeMenus(); } }, c.ImageTag ? h('img', { src: ApiClient.getUrl('Items/' + PL.item.Id + '/Images/Chapter/' + i, { tag: c.ImageTag, maxWidth: 160 }) }) : null, h('span', {}, c.Name || ('Chapter ' + (i + 1))), h('small', {}, fmtT(c.StartPositionTicks / 1e7)))));
  $('.pl-btn-chap', PL.el).classList.toggle('hide', chs.length < 2);
}
function checkSegments() {
  const v = PL.v; if (!v || !PL.segments.length) return; const t0 = v.currentTime; const seg = PL.segments.find(s => (s.type === 'Intro' || s.type === 'Outro' || s.type === 'Recap' || s.type === 'Preview') && t0 >= s.start && t0 < s.end - 1);
  const btn = $('.pl-skipseg', PL.el);
  /* during the credits of an episode the up-next card takes this place */
  if (seg && seg.type === 'Outro' && PL.nextItem && !PL.ncDismiss) { btn.classList.remove('show'); return; }
  if (seg) { btn.classList.add('show'); $('span', btn).textContent = seg.type === 'Outro' ? t('plSkipCredits') : seg.type === 'Recap' ? t('plSkipRecap') : t('plSkipIntro'); btn.onclick = () => { v.currentTime = seg.end; btn.classList.remove('show'); }; if (pcfg('autoSkip', false) && seg.type === 'Intro') { v.currentTime = seg.end; btn.classList.remove('show'); } } else btn.classList.remove('show');
}
/* up next: appears when the credits start (Outro segment) or 20 s before the end, counts down and plays the next episode */
const NEXT_COUNT = 10;
function checkNextCard() {
  const v = PL.v; const card_ = $('.pl-nextcard', PL.el); const d = v.duration;
  const hide = () => { card_.classList.remove('show'); PL.ncStart = null; };
  if (!PL.nextItem || !d || !isFinite(d) || PL.ncDismiss) return hide();
  const now = v.currentTime, left = d - now;
  const out = PL.segments.find(s => s.type === 'Outro' && s.start > d * .5 && s.start < d - 2);
  const from = out ? out.start : d - 20;
  if (now < from || left <= 0) return hide();
  if (PL.ncStart == null || now < PL.ncStart) PL.ncStart = now;
  const auto = pcfg('autoNext', true);
  const total = out ? Math.min(NEXT_COUNT, d - from) : d - from;
  const remain = Math.max(0, out ? Math.min(left, total - (now - PL.ncStart)) : left);
  if (!card_.classList.contains('show')) {
    const n = PL.nextItem; const th = imgUrl(n, 'Primary', 400);
    $('.pl-nc-th', card_).style.backgroundImage = th ? 'url("' + th + '")' : '';
    $('.pl-nc-t', card_).textContent = 'S' + (n.ParentIndexNumber || 0) + ':E' + (n.IndexNumber || 0) + ' · ' + n.Name;
  }
  card_.classList.add('show'); card_.classList.toggle('auto', auto);
  $('.pl-nc-s', card_).textContent = auto ? t('plNextIn') + ' ' + Math.ceil(remain) + ' s' : t('plUpNext');
  $('.pl-nc-fill', card_).style.width = auto && total > 0 ? Math.min(100, (1 - remain / total) * 100) + '%' : '0%';
  if (auto && out && remain <= 0 && !v.paused) playNextEp();
}

/* settings panel */
function openSettings(tab) {
  const panel = $('.pl-settings', PL.el); const tabs = ['quality', 'playback', 'subs', 'keys']; tab = tab || 'quality';
  const body = h('div', { class: 'pl-sbody' });
  const row = (label, ctrl, hint) => h('div', { class: 'pl-srow' }, h('div', {}, h('b', {}, label), hint ? h('small', {}, hint) : null), ctrl);
  const seg = (opts, cur, fn) => h('div', { class: 'pl-seg' }, opts.map(([v, l]) => h('button', { class: String(cur) === String(v) ? 'on' : '', onclick: e => { fn(v); $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, l)));
  const sw = (key, def, fn) => { const b = h('button', { class: 'set-switch' + (pcfg(key, def) ? ' on' : ''), onclick: () => { const nv = !pcfg(key, def); psave(key, nv); b.classList.toggle('on', nv); fn && fn(nv); } }, h('i')); return b; };
  if (tab === 'quality') {
    body.append(row(t('plQuality'), seg(QUALITIES.map(([k]) => [k, k === 'auto' ? t('plAuto') : (k === '20' ? '1080p+' : k === '8' ? '1080p' : k === '4' ? '720p' : '480p')]), pcfg('quality', 'auto'), v => { psave('quality', v); startStream(ticks()); }), t('plQualityHint')),
      row(t('plFit'), seg([['contain', t('plFitContain')], ['cover', t('plFitCover')], ['fill', t('plFitFill')]], pcfg('fit', 'contain'), v => { psave('fit', v); applyFit(); }), t('plFitHint')),
      row(t('plSkipLen'), seg([[5, '5 s'], [10, '10 s'], [15, '15 s'], [30, '30 s']], skipLen(), v => { psave('skipLen', +v); updSkipIcons(); })),
      row(t('plSpeed'), seg(SPEEDS.map(x => [x, x + '×']), PL.speed, v => { setSpeed(+v); })));
  } else if (tab === 'playback') {
    body.append(row(t('plAutoNext'), sw('autoNext', true), t('plAutoNextHint')), row(t('plAutoSkip'), sw('autoSkip', false), t('plAutoSkipHint')), row(t('plRemember'), sw('rememberVol', true)));
  } else if (tab === 'subs') {
    { const val = h('b', { class: 'pl-delayv' }, ((PL.subDelay || 0) >= 0 ? '+' : '') + (PL.subDelay || 0).toFixed(1) + ' s'); const bump = d => { PL.subDelay = Math.round(((PL.subDelay || 0) + d) * 10) / 10; val.textContent = (PL.subDelay >= 0 ? '+' : '') + PL.subDelay.toFixed(1) + ' s'; applySubDelay(); };
      body.append(row(t('plSubDelay'), h('div', { class: 'pl-stepper' }, h('button', { onclick: () => bump(-.5) }, '−.5'), h('button', { onclick: () => bump(-.1) }, '−'), val, h('button', { onclick: () => bump(.1) }, '+'), h('button', { onclick: () => bump(.5) }, '+.5')), t('plSubDelayHint'))); }
    body.append(row(t('plSubSize'), seg([['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], pcfg('subSize', 'm'), v => { psave('subSize', v); applySubStyle(); })),
      row(t('plSubPos'), seg([[4, t('plLow')], [9, t('plMid')], [16, t('plHigh')]], pcfg('subPos', 9), v => { psave('subPos', +v); applySubStyle(); })),
      row(t('plSubBg'), seg([['shadow', t('plShadow')], ['box', t('plBox')], ['none', t('plNone')]], pcfg('subBg', 'shadow'), v => { psave('subBg', v); applySubStyle(); })),
      row(t('plSubColor'), seg([['#ffffff', t('plWhite')], ['#ffe14d', t('plYellow')], ['#7dffb1', t('plGreen')]], pcfg('subColor', '#ffffff'), v => { psave('subColor', v); applySubStyle(); })),
      row(t('plSubBold'), sw('subBold', false, () => applySubStyle())),
      row(t('plSubFont'), seg([['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']], pcfg('subFont', 'sans'), v => { psave('subFont', v); applySubStyle(); })));
    body.append(h('div', { class: 'pl-subpreview' }, h('span', {}, t('plSubPreview'))));
  } else if (tab === 'keys') {
    [['Space / K', t('plKPlay')], ['← →  /  J L', '±' + skipLen() + ' s'], ['Shift + ← →', '±' + skipLen() * 6 + ' s'], ['0 – 9', t('plKJump')], ['↑ ↓', t('plKVol')], ['< >', t('plSpeed')], [', .', t('plKFrame')], ['Shift + N', t('plNext')], ['F', t('plKFs')], ['M', t('plKMute')], ['C', t('plSubs')], ['A', t('plAudio')], ['P', 'Picture in picture'], ['I', t('plInfo')], ['Esc', t('plKBack')]].forEach(([k, d]) => body.append(h('div', { class: 'pl-key' }, h('kbd', {}, k), h('span', {}, d))));
  }
  panel.replaceChildren(h('div', { class: 'pl-stabs' }, tabs.map(k => h('button', { class: k === tab ? 'on' : '', onclick: () => openSettings(k) }, t('plTab_' + k))), h('button', { class: 'pl-sclose', onclick: () => panel.classList.remove('open'), 'aria-label': 'Close' }, ic('close'))), body);
  panel.classList.add('open'); closeMenus(); wake();
}
async function showEpisodes() {
  const m = $('.pl-menu-eps', PL.el); toggleMenu('.pl-menu-eps'); if (m.dataset.loaded === PL.item.SeasonId) return;
  m.replaceChildren(h('div', { class: 'pl-mh' }, t('episodes')), h('div', { class: 'spinner', style: 'margin:20px auto;width:26px;height:26px' }));
  try { const r = await api('Shows/' + PL.item.SeriesId + '/Episodes', { userId: uid(), seasonId: PL.item.SeasonId, Fields: F_BASE }); m.dataset.loaded = PL.item.SeasonId; m.replaceChildren(h('div', { class: 'pl-mh' }, (PL.item.SeasonName || t('episodes'))), ...r.Items.map(ep => h('button', { class: ep.Id === PL.item.Id ? 'on' : '', onclick: () => { closeMenus(); if (ep.Id !== PL.item.Id) playEpisode(ep); } }, h('span', {}, (ep.IndexNumber || '') + '. ' + ep.Name), ud(ep).Played ? h('small', {}, '') : null))); } catch (e) { }
}
function showStats(on) { const st = $('.pl-stats', PL.el); if (on === undefined) on = !st.classList.contains('open'); st.classList.toggle('open', on); clearInterval(PL.statT); if (!on) return; const upd = () => { const v = PL.v; if (!v) return; const ms = PL.ms || {}; const vs = (ms.MediaStreams || []).find(s => s.Type === 'Video') || {}; const q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : {}; st.replaceChildren(...[[t('plMethod'), PL.method || ''], [t('plSource'), [(ms.Container || '').toUpperCase(), (vs.Codec || '').toUpperCase(), vs.Width && vs.Height ? vs.Width + '×' + vs.Height : ''].filter(Boolean).join(' · ')], [t('plPlaying'), v.videoWidth + '×' + v.videoHeight], [t('plBitrate'), ms.Bitrate ? (ms.Bitrate / 1e6).toFixed(1) + ' Mbps' : ''], [t('plBuffer'), v.buffered.length ? Math.round(v.buffered.end(v.buffered.length - 1) - v.currentTime) + ' s' : '0 s'], [t('plDropped'), (q.droppedVideoFrames || 0) + ' / ' + (q.totalVideoFrames || 0)]].map(([k, val]) => h('div', {}, h('span', {}, k), h('b', {}, val)))); }; upd(); PL.statT = setInterval(upd, 1000); }

/* build */
function buildPlayerUI(it) {
  const v = h('video', { playsinline: '', preload: 'auto', poster: 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=' });
  v.addEventListener('playing', () => { wake(); applyFit(); }, { once: true });
  const seekFill = h('i'), seekBuf = h('em'), seekKnob = h('b'), bubble = h('div', { class: 'pl-bubble' }, h('div', { class: 'pl-thumb' }), h('span', {})), chapters = h('div', { class: 'pl-chapters' });
  const seek = h('div', { class: 'pl-seek' }, seekBuf, chapters, seekFill, seekKnob, bubble);
  const tCur = h('span', {}, '0:00'), tDur = h('span', { class: 'pl-tdur', role: 'button', title: t('plRemainHint'), onclick: e => { e.stopPropagation(); psave('remain', !pcfg('remain', false)); updTime(); } }, '0:00');
  const ppBtn = h('button', { class: 'pl-pp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play'));
  const volBar = seekBarEl(f => { v.volume = f; v.muted = false; if (pcfg('rememberVol', true)) try { localStorage.setItem('cx-pvol', f); } catch (e) { } updVol(); });
  const muteBtn = h('button', { onclick: () => { v.muted = !v.muted; updVol(); }, 'aria-label': 'Mute' }, pic('vol'));
  const tip = (label, el) => { el.setAttribute('data-tip', label); el.setAttribute('aria-label', label); return el; };
  const subsEl = h('div', { class: 'pl-subs' });
  const loadBg = imgUrl(it, 'Backdrop', 1280) || imgUrl(it, 'Primary', 600);
  const el = h('div', { id: 'cx-player', class: 'loading' }, h('div', Object.assign({ class: 'pl-loadbg' }, bg(loadBg))), v, subsEl,
    
    h('div', { class: 'pl-top' }, tip(t('plBack'), h('button', { class: 'pl-back', onclick: backFromPlayer }, pic('back'))), h('div', { class: 'pl-ttl' }, h('div', { class: 'pl-title ell' }), h('div', { class: 'pl-sub ell' })), tip(t('plInfo'), h('button', { class: 'pl-round', onclick: () => showStats() }, pic('info')))),
    h('div', { class: 'pl-stats' }),
    h('div', { class: 'pl-bigctl' }, h('button', { 'aria-label': '-10', onclick: () => skip(-skipLen()) }, skipIcon(-1)), h('button', { class: 'pl-bigpp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play')), h('button', { 'aria-label': '+10', onclick: () => skip(skipLen()) }, skipIcon(1))),
    h('div', { class: 'pl-center' }, h('div', { class: 'pl-spin' }), h('div', { class: 'pl-status' })),
    h('div', { class: 'pl-flash' }), h('div', { class: 'pl-stack' }), h('div', { class: 'pl-gest' }),
    h('div', { class: 'pl-err' }, h('b', {}, t('plFail')), h('p', { class: 'pl-errmsg' }), h('div', { class: 'nf-btns', style: 'justify-content:center' },
      h('button', { class: 'btn white', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p); } }, t('plRetryBtn')),
      h('button', { class: 'btn grey', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p, { forceTranscode: true }); } }, t('plTranscode')),
      h('button', { class: 'btn grey', onclick: () => { const id = PL.item.Id; closePlayer(); playNative(id); } }, t('plNative')))),
    h('button', { class: 'pl-skipseg btn white' }, pic('skip'), h('span', {}, t('plSkipIntro'))),
    h('div', { class: 'pl-nextcard' }, h('div', { class: 'pl-nc-th', onclick: playNextEp }, pic('play')), h('div', { class: 'pl-nc-body' }, h('div', { class: 'pl-nc-s' }), h('div', { class: 'pl-nc-t ell' }), h('div', { class: 'nf-btns' },
      h('button', { class: 'btn white pl-nc-go', onclick: playNextEp }, h('i', { class: 'pl-nc-fill' }), pic('next'), h('span', {}, t('plNext'))),
      h('button', { class: 'btn grey', onclick: () => { PL.ncDismiss = true; $('.pl-nextcard', el).classList.remove('show'); } }, t('plWatchCredits'))))),
    h('div', { class: 'pl-bar' }, seek, h('div', { class: 'pl-row' },
      ppBtn, tip(t('plBack10'), h('button', { onclick: () => skip(-skipLen()), class: 'pl-skip' }, skipIcon(-1))), tip(t('plFwd10'), h('button', { onclick: () => skip(skipLen()), class: 'pl-skip' }, skipIcon(1))),
      h('div', { class: 'pl-vol' }, muteBtn, volBar), h('div', { class: 'pl-time' }, tCur, h('span', { class: 'sl' }, ' / '), tDur), h('div', { style: 'flex:1' }),
      h('div', { class: 'pl-btn-wrap pl-btn-next' }, tip(t('plNext'), h('button', { onclick: playNextEp }, pic('next')))),
      h('div', { class: 'pl-btn-wrap pl-btn-eps hide' }, tip(t('episodes'), h('button', { onclick: showEpisodes }, pic('eps'))), h('div', { class: 'pl-menu pl-menu-eps' })),
      h('div', { class: 'pl-btn-wrap pl-btn-chap hide' }, tip(t('plChapters'), h('button', { onclick: () => toggleMenu('.pl-menu-chap') }, pic('chap'))), h('div', { class: 'pl-menu pl-menu-chap' })),
      h('div', { class: 'pl-btn-wrap pl-btn-audio hide' }, tip(t('plAudio'), h('button', { onclick: () => toggleMenu('.pl-menu-audio') }, pic('audio'))), h('div', { class: 'pl-menu pl-menu-audio' })),
      h('div', { class: 'pl-btn-wrap pl-btn-subs hide' }, tip(t('plSubs'), h('button', { onclick: () => toggleMenu('.pl-menu-subs') }, pic('cc'))), h('div', { class: 'pl-menu pl-menu-subs' })),
      h('div', { class: 'pl-btn-wrap' }, tip(t('plSettings'), h('button', { onclick: () => openSettings() }, pic('gear')))),
      document.pictureInPictureEnabled ? tip('Picture in picture', h('button', { onclick: () => { document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture().catch(() => { }); } }, pic('pip'))) : null,
      tip(t('plFs'), h('button', { class: 'pl-fs', onclick: () => toggleFs() }, pic('fs'))))),
    h('div', { class: 'pl-settings' }));
  getUI().append(el); PL.el = el; PL.v = v; PL.subsEl = subsEl; applySubStyle();
  if (nativeFs()) setNativeFs(true);
  $('.pl-settings', el).addEventListener('click', e => e.stopPropagation()); $$('.pl-btn-wrap', el).forEach(w => w.addEventListener('click', e => e.stopPropagation()));
  try { const sv = parseFloat(localStorage.getItem('cx-pvol')); if (isFinite(sv) && pcfg('rememberVol', true)) v.volume = sv; } catch (e) { }
  function updVol() { volBar.set(v.muted ? 0 : v.volume); muteBtn.replaceChildren(pic(v.muted || v.volume === 0 ? 'mute' : 'vol')); }
  updVol(); v.addEventListener('volumechange', updVol);
  const dur = () => (isFinite(v.duration) && v.duration > 0) ? v.duration : ((PL.item && PL.item.RunTimeTicks) || 0) / 1e7;
  const timeWrap = () => $('.pl-time', el);
  function updTime() {
    const d = dur(), c = v.currentTime || 0; tCur.textContent = fmtT(c);
    tDur.textContent = pcfg('remain', false) && d ? '−' + fmtT(d - c) : fmtT(d);
    const tw = timeWrap(); if (tw && d) { const end = new Date(Date.now() + (d - c) / (v.playbackRate || 1) * 1000); tw.setAttribute('data-tip', t('plEndsAt') + ' ' + end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); }
  }
  v.addEventListener('timeupdate', () => {
    const d = dur(); const f = d ? v.currentTime / d : 0; if (!seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; }
    if (v.currentTime > 0) PL.lastPos = v.currentTime;
    updTime(); updPosState();
    if (v.buffered.length) { const e = v.buffered.end(v.buffered.length - 1); seekBuf.style.width = (d ? e / d : 0) * 100 + '%'; }
    if (Date.now() - PL.lastRep > 10000 && !v.paused) { PL.lastRep = Date.now(); report('Progress', { EventName: 'timeupdate' }); }
    checkSegments(); checkNextCard();
  });
  v.addEventListener('playing', () => { el.classList.remove('loading', 'err'); if (!PL.started) { PL.started = true; report('Start'); } ppBtn.replaceChildren(pic('pause')); $('.pl-bigpp', el).replaceChildren(pic('pause')); el.classList.add('is-playing'); wake(); updPosState(true); });
  v.addEventListener('pause', () => { ppBtn.replaceChildren(pic('play')); $('.pl-bigpp', el).replaceChildren(pic('play')); el.classList.remove('is-playing'); report('Progress', { EventName: 'pause' }); wake(); updPosState(true); });
  v.addEventListener('seeked', () => updPosState(true)); v.addEventListener('ratechange', () => { updPosState(true); updTime(); });
  v.addEventListener('waiting', () => { if (!v.paused) { el.classList.add('loading'); $('.pl-status', el).textContent = ''; } });
  v.addEventListener('canplay', () => el.classList.remove('loading'));
  v.addEventListener('ended', () => { if (PL.nextItem && pcfg('autoNext', true) && !PL.ncDismiss) playNextEp(); else backFromPlayer(); });
  /* a file the browser cannot decode falls back to a server transcode once; a dropped connection is retried twice */
  v.addEventListener('error', () => {
    if (PL.hls || !PL.open || !v.getAttribute('src')) return;
    const code = v.error ? v.error.code : 0; const pos = Math.floor((PL.lastPos || v.currentTime || 0) * 1e7);
    if ((code === 3 || code === 4) && !PL.safe) { escalate(v.error && v.error.message || ('Media error ' + code)); return; }
    if (code === 2 && PL.netRetry < 2) { PL.netRetry++; startStream(pos, { status: t('plRetry') }); return; }
    showError(v.error ? (v.error.message || ('Media error ' + v.error.code)) : 'Playback error');
  });
  let seekDrag = false;
  const frac = e => { const r = seek.getBoundingClientRect(); return Math.max(0, Math.min(1, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width)); };
  const tsInfo = () => { const tp = PL.item && PL.item.Trickplay; if (!tp || !PL.ms) return null; const byMs = tp[PL.ms.Id] || tp[Object.keys(tp)[0]]; if (!byMs) return null; const w = Object.keys(byMs).map(Number).sort((a, b) => a - b)[0]; return w ? Object.assign({ w }, byMs[w]) : null; };
  function showBubble(f) {
    const d = dur(); const time = f * d; bubble.style.left = f * 100 + '%'; $('span', bubble).textContent = fmtT(time) + chapterAt(time);
    const ti = tsInfo(); const th = $('.pl-thumb', bubble);
    if (ti && ti.Interval) { const idx = Math.min(ti.ThumbnailCount - 1, Math.floor(time * 1000 / ti.Interval)); const per = ti.TileWidth * ti.TileHeight; const tile = Math.floor(idx / per), off = idx % per; const col = off % ti.TileWidth, rw = Math.floor(off / ti.TileWidth); th.style.display = 'block'; th.style.width = ti.Width + 'px'; th.style.height = ti.Height + 'px'; th.style.backgroundImage = 'url("' + withKey(absUrl('Videos/' + PL.item.Id + '/Trickplay/' + ti.w + '/' + tile + '.jpg?MediaSourceId=' + PL.ms.Id)) + '")'; th.style.backgroundPosition = '-' + col * ti.Width + 'px -' + rw * ti.Height + 'px'; } else th.style.display = 'none';
  }
  const chapterAt = time => { const chs = PL.item.Chapters || []; let name = ''; chs.forEach(c => { if (c.StartPositionTicks / 1e7 <= time) name = c.Name; }); return name ? ' · ' + name : ''; };
  seek.addEventListener('pointerdown', e => { seekDrag = true; seek.setPointerCapture(e.pointerId); const f = frac(e); seekFill.style.width = f * 100 + '%'; showBubble(f); });
  seek.addEventListener('pointermove', e => { const f = frac(e); showBubble(f); if (seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; } });
  seek.addEventListener('pointerup', e => { if (seekDrag) { seekDrag = false; v.currentTime = frac(e) * dur(); report('Progress', { EventName: 'timeupdate' }); } });
  /* tap zones: single tap toggles controls, double tap seeks (touch) */
    /* touch: tap = show/hide controls, double tap left/right = +-10 s, double tap middle = play/pause */
  /* touch: tap = controls, double tap + more taps = stacked skip, drag: left = brightness, right = volume, horizontal = scrub */
  const stk = $('.pl-stack', el), gest = $('.pl-gest', el); let stack = { side: null, total: 0, base: 0, timer: 0 };
  const showStack = () => { stk.className = 'pl-stack show ' + stack.side; stk.replaceChildren(skipIcon(stack.total > 0 ? 1 : -1), h('b', {}, (stack.total > 0 ? '+' : '') + stack.total + ' s')); };
  function stackSkip(side) {
    const d = side === 'r' ? skipLen() : -skipLen(); if (stack.side !== side) { stack = { side, total: 0, base: v.currentTime, timer: 0 }; }
    stack.total += d; showStack(); clearTimeout(stack.timer);
    stack.timer = setTimeout(() => { const dd = dur() || 1e9; v.currentTime = Math.max(0, Math.min(dd - 1, stack.base + stack.total)); stack = { side: null, total: 0, base: 0, timer: 0 }; stk.className = 'pl-stack'; }, 650);
  }
  PL.bri = PL.bri || 1; const applyBri = () => { v.style.filter = PL.bri === 1 ? '' : 'brightness(' + PL.bri + ')'; }; applyBri();
  const showGest = (icon, frac, txt) => { gest.className = 'pl-gest show'; gest.replaceChildren(...[icon ? h('div', { class: 'gi' }, icon) : null, frac == null ? null : h('div', { class: 'gb' }, h('i', { style: 'width:' + Math.round(frac * 100) + '%' })), txt ? h('b', {}, txt) : null].filter(Boolean)); clearTimeout(gest._t); };
  const hideGest = () => { clearTimeout(gest._t); gest._t = setTimeout(() => { gest.className = 'pl-gest'; }, 450); };
  /* on-screen feedback for keyboard and media keys */
  PL.osd = (icon, frac, txt) => { showGest(icon, frac, txt); clearTimeout(gest._t); gest._t = setTimeout(() => { gest.className = 'pl-gest'; }, 900); };
  PL.osdVol = () => { const nv = v.muted ? 0 : v.volume; PL.osd(pic(nv === 0 ? 'mute' : 'vol'), nv, Math.round(nv * 100) + '%'); };
  let ts = null, lastTap = 0, lastZone = '', prevIdle = false;
  const onCtl = t_ => t_.closest && t_.closest('button, a, input, .pl-seek, .pl-settings, .pl-menu, .pl-skipseg, .pl-nextcard, .pl-err');
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return; const r = el.getBoundingClientRect();
    ts = { x: e.clientX, y: e.clientY, t: Date.now(), mode: null, ctl: !!onCtl(e.target), zone: (e.clientX - r.left) / r.width, vy: (e.clientY - r.top) / r.height, vol: v.volume, bri: PL.bri, time: v.currentTime, h: r.height, w: r.width };
  });
  el.addEventListener('pointermove', e => {
    if (!ts || e.pointerType === 'mouse' || ts.ctl) return; const dx = e.clientX - ts.x, dy = e.clientY - ts.y;
    if (!ts.mode) {
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
      if (stack.side || ts.vy < .12 || ts.vy > .8) { ts.mode = 'none'; return; }
      ts.mode = Math.abs(dy) > Math.abs(dx) ? (ts.zone > .5 ? 'vol' : 'bri') : 'seek'; closeMenus();
    }
    if (ts.mode === 'vol') { const nv = Math.max(0, Math.min(1, ts.vol - dy / (ts.h * .55))); v.muted = false; v.volume = nv; showGest(pic(nv === 0 ? 'mute' : 'vol'), nv, Math.round(nv * 100) + '%'); }
    else if (ts.mode === 'bri') { PL.bri = Math.max(.25, Math.min(1.6, ts.bri - dy / (ts.h * .55))); applyBri(); showGest(luSvg('sun'), (PL.bri - .25) / 1.35, Math.round(PL.bri * 100) + '%'); }
    else if (ts.mode === 'seek') { const d_ = dur(); const nt = Math.max(0, Math.min(d_, ts.time + dx / ts.w * Math.min(d_ || 600, 240))); ts.target = nt; showGest(null, d_ ? nt / d_ : 0, fmtT(nt) + ' (' + (nt - ts.time >= 0 ? '+' : '−') + Math.abs(Math.round(nt - ts.time)) + ' s)'); }
  });
  el.addEventListener('pointercancel', () => { ts = null; hideGest(); });
  el.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' || !ts) return; const s0 = ts; ts = null;
    if (s0.mode && s0.mode !== 'none') { if (s0.mode === 'seek' && s0.target != null) { v.currentTime = s0.target; report('Progress', { EventName: 'timeupdate' }); } hideGest(); wake(); return; }
    if (Math.abs(e.clientX - s0.x) > 14 || Math.abs(e.clientY - s0.y) > 14 || Date.now() - s0.t > 500) return;
    if (s0.ctl) { if (!el.classList.contains('idle')) wake(); return; }
    if ($('.pl-menu.open, .pl-settings.open', el)) { closeMenus(); $('.pl-settings', el).classList.remove('open'); wake(); return; }
    const now = Date.now(); const zone = s0.zone < .34 ? 'l' : s0.zone > .66 ? 'r' : 'c';
    if (stack.side && zone !== 'c' && (zone === 'r' ? 'r' : 'l') === stack.side) { stackSkip(stack.side); lastTap = 0; return; }
    if (now - lastTap < 300 && zone === lastZone) {
      lastTap = 0; if (zone === 'c') { togglePlay(); wake(); } else { stackSkip(zone); if (prevIdle) { el.classList.add('idle'); clearTimeout(PL.idleT); } }
      return;
    }
    lastTap = now; lastZone = zone; prevIdle = el.classList.contains('idle');
    if (prevIdle) wake(); else { clearTimeout(PL.idleT); el.classList.add('idle'); }
  });
  v.addEventListener('click', () => { if (!matchMedia('(pointer:coarse)').matches) togglePlay(); });
  v.addEventListener('dblclick', () => { if (!matchMedia('(pointer:coarse)').matches) toggleFs(); });
  el.addEventListener('mousemove', () => { if (!matchMedia('(pointer:coarse)').matches) wake(); });
  el.addEventListener('click', e => { if (!e.target.isConnected) return; closeMenus(); $('.pl-settings', el).classList.remove('open'); });
  v.addEventListener('play', () => flashIcon('play')); v.addEventListener('pause', () => flashIcon('pause'));
  function flashIcon(n) { if (!PL.started) return; const f = $('.pl-flash', el); f.replaceChildren(pic(n)); f.className = 'pl-flash icon show'; clearTimeout(f._t); f._t = setTimeout(() => { f.className = 'pl-flash'; }, 450); }
  wake();
}
function seekBarEl(onChange) {
  const fill = h('i'), bar = h('div', { class: 'pl-vbar' }, fill); let d = false;
  const f = e => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
  bar.addEventListener('pointerdown', e => { d = true; bar.setPointerCapture(e.pointerId); onChange(f(e)); }); bar.addEventListener('pointermove', e => { if (d) onChange(f(e)); }); bar.addEventListener('pointerup', () => { d = false; });
  bar.set = x => { fill.style.width = x * 100 + '%'; }; return bar;
}
function wake() { if (!PL.el) return; PL.el.classList.remove('idle'); clearTimeout(PL.idleT); PL.idleT = setTimeout(() => { if (PL.v && !PL.v.paused && !$('.pl-menu.open, .pl-settings.open', PL.el)) PL.el.classList.add('idle'); }, 3200); }
function togglePlay() { const v = PL.v; if (!v) return; v.paused ? v.play().catch(() => { }) : v.pause(); }
function skip(s, osd) { const v = PL.v; if (!v) return; v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + s)); if (osd && PL.osd) PL.osd(skipIcon(s > 0 ? 1 : -1), null, (s > 0 ? '+' : '−') + Math.abs(s) + ' s'); wake(); }
function seekTo(sec) { const v = PL.v; if (!v) return; const d = isFinite(v.duration) ? v.duration : 1e9; v.currentTime = Math.max(0, Math.min(d - .5, sec)); report('Progress', { EventName: 'timeupdate' }); wake(); }
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
function setSpeed(x) { if (!PL.v) return; PL.speed = x; PL.v.playbackRate = x; PL.osd && PL.osd(luSvg('gauge'), null, x + '×'); }

/* system media controls (browser media hub, desktop app media keys, lock screen) */
function updMediaSession() {
  if (!('mediaSession' in navigator) || !PL.open || !PL.item) return; const it = PL.item, ep = it.Type === 'Episode', ms = navigator.mediaSession;
  try {
    const art = imgUrl(it, ep ? 'Primary' : 'Backdrop', 640) || imgUrl(it, 'Primary', 640);
    ms.metadata = new MediaMetadata({ title: ep ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : it.Name, artist: ep ? (it.SeriesName || '') : String(yearOf(it) || ''), album: ep ? (it.SeasonName || '') : '', artwork: art ? [{ src: art, sizes: '640x360', type: 'image/jpeg' }] : [] });
    const set = (a, fn) => { try { ms.setActionHandler(a, fn); } catch (e) { } };
    set('play', () => PL.v && PL.v.play().catch(() => { })); set('pause', () => PL.v && PL.v.pause());
    set('seekbackward', e => skip(-((e && e.seekOffset) || skipLen()), true)); set('seekforward', e => skip((e && e.seekOffset) || skipLen(), true));
    set('seekto', e => { if (e && e.seekTime != null) seekTo(e.seekTime); });
    set('previoustrack', () => seekTo(0)); set('nexttrack', PL.nextItem ? playNextEp : null);
    set('stop', () => backFromPlayer());
  } catch (e) { }
}
let posAt = 0;
function updPosState(force) {
  const v = PL.v; if (!v || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  const now = Date.now(); if (!force && now - posAt < 4000) return; posAt = now;
  try { if (isFinite(v.duration) && v.duration > 0) navigator.mediaSession.setPositionState({ duration: v.duration, playbackRate: v.playbackRate || 1, position: Math.min(v.duration, v.currentTime) }); } catch (e) { }
}
function clearMediaSession() {
  if (!('mediaSession' in navigator)) return; const ms = navigator.mediaSession;
  try { ['play', 'pause', 'seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack', 'stop'].forEach(a => { try { ms.setActionHandler(a, null); } catch (e) { } }); ms.metadata = null; } catch (e) { }
  /* hand the controls back to the music player if a track is loaded */
  try { if (typeof cur === 'function' && cur() && typeof setMedia === 'function') setMedia(); } catch (e) { }
}

/* full screen: Jellyfin shells (NativeShell), the Cinema desktop app (window full screen), or the browser Fullscreen API */
const deskFs = () => { const n = window.CinemaNative; return n && typeof n.setFullscreen === 'function' ? n : null; };
const nativeFs = () => { const n = window.NativeShell, i = window.NativeInterface; return n && n.enableFullscreen ? n : (i && i.enableFullscreen ? i : null); };
function setNativeFs(on) { const n = nativeFs(); if (!n) return false; try { on ? n.enableFullscreen() : n.disableFullscreen(); PL.nfs = on; if (typeof onFsChange === 'function') onFsChange(); } catch (e) { return false; } return true; }
/* on: true / false, or undefined to toggle. The window state before the player touched it is restored on close. */
function setDeskFs(on) {
  const n = deskFs(); if (!n) return;
  Promise.resolve(n.setFullscreen(on)).then(prev => { prev = !!prev; if (PL.dfsPrev == null) PL.dfsPrev = prev; PL.dfs = on == null ? !prev : !!on; onFsChange(); }).catch(() => { });
}
function fsEl() { return PL.nfs || PL.dfs || document.fullscreenElement || document.webkitFullscreenElement; }
function toggleFs() {
  const el = PL.el, v = PL.v; if (!el) return;
  if (nativeFs()) { setNativeFs(!PL.nfs); return; }
  if (deskFs()) { setDeskFs(); return; }
  if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { } return; }
  const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } };
  const rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (rq) { const r = rq.call(el, { navigationUI: 'hide' }); if (r && r.then) r.then(lock).catch(() => { v.webkitEnterFullscreen && v.webkitEnterFullscreen(); }); else lock(); }
  else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
}
const onFsChange = () => { if (PL.el) { const b = $('.pl-fs', PL.el); b && b.replaceChildren(pic(fsEl() ? 'fsx' : 'fs')); } }; document.addEventListener('fullscreenchange', onFsChange); document.addEventListener('webkitfullscreenchange', onFsChange);
function onKey(e) {
  if (!PL.open || !PL.v || e.ctrlKey || e.metaKey || e.altKey || (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]'))) return;
  const v = PL.v, k = e.key, lk = k.length === 1 ? k.toLowerCase() : k; let used = true;
  const vol = d => { v.muted = false; v.volume = Math.max(0, Math.min(1, Math.round((v.volume + d) * 20) / 20)); PL.osdVol && PL.osdVol(); };
  const big = e.shiftKey ? 6 : 1;
  if (k === ' ' || lk === 'k' || k === 'MediaPlayPause') togglePlay();
  else if (k === 'ArrowRight' || lk === 'l') skip(skipLen() * big, true); else if (k === 'ArrowLeft' || lk === 'j') skip(-skipLen() * big, true);
  else if (k === 'ArrowUp') vol(.05); else if (k === 'ArrowDown') vol(-.05);
  else if (/^[0-9]$/.test(k)) { const d = isFinite(v.duration) ? v.duration : 0; if (d) seekTo(d * (+k) / 10); }
  else if (k === 'Home') seekTo(0); else if (k === 'End') { if (isFinite(v.duration)) seekTo(v.duration - 3); }
  else if (k === '>' || k === '<') { const i = SPEEDS.indexOf(PL.speed); const j = Math.max(0, Math.min(SPEEDS.length - 1, (i < 0 ? 2 : i) + (k === '>' ? 1 : -1))); setSpeed(SPEEDS[j]); }
  else if ((k === '.' || k === ',') && v.paused) v.currentTime = Math.max(0, v.currentTime + (k === '.' ? 1 : -1) / 24);
  else if (lk === 'n' && e.shiftKey && PL.nextItem) playNextEp();
  else if (lk === 'f') toggleFs(); else if (lk === 'm') { v.muted = !v.muted; PL.osdVol && PL.osdVol(); } else if (lk === 'i') showStats();
  else if (lk === 'c') { const b = $('.pl-btn-subs:not(.hide)', PL.el); b && toggleMenu('.pl-menu-subs'); }
  else if (lk === 'a') { const b = $('.pl-btn-audio:not(.hide)', PL.el); b && toggleMenu('.pl-menu-audio'); }
  else if (lk === 'p' && document.pictureInPictureEnabled) { document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture().catch(() => { }); }
  else if (k === 'Escape') {
    if ($('.pl-settings.open, .pl-menu.open', PL.el)) { $('.pl-settings', PL.el).classList.remove('open'); closeMenus(); }
    else if (PL.dfs) setDeskFs(false);
    else if (!document.fullscreenElement) backFromPlayer(); else used = false;
  } else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); wake(); }
}

/* native fallback */
function playNative(id) {
  COVER.show(); C.allowNative = true; location.hash = '#/details?id=' + id; let tries = 0;
  const iv = setInterval(() => { tries++; const page = $('#itemDetailPage:not(.hide)'); const btn = page && ($('.btnResume:not(.hide)', page) || $('.btnPlay:not(.hide)', page)); if (btn) { clearInterval(iv); btn.click(); } if (tries > 80) { clearInterval(iv); COVER.hide(); } }, 150);
}

Object.assign(TX.en, { plFit: 'Picture fit', plFitContain: 'Fit', plFitCover: 'Fill', plFitFill: 'Stretch', plFitHint: 'Fit keeps the whole picture, Fill crops it to the screen, Stretch distorts it.', plSkipLen: 'Skip length', plSubDelay: 'Subtitle delay', plSubDelayHint: 'Positive values show subtitles later.' });
Object.assign(TX.de, { plFit: 'Bildformat', plFitContain: 'Anpassen', plFitCover: 'Füllen', plFitFill: 'Strecken', plFitHint: 'Anpassen zeigt das ganze Bild, Füllen schneidet es auf den Bildschirm zu, Strecken verzerrt es.', plSkipLen: 'Sprunglänge', plSubDelay: 'Untertitel-Verzögerung', plSubDelayHint: 'Positive Werte zeigen Untertitel später.' });
Object.assign(TX.en, { plUpNext: 'Up next', plWatchCredits: 'Watch credits', plFallback: 'Switching to a compatible stream…', plEndsAt: 'Ends at', plRemainHint: 'Show remaining time', plKJump: 'Jump to 0–90 %', plKFrame: 'Frame by frame (paused)' });
Object.assign(TX.de, { plUpNext: 'Als Nächstes', plWatchCredits: 'Abspann ansehen', plFallback: 'Wechsle zu einem kompatiblen Stream…', plEndsAt: 'Endet um', plRemainHint: 'Restzeit anzeigen', plKJump: 'Springe zu 0–90 %', plKFrame: 'Bild für Bild (pausiert)' });
LU.gauge = '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/> <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/> <path d="M13.41 10.59l2.59 -2.59"/> <path d="M7 12a5 5 0 0 1 5 -5"/>';
