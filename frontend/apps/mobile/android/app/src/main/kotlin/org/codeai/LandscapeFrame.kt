package org.codeai

import android.content.Context
import android.content.res.Configuration
import android.util.AttributeSet
import android.view.Surface
import android.widget.FrameLayout

/**
 * Lays its children out in landscape whatever the shape of the window.
 * Android 16 ignores the activity's landscape lock on large screens, so a
 * tablet held upright gives the app a portrait window, as split screen can on
 * any version. There the children are measured with width and height swapped
 * and turned a quarter turn, to stay where the last landscape screen showed
 * them: turning the tablet upright moves nothing, and only the half turn
 * between the two landscapes rotates the page.
 */
internal class LandscapeFrame @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : FrameLayout(context, attrs) {
    // Display rotation, in quarter turns, of the landscape the children keep.
    private var landscapeRotation: Int? = null

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (!isSideways(resources.configuration)) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        super.onMeasure(
            MeasureSpec.makeMeasureSpec(sidewaysWidth(width, height), MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        )
        setMeasuredDimension(width, height)
    }

    // Every child gets the same box, so turning each about its own center
    // turns them together.
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        val width = right - left
        val height = bottom - top
        val rotation = display?.rotation ?: Surface.ROTATION_0
        val sideways = isSideways(resources.configuration)
        val kept = landscapeRotation
        // A display at rotation r draws a quarter turn clockwise per step, so
        // the children turn by the steps between r and the landscape they
        // keep. A sideways window needs an odd number; when the kept one is
        // missing, as on a cold start upright, or even, as in a split-screen
        // pane, they keep the one a step clockwise of r.
        val landscape = when {
            !sideways -> rotation
            kept != null && (kept - rotation) % 2 != 0 -> kept
            else -> (rotation + 1) % 4
        }
        landscapeRotation = landscape
        val turn = quarterTurns(landscape - rotation)
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (sideways) {
                val childWidth = sidewaysWidth(width, height)
                val childLeft = (width - childWidth) / 2
                val childTop = (childWidth - width) / 2
                child.layout(childLeft, childTop, childLeft + childWidth, childTop + width)
            } else {
                child.layout(0, 0, width, height)
            }
            child.rotation = 90f * turn
        }
    }

    companion object {
        private fun isSideways(configuration: Configuration): Boolean =
            configuration.orientation == Configuration.ORIENTATION_PORTRAIT

        // The width of a sideways child: the frame's height, but at least the
        // frame's width, so a frame a tall keyboard leaves shorter than it is
        // wide gets a square page running on under the keyboard, not a portrait
        // one.
        private fun sidewaysWidth(width: Int, height: Int): Int = maxOf(width, height)

        // Quarter turns as -1, 0, 1 or 2.
        private fun quarterTurns(steps: Int): Int = ((steps % 4) + 5) % 4 - 1
    }
}
