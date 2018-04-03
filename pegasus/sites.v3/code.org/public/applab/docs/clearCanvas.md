---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## clearCanvas()

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Clears all data on the active canvas.

[/short_description]

Just like you can delete all the data in a document, App Lab provides a way to clear the active canvas. Clearing a canvas is typically done after some event, so that whatever was drawn has a chance to be seen before it is erased. Examples below will make use of [setTimeout](/applab/docs/setTimeout) and [onEvent](/applab/docs/onEvent) to more clearly demonstrate clearCanvas.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a square and then erase it immediately. Use the slider in the Debug Console to slow down App Lab so you can see it.
createCanvas("canvas1");
setStrokeWidth(10);
rect(120, 200, 80, 80);
clearCanvas();
```

[/example]

____________________________________________________

[example]

**Example: Time Out** Draw a square and then erase it in three seconds using [setTimeout](/applab/docs/setTimeout).

```
// Draw a square and then erase it in three seconds using setTimeout.
createCanvas("canvas1");
setStrokeWidth(10);
rect(120, 200, 80, 80);
setTimeout(function() {
    clearCanvas();
}, 3000);
```

[/example]

____________________________________________________

[example]

**Example: Change the Smile** Draw a new mouth where you click.

```
// Draw a new mouth where you click.
textLabel("instruction", "Click on the mouth to draw a new mouth where you click.");
createCanvas("face");
setFillColor("yellow");
circle(160, 240, 100);
setFillColor("black");
circle(125, 215, 20);
circle(195, 215, 20);
setFillColor("white");
createCanvas("mouth", 120, 50);
setActiveCanvas("mouth");
setPosition("mouth", 100, 260);
setStrokeWidth(15);
circle(60, -15, 50);
onEvent("mouth", "click", function(click) {
  setActiveCanvas("mouth");
  clearCanvas();
  circle(click.offsetX, click.offsetY, 25);
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
clearCanvas();
```

[/syntax]

[parameters]

### Parameters

clearCanvas() does not take any parameters.

[/parameters]

[returns]

### Returns

No return value. Alters the display only.

[/returns]

[tips]

### Tips
- Only the active canvas is cleared.
- Clearing the active canvas may reveal hidden drawing on a canvas that was behind the active canvas.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
