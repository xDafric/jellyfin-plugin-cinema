/* ---------- Calendar with history: releases, downloads and what you watched ---------- */
Object.assign(TX.en, { cal_imported: 'Downloaded', cal_grabbed: 'Found', cal_failed: 'Failed', calLog: 'History', calMonth: 'Month', calRel: 'Releases', calDl: 'Downloads', calSeen: 'Watched', calImported: 'Downloaded', calGrab: 'Found', calFail: 'Failed', calDays: 'Last {n} days', calAll: 'All', calEmptyLog: 'Nothing happened in this time.', calMore: '{n} more', calEpisodes: '{n} episodes', calWatchedOn: 'Watched' });
Object.assign(TX.de, { cal_imported: 'Heruntergeladen', cal_grabbed: 'Gefunden', cal_failed: 'Fehlgeschlagen', calLog: 'Verlauf', calMonth: 'Monat', calRel: 'Erscheinungen', calDl: 'Downloads', calSeen: 'Gesehen', calImported: 'Heruntergeladen', calGrab: 'Gefunden', calFail: 'Fehlgeschlagen', calDays: 'Letzte {n} Tage', calAll: 'Alle', calEmptyLog: 'In dieser Zeit ist nichts passiert.', calMore: '{n} weitere', calEpisodes: '{n} Folgen', calWatchedOn: 'Gesehen' });
const calYmd = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const CAL_ICON = { imported: '↓', grabbed: '…', failed: '✕', seen: '✓' };
/* films you watched in a period, from Jellyfin and the Letterboxd diary */
async function calWatched(fromMs, toMs) {
  let all = []; try { all = await wrAll(); } catch (e) { }
  return all.filter(r => r.date >= fromMs && r.date < toMs).map(r => ({ kind: 'seen', date: new Date(r.date).toISOString(), title: r.it ? r.it.Name : r.lb.title, subtitle: r.lb && r.lb.rating ? '★ ' + Number(r.lb.rating).toFixed(1) + (r.lb.liked ? ' ♥' : '') : '', it: r.it, poster: r.it ? imgUrl(r.it, 'Primary', 120) : '' }));
}
async function calendarView(page) {
  const wrap = h('div', { class: 'nf-page-pad cal-page' }, h('h1', {}, t('calendar'))); page.append(wrap);
  if (!(plug().radarr || plug().sonarr)) { wrap.append(h('div', { class: 'nf-empty' }, t('arrOff'))); return; }
  const st = { mode: 'cal', rel: true, dl: true, seen: true, days: 30, f: 'all' }; let cur = new Date(); cur.setDate(1);
  const lm = await libMap(); const head = h('div', { class: 'cal-head' }); const layers = h('div', { class: 'cal-layers' }); const body = h('div', {});
  const histOn = cfg('calendarHistory'); if (!histOn) { st.dl = false; st.seen = false; }
  const modeSeg = h('div', { class: 'dc-segs' }, [['cal', t('calMonth')], ['log', t('calLog')]].filter(x => histOn || x[0] === 'cal').map(([v, l]) => h('button', { class: 'dc-seg' + (v === st.mode ? ' on' : ''), onclick: e => { st.mode = v; $$('.dc-seg', modeSeg).forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw(); } }, l)));
  wrap.append(h('div', { class: 'cal-top' }, modeSeg, layers), head, body);
  const lay = (k, label, cls) => h('button', { class: 'cal-lay ' + cls + (st[k] ? ' on' : ''), onclick: e => { st[k] = !st[k]; e.currentTarget.classList.toggle('on', st[k]); draw(); } }, h('i'), label);
  function drawLayers() { layers.replaceChildren(...(st.mode === 'cal' && histOn ? [lay('rel', t('calRel'), 'l-rel'), lay('dl', t('calDl'), 'l-dl'), lay('seen', t('calSeen'), 'l-seen')] : [])); }
  const evNode = e => { const own = e.tmdbId && lm[(e.source === 'radarr' ? 'movie' : 'tv') + ':' + e.tmdbId]; const have = e.kind === 'seen' ? 'seen' : e.kind === 'imported' || e.kind === 'grabbed' || e.kind === 'failed' ? 'h-' + e.kind : (e.hasFile || own ? 'have' : e.kind);
    return h('div', { class: 'cal-ev ' + have, title: (e.title || '') + (e.subtitle ? ' · ' + e.subtitle : ''), onclick: () => { if (e.it) go(itemHash(e.it)); else if (own) go(itemHash(own)); else if (e.tmdbId) openSeerrInfo({ id: e.tmdbId, mediaType: e.source === 'radarr' ? 'movie' : 'tv' }); } }, e.poster ? h('div', Object.assign({ class: 'p' }, bg(e.poster))) : null, h('span', { class: 'ell' }, e.title), h('small', { class: 'ell' }, e.subtitle || (e.kind === 'seen' ? t('calWatchedOn') : e.count > 1 ? t('calEpisodes').replace('{n}', e.count) : t('cal_' + e.kind) || ''))); };
  async function drawMonth() {
    const first = new Date(cur), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0); const start = new Date(first); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); const end = new Date(last); end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    head.replaceChildren(h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() - 1); draw(); } }, ic('left')), h('b', {}, cur.toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })), h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() + 1); draw(); } }, ic('right')), h('button', { class: 'btn grey', style: 'margin-left:auto', onclick: () => { cur = new Date(); cur.setDate(1); draw(); } }, t('today')));
    const grid = h('div', { class: 'cal-grid' }, h('div', { class: 'spinner', style: 'grid-column:1/-1' })); body.replaceChildren(grid);
    const s = calYmd(start), e = calYmd(end); const endMs = end.getTime() + 864e5;
    const [rel, hist, seen] = await Promise.all([st.rel ? cget('/arr/calendar', { start: s, end: e }).catch(() => []) : [], st.dl ? cget('/arr/history', { start: s, end: e }).catch(() => []) : [], st.seen ? calWatched(start.getTime(), endMs) : []]);
    const byDay = {}; const put = (k, o, ord) => { (byDay[k] = byDay[k] || []).push(Object.assign({ ord }, o)); };
    seen.forEach(x => put(calYmd(x.date), x, 0)); hist.forEach(x => put(calYmd(x.date), x, x.kind === 'failed' ? 1 : x.kind === 'imported' ? 2 : 3)); rel.forEach(x => { if (x.date) put(x.date.slice(0, 10), x, 4); });
    grid.replaceChildren(...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) => h('div', { class: 'cal-dow' }, L === 'de' ? d : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i])));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = calYmd(d); const cell = h('div', { class: 'cal-day' + (d.getMonth() !== cur.getMonth() ? ' other' : '') + (k === calYmd(new Date()) ? ' today' : '') }, h('span', { class: 'n' }, d.getDate()));
      const evs = (byDay[k] || []).sort((a, b) => a.ord - b.ord); evs.slice(0, 5).forEach(x => cell.append(evNode(x))); if (evs.length > 5) cell.append(h('small', { class: 'cal-more' }, t('calMore').replace('{n}', evs.length - 5))); grid.append(cell);
    }
  }
  async function drawLog() {
    const chips = h('div', { class: 'nf-seasons', style: 'margin:0' }, [30, 90, 365].map(n => h('button', { class: 'nf-chip' + (st.days === n ? ' on' : ''), onclick: e => { st.days = n; draw(); } }, t('calDays').replace('{n}', n))), [['all', t('calAll')], ['dl', t('calDl')], ['seen', t('calSeen')]].map(([v, l]) => h('button', { class: 'nf-chip' + (st.f === v ? ' on' : ''), style: v === 'all' ? 'margin-left:14px' : '', onclick: () => { st.f = v; draw(); } }, l)));
    head.replaceChildren(chips); body.replaceChildren(h('div', { class: 'spinner', style: 'margin:50px auto' }));
    const to = new Date(); const from = new Date(Date.now() - st.days * 864e5);
    const [hist, seen] = await Promise.all([st.f !== 'seen' ? cget('/arr/history', { start: calYmd(from), end: calYmd(to) }).catch(() => []) : [], st.f !== 'dl' ? calWatched(from.getTime(), to.getTime() + 864e5) : []]);
    const all = hist.concat(seen).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)); if (!all.length) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'padding:50px 0' }, t('calEmptyLog'))); return; }
    const byDay = new Map(); all.forEach(x => { const k = calYmd(x.date); (byDay.get(k) || byDay.set(k, []).get(k)).push(x); });
    const kindL = { imported: t('calImported'), grabbed: t('calGrab'), failed: t('calFail'), seen: t('calSeen') };
    body.replaceChildren(h('div', { class: 'cal-log' }, [...byDay.entries()].map(([k, evs]) => h('section', { class: 'cal-lg' }, h('h3', {}, new Date(k + 'T12:00:00').toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })), evs.map(x => { const own = x.tmdbId && lm[(x.source === 'radarr' ? 'movie' : 'tv') + ':' + x.tmdbId]; return h('div', { class: 'cal-li k-' + x.kind, onclick: () => { if (x.it) go(itemHash(x.it)); else if (own) go(itemHash(own)); else if (x.tmdbId) openSeerrInfo({ id: x.tmdbId, mediaType: x.source === 'radarr' ? 'movie' : 'tv' }); } }, h('span', { class: 'cal-lic' }, CAL_ICON[x.kind]), x.poster ? h('div', Object.assign({ class: 'cal-lip' }, bg(x.poster))) : h('div', { class: 'cal-lip' }), h('div', {}, h('b', { class: 'ell' }, x.title), h('span', {}, [kindL[x.kind], x.count > 1 ? t('calEpisodes').replace('{n}', x.count) : x.subtitle, x.quality, x.source === 'radarr' ? 'Radarr' : x.source === 'sonarr' ? 'Sonarr' : ''].filter(Boolean).join(' · '))), h('time', {}, new Date(x.date).toLocaleTimeString(L === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' }))); })))));
  }
  function draw() { drawLayers(); return st.mode === 'cal' ? drawMonth() : drawLog(); }
  draw();
}
