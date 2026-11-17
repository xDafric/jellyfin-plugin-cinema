(function () {
  var invoke = window.__TAURI__.core.invoke;
  var f = document.getElementById('f'), url = document.getElementById('url');
  var go = document.getElementById('go'), msg = document.getElementById('msg');
  function say(t, ok) { msg.textContent = t; msg.className = ok ? 'ok' : ''; }
  invoke('get_server').then(function (s) { if (s) url.value = s; }).catch(function () { });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    go.disabled = true; say('Checking server...', true);
    invoke('check_server', { input: url.value }).then(function (info) {
      say('Connected to ' + info.name + ' (Jellyfin ' + info.version + ')', true);
      return invoke('set_server', { input: url.value });
    }).catch(function (err) {
      say(String(err)); go.disabled = false;
    });
  });
})();
