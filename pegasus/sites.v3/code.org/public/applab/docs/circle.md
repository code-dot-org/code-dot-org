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

Draws a circle on the active canvas with its center at the specified (x, y) location and with the specified radius.

[/short_description]

You can draw many things with the basic canvas drawing functions of circle, line and rect. For circle(), the x and y coordinates specify the center of the circle, relative to the top-left corner of the canvas (x:0 y:0). The radius is measured in pixels. Circles are drawn using the current stroke width and current stroke color, and then filled with the current fill color (if the fill color is anything other than the default "transparent").

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a circle centered on the screen with the default stroke color, width, fill color.
createCanvas("canvas1");
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Red Line**  Change the color of the circle outline.

```
// Change the color of the circle outline.
createCanvas("canvas1");
setStrokeColor("red");
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Red Dot**  Change the color of the circle fill (note the outline is still defailt black).

```
// Change the color of the circle fill (note the outline is still defailt black).
createCanvas("canvas1");
setFillColor("red");
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Thick Outline** Change the thickness of the circle outline.

```
//  Change the thickness of the circle outline.
createCanvas("canvas1");
setStrokeWidth(20);
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Two Circles** Draw two circles at the same location and with the same radius but with different stroke widths.

```
// Draw two circles at the same location and with the same radius but with different stroke widths.
createCanvas("canvas1");
setStrokeWidth(40);
setStrokeColor("lightblue");
circle(160, 240, 100);
setStrokeWidth(1);
setStrokeColor("black");
circle(160, 240, 100);
```

[/example]

____________________________________________________

[example]

**Example: Overlapping Circles** Shows the difference between drawing a circle filled with white pixels and a circle filled with transparent pixels.

```
createCanvas("canvas1");
setFillColor("white");
circle(100, 100, 50);
circle(100, 150, 50);
setStrokeColor("red");
setFillColor("transparent");
circle(200, 100, 50);
circle(200, 150, 50);
```

[/example]

____________________________________________________

[example]

**Example: Part of a Circle** Draw a circle larger than the canvas so that only the portion inside the canvas is visible.

```
// Draw a circle larger than the canvas so that only the portion inside the canvas is visible.
createCanvas("mouth", 120, 50);
setActiveCanvas("mouth");
setPosition("mouth", 100, 260);
setStrokeWidth(15);
circle(60, -15, 50);
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
| x | number | Yes | The x position in pixels of the center of the circle relative to the upper left corner of the active canvas. |
| y | number | Yes | The y position in pixels of the center of the circle relative to the upper left corner of the active canvas. |
| radius | number | Yes | The radius of the circle, in pixels. |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips

- A canvas element must be created before a circle can be drawn. Create a canvas element in Design mode first, or call [createCanvas()](/applab/docs/createCanvas) before calling circle.
- If you're having trouble getting a circle to show up, make sure that you're trying to draw the circle within the bounds of the active canvas.
- Change the width of the line, color of the line, and fill color used to draw all subsequent circles using on this canvas [setStrokeWidth](/applab/docs/setStrokeWidth), [setStrokeColor](/applab/docs/setStrokeColor). and [setFillColor](/applab/docs/setFillColor).
- When drawing thick lines, the radius of the circle defines the center of the perimeter line. The outside radius of the circle will be the specified radius plus half the stroke width.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
 	