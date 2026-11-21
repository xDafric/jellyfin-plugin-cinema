package net.dafric.cinematv

import android.app.Activity
import android.app.UiModeManager
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.WindowInsets
import android.view.WindowManager

/** One APK, two interfaces: television (remote, D-pad, 1280 px wide web UI) or phone/tablet (touch, normal responsive web UI). */
object UiMode {
    @Volatile private var cached: Boolean? = null

    fun isTv(ctx: Context): Boolean = cached ?: run {
        val m = ctx.applicationContext.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
        val tv = m?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION ||
            ctx.packageManager.hasSystemFeature("android.software.leanback") && !ctx.packageManager.hasSystemFeature("android.hardware.touchscreen")
        cached = tv; tv
    }

    const val TV_IMMERSIVE = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE

    /** Sets orientation and system bars for the mode. [root] receives the insets as padding on phones (edge-to-edge); [immersive] hides the bars (player). */
    fun apply(a: Activity, root: View? = null, immersive: Boolean = false, onInsets: ((top: Int, right: Int, bottom: Int, left: Int) -> Unit)? = null) {
        val w = a.window
        if (isTv(a)) {
            a.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
            w.decorView.systemUiVisibility = TV_IMMERSIVE
            return
        }
        w.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        w.statusBarColor = Color.TRANSPARENT; w.navigationBarColor = Color.TRANSPARENT
        /* the picture and the page run under the camera cut-out and the system bars; the page gets the insets as CSS variables (--sat etc.) */
        if (Build.VERSION.SDK_INT >= 30) w.attributes = w.attributes.apply { layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS }
        else if (Build.VERSION.SDK_INT >= 28) w.attributes = w.attributes.apply { layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES }
        if (Build.VERSION.SDK_INT >= 30) w.setDecorFitsSystemWindows(false)
        var f = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        if (immersive) f = f or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        w.decorView.systemUiVisibility = f
        root?.setOnApplyWindowInsetsListener { v, ins ->
            if (immersive) { v.setPadding(0, 0, 0, 0); return@setOnApplyWindowInsetsListener ins }
            /* edge to edge: the root only makes room for the keyboard, the page itself pads for the bars and the cut-out */
            var t: Int; var r: Int; var bt: Int; var l: Int; var ime = 0
            if (Build.VERSION.SDK_INT >= 30) {
                val b = ins.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout())
                ime = ins.getInsets(WindowInsets.Type.ime()).bottom
                t = b.top; r = b.right; bt = b.bottom; l = b.left
            } else @Suppress("DEPRECATION") {
                t = ins.systemWindowInsetTop; r = ins.systemWindowInsetRight; l = ins.systemWindowInsetLeft; bt = ins.stableInsetBottom
                if (ins.systemWindowInsetBottom > ins.stableInsetBottom) ime = ins.systemWindowInsetBottom
            }
            if (onInsets == null) v.setPadding(l, t, r, maxOf(bt, ime))   /* screens without their own inset handling (sign-in) */
            else { v.setPadding(0, 0, 0, ime); onInsets.invoke(t, r, if (ime > 0) 0 else bt, l) }
            ins
        }
        root?.requestApplyInsets()
    }
}
