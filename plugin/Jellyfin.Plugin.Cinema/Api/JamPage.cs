namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>The guest page of a jam: one self-contained page (no libraries, no external requests), German or English by browser language.</summary>
internal static class JamPage
{
    public static string Html(string nonce, bool open) => (open ? Page : Gone).Replace("__NONCE__", nonce, System.StringComparison.Ordinal);

    private const string Gone = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Jam</title>
<style nonce="__NONCE__">body{margin:0;min-height:100vh;display:grid;place-items:center;background:#111113;color:#fff;font:16px system-ui,sans-serif;text-align:center;padding:24px}h1{font-size:22px}p{color:#9a9aa2}</style></head>
<body><div><h1 id="t">This jam has ended</h1><p id="p">The link is no longer valid. Ask for a new one.</p></div>
<script nonce="__NONCE__">if(/^de/.test(navigator.language)){document.getElementById('t').textContent='Diese Jam ist beendet';document.getElementById('p').textContent='Der Link ist nicht mehr gültig. Frag nach einem neuen.'}</script></body></html>
""";

    private const string Page = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><meta name="theme-color" content="#111113"><title>Jam</title>
<style nonce="__NONCE__">
*{box-sizing:border-box}body{margin:0;background:#111113;color:#fff;font:16px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;-webkit-tap-highlight-color:transparent}
main{max-width:560px;margin:0 auto;padding:max(18px,env(safe-area-inset-top)) 16px 90px}
h1{font-size:24px;margin:6px 0 2px}.sub{color:#9a9aa2;font-size:14px;margin:0 0 18px}
.card{background:#1b1b1f;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px 16px;margin-bottom:14px}
.now small{display:block;color:#1ed760;font-weight:700;font-size:12px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:4px}.now b{display:block;font-size:18px}.now span{color:#b3b3b8}
input{width:100%;background:#26262b;border:1px solid rgba(255,255,255,.1);border-radius:14px;color:#fff;padding:13px 14px;font:inherit;outline:0}input:focus{border-color:#1ed760}
button{font:inherit;cursor:pointer}.btn{background:#1ed760;color:#000;font-weight:700;border:0;border-radius:999px;padding:12px 18px}.btn:disabled{opacity:.5}
.row{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid rgba(255,255,255,.06)}.row:last-child{border:0}.row div{min-width:0;flex:1}.row b,.row span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row span{color:#9a9aa2;font-size:13.5px}
.add{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:none;color:#fff;font-size:22px;line-height:1}.add:active{transform:scale(.9)}.add.done{background:#1ed760;border-color:#1ed760;color:#000}
.tag{flex:none;font-size:12px;color:#e8c46a}.msg{position:fixed;left:50%;bottom:max(20px,env(safe-area-inset-bottom));transform:translateX(-50%);background:#fff;color:#000;padding:10px 18px;border-radius:999px;font-weight:700;font-size:14px;opacity:0;transition:opacity .2s;pointer-events:none}.msg.on{opacity:1}
h2{font-size:16px;margin:20px 0 6px}.empty{color:#9a9aa2;font-size:14px;padding:6px 4px}
</style></head><body><main>
<div id="join"><h1 id="jt">Join the Jam</h1><p class="sub" id="js">Pick songs for the queue. Your name is shown to the host.</p>
<div class="card"><input id="nm" maxlength="24" autocomplete="nickname" placeholder="Your name"><p style="margin:12px 0 0"><button class="btn" id="go">Join</button></p></div></div>
<div id="app" hidden><h1 id="title">Jam</h1><p class="sub" id="who"></p>
<div class="card now" id="now"><small id="nl">Now playing</small><b id="nb">–</b><span id="na"></span></div>
<div class="card"><input id="q" type="search" placeholder="Search songs or artists" autocomplete="off" enterkeyhint="search"><div id="res"></div></div>
<h2 id="ql">Queue</h2><div class="card" id="queue"><div class="empty" id="qe">Nothing added yet.</div></div></div>
<div class="msg" id="msg"></div></main>
<script nonce="__NONCE__">
(function(){
var de=/^de/.test(navigator.language),T=de?{jt:'Der Jam beitreten',js:'Such Songs für die Warteschlange aus. Dein Name wird dem Gastgeber gezeigt.',nm:'Dein Name',go:'Beitreten',nl:'Läuft gerade',q:'Songs oder Künstler suchen',ql:'Warteschlange',qe:'Noch nichts hinzugefügt.',added:'Hinzugefügt',wait:'Wartet auf Freigabe',full:'Die Jam ist voll',gone:'Die Jam ist beendet',slow:'Bitte kurz warten',dup:'Läuft schon oder ist schon dran',lim:'Zu viele offene Wünsche',err:'Das hat nicht geklappt',as:'Du bist ',by:'von ',pend:'wartet',rej:'abgelehnt'}:{jt:'Join the Jam',js:'Pick songs for the queue. Your name is shown to the host.',nm:'Your name',go:'Join',nl:'Now playing',q:'Search songs or artists',ql:'Queue',qe:'Nothing added yet.',added:'Added',wait:'Waiting for approval',full:'This jam is full',gone:'This jam has ended',slow:'Please wait a moment',dup:'Already playing or queued',lim:'Too many open requests',err:'That did not work',as:'You are ',by:'by ',pend:'pending',rej:'declined'};
var $=function(i){return document.getElementById(i)},code=location.pathname.replace(/\/+$/,'').split('/').pop(),base='/Cinema/jam/'+encodeURIComponent(code),KEY='jam-'+code,g=null,timer=null,st=0;
$('jt').textContent=T.jt;$('js').textContent=T.js;$('nm').placeholder=T.nm;$('go').textContent=T.go;$('nl').textContent=T.nl;$('q').placeholder=T.q;$('ql').textContent=T.ql;$('qe').textContent=T.qe;
function say(m){var e=$('msg');e.textContent=m;e.className='msg on';clearTimeout(st);st=setTimeout(function(){e.className='msg'},2200)}
function api(p,o){o=o||{};o.headers=Object.assign({'X-Jam-Guest':g?g.guest:''},o.headers||{});return fetch(base+p,o)}
function load(){try{g=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){g=null}}
function show(){$('join').hidden=true;$('app').hidden=false;$('title').textContent=g.title||'Jam';$('who').textContent=T.as+g.name;poll();timer=setInterval(poll,4000)}
$('nm').value=(function(){try{return localStorage.getItem('jam-name')||''}catch(e){return ''}})();
$('go').onclick=function(){var n=$('nm').value.trim();try{localStorage.setItem('jam-name',n)}catch(e){}$('go').disabled=true;
fetch(base+'/join?name='+encodeURIComponent(n),{method:'POST'}).then(function(r){if(r.status===423){say(T.full);throw 0}if(!r.ok){say(T.gone);throw 0}return r.json()}).then(function(j){g=j;try{localStorage.setItem(KEY,JSON.stringify(j))}catch(e){}show()}).catch(function(){$('go').disabled=false})};
function row(n,a,right){var d=document.createElement('div');d.className='row';var m=document.createElement('div'),b=document.createElement('b'),s=document.createElement('span');b.textContent=n;s.textContent=a;m.appendChild(b);m.appendChild(s);d.appendChild(m);if(right)d.appendChild(right);return d}
function poll(){api('/state').then(function(r){if(r.status===401){try{localStorage.removeItem(KEY)}catch(e){}clearInterval(timer);location.reload();throw 0}if(!r.ok){clearInterval(timer);say(T.gone);throw 0}return r.json()}).then(function(s){
$('nb').textContent=s.now&&s.now.name?s.now.name:'–';$('na').textContent=s.now&&s.now.artist?s.now.artist:'';var q=$('queue');q.textContent='';
if(!s.queue.length){var e=document.createElement('div');e.className='empty';e.textContent=T.qe;q.appendChild(e)}
s.queue.forEach(function(x){var t=null;if(x.status==='pending'||x.status==='rejected'){t=document.createElement('span');t.className='tag';t.textContent=x.status==='pending'?T.pend:T.rej}q.appendChild(row(x.name,x.artist+' · '+T.by+(x.mine?(de?'dir':'you'):x.by),t))})}).catch(function(){})}
var dq=0;$('q').addEventListener('input',function(){clearTimeout(dq);var v=$('q').value.trim();dq=setTimeout(function(){search(v)},380)});
function search(v){var res=$('res');if(v.length<2){res.textContent='';return}
api('/search?q='+encodeURIComponent(v)).then(function(r){if(r.status===429){say(T.slow);throw 0}if(!r.ok)throw 0;return r.json()}).then(function(list){res.textContent='';list.forEach(function(it){var b=document.createElement('button');b.className='add';b.textContent='+';b.setAttribute('aria-label','Add');
b.onclick=function(){b.disabled=true;api('/add?id='+encodeURIComponent(it.id),{method:'POST'}).then(function(r){if(r.status===409){say(r.status===409?T.dup:T.lim);b.disabled=false;return}if(r.status===429){say(T.slow);b.disabled=false;return}if(!r.ok){say(T.err);b.disabled=false;return}return r.json().then(function(j){b.className='add done';b.textContent='✓';say(j.status==='pending'?T.wait:T.added);poll()})}).catch(function(){b.disabled=false})};
res.appendChild(row(it.name,it.artist+(it.album?' · '+it.album:''),b))})}).catch(function(){})}
load();if(g&&g.guest)show();
})();
</script></body></html>
""";
}
