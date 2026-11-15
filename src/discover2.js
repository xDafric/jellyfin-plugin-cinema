/* ---------- Discover 2: filters, search, personalised rows, endless grid ---------- */
const DC = { genres: null };
async function dcGenres() {
  if (DC.genres) return DC.genres;
  try { const [m, t_] = await Promise.all([seerrGet('/genres/movie'), seerrGet('/genres/tv')]); DC.genres = { movie: m, tv: t_ }; } catch (e) { DC.genres = { movie: [], tv: [] }; }
  return DC.genres;
}
const SORTS = { popularity: ['popularity.desc', 'popularity.desc'], rating: ['vote_average.desc', 'vote_average.desc'], newest: ['primary_release_date.desc', 'first_air_date.desc'] };

async function discoverView2(page) {
  if (!(await waitSeerr())) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Seerr is not available.'))); return; }
  const [lm, rm] = await Promise.all([libMap(), reqMap()]);
  const make = x => dCard(x, lm, rm);
  const st = { type: 'all', genre: '', sort: 'popularity', hideOwned: false, q: '' };
  const wrap = h('div', {}); page.append(wrap);
  const hero = await seerrGet('/discover/trending', { page: 1 }).then(r => r.results.filter(x => x.backdropPath && x.overview && (x.mediaType === 'movie' || x.mediaType === 'tv')).slice(0, 8).map(x => toHero(x, lm, rm))).catch(() => []);
  const heroHolder = h('div', {}, hero.length ? heroEl(hero) : h('div', { style: 'height:90px' })); wrap.append(heroHolder);
  /* filter bar */
  const genres = await dcGenres();
  const typeChips = h('div', { style: 'display:flex;gap:8px' }, [['all', t('all')], ['movie', t('movies')], ['tv', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.nf-chip', typeChips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); fillGenres(); refresh(); } }, l)));
  const gSel = h('select', { onchange: e => { st.genre = e.target.value; refresh(); } });
  function fillGenres() { const list = st.type === 'tv' ? genres.tv : st.type === 'movie' ? genres.movie : mergeGenres(); gSel.replaceChildren(h('option', { value: '' }, t('genres')), ...list.map(g => h('option', { value: g.id }, g.name))); st.genre = ''; }
  const mergeGenres = () => { const seen = {}; return genres.movie.concat(genres.tv).filter(g => (seen[g.id] ? false : (seen[g.id] = true))); };
  fillGenres();
  const sSel = h('select', { onchange: e => { st.sort = e.target.value; refresh(); } }, [['popularity', t('sortPop')], ['rating', t('sortRating')], ['newest', t('sortNew')]].map(([v, l]) => h('option', { value: v }, l)));
  const hide = h('input', { type: 'checkbox', onchange: e => { st.hideOwned = e.target.checked; refresh(); } });
  let qT; const q = h('input', { type: 'text', placeholder: t('search') + ' (Seerr)…', oninput: e => { clearTimeout(qT); qT = setTimeout(() => { st.q = e.target.value.trim(); refresh(); }, 400); } });
  const bar = h('div', { class: 'dc-bar' }, typeChips, gSel, sSel, h('label', {}, hide, t('hideOwned')), q);
  wrap.append(bar);
  const personal = h('div', { class: 'nf-rows', style: 'margin-top:10px' }); wrap.append(personal);
  const gridHost = h('div', { class: 'nf-page-pad', style: 'padding-top:0' }); wrap.append(gridHost);
  let grid = null;
  const filtered = () => st.q || st.genre || st.sort !== 'popularity' || st.type !== 'all' || st.hideOwned;
  /* personalised rows (only when no filter is active) */
  function buildPersonal() {
    personal.replaceChildren();
    lazyRow(personal, t('trending'), () => seerrGet('/discover/trending', { page: 1 }).then(r => (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv')), 'poster', { make });
    personalRows(personal, make, lm, rm);
    lazyRow(personal, t('popMovies'), () => seerrGet('/discover/movies', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('popShows'), () => seerrGet('/discover/tv', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
    lazyRow(personal, t('upMovies'), () => seerrGet('/discover/movies/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('upShows'), () => seerrGet('/discover/tv/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
  }
  function fetcher() {
    const own = x => dStatus(x, lm, rm).k === 'own';
    let pg = 0;
    return async () => {
      const p = ++pg; let list = [], more = true;
      if (st.q) { const r = await seerrGet('/search', { query: st.q, page: p }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else if (!filtered()) { const r = await seerrGet('/discover/trending', { page: p + 1 }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else {
        const kinds = st.type === 'all' ? ['movie', 'tv'] : [st.type];
        const rs = await Promise.all(kinds.map(k => seerrGet('/discover/' + (k === 'movie' ? 'movies' : 'tv'), Object.assign({ page: p, sortBy: SORTS[st.sort][k === 'movie' ? 0 : 1] }, st.genre ? { genre: st.genre } : {})).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: k }))).catch(() => [])));
        list = rs.flat(); if (st.type === 'all') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); more = rs.some(r => r.length >= 20);
      }
      if (st.hideOwned) list = list.filter(x => !own(x));
      return { Items: list, done: !more };
    };
  }
  function refresh() {
    gridHost.replaceChildren(); personal.style.display = filtered() ? 'none' : ''; heroHolder.style.display = filtered() ? 'none' : '';
    gridHost.style.paddingTop = filtered() ? '10px' : '0'; wrap.style.paddingTop = filtered() ? '88px' : '0';
    gridHost.append(h('h2', { style: 'margin:10px 0 16px;font-size:22px' }, st.q ? t('results') + ' “' + st.q + '”' : filtered() ? t('discover') : t('moreToExplore')));
    grid = infiniteGrid(gridHost, fetcher(), make, 40);
  }
  buildPersonal(); refresh();
}
/* rows built from what you watched: Seerr recommendations + your favourite genres */
async function personalRows(container, make, lm, rm) {
  try {
    const played = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 60, Fields: 'ProviderIds,Genres' });
    const withId = played.Items.filter(i => (i.ProviderIds || {}).Tmdb);
    withId.slice(0, 2).forEach(i => {
      const mt = i.Type === 'Series' ? 'tv' : 'movie';
      lazyRow(container, t('because') + ' ' + i.Name, () => seerrGet('/' + mt + '/' + i.ProviderIds.Tmdb + '/recommendations', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: mt })).filter(x => dStatus(x, lm, rm).k !== 'own')), 'poster', { make });
    });
    const count = {}; played.Items.forEach(i => (i.Genres || []).forEach(g => { count[g] = (count[g] || 0) + 1; }));
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);
    const gl = await dcGenres();
    top.forEach(name => { const g = gl.movie.find(x => x.name === name) || gl.tv.find(x => x.name === name); if (g) lazyRow(container, t('moreOf') + ' ' + name, () => seerrGet('/discover/movies', { page: 1, genre: g.id, sortBy: 'popularity.desc' }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own')), 'poster', { make }); });
  } catch (e) { console.warn('[cinema] personal rows', e); }
}
