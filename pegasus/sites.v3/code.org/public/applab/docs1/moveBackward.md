---
title: App Lab Docs
---

[name]

## moveBackward(pixels)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle back a given number of pixels in its current direction.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
moveBackward(); //Moves back 25 pixels (default)
</pre>

[/example]

____________________________________________________

[example]

<pre>
moveBackward(200); //Moves the turtle south 200 pixels
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a dot in front of and behind the turtle
moveForward(50);	// Move ahead
dot(10);			// Draw a big dot
moveBackward(100);	// Move back to 50 pixel behind the starting point
dot(10);			// Draw another big dot
moveForward(50);	// Move back to the start
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Parallel park the turtle
createCanvas("id", 320, 480);	// Create a canvas for drawing
setFillColor("yellow");			// Draw the yellow car
rect(180, 100, 60, 100);
setFillColor("red");			// Draw the red car
rect(180, 300, 60, 100);
show();							// Show the turtle that needs to park
moveForward(75);				// Pull up even to the front car
moveBackward(50);				// Start backing up
turnLeft(45);					// and turn into the spot
moveBackward(75);				// Back in
turnRight(45);					// Straighten out
moveForward();  				// Pull into the center of the spot
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
moveBackward(pixels);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| pixels | number | No | The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling moveBackward() to have the turtle not draw as it moves.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
