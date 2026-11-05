package org.codeai

import android.annotation.SuppressLint
import android.app.Activity
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityNodeInfo
import android.webkit.WebView

/**
 * The launch screen and a spinner over the whole window while a page loads,
 * so a fresh start goes from it straight to the remembered page and a tap on
 * a curriculum shows at once. The WebView stays visible underneath: a hidden
 * one would tell its pages they are in the background. [onHome] runs when its
 * logo is tapped.
 */
internal class LoadingCover(
    private val activity: Activity,
    private val webView: WebView,
    private val onHome: () -> Unit,
) {
    private var cover: View? = null

    @SuppressLint("AccessibilityFocus")
    fun show() {
        if (cover != null) {
            return
        }
        // Inside the root's system-bar padding, so its header sits where the
        // page's does and the bars keep the root's purple.
        val root = activity.findViewById<ViewGroup>(R.id.app_root)
        val shown = activity.layoutInflater.inflate(R.layout.loading_cover, root, false)
        val home = shown.findViewById<View>(R.id.loading_cover_logo)
        home.setOnClickListener { onHome() }
        root.addView(shown)
        cover = shown
        setPageCovered(true)
        // Keyboard and screen reader focus start on the home control; the
        // node a screen reader had focused may have left with the page.
        home.post {
            home.requestFocus()
            home.performAccessibilityAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS, null)
        }
        shown.postDelayed({ hide(shown) }, TIMEOUT_MS)
    }

    fun hide() = hide(cover)

    // Many pages fetch their content and render it after the load event, so
    // the cover waits until the page script says the page has settled, for
    // at most SETTLE_TIMEOUT_MS. The check runs only once the page's own
    // scripts let it.
    fun hideOnceSettled() {
        val shown = cover ?: return
        val deadline = SystemClock.uptimeMillis() + SETTLE_TIMEOUT_MS
        fun check() {
            if (shown !== cover) {
                return
            }
            if (SystemClock.uptimeMillis() >= deadline) {
                hide(shown)
                return
            }
            webView.evaluateJavascript(SETTLED_CHECK) { settled ->
                if (settled == "true") {
                    hide(shown)
                } else {
                    webView.postDelayed({ check() }, SETTLE_POLL_MS)
                }
            }
        }
        check()
    }

    private fun hide(shown: View?) {
        if (shown == null || shown !== cover) {
            return
        }
        cover = null
        setPageCovered(false)
        shown.animate()
            .alpha(0f)
            .setDuration(FADE_MS)
            .withEndAction { (shown.parent as? ViewGroup)?.removeView(shown) }
    }

    // The cover takes touches, and while it shows, screen readers and
    // keyboards reach only it too: the WebView and the page in it leave the
    // accessibility tree and cannot take focus.
    private fun setPageCovered(covered: Boolean) {
        if (covered) {
            webView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
            webView.descendantFocusability = ViewGroup.FOCUS_BLOCK_DESCENDANTS
            webView.isFocusable = false
            webView.clearFocus()
        } else {
            webView.importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_AUTO
            webView.descendantFocusability = ViewGroup.FOCUS_BEFORE_DESCENDANTS
            webView.isFocusable = true
        }
    }

    private companion object {
        // Long enough for a lab to load on a slow tablet and connection;
        // after it the page shows as far as it has come.
        const val TIMEOUT_MS = 15_000L
        const val FADE_MS = 150L
        const val SETTLE_TIMEOUT_MS = 5_000L
        const val SETTLE_POLL_MS = 250L
        // A page without hide_site_chrome.js counts as settled.
        const val SETTLED_CHECK =
            "typeof window.__codeaiSettled !== 'function' || window.__codeaiSettled()"
    }
}
