package org.codeai

import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.nio.charset.Charset
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap
import org.json.JSONObject

/**
 * Fetches studio.code.org pages on the WebView's behalf and inserts the app's
 * script at the top of `<head>`, so it runs during parsing and its styles
 * apply before the first frame. Content blockers inject cosmetic filters the
 * same way; the alternatives here (document-start scripts, or injecting after
 * the page commits) are missing from older WebViews or run a frame too late.
 *
 * Only plain GETs of top-level pages are handled. A page that answers 200
 * with HTML is rewritten. A redirect within the site is answered with a stub
 * that calls location.replace(), because the WebView follows redirects
 * without consulting the app again; the target then comes back through here.
 * For anything else this returns null and the WebView loads the URL itself,
 * which repeats the request; studio.code.org page GETs are safe to repeat.
 */
internal class PageInjector(
    private val origin: String,
    script: String,
    private val userAgent: String,
) {
    private val headSnippet: String
    private val redirectStubs = ConcurrentHashMap.newKeySet<String>()

    init {
        require(!script.lowercase(Locale.ROOT).contains("</script")) {
            "script would close its own <script> tag"
        }
        headSnippet = "<script>$script</script>"
    }

    /** Called on the WebView's network thread. */
    fun intercept(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url.toString()
        if (!request.isForMainFrame
            || !request.method.equals("GET", ignoreCase = true)
            || !url.startsWith("$origin/")
        ) {
            return null
        }
        var connection: HttpURLConnection? = null
        return try {
            connection = URL(url).openConnection() as HttpURLConnection
            connection.instanceFollowRedirects = false
            connection.connectTimeout = CONNECT_TIMEOUT_MS
            connection.readTimeout = READ_TIMEOUT_MS
            copyRequestHeaders(request, connection, url)

            val status = connection.responseCode
            storeCookies(connection, url)
            if (status in 300..399) {
                return redirectStub(url, connection.getHeaderField("Location"))
            }
            val contentType = connection.contentType
            if (status != HttpURLConnection.HTTP_OK
                || contentType == null
                || !contentType.lowercase(Locale.ROOT).startsWith("text/html")
            ) {
                return null
            }

            val charset = charsetOf(contentType)
            val html = connection.inputStream.use { it.readBytes().toString(charset) }
            val body = insertIntoHead(deferTagScripts(html)).toByteArray(charset)
            val reason = connection.responseMessage
            WebResourceResponse(
                "text/html",
                charset.name(),
                status,
                if (reason.isNullOrEmpty()) "OK" else reason,
                responseHeaders(connection),
                ByteArrayInputStream(body),
            )
        } catch (e: IOException) {
            // Offline or a bad response: the WebView retries and shows its own
            // error, and the commit-time fallback still hides the chrome.
            null
        } catch (e: RuntimeException) {
            null
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Whether [url] was answered with a redirect stub, which finishes loading
     * before the page it redirects to has started. Answers once per stub.
     */
    fun wasRedirectStub(url: String?): Boolean = url != null && redirectStubs.remove(url)

    private fun redirectStub(url: String, location: String?): WebResourceResponse? {
        if (location == null) {
            return null
        }
        val target = URL(URL(url), location).toString()
        if (!target.startsWith("$origin/")) {
            return null
        }
        val html = "<!DOCTYPE html><script>location.replace(${JSONObject.quote(target)});</script>"
        redirectStubs.add(url)
        return WebResourceResponse(
            "text/html",
            "utf-8",
            HttpURLConnection.HTTP_OK,
            "OK",
            mapOf("Cache-Control" to "no-store"),
            ByteArrayInputStream(html.toByteArray(Charsets.UTF_8)),
        )
    }

    private fun copyRequestHeaders(
        request: WebResourceRequest,
        connection: HttpURLConnection,
        url: String,
    ) {
        for ((name, value) in request.requestHeaders) {
            // Left to HttpURLConnection, which decompresses only what it asked for.
            if (!name.equals("Accept-Encoding", ignoreCase = true)) {
                connection.setRequestProperty(name, value)
            }
        }
        connection.setRequestProperty("User-Agent", userAgent)
        // English only for now, matching SitePolicy.APP_LOCALE. Rails renders
        // in the language_ cookie's locale, so reset it before every page.
        connection.setRequestProperty("Accept-Language", "en-US,en;q=0.9")
        val cookies = CookieManager.getInstance()
        cookies.setCookie(origin, SitePolicy.LOCALE_COOKIE)
        cookies.getCookie(url)?.let { connection.setRequestProperty("Cookie", it) }
    }

    // Google's tag scripts start once the page has settled, from
    // hide_site_chrome.js, rather than competing with it while it loads.
    private fun deferTagScripts(html: String): String =
        TAG_SCRIPT_SRC.replace(html, "$1 data-codeai-deferred-src=")

    private fun insertIntoHead(html: String): String {
        val lower = html.lowercase(Locale.ROOT)
        val head = lower.indexOf("<head")
        val at = if (head < 0) -1 else lower.indexOf('>', head)
        if (at < 0) {
            return headSnippet + html
        }
        return html.substring(0, at + 1) + headSnippet + html.substring(at + 1)
    }

    companion object {
        private val TAG_SCRIPT_SRC = Regex(
            "(<script\\b[^>]*?)\\ssrc=(?=[\"']https://www\\.googletagmanager\\.com/)",
            RegexOption.IGNORE_CASE,
        )
        private const val CONNECT_TIMEOUT_MS = 15_000
        private const val READ_TIMEOUT_MS = 30_000

        /** The answer for a blocked host: an empty 403, so pages see it fail. */
        fun forbidden() = WebResourceResponse(
            "text/plain", "utf-8", 403, "Forbidden", null, ByteArrayInputStream(ByteArray(0)),
        )

        // The WebView ignores Set-Cookie on intercepted responses. A language_
        // cookie other than en-US (Rails sets one for ?lang=) is dropped.
        private fun storeCookies(connection: HttpURLConnection, url: String) {
            val cookies = CookieManager.getInstance()
            val localePrefix = "${SitePolicy.LOCALE_COOKIE_NAME}="
            for ((name, values) in connection.headerFields) {
                if (!name.equals("Set-Cookie", ignoreCase = true)) {
                    continue
                }
                for (value in values) {
                    val trimmed = value.trim()
                    if (trimmed.startsWith(localePrefix)
                        && !trimmed.startsWith("${localePrefix}en-US;")
                        && trimmed != "${localePrefix}en-US"
                    ) {
                        continue
                    }
                    cookies.setCookie(url, value)
                }
            }
        }

        private fun responseHeaders(connection: HttpURLConnection): Map<String, String> =
            connection.headerFields
                .filterKeys { name ->
                    name != null && DROPPED_RESPONSE_HEADERS.none { it.equals(name, ignoreCase = true) }
                }
                .mapKeys { it.key!! }
                .mapValues { it.value.joinToString(", ") }

        private val DROPPED_RESPONSE_HEADERS =
            listOf("Content-Length", "Content-Encoding", "Transfer-Encoding", "Set-Cookie")

        private fun charsetOf(contentType: String): Charset {
            for (part in contentType.split(";")) {
                val trimmed = part.trim()
                if (trimmed.lowercase(Locale.ROOT).startsWith("charset=")) {
                    return try {
                        Charset.forName(trimmed.substring("charset=".length).trim())
                    } catch (e: IllegalArgumentException) {
                        Charsets.UTF_8
                    }
                }
            }
            return Charsets.UTF_8
        }
    }
}
