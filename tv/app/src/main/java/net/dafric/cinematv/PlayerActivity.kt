package net.dafric.cinematv

import android.app.Activity
import android.app.AlertDialog
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.*
import androidx.media3.common.*
import androidx.media3.common.text.CueGroup
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.ui.CaptionStyleCompat
import androidx.media3.ui.PlayerView
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/** Native ExoPlayer screen: direct play first, server transcode as fallback, progress reported to Jellyfin. */
class PlayerActivity : Activity() {
    private lateinit var store: Store
    private lateinit var player: ExoPlayer
    private lateinit var view: PlayerView
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val ui = Handler(Looper.getMainLooper())

    private var item = JSONObject(); private var source = JSONObject(); private var psid = ""; private var method = "DirectPlay"
    private var itemId = ""; private var startTicks = 0L
    private var segments = listOf<LongArray>()
    private var defaultsApplied = false; private var lastReport = 0L; private var stopped = false

    // views
    private lateinit var overlay: FrameLayout; private lateinit var titleView: TextView; private lateinit var subtitleView: TextView
    private lateinit var seek: SeekView; private lateinit var timeView: TextView; private lateinit var ppBtn: ImageButton
    private lateinit var audioBtn: Button; private lateinit var subsBtn: Button; private lateinit var nextBtn: Button
    private lateinit var skipBtn: Button; private lateinit var spinner: ProgressBar; private lateinit var toast: TextView
    private var overlayOn = false
    private val hideRunnable = Runnable { if (player.isPlaying) showOverlay(false) }
    private var nextItem: JSONObject? = null

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
    private fun focusBg(r: Int, n: Int, f: Int) = android.graphics.drawable.StateListDrawable().apply {
        fun s(c: Int, st: Int) = GradientDrawable().apply { cornerRadius = dp(r).toFloat(); setColor(c); if (st != 0) setStroke(dp(3), st) }
        addState(intArrayOf(android.R.attr.state_focused), s(f, Color.WHITE)); addState(intArrayOf(), s(n, 0))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this); itemId = intent.getStringExtra("id") ?: ""; startTicks = intent.getLongExtra("ticks", 0)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        buildUi(); buildPlayer()
        scope.launch { start(itemId, startTicks) }
    }

    /* ---------------- UI ---------------- */
    private fun buildUi() {
        val root = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }
        view = PlayerView(this).apply { useController = false; setShutterBackgroundColor(Color.BLACK); keepScreenOn = true; setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER) }
        root.addView(view, FrameLayout.LayoutParams(-1, -1))
        spinner = ProgressBar(this).apply { isIndeterminate = true; indeterminateTintList = android.content.res.ColorStateList.valueOf(Color.WHITE) }
        root.addView(spinner, FrameLayout.LayoutParams(dp(64), dp(64), Gravity.CENTER))
        toast = TextView(this).apply { textSize = 26f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; gravity = Gravity.CENTER; visibility = View.GONE
            background = GradientDrawable().apply { cornerRadius = dp(30).toFloat(); setColor(Color.parseColor("#99000000")) }; setPadding(dp(28), dp(12), dp(28), dp(12)) }
        root.addView(toast, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER_HORIZONTAL or Gravity.TOP).apply { topMargin = dp(120) })

        overlay = FrameLayout(this).apply { visibility = View.GONE }
        val top = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(56), dp(34), dp(56), dp(60)); background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(Color.parseColor("#CC000000"), Color.TRANSPARENT)) }
        titleView = TextView(this).apply { textSize = 28f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; maxLines = 1 }
        subtitleView = TextView(this).apply { textSize = 18f; setTextColor(Color.parseColor("#C8C8D0")); maxLines = 1 }
        top.addView(titleView); top.addView(subtitleView)
        overlay.addView(top, FrameLayout.LayoutParams(-1, -2, Gravity.TOP))

        val bottom = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(56), dp(80), dp(56), dp(30)); background = GradientDrawable(GradientDrawable.Orientation.BOTTOM_TOP, intArrayOf(Color.parseColor("#E6000000"), Color.TRANSPARENT)) }
        seek = SeekView(this).apply { isFocusable = true; onSeek = { delta -> seekBy(delta); resetHide() } }
        timeView = TextView(this).apply { textSize = 17f; setTextColor(Color.parseColor("#D8D8DE")); typeface = Typeface.MONOSPACE }
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        ppBtn = ImageButton(this).apply { setImageResource(R.drawable.ic_play); scaleType = ImageView.ScaleType.CENTER_INSIDE; background = focusBg(36, Color.parseColor("#E8E8EC"), Color.WHITE); isFocusable = true; setPadding(dp(14), dp(14), dp(14), dp(14)); setOnClickListener { togglePlay() } }
        fun pill(t: String, onClick: () -> Unit) = Button(this).apply { text = t; isAllCaps = false; textSize = 17f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; background = focusBg(26, Color.parseColor("#33FFFFFF"), Color.parseColor("#66FFFFFF")); setPadding(dp(26), 0, dp(26), 0); isFocusable = true; setOnClickListener { onClick() } }
        audioBtn = pill(getString(R.string.audio)) { chooseTrack(C.TRACK_TYPE_AUDIO) }
        subsBtn = pill(getString(R.string.subtitles)) { chooseTrack(C.TRACK_TYPE_TEXT) }
        nextBtn = pill(getString(R.string.next_episode)) { playNext() }.apply { visibility = View.GONE }
        row.addView(ppBtn, LinearLayout.LayoutParams(dp(68), dp(68)))
        row.addView(audioBtn, LinearLayout.LayoutParams(-2, dp(52)).apply { leftMargin = dp(18) })
        row.addView(subsBtn, LinearLayout.LayoutParams(-2, dp(52)).apply { leftMargin = dp(12) })
        row.addView(nextBtn, LinearLayout.LayoutParams(-2, dp(52)).apply { leftMargin = dp(12) })
        row.addView(Space(this), LinearLayout.LayoutParams(0, 1, 1f)); row.addView(timeView)
        bottom.addView(seek, LinearLayout.LayoutParams(-1, dp(40))); bottom.addView(row, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(8) })
        overlay.addView(bottom, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))
        root.addView(overlay, FrameLayout.LayoutParams(-1, -1))

        skipBtn = Button(this).apply { text = getString(R.string.skip_intro); isAllCaps = false; textSize = 20f; setTextColor(Color.BLACK); typeface = Typeface.DEFAULT_BOLD; background = focusBg(30, Color.parseColor("#E8E8EC"), Color.WHITE); setPadding(dp(34), 0, dp(34), 0); visibility = View.GONE; isFocusable = true; setOnClickListener { skipSegment() } }
        root.addView(skipBtn, FrameLayout.LayoutParams(-2, dp(58), Gravity.BOTTOM or Gravity.END).apply { rightMargin = dp(56); bottomMargin = dp(150) })
        setContentView(root)
    }

    private fun buildPlayer() {
        val dsf = DefaultHttpDataSource.Factory().setAllowCrossProtocolRedirects(true).setDefaultRequestProperties(mapOf("Authorization" to store.authHeader()))
        player = ExoPlayer.Builder(this, DefaultRenderersFactory(this).setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER))
            .setMediaSourceFactory(DefaultMediaSourceFactory(this).setDataSourceFactory(dsf))
            .setSeekBackIncrementMs(10_000).setSeekForwardIncrementMs(10_000).build()
        player.setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MOVIE).build(), true)
        view.player = player
        view.subtitleView?.apply { setStyle(CaptionStyleCompat(Color.WHITE, Color.TRANSPARENT, Color.TRANSPARENT, CaptionStyleCompat.EDGE_TYPE_OUTLINE, Color.BLACK, Typeface.DEFAULT_BOLD)); setFractionalTextSize(0.062f); setBottomPaddingFraction(0.08f) }
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                spinner.visibility = if (state == Player.STATE_BUFFERING) View.VISIBLE else View.GONE
                if (state == Player.STATE_ENDED) { if (nextItem != null) playNext() else finish() }
                if (state == Player.STATE_READY) { updateUi() }
            }
            override fun onIsPlayingChanged(isPlaying: Boolean) { ppBtn.setImageResource(if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play); if (isPlaying) resetHide() else ui.removeCallbacks(hideRunnable); report("Progress") }
            override fun onTracksChanged(tracks: Tracks) { if (!defaultsApplied && tracks.groups.isNotEmpty()) { defaultsApplied = true; applyDefaultTracks(tracks) } }
            override fun onPlayerError(e: PlaybackException) {
                Log.e("CinemaPlayer", "error", e)
                if (method != "Transcode") scope.launch { startStream(forceTranscode = true, resumeMs = player.currentPosition) }
                else { Toast.makeText(this@PlayerActivity, getString(R.string.play_failed) + " (" + e.errorCodeName + ")", Toast.LENGTH_LONG).show(); finish() }
            }
        })
        ui.post(object : Runnable { override fun run() { updateUi(); checkSegment(); if (System.currentTimeMillis() - lastReport > 10_000 && player.isPlaying) report("Progress"); ui.postDelayed(this, 500) } })
    }

    /* ---------------- playback ---------------- */
    private fun deviceProfile(): JSONObject {
        val direct = JSONArray().put(JSONObject().put("Container", "mkv,mp4,m4v,mov,webm,ts,mpegts,avi").put("Type", "Video").put("VideoCodec", "h264,hevc,vp9,av1,mpeg4,mpeg2video").put("AudioCodec", "aac,mp3,ac3,eac3,opus,flac,vorbis,pcm_s16le,mp2"))
        val trans = JSONArray().put(JSONObject().put("Container", "ts").put("Type", "Video").put("AudioCodec", "aac,ac3,eac3").put("VideoCodec", "h264,hevc").put("Context", "Streaming").put("Protocol", "hls").put("MaxAudioChannels", "6").put("MinSegments", 1).put("BreakOnNonKeyFrames", true))
        val subs = JSONArray()
        listOf("srt", "subrip", "ass", "ssa", "pgssub", "dvdsub", "dvbsub", "vtt", "webvtt").forEach { subs.put(JSONObject().put("Format", it).put("Method", "Embed")) }
        listOf("srt", "ass", "ssa", "vtt").forEach { subs.put(JSONObject().put("Format", it).put("Method", "External")) }
        return JSONObject().put("Name", "Cinema TV").put("MaxStreamingBitrate", 120_000_000).put("MaxStaticBitrate", 200_000_000).put("DirectPlayProfiles", direct).put("TranscodingProfiles", trans).put("SubtitleProfiles", subs)
            .put("CodecProfiles", JSONArray())
    }

    private suspend fun start(id: String, ticks: Long) {
        itemId = id; startTicks = ticks; defaultsApplied = false; nextItem = null; segments = emptyList()
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/Users/${store.userId}/Items/$id", store.authHeader()) }.getOrNull() }
        if (r == null || !r.ok) { Toast.makeText(this, R.string.play_failed, Toast.LENGTH_LONG).show(); finish(); return }
        item = r.json()
        val isEp = item.optString("Type") == "Episode"
        titleView.text = if (isEp) item.optString("SeriesName") else item.optString("Name")
        subtitleView.text = if (isEp) "S${item.optInt("ParentIndexNumber")}:E${item.optInt("IndexNumber")} · ${item.optString("Name")}" else item.optInt("ProductionYear").takeIf { it > 0 }?.toString() ?: ""
        startStream(false, startTicks / 10_000)
        scope.launch { loadSegments(id); loadNext() }
    }

    private suspend fun startStream(forceTranscode: Boolean, resumeMs: Long) {
        val body = JSONObject().put("DeviceProfile", deviceProfile()).toString()
        val q = "UserId=${store.userId}&StartTimeTicks=${resumeMs * 10_000}&MaxStreamingBitrate=120000000&AutoOpenLiveStream=true" + if (forceTranscode) "&EnableDirectPlay=false&EnableDirectStream=false" else ""
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("POST", "${store.url}/Items/$itemId/PlaybackInfo?$q", store.authHeader(), body, 20000) }.getOrNull() }
        if (r == null || !r.ok) { Toast.makeText(this, R.string.play_failed, Toast.LENGTH_LONG).show(); finish(); return }
        val j = r.json(); psid = j.optString("PlaySessionId"); val srcs = j.optJSONArray("MediaSources")
        if (srcs == null || srcs.length() == 0) { Toast.makeText(this, R.string.play_failed, Toast.LENGTH_LONG).show(); finish(); return }
        source = srcs.getJSONObject(0)
        val msid = source.getString("Id")
        val builder = MediaItem.Builder()
        val base = store.url
        if (!forceTranscode && source.optBoolean("SupportsDirectPlay") && !source.has("TranscodingUrl")) {
            method = "DirectPlay"
            builder.setUri("$base/Videos/$itemId/stream?static=true&MediaSourceId=$msid&PlaySessionId=$psid&Tag=${source.optString("ETag")}")
            val subs = ArrayList<MediaItem.SubtitleConfiguration>()
            source.optJSONArray("MediaStreams")?.let { ms -> for (i in 0 until ms.length()) { val s = ms.getJSONObject(i)
                if (s.optString("Type") == "Subtitle" && s.optString("DeliveryMethod") == "External" && s.optString("DeliveryUrl").isNotEmpty()) {
                    val mime = when (s.optString("Codec").lowercase()) { "srt", "subrip" -> MimeTypes.APPLICATION_SUBRIP; "ass", "ssa" -> MimeTypes.TEXT_SSA; else -> MimeTypes.TEXT_VTT }
                    val du = s.getString("DeliveryUrl"); val full = if (du.startsWith("http")) du else base + du
                    subs.add(MediaItem.SubtitleConfiguration.Builder(Uri.parse(full)).setMimeType(mime).setLanguage(s.optString("Language").ifEmpty { null }).setLabel(s.optString("DisplayTitle")).setId("ext${s.optInt("Index")}").build())
                } } }
            builder.setSubtitleConfigurations(subs)
        } else {
            method = "Transcode"
            val tu = source.optString("TranscodingUrl").ifEmpty { "/videos/$itemId/master.m3u8?MediaSourceId=$msid&PlaySessionId=$psid&VideoCodec=h264&AudioCodec=aac" }
            builder.setUri(if (tu.startsWith("http")) tu else base + tu).setMimeType(MimeTypes.APPLICATION_M3U8)
        }
        player.setMediaItem(builder.build(), if (method == "DirectPlay") resumeMs else 0L)
        player.prepare(); player.playWhenReady = true
        stopped = false; report("Start")
    }

    private fun applyDefaultTracks(tracks: Tracks) {
        val streams = source.optJSONArray("MediaStreams") ?: return
        fun streamsOf(t: String) = (0 until streams.length()).map { streams.getJSONObject(it) }.filter { it.optString("Type") == t }
        val defSub = source.optInt("DefaultSubtitleStreamIndex", -1)
        if (defSub >= 0 && method == "DirectPlay") {
            val subs = streamsOf("Subtitle"); val pos = subs.indexOfFirst { it.optInt("Index") == defSub }
            val groups = tracks.groups.filter { it.type == C.TRACK_TYPE_TEXT }
            if (pos >= 0 && pos < groups.size) selectGroup(groups[pos])
        }
        val defAudio = source.optInt("DefaultAudioStreamIndex", -1)
        if (defAudio >= 0 && method == "DirectPlay") {
            val aud = streamsOf("Audio"); val pos = aud.indexOfFirst { it.optInt("Index") == defAudio }
            val groups = tracks.groups.filter { it.type == C.TRACK_TYPE_AUDIO }
            if (pos > 0 && pos < groups.size) selectGroup(groups[pos])
        }
    }

    private fun selectGroup(g: Tracks.Group, track: Int = 0) {
        player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(g.type, false).setOverrideForType(TrackSelectionOverride(g.mediaTrackGroup, track)).build()
    }

    private fun chooseTrack(type: Int) {
        val groups = player.currentTracks.groups.filter { it.type == type && it.isSupported(false) || it.type == type }
        val names = ArrayList<String>(); val actions = ArrayList<() -> Unit>()
        if (type == C.TRACK_TYPE_TEXT) { names.add(getString(R.string.off)); actions.add { player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true).build() } }
        groups.forEachIndexed { gi, g -> for (i in 0 until g.length) { names.add(trackLabel(g.getTrackFormat(i), type, names.size)); actions.add { selectGroup(g, i) } } }
        if (names.isEmpty() || (type == C.TRACK_TYPE_TEXT && names.size == 1)) { flash(getString(R.string.none_available)); return }
        var checked = 0
        groups.forEachIndexed { gi, g -> for (i in 0 until g.length) if (g.isTrackSelected(i)) checked = names.indexOfFirst { it.isNotEmpty() }.let { _ -> (if (type == C.TRACK_TYPE_TEXT) 1 else 0) + groups.take(gi).sumOf { it.length } + i } }
        if (type == C.TRACK_TYPE_TEXT && player.trackSelectionParameters.disabledTrackTypes.contains(C.TRACK_TYPE_TEXT)) checked = 0
        val dlg = AlertDialog.Builder(this, android.R.style.Theme_Material_Dialog_Alert).setTitle(if (type == C.TRACK_TYPE_AUDIO) R.string.audio else R.string.subtitles)
            .setSingleChoiceItems(names.toTypedArray(), checked) { d, w -> actions[w](); d.dismiss(); resetHide() }.create()
        dlg.window?.setBackgroundDrawable(GradientDrawable().apply { cornerRadius = dp(22).toFloat(); setColor(Color.parseColor("#1C1C21")) })
        dlg.show(); dlg.listView?.requestFocus()
    }

    private fun trackLabel(f: Format, type: Int, n: Int): String {
        val lang = f.language?.takeIf { it != "und" }?.let { Locale(it).displayLanguage.replaceFirstChar { c -> c.uppercase() } }
        val parts = ArrayList<String>()
        parts.add(f.label ?: lang ?: "Track $n")
        if (f.label != null && lang != null && !f.label!!.contains(lang, true)) parts.add(lang)
        if (type == C.TRACK_TYPE_AUDIO) {
            val codec = when { f.sampleMimeType?.contains("eac3") == true -> "E-AC3"; f.sampleMimeType?.contains("ac3") == true -> "AC3"; f.sampleMimeType?.contains("aac") == true -> "AAC"; f.sampleMimeType?.contains("opus") == true -> "Opus"; f.sampleMimeType?.contains("flac") == true -> "FLAC"; f.sampleMimeType?.contains("dts") == true -> "DTS"; f.sampleMimeType?.contains("truehd") == true -> "TrueHD"; else -> "" }
            val ch = when (f.channelCount) { 1 -> "Mono"; 2 -> "Stereo"; 6 -> "5.1"; 8 -> "7.1"; Format.NO_VALUE -> ""; else -> "${f.channelCount}ch" }
            parts.add(listOf(codec, ch).filter { it.isNotEmpty() }.joinToString(" "))
        }
        return parts.filter { it.isNotEmpty() }.distinct().joinToString(" · ")
    }

    private suspend fun loadSegments(id: String) {
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/MediaSegments/$id?includeSegmentTypes=Intro", store.authHeader()) }.getOrNull() } ?: return
        if (!r.ok) return
        val arr = r.json().optJSONArray("Items") ?: return
        segments = (0 until arr.length()).map { arr.getJSONObject(it) }.map { longArrayOf(it.optLong("StartTicks") / 10_000, it.optLong("EndTicks") / 10_000) }
    }

    private suspend fun loadNext() {
        if (item.optString("Type") != "Episode") { nextBtn.visibility = View.GONE; return }
        val sid = item.optString("SeriesId")
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/Shows/$sid/Episodes?userId=${store.userId}&startItemId=$itemId&limit=2", store.authHeader()) }.getOrNull() } ?: return
        if (!r.ok) return
        val arr = r.json().optJSONArray("Items") ?: return
        nextItem = if (arr.length() > 1) arr.getJSONObject(1) else null
        nextBtn.visibility = if (nextItem != null) View.VISIBLE else View.GONE
    }

    private fun playNext() { val n = nextItem ?: return; report("Stopped"); scope.launch { player.stop(); start(n.getString("Id"), 0) } }

    private fun checkSegment() {
        val pos = player.currentPosition; val seg = segments.firstOrNull { pos in it[0]..(it[1] - 1500) }
        val show = seg != null
        if (show && skipBtn.visibility != View.VISIBLE) { skipBtn.visibility = View.VISIBLE; if (!overlayOn) skipBtn.requestFocus() }
        if (!show && skipBtn.visibility == View.VISIBLE) skipBtn.visibility = View.GONE
    }
    private fun skipSegment() { val pos = player.currentPosition; segments.firstOrNull { pos in it[0]..it[1] }?.let { player.seekTo(it[1]) }; skipBtn.visibility = View.GONE }

    /* ---------------- reporting ---------------- */
    private fun report(kind: String) {
        if (stopped && kind != "Stopped") return; if (kind == "Stopped") stopped = true
        lastReport = System.currentTimeMillis()
        val path = when (kind) { "Start" -> "Sessions/Playing"; "Stopped" -> "Sessions/Playing/Stopped"; else -> "Sessions/Playing/Progress" }
        val body = JSONObject().put("ItemId", itemId).put("MediaSourceId", source.optString("Id")).put("PlaySessionId", psid).put("PlayMethod", method).put("PositionTicks", player.currentPosition.coerceAtLeast(0) * 10_000).put("IsPaused", !player.isPlaying).put("CanSeek", true).toString()
        Thread { runCatching { Http.request("POST", "${store.url}/$path", store.authHeader(), body) } }.start()
    }

    /* ---------------- controls ---------------- */
    private fun togglePlay() { if (player.isPlaying) player.pause() else player.play() }
    private fun seekBy(deltaMs: Long) {
        val d = player.duration.takeIf { it > 0 } ?: Long.MAX_VALUE
        player.seekTo((player.currentPosition + deltaMs).coerceIn(0, d - 500))
        flash((if (deltaMs > 0) "+" else "−") + Math.abs(deltaMs / 1000) + " s"); updateUi()
    }
    private fun flash(t: String) { toast.text = t; toast.visibility = View.VISIBLE; ui.removeCallbacks(hideToast); ui.postDelayed(hideToast, 900) }
    private val hideToast = Runnable { toast.visibility = View.GONE }
    private fun fmt(ms: Long): String { val s = (ms / 1000).coerceAtLeast(0); val h = s / 3600; val m = (s % 3600) / 60; val sec = s % 60; return if (h > 0) "%d:%02d:%02d".format(h, m, sec) else "%d:%02d".format(m, sec) }
    private fun updateUi() {
        val d = player.duration.takeIf { it > 0 } ?: 0L; val p = player.currentPosition
        seek.set(if (d > 0) p.toFloat() / d else 0f, if (d > 0) player.bufferedPosition.toFloat() / d else 0f)
        timeView.text = fmt(p) + " / " + fmt(d)
    }
    private fun showOverlay(on: Boolean) {
        overlayOn = on; overlay.visibility = if (on) View.VISIBLE else View.GONE
        if (on) { updateUi(); ppBtn.requestFocus(); resetHide() } else ui.removeCallbacks(hideRunnable)
    }
    private fun resetHide() { ui.removeCallbacks(hideRunnable); if (overlayOn) ui.postDelayed(hideRunnable, 4500) }

    override fun dispatchKeyEvent(e: KeyEvent): Boolean {
        if (e.action != KeyEvent.ACTION_DOWN) return super.dispatchKeyEvent(e)
        val k = e.keyCode
        when (k) {
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, KeyEvent.KEYCODE_HEADSETHOOK -> { togglePlay(); return true }
            KeyEvent.KEYCODE_MEDIA_PLAY -> { player.play(); return true }
            KeyEvent.KEYCODE_MEDIA_PAUSE -> { player.pause(); return true }
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> { seekBy(30_000); return true }
            KeyEvent.KEYCODE_MEDIA_REWIND -> { seekBy(-30_000); return true }
            KeyEvent.KEYCODE_MEDIA_NEXT -> { if (nextItem != null) playNext(); return true }
        }
        if (skipBtn.visibility == View.VISIBLE && !overlayOn && (k == KeyEvent.KEYCODE_DPAD_CENTER || k == KeyEvent.KEYCODE_ENTER)) { skipSegment(); return true }
        if (!overlayOn) {
            when (k) {
                KeyEvent.KEYCODE_DPAD_LEFT -> { seekBy(if (e.repeatCount > 3) -30_000 else -10_000); return true }
                KeyEvent.KEYCODE_DPAD_RIGHT -> { seekBy(if (e.repeatCount > 3) 30_000 else 10_000); return true }
                KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> { togglePlay(); showOverlay(true); return true }
                KeyEvent.KEYCODE_DPAD_UP, KeyEvent.KEYCODE_DPAD_DOWN -> { showOverlay(true); return true }
                KeyEvent.KEYCODE_BACK, KeyEvent.KEYCODE_ESCAPE -> { finish(); return true }
            }
        } else {
            resetHide()
            if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_ESCAPE) { showOverlay(false); return true }
        }
        return super.dispatchKeyEvent(e)
    }

    override fun onPause() { super.onPause(); player.pause() }
    override fun onStop() { super.onStop(); if (!isFinishing) { /* keep position */ } }
    override fun onDestroy() {
        ui.removeCallbacksAndMessages(null)
        runCatching { report("Stopped") }
        scope.cancel(); player.release(); super.onDestroy()
    }
}

/** Remote-friendly seek bar: left/right on the focused bar seeks, the bar grows while focused. */
class SeekView(ctx: android.content.Context) : View(ctx) {
    var onSeek: ((Long) -> Unit)? = null
    private var p = 0f; private var b = 0f
    private val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)
    fun set(progress: Float, buffered: Float) { p = progress.coerceIn(0f, 1f); b = buffered.coerceIn(0f, 1f); invalidate() }
    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (keyCode == KeyEvent.KEYCODE_DPAD_LEFT) { onSeek?.invoke(if (event.repeatCount > 3) -30_000 else -10_000); return true }
        if (keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) { onSeek?.invoke(if (event.repeatCount > 3) 30_000 else 10_000); return true }
        return super.onKeyDown(keyCode, event)
    }
    override fun onDraw(c: android.graphics.Canvas) {
        val h = if (isFocused) 10f * resources.displayMetrics.density else 5f * resources.displayMetrics.density
        val cy = height / 2f; val r = h / 2
        paint.color = Color.parseColor("#44FFFFFF"); c.drawRoundRect(0f, cy - r, width.toFloat(), cy + r, r, r, paint)
        paint.color = Color.parseColor("#66FFFFFF"); c.drawRoundRect(0f, cy - r, width * b, cy + r, r, r, paint)
        paint.color = Color.WHITE; c.drawRoundRect(0f, cy - r, width * p, cy + r, r, r, paint)
        if (isFocused) c.drawCircle(width * p, cy, h * .9f, paint)
    }
    override fun onFocusChanged(gainFocus: Boolean, direction: Int, previouslyFocusedRect: android.graphics.Rect?) { super.onFocusChanged(gainFocus, direction, previouslyFocusedRect); invalidate() }
}
