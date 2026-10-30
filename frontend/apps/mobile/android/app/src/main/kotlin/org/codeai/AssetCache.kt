package org.codeai

import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.Locale

/**
 * Keeps images.code.org images and dsco.code.org's Font Awesome files on disk,
 * so the launcher shows its images and icons at once, and offline, after their
 * first load. Both hosts put a content hash or a version in every path, so a
 * stored copy never goes stale; images.code.org also sends no caching
 * headers, so the WebView would otherwise ask it again on every load.
 *
 * A request with an Origin header wants CORS headers. dsco.code.org grants
 * them to studio.code.org but not to the landing page's origin, whose icon
 * fonts would then not load; a stored copy answers both, allowing the origin
 * that asked. Any other CORS request goes to the server. Least recently used
 * files go once the cache passes MAX_BYTES.
 */
internal class AssetCache(
    private val dir: File,
    private val userAgent: String,
    private val corsOrigins: Set<String>,
) {

    /** Called on the WebView's network thread. */
    fun intercept(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url
        val origin = request.requestHeaders.entries
            .firstOrNull { it.key.equals("Origin", ignoreCase = true) }
            ?.value
        val cached = when (url.host) {
            IMAGES_HOST -> origin == null
            FONT_AWESOME_HOST ->
                url.path?.startsWith(FONT_AWESOME_PATH) == true
                    && (origin == null || origin in corsOrigins)
            else -> false
        }
        if (!cached || url.scheme != "https" || !request.method.equals("GET", ignoreCase = true)) {
            return null
        }
        val file = File(dir, key(url.toString()))
        if (file.exists()) {
            file.setLastModified(System.currentTimeMillis())
        } else if (!download(url.toString(), file)) {
            // Offline or an error: the WebView tries the server itself.
            return null
        }
        val headers = origin?.let { mapOf("Access-Control-Allow-Origin" to it) } ?: emptyMap()
        return try {
            WebResourceResponse(
                mimeType(url.lastPathSegment), null, 200, "OK", headers, FileInputStream(file),
            )
        } catch (e: IOException) {
            null
        }
    }

    private fun download(url: String, file: File): Boolean {
        dir.mkdirs()
        var connection: HttpURLConnection? = null
        var partial: File? = null
        return try {
            connection = URL(url).openConnection() as HttpURLConnection
            connection.connectTimeout = CONNECT_TIMEOUT_MS
            connection.readTimeout = READ_TIMEOUT_MS
            connection.setRequestProperty("User-Agent", userAgent)
            if (connection.responseCode != HttpURLConnection.HTTP_OK
                || connection.contentLengthLong > MAX_FILE_BYTES
            ) {
                return false
            }
            // Written aside and renamed, so a reader never sees half a file.
            val download = File.createTempFile("download", null, dir)
            partial = download
            connection.inputStream.use { input ->
                download.outputStream().use { input.copyTo(it) }
            }
            download.renameTo(file).also { if (it) trim() }
        } catch (e: IOException) {
            false
        } finally {
            partial?.delete()
            connection?.disconnect()
        }
    }

    private fun trim() {
        val files = dir.listFiles()?.sortedByDescending { it.lastModified() } ?: return
        var total = 0L
        for (file in files) {
            total += file.length()
            if (total > MAX_BYTES) {
                file.delete()
            }
        }
    }

    private companion object {
        const val IMAGES_HOST = "images.code.org"
        const val FONT_AWESOME_HOST = "dsco.code.org"
        // The stylesheets and fonts of @code-dot-org/fonts' injectFontAwesome.
        const val FONT_AWESOME_PATH = "/assets/font-awesome-pro/"
        const val CONNECT_TIMEOUT_MS = 15_000
        const val READ_TIMEOUT_MS = 30_000
        const val MAX_FILE_BYTES = 5L * 1024 * 1024
        const val MAX_BYTES = 32L * 1024 * 1024

        fun key(url: String): String =
            MessageDigest.getInstance("SHA-256")
                .digest(url.toByteArray())
                .joinToString("") { "%02x".format(it) }

        // images.code.org labels every file binary/octet-stream.
        fun mimeType(name: String?): String =
            when (name?.substringAfterLast('.')?.lowercase(Locale.ROOT)) {
                "png" -> "image/png"
                "jpg", "jpeg" -> "image/jpeg"
                "gif" -> "image/gif"
                "webp" -> "image/webp"
                "svg" -> "image/svg+xml"
                "css" -> "text/css"
                "woff2" -> "font/woff2"
                "woff" -> "font/woff"
                "ttf" -> "font/ttf"
                else -> "application/octet-stream"
            }
    }
}
