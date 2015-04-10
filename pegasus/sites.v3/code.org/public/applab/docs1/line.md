---
title: App Lab Docs
---

[name]

## line(x1, y1, x2, y2)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Draw a line on the active canvas from x1, y1 to x2, y2.

[/short_description]

Lines are drawn using the current stroke width and current stroke color. Change the width of all subsequent lines drawn with [`setStrokeWidth`](/applab/docs/setStrokeWidth) (lines that have already been drawn will not be changed). Similarly, change the color of all subsequent lines drawn by calling [`setStrokeColor`](/applab/docs/setStrokeColor).

When drawing thick lines, the line coordinates define the center of the line. The ends of the line will be rounded, forming semi-circles beyond the ends of the line.

**Note**: A canvas element must be created before a line can be drawn. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `line()`.

[/description]

### Examples
____________________________________________________

[example]

<pre>
createCanvas(); //Create a canvas on which to draw
line(0, 0, 320, 480); //Draw a diagonal line from x:0 y:0 to x:320 y:480
</pre>

[/example]

____________________________________________________

[example]

<pre>
createCanvas(); //Create a canvas on which to draw
setStrokeColor("red"); //Change the active color for drawing lines and shapes
line(0, 0, 320, 480); //Draw a diagonal line from x:0 y:0 to x:320 y:480
</pre>

[/example]

____________________________________________________

[example]

This example shows how lines and shapes drawn outside the bounds of the canvas are not visible.

<pre>
createCanvas("canvas", 50, 50); //Create a 50x50 pixel canvas on which to draw
line(0, 0, 320, 480); //Draw a diagonal line beyond the bounds of the canvas
</pre>

[/example]

____________________________________________________

[example]

This example draws two lines between the same two points, but the first has a larger stroke width than the second. It shows how the stroke width affects how the line is drawn.

<pre>
createCanvas(); //Create a canvas on which to draw
setStrokeColor("lightblue"); //Set the active color to light blue
setStrokeWidth(20); //Set the thickness of lines to be drawn
line(0, 50, 320, 50); //Draw a thick blue horizontal line
setStrokeColor("black"); //Set the active color to black
setStrokeWidth(1); //Set the thickness of lines to be drawn
line(0, 50, 320, 50); //Draw a thin black line on top of the blue line
</pre>

[/example]

____________________________________________________

[example]

This example further demonstrates how stroke width affects lines. The ends of lines are rounded, so corners are also rounded.

<pre>
createCanvas(); //Create a canvas on which to draw
setStrokeColor("lightblue"); //Set the active color to light blue
setStrokeWidth(20); //Set the thickness of lines to be drawn
line(0, 50, 160, 50); //Draw a thick blue horizontal line
line(160, 50, 160, 380); //Draw a thick vertical line from the end of the first
setStrokeColor("black"); //Set the active color to black
setStrokeWidth(1); //Set the thickness of lines to be drawn
line(0, 50, 160, 50); //Draw a thin black line on top of the blue line
line(160, 50, 160, 380); //Draw a thin black line from the end of the first
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
line(x1, y1, x2, y2)
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x1 | number | Yes | The x position in pixels of the beginning of the line.  |
| y1 | number | Yes | The y position in pixels of the beginning of the line.  |
| x2 | number | Yes | The x position in pixels of the end of the line.  |
| y2 | number | Yes | The y position in pixels of the end of the line.  |
[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- If you're having trouble getting a line to show up, make sure a [canvas is created](/applab/docs/createCanvas) first and that where you're trying to draw the line is within the bounds of the canvas.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
