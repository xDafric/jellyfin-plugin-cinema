/* ---------- home rows built from your own taste: because you watched, because you liked, watch again ---------- */
Object.assign(TX.en, { hrSeen: 'Because you watched {x}', hrLiked: 'Because you liked {x}', hrAgain: 'Watch again', hrSeenL: 'Because you watched ...', hrLikedL: 'Because you liked ...', hrAgainL: 'Watch again (films you liked, not seen for a long time)' });
Object.assign(TX.de, { hrSeen: 'Weil du {x} gesehen hast', hrLiked: 'Weil dir {x} gefallen hat', hrAgain: 'Erneut ansehen', hrSeenL: 'Weil du ... gesehen hast', hrLikedL: 'Weil dir ... gefallen hat', hrAgainL: 'Erneut ansehen (Filme, die dir gefallen haben, lange nicht gesehen)' });
const hrShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
async function hrLb() { if (optOn('letterboxd') && lbUser()) { try { await lbLoad(); } catch (e) { } } return !!(LB && LB.n); }
async function hrSimilar(rows, seeds, title, max) {
  let shown = 0;
  for (const seed of seeds) {
    if (shown >= max) break;
    try {
      const r = await api('Items/' + seed.Id + '/Similar', { userId: uid(), limit: 40, Fields: F_BASE }); const arr = (r.Items || []).filter(i => !ud(i).Played && hxKeep(i)).slice(0, 20);
      if (arr.length >= 5) { rows.append(row(title.replace('{x}', seed.Name), arr, 'poster')); shown++; }
    } catch (e) { }
  }
}
const hrHost = (rows, fn) => { const ph = h('div', { class: 'nf-rowph' }); rows.append(ph); const hold = document.createDocumentFragment(); const tmp = h('div', {}); Promise.resolve().then(() => fn(tmp)).then(() => { if (!ph.isConnected) return; const kids = [...tmp.children]; if (kids.length) ph.replaceWith(...kids); else ph.remove(); }).catch(() => ph.remove()); };
Object.assign(SEC, {
  becauseSeen: { label: () => t('hrSeenL'), build: rows => hrHost(rows, async tmp => {
    const r = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 14 });
    await hrSimilar(tmp, hrShuffle(r.Items || []), t('hrSeen'), 2);
  }) },
  becauseLiked: { label: () => t('hrLikedL'), build: rows => hrHost(rows, async tmp => {
    const fav = (await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 60 })).Items || []; let seeds = fav.slice();
    if (await hrLb()) { const lm = await libMap(); Object.keys(lm).forEach(k => { if (k.indexOf('movie:') !== 0) return; const e = lbMatch(lm[k]); if (e && e.rating >= 4 && !seeds.some(s => s.Id === lm[k].Id)) seeds.push(lm[k]); }); }
    await hrSimilar(tmp, hrShuffle(seeds), t('hrLiked'), 1);
  }) },
  rewatch: { label: () => t('hrAgainL'), build: rows => hrHost(rows, async tmp => {
    const r = await items({ IncludeItemTypes: 'Movie', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Ascending', Limit: 400 }); const lb = await hrLb(); const cut = Date.now() - 300 * 864e5;
    const good = (r.Items || []).filter(i => { const u = ud(i); const last = u.LastPlayedDate ? Date.parse(u.LastPlayedDate) : 0; if (!last || last > cut) return false; const e = lb ? lbMatch(i) : null; return u.IsFavorite || (e && e.rating >= 4) || (!e && (i.CommunityRating || 0) >= 7.5); }).filter(hxKeep);
    const arr = hrShuffle(good.slice(0, 80)).slice(0, 22); if (arr.length >= 4) tmp.append(row(t('hrAgain'), arr, 'poster'));
  }) }
});
const NEW_SECS = ['becauseSeen', 'becauseLiked', 'rewatch'];
