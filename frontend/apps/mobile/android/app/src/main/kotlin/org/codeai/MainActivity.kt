package org.codeai

import android.content.SharedPreferences
import android.content.res.Configuration
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebStorage
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.core.content.edit
import androidx.core.net.toUri
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.getcapacitor.BridgeActivity
import com.getcapacitor.BridgeWebViewClient
import com.getcapacitor.WebViewListener
import org.codeai.SitePolicy.HOME_URL
import org.codeai.SitePolicy.SITE_ORIGIN

/**
 * Hosts the landing page and the curricula it opens in one WebView. The
 * landing page is always the first history entry; curricula load on top of
 * it from studio.code.org.
 */
class MainActivity : BridgeActivity() {
    private lateinit var hideSiteChrome: String
    private lateinit var prefs: SharedPreferences
    private var resumeUrl: String? = null
    // The launch screen with a spinner, over the window while a page loads.
    private var loadingCover: View? = null
    // Opened once the landing page is back: a course's congratulations, or
    // the first level after "Try again".
    private var pendingLandingUrl: String? = null
    // Set when the cover's logo cancels a load, which can leave the cancelled
    // page in history, even ahead of the landing page.
    private var clearHistoryOnLanding = false

    override fun onCreate(savedInstanceState: Bundle?) {
        // Before super.onCreate creates the WebView, which takes Accept-Language
        // and navigator.language from the default locale.
        SitePolicy.pinLocale()
        super.onCreate(savedInstanceState)
        CookieManager.getInstance().setCookie(SITE_ORIGIN, SitePolicy.LOCALE_COOKIE)
        val webView = bridge.webView
        // The first page is the bundled landing page, so no network request
        // has gone out before this runs.
        val settings = webView.settings
        settings.userAgentString =
            "${settings.userAgentString} ${SitePolicy.userAgentToken(BuildConfig.VERSION_NAME)}"
        // Every page, including window.open and target=_blank, loads in this
        // one WebView, so sessionStorage and session cookies carry across
        // pages. Capacitor lets scripts open windows; without multiple-window
        // support those open here.
        settings.setSupportMultipleWindows(false)
        // The page script zooms studio.code.org pages by setting their
        // viewport, which the WebView ignores outside wide-viewport mode.
        settings.useWideViewPort = true

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        resumeUrl = prefs.getString(LAST_PAGE_KEY, null)?.takeIf(SitePolicy::isSitePage)
        if (resumeUrl != null) {
            showLoadingCover()
        }

        // The page script offers zoom in debug builds only.
        hideSiteChrome = "var codeaiDebugBuild = ${BuildConfig.DEBUG};\n" +
            resources.openRawResource(R.raw.hide_site_chrome)
                .use { it.readBytes().toString(Charsets.UTF_8) }
        val pageInjector = PageInjector(SITE_ORIGIN, hideSiteChrome, settings.userAgentString)
        val assetCache = AssetCache(
            cacheDir.resolve("assets"),
            settings.userAgentString,
            setOf(bridge.localUrl, SITE_ORIGIN),
        )
        bridge.webViewClient = object : BridgeWebViewClient(bridge) {
            // Serves stored images and icon fonts from disk, and puts
            // hide_site_chrome.js into each studio.code.org page's <head> so
            // the site chrome is hidden before the first frame.
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest,
            ): WebResourceResponse? {
                if (SitePolicy.isBlockedHost(request.url)) {
                    return PageInjector.forbidden()
                }
                return assetCache.intercept(request)
                    ?: pageInjector.intercept(request)
                    ?: super.shouldInterceptRequest(view, request)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url
                // The WebView ignores navigation started inside this
                // callback, so go home once it has returned.
                if (SitePolicy.isHomeLink(url, view.url)) {
                    view.post { goHome() }
                    return true
                }
                if (SitePolicy.isResetUrl(url)) {
                    val next = url.getQueryParameter("next")?.takeIf(SitePolicy::isSitePage)
                    if (next != null) {
                        showLoadingCover()
                    }
                    view.post { resetSession(next) }
                    return true
                }
                if (SitePolicy.isCertificatePage(url)) {
                    pendingLandingUrl =
                        "${bridge.appUrl}$FINISHED_FRAGMENT${SitePolicy.finishedCourse(url)}"
                    view.post { goHome() }
                    return true
                }
                // A curriculum opened from the landing page can take a while
                // on a slow tablet; answer the tap at once.
                if (request.isForMainFrame
                    && isLandingPage(view.url)
                    && SitePolicy.isSitePage(url.toString())
                ) {
                    showLoadingCover()
                }
                // A free-play lab reopens the child's project instead of
                // starting another.
                val project = SitePolicy.newProjectLab(url)
                    ?.let { prefs.getString(PROJECT_KEY_PREFIX + it, null) }
                if (project != null) {
                    view.post { view.loadUrl(project) }
                    return true
                }
                if (isAppPage(url)) {
                    return super.shouldOverrideUrlLoading(view, request)
                }
                // Amazon Kids+ forbids links out of the app. Capacitor would
                // open other hosts in the system browser; ignore them instead,
                // and let iframes navigate in place.
                return request.isForMainFrame
            }

            // Also called for history.pushState, so in-page navigation counts.
            override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
                super.doUpdateVisitedHistory(view, url, isReload)
                rememberPage(url)
                val pending = pendingLandingUrl
                // Back, or no page left to wait for.
                if (isLandingPage(url) && pending == null && resumeUrl == null) {
                    hideLoadingCover()
                    if (clearHistoryOnLanding) {
                        clearHistoryOnLanding = false
                        // Once the landing page has committed.
                        view.post { view.clearHistory() }
                    }
                }
                if (pending != null && isLandingPage(url)) {
                    // Loaded by the app, not pushed by the page: Chromium's
                    // Back skips entries a page adds without a tap, which
                    // would make Back here leave the app.
                    pendingLandingUrl = null
                    view.post { view.loadUrl(pending) }
                }
            }

            // Pages PageInjector hands back to the WebView get the script when
            // they commit. The script's guard makes a second run a no-op.
            override fun onPageCommitVisible(view: WebView, url: String?) {
                super.onPageCommitVisible(view, url)
                if (SitePolicy.isSitePage(url)) {
                    view.evaluateJavascript(hideSiteChrome, null)
                }
            }

            override fun onPageFinished(view: WebView, url: String?) {
                super.onPageFinished(view, url)
                if (SitePolicy.isSitePage(url) && !pageInjector.wasRedirectStub(url)) {
                    hideLoadingCoverOnceSettled(view)
                }
            }

            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError,
            ) {
                super.onReceivedError(view, request, error)
                if (request.isForMainFrame) {
                    hideLoadingCover()
                }
            }
        }

        // Capacitor has started loading the landing page. Open the remembered
        // page on top of it, so Back still leads to the landing page.
        bridge.addWebViewListener(object : WebViewListener() {
            override fun onPageLoaded(webView: WebView) {
                val url = resumeUrl
                if (url != null && isLandingPage(webView.url)) {
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
        ViewCompat.setOnApplyWindowInsetsListener(findViewById<View>(R.id.app_root)) { view, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    or WindowInsetsCompat.Type.displayCutout()
                    or WindowInsetsCompat.Type.ime(),
            )
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        // Amazon Kids+ requires Back to return to the previous screen and to
        // exit from the landing page.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() = goBack()
        })
    }

    // Shows the launch screen and a spinner over the whole window until a
    // page has loaded, so a fresh start goes from it straight to the
    // remembered page and a tap on a curriculum shows at once. The WebView
    // stays visible underneath: a hidden one would tell its pages they are in
    // the background.
    private fun showLoadingCover() {
        if (loadingCover != null) {
            return
        }
        val content = findViewById<ViewGroup>(android.R.id.content)
        val cover = layoutInflater.inflate(R.layout.loading_cover, content, false)
        cover.findViewById<View>(R.id.loading_cover_logo).setOnClickListener { cancelLoading() }
        content.addView(cover)
        loadingCover = cover
        cover.postDelayed({ hideLoadingCover(cover) }, LOADING_COVER_TIMEOUT_MS)
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

    // Many pages fetch their content and render it after the load event, so
    // the cover waits until the page script says the page has settled, for
    // at most SETTLE_TIMEOUT_MS. The check runs only once the page's own
    // scripts let it.
    private fun hideLoadingCoverOnceSettled(view: WebView) {
        val cover = loadingCover ?: return
        val deadline = SystemClock.uptimeMillis() + SETTLE_TIMEOUT_MS
        fun check() {
            if (cover !== loadingCover) {
                return
            }
            if (SystemClock.uptimeMillis() >= deadline) {
                hideLoadingCover(cover)
                return
            }
            view.evaluateJavascript(SETTLED_CHECK) { settled ->
                if (settled == "true") {
                    hideLoadingCover(cover)
                } else {
                    view.postDelayed({ check() }, SETTLE_POLL_MS)
                }
            }
        }
        check()
    }

    private fun hideLoadingCover(cover: View? = loadingCover) {
        if (cover == null || cover !== loadingCover) {
            return
        }
        loadingCover = null
        cover.animate()
            .alpha(0f)
            .setDuration(LOADING_COVER_FADE_MS)
            .withEndAction { (cover.parent as? ViewGroup)?.removeView(cover) }
    }

    // The system resets the default locale when the device language changes;
    // pin it again and let the WebView reread it.
    override fun onConfigurationChanged(newConfig: Configuration) {
        SitePolicy.pinLocale()
        super.onConfigurationChanged(newConfig)
        bridge.webView.dispatchConfigurationChanged(newConfig)
    }

    override fun onPause() {
        super.onPause()
        // Android writes persistent cookies to disk only periodically.
        CookieManager.getInstance().flush()
    }

    private fun rememberPage(url: String?) {
        if (url == null) {
            return
        }
        if (isLandingPage(url)) {
            prefs.edit { remove(LAST_PAGE_KEY) }
        } else if (SitePolicy.isSitePage(url) && url != HOME_URL) {
            prefs.edit { putString(LAST_PAGE_KEY, url) }
            SitePolicy.projectEditorLab(url)?.let { lab ->
                prefs.edit { putString(PROJECT_KEY_PREFIX + lab, url) }
            }
        }
    }

    /**
     * Forgets everything the site keeps for this signed-out child, then
     * returns to the landing page, or opens [next] above it. Progress and
     * projects belong to the session cookie, the storage_id cookie and site
     * storage; the remembered pages are in prefs. Only the zoom is kept.
     */
    private fun resetSession(next: String?) {
        val cookies = CookieManager.getInstance()
        val zoom = SitePolicy.cookieValue(cookies.getCookie(SITE_ORIGIN), SitePolicy.ZOOM_COOKIE_NAME)
        cookies.removeAllCookies {
            cookies.setCookie(SITE_ORIGIN, SitePolicy.LOCALE_COOKIE)
            zoom?.let {
                cookies.setCookie(
                    SITE_ORIGIN,
                    "${SitePolicy.ZOOM_COOKIE_NAME}=$it; ${SitePolicy.COOKIE_ATTRIBUTES}",
                )
            }
            cookies.setCookie(
                SITE_ORIGIN,
                "${SitePolicy.RESET_COOKIE_NAME}=${System.currentTimeMillis()}; ${SitePolicy.COOKIE_ATTRIBUTES}",
            )
            cookies.flush()
            WebStorage.getInstance().deleteAllData()
            prefs.edit { clear() }
            pendingLandingUrl = next
            bridge.webView.post { goHome() }
        }
    }

    private fun goBack() {
        val webView = bridge.webView
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            finish()
        }
    }

    private fun goHome() {
        val webView = bridge.webView
        val history = webView.copyBackForwardList()
        val index = history.currentIndex
        if (index > 0 && isLandingPage(history.getItemAtIndex(0).url)) {
            // Traversed from the page: right after a tap, a lab page can drop
            // goBackOrForward() but not its own history.go().
            webView.evaluateJavascript("history.go(-$index)", null)
        } else {
            webView.loadUrl(bridge.appUrl)
        }
    }

    private fun isAppPage(url: Uri): Boolean =
        SitePolicy.isAllowedOrigin(url) || isLandingPage(url.toString())

    private fun isLandingPage(url: String?): Boolean {
        if (url == null) {
            return false
        }
        val localHost = bridge.localUrl.toUri().host
        return localHost != null && localHost == url.toUri().host
    }

    companion object {
        // The landing page opens its congratulations at #finished=<course>,
        // with the course empty when unknown. Keep in step with launcher.tsx.
        private const val FINISHED_FRAGMENT = "#finished="

        // The last studio.code.org page shown, so a fresh start resumes there.
        // Cleared on the landing page: a child who went home starts at home.
        private const val PREFS = "codeai_app"
        private const val LAST_PAGE_KEY = "last_page_url"
        // The project editor last shown for each free-play lab.
        private const val PROJECT_KEY_PREFIX = "project_"

        // Long enough for a lab to load on a slow tablet and connection;
        // after it the page shows as far as it has come.
        private const val LOADING_COVER_TIMEOUT_MS = 15_000L
        private const val LOADING_COVER_FADE_MS = 150L
        private const val SETTLE_TIMEOUT_MS = 5_000L
        private const val SETTLE_POLL_MS = 250L
        // A page without hide_site_chrome.js counts as settled.
        private const val SETTLED_CHECK =
            "typeof window.__codeaiSettled !== 'function' || window.__codeaiSettled()"
    }
}
