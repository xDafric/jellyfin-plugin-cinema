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
      if (e.matches && e.matches('.sp-row')) { e.setAttribute('tabindex', '0'); e.dataset.tvf = '1'; continue; }
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
  const cands = () => { const L = layer(); const scope = L || document; return [...scope.querySelectorAll(SEL)].filter(e => !e.closest('[inert], .hide, #cx-lite, .cx-nframe, h2') && !e.matches('.nf-logo, .nf-logo *') && !(e.matches('a') && e.closest('.sp-row')) && !e.matches('.sp-row button.pl, .sp-hbtn') && visible(e) && !(e.tagName === 'INPUT' && e.type === 'file')); };
  const ctr = r => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 });
  function pick(dir, cur, list) {
    /* the fixed top bar is always on screen, so it looks "near" - only go there when nothing else is above */
    if (dir === 'up' && !cur.closest('#cx-top')) { const body_ = list.filter(e => !e.closest('#cx-top')); const r_ = pick_(dir, cur, body_); if (r_) return r_; }
    return pick_(dir, cur, list);
  }
  function pick_(dir, cur, list) {
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
  let lastOn = null; const mark = e => { if (lastOn && lastOn !== e) lastOn.classList.remove('tvf-on'); lastOn = e; e.classList.add('tvf-on'); if (window.tvGlow) setTimeout(() => window.tvGlow(e), 60); };
  document.addEventListener('focusin', e => mark(e.target), true); document.addEventListener('focusout', e => { e.target.classList && e.target.classList.remove('tvf-on'); }, true);
  /* own scroll animation: short, cancelable, always ends where it should (CSS smooth scrolling lags on TV hardware) */
  const ANIM = new WeakMap();
  function glide(host, prop, target, ms) {
    ms = ms || 230; const max = prop === 'top' ? host.scrollHeight - host.clientHeight : host.scrollWidth - host.clientWidth; target = Math.max(0, Math.min(max, target));
    const key = prop === 'top' ? 'scrollTop' : 'scrollLeft'; let st = ANIM.get(host); if (!st) { st = {}; ANIM.set(host, st); }
    const o = st[prop]; if (o) cancelAnimationFrame(o.id); const from = host[key]; const t0 = performance.now(); const rec = { target, id: 0 }; st[prop] = rec;
    if (Math.abs(target - from) < 2) { host[key] = target; return; }
    const step = now => { const k = Math.min(1, (now - t0) / ms); const ease = 1 - Math.pow(1 - k, 3); host[key] = from + (target - from) * ease; if (k < 1) rec.id = requestAnimationFrame(step); else st[prop] = null; };
    rec.id = requestAnimationFrame(step);
  }
  const pendingTop = host => { const s = ANIM.get(host); return s && s.top ? s.top.target : host.scrollTop; };
  const pendingLeft = host => { const s = ANIM.get(host); return s && s.left ? s.left.target : host.scrollLeft; };
  function focusEl(e, dir) {
    e.focus({ preventScroll: true }); mark(e); remember(e);
    const r = e.getBoundingClientRect(); const horiz = dir === 'left' || dir === 'right';
    const sc = e.closest('.nf-scroller, .sp-shelf, .nf-cast, .nf-row-scroll');
    if (horiz && sc) { const curL = sc.scrollLeft, pendL = pendingLeft(sc); glide(sc, 'left', pendL + (r.left - (pendL - curL) - sc.getBoundingClientRect().left) - 80); }
    else if (!horiz) {
      const host = scrollHost(); const cur = host.scrollTop, pend = pendingTop(host); const top = r.top - (pend - cur); const bottom = r.bottom - (pend - cur);
      const inBand = top > 100 && bottom < innerHeight - 50;
      if (e.closest('#cx-top')) glide(host, 'top', 0); else if (!inBand) glide(host, 'top', pend + (top + r.height / 2 - innerHeight * .55));
      if (sc) glide(sc, 'left', 0);
    } else e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function scrollHost_() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
  function scrollHost() { return scrollHost_(); }
  const DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  document.addEventListener('keydown', e => {
    const dir = DIRS[e.key];
    if (e.key === 'Enter' && document.activeElement && document.activeElement.dataset.tvf) { e.preventDefault(); const ae0 = document.activeElement; const pl = ae0.matches('.sp-row') && ae0.querySelector('button.pl'); (pl || ae0).click(); return; }
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
      if (m && Date.now() < m.until && list.length > m.i) { const e = list[m.i]; if (e && e !== ae) { e.focus({ preventScroll: true }); mark(e); try { scrollHost().scrollTop = m.st; } catch (x) { } } if (list.length > m.i + 4) TVSTATE.restore = null; return; }
      if (ok) return;
      const f = tvPreferred(list); if (f) { f.focus({ preventScroll: true }); mark(f); if (f.closest('.nf-hero, .nf-dinfo, #cx-top')) { try { scrollHost().scrollTop = 0; } catch (x) { } } }
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

  /* remote media keys control the music player */
  window.cxTvMedia = k => { try { if (k === 'playpause') toggle(); else if (k === 'play') { if (P.audio.paused) toggle(); } else if (k === 'pause') { if (!P.audio.paused) toggle(); } else if (k === 'next') next(); else if (k === 'prev') prev(); } catch (e) { } };
  document.addEventListener('keydown', e => { const m = { MediaPlayPause: 'playpause', MediaPlay: 'play', MediaPause: 'pause', MediaTrackNext: 'next', MediaTrackPrevious: 'prev' }[e.key]; if (m && !document.querySelector('.cxd-bg.show')) { e.preventDefault(); window.cxTvMedia(m); } }, true);

  /* colour glow around the focused poster (and a soft ambient wash behind the page) */
  let glowEl = null; const gcache = {};
  const ensureGlow = () => { if (glowEl && glowEl.isConnected) return glowEl; const r = document.getElementById('cx'); if (!r) return null; glowEl = document.createElement('div'); glowEl.id = 'cx-glow'; r.insertBefore(glowEl, r.firstChild); return glowEl; };
  const imgUrlOf = e => { const cand = [e, ...e.querySelectorAll('.bgi, .pi, .cv, .im, [style*="background-image"]')]; for (const c of cand) { const bgi = getComputedStyle(c).backgroundImage; const m = bgi && bgi.match(/url\(["']?(.*?)["']?\)/); if (m && !/gradient/.test(m[1])) return m[1]; } return null; };
  const boost = c => { const mx = Math.max(...c); const f = mx < 150 ? 150 / Math.max(mx, 30) : 1; return c.map(v => Math.min(255, Math.round(v * f))); };
  let glowSeq = 0;
  window.tvGlow = async e => {
    const seq = ++glowSeq; const g = ensureGlow(); if (!e || !e.isConnected || e.closest('#cx-top')) { if (g) g.style.opacity = 0; return; }
    const u0 = imgUrlOf(e); if (!u0) { if (g) g.style.opacity = 0; return; }
    const u = u0.replace(/maxWidth=\d+/, 'maxWidth=48').replace(/(\?|&)fillWidth=\d+/, '$1fillWidth=48'); let col = gcache[u];
    if (!col) { try { col = boost(await dominant(u)); gcache[u] = col; } catch (x) { return; } }
    if (seq !== glowSeq || document.activeElement !== e) return;
    const rgb_ = col.join(','); e.style.setProperty('--glow', 'rgba(' + rgb_ + ',.6)');
    if (g) { const r = e.getBoundingClientRect(); g.style.background = 'radial-gradient(ellipse 55% 60% at ' + Math.round((r.left + r.width / 2) / innerWidth * 100) + '% ' + Math.round((r.top + r.height / 2) / innerHeight * 100) + '%, rgba(' + rgb_ + ',.34), rgba(' + rgb_ + ',.12) 45%, transparent 75%)'; g.style.opacity = 1; }
  };
}
