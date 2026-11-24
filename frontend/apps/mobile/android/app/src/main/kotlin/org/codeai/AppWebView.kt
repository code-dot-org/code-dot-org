package org.codeai

import android.content.Context
import android.graphics.Rect
import android.graphics.RectF
import android.os.Bundle
import android.util.AttributeSet
import android.view.accessibility.AccessibilityNodeInfo
import android.view.accessibility.AccessibilityNodeProvider
import androidx.core.os.BundleCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.getcapacitor.CapacitorWebView
import kotlin.math.roundToInt

/**
 * The WebView, which [LandscapeFrame] can turn a quarter turn. Chromium
 * places the page on screen by adding the page's unturned offsets to the
 * view's location, both for accessibility bounds and for how much of the page
 * the window shows. A turned view's location is that of its turned corner, so
 * this reports where the view lies unturned and turns the accessibility
 * bounds and character boxes Chromium builds from it.
 */
internal class AppWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : CapacitorWebView(context, attrs) {
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
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        val turned = RectF(bounds)
        turnOnScreen(turned, IntArray(2).also(::getLocationOnScreen))
        turned.round(bounds)
        node.setBoundsInScreen(bounds)
    }

    // A box Chromium placed by the unturned [location] on screen.
    private fun turnOnScreen(box: RectF, location: IntArray) {
        box.offset(-location[0].toFloat(), -location[1].toFloat())
        matrix.mapRect(box)
        box.offset(location[0].toFloat(), location[1].toFloat())
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
        ) {
            if (matrix.isIdentity || (extraDataKey != CHARACTERS_ON_SCREEN && extraDataKey != CHARACTERS_IN_WINDOW)) {
                provider.addExtraDataToAccessibilityNodeInfo(virtualViewId, info, extraDataKey, arguments)
                return
            }
            // Chromium clips the in-window character boxes by the screen
            // location, so both kinds come from the on-screen boxes.
            provider.addExtraDataToAccessibilityNodeInfo(virtualViewId, info, CHARACTERS_ON_SCREEN, arguments)
            val extras = info.extras
            val boxes = BundleCompat.getParcelableArray(extras, CHARACTERS_ON_SCREEN, RectF::class.java) ?: return
            extras.remove(CHARACTERS_ON_SCREEN)
            val screen = IntArray(2).also(::getLocationOnScreen)
            val window = IntArray(2).also(::getLocationInWindow)
            for (box in boxes) {
                // An empty box stands for a character hidden from view.
                if (box !is RectF || box.isEmpty) {
                    continue
                }
                turnOnScreen(box, screen)
                if (extraDataKey == CHARACTERS_IN_WINDOW) {
                    box.offset((window[0] - screen[0]).toFloat(), (window[1] - screen[1]).toFloat())
                }
            }
            extras.putParcelableArray(extraDataKey, boxes)
        }
    }

    private companion object {
        const val CHARACTERS_ON_SCREEN = AccessibilityNodeInfoCompat.EXTRA_DATA_TEXT_CHARACTER_LOCATION_KEY
        const val CHARACTERS_IN_WINDOW = AccessibilityNodeInfoCompat.EXTRA_DATA_TEXT_CHARACTER_LOCATION_IN_WINDOW_KEY
    }
}
