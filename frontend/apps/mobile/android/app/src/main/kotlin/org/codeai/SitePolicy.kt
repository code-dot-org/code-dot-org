package org.codeai

import android.net.Uri
import android.os.LocaleList
import android.util.Base64
import java.util.Locale

/** Which studio.code.org pages the app shows and how it treats them. */
internal object SitePolicy {
    const val SITE_ORIGIN = "https://studio.code.org"
    // Pages the app may show. Keep in step with server.allowNavigation in
    // capacitor.config.ts.
    private const val SUPPORT_ORIGIN = "https://support.code.org"
    val ALLOWED_ORIGINS = setOf(SITE_ORIGIN, SUPPORT_ORIGIN)
    // The site logo's link, set by hide_site_chrome.js. It is an https path
    // the site does not serve, not a custom scheme: Chromium treats unknown
    // schemes as external apps and may drop the navigation, while every
    // https navigation reaches shouldOverrideUrlLoading.
    const val HOME_URL = "$SITE_ORIGIN/codeai-app/home"
    // The header's Reset button and the landing page's Try again link here,
    // handled like HOME_URL; ?next= names a studio.code.org page to open after.
    private const val RESET_PATH = "/codeai-app/reset"

    // Set by the page script and kept across a reset: the child's page zoom.
    const val ZOOM_COOKIE_NAME = "codeai_zoom"
    // Changed by every reset; the page script then clears sessionStorage,
    // which lives in the WebView rather than on disk.
    const val RESET_COOKIE_NAME = "codeai_reset"
    const val COOKIE_ATTRIBUTES = "Path=/; Max-Age=315569520; Secure; SameSite=Lax"

    // Appended to the WebView's User-Agent, so the server can tell every
    // request from the app (pages, API calls, iframes) from a browser's,
    // e.g. "CodeAIApp/0.1.0 (android; amazon-kids)".
    const val USER_AGENT_PRODUCT = "CodeAIApp"
    const val PLATFORM = "android"
    const val EDITION = "amazon-kids"

    // Item 3 of "Elements to Hide in the Wrapper": YouTube's player offers
    // "Watch on YouTube", which leaves the app. With these hosts unreachable,
    // Code.org's video levels play the same video from videos.code.org in
    // their own player; they test reachability by loading YouTube's favicon.
    private val BLOCKED_HOSTS = listOf(
        "youtube.com", "youtube-nocookie.com", "youtu.be", "ytimg.com", "googlevideo.com",
    )
    // Item 6: certificate pages, which ask for a name and offer sharing.
    // Reaching one means the curriculum is done; the app congratulates the
    // child instead.
    private val CERTIFICATE_PATHS = listOf("/congrats", "/certificates/", "/print_certificates/")
    private val COURSE_NAME = Regex("[A-Za-z0-9_-]+")
    // The help center's main page, in any language: /hc, /hc/en-us.
    private val SUPPORT_HOME_PATH = Regex("^(/hc(/[A-Za-z-]+)?)?/?$")
    // A free-play lab's project editor, /projects/<lab>/<id>/edit.
    private val PROJECT_EDITOR =
        Regex("^${Regex.escape(SITE_ORIGIN)}/projects/([a-z0-9_]+)/[A-Za-z0-9_-]+/edit$")

    // Phase 1 is English only, whatever the device language. Rails picks the
    // locale from ?lang=, then this cookie, then Accept-Language, and saves
    // its pick in the cookie; setting it first keeps a non-English device
    // from fixing the site in its language.
    val APP_LOCALE: Locale = Locale.US
    const val LOCALE_COOKIE_NAME = "language_"
    const val LOCALE_COOKIE =
        "$LOCALE_COOKIE_NAME=en-US; Domain=.code.org; Path=/; Max-Age=315569520; Secure; SameSite=Lax"

    fun userAgentToken(versionName: String): String =
        "$USER_AGENT_PRODUCT/$versionName ($PLATFORM; $EDITION)"

    // The WebView takes Accept-Language and navigator.language from the
    // default locale when it is created, and the system resets the default
    // when the device language changes.
    fun pinLocale() {
        Locale.setDefault(APP_LOCALE)
        LocaleList.setDefault(LocaleList(APP_LOCALE))
    }

    fun isAllowedOrigin(url: Uri): Boolean = origin(url) in ALLOWED_ORIGINS

    fun isSitePage(url: String?): Boolean = url != null && url.startsWith("$SITE_ORIGIN/")

    fun isBlockedHost(url: Uri): Boolean {
        val host = url.host ?: return false
        return BLOCKED_HOSTS.any { host == it || host.endsWith(".$it") }
    }

    fun isResetUrl(url: Uri): Boolean = origin(url) == SITE_ORIGIN && url.path == RESET_PATH

    /**
     * Links the app answers with its landing page: the site logo's HOME_URL,
     * and on support.code.org pages its logo, which leads to code.org's home
     * page, and links to its help center's main page. From studio.code.org
     * those open as they would in a browser, as a lab's "Get help" does.
     */
    fun isHomeLink(url: Uri, from: String?): Boolean {
        if (origin(url) == SITE_ORIGIN) {
            return url.toString() == HOME_URL
        }
        if (from?.startsWith("$SUPPORT_ORIGIN/") != true) {
            return false
        }
        val path = url.path.orEmpty()
        return when (origin(url)) {
            "https://code.org", "https://www.code.org" -> path.isEmpty() || path == "/"
            SUPPORT_ORIGIN -> SUPPORT_HOME_PATH.matches(path)
            else -> false
        }
    }

    /**
     * The lab of /projects/<lab>, the link that starts a new project; the
     * server makes one for every visit. Null for any other URL.
     */
    fun newProjectLab(url: Uri): String? {
        val segments = url.pathSegments
        return segments.getOrNull(1)?.takeIf {
            origin(url) == SITE_ORIGIN && segments.size == 2 && segments[0] == "projects"
        }
    }

    /** The lab of a project editor page; null for any other URL. */
    fun projectEditorLab(url: String): String? =
        PROJECT_EDITOR.matchEntire(url.substringBefore('?').substringBefore('#'))?.groupValues?.get(1)

    /** The value of cookie [name] in a Cookie header, as CookieManager returns. */
    fun cookieValue(header: String?, name: String): String? =
        header?.split(';')
            ?.map { it.trim() }
            ?.firstOrNull { it.startsWith("$name=") }
            ?.substringAfter('=')

    fun isCertificatePage(url: Uri): Boolean {
        val path = url.path
        if (origin(url) != SITE_ORIGIN || path == null) {
            return false
        }
        return CERTIFICATE_PATHS.any { prefix ->
            path == prefix || path.startsWith(if (prefix.endsWith("/")) prefix else "$prefix/")
        }
    }

    /**
     * The course a certificate page is for: /congrats/<course>, or
     * /congrats?s=<course in URL-safe Base64>, which /congrats/<course> and
     * /api/hour/finish/<course> redirect to. Empty when unknown.
     */
    fun finishedCourse(url: Uri): String {
        val segments = url.pathSegments
        val course = when {
            segments.size == 2 && segments[0] == "congrats" -> segments[1]
            segments.size == 1 && segments[0] == "congrats" ->
                url.getQueryParameter("s")?.let { encoded ->
                    try {
                        Base64.decode(encoded, Base64.URL_SAFE).toString(Charsets.UTF_8)
                    } catch (e: IllegalArgumentException) {
                        null // Not Base64; the course is unknown.
                    }
                }
            else -> null
        }
        return course?.takeIf { COURSE_NAME.matches(it) } ?: ""
    }

    private fun origin(url: Uri) = "${url.scheme}://${url.host}"
}
