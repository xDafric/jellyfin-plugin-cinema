/* ---------- own editors: images, metadata, identify, refresh, delete (straight against the Jellyfin API, no native page involved) ---------- */
async function jf(method, path, params, body, ctype) {
  const r = await fetch(ApiClient.getUrl(path, params || {}), { method, headers: Object.assign({ Authorization: 'MediaBrowser Client="Cinema", Device="Web", DeviceId="cinema-web", Version="1.0", Token="' + ApiClient.accessToken() + '"' }, body != null ? { 'Content-Type': ctype || 'application/json' } : {}), body: body == null ? undefined : (ctype ? body : JSON.stringify(body)) });
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 140));
  const tx = await r.text(); try { return tx ? JSON.parse(tx) : null; } catch (e) { return tx; }
}
function cxDialog(title, opts) {
  opts = opts || {}; let changed = false;
  const bgEl = h('div', { class: 'cxd-bg' }); const body = h('div', { class: 'cxd-body' }); const foot = h('div', { class: 'cxd-foot' });
  const onk = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  const close = () => { document.removeEventListener('keydown', onk, true); bgEl.classList.remove('show'); setTimeout(() => bgEl.remove(), 220); if (api_.changed) refreshView(); };
  const titleEl = h('b', {});
  titleEl.textContent = title;
  const box = h('div', { class: 'cxd' + (opts.wide ? ' wide' : '') }, h('div', { class: 'cxd-head' }, titleEl, h('button', { class: 'cxd-x', 'aria-label': 'Close', onclick: close }, ic('close'))), body, foot);
  bgEl.append(box); bgEl.addEventListener('mousedown', e => { if (e.target === bgEl) close(); });
  getUI().append(bgEl); requestAnimationFrame(() => bgEl.classList.add('show')); document.addEventListener('keydown', onk, true);
  const api_ = { el: box, body, foot, close, changed: false, setTitle: s => { titleEl.textContent = s; }, busy: () => body.replaceChildren(h('div', { class: 'spinner', style: 'margin:60px auto' })) };
  return api_;
}
const errBox = (d, e) => d.body.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + (e.message || e)));
const field = (label, ctl, hint) => h('label', { class: 'cxd-f' }, h('span', {}, label), ctl, hint ? h('small', {}, hint) : null);

/* ----- images ----- */
const IMG_TYPES = [['Primary', 'imgPrimary'], ['Backdrop', 'imgBackdrop'], ['Logo', 'imgLogo'], ['Thumb', 'imgThumb'], ['Banner', 'imgBanner'], ['Art', 'imgArt'], ['Disc', 'imgDisc']];
async function editImages(id) {
  const d = cxDialog(t('editImages'), { wide: true });
  const imgSrc = (type, idx, w, tag) => ApiClient.getUrl('Items/' + id + '/Images/' + type + (idx == null ? '' : '/' + idx), { maxWidth: w, tag: tag || '', quality: 85 });
  async function main() {
    d.setTitle(t('editImages')); d.foot.replaceChildren(); d.busy();
    let infos; try { infos = await jf('GET', 'Items/' + id + '/Images'); } catch (e) { return errBox(d, e); }
    const sec = ([type, key]) => {
      const list = infos.filter(i => i.ImageType === type); const always = ['Primary', 'Backdrop', 'Logo', 'Thumb'].includes(type);
      if (!list.length && !always) return null;
      const upl = h('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: async e => { const f = e.target.files[0]; if (!f) return; d.busy(); try { const b64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = rej; fr.readAsDataURL(f); }); await jf('POST', 'Items/' + id + '/Images/' + type, null, b64, f.type || 'image/jpeg'); d.changed = true; toast('✓'); } catch (er) { toast('⚠ ' + er.message); } main(); } });
      return h('section', { class: 'cxd-sec' }, h('div', { class: 'cxd-sh' }, h('h3', {}, t(key)), h('div', { class: 'cxd-sa' },
        h('button', { class: 'cxd-chip', onclick: () => remote(type, key) }, ic('search', 'ic-s'), t('searchOnline')), h('button', { class: 'cxd-chip', onclick: () => upl.click() }, ic('plus', 'ic-s'), t('upload')), upl)),
        list.length ? h('div', { class: 'cxd-grid' }, list.map(i => h('div', { class: 'cxd-img' }, h('div', Object.assign({ class: 'ci ' + type.toLowerCase() }, bg(imgSrc(type, i.ImageIndex, 420, i.ImageTag))), h('button', { class: 'cxd-del', 'aria-label': t('delete'), onclick: async () => { d.busy(); try { await jf('DELETE', 'Items/' + id + '/Images/' + type + (i.ImageIndex == null ? '' : '/' + i.ImageIndex)); d.changed = true; } catch (er) { toast('⚠ ' + er.message); } main(); } }, ic('close', 'ic-s'))), h('small', {}, (i.Width && i.Height ? i.Width + ' × ' + i.Height : '') + (i.Size ? ' · ' + Math.round(i.Size / 1024) + ' KB' : ''))))) : h('div', { class: 'cxd-none' }, t('noImages')));
    };
    d.body.replaceChildren(...IMG_TYPES.map(sec).filter(Boolean));
  }
  async function remote(type, key, allLang) {
    d.setTitle(t(key) + ' · ' + t('searchOnline')); d.busy();
    d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: main }, ic('left'), t('back')), h('label', { class: 'cxd-chk' }, h('input', { type: 'checkbox', checked: !!allLang, onchange: e => remote(type, key, e.target.checked) }), t('allLangs')));
    let r; try { r = await jf('GET', 'Items/' + id + '/RemoteImages', { type, startIndex: 0, limit: 60, includeAllLanguages: !!allLang }); } catch (e) { return errBox(d, e); }
    const imgs = r.Images || []; if (!imgs.length) { d.body.replaceChildren(h('div', { class: 'nf-empty' }, t('noImages'))); return; }
    d.body.replaceChildren(h('div', { class: 'cxd-grid rem' }, imgs.map(i => h('button', { class: 'cxd-img pick', onclick: async () => { d.busy(); try { await jf('POST', 'Items/' + id + '/RemoteImages/Download', { type, imageUrl: i.Url, providerName: i.ProviderName }); d.changed = true; toast('✓'); } catch (er) { toast('⚠ ' + er.message); } main(); } },
      h('div', Object.assign({ class: 'ci ' + type.toLowerCase() }, bg(i.ThumbnailUrl || i.Url))), h('small', {}, [i.ProviderName, i.Width && i.Height ? i.Width + '×' + i.Height : '', i.Language ? i.Language.toUpperCase() : ''].filter(Boolean).join(' · '))))));
  }
  main();
}

/* ----- metadata ----- */
async function editMeta(id) {
  const d = cxDialog(t('editMeta'), { wide: true }); d.busy();
  let it; try { it = await ApiClient.getItem(uid(), id); } catch (e) { return errBox(d, e); }
  const csv = a => (a || []).join(', '); const inp = (v, type) => h('input', { type: type || 'text', value: v == null ? '' : v });
  const f = { Name: inp(it.Name), OriginalTitle: inp(it.OriginalTitle), SortName: inp(it.ForcedSortName || ''), Overview: h('textarea', { rows: 6 }, it.Overview || ''), Tagline: inp((it.Taglines || [])[0] || ''), Genres: inp(csv(it.Genres)), Tags: inp(csv(it.Tags)), Studios: inp(csv((it.Studios || []).map(s => s.Name))), Year: inp(it.ProductionYear, 'number'), Premiere: inp(it.PremiereDate ? it.PremiereDate.slice(0, 10) : '', 'date'), Rating: inp(it.OfficialRating), Community: inp(it.CommunityRating, 'number'), Critic: inp(it.CriticRating, 'number') };
  f.Community.step = '0.1'; const lock = h('input', { type: 'checkbox', checked: !!it.LockData });
  const split = s => s.split(',').map(x => x.trim()).filter(Boolean);
  const ovF = field(t('fOverview'), f.Overview); ovF.classList.add('full');
  d.body.replaceChildren(h('div', { class: 'cxd-form' }, field(t('fName'), f.Name), field(t('fOrig'), f.OriginalTitle), field(t('fSort'), f.SortName), field(t('fTagline'), f.Tagline), ovF,
    field(t('fGenres'), f.Genres, t('fComma')), field(t('fTags'), f.Tags, t('fComma')), field(t('fStudios'), f.Studios, t('fComma')), field(t('fYear'), f.Year), field(t('fPremiere'), f.Premiere), field(t('fRating'), f.Rating), field(t('fCommunity'), f.Community), field(t('fCritic'), f.Critic),
    h('label', { class: 'cxd-chk full' }, lock, t('fLock'))));
  const save = h('button', { class: 'btn white', onclick: async () => {
    save.disabled = true;
    try {
      Object.assign(it, { Name: f.Name.value, OriginalTitle: f.OriginalTitle.value, ForcedSortName: f.SortName.value, Overview: f.Overview.value, Taglines: f.Tagline.value ? [f.Tagline.value] : [], Genres: split(f.Genres.value), Tags: split(f.Tags.value), ProductionYear: f.Year.value ? +f.Year.value : null, OfficialRating: f.Rating.value, CommunityRating: f.Community.value ? +f.Community.value : null, CriticRating: f.Critic.value ? +f.Critic.value : null, LockData: lock.checked });
      it.GenreItems = it.Genres.map(n => ({ Name: n })); it.TagItems = it.Tags.map(n => ({ Name: n })); it.Studios = split(f.Studios.value).map(n => ({ Name: n }));
      if (f.Premiere.value) it.PremiereDate = new Date(f.Premiere.value + 'T00:00:00Z').toISOString();
      await jf('POST', 'Items/' + id, null, it); d.changed = true; toast('✓ ' + t('saved')); d.close();
    } catch (e) { toast('⚠ ' + e.message); save.disabled = false; }
  } }, t('save'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), save);
}

/* ----- identify ----- */
function identifyItem(it) {
  const d = cxDialog(t('identify'), { wide: true });
  const kind = { Movie: 'Movie', Series: 'Series', BoxSet: 'BoxSet', MusicAlbum: 'MusicAlbum', MusicArtist: 'MusicArtist', Person: 'Person' }[it.Type]; if (!kind) { errBox(d, { message: 'n/a' }); return; }
  const name = h('input', { type: 'text', value: it.Name }), year = h('input', { type: 'number', value: it.ProductionYear || '', placeholder: t('fYear') }); const res = h('div', { class: 'cxd-results' });
  const go_ = async () => {
    res.replaceChildren(h('div', { class: 'spinner', style: 'margin:40px auto' }));
    try {
      const r = await jf('POST', 'Items/RemoteSearch/' + kind, null, { SearchInfo: { Name: name.value, Year: year.value ? +year.value : null, ProviderIds: {} }, ItemId: id_(), IncludeDisabledProviders: true });
      if (!r.length) { res.replaceChildren(h('div', { class: 'nf-empty' }, t('idNone'))); return; }
      res.replaceChildren(...r.map(x => h('button', { class: 'cxd-res', onclick: async () => { d.busy(); d.foot.replaceChildren(); try { await jf('POST', 'Items/RemoteSearch/Apply/' + it.Id, { ReplaceAllImages: true }, x); d.changed = true; toast('✓ ' + t('idApplied')); d.close(); } catch (e) { errBox(d, e); } } },
        h('div', Object.assign({ class: 'rp' }, bg(x.ImageUrl || ''))), h('div', { class: 'rt' }, h('b', {}, x.Name + (x.ProductionYear ? ' (' + x.ProductionYear + ')' : '')), h('small', {}, x.SearchProviderName || ''), x.Overview ? h('p', {}, x.Overview) : null))));
    } catch (e) { res.replaceChildren(h('div', { class: 'nf-empty' }, '⚠ ' + e.message)); }
  };
  const id_ = () => it.Id;
  name.addEventListener('keydown', e => { if (e.key === 'Enter') go_(); });
  d.body.replaceChildren(h('div', { class: 'cxd-bar' }, name, year, h('button', { class: 'btn white', onclick: go_ }, ic('search'), t('idSearch'))), h('p', { class: 'cxd-hint' }, t('idHint')), res);
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')));
}

/* ----- refresh ----- */
function refreshItem(it) {
  const d = cxDialog(t('refreshMeta')); let mode = 'missing'; const opts = [['scan', 'rfScan'], ['missing', 'rfMissing'], ['replace', 'rfReplace']];
  const imgs = h('input', { type: 'checkbox' });
  const list = h('div', { class: 'cxd-opts' }, opts.map(([k, key]) => h('label', { class: 'cxd-opt' + (k === mode ? ' on' : ''), onclick: e => { mode = k; $$('.cxd-opt', list).forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); imgRow.style.display = k === 'replace' ? '' : 'none'; } }, h('b', {}, t(key)), h('small', {}, t(key + 'Hint')))));
  const imgRow = h('label', { class: 'cxd-chk', style: 'display:none' }, imgs, t('rfImages'));
  d.body.replaceChildren(list, imgRow);
  const go_ = h('button', { class: 'btn white', onclick: async () => {
    const q = { Recursive: true, ImageRefreshMode: mode === 'scan' ? 'Default' : 'FullRefresh', MetadataRefreshMode: mode === 'scan' ? 'Default' : 'FullRefresh', ReplaceAllImages: mode === 'replace' && imgs.checked, ReplaceAllMetadata: mode === 'replace' };
    try { await jf('POST', 'Items/' + it.Id + '/Refresh', q); toast('✓ ' + t('rfStarted')); d.close(); setTimeout(refreshView, 4000); } catch (e) { toast('⚠ ' + e.message); }
  } }, ic('refresh'), t('rfStart'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}

/* ----- delete ----- */
function deleteItem(it) {
  const d = cxDialog(t('delete'));
  d.body.replaceChildren(h('p', { class: 'cxd-hint', style: 'font-size:15px;color:#e4e4e8' }, t('delConfirm').replace('{n}', it.Name)));
  const go_ = h('button', { class: 'btn danger', onclick: async () => { go_.disabled = true; try { await jf('DELETE', 'Items/' + it.Id); toast('✓ ' + t('delDone')); d.close(); location.hash = '#/home'; } catch (e) { toast('⚠ ' + e.message); go_.disabled = false; } } }, ic('close'), t('delete'));
  d.foot.replaceChildren(h('button', { class: 'btn grey', onclick: d.close }, t('cancel')), go_);
}
