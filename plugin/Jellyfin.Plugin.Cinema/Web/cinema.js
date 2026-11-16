/* Cinema UI - Netflix + Spotify style frontend for Jellyfin 12. Kill switch: add #nocinema to the URL or run cinemaUI.off() */
(function () {
'use strict';
if (window.__cinemaUI) return; window.__cinemaUI = 1;
try { if (/nocinema/.test(location.hash + location.search) || localStorage.getItem('cinema-off') === '1') { document.documentElement.classList.add('cx-off'); return; } } catch (e) {}
const CSS_TEXT = "/* Cinema UI - styles. Everything is scoped under :is(#cx, #cx-ui) so native Jellyfin pages are untouched. */\nhtml.cx-on, html.cx-on body { overflow: hidden !important; background: #000 !important; }\n#cx, #cx-ui, :is(#cx, #cx-ui) * { box-sizing: border-box; }\n#cx { position: fixed; inset: 0; z-index: 9000; display: none; }\n:is(#cx, #cx-ui) {\n  color: #fff;\n  font-family: \"Inter\", \"SF Pro Text\", \"Segoe UI\", system-ui, -apple-system, \"Helvetica Neue\", Arial, sans-serif; letter-spacing: -.005em;\n  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;\n  --red: #e50914; --bg: #141414; --green: #1ed760; --dim: #b3b3b3;\n}\n:where(:is(#cx, #cx-ui) button, #cx-ui button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }\n:where(:is(#cx, #cx-ui) input, #cx-ui input) { font: inherit; color: inherit; }\n:where(:is(#cx, #cx-ui) a, #cx-ui a) { color: inherit; text-decoration: none; }\n:is(#cx, #cx-ui) svg { width: 24px; height: 24px; fill: currentColor; flex: none; display: block; }\n:is(#cx, #cx-ui) .ic-s svg { width: 16px; height: 16px; }\n:is(#cx, #cx-ui) .ic-l svg { width: 32px; height: 32px; }\n:is(#cx, #cx-ui) .hide { display: none !important; }\n:is(#cx, #cx-ui) .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n:is(#cx, #cx-ui) .clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\n:is(#cx, #cx-ui) .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n:is(#cx, #cx-ui) .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,.15); border-top-color: #fff; border-radius: 50%; animation: cxspin .8s linear infinite; margin: 20vh auto; }\n@keyframes cxspin { to { transform: rotate(360deg); } }\n@keyframes cxfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\n\n/* =====================================================================\n   NETFLIX-STYLE SHELL (modern, rounded)\n   ===================================================================== */\n:is(#cx, #cx-ui) { --bg: #111113; --surface: #1b1b1f; --surface-2: #26262b; --line: rgba(255,255,255,.08); --r: 14px; --pad: clamp(16px, 2.6vw, 48px); }\n#cx-nf { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; background: var(--bg); scroll-behavior: smooth; }\n.nf-nav {\n  position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 72px; padding: 0 var(--pad);\n  display: flex; align-items: center; gap: 28px; background: rgba(17,17,19,.72); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4);\n  border-bottom: 1px solid transparent; transition: background .3s, border-color .3s;\n}\n.nf-nav.solid { background: rgba(17,17,19,.92); border-bottom-color: var(--line); }\n.nf-logo { color: #e50914; font-weight: 900; font-size: 24px; letter-spacing: .04em; }\n.nf-links { display: flex; gap: 4px; }\n.nf-links a { font-size: 14px; font-weight: 500; color: #d6d6d9; padding: 9px 16px; border-radius: 999px; transition: background .2s, color .2s; }\n.nf-links a:hover { background: rgba(255,255,255,.08); color: #fff; }\n.nf-links a.on { background: #fff; color: #000; font-weight: 600; }\n.nf-spacer { flex: 1; }\n.nf-search { display: flex; align-items: center; height: 40px; border-radius: 999px; border: 1px solid transparent; transition: .25s; }\n.nf-search.open { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); padding-right: 14px; }\n.nf-search input { width: 0; background: transparent; border: 0; outline: 0; font-size: 14px; transition: width .25s; }\n.nf-search.open input { width: min(240px, 40vw); padding: 0 4px; }\n.nf-search button { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }\n.nf-search button:hover { background: rgba(255,255,255,.08); }\n.nf-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e50914, #7a0a12); display: grid; place-items: center; font-weight: 700; font-size: 14px; }\n.nf-menu-wrap { position: relative; }\n.nf-pop { position: absolute; right: 0; top: 52px; min-width: 210px; background: rgba(28,28,32,.96); backdrop-filter: blur(20px); border: 1px solid var(--line); border-radius: 16px; padding: 8px; font-size: 14px; box-shadow: 0 20px 50px rgba(0,0,0,.6); }\n.nf-pop > :not([data-cx]) { display: none !important; }\n.nf-pop a, .nf-pop button { display: block; width: 100%; text-align: left; padding: 11px 14px; border-radius: 10px; }\n.nf-pop a:hover, .nf-pop button:hover { background: rgba(255,255,255,.08); }\n\n/* hero: inset rounded card */\n.nf-hero { position: relative; margin: 88px var(--pad) 0; height: clamp(420px, 62vh, 720px); border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 60px rgba(0,0,0,.45); }\n.nf-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; background-size: cover; background-position: center 22%; }\n.nf-slide.on { opacity: 1; }\n.nf-hero::after { content: \"\"; position: absolute; inset: 0; pointer-events: none;\n  background: linear-gradient(90deg, rgba(8,8,10,.82) 0%, rgba(8,8,10,.45) 34%, rgba(8,8,10,0) 62%), linear-gradient(to top, rgba(8,8,10,.8) 0%, rgba(8,8,10,0) 42%); }\n.nf-hero-body { position: absolute; z-index: 3; left: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); width: min(560px, 52%); }\n.nf-hero-logo { max-width: min(420px, 100%); max-height: 150px; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 6px 18px rgba(0,0,0,.55)); display: block; margin-bottom: 18px; }\n.nf-hero-title { font-size: clamp(30px, 4vw, 60px); font-weight: 800; line-height: 1.02; letter-spacing: -.02em; margin: 0 0 16px; }\n.nf-meta { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; font-size: 14px; font-weight: 500; color: #e2e2e6; margin-bottom: 12px; }\n.nf-meta > span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\n.nf-meta .match { color: #5ee08a; font-weight: 700; }\n.nf-meta .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 7px; border-radius: 6px; font-size: 12px; line-height: 20px; }\n.nf-overview { font-size: clamp(14px, 1.1vw, 17px); line-height: 1.5; color: #e8e8ec; margin: 0 0 22px; max-width: 50ch; }\n.nf-hero-btns, .nf-btns { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }\n.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 24px 0 18px; border-radius: 999px; font-weight: 600; font-size: 15px; transition: background .2s, transform .15s; white-space: nowrap; }\n.btn:active { transform: scale(.97); }\n.btn.white { background: #fff; color: #000; }\n.btn.white:hover { background: #e8e8ea; }\n.btn.grey { background: rgba(255,255,255,.16); backdrop-filter: blur(10px); color: #fff; }\n.btn.grey:hover { background: rgba(255,255,255,.26); }\n.btn.round { width: 46px; padding: 0; background: rgba(255,255,255,.14); backdrop-filter: blur(10px); }\n.btn.round:hover { background: rgba(255,255,255,.26); }\n.btn.round.on { background: #fff; color: #000; }\n.nf-dots { position: absolute; z-index: 3; right: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); display: flex; gap: 6px; }\n.nf-dots i { width: 8px; height: 8px; background: rgba(255,255,255,.35); border-radius: 999px; cursor: pointer; transition: width .3s, background .3s; }\n.nf-dots i.on { background: #fff; width: 26px; }\n\n/* rows */\n.nf-rows { position: relative; z-index: 4; margin-top: 34px; padding-bottom: 120px; }\n.nf-row { margin-bottom: 30px; position: relative; animation: cxfade .5s both; }\n.nf-row h2 { margin: 0 var(--pad) 12px; font-size: clamp(18px, 1.5vw, 22px); font-weight: 700; letter-spacing: -.01em; color: #f2f2f4; }\n.nf-row h2 a { transition: color .2s; } .nf-row h2 a:hover { color: #fff; opacity: .8; }\n.nf-scroller { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding: 12px var(--pad) 18px; margin: -12px 0 -18px; scroll-padding: 0 var(--pad); scroll-behavior: smooth; }\n.nf-scroller::-webkit-scrollbar { display: none; }\n.nf-arrow { position: absolute; top: 50%; margin-top: -34px; width: 44px; height: 44px; border-radius: 50%; z-index: 6; background: rgba(30,30,34,.85); backdrop-filter: blur(8px); border: 1px solid var(--line); opacity: 0; transition: opacity .2s, transform .2s; display: grid; place-items: center; }\n.nf-row:hover .nf-arrow { opacity: 1; }\n.nf-arrow:hover { transform: scale(1.08); background: #fff; color: #000; }\n.nf-arrow.l { left: 10px; } .nf-arrow.r { right: 10px; }\n\n.nf-card { position: relative; flex: none; width: clamp(200px, 17.5vw, 340px); cursor: pointer; }\n.nf-card.poster { width: clamp(138px, 11.4vw, 220px); }\n.nf-card .im { position: relative; aspect-ratio: 16/9; background: var(--surface) center/cover no-repeat; border-radius: var(--r); overflow: hidden; transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset; }\n.nf-card.poster .im { aspect-ratio: 2/3; }\n.nf-card .im::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,0) 55%); opacity: 0; transition: opacity .3s; }\n.nf-card .im .ph { position: absolute; inset: 0; display: grid; place-items: center; padding: 10px; text-align: center; font-weight: 700; color: #8a8a90; font-size: 14px; }\n.nf-card .prog { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.28); z-index: 2; overflow: hidden; }\n.nf-card .prog i { display: block; height: 100%; background: #fff; border-radius: 4px; }\n.nf-card .title { margin: 9px 4px 0; font-size: 13px; font-weight: 500; color: #bdbdc2; }\n.nf-card .info { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 3; display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(6px); transition: opacity .3s, transform .3s; pointer-events: none; }\n.nf-card.poster .info { left: 8px; right: 8px; bottom: 8px; }\n.nf-card .info .t { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,.6); }\n.nf-card .info .m, .nf-card .info .acts button:not(.pl) { display: none; }\n.nf-card .acts { display: contents; }\n.nf-card .acts button.pl { width: 38px; height: 38px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; transition: transform .2s; flex: none; order: 2; }\n.nf-card .acts button.pl:hover { transform: scale(1.1); }\n.nf-card .acts button.pl svg { width: 20px; height: 20px; }\n@media (hover: hover) and (pointer: fine) {\n  .nf-card:hover .im { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 36px rgba(0,0,0,.55); }\n  .nf-card:hover .im::after { opacity: 1; }\n  .nf-card:hover .info { opacity: 1; transform: none; pointer-events: auto; }\n  .nf-card:hover .title { color: #fff; }\n}\n.nf-card.nohov .info { display: none; }\n\n/* grid pages */\n.nf-page-pad { padding: 104px var(--pad) 120px; }\n.nf-page-pad h1 { font-size: clamp(26px, 3vw, 38px); margin: 0 0 24px; font-weight: 800; letter-spacing: -.02em; }\n.nf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(clamp(130px, 12.5vw, 210px), 1fr)); gap: 24px 14px; }\n.nf-grid .nf-card, .nf-grid .nf-card.poster { width: auto; }\n.nf-empty { color: var(--dim); padding: 60px 0; text-align: center; font-size: 18px; }\n\n/* detail */\n.nf-detail { position: relative; min-height: 100vh; }\n.nf-dback { position: fixed; inset: 0; background-size: cover; background-position: center top; z-index: 0; }\n.nf-dback::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(17,17,19,.97) 0%, rgba(17,17,19,.75) 40%, rgba(17,17,19,.25) 100%), linear-gradient(to top, #111113 6%, rgba(17,17,19,0) 55%); }\n.nf-dbody { position: relative; z-index: 1; padding: 15vh var(--pad) 100px; max-width: 1560px; }\n.nf-dhead { display: flex; gap: 44px; align-items: flex-start; }\n.nf-dposter { width: clamp(160px, 18vw, 300px); aspect-ratio: 2/3; border-radius: 18px; background: var(--surface) center/cover; box-shadow: 0 24px 60px rgba(0,0,0,.6); flex: none; }\n.nf-dinfo { max-width: 760px; padding-top: 4px; }\n.nf-dinfo h1 { font-size: clamp(30px, 4vw, 58px); line-height: 1.03; font-weight: 800; letter-spacing: -.02em; margin: 0 0 14px; }\n.nf-dlogo { max-width: min(420px, 100%); max-height: 140px; object-fit: contain; object-position: left; margin-bottom: 16px; display: block; }\n.nf-tagline { font-style: italic; color: #cfcfd4; margin: 0 0 10px; }\n.nf-dinfo .ov { font-size: 16px; line-height: 1.6; color: #e4e4e8; margin: 0 0 24px; }\n.nf-facts { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; font-size: 14px; margin-top: 22px; }\n.nf-facts dt { color: #7c7c84; } .nf-facts dd { margin: 0; color: #d6d6da; }\n.nf-resume-bar { width: 160px; height: 4px; background: rgba(255,255,255,.25); border-radius: 4px; margin-top: 12px; overflow: hidden; }\n.nf-resume-bar i { display: block; height: 100%; background: #fff; border-radius: 4px; }\n.nf-sect { margin-top: 52px; }\n.nf-sect h2 { font-size: 22px; margin: 0 0 16px; letter-spacing: -.01em; }\n.nf-seasons { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }\n.nf-chip { padding: 9px 18px; border-radius: 999px; background: rgba(255,255,255,.09); font-size: 14px; font-weight: 500; transition: .2s; }\n.nf-chip:hover { background: rgba(255,255,255,.18); }\n.nf-chip.on { background: #fff; color: #000; font-weight: 600; }\n.nf-eps { display: flex; flex-direction: column; gap: 8px; }\n.nf-ep { display: grid; grid-template-columns: 36px 200px 1fr auto; gap: 20px; align-items: center; padding: 12px 18px 12px 12px; background: rgba(255,255,255,.04); border-radius: 16px; cursor: pointer; transition: background .2s; }\n.nf-ep:hover { background: rgba(255,255,255,.1); }\n.nf-ep .n { font-size: 20px; color: #bdbdc2; text-align: center; }\n.nf-ep .th { position: relative; aspect-ratio: 16/9; background: var(--surface-2) center/cover; border-radius: 10px; overflow: hidden; }\n.nf-ep .th .prog { position: absolute; left: 8px; right: 8px; bottom: 6px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); overflow: hidden; }\n.nf-ep .th .prog i { display: block; height: 100%; background: #fff; }\n.nf-ep .tt { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; margin-bottom: 6px; }\n.nf-ep .ds { font-size: 14px; color: #b4b4ba; line-height: 1.45; }\n.nf-ep .seen { color: #5ee08a; }\n.nf-cast { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }\n.nf-person { flex: none; width: 96px; text-align: center; font-size: 12.5px; }\n.nf-person .pi { width: 96px; height: 96px; border-radius: 50%; background: var(--surface-2) center/cover; margin-bottom: 8px; }\n.nf-person small { display: block; color: #85858c; margin-top: 2px; }\n\n.nf-npill { position: fixed; z-index: 60; right: 20px; bottom: 20px; display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; background: rgba(30,30,34,.92); backdrop-filter: blur(16px); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 12px 36px rgba(0,0,0,.55); max-width: 320px; cursor: pointer; }\n.nf-npill .cv { width: 44px; height: 44px; border-radius: 10px; background: #333 center/cover; }\n.nf-npill .tx { min-width: 0; font-size: 13px; } .nf-npill .tx b { display: block; } .nf-npill .tx span { color: var(--dim); }\n.nf-npill .pp { width: 36px; height: 36px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; }\n\n.cx-tabs { display: none; }\n\n/* NETFLIX MOBILE */\n@media (max-width: 800px) {\n  :is(#cx, #cx-ui) { --pad: 14px; }\n  .nf-nav { height: 58px; gap: 12px; }\n  .nf-logo { font-size: 20px; }\n  .nf-links { display: none; }\n  .nf-hero { margin-top: 68px; height: 68vh; min-height: 420px; border-radius: 22px; }\n  .nf-slide { background-position: 62% center; }\n  .nf-hero::after { background: linear-gradient(to top, rgba(8,8,10,.92) 0%, rgba(8,8,10,.35) 55%, rgba(8,8,10,0) 100%); }\n  .nf-hero-body { left: 0; right: 0; bottom: 18px; width: auto; padding: 0 18px; text-align: center; display: flex; flex-direction: column; align-items: center; }\n  .nf-hero-logo { object-position: center bottom; max-height: 96px; }\n  .nf-meta { justify-content: center; font-size: 12.5px; }\n  .nf-overview { display: none; }\n  .nf-hero-btns { justify-content: center; }\n  .nf-dots { display: none; }\n  .btn { height: 44px; font-size: 14.5px; padding: 0 20px 0 15px; }\n  .btn.round { width: 44px; padding: 0; }\n  .nf-rows { margin-top: 24px; padding-bottom: 150px; }\n  .nf-row { margin-bottom: 22px; }\n  .nf-row h2 { font-size: 17px; }\n  .nf-scroller { gap: 10px; scroll-snap-type: x proximity; }\n  .nf-arrow { display: none; }\n  .nf-card { width: 44vw; } .nf-card.poster { width: 31vw; }\n  .nf-card .info { display: none; }\n  .nf-page-pad { padding: 76px var(--pad) 150px; }\n  .nf-grid { grid-template-columns: repeat(3, 1fr); gap: 16px 10px; }\n  .nf-dbody { padding: 70px var(--pad) 150px; }\n  .nf-dhead { flex-direction: column; align-items: flex-start; gap: 18px; }\n  .nf-dposter { width: 44vw; border-radius: 16px; }\n  .nf-dback::after { background: linear-gradient(to top, #111113 24%, rgba(17,17,19,.6) 70%, rgba(17,17,19,.75)); }\n  .nf-ep { grid-template-columns: 112px 1fr; gap: 12px; padding: 10px; }\n  .nf-ep .n, .nf-ep .rt { display: none; }\n  .nf-npill { right: 10px; left: 10px; bottom: 74px; max-width: none; }\n  .cx-tabs { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0)); z-index: 70; height: 62px; border-radius: 22px; background: rgba(28,28,32,.88); backdrop-filter: blur(20px); border: 1px solid var(--line); justify-content: space-around; box-shadow: 0 10px 30px rgba(0,0,0,.5); }\n  .cx-tabs a, .cx-tabs button { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 10.5px; color: #8e8e95; }\n  .cx-tabs a.on, .cx-tabs button.on { color: #fff; }\n  .cx-tabs svg { width: 22px; height: 22px; }\n  .nf-npill { bottom: 84px; }\n}\n\n/* =====================================================================\n   SPOTIFY SHELL\n   ===================================================================== */\n#cx-sp { position: absolute; inset: 0; background: #000; display: grid; grid-template-columns: 320px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 88px; gap: 8px; padding: 8px; --accent: #1ed760; }\n#cx-sp.idle { grid-template-rows: minmax(0, 1fr) 0; row-gap: 0; }\n.sp-side { grid-row: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0; }\n.sp-card { background: #121212; border-radius: 8px; }\n.sp-top { padding: 12px 12px 8px; }\n.sp-navlink { display: flex; align-items: center; gap: 18px; padding: 10px 12px; font-weight: 700; color: #b3b3b3; border-radius: 6px; transition: color .2s; width: 100%; font-size: 16px; }\n.sp-navlink:hover, .sp-navlink.on { color: #fff; }\n.sp-lib { flex: 1; min-height: 0; display: flex; flex-direction: column; }\n.sp-libhead { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 8px 20px; font-weight: 700; color: #b3b3b3; }\n.sp-libhead button { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #b3b3b3; }\n.sp-libhead button:hover { background: #1f1f1f; color: #fff; }\n.sp-chips { display: flex; gap: 8px; padding: 4px 16px 10px; flex-wrap: wrap; }\n.sp-chip { padding: 6px 12px; border-radius: 16px; background: #2a2a2a; font-size: 13px; font-weight: 500; transition: .2s; }\n.sp-chip:hover { background: #333; }\n.sp-chip.on { background: #fff; color: #000; }\n.sp-liblist { flex: 1; overflow-y: auto; padding: 0 8px 8px; }\n.sp-li { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 6px; cursor: pointer; width: 100%; text-align: left; }\n.sp-li:hover { background: #1a1a1a; }\n.sp-li.on { background: #232323; }\n.sp-li .art { width: 48px; height: 48px; border-radius: 4px; background: #282828 center/cover; flex: none; display: grid; place-items: center; }\n.sp-li.round .art { border-radius: 50%; }\n.sp-li .nm { font-size: 16px; font-weight: 500; } .sp-li .nm.playing { color: var(--accent); }\n.sp-li .sb { font-size: 14px; color: #b3b3b3; margin-top: 2px; }\n.sp-li > div:last-child { min-width: 0; }\n.liked-art { background: linear-gradient(135deg, #450af5, #c4efd9) !important; }\n.sp-main { grid-row: 1; grid-column: 2; position: relative; overflow: hidden; border-radius: 8px; background: #121212; min-height: 0; }\n.sp-scroll { position: absolute; inset: 0; overflow-y: auto; scroll-behavior: auto; }\n.sp-bg { position: absolute; left: 0; right: 0; top: 0; height: 340px; background: linear-gradient(180deg, var(--tint, #333) 0%, #121212 100%); opacity: .55; pointer-events: none; transition: background .6s; }\n.sp-header { position: sticky; top: 0; z-index: 10; height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; transition: background .25s; }\n.sp-header.solid { background: #121212ee; backdrop-filter: blur(8px); }\n.sp-hbtn { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,.7); display: grid; place-items: center; }\n.sp-hbtn:hover { background: rgba(0,0,0,.9); }\n.sp-hsearch { display: flex; align-items: center; gap: 10px; background: #242424; border-radius: 500px; height: 46px; padding: 0 14px; width: min(420px, 100%); border: 2px solid transparent; }\n.sp-hsearch:focus-within { border-color: #fff; background: #2a2a2a; }\n.sp-hsearch input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-size: 15px; }\n.sp-pillbtn { padding: 8px 18px; border-radius: 500px; background: #fff; color: #000; font-weight: 700; font-size: 14px; }\n.sp-pillbtn:hover { transform: scale(1.04); }\n.sp-pillbtn.dark { background: rgba(0,0,0,.7); color: #fff; }\n.sp-content { position: relative; padding: 0 24px 40px; animation: cxfade .35s both; }\n.sp-content h2 { font-size: 24px; font-weight: 700; margin: 36px 0 14px; letter-spacing: -.01em; }\n.sp-content h2 .more { font-size: 13px; color: #b3b3b3; float: right; margin-top: 10px; font-weight: 700; }\n.sp-greet { font-size: 30px; font-weight: 800; margin: 12px 0 20px; }\n.sp-quick { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }\n.sp-qt { display: flex; align-items: center; gap: 14px; height: 64px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; cursor: pointer; position: relative; padding-right: 60px; transition: background .25s; }\n.sp-qt:hover { background: rgba(255,255,255,.18); }\n.sp-qt .art { width: 64px; height: 64px; background: #333 center/cover; flex: none; }\n.sp-qt b { font-size: 15px; }\n.sp-qt .pbtn { right: 12px; top: 12px; }\n.sp-shelf { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(170px, 1fr); gap: 16px; overflow: hidden; }\n.sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); gap: 16px; }\n.sp-tile { position: relative; padding: 12px; border-radius: 8px; background: #181818; cursor: pointer; transition: background .3s; min-width: 0; }\n.sp-tile:hover { background: #282828; }\n.sp-tile .cv { position: relative; aspect-ratio: 1; border-radius: 6px; background: #333 center/cover; box-shadow: 0 8px 24px rgba(0,0,0,.5); margin-bottom: 14px; display: grid; place-items: center; overflow: hidden; }\n.sp-tile.round .cv { border-radius: 50%; }\n.sp-tile .nm { font-weight: 700; font-size: 16px; margin-bottom: 4px; }\n.sp-tile .sb { font-size: 14px; color: #a7a7a7; line-height: 1.35; }\n.sp-tile.round .nm, .sp-tile.round .sb { text-align: left; }\n.pbtn { position: absolute; right: 20px; bottom: 74px; width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: #000; display: grid !important; place-items: center; box-shadow: 0 8px 8px rgba(0,0,0,.3); opacity: 0; transform: translateY(8px); transition: .3s; z-index: 2; }\n.sp-tile:hover .pbtn, .sp-qt:hover .pbtn, .pbtn.show { opacity: 1; transform: none; }\n.pbtn:hover { transform: scale(1.06) !important; background: #3be477; }\n.mixcv { width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 12px; font-weight: 800; font-size: 20px; line-height: 1.1; }\n.cv-ph { color: #7a7a7a; }\n.cv-ph svg { width: 40%; height: 40%; }\n\n/* playlist / album header */\n.sp-ph { display: flex; align-items: flex-end; gap: 24px; padding: 24px 0 24px; min-height: 280px; }\n.sp-ph .cv { width: clamp(150px, 15vw, 232px); aspect-ratio: 1; border-radius: 4px; background: #333 center/cover; box-shadow: 0 4px 60px rgba(0,0,0,.5); flex: none; display: grid; place-items: center; }\n.sp-ph.artist .cv { border-radius: 50%; }\n.sp-ph .tp { font-size: 14px; font-weight: 700; margin-bottom: 4px; }\n.sp-ph h1 { font-size: clamp(32px, 6vw, 88px); font-weight: 900; line-height: 1; margin: 0 0 18px; letter-spacing: -.04em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; padding-bottom: 4px; }\n.sp-ph .mt { font-size: 14px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; color: #e0e0e0; }\n.sp-ph .mt a:hover { text-decoration: underline; }\n.sp-actions { display: flex; align-items: center; gap: 24px; padding: 8px 0 20px; }\n.sp-big { width: 56px; height: 56px; border-radius: 50%; background: var(--accent); color: #000; display: grid; place-items: center; transition: transform .1s; }\n.sp-big:hover { transform: scale(1.06); background: #3be477; }\n.sp-big svg { width: 28px; height: 28px; }\n.sp-ico { color: #b3b3b3; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; }\n.sp-ico:hover { color: #fff; }\n.sp-ico.on { color: var(--accent); }\n.sp-ico svg { width: 30px; height: 30px; }\n\n/* track table */\n.sp-th, .sp-row { display: grid; grid-template-columns: 16px minmax(120px, 6fr) minmax(80px, 4fr) minmax(60px, 3fr) 80px; gap: 16px; align-items: center; padding: 0 16px; }\n.sp-th.noalb, .sp-row.noalb { grid-template-columns: 16px minmax(120px, 6fr) minmax(60px, 3fr) 80px; }\n.sp-th { height: 36px; color: #b3b3b3; font-size: 13px; border-bottom: 1px solid #ffffff1a; margin-bottom: 8px; position: sticky; top: 64px; background: #121212; z-index: 5; text-transform: none; }\n.sp-th > :last-child { text-align: right; }\n.sp-row { height: 56px; border-radius: 4px; color: #b3b3b3; font-size: 14px; cursor: default; }\n.sp-row:hover { background: rgba(255,255,255,.1); }\n.sp-row .ix { text-align: right; position: relative; font-variant-numeric: tabular-nums; }\n.sp-row .ix .pl { position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: #fff; display: none; }\n.sp-row .ix .pl svg { width: 18px; height: 18px; }\n.sp-row:hover .ix .n { display: none; } .sp-row:hover .ix .pl { display: block; }\n.sp-row .ti { display: flex; align-items: center; gap: 14px; min-width: 0; }\n.sp-row .ti .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\n.sp-row .ti .tx { min-width: 0; }\n.sp-row .ti .tn { color: #fff; font-size: 16px; }\n.sp-row .ti .ta { font-size: 14px; }\n.sp-row .ti .ta a:hover, .sp-row .al a:hover { text-decoration: underline; color: #fff; }\n.sp-row.playing .tn, .sp-row.playing .ix .n { color: var(--accent); }\n.sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 14px; font-variant-numeric: tabular-nums; }\n.sp-row .du .lk { opacity: 0; color: #b3b3b3; } .sp-row:hover .du .lk { opacity: 1; } .sp-row .du .lk.on { opacity: 1; color: var(--accent); }\n.sp-row .du .lk svg { width: 18px; height: 18px; }\n.sp-row .du .mo { opacity: 0; } .sp-row:hover .du .mo { opacity: 1; }\n.sp-row .du .mo svg { width: 20px; height: 20px; }\n.sp-row .eq { display: none; }\n.sp-row.playing .ix .n { visibility: hidden; }\n.sp-row.playing .ix .eq { display: flex; align-items: flex-end; gap: 2px; height: 14px; position: absolute; right: 2px; top: 50%; transform: translateY(-50%); }\n.sp-row.playing:hover .ix .eq { display: none; }\n.eq i { width: 3px; background: var(--accent); animation: cxeq 1s infinite ease-in-out; height: 40%; }\n.eq i:nth-child(2) { animation-delay: .2s; } .eq i:nth-child(3) { animation-delay: .4s; }\n.paused .eq i { animation-play-state: paused; }\n@keyframes cxeq { 0%,100% { height: 25%; } 50% { height: 100%; } }\n.sp-disc { margin: 20px 0 6px; font-weight: 700; color: #b3b3b3; display: flex; align-items: center; gap: 10px; padding: 0 16px; }\n\n/* search results */\n.sp-res { display: grid; grid-template-columns: minmax(280px, 2fr) 3fr; gap: 24px; }\n.sp-top1 { padding: 20px; border-radius: 8px; background: #181818; cursor: pointer; position: relative; transition: background .3s; }\n.sp-top1:hover { background: #282828; }\n.sp-top1 .cv { width: 92px; height: 92px; border-radius: 6px; background: #333 center/cover; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.5); }\n.sp-top1.round .cv { border-radius: 50%; }\n.sp-top1 b { font-size: 30px; display: block; margin-bottom: 6px; }\n.sp-top1 span { color: #b3b3b3; font-size: 14px; }\n.sp-genres { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }\n.sp-genre { position: relative; height: 110px; border-radius: 8px; padding: 14px; font-size: 20px; font-weight: 800; overflow: hidden; cursor: pointer; }\n\n/* player bar */\n.sp-player { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: minmax(180px, 30%) minmax(300px, 40%) minmax(180px, 30%); align-items: center; padding: 0 8px; gap: 8px; }\n.pl-l { display: flex; align-items: center; gap: 14px; min-width: 0; }\n.pl-l .cv { width: 56px; height: 56px; border-radius: 4px; background: #282828 center/cover; flex: none; cursor: pointer; }\n.pl-l .tx { min-width: 0; } .pl-l .tn { font-size: 14px; } .pl-l .tn:hover, .pl-l .ta a:hover { text-decoration: underline; cursor: pointer; }\n.pl-l .ta { font-size: 12px; color: #b3b3b3; }\n.pl-c { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 722px; width: 100%; margin: 0 auto; }\n.pl-btns { display: flex; align-items: center; gap: 16px; }\n.pl-btn { color: #b3b3b3; width: 32px; height: 32px; display: grid; place-items: center; position: relative; }\n.pl-btn:hover { color: #fff; }\n.pl-btn.on { color: var(--accent); }\n.pl-btn.on::after { content: \"\"; position: absolute; bottom: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }\n.pl-btn svg { width: 20px; height: 20px; }\n.pl-btn.big { background: #fff; color: #000; border-radius: 50%; width: 36px; height: 36px; }\n.pl-btn.big:hover { transform: scale(1.06); background: #fff; color: #000; }\n.pl-btn.big svg { width: 22px; height: 22px; }\n.mp-seek { display: flex; align-items: center; gap: 8px; width: 100%; font-size: 11px; color: #a7a7a7; font-variant-numeric: tabular-nums; }\n.mp-seek span { width: 40px; } .mp-seek span:first-child { text-align: right; }\n.bar { position: relative; flex: 1; height: 12px; display: flex; align-items: center; cursor: pointer; touch-action: none; }\n.bar::before { content: \"\"; position: absolute; left: 0; right: 0; height: 4px; border-radius: 2px; background: #4d4d4d; }\n.bar i { position: absolute; left: 0; height: 4px; border-radius: 2px; background: #fff; pointer-events: none; }\n.bar b { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #fff; margin-left: -6px; opacity: 0; pointer-events: none; }\n.bar:hover i { background: var(--accent); } .bar:hover b { opacity: 1; }\n.pl-r { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }\n.pl-r .bar { flex: none; width: 100px; }\n\n.sp-menu { position: fixed; z-index: 9600; min-width: 220px; max-width: 300px; max-height: 70vh; overflow-y: auto; background: #282828; border-radius: 4px; padding: 4px; box-shadow: 0 16px 24px rgba(0,0,0,.4); font-size: 14px; color: #eee; }\n.sp-menu button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; text-align: left; border-radius: 2px; }\n.sp-menu button:hover { background: rgba(255,255,255,.1); }\n.sp-menu hr { border: 0; border-top: 1px solid #ffffff1a; margin: 4px 0; }\n.sp-modal-bg { position: fixed; inset: 0; z-index: 9700; background: rgba(0,0,0,.7); display: grid; place-items: center; padding: 16px; }\n.sp-modal { background: #282828; border-radius: 8px; padding: 24px; width: min(420px, 100%); }\n.sp-modal h3 { margin: 0 0 16px; font-size: 22px; }\n.sp-modal input { width: 100%; padding: 12px; border-radius: 4px; border: 0; background: #3e3e3e; font-size: 15px; outline: 0; }\n.sp-modal .row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }\n.sp-queue { position: absolute; top: 8px; right: 8px; bottom: 96px; width: 340px; background: #121212; border-radius: 8px; z-index: 30; overflow-y: auto; padding: 16px 8px; box-shadow: 0 0 30px rgba(0,0,0,.6); }\n.sp-queue h3 { margin: 8px 12px; font-size: 16px; } .sp-queue h4 { margin: 18px 12px 6px; color: #b3b3b3; font-size: 14px; }\n.sp-qi { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 4px; cursor: pointer; }\n.sp-qi:hover { background: #ffffff14; } .sp-qi .cv { width: 40px; height: 40px; background: #333 center/cover; border-radius: 3px; } .sp-qi.playing b { color: var(--accent); }\n.sp-qi span { color: #b3b3b3; font-size: 13px; display: block; }\n.sp-qi > div { min-width: 0; }\n\n/* full-screen mobile player */\n.sp-full { position: fixed; inset: 0; z-index: 9500; display: none; flex-direction: column; padding: 14px 24px calc(24px + env(safe-area-inset-bottom, 0)); background: linear-gradient(180deg, var(--tint, #333), #121212 80%); overflow-y: auto; }\n.sp-full.open { display: flex; animation: cxfade .25s both; }\n.sp-full .top { display: flex; justify-content: space-between; align-items: center; height: 48px; }\n.sp-full .top b { font-size: 13px; }\n.sp-full .cvbig { width: 100%; max-width: 420px; aspect-ratio: 1; margin: 22px auto 28px; border-radius: 8px; background: #333 center/cover; box-shadow: 0 16px 50px rgba(0,0,0,.5); }\n.sp-full .meta { display: flex; align-items: center; justify-content: space-between; max-width: 420px; width: 100%; margin: 0 auto 10px; gap: 12px; }\n.sp-full .meta .tn { font-size: 22px; font-weight: 800; } .sp-full .meta .ta { color: #cfcfcf; margin-top: 4px; }\n.sp-full .seekwrap { max-width: 420px; width: 100%; margin: 6px auto; }\n.sp-full .seekwrap .mp-seek { margin-top: 2px; } .sp-full .seekwrap .bar::before { background: #ffffff44; }\n.sp-full .ctr { display: flex; justify-content: space-between; align-items: center; max-width: 420px; width: 100%; margin: 10px auto; }\n.sp-full .ctr .pl-btn svg { width: 28px; height: 28px; } .sp-full .ctr .pl-btn.big { width: 64px; height: 64px; } .sp-full .ctr .pl-btn.big svg { width: 34px; height: 34px; }\n\n.sp-mini { display: none; }\n\n/* =====================================================================\n   SPOTIFY MOBILE\n   ===================================================================== */\n@media (max-width: 800px) {\n  #cx-sp { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); padding: 0; gap: 0; }\n  .sp-side { display: none; }\n  .sp-main { grid-column: 1; border-radius: 0; background: #121212; }\n  .sp-header { height: 54px; padding: 0 14px; }\n  .sp-content { padding: 0 14px calc(150px + env(safe-area-inset-bottom, 0)); }\n  .sp-content h2 { font-size: 20px; margin: 26px 0 12px; }\n  .sp-greet { font-size: 24px; }\n  .sp-quick { grid-template-columns: 1fr 1fr; gap: 8px; }\n  .sp-qt { height: 56px; padding-right: 8px; } .sp-qt .art { width: 56px; height: 56px; } .sp-qt b { font-size: 13px; } .sp-qt .pbtn { display: none !important; }\n  .sp-shelf { grid-auto-flow: column; grid-auto-columns: 40vw; overflow-x: auto; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; gap: 12px; }\n  .sp-shelf::-webkit-scrollbar { display: none; }\n  .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\n  .sp-tile { padding: 0; background: none; } .sp-tile:hover { background: none; }\n  .sp-tile .cv { margin-bottom: 8px; } .sp-tile .pbtn { display: none !important; } .sp-tile .nm { font-size: 14px; } .sp-tile .sb { font-size: 12px; }\n  .sp-ph { flex-direction: column; align-items: center; text-align: center; min-height: 0; padding: 4px 0 6px; gap: 16px; }\n  .sp-ph .cv { width: 62vw; max-width: 280px; }\n  .sp-ph h1 { font-size: 26px; letter-spacing: -.02em; margin-bottom: 8px; -webkit-line-clamp: 2; }\n  .sp-ph .mt { justify-content: center; font-size: 13px; }\n  .sp-ph > div:last-child { width: 100%; }\n  .sp-actions { gap: 18px; padding: 4px 0 14px; }\n  .sp-actions .sp-big { margin-left: auto; order: 9; }\n  .sp-th { display: none; }\n  .sp-row, .sp-row.noalb { grid-template-columns: minmax(0, 1fr) auto; height: 58px; padding: 0; gap: 8px; }\n  .sp-row .ix, .sp-row .al { display: none !important; }\n  .sp-row .du { gap: 4px; } .sp-row .du .tm { display: none; } .sp-row .du .lk, .sp-row .du .mo { opacity: 1; } .sp-row .du .mo svg { width: 22px; height: 22px; }\n  .sp-row.playing .ti .tn { color: var(--accent); }\n  .sp-res { grid-template-columns: 1fr; }\n  .sp-queue { top: 0; right: 0; left: 0; bottom: 0; width: auto; border-radius: 0; z-index: 9550; }\n  .sp-player { display: none; }\n  .sp-mini { display: flex; position: fixed; left: 8px; right: 8px; bottom: calc(62px + env(safe-area-inset-bottom, 0)); z-index: 80; height: 56px; border-radius: 8px; align-items: center; gap: 10px; padding: 0 8px; background: var(--mini, #3a3350); box-shadow: 0 4px 16px rgba(0,0,0,.4); overflow: hidden; }\n  .sp-mini .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\n  .sp-mini .tx { flex: 1; min-width: 0; font-size: 13px; } .sp-mini .tx b { display: block; } .sp-mini .tx span { color: #e0e0e0cc; font-size: 12px; }\n  .sp-mini .pl-btn { color: #fff; width: 38px; height: 38px; } .sp-mini .pl-btn svg { width: 26px; height: 26px; }\n  .sp-mini .mbar { position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; background: #ffffff44; } .sp-mini .mbar i { display: block; height: 100%; background: #fff; }\n}\n\n#cx.mode-nf .sp-mini, #cx.mode-nf .sp-full { display: none !important; }\n#cx.mode-nf .sp-full.open { display: none !important; }\n\n/* ---- Spotify polish: softer, rounder ---- */\n.sp-card, .sp-main { border-radius: 16px; }\n.sp-main, .sp-card { background: #121214; }\n#cx-sp { background: #08080a; }\n.sp-tile { border-radius: 16px; background: #17171a; }\n.sp-tile .cv { border-radius: 12px; }\n.sp-qt { border-radius: 10px; }\n.sp-li { border-radius: 10px; } .sp-li .art { border-radius: 8px; }\n.sp-chip, .sp-pillbtn { border-radius: 999px; }\n.sp-row { border-radius: 10px; }\n.sp-ph .cv { border-radius: 14px; }\n.sp-menu, .sp-modal { border-radius: 14px; }\n.sp-top1 { border-radius: 16px; } .sp-genre { border-radius: 14px; }\n.sp-queue { border-radius: 16px; }\n.sp-mini { border-radius: 16px !important; bottom: calc(84px + env(safe-area-inset-bottom, 0)) !important; }\n.nf-card.poster .info .t { display: none; }\n.nf-card.poster .info { justify-content: flex-end; }\n\n/* =====================================================================\n   INTEGRATION: persistent top bar, hover, rounder icons\n   ===================================================================== */\n:is(#cx, #cx-ui) svg path { stroke: currentColor; stroke-width: .4; stroke-linejoin: round; stroke-linecap: round; }\n#cx-ui .nf-nav { position: fixed; z-index: 9100; display: none; }\n#cx-ui .nf-nav.solid { background: rgba(17,17,19,.9); }\n.nf-pillbtn { display: inline-flex; align-items: center; gap: 4px; padding: 9px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; color: #d6d6d9; }\n.nf-pillbtn:hover { background: rgba(255,255,255,.08); color: #fff; }\n.nf-more .nf-pop { left: 0; right: auto; }\n.nf-pop a { display: flex !important; align-items: center; gap: 12px; }\n.nf-pop a.on { background: rgba(255,255,255,.1); }\n.m-opt { display: none !important; }\n.nf-pop.up { position: fixed; right: 12px; left: auto; top: auto; bottom: 88px; z-index: 9200; }\n@media (max-width: 1280px) { .nf-links a.opt { display: none; } .m-opt { display: flex !important; } }\n@media (max-width: 1000px) { .nf-links a[data-k=\"watchlist\"] { display: none; } }\n.cx-tabs.hide { display: none !important; }\n#cx-ui .cx-tabs { z-index: 9100; }\n@media (min-width: 801px) { #cx-ui .cx-tabs, #cx-ui .nf-pop.up { display: none !important; } }\n#cx-ui .nf-pop.hide { display: none !important; }\n\n/* richer card hover: tilt, spotlight, zooming image, info overlay */\n.nf-card .im { transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transform-style: preserve-3d; will-change: transform; }\n.nf-card .im .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .7s cubic-bezier(.2,.7,.2,1); }\n.nf-card .im::before { content: \"\"; position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity .3s;\n  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.22), rgba(255,255,255,0) 65%); }\n.nf-card .im::after { z-index: 1; }\n@media (hover: hover) and (pointer: fine) {\n  .nf-card .im { transition: transform .12s ease-out, box-shadow .35s; }\n  .nf-card:hover .im { transform: perspective(800px) translateY(-6px) scale(1.04) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); box-shadow: 0 22px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.18); }\n  .nf-card:hover .im::before { opacity: 1; }\n  .nf-card:hover .im .bgi { transform: scale(1.1); }\n}\n.nf-card .info { z-index: 3; flex-wrap: wrap; align-items: flex-end; gap: 6px 8px; left: 14px; right: 14px; bottom: 14px; }\n.nf-card .info .t { flex: 1 0 100%; font-size: 15px; font-weight: 700; }\n.nf-card .info .m { display: flex !important; flex: 1 0 100%; gap: 8px; font-size: 12px; color: #d4d4d8; margin-bottom: 4px; }\n.nf-card .info .m span + span::before { content: \"•\"; margin-right: 8px; opacity: .5; }\n.nf-card .acts { display: flex !important; gap: 8px; width: 100%; order: 3; }\n.nf-card .acts button { display: grid !important; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.18); backdrop-filter: blur(8px); border: 0 !important; place-items: center; transition: transform .2s, background .2s; }\n.nf-card .acts button svg { width: 18px; height: 18px; }\n.nf-card .acts button:hover { background: rgba(255,255,255,.3); transform: scale(1.1); }\n.nf-card .acts button.pl { background: #fff; color: #000; order: 0; }\n.nf-card.poster .info { left: 10px; right: 10px; bottom: 10px; }\n.nf-card.poster .info .t { display: block; font-size: 13px; }\n.nf-card.poster .info .m { font-size: 11px; }\n.nf-card.poster .acts button { width: 34px; height: 34px; }\n.nf-card.poster .acts button:nth-child(3) { display: none !important; }\n\n/* =====================================================================\n   NATIVE JELLYFIN PAGES (settings, dashboard, plugin pages) - skinned to match\n   ===================================================================== */\nhtml.cx-ready:not(.transparentDocument) body, html.cx-ready:not(.transparentDocument) .backgroundContainer, html.cx-ready:not(.transparentDocument) .skinBody { background: #111113 !important; }\nhtml.cx-ready.transparentDocument body, html.cx-ready.transparentDocument .backgroundContainer, html.cx-ready.transparentDocument .skinBody { background: transparent !important; }\nhtml.cx-ready :where(body, button, input, select, textarea, h1, h2, h3, h4, .MuiTypography-root, .MuiButtonBase-root, .listItemBodyText, .sectionTitle, .emby-input, .emby-select) { font-family: \"Inter\", \"Segoe UI\", system-ui, sans-serif; }\nhtml.cx-ready body { color: #e8e8ec; }\nhtml.cx-frame .skinHeader, html.cx-frame .MuiAppBar-root, html.cx-frame .headerTabs, html.cx-frame .mainDrawerHandle { display: none !important; }\nhtml.cx-frame .page, html.cx-frame .mainAnimatedPage { padding-top: 92px !important; }\nhtml.cx-frame .padded-top-focusscale, html.cx-frame .padded-top { padding-top: 0 !important; }\nhtml.cx-ready .skinHeader, html.cx-ready .MuiAppBar-root { background: rgba(17,17,19,.9) !important; backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,.06) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiDrawer-paper, html.cx-ready .mainDrawer { background: #0d0d0f !important; border-right: 1px solid rgba(255,255,255,.06) !important; }\nhtml.cx-ready .MuiListItemButton-root, html.cx-ready .navMenuOption { border-radius: 12px !important; margin: 2px 10px !important; width: auto !important; transition: background .2s; }\nhtml.cx-ready .MuiListItemButton-root.Mui-selected, html.cx-ready .navMenuOption-selected { background: rgba(255,255,255,.1) !important; }\nhtml.cx-ready .MuiListItemButton-root:hover, html.cx-ready .navMenuOption:hover { background: rgba(255,255,255,.07) !important; }\nhtml.cx-ready .MuiPaper-root, html.cx-ready .paperList, html.cx-ready .dialog, html.cx-ready .actionSheet, html.cx-ready .formDialog { background: #1a1a1e !important; border-radius: 18px !important; color: #e8e8ec; box-shadow: 0 8px 30px rgba(0,0,0,.35) !important; border: 1px solid rgba(255,255,255,.05); }\nhtml.cx-ready .MuiMenu-paper, html.cx-ready .MuiPopover-paper { background: rgba(28,28,32,.97) !important; backdrop-filter: blur(20px); border-radius: 16px !important; }\nhtml.cx-ready .MuiMenuItem-root { border-radius: 10px !important; margin: 2px 6px !important; }\nhtml.cx-ready .MuiButton-root, html.cx-ready .emby-button.raised, html.cx-ready .button-submit, html.cx-ready .raised { border-radius: 999px !important; text-transform: none !important; font-weight: 600; }\nhtml.cx-ready .raised, html.cx-ready .button-submit, html.cx-ready .MuiButton-contained { background: #fff !important; color: #000 !important; box-shadow: none !important; }\nhtml.cx-ready .raised:hover, html.cx-ready .button-submit:hover, html.cx-ready .MuiButton-contained:hover { background: #e4e4e8 !important; }\nhtml.cx-ready .emby-input, html.cx-ready .emby-select, html.cx-ready .emby-textarea, html.cx-ready .MuiInputBase-root, html.cx-ready .MuiOutlinedInput-root { background: #1f1f24 !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,.08) !important; color: #fff; }\nhtml.cx-ready .emby-input:focus, html.cx-ready .emby-select:focus, html.cx-ready .emby-textarea:focus { border-color: rgba(255,255,255,.5) !important; outline: 0; }\nhtml.cx-ready .MuiOutlinedInput-notchedOutline { border: 0 !important; }\nhtml.cx-ready .listItem, html.cx-ready .listItem-border { border-radius: 14px !important; border-color: rgba(255,255,255,.06) !important; transition: background .2s; }\nhtml.cx-ready .listItem:hover { background: rgba(255,255,255,.05) !important; }\nhtml.cx-ready .cardScalable, html.cx-ready .cardImageContainer, html.cx-ready .cardImage, html.cx-ready .cardBox { border-radius: 14px !important; }\nhtml.cx-ready .cardText { color: #d4d4d8; }\nhtml.cx-ready .sectionTitle, html.cx-ready .sectionTitle-cards { font-weight: 700; letter-spacing: -.01em; }\nhtml.cx-ready .emby-tab-button { border-radius: 999px !important; }\nhtml.cx-ready .emby-tab-button-active { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .checkboxIcon, html.cx-ready .emby-checkbox:checked + span + .checkboxOutline { border-radius: 6px !important; }\nhtml.cx-ready .emby-checkbox:checked + span::before, html.cx-ready .emby-radio:checked + span::before { background: #fff !important; }\nhtml.cx-ready .MuiChip-root, html.cx-ready .MuiAvatar-root { border-radius: 999px; }\nhtml.cx-ready .MuiIconButton-root, html.cx-ready .paper-icon-button-light, html.cx-ready .headerButton { border-radius: 50% !important; }\n\n/* settings menu rows as rounded cards */\nhtml.cx-ready .listItem-border { background: #1a1a1e !important; margin: 0 0 10px !important; padding: 14px 18px !important; border: 1px solid rgba(255,255,255,.05) !important; }\nhtml.cx-ready .listItem-border:hover { background: #222227 !important; }\nhtml.cx-ready .listItem-border .listItemIcon { background: rgba(255,255,255,.1) !important; color: #fff; border-radius: 12px !important; width: 40px; height: 40px; display: grid; place-items: center; }\nhtml.cx-ready .listItem-border .listItemBodyText { font-weight: 600; font-size: 15px; }\nhtml.cx-ready .readOnlyContent h2, html.cx-ready .userProfilesIntro { font-size: 28px; font-weight: 800; letter-spacing: -.02em; }\nhtml.cx-ready .dashboardColumn .cardBox, html.cx-ready .dashboardSection .card { background: #1a1a1e !important; }\nhtml.cx-ready .MuiToolbar-root { background: transparent; }\nhtml.cx-ready .MuiDrawer-paper .MuiListSubheader-root { background: transparent !important; text-transform: none; font-weight: 600; color: #8c8c94; }\n.nf-card.poster .info .t, .nf-card.poster .info .m { display: none !important; }\n.nf-card.poster .info { justify-content: center; }\n.nf-card.poster .acts { justify-content: center; }\n.nf-card .info .acts { pointer-events: auto; }\n\n/* hover overlay lives inside the image now */\n.nf-card .im .info { position: absolute; left: 12px; right: 12px; bottom: 12px; top: auto; background: none; padding: 0; box-shadow: none; border-radius: 0; opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .25s; }\n.nf-card.poster .im .info { left: 10px; right: 10px; bottom: 10px; }\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im .info { opacity: 1; transform: none; transition-delay: .08s; } }\n.nf-card .im .info .t { text-shadow: 0 1px 8px rgba(0,0,0,.8); }\n:is(#cx, #cx-ui) .ic-s svg path, :is(#cx, #cx-ui) .nf-card .acts svg path { stroke-width: .3; }\n\n/* Discover (Seerr) cards: same look as library cards, plus an ownership mark */\n.dmark { position: absolute; top: 10px; left: 10px; z-index: 4; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px 4px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .01em; color: #e8e8ec; background: rgba(17,17,19,.72); backdrop-filter: blur(10px); border: 1px dashed rgba(255,255,255,.4); }\n.dmark svg { width: 12px !important; height: 12px !important; }\n.dmark.own { border-style: solid; border-color: rgba(94,224,138,.5); color: #7cf0a3; }\n.dmark.req { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\n.nf-card.notown .im { box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.12); }\n.nf-card.notown .im .bgi { filter: saturate(.85) brightness(.92); }\n.nf-card.notown:hover .im .bgi { filter: none; }\n/* menus now live in #cx-ui */\n.sp-menu button { background: none; color: #eee; font-size: 14px; }\n\n/* =====================================================================\r\n   PLUGIN PAGE SKIN (Jellyfin Enhanced, Seerr, Kefin) - scoped to html.cx-pskin\r\n   Toggle: avatar menu > Plugin page styling, or cinemaUI.skin(false) in the console.\r\n   ===================================================================== */\r\nhtml.cx-pskin { --pk-surface: #17171a; --pk-surface-2: #1f1f24; --pk-line: rgba(255,255,255,.07); --pk-accent: #fff; --pk-accent-text: #000; }\r\n\r\n/* ---------- calendar ---------- */\r\nhtml.cx-pskin .je-calendar-page { padding-top: 4px; }\r\nhtml.cx-pskin .je-calendar-day { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 16px !important; box-shadow: none; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-day:hover { background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today { border-color: rgba(255,255,255,.4) !important; background: #1d1d22 !important; }\r\nhtml.cx-pskin .je-calendar-day-number, html.cx-pskin .je-calendar-day-name, html.cx-pskin .je-calendar-weekday, html.cx-pskin .je-calendar-month-day-name { font-weight: 600; color: #d8d8dc !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-number, html.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-name { color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-card, html.cx-pskin .je-calendar-event { border-radius: 12px !important; overflow: hidden; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-card-image, html.cx-pskin .je-calendar-card-image-wrap { border-radius: 12px !important; }\r\nhtml.cx-pskin .je-calendar-play-btn, html.cx-pskin .je-calendar-play-btn-card { border-radius: 50% !important; background: #fff !important; color: #000 !important; }\r\nhtml.cx-pskin .je-calendar-view-btn, html.cx-pskin .je-calendar-mode-btn, html.cx-pskin .je-calendar-nav-btn, html.cx-pskin .je-calendar-nav-today, html.cx-pskin .je-calendar-filter-btn, html.cx-pskin .je-calendar-filter-toggle, html.cx-pskin .je-calendar-group-toggle {\r\n  border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-view-btn:hover, html.cx-pskin .je-calendar-mode-btn:hover, html.cx-pskin .je-calendar-nav-btn:hover, html.cx-pskin .je-calendar-nav-today:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-calendar-view-btn.active, html.cx-pskin .je-calendar-mode-btn.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-nav-btn { width: 38px; height: 38px; padding: 0 !important; }\r\nhtml.cx-pskin .je-calendar-legend-item { border-radius: 999px !important; background: rgba(255,255,255,.06) !important; border: 1px solid transparent !important; padding: 7px 14px !important; }\r\nhtml.cx-pskin .je-calendar-legend-item.active { border-color: rgba(255,255,255,.5) !important; background: rgba(255,255,255,.12) !important; }\r\nhtml.cx-pskin .je-calendar-sidebar, html.cx-pskin .je-calendar-sidebar-content { background: var(--pk-surface) !important; border-radius: 20px !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .je-calendar-agenda-row, html.cx-pskin .je-calendar-agenda-event { border-radius: 14px !important; }\r\nhtml.cx-pskin .je-calendar-agenda-event { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- requests / downloads / issues ---------- */\r\nhtml.cx-pskin .je-request-card, html.cx-pskin .je-download-card, html.cx-pskin .je-issue-card { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 22px !important; box-shadow: none !important; transition: transform .25s, background .25s; }\r\nhtml.cx-pskin .je-request-card:hover, html.cx-pskin .je-download-card:hover { background: var(--pk-surface-2) !important; transform: translateY(-2px); }\r\nhtml.cx-pskin .je-request-poster, html.cx-pskin .je-download-poster { border-radius: 14px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-request-title, html.cx-pskin .je-download-title { font-weight: 700; letter-spacing: -.01em; }\r\nhtml.cx-pskin .je-requests-tab, html.cx-pskin .je-issues-tab, html.cx-pskin .je-downloads-tab { border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600 !important; padding: 8px 18px !important; transition: background .2s; }\r\nhtml.cx-pskin .je-requests-tab:hover, html.cx-pskin .je-issues-tab:hover, html.cx-pskin .je-downloads-tab:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-requests-tab.active, html.cx-pskin .je-issues-tab.active, html.cx-pskin .je-downloads-tab.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-request-watch-btn, html.cx-pskin .je-refresh-btn { background: #fff !important; color: #000 !important; border-radius: 50% !important; box-shadow: none !important; }\r\nhtml.cx-pskin .je-request-approve-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-decline-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-external-link, html.cx-pskin .je-issue-view-btn { border-radius: 50% !important; }\r\nhtml.cx-pskin .je-requests-status-chip, html.cx-pskin .je-status-chip, html.cx-pskin .je-issue-status-chip, html.cx-pskin .je-issue-type-chip, html.cx-pskin .je-download-badge, html.cx-pskin .je-arr-badge, html.cx-pskin .je-release-date-chip { border-radius: 999px !important; font-weight: 600; letter-spacing: .02em; }\r\nhtml.cx-pskin .je-download-progress-container, html.cx-pskin .je-download-progress { border-radius: 999px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-download-progress-bar { border-radius: 999px !important; background: #fff !important; }\r\nhtml.cx-pskin .je-downloads-search-input { border-radius: 999px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-pagination button, html.cx-pskin .je-pagination a { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-empty-state { color: #8c8c94; }\r\nhtml.cx-pskin .je-downloads-section .je-section-icon { color: #fff; }\r\n\r\n/* ---------- discover (Seerr) ---------- */\r\nhtml.cx-pskin .je-recommendations-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .jellyseerr-card { border-radius: 20px !important; overflow: hidden; background: var(--pk-surface) !important; border: 1px solid var(--pk-line); transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s; }\r\nhtml.cx-pskin .jellyseerr-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.5); }\r\nhtml.cx-pskin .jellyseerr-poster-image, html.cx-pskin .je-tile-image, html.cx-pskin .je-genre-tile-image, html.cx-pskin .je-genre-tile-backdrop { border-radius: 18px !important; }\r\nhtml.cx-pskin .jellyseerr-media-badge, html.cx-pskin .jellyseerr-status-badge, html.cx-pskin .jellyseerr-collection-badge { border-radius: 999px !important; backdrop-filter: blur(8px); font-weight: 700; }\r\nhtml.cx-pskin .jellyseerr-request-button, html.cx-pskin .jellyseerr-split-main { border-radius: 999px !important; font-weight: 600; }\r\nhtml.cx-pskin .jellyseerr-split-arrow { border-radius: 0 999px 999px 0 !important; }\r\nhtml.cx-pskin .jellyseerr-hover-popover, html.cx-pskin .jellyseerr-4k-popup, html.cx-pskin .je-4k-popup { border-radius: 16px !important; background: rgba(28,28,32,.97) !important; backdrop-filter: blur(16px); }\r\nhtml.cx-pskin .je-scroll-btn { border-radius: 50% !important; background: rgba(30,30,34,.85) !important; backdrop-filter: blur(8px); border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-genre-tile-title { font-weight: 800; }\r\n\r\n/* ---------- modals ---------- */\r\nhtml.cx-pskin .je-more-info-modal { border-radius: 26px !important; background: #17171a !important; border: 1px solid var(--pk-line); box-shadow: 0 30px 80px rgba(0,0,0,.7) !important; overflow: hidden; }\r\nhtml.cx-pskin .je-collection-card { border-radius: 18px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-more-info-stats-panel, html.cx-pskin .je-more-info-right-panel { border-radius: 18px !important; background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-modal-play-button, html.cx-pskin .je-more-info-button-group button { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-launcher-panel, html.cx-pskin #je-header-launcher-panel { border-radius: 22px !important; background: rgba(28,28,32,.97) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- Kefin watchlist / custom pages ---------- */\r\nhtml.cx-pskin .kefin-custom-page-active .sectionTitle, html.cx-pskin [class*=\"watchlist\"] h1, html.cx-pskin [class*=\"watchlist\"] h2 { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin [class*=\"watchlist\"] button, html.cx-pskin [class*=\"kefin\"] button.emby-button { border-radius: 999px; }\r\nhtml.cx-pskin [class*=\"watchlist\"] .card, html.cx-pskin [class*=\"watchlist\"] .cardBox { border-radius: 16px !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] input, html.cx-pskin [class*=\"kefin\"] select { border-radius: 12px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] .card:hover .cardBox, html.cx-pskin [class*=\"watchlist\"] .card:hover .cardBox { transform: translateY(-4px); transition: transform .25s; }\r\nhtml.cx-frame { --je-sticky-top: 72px; }\n\n/* ===== v3: peek popover replaces card hover ===== */\n.nf-card .info, .nf-card .im::before, .nf-card .im::after { display: none !important; }\n.nf-card .im { transform: none !important; transition: box-shadow .3s, filter .3s; will-change: auto; }\n.nf-card .im .bgi { transition: transform .8s cubic-bezier(.2,.7,.2,1); }\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im { box-shadow: 0 0 0 2px rgba(255,255,255,.55); } .nf-card:hover .im .bgi { transform: scale(1.04); } }\n.nf-peek { position: fixed; z-index: 9060; border-radius: 20px; overflow: hidden; background: #1c1c20; box-shadow: 0 30px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.09); opacity: 0; transform: scale(.94) translateY(8px); transition: opacity .2s, transform .28s cubic-bezier(.2,.8,.2,1); pointer-events: none; font-family: \"Inter\", system-ui, sans-serif; color: #fff; }\n.nf-peek.show { opacity: 1; transform: none; pointer-events: auto; }\n.nf-peek .pi { position: relative; aspect-ratio: 16/9; background: #2a2a2f; cursor: pointer; overflow: hidden; }\n.nf-peek .pi .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; }\n.nf-peek .pi::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #1c1c20 4%, rgba(28,28,32,0) 60%); }\n.nf-peek .pt { position: absolute; z-index: 2; left: 16px; right: 16px; bottom: 10px; font-weight: 800; font-size: 19px; letter-spacing: -.01em; text-shadow: 0 2px 12px rgba(0,0,0,.7); }\n.nf-peek .pb { padding: 6px 16px 16px; }\n.nf-peek .pa { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }\n.nf-peek .pa button { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.12); display: grid; place-items: center; transition: background .2s, transform .15s; }\n.nf-peek .pa button:hover { background: rgba(255,255,255,.24); transform: scale(1.08); }\n.nf-peek .pa button.pl { background: #fff; color: #000; }\n.nf-peek .pa .sp { flex: 1; }\n.nf-peek .pa svg { width: 20px; height: 20px; }\n.nf-peek .pm { font-size: 12.5px; color: #cfcfd5; display: flex; gap: 6px 10px; flex-wrap: wrap; align-items: center; }\n.nf-peek .pm .g { color: #5ee08a; font-weight: 700; }\n.nf-peek .pm .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 6px; border-radius: 5px; line-height: 18px; }\n.nf-peek .pm span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\n.nf-peek .po { font-size: 13px; color: #b6b6bd; margin-top: 10px; line-height: 1.45; }\n#cx-cover { position: fixed; inset: 0; z-index: 9700; background: #0d0d0f; display: none; place-items: center; }\n#cx-cover.show { display: grid; }\nhtml.cx-on:not(.transparentDocument) #reactRoot { visibility: hidden; }\n\n/* settings page + requests */\n.rot180 { display: inline-flex; transform: rotate(180deg); }\n.set-card { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 22px 24px; margin-bottom: 20px; }\n.set-card h3 { margin: 0 0 14px; font-size: 18px; letter-spacing: -.01em; }\n.set-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.set-row:first-of-type { border-top: 0; }\n.set-row b { display: block; font-weight: 600; font-size: 15px; } .set-row span { display: block; color: #8d8d95; font-size: 13px; margin-top: 3px; }\n.set-switch { position: relative; width: 46px; height: 26px; border-radius: 999px; background: #3a3a40; flex: none; transition: background .2s; }\n.set-switch i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; }\n.set-switch.on { background: #34c759; } .set-switch.on i { transform: translateX(20px); }\n.set-row input[type=color] { width: 44px; height: 32px; border: 0; background: none; padding: 0; cursor: pointer; border-radius: 8px; }\n.set-hint { color: #8d8d95; font-size: 13.5px; margin: 0 0 14px; }\n.set-list { display: flex; flex-direction: column; gap: 8px; }\n.set-sec { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px 10px 16px; background: #1f1f24; border-radius: 14px; }\n.set-sec.off b { opacity: .45; } .set-sec b { font-weight: 600; font-size: 14.5px; }\n.set-sec-a { display: flex; align-items: center; gap: 6px; }\n.set-sec-a button:not(.set-switch) { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.07); }\n.set-sec-a button:not(.set-switch):hover { background: rgba(255,255,255,.16); }\n.set-sec-a svg { width: 18px; height: 18px; }\n.set-add { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; align-items: center; }\n.set-add select { height: 40px; padding: 0 14px; border-radius: 12px; background: #1f1f24; color: #fff; border: 1px solid rgba(255,255,255,.1); font: inherit; max-width: 260px; }\n.req-grid .nf-card { width: auto; }\n.req-acts { display: flex; gap: 8px; margin-top: 8px; } .req-acts .btn { height: 34px; padding: 0 14px; font-size: 13px; }\n.dmark.wait { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\n.dmark.dl { border-style: solid; border-color: rgba(120,180,255,.55); color: #9ccaff; }\n.dmark.bad { border-style: solid; border-color: rgba(255,120,120,.55); color: #ff9b9b; }\n.nf-card.req .im .prog { left: 10px; right: 10px; bottom: 10px; }\n.nf-person { color: inherit; text-decoration: none; }\n.nf-person:hover .pi { outline: 2px solid rgba(255,255,255,.6); }\n.nf-logo { color: var(--accent-nf, #e50914) !important; }\n.nf-card .prog i, .nf-resume-bar i { background: var(--accent-nf, #fff); }\n\n/* Seerr modal, downloads, calendar, Aurral tiles */\n.sr-modal { width: min(720px, 100%); max-height: 92vh; overflow-y: auto; background: #17171a; border-radius: 26px; box-shadow: 0 30px 90px rgba(0,0,0,.7); border: 1px solid rgba(255,255,255,.08); color: #fff; font-family: \"Inter\", system-ui, sans-serif; }\n.sr-hero { position: relative; height: 240px; background: #222 center/cover; } .sr-hero::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #17171a, rgba(23,23,26,0) 70%); }\n.sr-close { position: absolute; z-index: 2; top: 14px; right: 14px; width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,.55); display: grid; place-items: center; }\n.sr-body { padding: 0 28px 28px; margin-top: -48px; position: relative; z-index: 1; }\n.sr-body h2 { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; }\n.sr-ov { color: #cfcfd5; line-height: 1.6; font-size: 15px; margin: 14px 0; }\n.sr-status { margin: 6px 0; }\n.sr-seasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }\n.sr-seasons .nf-chip.dis { opacity: .45; cursor: default; }\n.sr-cast { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; } .sr-cast span { font-size: 12.5px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.07); color: #cfcfd5; }\n.btn:disabled { opacity: .6; cursor: default; }\n.dl-box { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 20px 22px; margin: 0 0 26px; }\n.dl-box h2 { margin: 0 0 12px; font-size: 18px; }\n.dl-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, 320px); gap: 20px; align-items: center; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.dl-t { display: flex; flex-direction: column; min-width: 0; } .dl-t span { font-size: 12.5px; color: #8d8d95; margin-top: 2px; }\n.dl-p { display: flex; align-items: center; gap: 12px; } .dl-p .prog { position: static; flex: 1; height: 6px; border-radius: 6px; background: rgba(255,255,255,.14); overflow: hidden; } .dl-p .prog i { display: block; height: 100%; background: #fff; border-radius: 6px; } .dl-p b { font-size: 13px; width: 40px; text-align: right; }\n.cal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; } .cal-head b { font-size: 20px; min-width: 190px; text-align: center; text-transform: capitalize; }\n.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }\n.cal-dow { text-align: center; color: #8d8d95; font-size: 13px; font-weight: 600; padding: 4px 0; }\n.cal-day { min-height: 130px; background: #17171a; border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }\n.cal-day.other { opacity: .4; } .cal-day.today { border-color: rgba(255,255,255,.45); background: #1d1d22; }\n.cal-day .n { font-size: 13px; font-weight: 700; color: #cfcfd5; }\n.cal-ev { display: flex; align-items: center; gap: 6px; padding: 4px; border-radius: 10px; background: rgba(255,255,255,.06); cursor: pointer; min-width: 0; font-size: 12px; position: relative; }\n.cal-ev:hover { background: rgba(255,255,255,.14); }\n.cal-ev .p { width: 26px; height: 38px; border-radius: 5px; background: #333 center/cover; flex: none; }\n.cal-ev > span { font-weight: 600; flex: 1; min-width: 0; } .cal-ev small { position: absolute; left: 36px; bottom: 3px; color: #8d8d95; font-size: 10.5px; max-width: calc(100% - 40px); }\n.cal-ev.have { box-shadow: inset 3px 0 0 #34c759; } .cal-ev.digital { box-shadow: inset 3px 0 0 #bf5af2; } .cal-ev.physical { box-shadow: inset 3px 0 0 #ff9f0a; } .cal-ev.cinema { box-shadow: inset 3px 0 0 #0a84ff; } .cal-ev.episode { box-shadow: inset 3px 0 0 #64d2ff; }\n.cal-ev > span { padding-bottom: 12px; }\n@media (max-width: 800px) { .cal-grid { grid-template-columns: 1fr; } .cal-dow { display: none; } .cal-day.other { display: none; } .cal-day { min-height: 0; } .dl-row { grid-template-columns: 1fr; gap: 6px; } }\n.sp-tile .pbtn.busy { opacity: .5; pointer-events: none; }\n.sp-shelf { grid-auto-columns: minmax(170px, 220px); }\n@media (max-width: 800px) { .sp-shelf { grid-auto-columns: 40vw; } }\n\n/* ===== video player ===== */\n#cx-player { position: fixed; inset: 0; z-index: 9800; background: #000; color: #fff; font-family: \"Inter\", system-ui, sans-serif; overflow: hidden; user-select: none; }\n#cx-player video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }\n#cx-player video::cue { background: rgba(0,0,0,.65); color: #fff; font-size: 1.35em; border-radius: 4px; }\n#cx-player.idle { cursor: none; }\n.pl-top, .pl-bar { position: absolute; left: 0; right: 0; z-index: 3; transition: opacity .35s, transform .35s; }\n.pl-top { top: 0; display: flex; align-items: center; gap: 16px; padding: 22px 28px 60px; background: linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,0)); }\n.pl-bar { bottom: 0; padding: 70px 28px 22px; background: linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,0)); }\n#cx-player.idle .pl-top { opacity: 0; transform: translateY(-10px); pointer-events: none; }\n#cx-player.idle .pl-bar { opacity: 0; transform: translateY(10px); pointer-events: none; }\n.pl-back { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); display: grid; place-items: center; transition: background .2s, transform .15s; }\n.pl-back:hover { background: rgba(255,255,255,.24); transform: scale(1.06); }\n.pl-title { font-size: 20px; font-weight: 700; letter-spacing: -.01em; } .pl-sub { font-size: 14px; color: #cfcfd5; margin-top: 2px; }\n.pl-seek { position: relative; height: 18px; display: flex; align-items: center; cursor: pointer; margin-bottom: 8px; touch-action: none; }\n.pl-seek::before { content: \"\"; position: absolute; left: 0; right: 0; height: 5px; border-radius: 5px; background: rgba(255,255,255,.22); transition: height .15s; }\n.pl-seek:hover::before { height: 7px; }\n.pl-seek em { position: absolute; left: 0; height: 5px; border-radius: 5px; background: rgba(255,255,255,.28); pointer-events: none; }\n.pl-seek i { position: absolute; left: 0; height: 5px; border-radius: 5px; background: var(--accent-nf, #e50914); pointer-events: none; }\n.pl-seek:hover i, .pl-seek:hover em { height: 7px; }\n.pl-seek b { position: absolute; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; background: #fff; opacity: 0; transform: scale(.6); transition: .15s; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,.5); }\n.pl-seek:hover b { opacity: 1; transform: none; }\n.pl-bubble { position: absolute; bottom: 24px; transform: translateX(-50%); background: rgba(20,20,22,.92); padding: 4px 9px; border-radius: 8px; font-size: 12px; font-variant-numeric: tabular-nums; opacity: 0; pointer-events: none; transition: opacity .15s; }\n.pl-seek:hover .pl-bubble { opacity: 1; }\n.pl-row { display: flex; align-items: center; gap: 6px; }\n.pl-row button { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; transition: background .2s, transform .15s; position: relative; }\n.pl-row button:hover { background: rgba(255,255,255,.16); }\n.pl-row button:active { transform: scale(.92); }\n.pl-row .pl-pp { width: 52px; height: 52px; background: #fff; color: #000; } .pl-row .pl-pp:hover { background: #e8e8ea; }\n.pl-row svg { width: 26px; height: 26px; }\n.pl-skip small { position: absolute; font-size: 9px; font-weight: 800; margin-top: 2px; }\n.rot-l { display: inline-flex; transform: scaleX(-1); }\n.pl-time { font-size: 13px; font-variant-numeric: tabular-nums; color: #dadade; margin-left: 10px; }\n.pl-vol { display: flex; align-items: center; gap: 2px; margin-left: 4px; }\n.pl-vbar { position: relative; width: 0; opacity: 0; height: 18px; display: flex; align-items: center; cursor: pointer; transition: width .2s, opacity .2s; overflow: hidden; }\n.pl-vol:hover .pl-vbar { width: 84px; opacity: 1; margin-right: 8px; }\n.pl-vbar::before { content: \"\"; position: absolute; left: 0; right: 0; height: 4px; border-radius: 4px; background: rgba(255,255,255,.25); } .pl-vbar i { position: absolute; left: 0; height: 4px; border-radius: 4px; background: #fff; }\n.pl-btn-wrap { position: relative; }\n.pl-menu { position: absolute; right: 0; bottom: 56px; min-width: 200px; max-height: 50vh; overflow-y: auto; background: rgba(28,28,32,.96); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 8px; opacity: 0; transform: translateY(8px) scale(.97); pointer-events: none; transition: opacity .2s, transform .2s; }\n.pl-menu.open { opacity: 1; transform: none; pointer-events: auto; }\n.pl-menu .pl-mh { padding: 8px 12px; font-size: 12px; color: #8d8d95; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }\n.pl-row .pl-menu button { width: 100%; height: auto; border-radius: 10px; padding: 10px 12px; justify-content: flex-start; display: flex; text-align: left; font-size: 14px; }\n.pl-row .pl-menu button.on { background: rgba(255,255,255,.12); } .pl-row .pl-menu button.on::after { content: \"✓\"; margin-left: auto; }\n.pl-center { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; flex-direction: column; gap: 16px; z-index: 2; pointer-events: none; }\n#cx-player.loading .pl-center { display: flex; }\n.pl-spin { width: 54px; height: 54px; border: 4px solid rgba(255,255,255,.18); border-top-color: #fff; border-radius: 50%; animation: cxspin .8s linear infinite; }\n.pl-status { font-size: 14px; color: #cfcfd5; min-height: 20px; }\n.pl-err { position: absolute; inset: 0; z-index: 4; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: rgba(0,0,0,.82); text-align: center; padding: 24px; }\n#cx-player.err .pl-err { display: flex; } #cx-player.err .pl-center { display: none; }\n.pl-err b { font-size: 22px; } .pl-errmsg { color: #b9b9c0; max-width: 520px; margin: 0 0 12px; }\n.pl-next { position: absolute; right: 28px; bottom: 120px; z-index: 3; display: none; }\n#cx-player.has-next.idle .pl-next { display: none; }\n@media (max-width: 800px) { .pl-top { padding: 14px 14px 40px; } .pl-bar { padding: 50px 14px 14px; } .pl-vol, .pl-time { display: none; } .pl-row button { width: 40px; height: 40px; } .pl-row .pl-pp { width: 48px; height: 48px; } }\n\n/* ===== v7 polish ===== */\n.nf-nav { gap: 14px; }\n.nf-links { gap: 2px; align-items: center; }\n.nf-links .nf-more { margin-left: 2px; }\n.nf-links .nf-pillbtn { padding: 9px 12px; }\n:is(#cx, #cx-ui) input[type=\"text\"], :is(#cx, #cx-ui) input[type=\"search\"] { -webkit-appearance: none; appearance: none; outline: 0 !important; box-shadow: none !important; border: 0 !important; background: transparent !important; border-radius: 0 !important; height: auto !important; padding-block: 0 !important; color: #fff; }\n.nf-search { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); }\n.nf-search.open { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3); }\n.nf-search:not(.open) { background: transparent; border-color: transparent; }\n.sp-hsearch input { height: 100% !important; }\n\n/* peek: smoother + poster variant */\n.nf-peek { transform-origin: center center; will-change: transform, opacity; transition: opacity .22s ease, transform .32s cubic-bezier(.16,1,.3,1); transform: translateY(10px) scale(.9); }\n.nf-peek.show { transform: none; }\n.nf-peek.show .pb { animation: cxfade .32s .06s both; }\n.nf-peek.poster .pi { aspect-ratio: 3/4; }\n.nf-peek.poster .pt { font-size: 17px; }\n.nf-peek.poster .po { display: none; }\n\n/* detail pages: full width */\n.nf-dbody { max-width: none; }\n.nf-dinfo { max-width: min(860px, 100%); }\n.nf-person { width: 132px; font-size: 13.5px; }\n.nf-person .pi { width: 132px; height: 132px; transition: transform .25s, outline-color .2s; outline: 2px solid transparent; }\n.nf-person:hover .pi { transform: scale(1.05); outline-color: rgba(255,255,255,.55); }\n.nf-cast { gap: 22px; }\n.nf-sect { margin-right: 0; }\n\n/* media info panel */\n.mi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }\n.mi-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); border-radius: 18px; padding: 16px 18px; }\n.mi-card h4 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #8d8d95; font-weight: 600; }\n.mi-card div { font-size: 14px; color: #e4e4e8; line-height: 1.6; } .mi-card span { color: #8d8d95; }\n.mi-pills { display: flex; flex-wrap: wrap; gap: 6px; } .mi-pills i { font-style: normal; font-size: 12.5px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.08); }\n.rt-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 4px 0 14px; }\n.rt-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.08); font-size: 13px; font-weight: 600; }\n.rt-chip small { color: #9a9aa2; font-weight: 500; }\n\n/* menus: nicer hover */\n.sp-menu { background: rgba(30,30,34,.97) !important; backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.08); border-radius: 18px !important; padding: 8px !important; box-shadow: 0 24px 60px rgba(0,0,0,.6) !important; animation: cxpop .16s cubic-bezier(.16,1,.3,1) both; transform-origin: top left; min-width: 240px; }\n@keyframes cxpop { from { opacity: 0; transform: scale(.96) translateY(-4px); } to { opacity: 1; transform: none; } }\n.sp-menu button { border-radius: 12px !important; padding: 10px 12px !important; gap: 12px !important; font-size: 14px; color: #e8e8ec; transition: background .15s, transform .12s; position: relative; }\n.sp-menu button svg { opacity: .65; transition: opacity .15s, transform .15s; }\n.sp-menu button:hover { background: rgba(255,255,255,.1) !important; }\n.sp-menu button:hover svg { opacity: 1; transform: scale(1.1); }\n.sp-menu button:active { transform: scale(.98); }\n.sp-menu hr { margin: 6px 6px !important; border-top-color: rgba(255,255,255,.08) !important; }\n.nf-pop { animation: cxpop .16s cubic-bezier(.16,1,.3,1) both; }\n.nf-pop a, .nf-pop button { transition: background .15s; }\n.nf-pop .pop-sep { height: 1px; background: rgba(255,255,255,.08); margin: 6px 8px; }\n.nf-pop .pop-h { padding: 8px 14px 4px; font-size: 11.5px; color: #8d8d95; text-transform: uppercase; letter-spacing: .08em; }\n.nf-pop .mi { font-family: \"Material Icons\", \"Material Symbols Rounded\"; font-size: 18px; width: 18px; opacity: .8; }\n\n/* filters bar (discover) */\n.dc-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 0 var(--pad) 18px; }\n.dc-bar select, .dc-bar input[type=text] { height: 40px; padding: 0 14px; border-radius: 999px; background: rgba(255,255,255,.08); color: #fff; font: inherit; border: 1px solid transparent; }\n.dc-bar select:focus, .dc-bar input[type=text]:focus { border-color: rgba(255,255,255,.4); }\n.dc-bar input[type=text] { min-width: 220px; padding-left: 16px !important; background: rgba(255,255,255,.08) !important; border-radius: 999px !important; }\n.dc-bar .nf-chip.on { background: #fff; color: #000; }\n.dc-bar label { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #cfcfd5; cursor: pointer; }\n.dc-end { text-align: center; color: #8d8d95; padding: 30px; }\n.dc-more { margin: 10px var(--pad) 0; }\n\n/* ===== v8: external tracks, harvest, cta ===== */\n.sp-row .xb { display: inline-block; margin-left: 8px; padding: 1px 8px; border-radius: 999px; border: 1px dashed rgba(255,255,255,.4); font-size: 10.5px; font-weight: 600; color: #cfcfd5; vertical-align: middle; letter-spacing: .01em; }\n.sp-row .du .lk.rq { opacity: 1; color: #fff; background: rgba(255,255,255,.1); border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center; }\n.sp-row .du .lk.rq:hover { background: rgba(255,255,255,.22); }\n.sp-row .du .lk.rq svg { width: 16px; height: 16px; }\n.notown-tile .cv { filter: saturate(.8) brightness(.92); }\n.sp-disc-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 28px 0 0; padding: 18px 22px; border-radius: 18px; background: linear-gradient(120deg, rgba(30,215,96,.18), rgba(255,255,255,.04)); }\n.sp-disc-cta b { display: block; font-size: 17px; } .sp-disc-cta span { color: #b3b3b3; font-size: 14px; }\nhtml.cx-harvest .MuiPopover-root, html.cx-harvest .MuiMenu-root, html.cx-harvest .MuiBackdrop-root { opacity: 0 !important; pointer-events: none !important; transition: none !important; }\n.plug-slot:empty { display: none; }\n.rt-chip small { margin-left: 4px; }\n.sp-row.ext .tn { color: #c9c9ce; } .sp-row .ta .xb { margin-left: 8px; }\n.nf-pop { min-width: 260px; } .nf-pop a, .nf-pop button { white-space: nowrap; }\n\n/* ===== v9: fixes ===== */\n.nf-card { min-width: 0; }\nselect option { background: #1c1c20; color: #fff; }\n.dc-bar select { color-scheme: dark; appearance: none; -webkit-appearance: none; padding-right: 34px; background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>\"); background-repeat: no-repeat; background-position: right 14px center; }\n\n/* native dialogs (metadata editor etc.): never show the old page behind them */\nhtml.cx-nativecmd #reactRoot > *:not(.MuiDialog-root):not(.MuiPopover-root), html.cx-nativecmd .skinBody, html.cx-nativecmd .page { visibility: hidden !important; }\nhtml.cx-nativecmd .dialogContainer, html.cx-nativecmd dialog, html.cx-nativecmd .MuiDialog-root, html.cx-nativecmd .MuiPopover-root { visibility: visible !important; }\nhtml.cx-nativecmd body { background: #0d0d0f !important; }\n\n/* preferences menu rows: single clean surface */\nhtml.cx-ready .listItem-border .listItem, html.cx-ready .listItem-border .listItem:hover { background: transparent !important; border-radius: inherit !important; }\nhtml.cx-ready a.listItem-border { transition: background .2s, transform .2s, box-shadow .2s; }\nhtml.cx-ready a.listItem-border:hover { background: #26262c !important; transform: translateX(4px); box-shadow: 0 6px 20px rgba(0,0,0,.35); }\nhtml.cx-ready a.listItem-border:active { transform: translateX(2px) scale(.995); }\nhtml.cx-ready .listItem-border:hover .listItemIcon { background: rgba(255,255,255,.18) !important; transform: scale(1.06); }\nhtml.cx-ready .listItem-border .listItemIcon { transition: background .2s, transform .2s; }\n\n/* mobile */\n.m-only { display: none !important; }\n@media (max-width: 800px) {\n  .m-only { display: flex !important; }\n  #cx-nf, .sp-scroll, .sp-liblist { scrollbar-width: none; -ms-overflow-style: none; }\n  #cx-nf::-webkit-scrollbar, .sp-scroll::-webkit-scrollbar, .sp-liblist::-webkit-scrollbar { display: none; width: 0; height: 0; }\n  .nf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n  .sp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .nf-grid .nf-card, .nf-grid .nf-card.poster { width: 100%; }\n  .req-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .nf-grid .nf-card .title { font-size: 11.5px; }\n  .nf-hero { margin-left: 12px; margin-right: 12px; }\n  .nf-card.poster { width: 30vw; } .nf-card { width: 52vw; }\n  .cx-tabs { left: 14px; right: 14px; height: 58px; }\n  .nf-pop { max-height: 70vh; overflow-y: auto; }\n}\n\n/* ===== player v2 ===== */\n#cx-player svg { width: 24px; height: 24px; fill: currentColor; }\n#cx-player svg path { stroke: none; }\n#cx-player svg text { stroke: none; }\n.pl-ttl { min-width: 0; flex: 1; }\n.pl-round { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); display: grid; place-items: center; }\n.pl-round:hover { background: rgba(255,255,255,.24); }\n.pl-back svg { width: 26px; height: 26px; }\n.pl-top, .pl-bar { transition: opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1); }\n.pl-bar { padding: 90px 32px 22px; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 45%, rgba(0,0,0,0) 100%); }\n.pl-row { gap: 4px; }\n.pl-row > button, .pl-btn-wrap > button { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; transition: background .18s, transform .15s; }\n.pl-row > button:hover, .pl-btn-wrap > button:hover { background: rgba(255,255,255,.16); }\n.pl-row .pl-pp { width: 54px; height: 54px; background: #fff; color: #000; margin-right: 4px; }\n.pl-row .pl-pp svg { width: 28px; height: 28px; }\n.pl-skip svg { width: 30px; height: 30px; }\n.pl-row svg { width: 26px; height: 26px; }\n.pl-btn-next, .pl-btn-eps.hide, .pl-btn-chap.hide { display: none; }\n#cx-player.has-next .pl-btn-next { display: block; }\n[data-tip] { position: relative; }\n[data-tip]::before { content: attr(data-tip); position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translate(-50%, 4px); background: rgba(20,20,22,.95); color: #fff; font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 8px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 10; }\n.pl-bar [data-tip]:hover::before { opacity: 1; transform: translate(-50%, 0); }\n.pl-top [data-tip]::before { bottom: auto; top: calc(100% + 8px); }\n.pl-top [data-tip]:hover::before { opacity: 1; }\n.pl-chapters i { position: absolute; top: 50%; width: 3px; height: 5px; margin-top: -2.5px; margin-left: -1.5px; background: rgba(0,0,0,.75); pointer-events: none; z-index: 1; }\n.pl-seek i, .pl-seek em, .pl-seek::before { height: 5px; }\n.pl-seek:hover i, .pl-seek:hover em, .pl-seek:hover::before { height: 8px; }\n.pl-bubble { bottom: 26px; display: flex; flex-direction: column; align-items: center; gap: 6px; background: transparent; padding: 0; }\n.pl-bubble span { background: rgba(20,20,22,.95); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.pl-thumb { display: none; border-radius: 10px; border: 2px solid rgba(255,255,255,.9); background-color: #111; box-shadow: 0 8px 24px rgba(0,0,0,.6); }\n.pl-menu { bottom: 62px; border-radius: 18px; min-width: 230px; max-width: 340px; }\n.pl-menu button { display: flex !important; align-items: center; gap: 10px; width: 100%; padding: 10px 12px !important; height: auto !important; border-radius: 10px !important; text-align: left; font-size: 14px; justify-content: space-between !important; }\n.pl-menu button img { width: 72px; height: 40px; object-fit: cover; border-radius: 6px; }\n.pl-menu button span { flex: 1; min-width: 0; } .pl-menu button small { color: #9a9aa2; font-size: 11.5px; }\n.pl-menu button.on { background: rgba(255,255,255,.12); } .pl-menu button.on::after { content: \"✓\"; font-size: 13px; }\n.pl-sep { height: 1px; background: rgba(255,255,255,.1); margin: 6px 4px; }\n\n/* subtitles: own renderer, below the picture centre, never glued to the edge */\n.pl-subs { position: absolute; left: 6%; right: 6%; bottom: var(--sub-pos, 9%); z-index: 2; text-align: center; pointer-events: none; transition: bottom .35s cubic-bezier(.16,1,.3,1); font-size: var(--sub-size, 1.9vw); font-weight: var(--sub-weight, 500); color: var(--sub-color, #fff); line-height: 1.32; display: flex; flex-direction: column; align-items: center; gap: 4px; }\n#cx-player:not(.idle) .pl-subs { bottom: calc(var(--sub-pos, 9%) + 86px); }\n.pl-subline { display: inline-block; max-width: 100%; padding: 2px 10px; border-radius: 8px; letter-spacing: .005em; }\n#cx-player[data-subbg=\"shadow\"] .pl-subline { text-shadow: 0 0 3px #000, 0 1px 3px #000, 0 2px 8px rgba(0,0,0,.9); }\n#cx-player[data-subbg=\"box\"] .pl-subline { background: rgba(0,0,0,.62); }\n#cx-player[data-subbg=\"none\"] .pl-subline { text-shadow: 0 1px 2px #000; }\n#cx-player[data-subfont=\"serif\"] .pl-subs { font-family: Georgia, \"Times New Roman\", serif; } #cx-player[data-subfont=\"mono\"] .pl-subs { font-family: ui-monospace, Consolas, monospace; } #cx-player[data-subfont=\"sans\"] .pl-subs { font-family: \"Inter\", system-ui, sans-serif; }\n.pl-subline i { font-style: italic; } .pl-subline b { font-weight: 800; }\n\n/* settings panel */\n.pl-settings { position: absolute; right: 24px; bottom: 96px; width: min(400px, calc(100% - 32px)); max-height: 70vh; overflow-y: auto; z-index: 6; background: rgba(24,24,28,.96); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.09); border-radius: 22px; padding: 14px; box-shadow: 0 24px 70px rgba(0,0,0,.65); opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none; transition: opacity .2s, transform .28s cubic-bezier(.16,1,.3,1); }\n.pl-settings.open { opacity: 1; transform: none; pointer-events: auto; }\n.pl-stabs { display: flex; gap: 4px; margin-bottom: 10px; align-items: center; }\n.pl-stabs button { padding: 8px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #b9b9c0; } .pl-stabs button.on { background: #fff; color: #000; } .pl-stabs button:not(.on):hover { background: rgba(255,255,255,.1); }\n.pl-stabs .pl-sclose { margin-left: auto; width: 32px; height: 32px; padding: 0; display: grid; place-items: center; } .pl-stabs .pl-sclose svg { width: 18px; height: 18px; }\n.pl-srow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 6px; border-top: 1px solid rgba(255,255,255,.06); }\n.pl-srow b { display: block; font-size: 14px; font-weight: 600; } .pl-srow small { display: block; color: #8d8d95; font-size: 12px; margin-top: 3px; max-width: 200px; }\n.pl-seg { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; background: rgba(255,255,255,.07); padding: 3px; border-radius: 999px; }\n.pl-seg button { padding: 6px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: #cfcfd5; transition: background .15s; } .pl-seg button.on { background: #fff; color: #000; }\n.pl-subpreview { margin-top: 10px; height: 76px; border-radius: 14px; background: linear-gradient(135deg, #3a4a6a, #1f2a40); display: grid; place-items: center; font-size: 18px; color: var(--sub-color, #fff); font-weight: var(--sub-weight, 500); }\n#cx-player[data-subbg=\"shadow\"] .pl-subpreview span { text-shadow: 0 0 3px #000, 0 2px 8px #000; } #cx-player[data-subbg=\"box\"] .pl-subpreview span { background: rgba(0,0,0,.62); padding: 2px 10px; border-radius: 8px; }\n.pl-key { display: flex; align-items: center; gap: 12px; padding: 7px 6px; font-size: 13.5px; } .pl-key kbd { min-width: 96px; font: inherit; font-size: 12px; background: rgba(255,255,255,.1); border-radius: 8px; padding: 4px 9px; text-align: center; }\n\n/* stats */\n.pl-stats { position: absolute; top: 90px; right: 28px; z-index: 4; background: rgba(15,15,18,.85); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 12px 16px; min-width: 260px; display: none; font-size: 12.5px; }\n.pl-stats.open { display: block; } .pl-stats div { display: flex; justify-content: space-between; gap: 20px; padding: 3px 0; } .pl-stats span { color: #9a9aa2; } .pl-stats b { font-weight: 600; }\n\n/* skip segment + next episode */\n.pl-skipseg { position: absolute; right: 32px; bottom: 140px; z-index: 5; opacity: 0; transform: translateY(10px); pointer-events: none; transition: .3s cubic-bezier(.16,1,.3,1); height: 44px; font-size: 14px; }\n.pl-skipseg.show { opacity: 1; transform: none; pointer-events: auto; } .pl-skipseg svg { width: 20px; height: 20px; }\n.pl-nextcard { position: absolute; right: 32px; bottom: 140px; z-index: 5; width: 320px; padding: 16px; border-radius: 20px; background: rgba(24,24,28,.94); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.1); opacity: 0; transform: translateY(12px); pointer-events: none; transition: .3s cubic-bezier(.16,1,.3,1); }\n.pl-nextcard.show { opacity: 1; transform: none; pointer-events: auto; } .pl-nc-s { font-size: 12px; color: #9a9aa2; margin-bottom: 4px; } .pl-nc-t { font-weight: 700; margin-bottom: 12px; }\n.pl-nextcard .btn { height: 38px; font-size: 13px; padding: 0 16px 0 12px; } .pl-nextcard svg { width: 18px; height: 18px; }\n\n/* flash icons + tap zones */\n.pl-flash { position: absolute; left: 50%; top: 50%; z-index: 4; transform: translate(-50%, -50%) scale(.8); width: 84px; height: 84px; border-radius: 50%; background: rgba(0,0,0,.5); display: grid; place-items: center; opacity: 0; pointer-events: none; font-weight: 700; font-size: 16px; }\n.pl-flash.show { animation: plflash .5s ease both; } .pl-flash.icon svg { width: 38px; height: 38px; }\n.pl-flash.l { left: 22%; } .pl-flash.r { left: 78%; }\n@keyframes plflash { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.7); } 25% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); } }\n.pl-tap { position: absolute; top: 14%; bottom: 24%; width: 32%; z-index: 1; display: none; } .pl-tap.l { left: 0; } .pl-tap.r { right: 0; }\n@media (pointer: coarse) { .pl-tap { display: block; } }\n.pl-vol:hover .pl-vbar { width: 90px; }\n@media (max-width: 800px) {\n  .pl-bar { padding: 60px 14px 14px; } .pl-settings { right: 10px; left: 10px; width: auto; bottom: 80px; } .pl-skipseg, .pl-nextcard { right: 14px; bottom: 120px; }\n  .pl-row > button, .pl-btn-wrap > button { width: 42px; height: 42px; } .pl-row .pl-pp { width: 48px; height: 48px; } .pl-time { margin-left: 4px; } .pl-time .sl { display: none; } .pl-time span:last-child { display: none; }\n  [data-tip]::before { display: none; }\n  .pl-subs { font-size: clamp(14px, 3.6vw, 22px); } #cx-player:not(.idle) .pl-subs { bottom: calc(var(--sub-pos, 9%) + 70px); }\n}\n\n/* ===== v11: user menu, settings layout, card scale ===== */\n.nf-card { width: calc(clamp(200px, 17.5vw, 340px) * var(--cs, 1)); }\n.nf-card.poster { width: calc(clamp(130px, 11.4vw, 220px) * var(--cs, 1)); }\n.nf-grid .nf-card, .nf-grid .nf-card.poster, .req-grid .nf-card { width: auto; }\n@media (max-width: 800px) { .nf-card { width: calc(52vw * var(--cs, 1)); } .nf-card.poster { width: calc(30vw * var(--cs, 1)); } .nf-grid .nf-card, .nf-grid .nf-card.poster { width: 100%; } }\n\n/* top-right account menu */\n.nf-pop.nf-user { width: 320px; padding: 10px; border-radius: 22px; max-height: min(78vh, 720px); overflow-y: auto; top: 54px; }\n.um-head { display: flex; align-items: center; gap: 14px; padding: 12px 12px 14px; }\n.um-av { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-nf, #e50914), #6b0710); display: grid; place-items: center; font-weight: 800; font-size: 20px; flex: none; }\n.um-name { font-weight: 700; font-size: 16px; letter-spacing: -.01em; } .um-head span { font-size: 12.5px; color: #8d8d95; }\n.um-sec { padding: 6px 0; border-top: 1px solid rgba(255,255,255,.07); } .um-sec:empty { display: none; }\n.um-h { padding: 8px 12px 4px; font-size: 11px; color: #8d8d95; text-transform: uppercase; letter-spacing: .09em; font-weight: 600; }\n.nf-pop .um-item { display: flex !important; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 14px; transition: background .18s, transform .18s; position: relative; }\n.nf-pop .um-item:hover { background: rgba(255,255,255,.09); transform: translateX(3px); }\n.nf-pop .um-item:active { transform: translateX(1px) scale(.99); }\n.um-ic { width: 36px; height: 36px; border-radius: 11px; background: rgba(255,255,255,.08); display: grid; place-items: center; flex: none; transition: background .18s, transform .18s; }\n.um-item:hover .um-ic { background: var(--accent-nf, #e50914); transform: scale(1.06) rotate(-4deg); }\n.um-ic .material-icons { font-size: 19px; }\n.um-l { flex: 1; font-size: 14.5px; font-weight: 500; } .um-ch { width: 16px !important; height: 16px !important; opacity: 0; transform: translateX(-4px); transition: .18s; } .um-item:hover .um-ch { opacity: .6; transform: none; }\n.um-danger:hover .um-ic { background: #c0392b; }\n.um-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; font-size: 14px; }\n.nf-pop.nf-user .m-only { display: none !important; } @media (max-width: 800px) { .nf-pop.nf-user .m-only { display: flex !important; } .nf-pop.nf-user .um-sec.m-only { display: block !important; } .nf-pop.nf-user { position: fixed; right: 10px; left: 10px; width: auto; top: 62px; } }\n\n/* settings */\n.set-wrap { max-width: 1180px; margin: 0 auto; }\n.set-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 28px; align-items: start; }\n.set-nav { position: sticky; top: 92px; display: flex; flex-direction: column; gap: 4px; }\n.set-nav button { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; text-align: left; font-size: 14.5px; font-weight: 500; color: #c9c9d0; transition: background .18s, color .18s, transform .18s; }\n.set-nav button:hover { background: rgba(255,255,255,.07); color: #fff; transform: translateX(2px); }\n.set-nav button.on { background: #fff; color: #000; font-weight: 600; }\n.set-body { min-width: 0; }\n.set-card { padding: 24px 26px; } .set-card h3 { font-size: 19px; margin-bottom: 8px; }\n.set-row.locked { opacity: .55; pointer-events: none; }\n.set-ctl { display: flex; align-items: center; gap: 10px; flex: none; }\n.set-reset { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: #8d8d95; background: rgba(255,255,255,.06); } .set-reset:hover { color: #fff; background: rgba(255,255,255,.14); }\n.set-seg { background: rgba(255,255,255,.07); }\n.set-sw { display: flex; gap: 8px; } .set-sw button { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; transition: transform .15s; } .set-sw button:hover { transform: scale(1.15); } .set-sw button.on { border-color: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,.6) inset; }\n.set-svc { display: flex; align-items: center; gap: 14px; padding: 12px 4px; border-top: 1px solid rgba(255,255,255,.06); } .set-svc:first-of-type { border-top: 0; }\n.set-svc i { width: 10px; height: 10px; border-radius: 50%; background: #5a5a62; flex: none; } .set-svc i.ok { background: #34c759; box-shadow: 0 0 0 4px rgba(52,199,89,.18); }\n.set-svc > div { flex: 1; } .set-svc b { display: block; font-size: 15px; } .set-svc span { font-size: 12.5px; color: #8d8d95; }\n.set-about { font-size: 14px; color: #cfcfd5; display: flex; flex-direction: column; gap: 12px; } .set-about a { text-decoration: underline; }\ncode { background: rgba(255,255,255,.08); padding: 4px 9px; border-radius: 8px; font-size: 13px; }\n@media (max-width: 800px) { .set-layout { grid-template-columns: 1fr; } .set-nav { position: static; flex-direction: row; overflow-x: auto; scrollbar-width: none; } .set-nav button { white-space: nowrap; padding: 9px 14px; } .set-card { padding: 18px; } .set-row { flex-wrap: wrap; } }\n.nf-pop .set-switch { width: 46px !important; height: 26px; flex: none; padding: 0 !important; display: block !important; } .um-row { gap: 12px; } .um-row span { flex: 1; }\n\n/* ===== v12: Lucide icons, player + layout fixes ===== */\r\n:is(#cx, #cx-ui) svg.lu { fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\r\n:is(#cx, #cx-ui) svg.lu.lu-fill { fill: currentColor; }\r\n:is(#cx, #cx-ui) svg.lu * { stroke-width: inherit; }\r\n:is(#cx, #cx-ui) .ic-s svg.lu { stroke-width: 2.2; }\r\n:is(#cx, #cx-ui) svg.lu path, :is(#cx, #cx-ui) svg.lu polygon, :is(#cx, #cx-ui) svg.lu line, :is(#cx, #cx-ui) svg.lu polyline, :is(#cx, #cx-ui) svg.lu rect, :is(#cx, #cx-ui) svg.lu circle { stroke: currentColor; stroke-width: inherit; }\r\n:is(#cx, #cx-ui) svg.lu.lu-fill path, :is(#cx, #cx-ui) svg.lu.lu-fill polygon, :is(#cx, #cx-ui) svg.lu.lu-fill rect { fill: currentColor; }\r\n#cx-player svg.lu { fill: none; stroke: currentColor; stroke-width: 1.8; } #cx-player svg.lu.lu-fill { fill: currentColor; }\r\n#cx-player svg.lu path, #cx-player svg.lu polygon, #cx-player svg.lu line, #cx-player svg.lu polyline, #cx-player svg.lu rect, #cx-player svg.lu circle { stroke: currentColor; stroke-width: inherit; }\r\n#cx-player svg.lu.lu-fill path, #cx-player svg.lu.lu-fill polygon, #cx-player svg.lu.lu-fill rect { fill: currentColor; }\r\n#cx-player svg.lu text { fill: currentColor; stroke: none; }\r\n.pl-row .pl-pp svg { width: 26px; height: 26px; stroke-width: 2; }\r\n.pl-skip svg { width: 32px; height: 32px; stroke-width: 1.6; }\r\n\r\n/* seek knob follows instantly */\r\n.pl-seek b { transition: opacity .15s, transform .15s !important; }\r\n.pl-seek i, .pl-seek em { transition: none !important; }\r\n.pl-bubble span { width: auto !important; text-align: center !important; }\r\n\r\n/* sections inside detail pages keep the page padding */\r\n.nf-sect .nf-row h2 { margin: 0 var(--pad) 12px; }\r\n.nf-sect .nf-scroller { padding-left: var(--pad); padding-right: var(--pad); }\r\n\r\n/* cast photos: keep heads in frame */\r\n.nf-person .pi { background-position: center 18%; background-size: cover; }\r\n.nf-dposter { background-position: center top; }\r\n\r\n/* native menu entries list */\r\n.sp-menu .mi { font-family: \"Material Icons\"; font-size: 18px; width: 18px; opacity: .7; }\r\nhtml.cx-harvest .actionSheet, html.cx-harvest .dialogContainer, html.cx-harvest .dialogBackdrop, html.cx-harvest .dialogBackdropOpened, html.cx-harvest dialog { opacity: 0 !important; pointer-events: none !important; transition: none !important; }\r\n\n/* ===== v13: native frame, neutral avatar, cast, modals ===== */\n.cx-nframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; z-index: 9650; background: transparent; opacity: 0; pointer-events: none; color-scheme: dark; }\n.cx-nframe.show { opacity: 1; pointer-events: auto; }\n#cx-lite { position: fixed; inset: 0; z-index: 9640; display: none; place-items: center; background: rgba(0,0,0,.35); backdrop-filter: blur(3px); }\n#cx-lite.show { display: grid; }\n\n/* avatar + account menu: neutral, no heavy red */\n.nf-avatar, .um-av { background: #2c2c33 !important; color: #fff; border: 1px solid rgba(255,255,255,.14); box-shadow: none; font-weight: 700; }\n.nf-avatar { transition: background .2s, border-color .2s; } .nf-menu-wrap > button:hover .nf-avatar { background: #3a3a43 !important; border-color: rgba(255,255,255,.3); }\n.um-item:hover .um-ic { background: rgba(255,255,255,.18) !important; transform: scale(1.05); }\n.um-danger:hover .um-ic { background: rgba(255,69,58,.28) !important; }\n.um-av { font-size: 19px; }\n\n/* cast: full-bleed scroller with end padding */\n.nf-cast { margin-right: calc(-1 * var(--pad)); padding-right: var(--pad); scroll-padding-right: var(--pad); }\n.nf-cast .nf-person:last-child { margin-right: var(--pad); }\n.nf-sect .nf-scroller { padding-right: var(--pad); }\n.nf-person { flex: none; }\n.nf-person .pi { background-color: #26262c; }\n\n/* ===== v14: request modal 2, native dialogs ===== */\n.sr-modal { width: min(1000px, 100%); max-height: 92vh; border-radius: 28px; }\n.sr-hero { height: 260px; }\n.sr-body { padding: 0 34px 32px; margin-top: -90px; }\n.sr-top { display: flex; gap: 26px; align-items: flex-end; }\n.sr-poster { width: 190px; aspect-ratio: 2/3; border-radius: 16px; background: #26262c center/cover; box-shadow: 0 20px 50px rgba(0,0,0,.6); flex: none; }\n.sr-head { min-width: 0; flex: 1; padding-bottom: 4px; }\n.sr-head h2 { margin: 0 0 6px; } .sr-head h2 span { font-weight: 500; color: #9a9aa2; font-size: .7em; }\n.sr-facts { grid-template-columns: 150px 1fr; margin-top: 18px; }\n.sr-castw { margin-top: 26px; } .sr-castw h3 { margin: 0 0 12px; font-size: 18px; }\n.sr-cast2 { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; }\n.sr-p { flex: none; width: 96px; text-align: center; font-size: 12.5px; } .sr-p .pi { width: 96px; height: 96px; border-radius: 50%; background: #26262c center 18%/cover; margin-bottom: 8px; } .sr-p b { display: block; font-weight: 600; } .sr-p small { display: block; color: #8d8d95; margin-top: 2px; }\n.sr-adv { margin: 14px 0; background: rgba(255,255,255,.04); border-radius: 16px; padding: 4px 16px; } .sr-adv summary { cursor: pointer; padding: 10px 0; font-weight: 600; font-size: 14px; }\n.sr-opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 4px 0 14px; } .sr-opt label { display: block; font-size: 12px; color: #9a9aa2; margin-bottom: 5px; font-weight: 600; }\n.sr-opt select { width: 100%; height: 40px; padding: 0 12px; border-radius: 12px; background: #202026; color: #fff; border: 1px solid rgba(255,255,255,.1); font: inherit; }\n@media (max-width: 800px) { .sr-top { flex-direction: column; align-items: flex-start; } .sr-poster { width: 120px; } .sr-body { padding: 0 18px 24px; } .sr-facts { grid-template-columns: 110px 1fr; } }\n\n/* native dialogs (metadata editor, image editor, identify, ...) */\nhtml.cx-ready .dialogBackdropOpened, html.cx-ready .dialogBackdrop { background: rgba(0,0,0,.62) !important; backdrop-filter: blur(10px); }\nhtml.cx-ready .formDialog, html.cx-ready dialog.formDialog, html.cx-ready .dialog:not(.actionsheet) { background: #17171b !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 26px !important; box-shadow: 0 40px 100px rgba(0,0,0,.7) !important; color: #ececf0; overflow: hidden; }\nhtml.cx-ready .formDialogHeader { background: transparent !important; padding: 12px 18px !important; border-bottom: 1px solid rgba(255,255,255,.06); }\nhtml.cx-ready .formDialogHeaderTitle { font-weight: 700; font-size: 18px; letter-spacing: -.01em; }\nhtml.cx-ready .formDialogContent { padding: 8px 6px; }\nhtml.cx-ready .formDialogFooter { background: rgba(255,255,255,.03) !important; border-top: 1px solid rgba(255,255,255,.06); padding: 14px 22px; }\nhtml.cx-ready .formDialog h2, html.cx-ready .formDialog .sectionTitle { font-weight: 700; letter-spacing: -.01em; }\nhtml.cx-ready .formDialog .card .cardBox, html.cx-ready .formDialog .cardBox { background: #202026 !important; border: 1px solid rgba(255,255,255,.06); border-radius: 20px !important; padding: 12px 12px 10px; transition: transform .2s, background .2s, border-color .2s; }\nhtml.cx-ready .formDialog .cardBox:hover { background: #26262d !important; border-color: rgba(255,255,255,.14); transform: translateY(-2px); }\nhtml.cx-ready .formDialog .cardImageContainer, html.cx-ready .formDialog .cardImage { border-radius: 12px !important; background-color: #14141a; }\nhtml.cx-ready .formDialog .cardText { color: #e4e4e8; }\nhtml.cx-ready .formDialog .cardText-secondary { color: #8d8d95; }\nhtml.cx-ready .formDialog .paper-icon-button-light, html.cx-ready .formDialog .emby-button.paper-icon-button-light { width: 40px; height: 40px; border-radius: 50% !important; background: rgba(255,255,255,.08); color: #e8e8ec; transition: background .18s, transform .15s; }\nhtml.cx-ready .formDialog .paper-icon-button-light:hover { background: rgba(255,255,255,.18); transform: scale(1.06); }\nhtml.cx-ready .formDialog [class*=\"accent\"], html.cx-ready .formDialog .button-accent, html.cx-ready .formDialog .emby-button.button-accent { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .formDialog .fab, html.cx-ready .formDialog .btnBrowseAllImages, html.cx-ready .formDialog .fab.mini { background: rgba(255,255,255,.12) !important; color: #fff !important; box-shadow: none !important; }\nhtml.cx-ready .formDialog .fab:hover { background: rgba(255,255,255,.24) !important; }\nhtml.cx-ready .formDialog .emby-checkbox:checked + span + .checkboxOutline, html.cx-ready .formDialog .emby-checkbox:checked + span { background: #fff !important; }\nhtml.cx-ready .formDialog a,html.cx-ready .formDialog .button-link { color: #cfd3ff; }\nhtml.cx-ready .formDialog .emby-input, html.cx-ready .formDialog .emby-select, html.cx-ready .formDialog textarea { background: #202026 !important; }\nhtml.cx-ready .formDialog .checkboxContainer, html.cx-ready .formDialog .selectContainer { border-radius: 14px; }\nhtml.cx-ready .formDialog button.raised, html.cx-ready .formDialog .button-submit { padding: 10px 22px; }\nhtml.cx-ready .actionSheet, html.cx-ready .dialog.actionsheet { background: rgba(28,28,32,.97) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 20px !important; padding: 6px !important; box-shadow: 0 30px 70px rgba(0,0,0,.6) !important; backdrop-filter: blur(24px); }\nhtml.cx-ready .actionSheetMenuItem, html.cx-ready .actionSheet button.listItem { border-radius: 12px !important; transition: background .15s; }\nhtml.cx-ready .actionSheetMenuItem:hover { background: rgba(255,255,255,.1) !important; }\n\n/* ===== v15: mobile polish, touch player ===== */\r\n.pl-bigctl { display: none; }\r\n.pl-tap { display: none; }\r\n#cx-player { height: 100dvh; }\r\n@media (pointer: coarse) {\r\n  .pl-tap { display: block; position: absolute; top: 16%; bottom: 26%; z-index: 1; }\r\n  .pl-tap.l { left: 0; width: 34%; } .pl-tap.c { left: 34%; width: 32%; } .pl-tap.r { right: 0; width: 34%; }\r\n  .pl-bigctl { display: flex; position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); justify-content: center; align-items: center; gap: 36px; z-index: 2; pointer-events: none; transition: opacity .3s; }\r\n  .pl-bigctl button { pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; background: rgba(0,0,0,.45); backdrop-filter: blur(8px); color: #fff; display: grid; place-items: center; }\r\n  .pl-bigctl .pl-bigpp { width: 72px; height: 72px; background: rgba(255,255,255,.95); color: #000; }\r\n  .pl-bigctl svg { width: 30px; height: 30px; } .pl-bigctl .pl-bigpp svg { width: 36px; height: 36px; }\r\n  #cx-player.idle .pl-bigctl, #cx-player.loading .pl-bigctl { opacity: 0; pointer-events: none; } #cx-player.idle .pl-bigctl button { pointer-events: none; }\r\n  /* bottom bar: seek on top, compact icon row, no duplicated play/skip/volume */\r\n  .pl-row .pl-pp, .pl-row .pl-skip, .pl-vol, .pl-row [data-tip*=\"icture\"] { display: none !important; }\r\n  .pl-bar { padding: 50px max(16px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }\r\n  .pl-top { padding: max(14px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 40px max(16px, env(safe-area-inset-left)); }\r\n  .pl-seek { height: 28px; } .pl-seek::before { height: 4px; } .pl-time { display: block !important; font-size: 13px; margin-left: 2px; } .pl-time .sl, .pl-time span:last-child { display: inline !important; color: #9a9aa2; }\r\n  .pl-row { gap: 2px; } .pl-row > button, .pl-btn-wrap > button { width: 44px; height: 44px; }\r\n  .pl-subs { bottom: 18%; }\r\n  .pl-settings { max-height: 70dvh; overflow-y: auto; }\r\n}\r\n@media (pointer: coarse) and (orientation: portrait) { .pl-bigctl { gap: 22px; } .pl-title { font-size: 15px; } }\r\n\r\n/* ---- phone layout ---- */\r\n@media (max-width: 820px) {\r\n  :root { --pad: 16px; }\r\n  /* home hero: shorter, thumb friendly */\r\n  .nf-hero { margin-top: 62px; height: min(58vh, 520px); min-height: 380px; border-radius: 20px; }\r\n  .nf-hero-logo { max-height: 72px; max-width: 72%; }\r\n  .nf-hero-title { font-size: 30px; }\r\n  /* detail: backdrop on top, info below, big full-width play button */\r\n  .nf-dback { position: absolute; inset: 0 0 auto 0; height: 440px; }\r\n  .nf-dback::after { background: linear-gradient(to top, #111113 2%, rgba(17,17,19,.55) 45%, rgba(17,17,19,.2) 100%) !important; }\r\n  .nf-dbody { padding: 230px var(--pad) 150px !important; }\r\n  .nf-dposter { display: none; }\r\n  .nf-dhead { gap: 0 !important; }\r\n  .nf-dlogo { max-height: 84px; max-width: 70%; object-position: left bottom; margin-bottom: 12px; border-radius: 6px; }\r\n  .nf-dinfo h1 { font-size: 30px; margin-bottom: 8px; }\r\n  .nf-dinfo .nf-meta { justify-content: flex-start; flex-wrap: wrap; font-size: 13px; }\r\n  .nf-dinfo .ov { font-size: 14.5px; line-height: 1.55; color: #d6d6da; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; margin-bottom: 18px; }\r\n  .nf-dinfo .ov.open { -webkit-line-clamp: unset; }\r\n  .nf-tagline { font-size: 14px; margin: 0 0 8px; }\r\n  .rt-row { gap: 6px; margin: 2px 0 12px; } .rt-chip { padding: 5px 10px; font-size: 12px; gap: 6px; } .rt-chip small { display: none; }\r\n  .nf-dinfo .nf-btns { display: flex; flex-wrap: wrap; gap: 10px; }\r\n  .nf-dinfo .nf-btns .btn.white { flex: 1 1 100%; height: 50px; justify-content: center; font-size: 16px; }\r\n  .nf-dinfo .nf-btns .btn.grey:not(.round) { flex: 1 1 0; height: 46px; justify-content: center; }\r\n  .nf-dinfo .nf-btns .btn.round { width: 46px; height: 46px; flex: none; }\r\n  .nf-resume-bar { width: 100% !important; margin-top: 12px; }\r\n  .nf-facts { grid-template-columns: 96px 1fr; font-size: 13.5px; }\r\n  /* rows and grids */\r\n  .nf-sect h2, .nf-row-h h2 { font-size: 18px; }\r\n  .nf-cast { gap: 12px; } .nf-person { width: 78px; } .nf-person .pi { width: 78px; height: 78px; }\r\n  /* settings: tabs scroll horizontally */\r\n  .set-layout { flex-direction: column; gap: 14px; }\r\n  .set-nav { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; } .set-nav::-webkit-scrollbar { display: none; } .set-nav > * { flex: none; }\r\n  .set-row { flex-direction: column; align-items: flex-start; gap: 10px; }\r\n  .set-ctl { width: 100%; justify-content: space-between; } .set-seg { flex-wrap: wrap; }\r\n  /* modals become bottom sheets */\r\n  .sr-modal, .sp-modal { width: 100% !important; max-height: 94dvh; border-radius: 24px 24px 0 0 !important; align-self: flex-end; }\r\n  .sp-modal-bg { align-items: flex-end !important; padding: 0 !important; }\r\n  .nf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }\r\n  .dc-bar { overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; } .dc-bar::-webkit-scrollbar { display: none; } .dc-bar > * { flex: none; }\r\n  body { overscroll-behavior-y: contain; }\r\n  button, a { -webkit-tap-highlight-color: transparent; }\r\n}\r\n\r\nhtml.cx-hold body, html.cx-hold .skinBody, html.cx-hold .backgroundContainer { background: #111113 !important; } html.cx-hold #reactRoot { visibility: hidden !important; }\r\n.pl-tap { display: none !important; }\r\n\r\n/* ---- music on phones ---- */\r\n@media (max-width: 800px) {\r\n  .sp-main { background: #0f0f11; }\r\n  .sp-header { position: sticky; top: 0; z-index: 5; height: auto !important; min-height: 56px; padding: 10px 14px !important; gap: 10px; background: #0f0f11ee; display: flex; align-items: center; flex-wrap: nowrap; }\r\n  .sp-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2c2c33; display: grid; place-items: center; font-weight: 800; font-size: 15px; flex: none; color: #fff; }\r\n  .sp-chips { display: flex; flex: 1; min-width: 0; flex-wrap: nowrap; gap: 8px; overflow-x: auto; scrollbar-width: none; } .sp-chips::-webkit-scrollbar { display: none; }\r\n  .sp-chip { flex: none; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,.1); font-weight: 600; font-size: 14px; color: #fff; transition: background .15s, transform .12s; } .sp-chip:active { transform: scale(.95); }\r\n  .sp-chip.on { background: #fff; color: #000; }\r\n  .sp-greet { display: none; }\r\n  .sp-content { padding-bottom: 200px !important; }\r\n  .sp-quick { grid-template-columns: 1fr 1fr; gap: 8px; } .sp-quick > * { height: 56px; border-radius: 10px; }\r\n  .sp-mini { backdrop-filter: blur(14px); box-shadow: 0 8px 24px rgba(0,0,0,.5); transition: transform .2s; } .sp-mini:active { transform: scale(.985); }\r\n  .sp-full { transition: transform .38s cubic-bezier(.2,.8,.2,1); border-radius: 0; }\r\n  .sp-full .cvbig { width: min(86vw, 52vh); margin: 0 auto; border-radius: 14px; box-shadow: 0 24px 60px rgba(0,0,0,.55); }\r\n  .sp-full .ctr .pl-btn { width: 52px; height: 52px; } .sp-full .ctr .big { width: 72px; height: 72px; }\r\n}\r\n\r\n/* ---- touch smoothness ---- */\r\n@media (pointer: coarse) {\r\n  a, button, .nf-card, .sp-row, .sp-li, .sp-card { touch-action: manipulation; }\r\n  .nf-card, .sp-row, .btn, .sp-chip, .nf-chip { transition: transform .12s ease, background .15s ease; }\r\n  .nf-card:active, .sp-row:active { transform: scale(.97); }\r\n  .btn:active, .nf-chip:active { transform: scale(.95); }\r\n  .nf-peek { display: none !important; }\r\n  .nf-scroller, .nf-row-scroll, .sp-shelf { scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }\r\n  .nf-card, .sp-card { scroll-snap-align: start; }\r\n  .nf-top, .cx-tabs, .nf-hero::after { backdrop-filter: none !important; }\r\n  .cx-tabs { background: rgba(24,24,28,.96) !important; }\r\n  #cx-nf .nf-card .im { will-change: auto; }\r\n  .nf-sect, .nf-row { content-visibility: auto; contain-intrinsic-size: auto 260px; }\r\n}\r\n\n/* ===== v16: Cinema editors (dialogs) ===== */\r\n.cxd-bg { position: fixed; inset: 0; z-index: 9800; background: rgba(0,0,0,.6); backdrop-filter: blur(8px); display: grid; place-items: center; padding: 20px; opacity: 0; transition: opacity .2s; }\r\n.cxd-bg.show { opacity: 1; }\r\n.cxd { width: min(620px, 100%); max-height: min(88vh, 900px); display: flex; flex-direction: column; background: #17171b; border: 1px solid rgba(255,255,255,.08); border-radius: 26px; box-shadow: 0 40px 100px rgba(0,0,0,.7); color: #ececf0; overflow: hidden; transform: translateY(14px) scale(.98); transition: transform .28s cubic-bezier(.2,.8,.2,1); }\r\n.cxd-bg.show .cxd { transform: none; }\r\n.cxd.wide { width: min(980px, 100%); }\r\n.cxd-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px 16px 26px; border-bottom: 1px solid rgba(255,255,255,.06); }\r\n.cxd-head b { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }\r\n.cxd-x { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.08); display: grid; place-items: center; transition: background .15s; } .cxd-x:hover { background: rgba(255,255,255,.18); }\r\n.cxd-body { padding: 20px 26px 24px; overflow-y: auto; flex: 1; min-height: 120px; scrollbar-width: thin; }\r\n.cxd-foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.025); } .cxd-foot:empty { display: none; }\r\n.cxd-foot .cxd-chk { margin-right: auto; }\r\n.cxd .btn.danger { background: #d92d20; color: #fff; }\r\n.cxd-sec { margin-bottom: 28px; } .cxd-sec:last-child { margin-bottom: 0; }\r\n.cxd-sh { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; } .cxd-sh h3 { margin: 0; font-size: 17px; font-weight: 700; }\r\n.cxd-sa { display: flex; gap: 8px; }\r\n.cxd-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,.09); font-weight: 600; font-size: 13px; color: #fff; transition: background .15s, transform .12s; } .cxd-chip:hover { background: rgba(255,255,255,.18); } .cxd-chip:active { transform: scale(.96); }\r\n.cxd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }\r\n.cxd-img { background: #202026; border-radius: 18px; padding: 10px; display: flex; flex-direction: column; gap: 8px; text-align: center; border: 1px solid rgba(255,255,255,.05); }\r\n.cxd-img small { color: #8d8d95; font-size: 12px; }\r\n.cxd-img .ci { position: relative; border-radius: 12px; background: #101014 center/contain no-repeat; aspect-ratio: 16/9; }\r\n.cxd-img .ci.primary { aspect-ratio: 2/3; } .cxd-img .ci.logo { aspect-ratio: 16/7; background-color: #1b1b21; } .cxd-img .ci.banner { aspect-ratio: 5/1; } .cxd-img .ci.disc { aspect-ratio: 1; }\r\n.cxd-grid:has(.ci.primary) { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }\r\n.cxd-img.pick { cursor: pointer; transition: background .15s, transform .15s, border-color .15s; } .cxd-img.pick:hover { background: #292930; border-color: rgba(255,255,255,.2); transform: translateY(-2px); }\r\n.cxd-del { position: absolute; top: 6px; right: 6px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; display: grid; place-items: center; opacity: 0; transition: opacity .15s, background .15s; } .cxd-img:hover .cxd-del, .cxd-del:focus { opacity: 1; } .cxd-del:hover { background: #d92d20; }\r\n@media (pointer: coarse) { .cxd-del { opacity: 1; } }\r\n.cxd-none { color: #6f6f77; font-size: 14px; padding: 6px 2px; }\r\n.cxd-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; } .cxd-f.full, .cxd-chk.full { grid-column: 1 / -1; }\r\n.cxd-f { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #a2a2aa; font-weight: 600; } .cxd-f small { font-weight: 400; color: #6f6f77; }\r\n.cxd input[type=text], .cxd input[type=number], .cxd input[type=date], .cxd textarea { width: 100%; background: #202026; color: #fff; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 11px 14px; font: inherit; font-size: 14.5px; font-weight: 400; transition: border-color .15s; color-scheme: dark; } .cxd input:focus, .cxd textarea:focus { outline: 0; border-color: rgba(255,255,255,.5); }\r\n.cxd textarea { resize: vertical; min-height: 120px; line-height: 1.5; }\r\n.cxd-chk { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #d4d4d8; cursor: pointer; } .cxd-chk input { width: 18px; height: 18px; accent-color: #fff; }\r\n.cxd-bar { display: flex; gap: 10px; flex-wrap: wrap; } .cxd-bar input[type=text] { flex: 1; min-width: 180px; } .cxd-bar input[type=number] { width: 110px; }\r\n.cxd-hint { color: #8d8d95; font-size: 13.5px; margin: 12px 0; line-height: 1.5; }\r\n.cxd-results { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }\r\n.cxd-res { display: flex; gap: 14px; text-align: left; padding: 10px; border-radius: 16px; background: #202026; border: 1px solid rgba(255,255,255,.05); transition: background .15s, border-color .15s; width: 100%; } .cxd-res:hover { background: #2a2a31; border-color: rgba(255,255,255,.18); }\r\n.cxd-res .rp { width: 64px; aspect-ratio: 2/3; border-radius: 10px; background: #101014 center/cover; flex: none; } .cxd-res .rt { min-width: 0; } .cxd-res b { display: block; font-size: 15px; } .cxd-res small { color: #8d8d95; } .cxd-res p { margin: 6px 0 0; font-size: 13px; color: #b4b4bc; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\r\n.cxd-opts { display: flex; flex-direction: column; gap: 10px; }\r\n.cxd-opt { display: block; padding: 14px 16px; border-radius: 16px; background: #202026; border: 1px solid rgba(255,255,255,.06); cursor: pointer; transition: background .15s, border-color .15s; } .cxd-opt b { display: block; font-size: 15px; } .cxd-opt small { color: #8d8d95; font-size: 13px; }\r\n.cxd-opt:hover { background: #26262d; } .cxd-opt.on { border-color: #fff; background: #26262d; }\r\n.cxd-opts + .cxd-chk { margin-top: 16px; }\r\n@media (max-width: 720px) {\r\n  .cxd-bg { padding: 0; align-items: end; }\r\n  .cxd, .cxd.wide { width: 100%; max-height: 94dvh; border-radius: 24px 24px 0 0; }\r\n  .cxd-form { grid-template-columns: 1fr; } .cxd-body { padding: 16px 16px 20px; } .cxd-head { padding: 14px 14px 14px 20px; }\r\n  .cxd-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }\r\n  .cxd-foot { padding: 12px 14px calc(12px + env(safe-area-inset-bottom)); }\r\n}\r\n\r\n/* ---- phone safe areas and edge padding ---- */\r\n@media (max-width: 800px) {\r\n  .sp-header { padding-top: max(10px, env(safe-area-inset-top)) !important; }\r\n  .sp-full { overflow-y: auto; padding-top: max(12px, env(safe-area-inset-top)); padding-bottom: max(28px, env(safe-area-inset-bottom)); }\r\n  .sp-shelf::after { content: \"\"; flex: none; width: 8px; }\r\n  .sp-content { padding-bottom: calc(190px + env(safe-area-inset-bottom)) !important; }\r\n  .cx-tabs { padding-bottom: env(safe-area-inset-bottom); }\r\n  .sp-row .ti b, .sp-row .ti span { max-width: 100%; }\r\n}\r\n\r\n/* ---- player gestures ---- */\r\n#cx-player { touch-action: none; }\r\n.pl-stack { position: absolute; top: 50%; transform: translateY(-50%) scale(.9); z-index: 4; display: none; flex-direction: column; align-items: center; gap: 4px; padding: 22px 26px; border-radius: 999px; background: rgba(0,0,0,.5); backdrop-filter: blur(6px); color: #fff; pointer-events: none; }\r\n.pl-stack.show { display: flex; animation: plstack .18s ease both; } .pl-stack.l { left: 8%; } .pl-stack.r { right: 8%; } .pl-stack svg { width: 34px; height: 34px; } .pl-stack b { font-size: 16px; font-variant-numeric: tabular-nums; }\r\n@keyframes plstack { from { transform: translateY(-50%) scale(.8); opacity: .4; } to { transform: translateY(-50%) scale(1); opacity: 1; } }\r\n.pl-gest { position: absolute; top: 14%; left: 50%; transform: translateX(-50%); z-index: 4; display: none; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 999px; background: rgba(0,0,0,.6); backdrop-filter: blur(8px); color: #fff; pointer-events: none; min-width: 170px; justify-content: center; }\r\n.pl-gest.show { display: flex; } .pl-gest .gi svg { width: 22px; height: 22px; display: block; } .pl-gest .gb { width: 110px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.25); overflow: hidden; } .pl-gest .gb i { display: block; height: 100%; background: #fff; } .pl-gest b { font-size: 14px; font-variant-numeric: tabular-nums; min-width: 40px; }\r\n\n/* ===== TV mode (remote control, 10-foot UI) ===== */\r\nhtml.cx-tv * { -webkit-tap-highlight-color: transparent; }\r\nhtml.cx-tv .tvf-on { outline: none; }\r\nhtml.cx-tv *, html.cx-tv *::before, html.cx-tv *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }\r\nhtml.cx-tv .nf-peek, html.cx-tv .nf-scrollbtn, html.cx-tv .nf-arrow { display: none !important; }\r\nhtml.cx-tv ::-webkit-scrollbar { display: none; }\r\nhtml.cx-tv .cx-tabs { display: none !important; }\r\nhtml.cx-tv #cx-nf, html.cx-tv .sp-scroll, html.cx-tv .nf-scroller, html.cx-tv .nf-cast, html.cx-tv .sp-shelf { scroll-behavior: auto !important; }\r\nhtml.cx-tv { --pad: 56px; }\r\n\r\n/* ambient colour wash behind the page */\r\nhtml.cx-tv #cx-glow { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity .7s ease, background .7s ease; }\r\nhtml.cx-tv #cx-nf { background: transparent; }\r\n\r\n/* ---- focus: a white ring (box-shadow, takes no space) + a soft glow in the poster colour ---- */\r\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { transition: transform .1s ease, box-shadow .15s ease; transform: none !important; will-change: auto; }\r\nhtml.cx-tv .nf-card.tvf-on { z-index: 6; }\r\nhtml.cx-tv .nf-card.tvf-on .im { transform: scale(1.03) !important; outline: 4px solid #fff; outline-offset: 4px; box-shadow: 0 0 40px 6px var(--glow, rgba(255,255,255,.22)); }\r\nhtml.cx-tv .nf-person.tvf-on .pi { transform: none !important; outline: 4px solid #fff; outline-offset: 4px; box-shadow: 0 0 34px 5px var(--glow, rgba(255,255,255,.2)); }\r\nhtml.cx-tv .btn { transition: transform .15s ease, box-shadow .2s ease; }\r\nhtml.cx-tv .btn.tvf-on { transform: none; outline: 4px solid #fff; outline-offset: 3px; box-shadow: none; position: relative; z-index: 4; }\r\nhtml.cx-tv #cx-top a.tvf-on, html.cx-tv #cx-top button.tvf-on { outline: 3px solid #fff; outline-offset: 3px; background: rgba(255,255,255,.18); color: #fff; border-radius: 999px; }\r\nhtml.cx-tv #cx-top a.tvf-on.on { background: #fff; color: #000; }\r\nhtml.cx-tv .sp-row.tvf-on { background: rgba(255,255,255,.17) !important; box-shadow: inset 0 0 0 3px #fff; border-radius: 12px; }\r\nhtml.cx-tv .sp-li.tvf-on, html.cx-tv .sp-navlink.tvf-on, html.cx-tv .sp-chip.tvf-on { background: rgba(255,255,255,.17) !important; box-shadow: inset 0 0 0 3px #fff; border-radius: 12px; color: #fff; }\r\nhtml.cx-tv .sp-quick > .tvf-on { box-shadow: inset 0 0 0 3px #fff; background: rgba(255,255,255,.2) !important; }\r\nhtml.cx-tv .sp-card.tvf-on, html.cx-tv .sp-top1.tvf-on { box-shadow: 0 0 0 4px #fff, 0 0 40px 6px var(--glow, rgba(255,255,255,.2)); border-radius: 16px; transform: scale(1.03); z-index: 5; position: relative; }\r\nhtml.cx-tv .sp-row button.tvf-on, html.cx-tv .pl-btn.tvf-on { box-shadow: 0 0 0 3px #fff; border-radius: 50%; background: rgba(255,255,255,.2); }\r\nhtml.cx-tv .nf-chip.tvf-on, html.cx-tv .cxd-chip.tvf-on, html.cx-tv .cxd-opt.tvf-on, html.cx-tv .cxd-res.tvf-on, html.cx-tv .nf-ep.tvf-on { box-shadow: 0 0 0 3px #fff; background: rgba(255,255,255,.2); }\r\nhtml.cx-tv input.tvf-on, html.cx-tv select.tvf-on, html.cx-tv textarea.tvf-on { box-shadow: 0 0 0 3px #fff; }\r\nhtml.cx-tv .set-switch.tvf-on { box-shadow: 0 0 0 3px #fff; }\r\n\r\n/* ---- layout: calm spacing at rest ---- */\r\nhtml.cx-tv .nf-card { width: calc(19vw * var(--cs, 1)); } html.cx-tv .nf-card.poster { width: calc(11.4vw * var(--cs, 1)); }\r\nhtml.cx-tv .nf-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 26px 18px; } html.cx-tv .nf-grid .nf-card, html.cx-tv .nf-grid .nf-card.poster { width: 100%; }\r\nhtml.cx-tv .nf-hero { height: 70vh; margin-top: 96px; }\r\nhtml.cx-tv .nf-row { margin-bottom: 30px; }\r\nhtml.cx-tv .nf-row h2 { font-size: 22px; margin-bottom: 4px; }\r\n/* generous scroller padding so rings and glows are never clipped */\r\nhtml.cx-tv .nf-scroller { gap: 16px; padding: 64px var(--pad) 68px; margin: -52px 0 -56px; }\r\nhtml.cx-tv .nf-btns, html.cx-tv .nf-hero-btns { gap: 14px; padding: 10px 8px; margin-left: -8px; }\r\nhtml.cx-tv .nf-btns .btn, html.cx-tv .nf-hero-btns .btn { height: 54px; font-size: 18px; flex: none; min-width: 0; }\r\nhtml.cx-tv .nf-btns .btn.round { width: 54px; padding: 0; aspect-ratio: 1; }\r\nhtml.cx-tv .nf-cast { gap: 22px; padding: 56px var(--pad) 60px; margin: -44px calc(-1 * var(--pad)) -48px; }\r\nhtml.cx-tv .nf-person { width: 112px; }\r\nhtml.cx-tv .nf-person .pi { width: 112px; height: 112px; margin-bottom: 12px; }\r\nhtml.cx-tv .nf-person b { display: block; margin-top: 2px; }\r\nhtml.cx-tv .nf-sect h2, html.cx-tv .nf-dbody h2 { margin-bottom: 6px; }\r\nhtml.cx-tv .nf-card.more .im { display: grid; place-items: center; background: #1c1c21; border: 2px dashed rgba(255,255,255,.22); }\r\nhtml.cx-tv .nf-card.more .mr { display: flex; flex-direction: column; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; color: #e6e6ea; } html.cx-tv .nf-card.more svg { width: 40px; height: 40px; }\r\nhtml.cx-tv #cx-top { background: rgba(17,17,19,.97) !important; }\r\n\r\n/* ---- smoothness + cheaper painting ---- */\r\nhtml.cx-tv .btn, html.cx-tv .nf-card .im, html.cx-tv .nf-person .pi, html.cx-tv #cx-top a, html.cx-tv #cx-top button { outline: 4px solid transparent; outline-offset: 0; transition: outline-color .14s ease, outline-offset .2s cubic-bezier(.2,.8,.2,1), transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease, background-color .15s ease; }\r\nhtml.cx-tv #cx-top a, html.cx-tv #cx-top button { outline-width: 3px; }\r\nhtml.cx-tv .nf-card.tvf-on .im { box-shadow: 0 0 30px 4px var(--glow, rgba(255,255,255,.2)); }\r\nhtml.cx-tv .nf-person.tvf-on .pi { box-shadow: 0 0 26px 4px var(--glow, rgba(255,255,255,.18)); }\r\nhtml.cx-tv .nf-row, html.cx-tv .nf-sect { animation: none !important; }\r\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { will-change: auto !important; }\r\nhtml.cx-tv #cx-glow { transition: opacity .6s ease; }\r\nhtml.cx-tv .nf-card .im .info, html.cx-tv .nf-card .im::after { transition: none; }\r\nhtml.cx-tv .nf-scroller, html.cx-tv .nf-cast, html.cx-tv .sp-shelf, html.cx-tv .nf-row-scroll, html.cx-tv #cx-nf { scroll-snap-type: none !important; }\nhtml.cx-tv .nf-row, html.cx-tv .nf-sect { content-visibility: visible !important; contain-intrinsic-size: none !important; }\n\n/* extended mode: a barely visible marker on the account avatar so you know it is on */\r\nhtml.cx-ext .nf-avatar { position: relative; }\r\nhtml.cx-ext .nf-avatar::after { content: ''; position: absolute; right: -1px; top: -1px; width: 7px; height: 7px; border-radius: 50%; background: #fff; opacity: .55; box-shadow: 0 0 0 2px #141414; }\r\n.um-danger .um-ic, .um-danger:hover .um-ic { background: rgba(255,255,255,.1) !important; color: #fff; }\n.um-danger:hover { background: rgba(255,255,255,.06); }\n.nf-card.hx .im { box-shadow: inset 0 0 0 2px rgba(255,255,255,.22); }\n.hx-badge { position: absolute; right: 8px; top: 8px; z-index: 4; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.65); backdrop-filter: blur(6px); }\n.hx-badge svg { width: 14px !important; height: 14px !important; }\n.hx-lock { width: 64px; height: 64px; margin: 6px auto 14px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, #34343d, #1f1f25); box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1); }\n.hx-lock svg { width: 28px; height: 28px; }\n.cxd input.hx-code { display: block; width: 100%; box-sizing: border-box; height: 56px; text-align: center; font-size: 24px; letter-spacing: .35em; background: rgba(255,255,255,.06) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.12) !important; border-radius: 16px !important; outline: 0; transition: border-color .2s, box-shadow .2s; }\n.cxd input.hx-code:focus { border-color: rgba(255,255,255,.5) !important; box-shadow: 0 0 0 4px rgba(255,255,255,.08); }\n.cxd input.hx-code::placeholder { letter-spacing: .3em; color: #55555e; }\n.cxd input.hx-code.shake { animation: hxShake .4s; border-color: #ff6b6b !important; }\n@keyframes hxShake { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }\n\n/* ---------- login / server select: calm, minimal ---------- */\nhtml.cx-ready.cx-login:not(.transparentDocument), html.cx-ready.cx-login:not(.transparentDocument) body { background: #0a0a0c !important; }\nhtml.cx-ready.cx-login:not(.transparentDocument) .backgroundContainer, html.cx-ready.cx-login:not(.transparentDocument) .skinBody, html.cx-ready.cx-login:not(.transparentDocument) .mainAnimatedPages { background: transparent !important; }\nhtml.cx-login .skinHeader, html.cx-login .MuiAppBar-root, html.cx-login .mainDrawerHandle { display: none !important; }\n/* one soft light from above, nothing moving */\nhtml.cx-login body::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(60% 45% at 50% -8%, rgba(255,255,255,.075), transparent 70%), radial-gradient(40% 40% at 12% 108%, color-mix(in srgb, var(--accent-nf, #e50914) 14%, transparent), transparent 70%); }\nhtml.cx-login body::after { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%); }\nhtml.cx-login #loginPage, html.cx-login #selectServerPage, html.cx-login #forgotPasswordPage, html.cx-login #forgotPasswordPinPage, html.cx-login #quickConnectPage { position: relative; z-index: 1; display: flex !important; align-items: center; justify-content: center; min-height: 100vh; padding: 32px 20px !important; background: transparent !important; }\nhtml.cx-login #loginPage > div, html.cx-login #selectServerPage > div, html.cx-login #forgotPasswordPage > div { width: 100%; max-width: 400px; margin: 0 auto !important; padding: 0 !important; background: none; border: 0; box-shadow: none; animation: cxLoginIn .5s cubic-bezier(.2, .8, .2, 1) both; }\n@keyframes cxLoginIn { from { opacity: 0; transform: translateY(10px); } }\nhtml.cx-login #loginPage > div::before, html.cx-login #selectServerPage > div::before, html.cx-login #forgotPasswordPage > div::before { content: var(--cx-brand, 'JELLYFIN'); display: block; text-align: center; font-weight: 900; font-size: 30px; letter-spacing: .22em; text-indent: .22em; color: #fff; margin: 0 0 8px; }\nhtml.cx-login #loginPage > div::after, html.cx-login #selectServerPage > div::after, html.cx-login #forgotPasswordPage > div::after { content: ''; order: -1; }\nhtml.cx-login .manualLoginForm { max-width: none !important; width: 100% !important; margin: 0 !important; position: relative; padding-top: 22px; }\nhtml.cx-login .manualLoginForm::before { content: ''; position: absolute; top: 0; left: 50%; width: 28px; height: 3px; margin-left: -14px; border-radius: 3px; background: var(--accent-nf, #e50914); }\nhtml.cx-login .sectionTitle, html.cx-login .visualLoginForm h1, html.cx-login #loginPage h1 { font-size: 15px !important; font-weight: 500 !important; letter-spacing: .02em; color: #8f8f99; text-align: center; margin: 18px 0 26px !important; }\nhtml.cx-login .padded-left.padded-right.flex { padding: 0 !important; }\nhtml.cx-login .inputContainer { margin: 0 0 16px !important; position: relative; }\nhtml.cx-login .inputLabel { position: static !important; transform: none !important; display: block; font-size: 11.5px !important; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #7f7f89 !important; margin: 0 0 8px 2px; }\nhtml.cx-login .emby-input, html.cx-login input.emby-input { height: 54px !important; padding: 0 18px !important; font-size: 16px !important; border-radius: 12px !important; background: rgba(255,255,255,.045) !important; border: 1px solid rgba(255,255,255,.1) !important; color: #fff !important; transition: border-color .2s, background .2s; width: 100%; box-sizing: border-box; }\nhtml.cx-login .emby-input:hover { border-color: rgba(255,255,255,.18) !important; }\nhtml.cx-login .emby-input:focus { background: rgba(255,255,255,.07) !important; border-color: rgba(255,255,255,.6) !important; box-shadow: none; outline: 0; }\nhtml.cx-login .emby-input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #17171b inset !important; -webkit-text-fill-color: #fff !important; }\nhtml.cx-login .checkboxContainer { margin: 2px 0 24px 2px !important; color: #a8a8b2; font-size: 14px; }\nhtml.cx-login .emby-checkbox:checked + span + .checkboxOutline { background: #fff !important; border-color: #fff !important; }\nhtml.cx-login .emby-checkbox:checked + span + .checkboxOutline .checkboxIcon { color: #000 !important; }\nhtml.cx-login .emby-checkbox:focus + span + .checkboxOutline { box-shadow: 0 0 0 4px rgba(255,255,255,.18) !important; }\nhtml.cx-login .button-submit.raised, html.cx-login button[type=submit].raised { height: 54px; font-size: 16px !important; font-weight: 700 !important; border-radius: 999px !important; background: #fff !important; color: #000 !important; box-shadow: none !important; transition: transform .15s, background .2s; }\nhtml.cx-login .button-submit.raised:hover { background: #e9e9ee !important; }\nhtml.cx-login .button-submit.raised:active { transform: scale(.985); }\n/* secondary actions: quiet text links */\nhtml.cx-login .raised.cancel, html.cx-login .btnSelectServer, html.cx-login .btnManual, html.cx-login .btnQuick, html.cx-login .btnForgotPassword { height: 40px; margin: 6px 0 0 !important; border-radius: 999px !important; background: transparent !important; color: #9a9aa4 !important; font-weight: 600 !important; font-size: 14px !important; border: 0 !important; box-shadow: none !important; transition: color .2s, background .2s; }\nhtml.cx-login .raised.cancel:hover, html.cx-login .btnSelectServer:hover { color: #fff !important; background: rgba(255,255,255,.06) !important; }\nhtml.cx-login .readOnlyContent { margin: 12px 0 0 !important; max-width: none !important; display: flex; flex-direction: column; align-items: center; }\nhtml.cx-login .readOnlyContent .raised { width: auto !important; padding: 0 18px; }\nhtml.cx-login .loginDisclaimer { color: #6f6f79; font-size: 12.5px; text-align: center; margin-top: 18px; }\nhtml.cx-login .visualLoginForm #divUsers { display: flex; flex-wrap: wrap; gap: 22px; justify-content: center; margin: 8px 0; }\nhtml.cx-login .visualLoginForm .card, html.cx-login .visualLoginForm .cardBox { background: transparent !important; border: 0 !important; }\nhtml.cx-login .visualLoginForm .cardImageContainer { border-radius: 50% !important; box-shadow: 0 8px 26px rgba(0, 0, 0, .5); transition: transform .2s, box-shadow .2s; }\nhtml.cx-login .visualLoginForm .card:hover .cardImageContainer { transform: scale(1.05); box-shadow: 0 0 0 3px #fff, 0 12px 30px rgba(0, 0, 0, .55); }\nhtml.cx-login .visualLoginForm .cardText { text-align: center; color: #e8e8ec; font-weight: 600; }\n@media (max-width: 520px) { html.cx-login #loginPage > div, html.cx-login #selectServerPage > div, html.cx-login #forgotPasswordPage > div { max-width: 100%; } }\n\n/* ---------- dashboard + admin pages (Jellyfin's React/MUI screens): every element in the Cinema look ---------- */\nhtml.cx-ready { --dx-a: #f2f2f5; --dx-a-soft: rgba(255, 255, 255, .12); --dx-a-text: #e8e8ec; --dx-card: #18181c; --dx-line: rgba(255, 255, 255, .07); }\n\n/* shell */\nhtml.cx-ready .MuiDrawer-paper { background: linear-gradient(180deg, #0f0f12, #0b0b0d) !important; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root { min-height: 42px; font-weight: 500; color: #c4c4cc; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root.Mui-selected { background: rgba(255, 255, 255, .1) !important; color: #fff; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemIcon-root { color: inherit; opacity: .85; min-width: 38px; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root { color: var(--dx-a-text); opacity: 1; }\nhtml.cx-ready .MuiDrawer-paper .MuiListSubheader-root { font-size: 11px; letter-spacing: .12em; text-transform: uppercase !important; color: #6f6f78 !important; font-weight: 700; }\nhtml.cx-ready .MuiAppBar-root { box-shadow: none !important; }\nhtml.cx-ready .MuiToolbar-root .MuiIconButton-root:hover { background: rgba(255, 255, 255, .08); }\n\n/* headings, text */\nhtml.cx-ready .MuiTypography-h1, html.cx-ready .MuiTypography-h2, html.cx-ready .MuiTypography-h3 { font-weight: 800 !important; letter-spacing: -.02em; }\nhtml.cx-ready .MuiTypography-h4, html.cx-ready .MuiTypography-h5, html.cx-ready .MuiTypography-h6 { font-weight: 700 !important; letter-spacing: -.01em; }\nhtml.cx-ready .MuiTypography-colorTextSecondary, html.cx-ready .MuiFormHelperText-root, html.cx-ready .MuiTypography-body2 { color: #9a9aa4; }\nhtml.cx-ready a.MuiLink-root, html.cx-ready .MuiLink-root { color: #fff !important; text-decoration-color: transparent !important; transition: text-decoration-color .2s; }\nhtml.cx-ready .MuiFormHelperText-root a, html.cx-ready .MuiTypography-body1 a.MuiLink-root, html.cx-ready .MuiTypography-body2 a.MuiLink-root { color: var(--dx-a-text) !important; }\nhtml.cx-ready a.MuiLink-root:hover { text-decoration-color: currentColor !important; }\nhtml.cx-ready .MuiBreadcrumbs-root a { color: #9a9aa4 !important; }\n\n/* surfaces: cards, paper, lists, tables */\nhtml.cx-ready .MuiCard-root, html.cx-ready .MuiPaper-outlined { background: var(--dx-card) !important; border: 1px solid var(--dx-line) !important; border-radius: 20px !important; box-shadow: none !important; overflow: hidden; transition: transform .2s, border-color .2s, background .2s; }\nhtml.cx-ready .MuiCard-root:hover { border-color: rgba(255, 255, 255, .14) !important; }\nhtml.cx-ready .MuiCardActionArea-root:hover .MuiCardActionArea-focusHighlight { opacity: .04; }\nhtml.cx-ready .MuiCardMedia-root:not([style*=\"url(\"]):not([image]) { background: linear-gradient(135deg, #2b2b33, #1b1b20 70%) !important; color: rgba(255, 255, 255, .85) !important; }\nhtml.cx-ready .MuiCardMedia-root .MuiSvgIcon-root { filter: drop-shadow(0 6px 14px rgba(0, 0, 0, .4)); }\nhtml.cx-ready .MuiCardContent-root { padding: 14px 16px !important; }\nhtml.cx-ready .MuiAvatar-colorDefault, html.cx-ready .MuiAvatar-root:not(:has(img)) { background: linear-gradient(135deg, #3a3a43, #25252b) !important; color: #fff !important; }\nhtml.cx-ready .MuiAvatar-root { box-shadow: 0 4px 14px rgba(0, 0, 0, .35); }\nhtml.cx-ready .MuiList-root .MuiListItem-root, html.cx-ready .MuiList-root .MuiListItemButton-root { border-radius: 14px; }\nhtml.cx-ready .MuiListItemButton-root:not(.Mui-selected):hover { background: rgba(255, 255, 255, .06) !important; }\nhtml.cx-ready .MuiDivider-root { border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiTableContainer-root, html.cx-ready .MuiDataGrid-root { background: var(--dx-card) !important; border: 1px solid var(--dx-line) !important; border-radius: 18px !important; }\nhtml.cx-ready .MuiTableCell-root { border-color: var(--dx-line) !important; color: #d8d8de; }\nhtml.cx-ready .MuiTableHead-root .MuiTableCell-root { color: #8c8c96; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; background: rgba(255, 255, 255, .03); }\nhtml.cx-ready .MuiTableRow-hover:hover, html.cx-ready .MuiTableBody-root .MuiTableRow-root:hover { background: rgba(255, 255, 255, .04) !important; }\nhtml.cx-ready .MuiDataGrid-columnHeaders { background: rgba(255, 255, 255, .03) !important; border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiDataGrid-cell, html.cx-ready .MuiDataGrid-footerContainer { border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiAccordion-root { background: var(--dx-card) !important; border: 1px solid var(--dx-line); border-radius: 18px !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAccordion-root::before { display: none; }\n\n/* form controls */\nhtml.cx-ready .MuiFormLabel-root, html.cx-ready .MuiInputLabel-root { color: #9a9aa4 !important; font-weight: 500; }\nhtml.cx-ready .MuiFormLabel-root.Mui-focused, html.cx-ready .MuiInputLabel-root.Mui-focused { color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiInputBase-root, html.cx-ready .MuiFilledInput-root, html.cx-ready .MuiOutlinedInput-root { background: rgba(255, 255, 255, .055) !important; border-radius: 14px !important; transition: background .2s, box-shadow .2s; }\nhtml.cx-ready .MuiFilledInput-root::before, html.cx-ready .MuiFilledInput-root::after, html.cx-ready .MuiInput-root::before, html.cx-ready .MuiInput-root::after { display: none !important; }\nhtml.cx-ready .MuiInputBase-root:hover { background: rgba(255, 255, 255, .08) !important; }\nhtml.cx-ready .MuiInputBase-root.Mui-focused { background: rgba(255, 255, 255, .09) !important; box-shadow: 0 0 0 3px var(--dx-a-soft), inset 0 0 0 1px color-mix(in srgb, var(--accent-nf, #e50914) 70%, transparent); }\nhtml.cx-ready .MuiInputBase-input { color: #f2f2f5; }\nhtml.cx-ready .MuiSelect-icon, html.cx-ready .MuiInputAdornment-root { color: #9a9aa4; }\nhtml.cx-ready .MuiCheckbox-root, html.cx-ready .MuiRadio-root { color: #6f6f78 !important; }\nhtml.cx-ready .MuiCheckbox-root.Mui-checked, html.cx-ready .MuiRadio-root.Mui-checked, html.cx-ready .MuiCheckbox-root.MuiCheckbox-indeterminate { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiSwitch-track { background: #44444c !important; opacity: 1 !important; border-radius: 999px; }\nhtml.cx-ready .MuiSwitch-switchBase.Mui-checked { color: #111 !important; }\nhtml.cx-ready .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track { background: var(--dx-a) !important; opacity: 1 !important; }\nhtml.cx-ready .MuiSwitch-thumb { box-shadow: 0 2px 6px rgba(0, 0, 0, .4); }\nhtml.cx-ready .MuiSlider-root { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiSlider-thumb { box-shadow: 0 0 0 6px var(--dx-a-soft); }\nhtml.cx-ready .MuiLinearProgress-root { background: rgba(255, 255, 255, .1) !important; border-radius: 999px; height: 6px; }\nhtml.cx-ready .MuiLinearProgress-bar { background: var(--dx-a) !important; border-radius: 999px; }\nhtml.cx-ready .MuiCircularProgress-root { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiFormControlLabel-label { color: #e0e0e6; }\n\n/* buttons */\nhtml.cx-ready .MuiButton-outlined { background: rgba(255, 255, 255, .05) !important; color: #f2f2f5 !important; border: 1px solid rgba(255, 255, 255, .14) !important; }\nhtml.cx-ready .MuiButton-outlined:hover { background: rgba(255, 255, 255, .1) !important; }\nhtml.cx-ready .MuiButton-text { color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiButton-text:hover { background: var(--dx-a-soft) !important; }\nhtml.cx-ready .MuiButton-containedError, html.cx-ready .MuiButton-colorError.MuiButton-contained { background: rgba(255, 255, 255, .06) !important; color: #f2f2f5 !important; border: 1px solid rgba(255, 255, 255, .16) !important; }\nhtml.cx-ready .MuiButton-containedError:hover { background: rgba(255, 255, 255, .12) !important; }\nhtml.cx-ready .MuiFab-root { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .MuiToggleButton-root { border-color: var(--dx-line) !important; color: #c4c4cc; border-radius: 12px !important; }\nhtml.cx-ready .MuiToggleButton-root.Mui-selected { background: var(--dx-a-soft) !important; color: #fff !important; }\n\n/* tabs, chips, badges, tooltips, alerts */\nhtml.cx-ready .MuiTabs-indicator { background: var(--dx-a) !important; height: 3px; border-radius: 3px; }\nhtml.cx-ready .MuiTab-root { text-transform: none !important; font-weight: 600; color: #9a9aa4; }\nhtml.cx-ready .MuiTab-root.Mui-selected { color: #fff !important; }\nhtml.cx-ready .MuiChip-root { background: rgba(255, 255, 255, .09) !important; color: #e8e8ec !important; font-weight: 600; }\nhtml.cx-ready .MuiChip-colorPrimary { background: var(--dx-a-soft) !important; color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiBadge-colorPrimary { background: var(--dx-a) !important; color: #fff !important; }\nhtml.cx-ready .MuiTooltip-tooltip { background: rgba(30, 30, 36, .96) !important; border: 1px solid var(--dx-line); border-radius: 10px !important; font-size: 12.5px; backdrop-filter: blur(10px); }\nhtml.cx-ready .MuiAlert-root { border-radius: 16px !important; border: 1px solid var(--dx-line); background: #1c1c21 !important; color: #e8e8ec !important; }\nhtml.cx-ready .MuiAlert-standardError { background: rgba(211, 59, 59, .14) !important; border-color: rgba(211, 59, 59, .35); }\nhtml.cx-ready .MuiAlert-standardWarning { background: rgba(255, 170, 40, .12) !important; border-color: rgba(255, 170, 40, .3); }\nhtml.cx-ready .MuiAlert-standardSuccess { background: rgba(60, 200, 120, .12) !important; border-color: rgba(60, 200, 120, .3); }\nhtml.cx-ready .MuiSnackbarContent-root { background: #26262c !important; border-radius: 14px !important; }\n\n/* dialogs and menus */\nhtml.cx-ready .MuiDialog-paper { background: linear-gradient(180deg, #202026, #17171b) !important; border: 1px solid rgba(255, 255, 255, .09) !important; border-radius: 24px !important; box-shadow: 0 40px 100px rgba(0, 0, 0, .7) !important; }\nhtml.cx-ready .MuiDialogTitle-root { font-weight: 800 !important; letter-spacing: -.01em; }\nhtml.cx-ready .MuiBackdrop-root:not(.MuiBackdrop-invisible) { background: rgba(0, 0, 0, .62) !important; backdrop-filter: blur(6px); }\nhtml.cx-ready .MuiMenuItem-root.Mui-selected { background: var(--dx-a-soft) !important; }\nhtml.cx-ready .MuiMenuItem-root:hover { background: rgba(255, 255, 255, .08) !important; }\n\n/* classic (non-React) admin screens: sections, lists, inputs */\nhtml.cx-ready .content-primary, html.cx-ready .content-secondary { max-width: 1500px; }\nhtml.cx-ready #dashboardPage .content-primary, html.cx-ready #dashboardPage .content-secondary { max-width: none; }\nhtml.cx-ready .verticalSection, html.cx-ready .detailSection { margin-bottom: 30px; }\nhtml.cx-ready .paperList { background: var(--dx-card) !important; border: 1px solid var(--dx-line); }\nhtml.cx-ready .listItem-content, html.cx-ready .listItemBody { color: #e8e8ec; }\nhtml.cx-ready .fieldDescription, html.cx-ready .listItemBodyText.secondary { color: #8f8f99 !important; }\nhtml.cx-ready .inputLabel, html.cx-ready .selectLabel { color: #9a9aa4 !important; }\nhtml.cx-ready .emby-select-withcolor, html.cx-ready .emby-select { border-radius: 14px !important; }\nhtml.cx-ready .emby-checkbox:checked + span + .checkboxOutline { background: var(--dx-a) !important; border-color: var(--dx-a) !important; }\nhtml.cx-ready .emby-radio:checked + span + .radioOutline .radioOutlineInner, html.cx-ready .emby-radio:checked + span::before { background: var(--dx-a) !important; }\nhtml.cx-ready .itemProgressBar .itemProgressBarForeground, html.cx-ready .innerCardFooter .itemProgressBarForeground { background: var(--dx-a) !important; }\nhtml.cx-ready .backgroundProgress { background: rgba(255, 255, 255, .1) !important; }\nhtml.cx-ready .backgroundProgress .progressBarForeground, html.cx-ready .taskProgressInner { background: var(--dx-a) !important; }\nhtml.cx-ready .raised.button-accent, html.cx-ready .button-accent { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .button-delete, html.cx-ready .btnDelete { color: #ff7b7b !important; }\nhtml.cx-ready .toast, html.cx-ready .toastContainer .toast { background: #26262c !important; border-radius: 14px !important; }\nhtml.cx-ready .selectionCommandsPanel { background: #1c1c21 !important; }\nhtml.cx-ready .listItemIcon.listItemIcon-transparent, html.cx-ready .material-icons.listItemIcon { color: var(--dx-a-text); }\n\nhtml.cx-ready input[type=range] { accent-color: var(--dx-a); }\nhtml.cx-ready .dashboardColumn .cardBox, html.cx-ready .dashboardSection .card { background: var(--dx-card) !important; }\n\n/* classic cards with colourful default backgrounds (users, libraries, devices) */\nhtml.cx-ready [class*=\"defaultCardBackground\"]:not([style*=\"url(\"]) { background: linear-gradient(135deg, #34343d, #1f1f25 80%) !important; color: rgba(255, 255, 255, .9) !important; }\nhtml.cx-ready [class*=\"defaultCardBackground\"] .cardImageIcon, html.cx-ready [class*=\"defaultCardBackground\"] .material-icons { color: rgba(255, 255, 255, .85) !important; text-shadow: 0 8px 20px rgba(0, 0, 0, .4); }\nhtml.cx-ready .card .cardContent, html.cx-ready .cardBox { border-radius: 18px; }\nhtml.cx-ready .cardBox { background: var(--dx-card) !important; border: 1px solid var(--dx-line); overflow: hidden; transition: border-color .2s, transform .2s; }\nhtml.cx-ready .cardBox:hover { border-color: rgba(255, 255, 255, .16); }\nhtml.cx-ready .cardFooter, html.cx-ready .cardText { color: #d4d4da; }\n\n/* app bar + drawer: flat, full width, no card rounding */\nhtml.cx-ready .MuiAppBar-root.MuiPaper-root { border-radius: 0 !important; background: rgba(12, 12, 14, .88) !important; backdrop-filter: blur(18px) saturate(1.2); border: 0 !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAppBar-root .MuiToolbar-root { min-height: 56px; padding: 0 20px; }\nhtml.cx-ready .MuiDrawer-paper.MuiPaper-root, html.cx-ready .MuiDrawer-root .MuiPaper-root { border-radius: 0 !important; border: 0 !important; border-right: 1px solid rgba(255,255,255,.07) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAppBar-root .MuiIconButton-root { width: 40px; height: 40px; }\nhtml.cx-ready .MuiAppBar-root .MuiAvatar-root { width: 34px; height: 34px; }\nhtml.cx-ready main.MuiBox-root, html.cx-ready .skinBody { max-width: none !important; }\nhtml.cx-ready #dashboardPage .padded-left, html.cx-ready .dashboardContent { padding-left: clamp(16px, 2vw, 36px); padding-right: clamp(16px, 2vw, 36px); }\nhtml.cx-ready .dashboardColumn { max-width: none; }\n\n/* drawer header (server name + version) */\nhtml.cx-ready .MuiDrawer-paper a.MuiListItemButton-root[href=\"#/\"] { background: none !important; border: 0 !important; box-shadow: none !important; margin: 12px 10px 8px !important; padding: 8px 10px !important; gap: 12px; align-items: center; }\nhtml.cx-ready .MuiDrawer-paper a.MuiListItemButton-root[href=\"#/\"]:hover { background: rgba(255,255,255,.05) !important; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemIcon-root { min-width: 0 !important; margin: 0; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] img { width: 36px; height: 36px; object-fit: contain; display: block; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-root { margin: 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-primary { font-size: 17px !important; font-weight: 800 !important; line-height: 1.15; letter-spacing: -.01em; margin: 0; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-secondary { font-size: 12px !important; line-height: 1.1; color: #8a8a94 !important; margin: 0; }\n\n/* ---------- Discover filter bar + genre tiles ---------- */\n.dc-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 6px var(--pad) 26px; padding: 10px; border-radius: 22px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); backdrop-filter: blur(14px); }\n.dc-segs { display: inline-flex; padding: 4px; border-radius: 999px; background: rgba(255,255,255,.07); gap: 2px; }\n.dc-seg { height: 36px; padding: 0 18px; border-radius: 999px; background: transparent; color: #c9c9d0; font: inherit; font-weight: 600; font-size: 14px; cursor: pointer; border: 0; transition: background .2s, color .2s; }\n.dc-seg:hover { color: #fff; }\n.dc-seg.on { background: #fff; color: #000; box-shadow: 0 4px 14px rgba(0,0,0,.35); }\n.dc-sel { position: relative; }\n.dc-sel select { appearance: none; -webkit-appearance: none; height: 44px; min-width: 150px; padding: 0 40px 0 18px; border-radius: 999px; background: rgba(255,255,255,.07); color: #f2f2f5; font: inherit; font-weight: 600; font-size: 14px; border: 1px solid transparent; cursor: pointer; color-scheme: dark; transition: background .2s, border-color .2s; }\n.dc-sel select:hover { background: rgba(255,255,255,.11); }\n.dc-sel select:focus { outline: 0; border-color: rgba(255,255,255,.4); }\n.dc-sel::after { content: ''; position: absolute; right: 18px; top: 50%; width: 7px; height: 7px; border: solid #c9c9d0; border-width: 0 2px 2px 0; transform: translateY(-70%) rotate(45deg); pointer-events: none; }\n.dc-tg { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #d6d6dc; padding: 0 6px; user-select: none; }\n.dc-tg input { position: absolute; opacity: 0; pointer-events: none; }\n.dc-tg i { position: relative; width: 40px; height: 24px; border-radius: 999px; background: #44444c; transition: background .2s; flex: none; }\n.dc-tg i::after { content: ''; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.4); transition: transform .2s; }\n.dc-tg input:checked + i { background: var(--accent-nf, #e50914); }\n.dc-tg input:checked + i::after { transform: translateX(16px); }\n.dc-tg input:focus-visible + i { box-shadow: 0 0 0 3px rgba(255,255,255,.35); }\n.dc-q { position: relative; flex: 1 1 220px; min-width: 200px; }\n.dc-q svg { position: absolute; left: 16px; top: 50%; width: 18px !important; height: 18px !important; transform: translateY(-50%); opacity: .6; pointer-events: none; }\n.dc-bar .dc-q input[type=text] { width: 100%; box-sizing: border-box; height: 44px; padding: 0 18px 0 44px !important; border-radius: 999px !important; background: rgba(255,255,255,.07) !important; color: #fff; border: 1px solid transparent; font: inherit; font-size: 14px; transition: background .2s, border-color .2s; }\n.dc-bar .dc-q input[type=text]:focus { outline: 0; background: rgba(255,255,255,.1) !important; border-color: rgba(255,255,255,.4); }\n.dc-tiles-w { margin: 0 var(--pad) 30px; }\n.dc-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 12px; }\n.dc-tile { position: relative; height: 84px; border-radius: 16px; border: 0; cursor: pointer; overflow: hidden; text-align: left; padding: 0 18px; color: #fff; font: inherit; background: linear-gradient(135deg, color-mix(in srgb, var(--c) 85%, #000) 0%, color-mix(in srgb, var(--c) 45%, #0b0b0d) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.14); transition: transform .2s, box-shadow .2s, filter .2s; }\n.dc-tile::after { content: ''; position: absolute; right: -22px; bottom: -34px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,.12); }\n.dc-tile b { position: relative; z-index: 1; font-size: 16px; font-weight: 800; letter-spacing: -.01em; text-shadow: 0 2px 10px rgba(0,0,0,.35); }\n.dc-tile:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 34px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2); filter: brightness(1.08); }\n@media (max-width: 700px) { .dc-bar { margin-inline: 12px; } .dc-tiles { grid-template-columns: repeat(2, 1fr); } .dc-tiles-w { margin-inline: 12px; } .dc-bar .dc-q { flex-basis: 100%; } }\n\n/* ---------- new row types: Top 10, spotlight, genre tiles ---------- */\n.nf-card.t10c { margin-left: 74px; }\n.nf-card.t10c .n { position: absolute; left: -78px; bottom: 34px; z-index: 0; font-size: clamp(120px, 10.5vw, 180px); line-height: .8; width: 80px; text-align: right; font-weight: 900; letter-spacing: -.08em; color: #0b0b0d; -webkit-text-stroke: 3px #6b6b73; pointer-events: none; font-family: Inter, sans-serif; transition: -webkit-text-stroke-color .25s; }\n.nf-card.t10c:hover .n { -webkit-text-stroke-color: #fff; }\n.nf-card.t10c .im, .nf-card.t10c .title { position: relative; z-index: 1; }\n.nf-row.top10 .nf-card.t10c:nth-child(n+10) { margin-left: 120px; } .nf-row.top10 .nf-card.t10c:nth-child(n+10) .n { left: -128px; }\n.nf-card.thumb.spot { width: clamp(280px, 30vw, 520px); }\n.nf-card.spot .im { border-radius: 18px; overflow: hidden; }\n.nf-card.spot .im::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.25) 38%, transparent 60%); pointer-events: none; z-index: 1; }\n.spot-info { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 16px 18px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }\n.spot-info b { font-size: clamp(17px, 1.5vw, 24px); font-weight: 800; letter-spacing: -.02em; text-shadow: 0 2px 14px rgba(0,0,0,.7); }\n.spot-logo { max-width: 60%; max-height: 64px; object-fit: contain; filter: drop-shadow(0 4px 14px rgba(0,0,0,.7)); }\n.spot-info small { color: #d6d6dc; font-weight: 600; font-size: 12.5px; }\n.nf-card.spot .title { display: none; }\n.nf-row.tiles .nf-card.gtile { width: clamp(150px, 14vw, 240px); height: clamp(78px, 7.4vw, 120px); border-radius: 16px; display: flex; align-items: flex-end; padding: 14px 16px; box-sizing: border-box; text-decoration: none; color: #fff; overflow: hidden; background: linear-gradient(135deg, color-mix(in srgb, var(--c) 88%, #000), color-mix(in srgb, var(--c) 40%, #0b0b0d)); box-shadow: inset 0 1px 0 rgba(255,255,255,.14); transition: transform .2s, filter .2s; }\n.nf-row.tiles .nf-card.gtile::after { content: ''; position: absolute; right: -26px; top: -30px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,.12); }\n.nf-row.tiles .nf-card.gtile b { position: relative; z-index: 1; font-size: 16px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,.4); }\n@media (hover: hover) { .nf-row.tiles .nf-card.gtile:hover { transform: translateY(-3px) scale(1.03); filter: brightness(1.1); } }\n@media (max-width: 700px) { .nf-card.t10c { margin-left: 56px; } .nf-card.t10c .n { font-size: 110px; left: -58px; } .nf-card.thumb.spot { width: 78vw; } }\nhtml.cx-tv .nf-card.t10c .n { font-size: 130px; }\n\n/* ---------- search page ---------- */\n.srx-page > h1 { font-size: clamp(26px, 3vw, 40px); font-weight: 800; letter-spacing: -.02em; margin-bottom: 18px; }\n.srx-top { position: relative; min-height: 300px; border-radius: 24px; overflow: hidden; margin: 8px 0 30px; cursor: pointer; display: flex; align-items: flex-end; background: #1a1a1e; box-shadow: 0 24px 60px rgba(0,0,0,.45); }\n.srx-top-bg { position: absolute; inset: 0; background-size: cover; background-position: center 25%; transition: transform .6s; }\n.srx-top:hover .srx-top-bg { transform: scale(1.04); }\n.srx-top::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(11,11,13,.92) 0%, rgba(11,11,13,.55) 50%, rgba(11,11,13,.1) 100%), linear-gradient(0deg, rgba(11,11,13,.7), transparent 55%); }\n.srx-top-in { position: relative; z-index: 2; padding: clamp(22px, 3vw, 44px); max-width: 640px; }\n.srx-top-in small { text-transform: uppercase; letter-spacing: .14em; font-weight: 700; color: #b9b9c2; font-size: 11.5px; }\n.srx-top-in h2 { margin: 6px 0 10px; font-size: clamp(26px, 3.4vw, 46px); font-weight: 900; letter-spacing: -.03em; line-height: 1.05; }\n.srx-top-in p { margin: 12px 0 18px; color: #dcdce2; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\n.srx-h { font-size: 20px; font-weight: 800; margin: 26px 0 14px; }\n.nf-card.person { width: clamp(120px, 10vw, 170px); text-decoration: none; color: inherit; text-align: center; }\n.nf-card.person .pi { aspect-ratio: 1; border-radius: 50%; background-size: cover; background-position: center top; background-color: #26262b; box-shadow: 0 10px 28px rgba(0,0,0,.4); transition: transform .25s; }\n.nf-card.person:hover .pi { transform: scale(1.05); }\n.nf-card.person .title { margin-top: 10px; justify-content: center; }\n.srx-people { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }\n\n/* ---------- lyrics panel ---------- */\n.sp-lyrics { display: flex; flex-direction: column; }\n.lyr-song { display: flex; flex-direction: column; margin: 6px 0 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.08); min-width: 0; }\n.lyr-song span { color: #9a9aa4; font-size: 13px; }\n.lyr-body { flex: 1; overflow-y: auto; padding: 22vh 4px 30vh; scrollbar-width: none; mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent); -webkit-mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent); }\n.lyr-body::-webkit-scrollbar { display: none; }\n.lyr-l { margin: 0 0 14px; font-size: clamp(20px, 1.7vw, 28px); line-height: 1.25; font-weight: 800; letter-spacing: -.02em; color: #e8e8ec; transition: color .3s, transform .3s, opacity .3s; transform-origin: left center; }\n.lyr-l.gap { opacity: .35; }\n.lyr-body.sync .lyr-l { color: #5d5d66; cursor: pointer; }\n.lyr-body.sync .lyr-l.past { color: #7d7d86; }\n.lyr-body.sync .lyr-l.on { color: #fff; transform: scale(1.04); }\n.lyr-body.sync .lyr-l:hover:not(.on) { color: #b7b7c0; }\n\n/* ---------- music: sidebar, player, details ---------- */\n#cx-sp .sp-side { background: #0a0a0c; gap: 0; padding: 0; border-right: 1px solid rgba(255,255,255,.06); }\n#cx-sp .sp-side .sp-card { background: transparent; border-radius: 0; box-shadow: none; }\n#cx-sp .sp-side .sp-top { padding: 18px 12px 10px; border-bottom: 1px solid rgba(255,255,255,.06); }\n#cx-sp .sp-navlink { border-radius: 12px; padding: 11px 14px; font-weight: 600; transition: background .15s, color .15s; }\n#cx-sp .sp-navlink:hover { background: rgba(255,255,255,.07); }\n#cx-sp .sp-navlink.on { background: rgba(255,255,255,.1); color: #fff; }\n#cx-sp .sp-navlink svg { width: 22px; height: 22px; }\n#cx-sp .sp-lib { padding: 8px 6px 0; }\n#cx-sp .sp-li { position: relative; border-radius: 12px; }\n#cx-sp .sp-li .art { position: relative; }\n#cx-sp .li-play { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.55); border-radius: inherit; opacity: 0; transition: opacity .15s; }\n#cx-sp .li-play svg { width: 22px; height: 22px; fill: #fff; }\n@media (hover: hover) { #cx-sp .sp-li:hover .li-play { opacity: 1; } }\n#cx-sp .sp-main { border-radius: 0; }\n/* one consistent icon language in the player: 20px outline, big ones filled */\n#cx-sp .sp-player .pl-btn svg { width: 20px; height: 20px; stroke-width: 1.8; }\n#cx-sp .sp-player .pl-r { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }\n#cx-sp .sp-player .pl-r .pl-btn { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; }\n#cx-sp .sp-player .pl-r .pl-btn:hover { background: rgba(255,255,255,.08); }\n#cx-sp .sp-player { align-items: center; }\n.sp-lyrics .pl-btn, .sp-queue .pl-btn { width: 34px; height: 34px; display: grid; place-items: center; }\n/* download queue */\n.dl-list { display: flex; flex-direction: column; gap: 8px; max-width: 820px; }\n.dl-row { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 14px; background: rgba(255,255,255,.05); }\n.dl-row .cv { width: 52px; height: 52px; border-radius: 8px; background-size: cover; background-color: #26262b; flex: none; }\n.dl-row .tx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }\n.dl-row .tx span { color: #9a9aa4; font-size: 13px; }\n.dl-row .bar { height: 4px; border-radius: 4px; background: rgba(255,255,255,.12); overflow: hidden; margin-top: 4px; }\n.dl-row .bar i { display: block; height: 100%; background: var(--accent-nf, #1ed760); border-radius: 4px; }\n.dl-row em { font-style: normal; font-weight: 700; color: #cfcfd5; }\n.nf-card.spot { cursor: pointer; transition: transform .25s, box-shadow .25s; }\n@media (hover: hover) { .nf-card.spot:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 18px 44px rgba(0,0,0,.55); } }\n.nf-card.spot .im .info { display: none !important; }\n\n/* ---------- music on phones: closer to the real Spotify app ---------- */\n@media (max-width: 800px) {\n  #cx:not(.mode-nf) .cx-tabs { left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; border-radius: 0 !important; border: 0 !important; margin: 0 !important; padding: 8px 4px calc(8px + env(safe-area-inset-bottom)) !important; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.92) 38%, #000 100%) !important; backdrop-filter: none !important; box-shadow: none !important; justify-content: space-around; }\n  #cx:not(.mode-nf) .cx-tabs a { font-size: 10.5px; gap: 4px; color: #a7a7ad; font-weight: 500; }\n  #cx:not(.mode-nf) .cx-tabs a.on { color: #fff; }\n  #cx:not(.mode-nf) .cx-tabs a svg { width: 24px; height: 24px; }\n  #cx-sp .sp-header { padding: 10px 14px; }\n  #cx-sp .sp-chip { height: 32px; padding: 0 14px; font-size: 13.5px; font-weight: 600; border-radius: 999px; background: #2a2a2e; color: #fff; display: inline-flex; align-items: center; }\n  #cx-sp .sp-chip.on { background: #1ed760; color: #000; }\n  .sp-mini { margin: 0 8px 62px !important; border-radius: 10px !important; background: var(--tint, #3a2a2a) !important; box-shadow: 0 6px 18px rgba(0,0,0,.45); }\n  .dl-row { padding: 8px 10px; }\n}\n\n.sp-full .f-lyr { margin: 22px 16px 28px; padding: 16px 18px 20px; border-radius: 16px; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); cursor: pointer; }\n.sp-full .f-lyr b { font-size: 13px; letter-spacing: .02em; opacity: .85; }\n.sp-full .f-lyr .ln { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }\n.sp-full .f-lyr p { margin: 0; font-size: 19px; line-height: 1.3; font-weight: 800; color: rgba(255,255,255,.5); letter-spacing: -.01em; }\n.sp-full .f-lyr p.on { color: #fff; }\n.sp-full { overflow-y: auto; }\n\n/* track list (desktop): header and rows share one grid, number, time and actions line up */\n@media (min-width: 801px) {\n.sp-th, .sp-row { grid-template-columns: 28px minmax(0, 6fr) minmax(0, 4fr) 150px !important; column-gap: 16px; }\n.sp-th.noalb, .sp-row.noalb { grid-template-columns: 28px minmax(0, 1fr) 150px !important; }\n.sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }\n.sp-row .du .tm { min-width: 42px; text-align: right; font-variant-numeric: tabular-nums; }\n.sp-th > :last-child { text-align: right; padding-right: 50px; }\n.sp-row .ti, .sp-row .tx { min-width: 0; }\n.sp-row .du .lk, .sp-row .du .mo { width: 32px; height: 32px; display: grid; place-items: center; }\n.sp-th > :first-child { text-align: center; }\n.sp-row .ix { display: grid; place-items: center; width: 28px; justify-self: center; }\n.sp-row .ix .n, .sp-row .ix .pl, .sp-row .ix .eq { grid-area: 1 / 1; }\n}\n/* seek bars: always a visible knob on touch screens */\n@media (max-width: 800px), (pointer: coarse) { .bar b { opacity: 1 !important; width: 12px; height: 12px; top: 50%; transform: translateY(-50%); } .bar { min-height: 16px; display: flex; align-items: center; position: relative; } }\n/* full-screen player on phones */\n@media (max-width: 800px) {\n  #cx .sp-full.open { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; max-width: none !important; border-radius: 0 !important; padding-left: 22px; padding-right: 22px; box-sizing: border-box; }\n  .sp-full .top { height: 52px; }\n  .sp-full .top .tops { display: flex; gap: 4px; }\n  .sp-full .top .pl-btn { width: 44px; height: 44px; display: grid; place-items: center; }\n  .sp-full .top .pl-btn svg { width: 24px !important; height: 24px !important; stroke-width: 1.8; }\n  .sp-full .cvbig { margin: 18px auto 34px !important; }\n  .sp-full .meta { margin: 0 auto 14px !important; padding-top: 2px; }\n  .sp-full .ctr .pl-btn:not(.big) svg { width: 26px; height: 26px; stroke-width: 1.8; }\n  #cx-sp .sp-header .sp-chips { flex: 1; min-width: 0; overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent); mask-image: linear-gradient(90deg, #000 88%, transparent); padding-right: 24px; }\n  #cx-sp .sp-header .sp-chips::-webkit-scrollbar { display: none; }\n  #cx-sp .sp-header .sp-chip { flex: none; }\n}\n/* lyrics + queue as a full-screen layer above the player on phones */\n@media (max-width: 800px) {\n  #cx > .sp-queue { position: fixed; inset: 0; z-index: 9800; width: 100%; height: 100dvh; border-radius: 0; padding: max(14px, env(safe-area-inset-top)) 22px 0; box-sizing: border-box; background: linear-gradient(180deg, var(--tint, #4a3a2a), #121212 92%); display: flex; flex-direction: column; overflow: hidden; }\n  #cx > .sp-queue:not(.sp-lyrics) { overflow-y: auto; display: block; }\n}\n.lyr-foot { padding: 10px 0 calc(18px + env(safe-area-inset-bottom, 0)); display: flex; flex-direction: column; gap: 10px; background: linear-gradient(0deg, rgba(18,18,18,.96) 60%, transparent); }\n.lyr-ctr { display: flex; justify-content: center; align-items: center; gap: 26px; }\n.lyr-ctr .pl-btn { width: 44px; height: 44px; display: grid; place-items: center; }\n.lyr-ctr .pl-btn.big { width: 60px; height: 60px; border-radius: 50%; background: #fff; color: #000; }\n.lyr-ctr .pl-btn.big svg { fill: #000; }\n.sp-lyrics .lyr-body { flex: 1 1 0; min-height: 0; }\n.sp-lyrics .lyr-song { border: 0; }\n\n/* ---------- phones: lists, chips, mini player, full player ---------- */\n@media (max-width: 800px) {\n  #cx-sp .sp-header { width: 100%; box-sizing: border-box; }\n  #cx-sp .sp-header > div[style*=\"flex:1\"] { display: none; }\n  #cx-sp .sp-header .sp-chips { -webkit-mask-image: linear-gradient(90deg, #000 94%, transparent); mask-image: linear-gradient(90deg, #000 94%, transparent); }\n  /* mini player sits directly on the tab bar */\n  #cx .sp-mini { bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important; margin: 0 8px !important; height: 58px; gap: 6px; padding-right: 4px; }\n  #cx .sp-mini .mlike .pl-btn, #cx .sp-mini .mlike button { width: 38px; height: 38px; display: grid; place-items: center; color: #fff; }\n  #cx .sp-mini .mlike svg { width: 22px; height: 22px; }\n  #cx .sp-mini .mbar { position: absolute; left: 10px; right: 10px; bottom: 0; height: 22px; background: none; touch-action: none; display: flex; align-items: flex-end; padding-bottom: 3px; box-sizing: border-box; }\n  #cx .sp-mini .mtrack { position: relative; width: 100%; height: 3px; border-radius: 3px; background: rgba(255,255,255,.38); }\n  #cx .sp-mini .mbar i { position: absolute; left: 0; top: 0; height: 100%; width: 0; background: #fff; border-radius: 3px; }\n  #cx .sp-mini .mknob { position: absolute; top: 50%; width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.5); left: 0; transition: transform .15s; }\n  #cx .sp-mini .mbar.drag .mknob { transform: scale(1.5); }\n  #cx .sp-mini .mbar.drag .mtrack { height: 5px; }\n  /* full player: slides up from the mini player, controls near the bottom like Spotify */\n  #cx:not(.mode-nf) .sp-full { display: flex !important; transform: translateY(100%); visibility: hidden; transition: transform .45s cubic-bezier(.22,.9,.2,1), visibility 0s linear .45s; animation: none !important; }\n  #cx:not(.mode-nf) .sp-full.open { transform: none; visibility: visible; transition: transform .45s cubic-bezier(.22,.9,.2,1), visibility 0s; }\n  .sp-full .cvbig { transform: scale(.9); opacity: .4; transition: transform .6s cubic-bezier(.22,.9,.2,1) .08s, opacity .45s .08s; }\n  .sp-full.open .cvbig { transform: none; opacity: 1; }\n  .sp-full .top, .sp-full .meta, .sp-full .seekwrap, .sp-full .ctr, .sp-full .f-lyr { transition: opacity .4s .12s, transform .5s cubic-bezier(.22,.9,.2,1) .1s; }\n  .sp-full:not(.open) .meta, .sp-full:not(.open) .seekwrap, .sp-full:not(.open) .ctr, .sp-full:not(.open) .f-lyr { opacity: 0; transform: translateY(24px); }\n  .sp-full.open { justify-content: flex-start; }\n  .sp-full .cvbig { flex: 0 1 auto; max-height: 46vh; }\n  .sp-full .meta { margin-top: auto !important; }\n  .sp-full .ctr { margin-bottom: 8px !important; }\n  .sp-full .f-lyr { margin: 14px 0 6px; }\n  /* song lists on phones keep their own compact layout */\n  .sp-row { grid-template-columns: minmax(0, 1fr) auto !important; column-gap: 10px; }\n  .sp-row .ix, .sp-row .al { display: none !important; }\n  .sp-row .ti { min-width: 0; }\n  .sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }\n  .sp-row .du .tm { display: none; }\n  .sp-row .du .lk, .sp-row .du .mo { width: 38px; height: 38px; display: grid; place-items: center; }\n}\n/* lyrics + queue panel: one left edge, empty state, controls at the bottom */\n.sp-queue, .sp-lyrics { padding-left: 20px; padding-right: 20px; }\n.sp-queue h3, .sp-lyrics h3 { margin: 0; padding: 0; font-size: 17px; }\n.lyr-song { padding: 4px 0 12px; }\n.sp-lyrics > .nf-empty { flex: 1; display: grid; place-items: center; padding: 0 !important; }\n.lyr-foot { margin-top: auto; }\n@media (max-width: 800px) { #cx > .sp-lyrics .lyr-body { flex: 1 1 0; } }\n.sp-tile .cv { margin: 0 0 14px; }\n\n/* ---------- scroll performance ---------- */\n#cx .nf-card .im { will-change: auto; }\n/* spotlight: labels readable on any backdrop */\n.nf-card.spot .im::after { background: linear-gradient(0deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.55) 34%, rgba(0,0,0,.12) 62%, transparent) !important; }\n.spot-info small { display: inline-block; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff !important; text-shadow: 0 1px 3px rgba(0,0,0,.8); backdrop-filter: blur(6px); }\n.spot-info b { text-shadow: 0 2px 12px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.8); }\n/* top 10: a static heavy font (the variable font drew its overlapping contours inside the outline) */\n.nf-card.t10c .n { font-family: \"Arial Black\", \"Helvetica Neue\", Impact, Arial, sans-serif !important; font-weight: 900 !important; letter-spacing: -.06em; -webkit-text-stroke: 0; color: #0b0b0d; paint-order: stroke fill; text-shadow: -3px -3px 0 #6b6b73, 3px -3px 0 #6b6b73, -3px 3px 0 #6b6b73, 3px 3px 0 #6b6b73, 0 -3px 0 #6b6b73, 0 3px 0 #6b6b73, -3px 0 0 #6b6b73, 3px 0 0 #6b6b73; width: auto; min-width: 80px; }\n.nf-card.t10c:hover .n { text-shadow: -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0 -3px 0 #fff, 0 3px 0 #fff, -3px 0 0 #fff, 3px 0 0 #fff; }\n\n/* selected genre (Discover tiles, home tiles with the remote) */\n.dc-tile.on { outline: 3px solid #fff; outline-offset: 3px; }\n.dc-tile:focus-visible, .nf-row.tiles .nf-card.gtile:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }\nhtml.cx-tv .nf-row.tiles .nf-card.gtile.tvf-on { outline: 4px solid #fff; outline-offset: 4px; transform: scale(1.04); filter: brightness(1.12); box-shadow: 0 0 0 1px rgba(255,255,255,.2), 0 18px 44px rgba(0,0,0,.55); z-index: 3; }\nhtml.cx-tv .nf-row.tiles .nf-card.gtile { transition: transform .18s ease, outline-color .18s ease, filter .18s ease; }\n/* TV Top 10: room for the first number */\nhtml.cx-tv .nf-row.top10 .nf-scroller { padding-left: 150px !important; }\nhtml.cx-tv .nf-row.top10 .nf-card.t10c:first-child { margin-left: 0 !important; }\n/* dashboard: breathing room under the app bar */\nhtml.cx-ready main.MuiBox-root > :first-child { margin-top: 14px; }\nhtml.cx-ready #dashboardPage, html.cx-ready .dashboardContent { padding-top: 12px; }\n\n/* ratings placeholder: same height as the finished chips */\n.rt-row.rt-ph { min-height: 34px; align-items: center; }\n.rt-chip.sk { width: 150px; height: 30px; border-radius: 999px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06)); background-size: 200% 100%; animation: rtsk 1.2s linear infinite; }\n@keyframes rtsk { to { background-position: -200% 0; } }\n.rt-row.rt-in .rt-chip { animation: cxfade .3s both; }\n/* TV: lighter focus visuals (outline only, no blurred glow on every card) */\nhtml.cx-tv .nf-card.tvf-on .im, html.cx-tv .nf-person.tvf-on .pi { box-shadow: none !important; transform: none !important; }\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { transition: none !important; }\n/* any other focused element (genre tiles, segmented buttons, switches...) still gets a visible ring */\nhtml.cx-tv #cx :where(.tvf-on):not(.nf-card):not(.nf-person):not(.btn):not(.sp-row):not(.sp-li):not(.sp-navlink):not(.sp-chip):not(.sp-card):not(.sp-top1):not(.pl-btn):not(.nf-chip):not(.cxd-chip):not(.cxd-opt):not(.cxd-res):not(.nf-ep):not(input):not(select):not(textarea):not(.set-switch) { outline: 4px solid #fff; outline-offset: 3px; border-radius: 14px; }\n\n/* ---------- video player: modern pass ---------- */\n#cx-player .pl-loadbg { position: absolute; inset: -6%; background-size: cover; background-position: center; filter: blur(30px) brightness(.4) saturate(1.2); opacity: 0; transition: opacity .5s; z-index: 0; pointer-events: none; }\n#cx-player.loading .pl-loadbg { opacity: 1; }\n#cx-player video { transition: opacity .4s; background: #000; }\n#cx-player.loading video { opacity: 0; }\n#cx-player .pl-center { z-index: 3; }\n#cx-player .pl-spin { width: 54px; height: 54px; border-width: 3px; }\n#cx-player .pl-bar { background: linear-gradient(0deg, rgba(0,0,0,.82), rgba(0,0,0,.45) 60%, transparent); padding-top: 54px; }\n#cx-player .pl-row { gap: 6px; align-items: center; }\n#cx-player .pl-row button { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; transition: background .15s, transform .15s; }\n#cx-player .pl-row button:hover { background: rgba(255,255,255,.14); }\n#cx-player .pl-row button:active { transform: scale(.92); }\n#cx-player .pl-row svg, #cx-player .pl-bigctl svg { width: 24px; height: 24px; stroke-width: 1.7; }\n#cx-player .pl-row .lu-skip, #cx-player .pl-bigctl .lu-skip { width: 28px; height: 28px; stroke-width: 1.7; }\n#cx-player .pl-pp { width: 48px !important; height: 48px !important; background: #fff !important; color: #000 !important; }\n#cx-player .pl-pp svg { fill: #000; stroke: #000; }\n#cx-player .pl-seek { height: 6px; border-radius: 6px; }\n#cx-player .pl-bigctl { gap: clamp(34px, 9vw, 90px); }\n#cx-player .pl-bigctl button { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.35); backdrop-filter: blur(8px); display: grid; place-items: center; }\n#cx-player .pl-bigctl .pl-bigpp { width: 84px; height: 84px; background: rgba(255,255,255,.95); color: #000; }\n#cx-player .pl-bigctl .pl-bigpp svg { width: 36px; height: 36px; fill: #000; stroke: #000; }\n#cx-player .pl-top { background: linear-gradient(180deg, rgba(0,0,0,.7), transparent); }\n#cx-player .pl-ttl .pl-title { font-weight: 800; letter-spacing: -.01em; }\n#cx-player .pl-settings { border-radius: 22px; background: rgba(22,22,26,.92); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.08); }\n.pl-stepper { display: inline-flex; align-items: center; gap: 6px; }\n.pl-stepper button { min-width: 44px; height: 38px; border-radius: 999px; background: rgba(255,255,255,.1); color: #fff; font-weight: 700; padding: 0 12px; }\n.pl-stepper button:hover { background: rgba(255,255,255,.2); }\n.pl-stepper .pl-delayv { min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; }\n.pl-seg button.on { background: #fff; color: #000; }\n\n/* ---------- scrollbars: slim, transparent track, thumb appears on hover ---------- */\nhtml.cx-ready, html.cx-ready * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.2) transparent; }\n@supports selector(::-webkit-scrollbar) {\n  html.cx-ready, html.cx-ready * { scrollbar-width: auto; scrollbar-color: auto; }\n  html.cx-ready ::-webkit-scrollbar, html.cx-login ::-webkit-scrollbar { width: 12px; height: 12px; background: transparent; }\n  html.cx-ready ::-webkit-scrollbar-track, html.cx-login ::-webkit-scrollbar-track { background: transparent; }\n  html.cx-ready ::-webkit-scrollbar-corner, html.cx-login ::-webkit-scrollbar-corner { background: transparent; }\n  html.cx-ready ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }\n  html.cx-ready ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0); border: 4px solid transparent; border-radius: 12px; background-clip: padding-box; min-height: 48px; min-width: 48px; transition: background-color .25s; }\n  html.cx-ready *:hover::-webkit-scrollbar-thumb, html.cx-ready ::-webkit-scrollbar-thumb:active { background-color: rgba(255,255,255,.22); }\n  html.cx-ready ::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.4); }\n  html.cx-ready body::-webkit-scrollbar-thumb, html.cx-ready html::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.16); }\n}\n/* rows that already have arrows or are swiped: no bar at all */\n#cx .nf-scroller, #cx .sp-shelf, #cx .dc-bar, #cx .sp-chips, #cx .nf-seasons, #cx .nf-row-scroll { scrollbar-width: none; }\n#cx .nf-scroller::-webkit-scrollbar, #cx .sp-shelf::-webkit-scrollbar, #cx .dc-bar::-webkit-scrollbar, #cx .sp-chips::-webkit-scrollbar, #cx .nf-seasons::-webkit-scrollbar, #cx .nf-row-scroll::-webkit-scrollbar { display: none; height: 0; width: 0; }\n\n#cx-nf::-webkit-scrollbar-thumb, #cx-ui ::-webkit-scrollbar-thumb, .sp-scroll::-webkit-scrollbar-thumb, .cxd-body::-webkit-scrollbar-thumb, .sr-modal::-webkit-scrollbar-thumb, .set-main::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.2); }\n#cx-nf:hover::-webkit-scrollbar-thumb, .sp-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.38); }\n#cx-nf::-webkit-scrollbar-thumb:hover, .sp-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.5); }\n\n/* page asleep while the native TV player runs: no pictures kept in memory */\nhtml.cx-sleep #cx .bgi, html.cx-sleep #cx .nf-dback, html.cx-sleep #cx .nf-slide, html.cx-sleep #cx [style*=\"background-image\"] { background-image: none !important; }\nhtml.cx-sleep #cx img { visibility: hidden; content-visibility: hidden; }\n\nhtml.cx-tv .nf-row.cx-far .bgi, html.cx-tv .nf-sect.cx-far .bgi, html.cx-tv .nf-row.cx-far .pi { background-image: none !important; }\nhtml.cx-tv .nf-row { contain: layout style; }\n\n/* ---------- Letterboxd + archive ---------- */\n.dmark.seen { left: auto; right: 10px; background: rgba(30,215,96,.22); border-color: rgba(30,215,96,.5); color: #8cf0b0; }\n.dmark.arch { background: rgba(255,255,255,.14); }\n.sr-status .dmark { position: static; display: inline-flex; margin-right: 8px; }\n.arch-intro { max-width: 640px; color: #a8a8b2; margin: 0 0 22px; line-height: 1.55; }\n.nf-card.arch .im::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,.18); }\n.arch-steps { margin: 6px 0 14px; padding-left: 20px; color: #d6d6dc; line-height: 1.7; }\n.arch-size { margin: 0 0 12px; color: #c9c9d0; }\n.arch-opt { display: flex; gap: 10px; align-items: center; margin: 6px 0 12px; cursor: pointer; }\n.arch-warn { color: #e8b0b0; }\n.arch-hero { height: 180px; margin: -20px -26px 16px; background-size: cover; background-position: center 25%; -webkit-mask-image: linear-gradient(#000 60%, transparent); mask-image: linear-gradient(#000 60%, transparent); }\n.arch-top { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 16px; }\n.arch-poster { flex: none; width: 120px; aspect-ratio: 2/3; border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 10px 28px rgba(0,0,0,.5); }\n.arch-ov { margin: 0; color: #d4d4da; line-height: 1.55; }\n.lb-stat { color: #a8a8b2; font-size: 13.5px; }\n.set-p { margin: 0 0 14px; color: #a8a8b2; line-height: 1.55; font-size: 14px; }\n\n.nf-card .dmark.seen .dtx { display: none; } .nf-card .dmark.seen { padding: 5px 7px; }\n";
/* ---------- early: stylesheet + login skin (must not depend on anything else in this file) ---------- */
(function () {
  try { if (!document.getElementById('cx-style')) { const st = document.createElement('style'); st.id = 'cx-style'; st.textContent = CSS_TEXT; (document.head || document.documentElement).append(st); } } catch (e) { }
  try {
    const RE = /^#!?\/?(login|selectserver|addserver|forgotpassword|forgotpasswordpin|quickconnect)/i; const H = document.documentElement;
    const setBrand = n => { if (n) H.style.setProperty('--cx-brand', JSON.stringify(String(n).toUpperCase())); };
    try { setBrand(localStorage.getItem('cx-brand')); } catch (e) { }
    const tvApp = /CinemaTV/.test(navigator.userAgent);
    const upd = () => {
      if (H.classList.contains('cx-on') && !H.classList.contains('cx-login')) return; // signed in and showing the interface: nothing to detect
      const pg = document.querySelector('#loginPage, #selectServerPage, #forgotPasswordPage, #forgotPasswordPinPage'); const vis = !!(pg && pg.offsetParent !== null && !pg.classList.contains('hide'));
      const on = RE.test(location.hash) || /\/(login|selectserver|addserver|forgotpassword)(\.html)?\/?$/i.test(location.pathname) || vis; H.classList.toggle('cx-login', on);
      if (on && !upd.f) { upd.f = 1; fetch((location.pathname.split('/web')[0] || '') + '/System/Info/Public').then(r => r.json()).then(i => { setBrand(i.ServerName); try { localStorage.setItem('cx-brand', i.ServerName || ''); } catch (e) { } }).catch(() => { }); }
    };
    window.addEventListener('hashchange', upd); window.addEventListener('popstate', upd); upd(); setInterval(upd, 900); if (!tvApp) new MutationObserver(() => { if (!upd.t) upd.t = setTimeout(() => { upd.t = 0; upd(); }, 250); }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }
})();

/* Tabler icons (MIT license, https://tabler.io/icons) */
const LU = {"sun":"<path d=\"M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\"/> <path d=\"M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7\"/>","arrows-shuffle":"<path d=\"M18 4l3 3l-3 3\"/> <path d=\"M18 20l3 -3l-3 -3\"/> <path d=\"M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5\"/> <path d=\"M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3\"/>","badge-cc":"<path d=\"M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\"/> <path d=\"M10 10.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0\"/> <path d=\"M17 10.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0\"/>","books":"<path d=\"M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/> <path d=\"M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/> <path d=\"M5 8h4\"/> <path d=\"M9 16h4\"/> <path d=\"M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z\"/> <path d=\"M14 9l4 -1\"/> <path d=\"M16 16l3.923 -.98\"/>","calendar":"<path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z\"/> <path d=\"M16 3v4\"/> <path d=\"M8 3v4\"/> <path d=\"M4 11h16\"/> <path d=\"M11 15h1\"/> <path d=\"M12 15v3\"/>","check":"<path d=\"M5 12l5 5l10 -10\"/>","chevron-down":"<path d=\"M6 9l6 6l6 -6\"/>","chevron-left":"<path d=\"M15 6l-6 6l6 6\"/>","chevron-right":"<path d=\"M9 6l6 6l-6 6\"/>","compass":"<path d=\"M8 16l2 -6l6 -2l-2 6l-6 2\"/> <path d=\"M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\"/> <path d=\"M12 3l0 2\"/> <path d=\"M12 19l0 2\"/> <path d=\"M3 12l2 0\"/> <path d=\"M19 12l2 0\"/>","device-tv":"<path d=\"M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z\"/> <path d=\"M16 3l-4 4l-4 -4\"/>","dots":"<path d=\"M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/> <path d=\"M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/> <path d=\"M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\"/>","heart":"<path d=\"M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572\"/>","home":"<path d=\"M5 12l-2 0l9 -9l9 9l-2 0\"/> <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\"/> <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\"/>","info-circle":"<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\"/> <path d=\"M12 9h.01\"/> <path d=\"M11 12h1v4h1\"/>","language":"<path d=\"M4 5h7\"/> <path d=\"M9 3v2c0 4.418 -2.239 8 -5 8\"/> <path d=\"M5 9c0 2.144 2.952 3.908 6.7 4\"/> <path d=\"M12 20l4 -9l4 9\"/> <path d=\"M19.1 18h-6.2\"/>","list-details":"<path d=\"M13 5h8\"/> <path d=\"M13 9h5\"/> <path d=\"M13 15h8\"/> <path d=\"M13 19h5\"/> <path d=\"M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/> <path d=\"M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z\"/>","list-numbers":"<path d=\"M11 6h9\"/> <path d=\"M11 12h9\"/> <path d=\"M12 18h8\"/> <path d=\"M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4\"/> <path d=\"M6 10v-6l-2 2\"/>","list":"<path d=\"M9 6l11 0\"/> <path d=\"M9 12l11 0\"/> <path d=\"M9 18l11 0\"/> <path d=\"M5 6l0 .01\"/> <path d=\"M5 12l0 .01\"/> <path d=\"M5 18l0 .01\"/>","maximize":"<path d=\"M4 8v-2a2 2 0 0 1 2 -2h2\"/> <path d=\"M4 16v2a2 2 0 0 0 2 2h2\"/> <path d=\"M16 4h2a2 2 0 0 1 2 2v2\"/> <path d=\"M16 20h2a2 2 0 0 0 2 -2v-2\"/>","minimize":"<path d=\"M15 19v-2a2 2 0 0 1 2 -2h2\"/> <path d=\"M15 5v2a2 2 0 0 0 2 2h2\"/> <path d=\"M5 15h2a2 2 0 0 1 2 2v2\"/> <path d=\"M5 9h2a2 2 0 0 0 2 -2v-2\"/>","movie":"<path d=\"M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z\"/> <path d=\"M8 4l0 16\"/> <path d=\"M16 4l0 16\"/> <path d=\"M4 8l4 0\"/> <path d=\"M4 16l4 0\"/> <path d=\"M4 12l16 0\"/> <path d=\"M16 8l4 0\"/> <path d=\"M16 16l4 0\"/>","music":"<path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\"/> <path d=\"M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\"/> <path d=\"M9 17v-13h10v13\"/> <path d=\"M9 8h10\"/>","pencil":"<path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\"/> <path d=\"M13.5 6.5l4 4\"/>","picture-in-picture":"<path d=\"M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4\"/> <path d=\"M14 14m0 1a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z\"/>","player-pause":"<path d=\"M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/> <path d=\"M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z\"/>","player-play":"<path d=\"M7 4v16l13 -8z\"/>","player-skip-back":"<path d=\"M20 5v14l-12 -7z\"/> <path d=\"M4 5l0 14\"/>","player-skip-forward":"<path d=\"M4 5v14l12 -7z\"/> <path d=\"M20 5l0 14\"/>","playlist":"<path d=\"M14 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\"/> <path d=\"M17 17v-13h4\"/> <path d=\"M13 5h-10\"/> <path d=\"M3 9l10 0\"/> <path d=\"M9 13h-6\"/>","plus":"<path d=\"M12 5l0 14\"/> <path d=\"M5 12l14 0\"/>","refresh":"<path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4\"/> <path d=\"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4\"/>","repeat":"<path d=\"M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3\"/> <path d=\"M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3\"/>","rewind-backward-10":"<path d=\"M7 9l-3 -3l3 -3\"/> <path d=\"M15.997 17.918a6.002 6.002 0 0 0 -.997 -11.918h-11\"/> <path d=\"M6 14v6\"/> <path d=\"M9 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z\"/>","rewind-forward-10":"<path d=\"M17 9l3 -3l-3 -3\"/> <path d=\"M8 17.918a5.997 5.997 0 0 1 -5 -5.918a6 6 0 0 1 6 -6h11\"/> <path d=\"M12 14v6\"/> <path d=\"M15 15.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z\"/>","search":"<path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/> <path d=\"M21 21l-6 -6\"/>","settings":"<path d=\"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z\"/> <path d=\"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\"/>","star":"<path d=\"M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z\"/>","user":"<path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\"/> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\"/>","volume-3":"<path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\"/> <path d=\"M16 10l4 4m0 -4l-4 4\"/>","volume":"<path d=\"M15 8a5 5 0 0 1 0 8\"/> <path d=\"M17.7 5a9 9 0 0 1 0 14\"/> <path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\"/>","x":"<path d=\"M18 6l-12 12\"/> <path d=\"M6 6l12 12\"/>"};
const LUMAP = { play: 'player-play', pause: 'player-pause', next: 'player-skip-forward', prev: 'player-skip-back', shuffle: 'arrows-shuffle', repeat: 'repeat', heart: 'heart', heartOn: 'heart', home: 'home', search: 'search', lib: 'books', plus: 'plus', queue: 'playlist', vol: 'volume', info: 'info-circle', left: 'chevron-left', right: 'chevron-right', close: 'x', more: 'dots', check: 'check', down: 'chevron-down', note: 'music', film: 'movie', tv: 'device-tv', star: 'star', list: 'list', user: 'user', edit: 'pencil', refresh: 'refresh', cal: 'calendar', gear: 'settings', fs: 'maximize' };
const LUFILL = { play: 1, pause: 1, heartOn: 1, next: 1, prev: 1 };
function luSvg(name, fill) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'lu' + (fill ? ' lu-fill' : '')); s.innerHTML = LU[name] || ''; return s; }

Object.assign(LU, {
  'logout': '<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/> <path d="M9 12h12l-3 -3"/> <path d="M18 15l3 -3"/>',
  'lock': '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"/> <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/> <path d="M8 11v-4a4 4 0 1 1 8 0v4"/>',
  'eye': '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/> <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>',
  'eye-off': '<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/> <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"/> <path d="M3 3l18 18"/>',
  'download': '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"/> <path d="M7 11l5 5l5 -5"/> <path d="M12 4l0 12"/>',
  'align-left': '<path d="M4 6l16 0"/> <path d="M4 12l10 0"/> <path d="M4 18l14 0"/>',
  'microphone': '<path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"/> <path d="M5 10a7 7 0 0 0 14 0"/> <path d="M8 21l8 0"/> <path d="M12 17l0 4"/>',
  'flame': '<path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"/>',
  'trophy': '<path d="M8 21l8 0"/> <path d="M12 17l0 4"/> <path d="M7 4l10 0"/> <path d="M17 4v8a5 5 0 0 1 -10 0v-8"/> <path d="M5 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/> <path d="M19 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>',
  'sparkles': '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"/> <path d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"/> <path d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>'
});
Object.assign(LUMAP, { volx: 'volume-3', logout: 'logout', lock: 'lock', eye: 'eye', eyeOff: 'eye-off', download: 'download', lyrics: 'align-left', mic: 'microphone', flame: 'flame', trophy: 'trophy', sparkles: 'sparkles' });

/* ---------- Cinema UI core: utils, api, router, Netflix shell ---------- */
const L = /^de/i.test(document.documentElement.lang || navigator.language || '') ? 'de' : 'en';
const TX = {
  en: { home: 'Home', movies: 'Movies', shows: 'TV Shows', mylist: 'My List', music: 'Music', search: 'Search', play: 'Play', resume: 'Resume', info: 'More info', trailer: 'Trailer',
    continue: 'Continue watching', nextup: 'Next up', newMovies: 'Recently added movies', newShows: 'Recently added shows', top: 'Top rated', random: 'Picked for you', recentAlbums: 'New in music',
    favs: 'My List', cast: 'Cast', similar: 'More like this', episodes: 'Episodes', season: 'Season', seasons: 'Seasons', empty: 'Nothing here yet.', results: 'Results for', noRes: 'No results found.',
    prefs: 'Settings', dash: 'Dashboard', logout: 'Sign out', watched: 'Watched', list: 'List', genres: 'Genres', director: 'Director', studio: 'Studio', min: 'min', collection: 'Collection', inCollection: 'In this collection',
    gm: 'Good morning', ga: 'Good afternoon', ge: 'Good evening', liked: 'Liked Songs', playlists: 'Playlists', albums: 'Albums', artists: 'Artists', songs: 'Songs', library: 'Your Library', createPl: 'Create playlist',
    recent: 'Recently played', yourPl: 'Your playlists', mixes: 'Made for you', newAlb: 'Recently added', popular: 'Popular', searchMusic: 'What do you want to play?', top1: 'Top result', browse: 'Browse all',
    queue: 'Queue', nowPlaying: 'Now playing', nextIn: 'Next in queue', shuffle: 'Shuffle', addQ: 'Add to queue', playNext: 'Play next', addPl: 'Add to playlist', newPl: 'New playlist', goArtist: 'Go to artist', goAlbum: 'Go to album',
    like: 'Save to Liked Songs', unlike: 'Remove from Liked Songs', rmPl: 'Remove from this playlist', name: 'Name', cancel: 'Cancel', create: 'Create', title: 'Title', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Artist', mix: 'Mix',
    popularTracks: 'Popular', discography: 'Discography', moviesTv: 'Movies & TV', songsN: 'songs', trackN: 'song', random2: 'Shuffle play', myMix: 'Mix', added: 'Added to playlist', queued: 'Added to queue', ofN: 'min', discover: 'Discover', requests: 'Requests', calendar: 'Calendar', bookmarks: 'Bookmarks', more: 'More', pskin: 'Plugin page styling', on: 'On', off: 'Off', inLib: 'In library', requested: 'Requested', notOwned: 'Not in library', request: 'Request', trending: 'Trending', popMovies: 'Popular movies', popShows: 'Popular shows', upMovies: 'Upcoming movies', upShows: 'Upcoming shows', notInLib: 'Not in your library yet', all: 'All', watchlist: 'Watchlist', wlAdded: 'Added to watchlist', wlRemoved: 'Removed from watchlist', wlAdd: 'Add to watchlist', wlRemove: 'Remove from watchlist', favAdd: 'Add to My List', favRemove: 'Remove from My List', markWatched: 'Mark as watched', markUnwatched: 'Mark as unwatched', markedWatched: 'Marked as watched', markedUnwatched: 'Marked as unwatched', openDetails: 'Open details', editMeta: 'Edit metadata', editImages: 'Edit images', identify: 'Identify', refreshMeta: 'Refresh metadata', openNative: 'Open in Jellyfin', delete: 'Delete', cmdNA: 'That action is not available here', because: 'Because you watched', genresRandom: 'Random genre rows', seerrRec: 'Recommended for you', settings: 'Settings', general: 'General', setHero: 'Billboard on home', setHeroHint: 'Show the large rotating banner at the top.', setPeek: 'Hover preview cards', setPeekHint: 'Show a preview card when you hover a poster.', setInfinite: 'Infinite scroll', setInfiniteHint: 'Load more rows and grids as you scroll.', setSeerrWl: 'Sync watchlist with Seerr', setSeerrWlHint: 'Also add to your Seerr watchlist when you add a title to your watchlist.', appearance: 'Appearance', accent: 'Accent color', accentHint: 'Used for the logo and progress bars.', homeSections: 'Home sections', homeSectionsHint: 'Reorder, hide or add rows. Changes sync to all your devices.', custom: 'custom', secGenre: 'Genre row', secLibrary: 'Library row', add: 'Add', reset: 'Reset', rqPending: 'Waiting', rqProcessing: 'In progress', rqAvailable: 'Available', rqDeclined: 'Declined', rqWaiting: 'Waiting for approval', rqPartial: 'Partly available', rqDownloading: 'Downloading', rqApproved: 'Approved', approve: 'Approve', decline: 'Decline', downloads: 'Downloads', noDownloads: 'Nothing is downloading right now.', today: 'Today', arrOff: 'Radarr and Sonarr are not connected yet. Add them in Dashboard, Plugins, Cinema.', cal_digital: 'Digital release', cal_physical: 'Physical release', cal_cinema: 'In cinemas', cal_episode: 'Episode', close: 'Close', musicRequestArtists: 'Request artists', musicRequestAlbums: 'Request albums', discoverMusic: 'Discover new music', globalTopArtists: 'Top artists worldwide', all2: 'All', sortPop: 'Popularity', sortRating: 'Rating', sortNew: 'Newest', hideOwned: 'Hide what I have', moreToExplore: 'More to explore', moreOf: 'More', miTitle: 'Media info', miFile: 'File', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'audience', similarNew: 'More like this (not in your library yet)', forYou: 'Made for you', notOwnedMix: 'not in your library', requestAlbum: 'Request album', noPreview: 'No preview available', discoverShort: 'Discover', aurralOff: 'Aurral is not connected yet. Add it in Dashboard, Plugins, Cinema.', discoverCta: 'Find new tracks, artists and albums and request them.', open: 'Open', pluginsH: 'Plugins', plPreparing: 'Preparing stream…', plRetry: 'Reconnecting…', plAudio: 'Audio', plSubs: 'Subtitles', plOff: 'Off', plSpeed: 'Speed', plFail: 'Playback failed', plRetryBtn: 'Try again', plTranscode: 'Force transcoding', plNative: 'Use Jellyfin player', plNext: 'Next episode', setNative: 'Use the Jellyfin player', plBurn: 'burned in', featOff: 'This feature is turned off on this server.', showAll: 'Show all', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Enter the code shown on your TV (or other device) to sign it in.', qcCode: 'Code', qcOk: 'Device signed in', qcBad: 'Code not accepted', qcGo: 'Authorize', setTv: 'TV mode', setTvHint: 'Remote control layout with big focus ring. Only for this device; the page reloads.', imgPrimary: 'Poster', imgBackdrop: 'Backdrops', imgLogo: 'Logo', imgThumb: 'Thumbnail', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Search online', upload: 'Upload', noImages: 'No images', allLangs: 'All languages', back: 'Back', save: 'Save', saved: 'Saved', fName: 'Title', fOrig: 'Original title', fSort: 'Sort title', fOverview: 'Overview', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Year', fPremiere: 'Release date', fRating: 'Age rating', fCommunity: 'Community rating', fCritic: 'Critic rating', fLock: 'Lock metadata (do not overwrite on refresh)', fComma: 'Separate with commas', idSearch: 'Search', idNone: 'Nothing found', idApplied: 'Applied', idHint: 'Pick the correct result to replace metadata and images.', rfScan: 'Scan for new and updated files', rfScanHint: 'Only picks up changes.', rfMissing: 'Search for missing metadata', rfMissingHint: 'Fills gaps, keeps what you edited.', rfReplace: 'Replace all metadata', rfReplaceHint: 'Overwrites everything with fresh data from the providers.', rfImages: 'Also replace images', rfStart: 'Refresh', rfStarted: 'Refresh started', delConfirm: '"{n}" and its files will be deleted permanently. This cannot be undone.', delDone: 'Deleted', setDevPlayer: 'Player on this device', setDevPlayerHint: 'Applies only to this phone or computer. Other devices keep their own choice.', plOwn: 'Cinema player', plStd: 'Jellyfin standard', sortName: 'Name', sortRating: 'Rating', sortAdded: 'Recently added', sortYear: 'Release year', sortRandom: 'Random', browseAll: 'All', tagline: 'Tagline', factDirector: 'Director', factWriter: 'Writer', factStatus: 'Status', factLang: 'Original language', factRuntime: 'Runtime', factBudget: 'Budget', factRevenue: 'Box office', factStudio: 'Studio', factNetwork: 'Network', factSeasons: 'Seasons', reqOptions: 'Request options', reqServer: 'Server', reqProfile: 'Quality profile', reqFolder: 'Folder', reqAdvanced: 'Advanced (admin)', watchTrailer: 'Trailer', moreCast: 'Cast', noFilter: 'Default', setGeneral: 'General', setHome: 'Home', setPlayer: 'Player', setLook: 'Appearance', setServices: 'Services', setAdv: 'Advanced', setPeekDelay: 'Preview delay', setPeekDelayHint: 'How long to hover before the preview card opens.', fast: 'Fast', normal: 'Normal', slow: 'Slow', setHeroItems: 'Billboard titles', setHeroItemsHint: 'How many titles rotate in the billboard.', setHeroInterval: 'Billboard speed', setHeroIntervalHint: 'Seconds before the next title.', setCardSize: 'Card size', setCardSizeHint: 'Size of posters and thumbnails.', small: 'Small', medium: 'Medium', large: 'Large', pskinHint: 'Applies the Cinema style to Seerr, calendar and other plugin pages.', connected: 'Connected', notConnected: 'Not connected', serverSettings: 'Server settings', askAdmin: 'Ask your administrator to connect services.', setWatchlist: 'Watchlist', exportSet: 'Export / import settings', exportSetHint: 'Copy your settings as text or paste them on another account.', copy: 'Copy', impt: 'Import', pasteSet: 'Paste settings JSON', copied: 'Copied', resetAll: 'Reset all my settings', resetAllHint: 'Go back to the server defaults.', clearCache: 'Clear caches', clearCacheHint: 'Reload library and request data.', clear: 'Clear', killSwitch: 'Emergency switch', killSwitchHint: 'Type this in the browser console to turn Cinema off.', about: 'About', resetDefault: 'Reset to default', lockedBy: 'Turned off by the server administrator.', moreActions: 'More actions (plugins)', fromDecade: 'From the', unwatched: 'Not watched yet', plSubStyle: 'Subtitle appearance…', plChapters: 'Chapters', plSkipCredits: 'Skip credits', plSkipRecap: 'Skip recap', plSkipIntro: 'Skip intro', plNextIn: 'Next episode in', plBack: 'Back', plInfo: 'Playback info', plBack10: 'Back 10 seconds', plFwd10: 'Forward 10 seconds', plSettings: 'Settings', plFs: 'Fullscreen', plQuality: 'Quality', plAuto: 'Auto (original)', plQualityHint: 'Lower quality is transcoded by the server.', plAutoNext: 'Play next episode', plAutoNextHint: 'Continue with the next episode automatically.', plAutoSkip: 'Skip intros automatically', plAutoSkipHint: 'Needs intro detection on the server.', plRemember: 'Remember volume', plSubSize: 'Size', plSubPos: 'Position', plLow: 'Low', plMid: 'Middle', plHigh: 'High', plSubBg: 'Background', plShadow: 'Shadow', plBox: 'Box', plNone: 'None', plSubColor: 'Color', plWhite: 'White', plYellow: 'Yellow', plGreen: 'Green', plSubBold: 'Bold text', plSubFont: 'Font', plSubPreview: 'This is how subtitles look', plKPlay: 'Play / pause', plKVol: 'Volume', plKFs: 'Fullscreen', plKMute: 'Mute', plKBack: 'Close menu / leave', plTab_quality: 'Video', plTab_playback: 'Playback', plTab_subs: 'Subtitles', plTab_keys: 'Keys', plMethod: 'Method', plSource: 'Source', plPlaying: 'Playing', plBitrate: 'Bitrate', plBuffer: 'Buffer', plDropped: 'Dropped frames', setNativeHint: 'Turn on if the built-in player gives you trouble.' },
  de: { home: 'Startseite', movies: 'Filme', shows: 'Serien', mylist: 'Meine Liste', music: 'Musik', search: 'Suchen', play: 'Abspielen', resume: 'Fortsetzen', info: 'Mehr Infos', trailer: 'Trailer',
    continue: 'Weiterschauen', nextup: 'Als Nächstes', newMovies: 'Neu hinzugefügte Filme', newShows: 'Neu hinzugefügte Serien', top: 'Bestbewertet', random: 'Für dich ausgewählt', recentAlbums: 'Neu in der Musik',
    favs: 'Meine Liste', cast: 'Besetzung', similar: 'Ähnliche Titel', episodes: 'Folgen', season: 'Staffel', seasons: 'Staffeln', empty: 'Noch nichts vorhanden.', results: 'Ergebnisse für', noRes: 'Keine Ergebnisse gefunden.',
    prefs: 'Einstellungen', dash: 'Dashboard', logout: 'Abmelden', watched: 'Gesehen', list: 'Liste', genres: 'Genres', director: 'Regie', studio: 'Studio', min: 'Min.', collection: 'Sammlung', inCollection: 'In dieser Sammlung',
    gm: 'Guten Morgen', ga: 'Guten Tag', ge: 'Guten Abend', liked: 'Lieblingssongs', playlists: 'Playlists', albums: 'Alben', artists: 'Künstler', songs: 'Titel', library: 'Deine Bibliothek', createPl: 'Playlist erstellen',
    recent: 'Zuletzt gehört', yourPl: 'Deine Playlists', mixes: 'Für dich gemacht', newAlb: 'Zuletzt hinzugefügt', popular: 'Beliebt', searchMusic: 'Was möchtest du hören?', top1: 'Top-Ergebnis', browse: 'Alle durchsuchen',
    queue: 'Warteschlange', nowPlaying: 'Läuft gerade', nextIn: 'Als Nächstes', shuffle: 'Zufällig', addQ: 'Zur Warteschlange', playNext: 'Als Nächstes spielen', addPl: 'Zur Playlist hinzufügen', newPl: 'Neue Playlist', goArtist: 'Zum Künstler', goAlbum: 'Zum Album',
    like: 'Zu Lieblingssongs', unlike: 'Aus Lieblingssongs entfernen', rmPl: 'Aus dieser Playlist entfernen', name: 'Name', cancel: 'Abbrechen', create: 'Erstellen', title: 'Titel', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Künstler', mix: 'Mix',
    popularTracks: 'Beliebt', discography: 'Diskografie', moviesTv: 'Filme & Serien', songsN: 'Titel', trackN: 'Titel', random2: 'Zufallswiedergabe', myMix: 'Mix', added: 'Zur Playlist hinzugefügt', queued: 'Zur Warteschlange hinzugefügt', ofN: 'Min.', discover: 'Entdecken', requests: 'Anfragen', calendar: 'Kalender', bookmarks: 'Lesezeichen', more: 'Mehr', pskin: 'Plugin-Seiten-Design', on: 'An', off: 'Aus', inLib: 'In Bibliothek', requested: 'Angefragt', notOwned: 'Nicht vorhanden', request: 'Anfragen', trending: 'Angesagt', popMovies: 'Beliebte Filme', popShows: 'Beliebte Serien', upMovies: 'Bald im Kino', upShows: 'Bald neue Serien', notInLib: 'Noch nicht in deiner Bibliothek', all: 'Alle', watchlist: 'Watchlist', wlAdded: 'Zur Watchlist hinzugefügt', wlRemoved: 'Aus Watchlist entfernt', wlAdd: 'Zur Watchlist', wlRemove: 'Von Watchlist entfernen', favAdd: 'Zu Meine Liste', favRemove: 'Aus Meine Liste entfernen', markWatched: 'Als gesehen markieren', markUnwatched: 'Als ungesehen markieren', markedWatched: 'Als gesehen markiert', markedUnwatched: 'Als ungesehen markiert', openDetails: 'Details öffnen', editMeta: 'Metadaten bearbeiten', editImages: 'Bilder bearbeiten', identify: 'Identifizieren', refreshMeta: 'Metadaten aktualisieren', openNative: 'In Jellyfin öffnen', delete: 'Löschen', cmdNA: 'Diese Aktion ist hier nicht verfügbar', because: 'Weil du gesehen hast', genresRandom: 'Zufällige Genre-Reihen', seerrRec: 'Empfohlen für dich', settings: 'Einstellungen', general: 'Allgemein', setHero: 'Billboard auf der Startseite', setHeroHint: 'Zeigt das große rotierende Banner oben.', setPeek: 'Vorschau beim Hovern', setPeekHint: 'Zeigt eine Vorschaukarte, wenn du ein Poster überfährst.', setInfinite: 'Endloses Scrollen', setInfiniteHint: 'Lädt weitere Reihen und Listen beim Scrollen.', setSeerrWl: 'Watchlist mit Seerr synchronisieren', setSeerrWlHint: 'Fügt Titel auch deiner Seerr-Watchlist hinzu.', appearance: 'Aussehen', accent: 'Akzentfarbe', accentHint: 'Für Logo und Fortschrittsbalken.', homeSections: 'Startseiten-Bereiche', homeSectionsHint: 'Reihen sortieren, ausblenden oder hinzufügen. Änderungen synchronisieren auf alle Geräte.', custom: 'eigene', secGenre: 'Genre-Reihe', secLibrary: 'Bibliotheks-Reihe', add: 'Hinzufügen', reset: 'Zurücksetzen', rqPending: 'Wartend', rqProcessing: 'In Arbeit', rqAvailable: 'Verfügbar', rqDeclined: 'Abgelehnt', rqWaiting: 'Wartet auf Genehmigung', rqPartial: 'Teilweise verfügbar', rqDownloading: 'Lädt', rqApproved: 'Genehmigt', approve: 'Genehmigen', decline: 'Ablehnen', downloads: 'Downloads', noDownloads: 'Gerade lädt nichts herunter.', today: 'Heute', arrOff: 'Radarr und Sonarr sind noch nicht verbunden. Trage sie unter Dashboard, Plugins, Cinema ein.', cal_digital: 'Digitale Veröffentlichung', cal_physical: 'Physische Veröffentlichung', cal_cinema: 'Im Kino', cal_episode: 'Folge', close: 'Schließen', musicRequestArtists: 'Künstler anfragen', musicRequestAlbums: 'Alben anfragen', discoverMusic: 'Neue Musik entdecken', globalTopArtists: 'Top-Künstler weltweit', all2: 'Alle', sortPop: 'Beliebtheit', sortRating: 'Bewertung', sortNew: 'Neueste', hideOwned: 'Bereits vorhandene ausblenden', moreToExplore: 'Mehr zum Entdecken', moreOf: 'Mehr', miTitle: 'Medien-Info', miFile: 'Datei', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'Publikum', similarNew: 'Ähnliche Titel (noch nicht in deiner Bibliothek)', forYou: 'Für dich gemacht', notOwnedMix: 'nicht in deiner Bibliothek', requestAlbum: 'Album anfragen', noPreview: 'Keine Vorschau verfügbar', discoverShort: 'Entdecken', aurralOff: 'Aurral ist noch nicht verbunden. Trage es unter Dashboard, Plugins, Cinema ein.', discoverCta: 'Neue Titel, Künstler und Alben finden und anfragen.', open: 'Öffnen', pluginsH: 'Plugins', plPreparing: 'Stream wird vorbereitet…', plRetry: 'Verbindung wird wiederhergestellt…', plAudio: 'Ton', plSubs: 'Untertitel', plOff: 'Aus', plSpeed: 'Tempo', plFail: 'Wiedergabe fehlgeschlagen', plRetryBtn: 'Erneut versuchen', plTranscode: 'Transkodierung erzwingen', plNative: 'Jellyfin-Player nutzen', plNext: 'Nächste Folge', setNative: 'Jellyfin-Player verwenden', plBurn: 'eingebrannt', featOff: 'Diese Funktion ist auf diesem Server deaktiviert.', showAll: 'Alle anzeigen', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Gib den Code ein, der auf deinem Fernseher (oder anderen Gerät) angezeigt wird.', qcCode: 'Code', qcOk: 'Gerät angemeldet', qcBad: 'Code nicht akzeptiert', qcGo: 'Freigeben', setTv: 'TV-Modus', setTvHint: 'Layout für die Fernbedienung mit großem Fokusrahmen. Nur für dieses Gerät, die Seite lädt neu.', imgPrimary: 'Poster', imgBackdrop: 'Hintergründe', imgLogo: 'Logo', imgThumb: 'Vorschaubild', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Online suchen', upload: 'Hochladen', noImages: 'Keine Bilder', allLangs: 'Alle Sprachen', back: 'Zurück', save: 'Speichern', saved: 'Gespeichert', fName: 'Titel', fOrig: 'Originaltitel', fSort: 'Sortiertitel', fOverview: 'Beschreibung', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Jahr', fPremiere: 'Erscheinungsdatum', fRating: 'Altersfreigabe', fCommunity: 'Community-Bewertung', fCritic: 'Kritiker-Bewertung', fLock: 'Metadaten sperren (beim Aktualisieren nicht überschreiben)', fComma: 'Mit Komma trennen', idSearch: 'Suchen', idNone: 'Nichts gefunden', idApplied: 'Übernommen', idHint: 'Wähle das richtige Ergebnis, um Metadaten und Bilder zu ersetzen.', rfScan: 'Nach neuen und geänderten Dateien suchen', rfScanHint: 'Übernimmt nur Änderungen.', rfMissing: 'Fehlende Metadaten suchen', rfMissingHint: 'Füllt Lücken, behält deine Änderungen.', rfReplace: 'Alle Metadaten ersetzen', rfReplaceHint: 'Überschreibt alles mit frischen Daten der Anbieter.', rfImages: 'Auch Bilder ersetzen', rfStart: 'Aktualisieren', rfStarted: 'Aktualisierung gestartet', delConfirm: '„{n}“ und die zugehörigen Dateien werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.', delDone: 'Gelöscht', setDevPlayer: 'Player auf diesem Gerät', setDevPlayerHint: 'Gilt nur für dieses Handy bzw. diesen Computer. Andere Geräte behalten ihre eigene Wahl.', plOwn: 'Cinema-Player', plStd: 'Jellyfin-Standard', sortName: 'Name', sortRating: 'Bewertung', sortAdded: 'Zuletzt hinzugefügt', sortYear: 'Erscheinungsjahr', sortRandom: 'Zufällig', browseAll: 'Alle', tagline: 'Tagline', factDirector: 'Regie', factWriter: 'Drehbuch', factStatus: 'Status', factLang: 'Originalsprache', factRuntime: 'Laufzeit', factBudget: 'Budget', factRevenue: 'Einspielergebnis', factStudio: 'Studio', factNetwork: 'Sender', factSeasons: 'Staffeln', reqOptions: 'Anfrage-Optionen', reqServer: 'Server', reqProfile: 'Qualitätsprofil', reqFolder: 'Ordner', reqAdvanced: 'Erweitert (Admin)', watchTrailer: 'Trailer', moreCast: 'Besetzung', noFilter: 'Standard', setGeneral: 'Allgemein', setHome: 'Startseite', setPlayer: 'Player', setLook: 'Aussehen', setServices: 'Dienste', setAdv: 'Erweitert', setPeekDelay: 'Vorschau-Verzögerung', setPeekDelayHint: 'Wie lange du hovern musst, bis die Vorschaukarte öffnet.', fast: 'Schnell', normal: 'Normal', slow: 'Langsam', setHeroItems: 'Billboard-Titel', setHeroItemsHint: 'Wie viele Titel im Billboard wechseln.', setHeroInterval: 'Billboard-Tempo', setHeroIntervalHint: 'Sekunden bis zum nächsten Titel.', setCardSize: 'Kartengröße', setCardSizeHint: 'Größe von Postern und Vorschaubildern.', small: 'Klein', medium: 'Mittel', large: 'Groß', pskinHint: 'Wendet den Cinema-Stil auf Seerr, Kalender und andere Plugin-Seiten an.', connected: 'Verbunden', notConnected: 'Nicht verbunden', serverSettings: 'Servereinstellungen', askAdmin: 'Bitte deinen Administrator, Dienste zu verbinden.', setWatchlist: 'Watchlist', exportSet: 'Einstellungen exportieren / importieren', exportSetHint: 'Kopiere deine Einstellungen als Text oder füge sie in einem anderen Konto ein.', copy: 'Kopieren', impt: 'Importieren', pasteSet: 'Einstellungen-JSON einfügen', copied: 'Kopiert', resetAll: 'Alle meine Einstellungen zurücksetzen', resetAllHint: 'Zurück zu den Server-Standards.', clearCache: 'Caches leeren', clearCacheHint: 'Bibliotheks- und Anfragedaten neu laden.', clear: 'Leeren', killSwitch: 'Notschalter', killSwitchHint: 'Gib das in der Browser-Konsole ein, um Cinema auszuschalten.', about: 'Über', resetDefault: 'Auf Standard zurücksetzen', lockedBy: 'Vom Server-Administrator deaktiviert.', moreActions: 'Weitere Aktionen (Plugins)', fromDecade: 'Aus den', unwatched: 'Noch nicht gesehen', plSubStyle: 'Untertitel-Darstellung…', plChapters: 'Kapitel', plSkipCredits: 'Abspann überspringen', plSkipRecap: 'Rückblick überspringen', plSkipIntro: 'Intro überspringen', plNextIn: 'Nächste Folge in', plBack: 'Zurück', plInfo: 'Wiedergabe-Info', plBack10: '10 Sekunden zurück', plFwd10: '10 Sekunden vor', plSettings: 'Einstellungen', plFs: 'Vollbild', plQuality: 'Qualität', plAuto: 'Auto (Original)', plQualityHint: 'Niedrigere Qualität wird vom Server umgewandelt.', plAutoNext: 'Nächste Folge abspielen', plAutoNextHint: 'Automatisch mit der nächsten Folge weitermachen.', plAutoSkip: 'Intros automatisch überspringen', plAutoSkipHint: 'Benötigt Intro-Erkennung auf dem Server.', plRemember: 'Lautstärke merken', plSubSize: 'Größe', plSubPos: 'Position', plLow: 'Unten', plMid: 'Mitte', plHigh: 'Hoch', plSubBg: 'Hintergrund', plShadow: 'Schatten', plBox: 'Box', plNone: 'Keiner', plSubColor: 'Farbe', plWhite: 'Weiß', plYellow: 'Gelb', plGreen: 'Grün', plSubBold: 'Fetter Text', plSubFont: 'Schrift', plSubPreview: 'So sehen Untertitel aus', plKPlay: 'Abspielen / Pause', plKVol: 'Lautstärke', plKFs: 'Vollbild', plKMute: 'Stumm', plKBack: 'Menü schließen / verlassen', plTab_quality: 'Video', plTab_playback: 'Wiedergabe', plTab_subs: 'Untertitel', plTab_keys: 'Tasten', plMethod: 'Methode', plSource: 'Quelle', plPlaying: 'Wiedergabe', plBitrate: 'Bitrate', plBuffer: 'Puffer', plDropped: 'Verworfene Frames', setNativeHint: 'Aktivieren, falls der eingebaute Player Probleme macht.' }
};
const t = k => (TX[L][k] || TX.en[k] || k);

/* DOM helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(3)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(c)); }
  return e;
}
const IC = {
  play: 'M8 5v14l11-7z', pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z', next: 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z', prev: 'M6 6h2v12H6zm3.5 6l8.5 6V6z',
  shuffle: 'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  heart: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z',
  heartOn: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  home: 'M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z', search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  lib: 'M4 4h2v16H4zM8 4h2v16H8zM12.5 4.5l1.9-.7 5.6 15.2-1.9.7z', plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', queue: 'M4 10h12v2H4zM4 6h12v2H4zM4 14h8v2H4zM16 13v6l5-3z',
  vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z', info: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z',
  left: 'M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z', right: 'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z', close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  more: 'M6 10a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4zm-6 0a2 2 0 100 4 2 2 0 000-4z', check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', down: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z',
  note: 'M12 3v10.55A4 4 0 1014 17V7h4V3h-6z', film: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V4h-4z', tv: 'M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h5v2h8v-2h5a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H3V5h18v12z',
  cal: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z', edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z', refresh: 'M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z', fs: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z', star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', list: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
};
const ic = (n, cls) => { const s = LUMAP[n] ? luSvg(LUMAP[n], LUFILL[n]) : (() => { const x = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); x.setAttribute('viewBox', '0 0 24 24'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', IC[n] || ''); x.append(p); return x; })(); return cls ? h('span', { class: cls }, s) : s; };

/* API */
const uid = () => ApiClient.getCurrentUserId();
const api = (path, params) => ApiClient.getJSON(ApiClient.getUrl(path, params));
const F_BASE = 'PrimaryImageAspectRatio,Overview,Genres,ProductionYear,CommunityRating,OfficialRating,RunTimeTicks,DateCreated,ParentBackdropImageTags,ParentBackdropItemId,SeriesPrimaryImageTag,ParentLogoItemId,ParentLogoImageTag';
const items = p => api('Users/' + uid() + '/Items', Object.assign({ Recursive: true, Fields: F_BASE, ImageTypeLimit: 1, EnableImageTypes: 'Primary,Backdrop,Thumb,Logo' }, p));
const getItem = id => ApiClient.getItem(uid(), id);
const fmtMin = ticks => { const m = Math.round((ticks || 0) / 600000000); return m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60) + 'm' : m + 'm'; };
const fmtTime = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const shuffleArr = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const U = (id, type, w, tag, extra) => ApiClient.getUrl('Items/' + id + '/Images/' + type + (extra || ''), { maxWidth: w, tag, quality: 85 });
function imgUrl(it, type, w) {
  type = type || 'Primary'; w = w || 400;
  if (typeof TVM !== 'undefined' && TVM) w = Math.max(180, Math.round(w * (type === 'Backdrop' ? .66 : .6))); // TV: smaller pictures, less memory and decoding work
  if (type === 'Backdrop' && it._bd) return it._bd;
  if ((type === 'Primary' || type === 'Thumb') && it._img) return it._img;
  if (type === 'Backdrop') {
    if ((it.BackdropImageTags || []).length) return U(it.Id, 'Backdrop', w, it.BackdropImageTags[0], '/0');
    if ((it.ParentBackdropImageTags || []).length) return U(it.ParentBackdropItemId, 'Backdrop', w, it.ParentBackdropImageTags[0], '/0');
    return '';
  }
  if (type === 'Logo') {
    if (it.ImageTags && it.ImageTags.Logo) return U(it.Id, 'Logo', w, it.ImageTags.Logo);
    if (it.ParentLogoItemId && it.ParentLogoImageTag) return U(it.ParentLogoItemId, 'Logo', w, it.ParentLogoImageTag);
    return '';
  }
  if (type === 'Thumb') {
    if (it.ImageTags && it.ImageTags.Thumb) return U(it.Id, 'Thumb', w, it.ImageTags.Thumb);
    return imgUrl(it, 'Backdrop', w) || imgUrl(it, 'Primary', w);
  }
  if (it.ImageTags && it.ImageTags.Primary) return U(it.Id, 'Primary', w, it.ImageTags.Primary);
  if (it.Type === 'Audio' && it.AlbumId && it.AlbumPrimaryImageTag) return U(it.AlbumId, 'Primary', w, it.AlbumPrimaryImageTag);
  if (it.SeriesId && it.SeriesPrimaryImageTag) return U(it.SeriesId, 'Primary', w, it.SeriesPrimaryImageTag);
  return '';
}
const bg = u => u ? { style: 'background-image:url("' + u + '")' } : {};
const ud = it => it.UserData || {};
const pct = it => { const p = ud(it).PlayedPercentage; return p && p > 1 && p < 98 ? p : 0; };
const yearOf = it => it.ProductionYear || (it.PremiereDate || '').slice(0, 4);
const toast = msg => { const e = h('div', { style: 'position:fixed;left:50%;bottom:110px;transform:translateX(-50%);background:#fff;color:#000;padding:10px 18px;border-radius:6px;font-weight:700;font-size:14px;z-index:9900;box-shadow:0 8px 24px rgba(0,0,0,.5)' }, msg); document.body.append(e); setTimeout(() => e.remove(), 2200); };

/* ---------- routing ---------- */
let BRAND = 'Jellyfin';
const refreshBrand = () => { try { const d = (C.status && C.status.defaults) || {}; const n = d.brand || ApiClient.serverInfo().Name; if (n) BRAND = n; } catch (e) { } };
const C = { mode: null, allowNative: false, scrollPos: {} };
const root = h('div', { id: 'cx' });
const parse = () => { const raw = location.hash.replace(/^#\/?/, ''); const [p, q] = raw.split('?'); return { parts: p.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(q || ''), raw }; };
const go = hash => { if (location.hash === hash) route(); else location.hash = hash; };
function itemHash(it) {
  switch (it.Type) {
    case 'Movie': case 'Series': case 'Season': case 'Episode': case 'BoxSet': case 'Video': return '#/c/item/' + it.Id;
    case 'Person': return '#/c/person/' + it.Id;
    case 'MusicAlbum': return '#/c/music/album/' + it.Id;
    case 'MusicArtist': return '#/c/music/artist/' + it.Id;
    case 'Playlist': return it.MediaType === 'Audio' ? '#/c/music/playlist/' + it.Id : '#/c/item/' + it.Id;
    case 'Audio': return it.AlbumId ? '#/c/music/album/' + it.AlbumId : null;
    default: return null;
  }
}
/* playing video: hand off to the native Jellyfin player */
async function playVideo(it, opts) {
  opts = opts || {};
  COVER.show();
  let id = it.Id;
  try {
    if (it.Type === 'Series' || it.Type === 'Season') {
      const nu = await api('Shows/NextUp', { userId: uid(), seriesId: it.Type === 'Series' ? it.Id : it.SeriesId, limit: 1 });
      if (nu.Items && nu.Items[0]) id = nu.Items[0].Id;
      else { const ep = await api('Shows/' + (it.Type === 'Series' ? it.Id : it.SeriesId) + '/Episodes', { userId: uid(), limit: 1 }); if (ep.Items[0]) id = ep.Items[0].Id; }
    } else if (it.Type === 'BoxSet') {
      const ch = await items({ ParentId: it.Id, Limit: 1, SortBy: 'SortName' }); if (ch.Items[0]) id = ch.Items[0].Id;
    }
  } catch (e) { }
  if (window.CinemaTV) { try { const full = await getItem(id); COVER.hide(); CinemaTV.play(id, opts.startTicks != null ? opts.startTicks : (ud(full).PlaybackPositionTicks || 0)); } catch (e) { COVER.hide(); toast('⚠ ' + (e.message || 'error')); } return; }
  if (playerMode() === 'native') { playNative(id); return; }
  try { const full = await getItem(id); COVER.hide(); await openPlayer(full, opts.startTicks); } catch (e) { console.warn('[cinema] player', e); COVER.hide(); playNative(id); }
}

/* ---------- Netflix shell ---------- */
function card(it, kind, opts) {
  opts = opts || {};
  kind = kind || 'thumb';
  const poster = kind === 'poster';
  const isEp = it.Type === 'Episode';
  const src = poster ? imgUrl(it, 'Primary', 400) : (isEp ? imgUrl(it, 'Primary', 600) || imgUrl(it, 'Backdrop', 600) : imgUrl(it, 'Thumb', 600));
  const title = isEp ? (it.SeriesName || it.Name) : it.Name;
  const sub = isEp ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : '';
  const hash = itemHash(it) || ('#/details?id=' + it.Id);
  const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title));
  if (pct(it)) im.append(h('div', { class: 'prog' }, h('i', { style: 'width:' + pct(it) + '%' })));
  const el = h('div', { class: 'nf-card ' + kind, onclick: () => go(hash), oncontextmenu: e => itemMenu(e, it) }, im, h('div', { class: 'title ell' }, title));
  if (HID.on && HID.ids.has(it.Id)) { el.classList.add('hx'); im.append(h('span', { class: 'hx-badge', title: t('hxIsHidden') }, ic('eyeOff', 'ic-s'))); }
  attachPeek(el, im, () => libDesc(it, poster));
  return el;
}

function row(title, list, kind, opts) {
  opts = opts || {};
  const cardOf = (i, idx) => opts.make ? opts.make(i) : kind === 'top10' ? top10Card(i, idx) : kind === 'spotlight' ? spotCard(i) : card(i, kind === 'top10' ? 'poster' : kind);
  const sc = h('div', { class: 'nf-scroller' }, list.map(cardOf));
  if (typeof TVM !== 'undefined' && TVM && opts.href) sc.append(h('a', { class: 'nf-card more ' + (kind || 'thumb'), href: opts.href }, h('div', { class: 'im' }, h('div', { class: 'mr' }, ic('right'), h('span', {}, t('showAll'))))));
  const L_ = h('button', { class: 'nf-arrow l', 'aria-label': 'Previous', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .85 }) }, ic('left'));
  const R_ = h('button', { class: 'nf-arrow r', 'aria-label': 'Next', onclick: () => sc.scrollBy({ left: sc.clientWidth * .85 }) }, ic('right'));
  return h('section', { class: 'nf-row' + (kind === 'top10' ? ' top10' : kind === 'spotlight' ? ' spot' : '') }, h('h2', {}, opts.href ? h('a', { href: opts.href }, title + ' ›') : title), L_, sc, R_);
}
/* numbered "Top 10" poster and wide spotlight card with synopsis */
function top10Card(it, idx) { const c = card(it, 'poster'); c.classList.add('t10c'); c.prepend(h('span', { class: 'n' }, String(idx + 1))); return c; }
function spotCard(it) {
  const bd = imgUrl(it, 'Backdrop', 900) || imgUrl(it, 'Primary', 600); const logo = imgUrl(it, 'Logo', 420);
  const meta = [it.ProductionYear, it.OfficialRating, it.CommunityRating ? '★ ' + it.CommunityRating.toFixed(1) : ''].filter(Boolean).join('  ·  ');
  const im = h('div', { class: 'im' }, h('div', Object.assign({ class: 'bgi' }, bg(bd))), h('div', { class: 'spot-info' }, logo ? h('img', { class: 'spot-logo', src: logo, alt: it.Name, loading: 'lazy' }) : h('b', {}, it.Name), meta ? h('small', {}, meta) : null));
  const el = h('div', { class: 'nf-card thumb spot', onclick: () => go(itemHash(it) || ('#/details?id=' + it.Id)), oncontextmenu: e => itemMenu(e, it) }, im);
  return el;
}
/* async row: placeholder is inserted immediately to keep order, filled when data arrives */
function lazyRow(container, title, fn, kind, opts) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  Promise.resolve().then(fn).then(list => { const arr = (list && list.Items) || list || []; if (arr.length >= ((opts && opts.min) || 1)) ph.replaceWith(row(title, arr, kind, opts)); else ph.remove(); }).catch(e => { console.warn('[cinema] row failed', title, e); ph.remove(); });
}

function heroEl(list) {
  const hero = h('div', { class: 'nf-hero' });
  const slides = list.map((it, i) => h('div', Object.assign({ class: 'nf-slide' + (i ? '' : ' on') }, bg(imgUrl(it, 'Backdrop', 1920)))));
  const body = h('div', { class: 'nf-hero-body' });
  const dots = h('div', { class: 'nf-dots' }, list.map((_, i) => h('i', { class: i ? '' : 'on', onclick: () => { set(i); restart(); } })));
  let cur = 0, timer;
  function fill(it) {
    const logo = imgUrl(it, 'Logo', 700);
    body.replaceChildren(
      logo ? h('img', { class: 'nf-hero-logo', src: logo, alt: it.Name }) : h('h1', { class: 'nf-hero-title' }, it.Name),
      h('div', { class: 'nf-meta' }, it.CommunityRating ? h('span', { class: 'match' }, Math.round(it.CommunityRating * 10) + '% ★') : null, yearOf(it) ? h('span', {}, yearOf(it)) : null, it.OfficialRating ? h('span', { class: 'badge' }, it.OfficialRating) : null, it.RunTimeTicks ? h('span', {}, fmtMin(it.RunTimeTicks)) : (it.Type === 'Series' ? h('span', {}, t('shows')) : null), (it.Genres || []).slice(0, 3).map(g => h('span', {}, g))),
      h('p', { class: 'nf-overview clamp3' }, it.Overview || ''),
      h('div', { class: 'nf-hero-btns' }, h('button', { class: 'btn white', onclick: () => (it._primary ? it._primary.fn() : playVideo(it)) }, ic(it._primary ? it._primary.icon : 'play'), it._primary ? it._primary.label : t('play')), h('button', { class: 'btn grey', onclick: () => (it._secondary ? it._secondary.fn() : go(itemHash(it))) }, ic(it._secondary ? it._secondary.icon : 'info'), it._secondary ? it._secondary.label : t('info'))));
  }
  function set(i) { cur = i; slides.forEach((s, k) => s.classList.toggle('on', k === i)); $$('i', dots).forEach((d, k) => d.classList.toggle('on', k === i)); body.style.opacity = 0; setTimeout(() => { fill(list[i]); body.style.opacity = 1; }, 250); }
  function restart() { clearInterval(timer); if (list.length > 1) timer = setInterval(() => { if (!hero.isConnected || root.style.display === 'none' || document.hidden || C.mode !== 'nf' || (typeof TVM !== 'undefined' && TVM && hero.contains(document.activeElement))) return; set((cur + 1) % list.length); }, (+cfg('heroInterval') || 11) * 1000); }
  body.style.transition = 'opacity .25s';
  hero.append(...slides, body, dots); fill(list[0]); restart();
  hero.addEventListener('remove', () => clearInterval(timer));
  return hero;
}
async function heroFor(types) {
  const r = await items({ IncludeItemTypes: types, SortBy: 'Random', Limit: 60, ImageTypes: 'Backdrop' });
  const withBd = r.Items.filter(i => (i.BackdropImageTags || []).length && i.Overview);
  const withLogo = withBd.filter(i => i.ImageTags && i.ImageTags.Logo);
  return (withLogo.length >= 5 ? withLogo : withBd).slice(0, Math.max(1, +cfg('heroItems') || 8));
}

function showSpinner() { C.nf.main.replaceChildren(h('div', { class: 'spinner' })); }

async function renderNF(r) {
  if (!C.nf) buildNF();
  const [a, b, c] = [r.parts[0], r.parts[1], r.parts[2]]; const c3 = r.parts[3];
  const main = C.nf.main; const key = r.raw;
  C.scrollPos[C.lastKey] = C.nf.el.scrollTop; C.lastKey = key;
  const view = (a === 'c' ? b : 'home') || 'home';
  C.nf.el.style.scrollBehavior = 'auto';
  const page = h('div', {}); main.replaceChildren(page);
  const token = (C.token = (C.token || 0) + 1);
  const done = () => { if (C.scrollPos[key]) C.nf.el.scrollTop = C.scrollPos[key]; else C.nf.el.scrollTop = 0; C.nf.el.style.scrollBehavior = ''; };
  if (view === 'home') await homeView2(page);
  else if (view === 'movies') await browseView(page, 'Movie');
  else if (view === 'shows') await browseView(page, 'Series');
  else if ((view === 'discover' && !feat('discover')) || (view === 'watchlist' && !feat('watchlist')) || (view === 'requests' && !feat('requests')) || (view === 'calendar' && !feat('calendar'))) page.append(h('div', { class: 'nf-page-pad' }, h('div', { class: 'nf-empty' }, t('featOff'))));
  else if (view === 'discover') await discoverView2(page);
  else if (view === 'watchlist') await watchlistView(page);
  else if (view === 'settings') await settingsView(page);
  else if (view === 'browse') await browseListView(page, c, c3 ? decodeURIComponent(c3) : '');
  else if (view === 'requests') await requestsView(page);
  else if (view === 'calendar') await calendarView(page);
  else if (view === 'person') await personView(page, c);
  else if (view === 'list') await listView(page);
  else if (view === 'search') await searchView(page, decodeURIComponent(c || ''));
  else if (view === 'item') await itemView(page, c);
  else if (view === 'archive') await archiveView(page);
  else page.append(h('div', { class: 'nf-empty' }, '404'));
  done();
}

async function homeView(page) {
  const hero = await heroFor('Movie,Series').catch(() => []);
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const u = uid();
  lazyRow(rows, t('continue'), () => api('Users/' + u + '/Items/Resume', { Limit: 16, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), 'thumb');
  lazyRow(rows, t('nextup'), () => api('Shows/NextUp', { userId: u, Limit: 16, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), 'thumb');
  lazyRow(rows, t('newMovies'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), 'poster', { href: '#/c/movies' });
  lazyRow(rows, t('newShows'), () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), 'poster', { href: '#/c/shows' });
  lazyRow(rows, t('top'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), 'thumb');
  lazyRow(rows, t('favs'), () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 24 }), 'poster', { href: '#/c/list' });
  lazyRow(rows, t('random'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), 'thumb');
  genreRows(rows, 'Movie', 4);
}
function genreRows(rows, type, n) {
  api('Genres', { userId: uid(), IncludeItemTypes: type, SortBy: 'Random', Limit: n }).then(g => (g.Items || []).forEach(gn => lazyRow(rows, gn.Name, () => items({ IncludeItemTypes: type, Genres: gn.Name, SortBy: 'Random', Limit: 20 }), 'thumb', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(gn.Name) }))).catch(() => { });
}
async function browseView(page, type) {
  const hero = await heroFor(type).catch(() => []);
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  lazyRow(rows, type === 'Movie' ? t('newMovies') : t('newShows'), () => items({ IncludeItemTypes: type, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), 'poster');
  lazyRow(rows, t('top'), () => items({ IncludeItemTypes: type, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20 }), 'thumb');
  genreRows(rows, type, 8);
  const all = h('div', { class: 'nf-page-pad', style: 'padding-top:10px' }, h('h1', { style: 'font-size:22px' }, type === 'Movie' ? t('movies') + ' A–Z' : t('shows') + ' A–Z')); rows.append(all);
  infiniteGrid(all, (s, n) => items({ IncludeItemTypes: type, SortBy: 'SortName', StartIndex: s, Limit: n }), i => card(i, 'poster'));
}
async function listView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('favs'))); page.append(wrap);
  infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: 'Movie,Series,BoxSet', Filters: 'IsFavorite', SortBy: 'SortName', StartIndex: s, Limit: n }), i => card(i, 'poster'));
}
Object.assign(TX.en, { srTop: 'Top result', srPeople: 'People', srMusic: 'Music', srEps: 'Episodes', srAll: 'All' });
Object.assign(TX.de, { srTop: 'Bestes Ergebnis', srPeople: 'Personen', srMusic: 'Musik', srEps: 'Folgen', srAll: 'Alle' });
async function searchView(page, q) {
  const wrap = h('div', { class: 'nf-page-pad srx-page' }, h('h1', {}, t('results') + ' “' + q + '”')); page.append(wrap);
  if (C.nf.sInput.value !== q) { C.nf.sInput.value = q; C.nf.sInput.parentElement.classList.add('open'); }
  wrap.append(h('div', { class: 'spinner', style: 'margin:60px auto' }));
  const get = types => items({ searchTerm: q, IncludeItemTypes: types, Limit: 40 }).then(r => r.Items).catch(() => []);
  const [mv, sh, ep, box, music, ppl] = await Promise.all([get('Movie'), get('Series'), get('Episode'), get('BoxSet'), get('MusicAlbum,MusicArtist,Audio'),
    api('Persons', { searchTerm: q, userId: uid(), Limit: 16, Fields: 'PrimaryImageAspectRatio' }).then(r => r.Items).catch(() => [])]);
  wrap.querySelector('.spinner').remove();
  const groups = [['mv', t('movies'), mv, 'poster'], ['sh', t('shows'), sh, 'poster'], ['ep', t('srEps'), ep, 'thumb'], ['box', t('collection'), box, 'poster'], ['ppl', t('srPeople'), ppl, 'person'], ['mu', t('srMusic'), music, 'poster']].filter(g => g[2].length);
  if (!groups.length) { wrap.append(h('div', { class: 'nf-empty' }, t('noRes'))); seerrSearchRow(wrap, q); return; }
  const ql = q.toLowerCase(); const pool = mv.concat(sh); const best = pool.find(i => i.Name.toLowerCase() === ql) || pool.find(i => i.Name.toLowerCase().startsWith(ql)) || pool[0];
  const body = h('div', {}); let active = 'all';
  const tabs = h('div', { class: 'nf-seasons' }, [['all', t('srAll')]].concat(groups.map(g => [g[0], g[1] + ' · ' + g[2].length])).map(([k, l]) => h('button', { class: 'nf-chip' + (k === active ? ' on' : ''), onclick: e => { active = k; $$('.nf-chip', tabs).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); draw(); } }, l)));
  const personCard = p => h('a', { class: 'nf-card person', href: '#/c/person/' + p.Id }, h('div', Object.assign({ class: 'pi' }, bg(imgUrl(p, 'Primary', 300)))), h('div', { class: 'title ell' }, p.Name));
  function topCard(it) {
    const bd = imgUrl(it, 'Backdrop', 1280) || imgUrl(it, 'Primary', 600); const ov = (it.Overview || '').replace(/<[^>]+>/g, '');
    return h('div', { class: 'srx-top', onclick: () => go(itemHash(it)) }, h('div', Object.assign({ class: 'srx-top-bg' }, bg(bd))),
      h('div', { class: 'srx-top-in' }, h('small', {}, t('srTop')), h('h2', {}, it.Name), h('div', { class: 'nf-meta' }, [it.ProductionYear, it.OfficialRating, it.CommunityRating ? '★ ' + it.CommunityRating.toFixed(1) : '', it.Type === 'Series' ? t('shows') : t('movies')].filter(Boolean).map(x => h('span', {}, x))), ov ? h('p', {}, ov) : null,
        h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: e => { e.stopPropagation(); playVideo(it); } }, ic('play'), t('play')), h('button', { class: 'btn grey', onclick: e => { e.stopPropagation(); go(itemHash(it)); } }, ic('info'), t('info')))));
  }
  function draw() {
    body.replaceChildren();
    if (active === 'all' && best) body.append(topCard(best));
    groups.filter(g => active === 'all' || g[0] === active).forEach(([k, title, list, kind]) => {
      const mk = kind === 'person' ? personCard : null;
      if (active === 'all') body.append(row(title + ' · ' + list.length, list.slice(0, 20), kind, mk ? { make: mk } : {}));
      else body.append(h('h2', { class: 'srx-h' }, title), h('div', { class: 'nf-grid' + (kind === 'person' ? ' srx-people' : '') }, list.map(i => mk ? mk(i) : card(i, kind))));
    });
  }
  wrap.append(tabs, body); draw(); seerrSearchRow(wrap, q);
}

/* detail */
async function itemView(page, id) {
  let it = await getItem(id);
  let focusEp = null;
  if (it.Type === 'Episode') { focusEp = it; it = await getItem(it.SeriesId); }
  if (it.Type === 'Season') { focusEp = { SeasonId: it.Id }; it = await getItem(it.SeriesId); }
  const d = h('div', { class: 'nf-detail' });
  const bd = imgUrl(it, 'Backdrop', 1920) || imgUrl(it, 'Primary', 1200);
  d.append(h('div', Object.assign({ class: 'nf-dback' }, bg(bd))));
  const logo = imgUrl(it, 'Logo', 700);
  const isSeries = it.Type === 'Series', isBox = it.Type === 'BoxSet';
  const prog = pct(it);
  const favBtn = h('button', { class: 'btn round' + (ud(it).IsFavorite ? ' on' : ''), 'aria-label': t('mylist'), onclick: async () => { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData.IsFavorite = on; favBtn.classList.toggle('on', on); favBtn.replaceChildren(ic(on ? 'heartOn' : 'heart')); favBtn.title = on ? t('favRemove') : t('favAdd'); } }, ic(ud(it).IsFavorite ? 'heartOn' : 'heart'));
  favBtn.title = ud(it).IsFavorite ? t('favRemove') : t('favAdd');
  const seenBtn = !isSeries && !isBox ? h('button', { class: 'btn round' + (ud(it).Played ? ' on' : ''), 'aria-label': t('watched'), onclick: async () => { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData.Played = on; seenBtn.classList.toggle('on', on); seenBtn.title = on ? t('markUnwatched') : t('markWatched'); } }, ic('eye')) : null;
  if (seenBtn) seenBtn.title = ud(it).Played ? t('markUnwatched') : t('markWatched');
  const moreBtn = h('button', { class: 'btn round', 'aria-label': t('more'), onclick: e => itemMenu(e, it) }, ic('more'));
  const trailer = (it.RemoteTrailers || [])[0];
  const people = (it.People || []);
  const dir = people.filter(p => p.Type === 'Director').map(p => p.Name).join(', ');
  const info = h('div', { class: 'nf-dinfo' },
    logo ? h('img', { class: 'nf-dlogo', src: logo, alt: it.Name }) : h('h1', {}, it.Name),
    h('div', { class: 'nf-meta' }, it.CommunityRating ? h('span', { class: 'match' }, Math.round(it.CommunityRating * 10) + '% ★') : null, yearOf(it) ? h('span', {}, yearOf(it)) : null, it.OfficialRating ? h('span', { class: 'badge' }, it.OfficialRating) : null, it.RunTimeTicks && !isSeries ? h('span', {}, fmtMin(it.RunTimeTicks)) : null, isSeries && it.ChildCount ? h('span', {}, it.ChildCount + ' ' + t('seasons')) : null),
    (it.Taglines || [])[0] ? h('p', { class: 'nf-tagline' }, it.Taglines[0]) : null,
    h('p', { class: 'ov', onclick: e => e.currentTarget.classList.toggle('open') }, it.Overview || ''),
    h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: () => playVideo(it) }, ic('play'), prog ? t('resume') : t('play')),
      trailer ? h('a', { class: 'btn grey', href: trailer.Url, target: '_blank', rel: 'noopener' }, ic('film'), t('trailer')) : null, favBtn, seenBtn, moreBtn),
    prog ? h('div', { class: 'nf-resume-bar' }, h('i', { style: 'width:' + prog + '%' })) : null,
    h('dl', { class: 'nf-facts' }, (it.Genres || []).length ? [h('dt', {}, t('genres')), h('dd', {}, it.Genres.join(', '))] : null, dir ? [h('dt', {}, t('director')), h('dd', {}, dir)] : null, (it.Studios || []).length ? [h('dt', {}, t('studio')), h('dd', {}, it.Studios.map(s => s.Name).join(', '))] : null));
  const poster = imgUrl(it, 'Primary', 500);
  d.append(h('div', { class: 'nf-dbody' }, h('div', { class: 'nf-dhead' }, poster ? h('div', Object.assign({ class: 'nf-dposter' }, bg(poster))) : null, info)));
  page.append(d);
  const body = $('.nf-dbody', d);
  if (isSeries) {
    const sect = h('section', { class: 'nf-sect' }, h('h2', {}, t('episodes'))); body.append(sect);
    const seasons = (await api('Shows/' + it.Id + '/Seasons', { userId: uid(), Fields: 'ItemCounts' })).Items;
    const chips = h('div', { class: 'nf-seasons' }); const list = h('div', { class: 'nf-eps' });
    sect.append(seasons.length > 1 ? chips : '', list);
    async function loadSeason(s) {
      $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c.dataset.id === s.Id));
      list.replaceChildren(h('div', { class: 'spinner', style: 'margin:40px auto' }));
      const eps = (await api('Shows/' + it.Id + '/Episodes', { userId: uid(), seasonId: s.Id, Fields: F_BASE + ',MediaStreams' })).Items;
      list.replaceChildren(...eps.map(ep => h('div', { class: 'nf-ep', 'data-id': ep.Id, onclick: () => playVideo(ep) },
        h('div', { class: 'n' }, ep.IndexNumber != null ? ep.IndexNumber : ''),
        h('div', Object.assign({ class: 'th' }, bg(imgUrl(ep, 'Primary', 500) || imgUrl(ep, 'Backdrop', 500))), pct(ep) ? h('div', { class: 'prog' }, h('i', { style: 'width:' + pct(ep) + '%' })) : null),
        h('div', {}, h('div', { class: 'tt' }, h('span', {}, ep.Name), ud(ep).Played ? h('span', { class: 'seen' }, '✓') : null), h('div', { class: 'ds clamp3' }, ep.Overview || '')),
        h('div', { class: 'rt', style: 'color:#bbb' }, ep.RunTimeTicks ? fmtMin(ep.RunTimeTicks) : ''))));
      if (focusEp && focusEp.Id) { const el = $('[data-id="' + focusEp.Id + '"]', list); if (el) { el.style.background = '#2a2a2a'; setTimeout(() => el.scrollIntoView({ block: 'center' }), 50); } focusEp = null; }
    }
    seasons.forEach(s => chips.append(h('button', { class: 'nf-chip', 'data-id': s.Id, onclick: () => loadSeason(s) }, s.Name)));
    let start = seasons[0];
    if (focusEp) start = seasons.find(s => s.Id === (focusEp.SeasonId || focusEp.ParentId)) || start;
    else { const nu = await api('Shows/NextUp', { userId: uid(), seriesId: it.Id, limit: 1 }).catch(() => null); const ne = nu && nu.Items && nu.Items[0]; if (ne) start = seasons.find(s => s.Id === ne.SeasonId) || start; }
    if (start) await loadSeason(start);
  }
  if (isBox) {
    const ch = await items({ ParentId: it.Id, SortBy: 'PremiereDate', Limit: 100 });
    body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('inCollection')), h('div', { class: 'nf-grid' }, ch.Items.map(i => card(i, 'poster')))));
  }
  if (people.length) body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('cast')), h('div', { class: 'nf-cast' }, people.filter(p => p.Type === 'Actor').slice(0, 20).map(p => h('a', { class: 'nf-person', href: '#/c/person/' + p.Id }, h('div', Object.assign({ class: 'pi' }, bg(p.PrimaryImageTag ? U(p.Id, 'Primary', 200, p.PrimaryImageTag) : ''))), p.Name, h('small', {}, p.Role || ''))))));
  if (feat('mediaInfo')) { const admin = (await me()).Policy.IsAdministrator; const mi = mediaInfoSection(it, admin); if (mi) body.append(mi); }
  if (feat('ratings')) ratingsRow(it, d); if (feat('seerrSimilar')) seerrSimilarRow(it, body);
  if (!isBox) { const sim = await api('Items/' + it.Id + '/Similar', { userId: uid(), limit: 14, Fields: F_BASE }).catch(() => null); if (sim && sim.Items && sim.Items.length) { const sec = h('section', { class: 'nf-sect', style: 'margin-left:calc(-1 * var(--pad));margin-right:calc(-1 * var(--pad))' }); sec.append(row(t('similar'), sim.Items, 'poster')); body.append(sec); } }
}

/* ---------- hidden titles ("guilty pleasure mode") ----------
   Everything tagged "hidden" in Jellyfin disappears from every list, search and row of the interface.
   An extended mode (unlocked with a code, remembered per device) shows it again. */
Object.assign(TX.en, { hxTitle: 'Extended mode', hxCodeHint: 'Enter your code.', hxUnlock: 'Unlock', hxLock: 'Deactivate', hxOn: 'Extended mode is active on this device.', hxBad: 'Wrong code', hxNone: 'Extended mode is not set up yet. An administrator has to choose a code first.',
  hxSetup: 'Choose a code', hxSetupHint: 'Titles tagged "hidden" stay out of sight until this code is entered on a device.', hxNew: 'New code', hxSave: 'Save', hxChange: 'Change code', hxHide: 'Hide title', hxUnhide: 'Unhide title', hxHidden: 'Title hidden', hxShown: 'Title visible again', hxDone: 'Extended mode activated', hxOff: 'Extended mode deactivated', hxMin: 'At least 4 characters', hxIsHidden: 'Hidden title', hxStHidden: 'Hidden · show again', hxStVisible: 'Visible · hide', hxLockedT: 'Locked area', nuHide: 'Remove from Next up', nuDone: 'Removed from Next up', download: 'Download', editSubs: 'Edit subtitles' });
Object.assign(TX.de, { hxTitle: 'Erweiterter Modus', hxCodeHint: 'Gib deinen Code ein.', hxUnlock: 'Entsperren', hxLock: 'Deaktivieren', hxOn: 'Der erweiterte Modus ist auf diesem Gerät aktiv.', hxBad: 'Falscher Code', hxNone: 'Der erweiterte Modus ist noch nicht eingerichtet. Ein Administrator muss zuerst einen Code festlegen.',
  hxSetup: 'Code festlegen', hxSetupHint: 'Mit "hidden" getaggte Titel bleiben unsichtbar, bis dieser Code auf einem Gerät eingegeben wird.', hxNew: 'Neuer Code', hxSave: 'Speichern', hxChange: 'Code ändern', hxHide: 'Titel verstecken', hxUnhide: 'Titel wieder anzeigen', hxHidden: 'Titel versteckt', hxShown: 'Titel wieder sichtbar', hxDone: 'Erweiterter Modus aktiviert', hxOff: 'Erweiterter Modus deaktiviert', hxMin: 'Mindestens 4 Zeichen', hxIsHidden: 'Versteckter Titel', hxStHidden: 'Versteckt · wieder anzeigen', hxStVisible: 'Sichtbar · verstecken', hxLockedT: 'Geschützter Bereich', nuHide: 'Aus "Als Nächstes" entfernen', nuDone: 'Aus "Als Nächstes" entfernt', download: 'Herunterladen', editSubs: 'Untertitel bearbeiten' });

const HID = { on: false, ids: new Set(), series: new Set(), tmdb: new Set(), tvdb: new Set(), loaded: 0, p: null, tag: 'hidden' };
try { HID.on = localStorage.getItem('cx-ext') === '1'; } catch (e) { }
if (HID.on) document.documentElement.classList.add('cx-ext');
const hxIsTag = s => String(s).toLowerCase() === HID.tag;
const _rawFetch = window.fetch.bind(window);
const HX_LIST = /\/(Users\/[^/]+\/)?Items(\/Latest|\/Resume|\/Suggestions)?(\?|$)|\/Items\/[^/?]+\/(Similar|Recommendations)\b|\/Shows\/(NextUp|Upcoming|[^/?]+\/(Episodes|Seasons))\b|\/Search\/Hints\b|\/Movies\/Recommendations\b|\/Playlists\/[^/?]+\/Items\b|\/Trailers\b|\/Artists(\/AlbumArtists)?(\?|$)|\/Persons(\?|$)|\/Genres(\?|$)/i;
function hxAuthHeader() { return { Authorization: 'MediaBrowser Client="Cinema", Device="Web", DeviceId="cinema-web", Version="1.0", Token="' + ApiClient.accessToken() + '"' }; }
async function hxLoad() {
  const r = await _rawFetch(ApiClient.getUrl('Users/' + uid() + '/Items', { Recursive: true, Tags: HID.tag, Fields: 'ProviderIds', EnableImages: false, EnableUserData: false, EnableTotalRecordCount: false }), { headers: hxAuthHeader() });
  if (!r.ok) throw new Error('hidden set ' + r.status);
  const d = await r.json(); const ids = new Set(), series = new Set(), tmdb = new Set(), tvdb = new Set();
  for (const it of d.Items || []) { ids.add(it.Id); const pi = it.ProviderIds || {}; const k = it.Type === 'Series' ? 'tv' : 'movie'; if (pi.Tmdb) tmdb.add(k + ':' + pi.Tmdb); if (pi.Tvdb) tvdb.add(String(pi.Tvdb)); if (it.Type === 'Series' || it.Type === 'Season') series.add((it.Type === 'Series' ? it.Name : it.SeriesName || '').toLowerCase()); }
  series.delete(''); HID.ids = ids; HID.series = series; HID.tmdb = tmdb; HID.tvdb = tvdb; HID.loaded = Date.now();
}
function hxReady() {
  if (HID.loaded && Date.now() - HID.loaded < 600000) return null;
  if (!HID.p) HID.p = hxLoad().catch(e => console.warn('[cinema] hidden set', e)).finally(() => { HID.p = null; });
  return HID.loaded ? null : HID.p; // a stale set is used while it refreshes; only the very first load blocks
}
function hxKeep(it) {
  if (!it || typeof it !== 'object') return true;
  const id = it.Id || it.ItemId;
  if (id && HID.ids.has(id)) return false;
  if (it.SeriesId && HID.ids.has(it.SeriesId)) return false;
  if (it.SeasonId && HID.ids.has(it.SeasonId)) return false;
  if (it.Tags && it.Tags.some(hxIsTag)) return false;
  if (it.Type === 'Episode' || it.Type === 'Season') { const sn = (it.SeriesName || it.Series || '').toLowerCase(); if (sn && HID.series.has(sn)) return false; }
  if (it.Series && HID.series.has(String(it.Series).toLowerCase())) return false;
  return true;
}
function hxFilter(d) {
  if (Array.isArray(d)) return d.map(x => (x && x.Items ? hxFilter(x) : x)).filter(hxKeep);
  if (d && Array.isArray(d.Items)) { const n = d.Items.length; d.Items = d.Items.filter(hxKeep); if (typeof d.TotalRecordCount === 'number') d.TotalRecordCount = Math.max(d.Items.length, d.TotalRecordCount - (n - d.Items.length)); }
  if (d && Array.isArray(d.SearchHints)) { const n = d.SearchHints.length; d.SearchHints = d.SearchHints.filter(hxKeep); if (typeof d.TotalRecordCount === 'number') d.TotalRecordCount = Math.max(d.SearchHints.length, d.TotalRecordCount - (n - d.SearchHints.length)); }
  return d;
}
const STOCK_HOME = /\/UserItems\/Resume\?|\/Items\/Latest\?userId=|\/Shows\/NextUp\?userId=[^&]+&limit=/;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : (input && input.url) || '';
  const method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
  /* Jellyfin's own home page loads its rows behind the Cinema overlay: skip those requests, they only slow the server down */
  if (method === 'GET' && STOCK_HOME.test(url) && /^#\/home/.test(location.hash) && document.documentElement.classList.contains('cx-on')) return Promise.resolve(new Response(/\/Latest\?/.test(url) ? '[]' : '{"Items":[],"TotalRecordCount":0,"StartIndex":0}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
  if (HID.on || method !== 'GET' || !HX_LIST.test(url) || !window.ApiClient || !ApiClient.getCurrentUserId || !ApiClient.getCurrentUserId()) return _rawFetch(input, init);
  let want = 0;
  if (typeof input === 'string' && HID.ids.size && /[?&]Limit=(\d+)/i.test(url) && !/[?&]StartIndex=[1-9]/i.test(url)) { want = +RegExp.$1; input = url.replace(/([?&]Limit=)\d+/i, '$1' + (want + Math.min(HID.ids.size, 80))); }
  const wait = hxReady();
  const go = () => _rawFetch(input, init).then(async resp => {
    if (!resp.ok || !/json/i.test(resp.headers.get('content-type') || '')) return resp;
    let d; try { d = await resp.clone().json(); } catch (e) { return resp; }
    d = hxFilter(d); if (want) { if (Array.isArray(d)) d = d.slice(0, want); else if (d && d.Items) d.Items = d.Items.slice(0, want); }
    return new Response(JSON.stringify(d), { status: resp.status, statusText: resp.statusText, headers: { 'Content-Type': 'application/json' } });
  });
  return wait ? wait.then(go) : go();
};
/* the hidden-title list is rebuilt after any change and when the view is refreshed */
function hxReload() { HID.loaded = 0; HID.p = null; return hxReady() || Promise.resolve(); }

/* ----- unlock / lock ----- */
async function hxCall(method, path, body) {
  const r = await _rawFetch(ApiClient.getUrl('Cinema/hidden/' + path), { method, headers: Object.assign({ 'Content-Type': 'application/json' }, hxAuthHeader()), body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(r.status); return r.json();
}
function hxSet(on) { try { on ? localStorage.setItem('cx-ext', '1') : localStorage.removeItem('cx-ext'); } catch (e) { } location.reload(); }
async function hxDialog() {
  const d = cxDialog(t('hxTitle')); d.busy();
  let hasCode = false; try { hasCode = (await hxCall('GET', 'status')).hasCode; } catch (e) { return errBox(d, e); }
  const admin = !!(C.status && C.status.admin);
  const pw = ph => h('input', { type: 'password', class: 'hx-code', autocomplete: 'off', placeholder: ph || '••••', inputmode: 'text' });
  const st = h('p', { class: 'cxd-hint', style: 'text-align:center;min-height:20px' });
  const setup = () => {
    const a = pw(t('hxNew')); const save = h('button', { class: 'btn white', onclick: async () => {
      if (a.value.length < 4) { st.textContent = '⚠ ' + t('hxMin'); return; } save.disabled = true;
      try { await hxCall('POST', 'code', { code: a.value }); toast('✓'); d.close(); } catch (e) { st.textContent = '⚠ ' + e.message; save.disabled = false; }
    } }, ic('check'), t('hxSave'));
    a.addEventListener('keydown', e => { if (e.key === 'Enter') save.click(); });
    d.setTitle(t('hxSetup')); d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('hxSetupHint')), a, st); d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), save); setTimeout(() => a.focus(), 250);
  };
  if (HID.on) {
    d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('hxOn')));
    d.foot.replaceChildren(admin ? h('button', { class: 'btn grey', onclick: setup }, t('hxChange')) : null, h('button', { class: 'btn white', onclick: () => hxSet(false) }, t('hxLock')));
    return;
  }
  if (!hasCode) { if (admin) return setup(); d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('hxNone'))); d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel'))); return; }
  const a = pw(); const go_ = h('button', { class: 'btn white', onclick: async () => {
    if (!a.value) return; go_.disabled = true; st.textContent = '…';
    try { const r = await hxCall('POST', 'verify', { code: a.value }); if (r.ok) { st.textContent = '✓'; hxSet(true); } else { st.textContent = '⚠ ' + t('hxBad'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); a.value = ''; go_.disabled = false; a.focus(); } } catch (e) { st.textContent = '⚠ ' + e.message; go_.disabled = false; }
  } }, ic('check'), t('hxUnlock'));
  a.addEventListener('keydown', e => { if (e.key === 'Enter') go_.click(); });
  d.body.replaceChildren(h('div', { class: 'hx-lock' }, ic('lock')), h('p', { class: 'cxd-hint', style: 'margin:0 0 14px;text-align:center' }, t('hxCodeHint')), a, st); d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_); setTimeout(() => a.focus(), 250);
}
/* hidden entry point: tap the version in Settings > About five times */
function hxTapper(el) {
  let n = 0, tm = 0; const hit = () => { n++; clearTimeout(tm); tm = setTimeout(() => { n = 0; }, 1600); if (n >= 5) { n = 0; hxDialog(); } };
  el.addEventListener('click', hit); el.addEventListener('keydown', e => { if (e.key === 'Enter') hit(); }); el.setAttribute('tabindex', '0'); return el;
}
/* extended mode only: tag / untag a title as hidden straight from its menu */
async function hxToggle(it) {
  try {
    const full = await jf('GET', 'Users/' + uid() + '/Items/' + it.Id); const tags = (full.Tags || []).slice(); const has = tags.some(hxIsTag);
    full.Tags = has ? tags.filter(x => !hxIsTag(x)) : tags.concat(HID.tag); full.TagItems = full.Tags.map(n => ({ Name: n }));
    await jf('POST', 'Items/' + it.Id, null, full); toast('✓ ' + t(has ? 'hxShown' : 'hxHidden')); await hxReload();
  } catch (e) { toast('⚠ ' + (e.message || e)); }
}

/* Seerr / Radarr / Sonarr answers (requests, discover, queue, calendar) must not give hidden titles away either */
function hxSeerrHidden(x) {
  if (!x || typeof x !== 'object') return false;
  const md = x.media || x.mediaInfo || {};
  const mt = md.mediaType || x.mediaType || x.type || (x.source === 'radarr' ? 'movie' : x.source === 'sonarr' ? 'tv' : '');
  if (mt === 'person') return false;
  const kind = mt === 'tv' ? 'tv' : 'movie';
  const tm = md.tmdbId || x.tmdbId || (x.mediaType && x.id ? x.id : 0) || (kind === 'tv' && x.tmdbSeriesId) || 0;
  if (tm && HID.tmdb.has(kind + ':' + tm)) return true;
  if (kind === 'tv' && x.tmdbSeriesId && HID.tmdb.has('tv:' + x.tmdbSeriesId)) return true;
  const tv = md.tvdbId || x.tvdbId; if (tv && HID.tvdb.has(String(tv))) return true;
  return false;
}
function hxSeerr(d) {
  if (HID.on || !HID.loaded) return d;
  if (Array.isArray(d)) return d.filter(x => !hxSeerrHidden(x));
  if (d && Array.isArray(d.results)) d.results = d.results.filter(x => !hxSeerrHidden(x));
  return d;
}

if (HID.on) { const iv = setInterval(() => { if (window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId()) { clearInterval(iv); hxLoad().then(() => { try { route(); } catch (e) { } }).catch(() => { }); } }, 500); }
const hxIsHiddenItem = it => HID.ids.has(it.Id) || (it.Tags || []).some(hxIsTag);

/* ---------- routing + persistent top bar (integrates native Jellyfin pages and plugin pages) ---------- */
const FULL = /^(dashboard|configuration|plugins?|users?|useredit|usernew|userprofiles|userlibraryaccess|userparentalcontrol|userpassword|library|librarydisplay|metadataimages|metadatanfo|metadata|encodingsettings|streamingsettings|serveractivity|devices?|networking|scheduledtasks?|logs?|apikeys|notificationsettings?|branding|livetvsettings|dlnasettings|dlnaprofiles?|quickconnect|wizard\w*|video|login|selectserver|addserver|forgotpassword|nowplaying|edititemmetadata|queue|lyrics|transcodingsettings|reports|activity|mediaplayback\w*|playbackconfiguration|displaysettings|repositories|catalog)$/i;
const TABS = { favorites: [1, ''], watchlist: [2, ''], discover: [3, 'recommendations'], requests: [4, 'requests'], calendar: [5, 'calendar'], bookmarks: [6, 'bookmarks'] };
function tabHref(name) {
  let [idx, je] = TABS[name];
  if (je) { const b = document.getElementById('je-native-tab-btn-' + je); if (b && b.dataset.index) idx = b.dataset.index; }
  return '#/home?tab=' + idx + (je ? '&jeTab=' + je : '');
}
function navKey(r, kind) {
  const p0 = (r.parts[0] || 'home').replace(/\.html$/, ''), v = r.parts[1];
  if (kind === 'overlay') return p0 === 'home' ? 'home' : ({ movies: 'movies', shows: 'shows', list: 'favorites', music: 'music', discover: 'discover', calendar: 'calendar', watchlist: 'watchlist', person: '', requests: 'requests', settings: '' }[v] || '');
  if (p0 === 'home') {
    const tab = r.q.get('tab'); if (tab === '1') return 'favorites'; if (tab === '2') return 'watchlist';
    const b = $$('.headerTabs .emby-tab-button').find(x => x.dataset.index === tab); const m = b && /je-native-tab-btn-(\w+)/.exec(b.id || '');
    return m ? ({ recommendations: 'discover', requests: 'requests', calendar: 'calendar', bookmarks: 'bookmarks' }[m[1]] || '') : '';
  }
  if (p0 === 'livetv') return 'live'; if (p0 === 'games') return 'games';
  return '';
}
function setActive(key) { $$('#cx-top [data-k], .cx-tabs [data-k]').forEach(a => a.classList.toggle('on', a.dataset.k === key && key !== '')); C.activeKey = key; }

async function route() {
  const authed = window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId();
  const H = document.documentElement;
  if (!authed) { root.style.display = 'none'; ['cx-on', 'cx-frame', 'cx-full'].forEach(c => H.classList.remove(c)); if (C.top) C.top.style.display = 'none'; if (C.tabs) C.tabs.style.display = 'none'; return; }
  refreshBrand();
  $$('.sr-modal').forEach(m => m.parentElement && m.parentElement.remove());
  const r = parse(); const p0 = (r.parts[0] || 'home').replace(/\.html$/, '');
  if (p0 === 'details' && !C.allowNative && r.q.get('id')) {
    H.classList.add('cx-hold'); COVER.show();
    try { const it = await getItem(r.q.get('id')); const hh = itemHash(it); if (hh) { location.replace(hh); return; } } catch (e) { }
  }
  if (p0 === 'video') { C.allowNative = false; COVER.hide(); }
  /* the native video player stays completely stock: no skin on it */
  H.classList.toggle('cx-ready', p0 !== 'video'); H.classList.toggle('cx-pskin', p0 !== 'video' && skinOn()); H.classList.toggle('cx-vanilla', p0 === 'video');
  const tab = r.q.get('tab');
  const overlay = (p0 === 'home' && (!tab || tab === '0')) || p0 === 'c';
  const full = !overlay && FULL.test(p0);
  const frame = !overlay && !full;
  const isMusic = overlay && r.parts[1] === 'music';
  if (overlay) C.allowNative = false;
  H.classList.remove('cx-hold'); if (p0 !== 'details') COVER.hide();
  H.classList.toggle('cx-on', overlay); H.classList.toggle('cx-frame', frame); H.classList.toggle('cx-full', full);
  root.style.display = overlay ? 'block' : 'none';
  if (!C.top) buildTop();
  const showTop = (overlay && !isMusic) || frame;
  C.top.style.display = showTop ? 'flex' : 'none'; C.tabs.style.display = showTop ? '' : 'none';
  C.tabs.classList.toggle('hide', !showTop);
  if (!showTop) C.top.classList.remove('solid');
  setActive(showTop ? navKey(r, overlay ? 'overlay' : 'frame') : '');
  if (!overlay) { if (C.updateNPill) C.updateNPill(); if (p0 !== 'details') COVER.hide(); return; }
  root.classList.toggle('mode-nf', !isMusic); document.title = BRAND + (isMusic ? ' · ' + t('music') : '');
  const mode = isMusic ? 'sp' : 'nf';
  if (C.mode !== mode) { C.mode = mode; $('#cx-nf', root) && ($('#cx-nf', root).style.display = isMusic ? 'none' : 'block'); $('#cx-sp', root) && ($('#cx-sp', root).style.display = isMusic ? 'grid' : 'none'); }
  try { isMusic ? await C.renderMusic(r) : await renderNF(r); } catch (e) { console.error('[cinema]', e); }
  if (C.updateNPill) C.updateNPill();
}

const skinOn = () => { try { return localStorage.getItem('cx-pskin') !== '0'; } catch (e) { return true; } };
const setSkin = on => { try { localStorage.setItem('cx-pskin', on ? '1' : '0'); } catch (e) { } document.documentElement.classList.toggle('cx-pskin', on); };
const skinLabel = () => t('pskin') + ': ' + (skinOn() ? t('on') : t('off'));

function getUI() { let u = document.getElementById('cx-ui'); if (!u) { u = h('div', { id: 'cx-ui' }); document.body.append(u); } return u; }

/* ---------- persistent top bar ---------- */
const NAVFEAT = { discover: 'discover', watchlist: 'watchlist', requests: 'requests', calendar: 'calendar', music: 'music' };
const navOn = k => { const hid = (((C.status && C.status.defaults && C.status.defaults.hiddenNav) || '') + '').split(',').map(x => x.trim()); if (hid.includes(k)) return false; return !NAVFEAT[k] || feat(NAVFEAT[k]); };
function buildTop() {
  const uiRoot = getUI();
  const L_ = (k, label, href, cls) => h('a', { 'data-k': k, href: typeof href === 'function' ? '#' : href, class: cls || '', onclick: typeof href === 'function' ? (e => { e.preventDefault(); go(href()); }) : null }, label);
  const links = h('div', { class: 'nf-links' },
    L_('home', t('home'), '#/home'), L_('movies', t('movies'), '#/c/movies'), L_('shows', t('shows'), '#/c/shows'),
    navOn('watchlist') ? L_('watchlist', 'Watchlist', '#/c/watchlist') : null, navOn('discover') ? L_('discover', t('discover'), '#/c/discover') : null,
    navOn('requests') ? L_('requests', t('requests'), '#/c/requests', 'opt') : null, navOn('calendar') ? L_('calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'opt') : null, navOn('music') ? L_('music', t('music'), '#/c/music') : null);
  const more = h('div', { class: 'nf-menu-wrap nf-more' });
  const mkPop = items_ => h('div', { class: 'nf-pop hide' }, items_.map(([k, label, href, cls, ico]) => h('a', { 'data-cx': 1, 'data-k': k, class: cls || '', href: typeof href === 'function' ? '#' : href, onclick: e => { if (typeof href === 'function') { e.preventDefault(); go(href()); } } }, ico ? ic(ico, 'ic-s') : null, label)));
  const moreItems = [['requests', t('requests'), '#/c/requests', 'm-opt', 'plus'], ['calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'm-opt', 'cal'], ['favorites', t('mylist'), '#/c/list', '', 'list'], ['bookmarks', t('bookmarks'), () => tabHref('bookmarks'), '', 'star'], ['live', 'Live TV', '#/livetv', '', 'tv'], ['games', 'Games', '#/games', '', 'film']];
  const popMore = mkPop(moreItems); const popMore2 = mkPop(moreItems.map(x => x.slice())); popMore2.classList.add('up'); uiRoot.append(popMore2);
  more.append(h('button', { class: 'nf-pillbtn', onclick: e => { e.stopPropagation(); closePops(popMore); popMore.classList.toggle('hide'); } }, t('more'), ic('down', 'ic-s')), popMore);
  const sInput = h('input', { type: 'text', placeholder: t('search') + '…', autocomplete: 'off' });
  const sWrap = h('div', { class: 'nf-search' }, h('button', { 'aria-label': t('search'), onclick: () => { sWrap.classList.toggle('open'); if (sWrap.classList.contains('open')) sInput.focus(); } }, ic('search')), sInput);
  let sT; sInput.addEventListener('input', () => { clearTimeout(sT); sT = setTimeout(() => { const v = sInput.value.trim(); if (v) go('#/c/search/' + encodeURIComponent(v)); else if (/search/.test(location.hash)) go('#/home'); }, 350); });
  sInput.addEventListener('blur', () => { if (!sInput.value) sWrap.classList.remove('open'); });
  const av = h('div', { class: 'nf-avatar' }, 'U');
  const umItem = (iconNode, label, href, fn, cls) => h('a', { 'data-cx': 1, class: 'um-item ' + (cls || ''), href: href || '#', onclick: e => { if (!href || href === '#') e.preventDefault(); closePops(); fn && fn(e); } }, h('span', { class: 'um-ic' }, iconNode), h('span', { class: 'um-l' }, label), ic('right', 'um-ch'));
  const umAv = h('div', { class: 'um-av' }, 'U'), umName = h('div', { class: 'um-name' }, '');
  const mobileItems = [['discover', t('discover'), '#/c/discover', 'star'], ['watchlist', 'Watchlist', '#/c/watchlist', 'plus'], ['favorites', t('mylist'), '#/c/list', 'list'], ['requests', t('requests'), '#/c/requests', 'queue'], ['calendar', t('calendar'), (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'cal'], ['live', 'Live TV', '#/livetv', 'tv']].map(([k, label, href, i]) => umItem(ic(i, 'ic-s'), label, href, null, 'm-only'));
  const skinSw = h('button', { class: 'set-switch' + (skinOn() ? ' on' : ''), 'aria-label': t('pskin'), onclick: e => { e.stopPropagation(); setSkin(!skinOn()); skinSw.classList.toggle('on', skinOn()); } }, h('i'));
  const plugSlot = h('div', { class: 'um-sec plug-slot', 'data-cx': 1 });
  const popUser = h('div', { class: 'nf-pop nf-user hide' },
    h('div', { class: 'um-head', 'data-cx': 1 }, umAv, h('div', {}, umName, h('span', {}, 'Cinema'))),
    h('div', { class: 'um-sec m-only', 'data-cx': 1 }, mobileItems),
    h('div', { class: 'um-sec', 'data-cx': 1 }, umItem(ic('edit', 'ic-s'), t('settings') + ' · Cinema', '#/c/settings'), optOn('archive') ? umItem(ic('lib', 'ic-s'), t('archive'), '#/c/archive') : null, umItem(ic('tv', 'ic-s'), t('quickConnect'), '#', () => quickConnectDialog()), umItem(ic('user', 'ic-s'), t('prefs'), '#/mypreferencesmenu'), umItem(ic('info', 'ic-s'), t('dash'), '#/dashboard')),
    plugSlot,
    h('div', { class: 'um-sec', 'data-cx': 1 }, umItem(ic('logout', 'ic-s'), t('logout'), '#', () => { try { ApiClient.logout().then(() => location.reload()); } catch (e) { location.href = '#/login'; } }, 'um-danger')));
  async function fillPlugins() {
    if (!feat('pluginMenus')) return;
    const list = (Date.now() - HARV.at < 60000 && HARV.items.length) ? HARV.items : await harvestMenus();
    plugSlot.replaceChildren(); if (!list.length) return;
    plugSlot.append(h('div', { class: 'um-h', 'data-cx': 1 }, t('pluginsH')));
    list.forEach(i => plugSlot.append(umItem(i.icon ? h('span', { class: 'material-icons' }, i.icon) : ic('list', 'ic-s'), i.label, i.href || '#', e => { if (!i.href) { if (i.el) i.el.click(); else clickNativeMenu(i.label); } })));
  }
  const menu = h('div', { class: 'nf-menu-wrap' }, h('button', { 'aria-label': 'Account', onclick: e => { e.stopPropagation(); closePops(popUser); const open = popUser.classList.toggle('hide') === false; if (open) fillPlugins(); } }, av), popUser);
  function closePops(except) { $$('.nf-pop').forEach(p => { if (p !== except) p.classList.add('hide'); }); }
  document.addEventListener('click', () => closePops());
  links.append(more);
  const top = h('div', { id: 'cx-top', class: 'nf-nav' }, h('a', { class: 'nf-logo', href: '#/home' }, BRAND.toUpperCase()), links, h('div', { class: 'nf-spacer' }), sWrap, menu);
  const tabs = h('div', { class: 'cx-tabs hide' },
    ...[['home', '#/home', 'home', t('home')], ['movies', '#/c/movies', 'film', t('movies')], ['shows', '#/c/shows', 'tv', t('shows')], ['music', '#/c/music', 'note', t('music')]].filter(x => x[0] !== 'music' || navOn('music')).map(([k, href, i, label]) => h('a', { href, 'data-k': k }, ic(i), label)));
  uiRoot.append(top, tabs);
  C.top = top; C.tabs = tabs; C.sInput = sInput;
  ApiClient.getCurrentUser().then(u => { const ini = (u.Name || 'U')[0].toUpperCase(); av.textContent = ini; umAv.textContent = ini; umName.textContent = u.Name || ''; }).catch(() => { });
  window.addEventListener('scroll', e => { const tg = e.target; const st = tg === document || tg === window ? (document.scrollingElement || document.documentElement).scrollTop : tg.scrollTop; if (tg === document || tg === window || (tg.id === 'cx-nf')) top.classList.toggle('solid', st > 40); }, { capture: true, passive: true });
}

function buildNF() {
  const nf = h('div', { id: 'cx-nf' }); const main = h('div', { id: 'nf-main' });
  nf.append(main);
  C.nf = { el: nf, main, sInput: C.sInput };
  root.append(nf);
}

/* ---------- shared UX: cover, peek popover, item menu, watchlist ---------- */
const COVER = (() => { let el = null; return { show() { if (!el) { el = h('div', { id: 'cx-cover' }, h('div', { class: 'spinner', style: 'margin:0' })); getUI().append(el); } el.classList.add('show'); clearTimeout(COVER.t); COVER.t = setTimeout(() => COVER.hide(), 12000); }, hide() { if (el) el.classList.remove('show'); clearTimeout(COVER.t); } }; })();

/* watchlist = Jellyfin "Likes" (same data KefinTweaks uses), optionally mirrored to the Seerr watchlist */
const isWatch = it => ud(it).Likes === true;
async function toggleWatch(it) {
  const on = !isWatch(it);
  try {
    if (on) await ApiClient.updateUserItemRating(uid(), it.Id, true); else await ApiClient.clearUserItemRating(uid(), it.Id);
    it.UserData = Object.assign(ud(it), { Likes: on ? true : null });
    toast(on ? t('wlAdded') : t('wlRemoved'));
    if (on && cfg('seerrWatchlistSync') && hasSeerr()) { const tm = (it.ProviderIds || {}).Tmdb; const mt = it.Type === 'Series' ? 'tv' : 'movie'; if (tm) try { if (usePluginSeerr()) await cpostSeerr('/watchlist', { tmdbId: +tm, mediaType: mt, title: it.Name }); else if (JE.jellyseerrAPI.addToWatchlist) await JE.jellyseerrAPI.addToWatchlist(+tm, mt); } catch (e) { console.warn('[cinema] seerr watchlist', e); } }
  } catch (e) { toast('⚠ ' + (e.message || 'error')); }
  return on;
}
async function toggleFav(it) { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData = Object.assign(ud(it), { IsFavorite: on }); return on; }
async function togglePlayed(it) { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData = Object.assign(ud(it), { Played: on }); toast(on ? t('markedWatched') : t('markedUnwatched')); return on; }

/* settings: server defaults (plugin) overridden per user (Jellyfin DisplayPreferences, synced across devices) */
const CFG_DEF = { nativePlayer: false, hero: true, peek: true, seerrWatchlistSync: false, sections: null, accent: '#e50914', infinite: true, cardSize: 'm', heroItems: 8, heroInterval: 11, peekDelay: 320 };
let CFGU = {};
const feat = k => !(C.status && C.status.features) || C.status.features[k] !== false;
const SRV = { accent: 'accent', seerrWatchlistSync: 'seerrWatchlistSync', pl_autoNext: 'pl_autoNext', pl_autoSkip: 'pl_autoSkip', pl_quality: 'pl_quality', cardSize: 'cardSize', heroItems: 'heroItems', heroInterval: 'heroInterval', peekDelay: 'peekDelay' };
function cfg(k) {
  const d = (C.status && C.status.defaults) || {}; const allow = d.allowUserOverrides !== false; const u = allow ? CFGU[k] : undefined;
  if (k === 'hero') return feat('hero') && u !== false; if (k === 'peek') return feat('peek') && u !== false; if (k === 'infinite') return feat('infiniteScroll') && u !== false;
  if (u !== undefined) return u;
  if (k === 'sections') { try { const j = d.sections && JSON.parse(d.sections); const OLD = 'continue,nextup,newMovies,newShows,top,watchlist,favs,random,genres'; if (j && j.length && !(j.length === 9 && j.every(x => x.on !== false) && j.map(x => x.id).join(',') === OLD)) return j; } catch (e) { } return null; } // the old built-in list, saved by an earlier config page, counts as "not customised"
  if (SRV[k] !== undefined && d[SRV[k]] !== undefined && d[SRV[k]] !== '') return d[SRV[k]];
  return CFG_DEF[k];
}
/* device-local settings (this browser only): player choice differs between phone and desktop */
const isMobile = () => matchMedia('(max-width: 820px), (pointer: coarse) and (max-width: 1100px)').matches;
const devGet = k => { try { return localStorage.getItem('cx-dev-' + k); } catch (e) { return null; } };
const devSet = (k, v) => { try { v == null ? localStorage.removeItem('cx-dev-' + k) : localStorage.setItem('cx-dev-' + k, v); } catch (e) { } };
const playerMode = () => { if (!feat('ownPlayer')) return 'native'; const v = devGet('player'); if (v === 'own' || v === 'native') return v; return isMobile() ? 'native' : 'own'; };
const userSet = k => CFGU[k] !== undefined;
async function loadCfg() {
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); const raw = (dp.CustomPrefs || {}).cfg; if (raw) CFGU = JSON.parse(raw) || {}; } catch (e) { }
  applyCfg();
}
async function saveCfg(patch) {
  Object.keys(patch).forEach(k => { if (patch[k] === undefined || patch[k] === null) delete CFGU[k]; else CFGU[k] = patch[k]; }); applyCfg();
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); dp.CustomPrefs = Object.assign(dp.CustomPrefs || {}, { cfg: JSON.stringify(CFGU) }); await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }), data: JSON.stringify(dp), contentType: 'application/json' }); } catch (e) { console.warn('[cinema] save cfg failed', e); }
}
function applyCfg() { const r = document.documentElement; r.style.setProperty('--accent-nf', cfg('accent') || '#e50914'); r.style.setProperty('--cs', { s: .88, m: 1, l: 1.16 }[cfg('cardSize')] || 1); }

/* ---------- peek popover (replaces card hover) ---------- */
const PEEK = { el: null, t: 0, hideT: 0, cur: null };
function scrollHost() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
function peekEl() { if (!PEEK.el) { PEEK.el = h('div', { class: 'nf-peek', onpointerenter: () => clearTimeout(PEEK.hideT), onpointerleave: () => hidePeek(120) }); PEEK.el.addEventListener('wheel', e => { const sh = scrollHost(); if (sh) sh.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'instant' }); PEEK.el.style.pointerEvents = 'none'; hidePeek(); }, { passive: true }); /* instant: the page has CSS smooth scrolling, which made every forwarded wheel tick restart a slow animation */ getUI().append(PEEK.el); } return PEEK.el; }
function hidePeek(delay) { clearTimeout(PEEK.t); clearTimeout(PEEK.hideT); PEEK.hideT = setTimeout(() => { if (PEEK.el) PEEK.el.classList.remove('show'); PEEK.cur = null; }, delay || 0); }
function showPeek(anchor, d) {
  const el = peekEl(); const r = anchor.getBoundingClientRect();
  const W = d.poster ? Math.max(250, Math.min(340, r.width * 1.5)) : Math.max(300, Math.min(400, r.width * 1.6));
  let left = r.left + r.width / 2 - W / 2; left = Math.max(12, Math.min(innerWidth - W - 12, left));
  el.style.width = W + 'px';
  const btns = h('div', { class: 'pa' }, d.actions.map(a => a === '-' ? h('span', { class: 'sp' }) : h('button', { class: a.primary ? 'pl' : (a.on ? 'on' : ''), 'aria-label': a.label, title: a.label, onclick: async e => { e.stopPropagation(); const res = await a.fn(e); if (a.refresh) a.refresh(); } }, ic(typeof a.icon === 'function' ? a.icon() : a.icon))));
  el.replaceChildren(
    h('div', { class: 'pi', onclick: () => { hidePeek(); d.open && d.open(); } }, d.img ? h('div', Object.assign({ class: 'bgi' }, bg(d.img))) : null, h('div', { class: 'pt ell' }, d.title)),
    h('div', { class: 'pb' }, btns, h('div', { class: 'pm' }, d.meta.filter(Boolean).map((m, i) => h('span', { class: m.cls || '' }, m.t || m))), d.overview ? h('div', { class: 'po clamp2' }, d.overview) : null));
  el.classList.toggle('poster', !!d.poster);
  el.classList.toggle('poster', !!d.poster);
  el.classList.remove('show'); el.style.visibility = 'hidden'; el.style.top = '0px'; el.style.left = left + 'px';
  requestAnimationFrame(() => {
    const H = el.offsetHeight; let top = r.top + r.height / 2 - H / 2 - 24; top = Math.max(80, Math.min(innerHeight - H - 12, top));
    el.style.top = top + 'px'; el.style.visibility = ''; el.style.pointerEvents = ''; requestAnimationFrame(() => el.classList.add('show'));
  });
  PEEK.cur = anchor;
}
function attachPeek(el, anchor, getDesc) {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || !cfg('peek')) return;
  el.addEventListener('pointerenter', () => { clearTimeout(PEEK.hideT); clearTimeout(PEEK.t); const wait = Math.max(0, (PEEK.noUntil || 0) - Date.now()); PEEK.t = setTimeout(() => { if (el.matches(':hover')) showPeek(anchor, getDesc()); }, wait + (PEEK.cur ? 60 : (+cfg('peekDelay') || 320))); });
  el.addEventListener('pointerleave', () => { clearTimeout(PEEK.t); hidePeek(160); });
  el.addEventListener('click', () => hidePeek());
}
/* no previews while the page is moving (slow scrolling over cards used to open and close one after another) */
const peekPause = () => { PEEK.noUntil = Date.now() + 550; clearTimeout(PEEK.t); hidePeek(); };
window.addEventListener('scroll', peekPause, { capture: true, passive: true });
window.addEventListener('wheel', peekPause, { capture: true, passive: true });

function libDesc(it, poster) {
  const isEp = it.Type === 'Episode'; const hash = itemHash(it) || '#/home';
  const wl = h('span'); const acts = [
    { icon: 'play', label: t('play'), primary: true, fn: () => { hidePeek(); it.Type === 'MusicAlbum' ? C.playAlbum(it) : playVideo(it); } },
    { icon: () => isWatch(it) ? 'check' : 'plus', label: t('watchlist'), fn: async e => { await toggleWatch(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(isWatch(it) ? 'check' : 'plus')); } },
    { icon: () => ud(it).IsFavorite ? 'heartOn' : 'heart', label: t('mylist'), fn: async e => { await toggleFav(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(ud(it).IsFavorite ? 'heartOn' : 'heart')); } },
    '-', { icon: 'more', label: t('more'), fn: e => itemMenu(e, it) }, { icon: 'down', label: t('info'), fn: () => { hidePeek(); go(hash); } }];
  return { poster: !!poster, img: poster ? (imgUrl(it, 'Primary', 600) || imgUrl(it, 'Backdrop', 700)) : (imgUrl(it, 'Backdrop', 700) || imgUrl(it, 'Thumb', 700) || imgUrl(it, 'Primary', 500)), title: isEp ? (it.SeriesName || it.Name) : it.Name, open: () => go(hash), actions: acts,
    meta: [it.CommunityRating ? { t: Math.round(it.CommunityRating * 10) + '%', cls: 'g' } : null, yearOf(it), it.OfficialRating ? { t: it.OfficialRating, cls: 'badge' } : null, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : (it.Type === 'Series' ? t('shows') : null), ...(it.Genres || []).slice(0, 2)],
    overview: isEp ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : it.Overview };
}

/* ---------- item ⋯ menu: everything Jellyfin can do with an item ---------- */
let ME = null; const me = async () => ME || (ME = await ApiClient.getCurrentUser());
async function itemMenu(e, it) {
  if (!feat('itemMenu')) return;
  e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation();
  const r = (e.currentTarget || e.target).getBoundingClientRect(); const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const canDel = admin || (user.Policy && user.Policy.EnableContentDeletion);
  const ent = [];
  ent.push({ icon: 'play', label: t('play'), fn: () => playVideo(it) });
  ent.push({ icon: isWatch(it) ? 'check' : 'plus', label: isWatch(it) ? t('wlRemove') : t('wlAdd'), fn: () => toggleWatch(it) });
  ent.push({ icon: ud(it).IsFavorite ? 'heartOn' : 'heart', label: ud(it).IsFavorite ? t('favRemove') : t('favAdd'), fn: async () => { await toggleFav(it); toast('✓'); } });
  if (it.Type !== 'Series' || true) ent.push({ icon: 'check', label: ud(it).Played ? t('markUnwatched') : t('markWatched'), fn: () => togglePlayed(it) });
  ent.push('-');
  ent.push({ icon: 'info', label: t('openDetails'), fn: () => go(itemHash(it) || '#/home') });
  if ((ud(it).PlaybackPositionTicks || 0) > 0) ent.push({ icon: 'close', label: t('rmResume'), fn: async () => { try { await jf('POST', 'UserItems/' + it.Id + '/UserData', { userId: uid() }, { PlaybackPositionTicks: 0 }); it.UserData = Object.assign(ud(it), { PlaybackPositionTicks: 0 }); toast('✓ ' + t('rmResumeDone')); C.libCache = null; route(); } catch (e) { toast('⚠ ' + (e.message || e)); } } });
  const isVid = ['Movie', 'Episode', 'Video', 'MusicVideo'].includes(it.Type);
  if (['Movie', 'Episode', 'Video', 'MusicVideo', 'Audio'].includes(it.Type) && (!user.Policy || user.Policy.EnableContentDownloading !== false)) ent.push({ icon: 'download', label: t('download'), fn: () => { const a = h('a', { href: ApiClient.getUrl('Items/' + it.Id + '/Download', { api_key: ApiClient.accessToken() }), download: '' }); document.body.append(a); a.click(); a.remove(); } });
  if (admin && isVid) ent.push({ icon: 'badge-cc', label: t('editSubs'), fn: () => nativeCommand(it.Id, ['editsubtitles']) });
  if (it.Type === 'Episode' || it.Type === 'Series') ent.push({ icon: 'close', label: t('nuHide'), fn: () => hideNextUp(it.SeriesId || it.Id) });
  if (HID.on && admin) { const hid = hxIsHiddenItem(it); ent.push('-'); ent.push({ icon: hid ? 'eye' : 'eyeOff', label: hid ? t('hxStHidden') : t('hxStVisible'), fn: () => hxToggle(it) }); }
  if (admin && it.Type === 'Movie' && optOn('archive')) { ent.push('-'); ent.push({ icon: 'download', label: t('archiveDo'), fn: () => archiveDialog(it) }); }
  if (admin) {
    ent.push('-');
    ent.push({ icon: 'edit', label: t('editMeta'), fn: () => editMeta(it.Id) });
    ent.push({ icon: 'film', label: t('editImages'), fn: () => editImages(it.Id) });
    ent.push({ icon: 'search', label: t('identify'), fn: () => identifyItem(it) });
    ent.push({ icon: 'refresh', label: t('refreshMeta'), fn: () => refreshItem(it) });
    ent.push({ icon: 'more', label: t('moreActions'), fn: () => showNativeActions(it, Math.min(r.left, innerWidth - 280), r.bottom + 6) });
  }
  if (canDel) { ent.push('-'); ent.push({ icon: 'close', label: t('delete'), fn: () => deleteItem(it) }); }
  openMenu(Math.min(r.left, innerWidth - 260), r.bottom + 6, ent);
}
/* Jellyfin's own item actions (metadata editor, image editor, identify, collections, download, plugin entries...)
   run inside an isolated copy of the web client (iframe). The page you are on is never navigated, so nothing flickers. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DUP_ACTIONS = /^(play|resume|playfromstart|edit|editmetadata|editimages|identify|refresh|delete|markplayed|markunplayed|addtofavorites|removefromfavorites)$/i;
const lite = (() => { let el = null; return { show() { if (!el) { el = h('div', { id: 'cx-lite' }, h('div', { class: 'spinner', style: 'margin:0' })); getUI().append(el); } el.classList.add('show'); }, hide() { if (el) el.classList.remove('show'); } }; })();
const FRAME_CSS = `html.cx-ready.cx-iframe:not(.transparentDocument) body, html.cx-ready.cx-iframe:not(.transparentDocument) .backgroundContainer, html.cx-ready.cx-iframe:not(.transparentDocument) .skinBody { background: transparent !important; }
html.cx-iframe, html.cx-iframe body, html.cx-iframe .skinBody, html.cx-iframe .backgroundContainer { background: transparent !important; }
html.cx-iframe #reactRoot > *, html.cx-iframe .skinHeader, html.cx-iframe .page, html.cx-iframe .mainDrawer, html.cx-iframe .nowPlayingBar, html.cx-iframe .MuiAppBar-root { visibility: hidden !important; }
html.cx-iframe dialog, html.cx-iframe .dialogContainer, html.cx-iframe .dialogBackdrop, html.cx-iframe .actionSheet, html.cx-iframe .formDialog, html.cx-iframe .MuiDialog-root, html.cx-iframe .MuiPopover-root, html.cx-iframe .toast, html.cx-iframe .toastContainer { visibility: visible !important; }`;
/* one shared frame per item: opened when the menu opens, reused for listing actions and for running one */
const NF = { id: null, p: null, t: 0 };
function dropFrame() { clearTimeout(NF.t); if (NF.p) NF.p.then(f => f.fr.remove(), () => { }); NF.id = null; NF.p = null; }
function warmFrame(id) {
  if (NF.id === id && NF.p) { clearTimeout(NF.t); NF.t = setTimeout(dropFrame, 45000); return NF.p; }
  dropFrame(); NF.id = id; NF.p = openNativeFrame(id); NF.p.catch(() => { if (NF.id === id) { NF.id = null; NF.p = null; } });
  NF.t = setTimeout(dropFrame, 45000); return NF.p;
}
async function openNativeFrame(id) {
  const fr = h('iframe', { class: 'cx-nframe', src: location.pathname + location.search + '#/details?id=' + id + '&nocinema', allow: 'fullscreen' }); getUI().append(fr);
  for (let i = 0; i < 200; i++) {
    await sleep(100);
    try {
      const d = fr.contentDocument; if (!d || !d.documentElement) continue;
      if (!d.getElementById('cx-style-f') && d.head) { d.documentElement.classList.add('cx-ready', 'cx-iframe', 'cx-pskin'); const st = d.createElement('style'); st.id = 'cx-style-f'; st.textContent = CSS_TEXT + FRAME_CSS; d.head.append(st); const fl = d.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'; d.head.append(fl); }
      const pg = d.querySelector('#itemDetailPage:not(.hide)'); const more = pg && pg.querySelector('.btnMoreCommands:not(.hide)');
      if (more) return { fr, d, more };
    } catch (e) { }
  }
  fr.remove(); throw new Error('timeout');
}
const sheetOf = d => d.querySelector('.actionSheet, .dialog.actionsheet');
const labelOf = b => ((b.querySelector('.listItemBodyText, .actionSheetItemText') || b).textContent || '').trim().replace(/\s+/g, ' ');
async function openSheet(f) {
  if (sheetOf(f.d)) { const s = sheetOf(f.d); if (s.querySelectorAll('button[data-id]').length) return s; }
  f.more.click(); let sheet = null;
  for (let i = 0; i < 40 && !(sheet && sheet.querySelectorAll('button[data-id]').length); i++) { await sleep(100); sheet = sheetOf(f.d); }
  return sheet;
}
async function harvestItemMenu(id) {
  const out = [];
  try {
    const f = await warmFrame(id); const sheet = await openSheet(f);
    if (sheet) sheet.querySelectorAll('button[data-id]').forEach(b => { const id_ = b.dataset.id; if (DUP_ACTIONS.test(id_)) return; const label = labelOf(b); const mi = (b.querySelector('.material-icons, .actionsheetMenuItemIcon') || {}).textContent; if (label) out.push({ id: id_, label, mi: mi && mi.length < 40 ? mi.trim() : '' }); });
    const bd = f.d.querySelector('.dialogBackdrop'); sheet && f.d.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
  } catch (e) { console.warn('[cinema] harvest item menu', e); }
  return out;
}
async function runFrameCommand(id, cmds) {
  lite.show(); let fr = null;
  try {
    const f = await warmFrame(id); fr = f.fr; clearTimeout(NF.t); NF.id = null; NF.p = null;
    let btn = null; const sh0 = await openSheet(f);
    for (let i = 0; i < 20 && !btn; i++) { const sh = sheetOf(f.d); btn = sh && cmds.map(c => sh.querySelector('button[data-id="' + c + '"]')).find(Boolean); if (!btn) await sleep(100); }
    if (!btn) { toast(t('cmdNA')); fr.remove(); lite.hide(); return; }
    btn.click();
    for (let i = 0; i < 60; i++) { await sleep(100); let ready = false; try { ready = !!f.d.querySelector('.formDialog:not(.actionSheet), dialog[open]:not(.actionsheet):not(.actionSheet), .MuiDialog-root'); } catch (e) { } if (ready) break; }
    await sleep(120); fr.classList.add('show'); lite.hide();
    let seen = false, gone = 0, waited = 0;
    await new Promise(res => {
      const iv = setInterval(() => {
        let open = false; try { open = !!f.d.querySelector('dialog[open], .dialogContainer .dialog, .formDialog, .actionSheet'); } catch (e) { clearInterval(iv); return res(); }
        if (open) { seen = true; gone = 0; } else if (seen && ++gone >= 2) { clearInterval(iv); res(); }
        if (!seen && ++waited > 14) { clearInterval(iv); res(); }
      }, 350);
    });
  } catch (e) { console.warn('[cinema] native command', e); toast(t('cmdNA')); }
  if (fr) fr.remove(); lite.hide(); refreshView();
}
function refreshView() { C.libCache = null; try { resetSeerrCache(); } catch (e) { } route(); }
function nativeCommand(id, cmds) {
  hidePeek(); closeMenu();
  if (!cmds) { C.allowNative = true; location.hash = '#/details?id=' + id; return; }
  runFrameCommand(id, cmds);
}
async function showNativeActions(it, x, y) {
  lite.show(); const list = await harvestItemMenu(it.Id); lite.hide();
  if (!list.length) { toast(t('cmdNA')); return; }
  openMenu(x, y, list.map(e => ({ mi: e.mi, label: e.label, fn: () => nativeCommand(it.Id, [e.id]) })));
}

async function hideNextUp(seriesId) { const l = (CFGU.nuHide || []).slice(); if (!l.includes(seriesId)) l.push(seriesId); await saveCfg({ nuHide: l }); toast('✓ ' + t('nuDone')); route(); }

Object.assign(TX.en, { rmResume: 'Remove from Continue watching', rmResumeDone: 'Removed from Continue watching' });
Object.assign(TX.de, { rmResume: 'Aus "Weiterschauen" entfernen', rmResumeDone: 'Aus "Weiterschauen" entfernt' });

/* ---------- own editors: images, metadata, identify, refresh, delete (straight against the Jellyfin API, no native page involved) ---------- */
async function jf(method, path, params, body, ctype) {
  const r = await fetch(ApiClient.getUrl(path, params || {}), { method, headers: Object.assign({ Authorization: 'MediaBrowser Client="Cinema", Device="Web", DeviceId="cinema-web", Version="1.0", Token="' + ApiClient.accessToken() + '"' }, body != null ? { 'Content-Type': ctype || 'application/json' } : {}), body: body == null ? undefined : (ctype ? body : JSON.stringify(body)) });
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 140));
  const tx = await r.text(); try { return tx ? JSON.parse(tx) : null; } catch (e) { return tx; }
}
function cxDialog(title, opts) {
  opts = opts || {}; let changed = false;
  const bgEl = h('div', { class: 'cxd-bg' }); const body = h('div', { class: 'cxd-body' }); const foot = h('div', { class: 'cxd-foot' });
  const onk = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const close = () => { document.removeEventListener('keydown', onk, true); bgEl.classList.remove('show'); setTimeout(() => bgEl.remove(), 220); if (api_.changed) refreshView(); };
  const titleEl = h('b', {});
  titleEl.textContent = title;
  const box = h('div', { class: 'cxd' + (opts.wide ? ' wide' : '') }, h('div', { class: 'cxd-head' }, titleEl, h('button', { class: 'cxd-x', 'aria-label': 'Close', onclick: close }, ic('close'))), body, foot);
  bgEl.append(box); bgEl.addEventListener('mousedown', e => { if (e.target === bgEl) close(); });
  getUI().append(bgEl); requestAnimationFrame(() => bgEl.classList.add('show')); document.addEventListener('keydown', onk, true);
  const api_ = { el: box, body, foot, close, changed: false, setTitle: s => { titleEl.textContent = s; }, busy: () => body.replaceChildren(h('div', { class: 'spinner', style: 'margin:60px auto' })) };
  return api_;
}
const errBox = (d, e) => d.body.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + (e.message || e)));
const field = (label, ctl, hint) => h('label', { class: 'cxd-f' }, h('span', {}, label), ctl, hint ? h('small', {}, hint) : null);

/* ----- images ----- */
const IMG_TYPES = [['Primary', 'imgPrimary'], ['Backdrop', 'imgBackdrop'], ['Logo', 'imgLogo'], ['Thumb', 'imgThumb'], ['Banner', 'imgBanner'], ['Art', 'imgArt'], ['Disc', 'imgDisc']];
async function editImages(id) {
  const d = cxDialog(t('editImages'), { wide: true });
  const imgSrc = (type, idx, w, tag) => ApiClient.getUrl('Items/' + id + '/Images/' + type + (idx == null ? '' : '/' + idx), { maxWidth: w, tag: tag || '', quality: 85 });
  async function main() {
    d.setTitle(t('editImages')); d.foot.replaceChildren(); d.busy();
    let infos; try { infos = await jf('GET', 'Items/' + id + '/Images'); } catch (e) { return errBox(d, e); }
    const sec = ([type, key]) => {
      const list = infos.filter(i => i.ImageType === type); const always = ['Primary', 'Backdrop', 'Logo', 'Thumb'].includes(type);
      if (!list.length && !always) return null;
      const upl = h('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: async e => { const f = e.target.files[0]; if (!f) return; d.busy(); try { const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(f); }); await jf('POST', 'Items/' + id + '/Images/' + type, null, b64, f.type || 'image/jpeg'); d.changed = true; toast('✓'); } catch (er) { toast('⚠ ' + er.message); } main(); } });
      return h('section', { class: 'cxd-sec' }, h('div', { class: 'cxd-sh' }, h('h3', {}, t(key)), h('div', { class: 'cxd-sa' },
        h('button', { class: 'cxd-chip', onclick: () => remote(type, key) }, ic('search', 'ic-s'), t('searchOnline')), h('button', { class: 'cxd-chip', onclick: () => upl.click() }, ic('plus', 'ic-s'), t('upload')), upl)),
        list.length ? h('div', { class: 'cxd-grid' }, list.map(i => h('div', { class: 'cxd-img' }, h('div', Object.assign({ class: 'ci ' + type.toLowerCase() }, bg(imgSrc(type, i.ImageIndex, 420, i.ImageTag))), h('button', { class: 'cxd-del', 'aria-label': t('delete'), onclick: async () => { d.busy(); try { await jf('DELETE', 'Items/' + id + '/Images/' + type + (i.ImageIndex == null ? '' : '/' + i.ImageIndex)); d.changed = true; } catch (er) { toast('⚠ ' + er.message); } main(); } }, ic('close', 'ic-s'))), h('small', {}, (i.Width && i.Height ? i.Width + ' × ' + i.Height : '') + (i.Size ? ' · ' + Math.round(i.Size / 1024) + ' KB' : ''))))) : h('div', { class: 'cxd-none' }, t('noImages')));
    };
    d.body.replaceChildren(...IMG_TYPES.map(sec).filter(Boolean));
  }
  async function remote(type, key, allLang) {
    d.setTitle(t(key) + ' · ' + t('searchOnline')); d.busy();
    d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: main }, ic('left'), t('back')), h('label', { class: 'cxd-chk' }, h('input', { type: 'checkbox', checked: !!allLang, onchange: e => remote(type, key, e.target.checked) }), t('allLangs')));
    let r; try { r = await jf('GET', 'Items/' + id + '/RemoteImages', { type, startIndex: 0, limit: 60, includeAllLanguages: !!allLang }); } catch (e) { return errBox(d, e); }
    const imgs = r.Images || []; if (!imgs.length) { d.body.replaceChildren(h('div', { class: 'nf-empty' }, t('noImages'))); return; }
    d.body.replaceChildren(h('div', { class: 'cxd-grid rem' }, imgs.map(i => h('button', { class: 'cxd-img pick', onclick: async () => { d.busy(); try { await jf('POST', 'Items/' + id + '/RemoteImages/Download', { type, imageUrl: i.Url, providerName: i.ProviderName }); d.changed = true; toast('✓'); } catch (er) { toast('⚠ ' + er.message); } main(); } },
      h('div', Object.assign({ class: 'ci ' + type.toLowerCase() }, bg(i.ThumbnailUrl || i.Url))), h('small', {}, [i.ProviderName, i.Width && i.Height ? i.Width + '×' + i.Height : '', i.Language ? i.Language.toUpperCase() : ''].filter(Boolean).join(' · '))))));
  }
  main();
}

/* ----- metadata ----- */
async function editMeta(id) {
  const d = cxDialog(t('editMeta'), { wide: true }); d.busy();
  let it; try { it = await ApiClient.getItem(uid(), id); } catch (e) { return errBox(d, e); }
  const csv = a => (a || []).join(', '); const inp = (v, type) => h('input', { type: type || 'text', value: v == null ? '' : v });
  const f = { Name: inp(it.Name), OriginalTitle: inp(it.OriginalTitle), SortName: inp(it.ForcedSortName || ''), Overview: h('textarea', { rows: 6 }, it.Overview || ''), Tagline: inp((it.Taglines || [])[0] || ''), Genres: inp(csv(it.Genres)), Tags: inp(csv(it.Tags)), Studios: inp(csv((it.Studios || []).map(s => s.Name))), Year: inp(it.ProductionYear, 'number'), Premiere: inp(it.PremiereDate ? it.PremiereDate.slice(0, 10) : '', 'date'), Rating: inp(it.OfficialRating), Community: inp(it.CommunityRating, 'number'), Critic: inp(it.CriticRating, 'number') };
  f.Community.step = '0.1'; const lock = h('input', { type: 'checkbox', checked: !!it.LockData });
  const split = s => s.split(',').map(x => x.trim()).filter(Boolean);
  const ovF = field(t('fOverview'), f.Overview); ovF.classList.add('full');
  d.body.replaceChildren(h('div', { class: 'cxd-form' }, field(t('fName'), f.Name), field(t('fOrig'), f.OriginalTitle), field(t('fSort'), f.SortName), field(t('fTagline'), f.Tagline), ovF,
    field(t('fGenres'), f.Genres, t('fComma')), field(t('fTags'), f.Tags, t('fComma')), field(t('fStudios'), f.Studios, t('fComma')), field(t('fYear'), f.Year), field(t('fPremiere'), f.Premiere), field(t('fRating'), f.Rating), field(t('fCommunity'), f.Community), field(t('fCritic'), f.Critic),
    h('label', { class: 'cxd-chk full' }, lock, t('fLock'))));
  const save = h('button', { class: 'btn white', onclick: async () => {
    save.disabled = true;
    try {
      Object.assign(it, { Name: f.Name.value, OriginalTitle: f.OriginalTitle.value, ForcedSortName: f.SortName.value, Overview: f.Overview.value, Taglines: f.Tagline.value ? [f.Tagline.value] : [], Genres: split(f.Genres.value), Tags: split(f.Tags.value), ProductionYear: f.Year.value ? +f.Year.value : null, OfficialRating: f.Rating.value, CommunityRating: f.Community.value ? +f.Community.value : null, CriticRating: f.Critic.value ? +f.Critic.value : null, LockData: lock.checked });
      it.GenreItems = it.Genres.map(n => ({ Name: n })); it.TagItems = it.Tags.map(n => ({ Name: n })); it.Studios = split(f.Studios.value).map(n => ({ Name: n }));
      if (f.Premiere.value) it.PremiereDate = new Date(f.Premiere.value + 'T00:00:00Z').toISOString();
      await jf('POST', 'Items/' + id, null, it); d.changed = true; toast('✓ ' + t('saved')); d.close();
    } catch (e) { toast('⚠ ' + e.message); save.disabled = false; }
  } }, t('save'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), save);
}

/* ----- identify ----- */
function identifyItem(it) {
  const d = cxDialog(t('identify'), { wide: true });
  const kind = { Movie: 'Movie', Series: 'Series', BoxSet: 'BoxSet', MusicAlbum: 'MusicAlbum', MusicArtist: 'MusicArtist', Person: 'Person' }[it.Type]; if (!kind) { errBox(d, { message: 'n/a' }); return; }
  const name = h('input', { type: 'text', value: it.Name }), year = h('input', { type: 'number', value: it.ProductionYear || '', placeholder: t('fYear') }); const res = h('div', { class: 'cxd-results' });
  const go_ = async () => {
    res.replaceChildren(h('div', { class: 'spinner', style: 'margin:40px auto' }));
    try {
      const r = await jf('POST', 'Items/RemoteSearch/' + kind, null, { SearchInfo: { Name: name.value, Year: year.value ? +year.value : null, ProviderIds: {} }, ItemId: id_(), IncludeDisabledProviders: true });
      if (!r.length) { res.replaceChildren(h('div', { class: 'nf-empty' }, t('idNone'))); return; }
      res.replaceChildren(...r.map(x => h('button', { class: 'cxd-res', onclick: async () => { d.busy(); d.foot.replaceChildren(); try { await jf('POST', 'Items/RemoteSearch/Apply/' + it.Id, { ReplaceAllImages: true }, x); d.changed = true; toast('✓ ' + t('idApplied')); d.close(); } catch (e) { errBox(d, e); } } },
        h('div', Object.assign({ class: 'rp' }, bg(x.ImageUrl || ''))), h('div', { class: 'rt' }, h('b', {}, x.Name + (x.ProductionYear ? ' (' + x.ProductionYear + ')' : '')), h('small', {}, x.SearchProviderName || ''), x.Overview ? h('p', {}, x.Overview) : null))));
    } catch (e) { res.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + e.message)); }
  };
  const id_ = () => it.Id;
  name.addEventListener('keydown', e => { if (e.key === 'Enter') go_(); });
  d.body.replaceChildren(h('div', { class: 'cxd-bar' }, name, year, h('button', { class: 'btn white', onclick: go_ }, ic('search'), t('idSearch'))), h('p', { class: 'cxd-hint' }, t('idHint')), res);
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')));
}

/* ----- refresh ----- */
function refreshItem(it) {
  const d = cxDialog(t('refreshMeta')); let mode = 'missing'; const opts = [['scan', 'rfScan'], ['missing', 'rfMissing'], ['replace', 'rfReplace']];
  const imgs = h('input', { type: 'checkbox' });
  const list = h('div', { class: 'cxd-opts' }, opts.map(([k, key]) => h('label', { class: 'cxd-opt' + (k === mode ? ' on' : ''), onclick: e => { mode = k; $$('.cxd-opt', list).forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); imgRow.style.display = k === 'replace' ? '' : 'none'; } }, h('b', {}, t(key)), h('small', {}, t(key + 'Hint')))));
  const imgRow = h('label', { class: 'cxd-chk', style: 'display:none' }, imgs, t('rfImages'));
  d.body.replaceChildren(list, imgRow);
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    const q = { Recursive: true, ImageRefreshMode: mode === 'scan' ? 'Default' : 'FullRefresh', MetadataRefreshMode: mode === 'scan' ? 'Default' : 'FullRefresh', ReplaceAllImages: mode === 'replace' && imgs.checked, ReplaceAllMetadata: mode === 'replace' };
    try { await jf('POST', 'Items/' + it.Id + '/Refresh', q); toast('✓ ' + t('rfStarted')); d.close(); setTimeout(refreshView, 4000); } catch (e) { toast('⚠ ' + e.message); }
  } }, ic('refresh'), t('rfStart'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ----- delete ----- */
function deleteItem(it) {
  const d = cxDialog(t('delete'));
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'font-size:15px;color:#e4e4e8' }, t('delConfirm').replace('{n}', it.Name)));
  const go_ = h('button', { class: 'btn danger', onclick: async () => { go_.disabled = true; try { await jf('DELETE', 'Items/' + it.Id); toast('✓ ' + t('delDone')); d.close(); location.hash = '#/home'; } catch (e) { toast('⚠ ' + e.message); go_.disabled = false; } } }, ic('close'), t('delete'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ----- Quick Connect: sign in another device (TV app, ...) with the code it shows ----- */
function quickConnectDialog() {
  const d = cxDialog(t('qcTitle')); const inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 8, placeholder: '123456', style: 'font-size:26px;letter-spacing:.25em;text-align:center' }); const st = h('p', { class: 'cxd-hint', style: 'text-align:center;min-height:20px' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    const code = inp.value.replace(/\D/g, ''); if (code.length < 4) return; go_.disabled = true; st.textContent = '…';
    try { const ok = await jf('POST', 'QuickConnect/Authorize', { code, userId: uid() }); if (ok === true || ok === 'true' || (ok && ok.Authenticated)) { st.textContent = '✓ ' + t('qcOk'); toast('✓ ' + t('qcOk')); setTimeout(d.close, 900); } else { st.textContent = '⚠ ' + t('qcBad'); go_.disabled = false; } }
    catch (er) { st.textContent = '⚠ ' + t('qcBad'); go_.disabled = false; }
  } }, ic('check'), t('qcGo'));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go_.click(); });
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('qcHint')), inp, st); d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_); setTimeout(() => inp.focus(), 250);
}

/* ---------- extra pages: watchlist, person, infinite grids ---------- */
function infiniteGrid(container, fetchPage, makeCard, pageSize) {
  pageSize = pageSize || 60;
  const grid = h('div', { class: 'nf-grid' }); const sentinel = h('div', { style: 'height:2px' }); container.append(grid, sentinel);
  let start = 0, done = false, busy = false;
  async function more() {
    if (busy || done || !grid.isConnected) return; busy = true;
    try {
      const r = await fetchPage(start, pageSize); const arr = r.Items || r;
      arr.forEach(i => grid.append(makeCard(i))); start += arr.length;
      if (r.done !== undefined) done = !!r.done; else if (arr.length < pageSize || (r.TotalRecordCount != null && start >= r.TotalRecordCount)) done = true;
    } catch (e) { done = true; console.warn('[cinema] page failed', e); }
    busy = false;
    if (!done && sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 500) more();
  }
  if (cfg('infinite') === false) { pageSize = 400; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) more(); }, { root: C.nf.el, rootMargin: '700px' });
  io.observe(sentinel); more();
  return { grid, reload() { grid.replaceChildren(); start = 0; done = false; more(); } };
}

Object.assign(TX.en, { wlReq: 'On your Seerr watchlist · not in the library yet', wlSynced: 'Added to your watchlist' });
Object.assign(TX.de, { wlReq: 'Auf deiner Seerr-Watchlist · noch nicht in der Bibliothek', wlSynced: 'Zur Watchlist hinzugefügt' });
/* my own Seerr requests (the Seerr account is matched through the Jellyfin user id) */
async function myRequests() {
  const r = await seerrGet('/request', { take: 300, skip: 0, filter: 'all', sort: 'added' }); const me_ = String(uid()).replace(/-/g, '').toLowerCase();
  return (r.results || []).filter(q => q.media && q.media.tmdbId && String((q.requestedBy && q.requestedBy.jellyfinUserId) || '').replace(/-/g, '').toLowerCase() === me_);
}
/* a request that became available is added to the Jellyfin watchlist once (processed request ids are kept per user, so removing it again sticks) */
const WLSYNC = { busy: false };
async function syncWatchlist() {
  if (WLSYNC.busy || !feat('watchlist') || !hasSeerr()) return; WLSYNC.busy = true;
  try {
    const avail = (await myRequests()).filter(q => q.status === 2 && q.media.status === 5); const seen = new Set(CFGU.wlSeen || []);
    if (!CFGU.wlSeen) { await saveCfg({ wlSeen: avail.map(q => q.id) }); return; } // first run: only requests that finish from now on
    const todo = avail.filter(q => !seen.has(q.id)); if (!todo.length) return;
    resetSeerrCache(); const lm = await libMap(); let added = 0;
    for (const q of todo) {
      const it = lm[q.media.mediaType + ':' + q.media.tmdbId]; if (!it) continue; // not scanned into the library yet: try again later
      if (!isWatch(it)) { await ApiClient.updateUserItemRating(uid(), it.Id, true); added++; } seen.add(q.id);
    }
    if (seen.size !== (CFGU.wlSeen || []).length) await saveCfg({ wlSeen: [...seen].slice(-600) });
    if (added) { toast('✓ ' + t('wlSynced') + (added > 1 ? ' (' + added + ')' : '')); C.libCache = null; if (/watchlist/.test(location.hash)) route(); }
  } catch (e) { console.warn('[cinema] watchlist sync', e); } finally { WLSYNC.busy = false; }
}
async function watchlistView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('watchlist'))); page.append(wrap);
  let type = 'Movie,Series';
  const chips = h('div', { class: 'nf-seasons' }, [['Movie,Series', t('all')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === type ? ' on' : ''), onclick: e => { type = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); drawReq(); } }, l)));
  wrap.append(chips);
  const g = infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: type, Filters: 'Likes', SortBy: 'DateCreated', SortOrder: 'Descending', StartIndex: s, Limit: n }), i => card(i, 'poster'));
  const reqBox = h('div', { class: 'wl-req' }); wrap.append(reqBox); let sw = null;
  async function drawReq() {
    if (!hasSeerr()) return;
    try { if (!sw) { sw = []; for (let p = 1; p <= 6; p++) { const r = await seerrGet('/discover/watchlist', { page: p }); (r.results || []).forEach(x => { if (x.tmdbId && !sw.some(y => y.tmdbId === x.tmdbId && y.mediaType === x.mediaType)) sw.push({ mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', tmdbId: x.tmdbId }); }); if (p >= (r.totalPages || 1)) break; } } } catch (e) { return; }
    const lm = await libMap(), rm = await reqMap();
    const list = sw.filter(x => !lm[x.mediaType + ':' + x.tmdbId] && (type === 'Movie,Series' || (type === 'Movie') === (x.mediaType !== 'tv'))); reqBox.replaceChildren(); if (!list.length) return;
    const grid = h('div', { class: 'nf-grid' }); reqBox.append(h('h2', { class: 'nf-sect-title', style: 'margin:34px 0 14px' }, t('wlReq')), grid);
    list.forEach(async x => {
      const slot = h('div', { style: 'display:contents' }); grid.append(slot);
      try { const meta = await reqMeta({ mediaType: x.mediaType, tmdbId: x.tmdbId }); slot.append(dCard(Object.assign({}, meta, { id: x.tmdbId, mediaType: x.mediaType }), lm, rm)); } catch (e) { slot.remove(); }
    });
  }
  syncWatchlist(); drawReq();
  setTimeout(() => { if (!g.grid.children.length && !reqBox.children.length) g.grid.after(h('div', { class: 'nf-empty' }, t('empty'))); }, 3000);
}

async function personView(page, id) {
  const p = await getItem(id);
  const body = h('div', { class: 'nf-page-pad' }); page.append(body);
  const img = imgUrl(p, 'Primary', 500);
  body.append(h('div', { class: 'nf-dhead', style: 'align-items:flex-start;margin-bottom:34px' },
    h('div', Object.assign({ class: 'nf-dposter', style: 'border-radius:50%;aspect-ratio:1;width:clamp(150px,16vw,240px)' }, bg(img))),
    h('div', { class: 'nf-dinfo' }, h('h1', {}, p.Name),
      h('div', { class: 'nf-meta' }, p.PremiereDate ? h('span', {}, new Date(p.PremiereDate).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })) : null, (p.ProductionLocations || [])[0] ? h('span', {}, p.ProductionLocations[0]) : null),
      h('p', { class: 'ov clamp3', style: 'cursor:pointer', onclick: e => e.currentTarget.classList.toggle('clamp3') }, (p.Overview || '').replace(/<[^>]+>/g, '')))));
  const [mv, sh] = await Promise.all([items({ PersonIds: id, IncludeItemTypes: 'Movie', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 200 }), items({ PersonIds: id, IncludeItemTypes: 'Series', SortBy: 'PremiereDate', SortOrder: 'Descending', Limit: 100 })]);
  [[t('movies'), mv.Items], [t('shows'), sh.Items]].forEach(([title, list]) => { if (list.length) body.append(h('section', { class: 'nf-sect' }, h('h2', {}, title + ' (' + list.length + ')'), h('div', { class: 'nf-grid' }, list.map(i => card(i, 'poster'))))); });
  await personNotOwned(body, p);
  if (!mv.Items.length && !sh.Items.length && !body.querySelector('.nf-sect')) body.append(h('div', { class: 'nf-empty' }, t('empty')));
}

async function personNotOwned(body, person) {
  const tm = (person.ProviderIds || {}).Tmdb; if (!tm || !(await waitSeerr())) return;
  try {
    const [lm, rm, cr] = await Promise.all([libMap(), reqMap(), seerrGet('/person/' + tm + '/combined_credits')]);
    const seen = new Set();
    const list = [].concat(cr.cast || [], cr.crew || []).filter(x => (x.mediaType === 'movie' || x.mediaType === 'tv') && x.posterPath).filter(x => { const k = x.mediaType + x.id; if (seen.has(k)) return false; seen.add(k); return true; })
      .filter(x => dStatus(x, lm, rm).k !== 'own').sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 60);
    if (!list.length) return;
    body.append(h('section', { class: 'nf-sect' }, h('h2', {}, t('notInLib') + ' (' + list.length + ')'), h('div', { class: 'nf-grid' }, list.map(x => dCard(x, lm, rm)))));
  } catch (e) { console.warn('[cinema] person credits', e); }
}

/* full page for a home row: everything that matches (genre, decade, collection, library ...) */
async function browseListView(page, kind, param) {
  const wrap = h('div', { class: 'nf-page-pad' }); page.append(wrap);
  let title = param; const base = {};
  if (kind === 'genre') base.Genres = param;
  else if (kind === 'decade') { title = t('fromDecade') + ' ' + param + 's'; base.Years = Array.from({ length: 10 }, (_, i) => +param + i).join(','); }
  else if (kind === 'collection' || kind === 'library') { base.ParentId = param; try { title = (await getItem(param)).Name; } catch (e) { } }
  else if (kind === 'top') { title = t('top'); base.MinCommunityRating = 7; }
  else if (kind === 'unwatched') { title = t('unwatched'); base.Filters = 'IsUnplayed'; }
  wrap.append(h('h1', {}, title));
  const st = { type: kind === 'collection' || kind === 'library' ? '' : 'Movie,Series', sort: kind === 'top' ? 'CommunityRating' : 'SortName', order: kind === 'top' ? 'Descending' : 'Ascending' };
  const bar = h('div', { class: 'dc-bar', style: 'margin-left:0' });
  if (st.type) bar.append(h('div', { style: 'display:flex;gap:8px' }, [['Movie,Series', t('browseAll')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.nf-chip', e.currentTarget.parentElement).forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); } }, l))));
  const sel = h('select', { onchange: e => { const [s_, o] = e.target.value.split(':'); st.sort = s_; st.order = o; g.reload(); } }, [['SortName:Ascending', t('sortName')], ['CommunityRating:Descending', t('sortRating')], ['DateCreated:Descending', t('sortAdded')], ['PremiereDate:Descending', t('sortYear')], ['Random:Ascending', t('sortRandom')]].map(([v, l]) => h('option', { value: v, selected: v.startsWith(st.sort + ':') }, l)));
  bar.append(sel); wrap.append(bar);
  const g = infiniteGrid(wrap, (s, n) => items(Object.assign({ IncludeItemTypes: st.type || 'Movie,Series,BoxSet', SortBy: st.sort, SortOrder: st.order, StartIndex: s, Limit: n }, base)), i => card(i, 'poster'));
}

async function seerrWatch(x) { try { await cpostSeerr('/watchlist', { tmdbId: +x.id, mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', title: x.title || x.name }); toast(t('wlAdded')); } catch (e) { toast('⚠ ' + ((e.responseJSON && e.responseJSON.message) || 'Seerr')); } }

/* ---------- configurable home sections, settings page, requests page ---------- */
const SEC = {
  continue: { label: () => t('continue'), run: () => api('Users/' + uid() + '/Items/Resume', { Limit: 20, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  nextup: { label: () => t('nextup'), run: () => api('Shows/NextUp', { userId: uid(), Limit: 50, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }).then(r => { const hide = new Set(CFGU.nuHide || []); r.Items = r.Items.filter(i => !hide.has(i.SeriesId) && !(i.ParentIndexNumber === 1 && i.IndexNumber === 1)).slice(0, 20); return r; }), kind: 'thumb' },
  newMovies: { label: () => t('newMovies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/movies' },
  newShows: { label: () => t('newShows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/shows' },
  top: { label: () => t('top'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), kind: 'thumb' },
  watchlist: { label: () => t('watchlist'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'Likes', Limit: 30 }), kind: 'poster', href: '#/c/watchlist' },
  favs: { label: () => t('favs'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 30 }), kind: 'poster', href: '#/c/list' },
  random: { label: () => t('random'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), kind: 'thumb' },
  because: { label: () => t('because'), kind: 'poster', run: async () => { const r = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 1 }); const last = r.Items[0]; if (!last) return []; SEC.because.title = t('because') + ' ' + last.Name; return api('Items/' + last.Id + '/Similar', { userId: uid(), limit: 20, Fields: F_BASE }); } },
  top10Movies: { label: () => t('top10Movies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating,SortName', SortOrder: 'Descending', Limit: 10, MinCommunityRating: 6.5, Fields: F_BASE }), kind: 'top10' },
  top10Shows: { label: () => t('top10Shows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'CommunityRating,SortName', SortOrder: 'Descending', Limit: 10, Fields: F_BASE }), kind: 'top10' },
  spotlight: { label: () => t('spotlight'), run: () => items({ IncludeItemTypes: 'Movie,Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 12, HasOverview: true, Fields: F_BASE + ',Overview' }).then(r => { r.Items = r.Items.filter(i => i.BackdropImageTags && i.BackdropImageTags.length || i.ParentBackdropImageTags); return r; }), kind: 'spotlight' },
  genreTiles: { label: () => t('genreTiles'), tiles: true },
  recentEps: { label: () => t('recentEps'), run: () => api('Users/' + uid() + '/Items/Latest', { IncludeItemTypes: 'Episode', Limit: 24, Fields: F_BASE, GroupItems: false, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  collections: { label: () => t('collections'), run: () => items({ IncludeItemTypes: 'BoxSet', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), kind: 'poster', min: 2 },
  unwatched: { label: () => t('unwatched'), run: () => items({ IncludeItemTypes: 'Movie', Filters: 'IsUnplayed', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), kind: 'thumb' },
  decade: { label: p => p.title || t('decade'), custom: true, run: p => { const a = +p.param; return items({ IncludeItemTypes: 'Movie', Years: Array.from({ length: 10 }, (_, i) => a + i).join(','), SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24 }); }, kind: 'poster' },
  genres: { label: () => t('genresRandom'), multi: true },
  seerrTrending: { label: () => t('trending') + ' (Seerr)', seerr: '/discover/trending' },
  seerrMovies: { label: () => t('popMovies') + ' (Seerr)', seerr: '/discover/movies' },
  seerrRec: { label: () => t('seerrRec'), seerrRec: true },
  genre: { label: p => p.param, custom: true, run: p => items({ IncludeItemTypes: p.itype || 'Movie,Series', Genres: p.param, SortBy: 'Random', Limit: 24 }), kind: 'thumb' },
  collection: { label: p => p.title || t('collection'), custom: true, run: p => items({ ParentId: p.param, SortBy: 'PremiereDate', Limit: 40 }), kind: 'poster' },
  library: { label: p => p.title || 'Library', custom: true, run: p => items({ ParentId: p.param, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), kind: 'poster' }
};
const DEFAULT_SECTIONS = ['continue', 'nextup', 'spotlight', 'top10Movies', 'newMovies', 'recentEps', 'newShows', 'genreTiles', 'top10Shows', 'watchlist', 'collections', 'top', 'unwatched', 'favs', 'random', 'genres'].map(id => ({ id, on: true }));
const sectionsCfg = () => { const c = cfg('sections'); return c && c.length ? c : DEFAULT_SECTIONS; };

async function homeView2(page) {
  const heroHost = h('div', { class: 'nf-hero-host', style: 'min-height:90px' }); page.append(heroHost);
  if (cfg('hero') !== false) heroFor('Movie,Series').then(hero => { if (hero.length && heroHost.isConnected) heroHost.replaceChildren(heroEl(hero)); heroHost.style.minHeight = ''; }).catch(() => { });
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const list = sectionsCfg().filter(s => s.on !== false && SEC[s.id]);
  const first = list.slice(0, 7), rest = list.slice(7);
  const render = s => {
    const d = SEC[s.id];
    if (d.multi) return genreRows(rows, 'Movie', s.n || 4);
    if (d.tiles) return genreTilesRow(rows);
    if (d.seerr) return seerrRow(rows, s.title || d.label(s), d.seerr);
    if (d.seerrRec) return seerrRecRow(rows);
    const title = s.title || (s.id === 'because' ? null : d.label(s));
    if (s.id === 'because') { const ph = h('div', { class: 'nf-rowph' }); rows.append(ph); Promise.resolve(d.run(s)).then(l => { const arr = (l && l.Items) || l || []; if (arr.length) ph.replaceWith(row(d.title || t('because'), arr, d.kind)); else ph.remove(); }).catch(() => ph.remove()); return; }
    lazyRow(rows, title, () => d.run(s), d.kind || 'poster', { min: d.min, href: d.href || (d.custom ? '#/c/browse/' + s.id + '/' + encodeURIComponent(s.param) : undefined), min: d.min || (d.custom ? 4 : 1) });
  };
  first.forEach(render);
  if (rest.length) rest.forEach((s_, i) => setTimeout(() => { if (rows.isConnected) render(s_); }, 350 + i * 220));
  if (cfg('infinite') !== false && !TVM) setTimeout(() => { if (rows.isConnected) endlessRows(rows, page); }, 350 + rest.length * 220); // a TV has little memory: no endless rows there
}
function seerrRow(container, title, path) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  waitSeerr().then(async ok => { if (!ok) return ph.remove(); const [lm, rm, r] = await Promise.all([libMap(), reqMap(), seerrGet(path, { page: 1 })]); const arr = (r.results || []).map(x => Object.assign(x, { mediaType: x.mediaType || (path.includes('/tv') ? 'tv' : 'movie') })); if (arr.length) ph.replaceWith(row(title, arr, 'poster', { make: x => dCard(x, lm, rm), href: '#/c/discover' })); else ph.remove(); }).catch(() => ph.remove());
}
function seerrRecRow(container) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => {
    if (!(await waitSeerr())) return ph.remove();
    const r = await items({ IncludeItemTypes: 'Movie', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 5, Fields: 'ProviderIds' });
    const pick = r.Items.find(i => (i.ProviderIds || {}).Tmdb); if (!pick) return ph.remove();
    const [lm, rm, rec] = await Promise.all([libMap(), reqMap(), seerrGet('/movie/' + pick.ProviderIds.Tmdb + '/recommendations', { page: 1 })]);
    const arr = (rec.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (arr.length) ph.replaceWith(row(t('seerrRec') + ' ' + pick.Name, arr, 'poster', { make: x => dCard(x, lm, rm) })); else ph.remove();
  })().catch(() => ph.remove());
}

/* ---------- settings page (per user, synced) ---------- */
const SET_TABS = [['general', 'setGeneral', 'gear'], ['home', 'setHome', 'home'], ['player', 'setPlayer', 'play'], ['look', 'setLook', 'star'], ['services', 'setServices', 'queue'], ['adv', 'setAdv', 'info']];
async function settingsView(page) {
  const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const wrap = h('div', { class: 'nf-page-pad set-wrap' }, h('h1', {}, t('settings'))); page.append(wrap);
  const layout = h('div', { class: 'set-layout' }); const nav = h('div', { class: 'set-nav' }); const body = h('div', { class: 'set-body' }); layout.append(nav, body); wrap.append(layout);
  let cur = (location.hash.match(/tab=(\w+)/) || [])[1] || 'general';
  const locked = (featKey) => featKey && !feat(featKey);
  const card_ = (title, ...kids) => h('section', { class: 'set-card' }, title ? h('h3', {}, title) : null, kids);
  const resetBtn = key => userSet(key) ? h('button', { class: 'set-reset', title: t('resetDefault'), onclick: async e => { await saveCfg({ [key]: null }); draw(); } }, ic('refresh', 'ic-s')) : null;
  const row = (label, hint, ctrl, key, lockedBy) => h('div', { class: 'set-row' + (lockedBy ? ' locked' : '') }, h('div', {}, h('b', {}, label), hint ? h('span', {}, lockedBy ? t('lockedBy') : hint) : null), h('div', { class: 'set-ctl' }, key ? resetBtn(key) : null, ctrl));
  const sw = (key, def, onset) => { const b = h('button', { class: 'set-switch' + (cfg(key) ? ' on' : ''), role: 'switch', onclick: async () => { const v = !cfg(key); b.classList.toggle('on', v); await saveCfg({ [key]: v }); onset && onset(v); } }, h('i')); return b; };
  const toggle = (label, key, hint, featKey) => row(label, hint, sw(key), key, locked(featKey));
  const seg = (opts, key, cb) => h('div', { class: 'pl-seg set-seg' }, opts.map(([v, l]) => h('button', { class: String(cfg(key)) === String(v) ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ [key]: typeof v === 'string' && /^\d+$/.test(v) ? +v : v }); cb && cb(v); } }, l)));
  function sectionsEditor() {
    const list = h('div', { class: 'set-list' }); let secs = sectionsCfg().map(s => Object.assign({}, s)); const persist = () => saveCfg({ sections: secs });
    const names = s => SEC[s.id] ? (SEC[s.id].custom ? SEC[s.id].label(s) + ' · ' + t('custom') : SEC[s.id].label(s)) : s.id;
    function draw_() {
      list.replaceChildren(...secs.map((s, i) => h('div', { class: 'set-sec' + (s.on === false ? ' off' : '') }, h('b', {}, names(s)), h('div', { class: 'set-sec-a' },
        h('button', { 'aria-label': 'Up', onclick: () => { if (i) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; persist(); draw_(); } } }, ic('down', 'rot180')),
        h('button', { 'aria-label': 'Down', onclick: () => { if (i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; persist(); draw_(); } } }, ic('down')),
        h('button', { class: 'set-switch' + (s.on === false ? '' : ' on'), onclick: () => { s.on = s.on === false; persist(); draw_(); } }, h('i')),
        SEC[s.id] && SEC[s.id].custom ? h('button', { 'aria-label': 'Remove', onclick: () => { secs.splice(i, 1); persist(); draw_(); } }, ic('close')) : null))));
    }
    draw_();
    const types = [['genre', t('secGenre')], ['collection', t('collection')], ['library', t('secLibrary')], ['because', t('because')], ['seerrTrending', 'Seerr: ' + t('trending')], ['seerrMovies', 'Seerr: ' + t('popMovies')], ['seerrRec', t('seerrRec')], ['top10Movies', t('top10Movies')], ['top10Shows', t('top10Shows')], ['spotlight', t('spotlight')], ['genreTiles', t('genreTiles')], ['recentEps', t('recentEps')], ['collections', t('collections')], ['unwatched', t('unwatched')], ['decade', t('decade')]];
    const typeSel = h('select', {}, types.filter(([k]) => !secs.some(s => s.id === k && !SEC[k].custom)).map(([k, l]) => h('option', { value: k }, l)));
    const valSel = h('select', {});
    async function fillVals() { valSel.replaceChildren(); valSel.style.display = ''; const k = typeSel.value;
      if (k === 'genre') { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); g.Items.forEach(x => valSel.append(h('option', { value: x.Name }, x.Name))); }
      else if (k === 'collection') { const g = await items({ IncludeItemTypes: 'BoxSet', SortBy: 'SortName', Limit: 200 }); g.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
      else if (k === 'library') { const v = await api('Users/' + uid() + '/Views'); v.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
      else if (k === 'decade') { [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].forEach(y => valSel.append(h('option', { value: y, 'data-t': y + 's' }, y + 's'))); }
      else valSel.style.display = 'none'; }
    typeSel.addEventListener('change', fillVals); fillVals();
    const addBtn = h('button', { class: 'btn white', style: 'height:40px', onclick: () => { const k = typeSel.value; const o = valSel.selectedOptions[0]; secs.push(SEC[k].custom ? { id: k, on: true, param: valSel.value, title: o && o.dataset.t } : { id: k, on: true }); persist(); draw_(); } }, ic('plus'), t('add'));
    const resetB = h('button', { class: 'btn grey', style: 'height:40px', onclick: () => { secs = DEFAULT_SECTIONS.map(s => Object.assign({}, s)); saveCfg({ sections: null }); draw_(); } }, t('reset'));
    return h('div', {}, list, h('div', { class: 'set-add' }, typeSel, valSel, addBtn, resetB));
  }
  const S = {
    general: () => [card_(t('setGeneral'),
      row(t('setTv'), t('setTvHint'), (() => { const b = h('button', { class: 'set-switch' + (devGet('tv') === '1' ? ' on' : ''), role: 'switch', onclick: () => { const on = devGet('tv') !== '1'; devSet('tv', on ? '1' : null); try { localStorage.removeItem('cx-tv-force'); } catch (e) { } b.classList.toggle('on', on); setTimeout(() => location.reload(), 250); } }, h('i')); return b; })()),
      toggle(t('setHero'), 'hero', t('setHeroHint'), 'hero'), toggle(t('setPeek'), 'peek', t('setPeekHint'), 'peek'),
      row(t('setPeekDelay'), t('setPeekDelayHint'), seg([[180, t('fast')], [320, t('normal')], [520, t('slow')]], 'peekDelay'), 'peekDelay', locked('peek')),
      toggle(t('setInfinite'), 'infinite', t('setInfiniteHint'), 'infiniteScroll'))],
    home: () => [card_(t('setHero'),
      row(t('setHeroItems'), t('setHeroItemsHint'), seg([[4, '4'], [6, '6'], [8, '8'], [12, '12']], 'heroItems'), 'heroItems', locked('hero')),
      row(t('setHeroInterval'), t('setHeroIntervalHint'), seg([[6, '6 s'], [11, '11 s'], [16, '16 s'], [30, '30 s']], 'heroInterval'), 'heroInterval', locked('hero'))),
      card_(t('homeSections'), h('p', { class: 'set-hint' }, t('homeSectionsHint')), sectionsEditor())],
    player: () => [card_(t('setPlayer'),
      row(t('setDevPlayer'), t('setDevPlayerHint'), h('div', { class: 'pl-seg set-seg' }, [['own', t('plOwn')], ['native', t('plStd')]].map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); } }, l))), null, locked('ownPlayer')),
      toggle(t('plAutoNext'), 'pl_autoNext', t('plAutoNextHint'), 'ownPlayer'), toggle(t('plAutoSkip'), 'pl_autoSkip', t('plAutoSkipHint'), 'ownPlayer'),
      row(t('plQuality'), t('plQualityHint'), seg([['auto', t('plAuto')], ['20', '1080p+'], ['8', '1080p'], ['4', '720p'], ['1.5', '480p']], 'pl_quality'), 'pl_quality', locked('ownPlayer')),
      toggle(t('plRemember'), 'pl_rememberVol', '', 'ownPlayer')),
      card_(t('plTab_subs'),
        row(t('plSubSize'), '', seg([['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], 'pl_subSize'), 'pl_subSize'),
        row(t('plSubPos'), '', seg([[4, t('plLow')], [9, t('plMid')], [16, t('plHigh')]], 'pl_subPos'), 'pl_subPos'),
        row(t('plSubBg'), '', seg([['shadow', t('plShadow')], ['box', t('plBox')], ['none', t('plNone')]], 'pl_subBg'), 'pl_subBg'),
        row(t('plSubColor'), '', seg([['#ffffff', t('plWhite')], ['#ffe14d', t('plYellow')], ['#7dffb1', t('plGreen')]], 'pl_subColor'), 'pl_subColor'),
        toggle(t('plSubBold'), 'pl_subBold', ''), row(t('plSubFont'), '', seg([['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']], 'pl_subFont'), 'pl_subFont'))],
    look: () => {
      const acc = h('input', { type: 'color', value: cfg('accent') || '#e50914', onchange: async e => { await saveCfg({ accent: e.target.value }); draw(); } });
      const swatches = h('div', { class: 'set-sw' }, ['#e50914', '#ff6a3d', '#f5b301', '#34c759', '#0a84ff', '#8b5cf6', '#ff2d92', '#ffffff'].map(c => h('button', { style: 'background:' + c, class: cfg('accent') === c ? 'on' : '', 'aria-label': c, onclick: async () => { await saveCfg({ accent: c }); draw(); } })));
      return [card_(t('setLook'),
        row(t('accent'), t('accentHint'), h('div', { style: 'display:flex;gap:10px;align-items:center' }, swatches, acc), 'accent'),
        row(t('setCardSize'), t('setCardSizeHint'), seg([['s', t('small')], ['m', t('medium')], ['l', t('large')]], 'cardSize'), 'cardSize'))];
    },
    services: () => {
      const dot = (ok, name, hint) => h('div', { class: 'set-svc' }, h('i', { class: ok ? 'ok' : '' }), h('div', {}, h('b', {}, name), h('span', {}, ok ? t('connected') : t('notConnected'))), hint ? h('a', { class: 'sp-pillbtn dark', href: hint }, t('open')) : null);
      const st = C.status || {};
      return [card_(t('setServices'), dot(st.seerr, 'Seerr', '#/c/discover'), dot(st.radarr, 'Radarr', '#/c/calendar'), dot(st.sonarr, 'Sonarr', '#/c/calendar'), dot(st.aurral, 'Aurral', '#/c/music/discover'),
        admin ? h('div', { style: 'margin-top:16px' }, h('a', { class: 'btn white', style: 'display:inline-flex', href: '#/configurationpage?name=Cinema' }, ic('gear'), t('serverSettings'))) : h('p', { class: 'set-hint' }, t('askAdmin'))),
        card_(t('setWatchlist'), toggle(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint'), 'watchlist')), ...lbarchCards(card_, row)];
    },
    adv: () => [card_(t('setAdv'),
      row(t('exportSet'), t('exportSetHint'), h('div', { style: 'display:flex;gap:8px' }, h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(CFGU)); toast('✓ ' + t('copied')); } }, t('copy')), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { const raw = prompt(t('pasteSet')); if (!raw) return; try { CFGU = {}; await saveCfg(JSON.parse(raw)); draw(); toast('✓'); } catch (e) { toast('⚠ JSON'); } } }, t('impt')))),
      row(t('resetAll'), t('resetAllHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { if (!confirm(t('resetAllHint'))) return; CFGU = {}; await saveCfg({}); draw(); toast('✓'); } }, t('reset'))),
      row(t('clearCache'), t('clearCacheHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { resetSeerrCache(); resetMyTracks && resetMyTracks(); C.libCache = null; toast('✓'); } }, t('clear'))),
      row(t('killSwitch'), t('killSwitchHint'), h('code', {}, 'cinemaUI.off()'))),
      card_(t('about'), h('div', { class: 'set-about' }, h('div', {}, 'Cinema ', hxTapper(h('b', {}, (C.status && C.status.version) || '')), ' · ', h('a', { href: 'https://github.com/xDafric/jellyfin-plugin-cinema', target: '_blank', rel: 'noopener' }, 'GitHub')), h('div', { class: 'mi-pills' }, Object.entries((C.status && C.status.features) || {}).map(([k, v]) => h('i', { style: v ? '' : 'opacity:.4;text-decoration:line-through' }, k)))))]
  };
  function draw() {
    nav.replaceChildren(...SET_TABS.map(([k, label, icon]) => h('button', { class: k === cur ? 'on' : '', onclick: () => { cur = k; draw(); } }, ic(icon, 'ic-s'), t(label))));
    body.replaceChildren(...S[cur]());
  }
  draw();
}

/* ---------- requests page (Seerr) with download progress ---------- */
const reqInfoCache = {};
async function reqMeta(md) { const k = md.mediaType + ':' + md.tmdbId; if (!reqInfoCache[k]) reqInfoCache[k] = seerrGet('/' + (md.mediaType === 'tv' ? 'tv' : 'movie') + '/' + md.tmdbId).catch(() => ({})); return reqInfoCache[k]; }
function dlPct(md) { const ds = (md.downloadStatus || []).concat(md.downloadStatus4k || []); if (!ds.length) return null; const size = ds.reduce((a, d) => a + (d.size || 0), 0), left = ds.reduce((a, d) => a + (d.sizeLeft || 0), 0); return size ? Math.max(0, Math.min(100, Math.round((1 - left / size) * 100))) : null; }
async function requestsView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('requests'))); page.append(wrap);
  if (!(await waitSeerr())) { wrap.append(h('div', { class: 'nf-empty' }, 'Seerr is not available.')); return; }
  let filter = 'all'; const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const chips = h('div', { class: 'nf-seasons' }, [['all', t('all')], ['pending', t('rqPending')], ['processing', t('rqProcessing')], ['available', t('rqAvailable')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === filter ? ' on' : ''), onclick: e => { filter = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); load(); } }, l)));
  const body = h('div', { class: 'nf-grid req-grid' }); wrap.append(chips, body); queueSection(wrap);
  async function load() {
    body.replaceChildren(h('div', { class: 'spinner', style: 'grid-column:1/-1' }));
    let r; try { r = await seerrGet('/request', { take: 60, skip: 0, filter, sort: 'added' }); } catch (e) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'grid-column:1/-1' }, t('noRes'))); return; }
    const res = r.results || []; if (!res.length) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'grid-column:1/-1' }, t('empty'))); return; }
    body.replaceChildren(); const lm = await libMap();
    res.forEach(async q => {
      const md = q.media || {}; const slot = h('div', { class: 'nf-card poster req' }); body.append(slot);
      const meta = await reqMeta(md); const title = meta.title || meta.name || '#' + md.tmdbId; const src = TM(meta.posterPath, 'w500');
      const pct_ = dlPct(md); let label, cls;
      if (q.status === 3) { label = t('rqDeclined'); cls = 'bad'; } else if (q.status === 1) { label = t('rqWaiting'); cls = 'wait'; } else if (md.status === 5) { label = t('inLib'); cls = 'own'; } else if (md.status === 4) { label = t('rqPartial'); cls = 'own'; } else if (pct_ != null) { label = t('rqDownloading') + ' ' + pct_ + '%'; cls = 'dl'; } else { label = t('rqApproved'); cls = 'wait'; }
      const lib = lm[(md.mediaType) + ':' + md.tmdbId];
      const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title), h('span', { class: 'dmark ' + cls }, label));
      if (pct_ != null && md.status !== 5) im.append(h('div', { class: 'prog' }, h('i', { style: 'width:' + pct_ + '%' })));
      const who = (q.requestedBy && (q.requestedBy.displayName || q.requestedBy.jellyfinUsername || q.requestedBy.username)) || '';
      const acts = admin && q.status === 1 ? h('div', { class: 'req-acts' }, h('button', { class: 'btn white', onclick: async e => { e.stopPropagation(); try { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + q.id + '/approve') }); toast('✓'); load(); } catch (er) { toast('⚠'); } } }, t('approve')), h('button', { class: 'btn grey', onclick: async e => { e.stopPropagation(); try { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + q.id + '/decline') }); toast('✓'); load(); } catch (er) { toast('⚠'); } } }, t('decline'))) : null;
      slot.append(im, h('div', { class: 'title ell' }, title), h('div', { class: 'title ell', style: 'margin-top:2px;font-size:11.5px;opacity:.7' }, who + (q.createdAt ? ' · ' + new Date(q.createdAt).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US') : '')), acts || '');
      slot.addEventListener('click', () => { if (lib) go(itemHash(lib)); else if (md.tmdbId) { md.mediaType = md.mediaType || (meta.name ? 'tv' : 'movie'); openSeerrInfo({ id: md.tmdbId, mediaType: md.mediaType }); } });
    });
  }
  load();
}

/* endless tail of the home page: all genres, then decades, then more picks */
async function endlessRows(rows, page) {
  const sentinel = h('div', { style: 'height:2px' }); page.append(sentinel);
  let queue = [];
  try { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); queue = shuffleArr(g.Items.map(x => ({ kind: 'genre', name: x.Name }))); } catch (e) { }
  [2020, 2010, 2000, 1990, 1980, 1970].forEach(d => queue.push({ kind: 'decade', from: d }));
  queue.push({ kind: 'rated' }, { kind: 'unwatched' }, { kind: 'recentShows' });
  const used = new Set(rows.querySelectorAll('.nf-row h2') ? [...rows.querySelectorAll('.nf-row h2')].map(x => x.textContent.replace(/ ›$/, '')) : []);
  let cycle = 0; const genreNames = queue.filter(x => x.kind === 'genre').map(x => x.name);
  const refill = () => { if (!genreNames.length || cycle >= 8) return false; cycle++; const kinds = ['genreTop', 'genreNew', 'genreShows', 'genreClassic']; const k = kinds[(cycle - 1) % kinds.length]; shuffleArr(genreNames).forEach(n => queue.push({ kind: k, name: n })); return true; };
  const one = () => {
    let q = queue.shift(); if (!q && refill()) q = queue.shift();
    if (!q) { try { io.disconnect(); } catch (e) { } sentinel.remove(); return; }
    if (q.kind === 'genreTop') return lazyRow(rows, t('bestIn') + ' ' + q.name, () => items({ IncludeItemTypes: 'Movie,Series', Genres: q.name, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24, MinCommunityRating: 6 }), 'poster', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(q.name) });
    if (q.kind === 'genreNew') return lazyRow(rows, t('newIn') + ' ' + q.name, () => items({ IncludeItemTypes: 'Movie,Series', Genres: q.name, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(q.name) });
    if (q.kind === 'genreShows') return lazyRow(rows, q.name + ' · ' + t('shows'), () => items({ IncludeItemTypes: 'Series', Genres: q.name, SortBy: 'Random', Limit: 24 }), 'poster', { min: 4 });
    if (q.kind === 'genreClassic') return lazyRow(rows, q.name + ' · ' + t('classics'), () => items({ IncludeItemTypes: 'Movie', Genres: q.name, MaxPremiereDate: '2000-01-01', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24 }), 'poster', { min: 4 });
    if (q.kind === 'genre') { if (used.has(q.name)) return one(); lazyRow(rows, q.name, () => items({ IncludeItemTypes: 'Movie,Series', Genres: q.name, SortBy: 'Random', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/genre/' + encodeURIComponent(q.name) }); }
    else if (q.kind === 'decade') { const years = Array.from({ length: 10 }, (_, i) => q.from + i).join(','); lazyRow(rows, t('fromDecade') + ' ' + q.from + 's', () => items({ IncludeItemTypes: 'Movie', Years: years, SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/decade/' + q.from }); }
    else if (q.kind === 'rated') lazyRow(rows, t('top'), () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 24, StartIndex: 20 }), 'poster', { min: 4, href: '#/c/browse/top/x' });
    else if (q.kind === 'unwatched') lazyRow(rows, t('unwatched'), () => items({ IncludeItemTypes: 'Movie', Filters: 'IsUnplayed', SortBy: 'Random', Limit: 24 }), 'poster', { min: 4, href: '#/c/browse/unwatched/x' });
    else if (q.kind === 'recentShows') lazyRow(rows, t('newShows'), () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24, StartIndex: 12 }), 'poster');
  };
  const next = () => { for (let i = 0; i < 4; i++) one(); setTimeout(() => { if (sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 3200) next(); }, 500); };
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) next(); }, { root: C.nf.el, rootMargin: '3200px' });
  io.observe(sentinel);
}

Object.assign(TX.en, { top10Movies: 'Top 10 movies', top10Shows: 'Top 10 shows', spotlight: 'Spotlight', genreTiles: 'Browse by genre', recentEps: 'New episodes', collections: 'Collections', unwatched: 'Unwatched gems', decade: 'Decade' });
Object.assign(TX.de, { top10Movies: 'Top 10 Filme', top10Shows: 'Top 10 Serien', spotlight: 'Im Rampenlicht', genreTiles: 'Nach Genre stöbern', recentEps: 'Neue Folgen', collections: 'Sammlungen', unwatched: 'Ungesehene Highlights', decade: 'Jahrzehnt' });
const GTCOL = ['#e50914', '#7a3cff', '#0a8f6a', '#e08a00', '#1f6feb', '#c2185b', '#00838f', '#8e24aa', '#d84315', '#2e7d32'];
async function genreTilesRow(container) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  try {
    const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); const list = g.Items.slice(0, 40); if (list.length < 4) return ph.remove();
    const sc = h('div', { class: 'nf-scroller' }, list.map((x, i) => h('a', { class: 'nf-card gtile', style: '--c:' + GTCOL[i % GTCOL.length], href: '#/c/browse/genre/' + encodeURIComponent(x.Name) }, h('b', {}, x.Name))));
    ph.replaceWith(h('section', { class: 'nf-row tiles' }, h('h2', {}, t('genreTiles')), h('button', { class: 'nf-arrow l', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .85 }) }, ic('left')), sc, h('button', { class: 'nf-arrow r', onclick: () => sc.scrollBy({ left: sc.clientWidth * .85 }) }, ic('right'))));
  } catch (e) { ph.remove(); }
}

Object.assign(TX.en, { bestIn: 'Best of', newIn: 'New in', classics: 'Classics' });
Object.assign(TX.de, { bestIn: 'Das Beste aus', newIn: 'Neu in', classics: 'Klassiker' });

/* ---------- Discover: Seerr recommendations rendered with the same cards as the library ---------- */
let SEERR = 'JellyfinEnhanced/jellyseerr';
const seerrGet = (path, params) => Promise.resolve(HID.on ? null : hxReady()).then(() => fetch(ApiClient.getUrl(SEERR + path, params), { headers: { Authorization: 'MediaBrowser Token="' + ApiClient.accessToken() + '"' } }).then(r => { if (!r.ok) throw new Error('seerr ' + r.status); return r.json(); }).then(d => hxSeerr(d)));
const TM = (p, w) => p ? 'https://image.tmdb.org/t/p/' + w + p : '';
let libMapP = null, reqMapP = null;
const libMap = () => libMapP || (libMapP = items({ IncludeItemTypes: 'Movie,Series', Fields: 'ProviderIds', Limit: 10000, EnableImageTypes: 'Primary' }).then(r => { const m = {}; r.Items.forEach(i => { const id = (i.ProviderIds || {}).Tmdb; if (id) m[(i.Type === 'Series' ? 'tv' : 'movie') + ':' + id] = i; }); return m; }).catch(() => ({})));
const reqMap = () => reqMapP || (reqMapP = seerrGet('/request', { take: 500, skip: 0, filter: 'all' }).then(r => { const m = {}; (r.results || []).forEach(q => { const md = q.media || {}; if (md.tmdbId) m[(md.mediaType || q.type) + ':' + md.tmdbId] = md.status || (q.status === 1 ? 2 : 3); }); return m; }).catch(() => ({})));
const resetSeerrCache = () => { libMapP = null; reqMapP = null; };
const hasSeerr = () => !!((C.status && C.status.seerr) || (window.JE && JE.jellyseerrAPI));
const waitSeerr = async () => { for (let i = 0; i < 40 && !hasSeerr(); i++) await new Promise(r => setTimeout(r, 250)); return hasSeerr(); };

function dStatus(x, lm, rm) {
  const key = x.mediaType + ':' + x.id; const lib = lm[key];
  if (lib) return { k: 'own', item: lib };
  const ms = (x.mediaInfo && x.mediaInfo.status) || rm[key];
  if (ms === 5) return { k: 'own' };
  if (ms >= 2 && ms <= 4) return { k: 'req' };
  return { k: 'none' };
}
function openSeerrInfo(x) { if (usePluginSeerr()) return seerrModal(x); try { JE.jellyseerrMoreInfo.open(x.id, x.mediaType); } catch (e) { console.warn(e); } }
function openSeerrRequest(x) {
  if (usePluginSeerr()) return seerrModal(x);
  const title = x.title || x.name;
  try { x.mediaType === 'tv' ? JE.jellyseerrUI.showSeasonSelectionModal(x.id, 'tv', title, x) : JE.jellyseerrUI.showMovieRequestModal(x.id, title, x); } catch (e) { openSeerrInfo(x); }
}
function dMark(s) {
  return s.k === 'own' ? h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib')) : s.k === 'req' ? h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested')) : h('span', { class: 'dmark' }, ic('plus', 'ic-s'), t('notOwned'));
}
function dCard(x, lm, rm) {
  x.mediaType = x.mediaType === 'tv' ? 'tv' : 'movie';
  const title = x.title || x.name; const s = dStatus(x, lm, rm);
  const src = TM(x.posterPath, 'w500');
  const year = (x.releaseDate || x.firstAirDate || '').slice(0, 4);
  const im = h('div', { class: 'im' }, src ? h('div', Object.assign({ class: 'bgi' }, bg(src))) : h('div', { class: 'ph' }, title), dMark(s));
  lbArchBadges(x).forEach(b => im.append(b));
  const open = () => { if (s.k === 'own' && s.item) go(itemHash(s.item)); else openSeerrInfo(x); };
  const el = h('div', { class: 'nf-card poster seerr ' + (s.k === 'none' ? 'notown' : s.k), onclick: open }, im, h('div', { class: 'title ell' }, title));
  attachPeek(el, im, () => ({ poster: true, img: src || TM(x.backdropPath, 'w780'), title, open, overview: x.overview,
    actions: [{ icon: s.k === 'own' ? 'play' : s.k === 'req' ? 'check' : 'plus', label: s.k === 'own' ? t('play') : t('request'), primary: true, fn: () => { hidePeek(); if (s.k === 'own' && s.item) playVideo(s.item); else if (s.k === 'none') openSeerrRequest(x); else openSeerrInfo(x); } }, s.k === 'own' ? null : { icon: 'star', label: t('wlAdd'), fn: () => { hidePeek(); seerrWatch(x); } }, '-', { icon: 'info', label: t('info'), fn: () => { hidePeek(); openSeerrInfo(x); } }],
    meta: [x.voteAverage ? { t: Math.round(x.voteAverage * 10) + '%', cls: 'g' } : null, year, x.mediaType === 'tv' ? t('shows') : t('movies'), s.k === 'own' ? { t: t('inLib'), cls: 'g' } : s.k === 'req' ? t('requested') : t('notOwned')] }));
  return el;
}
function toHero(x, lm, rm) {
  x.mediaType = x.mediaType === 'tv' ? 'tv' : 'movie'; const s = dStatus(x, lm, rm);
  return { Id: 's' + x.id, Name: x.title || x.name, Overview: x.overview, CommunityRating: x.voteAverage, ProductionYear: (x.releaseDate || x.firstAirDate || '').slice(0, 4), Type: x.mediaType === 'tv' ? 'Series' : 'Movie', Genres: [], _bd: TM(x.backdropPath, 'w1280'),
    _primary: s.k === 'own' && s.item ? { label: t('play'), icon: 'play', fn: () => playVideo(s.item) } : s.k === 'none' ? { label: t('request'), icon: 'plus', fn: () => openSeerrRequest(x) } : { label: t('requested'), icon: 'check', fn: () => openSeerrInfo(x) },
    _secondary: { label: t('info'), icon: 'info', fn: () => openSeerrInfo(x) } };
}
async function discoverView(page) {
  if (!(await waitSeerr())) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Jellyfin Enhanced / Seerr is not available.'))); return; }
  const [lm, rm, trend] = await Promise.all([libMap(), reqMap(), seerrGet('/discover/trending', { page: 1 }).catch(() => null)]);
  if (!trend) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Seerr is not reachable.'))); return; }
  const hero = trend.results.filter(x => x.backdropPath && x.overview && (x.mediaType === 'movie' || x.mediaType === 'tv')).slice(0, 8).map(x => toHero(x, lm, rm));
  if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const make = x => dCard(x, lm, rm);
  const add = (title, path) => lazyRow(rows, title, () => seerrGet(path, { page: 1 }).then(r => (r.results || []).filter(x => !x.mediaType || x.mediaType === 'movie' || x.mediaType === 'tv').map(x => Object.assign(x, { mediaType: x.mediaType || (path.includes('/tv') ? 'tv' : 'movie') }))), 'poster', { make });
  add(t('trending'), '/discover/trending'); add(t('popMovies'), '/discover/movies'); add(t('popShows'), '/discover/tv'); add(t('upMovies'), '/discover/movies/upcoming'); add(t('upShows'), '/discover/tv/upcoming');
}
/* Seerr results shown under library search results */
async function seerrSearchRow(container, q) {
  if (!(await waitSeerr())) return;
  try {
    const [lm, rm, r] = await Promise.all([libMap(), reqMap(), seerrGet('/search', { query: q, page: 1 })]);
    const list = (r.results || []).filter(x => (x.mediaType === 'movie' || x.mediaType === 'tv') && dStatus(x, lm, rm).k !== 'own');
    if (!list.length) return;
    container.append(h('h2', { style: 'margin:40px 0 16px;font-size:22px' }, t('notInLib')), h('div', { class: 'nf-grid' }, list.slice(0, 18).map(x => dCard(x, lm, rm))));
  } catch (e) { }
}

/* ---------- Cinema plugin services: Seerr modal, Radarr/Sonarr queue + calendar, Aurral music ---------- */
const plug = () => C.status || {};
const aurralOn = () => !!(C.status && C.status.aurral) && feat('musicDiscovery');
const usePluginSeerr = () => !!plug().seerr;
const cget = (path, params) => Promise.resolve(HID.on ? null : hxReady()).then(() => api('Cinema' + path, params)).then(d => hxSeerr(d));
async function cpost(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema' + path), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' }); }
async function loadStatus() { try { C.status = await api('Cinema/status'); if (C.status.seerr) SEERR = 'Cinema/seerr'; } catch (e) { C.status = null; } }

/* ----- Seerr details + request modal (own UI, no Jellyfin Enhanced needed) ----- */
function closeModal(m) { m.remove(); }
async function seerrModal(x) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie';
  const bgEl = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === bgEl) closeModal(bgEl); } }); const box = h('div', { class: 'sr-modal' }, h('div', { class: 'spinner', style: 'margin:80px auto' })); bgEl.append(box); getUI().append(bgEl);
  let d; try { d = await seerrGet('/' + mt + '/' + x.id); } catch (e) { box.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + e.message)); return; }
  const admin = !!((await me()).Policy || {}).IsAdministrator;
  const lm = await libMap(), rm = await reqMap(); d.mediaType = mt; d.id = x.id; const st = dStatus(Object.assign({}, d, { mediaType: mt, id: x.id, mediaInfo: d.mediaInfo }), lm, rm);
  const title = d.title || d.name; const year = (d.releaseDate || d.firstAirDate || '').slice(0, 4);
  const crew = (d.credits && d.credits.crew) || []; const cast = ((d.credits && d.credits.cast) || []).slice(0, 18);
  const names = jobs => [...new Set(crew.filter(c => jobs.includes(c.job)).map(c => c.name))].slice(0, 3).join(', ');
  const seasons = (d.seasons || []).filter(s => s.seasonNumber > 0); const picked = new Set(seasons.map(s => s.seasonNumber));
  const have = new Set(((d.mediaInfo && d.mediaInfo.seasons) || []).filter(s => s.status >= 2).map(s => s.seasonNumber)); have.forEach(n => picked.delete(n));
  const money = n => n ? '$' + (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e8 ? 0 : 1) + ' Mio.' : n.toLocaleString()) : '';
  const lang = (d.spokenLanguages || []).find(l => l.iso_639_1 === d.originalLanguage); const trailer = (d.relatedVideos || []).find(v => v.site === 'YouTube' && v.type === 'Trailer') || (d.relatedVideos || []).find(v => v.site === 'YouTube');
  const runtime = d.runtime || (d.episodeRunTime && d.episodeRunTime[0]);
  const facts = [[t('factDirector'), names(['Director'])], [t('factWriter'), names(['Screenplay', 'Writer', 'Story', 'Creator'])], [t('factStatus'), d.status], [t('factLang'), lang ? (lang.name || lang.english_name) : d.originalLanguage], [t('factRuntime'), runtime ? runtime + ' ' + t('min') : ''], [t('factBudget'), money(d.budget)], [t('factRevenue'), money(d.revenue)], [t('factStudio'), (d.productionCompanies || []).slice(0, 3).map(c => c.name).join(', ')], [t('factNetwork'), (d.networks || []).slice(0, 3).map(c => c.name).join(', ')], [t('factSeasons'), mt === 'tv' && d.numberOfSeasons ? d.numberOfSeasons + ' · ' + (d.numberOfEpisodes || '') + ' ' + t('episodes') : '']].filter(f => f[1]);
  const status = h('div', { class: 'sr-status' }); lbArchBadges(Object.assign({}, d, { mediaType: mt, id: x.id })).forEach(b => status.append(b));
  const adv = { serverId: null, profileId: null, rootFolder: null };
  const btn = h('button', { class: 'btn white' }, ic('plus'), t('request'));
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = '…';
    try { const body = { mediaType: mt, mediaId: x.id }; if (mt === 'tv') body.seasons = [...picked]; if (adv.serverId != null) body.serverId = adv.serverId; if (adv.profileId != null) body.profileId = adv.profileId; if (adv.rootFolder) body.rootFolder = adv.rootFolder; await cpostSeerr('/request', body); toast('✓ ' + t('requested')); resetSeerrCache(); closeModal(bgEl); }
    catch (e) { toast('⚠ ' + ((e.responseJSON && e.responseJSON.message) || e.statusText || 'error')); btn.disabled = false; btn.replaceChildren(ic('plus'), t('request')); }
  };
  if (st.k === 'own') { status.append(h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib'))); if (st.item) btn.replaceWith(h('button', { class: 'btn white', onclick: () => { closeModal(bgEl); playVideo(st.item); } }, ic('play'), t('play'))); else btn.remove(); }
  else if (st.k === 'req' && mt === 'movie') { status.append(h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested'))); btn.remove(); }
  const seasonBox = mt === 'tv' && seasons.length ? h('div', { class: 'sr-seasons' }, seasons.map(s => h('label', { class: 'nf-chip' + (have.has(s.seasonNumber) ? ' dis' : picked.has(s.seasonNumber) ? ' on' : ''), onclick: e => { e.preventDefault(); if (have.has(s.seasonNumber)) return; picked.has(s.seasonNumber) ? picked.delete(s.seasonNumber) : picked.add(s.seasonNumber); e.currentTarget.classList.toggle('on'); } }, (L === 'de' ? 'Staffel ' : 'Season ') + s.seasonNumber + (s.episodeCount ? ' · ' + s.episodeCount : '') + (have.has(s.seasonNumber) ? ' ✓' : '')))) : null;
  const ratings = h('div', { class: 'rt-row' });
  seerrGet('/' + mt + '/' + x.id + (mt === 'movie' ? '/ratingscombined' : '/ratings')).then(r => { const rt = r.rt || r; const im = r.imdb; if (rt && rt.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null)); if (im && im.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore))); }).catch(() => { });
  if (d.voteAverage) ratings.append(h('span', { class: 'rt-chip' }, 'TMDB ', h('b', {}, d.voteAverage.toFixed(1)), d.voteCount ? h('small', {}, (d.voteCount / 1000).toFixed(1) + 'k') : null));
  /* request options for admins: server, quality profile, folder */
  const advBox = h('details', { class: 'sr-adv' }, h('summary', {}, t('reqAdvanced')));
  if (admin && st.k === 'none') {
    const kind = mt === 'movie' ? 'radarr' : 'sonarr';
    seerrGet('/service/' + kind).then(async servers => {
      const list = (servers || []).filter(s => !s.is4k); if (!list.length) { advBox.remove(); return; }
      const def = list.find(s => s.isDefault) || list[0]; const sel = (label, key) => { const el = h('select', { onchange: e => { adv[key] = key === 'rootFolder' ? e.target.value : (e.target.value === '' ? null : +e.target.value); } }); return { el, row: h('div', { class: 'sr-opt' }, h('label', {}, label), el) }; };
      const sv = sel(t('reqServer'), 'serverId'), pf = sel(t('reqProfile'), 'profileId'), fo = sel(t('reqFolder'), 'rootFolder');
      list.forEach(s => sv.el.append(h('option', { value: s.id, selected: s.id === def.id }, s.name)));
      const fill = async id => { adv.serverId = id; try { const det = await seerrGet('/service/' + kind + '/' + id); pf.el.replaceChildren(...(det.profiles || []).map(p => h('option', { value: p.id, selected: p.id === def.activeProfileId }, p.name))); fo.el.replaceChildren(...(det.rootFolders || []).map(f => h('option', { value: f.path, selected: f.path === def.activeDirectory }, f.path))); adv.profileId = pf.el.value ? +pf.el.value : null; adv.rootFolder = fo.el.value || null; } catch (e) { } };
      sv.el.onchange = e => fill(+e.target.value); await fill(def.id); advBox.append(h('div', { class: 'sr-opts' }, sv.row, pf.row, fo.row));
    }).catch(() => advBox.remove());
  } else advBox.remove();
  const poster = TM(d.posterPath, 'w500');
  box.replaceChildren(
    h('div', Object.assign({ class: 'sr-hero' }, bg(TM(d.backdropPath, 'w1280'))), h('button', { class: 'sr-close', onclick: () => closeModal(bgEl), 'aria-label': 'Close' }, ic('close'))),
    h('div', { class: 'sr-body' },
      h('div', { class: 'sr-top' }, poster ? h('div', Object.assign({ class: 'sr-poster' }, bg(poster))) : null,
        h('div', { class: 'sr-head' }, h('h2', {}, title, year ? h('span', {}, ' (' + year + ')') : null), d.tagline ? h('p', { class: 'nf-tagline' }, d.tagline) : null,
          h('div', { class: 'nf-meta' }, (d.genres || []).slice(0, 4).map(g => h('span', {}, g.name)), runtime ? h('span', {}, runtime + ' ' + t('min')) : null),
          ratings, status,
          h('div', { class: 'nf-btns', style: 'margin-top:14px' }, btn, trailer ? h('a', { class: 'btn grey', href: 'https://www.youtube.com/watch?v=' + trailer.key, target: '_blank', rel: 'noopener' }, ic('film'), t('watchTrailer')) : null, h('button', { class: 'btn grey', onclick: () => closeModal(bgEl) }, t('close'))))),
      h('p', { class: 'sr-ov' }, d.overview || ''), seasonBox, advBox,
      facts.length ? h('dl', { class: 'nf-facts sr-facts' }, facts.map(f => [h('dt', {}, f[0]), h('dd', {}, f[1])])) : null,
      cast.length ? h('div', { class: 'sr-castw' }, h('h3', {}, t('moreCast')), h('div', { class: 'sr-cast2' }, cast.map(c => h('div', { class: 'sr-p' }, h('div', Object.assign({ class: 'pi' }, bg(c.profilePath ? TM(c.profilePath, 'w185') : ''))), h('b', {}, c.name), h('small', {}, c.character || '')))) ) : null));
}
function cpostSeerr(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + path), data: JSON.stringify(body), contentType: 'application/json', dataType: 'json' }); }

/* ----- Radarr / Sonarr: download queue + release calendar ----- */
async function queueSection(container) {
  if (!(plug().radarr || plug().sonarr)) return;
  let q = []; try { q = await cget('/arr/queue'); } catch (e) { return; }
  const box = h('section', { class: 'dl-box' }, h('h2', {}, t('downloads') + ' (' + q.length + ')'));
  if (!q.length) { box.append(h('div', { class: 'set-hint' }, t('noDownloads'))); (container.querySelector('h1') || { after: x => container.prepend(x) }).after(box); return; }
  q.forEach(i => box.append(h('div', { class: 'dl-row' }, h('div', { class: 'dl-t' }, h('b', { class: 'ell' }, i.title || '?'), i.subtitle ? h('span', { class: 'ell' }, i.subtitle) : null, h('span', {}, [i.source, i.client, i.timeleft].filter(Boolean).join(' · '))), h('div', { class: 'dl-p' }, h('div', { class: 'prog' }, h('i', { style: 'width:' + (i.progress || 0) + '%' })), h('b', {}, Math.round(i.progress || 0) + '%')))));
  (container.querySelector('h1') || { after: x => container.prepend(x) }).after(box);
}
async function calendarView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('calendar'))); page.append(wrap);
  if (!(plug().radarr || plug().sonarr)) { wrap.append(h('div', { class: 'nf-empty' }, t('arrOff'))); return; }
  let cur = new Date(); cur.setDate(1);
  const head = h('div', { class: 'cal-head' }); const grid = h('div', { class: 'cal-grid' }); wrap.append(head, grid);
  const lm = await libMap();
  async function draw() {
    const first = new Date(cur), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const start = new Date(first); const dow = (start.getDay() + 6) % 7; start.setDate(start.getDate() - dow);
    const end = new Date(last); end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    head.replaceChildren(h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() - 1); draw(); } }, ic('left')), h('b', {}, cur.toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })), h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() + 1); draw(); } }, ic('right')), h('button', { class: 'btn grey', style: 'margin-left:auto', onclick: () => { cur = new Date(); cur.setDate(1); draw(); } }, t('today')));
    grid.replaceChildren(h('div', { class: 'spinner', style: 'grid-column:1/-1' }));
    let ev = []; try { ev = await cget('/arr/calendar', { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }); } catch (e) { }
    const byDay = {}; ev.forEach(e => { if (!e.date) return; const k = e.date.slice(0, 10); (byDay[k] = byDay[k] || []).push(e); });
    grid.replaceChildren(...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) => h('div', { class: 'cal-dow' }, L === 'de' ? d : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i])));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const cell = h('div', { class: 'cal-day' + (d.getMonth() !== cur.getMonth() ? ' other' : '') + (k === new Date().toISOString().slice(0, 10) ? ' today' : '') }, h('span', { class: 'n' }, d.getDate()));
      (byDay[k] || []).slice(0, 6).forEach(e => {
        const own = lm[(e.source === 'radarr' ? 'movie' : 'tv') + ':' + e.tmdbId];
        cell.append(h('div', { class: 'cal-ev ' + (e.hasFile || own ? 'have' : e.kind), title: (e.title || '') + (e.subtitle ? ' · ' + e.subtitle : ''), onclick: () => { if (own) go(itemHash(own)); else if (e.tmdbId) openSeerrInfo({ id: e.tmdbId, mediaType: e.source === 'radarr' ? 'movie' : 'tv' }); } }, e.poster ? h('div', Object.assign({ class: 'p' }, bg(e.poster))) : null, h('span', { class: 'ell' }, e.title), h('small', { class: 'ell' }, e.subtitle || t('cal_' + e.kind))));
      });
      grid.append(cell);
    }
  }
  draw();
}

/* ----- Aurral: music search + requests ----- */
const aget = (path, params) => api('Cinema/aurral/' + path.replace(/^\//, ''), params);
const apost = (path, body) => ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/aurral/' + path.replace(/^\//, '')), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' });
const pk = (o, keys) => { for (const k of keys) if (o && o[k] != null && o[k] !== '') return o[k]; return null; };
const aList = r => Array.isArray(r) ? r : (r && (r.results || r.items || r.artists || r.albums || r.data)) || [];
const aName = o => pk(o, ['name', 'artistName', 'title', 'albumName']) || '?';
const aImg = o => { const u = pk(o, ['image', 'imageUrl', 'cover', 'coverUrl', 'thumbnail', 'artwork', 'picture']); return typeof u === 'string' ? (u.startsWith('http') ? u : '') : ''; };
function aurralTile(o, kind) {
  const name = aName(o); const sub = kind === 'artist' ? t('artist') : [pk(o, ['artistName', 'artist']) || '', pk(o, ['year', 'releaseYear']) || String(o.releaseDate || '').slice(0, 4)].filter(Boolean).join(' · ');
  const el = tile({ name, sub: sub + ' · ' + t('notOwned'), img: aImg(o), round: kind === 'artist', href: '#', play: null });
  const btn = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); btn.classList.add('busy'); try { await requestAurral(o, kind); toast('✓ ' + t('requested')); } catch (er) { toast('⚠ ' + ((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } btn.classList.remove('busy'); } }, ic('plus'));
  el.append(btn); el.onclick = null; el.addEventListener('click', e => e.preventDefault()); return el;
}
async function requestAurral(o, kind) {
  const mbid = pk(o, ['mbid', 'id', 'foreignArtistId', 'foreignAlbumId', 'releaseGroupMbid']);
  if (kind === 'album') return apost('/api/library/albums/request', Object.assign({}, o, { mbid }));
  return apost('/api/library/artists', Object.assign({}, o, { mbid, artistName: aName(o) }));
}
async function aurralSearchShelves(node, q) {
  if (!aurralOn()) return;
  try {
    const [ar, al] = await Promise.all([aget('/api/search', { q, scope: 'artist', limit: 10 }).catch(() => null), aget('/api/search', { q, scope: 'album', limit: 10 }).catch(() => null)]);
    let a = aList(ar); const b = aList(al);
    if (!a.length && b.length) { const seen = new Set(); b.forEach(x => { const id = x.artistMbid; if (id && !seen.has(id)) { seen.add(id); a.push({ type: 'artist', id, name: x.artistName }); } }); }
    if (a.length) node.append(shelf(t('musicRequestArtists'), a.map(o => aurralTile(o, 'artist'))));
    if (b.length) node.append(shelf(t('musicRequestAlbums'), b.map(o => aurralTile(o, 'album'))));
  } catch (e) { }
}
async function aurralDiscoverShelves(node) {
  if (!aurralOn()) return;
  try {
    const r = await aget('/api/discover');
    const lists = [['recommendations', t('discoverMusic')], ['globalTop', t('globalTopArtists')]];
    for (const [key, title] of lists) {
      const arr = Array.isArray(r[key]) ? r[key] : []; if (!arr.length) continue;
      node.append(shelf(title, arr.slice(0, 16).map(o => aurralTile(o, /album/i.test(o.type || '') ? 'album' : 'artist'))));
    }
  } catch (e) { }
}

/* ---------- Cinema video player v2: PlaybackInfo, direct play / HLS, custom controls, subtitles, skip intro, chapters ---------- */
const HLS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js';
let hlsLoading = null;
const loadHls = () => window.Hls ? Promise.resolve(window.Hls) : (hlsLoading || (hlsLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = HLS_URL; s.onload = () => res(window.Hls); s.onerror = () => rej(new Error('hls.js failed to load')); document.head.append(s); })));
const tok = () => ApiClient.accessToken();
const absUrl = u => /^https?:/i.test(u) ? u : ApiClient.serverAddress().replace(/\/$/, '') + (u.startsWith('/') ? u : '/' + u);
const withKey = u => /[?&](api_key|ApiKey)=/i.test(u) ? u : u + (u.includes('?') ? '&' : '?') + 'ApiKey=' + encodeURIComponent(tok());

/* player icons: clear, consistent set */
const PIC = {
  play: 'M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z', pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  vol: 'M4 9v6h4l5 4V5L8 9H4zm12.5 3a4 4 0 00-2-3.46v6.92a4 4 0 002-3.46zM14.5 4.3v2.1a6.5 6.5 0 010 11.2v2.1a8.5 8.5 0 000-15.4z', mute: 'M4 9v6h4l5 4V5L8 9H4zm11.6 3l2.2-2.2-1.4-1.4-2.2 2.2-2.2-2.2-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4z',
  cc: 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zm1.5 4.5v5h2.6v-1.3H8v-2.4h1.1V9.5H6.5zm6 0v5h2.6v-1.3H14v-2.4h1.1V9.5h-2.6z',
  audio: 'M12 3a9 9 0 00-9 9v6a3 3 0 003 3h1a1 1 0 001-1v-6a1 1 0 00-1-1H5v-1a7 7 0 0114 0v1h-3a1 1 0 00-1 1v6a1 1 0 001 1h1a3 3 0 003-3v-6a9 9 0 00-9-9z',
  gear: 'M19.4 13a7.6 7.6 0 000-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 00-1.7-1L15 3.4h-4l-.4 2.6a7.4 7.4 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 000 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 001.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 001.7-1l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z',
  pip: 'M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm9 6h7v5h-7z', fs: 'M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z', fsx: 'M8 4h2v6H4V8h4V4zm6 0h2v4h4v2h-6V4zM4 14h6v6H8v-4H4v-2zm10 0h6v2h-4v4h-2v-6z',
  chap: 'M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z', next: 'M6 6.5v11a1 1 0 001.5.86L16 13.4V17h2V7h-2v3.6L7.5 5.64A1 1 0 006 6.5z', back: 'M15.5 5.5L9 12l6.5 6.5-1.5 1.5L6 12l8-8 1.5 1.5z', info: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  eps: 'M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h10v2H4v-2zm14-1.5l4 2.5-4 2.5v-5z', skip: 'M5 5l8 7-8 7V5zm9 0h2v14h-2V5z'
};
const PICMAP = { play: 'player-play', pause: 'player-pause', vol: 'volume', mute: 'volume-3', cc: 'badge-cc', audio: 'language', gear: 'settings', pip: 'picture-in-picture', fs: 'maximize', fsx: 'minimize', chap: 'list-details', next: 'player-skip-forward', back: 'chevron-left', info: 'info-circle', eps: 'list-numbers', skip: 'player-skip-forward' };
const PICFILL = { play: 1, pause: 1 };
function pic(name) { return luSvg(PICMAP[name] || 'player-play', PICFILL[name]); }
const skipLen = () => { const n = +pcfg('skipLen', 10); return [5, 10, 15, 30].includes(n) ? n : 10; };
function skipIcon(dir) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'lu lu-skip');
  const g = dir > 0 ? '<g>' : '<g transform="translate(24 0) scale(-1 1)">';
  s.innerHTML = g + '<path d="M14.74 4.98A8 8 0 1 1 9.26 4.98"/><path d="M12.3 3.9L10.1 7.4L8.4 2.5z" fill="currentColor"/></g><text class="skn" x="12.4" y="15.8" text-anchor="middle" font-size="7.6" font-weight="800" font-family="Inter,system-ui,sans-serif" fill="currentColor" stroke="none" style="letter-spacing:-.03em">' + skipLen() + '</text>';
  return s;
}
const updSkipIcons = () => $$('.lu-skip .skn', PL.el || document).forEach(x => { x.textContent = skipLen(); });
const FIT = { contain: 'contain', cover: 'cover', fill: 'fill' };
const applyFit = () => { if (PL.v) PL.v.style.objectFit = FIT[pcfg('fit', 'contain')] || 'contain'; };
function applySubDelay() { const d = +(PL.subDelay || 0); const tr = PL.v && [...PL.v.textTracks].find(x => x.mode === 'hidden' || x.mode === 'showing'); if (!tr || !tr.cues) return; for (const c of tr.cues) { if (c._os == null) { c._os = c.startTime; c._oe = c.endTime; } c.startTime = Math.max(0, c._os + d); c.endTime = Math.max(.01, c._oe + d); } }

function deviceProfile() {
  const hevc = !!(window.MediaSource && MediaSource.isTypeSupported('video/mp4; codecs="hvc1.1.6.L120.90,mp4a.40.2"'));
  const vcodecs = 'h264' + (hevc ? ',hevc' : '');
  const tp = [];
  if (hevc) tp.push({ Container: 'mp4', Type: 'Video', AudioCodec: 'aac,mp3,opus,flac', VideoCodec: 'hevc,h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  tp.push({ Container: 'ts', Type: 'Video', AudioCodec: 'aac,mp3', VideoCodec: 'h264', Context: 'Streaming', Protocol: 'hls', MaxAudioChannels: '6', MinSegments: '1', BreakOnNonKeyFrames: true });
  return { Name: 'Cinema', MaxStreamingBitrate: 120000000, MaxStaticBitrate: 100000000, MusicStreamingTranscodingBitrate: 384000,
    DirectPlayProfiles: [{ Container: 'mp4,m4v,mov', Type: 'Video', VideoCodec: vcodecs, AudioCodec: 'aac,mp3,opus,flac,vorbis' }, { Container: 'webm', Type: 'Video', VideoCodec: 'vp8,vp9,av1', AudioCodec: 'vorbis,opus' }],
    TranscodingProfiles: tp, ContainerProfiles: [],
    CodecProfiles: [{ Type: 'Video', Codec: 'h264', Conditions: [{ Condition: 'LessThanEqual', Property: 'VideoBitDepth', Value: '8', IsRequired: false }] }],
    SubtitleProfiles: [{ Format: 'vtt', Method: 'External' }] };
}

const QUALITIES = [['auto', 120000000], ['20', 20000000], ['8', 8000000], ['4', 4000000], ['1.5', 1500000]];
const PL = { el: null, v: null, hls: null, item: null, ms: null, psid: null, method: null, audio: null, sub: -1, started: false, lastRep: 0, idleT: 0, open: false, nextItem: null, segments: [], encodeSub: false, subTouched: false, speed: 1 };
const pcfg = (k, d) => (cfg('pl_' + k) != null ? cfg('pl_' + k) : d);
const psave = (k, v) => saveCfg({ ['pl_' + k]: v });

async function openPlayer(it, startTicks) {
  closePlayer(true);
  Object.assign(PL, { item: it, open: true, started: false, sub: -1, audio: null, nextItem: null, ms: null, segments: [], encodeSub: false, subTouched: false });
  buildPlayerUI(it);
  history.pushState({ cxplayer: 1 }, '');
  window.addEventListener('popstate', onPop); document.addEventListener('keydown', onKey, true);
  P.audio && !P.audio.paused && P.audio.pause();
  let full = it; try { full = await getItem(it.Id); } catch (e) { }
  PL.item = full; setTitle(full); loadNext(full); loadSegments(full);
  await startStream(startTicks != null ? startTicks : (ud(full).PlaybackPositionTicks || 0));
}
async function startStream(startTicks, opts) {
  opts = opts || {}; const it = PL.item; setStatus(t('plPreparing')); stopTimers(); detach();
  try {
    const qual = QUALITIES.find(x => x[0] === String(pcfg('quality', 'auto'))) || QUALITIES[0];
    const prof = deviceProfile(); prof.MaxStreamingBitrate = qual[1];
    const q = { UserId: uid(), StartTimeTicks: startTicks || 0, MaxStreamingBitrate: qual[1], AutoOpenLiveStream: true };
    if (PL.audio != null) q.AudioStreamIndex = PL.audio;
    if (PL.ms) q.MediaSourceId = PL.ms.Id;
    if (PL.encodeSub && PL.sub >= 0) q.SubtitleStreamIndex = PL.sub;
    const info = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Items/' + it.Id + '/PlaybackInfo', q), data: JSON.stringify({ DeviceProfile: prof }), contentType: 'application/json', dataType: 'json' });
    if (info.ErrorCode) throw new Error(info.ErrorCode);
    const ms = (info.MediaSources || [])[0]; if (!ms) throw new Error('No playable source');
    PL.ms = ms; PL.psid = info.PlaySessionId || ('cx' + Date.now());
    if (PL.audio == null && ms.DefaultAudioStreamIndex != null) PL.audio = ms.DefaultAudioStreamIndex;
    let url, method;
    if (ms.SupportsDirectPlay && !opts.forceTranscode && qual[0] === 'auto') { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid + (ms.ETag ? '&Tag=' + ms.ETag : ''); }
    else if (ms.TranscodingUrl) { method = /m3u8/.test(ms.TranscodingUrl) ? 'Transcode' : 'DirectStream'; url = absUrl(ms.TranscodingUrl); }
    else if (ms.SupportsDirectPlay) { method = 'DirectPlay'; url = absUrl('Videos/' + it.Id + '/stream') + '?Static=true&MediaSourceId=' + ms.Id + '&DeviceId=' + ApiClient.deviceId() + '&PlaySessionId=' + PL.psid; }
    else throw new Error('Server offered no stream');
    PL.method = method; PL.url = withKey(url);
    await attach(PL.url, startTicks ? startTicks / 1e7 : 0);
    buildTrackMenus(); buildChapters();
  } catch (e) { console.warn('[cinema player]', e); showError(e.message || String(e)); }
}
async function attach(url, startSec) {
  const v = PL.v; v.removeAttribute('src'); v.load(); v.playbackRate = PL.speed;
  const isHls = /m3u8/i.test(url);
  if (isHls && !v.canPlayType('application/vnd.apple.mpegurl')) {
    const Hls = await loadHls(); if (!Hls.isSupported()) throw new Error('This browser cannot play HLS');
    const hls = new Hls({ startPosition: startSec || -1, maxBufferLength: 40, backBufferLength: 30, enableWorker: true, manifestLoadingMaxRetry: 3, levelLoadingMaxRetry: 3, fragLoadingMaxRetry: 4 });
    PL.hls = hls; let netRetry = 0, mediaRetry = 0;
    hls.on(Hls.Events.ERROR, (e, d) => { if (!d.fatal) return; if (d.type === Hls.ErrorTypes.NETWORK_ERROR && netRetry++ < 3) { setStatus(t('plRetry')); hls.startLoad(); } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetry++ < 3) hls.recoverMediaError(); else showError((d.details || 'Playback error') + (d.response && d.response.code ? ' (' + d.response.code + ')' : '')); });
    hls.loadSource(url); hls.attachMedia(v);
  } else { v.src = url; if (startSec) v.addEventListener('loadedmetadata', () => { v.currentTime = startSec; }, { once: true }); }
  try { await v.play(); } catch (e) { if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') throw e; }
}
function detach() { if (PL.hls) { try { PL.hls.destroy(); } catch (e) { } PL.hls = null; } if (PL.v) { PL.v.pause(); PL.v.removeAttribute('src'); PL.v.querySelectorAll('track').forEach(t_ => t_.remove()); } if (PL.subsEl) PL.subsEl.replaceChildren(); }
function stopTimers() { clearInterval(PL.statT); }
const ticks = () => Math.floor((PL.v ? PL.v.currentTime : 0) * 1e7);
function report(kind, extra) { if (!PL.item || !PL.ms) return; try { ApiClient['reportPlayback' + kind](Object.assign({ ItemId: PL.item.Id, MediaSourceId: PL.ms.Id, PlaySessionId: PL.psid, PlayMethod: PL.method || 'DirectPlay', PositionTicks: ticks(), IsPaused: PL.v ? PL.v.paused : false, CanSeek: true, AudioStreamIndex: PL.audio, SubtitleStreamIndex: PL.sub, QueueableMediaTypes: ['Video'] }, extra)); } catch (e) { } }
function closePlayer(silent) {
  if (!PL.open) return;
  if (PL.started) { report('Stopped'); try { if (PL.method === 'Transcode') ApiClient.stopActiveEncodings(PL.psid); } catch (e) { } }
  stopTimers(); detach(); if (PL.el) { PL.el.remove(); PL.el = null; PL.v = null; }
  window.removeEventListener('popstate', onPop); document.removeEventListener('keydown', onKey, true);
  if (PL.nfs) setNativeFs(false);
  if (fsEl()) try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { }
  try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { }
  PL.open = false; PL.started = false; COVER.hide();
  if (!silent) setTimeout(() => refreshView(), 120);
}
function onPop() { closePlayer(); }
function backFromPlayer() { if (history.state && history.state.cxplayer) history.back(); else closePlayer(); }

async function loadNext(it) {
  PL.nextItem = null; if (PL.el) PL.el.classList.remove('has-next');
  if (it.Type !== 'Episode' || !it.SeriesId) return;
  try { const r = await api('Shows/' + it.SeriesId + '/Episodes', { userId: uid(), startItemId: it.Id, limit: 2, Fields: F_BASE }); const n = (r.Items || []).find(x => x.Id !== it.Id); PL.nextItem = n || null; PL.el && PL.el.classList.toggle('has-next', !!n); } catch (e) { }
}
async function loadSegments(it) {
  PL.segments = [];
  try { const r = await api('MediaSegments/' + it.Id); PL.segments = (r.Items || []).map(s => ({ type: s.Type, start: s.StartTicks / 1e7, end: s.EndTicks / 1e7 })); } catch (e) { }
}
function playNextEp() { if (PL.nextItem) { const n = PL.nextItem; report('Stopped'); PL.started = false; PL.item = n; PL.ms = null; PL.audio = null; PL.sub = -1; PL.encodeSub = false; PL.subTouched = false; setTitle(n); loadNext(n); loadSegments(n); getItem(n.Id).then(f => { PL.item = f; }).catch(() => { }); startStream(0); } }
function playEpisode(ep) { PL.nextItem = ep; playNextEp(); }

/* ---------- UI helpers ---------- */
function setTitle(it) {
  if (!PL.el) return; const ep = it.Type === 'Episode';
  $('.pl-title', PL.el).textContent = ep ? (it.SeriesName || '') : it.Name;
  $('.pl-sub', PL.el).textContent = ep ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : [yearOf(it), it.OfficialRating, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : ''].filter(Boolean).join(' · ');
  $('.pl-btn-eps', PL.el).classList.toggle('hide', !ep);
}
function setStatus(msg) { if (!PL.el) return; PL.el.classList.remove('err'); PL.el.classList.add('loading'); $('.pl-status', PL.el).textContent = msg || ''; }
function showError(msg) { if (!PL.el) return; PL.el.classList.remove('loading'); PL.el.classList.add('err'); $('.pl-errmsg', PL.el).textContent = msg; }
const closeMenus = () => PL.el && $$('.pl-menu', PL.el).forEach(m => m.classList.remove('open'));
function toggleMenu(cls) { const m = $(cls, PL.el); const was = m.classList.contains('open'); closeMenus(); if (!was) m.classList.add('open'); wake(); }
const mbtn = (label, on, fn, extra) => h('button', { class: on ? 'on' : '', onclick: fn }, h('span', {}, label), extra || null);
const fmtT = s => { s = Math.max(0, Math.floor(s || 0)); const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : mm) + ':' + String(ss).padStart(2, '0'); };

/* audio + subtitle menus */
function buildTrackMenus() {
  if (!PL.el || !PL.ms) return;
  const streams = PL.ms.MediaStreams || []; const audios = streams.filter(s => s.Type === 'Audio'); const subs = streams.filter(s => s.Type === 'Subtitle' && (s.DeliveryUrl || s.DeliveryMethod === 'Encode'));
  const am = $('.pl-menu-audio', PL.el), sm = $('.pl-menu-subs', PL.el);
  am.replaceChildren(h('div', { class: 'pl-mh' }, t('plAudio')), ...audios.map(a => mbtn(a.DisplayTitle || a.Language || ('#' + a.Index), a.Index === PL.audio, () => { if (a.Index === PL.audio) return; PL.audio = a.Index; closeMenus(); startStream(ticks()); })));
  sm.replaceChildren(h('div', { class: 'pl-mh' }, t('plSubs')), mbtn(t('plOff'), PL.sub === -1, () => setSub(-1)), ...subs.map(s => mbtn(s.DisplayTitle || s.Language || ('#' + s.Index), s.Index === PL.sub, () => setSub(s.Index), s.DeliveryMethod === 'Encode' ? h('small', {}, t('plBurn')) : null)), h('div', { class: 'pl-sep' }), mbtn(t('plSubStyle'), false, () => { closeMenus(); openSettings('subs'); }));
  $('.pl-btn-audio', PL.el).classList.toggle('hide', audios.length < 2); $('.pl-btn-subs', PL.el).classList.toggle('hide', !subs.length);
  const def = subs.find(s => s.DeliveryUrl && s.IsDefault); if (def && PL.sub === -1 && !PL.subTouched && !PL.encodeSub) setSub(def.Index, true);
}
function setSub(idx, auto) {
  setTimeout(applySubDelay, 900);
  const v = PL.v; const s = idx >= 0 ? PL.ms.MediaStreams.find(x => x.Index === idx) : null; if (!auto) PL.subTouched = true;
  const wasEncode = PL.encodeSub; PL.sub = idx; v.querySelectorAll('track').forEach(x => x.remove()); PL.subsEl.replaceChildren();
  if (s && s.DeliveryMethod === 'Encode' && !s.DeliveryUrl) { PL.encodeSub = true; closeMenus(); startStream(ticks()); return; }
  PL.encodeSub = false; if (wasEncode) { closeMenus(); startStream(ticks()); return; }
  if (s && s.DeliveryUrl) {
    const tr = document.createElement('track'); tr.kind = 'subtitles'; tr.label = s.DisplayTitle || 'Sub'; tr.srclang = s.Language || 'und'; tr.src = withKey(absUrl(s.DeliveryUrl)); v.append(tr);
    const hook = () => { tr.track.mode = 'hidden'; tr.track.oncuechange = renderCues; };
    tr.addEventListener('load', hook); setTimeout(hook, 300);
  }
  buildTrackMenus(); closeMenus();
}
function renderCues() {
  const track = PL.v && [...PL.v.textTracks].find(x => x.mode === 'hidden' || x.mode === 'showing'); if (!track || !PL.subsEl) return;
  const act = [...(track.activeCues || [])]; PL.subsEl.replaceChildren();
  act.forEach((c, i) => { const line = h('div', { class: 'pl-subline' }); line.append(c.getCueAsHTML()); PL.subsEl.append(line); });
}
function applySubStyle() {
  if (!PL.el) return; const sizes = { s: 1.35, m: 1.9, l: 2.5, xl: 3.2 }; const st = PL.el.style;
  st.setProperty('--sub-size', 'clamp(15px, ' + (sizes[pcfg('subSize', 'm')] || 1.9) + 'vw, 44px)');
  st.setProperty('--sub-pos', (pcfg('subPos', 9)) + '%'); st.setProperty('--sub-color', pcfg('subColor', '#ffffff'));
  PL.el.dataset.subbg = pcfg('subBg', 'shadow'); PL.el.dataset.subfont = pcfg('subFont', 'sans'); st.setProperty('--sub-weight', pcfg('subBold', false) ? '700' : '500');
}

/* chapters + skip segments */
function buildChapters() {
  if (!PL.el) return; const chs = (PL.item.Chapters || []).filter(c => c.StartPositionTicks > 0 || true);
  const wrap = $('.pl-chapters', PL.el); wrap.replaceChildren(); const d = (PL.item.RunTimeTicks || 0) / 1e7;
  if (d) chs.forEach((c, i) => { if (i === 0) return; wrap.append(h('i', { style: 'left:' + (c.StartPositionTicks / 1e7 / d * 100) + '%' })); });
  const menu = $('.pl-menu-chap', PL.el); menu.replaceChildren(h('div', { class: 'pl-mh' }, t('plChapters')), ...chs.map((c, i) => h('button', { onclick: () => { PL.v.currentTime = c.StartPositionTicks / 1e7; closeMenus(); } }, c.ImageTag ? h('img', { src: ApiClient.getUrl('Items/' + PL.item.Id + '/Images/Chapter/' + i, { tag: c.ImageTag, maxWidth: 160 }) }) : null, h('span', {}, c.Name || ('Chapter ' + (i + 1))), h('small', {}, fmtT(c.StartPositionTicks / 1e7)))));
  $('.pl-btn-chap', PL.el).classList.toggle('hide', chs.length < 2);
}
function checkSegments() {
  const v = PL.v; if (!v || !PL.segments.length) return; const t0 = v.currentTime; const seg = PL.segments.find(s => (s.type === 'Intro' || s.type === 'Outro' || s.type === 'Recap' || s.type === 'Preview') && t0 >= s.start && t0 < s.end - 1);
  const btn = $('.pl-skipseg', PL.el);
  if (seg) { btn.classList.add('show'); $('span', btn).textContent = seg.type === 'Outro' ? t('plSkipCredits') : seg.type === 'Recap' ? t('plSkipRecap') : t('plSkipIntro'); btn.onclick = () => { v.currentTime = seg.end; btn.classList.remove('show'); }; if (pcfg('autoSkip', false) && seg.type === 'Intro') { v.currentTime = seg.end; btn.classList.remove('show'); } } else btn.classList.remove('show');
}
function checkNextCard() {
  const v = PL.v; const card_ = $('.pl-nextcard', PL.el); const d = v.duration; if (!PL.nextItem || !d || !isFinite(d)) { card_.classList.remove('show'); return; }
  const left = d - v.currentTime; const out = PL.segments.find(s => s.type === 'Outro');
  const show = left < 24 && left > 0 && pcfg('autoNext', true);
  card_.classList.toggle('show', show); if (show) { $('.pl-nc-t', card_).textContent = (PL.nextItem.SeriesName ? '' : '') + 'S' + (PL.nextItem.ParentIndexNumber || 0) + ':E' + (PL.nextItem.IndexNumber || 0) + ' · ' + PL.nextItem.Name; $('.pl-nc-s', card_).textContent = t('plNextIn') + ' ' + Math.ceil(left) + ' s'; }
}

/* settings panel */
function openSettings(tab) {
  const panel = $('.pl-settings', PL.el); const tabs = ['quality', 'playback', 'subs', 'keys']; tab = tab || 'quality';
  const body = h('div', { class: 'pl-sbody' });
  const row = (label, ctrl, hint) => h('div', { class: 'pl-srow' }, h('div', {}, h('b', {}, label), hint ? h('small', {}, hint) : null), ctrl);
  const seg = (opts, cur, fn) => h('div', { class: 'pl-seg' }, opts.map(([v, l]) => h('button', { class: String(cur) === String(v) ? 'on' : '', onclick: e => { fn(v); $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, l)));
  const sw = (key, def, fn) => { const b = h('button', { class: 'set-switch' + (pcfg(key, def) ? ' on' : ''), onclick: () => { const nv = !pcfg(key, def); psave(key, nv); b.classList.toggle('on', nv); fn && fn(nv); } }, h('i')); return b; };
  if (tab === 'quality') {
    body.append(row(t('plQuality'), seg(QUALITIES.map(([k]) => [k, k === 'auto' ? t('plAuto') : (k === '20' ? '1080p+' : k === '8' ? '1080p' : k === '4' ? '720p' : '480p')]), pcfg('quality', 'auto'), v => { psave('quality', v); startStream(ticks()); }), t('plQualityHint')),
      row(t('plFit'), seg([['contain', t('plFitContain')], ['cover', t('plFitCover')], ['fill', t('plFitFill')]], pcfg('fit', 'contain'), v => { psave('fit', v); applyFit(); }), t('plFitHint')),
      row(t('plSkipLen'), seg([[5, '5 s'], [10, '10 s'], [15, '15 s'], [30, '30 s']], skipLen(), v => { psave('skipLen', +v); updSkipIcons(); })),
      row(t('plSpeed'), seg([[0.5, '0.5×'], [0.75, '0.75×'], [1, '1×'], [1.25, '1.25×'], [1.5, '1.5×'], [2, '2×']], PL.speed, v => { PL.speed = +v; PL.v.playbackRate = +v; })));
  } else if (tab === 'playback') {
    body.append(row(t('plAutoNext'), sw('autoNext', true), t('plAutoNextHint')), row(t('plAutoSkip'), sw('autoSkip', false), t('plAutoSkipHint')), row(t('plRemember'), sw('rememberVol', true)));
  } else if (tab === 'subs') {
    { const val = h('b', { class: 'pl-delayv' }, ((PL.subDelay || 0) >= 0 ? '+' : '') + (PL.subDelay || 0).toFixed(1) + ' s'); const bump = d => { PL.subDelay = Math.round(((PL.subDelay || 0) + d) * 10) / 10; val.textContent = (PL.subDelay >= 0 ? '+' : '') + PL.subDelay.toFixed(1) + ' s'; applySubDelay(); };
      body.append(row(t('plSubDelay'), h('div', { class: 'pl-stepper' }, h('button', { onclick: () => bump(-.5) }, '−.5'), h('button', { onclick: () => bump(-.1) }, '−'), val, h('button', { onclick: () => bump(.1) }, '+'), h('button', { onclick: () => bump(.5) }, '+.5')), t('plSubDelayHint'))); }
    body.append(row(t('plSubSize'), seg([['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']], pcfg('subSize', 'm'), v => { psave('subSize', v); applySubStyle(); })),
      row(t('plSubPos'), seg([[4, t('plLow')], [9, t('plMid')], [16, t('plHigh')]], pcfg('subPos', 9), v => { psave('subPos', +v); applySubStyle(); })),
      row(t('plSubBg'), seg([['shadow', t('plShadow')], ['box', t('plBox')], ['none', t('plNone')]], pcfg('subBg', 'shadow'), v => { psave('subBg', v); applySubStyle(); })),
      row(t('plSubColor'), seg([['#ffffff', t('plWhite')], ['#ffe14d', t('plYellow')], ['#7dffb1', t('plGreen')]], pcfg('subColor', '#ffffff'), v => { psave('subColor', v); applySubStyle(); })),
      row(t('plSubBold'), sw('subBold', false, () => applySubStyle())),
      row(t('plSubFont'), seg([['sans', 'Sans'], ['serif', 'Serif'], ['mono', 'Mono']], pcfg('subFont', 'sans'), v => { psave('subFont', v); applySubStyle(); })));
    body.append(h('div', { class: 'pl-subpreview' }, h('span', {}, t('plSubPreview'))));
  } else if (tab === 'keys') {
    [['Space / K', t('plKPlay')], ['← →  /  J L', '±10 s'], ['↑ ↓', t('plKVol')], ['F', t('plKFs')], ['M', t('plKMute')], ['C', t('plSubs')], ['I', t('plInfo')], ['Esc', t('plKBack')]].forEach(([k, d]) => body.append(h('div', { class: 'pl-key' }, h('kbd', {}, k), h('span', {}, d))));
  }
  panel.replaceChildren(h('div', { class: 'pl-stabs' }, tabs.map(k => h('button', { class: k === tab ? 'on' : '', onclick: () => openSettings(k) }, t('plTab_' + k))), h('button', { class: 'pl-sclose', onclick: () => panel.classList.remove('open'), 'aria-label': 'Close' }, ic('close'))), body);
  panel.classList.add('open'); closeMenus(); wake();
}
async function showEpisodes() {
  const m = $('.pl-menu-eps', PL.el); toggleMenu('.pl-menu-eps'); if (m.dataset.loaded === PL.item.SeasonId) return;
  m.replaceChildren(h('div', { class: 'pl-mh' }, t('episodes')), h('div', { class: 'spinner', style: 'margin:20px auto;width:26px;height:26px' }));
  try { const r = await api('Shows/' + PL.item.SeriesId + '/Episodes', { userId: uid(), seasonId: PL.item.SeasonId, Fields: F_BASE }); m.dataset.loaded = PL.item.SeasonId; m.replaceChildren(h('div', { class: 'pl-mh' }, (PL.item.SeasonName || t('episodes'))), ...r.Items.map(ep => h('button', { class: ep.Id === PL.item.Id ? 'on' : '', onclick: () => { closeMenus(); if (ep.Id !== PL.item.Id) playEpisode(ep); } }, h('span', {}, (ep.IndexNumber || '') + '. ' + ep.Name), ud(ep).Played ? h('small', {}, '✓') : null))); } catch (e) { }
}
function showStats(on) { const st = $('.pl-stats', PL.el); if (on === undefined) on = !st.classList.contains('open'); st.classList.toggle('open', on); clearInterval(PL.statT); if (!on) return; const upd = () => { const v = PL.v; if (!v) return; const ms = PL.ms || {}; const vs = (ms.MediaStreams || []).find(s => s.Type === 'Video') || {}; const q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : {}; st.replaceChildren(...[[t('plMethod'), PL.method || ''], [t('plSource'), [(ms.Container || '').toUpperCase(), (vs.Codec || '').toUpperCase(), vs.Width && vs.Height ? vs.Width + '×' + vs.Height : ''].filter(Boolean).join(' · ')], [t('plPlaying'), v.videoWidth + '×' + v.videoHeight], [t('plBitrate'), ms.Bitrate ? (ms.Bitrate / 1e6).toFixed(1) + ' Mbps' : ''], [t('plBuffer'), v.buffered.length ? Math.round(v.buffered.end(v.buffered.length - 1) - v.currentTime) + ' s' : '0 s'], [t('plDropped'), (q.droppedVideoFrames || 0) + ' / ' + (q.totalVideoFrames || 0)]].map(([k, val]) => h('div', {}, h('span', {}, k), h('b', {}, val)))); }; upd(); PL.statT = setInterval(upd, 1000); }

/* build */
function buildPlayerUI(it) {
  const v = h('video', { playsinline: '', preload: 'auto', poster: 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=' });
  v.addEventListener('playing', () => { wake(); applyFit(); }, { once: true });
  const seekFill = h('i'), seekBuf = h('em'), seekKnob = h('b'), bubble = h('div', { class: 'pl-bubble' }, h('div', { class: 'pl-thumb' }), h('span', {})), chapters = h('div', { class: 'pl-chapters' });
  const seek = h('div', { class: 'pl-seek' }, seekBuf, chapters, seekFill, seekKnob, bubble);
  const tCur = h('span', {}, '0:00'), tDur = h('span', {}, '0:00');
  const ppBtn = h('button', { class: 'pl-pp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play'));
  const volBar = seekBarEl(f => { v.volume = f; v.muted = false; if (pcfg('rememberVol', true)) try { localStorage.setItem('cx-pvol', f); } catch (e) { } updVol(); });
  const muteBtn = h('button', { onclick: () => { v.muted = !v.muted; updVol(); }, 'aria-label': 'Mute' }, pic('vol'));
  const tip = (label, el) => { el.setAttribute('data-tip', label); el.setAttribute('aria-label', label); return el; };
  const subsEl = h('div', { class: 'pl-subs' });
  const loadBg = imgUrl(it, 'Backdrop', 1280) || imgUrl(it, 'Primary', 600);
  const el = h('div', { id: 'cx-player', class: 'loading' }, h('div', Object.assign({ class: 'pl-loadbg' }, bg(loadBg))), v, subsEl,
    
    h('div', { class: 'pl-top' }, tip(t('plBack'), h('button', { class: 'pl-back', onclick: backFromPlayer }, pic('back'))), h('div', { class: 'pl-ttl' }, h('div', { class: 'pl-title ell' }), h('div', { class: 'pl-sub ell' })), tip(t('plInfo'), h('button', { class: 'pl-round', onclick: () => showStats() }, pic('info')))),
    h('div', { class: 'pl-stats' }),
    h('div', { class: 'pl-bigctl' }, h('button', { 'aria-label': '-10', onclick: () => skip(-skipLen()) }, skipIcon(-1)), h('button', { class: 'pl-bigpp', 'aria-label': 'Play / Pause', onclick: () => togglePlay() }, pic('play')), h('button', { 'aria-label': '+10', onclick: () => skip(skipLen()) }, skipIcon(1))),
    h('div', { class: 'pl-center' }, h('div', { class: 'pl-spin' }), h('div', { class: 'pl-status' })),
    h('div', { class: 'pl-flash' }), h('div', { class: 'pl-stack' }), h('div', { class: 'pl-gest' }),
    h('div', { class: 'pl-err' }, h('b', {}, t('plFail')), h('p', { class: 'pl-errmsg' }), h('div', { class: 'nf-btns', style: 'justify-content:center' },
      h('button', { class: 'btn white', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p); } }, t('plRetryBtn')),
      h('button', { class: 'btn grey', onclick: () => { const p = ticks() || (ud(PL.item).PlaybackPositionTicks || 0); startStream(p, { forceTranscode: true }); } }, t('plTranscode')),
      h('button', { class: 'btn grey', onclick: () => { const id = PL.item.Id; closePlayer(); playNative(id); } }, t('plNative')))),
    h('button', { class: 'pl-skipseg btn white' }, pic('skip'), h('span', {}, t('plSkipIntro'))),
    h('div', { class: 'pl-nextcard' }, h('div', { class: 'pl-nc-s' }), h('div', { class: 'pl-nc-t ell' }), h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: playNextEp }, pic('next'), t('plNext')), h('button', { class: 'btn grey', onclick: () => { psave('autoNext', false); $('.pl-nextcard', el).classList.remove('show'); } }, t('cancel')))),
    h('div', { class: 'pl-bar' }, seek, h('div', { class: 'pl-row' },
      ppBtn, tip(t('plBack10'), h('button', { onclick: () => skip(-skipLen()), class: 'pl-skip' }, skipIcon(-1))), tip(t('plFwd10'), h('button', { onclick: () => skip(skipLen()), class: 'pl-skip' }, skipIcon(1))),
      h('div', { class: 'pl-vol' }, muteBtn, volBar), h('div', { class: 'pl-time' }, tCur, h('span', { class: 'sl' }, ' / '), tDur), h('div', { style: 'flex:1' }),
      h('div', { class: 'pl-btn-wrap pl-btn-next' }, tip(t('plNext'), h('button', { onclick: playNextEp }, pic('next')))),
      h('div', { class: 'pl-btn-wrap pl-btn-eps hide' }, tip(t('episodes'), h('button', { onclick: showEpisodes }, pic('eps'))), h('div', { class: 'pl-menu pl-menu-eps' })),
      h('div', { class: 'pl-btn-wrap pl-btn-chap hide' }, tip(t('plChapters'), h('button', { onclick: () => toggleMenu('.pl-menu-chap') }, pic('chap'))), h('div', { class: 'pl-menu pl-menu-chap' })),
      h('div', { class: 'pl-btn-wrap pl-btn-audio hide' }, tip(t('plAudio'), h('button', { onclick: () => toggleMenu('.pl-menu-audio') }, pic('audio'))), h('div', { class: 'pl-menu pl-menu-audio' })),
      h('div', { class: 'pl-btn-wrap pl-btn-subs hide' }, tip(t('plSubs'), h('button', { onclick: () => toggleMenu('.pl-menu-subs') }, pic('cc'))), h('div', { class: 'pl-menu pl-menu-subs' })),
      h('div', { class: 'pl-btn-wrap' }, tip(t('plSettings'), h('button', { onclick: () => openSettings() }, pic('gear')))),
      document.pictureInPictureEnabled ? tip('Picture in picture', h('button', { onclick: () => { document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture().catch(() => { }); } }, pic('pip'))) : null,
      tip(t('plFs'), h('button', { class: 'pl-fs', onclick: () => toggleFs() }, pic('fs'))))),
    h('div', { class: 'pl-settings' }));
  getUI().append(el); PL.el = el; PL.v = v; PL.subsEl = subsEl; applySubStyle();
  if (nativeFs()) setNativeFs(true);
  $('.pl-settings', el).addEventListener('click', e => e.stopPropagation()); $$('.pl-btn-wrap', el).forEach(w => w.addEventListener('click', e => e.stopPropagation()));
  try { const sv = parseFloat(localStorage.getItem('cx-pvol')); if (isFinite(sv) && pcfg('rememberVol', true)) v.volume = sv; } catch (e) { }
  function updVol() { volBar.set(v.muted ? 0 : v.volume); muteBtn.replaceChildren(pic(v.muted || v.volume === 0 ? 'mute' : 'vol')); }
  updVol(); v.addEventListener('volumechange', updVol);
  const dur = () => (isFinite(v.duration) && v.duration > 0) ? v.duration : ((PL.item && PL.item.RunTimeTicks) || 0) / 1e7;
  v.addEventListener('timeupdate', () => {
    const d = dur(); const f = d ? v.currentTime / d : 0; if (!seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; }
    tCur.textContent = fmtT(v.currentTime); tDur.textContent = fmtT(d);
    if (v.buffered.length) { const e = v.buffered.end(v.buffered.length - 1); seekBuf.style.width = (d ? e / d : 0) * 100 + '%'; }
    if (Date.now() - PL.lastRep > 10000 && !v.paused) { PL.lastRep = Date.now(); report('Progress', { EventName: 'timeupdate' }); }
    checkSegments(); checkNextCard();
  });
  v.addEventListener('playing', () => { el.classList.remove('loading', 'err'); if (!PL.started) { PL.started = true; report('Start'); } ppBtn.replaceChildren(pic('pause')); $('.pl-bigpp', el).replaceChildren(pic('pause')); el.classList.add('is-playing'); wake(); });
  v.addEventListener('pause', () => { ppBtn.replaceChildren(pic('play')); $('.pl-bigpp', el).replaceChildren(pic('play')); el.classList.remove('is-playing'); report('Progress', { EventName: 'pause' }); wake(); });
  v.addEventListener('waiting', () => { if (!v.paused) { el.classList.add('loading'); $('.pl-status', el).textContent = ''; } });
  v.addEventListener('canplay', () => el.classList.remove('loading'));
  v.addEventListener('ended', () => { if (PL.nextItem && pcfg('autoNext', true)) playNextEp(); else backFromPlayer(); });
  v.addEventListener('error', () => { if (!PL.hls) showError(v.error ? (v.error.message || ('Media error ' + v.error.code)) : 'Playback error'); });
  let seekDrag = false;
  const frac = e => { const r = seek.getBoundingClientRect(); return Math.max(0, Math.min(1, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width)); };
  const tsInfo = () => { const tp = PL.item && PL.item.Trickplay; if (!tp || !PL.ms) return null; const byMs = tp[PL.ms.Id] || tp[Object.keys(tp)[0]]; if (!byMs) return null; const w = Object.keys(byMs).map(Number).sort((a, b) => a - b)[0]; return w ? Object.assign({ w }, byMs[w]) : null; };
  function showBubble(f) {
    const d = dur(); const time = f * d; bubble.style.left = f * 100 + '%'; $('span', bubble).textContent = fmtT(time) + chapterAt(time);
    const ti = tsInfo(); const th = $('.pl-thumb', bubble);
    if (ti && ti.Interval) { const idx = Math.min(ti.ThumbnailCount - 1, Math.floor(time * 1000 / ti.Interval)); const per = ti.TileWidth * ti.TileHeight; const tile = Math.floor(idx / per), off = idx % per; const col = off % ti.TileWidth, rw = Math.floor(off / ti.TileWidth); th.style.display = 'block'; th.style.width = ti.Width + 'px'; th.style.height = ti.Height + 'px'; th.style.backgroundImage = 'url("' + withKey(absUrl('Videos/' + PL.item.Id + '/Trickplay/' + ti.w + '/' + tile + '.jpg?MediaSourceId=' + PL.ms.Id)) + '")'; th.style.backgroundPosition = '-' + col * ti.Width + 'px -' + rw * ti.Height + 'px'; } else th.style.display = 'none';
  }
  const chapterAt = time => { const chs = PL.item.Chapters || []; let name = ''; chs.forEach(c => { if (c.StartPositionTicks / 1e7 <= time) name = c.Name; }); return name ? ' · ' + name : ''; };
  seek.addEventListener('pointerdown', e => { seekDrag = true; seek.setPointerCapture(e.pointerId); const f = frac(e); seekFill.style.width = f * 100 + '%'; showBubble(f); });
  seek.addEventListener('pointermove', e => { const f = frac(e); showBubble(f); if (seekDrag) { seekFill.style.width = f * 100 + '%'; seekKnob.style.left = f * 100 + '%'; } });
  seek.addEventListener('pointerup', e => { if (seekDrag) { seekDrag = false; v.currentTime = frac(e) * dur(); report('Progress', { EventName: 'timeupdate' }); } });
  /* tap zones: single tap toggles controls, double tap seeks (touch) */
  const flash = (txt, side) => { const f = $('.pl-flash', el); f.textContent = txt; f.className = 'pl-flash show ' + (side || ''); clearTimeout(f._t); f._t = setTimeout(() => { f.className = 'pl-flash'; }, 600); };
  /* touch: tap = show/hide controls, double tap left/right = +-10 s, double tap middle = play/pause */
  /* touch: tap = controls, double tap + more taps = stacked skip, drag: left = brightness, right = volume, horizontal = scrub */
  const stk = $('.pl-stack', el), gest = $('.pl-gest', el); let stack = { side: null, total: 0, base: 0, timer: 0 };
  const showStack = () => { stk.className = 'pl-stack show ' + stack.side; stk.replaceChildren(skipIcon(stack.total > 0 ? 1 : -1), h('b', {}, (stack.total > 0 ? '+' : '') + stack.total + ' s')); };
  function stackSkip(side) {
    const d = side === 'r' ? 10 : -10; if (stack.side !== side) { stack = { side, total: 0, base: v.currentTime, timer: 0 }; }
    stack.total += d; showStack(); clearTimeout(stack.timer);
    stack.timer = setTimeout(() => { const dd = dur() || 1e9; v.currentTime = Math.max(0, Math.min(dd - 1, stack.base + stack.total)); stack = { side: null, total: 0, base: 0, timer: 0 }; stk.className = 'pl-stack'; }, 650);
  }
  PL.bri = PL.bri || 1; const applyBri = () => { v.style.filter = PL.bri === 1 ? '' : 'brightness(' + PL.bri + ')'; }; applyBri();
  const showGest = (icon, frac, txt) => { gest.className = 'pl-gest show'; gest.replaceChildren(h('div', { class: 'gi' }, icon), frac == null ? null : h('div', { class: 'gb' }, h('i', { style: 'width:' + Math.round(frac * 100) + '%' })), txt ? h('b', {}, txt) : null); clearTimeout(gest._t); };
  const hideGest = () => { clearTimeout(gest._t); gest._t = setTimeout(() => { gest.className = 'pl-gest'; }, 450); };
  let ts = null, lastTap = 0, lastZone = '', prevIdle = false;
  const onCtl = t_ => t_.closest && t_.closest('button, a, input, .pl-seek, .pl-settings, .pl-menu, .pl-skipseg, .pl-nextcard, .pl-err');
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return; const r = el.getBoundingClientRect();
    ts = { x: e.clientX, y: e.clientY, t: Date.now(), mode: null, ctl: !!onCtl(e.target), zone: (e.clientX - r.left) / r.width, vy: (e.clientY - r.top) / r.height, vol: v.volume, bri: PL.bri, time: v.currentTime, h: r.height, w: r.width };
  });
  el.addEventListener('pointermove', e => {
    if (!ts || e.pointerType === 'mouse' || ts.ctl) return; const dx = e.clientX - ts.x, dy = e.clientY - ts.y;
    if (!ts.mode) {
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
      if (stack.side || ts.vy < .12 || ts.vy > .8) { ts.mode = 'none'; return; }
      ts.mode = Math.abs(dy) > Math.abs(dx) ? (ts.zone > .5 ? 'vol' : 'bri') : 'seek'; closeMenus();
    }
    if (ts.mode === 'vol') { const nv = Math.max(0, Math.min(1, ts.vol - dy / (ts.h * .55))); v.muted = false; v.volume = nv; showGest(pic(nv === 0 ? 'mute' : 'vol'), nv, Math.round(nv * 100) + '%'); }
    else if (ts.mode === 'bri') { PL.bri = Math.max(.25, Math.min(1.6, ts.bri - dy / (ts.h * .55))); applyBri(); showGest(luSvg('sun'), (PL.bri - .25) / 1.35, Math.round(PL.bri * 100) + '%'); }
    else if (ts.mode === 'seek') { const d_ = dur(); const nt = Math.max(0, Math.min(d_, ts.time + dx / ts.w * Math.min(d_ || 600, 240))); ts.target = nt; showGest(null, d_ ? nt / d_ : 0, fmtT(nt) + ' (' + (nt - ts.time >= 0 ? '+' : '−') + Math.abs(Math.round(nt - ts.time)) + ' s)'); }
  });
  el.addEventListener('pointercancel', () => { ts = null; hideGest(); });
  el.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse' || !ts) return; const s0 = ts; ts = null;
    if (s0.mode && s0.mode !== 'none') { if (s0.mode === 'seek' && s0.target != null) { v.currentTime = s0.target; report('Progress', { EventName: 'timeupdate' }); } hideGest(); wake(); return; }
    if (Math.abs(e.clientX - s0.x) > 14 || Math.abs(e.clientY - s0.y) > 14 || Date.now() - s0.t > 500) return;
    if (s0.ctl) { if (!el.classList.contains('idle')) wake(); return; }
    if ($('.pl-menu.open, .pl-settings.open', el)) { closeMenus(); $('.pl-settings', el).classList.remove('open'); wake(); return; }
    const now = Date.now(); const zone = s0.zone < .34 ? 'l' : s0.zone > .66 ? 'r' : 'c';
    if (stack.side && zone !== 'c' && (zone === 'r' ? 'r' : 'l') === stack.side) { stackSkip(stack.side); lastTap = 0; return; }
    if (now - lastTap < 300 && zone === lastZone) {
      lastTap = 0; if (zone === 'c') { togglePlay(); wake(); } else { stackSkip(zone); if (prevIdle) { el.classList.add('idle'); clearTimeout(PL.idleT); } }
      return;
    }
    lastTap = now; lastZone = zone; prevIdle = el.classList.contains('idle');
    if (prevIdle) wake(); else { clearTimeout(PL.idleT); el.classList.add('idle'); }
  });
  v.addEventListener('click', () => { if (!matchMedia('(pointer:coarse)').matches) togglePlay(); });
  v.addEventListener('dblclick', () => { if (!matchMedia('(pointer:coarse)').matches) toggleFs(); });
  el.addEventListener('mousemove', () => { if (!matchMedia('(pointer:coarse)').matches) wake(); });
  el.addEventListener('click', e => { if (!e.target.isConnected) return; closeMenus(); $('.pl-settings', el).classList.remove('open'); });
  v.addEventListener('play', () => flashIcon('play')); v.addEventListener('pause', () => flashIcon('pause'));
  function flashIcon(n) { if (!PL.started) return; const f = $('.pl-flash', el); f.replaceChildren(pic(n)); f.className = 'pl-flash icon show'; clearTimeout(f._t); f._t = setTimeout(() => { f.className = 'pl-flash'; }, 450); }
  wake();
}
function seekBarEl(onChange) {
  const fill = h('i'), bar = h('div', { class: 'pl-vbar' }, fill); let d = false;
  const f = e => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
  bar.addEventListener('pointerdown', e => { d = true; bar.setPointerCapture(e.pointerId); onChange(f(e)); }); bar.addEventListener('pointermove', e => { if (d) onChange(f(e)); }); bar.addEventListener('pointerup', () => { d = false; });
  bar.set = x => { fill.style.width = x * 100 + '%'; }; return bar;
}
function wake() { if (!PL.el) return; PL.el.classList.remove('idle'); clearTimeout(PL.idleT); PL.idleT = setTimeout(() => { if (PL.v && !PL.v.paused && !$('.pl-menu.open, .pl-settings.open', PL.el)) PL.el.classList.add('idle'); }, 3200); }
function togglePlay() { const v = PL.v; if (!v) return; v.paused ? v.play().catch(() => { }) : v.pause(); }
function skip(s) { const v = PL.v; if (v) v.currentTime = Math.max(0, Math.min(v.duration || 1e9, v.currentTime + s)); wake(); }
const nativeFs = () => { const n = window.NativeShell, i = window.NativeInterface; return n && n.enableFullscreen ? n : (i && i.enableFullscreen ? i : null); };
function setNativeFs(on) { const n = nativeFs(); if (!n) return false; try { on ? n.enableFullscreen() : n.disableFullscreen(); PL.nfs = on; if (typeof onFsChange === 'function') onFsChange(); } catch (e) { return false; } return true; }
function fsEl() { return PL.nfs || document.fullscreenElement || document.webkitFullscreenElement; }
function toggleFs() {
  const el = PL.el, v = PL.v; if (!el) return;
  if (nativeFs()) { setNativeFs(!PL.nfs); return; }
  if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) { } return; }
  const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } };
  const rq = el.requestFullscreen || el.webkitRequestFullscreen;
  if (rq) { const r = rq.call(el, { navigationUI: 'hide' }); if (r && r.then) r.then(lock).catch(() => { v.webkitEnterFullscreen && v.webkitEnterFullscreen(); }); else lock(); }
  else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
}
const onFsChange = () => { if (PL.el) { const b = $('.pl-fs', PL.el); b && b.replaceChildren(pic(fsEl() ? 'fsx' : 'fs')); } }; document.addEventListener('fullscreenchange', onFsChange); document.addEventListener('webkitfullscreenchange', onFsChange);
function onKey(e) {
  if (!PL.open || (e.target.closest && e.target.closest('input,textarea'))) return;
  const k = e.key; let used = true;
  if (k === ' ' || k === 'k') togglePlay(); else if (k === 'ArrowRight' || k === 'l') skip(skipLen()); else if (k === 'ArrowLeft' || k === 'j') skip(-skipLen());
  else if (k === 'ArrowUp') PL.v.volume = Math.min(1, PL.v.volume + .1); else if (k === 'ArrowDown') PL.v.volume = Math.max(0, PL.v.volume - .1);
  else if (k === 'f') toggleFs(); else if (k === 'm') PL.v.muted = !PL.v.muted; else if (k === 'i') showStats(); else if (k === 'c') { const b = $('.pl-btn-subs:not(.hide)', PL.el); b && toggleMenu('.pl-menu-subs'); }
  else if (k === 'Escape') { if ($('.pl-settings.open, .pl-menu.open', PL.el)) { $('.pl-settings', PL.el).classList.remove('open'); closeMenus(); } else if (!document.fullscreenElement) backFromPlayer(); else used = false; } else used = false;
  if (used) { e.preventDefault(); e.stopPropagation(); wake(); }
}

/* native fallback */
function playNative(id) {
  COVER.show(); C.allowNative = true; location.hash = '#/details?id=' + id; let tries = 0;
  const iv = setInterval(() => { tries++; const page = $('#itemDetailPage:not(.hide)'); const btn = page && ($('.btnResume:not(.hide)', page) || $('.btnPlay:not(.hide)', page)); if (btn) { clearInterval(iv); btn.click(); } if (tries > 80) { clearInterval(iv); COVER.hide(); } }, 150);
}

Object.assign(TX.en, { plFit: 'Picture fit', plFitContain: 'Fit', plFitCover: 'Fill', plFitFill: 'Stretch', plFitHint: 'Fit keeps the whole picture, Fill crops it to the screen, Stretch distorts it.', plSkipLen: 'Skip length', plSubDelay: 'Subtitle delay', plSubDelayHint: 'Positive values show subtitles later.' });
Object.assign(TX.de, { plFit: 'Bildformat', plFitContain: 'Anpassen', plFitCover: 'Füllen', plFitFill: 'Strecken', plFitHint: 'Anpassen zeigt das ganze Bild, Füllen schneidet es auf den Bildschirm zu, Strecken verzerrt es.', plSkipLen: 'Sprunglänge', plSubDelay: 'Untertitel-Verzögerung', plSubDelayHint: 'Positive Werte zeigen Untertitel später.' });

/* ---------- Discover 2: filters, search, personalised rows, endless grid ---------- */
const DC = { genres: null };
async function dcGenres() {
  if (DC.genres) return DC.genres;
  try { const [m, t_] = await Promise.all([seerrGet('/genres/movie'), seerrGet('/genres/tv')]); if (Array.isArray(m) && m.length) DC.genres = { movie: m, tv: Array.isArray(t_) ? t_ : [] }; else return { movie: [], tv: [] }; } catch (e) { return { movie: [], tv: [] }; }
  return DC.genres;
}
const SORTS = { popularity: ['popularity.desc', 'popularity.desc'], rating: ['vote_average.desc', 'vote_average.desc'], newest: ['primary_release_date.desc', 'first_air_date.desc'] };

async function discoverView2(page) {
  if (!(await waitSeerr())) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Seerr is not available.'))); return; }
  const wrap = h('div', {}); page.append(wrap); const skel = h('div', { style: 'height:62vh;display:grid;place-items:center' }, h('div', { class: 'spinner' })); wrap.append(skel);
  const heroP = seerrGet('/discover/trending', { page: 1 }).then(r => r.results.filter(x => x.backdropPath && x.overview && (x.mediaType === 'movie' || x.mediaType === 'tv')).slice(0, 8)).catch(() => []);
  const [lm, rm, heroRaw, genres] = await Promise.all([libMap(), reqMap(), heroP, dcGenres(), lbLoad(), archLoad()]); skel.remove();
  const make = x => dCard(x, lm, rm);
  const st = { type: 'all', genre: '', genreName: '', sort: 'popularity', hideOwned: false, hideSeen: false, q: '' };
  const hero = heroRaw.map(x => toHero(x, lm, rm));
  const heroHolder = h('div', {}, hero.length ? heroEl(hero) : h('div', { style: 'height:90px' })); wrap.prepend(heroHolder);
  /* filter bar */
  const segBtn = (v, l) => h('button', { class: 'dc-seg' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.dc-seg', typeChips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); fillGenres(); refresh(); } }, l);
  const typeChips = h('div', { class: 'dc-segs' }, [['all', t('all')], ['movie', t('movies')], ['tv', t('shows')]].map(([v, l]) => segBtn(v, l)));
  const gSel = h('select', { onchange: e => { st.genre = e.target.value; st.genreName = e.target.selectedOptions[0] ? e.target.selectedOptions[0].textContent : ''; refresh(); } });
  const mergeGenres = () => { const seen = {}; return genres.movie.concat(genres.tv).filter(g => (seen[g.id] ? false : (seen[g.id] = true))); };
  function fillGenres() { const list = st.type === 'tv' ? genres.tv : st.type === 'movie' ? genres.movie : mergeGenres(); gSel.replaceChildren(h('option', { value: '' }, t('genres')), ...list.map(g => h('option', { value: g.id }, g.name))); st.genre = ''; st.genreName = ''; }
  fillGenres();
  const sSel = h('select', { onchange: e => { st.sort = e.target.value; refresh(); } }, [['popularity', t('sortPop')], ['rating', t('sortRating')], ['newest', t('sortNew')]].map(([v, l]) => h('option', { value: v }, l)));
  const hide = h('input', { type: 'checkbox', onchange: e => { st.hideOwned = e.target.checked; refresh(); } });
  let qT; const q = h('input', { type: 'text', placeholder: t('dcSearch'), oninput: e => { clearTimeout(qT); qT = setTimeout(() => { st.q = e.target.value.trim(); refresh(); }, 400); } });
  const hideSeen = LB.n ? h('label', { class: 'dc-tg' }, h('input', { type: 'checkbox', onchange: e => { st.hideSeen = e.target.checked; refresh(); } }), h('i'), h('span', {}, t('lbHideSeen'))) : null;
  const bar = h('div', { class: 'dc-bar' }, typeChips, h('div', { class: 'dc-sel' }, gSel), h('div', { class: 'dc-sel' }, sSel), h('label', { class: 'dc-tg' }, hide, h('i'), h('span', {}, t('hideOwned'))), hideSeen, h('div', { class: 'dc-q' }, ic('search', 'ic-s'), q));
  wrap.append(bar);
  /* genre tiles (Netflix-style "browse by genre") */
  const tiles = h('div', { class: 'dc-tiles' });
  const GCOL = ['#e50914', '#7a3cff', '#0a8f6a', '#e08a00', '#1f6feb', '#c2185b', '#00838f', '#8e24aa', '#d84315', '#2e7d32'];
  mergeGenres().forEach((g, i) => tiles.append(h('button', { class: 'dc-tile', 'data-id': g.id, style: '--c:' + GCOL[i % GCOL.length], onclick: () => { st.type = genres.movie.some(x => x.id === g.id) ? 'movie' : 'tv'; $$('.dc-seg', typeChips).forEach((c, k) => c.classList.toggle('on', ['all', 'movie', 'tv'][k] === st.type)); fillGenres(); gSel.value = g.id; st.genre = String(g.id); st.genreName = g.name; $$('.dc-tile', tiles).forEach(x => x.classList.toggle('on', x.dataset.id === String(g.id))); refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, h('b', {}, g.name))));
  const tilesWrap = h('div', { class: 'dc-tiles-w' }, h('h2', { class: 'nf-sect-title', style: 'margin:0 0 12px' }, t('browseGenre')), tiles); wrap.append(tilesWrap);
  const personal = h('div', { class: 'nf-rows', style: 'margin-top:10px' }); wrap.append(personal);
  const gridHost = h('div', { class: 'nf-page-pad', style: 'padding-top:0' }); wrap.append(gridHost);
  let grid = null;
  const filtered = () => st.q || st.genre || st.sort !== 'popularity' || st.type !== 'all' || st.hideOwned || st.hideSeen;
  /* personalised rows (only when no filter is active) */
  function buildPersonal() {
    personal.replaceChildren();
    lazyRow(personal, t('trending'), () => seerrGet('/discover/trending', { page: 1 }).then(r => (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv')), 'poster', { make });
    personalRows(personal, make, lm, rm);
    lazyRow(personal, t('popMovies'), () => seerrGet('/discover/movies', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('popShows'), () => seerrGet('/discover/tv', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
    lazyRow(personal, t('upMovies'), () => seerrGet('/discover/movies/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('upShows'), () => seerrGet('/discover/tv/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
  }
  function fetcher() {
    const own = x => dStatus(x, lm, rm).k === 'own';
    let pg = 0;
    return async () => {
      const p = ++pg; let list = [], more = true;
      if (st.q) { const r = await seerrGet('/search', { query: st.q, page: p }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else if (!filtered()) { const r = await seerrGet('/discover/trending', { page: p + 1 }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else {
        const kinds = st.type === 'all' ? ['movie', 'tv'] : [st.type];
        const rs = await Promise.all(kinds.map(k => seerrGet('/discover/' + (k === 'movie' ? 'movies' : 'tv'), Object.assign({ page: p, sortBy: SORTS[st.sort][k === 'movie' ? 0 : 1] }, st.genre ? { genre: st.genre } : {})).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: k }))).catch(() => [])));
        list = rs.flat(); if (st.type === 'all') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); more = rs.some(r => r.length >= 20);
      }
      if (st.hideOwned) list = list.filter(x => !own(x));
      if (st.hideSeen) list = list.filter(x => !lbSeen(x));
      return { Items: list, done: !more };
    };
  }
  function refresh() {
    gridHost.replaceChildren(); personal.style.display = filtered() ? 'none' : ''; tilesWrap.style.display = filtered() ? 'none' : ''; heroHolder.style.display = filtered() ? 'none' : '';
    gridHost.style.paddingTop = filtered() ? '10px' : '0'; wrap.style.paddingTop = filtered() ? '88px' : '0';
    gridHost.append(h('h2', { style: 'margin:10px 0 16px;font-size:26px;font-weight:800;letter-spacing:-.02em' }, st.q ? t('results') + ' “' + st.q + '”' : st.genreName ? st.genreName : filtered() ? t('discover') : t('moreToExplore')));
    grid = infiniteGrid(gridHost, fetcher(), make, 40);
  }
  buildPersonal(); refresh();
}
/* rows built from what you watched: Seerr recommendations + your favourite genres */
async function personalRows(container, make, lm, rm) {
  try {
    const played = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 60, Fields: 'ProviderIds,Genres' });
    const withId = played.Items.filter(i => (i.ProviderIds || {}).Tmdb);
    withId.slice(0, 2).forEach(i => {
      const mt = i.Type === 'Series' ? 'tv' : 'movie';
      lazyRow(container, t('because') + ' ' + i.Name, () => seerrGet('/' + mt + '/' + i.ProviderIds.Tmdb + '/recommendations', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: mt })).filter(x => dStatus(x, lm, rm).k !== 'own')), 'poster', { make });
    });
    const count = {}; played.Items.forEach(i => (i.Genres || []).forEach(g => { count[g] = (count[g] || 0) + 1; }));
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0]);
    const gl = await dcGenres();
    top.forEach(name => { const g = gl.movie.find(x => x.name === name) || gl.tv.find(x => x.name === name); if (g) lazyRow(container, t('moreOf') + ' ' + name, () => seerrGet('/discover/movies', { page: 1, genre: g.id, sortBy: 'popularity.desc' }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own')), 'poster', { make }); });
  } catch (e) { console.warn('[cinema] personal rows', e); }
}

Object.assign(TX.en, { dcSearch: 'Search movies & shows…', browseGenre: 'Browse by genre' });
Object.assign(TX.de, { dcSearch: 'Filme & Serien suchen…', browseGenre: 'Nach Genre stöbern' });

/* ---------- detail page extras: media info, ratings, Seerr similar ---------- */
const fmtSize = b => { b = +b || 0; return b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(0) + ' MB'; };
const fmtRate = b => b ? (b / 1e6).toFixed(1) + ' Mbps' : '';
function mediaInfoSection(it, admin) {
  const srcs = it.MediaSources || []; if (!srcs.length) return null;
  const grid = h('div', { class: 'mi-grid' });
  srcs.slice(0, 3).forEach((ms, idx) => {
    const v = (ms.MediaStreams || []).find(s => s.Type === 'Video'); const a = (ms.MediaStreams || []).filter(s => s.Type === 'Audio'); const sub = (ms.MediaStreams || []).filter(s => s.Type === 'Subtitle');
    const vid = v ? [v.Width && v.Height ? v.Width + '×' + v.Height : '', (v.Codec || '').toUpperCase(), v.Profile, v.VideoRangeType && v.VideoRangeType !== 'SDR' ? v.VideoRangeType : '', v.RealFrameRate ? Math.round(v.RealFrameRate) + ' fps' : '', v.BitDepth ? v.BitDepth + '-bit' : ''].filter(Boolean).join(' · ') : '';
    const sfx = srcs.length > 1 ? ' ' + (idx + 1) : '';
    grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('miFile') + sfx), h('div', {}, (ms.Container || '').toUpperCase() + ' · ' + fmtSize(ms.Size)), h('div', {}, h('span', {}, t('miBitrate') + ': '), fmtRate(ms.Bitrate)), admin && ms.Path ? h('div', { class: 'ell', title: ms.Path, style: 'font-size:12px;color:#8d8d95' }, ms.Path) : null));
    if (vid) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('miVideo') + sfx), h('div', {}, vid)));
    if (a.length) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('plAudio') + ' (' + a.length + ')'), h('div', { class: 'mi-pills' }, a.map(x => h('i', {}, [x.Language || '?', (x.Codec || '').toUpperCase(), x.ChannelLayout || (x.Channels ? x.Channels + 'ch' : '')].filter(Boolean).join(' · '))))));
    if (sub.length) grid.append(h('div', { class: 'mi-card' }, h('h4', {}, t('plSubs') + ' (' + sub.length + ')'), h('div', { class: 'mi-pills' }, [...new Map(sub.map(x => [(x.Language || '?') + (x.IsForced ? ' forced' : '') + (x.IsHearingImpaired ? ' SDH' : ''), x])).keys()].map(k => h('i', {}, k)))));
  });
  return h('section', { class: 'nf-sect' }, h('h2', {}, t('miTitle')), grid);
}
async function ratingsRow(it, container) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !hasSeerr()) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  const info = $('.nf-dinfo .nf-meta', container); if (!info) return;
  const row = h('div', { class: 'rt-row rt-ph' }, h('span', { class: 'rt-chip sk' }), h('span', { class: 'rt-chip sk' })); info.after(row); // the space is reserved right away
  try {
    const r = await seerrGet('/' + mt + '/' + tm + '/ratingscombined'); const chips = [];
    const rt = r.rt; const im = r.imdb;
    if (rt && (rt.criticsScore != null)) chips.push(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null));
    if (im && im.criticsScore != null) chips.push(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore), im.criticsScoreCount ? h('small', {}, (im.criticsScoreCount / 1000).toFixed(0) + 'k') : null));
    if (!chips.length) { row.remove(); return; }
    row.replaceChildren(...chips); row.classList.remove('rt-ph'); row.classList.add('rt-in');
  } catch (e) { row.remove(); }
}
async function seerrSimilarRow(it, body) {
  const tm = (it.ProviderIds || {}).Tmdb; if (!tm || !(await waitSeerr())) return;
  const mt = it.Type === 'Series' ? 'tv' : 'movie';
  try {
    const [lm, rm, a, b] = await Promise.all([libMap(), reqMap(), seerrGet('/' + mt + '/' + tm + '/recommendations', { page: 1 }).catch(() => ({})), seerrGet('/' + mt + '/' + tm + '/similar', { page: 1 }).catch(() => ({}))]);
    const seen = new Set(); const list = [].concat(a.results || [], b.results || []).filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; }).map(x => Object.assign(x, { mediaType: mt })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (!list.length) return;
    const sec = h('section', { class: 'nf-sect', style: 'margin-left:calc(-1 * var(--pad));margin-right:calc(-1 * var(--pad))' }); sec.append(row(t('similarNew'), list, 'poster', { make: x => dCard(x, lm, rm) })); body.append(sec);
  } catch (e) { }
}

/* ---------- harvest entries other plugins add to Jellyfin's own menus ---------- */
const HARV = { at: 0, items: [], busy: null };
const SKIP_TXT = /^(profil|profile|einstellungen|settings|abmelden|sign out|log out|logout|dashboard|startseite|home|movies|filme|serien|tv shows|music|musik|playlists|collections|live tv|fernsehprogramm|favoriten|favorites|digitaler rekorder|übersicht|games)$/i;
function harvestDrawer() {
  const out = [];
  $$('.mainDrawer a.navMenuOption, .mainDrawer .navMenuOption, .mainDrawer .MuiListItemButton-root').forEach(el => {
    const label = (el.textContent || '').trim().replace(/\s+/g, ' '); if (!label || SKIP_TXT.test(label)) return;
    const href = el.getAttribute('href'); if (href && /#\/(home|movies|tv|music|playlists|boxsets|livetv|dashboard|list|search)/.test(href)) return;
    const icon = (el.querySelector('.navMenuOptionIcon, .material-icons, .MuiListItemIcon-root') || {}).textContent;
    out.push({ label, href: href && href !== '#' && href.startsWith('#/') ? href : null, icon: icon && icon.length < 40 ? icon.trim() : '', el });
  });
  return out;
}
async function harvestUserMenu() {
  const btn = $('.headerUserButton'); if (!btn) return [];
  const html = document.documentElement; html.classList.add('cx-harvest');
  try {
    btn.click(); let tries = 0, paper = null;
    while (tries++ < 20 && !(paper = $('.MuiMenu-paper, .MuiPopover-paper'))) await new Promise(r => setTimeout(r, 50));
    const out = [];
    if (paper) $$('li, a.MuiMenuItem-root, .MuiMenuItem-root', paper).forEach(el => {
      const label = (el.textContent || '').trim().replace(/\s+/g, ' '); if (!label || SKIP_TXT.test(label) || out.some(o => o.label === label)) return;
      const a = el.matches('a') ? el : el.querySelector('a'); const href = a && a.getAttribute('href');
      const icon = (el.querySelector('.material-icons, .material-symbols-rounded') || {}).textContent;
      out.push({ label, href: href && href.startsWith('#/') ? href : null, icon: icon && icon.length < 40 ? icon.trim() : '' });
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); const bd = $('.MuiBackdrop-root'); if (bd) bd.click();
    return out;
  } catch (e) { return []; } finally { setTimeout(() => html.classList.remove('cx-harvest'), 400); }
}
async function clickNativeMenu(label) {
  const btn = $('.headerUserButton'); if (!btn) return; document.documentElement.classList.add('cx-harvest'); btn.click();
  let tries = 0, el = null; while (tries++ < 20 && !(el = $$('.MuiMenu-paper li, .MuiMenu-paper .MuiMenuItem-root').find(x => (x.textContent || '').trim().replace(/\s+/g, ' ') === label))) await new Promise(r => setTimeout(r, 50));
  if (el) el.click(); setTimeout(() => document.documentElement.classList.remove('cx-harvest'), 400);
}
async function harvestMenus() {
  if (HARV.busy) return HARV.busy;
  HARV.busy = (async () => {
    const drawer = harvestDrawer(); const user = [];
    const items_ = []; const seen = new Set();
    user.forEach(u => { if (!seen.has(u.label)) { seen.add(u.label); items_.push(Object.assign({ via: 'user' }, u)); } });
    drawer.forEach(d => { if (!seen.has(d.label)) { seen.add(d.label); items_.push(Object.assign({ via: 'drawer' }, d)); } });
    HARV.items = items_; HARV.at = Date.now(); HARV.busy = null; return items_;
  })();
  return HARV.busy;
}

/* ---------- Letterboxd (read only) and the movie archive ---------- */
Object.assign(TX.en, {
  lbTitle: 'Letterboxd', lbIntro: 'Films you logged as watched on Letterboxd are marked as watched here, and they are labelled in Discover. This is one way only: nothing is ever written to Letterboxd.',
  lbUser: 'Letterboxd username', lbUserHint: 'The name in your profile address, letterboxd.com/NAME. The profile has to be public.', lbSave: 'Save and sync', lbSyncNow: 'Sync now',
  lbStatus: 'Status', lbStatusN: 'films known', lbNever: 'not synced yet', lbSynced: 'films marked as watched', lbImport: 'Import full history (CSV)', lbImportHint: 'Letterboxd only shares your latest ~50 diary entries automatically. For your whole history: Letterboxd, Settings, Import & Export, Export your data, then pick watched.csv (or diary.csv) here.',
  lbSeen: 'Watched', lbSeenOn: 'Watched on Letterboxd', lbHideSeen: 'Hide watched', lbImported: 'imported', lbOff: 'Letterboxd sync is turned off on the server.', lbErr: 'Letterboxd could not be reached',
  archive: 'Archive', archived: 'Archived', archiveIntro: 'Movies you archived: the file is gone to free up space, but title, poster and details are kept here. Restore a movie to have it downloaded again.', archOff: 'The archive is turned off on the server.', archEmpty: 'Nothing archived yet. Use the three-dot menu of a movie, then "Archive".',
  archiveDo: 'Archive…', archDlgTitle: 'Archive this movie', archDlgIntro: 'This frees up disk space. What happens:', archStep1: 'Title, details and pictures are saved in the archive.', archStep2: 'The movie file is deleted from the disk and the movie leaves your library.', archStep3: 'In Radarr the file is deleted and the movie is no longer monitored, so it is not downloaded again.',
  archRadarr: 'Also delete it in Radarr and stop monitoring it', archRadarrOff: 'Radarr is not connected', archGo: 'Archive and delete file', archBusy: 'Archiving…', archDone: 'Archived', archSize: 'Frees up', archWarn: 'This cannot be undone from here. You can restore the movie later by downloading it again.',
  archRestore: 'Restore (download again)', archRestoreDone: 'Radarr is searching for the movie again', archNoRadarr: 'Not in Radarr. Request it instead.', archRemove: 'Remove from archive', archRemoved: 'Removed from the archive', archSince: 'Archived on', archGenres: 'Genres', archRuntime: 'Runtime', archRating: 'Rating', archFreed: 'Freed', archRequest: 'Request instead', archAdminOnly: 'Only administrators can archive movies.', archFail: 'Archiving failed',
  archSettingsHint: 'Archived movies', archOpen: 'Open the archive', archCount: 'movies archived'
});
Object.assign(TX.de, {
  lbTitle: 'Letterboxd', lbIntro: 'Filme, die du auf Letterboxd als gesehen eingetragen hast, werden hier als gesehen markiert und in Entdecken gekennzeichnet. Das geht nur in eine Richtung: Es wird nie etwas zu Letterboxd geschrieben.',
  lbUser: 'Letterboxd-Benutzername', lbUserHint: 'Der Name in deiner Profiladresse, letterboxd.com/NAME. Das Profil muss öffentlich sein.', lbSave: 'Speichern und abgleichen', lbSyncNow: 'Jetzt abgleichen',
  lbStatus: 'Stand', lbStatusN: 'Filme bekannt', lbNever: 'noch nicht abgeglichen', lbSynced: 'Filme als gesehen markiert', lbImport: 'Ganze Historie importieren (CSV)', lbImportHint: 'Letterboxd gibt automatisch nur deine letzten ~50 Tagebuch-Einträge heraus. Für die ganze Historie: Letterboxd, Settings, Import & Export, Export your data, dann hier die Datei watched.csv (oder diary.csv) wählen.',
  lbSeen: 'Gesehen', lbSeenOn: 'Auf Letterboxd gesehen', lbHideSeen: 'Gesehene ausblenden', lbImported: 'importiert', lbOff: 'Der Letterboxd-Abgleich ist auf dem Server ausgeschaltet.', lbErr: 'Letterboxd war nicht erreichbar',
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
    LB.n = (r.items || []).length; LB.err = r.error || ''; LB.at = Date.now(); return r;
  }).catch(e => { LB.err = String((e && e.message) || e); return null; }).finally(() => { LB.p = null; });
  return LB.p;
}
/* is this film (a library item or a Seerr result) watched on Letterboxd? */
function lbSeen(x) {
  if (!LB.n) return null;
  if (x.mediaType === 'tv' || x.Type === 'Series') return null;
  const tm = +(x.tmdbId || (x.ProviderIds || {}).Tmdb || (x.mediaType ? x.id : 0)) || 0; if (tm && LB.tmdb.has(tm)) return LB.tmdb.get(tm);
  const title = x.title || x.Name || x.name; const year = +(x.ProductionYear || String(x.releaseDate || x.firstAirDate || '').slice(0, 4)) || 0; if (!title) return null;
  const k = lbNorm(title); return LB.names.get(k + '|' + year) || (year && (LB.names.get(k + '|' + (year - 1)) || LB.names.get(k + '|' + (year + 1)))) || null;
}
const lbSyncState = { busy: false };
async function lbSync(force) {
  if (!optOn('letterboxd') || !lbUser() || lbSyncState.busy) return; lbSyncState.busy = true;
  try {
    await lbLoad(force); if (!LB.n) return;
    resetSeerrCache(); const lm = await libMap(); const done = new Set(CFGU.lbDone || []); const marked = [];
    for (const key in lm) {
      if (key.indexOf('movie:') !== 0) continue; const it = lm[key]; if (ud(it).Played || done.has(it.Id)) continue;
      const e = lbSeen(it); if (!e) continue;
      try { await ApiClient.markPlayed(uid(), it.Id, e.date ? new Date(e.date + 'T20:00:00') : new Date()); marked.push(it.Id); } catch (er) { }
    }
    if (marked.length) { await saveCfg({ lbDone: (CFGU.lbDone || []).concat(marked).slice(-3000) }); C.libCache = null; resetSeerrCache(); toast('✓ ' + marked.length + ' ' + t('lbSynced')); }
    LB.last = { n: marked.length, at: Date.now() };
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
async function lbImportCsv(file, onDone) {
  const rows = csvRows((await file.text()).replace(/^﻿/, '')); if (rows.length < 2) throw new Error('CSV?');
  const head = rows[0].map(x => x.trim().toLowerCase()); const iN = head.indexOf('name'), iY = head.indexOf('year'); const iD = head.indexOf('watched date') >= 0 ? head.indexOf('watched date') : head.indexOf('date');
  if (iN < 0) throw new Error('"Name" column?');
  const items_ = rows.slice(1).filter(r => r[iN]).map(r => ({ title: r[iN], year: iY >= 0 ? +r[iY] || null : null, date: iD >= 0 ? (r[iD] || '').slice(0, 10) : null }));
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
  const seen = lbSeen(x); if (seen) out.push(h('span', { class: 'dmark seen', title: t('lbSeenOn') + (seen.date ? ' · ' + seen.date : '') }, ic('eye', 'ic-s'), h('span', { class: 'dtx' }, t('lbSeen'))));
  return out;
}
async function blobB64(url) { if (!url) return ''; try { const r = await fetch(url); if (!r.ok) return ''; const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1] || ''); fr.readAsDataURL(b); }); } catch (e) { return ''; } }
async function archiveDialog(it) {
  const d = cxDialog(t('archDlgTitle'), { wide: false }); d.busy();
  let full; try { full = await getItem(it.Id); } catch (e) { return errBox(d, e); }
  const size = ((full.MediaSources || [])[0] || {}).Size || 0; const tm = (full.ProviderIds || {}).Tmdb; const radarrOk = !!(C.status && C.status.radarr);
  const useRadarr = h('input', { type: 'checkbox', checked: radarrOk && (C.status.features || {}).archiveRadarr !== false, disabled: !radarrOk || !tm });
  const st = h('p', { class: 'cxd-hint', style: 'min-height:20px' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    go_.disabled = true; st.textContent = t('archBusy');
    try {
      const [primaryB64, backdropB64] = await Promise.all([blobB64(imgUrl(full, 'Primary', 700)), blobB64(imgUrl(full, 'Backdrop', 1280))]);
      await cpost('/archive/add', { tmdb: tm, title: full.Name, year: full.ProductionYear, overview: full.Overview, tagline: (full.Taglines || [])[0], genres: full.Genres, runtime: full.RunTimeTicks ? Math.round(full.RunTimeTicks / 6e8) : null, rating: full.CommunityRating, officialRating: full.OfficialRating, played: !!ud(full).Played, size, primaryB64, backdropB64 });
      if (useRadarr.checked && tm) { const r = await cpost('/arr/radarr/archive', { tmdbId: +tm }); if (r && r.ok === false && r.found !== false) throw new Error(r.message || 'Radarr'); }
      await jf('DELETE', 'Items/' + it.Id);
      ARCH.at = 0; await archLoad(true); C.libCache = null; resetSeerrCache(); d.close(); toast('✓ ' + t('archDone')); go('#/c/archive');
    } catch (e) { st.textContent = '⚠ ' + t('archFail') + ': ' + (e.message || e); go_.disabled = false; }
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
  const btn = (cls, ico, label, fn) => h('button', { class: 'btn ' + cls, onclick: async ev => { const b = ev.currentTarget; b.disabled = true; try { await fn(); } catch (er) { st.textContent = '⚠ ' + (er.message || er); } b.disabled = false; } }, ico ? ic(ico) : null, label);
  d.setTitle(e.title + (e.year ? ' (' + e.year + ')' : ''));
  d.body.replaceChildren(...[back ? h('div', Object.assign({ class: 'arch-hero' }, bg(back))) : null,
    h('div', { class: 'arch-top' }, poster ? h('div', Object.assign({ class: 'arch-poster' }, bg(poster))) : null, h('div', {}, e.tagline ? h('p', { class: 'nf-tagline' }, e.tagline) : null, h('p', { class: 'arch-ov' }, e.overview || ''))),
    h('dl', { class: 'nf-facts' }, facts.map(f => [h('dt', {}, f[0]), h('dd', {}, f[1])])), st].filter(Boolean));
  d.foot.replaceChildren(...[
    admin ? btn('grey', 'close', t('archRemove'), async () => { await api_del(e.key); d.close(); toast('✓ ' + t('archRemoved')); route(); }) : null,
    e.tmdb ? btn('grey', 'search', t('archRequest'), async () => { d.close(); openSeerrInfo({ id: +e.tmdb, mediaType: 'movie' }); }) : null,
    admin && e.tmdb ? btn('white', 'refresh', t('archRestore'), async () => { const r = await cpost('/arr/radarr/restore', { tmdbId: +e.tmdb }); if (r && r.found && r.ok) { toast('✓ ' + t('archRestoreDone')); d.close(); } else st.textContent = t('archNoRadarr'); }) : null].filter(Boolean));
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
    const upd = () => { stat.textContent = LB.n ? LB.n + ' ' + t('lbStatusN') + (LB.at ? ' · ' + new Date(LB.at).toLocaleTimeString() : '') + (LB.err ? ' · ⚠ ' + t('lbErr') : '') : (lbUser() ? (LB.err ? '⚠ ' + t('lbErr') : t('lbNever')) : '—'); };
    const save = h('button', { class: 'btn white', style: 'height:38px', onclick: async () => { const v = inp.value.trim().replace(/^@/, '').replace(/^https?:\/\/letterboxd\.com\//, '').replace(/\/.*$/, ''); await saveCfg({ lbUser: v || null }); stat.textContent = '…'; await lbSync(true); upd(); } }, t('lbSave'));
    const syncB = h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { stat.textContent = '…'; await lbSync(true); upd(); } }, t('lbSyncNow'));
    const file = h('input', { type: 'file', accept: '.csv,text/csv', style: 'display:none', onchange: async e => { const f = e.target.files[0]; if (!f) return; stat.textContent = '…'; try { await lbImportCsv(f, n => { toast('✓ ' + n + ' ' + t('lbImported')); }); } catch (er) { toast('⚠ ' + (er.message || er)); } upd(); } });
    const imp = h('button', { class: 'btn grey', style: 'height:38px', onclick: () => file.click() }, t('lbImport'));
    upd(); lbLoad().then(upd);
    out.push(card_(t('lbTitle'), h('p', { class: 'set-p' }, t('lbIntro')), row(t('lbUser'), t('lbUserHint'), h('div', { style: 'display:flex;gap:8px;align-items:center;flex-wrap:wrap' }, inp, save)), row(t('lbStatus'), '', h('div', { style: 'display:flex;gap:12px;align-items:center;flex-wrap:wrap' }, stat, syncB)), row(t('lbImport'), t('lbImportHint'), h('div', {}, imp, file))));
  }
  if (optOn('archive')) {
    const cnt = h('b', {}, String(ARCH.list.length)); archLoad().then(l => { cnt.textContent = String(l.length); });
    out.push(card_(t('archive'), h('p', { class: 'set-p' }, t('archiveIntro')), row(t('archSettingsHint'), '', h('div', { style: 'display:flex;gap:12px;align-items:center' }, h('span', {}, cnt, ' ' + t('archCount')), h('a', { class: 'btn grey', style: 'height:38px;display:inline-flex;align-items:center', href: '#/c/archive' }, t('archOpen'))))));
  }
  return out;
}

/* ---------- music discovery through Aurral: tracks marked as "not in library" ---------- */
const norm = s => String(s || '').toLowerCase().replace(/\(.*?\)|\[.*?\]|feat\..*|ft\..*|- .*remaster.*|radio edit/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
let myTracksP = null;
const myTracks = () => myTracksP || (myTracksP = items({ IncludeItemTypes: 'Audio', Fields: AUD_F + ',Album', Limit: 30000, EnableImageTypes: 'Primary' }).then(r => { const m = {}; r.Items.forEach(i => { const a = norm((i.ArtistItems && i.ArtistItems[0] && i.ArtistItems[0].Name) || (i.Artists || [])[0] || i.AlbumArtist); m[norm(i.Name) + '|' + a] = i; (m['t|' + norm(i.Name)] = m['t|' + norm(i.Name)] || i); }); return m; }).catch(() => ({})));
const resetMyTracks = () => { myTracksP = null; };
const extImg = u => (u && /^https?:/.test(u)) ? u : '';
const apreview = p => !p ? null : /^https?:/.test(p) ? p : p;
const caaImg = id => id ? 'https://coverartarchive.org/release-group/' + id + '/front-250' : '';
async function toTrackItems(list) {
  const mine = await myTracks();
  return list.map((x, i) => {
    const name = x.trackName || x.title || x.name || '?', artist = x.artistName || '', album = x.albumName || x.album || '';
    const own = mine[norm(name) + '|' + norm(artist)];
    if (own) return own;
    return { Id: 'x' + (x.trackMbid || x.mbid || x.id || i) + '-' + i, Name: name, Type: 'Audio', _ext: true, _tr: x, _preview: apreview(x.preview_url), _img: extImg(x.artworkUrl) || caaImg(x.releaseGroupMbid), Artists: [artist], ArtistItems: [], AlbumArtist: artist, Album: album, RunTimeTicks: (x.durationMs || x.length || 0) * 1e4, UserData: {}, IndexNumber: x.trackNumber };
  });
}
async function requestExtTrack(it) {
  const x = it._tr || {};
  const body = { artistName: x.artistName || (it.Artists || [])[0] || it.AlbumArtist || '', trackName: x.trackName || x.title || it.Name || '', albumName: x.albumName || it.Album || '', trackMbid: x.trackMbid || x.mbid || undefined, releaseGroupMbid: x.releaseGroupMbid || undefined, artistMbid: x.artistMbid || undefined };
  try {
    if (!body.artistName || !body.trackName) throw new Error('artist / title missing');
    try { await apost('/api/library/downloads/track', body); }
    catch (e) { // fall back to requesting the release the song is on
      const rg = body.releaseGroupMbid;
      if (rg) await requestAurral({ id: rg, title: body.albumName || body.trackName, artistName: body.artistName }, 'album');
      else { const r = await aget('/api/search', { q: body.artistName + ' ' + (body.albumName || body.trackName), scope: 'album', limit: 3 }); const al = aList(r)[0]; if (!al) throw e; await requestAurral(al, 'album'); }
    }
    toast('✓ ' + t('requested'));
  } catch (e) { toast('⚠ ' + ((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.message || e.statusText || 'error')); }
}

async function mDiscover(n) {
  n.append(h('div', { class: 'sp-greet' }, t('discoverMusic')));
  if (!aurralOn()) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
  const [ed, dis] = await Promise.all([aget('/api/discover/editorial').catch(() => null), aget('/api/discover').catch(() => null)]);
  const ptile = p => tile({ name: p.name, sub: (p.trackCount ? p.trackCount + ' ' + t('songsN') + ' · ' : '') + (p.curator || ''), img: extImg(p.artworkUrl), href: '#/c/music/disc/' + p.id });
  (ed && ed.forYou && ed.forYou.length) && n.append(shelf(t('forYou'), ed.forYou.map(ptile)));
  ((ed && ed.genres) || []).slice(0, 8).forEach(g => { if (g.playlists && g.playlists.length) n.append(shelf(g.name, g.playlists.slice(0, 12).map(ptile))); });
  if (dis) { const rec = (dis.recommendations || []); if (rec.length) n.append(shelf(t('discoverMusic'), rec.slice(0, 16).map(o => aurralTile(o, 'artist')))); const gt = dis.globalTop || []; if (gt.length) n.append(shelf(t('globalTopArtists'), gt.slice(0, 16).map(o => aurralTile(o, 'artist')))); }
}
async function mDisc(n, id) {
  const p = await aget('/api/discover/editorial/' + id);
  pageHead(n, { type: t('playlist') + ' · ' + t('notOwnedMix'), title: p.name, img: extImg(p.artworkUrl), meta: [p.curator || '', (p.tracks || []).length + ' ' + t('songsN')] });
  const tracks = await toTrackItems(p.tracks || []);
  const ctx = { id: 'disc-' + id, number: 'idx' };
  n.append(actionsBar(tracks.filter(x => x._preview || !x._ext), ctx), trackList(tracks, ctx));
  if (p.description) n.append(h('p', { style: 'color:#b3b3b3;margin-top:18px;max-width:780px' }, p.description));
}
async function mExtAlbum(n, id, q) {
  const [tr] = await Promise.all([aget('/api/artists/release-group/' + id + '/tracks')]);
  const title = q.get('t') || '', artist = q.get('a') || '';
  pageHead(n, { type: t('album1') + ' · ' + t('notOwnedMix'), title, img: caaImg(id), meta: [artist, (tr || []).length + ' ' + t('songsN')] });
  const tracks = await toTrackItems((tr || []).map(x => Object.assign({ artistName: artist, albumName: title, durationMs: x.length }, x)));
  const ctx = { id: 'ext-' + id, noAlbum: true, noCover: true };
  const reqBtn = h('button', { class: 'sp-pillbtn', onclick: async () => { try { await requestAurral({ id, title, artistName: artist }, 'album'); toast('✓ ' + t('requested')); } catch (e) { toast('⚠ ' + ((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.statusText || 'error')); } } }, t('requestAlbum'));
  n.append(actionsBar(tracks.filter(x => x._preview || !x._ext), ctx, reqBtn), trackList(tracks, ctx));
}
/* artist page: releases the library does not have yet */
async function aurralArtistExtras(n, ar) {
  if (!aurralOn()) return;
  const mb = (ar.ProviderIds || {}).MusicBrainzArtist; if (!mb) return;
  try {
    const [a, lib] = await Promise.all([aget('/api/artists/' + mb), loadLibrary()]);
    const mine = new Set(lib.albums.filter(x => (x.ArtistItems || []).some(y => y.Id === ar.Id) || x.AlbumArtist === ar.Name).map(x => norm(x.Name)));
    const rgs = (a['release-groups'] || []).filter(g => ['Album', 'EP', 'Single'].includes(g['primary-type']) && !(g['secondary-types'] || []).length && !mine.has(norm(g.title)));
    rgs.sort((x, y) => String(y['first-release-date'] || '').localeCompare(String(x['first-release-date'] || '')));
    if (!rgs.length) return;
    const tiles = rgs.slice(0, 24).map(g => { const el = tile({ name: g.title, sub: String(g['first-release-date'] || '').slice(0, 4) + ' · ' + t('notOwned'), img: caaImg(g.id), href: '#/c/music/ext/' + g.id + '?t=' + encodeURIComponent(g.title) + '&a=' + encodeURIComponent(ar.Name) }); el.classList.add('notown-tile'); const rq = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); try { await requestAurral({ id: g.id, title: g.title, artistName: ar.Name, artistMbid: mb }, 'album'); toast('✓ ' + t('requested')); } catch (er) { toast('⚠ ' + ((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus')); el.append(rq); return el; });
    n.append(shelf(t('notInLib'), tiles));
  } catch (e) { console.warn('[cinema] artist extras', e); }
}

Object.assign(TX.en, { mdl: 'Downloads', mdlTitle: 'Download queue', mdlEmpty: 'Nothing is downloading right now.', mdlHint: 'Requested music shows up here while it is fetched.', popMissing: 'Popular · not in your library', songRequests: 'Songs you can request', reqSong: 'Request' });
Object.assign(TX.de, { mdl: 'Downloads', mdlTitle: 'Download-Warteschlange', mdlEmpty: 'Gerade wird nichts heruntergeladen.', mdlHint: 'Angefragte Musik erscheint hier, solange sie geladen wird.', popMissing: 'Beliebt · nicht in deiner Bibliothek', songRequests: 'Songs zum Anfragen', reqSong: 'Anfragen' });
/* Aurral / Lidarr download queue */
async function mDownloads(n) {
  n.append(h('div', { class: 'sp-greet' }, t('mdlTitle')));
  if (!aurralOn()) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
  async function load() {
    let r; try { r = await aget('/api/library/downloads'); } catch (e) { r = []; }
    const list = Array.isArray(r) ? r : (r.items || r.downloads || r.queue || r.records || []);
    box.replaceChildren();
    if (!list.length) { box.append(h('div', { class: 'nf-empty' }, h('div', {}, t('mdlEmpty')), h('small', { style: 'opacity:.6' }, t('mdlHint')))); return; }
    list.forEach(x => {
      const title = x.title || x.albumName || x.album || x.name || x.trackName || '?', artist = x.artistName || x.artist || '', st = String(x.status || x.state || '').replace(/_/g, ' ');
      const pct = x.progress != null ? Math.round(x.progress > 1 ? x.progress : x.progress * 100) : x.percent != null ? Math.round(x.percent) : (x.size && x.sizeleft != null ? Math.round((1 - x.sizeleft / x.size) * 100) : null);
      box.append(h('div', { class: 'dl-row' }, h('div', Object.assign({ class: 'cv' }, bg(extImg(x.image || x.artworkUrl) || caaImg(x.releaseGroupMbid || x.albumMbid)))), h('div', { class: 'tx' }, h('b', { class: 'ell' }, title), h('span', { class: 'ell' }, [artist, st].filter(Boolean).join(' · ')), pct != null ? h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.max(2, pct) + '%' })) : null), pct != null ? h('em', {}, pct + '%') : null));
    });
  }
  const box = h('div', { class: 'dl-list' }); n.append(box); await load();
  const iv = setInterval(() => { if (!box.isConnected) clearInterval(iv); else load(); }, 8000);
}
/* songs of an artist the library does not have: popularity comes from the release listen counts */
async function aurralPopular(n, ar, popBox) {
  if (!aurralOn()) return; const mb = (ar.ProviderIds || {}).MusicBrainzArtist; if (!mb) return;
  try {
    const a = await aget('/api/artists/' + mb); const rgs = (a['release-groups'] || []).filter(g => ['Album', 'Single', 'EP'].includes(g['primary-type']) && !(g['secondary-types'] || []).length).sort((x, y) => (y.listenCount || 0) - (x.listenCount || 0)).slice(0, 6);
    const lists = await Promise.all(rgs.map(g => aget('/api/artists/release-group/' + g.id + '/tracks').then(tr => (tr || []).map((x, i) => Object.assign({ artistName: ar.Name, albumName: g.title, durationMs: x.length, releaseGroupMbid: g.id, _score: (g.listenCount || 1) / (1 + i * .6) }, x))).catch(() => [])));
    const seen = new Set(); const flat = lists.flat().sort((x, y) => y._score - x._score).filter(x => { const k = norm(x.title || x.trackName || x.name); if (!k || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
    if (!flat.length) return;
    const its = await toTrackItems(flat); if (!popBox.isConnected) return;
    popBox.replaceChildren(trackList(its, { id: mb + '-pop', number: 'idx' })); $$('.sp-th', popBox).forEach(x => x.remove());
  } catch (e) { console.warn('[cinema] popular', e); }
}
/* request single songs: finds the songs inside the artist's biggest releases (when the query names an artist) and inside matching albums */
async function aurralTrackSearchOld(node, q) {
  if (!aurralOn() || q.length < 2) return;
  const toks = norm(q).split(' ').filter(Boolean); if (!toks.length) return; const qset = new Set(toks);
  const artistOf = o => o.artistName || (o.artist && (o.artist.name || o.artist)) || ((o['artist-credit'] || [])[0] || {}).name || '';
  try {
    const [ra, rr] = await Promise.all([aget('/api/search', { q, scope: 'artist', limit: 8 }).catch(() => null), aget('/api/search', { q, scope: 'album', limit: 8 }).catch(() => null)]);
    const artists = aList(ra).filter(o => { const nt = norm(aName(o)).split(' ').filter(Boolean); return nt.length && nt.every(w => qset.has(w)); }).slice(0, 2);
    const groups = [];
    const byArtist = await Promise.all(artists.map(ar => aget('/api/artists/' + ar.id).then(a => (a['release-groups'] || []).filter(g => ['Album', 'Single', 'EP'].includes(g['primary-type'])).sort((x, y) => (y.listenCount || 0) - (x.listenCount || 0)).slice(0, 12).map(g => ({ id: g.id, title: g.title, artistName: aName(ar), rank: g.listenCount || 0, src: 1 }))).catch(() => [])));
    byArtist.flat().forEach(g => groups.push(g));
    aList(rr).slice(0, 6).forEach(o => groups.push({ id: o.id, title: o.title || o.name, artistName: artistOf(o), rank: 0, src: 0 }));
    const seenG = new Set(); const gs = groups.filter(g => g.id && !seenG.has(g.id) && seenG.add(g.id)).slice(0, 16);
    const lists = await Promise.all(gs.map(g => aget('/api/artists/release-group/' + g.id + '/tracks').then(tr => (tr || []).map(x => Object.assign({ artistName: g.artistName, albumName: g.title, durationMs: x.length, releaseGroupMbid: g.id, _g: g }, x))).catch(() => [])));
    const scored = []; const seen = new Set();
    lists.flat().forEach(x => {
      const title = norm(x.title || x.trackName || x.name), art = norm(x.artistName); if (!title) return;
      if (!toks.every(w => (title + ' ' + art).includes(w))) return;
      const rest = toks.filter(w => !art.split(' ').includes(w)); const titleHit = rest.length ? rest.every(w => title.includes(w)) : true;
      const exact = rest.length && title === rest.join(' ');
      const k = title + '|' + art; if (seen.has(k)) return; seen.add(k);
      scored.push({ x, s: (exact ? 8 : 0) + (titleHit ? 4 : 0) + (x._g.src ? 2 : 0) + Math.min(2, (x._g.rank || 0) / 150000) });
    });
    scored.sort((a, b) => b.s - a.s);
    const its = (await toTrackItems(scored.slice(0, 14).map(o => o.x))).filter(x => x._ext).slice(0, 10); if (!its.length) return;
    const sec = h('section', {}, h('h2', {}, t('songRequests')), trackList(its, { id: 'req-' + q, number: 'idx' })); $$('.sp-th', sec).forEach(x => x.remove()); const res = node.querySelector('.sp-res'); if (res) res.after(sec); else node.insertBefore(sec, node.firstChild);
  } catch (e) { console.warn('[cinema] track search', e); }
}
/* song search over a public catalogue (server side), popularity ranked */
async function aurralTrackSearch(node, q) {
  if (!aurralOn() || q.length < 2) return;
  let list = null; try { list = await cget('/music/search', { q }); } catch (e) { list = null; }
  if (!Array.isArray(list) || !list.length) return aurralTrackSearchOld(node, q);
  try {
    const BAD = /\b(karaoke|instrumental|tribute|8[- ]?bit|lullaby|made famous|in the style|backing track|midi)\b/i; const seen = new Set();
    const flat = list.filter(x => { if (!x.title || !x.artist || BAD.test(x.title + ' ' + x.artist + ' ' + (x.album || ''))) return false; const k = norm(x.title) + '|' + norm(x.artist); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(x => ({ artistName: x.artist, trackName: x.title, title: x.title, albumName: x.album || '', durationMs: x.length, preview_url: x.preview, artworkUrl: x.image, id: x.id }));
    const its = (await toTrackItems(flat.slice(0, 30))).filter(x => x._ext).slice(0, 10); if (!its.length) return;
    const sec = h('section', {}, h('h2', {}, t('songRequests')), trackList(its, { id: 'req-' + q, number: 'idx' })); $$('.sp-th', sec).forEach(x => x.remove()); const res = node.querySelector('.sp-res'); if (res) res.after(sec); else node.insertBefore(sec, node.firstChild);
  } catch (e) { console.warn('[cinema] track search', e); aurralTrackSearchOld(node, q); }
}
Object.assign(TX.en, { recRediscover: 'Rediscover', recSimilar: 'Similar to', recSimilarNew: 'Similar artists you could add', recMore: 'Because you listen to' });
Object.assign(TX.de, { recRediscover: 'Wiederentdecken', recSimilar: 'Ähnlich wie', recSimilarNew: 'Ähnliche Künstler zum Hinzufügen', recMore: 'Weil du hörst' });
async function musicRecs(node) {
  try {
    const [albums, recent] = await Promise.all([items({ IncludeItemTypes: 'MusicAlbum', SortBy: 'Random', Limit: 14 }), tracksOf({ Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 12 })]);
    if (!node.isConnected && !node.parentElement) return;
    if (albums.Items.length > 5) node.append(shelf(t('recRediscover'), albums.Items.map(albumTile)));
    const seenA = new Set(); const arts = []; recent.forEach(x => { const a = (x.ArtistItems || [])[0]; if (a && !seenA.has(a.Id)) { seenA.add(a.Id); arts.push(a); } });
    for (const a of arts.slice(0, 2)) {
      const sim = await api('Items/' + a.Id + '/Similar', { userId: uid(), Limit: 14 }).catch(() => ({ Items: [] }));
      const own = (sim.Items || []).filter(i => i.Type === 'MusicArtist'); if (own.length > 3) node.append(shelf(t('recSimilar') + ' ' + a.Name, own.map(artistTile)));
    }
    if (aurralOn() && arts[0]) {
      const full = await getItem(arts[0].Id).catch(() => null); const mb = full && (full.ProviderIds || {}).MusicBrainzArtist;
      if (mb) { const r = await aget('/api/artists/' + mb + '/similar').catch(() => null); const list = ((r && r.artists) || []).slice(0, 14); if (list.length) node.append(shelf(t('recSimilarNew') + ' · ' + arts[0].Name, list.map(o => aurralTile({ id: o.id, name: o.name, image: o.image, type: 'artist' }, 'artist')))); }
    }
  } catch (e) { console.warn('[cinema] music recs', e); }
}

/* ---------- Cinema UI music: player engine + Spotify-style views ---------- */
const P = {
  audio: new Audio(), orig: [], q: [], i: -1, shuffle: false, repeat: 0, subs: [], psid: null, lastReport: 0, reportedStart: false, ctx: null
};
C.P = P; P.audio.preload = 'auto';
const cur = () => P.q[P.i] || null;
const emit = () => P.subs.forEach(f => { try { f(); } catch (e) { } });
const TF = 'Fields=PrimaryImageAspectRatio,Genres,ProductionYear,DateCreated,ParentId,AlbumId,AlbumPrimaryImageTag,Artists,ArtistItems';
const AUD_F = 'PrimaryImageAspectRatio,Genres,ProductionYear,DateCreated,ParentId,AlbumId,AlbumPrimaryImageTag,Artists,ArtistItems,RunTimeTicks,UserData';
const trackImg = (it, w) => imgUrl(it, 'Primary', w || 120);
const artistLinks = it => (it.ArtistItems || []).length ? it.ArtistItems.map((a, i) => [i ? ', ' : '', h('a', { href: '#/c/music/artist/' + a.Id, onclick: e => e.stopPropagation() }, a.Name)]) : (it.AlbumArtist || (it.Artists || [])[0] || '');
const artistText = it => (it.ArtistItems || []).length ? it.ArtistItems.map(a => a.Name).join(', ') : (it.AlbumArtist || (it.Artists || []).join(', ') || '');

function streamUrl(it) {
  if (it._preview) return /^https?:/.test(it._preview) ? it._preview : withKey(ApiClient.getUrl('Cinema/aurral/' + it._preview.replace(/^\//, '')));
  return ApiClient.getUrl('Audio/' + it.Id + '/universal', {
    UserId: uid(), DeviceId: ApiClient.deviceId(), MaxStreamingBitrate: 140000000, Container: 'opus,mp3|mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg',
    TranscodingContainer: 'mp3', TranscodingProtocol: 'http', AudioCodec: 'mp3', ApiKey: ApiClient.accessToken(), PlaySessionId: P.psid, EnableRedirection: true, EnableRemoteMedia: false
  });
}
const rep = (kind, extra) => { try { const it = cur(); if (!it || it._ext) return; const o = Object.assign({ ItemId: it.Id, PlaySessionId: P.psid, PositionTicks: Math.floor(P.audio.currentTime * 1e7), IsPaused: P.audio.paused, CanSeek: true, MediaSourceId: it.Id, PlayMethod: 'DirectStream', QueueableMediaTypes: ['Audio'] }, extra); ApiClient['reportPlayback' + kind](o); } catch (e) { } };
function loadCurrent(autoplay) {
  const it = cur(); if (!it) return;
  if (it._ext && !it._preview) { toast(t('noPreview') + ': ' + it.Name); setTimeout(() => next(), 600); return; }
  if (P.reportedStart) rep('Stopped');
  P.psid = 'cx' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  P.audio.src = streamUrl(it);
  P.reportedStart = false;
  if (autoplay !== false) P.audio.play().catch(() => { });
  emit(); setMedia();
}
function playList(tracks, idx, opts) {
  opts = opts || {};
  if (!tracks.length) return;
  P.orig = tracks.slice(); idx = idx || 0;
  if (opts.shuffle != null) P.shuffle = opts.shuffle;
  if (P.shuffle) { const first = P.orig[idx]; P.q = [first].concat(shuffleArr(P.orig.filter((_, k) => k !== idx))); P.i = 0; } else { P.q = P.orig.slice(); P.i = idx; }
  P.ctx = opts.ctx || null;
  loadCurrent();
}
function next(auto) {
  if (!P.q.length) return;
  if (auto && P.repeat === 2) { P.audio.currentTime = 0; P.audio.play(); return; }
  if (P.i + 1 < P.q.length) { P.i++; loadCurrent(); } else if (P.repeat === 1) { P.i = 0; loadCurrent(); } else { P.audio.pause(); P.audio.currentTime = 0; if (P.reportedStart) { rep('Stopped'); P.reportedStart = false; } emit(); }
}
function prev() { if (P.audio.currentTime > 3 || P.i <= 0) { P.audio.currentTime = 0; return; } P.i--; loadCurrent(); }
function toggle() { if (!cur()) return; P.audio.paused ? P.audio.play().catch(() => { }) : P.audio.pause(); }
function toggleShuffle() {
  P.shuffle = !P.shuffle; const c = cur();
  if (c) { if (P.shuffle) { const rest = shuffleArr(P.q.filter((_, k) => k !== P.i)); P.q = [c].concat(rest); P.i = 0; } else { const k = P.orig.findIndex(x => x.Id === c.Id); P.q = P.orig.slice(); P.i = k < 0 ? 0 : k; } }
  emit();
}
const cycleRepeat = () => { P.repeat = (P.repeat + 1) % 3; emit(); };
const addQueue = (tracks, atNext) => { if (!P.q.length) return playList(tracks, 0); if (atNext) P.q.splice(P.i + 1, 0, ...tracks); else P.q.push(...tracks); P.orig.push(...tracks); emit(); toast(t('queued')); };
P.audio.addEventListener('ended', () => next(true));
P.audio.addEventListener('play', () => { if (!P.reportedStart) { P.reportedStart = true; rep('Start'); } else rep('Progress', { EventName: 'unpause' }); emit(); });
P.audio.addEventListener('pause', () => { if (!P.audio.ended) rep('Progress', { EventName: 'pause' }); emit(); });
P.audio.addEventListener('timeupdate', () => { tickUI(); const n = Date.now(); if (n - P.lastReport > 10000 && !P.audio.paused) { P.lastReport = n; rep('Progress', { EventName: 'timeupdate' }); } });
P.audio.addEventListener('error', () => { const it = cur(); if (it) { toast('⚠ ' + it.Name); setTimeout(() => next(), 800); } });
window.addEventListener('beforeunload', () => { if (P.reportedStart) rep('Stopped'); });
function setMedia() {
  const it = cur(); if (!it || !('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: it.Name, artist: artistText(it), album: it.Album || '', artwork: [{ src: trackImg(it, 512), sizes: '512x512', type: 'image/jpeg' }] });
    navigator.mediaSession.setActionHandler('play', toggle); navigator.mediaSession.setActionHandler('pause', toggle);
    navigator.mediaSession.setActionHandler('previoustrack', prev); navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekto', e => { P.audio.currentTime = e.seekTime; });
  } catch (e) { }
}
const likeTrack = async it => { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData = Object.assign(ud(it), { IsFavorite: on }); P.q.concat(P.orig).forEach(x => { if (x.Id === it.Id) x.UserData = it.UserData; }); emit(); refreshRows(); return on; };

/* colour sampling for gradients */
const colorCache = {};
function dominant(url) {
  if (!url) return Promise.resolve([60, 60, 80]);
  if (colorCache[url]) return Promise.resolve(colorCache[url]);
  return new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let best = null, bs = -1, r = 0, g = 0, b = 0, n = 0;
        for (let k = 0; k < d.length; k += 4) { const R = d[k], G = d[k + 1], B = d[k + 2]; const mx = Math.max(R, G, B), mn = Math.min(R, G, B); const sat = mx ? (mx - mn) / mx : 0; const sc = sat * (mx / 255); r += R; g += G; b += B; n++; if (sc > bs && mx > 50) { bs = sc; best = [R, G, B]; } }
        let col = best && bs > .25 ? best : [r / n, g / n, b / n]; const m = Math.max(...col); if (m > 200) col = col.map(v => v * .75); colorCache[url] = col.map(Math.round); res(colorCache[url]); } catch (e) { res([60, 60, 80]); } };
    im.onerror = () => res([60, 60, 80]); im.src = url;
  });
}
const rgb = (c, a) => 'rgba(' + c.join(',') + ',' + (a == null ? 1 : a) + ')';

/* ---------- player bar UI ---------- */
const ui = {};
function seekBar(getFrac, onSeek, onVol) {
  const fill = h('i'), knob = h('b'); const bar = h('div', { class: 'bar' }, fill, knob);
  const set = f => { f = Math.max(0, Math.min(1, f || 0)); fill.style.width = f * 100 + '%'; knob.style.left = f * 100 + '%'; };
  let drag = false;
  const at = e => { const r = bar.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX); return (x - r.left) / r.width; };
  bar.addEventListener('pointerdown', e => { drag = true; bar.setPointerCapture(e.pointerId); const f = at(e); set(f); onSeek(f, false); });
  bar.addEventListener('pointermove', e => { if (drag) { const f = at(e); set(f); onSeek(f, false); } });
  bar.addEventListener('pointerup', e => { if (drag) { drag = false; const f = Math.max(0, Math.min(1, at(e))); onSeek(f, true); } });
  bar.set = set; bar.dragging = () => drag; return bar;
}
function trackLikeBtn(it, cls) { const b = h('button', { class: cls || 'pl-btn', onclick: async e => { e.stopPropagation(); await likeTrack(it); } }); const upd = () => { b.classList.toggle('on', !!ud(it).IsFavorite); b.replaceChildren(ic(ud(it).IsFavorite ? 'heartOn' : 'heart')); }; upd(); b._upd = upd; return b; }

function buildPlayer() {
  const cv = h('div', { class: 'cv', onclick: () => { const it = cur(); if (it && it.AlbumId) go('#/c/music/album/' + it.AlbumId); } });
  const tn = h('div', { class: 'tn ell' }), ta = h('div', { class: 'ta ell' }), likeSlot = h('div');
  const left = h('div', { class: 'pl-l' }, cv, h('div', { class: 'tx' }, tn, ta), likeSlot);
  const bShuffle = h('button', { class: 'pl-btn', onclick: toggleShuffle, 'aria-label': t('shuffle') }, ic('shuffle'));
  const bPrev = h('button', { class: 'pl-btn', onclick: prev }, ic('prev'));
  const bPlay = h('button', { class: 'pl-btn big', onclick: toggle }, ic('play'));
  const bNext = h('button', { class: 'pl-btn', onclick: () => next() }, ic('next'));
  const bRep = h('button', { class: 'pl-btn', onclick: cycleRepeat }, ic('repeat'));
  const tCur = h('span', {}, '0:00'), tDur = h('span', {}, '0:00');
  const seek = seekBar(null, (f, commit) => { if (P.audio.duration) { if (commit) P.audio.currentTime = f * P.audio.duration; tCur.textContent = fmtTime(f * P.audio.duration); } });
  const center = h('div', { class: 'pl-c' }, h('div', { class: 'pl-btns' }, bShuffle, bPrev, bPlay, bNext, bRep), h('div', { class: 'mp-seek' }, tCur, seek, tDur));
  const vol = seekBar(null, f => { P.audio.volume = f; vol.set(f); try { localStorage.setItem('cx-vol', f); } catch (e) { } });
  const sv = parseFloat((() => { try { return localStorage.getItem('cx-vol'); } catch (e) { return null; } })()); P.audio.volume = isFinite(sv) ? sv : 1; vol.set(P.audio.volume);
  const bQ = h('button', { class: 'pl-btn', onclick: toggleQueue, 'aria-label': t('queue') }, ic('queue'));
  const bMute = h('button', { class: 'pl-btn', onclick: () => { P.audio.muted = !P.audio.muted; vol.set(P.audio.muted ? 0 : P.audio.volume); } }, ic('vol'));
  const upMute = () => bMute.replaceChildren(ic(P.audio.muted || P.audio.volume === 0 ? 'volx' : 'vol')); P.audio.addEventListener('volumechange', upMute);
  const bL = h('button', { class: 'pl-btn', onclick: toggleLyrics, 'aria-label': t('lyrics') }, ic('mic'));
  const right = h('div', { class: 'pl-r' }, bL, bQ, bMute, vol);
  const bar = h('div', { class: 'sp-player' }, left, center, right);

  /* mobile mini + full */
  const mcv = h('div', { class: 'cv' }), mtn = h('b', { class: 'ell' }), mta = h('span', { class: 'ell' }), mpp = h('button', { class: 'pl-btn', onclick: e => { e.stopPropagation(); toggle(); } }, ic('play')), mfill = h('i');
  const mLike = h('div', { class: 'mlike', onclick: e => e.stopPropagation() });
  const mbar = h('div', { class: 'mbar' }, h('div', { class: 'mtrack' }, mfill, h('b', { class: 'mknob' })));
  { let drag = false; const frac = e => { const r = mbar.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
    const paint = f => { mfill.style.width = f * 100 + '%'; mbar.querySelector('.mknob').style.left = f * 100 + '%'; };
    mbar.addEventListener('click', e => e.stopPropagation());
    mbar.addEventListener('pointerdown', e => { e.stopPropagation(); drag = true; mbar.classList.add('drag'); mbar.setPointerCapture(e.pointerId); paint(frac(e)); });
    mbar.addEventListener('pointermove', e => { if (drag) { e.stopPropagation(); paint(frac(e)); } });
    const end = e => { if (!drag) return; e.stopPropagation(); drag = false; mbar.classList.remove('drag'); const f = frac(e); if (P.audio.duration) P.audio.currentTime = f * P.audio.duration; };
    mbar.addEventListener('pointerup', end); mbar.addEventListener('pointercancel', () => { drag = false; mbar.classList.remove('drag'); });
    mbar.isDragging = () => drag; }
  const mini = h('div', { class: 'sp-mini hide', onclick: () => openFull(true) }, mcv, h('div', { class: 'tx' }, mtn, mta), mLike, mpp, mbar);
  const fcv = h('div', { class: 'cvbig' }), ftn = h('div', { class: 'tn' }), fta = h('div', { class: 'ta' }), fLike = h('div');
  const fcur = h('span', {}, '0:00'), fdur = h('span', {}, '0:00');
  const fseek = seekBar(null, (f, commit) => { if (P.audio.duration) { if (commit) P.audio.currentTime = f * P.audio.duration; fcur.textContent = fmtTime(f * P.audio.duration); } });
  const fb = { sh: h('button', { class: 'pl-btn', onclick: toggleShuffle }, ic('shuffle')), pv: h('button', { class: 'pl-btn', onclick: prev }, ic('prev')), pp: h('button', { class: 'pl-btn big', onclick: toggle }, ic('play')), nx: h('button', { class: 'pl-btn', onclick: () => next() }, ic('next')), rp: h('button', { class: 'pl-btn', onclick: cycleRepeat }, ic('repeat')) };
  const full = h('div', { class: 'sp-full' }, h('div', { class: 'top' }, h('button', { class: 'pl-btn', onclick: () => openFull(false) }, ic('down')), h('b', {}, t('nowPlaying')), h('div', { class: 'tops' }, h('button', { class: 'pl-btn', onclick: () => toggleLyrics() }, ic('mic')), h('button', { class: 'pl-btn', onclick: () => toggleQueue() }, ic('queue')))), fcv,
    h('div', { class: 'meta' }, h('div', { style: 'min-width:0' }, ftn, fta), fLike), h('div', { class: 'seekwrap' }, fseek, h('div', { class: 'mp-seek' }, fcur, h('span', { style: 'flex:1' }), fdur)), h('div', { class: 'ctr' }, fb.sh, fb.pv, fb.pp, fb.nx, fb.rp));
  /* the phone's back button / swipe closes the player (or the lyrics / queue layer on top of it) instead of leaving the music page */
  BACK.closeFull = () => { full.classList.remove('open'); full.style.transform = ''; };
  function openFull(on) {
    const mobile = matchMedia('(max-width: 800px)').matches;
    if (on && mobile && !BACK.full) { try { history.pushState({ cxFull: 1 }, '', location.href); BACK.full = true; } catch (e) { } }
    full.classList.toggle('open', on); full.style.transform = '';
    if (!on && BACK.full) { BACK.full = false; BACK.skip++; try { history.back(); } catch (e) { BACK.skip--; } }
  }
  /* Spotify style lyrics card inside the full-screen player */
  const fLn = h('div', { class: 'ln' }); const fLyr = h('div', { class: 'f-lyr hide', onclick: () => toggleLyrics() }, h('b', {}, t('lyrics')), fLn); full.append(fLyr);
  let fLyrId = null, fLyrData = null;
  function paintFLyr() {
    if (!fLyrData || !fLyrData.length) { fLyr.classList.add('hide'); return; } fLyr.classList.remove('hide');
    const now = P.audio.currentTime + .25; let idx = 0; const synced = fLyrData[0].t != null; if (synced) { for (let i = 0; i < fLyrData.length; i++) { if (fLyrData[i].t != null && fLyrData[i].t <= now) idx = i; else if (fLyrData[i].t != null) break; } }
    fLn.replaceChildren(...fLyrData.slice(idx, idx + 4).map((l, k) => h('p', { class: k === 0 && synced ? 'on' : '' }, l.s)));
  }
  async function updFLyr() {
    const it = cur(); if (!it) return;
    if (it.Id !== fLyrId) { fLyrId = it.Id; fLyrData = null; fLyr.classList.add('hide'); try { const r = await api('Audio/' + it.Id + '/Lyrics'); if (fLyrId !== it.Id) return; fLyrData = (r.Lyrics || []).map(l => ({ t: l.Start != null ? l.Start / 1e7 : null, s: l.Text })).filter(l => l.s); } catch (e) { fLyrData = []; } }
    paintFLyr();
  }
  P.audio.addEventListener('timeupdate', () => { if (full.classList.contains('open')) paintFLyr(); });
  P.subs.push(updFLyr);
  let sy = null; full.addEventListener('touchstart', e => { if (e.target.closest('.bar, .seekwrap')) { sy = null; return; } sy = e.touches[0].clientY; full.style.transition = 'none'; }, { passive: true });
  full.addEventListener('touchmove', e => { if (sy == null) return; const dy = e.touches[0].clientY - sy; if (dy > 0) full.style.transform = 'translateY(' + dy + 'px)'; }, { passive: true });
  full.addEventListener('touchend', e => { if (sy == null) return; const dy = e.changedTouches[0].clientY - sy; sy = null; full.style.transition = ''; if (dy > 110) openFull(false); else full.style.transform = ''; });

  let lastId = null;
  P.subs.push(() => {
    const it = cur(); const playing = !P.audio.paused;
    bar.style.visibility = it ? 'visible' : 'hidden'; if (C.sp) C.sp.el.classList.toggle('idle', !it);
    mini.classList.toggle('hide', !it);
    if (!it) return;
    const src = trackImg(it, 300);
    if (lastId !== it.Id) {
      lastId = it.Id;
      cv.style.backgroundImage = mcv.style.backgroundImage = fcv.style.backgroundImage = 'url("' + src + '")';
      tn.replaceChildren(h('a', { href: '#/c/music/album/' + (it.AlbumId || '') }, it.Name)); tn.querySelector('a').addEventListener('click', e => { if (!it.AlbumId) e.preventDefault(); });
      ta.replaceChildren(...[].concat(artistLinks(it)).flat());
      mtn.textContent = ftn.textContent = it.Name; mta.textContent = fta.textContent = artistText(it);
      likeSlot.replaceChildren(trackLikeBtn(it)); fLike.replaceChildren(trackLikeBtn(it)); mLike.replaceChildren(trackLikeBtn(it));
      dominant(trackImg(it, 64)).then(c => { full.style.setProperty('--tint', rgb(c)); mini.style.setProperty('--mini', rgb(c.map(v => Math.round(v * .55)))); });
      tDur.textContent = fdur.textContent = fmtTime((it.RunTimeTicks || 0) / 1e7);
    }
    $$('.pl-btn', likeSlot).concat($$('.pl-btn', fLike), $$('.pl-btn', mLike)).forEach(b => b._upd && b._upd());
    const pi = playing ? 'pause' : 'play';
    [bPlay, fb.pp, mpp].forEach(b => b.replaceChildren(ic(pi)));
    [bShuffle, fb.sh].forEach(b => b.classList.toggle('on', P.shuffle));
    [bRep, fb.rp].forEach(b => b.classList.toggle('on', P.repeat > 0));
    bRep.title = P.repeat === 2 ? 'Repeat one' : 'Repeat'; [bRep, fb.rp].forEach(b => { b.style.opacity = P.repeat === 2 ? .85 : ''; });
    root.classList.toggle('paused', !playing);
    $$('.sp-row').forEach(r => { r.classList.toggle('playing', r.dataset.id === it.Id); });
    $$('.sp-li .nm').forEach(n => n.classList.toggle('playing', n.closest('.sp-li').dataset.id === (P.ctx && P.ctx.id)));
    if (C.updateNPill) C.updateNPill();
    if (queueEl) renderQueue();
  });
  tickUI = () => {
    const d = P.audio.duration || ((cur() || {}).RunTimeTicks || 0) / 1e7 || 0; const f = d ? P.audio.currentTime / d : 0;
    if (!seek.dragging()) { seek.set(f); tCur.textContent = fmtTime(P.audio.currentTime); }
    if (!fseek.dragging()) { fseek.set(f); fcur.textContent = fmtTime(P.audio.currentTime); }
    tDur.textContent = fdur.textContent = fmtTime(d); if (!mbar.isDragging()) { mfill.style.width = f * 100 + '%'; const mk = mbar.querySelector('.mknob'); if (mk) mk.style.left = f * 100 + '%'; }
  };
  return { bar, mini, full };
}
let tickUI = () => { };
let queueEl = null;
const BACK = { full: false, panel: false, skip: 0, closeFull: null };
window.addEventListener('popstate', () => {
  if (BACK.skip > 0) { BACK.skip--; return; }
  if (BACK.panel) { BACK.panel = false; if (lyrEl) { lyrEl.remove(); lyrEl = null; } if (queueEl) { queueEl.remove(); queueEl = null; } return; }
  if (BACK.full && BACK.closeFull) { BACK.full = false; BACK.closeFull(); }
});
const panelOpened = () => { if (matchMedia('(max-width: 800px)').matches && !BACK.panel) { try { history.pushState({ cxPanel: 1 }, '', location.href); BACK.panel = true; } catch (e) { } } };
const panelClosed = () => { if (BACK.panel && !lyrEl && !queueEl) { BACK.panel = false; BACK.skip++; try { history.back(); } catch (e) { BACK.skip--; } } };
const panelHost = () => matchMedia('(max-width: 800px)').matches ? root : $('.sp-main', root).parentElement;
function toggleQueue() { if (lyrEl) { lyrEl.remove(); lyrEl = null; } if (queueEl) { queueEl.remove(); queueEl = null; panelClosed(); return; } queueEl = h('div', { class: 'sp-queue' }); panelHost().append(queueEl); renderQueue(); panelOpened(); }
function renderQueue() {
  if (!queueEl) return; const it = cur();
  const rowQ = (x, k) => h('div', { class: 'sp-qi' + (k === P.i ? ' playing' : ''), onclick: () => { P.i = k; loadCurrent(); } }, h('div', Object.assign({ class: 'cv' }, bg(trackImg(x, 100)))), h('div', {}, h('b', { class: 'ell' }, x.Name), h('span', { class: 'ell' }, artistText(x))));
  queueEl.replaceChildren(...[h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, h('h3', {}, t('queue')), h('button', { class: 'pl-btn', onclick: toggleQueue }, ic('close'))),
    it ? [h('h4', {}, t('nowPlaying')), rowQ(it, P.i)] : null, P.q.length > P.i + 1 ? [h('h4', {}, t('nextIn')), P.q.slice(P.i + 1, P.i + 101).map((x, k) => rowQ(x, P.i + 1 + k))] : null].flat(3).filter(Boolean));
}

/* ---------- menus / modals ---------- */
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
document.addEventListener('click', closeMenu, true);
function openMenu(x, y, entries) {
  closeMenu();
  menuEl = h('div', { class: 'sp-menu' }, entries.map(en => en === '-' ? h('hr') : h('button', { onclick: e => { e.stopPropagation(); closeMenu(); en.fn(); } }, en.icon ? ic(en.icon, 'ic-s') : (en.mi ? h('span', { class: 'mi' }, en.mi) : null), en.label)));
  getUI().append(menuEl); menuEl.style.zIndex = 9600;
  const r = menuEl.getBoundingClientRect(); menuEl.style.left = Math.min(x, innerWidth - r.width - 8) + 'px'; menuEl.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
}
function promptName(title, cb) {
  const inp = h('input', { type: 'text', placeholder: t('name') });
  const m = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === m) m.remove(); } }, h('div', { class: 'sp-modal' }, h('h3', {}, title), inp, h('div', { class: 'row' }, h('button', { class: 'sp-pillbtn dark', onclick: () => m.remove() }, t('cancel')), h('button', { class: 'sp-pillbtn', onclick: () => { if (inp.value.trim()) { cb(inp.value.trim()); m.remove(); } } }, t('create')))));
  getUI().append(m); setTimeout(() => inp.focus(), 30); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) { cb(inp.value.trim()); m.remove(); } });
}
async function createPlaylist(name, ids) {
  const r = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Playlists'), data: JSON.stringify({ Name: name, Ids: ids || [], UserId: uid(), MediaType: 'Audio' }), contentType: 'application/json', dataType: 'json' });
  C.libCache = null; await loadLibrary(true); return r;
}
async function addToPlaylist(plId, ids) { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Playlists/' + plId + '/Items', { ids: ids.join(','), userId: uid() }) }); toast(t('added')); C.libCache = null; }
async function trackMenu(e, it, ctx) {
  e.preventDefault(); e.stopPropagation();
  const x = e.clientX || (e.target.getBoundingClientRect().left), y = e.clientY || (e.target.getBoundingClientRect().bottom);
  const pls = (await loadLibrary()).playlists;
  const ent = [{ icon: 'queue', label: t('addQ'), fn: () => addQueue([it]) }, { icon: 'next', label: t('playNext'), fn: () => addQueue([it], true) }, '-',
    { icon: 'plus', label: t('newPl'), fn: () => promptName(t('newPl'), async n => { const r = await createPlaylist(n, [it.Id]); toast(t('added')); }) }].concat(pls.slice(0, 12).map(p => ({ icon: 'list', label: p.Name, fn: () => addToPlaylist(p.Id, [it.Id]) })));
  ent.push('-', { icon: ud(it).IsFavorite ? 'heartOn' : 'heart', label: ud(it).IsFavorite ? t('unlike') : t('like'), fn: () => likeTrack(it) });
  if (it.AlbumId) ent.push({ icon: 'lib', label: t('goAlbum'), fn: () => go('#/c/music/album/' + it.AlbumId) });
  if ((it.ArtistItems || [])[0]) ent.push({ icon: 'user', label: t('goArtist'), fn: () => go('#/c/music/artist/' + it.ArtistItems[0].Id) });
  if (ctx && ctx.playlistId && it.PlaylistItemId) ent.push('-', { icon: 'close', label: t('rmPl'), fn: async () => { await ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl('Playlists/' + ctx.playlistId + '/Items', { entryIds: it.PlaylistItemId }) }); toast('✓'); route(); } });
  openMenu(x, y, ent);
}

/* ---------- library data ---------- */
async function loadLibrary(force) {
  if (C.libCache && !force) return C.libCache;
  const [pl, al, ar] = await Promise.all([
    items({ IncludeItemTypes: 'Playlist', MediaTypes: 'Audio', SortBy: 'SortName' }),
    items({ IncludeItemTypes: 'MusicAlbum', SortBy: 'SortName', Limit: 600, Fields: F_BASE + ',AlbumArtist' }),
    api('Artists/AlbumArtists', { userId: uid(), SortBy: 'SortName', Limit: 400, Fields: 'PrimaryImageAspectRatio', ImageTypeLimit: 1, EnableImageTypes: 'Primary' })]);
  C.libCache = { playlists: pl.Items.filter(p => p.MediaType === 'Audio' || p.MediaType == null), albums: al.Items, artists: ar.Items };
  return C.libCache;
}
const tracksOf = (parentQuery) => items(Object.assign({ IncludeItemTypes: 'Audio', Fields: AUD_F }, parentQuery)).then(r => r.Items);
const fmtDur = tr => { const m = Math.round((tr || 0) / 6e8); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };

/* ---------- track list ---------- */
function refreshRows() { $$('.sp-row .lk').forEach(b => b._upd && b._upd()); }
function trackList(tracks, ctx) {
  ctx = ctx || {}; const noAlb = ctx.noAlbum;
  const wrap = h('div', {});
  wrap.append(h('div', { class: 'sp-th' + (noAlb ? ' noalb' : '') }, h('span', {}, '#'), h('span', {}, t('title')), noAlb ? null : h('span', {}, t('album')), h('span', {}, '⏱')));
  // grid has 5 columns with album, 4 without; adjust header to match
  const th = $('.sp-th', wrap); if (!noAlb) { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, t('album')), h('span', {}, '⏱')); } else { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, '⏱')); }
  let lastDisc = null;
  tracks.forEach((it, idx) => {
    if (ctx.discs && it.ParentIndexNumber && it.ParentIndexNumber !== lastDisc && tracks.some(x => (x.ParentIndexNumber || 1) > 1)) { lastDisc = it.ParentIndexNumber; wrap.append(h('div', { class: 'sp-disc' }, ic('note', 'ic-s'), 'Disc ' + lastDisc)); }
    const lk = it._ext ? h('button', { class: 'lk on rq', title: t('request'), onclick: e => { e.stopPropagation(); requestExtTrack(it); } }, ic('plus')) : trackLikeBtn(it, 'lk');
    const play = () => playList(tracks, idx, { ctx: ctx.id ? { id: ctx.id } : null });
    const rowEl = h('div', { class: 'sp-row' + (it._ext ? ' ext' : '') + (noAlb ? ' noalb' : '') + (cur() && cur().Id === it.Id ? ' playing' : ''), 'data-id': it.Id, ondblclick: play, onclick: () => { if (matchMedia('(pointer:coarse)').matches || innerWidth <= 800) play(); }, oncontextmenu: e => trackMenu(e, it, ctx) },
      h('div', { class: 'ix' }, h('span', { class: 'n' }, ctx.number === 'idx' ? idx + 1 : (it.IndexNumber || idx + 1)), h('div', { class: 'eq' }, h('i'), h('i'), h('i')), h('button', { class: 'pl', onclick: e => { e.stopPropagation(); (cur() && cur().Id === it.Id) ? toggle() : play(); } }, ic('play'))),
      h('div', { class: 'ti' }, ctx.noCover ? null : h('div', Object.assign({ class: 'cv' }, bg(trackImg(it, 100)))), h('div', { class: 'tx' }, h('div', { class: 'tn ell' }, it.Name), h('div', { class: 'ta ell' }, artistLinks(it), it._ext ? h('span', { class: 'xb' }, t('notOwned')) : null))),
      noAlb ? null : h('div', { class: 'al ell' }, it.AlbumId ? h('a', { href: '#/c/music/album/' + it.AlbumId }, it.Album) : (it.Album || '')),
      h('div', { class: 'du' }, lk, h('span', { class: 'tm' }, fmtTime((it.RunTimeTicks || 0) / 1e7)), h('button', { class: 'mo', onclick: e => trackMenu(e, it, ctx) }, ic('more'))));
    if (noAlb) { /* grid has 4 cols: ix, ti, (empty spacer removed), du */ }
    wrap.append(rowEl);
  });
  return wrap;
}
const actionsBar = (tracks, ctx, extra) => {
  const big = h('button', { class: 'sp-big', 'aria-label': t('play'), onclick: () => { const playingHere = ctx && ctx.id && P.ctx && P.ctx.id === ctx.id; if (playingHere) toggle(); else playList(tracks, 0, { shuffle: false, ctx: ctx && ctx.id ? { id: ctx.id } : null }); } }, ic('play'));
  const sh = h('button', { class: 'sp-ico', 'aria-label': t('shuffle'), onclick: () => playList(tracks, Math.floor(Math.random() * tracks.length), { shuffle: true, ctx: ctx && ctx.id ? { id: ctx.id } : null }) }, ic('shuffle'));
  P.subs.push(() => { const here = ctx && ctx.id && P.ctx && P.ctx.id === ctx.id && !P.audio.paused; if (big.isConnected) big.replaceChildren(ic(here ? 'pause' : 'play')); });
  return h('div', { class: 'sp-actions' }, big, sh, extra || null);
};

/* ---------- tiles ---------- */
function tile(o) {
  const cv = h('div', Object.assign({ class: 'cv' }, bg(o.img)), o.img ? null : (o.mix ? h('div', { class: 'mixcv', style: 'background:' + o.mix }, o.name) : h('span', { class: 'cv-ph' }, ic(o.round ? 'user' : 'note'))));
  const el = h('div', { class: 'sp-tile' + (o.round ? ' round' : ''), onclick: () => go(o.href) }, cv, h('div', { class: 'nm ell' }, o.name), h('div', { class: 'sb clamp2' }, o.sub || ''),
    o.play ? h('button', { class: 'pbtn', 'aria-label': t('play'), onclick: async e => { e.stopPropagation(); const tr = await o.play(); if (tr && tr.length) playList(tr, 0, { ctx: { id: o.id } }); } }, ic('play')) : null);
  return el;
}
const albumTile = a => tile({ id: a.Id, name: a.Name, sub: [yearOf(a), a.AlbumArtist].filter(Boolean).join(' · '), img: imgUrl(a, 'Primary', 400), href: '#/c/music/album/' + a.Id, play: () => tracksOf({ ParentId: a.Id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' }) });
const artistTile = a => tile({ id: a.Id, name: a.Name, sub: t('artist'), img: imgUrl(a, 'Primary', 400), round: true, href: '#/c/music/artist/' + a.Id, play: () => tracksOf({ ArtistIds: a.Id, SortBy: 'PlayCount', SortOrder: 'Descending', Limit: 100 }) });
const plTile = p => tile({ id: p.Id, name: p.Name, sub: t('playlist') + (p.ChildCount ? ' · ' + p.ChildCount + ' ' + t('songsN') : ''), img: imgUrl(p, 'Primary', 400), href: '#/c/music/playlist/' + p.Id, play: () => api('Playlists/' + p.Id + '/Items', { userId: uid(), Fields: AUD_F }).then(r => r.Items) });
const MIXCOL = ['linear-gradient(135deg,#8e2de2,#4a00e0)', 'linear-gradient(135deg,#f12711,#f5af19)', 'linear-gradient(135deg,#11998e,#38ef7d)', 'linear-gradient(135deg,#2193b0,#6dd5ed)', 'linear-gradient(135deg,#ee0979,#ff6a00)', 'linear-gradient(135deg,#373b44,#4286f4)', 'linear-gradient(135deg,#c31432,#240b36)', 'linear-gradient(135deg,#1d976c,#93f9b9)'];
const mixTile = (g, i) => tile({ id: 'mix-' + g, name: g + ' ' + t('mix'), sub: g, mix: MIXCOL[i % MIXCOL.length], href: '#/c/music/mix/' + encodeURIComponent(g), play: () => tracksOf({ Genres: g, SortBy: 'Random', Limit: 60 }) });
function shelf(title, nodes, href) { if (!nodes.length) return ''; return h('section', {}, h('h2', {}, title, href ? h('a', { class: 'more', href }, '›') : null), h('div', { class: 'sp-shelf' }, nodes)); }

/* ---------- shell ---------- */
function buildSP() {
  const sp = h('div', { id: 'cx-sp' });
  const libList = h('div', { class: 'sp-liblist' }); let libTab = 'playlists';
  const chips = h('div', { class: 'sp-chips' }, ['playlists', 'albums', 'artists'].map(k => h('button', { class: 'sp-chip' + (k === libTab ? ' on' : ''), 'data-k': k, onclick: () => { libTab = k; $$('.sp-chip', chips).forEach(c => c.classList.toggle('on', c.dataset.k === k)); fillLib(); } }, t(k))));
  async function fillLib() {
    const lib = await loadLibrary(); const hash = location.hash; libList.replaceChildren();
    const li = (o) => h('button', { class: 'sp-li' + (o.round ? ' round' : '') + (hash.includes(o.id) ? ' on' : ''), 'data-id': o.id, onclick: () => go(o.href) }, h('div', Object.assign({ class: 'art' + (o.cls ? ' ' + o.cls : '') }, bg(o.img)), h('span', { class: 'li-play', role: 'button', 'aria-label': t('play'), onclick: e => { e.stopPropagation(); playLibItem(o); } }, ic('play')), o.img || o.cls ? (o.cls ? ic('heartOn') : null) : h('span', { class: 'cv-ph' }, ic(o.round ? 'user' : 'note'))), h('div', {}, h('div', { class: 'nm ell' }, o.name), h('div', { class: 'sb ell' }, o.sub)));
    if (libTab === 'playlists') { libList.append(li({ id: 'liked', name: t('liked'), sub: t('playlist'), href: '#/c/music/liked', cls: 'liked-art' })); lib.playlists.forEach(p => libList.append(li({ id: p.Id, name: p.Name, sub: t('playlist') + (p.ChildCount ? ' · ' + p.ChildCount : ''), img: imgUrl(p, 'Primary', 100), href: '#/c/music/playlist/' + p.Id }))); }
    if (libTab === 'albums') lib.albums.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: [t('album1'), a.AlbumArtist].filter(Boolean).join(' · '), img: imgUrl(a, 'Primary', 100), href: '#/c/music/album/' + a.Id })));
    if (libTab === 'artists') lib.artists.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: t('artist'), img: imgUrl(a, 'Primary', 100), round: true, href: '#/c/music/artist/' + a.Id })));
  }
  C.fillLib = fillLib;
  const side = h('div', { class: 'sp-side' },
    h('div', { class: 'sp-card sp-top' }, h('a', { class: 'sp-navlink', href: '#/c/music', 'data-k': 'home' }, ic('home'), t('home')), h('a', { class: 'sp-navlink', href: '#/c/music/search', 'data-k': 'search' }, ic('search'), t('search')), h('a', { class: 'sp-navlink', href: '#/c/music/discover', 'data-k': 'discover' }, ic('star'), t('discoverShort')), aurralOn() ? h('a', { class: 'sp-navlink', href: '#/c/music/downloads', 'data-k': 'downloads' }, ic('download'), t('mdl')) : null, h('a', { class: 'sp-navlink', href: '#/home' }, ic('film'), t('moviesTv'))),
    h('div', { class: 'sp-card sp-lib' }, h('div', { class: 'sp-libhead' }, h('span', { style: 'display:flex;gap:10px;align-items:center' }, ic('lib'), t('library')), h('button', { 'aria-label': t('createPl'), onclick: () => promptName(t('createPl'), async n => { const r = await createPlaylist(n, []); go('#/c/music/playlist/' + r.Id); }) }, ic('plus'))), chips, libList));
  /* main */
  const scroll = h('div', { class: 'sp-scroll' });
  const bgEl = h('div', { class: 'sp-bg' });
  const header = h('div', { class: 'sp-header' });
  const content = h('div', { class: 'sp-content' });
  scroll.append(bgEl, header, content);
  scroll.addEventListener('scroll', () => header.classList.toggle('solid', scroll.scrollTop > 120), { passive: true });
  const main = h('div', { class: 'sp-main' }, scroll);
  const pl = buildPlayer();
  const tabs = h('div', { class: 'cx-tabs', style: 'display:none' }, [['home', '#/c/music', 'home', t('home')], ['search', '#/c/music/search', 'search', t('search')], ['lib', '#/c/music/library', 'lib', t('library')], ['tv', '#/home', 'film', t('moviesTv')]].map(([k, href, i, label]) => h('a', { href, 'data-k': k }, ic(i), label)));
  const mq = matchMedia('(max-width:800px)'); const upT = () => { tabs.style.display = mq.matches ? 'flex' : 'none'; }; mq.addEventListener('change', upT); upT();
  sp.append(side, main, pl.bar);
  root.append(sp, pl.mini, pl.full, tabs);
  C.sp = { el: sp, scroll, content, header, bgEl, libList, tabs, side };
  P.subs.forEach(f => f());
}
const tint = async (url) => { const c = await dominant(url); C.sp.el.style.setProperty('--tint', rgb(c, 1)); C.sp.bgEl.style.setProperty('--tint', rgb(c.map(v => Math.round(v * .8)))); };
function setHeader(opts) {
  opts = opts || {}; const hd = C.sp.header;
  { const typing = hd.querySelector('.sp-hsearch input'); if (opts.search && typing && document.activeElement === typing) return; }
  const mob = matchMedia('(max-width: 800px)').matches; const rt = parse(); const v0 = rt.parts[2] === 'home' ? '' : (rt.parts[2] || '');
  if (mob) {
    const nm = (ME && ME.Name) || 'U';
    if (v0) hd.replaceChildren(h('button', { class: 'sp-hbtn', 'aria-label': 'Back', onclick: () => history.back() }, ic('left')));
    else hd.replaceChildren((() => { const a = h('a', { class: 'sp-avatar', href: '#/c/settings', 'aria-label': t('settings') }, nm[0].toUpperCase()); if (!ME) me().then(u => { a.textContent = (u.Name || 'U')[0].toUpperCase(); }); return a; })(),
      h('div', { class: 'sp-chips' }, [['', t('all'), '#/c/music'], ['discover', t('discoverShort'), '#/c/music/discover'], ['library', t('library'), '#/c/music/library']].concat(aurralOn() ? [['downloads', t('mdl'), '#/c/music/downloads']] : []).map(([k, l, hr]) => h('a', { class: 'sp-chip' + (v0 === k ? ' on' : ''), href: hr }, l))));
  } else hd.replaceChildren(h('button', { class: 'sp-hbtn', 'aria-label': 'Back', onclick: () => history.back() }, ic('left')), h('button', { class: 'sp-hbtn', 'aria-label': 'Forward', onclick: () => history.forward() }, ic('right')));
  if (opts.search) { const inp = h('input', { type: 'text', placeholder: t('searchMusic'), value: opts.q || '', autocomplete: 'off' }); let tm; inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => go('#/c/music/search' + (inp.value.trim() ? '/' + encodeURIComponent(inp.value.trim()) : '')), 350); }); hd.append(h('div', { class: 'sp-hsearch' }, ic('search'), inp)); setTimeout(() => { if (!opts.q) inp.focus(); }, 50); }
  hd.append(h('div', { style: 'flex:1' }));
  if (opts.title) hd.append(h('b', { class: 'ell', style: 'opacity:0' }, opts.title));
}

C.renderMusic = async function (r) {
  if (!C.sp) buildSP();
  if (!C.libCache) loadLibrary().then(() => C.fillLib && C.fillLib());
  const sp = C.sp; let [, , view, id] = r.parts; if (view === 'home') view = undefined;
  $$('.sp-navlink[data-k]', sp.side).forEach(a => a.classList.toggle('on', (a.dataset.k === 'home' && !view) || (a.dataset.k === 'search' && view === 'search') || (a.dataset.k === 'discover' && view === 'discover') || (a.dataset.k === 'downloads' && view === 'downloads')));
  $$('a[data-k]', sp.tabs).forEach(a => a.classList.toggle('on', (a.dataset.k === 'home' && !view) || (a.dataset.k === 'search' && view === 'search') || (a.dataset.k === 'lib' && (view === 'library'))));
  $$('.sp-li', sp.libList).forEach(l => l.classList.toggle('on', !!id && l.dataset.id === id || (view === 'liked' && l.dataset.id === 'liked')));
  C.scrollPos[C.lastKey] = sp.scroll.scrollTop; C.lastKey = r.raw;
  sp.content.replaceChildren(h('div', { class: 'spinner' })); sp.el.style.setProperty('--tint', '#333'); sp.bgEl.style.setProperty('--tint', '#2a2a2a');
  setHeader({ search: view === 'search', q: view === 'search' ? decodeURIComponent(id || '') : '' });
  const node = h('div', { class: 'sp-content' });
  try {
    if (!view) await mHome(node);
    else if (view === 'search') await mSearch(node, decodeURIComponent(id || ''));
    else if (view === 'playlist') await mPlaylist(node, id);
    else if (view === 'album') await mAlbum(node, id);
    else if (view === 'artist') await mArtist(node, id);
    else if (view === 'liked') await mLiked(node);
    else if (view === 'discover') await mDiscover(node);
    else if (view === 'disc') await mDisc(node, id);
    else if (view === 'ext') await mExtAlbum(node, id, r.q);
    else if (view === 'mix') await mMix(node, decodeURIComponent(id));
    else if (view === 'library') await mLibrary(node);
    else if (view === 'downloads') await mDownloads(node);
  } catch (e) { console.error('[cinema music]', e); node.append(h('div', { class: 'nf-empty' }, t('empty'))); }
  try { if (view === 'search' && id) { await aurralSearchShelves(node, decodeURIComponent(id)); aurralTrackSearch(node, decodeURIComponent(id)); } else if (!view) { await aurralDiscoverShelves(node); musicRecs(node); } } catch (e) { }
  sp.content.replaceWith(node); sp.content = node;
  sp.scroll.scrollTop = C.scrollPos[r.raw] || 0;
  P.subs.forEach(f => f());
};

/* ---------- views ---------- */
async function mHome(n) {
  const hr = new Date().getHours(); n.append(h('div', { class: 'sp-greet' }, hr < 12 ? t('gm') : hr < 18 ? t('ga') : t('ge')));
  const lib = await loadLibrary();
  const quick = h('div', { class: 'sp-quick' });
  const qt = (name, img, href, play, id, cls) => h('div', { class: 'sp-qt', onclick: () => go(href) }, h('div', Object.assign({ class: 'art ' + (cls || '') }, bg(img)), !img && cls ? h('div', { style: 'height:100%;display:grid;place-items:center' }, ic('heartOn')) : null), h('b', { class: 'ell' }, name), h('button', { class: 'pbtn', onclick: async e => { e.stopPropagation(); const tr = await play(); if (tr.length) playList(tr, 0, { ctx: { id } }); } }, ic('play')));
  quick.append(qt(t('liked'), '', '#/c/music/liked', () => tracksOf({ Filters: 'IsFavorite', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 500 }), 'liked', 'liked-art'));
  lib.playlists.slice(0, 3).forEach(p => quick.append(qt(p.Name, imgUrl(p, 'Primary', 120), '#/c/music/playlist/' + p.Id, () => api('Playlists/' + p.Id + '/Items', { userId: uid(), Fields: AUD_F }).then(r => r.Items), p.Id)));
  const rest = 8 - quick.children.length; lib.albums.slice().sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || '')).slice(0, rest).forEach(a => quick.append(qt(a.Name, imgUrl(a, 'Primary', 120), '#/c/music/album/' + a.Id, () => tracksOf({ ParentId: a.Id, SortBy: 'ParentIndexNumber,IndexNumber' }), a.Id)));
  n.append(quick);
  const rp = items({ IncludeItemTypes: 'Audio', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 60, Fields: AUD_F }).catch(() => ({ Items: [] }));
  const genres = api('MusicGenres', { userId: uid(), SortBy: 'Random', Limit: 8 }).catch(() => ({ Items: [] }));
  const recentTracks = (await rp).Items; const seen = new Set(), recAlb = [];
  recentTracks.forEach(x => { if (x.AlbumId && !seen.has(x.AlbumId)) { seen.add(x.AlbumId); const a = lib.albums.find(z => z.Id === x.AlbumId); if (a) recAlb.push(a); } });
  if (recentTracks.length) {
    const sec = h('section', {}, h('h2', {}, t('recent'))); sec.append(trackList(recentTracks.slice(0, 8), { noAlbum: false, number: 'idx', id: 'recent' })); n.append(sec);
  }
  n.append(shelf(t('yourPl'), lib.playlists.map(plTile)));
  n.append(shelf(t('mixes'), (await genres).Items.map((g, i) => mixTile(g.Name, i))));
  n.append(aurralOn() ? h('div', { class: 'sp-disc-cta' }, h('div', {}, h('b', {}, t('discoverMusic')), h('span', {}, t('discoverCta'))), h('a', { class: 'sp-pillbtn', href: '#/c/music/discover' }, t('open'))) : '');
  n.append(shelf(t('newAlb'), lib.albums.slice().sort((a, b) => (b.DateCreated || '').localeCompare(a.DateCreated || '')).slice(0, 14).map(albumTile)));
  n.append(shelf(t('artists'), shuffleArr(lib.artists).slice(0, 14).map(artistTile)));
  if (recAlb.length > 3) n.append(shelf(t('recent') + ' · ' + t('albums'), recAlb.slice(0, 14).map(albumTile)));
}
async function mLibrary(n) {
  const lib = await loadLibrary(); n.append(h('div', { class: 'sp-greet' }, t('library')));
  const g = h('div', { class: 'sp-grid' }, [h('div', { class: 'sp-tile', onclick: () => go('#/c/music/liked') }, h('div', { class: 'cv liked-art' }, ic('heartOn', 'ic-l')), h('div', { class: 'nm' }, t('liked')))].concat(lib.playlists.map(plTile), lib.albums.slice(0, 60).map(albumTile)));
  n.append(g);
}
async function mSearch(n, q) {
  if (!q) {
    const genres = await api('MusicGenres', { userId: uid(), SortBy: 'SortName', Limit: 40 }).catch(() => ({ Items: [] }));
    n.append(h('h2', {}, t('browse')), h('div', { class: 'sp-genres' }, genres.Items.map((g, i) => h('div', { class: 'sp-genre', style: 'background:' + MIXCOL[i % MIXCOL.length], onclick: () => go('#/c/music/mix/' + encodeURIComponent(g.Name)) }, g.Name))));
    return;
  }
  const [tr, al, ar, pl] = await Promise.all([items({ searchTerm: q, IncludeItemTypes: 'Audio', Limit: 20, Fields: AUD_F }), items({ searchTerm: q, IncludeItemTypes: 'MusicAlbum', Limit: 12 }), api('Artists', { userId: uid(), searchTerm: q, Limit: 10, Fields: 'PrimaryImageAspectRatio', ImageTypeLimit: 1, EnableImageTypes: 'Primary' }), items({ searchTerm: q, IncludeItemTypes: 'Playlist', Limit: 8 })]);
  if (!tr.Items.length && !al.Items.length && !ar.Items.length) { n.append(h('div', { class: 'nf-empty' }, t('noRes'))); return; }
  const topArtist = ar.Items[0], topAlbum = al.Items[0];
  const top = topArtist && topArtist.Name.toLowerCase().includes(q.toLowerCase()) ? { name: topArtist.Name, sub: t('artist'), img: imgUrl(topArtist, 'Primary', 300), round: true, href: '#/c/music/artist/' + topArtist.Id, play: () => tracksOf({ ArtistIds: topArtist.Id, SortBy: 'PlayCount', SortOrder: 'Descending', Limit: 100 }) } : tr.Items[0] ? { name: tr.Items[0].Name, sub: t('songs') + ' · ' + artistText(tr.Items[0]), img: trackImg(tr.Items[0], 300), href: tr.Items[0].AlbumId ? '#/c/music/album/' + tr.Items[0].AlbumId : '#/c/music', play: async () => [tr.Items[0]] } : null;
  const res = h('div', { class: 'sp-res' });
  if (top) { const tp = h('div', { class: 'sp-top1' + (top.round ? ' round' : ''), onclick: () => go(top.href) }, h('div', Object.assign({ class: 'cv' }, bg(top.img))), h('b', { class: 'ell' }, top.name), h('span', {}, top.sub), h('button', { class: 'pbtn show', onclick: async e => { e.stopPropagation(); const x = await top.play(); if (x.length) playList(x, 0); } }, ic('play'))); tp.querySelector('.pbtn').style.bottom = '20px'; res.append(h('div', {}, h('h2', { style: 'margin-top:0' }, t('top1')), tp)); }
  if (tr.Items.length) res.append(h('div', {}, h('h2', { style: 'margin-top:0' }, t('songs')), trackList(tr.Items.slice(0, 4), { noAlbum: true, noHeader: true, number: 'idx' })));
  $$('.sp-th', res).forEach(x => x.remove());
  n.append(res, shelf(t('artists'), ar.Items.map(artistTile)), shelf(t('albums'), al.Items.map(albumTile)), shelf(t('playlists'), pl.Items.map(plTile)));
  if (tr.Items.length > 4) { const sec = h('section', {}, h('h2', {}, t('songs'))); sec.append(trackList(tr.Items.slice(4), { number: 'idx' })); n.append(sec); }
}
function pageHead(n, o) {
  const cv = h('div', Object.assign({ class: 'cv' }, bg(o.img)), o.img ? null : (o.cls ? ic('heartOn', 'ic-l') : h('span', { class: 'cv-ph', style: 'display:grid;place-items:center;width:100%;height:100%' }, ic(o.round ? 'user' : 'note'))));
  if (o.cls) cv.classList.add(o.cls);
  n.append(h('div', { class: 'sp-ph' + (o.round ? ' artist' : '') }, cv, h('div', { style: 'min-width:0' }, h('div', { class: 'tp' }, o.type), h('h1', {}, o.title), h('div', { class: 'mt' }, o.meta))));
  if (o.img) tint(o.img);
  else if (o.cls) { C.sp.el.style.setProperty('--tint', '#4a3cc0'); C.sp.bgEl.style.setProperty('--tint', '#4a3cc0'); }
}
async function mPlaylist(n, id) {
  const [pl, tr] = await Promise.all([getItem(id), api('Playlists/' + id + '/Items', { userId: uid(), Fields: AUD_F })]);
  const tracks = tr.Items; const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: pl.Name, img: imgUrl(pl, 'Primary', 500) || (tracks[0] && trackImg(tracks[0], 500)), meta: [tracks.length + ' ' + t('songsN'), total ? ', ' + fmtDur(total) : ''] });
  const ctx = { id, playlistId: id, number: 'idx' };
  n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (!tracks.length) n.append(h('div', { class: 'nf-empty' }, t('empty')));
}
async function mLiked(n) {
  const tracks = await tracksOf({ Filters: 'IsFavorite', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 1000 }); const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: t('liked'), cls: 'liked-art', meta: [tracks.length + ' ' + t('songsN'), total ? ', ' + fmtDur(total) : ''] });
  const ctx = { id: 'liked', number: 'idx' }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (!tracks.length) n.append(h('div', { class: 'nf-empty' }, t('empty')));
}
async function mMix(n, g) {
  const tracks = await tracksOf({ Genres: g, SortBy: 'Random', Limit: 60 }); const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0);
  pageHead(n, { type: t('playlist'), title: g + ' ' + t('mix'), img: tracks[0] && trackImg(tracks[0], 500), meta: [tracks.length + ' ' + t('songsN'), ', ' + fmtDur(total)] });
  const ctx = { id: 'mix-' + g, number: 'idx' }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
}
async function mAlbum(n, id) {
  const [al, tracks] = await Promise.all([getItem(id), tracksOf({ ParentId: id, SortBy: 'ParentIndexNumber,IndexNumber,SortName', Limit: 500 })]);
  const total = tracks.reduce((s, x) => s + (x.RunTimeTicks || 0), 0); const ar = (al.ArtistItems || [])[0];
  pageHead(n, { type: t('album1'), title: al.Name, img: imgUrl(al, 'Primary', 500), meta: [ar ? h('a', { href: '#/c/music/artist/' + ar.Id }, ar.Name) : (al.AlbumArtist || ''), ' · ' + (yearOf(al) || ''), ' · ' + tracks.length + ' ' + t('songsN') + ', ' + fmtDur(total)] });
  const ctx = { id, noAlbum: true, noCover: true, discs: true }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx));
  if (ar) { const more = await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: ar.Id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 12 }); const o = more.Items.filter(x => x.Id !== id); if (o.length) n.append(shelf('More by ' + ar.Name, o.map(albumTile))); }
}
async function mArtist(n, id) {
  const [ar, top, albums] = await Promise.all([getItem(id), tracksOf({ ArtistIds: id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 10 }), items({ IncludeItemTypes: 'MusicAlbum', AlbumArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })]);
  let alb = albums.Items; if (!alb.length) alb = (await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })).Items;
  const all = await tracksOf({ ArtistIds: id, SortBy: 'SortName', Limit: 500 });
  pageHead(n, { type: t('artist'), title: ar.Name, round: true, img: imgUrl(ar, 'Primary', 500), meta: [all.length + ' ' + t('songsN')] });
  const ctx = { id, number: 'idx' }; n.append(actionsBar(all, ctx));
  window.__artistNode = n; window.__artistItem = ar;
  const popBox = h('div', {}, trackList(top.slice(0, 5), { id: id + '-top', number: 'idx' })); n.append(h('h2', { style: 'margin-top:8px' }, t('popularTracks')), popBox);
  $$('.sp-th', n).forEach(x => x.remove());
  aurralPopular(n, ar, popBox);
  n.append(shelf(t('discography'), alb.map(albumTile)));
  await aurralArtistExtras(n, ar);
  if (ar.Overview) n.append(h('h2', {}, t('artist')), h('p', { style: 'color:#b3b3b3;line-height:1.6;max-width:780px' }, ar.Overview.replace(/<[^>]+>/g, '')));
}

/* floating pill in Netflix shell while music plays */
C.updateNPill = function () {
  let pill = $('#cx-npill'); const it = cur();
  if (!it || C.mode === 'sp') { if (pill) pill.remove(); return; }
  if (!pill) { pill = h('div', { id: 'cx-npill', class: 'nf-npill', onclick: () => go('#/c/music') }, h('div', { class: 'cv' }), h('div', { class: 'tx' }, h('b', { class: 'ell' }), h('span', { class: 'ell' })), h('button', { class: 'pp', onclick: e => { e.stopPropagation(); toggle(); } })); root.append(pill); }
  $('.cv', pill).style.backgroundImage = 'url("' + trackImg(it, 100) + '")'; $('b', pill).textContent = it.Name; $('span', pill).textContent = artistText(it); $('.pp', pill).replaceChildren(ic(P.audio.paused ? 'play' : 'pause'));
};

/* ---------- lyrics (plain + time-synced, straight from Jellyfin's lyric providers / .lrc files) ---------- */
Object.assign(TX.en, { lyrics: 'Lyrics', noLyrics: 'No lyrics found for this song.', lyrSynced: 'Synced', lyrPlain: 'Not synced' });
Object.assign(TX.de, { lyrics: 'Songtext', noLyrics: 'Für diesen Titel wurde kein Songtext gefunden.', lyrSynced: 'Synchronisiert', lyrPlain: 'Nicht synchronisiert' });
let lyrEl = null, lyrLines = null, lyrId = null, lyrAt = -1, lyrSynced = false;
function toggleLyrics() {
  if (lyrEl) { lyrEl.remove(); lyrEl = null; panelClosed(); return; }
  if (queueEl) { queueEl.remove(); queueEl = null; }
  lyrEl = h('div', { class: 'sp-queue sp-lyrics' }); panelHost().append(lyrEl); const it = cur(); if (it) loadLyrics(it); else drawLyrics(); panelOpened();
}
async function loadLyrics(it) {
  lyrId = it.Id; lyrLines = null; lyrAt = -1; drawLyrics(true);
  try { const r = await api('Audio/' + it.Id + '/Lyrics'); if (lyrId !== it.Id) return; lyrLines = (r.Lyrics || []).map(l => ({ t: l.Start != null ? l.Start / 1e7 : null, s: l.Text })); lyrSynced = lyrLines.length > 0 && lyrLines.filter(l => l.t != null).length > lyrLines.length / 2; }
  catch (e) { if (lyrId !== it.Id) return; lyrLines = []; lyrSynced = false; }
  drawLyrics();
}
function drawLyrics(loading) {
  if (!lyrEl) return; const it = cur();
  const head = h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, h('h3', {}, t('lyrics')), h('button', { class: 'pl-btn', onclick: toggleLyrics }, ic('close')));
  const sub_ = it ? h('div', { class: 'lyr-song' }, h('b', { class: 'ell' }, it.Name), h('span', { class: 'ell' }, artistText(it) + (lyrLines && lyrLines.length ? ' · ' + (lyrSynced ? t('lyrSynced') : t('lyrPlain')) : ''))) : null;
  let body;
  if (loading || lyrLines == null) body = h('div', { class: 'spinner', style: 'margin:60px auto' });
  else if (!lyrLines.length) body = h('div', { class: 'nf-empty', style: 'padding:40px 10px' }, t('noLyrics'));
  else body = h('div', { class: 'lyr-body' + (lyrSynced ? ' sync' : '') }, lyrLines.map((l, i) => h('p', { class: 'lyr-l' + (l.s ? '' : ' gap'), 'data-i': i, onclick: lyrSynced && l.t != null ? () => { P.audio.currentTime = l.t; } : null }, l.s || '♪')));
  const foot = h('div', { class: 'lyr-foot' }, lyrSeek = seekBar(null, (f, commit) => { if (commit && P.audio.duration) P.audio.currentTime = f * P.audio.duration; }), h('div', { class: 'lyr-ctr' }, h('button', { class: 'pl-btn', onclick: prev }, ic('prev')), lyrPP = h('button', { class: 'pl-btn big', onclick: toggle }, ic(P.audio.paused ? 'play' : 'pause')), h('button', { class: 'pl-btn', onclick: () => next() }, ic('next'))));
  lyrEl.replaceChildren(head, sub_ || '', body, foot); if (P.audio.duration) lyrSeek.set(P.audio.currentTime / P.audio.duration);
}
let lyrSeek = null, lyrPP = null;
const lyrUpPP = () => { if (lyrPP && lyrPP.isConnected) lyrPP.replaceChildren(ic(P.audio.paused ? 'play' : 'pause')); };
P.audio.addEventListener('play', lyrUpPP); P.audio.addEventListener('pause', lyrUpPP);
P.audio.addEventListener('timeupdate', () => { if (lyrSeek && lyrSeek.isConnected && !lyrSeek.dragging() && P.audio.duration) lyrSeek.set(P.audio.currentTime / P.audio.duration); });
P.audio.addEventListener('timeupdate', () => {
  if (!lyrEl || !lyrSynced || !lyrLines || !lyrLines.length) return; const now = P.audio.currentTime + .25; let idx = -1;
  for (let i = 0; i < lyrLines.length; i++) { if (lyrLines[i].t != null && lyrLines[i].t <= now) idx = i; else if (lyrLines[i].t != null) break; }
  if (idx === lyrAt) return; lyrAt = idx; const ps = lyrEl.querySelectorAll('.lyr-l'); ps.forEach((p, i) => { p.classList.toggle('on', i === idx); p.classList.toggle('past', i < idx); });
  const el = ps[idx]; if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
});
P.subs.push(() => { if (lyrEl && cur() && cur().Id !== lyrId) loadLyrics(cur()); });

/* ---------- quick play from the library list ---------- */
async function playLibItem(o) {
  try {
    let tr = [];
    if (o.id === 'liked') tr = await tracksOf({ Filters: 'IsFavorite', SortBy: 'SortName', Limit: 500 });
    else if (/playlist/.test(o.href)) tr = await tracksOf({ ParentId: o.id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' });
    else if (/album/.test(o.href)) tr = await tracksOf({ ParentId: o.id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' });
    else if (/artist/.test(o.href)) tr = await tracksOf({ ArtistIds: o.id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 100 });
    if (tr.length) playList(tr, 0, { ctx: { id: o.id } }); else toast(t('empty'));
  } catch (e) { toast('⚠'); }
}

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
      if (e.nodeType !== 1 || e.dataset.tvs || e.closest('#cx-lite, .cx-nframe, svg, .nf-dots')) continue; e.dataset.tvs = '1';
      if (e.matches && e.matches('.sp-row')) { e.setAttribute('tabindex', '0'); e.dataset.tvf = '1'; continue; }
      if (isFocusable(e) || e.tagName === 'svg') continue;
      if (e.parentElement && e.parentElement.closest('[data-tvf], a[href], button')) continue;
      const cs = getComputedStyle(e); if (cs.cursor === 'pointer') { e.setAttribute('tabindex', '0'); e.dataset.tvf = '1'; }
    }
  }
  /* dialogs and menus take the focus the moment they open (no waiting for the idle timer) */
  const quickLayer = () => { const L = layer(); if (!L) return; const ae = document.activeElement; if (ae && L.contains(ae)) return; if (ae && ae !== document.body && !TVSTATE.opener) TVSTATE.opener = ae; rcDirty = true; const f = tvPreferred(cands()); if (f) { f.focus({ preventScroll: true }); mark(f); } };
  document.addEventListener('click', () => { requestAnimationFrame(() => requestAnimationFrame(quickLayer)); }, true);
  const mo = new MutationObserver(ms => { rcDirty = true; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) scanQ.add(n); })); clearTimeout(scanT); scanT = setTimeout(() => { const q = [...scanQ]; scanQ = new Set(); q.forEach(n => { if (n.isConnected) scan(n); }); tvAuto(); }, 120); });
  const startMO = () => { [document.getElementById('cx'), document.getElementById('cx-ui')].forEach(t => t && mo.observe(t, { childList: true, subtree: true })); if (!document.getElementById('cx') || !document.getElementById('cx-ui')) setTimeout(startMO, 500); else { scan(document.getElementById('cx')); scan(document.getElementById('cx-ui')); } };
  startMO();

  const vis2 = e => { const r = e.getBoundingClientRect(); return r.width >= 4 && r.height >= 4 && r.bottom > -2400 && r.top < innerHeight + 2600; };
  const visible = e => { if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false; return vis2(e); };
  /* the topmost modal layer limits where focus may go */
  const LAYER_SEL = '.cxd-bg.show, .sp-modal-bg, .nf-pop:not(.hide), .sp-ctx, #cx-menu, .sp-menu, .sr-modal';
  const layer = () => { const all = document.querySelectorAll(LAYER_SEL); for (let k = all.length - 1; k >= 0; k--) if (visible(all[k])) return all[k]; return null; };
  /* rectangles are measured once and kept (page coordinates), so a key press never forces a layout */
  let RC = null, rcDirty = true; const SCR = '.nf-scroller, .sp-shelf, .nf-cast, .nf-row-scroll';
  const EXCL = e => !!e.closest('#cx-lite, .cx-nframe, h2, .nf-dots') || e.matches('.nf-logo, .nf-logo *') || (e.matches('a') && !!e.closest('.sp-row')) || e.matches('.sp-row button.pl, .sp-hbtn') || (e.tagName === 'INPUT' && e.type === 'file');
  function buildRects() {
    const H = scrollHost(); const st = H ? H.scrollTop : 0; const m = new Map(); m._an = new Map();
    const ov = document.documentElement.classList.contains('cx-on'); // our interface is showing: the stock page behind it must not take part
    document.querySelectorAll(SEL).forEach(e => {
      if (ov && !e.closest('#cx, #cx-ui')) return;
      if (e.matches('.nf-search input') && !e.closest('.nf-search.open')) return; // a closed search box would pop up the keyboard
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
    if (dir === 'up' || dir === 'down') {
      /* the nearest row always wins (even a short one that is not above the focused card); inside that row the closest card is taken */
      const cs = []; let minMain = 1e12;
      for (const e of list) {
        if (e === cur || cur.contains(e)) continue; const b = R(e), bc = ctr(b);
        if (dir === 'down' ? bc.y <= ac.y + 2 : bc.y >= ac.y - 2) continue;
        const main = dir === 'down' ? Math.max(0, b.top - a.bottom) : Math.max(0, a.top - b.bottom); cs.push([e, b, bc, main]); if (main < minMain) minMain = main;
      }
      for (const [e, b, bc, main] of cs) {
        if (main > minMain + 48) continue; const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const s = (overlap > 0 ? 0 : 1e6) + Math.abs(bc.x - ac.x) + main * 2; if (s < bs) { bs = s; best = e; }
      }
      return best;
    }
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
  /* rows far above / below the screen drop their pictures (memory); they come back when you get near */
  let farT = 0;
  const farRows = () => { clearTimeout(farT); farT = setTimeout(() => { const H = innerHeight; const rows = document.querySelectorAll('#cx .nf-row, #cx .nf-sect'); const rects = []; rows.forEach(r => rects.push(r.getBoundingClientRect())); rows.forEach((r, i) => { const rc = rects[i]; r.classList.toggle('cx-far', rc.bottom < -H * 1.6 || rc.top > H * 2.6); }); }, 700); };
  document.addEventListener('scroll', e => { if (e.target && e.target.nodeType === 1 && e.target === scrollHost()) farRows(); }, true);
  function scrollHost_() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
  function scrollHost() { return scrollHost_(); }
  let keyAt = 0;
  const DIRS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  document.addEventListener('keydown', e => {
    const dir = DIRS[e.key];
    if (e.key === 'Enter' && document.activeElement && document.activeElement.dataset.tvf) { e.preventDefault(); const ae0 = document.activeElement; const pl = ae0.matches('.sp-row') && ae0.querySelector('button.pl'); (pl || ae0).click(); return; }
    if (!dir) return;
    { const now = performance.now(); if (e.repeat) { if (now - e.timeStamp > 90 || now - (keyAt || 0) < 130) { e.preventDefault(); e.stopPropagation(); return; } } keyAt = now; }
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

  const preferredSel = ['.cxd-bg.show .cxd-chip, .cxd-bg.show button', '.sp-modal-bg .btn.white', '.sp-modal-bg .btn', '.sp-menu button, #cx-menu .mi, #cx-menu button, #cx-menu a, #cx-menu [role=menuitem]', '.sp-ctx button, .sp-ctx a', '.nf-hero .btn.white', '#cx .nf-dinfo .btn.white', '#cx .sp-card .sp-navlink.on', '#cx .nf-card', '#cx .sp-row', '#cx-top a'];
  function tvPreferred(list) { for (const s of preferredSel) { const f = list.find(e => e.matches(s)); if (f) return f; } return list[0]; }
  let autoT = 0; const MEM = {};
  const rootAll = () => [...document.getElementById('cx').querySelectorAll(SEL)];
  const remember = () => { };
  function tvAuto() {
    clearTimeout(autoT); autoT = setTimeout(() => { if (rcDirty && !layer()) buildRects();
      const ae = document.activeElement; const ok = ae && ae !== document.body && ae.isConnected && visible(ae);
      { const L0 = layer(); if (L0 && !L0.contains(ae)) { if (ae && ae !== document.body && !TVSTATE.opener) TVSTATE.opener = ae; const f0 = tvPreferred(cands()); if (f0) { f0.focus({ preventScroll: true }); mark(f0); } return; } } // a dialog / menu just opened: the focus has to move into it
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
    const L = layer(); if (L) { const x = L.querySelector('.cxd-x, .sr-close, button[aria-label=Close]'); if (x) x.click(); else if (L.matches('.cxd-bg')) L.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); else L.remove(); setTimeout(() => { if (layer()) return; const o = TVSTATE.opener; TVSTATE.opener = null; if (o && o.isConnected) { o.focus({ preventScroll: true }); mark(o); } }, 80); return true; }
    if (document.querySelector('.sp-full.open')) { document.querySelector('.sp-full .top .pl-btn').click(); return true; }
    const h = location.hash; if (/^#\/(home)?$|^#\/c(\/home)?$|^#\/c\/music\/?$|^#\/c\/music\/home$/.test(h) || h === '') return false;
    history.back(); return true;
  };
  /* the native player needs the TV's memory and video decoder: free what the page holds while it plays */
  window.cxTvSleep = () => { document.documentElement.classList.add('cx-sleep'); try { document.querySelectorAll('video, audio').forEach(m => { try { m.pause(); m.removeAttribute('src'); m.load(); } catch (e) { } }); document.querySelectorAll('iframe').forEach(f => { try { f.src = 'about:blank'; } catch (e) { } }); } catch (e) { } try { C.nf.el.scrollTop = 0; } catch (e) { } };
  window.cxTvResume = () => { document.documentElement.classList.remove('cx-sleep'); try { refreshView(); } catch (e) { } };
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
  if (ok && !ready) { ready = true; Promise.all([loadStatus(), loadCfg()]).then(route).then(() => { setTimeout(syncWatchlist, 3000); setInterval(syncWatchlist, 600000); setTimeout(() => { lbSync(); archLoad(); }, 4500); setInterval(() => lbSync(), 1800000); }); }
  if (!ok && ready) { ready = false; route(); }
}, 400);
document.addEventListener('viewshow', () => { if (ready) route(); });
window.cinemaUI = { dev: { get C() { return C; }, lb: () => ({ LB, lbLoad, lbSync, lbSeen, ARCH, archLoad, CFG: () => CFGU, save: saveCfg, archiveDialog }), seerrModal: x => seerrModal(x), setSeerrBase(b) { SEERR = b; }, calendarView: p => calendarView(p), harvest: () => harvestMenus(), HARV: () => HARV }, native(id) { C.allowNative = true; location.hash = '#/details?id=' + id; }, get player() { return P; }, skin(on) { setSkin(on !== false); }, off() { localStorage.setItem('cinema-off', '1'); location.reload(); }, on() { localStorage.removeItem('cinema-off'); location.reload(); } };

})();
