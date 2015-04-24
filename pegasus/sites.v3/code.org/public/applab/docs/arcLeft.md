---
title: App Lab Docs
---

[name]

## arcLeft(angle, radius)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle forward and to the left in a smooth circular arc.

[/short_description]

Moves the turtle forward along a circle. The circle is positioned radius pixels to the left of the turtle. The turtle's position is updated to be on the circle angle degrees from where it started. The Turtle's angle is rotated angle degrees to the left.

[/description]

### Examples
____________________________________________________

[example]

<pre>
arcLeft(90, 25);    // Move the turtle forward and to the left
</pre>

[/example]

____________________________________________________

[example]

<pre>
arcLeft(360, 50)    // Make a full circle to the left
</pre>

[/example]

____________________________________________________

[example]

<pre>
arcLeft(-45, 100)   // -45 degrees is also 315 degrees, so move forward by 315 degrees
// TODO: is this a bug? we should be able to back up right?
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Spiral into the center of a circle
for (var radius = 100; radius>0; radius -= 5) { // Keep reducing the radius until we are at the center
  arcLeft(180, radius);                         // Move around half the circle before we do the next smaller arc
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
arcLeft(angle, radius);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle along the circle to move.  |
| radius | number | Yes | The radius of the circle that is placed left of the turtle. Must be >= 0.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling arcLeft() to have the turtle not draw as it moves.
- You can specify a radius of 0, which makes arcLeft() act the same as turnLeft().
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
