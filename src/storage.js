/* ---------- Storage assistant: free space, biggest files, clean-up suggestions (administrators) ---------- */
Object.assign(TX.en, {
  stTitle: 'Storage', stIntro: 'See how full your disks are, which movies take the most space, and which ones you could archive.', stAdminOnly: 'Only administrators can open the storage assistant.', stLoading: 'Measuring your library…',
  stDisks: 'Disks', stNoDisks: 'No disk information available. Connect Radarr or Sonarr, or use Jellyfin 10.10 or newer.', stFree: 'free of', stUsed: 'used', stLibrary: 'Movie library', stFilms: 'movies', stTotal: 'Total size', stAvg: 'Average per movie', stBiggest: 'Biggest movie', stPace: 'Growth', stPerMonth: 'per month (last 3 months)', stFull: 'At this pace the fullest disk is full in about {n} months.', stFullNow: 'Less than a month of space is left at this pace.',
  stRes: 'By resolution', stClean: 'Clean-up suggestions', stBig: 'Biggest files', stCleanHint: 'Movies you already watched, rarely watched, badly rated or very large. Favourites and watchlist titles are never suggested.', stNone: 'Nothing to suggest. Your library looks tidy.',
  stSelected: '{n} selected', stFrees: 'frees up {s}', stArchive: 'Archive selected…', stSelAll: 'Select all', stSelNone: 'Clear', stBulkTitle: 'Archive {n} movies', stBulkIntro: 'For each movie the details and pictures are saved in the archive, then the file is deleted and the movie leaves your library.', stBulkGo: 'Archive and free {s}', stBulkRun: 'Archiving…', stBulkDone: '{n} movies archived, {s} freed.', stBulkFail: '{n} failed',
  stRSeen: 'Watched', stRLow: 'Low rating', stRBig: 'Very large', stRStale: 'Never watched, added over a year ago', stROld: 'Not watched for a long time', stSortSize: 'Size', stSortEff: 'GB per hour', stGbH: 'GB/h', stSeries: 'Series are not part of this overview yet.', stWatchedOn: 'watched', stAdded: 'added', stOpen: 'Open'
});
Object.assign(TX.de, {
  stTitle: 'Speicher', stIntro: 'Sieh, wie voll deine Festplatten sind, welche Filme am meisten Platz brauchen und welche du archivieren könntest.', stAdminOnly: 'Nur Administratoren können den Speicher-Assistenten öffnen.', stLoading: 'Vermesse deine Bibliothek…',
  stDisks: 'Festplatten', stNoDisks: 'Keine Festplatten-Informationen verfügbar. Verbinde Radarr oder Sonarr, oder nutze Jellyfin 10.10 oder neuer.', stFree: 'frei von', stUsed: 'belegt', stLibrary: 'Filmbibliothek', stFilms: 'Filme', stTotal: 'Gesamtgröße', stAvg: 'Durchschnitt pro Film', stBiggest: 'Größter Film', stPace: 'Wachstum', stPerMonth: 'pro Monat (letzte 3 Monate)', stFull: 'In diesem Tempo ist die vollste Festplatte in etwa {n} Monaten voll.', stFullNow: 'In diesem Tempo reicht der Platz keinen Monat mehr.',
  stRes: 'Nach Auflösung', stClean: 'Aufräum-Vorschläge', stBig: 'Größte Dateien', stCleanHint: 'Filme, die du schon gesehen hast, lange nicht angeschaut hast, schlecht bewertet sind oder sehr groß. Favoriten und Watchlist-Titel werden nie vorgeschlagen.', stNone: 'Nichts vorzuschlagen. Deine Bibliothek ist aufgeräumt.',
  stSelected: '{n} ausgewählt', stFrees: 'gibt {s} frei', stArchive: 'Auswahl archivieren…', stSelAll: 'Alle wählen', stSelNone: 'Leeren', stBulkTitle: '{n} Filme archivieren', stBulkIntro: 'Von jedem Film werden Details und Bilder im Archiv gespeichert, dann wird die Datei gelöscht und der Film verlässt deine Bibliothek.', stBulkGo: 'Archivieren und {s} freigeben', stBulkRun: 'Archiviere…', stBulkDone: '{n} Filme archiviert, {s} freigegeben.', stBulkFail: '{n} fehlgeschlagen',
  stRSeen: 'Gesehen', stRLow: 'Schlecht bewertet', stRBig: 'Sehr groß', stRStale: 'Nie geschaut, vor über einem Jahr hinzugefügt', stROld: 'Lange nicht geschaut', stSortSize: 'Größe', stSortEff: 'GB pro Stunde', stGbH: 'GB/Std.', stSeries: 'Serien sind in dieser Übersicht noch nicht enthalten.', stWatchedOn: 'gesehen', stAdded: 'hinzugefügt', stOpen: 'Öffnen'
});
const fmtBytes = b => b >= 1e12 ? (b / 1e12).toFixed(2) + ' TB' : b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.round(b / 1e6) + ' MB';
const ST = { data: null, at: 0, sel: new Set() };

async function stDisks() {
  const out = [];
  const [jfS, arr] = await Promise.all([api('System/Info/Storage').catch(() => null), plug().radarr || plug().sonarr ? cget('/arr/diskspace').catch(() => []) : []]);
  ((jfS && jfS.Libraries) || []).forEach(l => (l.Folders || []).forEach(f => { if (f.FreeSpace != null && f.UsedSpace != null) out.push({ name: l.Name, path: f.Path, free: f.FreeSpace, total: f.FreeSpace + f.UsedSpace, src: 'Jellyfin' }); }));
  (arr || []).forEach(d => { if (d.total) out.push({ name: d.label || d.path, path: d.path, free: d.free, total: d.total, src: d.source === 'radarr' ? 'Radarr' : 'Sonarr' }); });
  const uniq = []; out.forEach(d => { if (!uniq.some(u => Math.abs(u.total - d.total) < 2e8 && Math.abs(u.free - d.free) < 5e9)) uniq.push(d); }); // the same disk seen by several services
  return uniq;
}
async function stLoad(force) {
  if (!force && ST.data && Date.now() - ST.at < 120000) return ST.data;
  const [r, wl, disks] = await Promise.all([items({ IncludeItemTypes: 'Movie', Fields: 'MediaSources,ProviderIds,DateCreated,CommunityRating,ProductionYear,OriginalTitle', Limit: 10000, EnableImageTypes: 'Primary', ImageTypeLimit: 1 }), items({ IncludeItemTypes: 'Movie', Filters: 'Likes', Limit: 3000, Fields: '' }).catch(() => ({ Items: [] })), stDisks(), (optOn('letterboxd') && lbUser()) ? lbLoad() : null]);
  const wlIds = new Set((wl.Items || []).map(i => i.Id)); const day = 864e5, now = Date.now();
  const movies = (r.Items || []).map(it => {
    const src = (it.MediaSources || [])[0] || {}; const size = src.Size || 0; const v = (src.MediaStreams || []).find(s => s.Type === 'Video') || {}; const h_ = v.Height || 0, w_ = v.Width || 0;
    const res = (h_ >= 1800 || w_ >= 3400) ? '4K' : (h_ >= 900 || w_ >= 1800) ? '1080p' : (h_ >= 650 || w_ >= 1200) ? '720p' : (h_ || w_) ? 'SD' : '?';
    const mins = it.RunTimeTicks ? it.RunTimeTicks / 6e8 : 0; const u = ud(it); const lb = LB.n ? lbMatch(it) : null;
    const rating = lb && lb.rating ? lb.rating * 2 : (it.CommunityRating || 0);
    const played = !!u.Played || !!lb; const last = u.LastPlayedDate ? Date.parse(u.LastPlayedDate) : (lb && lb.date ? Date.parse(lb.date) : 0); const added = it.DateCreated ? Date.parse(it.DateCreated) : 0;
    return { it, size, res, mins, gbh: mins ? size / 1e9 / (mins / 60) : 0, rating, played, last, added, protectd: !!u.IsFavorite || wlIds.has(it.Id), codec: v.Codec || '' };
  }).filter(m => m.size > 0);
  const total = movies.reduce((a, m) => a + m.size, 0);
  const recent = movies.filter(m => m.added > now - 90 * day).reduce((a, m) => a + m.size, 0); const perMonth = recent / 3;
  const sug = movies.filter(m => !m.protectd).map(m => {
    const gb = m.size / 1e9; let score = Math.min(40, gb * 3); const why = [];
    if (m.played) { score += 40; why.push('stRSeen'); if (m.last && now - m.last > 180 * day) { score += 10; why.push('stROld'); } }
    else if (m.added && now - m.added > 365 * day) { score += 15; why.push('stRStale'); }
    if (m.rating && m.rating < 5.5) { score += 25; why.push('stRLow'); } else if (m.rating >= 8) score -= 30;
    if (gb >= 15) why.push('stRBig');
    return { m, score, why };
  }).filter(x => x.score >= 55 && (x.m.played || x.why.includes('stRStale'))).sort((a, b) => b.score - a.score).slice(0, 80);
  ST.data = { movies, total, perMonth, disks, sug, res: ['4K', '1080p', '720p', 'SD', '?'].map(k => ({ k, n: movies.filter(m => m.res === k).length, b: movies.filter(m => m.res === k).reduce((a, m) => a + m.size, 0) })).filter(x => x.n) }; ST.at = Date.now(); return ST.data;
}
function stRow(m, why, onSel) {
  const it = m.it; const cb = h('input', { type: 'checkbox', checked: ST.sel.has(it.Id), onchange: e => { e.target.checked ? ST.sel.add(it.Id) : ST.sel.delete(it.Id); row.classList.toggle('sel', e.target.checked); onSel(); } });
  const date = m.last ? t('stWatchedOn') + ' ' + new Date(m.last).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' }) : (m.added ? t('stAdded') + ' ' + new Date(m.added).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' }) : '');
  const row = h('div', { class: 'st-row' + (ST.sel.has(it.Id) ? ' sel' : '') }, h('label', { class: 'st-cb' }, cb, h('i')), h('div', Object.assign({ class: 'st-p', onclick: () => go(itemHash(it)) }, bg(imgUrl(it, 'Primary', 120)))),
    h('div', { class: 'st-t', onclick: () => go(itemHash(it)) }, h('b', { class: 'ell' }, it.Name + (it.ProductionYear ? ' (' + it.ProductionYear + ')' : '')), h('span', {}, [m.res !== '?' ? m.res : '', m.codec.toUpperCase(), m.mins ? Math.round(m.mins) + ' ' + t('min') : '', m.gbh ? m.gbh.toFixed(1) + ' ' + t('stGbH') : '', date].filter(Boolean).join(' · ')),
      (why || []).length ? h('div', { class: 'st-why' }, why.map(k => h('i', { class: k }, t(k)))) : null), h('div', { class: 'st-sz' }, fmtBytes(m.size)));
  return row;
}
async function storageView(page) {
  const wrap = h('div', { class: 'nf-page-pad st-page' }, h('h1', {}, t('stTitle')), h('p', { class: 'gm-secp' }, t('stIntro'))); page.append(wrap);
  if (!(C.status && C.status.admin)) { wrap.append(h('div', { class: 'nf-empty' }, t('stAdminOnly'))); return; }
  wrap.append(h('div', { class: 'spinner', style: 'margin:60px auto 12px' }), h('p', { class: 'gm-loading' }, t('stLoading')));
  let D; try { D = await stLoad(true); } catch (e) { wrap.append(h('div', { class: 'nf-empty' }, '⚠ ' + (e.message || e))); return; }
  wrap.querySelector('.spinner').remove(); wrap.querySelector('.gm-loading').remove();
  /* disks */
  const disks = h('div', { class: 'st-disks' });
  const perMonth = D.perMonth; let worstMonths = null;
  D.disks.sort((a, b) => a.free / a.total - b.free / b.total).forEach(d => {
    const used = 1 - d.free / d.total; const months = perMonth > 0 ? d.free / perMonth : null; if (months != null && (worstMonths == null || months < worstMonths)) worstMonths = months;
    disks.append(h('div', { class: 'st-disk' + (used > .9 ? ' crit' : used > .75 ? ' warn' : '') }, h('div', { class: 'st-dh' }, h('b', { class: 'ell' }, d.name || d.path), h('small', {}, d.src)), h('div', { class: 'st-bar' }, h('i', { style: 'width:' + Math.round(used * 100) + '%' })), h('div', { class: 'st-df' }, h('b', {}, fmtBytes(d.free)), ' ' + t('stFree') + ' ' + fmtBytes(d.total), h('span', {}, Math.round(used * 100) + '% ' + t('stUsed'))), h('small', { class: 'ell' }, d.path || '')));
  });
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('stDisks')), D.disks.length ? disks : h('div', { class: 'nf-empty', style: 'padding:24px 0' }, t('stNoDisks')),
    worstMonths != null ? h('p', { class: 'st-fc' }, '⏳ ' + (worstMonths < 1 ? t('stFullNow') : t('stFull').replace('{n}', Math.round(worstMonths)))) : null));
  /* numbers */
  const big = D.movies.slice().sort((a, b) => b.size - a.size)[0];
  const tile = (v, l, sub) => h('div', { class: 'gm-tile2' }, h('b', { class: 'ell' }, v), h('small', {}, l), sub ? h('small', { class: 'ell' }, sub) : null);
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('stLibrary')), h('div', { class: 'gm-stats' }, tile(D.movies.length.toLocaleString(), t('stFilms')), tile(fmtBytes(D.total), t('stTotal')), tile(fmtBytes(D.total / Math.max(1, D.movies.length)), t('stAvg')), big ? tile(fmtBytes(big.size), t('stBiggest'), big.it.Name) : null, tile('+' + fmtBytes(D.perMonth), t('stPace'), t('stPerMonth'))),
    h('h3', {}, t('stRes')), h('div', { class: 'st-res' }, h('div', { class: 'st-resbar' }, D.res.map(x => h('i', { class: 'r' + x.k.replace('?', 'u'), style: 'flex:' + x.b, title: x.k + ' · ' + x.n + ' · ' + fmtBytes(x.b) }))), h('div', { class: 'st-resl' }, D.res.map(x => h('span', {}, h('i', { class: 'r' + x.k.replace('?', 'u') }), h('b', {}, x.k), ' ' + x.n + ' · ' + fmtBytes(x.b))))), h('p', { class: 'gm-secp', style: 'margin-top:14px' }, t('stSeries'))));
  /* lists with selection */
  let tab = 'clean', sortBy = 'size'; const list = h('div', { class: 'st-list' });
  const bar = h('div', { class: 'st-selbar' }); const selInfo = () => { const picked = D.movies.filter(m => ST.sel.has(m.it.Id)); const sz = picked.reduce((a, m) => a + m.size, 0); bar.classList.toggle('show', picked.length > 0); bar.replaceChildren(h('b', {}, t('stSelected').replace('{n}', picked.length)), h('span', {}, t('stFrees').replace('{s}', fmtBytes(sz))), h('button', { class: 'btn grey', onclick: () => { ST.sel.clear(); drawList(); selInfo(); } }, t('stSelNone')), h('button', { class: 'btn white', onclick: () => stBulk(picked, () => { ST.sel.clear(); stLoad(true).then(nd => { D = nd; drawList(); selInfo(); }); }) }, ic('download'), t('stArchive'))); };
  const tabs = h('div', { class: 'nf-seasons' }, [['clean', t('stClean')], ['big', t('stBig')]].map(([k, l]) => h('button', { class: 'nf-chip' + (k === tab ? ' on' : ''), onclick: e => { tab = k; $$('.nf-chip', tabs).forEach(c => c.classList.toggle('on', c === e.currentTarget)); drawList(); } }, l)));
  const sortSel = h('select', { class: 'st-sort', onchange: e => { sortBy = e.target.value; drawList(); } }, [['size', t('stSortSize')], ['eff', t('stSortEff')]].map(([v, l]) => h('option', { value: v }, l)));
  function drawList() {
    sortSel.style.display = tab === 'big' ? '' : 'none';
    let rows;
    if (tab === 'clean') rows = D.sug.map(x => stRow(x.m, x.why, selInfo)); else rows = D.movies.slice().sort((a, b) => sortBy === 'eff' ? b.gbh - a.gbh : b.size - a.size).slice(0, 60).map(m => stRow(m, m.protectd ? [] : [], selInfo));
    list.replaceChildren(...(rows.length ? rows : [h('div', { class: 'nf-empty', style: 'padding:30px 0' }, t('stNone'))]));
  }
  wrap.append(h('section', { class: 'gm-sec' }, h('div', { class: 'st-head' }, tabs, sortSel, h('button', { class: 'nf-chip', onclick: () => { const rows = tab === 'clean' ? D.sug.map(x => x.m) : D.movies.slice().sort((a, b) => b.size - a.size).slice(0, 60); rows.forEach(m => ST.sel.add(m.it.Id)); drawList(); selInfo(); } }, t('stSelAll'))), h('p', { class: 'gm-secp' }, t('stCleanHint')), list), bar);
  drawList(); selInfo();
}
/* archive several movies one after the other */
function stBulk(picked, done) {
  const d = cxDialog(t('stBulkTitle').replace('{n}', picked.length), { wide: false }); const radarrOk = !!(C.status && C.status.radarr);
  const useRadarr = h('input', { type: 'checkbox', checked: radarrOk && (C.status.features || {}).archiveRadarr !== false, disabled: !radarrOk });
  const total = picked.reduce((a, m) => a + m.size, 0); const status = h('div', { class: 'st-bulk' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    go_.disabled = true; useRadarr.disabled = true; let ok = 0, freed = 0, fail = 0; const rows = new Map();
    status.replaceChildren(...picked.map(m => { const r = h('div', { class: 'st-bl' }, h('span', {}, '…'), h('b', { class: 'ell' }, m.it.Name), h('small', {}, fmtBytes(m.size))); rows.set(m.it.Id, r); return r; }));
    for (const m of picked) { const r = rows.get(m.it.Id); r.firstChild.textContent = '⏳'; r.scrollIntoView({ block: 'nearest' }); try { const full = await getItem(m.it.Id); await archiveCore(full, useRadarr.checked); ok++; freed += m.size; r.firstChild.textContent = '✓'; r.classList.add('ok'); } catch (e) { fail++; r.firstChild.textContent = '⚠'; r.classList.add('bad'); r.title = String(e.message || e); } }
    ARCH.at = 0; archLoad(true); C.libCache = null; resetSeerrCache(); d.foot.replaceChildren(h('b', { style: 'margin-right:auto' }, t('stBulkDone').replace('{n}', ok).replace('{s}', fmtBytes(freed)) + (fail ? ' · ' + t('stBulkFail').replace('{n}', fail) : '')), h('button', { class: 'btn white', onclick: () => { d.close(); done(); } }, 'OK'));
  } }, ic('download'), t('stBulkGo').replace('{s}', fmtBytes(total)));
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('stBulkIntro')), h('label', { class: 'arch-opt' }, useRadarr, h('span', {}, radarrOk ? t('archRadarr') : t('archRadarrOff'))), h('p', { class: 'cxd-hint arch-warn' }, t('archWarn')), status);
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}
