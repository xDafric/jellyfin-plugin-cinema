package net.dafric.cinematv

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.StateListDrawable
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.*
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

/** Server address + Quick Connect / password login. Everything is reachable with a remote. */
class LoginActivity : Activity() {
    private lateinit var store: Store
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private lateinit var root: FrameLayout
    private var qcJob: Job? = null

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this)
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        root = FrameLayout(this).apply { setBackgroundColor(Color.parseColor("#111113")) }
        setContentView(root)
        if (store.loggedIn) { openMain(); return }
        serverStep()
    }

    override fun onDestroy() { scope.cancel(); super.onDestroy() }

    private fun focusBg(radius: Int, normal: Int, focused: Int): StateListDrawable {
        fun shape(c: Int, stroke: Int) = GradientDrawable().apply { cornerRadius = dp(radius).toFloat(); setColor(c); if (stroke != 0) setStroke(dp(3), stroke) }
        return StateListDrawable().apply { addState(intArrayOf(android.R.attr.state_focused), shape(focused, Color.WHITE)); addState(intArrayOf(), shape(normal, 0)) }
    }
    private fun title(t: String, size: Float = 34f) = TextView(this).apply { text = t; textSize = size; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD }
    private fun sub(t: String) = TextView(this).apply { text = t; textSize = 17f; setTextColor(Color.parseColor("#9A9AA2")) }
    private fun button(t: String, primary: Boolean = true, onClick: () -> Unit) = Button(this).apply {
        text = t; isAllCaps = false; textSize = 18f; typeface = Typeface.DEFAULT_BOLD
        setTextColor(if (primary) Color.BLACK else Color.WHITE)
        background = if (primary) focusBg(28, Color.parseColor("#E8E8EC"), Color.WHITE) else focusBg(28, Color.parseColor("#2C2C33"), Color.parseColor("#3C3C45"))
        setPadding(dp(30), dp(10), dp(30), dp(10)); isFocusable = true
        setOnClickListener { onClick() }
        onFocusChangeListener = View.OnFocusChangeListener { v, f -> v.animate().scaleX(if (f) 1.05f else 1f).scaleY(if (f) 1.05f else 1f).setDuration(120).start() }
    }
    private fun input(hint: String, pw: Boolean = false, value: String = "") = EditText(this).apply {
        setHint(hint); setText(value); textSize = 20f; setTextColor(Color.WHITE); setHintTextColor(Color.parseColor("#6F6F77"))
        background = focusBg(16, Color.parseColor("#202026"), Color.parseColor("#2A2A31"))
        setPadding(dp(22), dp(14), dp(22), dp(14)); setSingleLine(true)
        inputType = if (pw) InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD else InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI
        imeOptions = EditorInfo.IME_ACTION_NEXT
    }
    private fun panel(vararg kids: View): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL
        val lp = FrameLayout.LayoutParams(dp(640), ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
        layoutParams = lp
        kids.forEach { k -> addView(k, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(14) }) }
    }
    private fun show(v: View) { qcJob?.cancel(); root.removeAllViews(); root.addView(v) }

    /* ---- step 1: server ---- */
    private fun serverStep() {
        val field = input("http://192.168.1.10:8096", value = store.url)
        val status = sub("").apply { gravity = Gravity.CENTER }
        val found = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val next = button(getString(R.string.connect)) {
            val u = normalize(field.text.toString()); if (u.isEmpty()) return@button
            status.text = getString(R.string.connecting)
            scope.launch {
                val info = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "$u/System/Info/Public", null) }.getOrNull() }
                if (info != null && info.ok) { val j = info.json(); store.url = u; store.serverName = j.optString("ServerName"); store.serverId = j.optString("Id"); authStep() }
                else status.text = getString(R.string.no_server)
            }
        }
        field.setOnEditorActionListener { _, a, _ -> if (a == EditorInfo.IME_ACTION_NEXT || a == EditorInfo.IME_ACTION_DONE) { next.performClick(); true } else false }
        val box = panel(title("Cinema"), sub(getString(R.string.server_hint)), field, next, status, found)
        (box.getChildAt(0).layoutParams as LinearLayout.LayoutParams).topMargin = 0
        show(box); next.requestFocus()
        scope.launch {
            val servers = withContext(Dispatchers.IO) { discover() }
            servers.forEach { (name, addr) ->
                found.addView(button("$name · $addr", false) { field.setText(addr); next.performClick() }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(10) })
            }
        }
    }

    private fun normalize(raw: String): String {
        var u = raw.trim().trimEnd('/'); if (u.isEmpty()) return ""
        if (!Regex("^https?://", RegexOption.IGNORE_CASE).containsMatchIn(u)) u = "http://$u"
        return u.removeSuffix("/web/index.html").removeSuffix("/web")
    }

    /** Jellyfin answers a UDP broadcast on port 7359. */
    private fun discover(): List<Pair<String, String>> {
        val out = LinkedHashMap<String, Pair<String, String>>()
        try {
            DatagramSocket().use { s ->
                s.broadcast = true; s.soTimeout = 1500
                val msg = "who is JellyfinServer?".toByteArray()
                s.send(DatagramPacket(msg, msg.size, InetAddress.getByName("255.255.255.255"), 7359))
                val end = System.currentTimeMillis() + 1800
                while (System.currentTimeMillis() < end) {
                    val buf = ByteArray(2048); val p = DatagramPacket(buf, buf.size)
                    try { s.receive(p) } catch (e: Exception) { break }
                    val j = JSONObject(String(p.data, 0, p.length)); out[j.optString("Id")] = j.optString("Name") to j.optString("Address")
                }
            }
        } catch (e: Exception) { }
        return out.values.toList()
    }

    /* ---- step 2: Quick Connect or password ---- */
    private fun authStep() {
        val codeView = TextView(this).apply { textSize = 64f; setTextColor(Color.WHITE); typeface = Typeface.MONOSPACE; gravity = Gravity.CENTER; letterSpacing = .2f; text = "······" }
        val hint = sub(getString(R.string.qc_hint)).apply { gravity = Gravity.CENTER }
        val status = sub("").apply { gravity = Gravity.CENTER }
        val pwBtn = button(getString(R.string.use_password), false) { passwordStep() }
        val backBtn = button(getString(R.string.change_server), false) { serverStep() }
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER; addView(pwBtn); addView(backBtn, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { leftMargin = dp(16) }) }
        show(panel(title(store.serverName.ifEmpty { "Jellyfin" }), hint, codeView, status, row)); pwBtn.requestFocus()
        qcJob = scope.launch {
            val init = withContext(Dispatchers.IO) { runCatching { Http.request("POST", store.url + "/QuickConnect/Initiate", store.authHeader(false), "") }.getOrNull() }
            if (init == null || !init.ok) { hint.text = getString(R.string.qc_off); codeView.text = ""; return@launch }
            val j = init.json(); val secret = j.getString("Secret"); codeView.text = j.getString("Code")
            while (isActive) {
                delay(3000)
                val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", store.url + "/QuickConnect/Connect?secret=$secret", store.authHeader(false)) }.getOrNull() }
                if (r != null && r.ok && r.json().optBoolean("Authenticated")) {
                    val a = withContext(Dispatchers.IO) { runCatching { Http.request("POST", store.url + "/Users/AuthenticateWithQuickConnect", store.authHeader(false), JSONObject().put("Secret", secret).toString()) }.getOrNull() }
                    if (a != null && a.ok) { saveAuth(a.json()); return@launch }
                }
            }
        }
    }

    private fun passwordStep() {
        val user = input("User", value = store.userName).apply { inputType = InputType.TYPE_CLASS_TEXT }; val pw = input("Password", true)
        val status = sub("").apply { gravity = Gravity.CENTER }
        val go = button(getString(R.string.sign_in)) {
            status.text = getString(R.string.connecting)
            scope.launch {
                val r = withContext(Dispatchers.IO) { runCatching { Http.request("POST", store.url + "/Users/AuthenticateByName", store.authHeader(false), JSONObject().put("Username", user.text.toString().trim()).put("Pw", pw.text.toString()).toString()) }.getOrNull() }
                if (r != null && r.ok) saveAuth(r.json()) else status.text = getString(R.string.bad_login)
            }
        }
        pw.setOnEditorActionListener { _, _, _ -> go.performClick(); true }
        val back = button(getString(R.string.back), false) { authStep() }
        show(panel(title(getString(R.string.sign_in)), user, pw, go, back, status)); user.requestFocus()
    }

    private fun saveAuth(j: JSONObject) {
        store.token = j.getString("AccessToken"); val u = j.getJSONObject("User"); store.userId = u.getString("Id"); store.userName = u.optString("Name")
        j.optString("ServerId").takeIf { it.isNotEmpty() }?.let { store.serverId = it }
        openMain()
    }

    private fun openMain() { startActivity(Intent(this, MainActivity::class.java)); finish() }
}
