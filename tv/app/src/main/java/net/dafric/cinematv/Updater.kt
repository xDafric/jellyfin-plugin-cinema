package net.dafric.cinematv

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.net.Uri
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

/** Update hint: looks into the GitHub release list for an APK newer than the installed one and offers the download page. Nothing is installed silently. */
object Updater {
    private const val REPO = "xDafric/jellyfin-plugin-cinema"
    private val APK = Regex("""CinemaTV-(\d+(?:\.\d+){1,3})\.apk""", RegexOption.IGNORE_CASE)

    class Info(val version: String, val url: String, val page: String, val notes: String)

    fun installed(ctx: Context): String = runCatching { ctx.packageManager.getPackageInfo(ctx.packageName, 0).versionName }.getOrNull() ?: "0"

    fun cmp(a: String, b: String): Int {
        val x = a.split('.').map { it.toIntOrNull() ?: 0 }; val y = b.split('.').map { it.toIntOrNull() ?: 0 }
        for (i in 0 until maxOf(x.size, y.size)) { val d = (x.getOrElse(i) { 0 }).compareTo(y.getOrElse(i) { 0 }); if (d != 0) return d }
        return 0
    }

    /** Blocking; null when up to date or the list cannot be read. */
    fun latest(ctx: Context): Info? {
        val c = URL("https://api.github.com/repos/$REPO/releases?per_page=30").openConnection() as HttpURLConnection
        try {
            c.connectTimeout = 8000; c.readTimeout = 8000
            c.setRequestProperty("Accept", "application/vnd.github+json"); c.setRequestProperty("User-Agent", "CinemaApp")
            if (c.responseCode !in 200..299) return null
            val arr = JSONArray(c.inputStream.bufferedReader().use { it.readText() })
            var best: Info? = null
            for (i in 0 until arr.length()) {
                val r = arr.getJSONObject(i); if (r.optBoolean("draft") || r.optBoolean("prerelease")) continue
                val assets = r.optJSONArray("assets") ?: continue
                for (k in 0 until assets.length()) {
                    val a = assets.getJSONObject(k); val v = APK.find(a.optString("name"))?.groupValues?.get(1) ?: continue
                    if (best == null || cmp(v, best.version) > 0) best = Info(v, a.optString("browser_download_url"), r.optString("html_url"), r.optString("body"))
                }
            }
            return best?.takeIf { cmp(it.version, installed(ctx)) > 0 }
        } catch (e: Exception) { return null } finally { c.disconnect() }
    }

    /** Checks at most every 12 hours and asks once per version; [force] ignores both limits. */
    fun checkAndAsk(a: Activity, force: Boolean = false) {
        val p = a.getSharedPreferences("cinema", Context.MODE_PRIVATE)
        if (!force && System.currentTimeMillis() - p.getLong("updCheck", 0) < 12 * 3600_000L) return
        p.edit().putLong("updCheck", System.currentTimeMillis()).apply()
        thread(name = "update-check") {
            val info = latest(a) ?: return@thread
            if (!force && p.getString("updSkip", "") == info.version) return@thread
            a.runOnUiThread {
                if (a.isFinishing || a.isDestroyed) return@runOnUiThread
                val msg = a.getString(R.string.update_msg, info.version, installed(a)) + (if (info.notes.isNotBlank()) "\n\n" + info.notes.trim().take(500) else "")
                runCatching {
                    AlertDialog.Builder(a, android.R.style.Theme_Material_Dialog_Alert).setTitle(R.string.update_title).setMessage(msg)
                        .setPositiveButton(R.string.update_get) { _, _ -> runCatching { a.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(info.page.ifEmpty { info.url }))) } }
                        .setNegativeButton(R.string.update_later) { _, _ -> p.edit().putString("updSkip", info.version).apply() }.show()
                }
            }
        }
    }
}
