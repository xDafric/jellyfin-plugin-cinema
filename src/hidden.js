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
