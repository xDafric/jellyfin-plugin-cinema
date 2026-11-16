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
  const mo = new MutationObserver(ms => { rcDirty = true; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) scanQ.add(n); })); clearTimeout(scanT); scanT = setTimeout(() => { const q = [...scanQ]; scanQ = new Set(); q.forEach(n => { if (n.isConnected) scan(n); }); tvAuto(); }, 120); });
  const startMO = () => { [document.getElementById('cx'), document.getElementById('cx-ui')].forEach(t => t && mo.observe(t, { childList: true, subtree: true })); if (!document.getElementById('cx') || !document.getElementById('cx-ui')) setTimeout(startMO, 500); else { scan(document.getElementById('cx')); scan(document.getElementById('cx-ui')); } };
  startMO();

  const vis2 = e => { const r = e.getBoundingClientRect(); return r.width >= 4 && r.height >= 4 && r.bottom > -2400 && r.top < innerHeight + 2600; };
  const visible = e => { if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; return vis2(e); };
  /* the topmost modal layer limits where focus may go */
  const LAYER_SEL = '.cxd-bg.show, .sp-modal-bg, .nf-pop:not(.hide), .sp-ctx, #cx-menu, .sr-modal';
  const layer = () => { const all = document.querySelectorAll(LAYER_SEL); for (let k = all.length - 1; k >= 0; k--) if (visible(all[k])) return all[k]; return null; };
  /* rectangles are measured once and kept (page coordinates), so a key press never forces a layout */
  let RC = null, rcDirty = true; const SCR = '.nf-scroller, .sp-shelf, .nf-cast, .nf-row-scroll';
  const EXCL = e => !!e.closest('#cx-lite, .cx-nframe, h2') || e.matches('.nf-logo, .nf-logo *') || (e.matches('a') && !!e.closest('.sp-row')) || e.matches('.sp-row button.pl, .sp-hbtn') || (e.tagName === 'INPUT' && e.type === 'file');
  function buildRects() {
    const H = scrollHost(); const st = H ? H.scrollTop : 0; const m = new Map(); m._an = new Map();
    const ov = document.documentElement.classList.contains('cx-on'); // our interface is showing: the stock page behind it must not take part
    document.querySelectorAll(SEL).forEach(e => {
      if (ov && !e.closest('#cx, #cx-ui')) return;
      let x = e._tvx; if (x === undefined) { x = EXCL(e); e._tvx = x; } if (x || e.closest('[inert], .hide')) return;
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < -2400 || r.top > innerHeight + 2600) return;
      const sc = e.closest(SCR); const inHost = !!(H && H.contains(e));
      m.set(e, { x: r.left + (sc ? sc.scrollLeft : 0), y: r.top + (inHost ? st : 0), w: r.width, h: r.height, sc, host: inHost });
      if (sc) { const an = e.closest('.nf-row, .nf-sect'); if (an && !m._an.has(an)) m._an.set(an, an.getBoundingClientRect().top + (inHost ? st : 0)); }
    });
    RC = m; RC._st = st; rcDirty = false;
  }
  const R = e => { const c = RC && RC.get(e); if (!c) return e.getBoundingClientRect(); const H = scrollHost(); const left = c.x - (c.sc ? (c.sc._sl != null ? c.sc._sl : (c.sc._sl = c.sc.scrollLeft)) : 0), top = c.y - (c.host ? pendingTop(H) : 0); return { left, top, right: left + c.w, bottom: top + c.h, width: c.w, height: c.h }; };
  const cands = () => {
    const L = layer(); if (L) { const out = []; L.querySelectorAll(SEL).forEach(e => { if (!e.closest('[inert], .hide') && vis2(e)) out.push(e); }); return out; }
    if (rcDirty || !RC) buildRects(); return [...RC.keys()].filter(e => e.isConnected);
  };
  const ctr = r => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 });
  function pick(dir, cur, list) {
    /* the fixed top bar is always on screen, so it looks "near" - only go there when nothing else is above */
    if (dir === 'up' && !cur.closest('#cx-top')) { const body_ = list.filter(e => !e.closest('#cx-top')); const r_ = pick_(dir, cur, body_); if (r_) return r_; }
    return pick_(dir, cur, list);
  }
  const pane = e => e._pane || (e._pane = e.closest('.sp-side, .sp-main, #cx-top, #cx-nf') || document.body);
  function pick_(dir, cur, list) {
    const a = R(cur), ac = ctr(a); let best = null, bs = 1e12;
    for (const e of list) {
      if (e === cur || cur.contains(e)) continue; const b = R(e), bc = ctr(b); let main, cross, overlap;
      if (dir === 'right') { if (bc.x <= ac.x + 2) continue; main = Math.max(0, b.left - a.right); cross = Math.abs(bc.y - ac.y); overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); }
      else if (dir === 'left') { if (bc.x >= ac.x - 2) continue; main = Math.max(0, a.left - b.right); cross = Math.abs(bc.y - ac.y); overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); }
      else if (dir === 'down') { if (bc.y <= ac.y + 2) continue; main = Math.max(0, b.top - a.bottom); cross = Math.abs(bc.x - ac.x); overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left); }
      else { if (bc.y >= ac.y - 2) continue; main = Math.max(0, a.top - b.bottom); cross = Math.abs(bc.x - ac.x); overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left); }
      if ((dir === 'left' || dir === 'right') && overlap <= 0 && !(pane(e) !== pane(cur))) continue;
      const s = (overlap > 0 ? 0 : 1e6) + main * 10 + cross;
      if (s < bs) { bs = s; best = e; }
    }
    return best;
  }
  let lastOn = null; const mark = e => { if (lastOn && lastOn !== e) lastOn.classList.remove('tvf-on'); lastOn = e; const rowSc = e.closest('.nf-scroller, .nf-cast'); if (rowSc) rowSc._tvLast = e; e.classList.add('tvf-on'); if (window.tvGlow) { clearTimeout(mark._t); mark._t = setTimeout(() => window.tvGlow(e), 420); } };
  /* the stock web client scrolls any focused element to the centre of its row - stop that for our interface */
  ['focus', 'focusin'].forEach(t => window.addEventListener(t, e => { const el = e.target; if (el && el.closest && el.closest('#cx, #cx-ui')) { if (t === 'focusin') mark(el); e.stopImmediatePropagation(); } }, true)); document.addEventListener('focusout', e => { e.target.classList && e.target.classList.remove('tvf-on'); }, true);
  /* own scroll animation: short, cancelable, always ends where it should (CSS smooth scrolling lags on TV hardware) */
  const ANIM = new WeakMap();
  function glide(host, prop, target, ms) {
    ms = ms == null ? 230 : ms; const max = prop === 'top' ? host.scrollHeight - host.clientHeight : host.scrollWidth - host.clientWidth; target = Math.max(0, Math.min(max, target));
    const key = prop === 'top' ? 'scrollTop' : 'scrollLeft', mem = prop === 'top' ? '_st' : '_sl'; let st = ANIM.get(host); if (!st) { st = {}; ANIM.set(host, st); }
    let rec = st[prop];
    if (ms === 0) { if (rec) { cancelAnimationFrame(rec.id); st[prop] = null; } host[key] = target; host[mem] = target; return; }
    if (rec) { rec.target = target; return; } // already moving: just aim at the new target, the motion stays continuous
    const from = host[mem] != null ? host[mem] : host[key]; if (Math.abs(target - from) < 1.5) { host[key] = target; host[mem] = target; return; }
    const tau = ms / 3.4; rec = { target, pos: from, id: 0, last: performance.now() }; st[prop] = rec;
    const step = now => {
      const dt = Math.min(40, now - rec.last); rec.last = now; rec.pos += (rec.target - rec.pos) * (1 - Math.exp(-dt / tau));
      if (Math.abs(rec.target - rec.pos) < .6) { host[key] = rec.target; host[mem] = rec.target; st[prop] = null; return; }
      host[key] = rec.pos; host[mem] = rec.pos; rec.id = requestAnimationFrame(step);
    };
    rec.id = requestAnimationFrame(step);
  }
  const pendingTop = host => { const s = ANIM.get(host); return s && s.top ? s.top.target : (host._st != null ? host._st : (host._st = host.scrollTop)); };
  document.addEventListener('scroll', e => { const t = e.target; if (t && t.nodeType === 1) { t._st = t.scrollTop; t._sl = t.scrollLeft; } }, true);
  const pendingLeft = host => { const s = ANIM.get(host); return s && s.left ? s.left.target : (host._sl != null ? host._sl : (host._sl = host.scrollLeft)); };
  function focusEl(e, dir) {
    e.focus({ preventScroll: true }); mark(e);
    const r = R(e); const horiz = dir === 'left' || dir === 'right';
    const sc = e.closest(SCR);
    const alignLeft = () => { const pad = sc._pad || (sc._pad = parseFloat(getComputedStyle(sc).paddingLeft) || 56); const c = RC && RC.get(e); const abs = c ? c.x : (r.left + sc.scrollLeft); glide(sc, 'left', abs - (sc.getBoundingClientRect().left) - pad, 0); };
    if (horiz && sc) alignLeft();
    else if (!horiz) {
      const host = scrollHost(); const pend = pendingTop(host); const top = r.top, bottom = r.bottom;
      const inBand = top > 100 && bottom < innerHeight - 50; const barH = (document.getElementById('cx-top') || { offsetHeight: 64 }).offsetHeight + 18;
      const anchor = sc ? e.closest('.nf-row, .nf-sect') : null;
      if (e.closest('#cx-top, .nf-hero, .nf-dinfo')) glide(host, 'top', 0, 200);
      else if (anchor) { const ay = RC && RC._an.get(anchor); const aTop = ay != null ? ay - pend : anchor.getBoundingClientRect().top; glide(host, 'top', pend + aTop - barH, 200); }
      else if (!inBand) glide(host, 'top', pend + (top + r.height / 2 - innerHeight * .5), 200);
      if (sc) alignLeft();
      if (RC && Math.abs(pendingTop(host) - RC._st) > 1200 && !focusEl._rb) { focusEl._rb = setTimeout(() => { focusEl._rb = 0; rcDirty = true; if (!layer()) buildRects(); }, 500); }
    } else e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function scrollHost_() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
  function scrollHost() { return scrollHost_(); }
  const DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  document.addEventListener('keydown', e => {
    const dir = DIRS[e.key];
    if (e.key === 'Enter' && document.activeElement && document.activeElement.dataset.tvf) { e.preventDefault(); const ae0 = document.activeElement; const pl = ae0.matches('.sp-row') && ae0.querySelector('button.pl'); (pl || ae0).click(); return; }
    if (!dir) return;
    TVSTATE.keyed = true; TVSTATE.userActive = true;
    const ae = document.activeElement; const typing = ae && (ae.tagName === 'INPUT' && /text|search|url|email|password|number/.test(ae.type) || ae.tagName === 'TEXTAREA');
    if (typing && (dir === 'left' || dir === 'right')) return;
    e.preventDefault(); e.stopPropagation();
    const list = cands(); let cur = ae && ae !== document.body && list.includes(ae) ? ae : (ae && ae !== document.body && ae.isConnected && visible(ae) ? ae : null);
    if (!cur) { const first = tvPreferred(list); if (first) focusEl(first, dir); return; }
    let nx = pick(dir, cur, list); for (let g = 0; nx && g < 3 && nx.checkVisibility && !nx.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }); g++) { const i_ = list.indexOf(nx); if (i_ >= 0) list.splice(i_, 1); nx = pick(dir, cur, list); }
    /* Netflix style: entering another row lands on the card you last had there, or the first one */
    if (nx && (dir === 'up' || dir === 'down')) { const sc = nx.closest('.nf-scroller, .nf-cast'); if (sc && sc !== cur.closest('.nf-scroller, .nf-cast')) { const last = sc._tvLast; if (last && last.isConnected && visible(last) !== false) nx = last; else { const inRow = list.filter(x => sc.contains(x)).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left + sc.scrollLeft * 0); nx = inRow.find(x => x.getBoundingClientRect().left >= sc.getBoundingClientRect().left - 4) || inRow[0] || nx; } } }
    if (nx) focusEl(nx, dir);
  }, true);

  const preferredSel = ['.cxd-bg.show .cxd-chip, .cxd-bg.show button', '.nf-hero .btn.white', '#cx .nf-dinfo .btn.white', '#cx .sp-card .sp-navlink.on', '#cx .nf-card', '#cx .sp-row', '#cx-top a'];
  function tvPreferred(list) { for (const s of preferredSel) { const f = list.find(e => e.matches(s)); if (f) return f; } return list[0]; }
  let autoT = 0; const MEM = {};
  const rootAll = () => [...document.getElementById('cx').querySelectorAll(SEL)];
  const remember = () => { };
  function tvAuto() {
    clearTimeout(autoT); autoT = setTimeout(() => { if (rcDirty && !layer()) buildRects();
      const ae = document.activeElement; const ok = ae && ae !== document.body && ae.isConnected && visible(ae);
      if (ok && ae.closest('#cx-top') && TVSTATE.userActive) return;
      const list = cands(); const m = TVSTATE.restore;
      if (TVSTATE.keyed) TVSTATE.restore = null; const all_ = rootAll(); if (m && !TVSTATE.keyed && Date.now() < m.until && all_.length > m.i) { const e = all_[m.i]; if (e && e !== ae && visible(e)) { e.focus({ preventScroll: true }); mark(e); try { scrollHost().scrollTop = m.st; } catch (x) { } } if (all_.length > m.i + 4) TVSTATE.restore = null; return; }
      if (ok && !(ae.closest('#cx-top') && !TVSTATE.userActive)) return;
      const f = tvPreferred(list); if (f) { f.focus({ preventScroll: true }); mark(f); if (f.closest('.nf-hero, .nf-dinfo, #cx-top')) { try { scrollHost().scrollTop = 0; } catch (x) { } } }
    }, 450);
  }
  const TVSTATE = { restore: null, keyed: false, userActive: false }; window.__tv = { MEM, TVSTATE };
  window.addEventListener('resize', () => { rcDirty = true; });
  /* the browser may nudge the page while the hero is still loading; keep the top aligned until the user moves */
  setInterval(() => { if (TVSTATE.keyed) return; const ae = document.activeElement; if (ae && ae.closest && ae.closest('.nf-hero, .nf-dinfo')) { const h = scrollHost(); if (h && h.scrollTop > 0 && !(ANIM.get(h) && ANIM.get(h).top)) h.scrollTop = 0; } }, 250);
  let prevHash = location.hash;
  window.addEventListener('hashchange', () => { TVSTATE.keyed = false;
    try { const e = lastOn; if (e && e.isConnected && !e.closest('#cx-top') && !document.querySelector('.cxd-bg.show, .sp-modal-bg')) { const i = rootAll().indexOf(e); if (i >= 0) MEM[prevHash] = { i, st: scrollHost().scrollTop }; } } catch (x) { }
    prevHash = location.hash; const m = MEM[location.hash]; TVSTATE.restore = m ? { i: m.i, st: m.st, until: Date.now() + 12000 } : null; });

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
