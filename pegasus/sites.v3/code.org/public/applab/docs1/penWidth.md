---
title: App Lab Docs
---

[name]

## penWidth(width)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the diameter of the circles drawn behind the turtle as it moves.

[/short_description]

**Note**: Even though it may look like a line, circles are actually being drawn behind the turtle as it moves. The width passed to penWidth sets the diameter of these circles.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
penWidth(10);             // sets the diameter of the circles drawn behind the turtle to 10 pixels
moveForward(100);         // moves the turtle forward 100 pixels
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example illustrates different pixel thicknesses from 10 - 90.

<pre>
penUp();                        // stops leaving a trail behind the turtle as it moves
moveTo(0, 0);                   // moves the turtle to the coordinate (0,0)
turnRight(90);                  // turns the turtle 90 degrees to the right
for (var i = 1; i < 10; i++) {  // repeats the code inside of this block 9 times
  penDown();                    // starts leaving a trail behind the turtle as it moves
  penWidth(i * 10);             // sets the diameter of the circles drawn behind the turtle
                                //    to a multiple of 10
  moveForward(250);             // moves the turtle forward 250 pixels
  moveBackward(250);            // moves the turtle backward 250 pixels
  penUp();                      // stops leaving a trail behind the turtle as it moves
  turnRight(90);                // turns the turtle 90 degrees to the left
  moveForward(i * 10 + 10);     // moves the turtle forward a multiple of 10 plus 10 pixels for padding
  turnLeft(90);                 // turns the turtle 90 degrees to the left
}
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
penWidth(width);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| width | number | Yes | The diameter of the circles drawn behind the turtle as it moves  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
