package org.codeai

import android.net.Uri
import android.os.LocaleList
import android.util.Base64
import java.net.URLDecoder
import java.util.Locale
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

/** Which studio.code.org pages the app shows and how it treats them. */
internal object SitePolicy {
    // The only site the app shows. Keep in step with server.allowNavigation in
    // capacitor.config.ts.
    const val SITE_ORIGIN = "https://studio.code.org"
    // The site logo's link, set by hide_site_chrome.js. It is an https path
    // the site does not serve, not a custom scheme: Chromium treats unknown
    // schemes as external apps and may drop the navigation, while every
    // https navigation reaches shouldOverrideUrlLoading.
    const val HOME_URL = "$SITE_ORIGIN/codeai-app/home"
    // The header's Reset button and the landing page's Try again link here,
    // handled like HOME_URL; ?next= names a studio.code.org page to open after.
    // With ?course=, only that course's progress is forgotten.
    private const val RESET_PATH = "/codeai-app/reset"

    // Set by the page script and kept across a reset: the child's page zoom.
    const val ZOOM_COOKIE_NAME = "codeai_zoom"
    // Changed by every reset; the page script then clears sessionStorage,
    // which lives in the WebView rather than on disk.
    const val RESET_COOKIE_NAME = "codeai_reset"
    // Names the course whose progress the next page's script clears, then
    // deletes; it lasts minutes, in case no page loads.
    const val RESET_COURSE_COOKIE_NAME = "codeai_reset_course"
    const val RESET_COURSE_COOKIE_ATTRIBUTES = "Path=/; Max-Age=600; Secure; SameSite=Lax"
    const val COOKIE_ATTRIBUTES = "Path=/; Max-Age=315569520; Secure; SameSite=Lax"

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
    private val CERTIFICATE_PATHS = listOf("/congrats", "/certificates/", "/print_certificates/")
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

    // Keys the hash that turns ANDROID_ID into the site's stable ID, so the
    // value is this app's own and does not reveal ANDROID_ID.
    private const val STABLE_ID_KEY = "org.codeai.statsig_stable_id"

    // The site's Statsig stable ID cookie (statsigHelpers.js in apps/), set
    // with the site's own domain and path so it is the same cookie.
    const val STABLE_ID_COOKIE_NAME = "statsig_stable_id"

    // OneTrust's saved choice, and the category Statsig's cookie needs:
    // performance (C0002), as consentAllowsStatsigCookie() in
    // apps/src/metrics/statsigHelpers.js reads it.
    const val CONSENT_COOKIE_NAME = "OptanonConsent"
    private const val STATSIG_CONSENT_GROUP = "C0002:1"

    /** Whether the saved consent in [cookieHeader] allows the stable ID cookie. */
    fun consentAllowsStableId(cookieHeader: String?): Boolean {
        val consent = cookieValue(cookieHeader, CONSENT_COOKIE_NAME) ?: return false
        val groups = consent.split('&')
            .firstOrNull { it.startsWith("groups=") }
            ?.let { URLDecoder.decode(it.removePrefix("groups="), "UTF-8") }
            ?: return false
        return groups.split(',').any { it.trim() == STATSIG_CONSENT_GROUP }
    }

    fun stableIdCookie(id: String): String =
        "$STABLE_ID_COOKIE_NAME=$id; Domain=.code.org; Path=/; Max-Age=31536000; Secure; SameSite=Lax"

    /**
     * The device's Statsig stable ID: the same on every launch, update and
     * reinstall signed with the same key, until a factory reset changes
     * [androidId]. Shaped as a version 4 UUID, the only form the site and
     * server accept (STATSIG_STABLE_ID_PATTERN in lib/cdo/shared_constants.rb).
     */
    fun deviceStableId(androidId: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(STABLE_ID_KEY.toByteArray(), "HmacSHA256"))
        val bytes = mac.doFinal(androidId.toByteArray()).copyOf(16)
        bytes[6] = (bytes[6].toInt() and 0x0f or 0x40).toByte()
        bytes[8] = (bytes[8].toInt() and 0x3f or 0x80).toByte()
        val hex = bytes.joinToString("") { "%02x".format(it) }
        return "${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-" +
            "${hex.substring(16, 20)}-${hex.substring(20)}"
    }

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

    fun isResetUrl(url: Uri): Boolean = origin(url) == SITE_ORIGIN && url.path == RESET_PATH

    /** The course a reset link names, or null when it names none or a malformed one. */
    fun resetCourse(url: Uri): String? = url.getQueryParameter("course")?.takeIf { COURSE_NAME.matches(it) }

    fun isHomeLink(url: Uri): Boolean = url.toString() == HOME_URL

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
