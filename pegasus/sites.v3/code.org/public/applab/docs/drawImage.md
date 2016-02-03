---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## drawImage(id, x, y, width, height)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Draws the specified image or canvas element onto the active canvas at the specified position, and optionally scales the element to the specified width and height.

[/short_description]

The `drawImage` function draws the element specified by `id` at position (x, y). The (x, y) position is relative to the top-left corner of the active canvas, and it specifies where to draw the top-left corner of the image. The `width` and `height` parameters are optional. If they are not provided, the image is drawn full-size. If width and height vaue are specified, then the image is stretched (or squished) to fit the size specified.

An image element can be created using [`image()`](/applab/docs/image). A second canvas can be created with [`createCanvas()`](/applab/docs/createCanvas).

**Note**: A canvas element must exist before the image can be drawn. Create a canvas element in Design mode first, or call [`createCanvas()`](/applab/docs/createCanvas) before calling `drawImage()`.

[/description]

### Examples
____________________________________________________

[example]

This example demonstrates the use of `drawImage` and the effect of specifying width and height values. The cat image is drawn at three different positions, in three different sizes. When width and height are not specified, the image is drawn at its original size.


```
//Create an image element (cat_thumb.png is 100x100 pixels)
image("cat", "http://studio.code.org/blockly/media/skins/studio/cat_thumb.png");
createCanvas();                         //Create a canvas on which to draw
drawImage("cat", 0, 200);               //Draw "cat" at regular size (100x100)
drawImage("cat", 100, 100, 100, 200);   //Draw "cat" with double height (100x200)
drawImage("cat", 0, 300, 200, 100);     //Draw "cat" with double width (200x100)
```

[/example]

____________________________________________________

[example]

In this example, the image element is hidden so that only the canvas image is visible.


```
//Create an image element (cat_thumb.png is 100x100 pixels)
image("cat", "http://studio.code.org/blockly/media/skins/studio/cat_thumb.png");
hideElement("cat");         //Hide the original image element
createCanvas();             //Create a canvas on which to draw
drawImage("cat", 0, 0, 320, 480); //Draw "cat" full-screen
```

[/example]

____________________________________________________

[example]

This example draws one canvas onto another canvas. First, a small canvas is created and large blue circle is drawn onto it. The circle's center is outside the bounds of the canvas so that only a segment of the bottom of the circle is drawn.

The canvas with the blue circle segment is then drawn repeatedly across a second canvas to create a scalloped pattern, like waves.


```
//Create a small canvas and draw a large circle onto it,
//off-center so that most of the circle is clipped.
createCanvas("wave", 60, 40);
setStrokeColor("blue");
setStrokeWidth(20);
circle(30, -10, 40);
//Now create a second canvas called "water"
createCanvas("water");
setActiveCanvas("water");
//Draw the wave canvas repeatedly across the water canvas.
for (var x = 0; x < 320; x += 60) {
  drawImage("wave", x, 300);
}
```

[/example]

____________________________________________________

[example]

This example combines techniques from previous examples to draw an octopus under water.

In this example, the elements referenced in the `drawImage()` calls are hidden, so that only the final drawing is visible. The elements being drawn by `drawImage()` do not need to be visible to be drawn onto a canvas.


```
//Create and hide an image
image("octopus", "http://studio.code.org/blockly/media/skins/studio/octopus_thumb.png");
hideElement("octopus");
//Create and hide a small canvas where a wave will be drawn
createCanvas("wave", 60, 40);   // Create a 60x40 pixel canvas on which to draw
hideElement("wave");
//Draw a wave
setStrokeColor("blue");
setStrokeWidth(20);
circle(30, -10, 40);
//Now redraw the wave drawing across a second canvas
createCanvas("water");
setActiveCanvas("water");
for (var x = 0; x < 320; x += 60) {
  drawImage("wave", x, 300);
}
drawImage("octopus", 110, 350);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
drawImage(id, x, y, width, height);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The x position in pixels of the upper left corner of the image to draw.  |
| x | number | Yes | The x position in pixels of the upper left corner of the image to draw.  |
| y | number | Yes | The y position in pixels of the upper left corner of the image to draw.  |
| [width] | number | No | The horizontal width in pixels of the image to draw. The image will be stretched to fit if the width does not match the image's original size.  |
| [height] | number | No | The vertical height in pixels of the image to draw.  The image will be stretched to fit if the height does not match the image's original size. |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Remember that x:0 y:0 is at the top left of the display, so x values increase as you move right, and y values increase as you go down (which is different from math class!).
- If you're having trouble getting a rectangle to show up, make sure a [canvas is created](/applab/docs/createCanvas) first and that where you're trying to draw the rectangle fits within the coordinates of the canvas.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
