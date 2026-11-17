/* ---------- Recommendations that know what you watched, labelled Discover rows for the home page, and "What shall we watch tonight?" ---------- */
Object.assign(TX.en, {
  rcNew: 'New', rcDiscoverTag: 'Discover', rcDiscoverHint: 'Not in your library yet', rcForYou: 'Recommended for you', rcFresh: 'New and unwatched', rcMoreWith: 'More with', rcMoreFrom: 'More from', rcWhyLike: 'Like', rcTaste: 'Your taste', rcTasteHint: 'Based on {n} watched films. Tap a genre to explore it.', rcNewIn: 'New in', rcHideSeen: 'Hide watched',
  rcSeenSet: 'Watched and new films on the home page', rcSeenBadge: 'Mark them', rcSeenHide: 'Hide watched films', rcSeenOff: 'Do nothing', rcSeenHint: 'Watched films get a check mark and new arrivals a "New" label. Or hide watched films in browsing rows.',
  tnTitle: 'What shall we watch tonight?', tnSub: 'Tell us how much time and what mood you have, and we pick three films from your library.', tnTime: 'Time', tnMood: 'Mood', tnAny: 'Any', tnShort: 'Short (up to 100 min)', tnMid: '100 to 140 min', tnLong: 'Long (140 min and more)',
  tnThrill: 'Thrilling', tnFunny: 'Funny', tnEmo: 'Emotional', tnLight: 'Light', tnThink: 'Thoughtful', tnAction: 'Action', tnScary: 'Scary', tnFamily: 'Family', tnOnlyNew: 'Only films I have not seen', tnAgain: 'Pick again', tnSurprise: 'Surprise me', tnSkip: 'Not tonight', tnPlay: 'Watch now', tnEnds: 'Done at {t}', tnNone: 'Nothing fits. Try another mood or time, or include films you have seen.',
  tnWhyWl: 'On your watchlist', tnWhyNew: 'Just added', tnWhyTaste: 'Fits your taste', tnWhyRated: 'Highly rated', tnWhyUnseen: 'You have not seen it', tnWhyClassic: 'A rewatch candidate', tnResume: 'You were in the middle of', tnLeft: 'left', tnBannerSub: 'Three picks from your library, based on time and mood.', tnGo: 'Choose'
});
Object.assign(TX.de, {
  rcNew: 'Neu', rcDiscoverTag: 'Entdecken', rcDiscoverHint: 'Noch nicht in deiner Bibliothek', rcForYou: 'Empfohlen für dich', rcFresh: 'Neu und ungesehen', rcMoreWith: 'Mehr mit', rcMoreFrom: 'Mehr von', rcWhyLike: 'Wie', rcTaste: 'Dein Geschmack', rcTasteHint: 'Basierend auf {n} gesehenen Filmen. Tippe ein Genre an, um es zu erkunden.', rcNewIn: 'Neu in', rcHideSeen: 'Gesehene ausblenden',
  rcSeenSet: 'Gesehene und neue Filme auf der Startseite', rcSeenBadge: 'Markieren', rcSeenHide: 'Gesehene ausblenden', rcSeenOff: 'Nichts tun', rcSeenHint: 'Gesehene Filme bekommen ein Häkchen, neue Filme das Label „Neu". Oder blende gesehene Filme in den Stöber-Reihen aus.',
  tnTitle: 'Was schauen wir heute?', tnSub: 'Sag uns, wie viel Zeit und welche Stimmung du hast, und wir suchen drei Filme aus deiner Bibliothek aus.', tnTime: 'Zeit', tnMood: 'Stimmung', tnAny: 'Egal', tnShort: 'Kurz (bis 100 Min.)', tnMid: '100 bis 140 Min.', tnLong: 'Lang (ab 140 Min.)',
  tnThrill: 'Spannend', tnFunny: 'Lustig', tnEmo: 'Emotional', tnLight: 'Leicht', tnThink: 'Nachdenklich', tnAction: 'Action', tnScary: 'Gruselig', tnFamily: 'Familie', tnOnlyNew: 'Nur Filme, die ich nicht kenne', tnAgain: 'Nochmal auswählen', tnSurprise: 'Überrasch mich', tnSkip: 'Heute nicht', tnPlay: 'Jetzt ansehen', tnEnds: 'Fertig um {t}', tnNone: 'Nichts passt. Versuche eine andere Stimmung oder Zeit, oder nimm auch Filme dazu, die du schon kennst.',
  tnWhyWl: 'Auf deiner Watchlist', tnWhyNew: 'Gerade hinzugekommen', tnWhyTaste: 'Passt zu deinem Geschmack', tnWhyRated: 'Stark bewertet', tnWhyUnseen: 'Noch nicht gesehen', tnWhyClassic: 'Kandidat zum Wiederschauen', tnResume: 'Du warst mittendrin in', tnLeft: 'übrig', tnBannerSub: 'Drei Vorschläge aus deiner Bibliothek, nach Zeit und Stimmung.', tnGo: 'Auswählen'
});

/* ----- what you watched: seen films, genre taste, favourite actors and directors ----- */
const RC = { p: null, at: 0, data: null, fy: null, fyAt: 0 };
function recoInit() {
  if (RC.p && Date.now() - RC.at < 600000) return RC.p; RC.at = Date.now();
  RC.p = (async () => {
    const pm = await gPlayed(); const played = pm.Items || []; if (optOn('letterboxd') && lbUser()) await lbLoad().catch(() => { });
    const seenTm = new Set(played.map(i => +(i.ProviderIds || {}).Tmdb).filter(Boolean));
    const gc = {}; played.forEach(i => (i.Genres || []).forEach(g => { gc[g] = (gc[g] || 0) + 1; })); const tot = Object.values(gc).reduce((a, b) => a + b, 0) || 1; const share = {}; Object.keys(gc).forEach(g => { share[g.toLowerCase()] = gc[g] / tot; });
    const people = { actor: {}, director: {} };
    played.forEach(i => (i.People || []).forEach((p, idx) => { const k = p.Type === 'Actor' && idx < 8 ? 'actor' : p.Type === 'Director' ? 'director' : null; if (!k) return; const e = people[k][p.Name] || (people[k][p.Name] = { id: p.Id, name: p.Name, n: 0 }); e.n++; }));
    RC.data = { played, seenTm, gc, share, people, total: played.length }; return RC.data;
  })().catch(e => { RC.p = null; throw e; });
  return RC.p;
}
/* has this film (library item or Seerr result) been watched, in Jellyfin or on Letterboxd? */
function rcSeen(x, lm) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie'; const lib = lm && lm[mt + ':' + x.id]; if (lib && ud(lib).Played) return true;
  if (mt === 'movie' && RC.data && RC.data.seenTm.has(+x.id)) return true; return !!lbSeen(x);
}
function cardBadges(it, im) {
  const mode = cfg('homeSeen'); if (mode === 'off' || (it.Type !== 'Movie' && it.Type !== 'Series')) return; const u = ud(it);
  if (!u.Played && !pct(it) && it.DateCreated && Date.now() - Date.parse(it.DateCreated) < 14 * 864e5) im.append(h('span', { class: 'rc-new' }, t('rcNew')));
  else if (u.Played) im.append(h('span', { class: 'rc-seen', title: t('watched') }, ic('check', 'ic-s')));
}
/* ----- "picked for you": Seerr recommendations for what you liked, minus what you own or have seen ----- */
async function recoForYou() {
  if (RC.fy && Date.now() - RC.fyAt < 600000) return RC.fy;
  const [D, lm, rm, genres] = await Promise.all([recoInit(), libMap(), reqMap(), dcGenres()]); const gname = {}; genres.movie.concat(genres.tv).forEach(g => { gname[g.id] = g.name.toLowerCase(); });
  const played = D.played.filter(i => (i.ProviderIds || {}).Tmdb); const seeds = []; const add = i => { if (i && !seeds.includes(i)) seeds.push(i); };
  played.filter(i => ud(i).IsFavorite).slice(0, 3).forEach(add); if (LB.n) played.filter(i => { const e = lbMatch(i); return e && e.rating >= 4.5; }).slice(0, 4).forEach(add); played.slice(0, 6).forEach(add);
  const lists = await Promise.all(seeds.slice(0, 9).map(i => seerrGet('/movie/' + i.ProviderIds.Tmdb + '/recommendations', { page: 1 }).then(r => ({ seed: i, res: r.results || [] })).catch(() => ({ seed: i, res: [] }))));
  const map = new Map();
  lists.forEach(({ seed, res }) => res.forEach(x => { x.mediaType = 'movie'; if (dStatus(x, lm, rm).k === 'own' || rcSeen(x, lm)) return; const c = map.get(x.id) || { x, hits: 0, seeds: [] }; c.hits++; c.seeds.push(seed.Name); map.set(x.id, c); }));
  const out = [...map.values()].map(c => { const aff = (c.x.genreIds || []).reduce((a, id) => a + (D.share[gname[id]] || 0), 0); return Object.assign(c, { score: c.hits * 1.6 + (c.x.voteAverage || 0) / 4 + Math.min(1, Math.log10((c.x.voteCount || 1) + 1) / 4) + aff * 2.5 }); }).sort((a, b) => b.score - a.score).slice(0, 24)
    .map(c => Object.assign(c.x, { _why: t('rcWhyLike') + ' ' + c.seeds.slice(0, 2).join(', ') })); RC.fy = out; RC.fyAt = Date.now(); return out;
}
function forYouRow(container) {
  if (!cfg('recommendations')) return;
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => { if (!(await waitSeerr())) return ph.remove(); const [list, lm, rm] = await Promise.all([recoForYou(), libMap(), reqMap()]); if (list.length < 4) return ph.remove(); ph.replaceWith(row(t('rcForYou'), list, 'poster', { make: x => dCard(x, lm, rm), tag: t('rcDiscoverTag'), href: '#/c/discover' })); })().catch(() => ph.remove());
}
/* ----- more with the actor / director you watched most ----- */
function peopleRow(container, kind) {
  if (!cfg('recommendations')) return;
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => {
    if (!(await waitSeerr())) return ph.remove(); const D = await recoInit(); const top = Object.values(D.people[kind]).filter(p => p.n >= 2).sort((a, b) => b.n - a.n).slice(0, 4); if (!top.length) return ph.remove();
    const pick = top[Math.floor(Date.now() / 864e5) % top.length]; const person = await getItem(pick.id); const tm = (person.ProviderIds || {}).Tmdb; if (!tm) return ph.remove();
    const [lm, rm, cr] = await Promise.all([libMap(), reqMap(), seerrGet('/person/' + tm + '/combined_credits')]);
    const src = kind === 'actor' ? (cr.cast || []) : (cr.crew || []).filter(c => c.job === 'Director'); const seen = new Set();
    const list = src.filter(x => x.mediaType === 'movie' && x.posterPath && (x.voteCount || 0) > 150).filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).filter(x => dStatus(x, lm, rm).k !== 'own' && !rcSeen(x, lm)).sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 20);
    if (list.length < 3) return ph.remove(); list.forEach(x => { x._why = pick.n + ' ' + t('gFilmsN') + ' ' + (L === 'de' ? 'bei dir' : 'watched'); });
    ph.replaceWith(row((kind === 'actor' ? t('rcMoreWith') : t('rcMoreFrom')) + ' ' + pick.name, list, 'poster', { make: x => dCard(x, lm, rm), tag: t('rcDiscoverTag'), href: '#/c/person/' + pick.id }));
  })().catch(() => ph.remove());
}
/* rich personal block for the Discover page */
async function richPersonal(container, make, lm, rm) {
  if (!cfg('recommendations')) return;
  try {
    const D = await recoInit(); const genres = await dcGenres();
    forYouRow(container); peopleRow(container, 'actor'); peopleRow(container, 'director');
    const withId = D.played.filter(i => (i.ProviderIds || {}).Tmdb); const off = Math.floor(Date.now() / 864e5) % Math.max(1, Math.min(6, withId.length));
    [withId[off], withId[(off + 3) % Math.max(1, withId.length)]].filter(Boolean).filter((i, k, a) => a.indexOf(i) === k).forEach(i => lazyRow(container, t('because') + ' ' + i.Name, () => seerrGet('/movie/' + i.ProviderIds.Tmdb + '/recommendations', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own' && !rcSeen(x, lm))), 'poster', { make, min: 4 }));
    const top = Object.entries(D.gc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]); const year = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
    top.forEach(name => { const g = genres.movie.find(x => x.name === name); if (g) lazyRow(container, t('rcNewIn') + ' ' + name, () => seerrGet('/discover/movies', { page: 1, genre: g.id, sortBy: 'popularity.desc', primaryReleaseDateGte: year }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own' && !rcSeen(x, lm))), 'poster', { make, min: 4 }); });
  } catch (e) { console.warn('[cinema] personal rows', e); }
}
function tasteBar(onPick) {
  const host = h('div', { class: 'rc-taste' }); if (!cfg('recommendations')) return host;
  recoInit().then(D => { const top = Object.entries(D.gc).sort((a, b) => b[1] - a[1]).slice(0, 6); if (!top.length) return; const tot = Object.values(D.gc).reduce((a, b) => a + b, 0);
    host.append(h('div', {}, h('b', {}, t('rcTaste')), h('small', {}, t('rcTasteHint').replace('{n}', D.total))), h('div', { class: 'rc-chips' }, top.map(([g, n]) => h('button', { class: 'nf-chip', onclick: () => onPick(g) }, g, h('em', {}, Math.round(n / tot * 100) + '%'))))); }).catch(() => { });
  return host;
}

/* ----- What shall we watch tonight? ----- */
const TN = { lib: null, at: 0, time: 'any', mood: 'any', unseen: true, picks: [] };
const TN_MOODS = { any: null, thrill: /thriller|crime|mystery|krimi|spannung|mystère/i, funny: /comedy|kom[oö]die/i, emo: /drama|romance|liebe|romant/i, light: /comedy|kom[oö]die|animation|zeichentrick|family|familie|romance|liebe/i, think: /documentary|dokument|history|geschichte|science fiction|sci-fi|drama/i, action: /action|adventure|abenteuer|war|krieg/i, scary: /horror|grusel/i, family: /family|familie|animation|zeichentrick/i };
const TN_MOOD_ICON = { any: '', thrill: '', funny: '', emo: '', light: '', think: '', action: '', scary: '', family: '' };
async function tnLoad() {
  if (TN.lib && Date.now() - TN.at < 300000) return TN.lib; TN.at = Date.now();
  const [r, wl] = await Promise.all([items({ IncludeItemTypes: 'Movie', Fields: F_BASE + ',ProviderIds', Limit: 6000, EnableImageTypes: 'Primary,Backdrop', ImageTypeLimit: 1 }), items({ IncludeItemTypes: 'Movie', Filters: 'Likes', Limit: 2000, Fields: '' }).catch(() => ({ Items: [] }))]);
  const wlIds = new Set((wl.Items || []).map(i => i.Id)); TN.lib = (r.Items || []).map(it => Object.assign(it, { _wl: wlIds.has(it.Id), _mins: it.RunTimeTicks ? it.RunTimeTicks / 6e8 : 0 })); return TN.lib;
}
function tnPick(lib, D, n, exclude) {
  const mood = TN_MOODS[TN.mood]; const cut = Date.now() - 30 * 864e5;
  let pool = lib.filter(m => m._mins >= 40 && (!mood || (m.Genres || []).some(g => mood.test(g))) && !exclude.has(m.Id));
  if (TN.time === 'short') pool = pool.filter(m => m._mins <= 100); else if (TN.time === 'mid') pool = pool.filter(m => m._mins > 100 && m._mins <= 140); else if (TN.time === 'long') pool = pool.filter(m => m._mins > 140);
  if (TN.unseen) pool = pool.filter(m => !ud(m).Played);
  const scored = pool.map(m => { const aff = (m.Genres || []).reduce((a, g) => a + (D.share[g.toLowerCase()] || 0), 0); const fresh = m.DateCreated && Date.parse(m.DateCreated) > cut; const why = []; if (m._wl) why.push('tnWhyWl'); if (fresh) why.push('tnWhyNew'); if (aff > .18) why.push('tnWhyTaste'); if ((m.CommunityRating || 0) >= 7.5) why.push('tnWhyRated'); if (!ud(m).Played) why.push('tnWhyUnseen'); else why.push('tnWhyClassic');
    return { m, why, s: (m.CommunityRating || 6) / 10 + aff * 1.3 + (m._wl ? .4 : 0) + (fresh ? .25 : 0) + Math.random() * .45 }; }).sort((a, b) => b.s - a.s).slice(0, 14);
  const out = []; while (out.length < n && scored.length) { const i = Math.min(scored.length - 1, Math.floor(Math.pow(Math.random(), 1.8) * scored.length)); out.push(scored.splice(i, 1)[0]); } return out;
}
async function tonightView(page) {
  const wrap = h('div', { class: 'nf-page-pad tn-page' }, h('h1', {}, t('tnTitle')), h('p', { class: 'gm-secp' }, t('tnSub'))); page.append(wrap);
  const mq = parse().q.get('mood'); if (mq && TN_MOODS[mq] !== undefined) TN.mood = mq;
  wrap.append(h('div', { class: 'spinner', style: 'margin:60px auto' })); let lib, D; try { [lib, D] = await Promise.all([tnLoad(), recoInit()]); } catch (e) { wrap.replaceChildren(h('div', { class: 'nf-empty' }, (e.message || e))); return; } wrap.querySelector('.spinner').remove();
  const resume = await api('Users/' + uid() + '/Items/Resume', { Limit: 2, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop', ImageTypeLimit: 1 }).then(r => r.Items || []).catch(() => []);
  const res = h('div', { class: 'tn-res' });
  const chip = (cur, v, label, set) => h('button', { class: 'nf-chip' + (cur === v ? ' on' : ''), onclick: e => { set(v); $$('.nf-chip', e.currentTarget.parentElement).forEach(c => c.classList.toggle('on', c === e.currentTarget)); roll(); } }, label);
  const timeRow = h('div', { class: 'nf-seasons', style: 'margin:0' }, [['any', t('tnAny')], ['short', t('tnShort')], ['mid', t('tnMid')], ['long', t('tnLong')]].map(([v, l]) => chip(TN.time, v, l, x => { TN.time = x; })));
  const moods = [['any', t('tnAny')], ['thrill', t('tnThrill')], ['funny', t('tnFunny')], ['emo', t('tnEmo')], ['light', t('tnLight')], ['think', t('tnThink')], ['action', t('tnAction')], ['scary', t('tnScary')], ['family', t('tnFamily')]];
  const moodRow = h('div', { class: 'tn-moods' }, moods.map(([v, l]) => h('button', { class: 'tn-mood' + (TN.mood === v ? ' on' : ''), onclick: e => { TN.mood = v; $$('.tn-mood', moodRow).forEach(c => c.classList.toggle('on', c === e.currentTarget)); roll(); } }, l)));
  const unseenCb = h('label', { class: 'dc-tg' }, h('input', { type: 'checkbox', checked: TN.unseen, onchange: e => { TN.unseen = e.target.checked; roll(); } }), h('i'), h('span', {}, t('tnOnlyNew')));
  wrap.append(h('div', { class: 'tn-filters' }, h('div', {}, h('small', {}, t('tnTime')), timeRow), h('div', {}, h('small', {}, t('tnMood')), moodRow), unseenCb));
  if (resume.length) wrap.append(h('div', { class: 'tn-resume' }, h('small', {}, t('tnResume')), h('div', {}, resume.map(it => h('button', { class: 'tn-rs', onclick: () => playVideo(it) }, h('div', Object.assign({ class: 'tn-rsp' }, bg(imgUrl(it, 'Primary', 120)))), h('div', {}, h('b', { class: 'ell' }, it.Type === 'Episode' ? (it.SeriesName || it.Name) : it.Name), h('span', {}, Math.round(100 - pct(it)) + '% ' + t('tnLeft'))), ic('play'))))));
  const act = h('div', { class: 'tn-act' }, h('button', { class: 'btn white', onclick: () => roll() }, ic('refresh'), t('tnAgain')), h('button', { class: 'btn grey', onclick: () => surprise() }, t('tnSurprise')));
  wrap.append(res, act);
  const card = (p, slot) => {
    const m = p.m; const end = new Date(Date.now() + m._mins * 60000).toLocaleTimeString(L === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const el = h('div', { class: 'tn-card' }, h('div', Object.assign({ class: 'tn-bd' }, bg(imgUrl(m, 'Backdrop', 780) || imgUrl(m, 'Primary', 500)))), h('div', Object.assign({ class: 'tn-poster', onclick: () => go(itemHash(m)) }, bg(imgUrl(m, 'Primary', 400)))),
      h('div', { class: 'tn-body' }, h('h2', { onclick: () => go(itemHash(m)) }, m.Name), h('div', { class: 'nf-meta' }, [m.ProductionYear, m.OfficialRating ? h('span', { class: 'badge' }, m.OfficialRating) : null, Math.round(m._mins) + ' ' + t('min'), m.CommunityRating ? '★ ' + m.CommunityRating.toFixed(1) : '', (m.Genres || []).slice(0, 2).join(', ')].filter(Boolean).map(x => x.nodeType ? x : h('span', {}, x))),
        h('p', { class: 'tn-ov' }, (m.Overview || '').replace(/<[^>]+>/g, '')), h('div', { class: 'tn-why' }, p.why.slice(0, 3).map(k => h('i', {}, t(k)))), h('div', { class: 'tn-end' }, t('tnEnds').replace('{t}', end)),
        h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: () => playVideo(m) }, ic('play'), t('tnPlay')), h('button', { class: 'btn grey', onclick: () => go(itemHash(m)) }, ic('info'), t('info')), h('button', { class: 'btn grey', onclick: () => { const ex = new Set(TN.picks.map(x => x.m.Id)); const n = tnPick(lib, D, 1, ex)[0]; if (n) { TN.picks[slot] = n; el.replaceWith(card(n, slot)); } else toast(t('tnNone')); } }, t('tnSkip')))));
    return el;
  };
  function roll() { TN.picks = tnPick(lib, D, 3, new Set()); res.classList.remove('spin'); void res.offsetWidth; res.classList.add('spin'); res.replaceChildren(...(TN.picks.length ? TN.picks.map(card) : [h('div', { class: 'nf-empty' }, t('tnNone'))])); }
  function surprise() { TN.mood = 'any'; TN.time = 'any'; $$('.tn-mood', moodRow).forEach((c, i) => c.classList.toggle('on', i === 0)); $$('.nf-chip', timeRow).forEach((c, i) => c.classList.toggle('on', i === 0)); const pool = lib.filter(m => m._mins >= 60 && !ud(m).Played); const flick = h('div', { class: 'tn-flick' }); res.replaceChildren(flick); let k = 0; const iv = setInterval(() => { const m = pool[Math.floor(Math.random() * pool.length)]; if (m) flick.style.backgroundImage = 'url("' + imgUrl(m, 'Primary', 300) + '")'; if (++k > 14) { clearInterval(iv); roll(); } }, 80); }
  roll();
}
function tonightBanner(container) {
  const moods = [['thrill', t('tnThrill')], ['funny', t('tnFunny')], ['light', t('tnLight')], ['action', t('tnAction')]];
  container.append(h('section', { class: 'tn-banner' }, h('div', { class: 'tn-bt' }, h('div', {}, h('h2', {}, t('tnTitle')), h('p', {}, t('tnBannerSub')))), h('div', { class: 'tn-bm' }, moods.map(([k, l]) => h('a', { class: 'nf-chip', href: '#/c/tonight?mood=' + k }, l)), h('a', { class: 'btn white sm', href: '#/c/tonight' }, ic('play'), t('tnGo')))));
}
