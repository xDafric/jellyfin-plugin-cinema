package net.dafric.cinematv

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.SimpleBasePlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import org.json.JSONObject

/**
 * Music runs in the web page (an audio element). The page reports what is playing; this player mirrors that state so that a
 * [MediaSession] can show lock-screen / notification controls, and forwards the buttons back to the page.
 */
class WebPlayer(looper: Looper) : SimpleBasePlayer(looper) {
    class S(val title: String = "", val artist: String = "", val album: String = "", val art: String = "", val playing: Boolean = false,
            val posMs: Long = 0, val durMs: Long = 0, val hasNext: Boolean = false, val hasPrev: Boolean = false, val active: Boolean = false)

    var s = S(); private set
    var onCommand: ((String) -> Unit)? = null

    fun update(n: S) { s = n; invalidateState() }

    override fun getState(): State {
        val cmds = Player.Commands.Builder().add(Player.COMMAND_PLAY_PAUSE).add(Player.COMMAND_GET_CURRENT_MEDIA_ITEM).add(Player.COMMAND_GET_METADATA)
            .add(Player.COMMAND_SEEK_IN_CURRENT_MEDIA_ITEM).add(Player.COMMAND_GET_TIMELINE)
        if (s.hasNext) cmds.add(Player.COMMAND_SEEK_TO_NEXT).add(Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM)
        cmds.add(Player.COMMAND_SEEK_TO_PREVIOUS).add(Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM)
        val md = MediaMetadata.Builder().setTitle(s.title).setArtist(s.artist).setAlbumTitle(s.album).setIsPlayable(true)
        if (s.art.isNotEmpty()) md.setArtworkUri(Uri.parse(s.art))
        val item = MediaItemData.Builder("web").setMediaItem(MediaItem.Builder().setMediaId("web").setMediaMetadata(md.build()).build())
            .setMediaMetadata(md.build()).setDurationUs(if (s.durMs > 0) s.durMs * 1000 else C.TIME_UNSET).setIsSeekable(true).build()
        val b = State.Builder().setAvailableCommands(cmds.build()).setPlaylist(if (s.active) listOf(item) else emptyList())
            .setPlayWhenReady(s.playing, Player.PLAY_WHEN_READY_CHANGE_REASON_USER_REQUEST)
            .setPlaybackState(if (s.active) Player.STATE_READY else Player.STATE_IDLE)
        if (s.active) b.setCurrentMediaItemIndex(0).setContentPositionMs(if (s.playing) PositionSupplier.getExtrapolating(s.posMs, 1f) else PositionSupplier.getConstant(s.posMs))
        return b.build()
    }

    override fun handleSetPlayWhenReady(playWhenReady: Boolean): ListenableFuture<*> { onCommand?.invoke(if (playWhenReady) "play" else "pause"); return Futures.immediateVoidFuture() }
    override fun handleSeek(mediaItemIndex: Int, positionMs: Long, seekCommand: Int): ListenableFuture<*> {
        when (seekCommand) {
            Player.COMMAND_SEEK_TO_NEXT, Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM -> onCommand?.invoke("next")
            Player.COMMAND_SEEK_TO_PREVIOUS, Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM -> onCommand?.invoke("prev")
            else -> if (positionMs >= 0) onCommand?.invoke("seek:$positionMs")
        }
        return Futures.immediateVoidFuture()
    }
}

/** Process-wide holder: the bridge (any thread) updates it, the service shows it. */
object WebMedia {
    private val main = Handler(Looper.getMainLooper())
    @Volatile private var p: WebPlayer? = null
    fun player(): WebPlayer = p ?: synchronized(this) { p ?: WebPlayer(Looper.getMainLooper()).also { p = it } }

    /** [json] = what the page reports about the current track. Safe to call from any thread. */
    fun report(ctx: Context, json: String) {
        val app = ctx.applicationContext
        val j = runCatching { JSONObject(json) }.getOrNull() ?: return
        val s = WebPlayer.S(j.optString("title"), j.optString("artist"), j.optString("album"), j.optString("art"), j.optBoolean("playing"), j.optLong("pos"), j.optLong("dur"), j.optBoolean("next"), j.optBoolean("prev"), j.optBoolean("active"))
        main.post {
            player().update(s)
            if (s.active && s.playing) runCatching { ContextCompat.startForegroundService(app, Intent(app, PlaybackService::class.java)) }
            if (!s.active) runCatching { app.stopService(Intent(app, PlaybackService::class.java)) }
        }
    }
}

class PlaybackService : MediaSessionService() {
    private var session: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val open = PendingIntent.getActivity(this, 0, Intent(this, LoginActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        session = MediaSession.Builder(this, WebMedia.player()).setSessionActivity(open).setId("cinema-music").build()
        addSession(session!!)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = session

    /** Swiped away from the recents while nothing plays: nothing left to keep alive. */
    override fun onTaskRemoved(rootIntent: Intent?) { if (!WebMedia.player().s.playing) stopSelf() }

    override fun onDestroy() { session?.let { removeSession(it); it.release() }; session = null; super.onDestroy() }
}
