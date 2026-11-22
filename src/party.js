/* ---------- Watch Party: friends with a link watch the same film in sync (host side) ----------
   The host plays in the Cinema player. Everything the host does (play, pause, seek) goes to the server, guests follow.
   If the host allows it, guests can pause and seek too, and the host follows them. Guests need no account: the link is the key.
   Switch off for the whole server in the plugin settings (Watch Party). */
Object.assign(LU, { 'cx-popcorn': '<path d="M5 9l1.4 11a1 1 0 0 0 1 .9h9.2a1 1 0 0 0 1-.9L19 9"/><path d="M9 9v12"/><path d="M15 9v12"/><path d="M5.5 9a2.5 2.5 0 0 1 1.2-4.6a3 3 0 0 1 5.3-1a3 3 0 0 1 5.3 1a2.5 2.5 0 0 1 1.2 4.6"/>' });
Object.assign(LUMAP, { popcorn: 'cx-popcorn' });
Object.assign(TX.en, { wpTitle: 'Watch Party', wpStart: 'Watch Party', wpStartD: 'Friends join with a link, no account needed, and watch in sync', wpIntro: 'Watch together', wpIntroD: 'Friends open a link, no account needed. Play, pause and skipping stay in sync, and everyone can chat and send reactions.', wpPoint1: 'Only this one film is shared', wpPoint2: 'Decide who may pause and skip', wpPoint3: 'Ends by itself after a few hours', wpBtn: 'Start Watch Party', wpFirst: 'Start a film or an episode first, then open this again.', wpLive: 'Live', wpInvite: 'Invite friends', wpPeople: 'Watching', wpControl: 'Guests may pause and skip', wpEnd: 'End Watch Party', wpSure: 'End the Watch Party for everyone?', wpChat: 'Chat', wpSay: 'Message …', wpJoined: 'joined', wpNow: 'Now', wpFormat: 'Guests watch the original file in their browser. Some formats (for example HEVC or DTS audio) may not play for them.', wpErr: 'The Watch Party could not be started', wpOn: 'Watch Party is on' });
Object.assign(TX.de, { wpTitle: 'Watch Party', wpStart: 'Watch Party', wpStartD: 'Freunde treten per Link bei, ganz ohne Konto, und schauen synchron', wpIntro: 'Gemeinsam schauen', wpIntroD: 'Freunde öffnen einen Link, ganz ohne Konto. Abspielen, Pause und Spulen bleiben im Gleichklang, und alle können chatten und Reaktionen senden.', wpPoint1: 'Nur dieser eine Film wird geteilt', wpPoint2: 'Du bestimmst, wer pausieren und spulen darf', wpPoint3: 'Endet nach ein paar Stunden von selbst', wpBtn: 'Watch Party starten', wpFirst: 'Starte zuerst einen Film oder eine Folge und öffne das dann noch einmal.', wpLive: 'Live', wpInvite: 'Freunde einladen', wpPeople: 'Schauen mit', wpControl: 'Gäste dürfen pausieren und spulen', wpEnd: 'Watch Party beenden', wpSure: 'Die Watch Party für alle beenden?', wpChat: 'Chat', wpSay: 'Nachricht …', wpJoined: 'ist beigetreten', wpNow: 'Jetzt', wpFormat: 'Gäste sehen die Originaldatei im Browser. Manche Formate (zum Beispiel HEVC oder DTS-Ton) spielen bei ihnen eventuell nicht.', wpErr: 'Die Watch Party konnte nicht gestartet werden', wpOn: 'Watch Party läuft' });

const WP = { on: false, code: '', secret: '', rev: 0, ev: 0, you: null, members: [], control: false, item: null, expires: 0, quiet: 0, beat: null, run: 0, log: [], vid: null, ended: false };
const wpBase = () => (ApiClient.serverAddress() || location.origin).replace(/\/+$/, '') + '/Cinema/party/';
const wpLink = () => wpBase() + WP.code;
const wpPost = (path, q) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/party/' + path, q || {}), dataType: 'json' });
const wpGuestPost = (path) => fetch(wpBase() + WP.code + path + '&g=' + encodeURIComponent(WP.secret), { method: 'POST' }).catch(() => { });
const wpSleep = ms => new Promise(r => setTimeout(r, ms));
const wpQuiet = () => { WP.quiet = Date.now() + 900; };

function wpSet(r) {
  if (!r || !r.code) { WP.on = false; WP.code = ''; clearInterval(WP.beat); WP.beat = null; wpBadge(); return; }
  WP.on = true; WP.code = r.code; WP.secret = r.secret || WP.secret; WP.control = !!r.control; WP.members = r.members || WP.members; WP.item = r.item || WP.item; WP.expires = r.expires || WP.expires;
  if (!WP.run) wpLoop(); wpBadge();
}
async function wpLoad() {
  if (!feat('watchParty') || typeof ApiClient === 'undefined' || !ApiClient.accessToken || !ApiClient.accessToken()) return;
  try { const r = await ApiClient.getJSON(ApiClient.getUrl('Cinema/party/mine')); wpSet(r && r.code ? r : null); } catch (e) { }
}
async function wpStart() {
  if (!PL.open || !PL.item || !PL.v) { toast(t('wpFirst')); return; }
  try { const r = await wpPost('start', { item: PL.item.Id, pos: PL.v.currentTime || 0, control: false }); WP.ev = 0; WP.rev = 0; WP.log = []; wpSet(r); wpHook(); if (PL.v && !PL.v.paused) wpSend('play'); cnPaintPanel(); } catch (e) { toast(t('wpErr')); }
}
const wpEnd = () => wpPost('stop').then(() => { wpSet(null); cnView = 'devices'; cnPaintPanel(); }).catch(() => { });
const wpSettings = q => wpPost('settings', q).then(r => { wpSet(r); cnPaintPanel(); }).catch(() => { });

/* the player: tell the server what the host does, follow what allowed guests do */
function wpSend(cmd) { if (!WP.on || !PL.v) return; wpGuestPost('/ctl?cmd=' + cmd + '&pos=' + (PL.v.currentTime || 0).toFixed(2)); }
function wpHook() {
  const v = PL.v; if (!WP.on || !v || WP.vid === v) return; WP.vid = v;
  v.addEventListener('play', () => { if (Date.now() > WP.quiet) wpSend('play'); });
  v.addEventListener('pause', () => { if (Date.now() > WP.quiet && !v.ended) wpSend('pause'); });
  v.addEventListener('seeked', () => { if (Date.now() > WP.quiet) wpSend('seek'); });
  clearInterval(WP.beat); WP.beat = setInterval(() => { if (WP.on && PL.v === v && !v.paused && !v.seeking) wpSend('beat'); }, 4000);
}
/* the player opened another film or episode: the party follows */
function wpOnOpen() {
  if (!WP.on) return; WP.vid = null;
  const go = async () => { if (!PL.v || !PL.item) return; try { const r = await wpPost('start', { item: PL.item.Id, pos: 0, control: WP.control }); wpSet(r); } catch (e) { } wpHook(); wpBadge(); };
  go();
}
function wpApply(s) {
  const v = PL.v; if (!v || !PL.open) return; wpQuiet();
  const want = s.pos, d = Math.abs((v.currentTime || 0) - want);
  if (d > 0.8) { try { v.currentTime = want; } catch (e) { } }
  if (s.playing && v.paused) v.play().catch(() => { });
  if (!s.playing && !v.paused) v.pause();
}
async function wpLoop() {
  if (WP.run) return; WP.run = 1;
  while (WP.on) {
    try {
      const r = await fetch(wpBase() + WP.code + '/sync?rev=' + WP.rev + '&ev=' + WP.ev + '&g=' + encodeURIComponent(WP.secret));
      if (r.status === 404 || r.status === 401) { wpSet(null); cnPaintPanel(); break; }
      if (!r.ok) { await wpSleep(2500); continue; }
      const s = await r.json(); WP.rev = s.rev; WP.you = s.you; WP.members = s.members; WP.control = s.control; WP.item = s.item;
      (s.msgs || []).forEach(m => { if (m.n <= WP.ev) return; WP.ev = m.n; WP.log.push(m); if (WP.log.length > 80) WP.log.shift(); wpIncoming(m); });
      if (s.by && s.by !== s.you.id) wpApply(s);
      wpBadge(); if (cnPanel && cnView === 'party') wpRefresh();
    } catch (e) { await wpSleep(2500); }
  }
  WP.run = 0;
}

/* reactions fly across the player, chat lines show for a few seconds */
function wpIncoming(m) {
  const host = PL.el; if (!host) return;
  if (m.kind === 'react') { const f = h('div', { class: 'wp-fl' }, m.text, h('small', {}, m.who)); f.style.left = (6 + Math.random() * 30) + '%'; host.append(f); setTimeout(() => f.remove(), 2800); return; }
  let st = host.querySelector(':scope > .wp-chat'); if (!st) { st = h('div', { class: 'wp-chat' }); host.append(st); }
  const line = m.kind === 'join' ? h('div', { class: 'wp-l sys' }, m.who + ' ' + t('wpJoined')) : h('div', { class: 'wp-l' }, h('b', {}, m.who), ' ' + m.text);
  st.append(line); while (st.children.length > 4) st.firstChild.remove(); setTimeout(() => line.remove(), 7000);
}
function wpBadge() {
  document.querySelectorAll('.pl-party').forEach(b => { b.classList.toggle('on', WP.on); const n = WP.on ? Math.max(0, WP.members.length - 1) : 0; b.setAttribute('data-n', n ? String(n) : ''); });
}
const wpButton = () => feat('watchParty') ? h('button', { class: 'pl-party' + (WP.on ? ' on' : ''), 'aria-label': t('wpTitle'), onclick: e => { e.stopPropagation(); cnStart(); cnOpen(e.currentTarget, 'party'); } }, ic('popcorn')) : null;

/* ---------- the panel (inside the device menu) ---------- */
function wpRefresh() { const box = cnPanel && cnPanel.querySelector('.wp-members'); if (!box) { cnPaintPanel(); return; } wpFillMembers(box); wpFillLog(); }
const wpFillMembers = box => box.replaceChildren(...WP.members.map(m => h('span', { class: 'jam-guest me' }, jamAvatar(m.name, m.host ? 'host' : ''), h('span', { class: 'ell' }, m.name))));
function wpFillLog() {
  const lg = cnPanel && cnPanel.querySelector('.wp-log'); if (!lg) return; const stick = lg.scrollTop + lg.clientHeight >= lg.scrollHeight - 40;
  lg.replaceChildren(...WP.log.filter(m => m.kind !== 'react').map(m => m.kind === 'join' ? h('div', { class: 'wp-sys' }, m.who + ' ' + t('wpJoined')) : h('div', { class: 'wp-msg' }, jamAvatar(m.who), h('span', {}, h('b', {}, m.who), h('i', {}, m.text)))));
  if (stick) lg.scrollTop = lg.scrollHeight;
}
function wpView() {
  if (!WP.on) {
    const can = PL.open && PL.item;
    return [cnHead(t('wpTitle'), true), h('div', { class: 'cn-scroll jam-intro' }, h('div', { class: 'jam-hero' }, ic('popcorn')), h('h3', {}, t('wpIntro')), h('p', {}, t('wpIntroD')),
      h('ul', { class: 'jam-points' }, [t('wpPoint1'), t('wpPoint2'), t('wpPoint3')].map(x => h('li', {}, ic('check-mark', 'ic-s'), x))),
      can ? h('button', { class: 'jam-go', onclick: wpStart }, t('wpBtn')) : h('p', { class: 'wp-first' }, t('wpFirst')))];
  }
  const url = wpLink(), qr = typeof qrSvg === 'function' ? qrSvg(url, 280) : null, left = Math.max(0, Math.round((WP.expires - Date.now()) / 60000));
  const it = WP.item || {}, nm = (it.series ? it.series + ' · ' : '') + (it.name || '');
  const emojis = ['❤️', '😂', '😮', '👏', '🔥', '😢', '👍', '🍿'];
  const send = () => { const i = cnPanel.querySelector('.wp-in'); const v = i.value.trim(); if (!v) return; i.value = ''; wpGuestPost('/say?text=' + encodeURIComponent(v)); };
  const view = [cnHead(t('wpTitle'), true), h('div', { class: 'cn-scroll' },
    h('div', { class: 'jam-live' }, h('i', { class: 'cn-dot' }), h('b', {}, t('wpLive')), h('span', { class: 'ell' }, nm + ' · ' + (left >= 60 ? Math.floor(left / 60) + ' h ' + (left % 60) + ' min' : left + ' min') + ' ' + t('jamLeft')), h('button', { class: 'jam-plus', onclick: () => wpSettings({ extend: 360 }) }, '+6 h')),
    h('div', { class: 'jam-card' }, qr ? h('div', { class: 'jam-qr' }, qr) : null, h('div', { class: 'jam-qt' }, h('b', {}, t('wpInvite')), h('span', {}, t('jamScan')),
      h('div', { class: 'jam-btns' }, h('button', { class: 'jam-b', onclick: async () => { try { await navigator.clipboard.writeText(url); } catch (er) { const i = cnPanel.querySelector('.jam-url'); i.select(); document.execCommand('copy'); } toast(t('jamCopied')); } }, ic('copy', 'ic-s'), t('jamCopy')), navigator.share ? h('button', { class: 'jam-b', onclick: () => navigator.share({ title: t('wpTitle'), url }).catch(() => { }) }, ic('share', 'ic-s'), t('jamShare')) : null))),
    h('input', { class: 'jam-url', type: 'text', readonly: true, value: url, onfocus: e => e.target.select() }),
    h('div', { class: 'cn-sect' }, t('wpPeople') + ' · ' + WP.members.length), h('div', { class: 'jam-guests wp-members' }),
    h('label', { class: 'cn-swrow' }, h('span', {}, t('wpControl')), h('span', { class: 'cn-sw' }, h('input', { type: 'checkbox', checked: !!WP.control, onchange: e => wpSettings({ control: e.target.checked }) }), h('i'))),
    h('div', { class: 'cn-sect' }, t('wpChat')), h('div', { class: 'wp-log' }),
    h('div', { class: 'wp-rx' }, emojis.map(e => h('button', { onclick: () => wpGuestPost('/say?emoji=' + encodeURIComponent(e)) }, e))),
    h('form', { class: 'wp-say', onsubmit: e => { e.preventDefault(); send(); } }, h('input', { class: 'wp-in', type: 'text', maxlength: 200, autocomplete: 'off', placeholder: t('wpSay') }), h('button', { 'aria-label': 'Send' }, ic('right'))),
    h('p', { class: 'wp-note' }, t('wpFormat')),
    h('button', { class: 'jam-end', onclick: () => { if (confirm(t('wpSure'))) wpEnd(); } }, t('wpEnd')))];
  setTimeout(() => { if (cnPanel) { const box = cnPanel.querySelector('.wp-members'); if (box) wpFillMembers(box); wpFillLog(); } }, 0);
  return view;
}
setTimeout(wpLoad, 2500);
setInterval(() => { if (WP.on && cnPanel && cnView === 'party') wpRefresh(); }, 20000);
