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
  if (!plug().aurral) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
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
  if (!plug().aurral) return;
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
