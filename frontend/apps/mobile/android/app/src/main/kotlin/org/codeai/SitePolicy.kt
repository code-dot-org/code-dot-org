package org.codeai

import android.net.Uri
import android.os.LocaleList
import android.util.Base64
import java.util.Locale

/** Which studio.code.org pages the app shows and how it treats them. */
internal object SitePolicy {
    // The only site the app shows. Keep in step with server.allowNavigation in
    // capacitor.config.ts.
    const val SITE_ORIGIN = "https://studio.code.org"
    // The site logo's link, set by the page script (page_site_chrome.js). It is an https path
    // the site does not serve, not a custom scheme: Chromium treats unknown
    // schemes as external apps and may drop the navigation, while every
    // https navigation reaches shouldOverrideUrlLoading.
    const val HOME_URL = "$SITE_ORIGIN/codeai-app/home"
    // The header's Reset button and the landing page's Try again link here,
    // handled like HOME_URL: ?course= names the course whose progress is
    // forgotten, and ?next= a studio.code.org page to open after.
    private const val RESET_PATH = "/codeai-app/reset"
    // The landing page opens its congratulations at #finished=<course>, with
    // the course empty when unknown. Keep in step with launcher.tsx.
    private const val FINISHED_KEY = "finished="
    const val FINISHED_FRAGMENT = "#$FINISHED_KEY"

    // Names the course whose progress the next page's script clears, then
    // deletes; it lasts minutes, in case no page loads.
    const val RESET_COURSE_COOKIE_NAME = "codeai_reset_course"
    const val RESET_COURSE_COOKIE_ATTRIBUTES = "Path=/; Max-Age=600; Secure; SameSite=Lax"

    // Appended to the WebView's User-Agent, so the server can tell every
    // request from the app (pages, API calls, iframes) from a browser's,
    // e.g. "CodeAIApp/1.0.0 (android; Amazon Kids+ Edition)", the edition named
    // as Amazon names it; a product name cannot hold spaces.
    const val USER_AGENT_PRODUCT = "CodeAIApp"
    const val PLATFORM = "android"
    const val EDITION = "Amazon Kids+ Edition"

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
    // /api/hour/finish/<course> redirects to /congrats, but older WebViews
    // (Chromium 91) load a redirect's target without the app seeing it, so
    // the app catches the finish itself.
    private val CERTIFICATE_PATHS =
        listOf("/congrats", "/certificates/", "/print_certificates/", "/api/hour/finish/")
    private val COURSE_NAME = Regex("[A-Za-z0-9_-]+")
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

    fun isAllowedOrigin(url: Uri): Boolean = origin(url) == SITE_ORIGIN

    fun isSitePage(url: String?): Boolean = url != null && url.startsWith("$SITE_ORIGIN/")

    fun isBlockedHost(url: Uri): Boolean {
        val host = url.host ?: return false
        return BLOCKED_HOSTS.any { host == it || host.endsWith(".$it") }
    }

    /** Whether [url] is one of the app's own pages, which Capacitor serves at [localUrl]. */
    fun isBundledPage(url: Uri, localUrl: String): Boolean = origin(url) == localUrl

    /** Whether [url] opens the landing page's congratulations, whose Try again resets a course. */
    fun isFinishedScreen(url: Uri, localUrl: String): Boolean =
        isBundledPage(url, localUrl) && url.fragment?.startsWith(FINISHED_KEY) == true

    fun isResetUrl(url: Uri): Boolean = origin(url) == SITE_ORIGIN && url.path == RESET_PATH

    /** The course a reset link names, or null when it names none or a malformed one. */
    fun resetCourse(url: Uri): String? = url.getQueryParameter("course")?.takeIf { COURSE_NAME.matches(it) }

    /**
     * Whether the reset link [url] may run while [pageUrl] shows. A link in
     * another site's iframe can navigate the whole page, so a reset comes only
     * from the landing page [appUrl], which has no iframes, or carries [token],
     * which only the app's page script holds; null accepts no token.
     */
    fun mayReset(url: Uri, pageUrl: String?, appUrl: String, token: String?): Boolean =
        pageUrl?.substringBefore('#') == appUrl
            || (token != null && url.getQueryParameter("token") == token)

    fun isHomeLink(url: Uri): Boolean = url.toString() == HOME_URL

    /**
     * Whether [url] opens the landing page in place of a site page: the
     * logo's [HOME_URL], the site's root and /home, and its account pages
     * under /users/ (sign-in, sign-up, OAuth), which Amazon Kids+ does not
     * allow. The root redirects signed-out visitors to sign-in.
     */
    fun leadsHome(url: Uri): Boolean {
        if (isHomeLink(url)) {
            return true
        }
        val path = url.path ?: ""
        return origin(url) == SITE_ORIGIN
            && (path in listOf("", "/", "/home", "/users") || path.startsWith("/users/"))
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
     * The course a certificate page is for: /congrats/<course>,
     * /api/hour/finish/<course>, or /congrats?s=<course in URL-safe Base64>,
     * which those two redirect to. Empty when unknown.
     */
    fun finishedCourse(url: Uri): String {
        val segments = url.pathSegments
        val course = when {
            segments.size == 2 && segments[0] == "congrats" -> segments[1]
            segments.size == 4 && segments.subList(0, 3) == listOf("api", "hour", "finish") -> segments[3]
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

    // As a browser compares origins: an omitted port and the scheme's default
    // are the same, any other port is another origin.
    private fun origin(url: Uri): String {
        val default = when (url.scheme) {
            "https" -> 443
            "http" -> 80
            else -> -1
        }
        val port = url.port.takeIf { it != -1 && it != default }?.let { ":$it" } ?: ""
        return "${url.scheme}://${url.host}$port"
    }
}
