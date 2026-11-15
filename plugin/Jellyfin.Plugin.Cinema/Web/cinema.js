/* Cinema UI - Netflix + Spotify style frontend for Jellyfin 12. Kill switch: add #nocinema to the URL or run cinemaUI.off() */
(function () {
'use strict';
if (window.__cinemaUI) return; window.__cinemaUI = 1;
try { if (/nocinema/.test(location.hash + location.search) || localStorage.getItem('cinema-off') === '1') return; } catch (e) {}
const CSS_TEXT = "/* Cinema UI - styles. Everything is scoped under :is(#cx, #cx-ui) so native Jellyfin pages are untouched. */\r\nhtml.cx-on, html.cx-on body { overflow: hidden !important; background: #000 !important; }\r\n#cx, #cx-ui, :is(#cx, #cx-ui) * { box-sizing: border-box; }\r\n#cx { position: fixed; inset: 0; z-index: 9000; display: none; }\r\n:is(#cx, #cx-ui) {\r\n  color: #fff;\r\n  font-family: \"Inter\", \"SF Pro Text\", \"Segoe UI\", system-ui, -apple-system, \"Helvetica Neue\", Arial, sans-serif; letter-spacing: -.005em;\r\n  -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent;\r\n  --red: #e50914; --bg: #141414; --green: #1ed760; --dim: #b3b3b3;\r\n}\r\n:where(:is(#cx, #cx-ui) button, #cx-ui button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }\r\n:where(:is(#cx, #cx-ui) input, #cx-ui input) { font: inherit; color: inherit; }\r\n:where(:is(#cx, #cx-ui) a, #cx-ui a) { color: inherit; text-decoration: none; }\r\n:is(#cx, #cx-ui) svg { width: 24px; height: 24px; fill: currentColor; flex: none; display: block; }\r\n:is(#cx, #cx-ui) .ic-s svg { width: 16px; height: 16px; }\r\n:is(#cx, #cx-ui) .ic-l svg { width: 32px; height: 32px; }\r\n:is(#cx, #cx-ui) ::-webkit-scrollbar { width: 12px; height: 0; }\r\n:is(#cx, #cx-ui) ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border-radius: 12px; border: 3px solid transparent; background-clip: content-box; }\r\n:is(#cx, #cx-ui) ::-webkit-scrollbar-track { background: transparent; }\r\n:is(#cx, #cx-ui) .hide { display: none !important; }\r\n:is(#cx, #cx-ui) .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\r\n:is(#cx, #cx-ui) .clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\r\n:is(#cx, #cx-ui) .ell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\r\n:is(#cx, #cx-ui) .spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,.15); border-top-color: #fff; border-radius: 50%; animation: cxspin .8s linear infinite; margin: 20vh auto; }\r\n@keyframes cxspin { to { transform: rotate(360deg); } }\r\n@keyframes cxfade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\r\n\r\n/* =====================================================================\r\n   NETFLIX-STYLE SHELL (modern, rounded)\r\n   ===================================================================== */\r\n:is(#cx, #cx-ui) { --bg: #111113; --surface: #1b1b1f; --surface-2: #26262b; --line: rgba(255,255,255,.08); --r: 14px; --pad: clamp(16px, 2.6vw, 48px); }\r\n#cx-nf { position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden; background: var(--bg); scroll-behavior: smooth; }\r\n.nf-nav {\r\n  position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 72px; padding: 0 var(--pad);\r\n  display: flex; align-items: center; gap: 28px; background: rgba(17,17,19,.72); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4);\r\n  border-bottom: 1px solid transparent; transition: background .3s, border-color .3s;\r\n}\r\n.nf-nav.solid { background: rgba(17,17,19,.92); border-bottom-color: var(--line); }\r\n.nf-logo { color: #e50914; font-weight: 900; font-size: 24px; letter-spacing: .04em; }\r\n.nf-links { display: flex; gap: 4px; }\r\n.nf-links a { font-size: 14px; font-weight: 500; color: #d6d6d9; padding: 9px 16px; border-radius: 999px; transition: background .2s, color .2s; }\r\n.nf-links a:hover { background: rgba(255,255,255,.08); color: #fff; }\r\n.nf-links a.on { background: #fff; color: #000; font-weight: 600; }\r\n.nf-spacer { flex: 1; }\r\n.nf-search { display: flex; align-items: center; height: 40px; border-radius: 999px; border: 1px solid transparent; transition: .25s; }\r\n.nf-search.open { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.25); padding-right: 14px; }\r\n.nf-search input { width: 0; background: transparent; border: 0; outline: 0; font-size: 14px; transition: width .25s; }\r\n.nf-search.open input { width: min(240px, 40vw); padding: 0 4px; }\r\n.nf-search button { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }\r\n.nf-search button:hover { background: rgba(255,255,255,.08); }\r\n.nf-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #e50914, #7a0a12); display: grid; place-items: center; font-weight: 700; font-size: 14px; }\r\n.nf-menu-wrap { position: relative; }\r\n.nf-pop { position: absolute; right: 0; top: 52px; min-width: 210px; background: rgba(28,28,32,.96); backdrop-filter: blur(20px); border: 1px solid var(--line); border-radius: 16px; padding: 8px; font-size: 14px; box-shadow: 0 20px 50px rgba(0,0,0,.6); }\r\n.nf-pop > :not([data-cx]) { display: none !important; }\r\n.nf-pop a, .nf-pop button { display: block; width: 100%; text-align: left; padding: 11px 14px; border-radius: 10px; }\r\n.nf-pop a:hover, .nf-pop button:hover { background: rgba(255,255,255,.08); }\r\n\r\n/* hero: inset rounded card */\r\n.nf-hero { position: relative; margin: 88px var(--pad) 0; height: clamp(420px, 62vh, 720px); border-radius: 24px; overflow: hidden; background: #000; box-shadow: 0 20px 60px rgba(0,0,0,.45); }\r\n.nf-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; background-size: cover; background-position: center 22%; }\r\n.nf-slide.on { opacity: 1; }\r\n.nf-hero::after { content: \"\"; position: absolute; inset: 0; pointer-events: none;\r\n  background: linear-gradient(90deg, rgba(8,8,10,.82) 0%, rgba(8,8,10,.45) 34%, rgba(8,8,10,0) 62%), linear-gradient(to top, rgba(8,8,10,.8) 0%, rgba(8,8,10,0) 42%); }\r\n.nf-hero-body { position: absolute; z-index: 3; left: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); width: min(560px, 52%); }\r\n.nf-hero-logo { max-width: min(420px, 100%); max-height: 150px; object-fit: contain; object-position: left bottom; filter: drop-shadow(0 6px 18px rgba(0,0,0,.55)); display: block; margin-bottom: 18px; }\r\n.nf-hero-title { font-size: clamp(30px, 4vw, 60px); font-weight: 800; line-height: 1.02; letter-spacing: -.02em; margin: 0 0 16px; }\r\n.nf-meta { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; font-size: 14px; font-weight: 500; color: #e2e2e6; margin-bottom: 12px; }\r\n.nf-meta > span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\r\n.nf-meta .match { color: #5ee08a; font-weight: 700; }\r\n.nf-meta .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 7px; border-radius: 6px; font-size: 12px; line-height: 20px; }\r\n.nf-overview { font-size: clamp(14px, 1.1vw, 17px); line-height: 1.5; color: #e8e8ec; margin: 0 0 22px; max-width: 50ch; }\r\n.nf-hero-btns, .nf-btns { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }\r\n.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 24px 0 18px; border-radius: 999px; font-weight: 600; font-size: 15px; transition: background .2s, transform .15s; white-space: nowrap; }\r\n.btn:active { transform: scale(.97); }\r\n.btn.white { background: #fff; color: #000; }\r\n.btn.white:hover { background: #e8e8ea; }\r\n.btn.grey { background: rgba(255,255,255,.16); backdrop-filter: blur(10px); color: #fff; }\r\n.btn.grey:hover { background: rgba(255,255,255,.26); }\r\n.btn.round { width: 46px; padding: 0; background: rgba(255,255,255,.14); backdrop-filter: blur(10px); }\r\n.btn.round:hover { background: rgba(255,255,255,.26); }\r\n.btn.round.on { background: #fff; color: #000; }\r\n.nf-dots { position: absolute; z-index: 3; right: clamp(20px, 3.4vw, 56px); bottom: clamp(22px, 4vw, 54px); display: flex; gap: 6px; }\r\n.nf-dots i { width: 8px; height: 8px; background: rgba(255,255,255,.35); border-radius: 999px; cursor: pointer; transition: width .3s, background .3s; }\r\n.nf-dots i.on { background: #fff; width: 26px; }\r\n\r\n/* rows */\r\n.nf-rows { position: relative; z-index: 4; margin-top: 34px; padding-bottom: 120px; }\r\n.nf-row { margin-bottom: 30px; position: relative; animation: cxfade .5s both; }\r\n.nf-row h2 { margin: 0 var(--pad) 12px; font-size: clamp(18px, 1.5vw, 22px); font-weight: 700; letter-spacing: -.01em; color: #f2f2f4; }\r\n.nf-row h2 a { transition: color .2s; } .nf-row h2 a:hover { color: #fff; opacity: .8; }\r\n.nf-scroller { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding: 12px var(--pad) 18px; margin: -12px 0 -18px; scroll-padding: 0 var(--pad); scroll-behavior: smooth; }\r\n.nf-scroller::-webkit-scrollbar { display: none; }\r\n.nf-arrow { position: absolute; top: 50%; margin-top: -34px; width: 44px; height: 44px; border-radius: 50%; z-index: 6; background: rgba(30,30,34,.85); backdrop-filter: blur(8px); border: 1px solid var(--line); opacity: 0; transition: opacity .2s, transform .2s; display: grid; place-items: center; }\r\n.nf-row:hover .nf-arrow { opacity: 1; }\r\n.nf-arrow:hover { transform: scale(1.08); background: #fff; color: #000; }\r\n.nf-arrow.l { left: 10px; } .nf-arrow.r { right: 10px; }\r\n\r\n.nf-card { position: relative; flex: none; width: clamp(200px, 17.5vw, 340px); cursor: pointer; }\r\n.nf-card.poster { width: clamp(138px, 11.4vw, 220px); }\r\n.nf-card .im { position: relative; aspect-ratio: 16/9; background: var(--surface) center/cover no-repeat; border-radius: var(--r); overflow: hidden; transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset; }\r\n.nf-card.poster .im { aspect-ratio: 2/3; }\r\n.nf-card .im::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,0) 55%); opacity: 0; transition: opacity .3s; }\r\n.nf-card .im .ph { position: absolute; inset: 0; display: grid; place-items: center; padding: 10px; text-align: center; font-weight: 700; color: #8a8a90; font-size: 14px; }\r\n.nf-card .prog { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.28); z-index: 2; overflow: hidden; }\r\n.nf-card .prog i { display: block; height: 100%; background: #fff; border-radius: 4px; }\r\n.nf-card .title { margin: 9px 4px 0; font-size: 13px; font-weight: 500; color: #bdbdc2; }\r\n.nf-card .info { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 3; display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateY(6px); transition: opacity .3s, transform .3s; pointer-events: none; }\r\n.nf-card.poster .info { left: 8px; right: 8px; bottom: 8px; }\r\n.nf-card .info .t { flex: 1; min-width: 0; font-size: 13px; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,.6); }\r\n.nf-card .info .m, .nf-card .info .acts button:not(.pl) { display: none; }\r\n.nf-card .acts { display: contents; }\r\n.nf-card .acts button.pl { width: 38px; height: 38px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; transition: transform .2s; flex: none; order: 2; }\r\n.nf-card .acts button.pl:hover { transform: scale(1.1); }\r\n.nf-card .acts button.pl svg { width: 20px; height: 20px; }\r\n@media (hover: hover) and (pointer: fine) {\r\n  .nf-card:hover .im { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 36px rgba(0,0,0,.55); }\r\n  .nf-card:hover .im::after { opacity: 1; }\r\n  .nf-card:hover .info { opacity: 1; transform: none; pointer-events: auto; }\r\n  .nf-card:hover .title { color: #fff; }\r\n}\r\n.nf-card.nohov .info { display: none; }\r\n\r\n/* grid pages */\r\n.nf-page-pad { padding: 104px var(--pad) 120px; }\r\n.nf-page-pad h1 { font-size: clamp(26px, 3vw, 38px); margin: 0 0 24px; font-weight: 800; letter-spacing: -.02em; }\r\n.nf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(clamp(130px, 12.5vw, 210px), 1fr)); gap: 24px 14px; }\r\n.nf-grid .nf-card, .nf-grid .nf-card.poster { width: auto; }\r\n.nf-empty { color: var(--dim); padding: 60px 0; text-align: center; font-size: 18px; }\r\n\r\n/* detail */\r\n.nf-detail { position: relative; min-height: 100vh; }\r\n.nf-dback { position: fixed; inset: 0; background-size: cover; background-position: center top; z-index: 0; }\r\n.nf-dback::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(17,17,19,.97) 0%, rgba(17,17,19,.75) 40%, rgba(17,17,19,.25) 100%), linear-gradient(to top, #111113 6%, rgba(17,17,19,0) 55%); }\r\n.nf-dbody { position: relative; z-index: 1; padding: 15vh var(--pad) 100px; max-width: 1560px; }\r\n.nf-dhead { display: flex; gap: 44px; align-items: flex-start; }\r\n.nf-dposter { width: clamp(160px, 18vw, 300px); aspect-ratio: 2/3; border-radius: 18px; background: var(--surface) center/cover; box-shadow: 0 24px 60px rgba(0,0,0,.6); flex: none; }\r\n.nf-dinfo { max-width: 760px; padding-top: 4px; }\r\n.nf-dinfo h1 { font-size: clamp(30px, 4vw, 58px); line-height: 1.03; font-weight: 800; letter-spacing: -.02em; margin: 0 0 14px; }\r\n.nf-dlogo { max-width: min(420px, 100%); max-height: 140px; object-fit: contain; object-position: left; margin-bottom: 16px; display: block; }\r\n.nf-tagline { font-style: italic; color: #cfcfd4; margin: 0 0 10px; }\r\n.nf-dinfo .ov { font-size: 16px; line-height: 1.6; color: #e4e4e8; margin: 0 0 24px; }\r\n.nf-facts { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; font-size: 14px; margin-top: 22px; }\r\n.nf-facts dt { color: #7c7c84; } .nf-facts dd { margin: 0; color: #d6d6da; }\r\n.nf-resume-bar { width: 160px; height: 4px; background: rgba(255,255,255,.25); border-radius: 4px; margin-top: 12px; overflow: hidden; }\r\n.nf-resume-bar i { display: block; height: 100%; background: #fff; border-radius: 4px; }\r\n.nf-sect { margin-top: 52px; }\r\n.nf-sect h2 { font-size: 22px; margin: 0 0 16px; letter-spacing: -.01em; }\r\n.nf-seasons { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }\r\n.nf-chip { padding: 9px 18px; border-radius: 999px; background: rgba(255,255,255,.09); font-size: 14px; font-weight: 500; transition: .2s; }\r\n.nf-chip:hover { background: rgba(255,255,255,.18); }\r\n.nf-chip.on { background: #fff; color: #000; font-weight: 600; }\r\n.nf-eps { display: flex; flex-direction: column; gap: 8px; }\r\n.nf-ep { display: grid; grid-template-columns: 36px 200px 1fr auto; gap: 20px; align-items: center; padding: 12px 18px 12px 12px; background: rgba(255,255,255,.04); border-radius: 16px; cursor: pointer; transition: background .2s; }\r\n.nf-ep:hover { background: rgba(255,255,255,.1); }\r\n.nf-ep .n { font-size: 20px; color: #bdbdc2; text-align: center; }\r\n.nf-ep .th { position: relative; aspect-ratio: 16/9; background: var(--surface-2) center/cover; border-radius: 10px; overflow: hidden; }\r\n.nf-ep .th .prog { position: absolute; left: 8px; right: 8px; bottom: 6px; height: 4px; border-radius: 4px; background: rgba(255,255,255,.3); overflow: hidden; }\r\n.nf-ep .th .prog i { display: block; height: 100%; background: #fff; }\r\n.nf-ep .tt { display: flex; justify-content: space-between; gap: 12px; font-weight: 600; margin-bottom: 6px; }\r\n.nf-ep .ds { font-size: 14px; color: #b4b4ba; line-height: 1.45; }\r\n.nf-ep .seen { color: #5ee08a; }\r\n.nf-cast { display: flex; gap: 18px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }\r\n.nf-person { flex: none; width: 96px; text-align: center; font-size: 12.5px; }\r\n.nf-person .pi { width: 96px; height: 96px; border-radius: 50%; background: var(--surface-2) center/cover; margin-bottom: 8px; }\r\n.nf-person small { display: block; color: #85858c; margin-top: 2px; }\r\n\r\n.nf-npill { position: fixed; z-index: 60; right: 20px; bottom: 20px; display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; background: rgba(30,30,34,.92); backdrop-filter: blur(16px); border: 1px solid var(--line); border-radius: 18px; box-shadow: 0 12px 36px rgba(0,0,0,.55); max-width: 320px; cursor: pointer; }\r\n.nf-npill .cv { width: 44px; height: 44px; border-radius: 10px; background: #333 center/cover; }\r\n.nf-npill .tx { min-width: 0; font-size: 13px; } .nf-npill .tx b { display: block; } .nf-npill .tx span { color: var(--dim); }\r\n.nf-npill .pp { width: 36px; height: 36px; border-radius: 50%; background: #fff; color: #000; display: grid; place-items: center; }\r\n\r\n.cx-tabs { display: none; }\r\n\r\n/* NETFLIX MOBILE */\r\n@media (max-width: 800px) {\r\n  :is(#cx, #cx-ui) { --pad: 14px; }\r\n  .nf-nav { height: 58px; gap: 12px; }\r\n  .nf-logo { font-size: 20px; }\r\n  .nf-links { display: none; }\r\n  .nf-hero { margin-top: 68px; height: 68vh; min-height: 420px; border-radius: 22px; }\r\n  .nf-slide { background-position: 62% center; }\r\n  .nf-hero::after { background: linear-gradient(to top, rgba(8,8,10,.92) 0%, rgba(8,8,10,.35) 55%, rgba(8,8,10,0) 100%); }\r\n  .nf-hero-body { left: 0; right: 0; bottom: 18px; width: auto; padding: 0 18px; text-align: center; display: flex; flex-direction: column; align-items: center; }\r\n  .nf-hero-logo { object-position: center bottom; max-height: 96px; }\r\n  .nf-meta { justify-content: center; font-size: 12.5px; }\r\n  .nf-overview { display: none; }\r\n  .nf-hero-btns { justify-content: center; }\r\n  .nf-dots { display: none; }\r\n  .btn { height: 44px; font-size: 14.5px; padding: 0 20px 0 15px; }\r\n  .btn.round { width: 44px; padding: 0; }\r\n  .nf-rows { margin-top: 24px; padding-bottom: 150px; }\r\n  .nf-row { margin-bottom: 22px; }\r\n  .nf-row h2 { font-size: 17px; }\r\n  .nf-scroller { gap: 10px; scroll-snap-type: x proximity; }\r\n  .nf-arrow { display: none; }\r\n  .nf-card { width: 44vw; } .nf-card.poster { width: 31vw; }\r\n  .nf-card .info { display: none; }\r\n  .nf-page-pad { padding: 76px var(--pad) 150px; }\r\n  .nf-grid { grid-template-columns: repeat(3, 1fr); gap: 16px 10px; }\r\n  .nf-dbody { padding: 70px var(--pad) 150px; }\r\n  .nf-dhead { flex-direction: column; align-items: flex-start; gap: 18px; }\r\n  .nf-dposter { width: 44vw; border-radius: 16px; }\r\n  .nf-dback::after { background: linear-gradient(to top, #111113 24%, rgba(17,17,19,.6) 70%, rgba(17,17,19,.75)); }\r\n  .nf-ep { grid-template-columns: 112px 1fr; gap: 12px; padding: 10px; }\r\n  .nf-ep .n, .nf-ep .rt { display: none; }\r\n  .nf-npill { right: 10px; left: 10px; bottom: 74px; max-width: none; }\r\n  .cx-tabs { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(10px + env(safe-area-inset-bottom, 0)); z-index: 70; height: 62px; border-radius: 22px; background: rgba(28,28,32,.88); backdrop-filter: blur(20px); border: 1px solid var(--line); justify-content: space-around; box-shadow: 0 10px 30px rgba(0,0,0,.5); }\r\n  .cx-tabs a, .cx-tabs button { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 10.5px; color: #8e8e95; }\r\n  .cx-tabs a.on, .cx-tabs button.on { color: #fff; }\r\n  .cx-tabs svg { width: 22px; height: 22px; }\r\n  .nf-npill { bottom: 84px; }\r\n}\r\n\r\n/* =====================================================================\r\n   SPOTIFY SHELL\r\n   ===================================================================== */\r\n#cx-sp { position: absolute; inset: 0; background: #000; display: grid; grid-template-columns: 320px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 88px; gap: 8px; padding: 8px; --accent: #1ed760; }\r\n#cx-sp.idle { grid-template-rows: minmax(0, 1fr) 0; row-gap: 0; }\r\n.sp-side { grid-row: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0; }\r\n.sp-card { background: #121212; border-radius: 8px; }\r\n.sp-top { padding: 12px 12px 8px; }\r\n.sp-navlink { display: flex; align-items: center; gap: 18px; padding: 10px 12px; font-weight: 700; color: #b3b3b3; border-radius: 6px; transition: color .2s; width: 100%; font-size: 16px; }\r\n.sp-navlink:hover, .sp-navlink.on { color: #fff; }\r\n.sp-lib { flex: 1; min-height: 0; display: flex; flex-direction: column; }\r\n.sp-libhead { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 8px 20px; font-weight: 700; color: #b3b3b3; }\r\n.sp-libhead button { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #b3b3b3; }\r\n.sp-libhead button:hover { background: #1f1f1f; color: #fff; }\r\n.sp-chips { display: flex; gap: 8px; padding: 4px 16px 10px; flex-wrap: wrap; }\r\n.sp-chip { padding: 6px 12px; border-radius: 16px; background: #2a2a2a; font-size: 13px; font-weight: 500; transition: .2s; }\r\n.sp-chip:hover { background: #333; }\r\n.sp-chip.on { background: #fff; color: #000; }\r\n.sp-liblist { flex: 1; overflow-y: auto; padding: 0 8px 8px; }\r\n.sp-li { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 6px; cursor: pointer; width: 100%; text-align: left; }\r\n.sp-li:hover { background: #1a1a1a; }\r\n.sp-li.on { background: #232323; }\r\n.sp-li .art { width: 48px; height: 48px; border-radius: 4px; background: #282828 center/cover; flex: none; display: grid; place-items: center; }\r\n.sp-li.round .art { border-radius: 50%; }\r\n.sp-li .nm { font-size: 16px; font-weight: 500; } .sp-li .nm.playing { color: var(--accent); }\r\n.sp-li .sb { font-size: 14px; color: #b3b3b3; margin-top: 2px; }\r\n.sp-li > div:last-child { min-width: 0; }\r\n.liked-art { background: linear-gradient(135deg, #450af5, #c4efd9) !important; }\r\n.sp-main { grid-row: 1; grid-column: 2; position: relative; overflow: hidden; border-radius: 8px; background: #121212; min-height: 0; }\r\n.sp-scroll { position: absolute; inset: 0; overflow-y: auto; scroll-behavior: auto; }\r\n.sp-bg { position: absolute; left: 0; right: 0; top: 0; height: 340px; background: linear-gradient(180deg, var(--tint, #333) 0%, #121212 100%); opacity: .55; pointer-events: none; transition: background .6s; }\r\n.sp-header { position: sticky; top: 0; z-index: 10; height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 24px; transition: background .25s; }\r\n.sp-header.solid { background: #121212ee; backdrop-filter: blur(8px); }\r\n.sp-hbtn { width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,.7); display: grid; place-items: center; }\r\n.sp-hbtn:hover { background: rgba(0,0,0,.9); }\r\n.sp-hsearch { display: flex; align-items: center; gap: 10px; background: #242424; border-radius: 500px; height: 46px; padding: 0 14px; width: min(420px, 100%); border: 2px solid transparent; }\r\n.sp-hsearch:focus-within { border-color: #fff; background: #2a2a2a; }\r\n.sp-hsearch input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; font-size: 15px; }\r\n.sp-pillbtn { padding: 8px 18px; border-radius: 500px; background: #fff; color: #000; font-weight: 700; font-size: 14px; }\r\n.sp-pillbtn:hover { transform: scale(1.04); }\r\n.sp-pillbtn.dark { background: rgba(0,0,0,.7); color: #fff; }\r\n.sp-content { position: relative; padding: 0 24px 40px; animation: cxfade .35s both; }\r\n.sp-content h2 { font-size: 24px; font-weight: 700; margin: 36px 0 14px; letter-spacing: -.01em; }\r\n.sp-content h2 .more { font-size: 13px; color: #b3b3b3; float: right; margin-top: 10px; font-weight: 700; }\r\n.sp-greet { font-size: 30px; font-weight: 800; margin: 12px 0 20px; }\r\n.sp-quick { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }\r\n.sp-qt { display: flex; align-items: center; gap: 14px; height: 64px; border-radius: 4px; background: rgba(255,255,255,.08); overflow: hidden; cursor: pointer; position: relative; padding-right: 60px; transition: background .25s; }\r\n.sp-qt:hover { background: rgba(255,255,255,.18); }\r\n.sp-qt .art { width: 64px; height: 64px; background: #333 center/cover; flex: none; }\r\n.sp-qt b { font-size: 15px; }\r\n.sp-qt .pbtn { right: 12px; top: 12px; }\r\n.sp-shelf { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(170px, 1fr); gap: 16px; overflow: hidden; }\r\n.sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(176px, 1fr)); gap: 16px; }\r\n.sp-tile { position: relative; padding: 12px; border-radius: 8px; background: #181818; cursor: pointer; transition: background .3s; min-width: 0; }\r\n.sp-tile:hover { background: #282828; }\r\n.sp-tile .cv { position: relative; aspect-ratio: 1; border-radius: 6px; background: #333 center/cover; box-shadow: 0 8px 24px rgba(0,0,0,.5); margin-bottom: 14px; display: grid; place-items: center; overflow: hidden; }\r\n.sp-tile.round .cv { border-radius: 50%; }\r\n.sp-tile .nm { font-weight: 700; font-size: 16px; margin-bottom: 4px; }\r\n.sp-tile .sb { font-size: 14px; color: #a7a7a7; line-height: 1.35; }\r\n.sp-tile.round .nm, .sp-tile.round .sb { text-align: left; }\r\n.pbtn { position: absolute; right: 20px; bottom: 74px; width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: #000; display: grid !important; place-items: center; box-shadow: 0 8px 8px rgba(0,0,0,.3); opacity: 0; transform: translateY(8px); transition: .3s; z-index: 2; }\r\n.sp-tile:hover .pbtn, .sp-qt:hover .pbtn, .pbtn.show { opacity: 1; transform: none; }\r\n.pbtn:hover { transform: scale(1.06) !important; background: #3be477; }\r\n.mixcv { width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 12px; font-weight: 800; font-size: 20px; line-height: 1.1; }\r\n.cv-ph { color: #7a7a7a; }\r\n.cv-ph svg { width: 40%; height: 40%; }\r\n\r\n/* playlist / album header */\r\n.sp-ph { display: flex; align-items: flex-end; gap: 24px; padding: 24px 0 24px; min-height: 280px; }\r\n.sp-ph .cv { width: clamp(150px, 15vw, 232px); aspect-ratio: 1; border-radius: 4px; background: #333 center/cover; box-shadow: 0 4px 60px rgba(0,0,0,.5); flex: none; display: grid; place-items: center; }\r\n.sp-ph.artist .cv { border-radius: 50%; }\r\n.sp-ph .tp { font-size: 14px; font-weight: 700; margin-bottom: 4px; }\r\n.sp-ph h1 { font-size: clamp(32px, 6vw, 88px); font-weight: 900; line-height: 1; margin: 0 0 18px; letter-spacing: -.04em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; padding-bottom: 4px; }\r\n.sp-ph .mt { font-size: 14px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; color: #e0e0e0; }\r\n.sp-ph .mt a:hover { text-decoration: underline; }\r\n.sp-actions { display: flex; align-items: center; gap: 24px; padding: 8px 0 20px; }\r\n.sp-big { width: 56px; height: 56px; border-radius: 50%; background: var(--accent); color: #000; display: grid; place-items: center; transition: transform .1s; }\r\n.sp-big:hover { transform: scale(1.06); background: #3be477; }\r\n.sp-big svg { width: 28px; height: 28px; }\r\n.sp-ico { color: #b3b3b3; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; }\r\n.sp-ico:hover { color: #fff; }\r\n.sp-ico.on { color: var(--accent); }\r\n.sp-ico svg { width: 30px; height: 30px; }\r\n\r\n/* track table */\r\n.sp-th, .sp-row { display: grid; grid-template-columns: 16px minmax(120px, 6fr) minmax(80px, 4fr) minmax(60px, 3fr) 80px; gap: 16px; align-items: center; padding: 0 16px; }\r\n.sp-th.noalb, .sp-row.noalb { grid-template-columns: 16px minmax(120px, 6fr) minmax(60px, 3fr) 80px; }\r\n.sp-th { height: 36px; color: #b3b3b3; font-size: 13px; border-bottom: 1px solid #ffffff1a; margin-bottom: 8px; position: sticky; top: 64px; background: #121212; z-index: 5; text-transform: none; }\r\n.sp-th > :last-child { text-align: right; }\r\n.sp-row { height: 56px; border-radius: 4px; color: #b3b3b3; font-size: 14px; cursor: default; }\r\n.sp-row:hover { background: rgba(255,255,255,.1); }\r\n.sp-row .ix { text-align: right; position: relative; font-variant-numeric: tabular-nums; }\r\n.sp-row .ix .pl { position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: #fff; display: none; }\r\n.sp-row .ix .pl svg { width: 18px; height: 18px; }\r\n.sp-row:hover .ix .n { display: none; } .sp-row:hover .ix .pl { display: block; }\r\n.sp-row .ti { display: flex; align-items: center; gap: 14px; min-width: 0; }\r\n.sp-row .ti .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\r\n.sp-row .ti .tx { min-width: 0; }\r\n.sp-row .ti .tn { color: #fff; font-size: 16px; }\r\n.sp-row .ti .ta { font-size: 14px; }\r\n.sp-row .ti .ta a:hover, .sp-row .al a:hover { text-decoration: underline; color: #fff; }\r\n.sp-row.playing .tn, .sp-row.playing .ix .n { color: var(--accent); }\r\n.sp-row .du { display: flex; align-items: center; justify-content: flex-end; gap: 14px; font-variant-numeric: tabular-nums; }\r\n.sp-row .du .lk { opacity: 0; color: #b3b3b3; } .sp-row:hover .du .lk { opacity: 1; } .sp-row .du .lk.on { opacity: 1; color: var(--accent); }\r\n.sp-row .du .lk svg { width: 18px; height: 18px; }\r\n.sp-row .du .mo { opacity: 0; } .sp-row:hover .du .mo { opacity: 1; }\r\n.sp-row .du .mo svg { width: 20px; height: 20px; }\r\n.sp-row .eq { display: none; }\r\n.sp-row.playing .ix .n { visibility: hidden; }\r\n.sp-row.playing .ix .eq { display: flex; align-items: flex-end; gap: 2px; height: 14px; position: absolute; right: 2px; top: 50%; transform: translateY(-50%); }\r\n.sp-row.playing:hover .ix .eq { display: none; }\r\n.eq i { width: 3px; background: var(--accent); animation: cxeq 1s infinite ease-in-out; height: 40%; }\r\n.eq i:nth-child(2) { animation-delay: .2s; } .eq i:nth-child(3) { animation-delay: .4s; }\r\n.paused .eq i { animation-play-state: paused; }\r\n@keyframes cxeq { 0%,100% { height: 25%; } 50% { height: 100%; } }\r\n.sp-disc { margin: 20px 0 6px; font-weight: 700; color: #b3b3b3; display: flex; align-items: center; gap: 10px; padding: 0 16px; }\r\n\r\n/* search results */\r\n.sp-res { display: grid; grid-template-columns: minmax(280px, 2fr) 3fr; gap: 24px; }\r\n.sp-top1 { padding: 20px; border-radius: 8px; background: #181818; cursor: pointer; position: relative; transition: background .3s; }\r\n.sp-top1:hover { background: #282828; }\r\n.sp-top1 .cv { width: 92px; height: 92px; border-radius: 6px; background: #333 center/cover; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,.5); }\r\n.sp-top1.round .cv { border-radius: 50%; }\r\n.sp-top1 b { font-size: 30px; display: block; margin-bottom: 6px; }\r\n.sp-top1 span { color: #b3b3b3; font-size: 14px; }\r\n.sp-genres { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }\r\n.sp-genre { position: relative; height: 110px; border-radius: 8px; padding: 14px; font-size: 20px; font-weight: 800; overflow: hidden; cursor: pointer; }\r\n\r\n/* player bar */\r\n.sp-player { grid-column: 1 / -1; grid-row: 2; display: grid; grid-template-columns: minmax(180px, 30%) minmax(300px, 40%) minmax(180px, 30%); align-items: center; padding: 0 8px; gap: 8px; }\r\n.pl-l { display: flex; align-items: center; gap: 14px; min-width: 0; }\r\n.pl-l .cv { width: 56px; height: 56px; border-radius: 4px; background: #282828 center/cover; flex: none; cursor: pointer; }\r\n.pl-l .tx { min-width: 0; } .pl-l .tn { font-size: 14px; } .pl-l .tn:hover, .pl-l .ta a:hover { text-decoration: underline; cursor: pointer; }\r\n.pl-l .ta { font-size: 12px; color: #b3b3b3; }\r\n.pl-c { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 722px; width: 100%; margin: 0 auto; }\r\n.pl-btns { display: flex; align-items: center; gap: 16px; }\r\n.pl-btn { color: #b3b3b3; width: 32px; height: 32px; display: grid; place-items: center; position: relative; }\r\n.pl-btn:hover { color: #fff; }\r\n.pl-btn.on { color: var(--accent); }\r\n.pl-btn.on::after { content: \"\"; position: absolute; bottom: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }\r\n.pl-btn svg { width: 20px; height: 20px; }\r\n.pl-btn.big { background: #fff; color: #000; border-radius: 50%; width: 36px; height: 36px; }\r\n.pl-btn.big:hover { transform: scale(1.06); background: #fff; color: #000; }\r\n.pl-btn.big svg { width: 22px; height: 22px; }\r\n.pl-seek { display: flex; align-items: center; gap: 8px; width: 100%; font-size: 11px; color: #a7a7a7; font-variant-numeric: tabular-nums; }\r\n.pl-seek span { width: 40px; } .pl-seek span:first-child { text-align: right; }\r\n.bar { position: relative; flex: 1; height: 12px; display: flex; align-items: center; cursor: pointer; touch-action: none; }\r\n.bar::before { content: \"\"; position: absolute; left: 0; right: 0; height: 4px; border-radius: 2px; background: #4d4d4d; }\r\n.bar i { position: absolute; left: 0; height: 4px; border-radius: 2px; background: #fff; pointer-events: none; }\r\n.bar b { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #fff; margin-left: -6px; opacity: 0; pointer-events: none; }\r\n.bar:hover i { background: var(--accent); } .bar:hover b { opacity: 1; }\r\n.pl-r { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }\r\n.pl-r .bar { flex: none; width: 100px; }\r\n\r\n.sp-menu { position: fixed; z-index: 9600; min-width: 220px; max-width: 300px; max-height: 70vh; overflow-y: auto; background: #282828; border-radius: 4px; padding: 4px; box-shadow: 0 16px 24px rgba(0,0,0,.4); font-size: 14px; color: #eee; }\r\n.sp-menu button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; text-align: left; border-radius: 2px; }\r\n.sp-menu button:hover { background: rgba(255,255,255,.1); }\r\n.sp-menu hr { border: 0; border-top: 1px solid #ffffff1a; margin: 4px 0; }\r\n.sp-modal-bg { position: fixed; inset: 0; z-index: 9700; background: rgba(0,0,0,.7); display: grid; place-items: center; padding: 16px; }\r\n.sp-modal { background: #282828; border-radius: 8px; padding: 24px; width: min(420px, 100%); }\r\n.sp-modal h3 { margin: 0 0 16px; font-size: 22px; }\r\n.sp-modal input { width: 100%; padding: 12px; border-radius: 4px; border: 0; background: #3e3e3e; font-size: 15px; outline: 0; }\r\n.sp-modal .row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }\r\n.sp-queue { position: absolute; top: 8px; right: 8px; bottom: 96px; width: 340px; background: #121212; border-radius: 8px; z-index: 30; overflow-y: auto; padding: 16px 8px; box-shadow: 0 0 30px rgba(0,0,0,.6); }\r\n.sp-queue h3 { margin: 8px 12px; font-size: 16px; } .sp-queue h4 { margin: 18px 12px 6px; color: #b3b3b3; font-size: 14px; }\r\n.sp-qi { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 4px; cursor: pointer; }\r\n.sp-qi:hover { background: #ffffff14; } .sp-qi .cv { width: 40px; height: 40px; background: #333 center/cover; border-radius: 3px; } .sp-qi.playing b { color: var(--accent); }\r\n.sp-qi span { color: #b3b3b3; font-size: 13px; display: block; }\r\n.sp-qi > div { min-width: 0; }\r\n\r\n/* full-screen mobile player */\r\n.sp-full { position: fixed; inset: 0; z-index: 9500; display: none; flex-direction: column; padding: 14px 24px calc(24px + env(safe-area-inset-bottom, 0)); background: linear-gradient(180deg, var(--tint, #333), #121212 80%); overflow-y: auto; }\r\n.sp-full.open { display: flex; animation: cxfade .25s both; }\r\n.sp-full .top { display: flex; justify-content: space-between; align-items: center; height: 48px; }\r\n.sp-full .top b { font-size: 13px; }\r\n.sp-full .cvbig { width: 100%; max-width: 420px; aspect-ratio: 1; margin: 22px auto 28px; border-radius: 8px; background: #333 center/cover; box-shadow: 0 16px 50px rgba(0,0,0,.5); }\r\n.sp-full .meta { display: flex; align-items: center; justify-content: space-between; max-width: 420px; width: 100%; margin: 0 auto 10px; gap: 12px; }\r\n.sp-full .meta .tn { font-size: 22px; font-weight: 800; } .sp-full .meta .ta { color: #cfcfcf; margin-top: 4px; }\r\n.sp-full .seekwrap { max-width: 420px; width: 100%; margin: 6px auto; }\r\n.sp-full .seekwrap .pl-seek { margin-top: 2px; } .sp-full .seekwrap .bar::before { background: #ffffff44; }\r\n.sp-full .ctr { display: flex; justify-content: space-between; align-items: center; max-width: 420px; width: 100%; margin: 10px auto; }\r\n.sp-full .ctr .pl-btn svg { width: 28px; height: 28px; } .sp-full .ctr .pl-btn.big { width: 64px; height: 64px; } .sp-full .ctr .pl-btn.big svg { width: 34px; height: 34px; }\r\n\r\n.sp-mini { display: none; }\r\n\r\n/* =====================================================================\r\n   SPOTIFY MOBILE\r\n   ===================================================================== */\r\n@media (max-width: 800px) {\r\n  #cx-sp { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); padding: 0; gap: 0; }\r\n  .sp-side { display: none; }\r\n  .sp-main { grid-column: 1; border-radius: 0; background: #121212; }\r\n  .sp-header { height: 54px; padding: 0 14px; }\r\n  .sp-content { padding: 0 14px calc(150px + env(safe-area-inset-bottom, 0)); }\r\n  .sp-content h2 { font-size: 20px; margin: 26px 0 12px; }\r\n  .sp-greet { font-size: 24px; }\r\n  .sp-quick { grid-template-columns: 1fr 1fr; gap: 8px; }\r\n  .sp-qt { height: 56px; padding-right: 8px; } .sp-qt .art { width: 56px; height: 56px; } .sp-qt b { font-size: 13px; } .sp-qt .pbtn { display: none !important; }\r\n  .sp-shelf { grid-auto-flow: column; grid-auto-columns: 40vw; overflow-x: auto; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; gap: 12px; }\r\n  .sp-shelf::-webkit-scrollbar { display: none; }\r\n  .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }\r\n  .sp-tile { padding: 0; background: none; } .sp-tile:hover { background: none; }\r\n  .sp-tile .cv { margin-bottom: 8px; } .sp-tile .pbtn { display: none !important; } .sp-tile .nm { font-size: 14px; } .sp-tile .sb { font-size: 12px; }\r\n  .sp-ph { flex-direction: column; align-items: center; text-align: center; min-height: 0; padding: 4px 0 6px; gap: 16px; }\r\n  .sp-ph .cv { width: 62vw; max-width: 280px; }\r\n  .sp-ph h1 { font-size: 26px; letter-spacing: -.02em; margin-bottom: 8px; -webkit-line-clamp: 2; }\r\n  .sp-ph .mt { justify-content: center; font-size: 13px; }\r\n  .sp-ph > div:last-child { width: 100%; }\r\n  .sp-actions { gap: 18px; padding: 4px 0 14px; }\r\n  .sp-actions .sp-big { margin-left: auto; order: 9; }\r\n  .sp-th { display: none; }\r\n  .sp-row, .sp-row.noalb { grid-template-columns: minmax(0, 1fr) auto; height: 58px; padding: 0; gap: 8px; }\r\n  .sp-row .ix, .sp-row .al { display: none !important; }\r\n  .sp-row .du { gap: 4px; } .sp-row .du .tm { display: none; } .sp-row .du .lk, .sp-row .du .mo { opacity: 1; } .sp-row .du .mo svg { width: 22px; height: 22px; }\r\n  .sp-row.playing .ti .tn { color: var(--accent); }\r\n  .sp-res { grid-template-columns: 1fr; }\r\n  .sp-queue { top: 0; right: 0; left: 0; bottom: 0; width: auto; border-radius: 0; z-index: 9550; }\r\n  .sp-player { display: none; }\r\n  .sp-mini { display: flex; position: fixed; left: 8px; right: 8px; bottom: calc(62px + env(safe-area-inset-bottom, 0)); z-index: 80; height: 56px; border-radius: 8px; align-items: center; gap: 10px; padding: 0 8px; background: var(--mini, #3a3350); box-shadow: 0 4px 16px rgba(0,0,0,.4); overflow: hidden; }\r\n  .sp-mini .cv { width: 40px; height: 40px; border-radius: 4px; background: #333 center/cover; flex: none; }\r\n  .sp-mini .tx { flex: 1; min-width: 0; font-size: 13px; } .sp-mini .tx b { display: block; } .sp-mini .tx span { color: #e0e0e0cc; font-size: 12px; }\r\n  .sp-mini .pl-btn { color: #fff; width: 38px; height: 38px; } .sp-mini .pl-btn svg { width: 26px; height: 26px; }\r\n  .sp-mini .mbar { position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; background: #ffffff44; } .sp-mini .mbar i { display: block; height: 100%; background: #fff; }\r\n}\r\n\r\n#cx.mode-nf .sp-mini, #cx.mode-nf .sp-full { display: none !important; }\r\n#cx.mode-nf .sp-full.open { display: none !important; }\r\n\r\n/* ---- Spotify polish: softer, rounder ---- */\r\n.sp-card, .sp-main { border-radius: 16px; }\r\n.sp-main, .sp-card { background: #121214; }\r\n#cx-sp { background: #08080a; }\r\n.sp-tile { border-radius: 16px; background: #17171a; }\r\n.sp-tile .cv { border-radius: 12px; }\r\n.sp-qt { border-radius: 10px; }\r\n.sp-li { border-radius: 10px; } .sp-li .art { border-radius: 8px; }\r\n.sp-chip, .sp-pillbtn { border-radius: 999px; }\r\n.sp-row { border-radius: 10px; }\r\n.sp-ph .cv { border-radius: 14px; }\r\n.sp-menu, .sp-modal { border-radius: 14px; }\r\n.sp-top1 { border-radius: 16px; } .sp-genre { border-radius: 14px; }\r\n.sp-queue { border-radius: 16px; }\r\n.sp-mini { border-radius: 16px !important; bottom: calc(84px + env(safe-area-inset-bottom, 0)) !important; }\r\n.nf-card.poster .info .t { display: none; }\r\n.nf-card.poster .info { justify-content: flex-end; }\r\n\n/* =====================================================================\r\n   INTEGRATION: persistent top bar, hover, rounder icons\r\n   ===================================================================== */\r\n:is(#cx, #cx-ui) svg path { stroke: currentColor; stroke-width: .4; stroke-linejoin: round; stroke-linecap: round; }\r\n#cx-ui .nf-nav { position: fixed; z-index: 9100; display: none; }\r\n#cx-ui .nf-nav.solid { background: rgba(17,17,19,.9); }\r\n.nf-pillbtn { display: inline-flex; align-items: center; gap: 4px; padding: 9px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; color: #d6d6d9; }\r\n.nf-pillbtn:hover { background: rgba(255,255,255,.08); color: #fff; }\r\n.nf-more .nf-pop { left: 0; right: auto; }\r\n.nf-pop a { display: flex !important; align-items: center; gap: 12px; }\r\n.nf-pop a.on { background: rgba(255,255,255,.1); }\r\n.m-opt { display: none !important; }\r\n.nf-pop.up { position: fixed; right: 12px; left: auto; top: auto; bottom: 88px; z-index: 9200; }\r\n@media (max-width: 1280px) { .nf-links a.opt { display: none; } .m-opt { display: flex !important; } }\r\n@media (max-width: 1000px) { .nf-links a[data-k=\"watchlist\"] { display: none; } }\r\n.cx-tabs.hide { display: none !important; }\r\n#cx-ui .cx-tabs { z-index: 9100; }\r\n@media (min-width: 801px) { #cx-ui .cx-tabs, #cx-ui .nf-pop.up { display: none !important; } }\r\n#cx-ui .nf-pop.hide { display: none !important; }\r\n\r\n/* richer card hover: tilt, spotlight, zooming image, info overlay */\r\n.nf-card .im { transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transform-style: preserve-3d; will-change: transform; }\r\n.nf-card .im .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .7s cubic-bezier(.2,.7,.2,1); }\r\n.nf-card .im::before { content: \"\"; position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity .3s;\r\n  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.22), rgba(255,255,255,0) 65%); }\r\n.nf-card .im::after { z-index: 1; }\r\n@media (hover: hover) and (pointer: fine) {\r\n  .nf-card .im { transition: transform .12s ease-out, box-shadow .35s; }\r\n  .nf-card:hover .im { transform: perspective(800px) translateY(-6px) scale(1.04) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); box-shadow: 0 22px 44px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.18); }\r\n  .nf-card:hover .im::before { opacity: 1; }\r\n  .nf-card:hover .im .bgi { transform: scale(1.1); }\r\n}\r\n.nf-card .info { z-index: 3; flex-wrap: wrap; align-items: flex-end; gap: 6px 8px; left: 14px; right: 14px; bottom: 14px; }\r\n.nf-card .info .t { flex: 1 0 100%; font-size: 15px; font-weight: 700; }\r\n.nf-card .info .m { display: flex !important; flex: 1 0 100%; gap: 8px; font-size: 12px; color: #d4d4d8; margin-bottom: 4px; }\r\n.nf-card .info .m span + span::before { content: \"•\"; margin-right: 8px; opacity: .5; }\r\n.nf-card .acts { display: flex !important; gap: 8px; width: 100%; order: 3; }\r\n.nf-card .acts button { display: grid !important; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.18); backdrop-filter: blur(8px); border: 0 !important; place-items: center; transition: transform .2s, background .2s; }\r\n.nf-card .acts button svg { width: 18px; height: 18px; }\r\n.nf-card .acts button:hover { background: rgba(255,255,255,.3); transform: scale(1.1); }\r\n.nf-card .acts button.pl { background: #fff; color: #000; order: 0; }\r\n.nf-card.poster .info { left: 10px; right: 10px; bottom: 10px; }\r\n.nf-card.poster .info .t { display: block; font-size: 13px; }\r\n.nf-card.poster .info .m { font-size: 11px; }\r\n.nf-card.poster .acts button { width: 34px; height: 34px; }\r\n.nf-card.poster .acts button:nth-child(3) { display: none !important; }\r\n\r\n/* =====================================================================\r\n   NATIVE JELLYFIN PAGES (settings, dashboard, plugin pages) - skinned to match\r\n   ===================================================================== */\r\nhtml.cx-ready:not(.transparentDocument) body, html.cx-ready:not(.transparentDocument) .backgroundContainer, html.cx-ready:not(.transparentDocument) .skinBody { background: #111113 !important; }\r\nhtml.cx-ready.transparentDocument body, html.cx-ready.transparentDocument .backgroundContainer, html.cx-ready.transparentDocument .skinBody { background: transparent !important; }\r\nhtml.cx-ready :where(body, button, input, select, textarea, h1, h2, h3, h4, .MuiTypography-root, .MuiButtonBase-root, .listItemBodyText, .sectionTitle, .emby-input, .emby-select) { font-family: \"Inter\", \"Segoe UI\", system-ui, sans-serif; }\r\nhtml.cx-ready body { color: #e8e8ec; }\r\nhtml.cx-frame .skinHeader, html.cx-frame .MuiAppBar-root, html.cx-frame .headerTabs, html.cx-frame .mainDrawerHandle { display: none !important; }\r\nhtml.cx-frame .page, html.cx-frame .mainAnimatedPage { padding-top: 92px !important; }\r\nhtml.cx-frame .padded-top-focusscale, html.cx-frame .padded-top { padding-top: 0 !important; }\r\nhtml.cx-ready .skinHeader, html.cx-ready .MuiAppBar-root { background: rgba(17,17,19,.9) !important; backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,.06) !important; box-shadow: none !important; }\r\nhtml.cx-ready .MuiDrawer-paper, html.cx-ready .mainDrawer { background: #0d0d0f !important; border-right: 1px solid rgba(255,255,255,.06) !important; }\r\nhtml.cx-ready .MuiListItemButton-root, html.cx-ready .navMenuOption { border-radius: 12px !important; margin: 2px 10px !important; width: auto !important; transition: background .2s; }\r\nhtml.cx-ready .MuiListItemButton-root.Mui-selected, html.cx-ready .navMenuOption-selected { background: rgba(255,255,255,.1) !important; }\r\nhtml.cx-ready .MuiListItemButton-root:hover, html.cx-ready .navMenuOption:hover { background: rgba(255,255,255,.07) !important; }\r\nhtml.cx-ready .MuiPaper-root, html.cx-ready .paperList, html.cx-ready .dialog, html.cx-ready .actionSheet, html.cx-ready .formDialog { background: #1a1a1e !important; border-radius: 18px !important; color: #e8e8ec; box-shadow: 0 8px 30px rgba(0,0,0,.35) !important; border: 1px solid rgba(255,255,255,.05); }\r\nhtml.cx-ready .MuiMenu-paper, html.cx-ready .MuiPopover-paper { background: rgba(28,28,32,.97) !important; backdrop-filter: blur(20px); border-radius: 16px !important; }\r\nhtml.cx-ready .MuiMenuItem-root { border-radius: 10px !important; margin: 2px 6px !important; }\r\nhtml.cx-ready .MuiButton-root, html.cx-ready .emby-button.raised, html.cx-ready .button-submit, html.cx-ready .raised { border-radius: 999px !important; text-transform: none !important; font-weight: 600; }\r\nhtml.cx-ready .raised, html.cx-ready .button-submit, html.cx-ready .MuiButton-contained { background: #fff !important; color: #000 !important; box-shadow: none !important; }\r\nhtml.cx-ready .raised:hover, html.cx-ready .button-submit:hover, html.cx-ready .MuiButton-contained:hover { background: #e4e4e8 !important; }\r\nhtml.cx-ready .emby-input, html.cx-ready .emby-select, html.cx-ready .emby-textarea, html.cx-ready .MuiInputBase-root, html.cx-ready .MuiOutlinedInput-root { background: #1f1f24 !important; border-radius: 12px !important; border: 1px solid rgba(255,255,255,.08) !important; color: #fff; }\r\nhtml.cx-ready .emby-input:focus, html.cx-ready .emby-select:focus, html.cx-ready .emby-textarea:focus { border-color: rgba(255,255,255,.5) !important; outline: 0; }\r\nhtml.cx-ready .MuiOutlinedInput-notchedOutline { border: 0 !important; }\r\nhtml.cx-ready .listItem, html.cx-ready .listItem-border { border-radius: 14px !important; border-color: rgba(255,255,255,.06) !important; transition: background .2s; }\r\nhtml.cx-ready .listItem:hover { background: rgba(255,255,255,.05) !important; }\r\nhtml.cx-ready .cardScalable, html.cx-ready .cardImageContainer, html.cx-ready .cardImage, html.cx-ready .cardBox { border-radius: 14px !important; }\r\nhtml.cx-ready .cardText { color: #d4d4d8; }\r\nhtml.cx-ready .sectionTitle, html.cx-ready .sectionTitle-cards { font-weight: 700; letter-spacing: -.01em; }\r\nhtml.cx-ready .emby-tab-button { border-radius: 999px !important; }\r\nhtml.cx-ready .emby-tab-button-active { background: #fff !important; color: #000 !important; }\r\nhtml.cx-ready .checkboxIcon, html.cx-ready .emby-checkbox:checked + span + .checkboxOutline { border-radius: 6px !important; }\r\nhtml.cx-ready .emby-checkbox:checked + span::before, html.cx-ready .emby-radio:checked + span::before { background: #fff !important; }\r\nhtml.cx-ready ::-webkit-scrollbar { width: 12px; height: 12px; }\r\nhtml.cx-ready ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.22); border-radius: 12px; border: 3px solid transparent; background-clip: content-box; }\r\nhtml.cx-ready .MuiChip-root, html.cx-ready .MuiAvatar-root { border-radius: 999px; }\r\nhtml.cx-ready .MuiIconButton-root, html.cx-ready .paper-icon-button-light, html.cx-ready .headerButton { border-radius: 50% !important; }\r\n\r\n/* settings menu rows as rounded cards */\r\nhtml.cx-ready .listItem-border { background: #1a1a1e !important; margin: 0 0 10px !important; padding: 14px 18px !important; border: 1px solid rgba(255,255,255,.05) !important; }\r\nhtml.cx-ready .listItem-border:hover { background: #222227 !important; }\r\nhtml.cx-ready .listItem-border .listItemIcon { background: rgba(255,255,255,.1) !important; color: #fff; border-radius: 12px !important; width: 40px; height: 40px; display: grid; place-items: center; }\r\nhtml.cx-ready .listItem-border .listItemBodyText { font-weight: 600; font-size: 15px; }\r\nhtml.cx-ready .readOnlyContent h2, html.cx-ready .userProfilesIntro { font-size: 28px; font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-ready .dashboardColumn .cardBox, html.cx-ready .dashboardSection .card { background: #1a1a1e !important; }\r\nhtml.cx-ready .MuiToolbar-root { background: transparent; }\r\nhtml.cx-ready .MuiDrawer-paper .MuiListSubheader-root { background: transparent !important; text-transform: none; font-weight: 600; color: #8c8c94; }\r\n.nf-card.poster .info .t, .nf-card.poster .info .m { display: none !important; }\r\n.nf-card.poster .info { justify-content: center; }\r\n.nf-card.poster .acts { justify-content: center; }\r\n.nf-card .info .acts { pointer-events: auto; }\r\n\r\n/* hover overlay lives inside the image now */\r\n.nf-card .im .info { position: absolute; left: 12px; right: 12px; bottom: 12px; top: auto; background: none; padding: 0; box-shadow: none; border-radius: 0; opacity: 0; transform: translateY(8px); transition: opacity .25s, transform .25s; }\r\n.nf-card.poster .im .info { left: 10px; right: 10px; bottom: 10px; }\r\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im .info { opacity: 1; transform: none; transition-delay: .08s; } }\r\n.nf-card .im .info .t { text-shadow: 0 1px 8px rgba(0,0,0,.8); }\r\n:is(#cx, #cx-ui) .ic-s svg path, :is(#cx, #cx-ui) .nf-card .acts svg path { stroke-width: .3; }\r\n\r\n/* Discover (Seerr) cards: same look as library cards, plus an ownership mark */\r\n.dmark { position: absolute; top: 10px; left: 10px; z-index: 4; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px 4px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .01em; color: #e8e8ec; background: rgba(17,17,19,.72); backdrop-filter: blur(10px); border: 1px dashed rgba(255,255,255,.4); }\r\n.dmark svg { width: 12px !important; height: 12px !important; }\r\n.dmark.own { border-style: solid; border-color: rgba(94,224,138,.5); color: #7cf0a3; }\r\n.dmark.req { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\r\n.nf-card.notown .im { box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.12); }\r\n.nf-card.notown .im .bgi { filter: saturate(.85) brightness(.92); }\r\n.nf-card.notown:hover .im .bgi { filter: none; }\r\n/* menus now live in #cx-ui */\r\n.sp-menu button { background: none; color: #eee; font-size: 14px; }\r\n\n/* =====================================================================\r\n   PLUGIN PAGE SKIN (Jellyfin Enhanced, Seerr, Kefin) - scoped to html.cx-pskin\r\n   Toggle: avatar menu > Plugin page styling, or cinemaUI.skin(false) in the console.\r\n   ===================================================================== */\r\nhtml.cx-pskin { --pk-surface: #17171a; --pk-surface-2: #1f1f24; --pk-line: rgba(255,255,255,.07); --pk-accent: #fff; --pk-accent-text: #000; }\r\n\r\n/* ---------- calendar ---------- */\r\nhtml.cx-pskin .je-calendar-page { padding-top: 4px; }\r\nhtml.cx-pskin .je-calendar-day { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 16px !important; box-shadow: none; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-day:hover { background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today { border-color: rgba(255,255,255,.4) !important; background: #1d1d22 !important; }\r\nhtml.cx-pskin .je-calendar-day-number, html.cx-pskin .je-calendar-day-name, html.cx-pskin .je-calendar-weekday, html.cx-pskin .je-calendar-month-day-name { font-weight: 600; color: #d8d8dc !important; }\r\nhtml.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-number, html.cx-pskin .je-calendar-day.je-calendar-today .je-calendar-day-name { color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-card, html.cx-pskin .je-calendar-event { border-radius: 12px !important; overflow: hidden; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-card-image, html.cx-pskin .je-calendar-card-image-wrap { border-radius: 12px !important; }\r\nhtml.cx-pskin .je-calendar-play-btn, html.cx-pskin .je-calendar-play-btn-card { border-radius: 50% !important; background: #fff !important; color: #000 !important; }\r\nhtml.cx-pskin .je-calendar-view-btn, html.cx-pskin .je-calendar-mode-btn, html.cx-pskin .je-calendar-nav-btn, html.cx-pskin .je-calendar-nav-today, html.cx-pskin .je-calendar-filter-btn, html.cx-pskin .je-calendar-filter-toggle, html.cx-pskin .je-calendar-group-toggle {\r\n  border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600; transition: background .2s; }\r\nhtml.cx-pskin .je-calendar-view-btn:hover, html.cx-pskin .je-calendar-mode-btn:hover, html.cx-pskin .je-calendar-nav-btn:hover, html.cx-pskin .je-calendar-nav-today:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-calendar-view-btn.active, html.cx-pskin .je-calendar-mode-btn.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-calendar-nav-btn { width: 38px; height: 38px; padding: 0 !important; }\r\nhtml.cx-pskin .je-calendar-legend-item { border-radius: 999px !important; background: rgba(255,255,255,.06) !important; border: 1px solid transparent !important; padding: 7px 14px !important; }\r\nhtml.cx-pskin .je-calendar-legend-item.active { border-color: rgba(255,255,255,.5) !important; background: rgba(255,255,255,.12) !important; }\r\nhtml.cx-pskin .je-calendar-sidebar, html.cx-pskin .je-calendar-sidebar-content { background: var(--pk-surface) !important; border-radius: 20px !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-calendar-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .je-calendar-agenda-row, html.cx-pskin .je-calendar-agenda-event { border-radius: 14px !important; }\r\nhtml.cx-pskin .je-calendar-agenda-event { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- requests / downloads / issues ---------- */\r\nhtml.cx-pskin .je-request-card, html.cx-pskin .je-download-card, html.cx-pskin .je-issue-card { background: var(--pk-surface) !important; border: 1px solid var(--pk-line) !important; border-radius: 22px !important; box-shadow: none !important; transition: transform .25s, background .25s; }\r\nhtml.cx-pskin .je-request-card:hover, html.cx-pskin .je-download-card:hover { background: var(--pk-surface-2) !important; transform: translateY(-2px); }\r\nhtml.cx-pskin .je-request-poster, html.cx-pskin .je-download-poster { border-radius: 14px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-request-title, html.cx-pskin .je-download-title { font-weight: 700; letter-spacing: -.01em; }\r\nhtml.cx-pskin .je-requests-tab, html.cx-pskin .je-issues-tab, html.cx-pskin .je-downloads-tab { border-radius: 999px !important; background: rgba(255,255,255,.07) !important; border: 1px solid transparent !important; color: #e6e6ea !important; font-weight: 600 !important; padding: 8px 18px !important; transition: background .2s; }\r\nhtml.cx-pskin .je-requests-tab:hover, html.cx-pskin .je-issues-tab:hover, html.cx-pskin .je-downloads-tab:hover { background: rgba(255,255,255,.14) !important; }\r\nhtml.cx-pskin .je-requests-tab.active, html.cx-pskin .je-issues-tab.active, html.cx-pskin .je-downloads-tab.active { background: #fff !important; color: #000 !important; border-color: #fff !important; }\r\nhtml.cx-pskin .je-request-watch-btn, html.cx-pskin .je-refresh-btn { background: #fff !important; color: #000 !important; border-radius: 50% !important; box-shadow: none !important; }\r\nhtml.cx-pskin .je-request-approve-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-decline-btn { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-request-external-link, html.cx-pskin .je-issue-view-btn { border-radius: 50% !important; }\r\nhtml.cx-pskin .je-requests-status-chip, html.cx-pskin .je-status-chip, html.cx-pskin .je-issue-status-chip, html.cx-pskin .je-issue-type-chip, html.cx-pskin .je-download-badge, html.cx-pskin .je-arr-badge, html.cx-pskin .je-release-date-chip { border-radius: 999px !important; font-weight: 600; letter-spacing: .02em; }\r\nhtml.cx-pskin .je-download-progress-container, html.cx-pskin .je-download-progress { border-radius: 999px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-download-progress-bar { border-radius: 999px !important; background: #fff !important; }\r\nhtml.cx-pskin .je-downloads-search-input { border-radius: 999px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-pagination button, html.cx-pskin .je-pagination a { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-empty-state { color: #8c8c94; }\r\nhtml.cx-pskin .je-downloads-section .je-section-icon { color: #fff; }\r\n\r\n/* ---------- discover (Seerr) ---------- */\r\nhtml.cx-pskin .je-recommendations-title { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin .jellyseerr-card { border-radius: 20px !important; overflow: hidden; background: var(--pk-surface) !important; border: 1px solid var(--pk-line); transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s; }\r\nhtml.cx-pskin .jellyseerr-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.5); }\r\nhtml.cx-pskin .jellyseerr-poster-image, html.cx-pskin .je-tile-image, html.cx-pskin .je-genre-tile-image, html.cx-pskin .je-genre-tile-backdrop { border-radius: 18px !important; }\r\nhtml.cx-pskin .jellyseerr-media-badge, html.cx-pskin .jellyseerr-status-badge, html.cx-pskin .jellyseerr-collection-badge { border-radius: 999px !important; backdrop-filter: blur(8px); font-weight: 700; }\r\nhtml.cx-pskin .jellyseerr-request-button, html.cx-pskin .jellyseerr-split-main { border-radius: 999px !important; font-weight: 600; }\r\nhtml.cx-pskin .jellyseerr-split-arrow { border-radius: 0 999px 999px 0 !important; }\r\nhtml.cx-pskin .jellyseerr-hover-popover, html.cx-pskin .jellyseerr-4k-popup, html.cx-pskin .je-4k-popup { border-radius: 16px !important; background: rgba(28,28,32,.97) !important; backdrop-filter: blur(16px); }\r\nhtml.cx-pskin .je-scroll-btn { border-radius: 50% !important; background: rgba(30,30,34,.85) !important; backdrop-filter: blur(8px); border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin .je-genre-tile-title { font-weight: 800; }\r\n\r\n/* ---------- modals ---------- */\r\nhtml.cx-pskin .je-more-info-modal { border-radius: 26px !important; background: #17171a !important; border: 1px solid var(--pk-line); box-shadow: 0 30px 80px rgba(0,0,0,.7) !important; overflow: hidden; }\r\nhtml.cx-pskin .je-collection-card { border-radius: 18px !important; overflow: hidden; }\r\nhtml.cx-pskin .je-more-info-stats-panel, html.cx-pskin .je-more-info-right-panel { border-radius: 18px !important; background: var(--pk-surface-2) !important; }\r\nhtml.cx-pskin .je-modal-play-button, html.cx-pskin .je-more-info-button-group button { border-radius: 999px !important; }\r\nhtml.cx-pskin .je-launcher-panel, html.cx-pskin #je-header-launcher-panel { border-radius: 22px !important; background: rgba(28,28,32,.97) !important; border: 1px solid var(--pk-line) !important; }\r\n\r\n/* ---------- Kefin watchlist / custom pages ---------- */\r\nhtml.cx-pskin .kefin-custom-page-active .sectionTitle, html.cx-pskin [class*=\"watchlist\"] h1, html.cx-pskin [class*=\"watchlist\"] h2 { font-weight: 800; letter-spacing: -.02em; }\r\nhtml.cx-pskin [class*=\"watchlist\"] button, html.cx-pskin [class*=\"kefin\"] button.emby-button { border-radius: 999px; }\r\nhtml.cx-pskin [class*=\"watchlist\"] .card, html.cx-pskin [class*=\"watchlist\"] .cardBox { border-radius: 16px !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] input, html.cx-pskin [class*=\"kefin\"] select { border-radius: 12px !important; background: var(--pk-surface-2) !important; border: 1px solid var(--pk-line) !important; }\r\nhtml.cx-pskin [class*=\"kefin\"] .card:hover .cardBox, html.cx-pskin [class*=\"watchlist\"] .card:hover .cardBox { transform: translateY(-4px); transition: transform .25s; }\r\nhtml.cx-frame { --je-sticky-top: 72px; }\n\n/* ===== v3: peek popover replaces card hover ===== */\n.nf-card .info, .nf-card .im::before, .nf-card .im::after { display: none !important; }\n.nf-card .im { transform: none !important; transition: box-shadow .3s, filter .3s; will-change: auto; }\n.nf-card .im .bgi { transition: transform .8s cubic-bezier(.2,.7,.2,1); }\n@media (hover: hover) and (pointer: fine) { .nf-card:hover .im { box-shadow: 0 0 0 2px rgba(255,255,255,.55); } .nf-card:hover .im .bgi { transform: scale(1.04); } }\n.nf-peek { position: fixed; z-index: 9060; border-radius: 20px; overflow: hidden; background: #1c1c20; box-shadow: 0 30px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.09); opacity: 0; transform: scale(.94) translateY(8px); transition: opacity .2s, transform .28s cubic-bezier(.2,.8,.2,1); pointer-events: none; font-family: \"Inter\", system-ui, sans-serif; color: #fff; }\n.nf-peek.show { opacity: 1; transform: none; pointer-events: auto; }\n.nf-peek .pi { position: relative; aspect-ratio: 16/9; background: #2a2a2f; cursor: pointer; overflow: hidden; }\n.nf-peek .pi .bgi { position: absolute; inset: 0; background-size: cover; background-position: center; }\n.nf-peek .pi::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #1c1c20 4%, rgba(28,28,32,0) 60%); }\n.nf-peek .pt { position: absolute; z-index: 2; left: 16px; right: 16px; bottom: 10px; font-weight: 800; font-size: 19px; letter-spacing: -.01em; text-shadow: 0 2px 12px rgba(0,0,0,.7); }\n.nf-peek .pb { padding: 6px 16px 16px; }\n.nf-peek .pa { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }\n.nf-peek .pa button { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.12); display: grid; place-items: center; transition: background .2s, transform .15s; }\n.nf-peek .pa button:hover { background: rgba(255,255,255,.24); transform: scale(1.08); }\n.nf-peek .pa button.pl { background: #fff; color: #000; }\n.nf-peek .pa .sp { flex: 1; }\n.nf-peek .pa svg { width: 20px; height: 20px; }\n.nf-peek .pm { font-size: 12.5px; color: #cfcfd5; display: flex; gap: 6px 10px; flex-wrap: wrap; align-items: center; }\n.nf-peek .pm .g { color: #5ee08a; font-weight: 700; }\n.nf-peek .pm .badge { border: 1px solid rgba(255,255,255,.35); padding: 0 6px; border-radius: 5px; line-height: 18px; }\n.nf-peek .pm span + span::before { content: \"•\"; margin-right: 10px; opacity: .45; }\n.nf-peek .po { font-size: 13px; color: #b6b6bd; margin-top: 10px; line-height: 1.45; }\n#cx-cover { position: fixed; inset: 0; z-index: 9700; background: #0d0d0f; display: none; place-items: center; }\n#cx-cover.show { display: grid; }\nhtml.cx-on:not(.transparentDocument) #reactRoot { visibility: hidden; }\n\n/* settings page + requests */\n.rot180 { display: inline-flex; transform: rotate(180deg); }\n.set-card { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 22px 24px; margin-bottom: 20px; }\n.set-card h3 { margin: 0 0 14px; font-size: 18px; letter-spacing: -.01em; }\n.set-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.set-row:first-of-type { border-top: 0; }\n.set-row b { display: block; font-weight: 600; font-size: 15px; } .set-row span { display: block; color: #8d8d95; font-size: 13px; margin-top: 3px; }\n.set-switch { position: relative; width: 46px; height: 26px; border-radius: 999px; background: #3a3a40; flex: none; transition: background .2s; }\n.set-switch i { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform .2s; }\n.set-switch.on { background: #34c759; } .set-switch.on i { transform: translateX(20px); }\n.set-row input[type=color] { width: 44px; height: 32px; border: 0; background: none; padding: 0; cursor: pointer; border-radius: 8px; }\n.set-hint { color: #8d8d95; font-size: 13.5px; margin: 0 0 14px; }\n.set-list { display: flex; flex-direction: column; gap: 8px; }\n.set-sec { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px 10px 16px; background: #1f1f24; border-radius: 14px; }\n.set-sec.off b { opacity: .45; } .set-sec b { font-weight: 600; font-size: 14.5px; }\n.set-sec-a { display: flex; align-items: center; gap: 6px; }\n.set-sec-a button:not(.set-switch) { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.07); }\n.set-sec-a button:not(.set-switch):hover { background: rgba(255,255,255,.16); }\n.set-sec-a svg { width: 18px; height: 18px; }\n.set-add { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; align-items: center; }\n.set-add select { height: 40px; padding: 0 14px; border-radius: 12px; background: #1f1f24; color: #fff; border: 1px solid rgba(255,255,255,.1); font: inherit; max-width: 260px; }\n.req-grid .nf-card { width: auto; }\n.req-acts { display: flex; gap: 8px; margin-top: 8px; } .req-acts .btn { height: 34px; padding: 0 14px; font-size: 13px; }\n.dmark.wait { border-style: solid; border-color: rgba(255,196,87,.5); color: #ffd27a; }\n.dmark.dl { border-style: solid; border-color: rgba(120,180,255,.55); color: #9ccaff; }\n.dmark.bad { border-style: solid; border-color: rgba(255,120,120,.55); color: #ff9b9b; }\n.nf-card.req .im .prog { left: 10px; right: 10px; bottom: 10px; }\n.nf-person { color: inherit; text-decoration: none; }\n.nf-person:hover .pi { outline: 2px solid rgba(255,255,255,.6); }\n.nf-logo { color: var(--accent-nf, #e50914) !important; }\n.nf-card .prog i, .nf-resume-bar i { background: var(--accent-nf, #fff); }\n\n/* Seerr modal, downloads, calendar, Aurral tiles */\n.sr-modal { width: min(720px, 100%); max-height: 92vh; overflow-y: auto; background: #17171a; border-radius: 26px; box-shadow: 0 30px 90px rgba(0,0,0,.7); border: 1px solid rgba(255,255,255,.08); color: #fff; font-family: \"Inter\", system-ui, sans-serif; }\n.sr-hero { position: relative; height: 240px; background: #222 center/cover; } .sr-hero::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(to top, #17171a, rgba(23,23,26,0) 70%); }\n.sr-close { position: absolute; z-index: 2; top: 14px; right: 14px; width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,.55); display: grid; place-items: center; }\n.sr-body { padding: 0 28px 28px; margin-top: -48px; position: relative; z-index: 1; }\n.sr-body h2 { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; }\n.sr-ov { color: #cfcfd5; line-height: 1.6; font-size: 15px; margin: 14px 0; }\n.sr-status { margin: 6px 0; }\n.sr-seasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }\n.sr-seasons .nf-chip.dis { opacity: .45; cursor: default; }\n.sr-cast { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; } .sr-cast span { font-size: 12.5px; padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.07); color: #cfcfd5; }\n.btn:disabled { opacity: .6; cursor: default; }\n.dl-box { background: #17171a; border: 1px solid rgba(255,255,255,.06); border-radius: 22px; padding: 20px 22px; margin: 0 0 26px; }\n.dl-box h2 { margin: 0 0 12px; font-size: 18px; }\n.dl-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(160px, 320px); gap: 20px; align-items: center; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.05); }\n.dl-t { display: flex; flex-direction: column; min-width: 0; } .dl-t span { font-size: 12.5px; color: #8d8d95; margin-top: 2px; }\n.dl-p { display: flex; align-items: center; gap: 12px; } .dl-p .prog { position: static; flex: 1; height: 6px; border-radius: 6px; background: rgba(255,255,255,.14); overflow: hidden; } .dl-p .prog i { display: block; height: 100%; background: #fff; border-radius: 6px; } .dl-p b { font-size: 13px; width: 40px; text-align: right; }\n.cal-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; } .cal-head b { font-size: 20px; min-width: 190px; text-align: center; text-transform: capitalize; }\n.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }\n.cal-dow { text-align: center; color: #8d8d95; font-size: 13px; font-weight: 600; padding: 4px 0; }\n.cal-day { min-height: 130px; background: #17171a; border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }\n.cal-day.other { opacity: .4; } .cal-day.today { border-color: rgba(255,255,255,.45); background: #1d1d22; }\n.cal-day .n { font-size: 13px; font-weight: 700; color: #cfcfd5; }\n.cal-ev { display: flex; align-items: center; gap: 6px; padding: 4px; border-radius: 10px; background: rgba(255,255,255,.06); cursor: pointer; min-width: 0; font-size: 12px; position: relative; }\n.cal-ev:hover { background: rgba(255,255,255,.14); }\n.cal-ev .p { width: 26px; height: 38px; border-radius: 5px; background: #333 center/cover; flex: none; }\n.cal-ev > span { font-weight: 600; flex: 1; min-width: 0; } .cal-ev small { position: absolute; left: 36px; bottom: 3px; color: #8d8d95; font-size: 10.5px; max-width: calc(100% - 40px); }\n.cal-ev.have { box-shadow: inset 3px 0 0 #34c759; } .cal-ev.digital { box-shadow: inset 3px 0 0 #bf5af2; } .cal-ev.physical { box-shadow: inset 3px 0 0 #ff9f0a; } .cal-ev.cinema { box-shadow: inset 3px 0 0 #0a84ff; } .cal-ev.episode { box-shadow: inset 3px 0 0 #64d2ff; }\n.cal-ev > span { padding-bottom: 12px; }\n@media (max-width: 800px) { .cal-grid { grid-template-columns: 1fr; } .cal-dow { display: none; } .cal-day.other { display: none; } .cal-day { min-height: 0; } .dl-row { grid-template-columns: 1fr; gap: 6px; } }\n.sp-tile .pbtn.busy { opacity: .5; pointer-events: none; }\n";
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
    popularTracks: 'Popular', discography: 'Discography', moviesTv: 'Movies & TV', songsN: 'songs', trackN: 'song', random2: 'Shuffle play', myMix: 'Mix', added: 'Added to playlist', queued: 'Added to queue', ofN: 'min', discover: 'Discover', requests: 'Requests', calendar: 'Calendar', bookmarks: 'Bookmarks', more: 'More', pskin: 'Plugin page styling', on: 'On', off: 'Off', inLib: 'In library', requested: 'Requested', notOwned: 'Not in library', request: 'Request', trending: 'Trending', popMovies: 'Popular movies', popShows: 'Popular shows', upMovies: 'Upcoming movies', upShows: 'Upcoming shows', notInLib: 'Not in your library yet', all: 'All', watchlist: 'Watchlist', wlAdded: 'Added to watchlist', wlRemoved: 'Removed from watchlist', wlAdd: 'Add to watchlist', wlRemove: 'Remove from watchlist', favAdd: 'Add to My List', favRemove: 'Remove from My List', markWatched: 'Mark as watched', markUnwatched: 'Mark as unwatched', markedWatched: 'Marked as watched', markedUnwatched: 'Marked as unwatched', openDetails: 'Open details', editMeta: 'Edit metadata', editImages: 'Edit images', identify: 'Identify', refreshMeta: 'Refresh metadata', openNative: 'Open in Jellyfin', delete: 'Delete', cmdNA: 'That action is not available here', because: 'Because you watched', genresRandom: 'Random genre rows', seerrRec: 'Recommended for you', settings: 'Settings', general: 'General', setHero: 'Billboard on home', setHeroHint: 'Show the large rotating banner at the top.', setPeek: 'Hover preview cards', setPeekHint: 'Show a preview card when you hover a poster.', setInfinite: 'Infinite scroll', setInfiniteHint: 'Load more rows and grids as you scroll.', setSeerrWl: 'Sync watchlist with Seerr', setSeerrWlHint: 'Also add to your Seerr watchlist when you add a title to your watchlist.', appearance: 'Appearance', accent: 'Accent color', accentHint: 'Used for the logo and progress bars.', homeSections: 'Home sections', homeSectionsHint: 'Reorder, hide or add rows. Changes sync to all your devices.', custom: 'custom', secGenre: 'Genre row', secLibrary: 'Library row', add: 'Add', reset: 'Reset', rqPending: 'Waiting', rqProcessing: 'In progress', rqAvailable: 'Available', rqDeclined: 'Declined', rqWaiting: 'Waiting for approval', rqPartial: 'Partly available', rqDownloading: 'Downloading', rqApproved: 'Approved', approve: 'Approve', decline: 'Decline', downloads: 'Downloads', noDownloads: 'Nothing is downloading right now.', today: 'Today', arrOff: 'Radarr and Sonarr are not connected yet. Add them in Dashboard, Plugins, Cinema.', cal_digital: 'Digital release', cal_physical: 'Physical release', cal_cinema: 'In cinemas', cal_episode: 'Episode', close: 'Close', musicRequestArtists: 'Request artists', musicRequestAlbums: 'Request albums', discoverMusic: 'Discover new music', globalTopArtists: 'Top artists worldwide' },
  de: { home: 'Startseite', movies: 'Filme', shows: 'Serien', mylist: 'Meine Liste', music: 'Musik', search: 'Suchen', play: 'Abspielen', resume: 'Fortsetzen', info: 'Mehr Infos', trailer: 'Trailer',
    continue: 'Weiterschauen', nextup: 'Als Nächstes', newMovies: 'Neu hinzugefügte Filme', newShows: 'Neu hinzugefügte Serien', top: 'Bestbewertet', random: 'Für dich ausgewählt', recentAlbums: 'Neu in der Musik',
    favs: 'Meine Liste', cast: 'Besetzung', similar: 'Ähnliche Titel', episodes: 'Folgen', season: 'Staffel', seasons: 'Staffeln', empty: 'Noch nichts vorhanden.', results: 'Ergebnisse für', noRes: 'Keine Ergebnisse gefunden.',
    prefs: 'Einstellungen', dash: 'Dashboard', logout: 'Abmelden', watched: 'Gesehen', list: 'Liste', genres: 'Genres', director: 'Regie', studio: 'Studio', min: 'Min.', collection: 'Sammlung', inCollection: 'In dieser Sammlung',
    gm: 'Guten Morgen', ga: 'Guten Tag', ge: 'Guten Abend', liked: 'Lieblingssongs', playlists: 'Playlists', albums: 'Alben', artists: 'Künstler', songs: 'Titel', library: 'Deine Bibliothek', createPl: 'Playlist erstellen',
    recent: 'Zuletzt gehört', yourPl: 'Deine Playlists', mixes: 'Für dich gemacht', newAlb: 'Zuletzt hinzugefügt', popular: 'Beliebt', searchMusic: 'Was möchtest du hören?', top1: 'Top-Ergebnis', browse: 'Alle durchsuchen',
    queue: 'Warteschlange', nowPlaying: 'Läuft gerade', nextIn: 'Als Nächstes', shuffle: 'Zufällig', addQ: 'Zur Warteschlange', playNext: 'Als Nächstes spielen', addPl: 'Zur Playlist hinzufügen', newPl: 'Neue Playlist', goArtist: 'Zum Künstler', goAlbum: 'Zum Album',
    like: 'Zu Lieblingssongs', unlike: 'Aus Lieblingssongs entfernen', rmPl: 'Aus dieser Playlist entfernen', name: 'Name', cancel: 'Abbrechen', create: 'Erstellen', title: 'Titel', album: 'Album', playlist: 'Playlist', album1: 'Album', artist: 'Künstler', mix: 'Mix',
    popularTracks: 'Beliebt', discography: 'Diskografie', moviesTv: 'Filme & Serien', songsN: 'Titel', trackN: 'Titel', random2: 'Zufallswiedergabe', myMix: 'Mix', added: 'Zur Playlist hinzugefügt', queued: 'Zur Warteschlange hinzugefügt', ofN: 'Min.', discover: 'Entdecken', requests: 'Anfragen', calendar: 'Kalender', bookmarks: 'Lesezeichen', more: 'Mehr', pskin: 'Plugin-Seiten-Design', on: 'An', off: 'Aus', inLib: 'In Bibliothek', requested: 'Angefragt', notOwned: 'Nicht vorhanden', request: 'Anfragen', trending: 'Angesagt', popMovies: 'Beliebte Filme', popShows: 'Beliebte Serien', upMovies: 'Bald im Kino', upShows: 'Bald neue Serien', notInLib: 'Noch nicht in deiner Bibliothek', all: 'Alle', watchlist: 'Watchlist', wlAdded: 'Zur Watchlist hinzugefügt', wlRemoved: 'Aus Watchlist entfernt', wlAdd: 'Zur Watchlist', wlRemove: 'Von Watchlist entfernen', favAdd: 'Zu Meine Liste', favRemove: 'Aus Meine Liste entfernen', markWatched: 'Als gesehen markieren', markUnwatched: 'Als ungesehen markieren', markedWatched: 'Als gesehen markiert', markedUnwatched: 'Als ungesehen markiert', openDetails: 'Details öffnen', editMeta: 'Metadaten bearbeiten', editImages: 'Bilder bearbeiten', identify: 'Identifizieren', refreshMeta: 'Metadaten aktualisieren', openNative: 'In Jellyfin öffnen', delete: 'Löschen', cmdNA: 'Diese Aktion ist hier nicht verfügbar', because: 'Weil du gesehen hast', genresRandom: 'Zufällige Genre-Reihen', seerrRec: 'Empfohlen für dich', settings: 'Einstellungen', general: 'Allgemein', setHero: 'Billboard auf der Startseite', setHeroHint: 'Zeigt das große rotierende Banner oben.', setPeek: 'Vorschau beim Hovern', setPeekHint: 'Zeigt eine Vorschaukarte, wenn du ein Poster überfährst.', setInfinite: 'Endloses Scrollen', setInfiniteHint: 'Lädt weitere Reihen und Listen beim Scrollen.', setSeerrWl: 'Watchlist mit Seerr synchronisieren', setSeerrWlHint: 'Fügt Titel auch deiner Seerr-Watchlist hinzu.', appearance: 'Aussehen', accent: 'Akzentfarbe', accentHint: 'Für Logo und Fortschrittsbalken.', homeSections: 'Startseiten-Bereiche', homeSectionsHint: 'Reihen sortieren, ausblenden oder hinzufügen. Änderungen synchronisieren auf alle Geräte.', custom: 'eigene', secGenre: 'Genre-Reihe', secLibrary: 'Bibliotheks-Reihe', add: 'Hinzufügen', reset: 'Zurücksetzen', rqPending: 'Wartend', rqProcessing: 'In Arbeit', rqAvailable: 'Verfügbar', rqDeclined: 'Abgelehnt', rqWaiting: 'Wartet auf Genehmigung', rqPartial: 'Teilweise verfügbar', rqDownloading: 'Lädt', rqApproved: 'Genehmigt', approve: 'Genehmigen', decline: 'Ablehnen', downloads: 'Downloads', noDownloads: 'Gerade lädt nichts herunter.', today: 'Heute', arrOff: 'Radarr und Sonarr sind noch nicht verbunden. Trage sie unter Dashboard, Plugins, Cinema ein.', cal_digital: 'Digitale Veröffentlichung', cal_physical: 'Physische Veröffentlichung', cal_cinema: 'Im Kino', cal_episode: 'Folge', close: 'Schließen', musicRequestArtists: 'Künstler anfragen', musicRequestAlbums: 'Alben anfragen', discoverMusic: 'Neue Musik entdecken', globalTopArtists: 'Top-Künstler weltweit' }
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
  cal: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z', edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z', refresh: 'M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z', star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', list: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
};
const ic = (n, cls) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', IC[n]); s.append(p); return cls ? h('span', { class: cls }, s) : s; };

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
  if (type === 'Backdrop' && it._bd) return it._bd;
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
const refreshBrand = () => { try { const n = ApiClient.serverInfo().Name; if (n) BRAND = n; } catch (e) { } };
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
  C.allowNative = true;
  location.hash = '#/details?id=' + id + (opts.start ? '' : '');
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const page = $('#itemDetailPage:not(.hide)');
    const btn = page && ($('.btnResume:not(.hide)', page) || $('.btnPlay:not(.hide)', page));
    if (btn && !btn.closest('.hide')) { clearInterval(iv); btn.click(); }
    if (tries > 60) { clearInterval(iv); }
  }, 150);
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
  attachPeek(el, im, () => libDesc(it));
  return el;
}

function row(title, list, kind, opts) {
  opts = opts || {};
  const sc = h('div', { class: 'nf-scroller' }, list.map(i => opts.make ? opts.make(i) : card(i, kind)));
  const L_ = h('button', { class: 'nf-arrow l', 'aria-label': 'Previous', onclick: () => sc.scrollBy({ left: -sc.clientWidth * .85 }) }, ic('left'));
  const R_ = h('button', { class: 'nf-arrow r', 'aria-label': 'Next', onclick: () => sc.scrollBy({ left: sc.clientWidth * .85 }) }, ic('right'));
  return h('section', { class: 'nf-row' }, h('h2', {}, opts.href ? h('a', { href: opts.href }, title + ' ›') : title), L_, sc, R_);
}
/* async row: placeholder is inserted immediately to keep order, filled when data arrives */
function lazyRow(container, title, fn, kind, opts) {
  const ph = h('div', { class: 'nf-rowph' }); container.append(ph);
  Promise.resolve().then(fn).then(list => { const arr = (list && list.Items) || list || []; if (arr.length) ph.replaceWith(row(title, arr, kind, opts)); else ph.remove(); }).catch(e => { console.warn('[cinema] row failed', title, e); ph.remove(); });
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
  function restart() { clearInterval(timer); if (list.length > 1) timer = setInterval(() => { if (!hero.isConnected || root.style.display === 'none' || document.hidden || C.mode !== 'nf') return; set((cur + 1) % list.length); }, 11000); }
  body.style.transition = 'opacity .25s';
  hero.append(...slides, body, dots); fill(list[0]); restart();
  hero.addEventListener('remove', () => clearInterval(timer));
  return hero;
}
async function heroFor(types) {
  const r = await items({ IncludeItemTypes: types, SortBy: 'Random', Limit: 60, ImageTypes: 'Backdrop' });
  const withBd = r.Items.filter(i => (i.BackdropImageTags || []).length && i.Overview);
  const withLogo = withBd.filter(i => i.ImageTags && i.ImageTags.Logo);
  return (withLogo.length >= 5 ? withLogo : withBd).slice(0, 8);
}

function showSpinner() { C.nf.main.replaceChildren(h('div', { class: 'spinner' })); }

async function renderNF(r) {
  if (!C.nf) buildNF();
  const [a, b, c] = [r.parts[0], r.parts[1], r.parts[2]];
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
  else if (view === 'discover') await discoverView(page);
  else if (view === 'watchlist') await watchlistView(page);
  else if (view === 'settings') await settingsView(page);
  else if (view === 'requests') await requestsView(page);
  else if (view === 'calendar') await calendarView(page);
  else if (view === 'person') await personView(page, c);
  else if (view === 'list') await listView(page);
  else if (view === 'search') await searchView(page, decodeURIComponent(c || ''));
  else if (view === 'item') await itemView(page, c);
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
  api('Genres', { userId: uid(), IncludeItemTypes: type, SortBy: 'Random', Limit: n }).then(g => (g.Items || []).forEach(gn => lazyRow(rows, gn.Name, () => items({ IncludeItemTypes: type, Genres: gn.Name, SortBy: 'Random', Limit: 20 }), 'thumb'))).catch(() => { });
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
async function searchView(page, q) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('results') + ' “' + q + '”')); page.append(wrap);
  if (C.nf.sInput.value !== q) { C.nf.sInput.value = q; C.nf.sInput.parentElement.classList.add('open'); }
  const r = await items({ searchTerm: q, IncludeItemTypes: 'Movie,Series,Episode,BoxSet', Limit: 60 });
  if (!r.Items.length) wrap.append(h('div', { class: 'nf-empty' }, t('noRes'))); else wrap.append(h('div', { class: 'nf-grid' }, r.Items.map(i => card(i, i.Type === 'Episode' ? 'thumb' : 'poster'))));
  seerrSearchRow(wrap, q);
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
  const favBtn = h('button', { class: 'btn round' + (ud(it).IsFavorite ? ' on' : ''), 'aria-label': t('mylist'), onclick: async () => { const on = !ud(it).IsFavorite; await ApiClient.updateFavoriteStatus(uid(), it.Id, on); it.UserData.IsFavorite = on; favBtn.classList.toggle('on', on); favBtn.replaceChildren(ic(on ? 'check' : 'plus')); } }, ic(ud(it).IsFavorite ? 'check' : 'plus'));
  const seenBtn = !isSeries && !isBox ? h('button', { class: 'btn round' + (ud(it).Played ? ' on' : ''), 'aria-label': t('watched'), onclick: async () => { const on = !ud(it).Played; on ? await ApiClient.markPlayed(uid(), it.Id, new Date()) : await ApiClient.markUnplayed(uid(), it.Id); it.UserData.Played = on; seenBtn.classList.toggle('on', on); } }, ic('check')) : null;
  const trailer = (it.RemoteTrailers || [])[0];
  const people = (it.People || []);
  const dir = people.filter(p => p.Type === 'Director').map(p => p.Name).join(', ');
  const info = h('div', { class: 'nf-dinfo' },
    logo ? h('img', { class: 'nf-dlogo', src: logo, alt: it.Name }) : h('h1', {}, it.Name),
    h('div', { class: 'nf-meta' }, it.CommunityRating ? h('span', { class: 'match' }, Math.round(it.CommunityRating * 10) + '% ★') : null, yearOf(it) ? h('span', {}, yearOf(it)) : null, it.OfficialRating ? h('span', { class: 'badge' }, it.OfficialRating) : null, it.RunTimeTicks && !isSeries ? h('span', {}, fmtMin(it.RunTimeTicks)) : null, isSeries && it.ChildCount ? h('span', {}, it.ChildCount + ' ' + t('seasons')) : null),
    (it.Taglines || [])[0] ? h('p', { class: 'nf-tagline' }, it.Taglines[0]) : null,
    h('p', { class: 'ov' }, it.Overview || ''),
    h('div', { class: 'nf-btns' }, h('button', { class: 'btn white', onclick: () => playVideo(it) }, ic('play'), prog ? t('resume') : t('play')),
      trailer ? h('a', { class: 'btn grey', href: trailer.Url, target: '_blank', rel: 'noopener' }, ic('film'), t('trailer')) : null, favBtn, seenBtn),
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
  if (!isBox) { const sim = await api('Items/' + it.Id + '/Similar', { userId: uid(), limit: 14, Fields: F_BASE }).catch(() => null); if (sim && sim.Items && sim.Items.length) { const sec = h('section', { class: 'nf-sect', style: 'margin-left:-4%;margin-right:-4%' }); sec.append(row(t('similar'), sim.Items, 'poster')); body.append(sec); } }
}

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
    COVER.show();
    try { const it = await getItem(r.q.get('id')); const hh = itemHash(it); if (hh) { location.replace(hh); return; } } catch (e) { }
  }
  if (p0 === 'video') { C.allowNative = false; COVER.hide(); }
  const tab = r.q.get('tab');
  const overlay = (p0 === 'home' && (!tab || tab === '0')) || p0 === 'c';
  const full = !overlay && FULL.test(p0);
  const frame = !overlay && !full;
  const isMusic = overlay && r.parts[1] === 'music';
  if (overlay) C.allowNative = false;
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
function buildTop() {
  const uiRoot = getUI();
  const L_ = (k, label, href, cls) => h('a', { 'data-k': k, href: typeof href === 'function' ? '#' : href, class: cls || '', onclick: typeof href === 'function' ? (e => { e.preventDefault(); go(href()); }) : null }, label);
  const links = h('div', { class: 'nf-links' },
    L_('home', t('home'), '#/home'), L_('movies', t('movies'), '#/c/movies'), L_('shows', t('shows'), '#/c/shows'),
    L_('watchlist', 'Watchlist', '#/c/watchlist'), L_('discover', t('discover'), '#/c/discover'),
    L_('requests', t('requests'), '#/c/requests', 'opt'), L_('calendar', t('calendar'), () => (plug().radarr || plug().sonarr) ? '#/c/calendar' : tabHref('calendar'), 'opt'), L_('music', t('music'), '#/c/music'));
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
  const popUser = mkPop([['settings', t('settings') + ' (Cinema)', '#/c/settings', '', 'edit'], ['prefs', t('prefs'), '#/mypreferencesmenu', '', 'user'], ['dash', t('dash'), '#/dashboard', '', 'info']]);
  const skinBtn = h('button', { 'data-cx': 1, onclick: e => { e.stopPropagation(); setSkin(!skinOn()); skinBtn.textContent = skinLabel(); } }, skinLabel());
  popUser.append(skinBtn);
  popUser.append(h('button', { 'data-cx': 1, onclick: () => { try { ApiClient.logout().then(() => location.reload()); } catch (e) { location.href = '#/login'; } } }, t('logout')));
  const menu = h('div', { class: 'nf-menu-wrap' }, h('button', { 'aria-label': 'Account', onclick: e => { e.stopPropagation(); closePops(popUser); popUser.classList.toggle('hide'); } }, av), popUser);
  function closePops(except) { $$('.nf-pop').forEach(p => { if (p !== except) p.classList.add('hide'); }); }
  document.addEventListener('click', () => closePops());
  const top = h('div', { id: 'cx-top', class: 'nf-nav' }, h('a', { class: 'nf-logo', href: '#/home' }, BRAND.toUpperCase()), links, more, h('div', { class: 'nf-spacer' }), sWrap, menu);
  const tabs = h('div', { class: 'cx-tabs hide' },
    ...[['home', '#/home', 'home', t('home')], ['movies', '#/c/movies', 'film', t('movies')], ['shows', '#/c/shows', 'tv', t('shows')], ['music', '#/c/music', 'note', t('music')]].map(([k, href, i, label]) => h('a', { href, 'data-k': k }, ic(i), label)),
    h('a', { 'data-k': 'discover', href: '#/c/discover' }, ic('star'), t('discover')),
    h('button', { onclick: e => { e.stopPropagation(); closePops(popMore2); popMore2.classList.toggle('hide'); } }, ic('more'), t('more')));
  uiRoot.append(top, tabs);
  C.top = top; C.tabs = tabs; C.sInput = sInput;
  ApiClient.getCurrentUser().then(u => { av.textContent = (u.Name || 'U')[0].toUpperCase(); }).catch(() => { });
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

/* per-user settings (synced through Jellyfin DisplayPreferences) */
const CFG_DEF = { hero: true, peek: true, seerrWatchlistSync: false, sections: null, accent: '#e50914', infinite: true };
let CFG = Object.assign({}, CFG_DEF);
const cfg = k => CFG[k];
async function loadCfg() {
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); const raw = (dp.CustomPrefs || {}).cfg; if (raw) CFG = Object.assign({}, CFG_DEF, JSON.parse(raw)); } catch (e) { }
  applyCfg();
}
async function saveCfg(patch) {
  Object.assign(CFG, patch); applyCfg();
  try { const dp = await api('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }); dp.CustomPrefs = Object.assign(dp.CustomPrefs || {}, { cfg: JSON.stringify(CFG) }); await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('DisplayPreferences/cinema-ui', { userId: uid(), client: 'cinema-ui' }), data: JSON.stringify(dp), contentType: 'application/json' }); } catch (e) { console.warn('[cinema] save cfg failed', e); }
}
function applyCfg() { const r = document.documentElement; r.style.setProperty('--accent-nf', CFG.accent || '#e50914'); }

/* ---------- peek popover (replaces card hover) ---------- */
const PEEK = { el: null, t: 0, hideT: 0, cur: null };
function peekEl() { if (!PEEK.el) { PEEK.el = h('div', { class: 'nf-peek', onpointerenter: () => clearTimeout(PEEK.hideT), onpointerleave: () => hidePeek(120) }); getUI().append(PEEK.el); } return PEEK.el; }
function hidePeek(delay) { clearTimeout(PEEK.t); clearTimeout(PEEK.hideT); PEEK.hideT = setTimeout(() => { if (PEEK.el) PEEK.el.classList.remove('show'); PEEK.cur = null; }, delay || 0); }
function showPeek(anchor, d) {
  const el = peekEl(); const r = anchor.getBoundingClientRect();
  const W = Math.max(300, Math.min(400, r.width * 1.6));
  let left = r.left + r.width / 2 - W / 2; left = Math.max(12, Math.min(innerWidth - W - 12, left));
  el.style.width = W + 'px';
  const btns = h('div', { class: 'pa' }, d.actions.map(a => a === '-' ? h('span', { class: 'sp' }) : h('button', { class: a.primary ? 'pl' : (a.on ? 'on' : ''), 'aria-label': a.label, title: a.label, onclick: async e => { e.stopPropagation(); const res = await a.fn(e); if (a.refresh) a.refresh(); } }, ic(typeof a.icon === 'function' ? a.icon() : a.icon))));
  el.replaceChildren(
    h('div', { class: 'pi', onclick: () => { hidePeek(); d.open && d.open(); } }, d.img ? h('div', Object.assign({ class: 'bgi' }, bg(d.img))) : null, h('div', { class: 'pt ell' }, d.title)),
    h('div', { class: 'pb' }, btns, h('div', { class: 'pm' }, d.meta.filter(Boolean).map((m, i) => h('span', { class: m.cls || '' }, m.t || m))), d.overview ? h('div', { class: 'po clamp2' }, d.overview) : null));
  el.classList.remove('show'); el.style.visibility = 'hidden'; el.style.top = '0px'; el.style.left = left + 'px';
  requestAnimationFrame(() => {
    const H = el.offsetHeight; let top = r.top + r.height / 2 - H / 2 - 24; top = Math.max(80, Math.min(innerHeight - H - 12, top));
    el.style.top = top + 'px'; el.style.visibility = ''; requestAnimationFrame(() => el.classList.add('show'));
  });
  PEEK.cur = anchor;
}
function attachPeek(el, anchor, getDesc) {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || cfg('peek') === false) return;
  el.addEventListener('pointerenter', () => { clearTimeout(PEEK.hideT); clearTimeout(PEEK.t); PEEK.t = setTimeout(() => showPeek(anchor, getDesc()), PEEK.cur ? 80 : 420); });
  el.addEventListener('pointerleave', () => { clearTimeout(PEEK.t); hidePeek(160); });
  el.addEventListener('click', () => hidePeek());
}
window.addEventListener('scroll', () => hidePeek(), { capture: true, passive: true });

function libDesc(it) {
  const isEp = it.Type === 'Episode'; const hash = itemHash(it) || '#/home';
  const wl = h('span'); const acts = [
    { icon: 'play', label: t('play'), primary: true, fn: () => { hidePeek(); it.Type === 'MusicAlbum' ? C.playAlbum(it) : playVideo(it); } },
    { icon: () => isWatch(it) ? 'check' : 'plus', label: t('watchlist'), fn: async e => { await toggleWatch(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(isWatch(it) ? 'check' : 'plus')); } },
    { icon: () => ud(it).IsFavorite ? 'heartOn' : 'heart', label: t('mylist'), fn: async e => { await toggleFav(it); const b = e.currentTarget; if (b) b.replaceChildren(ic(ud(it).IsFavorite ? 'heartOn' : 'heart')); } },
    '-', { icon: 'more', label: t('more'), fn: e => itemMenu(e, it) }, { icon: 'down', label: t('info'), fn: () => { hidePeek(); go(hash); } }];
  return { img: imgUrl(it, 'Backdrop', 700) || imgUrl(it, 'Thumb', 700) || imgUrl(it, 'Primary', 500), title: isEp ? (it.SeriesName || it.Name) : it.Name, open: () => go(hash), actions: acts,
    meta: [it.CommunityRating ? { t: Math.round(it.CommunityRating * 10) + '%', cls: 'g' } : null, yearOf(it), it.OfficialRating ? { t: it.OfficialRating, cls: 'badge' } : null, it.RunTimeTicks ? fmtMin(it.RunTimeTicks) : (it.Type === 'Series' ? t('shows') : null), ...(it.Genres || []).slice(0, 2)],
    overview: isEp ? ('S' + (it.ParentIndexNumber || 0) + ':E' + (it.IndexNumber || 0) + ' · ' + it.Name) : it.Overview };
}

/* ---------- item ⋯ menu: everything Jellyfin can do with an item ---------- */
let ME = null; const me = async () => ME || (ME = await ApiClient.getCurrentUser());
async function itemMenu(e, it) {
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
  if (admin) {
    ent.push('-');
    ent.push({ icon: 'edit', label: t('editMeta'), fn: () => nativeCommand(it.Id, ['edit', 'editmetadata']) });
    ent.push({ icon: 'film', label: t('editImages'), fn: () => nativeCommand(it.Id, ['editimages']) });
    ent.push({ icon: 'search', label: t('identify'), fn: () => nativeCommand(it.Id, ['identify']) });
    ent.push({ icon: 'refresh', label: t('refreshMeta'), fn: () => nativeCommand(it.Id, ['refresh']) });
    ent.push({ icon: 'info', label: t('openNative'), fn: () => nativeCommand(it.Id, null) });
  }
  if (canDel) { ent.push('-'); ent.push({ icon: 'close', label: t('delete'), fn: () => nativeCommand(it.Id, ['delete']) }); }
  openMenu(Math.min(r.left, innerWidth - 260), r.bottom + 6, ent);
}
/* run a command of Jellyfin's own item menu (metadata editor, image editor, identify, ...) */
function nativeCommand(id, cmds) {
  hidePeek(); closeMenu();
  C.allowNative = true; COVER.show(); location.hash = '#/details?id=' + id;
  let tries = 0;
  const iv = setInterval(() => {
    tries++;
    const page = $('#itemDetailPage:not(.hide)'); const more = page && $('.btnMoreCommands:not(.hide)', page);
    if (!cmds) { if (page && page.querySelector('.detailPageContent, .detailPagePrimaryContainer')) { clearInterval(iv); COVER.hide(); } }
    else if (more) {
      clearInterval(iv); more.click(); let n = 0;
      const iv2 = setInterval(() => {
        n++; const sheet = $('.actionSheet, .dialog.actionsheet'); const btn = sheet && cmds.map(c => $('button[data-id="' + c + '"]', sheet)).find(Boolean);
        if (btn) { clearInterval(iv2); btn.click(); setTimeout(() => COVER.hide(), 350); watchDialogClose(); }
        else if (n > 25) { clearInterval(iv2); const dbg = sheet ? $$('button[data-id]', sheet).map(b => b.dataset.id).join(',') : 'no sheet'; console.warn('[cinema] command not found', cmds, dbg); toast(t('cmdNA')); COVER.hide(); }
      }, 100);
    }
    if (tries > 80) { clearInterval(iv); COVER.hide(); }
  }, 120);
}

/* after a native dialog (metadata editor, ...) closes, go back to where the user came from */
function watchDialogClose() {
  let seen = false, gone = 0;
  const iv = setInterval(() => {
    const open = $('dialog[open], .dialogContainer .dialog, .formDialog');
    if (open) { seen = true; gone = 0; } else if (seen && ++gone >= 3) { clearInterval(iv); C.allowNative = false; if (/^#\/details/.test(location.hash)) history.back(); }
    if (!seen && ++gone > 40) clearInterval(iv);
  }, 400);
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
      if (arr.length < pageSize || (r.TotalRecordCount != null && start >= r.TotalRecordCount)) done = true;
    } catch (e) { done = true; console.warn('[cinema] page failed', e); }
    busy = false;
    if (!done && sentinel.isConnected && sentinel.getBoundingClientRect().top < innerHeight + 500) more();
  }
  if (cfg('infinite') === false) { pageSize = 400; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) more(); }, { root: C.nf.el, rootMargin: '700px' });
  io.observe(sentinel); more();
  return { grid, reload() { grid.replaceChildren(); start = 0; done = false; more(); } };
}

async function watchlistView(page) {
  const wrap = h('div', { class: 'nf-page-pad' }, h('h1', {}, t('watchlist'))); page.append(wrap);
  let type = 'Movie,Series';
  const chips = h('div', { class: 'nf-seasons' }, [['Movie,Series', t('all')], ['Movie', t('movies')], ['Series', t('shows')]].map(([v, l]) => h('button', { class: 'nf-chip' + (v === type ? ' on' : ''), onclick: e => { type = v; $$('.nf-chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); g.reload(); } }, l)));
  wrap.append(chips);
  const g = infiniteGrid(wrap, (s, n) => items({ IncludeItemTypes: type, Filters: 'Likes', SortBy: 'DateCreated', SortOrder: 'Descending', StartIndex: s, Limit: n }), i => card(i, 'poster'));
  setTimeout(() => { if (!g.grid.children.length) g.grid.after(h('div', { class: 'nf-empty' }, t('empty'))); }, 2500);
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
  if (!mv.Items.length && !sh.Items.length) body.append(h('div', { class: 'nf-empty' }, t('empty')));
}

/* ---------- configurable home sections, settings page, requests page ---------- */
const SEC = {
  continue: { label: () => t('continue'), run: () => api('Users/' + uid() + '/Items/Resume', { Limit: 20, MediaTypes: 'Video', Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  nextup: { label: () => t('nextup'), run: () => api('Shows/NextUp', { userId: uid(), Limit: 20, Fields: F_BASE, EnableImageTypes: 'Primary,Backdrop,Thumb', ImageTypeLimit: 1 }), kind: 'thumb' },
  newMovies: { label: () => t('newMovies'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/movies' },
  newShows: { label: () => t('newShows'), run: () => items({ IncludeItemTypes: 'Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24 }), kind: 'poster', href: '#/c/shows' },
  top: { label: () => t('top'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'CommunityRating', SortOrder: 'Descending', Limit: 20, MinCommunityRating: 7 }), kind: 'thumb' },
  watchlist: { label: () => t('watchlist'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'Likes', Limit: 30 }), kind: 'poster', href: '#/c/watchlist' },
  favs: { label: () => t('favs'), run: () => items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsFavorite', Limit: 30 }), kind: 'poster', href: '#/c/list' },
  random: { label: () => t('random'), run: () => items({ IncludeItemTypes: 'Movie', SortBy: 'Random', Limit: 20 }), kind: 'thumb' },
  because: { label: () => t('because'), kind: 'poster', run: async () => { const r = await items({ IncludeItemTypes: 'Movie,Series', Filters: 'IsPlayed', SortBy: 'DatePlayed', SortOrder: 'Descending', Limit: 1 }); const last = r.Items[0]; if (!last) return []; SEC.because.title = t('because') + ' ' + last.Name; return api('Items/' + last.Id + '/Similar', { userId: uid(), limit: 20, Fields: F_BASE }); } },
  genres: { label: () => t('genresRandom'), multi: true },
  seerrTrending: { label: () => t('trending') + ' (Seerr)', seerr: '/discover/trending' },
  seerrMovies: { label: () => t('popMovies') + ' (Seerr)', seerr: '/discover/movies' },
  seerrRec: { label: () => t('seerrRec'), seerrRec: true },
  genre: { label: p => p.param, custom: true, run: p => items({ IncludeItemTypes: p.itype || 'Movie,Series', Genres: p.param, SortBy: 'Random', Limit: 24 }), kind: 'thumb' },
  collection: { label: p => p.title || t('collection'), custom: true, run: p => items({ ParentId: p.param, SortBy: 'PremiereDate', Limit: 40 }), kind: 'poster' },
  library: { label: p => p.title || 'Library', custom: true, run: p => items({ ParentId: p.param, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 30 }), kind: 'poster' }
};
const DEFAULT_SECTIONS = ['continue', 'nextup', 'newMovies', 'newShows', 'top', 'watchlist', 'favs', 'random', 'genres'].map(id => ({ id, on: true }));
const sectionsCfg = () => (CFG.sections && CFG.sections.length ? CFG.sections : DEFAULT_SECTIONS);

async function homeView2(page) {
  if (cfg('hero') !== false) { const hero = await heroFor('Movie,Series').catch(() => []); if (hero.length) page.append(heroEl(hero)); else page.append(h('div', { style: 'height:90px' })); } else page.append(h('div', { style: 'height:90px' }));
  const rows = h('div', { class: 'nf-rows' }); page.append(rows);
  const list = sectionsCfg().filter(s => s.on !== false && SEC[s.id]);
  const first = list.slice(0, 7), rest = list.slice(7);
  const render = s => {
    const d = SEC[s.id];
    if (d.multi) return genreRows(rows, 'Movie', s.n || 4);
    if (d.seerr) return seerrRow(rows, s.title || d.label(s), d.seerr);
    if (d.seerrRec) return seerrRecRow(rows);
    const title = s.title || (s.id === 'because' ? null : d.label(s));
    if (s.id === 'because') { const ph = h('div', { class: 'nf-rowph' }); rows.append(ph); Promise.resolve(d.run(s)).then(l => { const arr = (l && l.Items) || l || []; if (arr.length) ph.replaceWith(row(d.title || t('because'), arr, d.kind)); else ph.remove(); }).catch(() => ph.remove()); return; }
    lazyRow(rows, title, () => d.run(s), d.kind || 'poster', d.href ? { href: d.href } : undefined);
  };
  first.forEach(render);
  if (rest.length) {
    const sentinel = h('div', { style: 'height:2px' }); rows.append(sentinel); let idx = 0;
    const next = () => { const s = rest[idx++]; if (s) { render(s); rows.append(sentinel); } if (idx >= rest.length) io.disconnect(); };
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) next(); }, { root: C.nf.el, rootMargin: '600px' });
    if (cfg('infinite') === false) rest.forEach(render); else io.observe(sentinel);
  }
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

/* ---------- settings page ---------- */
async function settingsView(page) {
  const wrap = h('div', { class: 'nf-page-pad', style: 'max-width:980px' }, h('h1', {}, t('settings'))); page.append(wrap);
  const card_ = (title, ...kids) => h('section', { class: 'set-card' }, h('h3', {}, title), kids);
  const toggle = (label, key, hint) => { const on = cfg(key) !== false && !!cfg(key) || (cfg(key) === true); const b = h('button', { class: 'set-switch' + (cfg(key) ? ' on' : ''), role: 'switch', onclick: () => { const v = !cfg(key); saveCfg({ [key]: v }); b.classList.toggle('on', v); } }, h('i')); return h('div', { class: 'set-row' }, h('div', {}, h('b', {}, label), hint ? h('span', {}, hint) : null), b); };
  wrap.append(card_(t('general'),
    toggle(t('setHero'), 'hero', t('setHeroHint')), toggle(t('setPeek'), 'peek', t('setPeekHint')), toggle(t('setInfinite'), 'infinite', t('setInfiniteHint')),
    toggle(t('setSeerrWl'), 'seerrWatchlistSync', t('setSeerrWlHint'))));
  const acc = h('input', { type: 'color', value: cfg('accent') || '#e50914', onchange: e => saveCfg({ accent: e.target.value }) });
  wrap.append(card_(t('appearance'), h('div', { class: 'set-row' }, h('div', {}, h('b', {}, t('accent')), h('span', {}, t('accentHint'))), acc)));
  /* home sections editor */
  const list = h('div', { class: 'set-list' });
  let secs = sectionsCfg().map(s => Object.assign({}, s));
  const persist = () => { saveCfg({ sections: secs }); };
  const names = s => SEC[s.id] ? (SEC[s.id].custom ? SEC[s.id].label(s) + ' · ' + t('custom') : SEC[s.id].label(s)) : s.id;
  function draw() {
    list.replaceChildren(...secs.map((s, i) => h('div', { class: 'set-sec' + (s.on === false ? ' off' : '') },
      h('b', {}, names(s)),
      h('div', { class: 'set-sec-a' },
        h('button', { 'aria-label': 'Up', onclick: () => { if (i) { [secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; persist(); draw(); } } }, ic('down', 'rot180')),
        h('button', { 'aria-label': 'Down', onclick: () => { if (i < secs.length - 1) { [secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; persist(); draw(); } } }, ic('down')),
        h('button', { class: 'set-switch' + (s.on === false ? '' : ' on'), onclick: () => { s.on = s.on === false; persist(); draw(); } }, h('i')),
        SEC[s.id] && SEC[s.id].custom ? h('button', { 'aria-label': 'Remove', onclick: () => { secs.splice(i, 1); persist(); draw(); } }, ic('close')) : null))));
  }
  draw();
  const typeSel = h('select', {}, [['genre', t('secGenre')], ['collection', t('collection')], ['library', t('secLibrary')], ['because', t('because')], ['seerrTrending', 'Seerr: ' + t('trending')], ['seerrMovies', 'Seerr: ' + t('popMovies')], ['seerrRec', t('seerrRec')]].filter(([k]) => !secs.some(s => s.id === k && !SEC[k].custom)).map(([k, l]) => h('option', { value: k }, l)));
  const valSel = h('select', {});
  async function fillVals() {
    valSel.replaceChildren(); valSel.style.display = '';
    const k = typeSel.value;
    if (k === 'genre') { const g = await api('Genres', { userId: uid(), IncludeItemTypes: 'Movie,Series', SortBy: 'SortName' }); g.Items.forEach(x => valSel.append(h('option', { value: x.Name }, x.Name))); }
    else if (k === 'collection') { const g = await items({ IncludeItemTypes: 'BoxSet', SortBy: 'SortName', Limit: 200 }); g.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
    else if (k === 'library') { const v = await api('Users/' + uid() + '/Views'); v.Items.forEach(x => valSel.append(h('option', { value: x.Id, 'data-t': x.Name }, x.Name))); }
    else valSel.style.display = 'none';
  }
  typeSel.addEventListener('change', fillVals); fillVals();
  const addBtn = h('button', { class: 'btn white', style: 'height:40px', onclick: () => { const k = typeSel.value; const o = valSel.selectedOptions[0]; const s = SEC[k].custom ? { id: k, on: true, param: valSel.value, title: o && o.dataset.t } : { id: k, on: true }; secs.push(s); persist(); draw(); } }, ic('plus'), t('add'));
  const resetBtn = h('button', { class: 'btn grey', style: 'height:40px', onclick: () => { secs = DEFAULT_SECTIONS.map(s => Object.assign({}, s)); persist(); draw(); } }, t('reset'));
  wrap.append(card_(t('homeSections'), h('p', { class: 'set-hint' }, t('homeSectionsHint')), list, h('div', { class: 'set-add' }, typeSel, valSel, addBtn, resetBtn)));
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

/* ---------- Discover: Seerr recommendations rendered with the same cards as the library ---------- */
let SEERR = 'JellyfinEnhanced/jellyseerr';
const seerrGet = (path, params) => fetch(ApiClient.getUrl(SEERR + path, params), { headers: { Authorization: 'MediaBrowser Token="' + ApiClient.accessToken() + '"' } }).then(r => { if (!r.ok) throw new Error('seerr ' + r.status); return r.json(); });
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
  const open = () => { if (s.k === 'own' && s.item) go(itemHash(s.item)); else openSeerrInfo(x); };
  const el = h('div', { class: 'nf-card poster seerr ' + (s.k === 'none' ? 'notown' : s.k), onclick: open }, im, h('div', { class: 'title ell' }, title));
  attachPeek(el, im, () => ({ img: TM(x.backdropPath, 'w780') || src, title, open, overview: x.overview,
    actions: [{ icon: s.k === 'own' ? 'play' : s.k === 'req' ? 'check' : 'plus', label: s.k === 'own' ? t('play') : t('request'), primary: true, fn: () => { hidePeek(); if (s.k === 'own' && s.item) playVideo(s.item); else if (s.k === 'none') openSeerrRequest(x); else openSeerrInfo(x); } }, '-', { icon: 'info', label: t('info'), fn: () => { hidePeek(); openSeerrInfo(x); } }],
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
const usePluginSeerr = () => !!plug().seerr;
const cget = (path, params) => api('Cinema' + path, params);
async function cpost(path, body) { return ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema' + path), data: JSON.stringify(body || {}), contentType: 'application/json', dataType: 'json' }); }
async function loadStatus() { try { C.status = await api('Cinema/status'); if (C.status.seerr) SEERR = 'Cinema/seerr'; } catch (e) { C.status = null; } }

/* ----- Seerr details + request modal (own UI, no Jellyfin Enhanced needed) ----- */
function closeModal(m) { m.remove(); }
async function seerrModal(x) {
  const mt = x.mediaType === 'tv' ? 'tv' : 'movie';
  const bgEl = h('div', { class: 'sp-modal-bg', onclick: e => { if (e.target === bgEl) closeModal(bgEl); } }); const box = h('div', { class: 'sr-modal' }, h('div', { class: 'spinner', style: 'margin:60px auto' })); bgEl.append(box); getUI().append(bgEl);
  let d; try { d = await seerrGet('/' + mt + '/' + x.id); } catch (e) { box.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + e.message)); return; }
  const lm = await libMap(), rm = await reqMap(); d.mediaType = mt; d.id = x.id; const st = dStatus(Object.assign({}, d, { mediaType: mt, id: x.id, mediaInfo: d.mediaInfo }), lm, rm);
  const title = d.title || d.name; const year = (d.releaseDate || d.firstAirDate || '').slice(0, 4);
  const cast = ((d.credits && d.credits.cast) || []).slice(0, 10);
  const seasons = (d.seasons || []).filter(s => s.seasonNumber > 0); const picked = new Set(seasons.map(s => s.seasonNumber));
  const have = new Set(((d.mediaInfo && d.mediaInfo.seasons) || []).filter(s => s.status >= 2).map(s => s.seasonNumber)); have.forEach(n => picked.delete(n));
  const status = h('div', { class: 'sr-status' });
  const btn = h('button', { class: 'btn white' }, ic('plus'), t('request'));
  const upd = () => { btn.disabled = false; };
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = '…';
    try { const body = { mediaType: mt, mediaId: x.id }; if (mt === 'tv') body.seasons = [...picked]; await cpostSeerr('/request', body); toast('✓ ' + t('requested')); resetSeerrCache(); closeModal(bgEl); }
    catch (e) { toast('⚠ ' + ((e.responseJSON && e.responseJSON.message) || e.statusText || 'error')); btn.disabled = false; btn.replaceChildren(ic('plus'), t('request')); }
  };
  if (st.k === 'own') { status.append(h('span', { class: 'dmark own' }, ic('check', 'ic-s'), t('inLib'))); if (st.item) btn.replaceWith(h('button', { class: 'btn white', onclick: () => { closeModal(bgEl); playVideo(st.item); } }, ic('play'), t('play'))); else btn.remove(); }
  else if (st.k === 'req' && mt === 'movie') { status.append(h('span', { class: 'dmark req' }, ic('star', 'ic-s'), t('requested'))); btn.remove(); }
  const seasonBox = mt === 'tv' ? h('div', { class: 'sr-seasons' }, seasons.map(s => h('label', { class: 'nf-chip' + (have.has(s.seasonNumber) ? ' dis' : picked.has(s.seasonNumber) ? ' on' : ''), onclick: e => { e.preventDefault(); if (have.has(s.seasonNumber)) return; picked.has(s.seasonNumber) ? picked.delete(s.seasonNumber) : picked.add(s.seasonNumber); e.currentTarget.classList.toggle('on'); } }, (L === 'de' ? 'Staffel ' : 'Season ') + s.seasonNumber + (have.has(s.seasonNumber) ? ' ✓' : '')))) : null;
  box.replaceChildren(
    h('div', Object.assign({ class: 'sr-hero' }, bg(TM(d.backdropPath, 'w1280'))), h('button', { class: 'sr-close', onclick: () => closeModal(bgEl), 'aria-label': 'Close' }, ic('close'))),
    h('div', { class: 'sr-body' }, h('h2', {}, title), h('div', { class: 'nf-meta' }, d.voteAverage ? h('span', { class: 'match' }, Math.round(d.voteAverage * 10) + '%') : null, year ? h('span', {}, year) : null, d.runtime ? h('span', {}, d.runtime + ' ' + t('min')) : null, (d.genres || []).slice(0, 3).map(g => h('span', {}, g.name))),
      status, h('p', { class: 'sr-ov' }, d.overview || ''), seasonBox, cast.length ? h('div', { class: 'sr-cast' }, cast.map(c => h('span', {}, c.name))) : null,
      h('div', { class: 'nf-btns', style: 'margin-top:18px' }, btn, h('button', { class: 'btn grey', onclick: () => closeModal(bgEl) }, t('close')))));
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
  const name = aName(o); const sub = kind === 'artist' ? t('artist') : [pk(o, ['artistName', 'artist']) || '', pk(o, ['year', 'releaseYear'])].filter(Boolean).join(' · ');
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
  if (!plug().aurral) return;
  try {
    const [ar, al] = await Promise.all([aget('/api/search', { q, scope: 'artist', limit: 10 }).catch(() => null), aget('/api/search', { q, scope: 'album', limit: 10 }).catch(() => null)]);
    const a = aList(ar), b = aList(al);
    if (a.length) node.append(shelf(t('musicRequestArtists'), a.map(o => aurralTile(o, 'artist'))));
    if (b.length) node.append(shelf(t('musicRequestAlbums'), b.map(o => aurralTile(o, 'album'))));
  } catch (e) { }
}
async function aurralDiscoverShelves(node) {
  if (!plug().aurral) return;
  try {
    const r = await aget('/api/discover');
    const lists = [['recommendations', t('discoverMusic')], ['globalTop', t('globalTopArtists')]];
    for (const [key, title] of lists) {
      const arr = Array.isArray(r[key]) ? r[key] : []; if (!arr.length) continue;
      node.append(shelf(title, arr.slice(0, 16).map(o => aurralTile(o, /album/i.test(o.type || '') ? 'album' : 'artist'))));
    }
  } catch (e) { }
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
  return ApiClient.getUrl('Audio/' + it.Id + '/universal', {
    UserId: uid(), DeviceId: ApiClient.deviceId(), MaxStreamingBitrate: 140000000, Container: 'opus,mp3|mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg',
    TranscodingContainer: 'mp3', TranscodingProtocol: 'http', AudioCodec: 'mp3', ApiKey: ApiClient.accessToken(), PlaySessionId: P.psid, EnableRedirection: true, EnableRemoteMedia: false
  });
}
const rep = (kind, extra) => { try { const it = cur(); if (!it) return; const o = Object.assign({ ItemId: it.Id, PlaySessionId: P.psid, PositionTicks: Math.floor(P.audio.currentTime * 1e7), IsPaused: P.audio.paused, CanSeek: true, MediaSourceId: it.Id, PlayMethod: 'DirectStream', QueueableMediaTypes: ['Audio'] }, extra); ApiClient['reportPlayback' + kind](o); } catch (e) { } };
function loadCurrent(autoplay) {
  const it = cur(); if (!it) return;
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
  const center = h('div', { class: 'pl-c' }, h('div', { class: 'pl-btns' }, bShuffle, bPrev, bPlay, bNext, bRep), h('div', { class: 'pl-seek' }, tCur, seek, tDur));
  const vol = seekBar(null, f => { P.audio.volume = f; vol.set(f); try { localStorage.setItem('cx-vol', f); } catch (e) { } });
  const sv = parseFloat((() => { try { return localStorage.getItem('cx-vol'); } catch (e) { return null; } })()); P.audio.volume = isFinite(sv) ? sv : 1; vol.set(P.audio.volume);
  const bQ = h('button', { class: 'pl-btn', onclick: toggleQueue, 'aria-label': t('queue') }, ic('queue'));
  const bMute = h('button', { class: 'pl-btn', onclick: () => { P.audio.muted = !P.audio.muted; vol.set(P.audio.muted ? 0 : P.audio.volume); } }, ic('vol'));
  const right = h('div', { class: 'pl-r' }, bQ, bMute, vol);
  const bar = h('div', { class: 'sp-player' }, left, center, right);

  /* mobile mini + full */
  const mcv = h('div', { class: 'cv' }), mtn = h('b', { class: 'ell' }), mta = h('span', { class: 'ell' }), mpp = h('button', { class: 'pl-btn', onclick: e => { e.stopPropagation(); toggle(); } }, ic('play')), mfill = h('i');
  const mini = h('div', { class: 'sp-mini hide', onclick: () => openFull(true) }, mcv, h('div', { class: 'tx' }, mtn, mta), mpp, h('div', { class: 'mbar' }, mfill));
  const fcv = h('div', { class: 'cvbig' }), ftn = h('div', { class: 'tn' }), fta = h('div', { class: 'ta' }), fLike = h('div');
  const fcur = h('span', {}, '0:00'), fdur = h('span', {}, '0:00');
  const fseek = seekBar(null, (f, commit) => { if (P.audio.duration) { if (commit) P.audio.currentTime = f * P.audio.duration; fcur.textContent = fmtTime(f * P.audio.duration); } });
  const fb = { sh: h('button', { class: 'pl-btn', onclick: toggleShuffle }, ic('shuffle')), pv: h('button', { class: 'pl-btn', onclick: prev }, ic('prev')), pp: h('button', { class: 'pl-btn big', onclick: toggle }, ic('play')), nx: h('button', { class: 'pl-btn', onclick: () => next() }, ic('next')), rp: h('button', { class: 'pl-btn', onclick: cycleRepeat }, ic('repeat')) };
  const full = h('div', { class: 'sp-full' }, h('div', { class: 'top' }, h('button', { class: 'pl-btn', onclick: () => openFull(false) }, ic('down')), h('b', {}, t('nowPlaying')), h('button', { class: 'pl-btn', onclick: () => { openFull(false); toggleQueue(); } }, ic('queue'))), fcv,
    h('div', { class: 'meta' }, h('div', { style: 'min-width:0' }, ftn, fta), fLike), h('div', { class: 'seekwrap' }, fseek, h('div', { class: 'pl-seek' }, fcur, h('span', { style: 'flex:1' }), fdur)), h('div', { class: 'ctr' }, fb.sh, fb.pv, fb.pp, fb.nx, fb.rp));
  function openFull(on) { full.classList.toggle('open', on); }

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
      likeSlot.replaceChildren(trackLikeBtn(it)); fLike.replaceChildren(trackLikeBtn(it));
      dominant(trackImg(it, 64)).then(c => { full.style.setProperty('--tint', rgb(c)); mini.style.setProperty('--mini', rgb(c.map(v => Math.round(v * .55)))); });
      tDur.textContent = fdur.textContent = fmtTime((it.RunTimeTicks || 0) / 1e7);
    }
    $$('.pl-btn', likeSlot).concat($$('.pl-btn', fLike)).forEach(b => b._upd && b._upd());
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
    tDur.textContent = fdur.textContent = fmtTime(d); mfill.style.width = f * 100 + '%';
  };
  return { bar, mini, full };
}
let tickUI = () => { };
let queueEl = null;
function toggleQueue() { if (queueEl) { queueEl.remove(); queueEl = null; return; } queueEl = h('div', { class: 'sp-queue' }); $('.sp-main', root).parentElement.append(queueEl); renderQueue(); }
function renderQueue() {
  if (!queueEl) return; const it = cur();
  const rowQ = (x, k) => h('div', { class: 'sp-qi' + (k === P.i ? ' playing' : ''), onclick: () => { P.i = k; loadCurrent(); } }, h('div', Object.assign({ class: 'cv' }, bg(trackImg(x, 100)))), h('div', {}, h('b', { class: 'ell' }, x.Name), h('span', { class: 'ell' }, artistText(x))));
  queueEl.replaceChildren(h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, h('h3', {}, t('queue')), h('button', { class: 'pl-btn', onclick: toggleQueue }, ic('close'))),
    it ? [h('h4', {}, t('nowPlaying')), rowQ(it, P.i)] : '', P.q.length > P.i + 1 ? [h('h4', {}, t('nextIn')), P.q.slice(P.i + 1, P.i + 101).map((x, k) => rowQ(x, P.i + 1 + k))] : '');
}

/* ---------- menus / modals ---------- */
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
document.addEventListener('click', closeMenu, true);
function openMenu(x, y, entries) {
  closeMenu();
  menuEl = h('div', { class: 'sp-menu' }, entries.map(en => en === '-' ? h('hr') : h('button', { onclick: e => { e.stopPropagation(); closeMenu(); en.fn(); } }, en.icon ? ic(en.icon, 'ic-s') : null, en.label)));
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
  wrap.append(h('div', { class: 'sp-th' + (noAlb ? ' noalb' : '') }, h('span', {}, '#'), h('span', {}, t('title')), noAlb ? null : h('span', {}, t('album')), h('span', {}, ''), h('span', {}, '⏱')));
  // grid has 5 columns with album, 4 without; adjust header to match
  const th = $('.sp-th', wrap); if (!noAlb) { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, t('album')), h('span', {}, ''), h('span', {}, '⏱')); } else { th.replaceChildren(h('span', {}, '#'), h('span', {}, t('title')), h('span', {}, ''), h('span', {}, '⏱')); }
  let lastDisc = null;
  tracks.forEach((it, idx) => {
    if (ctx.discs && it.ParentIndexNumber && it.ParentIndexNumber !== lastDisc && tracks.some(x => (x.ParentIndexNumber || 1) > 1)) { lastDisc = it.ParentIndexNumber; wrap.append(h('div', { class: 'sp-disc' }, ic('note', 'ic-s'), 'Disc ' + lastDisc)); }
    const lk = trackLikeBtn(it, 'lk');
    const play = () => playList(tracks, idx, { ctx: ctx.id ? { id: ctx.id } : null });
    const rowEl = h('div', { class: 'sp-row' + (noAlb ? ' noalb' : '') + (cur() && cur().Id === it.Id ? ' playing' : ''), 'data-id': it.Id, ondblclick: play, onclick: () => { if (matchMedia('(pointer:coarse)').matches || innerWidth <= 800) play(); }, oncontextmenu: e => trackMenu(e, it, ctx) },
      h('div', { class: 'ix' }, h('span', { class: 'n' }, ctx.number === 'idx' ? idx + 1 : (it.IndexNumber || idx + 1)), h('div', { class: 'eq' }, h('i'), h('i'), h('i')), h('button', { class: 'pl', onclick: e => { e.stopPropagation(); (cur() && cur().Id === it.Id) ? toggle() : play(); } }, ic('play'))),
      h('div', { class: 'ti' }, ctx.noCover ? null : h('div', Object.assign({ class: 'cv' }, bg(trackImg(it, 100)))), h('div', { class: 'tx' }, h('div', { class: 'tn ell' }, it.Name), h('div', { class: 'ta ell' }, artistLinks(it)))),
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
    const li = (o) => h('button', { class: 'sp-li' + (o.round ? ' round' : '') + (hash.includes(o.id) ? ' on' : ''), 'data-id': o.id, onclick: () => go(o.href) }, h('div', Object.assign({ class: 'art' + (o.cls ? ' ' + o.cls : '') }, bg(o.img)), o.img || o.cls ? (o.cls ? ic('heartOn') : null) : h('span', { class: 'cv-ph' }, ic(o.round ? 'user' : 'note'))), h('div', {}, h('div', { class: 'nm ell' }, o.name), h('div', { class: 'sb ell' }, o.sub)));
    if (libTab === 'playlists') { libList.append(li({ id: 'liked', name: t('liked'), sub: t('playlist'), href: '#/c/music/liked', cls: 'liked-art' })); lib.playlists.forEach(p => libList.append(li({ id: p.Id, name: p.Name, sub: t('playlist') + (p.ChildCount ? ' · ' + p.ChildCount : ''), img: imgUrl(p, 'Primary', 100), href: '#/c/music/playlist/' + p.Id }))); }
    if (libTab === 'albums') lib.albums.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: [t('album1'), a.AlbumArtist].filter(Boolean).join(' · '), img: imgUrl(a, 'Primary', 100), href: '#/c/music/album/' + a.Id })));
    if (libTab === 'artists') lib.artists.slice(0, 300).forEach(a => libList.append(li({ id: a.Id, name: a.Name, sub: t('artist'), img: imgUrl(a, 'Primary', 100), round: true, href: '#/c/music/artist/' + a.Id })));
  }
  C.fillLib = fillLib;
  const side = h('div', { class: 'sp-side' },
    h('div', { class: 'sp-card sp-top' }, h('a', { class: 'sp-navlink', href: '#/c/music', 'data-k': 'home' }, ic('home'), t('home')), h('a', { class: 'sp-navlink', href: '#/c/music/search', 'data-k': 'search' }, ic('search'), t('search')), h('a', { class: 'sp-navlink', href: '#/home' }, ic('film'), t('moviesTv'))),
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
  hd.replaceChildren(h('button', { class: 'sp-hbtn', 'aria-label': 'Back', onclick: () => history.back() }, ic('left')), h('button', { class: 'sp-hbtn', 'aria-label': 'Forward', onclick: () => history.forward() }, ic('right')));
  if (opts.search) { const inp = h('input', { type: 'text', placeholder: t('searchMusic'), value: opts.q || '', autocomplete: 'off' }); let tm; inp.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => go('#/c/music/search' + (inp.value.trim() ? '/' + encodeURIComponent(inp.value.trim()) : '')), 350); }); hd.append(h('div', { class: 'sp-hsearch' }, ic('search'), inp)); setTimeout(() => { if (!opts.q) inp.focus(); }, 50); }
  hd.append(h('div', { style: 'flex:1' }));
  if (opts.title) hd.append(h('b', { class: 'ell', style: 'opacity:0' }, opts.title));
}

C.renderMusic = async function (r) {
  if (!C.sp) buildSP();
  if (!C.libCache) loadLibrary().then(() => C.fillLib && C.fillLib());
  const sp = C.sp; const [, , view, id] = r.parts;
  $$('.sp-navlink[data-k]', sp.side).forEach(a => a.classList.toggle('on', (a.dataset.k === 'home' && !view) || (a.dataset.k === 'search' && view === 'search')));
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
    else if (view === 'mix') await mMix(node, decodeURIComponent(id));
    else if (view === 'library') await mLibrary(node);
  } catch (e) { console.error('[cinema music]', e); node.append(h('div', { class: 'nf-empty' }, t('empty'))); }
  try { if (view === 'search' && id) await aurralSearchShelves(node, decodeURIComponent(id)); else if (!view) await aurralDiscoverShelves(node); } catch (e) { }
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
  n.append(h('h2', { style: 'margin-top:8px' }, t('popularTracks')), trackList(top.slice(0, 5), { id: id + '-top', number: 'idx' }));
  $$('.sp-th', n).forEach(x => x.remove());
  n.append(shelf(t('discography'), alb.map(albumTile)));
  if (ar.Overview) n.append(h('h2', {}, t('artist')), h('p', { style: 'color:#b3b3b3;line-height:1.6;max-width:780px' }, ar.Overview.replace(/<[^>]+>/g, '')));
}

/* floating pill in Netflix shell while music plays */
C.updateNPill = function () {
  let pill = $('#cx-npill'); const it = cur();
  if (!it || C.mode === 'sp') { if (pill) pill.remove(); return; }
  if (!pill) { pill = h('div', { id: 'cx-npill', class: 'nf-npill', onclick: () => go('#/c/music') }, h('div', { class: 'cv' }), h('div', { class: 'tx' }, h('b', { class: 'ell' }), h('span', { class: 'ell' })), h('button', { class: 'pp', onclick: e => { e.stopPropagation(); toggle(); } })); root.append(pill); }
  $('.cv', pill).style.backgroundImage = 'url("' + trackImg(it, 100) + '")'; $('b', pill).textContent = it.Name; $('span', pill).textContent = artistText(it); $('.pp', pill).replaceChildren(ic(P.audio.paused ? 'play' : 'pause'));
};

/* ---------- boot ---------- */
C.playAlbum = async it => { const tr = await tracksOf({ ParentId: it.Id, SortBy: 'ParentIndexNumber,IndexNumber,SortName' }); playList(tr, 0, { ctx: { id: it.Id } }); };
const st = document.createElement('style'); st.id = 'cx-style'; st.textContent = CSS_TEXT;
(document.head || document.documentElement).append(st);
const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'; (document.head || document.documentElement).append(fl);
const KILL = /ElegantFin|elegant-kefin|fin-kefin|media-bar-plugin-support|mediaBarEnhanced\.css/i;
function cleanup() { document.querySelectorAll('link[rel=stylesheet]').forEach(l => { if (KILL.test(l.href)) l.remove(); }); const mb = document.getElementById('slides-container'); if (mb) mb.style.display = 'none'; }
document.documentElement.classList.add('cx-ready'); setSkin(skinOn());
cleanup();
new MutationObserver(cleanup).observe(document.head, { childList: true });
if (document.body) document.body.append(root); else document.addEventListener('DOMContentLoaded', () => document.body.append(root));
window.addEventListener('hashchange', route);
let ready = false;
const iv = setInterval(() => {
  const ok = window.ApiClient && ApiClient.getCurrentUserId && ApiClient.getCurrentUserId();
  if (ok && !ready) { ready = true; Promise.all([loadStatus(), loadCfg()]).then(route); }
  if (!ok && ready) { ready = false; route(); }
}, 400);
document.addEventListener('viewshow', () => { if (ready) route(); });
window.cinemaUI = { dev: { get C() { return C; }, seerrModal: x => seerrModal(x), setSeerrBase(b) { SEERR = b; }, calendarView: p => calendarView(p) }, native(id) { C.allowNative = true; location.hash = '#/details?id=' + id; }, get player() { return P; }, skin(on) { setSkin(on !== false); }, off() { localStorage.setItem('cinema-off', '1'); location.reload(); }, on() { localStorage.removeItem('cinema-off'); location.reload(); } };

})();
