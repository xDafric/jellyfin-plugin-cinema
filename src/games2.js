/* ---------- more games built from the films you watched: odd one out, connection, still, plot, timeline, daily puzzle ---------- */
Object.assign(TX.en, {
  gOddM: 'Odd one out', gOddSub: 'Which of these actors was not in the film?', gBridgeM: 'Connection', gBridgeSub: 'Which film did these two actors share?', gStillM: 'Still', gStillSub: 'Recognise the film from a scene.', gPlotM: 'Plot', gPlotSub: 'Recognise the film from its story. The title is blanked out.', gTimeM: 'Timeline', gTimeSub: 'Put four films in the order they came out.', gDailyM: 'Daily puzzle', gDailySub: 'Eight mixed questions. Bonus XP once a day.',
  gDpDone: 'Done today', gDpBonus: '+{n} XP daily bonus', gOddQ: 'Who was not in', gBridgeQ: 'Which film did both of them act in?', gStillQ: 'Which film is this?', gPlotQ: 'Which film is this?', gTimeQ: 'Tap the films from oldest to newest.', gTimeOrder: 'Correct order', gNotEnoughG: 'Not enough films in your history for this game yet.', gWasIn: 'In the film', gSameFilm: 'Together in', gThatWas: 'It was',
  gMoreNew: 'Learn more faces', gPracticeWeak: 'Practise the shaky ones', gMixTrain: 'Mix training', gExtraSub: 'Go on after your daily goal: more new faces, or the ones you still mix up.', gTodayT: 'Today', gAnswersN: 'answers', gNewFacesN: 'new faces', gLearnedT: 'Faces learned', gOfN: 'of {n}', gNextMs: 'Next: {t}, {n} more', gAllLearned: 'You have met every face. Keep them fresh with the repetitions.', gStageNew: 'new', gStageLearning: 'learning', gStageKnown: 'known', gStageMastered: 'mastered', gShaky: 'shaky',
  qFocus: 'Which actors come first', qFocusH: 'Relevant: leading roles and actors from several films. All: also small roles.', qFocusCore: 'Relevant first', qFocusAll: 'Everyone'
});
Object.assign(TX.de, {
  gOddM: 'Außenseiter', gOddSub: 'Wer von ihnen war nicht im Film?', gBridgeM: 'Verbindung', gBridgeSub: 'In welchem Film spielten diese beiden zusammen?', gStillM: 'Standbild', gStillSub: 'Erkenne den Film an einer Szene.', gPlotM: 'Handlung', gPlotSub: 'Erkenne den Film an seiner Geschichte. Der Titel ist geschwärzt.', gTimeM: 'Zeitreise', gTimeSub: 'Bring vier Filme in die Reihenfolge ihres Erscheinens.', gDailyM: 'Tagesrätsel', gDailySub: 'Acht gemischte Fragen. Einmal pro Tag gibt es Bonus-XP.',
  gDpDone: 'Heute erledigt', gDpBonus: '+{n} XP Tagesbonus', gOddQ: 'Wer war nicht dabei in', gBridgeQ: 'In welchem Film spielten beide mit?', gStillQ: 'Welcher Film ist das?', gPlotQ: 'Welcher Film ist das?', gTimeQ: 'Tippe die Filme vom ältesten zum neuesten an.', gTimeOrder: 'Richtige Reihenfolge', gNotEnoughG: 'Dafür gibt es in deinem Verlauf noch zu wenige Filme.', gWasIn: 'Mit dabei waren', gSameFilm: 'Zusammen in', gThatWas: 'Das war',
  gMoreNew: 'Mehr neue Gesichter', gPracticeWeak: 'Wacklige üben', gMixTrain: 'Mix-Training', gExtraSub: 'Mach nach deinem Tagesziel weiter: mehr neue Gesichter, oder die, die du noch verwechselst.', gTodayT: 'Heute', gAnswersN: 'Antworten', gNewFacesN: 'neue Gesichter', gLearnedT: 'Gelernte Gesichter', gOfN: 'von {n}', gNextMs: 'Als Nächstes: {t}, noch {n}', gAllLearned: 'Du hast jedes Gesicht kennengelernt. Halte sie mit den Wiederholungen frisch.', gStageNew: 'neu', gStageLearning: 'lernend', gStageKnown: 'bekannt', gStageMastered: 'gemeistert', gShaky: 'wacklig',
  qFocus: 'Welche Schauspieler zuerst', qFocusH: 'Relevant: Hauptrollen und Schauspieler aus mehreren Filmen. Alle: auch kleine Rollen.', qFocusCore: 'Relevante zuerst', qFocusAll: 'Alle'
});

const G_NEWKINDS = ['odd', 'bridge', 'still', 'plot', 'timeline', 'daily'];
const gRnd = n => Math.floor(Math.random() * n);
const gFilmLabel = f => f.title + (f.year ? ' (' + f.year + ')' : '');
const gFilms = pred => [...GM.pool.films.values()].filter(pred);
const gEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* the story with the title (and its words) blanked out */
function gMask(f) {
  let s = (f.ov || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); if (!s) return '';
  const words = [...new Set(f.title.split(/[\s:,\-–—'’!?.&]+/).filter(w => w.length >= 3))].sort((a, b) => b.length - a.length);
  [f.title].concat(words).forEach(w => { try { s = s.replace(new RegExp('(?<![\\p{L}\\p{N}])' + gEsc(w) + '(?![\\p{L}\\p{N}])', 'giu'), '_____'); } catch (e) { } });
  if (s.length > 300) { const cut = s.lastIndexOf('. ', 300); s = cut > 120 ? s.slice(0, cut + 1) : s.slice(0, 300) + '…'; } return s;
}
function gAvail(kind, P) {
  const n = pred => { let c = 0; for (const f of P.films.values()) if (pred(f)) c++; return c; };
  switch (kind) {
    case 'odd': return n(f => f.cast.length >= 4) >= 4 && P.top.length >= 8;
    case 'bridge': return n(f => f.cast.length >= 2) >= 6;
    case 'still': return n(f => f.bd) >= 8;
    case 'plot': return n(f => (f.ov || '').length >= 90) >= 8;
    case 'timeline': { const y = new Set(); P.films.forEach(f => { if (f.year) y.add(f.year); }); return y.size >= 8; }
    default: return true;
  }
}
/* ----- question builders ----- */
function gqOdd(P) {
  const films = gFilms(f => f.cast.length >= 4); if (!films.length) return null; const f = films[gRnd(films.length)];
  const cast = f.cast.map(k => P.actors.get(k)).filter(Boolean); if (cast.length < 3) return null; const inFilm = gPick(cast, 3, () => false);
  const out = gPick(P.top, 1, x => f.cast.includes(x.k))[0]; if (!out) return null;
  return { mode: 'odd', key: f.id, film: f, others: inFilm, out, opts: shuffleArr(inFilm.map(a => ({ a })).concat([{ a: out, ok: 1 }])) };
}
function gqBridge(P) {
  const films = gFilms(f => f.cast.length >= 2); if (!films.length) return null; const f = films[gRnd(films.length)];
  const two = gPick(f.cast.map(k => P.actors.get(k)).filter(Boolean), 2, () => false); if (two.length < 2) return null; const [A, B] = two;
  const both = x => x.cast.includes(A.k) && x.cast.includes(B.k); const shared = gFilms(both); if (!shared.length) return null;
  const correct = shared[gRnd(shared.length)]; const partial = gPick(gFilms(x => !both(x) && (x.cast.includes(A.k) || x.cast.includes(B.k))), 2, () => false);
  const rest = gPick(gFilms(x => !both(x) && !partial.includes(x)), 3 - partial.length, () => false); const wrong = partial.concat(rest); if (wrong.length < 3) return null;
  return { mode: 'bridge', key: correct.id + A.k + B.k, two, film: correct, opts: shuffleArr([{ film: correct, ok: 1 }].concat(wrong.map(film => ({ film })))) };
}
function gqStill(P) {
  const films = gFilms(f => f.bd); if (films.length < 4) return null; const f = films[gRnd(films.length)]; const wrong = gPick(gFilms(x => x !== f), 3, () => false); if (wrong.length < 3) return null;
  return { mode: 'still', key: f.id, film: f, opts: shuffleArr([{ film: f, ok: 1 }].concat(wrong.map(film => ({ film })))) };
}
function gqPlot(P) {
  const films = gFilms(f => (f.ov || '').length >= 90); if (films.length < 4) return null; const f = films[gRnd(films.length)]; const text = gMask(f); if (text.length < 70) return null;
  const wrong = gPick(gFilms(x => x !== f), 3, () => false); if (wrong.length < 3) return null;
  return { mode: 'plot', key: f.id, film: f, text, opts: shuffleArr([{ film: f, ok: 1 }].concat(wrong.map(film => ({ film })))) };
}
function gqTime(P) {
  const films = gFilms(f => f.year); for (let i = 0; i < 40; i++) {
    const four = gPick(films, 4, () => false); if (four.length < 4) return null; const ys = four.map(f => f.year).sort((a, b) => a - b);
    if (ys.every((y, k) => k === 0 || y - ys[k - 1] >= 3)) return { mode: 'timeline', key: four.map(f => f.id).sort().join(), films: four.slice().sort((a, b) => a.year - b.year) };
  } return null;
}
const G_BUILD = { odd: gqOdd, bridge: gqBridge, still: gqStill, plot: gqPlot, timeline: gqTime };
function gBuildGame(kind, P) {
  const out = [], used = new Set(); const n = kind === 'timeline' ? 6 : 8;
  for (let tries = 0; out.length < n && tries < 80; tries++) { const q = G_BUILD[kind](P); if (!q || used.has(q.key)) continue; used.add(q.key); out.push({ g: true, q }); } return out;
}
function gBuildDaily(P, st) {
  const kinds = ['odd', 'bridge', 'still', 'plot', 'timeline'].filter(k => gAvail(k, P)); const items = [];
  const seen = P.list.filter(a => st.a[a.k]); const pool = seen.length >= 4 ? seen : P.top.slice(0, 30);
  for (let i = 0; i < 2; i++) items.push({ a: pool[gRnd(pool.length)], mode: 'face2name' });
  const withRole = pool.filter(a => a.films.some(id => gRoleOk(a.roles[id]))); if (withRole.length) items.push({ a: withRole[gRnd(withRole.length)], mode: 'role' });
  const lists = {}; kinds.forEach(k => { lists[k] = gBuildGame(k, P); if (lists[k].length) items.push(lists[k][0]); });
  for (let i = 1; items.length < 8 && i < 3; i++) kinds.forEach(k => { if (items.length < 8 && lists[k][i]) items.push(lists[k][i]); });
  return shuffleArr(items).slice(0, 8);
}

/* ----- rendering ----- */
function gRenderG(S, q) {
  const st = S.st; const card = h('div', { class: 'gm-card gm-g gm-' + q.mode }); S.stage.replaceChildren(card);
  let went = false; const next = () => { if (went) return; went = true; S.i++; gNextQ(S); };
  const fb = h('div', { class: 'gm-fb' });
  const done = (ok, expl, mistakes) => {
    S.n++; st.n++; const g = (st.g = st.g || {}); const e = g[q.mode] || (g[q.mode] = { n: 0, ok: 0 }); e.n++;
    if (ok) { e.ok++; S.ok++; st.ok++; S.combo++; S.best = Math.max(S.best, S.combo); st.bestCombo = Math.max(st.bestCombo, S.combo); } else S.combo = 0;
    const xp = (ok ? (q.mode === 'timeline' ? Math.max(6, 16 - 5 * (mistakes || 0)) : 10) + Math.min(10, Math.max(0, S.combo - 1)) : 1); gXp(st, xp, S); gTdAdd(st, ok); S.changed = true; S.badges.push(...gBadgesCheck(st)); gSave(); gHud(S);
    card.classList.add(ok ? 'is-ok' : 'is-bad');
    fb.replaceChildren(h('div', { class: 'gm-fbh' }, h('b', { class: ok ? 'ok' : 'bad' }, ok ? t('gRight') : t('gWrong')), h('span', { class: 'gm-fxp' }, '+' + xp + ' XP'), S.combo >= 3 ? h('span', { class: 'gm-hcombo' }, S.combo + 'x') : null), expl, h('button', { class: 'btn white gm-next', onclick: next }, t('gNext'), h('kbd', {}, '⏎')));
    card.append(fb); fb.classList.add('show'); requestAnimationFrame(() => { const b = $('.gm-next', fb); if (b) b.focus({ preventScroll: true }); }); S.onKey = ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); next(); } };
  };
  const choose = (opts, render, cls, expl) => {
    let answered = false; const btns = opts.map((o, i) => h('button', { class: 'gm-opt', onclick: () => pick(i) }, h('kbd', {}, String(i + 1)), render(o)));
    const pick = i => { if (answered) return; answered = true; btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('ok'); else if (j === i) b.classList.add('bad'); if (opts[j].a && cls === 'gm-faces') b.append(h('span', { class: 'gm-reveal' }, opts[j].a.name)); }); done(!!opts[i].ok, expl()); };
    S.onKey = ev => { const n = +ev.key; if (n >= 1 && n <= opts.length) { ev.preventDefault(); pick(n - 1); } };
    return h('div', { class: 'gm-opts ' + (cls || '') }, btns);
  };
  const filmText = o => h('span', {}, gFilmLabel(o.film));
  const filmPoster = o => [h('div', Object.assign({ class: 'gm-poster' }, bg(o.film.poster))), h('span', { class: 'gm-ft' }, gFilmLabel(o.film))];
  const answerFilm = (f, lead) => h('div', { class: 'gm-expl' }, h('div', Object.assign({ class: 'gm-kp' }, bg(f.poster))), h('div', {}, h('small', {}, lead), h('b', {}, gFilmLabel(f))));
  if (q.mode === 'odd') {
    card.append(h('div', { class: 'gm-row' }, h('div', Object.assign({ class: 'gm-poster lg' }, bg(q.film.poster))), h('div', {}, h('p', { class: 'gm-q' }, t('gOddQ')), h('h2', { class: 'gm-name' }, q.film.title + (q.film.year ? ' (' + q.film.year + ')' : '') + '?'))),
      choose(q.opts, o => gFace(o.a, 'opt'), 'gm-faces', () => h('div', { class: 'gm-expl' }, h('div', {}, h('b', {}, q.out.name + ' ' + (L === 'de' ? 'war nicht dabei.' : 'was not in it.')), h('small', {}, t('gWasIn') + ': ' + q.others.map(a => a.name).join(', '))))));
  } else if (q.mode === 'bridge') {
    const [A, B] = q.two; card.append(h('p', { class: 'gm-q' }, t('gBridgeQ')), h('div', { class: 'gm-pair' }, h('div', {}, gFace(A, 'md'), h('b', {}, A.name)), h('span', {}, '+'), h('div', {}, gFace(B, 'md'), h('b', {}, B.name))),
      choose(q.opts, filmPoster, 'gm-films gm-films2', () => answerFilm(q.film, t('gSameFilm'))));
  } else if (q.mode === 'still') {
    const sc = h('div', { class: 'gm-scene big has-scene', style: 'background-image:url("' + q.film.bd + '")' }); card.append(h('p', { class: 'gm-q' }, t('gStillQ')), sc, choose(q.opts, filmText, 'gm-titles', () => answerFilm(q.film, t('gThatWas'))));
  } else if (q.mode === 'plot') {
    card.append(h('p', { class: 'gm-q' }, t('gPlotQ')), h('blockquote', { class: 'gm-ptext' }, q.text), choose(q.opts, filmText, 'gm-titles', () => answerFilm(q.film, t('gThatWas'))));
  } else if (q.mode === 'timeline') {
    const order = shuffleArr(q.films.slice()); let idx = 0, mistakes = 0;
    const tiles = order.map(f => { const el = h('button', { class: 'gm-tl', onclick: () => tap(f, el) }, h('div', Object.assign({ class: 'gm-tlp' }, bg(f.poster)), h('i', { class: 'num' })), h('b', { class: 'ell' }, f.title), h('em', {}, '')); return el; });
    const tap = (f, el) => { if (el.classList.contains('placed') || went) return; if (f === q.films[idx]) { idx++; el.classList.add('placed'); $('.num', el).textContent = String(idx); $('em', el).textContent = String(f.year); if (idx === q.films.length) done(mistakes <= 1, h('div', { class: 'gm-expl col' }, h('small', {}, t('gTimeOrder')), ...q.films.map(x => h('b', {}, x.year + '  ' + x.title))), mistakes); } else { mistakes++; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } };
    card.append(h('p', { class: 'gm-q' }, t('gTimeQ')), h('div', { class: 'gm-tls' }, tiles)); S.onKey = null;
  }
}

/* ----- who to learn next: relevance first, fame as a tie breaker, a little chance so it does not feel the same every day ----- */
function gPickNew(P, st, n) {
  const fp = a => Math.max(0, (GA.fame[a.k] || 0) - 2.5);
  const rank = list => list.map(a => [P.rel(a) + fp(a) + (gIsFav(st, a) ? 3 : 0) + Math.random() * .5, a]).sort((x, y) => y[0] - x[0]).map(x => x[1]);
  const core = rank(P.fresh.filter(a => gIsNew(st, a))); const inCore = new Set(P.fresh);
  const rest = core.length >= n ? [] : rank(P.list.filter(a => gIsNew(st, a) && !inCore.has(a)));
  return core.concat(rest).slice(0, n);
}
/* ----- progress that keeps moving: faces learned, milestones, today, and ways to go on after the daily goal ----- */
const G_MILE = [[10, 'Bekanntenkreis', 'Circle of acquaintances'], [25, 'Stammgäste', 'Regulars'], [50, 'Besetzungsliste', 'Cast list'], [100, 'Casting-Direktor', 'Casting director'], [200, 'Filmlexikon', 'Film lexicon'], [400, 'Walk of Fame', 'Walk of Fame'], [800, 'Hall of Fame', 'Hall of Fame']];
function gProgress(wrap, st, P) {
  const A = st.a, total = P.list.length; const stage = a => { const b = gBox(st, a.k); return b === 0 ? 'new' : b < 3 ? 'learning' : b < 5 ? 'known' : 'mastered'; };
  const c = { new: 0, learning: 0, known: 0, mastered: 0 }; P.list.forEach(a => { c[stage(a)]++; }); const learned = total - c.new; const td = gTd(st);
  const shaky = P.list.filter(a => A[a.k] && A[a.k][0] > 0 && A[a.k][2] >= 2 && A[a.k][4] > A[a.k][3] * .4).length; const next = G_MILE.find(m => m[0] > learned);
  const go_ = o => () => gPlay('train', o); const seg = (k, v) => h('i', { class: 'st-' + k, style: 'flex:' + v, title: t('gStage' + k.charAt(0).toUpperCase() + k.slice(1)) + ' ' + v });
  const acts = [c.new ? h('button', { class: 'nf-chip', onclick: go_({ extraNew: true }) }, ic('plus', 'ic-s'), t('gMoreNew')) : null, learned ? h('button', { class: 'nf-chip', onclick: go_({ practice: true }) }, ic('refresh', 'ic-s'), t('gPracticeWeak') + (shaky ? ' · ' + shaky : '')) : null].filter(Boolean);
  wrap.append(h('section', { class: 'gm-sec gm-prog' }, h('div', { class: 'gm-progh' }, h('h2', {}, t('gLearnedT')), h('b', {}, learned + ' ' + t('gOfN').replace('{n}', total))),
    h('div', { class: 'gm-stack' }, seg('mastered', c.mastered), seg('known', c.known), seg('learning', c.learning), seg('new', Math.max(c.new, 0.0001))),
    h('div', { class: 'gm-legend' }, ['mastered', 'known', 'learning', 'new'].map(k => h('span', {}, h('i', { class: 'st-' + k }), t('gStage' + k.charAt(0).toUpperCase() + k.slice(1)) + ' ', h('b', {}, String(c[k]))))),
    h('p', { class: 'gm-today' }, t('gTodayT') + ': ' + td.n + ' ' + t('gAnswersN') + (td.n ? ' · ' + Math.round(td.ok / td.n * 100) + '%' : '') + ' · ' + td.nw + ' ' + t('gNewFacesN') + (next ? '   |   ' + t('gNextMs').replace('{t}', L === 'de' ? next[1] : next[2]).replace('{n}', next[0] - learned) : (learned === total ? '   |   ' + t('gAllLearned') : ''))),
    acts.length ? h('div', { class: 'gm-extra' }, h('small', {}, t('gExtraSub')), h('div', {}, acts)) : null));
}
function gSumExtra(S) {
  if (S.kind !== 'train') return []; const go_ = o => () => { S.close(); setTimeout(() => gPlay('train', o), 240); }; const left = S.P.list.some(a => gIsNew(S.st, a));
  return [left ? h('button', { class: 'btn grey', onclick: go_({ extraNew: true }) }, t('gMoreNew')) : null, h('button', { class: 'btn grey', onclick: go_({ practice: true }) }, t('gPracticeWeak'))].filter(Boolean);
}
