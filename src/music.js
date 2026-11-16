/* ---------- Cinema UI music: player engine + Spotify-style views ---------- */
const P = {
  audio: new Audio(), orig: [], q: [], i: -1, shuffle: false, repeat: 0, subs: [], psid: null, lastReport: 0, reportedStart: false, ctx: null
};
C.P = P; P.audio.preload = 'auto';
const cur = () => P.q[P.i] || null;
const emit = () => P.subs.forEach(f => { try { f(); } catch (e) { } });
const TF = 'Fields=PrimaryImageAspectRatio,Genres,ProductionYear,DateCreated,ParentId,AlbumId,AlbumPrimaryImageTag,Artists,ArtistItems';
const AUD_F = 'PrimaryImageAspectRatio,Genres,ProductionYear,DateCreated,ParentId,AlbumId,AlbumPrimaryImageTag,Artists,ArtistItems,RunTimeTicks,UserData';
const trackImg = (it, w) => imgUrl(it, 'Primary', w || 120);
const artistLinks = it => (it.ArtistItems || []).length ? it.ArtistItems.map((a, i) => [i ? ', ' : '', h('a', { href: '#/c/music/artist/' + a.Id, onclick: e => e.stopPropagation() }, a.Name)]) : (it.AlbumArtist || (it.Artists || [])[0] || '');
const artistText = it => (it.ArtistItems || []).length ? it.ArtistItems.map(a => a.Name).join(', ') : (it.AlbumArtist || (it.Artists || []).join(', ') || '');

function streamUrl(it) {
  if (it._preview) return /^https?:/.test(it._preview) ? it._preview : withKey(ApiClient.getUrl('Cinema/aurral/' + it._preview.replace(/^\//, '')));
  return ApiClient.getUrl('Audio/' + it.Id + '/universal', {
    UserId: uid(), DeviceId: ApiClient.deviceId(), MaxStreamingBitrate: 140000000, Container: 'opus,mp3|mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg',
    TranscodingContainer: 'mp3', TranscodingProtocol: 'http', AudioCodec: 'mp3', ApiKey: ApiClient.accessToken(), PlaySessionId: P.psid, EnableRedirection: true, EnableRemoteMedia: false
  });
}
const rep = (kind, extra) => { try { const it = cur(); if (!it || it._ext) return; const o = Object.assign({ ItemId: it.Id, PlaySessionId: P.psid, PositionTicks: Math.floor(P.audio.currentTime * 1e7), IsPaused: P.audio.paused, CanSeek: true, MediaSourceId: it.Id, PlayMethod: 'DirectStream', QueueableMediaTypes: ['Audio'] }, extra); ApiClient['reportPlayback' + kind](o); } catch (e) { } };
function loadCurrent(autoplay) {
  const it = cur(); if (!it) return;
  if (it._ext && !it._preview) { toast(t('noPreview') + ': ' + it.Name); setTimeout(() => next(), 600); return; }
  if (P.reportedStart) rep('Stopped');
  P.psid = 'cx' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  P.audio.src = streamUrl(it);
  P.reportedStart = false;
  if (autoplay !== false) P.audio.play().catch(() => { });
  emit(); setMedia();
}
function playList(tracks, idx, opts) {
  opts = opts || {};
  if (!tracks.length) return;
  P.orig = tracks.slice(); idx = idx || 0;
  if (opts.shuffle != null) P.shuffle = opts.shuffle;
  if (P.shuffle) { const first = P.orig[idx]; P.q = [first].concat(shuffleArr(P.orig.filter((_, k) => k !== idx))); P.i = 0; } else { P.q = P.orig.slice(); P.i = idx; }
  P.ctx = opts.ctx || null;
  loadCurrent();
}
function next(auto) {
  if (!P.q.length) return;
  if (auto && P.repeat === 2) { P.audio.currentTime = 0; P.audio.play(); return; }
  if (P.i + 1 < P.q.length) { P.i++; loadCurrent(); } else if (P.repeat === 1) { P.i = 0; loadCurrent(); } else { P.audio.pause(); P.audio.currentTime = 0; if (P.reportedStart) { rep('Stopped'); P.reportedStart = false; } emit(); }
}
function prev() { if (P.audio.currentTime > 3 || P.i <= 0) { P.audio.currentTime = 0; return; } P.i--; loadCurrent(); }
function toggle() { if (!cur()) return; P.audio.paused ? P.audio.play().catch(() => { }) : P.audio.pause(); }
function toggleShuffle() {
  P.shuffle = !P.shuffle; const c = cur();
  if (c) { if (P.shuffle) { const rest = shuffleArr(P.q.filter((_, k) => k !== P.i)); P.q = [c].concat(rest); P.i = 0; } else { const k = P.orig.findIndex(x => x.Id === c.Id); P.q = P.orig.slice(); P.i = k < 0 ? 0 : k; } }
  emit();
}
const cycleRepeat = () => { P.repeat = (P.repeat + 1) % 3; emit(); };
const addQueue = (tracks, atNext) => { if (!P.q.length) return playList(tracks, 0); if (atNext) P.q.splice(P.i + 1, 0, ...tracks); else P.q.push(...tracks); P.orig.push(...tracks); emit(); toast(t('queued')); };
P.audio.addEventListener('ended', () => next(true));
P.audio.addEventListener('play', () => { if (!P.reportedStart) { P.reportedStart = true; rep('Start'); } else rep('Progress', { EventName: 'unpause' }); emit(); });
P.audio.addEventListener('pause', () => { if (!P.audio.ended) rep('Progress', { EventName: 'pause' }); emit(); });
P.audio.addEventListener('timeupdate', () => { tickUI(); const n = Date.now(); if (n - P.lastReport > 10000 && !P.audio.paused) { P.lastReport = n; rep('Progress', { EventName: 'timeupdate' }); } });
P.audio.addEventListener('error', () => { const it = cur(); if (it) { toast('⚠ ' + it.Name); setTimeout(() => next(), 800); } });
window.addEventListener('beforeunload', () => { if (P.reportedStart) rep('Stopped'); });
function setMedia() {
  const it = cur(); if (!it || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: it.Name, artist: artistText(it), album: it.Album || '', artwork: [{ src: trackImg(it, 512), sizes: '512x512', type: 'image/jpeg' }] });
    navigator.mediaSession.setActionHandler('play', toggle); navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('previoustrack', prev); navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekto', e => { P.audio.currentTime = e.seekTime; });
  } catch (e) { }
}
const likeTrack = async it => { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData = Object.assign(ud(it), { IsFavorite: on }); P.q.concat(P.orig).forEach(x => { if (x.Id === it.Id) x.UserData = it.UserData; }); emit(); refreshRows(); return on; };

/* colour sampling for gradients */
const colorCache = {};
function dominant(url) {
  if (!url) return Promise.resolve([60, 60, 80]);
  if (colorCache[url]) return Promise.resolve(colorCache[url]);
  return new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let best = null, bs = -1, r = 0, g = 0, b = 0, n = 0;
        for (let k = 0; k < d.length; k += 4) { const R = d[k], G = d[k + 1], B = d[k + 2]; const mx = Math.max(R, G, B), mn = Math.min(R, G, B); const sat = mx ? (mx - mn) / mx : 0; const sc = sat * (mx / 255); r += R; g += G; b += B; n++; if (sc > bs && mx > 50) { bs = sc; best = [R, G, B]; } }
        let col = best && bs > .25 ? best : [r / n, g / n, b / n]; const m = Math.max(...col); if (m > 200) col = col.map(v => v * .75); colorCache[url] = col.map(Math.round); res(colorCache[url]); } catch (e) { res([60, 60, 80]); } };
    im.onerror = () => res([60, 60, 80]); im.src = url;
  });
}
const rgb = (c, a) => 'rgba(' + c.join(',') + ',' + (a == null ? 1 : a) + ')';

/* ---------- player bar UI ---------- */
const ui = {};
function seekBar(getFrac, onSeek, onVol) {
  const fill = h('i'), knob = h('b'); const bar = h('div', { class: 'bar' }, fill, knob);
  const set = f => { f = Math.max(0, Math.min(1, f || 0)); fill.style.width = f * 100 + '%'; knob.style.left = f * 100 + '%'; };
  let drag = false;
  const at = e => { const r = bar.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX); return (x - r.left) / r.width; };
  bar.addEventListener('pointerdown', e => { drag = true; bar.setPointerCapture(e.pointerId); const f = at(e); set(f); onSeek(f, false); });
  bar.addEventListener('pointermove', e => { if (drag) { const f = at(e); set(f); onSeek(f, false); } });
  bar.addEventListener('pointerup', e => { if (drag) { drag = false; const f = Math.max(0, Math.min(1, at(e))); onSeek(f, true); } });
  bar.set = set; bar.dragging = () => drag; return bar;
}
function trackLikeBtn(it, cls) { const b = h('button', { class: cls || 'pl-btn', onclick: async e => { e.stopPropagation(); await likeTrack(it); } }); const upd = () => { b.classList.toggle('on', !!ud(it).IsFavorite); b.replaceChildren(ic(ud(it).IsFavorite ? 'heartOn' : 'heart')); }; upd(); b._upd = upd; return b; }

function buildPlayer() {
  const cv = h('div', { class: 'cv', onclick: () => { const it = cur(); if (it && it.AlbumId) go('#/c/music/album/' + it.AlbumId); } });
  const tn = h('div', { class: 'tn ell' }), ta = h('div', { class: 'ta ell' }), likeSlot = h('div');
  const left = h('div', { class: 'pl-l' }, cv, h('div', { class: 'tx' }, tn, ta), likeSlot);
  const bShuffle = h('button', { class: 'pl-btn', onclick: toggleShuffle, 'aria-label': t('shuffle') }, ic('shuffle'));
  const bPrev = h('button', { class: 'pl-btn', onclick: prev }, ic('prev'));
  const bPlay = h('button', { class: 'pl-btn big', onclick: toggle }, ic('play'));
  const bNext = h('button', { class: 'pl-btn', onclick: () => next() }, ic('next'));
  const bRep = h('button', { class: 'pl-btn', onclick: cycleRepeat }, ic('repeat'));
  const tCur = h('span', {}, '0:00'), tDur = h('span', {}, '0:00');
  const seek = seekBar(null, (f, commit) => { if (P.audio.duration) { if (commit) P.audio.currentTime = f * P.audio.duration; tCur.textContent = fmtTime(f * P.audio.duration); } });
  const center = h('div', { class: 'pl-c' }, h('div', { class: 'pl-btns' }, bShuffle, bPrev, bPlay, bNext, bRep), h('div', { class: 'mp-seek' }, tCur, seek, tDur));
  const vol = seekBar(null, f => { P.audio.volume = f; vol.set(f); try { localStorage.setItem('cx-vol', f); } catch (e) { } });
  const sv = parseFloat((() => { try { return localStorage.getItem('cx-vol'); } catch (e) { return null; } })()); P.audio.volume = isFinite(sv) ? sv : 1; vol.set(P.audio.volume);
  const bQ = h('button', { class: 'pl-btn', onclick: toggleQueue, 'aria-label': t('queue') }, ic('queue'));
  const bMute = h('button', { class: 'pl-btn', onclick: () => { P.audio.muted = !P.audio.muted; vol.set(P.audio.muted ? 0 : P.audio.volume); } }, ic('vol'));
  const upMute = () => bMute.replaceChildren(ic(P.audio.muted || P.audio.volume === 0 ? 'volx' : 'vol')); P.audio.addEventListener('volumechange', upMute);
  const bL = h('button', { class: 'pl-btn', onclick: toggleLyrics, 'aria-label': t('lyrics') }, ic('mic'));
  const right = h('div', { class: 'pl-r' }, bL, bQ, bMute, vol);
  const bar = h('div', { class: 'sp-player' }, left, center, right);

  /* mobile mini + full */
  const mcv = h('div', { class: 'cv' }), mtn = h('b', { class: 'ell' }), mta = h('span', { class: 'ell' }), mpp = h('button', { class: 'pl-btn', onclick: e => { e.stopPropagation(); toggle(); } }, ic('play')), mfill = h('i');
  const mLike = h('div', { class: 'mlike', onclick: e => e.stopPropagation() });
  const mbar = h('div', { class: 'mbar' }, h('div', { class: 'mtrack' }, mfill, h('b', { class: 'mknob' })));
  { let drag = false; const frac = e => { const r = mbar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
    const paint = f => { mfill.style.width = f * 100 + '%'; mbar.querySelector('.mknob').style.left = f * 100 + '%'; };
    mbar.addEventListener('click', e => e.stopPropagation());
    mbar.addEventListener('pointerdown', e => { e.stopPropagation(); drag = true; mbar.classList.add('drag'); mbar.setPointerCapture(e.pointerId); paint(frac(e)); });
    mbar.addEventListener('pointermove', e => { if (drag) { e.stopPropagation(); paint(frac(e)); } });
    const end = e => { if (!drag) return; e.stopPropagation(); drag = false; mbar.classList.remove('drag'); const f = frac(e); if (P.audio.duration) P.audio.currentTime = f * P.audio.duration; };
    mbar.addEventListener('pointerup', end); mbar.addEventListener('pointercancel', () => { drag = false; mbar.classList.remove('drag'); });
    mbar.isDragging = () => drag; }
  const mini = h('div', { class: 'sp-mini hide', onclick: () => openFull(true) }, mcv, h('div', { class: 'tx' }, mtn, mta), mLike, mpp, mbar);
  const fcv = h('div', { class: 'cvbig' }), ftn = h('div', { class: 'tn' }), fta = h('div', { class: 'ta' }), fLike = h('div');
  const fcur = h('span', {}, '0:00'), fdur = h('span', {}, '0:00');
  const fseek = seekBar(null, (f, commit) => { if (P.audio.duration) { if (commit) P.audio.currentTime = f * P.audio.duration; fcur.textContent = fmtTime(f * P.audio.duration); } });
  const fb = { sh: h('button', { class: 'pl-btn', onclick: toggleShuffle }, ic('shuffle')), pv: h('button', { class: 'pl-btn', onclick: prev }, ic('prev')), pp: h('button', { class: 'pl-btn big', onclick: toggle }, ic('play')), nx: h('button', { class: 'pl-btn', onclick: () => next() }, ic('next')), rp: h('button', { class: 'pl-btn', onclick: cycleRepeat }, ic('repeat')) };
  const full = h('div', { class: 'sp-full' }, h('div', { class: 'top' }, h('button', { class: 'pl-btn', onclick: () => openFull(false) }, ic('down')), h('b', {}, t('nowPlaying')), h('div', { class: 'tops' }, h('button', { class: 'pl-btn', onclick: () => toggleLyrics() }, ic('mic')), h('button', { class: 'pl-btn', onclick: () => toggleQueue() }, ic('queue')))), fcv,
    h('div', { class: 'meta' }, h('div', { style: 'min-width:0' }, ftn, fta), fLike), h('div', { class: 'seekwrap' }, fseek, h('div', { class: 'mp-seek' }, fcur, h('span', { style: 'flex:1' }), fdur)), h('div', { class: 'ctr' }, fb.sh, fb.pv, fb.pp, fb.nx, fb.rp));
  /* the phone's back button / swipe closes the player (or the lyrics / queue layer on top of it) instead of leaving the music page */
  BACK.closeFull = () => { full.classList.remove('open'); full.style.transform = ''; };
  function openFull(on) {
    const mobile = matchMedia('(max-width: 800px)').matches;
    if (on && mobile && !BACK.full) { try { history.pushState({ cxFull: 1 }, '', location.href); BACK.full = true; } catch (e) { } }
    full.classList.toggle('open', on); full.style.transform = '';
    if (!on && BACK.full) { BACK.full = false; BACK.skip++; try { history.back(); } catch (e) { BACK.skip--; } }
  }
  /* Spotify style lyrics card inside the full-screen player */
  const fLn = h('div', { class: 'ln' }); const fLyr = h('div', { class: 'f-lyr hide', onclick: () => toggleLyrics() }, h('b', {}, t('lyrics')), fLn); full.append(fLyr);
  let fLyrId = null, fLyrData = null;
  function paintFLyr() {
    if (!fLyrData || !fLyrData.length) { fLyr.classList.add('hide'); return; } fLyr.classList.remove('hide');
    const now = P.audio.currentTime + .25; let idx = 0; const synced = fLyrData[0].t != null; if (synced) { for (let i = 0; i < fLyrData.length; i++) { if (fLyrData[i].t != null && fLyrData[i].t <= now) idx = i; else if (fLyrData[i].t != null) break; } }
    fLn.replaceChildren(...fLyrData.slice(idx, idx + 4).map((l, k) => h('p', { class: k === 0 && synced ? 'on' : '' }, l.s)));
  }
  async function updFLyr() {
    const it = cur(); if (!it) return;
    if (it.Id !== fLyrId) { fLyrId = it.Id; fLyrData = null; fLyr.classList.add('hide'); try { const r = await api('Audio/' + it.Id + '/Lyrics'); if (fLyrId !== it.Id) return; fLyrData = (r.Lyrics || []).map(l => ({ t: l.Start != null ? l.Start / 1e7 : null, s: l.Text })).filter(l => l.s); } catch (e) { fLyrData = []; } }
    paintFLyr();
  }
  P.audio.addEventListener('timeupdate', () => { if (full.classList.contains('open')) paintFLyr(); });
  P.subs.push(updFLyr);
  let sy = null; full.addEventListener('touchstart', e => { if (e.target.closest('.bar, .seekwrap')) { sy = null; return; } sy = e.touches[0].clientY; full.style.transition = 'none'; }, { passive: true });
  full.addEventListener('touchmove', e => { if (sy == null) return; const dy = e.touches[0].clientY - sy; if (dy > 0) full.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  full.addEventListener('touchend', e => { if (sy == null) return; const dy = e.changedTouches[0].clientY - sy; sy = null; full.style.transition = ''; if (dy > 110) openFull(false); else full.style.transform = ''; });

  let lastId = null;
  P.subs.push(() => {
    const it = cur(); const playing = !P.audio.paused;
    bar.style.visibility = it ? 'visible' : 'hidden'; if (C.sp) C.sp.el.classList.toggle('idle', !it);
    mini.classList.toggle('hide', !it);
    if (!it) return;
    const src = trackImg(it, 300);
    if (lastId !== it.Id) {
      lastId = it.Id;
      cv.style.backgroundImage = mcv.style.backgroundImage = fcv.style.backgroundImage = 'url("' + src + '")';
      tn.replaceChildren(h('a', { href: '#/c/music/album/' + (it.AlbumId || '') }, it.Name)); tn.querySelector('a').addEventListener('click', e => { if (!it.AlbumId) e.preventDefault(); });
      ta.replaceChildren(...[].concat(artistLinks(it)).flat());
      mtn.textContent = ftn.textContent = it.Name; mta.textContent = fta.textContent = artistText(it);
      likeSlot.replaceChildren(trackLikeBtn(it)); fLike.replaceChildren(trackLikeBtn(it)); mLike.replaceChildren(trackLikeBtn(it));
      dominant(trackImg(it, 64)).then(c => { full.style.setProperty('--tint', rgb(c)); mini.style.setProperty('--mini', rgb(c.map(v => Math.round(v * .55)))); });
      tDur.textContent = fdur.textContent = fmtTime((it.RunTimeTicks || 0) / 1e7);
    }
    $$('.pl-btn', likeSlot).concat($$('.pl-btn', fLike), $$('.pl-btn', mLike)).forEach(b => b._upd && b._upd());
    const pi = playing ? 'pause' : 'play';
    [bPlay, fb.pp, mpp].forEach(b => b.replaceChildren(ic(pi)));
    [bShuffle, fb.sh].forEach(b => b.classList.toggle('on', P.shuffle));
    [bRep, fb.rp].forEach(b => b.classList.toggle('on', P.repeat > 0));
    bRep.title = P.repeat === 2 ? 'Repeat one' : 'Repeat'; [bRep, fb.rp].forEach(b => { b.style.opacity = P.repeat === 2 ? .85 : ''; });
    root.classList.toggle('paused', !playing);
    $$('.sp-row').forEach(r => { r.classList.toggle('playing', r.dataset.id === it.Id); });
    $$('.sp-li .nm').forEach(n => n.classList.toggle('playing', n.closest('.sp-li').dataset.id === (P.ctx && P.ctx.id)));
    if (C.updateNPill) C.updateNPill();
    if (queueEl) renderQueue();
  });
  tickUI = () => {
    const d = P.audio.duration || ((cur() || {}).RunTimeTicks || 0) / 1e7 || 0; const f = d ? P.audio.currentTime / d : 0;
    if (!seek.dragging()) { seek.set(f); tCur.textContent = fmtTime(P.audio.currentTime); }
    if (!fseek.dragging()) { fseek.set(f); fcur.textContent = fmtTime(P.audio.currentTime); }
    tDur.textContent = fdur.textContent = fmtTime(d); if (!mbar.isDragging()) { mfill.style.width = f * 100 + '%'; const mk = mbar.querySelector('.mknob'); if (mk) mk.style.left = f * 100 + '%'; }
  };
  return { bar, mini, full };
}
let tickUI = () => { };
let queueEl = null;
const BACK = { full: false, panel: false, skip: 0, closeFull: null };
window.addEventListener('popstate', () => {
  if (BACK.skip > 0) { BACK.skip--; return; }
  if (BACK.panel) { BACK.panel = false; if (lyrEl) { lyrEl.remove(); lyrEl = null; } if (queueEl) { queueEl.remove(); queueEl = null; } return; }
  if (BACK.full && BACK.closeFull) { BACK.full = false; BACK.closeFull(); }
});
const panelOpened = () => { if (matchMedia('(max-width: 800px)').matches && !BACK.panel) { try { history.pushState({ cxPanel: 1 }, '', location.href); BACK.panel = true; } catch (e) { } } };
const panelClosed = () => { if (BACK.panel && !lyrEl && !queueEl) { BACK.panel = false; BACK.skip++; try { history.back(); } catch (e) { BACK.skip--; } } };
const panelHost = () => matchMedia('(max-width: 800px)').matches ? root : $('.sp-main', root).parentElement;
function toggleQueue() { if (lyrEl) { lyrEl.remove(); lyrEl = null; } if (queueEl) { queueEl.remove(); queueEl = null; panelClosed(); return; } queueEl = h('div', { class: 'sp-queue' }); panelHost().append(queueEl); renderQueue(); panelOpened(); }
function renderQueue() {
  if (!queueEl) return; const it = cur();
  const rowQ = (x, k) => h('div', { class: 'sp-qi' + (k === P.i ? ' playing' : ''), onclick: () => { P.i = k; loadCurrent(); } }, h('div', Object.assign({ class: 'cv' }, bg(trackImg(x, 100)))), h('div', {}, h('b', { class: 'ell' }, x.Name), h('span', { class: 'ell' }, artistText(x))));
  queueEl.replaceChildren(...[h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, h('h3', {}, t('queue')), h('button', { class: 'pl-btn', onclick: toggleQueue }, ic('close'))),
    it ? [h('h4', {}, t('nowPlaying')), rowQ(it, P.i)] : null, P.q.length > P.i + 1 ? [h('h4', {}, t('nextIn')), P.q.slice(P.i + 1, P.i + 101).map((x, k) => rowQ(x, P.i + 1 + k))] : null].flat(3).filter(Boolean));
}

/* ---------- menus / modals ---------- */
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
document.addEventListener('click', closeMenu, true);
function openMenu(x, y, entries) {
  closeMenu();
  menuEl = h('div', { class: 'sp-menu' }, entries.map(en => en === '-' ? h('hr') : h('button', { onclick: e => { e.stopPropagation(); closeMenu(); en.fn(); } }, en.icon ? ic(en.icon, 'ic-s') : (en.mi ? h('span', { class: 'mi' }, en.mi) : null), en.label)));
  getUI().append(menuEl); menuEl.style.zIndex = 9600;
  const r = menuEl.getBoundingClientRect(); menuEl.style.left = Math.min(x, innerWidth - r.width - 8) + 'px'; menuEl.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
}
function promptName(title, cb) {
  const inp = h('input', { type: 'text', placeholder: t('name') });
  const m = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === m) m.remove(); } }, h('div', { class: 'sp-modal' }, h('h3', {}, title), inp, h('div', { class: 'row' }, h('button', { class: 'sp-pillbtn dark', onclick: () => m.remove() }, t('cancel')), h('button', { class: 'sp-pillbtn', onclick: () => { if (inp.value.trim()) { cb(inp.value.trim()); m.remove(); } } }, t('create')))));
  getUI().append(m); setTimeout(() => inp.focus(), 30); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) { cb(inp.value.trim()); m.remove(); } });
}
async function createPlaylist(name, ids) {
  const r = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Playlists'), data: JSON.stringify({ Name: name, Ids: ids || [], UserId: uid(), MediaType: 'Audio' }), contentType: 'application/json', dataType: 'json' });
  C.libCache = null; await loadLibrary(true); return r;
}
async function addToPlaylist(plId, ids) { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Playlists/' + plId + '/Items', { ids: ids.join(','), userId: uid() }) }); toast(t('added')); C.libCache = null; }
async function trackMenu(e, it, ctx) {
  e.preventDefault(); e.stopPropagation();
  const x = e.clientX || (e.target.getBoundingClientRect().left), y = e.clientY || (e.target.getBoundingClientRect().bottom);
  const pls = (await loadLibrary()).playlists;
  const ent = [{ icon: 'queue', label: t('addQ'), fn: () => addQueue([it]) }, { icon: 'next', label: t('playNext'), fn: () => addQueue([it], true) }, '-',
    { icon: 'plus', label: t('newPl'), fn: () => promptName(t('newPl'), async n => { const r = await createPlaylist(n, [it.Id]); toast(t('added')); }) }].concat(pls.slice(0, 12).map(p => ({ icon: 'list', label: p.Name, fn: () => addToPlaylist(p.Id, [it.Id]) })));
  ent.push('-', { icon: ud(it).IsFavorite ? 'heartOn' : 'heart', label: ud(it).IsFavorite ? t('unlike') : t('like'), fn: () => likeTrack(it) });
  if (it.AlbumId) ent.push({ icon: 'lib', label: t('goAlbum'), fn: () => go('#/c/music/album/' + it.AlbumId) });
  if ((it.ArtistItems || [])[0]) ent.push({ icon: 'user', label: t('goArtist'), fn: () => go('#/c/music/artist/' + it.ArtistItems[0].Id) });
  if (ctx && ctx.playlistId && it.PlaylistItemId) ent.push('-', { icon: 'close', label: t('rmPl'), fn: async () => { await ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl('Playlists/' + ctx.playlistId + '/Items', { entryIds: it.PlaylistItemId }) }); toast('✓'); route(); } });
  openMenu(x, y, ent);
}

/* ---------- library data ---------- */
async function loadLibrary(force) {
  if (C.libCache && !force) return C.libCache;
  const [pl, al, ar] = await Promise.all([
    items({ IncludeItemTypes: 'Playlist', MediaTypes: 'Audio', SortBy: 'SortName' }),
    items({ IncludeItemTypes: 'MusicAlbum', SortBy: 'SortName', Limit: 600, Fields: F_BASE + ',AlbumArtist' }),
    api('Artists/AlbumArtists', { userId: uid(), SortBy: 'SortName', Limit: 400, Fields: 'PrimaryImageAspectRatio', ImageTypeLimit: 1, EnableImageTypes: 'Primary' })]);
  C.libCache = { playlists: pl.Items.filter(p => p.MediaType === 'Audio' || p.MediaType == null), albums: al.Items, artists: ar.Items };
  return C.libCache;
}
const tracksOf = (parentQuery) => items(Object.assign({ IncludeItemTypes: 'Audio', Fields: AUD_F }, parentQuery)).then(r => r.Items);
const fmtDur = tr => { const m = Math.round((tr || 0) / 6e8); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };

/* ---------- track list ---------- */
function refreshRows() { $$('.sp-row .lk').forEach(b => b._upd && b._upd()); }
function trackList(tracks, ctx) {
  ctx = ctx || {}; const noAlb = ctx.noAlbum;
  const wrap = h('div', {});
  wrap.append(h('div', { class: 'sp-th' + (noAlb ? ' noalb' : '') }, h('span', {}, '#'), h('span', {}, t('title')), noAlb ? null : h('span', {}, t('album')), h('span', {}, '⏱')));
  // grid has 5 columns with album, 4 without; adjust header to match
  const th = $('.sp-th', wrap); if (!noAlb) { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, t('album')), h('span', {}, '⏱')); } else { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, '⏱')); }
  let lastDisc = null;
  tracks.forEach((it, idx) => {
    if (ctx.discs && it.ParentIndexNumber && it.ParentIndexNumber !== lastDisc && tracks.some(x => (x.ParentIndexNumber || 1) > 1)) { lastDisc = it.ParentIndexNumber; wrap.append(h('div', { class: 'sp-disc' }, ic('note', 'ic-s'), 'Disc ' + lastDisc)); }
    const lk = it._ext ? h('button', { class: 'lk on rq', title: t('request'), onclick: e => { e.stopPropagation(); requestExtTrack(it); } }, ic('plus')) : trackLikeBtn(it, 'lk');
    const play = () => playList(tracks, idx, { ctx: ctx.id ? { id: ctx.id } : null });
    const rowEl = h('div', { class: 'sp-row' + (it._ext ? ' ext' : '') + (noAlb ? ' noalb' : '') + (cur() && cur().Id === it.Id ? ' playing' : ''), 'data-id': it.Id, ondblclick: play, onclick: () => { if (matchMedia('(pointer:coarse)').matches || innerWidth <= 800) play(); }, oncontextmenu: e => trackMenu(e, it, ctx) },
      h('div', { class: 'ix' }, h('span', { class: 'n' }, ctx.number === 'idx' ? idx + 1 : (it.IndexNumber || idx + 1)), h('div', { class: 'eq' }, h('i'), h('i'), h('i')), h('button', { class: 'pl', onclick: e => { e.stopPropagation(); (cur() && cur().Id === it.Id) ? toggle() : play(); } }, ic('play'))),
      h('div', { class: 'ti' }, ctx.noCover ? null : h('div', Object.assign({ class: 'cv' }, bg(trackImg(it, 100)))), h('div', { class: 'tx' }, h('div', { class: 'tn ell' }, it.Name), h('div', { class: 'ta ell' }, artistLinks(it), it._ext ? h('span', { class: 'xb' }, t('notOwned')) : null))),
      noAlb ? null : h('div', { class: 'al ell' }, it.AlbumId ? h('a', { href: '#/c/music/album/' + it.AlbumId }, it.Album) : (it.Album || '')),
      h('div', { class: 'du' }, lk, h('span', { class: 'tm' }, fmtTime((it.RunTimeTicks || 0) / 1e7)), h('button', { class: 'mo', onclick: e => trackMenu(e, it, ctx) }, ic('more'))));
    if (noAlb) { /* grid has 4 cols: ix, ti, (empty spacer removed), du */ }
    wrap.append(rowEl);
  });
  return wrap;
}
const actionsBar = (tracks, ctx, extra) => {
  const big = h('button', { class: 'sp-big', 'aria-label': t('play'), onclick: () => { const playingHere = ctx && ctx.id && P.ctx && P.ctx.id === ctx.id; if (playingHere) toggle(); else playList(tracks, 0, { shuffle: false, ctx: ctx && ctx.id ? { id: ctx.id } : null }); } }, ic('play'));
  const sh = h('button', { class: 'sp-ico', 'aria-label': t('shuffle'), onclick: () => playList(tracks, Math.floor(Math.random() * tracks.length), { shuffle: true, ctx: ctx && ctx.id ? { id: ctx.id } : null }) }, ic('shuffle'));
  P.subs.push(() => { const here = ctx && ctx.id && P.ctx && P.ctx.id === ctx.id && !P.audio.paused; if (big.isConnected) big.replaceChildren(ic(here ? 'pause' : 'play')); });
  return h('div', { class: 'sp-actions' }, big, sh, extra || null);
};

/* ---------- tiles ---------- */
function tile(o) {
  const cv = h('div', Object.assign({ class: 'cv' }, bg(o.img)), o.img ? null : (o.mix ? h('div', { class: 'mixcv', style: 'background:' + o.mix }, o.name) : h('span', { class: 'cv-ph' }, ic(o.round ? 'user' : 'note'))));
  const el = h('div', { class: 'sp-tile' + (o.round ? ' round' : ''), onclick: () => go(o.href) }, cv, h('div', { class: 'nm ell' }, o.name), h('div', { class: 'sb clamp2' }, o.sub || ''),
    o.play ? h('button', { class: 'pbtn', 'aria-label': t('play'), onclick: async e => { e.stopPropagation(); const tr = await o.play(); if (tr && tr.length) playList(tr, 0, { ctx: { id: o.id } }); } }, ic('play')) : null);
  return el;
}
const albumTile = a => tile({ id: a.Id, name: a.Name, sub: [yearOf(a), a.AlbumArtist].filter(Boolean).join(' · '), img: imgUrl(a, 'Primary', 400), href: '#/c/music/album/' + a.Id, play: () => tracksOf({ ParentId: a.Id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' }) });
const artistTile = a => tile({ id: a.Id, name: a.Name, sub: t('artist'), img: imgUrl(a, 'Primary', 400), round: true, href: '#/c/music/artist/' + a.Id, play: () => tracksOf({ ArtistIds: a.Id, SortBy: 'PlayCount', SortOrder: 'Descending', Limit: 100 }) });
const plTile = p => tile({ id: p.Id, name: p.Name, sub: t('playlist') + (p.ChildCount ? ' · ' + p.ChildCount + ' ' + t('songsN') : ''), img: imgUrl(p, 'Primary', 400), href: '#/c/music/playlist/' + p.Id, play: () => api('Playlists/' + p.Id + '/Items', { userId: uid(), Fields: AUD_F }).then(r => r.Items) });
const MIXCOL = ['linear-gradient(135deg,#8e2de2,#4a00e0)', 'linear-gradient(135deg,#f12711,#f5af19)', 'linear-gradient(135deg,#11998e,#38ef7d)', 'linear-gradient(135deg,#2193b0,#6dd5ed)', 'linear-gradient(135deg,#ee0979,#ff6a00)', 'linear-gradient(135deg,#373b44,#4286f4)', 'linear-gradient(135deg,#c31432,#240b36)', 'linear-gradient(135deg,#1d976c,#93f9b9)'];
const mixTile = (g, i) => tile({ id: 'mix-' + g, name: g + ' ' + t('mix'), sub: g, mix: MIXCOL[i % MIXCOL.length], href: '#/c/music/mix/' + encodeURIComponent(g), play: () => tracksOf({ Genres: g, SortBy: 'Random', Limit: 60 }) });
function shelf(title, nodes, href) { if (!nodes.length) return ''; return h('section', {}, h('h2', {}, title, href ? h('a', { class: 'more', href }, '›') : null), h('div', { class: 'sp-shelf' }, nodes)); }

/* ---------- shell ---------- */
function buildSP() {
  const sp = h('div', { id: 'cx-sp' });
  const libList = h('div', { class: 'sp-liblist' }); let libTab = 'playlists';
  const chips = h('div', { class: 'sp-chips' }, ['playlists', 'albums', 'artists'].map(k => h('button', { class: 'sp-chip' + (k === libTab ? ' on' : ''), 'data-k': k, onclick: () => { libTab = k; $$('.sp-chip', chips).forEach(c => c.classList.toggle('on', c.dataset.k === k)); fillLib(); } }, t(k))));
  async function fillLib() {
    const lib = await loadLibrary(); const hash = location.hash; libList.replaceChildren();
    const li = (o) => h('button', { class: 'sp-li' + (o.round ? ' round' : '') + (hash.includes(o.id) ? ' on' : ''), 'data-id': o.id, onclick: () => go(o.href) }, h('div', Object.assign({ class: 'art' + (o.cls ? ' ' + o.cls : '') }, bg(o.img)), h('span', { class: 'li-play', role: 'button', 'aria-label': t('play'), onclick: e => { e.stopPropagation(); playLibItem(o); } }, ic('play')), o.img || o.cls ? (o.cls ? ic('heartOn') : null) : h('span', { class: 'cv-ph' }, ic(o.round ? 'user' : 'note'))), h('div', {}, h('div', { class: 'nm ell' }, o.name), h('div', { class: 'sb ell' }, o.sub)));
    if (libTab === 'playlists') { libList.append(li({ id: 'liked', name: t('liked'), sub: t('playlist'), href: '#/c/music/liked', cls: 'liked-art' })); lib.playlists.forEach(p => libList.append(li({ id: p.Id, name: p.Name, sub: t('playlist') + (p.ChildCount ? ' · ' + p.ChildCount : ''), img: imgUrl(p, 'Primary', 100), href: '#/c/music/playlist/' + p.Id }))); }
    if (libTab === 'albums') lib.albums.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: [t('album1'), a.AlbumArtist].filter(Boolean).join(' · '), img: imgUrl(a, 'Primary', 100), href: '#/c/music/album/' + a.Id })));
    if (libTab === 'artists') lib.artists.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: t('artist'), img: imgUrl(a, 'Primary', 100), round: true, href: '#/c/music/artist/' + a.Id })));
  }
  C.fillLib = fillLib;
  const side = h('div', { class: 'sp-side' },
    h('div', { class: 'sp-card sp-top' }, h('a', { class: 'sp-navlink', href: '#/c/music', 'data-k': 'home' }, ic('home'), t('home')), h('a', { class: 'sp-navlink', href: '#/c/music/search', 'data-k': 'search' }, ic('search'), t('search')), h('a', { class: 'sp-navlink', href: '#/c/music/discover', 'data-k': 'discover' }, ic('star'), t('discoverShort')), aurralOn() ? h('a', { class: 'sp-navlink', href: '#/c/music/downloads', 'data-k': 'downloads' }, ic('download'), t('mdl')) : null, h('a', { class: 'sp-navlink', href: '#/home' }, ic('film'), t('moviesTv'))),
    h('div', { class: 'sp-card sp-lib' }, h('div', { class: 'sp-libhead' }, h('span', { style: 'display:flex;gap:10px;align-items:center' }, ic('lib'), t('library')), h('button', { 'aria-label': t('createPl'), onclick: () => promptName(t('createPl'), async n => { const r = await createPlaylist(n, []); go('#/c/music/playlist/' + r.Id); }) }, ic('plus'))), chips, libList));
  /* main */
  const scroll = h('div', { class: 'sp-scroll' });
  const bgEl = h('div', { class: 'sp-bg' });
  const header = h('div', { class: 'sp-header' });
  const content = h('div', { class: 'sp-content' });
  scroll.append(bgEl, header, content);
  scroll.addEventListener('scroll', () => header.classList.toggle('solid', scroll.scrollTop > 120), { passive: true });
  const main = h('div', { class: 'sp-main' }, scroll);
  const pl = buildPlayer();
  const tabs = h('div', { class: 'cx-tabs', style: 'display:none' }, [['home', '#/c/music', 'home', t('home')], ['search', '#/c/music/search', 'search', t('search')], ['lib', '#/c/music/library', 'lib', t('library')], ['tv', '#/home', 'film', t('moviesTv')]].map(([k, href, i, label]) => h('a', { href, 'data-k': k }, ic(i), label)));
  const mq = matchMedia('(max-width:800px)'); const upT = () => { tabs.style.display = mq.matches ? 'flex' : 'none'; }; mq.addEventListener('change', upT); upT();
  sp.append(side, main, pl.bar);
  root.append(sp, pl.mini, pl.full, tabs);
  C.sp = { el: sp, scroll, content, header, bgEl, libList, tabs, side };
  P.subs.forEach(f => f());
}
const tint = async (url) => { const c = await dominant(url); C.sp.el.style.setProperty('--tint', rgb(c, 1)); C.sp.bgEl.style.setProperty('--tint', rgb(c.map(v => Math.round(v * .8)))); };
function setHeader(opts) {
  opts = opts || {}; const hd = C.sp.header;
  { const typing = hd.querySelector('.sp-hsearch input'); if (opts.search && typing && document.activeElement === typing) return; }
  const mob = matchMedia('(max-width: 800px)').matches; const rt = parse(); const v0 = rt.parts[2] === 'home' ? '' : (rt.parts[2] || '');
  if (mob) {
    const nm = (ME && ME.Name) || 'U';
    if (v0) hd.replaceChildren(h('button', { class: 'sp-hbtn', 'aria-label': 'Back', onclick: () => history.back() }, ic('left')));
    else hd.replaceChildren((() => { const a = h('a', { class: 'sp-avatar', href: '#/c/settings', 'aria-label': t('settings') }, nm[0].toUpperCase()); if (!ME) me().then(u => { a.textContent = (u.Name || 'U')[0].toUpperCase(); }); return a; })(),
      h('div', { class: 'sp-chips' }, [['', t('all'), '#/c/music'], ['discover', t('discoverShort'), '#/c/music/discover'], ['library', t('library'), '#/c/music/library']].concat(aurralOn() ? [['downloads', t('mdl'), '#/c/music/downloads']] : []).map(([k, l, hr]) => h('a', { class: 'sp-chip' + (v0 === k ? ' on' : ''), href: hr }, l))));
  } else hd.replaceChildren(h('button', { class: 'sp-hbtn', 'aria-label': 'Back', onclick: () => history.back() }, ic('left')), h('button', { class: 'sp-hbtn', 'aria-label': 'Forward', onclick: () => history.forward() }, ic('right')));
  if (opts.search) { const inp = h('input', { type: 'text', placeholder: t('searchMusic'), value: opts.q || '', autocomplete: 'off' }); let tm; inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => go('#/c/music/search' + (inp.value.trim() ? '/' + encodeURIComponent(inp.value.trim()) : '')), 350); }); hd.append(h('div', { class: 'sp-hsearch' }, ic('search'), inp)); setTimeout(() => { if (!opts.q) inp.focus(); }, 50); }
  hd.append(h('div', { style: 'flex:1' }));
  if (opts.title) hd.append(h('b', { class: 'ell', style: 'opacity:0' }, opts.title));
}

C.renderMusic = async function (r) {
  if (!C.sp) buildSP();
  if (!C.libCache) loadLibrary().then(() => C.fillLib && C.fillLib());
  const sp = C.sp; let [, , view, id] = r.parts; if (view === 'home') view = undefined;
  $$('.sp-navlink[data-k]', sp.side).forEach(a => a.classList.toggle('on', (a.dataset.k === 'home' && !view) || (a.dataset.k === 'search' && view === 'search') || (a.dataset.k === 'discover' && view === 'discover') || (a.dataset.k === 'downloads' && view === 'downloads')));
  $$('a[data-k]', sp.tabs).forEach(a => a.classList.toggle('on', (a.dataset.k === 'home' && !view) || (a.dataset.k === 'search' && view === 'search') || (a.dataset.k === 'lib' && (view === 'library'))));
  $$('.sp-li', sp.libList).forEach(l => l.classList.toggle('on', !!id && l.dataset.id === id || (view === 'liked' && l.dataset.id === 'liked')));
  C.scrollPos[C.lastKey] = sp.scroll.scrollTop; C.lastKey = r.raw;
  sp.content.replaceChildren(h('div', { class: 'spinner' })); sp.el.style.setProperty('--tint', '#333'); sp.bgEl.style.setProperty('--tint', '#2a2a2a');
  setHeader({ search: view === 'search', q: view === 'search' ? decodeURIComponent(id || '') : '' });
  const node = h('div', { class: 'sp-content' });
  try {
    if (!view) await mHome(node);
    else if (view === 'search') await mSearch(node, decodeURIComponent(id || ''));
    else if (view === 'playlist') await mPlaylist(node, id);
    else if (view === 'album') await mAlbum(node, id);
    else if (view === 'artist') await mArtist(node, id);
    else if (view === 'liked') await mLiked(node);
    else if (view === 'discover') await mDiscover(node);
    else if (view === 'disc') await mDisc(node, id);
    else if (view === 'ext') await mExtAlbum(node, id, r.q);
    else if (view === 'mix') await mMix(node, decodeURIComponent(id));
    else if (view === 'library') await mLibrary(node);
    else if (view === 'downloads') await mDownloads(node);
  } catch (e) { console.error('[cinema music]', e); node.append(h('div', { class: 'nf-empty' }, t('empty'))); }
  try { if (view === 'search' && id) { await aurralSearchShelves(node, decodeURIComponent(id)); aurralTrackSearch(node, decodeURIComponent(id)); } else if (!view) { await aurralDiscoverShelves(node); musicRecs(node); } } catch (e) { }
  sp.content.replaceWith(node); sp.content = node;
  sp.scroll.scrollTop = C.scrollPos[r.raw] || 0;
  P.subs.forEach(f => f());
};

/* ---------- views ---------- */
async function mHome(n) {
  const hr = new Date().getHours(); n.append(h('div', { class: 'sp-greet' }, hr < 12 ? t('gm') : hr < 18 ? t('ga') : t('ge')));
  const lib = await loadLibrary();
  const quick = h('div', { class: 'sp-quick' });
  const qt = (name, img, href, play, id, cls) => h('div', { class: 'sp-qt', onclick: () => go(href) }, h('div', Object.assign({ class: 'art ' + (cls || '') }, bg(img)), !img && cls ? h('div', { style: 'height:100%;display:grid;place-items:center' }, ic('heartOn')) : null), h('b', { class: 'ell' }, name), h('button', { class: 'pbtn', onclick: async e => { e.stopPropagation(); const tr = await play(); if (tr.length) playList(tr, 0, { ctx: { id } }); } }, ic('play')));
  quick.append(qt(t('liked'), '', '#/c/music/liked', () => tracksOf({ Filters: 'IsFavorite', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 500 }), 'liked', 'liked-art'));
  lib.playlists.slice(0, 3).forEach(p => quick.append(qt(p.Name, imgUrl(p, 'Primary', 120), '#/c/music/playlist/' + p.Id, () => api('Playlists/' + p.Id + '/Items', { userId: uid(), Fields: AUD_F }).then(r => r.Items), p.Id)));
  const rest = 8 - quick.children.length; lib.albums.slice().sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || '')).slice(0, rest).forEach(a => quick.append(qt(a.Name, imgUrl(a, 'Primary', 120), '#/c/music/album/' + a.Id, () => tracksOf({ ParentId: a.Id, SortBy: 'ParentIndexNumber,IndexNumber' }), a.Id)));
  n.append(quick);
  const rp = items({ IncludeItemTypes: 'Audio', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 60, Fields: AUD_F }).catch(() => ({ Items: [] }));
  const genres = api('MusicGenres', { userId: uid(), SortBy: 'Random', Limit: 8 }).catch(() => ({ Items: [] }));
  const recentTracks = (await rp).Items; const seen = new Set(), recAlb = [];
  recentTracks.forEach(x => { if (x.AlbumId && !seen.has(x.AlbumId)) { seen.add(x.AlbumId); const a = lib.albums.find(z => z.Id === x.AlbumId); if (a) recAlb.push(a); } });
  if (recentTracks.length) {
    const sec = h('section', {}, h('h2', {}, t('recent'))); sec.append(trackList(recentTracks.slice(0, 8), { noAlbum: false, number: 'idx', id: 'recent' })); n.append(sec);
  }
  n.append(shelf(t('yourPl'), lib.playlists.map(plTile)));
  n.append(shelf(t('mixes'), (await genres).Items.map((g, i) => mixTile(g.Name, i))));
  n.append(aurralOn() ? h('div', { class: 'sp-disc-cta' }, h('div', {}, h('b', {}, t('discoverMusic')), h('span', {}, t('discoverCta'))), h('a', { class: 'sp-pillbtn', href: '#/c/music/discover' }, t('open'))) : '');
  n.append(shelf(t('newAlb'), lib.albums.slice().sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || '')).slice(0, 14).map(albumTile)));
  n.append(shelf(t('artists'), shuffleArr(lib.artists).slice(0, 14).map(artistTile)));
  if (recAlb.length > 3) n.append(shelf(t('recent') + ' · ' + t('albums'), recAlb.slice(0, 14).map(albumTile)));
}
async function mLibrary(n) {
  const lib = await loadLibrary(); n.append(h('div', { class: 'sp-greet' }, t('library')));
  const g = h('div', { class: 'sp-grid' }, [h('div', { class: 'sp-tile', onclick: () => go('#/c/music/liked') }, h('div', { class: 'cv liked-art' }, ic('heartOn', 'ic-l')), h('div', { class: 'nm' }, t('liked')))].concat(lib.playlists.map(plTile), lib.albums.slice(0, 60).map(albumTile)));
  n.append(g);
}
async function mSearch(n, q) {
  if (!q) {
    const genres = await api('MusicGenres', { userId: uid(), SortBy: 'SortName', Limit: 40 }).catch(() => ({ Items: [] }));
    n.append(h('h2', {}, t('browse')), h('div', { class: 'sp-genres' }, genres.Items.map((g, i) => h('div', { class: 'sp-genre', style: 'background:' + MIXCOL[i % MIXCOL.length], onclick: () => go('#/c/music/mix/' + encodeURIComponent(g.Name)) }, g.Name))));
    return;
  }
  const [tr, al, ar, pl] = await Promise.all([items({ searchTerm: q, IncludeItemTypes: 'Audio', Limit: 20, Fields: AUD_F }), items({ searchTerm: q, IncludeItemTypes: 'MusicAlbum', Limit: 12 }), api('Artists', { userId: uid(), searchTerm: q, Limit: 10, Fields: 'PrimaryImageAspectRatio', ImageTypeLimit: 1, EnableImageTypes: 'Primary' }), items({ searchTerm: q, IncludeItemTypes: 'Playlist', Limit: 8 })]);
  if (!tr.Items.length && !al.Items.length && !ar.Items.length) { n.append(h('div', { class: 'nf-empty' }, t('noRes'))); return; }
  const topArtist = ar.Items[0], topAlbum = al.Items[0];
  const top = topArtist && topArtist.Name.toLowerCase().includes(q.toLowerCase()) ? { name: topArtist.Name, sub: t('artist'), img: imgUrl(topArtist, 'Primary', 300), round: true, href: '#/c/music/artist/' + topArtist.Id, play: () => tracksOf({ ArtistIds: topArtist.Id, SortBy: 'PlayCount', SortOrder: 'Descending', Limit: 100 }) } : tr.Items[0] ? { name: tr.Items[0].Name, sub: t('songs') + ' · ' + artistText(tr.Items[0]), img: trackImg(tr.Items[0], 300), href: tr.Items[0].AlbumId ? '#/c/music/album/' + tr.Items[0].AlbumId : '#/c/music', play: async () => [tr.Items[0]] } : null;
  const res = h('div', { class: 'sp-res' });
  if (top) { const tp = h('div', { class: 'sp-top1' + (top.round ? ' round' : ''), onclick: () => go(top.href) }, h('div', Object.assign({ class: 'cv' }, bg(top.img))), h('b', { class: 'ell' }, top.name), h('span', {}, top.sub), h('button', { class: 'pbtn show', onclick: async e => { e.stopPropagation(); const x = await top.play(); if (x.length) playList(x, 0); } }, ic('play'))); tp.querySelector('.pbtn').style.bottom = '20px'; res.append(h('div', {}, h('h2', { style: 'margin-top:0' }, t('top1')), tp)); }
  if (tr.Items.length) res.append(h('div', {}, h('h2', { style: 'margin-top:0' }, t('songs')), trackList(tr.Items.slice(0, 4), { noAlbum: true, noHeader: true, number: 'idx' })));
  $$('.sp-th', res).forEach(x => x.remove());
  n.append(res, shelf(t('artists'), ar.Items.map(artistTile)), shelf(t('albums'), al.Items.map(albumTile)), shelf(t('playlists'), pl.Items.map(plTile)));
  if (tr.Items.length > 4) { const sec = h('section', {}, h('h2', {}, t('songs'))); sec.append(trackList(tr.Items.slice(4), { number: 'idx' })); n.append(sec); }
}
function pageHead(n, o) {
  const cv = h('div', Object.assign({ class: 'cv' }, bg(o.img)), o.img ? null : (o.cls ? ic('heartOn', 'ic-l') : h('span', { class: 'cv-ph', style: 'display:grid;place-items:center;width:100%;height:100%' }, ic(o.round ? 'user' : 'note'))));
  if (o.cls) cv.classList.add(o.cls);
  n.append(h('div', { class: 'sp-ph' + (o.round ? ' artist' : '') }, cv, h('div', { style: 'min-width:0' }, h('div', { class: 'tp' }, o.type), h('h1', {}, o.title), h('div', { class: 'mt' }, o.meta))));
  if (o.img) tint(o.img);
  else if (o.cls) { C.sp.el.style.setProperty('--tint', '#4a3cc0'); C.sp.bgEl.style.setProperty('--tint', '#4a3cc0'); }
}
async function mPlaylist(n, id) {
  const [pl, tr] = await Promise.all([getItem(id), api('Playlists/' + id + '/Items', { userId: uid(), Fields: AUD_F })]);
  const tracks = tr.Items; const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: pl.Name, img: imgUrl(pl, 'Primary', 500) || (tracks[0] && trackImg(tracks[0], 500)), meta: [tracks.length + ' ' + t('songsN'), total ? ', ' + fmtDur(total) : ''] });
  const ctx = { id, playlistId: id, number: 'idx' };
  n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (!tracks.length) n.append(h('div', { class: 'nf-empty' }, t('empty')));
}
async function mLiked(n) {
  const tracks = await tracksOf({ Filters: 'IsFavorite', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 1000 }); const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: t('liked'), cls: 'liked-art', meta: [tracks.length + ' ' + t('songsN'), total ? ', ' + fmtDur(total) : ''] });
  const ctx = { id: 'liked', number: 'idx' }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (!tracks.length) n.append(h('div', { class: 'nf-empty' }, t('empty')));
}
async function mMix(n, g) {
  const tracks = await tracksOf({ Genres: g, SortBy: 'Random', Limit: 60 }); const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: g + ' ' + t('mix'), img: tracks[0] && trackImg(tracks[0], 500), meta: [tracks.length + ' ' + t('songsN'), ', ' + fmtDur(total)] });
  const ctx = { id: 'mix-' + g, number: 'idx' }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
}
async function mAlbum(n, id) {
  const [al, tracks] = await Promise.all([getItem(id), tracksOf({ ParentId: id, SortBy: 'ParentIndexNumber,IndexNumber,SortName', Limit: 500 })]);
  const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0); const ar = (al.ArtistItems || [])[0];
  pageHead(n, { type: t('album1'), title: al.Name, img: imgUrl(al, 'Primary', 500), meta: [ar ? h('a', { href: '#/c/music/artist/' + ar.Id }, ar.Name) : (al.AlbumArtist || ''), ' · ' + (yearOf(al) || ''), ' · ' + tracks.length + ' ' + t('songsN') + ', ' + fmtDur(total)] });
  const ctx = { id, noAlbum: true, noCover: true, discs: true }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (ar) { const more = await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: ar.Id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 12 }); const o = more.Items.filter(x => x.Id !== id); if (o.length) n.append(shelf('More by ' + ar.Name, o.map(albumTile))); }
}
async function mArtist(n, id) {
  const [ar, top, albums] = await Promise.all([getItem(id), tracksOf({ ArtistIds: id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 10 }), items({ IncludeItemTypes: 'MusicAlbum', AlbumArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })]);
  let alb = albums.Items; if (!alb.length) alb = (await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })).Items;
  const all = await tracksOf({ ArtistIds: id, SortBy: 'SortName', Limit: 500 });
  pageHead(n, { type: t('artist'), title: ar.Name, round: true, img: imgUrl(ar, 'Primary', 500), meta: [all.length + ' ' + t('songsN')] });
  const ctx = { id, number: 'idx' }; n.append(actionsBar(all, ctx));
  window.__artistNode = n; window.__artistItem = ar;
  const popBox = h('div', {}, trackList(top.slice(0, 5), { id: id + '-top', number: 'idx' })); n.append(h('h2', { style: 'margin-top:8px' }, t('popularTracks')), popBox);
  $$('.sp-th', n).forEach(x => x.remove());
  aurralPopular(n, ar, popBox);
  n.append(shelf(t('discography'), alb.map(albumTile)));
  await aurralArtistExtras(n, ar);
  if (ar.Overview) n.append(h('h2', {}, t('artist')), h('p', { style: 'color:#b3b3b3;line-height:1.6;max-width:780px' }, ar.Overview.replace(/<[^>]+>/g, '')));
}

/* floating pill in Netflix shell while music plays */
C.updateNPill = function () {
  let pill = $('#cx-npill'); const it = cur();
  if (!it || C.mode === 'sp') { if (pill) pill.remove(); return; }
  if (!pill) { pill = h('div', { id: 'cx-npill', class: 'nf-npill', onclick: () => go('#/c/music') }, h('div', { class: 'cv' }), h('div', { class: 'tx' }, h('b', { class: 'ell' }), h('span', { class: 'ell' })), h('button', { class: 'pp', onclick: e => { e.stopPropagation(); toggle(); } })); root.append(pill); }
  $('.cv', pill).style.backgroundImage = 'url("' + trackImg(it, 100) + '")'; $('b', pill).textContent = it.Name; $('span', pill).textContent = artistText(it); $('.pp', pill).replaceChildren(ic(P.audio.paused ? 'play' : 'pause'));
};

/* ---------- lyrics (plain + time-synced, straight from Jellyfin's lyric providers / .lrc files) ---------- */
Object.assign(TX.en, { lyrics: 'Lyrics', noLyrics: 'No lyrics found for this song.', lyrSynced: 'Synced', lyrPlain: 'Not synced' });
Object.assign(TX.de, { lyrics: 'Songtext', noLyrics: 'Für diesen Titel wurde kein Songtext gefunden.', lyrSynced: 'Synchronisiert', lyrPlain: 'Nicht synchronisiert' });
let lyrEl = null, lyrLines = null, lyrId = null, lyrAt = -1, lyrSynced = false;
function toggleLyrics() {
  if (lyrEl) { lyrEl.remove(); lyrEl = null; panelClosed(); return; }
  if (queueEl) { queueEl.remove(); queueEl = null; }
  lyrEl = h('div', { class: 'sp-queue sp-lyrics' }); panelHost().append(lyrEl); const it = cur(); if (it) loadLyrics(it); else drawLyrics(); panelOpened();
}
async function loadLyrics(it) {
  lyrId = it.Id; lyrLines = null; lyrAt = -1; drawLyrics(true);
  try { const r = await api('Audio/' + it.Id + '/Lyrics'); if (lyrId !== it.Id) return; lyrLines = (r.Lyrics || []).map(l => ({ t: l.Start != null ? l.Start / 1e7 : null, s: l.Text })); lyrSynced = lyrLines.length > 0 && lyrLines.filter(l => l.t != null).length > lyrLines.length / 2; }
  catch (e) { if (lyrId !== it.Id) return; lyrLines = []; lyrSynced = false; }
  drawLyrics();
}
function drawLyrics(loading) {
  if (!lyrEl) return; const it = cur();
  const head = h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, h('h3', {}, t('lyrics')), h('button', { class: 'pl-btn', onclick: toggleLyrics }, ic('close')));
  const sub_ = it ? h('div', { class: 'lyr-song' }, h('b', { class: 'ell' }, it.Name), h('span', { class: 'ell' }, artistText(it) + (lyrLines && lyrLines.length ? ' · ' + (lyrSynced ? t('lyrSynced') : t('lyrPlain')) : ''))) : null;
  let body;
  if (loading || lyrLines == null) body = h('div', { class: 'spinner', style: 'margin:60px auto' });
  else if (!lyrLines.length) body = h('div', { class: 'nf-empty', style: 'padding:40px 10px' }, t('noLyrics'));
  else body = h('div', { class: 'lyr-body' + (lyrSynced ? ' sync' : '') }, lyrLines.map((l, i) => h('p', { class: 'lyr-l' + (l.s ? '' : ' gap'), 'data-i': i, onclick: lyrSynced && l.t != null ? () => { P.audio.currentTime = l.t; } : null }, l.s || '♪')));
  const foot = h('div', { class: 'lyr-foot' }, lyrSeek = seekBar(null, (f, commit) => { if (commit && P.audio.duration) P.audio.currentTime = f * P.audio.duration; }), h('div', { class: 'lyr-ctr' }, h('button', { class: 'pl-btn', onclick: prev }, ic('prev')), lyrPP = h('button', { class: 'pl-btn big', onclick: toggle }, ic(P.audio.paused ? 'play' : 'pause')), h('button', { class: 'pl-btn', onclick: () => next() }, ic('next'))));
  lyrEl.replaceChildren(head, sub_ || '', body, foot); if (P.audio.duration) lyrSeek.set(P.audio.currentTime / P.audio.duration);
}
let lyrSeek = null, lyrPP = null;
const lyrUpPP = () => { if (lyrPP && lyrPP.isConnected) lyrPP.replaceChildren(ic(P.audio.paused ? 'play' : 'pause')); };
P.audio.addEventListener('play', lyrUpPP); P.audio.addEventListener('pause', lyrUpPP);
P.audio.addEventListener('timeupdate', () => { if (lyrSeek && lyrSeek.isConnected && !lyrSeek.dragging() && P.audio.duration) lyrSeek.set(P.audio.currentTime / P.audio.duration); });
P.audio.addEventListener('timeupdate', () => {
  if (!lyrEl || !lyrSynced || !lyrLines || !lyrLines.length) return; const now = P.audio.currentTime + .25; let idx = -1;
  for (let i = 0; i < lyrLines.length; i++) { if (lyrLines[i].t != null && lyrLines[i].t <= now) idx = i; else if (lyrLines[i].t != null) break; }
  if (idx === lyrAt) return; lyrAt = idx; const ps = lyrEl.querySelectorAll('.lyr-l'); ps.forEach((p, i) => { p.classList.toggle('on', i === idx); p.classList.toggle('past', i < idx); });
  const el = ps[idx]; if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
});
P.subs.push(() => { if (lyrEl && cur() && cur().Id !== lyrId) loadLyrics(cur()); });

/* ---------- quick play from the library list ---------- */
async function playLibItem(o) {
  try {
    let tr = [];
    if (o.id === 'liked') tr = await tracksOf({ Filters: 'IsFavorite', SortBy: 'SortName', Limit: 500 });
    else if (/playlist/.test(o.href)) tr = await tracksOf({ ParentId: o.id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' });
    else if (/album/.test(o.href)) tr = await tracksOf({ ParentId: o.id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' });
    else if (/artist/.test(o.href)) tr = await tracksOf({ ArtistIds: o.id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 100 });
    if (tr.length) playList(tr, 0, { ctx: { id: o.id } }); else toast(t('empty'));
  } catch (e) { toast('⚠'); }
}
