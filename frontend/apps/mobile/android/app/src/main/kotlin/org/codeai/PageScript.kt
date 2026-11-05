package org.codeai

import android.content.res.Resources
import org.json.JSONObject

/** Set by the page script as it starts, and by PageInjector's redirect stubs to keep it out. */
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
 * app. A page given it twice, by PageInjector and again when it commits,
 * runs it once.
 */
internal fun pageScript(resources: Resources, stableId: String?, resetToken: String?): String {
    val files = PAGE_SCRIPT_FILES.joinToString("\n") { id ->
        resources.openRawResource(id).use { it.readBytes().toString(Charsets.UTF_8) }
    }
    return "var codeaiDebugBuild = ${BuildConfig.DEBUG};\n" +
        "var codeaiStableId = ${JSONObject.quote(stableId ?: "")};\n" +
        "var codeaiResetToken = ${JSONObject.quote(resetToken ?: "")};\n" +
        "(function () {\n" +
        "if (window.$PAGE_SCRIPT_GUARD) {\n  return;\n}\n" +
        "window.$PAGE_SCRIPT_GUARD = true;\n" +
        files +
        "})();\n"
}
