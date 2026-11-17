/* ---------- Letterboxd (read only) and the movie archive ---------- */
Object.assign(TX.en, {
  lbTitle: 'Letterboxd', lbIntro: 'Films you logged as watched on Letterboxd are marked as watched here, and they are labelled in Discover. This is one way only: nothing is ever written to Letterboxd.',
  lbUser: 'Letterboxd username', lbUserHint: 'The name in your profile address, letterboxd.com/NAME. The profile has to be public.', lbSave: 'Save and sync', lbSyncNow: 'Sync now',
  lbStatus: 'Status', lbStatusN: 'films known', lbNever: 'not synced yet', lbSynced: 'films marked as watched', lbImport: 'Import everything you marked as watched', lbImportHint: 'Letterboxd shares only your latest ~50 diary entries automatically, and films you just ticked as watched (without a diary entry) are not in that feed at all. To bring in all of them: on Letterboxd open Settings, Import & Export, Export your data, then pick the downloaded ZIP file (or watched.csv) here. Repeat it now and then to catch up; new diary entries arrive automatically.',
  lbMatched: 'of your library films found on Letterboxd', lbSeen: 'Watched', lbSeenOn: 'Watched on Letterboxd', lbYourRating: 'Your Letterboxd rating and viewing', lbWatchedOn: 'watched on', lbRewatch: 'rewatch', lbRated: 'ratings saved', lbHideSeen: 'Hide watched', lbImported: 'imported', lbOff: 'Letterboxd sync is turned off on the server.', lbErr: 'Letterboxd could not be reached',
  archive: 'Archive', archived: 'Archived', archiveIntro: 'Movies you archived: the file is gone to free up space, but title, poster and details are kept here. Restore a movie to have it downloaded again.', archOff: 'The archive is turned off on the server.', archEmpty: 'Nothing archived yet. Use the three-dot menu of a movie, then "Archive".',
  archiveDo: 'Archive…', archDlgTitle: 'Archive this movie', archDlgIntro: 'This frees up disk space. What happens:', archStep1: 'Title, details and pictures are saved in the archive.', archStep2: 'The movie file is deleted from the disk and the movie leaves your library.', archStep3: 'In Radarr the file is deleted and the movie is no longer monitored, so it is not downloaded again.',
  archRadarr: 'Also delete it in Radarr and stop monitoring it', archRadarrOff: 'Radarr is not connected', archGo: 'Archive and delete file', archBusy: 'Archiving…', archDone: 'Archived', archSize: 'Frees up', archWarn: 'This cannot be undone from here. You can restore the movie later by downloading it again.',
  archRestore: 'Restore (download again)', archRestoreDone: 'Radarr is searching for the movie again', archNoRadarr: 'Not in Radarr. Request it instead.', archRemove: 'Remove from archive', archRemoved: 'Removed from the archive', archSince: 'Archived on', archGenres: 'Genres', archRuntime: 'Runtime', archRating: 'Rating', archFreed: 'Freed', archRequest: 'Request instead', archAdminOnly: 'Only administrators can archive movies.', archFail: 'Archiving failed',
  archSettingsHint: 'Archived movies', archOpen: 'Open the archive', archCount: 'movies archived'
});
Object.assign(TX.de, {
  lbTitle: 'Letterboxd', lbIntro: 'Filme, die du auf Letterboxd als gesehen eingetragen hast, werden hier als gesehen markiert und in Entdecken gekennzeichnet. Das geht nur in eine Richtung: Es wird nie etwas zu Letterboxd geschrieben.',
  lbUser: 'Letterboxd-Benutzername', lbUserHint: 'Der Name in deiner Profiladresse, letterboxd.com/NAME. Das Profil muss öffentlich sein.', lbSave: 'Speichern und abgleichen', lbSyncNow: 'Jetzt abgleichen',
  lbStatus: 'Stand', lbStatusN: 'Filme bekannt', lbNever: 'noch nicht abgeglichen', lbSynced: 'Filme als gesehen markiert', lbImport: 'Alles importieren, was du als gesehen markiert hast', lbImportHint: 'Letterboxd gibt automatisch nur deine letzten ~50 Tagebuch-Einträge heraus, und Filme, die du nur als gesehen abgehakt hast (ohne Tagebuch-Eintrag), stehen in diesem Feed gar nicht. Um alle zu übernehmen: Auf Letterboxd Settings, Import & Export, Export your data öffnen, dann hier die heruntergeladene ZIP-Datei (oder watched.csv) wählen. Wiederhole das ab und zu; neue Tagebuch-Einträge kommen automatisch.',
  lbMatched: 'deiner Bibliotheksfilme auf Letterboxd gefunden', lbSeen: 'Gesehen', lbSeenOn: 'Auf Letterboxd gesehen', lbYourRating: 'Deine Letterboxd-Bewertung und Sichtung', lbWatchedOn: 'gesehen am', lbRewatch: 'Wiederholung', lbRated: 'Bewertungen gespeichert', lbHideSeen: 'Gesehene ausblenden', lbImported: 'importiert', lbOff: 'Der Letterboxd-Abgleich ist auf dem Server ausgeschaltet.', lbErr: 'Letterboxd war nicht erreichbar',
  archive: 'Archiv', archived: 'Archiviert', archiveIntro: 'Filme, die du archiviert hast: Die Datei ist gelöscht, um Platz zu sparen, Titel, Poster und Details bleiben hier erhalten. Stelle einen Film wieder her, damit er erneut geladen wird.', archOff: 'Das Archiv ist auf dem Server ausgeschaltet.', archEmpty: 'Noch nichts archiviert. Nutze das Drei-Punkte-Menü eines Films, dann "Archivieren".',
  archiveDo: 'Archivieren…', archDlgTitle: 'Diesen Film archivieren', archDlgIntro: 'Das gibt Speicherplatz frei. Was passiert:', archStep1: 'Titel, Details und Bilder werden im Archiv gespeichert.', archStep2: 'Die Filmdatei wird von der Festplatte gelöscht und der Film verschwindet aus deiner Bibliothek.', archStep3: 'In Radarr wird die Datei gelöscht und der Film nicht mehr überwacht, damit er nicht erneut geladen wird.',
  archRadarr: 'Auch in Radarr löschen und nicht mehr überwachen', archRadarrOff: 'Radarr ist nicht verbunden', archGo: 'Archivieren und Datei löschen', archBusy: 'Archiviere…', archDone: 'Archiviert', archSize: 'Gibt frei', archWarn: 'Das lässt sich von hier aus nicht rückgängig machen. Du kannst den Film später wiederherstellen, indem er neu geladen wird.',
  archRestore: 'Wiederherstellen (neu laden)', archRestoreDone: 'Radarr sucht den Film wieder', archNoRadarr: 'Nicht in Radarr. Frage ihn stattdessen an.', archRemove: 'Aus dem Archiv entfernen', archRemoved: 'Aus dem Archiv entfernt', archSince: 'Archiviert am', archGenres: 'Genres', archRuntime: 'Laufzeit', archRating: 'Bewertung', archFreed: 'Freigegeben', archRequest: 'Stattdessen anfragen', archAdminOnly: 'Nur Administratoren können Filme archivieren.', archFail: 'Archivieren fehlgeschlagen',
  archSettingsHint: 'Archivierte Filme', archOpen: 'Archiv öffnen', archCount: 'Filme archiviert'
});
const optOn = k => !!(C.status && C.status.features && C.status.features[k] === true);
const lbNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const fmtGB = b => b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.round(b / 1e6) + ' MB';

/* ----- Letterboxd ----- */
const LB = { tmdb: new Map(), names: new Map(), n: 0, at: 0, err: '', last: null, p: null };
const lbUser = () => String(CFGU.lbUser || '').trim();
function lbLoad(refresh) {
  if (!optOn('letterboxd') || !lbUser()) return Promise.resolve(null);
  if (LB.p) return LB.p;
  if (!refresh && LB.at && Date.now() - LB.at < 120000) return Promise.resolve(null); // loaded a moment ago
  const params = { user: lbUser() }; if (refresh) params.refresh = 'true';
  LB.p = api('Cinema/letterboxd/watched', params).then(r => {
    LB.tmdb.clear(); LB.names.clear();
    (r.items || []).forEach(e => { if (e.tmdb) LB.tmdb.set(+e.tmdb, e); LB.names.set(lbNorm(e.title) + '|' + (e.year || ''), e); });
    LB.n = (r.items || []).length; LB.rated = (r.items || []).filter(e => e.rating).length; LB.err = r.error || ''; LB.at = Date.now(); return r;
  }).catch(e => { LB.err = String((e && e.message) || e); return null; }).finally(() => { LB.p = null; });
  return LB.p;
}
/* is this film (a library item or a Seerr result) watched on Letterboxd? */
function lbDetailChip(it, container) {
  if (!optOn('letterboxd') || it.Type !== 'Movie') return; const e = lbMatch(it); if (!e || (!e.rating && !e.date)) return;
  const info = $('.nf-dinfo .nf-meta', container); if (!info) return;
  const when = e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const chip = h('span', { class: 'rt-chip lb-chip', title: t('lbYourRating') }, 'Letterboxd ', e.rating ? h('b', {}, '★ ' + Number(e.rating).toFixed(1)) : null, e.liked ? h('b', { class: 'lb-heart' }, ' ♥') : null, when ? h('small', {}, t('lbWatchedOn') + ' ' + when + (e.rewatch ? ' · ' + t('lbRewatch') : '')) : null);
  const row = $('.rt-row', container); if (row) row.append(chip); else info.after(h('div', { class: 'rt-row' }, chip));
}
function lbSeen(x) {
  if (!LB.n) return null;
  if (x.mediaType === 'tv' || x.Type === 'Series') return null;
  const tm = +(x.tmdbId || (x.ProviderIds || {}).Tmdb || (x.mediaType ? x.id : 0)) || 0; if (tm && LB.tmdb.has(tm)) return LB.tmdb.get(tm);
  const title = x.title || x.Name || x.name; const year = +(x.ProductionYear || String(x.releaseDate || x.firstAirDate || '').slice(0, 4)) || 0; if (!title) return null;
  const k = lbNorm(title); return LB.names.get(k + '|' + year) || (year && (LB.names.get(k + '|' + (year - 1)) || LB.names.get(k + '|' + (year + 1)))) || null;
}
const lbSyncState = { busy: false };
/* Letterboxd uses English titles, a library in another language does not: look up the English title (Seerr / TMDb) once per film and keep it */
let LBEN = {}; try { LBEN = JSON.parse(localStorage.getItem('cx-lb-en') || '{}'); } catch (e) { }
async function lbEnglish(movies) {
  const need = movies.filter(it => { const tm = (it.ProviderIds || {}).Tmdb; return tm && !LBEN[tm]; }); if (!need.length || !hasSeerr()) return;
  let i = 0; const worker = async () => { while (i < need.length) { const it = need[i++]; const tm = it.ProviderIds.Tmdb; try { const d = await seerrGet('/movie/' + tm); LBEN[tm] = [d.title || '', String(d.releaseDate || '').slice(0, 4), d.originalTitle || '']; } catch (e) { } } };
  await Promise.all([worker(), worker(), worker(), worker()]); try { localStorage.setItem('cx-lb-en', JSON.stringify(LBEN)); } catch (e) { }
}
function lbMatch(it) {
  const direct = lbSeen(it); if (direct) return direct;
  const tm = (it.ProviderIds || {}).Tmdb; const en = tm && LBEN[tm]; const names = [];
  if (en) { const y = +en[1] || it.ProductionYear || 0; [en[0], en[2]].forEach(n => n && names.push([n, y])); }
  if (it.OriginalTitle) names.push([it.OriginalTitle, it.ProductionYear || 0]);
  for (const [nm, y] of names) { const k = lbNorm(nm); const hit = LB.names.get(k + '|' + y) || (y && (LB.names.get(k + '|' + (y - 1)) || LB.names.get(k + '|' + (y + 1)))); if (hit) return hit; }
  return null;
}
async function lbSync(force) {
  if (!optOn('letterboxd') || !lbUser() || lbSyncState.busy) return; lbSyncState.busy = true;
  try {
    await lbLoad(force); if (!LB.n) return;
    resetSeerrCache(); const lm = await libMap(); const done = new Set(CFGU.lbDone || []); const marked = []; let matched = 0;
    const movies = Object.keys(lm).filter(k => k.indexOf('movie:') === 0).map(k => lm[k]);
    await lbEnglish(movies.filter(it => !lbSeen(it)));
    for (const it of movies) {
      const e = lbMatch(it); if (!e) continue; matched++;
      if (ud(it).Played || done.has(it.Id)) continue;
      try { await ApiClient.markPlayed(uid(), it.Id, e.date ? new Date(e.date + 'T20:00:00') : new Date()); marked.push(it.Id); } catch (er) { }
    }
    if (marked.length) { await saveCfg({ lbDone: (CFGU.lbDone || []).concat(marked).slice(-3000) }); C.libCache = null; resetSeerrCache(); toast(marked.length + ' ' + t('lbSynced')); }
    LB.last = { n: marked.length, matched, of: movies.length, at: Date.now() };
  } catch (e) { console.warn('[cinema] letterboxd sync', e); } finally { lbSyncState.busy = false; }
}
function csvRows(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); } return rows;
}
/* the Letterboxd export is a ZIP: read watched.csv (everything marked as watched) and diary.csv straight from it, no unzipping needed */
async function zipTexts(buf) {
  const v = new DataView(buf), u8 = new Uint8Array(buf); let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('ZIP?');
  const n = v.getUint16(eocd + 10, true); let p = v.getUint32(eocd + 16, true); const out = {};
  for (let k = 0; k < n; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), el = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), off = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)).toLowerCase(); p += 46 + nl + el + cl;
    if (!/(^|\/)(watched|diary|ratings)\.csv$/.test(name)) continue;
    const lnl = v.getUint16(off + 26, true), lel = v.getUint16(off + 28, true), start = off + 30 + lnl + lel; const data = u8.subarray(start, start + csize);
    out[name.split('/').pop()] = method === 0 ? new TextDecoder().decode(data) : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
  }
  return out;
}
function csvFilms(text) {
  const rows = csvRows(String(text).replace(/^\uFEFF/, '')); if (rows.length < 2) return [];
  const head = rows[0].map(x => x.trim().toLowerCase()); const iN = head.indexOf('name'), iY = head.indexOf('year'); const iD = head.indexOf('watched date') >= 0 ? head.indexOf('watched date') : head.indexOf('date');
  if (iN < 0) throw new Error('"Name" column?');
  const iR = head.indexOf('rating'), isRatings = iR >= 0 && head.indexOf('watched date') < 0 && head.indexOf('rewatch') < 0; // ratings.csv: its date is the rating date, not the viewing
  return rows.slice(1).filter(r => r[iN]).map(r => ({ title: r[iN], year: iY >= 0 ? +r[iY] || null : null, date: isRatings ? null : (iD >= 0 ? (r[iD] || '').slice(0, 10) : null), rating: iR >= 0 ? +r[iR] || null : null }));
}
async function lbReadExport(file) {
  if (/\.zip$/i.test(file.name)) { const t_ = await zipTexts(await file.arrayBuffer()); const all = []; ['ratings.csv', 'watched.csv', 'diary.csv'].forEach(k => { if (t_[k]) all.push(...csvFilms(t_[k])); }); if (!all.length) throw new Error('watched.csv?'); return all; }
  return csvFilms(await file.text());
}
async function lbImportCsv(file, onDone) {
  const items_ = await lbReadExport(file);
  let n = 0; for (let i = 0; i < items_.length; i += 1500) { const r = await cpost('/letterboxd/import?user=' + encodeURIComponent(lbUser()), items_.slice(i, i + 1500)); n += (r && r.imported) || 0; }
  await lbLoad(true); await lbSync(); onDone && onDone(n);
}

/* ----- archive ----- */
const ARCH = { list: [], tmdb: new Set(), p: null, at: 0 };
function archLoad(force) {
  if (!optOn('archive')) return Promise.resolve([]);
  if (!force && ARCH.at && Date.now() - ARCH.at < 120000) return Promise.resolve(ARCH.list);
  if (ARCH.p) return ARCH.p;
  ARCH.p = api('Cinema/archive/list').then(l => { ARCH.list = Array.isArray(l) ? l : []; ARCH.tmdb = new Set(ARCH.list.map(e => +e.tmdb).filter(Boolean)); ARCH.at = Date.now(); return ARCH.list; }).catch(() => ARCH.list).finally(() => { ARCH.p = null; });
  return ARCH.p;
}
const archImg = (e, kind) => (kind === 'primary' ? e.hasPrimary : e.hasBackdrop) ? ApiClient.getUrl('Cinema/archive/img/' + e.key + '/' + kind, { api_key: ApiClient.accessToken() }) : '';
/* small labels on Discover cards and in the request dialog */
function lbArchBadges(x) {
  const out = []; const tm = +(x.id || x.tmdbId) || 0;
  if (tm && ARCH.tmdb.has(tm) && x.mediaType !== 'tv') out.push(h('span', { class: 'dmark arch' }, ic('lib', 'ic-s'), t('archived')));
  const seen = lbSeen(x); if (seen) out.push(h('span', { class: 'dmark seen', title: t('lbSeenOn') + (seen.date ? ' · ' + seen.date : '') }, ic('eye', 'ic-s'), h('span', { class: 'dtx' }, t('lbSeen') + (seen.rating ? ' ★ ' + Number(seen.rating).toFixed(1) : ''))));
  return out;
}
async function blobB64(url) { if (!url) return ''; try { const r = await fetch(url); if (!r.ok) return ''; const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] || ''); fr.readAsDataURL(b); }); } catch (e) { return ''; } }
/* archive one movie: keep the details, delete the file, optionally clean up Radarr (shared by the dialog and the storage assistant) */
async function archiveCore(full, useRadarr) {
  const size = ((full.MediaSources || [])[0] || {}).Size || 0; const tm = (full.ProviderIds || {}).Tmdb;
  const [primaryB64, backdropB64] = await Promise.all([blobB64(imgUrl(full, 'Primary', 700)), blobB64(imgUrl(full, 'Backdrop', 1280))]);
  await cpost('/archive/add', { tmdb: tm, title: full.Name, year: full.ProductionYear, overview: full.Overview, tagline: (full.Taglines || [])[0], genres: full.Genres, runtime: full.RunTimeTicks ? Math.round(full.RunTimeTicks / 6e8) : null, rating: full.CommunityRating, officialRating: full.OfficialRating, played: !!ud(full).Played, size, primaryB64, backdropB64 });
  if (useRadarr && tm) { const r = await cpost('/arr/radarr/archive', { tmdbId: +tm }); if (r && r.ok === false && r.found !== false) throw new Error(r.message || 'Radarr'); }
  await jf('DELETE', 'Items/' + full.Id);
}
async function archiveDialog(it) {
  const d = cxDialog(t('archDlgTitle'), { wide: false }); d.busy();
  let full; try { full = await getItem(it.Id); } catch (e) { return errBox(d, e); }
  const size = ((full.MediaSources || [])[0] || {}).Size || 0; const tm = (full.ProviderIds || {}).Tmdb; const radarrOk = !!(C.status && C.status.radarr);
  const useRadarr = h('input', { type: 'checkbox', checked: radarrOk && (C.status.features || {}).archiveRadarr !== false, disabled: !radarrOk || !tm });
  const st = h('p', { class: 'cxd-hint', style: 'min-height:20px' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    go_.disabled = true; st.textContent = t('archBusy');
    try {
      await archiveCore(full, useRadarr.checked);
      ARCH.at = 0; await archLoad(true); C.libCache = null; resetSeerrCache(); d.close(); toast(t('archDone')); go('#/c/archive');
    } catch (e) { st.textContent = t('archFail') + ': ' + (e.message || e); go_.disabled = false; }
  } }, ic('download'), t('archGo'));
  d.setTitle(full.Name);
  d.body.replaceChildren(...[h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('archDlgIntro')),
    h('ol', { class: 'arch-steps' }, h('li', {}, t('archStep1')), h('li', {}, t('archStep2')), h('li', {}, t('archStep3'))),
    size ? h('p', { class: 'arch-size' }, t('archSize') + ' ', h('b', {}, fmtGB(size))) : null,
    h('label', { class: 'arch-opt' }, useRadarr, h('span', {}, radarrOk ? t('archRadarr') : t('archRadarrOff'))), h('p', { class: 'cxd-hint arch-warn' }, t('archWarn')), st].filter(Boolean));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}
function archCard(e) {
  const src = archImg(e, 'primary');
  const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, e.title), h('span', { class: 'dmark arch' }, ic('lib', 'ic-s'), t('archived')));
  return h('div', { class: 'nf-card poster arch', onclick: () => archModal(e) }, im, h('div', { class: 'title ell' }, e.title));
}
async function archModal(e) {
  const d = cxDialog(e.title, { wide: true }); const admin = !!(C.status && C.status.admin);
  const back = archImg(e, 'backdrop'); const poster = archImg(e, 'primary');
  const facts = [[t('archGenres'), (e.genres || []).join(', ')], [t('archRuntime'), e.runtime ? e.runtime + ' ' + t('min') : ''], [t('archRating'), e.rating ? Number(e.rating).toFixed(1) + (e.officialRating ? ' · ' + e.officialRating : '') : e.officialRating || ''], [t('archFreed'), e.size ? fmtGB(e.size) : ''], [t('archSince'), e.archived || '']].filter(f => f[1]);
  const st = h('p', { class: 'cxd-hint', style: 'min-height:18px' });
  const btn = (cls, ico, label, fn) => h('button', { class: 'btn ' + cls, onclick: async ev => { const b = ev.currentTarget; b.disabled = true; try { await fn(); } catch (er) { st.textContent = (er.message || er); } b.disabled = false; } }, ico ? ic(ico) : null, label);
  d.setTitle(e.title + (e.year ? ' (' + e.year + ')' : ''));
  d.body.replaceChildren(...[back ? h('div', Object.assign({ class: 'arch-hero' }, bg(back))) : null,
    h('div', { class: 'arch-top' }, poster ? h('div', Object.assign({ class: 'arch-poster' }, bg(poster))) : null, h('div', {}, e.tagline ? h('p', { class: 'nf-tagline' }, e.tagline) : null, h('p', { class: 'arch-ov' }, e.overview || ''))),
    h('dl', { class: 'nf-facts' }, facts.map(f => [h('dt', {}, f[0]), h('dd', {}, f[1])])), st].filter(Boolean));
  d.foot.replaceChildren(...[
    admin ? btn('grey', 'close', t('archRemove'), async () => { await api_del(e.key); d.close(); toast(t('archRemoved')); route(); }) : null,
    e.tmdb ? btn('grey', 'search', t('archRequest'), async () => { d.close(); openSeerrInfo({ id: +e.tmdb, mediaType: 'movie' }); }) : null,
    admin && e.tmdb ? btn('white', 'refresh', t('archRestore'), async () => { const r = await cpost('/arr/radarr/restore', { tmdbId: +e.tmdb }); if (r && r.found && r.ok) { toast(t('archRestoreDone')); d.close(); } else st.textContent = t('archNoRadarr'); }) : null].filter(Boolean));
}
const api_del = key => ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl('Cinema/archive/' + key) });
async function archiveView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('archive')), h('p', { class: 'arch-intro' }, t('archiveIntro'))); page.append(wrap);
  if (!optOn('archive')) { wrap.append(h('div', { class: 'nf-empty' }, t('archOff'))); return; }
  const [list, lm] = await Promise.all([archLoad(true), libMap()]);
  const shown = list.filter(e => !(e.tmdb && lm['movie:' + e.tmdb])); // back in the library: not archived any more
  if (!shown.length) { wrap.append(h('div', { class: 'nf-empty' }, t('archEmpty'))); return; }
  wrap.append(h('div', { class: 'nf-grid' }, shown.map(archCard)));
}
/* ----- settings cards (called from the settings page) ----- */
function lbarchCards(card_, row) {
  const out = [];
  if (optOn('letterboxd')) {
    const inp = h('input', { type: 'text', value: lbUser(), placeholder: 'username', maxlength: 40, style: 'width:200px' });
    const stat = h('span', { class: 'lb-stat' });
    const upd = () => { stat.textContent = LB.n ? LB.n + ' ' + t('lbStatusN') + (LB.rated ? ' · ' + LB.rated + ' ' + t('lbRated') : '') + (LB.last ? ' · ' + LB.last.matched + '/' + LB.last.of + ' ' + t('lbMatched') : '') + (LB.at ? ' · ' + new Date(LB.at).toLocaleTimeString() : '') + (LB.err ? ' · ' + t('lbErr') : '') : (lbUser() ? (LB.err ? t('lbErr') : t('lbNever')) : '—'); };
    const save = h('button', { class: 'btn white', style: 'height:38px', onclick: async () => { const v = inp.value.trim().replace(/^@/, '').replace(/^https?:\/\/letterboxd\.com\//, '').replace(/\/.*$/, ''); await saveCfg({ lbUser: v || null }); stat.textContent = '…'; await lbSync(true); upd(); } }, t('lbSave'));
    const syncB = h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { stat.textContent = '…'; await lbSync(true); upd(); } }, t('lbSyncNow'));
    const file = h('input', { type: 'file', accept: '.zip,.csv,application/zip,text/csv', style: 'display:none', onchange: async e => { const f = e.target.files[0]; if (!f) return; stat.textContent = '…'; try { await lbImportCsv(f, n => { toast(n + ' ' + t('lbImported')); }); } catch (er) { toast((er.message || er)); } upd(); } });
    const imp = h('button', { class: 'btn grey', style: 'height:38px', onclick: () => file.click() }, t('lbImport'));
    upd(); lbLoad().then(upd);
    out.push(card_(t('lbTitle'), h('p', { class: 'set-p' }, t('lbIntro')), row(t('lbUser'), t('lbUserHint'), h('div', { style: 'display:flex;gap:8px;align-items:center;flex-wrap:wrap' }, inp, save)), row(t('lbStatus'), '', h('div', { style: 'display:flex;gap:12px;align-items:center;flex-wrap:wrap' }, stat, syncB)), row(t('lbImport'), t('lbImportHint'), h('div', {}, imp, file))));
  }
  if (optOn('archive')) {
    const cnt = h('b', {}, String(ARCH.list.length)); archLoad().then(l => { cnt.textContent = String(l.length); });
    out.push(card_(t('archive'), h('p', { class: 'set-p' }, t('archiveIntro')), row(t('archSettingsHint'), '', h('div', { style: 'display:flex;gap:12px;align-items:center' }, h('span', {}, cnt, t('archCount')), h('a', { class: 'btn grey', style: 'height:38px;display:inline-flex;align-items:center', href: '#/c/archive' }, t('archOpen'))))));
  }
  return out;
}
