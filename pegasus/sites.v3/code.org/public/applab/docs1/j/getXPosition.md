---
title: App Lab Docs
---

[name]

## getXPosition(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Get the element's x position, in pixels.

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
getXPosition(id);
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
Returns a number representing the current x coordinate in pixels of the turtle within the app display.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
