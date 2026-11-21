/* ---------- network speakers (UPnP / DLNA, for example Sonos) ----------
   The app on this device (phone or computer) finds and controls the speakers on ITS home network; the Jellyfin server can be anywhere.
   The server only gives the app a signed link per song, which the speaker fetches from the internet. Speakers appear as devices in Cinema Connect. */
const SP = { list: [], sess: new Map(), seq: 0, scanning: false, last: 0 };
const spNative = () => { const n = window.CinemaNative; return !!n && (typeof n.speakerScan === 'function' || typeof n.speakersScan === 'function'); };
const spDesktop = () => !!(window.CinemaNative && typeof window.CinemaNative.speakerScan === 'function');
const spEsc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const spPick = (d, tag) => { const e = d && d.getElementsByTagNameNS('*', tag)[0]; return e ? e.textContent : ''; };
const spHms = t => { const p = String(t || '').split(':').map(parseFloat); return p.length === 3 && p.every(isFinite) ? p[0] * 3600 + p[1] * 60 + p[2] : 0; };
const spFmt = s => { s = Math.max(0, Math.round(s)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(x => String(x).padStart(2, '0')).join(':'); };

function spScanNative() {
  const n = window.CinemaNative;
  if (spDesktop()) return n.speakerScan().then(l => l || []).catch(() => []);
  return new Promise(res => { const to = setTimeout(() => res([]), 15000); window.cxSpkScan = j => { clearTimeout(to); try { res(JSON.parse(j)); } catch (e) { res([]); } }; try { n.speakersScan(); } catch (e) { clearTimeout(to); res([]); } });
}
const spWait = {};
window.cxSpkSoap = (id, ok, xml) => { const f = spWait[id]; if (f) { delete spWait[id]; f(ok ? xml : null); } };
function spSoap(sp, service, action, args) {
  const n = window.CinemaNative, url = service === 'RenderingControl' ? sp.rc : sp.av; if (!url) return Promise.resolve(null);
  const parse = x => { if (!x) return null; try { return new DOMParser().parseFromString(x, 'text/xml'); } catch (e) { return null; } };
  if (spDesktop()) return n.speakerSoap(url, service, action, args).then(parse).catch(() => null);
  return new Promise(res => { const id = 'q' + (++SP.seq); const to = setTimeout(() => { delete spWait[id]; res(null); }, 9000); spWait[id] = x => { clearTimeout(to); res(parse(x)); }; try { n.speakerSoap(id, url, service, action, args); } catch (e) { clearTimeout(to); delete spWait[id]; res(null); } });
}
const spAv = (sp, action, extra) => spSoap(sp, 'AVTransport', action, '<InstanceID>0</InstanceID>' + (extra || ''));

/* a signed one-song link from the server (valid for a few hours) */
async function spLink(id) {
  const r = await ApiClient.ajax({ type: 'POST', url: ApiClient.getUrl('Cinema/cast/link', { id }), dataType: 'json' });
  const base = (ApiClient.serverAddress() || location.origin).replace(/\/+$/, '');
  return { url: base + '/Cinema/cast/' + r.token + '/track' + r.ext, mime: r.mime };
}

/* ---------- the speakers as devices ---------- */
function spStateOf(s) {
  const m = s.meta[s.queue[s.index]]; if (!m) return null;
  const pos = s.playing ? Math.min(s.dur || 1e9, s.pos + (Date.now() - s.at) / 1000) : s.pos;
  return { playing: s.playing, pos, dur: s.dur, vol: s.vol, muted: false, shuffle: false, repeat: 'off', index: s.index, queue: s.queue.slice(0, 500), item: { id: m.Id.replace(/-/g, ''), name: m.Name || '', artist: artistText(m), album: m.Album || '', albumId: m.AlbumId || '', tag: '' } };
}
const spStateById = id => { const s = SP.sess.get(id); return s ? spStateOf(s) : null; };
function spDevices() { return SP.list.map(sp => { const s = SP.sess.get(sp.id); return { id: sp.id, name: sp.name, kind: 'speaker', self: false, local: true, at: s ? s.at : Date.now(), age: 0, state: s ? spStateOf(s) : null }; }); }
function spPublish() { CN.devices = CN.devices.filter(d => !d.local).concat(spDevices()); cnDraw(); }

/* ---------- play queue on a speaker ---------- */
async function spLoad(s, index, pos, play) {
  if (index < 0 || index >= s.queue.length) return false;
  const id = s.queue[index];
  if (!s.meta[id]) { const m = (await cnTracks([id]))[0]; if (!m) return false; s.meta[id] = m; }
  const m = s.meta[id]; let link; try { link = await spLink(id); } catch (e) { return false; }
  const didl = '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"><item id="0" parentID="-1" restricted="1"><dc:title>' + spEsc(m.Name) + '</dc:title><dc:creator>' + spEsc(artistText(m)) + '</dc:creator><upnp:album>' + spEsc(m.Album || '') + '</upnp:album><upnp:class>object.item.audioItem.musicTrack</upnp:class><res protocolInfo="http-get:*:' + spEsc(link.mime) + ':*">' + spEsc(link.url) + '</res></item></DIDL-Lite>';
  const ok = await spAv(s.sp, 'SetAVTransportURI', '<CurrentURI>' + spEsc(link.url) + '</CurrentURI><CurrentURIMetaData>' + spEsc(didl) + '</CurrentURIMetaData>'); if (!ok) return false;
  s.index = index; s.dur = (m.RunTimeTicks || 0) / 1e7; s.pos = pos; s.saw = false; s.at = Date.now();
  if (play) { await spAv(s.sp, 'Play', '<Speed>1</Speed>'); s.playing = true; if (pos > 1) { await new Promise(r => setTimeout(r, 700)); await spAv(s.sp, 'Seek', '<Unit>REL_TIME</Unit><Target>' + spFmt(pos) + '</Target>'); } }
  s.at = Date.now(); return true;
}
function spWatch(s) {
  clearInterval(s.timer);
  s.timer = setInterval(async () => {
    if (s.busy || !SP.sess.has(s.sp.id)) return; s.busy = true;
    try {
      const ti = await spAv(s.sp, 'GetTransportInfo'), st = spPick(ti, 'CurrentTransportState'), pi = await spAv(s.sp, 'GetPositionInfo');
      const rel = spHms(spPick(pi, 'RelTime')), dur = spHms(spPick(pi, 'TrackDuration')), was = s.playing;
      if (!ti) { if (++s.fails > 8) spEnd(s); return; } s.fails = 0;
      if (st === 'PLAYING' || st === 'TRANSITIONING') { s.playing = true; s.saw = true; s.pos = rel; if (dur > 0) s.dur = dur; }
      else if (st === 'PAUSED_PLAYBACK') { s.playing = false; s.pos = rel; if (was) s.paused = Date.now(); }
      else if ((st === 'STOPPED' || st === 'NO_MEDIA_PRESENT') && s.saw && s.playing) { if (!await spLoad(s, s.index + 1, 0, true)) { s.playing = false; s.pos = 0; } }
      s.at = Date.now();
      if (!s.playing && s.paused && Date.now() - s.paused > 30 * 60 * 1000) { spEnd(s); return; }
      spPublish(); if (P.remote === s.sp.id) cnReport(false);
    } catch (e) { } finally { s.busy = false; }
  }, 2000);
}
function spEnd(s) { clearInterval(s.timer); SP.sess.delete(s.sp.id); if (P.remote === s.sp.id) rmExit(); spPublish(); }

async function spCommand(id, cmd, c) {
  const sp = SP.list.find(x => x.id === id); if (!sp) return false; c = c || {};
  let s = SP.sess.get(id);
  if (cmd === 'transfer') {
    const ids = (c.queue || []).filter(x => typeof x === 'string').slice(0, 500); if (!ids.length) return false;
    if (!s) { s = { sp, queue: [], meta: {}, index: 0, playing: false, pos: 0, dur: 0, vol: null, at: Date.now(), saw: false, busy: false, fails: 0, timer: null, paused: 0 }; SP.sess.set(id, s); }
    s.busy = true; s.queue = ids; s.index = 0;
    const ok = await spLoad(s, Math.min(Math.max(0, c.index || 0), ids.length - 1), c.pos || 0, c.playing !== false);
    s.busy = false; if (!ok) { SP.sess.delete(id); spPublish(); return false; }
    spAv(s.sp, 'GetPositionInfo'); spSoap(sp, 'RenderingControl', 'GetVolume', '<InstanceID>0</InstanceID><Channel>Master</Channel>').then(d => { const v = parseInt(spPick(d, 'CurrentVolume'), 10); if (isFinite(v)) { s.vol = v / 100; spPublish(); } });
    spWatch(s); spPublish(); return true;
  }
  if (!s || !s.queue.length) return false; s.busy = true;
  try {
    if (cmd === 'pause') { await spAv(sp, 'Pause'); s.pos = spStateOf(s) ? spStateOf(s).pos : s.pos; s.playing = false; s.paused = Date.now(); }
    else if (cmd === 'play') { await spAv(sp, 'Play', '<Speed>1</Speed>'); s.playing = true; }
    else if (cmd === 'toggle') { if (s.playing) { await spAv(sp, 'Pause'); s.playing = false; s.paused = Date.now(); } else { await spAv(sp, 'Play', '<Speed>1</Speed>'); s.playing = true; } }
    else if (cmd === 'next') { if (!await spLoad(s, s.index + 1, 0, true)) { await spAv(sp, 'Stop'); s.playing = false; } }
    else if (cmd === 'prev') { await spLoad(s, s.pos > 3 ? s.index : Math.max(0, s.index - 1), 0, true); }
    else if (cmd === 'seek') { const to = Math.max(0, +c.pos || 0); await spAv(sp, 'Seek', '<Unit>REL_TIME</Unit><Target>' + spFmt(to) + '</Target>'); s.pos = to; }
    else if (cmd === 'volume' && sp.rc) { const v = Math.min(1, Math.max(0, +c.vol || 0)); await spSoap(sp, 'RenderingControl', 'SetVolume', '<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>' + Math.round(v * 100) + '</DesiredVolume>'); s.vol = v; }
    else if (cmd === 'queueAdd') { (c.queue || []).slice(0, 200).forEach(x => { if (typeof x === 'string' && s.queue.length < 500) s.queue.push(x); }); }
    s.at = Date.now();
  } finally { s.busy = false; }
  spPublish(); if (P.remote === id) cnReport(true); return true;
}

/* ---------- search ---------- */
async function spScan(quiet) {
  if (!spNative() || SP.scanning) return; SP.scanning = true;
  try { const l = await spScanNative(); SP.list = (l || []).filter(x => x && /^spk_[0-9a-f]+$/.test(x.id)).slice(0, 40); SP.last = Date.now(); spPublish(); if (!quiet) toast(SP.list.length + ' ' + t('cnFound') + (SP.list.length ? '' : ' · ' + t('cnNoSpk'))); }
  finally { SP.scanning = false; }
}
setTimeout(function wait() { if (typeof ApiClient !== 'undefined' && ApiClient.accessToken && ApiClient.accessToken() && CN.started) spScan(true); else if (spNative()) setTimeout(wait, 3000); }, 6000);
