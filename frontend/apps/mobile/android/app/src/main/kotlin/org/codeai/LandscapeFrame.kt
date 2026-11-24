package org.codeai

import android.content.Context
import android.content.res.Configuration
import android.util.AttributeSet
import android.view.Surface
import android.widget.FrameLayout

/**
 * Lays its children out in landscape whatever the shape of the window.
 * Android 16 ignores the activity's landscape lock on large screens, so a
 * tablet held upright gives the app a portrait window. There the children are
 * measured with width and height swapped and turned a quarter turn, to stay
 * where the last landscape screen showed them: turning the tablet upright
 * moves nothing, and only the half turn between the two landscapes rotates
 * the page.
 */
internal class LandscapeFrame @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : FrameLayout(context, attrs) {
    // Display rotation, in quarter turns, of the last landscape window.
    private var landscapeRotation: Int? = null

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (!isSideways(resources.configuration)) {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
            return
        }
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)
        super.onMeasure(
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
        )
        setMeasuredDimension(width, height)
    }

    // Every child fills the frame, so turning each about its own center turns
    // them together.
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        val width = right - left
        val height = bottom - top
        val rotation = display?.rotation ?: Surface.ROTATION_0
        val sideways = isSideways(resources.configuration)
        if (!sideways) {
            landscapeRotation = rotation
        }
        // A display at rotation r draws a quarter turn clockwise per step, so
        // the children turn by the steps between r and the landscape they
        // keep; with no landscape seen yet, a quarter turn clockwise.
        val turn = if (sideways) quarterTurns((landscapeRotation ?: (rotation + 1)) - rotation) else 0
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (sideways) {
                val childLeft = (width - height) / 2
                val childTop = (height - width) / 2
                child.layout(childLeft, childTop, childLeft + height, childTop + width)
            } else {
                child.layout(0, 0, width, height)
            }
            child.rotation = 90f * turn
        }
    }

    companion object {
        fun isSideways(configuration: Configuration): Boolean =
            configuration.orientation == Configuration.ORIENTATION_PORTRAIT

        // Quarter turns as -1, 0, 1 or 2.
        private fun quarterTurns(steps: Int): Int = ((steps % 4) + 5) % 4 - 1
    }
}
