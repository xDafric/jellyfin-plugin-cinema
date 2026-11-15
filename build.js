// node build.js  ->  dist/cinema.js  (single file for JavaScript Injector)
const fs = require('fs'), path = require('path');
const r = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const css = r('style.css') + String.fromCharCode(10) + r('extra.css') + String.fromCharCode(10) + r('plugins.css') + String.fromCharCode(10) + r('v3.css') + String.fromCharCode(10) + r('v4.css') + String.fromCharCode(10) + r('v5.css') + String.fromCharCode(10) + r('v6.css') + String.fromCharCode(10) + r('v7.css') + String.fromCharCode(10) + r('v8.css') + String.fromCharCode(10) + r('v9.css') + String.fromCharCode(10) + r('v10.css') + String.fromCharCode(10) + r('v11.css') + String.fromCharCode(10) + r('v12.css') + String.fromCharCode(10) + r('v13.css') + String.fromCharCode(10) + r('v14.css') + String.fromCharCode(10) + r('v15.css');
const out = `/* Cinema UI - Netflix + Spotify style frontend for Jellyfin 12. Kill switch: add #nocinema to the URL or run cinemaUI.off() */
(function () {
'use strict';
if (window.__cinemaUI) return; window.__cinemaUI = 1;
try { if (/nocinema/.test(location.hash + location.search) || localStorage.getItem('cinema-off') === '1') { document.documentElement.classList.add('cx-off'); return; } } catch (e) {}
const CSS_TEXT = ${JSON.stringify(css)};
${r('icons.js')}
${r('core.js')}
${r('nav.js')}
${r('features.js')}
${r('pages.js')}
${r('settings.js')}
${r('discover.js')}
${r('services.js')}
${r('player.js')}
${r('discover2.js')}
${r('extras.js')}
${r('musicx.js')}
${r('music.js')}
${r('boot.js')}
})();
`;
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'cinema.js'), out);
console.log('built', out.length, 'bytes');
