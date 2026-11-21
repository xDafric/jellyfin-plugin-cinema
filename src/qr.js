/* ---------- tiny QR code encoder: byte mode, error correction L, versions 1 to 5 (up to 106 characters) ---------- */
function qrEncode(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text)));
  const SPEC = [null, { d: 19, e: 7 }, { d: 34, e: 10 }, { d: 55, e: 15 }, { d: 80, e: 20 }, { d: 108, e: 26 }];
  let ver = 0; for (let v = 1; v <= 5; v++) if (bytes.length + 2 <= SPEC[v].d) { ver = v; break; }
  if (!ver) return null;
  const { d: nData, e: nEc } = SPEC[ver], size = 17 + 4 * ver;
  /* data bits */
  const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  put(4, 4); put(bytes.length, 8); bytes.forEach(b => put(b, 8));
  for (let i = 0; i < 4 && bits.length < nData * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const cw = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; cw.push(b); }
  for (let pad = 0; cw.length < nData; pad ^= 1) cw.push(pad ? 0x11 : 0xEC);
  /* Reed-Solomon */
  const EXP = new Array(512), LOG = new Array(256); { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
  const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  let gen = [1]; for (let i = 0; i < nEc; i++) { const nx = new Array(gen.length + 1).fill(0); for (let j = 0; j < gen.length; j++) { nx[j] ^= gen[j]; nx[j + 1] ^= mul(gen[j], EXP[i]); } gen = nx; }
  const rem = new Array(nEc).fill(0); for (const b of cw) { const f = b ^ rem[0]; rem.shift(); rem.push(0); for (let j = 0; j < nEc; j++) rem[j] ^= mul(gen[j + 1], f); }
  const all = cw.concat(rem);
  /* matrix with function patterns */
  const M = Array.from({ length: size }, () => new Array(size).fill(0)), F = Array.from({ length: size }, () => new Array(size).fill(false));
  const setF = (r, c, v) => { if (r >= 0 && c >= 0 && r < size && c < size) { M[r][c] = v ? 1 : 0; F[r][c] = true; } };
  const finder = (r0, c0) => { for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) { const on = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)); setF(r0 + r, c0 + c, on); } };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  if (ver >= 2) { const p = 4 * ver + 10; for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) setF(p + r, p + c, Math.max(Math.abs(r), Math.abs(c)) !== 1); }
  setF(size - 8, 8, true);
  for (let i = 0; i < 9; i++) { if (!F[8][i]) F[8][i] = true; if (!F[i][8]) F[i][8] = true; }
  for (let i = 0; i < 8; i++) { F[8][size - 1 - i] = true; F[size - 1 - i][8] = true; }
  /* data placement */
  const dbits = []; all.forEach(b => { for (let i = 7; i >= 0; i--) dbits.push((b >> i) & 1); });
  const place = []; { let up = true, k = 0; for (let c = size - 1; c > 0; c -= 2) { if (c === 6) c--; for (let n = 0; n < size; n++) { const r = up ? size - 1 - n : n; for (let dc = 0; dc < 2; dc++) { const cc = c - dc; if (!F[r][cc]) place.push([r, cc]); } } up = !up; } }
  const MASKS = [(r, c) => (r + c) % 2 === 0, (r, c) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0, (r, c) => (((r >> 1) + Math.floor(c / 3)) % 2) === 0, (r, c) => ((r * c) % 2 + (r * c) % 3) === 0, (r, c) => (((r * c) % 2 + (r * c) % 3) % 2) === 0, (r, c) => (((r + c) % 2 + (r * c) % 3) % 2) === 0];
  const build = mask => {
    const G = M.map(r => r.slice());
    place.forEach(([r, c], i) => { const bit = i < dbits.length ? dbits[i] : 0; G[r][c] = bit ^ (MASKS[mask](r, c) ? 1 : 0); });
    /* format information: error correction L = 01 */
    let fd = (1 << 3) | mask, rm = fd << 10; for (let i = 14; i >= 10; i--) if ((rm >> i) & 1) rm ^= 0x537 << (i - 10);
    const fmt = ((fd << 10) | rm) ^ 0x5412; const fb = i => (fmt >> i) & 1;
    for (let i = 0; i <= 5; i++) G[i][8] = fb(i); G[7][8] = fb(6); G[8][8] = fb(7); G[8][7] = fb(8); for (let i = 9; i < 15; i++) G[8][14 - i] = fb(i);
    for (let i = 0; i < 8; i++) G[8][size - 1 - i] = fb(i); for (let i = 8; i < 15; i++) G[size - 15 + i][8] = fb(i);
    G[size - 8][8] = 1;
    return G;
  };
  const penalty = G => {
    let p = 0;
    for (let a = 0; a < 2; a++) for (let i = 0; i < size; i++) { let run = 1; for (let j = 1; j < size; j++) { const x = a ? G[j][i] : G[i][j], y = a ? G[j - 1][i] : G[i][j - 1]; if (x === y) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
    for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) { const v = G[r][c]; if (v === G[r][c + 1] && v === G[r + 1][c] && v === G[r + 1][c + 1]) p += 3; }
    const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    for (let a = 0; a < 2; a++) for (let i = 0; i < size; i++) for (let j = 0; j + 11 <= size; j++) { let m1 = true, m2 = true; for (let k = 0; k < 11; k++) { const v = a ? G[j + k][i] : G[i][j + k]; if (v !== pat[k]) m1 = false; if (v !== pat[10 - k]) m2 = false; } if (m1) p += 40; if (m2) p += 40; }
    let dark = 0; G.forEach(r => r.forEach(v => { dark += v; })); p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return p;
  };
  let best = null, bs = 1e9; for (let m = 0; m < 8; m++) { const G = build(m), s = penalty(G); if (s < bs) { bs = s; best = G; } }
  return best;
}
/* an SVG element for a QR code of the text (null when the text is too long) */
function qrSvg(text, px) {
  const G = qrEncode(text); if (!G) return null; const n = G.length, q = 3, W = n + 2 * q;
  const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', '0 0 ' + W + ' ' + W); s.setAttribute('width', px || 200); s.setAttribute('height', px || 200); s.setAttribute('shape-rendering', 'crispEdges');
  const bg = document.createElementNS(ns, 'rect'); bg.setAttribute('width', W); bg.setAttribute('height', W); bg.setAttribute('fill', '#fff'); s.appendChild(bg);
  let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (G[r][c]) d += 'M' + (c + q) + ' ' + (r + q) + 'h1v1h-1z';
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); p.setAttribute('fill', '#000'); s.appendChild(p); return s;
}
