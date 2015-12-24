---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## circle(x, y, radius)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Draws a circle on the active canvas with the specified radius, and center at coordinates: (x, y).

[/short_description]

The x and y coordinates specify the center of the circle, relative to the top-left corner of the canvas (x:0 y:0). The radius is measured in pixels.

Circles are drawn using the current stroke width and current stroke color, and then filled with the current fill color. Change the width of the line used to draw all subsequent circles using  [`setStrokeWidth`](/applab/docs/setStrokeWidth) (circles that have already been drawn will not be changed). Similarly, change the color of the line used to draw all subsequent circles using [`setStrokeColor`](/applab/docs/setStrokeColor).

Circles are filled with the active fill color. When the fill color is anything other than `"transparent"`, the interior of the circle will be filled-in with that color, covering anything that was previously drawn in that area.

The default fill color is `"transparent"`, which leaves the area inside the circle untouched. After changing the fill color, you can go back to drawing unfilled circles by calling [`setFillColor("transparent")`](/applab/docs/setFillColor).

When drawing thick lines, the radius of the circle defines the center of the perimeter line. The outside radius of the circle will be the specified radius plus half the stroke width.

**Note**: A canvas element must be created before a circle can be drawn. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `circle()`.

[/description]

### Examples
____________________________________________________

[example]

This example demonstrates how to draw a circle in the middle of the window. If the window is 320x480 pixels, then the center of the window is at x:160 y:240.


```
createCanvas(); //Create a canvas on which to draw
circle(160, 240, 100); //Draw a circle centered in the window
```

[/example]

____________________________________________________

[example]

This example demonstrates how to change the color of the circle, using [`setStrokeColor`]().


```
createCanvas(); //Create a canvas on which to draw
setStrokeColor("red"); //Change the active color for drawing lines and shapes
circle(160, 240, 100); //Draw a circle centered in the window
```

[/example]

____________________________________________________

[example]

This example demonstrates how to draw a filled circle, using [`setFillColor`]().


```
createCanvas(); //Create a canvas on which to draw
setFillColor("red"); //Change the active color for filling circles and rectangles
circle(160, 240, 100); //Draw a filled circle centered in the window
```

[/example]

____________________________________________________

[example]

This example demonstrates how to change the thickness of the circle border using [`setStrokeWidth`]().


```
createCanvas(); //Create a canvas on which to draw
setStrokeWidth(20); //Change the thickness of lines to be drawn
circle(160, 240, 100); //Draw a circle with a thick border
```

[/example]

____________________________________________________

[example]

This example draws two circles at the same location and with the same radius. The first circle has a thick stroke width and the second has a thin stroke width. The resulting image shows how a thicker stroke increases the outer radius of the circle.


```
createCanvas(); //Create a canvas on which to draw
setStrokeWidth(40); //Change the thickness of lines to be drawn
setStrokeColor("lightblue");
circle(160, 240, 100); //Draw a circle with a thick border
setStrokeWidth(1); //Change the thickness of lines to be drawn
setStrokeColor("black");
circle(160, 240, 100); //Draw the same circle with narrow border
```

[/example]

____________________________________________________

[example]

This example shows the difference between drawing a filled circle filled with white pixels and a circle filled with transparent pixels.


```
createCanvas(); //Create a canvas on which to draw
setFillColor("white"); //Fill shapes with white pixels
circle(100, 100, 50);
circle(100, 150, 50); //Draw a filled circle overlapping the first
setStrokeColor("red")
setFillColor("transparent"); //Do not fill shapes
circle(200, 100, 50);
circle(200, 150, 50); //Draw an unfilled circle overlapping the first
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
circle(x, y, radius)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x position in pixels of the center of the circle.  |
| y | number | Yes | The y position in pixels of the center of the circle.  |
| radius | number | Yes | The radius of the circle, in pixels.  |
[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- If you're having trouble getting a circle to show up, make sure a [canvas is created](/applab/docs/createCanvas) first and that where you're trying to draw the circle is within the bounds of the canvas.
- The radius is half the diameter of the circle, or half the width of the circle at its widest point.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
