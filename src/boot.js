/* ---------- boot ---------- */
C.playAlbum = async it => { const tr = await tracksOf({ ParentId: it.Id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' }); playList(tr, 0, { ctx: { id: it.Id } }); };
if (!document.getElementById('cx-style')) { const st = document.createElement('style'); st.id = 'cx-style'; st.textContent = CSS_TEXT; (document.head || document.documentElement).append(st); }
const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'; (document.head || document.documentElement).append(fl);
const KILL = /ElegantFin|elegant-kefin|fin-kefin|media-bar-plugin-support|mediaBarEnhanced\.css/i;
function cleanup() { document.querySelectorAll('link[rel=stylesheet]').forEach(l => { if (KILL.test(l.href)) l.remove(); }); const mb = document.getElementById('slides-container'); if (mb) mb.style.display = 'none'; }
document.documentElement.classList.add('cx-ready'); setSkin(skinOn()); if (TVM) tvInit();
cleanup();
new MutationObserver(cleanup).observe(document.head, { childList: true });
if (document.body) document.body.append(root); else document.addEventListener('DOMContentLoaded', () => document.body.append(root));
window.addEventListener('hashchange', route);
let ready = false;
const iv = setInterval(() => {
  const ok = window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId();
  if (ok && !ready) { ready = true; Promise.all([loadStatus(), loadCfg()]).then(route).then(() => { setTimeout(maybeOnboard, 1800); setTimeout(syncWatchlist, 3000); setInterval(syncWatchlist, 600000); setTimeout(() => { lbSync(); archLoad(); }, 4500); setInterval(() => lbSync(), 1800000); }); }
  if (!ok && ready) { ready = false; route(); }
}, 400);
document.addEventListener('viewshow', () => { if (ready) route(); });
window.cinemaUI = { dev: { get C() { return C; }, lb: () => ({ lbReadExport, LB, onboard: () => onboardWizard(true), wrapped: y => wrData(y || new Date().getFullYear()).then(wrStory), lbLoad, lbSync, lbSeen, ARCH, archLoad, CFG: () => CFGU, save: saveCfg, archiveDialog }), seerrModal: x => seerrModal(x), setSeerrBase(b) { SEERR = b; }, calendarView: p => calendarView(p), harvest: () => harvestMenus(), HARV: () => HARV }, native(id) { C.allowNative = true; location.hash = '#/details?id=' + id; }, get player() { return P; }, skin(on) { setSkin(on !== false); }, off() { localStorage.setItem('cinema-off', '1'); location.reload(); }, on() { localStorage.removeItem('cinema-off'); location.reload(); } };
