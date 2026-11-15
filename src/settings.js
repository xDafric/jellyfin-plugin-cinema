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
const sectionsCfg = () => { const c = cfg('sections'); return c && c.length ? c : DEFAULT_SECTIONS; };

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
    lazyRow(rows, title, () => d.run(s), d.kind || 'poster', { href: d.href || (d.custom ? '#/c/browse/' + s.id + '/' + encodeURIComponent(s.param) : undefined), min: d.custom ? 4 : 1 });
  };
  first.forEach(render);
  if (!rest.length && cfg('infinite') !== false) endlessRows(rows, page);
  if (rest.length) {
    const sentinel = h('div', { style: 'height:2px' }); page.append(sentinel); let idx = 0;
    const next = () => { const s = rest[idx++]; if (s) render(s); if (idx >= rest.length) { io.disconnect(); sentinel.remove(); if (cfg('infinite') !== false) endlessRows(rows, page); } };
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

/* ---------- settings page (per user, synced) ---------- */
const SET_TABS = [['general', 'setGeneral', 'gear'], ['home', 'setHome', 'home'], ['player', 'setPlayer', 'play'], ['look', 'setLook', 'star'], ['services', 'setServices', 'queue'], ['adv', 'setAdv', 'info']];
async function settingsView(page) {
  const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const wrap = h('div', { class: 'nf-page-pad set-wrap' }, h('h1', {}, t('settings'))); page.append(wrap);
  const layout = h('div', { class: 'set-layout' }); const nav = h('div', { class: 'set-nav' }); const body = h('div', { class: 'set-body' }); layout.append(nav, body); wrap.append(layout);
  let cur = (location.hash.match(/tab=(\w+)/) || [])[1] || 'general';
  const locked = (featKey) => featKey && !feat(featKey);
  const card_ = (title, ...kids) => h('section', { class: 'set-card' }, title ? h('h3', {}, title) : null, kids);
  const resetBtn = key => userSet(key) ? h('button', { class: 'set-reset', title: t('resetDefault'), onclick: async e => { await saveCfg({ [key]: null }); draw(); } }, ic('refresh', 'ic-s')) : null;
  const row = (label, hint, ctrl, key, lockedBy) => h('div', { class: 'set-row' + (lockedBy ? ' locked' : '') }, h('div', {}, h('b', {}, label), hint ? h('span', {}, lockedBy ? t('lockedBy') : hint) : null), h('div', { class: 'set-ctl' }, key ? resetBtn(key) : null, ctrl));
  const sw = (key, def, onset) => { const b = h('button', { class: 'set-switch' + (cfg(key) ? ' on' : ''), role: 'switch', onclick: async () => { const v = !cfg(key); b.classList.toggle('on', v); await saveCfg({ [key]: v }); onset && onset(v); } }, h('i')); return b; };
  const toggle = (label, key, hint, featKey) => row(label, hint, sw(key), key, locked(featKey));
  const seg = (opts, key, cb) => h('div', { class: 'pl-seg set-seg' }, opts.map(([v, l]) => h('button', { class: String(cfg(key)) === String(v) ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ [key]: typeof v === 'string' && /^\d+$/.test(v) ? +v : v }); cb && cb(v); } }, l)));
  function sectionsEditor() {
    const list = h('div', { class: 'set-list' }); let secs = sectionsCfg().map(s => Object.assign({}, s)); const persist = () => saveCfg({ sections: secs });
    const names = s => SEC[s.id] ? (SEC[s.id].custom ? SEC[s.id].label(s) + ' · ' + t('custom') : SEC[s.id].label(s)) : s.id;
    function draw_() {
      list.replaceChildren(...secs.map((s, i) => h('div', { class: 'set-sec' + (s.on === false ? ' off' : '') }, h('b', {}, names(s)), h('div', { class: 'set-sec-a' },
        h('button', { 'aria-label': 'Up', onclick: () => { if (i) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; persist(); draw_(); } } }, ic('down', 'rot180')),
        h('button', { 'aria-label': 'Down', onclick: () => { if (i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; persist(); draw_(); } } }, ic('down')),
        h('button', { class: 'set-switch' + (s.on === false ? '' : ' on'), onclick: () => { s.on = s.on === false; persist(); draw_(); } }, h('i')),
        SEC[s.id] && SEC[s.id].custom ? h('button', { 'aria-label': 'Remove', onclick: () => { secs.splice(i, 1); persist(); draw_(); } }, ic('close')) : null))));
    }
    draw_();
    const types = [['genre', t('secGenre')], ['collection', t('collection')], ['library', t('secLibrary')], ['because', t('because')], ['seerrTrending', 'Seerr: ' + t('trending')], ['seerrMovies', 'Seerr: ' + t('popMovies')], ['seerrRec', t('seerrRec')]];
    const typeSel = h('select', {}, types.filter(([k]) => !secs.some(s => s.id === k && !SEC[k].custom)).map(([k, l]) => h('option', { value: k }, l)));
    const valSel = h('select', {});
    async function fillVals() { valSel.replaceChildren(); valSel.style.display = ''; const k = typeSel.value;
      if (k === 'genre') { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); g.Items.forEach(x => valSel.append(h('option', { value: x.Name }, x.Name))); }
      else if (k === 'collection') { const g = await items({ IncludeItemTypes: 'BoxSet', SortBy: 'SortName', Limit: 200 }); g.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
      else if (k === 'library') { const v = await api('Users/' + uid() + '/Views'); v.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
      else valSel.style.display = 'none'; }
    typeSel.addEventListener('change', fillVals); fillVals();
    const addBtn = h('button', { class: 'btn white', style: 'height:40px', onclick: () => { const k = typeSel.value; const o = valSel.selectedOptions[0]; secs.push(SEC[k].custom ? { id: k, on: true, param: valSel.value, title: o && o.dataset.t } : { id: k, on: true }); persist(); draw_(); } }, ic('plus'), t('add'));
    const resetB = h('button', { class: 'btn grey', style: 'height:40px', onclick: () => { secs = DEFAULT_SECTIONS.map(s => Object.assign({}, s)); saveCfg({ sections: null }); draw_(); } }, t('reset'));
    return h('div', {}, list, h('div', { class: 'set-add' }, typeSel, valSel, addBtn, resetB));
  }
  const S = {
    general: () => [card_(t('setGeneral'),
      row(t('setTv'), t('setTvHint'), (() => { const b = h('button', { class: 'set-switch' + (devGet('tv') === '1' ? ' on' : ''), role: 'switch', onclick: () => { const on = devGet('tv') !== '1'; devSet('tv', on ? '1' : null); try { localStorage.removeItem('cx-tv-force'); } catch (e) { } b.classList.toggle('on', on); setTimeout(() => location.reload(), 250); } }, h('i')); return b; })()),
      toggle(t('setHero'), 'hero', t('setHeroHint'), 'hero'), toggle(t('setPeek'), 'peek', t('setPeekHint'), 'peek'),
      row(t('setPeekDelay'), t('setPeekDelayHint'), seg([[180, t('fast')], [320, t('normal')], [520, t('slow')]], 'peekDelay'), 'peekDelay', locked('peek')),
      toggle(t('setInfinite'), 'infinite', t('setInfiniteHint'), 'infiniteScroll'))],
    home: () => [card_(t('setHero'),
      row(t('setHeroItems'), t('setHeroItemsHint'), seg([[4, '4'], [6, '6'], [8, '8'], [12, '12']], 'heroItems'), 'heroItems', locked('hero')),
      row(t('setHeroInterval'), t('setHeroIntervalHint'), seg([[6, '6 s'], [11, '11 s'], [16, '16 s'], [30, '30 s']], 'heroInterval'), 'heroInterval', locked('hero'))),
      card_(t('homeSections'), h('p', { class: 'set-hint' }, t('homeSectionsHint')), sectionsEditor())],
    player: () => [card_(t('setPlayer'),
      row(t('setDevPlayer'), t('setDevPlayerHint'), h('div', { class: 'pl-seg set-seg' }, [['own', t('plOwn')], ['native', t('plStd')]].map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); } }, l))), null, locked('ownPlayer')),
      toggle(t('plAutoNext'), 'pl_autoNext', t('plAutoNextHint'), 'ownPlayer'), toggle(t('plAutoSkip'), 'pl_autoSkip', t('plAutoSkipHint'), 'ownPlayer'),
      row(t('plQuality'), t('plQualityHint'), seg([['auto', t('plAuto')], ['20', '1080p+'], ['8', '1080p'], ['4', '720p'], ['1.5', '480p']], 'pl_quality'), 'pl_quality', locked('ownPlayer')),
      toggle(t('plRemember'), 'pl_rememberVol', '', 'ownPlayer')),
      card_(t('plTab_subs'),
        row(t('plSubSize'), '', seg([['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], 'pl_subSize'), 'pl_subSize'),
        row(t('plSubPos'), '', seg([[4, t('plLow')], [9, t('plMid')], [16, t('plHigh')]], 'pl_subPos'), 'pl_subPos'),
        row(t('plSubBg'), '', seg([['shadow', t('plShadow')], ['box', t('plBox')], ['none', t('plNone')]], 'pl_subBg'), 'pl_subBg'),
        row(t('plSubColor'), '', seg([['#ffffff', t('plWhite')], ['#ffe14d', t('plYellow')], ['#7dffb1', t('plGreen')]], 'pl_subColor'), 'pl_subColor'),
        toggle(t('plSubBold'), 'pl_subBold', ''), row(t('plSubFont'), '', seg([['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']], 'pl_subFont'), 'pl_subFont'))],
    look: () => {
      const acc = h('input', { type: 'color', value: cfg('accent') || '#e50914', onchange: async e => { await saveCfg({ accent: e.target.value }); draw(); } });
      const swatches = h('div', { class: 'set-sw' }, ['#e50914', '#ff6a3d', '#f5b301', '#34c759', '#0a84ff', '#8b5cf6', '#ff2d92', '#ffffff'].map(c => h('button', { style: 'background:' + c, class: cfg('accent') === c ? 'on' : '', 'aria-label': c, onclick: async () => { await saveCfg({ accent: c }); draw(); } })));
      return [card_(t('setLook'),
        row(t('accent'), t('accentHint'), h('div', { style: 'display:flex;gap:10px;align-items:center' }, swatches, acc), 'accent'),
        row(t('setCardSize'), t('setCardSizeHint'), seg([['s', t('small')], ['m', t('medium')], ['l', t('large')]], 'cardSize'), 'cardSize'),
        row(t('pskin'), t('pskinHint'), (() => { const b = h('button', { class: 'set-switch' + (skinOn() ? ' on' : ''), onclick: () => { setSkin(!skinOn()); b.classList.toggle('on', skinOn()); } }, h('i')); return b; })()))];
    },
    services: () => {
      const dot = (ok, name, hint) => h('div', { class: 'set-svc' }, h('i', { class: ok ? 'ok' : '' }), h('div', {}, h('b', {}, name), h('span', {}, ok ? t('connected') : t('notConnected'))), hint ? h('a', { class: 'sp-pillbtn dark', href: hint }, t('open')) : null);
      const st = C.status || {};
      return [card_(t('setServices'), dot(st.seerr, 'Seerr', '#/c/discover'), dot(st.radarr, 'Radarr', '#/c/calendar'), dot(st.sonarr, 'Sonarr', '#/c/calendar'), dot(st.aurral, 'Aurral', '#/c/music/discover'),
        admin ? h('div', { style: 'margin-top:16px' }, h('a', { class: 'btn white', style: 'display:inline-flex', href: '#/configurationpage?name=Cinema' }, ic('gear'), t('serverSettings'))) : h('p', { class: 'set-hint' }, t('askAdmin'))),
        card_(t('setWatchlist'), toggle(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint'), 'watchlist'))];
    },
    adv: () => [card_(t('setAdv'),
      row(t('exportSet'), t('exportSetHint'), h('div', { style: 'display:flex;gap:8px' }, h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(CFGU)); toast('✓ ' + t('copied')); } }, t('copy')), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { const raw = prompt(t('pasteSet')); if (!raw) return; try { CFGU = {}; await saveCfg(JSON.parse(raw)); draw(); toast('✓'); } catch (e) { toast('⚠ JSON'); } } }, t('impt')))),
      row(t('resetAll'), t('resetAllHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { if (!confirm(t('resetAllHint'))) return; CFGU = {}; await saveCfg({}); draw(); toast('✓'); } }, t('reset'))),
      row(t('clearCache'), t('clearCacheHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { resetSeerrCache(); resetMyTracks && resetMyTracks(); C.libCache = null; toast('✓'); } }, t('clear'))),
      row(t('killSwitch'), t('killSwitchHint'), h('code', {}, 'cinemaUI.off()'))),
      card_(t('about'), h('div', { class: 'set-about' }, h('div', {}, 'Cinema ', h('b', {}, (C.status && C.status.version) || ''), ' · ', h('a', { href: 'https://github.com/xDafric/jellyfin-plugin-cinema', target: '_blank', rel: 'noopener' }, 'GitHub')), h('div', { class: 'mi-pills' }, Object.entries((C.status && C.status.features) || {}).map(([k, v]) => h('i', { style: v ? '' : 'opacity:.4;text-decoration:line-through' }, k)))))]
  };
  function draw() {
    nav.replaceChildren(...SET_TABS.map(([k, label, icon]) => h('button', { class: k === cur ? 'on' : '', onclick: () => { cur = k; draw(); } }, ic(icon, 'ic-s'), t(label))));
    body.replaceChildren(...S[cur]());
  }
  draw();
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

/* endless tail of the home page: all genres, then decades, then more picks */
async function endlessRows(rows, page) {
  const sentinel = h('div', { style: 'height:2px' }); page.append(sentinel);
  let queue = [];
  try { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); queue = shuffleArr(g.Items.map(x => ({ kind: 'genre', name: x.Name }))); } catch (e) { }
  [2020, 2010, 2000, 1990, 1980, 1970].forEach(d => queue.push({ kind: 'decade', from: d }));
  queue.push({ kind: 'rated' }, { kind: 'unwatched' }, { kind: 'recentShows' });
  const used = new Set(rows.querySelectorAll('.nf-row h2') ? [...rows.querySelectorAll('.nf-row h2')].map(x => x.textContent.replace(/ ›$/, '')) : []);
  const next = () => {
    const q = queue.shift(); if (!q) { io.disconnect(); sentinel.remove(); return; }
    if (q.kind === 'genre') { if (used.has(q.name)) return next(); lazyRow(rows, q.name, () => items({ IncludeItemTypes: 'Movie,Series', Genres: q.name, SortBy: 'Random', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(q.name) }); }
    else if (q.kind === 'decade') { const years = Array.from({ length: 10 }, (_, i) => q.from + i).join(','); lazyRow(rows, t('fromDecade') + ' ' + q.from + 's', () => items({ IncludeItemTypes: 'Movie', Years: years, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/decade/' + q.from }); }
    else if (q.kind === 'rated') lazyRow(rows, t('top'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24, StartIndex: 20 }), 'poster', { min: 4, href: '#/c/browse/top/x' });
    else if (q.kind === 'unwatched') lazyRow(rows, t('unwatched'), () => items({ IncludeItemTypes: 'Movie', Filters: 'IsUnplayed', SortBy: 'Random', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/unwatched/x' });
    else if (q.kind === 'recentShows') lazyRow(rows, t('newShows'), () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24, StartIndex: 12 }), 'poster');
    setTimeout(() => { if (sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 900) next(); }, 1200);
  };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) next(); }, { root: C.nf.el, rootMargin: '900px' });
  io.observe(sentinel);
}
