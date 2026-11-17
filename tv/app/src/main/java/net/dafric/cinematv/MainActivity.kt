package net.dafric.cinematv

import android.app.Activity
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.webkit.*
import android.widget.FrameLayout
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/** Hosts the Cinema web interface (served by the Jellyfin plugin) in TV mode. Video playback is handed to the native player. */
class MainActivity : Activity() {
    private lateinit var store: Store
    private lateinit var web: WebView
    private lateinit var frame: FrameLayout
    private var returning = false; private var blanked = false; private var savedHash = "#/home"
    private val main = Handler(Looper.getMainLooper())
    private var lastHash = "#/home"            /* where the page is, reported by the page itself: restored after the renderer died */
    private val crashes = ArrayList<Long>()    /* renderer crash times, to avoid a restart loop */
    private val retry = Runnable { if (::web.isInitialized) web.loadUrl(startUrl()) }
    private fun startUrl() = store.url + "/web/index.html" + (if (lastHash.startsWith("#/") && lastHash != "#/login") lastHash else "#/home")

    inner class Bridge {
        @JavascriptInterface fun play(itemId: String, startTicks: Long) { runOnUiThread { returning = true; web.evaluateJavascript("location.hash") { h -> savedHash = h?.trim('"')?.takeIf { it.startsWith("#") } ?: "#/home"; web.postDelayed({ web.loadUrl("about:blank"); blanked = true }, 300) }; startActivity(Intent(this@MainActivity, PlayerActivity::class.java).putExtra("id", itemId).putExtra("ticks", startTicks)) } }
        @JavascriptInterface fun exit() { runOnUiThread { finish() } }
        @JavascriptInterface fun logout() { runOnUiThread { store.clearLogin(); web.clearCache(true); CookieManager.getInstance().removeAllCookies(null); WebStorage.getInstance().deleteAllData(); startActivity(Intent(this@MainActivity, LoginActivity::class.java)); finish() } }
        @JavascriptInterface fun version(): String = "1.4.0"
        @JavascriptInterface fun hash(h: String) { if (h.startsWith("#/") && h.length < 400) lastHash = h }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this)
        if (!store.loggedIn) { startActivity(Intent(this, LoginActivity::class.java)); finish(); return }
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        frame = FrameLayout(this).apply { setBackgroundColor(Color.parseColor("#111113")) }
        WebView.setWebContentsDebuggingEnabled((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0)
        setContentView(frame)
        lastHash = "#/home"; attachWeb(); web.loadUrl(store.url + "/web/index.html#/home")
    }

    private fun buildWeb(): WebView = WebView(this).apply {
        setBackgroundColor(Color.parseColor("#111113"))
        settings.javaScriptEnabled = true; settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.allowFileAccess = false; settings.allowContentAccess = false
        settings.userAgentString = settings.userAgentString + " CinemaTV/1.4"
        settings.useWideViewPort = true; settings.loadWithOverviewMode = true
        isFocusable = true; isFocusableInTouchMode = true
        addJavascriptInterface(Bridge(), "CinemaTV")
        webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(m: ConsoleMessage): Boolean { Log.d("CinemaWeb", "${m.messageLevel()} ${m.message()} (${m.sourceId()}:${m.lineNumber()})"); return true }
        }
        webViewClient = object : WebViewClient() {
            override fun onReceivedError(v: WebView, req: WebResourceRequest, err: WebResourceError) { if (req.isForMainFrame) { Log.w("CinemaWeb", "main frame error ${err.description}"); showOffline() } }
            override fun onReceivedHttpError(v: WebView, req: WebResourceRequest, r: WebResourceResponse) { if (req.isForMainFrame && r.statusCode >= 500) showOffline() }
            override fun shouldOverrideUrlLoading(v: WebView, req: WebResourceRequest): Boolean { val u = req.url.toString(); return !(u.startsWith(store.url) || u.startsWith("about:") || u.startsWith("data:")) }
            /* the renderer was killed (memory pressure): build a new WebView and go back to the same page instead of crashing the app */
            override fun onRenderProcessGone(v: WebView, d: RenderProcessGoneDetail): Boolean { Log.w("CinemaWeb", "renderer gone, crash=${d.didCrash()}"); recoverWeb(); return true }
        }
    }

    private fun attachWeb() { web = buildWeb(); frame.addView(web, FrameLayout.LayoutParams(-1, -1)); injectLogin(); web.requestFocus() }

    private fun recoverWeb() {
        val now = System.currentTimeMillis(); crashes.removeAll { now - it > 120_000 }; crashes.add(now)
        runCatching { frame.removeView(web); web.destroy() }
        if (crashes.size > 4) { Toast.makeText(this, "Cinema: WebView instabil, bitte App neu starten", Toast.LENGTH_LONG).show(); finish(); return }
        attachWeb(); web.loadUrl(startUrl())
    }

    /** Server not reachable: a small page instead of the browser error, and a new try every few seconds. */
    private fun showOffline() {
        main.removeCallbacks(retry)
        val html = "<html><body style='margin:0;background:#111113;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'><div><div style='font-size:42px;font-weight:800;margin-bottom:12px'>Server nicht erreichbar</div><div style='font-size:22px;color:#9a9aa2'>Neuer Versuch in wenigen Sekunden …</div></div></body></html>"
        web.loadDataWithBaseURL(null, html, "text/html", "utf-8", null); main.postDelayed(retry, 5000)
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (::web.isInitialized && level >= android.content.ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW) { web.evaluateJavascript("window.cxTvTrim&&window.cxTvTrim()", null); if (level >= android.content.ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL) web.clearCache(false) }
    }

    /** Runs before the web client boots: puts the saved login into its storage so no sign-in screen shows up. */
    private fun injectLogin() {
        val q = { s: String -> JSONObject.quote(s) }
        val script = """(function(){try{
 var tok=${q(store.token)};var cur=null;try{cur=JSON.parse(localStorage.getItem('jellyfin_credentials'))}catch(e){}
 if(!(cur&&cur.Servers&&cur.Servers[0]&&cur.Servers[0].AccessToken===tok&&cur.Servers[0].ManualAddress===${q(store.url)})){
  localStorage.setItem('jellyfin_credentials',JSON.stringify({Servers:[{ManualAddress:${q(store.url)},manualAddressOnly:true,Id:${q(store.serverId)},Name:${q(store.serverName)},LastConnectionMode:2,DateLastAccessed:Date.now(),UserId:${q(store.userId)},AccessToken:tok}]}));
 }
 localStorage.setItem('cx-tv','1');localStorage.setItem('_deviceId2',${q(store.deviceId)});
}catch(e){}})();
(function(){var rep=function(){try{CinemaTV.hash(location.hash)}catch(e){}};window.addEventListener('hashchange',rep);document.addEventListener('DOMContentLoaded',rep);})();
(function(){var W='width=1280';var fix=function(){var m=document.querySelector('meta[name=viewport]');if(m){if(m.content!==W)m.content=W;}else if(document.head){m=document.createElement('meta');m.name='viewport';m.content=W;document.head.appendChild(m);}};fix();var mo=new MutationObserver(fix);mo.observe(document,{childList:true,subtree:true});setTimeout(function(){mo.disconnect();fix();},6000);})();"""
        val origin = store.url.substringBefore("/", "").let { _ -> Regex("^(https?://[^/]+)").find(store.url)?.value ?: store.url }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) WebViewCompat.addDocumentStartJavaScript(web, script, setOf(origin))
        else Log.w("CinemaWeb", "document start script not supported")
    }

    override fun onResume() {
        super.onResume()
        if (::web.isInitialized) { web.onResume(); web.resumeTimers(); if (blanked) { blanked = false; web.loadUrl(store.url + "/web/index.html" + savedHash) } }
        if (returning) { returning = false; web.evaluateJavascript("window.cxTvResume&&window.cxTvResume()", null) }
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    }

    @Deprecated("TV back handling")
    override fun onBackPressed() {
        web.evaluateJavascript("(window.cxTvBack?window.cxTvBack():false)") { r -> if (r != "true") finish() }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        val media = when (keyCode) { KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "playpause"; KeyEvent.KEYCODE_MEDIA_PLAY -> "play"; KeyEvent.KEYCODE_MEDIA_PAUSE -> "pause"; KeyEvent.KEYCODE_MEDIA_NEXT -> "next"; KeyEvent.KEYCODE_MEDIA_PREVIOUS -> "prev"; else -> null }
        if (media != null) { web.evaluateJavascript("window.cxTvMedia&&window.cxTvMedia('$media')", null); return true }
        if (keyCode == KeyEvent.KEYCODE_MENU) { web.evaluateJavascript("window.cxTvMenu&&window.cxTvMenu()", null); return true }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() { main.removeCallbacksAndMessages(null); if (::web.isInitialized) web.destroy(); super.onDestroy() }
}
