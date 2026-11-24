package org.codeai

import android.content.Context
import android.graphics.Rect
import android.graphics.RectF
import android.os.Bundle
import android.util.AttributeSet
import android.view.accessibility.AccessibilityNodeInfo
import android.view.accessibility.AccessibilityNodeProvider
import com.getcapacitor.CapacitorWebView
import kotlin.math.roundToInt

/**
 * The WebView, which [LandscapeFrame] can turn a quarter turn. Chromium
 * places the page on screen by adding the page's unturned offsets to the
 * view's location, both for accessibility bounds and for how much of the page
 * the window shows. A turned view's location is that of its turned corner, so
 * this reports where the view lies unturned and turns the accessibility
 * bounds Chromium builds from it.
 */
internal class AppWebView(context: Context, attrs: AttributeSet?) : CapacitorWebView(context, attrs) {
    private var turnedProvider: TurnedNodeProvider? = null

    // getLocationOnScreen() reads this too.
    override fun getLocationInWindow(outLocation: IntArray) {
        super.getLocationInWindow(outLocation)
        if (matrix.isIdentity) {
            return
        }
        val corner = floatArrayOf(0f, 0f)
        matrix.mapPoints(corner)
        outLocation[0] -= corner[0].roundToInt()
        outLocation[1] -= corner[1].roundToInt()
    }

    override fun getAccessibilityNodeProvider(): AccessibilityNodeProvider? {
        val provider = super.getAccessibilityNodeProvider() ?: return null
        return turnedProvider?.takeIf { it.provider === provider }
            ?: TurnedNodeProvider(provider).also { turnedProvider = it }
    }

    private fun turnBounds(node: AccessibilityNodeInfo) {
        if (matrix.isIdentity) {
            return
        }
        val location = IntArray(2)
        getLocationOnScreen(location)
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        val turned = RectF(bounds)
        turned.offset(-location[0].toFloat(), -location[1].toFloat())
        matrix.mapRect(turned)
        turned.offset(location[0].toFloat(), location[1].toFloat())
        turned.round(bounds)
        node.setBoundsInScreen(bounds)
    }

    private inner class TurnedNodeProvider(val provider: AccessibilityNodeProvider) : AccessibilityNodeProvider() {
        override fun createAccessibilityNodeInfo(virtualViewId: Int): AccessibilityNodeInfo? =
            provider.createAccessibilityNodeInfo(virtualViewId)?.also {
                // The framework fills in the WebView's own node, turned.
                if (virtualViewId != HOST_VIEW_ID) {
                    turnBounds(it)
                }
            }

        override fun findAccessibilityNodeInfosByText(text: String?, virtualViewId: Int): List<AccessibilityNodeInfo>? =
            provider.findAccessibilityNodeInfosByText(text, virtualViewId)?.onEach(::turnBounds)

        override fun findFocus(focus: Int): AccessibilityNodeInfo? = provider.findFocus(focus)?.also(::turnBounds)

        override fun performAction(virtualViewId: Int, action: Int, arguments: Bundle?): Boolean =
            provider.performAction(virtualViewId, action, arguments)

        override fun addExtraDataToAccessibilityNodeInfo(
            virtualViewId: Int,
            info: AccessibilityNodeInfo,
            extraDataKey: String,
            arguments: Bundle?,
        ) = provider.addExtraDataToAccessibilityNodeInfo(virtualViewId, info, extraDataKey, arguments)
    }
}
