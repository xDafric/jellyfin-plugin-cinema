/* ---------- Cinema Connect: your devices play together (like Spotify Connect) ----------
   Every signed-in client registers with the plugin hub, reports what it plays, and can control the others:
   play, pause, skip, seek, volume, and "play here" (move the queue and position to another device).
   The hub is per user and lives in the server's memory. Switch off on one device: localStorage cx-dev-connect = off. */
Object.assign(LU, {
  'cx-devices': '<path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"/><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"/><path d="M16 9h2"/>',
  'cx-phone': '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z"/><path d="M11 4h2"/><path d="M12 17v.01"/>',
  'cx-desktop': '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
  'cx-tv': '<path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9z"/><path d="M16 3l-4 4l-4 -4"/>',
  'cx-speaker': '<path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M12 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 7l0 .01"/>',
  'cx-browser': '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18"/><path d="M12.5 3a17 17 0 0 1 0 18"/>'
});
Object.assign(LUMAP, { devices: 'cx-devices', dphone: 'cx-phone', ddesktop: 'cx-desktop', dtv: 'cx-tv', dspeaker: 'cx-speaker', dweb: 'cx-browser' });
Object.assign(TX.en, { cnDevices: 'Devices', cnThis: 'This device', cnListening: 'Listening on', cnPlayHere: 'Play here', cnAvail: 'Available', cnNone: 'Open Cinema on another device to see it here.', cnPlaying: 'Playing', cnPaused: 'Paused', cnNothing: 'Nothing playing', cnMoved: 'Playing on', cnHide: 'Hide', cnTap: 'Tap to start playback on this device', cnRename: 'Name of this device' });
Object.assign(TX.de, { cnDevices: 'Geräte', cnThis: 'Dieses Gerät', cnListening: 'Du hörst auf', cnPlayHere: 'Hier abspielen', cnAvail: 'Verfügbar', cnNone: 'Öffne Cinema auf einem anderen Gerät, dann erscheint es hier.', cnPlaying: 'Spielt', cnPaused: 'Pausiert', cnNothing: 'Nichts aktiv', cnMoved: 'Spielt jetzt auf', cnHide: 'Ausblenden', cnTap: 'Tippen, um hier abzuspielen', cnRename: 'Name dieses Geräts' });

const CN = { on: false, id: null, name: '', kind: 'web', devices: [], v: 0, got: 0, hidden: null, started: false, lastSend: 0, run: false };
const cnSleep = ms => new Promise(r => setTimeout(r, ms));
const cnOff = () => { try { return localStorage.getItem('cx-dev-connect') === 'off'; } catch (e) { return false; } };
function cnIdentity() {
  let raw = ''; try { raw = ApiClient.deviceId() || ''; } catch (e) { }
  CN.id = ('cx_' + raw.replace(/[^A-Za-z0-9_-]/g, '')).slice(0, 64); if (CN.id.length < 8) CN.id = 'cx_' + Math.random().toString(36).slice(2, 12);
  let cap = {}; try { cap = JSON.parse((window.CinemaNative && window.CinemaNative.capabilities && window.CinemaNative.capabilities()) || '{}'); } catch (e) { }
  const ua = navigator.userAgent, cfgN = window.__CINEMA_CFG || {};
  if (cap.platform === 'android') { CN.kind = cap.mode === 'tv' ? 'tv' : (matchMedia('(min-width: 700px)').matches ? 'tablet' : 'phone'); CN.def = cap.mode === 'tv' ? 'Android TV' : 'Android'; }
  else if (cfgN.os) { CN.kind = 'desktop'; CN.def = cfgN.os === 'windows' ? 'Windows (App)' : cfgN.os === 'macos' ? 'Mac (App)' : 'Linux (App)'; }
  else { CN.kind = /Android|iPhone/.test(ua) ? 'phone' : 'web'; CN.def = /Android/.test(ua) ? 'Android Browser' : /iPhone|iPad/.test(ua) ? 'iPhone Browser' : /Windows/.test(ua) ? 'Windows Browser' : /Mac/.test(ua) ? 'Mac Browser' : 'Browser'; }
  let nm = ''; try { nm = localStorage.getItem('cx-dev-name') || ''; } catch (e) { } CN.name = (nm || CN.def).slice(0, 48);
}
const cnPost = (path, body) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/connect/' + path), data: JSON.stringify(body), contentType: 'application/json' });

/* what this device plays now */
function cnState() {
  const it = cur(); const pl = P.q.filter(x => x && !x._ext && x.Id).map(x => x.Id);
  return { playing: !!it && !P.audio.paused && !P.audio.ended, pos: P.audio.currentTime || 0, dur: isFinite(P.audio.duration) ? P.audio.duration : ((it && it.RunTimeTicks) || 0) / 1e7, vol: P.audio.muted ? 0 : P.audio.volume, muted: !!P.audio.muted, shuffle: !!P.shuffle, repeat: ['off', 'all', 'one'][P.repeat] || 'off', index: it && !it._ext ? Math.max(0, pl.indexOf(it.Id)) : 0, queue: pl.slice(0, 500),
    item: it ? { id: it._ext ? '' : it.Id, name: it.Name || '', artist: artistText(it), album: it.Album || '', albumId: it.AlbumId || '', tag: '' } : null };
}
function cnReport(push) {
  if (!CN.on || !CN.registered) return; const n = Date.now(); if (!push && n - CN.lastSend < 3500) return; CN.lastSend = n;
  cnPost('state', { id: CN.id, push: !!push, state: cnState() }).catch(() => { });
}

/* commands from the other devices */
async function cnTracks(ids) {
  const out = []; for (let i = 0; i < ids.length; i += 60) { const r = await items({ Ids: ids.slice(i, i + 60).join(','), Fields: AUD_F, Recursive: false }); out.push(...r.Items); }
  const by = new Map(out.map(x => [x.Id.replace(/-/g, ''), x])); return ids.map(i => by.get(String(i).replace(/-/g, ''))).filter(Boolean);
}
function cnPlayNow() { return P.audio.play().catch(() => { toast(t('cnTap')); const once = () => { P.audio.play().catch(() => { }); window.removeEventListener('pointerdown', once, true); }; window.addEventListener('pointerdown', once, true); }); }
async function cnRun(c) {
  try {
    switch (c.cmd) {
      case 'play': if (cur()) cnPlayNow(); break;
      case 'pause': P.audio.pause(); break;
      case 'toggle': toggle(); break;
      case 'next': next(); break;
      case 'prev': prev(); break;
      case 'seek': if (isFinite(c.pos)) P.audio.currentTime = c.pos; break;
      case 'volume': P.audio.muted = false; P.audio.volume = Math.max(0, Math.min(1, c.vol)); break;
      case 'shuffle': if (!!c.on !== P.shuffle) toggleShuffle(); break;
      case 'repeat': P.repeat = { off: 0, all: 1, one: 2 }[c.mode] || 0; emit(); break;
      case 'queueAdd': { const tr = await cnTracks(c.queue || []); if (tr.length) addQueue(tr, false); break; }
      case 'transfer': {
        const tr = await cnTracks(c.queue || []); if (!tr.length) return;
        const idx = Math.min(c.index || 0, tr.length - 1); P.orig = tr.slice(); P.q = tr.slice(); P.i = idx; P.ctx = null;
        const pos = c.pos || 0; const go = () => { try { if (pos > 1) P.audio.currentTime = pos; } catch (e) { } P.audio.removeEventListener('loadedmetadata', go); };
        P.audio.addEventListener('loadedmetadata', go); loadCurrent(false); if (c.playing !== false) cnPlayNow();
        break;
      }
    }
  } catch (e) { }
  setTimeout(() => cnReport(true), 300);
}

/* the loop: long poll, answer at once, try again */
async function cnLoop() {
  if (CN.run) return; CN.run = true;
  while (CN.on) {
    try {
      if (!CN.registered) { const r = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/connect/hello'), data: JSON.stringify({ id: CN.id, name: CN.name, kind: CN.kind }), contentType: 'application/json', dataType: 'json' }); CN.registered = true; cnApply(r); cnReport(true); }
      const r = await ApiClient.getJSON(ApiClient.getUrl('Cinema/connect/poll', { id: CN.id, v: CN.v })); cnApply(r);
      for (const c of (r.commands || [])) cnRun(c);
    } catch (e) {
      if (e && (e.status === 404 || (e.response && e.response.status === 404))) CN.registered = false; else await cnSleep(4000 + Math.random() * 3000);
    }
  }
  CN.run = false;
}
function cnApply(r) { if (!r) return; CN.v = r.v; CN.got = Date.now(); CN.devices = r.devices || []; cnDraw(); }
function cnStart() {
  if (CN.started || cnOff() || typeof ApiClient === 'undefined' || !ApiClient.accessToken || !ApiClient.accessToken()) return;
  CN.started = true; CN.on = true; cnIdentity(); cnLoop();
  P.subs.push(() => cnReport(true));
  P.audio.addEventListener('timeupdate', () => cnReport(false));
  P.audio.addEventListener('volumechange', () => cnReport(false));
  P.audio.addEventListener('seeked', () => cnReport(true));
  setInterval(() => { if (CN.registered && !P.audio.paused) cnReport(true); }, 20000);
  window.addEventListener('pagehide', () => { try { navigator.sendBeacon && 0; cnPost('bye', { id: CN.id }); } catch (e) { } });
}
setTimeout(function wait() { if (typeof ApiClient !== 'undefined' && ApiClient.accessToken && ApiClient.accessToken()) cnStart(); else setTimeout(wait, 2500); }, 2500);

/* ---------- what the others play ---------- */
const cnOthers = () => CN.devices.filter(d => !d.self);
function cnPos(d) { const s = d.state || {}; return s.playing ? (s.pos || 0) + (Date.now() - CN.got) / 1000 + 0 : (s.pos || 0); }
function cnActive() {
  const c = cnOthers().filter(d => d.state && d.state.item && d.state.item.id).sort((a, b) => (b.state.playing - a.state.playing) || (b.at - a.at));
  const a = c[0]; if (!a) return null; if (!a.state.playing && Date.now() - a.at > 10 * 60 * 1000) return null; return a;
}
const cnSend = (to, cmd, extra) => cnPost('command', Object.assign({ to, cmd, from: CN.id }, extra || {})).catch(() => { });
const dIcon = d => ic({ phone: 'dphone', tablet: 'dphone', desktop: 'ddesktop', tv: 'dtv', speaker: 'dspeaker' }[d.kind] || 'dweb', 'ic-s');
const dImg = d => { const s = d.state; return s && s.item && s.item.id ? ApiClient.getUrl('Items/' + s.item.id + '/Images/Primary', { maxWidth: 120, quality: 80 }) : ''; };

/* play on another device: our queue and position move over, here it stops */
function cnTransferTo(d) {
  const st = cnState();
  if (st.queue.length) { cnSend(d.id, 'transfer', { queue: st.queue, index: st.index, pos: st.pos, playing: st.playing || true }); P.audio.pause(); toast(t('cnMoved') + ' ' + d.name); }
  else toast(t('cnNothing'));
  cnShut();
}
/* play here: take over what another device plays */
async function cnPullFrom(d) {
  const s = d.state; if (!s || !s.queue || !s.queue.length) return;
  const pos = cnPos(d); cnSend(d.id, 'pause');
  await cnRun({ cmd: 'transfer', queue: s.queue, index: s.index, pos, playing: true }); cnShut(); CN.hidden = null; cnDraw();
}

/* ---------- picker ---------- */
let cnPanel = null;
function cnShut() { if (cnPanel) { cnPanel.remove(); cnPanel = null; } }
function cnOpen(btn) {
  if (cnPanel) return cnShut();
  cnPanel = h('div', { class: 'cn-panel', onclick: e => e.stopPropagation() }); (typeof getUI === 'function' ? getUI() : document.body).append(cnPanel);
  cnPanel.style.zIndex = 9650; cnPaintPanel();
  setTimeout(() => { const off = e => { if (cnPanel && !cnPanel.contains(e.target) && !(btn && btn.contains(e.target))) { cnShut(); document.removeEventListener('pointerdown', off, true); } }; document.addEventListener('pointerdown', off, true); }, 0);
}
function cnPaintPanel() {
  if (!cnPanel) return; const me = cur(), playingHere = !!me && !P.audio.paused;
  const row = (icon, name, sub, on, fn, img) => h('button', { class: 'cn-row' + (on ? ' on' : ''), onclick: fn }, h('span', { class: 'cn-ic' }, icon), h('span', { class: 'cn-tx' }, h('b', { class: 'ell' }, name), h('span', { class: 'ell' }, sub)), on ? h('span', { class: 'cn-eq' }, h('i'), h('i'), h('i')) : '');
  const rows = [row(ic(CN.kind === 'phone' || CN.kind === 'tablet' ? 'dphone' : CN.kind === 'desktop' ? 'ddesktop' : CN.kind === 'tv' ? 'dtv' : 'dweb', 'ic-s'), t('cnThis') + ' · ' + CN.name, playingHere ? me.Name + ' · ' + artistText(me) : t('cnAvail'), playingHere, () => { const a = cnActive(); if (a && a.state.playing) cnPullFrom(a); else cnShut(); })];
  const others = cnOthers();
  others.forEach(d => { const s = d.state, it = s && s.item && s.item.name ? s.item : null, pl = !!(s && s.playing && it); rows.push(row(dIcon(d), d.name, pl ? it.name + ' · ' + it.artist : it ? t('cnPaused') + ' · ' + it.name : t('cnAvail'), pl, () => { if (pl) cnPullFrom(d); else cnTransferTo(d); })); });
  cnPanel.replaceChildren(h('div', { class: 'cn-head' }, h('b', {}, t('cnDevices')), h('button', { class: 'pl-btn', 'aria-label': t('close'), onclick: cnShut }, ic('close'))), h('div', { class: 'cn-list' }, rows), others.length ? '' : h('div', { class: 'cn-empty' }, t('cnNone')),
    h('label', { class: 'cn-name' }, h('span', {}, t('cnRename')), h('input', { type: 'text', value: CN.name, maxlength: 48, onchange: e => { const v = e.target.value.trim().slice(0, 48) || CN.def; CN.name = v; try { localStorage.setItem('cx-dev-name', v === CN.def ? '' : v); } catch (er) { } cnPost('hello', { id: CN.id, name: CN.name, kind: CN.kind }).catch(() => { }); } })));
}

/* the button in the player bars */
function connectButton(cls) {
  const b = h('button', { class: (cls || 'pl-btn') + ' cn-btn', 'aria-label': t('cnDevices'), title: t('cnDevices'), onclick: e => { e.stopPropagation(); cnStart(); cnOpen(b); } }, ic('devices'));
  CN.btns = (CN.btns || []).filter(x => x.isConnected); CN.btns.push(b); cnDraw(); return b;
}

/* ---------- "listening on …" bar with remote controls ---------- */
let cnBar = null, cnTick = null;
function cnDraw() {
  const a = cnActive(), local = !!cur() && !P.audio.paused;
  (CN.btns || []).forEach(b => b.classList.toggle('live', !!a && a.state.playing && !local));
  if (cnPanel) cnPaintPanel();
  const show = a && !local && CN.hidden !== a.id + ':' + (a.state.item.id) && cnOthers().length;
  if (!show) { if (cnBar) { cnBar.remove(); cnBar = null; clearInterval(cnTick); } return; }
  const s = a.state, it = s.item;
  if (!cnBar) {
    cnBar = h('div', { class: 'cn-bar' }); (typeof getUI === 'function' ? getUI() : document.body).append(cnBar); cnBar.style.zIndex = 9060;
    cnTick = setInterval(() => { const d = cnActive(); if (!d || !cnBar) return; const f = d.state.dur ? Math.min(1, cnPos(d) / d.state.dur) : 0; const i = cnBar.querySelector('.cn-prog i'); if (i) i.style.width = f * 100 + '%'; }, 500);
  }
  const prog = h('div', { class: 'cn-prog', onclick: e => { const r = e.currentTarget.getBoundingClientRect(); if (s.dur) cnSend(a.id, 'seek', { pos: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * s.dur }); } }, h('i'));
  const vol = h('input', { type: 'range', min: 0, max: 1, step: .02, value: s.vol == null ? 1 : s.vol, class: 'cn-vol', 'aria-label': 'Volume', onchange: e => cnSend(a.id, 'volume', { vol: +e.target.value }) });
  const img = dImg(a);
  cnBar.replaceChildren(
    h('div', { class: 'cn-cv', style: img ? 'background-image:url("' + img + '")' : '' }),
    h('div', { class: 'cn-tx', onclick: () => cnOpen() }, h('span', { class: 'cn-on' }, ic('devices', 'ic-s'), t('cnListening') + ' ' + a.name), h('b', { class: 'ell' }, it.name), h('span', { class: 'ell' }, it.artist)),
    h('div', { class: 'cn-ct' }, h('button', { class: 'pl-btn', 'aria-label': 'Previous', onclick: () => cnSend(a.id, 'prev') }, ic('prev')), h('button', { class: 'pl-btn big', 'aria-label': 'Play / pause', onclick: () => cnSend(a.id, s.playing ? 'pause' : 'play') }, ic(s.playing ? 'pause' : 'play')), h('button', { class: 'pl-btn', 'aria-label': 'Next', onclick: () => cnSend(a.id, 'next') }, ic('next'))),
    h('div', { class: 'cn-side' }, vol, h('button', { class: 'cn-here', onclick: () => cnPullFrom(a) }, t('cnPlayHere')), h('button', { class: 'pl-btn cn-x', 'aria-label': t('cnHide'), title: t('cnHide'), onclick: () => { CN.hidden = a.id + ':' + it.id; cnDraw(); } }, ic('close', 'ic-s'))),
    prog);
  const f = s.dur ? Math.min(1, cnPos(a) / s.dur) : 0; prog.firstChild.style.width = f * 100 + '%';
}
P.subs.push(() => { cnDraw(); });
P.audio.addEventListener('play', cnDraw); P.audio.addEventListener('pause', cnDraw);
