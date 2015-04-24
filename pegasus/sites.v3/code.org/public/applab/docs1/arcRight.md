---
title: App Lab Docs
---

[name]

## arcRight(x, y)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle forward and to the right in a smooth circular arc.

[/short_description]

Moves the turtle forward along a circle. The circle is positioned radius pixels to the right of the turtle. The turtle's position is updated to be on the circle angle degrees from where it started. The Turtle's angle is rotated angle degrees to the right.

[/description]

### Examples
____________________________________________________

[example]

<pre>
arcRight(90, 25);    // Move the turtle forward and to the right
</pre>

[/example]

____________________________________________________

[example]

<pre>
arcRight(360, 50)    // Make a full circle to the right
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Smoothly turn the turtle around
arcLeft(60, 25);    // Turn left a bit
arcRight(300, 25);  // Turn almost all the way
arcLeft(60, 25);    // Straighten out
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
arcRight(angle, radius);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle along the circle to move.  |
| radius | number | Yes | The radius of the circle that is placed right of the turtle. Must be >= 0.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling arcLeft() to have the turtle not draw as it moves.
- You can specify a radius of 0, which makes arcRight() act the same as turnRight.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
