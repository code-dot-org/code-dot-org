---
title: App Lab Docs
---

[name]

## speed(value)

[/name]


[category]

Category: Turtle

[/category]

[description]

Sets the speed for the entire app's execution (which includes the turtle's speed).

[short_description]

The speed can also be set by the slider bar below the blue reset button.

[/short_description]

**Note**: Be sure to [show()](/applab/docs/show)  the turtle to see its movement.  
**Note**: A speed of 100 will be too fast for the human eye to see the movement on screen.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
show();             // shows the turtle by making it visible at its current location
speed(50);          // sets the speed to 50
moveForward(100);   // moves the turtle forward 100 pixels
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example illustrates the turtle moving at different speeds (10, 20, 30, 40, 50, 60, 70, 80, 90, 100) as it draws a square on the screen.

<pre>
textLabel("speed", "speed: 10", "forId");   // creates a text label that displays the current speed
                                            //    of the turtle
show();                                     // shows the turtle by making it visible at its current location
for (var i = 1; i <= 10; i++) {             // creates a for loop that will repeat 10 times
  for (var j = 0; j < 4; j++) {             // creates a for loop that will repeat 4 times,
                                            //    to create a square
    setText("speed", "speed: " + i * 10);   // updates the text label to the current speed
    speed(i*10);                            // increases the speed by a multiple of 10
    moveForward(100);                       // moves the turtle forward by 100 pixels
    turnRight(90);                          // turns the turtle 90 degrees to the right
  }
}
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
speed(value);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| value | number | Yes | The speed of the app's execution in the range of (1-100)  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Be sure to [show()](/applab/docs/show)  the turtle to see its movement.
- A speed of 100 will be too fast for the human eye to see the movement on screen.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
