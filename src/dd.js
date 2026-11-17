/* ---------- custom dropdowns: every <select> inside the Cinema overlay gets a styled menu, the select stays the data source ---------- */
Object.assign(TX.en, { reqAdvHint: 'Choose where this title should be added.' });
Object.assign(TX.de, { reqAdvHint: 'Wähle, wohin der Titel hinzugefügt werden soll.' });
function ddEnhance(sel) {
  if (sel.dataset.dd || sel.multiple || sel.size > 1) return; sel.dataset.dd = '1';
  const lab = h('span', { class: 'dd-l' }); const btn = h('button', { type: 'button', class: 'dd-btn', 'aria-haspopup': 'listbox' }, lab, h('i', { class: 'dd-c' }));
  let menu = null;
  const sync = () => { const o = sel.selectedOptions[0]; lab.textContent = o ? o.textContent : ''; btn.disabled = sel.disabled; btn.hidden = sel.hidden; };
  const close = () => { if (!menu) return; menu.remove(); menu = null; btn.classList.remove('open'); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', close); window.removeEventListener('hashchange', close); };
  const away = e => { if (menu && !menu.contains(e.target) && !btn.contains(e.target)) close(); };
  const pick = o => { if (sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } sync(); close(); };
  const key = e => {
    if (!menu) return; const items = [...menu.querySelectorAll('.dd-i')]; const cur = items.findIndex(x => x === document.activeElement);
    if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); btn.focus(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); const n = items.length ? (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length : 0; if (items[n]) items[n].focus(); }
  };
  const open = () => {
    if (menu) return close(); sync();
    const opts = [...sel.options]; const r = btn.getBoundingClientRect();
    menu = h('div', { class: 'dd-menu', role: 'listbox' }, opts.map(o => h('button', { type: 'button', class: 'dd-i' + (o.selected ? ' on' : ''), role: 'option', disabled: o.disabled, onclick: () => pick(o) }, h('span', {}, o.textContent), o.selected ? ic('check', 'ic-s') : null)));
    getUI().append(menu); btn.classList.add('open');
    const mh = Math.min(menu.scrollHeight, 340); const below = innerHeight - r.bottom - 12; const up = below < mh && r.top > below;
    menu.style.minWidth = r.width + 'px'; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - Math.max(r.width, menu.offsetWidth) - 8)) + 'px';
    menu.style.maxHeight = Math.max(160, Math.min(340, up ? r.top - 16 : below)) + 'px'; menu.style[up ? 'bottom' : 'top'] = (up ? innerHeight - r.top + 6 : r.bottom + 6) + 'px';
    const on = menu.querySelector('.dd-i.on') || menu.querySelector('.dd-i'); if (on) { on.focus({ preventScroll: true }); on.scrollIntoView({ block: 'nearest' }); }
    document.addEventListener('mousedown', away, true); document.addEventListener('keydown', key, true); window.addEventListener('resize', close); window.addEventListener('hashchange', close);
  };
  btn.onclick = e => { e.preventDefault(); e.stopPropagation(); open(); };
  sel.style.display = 'none'; sel.after(btn); sync();
  new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'selected'] });
  sel.addEventListener('change', sync); btn.addEventListener('focus', sync);
}
(function ddInit() {
  let q = 0; const scan = () => { q = 0; document.querySelectorAll('#cx select:not([data-dd]), #cx-ui select:not([data-dd]), #cx-nf select:not([data-dd]), #cx-sp select:not([data-dd])').forEach(ddEnhance); };
  const go_ = () => { if (!q) q = requestAnimationFrame(scan); };
  const start = () => { new MutationObserver(go_).observe(document.body, { childList: true, subtree: true }); go_(); };
  document.body ? start() : document.addEventListener('DOMContentLoaded', start);
})();
