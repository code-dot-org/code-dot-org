---
title: App Lab Docs
---

[name]

## setStrokeColor(color)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Set the stroke color for the active canvas.

[/short_description]

The stroke color controls the color of lines drawn with [line](/applab/docs/line), [rect](/applab/docs/rect), and [circle](/applab/docs/circle). For circles and rectangles, the stroke color applies to the outline of the shape. The interior color of circles and rectangles is set using [`setFillColor()`](/applab/docs/setFillColor).

Setting the stroke color affects all subsequent [`line()`](/applab/docs/line), [`circle()`](/applab/docs/circle), and [`rect()`](/applab/docs/rect) calls. Any lines or shapes that have already been drawn are not affected.

Colors can be specified by name (eg, "red", "green", "blue") or by hex code (eg, "#FF000", "#00FF00", "#0000FF").

**Note**: A canvas element must be created before the stroke color can be changed. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `setStrokeColor()`.

[/description]

### Examples
____________________________________________________

[example]

This example draws two parallel lines in different colors.

<pre>
createCanvas(); //Create a canvas on which to draw
line(120, 50, 200, 50); //Draw a horizontal black line
setStrokeColor("red");
line(120, 75, 200, 75); //Draw a horizontal red line
</pre>

[/example]

____________________________________________________

[example]

This example draws a purple stick figure standing on green grass. It demonstrates how setting the color affects all subsequent lines and shapes drawn, until the color is changed.

<pre>
createCanvas("canvas", 320, 480); //Create a canvas on which to draw
setStrokeWidth(3);
setStrokeColor("purple"); // "purple" is the name for "#800080"
circle(160, 60, 40);
line(160, 100, 160, 260);
line(160, 260, 220, 420);
line(160, 260, 100, 420);
line(40, 130, 280, 130);
setStrokeColor("green"); // "green" is the name for "#008000"
setStrokeWidth(10);
line(0, 425, 320, 425);
</pre>

[/example]
____________________________________________________

[syntax]

### Syntax
<pre>
setStrokeColor(color)
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| color | string | Yes | The color name or hex value representing the color.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- `setStrokeColor` only affects the active canvas. If there is more than one canvas, each one can have a different stroke color.
- When a new canvas is created, its stroke color will be black.
- For an interactive tool that provides color hex values, see http://html-color-codes.info/.
- For a list of color names and corresponding hex codes, see http://www.w3schools.com/html/html_colornames.asp.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
