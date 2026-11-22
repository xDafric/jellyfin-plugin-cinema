namespace Jellyfin.Plugin.Cinema.Api;

/// <summary>The guest page of a Watch Party: one self-contained page (no libraries, no external requests), German or English by browser language.</summary>
internal static class PartyPage
{
    public static string Html(string nonce, bool open) => (open ? Page : Gone).Replace("__NONCE__", nonce, System.StringComparison.Ordinal);

    private const string Gone = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#0b0b0d"><title>Watch Party</title>
<style nonce="__NONCE__">body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0d;color:#fff;font:16px system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;padding:24px}.o{width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:#1c1c20;display:grid;place-items:center;font-size:36px}h1{margin:0 0 8px}p{color:#9b9ba6;margin:0}</style>
<body><div><div class="o">🍿</div><h1 id="t">This Watch Party has ended</h1><p id="p">The link is no longer valid. Ask your friend for a new one.</p></div>
<script nonce="__NONCE__">if(/^de/.test(navigator.language)){document.getElementById('t').textContent='Diese Watch Party ist beendet';document.getElementById('p').textContent='Der Link ist nicht mehr gültig. Frag deine Freundin oder deinen Freund nach einem neuen.'}</script></body></html>
""";

    private const string Page = """
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><meta name="theme-color" content="#0b0b0d"><title>Watch Party</title>
<style nonce="__NONCE__">
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:#0b0b0d;color:#fff;font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-tap-highlight-color:transparent;min-height:100vh}
button,input,select{font:inherit;color:inherit}.hide{display:none!important}
.join{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(60% 50% at 20% 10%,rgba(229,9,20,.28),transparent 70%),radial-gradient(50% 50% at 90% 95%,rgba(99,76,255,.22),transparent 70%),#0b0b0d}
.jc{width:100%;max-width:400px;background:rgba(22,22,26,.8);border:1px solid rgba(255,255,255,.09);border-radius:26px;padding:32px 28px;box-shadow:0 30px 80px rgba(0,0,0,.5);text-align:center}
.pop{font-size:44px;margin-bottom:8px}.jc h1{margin:0 0 6px;font-size:26px;letter-spacing:-.02em}.jc p{margin:0 0 20px;color:#9b9ba6}
.jc input{width:100%;height:50px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);padding:0 16px;font-size:16px;outline:0;text-align:center}.jc input:focus{border-color:rgba(255,255,255,.7)}
.go{width:100%;height:50px;margin-top:14px;border:0;border-radius:999px;background:#e50914;color:#fff;font-weight:800;font-size:16px;cursor:pointer;box-shadow:0 10px 28px rgba(229,9,20,.35)}.go:active{transform:scale(.98)}
.err{color:#ff8d8d;margin-top:12px;min-height:20px;font-size:14px}
.app{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:0;min-height:100vh}
.stage{min-width:0;display:flex;flex-direction:column}
.bar{display:flex;align-items:center;gap:12px;padding:max(12px,env(safe-area-inset-top)) 16px 10px}.live{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#ff5a63}
.dot{width:8px;height:8px;border-radius:50%;background:#e50914;animation:p 1.8s infinite}@keyframes p{70%{box-shadow:0 0 0 8px rgba(229,9,20,0)}100%{box-shadow:0 0 0 0 rgba(229,9,20,0)}}
.ttl{min-width:0;flex:1}.ttl b{display:block;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttl span{font-size:12.5px;color:#9b9ba6}
.vw{position:relative;background:#000;aspect-ratio:16/9;width:100%;max-height:calc(100vh - 150px);overflow:hidden;user-select:none}
.vw video{width:100%;height:100%;display:block;background:#000;object-fit:contain}
.vw.fs{max-height:none;height:100vh;aspect-ratio:auto}
.tap{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);cursor:pointer;z-index:3}.tap span{padding:14px 26px;border-radius:999px;background:#e50914;font-weight:800}
.wait{position:absolute;inset:0;display:grid;place-items:center;color:#9b9ba6;z-index:2;pointer-events:none;text-align:center;padding:20px}
.ctl{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:26px 14px 10px;background:linear-gradient(transparent,rgba(0,0,0,.8));z-index:4;transition:opacity .25s}.vw.idle .ctl{opacity:0}
.ib{width:38px;height:38px;border:0;border-radius:50%;background:none;display:grid;place-items:center;cursor:pointer;flex:none}.ib:hover{background:rgba(255,255,255,.14)}.ib:disabled{opacity:.4;cursor:default}.ib svg{width:22px;height:22px;fill:#fff}
.tm{font-size:12.5px;color:#d0d0d6;min-width:84px;text-align:center;font-variant-numeric:tabular-nums}
input[type=range]{-webkit-appearance:none;appearance:none;height:4px;border-radius:4px;background:rgba(255,255,255,.3);outline:0;margin:0;flex:1;min-width:40px}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff}input[type=range]::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:50%;background:#fff}input[type=range]:disabled{opacity:.7}
.vol{flex:none;width:70px}
.fl{position:absolute;bottom:60px;font-size:34px;pointer-events:none;z-index:5;animation:fl 2.6s ease-out forwards;text-shadow:0 2px 8px rgba(0,0,0,.5);text-align:center}.fl small{display:block;font-size:11px;color:#fff;opacity:.85}@keyframes fl{0%{transform:translateY(0) scale(.6);opacity:0}12%{opacity:1;transform:translateY(-20px) scale(1.1)}100%{transform:translateY(-240px) scale(1);opacity:0}}
.menu{position:absolute;right:12px;bottom:58px;background:#1c1c20;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:6px;min-width:170px;max-height:50%;overflow:auto;z-index:6;box-shadow:0 14px 40px rgba(0,0,0,.6)}.menu button{display:block;width:100%;text-align:left;border:0;background:none;padding:9px 12px;border-radius:8px;cursor:pointer;font-size:14px}.menu button:hover{background:rgba(255,255,255,.1)}.menu button.on{color:#ff5a63;font-weight:700}
.under{padding:12px 16px 24px}.rx{display:flex;gap:8px;flex-wrap:wrap}.rx button{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-size:22px;cursor:pointer;transition:transform .12s,background .15s}.rx button:hover{background:rgba(255,255,255,.14)}.rx button:active{transform:scale(.88)}
.mem{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 0}.chip{display:inline-flex;align-items:center;gap:7px;padding:3px 12px 3px 3px;border-radius:999px;background:rgba(255,255,255,.08);font-size:13px;font-weight:600}.av{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:800}
.note{margin-top:12px;font-size:13px;color:#9b9ba6}
.side{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.08);background:#101013;min-height:0;height:100vh;position:sticky;top:0}
.side h2{margin:0;padding:max(14px,env(safe-area-inset-top)) 16px 10px;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#9b9ba6}
.log{flex:1;overflow:auto;padding:4px 16px;display:flex;flex-direction:column;gap:8px;min-height:120px}.m{display:flex;gap:9px;align-items:flex-start}.m .av{flex:none;margin-top:2px}.m div{min-width:0}.m b{font-size:13px}.m p{margin:0;word-wrap:break-word;overflow-wrap:anywhere}.sys{font-size:12.5px;color:#7d7d88;text-align:center}
.say{display:flex;gap:8px;padding:10px 12px max(12px,env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,.08)}.say input{flex:1;min-width:0;height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);padding:0 16px;outline:0;font-size:15px}.say input:focus{border-color:rgba(255,255,255,.6)}.say button{width:44px;height:44px;border:0;border-radius:50%;background:#e50914;cursor:pointer;display:grid;place-items:center}.say svg{width:20px;height:20px;fill:#fff}
@media (max-width:900px){.app{grid-template-columns:1fr}.side{height:auto;position:static;border-left:0;border-top:1px solid rgba(255,255,255,.08)}.log{max-height:300px}.vw{max-height:none}.vol{display:none}}
</style></head><body>
<div id="J" class="join"><div class="jc"><div class="pop">🍿</div><h1 id="jt">Watch together</h1><p id="jp">Pick a name, then you watch in sync with your friends.</p><input id="nm" type="text" maxlength="24" autocomplete="nickname"><button class="go" id="go">Join</button><div class="err" id="er"></div></div></div>
<div id="A" class="app hide"><div class="stage"><div class="bar"><span class="live"><i class="dot"></i><span id="lv">Live</span></span><div class="ttl"><b id="tt"></b><span id="ts"></span></div></div>
<div class="vw" id="vw"><video id="v" playsinline preload="auto"></video><div class="wait" id="wt"></div><div class="tap hide" id="tp"><span id="tpt">Tap to play</span></div>
<div class="ctl" id="cb"><button class="ib" id="pp" aria-label="Play"><svg viewBox="0 0 24 24"><path id="ppi" d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z"/></svg></button><input type="range" id="sk" min="0" max="1000" value="0" aria-label="Seek"><span class="tm" id="tm">0:00 / 0:00</span><input class="vol" type="range" id="vo" min="0" max="100" value="100" aria-label="Volume"><button class="ib hide" id="cc" aria-label="Subtitles"><svg viewBox="0 0 24 24"><path d="M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zm1.5 4.5v5h2.6v-1.3H8v-2.4h1.1V9.5H6.5zm6 0v5h2.6v-1.3H14v-2.4h1.1V9.5h-2.6z"/></svg></button><button class="ib" id="fs" aria-label="Fullscreen"><svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v4h-4v2h6v-6z" transform="translate(0 0)"/></svg></button></div>
<div class="menu hide" id="mn"></div></div>
<div class="under"><div class="rx" id="rx"></div><div class="mem" id="mem"></div><div class="note" id="nt"></div></div></div>
<div class="side"><h2 id="ch">Chat</h2><div class="log" id="lg"></div><form class="say" id="sf"><input id="si" type="text" maxlength="200" autocomplete="off"><button aria-label="Send"><svg viewBox="0 0 24 24"><path d="M3 20l18-8L3 4v6l12 2-12 2v6z"/></svg></button></form></div></div>
<script nonce="__NONCE__">
(function(){
var de=/^de/.test(navigator.language),T={watch:de?'Gemeinsam schauen':'Watch together',pick:de?'Wähle einen Namen, dann schaust du synchron mit deinen Freunden.':'Pick a name, then you watch in sync with your friends.',join:de?'Beitreten':'Join',name:de?'Dein Name':'Your name',full:de?'Diese Party ist voll.':'This party is full.',gone:de?'Diese Watch Party ist beendet.':'This Watch Party has ended.',kicked:de?'Du wurdest aus der Party entfernt.':'You were removed from the party.',tap:de?'Zum Abspielen tippen':'Tap to play',wait:de?'Warte auf den Start …':'Waiting for the start …',only:de?'Nur der Gastgeber steuert Play, Pause und Spulen.':'Only the host controls play, pause and seeking.',ctl:de?'Du darfst pausieren und spulen, alle sehen es.':'You can pause and seek, everyone sees it.',chat:de?'Chat':'Chat',say:de?'Nachricht …':'Message …',joined:de?'ist beigetreten':'joined',off:de?'Aus':'Off',subs:de?'Untertitel':'Subtitles',fail:de?'Dieses Video kann dein Browser nicht abspielen (Format). Schau über die Jellyfin-App oder frag nach einer anderen Version.':'Your browser cannot play this video (format).',net:de?'Verbindung weg, versuche es erneut …':'Connection lost, retrying …',live:de?'Live':'Live',host:de?'Gastgeber':'Host',you:de?'Du':'You',ep:de?'Folge':'Episode'};
function $(i){return document.getElementById(i)}
var base=location.pathname.replace(/\/+$/,''),G={secret:'',rev:0,ev:0,you:null,ctl:false,item:'',playing:false,pos:0,at:0,quiet:0,subs:[],sub:-1,alive:true,first:true},v=$('v'),vw=$('vw');
$('jt').textContent=T.watch;$('jp').textContent=T.pick;$('go').textContent=T.join;$('nm').placeholder=T.name;$('lv').textContent=T.live;$('ch').textContent=T.chat;$('si').placeholder=T.say;$('tpt').textContent=T.tap;
try{$('nm').value=localStorage.getItem('cx-pn')||''}catch(e){}
var ICON={play:'M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z',pause:'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z'};
function hue(n){var x=0;for(var i=0;i<n.length;i++)x=(x*31+n.charCodeAt(i))%360;return x}
function av(n,host){var s=document.createElement('span');s.className='av';s.style.background=host?'#e50914':'hsl('+hue(n)+',52%,42%)';s.textContent=(n.trim()[0]||'?').toUpperCase();return s}
function fmt(s){s=Math.max(0,Math.floor(s||0));var h=Math.floor(s/3600),m=Math.floor(s%3600/60),c=s%60;return(h?h+':'+(m<10?'0':''):'')+m+':'+(c<10?'0':'')+c}
function hdr(){return{'X-Party-Guest':G.secret}}
function post(path){return fetch(base+path,{method:'POST',headers:hdr()}).catch(function(){})}
function ended(msg){G.alive=false;try{sessionStorage.removeItem('cx-pg-'+base)}catch(e){}v.pause();$('A').classList.add('hide');$('J').classList.remove('hide');$('jt').textContent='🍿';$('jp').textContent=msg;$('nm').classList.add('hide');$('go').classList.add('hide')}
function doJoin(){var n=$('nm').value.trim();try{localStorage.setItem('cx-pn',n)}catch(e){}
 $('go').disabled=true;fetch(base+'/join?name='+encodeURIComponent(n),{method:'POST'}).then(function(r){
  if(r.status===423){$('er').textContent=T.full;$('go').disabled=false;return}
  if(r.status===404){ended(T.gone);return}
  if(!r.ok){$('er').textContent='?';$('go').disabled=false;return}
  return r.json().then(function(j){G.secret=j.guest;try{sessionStorage.setItem('cx-pg-'+base,j.guest)}catch(e){}start()})}).catch(function(){$('er').textContent=T.net;$('go').disabled=false})}
function start(){$('J').classList.add('hide');$('A').classList.remove('hide');$('wt').textContent=T.wait;v.volume=1;loop();setInterval(tick,1000);setInterval(idle,1000)}
$('go').onclick=doJoin;$('nm').onkeydown=function(e){if(e.key==='Enter')doJoin()};
var saved='';try{saved=sessionStorage.getItem('cx-pg-'+base)||''}catch(e){}
if(saved){G.secret=saved;fetch(base+'/sync?rev=-1&ev=0',{headers:hdr()}).then(function(r){if(r.ok)start();else{G.secret=''}}).catch(function(){G.secret=''})}
/* ---- the sync loop: the server holds the request until something changes */
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function loop(){while(G.alive){try{var r=await fetch(base+'/sync?rev='+G.rev+'&ev='+G.ev,{headers:hdr()});
 if(r.status===404){ended(T.gone);return}if(r.status===401){ended(T.kicked);return}if(r.status===429){await sleep(3000);continue}
 if(!r.ok){await sleep(2500);continue}var s=await r.json();handle(s)}catch(e){await sleep(2500)}}}
function handle(s){var first=G.first;G.first=false;G.rev=s.rev;G.you=s.you;G.ctl=!!(s.you.host||s.control);
 if(s.item.id!==G.item){G.item=s.item.id;G.sub=-1;[].forEach.call(v.querySelectorAll('track'),function(t){t.remove()});v.src=base+'/video?g='+encodeURIComponent(G.secret);v.load();$('wt').classList.remove('hide')}
 $('tt').textContent=s.item.name||'';$('ts').textContent=(s.item.series?s.item.series+' · ':'')+(s.item.year?s.item.year+' · ':'')+T.host+': '+(s.host||'');document.title=(s.item.name||'Watch Party');
 G.subs=s.subs||[];$('cc').classList.toggle('hide',!G.subs.length);
 $('sk').disabled=!G.ctl;$('pp').disabled=!G.ctl;$('nt').textContent=s.you.host?'':(G.ctl?T.ctl:T.only);
 var m=$('mem');m.replaceChildren();s.members.forEach(function(x){var c=document.createElement('span');c.className='chip';c.append(av(x.name,x.host),document.createTextNode(x.name+(x.id===s.you.id?' ('+T.you+')':'')));m.append(c)});
 var lg=$('lg'),stick=lg.scrollTop+lg.clientHeight>=lg.scrollHeight-40;
 s.msgs.forEach(function(x){if(x.n<=G.ev)return;G.ev=x.n;if(x.kind==='react'){fly(x.text,x.who);return}if(x.kind==='join'){var d=document.createElement('div');d.className='sys';d.textContent=x.who+' '+T.joined;lg.append(d);return}
  var row=document.createElement('div');row.className='m';var bx=document.createElement('div'),b=document.createElement('b'),p=document.createElement('p');b.textContent=x.who;p.textContent=x.text;bx.append(b,p);row.append(av(x.who,false),bx);lg.append(row)});
 if(stick)lg.scrollTop=lg.scrollHeight;
 G.playing=s.playing;G.pos=s.pos;G.at=performance.now();
 if(first||s.by!==s.you.id)applyNow(first)}
function expected(){return G.playing?G.pos+(performance.now()-G.at)/1000:G.pos}
function quiet(){G.quiet=Date.now()+900}
function applyNow(force){if(!G.item)return;var e=expected(),d=e-v.currentTime;quiet();
 if(Math.abs(d)>(force?0.4:1.0)){try{v.currentTime=e}catch(x){}}
 if(G.playing&&v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){$('tp').classList.remove('hide')})}
 if(!G.playing&&!v.paused)v.pause();upd()}
function tick(){if(!G.playing||v.paused||v.seeking)return;var d=expected()-v.currentTime;
 if(Math.abs(d)>1.5){quiet();v.currentTime=expected();v.playbackRate=1}else if(Math.abs(d)>0.25)v.playbackRate=d>0?1.06:0.94;else v.playbackRate=1}
/* ---- local actions (only when allowed) */
function send(cmd){if(!G.ctl)return;post('/ctl?cmd='+cmd+'&pos='+(v.currentTime||0).toFixed(2))}
v.addEventListener('play',function(){upd();if(Date.now()>G.quiet)send('play')});
v.addEventListener('pause',function(){upd();if(Date.now()>G.quiet&&!v.ended)send('pause')});
v.addEventListener('seeked',function(){if(Date.now()>G.quiet)send('seek')});
v.addEventListener('timeupdate',upd);v.addEventListener('loadedmetadata',function(){$('wt').classList.add('hide');upd();applyNow(true)});v.addEventListener('canplay',function(){$('wt').classList.add('hide')});
v.addEventListener('error',function(){$('wt').classList.remove('hide');$('wt').textContent=T.fail});
function upd(){$('ppi').setAttribute('d',v.paused?ICON.play:ICON.pause);var d=v.duration||0;$('tm').textContent=fmt(v.currentTime)+' / '+fmt(d);if(!G.drag&&d)$('sk').value=Math.round(v.currentTime/d*1000)}
$('pp').onclick=function(){if(!G.ctl)return;if(v.paused)v.play();else v.pause()};
vw.addEventListener('click',function(e){if(e.target===v&&G.ctl){if(v.paused)v.play();else v.pause()}$('mn').classList.add('hide')});
$('sk').oninput=function(){G.drag=true};$('sk').onchange=function(){G.drag=false;if(!G.ctl||!v.duration)return;v.currentTime=this.value/1000*v.duration};
$('vo').oninput=function(){v.volume=this.value/100};
$('tp').onclick=function(){$('tp').classList.add('hide');v.play().catch(function(){})};
$('fs').onclick=function(){var d=document;if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d)}else{(vw.requestFullscreen||vw.webkitRequestFullscreen||function(){v.webkitEnterFullscreen&&v.webkitEnterFullscreen()}).call(vw)}};
document.addEventListener('fullscreenchange',function(){vw.classList.toggle('fs',!!document.fullscreenElement)});
var lastMove=Date.now();function idle(){vw.classList.toggle('idle',!v.paused&&Date.now()-lastMove>3500&&$('mn').classList.contains('hide'))}
['mousemove','touchstart','keydown'].forEach(function(e){vw.addEventListener(e,function(){lastMove=Date.now();vw.classList.remove('idle')},{passive:true})});
/* ---- subtitles: one choice per viewer */
$('cc').onclick=function(e){e.stopPropagation();var m=$('mn');if(!m.classList.contains('hide')){m.classList.add('hide');return}m.replaceChildren();
 function opt(label,i){var b=document.createElement('button');b.textContent=label;if(G.sub===i)b.className='on';b.onclick=function(){setSub(i);m.classList.add('hide')};m.append(b)}
 opt(T.off,-1);G.subs.forEach(function(s){opt(s.title||s.lang||('#'+s.i),s.i)});m.classList.remove('hide')};
function setSub(i){G.sub=i;[].forEach.call(v.querySelectorAll('track'),function(t){t.remove()});if(i<0)return;var t=document.createElement('track');t.kind='subtitles';t.src=base+'/sub/'+i+'?g='+encodeURIComponent(G.secret);t.default=true;v.append(t);
 setTimeout(function(){for(var k=0;k<v.textTracks.length;k++)v.textTracks[k].mode='showing'},300)}
/* ---- reactions and chat */
var EM=['❤️','😂','😮','👏','🔥','😢','👍','🍿'];EM.forEach(function(e){var b=document.createElement('button');b.textContent=e;b.setAttribute('aria-label',e);b.onclick=function(){post('/say?emoji='+encodeURIComponent(e));fly(e,'')};$('rx').append(b)});
function fly(e,who){var f=document.createElement('div');f.className='fl';f.style.left=(8+Math.random()*80)+'%';f.textContent=e;if(who){var s=document.createElement('small');s.textContent=who;f.append(s)}vw.append(f);setTimeout(function(){f.remove()},2700)}
$('sf').onsubmit=function(e){e.preventDefault();var t=$('si').value.trim();if(!t)return;$('si').value='';post('/say?text='+encodeURIComponent(t))};
})();
</script></body></html>
""";
}
