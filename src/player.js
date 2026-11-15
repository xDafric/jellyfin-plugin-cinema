/* ---------- Cinema video player v2: PlaybackInfo, direct play / HLS, custom controls, subtitles, skip intro, chapters ---------- */
const HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
let hlsLoading = null;
const loadHls = () => window.Hls ? Promise.resolve(window.Hls) : (hlsLoading || (hlsLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = HLS_URL; s.onload = () => res(window.Hls); s.onerror = () => rej(new Error('hls.js failed to load')); document.head.append(s); })));
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
function skipIcon(dir) { const s = luSvg(dir > 0 ? 'rewind-forward-10' : 'rewind-backward-10'); s.classList.add('lu-skip'); return s; }

function deviceProfile() {
  const hevc = !!(window.MediaSource && MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L120.90,mp4a.40.2"'));
  const vcodecs = 'h264' + (hevc ? ',hevc' : '');
  const tp = [];
  if (hevc) tp.push({ Container: 'mp4', Type: 'Video', AudioCodec: 'aac,mp3,opus,flac', VideoCodec: 'hevc,h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  tp.push({ Container: 'ts', Type: 'Video', AudioCodec: 'aac,mp3', VideoCodec: 'h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
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

async function openPlayer(it, startTicks) {
  closePlayer(true);
  Object.assign(PL, { item: it, open: true, started: false, sub: -1, audio: null, nextItem: null, ms: null, segments: [], encodeSub: false, subTouched: false });
  buildPlayerUI(it);
  history.pushState({ cxplayer: 1 }, '');
  window.addEventListener('popstate', onPop); document.addEventListener('keydown', onKey, true);
  P.audio && !P.audio.paused && P.audio.pause();
  let full = it; try { full = await getItem(it.Id); } catch (e) { }
  PL.item = full; setTitle(full); loadNext(full); loadSegments(full);
  await startStream(startTicks != null ? startTicks : (ud(full).PlaybackPositionTicks || 0));
}
async function startStream(startTicks, opts) {
  opts = opts || {}; const it = PL.item; setStatus(t('plPreparing')); stopTimers(); detach();
  try {
    const qual = QUALITIES.find(x => x[0] === String(pcfg('quality', 'auto'))) || QUALITIES[0];
    const prof = deviceProfile(); prof.MaxStreamingBitrate = qual[1];
    const q = { UserId: uid(), StartTimeTicks: startTicks || 0, MaxStreamingBitrate: qual[1], AutoOpenLiveStream: true };
    if (PL.audio != null) q.AudioStreamIndex = PL.audio;
    if (PL.ms) q.MediaSourceId = PL.ms.Id;
    if (PL.encodeSub && PL.sub >= 0) q.SubtitleStreamIndex = PL.sub;
    const info = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Items/' + it.Id + '/PlaybackInfo', q), data: JSON.stringify({ DeviceProfile: prof }), contentType: 'application/json', dataType: 'json' });
    if (info.ErrorCode) throw new Error(info.ErrorCode);
    const ms = (info.MediaSources || [])[0]; if (!ms) throw new Error('No playable source');
    PL.ms = ms; PL.psid = info.PlaySessionId || ('cx' + Date.now());
    if (PL.audio == null && ms.DefaultAudioStreamIndex != null) PL.audio = ms.DefaultAudioStreamIndex;
    let url, method;
    if (ms.SupportsDirectPlay && !opts.forceTranscode && qual[0] === 'auto') { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid + (ms.ETag ? '&Tag=' + ms.ETag : ''); }
    else if (ms.TranscodingUrl) { method = /m3u8/.test(ms.TranscodingUrl) ? 'Transcode' : 'DirectStream'; url = absUrl(ms.TranscodingUrl); }
    else if (ms.SupportsDirectPlay) { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid; }
    else throw new Error('Server offered no stream');
    PL.method = method; PL.url = withKey(url);
    await attach(PL.url, startTicks ? startTicks / 1e7 : 0);
    buildTrackMenus(); buildChapters();
  } catch (e) { console.warn('[cinema player]', e); showError(e.message || String(e)); }
}
async function attach(url, startSec) {
  const v = PL.v; v.removeAttribute('src'); v.load(); v.playbackRate = PL.speed;
  const isHls = /m3u8/i.test(url);
  if (isHls && !v.canPlayType('application/vnd.apple.mpegurl')) {
    const Hls = await loadHls(); if (!Hls.isSupported()) throw new Error('This browser cannot play HLS');
    const hls = new Hls({ startPosition: startSec || -1, maxBufferLength: 40, backBufferLength: 30, enableWorker: true, manifestLoadingMaxRetry: 3, levelLoadingMaxRetry: 3, fragLoadingMaxRetry: 4 });
    PL.hls = hls; let netRetry = 0, mediaRetry = 0;
    hls.on(Hls.Events.ERROR, (e, d) => { if (!d.fatal) return; if (d.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry++ < 3) { setStatus(t('plRetry')); hls.startLoad(); } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetry++ < 3) hls.recoverMediaError(); else showError((d.details || 'Playback error') + (d.response && d.response.code ? ' (' + d.response.code + ')' : '')); });
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
  if (fsEl()) try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { }
  try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { }
  PL.open = false; PL.started = false; COVER.hide();
  if (!silent) setTimeout(() => refreshView(), 120);
}
function onPop() { closePlayer(); }
function backFromPlayer() { if (history.state && history.state.cxplayer) history.back(); else closePlayer(); }

async function loadNext(it) {
  PL.nextItem = null; if (PL.el) PL.el.classList.remove('has-next');
  if (it.Type !== 'Episode' || !it.SeriesId) return;
  try { const r = await api('Shows/' + it.SeriesId + '/Episodes', { userId: uid(), startItemId: it.Id, limit: 2, Fields: F_BASE }); const n = (r.Items || []).find(x => x.Id !== it.Id); PL.nextItem = n || null; PL.el && PL.el.classList.toggle('has-next', !!n); } catch (e) { }
}
async function loadSegments(it) {
  PL.segments = [];
  try { const r = await api('MediaSegments/' + it.Id); PL.segments = (r.Items || []).map(s => ({ type: s.Type, start: s.StartTicks / 1e7, end: s.EndTicks / 1e7 })); } catch (e) { }
}
function playNextEp() { if (PL.nextItem) { const n = PL.nextItem; report('Stopped'); PL.started = false; PL.item = n; PL.ms = null; PL.audio = null; PL.sub = -1; PL.encodeSub = false; PL.subTouched = false; setTitle(n); loadNext(n); loadSegments(n); getItem(n.Id).then(f => { PL.item = f; }).catch(() => { }); startStream(0); } }
function playEpisode(ep) { PL.nextItem = ep; playNextEp(); }

/* ---------- UI helpers ---------- */
function setTitle(it) {
  if (!PL.el) return; const ep = it.Type === 'Episode';
  $('.pl-title', PL.el).textContent = ep ? (it.SeriesName || '') : it.Name;
  $('.pl-sub', PL.el).textContent = ep ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : [yearOf(it), it.OfficialRating, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : ''].filter(Boolean).join(' · ');
  $('.pl-btn-eps', PL.el).classList.toggle('hide', !ep);
}
function setStatus(msg) { if (!PL.el) return; PL.el.classList.remove('err'); PL.el.classList.add('loading'); $('.pl-status', PL.el).textContent = msg || ''; }
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
  am.replaceChildren(h('div', { class: 'pl-mh' }, t('plAudio')), ...audios.map(a => mbtn(a.DisplayTitle || a.Language || ('#' + a.Index), a.Index === PL.audio, () => { if (a.Index === PL.audio) return; PL.audio = a.Index; closeMenus(); startStream(ticks()); })));
  sm.replaceChildren(h('div', { class: 'pl-mh' }, t('plSubs')), mbtn(t('plOff'), PL.sub === -1, () => setSub(-1)), ...subs.map(s => mbtn(s.DisplayTitle || s.Language || ('#' + s.Index), s.Index === PL.sub, () => setSub(s.Index), s.DeliveryMethod === 'Encode' ? h('small', {}, t('plBurn')) : null)), h('div', { class: 'pl-sep' }), mbtn(t('plSubStyle'), false, () => { closeMenus(); openSettings('subs'); }));
  $('.pl-btn-audio', PL.el).classList.toggle('hide', audios.length < 2); $('.pl-btn-subs', PL.el).classList.toggle('hide', !subs.length);
  const def = subs.find(s => s.DeliveryUrl && s.IsDefault); if (def && PL.sub === -1 && !PL.subTouched && !PL.encodeSub) setSub(def.Index, true);
}
function setSub(idx, auto) {
  const v = PL.v; const s = idx >= 0 ? PL.ms.MediaStreams.find(x => x.Index === idx) : null; if (!auto) PL.subTouched = true;
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
  if (seg) { btn.classList.add('show'); $('span', btn).textContent = seg.type === 'Outro' ? t('plSkipCredits') : seg.type === 'Recap' ? t('plSkipRecap') : t('plSkipIntro'); btn.onclick = () => { v.currentTime = seg.end; btn.classList.remove('show'); }; if (pcfg('autoSkip', false) && seg.type === 'Intro') { v.currentTime = seg.end; btn.classList.remove('show'); } } else btn.classList.remove('show');
}
function checkNextCard() {
  const v = PL.v; const card_ = $('.pl-nextcard', PL.el); const d = v.duration; if (!PL.nextItem || !d || !isFinite(d)) { card_.classList.remove('show'); return; }
  const left = d - v.currentTime; const out = PL.segments.find(s => s.type === 'Outro');
  const show = left < 24 && left > 0 && pcfg('autoNext', true);
  card_.classList.toggle('show', show); if (show) { $('.pl-nc-t', card_).textContent = (PL.nextItem.SeriesName ? '' : '') + 'S' + (PL.nextItem.ParentIndexNumber || 0) + ':E' + (PL.nextItem.IndexNumber || 0) + ' · ' + PL.nextItem.Name; $('.pl-nc-s', card_).textContent = t('plNextIn') + ' ' + Math.ceil(left) + ' s'; }
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
      row(t('plSpeed'), seg([[0.5, '0.5×'], [0.75, '0.75×'], [1, '1×'], [1.25, '1.25×'], [1.5, '1.5×'], [2, '2×']], PL.speed, v => { PL.speed = +v; PL.v.playbackRate = +v; })));
  } else if (tab === 'playback') {
    body.append(row(t('plAutoNext'), sw('autoNext', true), t('plAutoNextHint')), row(t('plAutoSkip'), sw('autoSkip', false), t('plAutoSkipHint')), row(t('plRemember'), sw('rememberVol', true)));
  } else if (tab === 'subs') {
    body.append(row(t('plSubSize'), seg([['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], pcfg('subSize', 'm'), v => { psave('subSize', v); applySubStyle(); })),
      row(t('plSubPos'), seg([[4, t('plLow')], [9, t('plMid')], [16, t('plHigh')]], pcfg('subPos', 9), v => { psave('subPos', +v); applySubStyle(); })),
      row(t('plSubBg'), seg([['shadow', t('plShadow')], ['box', t('plBox')], ['none', t('plNone')]], pcfg('subBg', 'shadow'), v => { psave('subBg', v); applySubStyle(); })),
      row(t('plSubColor'), seg([['#ffffff', t('plWhite')], ['#ffe14d', t('plYellow')], ['#7dffb1', t('plGreen')]], pcfg('subColor', '#ffffff'), v => { psave('subColor', v); applySubStyle(); })),
      row(t('plSubBold'), sw('subBold', false, () => applySubStyle())),
      row(t('plSubFont'), seg([['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']], pcfg('subFont', 'sans'), v => { psave('subFont', v); applySubStyle(); })));
    body.append(h('div', { class: 'pl-subpreview' }, h('span', {}, t('plSubPreview'))));
  } else if (tab === 'keys') {
    [['Space / K', t('plKPlay')], ['← →  /  J L', '±10 s'], ['↑ ↓', t('plKVol')], ['F', t('plKFs')], ['M', t('plKMute')], ['C', t('plSubs')], ['I', t('plInfo')], ['Esc', t('plKBack')]].forEach(([k, d]) => body.append(h('div', { class: 'pl-key' }, h('kbd', {}, k), h('span', {}, d))));
  }
  panel.replaceChildren(h('div', { class: 'pl-stabs' }, tabs.map(k => h('button', { class: k === tab ? 'on' : '', onclick: () => openSettings(k) }, t('plTab_' + k))), h('button', { class: 'pl-sclose', onclick: () => panel.classList.remove('open'), 'aria-label': 'Close' }, ic('close'))), body);
  panel.classList.add('open'); closeMenus(); wake();
}
async function showEpisodes() {
  const m = $('.pl-menu-eps', PL.el); toggleMenu('.pl-menu-eps'); if (m.dataset.loaded === PL.item.SeasonId) return;
  m.replaceChildren(h('div', { class: 'pl-mh' }, t('episodes')), h('div', { class: 'spinner', style: 'margin:20px auto;width:26px;height:26px' }));
  try { const r = await api('Shows/' + PL.item.SeriesId + '/Episodes', { userId: uid(), seasonId: PL.item.SeasonId, Fields: F_BASE }); m.dataset.loaded = PL.item.SeasonId; m.replaceChildren(h('div', { class: 'pl-mh' }, (PL.item.SeasonName || t('episodes'))), ...r.Items.map(ep => h('button', { class: ep.Id === PL.item.Id ? 'on' : '', onclick: () => { closeMenus(); if (ep.Id !== PL.item.Id) playEpisode(ep); } }, h('span', {}, (ep.IndexNumber || '') + '. ' + ep.Name), ud(ep).Played ? h('small', {}, '✓') : null))); } catch (e) { }
}
function showStats(on) { const st = $('.pl-stats', PL.el); if (on === undefined) on = !st.classList.contains('open'); st.classList.toggle('open', on); clearInterval(PL.statT); if (!on) return; const upd = () => { const v = PL.v; if (!v) return; const ms = PL.ms || {}; const vs = (ms.MediaStreams || []).find(s => s.Type === 'Video') || {}; const q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : {}; st.replaceChildren(...[[t('plMethod'), PL.method || ''], [t('plSource'), [(ms.Container || '').toUpperCase(), (vs.Codec || '').toUpperCase(), vs.Width && vs.Height ? vs.Width + '×' + vs.Height : ''].filter(Boolean).join(' · ')], [t('plPlaying'), v.videoWidth + '×' + v.videoHeight], [t('plBitrate'), ms.Bitrate ? (ms.Bitrate / 1e6).toFixed(1) + ' Mbps' : ''], [t('plBuffer'), v.buffered.length ? Math.round(v.buffered.end(v.buffered.length - 1) - v.currentTime) + ' s' : '0 s'], [t('plDropped'), (q.droppedVideoFrames || 0) + ' / ' + (q.totalVideoFrames || 0)]].map(([k, val]) => h('div', {}, h('span', {}, k), h('b', {}, val)))); }; upd(); PL.statT = setInterval(upd, 1000); }

/* build */
function buildPlayerUI(it) {
  const v = h('video', { playsinline: '', preload: 'auto' });
  const seekFill = h('i'), seekBuf = h('em'), seekKnob = h('b'), bubble = h('div', { class: 'pl-bubble' }, h('div', { class: 'pl-thumb' }), h('span', {})), chapters = h('div', { class: 'pl-chapters' });
  const seek = h('div', { class: 'pl-seek' }, seekBuf, chapters, seekFill, seekKnob, bubble);
  const tCur = h('span', {}, '0:00'), tDur = h('span', {}, '0:00');
  const ppBtn = h('button', { class: 'pl-pp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play'));
  const volBar = seekBarEl(f => { v.volume = f; v.muted = false; if (pcfg('rememberVol', true)) try { localStorage.setItem('cx-pvol', f); } catch (e) { } updVol(); });
  const muteBtn = h('button', { onclick: () => { v.muted = !v.muted; updVol(); }, 'aria-label': 'Mute' }, pic('vol'));
  const tip = (label, el) => { el.setAttribute('data-tip', label); el.setAttribute('aria-label', label); return el; };
  const subsEl = h('div', { class: 'pl-subs' });
  const el = h('div', { id: 'cx-player', class: 'loading' }, v, subsEl,
    
    h('div', { class: 'pl-top' }, tip(t('plBack'), h('button', { class: 'pl-back', onclick: backFromPlayer }, pic('back'))), h('div', { class: 'pl-ttl' }, h('div', { class: 'pl-title ell' }), h('div', { class: 'pl-sub ell' })), tip(t('plInfo'), h('button', { class: 'pl-round', onclick: () => showStats() }, pic('info')))),
    h('div', { class: 'pl-stats' }),
    h('div', { class: 'pl-bigctl' }, h('button', { 'aria-label': '-10', onclick: () => skip(-10) }, skipIcon(-1)), h('button', { class: 'pl-bigpp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play')), h('button', { 'aria-label': '+10', onclick: () => skip(10) }, skipIcon(1))),
    h('div', { class: 'pl-center' }, h('div', { class: 'pl-spin' }), h('div', { class: 'pl-status' })),
    h('div', { class: 'pl-flash' }),
    h('div', { class: 'pl-err' }, h('b', {}, t('plFail')), h('p', { class: 'pl-errmsg' }), h('div', { class: 'nf-btns', style: 'justify-content:center' },
      h('button', { class: 'btn white', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p); } }, t('plRetryBtn')),
      h('button', { class: 'btn grey', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p, { forceTranscode: true }); } }, t('plTranscode')),
      h('button', { class: 'btn grey', onclick: () => { const id = PL.item.Id; closePlayer(); playNative(id); } }, t('plNative')))),
    h('button', { class: 'pl-skipseg btn white' }, pic('skip'), h('span', {}, t('plSkipIntro'))),
    h('div', { class: 'pl-nextcard' }, h('div', { class: 'pl-nc-s' }), h('div', { class: 'pl-nc-t ell' }), h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: playNextEp }, pic('next'), t('plNext')), h('button', { class: 'btn grey', onclick: () => { psave('autoNext', false); $('.pl-nextcard', el).classList.remove('show'); } }, t('cancel')))),
    h('div', { class: 'pl-bar' }, seek, h('div', { class: 'pl-row' },
      ppBtn, tip(t('plBack10'), h('button', { onclick: () => skip(-10), class: 'pl-skip' }, skipIcon(-1))), tip(t('plFwd10'), h('button', { onclick: () => skip(10), class: 'pl-skip' }, skipIcon(1))),
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
  v.addEventListener('timeupdate', () => {
    const d = dur(); const f = d ? v.currentTime / d : 0; if (!seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; }
    tCur.textContent = fmtT(v.currentTime); tDur.textContent = fmtT(d);
    if (v.buffered.length) { const e = v.buffered.end(v.buffered.length - 1); seekBuf.style.width = (d ? e / d : 0) * 100 + '%'; }
    if (Date.now() - PL.lastRep > 10000 && !v.paused) { PL.lastRep = Date.now(); report('Progress', { EventName: 'timeupdate' }); }
    checkSegments(); checkNextCard();
  });
  v.addEventListener('playing', () => { el.classList.remove('loading', 'err'); if (!PL.started) { PL.started = true; report('Start'); } ppBtn.replaceChildren(pic('pause')); $('.pl-bigpp', el).replaceChildren(pic('pause')); el.classList.add('is-playing'); wake(); });
  v.addEventListener('pause', () => { ppBtn.replaceChildren(pic('play')); $('.pl-bigpp', el).replaceChildren(pic('play')); el.classList.remove('is-playing'); report('Progress', { EventName: 'pause' }); wake(); });
  v.addEventListener('waiting', () => { if (!v.paused) { el.classList.add('loading'); $('.pl-status', el).textContent = ''; } });
  v.addEventListener('canplay', () => el.classList.remove('loading'));
  v.addEventListener('ended', () => { if (PL.nextItem && pcfg('autoNext', true)) playNextEp(); else backFromPlayer(); });
  v.addEventListener('error', () => { if (!PL.hls) showError(v.error ? (v.error.message || ('Media error ' + v.error.code)) : 'Playback error'); });
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
  const flash = (txt, side) => { const f = $('.pl-flash', el); f.textContent = txt; f.className = 'pl-flash show ' + (side || ''); clearTimeout(f._t); f._t = setTimeout(() => { f.className = 'pl-flash'; }, 600); };
  /* touch: tap = show/hide controls, double tap left/right = +-10 s, double tap middle = play/pause */
  let tapStart = null, lastTap = 0, lastZone = '', prevIdle = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; tapStart = { x: e.clientX, y: e.clientY, t: Date.now() }; });
  el.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' || !tapStart) return; const s0 = tapStart; tapStart = null;
    if (Math.abs(e.clientX - s0.x) > 14 || Math.abs(e.clientY - s0.y) > 14 || Date.now() - s0.t > 500) return;
    if (e.target.closest && e.target.closest('button, a, input, .pl-seek, .pl-settings, .pl-menu, .pl-skipseg, .pl-nextcard, .pl-err')) { if (!el.classList.contains('idle')) wake(); return; }
    if ($('.pl-menu.open, .pl-settings.open', el)) { closeMenus(); $('.pl-settings', el).classList.remove('open'); wake(); return; }
    const now = Date.now(); const r = el.getBoundingClientRect(); const z = (e.clientX - r.left) / r.width; const zone = z < .34 ? 'l' : z > .66 ? 'r' : 'c';
    if (now - lastTap < 300 && zone === lastZone) {
      lastTap = 0; if (zone === 'l') { skip(-10); flash('-10 s', 'l'); } else if (zone === 'r') { skip(10); flash('+10 s', 'r'); } else togglePlay();
      if (prevIdle && zone !== 'c') { el.classList.add('idle'); clearTimeout(PL.idleT); } else wake(); return;
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
function skip(s) { const v = PL.v; if (v) v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + s)); wake(); }
const nativeFs = () => { const n = window.NativeShell, i = window.NativeInterface; return n && n.enableFullscreen ? n : (i && i.enableFullscreen ? i : null); };
function setNativeFs(on) { const n = nativeFs(); if (!n) return false; try { on ? n.enableFullscreen() : n.disableFullscreen(); PL.nfs = on; if (typeof onFsChange === 'function') onFsChange(); } catch (e) { return false; } return true; }
function fsEl() { return PL.nfs || document.fullscreenElement || document.webkitFullscreenElement; }
function toggleFs() {
  const el = PL.el, v = PL.v; if (!el) return;
  if (nativeFs()) { setNativeFs(!PL.nfs); return; }
  if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { } return; }
  const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } };
  const rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (rq) { const r = rq.call(el, { navigationUI: 'hide' }); if (r && r.then) r.then(lock).catch(() => { v.webkitEnterFullscreen && v.webkitEnterFullscreen(); }); else lock(); }
  else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
}
const onFsChange = () => { if (PL.el) { const b = $('.pl-fs', PL.el); b && b.replaceChildren(pic(fsEl() ? 'fsx' : 'fs')); } }; document.addEventListener('fullscreenchange', onFsChange); document.addEventListener('webkitfullscreenchange', onFsChange);
function onKey(e) {
  if (!PL.open || (e.target.closest && e.target.closest('input,textarea'))) return;
  const k = e.key; let used = true;
  if (k === ' ' || k === 'k') togglePlay(); else if (k === 'ArrowRight' || k === 'l') skip(10); else if (k === 'ArrowLeft' || k === 'j') skip(-10);
  else if (k === 'ArrowUp') PL.v.volume = Math.min(1, PL.v.volume + .1); else if (k === 'ArrowDown') PL.v.volume = Math.max(0, PL.v.volume - .1);
  else if (k === 'f') toggleFs(); else if (k === 'm') PL.v.muted = !PL.v.muted; else if (k === 'i') showStats(); else if (k === 'c') { const b = $('.pl-btn-subs:not(.hide)', PL.el); b && toggleMenu('.pl-menu-subs'); }
  else if (k === 'Escape') { if ($('.pl-settings.open, .pl-menu.open', PL.el)) { $('.pl-settings', PL.el).classList.remove('open'); closeMenus(); } else if (!document.fullscreenElement) backFromPlayer(); else used = false; } else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); wake(); }
}

/* native fallback */
function playNative(id) {
  COVER.show(); C.allowNative = true; location.hash = '#/details?id=' + id; let tries = 0;
  const iv = setInterval(() => { tries++; const page = $('#itemDetailPage:not(.hide)'); const btn = page && ($('.btnResume:not(.hide)', page) || $('.btnPlay:not(.hide)', page)); if (btn) { clearInterval(iv); btn.click(); } if (tries > 80) { clearInterval(iv); COVER.hide(); } }, 150);
}
