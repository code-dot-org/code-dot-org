works across all UI controls, including canvas

---
title: App Lab Docs
---

[name]

## setPosition(id, x, y, width, height)

[/name]


[category]

Category: UI Controls

[/category]

[description]

[short_description]

Set the element at the x, y position with the width and height.

[/short_description]


[/description]

### Examples
____________________________________________________

[example]

<pre>
createCanvas(); //Create a canvas to draw on first
rect(0, 0, 100, 100); //Draw a 100x100 pixel rectangle in the top left corner
</pre>

[/example]

____________________________________________________

[example]

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
rect(x, y, width, height);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the element.  |
| x | number | No | The x position in pixels of the upper left corner of the element.  |
| y | number | No | The y position in pixels of the upper left corner of the element.  |
| width | number | No | The horizontal width in pixels of the element.  |
| height | number | No | The vertical height in pixels of the element.  |

[/parameters]

[returns]

### Returns
Boolean value true / false

[/returns]

[tips]

### Tips
- Remember that x:0 y:0 is at the top left of the display, so x values increase as you move right, and y values increase as you go down (which is different from math class!).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
