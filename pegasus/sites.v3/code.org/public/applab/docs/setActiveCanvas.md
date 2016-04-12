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

Changes the active canvas to the canvas with the specified id (other canvas commands only affect the active canvas).

[/short_description]

Drawing apps can use multiple, overlaid canvases, each with their own changeable pen color and pen width. Only one canvas can be drawn on at a time, the active canvas. The first canvas to be created is automatically activated. All canvas drawing commands (such as [line()](/applab/docs/line) and [rect](/applab/docs/rect)) draw on the active canvas. Likewise, all canvas state commands (such as [setFillColor](/applab/docs/setFillColor) and [setStrokeColor](/applab/docs/setStrokeColor)) change the state of the active canvas only.

Drawing on a canvas differs from a turtle drawing in that the actual pixels are accessible to the programmer in a three dimensional array.

[/description]

### Examples
____________________________________________________

[example]

```
// Two overlapping canvases. Changing the stroke width and color did not affect canvas2.
createCanvas("canvas1");
createCanvas("canvas2");
setStrokeWidth(10);
setStrokeColor("blue");
setFillColor("yellow");
circle(160, 240, 50);
setActiveCanvas("canvas2");
rect(90, 170, 140, 140);
```

[/example]

____________________________________________________
[example]

**Example: Smiley Face** Draw a smiley face. The second canvas is smaller and placed where the mouth should go. Since drawing only occurs within the bounds of a canvas, the circle drawn on the second canvas is cut off, or clipped, so that only the portion inside the canvas is visible.

```
// Draw a smiley face. The second canvas is smaller and placed where the mouth should go. Since drawing only occurs within the bounds of a canvas, the circle drawn on the second canvas is cut off, or clipped, so that only the portion inside the canvas is visible.
createCanvas("face");
setFillColor("yellow");
circle(160, 240, 100);
setFillColor("black");
circle(125, 215, 20);
circle(195, 215, 20);
createCanvas("mouth", 120, 50);
setActiveCanvas("mouth");
setPosition("mouth", 100, 260);
setStrokeWidth(15);
circle(60, -15, 50);
```

[/example]

____________________________________________________
[example]

**Example: Front to Back** Draw on three canvases, the later created canvases overlay the earlier ones. The order of the drawing is irrelevant.

```
// Draw on three canvases, the later created canvases overlay the earlier ones. The order of the drawing is irrelevant.
createCanvas("back");
createCanvas("middle");
createCanvas("front");
setActiveCanvas("front");
setStrokeWidth(30);
setStrokeColor("blue");
line(60, 30, 60, 230);
line(30, 60, 230, 60);
setActiveCanvas("middle");
setStrokeWidth(30);
setStrokeColor("red");
line(130, 30, 130, 230);
line(30, 130, 230, 130);
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
| id | string | Yes | The unique identifier for the canvas to activate. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |

[/parameters]

[returns]

### Returns
No return value. No visible effect of its own. It only changes the canvas that will be affected by subsequent canvas commands.

[/returns]

[tips]

### Tips
- Only one canvas can be active at a time. A canvas must be first created with an id using [createCanvas](/applab/docs/createCanvas).
- Change the position (or display size) of the canvas using [setPosition](/applab/docs/setPosition). Changing the display size of the canvas does not change the bounds of the canvas (the range of x and y values that are valid for drawing). Instead, the drawing within the canvas will be stretched (or squished) to fit the size specified by [setPosition](/applab/docs/setPosition).
- Drawing outside of the dimensions of the canvas will not be visible. The dimensions span from 0 to the width of the canvas horizontally (x), and from 0 to the height of the canvas vertically (y).
- When creating more than one canvas, the canvas elements are layered one on top of the other. The second canvas created will be "in front" or "on top" of the first canvas. This means that any drawing on the second canvas will cover the first canvas when the two canvas elements overlap.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
