---
title: App Lab Docs
---

[name]

## turnTo(angle)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the turtle's direction to a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left.

[/short_description]

The turtle's position remains the same. The direction is changed to be angle degrees clockwise from a line pointing up.

[/description]

### Examples
____________________________________________________

[example]

<pre>
turnTo(90);    // Makes the turtle face right
</pre>

[/example]

____________________________________________________

[example]

<pre>
turnRight(90); // Face left
turnTo(90);    // Still makes the turtle faces right
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a random starburst pattern
for (var i = 0; i < 100; i++) {     // Make 100 lines
  moveTo(160, 240);                 // Reset the turtle's position
  turnTo(randomNumber(360));        // Turn to a random angle
  moveForward(randomNumber(240));   // Move in a random distance
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
turnTo(angle);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The new angle to set the turtle's direction to.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Unlike turnLeft() and turnRight(), turnTo() specifies an absolute angle and ignores the previous direction of the turtle.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
