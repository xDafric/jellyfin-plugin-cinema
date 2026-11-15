/* ---------- routing + persistent top bar (integrates native Jellyfin pages and plugin pages) ---------- */
const FULL = /^(dashboard|configuration|plugins?|users?|useredit|usernew|userprofiles|userlibraryaccess|userparentalcontrol|userpassword|library|librarydisplay|metadataimages|metadatanfo|metadata|encodingsettings|streamingsettings|serveractivity|devices?|networking|scheduledtasks?|logs?|apikeys|notificationsettings?|branding|livetvsettings|dlnasettings|dlnaprofiles?|quickconnect|wizard\w*|video|login|selectserver|addserver|forgotpassword|nowplaying|edititemmetadata|queue|lyrics|transcodingsettings|reports|activity|mediaplayback\w*|playbackconfiguration|displaysettings|repositories|catalog)$/i;
const TABS = { favorites: [1, ''], watchlist: [2, ''], discover: [3, 'recommendations'], requests: [4, 'requests'], calendar: [5, 'calendar'], bookmarks: [6, 'bookmarks'] };
function tabHref(name) {
  let [idx, je] = TABS[name];
  if (je) { const b = document.getElementById('je-native-tab-btn-' + je); if (b && b.dataset.index) idx = b.dataset.index; }
  return '#/home?tab=' + idx + (je ? '&jeTab=' + je : '');
}
function navKey(r, kind) {
  const p0 = (r.parts[0] || 'home').replace(/\.html$/, ''), v = r.parts[1];
  if (kind === 'overlay') return p0 === 'home' ? 'home' : ({ movies: 'movies', shows: 'shows', list: 'favorites', music: 'music', discover: 'discover', calendar: 'calendar', watchlist: 'watchlist', person: '', requests: 'requests', settings: '' }[v] || '');
  if (p0 === 'home') {
    const tab = r.q.get('tab'); if (tab === '1') return 'favorites'; if (tab === '2') return 'watchlist';
    const b = $$('.headerTabs .emby-tab-button').find(x => x.dataset.index === tab); const m = b && /je-native-tab-btn-(\w+)/.exec(b.id || '');
    return m ? ({ recommendations: 'discover', requests: 'requests', calendar: 'calendar', bookmarks: 'bookmarks' }[m[1]] || '') : '';
  }
  if (p0 === 'livetv') return 'live'; if (p0 === 'games') return 'games';
  return '';
}
function setActive(key) { $$('#cx-top [data-k], .cx-tabs [data-k]').forEach(a => a.classList.toggle('on', a.dataset.k === key && key !== '')); C.activeKey = key; }

async function route() {
  const authed = window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId();
  const H = document.documentElement;
  if (!authed) { root.style.display = 'none'; ['cx-on', 'cx-frame', 'cx-full'].forEach(c => H.classList.remove(c)); if (C.top) C.top.style.display = 'none'; if (C.tabs) C.tabs.style.display = 'none'; return; }
  refreshBrand();
  $$('.sr-modal').forEach(m => m.parentElement && m.parentElement.remove());
  const r = parse(); const p0 = (r.parts[0] || 'home').replace(/\.html$/, '');
  if (p0 === 'details' && !C.allowNative && r.q.get('id')) {
    COVER.show();
    try { const it = await getItem(r.q.get('id')); const hh = itemHash(it); if (hh) { location.replace(hh); return; } } catch (e) { }
  }
  if (p0 === 'video') { C.allowNative = false; COVER.hide(); }
  const tab = r.q.get('tab');
  const overlay = (p0 === 'home' && (!tab || tab === '0')) || p0 === 'c';
  const full = !overlay && FULL.test(p0);
  const frame = !overlay && !full;
  const isMusic = overlay && r.parts[1] === 'music';
  if (overlay) C.allowNative = false;
  H.classList.toggle('cx-on', overlay); H.classList.toggle('cx-frame', frame); H.classList.toggle('cx-full', full);
  root.style.display = overlay ? 'block' : 'none';
  if (!C.top) buildTop();
  const showTop = (overlay && !isMusic) || frame;
  C.top.style.display = showTop ? 'flex' : 'none'; C.tabs.style.display = showTop ? '' : 'none';
  C.tabs.classList.toggle('hide', !showTop);
  if (!showTop) C.top.classList.remove('solid');
  setActive(showTop ? navKey(r, overlay ? 'overlay' : 'frame') : '');
  if (!overlay) { if (C.updateNPill) C.updateNPill(); if (p0 !== 'details') COVER.hide(); return; }
  root.classList.toggle('mode-nf', !isMusic); document.title = BRAND + (isMusic ? ' · ' + t('music') : '');
  const mode = isMusic ? 'sp' : 'nf';
  if (C.mode !== mode) { C.mode = mode; $('#cx-nf', root) && ($('#cx-nf', root).style.display = isMusic ? 'none' : 'block'); $('#cx-sp', root) && ($('#cx-sp', root).style.display = isMusic ? 'grid' : 'none'); }
  try { isMusic ? await C.renderMusic(r) : await renderNF(r); } catch (e) { console.error('[cinema]', e); }
  if (C.updateNPill) C.updateNPill();
}

const skinOn = () => { try { return localStorage.getItem('cx-pskin') !== '0'; } catch (e) { return true; } };
const setSkin = on => { try { localStorage.setItem('cx-pskin', on ? '1' : '0'); } catch (e) { } document.documentElement.classList.toggle('cx-pskin', on); };
const skinLabel = () => t('pskin') + ': ' + (skinOn() ? t('on') : t('off'));

function getUI() { let u = document.getElementById('cx-ui'); if (!u) { u = h('div', { id: 'cx-ui' }); document.body.append(u); } return u; }

/* ---------- persistent top bar ---------- */
function buildTop() {
  const uiRoot = getUI();
  const L_ = (k, label, href, cls) => h('a', { 'data-k': k, href: typeof href === 'function' ? '#' : href, class: cls || '', onclick: typeof href === 'function' ? (e => { e.preventDefault(); go(href()); }) : null }, label);
  const links = h('div', { class: 'nf-links' },
    L_('home', t('home'), '#/home'), L_('movies', t('movies'), '#/c/movies'), L_('shows', t('shows'), '#/c/shows'),
    L_('watchlist', 'Watchlist', '#/c/watchlist'), L_('discover', t('discover'), '#/c/discover'),
    L_('requests', t('requests'), '#/c/requests', 'opt'), L_('calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'opt'), L_('music', t('music'), '#/c/music'));
  const more = h('div', { class: 'nf-menu-wrap nf-more' });
  const mkPop = items_ => h('div', { class: 'nf-pop hide' }, items_.map(([k, label, href, cls, ico]) => h('a', { 'data-cx': 1, 'data-k': k, class: cls || '', href: typeof href === 'function' ? '#' : href, onclick: e => { if (typeof href === 'function') { e.preventDefault(); go(href()); } } }, ico ? ic(ico, 'ic-s') : null, label)));
  const moreItems = [['requests', t('requests'), '#/c/requests', 'm-opt', 'plus'], ['calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'm-opt', 'cal'], ['favorites', t('mylist'), '#/c/list', '', 'list'], ['bookmarks', t('bookmarks'), () => tabHref('bookmarks'), '', 'star'], ['live', 'Live TV', '#/livetv', '', 'tv'], ['games', 'Games', '#/games', '', 'film']];
  const popMore = mkPop(moreItems); const popMore2 = mkPop(moreItems.map(x => x.slice())); popMore2.classList.add('up'); uiRoot.append(popMore2);
  more.append(h('button', { class: 'nf-pillbtn', onclick: e => { e.stopPropagation(); closePops(popMore); popMore.classList.toggle('hide'); } }, t('more'), ic('down', 'ic-s')), popMore);
  const sInput = h('input', { type: 'text', placeholder: t('search') + '…', autocomplete: 'off' });
  const sWrap = h('div', { class: 'nf-search' }, h('button', { 'aria-label': t('search'), onclick: () => { sWrap.classList.toggle('open'); if (sWrap.classList.contains('open')) sInput.focus(); } }, ic('search')), sInput);
  let sT; sInput.addEventListener('input', () => { clearTimeout(sT); sT = setTimeout(() => { const v = sInput.value.trim(); if (v) go('#/c/search/' + encodeURIComponent(v)); else if (/search/.test(location.hash)) go('#/home'); }, 350); });
  sInput.addEventListener('blur', () => { if (!sInput.value) sWrap.classList.remove('open'); });
  const av = h('div', { class: 'nf-avatar' }, 'U');
  const popUser = mkPop([['settings', t('settings') + ' (Cinema)', '#/c/settings', '', 'edit'], ['prefs', t('prefs'), '#/mypreferencesmenu', '', 'user'], ['dash', t('dash'), '#/dashboard', '', 'info']]);
  const skinBtn = h('button', { 'data-cx': 1, onclick: e => { e.stopPropagation(); setSkin(!skinOn()); skinBtn.textContent = skinLabel(); } }, skinLabel());
  popUser.append(skinBtn);
  popUser.append(h('button', { 'data-cx': 1, onclick: () => { try { ApiClient.logout().then(() => location.reload()); } catch (e) { location.href = '#/login'; } } }, t('logout')));
  const menu = h('div', { class: 'nf-menu-wrap' }, h('button', { 'aria-label': 'Account', onclick: e => { e.stopPropagation(); closePops(popUser); popUser.classList.toggle('hide'); } }, av), popUser);
  function closePops(except) { $$('.nf-pop').forEach(p => { if (p !== except) p.classList.add('hide'); }); }
  document.addEventListener('click', () => closePops());
  const top = h('div', { id: 'cx-top', class: 'nf-nav' }, h('a', { class: 'nf-logo', href: '#/home' }, BRAND.toUpperCase()), links, more, h('div', { class: 'nf-spacer' }), sWrap, menu);
  const tabs = h('div', { class: 'cx-tabs hide' },
    ...[['home', '#/home', 'home', t('home')], ['movies', '#/c/movies', 'film', t('movies')], ['shows', '#/c/shows', 'tv', t('shows')], ['music', '#/c/music', 'note', t('music')]].map(([k, href, i, label]) => h('a', { href, 'data-k': k }, ic(i), label)),
    h('a', { 'data-k': 'discover', href: '#/c/discover' }, ic('star'), t('discover')),
    h('button', { onclick: e => { e.stopPropagation(); closePops(popMore2); popMore2.classList.toggle('hide'); } }, ic('more'), t('more')));
  uiRoot.append(top, tabs);
  C.top = top; C.tabs = tabs; C.sInput = sInput;
  ApiClient.getCurrentUser().then(u => { av.textContent = (u.Name || 'U')[0].toUpperCase(); }).catch(() => { });
  window.addEventListener('scroll', e => { const tg = e.target; const st = tg === document || tg === window ? (document.scrollingElement || document.documentElement).scrollTop : tg.scrollTop; if (tg === document || tg === window || (tg.id === 'cx-nf')) top.classList.toggle('solid', st > 40); }, { capture: true, passive: true });
}

function buildNF() {
  const nf = h('div', { id: 'cx-nf' }); const main = h('div', { id: 'nf-main' });
  nf.append(main);
  C.nf = { el: nf, main, sInput: C.sInput };
  root.append(nf);
}
