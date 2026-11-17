/* ---------- Android app (phone / tablet): downloads, now-playing for the system notification, return from the native player ----------
   The app injects window.CinemaNative (see PLATFORM.md). Everything here is feature-detected, so the same UI still runs in a plain browser and in TV mode. */
Object.assign(TX.en, {
  dlTitle: 'Downloads', dlIntro: 'Movies and episodes saved on this device. They play without a connection.', dlNone: 'Nothing downloaded yet. Open a movie or episode and tap Download.', dlOnlyApp: 'Downloads are available in the Cinema app for Android.',
  dlBtn: 'Download', dlQueued: 'Download started', dlDone: 'Downloaded', dlErr: 'Download failed', dlRemove: 'Remove', dlRemoveQ: 'Remove this download from the device?', dlPause: 'Pause', dlResume: 'Resume', dlPlay: 'Play',
  dlWifi: 'Download on Wi-Fi only', dlWifiHint: 'Large files wait until you are on Wi-Fi.', dlUsed: 'Used on this device', dlStDone: 'On this device', dlStDown: 'Downloading', dlStQueued: 'Waiting', dlStPaused: 'Paused', dlStFailed: 'Failed', dlOf: 'of'
});
Object.assign(TX.de, {
  dlTitle: 'Downloads', dlIntro: 'Filme und Folgen, die auf diesem Gerät gespeichert sind. Sie laufen ohne Verbindung.', dlNone: 'Noch nichts heruntergeladen. Öffne einen Film oder eine Folge und tippe auf Download.', dlOnlyApp: 'Downloads gibt es in der Cinema-App für Android.',
  dlBtn: 'Download', dlQueued: 'Download gestartet', dlDone: 'Heruntergeladen', dlErr: 'Download fehlgeschlagen', dlRemove: 'Entfernen', dlRemoveQ: 'Diesen Download vom Gerät entfernen?', dlPause: 'Pausieren', dlResume: 'Fortsetzen', dlPlay: 'Abspielen',
  dlWifi: 'Nur im WLAN herunterladen', dlWifiHint: 'Große Dateien warten, bis du im WLAN bist.', dlUsed: 'Belegt auf diesem Gerät', dlStDone: 'Auf dem Gerät', dlStDown: 'Lädt', dlStQueued: 'Wartet', dlStPaused: 'Pausiert', dlStFailed: 'Fehlgeschlagen', dlOf: 'von'
});
const APPN = (() => { try { return window.CinemaNative && !window.CinemaTV && typeof window.CinemaNative.downloads === 'function' ? window.CinemaNative : null; } catch (e) { return null; } })();
const dlList = () => { try { return JSON.parse(APPN.downloads()); } catch (e) { return []; } };
const dlOk = it => !!it && ['Movie', 'Episode', 'Video', 'MusicVideo'].includes(it.Type);
const dlStateOf = id => dlList().find(d => d.id === id);
window.cxDlResult = (id, r) => { toast(r === 'ok' ? t('dlQueued') : t('dlErr') + ' (' + r + ')'); document.querySelectorAll('.ad-btn[data-id="' + id + '"]').forEach(b => dlMark(b, r === 'ok' ? { state: 'queued' } : null)); };
function dlMark(b, d) { b.classList.toggle('on', !!d); const l = b.querySelector('span'); if (l) l.textContent = d ? (d.state === 'done' ? t('dlDone') : d.state === 'queued' || d.state === 'downloading' ? t('dlStDown') : t('dlBtn')) : t('dlBtn'); }
function dlStart(it) { if (!APPN || !dlOk(it)) return; const d = dlStateOf(it.Id); if (d) { toast(d.state === 'done' ? t('dlDone') : t('dlQueued')); return; } try { APPN.download(it.Id); } catch (e) { toast(t('dlErr')); } }
/* button for the detail page / small icon for episode rows (null outside the app) */
function dlButton(it) { if (!APPN || !dlOk(it)) return null; const b = h('button', { class: 'btn grey ad-btn', 'data-id': it.Id, onclick: () => { dlStart(it); setTimeout(() => dlMark(b, dlStateOf(it.Id)), 400); } }, ic('download'), h('span', {}, t('dlBtn'))); dlMark(b, dlStateOf(it.Id)); return b; }
function dlMini(it) { if (!APPN || !dlOk(it)) return null; return h('button', { class: 'ad-mini', 'aria-label': t('dlBtn'), onclick: e => { e.stopPropagation(); dlStart(it); } }, ic('download')); }

const dlSize = b => b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.max(1, Math.round(b / 1e6)) + ' MB';
const DLPOS = {};
async function downloadsView(page) {
  const wrap = h('div', { class: 'nf-page-pad ad-page' }, h('h1', {}, t('dlTitle'))); page.append(wrap);
  if (!APPN) { wrap.append(h('div', { class: 'nf-empty' }, t('dlOnlyApp'))); return; }
  wrap.append(h('p', { class: 'gm-secp' }, t('dlIntro')));
  let wifi = true; try { wifi = APPN.downloadWifiOnly(); } catch (e) { }
  const sw = h('button', { class: 'set-switch' + (wifi ? ' on' : ''), role: 'switch', 'aria-label': t('dlWifi'), onclick: () => { wifi = !wifi; sw.classList.toggle('on', wifi); try { APPN.setDownloadWifiOnly(wifi); } catch (e) { } } }, h('i'));
  const used = h('small', {});
  wrap.append(h('div', { class: 'ad-set' }, h('div', {}, h('b', {}, t('dlWifi')), h('small', {}, t('dlWifiHint'))), sw), used);
  const list = h('div', { class: 'ad-list' }); wrap.append(list);
  const poster = id => { if (DLPOS[id] === undefined) { try { DLPOS[id] = APPN.downloadPoster(id) || ''; } catch (e) { DLPOS[id] = ''; } } return DLPOS[id]; };
  const stText = d => d.state === 'done' ? t('dlStDone') + ' · ' + dlSize(d.total || d.bytes) : d.state === 'downloading' ? t('dlStDown') + ' · ' + dlSize(d.bytes) + (d.total ? ' ' + t('dlOf') + ' ' + dlSize(d.total) : '') : d.state === 'paused' ? t('dlStPaused') : d.state === 'failed' ? t('dlStFailed') : t('dlStQueued');
  let sig = '';
  const draw = () => {
    if (!wrap.isConnected) return false;
    const ds = dlList(); try { used.textContent = t('dlUsed') + ': ' + dlSize(APPN.downloadBytes()); } catch (e) { }
    const s2 = ds.map(d => d.id + d.state + Math.round(d.percent)).join(',');
    if (s2 === sig) return true; sig = s2;
    if (!ds.length) { list.replaceChildren(h('div', { class: 'nf-empty' }, t('dlNone'))); return true; }
    list.replaceChildren(...ds.map(d => {
      const img = poster(d.id);
      const play = () => { try { APPN.play(d.id, 0); } catch (e) { } };
      return h('div', { class: 'ad-row ' + d.state },
        h('div', Object.assign({ class: 'ad-th', onclick: d.state === 'done' ? play : null }, img ? { style: 'background-image:url(' + img + ')' } : {})),
        h('div', { class: 'ad-mid' }, h('b', { class: 'ell' }, d.title), d.subtitle ? h('span', { class: 'ell' }, d.subtitle) : null, h('small', {}, stText(d)),
          d.state !== 'done' ? h('div', { class: 'ad-bar' }, h('i', { style: 'width:' + Math.round(d.percent) + '%' })) : null),
        h('div', { class: 'ad-act' },
          d.state === 'done' ? h('button', { class: 'btn white', onclick: play }, ic('play'), t('dlPlay')) : null,
          d.state === 'downloading' || d.state === 'queued' ? h('button', { class: 'btn grey', onclick: () => { APPN.pauseDownload(d.id); sig = ''; setTimeout(draw, 300); } }, t('dlPause')) : null,
          d.state === 'paused' || d.state === 'failed' ? h('button', { class: 'btn grey', onclick: () => { APPN.resumeDownload(d.id); sig = ''; setTimeout(draw, 300); } }, t('dlResume')) : null,
          h('button', { class: 'btn grey', 'aria-label': t('dlRemove'), onclick: () => { if (confirm(t('dlRemoveQ'))) { APPN.removeDownload(d.id); sig = ''; setTimeout(draw, 500); } } }, t('dlRemove'))));
    }));
    return true;
  };
  draw(); const iv = setInterval(() => { if (!draw()) clearInterval(iv); }, 1500);
}

if (APPN) {
  /* back from the native player: refresh what the current page shows (continue watching, progress) */
  window.cxAppResume = () => { try { refreshView(); } catch (e) { } };
  /* what is playing, for the notification and lock screen; their buttons come back through cxNativeMedia */
  if (typeof APPN.media === 'function') {
    let lastKey = '', lastAt = 0;
    const abs = u => { try { return new URL(u, location.href).href; } catch (e) { return u || ''; } };
    const report = force => {
      try {
        const it = cur(), a = P.audio, now = Date.now();
        const st = { active: !!it && !!a.src, title: it ? it.Name : '', artist: it ? artistText(it) : '', album: (it && it.Album) || '', art: it ? abs(trackImg(it, 512)) : '', playing: !!it && !a.paused && !a.ended,
          pos: Math.round((a.currentTime || 0) * 1000), dur: Math.round((isFinite(a.duration) ? a.duration : 0) * 1000), next: P.i < P.q.length - 1 || P.repeat > 0, prev: true };
        const key = [st.active, st.title, st.playing, st.dur, st.next].join('|');
        if (force || key !== lastKey || now - lastAt > 5000) { lastKey = key; lastAt = now; APPN.media(JSON.stringify(st)); }
      } catch (e) { }
    };
    ['play', 'pause', 'ended', 'loadedmetadata', 'emptied', 'seeked'].forEach(ev => P.audio.addEventListener(ev, () => report(true)));
    P.audio.addEventListener('timeupdate', () => report(false));
    window.cxNativeMedia = cmd => {
      try {
        if (cmd === 'play') { if (P.audio.paused) toggle(); } else if (cmd === 'pause') { if (!P.audio.paused) toggle(); }
        else if (cmd === 'next') next(); else if (cmd === 'prev') prev(); else if (/^seek:/.test(cmd)) P.audio.currentTime = parseInt(cmd.slice(5), 10) / 1000;
      } catch (e) { }
    };
  }
}
