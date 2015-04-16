---
title: App Lab Docs
---

[name]

## getDirection()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Returns (gets) the current direction that the turtle is facing.

[/short_description]



[/description]

### Examples
____________________________________________________

[example]

**Example 1**

This example turns the turtle a pseudorandom number of degrees, and then displays the direction of the turtle to the screen.
<pre>
turnRight(randomNumber(359));                     // turns the turtle a pseudorandom number of degrees
textLabel("direction", getDirection(), "forId");  // creates a text label that displays the direction
                                                  // to the screen
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example creates a button that the user can click to turn the turtle a pseudorandom number of degrees. The current direction the turtle is facing is displayed on the screen.

<pre>
speed(50);                                                        // sets the speed to 50 so its easier to
                                                                  //    see the turtle turn
textLabel("direction", "direction: " + getDirection(), "forId");  // creates a text label to display the
                                                                  //    turtle's current direction
button("random-direction", "Random Direction");                   // creates a button to turn the turtle to
                                                                  //    pseduorandom number of degrees
onEvent("random-direction", "click", function(event) {            // when the random direction button is
                                                                  //    clicked this function will be called
  turnRight(randomNumber(359));                                   // turns right a pseudorandom number
                                                                  //    of degrees
  setText("direction", "direction: " + getDirection());           // updates the text label with the turtle's
                                                                  //    current direction
});
</pre>


[/example]

____________________________________________________

[example]

**Example 3**

This example creates two buttons, one to turn the turtle left and one to turn the turtle left. It reports the current direction the turtle is facing on the screen.

<pre>
textLabel("direction", "direction: " + getDirection(), "forId");  // creates a text label to display the
                                                                  //    turtle's current direction
button("turn-left", "Turn Left");                                 // creates a turn left button
button("turn-right", "Turn Right");                               // creates a turn right button
onEvent("turn-left", "click", function(event) {                   // when the turn left button is clicked
                                                                  //    the turtle will turn 1 degree to
                                                                  //    the left and the current direction
                                                                  //    of the turtle will be updated
  turnLeft(1);
  setText("direction", "direction: " + getDirection());
});
onEvent("turn-right", "click", function(event) {                   // when the turn right button is clicked
                                                                   //     the turtle will turn 1 degree to
                                                                   //     the right and the current direction
                                                                   //    of the turtle will be updated
  turnRight(1);
  setText("direction", "direction: " + getDirection());
});
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getDirection()
</pre>

[/syntax]

[parameters]

### Parameters
`getDirection()` does not take any parameters.

[/parameters]

[returns]

### Returns
Returns an integer representing the direction the turtle is facing. For reference, the values of the cardinal directions are shown below.  
North: 0  
East: 90  
South: 180  
West: 270

[/returns]

[tips]

### Tips


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
