package org.codeai

import android.content.res.Resources
import android.view.Menu
import android.view.textclassifier.TextClassifier
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.core.view.get
import androidx.core.view.size
import androidx.webkit.UserAgentMetadata
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature

/** Settings the app's one WebView needs before its first page loads. */
internal fun setUpWebView(webView: WebView) {
    // The first page is the bundled landing page, so no network request has
    // gone out before this runs.
    val settings = webView.settings
    settings.userAgentString =
        "${settings.userAgentString} ${SitePolicy.userAgentToken(BuildConfig.VERSION_NAME)}"
    addAppBrand(settings)
    // Every page, including window.open and target=_blank, loads in this one
    // WebView, so sessionStorage and session cookies carry across pages.
    // Capacitor lets scripts open windows; without multiple-window support
    // those open here.
    settings.setSupportMultipleWindows(false)
    // Selected text that looks like a web address or phone number would
    // offer to open it in another app.
    webView.setTextClassifier(TextClassifier.NO_OP)
    // The page script zooms studio.code.org pages by setting their viewport,
    // which the WebView ignores outside wide-viewport mode.
    settings.useWideViewPort = true
}

// Names the app in the WebView's brand list too (navigator.userAgentData and
// the Sec-CH-UA headers), as a browser built on Chromium names itself. Older
// WebViews lack the feature and keep only the User-Agent token.
private fun addAppBrand(settings: WebSettings) {
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.USER_AGENT_METADATA)) {
        return
    }
    val metadata = WebSettingsCompat.getUserAgentMetadata(settings)
    val version = BuildConfig.VERSION_NAME
    val app = UserAgentMetadata.BrandVersion.Builder()
        .setBrand(SitePolicy.USER_AGENT_PRODUCT)
        .setMajorVersion(version.substringBefore('.'))
        .setFullVersion(version)
        .build()
    WebSettingsCompat.setUserAgentMetadata(
        settings,
        UserAgentMetadata.Builder(metadata)
            .setBrandVersionList(metadata.brandVersionList + app)
            .build(),
    )
}

// Selecting text offers Share and other apps' actions, each a way out of the
// app, which Amazon Kids+ does not allow. The WebView names its own items in
// [webViewResources], its package's resources, not in android.R.
internal fun hideLeavingActions(menu: Menu, webViewResources: Resources?) {
    for (i in 0 until menu.size) {
        val item = menu[i]
        val name = webViewResources?.let { runCatching { it.getResourceEntryName(item.itemId) }.getOrNull() }
        if (item.intent != null || item.itemId in LEAVING_ACTIONS || name in LEAVING_WEBVIEW_ACTIONS) {
            item.isVisible = false
        }
    }
}

private val LEAVING_ACTIONS = setOf(android.R.id.shareText, android.R.id.textAssist)
private val LEAVING_WEBVIEW_ACTIONS = setOf("select_action_menu_share", "select_action_menu_web_search")
