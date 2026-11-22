namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>The guest page of a jam: one self-contained page (no libraries, no external requests), German or English by browser language.</summary>
internal static class JamPage
{
    public static string Html(string nonce, bool open) => (open ? Page : Gone).Replace("__NONCE__", nonce, System.StringComparison.Ordinal);

    private const string Gone = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#121212"><title>Jam</title>
<style nonce="__NONCE__">body{margin:0;min-height:100vh;display:grid;place-items:center;background:#121212;color:#fff;font:16px system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;padding:24px}.o{width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:#282828;display:grid;place-items:center;font-size:34px}h1{font-size:24px;margin:0 0 8px}p{color:#b3b3b3;margin:0}</style></head>
<body><div><div class="o">♪</div><h1 id="t">This Jam has ended</h1><p id="p">The link is no longer valid. Ask your friend for a new one.</p></div>
<script nonce="__NONCE__">if(/^de/.test(navigator.language)){document.getElementById('t').textContent='Diese Jam ist beendet';document.getElementById('p').textContent='Der Link ist nicht mehr gültig. Frag deine Freundin oder deinen Freund nach einem neuen.'}</script></body></html>
""";

    private const string Page = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><meta name="theme-color" content="#121212"><title>Jam</title>
<style nonce="__NONCE__">
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:#121212;color:#fff;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-tap-highlight-color:transparent}
main{max-width:560px;margin:0 auto;padding:0 0 100px}
.top{padding:max(22px,env(safe-area-inset-top)) 18px 18px;background:linear-gradient(180deg,#3a2a5c 0%,#121212 100%)}
.top .pill{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#1ed760}
.dot{width:8px;height:8px;border-radius:50%;background:#1ed760;box-shadow:0 0 0 0 rgba(30,215,96,.6);animation:p 1.8s infinite}@keyframes p{70%{box-shadow:0 0 0 8px rgba(30,215,96,0)}100%{box-shadow:0 0 0 0 rgba(30,215,96,0)}}
h1{font-size:30px;line-height:1.1;margin:10px 0 4px;letter-spacing:-.02em}.sub{color:#c8c0d8;font-size:14px;margin:0}
.card{margin:0 14px 14px;background:#1f1f1f;border-radius:14px;padding:16px}
.join{margin-top:-4px}.join h2{margin:0 0 4px;font-size:20px}.join p{margin:0 0 14px;color:#b3b3b3;font-size:14px}
.nmrow{display:flex;gap:12px;align-items:center}.av{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:18px;flex:none;background:#535353}
input[type=text],input[type=search]{width:100%;background:#2a2a2a;border:2px solid transparent;border-radius:10px;color:#fff;padding:13px 14px;font:inherit;outline:0;transition:border-color .15s,background .15s}input:focus{border-color:#fff;background:#333}
.btn{display:block;width:100%;margin-top:14px;border:0;border-radius:999px;background:#1ed760;color:#000;font-family:inherit;font-weight:800;font-size:16px;padding:14px;cursor:pointer;transition:transform .12s,background .15s}.btn:active{transform:scale(.97)}.btn:disabled{opacity:.5}
.now{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#2c2540,#1f1f1f)}.disc{width:56px;height:56px;border-radius:10px;background:#333;display:grid;place-items:center;flex:none;color:#1ed760;font-size:24px}
.eq{display:inline-flex;gap:3px;align-items:flex-end;height:22px}.eq i{width:4px;height:5px;background:#1ed760;border-radius:2px}.eq.on i{animation:eq 1s ease-in-out infinite}.eq.on i:nth-child(2){animation-delay:.25s}.eq.on i:nth-child(3){animation-delay:.5s}@keyframes eq{0%,100%{height:5px}50%{height:22px}}
.now small{display:block;color:#1ed760;font-size:11.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.now b{display:block;font-size:18px;line-height:1.2;margin-top:2px}.now span.a{color:#b3b3b3;font-size:14px}.now .tx{min-width:0;flex:1}
.sbar{position:sticky;top:0;z-index:5;padding:10px 14px;background:#121212}.sw{position:relative}.sw svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);width:20px;height:20px;color:#8a8a8a;pointer-events:none}.sw input{padding-left:44px;border-radius:999px;background:#2a2a2a}.sw button{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;border-radius:50%;background:none;color:#b3b3b3;font-size:20px;cursor:pointer}
h3{margin:18px 18px 6px;font-size:18px;letter-spacing:-.01em}
.row{display:flex;align-items:center;gap:12px;padding:8px 14px}.row .tx{min-width:0;flex:1}.row b{display:block;font-size:15.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row span.s{display:block;color:#a7a7a7;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.art{width:48px;height:48px;border-radius:6px;background:#2a2a2a;flex:none;display:grid;place-items:center;color:#777;font-size:20px}
.add{flex:none;width:38px;height:38px;border-radius:50%;border:2px solid #7a7a7a;background:none;color:#fff;font-size:24px;line-height:1;cursor:pointer;transition:transform .15s,background .15s,border-color .15s;display:grid;place-items:center;padding:0}.add:hover{border-color:#fff}.add:active{transform:scale(.88)}
.add.done{background:#1ed760;border-color:#1ed760;color:#000;animation:pop .3s}@keyframes pop{50%{transform:scale(1.2)}}
.tag{flex:none;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:#333;color:#d8b64a}.tag.ok{color:#1ed760;background:rgba(30,215,96,.12)}.tag.no{color:#ff8d8d;background:rgba(255,120,120,.12)}
.who{width:26px;height:26px;border-radius:50%;display:inline-grid;place-items:center;font-size:12px;font-weight:800;margin-right:6px;vertical-align:middle;color:#fff}
.empty{padding:22px 18px;color:#8f8f8f;font-size:14px}
.msg{position:fixed;left:50%;bottom:max(22px,env(safe-area-inset-bottom));transform:translate(-50%,20px);background:#fff;color:#000;padding:11px 20px;border-radius:999px;font-weight:700;font-size:14px;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;max-width:90vw;text-align:center}.msg.on{opacity:1;transform:translate(-50%,0)}
.end{position:fixed;inset:0;background:#121212;display:none;place-items:center;text-align:center;padding:24px;z-index:20}.end.on{display:grid}.end .o{width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:#282828;display:grid;place-items:center;font-size:34px}.end h2{margin:0 0 8px;font-size:24px}.end p{margin:0;color:#b3b3b3}
</style></head><body><main>
<header class="top"><span class="pill"><i class="dot"></i><span id="live">Live</span></span><h1 id="title">Jam</h1><p class="sub" id="sub"></p></header>
<div id="join"><div class="card join"><h2 id="jt">Join the Jam</h2><p id="js">Pick songs for the queue. Your name is shown to the host.</p>
<div class="nmrow"><span class="av" id="jav">?</span><input id="nm" type="text" maxlength="24" autocomplete="nickname" placeholder="Your name"></div><button class="btn" id="go">Join</button></div></div>
<div id="app" hidden>
<div class="card now" id="nowc"><div class="disc"><span class="eq" id="eq"><i></i><i></i><i></i></span></div><div class="tx"><small id="nl">Now playing</small><b id="nb">-</b><span class="a" id="na"></span></div></div>
<div class="sbar"><div class="sw"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><input id="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Search songs or artists"><button id="clr" hidden aria-label="Clear">×</button></div></div>
<div id="res"></div>
<h3 id="ql">Up next</h3><div id="queue"><div class="empty" id="qe">Nothing added yet.</div></div></div>
<div class="msg" id="msg"></div></main>
<div class="end" id="end"><div><div class="o">♪</div><h2 id="et">This Jam has ended</h2><p id="ep">Ask your friend for a new link.</p></div></div>
<script nonce="__NONCE__">
(function(){
var de=/^de/.test(navigator.language),T=de?{jt:'Der Jam beitreten',js:'Such Songs für die Warteschlange aus. Dein Name wird dem Gastgeber gezeigt.',nm:'Dein Name',go:'Beitreten',nl:'Läuft gerade',q:'Songs oder Künstler suchen',ql:'Als Nächstes',qe:'Noch nichts hinzugefügt.',added:'Hinzugefügt',wait:'Wartet auf Freigabe',full:'Die Jam ist voll',slow:'Bitte kurz warten',dup:'Läuft schon oder ist schon dran',lim:'Zu viele offene Wünsche',err:'Das hat nicht geklappt',by:'von ',you:'dir',pend:'wartet',rej:'abgelehnt',guests:'Gäste',guest:'Gast',jamof:'Jam von ',et:'Diese Jam ist beendet',ep:'Frag nach einem neuen Link.',none:'Keine Treffer',res:'Ergebnisse',live:'Live'}:{jt:'Join the Jam',js:'Pick songs for the queue. Your name is shown to the host.',nm:'Your name',go:'Join',nl:'Now playing',q:'Search songs or artists',ql:'Up next',qe:'Nothing added yet.',added:'Added',wait:'Waiting for approval',full:'This Jam is full',slow:'Please wait a moment',dup:'Already playing or queued',lim:'Too many open requests',err:'That did not work',by:'by ',you:'you',pend:'pending',rej:'declined',guests:'guests',guest:'guest',jamof:'Jam by ',et:'This Jam has ended',ep:'Ask your friend for a new link.',none:'No results',res:'Results',live:'Live'};
var $=function(i){return document.getElementById(i)},code=location.pathname.replace(/\/+$/,'').split('/').pop(),base='/Cinema/jam/'+encodeURIComponent(code),KEY='jam-'+code,g=null,timer=null,st=0;
$('jt').textContent=T.jt;$('js').textContent=T.js;$('nm').placeholder=T.nm;$('go').textContent=T.go;$('nl').textContent=T.nl;$('q').placeholder=T.q;$('ql').textContent=T.ql;$('qe').textContent=T.qe;$('et').textContent=T.et;$('ep').textContent=T.ep;$('live').textContent=T.live;
function hue(n){var x=0;for(var i=0;i<n.length;i++)x=(x*31+n.charCodeAt(i))%360;return 'hsl('+x+',52%,42%)'}
function say(m){var e=$('msg');e.textContent=m;e.className='msg on';clearTimeout(st);st=setTimeout(function(){e.className='msg'},2300)}
function over(){clearInterval(timer);$('end').className='end on'}
function api(p,o){o=o||{};o.headers=Object.assign({'X-Jam-Guest':g?g.guest:''},o.headers||{});return fetch(base+p,o)}
function load(){try{g=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){g=null}}
function show(){$('join').hidden=true;$('app').hidden=false;$('title').textContent=g.host?T.jamof+g.host:(g.title||'Jam');poll();timer=setInterval(poll,4000)}
var nmv='';try{nmv=localStorage.getItem('jam-name')||''}catch(e){}$('nm').value=nmv;
function av(){var v=$('nm').value.trim();$('jav').textContent=(v[0]||'?').toUpperCase();$('jav').style.background=v?hue(v):'#535353'}av();$('nm').addEventListener('input',av);
$('nm').addEventListener('keydown',function(e){if(e.key==='Enter')$('go').click()});
$('go').onclick=function(){var n=$('nm').value.trim();try{localStorage.setItem('jam-name',n)}catch(e){}$('go').disabled=true;
fetch(base+'/join?name='+encodeURIComponent(n),{method:'POST'}).then(function(r){if(r.status===423){say(T.full);throw 0}if(r.status===429){say(T.slow);throw 0}if(!r.ok){over();throw 0}return r.json()}).then(function(j){g=j;try{localStorage.setItem(KEY,JSON.stringify(j))}catch(e){}show()}).catch(function(){$('go').disabled=false})};
function row(art,n,a,right){var d=document.createElement('div');d.className='row';var i=document.createElement('div');i.className='art';i.textContent=art||'♪';var m=document.createElement('div');m.className='tx';var b=document.createElement('b'),s=document.createElement('span');s.className='s';b.textContent=n;s.textContent=a;m.appendChild(b);m.appendChild(s);d.appendChild(i);d.appendChild(m);if(right)d.appendChild(right);return d}
function poll(){api('/state').then(function(r){if(r.status===401){try{localStorage.removeItem(KEY)}catch(e){}clearInterval(timer);location.reload();throw 0}if(!r.ok){over();throw 0}return r.json()}).then(function(s){
$('sub').textContent=s.guests+' '+(s.guests===1?T.guest:T.guests);$('nb').textContent=s.now&&s.now.name?s.now.name:'-';$('na').textContent=s.now&&s.now.artist?s.now.artist:'';$('eq').className='eq'+(s.now&&s.now.playing?' on':'');
var q=$('queue');q.textContent='';if(!s.queue.length){var e=document.createElement('div');e.className='empty';e.textContent=T.qe;q.appendChild(e)}
s.queue.forEach(function(x){var t=null;if(x.status==='pending'||x.status==='rejected'){t=document.createElement('span');t.className='tag '+(x.status==='rejected'?'no':'');t.textContent=x.status==='pending'?T.pend:T.rej}
var d=row('',x.name,T.by+(x.mine?T.you:x.by)+' · '+x.artist,t);var w=document.createElement('span');w.className='who';w.style.background=hue(x.mine?(g.name||'?'):x.by);w.textContent=(x.mine?(g.name||'?'):x.by).charAt(0).toUpperCase();d.querySelector('.art').textContent='';d.querySelector('.art').appendChild(w);d.querySelector('.art').style.background='transparent';q.appendChild(d)})}).catch(function(){})}
var dq=0;$('q').addEventListener('input',function(){clearTimeout(dq);var v=$('q').value.trim();$('clr').hidden=!$('q').value;dq=setTimeout(function(){search(v)},380)});
$('clr').onclick=function(){$('q').value='';$('clr').hidden=true;$('res').textContent='';$('q').focus()};
function search(v){var res=$('res');if(v.length<2){res.textContent='';return}
api('/search?q='+encodeURIComponent(v)).then(function(r){if(r.status===429){say(T.slow);throw 0}if(!r.ok)throw 0;return r.json()}).then(function(list){res.textContent='';var h=document.createElement('h3');h.textContent=T.res;res.appendChild(h);if(!list.length){var e=document.createElement('div');e.className='empty';e.textContent=T.none;res.appendChild(e);return}list.forEach(function(it){var b=document.createElement('button');b.className='add';b.textContent='+';b.setAttribute('aria-label','Add');
b.onclick=function(){b.disabled=true;api('/add?id='+encodeURIComponent(it.id),{method:'POST'}).then(function(r){if(r.status===409){say(T.dup);b.disabled=false;return}if(r.status===429){say(T.slow);b.disabled=false;return}if(!r.ok){say(T.err);b.disabled=false;return}return r.json().then(function(j){b.className='add done';b.textContent='✓';if(navigator.vibrate)navigator.vibrate(12);say(j.status==='pending'?T.wait:T.added);poll()})}).catch(function(){b.disabled=false})};
res.appendChild(row('',it.name,it.artist+(it.album?' · '+it.album:''),b))})}).catch(function(){})}
load();if(g&&g.guest)show();
})();
</script></body></html>
""";
}
