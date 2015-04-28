---
title: App Lab Docs
---

[name]

## getYPosition(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Get the element's y position, in pixels.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
createCanvas(); //Create a canvas to draw on first
rect(0, 0, 100, 100); //Draw a 100x100 pixel rectangle in the top left corner
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

<pre>
createCanvas(); //Create a canvas to draw on first
setFillColor("red"); //Set the fill color of future drawn shapes
rect(50, 50, 100, 200); //Draw a 100x200 pixel rectangle at x:50 y:50 on the screen
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getYPosition(id);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the element.  |

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
