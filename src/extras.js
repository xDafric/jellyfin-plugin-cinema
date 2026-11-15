/* ---------- detail page extras: media info, ratings, Seerr similar ---------- */
const fmtSize = b => { b = +b || 0; return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(0) + ' MB'; };
const fmtRate = b => b ? (b / 1e6).toFixed(1) + ' Mbps' : '';
function mediaInfoSection(it, admin) {
  const srcs = it.MediaSources || []; if (!srcs.length) return null;
  const grid = h('div', { class: 'mi-grid' });
  srcs.slice(0, 3).forEach((ms, idx) => {
    const v = (ms.MediaStreams || []).find(s => s.Type === 'Video'); const a = (ms.MediaStreams || []).filter(s => s.Type === 'Audio'); const sub = (ms.MediaStreams || []).filter(s => s.Type === 'Subtitle');
    const vid = v ? [v.Width && v.Height ? v.Width + '×' + v.Height : '', (v.Codec || '').toUpperCase(), v.Profile, v.VideoRangeType && v.VideoRangeType !== 'SDR' ? v.VideoRangeType : '', v.RealFrameRate ? Math.round(v.RealFrameRate) + ' fps' : '', v.BitDepth ? v.BitDepth + '-bit' : ''].filter(Boolean).join(' · ') : '';
    const sfx = srcs.length > 1 ? ' ' + (idx + 1) : '';
    grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('miFile') + sfx), h('div', {}, (ms.Container || '').toUpperCase() + ' · ' + fmtSize(ms.Size)), h('div', {}, h('span', {}, t('miBitrate') + ': '), fmtRate(ms.Bitrate)), admin && ms.Path ? h('div', { class: 'ell', title: ms.Path, style: 'font-size:12px;color:#8d8d95' }, ms.Path) : null));
    if (vid) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('miVideo') + sfx), h('div', {}, vid)));
    if (a.length) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('plAudio') + ' (' + a.length + ')'), h('div', { class: 'mi-pills' }, a.map(x => h('i', {}, [x.Language || '?', (x.Codec || '').toUpperCase(), x.ChannelLayout || (x.Channels ? x.Channels + 'ch' : '')].filter(Boolean).join(' · '))))));
    if (sub.length) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('plSubs') + ' (' + sub.length + ')'), h('div', { class: 'mi-pills' }, [...new Map(sub.map(x => [(x.Language || '?') + (x.IsForced ? ' forced' : '') + (x.IsHearingImpaired ? ' SDH' : ''), x])).keys()].map(k => h('i', {}, k)))));
  });
  return h('section', { class: 'nf-sect' }, h('h2', {}, t('miTitle')), grid);
}
async function ratingsRow(it, container) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !hasSeerr()) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  try {
    const r = await seerrGet('/' + mt + '/' + tm + '/ratingscombined'); const chips = [];
    const rt = r.rt; const im = r.imdb;
    if (rt && (rt.criticsScore != null)) chips.push(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null));
    if (im && im.criticsScore != null) chips.push(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore), im.criticsScoreCount ? h('small', {}, (im.criticsScoreCount / 1000).toFixed(0) + 'k') : null));
    if (!chips.length) return; const row = h('div', { class: 'rt-row' }, chips); const info = $('.nf-dinfo .nf-meta', container); if (info) info.after(row);
  } catch (e) { }
}
async function seerrSimilarRow(it, body) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !(await waitSeerr())) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  try {
    const [lm, rm, a, b] = await Promise.all([libMap(), reqMap(), seerrGet('/' + mt + '/' + tm + '/recommendations', { page: 1 }).catch(() => ({})), seerrGet('/' + mt + '/' + tm + '/similar', { page: 1 }).catch(() => ({}))]);
    const seen = new Set(); const list = [].concat(a.results || [], b.results || []).filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).map(x => Object.assign(x, { mediaType: mt })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (!list.length) return;
    const sec = h('section', { class: 'nf-sect', style: 'margin-left:-4%;margin-right:-4%' }); sec.append(row(t('similarNew'), list, 'poster', { make: x => dCard(x, lm, rm) })); body.append(sec);
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
