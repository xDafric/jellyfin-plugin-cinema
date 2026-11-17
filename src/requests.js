/* ---------- Requests page: clearer status, progress with time left, filters, actions ---------- */
Object.assign(TX.en, {
  rxStepReq: 'Requested', rxStepApp: 'Approved', rxStepDl: 'Downloading', rxStepAv: 'Available', rxDeclined: 'Declined', rxPartial: 'Partly available', rxHintPending: 'Waiting for an administrator to approve it.', rxHintApproved: 'Approved. Waiting for the download to start.', rxHintAv: 'Ready in your library.', rxHintDecl: 'This request was declined.', rxHintPartial: 'Some episodes are already available, the rest is on its way.',
  rxAll: 'All', rxWait: 'Waiting', rxProg: 'In progress', rxDone: 'Available', rxBad: 'Declined', rxMine: 'Only mine', rxSearch: 'Search requests…', rxBy: 'by', rxOpen: 'Open', rxDetails: 'Details', rxApprove: 'Approve', rxDecline: 'Decline', rxDelete: 'Remove request', rxDelAsk: 'Remove this request?', rxMore: 'Load more', rxEmpty: 'No requests match.', rxSeasons: 'Seasons',
  rxFilm: 'Movie', rxShow: 'Series', rxLeft: 'left', rxOf: 'of', rxSortNew: 'Newest', rxSortOld: 'Oldest', rxSortTitle: 'Title', rxLive: 'Updates live', rxType: 'Type', rxNowDl: 'Downloading now', rxQueueN: '{n} downloads running', rxWhen: 'requested', rxProfile: 'Quality'
});
Object.assign(TX.de, {
  rxStepReq: 'Angefragt', rxStepApp: 'Genehmigt', rxStepDl: 'Lädt', rxStepAv: 'Verfügbar', rxDeclined: 'Abgelehnt', rxPartial: 'Teilweise verfügbar', rxHintPending: 'Wartet darauf, dass ein Administrator zustimmt.', rxHintApproved: 'Genehmigt. Der Download startet gleich.', rxHintAv: 'Bereit in deiner Bibliothek.', rxHintDecl: 'Diese Anfrage wurde abgelehnt.', rxHintPartial: 'Einige Folgen sind schon da, der Rest ist unterwegs.',
  rxAll: 'Alle', rxWait: 'Wartet', rxProg: 'In Arbeit', rxDone: 'Verfügbar', rxBad: 'Abgelehnt', rxMine: 'Nur meine', rxSearch: 'Anfragen durchsuchen…', rxBy: 'von', rxOpen: 'Öffnen', rxDetails: 'Details', rxApprove: 'Genehmigen', rxDecline: 'Ablehnen', rxDelete: 'Anfrage entfernen', rxDelAsk: 'Diese Anfrage entfernen?', rxMore: 'Mehr laden', rxEmpty: 'Keine passenden Anfragen.', rxSeasons: 'Staffeln',
  rxFilm: 'Film', rxShow: 'Serie', rxLeft: 'übrig', rxOf: 'von', rxSortNew: 'Neueste', rxSortOld: 'Älteste', rxSortTitle: 'Titel', rxLive: 'Aktualisiert live', rxType: 'Typ', rxNowDl: 'Lädt gerade', rxQueueN: '{n} Downloads laufen', rxWhen: 'angefragt', rxProfile: 'Qualität'
});
const RX_STEPS = ['pending', 'approved', 'loading', 'available'];
const rxStepKey = { pending: 'rxStepReq', approved: 'rxStepApp', loading: 'rxStepDl', available: 'rxStepAv' };
function rxStage(q, qi) { const md = q.media || {}; if (q.status === 3) return 'declined'; if (q.status === 1) return 'pending'; if (md.status === 5) return 'available'; if (qi) return 'loading'; if (md.status === 4) return 'partial'; if (md.status === 3) return 'loading'; return 'approved'; }
function rxQueueFor(md, queue) {
  const mt = md.mediaType; const hit = (queue || []).filter(x => mt === 'movie' ? (x.source === 'radarr' && +x.tmdbId === +md.tmdbId) : (x.source === 'sonarr' && ((md.tvdbId && +x.tvdbId === +md.tvdbId) || (+x.tmdbSeriesId === +md.tmdbId))));
  if (!hit.length) return null; const size = hit.reduce((a, x) => a + (x.size || 0), 0), left = hit.reduce((a, x) => a + (x.sizeleft || 0), 0);
  return { n: hit.length, size, left, pct: size ? Math.round((1 - left / size) * 100) : 0, time: hit.map(x => x.timeleft).filter(Boolean).sort().pop() || '', client: hit[0].client || '', warn: hit.some(x => /warning|failed|stalled/i.test(x.status + ' ' + x.trackedDownloadState)) };
}
function rxTime(s) { const m = /^(?:(\d+)\.)?(\d+):(\d+):(\d+)/.exec(s || ''); if (!m) return ''; const mins = (+m[1] || 0) * 1440 + +m[2] * 60 + +m[3]; return mins >= 1440 ? Math.round(mins / 1440) + ' d' : mins >= 60 ? Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min' : Math.max(1, mins) + ' min'; }
const rxAgo = d => { const diff = (Date.parse(d) - Date.now()) / 1000; const f = new Intl.RelativeTimeFormat(L === 'de' ? 'de' : 'en', { numeric: 'auto' }); const a = Math.abs(diff); return a < 3600 ? f.format(Math.round(diff / 60), 'minute') : a < 86400 ? f.format(Math.round(diff / 3600), 'hour') : a < 86400 * 30 ? f.format(Math.round(diff / 86400), 'day') : f.format(Math.round(diff / 86400 / 30), 'month'); };

async function requestsView(page) {
  const wrap = h('div', { class: 'nf-page-pad rq-page' }, h('h1', {}, t('requests'))); page.append(wrap);
  if (!(await waitSeerr())) { wrap.append(h('div', { class: 'nf-empty' }, 'Seerr is not available.')); return; }
  const user = await me(); const admin = !!(user.Policy && user.Policy.IsAdministrator); const hasArr = plug().radarr || plug().sonarr;
  const st = { f: 'all', type: 'all', sort: 'new', q: '', mine: false }; let rows = [], queue = [], total = 0, timer = 0;
  const lm = await libMap();
  const tiles = h('div', { class: 'rq-tiles' }); const bar = h('div', { class: 'rq-bar' }); const list = h('div', { class: 'rq-list' }); const moreB = h('button', { class: 'btn grey rq-more', hidden: true }, t('rxMore'));
  const dl = h('div', {}); wrap.append(tiles, dl, bar, list, moreB);
  const grp = r => r.stage === 'pending' ? 'pending' : (r.stage === 'approved' || r.stage === 'loading' || r.stage === 'partial') ? 'prog' : r.stage === 'available' ? 'done' : 'bad';
  const FILT = [['all', t('rxAll'), 'rq-all'], ['pending', t('rxWait'), 'rq-pend'], ['prog', t('rxProg'), 'rq-prog'], ['done', t('rxDone'), 'rq-done'], ['bad', t('rxBad'), 'rq-bad']];
  function drawTiles() { tiles.replaceChildren(...FILT.map(([k, l, c]) => h('button', { class: 'rq-tile ' + c + (st.f === k ? ' on' : ''), onclick: () => { st.f = k; drawTiles(); apply(); } }, h('b', {}, String(k === 'all' ? rows.length : rows.filter(r => grp(r) === k).length)), h('span', {}, l)))); }
  let qT; const sInp = h('input', { type: 'search', placeholder: t('rxSearch'), oninput: e => { clearTimeout(qT); qT = setTimeout(() => { st.q = e.target.value.trim().toLowerCase(); apply(); }, 200); } });
  const typeChips = h('div', { class: 'nf-seasons', style: 'margin:0' }, [['all', t('rxAll')], ['movie', t('rxFilm')], ['tv', t('rxShow')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.nf-chip', typeChips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); apply(); } }, l)));
  const sortSel = h('select', { onchange: e => { st.sort = e.target.value; apply(); } }, [['new', t('rxSortNew')], ['old', t('rxSortOld')], ['title', t('rxSortTitle')]].map(([v, l]) => h('option', { value: v }, l)));
  bar.append(typeChips, h('div', { class: 'dc-sel' }, sortSel), h('div', { class: 'dc-q' }, ic('search', 'ic-s'), sInp)); if (hasArr) bar.append(h('span', { class: 'rq-live' }, h('i'), t('rxLive')));
  function apply() {
    const vis = rows.filter(r => (st.f === 'all' || grp(r) === st.f) && (st.type === 'all' || r.mt === st.type) && (!st.q || (r.title || '').toLowerCase().includes(st.q) || (r.who || '').toLowerCase().includes(st.q)));
    vis.sort((a, b) => st.sort === 'title' ? (a.title || '').localeCompare(b.title || '') : st.sort === 'old' ? Date.parse(a.q.createdAt) - Date.parse(b.q.createdAt) : Date.parse(b.q.createdAt) - Date.parse(a.q.createdAt));
    list.replaceChildren(...(vis.length ? vis.map(r => r.el) : [h('div', { class: 'nf-empty', style: 'padding:40px 0' }, t('rxEmpty'))]));
  }
  function drawQueueBox() {
    if (!hasArr) return; const live = queue.length;
    dl.replaceChildren(live ? h('div', { class: 'rq-now' }, h('b', {}, t('rxQueueN').replace('{n}', live)), h('span', {}, fmtBytes(queue.reduce((a, x) => a + (x.size - x.sizeleft), 0)) + ' ' + t('rxOf') + ' ' + fmtBytes(queue.reduce((a, x) => a + x.size, 0)))) : '');
  }
  function paint(r) {
    const el = r.el; el.className = 'rq-row s-' + r.stage; const md = r.q.media || {}; const lib = lm[r.mt + ':' + md.tmdbId];
    const steps = r.stage === 'declined' ? h('div', { class: 'rq-bad' }, t('rxDeclined')) : h('div', { class: 'rq-steps' }, RX_STEPS.map((s, i) => { const cur = RX_STEPS.indexOf(r.stage === 'partial' ? 'loading' : r.stage); return h('div', { class: 'rq-st' + (i < cur || r.stage === 'available' ? ' done' : i === cur ? ' cur' : '') }, h('i', {}, i < cur || r.stage === 'available' ? '' : String(i + 1)), h('span', {}, r.stage === 'partial' && s === 'loading' ? t('rxPartial') : t(rxStepKey[s]))); }));
    const hint = { pending: 'rxHintPending', approved: 'rxHintApproved', available: 'rxHintAv', declined: 'rxHintDecl', partial: 'rxHintPartial' }[r.stage];
    const qi = r.qi; const prog = qi ? h('div', { class: 'rq-dl' }, h('div', { class: 'rq-pb' + (qi.warn ? ' warn' : '') }, h('i', { style: 'width:' + qi.pct + '%' })), h('span', {}, [qi.pct + ' %', fmtBytes(qi.size - qi.left) + ' ' + t('rxOf') + ' ' + fmtBytes(qi.size), qi.time ? rxTime(qi.time) + ' ' + t('rxLeft') : '', qi.client].filter(Boolean).join(' · '))) : (r.stage === 'loading' && dlPct(md) != null ? h('div', { class: 'rq-dl' }, h('div', { class: 'rq-pb' }, h('i', { style: 'width:' + dlPct(md) + '%' })), h('span', {}, dlPct(md) + ' %')) : null);
    const meta = [r.who ? t('rxBy') + ' ' + r.who : '', r.q.createdAt ? rxAgo(r.q.createdAt) : '', r.q.is4k ? '4K' : '', r.mt === 'tv' && (r.q.seasons || []).length ? t('rxSeasons') + ' ' + r.q.seasons.map(s => s.seasonNumber).sort((a, b) => a - b).join(', ') : ''].filter(Boolean).join(' · ');
    const btn = (cls, ico, label, fn) => h('button', { class: 'btn ' + cls + ' sm', onclick: async e => { e.stopPropagation(); const b = e.currentTarget; b.disabled = true; try { await fn(); } catch (er) { toast(((er.responseJSON && er.responseJSON.message) || er.statusText || 'error')); b.disabled = false; } } }, ico ? ic(ico) : null, label);
    const acts = [];
    if (lib && (r.stage === 'available' || r.stage === 'partial')) acts.push(btn('white', 'play', t('play'), async () => { playVideo(lib); }), btn('grey', 'info', t('rxOpen'), async () => go(itemHash(lib))));
    else acts.push(btn('grey', 'info', t('rxDetails'), async () => openSeerrInfo({ id: md.tmdbId, mediaType: r.mt })));
    if (admin && r.stage === 'pending') acts.push(btn('white', 'check', t('rxApprove'), async () => { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id + '/approve') }); toast(''); resetSeerrCache(); reload(); }), btn('grey', 'close', t('rxDecline'), async () => { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id + '/decline') }); resetSeerrCache(); reload(); }));
    if (admin || r.stage === 'pending' || r.stage === 'declined') acts.push(h('button', { class: 'rq-x', title: t('rxDelete'), 'aria-label': t('rxDelete'), onclick: async e => { e.stopPropagation(); if (!confirm(t('rxDelAsk'))) return; try { await ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id) }); resetSeerrCache(); reload(); } catch (er) { toast(t('error')); } } }, ic('close', 'ic-s')));
    el.replaceChildren(h('div', Object.assign({ class: 'rq-p', onclick: () => (lib ? go(itemHash(lib)) : openSeerrInfo({ id: md.tmdbId, mediaType: r.mt })) }, bg(r.poster))),
      h('div', { class: 'rq-main' }, h('div', { class: 'rq-t' }, h('b', { class: 'ell' }, r.title || '…'), r.year ? h('span', {}, '(' + r.year + ')') : null, h('i', { class: 'rq-type' }, r.mt === 'tv' ? t('rxShow') : t('rxFilm'))), h('div', { class: 'rq-sub' }, meta), steps, prog, hint && r.stage !== 'declined' ? h('small', { class: 'rq-hint' }, t(hint)) : null),
      h('div', { class: 'rq-acts' }, acts));
  }
  function mk(q) {
    const md = q.media || {}; const mt = (md.mediaType || q.type) === 'tv' ? 'tv' : 'movie'; md.mediaType = mt; const qi = hasArr ? rxQueueFor(md, queue) : null;
    const r = { q, mt, qi, stage: rxStage(q, qi), who: (q.requestedBy && (q.requestedBy.displayName || q.requestedBy.jellyfinUsername || q.requestedBy.username)) || '', el: h('div', { class: 'rq-row' }), title: '', year: '', poster: '' };
    paint(r); return r;
  }
  async function fillMeta(list_) { let i = 0; const worker = async () => { while (i < list_.length) { const r = list_[i++]; try { const m = await reqMeta(r.q.media); r.title = m.title || m.name || '#' + r.q.media.tmdbId; r.year = (m.releaseDate || m.firstAirDate || '').slice(0, 4); r.poster = TM(m.posterPath, 'w185'); paint(r); } catch (e) { } } }; await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]); if (st.q || st.sort === 'title') apply(); }
  async function fetchPage(skip) { const r = await seerrGet('/request', { take: 100, skip, filter: 'all', sort: 'added' }); total = (r.pageInfo && r.pageInfo.results) || (r.results || []).length; return r.results || []; }
  async function reload() {
    list.replaceChildren(h('div', { class: 'spinner', style: 'margin:50px auto' }));
    try { [queue] = await Promise.all([hasArr ? cget('/arr/queue').catch(() => []) : [], null]); const res = await fetchPage(0); rows = res.map(mk); } catch (e) { list.replaceChildren(h('div', { class: 'nf-empty' }, t('noRes'))); return; }
    drawTiles(); drawQueueBox(); apply(); moreB.hidden = rows.length >= total; fillMeta(rows);
  }
  moreB.onclick = async () => { moreB.disabled = true; const res = await fetchPage(rows.length); const add = res.map(mk); rows.push(...add); drawTiles(); apply(); moreB.hidden = rows.length >= total; moreB.disabled = false; fillMeta(add); };
  /* refresh the download numbers while the page is open */
  async function tick() {
    if (!wrap.isConnected) { clearInterval(timer); return; } if (document.hidden || !hasArr) return;
    let nq; try { nq = await cget('/arr/queue'); } catch (e) { return; } const before = rows.filter(r => r.qi).length; queue = nq;
    rows.forEach(r => { if (r.stage === 'declined' || r.stage === 'available' || r.stage === 'pending') return; const qi = rxQueueFor(r.q.media, queue); const ns = rxStage(r.q, qi); r.qi = qi; r.stage = ns; paint(r); });
    drawQueueBox(); drawTiles(); if (before && !queue.length) { resetSeerrCache(); reload(); }
  }
  timer = setInterval(tick, 15000); await reload();
}
