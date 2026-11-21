/* ---------- detail page extras: media info, ratings, Seerr similar ---------- */
const fmtSize = b => { b = +b || 0; return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(0) + ' MB'; };
const fmtRate = b => b ? (b / 1e6).toFixed(1) + ' Mbps' : '';
Object.assign(LU, { clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/>', video: '<path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z"/><path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"/>', msg: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/>' });
Object.assign(LUMAP, { clock: 'clock', video: 'video', msg: 'msg' });
Object.assign(TX.en, { miActivity: 'Activity', miLast: 'Last watched', miNever: 'Not watched yet', miPlays: 'Times watched', miRating: 'My rating', miResume: 'Resume at', miAdded: 'Added', miRes: 'Resolution', miCodec: 'Codec', miProfile: 'Profile', miHdr: 'Range', miFps: 'Frame rate', miDepth: 'Bit depth', miRuntime: 'Length', miDefault: 'default', miForced: 'forced', miSize: 'Size', miContainer: 'Container', miPath: 'File', miFav: 'Favourite', miWl: 'On your watchlist', miTracks: 'tracks', miNoSubs: 'None', miTrack: 'Track' });
Object.assign(TX.de, { miActivity: 'Aktivität', miLast: 'Zuletzt gesehen', miNever: 'Noch nicht gesehen', miPlays: 'Mal gesehen', miRating: 'Meine Bewertung', miResume: 'Weiter bei', miAdded: 'Hinzugefügt', miRes: 'Auflösung', miCodec: 'Codec', miProfile: 'Profil', miHdr: 'Bildbereich', miFps: 'Bildrate', miDepth: 'Bittiefe', miRuntime: 'Länge', miDefault: 'Standard', miForced: 'erzwungen', miSize: 'Grösse', miContainer: 'Container', miPath: 'Datei', miFav: 'Favorit', miWl: 'Auf deiner Watchlist', miTracks: 'Spuren', miNoSubs: 'Keine', miTrack: 'Spur' });
const miLang = c => { if (!c || c === 'und') return ''; try { const n = new Intl.DisplayNames([L === 'de' ? 'de' : 'en'], { type: 'language' }).of(c); if (n && n !== c) return n.charAt(0).toUpperCase() + n.slice(1); } catch (e) { } return String(c).toUpperCase(); };
const miRes = v => { const w = v.Width || 0, hh = v.Height || 0; const name = w >= 3200 || hh >= 2000 ? '4K' : w >= 2400 || hh >= 1300 ? '1440p' : w >= 1800 || hh >= 1000 ? '1080p' : w >= 1200 || hh >= 700 ? '720p' : hh ? hh + 'p' : ''; return { name, dim: w && hh ? w + ' × ' + hh : '' }; };
const miDate = d => { const dt = new Date(d); return isNaN(dt) ? '' : dt.toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };
const miClock = ticks => { const s = Math.floor((ticks || 0) / 1e7); const hh = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60; return (hh ? hh + ':' + String(m).padStart(2, '0') : m) + ':' + String(sec).padStart(2, '0'); };
function miCard(icon, title, rows, extra) {
  const dl = h('dl', { class: 'mi-dl' }); rows.filter(r => r && r[1] !== '' && r[1] != null).forEach(r => dl.append(h('dt', {}, r[0]), h('dd', { class: r[2] || '', title: r[3] || '' }, r[1])));
  return h('div', { class: 'mi-card' }, h('h4', {}, ic(icon, 'ic-s'), title), dl, extra || null);
}
function mediaInfoSection(it, admin) {
  const srcs = it.MediaSources || []; const u = ud(it);
  const grid = h('div', { class: 'mi-grid' });
  /* what you did with it */
  const last = u.LastPlayedDate ? h('span', { class: 'mi-when' }, miDate(u.LastPlayedDate), h('small', {}, rxAgo(u.LastPlayedDate))) : '';
  const rating = u.Rating != null && u.Rating > 0 ? h('span', { class: 'mi-stars' }, '★ ' + (Math.round(u.Rating * 10) / 10).toString().replace(/\.0$/, '') + ' / 10') : '';
  const prog = (u.PlaybackPositionTicks || 0) > 0 && it.RunTimeTicks ? miClock(u.PlaybackPositionTicks) + ' (' + Math.round(u.PlaybackPositionTicks / it.RunTimeTicks * 100) + ' %)' : '';
  const flags = h('div', { class: 'mi-pills' }, u.IsFavorite ? h('i', { class: 'on' }, t('miFav')) : null, isWatch(it) ? h('i', { class: 'on' }, t('miWl')) : null);
  grid.append(miCard('clock', t('miActivity'), [[t('miLast'), last || t('miNever'), last ? '' : 'mi-dim'], [t('miPlays'), u.PlayCount ? String(u.PlayCount) : ''], [t('miResume'), prog], [t('miRating'), rating], [t('miAdded'), it.DateCreated ? miDate(it.DateCreated) : '']], flags.children.length ? flags : null));
  srcs.slice(0, 3).forEach((ms, idx) => {
    const st = ms.MediaStreams || []; const v = st.find(s => s.Type === 'Video'); const a = st.filter(s => s.Type === 'Audio'); const sub = st.filter(s => s.Type === 'Subtitle');
    const sfx = srcs.length > 1 ? ' ' + (idx + 1) : '';
    grid.append(miCard('film', t('miFile') + sfx, [[t('miContainer'), (ms.Container || '').toUpperCase()], [t('miSize'), fmtSize(ms.Size)], [t('miBitrate'), fmtRate(ms.Bitrate)], [t('miRuntime'), ms.RunTimeTicks ? fmtMin(ms.RunTimeTicks) : ''], admin && ms.Path ? [t('miPath'), ms.Path.split(/[\\/]/).pop(), 'mi-path', ms.Path] : null]));
    if (v) { const r = miRes(v); grid.append(miCard('video', t('miVideo') + sfx, [[t('miRes'), (r.name ? r.name + ' · ' : '') + r.dim], [t('miCodec'), (v.Codec || '').toUpperCase()], [t('miProfile'), v.Profile], [t('miHdr'), v.VideoRangeType && v.VideoRangeType !== 'SDR' ? v.VideoRangeType : 'SDR'], [t('miFps'), v.RealFrameRate ? Math.round(v.RealFrameRate * 10) / 10 + ' fps' : ''], [t('miDepth'), v.BitDepth ? v.BitDepth + '-bit' : ''], [t('miBitrate'), fmtRate(v.BitRate)]])); }
    if (a.length) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, ic('vol', 'ic-s'), t('plAudio') + ' · ' + a.length), h('div', { class: 'mi-list' }, a.map((x, ai) => h('div', { class: 'mi-track' }, h('b', {}, miLang(x.Language) || (t('miTrack') + ' ' + (ai + 1))), h('span', {}, [(x.Codec || '').toUpperCase(), x.ChannelLayout || (x.Channels ? x.Channels + ' ch' : ''), x.BitRate ? fmtRate(x.BitRate) : ''].filter(Boolean).join(' · ')), x.IsDefault ? h('i', {}, t('miDefault')) : null)))));
    if (sub.length) { const seen = new Map(); sub.forEach(x => { const k = (miLang(x.Language) || x.DisplayTitle || '–') + (x.IsForced ? ' (' + t('miForced') + ')' : '') + (x.IsHearingImpaired ? ' SDH' : ''); if (!seen.has(k)) seen.set(k, x); }); grid.append(h('div', { class: 'mi-card' }, h('h4', {}, ic('msg', 'ic-s'), t('plSubs') + ' · ' + sub.length), h('div', { class: 'mi-pills' }, [...seen.keys()].map(k => h('i', {}, k))))); }
  });
  if (grid.children.length < 2 && !srcs.length) return null;
  return h('section', { class: 'nf-sect' }, h('h2', {}, t('miTitle')), grid);
}
async function ratingsRow(it, container) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !hasSeerr()) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  const info = $('.nf-dinfo .nf-meta', container); if (!info) return;
  const row = h('div', { class: 'rt-row rt-ph' }, h('span', { class: 'rt-chip sk' }), h('span', { class: 'rt-chip sk' })); info.after(row); // the space is reserved right away
  try {
    const r = await seerrGet('/' + mt + '/' + tm + '/ratingscombined'); const chips = [];
    const rt = r.rt; const im = r.imdb;
    if (rt && (rt.criticsScore != null)) chips.push(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null));
    if (im && im.criticsScore != null) chips.push(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore), im.criticsScoreCount ? h('small', {}, (im.criticsScoreCount / 1000).toFixed(0) + 'k') : null));
    if (!chips.length) { row.remove(); return; }
    row.replaceChildren(...chips); row.classList.remove('rt-ph'); row.classList.add('rt-in');
  } catch (e) { row.remove(); }
}
async function seerrSimilarRow(it, body) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !(await waitSeerr())) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  try {
    const [lm, rm, a, b] = await Promise.all([libMap(), reqMap(), seerrGet('/' + mt + '/' + tm + '/recommendations', { page: 1 }).catch(() => ({})), seerrGet('/' + mt + '/' + tm + '/similar', { page: 1 }).catch(() => ({}))]);
    const seen = new Set(); const list = [].concat(a.results || [], b.results || []).filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).map(x => Object.assign(x, { mediaType: mt })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (!list.length) return;
    const sec = h('section', { class: 'nf-sect', style: 'margin-left:calc(-1 * var(--pad));margin-right:calc(-1 * var(--pad))' }); sec.append(row(t('similarNew'), list, 'poster', { make: x => dCard(x, lm, rm) })); body.append(sec);
  } catch (e) { }
}

/* ---------- harvest entries other plugins add to Jellyfin's own menus ---------- */
const HARV = { at: 0, items: [], busy: null };
const SKIP_TXT = /^(profil|profile|einstellungen|settings|abmelden|sign out|log out|logout|dashboard|startseite|home|movies|filme|serien|tv shows|music|musik|playlists|collections|live tv|fernsehprogramm|favoriten|favorites|digitaler rekorder|übersicht|games)$/i;
function harvestDrawer() {
  const out = [];
  $$('.mainDrawer a.navMenuOption, .mainDrawer .navMenuOption, .mainDrawer .MuiListItemButton-root').forEach(el => {
    const label = (el.textContent || '').trim().replace(/\s+/g, ' '); if (!label || SKIP_TXT.test(label)) return;
    const href = el.getAttribute('href'); if (href && /#\/(home|movies|tv|music|playlists|boxsets|livetv|dashboard|list|search)/.test(href)) return;
    const icon = (el.querySelector('.navMenuOptionIcon, .material-icons, .MuiListItemIcon-root') || {}).textContent;
    out.push({ label, href: href && href !== '#' && href.startsWith('#/') ? href : null, icon: icon && icon.length < 40 ? icon.trim() : '', el });
  });
  return out;
}
async function harvestUserMenu() {
  const btn = $('.headerUserButton'); if (!btn) return [];
  const html = document.documentElement; html.classList.add('cx-harvest');
  try {
    btn.click(); let tries = 0, paper = null;
    while (tries++ < 20 && !(paper = $('.MuiMenu-paper, .MuiPopover-paper'))) await new Promise(r => setTimeout(r, 50));
    const out = [];
    if (paper) $$('li, a.MuiMenuItem-root, .MuiMenuItem-root', paper).forEach(el => {
      const label = (el.textContent || '').trim().replace(/\s+/g, ' '); if (!label || SKIP_TXT.test(label) || out.some(o => o.label === label)) return;
      const a = el.matches('a') ? el : el.querySelector('a'); const href = a && a.getAttribute('href');
      const icon = (el.querySelector('.material-icons, .material-symbols-rounded') || {}).textContent;
      out.push({ label, href: href && href.startsWith('#/') ? href : null, icon: icon && icon.length < 40 ? icon.trim() : '' });
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); const bd = $('.MuiBackdrop-root'); if (bd) bd.click();
    return out;
  } catch (e) { return []; } finally { setTimeout(() => html.classList.remove('cx-harvest'), 400); }
}
async function clickNativeMenu(label) {
  const btn = $('.headerUserButton'); if (!btn) return; document.documentElement.classList.add('cx-harvest'); btn.click();
  let tries = 0, el = null; while (tries++ < 20 && !(el = $$('.MuiMenu-paper li, .MuiMenu-paper .MuiMenuItem-root').find(x => (x.textContent || '').trim().replace(/\s+/g, ' ') === label))) await new Promise(r => setTimeout(r, 50));
  if (el) el.click(); setTimeout(() => document.documentElement.classList.remove('cx-harvest'), 400);
}
async function harvestMenus() {
  if (HARV.busy) return HARV.busy;
  HARV.busy = (async () => {
    const drawer = harvestDrawer(); const user = [];
    const items_ = []; const seen = new Set();
    user.forEach(u => { if (!seen.has(u.label)) { seen.add(u.label); items_.push(Object.assign({ via: 'user' }, u)); } });
    drawer.forEach(d => { if (!seen.has(d.label)) { seen.add(d.label); items_.push(Object.assign({ via: 'drawer' }, d)); } });
    HARV.items = items_; HARV.at = Date.now(); HARV.busy = null; return items_;
  })();
  return HARV.busy;
}
