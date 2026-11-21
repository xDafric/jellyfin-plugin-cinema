/* ---------- the stock video player in the Cinema look: Tabler icons through CSS masks (the stock icon font is switched off inside the player) ---------- */
Object.assign(LU, {
  'cast': '<path d="M3 19l.01 0"/> <path d="M7 19a4 4 0 0 0 -4 -4"/> <path d="M11 19a8 8 0 0 0 -8 -8"/> <path d="M15 19h3a3 3 0 0 0 3 -3v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v1"/>',
  'arrow-left': '<path d="M5 12l14 0"/> <path d="M5 12l6 6"/> <path d="M5 12l6 -6"/>',
  'users': '<path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/> <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/> <path d="M16 3.13a4 4 0 0 1 0 7.75"/> <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/>',
  'check-mark': '<path d="M5 12l5 5l10 -10"/>',
  'skip-back-10': '<path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5"/><text x="12.4" y="15.3" font-size="7.2" font-weight="700" text-anchor="middle" fill="black" stroke="none" font-family="Inter,Arial,sans-serif">10</text>',
  'skip-fwd-30': '<g transform="translate(24 0) scale(-1 1)"><path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5"/></g><text x="11.6" y="15.3" font-size="7.2" font-weight="700" text-anchor="middle" fill="black" stroke="none" font-family="Inter,Arial,sans-serif">30</text>',
  'volume-off': '<path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464"/> <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615"/> <path d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664"/> <path d="M3 3l18 18"/>'
});
(function osdIcons() {
  const MAP = { pause: ['player-pause', 1], play_arrow: ['player-play', 1], fast_rewind: ['skip-back-10'], fast_forward: ['skip-fwd-30'], check: ['check-mark'], skip_previous: ['player-skip-back', 1], skip_next: ['player-skip-forward', 1],
    volume_up: ['volume'], volume_down: ['volume'], volume_off: ['volume-off'], closed_caption: ['badge-cc'], settings: ['settings'], picture_in_picture_alt: ['picture-in-picture'], fullscreen: ['maximize'], fullscreen_exit: ['minimize'],
    arrow_back: ['arrow-left'], cast: ['cast'], cast_connected: ['cast'], group: ['users'], audiotrack: ['language'], favorite: ['heart'] };
  let css = '';
  for (const [cls, [name, fill]] of Object.entries(MAP)) {
    if (!LU[name]) continue; const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + (fill ? 'black' : 'none') + '" stroke="black" stroke-width="' + (fill ? 1.2 : 1.8) + '" stroke-linecap="round" stroke-linejoin="round">' + LU[name] + '</svg>';
    css += '#videoOsdPage .material-icons.' + cls + ', body .osdHeader .material-icons.' + cls + (cls === 'check' ? ', .actionSheet .material-icons.check' : '') + '{--cxm:url("data:image/svg+xml,' + encodeURIComponent(svg) + '")}';
  }
  const st = document.createElement('style'); st.id = 'cx-osd-icons'; st.textContent = css; document.head.append(st);
})();
