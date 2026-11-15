package net.dafric.cinematv

import android.content.Context
import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

/** Persistent login data (server, token) and the small Jellyfin HTTP helper used by the native screens. */
class Store(ctx: Context) {
    private val p = ctx.applicationContext.getSharedPreferences("cinema", Context.MODE_PRIVATE)
    var url: String get() = p.getString("url", "") ?: ""; set(v) = p.edit().putString("url", v).apply()
    var token: String get() = p.getString("token", "") ?: ""; set(v) = p.edit().putString("token", v).apply()
    var userId: String get() = p.getString("userId", "") ?: ""; set(v) = p.edit().putString("userId", v).apply()
    var userName: String get() = p.getString("userName", "") ?: ""; set(v) = p.edit().putString("userName", v).apply()
    var serverId: String get() = p.getString("serverId", "") ?: ""; set(v) = p.edit().putString("serverId", v).apply()
    var serverName: String get() = p.getString("serverName", "") ?: ""; set(v) = p.edit().putString("serverName", v).apply()
    val deviceId: String
        get() { var d = p.getString("deviceId", null); if (d == null) { d = UUID.randomUUID().toString(); p.edit().putString("deviceId", d).apply() }; return d }
    val loggedIn get() = url.isNotEmpty() && token.isNotEmpty()
    fun clearLogin() { p.edit().remove("token").remove("userId").remove("userName").apply() }
    fun authHeader(withToken: Boolean = true): String {
        val dev = (Build.MODEL ?: "Android TV").replace("\"", "")
        return "MediaBrowser Client=\"Cinema TV\", Device=\"$dev\", DeviceId=\"$deviceId\", Version=\"1.0.0\"" + if (withToken && token.isNotEmpty()) ", Token=\"$token\"" else ""
    }
}

class HttpResult(val code: Int, val body: String) {
    val ok get() = code in 200..299
    fun json() = JSONObject(body)
}

object Http {
    fun bytes(url: String, auth: String?, timeoutMs: Int = 15000): ByteArray? {
        val c = URL(url).openConnection() as HttpURLConnection
        return try {
            c.connectTimeout = timeoutMs; c.readTimeout = timeoutMs; if (auth != null) c.setRequestProperty("Authorization", auth)
            if (c.responseCode in 200..299) c.inputStream.use { it.readBytes() } else null
        } catch (e: Exception) { null } finally { c.disconnect() }
    }

    /** Blocking request; call from a background thread. */
    fun request(method: String, url: String, auth: String?, body: String? = null, timeoutMs: Int = 12000): HttpResult {
        val c = URL(url).openConnection() as HttpURLConnection
        try {
            c.requestMethod = method; c.connectTimeout = timeoutMs; c.readTimeout = timeoutMs
            c.setRequestProperty("Accept", "application/json")
            if (auth != null) c.setRequestProperty("Authorization", auth)
            if (body != null) { c.doOutput = true; c.setRequestProperty("Content-Type", "application/json"); c.outputStream.use { it.write(body.toByteArray()) } }
            val code = c.responseCode
            val stream = if (code in 200..299) c.inputStream else c.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
            return HttpResult(code, text)
        } finally { c.disconnect() }
    }
}
