/* ---------- Cinema video player: PlaybackInfo + direct play / HLS, own controls ---------- */
const HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
let hlsLoading = null;
const loadHls = () => window.Hls ? Promise.resolve(window.Hls) : (hlsLoading || (hlsLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = HLS_URL; s.onload = () => res(window.Hls); s.onerror = () => rej(new Error('hls.js failed to load')); document.head.append(s); })));
const tok = () => ApiClient.accessToken();
const absUrl = u => /^https?:/i.test(u) ? u : ApiClient.serverAddress().replace(/\/$/, '') + (u.startsWith('/') ? u : '/' + u);
const withKey = u => /[?&](api_key|ApiKey)=/i.test(u) ? u : u + (u.includes('?') ? '&' : '?') + 'ApiKey=' + encodeURIComponent(tok());

function deviceProfile() {
  const hevc = !!(window.MediaSource && MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L120.90,mp4a.40.2"'));
  const vcodecs = 'h264' + (hevc ? ',hevc' : '');
  const tp = [];
  if (hevc) tp.push({ Container: 'mp4', Type: 'Video', AudioCodec: 'aac,mp3,opus,flac', VideoCodec: 'hevc,h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  tp.push({ Container: 'ts', Type: 'Video', AudioCodec: 'aac,mp3', VideoCodec: 'h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  return {
    Name: 'Cinema', MaxStreamingBitrate: 120000000, MaxStaticBitrate: 100000000, MusicStreamingTranscodingBitrate: 384000,
    DirectPlayProfiles: [{ Container: 'mp4,m4v,mov', Type: 'Video', VideoCodec: vcodecs, AudioCodec: 'aac,mp3,opus,flac,vorbis' }, { Container: 'webm', Type: 'Video', VideoCodec: 'vp8,vp9,av1', AudioCodec: 'vorbis,opus' }],
    TranscodingProfiles: tp, ContainerProfiles: [],
    CodecProfiles: [{ Type: 'Video', Codec: 'h264', Conditions: [{ Condition: 'LessThanEqual', Property: 'VideoBitDepth', Value: '8', IsRequired: false }] }],
    SubtitleProfiles: [{ Format: 'vtt', Method: 'External' }]
  };
}

const PL = { el: null, v: null, hls: null, item: null, ms: null, psid: null, method: null, audio: null, sub: -1, started: false, lastRep: 0, idleT: 0, open: false, nextItem: null };

async function openPlayer(it, startTicks) {
  closePlayer(true);
  PL.item = it; PL.open = true; PL.started = false; PL.sub = -1; PL.audio = null; PL.nextItem = null;
  buildPlayerUI(it);
  history.pushState({ cxplayer: 1 }, '');
  window.addEventListener('popstate', onPop);
  document.addEventListener('keydown', onKey, true);
  P.audio && !P.audio.paused && P.audio.pause();
  let full = it; try { full = await getItem(it.Id); } catch (e) { }
  PL.item = full;
  const resume = startTicks != null ? startTicks : (ud(full).PlaybackPositionTicks || 0);
  setTitle(full);
  loadNext(full);
  await startStream(resume);
}
async function startStream(startTicks, opts) {
  opts = opts || {};
  const it = PL.item; setStatus(t('plPreparing'));
  stopTimers(); detach();
  try {
    const body = { DeviceProfile: deviceProfile() };
    const q = { UserId: uid(), StartTimeTicks: startTicks || 0, MaxStreamingBitrate: 120000000, AutoOpenLiveStream: true };
    if (PL.audio != null) q.AudioStreamIndex = PL.audio;
    if (PL.ms) q.MediaSourceId = PL.ms.Id;
    if (PL.encodeSub && PL.sub >= 0) q.SubtitleStreamIndex = PL.sub;
    const info = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Items/' + it.Id + '/PlaybackInfo', q), data: JSON.stringify(body), contentType: 'application/json', dataType: 'json' });
    if (info.ErrorCode) throw new Error(t('plErr_' + info.ErrorCode) !== 'plErr_' + info.ErrorCode ? t('plErr_' + info.ErrorCode) : info.ErrorCode);
    const ms = (info.MediaSources || [])[0]; if (!ms) throw new Error('No playable source');
    PL.ms = ms; PL.psid = info.PlaySessionId || ('cx' + Date.now());
    if (PL.audio == null) PL.audio = ms.DefaultAudioStreamIndex != null ? ms.DefaultAudioStreamIndex : null;
    let url, method;
    if (ms.SupportsDirectPlay && !opts.forceTranscode) { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid + (ms.ETag ? '&Tag=' + ms.ETag : ''); }
    else if (ms.TranscodingUrl) { method = ms.TranscodingSubProtocol === 'hls' || /m3u8/.test(ms.TranscodingUrl) ? 'Transcode' : 'DirectStream'; url = absUrl(ms.TranscodingUrl); }
    else throw new Error('Server offered no stream');
    url = withKey(url); PL.method = method;
    await attach(url, startTicks ? startTicks / 1e7 : 0, method);
    buildTrackMenus();
  } catch (e) { console.warn('[cinema player]', e); showError(e.message || String(e)); }
}
async function attach(url, startSec, method) {
  const v = PL.v; v.removeAttribute('src'); v.load();
  const isHls = /m3u8/i.test(url);
  if (isHls && !v.canPlayType('application/vnd.apple.mpegurl')) {
    const Hls = await loadHls();
    if (!Hls.isSupported()) throw new Error('This browser cannot play HLS');
    const hls = new Hls({ startPosition: startSec || -1, maxBufferLength: 40, backBufferLength: 30, enableWorker: true, manifestLoadingMaxRetry: 3, levelLoadingMaxRetry: 3, fragLoadingMaxRetry: 4 });
    PL.hls = hls; let netRetry = 0, mediaRetry = 0;
    hls.on(Hls.Events.ERROR, (e, d) => {
      if (!d.fatal) return;
      if (d.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry++ < 3) { setStatus(t('plRetry')); hls.startLoad(); }
      else if (d.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetry++ < 3) hls.recoverMediaError();
      else showError((d.details || 'Playback error') + (d.response && d.response.code ? ' (' + d.response.code + ')' : ''));
    });
    hls.loadSource(url); hls.attachMedia(v);
  } else { v.src = url; if (startSec && !isHls) v.addEventListener('loadedmetadata', () => { v.currentTime = startSec; }, { once: true }); else if (startSec) v.addEventListener('loadedmetadata', () => { v.currentTime = startSec; }, { once: true }); }
  try { await v.play(); } catch (e) { if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') throw e; }
}
function detach() { if (PL.hls) { try { PL.hls.destroy(); } catch (e) { } PL.hls = null; } if (PL.v) { PL.v.pause(); PL.v.removeAttribute('src'); PL.v.querySelectorAll('track').forEach(t_ => t_.remove()); } }
function stopTimers() { clearInterval(PL.repT); }
const ticks = () => Math.floor((PL.v ? PL.v.currentTime : 0) * 1e7);
function report(kind, extra) {
  if (!PL.item || !PL.ms) return;
  try { ApiClient['reportPlayback' + kind](Object.assign({ ItemId: PL.item.Id, MediaSourceId: PL.ms.Id, PlaySessionId: PL.psid, PlayMethod: PL.method || 'DirectPlay', PositionTicks: ticks(), IsPaused: PL.v ? PL.v.paused : false, CanSeek: true, AudioStreamIndex: PL.audio, SubtitleStreamIndex: PL.sub, QueueableMediaTypes: ['Video'] }, extra)); } catch (e) { }
}
function closePlayer(silent) {
  if (!PL.open) return;
  if (PL.started) { report('Stopped'); try { if (PL.method === 'Transcode') ApiClient.stopActiveEncodings(PL.psid); } catch (e) { } }
  stopTimers(); detach();
  if (PL.el) { PL.el.remove(); PL.el = null; PL.v = null; }
  window.removeEventListener('popstate', onPop); document.removeEventListener('keydown', onKey, true);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
  PL.open = false; PL.started = false; COVER.hide();
  if (!silent && history.state && history.state.cxplayer) { /* already popped by back */ }
}
function onPop() { closePlayer(); }
function backFromPlayer() { if (history.state && history.state.cxplayer) history.back(); else closePlayer(); }

async function loadNext(it) {
  PL.nextItem = null;
  if (it.Type !== 'Episode' || !it.SeriesId) return;
  try { const r = await api('Shows/' + it.SeriesId + '/Episodes', { userId: uid(), startItemId: it.Id, limit: 2, Fields: F_BASE }); const n = (r.Items || []).find(x => x.Id !== it.Id); PL.nextItem = n || null; PL.el && PL.el.classList.toggle('has-next', !!n); } catch (e) { }
}
function playNextEp() { if (PL.nextItem) { const n = PL.nextItem; report('Stopped'); PL.started = false; PL.item = n; PL.ms = null; PL.audio = null; PL.sub = -1; setTitle(n); loadNext(n); startStream(0); } }

/* ---------- UI ---------- */
function setTitle(it) {
  if (!PL.el) return; const ep = it.Type === 'Episode';
  $('.pl-title', PL.el).textContent = ep ? (it.SeriesName || '') : it.Name;
  $('.pl-sub', PL.el).textContent = ep ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : [yearOf(it), it.OfficialRating].filter(Boolean).join(' · ');
}
function setStatus(msg) { if (!PL.el) return; PL.el.classList.remove('err'); PL.el.classList.add('loading'); $('.pl-status', PL.el).textContent = msg || ''; }
function showError(msg) {
  if (!PL.el) return; PL.el.classList.remove('loading'); PL.el.classList.add('err');
  $('.pl-errmsg', PL.el).textContent = msg;
}
function menuBtn(label, onclick) { return h('button', { onclick }, label); }
function buildTrackMenus() {
  if (!PL.el || !PL.ms) return;
  const audios = PL.ms.MediaStreams.filter(s => s.Type === 'Audio'); const subs = PL.ms.MediaStreams.filter(s => s.Type === 'Subtitle');
  const am = $('.pl-menu-audio', PL.el), sm = $('.pl-menu-subs', PL.el);
  am.replaceChildren(h('div', { class: 'pl-mh' }, t('plAudio')), ...audios.map(a => h('button', { class: a.Index === PL.audio ? 'on' : '', onclick: () => { if (a.Index === PL.audio) return; PL.audio = a.Index; const pos = ticks(); startStream(pos); closeMenus(); } }, [a.DisplayTitle || a.Language || ('#' + a.Index)])));
  sm.replaceChildren(h('div', { class: 'pl-mh' }, t('plSubs')), h('button', { class: PL.sub === -1 ? 'on' : '', onclick: () => setSub(-1) }, t('plOff')), ...subs.filter(s => s.DeliveryUrl || s.DeliveryMethod === 'Encode').map(s => h('button', { class: s.Index === PL.sub ? 'on' : '', onclick: () => setSub(s.Index) }, s.DisplayTitle || s.Language || ('#' + s.Index))));
  $('.pl-btn-audio', PL.el).classList.toggle('hide', audios.length < 2); $('.pl-btn-subs', PL.el).classList.toggle('hide', !subs.some(s => s.DeliveryUrl || s.DeliveryMethod === 'Encode'));
  const def = subs.find(s => s.DeliveryUrl && s.IsDefault); if (def && PL.sub === -1 && !PL.subTouched && !PL.encodeSub) setSub(def.Index, true); else markSubs();
}
function setSub(idx, auto) {
  const v = PL.v; const s = idx >= 0 ? PL.ms.MediaStreams.find(x => x.Index === idx) : null;
  if (!auto) PL.subTouched = true;
  const wasEncode = !!PL.encodeSub;
  PL.sub = idx; v.querySelectorAll('track').forEach(x => x.remove());
  if (s && s.DeliveryMethod === 'Encode' && !s.DeliveryUrl) { PL.encodeSub = true; closeMenus(); startStream(ticks()); return; }
  PL.encodeSub = false;
  if (wasEncode) { closeMenus(); startStream(ticks()); return; }
  if (s && s.DeliveryUrl) { const tr = document.createElement('track'); tr.kind = 'subtitles'; tr.label = s.DisplayTitle || 'Sub'; tr.srclang = s.Language || 'und'; tr.src = withKey(absUrl(s.DeliveryUrl)); tr.default = true; v.append(tr); setTimeout(() => { for (const x of v.textTracks) x.mode = 'showing'; }, 200); }
  markSubs(); closeMenus();
}
function markSubs() { const subs = PL.ms.MediaStreams.filter(s => s.Type === 'Subtitle' && (s.DeliveryUrl || s.DeliveryMethod === 'Encode')); $$('.pl-menu-subs button', PL.el).forEach((b, i) => b.classList.toggle('on', i === 0 ? PL.sub === -1 : subs[i - 1].Index === PL.sub)); }
function closeMenus() { $$('.pl-menu', PL.el).forEach(m => m.classList.remove('open')); }
function toggleMenu(cls) { const m = $(cls, PL.el); const was = m.classList.contains('open'); closeMenus(); if (!was) m.classList.add('open'); }

function buildPlayerUI(it) {
  const v = h('video', { playsinline: '', preload: 'auto' });
  const seekFill = h('i'), seekBuf = h('em'), seekKnob = h('b'), bubble = h('span', { class: 'pl-bubble' });
  const seek = h('div', { class: 'pl-seek' }, seekBuf, seekFill, seekKnob, bubble);
  const tCur = h('span', {}, '0:00'), tDur = h('span', {}, '0:00');
  const ppBtn = h('button', { class: 'pl-pp', 'aria-label': 'Play/Pause', onclick: () => togglePlay() }, ic('play'));
  const volBar = seekBarEl(f => { v.volume = f; v.muted = false; try { localStorage.setItem('cx-pvol', f); } catch (e) { } updVol(); });
  const muteBtn = h('button', { onclick: () => { v.muted = !v.muted; updVol(); }, 'aria-label': 'Mute' }, ic('vol'));
  const speedMenu = h('div', { class: 'pl-menu pl-menu-speed' }, h('div', { class: 'pl-mh' }, t('plSpeed')), [0.5, 0.75, 1, 1.25, 1.5, 2].map(s => h('button', { class: s === 1 ? 'on' : '', onclick: e => { v.playbackRate = s; $$('.pl-menu-speed button', PL.el).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); closeMenus(); } }, s + '×')));
  const el = h('div', { id: 'cx-player', class: 'loading' }, v,
    h('div', { class: 'pl-top' }, h('button', { class: 'pl-back', onclick: backFromPlayer, 'aria-label': 'Back' }, ic('left')), h('div', {}, h('div', { class: 'pl-title ell' }), h('div', { class: 'pl-sub ell' }))),
    h('div', { class: 'pl-center' }, h('div', { class: 'pl-spin' }), h('div', { class: 'pl-status' })),
    h('div', { class: 'pl-err' }, h('b', {}, t('plFail')), h('p', { class: 'pl-errmsg' }), h('div', { class: 'nf-btns', style: 'justify-content:center' },
      h('button', { class: 'btn white', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p); } }, t('plRetryBtn')),
      h('button', { class: 'btn grey', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p, { forceTranscode: true }); } }, t('plTranscode')),
      h('button', { class: 'btn grey', onclick: () => { const id = PL.item.Id; closePlayer(); playNative(id); } }, t('plNative')))),
    h('div', { class: 'pl-next' }, h('button', { class: 'btn white', onclick: playNextEp }, ic('next'), t('plNext'))),
    h('div', { class: 'pl-bar' }, seek, h('div', { class: 'pl-row' },
      ppBtn, h('button', { onclick: () => skip(-10), 'aria-label': '-10s', class: 'pl-skip' }, ic('refresh', 'rot-l'), h('small', {}, '10')), h('button', { onclick: () => skip(10), 'aria-label': '+10s', class: 'pl-skip' }, ic('refresh'), h('small', {}, '10')),
      h('div', { class: 'pl-vol' }, muteBtn, volBar), h('div', { class: 'pl-time' }, tCur, ' / ', tDur), h('div', { style: 'flex:1' }),
      h('div', { class: 'pl-btn-wrap pl-btn-audio hide' }, h('button', { onclick: () => toggleMenu('.pl-menu-audio'), 'aria-label': t('plAudio') }, ic('vol')), h('div', { class: 'pl-menu pl-menu-audio' })),
      h('div', { class: 'pl-btn-wrap pl-btn-subs hide' }, h('button', { onclick: () => toggleMenu('.pl-menu-subs'), 'aria-label': t('plSubs') }, ic('queue')), h('div', { class: 'pl-menu pl-menu-subs' })),
      h('div', { class: 'pl-btn-wrap' }, h('button', { onclick: () => toggleMenu('.pl-menu-speed'), 'aria-label': t('plSpeed') }, ic('refresh')), speedMenu),
      h('button', { onclick: () => toggleFs(), 'aria-label': 'Fullscreen' }, ic('fs')))));
  getUI().append(el); PL.el = el; PL.v = v;
  try { const sv = parseFloat(localStorage.getItem('cx-pvol')); if (isFinite(sv)) v.volume = sv; } catch (e) { }
  function updVol() { volBar.set(v.muted ? 0 : v.volume); }
  updVol();
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };
  const dur = () => (isFinite(v.duration) && v.duration > 0) ? v.duration : ((PL.item && PL.item.RunTimeTicks) || 0) / 1e7;
  v.addEventListener('timeupdate', () => { const d = dur(); const f = d ? v.currentTime / d : 0; if (!seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; } tCur.textContent = fmt(v.currentTime); tDur.textContent = fmt(d); if (v.buffered.length) { const e = v.buffered.end(v.buffered.length - 1); seekBuf.style.width = (d ? e / d : 0) * 100 + '%'; } if (Date.now() - PL.lastRep > 10000 && !v.paused) { PL.lastRep = Date.now(); report('Progress', { EventName: 'timeupdate' }); } });
  v.addEventListener('playing', () => { el.classList.remove('loading', 'err'); if (!PL.started) { PL.started = true; report('Start'); } ppBtn.replaceChildren(ic('pause')); wake(); });
  v.addEventListener('pause', () => { ppBtn.replaceChildren(ic('play')); report('Progress', { EventName: 'pause' }); wake(); });
  v.addEventListener('waiting', () => { if (!v.paused) { el.classList.add('loading'); $('.pl-status', el).textContent = ''; } });
  v.addEventListener('canplay', () => el.classList.remove('loading'));
  v.addEventListener('ended', () => { if (PL.nextItem) playNextEp(); else backFromPlayer(); });
  v.addEventListener('error', () => { if (!PL.hls) showError(v.error ? (v.error.message || ('Media error ' + v.error.code)) : 'Playback error'); });
  v.addEventListener('click', () => togglePlay());
  v.addEventListener('dblclick', () => toggleFs());
  let seekDrag = false;
  const frac = e => { const r = seek.getBoundingClientRect(); return Math.max(0, Math.min(1, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width)); };
  seek.addEventListener('pointerdown', e => { seekDrag = true; seek.setPointerCapture(e.pointerId); const f = frac(e); seekFill.style.width = f * 100 + '%'; });
  seek.addEventListener('pointermove', e => { const f = frac(e); bubble.style.left = f * 100 + '%'; bubble.textContent = fmt(f * dur()); if (seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; } });
  seek.addEventListener('pointerup', e => { if (seekDrag) { seekDrag = false; const f = frac(e); v.currentTime = f * dur(); report('Progress', { EventName: 'timeupdate' }); } });
  el.addEventListener('mousemove', wake); el.addEventListener('touchstart', wake, { passive: true }); el.addEventListener('click', e => { if (!e.target.closest('.pl-menu, .pl-btn-wrap')) closeMenus(); });
  wake();
}
function seekBarEl(onChange) {
  const fill = h('i'), bar = h('div', { class: 'pl-vbar' }, fill); let d = false;
  const f = e => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
  bar.addEventListener('pointerdown', e => { d = true; bar.setPointerCapture(e.pointerId); onChange(f(e)); });
  bar.addEventListener('pointermove', e => { if (d) onChange(f(e)); }); bar.addEventListener('pointerup', () => { d = false; });
  bar.set = x => { fill.style.width = x * 100 + '%'; }; return bar;
}
function wake() { if (!PL.el) return; PL.el.classList.remove('idle'); clearTimeout(PL.idleT); PL.idleT = setTimeout(() => { if (PL.v && !PL.v.paused && !$('.pl-menu.open', PL.el)) PL.el.classList.add('idle'); }, 3200); }
function togglePlay() { const v = PL.v; if (!v) return; v.paused ? v.play().catch(() => { }) : v.pause(); }
function skip(s) { const v = PL.v; if (v) v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + s)); wake(); }
function toggleFs() { if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); else PL.el.requestFullscreen && PL.el.requestFullscreen().catch(() => { }); }
function onKey(e) {
  if (!PL.open || e.target.closest && e.target.closest('input,textarea')) return;
  const k = e.key; let used = true;
  if (k === ' ' || k === 'k') togglePlay(); else if (k === 'ArrowRight' || k === 'l') skip(10); else if (k === 'ArrowLeft' || k === 'j') skip(-10);
  else if (k === 'ArrowUp') { PL.v.volume = Math.min(1, PL.v.volume + .1); } else if (k === 'ArrowDown') { PL.v.volume = Math.max(0, PL.v.volume - .1); }
  else if (k === 'f') toggleFs(); else if (k === 'm') PL.v.muted = !PL.v.muted; else if (k === 'Escape') { if (!document.fullscreenElement) backFromPlayer(); else used = false; } else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); wake(); }
}

/* native fallback (old behaviour) */
function playNative(id) {
  COVER.show(); C.allowNative = true; location.hash = '#/details?id=' + id; let tries = 0;
  const iv = setInterval(() => { tries++; const page = $('#itemDetailPage:not(.hide)'); const btn = page && ($('.btnResume:not(.hide)', page) || $('.btnPlay:not(.hide)', page)); if (btn) { clearInterval(iv); btn.click(); } if (tries > 80) { clearInterval(iv); COVER.hide(); } }, 150);
}
