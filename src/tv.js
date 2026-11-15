/* ---------- TV mode (Cinema TV app / big screen with a remote): D-pad navigation, focus ring, native player hand-off ---------- */
const TVM = (() => { try { return !!window.CinemaTV || /CinemaTV/.test(navigator.userAgent) || localStorage.getItem('cx-dev-tv') === '1' || localStorage.getItem('cx-tv-force') === '1'; } catch (e) { return false; } })();
function tvInit() {
  const H = document.documentElement; H.classList.add('cx-tv');
  const SEL = 'a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"]), [data-tvf]';
  /* make clickable divs focusable: anything with a pointer cursor that is not already focusable */
  let scanQ = new Set(), scanT = 0;
  const isFocusable = e => e.matches(SEL);
  function scan(rootEl) {
    if (!rootEl.querySelectorAll) return;
    const els = [rootEl, ...rootEl.querySelectorAll('*')];
    for (const e of els) {
      if (e.nodeType !== 1 || e.dataset.tvs || e.closest('#cx-lite, .cx-nframe, svg')) continue; e.dataset.tvs = '1';
      if (isFocusable(e) || e.tagName === 'svg') continue;
      if (e.parentElement && e.parentElement.closest('[data-tvf], a[href], button')) continue;
      const cs = getComputedStyle(e); if (cs.cursor === 'pointer') { e.setAttribute('tabindex', '0'); e.dataset.tvf = '1'; }
    }
  }
  const mo = new MutationObserver(ms => { ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) scanQ.add(n); })); clearTimeout(scanT); scanT = setTimeout(() => { const q = [...scanQ]; scanQ = new Set(); q.forEach(n => { if (n.isConnected) scan(n); }); tvAuto(); }, 120); });
  const startMO = () => { [document.getElementById('cx'), document.getElementById('cx-ui')].forEach(t => t && mo.observe(t, { childList: true, subtree: true })); if (!document.getElementById('cx') || !document.getElementById('cx-ui')) setTimeout(startMO, 500); else { scan(document.getElementById('cx')); scan(document.getElementById('cx-ui')); } };
  startMO();

  const visible = e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false; return r.bottom > -2000 && r.top < innerHeight + 2400; };
  /* the topmost modal layer limits where focus may go */
  const layer = () => { const q = ['.cxd-bg.show', '.sp-modal-bg', '.nf-pop', '.sp-ctx', '#cx-menu', '.sr-modal'].map(s => [...document.querySelectorAll(s)].filter(visible).pop()).filter(Boolean); const bgEl = q.find(e => e.matches('.cxd-bg, .sp-modal-bg')); return bgEl || q[0] || null; };
  const cands = () => { const L = layer(); const scope = L || document; return [...scope.querySelectorAll(SEL)].filter(e => !e.closest('[inert], .hide, #cx-lite, .cx-nframe, h2') && !e.matches('.nf-logo, .nf-logo *') && visible(e) && !(e.tagName === 'INPUT' && e.type === 'file')); };
  const ctr = r => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 });
  function pick(dir, cur, list) {
    const a = cur.getBoundingClientRect(), ac = ctr(a); let best = null, bs = 1e12;
    for (const e of list) {
      if (e === cur || cur.contains(e)) continue; const b = e.getBoundingClientRect(), bc = ctr(b); let main, cross, overlap;
      if (dir === 'right') { if (bc.x <= ac.x + 2) continue; main = Math.max(0, b.left - a.right); cross = Math.abs(bc.y - ac.y); overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); }
      else if (dir === 'left') { if (bc.x >= ac.x - 2) continue; main = Math.max(0, a.left - b.right); cross = Math.abs(bc.y - ac.y); overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); }
      else if (dir === 'down') { if (bc.y <= ac.y + 2) continue; main = Math.max(0, b.top - a.bottom); cross = Math.abs(bc.x - ac.x); overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left); }
      else { if (bc.y >= ac.y - 2) continue; main = Math.max(0, a.top - b.bottom); cross = Math.abs(bc.x - ac.x); overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left); }
      if ((dir === 'left' || dir === 'right') && overlap <= 0) continue;
      const s = (overlap > 0 ? 0 : 1e6) + main * 10 + cross;
      if (s < bs) { bs = s; best = e; }
    }
    return best;
  }
  let lastOn = null; const mark = e => { if (lastOn && lastOn !== e) lastOn.classList.remove('tvf-on'); lastOn = e; e.classList.add('tvf-on'); };
  document.addEventListener('focusin', e => mark(e.target), true); document.addEventListener('focusout', e => { e.target.classList && e.target.classList.remove('tvf-on'); }, true);
  function focusEl(e, dir) {
    e.focus({ preventScroll: true }); mark(e); remember(e);
    const r = e.getBoundingClientRect(); const horiz = dir === 'left' || dir === 'right';
    const sc = e.closest('.nf-scroller, .sp-shelf, .nf-cast, .nf-row-scroll');
    if (horiz && sc) { sc.scrollTo({ left: sc.scrollLeft + r.left - (sc.getBoundingClientRect().left + 80), behavior: 'smooth' }); }
    else if (!horiz) { const host = scrollHost(); const top = r.top + r.height / 2 - innerHeight * .58; const inBand = r.top > 90 && r.bottom < innerHeight - 40; if (e.closest('#cx-top')) host.scrollTo({ top: 0, behavior: 'smooth' }); else if (!inBand) host.scrollBy({ top, behavior: 'smooth' }); if (sc) sc.scrollTo({ left: 0, behavior: 'smooth' }); }
    else e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function scrollHost_() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
  function scrollHost() { return scrollHost_(); }
  const DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  document.addEventListener('keydown', e => {
    const dir = DIRS[e.key];
    if (e.key === 'Enter' && document.activeElement && document.activeElement.dataset.tvf) { e.preventDefault(); document.activeElement.click(); return; }
    if (!dir) return;
    const ae = document.activeElement; const typing = ae && (ae.tagName === 'INPUT' && /text|search|url|email|password|number/.test(ae.type) || ae.tagName === 'TEXTAREA');
    if (typing && (dir === 'left' || dir === 'right')) return;
    e.preventDefault(); e.stopPropagation();
    const list = cands(); let cur = ae && ae !== document.body && list.includes(ae) ? ae : (ae && ae !== document.body && ae.isConnected && visible(ae) ? ae : null);
    if (!cur) { const first = tvPreferred(list); if (first) focusEl(first, dir); return; }
    const nx = pick(dir, cur, list); if (nx) focusEl(nx, dir);
  }, true);

  const preferredSel = ['.cxd-bg.show .cxd-chip, .cxd-bg.show button', '.nf-hero .btn.white', '#cx .nf-dinfo .btn.white', '#cx .sp-card .sp-navlink.on', '#cx .nf-card', '#cx .sp-row', '#cx-top a'];
  function tvPreferred(list) { for (const s of preferredSel) { const f = list.find(e => e.matches(s)); if (f) return f; } return list[0]; }
  let autoT = 0; const MEM = {};
  const remember = e => { try { const L = layer(); if (L || e.closest('#cx-top')) return; const i = cands().indexOf(e); if (i >= 0) MEM[location.hash] = { i, st: scrollHost().scrollTop }; } catch (x) { } };
  function tvAuto() {
    clearTimeout(autoT); autoT = setTimeout(() => {
      const ae = document.activeElement; const ok = ae && ae !== document.body && ae.isConnected && visible(ae);
      if (ok && ae.closest('#cx-top')) return;
      const list = cands(); const m = TVSTATE.restore;
      if (m && Date.now() < m.until && list.length > m.i) { const e = list[m.i]; if (e && e !== ae) { e.focus({ preventScroll: true }); mark(e); try { scrollHost().scrollTo({ top: m.st }); } catch (x) { } } if (list.length > m.i + 4) TVSTATE.restore = null; return; }
      if (ok) return;
      const f = tvPreferred(list); if (f) { f.focus({ preventScroll: true }); mark(f); if (f.closest('.nf-hero, .nf-dinfo, #cx-top')) { try { scrollHost().scrollTo({ top: 0 }); } catch (x) { } } }
    }, 450);
  }
  const TVSTATE = { restore: null };
  window.addEventListener('hashchange', () => { const m = MEM[location.hash]; TVSTATE.restore = m ? { i: m.i, st: m.st, until: Date.now() + 4000 } : null; });

  /* Back button from the app */
  window.cxTvBack = () => {
    const L = layer(); if (L) { const x = L.querySelector('.cxd-x, .sr-close, button[aria-label=Close]'); if (x) x.click(); else if (L.matches('.cxd-bg')) L.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); else L.remove(); return true; }
    if (document.querySelector('.sp-full.open')) { document.querySelector('.sp-full .top .pl-btn').click(); return true; }
    const h = location.hash; if (/^#\/(home)?$|^#\/c(\/home)?$|^#\/c\/music\/?$|^#\/c\/music\/home$/.test(h) || h === '') return false;
    history.back(); return true;
  };
  window.cxTvResume = () => { try { refreshView(); } catch (e) { } };
  window.cxTvMenu = () => { const u = document.querySelector('#cx-top .nf-avatar'); u && u.click(); };
}
