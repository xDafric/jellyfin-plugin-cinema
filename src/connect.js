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
Object.assign(LUMAP, { users: 'users', 'check-mark': 'check-mark', cast: 'cast', devices: 'cx-devices', dphone: 'cx-phone', ddesktop: 'cx-desktop', dtv: 'cx-tv', dspeaker: 'cx-speaker', dweb: 'cx-browser' });
Object.assign(TX.en, { cnDevices: 'Devices', cnThis: 'This device', cnListening: 'Listening on', cnPlayHere: 'Play here', cnAvail: 'Available', cnNone: 'Open Cinema on another device to see it here.', cnPlaying: 'Playing', cnPaused: 'Paused', cnNothing: 'Nothing playing', cnMoved: 'Playing on', cnHide: 'Hide', cnTap: 'Tap to start playback on this device', cnRename: 'Name of this device', cnPlayingOn: 'Playing on', cnScan: 'Search for speakers', cnScanning: 'Searching …', cnFound: 'speakers found', cnOut: 'Sound output of this device', cnOutPick: 'Choose speaker or headphones', cnBt: 'Bluetooth and outputs', cnOutDef: 'System default', cnNoSpk: 'None in this Wi-Fi network (the phone or computer has to be in the same network as the speakers).', cnSpkOff: 'Network speakers are off', cnSpkOffD: 'Administrator: Dashboard, Plugins, Cinema, Network speakers', jamStart: 'Start a Jam', jamStartD: 'Friends join with a link and add songs to the queue', jamLive: 'Jam is on', jamCopy: 'Copy link', jamCopied: 'Link copied', jamShare: 'Share', jamGuests: 'guests', jamApprove: 'I approve every song', jamEnd: 'End Jam', jamReq: 'Requests', jamNoReq: 'No requests yet', jamKick: 'Remove guest', jamFor: 'valid for', jamErr: 'The Jam could not be started' });
Object.assign(TX.de, { cnDevices: 'Geräte', cnThis: 'Dieses Gerät', cnListening: 'Du hörst auf', cnPlayHere: 'Hier abspielen', cnAvail: 'Verfügbar', cnNone: 'Öffne Cinema auf einem anderen Gerät, dann erscheint es hier.', cnPlaying: 'Spielt', cnPaused: 'Pausiert', cnNothing: 'Nichts aktiv', cnMoved: 'Spielt jetzt auf', cnHide: 'Ausblenden', cnTap: 'Tippen, um hier abzuspielen', cnRename: 'Name dieses Geräts', cnPlayingOn: 'Wiedergabe über', cnScan: 'Lautsprecher suchen', cnScanning: 'Suche …', cnFound: 'Lautsprecher gefunden', cnOut: 'Tonausgabe dieses Geräts', cnOutPick: 'Lautsprecher oder Kopfhörer wählen', cnBt: 'Bluetooth und Ausgänge', cnOutDef: 'Systemstandard', cnNoSpk: 'Keine in diesem WLAN (Handy oder Computer müssen im selben Netz wie die Lautsprecher sein).', cnSpkOff: 'Netzwerk-Lautsprecher sind aus', cnSpkOffD: 'Administrator: Dashboard, Plugins, Cinema, Network speakers', jamStart: 'Jam starten', jamStartD: 'Freunde treten per Link bei und legen Songs in die Warteschlange', jamLive: 'Jam läuft', jamCopy: 'Link kopieren', jamCopied: 'Link kopiert', jamShare: 'Teilen', jamGuests: 'Gäste', jamApprove: 'Ich gebe jeden Song frei', jamEnd: 'Jam beenden', jamReq: 'Wünsche', jamNoReq: 'Noch keine Wünsche', jamKick: 'Gast entfernen', jamFor: 'gültig noch', jamErr: 'Die Jam konnte nicht gestartet werden' });

const CN = { skip: '', on: false, id: null, name: '', kind: 'web', devices: [], v: 0, got: 0, hidden: null, started: false, lastSend: 0, run: false };
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
  if (!CN.on || !CN.registered) return; const n = Date.now(); if (!push && n - CN.lastSend < 3500) return;
  const st = P.remote ? (String(P.remote).indexOf('spk_') === 0 && typeof spStateById === 'function' ? spStateById(P.remote) : null) : cnState(); if (!st) return; CN.lastSend = n;
  cnPost('state', { id: CN.id, push: !!push, state: st }).catch(() => { });
}

/* commands from the other devices */
async function cnTracks(ids) {
  const out = []; for (let i = 0; i < ids.length; i += 60) { const r = await items({ Ids: ids.slice(i, i + 60).join(','), Fields: AUD_F, Recursive: false }); out.push(...r.Items); }
  const by = new Map(out.map(x => [x.Id.replace(/-/g, ''), x])); return ids.map(i => by.get(String(i).replace(/-/g, ''))).filter(Boolean);
}
function cnPlayNow() { return P.audio.play().catch(() => { toast(t('cnTap')); const once = () => { P.audio.play().catch(() => { }); window.removeEventListener('pointerdown', once, true); }; window.addEventListener('pointerdown', once, true); }); }
async function cnRun(c) {
  if (P.remote && c.cmd !== 'transfer') { if (String(P.remote).indexOf('spk_') === 0) spCommand(P.remote, c.cmd, c); return; }   /* while this player mirrors another device, commands go to that device (a speaker here) or are ignored */
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
function cnApply(r) { if (!r) return; CN.v = r.v; CN.got = Date.now(); CN.devices = (r.devices || []).filter(d => d.kind !== 'speaker').concat(typeof spDevices === 'function' ? spDevices() : []); cnDraw(); }
function cnStart() {
  if (CN.started || cnOff() || !feat('connect') || typeof ApiClient === 'undefined' || !ApiClient.accessToken || !ApiClient.accessToken()) return;
  CN.started = true; CN.on = true; cnIdentity(); cnLoop(); cnApplySink(); setTimeout(jamLoad, 1500);
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
function cnPos(d) { const s = d.state || {}; if (d.local) return s.pos || 0; return s.playing ? (s.pos || 0) + ((d.age || 0) + (Date.now() - CN.got)) / 1000 : (s.pos || 0); }
function cnActive() {
  const c = cnOthers().filter(d => d.state && d.state.item && d.state.item.id).sort((a, b) => (b.state.playing - a.state.playing) || (b.at - a.at));
  const a = c[0]; if (!a) return null; if (!a.state.playing && Date.now() - a.at > 10 * 60 * 1000) return null; return a;
}
const cnSend = (to, cmd, extra) => String(to).indexOf('spk_') === 0 ? spCommand(to, cmd, extra || {}) : cnPost('command', Object.assign({ to, cmd, from: CN.id }, extra || {})).catch(() => { });
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
  const pos = P.remote === d.id ? rmPos() : cnPos(d); cnSend(d.id, 'pause'); rmExit();
  await cnRun({ cmd: 'transfer', queue: s.queue, index: s.index, pos, playing: true }); cnShut(); cnDraw();
}
/* from one other device to another */
function cnMove(from, to) {
  const s = from.state; if (!s || !s.queue || !s.queue.length) return cnShut();
  cnSend(to.id, 'transfer', { queue: s.queue, index: s.index, pos: P.remote === from.id ? rmPos() : cnPos(from), playing: true }); cnSend(from.id, 'pause'); toast(t('cnMoved') + ' ' + to.name); cnShut();
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
  if (!cnPanel) return; const me = cur(), here = !P.remote && !!me && !dpPaused();
  const row = (icon, name, sub, on, fn) => h('button', { class: 'cn-row' + (on ? ' on' : ''), onclick: fn }, h('span', { class: 'cn-ic' }, icon), h('span', { class: 'cn-tx' }, h('b', { class: 'ell' }, name), h('span', { class: 'ell' }, sub)), on ? h('span', { class: 'cn-eq' }, h('i'), h('i'), h('i')) : '');
  const remDev = P.remote ? CN.devices.find(x => x.id === P.remote) : null;
  const rows = [row(ic(CN.kind === 'phone' || CN.kind === 'tablet' ? 'dphone' : CN.kind === 'desktop' ? 'ddesktop' : CN.kind === 'tv' ? 'dtv' : 'dweb', 'ic-s'), t('cnThis') + ' · ' + CN.name, here ? me.Name + ' · ' + artistText(me) : t('cnAvail'), here, () => { if (remDev) cnPullFrom(remDev); else cnShut(); })];
  const others = cnOthers();
  others.forEach(d => { const s = d.state, it = s && s.item && s.item.name ? s.item : null, pl = !!(s && s.playing && it), mirrored = P.remote === d.id;
    rows.push(row(dIcon(d), d.name, pl ? it.name + ' · ' + it.artist : it ? t('cnPaused') + ' · ' + it.name : t('cnAvail'), pl || mirrored, () => { if (mirrored) cnShut(); else if (remDev) cnMove(remDev, d); else if (pl) cnPullFrom(d); else cnTransferTo(d); })); });
  cnPanel.replaceChildren(h('div', { class: 'cn-head' }, h('b', {}, t('cnDevices')), h('button', { class: 'pl-btn', 'aria-label': t('close'), onclick: cnShut }, ic('close'))), h('div', { class: 'cn-list' }, rows), others.length ? '' : h('div', { class: 'cn-empty' }, t('cnNone')),
    cnJam(),
    cnActions(),
    h('label', { class: 'cn-name' }, h('span', {}, t('cnRename')), h('input', { type: 'text', value: CN.name, maxlength: 48, onchange: e => { const v = e.target.value.trim().slice(0, 48) || CN.def; CN.name = v; try { localStorage.setItem('cx-dev-name', v === CN.def ? '' : v); } catch (er) { } cnPost('hello', { id: CN.id, name: CN.name, kind: CN.kind }).catch(() => { }); } })));
}

/* ---------- Jam: guests with a link put songs in the queue ---------- */
const jamLink = () => (ApiClient.serverAddress() || location.origin).replace(/\/+$/, '') + '/Cinema/jam/' + CN.jam.code;
async function jamLoad() {
  if (!CN.on) return; try { const r = await ApiClient.getJSON(ApiClient.getUrl('Cinema/jam/mine')); const was = !!CN.jam; CN.jam = r && r.code ? r : null; if (was !== !!CN.jam || cnPanel) cnDraw(); } catch (e) { }
}
async function jamStart() {
  try { CN.jam = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/jam/start', { device: CN.id }), dataType: 'json' }); cnDraw(); } catch (e) { toast(t('jamErr')); }
}
const jamPost = (path, q) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/jam/' + path, q || {}), dataType: 'json' }).then(r => { if (r && r.code) CN.jam = r; return r; }).catch(() => { });
function cnJam() {
  if (!feat('connect')) return '';
  const j = CN.jam;
  if (!j) return h('div', { class: 'cn-acts' }, h('button', { class: 'cn-act', onclick: jamStart }, ic('users', 'ic-s'), h('span', {}, h('b', {}, t('jamStart')), h('i', {}, t('jamStartD')))));
  const url = jamLink(), qr = typeof qrSvg === 'function' ? qrSvg(url, 168) : null, left = Math.max(0, Math.round((j.expires - Date.now()) / 60000));
  const pend = (j.requests || []).filter(r => r.status === 'pending');
  const reqs = (j.requests || []).slice(0, 8).map(r => h('div', { class: 'jam-req' }, h('span', { class: 'jam-rt' }, h('b', { class: 'ell' }, r.name), h('i', { class: 'ell' }, r.artist + ' · ' + r.by)),
    r.status === 'pending' ? h('span', { class: 'jam-dec' }, h('button', { class: 'pl-btn', 'aria-label': 'OK', onclick: () => jamPost('decide', { id: r.id, ok: true }).then(cnDraw) }, ic('check-mark', 'ic-s')), h('button', { class: 'pl-btn', 'aria-label': 'No', onclick: () => jamPost('decide', { id: r.id, ok: false }).then(cnDraw) }, ic('close', 'ic-s'))) : h('em', { class: 'jam-st ' + r.status }, r.status === 'queued' ? '✓' : '×')));
  return h('div', { class: 'jam' },
    h('div', { class: 'jam-head' }, h('b', {}, t('jamLive')), h('span', {}, (j.guests || []).length + ' ' + t('jamGuests') + ' · ' + t('jamFor') + ' ' + (left >= 60 ? Math.floor(left / 60) + ' h ' + (left % 60) + ' min' : left + ' min'))),
    qr ? h('div', { class: 'jam-qr' }, qr) : '',
    h('div', { class: 'jam-link' }, h('input', { type: 'text', readonly: true, value: url, onfocus: e => e.target.select() }),
      h('button', { class: 'cn-here', onclick: async e => { try { await navigator.clipboard.writeText(url); } catch (er) { const i = e.currentTarget.parentNode.querySelector('input'); i.select(); document.execCommand('copy'); } toast(t('jamCopied')); } }, t('jamCopy')),
      navigator.share ? h('button', { class: 'cn-here', onclick: () => navigator.share({ title: 'Jam', url }).catch(() => { }) }, t('jamShare')) : ''),
    h('label', { class: 'jam-sw' }, h('input', { type: 'checkbox', checked: !!j.approve, onchange: e => jamPost('settings', { approve: e.target.checked }).then(cnDraw) }), h('span', {}, t('jamApprove'))),
    (j.guests || []).length ? h('div', { class: 'jam-guests' }, (j.guests || []).map(g => h('span', { class: 'jam-g', title: t('jamKick'), onclick: () => { if (confirm(t('jamKick') + ': ' + g.name + '?')) jamPost('kick', { id: g.id }).then(jamLoad); } }, g.name))) : '',
    h('div', { class: 'jam-reqs' }, h('b', {}, t('jamReq') + (pend.length ? ' (' + pend.length + ')' : '')), reqs.length ? reqs : h('div', { class: 'cn-empty' }, t('jamNoReq'))),
    h('button', { class: 'cn-act jam-end', onclick: () => { if (confirm(t('jamEnd') + '?')) jamPost('stop').then(() => { CN.jam = null; cnDraw(); }); } }, h('span', {}, h('b', {}, t('jamEnd')))));
}
setInterval(() => { if (CN.on && (CN.jam || cnPanel)) jamLoad(); }, 5000);

/* this device's own sound output (desktop and browsers) and the system output panel (Android app) */
const cnCanSink = () => typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;
async function cnApplySink() { try { const id = localStorage.getItem('cx-dev-sink'); if (id && cnCanSink()) await P.audio.setSinkId(id); } catch (e) { try { localStorage.removeItem('cx-dev-sink'); } catch (er) { } } }
async function cnPickSink() {
  try {
    let id = '', label = '';
    if (navigator.mediaDevices && navigator.mediaDevices.selectAudioOutput) { const d = await navigator.mediaDevices.selectAudioOutput(); id = d.deviceId; label = d.label; }
    else { const all = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audiooutput'); const cur = localStorage.getItem('cx-dev-sink') || ''; const i = Math.max(0, all.findIndex(d => d.deviceId === cur)); const d = all[(i + 1) % Math.max(1, all.length)]; if (d) { id = d.deviceId === 'default' ? '' : d.deviceId; label = d.label || ('#' + (((i + 1) % all.length) + 1)); } }
    await P.audio.setSinkId(id || ''); try { localStorage.setItem('cx-dev-sink', id || ''); localStorage.setItem('cx-dev-sinkname', label || ''); } catch (e) { }
    toast(label || t('cnOutDef')); cnPaintPanel();
  } catch (e) { if (e && e.name !== 'NotAllowedError' && e.name !== 'AbortError') toast(String(e.message || e)); }
}
function cnActions() {
  const out = []; const nat = window.CinemaNative;
  if (cnCanSink() && !(nat && nat.audioOutput)) { let nm = ''; try { nm = localStorage.getItem('cx-dev-sinkname') || ''; } catch (e) { } out.push(h('button', { class: 'cn-act', onclick: cnPickSink }, ic('dspeaker', 'ic-s'), h('span', {}, h('b', {}, t('cnOutPick')), h('i', {}, t('cnOut') + ' · ' + (nm || t('cnOutDef')))))); }
  if (nat && nat.audioOutput) out.push(h('button', { class: 'cn-act', onclick: () => { try { nat.audioOutput(); } catch (e) { } } }, ic('dspeaker', 'ic-s'), h('span', {}, h('b', {}, t('cnBt')), h('i', {}, t('cnOut')))));
  if (typeof spNative === 'function' && spNative()) out.push(h('button', { class: 'cn-act', onclick: async e => { const b = e.currentTarget; const sp = b.querySelector('b'); const old = sp.textContent; sp.textContent = t('cnScanning'); b.disabled = true; await spScan(false); sp.textContent = old; b.disabled = false; } }, ic('cast', 'ic-s'), h('span', {}, h('b', {}, t('cnScan')), h('i', {}, 'UPnP · DLNA · Sonos'))));
  return out.length ? h('div', { class: 'cn-acts' }, out) : '';
}

/* the button in the player bars */
function connectButton(cls) {
  const b = h('button', { class: (cls || 'pl-btn') + ' cn-btn', 'aria-label': t('cnDevices'), title: t('cnDevices'), onclick: e => { e.stopPropagation(); cnStart(); cnOpen(b); } }, ic('devices'));
  CN.btns = (CN.btns || []).filter(x => x.isConnected); CN.btns.push(b); cnDraw(); return b;
}

/* ---------- remote mode: the normal player bar shows and controls what another device plays ---------- */
const RM = { id: null, playing: false, posAt: 0, t0: 0, dur: 0, vol: 1, item: null, timer: null, busy: false, skip: '' };
const rmPos = () => { const p = RM.playing ? RM.posAt + (Date.now() - RM.t0) / 1000 : RM.posAt; return RM.dur ? Math.min(p, RM.dur) : p; };
const dpAud = (() => { const d = n => Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, n); return { paused: d('paused'), currentTime: d('currentTime'), duration: d('duration'), volume: d('volume'), muted: d('muted') }; })();
const dpPaused = () => dpAud.paused.get.call(P.audio);
P.remote = null;
function rmTick() { P.audio.dispatchEvent(new Event('timeupdate')); }
function rmSet(playing) { RM.posAt = rmPos(); RM.t0 = Date.now(); RM.playing = playing; emit(); rmTick(); }
(function patchAudio() {
  const A = P.audio, def = (n, get, set) => Object.defineProperty(A, n, { configurable: true, get, set });
  def('paused', () => P.remote ? !RM.playing : dpAud.paused.get.call(A));
  def('currentTime', () => P.remote ? rmPos() : dpAud.currentTime.get.call(A), v => { if (P.remote) { RM.posAt = v; RM.t0 = Date.now(); cnSend(P.remote, 'seek', { pos: v }); rmTick(); } else dpAud.currentTime.set.call(A, v); });
  def('duration', () => P.remote ? (RM.dur || NaN) : dpAud.duration.get.call(A));
  def('volume', () => P.remote ? RM.vol : dpAud.volume.get.call(A), v => { if (P.remote) { RM.vol = v; cnSend(P.remote, 'volume', { vol: v }); } else dpAud.volume.set.call(A, v); });
  def('muted', () => P.remote ? false : dpAud.muted.get.call(A), v => { if (!P.remote) dpAud.muted.set.call(A, v); });
  const play = HTMLMediaElement.prototype.play, pause = HTMLMediaElement.prototype.pause;
  A.play = function () { if (P.remote) { rmSet(true); cnSend(P.remote, 'play'); return Promise.resolve(); } return play.call(A); };
  A.pause = function () { if (P.remote) { rmSet(false); cnSend(P.remote, 'pause'); return; } return pause.call(A); };
})();
function rmFromState(d) { const s = d.state; RM.playing = !!s.playing; RM.posAt = cnPos(d); RM.t0 = Date.now(); RM.dur = s.dur || 0; RM.vol = s.vol == null ? 1 : s.vol; RM.item = s.item && s.item.id; }
async function rmLoadQueue(d) {
  const s = d.state, q = s.queue || [], start = Math.max(0, (s.index || 0) - 10), tr = await cnTracks(q.slice(start, start + 110)); if (!tr.length) return false;
  const id = s.item && s.item.id; P.orig = tr.slice(); P.q = tr.slice(); P.i = Math.max(0, tr.findIndex(x => x.Id.replace(/-/g, '') === id)); P.ctx = null; return true;
}
async function rmEnter(d) {
  if (RM.busy || P.remote === d.id) return; RM.busy = true;
  try {
    if (!await rmLoadQueue(d)) return;
    if (!dpPaused()) return;   // started playing here meanwhile
    P.remote = d.id; RM.id = d.id; rmFromState(d); clearInterval(RM.timer); RM.timer = setInterval(() => { if (P.remote && RM.playing) rmTick(); }, 500); emit(); rmTick(); cnDraw();
  } catch (e) { } finally { RM.busy = false; }
}
function rmExit() { if (!P.remote) return; P.remote = null; RM.id = null; clearInterval(RM.timer); cnDraw(); emit(); }
async function rmUpdate(d) {
  rmFromState(d); const cu = cur(), id = d.state.item && d.state.item.id;
  if (!cu || cu.Id.replace(/-/g, '') !== id) { const k = P.q.findIndex(x => x.Id.replace(/-/g, '') === id); if (k >= 0) P.i = k; else if (!RM.busy) { RM.busy = true; try { await rmLoadQueue(d); } catch (e) { } RM.busy = false; } }
  emit(); rmTick();
}
function cnDraw() {
  const a = cnActive(), localPlaying = !P.remote && !!cur() && !dpPaused();
  (CN.btns || []).forEach(b => { b.classList.toggle('live', !!P.remote || (!!a && a.state.playing && !localPlaying)); b.classList.toggle('jamon', !!CN.jam); });
  if (cnPanel) cnPaintPanel();
  /* follow what the other device does, or step out when it is gone */
  if (P.remote) {
    const d = CN.devices.find(x => x.id === P.remote);
    if (!d || !d.state || !d.state.item || !d.state.item.id || (!d.state.playing && Date.now() - d.at > 10 * 60 * 1000)) rmExit(); else rmUpdate(d);
  } else if (a && a.state.playing && dpPaused() && CN.skip !== a.id + ':' + a.state.item.id) rmEnter(a);
  /* the green strip: "Playing on …" */
  const rd = P.remote && CN.devices.find(x => x.id === P.remote);
  document.querySelectorAll('.sp-player, .sp-mini, .sp-full').forEach(el => {
    el.classList.toggle('remote', !!rd); let st = el.querySelector(':scope > .cn-strip');
    if (rd) { if (!st) { st = h('button', { class: 'cn-strip', onclick: e => { e.stopPropagation(); cnOpen(); } }); el.append(st); } st.replaceChildren(ic('devices', 'ic-s'), h('span', {}, t('cnPlayingOn') + ' ' + rd.name)); } else if (st) st.remove();
  });
}
P.subs.push(() => { cnDraw(); });
P.audio.addEventListener('play', cnDraw); P.audio.addEventListener('pause', cnDraw);
