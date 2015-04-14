---
title: App Lab Docs
---

[name]

## clearCanvas()

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Clear all data on the active canvas.

[/short_description]

Clearing a canvas is typically done after some event, so that whatever was drawn has a chance to be seen before it is erased. Examples below will make use of [`setTimeout()`](/applab/docs/setTimeout) and [`onEvent()`](/applab/docs/onEvent) to more clearly demonstrate `clearCanvas`.

**Note**: When a canvas element is created, it will have no data to clear. Create a canvas element in Design mode, or call [`createCanvas()`](/applab/docs/createCanvas).

[/description]

### Examples
____________________________________________________

[example]

This example draws a square and then erases it, leaving the screen empty. The drawing is erased so fast that it cannot be seen.

<pre>
// Create a canvas and draw a square in its center
createCanvas();
setStrokeWidth(10);
rect(120, 200, 80, 80);
// Clear the canvas right away
clearCanvas();
</pre>

[/example]

____________________________________________________

[example]

This example draws a square, then uses [`setTimeout()`](/applab/docs/setTimeout) to wait 3000 milliseconds (3 seconds) before clearing the canvas.

<pre>
// Create a canvas and draw a square in its center
createCanvas();
setStrokeWidth(10);
rect(120, 200, 80, 80);
// Clear the canvas after 3 seconds
setTimeout(function() {
    clearCanvas();
}, 3000);
</pre>

[/example]

____________________________________________________

[example]

This example uses [`onEvent()`](/applab/docs/onEvent) to draw a circle wherever the canvas is clicked. Each time the canvas is clicked, the canvas is cleared and a new circle is drawn. This ensures that only one circle is visible at a time.

<pre>
textLabel("instruction", "Click on the screen below this text...");
createCanvas("canvas");
onEvent("canvas", "click", function(click) {
  clearCanvas(); // Erase anything that was drawn before the click
  circle(click.offsetX, click.offsetY, 20); // Draw a circle where the click occurred
});
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
clearCanvas();
</pre>

[/syntax]

[parameters]

### Parameters

`clearCanvas()` has no parameters.

[/parameters]

[returns]

### Returns

No return value. Outputs to the display only.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
