package net.dafric.cinematv

import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog
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
import android.view.WindowInsets
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
    private lateinit var osd: LinearLayout; private lateinit var osdIcon: ImageView; private lateinit var osdBar: ProgressBar; private lateinit var osdText: TextView
    private lateinit var fxL: LinearLayout; private lateinit var fxR: LinearLayout; private lateinit var fxLT: TextView; private lateinit var fxRT: TextView
    private lateinit var lockBtn: IconBtn; private lateinit var unlockBtn: IconBtn; private lateinit var episodesBtn: IconBtn
    private var locked = false; private var sleepAt = 0L; private var sleepAtEnd = false; private var maxBitrate = 120_000_000
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

    /** Icon (+ optional label) button that turns white when focused. [style] 0 = filled chip, 1 = plain glyph, 2 = outlined pill; [frac] = icon size relative to [size]. */
    inner class IconBtn(ctx: Context, icon: Int, label: String?, size: Int, round: Boolean, style: Int = 0, frac: Float = 5f / 9f) : LinearLayout(ctx) {
        private val img = ImageView(ctx).apply { setImageResource(icon); setColorFilter(Color.WHITE) }
        private val txt: TextView? = label?.let { TextView(ctx).apply { text = it; textSize = if (style == 2) 14f else 15f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD } }
        private val bgN = GradientDrawable().apply { cornerRadius = dp(size).toFloat(); when (style) { 1 -> setColor(Color.TRANSPARENT); 2 -> { setColor(Color.parseColor("#26FFFFFF")); setStroke(dp(1), Color.parseColor("#66FFFFFF")) }; else -> setColor(Color.parseColor("#33FFFFFF")) } }
        private val bgF = GradientDrawable().apply { cornerRadius = dp(size).toFloat(); setColor(Color.WHITE) }
        init {
            orientation = HORIZONTAL; gravity = Gravity.CENTER; isFocusable = true; isClickable = true
            val isz = (size * frac).toInt()
            addView(img, LayoutParams(dp(isz), dp(isz)))
            txt?.let { addView(it, LayoutParams(-2, -2).apply { leftMargin = dp(10) }) }
            val pad = if (label != null) dp(size / 2 + 4) else dp((size - isz) / 2)
            setPadding(pad, 0, pad, 0)
            background = bgN
            onFocusChangeListener = OnFocusChangeListener { _, f ->
                background = if (f) bgF else bgN; img.setColorFilter(if (f) Color.BLACK else Color.WHITE); txt?.setTextColor(if (f) Color.BLACK else Color.WHITE)
                animate().scaleX(if (f) 1.1f else 1f).scaleY(if (f) 1.1f else 1f).setDuration(120).start()
            }
            if (style != 0) setOnTouchListener { v, e -> when (e.actionMasked) { MotionEvent.ACTION_DOWN -> v.animate().scaleX(.9f).scaleY(.9f).setDuration(80).start(); MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> v.animate().scaleX(1f).scaleY(1f).setDuration(120).start() }; false }
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
        if (phone) maxBitrate = trackPrefs.getInt("maxBitrate", 120_000_000)
        if (phone) requestedOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE   /* the player always opens wide */
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
        /* the phone overlay has its own big play button */
        root.addView(centerIcon, FrameLayout.LayoutParams(if (phone) 0 else dp(110), if (phone) 0 else dp(110), Gravity.CENTER))
        toast = TextView(this).apply { textSize = 26f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; gravity = Gravity.CENTER; visibility = View.GONE
            background = GradientDrawable().apply { cornerRadius = dp(30).toFloat(); setColor(Color.parseColor("#99000000")) }; setPadding(dp(28), dp(12), dp(28), dp(12)) }
        root.addView(toast, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER_HORIZONTAL or Gravity.TOP).apply { topMargin = dp(110) })

        if (phone) buildPhoneOverlay() else {
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

        }

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
        if (phone) buildPhoneExtras(root)
        setContentView(root)
    }

    /* ---------------- phone / tablet overlay ---------------- */
    private fun immersiveFlags() = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION

    private fun buildPhoneOverlay() {
        overlay = FrameLayout(this).apply { visibility = View.GONE }
        overlay.addView(View(this).apply { setBackgroundColor(Color.parseColor("#99000000")) }, FrameLayout.LayoutParams(-1, -1))
        val content = FrameLayout(this); overlay.addView(content, FrameLayout.LayoutParams(-1, -1))
        overlay.setOnApplyWindowInsetsListener { _, ins ->
            if (Build.VERSION.SDK_INT >= 30) {
                val b = ins.getInsets(WindowInsets.Type.systemBars())
                content.setPadding(b.left, b.top, b.right, b.bottom)
            } else @Suppress("DEPRECATION") {
                content.setPadding(ins.stableInsetLeft, ins.stableInsetTop, ins.stableInsetRight, ins.stableInsetBottom)
            }
            ins
        }
        /* top: cast, title, close */
        titleView = TextView(this).apply { textSize = 17f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END; gravity = Gravity.CENTER }
        subtitleView = TextView(this).apply { textSize = 12f; setTextColor(Color.parseColor("#C8C8D0")); maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END; gravity = Gravity.CENTER }
        badges = LinearLayout(this)
        val titles = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER_HORIZONTAL; addView(titleView, LinearLayout.LayoutParams(-1, -2)); addView(subtitleView, LinearLayout.LayoutParams(-1, -2)) }
        val top = FrameLayout(this).apply { setPadding(dp(12), dp(14), dp(12), dp(8)) }
        top.addView(titles, FrameLayout.LayoutParams(-1, -2, Gravity.CENTER).apply { leftMargin = dp(56); rightMargin = dp(56) })
        top.addView(IconBtn(this, R.drawable.t_cast, null, 48, true, 1, .5f).apply { setOnClickListener { openCast() } }, FrameLayout.LayoutParams(dp(48), dp(48), Gravity.START or Gravity.CENTER_VERTICAL))
        top.addView(IconBtn(this, R.drawable.t_close, null, 48, true, 1, .5f).apply { setOnClickListener { finish() } }, FrameLayout.LayoutParams(dp(48), dp(48), Gravity.END or Gravity.CENTER_VERTICAL))
        content.addView(top, FrameLayout.LayoutParams(-1, -2, Gravity.TOP))

        /* middle: back 10, play / pause, forward 10 */
        val back10 = IconBtn(this, R.drawable.t_back10, null, 80, true, 1, .7f).apply { setOnClickListener { jump(-10_000) } }
        ppBtn = IconBtn(this, R.drawable.t_play, null, 96, true, 1, .62f).apply { setOnClickListener { togglePlay() } }
        val fwd10 = IconBtn(this, R.drawable.t_fwd10, null, 80, true, 1, .7f).apply { setOnClickListener { jump(10_000) } }
        val mid = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
        mid.addView(back10, LinearLayout.LayoutParams(dp(80), dp(80)))
        mid.addView(ppBtn, LinearLayout.LayoutParams(dp(96), dp(96)).apply { leftMargin = dp(28); rightMargin = dp(28) })
        mid.addView(fwd10, LinearLayout.LayoutParams(dp(80), dp(80)))
        content.addView(mid, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER))

        /* bottom: red timeline, audio & subtitles, tools */
        seek = SeekView(this).apply { red = true; isFocusable = true; onScrub = { dir, rep -> scrubStep(dir, rep) }; onTouchSeek = { f, up -> touchSeek(f, up) } }
        curTime = TextView(this).apply { textSize = 12f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD }
        timeTotal = trackPrefs.getBoolean("timeTotal", false)
        remTime = TextView(this).apply { textSize = 12f; setTextColor(Color.WHITE); setOnClickListener { timeTotal = !timeTotal; trackPrefs.edit().putBoolean("timeTotal", timeTotal).apply(); updateUi() } }   /* tap: remaining time or total length */
        endsAt = TextView(this)
        val bar = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        bar.addView(curTime, LinearLayout.LayoutParams(-2, -2)); bar.addView(seek, LinearLayout.LayoutParams(0, dp(34), 1f).apply { leftMargin = dp(10); rightMargin = dp(10) }); bar.addView(remTime, LinearLayout.LayoutParams(-2, -2))
        audioBtn = IconBtn(this, R.drawable.t_subs, getString(R.string.audio_subs), 40, false, 2).apply { setOnClickListener { chooseAudioSubs() } }
        subsBtn = IconBtn(this, R.drawable.t_subs, null, 40, false)
        lockBtn = IconBtn(this, R.drawable.t_lock, null, 44, true, 1, .5f).apply { setOnClickListener { setLocked(true) } }
        speedBtn = IconBtn(this, R.drawable.t_speed, null, 44, true, 1, .5f).apply { setOnClickListener { chooseSpeed() } }
        aspectBtn = IconBtn(this, R.drawable.t_aspect, null, 44, true, 1, .5f).apply { setOnClickListener { cycleAspect() } }
        episodesBtn = IconBtn(this, R.drawable.t_list, null, 44, true, 1, .5f).apply { visibility = View.GONE; setOnClickListener { showEpisodes() } }
        nextBtn = IconBtn(this, R.drawable.t_next, null, 44, true, 1, .5f).apply { visibility = View.GONE; setOnClickListener { playNext() } }
        pipBtn = if (Build.VERSION.SDK_INT >= 26 && packageManager.hasSystemFeature(android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE)) IconBtn(this, R.drawable.t_pip, null, 40, true, 1, .55f).apply { setOnClickListener { enterPip() } } else null
        moreBtn = IconBtn(this, R.drawable.t_more, null, 40, true, 1, .55f).apply { setOnClickListener { showMore() } }
        for (b in listOf(lockBtn, speedBtn, aspectBtn, episodesBtn, nextBtn)) { b.minimumHeight = dp(40) }
        phoneBottom = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(20), 0, dp(20), dp(14)) }
        phoneBottom.addView(bar, LinearLayout.LayoutParams(-1, -2))
        phoneRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        phoneBottom.addView(phoneRow, LinearLayout.LayoutParams(-1, -2))
        content.addView(phoneBottom, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))
        phoneTop = top
        arrangePhoneBottom()
    }

    private var timeTotal = false
    private lateinit var phoneBottom: LinearLayout; private lateinit var phoneRow: LinearLayout; private lateinit var phoneTop: View
    private var pipBtn: IconBtn? = null; private lateinit var moreBtn: IconBtn
    private var arrangedLand: Boolean? = null

    /** One row in landscape (lock | audio & subtitles | tools); in portrait the audio button gets its own line above the tools. */
    private fun arrangePhoneBottom() {
        val dm = resources.displayMetrics; val land = dm.widthPixels > dm.heightPixels
        if (arrangedLand == land) return; arrangedLand = land
        val all = listOf<View?>(lockBtn, audioBtn, speedBtn, aspectBtn, episodesBtn, nextBtn, pipBtn, moreBtn)
        all.filterNotNull().forEach { (it.parent as? android.view.ViewGroup)?.removeView(it) }
        phoneRow.removeAllViews()
        fun cell(v: View, w: Int = -2) = phoneRow.addView(v, LinearLayout.LayoutParams(w, dp(40)))
        fun gap() = phoneRow.addView(Space(this), LinearLayout.LayoutParams(0, 1, 1f))
        if (land) {
            phoneRow.orientation = LinearLayout.HORIZONTAL
            cell(lockBtn, dp(40)); gap(); cell(audioBtn); phoneRow.addView(Space(this), LinearLayout.LayoutParams(dp(10), 1))
            listOf<View?>(speedBtn, aspectBtn, episodesBtn, nextBtn, pipBtn, moreBtn).filterNotNull().forEach { cell(it, dp(40)) }
        } else {
            phoneBottom.addView(audioBtn, 1, LinearLayout.LayoutParams(-2, dp(40)).apply { gravity = Gravity.CENTER_HORIZONTAL })
            phoneRow.orientation = LinearLayout.HORIZONTAL
            val tools = listOf<View?>(lockBtn, speedBtn, aspectBtn, episodesBtn, nextBtn, pipBtn, moreBtn).filterNotNull()
            tools.forEach { phoneRow.addView(it, LinearLayout.LayoutParams(0, dp(40), 1f)) }
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (phone && ::phoneBottom.isInitialized) arrangePhoneBottom()
    }

    /** Brightness / volume indicator, double-tap seek hints and the unlock button of the phone player. */
    private fun buildPhoneExtras(root: FrameLayout) {
        osdIcon = ImageView(this).apply { setColorFilter(Color.WHITE) }
        osdBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply { max = 100; progressTintList = android.content.res.ColorStateList.valueOf(Color.WHITE); progressBackgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#55FFFFFF")) }
        osdText = TextView(this).apply { textSize = 14f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; minWidth = dp(44); gravity = Gravity.END }
        osd = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL; visibility = View.GONE; setPadding(dp(16), dp(10), dp(16), dp(10))
            background = GradientDrawable().apply { cornerRadius = dp(30).toFloat(); setColor(Color.parseColor("#B3000000")) }
            addView(osdIcon, LinearLayout.LayoutParams(dp(22), dp(22))); addView(osdBar, LinearLayout.LayoutParams(dp(130), dp(6)).apply { leftMargin = dp(12); rightMargin = dp(12) }); addView(osdText) }
        root.addView(osd, FrameLayout.LayoutParams(-2, -2, Gravity.CENTER_HORIZONTAL or Gravity.TOP).apply { topMargin = dp(96) })
        fun fx(left: Boolean, icon: Int): Pair<LinearLayout, TextView> {
            val t = TextView(this).apply { textSize = 15f; setTextColor(Color.WHITE); typeface = Typeface.DEFAULT_BOLD; gravity = Gravity.CENTER }
            val l = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER; visibility = View.GONE; alpha = 0f
                /* the tapped half of the screen lights up, rounded on the side towards the middle (like YouTube) */
                val rr = dp(220).toFloat()
                /* the system's own touch ripple, clipped to this half */
                val mask = GradientDrawable().apply { shape = GradientDrawable.RECTANGLE; setColor(Color.WHITE); cornerRadii = if (left) floatArrayOf(0f, 0f, rr, rr, rr, rr, 0f, 0f) else floatArrayOf(rr, rr, 0f, 0f, 0f, 0f, rr, rr) }
                background = android.graphics.drawable.RippleDrawable(android.content.res.ColorStateList.valueOf(Color.parseColor("#66FFFFFF")), null, mask).apply { radius = dp(420) }
                addView(ImageView(this@PlayerActivity).apply { setImageResource(icon); setColorFilter(Color.WHITE) }, LinearLayout.LayoutParams(dp(40), dp(40))); addView(t) }
            root.addView(l, FrameLayout.LayoutParams(resources.displayMetrics.widthPixels / 2, -1, if (left) Gravity.START else Gravity.END))
            return l to t
        }
        fx(true, R.drawable.t_back10).let { fxL = it.first; fxLT = it.second }; fx(false, R.drawable.t_fwd10).let { fxR = it.first; fxRT = it.second }
        unlockBtn = IconBtn(this, R.drawable.t_unlock, getString(R.string.unlock), 48, false).apply { visibility = View.GONE; setOnClickListener { setLocked(false) } }
        root.addView(unlockBtn, FrameLayout.LayoutParams(-2, dp(48), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL).apply { bottomMargin = dp(40) })
    }

    private val hideOsd = Runnable { if (::osd.isInitialized) osd.visibility = View.GONE }
    private fun showOsd(icon: Int, frac: Float, text: String) { osdIcon.setImageResource(icon); osdBar.progress = (frac * 100).toInt(); osdText.text = text; osd.visibility = View.VISIBLE; ui.removeCallbacks(hideOsd); ui.postDelayed(hideOsd, 900) }

    private fun showFx(left: Boolean, secs: Int) {
        val v = if (left) fxL else fxR; (if (left) fxLT else fxRT).text = (if (left) "−" else "+") + secs + " s"
        (if (left) fxR else fxL).let { it.animate().cancel(); it.visibility = View.GONE }
        v.animate().cancel(); v.visibility = View.VISIBLE; v.alpha = 1f
        /* every tap starts a new ripple where the finger is; the label just stays and counts up */
        val hx = if (left) tapX else tapX - view.width / 2f
        v.background?.setHotspot(hx.coerceAtLeast(0f), tapY)
        v.isPressed = true; ui.postDelayed({ v.isPressed = false }, 120)
        v.animate().alpha(0f).setStartDelay(650).setDuration(220).withEndAction { v.visibility = View.GONE }.start()
    }

    private val hideUnlock = Runnable { if (::unlockBtn.isInitialized) unlockBtn.visibility = View.GONE }
    private fun showUnlock() { unlockBtn.visibility = View.VISIBLE; ui.removeCallbacks(hideUnlock); ui.postDelayed(hideUnlock, 3000) }
    private fun setLocked(on: Boolean) {
        locked = on
        if (on) { showOverlay(false); flash(getString(R.string.locked)); showUnlock() }
        else { ui.removeCallbacks(hideUnlock); unlockBtn.visibility = View.GONE; showOverlay(true) }
    }

    private fun openCast() {
        val ok = runCatching { startActivity(Intent(android.provider.Settings.ACTION_CAST_SETTINGS)) }.isSuccess
        if (!ok) runCatching { startActivity(Intent(android.provider.Settings.ACTION_WIRELESS_SETTINGS)) }.onFailure { flash(getString(R.string.cast_unavailable)) }
    }

    private fun showDlg(dlg: Dialog) {
        dlg.window?.setBackgroundDrawable(GradientDrawable().apply { cornerRadius = dp(22).toFloat(); setColor(Color.parseColor("#1C1C21")) })
        dlg.window?.setFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE)
        dlg.setOnDismissListener { resetHide() }
        dlg.show()
        dlg.window?.decorView?.systemUiVisibility = immersiveFlags(); dlg.window?.clearFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE)
        (dlg as? AlertDialog)?.listView?.requestFocus()
        ui.removeCallbacks(hideRunnable)
    }

    private fun pickDialog(title: String, names: List<String>, checked: Int, onPick: (Int) -> Unit) {
        val dlg = AlertDialog.Builder(this, R.style.Dialog_Cinema).setTitle(title)
            .setSingleChoiceItems(names.toTypedArray(), checked) { d, w -> d.dismiss(); onPick(w) }.create()
        showDlg(dlg); if (checked > 0) dlg.listView?.setSelection(checked)
    }

    /** Audio and subtitle choice in one dialog: two lists side by side (landscape) or one above the other (portrait). */
    private fun chooseAudioSubs() {
        val a = trackOpts(C.TRACK_TYPE_AUDIO); val t = trackOpts(C.TRACK_TYPE_TEXT)
        if (a.names.isEmpty() && t.names.size <= 1) { flash(getString(R.string.none_available)); return }
        val dm = resources.displayMetrics; val land = dm.widthPixels > dm.heightPixels
        val box = LinearLayout(this).apply { orientation = if (land) LinearLayout.HORIZONTAL else LinearLayout.VERTICAL; setPadding(dp(8), dp(12), dp(8), dp(12)) }
        fun col(title: String, o: Opts): View {
            val c = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
            c.addView(TextView(this).apply { text = title.uppercase(); textSize = 12f; setTextColor(Color.parseColor("#9A9AA2")); typeface = Typeface.DEFAULT_BOLD; setPadding(dp(16), dp(6), dp(16), dp(6)) })
            val list = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
            fun render() {
                list.removeAllViews()
                o.names.forEachIndexed { i, n ->
                    list.addView(TextView(this@PlayerActivity).apply {
                        text = (if (i == o.checked) "✓  " else "     ") + n; textSize = 15f; setPadding(dp(16), dp(12), dp(16), dp(12)); isClickable = true
                        setTextColor(if (i == o.checked) Color.WHITE else Color.parseColor("#C8C8D0")); typeface = if (i == o.checked) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
                        setOnClickListener { o.acts[i](); o.checked = i; render() }
                    }, LinearLayout.LayoutParams(-1, -2))
                }
            }
            render()
            if (land) c.addView(ScrollView(this).apply { addView(list) }, LinearLayout.LayoutParams(-1, 0, 1f)) else c.addView(list, LinearLayout.LayoutParams(-1, -2))
            return c
        }
        if (a.names.isNotEmpty()) box.addView(col(getString(R.string.audio), a), LinearLayout.LayoutParams(if (land) 0 else -1, if (land) -1 else -2, 1f).apply { if (!land) weight = 0f })
        if (t.names.size > 1) box.addView(col(getString(R.string.subtitles), t), LinearLayout.LayoutParams(if (land) 0 else -1, if (land) -1 else -2, 1f).apply { if (!land) weight = 0f })
        val dlg = Dialog(this, android.R.style.Theme_Material_Dialog_NoActionBar)
        dlg.setContentView(if (land) box else ScrollView(this).apply { addView(box) })
        showDlg(dlg)
        dlg.window?.setLayout(minOf((dm.widthPixels * .92f).toInt(), dp(if (land) 720 else 480)), if (land) (dm.heightPixels * .8f).toInt() else -2)
    }

    private fun showMore() {
        val items = ArrayList<Pair<String, () -> Unit>>()
        items.add(getString(R.string.sleep_timer) + (if (sleepAtEnd) " · " + getString(R.string.sleep_end) else if (sleepAt > 0) " · " + ((sleepAt - System.currentTimeMillis()) / 60000 + 1) + " min" else "") to { chooseSleep() })
        items.add(getString(R.string.quality) + " · " + qualityName() to { chooseQuality() })
        if (chapters.isNotEmpty()) items.add(getString(R.string.chapters) to { chooseChapter() })
        if (item.optString("Type") == "Episode") items.add(getString(R.string.episodes) to { showEpisodes() })
        items.add(getString(R.string.speed) to { chooseSpeed() })
        items.add(getString(R.string.aspect) to { cycleAspect() })
        val dlg = AlertDialog.Builder(this, R.style.Dialog_Cinema).setItems(items.map { it.first }.toTypedArray()) { d, w -> d.dismiss(); items[w].second() }.create()
        showDlg(dlg)
    }

    private fun chooseSleep() {
        val mins = intArrayOf(0, 15, 30, 45, 60, 90, -1)
        val names = listOf(getString(R.string.off), "15 min", "30 min", "45 min", "60 min", "90 min", getString(R.string.sleep_end))
        pickDialog(getString(R.string.sleep_timer), names, if (sleepAtEnd) 6 else 0) { w -> setSleep(mins[w]) }
    }
    private val sleepRunnable = Runnable { sleepAt = 0; player.pause(); flash(getString(R.string.sleep_fired)) }
    private fun setSleep(min: Int) {
        ui.removeCallbacks(sleepRunnable); sleepAtEnd = false; sleepAt = 0
        when {
            min > 0 -> { sleepAt = System.currentTimeMillis() + min * 60_000L; ui.postDelayed(sleepRunnable, min * 60_000L); flash(getString(R.string.sleep_set, min)) }
            min < 0 -> { sleepAtEnd = true; hideNextCard(); flash(getString(R.string.sleep_end)) }
            else -> flash(getString(R.string.off))
        }
    }

    private val qualityMbit = intArrayOf(0, 20, 8, 4, 2, 1)
    private fun qualityIndex() = qualityMbit.indexOf(if (maxBitrate >= 120_000_000) 0 else maxBitrate / 1_000_000).let { if (it < 0) 0 else it }
    private fun qualityName() = if (qualityIndex() == 0) getString(R.string.quality_auto) else qualityMbit[qualityIndex()].toString() + " Mbit/s"
    private fun chooseQuality() {
        if (offlineLocal) { flash(getString(R.string.none_available)); return }
        val names = qualityMbit.mapIndexed { i, v -> if (i == 0) getString(R.string.quality_auto) else "$v Mbit/s" }
        pickDialog(getString(R.string.quality), names, qualityIndex()) { w ->
            maxBitrate = if (qualityMbit[w] == 0) 120_000_000 else qualityMbit[w] * 1_000_000
            trackPrefs.edit().putInt("maxBitrate", maxBitrate).apply()
            val pos = player.currentPosition; flash(qualityName()); scope.launch { startStream(forceTranscode = maxBitrate < 120_000_000, resumeMs = pos) }
        }
    }

    private fun chooseChapter() {
        val cur = chapters.indexOfLast { it.first <= player.currentPosition }.coerceAtLeast(0)
        pickDialog(getString(R.string.chapters), chapters.map { fmt(it.first) + "   " + it.second }, cur) { w -> player.seekTo(chapters[w].first); updateUi() }
    }

    private fun showEpisodes() {
        val sid = item.optString("SeriesId"); if (sid.isEmpty()) return
        val season = item.optString("SeasonId")
        scope.launch {
            val r = withContext(Dispatchers.IO) { runCatching { Http.request("GET", "${store.url}/Shows/$sid/Episodes?userId=${store.userId}" + (if (season.isNotEmpty()) "&seasonId=$season" else ""), store.authHeader()) }.getOrNull() }
            val arr = r?.takeIf { it.ok }?.json()?.optJSONArray("Items")
            if (arr == null || arr.length() == 0) { flash(getString(R.string.none_available)); return@launch }
            val eps = (0 until arr.length()).map { arr.getJSONObject(it) }
            val cur = eps.indexOfFirst { it.optString("Id") == itemId }
            pickDialog(item.optString("SeasonName").ifEmpty { getString(R.string.episodes) }, eps.map { (if (it.optInt("IndexNumber") > 0) it.optInt("IndexNumber").toString() + ". " else "") + it.optString("Name") }, cur) { w ->
                if (eps[w].optString("Id") != itemId) playEpisode(eps[w].getString("Id"))
            }
        }
    }

    private var softDecoders = false; private var uiLoop = false; private var netRetries = 0
    /** A clear message with a way out instead of a toast and a closed screen. */
    private fun fail(code: String, resume: Long) {
        if (isFinishing || isDestroyed) return
        runCatching {
            android.app.AlertDialog.Builder(this).setTitle(getString(R.string.play_failed)).setMessage(code).setCancelable(false)
                .setPositiveButton(R.string.retry) { _, _ -> netRetries = 0; scope.launch { startStream(forceTranscode = true, resumeMs = resume) } }
                .setNegativeButton(R.string.close) { _, _ -> finish() }.show()
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
                if (state == Player.STATE_ENDED) { if (nextItem != null && !ncDismiss && !sleepAtEnd) playNext() else finish() }
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
                if (net && netRetries < 3) { netRetries++; val pos = player.currentPosition; flash(getString(R.string.reconnecting, netRetries)); ui.postDelayed({ scope.launch { startStream(forceTranscode = method == "Transcode", resumeMs = pos) } }, 2000L * netRetries); return }
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
        return JSONObject().put("Name", "Cinema TV").put("MaxStreamingBitrate", maxBitrate).put("MaxStaticBitrate", 200_000_000).put("DirectPlayProfiles", direct).put("TranscodingProfiles", trans).put("SubtitleProfiles", subs).put("CodecProfiles", JSONArray())
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
            if (phone) { episodesBtn.visibility = View.GONE; nextBtn.visibility = View.GONE }
            startStream(false, startTicks / 10_000); return
        }
        item = r.json()
        val isEp = item.optString("Type") == "Episode"
        titleView.text = if (isEp) item.optString("SeriesName") else item.optString("Name")
        subtitleView.text = if (isEp) "S${item.optInt("ParentIndexNumber")}:E${item.optInt("IndexNumber")} · ${item.optString("Name")}" else listOf(item.optInt("ProductionYear").takeIf { it > 0 }?.toString(), item.optString("OfficialRating").ifEmpty { null }).filterNotNull().joinToString(" · ")
        chapters = item.optJSONArray("Chapters")?.let { a -> (0 until a.length()).map { a.getJSONObject(it) }.map { (it.optLong("StartPositionTicks") / 10_000) to it.optString("Name") } } ?: emptyList()
        notifier?.invalidate()
        if (phone) episodesBtn.visibility = if (isEp) View.VISIBLE else View.GONE
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

    /** [maxBitrate] below the server limit (chosen streaming quality) always means a transcode. */
    private suspend fun startStream(forceTranscode: Boolean, resumeMs: Long) = startStreamImpl(forceTranscode || maxBitrate < 120_000_000, resumeMs)
    private suspend fun startStreamImpl(forceTranscode: Boolean, resumeMs: Long) {
        if (offlineLocal) { startLocal(resumeMs); return }
        val body = JSONObject().put("DeviceProfile", deviceProfile()).toString()
        var q = "UserId=${store.userId}&StartTimeTicks=${resumeMs * 10_000}&MaxStreamingBitrate=$maxBitrate&AutoOpenLiveStream=true" + if (forceTranscode) "&EnableDirectPlay=false&EnableDirectStream=false" else ""
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
        /* the HLS playlist covers the whole film: resume there as well (a transcode used to restart at 0) */
        player.setMediaItem(builder.build(), resumeMs)
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
        val speeds = floatArrayOf(.5f, .75f, 1f, 1.25f, 1.5f, 1.75f, 2f); val names = arrayOf("0.5×", "0.75×", "1×", "1.25×", "1.5×", "1.75×", "2×")
        val checked = speeds.indexOfFirst { it == player.playbackParameters.speed }.let { if (it < 0) 2 else it }
        val dlg = AlertDialog.Builder(this, android.R.style.Theme_Material_Dialog_Alert).setTitle(R.string.speed)
            .setSingleChoiceItems(names, checked) { d, w -> player.setPlaybackSpeed(speeds[w]); speedBtn.setLabel(names[w]); if (phone) flash(names[w]); d.dismiss(); resetHide() }.create()
        dlg.window?.setBackgroundDrawable(GradientDrawable().apply { cornerRadius = dp(22).toFloat(); setColor(Color.parseColor("#1C1C21")) })
        dlg.show(); dlg.listView?.requestFocus()
    }

    private class Opts(val names: ArrayList<String>, val acts: ArrayList<() -> Unit>, var checked: Int)
    private fun trackOpts(type: Int): Opts {
        val groups = player.currentTracks.groups.filter { it.type == type }
        val names = ArrayList<String>(); val actions = ArrayList<() -> Unit>(); var checked = 0
        if (type == C.TRACK_TYPE_TEXT) { names.add(getString(R.string.off)); actions.add { player.trackSelectionParameters = player.trackSelectionParameters.buildUpon().setTrackTypeDisabled(C.TRACK_TYPE_TEXT, true).build(); rememberTrack(type, null) } }
        groups.forEach { g -> for (i in 0 until g.length) { if (g.isTrackSelected(i)) checked = names.size; names.add(trackLabel(g.getTrackFormat(i), type, names.size)); actions.add { selectGroup(g, i); rememberTrack(type, g.getTrackFormat(i)) } } }
        if (type == C.TRACK_TYPE_TEXT && player.trackSelectionParameters.disabledTrackTypes.contains(C.TRACK_TYPE_TEXT)) checked = 0
        return Opts(names, actions, checked)
    }

    private fun chooseTrack(type: Int) {
        val o = trackOpts(type)
        if (o.names.isEmpty() || (type == C.TRACK_TYPE_TEXT && o.names.size == 1)) { flash(getString(R.string.none_available)); return }
        val dlg = AlertDialog.Builder(this, android.R.style.Theme_Material_Dialog_Alert).setTitle(if (type == C.TRACK_TYPE_AUDIO) R.string.audio else R.string.subtitles)
            .setSingleChoiceItems(o.names.toTypedArray(), o.checked) { d, w -> o.acts[w](); d.dismiss(); resetHide() }.create()
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

    private fun playNext() { val n = nextItem ?: return; playEpisode(n.getString("Id")) }
    private fun playEpisode(id: String) { hideNextCard(); report("Stopped"); scope.launch { player.stop(); start(id, 0) } }

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
        if (n == null || ncDismiss || d <= 0 || offlineLocal || sleepAtEnd) { hideNextCard(); return }
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
        seek.set(frac, player.bufferedPosition.toFloat() / (if (d > 0) d else 1)); setTimes(scrubMs, d)
        previewTime.text = fmt(scrubMs); previewChap.text = chapters.lastOrNull { it.first <= scrubMs }?.second ?: ""
        val W = resources.displayMetrics.widthPixels; val cw = dp(220)
        val loc = IntArray(2); seek.getLocationInWindow(loc); val barL = if (seek.width > 0) loc[0] else dp(44); val barW = if (seek.width > 0) seek.width else W - dp(88)
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
    private fun setTimes(p: Long, d: Long) {
        curTime.text = fmt(p)
        remTime.text = if (phone && timeTotal) fmt(d) else "-" + fmt(d - p)
    }
    private fun updateUi() {
        if (scrubbing) return
        val d = duration(); val p = player.currentPosition
        seek.chapters = if (d > 0) chapters.map { it.first.toFloat() / d }.filter { it > 0.01f && it < 0.99f }.toFloatArray() else FloatArray(0)
        seek.set(if (d > 0) p.toFloat() / d else 0f, if (d > 0) player.bufferedPosition.toFloat() / d else 0f)
        setTimes(p, d)
        if (d > 0) endsAt.text = getString(R.string.ends_at) + " " + DateFormat.getTimeFormat(this).format(Date(System.currentTimeMillis() + (d - p)))
    }
    private fun showOverlay(on: Boolean, focusSeek: Boolean = false) {
        overlayOn = on; overlay.visibility = if (on) View.VISIBLE else View.GONE
        view.subtitleView?.setBottomPaddingFraction(if (on) 0.3f else 0.08f)
        if (phone) {
            (skipBtn.layoutParams as FrameLayout.LayoutParams).bottomMargin = dp(if (on) 170 else 40); skipBtn.requestLayout()
            (nextCard.layoutParams as FrameLayout.LayoutParams).bottomMargin = dp(if (on) 170 else 24); nextCard.requestLayout()
            (preview.layoutParams as FrameLayout.LayoutParams).bottomMargin = dp(140)
        }
        if (on) { updateUi(); (if (focusSeek) seek else ppBtn).requestFocus(); resetHide() } else { ui.removeCallbacks(hideRunnable); preview.visibility = View.GONE }
    }
    private fun resetHide() { ui.removeCallbacks(hideRunnable); if (overlayOn) ui.postDelayed(hideRunnable, if (phone) 4000 else 5000) }

    /* ---------------- touch (phone / tablet) ---------------- */
    private var gestureMode = 0   // 0 none, 1 brightness, 2 volume, 3 seek, 4 ignored
    private var gesBright = 0f; private var gesVol = 0f; private var gesSeekStart = 0L; private var pinch = 1f
    private var tapX = 0f; private var tapY = 0f
    private var multiUntil = 0L; private var multiSecs = 0; private var multiLeft = false; private var swallowUntil = 0L

    private fun brightnessNow(): Float {
        val b = window.attributes.screenBrightness
        if (b >= 0) return b
        return runCatching { android.provider.Settings.System.getInt(contentResolver, android.provider.Settings.System.SCREEN_BRIGHTNESS) / 255f }.getOrDefault(.5f)
    }

    /** Double tap (or quick further taps) on the left / right third: 10 s back / forward, adding up while the taps continue. */
    private fun sideJump(left: Boolean) {
        val now = System.currentTimeMillis()
        multiSecs = if (now < multiUntil && multiLeft == left) multiSecs + 10 else 10
        multiLeft = left; multiUntil = now + 700; swallowUntil = now + 450
        val d = duration().takeIf { it > 0 } ?: Long.MAX_VALUE
        player.seekTo((player.currentPosition + (if (left) -10_000L else 10_000L)).coerceIn(0, d - 500))
        showFx(left, multiSecs); updateUi(); resetHide()
    }
    private fun zoneOf(e: MotionEvent): Int { val x = e.x / view.width.coerceAtLeast(1); return when { x < .35f -> -1; x > .65f -> 1; else -> 0 } }

    /** Tap = show / hide the controls. Double tap sides = 10 s, middle = pause. Left edge swipe up/down = brightness, right edge = volume, anywhere else swipe sideways = seek. Pinch = fit / fill. */
    private fun setupTouch() {
        val gd = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(e: MotionEvent): Boolean { tapX = e.x; tapY = e.y; return true }
            override fun onSingleTapUp(e: MotionEvent): Boolean {
                if (locked) return false
                val z = zoneOf(e)
                if (z != 0 && System.currentTimeMillis() < multiUntil) { sideJump(z < 0); return true }
                return false
            }
            override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
                if (System.currentTimeMillis() < swallowUntil) return true
                if (locked) showUnlock() else showOverlay(!overlayOn)
                return true
            }
            override fun onDoubleTap(e: MotionEvent): Boolean {
                if (locked) return true
                when (zoneOf(e)) { -1 -> sideJump(true); 1 -> sideJump(false); else -> { swallowUntil = System.currentTimeMillis() + 450; togglePlay() } }
                return true
            }
            override fun onScroll(e1: MotionEvent?, e2: MotionEvent, dx: Float, dy: Float): Boolean {
                if (e1 == null || locked) return false
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
                    1 -> { gesBright = (gesBright + dy / h * 1.2f).coerceIn(0.02f, 1f); window.attributes = window.attributes.apply { screenBrightness = gesBright }; showOsd(R.drawable.t_bright, gesBright, Math.round(gesBright * 100).toString() + "%") }
                    2 -> { val max = audio.getStreamMaxVolume(AudioManager.STREAM_MUSIC); gesVol = (gesVol + dy / h * max * 1.2f).coerceIn(0f, max.toFloat()); audio.setStreamVolume(AudioManager.STREAM_MUSIC, gesVol.toInt(), 0); showOsd(R.drawable.t_vol, gesVol / max, Math.round(gesVol * 100 / max).toString() + "%") }
                    3 -> { val d = duration(); scrubMs = (gesSeekStart + ((e2.x - e1.x) / view.width * 120_000f).toLong()).coerceIn(0, (d - 1000).coerceAtLeast(0)); updateScrub() }
                }
                return true
            }
        })
        val sg = ScaleGestureDetector(this, object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            override fun onScaleBegin(d: ScaleGestureDetector): Boolean { pinch = 1f; return !locked }
            override fun onScale(d: ScaleGestureDetector): Boolean { pinch *= d.scaleFactor; return true }
            override fun onScaleEnd(d: ScaleGestureDetector) { if (pinch > 1.12f) { setAspect(1) } else if (pinch < 0.88f) { setAspect(0) } }
        })
        view.setOnTouchListener { _, ev ->
            if (!locked) sg.onTouchEvent(ev)
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
        if (inPip) { pipSeen = true; showOverlay(false); if (phone) { osd.visibility = View.GONE; unlockBtn.visibility = View.GONE }; centerIcon.visibility = View.GONE; toast.visibility = View.GONE; skipBtn.visibility = View.GONE; hideNextCard() }
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
        if (phone && (k == KeyEvent.KEYCODE_BACK || k == KeyEvent.KEYCODE_ESCAPE)) {
            if (locked) { showUnlock(); return true }
            if (scrubbing) { cancelScrub(); return true }
            finish(); return true
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
    private var touching = false
    var onTouchSeek: ((Float, Boolean) -> Unit)? = null
    override fun onTouchEvent(e: MotionEvent): Boolean {
        val pad = if (red) 16f * resources.displayMetrics.density else 0f
        val f = ((e.x - pad) / (width - 2 * pad).coerceAtLeast(1f)).coerceIn(0f, 1f)
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_MOVE -> { touching = true; parent?.requestDisallowInterceptTouchEvent(true); onTouchSeek?.invoke(f, false) }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> { touching = false; invalidate(); onTouchSeek?.invoke(f, true) }
        }
        return true
    }
    var chapters = FloatArray(0)
    /** Phone look: red progress bar, the red knob is always there. */
    var red = false
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
        /* red phone bar: room at both ends for the knob, so it is never cut off */
        val pad = if (red) 16f * d else 0f; val x0 = pad; val w = width - 2 * pad
        paint.color = Color.parseColor("#44FFFFFF"); c.drawRoundRect(x0, cy - r, x0 + w, cy + r, r, r, paint)
        paint.color = Color.parseColor("#66FFFFFF"); c.drawRoundRect(x0, cy - r, x0 + w * b, cy + r, r, r, paint)
        paint.color = if (red) Color.parseColor("#E5252A") else Color.WHITE; c.drawRoundRect(x0, cy - r, x0 + w * p, cy + r, r, r, paint)
        paint.color = Color.parseColor("#B0000000"); chapters.forEach { c.drawRect(x0 + w * it - d, cy - r, x0 + w * it + d, cy + r, paint) }
        if (red) { paint.color = Color.parseColor("#E5252A"); c.drawCircle(x0 + w * p, cy, h * (if (touching) 2.4f else 1.9f), paint) }
        else if (isFocused) { paint.color = Color.WHITE; c.drawCircle(width * p, cy, h * 1.05f, paint) }
    }
    override fun onFocusChanged(gainFocus: Boolean, direction: Int, previouslyFocusedRect: Rect?) { super.onFocusChanged(gainFocus, direction, previouslyFocusedRect); invalidate() }
}
