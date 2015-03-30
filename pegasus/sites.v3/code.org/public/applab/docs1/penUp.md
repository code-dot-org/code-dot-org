---
title: App Lab Docs
---

[name]

## penUp()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

penUp will stop your turtle from leaving a line behind when it moves.

[/short_description]

**Note**: [penDown()](/applab/docs/penDown) is often used with penUp

[/description]

### Examples
____________________________________________________

[example]

<pre>

</pre>

[/example]

____________________________________________________

[example]

<pre>
hide();             // hide the turtle
arcRight(360, 25);  // draw a 25 pixel radius circle (eye)
penUp();            // lift the pen up to stop leaving a trail
move(25, 10);       // move inside the circle (eye)
penDown();          // put the pen back down to leave a trail
dot(10);            // draw a 10 pixel dot (pupil)
penUp();            // lift the pen up to stop leaving a trail
move(-100, -10);    // move into position for the second eye
penDown();          // put the pen back down to leave a trail
arcRight(360, 25);  // draw the second eye, a 25 pixel radius circle
penUp();            // lift the pen up to stop leaving a trail
move(25, 10);       // move into place
dot(10);            // draw the second pupil
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
penUp();
</pre>

[/syntax]

[parameters]

### Parameters


None.

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- [penDown()](/applab/docs/penDown) is often used with penUp

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
