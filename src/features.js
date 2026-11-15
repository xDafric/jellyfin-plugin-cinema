/* ---------- shared UX: cover, peek popover, item menu, watchlist ---------- */
const COVER = (() => { let el = null; return { show() { if (!el) { el = h('div', { id: 'cx-cover' }, h('div', { class: 'spinner', style: 'margin:0' })); getUI().append(el); } el.classList.add('show'); clearTimeout(COVER.t); COVER.t = setTimeout(() => COVER.hide(), 12000); }, hide() { if (el) el.classList.remove('show'); clearTimeout(COVER.t); } }; })();

/* watchlist = Jellyfin "Likes" (same data KefinTweaks uses), optionally mirrored to the Seerr watchlist */
const isWatch = it => ud(it).Likes === true;
async function toggleWatch(it) {
  const on = !isWatch(it);
  try {
    if (on) await ApiClient.updateUserItemRating(uid(), it.Id, true); else await ApiClient.clearUserItemRating(uid(), it.Id);
    it.UserData = Object.assign(ud(it), { Likes: on ? true : null });
    toast(on ? t('wlAdded') : t('wlRemoved'));
    if (on && cfg('seerrWatchlistSync') && hasSeerr()) { const tm = (it.ProviderIds || {}).Tmdb; const mt = it.Type === 'Series' ? 'tv' : 'movie'; if (tm) try { if (usePluginSeerr()) await cpostSeerr('/watchlist', { tmdbId: +tm, mediaType: mt, title: it.Name }); else if (JE.jellyseerrAPI.addToWatchlist) await JE.jellyseerrAPI.addToWatchlist(+tm, mt); } catch (e) { console.warn('[cinema] seerr watchlist', e); } }
  } catch (e) { toast('⚠ ' + (e.message || 'error')); }
  return on;
}
async function toggleFav(it) { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData = Object.assign(ud(it), { IsFavorite: on }); return on; }
async function togglePlayed(it) { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData = Object.assign(ud(it), { Played: on }); toast(on ? t('markedWatched') : t('markedUnwatched')); return on; }

/* settings: server defaults (plugin) overridden per user (Jellyfin DisplayPreferences, synced across devices) */
const CFG_DEF = { nativePlayer: false, hero: true, peek: true, seerrWatchlistSync: false, sections: null, accent: '#e50914', infinite: true, cardSize: 'm', heroItems: 8, heroInterval: 11, peekDelay: 320 };
let CFGU = {};
const feat = k => !(C.status && C.status.features) || C.status.features[k] !== false;
const SRV = { accent: 'accent', seerrWatchlistSync: 'seerrWatchlistSync', pl_autoNext: 'pl_autoNext', pl_autoSkip: 'pl_autoSkip', pl_quality: 'pl_quality', cardSize: 'cardSize', heroItems: 'heroItems', heroInterval: 'heroInterval', peekDelay: 'peekDelay' };
function cfg(k) {
  const d = (C.status && C.status.defaults) || {}; const allow = d.allowUserOverrides !== false; const u = allow ? CFGU[k] : undefined;
  if (k === 'hero') return feat('hero') && u !== false; if (k === 'peek') return feat('peek') && u !== false; if (k === 'infinite') return feat('infiniteScroll') && u !== false;
  if (u !== undefined) return u;
  if (k === 'sections') { try { const j = d.sections && JSON.parse(d.sections); if (j && j.length) return j; } catch (e) { } return null; }
  if (SRV[k] !== undefined && d[SRV[k]] !== undefined && d[SRV[k]] !== '') return d[SRV[k]];
  return CFG_DEF[k];
}
const userSet = k => CFGU[k] !== undefined;
async function loadCfg() {
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); const raw = (dp.CustomPrefs || {}).cfg; if (raw) CFGU = JSON.parse(raw) || {}; } catch (e) { }
  applyCfg();
}
async function saveCfg(patch) {
  Object.keys(patch).forEach(k => { if (patch[k] === undefined || patch[k] === null) delete CFGU[k]; else CFGU[k] = patch[k]; }); applyCfg();
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); dp.CustomPrefs = Object.assign(dp.CustomPrefs || {}, { cfg: JSON.stringify(CFGU) }); await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }), data: JSON.stringify(dp), contentType: 'application/json' }); } catch (e) { console.warn('[cinema] save cfg failed', e); }
}
function applyCfg() { const r = document.documentElement; r.style.setProperty('--accent-nf', cfg('accent') || '#e50914'); r.style.setProperty('--cs', { s: .88, m: 1, l: 1.16 }[cfg('cardSize')] || 1); }

/* ---------- peek popover (replaces card hover) ---------- */
const PEEK = { el: null, t: 0, hideT: 0, cur: null };
function scrollHost() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
function peekEl() { if (!PEEK.el) { PEEK.el = h('div', { class: 'nf-peek', onpointerenter: () => clearTimeout(PEEK.hideT), onpointerleave: () => hidePeek(120) }); PEEK.el.addEventListener('wheel', e => { const sh = scrollHost(); if (sh) sh.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' }); hidePeek(); }, { passive: true }); getUI().append(PEEK.el); } return PEEK.el; }
function hidePeek(delay) { clearTimeout(PEEK.t); clearTimeout(PEEK.hideT); PEEK.hideT = setTimeout(() => { if (PEEK.el) PEEK.el.classList.remove('show'); PEEK.cur = null; }, delay || 0); }
function showPeek(anchor, d) {
  const el = peekEl(); const r = anchor.getBoundingClientRect();
  const W = d.poster ? Math.max(250, Math.min(340, r.width * 1.5)) : Math.max(300, Math.min(400, r.width * 1.6));
  let left = r.left + r.width / 2 - W / 2; left = Math.max(12, Math.min(innerWidth - W - 12, left));
  el.style.width = W + 'px';
  const btns = h('div', { class: 'pa' }, d.actions.map(a => a === '-' ? h('span', { class: 'sp' }) : h('button', { class: a.primary ? 'pl' : (a.on ? 'on' : ''), 'aria-label': a.label, title: a.label, onclick: async e => { e.stopPropagation(); const res = await a.fn(e); if (a.refresh) a.refresh(); } }, ic(typeof a.icon === 'function' ? a.icon() : a.icon))));
  el.replaceChildren(
    h('div', { class: 'pi', onclick: () => { hidePeek(); d.open && d.open(); } }, d.img ? h('div', Object.assign({ class: 'bgi' }, bg(d.img))) : null, h('div', { class: 'pt ell' }, d.title)),
    h('div', { class: 'pb' }, btns, h('div', { class: 'pm' }, d.meta.filter(Boolean).map((m, i) => h('span', { class: m.cls || '' }, m.t || m))), d.overview ? h('div', { class: 'po clamp2' }, d.overview) : null));
  el.classList.toggle('poster', !!d.poster);
  el.classList.toggle('poster', !!d.poster);
  el.classList.remove('show'); el.style.visibility = 'hidden'; el.style.top = '0px'; el.style.left = left + 'px';
  requestAnimationFrame(() => {
    const H = el.offsetHeight; let top = r.top + r.height / 2 - H / 2 - 24; top = Math.max(80, Math.min(innerHeight - H - 12, top));
    el.style.top = top + 'px'; el.style.visibility = ''; requestAnimationFrame(() => el.classList.add('show'));
  });
  PEEK.cur = anchor;
}
function attachPeek(el, anchor, getDesc) {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || !cfg('peek')) return;
  el.addEventListener('pointerenter', () => { clearTimeout(PEEK.hideT); clearTimeout(PEEK.t); PEEK.t = setTimeout(() => showPeek(anchor, getDesc()), PEEK.cur ? 60 : (+cfg('peekDelay') || 320)); });
  el.addEventListener('pointerleave', () => { clearTimeout(PEEK.t); hidePeek(160); });
  el.addEventListener('click', () => hidePeek());
}
window.addEventListener('scroll', () => hidePeek(), { capture: true, passive: true });

function libDesc(it, poster) {
  const isEp = it.Type === 'Episode'; const hash = itemHash(it) || '#/home';
  const wl = h('span'); const acts = [
    { icon: 'play', label: t('play'), primary: true, fn: () => { hidePeek(); it.Type === 'MusicAlbum' ? C.playAlbum(it) : playVideo(it); } },
    { icon: () => isWatch(it) ? 'check' : 'plus', label: t('watchlist'), fn: async e => { await toggleWatch(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(isWatch(it) ? 'check' : 'plus')); } },
    { icon: () => ud(it).IsFavorite ? 'heartOn' : 'heart', label: t('mylist'), fn: async e => { await toggleFav(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(ud(it).IsFavorite ? 'heartOn' : 'heart')); } },
    '-', { icon: 'more', label: t('more'), fn: e => itemMenu(e, it) }, { icon: 'down', label: t('info'), fn: () => { hidePeek(); go(hash); } }];
  return { poster: !!poster, img: poster ? (imgUrl(it, 'Primary', 600) || imgUrl(it, 'Backdrop', 700)) : (imgUrl(it, 'Backdrop', 700) || imgUrl(it, 'Thumb', 700) || imgUrl(it, 'Primary', 500)), title: isEp ? (it.SeriesName || it.Name) : it.Name, open: () => go(hash), actions: acts,
    meta: [it.CommunityRating ? { t: Math.round(it.CommunityRating * 10) + '%', cls: 'g' } : null, yearOf(it), it.OfficialRating ? { t: it.OfficialRating, cls: 'badge' } : null, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : (it.Type === 'Series' ? t('shows') : null), ...(it.Genres || []).slice(0, 2)],
    overview: isEp ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : it.Overview };
}

/* ---------- item ⋯ menu: everything Jellyfin can do with an item ---------- */
let ME = null; const me = async () => ME || (ME = await ApiClient.getCurrentUser());
async function itemMenu(e, it) {
  if (!feat('itemMenu')) return;
  e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation();
  const r = (e.currentTarget || e.target).getBoundingClientRect(); const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const canDel = admin || (user.Policy && user.Policy.EnableContentDeletion);
  const ent = [];
  ent.push({ icon: 'play', label: t('play'), fn: () => playVideo(it) });
  ent.push({ icon: isWatch(it) ? 'check' : 'plus', label: isWatch(it) ? t('wlRemove') : t('wlAdd'), fn: () => toggleWatch(it) });
  ent.push({ icon: ud(it).IsFavorite ? 'heartOn' : 'heart', label: ud(it).IsFavorite ? t('favRemove') : t('favAdd'), fn: async () => { await toggleFav(it); toast('✓'); } });
  if (it.Type !== 'Series' || true) ent.push({ icon: 'check', label: ud(it).Played ? t('markUnwatched') : t('markWatched'), fn: () => togglePlayed(it) });
  ent.push('-');
  ent.push({ icon: 'info', label: t('openDetails'), fn: () => go(itemHash(it) || '#/home') });
  if (admin) {
    ent.push('-');
    ent.push({ icon: 'edit', label: t('editMeta'), fn: () => nativeCommand(it.Id, ['edit', 'editmetadata']) });
    ent.push({ icon: 'film', label: t('editImages'), fn: () => nativeCommand(it.Id, ['editimages']) });
    ent.push({ icon: 'search', label: t('identify'), fn: () => nativeCommand(it.Id, ['identify']) });
    ent.push({ icon: 'refresh', label: t('refreshMeta'), fn: () => nativeCommand(it.Id, ['refresh']) });
    ent.push({ icon: 'info', label: t('openNative'), fn: () => nativeCommand(it.Id, null) });
    ent.push({ icon: 'more', label: t('moreActions'), fn: () => showNativeActions(it, Math.min(r.left, innerWidth - 280), r.bottom + 6) });
  }
  if (canDel) { ent.push('-'); ent.push({ icon: 'close', label: t('delete'), fn: () => nativeCommand(it.Id, ['delete']) }); }
  openMenu(Math.min(r.left, innerWidth - 260), r.bottom + 6, ent);
}
/* Jellyfin's own item actions (metadata editor, image editor, identify, collections, download, plugin entries...)
   run inside an isolated copy of the web client (iframe). The page you are on is never navigated, so nothing flickers. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DUP_ACTIONS = /^(play|resume|playfromstart|edit|editmetadata|editimages|identify|refresh|delete|markplayed|markunplayed|addtofavorites|removefromfavorites)$/i;
const lite = (() => { let el = null; return { show() { if (!el) { el = h('div', { id: 'cx-lite' }, h('div', { class: 'spinner', style: 'margin:0' })); getUI().append(el); } el.classList.add('show'); }, hide() { if (el) el.classList.remove('show'); } }; })();
const FRAME_CSS = `html.cx-iframe, html.cx-iframe body, html.cx-iframe .skinBody, html.cx-iframe .backgroundContainer { background: transparent !important; }
html.cx-iframe #reactRoot > *, html.cx-iframe .skinHeader, html.cx-iframe .page, html.cx-iframe .mainDrawer, html.cx-iframe .nowPlayingBar, html.cx-iframe .MuiAppBar-root { visibility: hidden !important; }
html.cx-iframe dialog, html.cx-iframe .dialogContainer, html.cx-iframe .dialogBackdrop, html.cx-iframe .actionSheet, html.cx-iframe .formDialog, html.cx-iframe .MuiDialog-root, html.cx-iframe .MuiPopover-root, html.cx-iframe .toast, html.cx-iframe .toastContainer { visibility: visible !important; }`;
async function openNativeFrame(id) {
  const fr = h('iframe', { class: 'cx-nframe', src: location.pathname + location.search + '#/details?id=' + id + '&nocinema', allow: 'fullscreen' }); getUI().append(fr);
  for (let i = 0; i < 160; i++) {
    await sleep(120);
    try {
      const d = fr.contentDocument; if (!d || !d.documentElement) continue;
      if (!d.getElementById('cx-style-f') && d.head) { d.documentElement.classList.add('cx-ready', 'cx-iframe', 'cx-pskin'); const st = d.createElement('style'); st.id = 'cx-style-f'; st.textContent = CSS_TEXT + FRAME_CSS; d.head.append(st); const fl = d.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'; d.head.append(fl); }
      const pg = d.querySelector('#itemDetailPage:not(.hide)'); const more = pg && pg.querySelector('.btnMoreCommands:not(.hide)');
      if (more) return { fr, d, more };
    } catch (e) { }
  }
  fr.remove(); throw new Error('timeout');
}
const sheetOf = d => d.querySelector('.actionSheet, .dialog.actionsheet');
async function harvestItemMenu(id) {
  let fr = null; const out = [];
  try {
    const f = await openNativeFrame(id); fr = f.fr; f.more.click(); let sheet = null;
    for (let i = 0; i < 40 && !(sheet && sheet.querySelectorAll('button[data-id]').length); i++) { await sleep(100); sheet = sheetOf(f.d); }
    if (sheet) sheet.querySelectorAll('button[data-id]').forEach(b => { const id_ = b.dataset.id; if (DUP_ACTIONS.test(id_)) return; const label = ((b.querySelector('.listItemBodyText, .actionSheetItemText') || b).textContent || '').trim().replace(/\s+/g, ' '); const mi = (b.querySelector('.material-icons, .actionsheetMenuItemIcon') || {}).textContent; if (label) out.push({ id: id_, label, mi: mi && mi.length < 40 ? mi.trim() : '' }); });
  } catch (e) { console.warn('[cinema] harvest item menu', e); }
  if (fr) fr.remove();
  return out;
}
async function runFrameCommand(id, cmds) {
  lite.show(); let fr = null;
  try {
    const f = await openNativeFrame(id); fr = f.fr; f.more.click(); let btn = null;
    for (let i = 0; i < 40 && !btn; i++) { await sleep(100); const sh = sheetOf(f.d); btn = sh && cmds.map(c => sh.querySelector('button[data-id="' + c + '"]')).find(Boolean); }
    if (!btn) { toast(t('cmdNA')); fr.remove(); lite.hide(); return; }
    btn.click(); fr.classList.add('show'); lite.hide();
    let seen = false, gone = 0, waited = 0;
    await new Promise(res => {
      const iv = setInterval(() => {
        let open = false; try { open = !!f.d.querySelector('dialog[open], .dialogContainer .dialog, .formDialog, .actionSheet'); } catch (e) { clearInterval(iv); return res(); }
        if (open) { seen = true; gone = 0; } else if (seen && ++gone >= 2) { clearInterval(iv); res(); }
        if (!seen && ++waited > 14) { clearInterval(iv); res(); }
      }, 350);
    });
  } catch (e) { console.warn('[cinema] native command', e); toast(t('cmdNA')); }
  if (fr) fr.remove(); lite.hide(); refreshView();
}
function refreshView() { C.libCache = null; try { resetSeerrCache(); } catch (e) { } route(); }
function nativeCommand(id, cmds) {
  hidePeek(); closeMenu();
  if (!cmds) { C.allowNative = true; location.hash = '#/details?id=' + id; return; }
  runFrameCommand(id, cmds);
}
async function showNativeActions(it, x, y) {
  lite.show(); const list = await harvestItemMenu(it.Id); lite.hide();
  if (!list.length) { toast(t('cmdNA')); return; }
  openMenu(x, y, list.map(e => ({ mi: e.mi, label: e.label, fn: () => nativeCommand(it.Id, [e.id]) })));
}
