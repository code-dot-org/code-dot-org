---
title: App Lab Docs
---

[name]

## getY()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Returns the current y coordinate in pixels of the turtle.

[/short_description]

The y coordinate is the distance from the turtle to the top of the screen.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var yLocation = getY(); //Get y coordinate of the turtle and store it in variable 'yLocation'
console.log(yLocation); //Print value of the variable to the debugging console
</pre>

[/example]

____________________________________________________

[example]

<pre>
var newX = getX() * 0.75; // Move a bit closer to the top left
var newY = getY() * 0.75;
moveTo(newX, newY);
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Keep getting closer to the top left
for (var i = 0; i < 6; i++) {
  dot(5);                       // Draw a dot where we are
  var newX = getX() * 0.75;     // move a bit closer
  var newY = getY() * 0.75;
  moveTo(newX, newY);
}
</pre>

[/example]

____________________________________________________

[example]

**Bounce the Turtle** Have the turtle keep moving, but bounce off trhe walls so it stays on the screen.
<pre>
var speedX = 10;    // Start moving down and to the right
var speedY = 10;
while (true) {                  // Don't stop. Ever!
  var newX = getX() + speedX;   // Our next position is our current position plus the speed
  var newY = getY() + speedY;
  if (newX < 20) {              // If we hit the left wall
    newX = 20;                  // Stay within bounds
    speedX = - speedX;          // Bounce in x direction
  } else if (newX > 300) {      // If we hit the right wall
    newX = 300;                 // Stay within bounds
    speedX = - speedX;          // Bounce!
  }
  if (newY < 20) {              // If we hit the top wall
    newY = 20;                  // Stay within bounds
    speedY = - speedY;          // Bounce in the y direction
  } else if (newY > 460) {      // If we hit the bottom wall
    newY = 460;                 // Stay within bounds
    speedY = - speedY;          // Bounce!
  }
  moveTo(newX, newY);           // Actually move the turtle
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getY();
</pre>

[/syntax]

[parameters]

### Parameters

`getX()` does not take any parameters.

[/parameters]

[returns]

### Returns
Returns a number representing the current y coordinate in pixels of the turtle within the app display.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
