/* Builds every icon from one definition: node branding/generate.js (needs `sharp` and `png-to-ico`, see branding/README.md) */
const fs = require('fs'), path = require('path');
const req = m => { try { return require(m); } catch (e) { return require(path.join(process.env.ICON_MODULES || '', m)); } };
const sharp = req('sharp'); const _ico = req('png-to-ico'); const pngToIco = _ico.default || _ico;
const out = p => path.join(__dirname, p);
const BG = '#111113', RED = '#e50914', WHITE = '#ffffff', GREY = '#5a5a62';

/* the mark: four rounded tiles, one white, one red, two grey. Coordinates are a 1024 grid; `s` scales the block around the centre */
const tiles = (s = 1, colors = [WHITE, GREY, GREY, RED]) => {
  const size = 273 * s, gap = 47 * s, r = 68 * s, x0 = 512 - size - gap / 2, x1 = 512 + gap / 2;
  const pos = [[x0, x0], [x1, x0], [x0, x1], [x1, x1]];
  return pos.map(([x, y], i) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="${r.toFixed(1)}" fill="${colors[i]}"/>`).join('');
};
const svg = (inner, w = 1024, h = 1024) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`;
const rounded = svg(`<rect width="1024" height="1024" rx="224" fill="${BG}"/>${tiles()}`);
const square = svg(`<rect width="1024" height="1024" fill="${BG}"/>${tiles()}`);
const fg = svg(tiles(0.64)); /* adaptive icon foreground: block inside the safe zone */
const mono = svg(tiles(0.64, [WHITE, WHITE, WHITE, WHITE]));

const png = (s, size, file) => { fs.mkdirSync(path.dirname(file), { recursive: true }); return sharp(Buffer.from(s), { density: 384 }).resize(size, size).png().toFile(file); };

(async () => {
  fs.writeFileSync(out('icon.svg'), rounded); fs.writeFileSync(out('icon-square.svg'), square); fs.writeFileSync(out('favicon.svg'), rounded);
  const jobs = [];
  for (const n of [1024, 512, 256, 192, 180, 128, 64, 48, 32, 16]) jobs.push(png(rounded, n, out('png/icon-' + n + '.png')));
  jobs.push(png(square, 512, out('png/icon-512-square.png'))); /* store listings want a full square */
  /* Android: adaptive layers (108 dp canvas), legacy launcher icons, themed (monochrome) layer */
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    jobs.push(png(fg, Math.round(108 * k), out(`android/res/mipmap-${d}/ic_launcher_foreground.png`)));
    jobs.push(png(mono, Math.round(108 * k), out(`android/res/mipmap-${d}/ic_launcher_monochrome.png`)));
    jobs.push(png(rounded, Math.round(48 * k), out(`android/res/mipmap-${d}/ic_launcher.png`)));
  }
  fs.mkdirSync(out('android/res/values'), { recursive: true });
  fs.writeFileSync(out('android/res/values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${BG}</color>\n</resources>\n`);
  fs.mkdirSync(out('android/res/mipmap-anydpi-v26'), { recursive: true });
  fs.writeFileSync(out('android/res/mipmap-anydpi-v26/ic_launcher.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>\n`);
  /* Android TV banner: 320x180 dp (xhdpi 640x360): the mark and the word mark */
  const banner = (w, h) => { const k = h / 360; return svg(`<rect width="${w}" height="${h}" fill="${BG}"/><g transform="translate(${56 * k} ${(h - 200 * k) / 2}) scale(${200 * k / 1024})">${tiles()}</g><text x="${278 * k}" y="${204 * k}" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="${70 * k}" letter-spacing="${-2 * k}" fill="#ffffff">DAFRIC</text><rect x="${280 * k}" y="${226 * k}" width="${64 * k}" height="${10 * k}" rx="${5 * k}" fill="${RED}"/>`, w, h); };
  fs.mkdirSync(out('android/res/drawable-xhdpi'), { recursive: true });
  jobs.push(sharp(Buffer.from(banner(640, 360)), { density: 192 }).resize(640, 360).png().toFile(out('android/res/drawable-xhdpi/banner.png')));
  jobs.push(sharp(Buffer.from(banner(320, 180)), { density: 192 }).resize(320, 180).png().toFile(out('android/res/drawable-mdpi/banner.png')).catch(() => { fs.mkdirSync(out('android/res/drawable-mdpi'), { recursive: true }); return sharp(Buffer.from(banner(320, 180)), { density: 192 }).resize(320, 180).png().toFile(out('android/res/drawable-mdpi/banner.png')); }));
  await Promise.all(jobs);
  const ico = await pngToIco([256, 128, 64, 48, 32, 16].map(n => out('png/icon-' + n + '.png')));
  fs.writeFileSync(out('icon.ico'), ico);
  fs.writeFileSync(out('favicon.ico'), await pngToIco([32, 16].map(n => out('png/icon-' + n + '.png'))));
  console.log('icons written to', __dirname);
})();
