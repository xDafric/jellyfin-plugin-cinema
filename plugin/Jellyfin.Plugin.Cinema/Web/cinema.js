/* Cinema UI - Netflix + Spotify style frontend for Jellyfin 12. Kill switch: add #nocinema to the URL or run cinemaUI.off() */
(function () {
'use strict';
if (window.__cinemaUI) return; window.__cinemaUI = 1;
try { if (/nocinema/.test(location.hash + location.search) || localStorage.getItem('cinema-off') === '1') { document.documentElement.classList.add('cx-off'); return; } } catch (e) {}
const CSS_TEXT = "/* Cinema UI - styles. Everything is scoped under :is(#cx, #cx-ui) so native Jellyfin pages are untouched. */\nhtml.cx-on, html.cx-on body { overflow: hidden !important; background: #000 !important; }\n#cx, #cx-ui, :is(#cx, #cx-ui) * { box-sizing: border-box; }\n#cx { position: fixed; inset: 0; z-index: 9000; display: none; }\n:is(#cx, #cx-ui) {\n  color: #fff;\n  font-family: \"Inter\", \"SF Pro Text\", \"Segoe UI\", system-ui, -apple-system, \"Helvetica Neue\", Arial, sans-serif; letter-spacing: -.005em;\n  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;\n  --red: #e50914; --bg: #141414; --green: #1ed760; --dim: #b3b3b3;\n}\n:where(:is(#cx, #cx-ui) button, #cx-ui button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }\n:where(:is(#cx, #cx-ui) input, #cx-ui input) { font: inherit; color: inherit; }\n:where(:is(#cx, #cx-ui) a, #cx-ui a) { color: inherit; text-decoration: none; }\n:is(#cx, #cx-ui) svg { width: 24px; height: 24px; fill: currentColor; flex: none; display: block; }\n:is(#cx, #cx-ui) .ic-s svg { width: 16px; height: 16px; }\n:is(#cx, #cx-ui) .ic-l svg { width: 32px; height: 32px; }\n:is(#cx, #cx-ui) .hide { display: none !important; }\n:is(#cx, #cx-ui) .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n:is(#cx, #cx-ui) .clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\n:is(#cx, #cx-ui) .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n:is(#cx, #cx-ui) .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,.15); border-top-color: #fff; border-radius: 50%; animation: cxspin .8s linear infinite; margin: 20vh auto; }\n@keyframes cxspin { to { transform: rotate(360deg); } }\n@keyframes cxfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\n\n/* =====================================================================\n   NETFLIX-STYLE SHELL (modern, rounded)\n   ===================================================================== */\n:is(#cx, #cx-ui) { --bg: #111113; --surface: #1b1b1f; --surface-2: #26262b; --line: rgba(255,255,255,.08); --r: 14px; --pad: clamp(16px, 2.6vw, 48px); }\n#cx-nf { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; background: var(--bg); scroll-behavior: smooth; }\n.nf-nav {\n  position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 72px; padding: 0 var(--pad);\n  display: flex; align-items: center; gap: 28px; background: rgba(17,17,19,.72); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4);\n  border-bottom: 1px solid transparent; transition: background .3s, border-color .3s;\n}\n.nf-nav.solid { background: rgba(17,17,19,.92); border-bottom-color: var(--line); }\n.nf-logo { color: #e50914; font-weight: 900; font-size: 24px; letter-spacing: .04em; }\n.nf-links { display: flex; gap: 4px; }\n.nf-links a { font-size: 14px; font-weight: 500; color: #d6d6d9; padding: 9px 16px; border-radius: 999px; transition: background .2s, color .2s; }\n.nf-links a:hover { background: rgba(255,255,255,.08); color: #fff; }\n.nf-links a.on { background: #fff; color: #000; font-weight: 600; }\n.nf-spacer { flex: 1; }\n.nf-search { display: flex; align-items: center; height: 40px; border-radius: 999px; border: 1px solid transparent; transition: .25s; }\n.nf-search.open { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); padding-right: 14px; }\n.nf-search input { width: 0; background: transparent; border: 0; outline: 0; font-size: 14px; transition: width .25s; }\n.nf-search.open input { width: min(240px, 40vw); padding: 0 4px; }\n.nf-search button { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }\n.nf-search button:hover { background: rgba(255,255,255,.08); }\n.nf-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e50914, #7a0a12); display: grid; place-items: center; font-weight: 700; font-size: 14px; }\n.nf-menu-wrap { position: relative; }\n.nf-pop { position: absolute; right: 0; top: 52px; min-width: 210px; background: rgba(28,28,32,.96); backdrop-filter: blur(20px); border: 1px solid var(--line); border-radius: 16px; padding: 8px; font-size: 14px; box-shadow: 0 20px 50px rgba(0,0,0,.6); }\n.nf-pop > :not([data-cx]) { display: none !important; }\n.nf-pop a, .nf-pop button { display: block; width: 100%; text-align: left; padding: 11px 14px; border-radius: 10px; }\n.nf-pop a:hover, .nf-pop button:hover { background: rgba(255,255,255,.08); }\n\n/* hero: inset rounded card */\n.nf-hero { position: relative; margin: 88px var(--pad) 0; height: clamp(420px, 62vh, 720px); border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 60px rgba(0,0,0,.45); }\n.nf-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; background-size: cover; background-position: center 22%; }\n.nf-slide.on { opacity: 1; }\n.nf-hero::after { content: \"\"; position: absolute; inset: 0; pointer-events: none;\n  background: linear-gradient(90deg, rgba(8,8,10,.82) 0%, rgba(8,8,10,.45) 34%, rgba(8,8,10,0) 62%), linear-gradient(to top, rgba(8,8,10,.8) 0%, rgba(8,8,10,0) 42%); }\n.nf-hero-body { position: absolute; z-index: 3; left: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); width: min(560px, 52%); }\n.nf-hero-logo { max-width: min(420px, 100%); max-height: 150px; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 6px 18px rgba(0,0,0,.55)); display: block; margin-bottom: 18px; }\n.nf-hero-title { font-size: clamp(30px, 4vw, 60px); font-weight: 800; line-height: 1.02; letter-spacing: -.02em; margin: 0 0 16px; }\n.nf-meta { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; font-size: 14px; font-weight: 500; color: #e2e2e6; margin-bottom: 12px; }\n.nf-meta > span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\n.nf-meta .match { color: #5ee08a; font-weight: 700; }\n.nf-meta .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 7px; border-radius: 6px; font-size: 12px; line-height: 20px; }\n.nf-overview { font-size: clamp(14px, 1.1vw, 17px); line-height: 1.5; color: #e8e8ec; margin: 0 0 22px; max-width: 50ch; }\n.nf-hero-btns, .nf-btns { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }\n.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 24px 0 18px; border-radius: 999px; font-weight: 600; font-size: 15px; transition: background .2s, transform .15s; white-space: nowrap; }\n.btn:active { transform: scale(.97); }\n.btn.white { background: #fff; color: #000; }\n.btn.white:hover { background: #e8e8ea; }\n.btn.grey { background: rgba(255,255,255,.16); backdrop-filter: blur(10px); color: #fff; }\n.btn.grey:hover { background: rgba(255,255,255,.26); }\n.btn.round { width: 46px; padding: 0; background: rgba(255,255,255,.14); backdrop-filter: blur(10px); }\n.btn.round:hover { background: rgba(255,255,255,.26); }\n.btn.round.on { background: #fff; color: #000; }\n.nf-dots { position: absolute; z-index: 3; right: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); display: flex; gap: 6px; }\n.nf-dots i { width: 8px; height: 8px; background: rgba(255,255,255,.35); border-radius: 999px; cursor: pointer; transition: width .3s, background .3s; }\n.nf-dots i.on { background: #fff; width: 26px; }\n\n/* rows */\n.nf-rows { position: relative; z-index: 4; margin-top: 34px; padding-bottom: 120px; }\n.nf-row { margin-bottom: 30px; position: relative; animation: cxfade .5s both; }\n.nf-row h2 { margin: 0 var(--pad) 12px; font-size: clamp(18px, 1.5vw, 22px); font-weight: 700; letter-spacing: -.01em; color: #f2f2f4; }\n.nf-row h2 a { transition: color .2s; } .nf-row h2 a:hover { color: #fff; opacity: .8; }\n.nf-scroller { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding: 12px var(--pad) 18px; margin: -12px 0 -18px; scroll-padding: 0 var(--pad); scroll-behavior: smooth; }\n.nf-scroller::-webkit-scrollbar { display: none; }\n.nf-arrow { position: absolute; top: 50%; margin-top: -34px; width: 44px; height: 44px; border-radius: 50%; z-index: 6; background: rgba(30,30,34,.85); backdrop-filter: blur(8px); border: 1px solid var(--line); opacity: 0; transition: opacity .2s, transform .2s; display: grid; place-items: center; }\n.nf-row:hover .nf-arrow { opacity: 1; }\n.nf-arrow:hover { transform: scale(1.08); background: #fff; color: #000; }\n.nf-arrow.l { left: 10px; } .nf-arrow.r { right: 10px; }\n\n.nf-card { position: relative; flex: none; width: clamp(200px, 17.5vw, 340px); cursor: pointer; }\n.nf-card.poster { width: clamp(138px, 11.4vw, 220px); }\n.nf-card .im { position: relative; aspect-ratio: 16/9; background: var(--surface) center/cover no-repeat; border-radius: var(--r); overflow: hidden; transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset; }\n.nf-card.poster .im { aspect-ratio: 2/3; }\n.nf-card .im::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,0) 55%); opacity: 0; transition: opacity .3s; }\n.nf-card .im .ph { position: absolute; inset: 0; display: grid; place-items: center; padding: 10px; text-align: center; font-weight: 700; color: #8a8a90; font-size: 14px; }\n.nf-card .prog { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.28); z-index: 2; overflow: hidden; }\n.nf-card .prog i { display: block; height: 100%; background: #fff; border-radius: 4px; }\n.nf-card .title { margin: 9px 4px 0; font-size: 13px; font-weight: 500; color: #bdbdc2; }\n.nf-card .info { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 3; display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(6px); transition: opacity .3s, transform .3s; pointer-events: none; }\n.nf-card.poster .info { left: 8px; right: 8px; bottom: 8px; }\n.nf-card .info .t { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,.6); }\n.nf-card .info .m, .nf-card .info .acts button:not(.pl) { display: none; }\n.nf-card .acts { display: contents; }\n.nf-card .acts button.pl { width: 38px; height: 38px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; transition: transform .2s; flex: none; order: 2; }\n.nf-card .acts button.pl:hover { transform: scale(1.1); }\n.nf-card .acts button.pl svg { width: 20px; height: 20px; }\n@media (hover: hover) and (pointer: fine) {\n  .nf-card:hover .im { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 36px rgba(0,0,0,.55); }\n  .nf-card:hover .im::after { opacity: 1; }\n  .nf-card:hover .info { opacity: 1; transform: none; pointer-events: auto; }\n  .nf-card:hover .title { color: #fff; }\n}\n.nf-card.nohov .info { display: none; }\n\n/* grid pages */\n.nf-page-pad { padding: 104px var(--pad) 120px; }\n.nf-page-pad h1 { font-size: clamp(26px, 3vw, 38px); margin: 0 0 24px; font-weight: 800; letter-spacing: -.02em; }\n.nf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(clamp(130px, 12.5vw, 210px), 1fr)); gap: 24px 14px; }\n.nf-grid .nf-card, .nf-grid .nf-card.poster { width: auto; }\n.nf-empty { color: var(--dim); padding: 60px 0; text-align: center; font-size: 18px; }\n\n/* detail */\n.nf-detail { position: relative; min-height: 100vh; }\n.nf-dback { position: fixed; inset: 0; background-size: cover; background-position: center top; z-index: 0; }\n.nf-dback::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(17,17,19,.97) 0%, rgba(17,17,19,.75) 40%, rgba(17,17,19,.25) 100%), linear-gradient(to top, #111113 6%, rgba(17,17,19,0) 55%); }\n.nf-dbody { position: relative; z-index: 1; padding: 15vh var(--pad) 100px; max-width: 1560px; }\n.nf-dhead { display: flex; gap: 44px; align-items: flex-start; }\n.nf-dposter { width: clamp(160px, 18vw, 300px); aspect-ratio: 2/3; border-radius: 18px; background: var(--surface) center/cover; box-shadow: 0 24px 60px rgba(0,0,0,.6); flex: none; }\n.nf-dinfo { max-width: 760px; padding-top: 4px; }\n.nf-dinfo h1 { font-size: clamp(30px, 4vw, 58px); line-height: 1.03; font-weight: 800; letter-spacing: -.02em; margin: 0 0 14px; }\n.nf-dlogo { max-width: min(420px, 100%); max-height: 140px; object-fit: contain; object-position: left; margin-bottom: 16px; display: block; }\n.nf-tagline { font-style: italic; color: #cfcfd4; margin: 0 0 10px; }\n.nf-dinfo .ov { font-size: 16px; line-height: 1.6; color: #e4e4e8; margin: 0 0 24px; }\n.nf-facts { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; font-size: 14px; margin-top: 22px; }\n.nf-facts dt { color: #7c7c84; } .nf-facts dd { margin: 0; color: #d6d6da; }\n.nf-resume-bar { width: 160px; height: 4px; background: rgba(255,255,255,.25); border-radius: 4px; margin-top: 12px; overflow: hidden; }\n.nf-resume-bar i { display: block; height: 100%; background: #fff; border-radius: 4px; }\n.nf-sect { margin-top: 52px; }\n.nf-sect h2 { font-size: 22px; margin: 0 0 16px; letter-spacing: -.01em; }\n.nf-seasons { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }\n.nf-chip { padding: 9px 18px; border-radius: 999px; background: rgba(255,255,255,.09); font-size: 14px; font-weight: 500; transition: .2s; }\n.nf-chip:hover { background: rgba(255,255,255,.18); }\n.nf-chip.on { background: #fff; color: #000; font-weight: 600; }\n.nf-eps { display: flex; flex-direction: column; gap: 8px; }\n.nf-ep { display: grid; grid-template-columns: 36px 200px 1fr auto; gap: 20px; align-items: center; padding: 12px 18px 12px 12px; background: rgba(255,255,255,.04); border-radius: 16px; cursor: pointer; transition: background .2s; }\n.nf-ep:hover { background: rgba(255,255,255,.1); }\n.nf-ep .n { font-size: 20px; color: #bdbdc2; text-align: center; }\n.nf-ep .th { position: relative; aspect-ratio: 16/9; background: var(--surface-2) center/cover; border-radius: 10px; overflow: hidden; }\n.nf-ep .th .prog { position: absolute; left: 8px; right: 8px; bottom: 6px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); overflow: hidden; }\n.nf-ep .th .prog i { display: block; height: 100%; background: #fff; }\n.nf-ep .tt { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; margin-bottom: 6px; }\n.nf-ep .ds { font-size: 14px; color: #b4b4ba; line-height: 1.45; }\n.nf-ep .seen { color: #5ee08a; }\n.nf-cast { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }\n.nf-person { flex: none; width: 96px; text-align: center; font-size: 12.5px; }\n.nf-person .pi { width: 96px; height: 96px; border-radius: 50%; background: var(--surface-2) center/cover; margin-bottom: 8px; }\n.nf-person small { display: block; color: #85858c; margin-top: 2px; }\n\n.nf-npill { position: fixed; z-index: 60; right: 20px; bottom: 20px; display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; background: rgba(30,30,34,.92); backdrop-filter: blur(16px); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 12px 36px rgba(0,0,0,.55); max-width: 320px; cursor: pointer; }\n.nf-npill .cv { width: 44px; height: 44px; border-radius: 10px; background: #333 center/cover; }\n.nf-npill .tx { min-width: 0; font-size: 13px; } .nf-npill .tx b { display: block; } .nf-npill .tx span { color: var(--dim); }\n.nf-npill .pp { width: 36px; height: 36px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; }\n\n.cx-tabs { display: none; }\n\n/* NETFLIX MOBILE */\n@media (max-width: 800px) {\n  :is(#cx, #cx-ui) { --pad: 14px; }\n  .nf-nav { height: 58px; gap: 12px; }\n  .nf-logo { font-size: 20px; }\n  .nf-links { display: none; }\n  .nf-hero { margin-top: 68px; height: 68vh; min-height: 420px; border-radius: 22px; }\n  .nf-slide { background-position: 62% center; }\n  .nf-hero::after { background: linear-gradient(to top, rgba(8,8,10,.92) 0%, rgba(8,8,10,.35) 55%, rgba(8,8,10,0) 100%); }\n  .nf-hero-body { left: 0; right: 0; bottom: 18px; width: auto; padding: 0 18px; text-align: center; display: flex; flex-direction: column; align-items: center; }\n  .nf-hero-logo { object-position: center bottom; max-height: 96px; }\n  .nf-meta { justify-content: center; font-size: 12.5px; }\n  .nf-overview { display: none; }\n  .nf-hero-btns { justify-content: center; }\n  .nf-dots { display: none; }\n  .btn { height: 44px; font-size: 14.5px; padding: 0 20px 0 15px; }\n  .btn.round { width: 44px; padding: 0; }\n  .nf-rows { margin-top: 24px; padding-bottom: 150px; }\n  .nf-row { margin-bottom: 22px; }\n  .nf-row h2 { font-size: 17px; }\n  .nf-scroller { gap: 10px; scroll-snap-type: x proximity; }\n  .nf-arrow { display: none; }\n  .nf-card { width: 44vw; } .nf-card.poster { width: 31vw; }\n  .nf-card .info { display: none; }\n  .nf-page-pad { padding: 76px var(--pad) 150px; }\n  .nf-grid { grid-template-columns: repeat(3, 1fr); gap: 16px 10px; }\n  .nf-dbody { padding: 70px var(--pad) 150px; }\n  .nf-dhead { flex-direction: column; align-items: flex-start; gap: 18px; }\n  .nf-dposter { width: 44vw; border-radius: 16px; }\n  .nf-dback::after { background: linear-gradient(to top, #111113 24%, rgba(17,17,19,.6) 70%, rgba(17,17,19,.75)); }\n  .nf-ep { grid-template-columns: 112px 1fr; gap: 12px; padding: 10px; }\n  .nf-ep .n, .nf-ep .rt { display: none; }\n  .nf-npill { right: 10px; left: 10px; bottom: 74px; max-width: none; }\n  .cx-tabs { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0)); z-index: 70; height: 62px; border-radius: 22px; background: rgba(28,28,32,.88); backdrop-filter: blur(20px); border: 1px solid var(--line); justify-content: space-around; box-shadow: 0 10px 30px rgba(0,0,0,.5); }\n  .cx-tabs a, .cx-tabs button { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 10.5px; color: #8e8e95; }\n  .cx-tabs a.on, .cx-tabs button.on { color: #fff; }\n  .cx-tabs svg { width: 22px; height: 22px; }\n  .nf-npill { bottom: 84px; }\n}\n\n/* =====================================================================\n   SPOTIFY SHELL\n   ===================================================================== */\n#cx-sp { position: absolute; inset: 0; background: #000; display: grid; grid-template-columns: 320px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 88px; gap: 8px; padding: 8px; --accent: #1ed760; }\n#cx-sp.idle { grid-template-rows: minmax(0, 1fr) 0; row-gap: 0; }\n.sp-side { grid-row: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0; }\n.sp-card { background: #121212; border-radius: 8px; }\n.sp-top { padding: 12px 12px 8px; }\n.sp-navlink { display: flex; align-items: center; gap: 18px; padding: 10px 12px; font-weight: 700; color: #b3b3b3; border-radius: 6px; transition: color .2s; width: 100%; font-size: 16px; }\n.sp-navlink:hover, .sp-navlink.on { color: #fff; }\n.sp-lib { flex: 1; min-height: 0; display: flex; flex-direction: column; }\n.sp-libhead { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 8px 20px; font-weight: 700; color: #b3b3b3; }\n.sp-libhead button { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #b3b3b3; }\n.sp-libhead button:hover { background: #1f1f1f; color: #fff; }\n.sp-chips { display: flex; gap: 8px; padding: 4px 16px 10px; flex-wrap: wrap; }\n.sp-chip { padding: 6px 12px; border-radius: 16px; background: #2a2a2a; font-size: 13px; font-weight: 500; transition: .2s; }\n.sp-chip:hover { background: #333; }\n.sp-chip.on { background: #fff; color: #000; }\n.sp-liblist { flex: 1; overflow-y: auto; padding: 0 8px 8px; }\n.sp-li { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 6px; cursor: pointer; width: 100%; text-align: left; }\n.sp-li:hover { background: #1a1a1a; }\n.sp-li.on { background: #232323; }\n.sp-li .art { width: 48px; height: 48px; border-radius: 4px; background: #282828 center/cover; flex: none; display: grid; place-items: center; }\n.sp-li.round .art { border-radius: 50%; }\n.sp-li .nm { font-size: 16px; font-weight: 500; } .sp-li .nm.playing { color: var(--accent); }\n.sp-li .sb { font-size: 14px; color: #b3b3b3; margin-top: 2px; }\n.sp-li > div:last-child { min-width: 0; }\n.liked-art { background: linear-gradient(135deg, #450af5, #c4efd9) !important; }\n.sp-main { grid-row: 1; grid-column: 2; position: relative; overflow: hidden; border-radius: 8px; background: #121212; min-height: 0; }\n.sp-scroll { position: absolute; inset: 0; overflow-y: auto; scroll-behavior: auto; }\n.sp-bg { position: absolute; left: 0; right: 0; top: 0; height: 340px; background: linear-gradient(180deg, var(--tint, #333) 0%, #121212 100%); opacity: .55; pointer-events: none; transition: background .6s; }\n.sp-header { position: sticky; top: 0; z-index: 10; height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; transition: background .25s; }\n.sp-header.solid { background: #121212ee; backdrop-filter: blur(8px); }\n.sp-hbtn { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,.7); display: grid; place-items: center; }\n.sp-hbtn:hover { background: rgba(0,0,0,.9); }\n.sp-hsearch { display: flex; align-items: center; gap: 10px; background: #242424; border-radius: 500px; height: 46px; padding: 0 14px; width: min(420px, 100%); border: 2px solid transparent; }\n.sp-hsearch:focus-within { border-color: #fff; background: #2a2a2a; }\n.sp-hsearch input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-size: 15px; }\n.sp-pillbtn { padding: 8px 18px; border-radius: 500px; background: #fff; color: #000; font-weight: 700; font-size: 14px; }\n.sp-pillbtn:hover { transform: scale(1.04); }\n.sp-pillbtn.dark { background: rgba(0,0,0,.7); color: #fff; }\n.sp-content { position: relative; padding: 0 24px 40px; animation: cxfade .35s both; }\n.sp-content h2 { font-size: 24px; font-weight: 700; margin: 36px 0 14px; letter-spacing: -.01em; }\n.sp-content h2 .more { font-size: 13px; color: #b3b3b3; float: right; margin-top: 10px; font-weight: 700; }\n.sp-greet { font-size: 30px; font-weight: 800; margin: 12px 0 20px; }\n.sp-quick { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }\n.sp-qt { display: flex; align-items: center; gap: 14px; height: 64px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; cursor: pointer; position: relative; padding-right: 60px; transition: background .25s; }\n.sp-qt:hover { background: rgba(255,255,255,.18); }\n.sp-qt .art { width: 64px; height: 64px; background: #333 center/cover; flex: none; }\n.sp-qt b { font-size: 15px; }\n.sp-qt .pbtn { right: 12px; top: 12px; }\n.sp-shelf { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(170px, 1fr); gap: 16px; overflow: hidden; }\n.sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); gap: 16px; }\n.sp-tile { position: relative; padding: 12px; border-radius: 8px; background: #181818; cursor: pointer; transition: background .3s; min-width: 0; }\n.sp-tile:hover { background: #282828; }\n.sp-tile .cv { position: relative; aspect-ratio: 1; border-radius: 6px; background: #333 center/cover; box-shadow: 0 8px 24px rgba(0,0,0,.5); margin-bottom: 14px; display: grid; place-items: center; overflow: hidden; }\n.sp-tile.round .cv { border-radius: 50%; }\n.sp-tile .nm { font-weight: 700; font-size: 16px; margin-bottom: 4px; }\n.sp-tile .sb { font-size: 14px; color: #a7a7a7; line-height: 1.35; }\n.sp-tile.round .nm, .sp-tile.round .sb { text-align: left; }\n.pbtn { position: absolute; right: 20px; bottom: 74px; width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: #000; display: grid !important; place-items: center; box-shadow: 0 8px 8px rgba(0,0,0,.3); opacity: 0; transform: translateY(8px); transition: .3s; z-index: 2; }\n.sp-tile:hover .pbtn, .sp-qt:hover .pbtn, .pbtn.show { opacity: 1; transform: none; }\n.pbtn:hover { transform: scale(1.06) !important; background: #3be477; }\n.mixcv { width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 12px; font-weight: 800; font-size: 20px; line-height: 1.1; }\n.cv-ph { color: #7a7a7a; }\n.cv-ph svg { width: 40%; height: 40%; }\n\n/* playlist / album header */\n.sp-ph { display: flex; align-items: flex-end; gap: 24px; padding: 24px 0 24px; min-height: 280px; }\n.sp-ph .cv { width: clamp(150px, 15vw, 232px); aspect-ratio: 1; border-radius: 4px; background: #333 center/cover; box-shadow: 0 4px 60px rgba(0,0,0,.5); flex: none; display: grid; place-items: center; }\n.sp-ph.artist .cv { border-radius: 50%; }\n.sp-ph .tp { font-size: 14px; font-weight: 700; margin-bottom: 4px; }\n.sp-ph h1 { font-size: clamp(32px, 6vw, 88px); font-weight: 900; line-height: 1; margin: 0 0 18px; letter-spacing: -.04em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; padding-bottom: 4px; }\n.sp-ph .mt { font-size: 14px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; color: #e0e0e0; }\n.sp-ph .mt a:hover { text-decoration: underline; }\n.sp-actions { display: flex; align-items: center; gap: 24px; padding: 8px 0 20px; }\n.sp-big { width: 56px; height: 56px; border-radius: 50%; background: var(--accent); color: #000; display: grid; place-items: center; transition: transform .1s; }\n.sp-big:hover { transform: scale(1.06); background: #3be477; }\n.sp-big svg { width: 28px; height: 28px; }\n.sp-ico { color: #b3b3b3; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; }\n.sp-ico:hover { color: #fff; }\n.sp-ico.on { color: var(--accent); }\n.sp-ico svg { width: 30px; height: 30px; }\n\n/* track table */\n.sp-th, .sp-row { display: grid; grid-template-columns: 16px minmax(120px, 6fr) minmax(80px, 4fr) minmax(60px, 3fr) 80px; gap: 16px; align-items: center; padding: 0 16px; }\n.sp-th.noalb, .sp-row.noalb { grid-template-columns: 16px minmax(120px, 6fr) minmax(60px, 3fr) 80px; }\n.sp-th { height: 36px; color: #b3b3b3; font-size: 13px; border-bottom: 1px solid #ffffff1a; margin-bottom: 8px; position: sticky; top: 64px; background: #121212; z-index: 5; text-transform: none; }\n.sp-th > :last-child { text-align: right; }\n.sp-row { height: 56px; border-radius: 4px; color: #b3b3b3; font-size: 14px; cursor: default; }\n.sp-row:hover { background: rgba(255,255,255,.1); }\n.sp-row .ix { text-align: right; position: relative; font-variant-numeric: tabular-nums; }\n.sp-row .ix .pl { position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: #fff; display: none; }\n.sp-row .ix .pl svg { width: 18px; height: 18px; }\n.sp-row:hover .ix .n { display: none; } .sp-row:hover .ix .pl { display: block; }\n.sp-row .ti { display: flex; align-items: center; gap: 14px; min-width: 0; }\n.sp-row .ti .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\n.sp-row .ti .tx { min-width: 0; }\n.sp-row .ti .tn { color: #fff; font-size: 16px; }\n.sp-row .ti .ta { font-size: 14px; }\n.sp-row .ti .ta a:hover, .sp-row .al a:hover { text-decoration: underline; color: #fff; }\n.sp-row.playing .tn, .sp-row.playing .ix .n { color: var(--accent); }\n.sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 14px; font-variant-numeric: tabular-nums; }\n.sp-row .du .lk { opacity: 0; color: #b3b3b3; } .sp-row:hover .du .lk { opacity: 1; } .sp-row .du .lk.on { opacity: 1; color: var(--accent); }\n.sp-row .du .lk svg { width: 18px; height: 18px; }\n.sp-row .du .mo { opacity: 0; } .sp-row:hover .du .mo { opacity: 1; }\n.sp-row .du .mo svg { width: 20px; height: 20px; }\n.sp-row .eq { display: none; }\n.sp-row.playing .ix .n { visibility: hidden; }\n.sp-row.playing .ix .eq { display: flex; align-items: flex-end; gap: 2px; height: 14px; position: absolute; right: 2px; top: 50%; transform: translateY(-50%); }\n.sp-row.playing:hover .ix .eq { display: none; }\n.eq i { width: 3px; background: var(--accent); animation: cxeq 1s infinite ease-in-out; height: 40%; }\n.eq i:nth-child(2) { animation-delay: .2s; } .eq i:nth-child(3) { animation-delay: .4s; }\n.paused .eq i { animation-play-state: paused; }\n@keyframes cxeq { 0%,100% { height: 25%; } 50% { height: 100%; } }\n.sp-disc { margin: 20px 0 6px; font-weight: 700; color: #b3b3b3; display: flex; align-items: center; gap: 10px; padding: 0 16px; }\n\n/* search results */\n.sp-res { display: grid; grid-template-columns: minmax(280px, 2fr) 3fr; gap: 24px; }\n.sp-top1 { padding: 20px; border-radius: 8px; background: #181818; cursor: pointer; position: relative; transition: background .3s; }\n.sp-top1:hover { background: #282828; }\n.sp-top1 .cv { width: 92px; height: 92px; border-radius: 6px; background: #333 center/cover; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.5); }\n.sp-top1.round .cv { border-radius: 50%; }\n.sp-top1 b { font-size: 30px; display: block; margin-bottom: 6px; }\n.sp-top1 span { color: #b3b3b3; font-size: 14px; }\n.sp-genres { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }\n.sp-genre { position: relative; height: 110px; border-radius: 8px; padding: 14px; font-size: 20px; font-weight: 800; overflow: hidden; cursor: pointer; }\n\n/* player bar */\n.sp-player { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: minmax(180px, 30%) minmax(300px, 40%) minmax(180px, 30%); align-items: center; padding: 0 8px; gap: 8px; }\n.pl-l { display: flex; align-items: center; gap: 14px; min-width: 0; }\n.pl-l .cv { width: 56px; height: 56px; border-radius: 4px; background: #282828 center/cover; flex: none; cursor: pointer; }\n.pl-l .tx { min-width: 0; } .pl-l .tn { font-size: 14px; } .pl-l .tn:hover, .pl-l .ta a:hover { text-decoration: underline; cursor: pointer; }\n.pl-l .ta { font-size: 12px; color: #b3b3b3; }\n.pl-c { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 722px; width: 100%; margin: 0 auto; }\n.pl-btns { display: flex; align-items: center; gap: 16px; }\n.pl-btn { color: #b3b3b3; width: 32px; height: 32px; display: grid; place-items: center; position: relative; }\n.pl-btn:hover { color: #fff; }\n.pl-btn.on { color: var(--accent); }\n.pl-btn.on::after { content: \"\"; position: absolute; bottom: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }\n.pl-btn svg { width: 20px; height: 20px; }\n.pl-btn.big { background: #fff; color: #000; border-radius: 50%; width: 36px; height: 36px; }\n.pl-btn.big:hover { transform: scale(1.06); background: #fff; color: #000; }\n.pl-btn.big svg { width: 22px; height: 22px; }\n.mp-seek { display: flex; align-items: center; gap: 8px; width: 100%; font-size: 11px; color: #a7a7a7; font-variant-numeric: tabular-nums; }\n.mp-seek span { width: 40px; } .mp-seek span:first-child { text-align: right; }\n.bar { position: relative; flex: 1; height: 12px; display: flex; align-items: center; cursor: pointer; touch-action: none; }\n.bar::before { content: \"\"; position: absolute; left: 0; right: 0; height: 4px; border-radius: 2px; background: #4d4d4d; }\n.bar i { position: absolute; left: 0; height: 4px; border-radius: 2px; background: #fff; pointer-events: none; }\n.bar b { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #fff; margin-left: -6px; opacity: 0; pointer-events: none; }\n.bar:hover i { background: var(--accent); } .bar:hover b { opacity: 1; }\n.pl-r { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }\n.pl-r .bar { flex: none; width: 100px; }\n\n.sp-menu { position: fixed; z-index: 9600; min-width: 220px; max-width: 300px; max-height: 70vh; overflow-y: auto; background: #282828; border-radius: 4px; padding: 4px; box-shadow: 0 16px 24px rgba(0,0,0,.4); font-size: 14px; color: #eee; }\n.sp-menu button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; text-align: left; border-radius: 2px; }\n.sp-menu button:hover { background: rgba(255,255,255,.1); }\n.sp-menu hr { border: 0; border-top: 1px solid #ffffff1a; margin: 4px 0; }\n.sp-modal-bg { position: fixed; inset: 0; z-index: 9700; background: rgba(0,0,0,.7); display: grid; place-items: center; padding: 16px; }\n.sp-modal { background: #282828; border-radius: 8px; padding: 24px; width: min(420px, 100%); }\n.sp-modal h3 { margin: 0 0 16px; font-size: 22px; }\n.sp-modal input { width: 100%; padding: 12px; border-radius: 4px; border: 0; background: #3e3e3e; font-size: 15px; outline: 0; }\n.sp-modal .row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }\n.sp-queue { position: absolute; top: 8px; right: 8px; bottom: 96px; width: 340px; background: #121212; border-radius: 8px; z-index: 30; overflow-y: auto; padding: 16px 8px; box-shadow: 0 0 30px rgba(0,0,0,.6); }\n.sp-queue h3 { margin: 8px 12px; font-size: 16px; } .sp-queue h4 { margin: 18px 12px 6px; color: #b3b3b3; font-size: 14px; }\n.sp-qi { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 4px; cursor: pointer; }\n.sp-qi:hover { background: #ffffff14; } .sp-qi .cv { width: 40px; height: 40px; background: #333 center/cover; border-radius: 3px; } .sp-qi.playing b { color: var(--accent); }\n.sp-qi span { color: #b3b3b3; font-size: 13px; display: block; }\n.sp-qi > div { min-width: 0; }\n\n/* full-screen mobile player */\n.sp-full { position: fixed; inset: 0; z-index: 9500; display: none; flex-direction: column; padding: 14px 24px calc(24px + env(safe-area-inset-bottom, 0)); background: linear-gradient(180deg, var(--tint, #333), #121212 80%); overflow-y: auto; }\n.sp-full.open { display: flex; animation: cxfade .25s both; }\n.sp-full .top { display: flex; justify-content: space-between; align-items: center; height: 48px; }\n.sp-full .top b { font-size: 13px; }\n.sp-full .cvbig { width: 100%; max-width: 420px; aspect-ratio: 1; margin: 22px auto 28px; border-radius: 8px; background: #333 center/cover; box-shadow: 0 16px 50px rgba(0,0,0,.5); }\n.sp-full .meta { display: flex; align-items: center; justify-content: space-between; max-width: 420px; width: 100%; margin: 0 auto 10px; gap: 12px; }\n.sp-full .meta .tn { font-size: 22px; font-weight: 800; } .sp-full .meta .ta { color: #cfcfcf; margin-top: 4px; }\n.sp-full .seekwrap { max-width: 420px; width: 100%; margin: 6px auto; }\n.sp-full .seekwrap .mp-seek { margin-top: 2px; } .sp-full .seekwrap .bar::before { background: #ffffff44; }\n.sp-full .ctr { display: flex; justify-content: space-between; align-items: center; max-width: 420px; width: 100%; margin: 10px auto; }\n.sp-full .ctr .pl-btn svg { width: 28px; height: 28px; } .sp-full .ctr .pl-btn.big { width: 64px; height: 64px; } .sp-full .ctr .pl-btn.big svg { width: 34px; height: 34px; }\n\n.sp-mini { display: none; }\n\n/* =====================================================================\n   SPOTIFY MOBILE\n   ===================================================================== */\n@media (max-width: 800px) {\n  #cx-sp { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); padding: 0; gap: 0; }\n  .sp-side { display: none; }\n  .sp-main { grid-column: 1; border-radius: 0; background: #121212; }\n  .sp-header { height: 54px; padding: 0 14px; }\n  .sp-content { padding: 0 14px calc(150px + env(safe-area-inset-bottom, 0)); }\n  .sp-content h2 { font-size: 20px; margin: 26px 0 12px; }\n  .sp-greet { font-size: 24px; }\n  .sp-quick { grid-template-columns: 1fr 1fr; gap: 8px; }\n  .sp-qt { height: 56px; padding-right: 8px; } .sp-qt .art { width: 56px; height: 56px; } .sp-qt b { font-size: 13px; } .sp-qt .pbtn { display: none !important; }\n  .sp-shelf { grid-auto-flow: column; grid-auto-columns: 40vw; overflow-x: auto; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; gap: 12px; }\n  .sp-shelf::-webkit-scrollbar { display: none; }\n  .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\n  .sp-tile { padding: 0; background: none; } .sp-tile:hover { background: none; }\n  .sp-tile .cv { margin-bottom: 8px; } .sp-tile .pbtn { display: none !important; } .sp-tile .nm { font-size: 14px; } .sp-tile .sb { font-size: 12px; }\n  .sp-ph { flex-direction: column; align-items: center; text-align: center; min-height: 0; padding: 4px 0 6px; gap: 16px; }\n  .sp-ph .cv { width: 62vw; max-width: 280px; }\n  .sp-ph h1 { font-size: 26px; letter-spacing: -.02em; margin-bottom: 8px; -webkit-line-clamp: 2; }\n  .sp-ph .mt { justify-content: center; font-size: 13px; }\n  .sp-ph > div:last-child { width: 100%; }\n  .sp-actions { gap: 18px; padding: 4px 0 14px; }\n  .sp-actions .sp-big { margin-left: auto; order: 9; }\n  .sp-th { display: none; }\n  .sp-row, .sp-row.noalb { grid-template-columns: minmax(0, 1fr) auto; height: 58px; padding: 0; gap: 8px; }\n  .sp-row .ix, .sp-row .al { display: none !important; }\n  .sp-row .du { gap: 4px; } .sp-row .du .tm { display: none; } .sp-row .du .lk, .sp-row .du .mo { opacity: 1; } .sp-row .du .mo svg { width: 22px; height: 22px; }\n  .sp-row.playing .ti .tn { color: var(--accent); }\n  .sp-res { grid-template-columns: 1fr; }\n  .sp-queue { top: 0; right: 0; left: 0; bottom: 0; width: auto; border-radius: 0; z-index: 9550; }\n  .sp-player { display: none; }\n  .sp-mini { display: flex; position: fixed; left: 8px; right: 8px; bottom: calc(62px + env(safe-area-inset-bottom, 0)); z-index: 80; height: 56px; border-radius: 8px; align-items: center; gap: 10px; padding: 0 8px; background: var(--mini, #3a3350); box-shadow: 0 4px 16px rgba(0,0,0,.4); overflow: hidden; }\n  .sp-mini .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\n  .sp-mini .tx { flex: 1; min-width: 0; font-size: 13px; } .sp-mini .tx b { display: block; } .sp-mini .tx span { color: #e0e0e0cc; font-size: 12px; }\n  .sp-mini .pl-btn { color: #fff; width: 38px; height: 38px; } .sp-mini .pl-btn svg { width: 26px; height: 26px; }\n  .sp-mini .mbar { position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; background: #ffffff44; } .sp-mini .mbar i { display: block; height: 100%; background: #fff; }\n}\n\n#cx.mode-nf .sp-mini, #cx.mode-nf .sp-full { display: none !important; }\n#cx.mode-nf .sp-full.open { display: none !important; }\n\n/* ---- Spotify polish: softer, rounder ---- */\n.sp-card, .sp-main { border-radius: 16px; }\n.sp-main, .sp-card { background: #121214; }\n#cx-sp { background: #08080a; }\n.sp-tile { border-radius: 16px; background: #17171a; }\n.sp-tile .cv { border-radius: 12px; }\n.sp-qt { border-radius: 10px; }\n.sp-li { border-radius: 10px; } .sp-li .art { border-radius: 8px; }\n.sp-chip, .sp-pillbtn { border-radius: 999px; }\n.sp-row { border-radius: 10px; }\n.sp-ph .cv { border-radius: 14px; }\n.sp-menu, .sp-modal { border-radius: 14px; }\n.sp-top1 { border-radius: 16px; } .sp-genre { border-radius: 14px; }\n.sp-queue { border-radius: 16px; }\n.sp-mini { border-radius: 16px !important; bottom: calc(84px + env(safe-area-inset-bottom, 0)) !important; }\n.nf-card.poster .info .t { display: none; }\n.nf-card.poster .info { justify-content: flex-end; }\n\n/* =====================================================================\n   INTEGRATION: persistent top bar, hover, rounder icons\n   ===================================================================== */\n:is(#cx, #cx-ui) svg path { stroke: currentColor; stroke-width: .4; stroke-linejoin: round; stroke-linecap: round; }\n#cx-ui .nf-nav { position: fixed; z-index: 9100; display: none; }\n#cx-ui .nf-nav.solid { background: rgba(17,17,19,.9); }\n.nf-pillbtn { display: inline-flex; align-items: center; gap: 4px; padding: 9px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; color: #d6d6d9; }\n.nf-pillbtn:hover { background: rgba(255,255,255,.08); color: #fff; }\n.nf-more .nf-pop { left: 0; right: auto; }\n.nf-pop a { display: flex !important; align-items: center; gap: 12px; }\n.nf-pop a.on { background: rgba(255,255,255,.1); }\n.m-opt { display: none !important; }\n.nf-pop.up { position: fixed; right: 12px; left: auto; top: auto; bottom: 88px; z-index: 9200; }\n@media (max-width: 1280px) { .nf-links a.opt { display: none; } .m-opt { display: flex !important; } }\n@media (max-width: 1000px) { .nf-links a[data-k=\"watchlist\"] { display: none; } }\n.cx-tabs.hide { display: none !important; }\n#cx-ui .cx-tabs { z-index: 9100; }\n@media (min-width: 801px) { #cx-ui .cx-tabs, #cx-ui .nf-pop.up { display: none !important; } }\n#cx-ui .nf-pop.hide { display: none !important; }\n\n/* richer card hover: tilt, spotlight, zooming image, info overlay */\n.nf-card .im { transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transform-style: preserve-3d; will-change: transform; }\n.nf-card .im .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .7s cubic-bezier(.2,.7,.2,1); }\n.nf-card .im::before { content: \"\"; position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity .3s;\n  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.22), rgba(255,255,255,0) 65%); }\n.nf-card .im::after { z-index: 1; }\n@media (hover: hover) and (pointer: fine) {\n  .nf-card .im { transition: transform .12s ease-out, box-shadow .35s; }\n  .nf-card:hover .im { transform: perspective(800px) translateY(-6px) scale(1.04) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); box-shadow: 0 22px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.18); }\n  .nf-card:hover .im::before { opacity: 1; }\n  .nf-card:hover .im .bgi { transform: scale(1.1); }\n}\n.nf-card .info { z-index: 3; flex-wrap: wrap; align-items: flex-end; gap: 6px 8px; left: 14px; right: 14px; bottom: 14px; }\n.nf-card .info .t { flex: 1 0 100%; font-size: 15px; font-weight: 700; }\n.nf-card .info .m { display: flex !important; flex: 1 0 100%; gap: 8px; font-size: 12px; color: #d4d4d8; margin-bottom: 4px; }\n.nf-card .info .m span + span::before { content: \"•\"; margin-right: 8px; opacity: .5; }\n.nf-card .acts { display: flex !important; gap: 8px; width: 100%; order: 3; }\n.nf-card .acts button { display: grid !important; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.18); backdrop-filter: blur(8px); border: 0 !important; place-items: center; transition: transform .2s, background .2s; }\n.nf-card .acts button svg { width: 18px; height: 18px; }\n.nf-card .acts button:hover { background: rgba(255,255,255,.3); transform: scale(1.1); }\n.nf-card .acts button.pl { background: #fff; color: #000; order: 0; }\n.nf-card.poster .info { left: 10px; right: 10px; bottom: 10px; }\n.nf-card.poster .info .t { display: block; font-size: 13px; }\n.nf-card.poster .info .m { font-size: 11px; }\n.nf-card.poster .acts button { width: 34px; height: 34px; }\n.nf-card.poster .acts button:nth-child(3) { display: none !important; }\n\n/* =====================================================================\n   NATIVE JELLYFIN PAGES (settings, dashboard, plugin pages) - skinned to match\n   ===================================================================== */\nhtml.cx-ready:not(.transparentDocument) body, html.cx-ready:not(.transparentDocument) .backgroundContainer, html.cx-ready:not(.transparentDocument) .skinBody { background: #111113 !important; }\nhtml.cx-ready.transparentDocument body, html.cx-ready.transparentDocument .backgroundContainer, html.cx-ready.transparentDocument .skinBody { background: transparent !important; }\nhtml.cx-ready :where(body, button, input, select, textarea, h1, h2, h3, h4, .MuiTypography-root, .MuiButtonBase-root, .listItemBodyText, .sectionTitle, .emby-input, .emby-select) { font-family: \"Inter\", \"Segoe UI\", system-ui, sans-serif; }\nhtml.cx-ready body { color: #e8e8ec; }\nhtml.cx-frame .skinHeader, html.cx-frame .MuiAppBar-root, html.cx-frame .headerTabs, html.cx-frame .mainDrawerHandle { display: none !important; }\nhtml.cx-frame .page, html.cx-frame .mainAnimatedPage { padding-top: 92px !important; }\nhtml.cx-frame .padded-top-focusscale, html.cx-frame .padded-top { padding-top: 0 !important; }\nhtml.cx-ready .skinHeader, html.cx-ready .MuiAppBar-root { background: rgba(17,17,19,.9) !important; backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,.06) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiDrawer-paper, html.cx-ready .mainDrawer { background: #0d0d0f !important; border-right: 1px solid rgba(255,255,255,.06) !important; }\nhtml.cx-ready .MuiListItemButton-root, html.cx-ready .navMenuOption { border-radius: 12px !important; margin: 2px 10px !important; width: auto !important; transition: background .2s; }\nhtml.cx-ready .MuiListItemButton-root.Mui-selected, html.cx-ready .navMenuOption-selected { background: rgba(255,255,255,.1) !important; }\nhtml.cx-ready .MuiListItemButton-root:hover, html.cx-ready .navMenuOption:hover { background: rgba(255,255,255,.07) !important; }\nhtml.cx-ready .MuiPaper-root, html.cx-ready .paperList, html.cx-ready .dialog, html.cx-ready .actionSheet, html.cx-ready .formDialog { background: #1a1a1e !important; border-radius: 18px !important; color: #e8e8ec; box-shadow: 0 8px 30px rgba(0,0,0,.35) !important; border: 1px solid rgba(255,255,255,.05); }\nhtml.cx-ready .MuiMenu-paper, html.cx-ready .MuiPopover-paper { background: rgba(28,28,32,.97) !important; backdrop-filter: blur(20px); border-radius: 16px !important; }\nhtml.cx-ready .MuiMenuItem-root { border-radius: 10px !important; margin: 2px 6px !important; }\nhtml.cx-ready .MuiButton-root, html.cx-ready .emby-button.raised, html.cx-ready .button-submit, html.cx-ready .raised { border-radius: 999px !important; text-transform: none !important; font-weight: 600; }\nhtml.cx-ready .raised, html.cx-ready .button-submit, html.cx-ready .MuiButton-contained { background: #fff !important; color: #000 !important; box-shadow: none !important; }\nhtml.cx-ready .raised:hover, html.cx-ready .button-submit:hover, html.cx-ready .MuiButton-contained:hover { background: #e4e4e8 !important; }\nhtml.cx-ready .emby-input, html.cx-ready .emby-select, html.cx-ready .emby-textarea, html.cx-ready .MuiInputBase-root, html.cx-ready .MuiOutlinedInput-root { background: #1f1f24 !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,.08) !important; color: #fff; }\nhtml.cx-ready .emby-input:focus, html.cx-ready .emby-select:focus, html.cx-ready .emby-textarea:focus { border-color: rgba(255,255,255,.5) !important; outline: 0; }\nhtml.cx-ready .MuiOutlinedInput-notchedOutline { border: 0 !important; }\nhtml.cx-ready .listItem, html.cx-ready .listItem-border { border-radius: 14px !important; border-color: rgba(255,255,255,.06) !important; transition: background .2s; }\nhtml.cx-ready .listItem:hover { background: rgba(255,255,255,.05) !important; }\nhtml.cx-ready .cardScalable, html.cx-ready .cardImageContainer, html.cx-ready .cardImage, html.cx-ready .cardBox { border-radius: 14px !important; }\nhtml.cx-ready .cardText { color: #d4d4d8; }\nhtml.cx-ready .sectionTitle, html.cx-ready .sectionTitle-cards { font-weight: 700; letter-spacing: -.01em; }\nhtml.cx-ready .emby-tab-button { border-radius: 999px !important; }\nhtml.cx-ready .emby-tab-button-active { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .checkboxIcon, html.cx-ready .emby-checkbox:checked + span + .checkboxOutline { border-radius: 6px !important; }\nhtml.cx-ready .emby-checkbox:checked + span::before, html.cx-ready .emby-radio:checked + span::before { background: #fff !important; }\nhtml.cx-ready .MuiChip-root, html.cx-ready .MuiAvatar-root { border-radius: 999px; }\nhtml.cx-ready .MuiIconButton-root, html.cx-ready .paper-icon-button-light, html.cx-ready .headerButton { border-radius: 50% !important; }\n\n/* settings menu rows as rounded cards */\nhtml.cx-ready .listItem-border { background: #1a1a1e !important; margin: 0 0 10px !important; padding: 14px 18px !important; border: 1px solid rgba(255,255,255,.05) !important; }\nhtml.cx-ready .listItem-border:hover { background: #222227 !important; }\nhtml.cx-ready .listItem-border .listItemIcon { background: rgba(255,255,255,.1) !important; color: #fff; border-radius: 12px !important; width: 40px; height: 40px; display: grid; place-items: center; }\nhtml.cx-ready .listItem-border .listItemBodyText { font-weight: 600; font-size: 15px; }\nhtml.cx-ready .readOnlyContent h2, html.cx-ready .userProfilesIntro { font-size: 28px; font-weight: 800; letter-spacing: -.02em; }\nhtml.cx-ready .dashboardColumn .cardBox, html.cx-ready .dashboardSection .card { background: #1a1a1e !important; }\nhtml.cx-ready .MuiToolbar-root { background: transparent; }\nhtml.cx-ready .MuiDrawer-paper .MuiListSubheader-root { background: transparent !important; text-transform: none; font-weight: 600; color: #8c8c94; }\n.nf-card.poster .info .t, .nf-card.poster .info .m { display: none !important; }\n.nf-card.poster .info { justify-content: center; }\n.nf-card.poster .acts { justify-content: center; }\n.nf-card .info .acts { pointer-events: auto; }\n\n/* hover overlay lives inside the image now */\n.nf-card .im .info { position: absolute; left: 12px; right: 12px; bottom: 12px; top: auto; background: none; padding: 0; box-shadow: none; border-radius: 0; opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .25s; }\n.nf-card.poster .im .info { left: 10px; right: 10px; bottom: 10px; }\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im .info { opacity: 1; transform: none; transition-delay: .08s; } }\n.nf-card .im .info .t { text-shadow: 0 1px 8px rgba(0,0,0,.8); }\n:is(#cx, #cx-ui) .ic-s svg path, :is(#cx, #cx-ui) .nf-card .acts svg path { stroke-width: .3; }\n\n/* Discover (Seerr) cards: same look as library cards, plus an ownership mark */\n.dmark { position: absolute; top: 10px; left: 10px; z-index: 4; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px 4px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .01em; color: #e8e8ec; background: rgba(17,17,19,.72); backdrop-filter: blur(10px); border: 1px dashed rgba(255,255,255,.4); }\n.dmark svg { width: 12px !important; height: 12px !important; }\n.dmark.own { border-style: solid; border-color: rgba(94,224,138,.5); color: #7cf0a3; }\n.dmark.req { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\n.nf-card.notown .im { box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.12); }\n.nf-card.notown .im .bgi { filter: saturate(.85) brightness(.92); }\n.nf-card.notown:hover .im .bgi { filter: none; }\n/* menus now live in #cx-ui */\n.sp-menu button { background: none; color: #eee; font-size: 14px; }\n\n/* =====================================================================\r\n   PLUGIN PAGE SKIN (Jellyfin Enhanced, Seerr, Kefin) - scoped to html.cx-pskin\r\n   Toggle: avatar menu > Plugin page styling, or cinemaUI.skin(false) in the console.\r\n   ===================================================================== */\r\nhtml.cx-pskin { --pk-surface: #17171a; --pk-surface-2: #1f1f24; --pk-line: rgba(255,255,255,.07); --pk-accent: #fff; --pk-accent-text: #000; }\r\n\r\n/* ---------- calendar ---------- */\r\nhtml.cx-pskin .je-calendar-page { padding-top: 4px; }\r\nhtml.cx-pskin .je-calendar-day { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 16px !important; box-shadow: none; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-day:hover { background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today { border-color: rgba(255,255,255,.4) !important; background: #1d1d22 !important; }\r\nhtml.cx-pskin .je-calendar-day-number, html.cx-pskin .je-calendar-day-name, html.cx-pskin .je-calendar-weekday, html.cx-pskin .je-calendar-month-day-name { font-weight: 600; color: #d8d8dc !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-number, html.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-name { color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-card, html.cx-pskin .je-calendar-event { border-radius: 12px !important; overflow: hidden; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-card-image, html.cx-pskin .je-calendar-card-image-wrap { border-radius: 12px !important; }\r\nhtml.cx-pskin .je-calendar-play-btn, html.cx-pskin .je-calendar-play-btn-card { border-radius: 50% !important; background: #fff !important; color: #000 !important; }\r\nhtml.cx-pskin .je-calendar-view-btn, html.cx-pskin .je-calendar-mode-btn, html.cx-pskin .je-calendar-nav-btn, html.cx-pskin .je-calendar-nav-today, html.cx-pskin .je-calendar-filter-btn, html.cx-pskin .je-calendar-filter-toggle, html.cx-pskin .je-calendar-group-toggle {\r\n  border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-view-btn:hover, html.cx-pskin .je-calendar-mode-btn:hover, html.cx-pskin .je-calendar-nav-btn:hover, html.cx-pskin .je-calendar-nav-today:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-calendar-view-btn.active, html.cx-pskin .je-calendar-mode-btn.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-nav-btn { width: 38px; height: 38px; padding: 0 !important; }\r\nhtml.cx-pskin .je-calendar-legend-item { border-radius: 999px !important; background: rgba(255,255,255,.06) !important; border: 1px solid transparent !important; padding: 7px 14px !important; }\r\nhtml.cx-pskin .je-calendar-legend-item.active { border-color: rgba(255,255,255,.5) !important; background: rgba(255,255,255,.12) !important; }\r\nhtml.cx-pskin .je-calendar-sidebar, html.cx-pskin .je-calendar-sidebar-content { background: var(--pk-surface) !important; border-radius: 20px !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .je-calendar-agenda-row, html.cx-pskin .je-calendar-agenda-event { border-radius: 14px !important; }\r\nhtml.cx-pskin .je-calendar-agenda-event { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- requests / downloads / issues ---------- */\r\nhtml.cx-pskin .je-request-card, html.cx-pskin .je-download-card, html.cx-pskin .je-issue-card { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 22px !important; box-shadow: none !important; transition: transform .25s, background .25s; }\r\nhtml.cx-pskin .je-request-card:hover, html.cx-pskin .je-download-card:hover { background: var(--pk-surface-2) !important; transform: translateY(-2px); }\r\nhtml.cx-pskin .je-request-poster, html.cx-pskin .je-download-poster { border-radius: 14px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-request-title, html.cx-pskin .je-download-title { font-weight: 700; letter-spacing: -.01em; }\r\nhtml.cx-pskin .je-requests-tab, html.cx-pskin .je-issues-tab, html.cx-pskin .je-downloads-tab { border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600 !important; padding: 8px 18px !important; transition: background .2s; }\r\nhtml.cx-pskin .je-requests-tab:hover, html.cx-pskin .je-issues-tab:hover, html.cx-pskin .je-downloads-tab:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-requests-tab.active, html.cx-pskin .je-issues-tab.active, html.cx-pskin .je-downloads-tab.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-request-watch-btn, html.cx-pskin .je-refresh-btn { background: #fff !important; color: #000 !important; border-radius: 50% !important; box-shadow: none !important; }\r\nhtml.cx-pskin .je-request-approve-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-decline-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-external-link, html.cx-pskin .je-issue-view-btn { border-radius: 50% !important; }\r\nhtml.cx-pskin .je-requests-status-chip, html.cx-pskin .je-status-chip, html.cx-pskin .je-issue-status-chip, html.cx-pskin .je-issue-type-chip, html.cx-pskin .je-download-badge, html.cx-pskin .je-arr-badge, html.cx-pskin .je-release-date-chip { border-radius: 999px !important; font-weight: 600; letter-spacing: .02em; }\r\nhtml.cx-pskin .je-download-progress-container, html.cx-pskin .je-download-progress { border-radius: 999px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-download-progress-bar { border-radius: 999px !important; background: #fff !important; }\r\nhtml.cx-pskin .je-downloads-search-input { border-radius: 999px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-pagination button, html.cx-pskin .je-pagination a { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-empty-state { color: #8c8c94; }\r\nhtml.cx-pskin .je-downloads-section .je-section-icon { color: #fff; }\r\n\r\n/* ---------- discover (Seerr) ---------- */\r\nhtml.cx-pskin .je-recommendations-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .jellyseerr-card { border-radius: 20px !important; overflow: hidden; background: var(--pk-surface) !important; border: 1px solid var(--pk-line); transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s; }\r\nhtml.cx-pskin .jellyseerr-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.5); }\r\nhtml.cx-pskin .jellyseerr-poster-image, html.cx-pskin .je-tile-image, html.cx-pskin .je-genre-tile-image, html.cx-pskin .je-genre-tile-backdrop { border-radius: 18px !important; }\r\nhtml.cx-pskin .jellyseerr-media-badge, html.cx-pskin .jellyseerr-status-badge, html.cx-pskin .jellyseerr-collection-badge { border-radius: 999px !important; backdrop-filter: blur(8px); font-weight: 700; }\r\nhtml.cx-pskin .jellyseerr-request-button, html.cx-pskin .jellyseerr-split-main { border-radius: 999px !important; font-weight: 600; }\r\nhtml.cx-pskin .jellyseerr-split-arrow { border-radius: 0 999px 999px 0 !important; }\r\nhtml.cx-pskin .jellyseerr-hover-popover, html.cx-pskin .jellyseerr-4k-popup, html.cx-pskin .je-4k-popup { border-radius: 16px !important; background: rgba(28,28,32,.97) !important; backdrop-filter: blur(16px); }\r\nhtml.cx-pskin .je-scroll-btn { border-radius: 50% !important; background: rgba(30,30,34,.85) !important; backdrop-filter: blur(8px); border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-genre-tile-title { font-weight: 800; }\r\n\r\n/* ---------- modals ---------- */\r\nhtml.cx-pskin .je-more-info-modal { border-radius: 26px !important; background: #17171a !important; border: 1px solid var(--pk-line); box-shadow: 0 30px 80px rgba(0,0,0,.7) !important; overflow: hidden; }\r\nhtml.cx-pskin .je-collection-card { border-radius: 18px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-more-info-stats-panel, html.cx-pskin .je-more-info-right-panel { border-radius: 18px !important; background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-modal-play-button, html.cx-pskin .je-more-info-button-group button { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-launcher-panel, html.cx-pskin #je-header-launcher-panel { border-radius: 22px !important; background: rgba(28,28,32,.97) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- Kefin watchlist / custom pages ---------- */\r\nhtml.cx-pskin .kefin-custom-page-active .sectionTitle, html.cx-pskin [class*=\"watchlist\"] h1, html.cx-pskin [class*=\"watchlist\"] h2 { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin [class*=\"watchlist\"] button, html.cx-pskin [class*=\"kefin\"] button.emby-button { border-radius: 999px; }\r\nhtml.cx-pskin [class*=\"watchlist\"] .card, html.cx-pskin [class*=\"watchlist\"] .cardBox { border-radius: 16px !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] input, html.cx-pskin [class*=\"kefin\"] select { border-radius: 12px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] .card:hover .cardBox, html.cx-pskin [class*=\"watchlist\"] .card:hover .cardBox { transform: translateY(-4px); transition: transform .25s; }\r\nhtml.cx-frame { --je-sticky-top: 72px; }\n\n/* ===== v3: peek popover replaces card hover ===== */\n.nf-card .info, .nf-card .im::before, .nf-card .im::after { display: none !important; }\n.nf-card .im { transform: none !important; transition: box-shadow .3s, filter .3s; will-change: auto; }\n.nf-card .im .bgi { transition: transform .8s cubic-bezier(.2,.7,.2,1); }\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im { box-shadow: 0 0 0 2px rgba(255,255,255,.55); } .nf-card:hover .im .bgi { transform: scale(1.04); } }\n.nf-peek { position: fixed; z-index: 9060; border-radius: 20px; overflow: hidden; background: #1c1c20; box-shadow: 0 30px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.09); opacity: 0; transform: scale(.94) translateY(8px); transition: opacity .2s, transform .28s cubic-bezier(.2,.8,.2,1); pointer-events: none; font-family: \"Inter\", system-ui, sans-serif; color: #fff; }\n.nf-peek.show { opacity: 1; transform: none; pointer-events: auto; }\n.nf-peek .pi { position: relative; aspect-ratio: 16/9; background: #2a2a2f; cursor: pointer; overflow: hidden; }\n.nf-peek .pi .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; }\n.nf-peek .pi::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #1c1c20 4%, rgba(28,28,32,0) 60%); }\n.nf-peek .pt { position: absolute; z-index: 2; left: 16px; right: 16px; bottom: 10px; font-weight: 800; font-size: 19px; letter-spacing: -.01em; text-shadow: 0 2px 12px rgba(0,0,0,.7); }\n.nf-peek .pb { padding: 6px 16px 16px; }\n.nf-peek .pa { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }\n.nf-peek .pa button { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.12); display: grid; place-items: center; transition: background .2s, transform .15s; }\n.nf-peek .pa button:hover { background: rgba(255,255,255,.24); transform: scale(1.08); }\n.nf-peek .pa button.pl { background: #fff; color: #000; }\n.nf-peek .pa .sp { flex: 1; }\n.nf-peek .pa svg { width: 20px; height: 20px; }\n.nf-peek .pm { font-size: 12.5px; color: #cfcfd5; display: flex; gap: 6px 10px; flex-wrap: wrap; align-items: center; }\n.nf-peek .pm .g { color: #5ee08a; font-weight: 700; }\n.nf-peek .pm .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 6px; border-radius: 5px; line-height: 18px; }\n.nf-peek .pm span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\n.nf-peek .po { font-size: 13px; color: #b6b6bd; margin-top: 10px; line-height: 1.45; }\n#cx-cover { position: fixed; inset: 0; z-index: 9700; background: #0d0d0f; display: none; place-items: center; }\n#cx-cover.show { display: grid; }\nhtml.cx-on:not(.transparentDocument) #reactRoot { visibility: hidden; }\n\n/* settings page + requests */\n.rot180 { display: inline-flex; transform: rotate(180deg); }\n.set-card { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 22px 24px; margin-bottom: 20px; }\n.set-card h3 { margin: 0 0 14px; font-size: 18px; letter-spacing: -.01em; }\n.set-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.set-row:first-of-type { border-top: 0; }\n.set-row b { display: block; font-weight: 600; font-size: 15px; } .set-row span { display: block; color: #8d8d95; font-size: 13px; margin-top: 3px; }\n.set-switch { position: relative; width: 46px; height: 26px; border-radius: 999px; background: #3a3a40; flex: none; transition: background .2s; }\n.set-switch i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; }\n.set-switch.on { background: #34c759; } .set-switch.on i { transform: translateX(20px); }\n.set-row input[type=color] { width: 44px; height: 32px; border: 0; background: none; padding: 0; cursor: pointer; border-radius: 8px; }\n.set-hint { color: #8d8d95; font-size: 13.5px; margin: 0 0 14px; }\n.set-list { display: flex; flex-direction: column; gap: 8px; }\n.set-sec { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px 10px 16px; background: #1f1f24; border-radius: 14px; }\n.set-sec.off b { opacity: .45; } .set-sec b { font-weight: 600; font-size: 14.5px; }\n.set-sec-a { display: flex; align-items: center; gap: 6px; }\n.set-sec-a button:not(.set-switch) { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.07); }\n.set-sec-a button:not(.set-switch):hover { background: rgba(255,255,255,.16); }\n.set-sec-a svg { width: 18px; height: 18px; }\n.set-add { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; align-items: center; }\n.set-add select { height: 40px; padding: 0 14px; border-radius: 12px; background: #1f1f24; color: #fff; border: 1px solid rgba(255,255,255,.1); font: inherit; max-width: 260px; }\n.req-grid .nf-card { width: auto; }\n.req-acts { display: flex; gap: 8px; margin-top: 8px; } .req-acts .btn { height: 34px; padding: 0 14px; font-size: 13px; }\n.dmark.wait { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\n.dmark.dl { border-style: solid; border-color: rgba(120,180,255,.55); color: #9ccaff; }\n.dmark.bad { border-style: solid; border-color: rgba(255,120,120,.55); color: #ff9b9b; }\n.nf-card.req .im .prog { left: 10px; right: 10px; bottom: 10px; }\n.nf-person { color: inherit; text-decoration: none; }\n.nf-person:hover .pi { outline: 2px solid rgba(255,255,255,.6); }\n.nf-logo { color: var(--accent-nf, #e50914) !important; }\n.nf-card .prog i, .nf-resume-bar i { background: var(--accent-nf, #fff); }\n\n/* Seerr modal, downloads, calendar, Aurral tiles */\n.sr-modal { width: min(720px, 100%); max-height: 92vh; overflow-y: auto; background: #17171a; border-radius: 26px; box-shadow: 0 30px 90px rgba(0,0,0,.7); border: 1px solid rgba(255,255,255,.08); color: #fff; font-family: \"Inter\", system-ui, sans-serif; }\n.sr-hero { position: relative; height: 240px; background: #222 center/cover; } .sr-hero::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #17171a, rgba(23,23,26,0) 70%); }\n.sr-close { position: absolute; z-index: 2; top: 14px; right: 14px; width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,.55); display: grid; place-items: center; }\n.sr-body { padding: 0 28px 28px; margin-top: -48px; position: relative; z-index: 1; }\n.sr-body h2 { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; }\n.sr-ov { color: #cfcfd5; line-height: 1.6; font-size: 15px; margin: 14px 0; }\n.sr-status { margin: 6px 0; }\n.sr-seasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }\n.sr-seasons .nf-chip.dis { opacity: .45; cursor: default; }\n.sr-cast { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; } .sr-cast span { font-size: 12.5px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.07); color: #cfcfd5; }\n.btn:disabled { opacity: .6; cursor: default; }\n.dl-box { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 20px 22px; margin: 0 0 26px; }\n.dl-box h2 { margin: 0 0 12px; font-size: 18px; }\n.dl-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, 320px); gap: 20px; align-items: center; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.dl-t { display: flex; flex-direction: column; min-width: 0; } .dl-t span { font-size: 12.5px; color: #8d8d95; margin-top: 2px; }\n.dl-p { display: flex; align-items: center; gap: 12px; } .dl-p .prog { position: static; flex: 1; height: 6px; border-radius: 6px; background: rgba(255,255,255,.14); overflow: hidden; } .dl-p .prog i { display: block; height: 100%; background: #fff; border-radius: 6px; } .dl-p b { font-size: 13px; width: 40px; text-align: right; }\n.cal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; } .cal-head b { font-size: 20px; min-width: 190px; text-align: center; text-transform: capitalize; }\n.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }\n.cal-dow { text-align: center; color: #8d8d95; font-size: 13px; font-weight: 600; padding: 4px 0; }\n.cal-day { min-height: 130px; background: #17171a; border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }\n.cal-day.other { opacity: .4; } .cal-day.today { border-color: rgba(255,255,255,.45); background: #1d1d22; }\n.cal-day .n { font-size: 13px; font-weight: 700; color: #cfcfd5; }\n.cal-ev { display: flex; align-items: center; gap: 6px; padding: 4px; border-radius: 10px; background: rgba(255,255,255,.06); cursor: pointer; min-width: 0; font-size: 12px; position: relative; }\n.cal-ev:hover { background: rgba(255,255,255,.14); }\n.cal-ev .p { width: 26px; height: 38px; border-radius: 5px; background: #333 center/cover; flex: none; }\n.cal-ev > span { font-weight: 600; flex: 1; min-width: 0; } .cal-ev small { position: absolute; left: 36px; bottom: 3px; color: #8d8d95; font-size: 10.5px; max-width: calc(100% - 40px); }\n.cal-ev.have { box-shadow: inset 3px 0 0 #34c759; } .cal-ev.digital { box-shadow: inset 3px 0 0 #bf5af2; } .cal-ev.physical { box-shadow: inset 3px 0 0 #ff9f0a; } .cal-ev.cinema { box-shadow: inset 3px 0 0 #0a84ff; } .cal-ev.episode { box-shadow: inset 3px 0 0 #64d2ff; }\n.cal-ev > span { padding-bottom: 12px; }\n@media (max-width: 800px) { .cal-grid { grid-template-columns: 1fr; } .cal-dow { display: none; } .cal-day.other { display: none; } .cal-day { min-height: 0; } .dl-row { grid-template-columns: 1fr; gap: 6px; } }\n.sp-tile .pbtn.busy { opacity: .5; pointer-events: none; }\n.sp-shelf { grid-auto-columns: minmax(170px, 220px); }\n@media (max-width: 800px) { .sp-shelf { grid-auto-columns: 40vw; } }\n\n/* ===== video player ===== */\n#cx-player { position: fixed; inset: 0; z-index: 9800; background: #000; color: #fff; font-family: \"Inter\", system-ui, sans-serif; overflow: hidden; user-select: none; }\n#cx-player video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }\n#cx-player video::cue { background: rgba(0,0,0,.65); color: #fff; font-size: 1.35em; border-radius: 4px; }\n#cx-player.idle { cursor: none; }\n.pl-top, .pl-bar { position: absolute; left: 0; right: 0; z-index: 3; transition: opacity .35s, transform .35s; }\n.pl-top { top: 0; display: flex; align-items: center; gap: 16px; padding: 22px 28px 60px; background: linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,0)); }\n.pl-bar { bottom: 0; padding: 70px 28px 22px; background: linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,0)); }\n#cx-player.idle .pl-top { opacity: 0; transform: translateY(-10px); pointer-events: none; }\n#cx-player.idle .pl-bar { opacity: 0; transform: translateY(10px); pointer-events: none; }\n.pl-back { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); display: grid; place-items: center; transition: background .2s, transform .15s; }\n.pl-back:hover { background: rgba(255,255,255,.24); transform: scale(1.06); }\n.pl-title { font-size: 20px; font-weight: 700; letter-spacing: -.01em; } .pl-sub { font-size: 14px; color: #cfcfd5; margin-top: 2px; }\n.pl-seek { position: relative; height: 18px; display: flex; align-items: center; cursor: pointer; margin-bottom: 8px; touch-action: none; }\n.pl-seek::before { content: \"\"; position: absolute; left: 0; right: 0; height: 5px; border-radius: 5px; background: rgba(255,255,255,.22); transition: height .15s; }\n.pl-seek:hover::before { height: 7px; }\n.pl-seek em { position: absolute; left: 0; height: 5px; border-radius: 5px; background: rgba(255,255,255,.28); pointer-events: none; }\n.pl-seek i { position: absolute; left: 0; height: 5px; border-radius: 5px; background: var(--accent-nf, #e50914); pointer-events: none; }\n.pl-seek:hover i, .pl-seek:hover em { height: 7px; }\n.pl-seek b { position: absolute; width: 16px; height: 16px; margin-left: -8px; border-radius: 50%; background: #fff; opacity: 0; transform: scale(.6); transition: .15s; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,.5); }\n.pl-seek:hover b { opacity: 1; transform: none; }\n.pl-bubble { position: absolute; bottom: 24px; transform: translateX(-50%); background: rgba(20,20,22,.92); padding: 4px 9px; border-radius: 8px; font-size: 12px; font-variant-numeric: tabular-nums; opacity: 0; pointer-events: none; transition: opacity .15s; }\n.pl-seek:hover .pl-bubble { opacity: 1; }\n.pl-row { display: flex; align-items: center; gap: 6px; }\n.pl-row button { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; transition: background .2s, transform .15s; position: relative; }\n.pl-row button:hover { background: rgba(255,255,255,.16); }\n.pl-row button:active { transform: scale(.92); }\n.pl-row .pl-pp { width: 52px; height: 52px; background: #fff; color: #000; } .pl-row .pl-pp:hover { background: #e8e8ea; }\n.pl-row svg { width: 26px; height: 26px; }\n.pl-skip small { position: absolute; font-size: 9px; font-weight: 800; margin-top: 2px; }\n.rot-l { display: inline-flex; transform: scaleX(-1); }\n.pl-time { font-size: 13px; font-variant-numeric: tabular-nums; color: #dadade; margin-left: 10px; }\n.pl-vol { display: flex; align-items: center; gap: 2px; margin-left: 4px; }\n.pl-vbar { position: relative; width: 0; opacity: 0; height: 18px; display: flex; align-items: center; cursor: pointer; transition: width .2s, opacity .2s; overflow: hidden; }\n.pl-vol:hover .pl-vbar { width: 84px; opacity: 1; margin-right: 8px; }\n.pl-vbar::before { content: \"\"; position: absolute; left: 0; right: 0; height: 4px; border-radius: 4px; background: rgba(255,255,255,.25); } .pl-vbar i { position: absolute; left: 0; height: 4px; border-radius: 4px; background: #fff; }\n.pl-btn-wrap { position: relative; }\n.pl-menu { position: absolute; right: 0; bottom: 56px; min-width: 200px; max-height: 50vh; overflow-y: auto; background: rgba(28,28,32,.96); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 8px; opacity: 0; transform: translateY(8px) scale(.97); pointer-events: none; transition: opacity .2s, transform .2s; }\n.pl-menu.open { opacity: 1; transform: none; pointer-events: auto; }\n.pl-menu .pl-mh { padding: 8px 12px; font-size: 12px; color: #8d8d95; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }\n.pl-row .pl-menu button { width: 100%; height: auto; border-radius: 10px; padding: 10px 12px; justify-content: flex-start; display: flex; text-align: left; font-size: 14px; }\n.pl-row .pl-menu button.on { background: rgba(255,255,255,.12); } .pl-row .pl-menu button.on::after { content: \"✓\"; margin-left: auto; }\n.pl-center { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; flex-direction: column; gap: 16px; z-index: 2; pointer-events: none; }\n#cx-player.loading .pl-center { display: flex; }\n.pl-spin { width: 54px; height: 54px; border: 4px solid rgba(255,255,255,.18); border-top-color: #fff; border-radius: 50%; animation: cxspin .8s linear infinite; }\n.pl-status { font-size: 14px; color: #cfcfd5; min-height: 20px; }\n.pl-err { position: absolute; inset: 0; z-index: 4; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: rgba(0,0,0,.82); text-align: center; padding: 24px; }\n#cx-player.err .pl-err { display: flex; } #cx-player.err .pl-center { display: none; }\n.pl-err b { font-size: 22px; } .pl-errmsg { color: #b9b9c0; max-width: 520px; margin: 0 0 12px; }\n.pl-next { position: absolute; right: 28px; bottom: 120px; z-index: 3; display: none; }\n#cx-player.has-next.idle .pl-next { display: none; }\n@media (max-width: 800px) { .pl-top { padding: 14px 14px 40px; } .pl-bar { padding: 50px 14px 14px; } .pl-vol, .pl-time { display: none; } .pl-row button { width: 40px; height: 40px; } .pl-row .pl-pp { width: 48px; height: 48px; } }\n\n/* ===== v7 polish ===== */\n.nf-nav { gap: 14px; }\n.nf-links { gap: 2px; align-items: center; }\n.nf-links .nf-more { margin-left: 2px; }\n.nf-links .nf-pillbtn { padding: 9px 12px; }\n:is(#cx, #cx-ui) input[type=\"text\"], :is(#cx, #cx-ui) input[type=\"search\"] { -webkit-appearance: none; appearance: none; outline: 0 !important; box-shadow: none !important; border: 0 !important; background: transparent !important; border-radius: 0 !important; height: auto !important; padding-block: 0 !important; color: #fff; }\n.nf-search { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); }\n.nf-search.open { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3); }\n.nf-search:not(.open) { background: transparent; border-color: transparent; }\n.sp-hsearch input { height: 100% !important; }\n\n/* peek: smoother + poster variant */\n.nf-peek { transform-origin: center center; will-change: transform, opacity; transition: opacity .22s ease, transform .32s cubic-bezier(.16,1,.3,1); transform: translateY(10px) scale(.9); }\n.nf-peek.show { transform: none; }\n.nf-peek.show .pb { animation: cxfade .32s .06s both; }\n.nf-peek.poster .pi { aspect-ratio: 3/4; }\n.nf-peek.poster .pt { font-size: 17px; }\n.nf-peek.poster .po { display: none; }\n\n/* detail pages: full width */\n.nf-dbody { max-width: none; }\n.nf-dinfo { max-width: min(860px, 100%); }\n.nf-person { width: 132px; font-size: 13.5px; }\n.nf-person .pi { width: 132px; height: 132px; transition: transform .25s, outline-color .2s; outline: 2px solid transparent; }\n.nf-person:hover .pi { transform: scale(1.05); outline-color: rgba(255,255,255,.55); }\n.nf-cast { gap: 22px; }\n.nf-sect { margin-right: 0; }\n\n/* media info panel */\n.mi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }\n.mi-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); border-radius: 18px; padding: 16px 18px; }\n.mi-card h4 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #8d8d95; font-weight: 600; }\n.mi-card div { font-size: 14px; color: #e4e4e8; line-height: 1.6; } .mi-card span { color: #8d8d95; }\n.mi-pills { display: flex; flex-wrap: wrap; gap: 6px; } .mi-pills i { font-style: normal; font-size: 12.5px; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.08); }\n.rt-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 4px 0 14px; }\n.rt-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.08); font-size: 13px; font-weight: 600; }\n.rt-chip small { color: #9a9aa2; font-weight: 500; }\n\n/* menus: nicer hover */\n.sp-menu { background: rgba(30,30,34,.97) !important; backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.08); border-radius: 18px !important; padding: 8px !important; box-shadow: 0 24px 60px rgba(0,0,0,.6) !important; animation: cxpop .16s cubic-bezier(.16,1,.3,1) both; transform-origin: top left; min-width: 240px; }\n@keyframes cxpop { from { opacity: 0; transform: scale(.96) translateY(-4px); } to { opacity: 1; transform: none; } }\n.sp-menu button { border-radius: 12px !important; padding: 10px 12px !important; gap: 12px !important; font-size: 14px; color: #e8e8ec; transition: background .15s, transform .12s; position: relative; }\n.sp-menu button svg { opacity: .65; transition: opacity .15s, transform .15s; }\n.sp-menu button:hover { background: rgba(255,255,255,.1) !important; }\n.sp-menu button:hover svg { opacity: 1; transform: scale(1.1); }\n.sp-menu button:active { transform: scale(.98); }\n.sp-menu hr { margin: 6px 6px !important; border-top-color: rgba(255,255,255,.08) !important; }\n.nf-pop { animation: cxpop .16s cubic-bezier(.16,1,.3,1) both; }\n.nf-pop a, .nf-pop button { transition: background .15s; }\n.nf-pop .pop-sep { height: 1px; background: rgba(255,255,255,.08); margin: 6px 8px; }\n.nf-pop .pop-h { padding: 8px 14px 4px; font-size: 11.5px; color: #8d8d95; text-transform: uppercase; letter-spacing: .08em; }\n.nf-pop .mi { font-family: \"Material Icons\", \"Material Symbols Rounded\"; font-size: 18px; width: 18px; opacity: .8; }\n\n/* filters bar (discover) */\n.dc-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 0 var(--pad) 18px; }\n.dc-bar select, .dc-bar input[type=text] { height: 40px; padding: 0 14px; border-radius: 999px; background: rgba(255,255,255,.08); color: #fff; font: inherit; border: 1px solid transparent; }\n.dc-bar select:focus, .dc-bar input[type=text]:focus { border-color: rgba(255,255,255,.4); }\n.dc-bar input[type=text] { min-width: 220px; padding-left: 16px !important; background: rgba(255,255,255,.08) !important; border-radius: 999px !important; }\n.dc-bar .nf-chip.on { background: #fff; color: #000; }\n.dc-bar label { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: #cfcfd5; cursor: pointer; }\n.dc-end { text-align: center; color: #8d8d95; padding: 30px; }\n.dc-more { margin: 10px var(--pad) 0; }\n\n/* ===== v8: external tracks, harvest, cta ===== */\n.sp-row .xb { display: inline-block; margin-left: 8px; padding: 1px 8px; border-radius: 999px; border: 1px dashed rgba(255,255,255,.4); font-size: 10.5px; font-weight: 600; color: #cfcfd5; vertical-align: middle; letter-spacing: .01em; }\n.sp-row .du .lk.rq { opacity: 1; color: #fff; background: rgba(255,255,255,.1); border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center; }\n.sp-row .du .lk.rq:hover { background: rgba(255,255,255,.22); }\n.sp-row .du .lk.rq svg { width: 16px; height: 16px; }\n.notown-tile .cv { filter: saturate(.8) brightness(.92); }\n.sp-disc-cta { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 28px 0 0; padding: 18px 22px; border-radius: 18px; background: linear-gradient(120deg, rgba(30,215,96,.18), rgba(255,255,255,.04)); }\n.sp-disc-cta b { display: block; font-size: 17px; } .sp-disc-cta span { color: #b3b3b3; font-size: 14px; }\nhtml.cx-harvest .MuiPopover-root, html.cx-harvest .MuiMenu-root, html.cx-harvest .MuiBackdrop-root { opacity: 0 !important; pointer-events: none !important; transition: none !important; }\n.plug-slot:empty { display: none; }\n.rt-chip small { margin-left: 4px; }\n.sp-row.ext .tn { color: #c9c9ce; } .sp-row .ta .xb { margin-left: 8px; }\n.nf-pop { min-width: 260px; } .nf-pop a, .nf-pop button { white-space: nowrap; }\n\n/* ===== v9: fixes ===== */\n.nf-card { min-width: 0; }\nselect option { background: #1c1c20; color: #fff; }\n.dc-bar select { color-scheme: dark; appearance: none; -webkit-appearance: none; padding-right: 34px; background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='white' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>\"); background-repeat: no-repeat; background-position: right 14px center; }\n\n/* native dialogs (metadata editor etc.): never show the old page behind them */\nhtml.cx-nativecmd #reactRoot > *:not(.MuiDialog-root):not(.MuiPopover-root), html.cx-nativecmd .skinBody, html.cx-nativecmd .page { visibility: hidden !important; }\nhtml.cx-nativecmd .dialogContainer, html.cx-nativecmd dialog, html.cx-nativecmd .MuiDialog-root, html.cx-nativecmd .MuiPopover-root { visibility: visible !important; }\nhtml.cx-nativecmd body { background: #0d0d0f !important; }\n\n/* preferences menu rows: single clean surface */\nhtml.cx-ready .listItem-border .listItem, html.cx-ready .listItem-border .listItem:hover { background: transparent !important; border-radius: inherit !important; }\nhtml.cx-ready a.listItem-border { transition: background .2s, transform .2s, box-shadow .2s; }\nhtml.cx-ready a.listItem-border:hover { background: #26262c !important; transform: translateX(4px); box-shadow: 0 6px 20px rgba(0,0,0,.35); }\nhtml.cx-ready a.listItem-border:active { transform: translateX(2px) scale(.995); }\nhtml.cx-ready .listItem-border:hover .listItemIcon { background: rgba(255,255,255,.18) !important; transform: scale(1.06); }\nhtml.cx-ready .listItem-border .listItemIcon { transition: background .2s, transform .2s; }\n\n/* mobile */\n.m-only { display: none !important; }\n@media (max-width: 800px) {\n  .m-only { display: flex !important; }\n  #cx-nf, .sp-scroll, .sp-liblist { scrollbar-width: none; -ms-overflow-style: none; }\n  #cx-nf::-webkit-scrollbar, .sp-scroll::-webkit-scrollbar, .sp-liblist::-webkit-scrollbar { display: none; width: 0; height: 0; }\n  .nf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n  .sp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .nf-grid .nf-card, .nf-grid .nf-card.poster { width: 100%; }\n  .req-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n  .nf-grid .nf-card .title { font-size: 11.5px; }\n  .nf-hero { margin-left: 12px; margin-right: 12px; }\n  .nf-card.poster { width: 30vw; } .nf-card { width: 52vw; }\n  .cx-tabs { left: 14px; right: 14px; height: 58px; }\n  .nf-pop { max-height: 70vh; overflow-y: auto; }\n}\n\n/* ===== player v2 ===== */\n#cx-player svg { width: 24px; height: 24px; fill: currentColor; }\n#cx-player svg path { stroke: none; }\n#cx-player svg text { stroke: none; }\n.pl-ttl { min-width: 0; flex: 1; }\n.pl-round { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); display: grid; place-items: center; }\n.pl-round:hover { background: rgba(255,255,255,.24); }\n.pl-back svg { width: 26px; height: 26px; }\n.pl-top, .pl-bar { transition: opacity .4s ease, transform .4s cubic-bezier(.16,1,.3,1); }\n.pl-bar { padding: 90px 32px 22px; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.55) 45%, rgba(0,0,0,0) 100%); }\n.pl-row { gap: 4px; }\n.pl-row > button, .pl-btn-wrap > button { width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; transition: background .18s, transform .15s; }\n.pl-row > button:hover, .pl-btn-wrap > button:hover { background: rgba(255,255,255,.16); }\n.pl-row .pl-pp { width: 54px; height: 54px; background: #fff; color: #000; margin-right: 4px; }\n.pl-row .pl-pp svg { width: 28px; height: 28px; }\n.pl-skip svg { width: 30px; height: 30px; }\n.pl-row svg { width: 26px; height: 26px; }\n.pl-btn-next, .pl-btn-eps.hide, .pl-btn-chap.hide { display: none; }\n#cx-player.has-next .pl-btn-next { display: block; }\n[data-tip] { position: relative; }\n[data-tip]::before { content: attr(data-tip); position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translate(-50%, 4px); background: rgba(20,20,22,.95); color: #fff; font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 8px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 10; }\n.pl-bar [data-tip]:hover::before { opacity: 1; transform: translate(-50%, 0); }\n.pl-top [data-tip]::before { bottom: auto; top: calc(100% + 8px); }\n.pl-top [data-tip]:hover::before { opacity: 1; }\n.pl-chapters i { position: absolute; top: 50%; width: 3px; height: 5px; margin-top: -2.5px; margin-left: -1.5px; background: rgba(0,0,0,.75); pointer-events: none; z-index: 1; }\n.pl-seek i, .pl-seek em, .pl-seek::before { height: 5px; }\n.pl-seek:hover i, .pl-seek:hover em, .pl-seek:hover::before { height: 8px; }\n.pl-bubble { bottom: 26px; display: flex; flex-direction: column; align-items: center; gap: 6px; background: transparent; padding: 0; }\n.pl-bubble span { background: rgba(20,20,22,.95); padding: 4px 10px; border-radius: 8px; font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }\n.pl-thumb { display: none; border-radius: 10px; border: 2px solid rgba(255,255,255,.9); background-color: #111; box-shadow: 0 8px 24px rgba(0,0,0,.6); }\n.pl-menu { bottom: 62px; border-radius: 18px; min-width: 230px; max-width: 340px; }\n.pl-menu button { display: flex !important; align-items: center; gap: 10px; width: 100%; padding: 10px 12px !important; height: auto !important; border-radius: 10px !important; text-align: left; font-size: 14px; justify-content: space-between !important; }\n.pl-menu button img { width: 72px; height: 40px; object-fit: cover; border-radius: 6px; }\n.pl-menu button span { flex: 1; min-width: 0; } .pl-menu button small { color: #9a9aa2; font-size: 11.5px; }\n.pl-menu button.on { background: rgba(255,255,255,.12); } .pl-menu button.on::after { content: \"✓\"; font-size: 13px; }\n.pl-sep { height: 1px; background: rgba(255,255,255,.1); margin: 6px 4px; }\n\n/* subtitles: own renderer, below the picture centre, never glued to the edge */\n.pl-subs { position: absolute; left: 6%; right: 6%; bottom: var(--sub-pos, 9%); z-index: 2; text-align: center; pointer-events: none; transition: bottom .35s cubic-bezier(.16,1,.3,1); font-size: var(--sub-size, 1.9vw); font-weight: var(--sub-weight, 500); color: var(--sub-color, #fff); line-height: 1.32; display: flex; flex-direction: column; align-items: center; gap: 4px; }\n#cx-player:not(.idle) .pl-subs { bottom: calc(var(--sub-pos, 9%) + 86px); }\n.pl-subline { display: inline-block; max-width: 100%; padding: 2px 10px; border-radius: 8px; letter-spacing: .005em; }\n#cx-player[data-subbg=\"shadow\"] .pl-subline { text-shadow: 0 0 3px #000, 0 1px 3px #000, 0 2px 8px rgba(0,0,0,.9); }\n#cx-player[data-subbg=\"box\"] .pl-subline { background: rgba(0,0,0,.62); }\n#cx-player[data-subbg=\"none\"] .pl-subline { text-shadow: 0 1px 2px #000; }\n#cx-player[data-subfont=\"serif\"] .pl-subs { font-family: Georgia, \"Times New Roman\", serif; } #cx-player[data-subfont=\"mono\"] .pl-subs { font-family: ui-monospace, Consolas, monospace; } #cx-player[data-subfont=\"sans\"] .pl-subs { font-family: \"Inter\", system-ui, sans-serif; }\n.pl-subline i { font-style: italic; } .pl-subline b { font-weight: 800; }\n\n/* settings panel */\n.pl-settings { position: absolute; right: 24px; bottom: 96px; width: min(400px, calc(100% - 32px)); max-height: 70vh; overflow-y: auto; z-index: 6; background: rgba(24,24,28,.96); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.09); border-radius: 22px; padding: 14px; box-shadow: 0 24px 70px rgba(0,0,0,.65); opacity: 0; transform: translateY(12px) scale(.97); pointer-events: none; transition: opacity .2s, transform .28s cubic-bezier(.16,1,.3,1); }\n.pl-settings.open { opacity: 1; transform: none; pointer-events: auto; }\n.pl-stabs { display: flex; gap: 4px; margin-bottom: 10px; align-items: center; }\n.pl-stabs button { padding: 8px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #b9b9c0; } .pl-stabs button.on { background: #fff; color: #000; } .pl-stabs button:not(.on):hover { background: rgba(255,255,255,.1); }\n.pl-stabs .pl-sclose { margin-left: auto; width: 32px; height: 32px; padding: 0; display: grid; place-items: center; } .pl-stabs .pl-sclose svg { width: 18px; height: 18px; }\n.pl-srow { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 6px; border-top: 1px solid rgba(255,255,255,.06); }\n.pl-srow b { display: block; font-size: 14px; font-weight: 600; } .pl-srow small { display: block; color: #8d8d95; font-size: 12px; margin-top: 3px; max-width: 200px; }\n.pl-seg { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 4px; background: rgba(255,255,255,.07); padding: 3px; border-radius: 999px; }\n.pl-seg button { padding: 6px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: #cfcfd5; transition: background .15s; } .pl-seg button.on { background: #fff; color: #000; }\n.pl-subpreview { margin-top: 10px; height: 76px; border-radius: 14px; background: linear-gradient(135deg, #3a4a6a, #1f2a40); display: grid; place-items: center; font-size: 18px; color: var(--sub-color, #fff); font-weight: var(--sub-weight, 500); }\n#cx-player[data-subbg=\"shadow\"] .pl-subpreview span { text-shadow: 0 0 3px #000, 0 2px 8px #000; } #cx-player[data-subbg=\"box\"] .pl-subpreview span { background: rgba(0,0,0,.62); padding: 2px 10px; border-radius: 8px; }\n.pl-key { display: flex; align-items: center; gap: 12px; padding: 7px 6px; font-size: 13.5px; } .pl-key kbd { min-width: 96px; font: inherit; font-size: 12px; background: rgba(255,255,255,.1); border-radius: 8px; padding: 4px 9px; text-align: center; }\n\n/* stats */\n.pl-stats { position: absolute; top: 90px; right: 28px; z-index: 4; background: rgba(15,15,18,.85); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 12px 16px; min-width: 260px; display: none; font-size: 12.5px; }\n.pl-stats.open { display: block; } .pl-stats div { display: flex; justify-content: space-between; gap: 20px; padding: 3px 0; } .pl-stats span { color: #9a9aa2; } .pl-stats b { font-weight: 600; }\n\n/* skip segment + next episode */\n.pl-skipseg { position: absolute; right: 32px; bottom: 140px; z-index: 5; opacity: 0; transform: translateY(10px); pointer-events: none; transition: .3s cubic-bezier(.16,1,.3,1); height: 44px; font-size: 14px; }\n.pl-skipseg.show { opacity: 1; transform: none; pointer-events: auto; } .pl-skipseg svg { width: 20px; height: 20px; }\n.pl-nextcard { position: absolute; right: 32px; bottom: 140px; z-index: 5; width: 320px; padding: 16px; border-radius: 20px; background: rgba(24,24,28,.94); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.1); opacity: 0; transform: translateY(12px); pointer-events: none; transition: .3s cubic-bezier(.16,1,.3,1); }\n.pl-nextcard.show { opacity: 1; transform: none; pointer-events: auto; } .pl-nc-s { font-size: 12px; color: #9a9aa2; margin-bottom: 4px; } .pl-nc-t { font-weight: 700; margin-bottom: 12px; }\n.pl-nextcard .btn { height: 38px; font-size: 13px; padding: 0 16px 0 12px; } .pl-nextcard svg { width: 18px; height: 18px; }\n\n/* flash icons + tap zones */\n.pl-flash { position: absolute; left: 50%; top: 50%; z-index: 4; transform: translate(-50%, -50%) scale(.8); width: 84px; height: 84px; border-radius: 50%; background: rgba(0,0,0,.5); display: grid; place-items: center; opacity: 0; pointer-events: none; font-weight: 700; font-size: 16px; }\n.pl-flash.show { animation: plflash .5s ease both; } .pl-flash.icon svg { width: 38px; height: 38px; }\n.pl-flash.l { left: 22%; } .pl-flash.r { left: 78%; }\n@keyframes plflash { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.7); } 25% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); } }\n.pl-tap { position: absolute; top: 14%; bottom: 24%; width: 32%; z-index: 1; display: none; } .pl-tap.l { left: 0; } .pl-tap.r { right: 0; }\n@media (pointer: coarse) { .pl-tap { display: block; } }\n.pl-vol:hover .pl-vbar { width: 90px; }\n@media (max-width: 800px) {\n  .pl-bar { padding: 60px 14px 14px; } .pl-settings { right: 10px; left: 10px; width: auto; bottom: 80px; } .pl-skipseg, .pl-nextcard { right: 14px; bottom: 120px; }\n  .pl-row > button, .pl-btn-wrap > button { width: 42px; height: 42px; } .pl-row .pl-pp { width: 48px; height: 48px; } .pl-time { margin-left: 4px; } .pl-time .sl { display: none; } .pl-time span:last-child { display: none; }\n  [data-tip]::before { display: none; }\n  .pl-subs { font-size: clamp(14px, 3.6vw, 22px); } #cx-player:not(.idle) .pl-subs { bottom: calc(var(--sub-pos, 9%) + 70px); }\n}\n\n/* ===== v11: user menu, settings layout, card scale ===== */\n.nf-card { width: calc(clamp(200px, 17.5vw, 340px) * var(--cs, 1)); }\n.nf-card.poster { width: calc(clamp(130px, 11.4vw, 220px) * var(--cs, 1)); }\n.nf-grid .nf-card, .nf-grid .nf-card.poster, .req-grid .nf-card { width: auto; }\n@media (max-width: 800px) { .nf-card { width: calc(52vw * var(--cs, 1)); } .nf-card.poster { width: calc(30vw * var(--cs, 1)); } .nf-grid .nf-card, .nf-grid .nf-card.poster { width: 100%; } }\n\n/* top-right account menu */\n.nf-pop.nf-user { width: 320px; padding: 10px; border-radius: 22px; max-height: min(78vh, 720px); overflow-y: auto; top: 54px; }\n.um-head { display: flex; align-items: center; gap: 14px; padding: 12px 12px 14px; }\n.um-av { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-nf, #e50914), #6b0710); display: grid; place-items: center; font-weight: 800; font-size: 20px; flex: none; }\n.um-name { font-weight: 700; font-size: 16px; letter-spacing: -.01em; } .um-head span { font-size: 12.5px; color: #8d8d95; }\n.um-sec { padding: 6px 0; border-top: 1px solid rgba(255,255,255,.07); } .um-sec:empty { display: none; }\n.um-h { padding: 8px 12px 4px; font-size: 11px; color: #8d8d95; text-transform: uppercase; letter-spacing: .09em; font-weight: 600; }\n.nf-pop .um-item { display: flex !important; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 14px; transition: background .18s, transform .18s; position: relative; }\n.nf-pop .um-item:hover { background: rgba(255,255,255,.09); transform: translateX(3px); }\n.nf-pop .um-item:active { transform: translateX(1px) scale(.99); }\n.um-ic { width: 36px; height: 36px; border-radius: 11px; background: rgba(255,255,255,.08); display: grid; place-items: center; flex: none; transition: background .18s, transform .18s; }\n.um-item:hover .um-ic { background: var(--accent-nf, #e50914); transform: scale(1.06) rotate(-4deg); }\n.um-ic .material-icons { font-size: 19px; }\n.um-l { flex: 1; font-size: 14.5px; font-weight: 500; } .um-ch { width: 16px !important; height: 16px !important; opacity: 0; transform: translateX(-4px); transition: .18s; } .um-item:hover .um-ch { opacity: .6; transform: none; }\n.um-danger:hover .um-ic { background: #c0392b; }\n.um-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; font-size: 14px; }\n.nf-pop.nf-user .m-only { display: none !important; } @media (max-width: 800px) { .nf-pop.nf-user .m-only { display: flex !important; } .nf-pop.nf-user .um-sec.m-only { display: block !important; } .nf-pop.nf-user { position: fixed; right: 10px; left: 10px; width: auto; top: 62px; } }\n\n/* settings */\n.set-wrap { max-width: 1180px; margin: 0 auto; }\n.set-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 28px; align-items: start; }\n.set-nav { position: sticky; top: 92px; display: flex; flex-direction: column; gap: 4px; }\n.set-nav button { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; text-align: left; font-size: 14.5px; font-weight: 500; color: #c9c9d0; transition: background .18s, color .18s, transform .18s; }\n.set-nav button:hover { background: rgba(255,255,255,.07); color: #fff; transform: translateX(2px); }\n.set-nav button.on { background: #fff; color: #000; font-weight: 600; }\n.set-body { min-width: 0; }\n.set-card { padding: 24px 26px; } .set-card h3 { font-size: 19px; margin-bottom: 8px; }\n.set-row.locked { opacity: .55; pointer-events: none; }\n.set-ctl { display: flex; align-items: center; gap: 10px; flex: none; }\n.set-reset { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: #8d8d95; background: rgba(255,255,255,.06); } .set-reset:hover { color: #fff; background: rgba(255,255,255,.14); }\n.set-seg { background: rgba(255,255,255,.07); }\n.set-sw { display: flex; gap: 8px; } .set-sw button { width: 26px; height: 26px; border-radius: 50%; border: 2px solid transparent; transition: transform .15s; } .set-sw button:hover { transform: scale(1.15); } .set-sw button.on { border-color: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,.6) inset; }\n.set-svc { display: flex; align-items: center; gap: 14px; padding: 12px 4px; border-top: 1px solid rgba(255,255,255,.06); } .set-svc:first-of-type { border-top: 0; }\n.set-svc i { width: 10px; height: 10px; border-radius: 50%; background: #5a5a62; flex: none; } .set-svc i.ok { background: #34c759; box-shadow: 0 0 0 4px rgba(52,199,89,.18); }\n.set-svc > div { flex: 1; } .set-svc b { display: block; font-size: 15px; } .set-svc span { font-size: 12.5px; color: #8d8d95; }\n.set-about { font-size: 14px; color: #cfcfd5; display: flex; flex-direction: column; gap: 12px; } .set-about a { text-decoration: underline; }\ncode { background: rgba(255,255,255,.08); padding: 4px 9px; border-radius: 8px; font-size: 13px; }\n@media (max-width: 800px) { .set-layout { grid-template-columns: 1fr; } .set-nav { position: static; flex-direction: row; overflow-x: auto; scrollbar-width: none; } .set-nav button { white-space: nowrap; padding: 9px 14px; } .set-card { padding: 18px; } .set-row { flex-wrap: wrap; } }\n.nf-pop .set-switch { width: 46px !important; height: 26px; flex: none; padding: 0 !important; display: block !important; } .um-row { gap: 12px; } .um-row span { flex: 1; }\n\n/* ===== v12: Lucide icons, player + layout fixes ===== */\r\n:is(#cx, #cx-ui) svg.lu { fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }\r\n:is(#cx, #cx-ui) svg.lu.lu-fill { fill: currentColor; }\r\n:is(#cx, #cx-ui) svg.lu * { stroke-width: inherit; }\r\n:is(#cx, #cx-ui) .ic-s svg.lu { stroke-width: 2.2; }\r\n:is(#cx, #cx-ui) svg.lu path, :is(#cx, #cx-ui) svg.lu polygon, :is(#cx, #cx-ui) svg.lu line, :is(#cx, #cx-ui) svg.lu polyline, :is(#cx, #cx-ui) svg.lu rect, :is(#cx, #cx-ui) svg.lu circle { stroke: currentColor; stroke-width: inherit; }\r\n:is(#cx, #cx-ui) svg.lu.lu-fill path, :is(#cx, #cx-ui) svg.lu.lu-fill polygon, :is(#cx, #cx-ui) svg.lu.lu-fill rect { fill: currentColor; }\r\n#cx-player svg.lu { fill: none; stroke: currentColor; stroke-width: 1.8; } #cx-player svg.lu.lu-fill { fill: currentColor; }\r\n#cx-player svg.lu path, #cx-player svg.lu polygon, #cx-player svg.lu line, #cx-player svg.lu polyline, #cx-player svg.lu rect, #cx-player svg.lu circle { stroke: currentColor; stroke-width: inherit; }\r\n#cx-player svg.lu.lu-fill path, #cx-player svg.lu.lu-fill polygon, #cx-player svg.lu.lu-fill rect { fill: currentColor; }\r\n#cx-player svg.lu text { fill: currentColor; stroke: none; }\r\n.pl-row .pl-pp svg { width: 26px; height: 26px; stroke-width: 2; }\r\n.pl-skip svg { width: 32px; height: 32px; stroke-width: 1.6; }\r\n\r\n/* seek knob follows instantly */\r\n.pl-seek b { transition: opacity .15s, transform .15s !important; }\r\n.pl-seek i, .pl-seek em { transition: none !important; }\r\n.pl-bubble span { width: auto !important; text-align: center !important; }\r\n\r\n/* sections inside detail pages keep the page padding */\r\n.nf-sect .nf-row h2 { margin: 0 var(--pad) 12px; }\r\n.nf-sect .nf-scroller { padding-left: var(--pad); padding-right: var(--pad); }\r\n\r\n/* cast photos: keep heads in frame */\r\n.nf-person .pi { background-position: center 18%; background-size: cover; }\r\n.nf-dposter { background-position: center top; }\r\n\r\n/* native menu entries list */\r\n.sp-menu .mi { font-family: \"Material Icons\"; font-size: 18px; width: 18px; opacity: .7; }\r\nhtml.cx-harvest .actionSheet, html.cx-harvest .dialogContainer, html.cx-harvest .dialogBackdrop, html.cx-harvest .dialogBackdropOpened, html.cx-harvest dialog { opacity: 0 !important; pointer-events: none !important; transition: none !important; }\r\n\n/* ===== v13: native frame, neutral avatar, cast, modals ===== */\n.cx-nframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; z-index: 9650; background: transparent; opacity: 0; pointer-events: none; color-scheme: dark; }\n.cx-nframe.show { opacity: 1; pointer-events: auto; }\n#cx-lite { position: fixed; inset: 0; z-index: 9640; display: none; place-items: center; background: rgba(0,0,0,.35); backdrop-filter: blur(3px); }\n#cx-lite.show { display: grid; }\n\n/* avatar + account menu: neutral, no heavy red */\n.nf-avatar, .um-av { background: #2c2c33 !important; color: #fff; border: 1px solid rgba(255,255,255,.14); box-shadow: none; font-weight: 700; }\n.nf-avatar { transition: background .2s, border-color .2s; } .nf-menu-wrap > button:hover .nf-avatar { background: #3a3a43 !important; border-color: rgba(255,255,255,.3); }\n.um-item:hover .um-ic { background: rgba(255,255,255,.18) !important; transform: scale(1.05); }\n.um-danger:hover .um-ic { background: rgba(255,69,58,.28) !important; }\n.um-av { font-size: 19px; }\n\n/* cast: full-bleed scroller with end padding */\n.nf-cast { margin-right: calc(-1 * var(--pad)); padding-right: var(--pad); scroll-padding-right: var(--pad); }\n.nf-cast .nf-person:last-child { margin-right: var(--pad); }\n.nf-sect .nf-scroller { padding-right: var(--pad); }\n.nf-person { flex: none; }\n.nf-person .pi { background-color: #26262c; }\n\n/* ===== v14: request modal 2, native dialogs ===== */\n.sr-modal { width: min(1000px, 100%); max-height: 92vh; border-radius: 28px; }\n.sr-hero { height: 260px; }\n.sr-body { padding: 0 34px 32px; margin-top: -90px; }\n.sr-top { display: flex; gap: 26px; align-items: flex-end; }\n.sr-poster { width: 190px; aspect-ratio: 2/3; border-radius: 16px; background: #26262c center/cover; box-shadow: 0 20px 50px rgba(0,0,0,.6); flex: none; }\n.sr-head { min-width: 0; flex: 1; padding-bottom: 4px; }\n.sr-head h2 { margin: 0 0 6px; } .sr-head h2 span { font-weight: 500; color: #9a9aa2; font-size: .7em; }\n.sr-facts { grid-template-columns: 150px 1fr; margin-top: 18px; }\n.sr-castw { margin-top: 26px; } .sr-castw h3 { margin: 0 0 12px; font-size: 18px; }\n.sr-cast2 { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: thin; }\n.sr-p { flex: none; width: 96px; text-align: center; font-size: 12.5px; } .sr-p .pi { width: 96px; height: 96px; border-radius: 50%; background: #26262c center 18%/cover; margin-bottom: 8px; } .sr-p b { display: block; font-weight: 600; } .sr-p small { display: block; color: #8d8d95; margin-top: 2px; }\n.sr-adv { margin: 14px 0; background: rgba(255,255,255,.04); border-radius: 16px; padding: 4px 16px; } .sr-adv summary { cursor: pointer; padding: 10px 0; font-weight: 600; font-size: 14px; }\n.sr-opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 4px 0 14px; } .sr-opt label { display: block; font-size: 12px; color: #9a9aa2; margin-bottom: 5px; font-weight: 600; }\n.sr-opt select { width: 100%; height: 40px; padding: 0 12px; border-radius: 12px; background: #202026; color: #fff; border: 1px solid rgba(255,255,255,.1); font: inherit; }\n@media (max-width: 800px) { .sr-top { flex-direction: column; align-items: flex-start; } .sr-poster { width: 120px; } .sr-body { padding: 0 18px 24px; } .sr-facts { grid-template-columns: 110px 1fr; } }\n\n/* native dialogs (metadata editor, image editor, identify, ...) */\nhtml.cx-ready .dialogBackdropOpened, html.cx-ready .dialogBackdrop { background: rgba(0,0,0,.62) !important; backdrop-filter: blur(10px); }\nhtml.cx-ready .formDialog, html.cx-ready dialog.formDialog, html.cx-ready .dialog:not(.actionsheet) { background: #17171b !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 26px !important; box-shadow: 0 40px 100px rgba(0,0,0,.7) !important; color: #ececf0; overflow: hidden; }\nhtml.cx-ready .formDialogHeader { background: transparent !important; padding: 12px 18px !important; border-bottom: 1px solid rgba(255,255,255,.06); }\nhtml.cx-ready .formDialogHeaderTitle { font-weight: 700; font-size: 18px; letter-spacing: -.01em; }\nhtml.cx-ready .formDialogContent { padding: 8px 6px; }\nhtml.cx-ready .formDialogFooter { background: rgba(255,255,255,.03) !important; border-top: 1px solid rgba(255,255,255,.06); padding: 14px 22px; }\nhtml.cx-ready .formDialog h2, html.cx-ready .formDialog .sectionTitle { font-weight: 700; letter-spacing: -.01em; }\nhtml.cx-ready .formDialog .card .cardBox, html.cx-ready .formDialog .cardBox { background: #202026 !important; border: 1px solid rgba(255,255,255,.06); border-radius: 20px !important; padding: 12px 12px 10px; transition: transform .2s, background .2s, border-color .2s; }\nhtml.cx-ready .formDialog .cardBox:hover { background: #26262d !important; border-color: rgba(255,255,255,.14); transform: translateY(-2px); }\nhtml.cx-ready .formDialog .cardImageContainer, html.cx-ready .formDialog .cardImage { border-radius: 12px !important; background-color: #14141a; }\nhtml.cx-ready .formDialog .cardText { color: #e4e4e8; }\nhtml.cx-ready .formDialog .cardText-secondary { color: #8d8d95; }\nhtml.cx-ready .formDialog .paper-icon-button-light, html.cx-ready .formDialog .emby-button.paper-icon-button-light { width: 40px; height: 40px; border-radius: 50% !important; background: rgba(255,255,255,.08); color: #e8e8ec; transition: background .18s, transform .15s; }\nhtml.cx-ready .formDialog .paper-icon-button-light:hover { background: rgba(255,255,255,.18); transform: scale(1.06); }\nhtml.cx-ready .formDialog [class*=\"accent\"], html.cx-ready .formDialog .button-accent, html.cx-ready .formDialog .emby-button.button-accent { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .formDialog .fab, html.cx-ready .formDialog .btnBrowseAllImages, html.cx-ready .formDialog .fab.mini { background: rgba(255,255,255,.12) !important; color: #fff !important; box-shadow: none !important; }\nhtml.cx-ready .formDialog .fab:hover { background: rgba(255,255,255,.24) !important; }\nhtml.cx-ready .formDialog .emby-checkbox:checked + span + .checkboxOutline, html.cx-ready .formDialog .emby-checkbox:checked + span { background: #fff !important; }\nhtml.cx-ready .formDialog a,html.cx-ready .formDialog .button-link { color: #cfd3ff; }\nhtml.cx-ready .formDialog .emby-input, html.cx-ready .formDialog .emby-select, html.cx-ready .formDialog textarea { background: #202026 !important; }\nhtml.cx-ready .formDialog .checkboxContainer, html.cx-ready .formDialog .selectContainer { border-radius: 14px; }\nhtml.cx-ready .formDialog button.raised, html.cx-ready .formDialog .button-submit { padding: 10px 22px; }\nhtml.cx-ready .actionSheet, html.cx-ready .dialog.actionsheet { background: rgba(28,28,32,.97) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 20px !important; padding: 6px !important; box-shadow: 0 30px 70px rgba(0,0,0,.6) !important; backdrop-filter: blur(24px); }\nhtml.cx-ready .actionSheetMenuItem, html.cx-ready .actionSheet button.listItem { border-radius: 12px !important; transition: background .15s; }\nhtml.cx-ready .actionSheetMenuItem:hover { background: rgba(255,255,255,.1) !important; }\n\n/* ===== v15: mobile polish, touch player ===== */\r\n.pl-bigctl { display: none; }\r\n.pl-tap { display: none; }\r\n#cx-player { height: 100dvh; }\r\n@media (pointer: coarse) {\r\n  .pl-tap { display: block; position: absolute; top: 16%; bottom: 26%; z-index: 1; }\r\n  .pl-tap.l { left: 0; width: 34%; } .pl-tap.c { left: 34%; width: 32%; } .pl-tap.r { right: 0; width: 34%; }\r\n  .pl-bigctl { display: flex; position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); justify-content: center; align-items: center; gap: 36px; z-index: 2; pointer-events: none; transition: opacity .3s; }\r\n  .pl-bigctl button { pointer-events: auto; width: 56px; height: 56px; border-radius: 50%; background: rgba(0,0,0,.45); backdrop-filter: blur(8px); color: #fff; display: grid; place-items: center; }\r\n  .pl-bigctl .pl-bigpp { width: 72px; height: 72px; background: rgba(255,255,255,.95); color: #000; }\r\n  .pl-bigctl svg { width: 30px; height: 30px; } .pl-bigctl .pl-bigpp svg { width: 36px; height: 36px; }\r\n  #cx-player.idle .pl-bigctl, #cx-player.loading .pl-bigctl { opacity: 0; pointer-events: none; } #cx-player.idle .pl-bigctl button { pointer-events: none; }\r\n  /* bottom bar: seek on top, compact icon row, no duplicated play/skip/volume */\r\n  .pl-row .pl-pp, .pl-row .pl-skip, .pl-vol, .pl-row [data-tip*=\"icture\"] { display: none !important; }\r\n  .pl-bar { padding: 50px max(16px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }\r\n  .pl-top { padding: max(14px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 40px max(16px, env(safe-area-inset-left)); }\r\n  .pl-seek { height: 28px; } .pl-seek::before { height: 4px; } .pl-time { display: block !important; font-size: 13px; margin-left: 2px; } .pl-time .sl, .pl-time span:last-child { display: inline !important; color: #9a9aa2; }\r\n  .pl-row { gap: 2px; } .pl-row > button, .pl-btn-wrap > button { width: 44px; height: 44px; }\r\n  .pl-subs { bottom: 18%; }\r\n  .pl-settings { max-height: 70dvh; overflow-y: auto; }\r\n}\r\n@media (pointer: coarse) and (orientation: portrait) { .pl-bigctl { gap: 22px; } .pl-title { font-size: 15px; } }\r\n\r\n/* ---- phone layout ---- */\r\n@media (max-width: 820px) {\r\n  :root { --pad: 16px; }\r\n  /* home hero: shorter, thumb friendly */\r\n  .nf-hero { margin-top: 62px; height: min(58vh, 520px); min-height: 380px; border-radius: 20px; }\r\n  .nf-hero-logo { max-height: 72px; max-width: 72%; }\r\n  .nf-hero-title { font-size: 30px; }\r\n  /* detail: backdrop on top, info below, big full-width play button */\r\n  .nf-dback { position: absolute; inset: 0 0 auto 0; height: 440px; }\r\n  .nf-dback::after { background: linear-gradient(to top, #111113 2%, rgba(17,17,19,.55) 45%, rgba(17,17,19,.2) 100%) !important; }\r\n  .nf-dbody { padding: 230px var(--pad) 150px !important; }\r\n  .nf-dposter { display: none; }\r\n  .nf-dhead { gap: 0 !important; }\r\n  .nf-dlogo { max-height: 84px; max-width: 70%; object-position: left bottom; margin-bottom: 12px; border-radius: 6px; }\r\n  .nf-dinfo h1 { font-size: 30px; margin-bottom: 8px; }\r\n  .nf-dinfo .nf-meta { justify-content: flex-start; flex-wrap: wrap; font-size: 13px; }\r\n  .nf-dinfo .ov { font-size: 14.5px; line-height: 1.55; color: #d6d6da; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; overflow: hidden; margin-bottom: 18px; }\r\n  .nf-dinfo .ov.open { -webkit-line-clamp: unset; }\r\n  .nf-tagline { font-size: 14px; margin: 0 0 8px; }\r\n  .rt-row { gap: 6px; margin: 2px 0 12px; } .rt-chip { padding: 5px 10px; font-size: 12px; gap: 6px; } .rt-chip small { display: none; }\r\n  .nf-dinfo .nf-btns { display: flex; flex-wrap: wrap; gap: 10px; }\r\n  .nf-dinfo .nf-btns .btn.white { flex: 1 1 100%; height: 50px; justify-content: center; font-size: 16px; }\r\n  .nf-dinfo .nf-btns .btn.grey:not(.round) { flex: 1 1 0; height: 46px; justify-content: center; }\r\n  .nf-dinfo .nf-btns .btn.round { width: 46px; height: 46px; flex: none; }\r\n  .nf-resume-bar { width: 100% !important; margin-top: 12px; }\r\n  .nf-facts { grid-template-columns: 96px 1fr; font-size: 13.5px; }\r\n  /* rows and grids */\r\n  .nf-sect h2, .nf-row-h h2 { font-size: 18px; }\r\n  .nf-cast { gap: 12px; } .nf-person { width: 78px; } .nf-person .pi { width: 78px; height: 78px; }\r\n  /* settings: tabs scroll horizontally */\r\n  .set-layout { flex-direction: column; gap: 14px; }\r\n  .set-nav { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; } .set-nav::-webkit-scrollbar { display: none; } .set-nav > * { flex: none; }\r\n  .set-row { flex-direction: column; align-items: flex-start; gap: 10px; }\r\n  .set-ctl { width: 100%; justify-content: space-between; } .set-seg { flex-wrap: wrap; }\r\n  /* modals become bottom sheets */\r\n  .sr-modal, .sp-modal { width: 100% !important; max-height: 94dvh; border-radius: 24px 24px 0 0 !important; align-self: flex-end; }\r\n  .sp-modal-bg { align-items: flex-end !important; padding: 0 !important; }\r\n  .nf-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }\r\n  .dc-bar { overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; } .dc-bar::-webkit-scrollbar { display: none; } .dc-bar > * { flex: none; }\r\n  body { overscroll-behavior-y: contain; }\r\n  button, a { -webkit-tap-highlight-color: transparent; }\r\n}\r\n\r\nhtml.cx-hold body, html.cx-hold .skinBody, html.cx-hold .backgroundContainer { background: #111113 !important; } html.cx-hold #reactRoot { visibility: hidden !important; }\r\n.pl-tap { display: none !important; }\r\n\r\n/* ---- music on phones ---- */\r\n@media (max-width: 800px) {\r\n  .sp-main { background: #0f0f11; }\r\n  .sp-header { position: sticky; top: 0; z-index: 5; height: auto !important; min-height: 56px; padding: 10px 14px !important; gap: 10px; background: #0f0f11ee; display: flex; align-items: center; flex-wrap: nowrap; }\r\n  .sp-avatar { width: 36px; height: 36px; border-radius: 50%; background: #2c2c33; display: grid; place-items: center; font-weight: 800; font-size: 15px; flex: none; color: #fff; }\r\n  .sp-chips { display: flex; flex: 1; min-width: 0; flex-wrap: nowrap; gap: 8px; overflow-x: auto; scrollbar-width: none; } .sp-chips::-webkit-scrollbar { display: none; }\r\n  .sp-chip { flex: none; padding: 8px 16px; border-radius: 999px; background: rgba(255,255,255,.1); font-weight: 600; font-size: 14px; color: #fff; transition: background .15s, transform .12s; } .sp-chip:active { transform: scale(.95); }\r\n  .sp-chip.on { background: #fff; color: #000; }\r\n  .sp-greet { display: none; }\r\n  .sp-content { padding-bottom: 200px !important; }\r\n  .sp-quick { grid-template-columns: 1fr 1fr; gap: 8px; } .sp-quick > * { height: 56px; border-radius: 10px; }\r\n  .sp-mini { backdrop-filter: blur(14px); box-shadow: 0 8px 24px rgba(0,0,0,.5); transition: transform .2s; } .sp-mini:active { transform: scale(.985); }\r\n  .sp-full { transition: transform .38s cubic-bezier(.2,.8,.2,1); border-radius: 0; }\r\n  .sp-full .cvbig { width: min(86vw, 52vh); margin: 0 auto; border-radius: 14px; box-shadow: 0 24px 60px rgba(0,0,0,.55); }\r\n  .sp-full .ctr .pl-btn { width: 52px; height: 52px; } .sp-full .ctr .big { width: 72px; height: 72px; }\r\n}\r\n\r\n/* ---- touch smoothness ---- */\r\n@media (pointer: coarse) {\r\n  a, button, .nf-card, .sp-row, .sp-li, .sp-card { touch-action: manipulation; }\r\n  .nf-card, .sp-row, .btn, .sp-chip, .nf-chip { transition: transform .12s ease, background .15s ease; }\r\n  .nf-card:active, .sp-row:active { transform: scale(.97); }\r\n  .btn:active, .nf-chip:active { transform: scale(.95); }\r\n  .nf-peek { display: none !important; }\r\n  .nf-scroller, .nf-row-scroll, .sp-shelf { scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }\r\n  .nf-card, .sp-card { scroll-snap-align: start; }\r\n  .nf-top, .cx-tabs, .nf-hero::after { backdrop-filter: none !important; }\r\n  .cx-tabs { background: rgba(24,24,28,.96) !important; }\r\n  #cx-nf .nf-card .im { will-change: auto; }\r\n  .nf-sect, .nf-row { content-visibility: auto; contain-intrinsic-size: auto 260px; }\r\n}\r\n\n/* ===== v16: Cinema editors (dialogs) ===== */\r\n.cxd-bg { position: fixed; inset: 0; z-index: 9800; background: rgba(0,0,0,.6); backdrop-filter: blur(8px); display: grid; place-items: center; padding: 20px; opacity: 0; transition: opacity .2s; }\r\n.cxd-bg.show { opacity: 1; }\r\n.cxd { width: min(620px, 100%); max-height: min(88vh, 900px); display: flex; flex-direction: column; background: #17171b; border: 1px solid rgba(255,255,255,.08); border-radius: 26px; box-shadow: 0 40px 100px rgba(0,0,0,.7); color: #ececf0; overflow: hidden; transform: translateY(14px) scale(.98); transition: transform .28s cubic-bezier(.2,.8,.2,1); }\r\n.cxd-bg.show .cxd { transform: none; }\r\n.cxd.wide { width: min(980px, 100%); }\r\n.cxd-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px 16px 26px; border-bottom: 1px solid rgba(255,255,255,.06); }\r\n.cxd-head b { font-size: 18px; font-weight: 700; letter-spacing: -.01em; }\r\n.cxd-x { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.08); display: grid; place-items: center; transition: background .15s; } .cxd-x:hover { background: rgba(255,255,255,.18); }\r\n.cxd-body { padding: 20px 26px 24px; overflow-y: auto; flex: 1; min-height: 120px; scrollbar-width: thin; }\r\n.cxd-foot { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 14px 22px; border-top: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.025); } .cxd-foot:empty { display: none; }\r\n.cxd-foot .cxd-chk { margin-right: auto; }\r\n.cxd .btn.danger { background: #d92d20; color: #fff; }\r\n.cxd-sec { margin-bottom: 28px; } .cxd-sec:last-child { margin-bottom: 0; }\r\n.cxd-sh { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; } .cxd-sh h3 { margin: 0; font-size: 17px; font-weight: 700; }\r\n.cxd-sa { display: flex; gap: 8px; }\r\n.cxd-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: rgba(255,255,255,.09); font-weight: 600; font-size: 13px; color: #fff; transition: background .15s, transform .12s; } .cxd-chip:hover { background: rgba(255,255,255,.18); } .cxd-chip:active { transform: scale(.96); }\r\n.cxd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }\r\n.cxd-img { background: #202026; border-radius: 18px; padding: 10px; display: flex; flex-direction: column; gap: 8px; text-align: center; border: 1px solid rgba(255,255,255,.05); }\r\n.cxd-img small { color: #8d8d95; font-size: 12px; }\r\n.cxd-img .ci { position: relative; border-radius: 12px; background: #101014 center/contain no-repeat; aspect-ratio: 16/9; }\r\n.cxd-img .ci.primary { aspect-ratio: 2/3; } .cxd-img .ci.logo { aspect-ratio: 16/7; background-color: #1b1b21; } .cxd-img .ci.banner { aspect-ratio: 5/1; } .cxd-img .ci.disc { aspect-ratio: 1; }\r\n.cxd-grid:has(.ci.primary) { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }\r\n.cxd-img.pick { cursor: pointer; transition: background .15s, transform .15s, border-color .15s; } .cxd-img.pick:hover { background: #292930; border-color: rgba(255,255,255,.2); transform: translateY(-2px); }\r\n.cxd-del { position: absolute; top: 6px; right: 6px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.65); color: #fff; display: grid; place-items: center; opacity: 0; transition: opacity .15s, background .15s; } .cxd-img:hover .cxd-del, .cxd-del:focus { opacity: 1; } .cxd-del:hover { background: #d92d20; }\r\n@media (pointer: coarse) { .cxd-del { opacity: 1; } }\r\n.cxd-none { color: #6f6f77; font-size: 14px; padding: 6px 2px; }\r\n.cxd-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; } .cxd-f.full, .cxd-chk.full { grid-column: 1 / -1; }\r\n.cxd-f { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #a2a2aa; font-weight: 600; } .cxd-f small { font-weight: 400; color: #6f6f77; }\r\n.cxd input[type=text], .cxd input[type=number], .cxd input[type=date], .cxd textarea { width: 100%; background: #202026; color: #fff; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 11px 14px; font: inherit; font-size: 14.5px; font-weight: 400; transition: border-color .15s; color-scheme: dark; } .cxd input:focus, .cxd textarea:focus { outline: 0; border-color: rgba(255,255,255,.5); }\r\n.cxd textarea { resize: vertical; min-height: 120px; line-height: 1.5; }\r\n.cxd-chk { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #d4d4d8; cursor: pointer; } .cxd-chk input { width: 18px; height: 18px; accent-color: #fff; }\r\n.cxd-bar { display: flex; gap: 10px; flex-wrap: wrap; } .cxd-bar input[type=text] { flex: 1; min-width: 180px; } .cxd-bar input[type=number] { width: 110px; }\r\n.cxd-hint { color: #8d8d95; font-size: 13.5px; margin: 12px 0; line-height: 1.5; }\r\n.cxd-results { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }\r\n.cxd-res { display: flex; gap: 14px; text-align: left; padding: 10px; border-radius: 16px; background: #202026; border: 1px solid rgba(255,255,255,.05); transition: background .15s, border-color .15s; width: 100%; } .cxd-res:hover { background: #2a2a31; border-color: rgba(255,255,255,.18); }\r\n.cxd-res .rp { width: 64px; aspect-ratio: 2/3; border-radius: 10px; background: #101014 center/cover; flex: none; } .cxd-res .rt { min-width: 0; } .cxd-res b { display: block; font-size: 15px; } .cxd-res small { color: #8d8d95; } .cxd-res p { margin: 6px 0 0; font-size: 13px; color: #b4b4bc; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\r\n.cxd-opts { display: flex; flex-direction: column; gap: 10px; }\r\n.cxd-opt { display: block; padding: 14px 16px; border-radius: 16px; background: #202026; border: 1px solid rgba(255,255,255,.06); cursor: pointer; transition: background .15s, border-color .15s; } .cxd-opt b { display: block; font-size: 15px; } .cxd-opt small { color: #8d8d95; font-size: 13px; }\r\n.cxd-opt:hover { background: #26262d; } .cxd-opt.on { border-color: #fff; background: #26262d; }\r\n.cxd-opts + .cxd-chk { margin-top: 16px; }\r\n@media (max-width: 720px) {\r\n  .cxd-bg { padding: 0; align-items: end; }\r\n  .cxd, .cxd.wide { width: 100%; max-height: 94dvh; border-radius: 24px 24px 0 0; }\r\n  .cxd-form { grid-template-columns: 1fr; } .cxd-body { padding: 16px 16px 20px; } .cxd-head { padding: 14px 14px 14px 20px; }\r\n  .cxd-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }\r\n  .cxd-foot { padding: 12px 14px calc(12px + env(safe-area-inset-bottom)); }\r\n}\r\n\r\n/* ---- phone safe areas and edge padding ---- */\r\n@media (max-width: 800px) {\r\n  .sp-header { padding-top: max(10px, env(safe-area-inset-top)) !important; }\r\n  .sp-full { overflow-y: auto; padding-top: max(12px, env(safe-area-inset-top)); padding-bottom: max(28px, env(safe-area-inset-bottom)); }\r\n  .sp-shelf::after { content: \"\"; flex: none; width: 8px; }\r\n  .sp-content { padding-bottom: calc(190px + env(safe-area-inset-bottom)) !important; }\r\n  .cx-tabs { padding-bottom: env(safe-area-inset-bottom); }\r\n  .sp-row .ti b, .sp-row .ti span { max-width: 100%; }\r\n}\r\n\r\n/* ---- player gestures ---- */\r\n#cx-player { touch-action: none; }\r\n.pl-stack { position: absolute; top: 50%; transform: translateY(-50%) scale(.9); z-index: 4; display: none; flex-direction: column; align-items: center; gap: 4px; padding: 22px 26px; border-radius: 999px; background: rgba(0,0,0,.5); backdrop-filter: blur(6px); color: #fff; pointer-events: none; }\r\n.pl-stack.show { display: flex; animation: plstack .18s ease both; } .pl-stack.l { left: 8%; } .pl-stack.r { right: 8%; } .pl-stack svg { width: 34px; height: 34px; } .pl-stack b { font-size: 16px; font-variant-numeric: tabular-nums; }\r\n@keyframes plstack { from { transform: translateY(-50%) scale(.8); opacity: .4; } to { transform: translateY(-50%) scale(1); opacity: 1; } }\r\n.pl-gest { position: absolute; top: 14%; left: 50%; transform: translateX(-50%); z-index: 4; display: none; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 999px; background: rgba(0,0,0,.6); backdrop-filter: blur(8px); color: #fff; pointer-events: none; min-width: 170px; justify-content: center; }\r\n.pl-gest.show { display: flex; } .pl-gest .gi svg { width: 22px; height: 22px; display: block; } .pl-gest .gb { width: 110px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.25); overflow: hidden; } .pl-gest .gb i { display: block; height: 100%; background: #fff; } .pl-gest b { font-size: 14px; font-variant-numeric: tabular-nums; min-width: 40px; }\r\n\n/* ===== TV mode (remote control, 10-foot UI) ===== */\r\nhtml.cx-tv * { -webkit-tap-highlight-color: transparent; }\r\nhtml.cx-tv .tvf-on { outline: none; }\r\nhtml.cx-tv *, html.cx-tv *::before, html.cx-tv *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }\r\nhtml.cx-tv .nf-peek, html.cx-tv .nf-scrollbtn, html.cx-tv .nf-arrow { display: none !important; }\r\nhtml.cx-tv ::-webkit-scrollbar { display: none; }\r\nhtml.cx-tv .cx-tabs { display: none !important; }\r\nhtml.cx-tv #cx-nf, html.cx-tv .sp-scroll, html.cx-tv .nf-scroller, html.cx-tv .nf-cast, html.cx-tv .sp-shelf { scroll-behavior: auto !important; }\r\nhtml.cx-tv { --pad: 56px; }\r\n\r\n/* ambient colour wash behind the page */\r\nhtml.cx-tv #cx-glow { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity .7s ease, background .7s ease; }\r\nhtml.cx-tv #cx-nf { background: transparent; }\r\n\r\n/* ---- focus: a white ring (box-shadow, takes no space) + a soft glow in the poster colour ---- */\r\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { transition: transform .1s ease, box-shadow .15s ease; transform: none !important; will-change: auto; }\r\nhtml.cx-tv .nf-card.tvf-on { z-index: 6; }\r\nhtml.cx-tv .nf-card.tvf-on .im { transform: scale(1.03) !important; outline: 4px solid #fff; outline-offset: 4px; box-shadow: 0 0 40px 6px var(--glow, rgba(255,255,255,.22)); }\r\nhtml.cx-tv .nf-person.tvf-on .pi { transform: none !important; outline: 4px solid #fff; outline-offset: 4px; box-shadow: 0 0 34px 5px var(--glow, rgba(255,255,255,.2)); }\r\nhtml.cx-tv .btn { transition: transform .15s ease, box-shadow .2s ease; }\r\nhtml.cx-tv .btn.tvf-on { transform: none; outline: 4px solid #fff; outline-offset: 3px; box-shadow: none; position: relative; z-index: 4; }\r\nhtml.cx-tv #cx-top a.tvf-on, html.cx-tv #cx-top button.tvf-on { outline: 3px solid #fff; outline-offset: 3px; background: rgba(255,255,255,.18); color: #fff; border-radius: 999px; }\r\nhtml.cx-tv #cx-top a.tvf-on.on { background: #fff; color: #000; }\r\nhtml.cx-tv .sp-row.tvf-on { background: rgba(255,255,255,.17) !important; box-shadow: inset 0 0 0 3px #fff; border-radius: 12px; }\r\nhtml.cx-tv .sp-li.tvf-on, html.cx-tv .sp-navlink.tvf-on, html.cx-tv .sp-chip.tvf-on { background: rgba(255,255,255,.17) !important; box-shadow: inset 0 0 0 3px #fff; border-radius: 12px; color: #fff; }\r\nhtml.cx-tv .sp-quick > .tvf-on { box-shadow: inset 0 0 0 3px #fff; background: rgba(255,255,255,.2) !important; }\r\nhtml.cx-tv .sp-card.tvf-on, html.cx-tv .sp-top1.tvf-on { box-shadow: 0 0 0 4px #fff, 0 0 40px 6px var(--glow, rgba(255,255,255,.2)); border-radius: 16px; transform: scale(1.03); z-index: 5; position: relative; }\r\nhtml.cx-tv .sp-row button.tvf-on, html.cx-tv .pl-btn.tvf-on { box-shadow: 0 0 0 3px #fff; border-radius: 50%; background: rgba(255,255,255,.2); }\r\nhtml.cx-tv .nf-chip.tvf-on, html.cx-tv .cxd-chip.tvf-on, html.cx-tv .cxd-opt.tvf-on, html.cx-tv .cxd-res.tvf-on, html.cx-tv .nf-ep.tvf-on { box-shadow: 0 0 0 3px #fff; background: rgba(255,255,255,.2); }\r\nhtml.cx-tv input.tvf-on, html.cx-tv select.tvf-on, html.cx-tv textarea.tvf-on { box-shadow: 0 0 0 3px #fff; }\r\nhtml.cx-tv .set-switch.tvf-on { box-shadow: 0 0 0 3px #fff; }\r\n\r\n/* ---- layout: calm spacing at rest ---- */\r\nhtml.cx-tv .nf-card { width: calc(19vw * var(--cs, 1)); } html.cx-tv .nf-card.poster { width: calc(11.4vw * var(--cs, 1)); }\r\nhtml.cx-tv .nf-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 26px 18px; } html.cx-tv .nf-grid .nf-card, html.cx-tv .nf-grid .nf-card.poster { width: 100%; }\r\nhtml.cx-tv .nf-hero { height: 70vh; margin-top: 96px; }\r\nhtml.cx-tv .nf-row { margin-bottom: 30px; }\r\nhtml.cx-tv .nf-row h2 { font-size: 22px; margin-bottom: 4px; }\r\n/* generous scroller padding so rings and glows are never clipped */\r\nhtml.cx-tv .nf-scroller { gap: 16px; padding: 64px var(--pad) 68px; margin: -52px 0 -56px; }\r\nhtml.cx-tv .nf-btns, html.cx-tv .nf-hero-btns { gap: 14px; padding: 10px 8px; margin-left: -8px; }\r\nhtml.cx-tv .nf-btns .btn, html.cx-tv .nf-hero-btns .btn { height: 54px; font-size: 18px; flex: none; min-width: 0; }\r\nhtml.cx-tv .nf-btns .btn.round { width: 54px; padding: 0; aspect-ratio: 1; }\r\nhtml.cx-tv .nf-cast { gap: 22px; padding: 56px var(--pad) 60px; margin: -44px calc(-1 * var(--pad)) -48px; }\r\nhtml.cx-tv .nf-person { width: 112px; }\r\nhtml.cx-tv .nf-person .pi { width: 112px; height: 112px; margin-bottom: 12px; }\r\nhtml.cx-tv .nf-person b { display: block; margin-top: 2px; }\r\nhtml.cx-tv .nf-sect h2, html.cx-tv .nf-dbody h2 { margin-bottom: 6px; }\r\nhtml.cx-tv .nf-card.more .im { display: grid; place-items: center; background: #1c1c21; border: 2px dashed rgba(255,255,255,.22); }\r\nhtml.cx-tv .nf-card.more .mr { display: flex; flex-direction: column; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; color: #e6e6ea; } html.cx-tv .nf-card.more svg { width: 40px; height: 40px; }\r\nhtml.cx-tv #cx-top { background: rgba(17,17,19,.97) !important; }\r\n\r\n/* ---- smoothness + cheaper painting ---- */\r\nhtml.cx-tv .btn, html.cx-tv .nf-card .im, html.cx-tv .nf-person .pi, html.cx-tv #cx-top a, html.cx-tv #cx-top button { outline: 4px solid transparent; outline-offset: 0; transition: outline-color .14s ease, outline-offset .2s cubic-bezier(.2,.8,.2,1), transform .2s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease, background-color .15s ease; }\r\nhtml.cx-tv #cx-top a, html.cx-tv #cx-top button { outline-width: 3px; }\r\nhtml.cx-tv .nf-card.tvf-on .im { box-shadow: 0 0 30px 4px var(--glow, rgba(255,255,255,.2)); }\r\nhtml.cx-tv .nf-person.tvf-on .pi { box-shadow: 0 0 26px 4px var(--glow, rgba(255,255,255,.18)); }\r\nhtml.cx-tv .nf-row, html.cx-tv .nf-sect { animation: none !important; }\r\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { will-change: auto !important; }\r\nhtml.cx-tv #cx-glow { transition: opacity .6s ease; }\r\nhtml.cx-tv .nf-card .im .info, html.cx-tv .nf-card .im::after { transition: none; }\r\nhtml.cx-tv .nf-scroller, html.cx-tv .nf-cast, html.cx-tv .sp-shelf, html.cx-tv .nf-row-scroll, html.cx-tv #cx-nf { scroll-snap-type: none !important; }\nhtml.cx-tv .nf-row, html.cx-tv .nf-sect { content-visibility: visible !important; contain-intrinsic-size: none !important; }\n\n/* extended mode: a barely visible marker on the account avatar so you know it is on */\r\nhtml.cx-ext .nf-avatar { position: relative; }\r\nhtml.cx-ext .nf-avatar::after { content: ''; position: absolute; right: -1px; top: -1px; width: 7px; height: 7px; border-radius: 50%; background: #fff; opacity: .55; box-shadow: 0 0 0 2px #141414; }\r\n.um-danger .um-ic, .um-danger:hover .um-ic { background: rgba(255,255,255,.1) !important; color: #fff; }\n.um-danger:hover { background: rgba(255,255,255,.06); }\n.nf-card.hx .im { box-shadow: inset 0 0 0 2px rgba(255,255,255,.22); }\n.hx-badge { position: absolute; right: 8px; top: 8px; z-index: 4; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.65); backdrop-filter: blur(6px); }\n.hx-badge svg { width: 14px !important; height: 14px !important; }\n.hx-lock { width: 64px; height: 64px; margin: 6px auto 14px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, #34343d, #1f1f25); box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1); }\n.hx-lock svg { width: 28px; height: 28px; }\n.cxd input.hx-code { display: block; width: 100%; box-sizing: border-box; height: 56px; text-align: center; font-size: 24px; letter-spacing: .35em; background: rgba(255,255,255,.06) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.12) !important; border-radius: 16px !important; outline: 0; transition: border-color .2s, box-shadow .2s; }\n.cxd input.hx-code:focus { border-color: rgba(255,255,255,.5) !important; box-shadow: 0 0 0 4px rgba(255,255,255,.08); }\n.cxd input.hx-code::placeholder { letter-spacing: .3em; color: #55555e; }\n.cxd input.hx-code.shake { animation: hxShake .4s; border-color: #ff6b6b !important; }\n@keyframes hxShake { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }\n\n/* ---------- login / server select: calm, minimal ---------- */\nhtml.cx-ready.cx-login:not(.transparentDocument), html.cx-ready.cx-login:not(.transparentDocument) body { background: #0a0a0c !important; }\nhtml.cx-ready.cx-login:not(.transparentDocument) .backgroundContainer, html.cx-ready.cx-login:not(.transparentDocument) .skinBody, html.cx-ready.cx-login:not(.transparentDocument) .mainAnimatedPages { background: transparent !important; }\nhtml.cx-login .skinHeader, html.cx-login .MuiAppBar-root, html.cx-login .mainDrawerHandle { display: none !important; }\n/* one soft light from above, nothing moving */\nhtml.cx-login body::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(60% 45% at 50% -8%, rgba(255,255,255,.075), transparent 70%), radial-gradient(40% 40% at 12% 108%, color-mix(in srgb, var(--accent-nf, #e50914) 14%, transparent), transparent 70%); }\nhtml.cx-login body::after { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%); }\nhtml.cx-login #loginPage, html.cx-login #selectServerPage, html.cx-login #forgotPasswordPage, html.cx-login #forgotPasswordPinPage, html.cx-login #quickConnectPage { position: relative; z-index: 1; display: flex !important; align-items: center; justify-content: center; min-height: 100vh; padding: 32px 20px !important; background: transparent !important; }\nhtml.cx-login #loginPage > div, html.cx-login #selectServerPage > div, html.cx-login #forgotPasswordPage > div { width: 100%; max-width: 400px; margin: 0 auto !important; padding: 0 !important; background: none; border: 0; box-shadow: none; animation: cxLoginIn .5s cubic-bezier(.2, .8, .2, 1) both; }\n@keyframes cxLoginIn { from { opacity: 0; transform: translateY(10px); } }\nhtml.cx-login #loginPage > div::before, html.cx-login #selectServerPage > div::before, html.cx-login #forgotPasswordPage > div::before { content: var(--cx-brand, 'JELLYFIN'); display: block; text-align: center; font-weight: 900; font-size: 30px; letter-spacing: .22em; text-indent: .22em; color: #fff; margin: 0 0 8px; }\nhtml.cx-login #loginPage > div::after, html.cx-login #selectServerPage > div::after, html.cx-login #forgotPasswordPage > div::after { content: ''; order: -1; }\nhtml.cx-login .manualLoginForm { max-width: none !important; width: 100% !important; margin: 0 !important; position: relative; padding-top: 22px; }\nhtml.cx-login .manualLoginForm::before { content: ''; position: absolute; top: 0; left: 50%; width: 28px; height: 3px; margin-left: -14px; border-radius: 3px; background: var(--accent-nf, #e50914); }\nhtml.cx-login .sectionTitle, html.cx-login .visualLoginForm h1, html.cx-login #loginPage h1 { font-size: 15px !important; font-weight: 500 !important; letter-spacing: .02em; color: #8f8f99; text-align: center; margin: 18px 0 26px !important; }\nhtml.cx-login .padded-left.padded-right.flex { padding: 0 !important; }\nhtml.cx-login .inputContainer { margin: 0 0 16px !important; position: relative; }\nhtml.cx-login .inputLabel { position: static !important; transform: none !important; display: block; font-size: 11.5px !important; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #7f7f89 !important; margin: 0 0 8px 2px; }\nhtml.cx-login .emby-input, html.cx-login input.emby-input { height: 54px !important; padding: 0 18px !important; font-size: 16px !important; border-radius: 12px !important; background: rgba(255,255,255,.045) !important; border: 1px solid rgba(255,255,255,.1) !important; color: #fff !important; transition: border-color .2s, background .2s; width: 100%; box-sizing: border-box; }\nhtml.cx-login .emby-input:hover { border-color: rgba(255,255,255,.18) !important; }\nhtml.cx-login .emby-input:focus { background: rgba(255,255,255,.07) !important; border-color: rgba(255,255,255,.6) !important; box-shadow: none; outline: 0; }\nhtml.cx-login .emby-input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #17171b inset !important; -webkit-text-fill-color: #fff !important; }\nhtml.cx-login .checkboxContainer { margin: 2px 0 24px 2px !important; color: #a8a8b2; font-size: 14px; }\nhtml.cx-login .emby-checkbox:checked + span + .checkboxOutline { background: #fff !important; border-color: #fff !important; }\nhtml.cx-login .emby-checkbox:checked + span + .checkboxOutline .checkboxIcon { color: #000 !important; }\nhtml.cx-login .emby-checkbox:focus + span + .checkboxOutline { box-shadow: 0 0 0 4px rgba(255,255,255,.18) !important; }\nhtml.cx-login .button-submit.raised, html.cx-login button[type=submit].raised { height: 54px; font-size: 16px !important; font-weight: 700 !important; border-radius: 999px !important; background: #fff !important; color: #000 !important; box-shadow: none !important; transition: transform .15s, background .2s; }\nhtml.cx-login .button-submit.raised:hover { background: #e9e9ee !important; }\nhtml.cx-login .button-submit.raised:active { transform: scale(.985); }\n/* secondary actions: quiet text links */\nhtml.cx-login .raised.cancel, html.cx-login .btnSelectServer, html.cx-login .btnManual, html.cx-login .btnQuick, html.cx-login .btnForgotPassword { height: 40px; margin: 6px 0 0 !important; border-radius: 999px !important; background: transparent !important; color: #9a9aa4 !important; font-weight: 600 !important; font-size: 14px !important; border: 0 !important; box-shadow: none !important; transition: color .2s, background .2s; }\nhtml.cx-login .raised.cancel:hover, html.cx-login .btnSelectServer:hover { color: #fff !important; background: rgba(255,255,255,.06) !important; }\nhtml.cx-login .readOnlyContent { margin: 12px 0 0 !important; max-width: none !important; display: flex; flex-direction: column; align-items: center; }\nhtml.cx-login .readOnlyContent .raised { width: auto !important; padding: 0 18px; }\nhtml.cx-login .loginDisclaimer { color: #6f6f79; font-size: 12.5px; text-align: center; margin-top: 18px; }\nhtml.cx-login .visualLoginForm #divUsers { display: flex; flex-wrap: wrap; gap: 22px; justify-content: center; margin: 8px 0; }\nhtml.cx-login .visualLoginForm .card, html.cx-login .visualLoginForm .cardBox { background: transparent !important; border: 0 !important; }\nhtml.cx-login .visualLoginForm .cardImageContainer { border-radius: 50% !important; box-shadow: 0 8px 26px rgba(0, 0, 0, .5); transition: transform .2s, box-shadow .2s; }\nhtml.cx-login .visualLoginForm .card:hover .cardImageContainer { transform: scale(1.05); box-shadow: 0 0 0 3px #fff, 0 12px 30px rgba(0, 0, 0, .55); }\nhtml.cx-login .visualLoginForm .cardText { text-align: center; color: #e8e8ec; font-weight: 600; }\n@media (max-width: 520px) { html.cx-login #loginPage > div, html.cx-login #selectServerPage > div, html.cx-login #forgotPasswordPage > div { max-width: 100%; } }\n\n/* ---------- dashboard + admin pages (Jellyfin's React/MUI screens): every element in the Cinema look ---------- */\nhtml.cx-ready { --dx-a: #f2f2f5; --dx-a-soft: rgba(255, 255, 255, .12); --dx-a-text: #e8e8ec; --dx-card: #18181c; --dx-line: rgba(255, 255, 255, .07); }\n\n/* shell */\nhtml.cx-ready .MuiDrawer-paper { background: linear-gradient(180deg, #0f0f12, #0b0b0d) !important; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root { min-height: 42px; font-weight: 500; color: #c4c4cc; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root.Mui-selected { background: rgba(255, 255, 255, .1) !important; color: #fff; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemIcon-root { color: inherit; opacity: .85; min-width: 38px; }\nhtml.cx-ready .MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root { color: var(--dx-a-text); opacity: 1; }\nhtml.cx-ready .MuiDrawer-paper .MuiListSubheader-root { font-size: 11px; letter-spacing: .12em; text-transform: uppercase !important; color: #6f6f78 !important; font-weight: 700; }\nhtml.cx-ready .MuiAppBar-root { box-shadow: none !important; }\nhtml.cx-ready .MuiToolbar-root .MuiIconButton-root:hover { background: rgba(255, 255, 255, .08); }\n\n/* headings, text */\nhtml.cx-ready .MuiTypography-h1, html.cx-ready .MuiTypography-h2, html.cx-ready .MuiTypography-h3 { font-weight: 800 !important; letter-spacing: -.02em; }\nhtml.cx-ready .MuiTypography-h4, html.cx-ready .MuiTypography-h5, html.cx-ready .MuiTypography-h6 { font-weight: 700 !important; letter-spacing: -.01em; }\nhtml.cx-ready .MuiTypography-colorTextSecondary, html.cx-ready .MuiFormHelperText-root, html.cx-ready .MuiTypography-body2 { color: #9a9aa4; }\nhtml.cx-ready a.MuiLink-root, html.cx-ready .MuiLink-root { color: #fff !important; text-decoration-color: transparent !important; transition: text-decoration-color .2s; }\nhtml.cx-ready .MuiFormHelperText-root a, html.cx-ready .MuiTypography-body1 a.MuiLink-root, html.cx-ready .MuiTypography-body2 a.MuiLink-root { color: var(--dx-a-text) !important; }\nhtml.cx-ready a.MuiLink-root:hover { text-decoration-color: currentColor !important; }\nhtml.cx-ready .MuiBreadcrumbs-root a { color: #9a9aa4 !important; }\n\n/* surfaces: cards, paper, lists, tables */\nhtml.cx-ready .MuiCard-root, html.cx-ready .MuiPaper-outlined { background: var(--dx-card) !important; border: 1px solid var(--dx-line) !important; border-radius: 20px !important; box-shadow: none !important; overflow: hidden; transition: transform .2s, border-color .2s, background .2s; }\nhtml.cx-ready .MuiCard-root:hover { border-color: rgba(255, 255, 255, .14) !important; }\nhtml.cx-ready .MuiCardActionArea-root:hover .MuiCardActionArea-focusHighlight { opacity: .04; }\nhtml.cx-ready .MuiCardMedia-root:not([style*=\"url(\"]):not([image]) { background: linear-gradient(135deg, #2b2b33, #1b1b20 70%) !important; color: rgba(255, 255, 255, .85) !important; }\nhtml.cx-ready .MuiCardMedia-root .MuiSvgIcon-root { filter: drop-shadow(0 6px 14px rgba(0, 0, 0, .4)); }\nhtml.cx-ready .MuiCardContent-root { padding: 14px 16px !important; }\nhtml.cx-ready .MuiAvatar-colorDefault, html.cx-ready .MuiAvatar-root:not(:has(img)) { background: linear-gradient(135deg, #3a3a43, #25252b) !important; color: #fff !important; }\nhtml.cx-ready .MuiAvatar-root { box-shadow: 0 4px 14px rgba(0, 0, 0, .35); }\nhtml.cx-ready .MuiList-root .MuiListItem-root, html.cx-ready .MuiList-root .MuiListItemButton-root { border-radius: 14px; }\nhtml.cx-ready .MuiListItemButton-root:not(.Mui-selected):hover { background: rgba(255, 255, 255, .06) !important; }\nhtml.cx-ready .MuiDivider-root { border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiTableContainer-root, html.cx-ready .MuiDataGrid-root { background: var(--dx-card) !important; border: 1px solid var(--dx-line) !important; border-radius: 18px !important; }\nhtml.cx-ready .MuiTableCell-root { border-color: var(--dx-line) !important; color: #d8d8de; }\nhtml.cx-ready .MuiTableHead-root .MuiTableCell-root { color: #8c8c96; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; background: rgba(255, 255, 255, .03); }\nhtml.cx-ready .MuiTableRow-hover:hover, html.cx-ready .MuiTableBody-root .MuiTableRow-root:hover { background: rgba(255, 255, 255, .04) !important; }\nhtml.cx-ready .MuiDataGrid-columnHeaders { background: rgba(255, 255, 255, .03) !important; border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiDataGrid-cell, html.cx-ready .MuiDataGrid-footerContainer { border-color: var(--dx-line) !important; }\nhtml.cx-ready .MuiAccordion-root { background: var(--dx-card) !important; border: 1px solid var(--dx-line); border-radius: 18px !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAccordion-root::before { display: none; }\n\n/* form controls */\nhtml.cx-ready .MuiFormLabel-root, html.cx-ready .MuiInputLabel-root { color: #9a9aa4 !important; font-weight: 500; }\nhtml.cx-ready .MuiFormLabel-root.Mui-focused, html.cx-ready .MuiInputLabel-root.Mui-focused { color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiInputBase-root, html.cx-ready .MuiFilledInput-root, html.cx-ready .MuiOutlinedInput-root { background: rgba(255, 255, 255, .055) !important; border-radius: 14px !important; transition: background .2s, box-shadow .2s; }\nhtml.cx-ready .MuiFilledInput-root::before, html.cx-ready .MuiFilledInput-root::after, html.cx-ready .MuiInput-root::before, html.cx-ready .MuiInput-root::after { display: none !important; }\nhtml.cx-ready .MuiInputBase-root:hover { background: rgba(255, 255, 255, .08) !important; }\nhtml.cx-ready .MuiInputBase-root.Mui-focused { background: rgba(255, 255, 255, .09) !important; box-shadow: 0 0 0 3px var(--dx-a-soft), inset 0 0 0 1px color-mix(in srgb, var(--accent-nf, #e50914) 70%, transparent); }\nhtml.cx-ready .MuiInputBase-input { color: #f2f2f5; }\nhtml.cx-ready .MuiSelect-icon, html.cx-ready .MuiInputAdornment-root { color: #9a9aa4; }\nhtml.cx-ready .MuiCheckbox-root, html.cx-ready .MuiRadio-root { color: #6f6f78 !important; }\nhtml.cx-ready .MuiCheckbox-root.Mui-checked, html.cx-ready .MuiRadio-root.Mui-checked, html.cx-ready .MuiCheckbox-root.MuiCheckbox-indeterminate { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiSwitch-track { background: #44444c !important; opacity: 1 !important; border-radius: 999px; }\nhtml.cx-ready .MuiSwitch-switchBase.Mui-checked { color: #111 !important; }\nhtml.cx-ready .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track { background: var(--dx-a) !important; opacity: 1 !important; }\nhtml.cx-ready .MuiSwitch-thumb { box-shadow: 0 2px 6px rgba(0, 0, 0, .4); }\nhtml.cx-ready .MuiSlider-root { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiSlider-thumb { box-shadow: 0 0 0 6px var(--dx-a-soft); }\nhtml.cx-ready .MuiLinearProgress-root { background: rgba(255, 255, 255, .1) !important; border-radius: 999px; height: 6px; }\nhtml.cx-ready .MuiLinearProgress-bar { background: var(--dx-a) !important; border-radius: 999px; }\nhtml.cx-ready .MuiCircularProgress-root { color: var(--dx-a) !important; }\nhtml.cx-ready .MuiFormControlLabel-label { color: #e0e0e6; }\n\n/* buttons */\nhtml.cx-ready .MuiButton-outlined { background: rgba(255, 255, 255, .05) !important; color: #f2f2f5 !important; border: 1px solid rgba(255, 255, 255, .14) !important; }\nhtml.cx-ready .MuiButton-outlined:hover { background: rgba(255, 255, 255, .1) !important; }\nhtml.cx-ready .MuiButton-text { color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiButton-text:hover { background: var(--dx-a-soft) !important; }\nhtml.cx-ready .MuiButton-containedError, html.cx-ready .MuiButton-colorError.MuiButton-contained { background: rgba(255, 255, 255, .06) !important; color: #f2f2f5 !important; border: 1px solid rgba(255, 255, 255, .16) !important; }\nhtml.cx-ready .MuiButton-containedError:hover { background: rgba(255, 255, 255, .12) !important; }\nhtml.cx-ready .MuiFab-root { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .MuiToggleButton-root { border-color: var(--dx-line) !important; color: #c4c4cc; border-radius: 12px !important; }\nhtml.cx-ready .MuiToggleButton-root.Mui-selected { background: var(--dx-a-soft) !important; color: #fff !important; }\n\n/* tabs, chips, badges, tooltips, alerts */\nhtml.cx-ready .MuiTabs-indicator { background: var(--dx-a) !important; height: 3px; border-radius: 3px; }\nhtml.cx-ready .MuiTab-root { text-transform: none !important; font-weight: 600; color: #9a9aa4; }\nhtml.cx-ready .MuiTab-root.Mui-selected { color: #fff !important; }\nhtml.cx-ready .MuiChip-root { background: rgba(255, 255, 255, .09) !important; color: #e8e8ec !important; font-weight: 600; }\nhtml.cx-ready .MuiChip-colorPrimary { background: var(--dx-a-soft) !important; color: var(--dx-a-text) !important; }\nhtml.cx-ready .MuiBadge-colorPrimary { background: var(--dx-a) !important; color: #fff !important; }\nhtml.cx-ready .MuiTooltip-tooltip { background: rgba(30, 30, 36, .96) !important; border: 1px solid var(--dx-line); border-radius: 10px !important; font-size: 12.5px; backdrop-filter: blur(10px); }\nhtml.cx-ready .MuiAlert-root { border-radius: 16px !important; border: 1px solid var(--dx-line); background: #1c1c21 !important; color: #e8e8ec !important; }\nhtml.cx-ready .MuiAlert-standardError { background: rgba(211, 59, 59, .14) !important; border-color: rgba(211, 59, 59, .35); }\nhtml.cx-ready .MuiAlert-standardWarning { background: rgba(255, 170, 40, .12) !important; border-color: rgba(255, 170, 40, .3); }\nhtml.cx-ready .MuiAlert-standardSuccess { background: rgba(60, 200, 120, .12) !important; border-color: rgba(60, 200, 120, .3); }\nhtml.cx-ready .MuiSnackbarContent-root { background: #26262c !important; border-radius: 14px !important; }\n\n/* dialogs and menus */\nhtml.cx-ready .MuiDialog-paper { background: linear-gradient(180deg, #202026, #17171b) !important; border: 1px solid rgba(255, 255, 255, .09) !important; border-radius: 24px !important; box-shadow: 0 40px 100px rgba(0, 0, 0, .7) !important; }\nhtml.cx-ready .MuiDialogTitle-root { font-weight: 800 !important; letter-spacing: -.01em; }\nhtml.cx-ready .MuiBackdrop-root:not(.MuiBackdrop-invisible) { background: rgba(0, 0, 0, .62) !important; backdrop-filter: blur(6px); }\nhtml.cx-ready .MuiMenuItem-root.Mui-selected { background: var(--dx-a-soft) !important; }\nhtml.cx-ready .MuiMenuItem-root:hover { background: rgba(255, 255, 255, .08) !important; }\n\n/* classic (non-React) admin screens: sections, lists, inputs */\nhtml.cx-ready .content-primary, html.cx-ready .content-secondary { max-width: 1500px; }\nhtml.cx-ready #dashboardPage .content-primary, html.cx-ready #dashboardPage .content-secondary { max-width: none; }\nhtml.cx-ready .verticalSection, html.cx-ready .detailSection { margin-bottom: 30px; }\nhtml.cx-ready .paperList { background: var(--dx-card) !important; border: 1px solid var(--dx-line); }\nhtml.cx-ready .listItem-content, html.cx-ready .listItemBody { color: #e8e8ec; }\nhtml.cx-ready .fieldDescription, html.cx-ready .listItemBodyText.secondary { color: #8f8f99 !important; }\nhtml.cx-ready .inputLabel, html.cx-ready .selectLabel { color: #9a9aa4 !important; }\nhtml.cx-ready .emby-select-withcolor, html.cx-ready .emby-select { border-radius: 14px !important; }\nhtml.cx-ready .emby-checkbox:checked + span + .checkboxOutline { background: var(--dx-a) !important; border-color: var(--dx-a) !important; }\nhtml.cx-ready .emby-radio:checked + span + .radioOutline .radioOutlineInner, html.cx-ready .emby-radio:checked + span::before { background: var(--dx-a) !important; }\nhtml.cx-ready .itemProgressBar .itemProgressBarForeground, html.cx-ready .innerCardFooter .itemProgressBarForeground { background: var(--dx-a) !important; }\nhtml.cx-ready .backgroundProgress { background: rgba(255, 255, 255, .1) !important; }\nhtml.cx-ready .backgroundProgress .progressBarForeground, html.cx-ready .taskProgressInner { background: var(--dx-a) !important; }\nhtml.cx-ready .raised.button-accent, html.cx-ready .button-accent { background: #fff !important; color: #000 !important; }\nhtml.cx-ready .button-delete, html.cx-ready .btnDelete { color: #ff7b7b !important; }\nhtml.cx-ready .toast, html.cx-ready .toastContainer .toast { background: #26262c !important; border-radius: 14px !important; }\nhtml.cx-ready .selectionCommandsPanel { background: #1c1c21 !important; }\nhtml.cx-ready .listItemIcon.listItemIcon-transparent, html.cx-ready .material-icons.listItemIcon { color: var(--dx-a-text); }\n\nhtml.cx-ready input[type=range] { accent-color: var(--dx-a); }\nhtml.cx-ready .dashboardColumn .cardBox, html.cx-ready .dashboardSection .card { background: var(--dx-card) !important; }\n\n/* classic cards with colourful default backgrounds (users, libraries, devices) */\nhtml.cx-ready [class*=\"defaultCardBackground\"]:not([style*=\"url(\"]) { background: linear-gradient(135deg, #34343d, #1f1f25 80%) !important; color: rgba(255, 255, 255, .9) !important; }\nhtml.cx-ready [class*=\"defaultCardBackground\"] .cardImageIcon, html.cx-ready [class*=\"defaultCardBackground\"] .material-icons { color: rgba(255, 255, 255, .85) !important; text-shadow: 0 8px 20px rgba(0, 0, 0, .4); }\nhtml.cx-ready .card .cardContent, html.cx-ready .cardBox { border-radius: 18px; }\nhtml.cx-ready .cardBox { background: var(--dx-card) !important; border: 1px solid var(--dx-line); overflow: hidden; transition: border-color .2s, transform .2s; }\nhtml.cx-ready .cardBox:hover { border-color: rgba(255, 255, 255, .16); }\nhtml.cx-ready .cardFooter, html.cx-ready .cardText { color: #d4d4da; }\n\n/* app bar + drawer: flat, full width, no card rounding */\nhtml.cx-ready .MuiAppBar-root.MuiPaper-root { border-radius: 0 !important; background: rgba(12, 12, 14, .88) !important; backdrop-filter: blur(18px) saturate(1.2); border: 0 !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAppBar-root .MuiToolbar-root { min-height: 56px; padding: 0 20px; }\nhtml.cx-ready .MuiDrawer-paper.MuiPaper-root, html.cx-ready .MuiDrawer-root .MuiPaper-root { border-radius: 0 !important; border: 0 !important; border-right: 1px solid rgba(255,255,255,.07) !important; box-shadow: none !important; }\nhtml.cx-ready .MuiAppBar-root .MuiIconButton-root { width: 40px; height: 40px; }\nhtml.cx-ready .MuiAppBar-root .MuiAvatar-root { width: 34px; height: 34px; }\nhtml.cx-ready main.MuiBox-root, html.cx-ready .skinBody { max-width: none !important; }\nhtml.cx-ready #dashboardPage .padded-left, html.cx-ready .dashboardContent { padding-left: clamp(16px, 2vw, 36px); padding-right: clamp(16px, 2vw, 36px); }\nhtml.cx-ready .dashboardColumn { max-width: none; }\n\n/* drawer header (server name + version) */\nhtml.cx-ready .MuiDrawer-paper a.MuiListItemButton-root[href=\"#/\"] { background: none !important; border: 0 !important; box-shadow: none !important; margin: 12px 10px 8px !important; padding: 8px 10px !important; gap: 12px; align-items: center; }\nhtml.cx-ready .MuiDrawer-paper a.MuiListItemButton-root[href=\"#/\"]:hover { background: rgba(255,255,255,.05) !important; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemIcon-root { min-width: 0 !important; margin: 0; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] img { width: 36px; height: 36px; object-fit: contain; display: block; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-root { margin: 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-primary { font-size: 17px !important; font-weight: 800 !important; line-height: 1.15; letter-spacing: -.01em; margin: 0; }\nhtml.cx-ready .MuiDrawer-paper a[href=\"#/\"] .MuiListItemText-secondary { font-size: 12px !important; line-height: 1.1; color: #8a8a94 !important; margin: 0; }\n\n/* ---------- Discover filter bar + genre tiles ---------- */\n.dc-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 6px var(--pad) 26px; padding: 10px; border-radius: 22px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); backdrop-filter: blur(14px); }\n.dc-segs { display: inline-flex; padding: 4px; border-radius: 999px; background: rgba(255,255,255,.07); gap: 2px; }\n.dc-seg { height: 36px; padding: 0 18px; border-radius: 999px; background: transparent; color: #c9c9d0; font: inherit; font-weight: 600; font-size: 14px; cursor: pointer; border: 0; transition: background .2s, color .2s; }\n.dc-seg:hover { color: #fff; }\n.dc-seg.on { background: #fff; color: #000; box-shadow: 0 4px 14px rgba(0,0,0,.35); }\n.dc-sel { position: relative; }\n.dc-sel select { appearance: none; -webkit-appearance: none; height: 44px; min-width: 150px; padding: 0 40px 0 18px; border-radius: 999px; background: rgba(255,255,255,.07); color: #f2f2f5; font: inherit; font-weight: 600; font-size: 14px; border: 1px solid transparent; cursor: pointer; color-scheme: dark; transition: background .2s, border-color .2s; }\n.dc-sel select:hover { background: rgba(255,255,255,.11); }\n.dc-sel select:focus { outline: 0; border-color: rgba(255,255,255,.4); }\n.dc-sel::after { content: ''; position: absolute; right: 18px; top: 50%; width: 7px; height: 7px; border: solid #c9c9d0; border-width: 0 2px 2px 0; transform: translateY(-70%) rotate(45deg); pointer-events: none; }\n.dc-tg { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: #d6d6dc; padding: 0 6px; user-select: none; }\n.dc-tg input { position: absolute; opacity: 0; pointer-events: none; }\n.dc-tg i { position: relative; width: 40px; height: 24px; border-radius: 999px; background: #44444c; transition: background .2s; flex: none; }\n.dc-tg i::after { content: ''; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.4); transition: transform .2s; }\n.dc-tg input:checked + i { background: var(--accent-nf, #e50914); }\n.dc-tg input:checked + i::after { transform: translateX(16px); }\n.dc-tg input:focus-visible + i { box-shadow: 0 0 0 3px rgba(255,255,255,.35); }\n.dc-q { position: relative; flex: 1 1 220px; min-width: 200px; }\n.dc-q svg { position: absolute; left: 16px; top: 50%; width: 18px !important; height: 18px !important; transform: translateY(-50%); opacity: .6; pointer-events: none; }\n.dc-bar .dc-q input[type=text] { width: 100%; box-sizing: border-box; height: 44px; padding: 0 18px 0 44px !important; border-radius: 999px !important; background: rgba(255,255,255,.07) !important; color: #fff; border: 1px solid transparent; font: inherit; font-size: 14px; transition: background .2s, border-color .2s; }\n.dc-bar .dc-q input[type=text]:focus { outline: 0; background: rgba(255,255,255,.1) !important; border-color: rgba(255,255,255,.4); }\n.dc-tiles-w { margin: 0 var(--pad) 30px; }\n.dc-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 12px; }\n.dc-tile { position: relative; height: 84px; border-radius: 16px; border: 0; cursor: pointer; overflow: hidden; text-align: left; padding: 0 18px; color: #fff; font: inherit; background: linear-gradient(135deg, color-mix(in srgb, var(--c) 85%, #000) 0%, color-mix(in srgb, var(--c) 45%, #0b0b0d) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.14); transition: transform .2s, box-shadow .2s, filter .2s; }\n.dc-tile::after { content: ''; position: absolute; right: -22px; bottom: -34px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,.12); }\n.dc-tile b { position: relative; z-index: 1; font-size: 16px; font-weight: 800; letter-spacing: -.01em; text-shadow: 0 2px 10px rgba(0,0,0,.35); }\n.dc-tile:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 34px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2); filter: brightness(1.08); }\n@media (max-width: 700px) { .dc-bar { margin-inline: 12px; } .dc-tiles { grid-template-columns: repeat(2, 1fr); } .dc-tiles-w { margin-inline: 12px; } .dc-bar .dc-q { flex-basis: 100%; } }\n\n/* ---------- new row types: Top 10, spotlight, genre tiles ---------- */\n.nf-card.t10c { margin-left: 74px; }\n.nf-card.t10c .n { position: absolute; left: -78px; bottom: 34px; z-index: 0; font-size: clamp(120px, 10.5vw, 180px); line-height: .8; width: 80px; text-align: right; font-weight: 900; letter-spacing: -.08em; color: #0b0b0d; -webkit-text-stroke: 3px #6b6b73; pointer-events: none; font-family: Inter, sans-serif; transition: -webkit-text-stroke-color .25s; }\n.nf-card.t10c:hover .n { -webkit-text-stroke-color: #fff; }\n.nf-card.t10c .im, .nf-card.t10c .title { position: relative; z-index: 1; }\n.nf-row.top10 .nf-card.t10c:nth-child(n+10) { margin-left: 120px; } .nf-row.top10 .nf-card.t10c:nth-child(n+10) .n { left: -128px; }\n.nf-card.thumb.spot { width: clamp(280px, 30vw, 520px); }\n.nf-card.spot .im { border-radius: 18px; overflow: hidden; }\n.nf-card.spot .im::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.25) 38%, transparent 60%); pointer-events: none; z-index: 1; }\n.spot-info { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 16px 18px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }\n.spot-info b { font-size: clamp(17px, 1.5vw, 24px); font-weight: 800; letter-spacing: -.02em; text-shadow: 0 2px 14px rgba(0,0,0,.7); }\n.spot-logo { max-width: 60%; max-height: 64px; object-fit: contain; filter: drop-shadow(0 4px 14px rgba(0,0,0,.7)); }\n.spot-info small { color: #d6d6dc; font-weight: 600; font-size: 12.5px; }\n.nf-card.spot .title { display: none; }\n.nf-row.tiles .nf-card.gtile { width: clamp(150px, 14vw, 240px); height: clamp(78px, 7.4vw, 120px); border-radius: 16px; display: flex; align-items: flex-end; padding: 14px 16px; box-sizing: border-box; text-decoration: none; color: #fff; overflow: hidden; background: linear-gradient(135deg, color-mix(in srgb, var(--c) 88%, #000), color-mix(in srgb, var(--c) 40%, #0b0b0d)); box-shadow: inset 0 1px 0 rgba(255,255,255,.14); transition: transform .2s, filter .2s; }\n.nf-row.tiles .nf-card.gtile::after { content: ''; position: absolute; right: -26px; top: -30px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,.12); }\n.nf-row.tiles .nf-card.gtile b { position: relative; z-index: 1; font-size: 16px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,.4); }\n@media (hover: hover) { .nf-row.tiles .nf-card.gtile:hover { transform: translateY(-3px) scale(1.03); filter: brightness(1.1); } }\n@media (max-width: 700px) { .nf-card.t10c { margin-left: 56px; } .nf-card.t10c .n { font-size: 110px; left: -58px; } .nf-card.thumb.spot { width: 78vw; } }\nhtml.cx-tv .nf-card.t10c .n { font-size: 130px; }\n\n/* ---------- search page ---------- */\n.srx-page > h1 { font-size: clamp(26px, 3vw, 40px); font-weight: 800; letter-spacing: -.02em; margin-bottom: 18px; }\n.srx-top { position: relative; min-height: 300px; border-radius: 24px; overflow: hidden; margin: 8px 0 30px; cursor: pointer; display: flex; align-items: flex-end; background: #1a1a1e; box-shadow: 0 24px 60px rgba(0,0,0,.45); }\n.srx-top-bg { position: absolute; inset: 0; background-size: cover; background-position: center 25%; transition: transform .6s; }\n.srx-top:hover .srx-top-bg { transform: scale(1.04); }\n.srx-top::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(11,11,13,.92) 0%, rgba(11,11,13,.55) 50%, rgba(11,11,13,.1) 100%), linear-gradient(0deg, rgba(11,11,13,.7), transparent 55%); }\n.srx-top-in { position: relative; z-index: 2; padding: clamp(22px, 3vw, 44px); max-width: 640px; }\n.srx-top-in small { text-transform: uppercase; letter-spacing: .14em; font-weight: 700; color: #b9b9c2; font-size: 11.5px; }\n.srx-top-in h2 { margin: 6px 0 10px; font-size: clamp(26px, 3.4vw, 46px); font-weight: 900; letter-spacing: -.03em; line-height: 1.05; }\n.srx-top-in p { margin: 12px 0 18px; color: #dcdce2; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\n.srx-h { font-size: 20px; font-weight: 800; margin: 26px 0 14px; }\n.nf-card.person { width: clamp(120px, 10vw, 170px); text-decoration: none; color: inherit; text-align: center; }\n.nf-card.person .pi { aspect-ratio: 1; border-radius: 50%; background-size: cover; background-position: center top; background-color: #26262b; box-shadow: 0 10px 28px rgba(0,0,0,.4); transition: transform .25s; }\n.nf-card.person:hover .pi { transform: scale(1.05); }\n.nf-card.person .title { margin-top: 10px; justify-content: center; }\n.srx-people { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }\n\n/* ---------- lyrics panel ---------- */\n.sp-lyrics { display: flex; flex-direction: column; }\n.lyr-song { display: flex; flex-direction: column; margin: 6px 0 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.08); min-width: 0; }\n.lyr-song span { color: #9a9aa4; font-size: 13px; }\n.lyr-body { flex: 1; overflow-y: auto; padding: 22vh 4px 30vh; scrollbar-width: none; mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent); -webkit-mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent); }\n.lyr-body::-webkit-scrollbar { display: none; }\n.lyr-l { margin: 0 0 14px; font-size: clamp(20px, 1.7vw, 28px); line-height: 1.25; font-weight: 800; letter-spacing: -.02em; color: #e8e8ec; transition: color .3s, transform .3s, opacity .3s; transform-origin: left center; }\n.lyr-l.gap { opacity: .35; }\n.lyr-body.sync .lyr-l { color: #5d5d66; cursor: pointer; }\n.lyr-body.sync .lyr-l.past { color: #7d7d86; }\n.lyr-body.sync .lyr-l.on { color: #fff; transform: scale(1.04); }\n.lyr-body.sync .lyr-l:hover:not(.on) { color: #b7b7c0; }\n\n/* ---------- music: sidebar, player, details ---------- */\n#cx-sp .sp-side { background: #0a0a0c; gap: 0; padding: 0; border-right: 1px solid rgba(255,255,255,.06); }\n#cx-sp .sp-side .sp-card { background: transparent; border-radius: 0; box-shadow: none; }\n#cx-sp .sp-side .sp-top { padding: 18px 12px 10px; border-bottom: 1px solid rgba(255,255,255,.06); }\n#cx-sp .sp-navlink { border-radius: 12px; padding: 11px 14px; font-weight: 600; transition: background .15s, color .15s; }\n#cx-sp .sp-navlink:hover { background: rgba(255,255,255,.07); }\n#cx-sp .sp-navlink.on { background: rgba(255,255,255,.1); color: #fff; }\n#cx-sp .sp-navlink svg { width: 22px; height: 22px; }\n#cx-sp .sp-lib { padding: 8px 6px 0; }\n#cx-sp .sp-li { position: relative; border-radius: 12px; }\n#cx-sp .sp-li .art { position: relative; }\n#cx-sp .li-play { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.55); border-radius: inherit; opacity: 0; transition: opacity .15s; }\n#cx-sp .li-play svg { width: 22px; height: 22px; fill: #fff; }\n@media (hover: hover) { #cx-sp .sp-li:hover .li-play { opacity: 1; } }\n#cx-sp .sp-main { border-radius: 0; }\n/* one consistent icon language in the player: 20px outline, big ones filled */\n#cx-sp .sp-player .pl-btn svg { width: 20px; height: 20px; stroke-width: 1.8; }\n#cx-sp .sp-player .pl-r { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }\n#cx-sp .sp-player .pl-r .pl-btn { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; }\n#cx-sp .sp-player .pl-r .pl-btn:hover { background: rgba(255,255,255,.08); }\n#cx-sp .sp-player { align-items: center; }\n.sp-lyrics .pl-btn, .sp-queue .pl-btn { width: 34px; height: 34px; display: grid; place-items: center; }\n/* download queue */\n.dl-list { display: flex; flex-direction: column; gap: 8px; max-width: 820px; }\n.dl-row { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border-radius: 14px; background: rgba(255,255,255,.05); }\n.dl-row .cv { width: 52px; height: 52px; border-radius: 8px; background-size: cover; background-color: #26262b; flex: none; }\n.dl-row .tx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }\n.dl-row .tx span { color: #9a9aa4; font-size: 13px; }\n.dl-row .bar { height: 4px; border-radius: 4px; background: rgba(255,255,255,.12); overflow: hidden; margin-top: 4px; }\n.dl-row .bar i { display: block; height: 100%; background: var(--accent-nf, #1ed760); border-radius: 4px; }\n.dl-row em { font-style: normal; font-weight: 700; color: #cfcfd5; }\n.nf-card.spot { cursor: pointer; transition: transform .25s, box-shadow .25s; }\n@media (hover: hover) { .nf-card.spot:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 18px 44px rgba(0,0,0,.55); } }\n.nf-card.spot .im .info { display: none !important; }\n\n/* ---------- music on phones: closer to the real Spotify app ---------- */\n@media (max-width: 800px) {\n  #cx:not(.mode-nf) .cx-tabs { left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; border-radius: 0 !important; border: 0 !important; margin: 0 !important; padding: 8px 4px calc(8px + env(safe-area-inset-bottom)) !important; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.92) 38%, #000 100%) !important; backdrop-filter: none !important; box-shadow: none !important; justify-content: space-around; }\n  #cx:not(.mode-nf) .cx-tabs a { font-size: 10.5px; gap: 4px; color: #a7a7ad; font-weight: 500; }\n  #cx:not(.mode-nf) .cx-tabs a.on { color: #fff; }\n  #cx:not(.mode-nf) .cx-tabs a svg { width: 24px; height: 24px; }\n  #cx-sp .sp-header { padding: 10px 14px; }\n  #cx-sp .sp-chip { height: 32px; padding: 0 14px; font-size: 13.5px; font-weight: 600; border-radius: 999px; background: #2a2a2e; color: #fff; display: inline-flex; align-items: center; }\n  #cx-sp .sp-chip.on { background: #1ed760; color: #000; }\n  .sp-mini { margin: 0 8px 62px !important; border-radius: 10px !important; background: var(--tint, #3a2a2a) !important; box-shadow: 0 6px 18px rgba(0,0,0,.45); }\n  .dl-row { padding: 8px 10px; }\n}\n\n.sp-full .f-lyr { margin: 22px 16px 28px; padding: 16px 18px 20px; border-radius: 16px; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); cursor: pointer; }\n.sp-full .f-lyr b { font-size: 13px; letter-spacing: .02em; opacity: .85; }\n.sp-full .f-lyr .ln { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }\n.sp-full .f-lyr p { margin: 0; font-size: 19px; line-height: 1.3; font-weight: 800; color: rgba(255,255,255,.5); letter-spacing: -.01em; }\n.sp-full .f-lyr p.on { color: #fff; }\n.sp-full { overflow-y: auto; }\n\n/* track list (desktop): header and rows share one grid, number, time and actions line up */\n@media (min-width: 801px) {\n.sp-th, .sp-row { grid-template-columns: 28px minmax(0, 6fr) minmax(0, 4fr) 150px !important; column-gap: 16px; }\n.sp-th.noalb, .sp-row.noalb { grid-template-columns: 28px minmax(0, 1fr) 150px !important; }\n.sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }\n.sp-row .du .tm { min-width: 42px; text-align: right; font-variant-numeric: tabular-nums; }\n.sp-th > :last-child { text-align: right; padding-right: 50px; }\n.sp-row .ti, .sp-row .tx { min-width: 0; }\n.sp-row .du .lk, .sp-row .du .mo { width: 32px; height: 32px; display: grid; place-items: center; }\n.sp-th > :first-child { text-align: center; }\n.sp-row .ix { display: grid; place-items: center; width: 28px; justify-self: center; }\n.sp-row .ix .n, .sp-row .ix .pl, .sp-row .ix .eq { grid-area: 1 / 1; }\n}\n/* seek bars: always a visible knob on touch screens */\n@media (max-width: 800px), (pointer: coarse) { .bar b { opacity: 1 !important; width: 12px; height: 12px; top: 50%; transform: translateY(-50%); } .bar { min-height: 16px; display: flex; align-items: center; position: relative; } }\n/* full-screen player on phones */\n@media (max-width: 800px) {\n  #cx .sp-full.open { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; max-width: none !important; border-radius: 0 !important; padding-left: 22px; padding-right: 22px; box-sizing: border-box; }\n  .sp-full .top { height: 52px; }\n  .sp-full .top .tops { display: flex; gap: 4px; }\n  .sp-full .top .pl-btn { width: 44px; height: 44px; display: grid; place-items: center; }\n  .sp-full .top .pl-btn svg { width: 24px !important; height: 24px !important; stroke-width: 1.8; }\n  .sp-full .cvbig { margin: 18px auto 34px !important; }\n  .sp-full .meta { margin: 0 auto 14px !important; padding-top: 2px; }\n  .sp-full .ctr .pl-btn:not(.big) svg { width: 26px; height: 26px; stroke-width: 1.8; }\n  #cx-sp .sp-header .sp-chips { flex: 1; min-width: 0; overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent); mask-image: linear-gradient(90deg, #000 88%, transparent); padding-right: 24px; }\n  #cx-sp .sp-header .sp-chips::-webkit-scrollbar { display: none; }\n  #cx-sp .sp-header .sp-chip { flex: none; }\n}\n/* lyrics + queue as a full-screen layer above the player on phones */\n@media (max-width: 800px) {\n  #cx > .sp-queue { position: fixed; inset: 0; z-index: 9800; width: 100%; height: 100dvh; border-radius: 0; padding: max(14px, env(safe-area-inset-top)) 22px 0; box-sizing: border-box; background: linear-gradient(180deg, var(--tint, #4a3a2a), #121212 92%); display: flex; flex-direction: column; overflow: hidden; }\n  #cx > .sp-queue:not(.sp-lyrics) { overflow-y: auto; display: block; }\n}\n.lyr-foot { padding: 10px 0 calc(18px + env(safe-area-inset-bottom, 0)); display: flex; flex-direction: column; gap: 10px; background: linear-gradient(0deg, rgba(18,18,18,.96) 60%, transparent); }\n.lyr-ctr { display: flex; justify-content: center; align-items: center; gap: 26px; }\n.lyr-ctr .pl-btn { width: 44px; height: 44px; display: grid; place-items: center; }\n.lyr-ctr .pl-btn.big { width: 60px; height: 60px; border-radius: 50%; background: #fff; color: #000; }\n.lyr-ctr .pl-btn.big svg { fill: #000; }\n.sp-lyrics .lyr-body { flex: 1 1 0; min-height: 0; }\n.sp-lyrics .lyr-song { border: 0; }\n\n/* ---------- phones: lists, chips, mini player, full player ---------- */\n@media (max-width: 800px) {\n  #cx-sp .sp-header { width: 100%; box-sizing: border-box; }\n  #cx-sp .sp-header > div[style*=\"flex:1\"] { display: none; }\n  #cx-sp .sp-header .sp-chips { -webkit-mask-image: linear-gradient(90deg, #000 94%, transparent); mask-image: linear-gradient(90deg, #000 94%, transparent); }\n  /* mini player sits directly on the tab bar */\n  #cx .sp-mini { bottom: calc(56px + env(safe-area-inset-bottom, 0px)) !important; margin: 0 8px !important; height: 58px; gap: 6px; padding-right: 4px; }\n  #cx .sp-mini .mlike .pl-btn, #cx .sp-mini .mlike button { width: 38px; height: 38px; display: grid; place-items: center; color: #fff; }\n  #cx .sp-mini .mlike svg { width: 22px; height: 22px; }\n  #cx .sp-mini .mbar { position: absolute; left: 10px; right: 10px; bottom: 0; height: 22px; background: none; touch-action: none; display: flex; align-items: flex-end; padding-bottom: 3px; box-sizing: border-box; }\n  #cx .sp-mini .mtrack { position: relative; width: 100%; height: 3px; border-radius: 3px; background: rgba(255,255,255,.38); }\n  #cx .sp-mini .mbar i { position: absolute; left: 0; top: 0; height: 100%; width: 0; background: #fff; border-radius: 3px; }\n  #cx .sp-mini .mknob { position: absolute; top: 50%; width: 10px; height: 10px; margin-left: -5px; margin-top: -5px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.5); left: 0; transition: transform .15s; }\n  #cx .sp-mini .mbar.drag .mknob { transform: scale(1.5); }\n  #cx .sp-mini .mbar.drag .mtrack { height: 5px; }\n  /* full player: slides up from the mini player, controls near the bottom like Spotify */\n  #cx:not(.mode-nf) .sp-full { display: flex !important; transform: translateY(100%); visibility: hidden; transition: transform .45s cubic-bezier(.22,.9,.2,1), visibility 0s linear .45s; animation: none !important; }\n  #cx:not(.mode-nf) .sp-full.open { transform: none; visibility: visible; transition: transform .45s cubic-bezier(.22,.9,.2,1), visibility 0s; }\n  .sp-full .cvbig { transform: scale(.9); opacity: .4; transition: transform .6s cubic-bezier(.22,.9,.2,1) .08s, opacity .45s .08s; }\n  .sp-full.open .cvbig { transform: none; opacity: 1; }\n  .sp-full .top, .sp-full .meta, .sp-full .seekwrap, .sp-full .ctr, .sp-full .f-lyr { transition: opacity .4s .12s, transform .5s cubic-bezier(.22,.9,.2,1) .1s; }\n  .sp-full:not(.open) .meta, .sp-full:not(.open) .seekwrap, .sp-full:not(.open) .ctr, .sp-full:not(.open) .f-lyr { opacity: 0; transform: translateY(24px); }\n  .sp-full.open { justify-content: flex-start; }\n  .sp-full .cvbig { flex: 0 1 auto; max-height: 46vh; }\n  .sp-full .meta { margin-top: auto !important; }\n  .sp-full .ctr { margin-bottom: 8px !important; }\n  .sp-full .f-lyr { margin: 14px 0 6px; }\n  /* song lists on phones keep their own compact layout */\n  .sp-row { grid-template-columns: minmax(0, 1fr) auto !important; column-gap: 10px; }\n  .sp-row .ix, .sp-row .al { display: none !important; }\n  .sp-row .ti { min-width: 0; }\n  .sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }\n  .sp-row .du .tm { display: none; }\n  .sp-row .du .lk, .sp-row .du .mo { width: 38px; height: 38px; display: grid; place-items: center; }\n}\n/* lyrics + queue panel: one left edge, empty state, controls at the bottom */\n.sp-queue, .sp-lyrics { padding-left: 20px; padding-right: 20px; }\n.sp-queue h3, .sp-lyrics h3 { margin: 0; padding: 0; font-size: 17px; }\n.lyr-song { padding: 4px 0 12px; }\n.sp-lyrics > .nf-empty { flex: 1; display: grid; place-items: center; padding: 0 !important; }\n.lyr-foot { margin-top: auto; }\n@media (max-width: 800px) { #cx > .sp-lyrics .lyr-body { flex: 1 1 0; } }\n.sp-tile .cv { margin: 0 0 14px; }\n\n/* ---------- scroll performance ---------- */\n#cx .nf-card .im { will-change: auto; }\n/* spotlight: labels readable on any backdrop */\n.nf-card.spot .im::after { background: linear-gradient(0deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.55) 34%, rgba(0,0,0,.12) 62%, transparent) !important; }\n.spot-info small { display: inline-block; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.55); color: #fff !important; text-shadow: 0 1px 3px rgba(0,0,0,.8); backdrop-filter: blur(6px); }\n.spot-info b { text-shadow: 0 2px 12px rgba(0,0,0,.9), 0 0 2px rgba(0,0,0,.8); }\n/* top 10: a static heavy font (the variable font drew its overlapping contours inside the outline) */\n.nf-card.t10c .n { font-family: \"Arial Black\", \"Helvetica Neue\", Impact, Arial, sans-serif !important; font-weight: 900 !important; letter-spacing: -.06em; -webkit-text-stroke: 0; color: #0b0b0d; paint-order: stroke fill; text-shadow: -3px -3px 0 #6b6b73, 3px -3px 0 #6b6b73, -3px 3px 0 #6b6b73, 3px 3px 0 #6b6b73, 0 -3px 0 #6b6b73, 0 3px 0 #6b6b73, -3px 0 0 #6b6b73, 3px 0 0 #6b6b73; width: auto; min-width: 80px; }\n.nf-card.t10c:hover .n { text-shadow: -3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0 -3px 0 #fff, 0 3px 0 #fff, -3px 0 0 #fff, 3px 0 0 #fff; }\n\n/* selected genre (Discover tiles, home tiles with the remote) */\n.dc-tile.on { outline: 3px solid #fff; outline-offset: 3px; }\n.dc-tile:focus-visible, .nf-row.tiles .nf-card.gtile:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }\nhtml.cx-tv .nf-row.tiles .nf-card.gtile.tvf-on { outline: 4px solid #fff; outline-offset: 4px; transform: scale(1.04); filter: brightness(1.12); box-shadow: 0 0 0 1px rgba(255,255,255,.2), 0 18px 44px rgba(0,0,0,.55); z-index: 3; }\nhtml.cx-tv .nf-row.tiles .nf-card.gtile { transition: transform .18s ease, outline-color .18s ease, filter .18s ease; }\n/* TV Top 10: room for the first number */\nhtml.cx-tv .nf-row.top10 .nf-scroller { padding-left: 150px !important; }\nhtml.cx-tv .nf-row.top10 .nf-card.t10c:first-child { margin-left: 0 !important; }\n/* dashboard: breathing room under the app bar */\nhtml.cx-ready main.MuiBox-root > :first-child { margin-top: 14px; }\nhtml.cx-ready #dashboardPage, html.cx-ready .dashboardContent { padding-top: 12px; }\n\n/* ratings placeholder: same height as the finished chips */\n.rt-row.rt-ph { min-height: 34px; align-items: center; }\n.rt-chip.sk { width: 150px; height: 30px; border-radius: 999px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06)); background-size: 200% 100%; animation: rtsk 1.2s linear infinite; }\n@keyframes rtsk { to { background-position: -200% 0; } }\n.rt-row.rt-in .rt-chip { animation: cxfade .3s both; }\n/* TV: lighter focus visuals (outline only, no blurred glow on every card) */\nhtml.cx-tv .nf-card.tvf-on .im, html.cx-tv .nf-person.tvf-on .pi { box-shadow: none !important; transform: none !important; }\nhtml.cx-tv .nf-card .im, html.cx-tv .nf-person .pi { transition: none !important; }\n/* any other focused element (genre tiles, segmented buttons, switches...) still gets a visible ring */\nhtml.cx-tv #cx :where(.tvf-on):not(.nf-card):not(.nf-person):not(.btn):not(.sp-row):not(.sp-li):not(.sp-navlink):not(.sp-chip):not(.sp-card):not(.sp-top1):not(.pl-btn):not(.nf-chip):not(.cxd-chip):not(.cxd-opt):not(.cxd-res):not(.nf-ep):not(input):not(select):not(textarea):not(.set-switch) { outline: 4px solid #fff; outline-offset: 3px; border-radius: 14px; }\n\n/* ---------- video player: modern pass ---------- */\n#cx-player .pl-loadbg { position: absolute; inset: -6%; background-size: cover; background-position: center; filter: blur(30px) brightness(.4) saturate(1.2); opacity: 0; transition: opacity .5s; z-index: 0; pointer-events: none; }\n#cx-player.loading .pl-loadbg { opacity: 1; }\n#cx-player video { transition: opacity .4s; background: #000; }\n#cx-player.loading video { opacity: 0; }\n#cx-player .pl-center { z-index: 3; }\n#cx-player .pl-spin { width: 54px; height: 54px; border-width: 3px; }\n#cx-player .pl-bar { background: linear-gradient(0deg, rgba(0,0,0,.82), rgba(0,0,0,.45) 60%, transparent); padding-top: 54px; }\n#cx-player .pl-row { gap: 6px; align-items: center; }\n#cx-player .pl-row button { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; transition: background .15s, transform .15s; }\n#cx-player .pl-row button:hover { background: rgba(255,255,255,.14); }\n#cx-player .pl-row button:active { transform: scale(.92); }\n#cx-player .pl-row svg, #cx-player .pl-bigctl svg { width: 24px; height: 24px; stroke-width: 1.7; }\n#cx-player .pl-row .lu-skip, #cx-player .pl-bigctl .lu-skip { width: 28px; height: 28px; stroke-width: 1.7; }\n#cx-player .pl-pp { width: 48px !important; height: 48px !important; background: #fff !important; color: #000 !important; }\n#cx-player .pl-pp svg { fill: #000; stroke: #000; }\n#cx-player .pl-seek { height: 6px; border-radius: 6px; }\n#cx-player .pl-bigctl { gap: clamp(34px, 9vw, 90px); }\n#cx-player .pl-bigctl button { width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.35); backdrop-filter: blur(8px); display: grid; place-items: center; }\n#cx-player .pl-bigctl .pl-bigpp { width: 84px; height: 84px; background: rgba(255,255,255,.95); color: #000; }\n#cx-player .pl-bigctl .pl-bigpp svg { width: 36px; height: 36px; fill: #000; stroke: #000; }\n#cx-player .pl-top { background: linear-gradient(180deg, rgba(0,0,0,.7), transparent); }\n#cx-player .pl-ttl .pl-title { font-weight: 800; letter-spacing: -.01em; }\n#cx-player .pl-settings { border-radius: 22px; background: rgba(22,22,26,.92); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.08); }\n.pl-stepper { display: inline-flex; align-items: center; gap: 6px; }\n.pl-stepper button { min-width: 44px; height: 38px; border-radius: 999px; background: rgba(255,255,255,.1); color: #fff; font-weight: 700; padding: 0 12px; }\n.pl-stepper button:hover { background: rgba(255,255,255,.2); }\n.pl-stepper .pl-delayv { min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; }\n.pl-seg button.on { background: #fff; color: #000; }\n\n/* ---------- scrollbars: slim, transparent track, thumb appears on hover ---------- */\nhtml, html * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.2) transparent; }\n@supports selector(::-webkit-scrollbar) {\n  html, html * { scrollbar-width: auto; scrollbar-color: auto; }\n  html ::-webkit-scrollbar { width: 12px; height: 12px; background: transparent; }\n  html ::-webkit-scrollbar-track { background: transparent; }\n  html ::-webkit-scrollbar-corner { background: transparent; }\n  html ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }\n  html ::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.12); border: 4px solid transparent; border-radius: 12px; background-clip: padding-box; min-height: 48px; min-width: 48px; transition: background-color .25s; }\n  html *:hover::-webkit-scrollbar-thumb, html ::-webkit-scrollbar-thumb:active { background-color: rgba(255,255,255,.22); }\n  html ::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.4); }\n  html body::-webkit-scrollbar-thumb, html::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.16); }\n}\n/* rows that already have arrows or are swiped: no bar at all */\n#cx .nf-scroller, #cx .sp-shelf, #cx .dc-bar, #cx .sp-chips, #cx .nf-seasons, #cx .nf-row-scroll { scrollbar-width: none; }\n#cx .nf-scroller::-webkit-scrollbar, #cx .sp-shelf::-webkit-scrollbar, #cx .dc-bar::-webkit-scrollbar, #cx .sp-chips::-webkit-scrollbar, #cx .nf-seasons::-webkit-scrollbar, #cx .nf-row-scroll::-webkit-scrollbar { display: none; height: 0; width: 0; }\n\n#cx-nf::-webkit-scrollbar-thumb, #cx-ui ::-webkit-scrollbar-thumb, .sp-scroll::-webkit-scrollbar-thumb, .cxd-body::-webkit-scrollbar-thumb, .sr-modal::-webkit-scrollbar-thumb, .set-main::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.2); }\n#cx-nf:hover::-webkit-scrollbar-thumb, .sp-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.38); }\n#cx-nf::-webkit-scrollbar-thumb:hover, .sp-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,.5); }\n\n/* page asleep while the native TV player runs: no pictures kept in memory */\nhtml.cx-sleep #cx .bgi, html.cx-sleep #cx .nf-dback, html.cx-sleep #cx .nf-slide, html.cx-sleep #cx [style*=\"background-image\"] { background-image: none !important; }\nhtml.cx-sleep #cx img { visibility: hidden; content-visibility: hidden; }\n\nhtml.cx-tv .nf-row.cx-far .bgi, html.cx-tv .nf-sect.cx-far .bgi, html.cx-tv .nf-row.cx-far .pi { background-image: none !important; }\nhtml.cx-tv .nf-row { contain: layout style; }\n\n/* ---------- Letterboxd + archive ---------- */\n.dmark.seen { left: auto; right: 10px; background: rgba(30,215,96,.22); border-color: rgba(30,215,96,.5); color: #8cf0b0; }\n.dmark.arch { background: rgba(255,255,255,.14); }\n.sr-status .dmark { position: static; display: inline-flex; margin-right: 8px; }\n.arch-intro { max-width: 640px; color: #a8a8b2; margin: 0 0 22px; line-height: 1.55; }\n.nf-card.arch .im::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,.18); }\n.arch-steps { margin: 6px 0 14px; padding-left: 20px; color: #d6d6dc; line-height: 1.7; }\n.arch-size { margin: 0 0 12px; color: #c9c9d0; }\n.arch-opt { display: flex; gap: 10px; align-items: center; margin: 6px 0 12px; cursor: pointer; }\n.arch-warn { color: #e8b0b0; }\n.arch-hero { height: 180px; margin: -20px -26px 16px; background-size: cover; background-position: center 25%; -webkit-mask-image: linear-gradient(#000 60%, transparent); mask-image: linear-gradient(#000 60%, transparent); }\n.arch-top { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 16px; }\n.arch-poster { flex: none; width: 120px; aspect-ratio: 2/3; border-radius: 12px; background-size: cover; background-position: center; box-shadow: 0 10px 28px rgba(0,0,0,.5); }\n.arch-ov { margin: 0; color: #d4d4da; line-height: 1.55; }\n.lb-stat { color: #a8a8b2; font-size: 13.5px; }\n.set-p { margin: 0 0 14px; color: #a8a8b2; line-height: 1.55; font-size: 14px; }\n\n.nf-card .dmark.seen .dtx { display: none; } .nf-card .dmark.seen { padding: 5px 7px; }\n\n.rt-chip.lb-chip small { margin-left: 6px; }\n\n/* ---------- Film Quiz ---------- */\n.gm-page { max-width: 1320px; margin: 0 auto; }\n.gm-loading { text-align: center; color: #9a9aa4; }\n.gm-lbnote { color: #9a9aa4; font-size: 13px; margin: -6px 0 16px; }\n.gm-face { background: #26262b center 20% / cover no-repeat; border-radius: 50%; flex: none; }\n.gm-face.xl { width: clamp(150px, 26vh, 230px); height: clamp(150px, 26vh, 230px); margin: 0 auto; box-shadow: 0 18px 50px rgba(0,0,0,.55), 0 0 0 4px rgba(255,255,255,.06); }\n.gm-face.md { width: 96px; height: 96px; }\n.gm-face.sm { width: 58px; height: 58px; }\n.gm-face.st { width: 54px; height: 54px; margin-left: -16px; box-shadow: 0 0 0 3px #16161a; }\n.gm-face.st:first-child { margin-left: 0; }\n.gm-face.mini { width: 100%; height: 100%; }\n.gm-face.pc { width: 74px; height: 74px; margin: 0 auto 8px; }\n.gm-face.opt { width: 100%; aspect-ratio: 1; height: auto; }\n.gm-face.tile { width: 100%; height: 100%; border-radius: 12px; }\n.gm-stars { display: inline-flex; gap: 3px; vertical-align: middle; }\n.gm-stars i { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,.14); }\n.gm-stars i.on { background: #f5c518; box-shadow: 0 0 6px rgba(245,197,24,.5); }\n.gm-stars.sm i { width: 6px; height: 6px; }\n.gm-xpb { height: 8px; border-radius: 8px; background: rgba(255,255,255,.1); overflow: hidden; }\n.gm-xpb i { display: block; height: 100%; border-radius: 8px; background: linear-gradient(90deg, var(--accent-nf, #e50914), #f5c518); transition: width .6s cubic-bezier(.2,.8,.2,1); }\n\n/* header */\n.gm-head { display: flex; gap: 20px; align-items: stretch; justify-content: space-between; flex-wrap: wrap; margin-bottom: 22px; }\n.gm-lv { display: flex; gap: 20px; align-items: center; flex: 1 1 420px; min-width: 0; }\n.gm-lvn { width: 92px; height: 92px; flex: none; border-radius: 28px; display: grid; place-content: center; text-align: center; background: linear-gradient(140deg, var(--accent-nf, #e50914), #7a0a12); box-shadow: 0 14px 40px rgba(229,9,20,.28); }\n.gm-lvn small { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; opacity: .8; }\n.gm-lvn b { font-size: 40px; line-height: 1; font-weight: 900; }\n.gm-lvi { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }\n.gm-page .gm-lvi h1 { margin: 0; }\n.gm-lvi p { margin: 0; color: #c9c9d1; font-weight: 600; }\n.gm-lvi small { color: #8d8d97; font-size: 12.5px; }\n.gm-lvi .gm-xpb { max-width: 460px; }\n.gm-pills { display: flex; gap: 12px; flex-wrap: wrap; }\n.gm-pill { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 20px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); min-width: 170px; }\n.gm-pill b { display: block; font-size: 22px; font-weight: 800; }\n.gm-pill small { color: #9a9aa4; font-size: 12.5px; }\n.gm-pill .e { font-size: 30px; filter: grayscale(1) opacity(.5); }\n.gm-pill.hot .e { filter: none; animation: gm-flame 1.6s ease-in-out infinite; }\n@keyframes gm-flame { 50% { transform: scale(1.12) rotate(-4deg); } }\n.gm-ringw { position: relative; width: 54px; height: 54px; }\n.gm-ringw span { position: absolute; inset: 0; display: grid; place-items: center; font-size: 12px; font-weight: 800; }\n.gm-ring { width: 54px; height: 54px; transform: rotate(-90deg); }\n.gm-ring circle { fill: none; stroke-width: 7; stroke-linecap: round; }\n.gm-ring .bg { stroke: rgba(255,255,255,.1); }\n.gm-ring .fg { stroke: #1ed760; transition: stroke-dashoffset .8s; }\n\n/* training banner */\n.gm-train { display: flex; align-items: center; gap: 26px; padding: 26px 30px; border-radius: 26px; cursor: pointer; background: radial-gradient(120% 160% at 0% 0%, rgba(229,9,20,.35), transparent 60%), linear-gradient(120deg, #1d1d23, #141418); border: 1px solid rgba(255,255,255,.08); transition: transform .2s, border-color .2s; }\n.gm-train:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.18); }\n.gm-train.calm { background: linear-gradient(120deg, #1a1d1b, #141418); }\n.gm-tfaces { display: flex; flex: none; }\n.gm-ttx { flex: 1; min-width: 0; }\n.gm-ttx h2 { margin: 0 0 4px; font-size: 24px; font-weight: 800; }\n.gm-ttx p { margin: 0 0 10px; color: #b7b7c0; }\n.gm-tchips { display: flex; gap: 8px; }\n.gm-tchips .c { padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; background: rgba(255,255,255,.08); }\n.gm-tchips .due { background: rgba(245,197,24,.16); color: #f5c518; }\n.gm-tchips .new { background: rgba(30,215,96,.14); color: #1ed760; }\n\n/* sections */\n.gm-sec { margin-top: 38px; }\n.gm-sec > h2 { font-size: 21px; font-weight: 800; margin: 0 0 4px; }\n.gm-sec > h3 { font-size: 15px; font-weight: 700; margin: 24px 0 10px; color: #c9c9d1; }\n.gm-secp { color: #8d8d97; margin: 0 0 16px; font-size: 14px; }\n.gm-sec > h2 + .gm-modes, .gm-sec > h2 + .gm-stats, .gm-sec > h2 + .gm-badges, .gm-sec > h2 + .gm-filt { margin-top: 14px; }\n.gm-recent { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }\n.gm-rf { display: flex; gap: 14px; padding: 12px; border-radius: 18px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.05); }\n.gm-rfp { position: relative; width: 92px; aspect-ratio: 2/3; border-radius: 10px; background: #26262b center / cover; flex: none; }\n.gm-rfp .dmark { position: absolute; left: 4px; right: auto; top: auto; bottom: 4px; font-size: 10px; padding: 2px 7px; }\n.gm-rfb { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }\n.gm-rfb > b { font-size: 15px; }\n.gm-rfb > small { color: #8d8d97; }\n.gm-rfc { display: flex; gap: 5px; flex-wrap: wrap; }\n.gm-mini { width: 34px; height: 34px; border-radius: 50%; padding: 0; box-shadow: 0 0 0 2px rgba(255,255,255,.12); transition: transform .15s; }\n.gm-mini:hover { transform: scale(1.12); }\n.gm-mini.b1, .gm-mini.b2 { box-shadow: 0 0 0 2px #f5a623; }\n.gm-mini.b3, .gm-mini.b4 { box-shadow: 0 0 0 2px #4aa3ff; }\n.gm-mini.b5 { box-shadow: 0 0 0 2px #1ed760; }\n.gm-kbar { height: 4px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; }\n.gm-kbar i { display: block; height: 100%; background: #1ed760; }\n.btn.sm { height: 34px; font-size: 13px; padding: 0 14px 0 10px; margin-top: auto; align-self: flex-start; }\n.btn.sm svg { width: 16px; height: 16px; }\n\n.gm-modes { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; }\n.gm-mode { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 20px; border-radius: 20px; text-align: left; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); transition: transform .2s, background .2s; min-height: 150px; }\n.gm-mode:hover, .gm-mode:focus-visible { transform: translateY(-3px); background: rgba(255,255,255,.09); }\n.gm-mode .e { font-size: 34px; line-height: 1; margin-bottom: 4px; }\n.gm-mode b { font-size: 16.5px; }\n.gm-mode small { color: #9a9aa4; font-size: 13px; line-height: 1.4; }\n.gm-mode.m-blitz { background: linear-gradient(150deg, rgba(245,197,24,.14), rgba(255,255,255,.04)); }\n.gm-mode.m-memory { background: linear-gradient(150deg, rgba(255,122,198,.13), rgba(255,255,255,.04)); }\n.gm-mode.m-type { background: linear-gradient(150deg, rgba(74,163,255,.14), rgba(255,255,255,.04)); }\n.gm-mode.m-cast { background: linear-gradient(150deg, rgba(229,9,20,.16), rgba(255,255,255,.04)); }\n.gm-mode.m-cards { background: linear-gradient(150deg, rgba(30,215,96,.12), rgba(255,255,255,.04)); }\n.gm-rec { position: absolute; top: 14px; right: 14px; font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.35); }\n\n.gm-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }\n.gm-tile2 { padding: 16px 18px; border-radius: 16px; background: rgba(255,255,255,.05); }\n.gm-tile2 b { display: block; font-size: 26px; font-weight: 800; }\n.gm-tile2 small { color: #9a9aa4; }\n.gm-mbar { display: flex; height: 10px; border-radius: 10px; background: rgba(255,255,255,.08); overflow: hidden; margin-top: 14px; }\n.gm-mbar .m { background: #1ed760; }\n.gm-mbar .l { background: #4aa3ff; }\n.gm-heat { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 13px); grid-auto-columns: 13px; justify-content: start; gap: 4px; overflow-x: auto; padding-bottom: 4px; }\n.gm-heat i { width: 13px; height: 13px; border-radius: 3px; background: rgba(255,255,255,.06); }\n.gm-heat i.l1 { background: rgba(30,215,96,.25); }\n.gm-heat i.l2 { background: rgba(30,215,96,.45); }\n.gm-heat i.l3 { background: rgba(30,215,96,.7); }\n.gm-heat i.l4 { background: #1ed760; }\n\n.gm-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }\n.gm-pcs, .gm-coll { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; }\n.gm-pc { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 14px 8px; border-radius: 16px; background: rgba(255,255,255,.04); text-align: center; min-width: 0; transition: background .15s; }\n.gm-pc:hover, .gm-pc:focus-visible { background: rgba(255,255,255,.1); }\n.gm-pc b { font-size: 13.5px; max-width: 100%; }\n.gm-pc small { color: #8d8d97; font-size: 12px; }\n.gm-filt { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }\n.gm-find { margin-left: auto; height: 38px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: inherit; padding: 0 16px; min-width: 200px; font: inherit; }\n.gm-more { margin: 16px auto 0; display: flex; }\n.gm-badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }\n.gm-badge { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 3px; padding: 14px 10px; border-radius: 16px; background: rgba(255,255,255,.03); border: 1px dashed rgba(255,255,255,.1); }\n.gm-badge .e { font-size: 30px; filter: grayscale(1) opacity(.3); }\n.gm-badge b { font-size: 13.5px; color: #77777f; }\n.gm-badge small { font-size: 11.5px; color: #66666e; line-height: 1.35; }\n.gm-badge.got { background: linear-gradient(160deg, rgba(245,197,24,.12), rgba(255,255,255,.04)); border: 1px solid rgba(245,197,24,.3); }\n.gm-badge.got .e { filter: none; }\n.gm-badge.got b { color: #fff; }\n.gm-badge.got small { color: #b7b7c0; }\n.gm-badge.pop { animation: gm-pop .6s cubic-bezier(.2,1.6,.4,1) both; }\n@keyframes gm-pop { from { transform: scale(.4); opacity: 0; } }\n.gm-ad { display: flex; gap: 24px; align-items: center; margin-bottom: 18px; }\n.gm-ad .gm-face.xl { margin: 0; width: 140px; height: 140px; }\n.gm-ad h2 { margin: 0 0 8px; }\n.gm-adf { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)) !important; }\n.gm-role { display: block; color: #8d8d97; font-size: 12px; }\n.gm-casth { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }\n.gm-castbtn { font-size: 13px; padding: 6px 14px; }\n\n/* the play layer */\nhtml.gm-open, html.gm-open body { overflow: hidden; }\n.gm-layer { position: fixed; inset: 0; z-index: 9700; display: flex; flex-direction: column; background: radial-gradient(90% 70% at 50% 0%, #26161a, #0d0d10 70%); color: #ececf0; opacity: 0; transition: opacity .22s; }\n.gm-layer.show { opacity: 1; }\n.gm-top { display: flex; align-items: center; gap: 16px; padding: 16px clamp(16px, 4vw, 40px); }\n.gm-x { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.08); flex: none; }\n.gm-x:hover { background: rgba(255,255,255,.16); }\n.gm-pbar { flex: 1; height: 10px; border-radius: 10px; background: rgba(255,255,255,.1); overflow: hidden; }\n.gm-pbar i { display: block; height: 100%; width: 0; border-radius: 10px; background: linear-gradient(90deg, var(--accent-nf, #e50914), #f5c518); transition: width .4s; }\n.gm-hud { display: flex; gap: 12px; align-items: center; font-weight: 700; font-size: 14px; white-space: nowrap; }\n.gm-hxp { color: #f5c518; }\n.gm-hcombo { color: #ff8a3d; animation: gm-pop .4s both; }\n.gm-stage { flex: 1; overflow-y: auto; display: flex; justify-content: center; padding: 8px 16px 40px; }\n.gm-card { width: min(760px, 100%); margin: auto; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; animation: gm-in .3s cubic-bezier(.2,.8,.2,1) both; }\n@keyframes gm-in { from { opacity: 0; transform: translateY(16px); } }\n.gm-q { margin: 0; color: #a8a8b2; font-size: 16px; font-weight: 600; }\n.gm-name { margin: 0; font-size: clamp(24px, 3.4vw, 36px); font-weight: 800; letter-spacing: -.02em; }\n.gm-tag { padding: 5px 14px; border-radius: 999px; font-size: 13px; font-weight: 800; }\n.gm-tag.new { background: rgba(30,215,96,.15); color: #1ed760; }\n.gm-row { display: flex; align-items: center; gap: 20px; text-align: left; }\n.gm-row > div:last-child { display: flex; flex-direction: column; gap: 6px; }\n.gm-poster { width: 100%; aspect-ratio: 2/3; border-radius: 10px; background: #26262b center / cover; }\n.gm-poster.lg { width: 120px; flex: none; box-shadow: 0 14px 40px rgba(0,0,0,.5); }\n.gm-opts { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }\n.gm-opt { position: relative; display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-radius: 16px; background: rgba(255,255,255,.07); border: 2px solid transparent; font-size: 16.5px; font-weight: 700; text-align: left; transition: background .15s, transform .15s, border-color .15s; }\n.gm-opt:hover:not(:disabled), .gm-opt:focus-visible { background: rgba(255,255,255,.13); transform: translateY(-2px); }\n.gm-opt kbd, .gm-next kbd, .gm-cardb kbd { font: 700 11px/1 Inter, sans-serif; padding: 4px 7px; border-radius: 6px; background: rgba(255,255,255,.12); color: inherit; opacity: .7; }\n.gm-opt.ok { border-color: #1ed760; background: rgba(30,215,96,.16); }\n.gm-opt.bad { border-color: #ff4d5a; background: rgba(255,77,90,.14); animation: gm-shake .35s; }\n.gm-opt:disabled { cursor: default; }\n.gm-opt:disabled:not(.ok):not(.bad) { opacity: .5; }\n@keyframes gm-shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }\n.gm-faces { grid-template-columns: repeat(4, 1fr); }\n.gm-faces .gm-opt, .gm-films .gm-opt { flex-direction: column; padding: 10px; gap: 8px; align-items: stretch; }\n.gm-faces .gm-opt kbd, .gm-films .gm-opt kbd { position: absolute; top: 8px; left: 8px; z-index: 1; }\n.gm-films { grid-template-columns: repeat(4, 1fr); }\n.gm-ft { font-size: 13px; text-align: center; line-height: 1.3; }\n.gm-reveal { font-size: 13px; text-align: center; animation: gm-in .3s both; }\n.gm-fb { width: 100%; display: none; flex-direction: column; gap: 12px; padding: 16px 18px; border-radius: 20px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07); text-align: left; animation: gm-in .3s both; }\n.gm-fb.show { display: flex; }\n.gm-fbh { display: flex; gap: 12px; align-items: center; }\n.gm-fbh b { font-size: 18px; }\n.gm-fbh b.ok { color: #1ed760; }\n.gm-fbh b.bad { color: #ff6b75; }\n.gm-fxp { color: #f5c518; font-weight: 800; margin-left: auto; }\n.gm-fbp { display: flex; gap: 14px; align-items: flex-start; }\n.gm-fbn { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }\n.gm-known { display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left; }\n.gm-known > small { color: #8d8d97; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; }\n.gm-kf { display: flex; gap: 10px; flex-wrap: wrap; }\n.gm-kfi { display: flex; gap: 10px; align-items: center; padding: 6px 12px 6px 6px; border-radius: 12px; background: rgba(255,255,255,.05); max-width: 100%; }\n.gm-kp { width: 34px; height: 51px; border-radius: 6px; background: #26262b center / cover; flex: none; }\n.gm-kfi b { display: block; font-size: 13.5px; }\n.gm-kfi span { display: block; font-size: 12.5px; color: #9a9aa4; }\n.gm-intro .gm-known { align-items: center; }\n.gm-intro .gm-kf { justify-content: center; }\n.gm-next { align-self: center; }\n.gm-fb .gm-next { align-self: flex-end; }\n.gm-card.is-ok .gm-face.xl { box-shadow: 0 0 0 5px #1ed760, 0 18px 50px rgba(0,0,0,.5); }\n.gm-card.is-bad .gm-face.xl { box-shadow: 0 0 0 5px #ff4d5a, 0 18px 50px rgba(0,0,0,.5); }\n.gm-typerow { display: flex; gap: 10px; width: min(520px, 100%); }\n.gm-layer input.gm-input { flex: 1; min-width: 0; height: 52px; border-radius: 14px; border: 2px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); color: #fff; font: 600 18px Inter, sans-serif; padding: 0 18px; outline: none; }\n.gm-layer input.gm-input:focus { border-color: var(--accent-nf, #e50914); }\n.gm-typeb { display: flex; gap: 8px; }\n.gm-hintl { min-height: 22px; font: 700 18px/1 ui-monospace, monospace; letter-spacing: .1em; color: #f5c518; }\n.gm-back { display: none; flex-direction: column; align-items: center; gap: 14px; width: 100%; }\n.gm-card.flipped .gm-back { display: flex; animation: gm-in .3s both; }\n.gm-card.flipped .gm-known { align-items: center; }\n.gm-card.flipped .gm-kf { justify-content: center; }\n.gm-cardb { display: flex; gap: 12px; }\n.gm-mem { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; }\n.gm-tile { aspect-ratio: 1; perspective: 800px; padding: 0; }\n.gm-tin { position: relative; width: 100%; height: 100%; transition: transform .4s; transform-style: preserve-3d; }\n.gm-tile.up .gm-tin, .gm-tile.done .gm-tin { transform: rotateY(180deg); }\n.gm-tf, .gm-tb { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 14px; display: grid; place-items: center; }\n.gm-tf { background: linear-gradient(140deg, #2a1a1e, #1c1c22); border: 1px solid rgba(255,255,255,.1); font-size: 28px; font-weight: 900; color: rgba(255,255,255,.25); }\n.gm-tile:hover .gm-tf { border-color: rgba(255,255,255,.3); }\n.gm-tb { transform: rotateY(180deg); background: #23232a; padding: 8px; font-size: 14px; }\n.gm-tile.done .gm-tb { box-shadow: 0 0 0 3px #1ed760; opacity: .75; }\n.gm-sum { position: relative; }\n.gm-sumi { font-size: 64px; animation: gm-pop .6s cubic-bezier(.2,1.6,.4,1) both; }\n.gm-sum h2 { margin: 0; font-size: 32px; font-weight: 900; }\n.gm-sumg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }\n.gm-sumg > div { padding: 16px; border-radius: 16px; background: rgba(255,255,255,.06); }\n.gm-sumg b { display: block; font-size: 26px; font-weight: 900; }\n.gm-sumg span { color: #9a9aa4; font-size: 13px; }\n.gm-lvbar { width: 100%; display: flex; flex-direction: column; gap: 6px; text-align: left; }\n.gm-lvbar span { font-weight: 800; }\n.gm-lvbar small { color: #8d8d97; }\n.gm-goal-ok { margin: 0; color: #1ed760; font-weight: 700; }\n.gm-newb { width: 100%; display: flex; flex-direction: column; gap: 10px; }\n.gm-newb > small { color: #8d8d97; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; font-size: 12px; }\n.gm-newb > div { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }\n.gm-newb .gm-badge { width: 160px; }\n.gm-sumb { display: flex; gap: 12px; margin-top: 6px; }\n.gm-confetti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }\n.gm-confetti i { position: absolute; top: -20px; left: var(--x); width: 9px; height: 15px; border-radius: 2px; background: var(--c); animation: gm-fall 2.6s var(--d) cubic-bezier(.3,.6,.5,1) forwards; }\n@keyframes gm-fall { to { transform: translateY(105vh) rotate(720deg); } }\n\n@media (max-width: 820px) {\n  .gm-two { grid-template-columns: 1fr; }\n  .gm-recent { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 86%; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 calc(-1 * var(--pad)); padding: 0 var(--pad) 6px; }\n  .gm-rf { scroll-snap-align: start; }\n  .gm-train { flex-direction: column; align-items: flex-start; gap: 14px; padding: 20px; }\n  .gm-train .btn { align-self: stretch; }\n  .gm-pills { width: 100%; }\n  .gm-pill { flex: 1; min-width: 0; }\n  .gm-lvn { width: 72px; height: 72px; border-radius: 22px; }\n  .gm-lvn b { font-size: 30px; }\n  .gm-opts { grid-template-columns: 1fr; }\n  .gm-faces, .gm-films { grid-template-columns: 1fr 1fr; }\n  .gm-mem { grid-template-columns: repeat(3, 1fr); }\n  .gm-find { margin-left: 0; width: 100%; }\n  .gm-hud .gm-hxp { display: none; }\n  .gm-row { flex-direction: column; text-align: center; }\n  .gm-ad { flex-direction: column; text-align: center; }\n}\n\n/* ---------- Cinema Wrapped ---------- */\r\nhtml.wr-open, html.wr-open body { overflow: hidden; }\r\n.wr-layer { --c1: #7a0a12; --c2: #14060a; position: fixed; inset: 0; z-index: 9700; color: #fff; overflow: hidden; opacity: 0; transition: opacity .25s; background: linear-gradient(160deg, var(--c1), var(--c2) 75%); }\r\n.wr-layer.show { opacity: 1; }\r\n.wr-layer::before { content: \"\"; position: absolute; inset: 0; background: radial-gradient(60% 45% at 80% 8%, rgba(255,255,255,.16), transparent 70%), radial-gradient(50% 40% at 10% 100%, rgba(255,255,255,.08), transparent 70%); pointer-events: none; }\r\n.wr-glow { position: absolute; width: 70vmax; height: 70vmax; left: 50%; top: 50%; translate: -50% -50%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,.07), transparent); animation: wr-breathe 8s ease-in-out infinite; pointer-events: none; }\r\n@keyframes wr-breathe { 50% { scale: 1.15; } }\r\n.wr-top { position: absolute; z-index: 5; left: 0; right: 0; top: 0; display: flex; align-items: center; gap: 14px; padding: 16px clamp(14px, 4vw, 36px); }\r\n.wr-segs { flex: 1; display: flex; gap: 5px; }\r\n.wr-segs i { flex: 1; height: 4px; border-radius: 4px; background: rgba(255,255,255,.22); overflow: hidden; }\r\n.wr-segs b { display: block; height: 100%; width: 0; background: #fff; border-radius: 4px; }\r\n.wr-segs i.done b { width: 100%; }\r\n.wr-segs i.cur b { animation: wr-fill 7s linear forwards; }\r\n.wr-layer.manual .wr-segs i.cur b { animation: none; width: 100%; }\r\n.wr-layer.paused .wr-segs b { animation-play-state: paused; }\r\n@keyframes wr-fill { to { width: 100%; } }\r\n.wr-tools { display: flex; gap: 8px; }\r\n.wr-ib { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: rgba(0,0,0,.28); color: #fff; font-size: 14px; backdrop-filter: blur(6px); }\r\n.wr-ib:hover { background: rgba(0,0,0,.45); }\r\n.wr-zone { position: absolute; z-index: 2; top: 64px; bottom: 0; width: 38%; background: none; cursor: pointer; }\r\n.wr-zone.l { left: 0; } .wr-zone.r { right: 0; width: 62%; }\r\n.wr-stage { position: absolute; z-index: 3; inset: 56px 0 0; display: grid; place-items: center; padding: 8px clamp(18px, 6vw, 80px) 40px; pointer-events: none; }\r\n.wr-stage button, .wr-stage a { pointer-events: auto; }\r\n.wr-slide { width: min(720px, 100%); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; }\r\n.wr-slide > * { animation: wr-up .7s cubic-bezier(.2,.8,.2,1) both; }\r\n.wr-slide > *:nth-child(2) { animation-delay: .12s; } .wr-slide > *:nth-child(3) { animation-delay: .24s; } .wr-slide > *:nth-child(4) { animation-delay: .38s; } .wr-slide > *:nth-child(5) { animation-delay: .52s; } .wr-slide > *:nth-child(n+6) { animation-delay: .66s; }\r\n@keyframes wr-up { from { opacity: 0; transform: translateY(26px) scale(.97); } }\r\n.wr-kick { font-size: clamp(13px, 1.6vw, 16px); font-weight: 800; letter-spacing: .22em; text-transform: uppercase; opacity: .8; }\r\n.wr-huge { font-size: clamp(84px, 20vw, 190px); font-weight: 900; line-height: .95; letter-spacing: -.04em; text-shadow: 0 10px 50px rgba(0,0,0,.35); }\r\n.wr-huge.sm { font-size: clamp(56px, 13vw, 120px); }\r\n.wr-h { margin: 0; font-size: clamp(30px, 6vw, 58px); font-weight: 900; letter-spacing: -.03em; line-height: 1.05; }\r\n.wr-h.sm { font-size: clamp(22px, 4vw, 36px); }\r\n.wr-sub { margin: 0; font-size: clamp(16px, 2.2vw, 21px); font-weight: 600; opacity: .92; line-height: 1.4; }\r\n.wr-sub.dim { opacity: .65; font-weight: 500; }\r\n.wr-sub.pill { padding: 9px 18px; border-radius: 999px; background: rgba(255,255,255,.12); font-size: 15.5px; }\r\n.wr-foot { margin: 6px 0 0; font-size: 13.5px; opacity: .6; }\r\n.wr-months { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; align-items: end; width: 100%; height: 190px; margin-top: 10px; }\r\n.wr-mcol { height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; }\r\n.wr-mcol i { display: block; width: 100%; height: var(--v); min-height: 4px; border-radius: 8px 8px 3px 3px; background: rgba(255,255,255,.3); transform-origin: bottom; animation: wr-grow .8s calc(.3s + var(--i) * .05s) cubic-bezier(.2,.8,.2,1) both; }\r\n.wr-mcol.on i { background: #fff; box-shadow: 0 0 30px rgba(255,255,255,.5); }\r\n.wr-mcol small { font-size: 11px; opacity: .7; } .wr-mcol.on small { opacity: 1; font-weight: 800; }\r\n@keyframes wr-grow { from { transform: scaleY(0); } }\r\n.wr-bars { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }\r\n.wr-brow { display: grid; grid-template-columns: minmax(80px, 150px) 1fr 34px; gap: 12px; align-items: center; text-align: left; font-weight: 700; }\r\n.wr-brow > div { height: 14px; border-radius: 14px; background: rgba(255,255,255,.14); overflow: hidden; }\r\n.wr-brow i { display: block; height: 100%; width: var(--w); border-radius: 14px; background: #fff; transform-origin: left; animation: wr-growx .9s calc(.35s + var(--i) * .1s) cubic-bezier(.2,.8,.2,1) both; }\r\n.wr-brow b { text-align: right; opacity: .8; }\r\n@keyframes wr-growx { from { transform: scaleX(0); } }\r\n.wr-face { width: clamp(150px, 28vh, 240px); aspect-ratio: 1; border-radius: 50%; background: #26262b center 20% / cover; box-shadow: 0 0 0 6px rgba(255,255,255,.18), 0 24px 70px rgba(0,0,0,.5); }\r\n.wr-prow { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }\r\n.wr-p { position: relative; border-radius: 12px; background: #2a2a30 center / cover; box-shadow: 0 12px 34px rgba(0,0,0,.45); flex: none; display: grid; place-items: center; overflow: hidden; }\r\n.wr-p span { padding: 6px; font-size: 11px; font-weight: 700; text-align: center; line-height: 1.2; opacity: .8; }\r\n.wr-p.xs { width: 54px; aspect-ratio: 2/3; border-radius: 8px; } .wr-p.sm { width: clamp(72px, 12vw, 104px); aspect-ratio: 2/3; } .wr-p.md { width: 96px; aspect-ratio: 2/3; } .wr-p.lg { width: clamp(130px, 22vh, 190px); aspect-ratio: 2/3; border-radius: 16px; }\r\n.wr-old { display: flex; align-items: center; gap: 16px; padding: 12px 20px 12px 12px; border-radius: 20px; background: rgba(0,0,0,.25); text-align: left; margin-top: 8px; }\r\n.wr-old small { display: block; opacity: .7; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; } .wr-old b { display: block; font-size: 18px; margin: 2px 0; } .wr-old span { opacity: .7; }\r\n.wr-top5 { width: 100%; display: flex; flex-direction: column; gap: 9px; margin-top: 8px; }\r\n.wr-t5 { display: flex; align-items: center; gap: 14px; padding: 8px 14px 8px 10px; border-radius: 16px; background: rgba(0,0,0,.25); text-align: left; animation: wr-up .6s calc(.3s + var(--i) * .12s) both; }\r\n.wr-t5 em { font-style: normal; font-weight: 900; font-size: 26px; width: 26px; opacity: .6; text-align: center; }\r\n.wr-t5 b { display: block; font-size: 16.5px; } .wr-t5 span { color: #ffd76a; font-weight: 700; font-size: 14px; }\r\n.wr-vs { display: flex; align-items: center; gap: 22px; margin-top: 6px; } .wr-vs > div { padding: 12px 22px; border-radius: 18px; background: rgba(0,0,0,.28); } .wr-vs small { display: block; opacity: .7; font-size: 12px; text-transform: uppercase; letter-spacing: .1em; } .wr-vs b { font-size: 26px; color: #ffd76a; } .wr-vs span { font-weight: 900; opacity: .5; }\r\n.wr-stats3 { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin: 8px 0; }\r\n.wr-stats3 > div { min-width: 140px; padding: 20px 22px; border-radius: 22px; background: rgba(0,0,0,.26); animation: wr-up .6s calc(.25s + var(--i) * .13s) both; }\r\n.wr-stats3 em { display: block; font-style: normal; font-size: 26px; } .wr-stats3 b { display: block; font-size: 46px; font-weight: 900; line-height: 1.1; } .wr-stats3 span { opacity: .75; font-size: 14px; font-weight: 600; }\r\n.wr-sumf { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; width: 100%; }\r\n.wr-sumf > div { padding: 14px 12px; border-radius: 18px; background: rgba(0,0,0,.26); } .wr-sumf b { display: block; font-size: 22px; font-weight: 900; overflow-wrap: anywhere; } .wr-sumf span { font-size: 12px; opacity: .7; }\r\n.wr-acts { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }\r\n\r\n/* the page */\r\n.wr-hubh .nf-chip { display: inline-flex; align-items: center; gap: 6px; }\r\n.wr-hubh { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }\r\n.wr-hero { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 18px 0 6px; padding: 38px clamp(22px, 4vw, 52px); border-radius: 28px; cursor: pointer; overflow: hidden; min-height: 280px; background: radial-gradient(90% 120% at 100% 0%, rgba(255,255,255,.18), transparent 55%), linear-gradient(135deg, #a40d18, #3b0a52 60%, #0d0a24); box-shadow: 0 30px 80px rgba(120,10,30,.35); transition: transform .25s; }\r\n.wr-hero:hover { transform: translateY(-3px); }\r\n.wr-hero-in { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; } .wr-hero-in small { font-weight: 800; letter-spacing: .22em; opacity: .75; }\r\n.wr-hero-y { font-size: clamp(72px, 11vw, 140px); font-weight: 900; line-height: .95; letter-spacing: -.04em; }\r\n.wr-hero-in p { margin: 0 0 6px; font-size: 20px; font-weight: 700; }\r\n.wr-hero-p { display: flex; position: relative; }\r\n.wr-hero-p .wr-p { margin-left: -26px; transform: rotate(calc((var(--r, 0) - 2) * 4deg)); } .wr-hero-p .wr-p:first-child { margin-left: 0; }\r\n.wr-hero-p .r0 { --r: 0; } .wr-hero-p .r1 { --r: 1; } .wr-hero-p .r2 { --r: 2; } .wr-hero-p .r3 { --r: 3; } .wr-hero-p .r4 { --r: 4; }\r\n.wr-banner { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 10px var(--pad) 26px; padding: 26px clamp(20px, 3vw, 38px); border-radius: 26px; overflow: hidden; background: radial-gradient(90% 140% at 100% 0%, rgba(255,255,255,.16), transparent 55%), linear-gradient(120deg, #a40d18, #4a0b5c 65%, #14102e); }\r\n.wr-bn-t small { font-weight: 800; letter-spacing: .22em; opacity: .75; } .wr-bn-t h2 { margin: 4px 0 6px; font-size: clamp(22px, 3vw, 32px); font-weight: 900; } .wr-bn-t p { margin: 0 0 16px; max-width: 520px; opacity: .85; line-height: 1.45; }\r\n.wr-bn-b { display: flex; gap: 10px; flex-wrap: wrap; }\r\n.wr-bn-p { display: flex; flex: none; } .wr-bn-p .wr-p { margin-left: -14px; box-shadow: 0 10px 26px rgba(0,0,0,.5); } .wr-bn-p .wr-p:first-child { margin-left: 0; }\r\n@media (max-width: 820px) {\r\n  .wr-hero { flex-direction: column; align-items: flex-start; } .wr-hero-p { align-self: center; }\r\n  .wr-banner { flex-direction: column; align-items: flex-start; margin-left: var(--pad); } .wr-bn-p { display: none; }\r\n  .wr-brow { grid-template-columns: 90px 1fr 28px; } .wr-months { height: 150px; gap: 4px; }\r\n}\r\n\n/* ---------- feature gallery and first-run setup ---------- */\r\n.ft-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }\r\n.ft-head p { margin: 0; color: #9a9aa4; max-width: 640px; line-height: 1.5; }\r\n.ft-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 16px; align-items: start; }\r\n.ft-card { --hue: #e50914; position: relative; display: flex; flex-direction: column; border-radius: 22px; overflow: hidden; background: #17171a; border: 1px solid rgba(255,255,255,.07); transition: border-color .2s, transform .2s, box-shadow .2s; }\r\n.ft-card.on { border-color: color-mix(in srgb, var(--hue) 45%, transparent); }\r\n.ft-card.open { grid-column: 1 / -1; }\r\n.ft-card.locked { opacity: .55; }\r\n.ft-art { position: relative; height: 128px; display: grid; place-items: center; overflow: hidden; background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--hue) 55%, #17171a), #17171a 70%); transition: filter .3s; }\r\n.ft-card:not(.on) .ft-art { filter: grayscale(.85) brightness(.75); }\r\n.ft-ic { position: absolute; left: 14px; top: 12px; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 13px; font-size: 21px; background: rgba(0,0,0,.35); backdrop-filter: blur(6px); }\r\n.ft-body { padding: 16px 20px 16px; display: flex; flex-direction: column; gap: 8px; }\r\n.ft-title { display: flex; align-items: center; gap: 10px; }\r\n.ft-title b { font-size: 17px; font-weight: 800; }\r\n.ft-pill { font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,.09); color: #a8a8b2; }\r\n.ft-card.on .ft-pill { background: color-mix(in srgb, var(--hue) 28%, transparent); color: #fff; }\r\n.ft-body p { margin: 0; color: #9a9aa4; font-size: 13.5px; line-height: 1.5; }\r\n.ft-foot { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }\r\n.ft-more { display: inline-flex; align-items: center; gap: 4px; padding: 7px 12px 7px 14px; border-radius: 999px; background: rgba(255,255,255,.08); font-size: 13px; font-weight: 600; color: #ececf0; transition: background .15s; }\r\n.ft-more:hover { background: rgba(255,255,255,.16); }\r\n.ft-more svg { width: 16px; height: 16px; transition: transform .2s; }\r\n.ft-card.open .ft-more:not(.go) svg { transform: rotate(180deg); }\r\n.ft-opts { display: none; padding: 4px 20px 14px; border-top: 1px solid rgba(255,255,255,.06); animation: gm-in .25s both; }\r\n.ft-card.open .ft-opts { display: block; }\r\n.ft-card:not(.on) .ft-opts { opacity: .6; }\r\n.ft-chips { display: flex; gap: 8px; flex-wrap: wrap; }\r\n.ft-chips .nf-chip { opacity: .55; } .ft-chips .nf-chip.on { opacity: 1; background: #fff; color: #000; }\r\n\r\n/* tiny illustrations */\r\n.fa { position: relative; width: 190px; height: 92px; display: flex; align-items: center; justify-content: center; gap: 8px; }\r\n.fa i { display: block; }\r\n.fa-hero { flex-direction: column; align-items: flex-start; justify-content: center; padding: 12px 14px; border-radius: 12px; background: linear-gradient(120deg, rgba(255,255,255,.18), rgba(255,255,255,.05)); }\r\n.fa-hero .l1 { width: 90px; height: 9px; border-radius: 5px; background: #fff; } .fa-hero .l2 { width: 130px; height: 5px; border-radius: 4px; background: rgba(255,255,255,.4); margin: 6px 0 9px; }\r\n.fa-hero .pl { width: 38px; height: 14px; border-radius: 8px; background: #fff; display: inline-block; } .fa-hero .gr { width: 38px; height: 14px; border-radius: 8px; background: rgba(255,255,255,.3); display: inline-block; margin-left: 6px; position: absolute; left: 60px; bottom: 12px; } .fa-hero .pl { position: absolute; left: 14px; bottom: 12px; }\r\n.fa-hero .dots { position: absolute; right: 10px; bottom: 10px; display: flex; gap: 3px; } .fa-hero u { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.4); } .fa-hero u.on { background: #fff; }\r\n.fa-peek i { width: 50px; height: 76px; border-radius: 8px; background: rgba(255,255,255,.16); } .fa-peek i.mid { width: 70px; height: 88px; background: #2b2b31; box-shadow: 0 10px 28px rgba(0,0,0,.5); padding: 8px; display: flex; flex-direction: column; gap: 5px; transform: translateY(-3px); }\r\n.fa-peek b { display: block; height: 6px; border-radius: 3px; background: rgba(255,255,255,.55); } .fa-peek b.w { width: 60%; background: rgba(255,255,255,.25); }\r\n.fa-inf { flex-direction: column; gap: 6px; } .fa-inf > div { display: flex; gap: 6px; opacity: var(--o); } .fa-inf i { width: 30px; height: 26px; border-radius: 5px; background: rgba(255,255,255,.3); }\r\n.fa-player { width: 180px; border-radius: 12px; background: rgba(0,0,0,.4); }\r\n.fa-player .big { width: 38px; height: 38px; border-radius: 50%; background: #fff; display: grid; place-items: center; } .fa-player .big::after { content: \"\"; border-left: 12px solid #111; border-top: 8px solid transparent; border-bottom: 8px solid transparent; margin-left: 3px; }\r\n.fa-player .skip { position: absolute; right: 8px; bottom: 20px; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(255,255,255,.2); }\r\n.fa-player .bar { position: absolute; left: 10px; right: 10px; bottom: 8px; height: 4px; border-radius: 3px; background: rgba(255,255,255,.2); } .fa-player .bar i { width: 40%; height: 100%; border-radius: 3px; background: var(--hue); }\r\n.fa-quiz .face { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; font-size: 32px; background: rgba(255,255,255,.2); box-shadow: 0 0 0 3px rgba(255,255,255,.12); }\r\n.fa-quiz > div { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; } .fa-quiz > div i { width: 38px; height: 16px; border-radius: 6px; background: rgba(255,255,255,.18); } .fa-quiz > div i.ok { background: #1ed760; }\r\n.fa-wr { flex-direction: column; gap: 6px; } .fa-wr b { font-size: 30px; font-weight: 900; line-height: 1; letter-spacing: -.03em; } .fa-wr > div { display: flex; align-items: flex-end; gap: 5px; height: 36px; } .fa-wr > div i { width: 14px; border-radius: 4px 4px 1px 1px; background: rgba(255,255,255,.5); } .fa-wr > div i:nth-child(4) { background: #fff; }\r\n.fa-lb { flex-direction: column; gap: 8px; } .fa-lb > div { display: flex; } .fa-lb > div i { width: 34px; height: 34px; border-radius: 50%; margin-left: -8px; border: 3px solid #17171a; } .fa-lb > div i:first-child { margin-left: 0; } .fa-lb .g { background: #00e054; } .fa-lb .o { background: #ff8000; } .fa-lb .b { background: #40bcf4; } .fa-lb span { color: #00e054; letter-spacing: 3px; font-size: 15px; }\r\n.fa-arch i { width: 40px; height: 60px; border-radius: 6px; background: rgba(255,255,255,.2); transform: rotate(calc((var(--k, 0) - 1) * 7deg)); } .fa-arch i:nth-child(1) { --k: 0; } .fa-arch i:nth-child(2) { --k: 1; background: rgba(255,255,255,.3); } .fa-arch i:nth-child(3) { --k: 2; } .fa-arch span { position: absolute; font-size: 34px; filter: drop-shadow(0 6px 12px rgba(0,0,0,.5)); }\r\n.fa-pages { flex-wrap: wrap; width: 170px; } .fa-pages i { font-style: normal; font-size: 11.5px; font-weight: 700; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.14); } .fa-pages i.on { background: #fff; color: #000; }\r\n\r\n/* setup dialog */\r\n.ob-dlg { width: min(640px, 100%); }\r\n.ob-wrap { padding: 8px 28px 6px; }\r\n.ob-dots { display: flex; gap: 6px; justify-content: center; margin: 4px 0 14px; } .ob-dots i { width: 26px; height: 5px; border-radius: 5px; background: rgba(255,255,255,.14); transition: .25s; } .ob-dots i.on { background: var(--accent-nf, #e50914); width: 38px; } .ob-dots i.done { background: rgba(255,255,255,.45); }\r\n.ob-body h2 { margin: 0 0 6px; font-size: 26px; font-weight: 900; letter-spacing: -.02em; } .ob-sub { margin: 0 0 18px; color: #9a9aa4; line-height: 1.5; }\r\n.ob-welcome { text-align: center; } .ob-logo { font-size: 30px; font-weight: 900; letter-spacing: .14em; color: var(--accent-nf, #e50914); margin: 6px 0 14px; } .ob-big { font-size: 64px; margin: 4px 0; animation: gm-pop .6s cubic-bezier(.2,1.6,.4,1) both; }\r\n.ob-hi { display: flex; flex-direction: column; gap: 10px; text-align: left; margin-top: 4px; } .ob-hi > div { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 16px; background: rgba(255,255,255,.05); } .ob-hi span { font-size: 26px; } .ob-hi b { display: block; } .ob-hi small { color: #8d8d97; font-size: 12.5px; }\r\n.ob-lab { margin: 16px 0 8px; font-size: 13px; font-weight: 700; color: #b9b9c1; }\r\n.ob-sw { display: flex; gap: 10px; flex-wrap: wrap; }\r\n.ob-prev { --sz: 1; display: flex; gap: 10px; margin-top: 18px; align-items: flex-end; height: 150px; padding: 14px; border-radius: 16px; background: rgba(255,255,255,.04); }\r\n.ob-pc { width: calc(60px * var(--sz)); aspect-ratio: 2/3; border-radius: 8px; background: linear-gradient(160deg, hsl(var(--h), 45%, 38%), hsl(var(--h), 40%, 18%)); transition: width .25s; }\r\n.ob-feats { display: flex; flex-direction: column; gap: 10px; max-height: 46vh; overflow-y: auto; padding-right: 4px; }\r\n.ob-f { --hue: #e50914; display: flex; align-items: center; gap: 14px; padding: 10px 16px 10px 10px; border-radius: 16px; background: rgba(255,255,255,.05); border: 1px solid transparent; transition: border-color .2s; } .ob-f.on { border-color: color-mix(in srgb, var(--hue) 50%, transparent); }\r\n.ob-fa { position: relative; flex: none; width: 96px; height: 62px; border-radius: 12px; overflow: hidden; display: grid; place-items: center; background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--hue) 55%, #17171a), #17171a 70%); }\r\n.ob-fa .fa { transform: scale(.48); transform-origin: center; flex: none; } .ob-fa .ft-ic { width: 24px; height: 24px; font-size: 13px; left: 5px; top: 4px; border-radius: 8px; }\r\n.ob-f:not(.on) .ob-fa { filter: grayscale(.85) brightness(.75); }\r\n.ob-ft { flex: 1; min-width: 0; } .ob-ft b { display: block; font-size: 15px; } .ob-ft small { display: block; color: #8d8d97; font-size: 12.5px; line-height: 1.4; margin-top: 2px; }\r\n.ob-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }\r\n.ob-preset { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 18px 10px; border-radius: 18px; background: rgba(255,255,255,.06); border: 2px solid transparent; transition: .15s; } .ob-preset:hover { background: rgba(255,255,255,.1); } .ob-preset.on { border-color: var(--accent-nf, #e50914); background: rgba(255,255,255,.1); }\r\n.ob-preset span { font-size: 30px; } .ob-preset b { font-size: 15px; } .ob-preset small { color: #9a9aa4; font-size: 12px; text-align: center; }\r\n.ob-lb input { width: 100%; height: 42px; border-radius: 12px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: #fff; padding: 0 14px; font: inherit; } .ob-lb small { display: block; margin-top: 8px; color: #8d8d97; line-height: 1.45; }\r\n.ob-step { margin-right: auto; color: #8d8d97; font-size: 13px; }\r\n@media (max-width: 820px) { .ft-grid { grid-template-columns: 1fr; } .ob-wrap { padding: 8px 18px 4px; } .ob-presets { grid-template-columns: 1fr; } .ob-preset { flex-direction: row; justify-content: flex-start; gap: 12px; padding: 12px 16px; } .ob-feats { max-height: 52vh; } }\r\n.ob-dlg .cxd-head { position: absolute; right: 12px; top: 12px; z-index: 3; padding: 0; border: 0; background: none; min-height: 0; } .ob-dlg .cxd-head b { display: none; }\r\n.ob-dlg .ob-wrap { padding-top: 22px; } .ob-dlg .pl-seg { display: inline-flex; width: auto; }\r\n\r\n/* groups, search, dependencies */\r\n.ft-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 4px 0 8px; } .ft-bar .dc-q { flex: 1; min-width: 220px; max-width: 360px; } .ft-fchips { display: flex; gap: 8px; }\r\n.ft-sec { margin-top: 26px; } .ft-sh { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; } .ft-sh > span { width: 42px; height: 42px; display: grid; place-items: center; font-size: 22px; border-radius: 14px; background: rgba(255,255,255,.07); } .ft-sh h3 { margin: 0; font-size: 18px; font-weight: 800; } .ft-sh p { margin: 2px 0 0; color: #8d8d97; font-size: 13px; }\r\n.ft-needs { display: flex; gap: 6px; flex-wrap: wrap; } .ft-needs i { font-style: normal; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,.07); color: #a8a8b2; } .ft-needs i.ok { color: #7cf0a3; background: rgba(30,215,96,.12); } .ft-needs i.bad { color: #ffb4ae; background: rgba(255,69,58,.14); }\r\n.ft-card[hidden], .ft-sec[hidden] { display: none; }\r\n.ob-chips { display: flex; gap: 10px; flex-wrap: wrap; } .ob-chips .nf-chip { opacity: .55; padding: 10px 18px; } .ob-chips .nf-chip.on { opacity: 1; background: #fff; color: #000; }\r\n.ob-seen { margin-top: 14px; padding: 14px 16px; border-radius: 16px; background: rgba(255,255,255,.05); } .ob-seen .ob-lab { margin-top: 0; } .ob-seen small { display: block; margin-top: 10px; color: #8d8d97; line-height: 1.45; }\r\n.ob-sum { display: flex; gap: 14px; justify-content: center; margin-top: 6px; } .ob-sum > div { min-width: 130px; padding: 14px 18px; border-radius: 18px; background: rgba(255,255,255,.07); } .ob-sum b { display: block; font-size: 30px; font-weight: 900; } .ob-sum span { color: #9a9aa4; font-size: 13px; }\r\n.ob-feats { max-height: 44vh; }\r\n\r\n/* more illustrations */\r\n.fa-emo { flex-direction: column; gap: 10px; } .fa-emo > span { font-size: 40px; filter: drop-shadow(0 6px 14px rgba(0,0,0,.4)); } .fa-emo > div { display: flex; flex-direction: column; align-items: center; gap: 5px; } .fa-emo i { height: 6px; border-radius: 4px; background: rgba(255,255,255,.3); }\r\n.fa-disc { } .fa-disc > div { display: grid; grid-template-columns: repeat(4, 34px); gap: 6px; } .fa-disc > div i { height: 52px; border-radius: 6px; background: rgba(255,255,255,.22); } .fa-disc > div i.p { background: rgba(255,255,255,.4); } .fa-disc span { position: absolute; right: 8px; top: -2px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: #000; font-weight: 900; }\r\n.fa-watch i { width: 50px; height: 74px; border-radius: 8px; background: rgba(255,255,255,.18); } .fa-watch i.mid { width: 64px; height: 88px; background: rgba(255,255,255,.3); } .fa-watch span { position: absolute; top: -8px; left: 56px; font-size: 28px; }\r\n.fa-req { flex-direction: column; gap: 14px; width: 190px; } .fa-req > div { display: flex; gap: 12px; } .fa-req > div i { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,.2); position: relative; } .fa-req > div i.on { background: #34c759; } .fa-req > div i.cur { background: #6aa9ff; box-shadow: 0 0 0 4px rgba(106,169,255,.3); } .fa-req > b { width: 130px; height: 7px; border-radius: 7px; background: rgba(255,255,255,.2); overflow: hidden; } .fa-req > b i { display: block; height: 100%; background: #6aa9ff; }\r\n.fa-cal { display: grid; grid-template-columns: repeat(7, 22px); gap: 5px; width: auto; height: auto; } .fa-cal i { height: 22px; border-radius: 5px; background: rgba(255,255,255,.16); } .fa-cal i.on { background: #fff; } .fa-cal i.dot { background: rgba(48,209,88,.7); }\r\n.fa-rate { gap: 10px; } .fa-rate span { padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 14px; background: rgba(0,0,0,.35); } .fa-rate .im { color: #f5c518; }\r\n.fa-info { flex-direction: column; align-items: flex-start; gap: 7px; padding-left: 20px; } .fa-info > div { display: flex; align-items: center; gap: 8px; } .fa-info i { width: 22px; height: 6px; border-radius: 4px; background: rgba(255,255,255,.5); } .fa-info b { height: 6px; border-radius: 4px; background: rgba(255,255,255,.2); display: block; }\r\n.fa-menu { gap: 10px; } .fa-menu > i { width: 62px; height: 80px; border-radius: 8px; background: rgba(255,255,255,.2); } .fa-menu > div { display: flex; flex-direction: column; gap: 5px; padding: 8px 10px; border-radius: 10px; background: #2b2b31; box-shadow: 0 8px 22px rgba(0,0,0,.5); } .fa-menu b { width: 56px; height: 6px; border-radius: 4px; background: rgba(255,255,255,.4); }\r\n.fa-music { } .fa-music .disc { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 28px; background: radial-gradient(circle, #222 30%, #3a3a40 32%, #111 70%); box-shadow: 0 0 0 3px rgba(255,255,255,.12); } .fa-music > div { display: flex; align-items: flex-end; gap: 4px; height: 50px; } .fa-music > div i { width: 9px; border-radius: 3px; background: rgba(255,255,255,.55); }\r\n.fa-lyr { flex-direction: column; align-items: flex-start; gap: 9px; padding-left: 24px; } .fa-lyr i { height: 8px; border-radius: 5px; background: rgba(255,255,255,.22); } .fa-lyr i.on { background: #fff; }\r\n.fa-mr { gap: 12px; } .fa-mr span { font-size: 38px; } .fa-mr b { padding: 8px 14px; border-radius: 999px; background: #fff; color: #000; font-size: 13px; }\r\n.fa-store { flex-direction: column; gap: 9px; width: 160px; } .fa-store > div { width: 130px; height: 10px; border-radius: 10px; background: rgba(255,255,255,.15); overflow: hidden; } .fa-store > div i { display: block; height: 100%; background: #34c759; } .fa-store > div:nth-child(2) i { background: #ff9f0a; } .fa-store span { position: absolute; right: 6px; top: -4px; font-size: 30px; }\r\n.ft-bar .dc-q input { padding-left: 38px; }\r\n\n/* ---------- labels on cards and rows ---------- */\r\n.rc-new { position: absolute; top: 8px; left: 8px; z-index: 4; padding: 3px 9px; border-radius: 6px; font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: var(--accent-nf, #e50914); box-shadow: 0 4px 12px rgba(0,0,0,.4); }\r\n.rc-seen { position: absolute; top: 8px; right: 8px; z-index: 4; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: rgba(30,215,96,.85); color: #04210f; box-shadow: 0 3px 10px rgba(0,0,0,.4); }\r\n.rc-seen svg { width: 13px !important; height: 13px !important; stroke-width: 3; }\r\n.rowtag { display: inline-block; vertical-align: middle; margin-left: 12px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; background: rgba(255,255,255,.12); color: #d9d9e0; border: 1px dashed rgba(255,255,255,.3); }\r\n.nf-card .why { margin-top: 2px; font-size: 11.5px; color: #8d8d97; }\r\n.rc-taste { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 0 var(--pad) 8px; margin-top: 4px; }\r\n.rc-taste b { display: block; font-size: 15px; } .rc-taste small { color: #8d8d97; font-size: 12.5px; }\r\n.rc-chips { display: flex; gap: 8px; flex-wrap: wrap; } .rc-chips .nf-chip { display: inline-flex; align-items: center; gap: 8px; } .rc-chips em { font-style: normal; font-size: 11.5px; opacity: .6; }\r\n.fa-tn i { width: 50px; height: 74px; border-radius: 8px; background: rgba(255,255,255,.18); } .fa-tn i.mid { width: 64px; height: 88px; background: rgba(255,255,255,.3); transform: translateY(-4px); } .fa-tn span { position: absolute; top: -6px; right: 16px; font-size: 30px; }\r\n.fa-home > div { display: flex; gap: 6px; } .fa-home > div i { width: 44px; height: 64px; border-radius: 7px; background: rgba(255,255,255,.2); } .fa-home > div i.b { background: rgba(255,255,255,.32); } .fa-home em { position: absolute; left: 24px; top: 10px; font-style: normal; font-size: 8.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: #e50914; } .fa-home u { position: absolute; left: 116px; top: 10px; width: 16px; height: 16px; border-radius: 50%; background: #1ed760; color: #04210f; text-decoration: none; font-size: 10px; font-weight: 900; display: grid; place-items: center; }\r\n\r\n/* ---------- storage assistant ---------- */\r\n.st-page { max-width: 1200px; margin: 0 auto; padding-bottom: 150px; }\r\n.st-disks { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-top: 14px; }\r\n.st-disk { padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); }\r\n.st-dh { display: flex; justify-content: space-between; gap: 10px; align-items: baseline; } .st-dh b { font-size: 15.5px; } .st-dh small { color: #8d8d97; font-weight: 700; }\r\n.st-bar { height: 12px; border-radius: 12px; background: rgba(255,255,255,.1); overflow: hidden; margin: 12px 0 8px; } .st-bar i { display: block; height: 100%; border-radius: 12px; background: #34c759; transition: width .8s; }\r\n.st-disk.warn .st-bar i { background: #ff9f0a; } .st-disk.crit .st-bar i { background: #ff453a; }\r\n.st-df { display: flex; align-items: baseline; gap: 6px; font-size: 13px; color: #b9b9c1; } .st-df b { color: #fff; font-size: 17px; } .st-df span { margin-left: auto; color: #8d8d97; }\r\n.st-disk > small { display: block; margin-top: 4px; color: #6f6f78; font-size: 11.5px; }\r\n.st-fc { margin: 14px 0 0; padding: 10px 16px; border-radius: 12px; background: rgba(255,159,10,.1); color: #ffcf8a; font-size: 14px; display: inline-block; }\r\n.st-res { margin-top: 6px; } .st-resbar { display: flex; height: 16px; border-radius: 16px; overflow: hidden; gap: 2px; background: rgba(255,255,255,.06); } .st-resbar i { display: block; min-width: 4px; }\r\n.st-resl { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 12px; font-size: 13.5px; color: #b9b9c1; } .st-resl i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 7px; } .st-resl b { color: #fff; margin-right: 4px; }\r\ni.r4K { background: #bf5af2; } i.r1080p { background: #0a84ff; } i.r720p { background: #34c759; } i.rSD { background: #ff9f0a; } i.ru { background: #6f6f78; }\r\n.st-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; } .st-head .nf-seasons { margin: 0; } .st-sort { height: 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); color: inherit; padding: 0 14px; font: inherit; }\r\n.st-list { display: flex; flex-direction: column; gap: 8px; }\r\n.st-row { display: flex; align-items: center; gap: 14px; padding: 8px 16px 8px 10px; border-radius: 16px; background: rgba(255,255,255,.04); border: 1px solid transparent; transition: background .15s; } .st-row:hover { background: rgba(255,255,255,.07); } .st-row.sel { border-color: var(--accent-nf, #e50914); background: rgba(255,255,255,.08); }\r\n.st-cb { position: relative; width: 24px; height: 24px; flex: none; cursor: pointer; } .st-cb input { position: absolute; inset: 0; opacity: 0; cursor: pointer; margin: 0; } .st-cb i { position: absolute; inset: 0; border-radius: 7px; border: 2px solid rgba(255,255,255,.3); display: grid; place-items: center; } .st-cb input:checked + i { background: var(--accent-nf, #e50914); border-color: transparent; } .st-cb input:checked + i::after { content: \"✓\"; font-size: 14px; font-weight: 900; }\r\n.st-p { width: 44px; aspect-ratio: 2/3; border-radius: 6px; background: #2a2a30 center / cover; flex: none; cursor: pointer; }\r\n.st-t { flex: 1; min-width: 0; cursor: pointer; } .st-t b { display: block; font-size: 15px; } .st-t > span { display: block; color: #8d8d97; font-size: 12.5px; margin-top: 2px; }\r\n.st-why { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; } .st-why i { font-style: normal; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,.09); color: #c9c9d1; } .st-why i.stRLow { background: rgba(255,69,58,.18); color: #ff9b94; } .st-why i.stRBig { background: rgba(255,159,10,.18); color: #ffcf8a; } .st-why i.stRSeen { background: rgba(30,215,96,.16); color: #8cf0b0; }\r\n.st-sz { font-size: 17px; font-weight: 800; white-space: nowrap; }\r\n.st-selbar { position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 140%); z-index: 9000; display: flex; align-items: center; gap: 14px; padding: 12px 14px 12px 22px; border-radius: 999px; background: #232329; border: 1px solid rgba(255,255,255,.14); box-shadow: 0 20px 60px rgba(0,0,0,.6); transition: transform .3s cubic-bezier(.2,.8,.2,1); max-width: calc(100vw - 24px); flex-wrap: wrap; justify-content: center; }\r\n.st-selbar.show { transform: translate(-50%, 0); } .st-selbar span { color: #ffcf8a; font-weight: 700; } .st-selbar .btn { height: 40px; }\r\n.st-bulk { max-height: 34vh; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; margin-top: 12px; } .st-bl { display: flex; gap: 10px; align-items: center; padding: 6px 10px; border-radius: 10px; background: rgba(255,255,255,.04); font-size: 13.5px; } .st-bl b { flex: 1; font-weight: 600; } .st-bl small { color: #8d8d97; } .st-bl.ok { background: rgba(30,215,96,.1); } .st-bl.bad { background: rgba(255,69,58,.12); }\r\n\r\n/* ---------- requests ---------- */\r\n.rq-page { max-width: 1180px; margin: 0 auto; }\r\n.rq-tiles { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 4px 0 18px; }\r\n.rq-tile { display: flex; flex-direction: column; gap: 2px; padding: 16px 18px; border-radius: 18px; text-align: left; background: rgba(255,255,255,.05); border: 2px solid transparent; transition: .15s; } .rq-tile:hover { background: rgba(255,255,255,.09); } .rq-tile.on { border-color: #fff; background: rgba(255,255,255,.1); }\r\n.rq-tile b { font-size: 28px; font-weight: 900; line-height: 1.1; } .rq-tile span { font-size: 13px; color: #a8a8b2; font-weight: 600; }\r\n.rq-tile.rq-pend b { color: #ffcf8a; } .rq-tile.rq-prog b { color: #9ccaff; } .rq-tile.rq-done b { color: #7cf0a3; } .rq-tile.rq-bad b { color: #ff9b9b; }\r\n.rq-now { display: flex; align-items: center; gap: 12px; justify-content: space-between; margin-bottom: 14px; padding: 12px 18px; border-radius: 14px; background: rgba(120,180,255,.1); color: #bcd9ff; } .rq-now span { color: #8fb4e8; font-size: 13px; }\r\n.rq-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; } .rq-bar .dc-q { margin-left: auto; }\r\n.rq-live { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #8d8d97; } .rq-live i { width: 8px; height: 8px; border-radius: 50%; background: #34c759; animation: rq-pulse 1.8s infinite; } @keyframes rq-pulse { 50% { opacity: .3; } }\r\n.rq-list { display: flex; flex-direction: column; gap: 12px; }\r\n.rq-row { display: flex; align-items: stretch; gap: 18px; padding: 14px 18px 14px 14px; border-radius: 20px; background: #17171a; border: 1px solid rgba(255,255,255,.06); }\r\n.rq-row.s-pending { box-shadow: inset 4px 0 0 #ffcf8a; } .rq-row.s-approved, .rq-row.s-loading, .rq-row.s-partial { box-shadow: inset 4px 0 0 #6aa9ff; } .rq-row.s-available { box-shadow: inset 4px 0 0 #34c759; } .rq-row.s-declined { box-shadow: inset 4px 0 0 #ff453a; opacity: .8; }\r\n.rq-p { width: 86px; aspect-ratio: 2/3; border-radius: 10px; background: #26262b center / cover; flex: none; cursor: pointer; align-self: flex-start; }\r\n.rq-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }\r\n.rq-t { display: flex; align-items: baseline; gap: 8px; min-width: 0; } .rq-t b { font-size: 18px; font-weight: 800; } .rq-t span { color: #9a9aa4; } .rq-type { font-style: normal; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,.1); color: #c9c9d1; flex: none; }\r\n.rq-sub { color: #8d8d97; font-size: 13px; }\r\n.rq-steps { display: flex; gap: 0; align-items: flex-start; margin: 4px 0; }\r\n.rq-st { position: relative; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; font-size: 12px; font-weight: 700; color: #6f6f78; max-width: 160px; }\r\n.rq-st::before { content: \"\"; position: absolute; left: 24px; right: 0; top: 11px; height: 2px; background: rgba(255,255,255,.1); } .rq-st:last-child::before { display: none; } .rq-st.done::before { background: #34c759; }\r\n.rq-st i { position: relative; z-index: 1; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 12px; background: #2a2a30; color: #8d8d97; } .rq-st.done i { background: #34c759; color: #04210f; } .rq-st.cur i { background: #6aa9ff; color: #04152b; box-shadow: 0 0 0 4px rgba(106,169,255,.25); } .rq-st.cur, .rq-st.done { color: #e8e8ec; }\r\n.s-pending .rq-st.cur i { background: #ffcf8a; box-shadow: 0 0 0 4px rgba(255,207,138,.25); }\r\n.rq-bad { color: #ff9b9b; font-weight: 700; margin: 4px 0; }\r\n.rq-dl { display: flex; flex-direction: column; gap: 6px; } .rq-dl span { font-size: 12.5px; color: #9ccaff; }\r\n.rq-pb { height: 8px; border-radius: 8px; background: rgba(255,255,255,.1); overflow: hidden; } .rq-pb i { display: block; height: 100%; border-radius: 8px; background: linear-gradient(90deg, #4a90ff, #7cc4ff); transition: width .8s; } .rq-pb.warn i { background: #ff9f0a; }\r\n.rq-hint { color: #8d8d97; font-size: 12.5px; }\r\n.rq-acts { display: flex; flex-direction: column; gap: 8px; align-items: stretch; justify-content: center; flex: none; position: relative; min-width: 128px; }\r\n.rq-x { position: absolute; top: -4px; right: -8px; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; color: #8d8d97; } .rq-x:hover { background: rgba(255,255,255,.1); color: #fff; }\r\n.rq-acts .btn.sm { margin-top: 0; align-self: stretch; }\r\n.rq-more { margin: 18px auto 0; display: flex; }\r\n\r\n/* ---------- what shall we watch tonight ---------- */\r\n.tn-page { max-width: 1180px; margin: 0 auto; }\r\n.tn-filters { display: flex; flex-direction: column; gap: 14px; margin: 6px 0 20px; } .tn-filters small { display: block; margin-bottom: 8px; color: #8d8d97; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: 11.5px; }\r\n.tn-moods { display: flex; gap: 8px; flex-wrap: wrap; } .tn-mood { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px 9px 12px; border-radius: 999px; background: rgba(255,255,255,.07); font-weight: 600; font-size: 14px; transition: .15s; } .tn-mood span { font-size: 18px; } .tn-mood:hover { background: rgba(255,255,255,.13); } .tn-mood.on { background: #fff; color: #000; }\r\n.tn-resume { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; } .tn-resume small { color: #8d8d97; font-weight: 700; } .tn-resume > div { display: flex; gap: 10px; flex-wrap: wrap; }\r\n.tn-rs { display: flex; align-items: center; gap: 12px; padding: 8px 16px 8px 8px; border-radius: 14px; background: rgba(255,255,255,.06); text-align: left; min-width: 260px; } .tn-rs:hover { background: rgba(255,255,255,.12); } .tn-rs b { display: block; max-width: 220px; } .tn-rs span { font-size: 12.5px; color: #9ccaff; } .tn-rsp { width: 38px; aspect-ratio: 2/3; border-radius: 6px; background: #2a2a30 center / cover; } .tn-rs svg { margin-left: auto; }\r\n.tn-res { display: flex; flex-direction: column; gap: 16px; } .tn-res.spin > * { animation: gm-in .45s both; } .tn-res.spin > *:nth-child(2) { animation-delay: .1s; } .tn-res.spin > *:nth-child(3) { animation-delay: .2s; }\r\n.tn-card { position: relative; display: flex; gap: 24px; padding: 22px; border-radius: 26px; overflow: hidden; background: #17171a; border: 1px solid rgba(255,255,255,.07); }\r\n.tn-bd { position: absolute; inset: 0; background: center / cover; opacity: .22; filter: blur(2px); } .tn-bd::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(90deg, #17171a 25%, transparent 120%); }\r\n.tn-poster { position: relative; width: clamp(110px, 16vw, 170px); aspect-ratio: 2/3; border-radius: 14px; flex: none; background: #26262b center / cover; box-shadow: 0 18px 50px rgba(0,0,0,.55); cursor: pointer; }\r\n.tn-body { position: relative; flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; } .tn-body h2 { margin: 0; font-size: clamp(22px, 3vw, 32px); font-weight: 900; letter-spacing: -.02em; cursor: pointer; }\r\n.tn-ov { margin: 0; color: #c0c0c8; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; max-width: 720px; }\r\n.tn-why { display: flex; gap: 8px; flex-wrap: wrap; } .tn-why i { font-style: normal; font-size: 12px; font-weight: 700; padding: 4px 11px; border-radius: 999px; background: rgba(255,159,10,.15); color: #ffcf8a; }\r\n.tn-end { color: #9a9aa4; font-size: 13.5px; }\r\n.tn-act { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }\r\n.tn-flick { height: 300px; border-radius: 26px; background: #17171a center / contain no-repeat; transition: background-image .05s; }\r\n.tn-banner { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin: 4px var(--pad) 26px; padding: 20px 26px; border-radius: 24px; background: radial-gradient(90% 160% at 0% 0%, rgba(255,159,10,.22), transparent 60%), #17171a; border: 1px solid rgba(255,255,255,.07); }\r\n.tn-bt { display: flex; align-items: center; gap: 16px; } .tn-be { font-size: 38px; } .tn-bt h2 { margin: 0; font-size: 21px; font-weight: 800; } .tn-bt p { margin: 3px 0 0; color: #9a9aa4; font-size: 13.5px; }\r\n.tn-bm { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }\r\n\r\n/* ---------- calendar: layers and history ---------- */\r\n.cal-top { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }\r\n.cal-layers { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }\r\n.cal-lay { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; background: rgba(255,255,255,.05); font-size: 13px; font-weight: 600; color: #8d8d97; transition: .15s; } .cal-lay i { width: 10px; height: 10px; border-radius: 50%; background: currentColor; opacity: .4; } .cal-lay.on { color: #fff; background: rgba(255,255,255,.12); } .cal-lay.on i { opacity: 1; }\r\n.cal-lay.l-rel.on i { background: #bf5af2; } .cal-lay.l-dl.on i { background: #6aa9ff; } .cal-lay.l-seen.on i { background: #34c759; }\r\n.cal-ev.seen { box-shadow: inset 3px 0 0 #34c759; background: rgba(52,199,89,.1); } .cal-ev.h-imported { box-shadow: inset 3px 0 0 #6aa9ff; background: rgba(106,169,255,.1); } .cal-ev.h-grabbed { box-shadow: inset 3px 0 0 #8d8d97; } .cal-ev.h-failed { box-shadow: inset 3px 0 0 #ff453a; background: rgba(255,69,58,.1); }\r\n.cal-more { color: #8d8d97; font-size: 11px; padding-left: 6px; }\r\n.cal-log { display: flex; flex-direction: column; gap: 24px; max-width: 860px; }\r\n.cal-lg h3 { margin: 0 0 10px; font-size: 14px; text-transform: capitalize; color: #a8a8b2; letter-spacing: .02em; }\r\n.cal-li { display: flex; align-items: center; gap: 12px; padding: 8px 14px 8px 10px; border-radius: 14px; background: rgba(255,255,255,.04); margin-bottom: 6px; cursor: pointer; } .cal-li:hover { background: rgba(255,255,255,.08); }\r\n.cal-lic { width: 28px; text-align: center; font-size: 16px; } .cal-lip { width: 34px; aspect-ratio: 2/3; border-radius: 5px; background: #2a2a30 center / cover; flex: none; } .cal-li > div:nth-of-type(2) { flex: 1; min-width: 0; } .cal-li b { display: block; font-size: 14.5px; } .cal-li span:not(.cal-lic) { color: #8d8d97; font-size: 12.5px; } .cal-li time { color: #6f6f78; font-size: 12px; }\r\n.cal-li.k-seen { box-shadow: inset 3px 0 0 #34c759; } .cal-li.k-imported { box-shadow: inset 3px 0 0 #6aa9ff; } .cal-li.k-failed { box-shadow: inset 3px 0 0 #ff453a; }\r\n\r\n@media (max-width: 820px) {\r\n  .rq-tiles { grid-template-columns: repeat(2, 1fr); } .rq-row { flex-wrap: wrap; } .rq-p { width: 64px; } .rq-acts { flex-direction: row; flex-wrap: wrap; width: 100%; min-width: 0; } .rq-x { top: -4px; } .rq-steps .rq-st span { font-size: 10.5px; } .rq-bar .dc-q { margin-left: 0; width: 100%; }\r\n  .tn-card { flex-direction: column; align-items: flex-start; } .tn-poster { width: 120px; } .tn-banner { margin-left: var(--pad); }\r\n  .st-row { flex-wrap: wrap; } .st-sz { margin-left: auto; } .cal-layers { margin-left: 0; }\r\n}\r\n.gm-tile2 small { display: block; } .st-page .gm-stats { grid-template-columns: repeat(auto-fill, minmax(178px, 1fr)); } .st-page .gm-tile2 b { font-size: 22px; }\r\n.rq-acts { padding-top: 14px; }\r\n\n/* ---------- Quiz: follow, filmography, scenes ---------- */\r\n.gm-nrow { display: flex; align-items: center; justify-content: center; gap: 12px; }\r\n.gm-ad .gm-nrow { justify-content: flex-start; margin-bottom: 8px; } .gm-ad .gm-nrow h2 { margin: 0; }\r\n.gm-heart { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 21px; line-height: 1; background: rgba(255,255,255,.08); color: #c9c9d1; transition: transform .15s, background .15s, color .15s; flex: none; }\r\n.gm-heart:hover { background: rgba(255,255,255,.16); transform: scale(1.08); }\r\n.gm-heart.on { color: #ff4d6d; background: rgba(255,77,109,.18); animation: gm-pop .4s cubic-bezier(.2,1.6,.4,1); }\r\n.gm-heart.sm { width: 28px; height: 28px; font-size: 16px; }\r\n.gm-follow.on { color: #ff4d6d; } .gm-follow { margin-top: 14px; }\r\n.gm-pc { position: relative; } .gm-pc.fav { box-shadow: inset 0 0 0 1px rgba(255,77,109,.45); } .gm-pcf { position: absolute; top: 8px; right: 10px; color: #ff4d6d; font-size: 14px; }\r\n.gm-favh { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; } .gm-favh h2 { margin: 0; }\r\n.gm-sec .nf-row { margin: 18px calc(-1 * var(--pad)) 0; }\r\n\r\n/* \"known from\" with roles, scenes and famous films */\r\n.gm-kfi { position: relative; overflow: hidden; background-size: cover; background-position: center right; cursor: default; }\r\n.gm-kfi > * { position: relative; z-index: 1; }\r\n.gm-kfi.has-scene::before { content: \"\"; position: absolute; inset: 0; z-index: 0; background: linear-gradient(90deg, rgba(23,23,27,.97) 38%, rgba(23,23,27,.55)); }\r\n.gm-kfi.has-scene.tagged { box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }\r\n.gm-kfi.fam { cursor: pointer; } .gm-kfi.fam:hover { background-color: rgba(255,255,255,.1); } .gm-kfi.seen em { color: #7cf0a3; }\r\n.gm-kfi em { display: block; font-style: normal; font-size: 11.5px; font-weight: 700; margin-top: 2px; }\r\n.gm-role2 { display: block; color: #ffd27a !important; font-weight: 600; }\r\n.gm-fam { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 4px; } .gm-fam > small { color: #8d8d97; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; }\r\n.gm-intro .gm-fam, .gm-card.flipped .gm-fam { align-items: center; } .gm-intro .gm-fam .gm-kf, .gm-card.flipped .gm-fam .gm-kf { justify-content: center; }\r\n.gm-scene { display: none; width: min(560px, 100%); aspect-ratio: 16/7; border-radius: 18px; background: #1c1c21 center / cover; box-shadow: 0 16px 50px rgba(0,0,0,.5); margin-bottom: 4px; }\r\n.gm-scene.has-scene { display: block; animation: gm-in .4s both; } .gm-scene.tagged { box-shadow: 0 16px 50px rgba(0,0,0,.5), 0 0 0 2px rgba(255,255,255,.2); }\r\n\r\n/* the actor dialog */\r\n.gm-frtools { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; } .gm-frtools .gm-filt { margin: 0; }\r\n.gm-frl { display: flex; flex-direction: column; gap: 8px; }\r\n.gm-fr { position: relative; display: flex; align-items: center; gap: 14px; padding: 8px 14px 8px 8px; border-radius: 16px; background: rgba(255,255,255,.05); overflow: hidden; cursor: pointer; transition: background .15s; } .gm-fr:hover { background: rgba(255,255,255,.1); }\r\n.gm-fr > * { position: relative; z-index: 1; }\r\n.gm-frs { position: absolute !important; z-index: 0 !important; inset: 0 0 0 38%; background: center / cover; opacity: 0; transition: opacity .4s; -webkit-mask-image: linear-gradient(90deg, transparent, #000 45%); mask-image: linear-gradient(90deg, transparent, #000 45%); } .gm-frs.has-scene { opacity: .6; } .gm-frs.tagged { opacity: .85; }\r\n.gm-frr { font-style: normal; width: 26px; text-align: center; font-size: 22px; font-weight: 900; color: #6f6f78; flex: none; }\r\n.gm-frp { width: 52px; aspect-ratio: 2/3; border-radius: 8px; background: #2a2a30 center / cover; flex: none; }\r\n.gm-frt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; } .gm-frt b { font-size: 15.5px; } .gm-frt .gm-role2 { font-size: 13px; }\r\n.gm-fst { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #8d8d97; } .gm-fst.seen { color: #7cf0a3; } .gm-fst.lib { color: #9ccaff; } .gm-fst.req { color: #ffcf8a; } .gm-fst i { font-style: normal; padding: 1px 8px; border-radius: 999px; background: rgba(255,255,255,.1); color: #c9c9d1; font-weight: 600; }\r\n.gm-frtools .gm-find { margin-left: auto; }\r\n@media (max-width: 820px) { .gm-frs { inset: 0 0 0 20%; } .gm-nrow { flex-wrap: wrap; } }\r\n\r\n/* answer card: countdown to the next question, actor shortcuts */\r\n.gm-cd { height: 3px; border-radius: 3px; background: rgba(255,255,255,.1); overflow: hidden; margin-top: 2px; } .gm-cd i { display: block; height: 100%; width: 100%; background: rgba(255,255,255,.5); transform-origin: left; animation: gm-cd linear forwards; } @keyframes gm-cd { to { transform: scaleX(0); } }\r\n.gm-fbface { padding: 0; border-radius: 50%; flex: none; transition: transform .15s; } .gm-fbface:hover { transform: scale(1.06); }\r\n.gm-allf { font-size: 12.5px; padding: 4px 12px; }\r\n\n/* ---------- v22: scrollers with arrows, modal scrollbars, person dialog ---------- */\n.hs-wrap { position: relative; }\n.hs { overflow-x: auto !important; scrollbar-width: none !important; scroll-behavior: smooth; }\n.hs::-webkit-scrollbar { display: none; height: 0; width: 0; }\n.hs-wrap .nf-arrow { margin-top: -22px; opacity: 0; }\n.hs-wrap:hover .nf-arrow:not(.off) { opacity: 1; }\n.hs-wrap .nf-arrow.off { pointer-events: none; opacity: 0 !important; }\n.sr-cast2.hs { padding-bottom: 0; }\n.sp-shelf.hs { margin: 0 -4px; padding: 4px; }\n.sr-p { background: none; border: 0; color: inherit; font: inherit; padding: 0; cursor: pointer; border-radius: 14px; }\n.sr-p .pi { transition: transform .18s, box-shadow .18s; }\n.sr-p:hover .pi, .sr-p:focus-visible .pi { transform: scale(1.06); box-shadow: 0 0 0 2px rgba(255,255,255,.85); }\n.pd-face { width: 120px; height: 120px; border-radius: 50%; background: #26262c center 18% / cover; flex: none; box-shadow: 0 10px 30px rgba(0,0,0,.45); }\n.pd-bio { margin: 8px 0 0; color: #b4b4bb; font-size: 14px; line-height: 1.5; }\n/* vertical scrollbars of dialogs: inset from the rounded corners, only visible on hover */\n.sr-modal::-webkit-scrollbar-track, .cxd-body::-webkit-scrollbar-track, .sp-liblist::-webkit-scrollbar-track { margin: 24px 0; }\n#cx-ui .sr-modal::-webkit-scrollbar-thumb, #cx-ui .cxd-body::-webkit-scrollbar-thumb, .sr-modal::-webkit-scrollbar-thumb, .cxd-body::-webkit-scrollbar-thumb { background-color: transparent; }\n.sr-modal:hover::-webkit-scrollbar-thumb, .cxd-body:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,.2); }\n.sp-liblist { scrollbar-width: none !important; } .sp-liblist::-webkit-scrollbar { display: none; width: 0; }\n/* check mark after a request / add: the plus turns green */\n.sp-add.done, .sp-pillbtn.done { background: #1ed760 !important; color: #000 !important; }\n\n/* ---------- calendar: open grid with hairlines, tinted entries ---------- */\n.cal-grid { gap: 0; border-top: 1px solid rgba(255,255,255,.07); border-left: 1px solid rgba(255,255,255,.07); border-radius: 18px; overflow: hidden; background: rgba(255,255,255,.015); }\n.cal-dow { padding: 10px 0; border-right: 1px solid rgba(255,255,255,.07); text-transform: uppercase; letter-spacing: .08em; font-size: 11px; color: #7d7d86; }\n.cal-day { background: transparent; border: 0; border-right: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.07); border-radius: 0; min-height: 138px; padding: 8px 6px; gap: 4px; }\n.cal-day.today { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.07); }\n.cal-day.other { opacity: .35; }\n.cal-day .n { font-size: 12px; font-weight: 600; color: #8f8f98; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; margin: 0 0 2px 2px; }\n.cal-day.today .n { background: #fff; color: #000; font-weight: 800; }\n.cal-ev { --k: #8d8d97; display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 8px; row-gap: 0; align-items: center; padding: 4px 8px 4px 4px; border-radius: 10px; background: color-mix(in srgb, var(--k) 11%, transparent); box-shadow: none !important; transition: background .15s; }\n.cal-ev:hover { background: color-mix(in srgb, var(--k) 22%, transparent); }\n.cal-ev:not(:has(.p)) { padding-left: 9px; grid-template-columns: minmax(0, 1fr); }\n.cal-ev .p { grid-row: 1 / span 2; width: 28px; height: 42px; border-radius: 6px; }\n.cal-ev > span { padding: 0 !important; font-size: 12px; font-weight: 600; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.cal-ev small { position: static !important; max-width: none !important; font-size: 10.5px; line-height: 1.3; color: color-mix(in srgb, var(--k) 70%, #9a9aa3); }\n.cal-ev.have, .cal-ev.seen { --k: #34c759; } .cal-ev.h-imported { --k: #6aa9ff; } .cal-ev.h-grabbed { --k: #9a9aa3; } .cal-ev.h-failed { --k: #ff5a50; }\n.cal-ev.digital { --k: #bf5af2; } .cal-ev.physical { --k: #ff9f0a; } .cal-ev.cinema { --k: #0a84ff; } .cal-ev.episode { --k: #64d2ff; }\n.cal-li { box-shadow: none !important; background: transparent; border-bottom: 1px solid rgba(255,255,255,.06); border-radius: 0; margin: 0; padding: 10px 6px; }\n.cal-li:hover { background: rgba(255,255,255,.04); }\n.cal-lic { width: 22px; color: #8d8d97; font-size: 14px; } .cal-li.k-seen .cal-lic { color: #34c759; } .cal-li.k-imported .cal-lic { color: #6aa9ff; } .cal-li.k-failed .cal-lic { color: #ff5a50; }\n@media (max-width: 800px) { .cal-grid { border: 0; background: none; border-radius: 0; } .cal-day { border: 0; border-bottom: 1px solid rgba(255,255,255,.07); min-height: 0; padding: 12px 0; } }\n\n/* ---------- dropdowns ---------- */\n.dd-btn { display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-width: 150px; height: 44px; padding: 0 16px 0 18px; border-radius: 14px; background: rgba(255,255,255,.07); color: #f2f2f5; font: inherit; font-weight: 600; font-size: 14px; border: 1px solid transparent; cursor: pointer; transition: background .15s, border-color .15s; text-align: left; }\n.dd-btn:hover { background: rgba(255,255,255,.11); } .dd-btn.open, .dd-btn:focus-visible { outline: 0; border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.11); }\n.dd-btn:disabled { opacity: .5; cursor: default; }\n.dd-l { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.dd-c { flex: none; width: 7px; height: 7px; border: solid #c9c9d0; border-width: 0 2px 2px 0; transform: translateY(-2px) rotate(45deg); transition: transform .18s; } .dd-btn.open .dd-c { transform: translateY(2px) rotate(-135deg); }\n.dc-sel { display: inline-block; } .dc-sel::after { display: none !important; } .dc-sel .dd-btn { border-radius: 999px; }\n.sr-opt .dd-btn, .set-row .dd-btn { height: 42px; }\n.dd-menu { position: fixed; z-index: 10050; overflow-y: auto; padding: 6px; border-radius: 16px; background: #1c1c20; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 22px 60px rgba(0,0,0,.65); animation: ddIn .14s ease-out; scrollbar-width: none; }\n.dd-menu::-webkit-scrollbar { display: none; }\n@keyframes ddIn { from { opacity: 0; transform: translateY(-4px) scale(.98); } }\n.dd-i { display: flex; align-items: center; justify-content: space-between; gap: 18px; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; background: transparent; color: #e9e9ee; font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; white-space: nowrap; }\n.dd-i:hover, .dd-i:focus-visible { outline: 0; background: rgba(255,255,255,.1); color: #fff; } .dd-i.on { color: #fff; font-weight: 700; } .dd-i svg { width: 16px; height: 16px; flex: none; }\n.dd-i:disabled { opacity: .4; }\n\n/* ---------- requests: tab strip, segmented progress, flat rows ---------- */\n.rq-tiles { display: flex; gap: 4px; margin: 6px 0 18px; border-bottom: 1px solid rgba(255,255,255,.08); overflow-x: auto; scrollbar-width: none; }\n.rq-tiles::-webkit-scrollbar { display: none; }\n.rq-tile { flex-direction: row; align-items: baseline; gap: 8px; padding: 12px 16px; border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: transparent; margin-bottom: -1px; white-space: nowrap; }\n.rq-tile:hover { background: rgba(255,255,255,.04); } .rq-tile.on { background: transparent; border-bottom-color: #fff; }\n.rq-tile b { font-size: 17px; font-weight: 800; order: 2; color: #8d8d97; } .rq-tile.on b { color: #fff; } .rq-tile span { font-size: 14px; color: #c9c9d0; } .rq-tile.on span { color: #fff; }\n.rq-tile.rq-pend b, .rq-tile.rq-prog b, .rq-tile.rq-done b, .rq-tile.rq-bad b { color: #8d8d97; } .rq-tile.on.rq-pend b { color: #ffcf8a; } .rq-tile.on.rq-prog b { color: #9ccaff; } .rq-tile.on.rq-done b { color: #7cf0a3; } .rq-tile.on.rq-bad b { color: #ff9b9b; }\n.rq-list { gap: 0; }\n.rq-row { box-shadow: none !important; background: transparent; border: 0; border-bottom: 1px solid rgba(255,255,255,.07); border-radius: 0; padding: 18px 6px; gap: 20px; transition: background .15s; }\n.rq-row:hover { background: rgba(255,255,255,.025); }\n.rq-p { width: 72px; border-radius: 9px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }\n.rq-t b { font-size: 17px; }\n.rq-steps { gap: 6px; margin: 6px 0 2px; max-width: 520px; }\n.rq-st { max-width: none; gap: 7px; font-size: 11.5px; font-weight: 600; letter-spacing: .01em; }\n.rq-st::before { position: static !important; display: block; width: 100%; height: 4px; border-radius: 4px; background: rgba(255,255,255,.1); }\n.rq-st i { display: none; }\n.rq-st.done::before { background: #34c759; } .rq-st.cur::before { background: #6aa9ff; } .s-pending .rq-st.cur::before { background: #ffcf8a; }\n.rq-st.cur::before { animation: rqSeg 1.8s ease-in-out infinite; } .s-available .rq-st::before { animation: none; }\n@keyframes rqSeg { 50% { opacity: .55; } }\n.rq-st.cur { color: #fff; } .rq-st.done { color: #9a9aa4; }\n.rq-bad { display: inline-block; align-self: flex-start; padding: 4px 12px; border-radius: 999px; background: rgba(255,90,80,.14); font-size: 12px; }\n.rq-acts { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: flex-end; min-width: 0; gap: 8px; padding-top: 0; align-self: center; }\n.rq-acts .btn.sm { height: 36px; padding: 0 16px; font-size: 13px; }\n.rq-x { position: static !important; width: 32px; height: 32px; }\n@media (max-width: 820px) { .rq-tile { padding: 10px 12px; } .rq-row { padding: 14px 0; gap: 14px; } .rq-acts { justify-content: flex-start; } }\n\n/* menus: the current page is clearly readable */\n.nf-pop a.on, .nf-pop a.on:hover { background: rgba(255,255,255,.14) !important; color: #fff !important; }\n.nf-pop a:hover { color: #fff; }\n.nf-pop a[hidden] { display: none !important; }\n\n/* ---------- discover: extended filters ---------- */\n.dc-fbtn { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px; border-radius: 999px; background: rgba(255,255,255,.07); color: #f2f2f5; font-weight: 600; font-size: 14px; border: 1px solid transparent; flex: none; transition: background .15s; }\n.dc-fbtn:hover { background: rgba(255,255,255,.12); } .dc-fbtn.open { border-color: rgba(255,255,255,.4); } .dc-fbtn.act { background: #fff; color: #000; }\n.dc-fbtn em { font-style: normal; font-size: 12px; font-weight: 800; min-width: 20px; height: 20px; padding: 0 6px; display: grid; place-items: center; border-radius: 10px; background: #000; color: #fff; }\n.dc-adv { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; margin: 0 var(--pad) 18px; padding: 18px 20px; border-radius: 20px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); }\n.dc-adv[hidden] { display: none; }\n.dc-f { display: flex; flex-direction: column; gap: 6px; min-width: 150px; flex: 1 1 150px; max-width: 220px; } .dc-f label { font-size: 12px; font-weight: 700; color: #9a9aa2; letter-spacing: .02em; }\n.dc-adv .btn { height: 44px; }\n\n/* ---------- floating music pill: volume and close ---------- */\n.nf-npill { padding-right: 8px; }\n.nf-npill .tx { max-width: 220px; }\n.np-vol { display: flex; align-items: center; gap: 2px; }\n.np-m { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #d6d6dc; } .np-m:hover { background: rgba(255,255,255,.12); color: #fff; } .np-m svg { width: 18px; height: 18px; }\n.np-vol input { -webkit-appearance: none; appearance: none; width: 0; opacity: 0; height: 4px; border-radius: 4px; margin: 0; background: linear-gradient(90deg, #fff var(--v, 100%), rgba(255,255,255,.22) var(--v, 100%)); transition: width .2s, opacity .2s, margin .2s; cursor: pointer; }\n.nf-npill:hover .np-vol input, .np-vol:focus-within input { width: 84px; opacity: 1; margin: 0 8px 0 4px; }\n.np-vol input::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }\n.np-vol input::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 0; }\n.np-x { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: #9a9aa2; flex: none; } .np-x:hover { background: rgba(255,255,255,.14); color: #fff; }\n@media (max-width: 800px) {\n  .nf-npill { left: 10px !important; right: 10px !important; width: auto !important; max-width: none !important; }\n  .nf-npill .tx { flex: 1; max-width: none; }\n  .np-vol input { display: none; }\n}\n\n/* ---------- three-dot menus: compact ---------- */\n.sp-menu { min-width: 190px !important; max-width: 260px !important; padding: 5px !important; border-radius: 14px !important; font-size: 13px !important; }\n.sp-menu button { padding: 7px 10px !important; gap: 10px !important; font-size: 13px !important; font-weight: 500; border-radius: 9px !important; line-height: 1.25; }\n.sp-menu button svg { width: 16px !important; height: 16px !important; flex: none; }\n.sp-menu hr { margin: 4px 4px !important; }\n\n/* ---------- music: skeletons, check marks, downloads, partial albums ---------- */\n@keyframes skPulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }\n.sk-sec, .sk-wrap { margin: 8px 0 22px; } .sk-h { width: 160px; height: 22px; border-radius: 8px; background: rgba(255,255,255,.08); margin: 0 0 14px; animation: skPulse 1.4s ease-in-out infinite; }\n.sk-row { display: flex; gap: 16px; overflow: hidden; } .sk-tile { width: 170px; flex: none; display: flex; flex-direction: column; gap: 8px; animation: skPulse 1.4s ease-in-out infinite; }\n.sk-tile i { display: block; aspect-ratio: 1; border-radius: 12px; background: rgba(255,255,255,.07); } .sk-tile b, .sk-li b { display: block; height: 12px; width: 70%; border-radius: 6px; background: rgba(255,255,255,.08); } .sk-tile b.s, .sk-li b.s { width: 45%; height: 10px; }\n.sk-list { display: flex; flex-direction: column; gap: 10px; } .sk-li { display: flex; align-items: center; gap: 14px; padding: 6px 4px; animation: skPulse 1.4s ease-in-out infinite; }\n.sk-li i { width: 44px; height: 44px; border-radius: 6px; background: rgba(255,255,255,.07); flex: none; } .sk-li > div { flex: 1; display: flex; flex-direction: column; gap: 8px; }\n.pbtn.done, .lk.rq.done, .sp-pillbtn.done { background: #1ed760 !important; color: #000 !important; opacity: 1 !important; cursor: default; }\n.lk.rq.done { border-radius: 50%; } .pbtn.done svg, .lk.rq.done svg { stroke-width: 3; }\n.pbtn.busy, .lk.rq.busy { opacity: .6; pointer-events: none; }\n.sp-morewrap { margin: 6px 0 10px; } .sp-morewrap .btn { height: 38px; font-size: 13px; }\n.sp-tile.partial .sb { color: #e8c46a; }\n.notown-tile .cv { opacity: .78; } .notown-tile:hover .cv { opacity: 1; }\n.alb-missing { margin-top: 30px; } .am-h { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 8px; } .am-h h2 { margin: 0; }\n.dl-wrap { max-width: 860px; } .dl-h { margin: 22px 0 12px; font-size: 18px; }\n.dl-row { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,.07); border-radius: 0 !important; padding: 12px 4px !important; }\n.dl-row .tx b { font-size: 15px; } .dl-row .why { color: #b88a8a !important; font-size: 12px !important; }\n.dl-row .st { text-align: right; flex: none; display: flex; flex-direction: column; gap: 3px; } .dl-row .st em { font-style: normal; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,.1); } .dl-row .st small { color: #7d7d86; font-size: 11.5px; }\n.dl-row.k-done .st em { background: rgba(52,199,89,.16); color: #7cf0a3; } .dl-row.k-failed .st em { background: rgba(255,90,80,.16); color: #ff9b9b; } .dl-row.k-work .st em { background: rgba(106,169,255,.16); color: #9ccaff; } .dl-row.k-queued .st em { background: rgba(255,207,138,.14); color: #ffcf8a; }\n.dl-row .bar i { display: block; height: 100%; background: #6aa9ff; border-radius: 4px; }\n.sp-navlink[hidden], .sp-chip[hidden] { display: none !important; }\n\n/* ---------- polish ---------- */\n.rq-st:last-child::before { display: block !important; }\n.rq-main > .rq-bad { display: inline-block; align-self: flex-start; padding: 4px 12px; border-radius: 999px; background: rgba(255,90,80,.14); font-size: 12px; }\n.rq-tile.rq-bad { display: flex; background: transparent; padding: 12px 16px; color: inherit; font-weight: inherit; border-radius: 0; margin: 0 0 -1px; align-items: baseline; }\n.rq-bar .dc-q, .dc-q { position: relative; } .rq-bar .dc-q input { padding-left: 38px; } .rq-bar .dc-q svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; opacity: .7; }\n.dc-fbtn em[hidden] { display: none; }\n.cxd .sr-opts { grid-template-columns: 1fr; }\n.rq-bar .dc-q input { width: 100%; box-sizing: border-box; height: 44px; padding: 0 18px 0 42px !important; border-radius: 999px !important; background: rgba(255,255,255,.07) !important; color: #fff; border: 1px solid transparent !important; font: inherit; font-size: 14px; outline: 0; transition: background .2s, border-color .2s; }\n.rq-bar .dc-q input:focus { background: rgba(255,255,255,.11) !important; border-color: rgba(255,255,255,.35) !important; }\n";
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
  'filter': '<path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/> <path d="M6 4v4"/> <path d="M6 12v8"/> <path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/> <path d="M12 4v10"/> <path d="M12 18v2"/> <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/> <path d="M18 4v1"/> <path d="M18 9v11"/>',
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
LUMAP.filter = 'filter';

/* ---------- Cinema UI core: utils, api, router, Netflix shell ---------- */
const L = /^de/i.test(document.documentElement.lang || navigator.language || '') ? 'de' : 'en';
const TX = {
  en: { home: 'Home', movies: 'Movies', shows: 'TV Shows', mylist: 'My List', music: 'Music', search: 'Search', play: 'Play', resume: 'Resume', info: 'More info', trailer: 'Trailer',
    continue: 'Continue watching', nextup: 'Next up', newMovies: 'Recently added movies', newShows: 'Recently added shows', top: 'Top rated', random: 'Random picks', recentAlbums: 'New in music',
    favs: 'My List', cast: 'Cast', similar: 'More like this', episodes: 'Episodes', season: 'Season', seasons: 'Seasons', empty: 'Nothing here yet.', results: 'Results for', noRes: 'No results found.',
    prefs: 'Settings', dash: 'Dashboard', logout: 'Sign out', watched: 'Watched', list: 'List', genres: 'Genres', director: 'Director', studio: 'Studio', min: 'min', collection: 'Collection', inCollection: 'In this collection',
    gm: 'Good morning', ga: 'Good afternoon', ge: 'Good evening', liked: 'Liked Songs', playlists: 'Playlists', albums: 'Albums', artists: 'Artists', songs: 'Songs', library: 'Your Library', createPl: 'Create playlist',
    recent: 'Recently played', yourPl: 'Your playlists', mixes: 'Made for you', newAlb: 'Recently added', popular: 'Popular', searchMusic: 'What do you want to play?', top1: 'Top result', browse: 'Browse all',
    queue: 'Queue', nowPlaying: 'Now playing', nextIn: 'Next in queue', shuffle: 'Shuffle', addQ: 'Add to queue', playNext: 'Play next', addPl: 'Add to playlist', newPl: 'New playlist', goArtist: 'Go to artist', goAlbum: 'Go to album',
    like: 'Save to Liked Songs', unlike: 'Remove from Liked Songs', rmPl: 'Remove from this playlist', name: 'Name', cancel: 'Cancel', create: 'Create', title: 'Title', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Artist', mix: 'Mix',
    error: 'Something went wrong', popularTracks: 'Popular', discography: 'Discography', moviesTv: 'Movies & TV', songsN: 'songs', trackN: 'song', random2: 'Shuffle play', myMix: 'Mix', added: 'Added to playlist', queued: 'Added to queue', ofN: 'min', discover: 'Discover', requests: 'Requests', calendar: 'Calendar', bookmarks: 'Bookmarks', more: 'More', pskin: 'Plugin page styling', on: 'On', off: 'Off', inLib: 'In library', requested: 'Requested', notOwned: 'Not in library', request: 'Request', trending: 'Trending', popMovies: 'Popular movies', popShows: 'Popular shows', upMovies: 'Upcoming movies', upShows: 'Upcoming shows', notInLib: 'Not in your library yet', all: 'All', watchlist: 'Watchlist', wlAdded: 'Added to watchlist', wlRemoved: 'Removed from watchlist', wlAdd: 'Add to watchlist', wlRemove: 'Remove from watchlist', favAdd: 'Add to My List', favRemove: 'Remove from My List', markWatched: 'Mark as watched', markUnwatched: 'Mark as unwatched', markedWatched: 'Marked as watched', markedUnwatched: 'Marked as unwatched', openDetails: 'Open details', editMeta: 'Edit metadata', editImages: 'Edit images', identify: 'Identify', refreshMeta: 'Refresh metadata', openNative: 'Open in Jellyfin', delete: 'Delete', cmdNA: 'That action is not available here', because: 'Because you watched', genresRandom: 'Random genre rows', seerrRec: 'Recommended for you', settings: 'Settings', general: 'General', setHero: 'Billboard on home', setHeroHint: 'Show the large rotating banner at the top.', setPeek: 'Hover preview cards', setPeekHint: 'Show a preview card when you hover a poster.', setInfinite: 'Infinite scroll', setInfiniteHint: 'Load more rows and grids as you scroll.', setSeerrWl: 'Sync watchlist with Seerr', setSeerrWlHint: 'Also add to your Seerr watchlist when you add a title to your watchlist.', appearance: 'Appearance', accent: 'Accent color', accentHint: 'Used for the logo and progress bars.', homeSections: 'Home sections', homeSectionsHint: 'Reorder, hide or add rows. Changes sync to all your devices.', custom: 'custom', secGenre: 'Genre row', secLibrary: 'Library row', add: 'Add', reset: 'Reset', rqPending: 'Waiting', rqProcessing: 'In progress', rqAvailable: 'Available', rqDeclined: 'Declined', rqWaiting: 'Waiting for approval', rqPartial: 'Partly available', rqDownloading: 'Downloading', rqApproved: 'Approved', approve: 'Approve', decline: 'Decline', downloads: 'Downloads', noDownloads: 'Nothing is downloading right now.', today: 'Today', arrOff: 'Radarr and Sonarr are not connected yet. Add them in Dashboard, Plugins, Cinema.', cal_digital: 'Digital release', cal_physical: 'Physical release', cal_cinema: 'In cinemas', cal_episode: 'Episode', close: 'Close', musicRequestArtists: 'Request artists', musicRequestAlbums: 'Request albums', discoverMusic: 'Discover new music', globalTopArtists: 'Top artists worldwide', all2: 'All', sortPop: 'Popularity', sortRating: 'Rating', sortNew: 'Newest', hideOwned: 'Hide what I have', moreToExplore: 'More to explore', moreOf: 'More', miTitle: 'Media info', miFile: 'File', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'audience', similarNew: 'More like this (not in your library yet)', forYou: 'Made for you', notOwnedMix: 'not in your library', requestAlbum: 'Request album', noPreview: 'No preview available', discoverShort: 'Discover', aurralOff: 'Aurral is not connected yet. Add it in Dashboard, Plugins, Cinema.', discoverCta: 'Find new tracks, artists and albums and request them.', open: 'Open', pluginsH: 'Plugins', plPreparing: 'Preparing stream…', plRetry: 'Reconnecting…', plAudio: 'Audio', plSubs: 'Subtitles', plOff: 'Off', plSpeed: 'Speed', plFail: 'Playback failed', plRetryBtn: 'Try again', plTranscode: 'Force transcoding', plNative: 'Use Jellyfin player', plNext: 'Next episode', setNative: 'Use the Jellyfin player', plBurn: 'burned in', featOff: 'This feature is turned off on this server.', showAll: 'Show all', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Enter the code shown on your TV (or other device) to sign it in.', qcCode: 'Code', qcOk: 'Device signed in', qcBad: 'Code not accepted', qcGo: 'Authorize', setTv: 'TV mode', setTvHint: 'Remote control layout with big focus ring. Only for this device; the page reloads.', imgPrimary: 'Poster', imgBackdrop: 'Backdrops', imgLogo: 'Logo', imgThumb: 'Thumbnail', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Search online', upload: 'Upload', noImages: 'No images', allLangs: 'All languages', back: 'Back', save: 'Save', saved: 'Saved', fName: 'Title', fOrig: 'Original title', fSort: 'Sort title', fOverview: 'Overview', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Year', fPremiere: 'Release date', fRating: 'Age rating', fCommunity: 'Community rating', fCritic: 'Critic rating', fLock: 'Lock metadata (do not overwrite on refresh)', fComma: 'Separate with commas', idSearch: 'Search', idNone: 'Nothing found', idApplied: 'Applied', idHint: 'Pick the correct result to replace metadata and images.', rfScan: 'Scan for new and updated files', rfScanHint: 'Only picks up changes.', rfMissing: 'Search for missing metadata', rfMissingHint: 'Fills gaps, keeps what you edited.', rfReplace: 'Replace all metadata', rfReplaceHint: 'Overwrites everything with fresh data from the providers.', rfImages: 'Also replace images', rfStart: 'Refresh', rfStarted: 'Refresh started', delConfirm: '"{n}" and its files will be deleted permanently. This cannot be undone.', delDone: 'Deleted', setDevPlayer: 'Player on this device', setDevPlayerHint: 'Applies only to this phone or computer. Other devices keep their own choice.', plOwn: 'Cinema player', plStd: 'Jellyfin standard', sortName: 'Name', sortRating: 'Rating', sortAdded: 'Recently added', sortYear: 'Release year', sortRandom: 'Random', browseAll: 'All', tagline: 'Tagline', factDirector: 'Director', factWriter: 'Writer', factStatus: 'Status', factLang: 'Original language', factRuntime: 'Runtime', factBudget: 'Budget', factRevenue: 'Box office', factStudio: 'Studio', factNetwork: 'Network', factSeasons: 'Seasons', reqOptions: 'Request options', reqServer: 'Server', reqProfile: 'Quality profile', reqFolder: 'Folder', reqAdvanced: 'Advanced (admin)', watchTrailer: 'Trailer', moreCast: 'Cast', noFilter: 'Default', setGeneral: 'General', setHome: 'Home', setPlayer: 'Player', setLook: 'Appearance', setServices: 'Services', setAdv: 'Advanced', setPeekDelay: 'Preview delay', setPeekDelayHint: 'How long to hover before the preview card opens.', fast: 'Fast', normal: 'Normal', slow: 'Slow', setHeroItems: 'Billboard titles', setHeroItemsHint: 'How many titles rotate in the billboard.', setHeroInterval: 'Billboard speed', setHeroIntervalHint: 'Seconds before the next title.', setCardSize: 'Card size', setCardSizeHint: 'Size of posters and thumbnails.', small: 'Small', medium: 'Medium', large: 'Large', pskinHint: 'Applies the Cinema style to Seerr, calendar and other plugin pages.', connected: 'Connected', notConnected: 'Not connected', serverSettings: 'Server settings', askAdmin: 'Ask your administrator to connect services.', setWatchlist: 'Watchlist', exportSet: 'Export / import settings', exportSetHint: 'Copy your settings as text or paste them on another account.', copy: 'Copy', impt: 'Import', pasteSet: 'Paste settings JSON', copied: 'Copied', resetAll: 'Reset all my settings', resetAllHint: 'Go back to the server defaults.', clearCache: 'Clear caches', clearCacheHint: 'Reload library and request data.', clear: 'Clear', killSwitch: 'Emergency switch', killSwitchHint: 'Type this in the browser console to turn Cinema off.', about: 'About', resetDefault: 'Reset to default', lockedBy: 'Turned off by the server administrator.', moreActions: 'More actions (plugins)', fromDecade: 'From the', unwatched: 'Not watched yet', plSubStyle: 'Subtitle appearance…', plChapters: 'Chapters', plSkipCredits: 'Skip credits', plSkipRecap: 'Skip recap', plSkipIntro: 'Skip intro', plNextIn: 'Next episode in', plBack: 'Back', plInfo: 'Playback info', plBack10: 'Back 10 seconds', plFwd10: 'Forward 10 seconds', plSettings: 'Settings', plFs: 'Fullscreen', plQuality: 'Quality', plAuto: 'Auto (original)', plQualityHint: 'Lower quality is transcoded by the server.', plAutoNext: 'Play next episode', plAutoNextHint: 'Continue with the next episode automatically.', plAutoSkip: 'Skip intros automatically', plAutoSkipHint: 'Needs intro detection on the server.', plRemember: 'Remember volume', plSubSize: 'Size', plSubPos: 'Position', plLow: 'Low', plMid: 'Middle', plHigh: 'High', plSubBg: 'Background', plShadow: 'Shadow', plBox: 'Box', plNone: 'None', plSubColor: 'Color', plWhite: 'White', plYellow: 'Yellow', plGreen: 'Green', plSubBold: 'Bold text', plSubFont: 'Font', plSubPreview: 'This is how subtitles look', plKPlay: 'Play / pause', plKVol: 'Volume', plKFs: 'Fullscreen', plKMute: 'Mute', plKBack: 'Close menu / leave', plTab_quality: 'Video', plTab_playback: 'Playback', plTab_subs: 'Subtitles', plTab_keys: 'Keys', plMethod: 'Method', plSource: 'Source', plPlaying: 'Playing', plBitrate: 'Bitrate', plBuffer: 'Buffer', plDropped: 'Dropped frames', setNativeHint: 'Turn on if the built-in player gives you trouble.' },
  de: { home: 'Startseite', movies: 'Filme', shows: 'Serien', mylist: 'Meine Liste', music: 'Musik', search: 'Suchen', play: 'Abspielen', resume: 'Fortsetzen', info: 'Mehr Infos', trailer: 'Trailer',
    continue: 'Weiterschauen', nextup: 'Als Nächstes', newMovies: 'Neu hinzugefügte Filme', newShows: 'Neu hinzugefügte Serien', top: 'Bestbewertet', random: 'Zufallsfunde', recentAlbums: 'Neu in der Musik',
    favs: 'Meine Liste', cast: 'Besetzung', similar: 'Ähnliche Titel', episodes: 'Folgen', season: 'Staffel', seasons: 'Staffeln', empty: 'Noch nichts vorhanden.', results: 'Ergebnisse für', noRes: 'Keine Ergebnisse gefunden.',
    prefs: 'Einstellungen', dash: 'Dashboard', logout: 'Abmelden', watched: 'Gesehen', list: 'Liste', genres: 'Genres', director: 'Regie', studio: 'Studio', min: 'Min.', collection: 'Sammlung', inCollection: 'In dieser Sammlung',
    gm: 'Guten Morgen', ga: 'Guten Tag', ge: 'Guten Abend', liked: 'Lieblingssongs', playlists: 'Playlists', albums: 'Alben', artists: 'Künstler', songs: 'Titel', library: 'Deine Bibliothek', createPl: 'Playlist erstellen',
    recent: 'Zuletzt gehört', yourPl: 'Deine Playlists', mixes: 'Für dich gemacht', newAlb: 'Zuletzt hinzugefügt', popular: 'Beliebt', searchMusic: 'Was möchtest du hören?', top1: 'Top-Ergebnis', browse: 'Alle durchsuchen',
    queue: 'Warteschlange', nowPlaying: 'Läuft gerade', nextIn: 'Als Nächstes', shuffle: 'Zufällig', addQ: 'Zur Warteschlange', playNext: 'Als Nächstes spielen', addPl: 'Zur Playlist hinzufügen', newPl: 'Neue Playlist', goArtist: 'Zum Künstler', goAlbum: 'Zum Album',
    like: 'Zu Lieblingssongs', unlike: 'Aus Lieblingssongs entfernen', rmPl: 'Aus dieser Playlist entfernen', name: 'Name', cancel: 'Abbrechen', create: 'Erstellen', title: 'Titel', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Künstler', mix: 'Mix',
    error: 'Etwas ist schiefgelaufen', popularTracks: 'Beliebt', discography: 'Diskografie', moviesTv: 'Filme & Serien', songsN: 'Titel', trackN: 'Titel', random2: 'Zufallswiedergabe', myMix: 'Mix', added: 'Zur Playlist hinzugefügt', queued: 'Zur Warteschlange hinzugefügt', ofN: 'Min.', discover: 'Entdecken', requests: 'Anfragen', calendar: 'Kalender', bookmarks: 'Lesezeichen', more: 'Mehr', pskin: 'Plugin-Seiten-Design', on: 'An', off: 'Aus', inLib: 'In Bibliothek', requested: 'Angefragt', notOwned: 'Nicht vorhanden', request: 'Anfragen', trending: 'Angesagt', popMovies: 'Beliebte Filme', popShows: 'Beliebte Serien', upMovies: 'Bald im Kino', upShows: 'Bald neue Serien', notInLib: 'Noch nicht in deiner Bibliothek', all: 'Alle', watchlist: 'Watchlist', wlAdded: 'Zur Watchlist hinzugefügt', wlRemoved: 'Aus Watchlist entfernt', wlAdd: 'Zur Watchlist', wlRemove: 'Von Watchlist entfernen', favAdd: 'Zu Meine Liste', favRemove: 'Aus Meine Liste entfernen', markWatched: 'Als gesehen markieren', markUnwatched: 'Als ungesehen markieren', markedWatched: 'Als gesehen markiert', markedUnwatched: 'Als ungesehen markiert', openDetails: 'Details öffnen', editMeta: 'Metadaten bearbeiten', editImages: 'Bilder bearbeiten', identify: 'Identifizieren', refreshMeta: 'Metadaten aktualisieren', openNative: 'In Jellyfin öffnen', delete: 'Löschen', cmdNA: 'Diese Aktion ist hier nicht verfügbar', because: 'Weil du gesehen hast', genresRandom: 'Zufällige Genre-Reihen', seerrRec: 'Empfohlen für dich', settings: 'Einstellungen', general: 'Allgemein', setHero: 'Billboard auf der Startseite', setHeroHint: 'Zeigt das große rotierende Banner oben.', setPeek: 'Vorschau beim Hovern', setPeekHint: 'Zeigt eine Vorschaukarte, wenn du ein Poster überfährst.', setInfinite: 'Endloses Scrollen', setInfiniteHint: 'Lädt weitere Reihen und Listen beim Scrollen.', setSeerrWl: 'Watchlist mit Seerr synchronisieren', setSeerrWlHint: 'Fügt Titel auch deiner Seerr-Watchlist hinzu.', appearance: 'Aussehen', accent: 'Akzentfarbe', accentHint: 'Für Logo und Fortschrittsbalken.', homeSections: 'Startseiten-Bereiche', homeSectionsHint: 'Reihen sortieren, ausblenden oder hinzufügen. Änderungen synchronisieren auf alle Geräte.', custom: 'eigene', secGenre: 'Genre-Reihe', secLibrary: 'Bibliotheks-Reihe', add: 'Hinzufügen', reset: 'Zurücksetzen', rqPending: 'Wartend', rqProcessing: 'In Arbeit', rqAvailable: 'Verfügbar', rqDeclined: 'Abgelehnt', rqWaiting: 'Wartet auf Genehmigung', rqPartial: 'Teilweise verfügbar', rqDownloading: 'Lädt', rqApproved: 'Genehmigt', approve: 'Genehmigen', decline: 'Ablehnen', downloads: 'Downloads', noDownloads: 'Gerade lädt nichts herunter.', today: 'Heute', arrOff: 'Radarr und Sonarr sind noch nicht verbunden. Trage sie unter Dashboard, Plugins, Cinema ein.', cal_digital: 'Digitale Veröffentlichung', cal_physical: 'Physische Veröffentlichung', cal_cinema: 'Im Kino', cal_episode: 'Folge', close: 'Schließen', musicRequestArtists: 'Künstler anfragen', musicRequestAlbums: 'Alben anfragen', discoverMusic: 'Neue Musik entdecken', globalTopArtists: 'Top-Künstler weltweit', all2: 'Alle', sortPop: 'Beliebtheit', sortRating: 'Bewertung', sortNew: 'Neueste', hideOwned: 'Bereits vorhandene ausblenden', moreToExplore: 'Mehr zum Entdecken', moreOf: 'Mehr', miTitle: 'Medien-Info', miFile: 'Datei', miBitrate: 'Bitrate', miVideo: 'Video', audience: 'Publikum', similarNew: 'Ähnliche Titel (noch nicht in deiner Bibliothek)', forYou: 'Für dich gemacht', notOwnedMix: 'nicht in deiner Bibliothek', requestAlbum: 'Album anfragen', noPreview: 'Keine Vorschau verfügbar', discoverShort: 'Entdecken', aurralOff: 'Aurral ist noch nicht verbunden. Trage es unter Dashboard, Plugins, Cinema ein.', discoverCta: 'Neue Titel, Künstler und Alben finden und anfragen.', open: 'Öffnen', pluginsH: 'Plugins', plPreparing: 'Stream wird vorbereitet…', plRetry: 'Verbindung wird wiederhergestellt…', plAudio: 'Ton', plSubs: 'Untertitel', plOff: 'Aus', plSpeed: 'Tempo', plFail: 'Wiedergabe fehlgeschlagen', plRetryBtn: 'Erneut versuchen', plTranscode: 'Transkodierung erzwingen', plNative: 'Jellyfin-Player nutzen', plNext: 'Nächste Folge', setNative: 'Jellyfin-Player verwenden', plBurn: 'eingebrannt', featOff: 'Diese Funktion ist auf diesem Server deaktiviert.', showAll: 'Alle anzeigen', quickConnect: 'Quick Connect', qcTitle: 'Quick Connect', qcHint: 'Gib den Code ein, der auf deinem Fernseher (oder anderen Gerät) angezeigt wird.', qcCode: 'Code', qcOk: 'Gerät angemeldet', qcBad: 'Code nicht akzeptiert', qcGo: 'Freigeben', setTv: 'TV-Modus', setTvHint: 'Layout für die Fernbedienung mit großem Fokusrahmen. Nur für dieses Gerät, die Seite lädt neu.', imgPrimary: 'Poster', imgBackdrop: 'Hintergründe', imgLogo: 'Logo', imgThumb: 'Vorschaubild', imgBanner: 'Banner', imgArt: 'Clearart', imgDisc: 'Disc', searchOnline: 'Online suchen', upload: 'Hochladen', noImages: 'Keine Bilder', allLangs: 'Alle Sprachen', back: 'Zurück', save: 'Speichern', saved: 'Gespeichert', fName: 'Titel', fOrig: 'Originaltitel', fSort: 'Sortiertitel', fOverview: 'Beschreibung', fTagline: 'Tagline', fGenres: 'Genres', fTags: 'Tags', fStudios: 'Studios', fYear: 'Jahr', fPremiere: 'Erscheinungsdatum', fRating: 'Altersfreigabe', fCommunity: 'Community-Bewertung', fCritic: 'Kritiker-Bewertung', fLock: 'Metadaten sperren (beim Aktualisieren nicht überschreiben)', fComma: 'Mit Komma trennen', idSearch: 'Suchen', idNone: 'Nichts gefunden', idApplied: 'Übernommen', idHint: 'Wähle das richtige Ergebnis, um Metadaten und Bilder zu ersetzen.', rfScan: 'Nach neuen und geänderten Dateien suchen', rfScanHint: 'Übernimmt nur Änderungen.', rfMissing: 'Fehlende Metadaten suchen', rfMissingHint: 'Füllt Lücken, behält deine Änderungen.', rfReplace: 'Alle Metadaten ersetzen', rfReplaceHint: 'Überschreibt alles mit frischen Daten der Anbieter.', rfImages: 'Auch Bilder ersetzen', rfStart: 'Aktualisieren', rfStarted: 'Aktualisierung gestartet', delConfirm: '„{n}“ und die zugehörigen Dateien werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.', delDone: 'Gelöscht', setDevPlayer: 'Player auf diesem Gerät', setDevPlayerHint: 'Gilt nur für dieses Handy bzw. diesen Computer. Andere Geräte behalten ihre eigene Wahl.', plOwn: 'Cinema-Player', plStd: 'Jellyfin-Standard', sortName: 'Name', sortRating: 'Bewertung', sortAdded: 'Zuletzt hinzugefügt', sortYear: 'Erscheinungsjahr', sortRandom: 'Zufällig', browseAll: 'Alle', tagline: 'Tagline', factDirector: 'Regie', factWriter: 'Drehbuch', factStatus: 'Status', factLang: 'Originalsprache', factRuntime: 'Laufzeit', factBudget: 'Budget', factRevenue: 'Einspielergebnis', factStudio: 'Studio', factNetwork: 'Sender', factSeasons: 'Staffeln', reqOptions: 'Anfrage-Optionen', reqServer: 'Server', reqProfile: 'Qualitätsprofil', reqFolder: 'Ordner', reqAdvanced: 'Erweitert (Admin)', watchTrailer: 'Trailer', moreCast: 'Besetzung', noFilter: 'Standard', setGeneral: 'Allgemein', setHome: 'Startseite', setPlayer: 'Player', setLook: 'Aussehen', setServices: 'Dienste', setAdv: 'Erweitert', setPeekDelay: 'Vorschau-Verzögerung', setPeekDelayHint: 'Wie lange du hovern musst, bis die Vorschaukarte öffnet.', fast: 'Schnell', normal: 'Normal', slow: 'Langsam', setHeroItems: 'Billboard-Titel', setHeroItemsHint: 'Wie viele Titel im Billboard wechseln.', setHeroInterval: 'Billboard-Tempo', setHeroIntervalHint: 'Sekunden bis zum nächsten Titel.', setCardSize: 'Kartengröße', setCardSizeHint: 'Größe von Postern und Vorschaubildern.', small: 'Klein', medium: 'Mittel', large: 'Groß', pskinHint: 'Wendet den Cinema-Stil auf Seerr, Kalender und andere Plugin-Seiten an.', connected: 'Verbunden', notConnected: 'Nicht verbunden', serverSettings: 'Servereinstellungen', askAdmin: 'Bitte deinen Administrator, Dienste zu verbinden.', setWatchlist: 'Watchlist', exportSet: 'Einstellungen exportieren / importieren', exportSetHint: 'Kopiere deine Einstellungen als Text oder füge sie in einem anderen Konto ein.', copy: 'Kopieren', impt: 'Importieren', pasteSet: 'Einstellungen-JSON einfügen', copied: 'Kopiert', resetAll: 'Alle meine Einstellungen zurücksetzen', resetAllHint: 'Zurück zu den Server-Standards.', clearCache: 'Caches leeren', clearCacheHint: 'Bibliotheks- und Anfragedaten neu laden.', clear: 'Leeren', killSwitch: 'Notschalter', killSwitchHint: 'Gib das in der Browser-Konsole ein, um Cinema auszuschalten.', about: 'Über', resetDefault: 'Auf Standard zurücksetzen', lockedBy: 'Vom Server-Administrator deaktiviert.', moreActions: 'Weitere Aktionen (Plugins)', fromDecade: 'Aus den', unwatched: 'Noch nicht gesehen', plSubStyle: 'Untertitel-Darstellung…', plChapters: 'Kapitel', plSkipCredits: 'Abspann überspringen', plSkipRecap: 'Rückblick überspringen', plSkipIntro: 'Intro überspringen', plNextIn: 'Nächste Folge in', plBack: 'Zurück', plInfo: 'Wiedergabe-Info', plBack10: '10 Sekunden zurück', plFwd10: '10 Sekunden vor', plSettings: 'Einstellungen', plFs: 'Vollbild', plQuality: 'Qualität', plAuto: 'Auto (Original)', plQualityHint: 'Niedrigere Qualität wird vom Server umgewandelt.', plAutoNext: 'Nächste Folge abspielen', plAutoNextHint: 'Automatisch mit der nächsten Folge weitermachen.', plAutoSkip: 'Intros automatisch überspringen', plAutoSkipHint: 'Benötigt Intro-Erkennung auf dem Server.', plRemember: 'Lautstärke merken', plSubSize: 'Größe', plSubPos: 'Position', plLow: 'Unten', plMid: 'Mitte', plHigh: 'Hoch', plSubBg: 'Hintergrund', plShadow: 'Schatten', plBox: 'Box', plNone: 'Keiner', plSubColor: 'Farbe', plWhite: 'Weiß', plYellow: 'Gelb', plGreen: 'Grün', plSubBold: 'Fetter Text', plSubFont: 'Schrift', plSubPreview: 'So sehen Untertitel aus', plKPlay: 'Abspielen / Pause', plKVol: 'Lautstärke', plKFs: 'Vollbild', plKMute: 'Stumm', plKBack: 'Menü schließen / verlassen', plTab_quality: 'Video', plTab_playback: 'Wiedergabe', plTab_subs: 'Untertitel', plTab_keys: 'Tasten', plMethod: 'Methode', plSource: 'Quelle', plPlaying: 'Wiedergabe', plBitrate: 'Bitrate', plBuffer: 'Puffer', plDropped: 'Verworfene Frames', setNativeHint: 'Aktivieren, falls der eingebaute Player Probleme macht.' }
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
  if (window.CinemaTV) { try { const full = await getItem(id); COVER.hide(); CinemaTV.play(id, opts.startTicks != null ? opts.startTicks : (ud(full).PlaybackPositionTicks || 0)); } catch (e) { COVER.hide(); toast((e.message || 'error')); } return; }
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
  try { cardBadges(it, im); } catch (e) { }
  const el = h('div', { class: 'nf-card ' + kind, onclick: () => go(hash), oncontextmenu: e => itemMenu(e, it) }, im, h('div', { class: 'title ell' }, title));
  if (HID.on && HID.ids.has(it.Id)) { el.classList.add('hx'); im.append(h('span', { class: 'hx-badge', title: t('hxIsHidden') }, ic('eyeOff', 'ic-s'))); }
  attachPeek(el, im, () => libDesc(it, poster));
  return el;
}

/* a horizontal scroller without scrollbar and with the same arrows as the film rows */
function hscroll(sc) {
  sc.classList.add('hs');
  const L_ = h('button', { class: 'nf-arrow l', 'aria-label': 'Previous', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .8 }) }, ic('left'));
  const R_ = h('button', { class: 'nf-arrow r', 'aria-label': 'Next', onclick: () => sc.scrollBy({ left: sc.clientWidth * .8 }) }, ic('right'));
  const w = h('div', { class: 'hs-wrap' }, L_, sc, R_);
  const upd = () => { L_.classList.toggle('off', sc.scrollLeft < 8); R_.classList.toggle('off', sc.scrollLeft + sc.clientWidth > sc.scrollWidth - 8); };
  sc.addEventListener('scroll', upd, { passive: true }); setTimeout(upd, 60); setTimeout(upd, 500);
  return w;
}
function row(title, list, kind, opts) {
  opts = opts || {};
  const cardOf = (i, idx) => opts.make ? opts.make(i) : kind === 'top10' ? top10Card(i, idx) : kind === 'spotlight' ? spotCard(i) : card(i, kind === 'top10' ? 'poster' : kind);
  const sc = h('div', { class: 'nf-scroller' }, list.map(cardOf));
  if (typeof TVM !== 'undefined' && TVM && opts.href) sc.append(h('a', { class: 'nf-card more ' + (kind || 'thumb'), href: opts.href }, h('div', { class: 'im' }, h('div', { class: 'mr' }, ic('right'), h('span', {}, t('showAll'))))));
  const L_ = h('button', { class: 'nf-arrow l', 'aria-label': 'Previous', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .85 }) }, ic('left'));
  const R_ = h('button', { class: 'nf-arrow r', 'aria-label': 'Next', onclick: () => sc.scrollBy({ left: sc.clientWidth * .85 }) }, ic('right'));
  return h('section', { class: 'nf-row' + (kind === 'top10' ? ' top10' : kind === 'spotlight' ? ' spot' : '') }, h('h2', {}, opts.href ? h('a', { href: opts.href }, title + ' ›') : title, opts.tag ? h('span', { class: 'rowtag', title: t('rcDiscoverHint') }, opts.tag) : null), L_, sc, R_);
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
  Promise.resolve().then(fn).then(list => { let arr = (list && list.Items) || list || []; if (opts && opts.unseen) arr = arr.filter(i => !ud(i).Played); if (arr.length >= ((opts && opts.min) || 1)) ph.replaceWith(row(title, arr, kind, opts)); else ph.remove(); }).catch(e => { console.warn('[cinema] row failed', title, e); ph.remove(); });
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
  else if ((view === 'discover' && !feat('discover')) || (view === 'watchlist' && !feat('watchlist')) || (view === 'requests' && !feat('requests')) || (view === 'calendar' && !feat('calendar')) || (view === 'quiz' && !cfg('quiz')) || (view === 'wrapped' && !cfg('wrapped')) || (view === 'tonight' && !cfg('tonight')) || (view === 'storage' && !feat('storage'))) page.append(h('div', { class: 'nf-page-pad' }, h('div', { class: 'nf-empty' }, t('featOff'))));
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
  else if (view === 'quiz') await quizView(page);
  else if (view === 'wrapped') await wrappedView(page);
  else if (view === 'tonight') await tonightView(page);
  else if (view === 'storage') await storageView(page);
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
  api('Genres', { userId: uid(), IncludeItemTypes: type, SortBy: 'Random', Limit: n }).then(g => (g.Items || []).forEach(gn => lazyRow(rows, gn.Name, () => items({ IncludeItemTypes: type, Genres: gn.Name, SortBy: 'Random', Limit: 20 }), 'thumb', { unseen: cfg('homeSeen') === 'hide', min: 4, href: '#/c/browse/genre/' + encodeURIComponent(gn.Name) }))).catch(() => { });
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
        h('div', {}, h('div', { class: 'tt' }, h('span', {}, ep.Name), ud(ep).Played ? h('span', { class: 'seen' }, '') : null), h('div', { class: 'ds clamp3' }, ep.Overview || '')),
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
  if (cfg('mediaInfo')) { const admin = (await me()).Policy.IsAdministrator; const mi = mediaInfoSection(it, admin); if (mi) body.append(mi); }
  if (cfg('ratings')) ratingsRow(it, d); try { lbDetailChip(it, d); } catch (e) { } try { gCastBtn(it, body); } catch (e) { } if (cfg('seerrSimilar')) seerrSimilarRow(it, body);
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
      if (a.value.length < 4) { st.textContent = t('hxMin'); return; } save.disabled = true;
      try { await hxCall('POST', 'code', { code: a.value }); toast(''); d.close(); } catch (e) { st.textContent = e.message; save.disabled = false; }
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
    try { const r = await hxCall('POST', 'verify', { code: a.value }); if (r.ok) { st.textContent = ''; hxSet(true); } else { st.textContent = t('hxBad'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); a.value = ''; go_.disabled = false; a.focus(); } } catch (e) { st.textContent = e.message; go_.disabled = false; }
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
    await jf('POST', 'Items/' + it.Id, null, full); toast(t(has ? 'hxShown' : 'hxHidden')); await hxReload();
  } catch (e) { toast((e.message || e)); }
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
  if (kind === 'overlay') return p0 === 'home' ? 'home' : ({ movies: 'movies', shows: 'shows', list: 'favorites', music: 'music', discover: 'discover', calendar: 'calendar', watchlist: 'watchlist', person: '', requests: 'requests', settings: '', quiz: 'quiz', wrapped: 'wrapped', tonight: 'tonight', storage: '' }[v] || '');
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
const NAVFEAT = { discover: 'discover', watchlist: 'watchlist', requests: 'requests', calendar: 'calendar', music: 'music', quiz: 'quiz', wrapped: 'wrapped', tonight: 'tonight' };
const navOn = k => { if (k === 'tonight') return false; const hid = (((C.status && C.status.defaults && C.status.defaults.hiddenNav) || '') + '').split(',').map(x => x.trim()); if (hid.includes(k) || (CFGU.navHide || []).includes(k)) return false; if (k === 'quiz' || k === 'wrapped' || k === 'tonight') return !!cfg(k); return !NAVFEAT[k] || feat(NAVFEAT[k]); };
function buildTop() {
  const uiRoot = getUI();
  const L_ = (k, label, href, cls) => h('a', { 'data-k': k, href: typeof href === 'function' ? '#' : href, class: cls || '', onclick: typeof href === 'function' ? (e => { e.preventDefault(); go(href()); }) : null }, label);
  const links = h('div', { class: 'nf-links' },
    L_('home', t('home'), '#/home'), L_('movies', t('movies'), '#/c/movies'), L_('shows', t('shows'), '#/c/shows'),
    navOn('watchlist') ? L_('watchlist', 'Watchlist', '#/c/watchlist') : null, navOn('discover') ? L_('discover', t('discover'), '#/c/discover') : null,
    navOn('requests') ? L_('requests', t('requests'), '#/c/requests', 'opt') : null, navOn('calendar') ? L_('calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'opt') : null, navOn('music') ? L_('music', t('music'), '#/c/music') : null, navOn('quiz') ? L_('quiz', t('gTitle'), '#/c/quiz', 'opt') : null);
  const more = h('div', { class: 'nf-menu-wrap nf-more' });
  const mkPop = items_ => h('div', { class: 'nf-pop hide' }, items_.map(([k, label, href, cls, ico]) => h('a', { 'data-cx': 1, 'data-k': k, class: cls || '', href: typeof href === 'function' ? '#' : href, onclick: e => { if (typeof href === 'function') { e.preventDefault(); go(href()); } } }, ico ? ic(ico, 'ic-s') : null, label)));
  const moreItems = [navOn('quiz') ? ['quiz', t('gTitle'), '#/c/quiz', 'm-opt', 'star'] : null, navOn('wrapped') ? ['wrapped', t('wrTitle'), '#/c/wrapped', '', 'film'] : null, navOn('tonight') ? ['tonight', t('tnTitle'), '#/c/tonight', '', 'play'] : null, ['requests', t('requests'), '#/c/requests', 'm-opt', 'plus'], ['calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'm-opt', 'cal'], ['favorites', t('mylist'), '#/c/list', '', 'list'], ['bookmarks', t('bookmarks'), () => tabHref('bookmarks'), '', 'star'], ['live', 'Live TV', '#/livetv', '', 'tv'], ['games', 'Games', '#/games', '', 'film']];
  moreItems.splice(0, moreItems.length, ...moreItems.filter(x => x && navOn(x[0])));
  const popMore = mkPop(moreItems); const popMore2 = mkPop(moreItems.map(x => x.slice())); popMore2.classList.add('up'); uiRoot.append(popMore2);
  /* entries that already sit in the top bar are not repeated in the menu */
  const syncMore = () => [popMore, popMore2].forEach(pm => pm.querySelectorAll('a[data-k]').forEach(a => { const top = links.querySelector('a[data-k="' + a.dataset.k + '"]'); a.hidden = !!(top && top.offsetParent !== null); }));
  window.addEventListener('resize', syncMore); setTimeout(syncMore, 400);
  more.append(h('button', { class: 'nf-pillbtn', onclick: e => { e.stopPropagation(); syncMore(); closePops(popMore); popMore.classList.toggle('hide'); } }, t('more'), ic('down', 'ic-s')), popMore);
  const sInput = h('input', { type: 'text', placeholder: t('search') + '…', autocomplete: 'off' });
  const sWrap = h('div', { class: 'nf-search' }, h('button', { 'aria-label': t('search'), onclick: () => { sWrap.classList.toggle('open'); if (sWrap.classList.contains('open')) sInput.focus(); } }, ic('search')), sInput);
  let sT; sInput.addEventListener('input', () => { clearTimeout(sT); sT = setTimeout(() => { const v = sInput.value.trim(); if (v) go('#/c/search/' + encodeURIComponent(v)); else if (/search/.test(location.hash)) go('#/home'); }, 350); });
  sInput.addEventListener('blur', () => { if (!sInput.value) sWrap.classList.remove('open'); });
  const av = h('div', { class: 'nf-avatar' }, 'U');
  const umItem = (iconNode, label, href, fn, cls) => h('a', { 'data-cx': 1, class: 'um-item ' + (cls || ''), href: href || '#', onclick: e => { if (!href || href === '#') e.preventDefault(); closePops(); fn && fn(e); } }, h('span', { class: 'um-ic' }, iconNode), h('span', { class: 'um-l' }, label), ic('right', 'um-ch'));
  const umAv = h('div', { class: 'um-av' }, 'U'), umName = h('div', { class: 'um-name' }, '');
  const mobileItems = [['discover', t('discover'), '#/c/discover', 'star'], ['watchlist', 'Watchlist', '#/c/watchlist', 'plus'], ['favorites', t('mylist'), '#/c/list', 'list'], ['requests', t('requests'), '#/c/requests', 'queue'], ['calendar', t('calendar'), (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'cal'], ['quiz', t('gTitle'), '#/c/quiz', 'star'], ['wrapped', t('wrTitle'), '#/c/wrapped', 'film'], ['tonight', t('tnTitle'), '#/c/tonight', 'play'], ['live', 'Live TV', '#/livetv', 'tv']].filter(x => navOn(x[0])).map(([k, label, href, i]) => umItem(ic(i, 'ic-s'), label, href, null, 'm-only'));
  const skinSw = h('button', { class: 'set-switch' + (skinOn() ? ' on' : ''), 'aria-label': t('pskin'), onclick: e => { e.stopPropagation(); setSkin(!skinOn()); skinSw.classList.toggle('on', skinOn()); } }, h('i'));
  const plugSlot = h('div', { class: 'um-sec plug-slot', 'data-cx': 1 });
  const popUser = h('div', { class: 'nf-pop nf-user hide' },
    h('div', { class: 'um-head', 'data-cx': 1 }, umAv, h('div', {}, umName, h('span', {}, 'Cinema'))),
    h('div', { class: 'um-sec m-only', 'data-cx': 1 }, mobileItems),
    h('div', { class: 'um-sec', 'data-cx': 1 }, umItem(ic('edit', 'ic-s'), t('settings') + ' · Cinema', '#/c/settings'), optOn('archive') ? umItem(ic('lib', 'ic-s'), t('archive'), '#/c/archive') : null, (C.status && C.status.admin && feat('storage')) ? umItem(ic('lib', 'ic-s'), t('stTitle'), '#/c/storage') : null, umItem(ic('tv', 'ic-s'), t('quickConnect'), '#', () => quickConnectDialog()), umItem(ic('user', 'ic-s'), t('prefs'), '#/mypreferencesmenu'), umItem(ic('info', 'ic-s'), t('dash'), '#/dashboard')),
    plugSlot,
    h('div', { class: 'um-sec', 'data-cx': 1 }, umItem(ic('logout', 'ic-s'), t('logout'), '#', () => { try { ApiClient.logout().then(() => location.reload()); } catch (e) { location.href = '#/login'; } }, 'um-danger')));
  async function fillPlugins() {
    if (!cfg('pluginMenus')) return;
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
  } catch (e) { toast((e.message || 'error')); }
  return on;
}
async function toggleFav(it) { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData = Object.assign(ud(it), { IsFavorite: on }); return on; }
async function togglePlayed(it) { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData = Object.assign(ud(it), { Played: on }); toast(on ? t('markedWatched') : t('markedUnwatched')); return on; }

/* settings: server defaults (plugin) overridden per user (Jellyfin DisplayPreferences, synced across devices) */
const CFG_DEF = { nativePlayer: false, hero: true, peek: true, seerrWatchlistSync: false, sections: null, accent: '#e50914', infinite: true, cardSize: 'm', heroItems: 8, heroInterval: 11, peekDelay: 320, quiz: true, wrapped: true, tonight: true, homeSeen: 'badge', recommendations: true, quizFamous: 'both', quizScenes: true, quizNew: 10, quizGoal: 100, quizBlitz: 60, quizAuto: true, quizMin: 1, quizLb: true, quizModes: null, wrappedBanner: 'auto', wrappedShows: true, wrappedAuto: true };
let CFGU = {};
const feat = k => !(C.status && C.status.features) || C.status.features[k] !== false;
const SRV = { accent: 'accent', seerrWatchlistSync: 'seerrWatchlistSync', pl_autoNext: 'pl_autoNext', pl_autoSkip: 'pl_autoSkip', pl_quality: 'pl_quality', cardSize: 'cardSize', heroItems: 'heroItems', heroInterval: 'heroInterval', peekDelay: 'peekDelay', homeSeen: 'homeSeen', quizNew: 'quizNew', quizGoal: 'quizGoal', quizBlitz: 'quizBlitz', quizAuto: 'quizAuto', quizMin: 'quizMin', wrappedBanner: 'wrappedBanner', wrappedShows: 'wrappedShows', wrappedAuto: 'wrappedAuto' };
/* features the server can switch off and every user can switch off for themselves */
const USER_FEATS = ['quiz', 'wrapped', 'tonight', 'recommendations', 'ratings', 'mediaInfo', 'seerrSimilar', 'itemMenu', 'pluginMenus', 'musicLyrics', 'musicRequests', 'musicDiscovery', 'calendarHistory', 'discover', 'watchlist', 'requests', 'calendar', 'music'];
function cfg(k) {
  const d = (C.status && C.status.defaults) || {}; const allow = d.allowUserOverrides !== false; const u = allow ? CFGU[k] : undefined;
  if (k === 'hero') return feat('hero') && u !== false; if (k === 'peek') return feat('peek') && u !== false; if (k === 'infinite') return feat('infiniteScroll') && u !== false;
  if (USER_FEATS.includes(k)) return feat(k) && u !== false;
  if (u !== undefined) return u;
  if (k === 'sections') { try { const j = d.sections && JSON.parse(d.sections); const OLD = 'continue,nextup,newMovies,newShows,top,watchlist,favs,random,genres'; const OLD2 = 'continue,nextup,tonight,spotlight,freshUnseen,top10Movies,newMovies,forYou,recentEps,newShows,genreTiles,top10Shows,actorPicks,followPicks,watchlist,collections,top,unwatched,dirPicks,favs,random,genres'; if (j && j.length && !(j.every(x => x.on !== false) && [OLD, OLD2].includes(j.map(x => x.id).join(',')))) return j; } catch (e) { } return null; } // the old built-in list, saved by an earlier config page, counts as "not customised"
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
/* a wheel tick that arrives over the hover preview: same easing as the browser's own wheel scrolling, one running animation, no restart per tick */
const GLIDE = { raf: 0, host: null, target: 0 };
function glideBy(host, dy) {
  if (GLIDE.host !== host || !GLIDE.raf) GLIDE.target = host.scrollTop; GLIDE.host = host;
  const max = host.scrollHeight - host.clientHeight; GLIDE.target = Math.max(0, Math.min(max, GLIDE.target + dy));
  if (GLIDE.raf) return; const prev = host.style.scrollBehavior; host.style.scrollBehavior = 'auto';
  const step = () => { const d = GLIDE.target - host.scrollTop; if (Math.abs(d) < .6) { host.scrollTop = GLIDE.target; GLIDE.raf = 0; host.style.scrollBehavior = prev; return; } host.scrollTop += d * .24; GLIDE.raf = requestAnimationFrame(step); };
  GLIDE.raf = requestAnimationFrame(step);
}
function scrollHost() { return (C.mode === 'sp' && C.sp && C.sp.scroll) || (C.nf && C.nf.el) || document.scrollingElement; }
function peekEl() { if (!PEEK.el) { PEEK.el = h('div', { class: 'nf-peek', onpointerenter: () => clearTimeout(PEEK.hideT), onpointerleave: () => hidePeek(120) }); PEEK.el.addEventListener('wheel', e => { const sh = scrollHost(); if (sh) glideBy(sh, e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * sh.clientHeight : e.deltaY); PEEK.el.style.pointerEvents = 'none'; hidePeek(); }, { passive: true }); getUI().append(PEEK.el); } return PEEK.el; }
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
const peekPause = e => { if (GLIDE.raf && e && !(PEEK.el && PEEK.el.contains(e.target))) { cancelAnimationFrame(GLIDE.raf); GLIDE.raf = 0; if (GLIDE.host) GLIDE.host.style.scrollBehavior = ''; } PEEK.noUntil = Date.now() + 550; clearTimeout(PEEK.t); hidePeek(); };
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
  if (!cfg('itemMenu')) return;
  e.preventDefault && e.preventDefault(); e.stopPropagation && e.stopPropagation();
  const r = (e.currentTarget || e.target).getBoundingClientRect(); const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const canDel = admin || (user.Policy && user.Policy.EnableContentDeletion);
  const ent = [];
  ent.push({ icon: 'play', label: t('play'), fn: () => playVideo(it) });
  ent.push({ icon: isWatch(it) ? 'check' : 'plus', label: isWatch(it) ? t('wlRemove') : t('wlAdd'), fn: () => toggleWatch(it) });
  ent.push({ icon: ud(it).IsFavorite ? 'heartOn' : 'heart', label: ud(it).IsFavorite ? t('favRemove') : t('favAdd'), fn: async () => { await toggleFav(it); toast(''); } });
  if (it.Type !== 'Series' || true) ent.push({ icon: 'check', label: ud(it).Played ? t('markUnwatched') : t('markWatched'), fn: () => togglePlayed(it) });
  ent.push('-');
  ent.push({ icon: 'info', label: t('openDetails'), fn: () => go(itemHash(it) || '#/home') });
  if ((ud(it).PlaybackPositionTicks || 0) > 0) ent.push({ icon: 'close', label: t('rmResume'), fn: async () => { try { await jf('POST', 'UserItems/' + it.Id + '/UserData', { userId: uid() }, { PlaybackPositionTicks: 0 }); it.UserData = Object.assign(ud(it), { PlaybackPositionTicks: 0 }); toast(t('rmResumeDone')); C.libCache = null; route(); } catch (e) { toast((e.message || e)); } } });
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

async function hideNextUp(seriesId) { const l = (CFGU.nuHide || []).slice(); if (!l.includes(seriesId)) l.push(seriesId); await saveCfg({ nuHide: l }); toast(t('nuDone')); route(); }

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
const errBox = (d, e) => d.body.replaceChildren(h('div', { class: 'nf-empty' }, (e.message || e)));
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
      const upl = h('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: async e => { const f = e.target.files[0]; if (!f) return; d.busy(); try { const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(f); }); await jf('POST', 'Items/' + id + '/Images/' + type, null, b64, f.type || 'image/jpeg'); d.changed = true; toast(''); } catch (er) { toast(er.message); } main(); } });
      return h('section', { class: 'cxd-sec' }, h('div', { class: 'cxd-sh' }, h('h3', {}, t(key)), h('div', { class: 'cxd-sa' },
        h('button', { class: 'cxd-chip', onclick: () => remote(type, key) }, ic('search', 'ic-s'), t('searchOnline')), h('button', { class: 'cxd-chip', onclick: () => upl.click() }, ic('plus', 'ic-s'), t('upload')), upl)),
        list.length ? h('div', { class: 'cxd-grid' }, list.map(i => h('div', { class: 'cxd-img' }, h('div', Object.assign({ class: 'ci ' + type.toLowerCase() }, bg(imgSrc(type, i.ImageIndex, 420, i.ImageTag))), h('button', { class: 'cxd-del', 'aria-label': t('delete'), onclick: async () => { d.busy(); try { await jf('DELETE', 'Items/' + id + '/Images/' + type + (i.ImageIndex == null ? '' : '/' + i.ImageIndex)); d.changed = true; } catch (er) { toast(er.message); } main(); } }, ic('close', 'ic-s'))), h('small', {}, (i.Width && i.Height ? i.Width + ' × ' + i.Height : '') + (i.Size ? ' · ' + Math.round(i.Size / 1024) + ' KB' : ''))))) : h('div', { class: 'cxd-none' }, t('noImages')));
    };
    d.body.replaceChildren(...IMG_TYPES.map(sec).filter(Boolean));
  }
  async function remote(type, key, allLang) {
    d.setTitle(t(key) + ' · ' + t('searchOnline')); d.busy();
    d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: main }, ic('left'), t('back')), h('label', { class: 'cxd-chk' }, h('input', { type: 'checkbox', checked: !!allLang, onchange: e => remote(type, key, e.target.checked) }), t('allLangs')));
    let r; try { r = await jf('GET', 'Items/' + id + '/RemoteImages', { type, startIndex: 0, limit: 60, includeAllLanguages: !!allLang }); } catch (e) { return errBox(d, e); }
    const imgs = r.Images || []; if (!imgs.length) { d.body.replaceChildren(h('div', { class: 'nf-empty' }, t('noImages'))); return; }
    d.body.replaceChildren(h('div', { class: 'cxd-grid rem' }, imgs.map(i => h('button', { class: 'cxd-img pick', onclick: async () => { d.busy(); try { await jf('POST', 'Items/' + id + '/RemoteImages/Download', { type, imageUrl: i.Url, providerName: i.ProviderName }); d.changed = true; toast(''); } catch (er) { toast(er.message); } main(); } },
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
      await jf('POST', 'Items/' + id, null, it); d.changed = true; toast(t('saved')); d.close();
    } catch (e) { toast(e.message); save.disabled = false; }
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
      res.replaceChildren(...r.map(x => h('button', { class: 'cxd-res', onclick: async () => { d.busy(); d.foot.replaceChildren(); try { await jf('POST', 'Items/RemoteSearch/Apply/' + it.Id, { ReplaceAllImages: true }, x); d.changed = true; toast(t('idApplied')); d.close(); } catch (e) { errBox(d, e); } } },
        h('div', Object.assign({ class: 'rp' }, bg(x.ImageUrl || ''))), h('div', { class: 'rt' }, h('b', {}, x.Name + (x.ProductionYear ? ' (' + x.ProductionYear + ')' : '')), h('small', {}, x.SearchProviderName || ''), x.Overview ? h('p', {}, x.Overview) : null))));
    } catch (e) { res.replaceChildren(h('div', { class: 'nf-empty' }, e.message)); }
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
    try { await jf('POST', 'Items/' + it.Id + '/Refresh', q); toast(t('rfStarted')); d.close(); setTimeout(refreshView, 4000); } catch (e) { toast(e.message); }
  } }, ic('refresh'), t('rfStart'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ----- delete ----- */
function deleteItem(it) {
  const d = cxDialog(t('delete'));
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'font-size:15px;color:#e4e4e8' }, t('delConfirm').replace('{n}', it.Name)));
  const go_ = h('button', { class: 'btn danger', onclick: async () => { go_.disabled = true; try { await jf('DELETE', 'Items/' + it.Id); toast(t('delDone')); d.close(); location.hash = '#/home'; } catch (e) { toast(e.message); go_.disabled = false; } } }, ic('close'), t('delete'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ----- Quick Connect: sign in another device (TV app, ...) with the code it shows ----- */
function quickConnectDialog() {
  const d = cxDialog(t('qcTitle')); const inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 8, placeholder: '123456', style: 'font-size:26px;letter-spacing:.25em;text-align:center' }); const st = h('p', { class: 'cxd-hint', style: 'text-align:center;min-height:20px' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    const code = inp.value.replace(/\D/g, ''); if (code.length < 4) return; go_.disabled = true; st.textContent = '…';
    try { const ok = await jf('POST', 'QuickConnect/Authorize', { code, userId: uid() }); if (ok === true || ok === 'true' || (ok && ok.Authenticated)) { st.textContent = ' ' + t('qcOk'); toast(t('qcOk')); setTimeout(d.close, 900); } else { st.textContent = t('qcBad'); go_.disabled = false; } }
    catch (er) { st.textContent = t('qcBad'); go_.disabled = false; }
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
    if (added) { toast(t('wlSynced') + (added > 1 ? ' (' + added + ')' : '')); C.libCache = null; if (/watchlist/.test(location.hash)) route(); }
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
      h('p', { class: 'ov clamp3', style: 'cursor:pointer', onclick: e => e.currentTarget.classList.toggle('clamp3') }, (p.Overview || '').replace(/<[^>]+>/g, '')), (() => { try { return gPersonFollow(p); } catch (e) { return null; } })())));
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

async function seerrWatch(x) { try { await cpostSeerr('/watchlist', { tmdbId: +x.id, mediaType: x.mediaType === 'tv' ? 'tv' : 'movie', title: x.title || x.name }); toast(t('wlAdded')); return true; } catch (e) { toast(((e.responseJSON && e.responseJSON.message) || 'Seerr')); return false; } }

/* ---------- configurable home sections, settings page, requests page ---------- */
const SEC = {
  continue: { label: () => t('continue'), run: () => api('Users/' + uid() + '/Items/Resume', { Limit: 20, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  nextup: { label: () => t('nextup'), run: () => api('Shows/NextUp', { userId: uid(), Limit: 50, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }).then(r => { const hide = new Set(CFGU.nuHide || []); r.Items = r.Items.filter(i => !hide.has(i.SeriesId) && !(i.ParentIndexNumber === 1 && i.IndexNumber === 1)).slice(0, 20); return r; }), kind: 'thumb' },
  newMovies: { label: () => t('newMovies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/movies', unseen: true },
  newShows: { label: () => t('newShows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/shows', unseen: true },
  top: { label: () => t('top'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), kind: 'thumb', unseen: true },
  watchlist: { label: () => t('watchlist'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'Likes', Limit: 30 }), kind: 'poster', href: '#/c/watchlist' },
  favs: { label: () => t('favs'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 30 }), kind: 'poster', href: '#/c/list' },
  random: { label: () => t('random'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), kind: 'thumb', unseen: true },
  because: { label: () => t('because'), kind: 'poster', run: async () => { const r = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 1 }); const last = r.Items[0]; if (!last) return []; SEC.because.title = t('because') + ' ' + last.Name; return api('Items/' + last.Id + '/Similar', { userId: uid(), limit: 20, Fields: F_BASE }); } },
  top10Movies: { label: () => t('top10Movies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating,SortName', SortOrder: 'Descending', Limit: 10, MinCommunityRating: 6.5, Fields: F_BASE }), kind: 'top10' },
  top10Shows: { label: () => t('top10Shows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'CommunityRating,SortName', SortOrder: 'Descending', Limit: 10, Fields: F_BASE }), kind: 'top10' },
  spotlight: { label: () => t('spotlight'), run: () => items({ IncludeItemTypes: 'Movie,Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 12, HasOverview: true, Fields: F_BASE + ',Overview' }).then(r => { r.Items = r.Items.filter(i => i.BackdropImageTags && i.BackdropImageTags.length || i.ParentBackdropImageTags); return r; }), kind: 'spotlight' },
  genreTiles: { label: () => t('genreTiles'), tiles: true },
  forYou: { label: () => t('rcForYou') + ' (' + t('rcDiscoverTag') + ')', forYou: true },
  actorPicks: { label: () => t('rcMoreWith') + ' … (' + t('rcDiscoverTag') + ')', picks: 'actor' },
  dirPicks: { label: () => t('rcMoreFrom') + ' … (' + t('rcDiscoverTag') + ')', picks: 'director' },
  freshUnseen: { label: () => t('rcFresh'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsUnplayed', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster' },
  followPicks: { label: () => t('gFavNew') + ' (' + t('rcDiscoverTag') + ')', follow: true },
  tonight: { label: () => t('tnTitle'), tonight: true },
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
const DEFAULT_SECTIONS = ['continue', 'nextup', 'becauseSeen', 'spotlight', 'freshUnseen', 'top10Movies', 'becauseLiked', 'newMovies', 'forYou', 'rewatch', 'recentEps', 'newShows', 'genreTiles', 'top10Shows', 'actorPicks', 'followPicks', 'watchlist', 'collections', 'top', 'unwatched', 'dirPicks', 'favs', 'random', 'genres'].map(id => ({ id, on: true }));
/* rows added in a later version are put into a customised list once, unless the person already saw and removed them */
const sectionsCfg = () => {
  const c = cfg('sections'); if (!(c && c.length)) return DEFAULT_SECTIONS;
  const known = new Set(CFGU.secKnown || []); const miss = (typeof NEW_SECS !== 'undefined' ? NEW_SECS : []).filter(id => !known.has(id) && !c.some(s => s.id === id)); if (!miss.length) return c;
  const out = c.slice(); let at = out.findIndex(s => s.id === 'nextup'); at = at < 0 ? Math.min(2, out.length) : at + 1; out.splice(at, 0, ...miss.map(id => ({ id, on: true }))); return out;
};

async function homeView2(page) {
  const heroHost = h('div', { class: 'nf-hero-host', style: 'min-height:90px' }); page.append(heroHost);
  if (cfg('hero') !== false) heroFor('Movie,Series').then(hero => { if (hero.length && heroHost.isConnected) heroHost.replaceChildren(heroEl(hero)); heroHost.style.minHeight = ''; }).catch(() => { });
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  try { wrappedBanner(rows); } catch (e) { }
  const list = sectionsCfg().filter(s => s.on !== false && SEC[s.id]);
  const first = list.slice(0, 7), rest = list.slice(7);
  const render = s => {
    const d = SEC[s.id];
    if (d.build) return d.build(rows, s);
    if (d.multi) return genreRows(rows, 'Movie', s.n || 4);
    if (d.tiles) return genreTilesRow(rows);
    if (d.seerr) return seerrRow(rows, s.title || d.label(s), d.seerr);
    if (d.seerrRec) return seerrRecRow(rows);
    if (d.forYou) return forYouRow(rows);
    if (d.follow) return followRow(rows);
    if (d.picks) return peopleRow(rows, d.picks);
    if (d.tonight) return; /* switched off for now */
    const title = s.title || (s.id === 'because' ? null : d.label(s));
    if (s.id === 'because') { const ph = h('div', { class: 'nf-rowph' }); rows.append(ph); Promise.resolve(d.run(s)).then(l => { const arr = (l && l.Items) || l || []; if (arr.length) ph.replaceWith(row(d.title || t('because'), arr, d.kind)); else ph.remove(); }).catch(() => ph.remove()); return; }
    lazyRow(rows, title, () => d.run(s), d.kind || 'poster', { unseen: !!d.unseen && cfg('homeSeen') === 'hide', min: d.min, href: d.href || (d.custom ? '#/c/browse/' + s.id + '/' + encodeURIComponent(s.param) : undefined), min: d.min || (d.custom ? 4 : 1) });
  };
  first.forEach(render);
  if (rest.length) rest.forEach((s_, i) => setTimeout(() => { if (rows.isConnected) render(s_); }, 350 + i * 220));
  if (cfg('infinite') !== false && !TVM) setTimeout(() => { if (rows.isConnected) endlessRows(rows, page); }, 350 + rest.length * 220); // a TV has little memory: no endless rows there
}
function seerrRow(container, title, path) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  waitSeerr().then(async ok => { if (!ok) return ph.remove(); const [lm, rm, r] = await Promise.all([libMap(), reqMap(), seerrGet(path, { page: 1 })]); const arr = (r.results || []).map(x => Object.assign(x, { mediaType: x.mediaType || (path.includes('/tv') ? 'tv' : 'movie') })); if (arr.length) ph.replaceWith(row(title, arr, 'poster', { make: x => dCard(x, lm, rm), href: '#/c/discover', tag: t('rcDiscoverTag') })); else ph.remove(); }).catch(() => ph.remove());
}
function seerrRecRow(container) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  (async () => {
    if (!(await waitSeerr())) return ph.remove();
    const r = await items({ IncludeItemTypes: 'Movie', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 5, Fields: 'ProviderIds' });
    const pick = r.Items.find(i => (i.ProviderIds || {}).Tmdb); if (!pick) return ph.remove();
    const [lm, rm, rec] = await Promise.all([libMap(), reqMap(), seerrGet('/movie/' + pick.ProviderIds.Tmdb + '/recommendations', { page: 1 })]);
    const arr = (rec.results || []).map(x => Object.assign(x, { mediaType: 'movie' })).filter(x => dStatus(x, lm, rm).k !== 'own');
    if (arr.length) ph.replaceWith(row(t('seerrRec') + ' ' + pick.Name, arr, 'poster', { make: x => dCard(x, lm, rm), tag: t('rcDiscoverTag') })); else ph.remove();
  })().catch(() => ph.remove());
}

/* ---------- settings page (per user, synced) ---------- */
const SET_TABS = [['features', 'setFeatures', 'star'], ['general', 'setGeneral', 'gear'], ['home', 'setHome', 'home'], ['player', 'setPlayer', 'play'], ['look', 'setLook', 'star'], ['services', 'setServices', 'queue'], ['adv', 'setAdv', 'info']];
async function settingsView(page) {
  const user = await me(); const admin = user.Policy && user.Policy.IsAdministrator;
  const wrap = h('div', { class: 'nf-page-pad set-wrap' }, h('h1', {}, t('settings'))); page.append(wrap);
  const layout = h('div', { class: 'set-layout' }); const nav = h('div', { class: 'set-nav' }); const body = h('div', { class: 'set-body' }); layout.append(nav, body); wrap.append(layout);
  let cur = (location.hash.match(/tab=(\w+)/) || [])[1] || 'features';
  const locked = (featKey) => featKey && !feat(featKey);
  const card_ = (title, ...kids) => h('section', { class: 'set-card' }, title ? h('h3', {}, title) : null, kids);
  const resetBtn = key => userSet(key) ? h('button', { class: 'set-reset', title: t('resetDefault'), onclick: async e => { await saveCfg({ [key]: null }); draw(); } }, ic('refresh', 'ic-s')) : null;
  const row = (label, hint, ctrl, key, lockedBy) => h('div', { class: 'set-row' + (lockedBy ? ' locked' : '') }, h('div', {}, h('b', {}, label), hint ? h('span', {}, lockedBy ? t('lockedBy') : hint) : null), h('div', { class: 'set-ctl' }, key ? resetBtn(key) : null, ctrl));
  const sw = (key, def, onset) => { const b = h('button', { class: 'set-switch' + (cfg(key) ? ' on' : ''), role: 'switch', onclick: async () => { const v = !cfg(key); b.classList.toggle('on', v); await saveCfg({ [key]: v }); onset && onset(v); } }, h('i')); return b; };
  const toggle = (label, key, hint, featKey) => row(label, hint, sw(key), key, locked(featKey));
  const seg = (opts, key, cb) => h('div', { class: 'pl-seg set-seg' }, opts.map(([v, l]) => h('button', { class: String(cfg(key)) === String(v) ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ [key]: typeof v === 'string' && /^\d+$/.test(v) ? +v : v }); cb && cb(v); } }, l)));
  const X = { row, seg, sw, toggle, go: k => { cur = k; draw(); }, reload: () => { } };
  function sectionsEditor() {
    const list = h('div', { class: 'set-list' }); let secs = sectionsCfg().map(s => Object.assign({}, s)); const persist = () => saveCfg({ sections: secs, secKnown: NEW_SECS });
    const names = s => SEC[s.id] ? (SEC[s.id].custom ? SEC[s.id].label(s) + ' · ' + t('custom') : SEC[s.id].label(s)) : s.id;
    function draw_() {
      list.replaceChildren(...secs.map((s, i) => h('div', { class: 'set-sec' + (s.on === false ? ' off' : '') }, h('b', {}, names(s)), h('div', { class: 'set-sec-a' },
        h('button', { 'aria-label': 'Up', onclick: () => { if (i) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; persist(); draw_(); } } }, ic('down', 'rot180')),
        h('button', { 'aria-label': 'Down', onclick: () => { if (i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; persist(); draw_(); } } }, ic('down')),
        h('button', { class: 'set-switch' + (s.on === false ? '' : ' on'), onclick: () => { s.on = s.on === false; persist(); draw_(); } }, h('i')),
        SEC[s.id] && SEC[s.id].custom ? h('button', { 'aria-label': 'Remove', onclick: () => { secs.splice(i, 1); persist(); draw_(); } }, ic('close')) : null))));
    }
    draw_();
    const types = [['forYou', t('rcForYou') + ' (' + t('rcDiscoverTag') + ')'], ['actorPicks', t('rcMoreWith') + ' … (' + t('rcDiscoverTag') + ')'], ['dirPicks', t('rcMoreFrom') + ' … (' + t('rcDiscoverTag') + ')'], ['freshUnseen', t('rcFresh')], ['followPicks', t('gFavNew') + ' (' + t('rcDiscoverTag') + ')'], ['tonight', t('tnTitle')], ['genre', t('secGenre')], ['collection', t('collection')], ['library', t('secLibrary')], ['because', t('because')], ['seerrTrending', 'Seerr: ' + t('trending')], ['seerrMovies', 'Seerr: ' + t('popMovies')], ['seerrRec', t('seerrRec')], ['top10Movies', t('top10Movies')], ['top10Shows', t('top10Shows')], ['spotlight', t('spotlight')], ['genreTiles', t('genreTiles')], ['recentEps', t('recentEps')], ['collections', t('collections')], ['unwatched', t('unwatched')], ['decade', t('decade')]];
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
      h('p', { class: 'set-hint' }, h('a', { href: '#', onclick: e => { e.preventDefault(); X.go('features'); } }, t('setFeatures') + ' ›')))],
    features: () => featuresTab(X),
    home: () => [card_(t('homeSections'), h('p', { class: 'set-hint' }, t('homeSectionsHint')), sectionsEditor())],
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
      row(t('exportSet'), t('exportSetHint'), h('div', { style: 'display:flex;gap:8px' }, h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(CFGU)); toast(t('copied')); } }, t('copy')), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { const raw = prompt(t('pasteSet')); if (!raw) return; try { CFGU = {}; await saveCfg(JSON.parse(raw)); draw(); toast(''); } catch (e) { toast(' JSON'); } } }, t('impt')))),
      row(t('resetAll'), t('resetAllHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { if (!confirm(t('resetAllHint'))) return; CFGU = {}; await saveCfg({}); draw(); toast(''); } }, t('reset'))),
      row(t('clearCache'), t('clearCacheHint'), h('button', { class: 'btn grey', style: 'height:38px', onclick: () => { resetSeerrCache(); resetMyTracks && resetMyTracks(); C.libCache = null; toast(''); } }, t('clear'))),
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
const libMap = () => libMapP || (libMapP = items({ IncludeItemTypes: 'Movie,Series', Fields: 'ProviderIds,OriginalTitle', Limit: 10000, EnableImageTypes: 'Primary' }).then(r => { const m = {}; r.Items.forEach(i => { const id = (i.ProviderIds || {}).Tmdb; if (id) m[(i.Type === 'Series' ? 'tv' : 'movie') + ':' + id] = i; }); return m; }).catch(() => ({})));
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
  if (s.k === 'own' && s.item && ud(s.item).Played) im.append(h('span', { class: 'dmark seen' }, ic('check', 'ic-s'), h('span', { class: 'dtx' }, t('watched'))));
  const open = () => { if (s.k === 'own' && s.item) go(itemHash(s.item)); else openSeerrInfo(x); };
  const el = h('div', { class: 'nf-card poster seerr ' + (s.k === 'none' ? 'notown' : s.k), onclick: open }, im, h('div', { class: 'title ell' }, title), x._why ? h('div', { class: 'why ell' }, x._why) : null);
  attachPeek(el, im, () => ({ poster: true, img: src || TM(x.backdropPath, 'w780'), title, open, overview: x.overview,
    actions: [{ icon: s.k === 'own' ? 'play' : s.k === 'req' ? 'check' : 'plus', label: s.k === 'own' ? t('play') : t('request'), primary: true, fn: () => { hidePeek(); if (s.k === 'own' && s.item) playVideo(s.item); else if (s.k === 'none') openSeerrRequest(x); else openSeerrInfo(x); } }, s.k === 'own' ? null : { icon: 'star', label: t('wlAdd'), fn: async e => { const b = e.currentTarget; if (await seerrWatch(x) && b) { b.replaceChildren(ic('check')); b.classList.add('on'); b.title = t('wlAdded'); } } }, '-', { icon: 'info', label: t('info'), fn: () => { hidePeek(); openSeerrInfo(x); } }],
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
const aurralOn = () => !!(C.status && C.status.aurral) && cfg('musicDiscovery');
const aurralReq = () => aurralOn() && cfg('musicRequests');
const usePluginSeerr = () => !!plug().seerr;
const cget = (path, params) => Promise.resolve(HID.on ? null : hxReady()).then(() => api('Cinema' + path, params)).then(d => hxSeerr(d));
async function cpost(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema' + path), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' }); }
async function loadStatus() { try { C.status = await api('Cinema/status'); if (C.status.seerr) SEERR = 'Cinema/seerr'; } catch (e) { C.status = null; } }

/* ----- Seerr details + request modal (own UI, no Jellyfin Enhanced needed) ----- */
function closeModal(m) { m.remove(); }
async function seerrModal(x) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie';
  const bgEl = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === bgEl) closeModal(bgEl); } }); const box = h('div', { class: 'sr-modal' }, h('div', { class: 'spinner', style: 'margin:80px auto' })); bgEl.append(box); getUI().append(bgEl);
  let d; try { d = await seerrGet('/' + mt + '/' + x.id); } catch (e) { box.replaceChildren(h('div', { class: 'nf-empty' }, e.message)); return; }
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
  let advOk = false; let advBox = null; const advDialog = () => {
    const dg = cxDialog(t('request')); dg.body.replaceChildren(h('p', { class: 'set-p', style: 'margin-top:0' }, t('reqAdvHint')), advBox);
    dg.foot.append(h('button', { class: 'btn grey', onclick: dg.close }, t('cancel')), h('button', { class: 'btn white', onclick: () => { dg.close(); doRequest(); } }, ic('plus'), t('request')));
  };
  btn.onclick = () => { if (admin && advOk) advDialog(); else doRequest(); };
  const doRequest = async () => {
    btn.disabled = true; btn.textContent = '…';
    try { const body = { mediaType: mt, mediaId: x.id }; if (mt === 'tv') body.seasons = [...picked]; if (adv.serverId != null) body.serverId = adv.serverId; if (adv.profileId != null) body.profileId = adv.profileId; if (adv.rootFolder) body.rootFolder = adv.rootFolder; await cpostSeerr('/request', body); toast(t('requested')); resetSeerrCache(); closeModal(bgEl); }
    catch (e) { toast(((e.responseJSON && e.responseJSON.message) || e.statusText || 'error')); btn.disabled = false; btn.replaceChildren(ic('plus'), t('request')); }
  };
  if (st.k === 'own') { status.append(h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib'))); if (st.item) btn.replaceWith(h('button', { class: 'btn white', onclick: () => { closeModal(bgEl); playVideo(st.item); } }, ic('play'), t('play'))); else btn.remove(); }
  else if (st.k === 'req' && mt === 'movie') { status.append(h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested'))); btn.remove(); }
  const seasonBox = mt === 'tv' && seasons.length ? h('div', { class: 'sr-seasons' }, seasons.map(s => h('label', { class: 'nf-chip' + (have.has(s.seasonNumber) ? ' dis' : picked.has(s.seasonNumber) ? ' on' : ''), onclick: e => { e.preventDefault(); if (have.has(s.seasonNumber)) return; picked.has(s.seasonNumber) ? picked.delete(s.seasonNumber) : picked.add(s.seasonNumber); e.currentTarget.classList.toggle('on'); } }, (L === 'de' ? 'Staffel ' : 'Season ') + s.seasonNumber + (s.episodeCount ? ' · ' + s.episodeCount : '') + (have.has(s.seasonNumber) ? ' ' : '')))) : null;
  const ratings = h('div', { class: 'rt-row' });
  seerrGet('/' + mt + '/' + x.id + (mt === 'movie' ? '/ratingscombined' : '/ratings')).then(r => { const rt = r.rt || r; const im = r.imdb; if (rt && rt.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'Rotten Tomatoes ', h('b', {}, rt.criticsScore + '%'), rt.audienceScore != null ? h('small', {}, t('audience') + ' ' + rt.audienceScore + '%') : null)); if (im && im.criticsScore != null) ratings.append(h('span', { class: 'rt-chip' }, 'IMDb ', h('b', {}, im.criticsScore))); }).catch(() => { });
  if (d.voteAverage) ratings.append(h('span', { class: 'rt-chip' }, 'TMDB ', h('b', {}, d.voteAverage.toFixed(1)), d.voteCount ? h('small', {}, (d.voteCount / 1000).toFixed(1) + 'k') : null));
  /* request options for admins: server, quality profile, folder */
  advBox = h('div', { class: 'sr-opts' });
  if (admin && st.k === 'none') {
    const kind = mt === 'movie' ? 'radarr' : 'sonarr';
    seerrGet('/service/' + kind).then(async servers => {
      const list = (servers || []).filter(s => !s.is4k); if (!list.length) return;
      const def = list.find(s => s.isDefault) || list[0]; const sel = (label, key) => { const el = h('select', { onchange: e => { adv[key] = key === 'rootFolder' ? e.target.value : (e.target.value === '' ? null : +e.target.value); } }); return { el, row: h('div', { class: 'sr-opt' }, h('label', {}, label), el) }; };
      const sv = sel(t('reqServer'), 'serverId'), pf = sel(t('reqProfile'), 'profileId'), fo = sel(t('reqFolder'), 'rootFolder');
      list.forEach(s => sv.el.append(h('option', { value: s.id, selected: s.id === def.id }, s.name)));
      const fill = async id => { adv.serverId = id; try { const det = await seerrGet('/service/' + kind + '/' + id); pf.el.replaceChildren(...(det.profiles || []).map(p => h('option', { value: p.id, selected: p.id === def.activeProfileId }, p.name))); fo.el.replaceChildren(...(det.rootFolders || []).map(f => h('option', { value: f.path, selected: f.path === def.activeDirectory }, f.path))); adv.profileId = pf.el.value ? +pf.el.value : null; adv.rootFolder = fo.el.value || null; } catch (e) { } };
      sv.el.onchange = e => fill(+e.target.value); await fill(def.id); advBox.append(sv.row, pf.row, fo.row); advOk = true;
    }).catch(() => { });
  }
  const poster = TM(d.posterPath, 'w500');
  box.replaceChildren(
    h('div', Object.assign({ class: 'sr-hero' }, bg(TM(d.backdropPath, 'w1280'))), h('button', { class: 'sr-close', onclick: () => closeModal(bgEl), 'aria-label': 'Close' }, ic('close'))),
    h('div', { class: 'sr-body' },
      h('div', { class: 'sr-top' }, poster ? h('div', Object.assign({ class: 'sr-poster' }, bg(poster))) : null,
        h('div', { class: 'sr-head' }, h('h2', {}, title, year ? h('span', {}, ' (' + year + ')') : null), d.tagline ? h('p', { class: 'nf-tagline' }, d.tagline) : null,
          h('div', { class: 'nf-meta' }, (d.genres || []).slice(0, 4).map(g => h('span', {}, g.name)), runtime ? h('span', {}, runtime + ' ' + t('min')) : null),
          ratings, status,
          h('div', { class: 'nf-btns', style: 'margin-top:14px' }, btn, trailer ? h('a', { class: 'btn grey', href: 'https://www.youtube.com/watch?v=' + trailer.key, target: '_blank', rel: 'noopener' }, ic('film'), t('watchTrailer')) : null, h('button', { class: 'btn grey', onclick: () => closeModal(bgEl) }, t('close'))))),
      h('p', { class: 'sr-ov' }, d.overview || ''), seasonBox,
      facts.length ? h('dl', { class: 'nf-facts sr-facts' }, facts.map(f => [h('dt', {}, f[0]), h('dd', {}, f[1])])) : null,
      cast.length ? h('div', { class: 'sr-castw' }, h('h3', {}, t('moreCast')), hscroll(h('div', { class: 'sr-cast2' }, cast.map(c => h('button', { class: 'sr-p', onclick: () => personDialog(c) }, h('div', Object.assign({ class: 'pi' }, bg(c.profilePath ? TM(c.profilePath, 'w185') : ''))), h('b', {}, c.name), h('small', {}, c.character || ''))))) ) : null));
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
  if (!aImg(o)) { if (kind === 'artist') fillArtistImg(el, name); else fillAlbumImg(el, pk(o, ['id', 'releaseGroupMbid', 'mbid']), pk(o, ['artistName', 'artist']) || '', name); }
  if (!aurralReq()) { el.onclick = null; el.addEventListener('click', e => e.preventDefault()); return el; }
  const btn = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); btn.classList.add('busy'); try { await requestAurral(o, kind); toast(t('requested')); doneBtn(btn); return; } catch (er) { toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } btn.classList.remove('busy'); } }, ic('plus'));
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

/* a person from the cast of a film: photo, short bio and everything they are known for, with library and request state */
async function personDialog(c) {
  const a = { tid: c.id, k: 'p' + c.id, name: c.name }; const d = cxDialog(c.name, { wide: true }); d.busy();
  let info = {}; try { info = await seerrGet('/person/' + c.id); } catch (e) { }
  const [cr, ctx] = await Promise.all([gCredits(a), gCtx()]); if (!d.el.isConnected) return;
  const bio = String(info.biography || '').split('\n')[0]; let shown = 40; const list = h('div', { class: 'gm-frl' });
  const born = info.birthday ? new Date(info.birthday + 'T12:00:00').toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const head = h('div', { class: 'gm-ad' }, h('div', Object.assign({ class: 'pd-face' }, bg(info.profilePath || c.profilePath ? TM(info.profilePath || c.profilePath, 'w185') : ''))), h('div', {}, born ? h('p', { class: 'set-p' }, born + (info.placeOfBirth ? ' · ' + info.placeOfBirth : '')) : null, bio ? h('p', { class: 'pd-bio' }, bio.length > 360 ? bio.slice(0, 360).replace(/\s\S*$/, '') + '…' : bio) : null));
  const draw = () => {
    list.replaceChildren(); const items = (cr || []).slice().sort((x, y) => (y.fame || y.pop || 0) - (x.fame || x.pop || 0));
    if (!items.length) { list.append(h('div', { class: 'nf-empty', style: 'padding:24px 0' }, t('gNoCredits'))); return; }
    items.slice(0, shown).forEach(x => { const s2 = gCredState(x, ctx); list.append(gFilmRow({ title: x.title, year: x.year, poster: TM(x.poster, 'w154'), role: x.role, seen: s2.seen, own: s2.own, req: s2.req, tmdb: x.id, mt: x.mt, scene: false }, a, d.close)); });
    if (items.length > shown) list.append(h('button', { class: 'btn grey', style: 'margin:12px auto 0', onclick: () => { shown += 40; draw(); } }, t('showAll')));
  };
  d.body.replaceChildren(head, list); draw();
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
  try { const r = await api('Shows/' + PL.item.SeriesId + '/Episodes', { userId: uid(), seasonId: PL.item.SeasonId, Fields: F_BASE }); m.dataset.loaded = PL.item.SeasonId; m.replaceChildren(h('div', { class: 'pl-mh' }, (PL.item.SeasonName || t('episodes'))), ...r.Items.map(ep => h('button', { class: ep.Id === PL.item.Id ? 'on' : '', onclick: () => { closeMenus(); if (ep.Id !== PL.item.Id) playEpisode(ep); } }, h('span', {}, (ep.IndexNumber || '') + '. ' + ep.Name), ud(ep).Played ? h('small', {}, '') : null))); } catch (e) { }
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
Object.assign(TX.en, { dcFilters: 'Filters', dcYearFrom: 'Released from', dcYearTo: 'until', dcMinRate: 'Minimum rating', dcLang: 'Original language', dcRuntime: 'Length', dcAny: 'Any', dcResetF: 'Reset filters', dcShort: 'under 90 min', dcMid: 'under 2 hours', dcLong: 'over 2 hours', dcOrder: 'Sort by' });
Object.assign(TX.de, { dcFilters: 'Filter', dcYearFrom: 'Erschienen ab', dcYearTo: 'bis', dcMinRate: 'Mindestbewertung', dcLang: 'Originalsprache', dcRuntime: 'Länge', dcAny: 'Egal', dcResetF: 'Filter zurücksetzen', dcShort: 'unter 90 Min.', dcMid: 'unter 2 Stunden', dcLong: 'über 2 Stunden', dcOrder: 'Sortierung' });
const DC_LANGS = [['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'], ['ja', '日本語'], ['ko', '한국어'], ['zh', '中文'], ['hi', 'हिन्दी'], ['sv', 'Svenska'], ['da', 'Dansk']];
const SORTS = { popularity: ['popularity.desc', 'popularity.desc'], rating: ['vote_average.desc', 'vote_average.desc'], newest: ['primary_release_date.desc', 'first_air_date.desc'] };

async function discoverView2(page) {
  if (!(await waitSeerr())) { page.append(h('div', { class: 'nf-page-pad' }, h('h1', {}, t('discover')), h('div', { class: 'nf-empty' }, 'Seerr is not available.'))); return; }
  const wrap = h('div', {}); page.append(wrap); const skel = h('div', { style: 'height:62vh;display:grid;place-items:center' }, h('div', { class: 'spinner' })); wrap.append(skel);
  const heroP = seerrGet('/discover/trending', { page: 1 }).then(r => r.results.filter(x => x.backdropPath && x.overview && (x.mediaType === 'movie' || x.mediaType === 'tv')).slice(0, 8)).catch(() => []);
  const [lm, rm, heroRaw, genres] = await Promise.all([libMap(), reqMap(), heroP, dcGenres(), lbLoad(), archLoad()]); skel.remove();
  const make = x => dCard(x, lm, rm);
  const st = { type: 'all', genre: '', genreName: '', sort: 'popularity', hideOwned: false, hideSeen: false, q: '', yFrom: '', yTo: '', minRate: '', lang: '', run: '' };
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
  const hideSeen = h('label', { class: 'dc-tg' }, h('input', { type: 'checkbox', onchange: e => { st.hideSeen = e.target.checked; refresh(); } }), h('i'), h('span', {}, t('rcHideSeen')));
  const bar = h('div', { class: 'dc-bar' }, typeChips, h('div', { class: 'dc-sel' }, gSel), h('div', { class: 'dc-sel' }, sSel), h('label', { class: 'dc-tg' }, hide, h('i'), h('span', {}, t('hideOwned'))), hideSeen, h('div', { class: 'dc-q' }, ic('search', 'ic-s'), q));
  /* extended filters: release years, minimum rating, original language, length */
  const advN = () => ['yFrom', 'yTo', 'minRate', 'lang', 'run'].filter(k => st[k]).length;
  const fSel = (key, opts) => { const s_ = h('select', { onchange: e => { st[key] = e.target.value; upd(); refresh(); } }, h('option', { value: '' }, t('dcAny')), opts.map(([v, l]) => h('option', { value: v }, l))); return s_; };
  const years = []; for (let y = new Date().getFullYear() + 1; y >= 1930; y--) years.push([String(y), String(y)]);
  const fld = (label, el) => h('div', { class: 'dc-f' }, h('label', {}, label), el);
  const selY1 = fSel('yFrom', years), selY2 = fSel('yTo', years), selR = fSel('minRate', [['5', '5+'], ['6', '6+'], ['7', '7+'], ['7.5', '7.5+'], ['8', '8+']]), selL = fSel('lang', DC_LANGS), selT = fSel('run', [['90', t('dcShort')], ['120', t('dcMid')], ['121', t('dcLong')]]);
  const advPanel = h('div', { class: 'dc-adv', hidden: true }, fld(t('dcYearFrom'), selY1), fld(t('dcYearTo'), selY2), fld(t('dcMinRate'), selR), fld(t('dcLang'), selL), fld(t('dcRuntime'), selT),
    h('button', { class: 'btn grey', onclick: () => { ['yFrom', 'yTo', 'minRate', 'lang', 'run'].forEach(k => st[k] = ''); advPanel.querySelectorAll('select').forEach(s_ => { s_.value = ''; s_.dispatchEvent(new Event('change')); }); } }, t('dcResetF')));
  const advBtn = h('button', { class: 'dc-fbtn', onclick: () => { advPanel.hidden = !advPanel.hidden; advBtn.classList.toggle('open', !advPanel.hidden); } }, ic('filter', 'ic-s'), h('span', {}, t('dcFilters')), h('em', { hidden: true }, '0'));
  function upd() { const n = advN(); const em = advBtn.querySelector('em'); em.hidden = !n; em.textContent = n; advBtn.classList.toggle('act', n > 0); }
  bar.insertBefore(advBtn, bar.querySelector('.dc-q')); wrap.append(bar, advPanel);
  /* genre tiles (Netflix-style "browse by genre") */
  const tiles = h('div', { class: 'dc-tiles' });
  const GCOL = ['#e50914', '#7a3cff', '#0a8f6a', '#e08a00', '#1f6feb', '#c2185b', '#00838f', '#8e24aa', '#d84315', '#2e7d32'];
  mergeGenres().forEach((g, i) => tiles.append(h('button', { class: 'dc-tile', 'data-id': g.id, style: '--c:' + GCOL[i % GCOL.length], onclick: () => { st.type = genres.movie.some(x => x.id === g.id) ? 'movie' : 'tv'; $$('.dc-seg', typeChips).forEach((c, k) => c.classList.toggle('on', ['all', 'movie', 'tv'][k] === st.type)); fillGenres(); gSel.value = g.id; st.genre = String(g.id); st.genreName = g.name; $$('.dc-tile', tiles).forEach(x => x.classList.toggle('on', x.dataset.id === String(g.id))); refresh(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, h('b', {}, g.name))));
  const tilesWrap = h('div', { class: 'dc-tiles-w' }, h('h2', { class: 'nf-sect-title', style: 'margin:0 0 12px' }, t('browseGenre')), tiles); wrap.append(tilesWrap);
  const taste = tasteBar(name => { const g = mergeGenres().find(x => x.name === name); const tl = g && tiles.querySelector('[data-id="' + g.id + '"]'); if (tl) tl.click(); }); wrap.append(taste);
  const personal = h('div', { class: 'nf-rows', style: 'margin-top:10px' }); wrap.append(personal);
  const gridHost = h('div', { class: 'nf-page-pad', style: 'padding-top:0' }); wrap.append(gridHost);
  let grid = null;
  const filtered = () => st.q || st.genre || advN() || st.sort !== 'popularity' || st.type !== 'all' || st.hideOwned || st.hideSeen;
  /* personalised rows (only when no filter is active) */
  function buildPersonal() {
    personal.replaceChildren();
    richPersonal(personal, make, lm, rm);
    lazyRow(personal, t('trending'), () => seerrGet('/discover/trending', { page: 1 }).then(r => (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv')), 'poster', { make });
    lazyRow(personal, t('popMovies'), () => seerrGet('/discover/movies', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('popShows'), () => seerrGet('/discover/tv', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
    lazyRow(personal, t('upMovies'), () => seerrGet('/discover/movies/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'movie' }))), 'poster', { make });
    lazyRow(personal, t('upShows'), () => seerrGet('/discover/tv/upcoming', { page: 1 }).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: 'tv' }))), 'poster', { make });
  }
  const advParams = k => { const o = {}; const dk = k === 'movie' ? ['primaryReleaseDateGte', 'primaryReleaseDateLte'] : ['firstAirDateGte', 'firstAirDateLte'];
    if (st.yFrom) o[dk[0]] = st.yFrom + '-01-01'; if (st.yTo) o[dk[1]] = st.yTo + '-12-31'; if (st.minRate) { o.voteAverageGte = st.minRate; o.voteCountGte = 120; }
    if (st.run) { if (+st.run > 120) o.withRuntimeGte = 120; else o.withRuntimeLte = +st.run; } return o; };
  function fetcher() {
    const own = x => dStatus(x, lm, rm).k === 'own';
    let pg = 0;
    return async () => {
      const p = ++pg; let list = [], more = true;
      if (st.q) { const r = await seerrGet('/search', { query: st.q, page: p }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else if (!filtered()) { const r = await seerrGet('/discover/trending', { page: p + 1 }); list = (r.results || []).filter(x => x.mediaType === 'movie' || x.mediaType === 'tv'); more = p < (r.totalPages || 1); }
      else {
        const kinds = st.type === 'all' ? ['movie', 'tv'] : [st.type];
        const rs = await Promise.all(kinds.map(k => seerrGet('/discover/' + (k === 'movie' ? 'movies' : 'tv'), Object.assign({ page: p, sortBy: SORTS[st.sort][k === 'movie' ? 0 : 1] }, st.genre ? { genre: st.genre } : {}, advParams(k))).then(r => (r.results || []).map(x => Object.assign(x, { mediaType: k }))).catch(() => [])));
        list = rs.flat(); if (st.type === 'all') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); more = rs.some(r => r.length >= 20);
      }
      if (st.lang) list = list.filter(x => x.originalLanguage === st.lang);
      if (st.hideOwned) list = list.filter(x => !own(x));
      if (st.hideSeen) list = list.filter(x => !rcSeen(x, lm));
      return { Items: list, done: !more };
    };
  }
  function refresh() {
    gridHost.replaceChildren(); personal.style.display = taste.style.display = filtered() ? 'none' : ''; tilesWrap.style.display = filtered() ? 'none' : ''; heroHolder.style.display = filtered() ? 'none' : '';
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

/* ---------- Film Quiz: learn the faces, names and films of the actors from the films you have watched ---------- */
Object.assign(TX.en, {
  gTitle: 'Film Quiz', gSub: 'Faces, names and films of the actors from everything you have watched.',
  gLevel: 'Level', gXp: 'XP', gToNext: 'to level', gStreak: 'day streak', gStreak1: 'day streak', gGoal: 'Daily goal', gToday: 'today',
  gTrain: 'Daily training', gTrainSub: 'Spaced repetition: due faces plus a few new ones', gDue: 'due', gNew: 'new', gNothingDue: 'All caught up. Practise anyway?', gPractice: 'Practice',
  gStart: 'Start', gRecent: 'Recently watched', gRecentSub: 'Practise the cast of the films you just saw', gCastBtn: 'Practise the cast', gModes: 'Games',
  gBlitz: 'Blitz round', gBlitzSub: '60 seconds, as many faces as you can', gMemory: 'Memory', gMemorySub: 'Match six faces to their names', gTypeM: 'Name it', gTypeSub: 'See the face, type the name. The real test.',
  gCastM: 'Who played whom?', gCastSub: 'A random film you watched: match actors to roles', gCards: 'Flashcards', gCardsSub: 'Flip, check yourself, done. Calm and quick.',
  gStats: 'Your progress', gPool: 'actors in your films', gMastered: 'mastered', gLearning: 'learning', gAcc: 'accuracy', gBestCombo: 'best streak', gAnswers: 'answers',
  gActivity: 'Activity', gBadges: 'Badges', gTrouble: 'Tricky ones', gTroubleSub: 'Faces you mix up most', gRegulars: 'Your regulars', gRegularsSub: 'Actors in the most films you have watched', gFilmsN: 'films',
  gCollection: 'Your actors', gAll: 'All', gFilterNew: 'New', gFilterLearn: 'Learning', gFilterMaster: 'Mastered', gMore: 'Show more', gSearch: 'Search a name…',
  gWho: 'Who is this?', gFindFace: 'Which one is', gWhichFilm: 'In which of these films did you see', gWhoIn: 'Who was in', gWhoPlayed: 'Who played', gIn: 'in', gTypeQ: 'Type the name',
  gNewFace: 'New face', gRemember: 'Remember this face', gKnownFrom: 'Known from', gGotIt: 'Got it', gNext: 'Next', gCheck: 'Check', gDontKnow: 'No idea', gHint: 'Hint',
  gReveal: 'Reveal', gKnew: 'Knew it', gDidnt: 'Did not know', gAlmost: 'Almost! Correct spelling:', gRight: 'Correct!', gWrong: 'Not quite.', gItWas: 'It was',
  gDone: 'Round complete', gAgain: 'Play again', gBack: 'Back', gEarned: 'XP earned', gCorrect: 'correct', gLevelUp: 'Level up!', gNewBadges: 'New badges',
  gTime: 'Time', gMoves: 'moves', gScore: 'Score', gCombo: 'combo', gTooFew: 'Watch a few more films first: the quiz needs at least 8 actors with a picture.', gLoading: 'Collecting the casts of your films…',
  gLbLoad: 'Fetching the casts of your Letterboxd films', gNoSeerr: 'Films that are only on Letterboxd need Seerr to look up their cast.', gProfile: 'Open profile', gNextReview: 'Next review', gInDays: 'in {n} days', gDueNow: 'now',
  gSeenIn: 'Seen in', gRightWrong: 'right / wrong', gNever: 'not learned yet', gLocked: 'locked', gEnter: 'Enter', gQuit: 'Quit', gDailyDone: 'Daily goal reached!', gQ: 'Question',
  gNoFilm: 'No cast with pictures found for this film.', gFromLb: 'Letterboxd'
});
Object.assign(TX.de, {
  gTitle: 'Filmwissen', gSub: 'Gesichter, Namen und Filme der Schauspieler aus allem, was du gesehen hast.',
  gLevel: 'Level', gXp: 'XP', gToNext: 'bis Level', gStreak: 'Tage in Folge', gStreak1: 'Tag in Folge', gGoal: 'Tagesziel', gToday: 'heute',
  gTrain: 'Tägliches Training', gTrainSub: 'Verteilte Wiederholung: fällige Gesichter plus ein paar neue', gDue: 'fällig', gNew: 'neu', gNothingDue: 'Alles wiederholt. Trotzdem üben?', gPractice: 'Üben',
  gStart: 'Starten', gRecent: 'Kürzlich gesehen', gRecentSub: 'Übe die Besetzung der Filme, die du gerade gesehen hast', gCastBtn: 'Besetzung üben', gModes: 'Spiele',
  gBlitz: 'Blitzrunde', gBlitzSub: '60 Sekunden, so viele Gesichter wie möglich', gMemory: 'Memory', gMemorySub: 'Ordne sechs Gesichter ihren Namen zu', gTypeM: 'Name tippen', gTypeSub: 'Gesicht sehen, Namen tippen. Die echte Prüfung.',
  gCastM: 'Wer spielte wen?', gCastSub: 'Ein zufälliger gesehener Film: Schauspieler den Rollen zuordnen', gCards: 'Karteikarten', gCardsSub: 'Umdrehen, selbst prüfen, fertig. Ruhig und schnell.',
  gStats: 'Dein Fortschritt', gPool: 'Schauspieler in deinen Filmen', gMastered: 'gemeistert', gLearning: 'in Lernphase', gAcc: 'Trefferquote', gBestCombo: 'beste Serie', gAnswers: 'Antworten',
  gActivity: 'Aktivität', gBadges: 'Abzeichen', gTrouble: 'Problemfälle', gTroubleSub: 'Gesichter, die du am häufigsten verwechselst', gRegulars: 'Deine Stammbesetzung', gRegularsSub: 'Schauspieler in den meisten deiner gesehenen Filme', gFilmsN: 'Filme',
  gCollection: 'Deine Schauspieler', gAll: 'Alle', gFilterNew: 'Neu', gFilterLearn: 'Lernend', gFilterMaster: 'Gemeistert', gMore: 'Mehr anzeigen', gSearch: 'Namen suchen…',
  gWho: 'Wer ist das?', gFindFace: 'Wer davon ist', gWhichFilm: 'In welchem dieser Filme hast du gesehen:', gWhoIn: 'Wer spielte mit in', gWhoPlayed: 'Wer spielte', gIn: 'in', gTypeQ: 'Tippe den Namen',
  gNewFace: 'Neues Gesicht', gRemember: 'Merk dir dieses Gesicht', gKnownFrom: 'Bekannt aus', gGotIt: 'Gemerkt', gNext: 'Weiter', gCheck: 'Prüfen', gDontKnow: 'Weiß nicht', gHint: 'Tipp',
  gReveal: 'Aufdecken', gKnew: 'Gewusst', gDidnt: 'Nicht gewusst', gAlmost: 'Fast! Richtig geschrieben:', gRight: 'Richtig!', gWrong: 'Nicht ganz.', gItWas: 'Das war',
  gDone: 'Runde geschafft', gAgain: 'Nochmal', gBack: 'Zurück', gEarned: 'XP verdient', gCorrect: 'richtig', gLevelUp: 'Level aufgestiegen!', gNewBadges: 'Neue Abzeichen',
  gTime: 'Zeit', gMoves: 'Züge', gScore: 'Punkte', gCombo: 'Combo', gTooFew: 'Schau erst noch ein paar Filme: Das Quiz braucht mindestens 8 Schauspieler mit Bild.', gLoading: 'Sammle die Besetzungen deiner Filme…',
  gLbLoad: 'Lade die Besetzungen deiner Letterboxd-Filme', gNoSeerr: 'Für Filme, die nur auf Letterboxd stehen, braucht es Seerr, um die Besetzung nachzuschlagen.', gProfile: 'Profil öffnen', gNextReview: 'Nächste Wiederholung', gInDays: 'in {n} Tagen', gDueNow: 'jetzt',
  gSeenIn: 'Gesehen in', gRightWrong: 'richtig / falsch', gNever: 'noch nicht gelernt', gLocked: 'gesperrt', gEnter: 'Enter', gQuit: 'Beenden', gDailyDone: 'Tagesziel erreicht!', gQ: 'Frage',
  gNoFilm: 'Für diesen Film wurde keine Besetzung mit Bildern gefunden.', gFromLb: 'Letterboxd'
});

/* ----- progress, stored per user in Jellyfin (DisplayPreferences "cinema-game"), mirrored in localStorage ----- */
const GM = { st: null, p: null, saveT: 0, pool: null, poolP: null, poolAt: 0, enr: null, play: null };
const G_IV = [0, 1, 3, 7, 14, 30, 60, 120]; // days until the next review, by box
const gNewN = () => Math.max(1, +cfg('quizNew') || 10); // new faces per day
const gGoal = () => Math.max(20, +cfg('quizGoal') || 100); // XP per day
const gBlitzS = () => Math.max(15, +cfg('quizBlitz') || 60);
const G_MODES = ['blitz', 'memory', 'type', 'cast', 'cards'];
const gModeOn = k => { const m = cfg('quizModes'); return !m || m[k] !== false; };
const gDay = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
const gDef = () => ({ v: 1, ts: 0, xp: 0, a: {}, days: {}, streak: 0, bestStreak: 0, last: 0, badges: {}, n: 0, ok: 0, typed: 0, bestCombo: 0, bestBlitz: 0, bestMemory: 0, films: [], sessions: 0, perfect: 0, newDay: 0, newN: 0, night: 0, fav: {} });
const gLS = () => { try { return JSON.parse(localStorage.getItem('cx-game-' + uid()) || 'null'); } catch (e) { return null; } };
function gLoad() {
  if (GM.st) return Promise.resolve(GM.st); if (GM.p) return GM.p;
  GM.p = api('DisplayPreferences/cinema-game', { userId: uid(), client: 'cinema-game' }).then(dp => { const raw = (dp.CustomPrefs || {}).game; return raw ? JSON.parse(raw) : null; }).catch(() => null).then(srv => {
    const loc = gLS(); const pick = [srv, loc].filter(Boolean).sort((a, b) => (b.ts || 0) - (a.ts || 0))[0];
    GM.st = Object.assign(gDef(), pick || {}); return GM.st;
  }).finally(() => { GM.p = null; });
  return GM.p;
}
async function gFlush() {
  clearTimeout(GM.saveT); const st = GM.st; if (!st) return; st.ts = Date.now();
  const s = JSON.stringify(st); try { localStorage.setItem('cx-game-' + uid(), s); } catch (e) { }
  try { const q = { userId: uid(), client: 'cinema-game' }; const dp = await api('DisplayPreferences/cinema-game', q); dp.CustomPrefs = Object.assign(dp.CustomPrefs || {}, { game: s }); await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('DisplayPreferences/cinema-game', q), data: JSON.stringify(dp), contentType: 'application/json' }); } catch (e) { console.warn('[cinema] quiz save', e); }
}
const gSave = () => { if (GM.st) { GM.st.ts = Date.now(); try { localStorage.setItem('cx-game-' + uid(), JSON.stringify(GM.st)); } catch (e) { } } clearTimeout(GM.saveT); GM.saveT = setTimeout(gFlush, 2500); };
window.addEventListener('pagehide', () => { if (GM.saveT) gFlush(); });

/* levels: level n needs 60·n·(n−1) XP */
const gLvlXp = n => 60 * n * (n - 1);
const gLvl = xp => { let n = 1; while (gLvlXp(n + 1) <= xp) n++; return n; };
const G_TITLES = { de: [[1, 'Zuschauer'], [3, 'Kinogänger'], [5, 'Filmfan'], [8, 'Cineast'], [12, 'Kritiker'], [16, 'Kenner'], [20, 'Filmhistoriker'], [25, 'Casting-Profi'], [30, 'Hollywood-Insider'], [40, 'Legende']], en: [[1, 'Viewer'], [3, 'Moviegoer'], [5, 'Film fan'], [8, 'Cinephile'], [12, 'Critic'], [16, 'Connoisseur'], [20, 'Film historian'], [25, 'Casting pro'], [30, 'Hollywood insider'], [40, 'Legend']] };
const gTitleOf = lv => { let s = ''; for (const [n, x] of G_TITLES[L] || G_TITLES.en) if (lv >= n) s = x; return s; };
const gBox = (st, k) => (st.a[k] ? st.a[k][0] : 0);
const gIsNew = (st, a) => !st.a[a.k] || st.a[a.k][0] === 0;
const gMasteredN = st => Object.values(st.a).filter(s => s[0] >= 5).length;

/* badges */
const G_BADGES = [
  ['first', '🎬', 'Erste Klappe', 'First take', 'Die erste richtige Antwort', 'Your first correct answer', st => st.ok >= 1],
  ['ok100', '🍿', 'Popcorn-Kenner', 'Popcorn pro', '100 richtige Antworten', '100 correct answers', st => st.ok >= 100],
  ['ok500', '🎞️', 'Filmrolle', 'Film reel', '500 richtige Antworten', '500 correct answers', st => st.ok >= 500],
  ['ok2000', '🏛️', 'Cinemathek', 'Cinematheque', '2000 richtige Antworten', '2000 correct answers', st => st.ok >= 2000],
  ['combo10', '🔥', 'Lauf', 'On a roll', '10 richtige in Folge', '10 correct in a row', st => st.bestCombo >= 10],
  ['combo25', '☄️', 'Unaufhaltsam', 'Unstoppable', '25 richtige in Folge', '25 correct in a row', st => st.bestCombo >= 25],
  ['m10', '⭐', 'Bekannte Gesichter', 'Familiar faces', '10 Schauspieler gemeistert', '10 actors mastered', st => gMasteredN(st) >= 10],
  ['m50', '🌟', 'Who\'s who', 'Who\'s who', '50 Schauspieler gemeistert', '50 actors mastered', st => gMasteredN(st) >= 50],
  ['m150', '💫', 'Wandelndes IMDb', 'Walking IMDb', '150 Schauspieler gemeistert', '150 actors mastered', st => gMasteredN(st) >= 150],
  ['s3', '📅', 'Dranbleiben', 'Keep going', '3 Tage in Folge gespielt', 'Played 3 days in a row', st => st.bestStreak >= 3],
  ['s7', '🗓️', 'Wochenkarte', 'Weekly pass', '7 Tage in Folge gespielt', 'Played 7 days in a row', st => st.bestStreak >= 7],
  ['s30', '🏆', 'Dauerkarte', 'Season ticket', '30 Tage in Folge gespielt', 'Played 30 days in a row', st => st.bestStreak >= 30],
  ['perfect', '💯', 'Ohne Patzer', 'Flawless', 'Ein Training mit mindestens 10 Fragen ohne Fehler', 'A training of 10+ questions without a mistake', st => st.perfect >= 1],
  ['blitz15', '⚡', 'Schnellschuss', 'Quick draw', '15 Punkte in einer Blitzrunde', '15 points in one blitz round', st => st.bestBlitz >= 15],
  ['blitz30', '🌩️', 'Blitzgescheit', 'Lightning mind', '30 Punkte in einer Blitzrunde', '30 points in one blitz round', st => st.bestBlitz >= 30],
  ['memory', '🧠', 'Fotogedächtnis', 'Photographic memory', 'Memory in unter 45 Sekunden', 'Memory in under 45 seconds', st => st.bestMemory > 0 && st.bestMemory <= 45],
  ['typed25', '⌨️', 'Ohne Spickzettel', 'No cheat sheet', '25 Namen richtig getippt', '25 names typed correctly', st => st.typed >= 25],
  ['typed100', '✍️', 'Abspann-Leser', 'Credits reader', '100 Namen richtig getippt', '100 names typed correctly', st => st.typed >= 100],
  ['fans', '❤️', 'Fanclub', 'Fan club', 'Fünf Schauspielern folgen', 'Follow five actors', st => Object.keys(st.fav || {}).length >= 5],
  ['casts10', '🎭', 'Ensemble', 'Ensemble', 'Die Besetzung von 10 Filmen geübt', 'Practised the cast of 10 films', st => (st.films || []).length >= 10],
  ['night', '🌙', 'Spätvorstellung', 'Late show', 'Nach Mitternacht gespielt', 'Played after midnight', st => st.night >= 1],
  ['lv5', '🥉', 'Filmfan', 'Film fan', 'Level 5 erreicht', 'Reached level 5', st => gLvl(st.xp) >= 5],
  ['lv10', '🥈', 'Kritiker', 'Critic', 'Level 10 erreicht', 'Reached level 10', st => gLvl(st.xp) >= 10],
  ['lv20', '🥇', 'Filmhistoriker', 'Film historian', 'Level 20 erreicht', 'Reached level 20', st => gLvl(st.xp) >= 20]
];
const gBadgeTxt = b => L === 'de' ? [b[2], b[4]] : [b[3], b[5]];
function gBadgesCheck(st) { const got = []; G_BADGES.forEach(b => { if (!st.badges[b[0]] && b[6](st)) { st.badges[b[0]] = gDay(); got.push(b); } }); return got; }

/* ----- the pool: actors (with a picture) from every film you watched, in Jellyfin and on Letterboxd ----- */
let GTM = {}; try { GTM = JSON.parse(localStorage.getItem('cx-game-tm') || '{}') || {}; } catch (e) { }
const gRoleOk = r => !!r && r.length < 48 && !/^(self|himself|herself|themselves|narrator|voice|additional voices|uncredited)\b/i.test(r) && !/\((voice|uncredited|archive)/i.test(r);
/* all watched movies with cast, genres and runtime: shared by the quiz and Wrapped */
const GPM = { p: null, at: 0 };
function gPlayed(force) {
  if (!force && GPM.p && Date.now() - GPM.at < 300000) return GPM.p; GPM.at = Date.now();
  return GPM.p = items({ IncludeItemTypes: 'Movie', Filters: 'IsPlayed', Fields: 'People,ProviderIds,OriginalTitle,Genres,RunTimeTicks,CommunityRating,ProductionYear', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 4000, EnableImageTypes: 'Primary,Backdrop', ImageTypeLimit: 1 }).catch(() => { GPM.p = null; return { Items: [] }; });
}
function gPool(force) {
  if (!force && GM.pool && Date.now() - GM.poolAt < 600000) return Promise.resolve(GM.pool);
  if (GM.poolP) return GM.poolP;
  GM.poolP = gBuild().then(p => { GM.pool = p; GM.poolAt = Date.now(); return p; }).finally(() => { GM.poolP = null; });
  return GM.poolP;
}
async function gBuild() {
  const films = new Map(), actors = new Map(), tmSeen = new Set(), nameSeen = new Set();
  const addActor = (f, name, img, role, order, pid, tid) => {
    const k = lbNorm(name); if (!k || !img) return;
    let a = actors.get(k); if (!a) actors.set(k, a = { k, name, img, pid: null, tid: 0, films: [], roles: {}, score: 0, last: 0 });
    if (tid && !a.tid) a.tid = tid; if (pid && !a.pid) { a.pid = pid; a.img = img; } // prefer the Jellyfin picture
    if (a.films.includes(f.id)) return;
    a.films.push(f.id); a.roles[f.id] = role || ''; a.score += order < 3 ? 1 : order < 6 ? .7 : .45; a.last = Math.max(a.last, f.date || 0); f.cast.push(k);
  };
  const r = await gPlayed();
  for (const it of r.Items || []) {
    const u = ud(it); const tm = +((it.ProviderIds || {}).Tmdb) || 0;
    const f = { id: 'j' + it.Id, jf: it.Id, tmdb: tm, title: it.Name, year: it.ProductionYear || 0, poster: imgUrl(it, 'Primary', 300), bd: (it.BackdropImageTags || []).length ? imgUrl(it, 'Backdrop', 780) : '', date: u.LastPlayedDate ? Date.parse(u.LastPlayedDate) || 0 : 0, cast: [], src: 'jf' };
    if (tm) tmSeen.add(tm);
    [it.Name, it.OriginalTitle, tm && LBEN[tm] && LBEN[tm][0], tm && LBEN[tm] && LBEN[tm][2]].filter(Boolean).forEach(n => nameSeen.add(lbNorm(n) + '|' + f.year));
    films.set(f.id, f);
    (it.People || []).filter(p => p.Type === 'Actor').slice(0, 10).forEach((p, i) => addActor(f, p.Name, p.PrimaryImageTag ? U(p.Id, 'Primary', 400, p.PrimaryImageTag) : '', p.Role, i, p.Id));
  }
  for (const c of (cfg('quizLb') === false ? [] : Object.values(GTM))) {
    if (!c || !c[4]) continue; const [tm, title, year, poster, cast, date, bdp] = c; if (tmSeen.has(tm) || films.has('t' + tm)) continue;
    const f = { id: 't' + tm, tmdb: tm, title, year, poster: TM(poster, 'w342'), bd: bdp ? TM(bdp, 'w780') : '', date: date || 0, cast: [], src: 'lb' };
    films.set(f.id, f); cast.forEach(([name, prof, role, tid], i) => addActor(f, name, TM(prof, 'w185'), role, i, null, tid));
  }
  for (const f of [...films.values()]) if (!f.cast.length) films.delete(f.id);
  let list = [...actors.values()].sort((a, b) => b.score - a.score || b.films.length - a.films.length);
  const minF = +cfg('quizMin') || 1; if (minF > 1) { const f = list.filter(a => a.films.length >= minF); if (f.length >= 8) list = f; }
  const recentCut = Date.now() - 45 * 864e5;
  const fresh = list.slice().sort((a, b) => ((b.last > recentCut ? 3 : 0) + b.score) - ((a.last > recentCut ? 3 : 0) + a.score));
  const recent = [...films.values()].filter(f => f.date && f.cast.length >= 3).sort((a, b) => b.date - a.date).slice(0, 10);
  return { films, actors, list, fresh, top: list.slice(0, Math.max(60, Math.min(400, list.length))), recent, tmSeen, nameSeen };
}
/* Letterboxd-only films: look up the cast once via Seerr and keep it in this browser */
function gEnrich(onProgress) {
  if (GM.enr) return GM.enr;
  GM.enr = (async () => {
    if (cfg('quizLb') === false || !optOn('letterboxd') || !lbUser()) return 0; await lbLoad(); if (!LB.n || !(await waitSeerr())) return 0;
    const P = await gPool(); const keyOf = e => e.tmdb ? 't' + e.tmdb : 'n' + lbNorm(e.title) + '|' + (e.year || '');
    const near = e => { const k = lbNorm(e.title), y = +e.year || 0; return P.nameSeen.has(k + '|' + y) || P.nameSeen.has(k + '|' + (y - 1)) || P.nameSeen.has(k + '|' + (y + 1)); };
    const todo = [...new Set(LB.names.values())].filter(e => !(keyOf(e) in GTM) && !(e.tmdb && P.tmSeen.has(+e.tmdb)) && !near(e)).sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 150);
    if (!todo.length) return 0; let done = 0, added = 0, i = 0;
    const one = async e => {
      const key = keyOf(e);
      try {
        let tm = +e.tmdb || 0;
        if (!tm) { const s = await seerrGet('/search', { query: e.title, page: 1, language: 'en' }); const y = +e.year || 0; const hit = (s.results || []).filter(x => x.mediaType === 'movie').find(x => !y || Math.abs((+String(x.releaseDate || '').slice(0, 4) || 0) - y) <= 1); tm = hit ? +hit.id : 0; }
        if (!tm) { GTM[key] = 0; return; } if (P.tmSeen.has(tm)) { GTM[key] = [tm]; return; }
        const d = await seerrGet('/movie/' + tm); const cast = ((d.credits || {}).cast || []).filter(c => c.profilePath).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 8).map(c => [c.name, c.profilePath, c.character || '', c.id]);
        GTM[key] = [tm, d.title || e.title, +String(d.releaseDate || '').slice(0, 4) || e.year || 0, d.posterPath || '', cast, e.date ? Date.parse(e.date + 'T20:00:00') || 0 : 0, d.backdropPath || '']; added++;
      } catch (er) { /* try again next time */ }
    };
    const worker = async () => { while (i < todo.length) { await one(todo[i++]); done++; if (onProgress) onProgress(done, todo.length); } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    try { localStorage.setItem('cx-game-tm', JSON.stringify(GTM)); } catch (e) { }
    if (added) await gPool(true); return added;
  })().finally(() => { GM.enr = null; });
  return GM.enr;
}

/* ----- grading (Leitner boxes) and XP ----- */
function gGrade(st, a, ok, strong) {
  const d = gDay(); const s = st.a[a.k] || (st.a[a.k] = [0, d, 0, 0, 0, d]);
  s[2]++; s[5] = d;
  if (ok) { s[3]++; if (s[0] === 0 || s[1] <= d) { s[0] = Math.min(7, s[0] + (strong && s[0] >= 1 ? 2 : 1)); s[1] = d + G_IV[s[0]]; } }
  else { s[4]++; s[0] = Math.max(1, Math.floor(s[0] / 2)); s[1] = d + (s[0] > 1 ? 1 : 0); }
}
function gXp(st, n, S) {
  const d = gDay(); st.xp += n; st.days[d] = (st.days[d] || 0) + n; if (S) S.xp += n;
  if (st.last !== d) { st.streak = st.last === d - 1 ? st.streak + 1 : 1; st.last = d; st.bestStreak = Math.max(st.bestStreak, st.streak); }
  if (new Date().getHours() < 4) st.night = 1;
  const keep = d - 200; Object.keys(st.days).forEach(k => { if (+k < keep) delete st.days[k]; });
}
const gStreakNow = st => (st.last === gDay() || st.last === gDay() - 1) ? st.streak : 0;

/* ----- helpers ----- */
const gPick = (arr, n, skip) => { const out = []; for (const x of shuffleArr(arr)) { if (out.length >= n) break; if (!skip(x) && !out.includes(x)) out.push(x); } return out; };
const gFace = (a, cls) => h('div', Object.assign({ class: 'gm-face ' + (cls || '') }, bg(a.img)));
const gStars = (box, cls) => h('span', { class: 'gm-stars ' + (cls || ''), title: box ? box + '/5' : t('gNever') }, [1, 2, 3, 4, 5].map(i => h('i', { class: i <= box ? 'on' : '' })));
const gFilmsOf = (P, a, n) => a.films.map(id => P.films.get(id)).filter(Boolean).sort((x, y) => (y.date || 0) - (x.date || 0)).slice(0, n || 99);
function gLev(a, b) { if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return m || n; let prev = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; }
/* 2 = exact, 1 = close enough (typo or only the surname), 0 = wrong */
function gNameMatch(input, name) {
  const x = lbNorm(input), y = lbNorm(name); if (!x) return 0; if (x === y) return 2;
  if (gLev(x, y) <= Math.max(1, Math.round(y.length / 6))) return 1;
  const last = y.split(' ').pop(); if (last.length > 3 && (x === last || gLev(x, last) <= 1)) return 1;
  return 0;
}

/* ----- questions ----- */
function gModesFor(P, a, box) {
  const m = ['face2name', 'face2name', 'name2face'];
  if (box >= 1 && a.films.length) { if (P.films.size >= 6) m.push('face2film'); m.push('film2face'); if (a.films.some(id => gRoleOk(a.roles[id]))) m.push('role'); }
  if (box >= 3) m.push('type', 'type');
  return m;
}
function gQuestion(P, a, mode) {
  const others = n => gPick(P.top, n, x => x.k === a.k);
  const filmOf = pred => { const ids = shuffleArr(a.films).filter(id => P.films.has(id) && (!pred || pred(id))); return ids.length ? P.films.get(ids[0]) : null; };
  if (mode === 'face2film') { const f = filmOf(); if (!f) return gQuestion(P, a, 'face2name'); const wrong = gPick([...P.films.values()], 3, x => x.cast.includes(a.k)); return { a, mode, film: f, opts: shuffleArr([{ film: f, ok: 1 }].concat(wrong.map(x => ({ film: x })))) }; }
  if (mode === 'film2face' || mode === 'role') {
    const f = filmOf(mode === 'role' ? id => gRoleOk(a.roles[id]) : null); if (!f) return gQuestion(P, a, 'face2name');
    const mates = f.cast.filter(k => k !== a.k).map(k => P.actors.get(k)).filter(Boolean);
    const wrong = mode === 'role' && mates.length >= 3 && gBox(GM.st, a.k) >= 3 ? gPick(mates, 3, () => false) : gPick(P.top, 3, x => x.k === a.k || f.cast.includes(x.k));
    return { a, mode, film: f, role: a.roles[f.id], opts: shuffleArr([{ a, ok: 1 }].concat(wrong.map(x => ({ a: x })))) };
  }
  if (mode === 'type' || mode === 'intro' || mode === 'card') return { a, mode };
  return { a, mode, opts: shuffleArr([{ a, ok: 1 }].concat(others(3).map(x => ({ a: x })))) };
}

/* ----- a round ----- */
async function gPlay(kind, opts) {
  opts = opts || {}; if (GM.play) GM.play.close();
  const [st, P] = await Promise.all([gLoad(), gPool()]); gMergeFavs(P, st);
  if (P.list.length < 8) { toast(t('gTooFew')); return; }
  const d = gDay(); const S = { kind, st, P, i: 0, ok: 0, n: 0, xp: 0, combo: 0, best: 0, badges: [], lvl0: gLvl(st.xp), t0: Date.now(), q: [], requeued: new Set(), film: null };
  const A = st.a; const seen = P.list.filter(a => A[a.k]);
  if (kind === 'train' || kind === 'cards') {
    const favFirst = (x, y) => (gIsFav(st, y) ? 1 : 0) - (gIsFav(st, x) ? 1 : 0);
    const due = P.list.filter(a => A[a.k] && A[a.k][0] > 0 && A[a.k][1] <= d).sort((x, y) => A[x.k][1] - A[y.k][1] || A[x.k][0] - A[y.k][0]).sort(favFirst).slice(0, 15);
    const newLeft = opts.extraNew ? 5 : Math.max(0, gNewN() - (st.newDay === d ? st.newN : 0));
    let fresh = P.fresh.filter(a => gIsNew(st, a)).sort(favFirst).slice(0, Math.min(newLeft, Math.max(3, 18 - due.length)));
    let base = shuffleArr(due);
    if (opts.fav) { base = shuffleArr(P.list.filter(a => gIsFav(st, a))).slice(0, 15); fresh = base.filter(a => gIsNew(st, a)); base = base.filter(a => !gIsNew(st, a)); }
    if (!due.length && !fresh.length || opts.practice) base = seen.slice().sort((x, y) => (A[y.k][4] - A[y.k][3] * .3) - (A[x.k][4] - A[x.k][3] * .3) || A[x.k][0] - A[y.k][0]).slice(0, 12);
    S.q = base.map(a => kind === 'cards' ? { a, mode: 'card' } : { a });
    fresh.forEach((a, j) => { const at = Math.min(S.q.length, j * 2 + 1); S.q.splice(at, 0, { a, mode: 'intro' }); S.q.splice(Math.min(S.q.length, at + 3), 0, kind === 'cards' ? { a, mode: 'card' } : { a, mode: 'face2name' }); });
  } else if (kind === 'type') {
    const pool = seen.filter(a => A[a.k][0] >= 1); S.q = shuffleArr(pool.length >= 10 ? pool : seen.concat(P.top.filter(a => !A[a.k]))).slice(0, 10).map(a => ({ a, mode: 'type' }));
  } else if (kind === 'cast') {
    let f = opts.film ? P.films.get(opts.film) || P.films.get('j' + opts.film) : null;
    if (!f) { const cand = [...P.films.values()].filter(x => x.cast.length >= 4); f = cand[Math.floor(Math.random() * cand.length)]; }
    if (!f || f.cast.length < 2) { toast(t('gNoFilm')); return; }
    S.film = f; const cast = f.cast.map(k => P.actors.get(k)).filter(Boolean);
    cast.forEach(a => { if (!A[a.k]) S.q.push({ a, mode: 'intro' }); });
    shuffleArr(cast).forEach(a => S.q.push({ a, mode: gRoleOk(a.roles[f.id]) ? 'role' : 'face2name', film: f }));
  } else if (kind === 'blitz') {
    S.pool = seen.length >= 12 ? seen.concat(P.top.slice(0, 20)) : P.top.slice(0, 60); S.end = Date.now() + gBlitzS() * 1000;
  } else if (kind === 'memory') {
    S.pool = gPick(seen.length >= 6 ? seen : P.top.slice(0, 40), 6, () => false);
  }
  if (!S.q.length && kind !== 'blitz' && kind !== 'memory') { toast(t('gTooFew')); return; }
  gStage(S);
}
function gStage(S) {
  const keys = e => { if (!GM.play || document.querySelector('.cxd-bg.show')) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); return; } if (S.onKey) S.onKey(e); };
  const close = () => { document.removeEventListener('keydown', keys, true); clearInterval(S.timer); clearTimeout(S.auto); layer.classList.remove('show'); setTimeout(() => layer.remove(), 220); GM.play = null; document.documentElement.classList.remove('gm-open'); if (S.changed && /#\/c\/quiz/.test(location.hash)) route(); };
  const finish = () => { if (S.n || S.kind === 'memory' && S.won) gSummary(S); else close(); };
  const bar = h('div', { class: 'gm-pbar' }, h('i'));
  const hud = h('div', { class: 'gm-hud' });
  const stage = h('div', { class: 'gm-stage' });
  const layer = h('div', { class: 'gm-layer' }, h('div', { class: 'gm-top' }, h('button', { class: 'gm-x', 'aria-label': t('gQuit'), onclick: finish }, ic('close')), bar, hud), stage);
  getUI().append(layer); requestAnimationFrame(() => layer.classList.add('show')); document.documentElement.classList.add('gm-open');
  document.addEventListener('keydown', keys, true);
  Object.assign(S, { layer, stage, hud, bar, close, finish });
  GM.play = { close };
  if (S.kind === 'memory') return gMemory(S);
  if (S.kind === 'blitz') { S.timer = setInterval(() => { const left = Math.max(0, S.end - Date.now()); bar.firstChild.style.width = (left / (gBlitzS() * 10)) + '%'; if (!left) { clearInterval(S.timer); gSummary(S); } }, 100); }
  gNextQ(S);
}
function gHud(S) {
  S.hud.replaceChildren(...[h('span', { class: 'gm-hxp' }, '+' + S.xp + ' XP'), S.combo >= 3 ? h('span', { class: 'gm-hcombo' }, S.combo + 'x') : null, S.kind === 'blitz' ? h('span', {}, t('gScore') + ' ' + S.ok) : h('span', {}, Math.min(S.i + 1, S.q.length) + ' / ' + S.q.length)].filter(Boolean));
  if (S.kind !== 'blitz') S.bar.firstChild.style.width = (S.i / Math.max(1, S.q.length) * 100) + '%';
}
function gNextQ(S) {
  clearTimeout(S.auto); S.onKey = null;
  let item;
  if (S.kind === 'blitz') { if (Date.now() >= S.end) return gSummary(S); const a = S.pool[Math.floor(Math.random() * S.pool.length)]; item = { a, mode: 'face2name' }; }
  else { if (S.i >= S.q.length) return gSummary(S); item = S.q[S.i]; }
  const box = gBox(S.st, item.a.k); let mode = item.mode;
  if (!mode) { const ms = gModesFor(S.P, item.a, box); mode = ms[Math.floor(Math.random() * ms.length)]; }
  const q = gQuestion(S.P, item.a, mode); if (item.film && q.mode === mode && (mode === 'role' || mode === 'film2face')) { /* cast round: keep the film of the round */ q.film = item.film; q.role = item.a.roles[item.film.id]; const mates = item.film.cast.filter(k => k !== item.a.k).map(k => S.P.actors.get(k)).filter(Boolean); const wrong = gPick(mates.length >= 3 ? mates : S.P.top.filter(x => !item.film.cast.includes(x.k)), 3, () => false); q.opts = shuffleArr([{ a: item.a, ok: 1 }].concat(wrong.map(x => ({ a: x })))); }
  gHud(S); gRender(S, q);
}
function gRender(S, q) {
  const { a } = q; const P = S.P; const st = S.st;
  const card = h('div', { class: 'gm-card gm-' + q.mode }); S.stage.replaceChildren(card);
  let went = false; const next = () => { if (went) return; went = true; S.i++; gNextQ(S); };
  const fb = h('div', { class: 'gm-fb' });
  const done = (ok, strong, almost) => {
    S.n++; st.n++;
    if (ok) { S.ok++; st.ok++; S.combo++; S.best = Math.max(S.best, S.combo); st.bestCombo = Math.max(st.bestCombo, S.combo); }
    else { S.combo = 0; if (S.kind !== 'blitz' && !S.requeued.has(a.k)) { S.requeued.add(a.k); S.q.splice(Math.min(S.q.length, S.i + 4), 0, { a, mode: 'face2name' }); } }
    gGrade(st, a, ok, strong);
    const base = q.mode === 'type' ? (strong ? 20 : 12) : q.mode === 'card' ? 6 : S.kind === 'blitz' ? 5 : 10;
    const xp = ok ? base + Math.min(10, Math.max(0, S.combo - 1)) : 1; gXp(st, xp, S); S.changed = true;
    S.badges.push(...gBadgesCheck(st)); gSave(); gHud(S);
    card.classList.add(ok ? 'is-ok' : 'is-bad');
    if (S.kind === 'blitz') { S.auto = setTimeout(next, ok ? 280 : 900); return; }
    fb.replaceChildren(h('div', { class: 'gm-fbh' }, h('b', { class: ok ? 'ok' : 'bad' }, ok ? (almost ? t('gAlmost') : t('gRight')) : t('gWrong')), h('span', { class: 'gm-fxp' }, '+' + xp + ' XP'), S.combo >= 3 ? h('span', { class: 'gm-hcombo' }, S.combo + 'x') : null),
      h('div', { class: 'gm-fbp' }, h('button', { class: 'gm-fbface', 'aria-label': a.name, onclick: () => gActorDialog(a) }, gFace(a, 'sm')), h('div', {}, h('div', { class: 'gm-fbn' }, (ok ? '' : t('gItWas') + ' ') , h('b', {}, a.name), gStars(gBox(st, a.k), 'sm'), gHeart(a, 'sm'), h('button', { class: 'nf-chip gm-allf', onclick: () => gActorDialog(a) }, (hasSeerr() ? t('gTabAll') : t('gTabSeen')))), gKnownFrom(P, a, 3))),
      h('button', { class: 'btn white gm-next', onclick: next }, t('gNext'), h('kbd', {}, '⏎')));
    card.append(fb); fb.classList.add('show'); requestAnimationFrame(() => { const b = $('.gm-next', fb); if (b) b.focus({ preventScroll: true }); });
    S.onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } };
    /* automatic next question: slow, with a visible countdown, and it stops as soon as you touch, hover or focus the answer card (to look at the other films) */
    if (ok && q.mode !== 'type' && cfg('quizAuto') !== false) { const ms = 7000; const cd = h('div', { class: 'gm-cd' }, h('i', { style: 'animation-duration:' + ms + 'ms' })); fb.append(cd); S.auto = setTimeout(next, ms); const stop = () => { clearTimeout(S.auto); cd.remove(); }; ['pointerenter', 'pointerdown', 'focusin', 'wheel', 'touchstart'].forEach(ev => fb.addEventListener(ev, stop, { once: true, passive: true })); }
  };
  const choose = (opts, render, wrapCls) => {
    let answered = false;
    const btns = opts.map((o, i) => h('button', { class: 'gm-opt', onclick: () => pick(i) }, h('kbd', {}, String(i + 1)), render(o)));
    const pick = i => { if (answered) return; answered = true; btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('ok'); else if (j === i) b.classList.add('bad'); if (opts[j].a && wrapCls === 'gm-faces') b.append(h('span', { class: 'gm-reveal' }, opts[j].a.name)); }); done(!!opts[i].ok, false); };
    S.onKey = e => { const n = +e.key; if (n >= 1 && n <= opts.length) { e.preventDefault(); pick(n - 1); } };
    return h('div', { class: 'gm-opts ' + (wrapCls || '') }, btns);
  };
  const faceOpt = o => gFace(o.a, 'opt');
  const filmOpt = o => [h('div', Object.assign({ class: 'gm-poster' }, bg(o.film.poster))), h('span', { class: 'gm-ft' }, o.film.title + (o.film.year ? ' (' + o.film.year + ')' : ''))];
  if (q.mode === 'intro') {
    const s = st.a[a.k]; if (!s) { if (st.newDay !== gDay()) { st.newDay = gDay(); st.newN = 0; } st.newN++; st.a[a.k] = [0, gDay(), 0, 0, 0, gDay()]; gSave(); }
    card.append(h('div', { class: 'gm-tag new' }, t('gNewFace')), gFace(a, 'xl'), h('div', { class: 'gm-nrow' }, h('h2', { class: 'gm-name' }, a.name), gHeart(a)), h('p', { class: 'gm-q' }, t('gRemember')), gKnownFrom(P, a, 4), h('button', { class: 'btn white gm-next', onclick: next }, t('gGotIt'), h('kbd', {}, '⏎')));
    S.onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } }; requestAnimationFrame(() => { const b = $('.gm-next', card); if (b) b.focus({ preventScroll: true }); });
  } else if (q.mode === 'face2name') {
    card.append(h('p', { class: 'gm-q' }, t('gWho')), gFace(a, 'xl'), choose(q.opts, o => h('span', {}, o.a.name)));
  } else if (q.mode === 'name2face') {
    card.append(h('p', { class: 'gm-q' }, t('gFindFace')), h('h2', { class: 'gm-name' }, a.name), choose(q.opts, faceOpt, 'gm-faces'));
  } else if (q.mode === 'face2film') {
    card.append(h('div', { class: 'gm-row' }, gFace(a, 'md'), h('div', {}, h('p', { class: 'gm-q' }, t('gWhichFilm')), h('h2', { class: 'gm-name' }, a.name))), choose(q.opts, filmOpt, 'gm-films'));
  } else if (q.mode === 'film2face' || q.mode === 'role') {
    const f = q.film; const scene = h('div', { class: 'gm-scene' }); if (q.mode === 'role' || cfg('quizScenes') !== false) gFillScene(scene, a, f.tmdb, f.bd);
    card.append(scene, h('div', { class: 'gm-row' }, h('div', Object.assign({ class: 'gm-poster lg' }, bg(f.poster))), h('div', {}, q.mode === 'role' ? [h('p', { class: 'gm-q' }, t('gWhoPlayed')), h('h2', { class: 'gm-name' }, '„' + q.role + '“'), h('p', { class: 'gm-q' }, t('gIn') + ' ' + f.title + (f.year ? ' (' + f.year + ')' : ''))] : [h('p', { class: 'gm-q' }, t('gWhoIn')), h('h2', { class: 'gm-name' }, f.title + (f.year ? ' (' + f.year + ')' : '') + '?')])), choose(q.opts, faceOpt, 'gm-faces'));
  } else if (q.mode === 'type') {
    let hinted = false, answered = false;
    const inp = h('input', { class: 'gm-input', type: 'text', placeholder: t('gTypeQ') + '…', autocomplete: 'off', spellcheck: 'false' });
    const hintEl = h('div', { class: 'gm-hintl' });
    const check = () => { if (answered) return; const m = gNameMatch(inp.value, a.name); if (!inp.value.trim()) return; answered = true; inp.disabled = true; if (m) st.typed++; done(m > 0, m === 2 && !hinted, m === 1); };
    const hint = () => { hinted = true; hintEl.textContent = a.name.split(' ').map(w => w[0] + '·'.repeat(Math.max(0, w.length - 1))).join(' '); };
    const giveUp = () => { if (answered) return; answered = true; inp.disabled = true; done(false); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); check(); } });
    card.append(h('p', { class: 'gm-q' }, t('gWho')), gFace(a, 'xl'), hintEl, h('div', { class: 'gm-typerow' }, inp, h('button', { class: 'btn white', onclick: check }, t('gCheck'))), h('div', { class: 'gm-typeb' }, h('button', { class: 'nf-chip', onclick: hint }, t('gHint')), h('button', { class: 'nf-chip', onclick: giveUp }, t('gDontKnow'))));
    setTimeout(() => inp.focus(), 60);
  } else if (q.mode === 'card') {
    const back = h('div', { class: 'gm-back' }, h('h2', { class: 'gm-name' }, a.name), gKnownFrom(P, a, 3));
    const btns = h('div', { class: 'gm-cardb' }, h('button', { class: 'btn white', onclick: () => reveal() }, t('gReveal'), h('kbd', {}, '⏎')));
    let shown = false, answered = false;
    const rate = ok => { if (answered) return; answered = true; S.n++; st.n++; if (ok) { S.ok++; st.ok++; S.combo++; S.best = Math.max(S.best, S.combo); st.bestCombo = Math.max(st.bestCombo, S.combo); } else { S.combo = 0; if (!S.requeued.has(a.k)) { S.requeued.add(a.k); S.q.splice(Math.min(S.q.length, S.i + 4), 0, { a, mode: 'card' }); } } gGrade(st, a, ok); gXp(st, ok ? 6 : 1, S); S.changed = true; S.badges.push(...gBadgesCheck(st)); gSave(); next(); };
    const reveal = () => { if (shown) return; shown = true; card.classList.add('flipped'); btns.replaceChildren(h('button', { class: 'btn grey', onclick: () => rate(false) }, h('kbd', {}, '1'), t('gDidnt')), h('button', { class: 'btn white', onclick: () => rate(true) }, h('kbd', {}, '2'), t('gKnew'))); };
    S.onKey = e => { if (!shown && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); reveal(); } else if (shown && (e.key === '1' || e.key === '2')) { e.preventDefault(); rate(e.key === '2'); } };
    card.append(h('p', { class: 'gm-q' }, t('gWho')), gFace(a, 'xl'), back, btns);
  }
}
function gMemory(S) {
  const st = S.st; const tiles = shuffleArr(S.pool.flatMap(a => [{ a, face: 1 }, { a }]));
  let open = [], moves = 0, matched = 0, lock = false; S.t0 = Date.now();
  const timeEl = h('span', {}, '0 s'); S.hud.replaceChildren(timeEl, h('span', {}, '·'), h('span', { class: 'gm-mv' }, '0 ' + t('gMoves')));
  S.timer = setInterval(() => { timeEl.textContent = Math.round((Date.now() - S.t0) / 1000) + ' s'; }, 500);
  const grid = h('div', { class: 'gm-mem' }, tiles.map(tl => { const el = h('button', { class: 'gm-tile', onclick: () => flip(tl, el) }, h('div', { class: 'gm-tin' }, h('div', { class: 'gm-tf' }, '?'), h('div', { class: 'gm-tb' }, tl.face ? gFace(tl.a, 'tile') : h('b', {}, tl.a.name)))); tl.el = el; return el; }));
  S.stage.replaceChildren(h('div', { class: 'gm-card gm-memory' }, h('p', { class: 'gm-q' }, t('gMemorySub')), grid));
  function flip(tl, el) {
    if (lock || el.classList.contains('up') || el.classList.contains('done')) return;
    el.classList.add('up'); open.push(tl); if (open.length < 2) return;
    moves++; $('.gm-mv', S.hud).textContent = moves + ' ' + t('gMoves'); lock = true;
    const [x, y] = open; open = [];
    if (x.a === y.a && x.face !== y.face) { setTimeout(() => { x.el.classList.add('done'); y.el.classList.add('done'); lock = false; matched++; S.n++; S.ok++; st.n++; st.ok++; gGrade(st, x.a, true); gXp(st, 8, S); S.changed = true; if (matched === S.pool.length) win(); else gSave(); }, 350); }
    else setTimeout(() => { x.el.classList.remove('up'); y.el.classList.remove('up'); lock = false; }, 900);
  }
  function win() { clearInterval(S.timer); const sec = Math.round((Date.now() - S.t0) / 1000); S.secs = sec; S.moves = moves; S.won = true; gXp(st, Math.max(10, 70 - sec) + Math.max(0, 20 - (moves - 6) * 2), S); st.bestMemory = st.bestMemory ? Math.min(st.bestMemory, sec) : sec; S.badges.push(...gBadgesCheck(st)); gSave(); setTimeout(() => gSummary(S), 500); }
}
function gSummary(S) {
  clearInterval(S.timer); clearTimeout(S.auto); S.onKey = null; const st = S.st;
  if (!S.summarised) {
    S.summarised = true; st.sessions++;
    if (S.kind === 'blitz') st.bestBlitz = Math.max(st.bestBlitz, S.ok);
    if (S.kind === 'train' && S.n >= 10 && S.ok === S.n) st.perfect++;
    if (S.kind === 'cast' && S.film && !st.films.includes(S.film.id)) st.films = st.films.concat(S.film.id).slice(-500);
    S.badges.push(...gBadgesCheck(st)); gFlush();
  }
  const lv = gLvl(st.xp), up = lv > S.lvl0; const lo = gLvlXp(lv), hi = gLvlXp(lv + 1);
  const goalDone = (st.days[gDay()] || 0) >= gGoal();
  const uniq = [...new Map(S.badges.map(b => [b[0], b])).values()];
  S.bar.firstChild.style.width = '100%';
  S.stage.replaceChildren(h('div', { class: 'gm-card gm-sum' + (up ? ' up' : '') },
    up ? h('div', { class: 'gm-confetti' }, Array.from({ length: 36 }, (_, i) => h('i', { style: '--x:' + (Math.random() * 100) + '%;--d:' + (Math.random() * .8) + 's;--c:' + ['#e50914', '#f5c518', '#1ed760', '#4aa3ff', '#ff7ac6'][i % 5] }))) : null,
    h('div', { class: 'gm-sumi' }, up ? '🎉' : S.kind === 'memory' ? '🧠' : S.kind === 'blitz' ? '⚡' : '🎬'),
    h('h2', {}, up ? t('gLevelUp') + ' ' + lv : t('gDone')), up ? h('p', { class: 'gm-q' }, gTitleOf(lv)) : null,
    S.film ? h('p', { class: 'gm-q' }, S.film.title) : null,
    h('div', { class: 'gm-sumg' },
      h('div', {}, h('b', {}, '+' + S.xp), h('span', {}, t('gEarned'))),
      S.kind === 'memory' ? h('div', {}, h('b', {}, (S.secs || 0) + ' s'), h('span', {}, (S.moves || 0) + ' ' + t('gMoves'))) : h('div', {}, h('b', {}, S.ok + '/' + S.n), h('span', {}, t('gCorrect'))),
      h('div', {}, h('b', {}, S.best), h('span', {}, t('gBestCombo')))),
    h('div', { class: 'gm-lvbar' }, h('span', {}, t('gLevel') + ' ' + lv), h('div', { class: 'gm-xpb' }, h('i', { style: 'width:' + Math.round((st.xp - lo) / (hi - lo) * 100) + '%' })), h('small', {}, (hi - st.xp) + ' XP ' + t('gToNext') + ' ' + (lv + 1))),
    goalDone ? h('p', { class: 'gm-goal-ok' }, t('gDailyDone') + ' · ' + gStreakNow(st) + ' ' + (gStreakNow(st) === 1 ? t('gStreak1') : t('gStreak'))) : null,
    uniq.length ? h('div', { class: 'gm-newb' }, h('small', {}, t('gNewBadges')), h('div', {}, uniq.map(b => h('div', { class: 'gm-badge got pop' }, h('span', { class: 'e' }, b[1]), h('b', {}, gBadgeTxt(b)[0]), h('small', {}, gBadgeTxt(b)[1]))))) : null,
    h('div', { class: 'gm-sumb' }, h('button', { class: 'btn grey', onclick: S.close }, t('gBack')), h('button', { class: 'btn white', onclick: () => { S.close(); setTimeout(() => gPlay(S.kind, S.film ? { film: S.film.id } : {}), 240); } }, ic('refresh'), t('gAgain')))));
  S.onKey = e => { if (e.key === 'Enter') { e.preventDefault(); S.close(); } };
}

/* ----- the dashboard ----- */
function gRing(v, max) {
  const r = 30, c = 2 * Math.PI * r, p = Math.min(1, v / max); const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 72 72'); svg.setAttribute('class', 'gm-ring');
  [['bg', c], ['fg', c * (1 - p)]].forEach(([cls, off]) => { const ci = document.createElementNS(NS, 'circle'); ['cx', 'cy'].forEach(k => ci.setAttribute(k, '36')); ci.setAttribute('r', r); ci.setAttribute('class', cls); ci.setAttribute('stroke-dasharray', c); ci.setAttribute('stroke-dashoffset', off); svg.append(ci); });
  return svg;
}
function gHeat(st) {
  const d = gDay(), weeks = 18; const wd = (new Date().getDay() + 6) % 7; const start = d - wd - (weeks - 1) * 7;
  const cells = []; for (let x = start; x <= d; x++) { const v = st.days[x] || 0; cells.push(h('i', { class: 'l' + (v === 0 ? 0 : v < 40 ? 1 : v < gGoal() ? 2 : v < 250 ? 3 : 4), title: new Date((x * 864e5) + new Date().getTimezoneOffset() * 60000).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US') + ' · ' + v + ' XP' })); }
  return h('div', { class: 'gm-heat' }, cells);
}
async function quizView(page) {
  const wrap = h('div', { class: 'nf-page-pad gm-page' }); page.append(wrap);
  wrap.append(h('div', { class: 'spinner', style: 'margin:80px auto 16px' }), h('p', { class: 'gm-loading' }, t('gLoading')));
  const [st, P] = await Promise.all([gLoad(), gPool()]); gMergeFavs(P, st);
  const film = parse().q.get('film');
  gDash(wrap, st, P);
  if (film) { history.replaceState(null, '', '#/c/quiz'); gPlay('cast', { film }); }
  /* Letterboxd films outside the library: fetch their casts in the background, then redraw */
  if (cfg('quizLb') !== false && optOn('letterboxd') && lbUser()) {
    const note = $('.gm-lbnote', wrap);
    gEnrich((n, of) => { if (note && note.isConnected) { note.hidden = false; note.textContent = t('gLbLoad') + ' · ' + n + '/' + of; } }).then(added => {
      if (note) note.hidden = true; if (added && wrap.isConnected && !GM.play) { wrap.replaceChildren(); gDash(wrap, GM.st, GM.pool); }
    });
  }
}
function gDash(wrap, st, P) {
  wrap.replaceChildren(); const d = gDay(); const A = st.a;
  const lv = gLvl(st.xp), lo = gLvlXp(lv), hi = gLvlXp(lv + 1); const todayXp = st.days[d] || 0; const streak = gStreakNow(st);
  const due = P.list.filter(a => A[a.k] && A[a.k][0] > 0 && A[a.k][1] <= d).length;
  const newLeft = Math.min(P.list.filter(a => gIsNew(st, a)).length, Math.max(0, gNewN() - (st.newDay === d ? st.newN : 0)));
  const mastered = P.list.filter(a => gBox(st, a.k) >= 5).length, learning = P.list.filter(a => A[a.k] && A[a.k][0] > 0 && A[a.k][0] < 5).length;
  wrap.append(h('div', { class: 'gm-head' },
    h('div', { class: 'gm-lv' }, h('div', { class: 'gm-lvn' }, h('small', {}, t('gLevel')), h('b', {}, String(lv))), h('div', { class: 'gm-lvi' }, h('h1', {}, t('gTitle')), h('p', {}, gTitleOf(lv) + ' · ' + st.xp.toLocaleString() + ' XP'), h('div', { class: 'gm-xpb' }, h('i', { style: 'width:' + Math.round((st.xp - lo) / (hi - lo) * 100) + '%' })), h('small', {}, (hi - st.xp) + ' XP ' + t('gToNext') + ' ' + (lv + 1)))),
    h('div', { class: 'gm-pills' },
      h('div', { class: 'gm-pill' + (streak ? ' hot' : '') }, h('div', {}, h('b', {}, String(streak)), h('small', {}, streak === 1 ? t('gStreak1') : t('gStreak')))),
      h('div', { class: 'gm-pill' }, h('div', { class: 'gm-ringw' }, gRing(todayXp, gGoal()), h('span', {}, Math.min(100, Math.round(todayXp / gGoal() * 100)) + '%')), h('div', {}, h('b', {}, todayXp + ' / ' + gGoal()), h('small', {}, t('gGoal')))))));
  wrap.append(h('p', { class: 'gm-lbnote', hidden: true }));
  if (P.list.length < 8) { wrap.append(h('div', { class: 'nf-empty' }, t('gTooFew'))); if (optOn('letterboxd') && lbUser() && !hasSeerr()) wrap.append(h('p', { class: 'gm-loading' }, t('gNoSeerr'))); return; }
  /* daily training */
  const nothing = !due && !newLeft;
  const faces = P.list.filter(a => A[a.k] && A[a.k][0] > 0 && A[a.k][1] <= d).concat(P.fresh.filter(a => gIsNew(st, a))).slice(0, 7);
  wrap.append(h('div', { class: 'gm-train' + (nothing ? ' calm' : ''), onclick: () => gPlay('train', nothing ? { practice: true } : {}) },
    h('div', { class: 'gm-tfaces' }, faces.map(a => gFace(a, 'st'))),
    h('div', { class: 'gm-ttx' }, h('h2', {}, t('gTrain')), h('p', {}, nothing ? t('gNothingDue') : t('gTrainSub')), h('div', { class: 'gm-tchips' }, h('span', { class: 'c due' }, due + ' ' + t('gDue')), h('span', { class: 'c new' }, newLeft + ' ' + t('gNew')))),
    h('button', { class: 'btn white' }, ic('play'), nothing ? t('gPractice') : t('gStart'))));
  /* recently watched */
  if (P.recent.length) {
    wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gRecent')), h('p', { class: 'gm-secp' }, t('gRecentSub')),
      h('div', { class: 'gm-recent' }, P.recent.slice(0, 8).map(f => {
        const cast = f.cast.map(k => P.actors.get(k)).filter(Boolean);
        const pctK = Math.round(cast.filter(a => gBox(st, a.k) >= 3).length / Math.max(1, cast.length) * 100);
        return h('div', { class: 'gm-rf' }, h('div', Object.assign({ class: 'gm-rfp' }, bg(f.poster)), f.src === 'lb' ? h('span', { class: 'dmark seen' }, t('gFromLb')) : null),
          h('div', { class: 'gm-rfb' }, h('b', { class: 'ell' }, f.title), h('small', {}, [f.year, f.date ? new Date(f.date).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' }) : ''].filter(Boolean).join(' · ')),
            h('div', { class: 'gm-rfc' }, cast.slice(0, 6).map(a => h('button', { class: 'gm-mini b' + Math.min(5, gBox(st, a.k)), title: a.name + (a.roles[f.id] ? ' – ' + a.roles[f.id] : ''), onclick: () => gActorDialog(a) }, gFace(a, 'mini')))),
            h('div', { class: 'gm-kbar', title: pctK + '%' }, h('i', { style: 'width:' + pctK + '%' })),
            h('button', { class: 'btn grey sm', onclick: () => gPlay('cast', { film: f.id }) }, ic('play'), t('gCastBtn'))));
      }))));
  }
  gFavSection(wrap, st, P);
  /* games */
  const mode = (k, e, title, sub, extra) => !gModeOn(k) ? null : h('button', { class: 'gm-mode m-' + k, onclick: () => gPlay(k) }, (e ? h('span', { class: 'e' }, e) : null), h('b', {}, title), h('small', {}, sub), extra ? h('span', { class: 'gm-rec' }, extra) : null);
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gModes')), h('div', { class: 'gm-modes' },
    mode('blitz', '⚡', t('gBlitz'), t('gBlitzSub'), st.bestBlitz ? '🏆 ' + st.bestBlitz : ''), mode('memory', '🧠', t('gMemory'), t('gMemorySub'), st.bestMemory ? '🏆 ' + st.bestMemory + ' s' : ''),
    mode('type', '⌨️', t('gTypeM'), t('gTypeSub'), st.typed ? '✓ ' + st.typed : ''), mode('cast', '🎭', t('gCastM'), t('gCastSub')), mode('cards', '🃏', t('gCards'), t('gCardsSub')))));
  /* stats + activity */
  const acc = st.n ? Math.round(st.ok / st.n * 100) : 0;
  const tile = (v, l) => h('div', { class: 'gm-tile2' }, h('b', {}, String(v)), h('small', {}, l));
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gStats')), h('div', { class: 'gm-stats' }, tile(P.list.length, t('gPool')), tile(mastered, t('gMastered')), tile(learning, t('gLearning')), tile(acc + '%', t('gAcc')), tile(st.bestCombo, t('gBestCombo')), tile(st.n.toLocaleString(), t('gAnswers'))),
    h('div', { class: 'gm-mbar' }, h('i', { class: 'm', style: 'width:' + (mastered / P.list.length * 100) + '%' }), h('i', { class: 'l', style: 'width:' + (learning / P.list.length * 100) + '%' })),
    h('h3', {}, t('gActivity')), gHeat(st)));
  /* tricky ones + regulars */
  const trouble = P.list.filter(a => A[a.k] && A[a.k][4] > 0).sort((x, y) => (A[y.k][4] / (A[y.k][2] || 1)) - (A[x.k][4] / (A[x.k][2] || 1)) || A[y.k][4] - A[x.k][4]).slice(0, 8);
  const regulars = P.list.slice().sort((x, y) => y.films.length - x.films.length).filter(a => a.films.length >= 2).slice(0, 10);
  const pcard = (a, sub) => gActorCard(a, st, sub);
  const two = h('div', { class: 'gm-two' });
  if (regulars.length) two.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gRegulars')), h('p', { class: 'gm-secp' }, t('gRegularsSub')), h('div', { class: 'gm-pcs' }, regulars.map(a => pcard(a, a.films.length + ' ' + t('gFilmsN'))))));
  if (trouble.length) two.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gTrouble')), h('p', { class: 'gm-secp' }, t('gTroubleSub')), h('div', { class: 'gm-pcs' }, trouble.map(a => pcard(a, A[a.k][3] + ' / ' + A[a.k][4])))));
  if (two.children.length) wrap.append(two);
  /* badges */
  const got = G_BADGES.filter(b => st.badges[b[0]]).length;
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('gBadges') + ' · ' + got + '/' + G_BADGES.length), h('div', { class: 'gm-badges' }, G_BADGES.map(b => { const on = !!st.badges[b[0]]; const [tt, ds] = gBadgeTxt(b); return h('div', { class: 'gm-badge' + (on ? ' got' : ''), title: ds }, h('span', { class: 'e' }, b[1]), h('b', {}, tt), h('small', {}, ds)); }))));
  /* collection */
  const coll = h('section', { class: 'gm-sec' }); wrap.append(coll);
  let filter = 'all', q = '', shown = 60;
  const grid = h('div', { class: 'gm-coll' });
  const more = h('button', { class: 'btn grey gm-more', onclick: () => { shown += 120; draw(); } }, t('gMore'));
  const chips = h('div', { class: 'gm-filt' }, [['all', t('gAll')], ['fav', t('gFilterFav')], ['new', t('gFilterNew')], ['learn', t('gFilterLearn')], ['master', t('gFilterMaster')]].map(([k, l]) => h('button', { class: 'nf-chip' + (k === filter ? ' on' : ''), onclick: e => { filter = k; $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); shown = 60; draw(); } }, l)),
    h('input', { type: 'search', class: 'gm-find', placeholder: t('gSearch'), oninput: e => { q = lbNorm(e.target.value); shown = 60; draw(); } }));
  function draw() {
    const list = P.list.filter(a => { const b = gBox(st, a.k); if (filter === 'fav' && !gIsFav(st, a)) return false; if (filter === 'new' && !gIsNew(st, a)) return false; if (filter === 'learn' && (gIsNew(st, a) || b >= 5)) return false; if (filter === 'master' && b < 5) return false; return !q || a.k.includes(q); });
    grid.replaceChildren(...list.slice(0, shown).map(a => pcard(a, a.films.length + ' ' + t('gFilmsN'))));
    more.hidden = list.length <= shown;
  }
  coll.append(h('h2', {}, t('gCollection') + ' · ' + P.list.length), chips, grid, more); draw();
}
/* detail page: "practise the cast" next to the cast heading of a watched film */
function gCastBtn(it, body) {
  if (!cfg('quiz') || it.Type !== 'Movie' || !ud(it).Played) return;
  const hd = $$('.nf-sect h2', body).find(x => x.textContent === t('cast')); if (!hd) return;
  hd.classList.add('gm-casth'); hd.append(h('a', { class: 'nf-chip gm-castbtn', href: '#/c/quiz?film=j' + it.Id }, t('gCastBtn')));
}

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

/* ---------- Cinema Wrapped: your viewing year as a story ---------- */
Object.assign(TX.en, {
  wrTitle: 'Wrapped', wrHead: 'Your film year', wrIntroSub: 'A look back at everything you watched.', wrStart: 'Start', wrOpen: 'Watch your year', wrReplay: 'Watch again', wrClose: 'Close',
  wrYouWatched: 'You watched', wrFilmsDone: 'films', wrHours: '{h} hours in front of the screen', wrDays: 'That is {d} days without a break.', wrEst: 'estimated for films without a runtime', wrEps: 'Plus {n} episodes of series ({h} h)', wrTopShow: 'Most watched show',
  wrBusiest: 'Your cinema month', wrMonthN: '{n} films in {m}', wrGenres: 'Your genres', wrGenresSub: 'What you reached for most', wrDecade: 'Your decade', wrDecadeSub: '{n} of your films came from the {d}s', wrOldest: 'Oldest film you saw',
  wrActor: 'Actor of your year', wrActorN: 'in {n} of your films', wrActor2: 'Also often on your screen', wrDirector: 'Director of your year', wrDirectorN: '{n} of their films', wrBest: 'Your highlights', wrBestSub: 'Your highest Letterboxd ratings', wrAvg: 'Average rating',
  wrTake: 'Your hot take', wrTakeUp: 'You liked it far more than most people', wrTakeDown: 'You liked it far less than most people', wrYou: 'You', wrCrowd: 'Others',
  wrStreak: 'Your longest streak', wrStreakN: '{n} days in a row', wrBinge: 'Your biggest day', wrBingeN: '{n} films on {d}', wrWeekday: 'Favourite day to watch', wrWeekdayN: '{n} films on a {d}', wrHabits: 'Your habits', wrLiked: 'liked', wrRewatched: 'rewatched', wrRated: 'rated',
  wrQuiz: 'Your quiz year', wrQuizSub: 'Faces you learned along the way', wrQuizMastered: 'actors mastered', wrQuizLevel: 'level', wrQuizAnswers: 'answers', wrQuizStreak: 'best streak (days)', wrEpsL: 'episodes', wrHoursL: 'hours',
  wrYouAre: 'You are', wrSave: 'Save image', wrCopy: 'Copy text', wrCopied: 'Copied', wrSaved: 'Image saved', wrShareFail: 'Could not create the image',
  wrHubSub: 'Pick a year and watch it as a story.', wrYear: 'Year', wrNoData: 'No films found for this year. Mark films as watched, or import them from Letterboxd.', wrFacts: 'In numbers', wrNeed: 'Wrapped needs a few watched films first.', wrSettings: 'Wrapped settings',
  wrBannerT: 'Your film year {y} is ready', wrBannerB: 'Hours, favourites and the actor you saw most. Take a look back.', wrBannerGo: 'Watch', wrBannerX: 'Hide',
  wrMon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  wrPAction: 'The adrenaline junkie', wrPThriller: 'The thrill seeker', wrPHorror: 'The horror hound', wrPComedy: 'The laugh track', wrPDrama: 'The emotional one', wrPScifi: 'The space traveller', wrPAnim: 'The kid at heart', wrPDoc: 'The curious mind', wrPRom: 'The romantic', wrPCrime: 'The armchair detective', wrPFantasy: 'The dreamer', wrPAdv: 'The explorer', wrPWar: 'The history buff', wrPMystery: 'The puzzle lover', wrPFamily: 'The family person', wrPWestern: 'The lone rider', wrPMarathon: 'The marathoner', wrPClassic: 'The classics hunter', wrPRewatch: 'The repeat offender', wrPDefault: 'The cinephile'
});
Object.assign(TX.de, {
  wrTitle: 'Wrapped', wrHead: 'Dein Filmjahr', wrIntroSub: 'Ein Rückblick auf alles, was du geschaut hast.', wrStart: 'Los', wrOpen: 'Dein Jahr ansehen', wrReplay: 'Nochmal ansehen', wrClose: 'Schließen',
  wrYouWatched: 'Du hast', wrFilmsDone: 'Filme geschaut', wrHours: '{h} Stunden vor der Leinwand', wrDays: 'Das sind {d} Tage ohne Pause.', wrEst: 'geschätzt für Filme ohne Laufzeit', wrEps: 'Dazu {n} Serienfolgen ({h} Std.)', wrTopShow: 'Meistgesehene Serie',
  wrBusiest: 'Dein Kinomonat', wrMonthN: '{n} Filme im {m}', wrGenres: 'Deine Genres', wrGenresSub: 'Wonach du am häufigsten gegriffen hast', wrDecade: 'Dein Jahrzehnt', wrDecadeSub: '{n} deiner Filme stammen aus den {d}ern', wrOldest: 'Ältester Film, den du gesehen hast',
  wrActor: 'Schauspieler deines Jahres', wrActorN: 'in {n} deiner Filme', wrActor2: 'Auch oft auf deinem Bildschirm', wrDirector: 'Regisseur deines Jahres', wrDirectorN: '{n} seiner Filme', wrBest: 'Deine Highlights', wrBestSub: 'Deine höchsten Letterboxd-Bewertungen', wrAvg: 'Durchschnittliche Bewertung',
  wrTake: 'Deine unpopuläre Meinung', wrTakeUp: 'Du mochtest ihn viel mehr als die meisten', wrTakeDown: 'Du mochtest ihn viel weniger als die meisten', wrYou: 'Du', wrCrowd: 'Andere',
  wrStreak: 'Deine längste Serie', wrStreakN: '{n} Tage in Folge', wrBinge: 'Dein größter Tag', wrBingeN: '{n} Filme am {d}', wrWeekday: 'Dein liebster Filmtag', wrWeekdayN: '{n} Filme an einem {d}', wrHabits: 'Deine Gewohnheiten', wrLiked: 'geliked', wrRewatched: 'wiedergesehen', wrRated: 'bewertet',
  wrQuiz: 'Dein Quiz-Jahr', wrQuizSub: 'Gesichter, die du unterwegs gelernt hast', wrQuizMastered: 'Schauspieler gemeistert', wrQuizLevel: 'Level', wrQuizAnswers: 'Antworten', wrQuizStreak: 'beste Serie (Tage)', wrEpsL: 'Serienfolgen', wrHoursL: 'Stunden',
  wrYouAre: 'Du bist', wrSave: 'Bild speichern', wrCopy: 'Text kopieren', wrCopied: 'Kopiert', wrSaved: 'Bild gespeichert', wrShareFail: 'Das Bild konnte nicht erstellt werden',
  wrHubSub: 'Wähle ein Jahr und sieh es dir als Story an.', wrYear: 'Jahr', wrNoData: 'Für dieses Jahr wurden keine Filme gefunden. Markiere Filme als gesehen oder importiere sie von Letterboxd.', wrFacts: 'In Zahlen', wrNeed: 'Für Wrapped braucht es zuerst ein paar gesehene Filme.', wrSettings: 'Wrapped-Einstellungen',
  wrBannerT: 'Dein Filmjahr {y} ist fertig', wrBannerB: 'Stunden, Favoriten und der Schauspieler, den du am häufigsten gesehen hast. Wirf einen Blick zurück.', wrBannerGo: 'Ansehen', wrBannerX: 'Ausblenden',
  wrMon: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  wrPAction: 'Der Adrenalin-Junkie', wrPThriller: 'Der Nervenkitzler', wrPHorror: 'Der Gruselfan', wrPComedy: 'Der Lachsack', wrPDrama: 'Der Gefühlsmensch', wrPScifi: 'Der Weltraumreisende', wrPAnim: 'Das Kind im Herzen', wrPDoc: 'Der Wissensdurstige', wrPRom: 'Der Romantiker', wrPCrime: 'Der Hobby-Detektiv', wrPFantasy: 'Der Träumer', wrPAdv: 'Der Entdecker', wrPWar: 'Der Geschichtsfreund', wrPMystery: 'Der Rätselfreund', wrPFamily: 'Der Familienmensch', wrPWestern: 'Der einsame Reiter', wrPMarathon: 'Der Marathonläufer', wrPClassic: 'Der Klassiker-Jäger', wrPRewatch: 'Der Wiederholungstäter', wrPDefault: 'Der Cineast'
});

/* ----- data ----- */
const WR = { eps: null, epsAt: 0, cache: {} };
const wrPersonaGenres = [[/action/i, 'wrPAction'], [/thriller|spannung/i, 'wrPThriller'], [/horror/i, 'wrPHorror'], [/com[eé]dy|kom[oö]die/i, 'wrPComedy'], [/drama/i, 'wrPDrama'], [/sci|science|fiction/i, 'wrPScifi'], [/anim|zeichentrick/i, 'wrPAnim'], [/doc|dokument/i, 'wrPDoc'], [/romance|liebe|romant/i, 'wrPRom'], [/crime|krimi|verbrechen/i, 'wrPCrime'], [/fantasy/i, 'wrPFantasy'], [/adventure|abenteuer/i, 'wrPAdv'], [/war|krieg/i, 'wrPWar'], [/mystery|mysteri/i, 'wrPMystery'], [/family|familie/i, 'wrPFamily'], [/western/i, 'wrPWestern']];
const wrDayKey = d => { const x = new Date(d); return x.getFullYear() * 10000 + (x.getMonth() + 1) * 100 + x.getDate(); };
const wrDayNum = d => { const x = new Date(d); return Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 864e5); };
const wrLoc = () => L === 'de' ? 'de-DE' : 'en-US';

/* every watched film with a date: library films (Jellyfin) joined with the Letterboxd diary */
async function wrAll() {
  const [pm] = await Promise.all([gPlayed(), (optOn('letterboxd') && lbUser()) ? lbLoad() : null]);
  const used = new Set(), all = [];
  for (const it of pm.Items || []) {
    const e = LB.n ? lbMatch(it) : null; if (e) used.add(e);
    const jd = ud(it).LastPlayedDate ? Date.parse(ud(it).LastPlayedDate) : 0;
    const d = e && e.date ? Date.parse(e.date + 'T12:00:00') : jd; if (d) all.push({ date: d, it, lb: e });
  }
  if (LB.n) for (const e of new Set(LB.names.values())) if (!used.has(e) && e.date) all.push({ date: Date.parse(e.date + 'T12:00:00'), lb: e });
  return all;
}
async function wrEpisodes() {
  if (WR.eps && Date.now() - WR.epsAt < 300000) return WR.eps; WR.epsAt = Date.now();
  WR.eps = await items({ IncludeItemTypes: 'Episode', Filters: 'IsPlayed', Fields: 'RunTimeTicks,SeriesName,SeriesId', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 8000, EnableImageTypes: 'Primary', ImageTypeLimit: 1 }).then(r => r.Items || []).catch(() => []);
  return WR.eps;
}
async function wrYears() {
  const all = await wrAll(); const n = {}; all.forEach(r => { const y = new Date(r.date).getFullYear(); n[y] = (n[y] || 0) + 1; });
  const years = Object.keys(n).map(Number).filter(y => y >= 1990 && n[y] >= 1).sort((a, b) => b - a); const cur = new Date().getFullYear();
  return { years, n, def: n[cur] >= 5 ? cur : (years.find(y => n[y] >= 5) || years[0] || cur) };
}
async function wrData(year) {
  if (WR.cache[year] && Date.now() - WR.cache[year].at < 300000) return WR.cache[year].d;
  const all = await wrAll(); const rows = all.filter(r => new Date(r.date).getFullYear() === year).sort((a, b) => a.date - b.date);
  const D = { year, rows, n: rows.length };
  if (!rows.length) return D;
  /* time */
  const known = rows.filter(r => r.it && r.it.RunTimeTicks).map(r => r.it.RunTimeTicks / 6e8); const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 105;
  D.minutes = Math.round(rows.reduce((a, r) => a + (r.it && r.it.RunTimeTicks ? r.it.RunTimeTicks / 6e8 : avg), 0)); D.est = rows.some(r => !(r.it && r.it.RunTimeTicks));
  /* shows */
  if (cfg('wrappedShows') !== false) {
    const eps = (await wrEpisodes()).filter(e => ud(e).LastPlayedDate && new Date(ud(e).LastPlayedDate).getFullYear() === year);
    if (eps.length) { const by = {}; eps.forEach(e => { const k = e.SeriesName || '?'; const s = by[k] || (by[k] = { name: k, id: e.SeriesId, n: 0, min: 0 }); s.n++; s.min += (e.RunTimeTicks || 0) / 6e8; });
      D.eps = { n: eps.length, min: Math.round(eps.reduce((a, e) => a + (e.RunTimeTicks || 0) / 6e8, 0)), top: Object.values(by).sort((a, b) => b.n - a.n)[0] }; }
  }
  /* genres, decades, months, weekdays */
  const gc = {}, dc = {}, mc = Array(12).fill(0), wc = Array(7).fill(0), dayc = {};
  rows.forEach(r => {
    (r.it && r.it.Genres || []).forEach(g => { gc[g] = (gc[g] || 0) + 1; });
    const y = r.it ? r.it.ProductionYear : (r.lb && r.lb.year); if (y) { const dec = Math.floor(y / 10) * 10; dc[dec] = (dc[dec] || 0) + 1; }
    const dt = new Date(r.date); mc[dt.getMonth()]++; wc[dt.getDay()]++; const k = wrDayKey(r.date); dayc[k] = (dayc[k] || 0) + 1;
  });
  D.genres = Object.entries(gc).sort((a, b) => b[1] - a[1]).slice(0, 5); D.months = mc; D.weekdays = wc;
  const dec = Object.entries(dc).sort((a, b) => b[1] - a[1])[0]; D.decade = dec ? { d: +dec[0], n: dec[1] } : null;
  const withYear = rows.filter(r => (r.it ? r.it.ProductionYear : (r.lb && r.lb.year))).map(r => ({ r, y: r.it ? r.it.ProductionYear : r.lb.year })).sort((a, b) => a.y - b.y);
  D.oldest = withYear[0] && withYear[0].y < 1990 ? withYear[0] : null; D.medianYear = withYear.length ? withYear[Math.floor(withYear.length / 2)].y : 0;
  /* streaks and the biggest day */
  const days = [...new Set(rows.map(r => wrDayNum(r.date)))].sort((a, b) => a - b); let best = { n: 0, from: 0 }, cur = { n: 0, from: 0 };
  days.forEach((d, i) => { if (i && d === days[i - 1] + 1) cur.n++; else cur = { n: 1, from: d }; if (cur.n > best.n) best = { n: cur.n, from: cur.from }; }); D.streak = best;
  const bd = Object.entries(dayc).sort((a, b) => b[1] - a[1])[0]; D.binge = bd && bd[1] >= 2 ? { n: bd[1], date: new Date(Math.floor(+bd[0] / 10000), Math.floor(+bd[0] / 100) % 100 - 1, +bd[0] % 100) } : null;
  /* cast and crew */
  const ac = {}, dirc = {};
  rows.forEach(r => (r.it && r.it.People || []).forEach((p, i) => {
    if (p.Type === 'Actor' && i < 12) { const a = ac[p.Name] || (ac[p.Name] = { name: p.Name, id: p.Id, img: p.PrimaryImageTag ? U(p.Id, 'Primary', 500, p.PrimaryImageTag) : '', n: 0, rows: [] }); a.n++; a.rows.push(r); }
    else if (p.Type === 'Director') { const a = dirc[p.Name] || (dirc[p.Name] = { name: p.Name, id: p.Id, img: p.PrimaryImageTag ? U(p.Id, 'Primary', 500, p.PrimaryImageTag) : '', n: 0, rows: [] }); a.n++; a.rows.push(r); }
  }));
  D.actors = Object.values(ac).filter(a => a.img).sort((a, b) => b.n - a.n).slice(0, 4); if (D.actors[0] && D.actors[0].n < 2) D.actors = [];
  D.director = Object.values(dirc).sort((a, b) => b.n - a.n)[0]; if (D.director && D.director.n < 2) D.director = null;
  /* ratings (Letterboxd) */
  const rated = rows.filter(r => r.lb && r.lb.rating); D.rated = rated.length;
  D.avg = rated.length ? rated.reduce((a, r) => a + r.lb.rating, 0) / rated.length : 0;
  D.best = rated.slice().sort((a, b) => b.lb.rating - a.lb.rating || (b.lb.liked ? 1 : 0) - (a.lb.liked ? 1 : 0) || ((b.it && b.it.CommunityRating) || 0) - ((a.it && a.it.CommunityRating) || 0)).slice(0, 5);
  const takes = rated.filter(r => r.it && r.it.CommunityRating).map(r => ({ r, diff: r.lb.rating * 2 - r.it.CommunityRating })).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)); D.take = takes[0] && Math.abs(takes[0].diff) >= 1.5 ? takes[0] : null;
  D.liked = rows.filter(r => r.lb && r.lb.liked).length; D.rewatch = rows.filter(r => r.lb && r.lb.rewatch).length;
  D.first = rows[0]; D.last = rows[rows.length - 1];
  /* quiz (only for the running year) */
  const st = GM.st; D.quiz = st && st.n > 0 && year === new Date().getFullYear() && cfg('quiz') ? { level: gLvl(st.xp), mastered: gMasteredN(st), n: st.n, streak: st.bestStreak, xp: st.xp } : null;
  /* a character */
  let p = 'wrPDefault'; const topG = D.genres[0] && D.genres[0][0];
  if (topG) { const m = wrPersonaGenres.find(x => x[0].test(topG)); if (m) p = m[1]; }
  if (D.rewatch >= 5) p = 'wrPRewatch'; if (D.medianYear && D.medianYear < 1995 && rows.length >= 5) p = 'wrPClassic'; if (D.streak.n >= 10) p = 'wrPMarathon';
  D.persona = p;
  WR.cache[year] = { d: D, at: Date.now() }; return D;
}
const wrFmt = (s, o) => String(s).replace(/\{(\w+)\}/g, (_, k) => o[k] != null ? o[k] : '');
const wrStars = v => '★ ' + Number(v).toFixed(1);
const wrPoster = r => r && r.it ? imgUrl(r.it, 'Primary', 320) : '';
const wrTitle = r => r.title || (r.it ? r.it.Name : (r.lb && r.lb.title)) || '';
const wrT = r => r.it ? r.it.Name : (r.lb ? r.lb.title : '');
function wrCount(el, n, ms) { const t0 = performance.now(); const tick = now => { const k = Math.min(1, (now - t0) / (ms || 1100)); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))).toLocaleString(wrLoc()); if (k < 1 && el.isConnected) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
const wrPosterEl = (r, cls) => h('div', Object.assign({ class: 'wr-p ' + (cls || '') , title: wrT(r) }, bg(wrPoster(r))), wrPoster(r) ? null : h('span', {}, wrT(r)));

/* ----- slides ----- */
function wrSlides(D) {
  const S = []; const mon = t('wrMon'); const hrs = Math.round(D.minutes / 60);
  const add = (hue, dur, build) => S.push({ hue, dur, build });
  add(['#7a0a12', '#14060a'], 5200, () => [h('div', { class: 'wr-kick' }, 'CINEMA WRAPPED'), h('div', { class: 'wr-huge' }, String(D.year)), h('p', { class: 'wr-sub' }, t('wrIntroSub'))]);
  add(['#3b1d8f', '#0d0a24'], 7000, () => { const n = h('span', { class: 'wr-num' }, '0'); setTimeout(() => wrCount(n, D.n), 250);
    return [h('div', { class: 'wr-kick' }, t('wrYouWatched')), h('div', { class: 'wr-huge' }, n), h('h2', { class: 'wr-h' }, t('wrFilmsDone')), h('p', { class: 'wr-sub' }, wrFmt(t('wrHours'), { h: hrs.toLocaleString(wrLoc()) }) + (D.est ? ' *' : '')), h('p', { class: 'wr-sub dim' }, wrFmt(t('wrDays'), { d: (D.minutes / 1440).toFixed(1) })),
      D.eps ? h('p', { class: 'wr-sub pill' }, wrFmt(t('wrEps'), { n: D.eps.n.toLocaleString(wrLoc()), h: Math.round(D.eps.min / 60) }) + (D.eps.top ? ' · ' + t('wrTopShow') + ': ' + D.eps.top.name : '')) : null,
      D.est ? h('p', { class: 'wr-foot' }, '* ' + t('wrEst')) : null]; });
  const mx = Math.max(...D.months); if (D.n >= 6 && mx > 1) { const bm = D.months.indexOf(mx);
    add(['#0a5c4a', '#06161a'], 7000, () => [h('div', { class: 'wr-kick' }, t('wrBusiest')), h('div', { class: 'wr-huge sm' }, mon[bm]), h('p', { class: 'wr-sub' }, wrFmt(t('wrMonthN'), { n: mx, m: mon[bm] })),
      h('div', { class: 'wr-months' }, D.months.map((v, i) => h('div', { class: 'wr-mcol' + (i === bm ? ' on' : '') }, h('i', { style: '--v:' + (v / mx * 100) + '%;--i:' + i }), h('small', {}, mon[i].slice(0, 3)))))]); }
  if (D.genres.length >= 2) add(['#8f2a1d', '#1a0a08'], 7000, () => { const m = D.genres[0][1];
    return [h('div', { class: 'wr-kick' }, t('wrGenres')), h('h2', { class: 'wr-h' }, D.genres[0][0]), h('p', { class: 'wr-sub' }, t('wrGenresSub')), h('div', { class: 'wr-bars' }, D.genres.map(([g, n], i) => h('div', { class: 'wr-brow' }, h('span', {}, g), h('div', {}, h('i', { style: '--w:' + (n / m * 100) + '%;--i:' + i })), h('b', {}, String(n)))))]; });
  if (D.decade) add(['#7a4d0a', '#170f05'], 7000, () => [h('div', { class: 'wr-kick' }, t('wrDecade')), h('div', { class: 'wr-huge' }, D.decade.d + 's'), h('p', { class: 'wr-sub' }, wrFmt(t('wrDecadeSub'), { n: D.decade.n, d: D.decade.d })),
    D.oldest ? h('div', { class: 'wr-old' }, wrPosterEl(D.oldest.r, 'md'), h('div', {}, h('small', {}, t('wrOldest')), h('b', {}, wrT(D.oldest.r)), h('span', {}, String(D.oldest.y)))) : null]);
  if (D.actors.length) add(['#1f4fa8', '#080f24'], 8000, () => { const a = D.actors[0]; return [h('div', { class: 'wr-kick' }, t('wrActor')), h('div', Object.assign({ class: 'wr-face' }, bg(a.img))), h('h2', { class: 'wr-h' }, a.name), h('p', { class: 'wr-sub' }, wrFmt(t('wrActorN'), { n: a.n })),
    h('div', { class: 'wr-prow' }, a.rows.slice(0, 5).map(r => wrPosterEl(r, 'sm'))),
    D.actors.length > 1 ? h('p', { class: 'wr-foot' }, t('wrActor2') + ': ' + D.actors.slice(1, 4).map(x => x.name).join(', ')) : null]; });
  if (D.director) add(['#5b1f7a', '#12081a'], 7000, () => [h('div', { class: 'wr-kick' }, t('wrDirector')), h('div', Object.assign({ class: 'wr-face' }, bg(D.director.img))), h('h2', { class: 'wr-h' }, D.director.name), h('p', { class: 'wr-sub' }, wrFmt(t('wrDirectorN'), { n: D.director.n })), h('div', { class: 'wr-prow' }, D.director.rows.slice(0, 5).map(r => wrPosterEl(r, 'sm')))]);
  if (D.best.length >= 3) add(['#9a7208', '#1a1204'], 8000, () => [h('div', { class: 'wr-kick' }, t('wrBest')), h('p', { class: 'wr-sub' }, t('wrBestSub')), h('div', { class: 'wr-top5' }, D.best.map((r, i) => h('div', { class: 'wr-t5', style: '--i:' + i }, h('em', {}, String(i + 1)), wrPosterEl(r, 'xs'), h('div', {}, h('b', {}, wrT(r)), h('span', {}, wrStars(r.lb.rating) + (r.lb.liked ? '  ♥' : ''))))))
    , h('p', { class: 'wr-foot' }, t('wrAvg') + ': ' + wrStars(D.avg) + ' · ' + D.rated + ' ' + t('wrRated'))]);
  if (D.take) add(['#a8321f', '#1a0805'], 8000, () => { const r = D.take.r, up = D.take.diff > 0; return [h('div', { class: 'wr-kick' }, t('wrTake')), wrPosterEl(r, 'lg'), h('h2', { class: 'wr-h sm' }, wrT(r)), h('p', { class: 'wr-sub' }, up ? t('wrTakeUp') : t('wrTakeDown')),
    h('div', { class: 'wr-vs' }, h('div', {}, h('small', {}, t('wrYou')), h('b', {}, wrStars(r.lb.rating))), h('span', {}, 'vs'), h('div', {}, h('small', {}, t('wrCrowd')), h('b', {}, wrStars(r.it.CommunityRating / 2))))]; });
  if (D.streak.n >= 2 || D.binge) add(['#0a4f7a', '#050f17'], 7500, () => { const out = [];
    if (D.streak.n < 2 && D.binge) out.push(h('div', { class: 'wr-kick' }, t('wrBinge')), h('div', { class: 'wr-huge' }, D.binge.n), h('p', { class: 'wr-sub' }, D.binge.date.toLocaleDateString(wrLoc(), { weekday: 'long', day: 'numeric', month: 'long' })));
    if (D.streak.n >= 2) out.push(h('div', { class: 'wr-kick' }, t('wrStreak')), h('div', { class: 'wr-huge' }, D.streak.n), h('p', { class: 'wr-sub' }, wrFmt(t('wrStreakN'), { n: D.streak.n }) + ' · ' + new Date(D.streak.from * 864e5 + 43200000).toLocaleDateString(wrLoc(), { day: 'numeric', month: 'short', timeZone: 'UTC' })));
    if (D.binge && D.streak.n >= 2) out.push(h('p', { class: 'wr-sub pill' }, t('wrBinge') + ': ' + wrFmt(t('wrBingeN'), { n: D.binge.n, d: D.binge.date.toLocaleDateString(wrLoc(), { day: 'numeric', month: 'long' }) })));
    const wd = D.weekdays, wm = Math.max(...wd), wi = wd.indexOf(wm); if (D.n >= 8) out.push(h('p', { class: 'wr-sub dim' }, t('wrWeekday') + ': ' + new Date(2024, 0, 7 + wi).toLocaleDateString(wrLoc(), { weekday: 'long' })));
    return out; });
  if (D.liked || D.rewatch) add(['#a8185e', '#18050f'], 6500, () => [h('div', { class: 'wr-kick' }, t('wrHabits')), h('div', { class: 'wr-stats3' }, [[D.rated, t('wrRated'), '★'], [D.liked, t('wrLiked'), '♥'], [D.rewatch, t('wrRewatched'), '↻']].filter(x => x[0]).map(([n, l, e], i) => h('div', { style: '--i:' + i }, h('em', {}, e), h('b', {}, String(n)), h('span', {}, l))))]);
  if (D.quiz) add(['#15803d', '#04140a'], 7000, () => [h('div', { class: 'wr-kick' }, t('wrQuiz')), h('p', { class: 'wr-sub' }, t('wrQuizSub')), h('div', { class: 'wr-stats3' }, [[D.quiz.mastered, t('wrQuizMastered')], [D.quiz.level, t('wrQuizLevel')], [D.quiz.n.toLocaleString(wrLoc()), t('wrQuizAnswers')]].map(([n, l], i) => h('div', { style: '--i:' + i }, h('b', {}, String(n)), h('span', {}, l)))), h('p', { class: 'wr-foot' }, t('wrQuizStreak') + ': ' + D.quiz.streak)]);
  add(['#7a0a12', '#14060a'], 0, () => wrSummary(D));
  return S;
}
const wrPersonaName = D => t(D.persona);
function wrSummary(D) {
  const posters = (D.best.length >= 3 ? D.best : D.rows.filter(r => r.it).slice().sort((a, b) => ((b.it.CommunityRating) || 0) - ((a.it.CommunityRating) || 0))).filter(r => r.it).slice(0, 4);
  const facts = [[D.n, t('wrFilmsDone').split(' ')[0]], [Math.round(D.minutes / 60), t('wrHoursL')], D.genres[0] ? [D.genres[0][0], t('wrGenres')] : null, D.actors[0] ? [D.actors[0].name, t('wrActor')] : null].filter(Boolean);
  return [h('div', { class: 'wr-kick' }, 'CINEMA WRAPPED ' + D.year), h('p', { class: 'wr-sub' }, t('wrYouAre')), h('h2', { class: 'wr-h' }, wrPersonaName(D)),
    h('div', { class: 'wr-sumf' }, facts.map(([v, l]) => h('div', {}, h('b', {}, String(v)), h('span', {}, l)))),
    posters.length ? h('div', { class: 'wr-prow' }, posters.map(r => wrPosterEl(r, 'sm'))) : null,
    h('div', { class: 'wr-acts' }, h('button', { class: 'btn white', onclick: e => { e.stopPropagation(); wrShare(D, e.currentTarget); } }, ic('download'), t('wrSave')), h('button', { class: 'btn grey', onclick: e => { e.stopPropagation(); wrCopy(D); } }, t('wrCopy')), h('button', { class: 'btn grey', onclick: e => { e.stopPropagation(); wrStory(D); } }, ic('refresh'), t('wrReplay'))) ];
}
function wrText(D) {
  const l = [' Cinema Wrapped ' + D.year, '', wrPersonaName(D), D.n + ' ' + t('wrFilmsDone') + ' · ' + Math.round(D.minutes / 60) + ' h'];
  if (D.genres[0]) l.push(t('wrGenres') + ': ' + D.genres.slice(0, 3).map(g => g[0]).join(', ')); if (D.actors[0]) l.push(t('wrActor') + ': ' + D.actors[0].name);
  if (D.best.length) l.push(t('wrBest') + ': ' + D.best.slice(0, 3).map(r => wrT(r)).join(', ')); return l.join('\n');
}
function wrCopy(D) { try { navigator.clipboard.writeText(wrText(D)); toast(t('wrCopied')); } catch (e) { toast(t('error')); } }
async function wrShare(D, btn) {
  try {
    const W = 1080, Hh = 1920, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
    const bgG = g.createLinearGradient(0, 0, W, Hh); bgG.addColorStop(0, '#8a0b14'); bgG.addColorStop(.55, '#1a0a14'); bgG.addColorStop(1, '#07070a'); g.fillStyle = bgG; g.fillRect(0, 0, W, Hh);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.arc(W * .85, 260, 380, 0, 7); g.fill();
    g.textAlign = 'center'; g.fillStyle = '#ffb3b8'; g.font = '700 38px Inter, sans-serif'; g.fillText('CINEMA WRAPPED', W / 2, 190);
    g.fillStyle = '#fff'; g.font = '900 250px Inter, sans-serif'; g.fillText(String(D.year), W / 2, 450);
    g.font = '600 46px Inter, sans-serif'; g.fillStyle = '#d6d6dc'; g.fillText(t('wrYouAre'), W / 2, 560);
    g.fillStyle = '#fff'; g.font = '800 78px Inter, sans-serif'; let nm = wrPersonaName(D); while (g.measureText(nm).width > W - 120 && g.font.indexOf('px') > 0) g.font = '800 ' + (parseInt(g.font.match(/(\d+)px/)[1]) - 4) + 'px Inter, sans-serif'; g.fillText(nm, W / 2, 660);
    const facts = [[String(D.n), t('wrFilmsDone').split(' ')[0]], [String(Math.round(D.minutes / 60)), 'h'], D.genres[0] ? [D.genres[0][0], t('wrGenres')] : null].filter(Boolean); const cw = (W - 160) / facts.length;
    facts.forEach(([v, lb], i) => { const x = 80 + cw * i + cw / 2; g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.roundRect(80 + cw * i + 8, 760, cw - 16, 190, 28); g.fill(); g.fillStyle = '#fff'; g.font = '800 ' + (v.length > 7 ? 44 : 78) + 'px Inter, sans-serif'; g.fillText(v, x, 860); g.fillStyle = '#b9b9c1'; g.font = '600 30px Inter, sans-serif'; g.fillText(lb, x, 915); });
    if (D.actors[0]) { g.fillStyle = '#b9b9c1'; g.font = '600 34px Inter, sans-serif'; g.fillText(t('wrActor'), W / 2, 1050); g.fillStyle = '#fff'; g.font = '800 60px Inter, sans-serif'; g.fillText(D.actors[0].name, W / 2, 1125); }
    const posters = (D.best.length >= 3 ? D.best : D.rows.filter(r => r.it).sort((a, b) => ((b.it.CommunityRating) || 0) - ((a.it.CommunityRating) || 0))).filter(r => r.it).slice(0, 4);
    const imgs = await Promise.all(posters.map(r => new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = imgUrl(r.it, 'Primary', 400); })));
    const pw = 220, ph = 330, gap = 24, tot = imgs.length * pw + (imgs.length - 1) * gap; imgs.forEach((im, i) => { if (!im) return; const x = (W - tot) / 2 + i * (pw + gap); g.save(); g.beginPath(); g.roundRect(x, 1250, pw, ph, 18); g.clip(); g.drawImage(im, x, 1250, pw, ph); g.restore(); });
    g.fillStyle = '#8d8d97'; g.font = '600 30px Inter, sans-serif'; g.fillText(BRAND, W / 2, 1780);
    const blob = await new Promise(res => c.toBlob(res, 'image/png')); if (!blob) throw new Error('png');
    const file = new File([blob], 'cinema-wrapped-' + D.year + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] }) && isMobile()) { await navigator.share({ files: [file], text: wrText(D) }); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 800); toast(t('wrSaved'));
  } catch (e) { if (!(e && e.name === 'AbortError')) toast(t('wrShareFail')); }
}

/* ----- the story player ----- */
function wrStory(D) {
  if (WR.close) WR.close(); document.documentElement.classList.add('wr-open');
  const slides = wrSlides(D); let i = 0; const auto = cfg('wrappedAuto') !== false; let paused = false;
  const segs = slides.map(() => h('i', {}, h('b')));
  const stage = h('div', { class: 'wr-stage' }); const layer = h('div', { class: 'wr-layer' });
  const pauseB = h('button', { class: 'wr-ib', 'aria-label': 'Pause', onclick: e => { e.stopPropagation(); setPause(!paused); } }, auto ? '' : '');
  const close = () => { document.removeEventListener('keydown', keys, true); layer.classList.remove('show'); if (WR.close === close) { WR.close = null; document.documentElement.classList.remove('wr-open'); } setTimeout(() => layer.remove(), 250); };
  const closeB = h('button', { class: 'wr-ib', 'aria-label': t('wrClose'), onclick: e => { e.stopPropagation(); close(); } }, ic('close'));
  const setPause = p => { paused = p; layer.classList.toggle('paused', p); pauseB.textContent = p ? '▶' : ''; };
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n)); const s = slides[i];
    layer.style.setProperty('--c1', s.hue[0]); layer.style.setProperty('--c2', s.hue[1]);
    segs.forEach((sg, k) => { sg.className = k < i ? 'done' : k === i ? 'cur' : ''; const b = sg.firstChild; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; if (k === i && auto && s.dur) b.style.animationDuration = s.dur + 'ms'; });
    layer.classList.toggle('manual', !auto || !s.dur);
    const el = h('div', { class: 'wr-slide' }, s.build()); stage.replaceChildren(el);
  }
  const next = () => { if (i < slides.length - 1) show(i + 1); }, back = () => show(i - 1);
  const keys = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); back(); } };
  WR.close = close; document.addEventListener('keydown', keys, true);
  segs.forEach((sg, k) => sg.addEventListener('animationend', e => { if (k === i && !paused) next(); }, true));
  layer.append(h('div', { class: 'wr-glow' }), h('div', { class: 'wr-top' }, h('div', { class: 'wr-segs' }, segs), h('div', { class: 'wr-tools' }, auto ? pauseB : null, closeB)), stage,
    h('button', { class: 'wr-zone l', 'aria-label': 'Back', onclick: back }), h('button', { class: 'wr-zone r', 'aria-label': 'Next', onclick: next }));
  getUI().append(layer); requestAnimationFrame(() => layer.classList.add('show')); show(0);
}

/* ----- the Wrapped page ----- */
async function wrappedView(page) {
  const wrap = h('div', { class: 'nf-page-pad wr-page' }); page.append(wrap);
  wrap.append(h('div', { class: 'spinner', style: 'margin:80px auto' }));
  const Y = await wrYears(); wrap.replaceChildren();
  wrap.append(h('div', { class: 'wr-hubh' }, h('div', {}, h('h1', {}, 'Cinema Wrapped'), h('p', { class: 'gm-secp' }, t('wrHubSub'))), h('a', { class: 'nf-chip', href: '#/c/settings?tab=features' }, ic('gear', 'ic-s'), t('wrSettings'))));
  if (!Y.years.length) { wrap.append(h('div', { class: 'nf-empty' }, t('wrNeed'))); return; }
  const host = h('div', {}); const chips = h('div', { class: 'nf-seasons' }, Y.years.slice(0, 8).map(y => h('button', { class: 'nf-chip' + (y === Y.def ? ' on' : ''), onclick: e => { $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw(y); } }, String(y))));
  wrap.append(chips, host);
  async function draw(y) {
    host.replaceChildren(h('div', { class: 'spinner', style: 'margin:60px auto' })); const D = await wrData(y);
    if (!D.n) { host.replaceChildren(h('div', { class: 'nf-empty' }, t('wrNoData'))); return; }
    const posters = (D.best.length >= 3 ? D.best : D.rows.filter(r => r.it).sort((a, b) => ((b.it.CommunityRating) || 0) - ((a.it.CommunityRating) || 0))).filter(r => r.it).slice(0, 5);
    const facts = [[D.n, t('wrFilmsDone').split(' ')[0]], [Math.round(D.minutes / 60), t('wrHoursL')], D.genres[0] ? [D.genres[0][0], t('wrGenres')] : null, D.actors[0] ? [D.actors[0].name, t('wrActor')] : null, D.streak.n >= 2 ? [D.streak.n, t('wrStreak')] : null, D.eps ? [D.eps.n, t('wrEpsL')] : null].filter(Boolean);
    host.replaceChildren(h('div', { class: 'wr-hero', onclick: () => wrStory(D) }, h('div', { class: 'wr-hero-in' }, h('small', {}, 'CINEMA WRAPPED'), h('div', { class: 'wr-hero-y' }, String(D.year)), h('p', {}, wrPersonaName(D)), h('button', { class: 'btn white' }, ic('play'), t('wrOpen'))), h('div', { class: 'wr-hero-p' }, posters.map((r, k) => wrPosterEl(r, 'sm r' + k)))),
      h('section', { class: 'gm-sec' }, h('h2', {}, t('wrFacts') + ' · ' + D.year), h('div', { class: 'gm-stats' }, facts.map(([v, l]) => h('div', { class: 'gm-tile2' }, h('b', { class: 'ell' }, String(v)), h('small', {}, l))))));
  }
  draw(Y.def);
}

/* ----- banner on the home page, in the weeks around the turn of the year ----- */
function wrBannerWanted() {
  const mode = cfg('wrappedBanner') || 'auto'; if (!cfg('wrapped') || TVM || mode === 'never') return 0;
  const d = new Date(), m = d.getMonth(), day = d.getDate(); const inSeason = (m === 10 && day >= 15) || m === 11 || m === 0;
  if (mode === 'auto' && !inSeason) return 0; return m === 0 ? d.getFullYear() - 1 : d.getFullYear();
}
function wrappedBanner(rows) {
  const y = wrBannerWanted(); if (!y) return; const always = cfg('wrappedBanner') === 'always'; if (!always && CFGU.wrSeen === y) return;
  const ph = h('div', { class: 'nf-rowph' }); rows.append(ph);
  wrData(y).then(D => {
    if (!ph.isConnected) return; if (D.n < 5) return ph.remove();
    const posters = D.rows.filter(r => r.it).sort((a, b) => ((b.it.CommunityRating) || 0) - ((a.it.CommunityRating) || 0)).slice(0, 4);
    ph.replaceWith(h('section', { class: 'wr-banner' }, h('div', { class: 'wr-bn-t' }, h('small', {}, 'CINEMA WRAPPED'), h('h2', {}, wrFmt(t('wrBannerT'), { y })), h('p', {}, t('wrBannerB')), h('div', { class: 'wr-bn-b' }, h('a', { class: 'btn white', href: '#/c/wrapped' }, ic('play'), t('wrBannerGo')), always ? null : h('button', { class: 'btn grey', onclick: e => { const s = e.currentTarget.closest('.wr-banner'); saveCfg({ wrSeen: y }); s.remove(); } }, t('wrBannerX')))),
      h('div', { class: 'wr-bn-p' }, posters.map(r => wrPosterEl(r, 'xs')))));
  }).catch(() => ph.remove());
}

/* ---------- feature registry (grouped, with dependencies), the settings gallery and the first-run setup ---------- */
Object.assign(TX.en, {
  setFeatures: 'Features', ftIntro: 'Everything Cinema can do, grouped by area. Switch features on or off, and open Options to fine-tune each one. Features that need a service show what is missing.', ftOn: 'On', ftOff: 'Off', ftLocked: 'Turned off by the server', ftNoSrv: 'Not enabled on the server', ftOptions: 'Options', ftOpen: 'Open', ftRunSetup: 'Run the setup again', ftGoServices: 'Set up', ftAll: 'All', ftManage: 'Manage', ftSearch: 'Search features…', ftShowOn: 'On', ftShowOff: 'Off', ftNeeds: 'Needs', ftReload: 'Applied after a reload', ftReloadDo: 'Reload now', ftNone: 'No feature matches.',
  ftGBrowse: 'Browsing and home page', ftGBrowseD: 'How the home page and the lists look and behave.', ftGDisc: 'Discover and requests', ftGDiscD: 'Find new films and shows, ask for them, and see what is on the way.', ftGMusic: 'Music', ftGMusicD: 'The music app, music discovery and music requests.', ftGLearn: 'Learn and look back', ftGLearnD: 'Games and statistics built from what you watched.', ftGPlay: 'Playback', ftGPlayD: 'The video player.', ftGLib: 'Library and connections', ftGLibD: 'Letterboxd, the archive and storage.', ftGMenu: 'Menu', ftGMenuD: 'Which pages appear in your navigation bar.',
  ftHeroN: 'Billboard', ftHeroD: 'Big rotating titles at the top of the home page, with logo, synopsis and a play button.', ftPeekN: 'Hover preview', ftPeekD: 'Rest the pointer on a poster to see a card with synopsis, rating and quick actions.', ftInfN: 'Endless home page', ftInfD: 'Keeps adding rows by genre, decade and more while you scroll.',
  ftHomeN: 'Smart home page', ftHomeD: 'Watched films get a check mark, new arrivals a label, and Discover rows are clearly tagged so you never mistake them for your library.', ftTnN: 'What shall we watch tonight?', ftTnD: 'Pick a time and a mood and get three films from your library, based on your taste, your watchlist and what is new.',
  ftMenuN: 'Item menu', ftMenuD: 'The three-dot menu on films and shows: edit metadata and images, mark as watched, archive and more.', ftPlugN: 'Plugin entries in the account menu', ftPlugD: 'Shows the entries other Jellyfin plugins add to the account menu.',
  ftDiscN: 'Discover', ftDiscD: 'Seerr recommendations with filters, genres and search. Request anything that is not in your library yet.', ftWlN: 'Watchlist', ftWlD: 'Your saved titles, optionally kept in sync with the Seerr watchlist.', ftReqN: 'Requests and downloads', ftReqD: 'Your Seerr requests with status steps and live download progress.', ftCalN: 'Release calendar', ftCalD: 'Upcoming releases and episodes from Radarr and Sonarr, with download and watch history.',
  ftRecoN: 'Personal recommendations', ftRecoD: 'Picked for you, more with your favourite actor or director, and a taste profile, based on what you watched.', ftSimN: 'Similar titles from Seerr', ftSimD: 'On detail pages, shows similar titles you do not own yet.', ftRateN: 'Rotten Tomatoes and IMDb', ftRateD: 'Critic and audience scores on detail pages.', ftInfoN: 'Media info', ftInfoD: 'File, video, audio and subtitle details on detail pages.',
  ftMusicN: 'Music app', ftMusicD: 'A Spotify style music app: library, playlists, mixes, queue and a full-screen player.', ftLyrN: 'Lyrics', ftLyrD: 'Synced lyrics in the music player.', ftMdN: 'Music discovery', ftMdD: 'New music from Aurral: recommendations, editorial playlists and charts.', ftMrN: 'Music requests', ftMrD: 'Request artists, albums and songs through Aurral.',
  ftQuizN: 'Film Quiz', ftQuizD: 'Learn the faces, names and films of the actors from the films you watched. Daily training, games, levels and badges.', ftWrN: 'Wrapped', ftWrD: 'Your viewing year as a story: hours, favourite genres, the actor you saw most, your highlights and more.',
  ftPlayerN: 'Cinema player', ftPlayerD: 'Our own video player: subtitle styling, skip intro, auto next episode and quality choice.',
  ftLbN: 'Letterboxd', ftLbD: 'Films you logged on Letterboxd count as watched here, with your ratings and dates. Read only.', ftArchN: 'Movie archive', ftArchD: 'Free up disk space but keep title, poster and details in an archive. Restore a movie any time.', ftStoreN: 'Storage assistant', ftStoreD: 'Free disk space, biggest movies and clean-up suggestions (administrators).',
  ftPagesN: 'Menu entries', ftPagesD: 'Choose which pages appear in your navigation bar. The pages stay reachable by address.', navMyList: 'My list', navBookmarks: 'Bookmarks', navLive: 'Live TV', navGames: 'Games',
  svcSeerr: 'Seerr', svcArr: 'Radarr or Sonarr', svcRadarr: 'Radarr', svcAurral: 'Aurral',
  qNew: 'New faces per day', qNewH: 'How many new actors the daily training introduces.', qGoal: 'Daily goal (XP)', qGoalH: 'The ring on the dashboard fills with XP. Reaching it keeps your streak alive.', qBlitz: 'Blitz round length', qAuto: 'Continue after a correct answer', qAutoH: 'Jump to the next question by itself. Turn off to read the film details first.',
  qMin: 'Which actors to learn', qMinH: 'Focus on actors you really know from several films.', qMinAll: 'Everyone', qMin2: '2+ films', qMin3: '3+ films', qLb: 'Include Letterboxd-only films', qLbH: 'Also learn the casts of films you only logged on Letterboxd. Needs Seerr; each cast is looked up once.', qGames: 'Games', qGamesH: 'Hide the games you do not like on the dashboard.',
  qReset: 'Reset progress', qResetH: 'Sets level, XP, streak and learning progress back to zero. This cannot be undone.', qResetDo: 'Reset', qResetOk: 'Progress reset', qResetAsk: 'Really reset all quiz progress?',
  wrBanner: 'Home page banner', wrBannerH: 'When the Wrapped card appears on the home page.', wrBSeason: 'Season', wrBAlways: 'Always', wrBNever: 'Never', wrShowsL: 'Include series', wrShowsH: 'Also count the episodes of series you watched.', wrAutoL: 'Advance automatically', wrAutoH: 'Slides move on by themselves. Otherwise tap or use the arrow keys.',
  calHistL: 'History in the calendar', calHistH: 'Show downloads and the films you watched in the calendar.',
  obWelcome: 'Welcome to Cinema', obWelcomeSub: 'A few quick questions to set everything up the way you like it. You can change all of it later in Settings.', obHi1: 'Browse', obHi1d: 'Billboard, previews and rows for every mood.', obHi2: 'Discover and request', obHi2d: 'Find what is next and ask for it.', obHi3: 'Listen', obHi3d: 'A music app with discovery and requests.', obHi4: 'Learn and look back', obHi4d: 'Film quiz and your year in review.',
  obStart: 'Let us go', obSkip: 'Skip for now', obNext: 'Next', obBack: 'Back', obFinish: 'Finish', obStep: 'Step {n} of {t}', obLook: 'Make it yours', obLookSub: 'Pick an accent colour and how large the posters should be.',
  obMenu: 'Your menu', obMenuSub: 'Which pages do you want in the navigation bar? Pages that need a service the server does not have are not listed.', obBrowse: 'Home page and browsing', obBrowseSub: 'Switch on what you like. The home page rows can be changed later in Settings, Home.', obSeenT: 'Watched and new films', obDetail: 'Detail pages and playback', obDetailSub: 'What you see on a film page and how videos play.',
  obMusic: 'Music', obMusicSub: 'How you want to use the music app.', obLearn: 'Learning, statistics and connections', obLearnSub: 'Pace for the film quiz, your Wrapped banner, and your Letterboxd account.', obQuizPace: 'Film quiz pace', obRelaxed: 'Relaxed', obRelaxedD: '5 new faces, 50 XP', obSteady: 'Steady', obSteadyD: '10 new faces, 100 XP', obKeen: 'Ambitious', obKeenD: '20 new faces, 200 XP', obLbT: 'Letterboxd username (optional)', obLbH: 'Films you watched there count as watched here and feed the quiz. Import the full list later in Settings, Connections.',
  obDone: 'All set', obDoneSub: 'Here is what you chose. You can change every part of it in Settings, Features.', obOnN: 'features on', obMenuN: 'menu entries'
});
Object.assign(TX.de, {
  setFeatures: 'Funktionen', ftIntro: 'Alles, was Cinema kann, nach Bereichen gruppiert. Schalte Funktionen ein oder aus und passe sie unter „Optionen" genau an. Funktionen, die einen Dienst brauchen, zeigen, was fehlt.', ftOn: 'An', ftOff: 'Aus', ftLocked: 'Vom Server ausgeschaltet', ftNoSrv: 'Auf dem Server nicht aktiviert', ftOptions: 'Optionen', ftOpen: 'Öffnen', ftRunSetup: 'Einrichtung erneut starten', ftGoServices: 'Einrichten', ftAll: 'Alle', ftManage: 'Verwalten', ftSearch: 'Funktionen suchen…', ftShowOn: 'An', ftShowOff: 'Aus', ftNeeds: 'Braucht', ftReload: 'Gilt nach dem Neuladen', ftReloadDo: 'Jetzt neu laden', ftNone: 'Keine Funktion passt.',
  ftGBrowse: 'Stöbern und Startseite', ftGBrowseD: 'Wie die Startseite und die Listen aussehen und sich verhalten.', ftGDisc: 'Entdecken und Anfragen', ftGDiscD: 'Neue Filme und Serien finden, anfragen und sehen, was unterwegs ist.', ftGMusic: 'Musik', ftGMusicD: 'Die Musik-App, Musik entdecken und Musik anfragen.', ftGLearn: 'Lernen und Rückblick', ftGLearnD: 'Spiele und Statistiken aus dem, was du geschaut hast.', ftGPlay: 'Wiedergabe', ftGPlayD: 'Der Videoplayer.', ftGLib: 'Bibliothek und Verbindungen', ftGLibD: 'Letterboxd, das Archiv und der Speicher.', ftGMenu: 'Menü', ftGMenuD: 'Welche Seiten in deiner Navigationsleiste erscheinen.',
  ftHeroN: 'Billboard', ftHeroD: 'Große, wechselnde Titel oben auf der Startseite mit Logo, Beschreibung und Abspielknopf.', ftPeekN: 'Hover-Vorschau', ftPeekD: 'Halte den Mauszeiger auf einem Poster, um eine Karte mit Handlung, Bewertung und Schnellaktionen zu sehen.', ftInfN: 'Endlose Startseite', ftInfD: 'Fügt beim Scrollen immer neue Reihen nach Genre, Jahrzehnt und mehr hinzu.',
  ftHomeN: 'Schlaue Startseite', ftHomeD: 'Gesehene Filme bekommen ein Häkchen, neue ein Label, und Entdecken-Reihen sind klar gekennzeichnet, damit du sie nie mit deiner Bibliothek verwechselst.', ftTnN: 'Was schauen wir heute?', ftTnD: 'Wähle Zeit und Stimmung und bekomm drei Filme aus deiner Bibliothek, passend zu Geschmack, Watchlist und Neuzugängen.',
  ftMenuN: 'Objektmenü', ftMenuD: 'Das Drei-Punkte-Menü bei Filmen und Serien: Metadaten und Bilder bearbeiten, als gesehen markieren, archivieren und mehr.', ftPlugN: 'Plugin-Einträge im Kontomenü', ftPlugD: 'Zeigt die Einträge, die andere Jellyfin-Plugins zum Kontomenü hinzufügen.',
  ftDiscN: 'Entdecken', ftDiscD: 'Seerr-Empfehlungen mit Filtern, Genres und Suche. Frage alles an, was noch nicht in deiner Bibliothek ist.', ftWlN: 'Watchlist', ftWlD: 'Deine gemerkten Titel, auf Wunsch mit der Seerr-Watchlist abgeglichen.', ftReqN: 'Anfragen und Downloads', ftReqD: 'Deine Seerr-Anfragen mit Status-Schritten und Download-Fortschritt in Echtzeit.', ftCalN: 'Veröffentlichungskalender', ftCalD: 'Kommende Filme und Folgen aus Radarr und Sonarr, mit Download- und Seh-Verlauf.',
  ftRecoN: 'Persönliche Empfehlungen', ftRecoD: 'Für dich ausgesucht, mehr mit deinem Lieblingsschauspieler oder -regisseur und ein Geschmacksprofil, basierend auf dem, was du geschaut hast.', ftSimN: 'Ähnliche Titel von Seerr', ftSimD: 'Zeigt auf Detailseiten ähnliche Titel, die du noch nicht besitzt.', ftRateN: 'Rotten Tomatoes und IMDb', ftRateD: 'Kritiker- und Publikumswertungen auf Detailseiten.', ftInfoN: 'Medieninfo', ftInfoD: 'Datei-, Video-, Audio- und Untertitel-Details auf Detailseiten.',
  ftMusicN: 'Musik-App', ftMusicD: 'Eine Musik-App im Spotify-Stil: Bibliothek, Playlists, Mixe, Warteschlange und ein Vollbild-Player.', ftLyrN: 'Songtexte', ftLyrD: 'Mitlaufende Songtexte im Musik-Player.', ftMdN: 'Musik entdecken', ftMdD: 'Neue Musik von Aurral: Empfehlungen, redaktionelle Playlists und Charts.', ftMrN: 'Musik anfragen', ftMrD: 'Frage Künstler, Alben und Songs über Aurral an.',
  ftQuizN: 'Filmwissen-Quiz', ftQuizD: 'Lerne Gesichter, Namen und Filme der Schauspieler aus den Filmen, die du gesehen hast. Tägliches Training, Spiele, Level und Abzeichen.', ftWrN: 'Wrapped', ftWrD: 'Dein Filmjahr als Story: Stunden, Lieblingsgenres, der meistgesehene Schauspieler, deine Highlights und mehr.',
  ftPlayerN: 'Cinema-Player', ftPlayerD: 'Unser eigener Videoplayer: Untertitel-Stil, Intro überspringen, automatisch nächste Folge und Qualitätswahl.',
  ftLbN: 'Letterboxd', ftLbD: 'Filme, die du auf Letterboxd eingetragen hast, gelten hier als gesehen, mit deinen Bewertungen und Daten. Nur lesend.', ftArchN: 'Filmarchiv', ftArchD: 'Speicherplatz freigeben, aber Titel, Poster und Details im Archiv behalten. Filme lassen sich jederzeit wiederherstellen.', ftStoreN: 'Speicher-Assistent', ftStoreD: 'Freier Speicherplatz, größte Filme und Aufräum-Vorschläge (Administratoren).',
  ftPagesN: 'Menüeinträge', ftPagesD: 'Wähle, welche Seiten in deiner Navigationsleiste erscheinen. Die Seiten bleiben über ihre Adresse erreichbar.', navMyList: 'Meine Liste', navBookmarks: 'Lesezeichen', navLive: 'Live-TV', navGames: 'Spiele',
  svcSeerr: 'Seerr', svcArr: 'Radarr oder Sonarr', svcRadarr: 'Radarr', svcAurral: 'Aurral',
  qNew: 'Neue Gesichter pro Tag', qNewH: 'Wie viele neue Schauspieler das tägliche Training einführt.', qGoal: 'Tagesziel (XP)', qGoalH: 'Der Ring im Dashboard füllt sich mit XP. Wer ihn erreicht, behält seine Serie.', qBlitz: 'Länge der Blitzrunde', qAuto: 'Nach richtiger Antwort weitergehen', qAutoH: 'Springt von selbst zur nächsten Frage. Ausschalten, um zuerst die Filmdetails zu lesen.',
  qMin: 'Welche Schauspieler lernen', qMinH: 'Konzentriere dich auf Schauspieler, die du aus mehreren Filmen wirklich kennst.', qMinAll: 'Alle', qMin2: 'ab 2 Filmen', qMin3: 'ab 3 Filmen', qLb: 'Filme nur von Letterboxd einbeziehen', qLbH: 'Lerne auch die Besetzung von Filmen, die du nur auf Letterboxd eingetragen hast. Braucht Seerr; jede Besetzung wird einmal nachgeschlagen.', qGames: 'Spiele', qGamesH: 'Blende Spiele aus, die du nicht magst.',
  qReset: 'Fortschritt zurücksetzen', qResetH: 'Setzt Level, XP, Serie und Lernstand auf null. Das lässt sich nicht rückgängig machen.', qResetDo: 'Zurücksetzen', qResetOk: 'Fortschritt zurückgesetzt', qResetAsk: 'Wirklich den gesamten Quiz-Fortschritt zurücksetzen?',
  wrBanner: 'Banner auf der Startseite', wrBannerH: 'Wann die Wrapped-Karte auf der Startseite erscheint.', wrBSeason: 'Saison', wrBAlways: 'Immer', wrBNever: 'Nie', wrShowsL: 'Serien einbeziehen', wrShowsH: 'Zähle auch die gesehenen Serienfolgen.', wrAutoL: 'Automatisch weiter', wrAutoH: 'Die Folien laufen von selbst weiter. Sonst tippen oder die Pfeiltasten nutzen.',
  calHistL: 'Verlauf im Kalender', calHistH: 'Zeige Downloads und die Filme, die du gesehen hast, im Kalender.',
  obWelcome: 'Willkommen bei Cinema', obWelcomeSub: 'Ein paar kurze Fragen, damit alles so eingerichtet ist, wie du es magst. Alles lässt sich später in den Einstellungen ändern.', obHi1: 'Stöbern', obHi1d: 'Billboard, Vorschau und Reihen für jede Stimmung.', obHi2: 'Entdecken und anfragen', obHi2d: 'Finde, was als Nächstes kommt, und frage es an.', obHi3: 'Hören', obHi3d: 'Eine Musik-App mit Entdecken und Anfragen.', obHi4: 'Lernen und Rückblick', obHi4d: 'Filmquiz und dein Jahresrückblick.',
  obStart: 'Los geht\'s', obSkip: 'Jetzt überspringen', obNext: 'Weiter', obBack: 'Zurück', obFinish: 'Fertig', obStep: 'Schritt {n} von {t}', obLook: 'Mach es zu deinem', obLookSub: 'Wähle eine Akzentfarbe und wie groß die Poster sein sollen.',
  obMenu: 'Dein Menü', obMenuSub: 'Welche Seiten sollen in der Navigationsleiste stehen? Seiten, die einen Dienst brauchen, den der Server nicht hat, werden nicht angezeigt.', obBrowse: 'Startseite und Stöbern', obBrowseSub: 'Schalte ein, was dir gefällt. Die Reihen der Startseite änderst du später unter Einstellungen, Startseite.', obSeenT: 'Gesehene und neue Filme', obDetail: 'Detailseiten und Wiedergabe', obDetailSub: 'Was du auf einer Filmseite siehst und wie Videos abgespielt werden.',
  obMusic: 'Musik', obMusicSub: 'Wie du die Musik-App nutzen möchtest.', obLearn: 'Lernen, Statistiken und Verbindungen', obLearnSub: 'Tempo für das Filmquiz, dein Wrapped-Banner und dein Letterboxd-Konto.', obQuizPace: 'Tempo beim Filmquiz', obRelaxed: 'Entspannt', obRelaxedD: '5 neue Gesichter, 50 XP', obSteady: 'Stetig', obSteadyD: '10 neue Gesichter, 100 XP', obKeen: 'Ehrgeizig', obKeenD: '20 neue Gesichter, 200 XP', obLbT: 'Letterboxd-Benutzername (optional)', obLbH: 'Filme, die du dort gesehen hast, gelten hier als gesehen und füttern das Quiz. Die vollständige Liste importierst du später unter Einstellungen, Verbindungen.',
  obDone: 'Alles bereit', obDoneSub: 'Das hast du gewählt. Du kannst jeden Teil davon unter Einstellungen, Funktionen ändern.', obOnN: 'Funktionen an', obMenuN: 'Menüeinträge'
});

/* ----- little illustrations for the cards ----- */
const fa = (cls, ...k) => h('div', { class: 'fa ' + cls }, k);
const faEmoji = (e, lines) => fa('fa-emo', h('span', {}, e), h('div', {}, (lines || [70, 45]).map(w => h('i', { style: 'width:' + w + 'px' }))));
const FART = {
  hero: () => fa('fa-hero', h('i', { class: 'l1' }), h('i', { class: 'l2' }), h('span', { class: 'pl' }), h('span', { class: 'gr' }), h('div', { class: 'dots' }, h('u', { class: 'on' }), h('u'), h('u'))),
  peek: () => fa('fa-peek', h('i'), h('i', { class: 'mid' }, h('b'), h('b'), h('b', { class: 'w' })), h('i')),
  inf: () => fa('fa-inf', [0, 1, 2].map(r => h('div', { style: '--o:' + (1 - r * .3) }, h('i'), h('i'), h('i'), h('i'), h('i')))),
  player: () => fa('fa-player', h('span', { class: 'big' }), h('span', { class: 'skip' }, 'Skip ›'), h('div', { class: 'bar' }, h('i'))),
  quiz: () => fa('fa-quiz', h('span', { class: 'face' }, '🙂'), h('div', {}, h('i'), h('i', { class: 'ok' }), h('i'), h('i'))),
  wrapped: () => fa('fa-wr', h('b', {}, '2026'), h('div', {}, [30, 55, 40, 85, 60, 35].map(v => h('i', { style: 'height:' + v + '%' })))),
  lb: () => fa('fa-lb', h('div', {}, h('i', { class: 'g' }), h('i', { class: 'o' }), h('i', { class: 'b' })), h('span', {}, '★★★★½')),
  arch: () => fa('fa-arch', h('i'), h('i'), h('i'), h('span', {}, '📦')),
  pages: () => fa('fa-pages', ['Home', 'Movies', 'Quiz', 'Music'].map((x, i) => h('i', { class: i === 2 ? 'on' : '' }, x))),
  tonight: () => fa('fa-tn', h('i', {}), h('i', { class: 'mid' }), h('i', {}), h('span', {}, '🍿')),
  home: () => fa('fa-home', h('div', {}, h('i', { class: 'a' }), h('i', { class: 'b' }), h('i', { class: 'c' })), h('em', {}, 'NEW'), h('u', {}, '✓')),
  disc: () => fa('fa-disc', h('div', {}, [0, 1, 2, 3].map(i => h('i', { class: i === 1 ? 'p' : '' }))), h('span', {}, '＋')),
  watch: () => fa('fa-watch', h('i', {}), h('i', { class: 'mid' }), h('i', {}), h('span', {}, '🔖')),
  req: () => fa('fa-req', h('div', {}, [1, 1, 0, 0].map((d, i) => h('i', { class: d ? 'on' : i === 2 ? 'cur' : '' }))), h('b', {}, h('i', { style: 'width:62%' }))),
  cal: () => fa('fa-cal', [...Array(14).keys()].map(i => h('i', { class: i === 9 ? 'on' : i === 4 || i === 12 ? 'dot' : '' }))),
  reco: () => faEmoji('✨', [90, 60, 40]),
  sim: () => faEmoji('🎞️', [80, 50]),
  rate: () => fa('fa-rate', h('span', { class: 'rt' }, '🍅 94%'), h('span', { class: 'im' }, 'IMDb 8.1')),
  info: () => fa('fa-info', [90, 70, 80, 55].map(w => h('div', {}, h('i', {}), h('b', { style: 'width:' + w + 'px' })))),
  menu: () => fa('fa-menu', h('i', {}), h('div', {}, h('b', {}), h('b', {}), h('b', {}))),
  plug: () => faEmoji('🧩', [70, 40]),
  music: () => fa('fa-music', h('span', { class: 'disc' }, '🎵'), h('div', {}, [40, 70, 55, 90, 45, 65].map(v => h('i', { style: 'height:' + v + '%' })))),
  lyr: () => fa('fa-lyr', [80, 110, 70, 95].map((w, i) => h('i', { class: i === 1 ? 'on' : '', style: 'width:' + w + 'px' }))),
  md: () => faEmoji('🎧', [90, 60]),
  mr: () => fa('fa-mr', h('span', {}, '🎶'), h('b', {}, '＋ Request')),
  store: () => fa('fa-store', h('div', {}, h('i', { style: 'width:78%' })), h('div', {}, h('i', { style: 'width:42%' })), h('span', {}, '💾'))
};

/* ----- services a feature may need ----- */
const SVC = { seerr: () => !!(C.status && C.status.seerr), arr: () => !!(C.status && (C.status.radarr || C.status.sonarr)), radarr: () => !!(C.status && C.status.radarr), aurral: () => !!(C.status && C.status.aurral) };
const SVC_N = { seerr: 'svcSeerr', arr: 'svcArr', radarr: 'svcRadarr', aurral: 'svcAurral' };
const adminHidden = k => (((C.status && C.status.defaults && C.status.defaults.hiddenNav) || '') + '').split(',').map(x => x.trim()).includes(k);
const GROUPS = [['browse', '', 'ftGBrowse', 'ftGBrowseD'], ['disc', '', 'ftGDisc', 'ftGDiscD'], ['music', '', 'ftGMusic', 'ftGMusicD'], ['learn', '', 'ftGLearn', 'ftGLearnD'], ['play', '▶', 'ftGPlay', 'ftGPlayD'], ['lib', '', 'ftGLib', 'ftGLibD'], ['menu', '', 'ftGMenu', 'ftGMenuD']];
const NAV_ENTRIES = [['discover', 'discover', 'discover'], ['watchlist', 'Watchlist', 'watchlist'], ['requests', 'requests', 'requests'], ['calendar', 'calendar', 'calendar'], ['music', 'music', 'music'], ['quiz', 'gTitle', 'quiz'], ['wrapped', 'wrTitle', 'wrapped'], ['tonight', 'tnTitle', 'tonight'], ['favorites', 'navMyList', null], ['bookmarks', 'navBookmarks', null], ['live', 'navLive', null], ['games', 'navGames', null]];
const navLabel = k => { const e = NAV_ENTRIES.find(x => x[0] === k); return e ? (TX[L][e[1]] || TX.en[e[1]] || e[1]) : k; };

/* ----- the catalogue: one entry per feature ----- */
function featCatalog(X) {
  const modeChips = () => h('div', { class: 'ft-chips' }, G_MODES.map(k => { const lbl = { blitz: t('gBlitz'), memory: t('gMemory'), type: t('gTypeM'), cast: t('gCastM'), cards: t('gCards') }[k]; const b = h('button', { class: 'nf-chip' + (gModeOn(k) ? ' on' : ''), onclick: async () => { const m = Object.assign({}, cfg('quizModes') || {}); m[k] = !gModeOn(k); await saveCfg({ quizModes: m }); b.classList.toggle('on', gModeOn(k)); } }, lbl); return b; }));
  const pageChips = () => h('div', { class: 'ft-chips' }, NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k)).map(([k]) => {
    const hidden = () => (CFGU.navHide || []).includes(k); const b = h('button', { class: 'nf-chip' + (hidden() ? '' : ' on'), onclick: async () => { const s = new Set(CFGU.navHide || []); hidden() ? s.delete(k) : s.add(k); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !hidden()); X.reload(); } }, navLabel(k)); return b; }));
  const lbOn = () => optOn('letterboxd');
  const T = (label, key, hint, needs) => { const r = X.toggle(label, key, hint); if (r && needs && !needs.every(n => SVC[n]())) r.classList.add('locked'); return r; };
  return [
    /* browsing and home */
    { id: 'hero', g: 'browse', ic: '🖼️', hue: '#e50914', name: 'ftHeroN', desc: 'ftHeroD', art: 'hero', key: 'hero', feat: 'hero', opts: () => [X.row(t('setHeroItems'), t('setHeroItemsHint'), X.seg([[4, '4'], [6, '6'], [8, '8'], [12, '12']], 'heroItems'), 'heroItems'), X.row(t('setHeroInterval'), t('setHeroIntervalHint'), X.seg([[6, '6 s'], [11, '11 s'], [16, '16 s'], [30, '30 s']], 'heroInterval'), 'heroInterval')] },
    { id: 'peek', g: 'browse', ic: '👁️', hue: '#0a84ff', name: 'ftPeekN', desc: 'ftPeekD', art: 'peek', key: 'peek', feat: 'peek', opts: () => [X.row(t('setPeekDelay'), t('setPeekDelayHint'), X.seg([[180, t('fast')], [320, t('normal')], [520, t('slow')]], 'peekDelay'), 'peekDelay')] },
    { id: 'inf', g: 'browse', ic: '♾️', hue: '#8b5cf6', name: 'ftInfN', desc: 'ftInfD', art: 'inf', key: 'infinite', feat: 'infiniteScroll' },
    { id: 'home', g: 'browse', ic: '✨', hue: '#5e5ce6', name: 'ftHomeN', desc: 'ftHomeD', art: 'home', on: () => cfg('homeSeen') !== 'off', tab: 'home', actionLbl: 'ftManage', opts: () => [X.row(t('rcSeenSet'), t('rcSeenHint'), X.seg([['badge', t('rcSeenBadge')], ['hide', t('rcSeenHide')], ['off', t('rcSeenOff')]], 'homeSeen'), 'homeSeen')] },
    { id: 'menu', g: 'browse', ic: '⋯', hue: '#8d8d97', name: 'ftMenuN', desc: 'ftMenuD', art: 'menu', key: 'itemMenu', feat: 'itemMenu' },
    { id: 'plug', g: 'browse', ic: '🧩', hue: '#64d2ff', name: 'ftPlugN', desc: 'ftPlugD', art: 'plug', key: 'pluginMenus', feat: 'pluginMenus' },
    /* discover and requests */
    { id: 'disc', g: 'disc', ic: '🔭', hue: '#bf5af2', name: 'ftDiscN', desc: 'ftDiscD', art: 'disc', nav: 'discover', feat: 'discover', needs: ['seerr'], open: '#/c/discover' },
    { id: 'reco', g: 'disc', ic: '✨', hue: '#ff6482', name: 'ftRecoN', desc: 'ftRecoD', art: 'reco', key: 'recommendations', feat: 'recommendations', needs: ['seerr'] },
    { id: 'wl', g: 'disc', ic: '🔖', hue: '#ffd60a', name: 'ftWlN', desc: 'ftWlD', art: 'watch', nav: 'watchlist', feat: 'watchlist', open: '#/c/watchlist', opts: () => [T(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint'), ['seerr'])] },
    { id: 'req', g: 'disc', ic: '📥', hue: '#0a84ff', name: 'ftReqN', desc: 'ftReqD', art: 'req', nav: 'requests', feat: 'requests', needs: ['seerr'], open: '#/c/requests' },
    { id: 'cal', g: 'disc', ic: '📅', hue: '#30d158', name: 'ftCalN', desc: 'ftCalD', art: 'cal', nav: 'calendar', feat: 'calendar', needs: ['arr'], open: '#/c/calendar', opts: () => [X.toggle(t('calHistL'), 'calendarHistory', t('calHistH'))] },
    { id: 'sim', g: 'disc', ic: '🎞️', hue: '#ff9f0a', name: 'ftSimN', desc: 'ftSimD', art: 'sim', key: 'seerrSimilar', feat: 'seerrSimilar', needs: ['seerr'] },
    { id: 'rate', g: 'disc', ic: '🍅', hue: '#ff453a', name: 'ftRateN', desc: 'ftRateD', art: 'rate', key: 'ratings', feat: 'ratings', needs: ['seerr'] },
    { id: 'info', g: 'disc', ic: '📋', hue: '#8e8e93', name: 'ftInfoN', desc: 'ftInfoD', art: 'info', key: 'mediaInfo', feat: 'mediaInfo' },
    /* music */
    { id: 'music', g: 'music', ic: '🎵', hue: '#1ed760', name: 'ftMusicN', desc: 'ftMusicD', art: 'music', nav: 'music', feat: 'music', open: '#/c/music' },
    { id: 'lyr', g: 'music', ic: '🎤', hue: '#ff375f', name: 'ftLyrN', desc: 'ftLyrD', art: 'lyr', key: 'musicLyrics', feat: 'musicLyrics', needsFeat: 'music' },
    { id: 'md', g: 'music', ic: '🎧', hue: '#bf5af2', name: 'ftMdN', desc: 'ftMdD', art: 'md', key: 'musicDiscovery', feat: 'musicDiscovery', needs: ['aurral'], needsFeat: 'music' },
    { id: 'mr', g: 'music', ic: '🎶', hue: '#64d2ff', name: 'ftMrN', desc: 'ftMrD', art: 'mr', key: 'musicRequests', feat: 'musicRequests', needs: ['aurral'], needsFeat: 'music' },
    /* learn and look back */
    { id: 'quiz', g: 'learn', ic: '🎭', hue: '#1ed760', name: 'ftQuizN', desc: 'ftQuizD', art: 'quiz', key: 'quiz', feat: 'quiz', open: '#/c/quiz', opts: () => [
      X.row(t('qNew'), t('qNewH'), X.seg([[5, '5'], [10, '10'], [20, '20'], [30, '30']], 'quizNew'), 'quizNew'), X.row(t('qGoal'), t('qGoalH'), X.seg([[50, '50'], [100, '100'], [200, '200'], [300, '300']], 'quizGoal'), 'quizGoal'),
      X.row(t('qBlitz'), '', X.seg([[30, '30 s'], [60, '60 s'], [90, '90 s']], 'quizBlitz'), 'quizBlitz'), X.toggle(t('qAuto'), 'quizAuto', t('qAutoH')),
      X.row(t('qMin'), t('qMinH'), X.seg([[1, t('qMinAll')], [2, t('qMin2')], [3, t('qMin3')]], 'quizMin'), 'quizMin'),
      lbOn() ? X.toggle(t('qLb'), 'quizLb', t('qLbH')) : null, X.row(t('qFamous'), t('qFamousH'), X.seg([['both', t('qFamousBoth')], ['seen', t('qFamousSeen')]], 'quizFamous'), 'quizFamous'), X.toggle(t('qScenes'), 'quizScenes', t('qScenesH')), X.row(t('qGames'), t('qGamesH'), modeChips()),
      X.row(t('qReset'), t('qResetH'), h('button', { class: 'btn grey', style: 'height:38px', onclick: async () => { if (!confirm(t('qResetAsk'))) return; await gLoad(); Object.assign(GM.st, gDef(), { ts: Date.now() }); await gFlush(); toast(t('qResetOk')); } }, t('qResetDo')))] },
    { id: 'wrapped', g: 'learn', ic: '🎬', hue: '#ff2d92', name: 'ftWrN', desc: 'ftWrD', art: 'wrapped', key: 'wrapped', feat: 'wrapped', open: '#/c/wrapped', opts: () => [
      X.row(t('wrBanner'), t('wrBannerH'), X.seg([['auto', t('wrBSeason')], ['always', t('wrBAlways')], ['never', t('wrBNever')]], 'wrappedBanner'), 'wrappedBanner'), X.toggle(t('wrShowsL'), 'wrappedShows', t('wrShowsH')), X.toggle(t('wrAutoL'), 'wrappedAuto', t('wrAutoH'))] },
    /* playback */
    { id: 'player', g: 'play', ic: '▶️', hue: '#ff6a3d', name: 'ftPlayerN', desc: 'ftPlayerD', art: 'player', feat: 'ownPlayer', on: () => playerMode() === 'own', tab: 'player', opts: () => [
      X.row(t('setDevPlayer'), t('setDevPlayerHint'), h('div', { class: 'pl-seg set-seg' }, [['own', t('plOwn')], ['native', t('plStd')]].map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); X.reload(); } }, l)))),
      X.toggle(t('plAutoNext'), 'pl_autoNext', t('plAutoNextHint')), X.toggle(t('plAutoSkip'), 'pl_autoSkip', t('plAutoSkipHint')), h('p', { class: 'set-hint' }, h('a', { href: '#', onclick: e => { e.preventDefault(); X.go('player'); } }, t('setPlayer') + ' ›'))] },
    /* library and connections */
    { id: 'lb', g: 'lib', ic: '🟢', hue: '#00b020', name: 'ftLbN', desc: 'ftLbD', art: 'lb', avail: lbOn, on: () => lbOn() && !!lbUser(), tab: 'services', actionLbl: 'ftGoServices' },
    { id: 'arch', g: 'lib', ic: '📦', hue: '#f5b301', name: 'ftArchN', desc: 'ftArchD', art: 'arch', avail: () => optOn('archive'), on: () => optOn('archive'), open: '#/c/archive' },
    { id: 'store', g: 'lib', ic: '💾', hue: '#64d2ff', name: 'ftStoreN', desc: 'ftStoreD', art: 'store', avail: () => !!(C.status && C.status.admin) && feat('storage'), on: () => true, noPill: true, open: '#/c/storage' },
    /* menu */
    { id: 'pages', g: 'menu', ic: '🧭', hue: '#34c759', name: 'ftPagesN', desc: 'ftPagesD', art: 'pages', on: () => true, noPill: true, startOpen: true, opts: () => [pageChips(), h('p', { class: 'set-hint' }, t('ftReload') + ' · ', h('a', { href: '#', onclick: e => { e.preventDefault(); location.reload(); } }, t('ftReloadDo')))] }
  ];
}
const FT = { open: new Set(), q: '', f: 'all' };
const ftNeedsOk = f => (f.needs || []).every(n => SVC[n]()) && (!f.needsFeat || feat(f.needsFeat));
function ftAvail(f) { const base = f.avail ? f.avail() : (!f.feat || feat(f.feat)); return base && !(f.nav && adminHidden(f.nav)) && ftNeedsOk(f); }
function ftOn(f) { return ftAvail(f) && (f.key ? !!cfg(f.key) : f.nav ? navOn(f.nav) : (f.on ? f.on() : true)); }
function ftLockText(f) { const miss = (f.needs || []).filter(n => !SVC[n]()); if (miss.length) return t('ftNeeds') + ' ' + miss.map(n => t(SVC_N[n])).join(', '); if (f.needsFeat && !feat(f.needsFeat)) return t('ftLocked'); return f.avail ? t('ftNoSrv') : t('ftLocked'); }
/* the switch of one feature: a user setting or a menu entry */
function ftSwitch(f, onset) {
  if (f.key) { const b = h('button', { class: 'set-switch' + (cfg(f.key) ? ' on' : ''), role: 'switch', onclick: async () => { const v = !cfg(f.key); b.classList.toggle('on', v); await saveCfg({ [f.key]: v }); onset && onset(v); } }, h('i')); return b; }
  if (f.nav) { const b = h('button', { class: 'set-switch' + (navOn(f.nav) ? ' on' : ''), role: 'switch', onclick: async () => { const s = new Set(CFGU.navHide || []); const nowOn = navOn(f.nav); nowOn ? s.add(f.nav) : s.delete(f.nav); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !nowOn); onset && onset(!nowOn); } }, h('i')); return b; }
  return null;
}
function featuresTab(X) {
  const cat = featCatalog(X); const root = h('div', {});
  const needs = f => (f.needs || []).length ? h('div', { class: 'ft-needs' }, f.needs.map(n => h('i', { class: SVC[n]() ? 'ok' : 'bad' }, (SVC[n]() ? ' ' : ' ') + t(SVC_N[n])))) : null;
  function apply() {
    let any = false;
    $$('.ft-card', root).forEach(c => { const hit = (!FT.q || c.dataset.s.includes(FT.q)) && (FT.f === 'all' || (FT.f === 'on') === c.classList.contains('on')); c.hidden = !hit; if (hit) any = true; });
    $$('.ft-sec', root).forEach(s => { s.hidden = !$$('.ft-card:not([hidden])', s).length; }); const n = $('.ft-none', root); if (n) n.hidden = any;
  }
  const q = h('input', { type: 'search', class: 'ft-search', placeholder: t('ftSearch'), value: FT.q, oninput: e => { FT.q = e.target.value.trim().toLowerCase(); apply(); } });
  const chips = h('div', { class: 'ft-fchips' }, [['all', t('ftAll')], ['on', t('ftShowOn')], ['off', t('ftShowOff')]].map(([v, l]) => h('button', { class: 'nf-chip' + (FT.f === v ? ' on' : ''), onclick: e => { FT.f = v; $$('.nf-chip', chips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); apply(); } }, l)));
  root.append(h('div', { class: 'ft-head' }, h('p', {}, t('ftIntro')), h('button', { class: 'btn grey', style: 'height:38px', onclick: () => onboardWizard(true) }, ic('refresh', 'ic-s'), t('ftRunSetup'))), h('div', { class: 'ft-bar' }, h('div', { class: 'dc-q' }, ic('search', 'ic-s'), q), chips));
  GROUPS.forEach(([id, e, name, desc]) => {
    const list = cat.filter(f => f.g === id); if (!list.length) return; const grid = h('div', { class: 'ft-grid' }); list.forEach(f => grid.append(ftCard(f, X, needs)));
    root.append(h('section', { class: 'ft-sec' }, h('div', { class: 'ft-sh' }, h('div', {}, h('h3', {}, t(name)), h('p', {}, t(desc)))), grid));
  });
  root.append(h('div', { class: 'nf-empty ft-none', hidden: true }, t('ftNone'))); apply(); return [root];
}
function ftCard(f, X, needsEl) {
  const avail = ftAvail(f); const openNow = avail && (FT.open.has(f.id) || (f.startOpen && !FT.open.has('-' + f.id)));
  const card = h('div', { class: 'ft-card' + (ftOn(f) ? ' on' : '') + (avail ? '' : ' locked') + (openNow ? ' open' : ''), style: '--hue:' + f.hue, 'data-s': (t(f.name) + ' ' + t(f.desc)).toLowerCase() });
  const pill = h('span', { class: 'ft-pill' });
  const setPill = () => { pill.textContent = !avail ? ftLockText(f) : f.noPill ? '' : ftOn(f) ? t('ftOn') : t('ftOff'); card.classList.toggle('on', ftOn(f)); }; setPill();
  const foot = h('div', { class: 'ft-foot' });
  if (avail) { const sw = ftSwitch(f, () => setPill()); if (sw) foot.append(sw); }
  const opts = avail && f.opts ? f.opts() : null;
  if (opts) foot.append(h('button', { class: 'ft-more', onclick: () => { const open = !card.classList.contains('open'); card.classList.toggle('open', open); open ? (FT.open.add(f.id), FT.open.delete('-' + f.id)) : (FT.open.delete(f.id), FT.open.add('-' + f.id)); } }, t('ftOptions'), ic('down', 'ic-s')));
  if (avail && f.tab) foot.append(h('button', { class: 'ft-more', onclick: () => X.go(f.tab) }, t(f.actionLbl || 'ftManage'), ic('right', 'ic-s')));
  if (avail && f.open) foot.append(h('a', { class: 'ft-more go', href: f.open }, t('ftOpen'), ic('right', 'ic-s')));
  card.append(h('div', { class: 'ft-art' }, FART[f.art](), h('span', { class: 'ft-ic' }, f.ic)), h('div', { class: 'ft-body' }, h('div', { class: 'ft-title' }, h('b', {}, t(f.name)), pill), h('p', {}, t(f.desc)), needsEl ? needsEl(f) : null, foot), ...(opts ? [h('div', { class: 'ft-opts' }, opts.filter(Boolean))] : []));
  return card;
}

/* ----- first-run setup: walks through everything, step by step ----- */
function maybeOnboard() {
  try { if (TVM || CFGU.onb === 1 || devGet('noonb') === '1' || $('.cxd-bg')) return; if (/video|login|wizard/.test(location.hash)) return; } catch (e) { return; }
  onboardWizard(false);
}
function onboardWizard(manual) {
  if ($('.ob-dlg')) return; const d = cxDialog('', { wide: false }); d.el.classList.add('ob-dlg'); let step = 0; saveCfg({ onb: 1 });
  const X = { sw: null, row: () => null, seg: () => null, toggle: () => null, go: () => { }, reload: () => { } };
  const cat = () => featCatalog(X); const find = ids => cat().filter(f => ids.includes(f.id) && ftAvail(f));
  const rowOf = f => { const sw = ftSwitch(f, v => row.classList.toggle('on', v)); const row = h('div', { class: 'ob-f' + (ftOn(f) ? ' on' : ''), style: '--hue:' + f.hue }, h('div', { class: 'ob-fa' }, FART[f.art](), h('span', { class: 'ft-ic' }, f.ic)), h('div', { class: 'ob-ft' }, h('b', {}, t(f.name)), h('small', {}, t(f.desc))), sw); return row; };
  const seg = (opts, key) => h('div', { class: 'pl-seg set-seg' }, opts.map(([v, l]) => h('button', { class: String(cfg(key)) === String(v) ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ [key]: v }); } }, l)));
  const lab = txt => h('div', { class: 'ob-lab' }, txt);
  /* every step is built when it is shown and skipped when the server offers nothing there */
  const STEPS = {
    welcome: () => ({ first: true, body: h('div', { class: 'ob-body ob-welcome' }, h('div', { class: 'ob-logo' }, BRAND.toUpperCase()), h('h2', {}, t('obWelcome')), h('p', { class: 'ob-sub' }, t('obWelcomeSub')), h('div', { class: 'ob-hi' }, [[null, 'obHi1', 'obHi1d', true], [null, 'obHi2', 'obHi2d', feat('discover') || feat('requests')], [null, 'obHi3', 'obHi3d', feat('music')], [null, 'obHi4', 'obHi4d', feat('quiz') || feat('wrapped')]].filter(x => x[3]).map(([e, a, b]) => h('div', {}, h('div', {}, h('b', {}, t(a)), h('small', {}, t(b))))))) }),
    look: () => {
      const SZ = { s: .8, m: 1, l: 1.25 }; const prev = h('div', { class: 'ob-prev' }, [0, 1, 2, 3].map(i => h('div', { class: 'ob-pc', style: '--h:' + (i * 70 + 10) }, h('i')))); prev.style.setProperty('--sz', SZ[cfg('cardSize')] || 1);
      const sw = h('div', { class: 'set-sw ob-sw' }, ['#e50914', '#ff6a3d', '#f5b301', '#34c759', '#0a84ff', '#8b5cf6', '#ff2d92', '#ffffff'].map(c => h('button', { style: 'background:' + c, class: cfg('accent') === c ? 'on' : '', 'aria-label': c, onclick: async e => { await saveCfg({ accent: c }); $$('button', sw).forEach(b => b.classList.toggle('on', b === e.currentTarget)); } })));
      const sz = h('div', { class: 'pl-seg set-seg' }, [['s', t('small')], ['m', t('medium')], ['l', t('large')]].map(([v, l]) => h('button', { class: cfg('cardSize') === v ? 'on' : '', onclick: async e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); await saveCfg({ cardSize: v }); prev.style.setProperty('--sz', SZ[v]); } }, l)));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obLook')), h('p', { class: 'ob-sub' }, t('obLookSub')), lab(t('accent')), sw, lab(t('setCardSize')), sz, prev) };
    },
    menu: () => {
      const entries = NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k) && !((k === 'discover' || k === 'requests') && !SVC.seerr()) && !(k === 'calendar' && !SVC.arr())); if (entries.length < 2) return null; const hidden = k => (CFGU.navHide || []).includes(k);
      const chips = h('div', { class: 'ob-chips' }, entries.map(([k]) => { const b = h('button', { class: 'nf-chip' + (hidden(k) ? '' : ' on'), onclick: async () => { const s = new Set(CFGU.navHide || []); hidden(k) ? s.delete(k) : s.add(k); await saveCfg({ navHide: s.size ? [...s] : null }); b.classList.toggle('on', !hidden(k)); } }, navLabel(k)); return b; }));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obMenu')), h('p', { class: 'ob-sub' }, t('obMenuSub')), chips) };
    },
    browse: () => {
      const fs = find(['hero', 'peek', 'inf', 'tonight', 'reco']); const seen = h('div', { class: 'ob-seen' }, lab(t('obSeenT')), seg([['badge', t('rcSeenBadge')], ['hide', t('rcSeenHide')], ['off', t('rcSeenOff')]], 'homeSeen'), h('small', {}, t('rcSeenHint')));
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obBrowse')), h('p', { class: 'ob-sub' }, t('obBrowseSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf)), seen) };
    },
    detail: () => {
      const fs = find(['sim', 'rate', 'info', 'menu', 'plug']); const pl = feat('ownPlayer') ? h('div', { class: 'ob-seen' }, lab(t('setDevPlayer')), h('div', { class: 'pl-seg set-seg' }, [['own', t('plOwn')], ['native', t('plStd')]].map(([v, l]) => h('button', { class: playerMode() === v ? 'on' : '', onclick: e => { $$('button', e.currentTarget.parentElement).forEach(b => b.classList.remove('on')); e.currentTarget.classList.add('on'); devSet('player', v); } }, l))), h('small', {}, t('setDevPlayerHint'))) : null; if (!fs.length && !pl) return null;
      return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obDetail')), h('p', { class: 'ob-sub' }, t('obDetailSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf)), pl) };
    },
    music: () => { if (!feat('music') || adminHidden('music')) return null; const fs = find(['lyr', 'md', 'mr']); if (!fs.length) return null; return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obMusic')), h('p', { class: 'ob-sub' }, t('obMusicSub')), h('div', { class: 'ob-feats' }, fs.map(rowOf))) }; },
    learn: () => {
      const parts = [];
      if (cfg('quiz')) { const presets = [['obRelaxed', 'obRelaxedD', 5, 50, ''], ['obSteady', 'obSteadyD', 10, 100, ''], ['obKeen', 'obKeenD', 20, 200, '']]; const cur = () => presets.findIndex(p => +cfg('quizNew') === p[2] && +cfg('quizGoal') === p[3]);
        const cards = h('div', { class: 'ob-presets' }, presets.map(([a, b, n, g, e], i) => h('button', { class: 'ob-preset' + (cur() === i ? ' on' : ''), onclick: async () => { await saveCfg({ quizNew: n, quizGoal: g }); $$('.ob-preset', cards).forEach((x, k) => x.classList.toggle('on', k === i)); } }, h('b', {}, t(a)), h('small', {}, t(b))))); parts.push(lab(t('obQuizPace')), cards); }
      if (cfg('wrapped')) parts.push(lab(t('wrBanner')), seg([['auto', t('wrBSeason')], ['always', t('wrBAlways')], ['never', t('wrBNever')]], 'wrappedBanner'));
      if (optOn('letterboxd')) parts.push(h('div', { class: 'ob-lb' }, lab(t('obLbT')), h('input', { type: 'text', value: lbUser(), placeholder: 'username', maxlength: 40, onchange: async e => { const v = e.target.value.trim().replace(/^@/, '').replace(/^https?:\/\/letterboxd\.com\//, '').replace(/\/.*$/, ''); await saveCfg({ lbUser: v || null }); if (v) lbSync(true); } }), h('small', {}, t('obLbH'))));
      if (!parts.length) return null; return { body: h('div', { class: 'ob-body' }, h('h2', {}, t('obLearn')), h('p', { class: 'ob-sub' }, t('obLearnSub')), parts) };
    },
    done: () => {
      const feats = cat().filter(f => ftOn(f) && !f.noPill).length; const menu = NAV_ENTRIES.filter(([k, , f]) => (!f || feat(f)) && !adminHidden(k) && navOn(k)).length;
      return { last: true, body: h('div', { class: 'ob-body ob-welcome' }, h('div', { class: 'ob-big' }, ic('check')), h('h2', {}, t('obDone')), h('p', { class: 'ob-sub' }, t('obDoneSub')), h('div', { class: 'ob-sum' }, h('div', {}, h('b', {}, String(feats)), h('span', {}, t('obOnN'))), h('div', {}, h('b', {}, String(menu)), h('span', {}, t('obMenuN'))))) };
    }
  };
  const ORDER = ['welcome', 'look', 'menu', 'browse', 'detail', 'music', 'learn', 'done'];
  function draw() {
    const list = ORDER.map(k => STEPS[k]()).filter(Boolean); step = Math.min(step, list.length - 1); const cur = list[step]; d.setTitle(''); d.foot.replaceChildren();
    const dots = h('div', { class: 'ob-dots' }, list.map((_, i) => h('i', { class: i === step ? 'on' : i < step ? 'done' : '' })));
    const back = step ? h('button', { class: 'btn grey', onclick: () => { step--; draw(); } }, t('obBack')) : null;
    if (cur.first) d.foot.append(h('button', { class: 'btn grey', onclick: () => d.close() }, t('obSkip')), h('button', { class: 'btn white', onclick: () => { step++; draw(); } }, t('obStart')));
    else if (cur.last) d.foot.append(back, h('button', { class: 'btn white', onclick: () => d.close() }, ic('check'), t('obFinish')));
    else d.foot.append(back, h('button', { class: 'btn white', onclick: () => { step++; draw(); } }, t('obNext')));
    d.body.replaceChildren(dots, cur.body); d.body.classList.add('ob-wrap'); d.body.scrollTop = 0;
    d.foot.prepend(h('span', { class: 'ob-step' }, t('obStep').replace('{n}', step + 1).replace('{t}', list.length)));
  }
  draw();
}

/* ---------- Storage assistant: free space, biggest files, clean-up suggestions (administrators) ---------- */
Object.assign(TX.en, {
  stTitle: 'Storage', stIntro: 'See how full your disks are, which movies take the most space, and which ones you could archive.', stAdminOnly: 'Only administrators can open the storage assistant.', stLoading: 'Measuring your library…',
  stDisks: 'Disks', stNoDisks: 'No disk information available. Connect Radarr or Sonarr, or use Jellyfin 10.10 or newer.', stFree: 'free of', stUsed: 'used', stLibrary: 'Movie library', stFilms: 'movies', stTotal: 'Total size', stAvg: 'Average per movie', stBiggest: 'Biggest movie', stPace: 'Growth', stPerMonth: 'per month (last 3 months)', stFull: 'At this pace the fullest disk is full in about {n} months.', stFullNow: 'Less than a month of space is left at this pace.',
  stRes: 'By resolution', stClean: 'Clean-up suggestions', stBig: 'Biggest files', stCleanHint: 'Movies you already watched, rarely watched, badly rated or very large. Favourites and watchlist titles are never suggested.', stNone: 'Nothing to suggest. Your library looks tidy.',
  stSelected: '{n} selected', stFrees: 'frees up {s}', stArchive: 'Archive selected…', stSelAll: 'Select all', stSelNone: 'Clear', stBulkTitle: 'Archive {n} movies', stBulkIntro: 'For each movie the details and pictures are saved in the archive, then the file is deleted and the movie leaves your library.', stBulkGo: 'Archive and free {s}', stBulkRun: 'Archiving…', stBulkDone: '{n} movies archived, {s} freed.', stBulkFail: '{n} failed',
  stRSeen: 'Watched', stRLow: 'Low rating', stRBig: 'Very large', stRStale: 'Never watched, added over a year ago', stROld: 'Not watched for a long time', stSortSize: 'Size', stSortEff: 'GB per hour', stGbH: 'GB/h', stSeries: 'Series are not part of this overview yet.', stWatchedOn: 'watched', stAdded: 'added', stOpen: 'Open'
});
Object.assign(TX.de, {
  stTitle: 'Speicher', stIntro: 'Sieh, wie voll deine Festplatten sind, welche Filme am meisten Platz brauchen und welche du archivieren könntest.', stAdminOnly: 'Nur Administratoren können den Speicher-Assistenten öffnen.', stLoading: 'Vermesse deine Bibliothek…',
  stDisks: 'Festplatten', stNoDisks: 'Keine Festplatten-Informationen verfügbar. Verbinde Radarr oder Sonarr, oder nutze Jellyfin 10.10 oder neuer.', stFree: 'frei von', stUsed: 'belegt', stLibrary: 'Filmbibliothek', stFilms: 'Filme', stTotal: 'Gesamtgröße', stAvg: 'Durchschnitt pro Film', stBiggest: 'Größter Film', stPace: 'Wachstum', stPerMonth: 'pro Monat (letzte 3 Monate)', stFull: 'In diesem Tempo ist die vollste Festplatte in etwa {n} Monaten voll.', stFullNow: 'In diesem Tempo reicht der Platz keinen Monat mehr.',
  stRes: 'Nach Auflösung', stClean: 'Aufräum-Vorschläge', stBig: 'Größte Dateien', stCleanHint: 'Filme, die du schon gesehen hast, lange nicht angeschaut hast, schlecht bewertet sind oder sehr groß. Favoriten und Watchlist-Titel werden nie vorgeschlagen.', stNone: 'Nichts vorzuschlagen. Deine Bibliothek ist aufgeräumt.',
  stSelected: '{n} ausgewählt', stFrees: 'gibt {s} frei', stArchive: 'Auswahl archivieren…', stSelAll: 'Alle wählen', stSelNone: 'Leeren', stBulkTitle: '{n} Filme archivieren', stBulkIntro: 'Von jedem Film werden Details und Bilder im Archiv gespeichert, dann wird die Datei gelöscht und der Film verlässt deine Bibliothek.', stBulkGo: 'Archivieren und {s} freigeben', stBulkRun: 'Archiviere…', stBulkDone: '{n} Filme archiviert, {s} freigegeben.', stBulkFail: '{n} fehlgeschlagen',
  stRSeen: 'Gesehen', stRLow: 'Schlecht bewertet', stRBig: 'Sehr groß', stRStale: 'Nie geschaut, vor über einem Jahr hinzugefügt', stROld: 'Lange nicht geschaut', stSortSize: 'Größe', stSortEff: 'GB pro Stunde', stGbH: 'GB/Std.', stSeries: 'Serien sind in dieser Übersicht noch nicht enthalten.', stWatchedOn: 'gesehen', stAdded: 'hinzugefügt', stOpen: 'Öffnen'
});
const fmtBytes = b => b >= 1e12 ? (b / 1e12).toFixed(2) + ' TB' : b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.round(b / 1e6) + ' MB';
const ST = { data: null, at: 0, sel: new Set() };

async function stDisks() {
  const out = [];
  const [jfS, arr] = await Promise.all([api('System/Info/Storage').catch(() => null), plug().radarr || plug().sonarr ? cget('/arr/diskspace').catch(() => []) : []]);
  ((jfS && jfS.Libraries) || []).forEach(l => (l.Folders || []).forEach(f => { if (f.FreeSpace != null && f.UsedSpace != null) out.push({ name: l.Name, path: f.Path, free: f.FreeSpace, total: f.FreeSpace + f.UsedSpace, src: 'Jellyfin' }); }));
  (arr || []).forEach(d => { if (d.total) out.push({ name: d.label || d.path, path: d.path, free: d.free, total: d.total, src: d.source === 'radarr' ? 'Radarr' : 'Sonarr' }); });
  const uniq = []; out.forEach(d => { if (!uniq.some(u => Math.abs(u.total - d.total) < 2e8 && Math.abs(u.free - d.free) < 5e9)) uniq.push(d); }); // the same disk seen by several services
  return uniq;
}
async function stLoad(force) {
  if (!force && ST.data && Date.now() - ST.at < 120000) return ST.data;
  const [r, wl, disks] = await Promise.all([items({ IncludeItemTypes: 'Movie', Fields: 'MediaSources,ProviderIds,DateCreated,CommunityRating,ProductionYear,OriginalTitle', Limit: 10000, EnableImageTypes: 'Primary', ImageTypeLimit: 1 }), items({ IncludeItemTypes: 'Movie', Filters: 'Likes', Limit: 3000, Fields: '' }).catch(() => ({ Items: [] })), stDisks(), (optOn('letterboxd') && lbUser()) ? lbLoad() : null]);
  const wlIds = new Set((wl.Items || []).map(i => i.Id)); const day = 864e5, now = Date.now();
  const movies = (r.Items || []).map(it => {
    const src = (it.MediaSources || [])[0] || {}; const size = src.Size || 0; const v = (src.MediaStreams || []).find(s => s.Type === 'Video') || {}; const h_ = v.Height || 0, w_ = v.Width || 0;
    const res = (h_ >= 1800 || w_ >= 3400) ? '4K' : (h_ >= 900 || w_ >= 1800) ? '1080p' : (h_ >= 650 || w_ >= 1200) ? '720p' : (h_ || w_) ? 'SD' : '?';
    const mins = it.RunTimeTicks ? it.RunTimeTicks / 6e8 : 0; const u = ud(it); const lb = LB.n ? lbMatch(it) : null;
    const rating = lb && lb.rating ? lb.rating * 2 : (it.CommunityRating || 0);
    const played = !!u.Played || !!lb; const last = u.LastPlayedDate ? Date.parse(u.LastPlayedDate) : (lb && lb.date ? Date.parse(lb.date) : 0); const added = it.DateCreated ? Date.parse(it.DateCreated) : 0;
    return { it, size, res, mins, gbh: mins ? size / 1e9 / (mins / 60) : 0, rating, played, last, added, protectd: !!u.IsFavorite || wlIds.has(it.Id), codec: v.Codec || '' };
  }).filter(m => m.size > 0);
  const total = movies.reduce((a, m) => a + m.size, 0);
  const recent = movies.filter(m => m.added > now - 90 * day).reduce((a, m) => a + m.size, 0); const perMonth = recent / 3;
  const sug = movies.filter(m => !m.protectd).map(m => {
    const gb = m.size / 1e9; let score = Math.min(40, gb * 3); const why = [];
    if (m.played) { score += 40; why.push('stRSeen'); if (m.last && now - m.last > 180 * day) { score += 10; why.push('stROld'); } }
    else if (m.added && now - m.added > 365 * day) { score += 15; why.push('stRStale'); }
    if (m.rating && m.rating < 5.5) { score += 25; why.push('stRLow'); } else if (m.rating >= 8) score -= 30;
    if (gb >= 15) why.push('stRBig');
    return { m, score, why };
  }).filter(x => x.score >= 55 && (x.m.played || x.why.includes('stRStale'))).sort((a, b) => b.score - a.score).slice(0, 80);
  ST.data = { movies, total, perMonth, disks, sug, res: ['4K', '1080p', '720p', 'SD', '?'].map(k => ({ k, n: movies.filter(m => m.res === k).length, b: movies.filter(m => m.res === k).reduce((a, m) => a + m.size, 0) })).filter(x => x.n) }; ST.at = Date.now(); return ST.data;
}
function stRow(m, why, onSel) {
  const it = m.it; const cb = h('input', { type: 'checkbox', checked: ST.sel.has(it.Id), onchange: e => { e.target.checked ? ST.sel.add(it.Id) : ST.sel.delete(it.Id); row.classList.toggle('sel', e.target.checked); onSel(); } });
  const date = m.last ? t('stWatchedOn') + ' ' + new Date(m.last).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' }) : (m.added ? t('stAdded') + ' ' + new Date(m.added).toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'short', year: 'numeric' }) : '');
  const row = h('div', { class: 'st-row' + (ST.sel.has(it.Id) ? ' sel' : '') }, h('label', { class: 'st-cb' }, cb, h('i')), h('div', Object.assign({ class: 'st-p', onclick: () => go(itemHash(it)) }, bg(imgUrl(it, 'Primary', 120)))),
    h('div', { class: 'st-t', onclick: () => go(itemHash(it)) }, h('b', { class: 'ell' }, it.Name + (it.ProductionYear ? ' (' + it.ProductionYear + ')' : '')), h('span', {}, [m.res !== '?' ? m.res : '', m.codec.toUpperCase(), m.mins ? Math.round(m.mins) + ' ' + t('min') : '', m.gbh ? m.gbh.toFixed(1) + ' ' + t('stGbH') : '', date].filter(Boolean).join(' · ')),
      (why || []).length ? h('div', { class: 'st-why' }, why.map(k => h('i', { class: k }, t(k)))) : null), h('div', { class: 'st-sz' }, fmtBytes(m.size)));
  return row;
}
async function storageView(page) {
  const wrap = h('div', { class: 'nf-page-pad st-page' }, h('h1', {}, t('stTitle')), h('p', { class: 'gm-secp' }, t('stIntro'))); page.append(wrap);
  if (!(C.status && C.status.admin)) { wrap.append(h('div', { class: 'nf-empty' }, t('stAdminOnly'))); return; }
  wrap.append(h('div', { class: 'spinner', style: 'margin:60px auto 12px' }), h('p', { class: 'gm-loading' }, t('stLoading')));
  let D; try { D = await stLoad(true); } catch (e) { wrap.append(h('div', { class: 'nf-empty' }, (e.message || e))); return; }
  wrap.querySelector('.spinner').remove(); wrap.querySelector('.gm-loading').remove();
  /* disks */
  const disks = h('div', { class: 'st-disks' });
  const perMonth = D.perMonth; let worstMonths = null;
  D.disks.sort((a, b) => a.free / a.total - b.free / b.total).forEach(d => {
    const used = 1 - d.free / d.total; const months = perMonth > 0 ? d.free / perMonth : null; if (months != null && (worstMonths == null || months < worstMonths)) worstMonths = months;
    disks.append(h('div', { class: 'st-disk' + (used > .9 ? ' crit' : used > .75 ? ' warn' : '') }, h('div', { class: 'st-dh' }, h('b', { class: 'ell' }, d.name || d.path), h('small', {}, d.src)), h('div', { class: 'st-bar' }, h('i', { style: 'width:' + Math.round(used * 100) + '%' })), h('div', { class: 'st-df' }, h('b', {}, fmtBytes(d.free)), t('stFree') + ' ' + fmtBytes(d.total), h('span', {}, Math.round(used * 100) + '% ' + t('stUsed'))), h('small', { class: 'ell' }, d.path || '')));
  });
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('stDisks')), D.disks.length ? disks : h('div', { class: 'nf-empty', style: 'padding:24px 0' }, t('stNoDisks')),
    worstMonths != null ? h('p', { class: 'st-fc' }, (worstMonths < 1 ? t('stFullNow') : t('stFull').replace('{n}', Math.round(worstMonths)))) : null));
  /* numbers */
  const big = D.movies.slice().sort((a, b) => b.size - a.size)[0];
  const tile = (v, l, sub) => h('div', { class: 'gm-tile2' }, h('b', { class: 'ell' }, v), h('small', {}, l), sub ? h('small', { class: 'ell' }, sub) : null);
  wrap.append(h('section', { class: 'gm-sec' }, h('h2', {}, t('stLibrary')), h('div', { class: 'gm-stats' }, tile(D.movies.length.toLocaleString(), t('stFilms')), tile(fmtBytes(D.total), t('stTotal')), tile(fmtBytes(D.total / Math.max(1, D.movies.length)), t('stAvg')), big ? tile(fmtBytes(big.size), t('stBiggest'), big.it.Name) : null, tile('+' + fmtBytes(D.perMonth), t('stPace'), t('stPerMonth'))),
    h('h3', {}, t('stRes')), h('div', { class: 'st-res' }, h('div', { class: 'st-resbar' }, D.res.map(x => h('i', { class: 'r' + x.k.replace('?', 'u'), style: 'flex:' + x.b, title: x.k + ' · ' + x.n + ' · ' + fmtBytes(x.b) }))), h('div', { class: 'st-resl' }, D.res.map(x => h('span', {}, h('i', { class: 'r' + x.k.replace('?', 'u') }), h('b', {}, x.k), x.n + ' · ' + fmtBytes(x.b))))), h('p', { class: 'gm-secp', style: 'margin-top:14px' }, t('stSeries'))));
  /* lists with selection */
  let tab = 'clean', sortBy = 'size'; const list = h('div', { class: 'st-list' });
  const bar = h('div', { class: 'st-selbar' }); const selInfo = () => { const picked = D.movies.filter(m => ST.sel.has(m.it.Id)); const sz = picked.reduce((a, m) => a + m.size, 0); bar.classList.toggle('show', picked.length > 0); bar.replaceChildren(h('b', {}, t('stSelected').replace('{n}', picked.length)), h('span', {}, t('stFrees').replace('{s}', fmtBytes(sz))), h('button', { class: 'btn grey', onclick: () => { ST.sel.clear(); drawList(); selInfo(); } }, t('stSelNone')), h('button', { class: 'btn white', onclick: () => stBulk(picked, () => { ST.sel.clear(); stLoad(true).then(nd => { D = nd; drawList(); selInfo(); }); }) }, ic('download'), t('stArchive'))); };
  const tabs = h('div', { class: 'nf-seasons' }, [['clean', t('stClean')], ['big', t('stBig')]].map(([k, l]) => h('button', { class: 'nf-chip' + (k === tab ? ' on' : ''), onclick: e => { tab = k; $$('.nf-chip', tabs).forEach(c => c.classList.toggle('on', c === e.currentTarget)); drawList(); } }, l)));
  const sortSel = h('select', { class: 'st-sort', onchange: e => { sortBy = e.target.value; drawList(); } }, [['size', t('stSortSize')], ['eff', t('stSortEff')]].map(([v, l]) => h('option', { value: v }, l)));
  function drawList() {
    sortSel.style.display = tab === 'big' ? '' : 'none';
    let rows;
    if (tab === 'clean') rows = D.sug.map(x => stRow(x.m, x.why, selInfo)); else rows = D.movies.slice().sort((a, b) => sortBy === 'eff' ? b.gbh - a.gbh : b.size - a.size).slice(0, 60).map(m => stRow(m, m.protectd ? [] : [], selInfo));
    list.replaceChildren(...(rows.length ? rows : [h('div', { class: 'nf-empty', style: 'padding:30px 0' }, t('stNone'))]));
  }
  wrap.append(h('section', { class: 'gm-sec' }, h('div', { class: 'st-head' }, tabs, sortSel, h('button', { class: 'nf-chip', onclick: () => { const rows = tab === 'clean' ? D.sug.map(x => x.m) : D.movies.slice().sort((a, b) => b.size - a.size).slice(0, 60); rows.forEach(m => ST.sel.add(m.it.Id)); drawList(); selInfo(); } }, t('stSelAll'))), h('p', { class: 'gm-secp' }, t('stCleanHint')), list), bar);
  drawList(); selInfo();
}
/* archive several movies one after the other */
function stBulk(picked, done) {
  const d = cxDialog(t('stBulkTitle').replace('{n}', picked.length), { wide: false }); const radarrOk = !!(C.status && C.status.radarr);
  const useRadarr = h('input', { type: 'checkbox', checked: radarrOk && (C.status.features || {}).archiveRadarr !== false, disabled: !radarrOk });
  const total = picked.reduce((a, m) => a + m.size, 0); const status = h('div', { class: 'st-bulk' });
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    go_.disabled = true; useRadarr.disabled = true; let ok = 0, freed = 0, fail = 0; const rows = new Map();
    status.replaceChildren(...picked.map(m => { const r = h('div', { class: 'st-bl' }, h('span', {}, '…'), h('b', { class: 'ell' }, m.it.Name), h('small', {}, fmtBytes(m.size))); rows.set(m.it.Id, r); return r; }));
    for (const m of picked) { const r = rows.get(m.it.Id); r.firstChild.textContent = ''; r.scrollIntoView({ block: 'nearest' }); try { const full = await getItem(m.it.Id); await archiveCore(full, useRadarr.checked); ok++; freed += m.size; r.firstChild.textContent = ''; r.classList.add('ok'); } catch (e) { fail++; r.firstChild.textContent = ''; r.classList.add('bad'); r.title = String(e.message || e); } }
    ARCH.at = 0; archLoad(true); C.libCache = null; resetSeerrCache(); d.foot.replaceChildren(h('b', { style: 'margin-right:auto' }, t('stBulkDone').replace('{n}', ok).replace('{s}', fmtBytes(freed)) + (fail ? ' · ' + t('stBulkFail').replace('{n}', fail) : '')), h('button', { class: 'btn white', onclick: () => { d.close(); done(); } }, 'OK'));
  } }, ic('download'), t('stBulkGo').replace('{s}', fmtBytes(total)));
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'margin-top:0' }, t('stBulkIntro')), h('label', { class: 'arch-opt' }, useRadarr, h('span', {}, radarrOk ? t('archRadarr') : t('archRadarrOff'))), h('p', { class: 'cxd-hint arch-warn' }, t('archWarn')), status);
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ---------- Requests page: clearer status, progress with time left, filters, actions ---------- */
Object.assign(TX.en, {
  rxStepReq: 'Requested', rxStepApp: 'Approved', rxStepDl: 'Downloading', rxStepAv: 'Available', rxDeclined: 'Declined', rxPartial: 'Partly available', rxHintPending: 'Waiting for an administrator to approve it.', rxHintApproved: 'Approved. Waiting for the download to start.', rxHintAv: 'Ready in your library.', rxHintDecl: 'This request was declined.', rxHintPartial: 'Some episodes are already available, the rest is on its way.',
  rxAll: 'All', rxWait: 'Waiting', rxProg: 'In progress', rxDone: 'Available', rxBad: 'Declined', rxMine: 'Only mine', rxSearch: 'Search requests…', rxBy: 'by', rxOpen: 'Open', rxDetails: 'Details', rxApprove: 'Approve', rxDecline: 'Decline', rxDelete: 'Remove request', rxDelAsk: 'Remove this request?', rxMore: 'Load more', rxEmpty: 'No requests match.', rxSeasons: 'Seasons',
  rxFilm: 'Movie', rxShow: 'Series', rxLeft: 'left', rxOf: 'of', rxSortNew: 'Newest', rxSortOld: 'Oldest', rxSortTitle: 'Title', rxLive: 'Updates live', rxType: 'Type', rxNowDl: 'Downloading now', rxQueueN: '{n} downloads running', rxWhen: 'requested', rxProfile: 'Quality'
});
Object.assign(TX.de, {
  rxStepReq: 'Angefragt', rxStepApp: 'Genehmigt', rxStepDl: 'Lädt', rxStepAv: 'Verfügbar', rxDeclined: 'Abgelehnt', rxPartial: 'Teilweise verfügbar', rxHintPending: 'Wartet darauf, dass ein Administrator zustimmt.', rxHintApproved: 'Genehmigt. Der Download startet gleich.', rxHintAv: 'Bereit in deiner Bibliothek.', rxHintDecl: 'Diese Anfrage wurde abgelehnt.', rxHintPartial: 'Einige Folgen sind schon da, der Rest ist unterwegs.',
  rxAll: 'Alle', rxWait: 'Wartet', rxProg: 'In Arbeit', rxDone: 'Verfügbar', rxBad: 'Abgelehnt', rxMine: 'Nur meine', rxSearch: 'Anfragen durchsuchen…', rxBy: 'von', rxOpen: 'Öffnen', rxDetails: 'Details', rxApprove: 'Genehmigen', rxDecline: 'Ablehnen', rxDelete: 'Anfrage entfernen', rxDelAsk: 'Diese Anfrage entfernen?', rxMore: 'Mehr laden', rxEmpty: 'Keine passenden Anfragen.', rxSeasons: 'Staffeln',
  rxFilm: 'Film', rxShow: 'Serie', rxLeft: 'übrig', rxOf: 'von', rxSortNew: 'Neueste', rxSortOld: 'Älteste', rxSortTitle: 'Titel', rxLive: 'Aktualisiert live', rxType: 'Typ', rxNowDl: 'Lädt gerade', rxQueueN: '{n} Downloads laufen', rxWhen: 'angefragt', rxProfile: 'Qualität'
});
const RX_STEPS = ['pending', 'approved', 'loading', 'available'];
const rxStepKey = { pending: 'rxStepReq', approved: 'rxStepApp', loading: 'rxStepDl', available: 'rxStepAv' };
function rxStage(q, qi) { const md = q.media || {}; if (q.status === 3) return 'declined'; if (q.status === 1) return 'pending'; if (md.status === 5) return 'available'; if (qi) return 'loading'; if (md.status === 4) return 'partial'; if (md.status === 3) return 'loading'; return 'approved'; }
function rxQueueFor(md, queue) {
  const mt = md.mediaType; const hit = (queue || []).filter(x => mt === 'movie' ? (x.source === 'radarr' && +x.tmdbId === +md.tmdbId) : (x.source === 'sonarr' && ((md.tvdbId && +x.tvdbId === +md.tvdbId) || (+x.tmdbSeriesId === +md.tmdbId))));
  if (!hit.length) return null; const size = hit.reduce((a, x) => a + (x.size || 0), 0), left = hit.reduce((a, x) => a + (x.sizeleft || 0), 0);
  return { n: hit.length, size, left, pct: size ? Math.round((1 - left / size) * 100) : 0, time: hit.map(x => x.timeleft).filter(Boolean).sort().pop() || '', client: hit[0].client || '', warn: hit.some(x => /warning|failed|stalled/i.test(x.status + ' ' + x.trackedDownloadState)) };
}
function rxTime(s) { const m = /^(?:(\d+)\.)?(\d+):(\d+):(\d+)/.exec(s || ''); if (!m) return ''; const mins = (+m[1] || 0) * 1440 + +m[2] * 60 + +m[3]; return mins >= 1440 ? Math.round(mins / 1440) + ' d' : mins >= 60 ? Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min' : Math.max(1, mins) + ' min'; }
const rxAgo = d => { const diff = (Date.parse(d) - Date.now()) / 1000; const f = new Intl.RelativeTimeFormat(L === 'de' ? 'de' : 'en', { numeric: 'auto' }); const a = Math.abs(diff); return a < 3600 ? f.format(Math.round(diff / 60), 'minute') : a < 86400 ? f.format(Math.round(diff / 3600), 'hour') : a < 86400 * 30 ? f.format(Math.round(diff / 86400), 'day') : f.format(Math.round(diff / 86400 / 30), 'month'); };

async function requestsView(page) {
  const wrap = h('div', { class: 'nf-page-pad rq-page' }, h('h1', {}, t('requests'))); page.append(wrap);
  if (!(await waitSeerr())) { wrap.append(h('div', { class: 'nf-empty' }, 'Seerr is not available.')); return; }
  const user = await me(); const admin = !!(user.Policy && user.Policy.IsAdministrator); const hasArr = plug().radarr || plug().sonarr;
  const st = { f: 'all', type: 'all', sort: 'new', q: '', mine: false }; let rows = [], queue = [], total = 0, timer = 0;
  const lm = await libMap();
  const tiles = h('div', { class: 'rq-tiles' }); const bar = h('div', { class: 'rq-bar' }); const list = h('div', { class: 'rq-list' }); const moreB = h('button', { class: 'btn grey rq-more', hidden: true }, t('rxMore'));
  const dl = h('div', {}); wrap.append(tiles, dl, bar, list, moreB);
  const grp = r => r.stage === 'pending' ? 'pending' : (r.stage === 'approved' || r.stage === 'loading' || r.stage === 'partial') ? 'prog' : r.stage === 'available' ? 'done' : 'bad';
  const FILT = [['all', t('rxAll'), 'rq-all'], ['pending', t('rxWait'), 'rq-pend'], ['prog', t('rxProg'), 'rq-prog'], ['done', t('rxDone'), 'rq-done'], ['bad', t('rxBad'), 'rq-bad']];
  function drawTiles() { tiles.replaceChildren(...FILT.map(([k, l, c]) => h('button', { class: 'rq-tile ' + c + (st.f === k ? ' on' : ''), onclick: () => { st.f = k; drawTiles(); apply(); } }, h('b', {}, String(k === 'all' ? rows.length : rows.filter(r => grp(r) === k).length)), h('span', {}, l)))); }
  let qT; const sInp = h('input', { type: 'search', placeholder: t('rxSearch'), oninput: e => { clearTimeout(qT); qT = setTimeout(() => { st.q = e.target.value.trim().toLowerCase(); apply(); }, 200); } });
  const typeChips = h('div', { class: 'nf-seasons', style: 'margin:0' }, [['all', t('rxAll')], ['movie', t('rxFilm')], ['tv', t('rxShow')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === st.type ? ' on' : ''), onclick: e => { st.type = v; $$('.nf-chip', typeChips).forEach(c => c.classList.toggle('on', c === e.currentTarget)); apply(); } }, l)));
  const sortSel = h('select', { onchange: e => { st.sort = e.target.value; apply(); } }, [['new', t('rxSortNew')], ['old', t('rxSortOld')], ['title', t('rxSortTitle')]].map(([v, l]) => h('option', { value: v }, l)));
  bar.append(typeChips, h('div', { class: 'dc-sel' }, sortSel), h('div', { class: 'dc-q' }, ic('search', 'ic-s'), sInp)); if (hasArr) bar.append(h('span', { class: 'rq-live' }, h('i'), t('rxLive')));
  function apply() {
    const vis = rows.filter(r => (st.f === 'all' || grp(r) === st.f) && (st.type === 'all' || r.mt === st.type) && (!st.q || (r.title || '').toLowerCase().includes(st.q) || (r.who || '').toLowerCase().includes(st.q)));
    vis.sort((a, b) => st.sort === 'title' ? (a.title || '').localeCompare(b.title || '') : st.sort === 'old' ? Date.parse(a.q.createdAt) - Date.parse(b.q.createdAt) : Date.parse(b.q.createdAt) - Date.parse(a.q.createdAt));
    list.replaceChildren(...(vis.length ? vis.map(r => r.el) : [h('div', { class: 'nf-empty', style: 'padding:40px 0' }, t('rxEmpty'))]));
  }
  function drawQueueBox() {
    if (!hasArr) return; const live = queue.length;
    dl.replaceChildren(live ? h('div', { class: 'rq-now' }, h('b', {}, t('rxQueueN').replace('{n}', live)), h('span', {}, fmtBytes(queue.reduce((a, x) => a + (x.size - x.sizeleft), 0)) + ' ' + t('rxOf') + ' ' + fmtBytes(queue.reduce((a, x) => a + x.size, 0)))) : '');
  }
  function paint(r) {
    const el = r.el; el.className = 'rq-row s-' + r.stage; const md = r.q.media || {}; const lib = lm[r.mt + ':' + md.tmdbId];
    const steps = r.stage === 'declined' ? h('div', { class: 'rq-bad' }, t('rxDeclined')) : h('div', { class: 'rq-steps' }, RX_STEPS.map((s, i) => { const cur = RX_STEPS.indexOf(r.stage === 'partial' ? 'loading' : r.stage); return h('div', { class: 'rq-st' + (i < cur || r.stage === 'available' ? ' done' : i === cur ? ' cur' : '') }, h('i', {}, i < cur || r.stage === 'available' ? '' : String(i + 1)), h('span', {}, r.stage === 'partial' && s === 'loading' ? t('rxPartial') : t(rxStepKey[s]))); }));
    const hint = { pending: 'rxHintPending', approved: 'rxHintApproved', available: 'rxHintAv', declined: 'rxHintDecl', partial: 'rxHintPartial' }[r.stage];
    const qi = r.qi; const prog = qi ? h('div', { class: 'rq-dl' }, h('div', { class: 'rq-pb' + (qi.warn ? ' warn' : '') }, h('i', { style: 'width:' + qi.pct + '%' })), h('span', {}, [qi.pct + ' %', fmtBytes(qi.size - qi.left) + ' ' + t('rxOf') + ' ' + fmtBytes(qi.size), qi.time ? rxTime(qi.time) + ' ' + t('rxLeft') : '', qi.client].filter(Boolean).join(' · '))) : (r.stage === 'loading' && dlPct(md) != null ? h('div', { class: 'rq-dl' }, h('div', { class: 'rq-pb' }, h('i', { style: 'width:' + dlPct(md) + '%' })), h('span', {}, dlPct(md) + ' %')) : null);
    const meta = [r.who ? t('rxBy') + ' ' + r.who : '', r.q.createdAt ? rxAgo(r.q.createdAt) : '', r.q.is4k ? '4K' : '', r.mt === 'tv' && (r.q.seasons || []).length ? t('rxSeasons') + ' ' + r.q.seasons.map(s => s.seasonNumber).sort((a, b) => a - b).join(', ') : ''].filter(Boolean).join(' · ');
    const btn = (cls, ico, label, fn) => h('button', { class: 'btn ' + cls + ' sm', onclick: async e => { e.stopPropagation(); const b = e.currentTarget; b.disabled = true; try { await fn(); } catch (er) { toast(((er.responseJSON && er.responseJSON.message) || er.statusText || 'error')); b.disabled = false; } } }, ico ? ic(ico) : null, label);
    const acts = [];
    if (lib && (r.stage === 'available' || r.stage === 'partial')) acts.push(btn('white', 'play', t('play'), async () => { playVideo(lib); }), btn('grey', 'info', t('rxOpen'), async () => go(itemHash(lib))));
    else acts.push(btn('grey', 'info', t('rxDetails'), async () => openSeerrInfo({ id: md.tmdbId, mediaType: r.mt })));
    if (admin && r.stage === 'pending') acts.push(btn('white', 'check', t('rxApprove'), async () => { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id + '/approve') }); toast(''); resetSeerrCache(); reload(); }), btn('grey', 'close', t('rxDecline'), async () => { await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id + '/decline') }); resetSeerrCache(); reload(); }));
    if (admin || r.stage === 'pending' || r.stage === 'declined') acts.push(h('button', { class: 'rq-x', title: t('rxDelete'), 'aria-label': t('rxDelete'), onclick: async e => { e.stopPropagation(); if (!confirm(t('rxDelAsk'))) return; try { await ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl(SEERR + '/request/' + r.q.id) }); resetSeerrCache(); reload(); } catch (er) { toast(t('error')); } } }, ic('close', 'ic-s')));
    el.replaceChildren(h('div', Object.assign({ class: 'rq-p', onclick: () => (lib ? go(itemHash(lib)) : openSeerrInfo({ id: md.tmdbId, mediaType: r.mt })) }, bg(r.poster))),
      h('div', { class: 'rq-main' }, h('div', { class: 'rq-t' }, h('b', { class: 'ell' }, r.title || '…'), r.year ? h('span', {}, '(' + r.year + ')') : null, h('i', { class: 'rq-type' }, r.mt === 'tv' ? t('rxShow') : t('rxFilm'))), h('div', { class: 'rq-sub' }, meta), steps, prog, hint && r.stage !== 'declined' ? h('small', { class: 'rq-hint' }, t(hint)) : null),
      h('div', { class: 'rq-acts' }, acts));
  }
  function mk(q) {
    const md = q.media || {}; const mt = (md.mediaType || q.type) === 'tv' ? 'tv' : 'movie'; md.mediaType = mt; const qi = hasArr ? rxQueueFor(md, queue) : null;
    const r = { q, mt, qi, stage: rxStage(q, qi), who: (q.requestedBy && (q.requestedBy.displayName || q.requestedBy.jellyfinUsername || q.requestedBy.username)) || '', el: h('div', { class: 'rq-row' }), title: '', year: '', poster: '' };
    paint(r); return r;
  }
  async function fillMeta(list_) { let i = 0; const worker = async () => { while (i < list_.length) { const r = list_[i++]; try { const m = await reqMeta(r.q.media); r.title = m.title || m.name || '#' + r.q.media.tmdbId; r.year = (m.releaseDate || m.firstAirDate || '').slice(0, 4); r.poster = TM(m.posterPath, 'w185'); paint(r); } catch (e) { } } }; await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]); if (st.q || st.sort === 'title') apply(); }
  async function fetchPage(skip) { const r = await seerrGet('/request', { take: 100, skip, filter: 'all', sort: 'added' }); total = (r.pageInfo && r.pageInfo.results) || (r.results || []).length; return r.results || []; }
  async function reload() {
    list.replaceChildren(h('div', { class: 'spinner', style: 'margin:50px auto' }));
    try { [queue] = await Promise.all([hasArr ? cget('/arr/queue').catch(() => []) : [], null]); const res = await fetchPage(0); rows = res.map(mk); } catch (e) { list.replaceChildren(h('div', { class: 'nf-empty' }, t('noRes'))); return; }
    drawTiles(); drawQueueBox(); apply(); moreB.hidden = rows.length >= total; fillMeta(rows);
  }
  moreB.onclick = async () => { moreB.disabled = true; const res = await fetchPage(rows.length); const add = res.map(mk); rows.push(...add); drawTiles(); apply(); moreB.hidden = rows.length >= total; moreB.disabled = false; fillMeta(add); };
  /* refresh the download numbers while the page is open */
  async function tick() {
    if (!wrap.isConnected) { clearInterval(timer); return; } if (document.hidden || !hasArr) return;
    let nq; try { nq = await cget('/arr/queue'); } catch (e) { return; } const before = rows.filter(r => r.qi).length; queue = nq;
    rows.forEach(r => { if (r.stage === 'declined' || r.stage === 'available' || r.stage === 'pending') return; const qi = rxQueueFor(r.q.media, queue); const ns = rxStage(r.q, qi); r.qi = qi; r.stage = ns; paint(r); });
    drawQueueBox(); drawTiles(); if (before && !queue.length) { resetSeerrCache(); reload(); }
  }
  timer = setInterval(tick, 15000); await reload();
}

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
const TN_MOOD_ICON = { any: '🎲', thrill: '🕵️', funny: '😂', emo: '🥲', light: '☕', think: '🧠', action: '💥', scary: '👻', family: '👨‍👩‍👧' };
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
  const moodRow = h('div', { class: 'tn-moods' }, moods.map(([v, l]) => h('button', { class: 'tn-mood' + (TN.mood === v ? ' on' : ''), onclick: e => { TN.mood = v; $$('.tn-mood', moodRow).forEach(c => c.classList.toggle('on', c === e.currentTarget)); roll(); } }, h('span', {}, TN_MOOD_ICON[v]), l)));
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
  container.append(h('section', { class: 'tn-banner' }, h('div', { class: 'tn-bt' }, h('span', { class: 'tn-be' }, '🍿'), h('div', {}, h('h2', {}, t('tnTitle')), h('p', {}, t('tnBannerSub')))), h('div', { class: 'tn-bm' }, moods.map(([k, l]) => h('a', { class: 'nf-chip', href: '#/c/tonight?mood=' + k }, TN_MOOD_ICON[k] + ' ' + l)), h('a', { class: 'btn white sm', href: '#/c/tonight' }, ic('play'), t('tnGo')))));
}

/* ---------- Calendar with history: releases, downloads and what you watched ---------- */
Object.assign(TX.en, { cal_imported: 'Downloaded', cal_grabbed: 'Found', cal_failed: 'Failed', calLog: 'History', calMonth: 'Month', calRel: 'Releases', calDl: 'Downloads', calSeen: 'Watched', calImported: 'Downloaded', calGrab: 'Found', calFail: 'Failed', calDays: 'Last {n} days', calAll: 'All', calEmptyLog: 'Nothing happened in this time.', calMore: '{n} more', calEpisodes: '{n} episodes', calWatchedOn: 'Watched' });
Object.assign(TX.de, { cal_imported: 'Heruntergeladen', cal_grabbed: 'Gefunden', cal_failed: 'Fehlgeschlagen', calLog: 'Verlauf', calMonth: 'Monat', calRel: 'Erscheinungen', calDl: 'Downloads', calSeen: 'Gesehen', calImported: 'Heruntergeladen', calGrab: 'Gefunden', calFail: 'Fehlgeschlagen', calDays: 'Letzte {n} Tage', calAll: 'Alle', calEmptyLog: 'In dieser Zeit ist nichts passiert.', calMore: '{n} weitere', calEpisodes: '{n} Folgen', calWatchedOn: 'Gesehen' });
const calYmd = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const CAL_ICON = { imported: '↓', grabbed: '…', failed: '✕', seen: '✓' };
/* films you watched in a period, from Jellyfin and the Letterboxd diary */
async function calWatched(fromMs, toMs) {
  let all = []; try { all = await wrAll(); } catch (e) { }
  return all.filter(r => r.date >= fromMs && r.date < toMs).map(r => ({ kind: 'seen', date: new Date(r.date).toISOString(), title: r.it ? r.it.Name : r.lb.title, subtitle: r.lb && r.lb.rating ? '★ ' + Number(r.lb.rating).toFixed(1) + (r.lb.liked ? ' ♥' : '') : '', it: r.it, poster: r.it ? imgUrl(r.it, 'Primary', 120) : '' }));
}
const calHid = x => !HID.on && HID.loaded && (hxSeerrHidden(x) || (x.it && !hxKeep(x.it)));
async function calendarView(page) {
  const wrap = h('div', { class: 'nf-page-pad cal-page' }, h('h1', {}, t('calendar'))); page.append(wrap);
  if (!(plug().radarr || plug().sonarr)) { wrap.append(h('div', { class: 'nf-empty' }, t('arrOff'))); return; }
  const st = { mode: 'cal', rel: true, dl: true, seen: true, days: 30, f: 'all' }; let cur = new Date(); cur.setDate(1);
  const lm = await libMap(); const head = h('div', { class: 'cal-head' }); const layers = h('div', { class: 'cal-layers' }); const body = h('div', {});
  const histOn = cfg('calendarHistory'); if (!histOn) { st.dl = false; st.seen = false; }
  const modeSeg = h('div', { class: 'dc-segs' }, [['cal', t('calMonth')], ['log', t('calLog')]].filter(x => histOn || x[0] === 'cal').map(([v, l]) => h('button', { class: 'dc-seg' + (v === st.mode ? ' on' : ''), onclick: e => { st.mode = v; $$('.dc-seg', modeSeg).forEach(c => c.classList.toggle('on', c === e.currentTarget)); draw(); } }, l)));
  wrap.append(h('div', { class: 'cal-top' }, modeSeg, layers), head, body);
  const lay = (k, label, cls) => h('button', { class: 'cal-lay ' + cls + (st[k] ? ' on' : ''), onclick: e => { st[k] = !st[k]; e.currentTarget.classList.toggle('on', st[k]); draw(); } }, h('i'), label);
  function drawLayers() { layers.replaceChildren(...(st.mode === 'cal' && histOn ? [lay('rel', t('calRel'), 'l-rel'), lay('dl', t('calDl'), 'l-dl'), lay('seen', t('calSeen'), 'l-seen')] : [])); }
  const evNode = e => { const own = e.tmdbId && lm[(e.source === 'radarr' ? 'movie' : 'tv') + ':' + e.tmdbId]; const have = e.kind === 'seen' ? 'seen' : e.kind === 'imported' || e.kind === 'grabbed' || e.kind === 'failed' ? 'h-' + e.kind : (e.hasFile || own ? 'have' : e.kind);
    return h('div', { class: 'cal-ev ' + have, title: (e.title || '') + (e.subtitle ? ' · ' + e.subtitle : ''), onclick: () => { if (e.it) go(itemHash(e.it)); else if (own) go(itemHash(own)); else if (e.tmdbId) openSeerrInfo({ id: e.tmdbId, mediaType: e.source === 'radarr' ? 'movie' : 'tv' }); } }, e.poster ? h('div', Object.assign({ class: 'p' }, bg(e.poster))) : null, h('span', { class: 'ell' }, e.title), h('small', { class: 'ell' }, e.subtitle || (e.kind === 'seen' ? t('calWatchedOn') : e.count > 1 ? t('calEpisodes').replace('{n}', e.count) : t('cal_' + e.kind) || ''))); };
  async function drawMonth() {
    const first = new Date(cur), last = new Date(cur.getFullYear(), cur.getMonth() + 1, 0); const start = new Date(first); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); const end = new Date(last); end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    head.replaceChildren(h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() - 1); draw(); } }, ic('left')), h('b', {}, cur.toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { month: 'long', year: 'numeric' })), h('button', { class: 'btn round', onclick: () => { cur.setMonth(cur.getMonth() + 1); draw(); } }, ic('right')), h('button', { class: 'btn grey', style: 'margin-left:auto', onclick: () => { cur = new Date(); cur.setDate(1); draw(); } }, t('today')));
    const grid = h('div', { class: 'cal-grid' }, h('div', { class: 'spinner', style: 'grid-column:1/-1' })); body.replaceChildren(grid);
    const s = calYmd(start), e = calYmd(end); const endMs = end.getTime() + 864e5;
    const [rel, hist, seen] = await Promise.all([st.rel ? cget('/arr/calendar', { start: s, end: e }).catch(() => []) : [], st.dl ? cget('/arr/history', { start: s, end: e }).catch(() => []) : [], st.seen ? calWatched(start.getTime(), endMs) : []]);
    const byDay = {}; const put = (k, o, ord) => { if (calHid(o)) return; (byDay[k] = byDay[k] || []).push(Object.assign({ ord }, o)); };
    seen.forEach(x => put(calYmd(x.date), x, 0)); hist.forEach(x => put(calYmd(x.date), x, x.kind === 'failed' ? 1 : x.kind === 'imported' ? 2 : 3)); rel.forEach(x => { if (x.date) put(x.date.slice(0, 10), x, 4); });
    grid.replaceChildren(...['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d, i) => h('div', { class: 'cal-dow' }, L === 'de' ? d : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i])));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = calYmd(d); const cell = h('div', { class: 'cal-day' + (d.getMonth() !== cur.getMonth() ? ' other' : '') + (k === calYmd(new Date()) ? ' today' : '') }, h('span', { class: 'n' }, d.getDate()));
      const evs = (byDay[k] || []).sort((a, b) => a.ord - b.ord); evs.slice(0, 5).forEach(x => cell.append(evNode(x))); if (evs.length > 5) cell.append(h('small', { class: 'cal-more' }, t('calMore').replace('{n}', evs.length - 5))); grid.append(cell);
    }
  }
  async function drawLog() {
    const chips = h('div', { class: 'nf-seasons', style: 'margin:0' }, [30, 90, 365].map(n => h('button', { class: 'nf-chip' + (st.days === n ? ' on' : ''), onclick: e => { st.days = n; draw(); } }, t('calDays').replace('{n}', n))), [['all', t('calAll')], ['dl', t('calDl')], ['seen', t('calSeen')]].map(([v, l]) => h('button', { class: 'nf-chip' + (st.f === v ? ' on' : ''), style: v === 'all' ? 'margin-left:14px' : '', onclick: () => { st.f = v; draw(); } }, l)));
    head.replaceChildren(chips); body.replaceChildren(h('div', { class: 'spinner', style: 'margin:50px auto' }));
    const to = new Date(); const from = new Date(Date.now() - st.days * 864e5);
    const [hist, seen] = await Promise.all([st.f !== 'seen' ? cget('/arr/history', { start: calYmd(from), end: calYmd(to) }).catch(() => []) : [], st.f !== 'dl' ? calWatched(from.getTime(), to.getTime() + 864e5) : []]);
    const all = hist.concat(seen).filter(x => !calHid(x)).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)); if (!all.length) { body.replaceChildren(h('div', { class: 'nf-empty', style: 'padding:50px 0' }, t('calEmptyLog'))); return; }
    const byDay = new Map(); all.forEach(x => { const k = calYmd(x.date); (byDay.get(k) || byDay.set(k, []).get(k)).push(x); });
    const kindL = { imported: t('calImported'), grabbed: t('calGrab'), failed: t('calFail'), seen: t('calSeen') };
    body.replaceChildren(h('div', { class: 'cal-log' }, [...byDay.entries()].map(([k, evs]) => h('section', { class: 'cal-lg' }, h('h3', {}, new Date(k + 'T12:00:00').toLocaleDateString(L === 'de' ? 'de-DE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })), evs.map(x => { const own = x.tmdbId && lm[(x.source === 'radarr' ? 'movie' : 'tv') + ':' + x.tmdbId]; return h('div', { class: 'cal-li k-' + x.kind, onclick: () => { if (x.it) go(itemHash(x.it)); else if (own) go(itemHash(own)); else if (x.tmdbId) openSeerrInfo({ id: x.tmdbId, mediaType: x.source === 'radarr' ? 'movie' : 'tv' }); } }, h('span', { class: 'cal-lic' }, CAL_ICON[x.kind]), x.poster ? h('div', Object.assign({ class: 'cal-lip' }, bg(x.poster))) : h('div', { class: 'cal-lip' }), h('div', {}, h('b', { class: 'ell' }, x.title), h('span', {}, [kindL[x.kind], x.count > 1 ? t('calEpisodes').replace('{n}', x.count) : x.subtitle, x.quality, x.source === 'radarr' ? 'Radarr' : x.source === 'sonarr' ? 'Sonarr' : ''].filter(Boolean).join(' · '))), h('time', {}, new Date(x.date).toLocaleTimeString(L === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' }))); })))));
  }
  function draw() { drawLayers(); return st.mode === 'cal' ? drawMonth() : drawLog(); }
  draw();
}

/* ---------- custom dropdowns: every <select> inside the Cinema overlay gets a styled menu, the select stays the data source ---------- */
Object.assign(TX.en, { reqAdvHint: 'Choose where this title should be added.' });
Object.assign(TX.de, { reqAdvHint: 'Wähle, wohin der Titel hinzugefügt werden soll.' });
function ddEnhance(sel) {
  if (sel.dataset.dd || sel.multiple || sel.size > 1) return; sel.dataset.dd = '1';
  const lab = h('span', { class: 'dd-l' }); const btn = h('button', { type: 'button', class: 'dd-btn', 'aria-haspopup': 'listbox' }, lab, h('i', { class: 'dd-c' }));
  let menu = null;
  const sync = () => { const o = sel.selectedOptions[0]; lab.textContent = o ? o.textContent : ''; btn.disabled = sel.disabled; btn.hidden = sel.hidden; };
  const close = () => { if (!menu) return; menu.remove(); menu = null; btn.classList.remove('open'); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', close); window.removeEventListener('hashchange', close); };
  const away = e => { if (menu && !menu.contains(e.target) && !btn.contains(e.target)) close(); };
  const pick = o => { if (sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } sync(); close(); };
  const key = e => {
    if (!menu) return; const items = [...menu.querySelectorAll('.dd-i')]; const cur = items.findIndex(x => x === document.activeElement);
    if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); btn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); const n = items.length ? (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length : 0; if (items[n]) items[n].focus(); }
  };
  const open = () => {
    if (menu) return close(); sync();
    const opts = [...sel.options]; const r = btn.getBoundingClientRect();
    menu = h('div', { class: 'dd-menu', role: 'listbox' }, opts.map(o => h('button', { type: 'button', class: 'dd-i' + (o.selected ? ' on' : ''), role: 'option', disabled: o.disabled, onclick: () => pick(o) }, h('span', {}, o.textContent), o.selected ? ic('check', 'ic-s') : null)));
    getUI().append(menu); btn.classList.add('open');
    const mh = Math.min(menu.scrollHeight, 340); const below = innerHeight - r.bottom - 12; const up = below < mh && r.top > below;
    menu.style.minWidth = r.width + 'px'; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - Math.max(r.width, menu.offsetWidth) - 8)) + 'px';
    menu.style.maxHeight = Math.max(160, Math.min(340, up ? r.top - 16 : below)) + 'px'; menu.style[up ? 'bottom' : 'top'] = (up ? innerHeight - r.top + 6 : r.bottom + 6) + 'px';
    const on = menu.querySelector('.dd-i.on') || menu.querySelector('.dd-i'); if (on) { on.focus({ preventScroll: true }); on.scrollIntoView({ block: 'nearest' }); }
    document.addEventListener('mousedown', away, true); document.addEventListener('keydown', key, true); window.addEventListener('resize', close); window.addEventListener('hashchange', close);
  };
  btn.onclick = e => { e.preventDefault(); e.stopPropagation(); open(); };
  sel.style.display = 'none'; sel.after(btn); sync();
  new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'selected'] });
  sel.addEventListener('change', sync); btn.addEventListener('focus', sync);
}
(function ddInit() {
  let q = 0; const scan = () => { q = 0; document.querySelectorAll('#cx select:not([data-dd]), #cx-ui select:not([data-dd]), #cx-nf select:not([data-dd]), #cx-sp select:not([data-dd])').forEach(ddEnhance); };
  const go_ = () => { if (!q) q = requestAnimationFrame(scan); };
  const start = () => { new MutationObserver(go_).observe(document.body, { childList: true, subtree: true }); go_(); };
  document.body ? start() : document.addEventListener('DOMContentLoaded', start);
})();

/* ---------- home rows built from your own taste: because you watched, because you liked, watch again ---------- */
Object.assign(TX.en, { hrSeen: 'Because you watched {x}', hrLiked: 'Because you liked {x}', hrAgain: 'Watch again', hrSeenL: 'Because you watched ...', hrLikedL: 'Because you liked ...', hrAgainL: 'Watch again (films you liked, not seen for a long time)' });
Object.assign(TX.de, { hrSeen: 'Weil du {x} gesehen hast', hrLiked: 'Weil dir {x} gefallen hat', hrAgain: 'Erneut ansehen', hrSeenL: 'Weil du ... gesehen hast', hrLikedL: 'Weil dir ... gefallen hat', hrAgainL: 'Erneut ansehen (Filme, die dir gefallen haben, lange nicht gesehen)' });
const hrShort = s => { const x = String(s || '').split(/\s[-–:]\s|:\s/)[0].trim(); return x.length > 38 ? x.slice(0, 36).trim() + '…' : x; };
const hrShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
async function hrLb() { if (optOn('letterboxd') && lbUser()) { try { await lbLoad(); } catch (e) { } } return !!(LB && LB.n); }
async function hrSimilar(rows, seeds, title, max) {
  let shown = 0;
  for (const seed of seeds) {
    if (shown >= max) break;
    try {
      const r = await api('Items/' + seed.Id + '/Similar', { userId: uid(), limit: 40, Fields: F_BASE }); const arr = (r.Items || []).filter(i => !ud(i).Played && hxKeep(i)).slice(0, 20);
      if (arr.length >= 5) { rows.append(row(title.replace('{x}', hrShort(seed.Name)), arr, 'poster')); shown++; }
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
    toast(t('requested')); return true;
  } catch (e) { toast(((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.message || e.statusText || 'error')); return false; }
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
  const reqBtn = h('button', { class: 'sp-pillbtn', onclick: async () => { try { await requestAurral({ id, title, artistName: artist }, 'album'); toast(t('requested')); } catch (e) { toast(((e.responseJSON && (e.responseJSON.error || e.responseJSON.message)) || e.statusText || 'error')); } } }, t('requestAlbum'));
  n.append(actionsBar(tracks.filter(x => x._preview || !x._ext), ctx, aurralReq() ? reqBtn : null), trackList(tracks, ctx));
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
    const tiles = rgs.slice(0, 24).map(g => { const el = tile({ name: g.title, sub: String(g['first-release-date'] || '').slice(0, 4) + ' · ' + t('notOwned'), img: caaImg(g.id), href: '#/c/music/ext/' + g.id + '?t=' + encodeURIComponent(g.title) + '&a=' + encodeURIComponent(ar.Name) }); el.classList.add('notown-tile'); const rq = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); try { await requestAurral({ id: g.id, title: g.title, artistName: ar.Name, artistMbid: mb }, 'album'); toast(t('requested')); } catch (er) { toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus')); el.append(rq); return el; });
    n.append(shelf(t('notInLib'), tiles));
  } catch (e) { console.warn('[cinema] artist extras', e); }
}

Object.assign(TX.en, { mdl: 'Downloads', mdlTitle: 'Download queue', mdlEmpty: 'Nothing is downloading right now.', mdlHint: 'Requested music shows up here while it is fetched.', popMissing: 'Popular · not in your library', songRequests: 'Songs you can request', reqSong: 'Request' });
Object.assign(TX.de, { mdl: 'Downloads', mdlTitle: 'Download-Warteschlange', mdlEmpty: 'Gerade wird nichts heruntergeladen.', mdlHint: 'Angefragte Musik erscheint hier, solange sie geladen wird.', popMissing: 'Beliebt · nicht in deiner Bibliothek', songRequests: 'Songs zum Anfragen', reqSong: 'Anfragen' });
/* Aurral download queue and recent activity (songs, albums, playlists) */
Object.assign(TX.en, { mdlActive: 'In the queue', mdlRecent: 'Recently', mdlDone: 'Done', mdlFailed: 'Failed', mdlQueued: 'Waiting', mdlWork: 'Downloading' });
Object.assign(TX.de, { mdlActive: 'In der Warteschlange', mdlRecent: 'Zuletzt', mdlDone: 'Fertig', mdlFailed: 'Fehlgeschlagen', mdlQueued: 'Wartet', mdlWork: 'Lädt' });
async function mDownloads(n) {
  n.append(h('div', { class: 'sp-greet' }, t('mdlTitle')));
  if (!aurralOn()) { n.append(h('div', { class: 'nf-empty' }, t('aurralOff'))); return; }
  const box = h('div', { class: 'dl-wrap' }, skelRows(4)); n.append(box); let first = true;
  const kindOf = x => { const s = String(x.status || x.state || '').toLowerCase(); return /complete|done|imported|success|available/.test(s) ? 'done' : /fail|error|cancel/.test(s) ? 'failed' : /queue|wait|pending|search|request/.test(s) ? 'queued' : 'work'; };
  const rowOf = (x, k) => {
    const title = x.trackName || x.title || x.albumName || x.album || x.name || '?'; const artist = x.artistName || x.artist || ''; const album = x.albumName || x.album || '';
    const pct = x.progress != null ? Math.round(x.progress > 1 ? x.progress : x.progress * 100) : x.percent != null ? Math.round(x.percent) : (x.size && x.sizeleft != null ? Math.round((1 - x.sizeleft / x.size) * 100) : null);
    const sub = [artist, album && album !== title ? album : ''].filter(Boolean).join(' · ');
    const when = x.requestedAt ? rxAgo(x.requestedAt) : '';
    const why = k === 'failed' ? String(x.subtitle || '').replace(/^Soulseek:\s*/i, '').split(';')[0].slice(0, 90) : '';
    return h('div', { class: 'dl-row k-' + k }, h('div', Object.assign({ class: 'cv' }, bg(extImg(x.image || x.artworkUrl) || caaImg(x.albumMbid || x.releaseGroupMbid)))),
      h('div', { class: 'tx' }, h('b', { class: 'ell' }, title), h('span', { class: 'ell' }, sub || why), why && sub ? h('span', { class: 'ell why' }, why) : null, k === 'work' && pct != null ? h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.max(2, Math.min(100, pct)) + '%' })) : null),
      h('div', { class: 'st' }, h('em', {}, k === 'done' ? t('mdlDone') : k === 'failed' ? t('mdlFailed') : k === 'queued' ? t('mdlQueued') : t('mdlWork') + (pct != null ? ' ' + pct + ' %' : '')), when ? h('small', {}, when) : null));
  };
  async function load() {
    const [q, act] = await Promise.all([aget('/api/library/downloads').catch(() => []), aget('/api/requests').catch(() => [])]);
    const live = (Array.isArray(q) ? q : (q.items || q.downloads || q.queue || q.records || [])).map(x => ({ x, k: kindOf(x) === 'queued' ? 'queued' : 'work' }));
    const hist = (Array.isArray(act) ? act : (act.items || act.requests || [])).slice().sort((a, b) => Date.parse(b.requestedAt || 0) - Date.parse(a.requestedAt || 0)).map(x => ({ x, k: kindOf(x) }));
    const active = live.concat(hist.filter(o => o.k === 'work' || o.k === 'queued')); const recent = hist.filter(o => o.k === 'done' || o.k === 'failed').slice(0, 40);
    if (!box.isConnected && !first) return; first = false; box.replaceChildren();
    if (!active.length && !recent.length) { box.append(h('div', { class: 'nf-empty' }, h('div', {}, t('mdlEmpty')), h('small', { style: 'opacity:.6' }, t('mdlHint')))); return; }
    if (active.length) box.append(h('h2', { class: 'dl-h' }, t('mdlActive') + ' · ' + active.length), h('div', { class: 'dl-list' }, active.map(o => rowOf(o.x, o.k))));
    if (recent.length) box.append(h('h2', { class: 'dl-h' }, t('mdlRecent')), h('div', { class: 'dl-list' }, recent.map(o => rowOf(o.x, o.k))));
  }
  await load();
  const iv = setInterval(() => { if (!box.isConnected) clearInterval(iv); else load(); }, 6000);
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
  if (!aurralReq() || q.length < 2) return;
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
  if (!aurralReq() || q.length < 2) return;
  const sk = h('section', { class: 'sk-wrap' }, h('div', { class: 'sk-h' }), skelRows(4)); const res = node.querySelector('.sp-res'); if (res) res.after(sk); else node.append(sk);
  try { await aurralTrackSearchInner(node, q); } finally { sk.remove(); }
}
async function aurralTrackSearchInner(node, q) {
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

/* ---------- music: artist pictures and popularity from Deezer (via the server), merged discography, missing songs, skeletons ---------- */
Object.assign(TX.en, { showMoreSongs: 'Show all songs', showFewer: 'Show fewer', missingSongs: 'Songs you do not have yet', songsOf: '{a} of {b} songs', reqAll: 'Request missing songs', requestedOk: 'Requested' });
Object.assign(TX.de, { showMoreSongs: 'Alle Songs anzeigen', showFewer: 'Weniger anzeigen', missingSongs: 'Songs, die dir noch fehlen', songsOf: '{a} von {b} Titeln', reqAll: 'Fehlende Songs anfragen', requestedOk: 'Angefragt' });

const DZ = { art: new Map(), top: new Map(), alb: new Map(), rg: new Map() };
const dz = (path, params) => cget('/music/deezer', Object.assign({ path }, params || {})).catch(() => ({}));
function dzArtist(name) {
  const k = norm(name); if (!k) return Promise.resolve(null); if (DZ.art.has(k)) return DZ.art.get(k);
  const p = dz('search/artist', { q: name, limit: 5 }).then(r => { const l = (r && r.data) || []; const exact = l.filter(x => norm(x.name) === k).sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0)); const hit = exact[0] || l[0]; return hit ? { id: hit.id, name: hit.name, img: hit.picture_big || hit.picture_medium || '' } : null; });
  DZ.art.set(k, p); return p;
}
function dzAlbumCover(artist, title) {
  const k = norm(artist) + '|' + norm(title); if (DZ.alb.has(k)) return DZ.alb.get(k);
  const p = dz('search/album', { q: artist + ' ' + title, limit: 6 }).then(r => { const l = (r && r.data) || []; const hit = l.find(x => norm(x.title) === norm(title) && norm((x.artist || {}).name) === norm(artist)) || l.find(x => norm(x.title) === norm(title)); return hit ? (hit.cover_big || hit.cover_medium || '') : ''; });
  DZ.alb.set(k, p); return p;
}
/* an artist's songs, most popular first */
function dzTop(name) {
  const k = norm(name); if (DZ.top.has(k)) return DZ.top.get(k);
  const p = dzArtist(name).then(a => a ? dz('artist/' + a.id + '/top', { limit: 50 }) : null).then(r => ((r && r.data) || []).map(x => ({ title: x.title_short || x.title, rank: x.rank || 0, album: (x.album || {}).title || '', image: (x.album || {}).cover_big || '', dur: (x.duration || 0) * 1000, preview: x.preview || '' })));
  DZ.top.set(k, p); return p;
}
const probeImg = u => new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = u; });
function setCover(el, url) { const cv = el.querySelector('.cv'); if (!cv || !url) return; cv.style.backgroundImage = 'url("' + url + '")'; cv.replaceChildren(); }
function fillArtistImg(el, name) { dzArtist(name).then(r => { if (r && r.img) setCover(el, r.img); }); }
function fillAlbumImg(el, mbid, artist, title) {
  (mbid ? probeImg(caaImg(mbid)) : Promise.resolve(false)).then(ok => ok ? setCover(el, caaImg(mbid)) : dzAlbumCover(artist, title).then(u => u && setCover(el, u)));
}
/* a request button that turns into a check mark */
function doneBtn(btn) { btn.classList.remove('busy'); btn.classList.add('done'); btn.disabled = true; btn.replaceChildren(ic('check')); btn.title = t('requestedOk'); btn.setAttribute('aria-label', t('requestedOk')); }

/* skeleton placeholders */
const skelShelf = () => h('section', { class: 'sk-sec' }, h('div', { class: 'sk-h' }), h('div', { class: 'sk-row' }, [0, 1, 2, 3, 4, 5].map(() => h('div', { class: 'sk-tile' }, h('i'), h('b'), h('b', { class: 's' })))));
const skelRows = n => h('div', { class: 'sk-list' }, Array.from({ length: n }, () => h('div', { class: 'sk-li' }, h('i'), h('div', {}, h('b'), h('b', { class: 's' })))));

/* popular songs: Deezer ranking, library files where you have them, requestable where you do not */
async function artistPopular(ar, all, popBox, moreHost) {
  popBox.replaceChildren(skelRows(5));
  let rank = []; try { rank = await dzTop(ar.Name); } catch (e) { }
  let list = [];
  try {
  if (rank.length) {
    const flat = rank.map(r => ({ artistName: ar.Name, trackName: r.title, title: r.title, albumName: r.album, durationMs: r.dur, preview_url: r.preview, artworkUrl: r.image, id: 'dz' + r.title }));
    const its = await toTrackItems(flat); const have = new Set(its.filter(x => !x._ext).map(x => x.Id));
    const rest = all.filter(x => !have.has(x.Id)).sort((a, b) => ((b.UserData && b.UserData.PlayCount) || 0) - ((a.UserData && a.UserData.PlayCount) || 0));
    list = its.concat(rest);
  } else {
    const top = await tracksOf({ ArtistIds: ar.Id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 10 }); list = top.concat(all.filter(x => !top.some(y => y.Id === x.Id)));
  }
  } catch (e) { console.warn('[cinema] popular', e); list = all.slice(); }
  let open = false; const btn = h('button', { class: 'btn grey sp-more', onclick: () => { open = !open; draw(); } });
  const draw = () => { const shown = open ? list : list.slice(0, 5); popBox.replaceChildren(trackList(shown, { id: ar.Id + '-pop' + (open ? 'all' : ''), number: 'idx' })); $$('.sp-th', popBox).forEach(x => x.remove()); btn.textContent = open ? t('showFewer') : t('showMoreSongs') + ' (' + list.length + ')'; btn.hidden = list.length <= 5; };
  moreHost.replaceChildren(btn); draw();
}

/* discography: albums you have and releases you could add, in one row */
function rgTracksCount(id) {
  if (DZ.rg.has(id)) return DZ.rg.get(id);
  let cached = null; try { cached = JSON.parse(localStorage.getItem('cx-rgn') || '{}'); } catch (e) { }
  const p = (cached && cached[id] != null) ? Promise.resolve(cached[id]) : aget('/api/artists/release-group/' + id + '/tracks').then(tr => { const n = (tr || []).length; try { const c = JSON.parse(localStorage.getItem('cx-rgn') || '{}'); c[id] = n; localStorage.setItem('cx-rgn', JSON.stringify(c)); } catch (e) { } return n; }).catch(() => null);
  DZ.rg.set(id, p); return p;
}
async function artistDisco(n, ar, alb) {
  const mb = (ar.ProviderIds || {}).MusicBrainzArtist; const entries = [];
  alb.forEach(a => entries.push({ own: true, year: String(yearOf(a) || ''), el: albumTile(a), a }));
  if (aurralOn() && mb) {
    try {
      const [a, lib] = await Promise.all([aget('/api/artists/' + mb), loadLibrary()]);
      const mine = new Set(lib.albums.filter(x => (x.ArtistItems || []).some(y => y.Id === ar.Id) || x.AlbumArtist === ar.Name).map(x => norm(x.Name)));
      (a['release-groups'] || []).filter(g => ['Album', 'EP', 'Single'].includes(g['primary-type']) && !(g['secondary-types'] || []).length && !mine.has(norm(g.title))).forEach(g => {
        const year = String(g['first-release-date'] || '').slice(0, 4);
        const el = tile({ name: g.title, sub: [year, t('notOwned')].filter(Boolean).join(' · '), img: '', href: '#/c/music/ext/' + g.id + '?t=' + encodeURIComponent(g.title) + '&a=' + encodeURIComponent(ar.Name) }); el.classList.add('notown-tile');
        fillAlbumImg(el, g.id, ar.Name, g.title);
        if (aurralReq()) { const rq = h('button', { class: 'pbtn show', 'aria-label': t('request'), onclick: async e => { e.stopPropagation(); rq.classList.add('busy'); try { await requestAurral({ id: g.id, title: g.title, artistName: ar.Name, artistMbid: mb }, 'album'); toast(t('requested')); doneBtn(rq); } catch (er) { rq.classList.remove('busy'); toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus')); el.append(rq); }
        entries.push({ own: false, year, el, g });
      });
    } catch (e) { console.warn('[cinema] discography', e); }
  }
  if (!entries.length) return;
  entries.sort((x, y) => String(y.year).localeCompare(String(x.year)));
  n.append(shelf(t('discography'), entries.map(x => x.el)));
  /* how many of an album's songs you have: filled in quietly */
  const jobs = entries.filter(x => x.own && x.a && (x.a.ProviderIds || {}).MusicBrainzReleaseGroup); let i = 0;
  const worker = async () => { while (i < jobs.length) { const x = jobs[i++]; const total = await rgTracksCount(x.a.ProviderIds.MusicBrainzReleaseGroup); const have = x.a.ChildCount || 0; const sb = x.el.querySelector('.sb'); if (total && have && sb && total > have && total < 80) { sb.textContent = [String(yearOf(x.a) || ''), t('songsOf').replace('{a}', have).replace('{b}', total)].filter(Boolean).join(' · '); x.el.classList.add('partial'); } } };
  if (aurralOn()) Promise.all([worker(), worker(), worker()]);
}

/* album page: the songs of the release you do not have */
async function albumMissing(n, al, tracks) {
  const rg = (al.ProviderIds || {}).MusicBrainzReleaseGroup; if (!rg || !aurralOn() || !aurralReq()) return;
  let list; try { list = await aget('/api/artists/release-group/' + rg + '/tracks'); } catch (e) { return; }
  if (!Array.isArray(list) || !list.length) return;
  const artist = (al.AlbumArtist || (al.ArtistItems && al.ArtistItems[0] && al.ArtistItems[0].Name) || '');
  const have = new Set(tracks.map(x => norm(x.Name)));
  const missing = list.filter(x => !have.has(norm(x.title || x.trackName || x.name)));
  if (!missing.length || missing.length === list.length) return;
  const its = (await toTrackItems(missing.map(x => Object.assign({ artistName: artist, albumName: al.Name, durationMs: x.length, releaseGroupMbid: rg }, x)))).filter(x => x._ext); if (!its.length) return;
  const sec = h('section', { class: 'alb-missing' }, h('div', { class: 'am-h' }, h('h2', {}, t('missingSongs') + ' · ' + its.length), h('button', { class: 'btn grey', onclick: async e => { const b = e.currentTarget; b.disabled = true; try { await requestAurral({ id: rg, title: al.Name, artistName: artist }, 'album'); toast(t('requested')); b.replaceChildren(ic('check'), t('requestedOk')); } catch (er) { b.disabled = false; toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } } }, ic('plus'), t('reqAll'))), trackList(its, { id: 'miss-' + rg, noAlbum: true, noCover: true, number: 'idx' }));
  $$('.sp-th', sec).forEach(x => x.remove()); n.append(sec);
}

/* an artist you do not have: photo, popular songs (preview and request) and releases to add */
async function mExtArtist(n, q) {
  const name = (q && q.get('n')) || ''; let mbid = (q && q.get('m')) || '';
  if (!name) { n.append(h('div', { class: 'nf-empty' }, t('empty'))); return; }
  /* an artist that is in the library after all: go there */
  try { const lib = await loadLibrary(); const own = lib.artists.find(a => norm(a.Name) === norm(name)); if (own) { location.replace('#/c/music/artist/' + own.Id); return; } } catch (e) { }
  const dzA = await dzArtist(name).catch(() => null);
  if (!mbid && aurralOn()) { try { const r = await aget('/api/search', { q: name, scope: 'artist', limit: 5 }); const l = aList(r); const hit = l.find(o => norm(aName(o)) === norm(name)) || l[0]; if (hit) mbid = hit.id || hit.mbid || ''; } catch (e) { } }
  pageHead(n, { type: t('artist'), title: name, round: true, img: dzA && dzA.img || '', meta: [t('notOwned')] });
  const ar = { Id: null, Name: name, ProviderIds: { MusicBrainzArtist: mbid } };
  if (mbid && aurralReq()) { const b = h('button', { class: 'sp-pillbtn' }, ic('plus'), t('request')); b.onclick = async () => { b.disabled = true; try { await requestAurral({ id: mbid, name }, 'artist'); toast(t('requested')); b.replaceChildren(ic('check'), t('requestedOk')); b.classList.add('done'); } catch (er) { b.disabled = false; toast(((er.responseJSON && (er.responseJSON.error || er.responseJSON.message)) || er.statusText || 'error')); } }; n.append(h('div', { class: 'sp-actions' }, b)); }
  const popBox = h('div', {}), popMore = h('div', { class: 'sp-morewrap' }); n.append(h('h2', { style: 'margin-top:8px' }, t('popularTracks')), popBox, popMore);
  artistPopular(ar, [], popBox, popMore);
  if (mbid) await artistDisco(n, ar, []);
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
const artistLinks = it => (it.ArtistItems || []).length ? it.ArtistItems.map((a, i) => [i ? ', ' : '', h('a', { href: '#/c/music/artist/' + a.Id, onclick: e => e.stopPropagation() }, a.Name)]) : extArtistLinks(it);
const artistText = it => (it.ArtistItems || []).length ? it.ArtistItems.map(a => a.Name).join(', ') : (it.AlbumArtist || (it.Artists || []).join(', ') || '');

/* artists of a song you do not have: every name opens a page with their songs and releases */
function extArtistLinks(it) {
  const s = it.AlbumArtist || (it.Artists || [])[0] || ''; if (!s || !it._ext) return s;
  const mb = (it._tr && it._tr.artistMbid) || '';
  return s.split(/(\s*(?:,|&|\bfeat\.?|\bft\.?)\s*)/i).map((p, i) => i % 2 || !p.trim() ? p : h('a', { href: '#/c/music/xartist/x?n=' + encodeURIComponent(p.trim()) + (mb && s === p ? '&m=' + mb : ''), onclick: e => e.stopPropagation() }, p.trim()));
}
const playable = it => !!it && !(it._ext && !it._preview);
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
  if (!playable(it)) return;
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
  if (!playable(tracks[idx || 0])) { toast(t('noPreview') + ': ' + tracks[idx || 0].Name); return; } /* keep what is playing now */
  P.orig = tracks.slice(); idx = idx || 0;
  if (opts.shuffle != null) P.shuffle = opts.shuffle;
  if (P.shuffle) { const first = P.orig[idx]; P.q = [first].concat(shuffleArr(P.orig.filter((_, k) => k !== idx))); P.i = 0; } else { P.q = P.orig.slice(); P.i = idx; }
  P.ctx = opts.ctx || null;
  loadCurrent();
}
function next(auto) {
  if (!P.q.length) return;
  if (auto && P.repeat === 2) { P.audio.currentTime = 0; P.audio.play(); return; }
  let nx = -1; for (let k = P.i + 1; k < P.q.length; k++) if (playable(P.q[k])) { nx = k; break; }
  if (nx < 0 && P.repeat === 1) nx = P.q.findIndex(playable);
  if (nx >= 0) { P.i = nx; loadCurrent(); } else { P.audio.pause(); P.audio.currentTime = 0; if (P.reportedStart) { rep('Stopped'); P.reportedStart = false; } emit(); }
}
function prev() { let pv = -1; for (let k = P.i - 1; k >= 0; k--) if (playable(P.q[k])) { pv = k; break; } if (P.audio.currentTime > 3 || pv < 0) { P.audio.currentTime = 0; return; } P.i = pv; loadCurrent(); }
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
P.audio.addEventListener('error', () => { const it = cur(); if (it) { toast(it.Name); setTimeout(() => next(), 800); } });
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
  const right = h('div', { class: 'pl-r' }, cfg('musicLyrics') ? bL : null, bQ, bMute, vol);
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
  if (ctx && ctx.playlistId && it.PlaylistItemId) ent.push('-', { icon: 'close', label: t('rmPl'), fn: async () => { await ApiClient.ajax({ type: 'DELETE', url: ApiClient.getUrl('Playlists/' + ctx.playlistId + '/Items', { entryIds: it.PlaylistItemId }) }); toast(''); route(); } });
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
  wrap.append(h('div', { class: 'sp-th' + (noAlb ? ' noalb' : '') }, h('span', {}, '#'), h('span', {}, t('title')), noAlb ? null : h('span', {}, t('album')), h('span', {}, '')));
  // grid has 5 columns with album, 4 without; adjust header to match
  const th = $('.sp-th', wrap); if (!noAlb) { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, t('album')), h('span', {}, '')); } else { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, '')); }
  let lastDisc = null;
  tracks.forEach((it, idx) => {
    if (ctx.discs && it.ParentIndexNumber && it.ParentIndexNumber !== lastDisc && tracks.some(x => (x.ParentIndexNumber || 1) > 1)) { lastDisc = it.ParentIndexNumber; wrap.append(h('div', { class: 'sp-disc' }, ic('note', 'ic-s'), 'Disc ' + lastDisc)); }
    const lk = it._ext ? h('button', { class: 'lk on rq', title: t('request'), onclick: async e => { e.stopPropagation(); const b = e.currentTarget; if (b.disabled) return; b.classList.add('busy'); if (await requestExtTrack(it)) doneBtn(b); else b.classList.remove('busy'); } }, ic('plus')) : trackLikeBtn(it, 'lk');
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
function shelf(title, nodes, href) { if (!nodes.length) return ''; return h('section', {}, h('h2', {}, title, href ? h('a', { class: 'more', href }, '›') : null), hscroll(h('div', { class: 'sp-shelf' }, nodes))); }

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
    h('div', { class: 'sp-card sp-top' }, h('a', { class: 'sp-navlink', href: '#/c/music', 'data-k': 'home' }, ic('home'), t('home')), h('a', { class: 'sp-navlink', href: '#/c/music/search', 'data-k': 'search' }, ic('search'), t('search')), h('a', { class: 'sp-navlink', href: '#/c/music/discover', 'data-k': 'discover' }, ic('star'), t('discoverShort')), h('a', { class: 'sp-navlink', href: '#/c/music/downloads', 'data-k': 'downloads', hidden: !aurralOn() }, ic('download'), t('mdl')), h('a', { class: 'sp-navlink', href: '#/home' }, ic('film'), t('moviesTv'))),
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
      h('div', { class: 'sp-chips' }, [['', t('all'), '#/c/music'], ['discover', t('discoverShort'), '#/c/music/discover'], ['library', t('library'), '#/c/music/library']]
.concat([['downloads', t('mdl'), '#/c/music/downloads']]).map(([k, l, hr]) => h('a', { class: 'sp-chip' + (v0 === k ? ' on' : ''), href: hr, 'data-k': k, hidden: k === 'downloads' && !aurralOn() }, l))));
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
  document.querySelectorAll('#cx-sp [data-k="downloads"]').forEach(a => { a.hidden = !aurralOn(); });
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
    else if (view === 'xartist') await mExtArtist(node, r.q);
  } catch (e) { console.error('[cinema music]', e); node.append(h('div', { class: 'nf-empty' }, t('empty'))); }
  try { if (view === 'search' && id) { const sk = h('div', { class: 'sk-wrap' }, skelShelf(), skelShelf()); node.append(sk); try { await aurralSearchShelves(node, decodeURIComponent(id)); } finally { sk.remove(); } aurralTrackSearch(node, decodeURIComponent(id)); } else if (!view) { await aurralDiscoverShelves(node); musicRecs(node); } } catch (e) { }
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
  const sk0 = h('div', { class: 'sk-wrap' }, skelRows(4), skelShelf()); n.append(sk0);
  const [tr, al, ar, pl] = await Promise.all([items({ searchTerm: q, IncludeItemTypes: 'Audio', Limit: 20, Fields: AUD_F }), items({ searchTerm: q, IncludeItemTypes: 'MusicAlbum', Limit: 12 }), api('Artists', { userId: uid(), searchTerm: q, Limit: 10, Fields: 'PrimaryImageAspectRatio', ImageTypeLimit: 1, EnableImageTypes: 'Primary' }), items({ searchTerm: q, IncludeItemTypes: 'Playlist', Limit: 8 })]);
  sk0.remove();
  if (!tr.Items.length && !al.Items.length && !ar.Items.length) { if (!aurralOn()) n.append(h('div', { class: 'nf-empty' }, t('noRes'))); return; }
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
  const ctx = { id, noAlbum: true, noCover: true, discs: true }; n.append(actionsBar(tracks, ctx), trackList(tracks, ctx)); albumMissing(n, al, tracks);
  if (ar) { const more = await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: ar.Id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 12 }); const o = more.Items.filter(x => x.Id !== id); if (o.length) n.append(shelf('More by ' + ar.Name, o.map(albumTile))); }
}
async function mArtist(n, id) {
  const [ar, top, albums] = await Promise.all([getItem(id), tracksOf({ ArtistIds: id, SortBy: 'PlayCount,SortName', SortOrder: 'Descending', Limit: 10 }), items({ IncludeItemTypes: 'MusicAlbum', AlbumArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })]);
  let alb = albums.Items; if (!alb.length) alb = (await items({ IncludeItemTypes: 'MusicAlbum', ArtistIds: id, SortBy: 'ProductionYear', SortOrder: 'Descending', Limit: 60 })).Items;
  const all = await tracksOf({ ArtistIds: id, SortBy: 'SortName', Limit: 500 });
  pageHead(n, { type: t('artist'), title: ar.Name, round: true, img: imgUrl(ar, 'Primary', 500), meta: [all.length + ' ' + t('songsN')] });
  const ctx = { id, number: 'idx' }; n.append(actionsBar(all, ctx));
  window.__artistNode = n; window.__artistItem = ar;
  const popBox = h('div', {}), popMore = h('div', { class: 'sp-morewrap' }); n.append(h('h2', { style: 'margin-top:8px' }, t('popularTracks')), popBox, popMore);
  artistPopular(ar, all, popBox, popMore);
  await artistDisco(n, ar, alb);
  if (ar.Overview) n.append(h('h2', {}, t('artist')), h('p', { style: 'color:#b3b3b3;line-height:1.6;max-width:780px' }, ar.Overview.replace(/<[^>]+>/g, '')));
}

/* floating pill in Netflix shell while music plays */
const it_ = () => cur() || {};
P.audio.addEventListener('volumechange', () => { try { if (C.updateNPill) C.updateNPill(); } catch (e) { } });
P.audio.addEventListener('play', () => { pillOff = null; });
let pillOff = null; /* the pill was closed for this song */
C.updateNPill = function () {
  let pill = $('#cx-npill'); const it = cur();
  if (!it || C.mode === 'sp' || pillOff === it.Id) { if (pill) pill.remove(); return; }
  if (!pill) { pill = h('div', { id: 'cx-npill', class: 'nf-npill', onclick: () => go('#/c/music') }, h('div', { class: 'cv' }), h('div', { class: 'tx' }, h('b', { class: 'ell' }), h('span', { class: 'ell' })), h('div', { class: 'np-vol' }, h('button', { class: 'np-m', 'aria-label': 'Mute', onclick: e => { e.stopPropagation(); P.audio.muted = !P.audio.muted; } }), h('input', { type: 'range', min: 0, max: 1, step: .02, 'aria-label': 'Volume', onclick: e => e.stopPropagation(), oninput: e => { e.stopPropagation(); P.audio.muted = false; P.audio.volume = +e.target.value; try { localStorage.setItem('cx-vol', e.target.value); } catch (er) { } } })), h('button', { class: 'pp', onclick: e => { e.stopPropagation(); toggle(); } }), h('button', { class: 'np-x', 'aria-label': t('close'), title: t('close'), onclick: e => { e.stopPropagation(); pillOff = it_().Id; P.audio.pause(); pill.remove(); } }, ic('close', 'ic-s'))); root.append(pill); }
  const vr = $('.np-vol input', pill); if (vr) { vr.value = P.audio.muted ? 0 : P.audio.volume; vr.style.setProperty('--v', (+vr.value * 100) + '%'); $('.np-m', pill).replaceChildren(ic(P.audio.muted || P.audio.volume === 0 ? 'volx' : 'vol', 'ic-s')); }
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
  } catch (e) { toast(t('error')); }
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
  const LAYER_SEL = '.cxd-bg.show, .sp-modal-bg, .nf-pop:not(.hide), .sp-ctx, #cx-menu, .sp-menu, .dd-menu, .sr-modal';
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
  if (ok && !ready) { ready = true; Promise.all([loadStatus(), loadCfg()]).then(route).then(() => { setTimeout(maybeOnboard, 1800); setTimeout(syncWatchlist, 3000); setInterval(syncWatchlist, 600000); setTimeout(() => { lbSync(); archLoad(); }, 4500); setInterval(() => lbSync(), 1800000); }); }
  if (!ok && ready) { ready = false; route(); }
}, 400);
document.addEventListener('viewshow', () => { if (ready) route(); });
window.cinemaUI = { dev: { get C() { return C; }, lb: () => ({ lbReadExport, LB, onboard: () => onboardWizard(true), wrapped: y => wrData(y || new Date().getFullYear()).then(wrStory), lbLoad, lbSync, lbSeen, ARCH, archLoad, CFG: () => CFGU, save: saveCfg, archiveDialog }), seerrModal: x => seerrModal(x), setSeerrBase(b) { SEERR = b; }, calendarView: p => calendarView(p), harvest: () => harvestMenus(), HARV: () => HARV }, native(id) { C.allowNative = true; location.hash = '#/details?id=' + id; }, get player() { return P; }, skin(on) { setSkin(on !== false); }, off() { localStorage.setItem('cinema-off', '1'); location.reload(); }, on() { localStorage.removeItem('cinema-off'); location.reload(); } };

})();
