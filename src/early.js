window.__cxInsets = 1; /* tells the Android app that this interface pads itself with --sat/--sab, see inset.css */
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
