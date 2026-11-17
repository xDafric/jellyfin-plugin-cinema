/* ---------- music: artist pictures and popularity from Deezer (via the server), merged discography, missing songs, skeletons ---------- */
Object.assign(TX.en, { showMoreSongs: 'Show all songs', showFewer: 'Show fewer', missingSongs: 'Songs you do not have yet', songsOf: '{a} of {b} songs', reqAll: 'Request missing songs', requestedOk: 'Requested' });
Object.assign(TX.de, { showMoreSongs: 'Alle Songs anzeigen', showFewer: 'Weniger anzeigen', missingSongs: 'Songs, die dir noch fehlen', songsOf: '{a} von {b} Titeln', reqAll: 'Fehlende Songs anfragen', requestedOk: 'Angefragt' });

const DZ = { art: new Map(), top: new Map(), alb: new Map(), rg: new Map() };
const dz = (path, params) => cget('/music/deezer', Object.assign({ path }, params || {})).catch(() => ({}));
function dzArtist(name) {
  const k = norm(name); if (!k) return Promise.resolve(null); if (DZ.art.has(k)) return DZ.art.get(k);
  const p = dz('search/artist', { q: name, limit: 5 }).then(r => { const l = (r && r.data) || []; const hit = l.find(x => norm(x.name) === k) || l[0]; return hit ? { id: hit.id, name: hit.name, img: hit.picture_big || hit.picture_medium || '' } : null; });
  DZ.art.set(k, p); return p;
}
function dzAlbumCover(artist, title) {
  const k = norm(artist) + '|' + norm(title); if (DZ.alb.has(k)) return DZ.alb.get(k);
  const p = dz('search/album', { q: artist + ' ' + title, limit: 6 }).then(r => { const l = (r && r.data) || []; const hit = l.find(x => norm(x.title) === norm(title) && norm((x.artist || {}).name) === norm(artist)) || l.find(x => norm(x.title) === norm(title)); return hit ? (hit.cover_big || hit.cover_medium || '') : ''; });
  DZ.alb.set(k, p); return p;
}
/* an artist's songs, most popular first */
function dzTop(name) {
  const k = norm(name); if (DZ.top.has(k)) return DZ.top.get(k);
  const p = dzArtist(name).then(a => a ? dz('artist/' + a.id + '/top', { limit: 50 }) : null).then(r => ((r && r.data) || []).map(x => ({ title: x.title_short || x.title, rank: x.rank || 0, album: (x.album || {}).title || '', image: (x.album || {}).cover_big || '', dur: (x.duration || 0) * 1000, preview: x.preview || '' })));
  DZ.top.set(k, p); return p;
}
const probeImg = u => new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = u; });
function setCover(el, url) { const cv = el.querySelector('.cv'); if (!cv || !url) return; cv.style.backgroundImage = 'url("' + url + '")'; cv.replaceChildren(); }
function fillArtistImg(el, name) { dzArtist(name).then(r => { if (r && r.img) setCover(el, r.img); }); }
function fillAlbumImg(el, mbid, artist, title) {
  (mbid ? probeImg(caaImg(mbid)) : Promise.resolve(false)).then(ok => ok ? setCover(el, caaImg(mbid)) : dzAlbumCover(artist, title).then(u => u && setCover(el, u)));
}
/* a request button that turns into a check mark */
function doneBtn(btn) { btn.classList.remove('busy'); btn.classList.add('done'); btn.disabled = true; btn.replaceChildren(ic('check')); btn.title = t('requestedOk'); btn.setAttribute('aria-label', t('requestedOk')); }

/* skeleton placeholders */
const skelShelf = () => h('section', { class: 'sk-sec' }, h('div', { class: 'sk-h' }), h('div', { class: 'sk-row' }, [0, 1, 2, 3, 4, 5].map(() => h('div', { class: 'sk-tile' }, h('i'), h('b'), h('b', { class: 's' })))));
const skelRows = n => h('div', { class: 'sk-list' }, Array.from({ length: n }, () => h('div', { class: 'sk-li' }, h('i'), h('div', {}, h('b'), h('b', { class: 's' })))));

/* popular songs: Deezer ranking, library files where you have them, requestable where you do not */
async function artistPopular(ar, all, popBox, moreHost) {
  popBox.replaceChildren(skelRows(5));
  let rank = []; try { rank = await dzTop(ar.Name); } catch (e) { }
  let list = [];
  try {
  if (rank.length) {
    const flat = rank.map(r => ({ artistName: ar.Name, trackName: r.title, title: r.title, albumName: r.album, durationMs: r.dur, preview_url: r.preview, artworkUrl: r.image, id: 'dz' + r.title }));
    const its = await toTrackItems(flat); const have = new Set(its.filter(x => !x._ext).map(x => x.Id));
    const rest = all.filter(x => !have.has(x.Id)).sort((a, b) => ((b.UserData && b.UserData.PlayCount) || 0) - ((a.UserData && a.UserData.PlayCount) || 0));
    list = its.concat(rest);
  } else {
    const top = await tracksOf({ ArtistIds: ar.Id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 10 }); list = top.concat(all.filter(x => !top.some(y => y.Id === x.Id)));
  }
  } catch (e) { console.warn('[cinema] popular', e); list = all.slice(); }
  let open = false; const btn = h('button', { class: 'btn grey sp-more', onclick: () => { open = !open; draw(); } });
  const draw = () => { const shown = open ? list : list.slice(0, 5); popBox.replaceChildren(trackList(shown, { id: ar.Id + '-pop' + (open ? 'all' : ''), number: 'idx' })); $$('.sp-th', popBox).forEach(x => x.remove()); btn.textContent = open ? t('showFewer') : t('showMoreSongs') + ' (' + list.length + ')'; btn.hidden = list.length <= 5; };
  moreHost.replaceChildren(btn); draw();
}

/* discography: albums you have and releases you could add, in one row */
function rgTracksCount(id) {
  if (DZ.rg.has(id)) return DZ.rg.get(id);
  let cached = null; try { cached = JSON.parse(localStorage.getItem('cx-rgn') || '{}'); } catch (e) { }
  const p = (cached && cached[id] != null) ? Promise.resolve(cached[id]) : aget('/api/artists/release-group/' + id + '/tracks').then(tr => { const n = (tr || []).length; try { const c = JSON.parse(localStorage.getItem('cx-rgn') || '{}'); c[id] = n; localStorage.setItem('cx-rgn', JSON.stringify(c)); } catch (e) { } return n; }).catch(() => null);
  DZ.rg.set(id, p); return p;
}
async function artistDisco(n, ar, alb) {
  const mb = (ar.ProviderIds || {}).MusicBrainzArtist; const entries = [];
  alb.forEach(a => entries.push({ own: true, year: String(yearOf(a) || ''), el: albumTile(a), a }));
  if (aurralOn() && mb) {
    try {
      const [a, lib] = await Promise.all([aget('/api/artists/' + mb), loadLibrary()]);
      const mine = new Set(lib.albums.filter(x => (x.ArtistItems || []).some(y => y.Id === ar.Id) || x.AlbumArtist === ar.Name).map(x => norm(x.Name)));
      (a['release-groups'] || []).filter(g => ['Album', 'EP', 'Single'].includes(g['primary-type']) && !(g['secondary-types'] || []).length && !mine.has(norm(g.title))).forEach(g => {
        const year = String(g['first-release-date'] || '').slice(0, 4);
        const el = tile({ name: g.title, sub: [year, t('notOwned')].filter(Boolean).join(' · '), img: '', href: '#/c/music/ext/' + g.id + '?t=' + encodeURIComponent(g.title) + '&a=' + encodeURIComponent(ar.Name) }); el.classList.add('notown-tile');
        fillAlbumImg(el, g.id, ar.Name, g.title);
        if (aurralReq()) { const rq = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); rq.classList.add('busy'); try { await requestAurral({ id: g.id, title: g.title, artistName: ar.Name, artistMbid: mb }, 'album'); toast(t('requested')); doneBtn(rq); } catch (er) { rq.classList.remove('busy'); toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus')); el.append(rq); }
        entries.push({ own: false, year, el, g });
      });
    } catch (e) { console.warn('[cinema] discography', e); }
  }
  if (!entries.length) return;
  entries.sort((x, y) => String(y.year).localeCompare(String(x.year)));
  n.append(shelf(t('discography'), entries.map(x => x.el)));
  /* how many of an album's songs you have: filled in quietly */
  const jobs = entries.filter(x => x.own && x.a && (x.a.ProviderIds || {}).MusicBrainzReleaseGroup); let i = 0;
  const worker = async () => { while (i < jobs.length) { const x = jobs[i++]; const total = await rgTracksCount(x.a.ProviderIds.MusicBrainzReleaseGroup); const have = x.a.ChildCount || 0; const sb = x.el.querySelector('.sb'); if (total && have && sb && total > have && total < 80) { sb.textContent = [String(yearOf(x.a) || ''), t('songsOf').replace('{a}', have).replace('{b}', total)].filter(Boolean).join(' · '); x.el.classList.add('partial'); } } };
  if (aurralOn()) Promise.all([worker(), worker(), worker()]);
}

/* album page: the songs of the release you do not have */
async function albumMissing(n, al, tracks) {
  const rg = (al.ProviderIds || {}).MusicBrainzReleaseGroup; if (!rg || !aurralOn() || !aurralReq()) return;
  let list; try { list = await aget('/api/artists/release-group/' + rg + '/tracks'); } catch (e) { return; }
  if (!Array.isArray(list) || !list.length) return;
  const artist = (al.AlbumArtist || (al.ArtistItems && al.ArtistItems[0] && al.ArtistItems[0].Name) || '');
  const have = new Set(tracks.map(x => norm(x.Name)));
  const missing = list.filter(x => !have.has(norm(x.title || x.trackName || x.name)));
  if (!missing.length || missing.length === list.length) return;
  const its = (await toTrackItems(missing.map(x => Object.assign({ artistName: artist, albumName: al.Name, durationMs: x.length, releaseGroupMbid: rg }, x)))).filter(x => x._ext); if (!its.length) return;
  const sec = h('section', { class: 'alb-missing' }, h('div', { class: 'am-h' }, h('h2', {}, t('missingSongs') + ' · ' + its.length), h('button', { class: 'btn grey', onclick: async e => { const b = e.currentTarget; b.disabled = true; try { await requestAurral({ id: rg, title: al.Name, artistName: artist }, 'album'); toast(t('requested')); b.replaceChildren(ic('check'), t('requestedOk')); } catch (er) { b.disabled = false; toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus'), t('reqAll'))), trackList(its, { id: 'miss-' + rg, noAlbum: true, noCover: true, number: 'idx' }));
  $$('.sp-th', sec).forEach(x => x.remove()); n.append(sec);
}
