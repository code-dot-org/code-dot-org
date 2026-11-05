package org.codeai

import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.core.net.toUri
import com.getcapacitor.BridgeWebViewClient
import org.codeai.SitePolicy.FINISHED_FRAGMENT
import org.json.JSONObject

/**
 * Decides where the app's WebView may go, and serves stored images and icon
 * fonts from disk. Where the WebView has no document-start scripts
 * ([injectOnCommit]), each studio.code.org page gets the page script
 * (PageScript.kt) when it first shows. [app] holds the navigation state and
 * acts on it.
 */
internal class AppWebViewClient(
    private val app: MainActivity,
    private val assetCache: AssetCache,
    private val pageScript: String,
    private val injectOnCommit: Boolean,
    private val stableId: String?,
) : BridgeWebViewClient(app.bridge) {
    private val bridge = app.bridge

    override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest,
    ): WebResourceResponse? {
        if (SitePolicy.isBlockedHost(request.url)) {
            return WebResponses.forbidden()
        }
        // shouldOverrideUrlLoading never sees a POST, such as a form sent to
        // another site.
        if (request.isForMainFrame && !app.isAppPage(request.url)) {
            return WebResponses.noContent()
        }
        // The site's scripts use the ID they fetch, not the device's that the
        // page script then stores in the cookie in its place.
        if (stableId != null
            && request.method.equals("GET", ignoreCase = true)
            && SitePolicy.isStableIdRequest(request.url)
        ) {
            return WebResponses.plainText(stableId)
        }
        return assetCache.intercept(request)
            ?: super.shouldInterceptRequest(view, request)
    }

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        // Only the page itself goes home, resets, finishes or leaves the site;
        // an iframe, which may be another site's, navigates in place.
        if (!request.isForMainFrame) {
            return false
        }
        val url = request.url
        // The WebView ignores navigation started inside this callback, so go
        // home once it has returned.
        if (SitePolicy.leadsHome(url)) {
            view.post { app.goHome() }
            return true
        }
        // Only the app opens it, so a link cannot put Try again under the
        // child's finger.
        if (SitePolicy.isFinishedScreen(url, bridge.localUrl)) {
            return true
        }
        if (SitePolicy.isResetUrl(url)) {
            val course = SitePolicy.resetCourse(url)
            if (course == null || !SitePolicy.mayReset(url, view.url, bridge.appUrl, app.resetToken)) {
                return true
            }
            val next = url.getQueryParameter("next")?.takeIf(SitePolicy::isSitePage)
            if (next != null) {
                app.loadingCover.show()
            }
            view.post { app.resetCourse(course, next) }
            return true
        }
        // A link in another site's iframe can navigate the page too, so the
        // congratulations, whose Try again resets a course, opens only for a
        // page load the page started itself.
        if (SitePolicy.isCertificatePage(url)) {
            view.post { finishCourse(view, url, request.isRedirect) }
            return true
        }
        // A curriculum opened from the landing page can take a while on a
        // slow tablet; answer the tap at once.
        if (app.isBundledPage(view.url) && SitePolicy.isSitePage(url.toString())) {
            app.loadingCover.show()
        }
        // A free-play lab reopens the child's project instead of starting
        // another.
        val project = SitePolicy.newProjectLab(url)?.let(app::rememberedProject)
        if (project != null) {
            view.post { view.loadUrl(project) }
            return true
        }
        if (app.isAppPage(url)) {
            return super.shouldOverrideUrlLoading(view, request)
        }
        // Amazon Kids+ allows no links out of its environment. Capacitor would
        // open other hosts in the system browser; ignore them instead. This
        // also refuses a studio.code.org redirect to another site, such as
        // /help to support.code.org; the page in front stays, uncovered.
        view.post { app.loadingCover.hide() }
        return true
    }

    // A last check: a WebView may follow a redirect after a POST, which
    // shouldOverrideUrlLoading never sees, to another site.
    override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        if (url != null && !app.isAppPage(url.toUri())) {
            view.stopLoading()
            view.post { app.goBack() }
        } else if (url != null && SitePolicy.leadsHome(url.toUri())) {
            // Reached by a redirect shouldOverrideUrlLoading did not see.
            view.stopLoading()
            view.post { app.goHome() }
        }
    }

    // Also called for history.pushState, so in-page navigation counts.
    override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
        super.doUpdateVisitedHistory(view, url, isReload)
        app.rememberPage(url)
        if (app.clearHistoryOnOffline && app.isOfflinePage(url)) {
            app.clearHistoryOnOffline = false
            // Drops the failed page's error entry, which Back would retry.
            view.post { view.clearHistory() }
        }
        val pending = app.pendingLandingUrl
        // Back, or no page left to wait for.
        if (app.isBundledPage(url) && pending == null && app.resumeUrl == null) {
            app.loadingCover.hide()
            if (app.clearHistoryOnLanding) {
                app.clearHistoryOnLanding = false
                // Once the landing page has committed.
                view.post { view.clearHistory() }
            }
        }
        if (pending != null && app.isBundledPage(url)) {
            // Loaded by the app, not pushed by the page: Chromium's Back skips
            // entries a page adds without a tap, which would make Back here
            // leave the app.
            app.pendingLandingUrl = null
            view.post { view.loadUrl(pending) }
        }
    }

    // Later than a document-start script: the site chrome shows for a moment.
    override fun onPageCommitVisible(view: WebView, url: String?) {
        super.onPageCommitVisible(view, url)
        if (injectOnCommit && SitePolicy.isSitePage(url)) {
            view.evaluateJavascript(pageScript, null)
        }
    }

    override fun onPageFinished(view: WebView, url: String?) {
        super.onPageFinished(view, url)
        if (SitePolicy.isSitePage(url)) {
            app.loadingCover.hideOnceSettled()
        }
    }

    override fun onReceivedError(
        view: WebView,
        request: WebResourceRequest,
        error: WebResourceError,
    ) {
        super.onReceivedError(view, request, error)
        if (!request.isForMainFrame) {
            return
        }
        // A studio.code.org page that cannot load, as when the tablet is
        // offline, shows the landing page's offline screen, not the
        // WebView's own error page.
        val url = request.url.toString()
        if (SitePolicy.isSitePage(url)) {
            view.post { app.showOffline(url) }
        } else {
            app.loadingCover.hide()
        }
    }

    // Opens the landing page's congratulations for the certificate page [url]
    // if the page in front started that load. When both callbacks report the
    // same load, the second check finds the record taken and does nothing.
    private fun finishCourse(view: WebView, url: Uri, redirect: Boolean) {
        val landing = "${bridge.appUrl}$FINISHED_FRAGMENT${SitePolicy.finishedCourse(url)}"
        view.evaluateJavascript(startedNavigationCheck(url.toString(), redirect)) { started ->
            if (started == "true") {
                app.pendingLandingUrl = landing
                app.goHome()
            }
        }
    }

    // Takes the page script's record of the last page load the page started:
    // [target] itself, or for a redirect any. A WebView without the
    // Navigation API keeps no record and is trusted.
    private fun startedNavigationCheck(target: String, redirect: Boolean): String =
        "(function () {" +
            "var key = 'codeai_started_navigation', started = null;" +
            "try { started = sessionStorage.getItem(key); sessionStorage.removeItem(key); } catch (e) {}" +
            "return !window.navigation || started === ${JSONObject.quote(target)}" +
            " || ($redirect && started !== null);" +
            "})()"
}
