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
    if (added) { toast(t('wlSynced') + (added > 1 ? ' (' + added + ')' : '')); C.libCache = null; if (/watchlist/.test(location.hash)) route(); }
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

Object.assign(TX.en, { pfKnown: 'Known for', pfBorn: 'Born', pfDied: 'Died', pfAge: 'years', pfAka: 'Also known as', pfLinks: 'More', pfPop: 'Most popular', pfNew: 'Newest', pfRated: 'Best rated', pfAs: 'as', pfLib: 'In your library', pfNot: 'Not in your library', pfAll: 'All', pfMore: 'Show more', pfNoBio: 'No biography available.', pfAct: 'Acting', pfDir: 'Directing', pfWrite: 'Writing', pfProd: 'Production', pfCrew: 'Crew' });
Object.assign(TX.de, { pfKnown: 'Bekannt für', pfBorn: 'Geboren', pfDied: 'Gestorben', pfAge: 'Jahre', pfAka: 'Auch bekannt als', pfLinks: 'Mehr', pfPop: 'Beliebteste', pfNew: 'Neueste', pfRated: 'Bestbewertet', pfAs: 'als', pfLib: 'In deiner Bibliothek', pfNot: 'Nicht in deiner Bibliothek', pfAll: 'Alle', pfMore: 'Mehr anzeigen', pfNoBio: 'Keine Biografie vorhanden.', pfAct: 'Schauspiel', pfDir: 'Regie', pfWrite: 'Drehbuch', pfProd: 'Produktion', pfCrew: 'Team' });
/* the page of a person: a library person (id) or one only known from the film database (id = t + TMDB number) */
async function personView(page, id) {
  const fromDb = /^t\d+$/.test(id); const p = fromDb ? null : await getItem(id); const tm = fromDb ? +id.slice(1) : +((p.ProviderIds || {}).Tmdb) || 0;
  const body = h('div', { class: 'nf-page-pad pf-page' }); page.append(body);
  const seerr = tm && (hasSeerr() || await waitSeerr().catch(() => false));
  const info = seerr ? await seerrGet('/person/' + tm).catch(() => null) : null;
  const name = p ? p.Name : (info && info.name) || '?';
  const dep = info && info.knownForDepartment ? ({ Acting: t('pfAct'), Directing: t('pfDir'), Writing: t('pfWrite'), Production: t('pfProd') }[info.knownForDepartment] || info.knownForDepartment) : '';
  const bornD = (p && p.PremiereDate) || (info && info.birthday) || ''; const diedD = (p && p.EndDate) || (info && info.deathday) || '';
  const fmt = d => new Date(d).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const age = bornD ? Math.floor(((diedD ? new Date(diedD) : new Date()) - new Date(bornD)) / 31557600000) : 0;
  const place = (p && (p.ProductionLocations || [])[0]) || (info && info.placeOfBirth) || '';
  const bio = String((p && p.Overview) || (info && info.biography) || '').replace(/<[^>]+>/g, '').trim();
  const imgSrc = p ? imgUrl(p, 'Primary', 500) : (info && info.profilePath ? TM(info.profilePath, 'w500') : '');
  const aka = ((info && info.alsoKnownAs) || []).filter(x => /^[\x20-\x7e\u00c0-\u024f]+$/.test(x)).slice(0, 4);
  const links = h('div', { class: 'pf-links' }, tm ? h('a', { class: 'btn grey', href: 'https://www.themoviedb.org/person/' + tm, target: '_blank', rel: 'noopener' }, 'TMDB') : null, (info && info.imdbId) || (p && (p.ProviderIds || {}).Imdb) ? h('a', { class: 'btn grey', href: 'https://www.imdb.com/name/' + ((info && info.imdbId) || p.ProviderIds.Imdb), target: '_blank', rel: 'noopener' }, 'IMDb') : null);
  const facts = [dep ? [t('pfKnown'), dep] : null, bornD ? [t('pfBorn'), fmt(bornD) + (age && !diedD ? ' · ' + age + ' ' + t('pfAge') : '')] : null, diedD ? [t('pfDied'), fmt(diedD) + (age ? ' · ' + age + ' ' + t('pfAge') : '')] : null, place ? ['', place] : null, aka.length ? [t('pfAka'), aka.join(', ')] : null].filter(Boolean);
  const bioEl = h('p', { class: 'ov pf-bio clamp3', onclick: e => e.currentTarget.classList.toggle('clamp3') }, bio || t('pfNoBio'));
  body.append(h('div', { class: 'pf-head' }, h('div', Object.assign({ class: 'pf-photo' }, bg(imgSrc))),
    h('div', { class: 'pf-info' }, h('h1', {}, name),
      facts.length ? h('div', { class: 'pf-facts' }, facts.map(f => h('span', { class: 'pf-fact' }, f[0] ? h('i', {}, f[0]) : null, f[1]))) : null, bioEl,
      h('div', { class: 'pf-actions' }, (() => { try { return p ? gPersonFollow(p) : null; } catch (e) { return null; } })(), links))));
  const holder = h('div', { class: 'pf-credits' }, h('div', { class: 'spinner', style: 'margin:40px auto' })); body.append(holder);
  /* everything the person is credited in (cast), with the role; the library list comes from Jellyfin itself */
  const [lm, rm, cr, own] = await Promise.all([libMap(), reqMap(), seerr ? seerrGet('/person/' + tm + '/combined_credits').catch(() => null) : Promise.resolve(null),
    p ? Promise.all([items({ PersonIds: id, IncludeItemTypes: 'Movie', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 300, Fields: F_BASE + ',ProviderIds' }), items({ PersonIds: id, IncludeItemTypes: 'Series', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 150, Fields: F_BASE + ',ProviderIds' })]).then(r => r[0].Items.concat(r[1].Items)) : Promise.resolve([])]);
  holder.replaceChildren();
  const seen = new Set(), rows = [];
  ((cr && cr.cast) || []).forEach(x => { if ((x.mediaType !== 'movie' && x.mediaType !== 'tv') || !(x.posterPath || x.backdropPath)) return; const k = x.mediaType + ':' + x.id; if (seen.has(k)) return; seen.add(k); if ((x.genreIds || []).some(g => g === 10767 || g === 10763 || g === 10764)) return; rows.push({ k, x, role: String(x.character || '').replace(/\s*\(.*?\)\s*/g, '').trim(), pop: (x.voteCount || 0) + (x.popularity || 0) * 5, date: Date.parse(x.releaseDate || x.firstAirDate || '') || 0, rate: x.voteAverage || 0, mt: x.mediaType === 'tv' ? 'tv' : 'movie' }); });
  const items_ = rows.map(r => ({ r, it: lm[r.k] || null }));
  /* library titles Seerr does not list for this person */
  own.forEach(it => { const tmid = (it.ProviderIds || {}).Tmdb; const k = (it.Type === 'Series' ? 'tv' : 'movie') + ':' + tmid; if (tmid && seen.has(k)) return; if (items_.some(o => o.it && o.it.Id === it.Id)) return; items_.push({ r: { k: it.Id, role: '', pop: (it.CommunityRating || 0) * 10, date: Date.parse(it.PremiereDate || '') || 0, rate: it.CommunityRating || 0, mt: it.Type === 'Series' ? 'tv' : 'movie' }, it }); });
  if (!items_.length) { holder.append(h('div', { class: 'nf-empty' }, t('empty'))); return; }
  let type = 'all', sort = 'pop', shownNot = 24; const ctl = h('div', { class: 'pf-ctl' }); const lists = h('div', {});
  const withRole = (el, role) => { if (role) el.append(h('div', { class: 'pf-role ell', title: role }, t('pfAs') + ' ' + role)); return el; };
  const order = (a, b) => sort === 'new' ? b.r.date - a.r.date : sort === 'rate' ? b.r.rate - a.r.rate : b.r.pop - a.r.pop;
  const draw = () => {
    const f = items_.filter(o => type === 'all' || o.r.mt === type).sort(order); const inLib = f.filter(o => o.it), not = f.filter(o => !o.it);
    lists.replaceChildren();
    if (inLib.length) lists.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('pfLib') + ' (' + inLib.length + ')'), h('div', { class: 'nf-grid pf-grid' }, inLib.map(o => withRole(card(o.it, 'poster'), o.r.role)))));
    if (not.length) { const more = not.length > shownNot; lists.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('pfNot') + ' (' + not.length + ')'), h('div', { class: 'nf-grid pf-grid' }, not.slice(0, shownNot).map(o => withRole(dCard(Object.assign({}, o.r.x, { mediaType: o.r.mt }), lm, rm), o.r.role))), more ? h('button', { class: 'btn grey pf-more', onclick: () => { shownNot += 36; draw(); } }, t('pfMore')) : null)); }
  };
  const chips = (val, set, opts) => h('div', { class: 'pf-chips' }, opts.map(([v, l]) => h('button', { class: 'nf-chip' + (v === val ? ' on' : ''), onclick: e => { set(v); [...e.currentTarget.parentElement.children].forEach(c => c.classList.toggle('on', c === e.currentTarget)); shownNot = 24; draw(); } }, l)));
  ctl.append(chips(type, v => { type = v; }, [['all', t('pfAll')], ['movie', t('movies')], ['tv', t('shows')]]), chips(sort, v => { sort = v; }, [['pop', t('pfPop')], ['new', t('pfNew')], ['rate', t('pfRated')]]));
  holder.append(ctl, lists); draw();
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

async function seerrWatch(x) { try { await cpostSeerr('/watchlist', { tmdbId: +x.id, mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', title: x.title || x.name }); toast(t('wlAdded')); return true; } catch (e) { toast(((e.responseJSON && e.responseJSON.message) || 'Seerr')); return false; } }
