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
      if (arr.length < pageSize || (r.TotalRecordCount != null && start >= r.TotalRecordCount)) done = true;
    } catch (e) { done = true; console.warn('[cinema] page failed', e); }
    busy = false;
    if (!done && sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 500) more();
  }
  if (cfg('infinite') === false) { pageSize = 400; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) more(); }, { root: C.nf.el, rootMargin: '700px' });
  io.observe(sentinel); more();
  return { grid, reload() { grid.replaceChildren(); start = 0; done = false; more(); } };
}

async function watchlistView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('watchlist'))); page.append(wrap);
  let type = 'Movie,Series';
  const chips = h('div', { class: 'nf-seasons' }, [['Movie,Series', t('all')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === type ? ' on' : ''), onclick: e => { type = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); } }, l)));
  wrap.append(chips);
  const g = infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: type, Filters: 'Likes', SortBy: 'DateCreated', SortOrder: 'Descending', StartIndex: s, Limit: n }), i => card(i, 'poster'));
  setTimeout(() => { if (!g.grid.children.length) g.grid.after(h('div', { class: 'nf-empty' }, t('empty'))); }, 2500);
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
  if (!mv.Items.length && !sh.Items.length) body.append(h('div', { class: 'nf-empty' }, t('empty')));
}
