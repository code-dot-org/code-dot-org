---
title: App Lab Docs
---

[name]

## setStrokeWidth(width)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Set line width for the active canvas.

[/short_description]

The stroke width controls the thickness of lines drawn with [line](/applab/docs/line), [rect](/applab/docs/rect), and [circle](/applab/docs/circle). The width is measured in pixels. As the stroke width increases, the lines drawn get thicker equally on both sides.

Setting the stroke width affects all subsequent [`line()`](/applab/docs/line), [`circle()`](/applab/docs/circle), and [`rect()`](/applab/docs/rect) calls. Any lines or shapes that have already been drawn are not affected.

**Note**: A canvas element must be created before the stroke width can be changed. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `setStrokeWidth()`.

[/description]

### Examples
____________________________________________________

[example]

This example draws two parallel lines that start and end at the same x coordinates, but have different stroke widths. Because the lines have rounded ends, the thicker line is in fact longer than the thinner line.

<pre>
createCanvas(); //Create a canvas on which to draw
line(120, 50, 200, 50); //Draw a horizontal line with the default stroke width
setStrokeWidth(20);
line(120, 75, 200, 75); //Draw a horizontal line with width 20
</pre>

[/example]

____________________________________________________

[example]

This example draws two lines with the same start and end point, but with different stroke widths. Thicker strokes expand the line equally on both sides.

<pre>
createCanvas(); //Create a canvas on which to draw
setStrokeColor("lightblue");
setStrokeWidth(20);
line(0, 50, 320, 50); //Draw a thick blue horizontal line
setStrokeColor("black");
setStrokeWidth(1);
line(0, 50, 320, 50); //Draw a thin black line on top of the blue line
</pre>

[/example]

____________________________________________________

[example]

This example draws two circles at the same location and with the same radius. The first circle has a thick stroke width and the second has a thin stroke width. The resulting image shows how a thicker stroke increases the outer radius of the circle.

<pre>
createCanvas(); //Create a canvas on which to draw
setStrokeWidth(40); //Change the thickness of lines to be drawn
setStrokeColor("lightblue");
circle(160, 240, 100); //Draw a circle with a thick border
setStrokeWidth(1); //Change the thickness of lines to be drawn
setStrokeColor("black");
circle(160, 240, 100); //Draw the same circle with narrow border
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setStrokeWidth(width)
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| width | number | Yes | The width in pixels with which to draw lines, circles, and rectangles.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- `setStrokeWidth` only affects the active canvas. If there is more than one canvas, each one can have a different stroke width.
- When a new canvas is created, its stroke width will be the default value of 1 pixel.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
