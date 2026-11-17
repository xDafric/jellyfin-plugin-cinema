package net.dafric.cinematv

import android.app.Activity
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import android.util.Log
import android.view.KeyEvent
import android.webkit.*
import android.widget.FrameLayout
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/**
 * Hosts the Cinema web interface (served by the Jellyfin plugin): TV mode (remote, 1280 px layout) or phone/tablet mode
 * (touch, responsive layout, no TV flag). Video playback is handed to the native player.
 */
class MainActivity : Activity() {
    private lateinit var store: Store
    private lateinit var web: WebView
    private lateinit var frame: FrameLayout
    private val tv by lazy { UiMode.isTv(this) }
    private var returning = false; private var blanked = false; private var savedHash = "#/home"
    private val main = Handler(Looper.getMainLooper())
    private var lastHash = "#/home"            /* where the page is, reported by the page itself: restored after the renderer died */
    private val crashes = ArrayList<Long>()    /* renderer crash times, to avoid a restart loop */
    private val retry = Runnable { if (::web.isInitialized) web.loadUrl(startUrl()) }
    private fun startUrl() = store.url + "/web/index.html" + (if (lastHash.startsWith("#/") && lastHash != "#/login") lastHash else "#/home")

    /** `window.CinemaNative` in both modes (`window.CinemaTV` as well on the TV, which switches the page to TV mode). */
    inner class Bridge {
        @JavascriptInterface fun play(itemId: String, startTicks: Long) {
            runOnUiThread {
                returning = true
                val go = { startActivity(Intent(this@MainActivity, PlayerActivity::class.java).putExtra("id", itemId).putExtra("ticks", startTicks)) }
                if (tv) web.evaluateJavascript("location.hash") { h -> savedHash = h?.trim('"')?.takeIf { it.startsWith("#") } ?: "#/home"; web.postDelayed({ web.loadUrl("about:blank"); blanked = true }, 300); go() } else go()
            }
        }
        @JavascriptInterface fun exit() { runOnUiThread { finish() } }
        @JavascriptInterface fun logout() { runOnUiThread { store.clearLogin(); web.clearCache(true); CookieManager.getInstance().removeAllCookies(null); WebStorage.getInstance().deleteAllData(); startActivity(Intent(this@MainActivity, LoginActivity::class.java)); finish() } }
        @JavascriptInterface fun version(): String = Updater.installed(this@MainActivity)
        @JavascriptInterface fun hash(h: String) { if (h.startsWith("#/") && h.length < 400) lastHash = h }

        /* ---- shared native contract (PLATFORM.md) ---- */
        @JavascriptInterface fun capabilities(): String = JSONObject().put("platform", "android").put("mode", if (tv) "tv" else "phone").put("apiLevel", 1).put("version", Updater.installed(this@MainActivity))
            .put("downloads", !tv).put("pip", !tv).put("media", !tv).toString()
        @JavascriptInterface fun openExternal(url: String) { if (url.startsWith("https://") || url.startsWith("http://")) runOnUiThread { runCatching { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } } }
        @JavascriptInterface fun checkUpdate() { runOnUiThread { Updater.checkAndAsk(this@MainActivity, force = true) } }

        /* ---- downloads (phone/tablet) ---- */
        @JavascriptInterface fun download(itemId: String): String {
            if (tv) return "unsupported"
            Thread {
                val r = runCatching { Downloads.add(applicationContext, itemId) }.getOrDefault("error")
                main.post { if (::web.isInitialized) web.evaluateJavascript("window.cxDlResult&&window.cxDlResult(${JSONObject.quote(itemId)},${JSONObject.quote(r)})", null) }
            }.start()
            return "queued"
        }
        @JavascriptInterface fun downloads(): String = if (tv) "[]" else Downloads.listJson(applicationContext)
        @JavascriptInterface fun downloadPoster(itemId: String): String = Downloads.poster(applicationContext, itemId)
        @JavascriptInterface fun removeDownload(itemId: String) { if (!tv) Downloads.remove(applicationContext, itemId) }
        @JavascriptInterface fun pauseDownload(itemId: String) { if (!tv) Downloads.pause(applicationContext, itemId) }
        @JavascriptInterface fun resumeDownload(itemId: String) { if (!tv) Downloads.resume(applicationContext, itemId) }
        @JavascriptInterface fun downloadWifiOnly(): Boolean = Downloads.wifiOnly(applicationContext)
        @JavascriptInterface fun setDownloadWifiOnly(on: Boolean) { Downloads.setWifiOnly(applicationContext, on) }
        @JavascriptInterface fun downloadBytes(): Long = Downloads.usedBytes(applicationContext)

        /* ---- now playing: music runs in the page, the service shows the notification and lock-screen controls ---- */
        @JavascriptInterface fun media(json: String) { if (!tv) WebMedia.report(applicationContext, json) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this)
        if (!store.loggedIn) { startActivity(Intent(this, LoginActivity::class.java)); finish(); return }
        frame = FrameLayout(this).apply { setBackgroundColor(Color.parseColor("#111113")) }
        UiMode.apply(this, frame)
        WebView.setWebContentsDebuggingEnabled((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0)
        setContentView(frame)
        lastHash = "#/home"; attachWeb(); web.loadUrl(store.url + "/web/index.html#/home")
        if (!tv) {
            if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 7)
            Downloads.resumePending(this); Updater.checkAndAsk(this)
            WebMedia.player().onCommand = { c -> main.post { if (::web.isInitialized) web.evaluateJavascript("window.cxNativeMedia&&window.cxNativeMedia(" + JSONObject.quote(c) + ")", null) } }
        }
    }

    private fun buildWeb(): WebView = WebView(this).apply {
        setBackgroundColor(Color.parseColor("#111113"))
        settings.javaScriptEnabled = true; settings.domStorageEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.allowFileAccess = false; settings.allowContentAccess = false
        settings.userAgentString = settings.userAgentString + (if (tv) " CinemaTV/2.0" else " CinemaApp/2.0")
        settings.useWideViewPort = true; settings.loadWithOverviewMode = tv
        isFocusable = true; isFocusableInTouchMode = true
        Bridge().also { addJavascriptInterface(it, "CinemaNative"); if (tv) addJavascriptInterface(it, "CinemaTV") }
        webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(m: ConsoleMessage): Boolean { Log.d("CinemaWeb", "${m.messageLevel()} ${m.message()} (${m.sourceId()}:${m.lineNumber()})"); return true }
        }
        webViewClient = object : WebViewClient() {
            override fun onReceivedError(v: WebView, req: WebResourceRequest, err: WebResourceError) { if (req.isForMainFrame) { Log.w("CinemaWeb", "main frame error ${err.description}"); showOffline() } }
            override fun onReceivedHttpError(v: WebView, req: WebResourceRequest, r: WebResourceResponse) { if (req.isForMainFrame && r.statusCode >= 500) showOffline() }
            override fun shouldOverrideUrlLoading(v: WebView, req: WebResourceRequest): Boolean {
                val u = req.url.toString()
                if (u.startsWith("cinema://play/")) { startActivity(Intent(this@MainActivity, PlayerActivity::class.java).putExtra("id", u.removePrefix("cinema://play/")).putExtra("ticks", 0L)); return true }
                if (u == "cinema://retry") { main.post(retry); return true }
                return !(u.startsWith(store.url) || u.startsWith("about:") || u.startsWith("data:"))
            }
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
        val html = if (tv) "<html><body style='margin:0;background:#111113;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center'><div><div style='font-size:42px;font-weight:800;margin-bottom:12px'>Server nicht erreichbar</div><div style='font-size:22px;color:#9a9aa2'>Neuer Versuch in wenigen Sekunden …</div></div></body></html>" else offlinePage()
        web.loadDataWithBaseURL(null, html, "text/html", "utf-8", null); main.postDelayed(retry, if (tv) 5000 else 8000)
    }

    /** Phone/tablet: finished downloads can still be played while the server is out of reach. */
    private fun offlinePage(): String {
        fun esc(t: String) = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("'", "&#39;")
        val done = runCatching { Downloads.list(this).filter { it.optString("state") == "done" } }.getOrDefault(emptyList())
        val rows = done.joinToString("") { d -> "<a href='cinema://play/${esc(d.optString("id"))}' style='display:block;padding:14px 16px;margin:8px 0;background:#202026;border-radius:12px;color:#fff;text-decoration:none'><b>${esc(d.optString("title"))}</b><br><span style='color:#9a9aa2;font-size:14px'>${esc(d.optString("subtitle"))}</span></a>" }
        return "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'></head><body style='margin:0;padding:28px 20px;background:#111113;color:#fff;font-family:sans-serif'>" +
            "<div style='font-size:26px;font-weight:800;margin-bottom:8px'>Server nicht erreichbar</div><div style='color:#9a9aa2;margin-bottom:18px'>Neuer Versuch in wenigen Sekunden … <a href='cinema://retry' style='color:#fff'>Jetzt versuchen</a></div>" +
            (if (rows.isNotEmpty()) "<div style='font-weight:700;margin:22px 0 4px'>Heruntergeladen</div>$rows" else "") + "</body></html>"
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (::web.isInitialized && level >= android.content.ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW) { web.evaluateJavascript("window.cxTvTrim&&window.cxTvTrim()", null); if (level >= android.content.ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL) web.clearCache(false) }
    }

    /** Runs before the web client boots: puts the saved login into its storage so no sign-in screen shows up. */
    private fun injectLogin() {
        val q = { s: String -> JSONObject.quote(s) }
        val tvFlag = if (tv) "localStorage.setItem('cx-tv','1');" else "localStorage.removeItem('cx-tv');"
        val width = if (!tv) "" else """
(function(){var W='width=1280';var fix=function(){var m=document.querySelector('meta[name=viewport]');if(m){if(m.content!==W)m.content=W;}else if(document.head){m=document.createElement('meta');m.name='viewport';m.content=W;document.head.appendChild(m);}};fix();var mo=new MutationObserver(fix);mo.observe(document,{childList:true,subtree:true});setTimeout(function(){mo.disconnect();fix();},6000);})();"""
        val script = """(function(){try{
 var tok=${q(store.token)};var cur=null;try{cur=JSON.parse(localStorage.getItem('jellyfin_credentials'))}catch(e){}
 if(!(cur&&cur.Servers&&cur.Servers[0]&&cur.Servers[0].AccessToken===tok&&cur.Servers[0].ManualAddress===${q(store.url)})){
  localStorage.setItem('jellyfin_credentials',JSON.stringify({Servers:[{ManualAddress:${q(store.url)},manualAddressOnly:true,Id:${q(store.serverId)},Name:${q(store.serverName)},LastConnectionMode:2,DateLastAccessed:Date.now(),UserId:${q(store.userId)},AccessToken:tok}]}));
 }
 $tvFlag localStorage.setItem('_deviceId2',${q(store.deviceId)});
}catch(e){}})();
(function(){var rep=function(){try{(window.CinemaTV||window.CinemaNative).hash(location.hash)}catch(e){}};window.addEventListener('hashchange',rep);document.addEventListener('DOMContentLoaded',rep);})();$width"""
        val origin = Regex("^(https?://[^/]+)").find(store.url)?.value ?: store.url
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) WebViewCompat.addDocumentStartJavaScript(web, script, setOf(origin))
        else Log.w("CinemaWeb", "document start script not supported")
    }

    override fun onResume() {
        super.onResume()
        if (::web.isInitialized) { web.onResume(); web.resumeTimers(); if (blanked) { blanked = false; web.loadUrl(store.url + "/web/index.html" + savedHash) } }
        if (returning) { returning = false; if (::web.isInitialized) web.evaluateJavascript(if (tv) "window.cxTvResume&&window.cxTvResume()" else "window.cxAppResume&&window.cxAppResume()", null) }
        if (tv) window.decorView.systemUiVisibility = UiMode.TV_IMMERSIVE else UiMode.apply(this, frame)
    }

    @Deprecated("back handling")
    override fun onBackPressed() {
        if (tv) { web.evaluateJavascript("(window.cxTvBack?window.cxTvBack():false)") { r -> if (r != "true") finish() }; return }
        /* phone: the system back gesture steps back through the page history; on the home screen (or the offline page) it leaves the app */
        web.evaluateJavascript("(function(){var h=location.hash||'';if(!h||h.indexOf('#/home')===0||location.protocol==='data:'||location.href==='about:blank')return 'exit';history.back();return 'back'})()") { r -> if (r?.contains("back") != true) finish() }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        val media = when (keyCode) { KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "playpause"; KeyEvent.KEYCODE_MEDIA_PLAY -> "play"; KeyEvent.KEYCODE_MEDIA_PAUSE -> "pause"; KeyEvent.KEYCODE_MEDIA_NEXT -> "next"; KeyEvent.KEYCODE_MEDIA_PREVIOUS -> "prev"; else -> null }
        if (media != null && tv) { web.evaluateJavascript("window.cxTvMedia&&window.cxTvMedia('$media')", null); return true }
        if (keyCode == KeyEvent.KEYCODE_MENU && tv) { web.evaluateJavascript("window.cxTvMenu&&window.cxTvMenu()", null); return true }
        return super.onKeyDown(keyCode, event)
    }

    override fun onDestroy() {
        main.removeCallbacksAndMessages(null)
        if (!tv && isFinishing) { WebMedia.player().onCommand = null; WebMedia.report(applicationContext, "{\"active\":false}") }
        if (::web.isInitialized) web.destroy(); super.onDestroy()
    }
}
