package net.dafric.cinematv

import android.content.Context
import android.net.wifi.WifiManager
import org.json.JSONArray
import org.json.JSONObject
import org.w3c.dom.Element
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.HttpURLConnection
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.URL
import java.security.MessageDigest
import javax.xml.parsers.DocumentBuilderFactory

/**
 * Network speakers (UPnP / DLNA renderers, for example Sonos) on the home network the phone is in. The phone finds and controls them itself,
 * the Jellyfin server may be somewhere else entirely: it only provides the signed song links the speaker fetches from the internet.
 * Only private network addresses are ever contacted.
 */
object Speakers {
    private fun isPrivate(host: String): Boolean = runCatching {
        InetAddress.getAllByName(host).all { it.isSiteLocalAddress || it.isLinkLocalAddress || it.isLoopbackAddress }
    }.getOrDefault(false)

    private fun safe(url: String): Boolean = runCatching { val u = URL(url); (u.protocol == "http" || u.protocol == "https") && isPrivate(u.host) }.getOrDefault(false)

    private fun get(url: String): String? = runCatching {
        val c = URL(url).openConnection() as HttpURLConnection
        try { c.connectTimeout = 2500; c.readTimeout = 3000; if (c.responseCode in 200..299) c.inputStream.bufferedReader().use { it.readText() } else null } finally { c.disconnect() }
    }.getOrNull()

    /** Looks for renderers for about four seconds; returns [{id,name,av,rc}]. Blocking. */
    fun scan(ctx: Context): JSONArray {
        val wifi = ctx.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
        val lock = wifi?.createMulticastLock("cinema-ssdp")?.also { it.setReferenceCounted(false); runCatching { it.acquire() } }
        val locations = LinkedHashSet<String>()
        val msg = ("M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp:discover\"\r\nMX: 2\r\nST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n").toByteArray()
        val dest = InetSocketAddress(InetAddress.getByName("239.255.255.250"), 1900)
        val sockets = ArrayList<DatagramSocket>()
        try {
            val addrs = runCatching { NetworkInterface.getNetworkInterfaces().toList().filter { it.isUp && !it.isLoopback && it.supportsMulticast() }.flatMap { it.inetAddresses.toList() }.filter { it.address.size == 4 } }.getOrDefault(emptyList())
            for (a in addrs) runCatching { val s = DatagramSocket(InetSocketAddress(a, 0)); s.soTimeout = 400; s.send(DatagramPacket(msg, msg.size, dest)); s.send(DatagramPacket(msg, msg.size, dest)); sockets.add(s) }
            val until = System.currentTimeMillis() + 3500
            val buf = ByteArray(2048)
            while (System.currentTimeMillis() < until) {
                for (s in sockets) {
                    val p = DatagramPacket(buf, buf.size)
                    if (runCatching { s.receive(p) }.isSuccess) {
                        String(p.data, 0, p.length).lines().firstOrNull { it.startsWith("LOCATION:", true) }?.substring(9)?.trim()?.let { loc ->
                            if (runCatching { URL(loc).host == p.address.hostAddress }.getOrDefault(false)) locations.add(loc)
                        }
                    }
                }
            }
        } finally { sockets.forEach { runCatching { it.close() } }; runCatching { lock?.release() } }
        val out = JSONArray(); val seen = HashSet<String>()
        for (loc in locations) describe(loc)?.let { if (seen.add(it.getString("id"))) out.put(it) }
        return out
    }

    private fun describe(location: String): JSONObject? = runCatching {
        if (!safe(location)) return null
        val xml = get(location) ?: return null
        val f = DocumentBuilderFactory.newInstance().apply { isNamespaceAware = true; setFeature("http://apache.org/xml/features/disallow-doctype-decl", true) }
        val doc = f.newDocumentBuilder().parse(xml.byteInputStream())
        val devices = doc.getElementsByTagNameNS("*", "device")
        var dev: Element? = null
        for (i in 0 until devices.length) { val d = devices.item(i) as Element; if (d.getElementsByTagNameNS("*", "deviceType").item(0)?.textContent?.contains("MediaRenderer", true) == true) { dev = d; break } }
        dev ?: return null
        fun text(tag: String) = dev.getElementsByTagNameNS("*", tag).item(0)?.textContent ?: ""
        val base = URL(doc.getElementsByTagNameNS("*", "URLBase").item(0)?.textContent?.takeIf { it.isNotBlank() } ?: location)
        var av = ""; var rc = ""
        val services = dev.getElementsByTagNameNS("*", "service")
        for (i in 0 until services.length) {
            val s = services.item(i) as Element
            val type = s.getElementsByTagNameNS("*", "serviceType").item(0)?.textContent ?: ""
            val ctl = s.getElementsByTagNameNS("*", "controlURL").item(0)?.textContent ?: continue
            val abs = URL(base, ctl).toString()
            if (type.contains("AVTransport", true)) av = abs else if (type.contains("RenderingControl", true)) rc = abs
        }
        if (av.isEmpty() || !safe(av)) return null
        var name = text("friendlyName").ifBlank { "Speaker" }.replace(Regex("\\s*-?\\s*RINCON_\\w+$"), "").replace(" Media Renderer", "", true).trim()
        if (name.length > 48) name = name.substring(0, 48)
        val udn = text("UDN").ifBlank { location }
        val id = "spk_" + MessageDigest.getInstance("SHA-256").digest(udn.toByteArray()).joinToString("") { "%02x".format(it) }.substring(0, 16)
        JSONObject().put("id", id).put("name", name).put("av", av).put("rc", rc)
    }.getOrNull()

    /** One UPnP control call to a renderer found by [scan]. Returns the response XML or null. Blocking. */
    fun soap(url: String, service: String, action: String, args: String): String? {
        if (!safe(url) || !Regex("^[A-Za-z]{1,40}$").matches(service) || !Regex("^[A-Za-z]{1,40}$").matches(action)) return null
        val body = "<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><s:Body><u:$action xmlns:u=\"urn:schemas-upnp-org:service:$service:1\">$args</u:$action></s:Body></s:Envelope>"
        return runCatching {
            val c = URL(url).openConnection() as HttpURLConnection
            try {
                c.requestMethod = "POST"; c.doOutput = true; c.connectTimeout = 3000; c.readTimeout = 6000
                c.setRequestProperty("Content-Type", "text/xml; charset=\"utf-8\""); c.setRequestProperty("SOAPACTION", "\"urn:schemas-upnp-org:service:$service:1#$action\"")
                c.outputStream.use { it.write(body.toByteArray()) }
                if (c.responseCode in 200..299) c.inputStream.bufferedReader().use { it.readText() } else null
            } finally { c.disconnect() }
        }.getOrNull()
    }
}
