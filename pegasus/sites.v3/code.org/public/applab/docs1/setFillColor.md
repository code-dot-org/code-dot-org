---
title: App Lab Docs
---

[name]

## setFillColor(color)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Set the fill color for the active canvas.

[/short_description]

The fill color controls the interior color of shapes drawn with [rect](/applab/docs/rect) and [circle](/applab/docs/circle). The outline color of circles and rectangles is set using [`setStrokeColor()`](/applab/docs/setStrokeColor). To draw only the outline of a rectangle or circle (unfilled), set the fill color to `"transparent"`.

Setting the fill color affects all subsequent [`rect()`](/applab/docs/rect) and [`circle()`](/applab/docs/circle) calls. Any shapes that have already been drawn are not affected.

Colors can be specified by name (eg, "red", "green", "blue") or by hex code (eg, "#FF000", "#00FF00", "#0000FF").

**Note**: A canvas element must be created before the fill color can be changed. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `setFillColor()`.

[/description]

### Examples
____________________________________________________

[example]

This example draws an empty circle in the middle of the screen.

<pre>
createCanvas(); //Create a canvas on which to draw
circle(160, 240, 100); // Draw an empty circle centered at x:160 y:240
</pre>

[/example]

____________________________________________________

[example]

This example draws a worried emoticon face using filled shapes.

<pre>
createCanvas(); //Create a canvas on which to draw
setFillColor("yellow");
circle(160, 240, 100); // Draw a big, yellow circle for a head
setFillColor("black");
circle(125, 215, 20); // Draw two solid black circles for eyes
circle(195, 215, 20);
setFillColor("white");
rect(100, 260, 120, 20); // Draw a white rectangle for a mouth

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setFillColor(color)
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-------|------|-----------|-------------|
| color | string | Yes | The color name or hex value representing the color.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- `setFillColor` only affects the active canvas. If there is more than one canvas, each one can have a different fill color.
- When a new canvas is created, its fill color will be transparent.
- For an interactive tool that provides color hex values, see http://html-color-codes.info/.
- For a list of color names and corresponding hex codes, see http://www.w3schools.com/html/html_colornames.asp.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
