package net.dafric.cinematv

import android.app.Activity
import android.app.AlertDialog
import android.app.PendingIntent
import android.app.PictureInPictureParams
import android.content.Intent
import android.content.res.Configuration
import android.media.AudioManager
import android.os.Build
import android.util.Rational
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.StateListDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.format.DateFormat
import android.util.Log
import android.util.LruCache
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.*
import androidx.media3.common.*
import androidx.media3.common.util.Util
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import androidx.media3.session.MediaSession
import androidx.media3.ui.PlayerNotificationManager
import androidx.media3.ui.CaptionStyleCompat
import androidx.media3.ui.PlayerView
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.util.Date
import java.util.Locale

/** Native ExoPlayer screen: direct play first, server transcode as fallback, scrub previews (trickplay), progress reported to Jellyfin. */
class PlayerActivity : Activity() {
    private lateinit var store: Store
    private lateinit var player: ExoPlayer
    private lateinit var view: PlayerView
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val ui = Handler(Looper.getMainLooper())

    private var item = JSONObject(); private var source = JSONObject(); private var psid = ""; private var method = "DirectPlay"
    private var itemId = ""; private var startTicks = 0L
    /** Media segment: start / end in ms and Jellyfin type (Intro, Outro, Recap). */
    private class Seg(val start: Long, val end: Long, val type: String)
    private var segments = listOf<Seg>()
    private var ncDismiss = false; private var ncStart = -1L
    private var chapters = listOf<Pair<Long, String>>()
    private var defaultsApplied = false; private var lastReport = 0L; private var stopped = false
    private var nextItem: JSONObject? = null

    // trickplay
    private var tpWidth = 0; private var tpW = 0; private var tpH = 0; private var tpTileW = 0; private var tpTileH = 0; private var tpInterval = 0L; private var tpCount = 0
    private val sheets = LruCache<Int, Bitmap>(3); private val loading = HashSet<Int>()

    // scrubbing
    private var scrubbing = false; private var scrubMs = 0L; private var pressCount = 0; private var lastPress = 0L

    // views
    private lateinit var overlay: FrameLayout; private lateinit var titleView: TextView; private lateinit var subtitleView: TextView; private lateinit var badges: LinearLayout
    private lateinit var seek: SeekView; private lateinit var curTime: TextView; private lateinit var remTime: TextView; private lateinit var endsAt: TextView
    private lateinit var ppBtn: IconBtn; private lateinit var audioBtn: IconBtn; private lateinit var subsBtn: IconBtn; private lateinit var nextBtn: IconBtn
    private lateinit var nextCard: LinearLayout; private lateinit var nextThumb: ImageView; private lateinit var nextTitle: TextView; private lateinit var nextCount: TextView
    private lateinit var nextGo: IconBtn; private lateinit var nextCancel: IconBtn; private lateinit var nextFill: View; private lateinit var nextTrack: FrameLayout
    private lateinit var skipBtn: IconBtn; private lateinit var spinner: ProgressBar; private lateinit var toast: TextView; private lateinit var centerIcon: ImageView
    private lateinit var preview: LinearLayout; private lateinit var previewImg: ImageView; private lateinit var previewTime: TextView; private lateinit var previewChap: TextView
    private var overlayOn = false
    private lateinit var rootView: FrameLayout
    private val phone by lazy { !UiMode.isTv(this) }
    private var session: MediaSession? = null; private var notifier: PlayerNotificationManager? = null
    private var offlineLocal = false; private var pipSeen = false; private var inPip = false
    private var artBitmap: Bitmap? = null; private var artFor = ""
    private lateinit var audio: AudioManager
    private lateinit var aspectBtn: IconBtn; private lateinit var speedBtn: IconBtn; private var aspectMode = 0
    private val hideRunnable = Runnable { if (player.isPlaying && !scrubbing) showOverlay(false) }
    private val commitRunnable = Runnable { commitScrub() }

    private companion object { const val NEXT_COUNT_MS = 10_000L }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    /** Icon (+ optional label) button that turns white when focused. */
    inner class IconBtn(ctx: Context, icon: Int, label: String?, size: Int, round: Boolean) : LinearLayout(ctx) {
        private val img = ImageView(ctx).apply { setImageResource(icon); setColorFilter(Color.WHITE) }
        private val txt: TextView? = label?.let { TextView(ctx).apply { text = it; textSize = 15f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD } }
        private val bgN = GradientDrawable().apply { cornerRadius = dp(size).toFloat(); setColor(Color.parseColor("#33FFFFFF")) }
        private val bgF = GradientDrawable().apply { cornerRadius = dp(size).toFloat(); setColor(Color.WHITE) }
        init {
            orientation = HORIZONTAL; gravity = Gravity.CENTER; isFocusable = true; isClickable = true
            addView(img, LayoutParams(dp(size * 5 / 9), dp(size * 5 / 9)))
            txt?.let { addView(it, LayoutParams(-2, -2).apply { leftMargin = dp(10) }) }
            val pad = if (label != null) dp(size / 2 + 4) else (size - size * 5 / 9) * resources.displayMetrics.density.toInt() / 2
            setPadding(if (label != null) pad else dp((size - size * 5 / 9) / 2), 0, if (label != null) pad else dp((size - size * 5 / 9) / 2), 0)
            background = bgN
            onFocusChangeListener = OnFocusChangeListener { _, f ->
                background = if (f) bgF else bgN; img.setColorFilter(if (f) Color.BLACK else Color.WHITE); txt?.setTextColor(if (f) Color.BLACK else Color.WHITE)
                animate().scaleX(if (f) 1.1f else 1f).scaleY(if (f) 1.1f else 1f).setDuration(120).start()
            }
            minimumHeight = dp(size)
        }
        fun setIcon(res: Int) { img.setImageResource(res) }
        fun setLabel(t: String) { txt?.text = t }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = Store(this); itemId = intent.getStringExtra("id") ?: ""; startTicks = intent.getLongExtra("ticks", 0)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        audio = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        buildUi(); UiMode.apply(this, rootView, immersive = true); buildPlayer()
        if (phone) setupTouch()
        scope.launch { start(itemId, startTicks) }
    }

    /* ---------------- UI ---------------- */
    private fun buildUi() {
        val root = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }; rootView = root
        view = PlayerView(this).apply { useController = false; setShutterBackgroundColor(Color.BLACK); keepScreenOn = true; setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER) }
        root.addView(view, FrameLayout.LayoutParams(-1, -1))
        spinner = ProgressBar(this).apply { isIndeterminate = true; indeterminateTintList = android.content.res.ColorStateList.valueOf(Color.WHITE) }
        root.addView(spinner, FrameLayout.LayoutParams(dp(64), dp(64), Gravity.CENTER))
        centerIcon = ImageView(this).apply { setImageResource(R.drawable.t_play); setColorFilter(Color.WHITE); setPadding(dp(26), dp(26), dp(26), dp(26)); visibility = View.GONE
            background = GradientDrawable().apply { shape = GradientDrawable.OVAL; setColor(Color.parseColor("#80000000")) } }
        root.addView(centerIcon, FrameLayout.LayoutParams(dp(110), dp(110), Gravity.CENTER))
        toast = TextView(this).apply { textSize = 26f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; gravity = Gravity.CENTER; visibility = View.GONE
            background = GradientDrawable().apply { cornerRadius = dp(30).toFloat(); setColor(Color.parseColor("#99000000")) }; setPadding(dp(28), dp(12), dp(28), dp(12)) }
        root.addView(toast, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER_HORIZONTAL or Gravity.TOP).apply { topMargin = dp(110) })

        overlay = FrameLayout(this).apply { visibility = View.GONE }
        /* top: back, title, badges */
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.TOP; setPadding(dp(44), dp(26), dp(44), dp(56)); background = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM, intArrayOf(Color.parseColor("#D9000000"), Color.TRANSPARENT)) }
        val titles = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        titleView = TextView(this).apply { textSize = 26f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; maxLines = 1 }
        subtitleView = TextView(this).apply { textSize = 15f; setTextColor(Color.parseColor("#C8C8D0")); maxLines = 1 }
        titles.addView(titleView); titles.addView(subtitleView)
        badges = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.END }
        if (phone) {
            val backBtn = IconBtn(this, R.drawable.t_back, null, 44, true).apply { setOnClickListener { finish() } }
            top.addView(backBtn, LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(12) })
            titleView.textSize = 20f; top.setPadding(dp(20), dp(16), dp(20), dp(48))
        }
        top.addView(titles, LinearLayout.LayoutParams(0, -2, 1f)); top.addView(badges, LinearLayout.LayoutParams(-2, -2))
        overlay.addView(top, FrameLayout.LayoutParams(-1, -2, Gravity.TOP))

        /* bottom: seek, times, buttons */
        val bottom = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; clipChildren = false; clipToPadding = false; setPadding(dp(44), dp(90), dp(44), dp(40)); background = GradientDrawable(GradientDrawable.Orientation.BOTTOM_TOP, intArrayOf(Color.parseColor("#F2000000"), Color.parseColor("#99000000"), Color.TRANSPARENT)) }
        seek = SeekView(this).apply { isFocusable = true; onScrub = { dir, rep -> scrubStep(dir, rep) }; onTouchSeek = { f, up -> touchSeek(f, up) } }
        curTime = TextView(this).apply { textSize = 14f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD }
        remTime = TextView(this).apply { textSize = 14f; setTextColor(Color.parseColor("#C8C8D0")) }
        val times = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; addView(curTime, LinearLayout.LayoutParams(0, -2, 1f)); addView(remTime) }
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; clipChildren = false; clipToPadding = false }
        ppBtn = IconBtn(this, R.drawable.t_play, null, 54, true).apply { setOnClickListener { togglePlay() } }
        val back10 = IconBtn(this, R.drawable.t_back10, null, 44, true).apply { setOnClickListener { jump(-10_000) } }
        val fwd10 = IconBtn(this, R.drawable.t_fwd10, null, 44, true).apply { setOnClickListener { jump(10_000) } }
        audioBtn = IconBtn(this, R.drawable.t_audio, if (phone) null else getString(R.string.audio), 44, false).apply { setOnClickListener { chooseTrack(C.TRACK_TYPE_AUDIO) } }
        subsBtn = IconBtn(this, R.drawable.t_subs, if (phone) null else getString(R.string.subtitles), 44, false).apply { setOnClickListener { chooseTrack(C.TRACK_TYPE_TEXT) } }
        nextBtn = IconBtn(this, R.drawable.t_next, if (phone) null else getString(R.string.next_episode), 44, false).apply { setOnClickListener { playNext() }; visibility = View.GONE }
        aspectBtn = IconBtn(this, R.drawable.t_aspect, null, 44, true).apply { setOnClickListener { cycleAspect() } }
        speedBtn = IconBtn(this, R.drawable.t_speed, "1×", 44, false).apply { setOnClickListener { chooseSpeed() } }
        endsAt = TextView(this).apply { textSize = 14f; setTextColor(Color.parseColor("#C8C8D0")) }
        val gap = { dp(14) }
        row.addView(ppBtn, LinearLayout.LayoutParams(dp(54), dp(54)))
        row.addView(back10, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = gap() })
        row.addView(fwd10, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = gap() })
        row.addView(audioBtn, LinearLayout.LayoutParams(if (phone) dp(44) else -2, dp(44)).apply { leftMargin = dp(28) })
        row.addView(subsBtn, LinearLayout.LayoutParams(if (phone) dp(44) else -2, dp(44)).apply { leftMargin = gap() })
        row.addView(aspectBtn, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = gap() })
        row.addView(speedBtn, LinearLayout.LayoutParams(-2, dp(44)).apply { leftMargin = gap() })
        row.addView(nextBtn, LinearLayout.LayoutParams(if (phone) dp(44) else -2, dp(44)).apply { leftMargin = gap() })
        if (phone && Build.VERSION.SDK_INT >= 26 && packageManager.hasSystemFeature(android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE))
            row.addView(IconBtn(this, R.drawable.t_pip, null, 44, true).apply { setOnClickListener { enterPip() } }, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = gap() })
        row.addView(Space(this), LinearLayout.LayoutParams(dp(14), 1)); row.addView(endsAt)
        bottom.addView(seek, LinearLayout.LayoutParams(-1, dp(34)))
        bottom.addView(times, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(2) })
        if (phone) {
            bottom.setPadding(dp(20), dp(90), dp(20), dp(24))
            bottom.addView(HorizontalScrollView(this).apply { isHorizontalScrollBarEnabled = false; clipChildren = false; addView(row) }, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(14) })
        } else bottom.addView(row, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(14) })
        overlay.addView(bottom, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))

        /* scrub preview card */
        previewImg = ImageView(this).apply { scaleType = ImageView.ScaleType.CENTER_CROP; background = GradientDrawable().apply { cornerRadius = dp(14).toFloat(); setColor(Color.parseColor("#22222A")); setStroke(dp(3), Color.WHITE) }; clipToOutline = true; outlineProvider = android.view.ViewOutlineProvider.BACKGROUND }
        previewTime = TextView(this).apply { textSize = 22f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; gravity = Gravity.CENTER; setShadowLayer(8f, 0f, 2f, Color.BLACK) }
        previewChap = TextView(this).apply { textSize = 15f; setTextColor(Color.parseColor("#D0D0D8")); gravity = Gravity.CENTER; maxLines = 1; setShadowLayer(8f, 0f, 2f, Color.BLACK) }
        preview = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL; visibility = View.GONE
            addView(previewImg, LinearLayout.LayoutParams(dp(220), dp(124))); addView(previewTime, LinearLayout.LayoutParams(dp(220), -2).apply { topMargin = dp(8) }); addView(previewChap, LinearLayout.LayoutParams(dp(220), -2)) }
        overlay.addView(preview, FrameLayout.LayoutParams(dp(220), -2, Gravity.BOTTOM or Gravity.START).apply { bottomMargin = dp(168) })
        root.addView(overlay, FrameLayout.LayoutParams(-1, -1))

        skipBtn = IconBtn(this, R.drawable.t_next, getString(R.string.skip_intro), 48, false).apply { visibility = View.GONE; setOnClickListener { skipSegment() } }
        root.addView(skipBtn, FrameLayout.LayoutParams(-2, dp(48), Gravity.BOTTOM or Gravity.END).apply { rightMargin = dp(44); bottomMargin = dp(170) })

        /* up next: same panel look as the dialogs (#1C1C21, rounded), same buttons as the control row */
        nextThumb = ImageView(this).apply { scaleType = ImageView.ScaleType.CENTER_CROP; background = GradientDrawable().apply { cornerRadius = dp(14).toFloat(); setColor(Color.parseColor("#22222A")) }; clipToOutline = true; outlineProvider = android.view.ViewOutlineProvider.BACKGROUND
            setOnClickListener { playNext() } }
        nextCount = TextView(this).apply { textSize = 13f; setTextColor(Color.parseColor("#C8C8D0")); typeface = Typeface.DEFAULT_BOLD }
        nextTitle = TextView(this).apply { textSize = if (phone) 15f else 18f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END }
        nextFill = View(this).apply { background = GradientDrawable().apply { cornerRadius = dp(2).toFloat(); setColor(Color.WHITE) } }
        nextTrack = FrameLayout(this).apply { background = GradientDrawable().apply { cornerRadius = dp(2).toFloat(); setColor(Color.parseColor("#33FFFFFF")) }; addView(nextFill, FrameLayout.LayoutParams(0, -1)) }
        nextGo = IconBtn(this, R.drawable.t_next, getString(R.string.next_episode), 44, false).apply { setOnClickListener { playNext() } }
        nextCancel = IconBtn(this, R.drawable.t_play, getString(R.string.watch_credits), 44, false).apply { setOnClickListener { dismissNextCard() } }
        val ncBtns = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; clipChildren = false; clipToPadding = false
            addView(nextGo, LinearLayout.LayoutParams(-2, dp(44))); addView(nextCancel, LinearLayout.LayoutParams(-2, dp(44)).apply { leftMargin = dp(12) }) }
        val ncText = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; clipChildren = false; clipToPadding = false
            addView(nextCount); addView(nextTitle, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(2) })
            addView(nextTrack, LinearLayout.LayoutParams(-1, dp(4)).apply { topMargin = dp(10); bottomMargin = dp(14) }); addView(ncBtns) }
        val thumbW = if (phone) 120 else 176
        nextCard = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; visibility = View.GONE; clipChildren = false; clipToPadding = false
            setPadding(dp(16), dp(16), dp(20), dp(16))
            background = GradientDrawable().apply { cornerRadius = dp(22).toFloat(); setColor(Color.parseColor("#F01C1C21")); setStroke(dp(1), Color.parseColor("#1AFFFFFF")) }
            elevation = dp(8).toFloat()
            addView(nextThumb, LinearLayout.LayoutParams(dp(thumbW), dp(thumbW * 9 / 16))); addView(ncText, LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(16) }) }
        root.addView(nextCard, FrameLayout.LayoutParams(-2, -2, Gravity.BOTTOM or Gravity.END).apply { rightMargin = dp(if (phone) 16 else 44); bottomMargin = dp(if (phone) 150 else 170); leftMargin = dp(16) })
        setContentView(root)
    }

    private var softDecoders = false; private var uiLoop = false; private var netRetries = 0
    /** A clear message with a way out instead of a toast and a closed screen. */
    private fun fail(code: String, resume: Long) {
        if (isFinishing || isDestroyed) return
        runCatching {
            android.app.AlertDialog.Builder(this).setTitle(getString(R.string.play_failed)).setMessage(code).setCancelable(false)
                .setPositiveButton("Erneut versuchen") { _, _ -> netRetries = 0; scope.launch { startStream(forceTranscode = true, resumeMs = resume) } }
                .setNegativeButton("Schlie\u00dfen") { _, _ -> finish() }.show()
        }.onFailure { finish() }
    }
    private fun buildPlayer() {
        val dsf = DefaultHttpDataSource.Factory().setAllowCrossProtocolRedirects(true).setDefaultRequestProperties(mapOf("Authorization" to store.authHeader()))
        player = ExoPlayer.Builder(this, DefaultRenderersFactory(this).setExtensionRendererMode(DefaultRenderersFactory.EXTENSION_RENDERER_MODE_PREFER).setEnableDecoderFallback(softDecoders))
            .setMediaSourceFactory(DefaultMediaSourceFactory(this).setDataSourceFactory(dsf))
            .setSeekBackIncrementMs(10_000).setSeekForwardIncrementMs(10_000).setHandleAudioBecomingNoisy(true).build()
        player.setAudioAttributes(AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MOVIE).build(), true)
        view.player = player; attachSession()
        view.subtitleView?.apply { setStyle(CaptionStyleCompat(Color.WHITE, Color.TRANSPARENT, Color.TRANSPARENT, CaptionStyleCompat.EDGE_TYPE_OUTLINE, Color.BLACK, Typeface.DEFAULT_BOLD)); setFractionalTextSize(0.062f); setBottomPaddingFraction(0.08f) }
        player.addListener(object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                spinner.visibility = if (state == Player.STATE_BUFFERING) View.VISIBLE else View.GONE
                if (state == Player.STATE_ENDED) { if (nextItem != null && !ncDismiss) playNext() else finish() }
                if (state == Player.STATE_READY) { netRetries = 0; updateUi() }
            }
            override fun onIsPlayingChanged(isPlaying: Boolean) {
                ppBtn.setIcon(if (isPlaying) R.drawable.t_pause else R.drawable.t_play); updatePip()
                centerIcon.visibility = if (!isPlaying && player.playbackState == Player.STATE_READY && !scrubbing) View.VISIBLE else View.GONE
                if (isPlaying) resetHide() else ui.removeCallbacks(hideRunnable); report("Progress")
            }
            override fun onVideoSizeChanged(size: VideoSize) { updatePip() }
            override fun onTracksChanged(tracks: Tracks) { if (!defaultsApplied && tracks.groups.isNotEmpty()) { defaultsApplied = true; applyDefaultTracks(tracks) } }
            override fun onPlayerError(e: PlaybackException) {
                Log.e("CinemaPlayer", "error", e)
                if (offlineLocal) {
                    /* a downloaded file cannot be transcoded: the only other chance is a decoder that is not the first choice */
                    if (!softDecoders && e.errorCodeName.contains("DECOD")) { softDecoders = true; val pos = player.currentPosition; view.player = null; detachSession(); player.release(); buildPlayer(); scope.launch { startStream(false, pos) } }
                    else fail(e.errorCodeName, player.currentPosition)
                    return
                }
                /* network trouble: try the same stream again a few times before changing anything */
                val net = e.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_FAILED || e.errorCode == PlaybackException.ERROR_CODE_IO_NETWORK_CONNECTION_TIMEOUT || e.errorCode == PlaybackException.ERROR_CODE_IO_UNSPECIFIED
                if (net && netRetries < 3) { netRetries++; val pos = player.currentPosition; flash("Verbindung \u2026 Versuch " + netRetries); ui.postDelayed({ scope.launch { startStream(forceTranscode = method == "Transcode", resumeMs = pos) } }, 2000L * netRetries); return }
                if (method != "Transcode") scope.launch { startStream(forceTranscode = true, resumeMs = player.currentPosition) }
                else if (!softDecoders && e.errorCodeName.contains("DECOD")) {
                    /* the hardware decoder is not available: last resort is a software decoder (slower, but it plays) */
                    softDecoders = true; val pos = player.currentPosition; view.player = null; detachSession(); player.release(); buildPlayer(); scope.launch { startStream(forceTranscode = true, resumeMs = pos) }
                }
                else fail(e.errorCodeName, player.currentPosition)
            }
        })
        if (!uiLoop) { uiLoop = true; ui.post(object : Runnable { override fun run() { updateUi(); checkSegment(); checkNextCard(); if (System.currentTimeMillis() - lastReport > 10_000 && player.isPlaying) report("Progress"); ui.postDelayed(this, 500) } }) }
    }

    /* ---------------- playback ---------------- */
    private fun deviceProfile(): JSONObject {
        val direct = JSONArray().put(JSONObject().put("Container", "mkv,mp4,m4v,mov,webm,ts,mpegts,avi").put("Type", "Video").put("VideoCodec", "h264,hevc,vp9,av1,mpeg4,mpeg2video").put("AudioCodec", "aac,mp3,ac3,eac3,opus,flac,vorbis,pcm_s16le,mp2"))
        val trans = JSONArray().put(JSONObject().put("Container", "ts").put("Type", "Video").put("AudioCodec", "aac,ac3,eac3").put("VideoCodec", "h264,hevc").put("Context", "Streaming").put("Protocol", "hls").put("MaxAudioChannels", "6").put("MinSegments", 1).put("BreakOnNonKeyFrames", true))
        val subs = JSONArray()
        listOf("srt", "subrip", "ass", "ssa", "pgssub", "dvdsub", "dvbsub", "vtt", "webvtt").forEach { subs.put(JSONObject().put("Format", it).put("Method", "Embed")) }
        listOf("srt", "ass", "ssa", "vtt").forEach { subs.put(JSONObject().put("Format", it).put("Method", "External")) }
        return JSONObject().put("Name", "Cinema TV").put("MaxStreamingBitrate", 120_000_000).put("MaxStaticBitrate", 200_000_000).put("DirectPlayProfiles", direct).put("TranscodingProfiles", trans).put("SubtitleProfiles", subs).put("CodecProfiles", JSONArray())
    }

    private suspend fun start(id: String, ticks: Long) {
        itemId = id; startTicks = ticks; defaultsApplied = false; nextItem = null; segments = emptyList(); ncDismiss = false; ncStart = -1; hideNextCard(); sheets.evictAll(); tpWidth = 0
        val local = withContext(Dispatchers.IO) { Downloads.completed(this@PlayerActivity, id) }
        offlineLocal = local != null
        /* a finished download is played from the device; the server is only asked for extras (chapters, previews) and may be unreachable */
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/Users/${store.userId}/Items/$id", store.authHeader(), null, if (local != null) 3000 else 12000) }.getOrNull() }
        if (r == null || !r.ok) {
            if (local == null) { fail(if (r == null) "NETWORK" else "HTTP " + r.code, ticks / 10_000); return }
            item = JSONObject().put("Type", local.optString("type")).put("RunTimeTicks", local.optLong("runtime")).put("Name", local.optString("title"))
            titleView.text = local.optString("title"); subtitleView.text = local.optString("subtitle"); chapters = emptyList(); notifier?.invalidate()
            startStream(false, startTicks / 10_000); return
        }
        item = r.json()
        val isEp = item.optString("Type") == "Episode"
        titleView.text = if (isEp) item.optString("SeriesName") else item.optString("Name")
        subtitleView.text = if (isEp) "S${item.optInt("ParentIndexNumber")}:E${item.optInt("IndexNumber")} · ${item.optString("Name")}" else listOf(item.optInt("ProductionYear").takeIf { it > 0 }?.toString(), item.optString("OfficialRating").ifEmpty { null }).filterNotNull().joinToString(" · ")
        chapters = item.optJSONArray("Chapters")?.let { a -> (0 until a.length()).map { a.getJSONObject(it) }.map { (it.optLong("StartPositionTicks") / 10_000) to it.optString("Name") } } ?: emptyList()
        notifier?.invalidate()
        startStream(false, startTicks / 10_000)
        scope.launch { loadSegments(id); loadNext() }
    }

    private fun setupTrickplay() {
        tpWidth = 0
        val tp = item.optJSONObject("Trickplay") ?: return; val ms = source.optString("Id")
        val byMs = tp.optJSONObject(ms) ?: tp.keys().asSequence().firstOrNull()?.let { tp.optJSONObject(it) } ?: return
        val w = byMs.keys().asSequence().mapNotNull { it.toIntOrNull() }.minOrNull() ?: return
        val inf = byMs.optJSONObject(w.toString()) ?: return
        tpWidth = w; tpW = inf.optInt("Width"); tpH = inf.optInt("Height"); tpTileW = inf.optInt("TileWidth"); tpTileH = inf.optInt("TileHeight"); tpInterval = inf.optLong("Interval"); tpCount = inf.optInt("ThumbnailCount")
        if (tpW <= 0 || tpTileW <= 0 || tpInterval <= 0) tpWidth = 0
    }

    private fun fillBadges() {
        badges.removeAllViews()
        val streams = source.optJSONArray("MediaStreams") ?: return
        val all = (0 until streams.length()).map { streams.getJSONObject(it) }
        val v = all.firstOrNull { it.optString("Type") == "Video" }
        val a = all.firstOrNull { it.optInt("Index") == source.optInt("DefaultAudioStreamIndex", -1) } ?: all.firstOrNull { it.optString("Type") == "Audio" }
        val list = ArrayList<String>()
        if (v != null) {
            val h = v.optInt("Height"); list.add(when { h >= 2000 -> "4K"; h >= 1000 -> "1080p"; h >= 700 -> "720p"; h > 0 -> "${h}p"; else -> "" })
            list.add(v.optString("Codec").uppercase()); val hdr = v.optString("VideoRangeType"); if (hdr.isNotEmpty() && hdr != "SDR") list.add(if (hdr.startsWith("DOVI")) "DOLBY VISION" else hdr)
        }
        if (a != null) list.add(a.optString("Codec").uppercase() + when (a.optInt("Channels")) { 6 -> " 5.1"; 8 -> " 7.1"; 2 -> " 2.0"; else -> "" })
        list.add(if (method == "DirectPlay") "DIRECT PLAY" else "TRANSCODE")
        list.filter { it.isNotEmpty() }.forEach { t ->
            badges.addView(TextView(this).apply { text = t; textSize = 13f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; setPadding(dp(12), dp(5), dp(12), dp(5)); background = GradientDrawable().apply { cornerRadius = dp(20).toFloat(); setColor(Color.parseColor("#40FFFFFF")) } },
                LinearLayout.LayoutParams(-2, -2).apply { leftMargin = dp(8) })
        }
    }

    /** Plays the finished download through the cache; no network needed. */
    private fun startLocal(resumeMs: Long) {
        method = "DirectPlay"; psid = ""; source = JSONObject().put("Id", Downloads.completed(this, itemId)?.optString("ms") ?: itemId)
        val md = MediaMetadata.Builder().setTitle(titleView.text).setSubtitle(subtitleView.text).build()
        val mi = MediaItem.Builder().setUri(Downloads.streamUri(this, itemId)).setCustomCacheKey(itemId).setMediaMetadata(md).build()
        tpWidth = 0; badges.removeAllViews()
        badges.addView(TextView(this).apply { text = "OFFLINE"; textSize = 13f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; setPadding(dp(12), dp(5), dp(12), dp(5)); background = GradientDrawable().apply { cornerRadius = dp(20).toFloat(); setColor(Color.parseColor("#40FFFFFF")) } }, LinearLayout.LayoutParams(-2, -2))
        player.setMediaSource(ProgressiveMediaSource.Factory(Downloads.cacheFactory(this)).createMediaSource(mi), resumeMs)
        player.prepare(); player.playWhenReady = true
        stopped = false; report("Start")
    }

    private suspend fun startStream(forceTranscode: Boolean, resumeMs: Long) {
        if (offlineLocal) { startLocal(resumeMs); return }
        val body = JSONObject().put("DeviceProfile", deviceProfile()).toString()
        var q = "UserId=${store.userId}&StartTimeTicks=${resumeMs * 10_000}&MaxStreamingBitrate=120000000&AutoOpenLiveStream=true" + if (forceTranscode) "&EnableDirectPlay=false&EnableDirectStream=false" else ""
        /* a transcode carries one audio track: ask for the language chosen for this series */
        if (forceTranscode) prefAudioIndex()?.let { q += "&AudioStreamIndex=$it" }
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("POST", "${store.url}/Items/$itemId/PlaybackInfo?$q", store.authHeader(), body, 20000) }.getOrNull() }
        if (r == null || !r.ok) { fail(if (r == null) "NETWORK" else "HTTP " + r.code, resumeMs); return }
        val j = r.json(); psid = j.optString("PlaySessionId"); val srcs = j.optJSONArray("MediaSources")
        if (srcs == null || srcs.length() == 0) { fail("NO_SOURCE", resumeMs); return }
        source = srcs.getJSONObject(0)
        val msid = source.getString("Id")
        val builder = MediaItem.Builder()
        val md = MediaMetadata.Builder().setTitle(titleView.text).setSubtitle(subtitleView.text).build(); builder.setMediaMetadata(md)
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
        setupTrickplay(); fillBadges()
        player.setMediaItem(builder.build(), if (method == "DirectPlay") resumeMs else 0L)
        player.prepare(); player.playWhenReady = true
        stopped = false; report("Start")
    }

    /* ---------------- audio / subtitle language per series ---------------- */
    private val trackPrefs by lazy { getSharedPreferences("player_tracks", Context.MODE_PRIVATE) }
    private fun seriesKey(): String? = item.optString("SeriesId").ifEmpty { null }
    private fun prefGet(kind: String): String? = seriesKey()?.let { trackPrefs.getString("$it.$kind", null) }
    private fun prefSet(kind: String, v: String) { val k = seriesKey() ?: return; trackPrefs.edit().putString("$k.$kind", v).apply() }
    private fun normLang(l: String?): String? = l?.takeIf { it.isNotBlank() && it != "und" }?.let { runCatching { Util.normalizeLanguageCode(it) }.getOrNull() ?: it.lowercase() }
    private fun prefAudioIndex(): Int? {
        val want = prefGet("audio") ?: return null
        val streams = item.optJSONArray("MediaSources")?.optJSONObject(0)?.optJSONArray("MediaStreams") ?: return null
        return (0 until streams.length()).map { streams.getJSONObject(it) }.firstOrNull { it.optString("Type") == "Audio" && normLang(it.optString("Language")) == want }?.optInt("Index")
    }
    private fun rememberTrack(type: Int, f: Format?) {
        if (type == C.TRACK_TYPE_AUDIO) { normLang(f?.language)?.let { prefSet("audio", it) }; return }
        if (f == null) { prefSet("sub", "off"); return }
        normLang(f.language)?.let { prefSet("sub", it + if (f.selectionFlags and C.SELECTION_FLAG_FORCED != 0) "!forced" else "") }
    }
    /** Picks the track of [type] whose language matches; forced subtitles only when that was the choice. */
    private fun pickByLang(tracks: Tracks, type: Int, lang: String, forced: Boolean?): Boolean {
        val cands = tracks.groups.filter { it.type == type }.flatMap { g -> (0 until g.length).map { g to it } }.filter { (g, i) -> normLang(g.getTrackFormat(i).language) == lang }
        val best = cands.firstOrNull { (g, i) -> forced == null || ((g.getTrackFormat(i).selectionFlags and C.SELECTION_FLAG_FORCED) != 0) == forced } ?: cands.firstOrNull() ?: return false
        selectGroup(best.first, best.second); return true
    }

    private fun applyDefaultTracks(tracks: Tracks) {
        /* the choice made for this series wins over the file's defaults */
        val wantA = prefGet("audio"); val wantS = prefGet("sub")
        val audioDone = wantA != null && pickByLang(tracks, C.TRACK_TYPE_AUDIO, wantA, null)
        val subDone = when {
            wantS == "off" -> { player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true).build(); true }
            wantS != null -> pickByLang(tracks, C.TRACK_TYPE_TEXT, wantS.removeSuffix("!forced"), wantS.endsWith("!forced"))
            else -> false
        }
        val streams = source.optJSONArray("MediaStreams") ?: return
        fun streamsOf(t: String) = (0 until streams.length()).map { streams.getJSONObject(it) }.filter { it.optString("Type") == t }
        val defSub = source.optInt("DefaultSubtitleStreamIndex", -1)
        if (!subDone && defSub >= 0 && method == "DirectPlay") {
            val subs = streamsOf("Subtitle"); val pos = subs.indexOfFirst { it.optInt("Index") == defSub }
            val groups = tracks.groups.filter { it.type == C.TRACK_TYPE_TEXT }
            if (pos >= 0 && pos < groups.size) selectGroup(groups[pos])
        }
        val defAudio = source.optInt("DefaultAudioStreamIndex", -1)
        if (!audioDone && defAudio >= 0 && method == "DirectPlay") {
            val aud = streamsOf("Audio"); val pos = aud.indexOfFirst { it.optInt("Index") == defAudio }
            val groups = tracks.groups.filter { it.type == C.TRACK_TYPE_AUDIO }
            if (pos > 0 && pos < groups.size) selectGroup(groups[pos])
        }
    }

    private fun selectGroup(g: Tracks.Group, track: Int = 0) {
        player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(g.type, false).setOverrideForType(TrackSelectionOverride(g.mediaTrackGroup, track)).build()
    }

    /** Picture format: fit (whole picture) / fill (cropped to the screen) / stretch. */
    private fun cycleAspect() = setAspect((aspectMode + 1) % 3)
    private fun setAspect(mode: Int) {
        aspectMode = mode
        view.resizeMode = when (aspectMode) { 1 -> androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_ZOOM; 2 -> androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_FILL; else -> androidx.media3.ui.AspectRatioFrameLayout.RESIZE_MODE_FIT }
        flash(getString(when (aspectMode) { 1 -> R.string.fill; 2 -> R.string.stretch; else -> R.string.fit })); resetHide()
    }

    private fun chooseSpeed() {
        val speeds = floatArrayOf(.75f, 1f, 1.25f, 1.5f, 2f); val names = arrayOf("0.75×", "1×", "1.25×", "1.5×", "2×")
        val checked = speeds.indexOfFirst { it == player.playbackParameters.speed }.let { if (it < 0) 1 else it }
        val dlg = AlertDialog.Builder(this, android.R.style.Theme_Material_Dialog_Alert).setTitle(R.string.speed)
            .setSingleChoiceItems(names, checked) { d, w -> player.setPlaybackSpeed(speeds[w]); speedBtn.setLabel(names[w]); d.dismiss(); resetHide() }.create()
        dlg.window?.setBackgroundDrawable(GradientDrawable().apply { cornerRadius = dp(22).toFloat(); setColor(Color.parseColor("#1C1C21")) })
        dlg.show(); dlg.listView?.requestFocus()
    }

    private fun chooseTrack(type: Int) {
        val groups = player.currentTracks.groups.filter { it.type == type }
        val names = ArrayList<String>(); val actions = ArrayList<() -> Unit>(); var checked = 0
        if (type == C.TRACK_TYPE_TEXT) { names.add(getString(R.string.off)); actions.add { player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true).build(); rememberTrack(type, null) } }
        groups.forEach { g -> for (i in 0 until g.length) { if (g.isTrackSelected(i)) checked = names.size; names.add(trackLabel(g.getTrackFormat(i), type, names.size)); actions.add { selectGroup(g, i); rememberTrack(type, g.getTrackFormat(i)) } } }
        if (type == C.TRACK_TYPE_TEXT && player.trackSelectionParameters.disabledTrackTypes.contains(C.TRACK_TYPE_TEXT)) checked = 0
        if (names.isEmpty() || (type == C.TRACK_TYPE_TEXT && names.size == 1)) { flash(getString(R.string.none_available)); return }
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
        val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/MediaSegments/$id?includeSegmentTypes=Intro&includeSegmentTypes=Recap&includeSegmentTypes=Outro", store.authHeader()) }.getOrNull() } ?: return
        if (!r.ok || id != itemId) return
        val arr = r.json().optJSONArray("Items") ?: return
        segments = (0 until arr.length()).map { arr.getJSONObject(it) }.map { Seg(it.optLong("StartTicks") / 10_000, it.optLong("EndTicks") / 10_000, it.optString("Type")) }
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

    private fun playNext() { val n = nextItem ?: return; hideNextCard(); report("Stopped"); scope.launch { player.stop(); start(n.getString("Id"), 0) } }

    /** Skip button for intro, recap and (when no up-next card takes over) the credits. */
    private fun activeSegment(): Seg? {
        val pos = player.currentPosition
        return segments.firstOrNull { pos in it.start..(it.end - 1500) && (it.type != "Outro" || nextItem == null || ncDismiss) }
    }
    private fun checkSegment() {
        val seg = if (inPip) null else activeSegment()
        if (seg != null) skipBtn.setLabel(getString(when (seg.type) { "Outro" -> R.string.skip_credits; "Recap" -> R.string.skip_recap; else -> R.string.skip_intro }))
        if (seg != null && skipBtn.visibility != View.VISIBLE) { skipBtn.visibility = View.VISIBLE; if (!overlayOn) skipBtn.requestFocus() }
        if (seg == null && skipBtn.visibility == View.VISIBLE) skipBtn.visibility = View.GONE
    }
    private fun skipSegment() { activeSegment()?.let { player.seekTo(it.end) }; skipBtn.visibility = View.GONE }

    /* ---------------- up next ---------------- */
    /** Shows the card when the credits start (Outro segment) or 20 s before the end; after the credits countdown the next episode starts. */
    private fun checkNextCard() {
        val n = nextItem; val d = player.duration
        if (n == null || ncDismiss || d <= 0 || offlineLocal) { hideNextCard(); return }
        val pos = player.currentPosition; val left = d - pos
        val out = segments.firstOrNull { it.type == "Outro" && it.start > d / 2 && it.start < d - 2000 }
        val from = out?.start ?: (d - 20_000)
        if (pos < from || left <= 0 || scrubbing) { hideNextCard(); return }
        if (ncStart < 0 || pos < ncStart) ncStart = pos
        val total = if (out != null) minOf(NEXT_COUNT_MS, d - from) else d - from
        val remain = (if (out != null) minOf(left, total - (pos - ncStart)) else left).coerceAtLeast(0)
        if (!inPip && nextCard.visibility != View.VISIBLE) showNextCard(n)
        nextCount.text = getString(R.string.next_in, ((remain + 999) / 1000).toInt())
        val w = nextTrack.width; if (w > 0 && total > 0) { val lp = nextFill.layoutParams; lp.width = (w * (1f - remain.toFloat() / total)).toInt().coerceIn(0, w); nextFill.layoutParams = lp }
        if (out != null && remain <= 0 && player.isPlaying) playNext()
    }
    private fun showNextCard(n: JSONObject) {
        nextTitle.text = "S${n.optInt("ParentIndexNumber")}:E${n.optInt("IndexNumber")} · ${n.optString("Name")}"
        nextThumb.setImageDrawable(null)
        val id = n.optString("Id"); val url = "${store.url}/Items/$id/Images/Primary?maxWidth=400"
        scope.launch { val b = withContext(Dispatchers.IO) { Http.bytes(url, store.authHeader())?.let { BitmapFactory.decodeByteArray(it, 0, it.size) } }; if (b != null && nextItem?.optString("Id") == id) nextThumb.setImageBitmap(b) }
        nextCard.alpha = 0f; nextCard.translationY = dp(16).toFloat(); nextCard.visibility = View.VISIBLE
        nextCard.animate().alpha(1f).translationY(0f).setDuration(260).start()
        skipBtn.visibility = View.GONE
        if (!overlayOn) nextGo.requestFocus()
    }
    private fun hideNextCard() { if (::nextCard.isInitialized && nextCard.visibility != View.GONE) nextCard.visibility = View.GONE }
    private fun dismissNextCard() { ncDismiss = true; hideNextCard(); if (overlayOn) ppBtn.requestFocus() }

    /* ---------------- reporting ---------------- */
    private fun report(kind: String) {
        if (stopped && kind != "Stopped") return; if (kind == "Stopped") stopped = true
        lastReport = System.currentTimeMillis()
        val path = when (kind) { "Start" -> "Sessions/Playing"; "Stopped" -> "Sessions/Playing/Stopped"; else -> "Sessions/Playing/Progress" }
        val body = JSONObject().put("ItemId", itemId).put("MediaSourceId", source.optString("Id")).put("PlaySessionId", psid).put("PlayMethod", method).put("PositionTicks", player.currentPosition.coerceAtLeast(0) * 10_000).put("IsPaused", !player.isPlaying).put("CanSeek", true).toString()
        Thread { runCatching { Http.request("POST", "${store.url}/$path", store.authHeader(), body) } }.start()
    }

    /* ---------------- scrubbing with previews ---------------- */
    private fun duration() = player.duration.takeIf { it > 0 } ?: ((item.optLong("RunTimeTicks")) / 10_000)

    private fun scrubStep(dir: Int, repeat: Int) {
        val now = System.currentTimeMillis(); pressCount = if (now - lastPress < 700) pressCount + 1 else 1; lastPress = now
        val step = when { repeat > 15 -> 120_000L; repeat > 6 -> 60_000L; pressCount > 8 -> 60_000L; pressCount > 3 -> 30_000L; else -> 10_000L }
        if (!scrubbing) { scrubbing = true; scrubMs = player.currentPosition; centerIcon.visibility = View.GONE }
        if (!overlayOn) { showOverlay(true, focusSeek = true) }
        scrubMs = (scrubMs + dir * step).coerceIn(0, (duration() - 1000).coerceAtLeast(0))
        updateScrub(); ui.removeCallbacks(commitRunnable); ui.postDelayed(commitRunnable, 1300); ui.removeCallbacks(hideRunnable)
    }

    private fun commitScrub() {
        ui.removeCallbacks(commitRunnable); if (!scrubbing) return
        scrubbing = false; preview.visibility = View.GONE; player.seekTo(scrubMs); updateUi(); resetHide()
        if (!player.isPlaying && player.playbackState == Player.STATE_READY) centerIcon.visibility = View.VISIBLE
    }
    private fun cancelScrub() { ui.removeCallbacks(commitRunnable); scrubbing = false; preview.visibility = View.GONE; updateUi() }

    private fun updateScrub() {
        val d = duration(); val frac = if (d > 0) scrubMs.toFloat() / d else 0f
        seek.set(frac, player.bufferedPosition.toFloat() / (if (d > 0) d else 1)); curTime.text = fmt(scrubMs); remTime.text = "-" + fmt(d - scrubMs)
        previewTime.text = fmt(scrubMs); previewChap.text = chapters.lastOrNull { it.first <= scrubMs }?.second ?: ""
        val W = resources.displayMetrics.widthPixels; val barL = dp(44); val barW = W - dp(88); val cw = dp(220)
        val lp = preview.layoutParams as FrameLayout.LayoutParams
        lp.leftMargin = (barL + frac * barW - cw / 2f).toInt().coerceIn(dp(24), W - dp(24) - cw); preview.layoutParams = lp
        preview.visibility = View.VISIBLE; loadThumb(scrubMs)
    }

    private fun loadThumb(ms: Long) {
        if (tpWidth == 0) { previewImg.visibility = View.GONE; return }
        previewImg.visibility = View.VISIBLE
        val idx = (ms / tpInterval).toInt().coerceIn(0, (tpCount - 1).coerceAtLeast(0)); val per = tpTileW * tpTileH; val sheet = idx / per; val off = idx % per
        val bmp = sheets.get(sheet)
        if (bmp != null) { val x = (off % tpTileW) * tpW; val y = (off / tpTileW) * tpH
            if (x + tpW <= bmp.width && y + tpH <= bmp.height) previewImg.setImageBitmap(Bitmap.createBitmap(bmp, x, y, tpW, tpH)) }
        else if (loading.add(sheet)) {
            val id = itemId; val url = "${store.url}/Videos/$itemId/Trickplay/$tpWidth/$sheet.jpg?MediaSourceId=${source.optString("Id")}"
            scope.launch { val b = withContext(Dispatchers.IO) { Http.bytes(url, store.authHeader())?.let { BitmapFactory.decodeByteArray(it, 0, it.size) } }
                loading.remove(sheet); if (b != null && id == itemId) { sheets.put(sheet, b); if (scrubbing) loadThumb(scrubMs) } }
        }
    }

    /* ---------------- controls ---------------- */
    private fun togglePlay() { if (player.isPlaying) player.pause() else player.play() }
    private fun jump(deltaMs: Long) {
        val d = duration().takeIf { it > 0 } ?: Long.MAX_VALUE
        player.seekTo((player.currentPosition + deltaMs).coerceIn(0, d - 500))
        flash((if (deltaMs > 0) "+" else "−") + Math.abs(deltaMs / 1000) + " s"); updateUi(); resetHide()
    }
    private fun flash(t: String) { toast.text = t; toast.visibility = View.VISIBLE; ui.removeCallbacks(hideToast); ui.postDelayed(hideToast, 900) }
    private val hideToast = Runnable { toast.visibility = View.GONE }
    private fun fmt(ms: Long): String { val s = (ms / 1000).coerceAtLeast(0); val h = s / 3600; val m = (s % 3600) / 60; val sec = s % 60; return if (h > 0) "%d:%02d:%02d".format(h, m, sec) else "%d:%02d".format(m, sec) }
    private fun updateUi() {
        if (scrubbing) return
        val d = duration(); val p = player.currentPosition
        seek.chapters = if (d > 0) chapters.map { it.first.toFloat() / d }.filter { it > 0.01f && it < 0.99f }.toFloatArray() else FloatArray(0)
        seek.set(if (d > 0) p.toFloat() / d else 0f, if (d > 0) player.bufferedPosition.toFloat() / d else 0f)
        curTime.text = fmt(p); remTime.text = "-" + fmt(d - p)
        if (d > 0) endsAt.text = getString(R.string.ends_at) + " " + DateFormat.getTimeFormat(this).format(Date(System.currentTimeMillis() + (d - p)))
    }
    private fun showOverlay(on: Boolean, focusSeek: Boolean = false) {
        overlayOn = on; overlay.visibility = if (on) View.VISIBLE else View.GONE
        view.subtitleView?.setBottomPaddingFraction(if (on) 0.3f else 0.08f)
        if (on) { updateUi(); (if (focusSeek) seek else ppBtn).requestFocus(); resetHide() } else { ui.removeCallbacks(hideRunnable); preview.visibility = View.GONE }
    }
    private fun resetHide() { ui.removeCallbacks(hideRunnable); if (overlayOn) ui.postDelayed(hideRunnable, 5000) }

    /* ---------------- touch (phone / tablet) ---------------- */
    private var gestureMode = 0   // 0 none, 1 brightness, 2 volume, 3 seek, 4 ignored
    private var gesBright = 0f; private var gesVol = 0f; private var gesSeekStart = 0L; private var pinch = 1f

    private fun brightnessNow(): Float {
        val b = window.attributes.screenBrightness
        if (b >= 0) return b
        return runCatching { android.provider.Settings.System.getInt(contentResolver, android.provider.Settings.System.SCREEN_BRIGHTNESS) / 255f }.getOrDefault(.5f)
    }

    /** Left edge: swipe up/down = brightness. Right edge: volume. Anywhere else, swipe sideways = seek. Double tap sides = 10 s, middle = pause. Pinch = fit / fill. */
    private fun setupTouch() {
        val gd = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(e: MotionEvent) = true
            override fun onSingleTapConfirmed(e: MotionEvent): Boolean { showOverlay(!overlayOn); return true }
            override fun onDoubleTap(e: MotionEvent): Boolean {
                val x = e.x / view.width
                when { x < .35f -> jump(-10_000); x > .65f -> jump(10_000); else -> togglePlay() }
                return true
            }
            override fun onScroll(e1: MotionEvent?, e2: MotionEvent, dx: Float, dy: Float): Boolean {
                if (e1 == null) return false
                if (gestureMode == 0) {
                    val w = view.width.toFloat(); val vertical = Math.abs(e2.y - e1.y) > Math.abs(e2.x - e1.x)
                    gestureMode = when {
                        vertical && e1.x < w * .4f -> 1
                        vertical && e1.x > w * .6f -> 2
                        vertical -> 4
                        else -> 3
                    }
                    gesBright = brightnessNow(); gesVol = audio.getStreamVolume(AudioManager.STREAM_MUSIC).toFloat()
                    if (gestureMode == 3) { scrubbing = true; scrubMs = player.currentPosition; gesSeekStart = scrubMs; centerIcon.visibility = View.GONE; if (!overlayOn) showOverlay(true); ui.removeCallbacks(hideRunnable) }
                }
                val h = view.height.toFloat().coerceAtLeast(1f)
                when (gestureMode) {
                    1 -> { gesBright = (gesBright + dy / h * 1.2f).coerceIn(0.02f, 1f); window.attributes = window.attributes.apply { screenBrightness = gesBright }; flash(getString(R.string.brightness) + " " + Math.round(gesBright * 100) + "%") }
                    2 -> { val max = audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC); gesVol = (gesVol + dy / h * max * 1.2f).coerceIn(0f, max.toFloat()); audio.setStreamVolume(AudioManager.STREAM_MUSIC, gesVol.toInt(), 0); flash(getString(R.string.volume) + " " + Math.round(gesVol * 100 / max) + "%") }
                    3 -> { val d = duration(); scrubMs = (gesSeekStart + ((e2.x - e1.x) / view.width * 120_000f).toLong()).coerceIn(0, (d - 1000).coerceAtLeast(0)); updateScrub() }
                }
                return true
            }
        })
        val sg = ScaleGestureDetector(this, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            override fun onScaleBegin(d: ScaleGestureDetector): Boolean { pinch = 1f; return true }
            override fun onScale(d: ScaleGestureDetector): Boolean { pinch *= d.scaleFactor; return true }
            override fun onScaleEnd(d: ScaleGestureDetector) { if (pinch > 1.12f) { setAspect(1) } else if (pinch < 0.88f) { setAspect(0) } }
        })
        view.setOnTouchListener { _, ev ->
            sg.onTouchEvent(ev)
            if (!sg.isInProgress && ev.pointerCount == 1) gd.onTouchEvent(ev)
            if (ev.actionMasked == MotionEvent.ACTION_UP || ev.actionMasked == MotionEvent.ACTION_CANCEL) {
                if (gestureMode == 3) commitScrub()
                gestureMode = 0
            }
            true
        }
    }

    /** Dragging on the timeline: [f] is the position as a fraction, [up] when the finger lifts. */
    private fun touchSeek(f: Float, up: Boolean) {
        if (up) { commitScrub(); return }
        if (!scrubbing) { scrubbing = true; centerIcon.visibility = View.GONE }
        scrubMs = (f * duration()).toLong().coerceIn(0, (duration() - 1000).coerceAtLeast(0))
        updateScrub(); ui.removeCallbacks(commitRunnable); ui.removeCallbacks(hideRunnable)
    }

    /* ---------------- picture in picture ---------------- */
    private fun pipParams(): PictureInPictureParams? {
        if (Build.VERSION.SDK_INT < 26) return null
        val vs = player.videoSize
        val ratio = if (vs.width > 0 && vs.height > 0) Rational(vs.width, vs.height) else Rational(16, 9)
        val clamped = if (ratio.toFloat() > 2.39f) Rational(239, 100) else if (ratio.toFloat() < 0.42f) Rational(42, 100) else ratio
        val b = PictureInPictureParams.Builder().setAspectRatio(clamped)
        if (Build.VERSION.SDK_INT >= 31) b.setAutoEnterEnabled(player.isPlaying)
        return b.build()
    }
    private fun updatePip() { if (phone && Build.VERSION.SDK_INT >= 26 && !isDestroyed) runCatching { pipParams()?.let { setPictureInPictureParams(it) } } }
    private fun enterPip() { if (phone && Build.VERSION.SDK_INT >= 26) runCatching { pipParams()?.let { enterPictureInPictureMode(it) } } }
    override fun onUserLeaveHint() { super.onUserLeaveHint(); if (phone && Build.VERSION.SDK_INT in 26..30 && player.isPlaying) enterPip() }
    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        inPip = isInPictureInPictureMode
        if (inPip) { pipSeen = true; showOverlay(false); centerIcon.visibility = View.GONE; toast.visibility = View.GONE; skipBtn.visibility = View.GONE; hideNextCard() }
    }

    /* ---------------- media session + notification (phone / tablet) ---------------- */
    private fun attachSession() {
        if (!phone) return
        runCatching {
            session = MediaSession.Builder(this, player).setId("cinema-video").build()
            val channel = "cinema_playback"
            val open = PendingIntent.getActivity(this, 0, Intent(this, PlayerActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
            notifier = PlayerNotificationManager.Builder(this, 2002, channel).setChannelNameResourceId(R.string.playback_channel)
                .setMediaDescriptionAdapter(object : PlayerNotificationManager.MediaDescriptionAdapter {
                    override fun getCurrentContentTitle(p: Player): CharSequence = titleView.text
                    override fun createCurrentContentIntent(p: Player): PendingIntent = open
                    override fun getCurrentContentText(p: Player): CharSequence? = subtitleView.text
                    override fun getCurrentLargeIcon(p: Player, cb: PlayerNotificationManager.BitmapCallback): Bitmap? {
                        if (artFor == itemId && artBitmap != null) return artBitmap
                        val id = itemId; val url = "${store.url}/Items/$id/Images/Primary?maxHeight=400"
                        scope.launch { val b = withContext(Dispatchers.IO) { Http.bytes(url, store.authHeader())?.let { BitmapFactory.decodeByteArray(it, 0, it.size) } }; if (b != null) { artBitmap = b; artFor = id; cb.onBitmap(b) } }
                        return null
                    }
                }).build().apply {
                    setSmallIcon(R.drawable.t_play); setUseNextAction(false); setUsePreviousAction(false)
                    setMediaSessionToken(session!!.platformToken); setPlayer(player)
                }
        }.onFailure { Log.w("CinemaPlayer", "media session", it) }
    }
    private fun detachSession() { runCatching { notifier?.setPlayer(null) }; notifier = null; runCatching { session?.release() }; session = null }

    override fun dispatchKeyEvent(e: KeyEvent): Boolean {
        if (e.action != KeyEvent.ACTION_DOWN) return super.dispatchKeyEvent(e)
        val k = e.keyCode
        when (k) {
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, KeyEvent.KEYCODE_HEADSETHOOK -> { togglePlay(); return true }
            KeyEvent.KEYCODE_MEDIA_PLAY -> { player.play(); return true }
            KeyEvent.KEYCODE_MEDIA_PAUSE -> { player.pause(); return true }
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD -> { scrubStep(1, 8); return true }
            KeyEvent.KEYCODE_MEDIA_REWIND -> { scrubStep(-1, 8); return true }
            KeyEvent.KEYCODE_MEDIA_NEXT -> { if (nextItem != null) playNext(); return true }
        }
        if (scrubbing) {
            when (k) {
                KeyEvent.KEYCODE_DPAD_LEFT -> { scrubStep(-1, e.repeatCount); return true }
                KeyEvent.KEYCODE_DPAD_RIGHT -> { scrubStep(1, e.repeatCount); return true }
                KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER, KeyEvent.KEYCODE_DPAD_DOWN -> { commitScrub(); return true }
                KeyEvent.KEYCODE_BACK, KeyEvent.KEYCODE_ESCAPE, KeyEvent.KEYCODE_DPAD_UP -> { cancelScrub(); return true }
            }
        }
        if (skipBtn.visibility == View.VISIBLE && !overlayOn && (k == KeyEvent.KEYCODE_DPAD_CENTER || k == KeyEvent.KEYCODE_ENTER)) { skipSegment(); return true }
        /* up-next card: left / right moves between its buttons, OK presses, back dismisses it */
        if (nextCard.visibility == View.VISIBLE && !overlayOn) {
            when (k) {
                KeyEvent.KEYCODE_BACK, KeyEvent.KEYCODE_ESCAPE -> { dismissNextCard(); return true }
                KeyEvent.KEYCODE_DPAD_LEFT -> { nextGo.requestFocus(); return true }
                KeyEvent.KEYCODE_DPAD_RIGHT -> { nextCancel.requestFocus(); return true }
                KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> { (if (nextCancel.hasFocus()) nextCancel else nextGo).performClick(); return true }
            }
        }
        if (!overlayOn) {
            when (k) {
                KeyEvent.KEYCODE_DPAD_LEFT -> { scrubStep(-1, e.repeatCount); return true }
                KeyEvent.KEYCODE_DPAD_RIGHT -> { scrubStep(1, e.repeatCount); return true }
                KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> { togglePlay(); return true }
                KeyEvent.KEYCODE_DPAD_UP, KeyEvent.KEYCODE_DPAD_DOWN -> { showOverlay(true); return true }
                KeyEvent.KEYCODE_BACK, KeyEvent.KEYCODE_ESCAPE -> { finish(); return true }
            }
        } else {
            resetHide()
            /* from the timeline: up hides the controls, down goes to play / pause */
            if (seek.hasFocus()) {
                if (k == KeyEvent.KEYCODE_DPAD_UP) { showOverlay(false); return true }
                if (k == KeyEvent.KEYCODE_DPAD_DOWN) { ppBtn.requestFocus(); return true }
            }
            if (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_ESCAPE) { showOverlay(false); return true }
        }
        return super.dispatchKeyEvent(e)
    }

    override fun onPause() { super.onPause(); if (scrubbing) commitScrub() }
    override fun onResume() { super.onResume(); pipSeen = false; inPip = false; UiMode.apply(this, rootView, immersive = true) }
    override fun onWindowFocusChanged(hasFocus: Boolean) { super.onWindowFocusChanged(hasFocus); if (hasFocus) UiMode.apply(this, rootView, immersive = true) }
    /** Not visible any more (and not in the small PiP window): stop playing. Closing the PiP window also ends the screen. */
    override fun onStop() {
        super.onStop()
        if (!(Build.VERSION.SDK_INT >= 24 && isInPictureInPictureMode)) { player.pause(); if (pipSeen && !isFinishing) finish() }
    }
    override fun onDestroy() {
        ui.removeCallbacksAndMessages(null)
        runCatching { report("Stopped") }
        scope.cancel(); detachSession(); player.release(); super.onDestroy()
    }
}

/** Seek bar: chapter ticks, grows and shows a knob when focused; left/right is handled by the player as scrubbing. */
class SeekView(ctx: Context) : View(ctx) {
    var onScrub: ((Int, Int) -> Unit)? = null
    var onTouchSeek: ((Float, Boolean) -> Unit)? = null
    override fun onTouchEvent(e: MotionEvent): Boolean {
        val f = (e.x / width.coerceAtLeast(1)).coerceIn(0f, 1f)
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> { parent?.requestDisallowInterceptTouchEvent(true); onTouchSeek?.invoke(f, false) }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> onTouchSeek?.invoke(f, true)
        }
        return true
    }
    var chapters = FloatArray(0)
    private var p = 0f; private var b = 0f
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    fun set(progress: Float, buffered: Float) { p = progress.coerceIn(0f, 1f); b = buffered.coerceIn(0f, 1f); invalidate() }
    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (keyCode == KeyEvent.KEYCODE_DPAD_LEFT) { onScrub?.invoke(-1, event.repeatCount); return true }
        if (keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) { onScrub?.invoke(1, event.repeatCount); return true }
        return super.onKeyDown(keyCode, event)
    }
    override fun onDraw(c: Canvas) {
        val d = resources.displayMetrics.density
        val h = if (isFocused) 10f * d else 6f * d; val cy = height / 2f; val r = h / 2
        paint.color = Color.parseColor("#44FFFFFF"); c.drawRoundRect(0f, cy - r, width.toFloat(), cy + r, r, r, paint)
        paint.color = Color.parseColor("#66FFFFFF"); c.drawRoundRect(0f, cy - r, width * b, cy + r, r, r, paint)
        paint.color = Color.WHITE; c.drawRoundRect(0f, cy - r, width * p, cy + r, r, r, paint)
        paint.color = Color.parseColor("#B0000000"); chapters.forEach { c.drawRect(width * it - d, cy - r, width * it + d, cy + r, paint) }
        if (isFocused) { paint.color = Color.WHITE; c.drawCircle(width * p, cy, h * 1.05f, paint) }
    }
    override fun onFocusChanged(gainFocus: Boolean, direction: Int, previouslyFocusedRect: Rect?) { super.onFocusChanged(gainFocus, direction, previouslyFocusedRect); invalidate() }
}
