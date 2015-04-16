---
title: App Lab Docs
---

[name]

## turnLeft(angle)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the turtle's direction to the left.

[/short_description]

The turtle's postition remains the same. The direction is turned left by angle degrees.

[/description]

### Examples
____________________________________________________

[example]

<pre>
turnLeft(90);    // Makes the turtle face left
</pre>

[/example]

____________________________________________________

[example]

<pre>
turnLeft(-90);   // Makes the turtle face right
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a square
moveForward(100);   // Draw the right edge
turnLeft(90);       // Turn to face along the top edge
moveForward(100);   // Draw the top edge
turnLeft(90);       // Turn to face along the left edge
moveForward(100);   // Draw the left edge
turnLeft(90);       // Turn to face along the bottom edge
moveForward(100);   // draw the bottom edge
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
turnLeft(angle);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle to turn left.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to turn left, which makes the turtle turn right instead.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
