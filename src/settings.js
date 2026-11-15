/* ---------- configurable home sections, settings page, requests page ---------- */
const SEC = {
  continue: { label: () => t('continue'), run: () => api('Users/' + uid() + '/Items/Resume', { Limit: 20, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  nextup: { label: () => t('nextup'), run: () => api('Shows/NextUp', { userId: uid(), Limit: 20, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  newMovies: { label: () => t('newMovies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/movies' },
  newShows: { label: () => t('newShows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/shows' },
  top: { label: () => t('top'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), kind: 'thumb' },
  watchlist: { label: () => t('watchlist'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'Likes', Limit: 30 }), kind: 'poster', href: '#/c/watchlist' },
  favs: { label: () => t('favs'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 30 }), kind: 'poster', href: '#/c/list' },
  random: { label: () => t('random'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), kind: 'thumb' },
  because: { label: () => t('because'), kind: 'poster', run: async () => { const r = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 1 }); const last = r.Items[0]; if (!last) return []; SEC.because.title = t('because') + ' ' + last.Name; return api('Items/' + last.Id + '/Similar', { userId: uid(), limit: 20, Fields: F_BASE }); } },
  genres: { label: () => t('genresRandom'), multi: true },
  seerrTrending: { label: () => t('trending') + ' (Seerr)', seerr: '/discover/trending' },
  seerrMovies: { label: () => t('popMovies') + ' (Seerr)', seerr: '/discover/movies' },
  seerrRec: { label: () => t('seerrRec'), seerrRec: true },
  genre: { label: p => p.param, custom: true, run: p => items({ IncludeItemTypes: p.itype || 'Movie,Series', Genres: p.param, SortBy: 'Random', Limit: 24 }), kind: 'thumb' },
  collection: { label: p => p.title || t('collection'), custom: true, run: p => items({ ParentId: p.param, SortBy: 'PremiereDate', Limit: 40 }), kind: 'poster' },
  library: { label: p => p.title || 'Library', custom: true, run: p => items({ ParentId: p.param, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), kind: 'poster' }
};
const DEFAULT_SECTIONS = ['continue', 'nextup', 'newMovies', 'newShows', 'top', 'watchlist', 'favs', 'random', 'genres'].map(id => ({ id, on: true }));
const sectionsCfg = () => (CFG.sections && CFG.sections.length ? CFG.sections : DEFAULT_SECTIONS);

async function homeView2(page) {
  if (cfg('hero') !== false) { const hero = await heroFor('Movie,Series').catch(() => []); if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' })); } else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const list = sectionsCfg().filter(s => s.on !== false && SEC[s.id]);
  const first = list.slice(0, 7), rest = list.slice(7);
  const render = s => {
    const d = SEC[s.id];
    if (d.multi) return genreRows(rows, 'Movie', s.n || 4);
    if (d.seerr) return seerrRow(rows, s.title || d.label(s), d.seerr);
    if (d.seerrRec) return seerrRecRow(rows);
    const title = s.title || (s.id === 'because' ? null : d.label(s));
    if (s.id === 'because') { const ph = h('div', { class: 'nf-rowph' }); rows.append(ph); Promise.resolve(d.run(s)).then(l => { const arr = (l && l.Items) || l || []; if (arr.length) ph.replaceWith(row(d.title || t('because'), arr, d.kind)); else ph.remove(); }).catch(() => ph.remove()); return; }
    lazyRow(rows, title, () => d.run(s), d.kind || 'poster', d.href ? { href: d.href } : undefined);
  };
  first.forEach(render);
  if (rest.length) {
    const sentinel = h('div', { style: 'height:2px' }); rows.append(sentinel); let idx = 0;
    const next = () => { const s = rest[idx++]; if (s) { render(s); rows.append(sentinel); } if (idx >= rest.length) io.disconnect(); };
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) next(); }, { root: C.nf.el, rootMargin: '600px' });
    if (cfg('infinite') === false) rest.forEach(render); else io.observe(sentinel);
  }
}
function seerrRow(container, title, path) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  waitSeerr().then(async ok => { if (!ok) return ph.remove(); const [lm, rm, r] = await Promise.all([libMap(), reqMap(), seerrGet(path, { page: 1 })]); const arr = (r.results || []).map(x => Object.assign(x, { mediaType: x.mediaType || (path.includes('/tv') ? 'tv' : 'movie') })); if (arr.length) ph.replaceWith(row(title, arr, 'poster', { make: x => dCard(x, lm, rm), href: '#/c/discover' })); else ph.remove(); }).catch(() => ph.remove());
}
function seerrRecRow(container) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => {
    if (!(await waitSeerr())) return ph.remove();
    const r = await items({ IncludeItemTypes: 'Movie', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 5, Fields: 'ProviderIds' });
    const pick = r.Items.find(i => (i.ProviderIds || {}).Tmdb); if (!pick) return ph.remove();
    const [lm, rm, rec] = await Promise.all([libMap(), reqMap(), seerrGet('/movie/' + pick.ProviderIds.Tmdb + '/recommendations', { page: 1 })]);
    const arr = (rec.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (arr.length) ph.replaceWith(row(t('seerrRec') + ' ' + pick.Name, arr, 'poster', { make: x => dCard(x, lm, rm) })); else ph.remove();
  })().catch(() => ph.remove());
}

/* ---------- settings page ---------- */
async function settingsView(page) {
  const wrap = h('div', { class: 'nf-page-pad', style: 'max-width:980px' }, h('h1', {}, t('settings'))); page.append(wrap);
  const card_ = (title, ...kids) => h('section', { class: 'set-card' }, h('h3', {}, title), kids);
  const toggle = (label, key, hint) => { const on = cfg(key) !== false && !!cfg(key) || (cfg(key) === true); const b = h('button', { class: 'set-switch' + (cfg(key) ? ' on' : ''), role: 'switch', onclick: () => { const v = !cfg(key); saveCfg({ [key]: v }); b.classList.toggle('on', v); } }, h('i')); return h('div', { class: 'set-row' }, h('div', {}, h('b', {}, label), hint ? h('span', {}, hint) : null), b); };
  wrap.append(card_(t('general'),
    toggle(t('setHero'), 'hero', t('setHeroHint')), toggle(t('setPeek'), 'peek', t('setPeekHint')), toggle(t('setInfinite'), 'infinite', t('setInfiniteHint')),
    toggle(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint')), toggle(t('setNative'), 'nativePlayer', t('setNativeHint'))));
  const acc = h('input', { type: 'color', value: cfg('accent') || '#e50914', onchange: e => saveCfg({ accent: e.target.value }) });
  wrap.append(card_(t('appearance'), h('div', { class: 'set-row' }, h('div', {}, h('b', {}, t('accent')), h('span', {}, t('accentHint'))), acc)));
  /* home sections editor */
  const list = h('div', { class: 'set-list' });
  let secs = sectionsCfg().map(s => Object.assign({}, s));
  const persist = () => { saveCfg({ sections: secs }); };
  const names = s => SEC[s.id] ? (SEC[s.id].custom ? SEC[s.id].label(s) + ' · ' + t('custom') : SEC[s.id].label(s)) : s.id;
  function draw() {
    list.replaceChildren(...secs.map((s, i) => h('div', { class: 'set-sec' + (s.on === false ? ' off' : '') },
      h('b', {}, names(s)),
      h('div', { class: 'set-sec-a' },
        h('button', { 'aria-label': 'Up', onclick: () => { if (i) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; persist(); draw(); } } }, ic('down', 'rot180')),
        h('button', { 'aria-label': 'Down', onclick: () => { if (i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; persist(); draw(); } } }, ic('down')),
        h('button', { class: 'set-switch' + (s.on === false ? '' : ' on'), onclick: () => { s.on = s.on === false; persist(); draw(); } }, h('i')),
        SEC[s.id] && SEC[s.id].custom ? h('button', { 'aria-label': 'Remove', onclick: () => { secs.splice(i, 1); persist(); draw(); } }, ic('close')) : null))));
  }
  draw();
  const typeSel = h('select', {}, [['genre', t('secGenre')], ['collection', t('collection')], ['library', t('secLibrary')], ['because', t('because')], ['seerrTrending', 'Seerr: ' + t('trending')], ['seerrMovies', 'Seerr: ' + t('popMovies')], ['seerrRec', t('seerrRec')]].filter(([k]) => !secs.some(s => s.id === k && !SEC[k].custom)).map(([k, l]) => h('option', { value: k }, l)));
  const valSel = h('select', {});
  async function fillVals() {
    valSel.replaceChildren(); valSel.style.display = '';
    const k = typeSel.value;
    if (k === 'genre') { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); g.Items.forEach(x => valSel.append(h('option', { value: x.Name }, x.Name))); }
    else if (k === 'collection') { const g = await items({ IncludeItemTypes: 'BoxSet', SortBy: 'SortName', Limit: 200 }); g.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
    else if (k === 'library') { const v = await api('Users/' + uid() + '/Views'); v.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
    else valSel.style.display = 'none';
  }
  typeSel.addEventListener('change', fillVals); fillVals();
  const addBtn = h('button', { class: 'btn white', style: 'height:40px', onclick: () => { const k = typeSel.value; const o = valSel.selectedOptions[0]; const s = SEC[k].custom ? { id: k, on: true, param: valSel.value, title: o && o.dataset.t } : { id: k, on: true }; secs.push(s); persist(); draw(); } }, ic('plus'), t('add'));
  const resetBtn = h('button', { class: 'btn grey', style: 'height:40px', onclick: () => { secs = DEFAULT_SECTIONS.map(s => Object.assign({}, s)); persist(); draw(); } }, t('reset'));
  wrap.append(card_(t('homeSections'), h('p', { class: 'set-hint' }, t('homeSectionsHint')), list, h('div', { class: 'set-add' }, typeSel, valSel, addBtn, resetBtn)));
}

/* ---------- requests page (Seerr) with download progress ---------- */
const reqInfoCache = {};
async function reqMeta(md) { const k = md.mediaType + ':' + md.tmdbId; if (!reqInfoCache[k]) reqInfoCache[k] = seerrGet('/' + (md.mediaType === 'tv' ? 'tv' : 'movie') + '/' + md.tmdbId).catch(() => ({})); return reqInfoCache[k]; }
function dlPct(md) { const ds = (md.downloadStatus || []).concat(md.downloadStatus4k || []); if (!ds.length) return null; const size = ds.reduce((a, d) => a + (d.size || 0), 0), left = ds.reduce((a, d) => a + (d.sizeLeft || 0), 0); return size ? Math.max(0, Math.min(100, Math.round((1 - left / size) * 100))) : null; }
async function requestsView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('requests'))); page.append(wrap);
  if (!(await waitSeerr())) { wrap.append(h('div', { class: 'nf-empty' }, 'Seerr is not available.')); return; }
  let filter = 'all'; const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const chips = h('div', { class: 'nf-seasons' }, [['all', t('all')], ['pending', t('rqPending')], ['processing', t('rqProcessing')], ['available', t('rqAvailable')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === filter ? ' on' : ''), onclick: e => { filter = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); load(); } }, l)));
  const body = h('div', { class: 'nf-grid req-grid' }); wrap.append(chips, body); queueSection(wrap);
  async function load() {
    body.replaceChildren(h('div', { class: 'spinner', style: 'grid-column:1/-1' }));
    let r; try { r = await seerrGet('/request', { take: 60, skip: 0, filter, sort: 'added' }); } catch (e) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'grid-column:1/-1' }, t('noRes'))); return; }
    const res = r.results || []; if (!res.length) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'grid-column:1/-1' }, t('empty'))); return; }
    body.replaceChildren(); const lm = await libMap();
    res.forEach(async q => {
      const md = q.media || {}; const slot = h('div', { class: 'nf-card poster req' }); body.append(slot);
      const meta = await reqMeta(md); const title = meta.title || meta.name || '#' + md.tmdbId; const src = TM(meta.posterPath, 'w500');
      const pct_ = dlPct(md); let label, cls;
      if (q.status === 3) { label = t('rqDeclined'); cls = 'bad'; } else if (q.status === 1) { label = t('rqWaiting'); cls = 'wait'; } else if (md.status === 5) { label = t('inLib'); cls = 'own'; } else if (md.status === 4) { label = t('rqPartial'); cls = 'own'; } else if (pct_ != null) { label = t('rqDownloading') + ' ' + pct_ + '%'; cls = 'dl'; } else { label = t('rqApproved'); cls = 'wait'; }
      const lib = lm[(md.mediaType) + ':' + md.tmdbId];
      const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title), h('span', { class: 'dmark ' + cls }, label));
      if (pct_ != null && md.status !== 5) im.append(h('div', { class: 'prog' }, h('i', { style: 'width:' + pct_ + '%' })));
      const who = (q.requestedBy && (q.requestedBy.displayName || q.requestedBy.jellyfinUsername || q.requestedBy.username)) || '';
      const acts = admin && q.status === 1 ? h('div', { class: 'req-acts' }, h('button', { class: 'btn white', onclick: async e => { e.stopPropagation(); try { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + q.id + '/approve') }); toast('✓'); load(); } catch (er) { toast('⚠'); } } }, t('approve')), h('button', { class: 'btn grey', onclick: async e => { e.stopPropagation(); try { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + q.id + '/decline') }); toast('✓'); load(); } catch (er) { toast('⚠'); } } }, t('decline'))) : null;
      slot.append(im, h('div', { class: 'title ell' }, title), h('div', { class: 'title ell', style: 'margin-top:2px;font-size:11.5px;opacity:.7' }, who + (q.createdAt ? ' · ' + new Date(q.createdAt).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US') : '')), acts || '');
      slot.addEventListener('click', () => { if (lib) go(itemHash(lib)); else if (md.tmdbId) { md.mediaType = md.mediaType || (meta.name ? 'tv' : 'movie'); openSeerrInfo({ id: md.tmdbId, mediaType: md.mediaType }); } });
    });
  }
  load();
}
