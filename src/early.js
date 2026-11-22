window.__cxInsets = 1; /* tells the Android app that this interface pads itself with --sat/--sab, see inset.css */
/* ---------- early: stylesheet + login skin (must not depend on anything else in this file) ---------- */
(function () {
  try { if (!document.getElementById('cx-style')) { const st = document.createElement('style'); st.id = 'cx-style'; st.textContent = CSS_TEXT; (document.head || document.documentElement).append(st); } } catch (e) { }
  try {
    const RE = /^#!?\/?(login|selectserver|addserver|forgotpassword|forgotpasswordpin|quickconnect)/i; const H = document.documentElement;
    const setBrand = n => { if (n) H.style.setProperty('--cx-brand', JSON.stringify(String(n).toUpperCase())); };
    try { setBrand(localStorage.getItem('cx-brand')); } catch (e) { }
    /* the words on the sign-in card (CSS reads them), and a show / hide button for the password */
    try { const de = /^de/i.test(navigator.language || ''); H.style.setProperty('--cx-lg-h', JSON.stringify(de ? 'Willkommen zurück' : 'Welcome back')); H.style.setProperty('--cx-lg-s', JSON.stringify(de ? 'Melde dich an, um weiterzuschauen und weiterzuhören.' : 'Sign in to keep watching and listening.')); H.style.setProperty('--cx-lg-or', JSON.stringify(de ? 'oder' : 'or')); } catch (e) { }
    const eyeSvg = on => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (on ? '<path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.3A9.8 9.8 0 0 1 12 5c4 0 7.3 2.4 9.5 7a15.7 15.7 0 0 1-2.6 3.7M6.6 6.6A15.7 15.7 0 0 0 2.5 12c2.2 4.6 5.5 7 9.5 7 1.6 0 3.1-.4 4.4-1.1"/>' : '<path d="M2.5 12c2.2-4.6 5.5-7 9.5-7s7.3 2.4 9.5 7c-2.2 4.6-5.5 7-9.5 7s-7.3-2.4-9.5-7z"/><circle cx="12" cy="12" r="3"/>') + '</svg>';
    const eye = () => { const i = document.getElementById('txtManualPassword'); if (!i || !i.parentElement || i.parentElement.querySelector('.cx-eye')) return; const b = document.createElement('button'); b.type = 'button'; b.className = 'cx-eye'; b.setAttribute('aria-label', /^de/i.test(navigator.language || '') ? 'Passwort anzeigen' : 'Show password'); b.innerHTML = eyeSvg(false); b.addEventListener('click', () => { const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = eyeSvg(show); i.focus(); }); i.parentElement.append(b); };
    const tvApp = /CinemaTV/.test(navigator.userAgent);
    const upd = () => {
      if (H.classList.contains('cx-on') && !H.classList.contains('cx-login')) return; // signed in and showing the interface: nothing to detect
      const pg = document.querySelector('#loginPage, #selectServerPage, #forgotPasswordPage, #forgotPasswordPinPage'); const vis = !!(pg && pg.offsetParent !== null && !pg.classList.contains('hide'));
      try { eye(); } catch (e) { }
      const on = RE.test(location.hash) || /\/(login|selectserver|addserver|forgotpassword)(\.html)?\/?$/i.test(location.pathname) || vis; H.classList.toggle('cx-login', on);
      if (on && !upd.f) { upd.f = 1; fetch((location.pathname.split('/web')[0] || '') + '/System/Info/Public').then(r => r.json()).then(i => { setBrand(i.ServerName); try { localStorage.setItem('cx-brand', i.ServerName || ''); } catch (e) { } }).catch(() => { }); }
    };
    window.addEventListener('hashchange', upd); window.addEventListener('popstate', upd); upd(); setInterval(upd, 900); if (!tvApp) new MutationObserver(() => { if (!upd.t) upd.t = setTimeout(() => { upd.t = 0; upd(); }, 250); }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }
})();
