---
title: App Lab Docs
---

[name]

## moveForward(pixels)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle forward a given number of pixels in its current direction.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
moveForward(); //Moves forward 25 pixels (default)
</pre>

[/example]

____________________________________________________

[example]

<pre>
moveForward(200); //Moves the turtle north 200 pixels
</pre>

[/example]

____________________________________________________

[example]

<pre>
/* Draw a 'L' */
turnLeft(180); //Turtle starts facing North, so turn 180 degrees to face South
moveForward(100); //Move the turtle 100 pixels in its current direction (South)
turnLeft(90); //Turtle is facing South and rotates 90 degrees to its left. Turtle is now facing East.
moveForward(50); //Moves the turtle 50 pixels in its current direction (East)
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
moveForward(pixels);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| pixels | number | No | The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling `moveForward()`  to stop the turtle from drawing a line behind it as it moves

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
