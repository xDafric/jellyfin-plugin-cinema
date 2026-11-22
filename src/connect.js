/* ---------- Cinema Connect: your devices play together (like Spotify Connect) ----------
   Every signed-in client registers with the plugin hub, reports what it plays, and can control the others:
   play, pause, skip, seek, volume, and "play here" (move the queue and position to another device).
   The hub is per user and lives in the server's memory. Switch off on one device: localStorage cx-dev-connect = off. */
Object.assign(LU, {
  'copy': '<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>',
  'share': '<path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M8.7 10.7l6.6 -3.4"/><path d="M8.7 13.3l6.6 3.4"/>',
  'cx-devices': '<path d="M13 9a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1v-10z"/><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h9"/><path d="M16 9h2"/>',
  'cx-phone': '<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z"/><path d="M11 4h2"/><path d="M12 17v.01"/>',
  'cx-desktop': '<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z"/><path d="M7 20h10"/><path d="M9 16v4"/><path d="M15 16v4"/>',
  'cx-tv': '<path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9z"/><path d="M16 3l-4 4l-4 -4"/>',
  'cx-speaker': '<path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"/><path d="M12 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 7l0 .01"/>',
  'cx-browser': '<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M3.6 9h16.8"/><path d="M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18"/><path d="M12.5 3a17 17 0 0 1 0 18"/>'
});
Object.assign(LUMAP, { copy: 'copy', share: 'share', users: 'users', 'check-mark': 'check-mark', cast: 'cast', devices: 'cx-devices', dphone: 'cx-phone', ddesktop: 'cx-desktop', dtv: 'cx-tv', dspeaker: 'cx-speaker', dweb: 'cx-browser' });
Object.assign(TX.en, { cnDevices: 'Devices', cnThis: 'This device', cnListening: 'Listening on', cnPlayHere: 'Play here', cnAvail: 'Available', cnNone: 'Open Cinema on another device to see it here.', cnPlaying: 'Playing', cnPaused: 'Paused', cnNothing: 'Nothing playing', cnMoved: 'Playing on', cnHide: 'Hide', cnTap: 'Tap to start playback on this device', cnRename: 'Name of this device', cnConnectTo: 'Connect to a device', cnCurrent: 'Current device', cnOthers: 'Select another device', cnKindPhone: 'Phone', cnKindTablet: 'Tablet', cnKindDesktop: 'Computer', cnKindTv: 'TV', cnKindWeb: 'Browser', cnKindSpeaker: 'Speaker', cnIdle: 'Ready to play', cnThisNow: 'This device', cnHelp: 'Cannot see your device?', cnHelpSpk: 'Speakers on your Wi-Fi are found by the phone app and the Windows app. Both must be on the same network as the speaker.', cnHelpWeb: 'Speakers are only found in the phone app and the Windows app, not in the browser.', cnSearching: 'Searching ...', cnSearchDeep: 'Search the whole network', cnNoneFound: 'No speakers found yet', cnDiag: 'Last search', cnDiagTxt: 'answers', cnDiagProbed: 'addresses checked', cnAddHost: 'Add speaker by address', cnAddHostPh: 'e.g. 192.168.1.50', cnAdd: 'Add', cnRemove: 'Remove', cnBadHost: 'That is not a valid address', cnHelpFw: 'Windows may ask to allow Cinema in the firewall: allow it for private networks.', cnHelpIso: 'Guest Wi-Fi and some routers hide devices from each other.', cnHelpSonos: 'Sonos speakers can also be added by their IP address (Sonos app, Settings, About).', cnYourName: 'Name of this device', cnBack: 'Back', jamTitle: 'Jam', jamIntro: 'Listen together', jamIntroD: 'Friends join with a link or QR code, no account needed. They search songs and add them to your queue.', jamPoint1: 'You stay in control of what plays', jamPoint2: 'Remove guests or approve every song', jamPoint3: 'Ends by itself after a few hours', jamStartBtn: 'Start Jam', jamLiveNow: 'Live', jamScan: 'Scan to join', jamInvite: 'Invite friends', jamPeople: 'In the Jam', jamYou: 'You', jamAlone: 'Nobody has joined yet', jamNoReq2: 'Songs your guests add show up here', jamOpts: 'Settings', jamMax: 'Guests at most', jamMore: '+1 hour', jamLeft: 'left', jamSure: 'End the Jam for everyone?', cnPlayingOn: 'Playing on', cnScan: 'Search for speakers', cnScanning: 'Searching …', cnFound: 'speakers found', cnOut: 'Sound output of this device', cnOutPick: 'Choose speaker or headphones', cnBt: 'Bluetooth and outputs', cnOutDef: 'System default', cnNoSpk: 'None in this Wi-Fi network (the phone or computer has to be in the same network as the speakers).', cnSpkOff: 'Network speakers are off', cnSpkOffD: 'Administrator: Dashboard, Plugins, Cinema, Network speakers', jamStart: 'Start a Jam', jamStartD: 'Friends join with a link and add songs to the queue', jamLive: 'Jam is on', jamCopy: 'Copy link', jamCopied: 'Link copied', jamShare: 'Share', jamGuests: 'guests', jamApprove: 'I approve every song', jamEnd: 'End Jam', jamReq: 'Requests', jamNoReq: 'No requests yet', jamKick: 'Remove guest', jamFor: 'valid for', jamErr: 'The Jam could not be started' });
Object.assign(TX.de, { cnDevices: 'Geräte', cnThis: 'Dieses Gerät', cnListening: 'Du hörst auf', cnPlayHere: 'Hier abspielen', cnAvail: 'Verfügbar', cnNone: 'Öffne Cinema auf einem anderen Gerät, dann erscheint es hier.', cnPlaying: 'Spielt', cnPaused: 'Pausiert', cnNothing: 'Nichts aktiv', cnMoved: 'Spielt jetzt auf', cnHide: 'Ausblenden', cnTap: 'Tippen, um hier abzuspielen', cnRename: 'Name dieses Geräts', cnConnectTo: 'Mit einem Gerät verbinden', cnCurrent: 'Aktuelles Gerät', cnOthers: 'Anderes Gerät wählen', cnKindPhone: 'Handy', cnKindTablet: 'Tablet', cnKindDesktop: 'Computer', cnKindTv: 'TV', cnKindWeb: 'Browser', cnKindSpeaker: 'Lautsprecher', cnIdle: 'Bereit zum Abspielen', cnThisNow: 'Dieses Gerät', cnHelp: 'Siehst du dein Gerät nicht?', cnHelpSpk: 'Lautsprecher in deinem WLAN findet die Handy-App und die Windows-App. Beide müssen im selben Netz wie der Lautsprecher sein.', cnHelpWeb: 'Lautsprecher findest du nur in der Handy-App und in der Windows-App, nicht im Browser.', cnSearching: 'Suche …', cnSearchDeep: 'Ganzes Netzwerk durchsuchen', cnNoneFound: 'Noch keine Lautsprecher gefunden', cnDiag: 'Letzte Suche', cnDiagTxt: 'Antworten', cnDiagProbed: 'Adressen geprüft', cnAddHost: 'Lautsprecher per Adresse hinzufügen', cnAddHostPh: 'z. B. 192.168.1.50', cnAdd: 'Hinzufügen', cnRemove: 'Entfernen', cnBadHost: 'Das ist keine gültige Adresse', cnHelpFw: 'Windows fragt eventuell nach der Firewall: Erlaube Cinema in privaten Netzwerken.', cnHelpIso: 'Gast-WLAN und manche Router verstecken Geräte voreinander.', cnHelpSonos: 'Sonos lässt sich auch per IP-Adresse hinzufügen (Sonos-App, Einstellungen, Info).', cnYourName: 'Name dieses Geräts', cnBack: 'Zurück', jamTitle: 'Jam', jamIntro: 'Gemeinsam hören', jamIntroD: 'Freunde treten per Link oder QR-Code bei, ganz ohne Konto. Sie suchen Songs und legen sie in deine Warteschlange.', jamPoint1: 'Du bestimmst, was läuft', jamPoint2: 'Gäste entfernen oder jeden Song freigeben', jamPoint3: 'Endet nach ein paar Stunden von selbst', jamStartBtn: 'Jam starten', jamLiveNow: 'Live', jamScan: 'Zum Beitreten scannen', jamInvite: 'Freunde einladen', jamPeople: 'In der Jam', jamYou: 'Du', jamAlone: 'Noch niemand ist beigetreten', jamNoReq2: 'Songs deiner Gäste erscheinen hier', jamOpts: 'Einstellungen', jamMax: 'Gäste höchstens', jamMore: '+1 Stunde', jamLeft: 'übrig', jamSure: 'Die Jam für alle beenden?', cnPlayingOn: 'Wiedergabe über', cnScan: 'Lautsprecher suchen', cnScanning: 'Suche …', cnFound: 'Lautsprecher gefunden', cnOut: 'Tonausgabe dieses Geräts', cnOutPick: 'Lautsprecher oder Kopfhörer wählen', cnBt: 'Bluetooth und Ausgänge', cnOutDef: 'Systemstandard', cnNoSpk: 'Keine in diesem WLAN (Handy oder Computer müssen im selben Netz wie die Lautsprecher sein).', cnSpkOff: 'Netzwerk-Lautsprecher sind aus', cnSpkOffD: 'Administrator: Dashboard, Plugins, Cinema, Network speakers', jamStart: 'Jam starten', jamStartD: 'Freunde treten per Link bei und legen Songs in die Warteschlange', jamLive: 'Jam läuft', jamCopy: 'Link kopieren', jamCopied: 'Link kopiert', jamShare: 'Teilen', jamGuests: 'Gäste', jamApprove: 'Ich gebe jeden Song frei', jamEnd: 'Jam beenden', jamReq: 'Wünsche', jamNoReq: 'Noch keine Wünsche', jamKick: 'Gast entfernen', jamFor: 'gültig noch', jamErr: 'Die Jam konnte nicht gestartet werden' });

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
let cnPanel = null, cnView = 'devices', cnHelpOpen = false, cnBtnEl = null;
function cnShut() { if (cnPanel) { cnPanel.remove(); cnPanel = null; } cnView = 'devices'; document.removeEventListener('keydown', cnEsc, true); }
const cnEsc = e => { if (e.key === 'Escape' && cnPanel) { e.stopPropagation(); if (cnView !== 'devices') { cnView = 'devices'; cnPaintPanel(); } else cnShut(); } };
function cnOpen(btn, view) {
  if (cnPanel && !view) return cnShut();
  if (!cnPanel) {
    cnBtnEl = btn || cnBtnEl; cnPanel = h('div', { class: 'cn-panel', role: 'dialog', 'aria-label': t('cnConnectTo'), onclick: e => e.stopPropagation() }); (typeof getUI === 'function' ? getUI() : document.body).append(cnPanel); cnPanel.style.zIndex = 9650;
    document.addEventListener('keydown', cnEsc, true);
    setTimeout(() => { const off = e => { if (cnPanel && !cnPanel.contains(e.target) && !(cnBtnEl && cnBtnEl.contains(e.target))) { cnShut(); document.removeEventListener('pointerdown', off, true); } }; document.addEventListener('pointerdown', off, true); }, 0);
  }
  cnView = view || 'devices'; cnPaintPanel(); if (typeof spScan === 'function' && spNative() && Date.now() - (SP.last || 0) > 120000 && !SP.scanning) spScan(true, false);
}
const cnKindName = k => t({ phone: 'cnKindPhone', tablet: 'cnKindTablet', desktop: 'cnKindDesktop', tv: 'cnKindTv', speaker: 'cnKindSpeaker' }[k] || 'cnKindWeb');
const cnIcon = k => ic({ phone: 'dphone', tablet: 'dphone', desktop: 'ddesktop', tv: 'dtv', speaker: 'dspeaker' }[k] || 'dweb');
const cnEq = () => h('span', { class: 'cn-eq' }, h('i'), h('i'), h('i'), h('i'));
function cnPaintPanel() { if (!cnPanel) return; const y = cnPanel.querySelector('.cn-scroll'); const top = y ? y.scrollTop : 0; cnPanel.replaceChildren(...(cnView === 'jam' ? cnJamView() : cnDevicesView())); const y2 = cnPanel.querySelector('.cn-scroll'); if (y2) y2.scrollTop = top; }
function cnHead(title, back) { return h('div', { class: 'cn-head' }, back ? h('button', { class: 'cn-hb', 'aria-label': t('cnBack'), onclick: () => { cnView = 'devices'; cnPaintPanel(); } }, ic('left')) : null, h('b', {}, title), h('button', { class: 'cn-hb', 'aria-label': t('close'), onclick: cnShut }, ic('close'))); }

function cnDevicesView() {
  const remDev = P.remote ? CN.devices.find(x => x.id === P.remote) : null, me = cur(), hereOn = !P.remote && !!me && !dpPaused();
  const others = cnOthers().filter(d => !remDev || d.id !== remDev.id);
  /* the device that plays now (or this one) */
  const curDev = remDev || { id: CN.id, name: CN.name, kind: CN.kind, self: true, state: null };
  const sub = remDev ? (remDev.state && remDev.state.item ? remDev.state.item.name + ' · ' + remDev.state.item.artist : cnKindName(remDev.kind)) : (hereOn ? me.Name + ' · ' + artistText(me) : cnIdle());
  const vol = h('input', { type: 'range', min: 0, max: 1, step: .01, class: 'cn-vol', 'aria-label': 'Volume', value: P.audio.muted ? 0 : P.audio.volume, oninput: e => { P.audio.muted = false; P.audio.volume = +e.target.value; e.target.style.setProperty('--v', (+e.target.value * 100) + '%'); } }); vol.style.setProperty('--v', (P.audio.muted ? 0 : P.audio.volume) * 100 + '%');
  const card = h('div', { class: 'cn-cur' }, h('span', { class: 'cn-cic' }, cnIcon(curDev.kind)), h('div', { class: 'cn-ctx' }, h('small', {}, t('cnCurrent')), h('b', { class: 'ell' }, curDev.self ? curDev.name : curDev.name), h('span', { class: 'ell' }, sub)), (remDev ? (remDev.state && remDev.state.playing) : hereOn) ? cnEq() : null, h('div', { class: 'cn-cvol' }, ic('vol', 'ic-s'), vol));
  const row = (d, fn) => { const s = d.state, it = s && s.item && s.item.name ? s.item : null, pl = !!(s && s.playing && it); return h('button', { class: 'cn-row' + (pl ? ' on' : ''), onclick: fn }, h('span', { class: 'cn-ic' }, cnIcon(d.kind)), h('span', { class: 'cn-tx' }, h('b', { class: 'ell' }, d.name), h('span', { class: 'ell' }, pl ? it.name + ' · ' + it.artist : (it ? t('cnPaused') + ' · ' + it.name : cnKindName(d.kind) + (d.kind === 'speaker' ? ' · WLAN' : '')))), pl ? cnEq() : null); };
  const list = [];
  if (remDev) list.push(h('button', { class: 'cn-row', onclick: () => cnPullFrom(remDev) }, h('span', { class: 'cn-ic' }, cnIcon(CN.kind)), h('span', { class: 'cn-tx' }, h('b', { class: 'ell' }, t('cnThisNow') + ' · ' + CN.name), h('span', { class: 'ell' }, t('cnPlayHere')))));
  others.forEach(d => list.push(row(d, () => { const pl = !!(d.state && d.state.playing && d.state.item); if (remDev) cnMove(remDev, d); else if (pl) cnPullFrom(d); else cnTransferTo(d); })));
  const nat = window.CinemaNative, canSpk = typeof spNative === 'function' && spNative();
  /* jam entry, like Spotify's */
  const j = CN.jam;
  const jamRow = feat('connect') ? h('button', { class: 'cn-jamcard' + (j ? ' live' : ''), onclick: () => { cnView = 'jam'; cnPaintPanel(); } }, h('span', { class: 'cn-jic' }, ic('users')), h('span', { class: 'cn-tx' }, h('b', {}, j ? t('jamLive') : t('jamStart')), h('span', { class: 'ell' }, j ? (j.guests || []).length + ' ' + t('jamGuests') : t('jamStartD'))), j ? h('i', { class: 'cn-dot' }) : ic('right')) : null;
  const outRow = (cnCanSink() && !(nat && nat.audioOutput)) ? h('button', { class: 'cn-act', onclick: cnPickSink }, h('span', { class: 'cn-ic s' }, ic('dspeaker')), h('span', {}, h('b', {}, t('cnOutPick')), h('i', {}, (() => { try { return localStorage.getItem('cx-dev-sinkname') || t('cnOutDef'); } catch (e) { return t('cnOutDef'); } })()))) : (nat && nat.audioOutput ? h('button', { class: 'cn-act', onclick: () => { try { nat.audioOutput(); } catch (e) { } } }, h('span', { class: 'cn-ic s' }, ic('dspeaker')), h('span', {}, h('b', {}, t('cnBt')), h('i', {}, t('cnOut')))) : null);
  return [cnHead(t('cnConnectTo')), h('div', { class: 'cn-scroll' }, card,
    list.length ? h('div', { class: 'cn-sect' }, t('cnOthers')) : null, list.length ? h('div', { class: 'cn-list' }, list) : (canSpk ? null : h('div', { class: 'cn-empty' }, t('cnNone'))),
    jamRow, outRow, cnHelp(canSpk))];
}
/* "Cannot see your device?": what to check, what the search did, and typing an address by hand */
function cnHelp(canSpk) {
  const open = cnHelpOpen; const d = typeof SP !== 'undefined' ? SP.diag : null;
  const body = open ? h('div', { class: 'cn-helpbody' },
    h('p', {}, canSpk ? t('cnHelpSpk') : t('cnHelpWeb')),
    canSpk ? h('div', {}, h('button', { class: 'cn-btn2', disabled: !!SP.scanning, onclick: () => spScan(false, true) }, SP.scanning ? t('cnSearching') : t('cnSearchDeep')),
      d ? h('p', { class: 'cn-diag' }, t('cnDiag') + ': ' + d.replies + ' ' + t('cnDiagTxt') + (d.deep ? ', ' + d.probed + ' ' + t('cnDiagProbed') : '') + ', ' + SP.list.length + ' ' + t('cnFound') + (d.error ? ' (' + d.error + ')' : '')) : null,
      h('ul', { class: 'cn-tips' }, h('li', {}, t('cnHelpFw')), h('li', {}, t('cnHelpIso')), h('li', {}, t('cnHelpSonos'))),
      h('div', { class: 'cn-addhost' }, h('label', {}, t('cnAddHost')), h('div', { class: 'cn-addrow' }, h('input', { type: 'text', id: 'cn-host', placeholder: t('cnAddHostPh'), inputmode: 'url', autocomplete: 'off', maxlength: 80, onkeydown: e => { if (e.key === 'Enter') e.target.nextSibling.click(); } }), h('button', { class: 'cn-btn2', onclick: e => { const v = (e.currentTarget.previousSibling.value || '').trim(); if (!spHostOk(v)) { toast(t('cnBadHost')); return; } const l = spManual(); if (!l.includes(v)) l.push(v); spSetManual(l); spScan(false, false); } }, t('cnAdd'))),
        spManual().length ? h('div', { class: 'cn-hosts' }, spManual().map(x => h('span', { class: 'cn-host' }, x, h('button', { 'aria-label': t('cnRemove'), onclick: () => { spSetManual(spManual().filter(y => y !== x)); cnPaintPanel(); } }, ic('close', 'ic-s'))))) : null)) : null,
    h('label', { class: 'cn-name' }, h('span', {}, t('cnYourName')), h('input', { type: 'text', value: CN.name, maxlength: 48, onchange: e => { const v = e.target.value.trim().slice(0, 48) || CN.def; CN.name = v; try { localStorage.setItem('cx-dev-name', v === CN.def ? '' : v); } catch (er) { } cnPost('hello', { id: CN.id, name: CN.name, kind: CN.kind }).catch(() => { }); } }))) : null;
  return h('div', { class: 'cn-helpbox' }, h('button', { class: 'cn-helpbtn' + (open ? ' open' : ''), onclick: () => { cnHelpOpen = !cnHelpOpen; cnPaintPanel(); } }, h('span', {}, t('cnHelp')), ic('down', 'ic-s')), body);
}
const cnIdle = () => t('cnIdle');

/* ---------- Jam: guests with a link put songs in the queue ---------- */
const jamLink = () => (ApiClient.serverAddress() || location.origin).replace(/\/+$/, '') + '/Cinema/jam/' + CN.jam.code;
async function jamLoad() {
  if (!CN.on) return; try { const r = await ApiClient.getJSON(ApiClient.getUrl('Cinema/jam/mine')); const was = !!CN.jam; CN.jam = r && r.code ? r : null; if (was !== !!CN.jam || cnPanel) cnDraw(); } catch (e) { }
}
async function jamStart() {
  try { CN.jam = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/jam/start', { device: CN.id }), dataType: 'json' }); cnDraw(); } catch (e) { toast(t('jamErr')); }
}
const jamPost = (path, q) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/jam/' + path, q || {}), dataType: 'json' }).then(r => { if (r && r.code) CN.jam = r; return r; }).catch(() => { });
const jamHue = n => { let x = 0; for (const c of String(n)) x = (x * 31 + c.charCodeAt(0)) % 360; return x; };
const jamAvatar = (name, cls) => h('span', { class: 'jam-av ' + (cls || ''), style: 'background:hsl(' + jamHue(name) + ',52%,42%)', title: name }, (String(name).trim()[0] || '?').toUpperCase());
function cnJamView() {
  const j = CN.jam;
  if (!j) return [cnHead(t('jamTitle'), true), h('div', { class: 'cn-scroll jam-intro' }, h('div', { class: 'jam-hero' }, ic('users')), h('h3', {}, t('jamIntro')), h('p', {}, t('jamIntroD')),
    h('ul', { class: 'jam-points' }, [t('jamPoint1'), t('jamPoint2'), t('jamPoint3')].map(x => h('li', {}, ic('check-mark', 'ic-s'), x))), h('button', { class: 'jam-go', onclick: jamStart }, t('jamStartBtn')))];
  const url = jamLink(), qr = typeof qrSvg === 'function' ? qrSvg(url, 176) : null, left = Math.max(0, Math.round((j.expires - Date.now()) / 60000));
  const pend = (j.requests || []).filter(r => r.status === 'pending'), guests = j.guests || [];
  const reqs = (j.requests || []).slice(0, 10).map(r => h('div', { class: 'jam-req' }, jamAvatar(r.by), h('span', { class: 'jam-rt' }, h('b', { class: 'ell' }, r.name), h('i', { class: 'ell' }, r.artist + ' · ' + r.by)),
    r.status === 'pending' ? h('span', { class: 'jam-dec' }, h('button', { class: 'jam-ok', 'aria-label': 'OK', onclick: () => jamPost('decide', { id: r.id, ok: true }).then(cnDraw) }, ic('check-mark', 'ic-s')), h('button', { class: 'jam-no', 'aria-label': 'No', onclick: () => jamPost('decide', { id: r.id, ok: false }).then(cnDraw) }, ic('close', 'ic-s'))) : h('em', { class: 'jam-st ' + r.status }, r.status === 'queued' ? ic('check-mark', 'ic-s') : ic('close', 'ic-s'))));
  const guestChip = g => h('button', { class: 'jam-guest', title: t('jamKick') + ': ' + g.name, onclick: () => { if (confirm(t('jamKick') + ': ' + g.name + '?')) jamPost('kick', { id: g.id }).then(jamLoad); } }, jamAvatar(g.name), h('span', { class: 'ell' }, g.name));
  return [cnHead(t('jamTitle'), true), h('div', { class: 'cn-scroll' },
    h('div', { class: 'jam-live' }, h('i', { class: 'cn-dot' }), h('b', {}, t('jamLiveNow')), h('span', {}, (left >= 60 ? Math.floor(left / 60) + ' h ' + (left % 60) + ' min' : left + ' min') + ' ' + t('jamLeft')), h('button', { class: 'jam-plus', onclick: () => jamPost('settings', { extend: 240 }).then(cnDraw) }, '+4 h')),
    h('div', { class: 'jam-card' }, qr ? h('div', { class: 'jam-qr' }, qr) : null, h('div', { class: 'jam-qt' }, h('b', {}, t('jamInvite')), h('span', {}, t('jamScan')),
      h('div', { class: 'jam-btns' }, h('button', { class: 'jam-b', onclick: async e => { const bt = e.currentTarget; try { await navigator.clipboard.writeText(url); } catch (er) { const i = cnPanel.querySelector('.jam-url'); i.select(); document.execCommand('copy'); } toast(t('jamCopied')); } }, ic('copy', 'ic-s'), t('jamCopy')), navigator.share ? h('button', { class: 'jam-b', onclick: () => navigator.share({ title: 'Jam', url }).catch(() => { }) }, ic('share', 'ic-s'), t('jamShare')) : null))),
    h('input', { class: 'jam-url', type: 'text', readonly: true, value: url, onfocus: e => e.target.select() }),
    h('div', { class: 'cn-sect' }, t('jamPeople') + ' · ' + (guests.length + 1)),
    h('div', { class: 'jam-guests' }, h('span', { class: 'jam-guest me' }, jamAvatar(CN.name, 'host'), h('span', { class: 'ell' }, t('jamYou'))), guests.map(guestChip), guests.length ? null : h('span', { class: 'jam-none' }, t('jamAlone'))),
    h('div', { class: 'cn-sect' }, t('jamReq') + (pend.length ? ' · ' + pend.length : '')), h('div', { class: 'jam-reqs' }, reqs.length ? reqs : h('div', { class: 'cn-empty sm' }, t('jamNoReq2'))),
    h('div', { class: 'cn-sect' }, t('jamOpts')),
    h('label', { class: 'cn-swrow' }, h('span', {}, t('jamApprove')), h('span', { class: 'cn-sw' }, h('input', { type: 'checkbox', checked: !!j.approve, onchange: e => jamPost('settings', { approve: e.target.checked }).then(cnDraw) }), h('i'))),
    h('label', { class: 'cn-swrow' }, h('span', {}, t('jamMax')), h('select', { class: 'jam-sel', onchange: e => jamPost('settings', { guests: +e.target.value }).then(cnDraw) }, [5, 10, 20, 50].map(n => h('option', { value: n, selected: (j.maxGuests || 20) === n }, String(n))))),
    h('button', { class: 'jam-end', onclick: () => { if (confirm(t('jamSure'))) jamPost('stop').then(() => { CN.jam = null; cnView = 'devices'; cnDraw(); }); } }, t('jamEnd')))];
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
