---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## createCanvas(id, *width*, *height*);

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Creates a canvas element with the specified id, and optionally set its width and height.

[/short_description]

A canvas element is a rectangular area which you include in apps to allow the user to draw and manipulate images. The Turtle is actually implemented using a canvas.

canvas element must be created before using any other canvas blocks. If the width and height are not specified, the canvas will be the same size as the app window. Each time *createCanvas()* is invoked, it creates a new canvas with default values for stroke width (1), stroke color ("black"), and fill color ("transparent"). Changing those values only affects the active canvas, and only one canvas may be active at a time. Canvas blocks, such as [line()](/applab/docs/line) and [rect()](/applab/docs/rect), can draw only within the bounds of a canvas. Any drawing outside the bounds of the canvas will not be visible.

When *createCanvas()* is invoked the first time, the canvas it creates becomes the active canvas. Other canvas blocks (like [line()](/applab/docs/line) or [setStrokeWidth()](/applab/docs/setStrokeWidth)) only affect the active canvas. Creating additional canvas elements does not change the active canvas. To change the active canvas, you must use [setActiveCanvas()](/applab/docs/setActiveCanvas).

[/description]

### Examples
____________________________________________________

[example]

```
// Create a canvas as big as the window and draws a square in the upper left corner.
createCanvas("canvas1");
rect(0, 0, 100, 100);
```

[/example]

____________________________________________________
[example]

**Example: It's All Relative** The coordinates used for drawing on a canvas are relative to the top left corner of the canvas, not the screen.

```
// The coordinates used for drawing on a canvas are relative to the top left corner of the canvas, not the screen.
createCanvas("canvas1");
setPosition("canvas1", 50, 50);
rect(0, 0, 100, 100);
```

[/example]

____________________________________________________

[example]

**Example: Stay Inside the Canvas** Only the part of the rectangle that fits on the canvas is visible.

```
// Only the part of the rectangle that fits on the canvas is visible.
createCanvas("canvas1", 50, 50);
rect(25, 25, 100, 100);
```

[/example]

____________________________________________________

[example]

**Example: Multiple Canvases** Only the active canvas is effected by canvas drawing functions.

```
// Only the active canvas is effected by canvas drawing functions.
createCanvas("canvas1");
setPosition("canvas1", 50, 50);
setStrokeColor("red");
rect(0, 0, 100, 100);

createCanvas("canvas2", 200, 200);
setActiveCanvas("canvas2");
setPosition("canvas2", 60, 0);
circle(0, 100, 50);
circle(100, 100, 50);
circle(200, 100, 50);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
createCanvas(id, width, height);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| [id] | string | Yes | The unique identifier for the canvas screen element. The id is used for referencing the canvas functions or other UI element modification functions. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| [width] | number | No | The horizontal width in pixels of the canvas. If not specified the app window width is used. |
| [height] | number | No | The vertical height in pixels of the canvas. If not specified the app window height is used. |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- When drawing with canvas blocks, remember that x:0 y:0 is the top left corner of the canvas, no matter what the canvas position. The x values increase as you move right, and y values increase as you go down.
- Drawing outside of the dimensions of the canvas will not be visible. The dimensions span from 0 to the width of the canvas horizontally (x), and from 0 to the height of the canvas vertically (y).
- A canvas is a UI element, so if it is assigned an id, then it can be manipulated with the UI Controls blocks.
- Change the position of the canvas using [setPosition()](/applab/docs/setPosition).
- The [setPosition](/applab/docs/setPosition) block can change the display size of the canvas, but it does not change the bounds of the canvas (the range of x and y values that are valid for drawing). Instead, the drawing within the canvas will be stretched (or squished) to fit the size specified.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
