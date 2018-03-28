---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## rect(x, y, width, height)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Draws a rectangle onto the active canvas positioned at x and y with size width and height.

[/short_description]

You can draw many things with the basic canvas drawing functions of circle, line and rect. For rect(), the x and y coordinates specify the upper left of the rectangle, relative to the top-left corner of the canvas (x:0 y:0). The width and height are measured in pixels. Rectangles are drawn using the current stroke width and current stroke color, and then filled with the current fill color (if the fill color is anything other than the default "transparent").

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a 100x100 pixel rectangle in the top left corner.
createCanvas("canvas1");
rect(0, 0, 100, 100);
```

[/example]

____________________________________________________

[example]

**Example: Big Red Box** Draw a rectangle offset from the top left corner.

```
// Draw a rectangle offset from the top left corner.
createCanvas("canvas1");
setFillColor("red");
rect(50, 50, 100, 200);
```

[/example]

____________________________________________________

[example]

**Example: Thick Outline** Change the thickness of the rectangle outline.

```
//  Change the thickness of the rectangle outline.
createCanvas("canvas1");
setStrokeWidth(20);
rect(50, 50, 100, 200);
```

[/example]

____________________________________________________

[example]

**Example: Two Rectangles** Draw two rectangles at the same location and with the same width and height but with different stroke widths.

```
// Draw two rectangles at the same location and with the same width and height but with different stroke widths.
createCanvas("canvas1");
setStrokeWidth(40);
setStrokeColor("lightblue");
rect(50, 50, 100, 200);
setStrokeWidth(1);
setStrokeColor("black");
rect(50, 50, 100, 200);
```

[/example]

____________________________________________________

[example]

**Example: Overlapping Rectangles** Shows the difference between drawing a rectangle filled with white pixels and a rectangle filled with transparent pixels.

```
// Shows the difference between drawing a rectangle filled with white pixels and a rectangle filled with transparent pixels.
createCanvas("canvas1");
setFillColor("white");
rect(50, 50, 100, 200);
rect(50, 100, 100, 200);
setStrokeColor("red");
setFillColor("transparent");
rect(200, 50, 100, 200);
rect(200, 100, 100, 200);
```

[/example]

____________________________________________________

[example]

**Example: Part of a Rectangle** Draw a rectangle larger than the canvas so that only the portion inside the canvas is visible.

```
// Draw a rectangle larger than the canvas so that only the portion inside the canvas is visible.
createCanvas("canvas1", 120, 50);
setPosition("canvas1", 100, 260);
setStrokeWidth(15);
rect(60, -15, 50, 50);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
rect(x, y, width, height);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x position in pixels of the upper left corner of the rectangle.  |
| y | number | Yes | The y position in pixels of the upper left corner of the rectangle.  |
| width | number | Yes | The horizontal width in pixels of the rectangle.  |
| height | number | Yes | The vertical height in pixels of the rectangle.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- A canvas element must exist before a rectangle can be drawn. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling rect().
- If you're having trouble getting a rectangle to show up, make sure a canvas is created first and that where you're trying to draw the rectangle fits within the coordinates of the canvas.
- Change the width of the line, color of the line, and fill color used to draw all subsequent rectangles on this canvas using [setStrokeWidth](/applab/docs/setStrokeWidth), [setStrokeColor](/applab/docs/setStrokeColor). and [setFillColor](/applab/docs/setFillColor).
- When drawing thick lines, the width and length of the rectangle is relative to the center of the perimeter line. The outside perimeter of the rectangle will be one half the stroke width larger all around.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
