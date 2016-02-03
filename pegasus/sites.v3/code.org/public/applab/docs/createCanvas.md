---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## createCanvas(id, width, height);

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Create a canvas element with the specified id, and optionally set its width and height.

[/short_description]

A canvas element is a rectangular area on which you can draw. Canvas blocks, such as [`line`](/applab/docs/line) and [`rect`](/applab/docs/rect), can draw only within the bounds of a canvas. Any drawing outside the bounds of the canvas will not be visible.

A canvas element must be created before using any other canvas blocks. If the width and height are not specified, the canvas will be the same size as the window.

When `createCanvas` is invoked the first time, the canvas it creates becomes the active canvas. Other canvas blocks (like [`line`](/applab/docs/line) or [`setStrokeWidth`](/applab/docs/setStrokeWidth)) only affect the active canvas. Creating additional canvas elements does not change the active canvas. To change the active canvas, you must use [`setActiveCanvas`](/applab/docs/setActiveCanvas).

Each time `createCanvas` is invoked, it creates a new canvas with default values for stroke width (1), stroke color ("black"), and fill color ("transparent"). Changing those values only affects the active canvas, and only one canvas may be active at a time.

**Note**: A canvas is a UI element, so if it is assigned an id, then it can be manipulated with the UI Controls blocks.

[/description]

### Examples
____________________________________________________

[example]

This example creates a canvas as big as the window and draws a rectangle into it at position x:0 y:0.


```
createCanvas(); //Create a canvas on which to draw
rect(0, 0, 100, 100); //Draw a 100x100 pixel rectangle in the top left corner
```

[/example]

____________________________________________________
[example]

This example demonstrates that coordinates used for drawing are relative to the top left corner of the canvas. In this code block, a canvas is created with an id, and then moved to position (50, 50). Drawing a rectangle at (0, 0) puts the top left corner of the rectangle at position (50, 50) in the window.


```
createCanvas("canvas"); //Create a canvas on which to draw
setPosition("canvas", 50, 50); //Move the canvas to x:50 y:50 of the window
rect(0, 0, 100, 100); //Draw a rectangle in the top left corner of the canvas
```


[/example]

____________________________________________________

[example]

This example demonstrates what happens when drawing outside the bounds of the canvas. Here, the width and height parameters are provided to `createCanvas` to make it smaller than the window. The rectangle drawn is bigger than the canvas, so only part of the rectangle is visible.


```
createCanvas("canvas", 50, 50); //Create a 50x50 pixel canvas on which to draw
rect(0, 0, 100, 100); //Draw a 100x100 pixel rectangle, but only part of it is visible
```


[/example]

____________________________________________________

[example]

This example demonstrates that drawing only occurs within the bounds of the canvas. Here, the canvas is 200x200 pixels and positioned inside the window. Three circles are drawn, but two of them extend beyond the bounds of the canvas so they appear as semi-circles even though there is enough room for them in the window.


```
createCanvas("canvas", 200, 200); //Create a 200x200 pixel canvas on which to draw
setPosition("canvas", 60, 0); //Move the canvas toward the center of the window
circle(0, 100, 50); //Draw a circle centered on the left edge of the canvas
circle(100, 100, 50); // Draw a circle centered in the middle of the canvas
circle(200, 100, 50); // Draw a circle centered on the right edge of the canvas
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
| [id] | string | No | The id of the new canvas element.  |
| [width] | number | No | The horizontal width in pixels of the rectangle.  |
| [height] | number | No | The vertical height in pixels of the rectangle.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- When drawing with canvas blocks, remember that x:0 y:0 is the top left corner of the canvas, no matter what the canvas position. The x values increase as you move right, and y values increase as you go down.
- Drawing outside of the dimensions of the canvas will not be visible. The dimensions span from 0 to the width of the canvas horizontally (x), and from 0 to the height of the canvas vertically (y).
- Change the position of the canvas using [`setPosition`](/applab/docs/setPosition).
- The [`setPosition`](/applab/docs/setPosition) block can change the display size of the canvas, but it does not change the bounds of the canvas (the range of x and y values that are valid for drawing). Instead, the drawing within the canvas will be stretched (or squished) to fit the size specified by [`setPosition`](/applab/docs/setPosition).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
