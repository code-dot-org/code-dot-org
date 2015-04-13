---
title: App Lab Docs
---

[name]

## penDown()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

penDown will cause a line to be drawn behind the turtle as it moves.

[/short_description]

**Note**: [penUp()](/applab/docs/penUp) is often used with penDown

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
penDown();            // creates a line behind the turtle as it moves
moveForward(100);     // moves the turtle forward 100 pixels
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example uses penUp and penDown to draw a dotted line.

<pre>
penWidth(3);                  // sets the pen's thickness to 3 pixels
penUp();                      // lifts the pen up so the turtle does not leave a line behind it as it moves
move(-125, 25);               // moves the turtle to its starting location
turnRight(90);                // turns the turtle 90 degrees so that it is facing to the right
for (var i = 0; i < 5; i++) { // repeats the code 5 times, drawing 5 lines separated by white space
  penDown();                  // puts the pen down so the turtle leaves a line behind it as it moves
  moveForward(25);            // moves the turtle froward 25 pixels
  penUp();                    // lifts the pen up so the turtle does not leave a line behind it as it moves
  moveForward(25);            // moves the turtle forward 25 pixels
}

</pre>

[/example]

____________________________________________________

[example]

**Example 3**

This example uses penUp and penDown to draw a pair of eyes.

<pre>
hide();             // hides the turtle
penDown();          // puts the pen down so the turtle leaves a line behind it as it moves
arcRight(360, 25);  // draws a circle with a 25 pixel diameter (eye)
penUp();            // lifts the pen up so the turtle does not leave a line behind it as it moves
move(25, 10);       // moves the turtle inside the circle (eye)
dot(10);            // draws a 10 pixel dot (pupil)
move(-100, -10);    // moves the turtle into position for the second eye
penDown();          // puts the pen back down so the turtle leaves a line behind it as it moves
arcRight(360, 25);  // draws the second eye, a circle with a 25 pixel diameter
penUp();            // lifts the pen up so the turtle does not leave a line behind it as it moves
move(25, 10);       // moves the turtle inside the circle (eye)
dot(10);            // draws a 10 pixel dot (pupil)
</pre>


[/example]
____________________________________________________

[syntax]

### Syntax
<pre>
penDown();
</pre>

[/syntax]

[parameters]

### Parameters
`penDown()` does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- [penUp()](/applab/docs/penUp) is often used with penDown

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
