/* ---------- music discovery through Aurral: tracks marked as "not in library" ---------- */
const norm = s => String(s || '').toLowerCase().replace(/\(.*?\)|\[.*?\]|feat\..*|ft\..*|- .*remaster.*|radio edit/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
let myTracksP = null;
const myTracks = () => myTracksP || (myTracksP = items({ IncludeItemTypes: 'Audio', Fields: AUD_F + ',Album', Limit: 30000, EnableImageTypes: 'Primary' }).then(r => { const m = {}; r.Items.forEach(i => { const a = norm((i.ArtistItems && i.ArtistItems[0] && i.ArtistItems[0].Name) || (i.Artists || [])[0] || i.AlbumArtist); m[norm(i.Name) + '|' + a] = i; (m['t|' + norm(i.Name)] = m['t|' + norm(i.Name)] || i); }); return m; }).catch(() => ({})));
const resetMyTracks = () => { myTracksP = null; };
const extImg = u => (u && /^https?:/.test(u)) ? u : '';
const apreview = p => !p ? null : /^https?:/.test(p) ? p : p;
const caaImg = id => id ? 'https://coverartarchive.org/release-group/' + id + '/front-250' : '';
async function toTrackItems(list) {
  const mine = await myTracks();
  return list.map((x, i) => {
    const name = x.trackName || x.title || x.name || '?', artist = x.artistName || '', album = x.albumName || x.album || '';
    const own = mine[norm(name) + '|' + norm(artist)];
    if (own) return own;
    return { Id: 'x' + (x.trackMbid || x.mbid || x.id || i) + '-' + i, Name: name, Type: 'Audio', _ext: true, _tr: x, _preview: apreview(x.preview_url), _img: extImg(x.artworkUrl) || caaImg(x.releaseGroupMbid), Artists: [artist], ArtistItems: [], AlbumArtist: artist, Album: album, RunTimeTicks: (x.durationMs || x.length || 0) * 1e4, UserData: {}, IndexNumber: x.trackNumber };
  });
}
async function requestExtTrack(it) {
  const x = it._tr || {};
  try {
    if (x.trackMbid || x.mbid) { await apost('/api/library/downloads/track', { trackMbid: x.trackMbid || x.mbid }); }
    else {
      const r = await aget('/api/search', { q: (x.artistName || '') + ' ' + (x.albumName || x.trackName || ''), scope: 'album', limit: 3 });
      const a = aList(r)[0]; if (!a) throw new Error(t('noRes')); await requestAurral(a, 'album');
    }
    toast('✓ ' + t('requested'));
  } catch (e) { toast('⚠ ' + ((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.message || e.statusText || 'error')); }
}

async function mDiscover(n) {
  n.append(h('div', { class: 'sp-greet' }, t('discoverMusic')));
  if (!aurralOn()) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
  const [ed, dis] = await Promise.all([aget('/api/discover/editorial').catch(() => null), aget('/api/discover').catch(() => null)]);
  const ptile = p => tile({ name: p.name, sub: (p.trackCount ? p.trackCount + ' ' + t('songsN') + ' · ' : '') + (p.curator || ''), img: extImg(p.artworkUrl), href: '#/c/music/disc/' + p.id });
  (ed && ed.forYou && ed.forYou.length) && n.append(shelf(t('forYou'), ed.forYou.map(ptile)));
  ((ed && ed.genres) || []).slice(0, 8).forEach(g => { if (g.playlists && g.playlists.length) n.append(shelf(g.name, g.playlists.slice(0, 12).map(ptile))); });
  if (dis) { const rec = (dis.recommendations || []); if (rec.length) n.append(shelf(t('discoverMusic'), rec.slice(0, 16).map(o => aurralTile(o, 'artist')))); const gt = dis.globalTop || []; if (gt.length) n.append(shelf(t('globalTopArtists'), gt.slice(0, 16).map(o => aurralTile(o, 'artist')))); }
}
async function mDisc(n, id) {
  const p = await aget('/api/discover/editorial/' + id);
  pageHead(n, { type: t('playlist') + ' · ' + t('notOwnedMix'), title: p.name, img: extImg(p.artworkUrl), meta: [p.curator || '', (p.tracks || []).length + ' ' + t('songsN')] });
  const tracks = await toTrackItems(p.tracks || []);
  const ctx = { id: 'disc-' + id, number: 'idx' };
  n.append(actionsBar(tracks.filter(x => x._preview || !x._ext), ctx), trackList(tracks, ctx));
  if (p.description) n.append(h('p', { style: 'color:#b3b3b3;margin-top:18px;max-width:780px' }, p.description));
}
async function mExtAlbum(n, id, q) {
  const [tr] = await Promise.all([aget('/api/artists/release-group/' + id + '/tracks')]);
  const title = q.get('t') || '', artist = q.get('a') || '';
  pageHead(n, { type: t('album1') + ' · ' + t('notOwnedMix'), title, img: caaImg(id), meta: [artist, (tr || []).length + ' ' + t('songsN')] });
  const tracks = await toTrackItems((tr || []).map(x => Object.assign({ artistName: artist, albumName: title, durationMs: x.length }, x)));
  const ctx = { id: 'ext-' + id, noAlbum: true, noCover: true };
  const reqBtn = h('button', { class: 'sp-pillbtn', onclick: async () => { try { await requestAurral({ id, title, artistName: artist }, 'album'); toast('✓ ' + t('requested')); } catch (e) { toast('⚠ ' + ((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.statusText || 'error')); } } }, t('requestAlbum'));
  n.append(actionsBar(tracks.filter(x => x._preview || !x._ext), ctx, reqBtn), trackList(tracks, ctx));
}
/* artist page: releases the library does not have yet */
async function aurralArtistExtras(n, ar) {
  if (!aurralOn()) return;
  const mb = (ar.ProviderIds || {}).MusicBrainzArtist; if (!mb) return;
  try {
    const [a, lib] = await Promise.all([aget('/api/artists/' + mb), loadLibrary()]);
    const mine = new Set(lib.albums.filter(x => (x.ArtistItems || []).some(y => y.Id === ar.Id) || x.AlbumArtist === ar.Name).map(x => norm(x.Name)));
    const rgs = (a['release-groups'] || []).filter(g => ['Album', 'EP', 'Single'].includes(g['primary-type']) && !(g['secondary-types'] || []).length && !mine.has(norm(g.title)));
    rgs.sort((x, y) => String(y['first-release-date'] || '').localeCompare(String(x['first-release-date'] || '')));
    if (!rgs.length) return;
    const tiles = rgs.slice(0, 24).map(g => { const el = tile({ name: g.title, sub: String(g['first-release-date'] || '').slice(0, 4) + ' · ' + t('notOwned'), img: caaImg(g.id), href: '#/c/music/ext/' + g.id + '?t=' + encodeURIComponent(g.title) + '&a=' + encodeURIComponent(ar.Name) }); el.classList.add('notown-tile'); const rq = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); try { await requestAurral({ id: g.id, title: g.title, artistName: ar.Name, artistMbid: mb }, 'album'); toast('✓ ' + t('requested')); } catch (er) { toast('⚠ ' + ((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus')); el.append(rq); return el; });
    n.append(shelf(t('notInLib'), tiles));
  } catch (e) { console.warn('[cinema] artist extras', e); }
}

Object.assign(TX.en, { mdl: 'Downloads', mdlTitle: 'Download queue', mdlEmpty: 'Nothing is downloading right now.', mdlHint: 'Requested music shows up here while it is fetched.', popMissing: 'Popular · not in your library', songRequests: 'Songs you can request', reqSong: 'Request' });
Object.assign(TX.de, { mdl: 'Downloads', mdlTitle: 'Download-Warteschlange', mdlEmpty: 'Gerade wird nichts heruntergeladen.', mdlHint: 'Angefragte Musik erscheint hier, solange sie geladen wird.', popMissing: 'Beliebt · nicht in deiner Bibliothek', songRequests: 'Songs zum Anfragen', reqSong: 'Anfragen' });
/* Aurral / Lidarr download queue */
async function mDownloads(n) {
  n.append(h('div', { class: 'sp-greet' }, t('mdlTitle')));
  if (!aurralOn()) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
  async function load() {
    let r; try { r = await aget('/api/library/downloads'); } catch (e) { r = []; }
    const list = Array.isArray(r) ? r : (r.items || r.downloads || r.queue || r.records || []);
    box.replaceChildren();
    if (!list.length) { box.append(h('div', { class: 'nf-empty' }, h('div', {}, t('mdlEmpty')), h('small', { style: 'opacity:.6' }, t('mdlHint')))); return; }
    list.forEach(x => {
      const title = x.title || x.albumName || x.album || x.name || x.trackName || '?', artist = x.artistName || x.artist || '', st = String(x.status || x.state || '').replace(/_/g, ' ');
      const pct = x.progress != null ? Math.round(x.progress > 1 ? x.progress : x.progress * 100) : x.percent != null ? Math.round(x.percent) : (x.size && x.sizeleft != null ? Math.round((1 - x.sizeleft / x.size) * 100) : null);
      box.append(h('div', { class: 'dl-row' }, h('div', Object.assign({ class: 'cv' }, bg(extImg(x.image || x.artworkUrl) || caaImg(x.releaseGroupMbid || x.albumMbid)))), h('div', { class: 'tx' }, h('b', { class: 'ell' }, title), h('span', { class: 'ell' }, [artist, st].filter(Boolean).join(' · ')), pct != null ? h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.max(2, pct) + '%' })) : null), pct != null ? h('em', {}, pct + '%') : null));
    });
  }
  const box = h('div', { class: 'dl-list' }); n.append(box); await load();
  const iv = setInterval(() => { if (!box.isConnected) clearInterval(iv); else load(); }, 8000);
}
/* songs of an artist the library does not have: popularity comes from the release listen counts */
async function aurralPopular(n, ar, popBox) {
  if (!aurralOn()) return; const mb = (ar.ProviderIds || {}).MusicBrainzArtist; if (!mb) return;
  try {
    const a = await aget('/api/artists/' + mb); const rgs = (a['release-groups'] || []).filter(g => ['Album', 'Single', 'EP'].includes(g['primary-type']) && !(g['secondary-types'] || []).length).sort((x, y) => (y.listenCount || 0) - (x.listenCount || 0)).slice(0, 6);
    const lists = await Promise.all(rgs.map(g => aget('/api/artists/release-group/' + g.id + '/tracks').then(tr => (tr || []).map((x, i) => Object.assign({ artistName: ar.Name, albumName: g.title, durationMs: x.length, releaseGroupMbid: g.id, _score: (g.listenCount || 1) / (1 + i * .6) }, x))).catch(() => [])));
    const seen = new Set(); const flat = lists.flat().sort((x, y) => y._score - x._score).filter(x => { const k = norm(x.title || x.trackName || x.name); if (!k || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
    if (!flat.length) return;
    const its = await toTrackItems(flat); if (!popBox.isConnected) return;
    popBox.replaceChildren(trackList(its, { id: mb + '-pop', number: 'idx' })); $$('.sp-th', popBox).forEach(x => x.remove());
  } catch (e) { console.warn('[cinema] popular', e); }
}
/* request single songs: look inside the matching releases for tracks whose name matches the search */
async function aurralTrackSearch(node, q) {
  if (!aurralOn() || q.length < 2) return;
  const toks = norm(q).split(' ').filter(Boolean); if (!toks.length) return;
  try {
    const r = await aget('/api/search', { q, scope: 'album', limit: 6 }); const albums = aList(r).slice(0, 5);
    const lists = await Promise.all(albums.map(o => aget('/api/artists/release-group/' + o.id + '/tracks').then(tr => (tr || []).map(x => Object.assign({ artistName: o.artistName || (o.artist && (o.artist.name || o.artist)) || ((o['artist-credit'] || [])[0] || {}).name || '', albumName: o.title || o.name, durationMs: x.length, releaseGroupMbid: o.id }, x))).catch(() => [])));
    const seen = new Set(); const flat = lists.flat().filter(x => { const nm = norm(x.title || x.trackName || x.name), full = nm + ' ' + norm(x.artistName); if (!nm || seen.has(nm + '|' + norm(x.artistName))) return false; if (!toks.every(t_ => full.includes(t_))) return false; seen.add(nm + '|' + norm(x.artistName)); return true; });
    const its = (await toTrackItems(flat)).filter(x => x._ext).slice(0, 8); if (!its.length) return;
    const sec = h('section', {}, h('h2', {}, t('songRequests')), trackList(its, { id: 'req-' + q, number: 'idx' })); $$('.sp-th', sec).forEach(x => x.remove()); const res = node.querySelector('.sp-res'); if (res) res.after(sec); else node.append(sec);
  } catch (e) { console.warn('[cinema] track search', e); }
}
