---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setActiveCanvas(id);

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Change the active canvas to the canvas with the specified id (other canvas commands only affect the active canvas).

[/short_description]

The first canvas to be created is automatically activated. All canvas drawing commands (such as [`line()`](/applab/docs/line) and [`rect()`](/applab/docs/rect)) draw on the active canvas. Likewise, all canvas state commands (such as [`setFillColor()`](/applab/docs/setFillColor) and [`setStrokeColor()`](/applab/docs/setStrokeColor)) change the state of the active canvas only.

Only one canvas can be active at a time. A canvas must have been created with an id to be activated by `setActiveCanvas()`.

Calling `setActiveCanvas()` has no visible effect of its own. It only changes the canvas that will be affected by subsequent canvas commands.

[/description]

### Examples
____________________________________________________

[example]

In this example, two canvas elements are created with ids "canvas1" and "canvas2". Since "canvas1" is created first, it is active by default. Canvas commands affect the canvas called canvas1 until the active canvas is changed.

**Note**: Changing the stroke width and color did not affect canvas2.


```
createCanvas("canvas1");    //Create a canvas on which to draw
createCanvas("canvas2");    //Create a second canvas
setStrokeWidth(10);
setStrokeColor("blue");
setFillColor("yellow");
circle(160, 240, 50);       //Draw a yellow-filled circle on canvas1
setActiveCanvas("canvas2");
rect(90, 170, 140, 140);    //Draw an unfilled, black square on canvas2
```

[/example]

____________________________________________________
[example]

Here, a smiley face is drawn using two canvases. The first is a full-screen canvas on which the head and eyes are drawn. The second canvas is smaller and placed where the mouth should go. Since drawing only occurs within the bounds of a canvas, the circle drawn on the second canvas is cut off, or clipped, so that only the portion inside the canvas is visible.


```
createCanvas();         //Create a canvas on which to draw. It is active by default.
setFillColor("yellow");
circle(160, 240, 100);  //Draw a big, yellow circle for a head
setFillColor("black");
circle(125, 215, 20);   //Draw two solid black circles for eyes
circle(195, 215, 20);
setFillColor("white");
createCanvas("mouth", 120, 50); //Create a second canvas on which to draw
setActiveCanvas("mouth");       //Activate the second canvas
setPosition("mouth", 100, 260); //Move the second canvas to x:100 y:260
setStrokeWidth(15);
circle(60, -15, 50);    //Draw a circle with its center outside the canvas bounds
```

[/example]

____________________________________________________
[example]

In this example, the id values given to the canvas elements correspond to the order in which the elements are created. Drawing on the canvases is done from front to back, to demonstrate that the order of drawing is not important. Instead, the order in which the elements are created is what matters to the layering.

Each canvas can have its drawing covered by any canvas created after it.

Here, the blue lines are on the front canvas, so they cover both red and green. The red lines are on the middle canvas, so they are covered by the front (blue), but not by the back canvas (red).


```
createCanvas("back");
createCanvas("middle");
createCanvas("front");
// Draw blue lines on "front" canvas
setActiveCanvas("front");
setStrokeWidth(30);
setStrokeColor("blue");
line(60, 30, 60, 230);
line(30, 60, 230, 60);
// Draw red lines on "middle" canvas
setActiveCanvas("middle");
setStrokeWidth(30);
setStrokeColor("red");
line(130, 30, 130, 230);
line(30, 130, 230, 130);
// Draw green lines on "back" canvas
setActiveCanvas("back");
setStrokeWidth(30);
setStrokeColor("green");
line(200, 30, 200, 230);
line(30, 200, 230, 200);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
setActiveCanvas(id);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the canvas element to activate.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- When creating more than one canvas, the canvas elements are layered one on top of the other. The second canvas created will be "in front" or "on top" of the first canvas. This means that any drawing on the second canvas will cover the first canvas when the two canvas elements overlap.
- Drawing outside of the dimensions of the canvas will not be visible. The dimensions span from 0 to the width of the canvas horizontally (x), and from 0 to the height of the canvas vertically (y).
- Change the position of the canvas using [`setPosition`](/applab/docs/setPosition).
- The [`setPosition`](/applab/docs/setPosition) block can change the display size of the canvas, but it does not change the bounds of the canvas (the range of x and y values that are valid for drawing). Instead, the drawing within the canvas will be stretched (or squished) to fit the size specified by [`setPosition`](/applab/docs/setPosition).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
