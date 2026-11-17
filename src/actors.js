/* ---------- Quiz: follow actors, best known films and full filmography, scenes with the character ---------- */
Object.assign(TX.en, {
  gFavFollow: 'Follow', gFavFollowing: 'Following', gFavs: 'Your favourites', gFavNew: 'New from your favourites', gFavNewSub: 'Recent and upcoming films of the actors you follow', gFavNone: 'Follow actors with the heart. They are trained first, and you see their new films here.', gFavTrain: 'Practise favourites', gFavN: 'followed',
  gTabSeen: 'Watched', gTabFamous: 'Best known', gTabAll: 'All films and shows', gAsRole: 'as', gStWatched: 'Watched', gStLib: 'In your library', gStReq: 'Requested', gStNone: 'Not in your library', gFamous: 'Best known films', gOnlyUnseen: 'Only unseen', gSearchF: 'Search a title…', gNeedSeerr: 'The full filmography needs Seerr.', gAllN: '{n} titles', gMoreRows: 'Show more', gFilterFav: 'Followed', gSceneTagged: 'Scene with the actor', gNoCredits: 'No filmography found.', gFavBadge: 'Fan club',
  qFamous: 'Films shown for each actor', qFamousH: 'Next to the films you watched, also show the actor\'s best known films. Needs Seerr.', qFamousBoth: 'Watched and best known', qFamousSeen: 'Only watched', qScenes: 'Scene pictures', qScenesH: 'Show a scene from the film next to the role. With a TMDB key on the server the scene shows the actor, otherwise the film\'s backdrop.'
});
Object.assign(TX.de, {
  gFavFollow: 'Folgen', gFavFollowing: 'Gefolgt', gFavs: 'Deine Lieblinge', gFavNew: 'Neu von deinen Lieblingen', gFavNewSub: 'Neue und kommende Filme der Schauspieler, denen du folgst', gFavNone: 'Folge Schauspielern mit dem Herz. Sie werden zuerst trainiert, und ihre neuen Filme siehst du hier.', gFavTrain: 'Lieblinge üben', gFavN: 'gefolgt',
  gTabSeen: 'Gesehen', gTabFamous: 'Bekannteste', gTabAll: 'Alle Filme und Serien', gAsRole: 'als', gStWatched: 'Gesehen', gStLib: 'In deiner Bibliothek', gStReq: 'Angefragt', gStNone: 'Nicht in deiner Bibliothek', gFamous: 'Bekannteste Filme', gOnlyUnseen: 'Nur ungesehene', gSearchF: 'Titel suchen…', gNeedSeerr: 'Die komplette Filmografie braucht Seerr.', gAllN: '{n} Titel', gMoreRows: 'Mehr anzeigen', gFilterFav: 'Gefolgt', gSceneTagged: 'Szene mit dem Schauspieler', gNoCredits: 'Keine Filmografie gefunden.', gFavBadge: 'Fanclub',
  qFamous: 'Gezeigte Filme pro Schauspieler', qFamousH: 'Zeigt neben den Filmen, die du gesehen hast, auch die bekanntesten Filme des Schauspielers. Braucht Seerr.', qFamousBoth: 'Gesehene und bekannteste', qFamousSeen: 'Nur gesehene', qScenes: 'Szenenbilder', qScenesH: 'Zeigt zur Rolle eine Szene aus dem Film. Mit einem TMDB-Schlüssel auf dem Server zeigt die Szene den Schauspieler, sonst das Hintergrundbild des Films.'
});

const GA = { ids: {}, cr: new Map(), tagged: new Map() };
try { GA.ids = JSON.parse(localStorage.getItem('cx-game-pid') || '{}') || {}; } catch (e) { }
const gIsFav = (st, a) => !!(st && st.fav && st.fav[a.k]);
/* the TMDB id of a person: from Jellyfin, from the cached Letterboxd cast, or by a name search in Seerr */
async function gPersonId(a) {
  if (a.tid) return a.tid; if (GA.ids[a.k]) return (a.tid = GA.ids[a.k]);
  const f = GM.st && GM.st.fav && GM.st.fav[a.k]; if (f && f.t) return (a.tid = f.t);
  let id = 0;
  if (a.pid) { try { id = +((await getItem(a.pid)).ProviderIds || {}).Tmdb || 0; } catch (e) { } }
  if (!id && hasSeerr()) { try { const r = await seerrGet('/search', { query: a.name, page: 1 }); const ppl = (r.results || []).filter(x => x.mediaType === 'person'); const hit = ppl.find(x => lbNorm(x.name) === a.k) || ppl[0]; id = hit ? +hit.id : 0; } catch (e) { } }
  if (id) { GA.ids[a.k] = id; try { localStorage.setItem('cx-game-pid', JSON.stringify(GA.ids)); } catch (e) { } }
  return (a.tid = id);
}
/* everything an actor appeared in (movies and shows), from Seerr */
function gCredits(a) {
  return gPersonId(a).then(id => {
    if (!id) return null; if (GA.cr.has(id)) return GA.cr.get(id);
    const p = seerrGet('/person/' + id + '/combined_credits').then(r => {
      const seen = new Set(), out = [];
      (r.cast || []).forEach(x => {
        if ((x.mediaType !== 'movie' && x.mediaType !== 'tv') || !x.posterPath) return; if ((x.genreIds || []).some(g => g === 10767 || g === 10763 || g === 10764)) return; // talk shows, news, reality
        const k = x.mediaType + x.id; if (seen.has(k)) return; seen.add(k); if (/archive|uncredited/i.test(x.character || '')) return;
        const date = x.releaseDate || x.firstAirDate || ''; out.push({ id: x.id, mt: x.mediaType, title: x.title || x.name || '', year: +date.slice(0, 4) || 0, date, poster: x.posterPath, bd: x.backdropPath || '', votes: x.voteCount || 0, rating: x.voteAverage || 0, pop: x.popularity || 0, role: (x.character || '').replace(/\s*\(.*?\)\s*/g, '').trim(), overview: x.overview || '', fame: (x.mediaType === 'tv' ? .6 : 1) * (x.voteCount || 0) + (x.popularity || 0) * 2 });
      });
      return out;
    }).catch(() => { GA.cr.delete(id); return null; });
    GA.cr.set(id, p); return p;
  });
}
const gTopFamous = (cr, n) => (cr || []).filter(c => c.votes >= 60).sort((x, y) => y.fame - x.fame).slice(0, n || 8);
const gCtx = async () => { const [lm, rm] = await Promise.all([libMap(), reqMap()]); await recoInit().catch(() => { }); return { lm, rm }; };
const gCredX = c => ({ id: c.id, mediaType: c.mt, title: c.title, name: c.title, posterPath: c.poster, backdropPath: c.bd, releaseDate: c.date, firstAirDate: c.date, voteAverage: c.rating, overview: c.overview });
function gCredState(c, ctx) { const x = gCredX(c); const s = dStatus(x, ctx.lm, ctx.rm); return { seen: rcSeen(x, ctx.lm), own: ctx.lm[c.mt + ':' + c.id] || null, req: s.k === 'req' }; }

/* ----- scenes: a picture from the film, with the actor when the server has a TMDB key ----- */
function gScenesFor(a, filmTmdb) {
  if (cfg('quizScenes') === false || !(C.status && C.status.tmdb) || !filmTmdb) return Promise.resolve([]);
  return gPersonId(a).then(id => {
    if (!id) return []; if (!GA.tagged.has(id)) GA.tagged.set(id, (async () => {
      const map = {}; for (let pg = 1; pg <= 3; pg++) { const r = await api('Cinema/tmdb/person/' + id + '/tagged_images', { page: pg }).catch(() => null); if (!r || !Array.isArray(r.results)) break; r.results.forEach(x => { const mid = (x.media && x.media.id) || x.media_id; if (mid && x.file_path) (map[mid] = map[mid] || []).push(x.file_path); }); if (pg >= (r.total_pages || 1)) break; }
      return map; })());
    return GA.tagged.get(id).then(m => (m[filmTmdb] || []).slice(0, 3).map(p => TM(p, 'w780')));
  }).catch(() => []);
}
function gFillScene(el, a, filmTmdb, fallback) {
  if (cfg('quizScenes') === false) return; const set = (u, tagged) => { el.style.backgroundImage = 'url("' + u + '")'; el.classList.add('has-scene'); if (tagged) el.classList.add('tagged'); };
  if (fallback) set(fallback, false); gScenesFor(a, filmTmdb).then(l => { if (l.length) set(l[0], true); });
}

/* ----- follow ----- */
function gFollow(a, on) {
  const st = GM.st; st.fav = st.fav || {}; if (on === undefined) on = !st.fav[a.k];
  if (on) st.fav[a.k] = { n: a.name, i: a.img, p: a.pid || 0, t: a.tid || 0, at: Date.now() }; else delete st.fav[a.k]; a.fav = on;
  st.badges && gBadgesCheck(st).forEach(b => toast(gBadgeTxt(b)[0])); gSave(); GA.newAt = 0; return on;
}
function gHeart(a, cls) {
  const b = h('button', { class: 'gm-heart ' + (cls || ''), 'aria-label': t('gFavFollow'), onclick: e => { e.stopPropagation(); const on = gFollow(a); set(on); toast(on ? '♥ ' + a.name : a.name); } });
  const set = on => { b.classList.toggle('on', on); b.textContent = on ? '♥' : ''; b.title = on ? t('gFavFollowing') : t('gFavFollow'); }; set(gIsFav(GM.st, a)); return b;
}
/* followed actors that are not in the pool (followed from a person page): quiz them with their face */
function gMergeFavs(P, st) {
  Object.keys(st.fav || {}).forEach(k => { let a = P.actors.get(k); if (!a) { const f = st.fav[k]; if (!f.i) return; a = { k, name: f.n, img: f.i, pid: f.p || null, tid: f.t || 0, films: [], roles: {}, score: .5, last: 0, extra: true }; P.actors.set(k, a); P.list.push(a); P.fresh.push(a); P.top.push(a); } a.fav = true; });
}
const gFavActor = k => { const f = GM.st.fav[k]; return (GM.pool && GM.pool.actors.get(k)) || { k, name: f.n, img: f.i, pid: f.p || null, tid: f.t || 0 }; };
function gActorCard(a, st, sub) { const fav = gIsFav(st, a); return h('button', { class: 'gm-pc' + (fav ? ' fav' : ''), onclick: () => gActorDialog(a) }, gFace(a, 'pc'), h('b', { class: 'ell' }, a.name), h('small', {}, sub), gStars(gBox(st, a.k), 'sm'), fav ? h('span', { class: 'gm-pcf' }, '♥') : null); }

/* ----- "known from": your films with the role, a scene, and the best known films ----- */
function gFamousStrip(a, n) {
  if (cfg('quizFamous') === 'seen' || !hasSeerr()) return null; const box = h('div', { class: 'gm-fam' });
  (async () => { const cr = await gCredits(a); const top = gTopFamous(cr, n || 5); if (!top.length || !box.isConnected) return; const ctx = await gCtx();
    box.append(h('small', {}, t('gFamous')), h('div', { class: 'gm-kf' }, top.map(c => { const s = gCredState(c, ctx); return h('div', { class: 'gm-kfi fam' + (s.seen ? ' seen' : ''), onclick: e => { e.stopPropagation(); if (s.own) go(itemHash(s.own)); else openSeerrInfo({ id: c.id, mediaType: c.mt }); } }, h('div', Object.assign({ class: 'gm-kp' }, bg(TM(c.poster, 'w154')))), h('div', {}, h('b', {}, c.title + (c.year ? ' (' + c.year + ')' : '')), c.role ? h('span', { class: 'gm-role2' }, t('gAsRole') + ' ' + c.role) : null, s.seen ? h('em', {}, t('gStWatched')) : null)); }))); })().catch(() => { });
  return box;
}
function gKnownFrom(P, a, n) {
  const fs = gFilmsOf(P, a, n || 3); const fam = gFamousStrip(a, 5); if (!fs.length && !fam) return null; const box = h('div', { class: 'gm-known' });
  if (fs.length) box.append(h('small', {}, t('gKnownFrom')), h('div', { class: 'gm-kf' }, fs.map(f => { const el = h('div', { class: 'gm-kfi' }, h('div', Object.assign({ class: 'gm-kp' }, bg(f.poster))), h('div', {}, h('b', {}, f.title + (f.year ? ' (' + f.year + ')' : '')), a.roles[f.id] ? h('span', { class: 'gm-role2' }, t('gAsRole') + ' ' + a.roles[f.id]) : null)); gFillScene(el, a, f.tmdb, f.bd); return el; })));
  if (fam) box.append(fam); return box;
}

/* ----- the actor dialog: watched, best known, everything ----- */
function gFilmRow(o, a, close) {
  const sc = h('div', { class: 'gm-frs' }); const stT = o.seen ? ['seen', t('gStWatched')] : o.own ? ['lib', t('gStLib')] : o.req ? ['req', t('gStReq')] : ['none', '＋ ' + t('gStNone')];
  const el = h('div', { class: 'gm-fr', onclick: () => { if (o.own) { close(); go(itemHash(o.own)); } else if (o.tmdb) openSeerrInfo({ id: o.tmdb, mediaType: o.mt || 'movie' }); } },
    o.rank ? h('em', { class: 'gm-frr' }, String(o.rank)) : null, h('div', Object.assign({ class: 'gm-frp' }, bg(o.poster))),
    h('div', { class: 'gm-frt' }, h('b', { class: 'ell' }, o.title + (o.year ? ' (' + o.year + ')' : '')), o.role ? h('span', { class: 'gm-role2' }, t('gAsRole') + ' ' + o.role) : null, h('div', { class: 'gm-fst ' + stT[0] }, stT[1], o.mt === 'tv' ? h('i', {}, t('shows')) : null)), sc);
  if (o.scene !== false) gFillScene(sc, a, o.tmdb, o.bd); return el;
}
function gActorDialog(a) {
  const st = GM.st, P = GM.pool; const s = st.a[a.k]; const d = cxDialog(a.name, { wide: true }); let tab = 'seen', typeF = 'all', q = '', onlyUnseen = false, shown = 50; const more = hasSeerr();
  const next = s && s[0] > 0 ? (s[1] <= gDay() ? t('gDueNow') : t('gInDays').replace('{n}', s[1] - gDay())) : t('gNever');
  const head = h('div', { class: 'gm-ad' }, gFace(a, 'xl'), h('div', {}, h('div', { class: 'gm-nrow' }, h('h2', {}, a.name), gHeart(a)), gStars(s ? s[0] : 0),
    h('dl', { class: 'nf-facts' }, h('dt', {}, t('gSeenIn')), h('dd', {}, a.films.length + ' ' + t('gFilmsN')), h('dt', {}, t('gRightWrong')), h('dd', {}, s ? s[3] + ' / ' + s[4] : '–'), h('dt', {}, t('gNextReview')), h('dd', {}, next))));
  const tabs = h('div', { class: 'nf-seasons' }, [['seen', t('gTabSeen') + ' · ' + a.films.length], more ? ['famous', t('gTabFamous')] : null, more ? ['all', t('gTabAll')] : null].filter(Boolean).map(([k, l]) => h('button', { class: 'nf-chip' + (k === tab ? ' on' : ''), onclick: e => { tab = k; shown = 50; $$('.nf-chip', tabs).forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw(); } }, l)));
  const tools = h('div', { class: 'gm-frtools' }); const list = h('div', { class: 'gm-frl' });
  async function draw() {
    tools.replaceChildren(); list.replaceChildren();
    if (tab === 'seen') { const fs = gFilmsOf(P, a); list.append(...(fs.length ? fs.map(f => gFilmRow({ title: f.title, year: f.year, poster: f.poster, role: a.roles[f.id], seen: true, own: f.jf ? { Id: f.jf, Type: 'Movie' } : null, tmdb: f.tmdb, bd: f.bd, mt: 'movie' }, a, d.close)) : [h('div', { class: 'nf-empty', style: 'padding:24px 0' }, t('gNoCredits'))])); return; }
    list.append(h('div', { class: 'spinner', style: 'margin:30px auto' })); const my = tab; const [cr, ctx] = await Promise.all([gCredits(a), gCtx()]); if (my !== tab || !list.isConnected) return; list.replaceChildren();
    if (!cr || !cr.length) { list.append(h('div', { class: 'nf-empty', style: 'padding:24px 0' }, t('gNoCredits'))); return; }
    const rowOf = (c, rank) => { const s2 = gCredState(c, ctx); return gFilmRow({ title: c.title, year: c.year, poster: TM(c.poster, 'w154'), role: c.role, seen: s2.seen, own: s2.own, req: s2.req, tmdb: c.id, mt: c.mt, bd: c.bd ? TM(c.bd, 'w780') : '', rank, scene: tab === 'famous' }, a, d.close); };
    if (tab === 'famous') { list.append(...gTopFamous(cr, 15).map((c, i) => rowOf(c, i + 1))); return; }
    const flt = () => cr.filter(c => (typeF === 'all' || c.mt === typeF) && (!q || c.title.toLowerCase().includes(q)) && (!onlyUnseen || !gCredState(c, ctx).seen)).sort((x, y) => (Date.parse(y.date) || 0) - (Date.parse(x.date) || 0));
    const body = h('div', {}); const cnt = h('small', { class: 'gm-secp' }); const draw2 = () => { const all = flt(); cnt.textContent = t('gAllN').replace('{n}', all.length); body.replaceChildren(...all.slice(0, shown).map(c => rowOf(c)), ...(all.length > shown ? [h('button', { class: 'btn grey gm-more', onclick: () => { shown += 60; draw2(); } }, t('gMoreRows'))] : [])); };
    tools.append(h('div', { class: 'gm-filt' }, [['all', t('gAll')], ['movie', t('movies')], ['tv', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === typeF ? ' on' : ''), onclick: e => { typeF = v; shown = 50; $$('.nf-chip', e.currentTarget.parentElement).forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw2(); } }, l)),
      h('label', { class: 'dc-tg' }, h('input', { type: 'checkbox', onchange: e => { onlyUnseen = e.target.checked; shown = 50; draw2(); } }), h('i'), h('span', {}, t('gOnlyUnseen'))), h('input', { type: 'search', class: 'gm-find', placeholder: t('gSearchF'), oninput: e => { q = e.target.value.trim().toLowerCase(); shown = 50; draw2(); } })), cnt);
    list.append(body); draw2();
  }
  d.body.replaceChildren(head, tabs, tools, list); draw();
  d.foot.replaceChildren(a.pid ? h('a', { class: 'btn grey', href: '#/c/person/' + a.pid, onclick: () => d.close() }, ic('user'), t('gProfile')) : null, h('button', { class: 'btn white', onclick: d.close }, 'OK'));
}

/* ----- favourites on the dashboard and new films of the people you follow ----- */
async function gFollowNew() {
  const st = await gLoad(); const keys = Object.keys(st.fav || {}); if (!keys.length || !hasSeerr()) return [];
  if (GA.newAt && Date.now() - GA.newAt < 600000 && GA.newList) return GA.newList;
  const ctx = await gCtx(); const cut = Date.now() - 400 * 864e5; const out = new Map(); let i = 0;
  const worker = async () => { while (i < keys.length && i < 12) { const k = keys[i++]; const a = gFavActor(k); const cr = await gCredits(a); (cr || []).forEach(c => { if (!c.date || Date.parse(c.date) < cut) return; const s = gCredState(c, ctx); if (s.seen || s.own) return; const key = c.mt + c.id; if (out.has(key)) return; out.set(key, Object.assign(gCredX(c), { _why: a.name + (c.role ? ' · ' + c.role : ''), _d: Date.parse(c.date) })); }); } };
  await Promise.all([worker(), worker(), worker(), worker()]); GA.newList = [...out.values()].sort((x, y) => y._d - x._d).slice(0, 24); GA.newAt = Date.now(); return GA.newList;
}
function gFavSection(wrap, st, P) {
  const favs = Object.keys(st.fav || {}).filter(k => P.actors.get(k) || st.fav[k].i); const sec = h('section', { class: 'gm-sec' });
  if (!favs.length) { sec.append(h('h2', {}, t('gFavs')), h('p', { class: 'gm-secp' }, t('gFavNone'))); wrap.append(sec); return; }
  sec.append(h('div', { class: 'gm-favh' }, h('h2', {}, '♥ ' + t('gFavs') + ' · ' + favs.length), h('button', { class: 'nf-chip', onclick: () => gPlay('train', { fav: true }) }, ic('play', 'ic-s'), t('gFavTrain'))), h('div', { class: 'gm-pcs' }, favs.map(k => { const a = P.actors.get(k) || gFavActor(k); return gActorCard(a, st, a.films && a.films.length ? a.films.length + ' ' + t('gFilmsN') : t('gFavN')); })));
  const strip = h('div', {}); sec.append(strip); wrap.append(sec);
  if (hasSeerr()) Promise.all([gFollowNew(), gCtx()]).then(([list, ctx]) => { if (!list.length || !strip.isConnected) return; strip.append(row(t('gFavNew'), list, 'poster', { make: x => dCard(x, ctx.lm, ctx.rm), tag: t('rcDiscoverTag') })); }).catch(() => { });
}
/* home page row */
function followRow(container) {
  if (!cfg('quiz')) return; const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => { if (!(await waitSeerr())) return ph.remove(); const [list, ctx] = await Promise.all([gFollowNew(), gCtx()]); if (list.length < 2) return ph.remove(); ph.replaceWith(row(t('gFavNew'), list, 'poster', { make: x => dCard(x, ctx.lm, ctx.rm), tag: t('rcDiscoverTag'), href: '#/c/quiz' })); })().catch(() => ph.remove());
}
/* follow button on a person page */
function gPersonFollow(p) {
  if (!cfg('quiz')) return null; const a = { k: lbNorm(p.Name), name: p.Name, img: imgUrl(p, 'Primary', 300), pid: p.Id, tid: +((p.ProviderIds || {}).Tmdb) || 0 }; if (!a.img) return null;
  const b = h('button', { class: 'btn grey gm-follow' }, t('gFavFollow')); const set = on => { b.classList.toggle('on', on); b.textContent = (on ? '♥ ' + t('gFavFollowing') : t('gFavFollow')); };
  gLoad().then(() => set(gIsFav(GM.st, a))); b.onclick = async () => { await gLoad(); const on = gFollow(a); set(on); toast(on ? '♥ ' + p.Name : p.Name); }; return b;
}
