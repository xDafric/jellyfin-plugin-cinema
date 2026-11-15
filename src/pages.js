/* ---------- extra pages: watchlist, person, infinite grids ---------- */
function infiniteGrid(container, fetchPage, makeCard, pageSize) {
  pageSize = pageSize || 60;
  const grid = h('div', { class: 'nf-grid' }); const sentinel = h('div', { style: 'height:2px' }); container.append(grid, sentinel);
  let start = 0, done = false, busy = false;
  async function more() {
    if (busy || done || !grid.isConnected) return; busy = true;
    try {
      const r = await fetchPage(start, pageSize); const arr = r.Items || r;
      arr.forEach(i => grid.append(makeCard(i))); start += arr.length;
      if (r.done !== undefined) done = !!r.done; else if (arr.length < pageSize || (r.TotalRecordCount != null && start >= r.TotalRecordCount)) done = true;
    } catch (e) { done = true; console.warn('[cinema] page failed', e); }
    busy = false;
    if (!done && sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 500) more();
  }
  if (cfg('infinite') === false) { pageSize = 400; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) more(); }, { root: C.nf.el, rootMargin: '700px' });
  io.observe(sentinel); more();
  return { grid, reload() { grid.replaceChildren(); start = 0; done = false; more(); } };
}

Object.assign(TX.en, { wlReq: 'On your Seerr watchlist · not in the library yet', wlSynced: 'Added to your watchlist' });
Object.assign(TX.de, { wlReq: 'Auf deiner Seerr-Watchlist · noch nicht in der Bibliothek', wlSynced: 'Zur Watchlist hinzugefügt' });
/* my own Seerr requests (the Seerr account is matched through the Jellyfin user id) */
async function myRequests() {
  const r = await seerrGet('/request', { take: 300, skip: 0, filter: 'all', sort: 'added' }); const me_ = String(uid()).replace(/-/g, '').toLowerCase();
  return (r.results || []).filter(q => q.media && q.media.tmdbId && String((q.requestedBy && q.requestedBy.jellyfinUserId) || '').replace(/-/g, '').toLowerCase() === me_);
}
/* a request that became available is added to the Jellyfin watchlist once (processed request ids are kept per user, so removing it again sticks) */
const WLSYNC = { busy: false };
async function syncWatchlist() {
  if (WLSYNC.busy || !feat('watchlist') || !hasSeerr()) return; WLSYNC.busy = true;
  try {
    const avail = (await myRequests()).filter(q => q.status === 2 && q.media.status === 5); const seen = new Set(CFGU.wlSeen || []);
    if (!CFGU.wlSeen) { await saveCfg({ wlSeen: avail.map(q => q.id) }); return; } // first run: only requests that finish from now on
    const todo = avail.filter(q => !seen.has(q.id)); if (!todo.length) return;
    resetSeerrCache(); const lm = await libMap(); let added = 0;
    for (const q of todo) {
      const it = lm[q.media.mediaType + ':' + q.media.tmdbId]; if (!it) continue; // not scanned into the library yet: try again later
      if (!isWatch(it)) { await ApiClient.updateUserItemRating(uid(), it.Id, true); added++; } seen.add(q.id);
    }
    if (seen.size !== (CFGU.wlSeen || []).length) await saveCfg({ wlSeen: [...seen].slice(-600) });
    if (added) { toast('✓ ' + t('wlSynced') + (added > 1 ? ' (' + added + ')' : '')); C.libCache = null; if (/watchlist/.test(location.hash)) route(); }
  } catch (e) { console.warn('[cinema] watchlist sync', e); } finally { WLSYNC.busy = false; }
}
async function watchlistView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('watchlist'))); page.append(wrap);
  let type = 'Movie,Series';
  const chips = h('div', { class: 'nf-seasons' }, [['Movie,Series', t('all')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === type ? ' on' : ''), onclick: e => { type = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); drawReq(); } }, l)));
  wrap.append(chips);
  const g = infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: type, Filters: 'Likes', SortBy: 'DateCreated', SortOrder: 'Descending', StartIndex: s, Limit: n }), i => card(i, 'poster'));
  const reqBox = h('div', { class: 'wl-req' }); wrap.append(reqBox); let sw = null;
  async function drawReq() {
    if (!hasSeerr()) return;
    try { if (!sw) { sw = []; for (let p = 1; p <= 6; p++) { const r = await seerrGet('/discover/watchlist', { page: p }); (r.results || []).forEach(x => { if (x.tmdbId && !sw.some(y => y.tmdbId === x.tmdbId && y.mediaType === x.mediaType)) sw.push({ mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', tmdbId: x.tmdbId }); }); if (p >= (r.totalPages || 1)) break; } } } catch (e) { return; }
    const lm = await libMap(), rm = await reqMap();
    const list = sw.filter(x => !lm[x.mediaType + ':' + x.tmdbId] && (type === 'Movie,Series' || (type === 'Movie') === (x.mediaType !== 'tv'))); reqBox.replaceChildren(); if (!list.length) return;
    const grid = h('div', { class: 'nf-grid' }); reqBox.append(h('h2', { class: 'nf-sect-title', style: 'margin:34px 0 14px' }, t('wlReq')), grid);
    list.forEach(async x => {
      const slot = h('div', { style: 'display:contents' }); grid.append(slot);
      try { const meta = await reqMeta({ mediaType: x.mediaType, tmdbId: x.tmdbId }); slot.append(dCard(Object.assign({}, meta, { id: x.tmdbId, mediaType: x.mediaType }), lm, rm)); } catch (e) { slot.remove(); }
    });
  }
  syncWatchlist(); drawReq();
  setTimeout(() => { if (!g.grid.children.length && !reqBox.children.length) g.grid.after(h('div', { class: 'nf-empty' }, t('empty'))); }, 3000);
}

async function personView(page, id) {
  const p = await getItem(id);
  const body = h('div', { class: 'nf-page-pad' }); page.append(body);
  const img = imgUrl(p, 'Primary', 500);
  body.append(h('div', { class: 'nf-dhead', style: 'align-items:flex-start;margin-bottom:34px' },
    h('div', Object.assign({ class: 'nf-dposter', style: 'border-radius:50%;aspect-ratio:1;width:clamp(150px,16vw,240px)' }, bg(img))),
    h('div', { class: 'nf-dinfo' }, h('h1', {}, p.Name),
      h('div', { class: 'nf-meta' }, p.PremiereDate ? h('span', {}, new Date(p.PremiereDate).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })) : null, (p.ProductionLocations || [])[0] ? h('span', {}, p.ProductionLocations[0]) : null),
      h('p', { class: 'ov clamp3', style: 'cursor:pointer', onclick: e => e.currentTarget.classList.toggle('clamp3') }, (p.Overview || '').replace(/<[^>]+>/g, '')))));
  const [mv, sh] = await Promise.all([items({ PersonIds: id, IncludeItemTypes: 'Movie', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 200 }), items({ PersonIds: id, IncludeItemTypes: 'Series', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 100 })]);
  [[t('movies'), mv.Items], [t('shows'), sh.Items]].forEach(([title, list]) => { if (list.length) body.append(h('section', { class: 'nf-sect' }, h('h2', {}, title + ' (' + list.length + ')'), h('div', { class: 'nf-grid' }, list.map(i => card(i, 'poster'))))); });
  await personNotOwned(body, p);
  if (!mv.Items.length && !sh.Items.length && !body.querySelector('.nf-sect')) body.append(h('div', { class: 'nf-empty' }, t('empty')));
}

async function personNotOwned(body, person) {
  const tm = (person.ProviderIds || {}).Tmdb; if (!tm || !(await waitSeerr())) return;
  try {
    const [lm, rm, cr] = await Promise.all([libMap(), reqMap(), seerrGet('/person/' + tm + '/combined_credits')]);
    const seen = new Set();
    const list = [].concat(cr.cast || [], cr.crew || []).filter(x => (x.mediaType === 'movie' || x.mediaType === 'tv') && x.posterPath).filter(x => { const k = x.mediaType + x.id; if (seen.has(k)) return false; seen.add(k); return true; })
      .filter(x => dStatus(x, lm, rm).k !== 'own').sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 60);
    if (!list.length) return;
    body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('notInLib') + ' (' + list.length + ')'), h('div', { class: 'nf-grid' }, list.map(x => dCard(x, lm, rm)))));
  } catch (e) { console.warn('[cinema] person credits', e); }
}

/* full page for a home row: everything that matches (genre, decade, collection, library ...) */
async function browseListView(page, kind, param) {
  const wrap = h('div', { class: 'nf-page-pad' }); page.append(wrap);
  let title = param; const base = {};
  if (kind === 'genre') base.Genres = param;
  else if (kind === 'decade') { title = t('fromDecade') + ' ' + param + 's'; base.Years = Array.from({ length: 10 }, (_, i) => +param + i).join(','); }
  else if (kind === 'collection' || kind === 'library') { base.ParentId = param; try { title = (await getItem(param)).Name; } catch (e) { } }
  else if (kind === 'top') { title = t('top'); base.MinCommunityRating = 7; }
  else if (kind === 'unwatched') { title = t('unwatched'); base.Filters = 'IsUnplayed'; }
  wrap.append(h('h1', {}, title));
  const st = { type: kind === 'collection' || kind === 'library' ? '' : 'Movie,Series', sort: kind === 'top' ? 'CommunityRating' : 'SortName', order: kind === 'top' ? 'Descending' : 'Ascending' };
  const bar = h('div', { class: 'dc-bar', style: 'margin-left:0' });
  if (st.type) bar.append(h('div', { style: 'display:flex;gap:8px' }, [['Movie,Series', t('browseAll')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.nf-chip', e.currentTarget.parentElement).forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); } }, l))));
  const sel = h('select', { onchange: e => { const [s_, o] = e.target.value.split(':'); st.sort = s_; st.order = o; g.reload(); } }, [['SortName:Ascending', t('sortName')], ['CommunityRating:Descending', t('sortRating')], ['DateCreated:Descending', t('sortAdded')], ['PremiereDate:Descending', t('sortYear')], ['Random:Ascending', t('sortRandom')]].map(([v, l]) => h('option', { value: v, selected: v.startsWith(st.sort + ':') }, l)));
  bar.append(sel); wrap.append(bar);
  const g = infiniteGrid(wrap, (s, n) => items(Object.assign({ IncludeItemTypes: st.type || 'Movie,Series,BoxSet', SortBy: st.sort, SortOrder: st.order, StartIndex: s, Limit: n }, base)), i => card(i, 'poster'));
}

async function seerrWatch(x) { try { await cpostSeerr('/watchlist', { tmdbId: +x.id, mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', title: x.title || x.name }); toast(t('wlAdded')); } catch (e) { toast('⚠ ' + ((e.responseJSON && e.responseJSON.message) || 'Seerr')); } }
