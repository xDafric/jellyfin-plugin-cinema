/* ---------- Cinema plugin services: Seerr modal, Radarr/Sonarr queue + calendar, Aurral music ---------- */
const plug = () => C.status || {};
const aurralOn = () => !!(C.status && C.status.aurral) && feat('musicDiscovery');
const usePluginSeerr = () => !!plug().seerr;
const cget = (path, params) => api('Cinema' + path, params);
async function cpost(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema' + path), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' }); }
async function loadStatus() { try { C.status = await api('Cinema/status'); if (C.status.seerr) SEERR = 'Cinema/seerr'; } catch (e) { C.status = null; } }

/* ----- Seerr details + request modal (own UI, no Jellyfin Enhanced needed) ----- */
function closeModal(m) { m.remove(); }
async function seerrModal(x) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie';
  const bgEl = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === bgEl) closeModal(bgEl); } }); const box = h('div', { class: 'sr-modal' }, h('div', { class: 'spinner', style: 'margin:60px auto' })); bgEl.append(box); getUI().append(bgEl);
  let d; try { d = await seerrGet('/' + mt + '/' + x.id); } catch (e) { box.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + e.message)); return; }
  const lm = await libMap(), rm = await reqMap(); d.mediaType = mt; d.id = x.id; const st = dStatus(Object.assign({}, d, { mediaType: mt, id: x.id, mediaInfo: d.mediaInfo }), lm, rm);
  const title = d.title || d.name; const year = (d.releaseDate || d.firstAirDate || '').slice(0, 4);
  const cast = ((d.credits && d.credits.cast) || []).slice(0, 10);
  const seasons = (d.seasons || []).filter(s => s.seasonNumber > 0); const picked = new Set(seasons.map(s => s.seasonNumber));
  const have = new Set(((d.mediaInfo && d.mediaInfo.seasons) || []).filter(s => s.status >= 2).map(s => s.seasonNumber)); have.forEach(n => picked.delete(n));
  const status = h('div', { class: 'sr-status' });
  const btn = h('button', { class: 'btn white' }, ic('plus'), t('request'));
  const upd = () => { btn.disabled = false; };
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = '…';
    try { const body = { mediaType: mt, mediaId: x.id }; if (mt === 'tv') body.seasons = [...picked]; await cpostSeerr('/request', body); toast('✓ ' + t('requested')); resetSeerrCache(); closeModal(bgEl); }
    catch (e) { toast('⚠ ' + ((e.responseJSON && e.responseJSON.message) || e.statusText || 'error')); btn.disabled = false; btn.replaceChildren(ic('plus'), t('request')); }
  };
  if (st.k === 'own') { status.append(h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib'))); if (st.item) btn.replaceWith(h('button', { class: 'btn white', onclick: () => { closeModal(bgEl); playVideo(st.item); } }, ic('play'), t('play'))); else btn.remove(); }
  else if (st.k === 'req' && mt === 'movie') { status.append(h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested'))); btn.remove(); }
  const seasonBox = mt === 'tv' ? h('div', { class: 'sr-seasons' }, seasons.map(s => h('label', { class: 'nf-chip' + (have.has(s.seasonNumber) ? ' dis' : picked.has(s.seasonNumber) ? ' on' : ''), onclick: e => { e.preventDefault(); if (have.has(s.seasonNumber)) return; picked.has(s.seasonNumber) ? picked.delete(s.seasonNumber) : picked.add(s.seasonNumber); e.currentTarget.classList.toggle('on'); } }, (L === 'de' ? 'Staffel ' : 'Season ') + s.seasonNumber + (have.has(s.seasonNumber) ? ' ✓' : '')))) : null;
  box.replaceChildren(
    h('div', Object.assign({ class: 'sr-hero' }, bg(TM(d.backdropPath, 'w1280'))), h('button', { class: 'sr-close', onclick: () => closeModal(bgEl), 'aria-label': 'Close' }, ic('close'))),
    h('div', { class: 'sr-body' }, h('h2', {}, title), h('div', { class: 'nf-meta' }, d.voteAverage ? h('span', { class: 'match' }, Math.round(d.voteAverage * 10) + '%') : null, year ? h('span', {}, year) : null, d.runtime ? h('span', {}, d.runtime + ' ' + t('min')) : null, (d.genres || []).slice(0, 3).map(g => h('span', {}, g.name))),
      status, h('p', { class: 'sr-ov' }, d.overview || ''), seasonBox, cast.length ? h('div', { class: 'sr-cast' }, cast.map(c => h('span', {}, c.name))) : null,
      h('div', { class: 'nf-btns', style: 'margin-top:18px' }, btn, h('button', { class: 'btn grey', onclick: () => closeModal(bgEl) }, t('close')))));
}
function cpostSeerr(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + path), data: JSON.stringify(body), contentType: 'application/json', dataType: 'json' }); }

/* ----- Radarr / Sonarr: download queue + release calendar ----- */
async function queueSection(container) {
  if (!(plug().radarr || plug().sonarr)) return;
  let q = []; try { q = await cget('/arr/queue'); } catch (e) { return; }
  const box = h('section', { class: 'dl-box' }, h('h2', {}, t('downloads') + ' (' + q.length + ')'));
  if (!q.length) { box.append(h('div', { class: 'set-hint' }, t('noDownloads'))); (container.querySelector('h1') || { after: x => container.prepend(x) }).after(box); return; }
  q.forEach(i => box.append(h('div', { class: 'dl-row' }, h('div', { class: 'dl-t' }, h('b', { class: 'ell' }, i.title || '?'), i.subtitle ? h('span', { class: 'ell' }, i.subtitle) : null, h('span', {}, [i.source, i.client, i.timeleft].filter(Boolean).join(' · '))), h('div', { class: 'dl-p' }, h('div', { class: 'prog' }, h('i', { style: 'width:' + (i.progress || 0) + '%' })), h('b', {}, Math.round(i.progress || 0) + '%')))));
  (container.querySelector('h1') || { after: x => container.prepend(x) }).after(box);
}
async function calendarView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('calendar'))); page.append(wrap);
  if (!(plug().radarr || plug().sonarr)) { wrap.append(h('div', { class: 'nf-empty' }, t('arrOff'))); return; }
  let cur = new Date(); cur.setDate(1);
  const head = h('div', { class: 'cal-head' }); const grid = h('div', { class: 'cal-grid' }); wrap.append(head, grid);
  const lm = await libMap();
  async function draw() {
    const first = new Date(cur), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const start = new Date(first); const dow = (start.getDay() + 6) % 7; start.setDate(start.getDate() - dow);
    const end = new Date(last); end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    head.replaceChildren(h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() - 1); draw(); } }, ic('left')), h('b', {}, cur.toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })), h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() + 1); draw(); } }, ic('right')), h('button', { class: 'btn grey', style: 'margin-left:auto', onclick: () => { cur = new Date(); cur.setDate(1); draw(); } }, t('today')));
    grid.replaceChildren(h('div', { class: 'spinner', style: 'grid-column:1/-1' }));
    let ev = []; try { ev = await cget('/arr/calendar', { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }); } catch (e) { }
    const byDay = {}; ev.forEach(e => { if (!e.date) return; const k = e.date.slice(0, 10); (byDay[k] = byDay[k] || []).push(e); });
    grid.replaceChildren(...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) => h('div', { class: 'cal-dow' }, L === 'de' ? d : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i])));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const cell = h('div', { class: 'cal-day' + (d.getMonth() !== cur.getMonth() ? ' other' : '') + (k === new Date().toISOString().slice(0, 10) ? ' today' : '') }, h('span', { class: 'n' }, d.getDate()));
      (byDay[k] || []).slice(0, 6).forEach(e => {
        const own = lm[(e.source === 'radarr' ? 'movie' : 'tv') + ':' + e.tmdbId];
        cell.append(h('div', { class: 'cal-ev ' + (e.hasFile || own ? 'have' : e.kind), title: (e.title || '') + (e.subtitle ? ' · ' + e.subtitle : ''), onclick: () => { if (own) go(itemHash(own)); else if (e.tmdbId) openSeerrInfo({ id: e.tmdbId, mediaType: e.source === 'radarr' ? 'movie' : 'tv' }); } }, e.poster ? h('div', Object.assign({ class: 'p' }, bg(e.poster))) : null, h('span', { class: 'ell' }, e.title), h('small', { class: 'ell' }, e.subtitle || t('cal_' + e.kind))));
      });
      grid.append(cell);
    }
  }
  draw();
}

/* ----- Aurral: music search + requests ----- */
const aget = (path, params) => api('Cinema/aurral/' + path.replace(/^\//, ''), params);
const apost = (path, body) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/aurral/' + path.replace(/^\//, '')), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' });
const pk = (o, keys) => { for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k]; return null; };
const aList = r => Array.isArray(r) ? r : (r && (r.results || r.items || r.artists || r.albums || r.data)) || [];
const aName = o => pk(o, ['name', 'artistName', 'title', 'albumName']) || '?';
const aImg = o => { const u = pk(o, ['image', 'imageUrl', 'cover', 'coverUrl', 'thumbnail', 'artwork', 'picture']); return typeof u === 'string' ? (u.startsWith('http') ? u : '') : ''; };
function aurralTile(o, kind) {
  const name = aName(o); const sub = kind === 'artist' ? t('artist') : [pk(o, ['artistName', 'artist']) || '', pk(o, ['year', 'releaseYear']) || String(o.releaseDate || '').slice(0, 4)].filter(Boolean).join(' · ');
  const el = tile({ name, sub: sub + ' · ' + t('notOwned'), img: aImg(o), round: kind === 'artist', href: '#', play: null });
  const btn = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); btn.classList.add('busy'); try { await requestAurral(o, kind); toast('✓ ' + t('requested')); } catch (er) { toast('⚠ ' + ((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } btn.classList.remove('busy'); } }, ic('plus'));
  el.append(btn); el.onclick = null; el.addEventListener('click', e => e.preventDefault()); return el;
}
async function requestAurral(o, kind) {
  const mbid = pk(o, ['mbid', 'id', 'foreignArtistId', 'foreignAlbumId', 'releaseGroupMbid']);
  if (kind === 'album') return apost('/api/library/albums/request', Object.assign({}, o, { mbid }));
  return apost('/api/library/artists', Object.assign({}, o, { mbid, artistName: aName(o) }));
}
async function aurralSearchShelves(node, q) {
  if (!aurralOn()) return;
  try {
    const [ar, al] = await Promise.all([aget('/api/search', { q, scope: 'artist', limit: 10 }).catch(() => null), aget('/api/search', { q, scope: 'album', limit: 10 }).catch(() => null)]);
    let a = aList(ar); const b = aList(al);
    if (!a.length && b.length) { const seen = new Set(); b.forEach(x => { const id = x.artistMbid; if (id && !seen.has(id)) { seen.add(id); a.push({ type: 'artist', id, name: x.artistName }); } }); }
    if (a.length) node.append(shelf(t('musicRequestArtists'), a.map(o => aurralTile(o, 'artist'))));
    if (b.length) node.append(shelf(t('musicRequestAlbums'), b.map(o => aurralTile(o, 'album'))));
  } catch (e) { }
}
async function aurralDiscoverShelves(node) {
  if (!aurralOn()) return;
  try {
    const r = await aget('/api/discover');
    const lists = [['recommendations', t('discoverMusic')], ['globalTop', t('globalTopArtists')]];
    for (const [key, title] of lists) {
      const arr = Array.isArray(r[key]) ? r[key] : []; if (!arr.length) continue;
      node.append(shelf(title, arr.slice(0, 16).map(o => aurralTile(o, /album/i.test(o.type || '') ? 'album' : 'artist'))));
    }
  } catch (e) { }
}
