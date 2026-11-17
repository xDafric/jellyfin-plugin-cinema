package net.dafric.cinematv

import android.app.Notification
import android.content.Context
import android.net.Uri
import android.util.Base64
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.NoOpCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import androidx.media3.exoplayer.offline.Download
import androidx.media3.exoplayer.offline.DownloadManager
import androidx.media3.exoplayer.offline.DownloadNotificationHelper
import androidx.media3.exoplayer.offline.DownloadRequest
import androidx.media3.exoplayer.offline.DownloadService
import androidx.media3.exoplayer.scheduler.Requirements
import androidx.media3.exoplayer.scheduler.Scheduler
import androidx.media3.exoplayer.workmanager.WorkManagerScheduler
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

/**
 * Offline downloads: Media3 DownloadManager (resumable, scheduled with WorkManager) writing into a cache in the app's private storage.
 * Playback of a finished download goes through [cacheFactory] with the item id as cache key, so it works without any network.
 */
object Downloads {
    private var cache: SimpleCache? = null
    private var mgr: DownloadManager? = null
    private val lock = Any()
    const val CHANNEL = "cinema_downloads"
    private const val STOP_USER = 1

    private fun prefs(ctx: Context) = ctx.applicationContext.getSharedPreferences("cinema", Context.MODE_PRIVATE)
    fun wifiOnly(ctx: Context) = prefs(ctx).getBoolean("dlWifiOnly", true)
    fun setWifiOnly(ctx: Context, on: Boolean) {
        prefs(ctx).edit().putBoolean("dlWifiOnly", on).apply()
        manager(ctx).requirements = requirements(on)
    }
    private fun requirements(wifi: Boolean) = Requirements(if (wifi) Requirements.NETWORK_UNMETERED else Requirements.NETWORK)

    /** Created on every data source with the current token, so a new login is picked up. */
    private fun upstream(ctx: Context): DataSource.Factory {
        val app = ctx.applicationContext
        return DataSource.Factory { DefaultHttpDataSource.Factory().setAllowCrossProtocolRedirects(true).setConnectTimeoutMs(15000).setReadTimeoutMs(30000).setDefaultRequestProperties(mapOf("Authorization" to Store(app).authHeader())).createDataSource() }
    }

    fun cache(ctx: Context): SimpleCache = synchronized(lock) {
        cache ?: SimpleCache(File(ctx.applicationContext.filesDir, "downloads"), NoOpCacheEvictor(), StandaloneDatabaseProvider(ctx.applicationContext)).also { cache = it }
    }

    fun manager(ctx: Context): DownloadManager = synchronized(lock) {
        mgr ?: DownloadManager(ctx.applicationContext, StandaloneDatabaseProvider(ctx.applicationContext), cache(ctx), upstream(ctx), Executors.newFixedThreadPool(2)).also {
            it.requirements = requirements(wifiOnly(ctx)); it.maxParallelDownloads = 2; mgr = it
        }
    }

    /** Data source for offline playback: the cache first, the server only for what is missing. */
    fun cacheFactory(ctx: Context): DataSource.Factory = CacheDataSource.Factory().setCache(cache(ctx)).setUpstreamDataSourceFactory(upstream(ctx)).setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)

    fun find(ctx: Context, id: String): Download? = runCatching { manager(ctx).downloadIndex.getDownload(id) }.getOrNull()
    fun meta(d: Download): JSONObject = runCatching { JSONObject(String(d.request.data)) }.getOrDefault(JSONObject())
    /** Metadata of a fully downloaded item, or null. */
    fun completed(ctx: Context, id: String): JSONObject? = find(ctx, id)?.takeIf { it.state == Download.STATE_COMPLETED }?.let { meta(it) }
    fun streamUri(ctx: Context, id: String): Uri = Uri.parse(Store(ctx).url + "/Videos/$id/stream?static=true&MediaSourceId=" + (completed(ctx, id)?.optString("ms") ?: id))

    fun resumePending(ctx: Context) {
        runCatching { if (list(ctx).any { it.optString("state") == "downloading" || it.optString("state") == "queued" }) DownloadService.start(ctx, CinemaDownloadService::class.java) }
    }

    private val types = setOf("Movie", "Episode", "Video", "MusicVideo")

    /** Blocking (network): fetch the item, remember its details and queue the file. Returns "ok" or an error code. */
    fun add(ctx: Context, id: String): String {
        val store = Store(ctx); if (!store.loggedIn) return "login"
        if (find(ctx, id) != null) return "ok"
        val r = runCatching { Http.request("GET", "${store.url}/Users/${store.userId}/Items/$id", store.authHeader()) }.getOrNull() ?: return "network"
        if (!r.ok) return "http" + r.code
        val item = r.json(); val type = item.optString("Type"); if (type !in types) return "unsupported"
        val src = item.optJSONArray("MediaSources")?.optJSONObject(0) ?: return "nosource"
        val ms = src.optString("Id")
        val ep = type == "Episode"
        val sub = if (ep) "S${item.optInt("ParentIndexNumber")}:E${item.optInt("IndexNumber")} · ${item.optString("Name")}" else (item.optInt("ProductionYear").takeIf { y -> y > 0 }?.toString() ?: "")
        val meta = JSONObject().put("id", id).put("ms", ms).put("type", type).put("title", if (ep) item.optString("SeriesName") else item.optString("Name"))
            .put("subtitle", sub).put("size", src.optLong("Size")).put("runtime", item.optLong("RunTimeTicks")).put("added", System.currentTimeMillis())
        /* a small poster so the list works offline too */
        val tag = item.optJSONObject("ImageTags")?.optString("Primary").orEmpty()
        val img = if (tag.isNotEmpty()) Http.bytes("${store.url}/Items/$id/Images/Primary?maxWidth=260&quality=75&tag=$tag", store.authHeader()) else null
        if (img != null) meta.put("poster", Base64.encodeToString(img, Base64.NO_WRAP))
        val req = DownloadRequest.Builder(id, Uri.parse("${store.url}/Videos/$id/stream?static=true&MediaSourceId=$ms")).setCustomCacheKey(id).setData(meta.toString().toByteArray()).build()
        DownloadService.sendAddDownload(ctx.applicationContext, CinemaDownloadService::class.java, req, false)
        return "ok"
    }

    fun remove(ctx: Context, id: String) { DownloadService.sendRemoveDownload(ctx.applicationContext, CinemaDownloadService::class.java, id, false) }
    fun pause(ctx: Context, id: String) { DownloadService.sendSetStopReason(ctx.applicationContext, CinemaDownloadService::class.java, id, STOP_USER, false) }
    fun resume(ctx: Context, id: String) { DownloadService.sendSetStopReason(ctx.applicationContext, CinemaDownloadService::class.java, id, Download.STOP_REASON_NONE, false) }

    fun list(ctx: Context): List<JSONObject> {
        val out = ArrayList<JSONObject>()
        runCatching {
            manager(ctx).downloadIndex.getDownloads().use { c ->
                while (c.moveToNext()) {
                    val d = c.download; val m = meta(d); val total = m.optLong("size")
                    val pct = if (d.percentDownloaded >= 0) d.percentDownloaded.toDouble() else if (total > 0) d.bytesDownloaded * 100.0 / total else 0.0
                    val state = when (d.state) { Download.STATE_COMPLETED -> "done"; Download.STATE_DOWNLOADING -> "downloading"; Download.STATE_FAILED -> "failed"
                        Download.STATE_STOPPED -> "paused"; else -> "queued" }
                    out.add(JSONObject().put("id", d.request.id).put("title", m.optString("title")).put("subtitle", m.optString("subtitle")).put("type", m.optString("type"))
                        .put("state", state).put("percent", pct.coerceIn(0.0, 100.0)).put("bytes", d.bytesDownloaded).put("total", if (total > 0) total else d.contentLength.coerceAtLeast(0)).put("added", m.optLong("added")).put("runtime", m.optLong("runtime")))
                }
            }
        }
        return out.sortedByDescending { it.optLong("added") }
    }
    fun listJson(ctx: Context): String = JSONArray(list(ctx)).toString()
    fun poster(ctx: Context, id: String): String = find(ctx, id)?.let { meta(it).optString("poster") }?.takeIf { it.isNotEmpty() }?.let { "data:image/jpeg;base64,$it" } ?: ""
    fun usedBytes(ctx: Context): Long = runCatching { cache(ctx).cacheSpace }.getOrDefault(0L)
}

class CinemaDownloadService : DownloadService(1001, DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL, Downloads.CHANNEL, R.string.downloads_channel, 0) {
    override fun getDownloadManager(): DownloadManager = Downloads.manager(this)
    override fun getScheduler(): Scheduler = WorkManagerScheduler(this, "cinema-downloads")
    override fun getForegroundNotification(downloads: MutableList<Download>, notMetRequirements: Int): Notification =
        DownloadNotificationHelper(this, Downloads.CHANNEL).buildProgressNotification(this, android.R.drawable.stat_sys_download, null, null, downloads, notMetRequirements)
}
