package org.codeai

import android.content.res.Resources
import android.webkit.WebView
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.codeai.SitePolicy.SITE_ORIGIN
import org.json.JSONObject

/** Set by the page script as it starts, so a second run in the page does nothing. */
internal const val PAGE_SCRIPT_GUARD = "__codeaiPageScript"

// The page script's files in res/raw, in the order they run. The workarounds
// patch the site's cookies, storage and APIs before its own scripts run, and
// page_watch.js, last, applies what the others register.
private val PAGE_SCRIPT_FILES = listOf(
    R.raw.page_common,
    R.raw.page_settled,
    R.raw.workaround_stable_id,
    R.raw.workaround_signed_out_progress,
    R.raw.page_started_navigation,
    R.raw.workaround_resume,
    R.raw.page_zoom,
    R.raw.workaround_english_only,
    R.raw.page_site_chrome,
    R.raw.page_debug_controls,
    R.raw.workaround_webview_compat,
    R.raw.page_watch,
)

/**
 * The script the app puts in every studio.code.org page: the files above in
 * one function, so they share a scope, after the values they read from the
 * app. It runs in the top page only; a document-start script also reaches
 * studio.code.org iframes.
 */
internal fun pageScript(resources: Resources, stableId: String?, resetToken: String?): String {
    val files = PAGE_SCRIPT_FILES.joinToString("\n") { id ->
        resources.openRawResource(id).use { it.readBytes().toString(Charsets.UTF_8) }
    }
    return "var codeaiDebugBuild = ${BuildConfig.DEBUG};\n" +
        "var codeaiStableId = ${JSONObject.quote(stableId ?: "")};\n" +
        "var codeaiResetToken = ${JSONObject.quote(resetToken ?: "")};\n" +
        "(function () {\n" +
        "if (window.top !== window || window.$PAGE_SCRIPT_GUARD) {\n  return;\n}\n" +
        "window.$PAGE_SCRIPT_GUARD = true;\n" +
        files +
        "})();\n"
}

/**
 * Adds [script] to every studio.code.org page [webView] loads, before the
 * page's own scripts run, and answers whether it could. A WebView without
 * document-start scripts, such as an outdated one, gets the script from
 * AppWebViewClient when each page first shows instead.
 */
internal fun addPageScript(webView: WebView, script: String): Boolean {
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
        return false
    }
    WebViewCompat.addDocumentStartJavaScript(webView, script, setOf(SITE_ORIGIN))
    return true
}
