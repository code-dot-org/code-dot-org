---
title: App Lab Docs
---

[name]

## moveTo(x, y)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle to a specific spot on the screen.

[/short_description]

Unlike move, which moves the turtle *relative* to it's current position, moveTo moves the turtle to an *absolute* position on the screen.

[/description]

### Examples
____________________________________________________

[example]

<pre>
moveTo(50, 50);	// to the top left of the screen.
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Move the turtle in a square
penUp();            // Don't draw a diagonal
moveTo(50, 50);     // Top left
penDown();
moveTo(50, 270);    // Top right
moveTo(270, 270);   // Bottom right
moveTo(270, 50);    // Bottom left
moveTo(50, 50);     // Back to top left
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a polygon
var points = 8;     // We want an octagon
var radius = 100;   // Polygon will be 200 pixels across
var x = 160;        // Centered at the center of the screen
var y = 240;
for (var i = 0; i < points + 1; i++) {      // Visit every point once, and let i = points so we get to a full 360deg
  var angle = ((i / points) * 2 * Math.PI); // 2 * Math.PI is 360deg
  moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
moveTo(x, y);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x coordinate on the screen to move the turtle.  |
| y | number | Yes | The y coordinate on the screen to move the turtle.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Remember that x increases from left to right and y increases from top to bottom.
- The screen is 320 pixels wide and 480 pixels high.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
