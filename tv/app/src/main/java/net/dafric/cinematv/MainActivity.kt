package net.dafric.cinematv

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
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
    private var returning = false

    inner class Bridge {
        @JavascriptInterface fun play(itemId: String, startTicks: Long) { runOnUiThread { returning = true; startActivity(Intent(this@MainActivity, PlayerActivity::class.java).putExtra("id", itemId).putExtra("ticks", startTicks)) } }
        @JavascriptInterface fun exit() { runOnUiThread { finish() } }
        @JavascriptInterface fun logout() { runOnUiThread { store.clearLogin(); web.clearCache(true); CookieManager.getInstance().removeAllCookies(null); WebStorage.getInstance().deleteAllData(); startActivity(Intent(this@MainActivity, LoginActivity::class.java)); finish() } }
        @JavascriptInterface fun version(): String = "1.0.0"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this)
        if (!store.loggedIn) { startActivity(Intent(this, LoginActivity::class.java)); finish(); return }
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        val frame = FrameLayout(this).apply { setBackgroundColor(Color.parseColor("#111113")) }
        web = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#111113"))
            settings.javaScriptEnabled = true; settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            settings.userAgentString = settings.userAgentString + " CinemaTV/1.0"
            settings.useWideViewPort = true; settings.loadWithOverviewMode = true
            isFocusable = true; isFocusableInTouchMode = true
            addJavascriptInterface(Bridge(), "CinemaTV")
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(m: ConsoleMessage): Boolean { Log.d("CinemaWeb", "${m.messageLevel()} ${m.message()} (${m.sourceId()}:${m.lineNumber()})"); return true }
            }
            webViewClient = object : WebViewClient() {
                override fun onReceivedError(v: WebView, req: WebResourceRequest, err: WebResourceError) { if (req.isForMainFrame) Log.w("CinemaWeb", "main frame error ${err.description}") }
            }
        }
        WebView.setWebContentsDebuggingEnabled(true)
        frame.addView(web, FrameLayout.LayoutParams(-1, -1)); setContentView(frame)
        injectLogin()
        web.loadUrl(store.url + "/web/index.html#/home")
        web.requestFocus()
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
}catch(e){}})();"""
        val origin = store.url.substringBefore("/", "").let { _ -> Regex("^(https?://[^/]+)").find(store.url)?.value ?: store.url }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) WebViewCompat.addDocumentStartJavaScript(web, script, setOf(origin))
        else Log.w("CinemaWeb", "document start script not supported")
    }

    override fun onResume() {
        super.onResume()
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

    override fun onDestroy() { web.destroy(); super.onDestroy() }
}
