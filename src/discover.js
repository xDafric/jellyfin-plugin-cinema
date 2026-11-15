/* ---------- Discover: Seerr recommendations rendered with the same cards as the library ---------- */
let SEERR = 'JellyfinEnhanced/jellyseerr';
const seerrGet = (path, params) => fetch(ApiClient.getUrl(SEERR + path, params), { headers: { Authorization: 'MediaBrowser Token="' + ApiClient.accessToken() + '"' } }).then(r => { if (!r.ok) throw new Error('seerr ' + r.status); return r.json(); });
const TM = (p, w) => p ? 'https://image.tmdb.org/t/p/' + w + p : '';
let libMapP = null, reqMapP = null;
const libMap = () => libMapP || (libMapP = items({ IncludeItemTypes: 'Movie,Series', Fields: 'ProviderIds', Limit: 10000, EnableImageTypes: 'Primary' }).then(r => { const m = {}; r.Items.forEach(i => { const id = (i.ProviderIds || {}).Tmdb; if (id) m[(i.Type === 'Series' ? 'tv' : 'movie') + ':' + id] = i; }); return m; }).catch(() => ({})));
const reqMap = () => reqMapP || (reqMapP = seerrGet('/request', { take: 500, skip: 0, filter: 'all' }).then(r => { const m = {}; (r.results || []).forEach(q => { const md = q.media || {}; if (md.tmdbId) m[(md.mediaType || q.type) + ':' + md.tmdbId] = md.status || (q.status === 1 ? 2 : 3); }); return m; }).catch(() => ({})));
const resetSeerrCache = () => { libMapP = null; reqMapP = null; };
const hasSeerr = () => !!((C.status && C.status.seerr) || (window.JE && JE.jellyseerrAPI));
const waitSeerr = async () => { for (let i = 0; i < 40 && !hasSeerr(); i++) await new Promise(r => setTimeout(r, 250)); return hasSeerr(); };

function dStatus(x, lm, rm) {
  const key = x.mediaType + ':' + x.id; const lib = lm[key];
  if (lib) return { k: 'own', item: lib };
  const ms = (x.mediaInfo && x.mediaInfo.status) || rm[key];
  if (ms === 5) return { k: 'own' };
  if (ms >= 2 && ms <= 4) return { k: 'req' };
  return { k: 'none' };
}
function openSeerrInfo(x) { if (usePluginSeerr()) return seerrModal(x); try { JE.jellyseerrMoreInfo.open(x.id, x.mediaType); } catch (e) { console.warn(e); } }
function openSeerrRequest(x) {
  if (usePluginSeerr()) return seerrModal(x);
  const title = x.title || x.name;
  try { x.mediaType === 'tv' ? JE.jellyseerrUI.showSeasonSelectionModal(x.id, 'tv', title, x) : JE.jellyseerrUI.showMovieRequestModal(x.id, title, x); } catch (e) { openSeerrInfo(x); }
}
function dMark(s) {
  return s.k === 'own' ? h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib')) : s.k === 'req' ? h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested')) : h('span', { class: 'dmark' }, ic('plus', 'ic-s'), t('notOwned'));
}
function dCard(x, lm, rm) {
  x.mediaType = x.mediaType === 'tv' ? 'tv' : 'movie';
  const title = x.title || x.name; const s = dStatus(x, lm, rm);
  const src = TM(x.posterPath, 'w500');
  const year = (x.releaseDate || x.firstAirDate || '').slice(0, 4);
  const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title), dMark(s));
  const open = () => { if (s.k === 'own' && s.item) go(itemHash(s.item)); else openSeerrInfo(x); };
  const el = h('div', { class: 'nf-card poster seerr ' + (s.k === 'none' ? 'notown' : s.k), onclick: open }, im, h('div', { class: 'title ell' }, title));
  attachPeek(el, im, () => ({ img: TM(x.backdropPath, 'w780') || src, title, open, overview: x.overview,
    actions: [{ icon: s.k === 'own' ? 'play' : s.k === 'req' ? 'check' : 'plus', label: s.k === 'own' ? t('play') : t('request'), primary: true, fn: () => { hidePeek(); if (s.k === 'own' && s.item) playVideo(s.item); else if (s.k === 'none') openSeerrRequest(x); else openSeerrInfo(x); } }, '-', { icon: 'info', label: t('info'), fn: () => { hidePeek(); openSeerrInfo(x); } }],
    meta: [x.voteAverage ? { t: Math.round(x.voteAverage * 10) + '%', cls: 'g' } : null, year, x.mediaType === 'tv' ? t('shows') : t('movies'), s.k === 'own' ? { t: t('inLib'), cls: 'g' } : s.k === 'req' ? t('requested') : t('notOwned')] }));
  return el;
}
function toHero(x, lm, rm) {
  x.mediaType = x.mediaType === 'tv' ? 'tv' : 'movie'; const s = dStatus(x, lm, rm);
  return { Id: 's' + x.id, Name: x.title || x.name, Overview: x.overview, CommunityRating: x.voteAverage, ProductionYear: (x.releaseDate || x.firstAirDate || '').slice(0, 4), Type: x.mediaType === 'tv' ? 'Series' : 'Movie', Genres: [], _bd: TM(x.backdropPath, 'w1280'),
    _primary: s.k === 'own' && s.item ? { label: t('play'), icon: 'play', fn: () => playVideo(s.item) } : s.k === 'none' ? { label: t('request'), icon: 'plus', fn: () => openSeerrRequest(x) } : { label: t('requested'), icon: 'check', fn: () => openSeerrInfo(x) },
    _secondary: { label: t('info'), icon: 'info', fn: () => openSeerrInfo(x) } };
}
async function discoverView(page) {
  if (!(await waitSeerr())) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Jellyfin Enhanced / Seerr is not available.'))); return; }
  const [lm, rm, trend] = await Promise.all([libMap(), reqMap(), seerrGet('/discover/trending', { page: 1 }).catch(() => null)]);
  if (!trend) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Seerr is not reachable.'))); return; }
  const hero = trend.results.filter(x => x.backdropPath && x.overview && (x.mediaType === 'movie' || x.mediaType === 'tv')).slice(0, 8).map(x => toHero(x, lm, rm));
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const make = x => dCard(x, lm, rm);
  const add = (title, path) => lazyRow(rows, title, () => seerrGet(path, { page: 1 }).then(r => (r.results || []).filter(x => !x.mediaType || x.mediaType === 'movie' || x.mediaType === 'tv').map(x => Object.assign(x, { mediaType: x.mediaType || (path.includes('/tv') ? 'tv' : 'movie') }))), 'poster', { make });
  add(t('trending'), '/discover/trending'); add(t('popMovies'), '/discover/movies'); add(t('popShows'), '/discover/tv'); add(t('upMovies'), '/discover/movies/upcoming'); add(t('upShows'), '/discover/tv/upcoming');
}
/* Seerr results shown under library search results */
async function seerrSearchRow(container, q) {
  if (!(await waitSeerr())) return;
  try {
    const [lm, rm, r] = await Promise.all([libMap(), reqMap(), seerrGet('/search', { query: q, page: 1 })]);
    const list = (r.results || []).filter(x => (x.mediaType === 'movie' || x.mediaType === 'tv') && dStatus(x, lm, rm).k !== 'own');
    if (!list.length) return;
    container.append(h('h2', { style: 'margin:40px 0 16px;font-size:22px' }, t('notInLib')), h('div', { class: 'nf-grid' }, list.slice(0, 18).map(x => dCard(x, lm, rm))));
  } catch (e) { }
}
