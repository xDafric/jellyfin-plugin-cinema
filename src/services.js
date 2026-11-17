/* ---------- Cinema plugin services: Seerr modal, Radarr/Sonarr queue + calendar, Aurral music ---------- */
const plug = () => C.status || {};
const aurralOn = () => !!(C.status && C.status.aurral) && cfg('musicDiscovery');
const aurralReq = () => aurralOn() && cfg('musicRequests');
const usePluginSeerr = () => !!plug().seerr;
const cget = (path, params) => Promise.resolve(HID.on ? null : hxReady()).then(() => api('Cinema' + path, params)).then(d => hxSeerr(d));
async function cpost(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema' + path), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' }); }
async function loadStatus() { try { C.status = await api('Cinema/status'); if (C.status.seerr) SEERR = 'Cinema/seerr'; } catch (e) { C.status = null; } }

/* ----- Seerr details + request modal (own UI, no Jellyfin Enhanced needed) ----- */
function closeModal(m) { m.remove(); }
async function seerrModal(x) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie';
  const bgEl = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === bgEl) closeModal(bgEl); } }); const box = h('div', { class: 'sr-modal' }, h('div', { class: 'spinner', style: 'margin:80px auto' })); bgEl.append(box); getUI().append(bgEl);
  let d; try { d = await seerrGet('/' + mt + '/' + x.id); } catch (e) { box.replaceChildren(h('div', { class: 'nf-empty' }, e.message)); return; }
  const admin = !!((await me()).Policy || {}).IsAdministrator;
  const lm = await libMap(), rm = await reqMap(); d.mediaType = mt; d.id = x.id; const st = dStatus(Object.assign({}, d, { mediaType: mt, id: x.id, mediaInfo: d.mediaInfo }), lm, rm);
  const title = d.title || d.name; const year = (d.releaseDate || d.firstAirDate || '').slice(0, 4);
  const crew = (d.credits && d.credits.crew) || []; const cast = ((d.credits && d.credits.cast) || []).slice(0, 18);
  const names = jobs => [...new Set(crew.filter(c => jobs.includes(c.job)).map(c => c.name))].slice(0, 3).join(', ');
  const seasons = (d.seasons || []).filter(s => s.seasonNumber > 0); const picked = new Set(seasons.map(s => s.seasonNumber));
  const have = new Set(((d.mediaInfo && d.mediaInfo.seasons) || []).filter(s => s.status >= 2).map(s => s.seasonNumber)); have.forEach(n => picked.delete(n));
  const money = n => n ? '$' + (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + ' Mio.' : n.toLocaleString()) : '';
  const lang = (d.spokenLanguages || []).find(l => l.iso_639_1 === d.originalLanguage); const trailer = (d.relatedVideos || []).find(v => v.site === 'YouTube' && v.type === 'Trailer') || (d.relatedVideos || []).find(v => v.site === 'YouTube');
  const runtime = d.runtime || (d.episodeRunTime && d.episodeRunTime[0]);
  const facts = [[t('factDirector'), names(['Director'])], [t('factWriter'), names(['Screenplay', 'Writer', 'Story', 'Creator'])], [t('factStatus'), d.status], [t('factLang'), lang ? (lang.name || lang.english_name) : d.originalLanguage], [t('factRuntime'), runtime ? runtime + ' ' + t('min') : ''], [t('factBudget'), money(d.budget)], [t('factRevenue'), money(d.revenue)], [t('factStudio'), (d.productionCompanies || []).slice(0, 3).map(c => c.name).join(', ')], [t('factNetwork'), (d.networks || []).slice(0, 3).map(c => c.name).join(', ')], [t('factSeasons'), mt === 'tv' && d.numberOfSeasons ? d.numberOfSeasons + ' · ' + (d.numberOfEpisodes || '') + ' ' + t('episodes') : '']].filter(f => f[1]);
  const status = h('div', { class: 'sr-status' }); lbArchBadges(Object.assign({}, d, { mediaType: mt, id: x.id })).forEach(b => status.append(b));
  const adv = { serverId: null, profileId: null, rootFolder: null };
  const btn = h('button', { class: 'btn white' }, ic('plus'), t('request'));
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = '…';
    try { const body = { mediaType: mt, mediaId: x.id }; if (mt === 'tv') body.seasons = [...picked]; if (adv.serverId != null) body.serverId = adv.serverId; if (adv.profileId != null) body.profileId = adv.profileId; if (adv.rootFolder) body.rootFolder = adv.rootFolder; await cpostSeerr('/request', body); toast(t('requested')); resetSeerrCache(); closeModal(bgEl); }
    catch (e) { toast(((e.responseJSON && e.responseJSON.message) || e.statusText || 'error')); btn.disabled = false; btn.replaceChildren(ic('plus'), t('request')); }
  };
  if (st.k === 'own') { status.append(h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib'))); if (st.item) btn.replaceWith(h('button', { class: 'btn white', onclick: () => { closeModal(bgEl); playVideo(st.item); } }, ic('play'), t('play'))); else btn.remove(); }
  else if (st.k === 'req' && mt === 'movie') { status.append(h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested'))); btn.remove(); }
  const seasonBox = mt === 'tv' && seasons.length ? h('div', { class: 'sr-seasons' }, seasons.map(s => h('label', { class: 'nf-chip' + (have.has(s.seasonNumber) ? ' dis' : picked.has(s.seasonNumber) ? ' on' : ''), onclick: e => { e.preventDefault(); if (have.has(s.seasonNumber)) return; picked.has(s.seasonNumber) ? picked.delete(s.seasonNumber) : picked.add(s.seasonNumber); e.currentTarget.classList.toggle('on'); } }, (L === 'de' ? 'Staffel ' : 'Season ') + s.seasonNumber + (s.episodeCount ? ' · ' + s.episodeCount : '') + (have.has(s.seasonNumber) ? ' ' : '')))) : null;
  const ratings = h('div', { class: 'rt-row' });
  seerrGet('/' + mt + '/' + x.id + (mt === 'movie' ? '/ratingscombined' : '/ratings')).then(r => { const rt = r.rt || r; const im = r.imdb; if (rt && rt.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null)); if (im && im.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore))); }).catch(() => { });
  if (d.voteAverage) ratings.append(h('span', { class: 'rt-chip' }, 'TMDB ', h('b', {}, d.voteAverage.toFixed(1)), d.voteCount ? h('small', {}, (d.voteCount / 1000).toFixed(1) + 'k') : null));
  /* request options for admins: server, quality profile, folder */
  const advBox = h('details', { class: 'sr-adv' }, h('summary', {}, t('reqAdvanced')));
  if (admin && st.k === 'none') {
    const kind = mt === 'movie' ? 'radarr' : 'sonarr';
    seerrGet('/service/' + kind).then(async servers => {
      const list = (servers || []).filter(s => !s.is4k); if (!list.length) { advBox.remove(); return; }
      const def = list.find(s => s.isDefault) || list[0]; const sel = (label, key) => { const el = h('select', { onchange: e => { adv[key] = key === 'rootFolder' ? e.target.value : (e.target.value === '' ? null : +e.target.value); } }); return { el, row: h('div', { class: 'sr-opt' }, h('label', {}, label), el) }; };
      const sv = sel(t('reqServer'), 'serverId'), pf = sel(t('reqProfile'), 'profileId'), fo = sel(t('reqFolder'), 'rootFolder');
      list.forEach(s => sv.el.append(h('option', { value: s.id, selected: s.id === def.id }, s.name)));
      const fill = async id => { adv.serverId = id; try { const det = await seerrGet('/service/' + kind + '/' + id); pf.el.replaceChildren(...(det.profiles || []).map(p => h('option', { value: p.id, selected: p.id === def.activeProfileId }, p.name))); fo.el.replaceChildren(...(det.rootFolders || []).map(f => h('option', { value: f.path, selected: f.path === def.activeDirectory }, f.path))); adv.profileId = pf.el.value ? +pf.el.value : null; adv.rootFolder = fo.el.value || null; } catch (e) { } };
      sv.el.onchange = e => fill(+e.target.value); await fill(def.id); advBox.append(h('div', { class: 'sr-opts' }, sv.row, pf.row, fo.row));
    }).catch(() => advBox.remove());
  } else advBox.remove();
  const poster = TM(d.posterPath, 'w500');
  box.replaceChildren(
    h('div', Object.assign({ class: 'sr-hero' }, bg(TM(d.backdropPath, 'w1280'))), h('button', { class: 'sr-close', onclick: () => closeModal(bgEl), 'aria-label': 'Close' }, ic('close'))),
    h('div', { class: 'sr-body' },
      h('div', { class: 'sr-top' }, poster ? h('div', Object.assign({ class: 'sr-poster' }, bg(poster))) : null,
        h('div', { class: 'sr-head' }, h('h2', {}, title, year ? h('span', {}, ' (' + year + ')') : null), d.tagline ? h('p', { class: 'nf-tagline' }, d.tagline) : null,
          h('div', { class: 'nf-meta' }, (d.genres || []).slice(0, 4).map(g => h('span', {}, g.name)), runtime ? h('span', {}, runtime + ' ' + t('min')) : null),
          ratings, status,
          h('div', { class: 'nf-btns', style: 'margin-top:14px' }, btn, trailer ? h('a', { class: 'btn grey', href: 'https://www.youtube.com/watch?v=' + trailer.key, target: '_blank', rel: 'noopener' }, ic('film'), t('watchTrailer')) : null, h('button', { class: 'btn grey', onclick: () => closeModal(bgEl) }, t('close'))))),
      h('p', { class: 'sr-ov' }, d.overview || ''), seasonBox, advBox,
      facts.length ? h('dl', { class: 'nf-facts sr-facts' }, facts.map(f => [h('dt', {}, f[0]), h('dd', {}, f[1])])) : null,
      cast.length ? h('div', { class: 'sr-castw' }, h('h3', {}, t('moreCast')), h('div', { class: 'sr-cast2' }, cast.map(c => h('div', { class: 'sr-p' }, h('div', Object.assign({ class: 'pi' }, bg(c.profilePath ? TM(c.profilePath, 'w185') : ''))), h('b', {}, c.name), h('small', {}, c.character || '')))) ) : null));
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
  if (!aurralReq()) { el.onclick = null; el.addEventListener('click', e => e.preventDefault()); return el; }
  const btn = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); btn.classList.add('busy'); try { await requestAurral(o, kind); toast(t('requested')); } catch (er) { toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } btn.classList.remove('busy'); } }, ic('plus'));
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
