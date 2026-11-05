package org.codeai

import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Color
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.Uri
import android.os.Bundle
import android.view.ActionMode
import android.view.View
import android.webkit.CookieManager
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.content.edit
import androidx.core.net.toUri
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.getcapacitor.BridgeActivity
import com.getcapacitor.WebViewListener
import org.codeai.SitePolicy.SITE_ORIGIN
import java.net.URLEncoder
import java.util.UUID

/**
 * Hosts the landing page and the curricula it opens in one WebView. The
 * landing page is always the first history entry; curricula load on top of
 * it from studio.code.org. [AppWebViewClient] decides where the WebView may
 * go; this holds where it is going and acts on it.
 */
class MainActivity : BridgeActivity() {
    private lateinit var prefs: SharedPreferences
    internal lateinit var loadingCover: LoadingCover
        private set
    // The remembered page a fresh start reopens, until it is opened.
    internal var resumeUrl: String? = null
        private set
    // Opened once the landing page is back: a course's congratulations, or
    // the first level after "Try again".
    internal var pendingLandingUrl: String? = null
    // Set when the app loads the landing page over pages Back must not
    // return to: a load the cover's logo cancelled, which can stay in
    // history even ahead of the landing page, or a page Back left.
    internal var clearHistoryOnLanding = false
    // Set when the app opens the offline screen over a page that failed to
    // load; Back from it then goes to the landing page.
    internal var clearHistoryOnOffline = false
    // Known only to the app and the page script it puts in studio.code.org
    // pages, for the debug build's Reset course; another site's frame cannot
    // read it, but the site's own third-party scripts could.
    internal val resetToken = if (BuildConfig.DEBUG) UUID.randomUUID().toString() else null
    private lateinit var connectivity: ConnectivityManager
    // The WebView takes navigator.onLine, and fires online and offline, only
    // from the app; the offline page reloads itself on online.
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) = setNetworkAvailable(true)

        override fun onLost(network: Network) = setNetworkAvailable(false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Before super.onCreate creates the WebView, which takes Accept-Language
        // and navigator.language from the default locale.
        SitePolicy.pinLocale()
        super.onCreate(savedInstanceState)
        CookieManager.getInstance().setCookie(SITE_ORIGIN, SitePolicy.LOCALE_COOKIE)
        setStableIdCookie(this)
        val webView = bridge.webView
        setUpWebView(webView)
        webView.webChromeClient = AppChromeClient(bridge)
        // The volume keys set the volume of the WebView's sound, not the ringer.
        volumeControlStream = AudioManager.STREAM_MUSIC

        loadingCover = LoadingCover(this, webView, ::cancelLoading)
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        resumeUrl = prefs.getString(LAST_PAGE_KEY, null)?.takeIf(SitePolicy::isSitePage)
        if (resumeUrl != null) {
            loadingCover.show()
        }

        val stableId = deviceStableId(this)
        val script = pageScript(resources, stableId, resetToken)
        val atDocumentStart = addPageScript(webView, script)
        bridge.webViewClient = AppWebViewClient(
            this,
            AssetCache(cacheDir.resolve("assets"), webView.settings.userAgentString, setOf(bridge.localUrl, SITE_ORIGIN)),
            script,
            injectOnCommit = !atDocumentStart,
            stableId,
        )

        // Capacitor has started loading the landing page. Open the remembered
        // page on top of it, so Back still leads to the landing page.
        bridge.addWebViewListener(object : WebViewListener() {
            override fun onPageLoaded(webView: WebView) {
                val url = resumeUrl
                if (url != null && isBundledPage(webView.url)) {
                    resumeUrl = null
                    webView.loadUrl(url)
                }
            }
        })

        // Edge to edge on every API level, so Fire OS 7 and Android 16 lay out
        // alike. The IME inset keeps controls above the on-screen keyboard.
        enableEdgeToEdge(
            SystemBarStyle.dark(Color.TRANSPARENT),
            SystemBarStyle.dark(Color.TRANSPARENT),
        )
        // The design has no status bar: the app header starts at the top of
        // the screen. A swipe from the top edge shows it for a moment.
        WindowCompat.getInsetsController(window, window.decorView).apply {
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            hide(WindowInsetsCompat.Type.statusBars())
        }
        ViewCompat.setOnApplyWindowInsetsListener(findViewById<View>(R.id.app_root)) { view, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    or WindowInsetsCompat.Type.displayCutout()
                    or WindowInsetsCompat.Type.ime(),
            )
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        connectivity = getSystemService(ConnectivityManager::class.java)
        if (connectivity.activeNetwork == null) {
            webView.setNetworkAvailable(false)
        }
        connectivity.registerDefaultNetworkCallback(networkCallback)

        // Amazon Kids+ requires Back to return to the previous screen and to
        // exit from the landing page.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = goBack()
        })
    }

    // The cover's logo, like the site's, returns to the landing page: the
    // page loading underneath and any page queued after it are dropped. The
    // cover stays until the landing page is back.
    private fun cancelLoading() {
        resumeUrl = null
        pendingLandingUrl = null
        clearHistoryOnLanding = true
        bridge.webView.stopLoading()
        goHome()
    }

    // The system resets the default locale when the device language changes;
    // pin it again and let the WebView reread it.
    override fun onConfigurationChanged(newConfig: Configuration) {
        SitePolicy.pinLocale()
        super.onConfigurationChanged(newConfig)
        bridge.webView.dispatchConfigurationChanged(newConfig)
    }

    private fun setNetworkAvailable(available: Boolean) {
        val webView = bridge.webView
        webView.post { webView.setNetworkAvailable(available) }
    }

    override fun onDestroy() {
        connectivity.unregisterNetworkCallback(networkCallback)
        super.onDestroy()
    }

    override fun onActionModeStarted(mode: ActionMode) {
        super.onActionModeStarted(mode)
        hideLeavingActions(mode.menu, webViewResources)
    }

    private val webViewResources by lazy {
        WebView.getCurrentWebViewPackage()?.applicationInfo
            ?.let { runCatching { packageManager.getResourcesForApplication(it) }.getOrNull() }
    }

    override fun onPause() {
        super.onPause()
        // Android writes persistent cookies to disk only periodically.
        CookieManager.getInstance().flush()
    }

    internal fun rememberPage(url: String?) {
        if (url == null) {
            return
        }
        // Keeps the page it stands in for, so a restart retries it.
        if (isOfflinePage(url)) {
            return
        }
        if (isBundledPage(url)) {
            // On a fresh start the landing page loads first, under the page
            // it then reopens; the saved page stays until that one commits.
            if (resumeUrl == null) {
                prefs.edit { remove(LAST_PAGE_KEY) }
            }
        } else if (SitePolicy.isSitePage(url) && !SitePolicy.leadsHome(url.toUri())) {
            prefs.edit { putString(LAST_PAGE_KEY, url) }
            SitePolicy.projectEditorLab(url)?.let { lab ->
                prefs.edit { putString(PROJECT_KEY_PREFIX + lab, url) }
            }
        }
    }

    /** The project editor last shown for the free-play [lab], if any. */
    internal fun rememberedProject(lab: String): String? = prefs.getString(PROJECT_KEY_PREFIX + lab, null)

    /**
     * Forgets one course's progress, as Try again asks, then opens [next]
     * above the landing page. The progress lives in sessionStorage and the
     * progress cookie, which only a page can edit, so the page script clears
     * the course this cookie names before the site's scripts read either.
     * Projects and other courses stay.
     */
    internal fun resetCourse(course: String, next: String?) {
        val cookies = CookieManager.getInstance()
        cookies.setCookie(
            SITE_ORIGIN,
            "${SitePolicy.RESET_COURSE_COOKIE_NAME}=$course; ${SitePolicy.RESET_COURSE_COOKIE_ATTRIBUTES}",
        )
        cookies.flush()
        pendingLandingUrl = next
        bridge.webView.post { goHome() }
    }

    internal fun goBack() {
        val webView = bridge.webView
        when {
            // Back exits from the landing page itself, even with history
            // behind it, such as an offline screen the app opened. Its
            // congratulations (#finished) go back to the list instead.
            webView.url == bridge.appUrl -> finish()
            webView.canGoBack() -> webView.goBack()
            // Chromium's Back, and history.go() from the page, skip the
            // landing page under a page the app reopened on a fresh start,
            // since nothing on it was tapped.
            webView.url?.substringBefore('#') != bridge.appUrl -> {
                clearHistoryOnLanding = true
                webView.loadUrl(bridge.appUrl)
            }
            else -> finish()
        }
    }

    internal fun goHome() {
        val webView = bridge.webView
        val history = webView.copyBackForwardList()
        val index = history.currentIndex
        if (index > 0 && isBundledPage(history.getItemAtIndex(0).url)) {
            // Traversed from the page: right after a tap, a lab page can drop
            // goBackOrForward() but not its own history.go().
            webView.evaluateJavascript("history.go(-$index)", null)
        } else {
            webView.loadUrl(bridge.appUrl)
        }
    }

    /** Opens the offline screen in place of [failedUrl], which it retries. */
    internal fun showOffline(failedUrl: String) {
        clearHistoryOnOffline = true
        bridge.webView.loadUrl(
            "${bridge.localUrl}$OFFLINE_PATH?url=${URLEncoder.encode(failedUrl, "UTF-8")}",
        )
    }

    internal fun isOfflinePage(url: String?): Boolean =
        isBundledPage(url) && url?.toUri()?.path == OFFLINE_PATH

    internal fun isAppPage(url: Uri): Boolean =
        SitePolicy.isAllowedOrigin(url) || SitePolicy.isBundledPage(url, bridge.localUrl)

    internal fun isBundledPage(url: String?): Boolean =
        url != null && SitePolicy.isBundledPage(url.toUri(), bridge.localUrl)

    companion object {
        // The landing page's offline screen. Keep in step with routes/offline.tsx
        // in apps/studio.
        private const val OFFLINE_PATH = "/offline"

        // The last studio.code.org page shown, so a fresh start resumes there.
        // Cleared on the landing page: a child who went home starts at home.
        private const val PREFS = "codeai_app"
        private const val LAST_PAGE_KEY = "last_page_url"
        // The project editor last shown for each free-play lab.
        private const val PROJECT_KEY_PREFIX = "project_"
    }
}
