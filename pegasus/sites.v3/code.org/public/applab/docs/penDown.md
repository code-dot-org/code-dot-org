---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penDown()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Draws a trail behind the turtle as it moves.

[/short_description]

**Note**: [penUp()](/applab/docs/penUp) is often used with penDown.
**Note**: The color, and width of this trail can be changed, using [penColor(color)](/applab/docs/penColor) and [penWidth(width)](/applab/docs/penWidth).

[/description]

### Examples
____________________________________________________

[example]

**Example 1**


```
penDown();            // draws a trail behind the turtle as it moves
moveForward(100);     // moves the turtle forward 100 pixels
```

[/example]

____________________________________________________

[example]

**Example 2**

This example uses penUp and penDown to draw a dotted line.


```
speed(20);                    // sets the speed to 20, so its easier to see the turtle's movement
penWidth(3);                  // sets the pen's thickness to 3 pixels
penUp();                      // lifts the pen up so the turtle does not leave a trail behind it as it moves
move(-125, 25);               // moves the turtle to its starting location
turnRight(90);                // turns the turtle 90 degrees so that it is facing to the right
for (var i = 0; i < 5; i++) { // repeats the code in this block 5 times
  penDown();                  // puts the pen down so the turtle leaves a trail behind it as it moves
  moveForward(25);            // moves the turtle froward 25 pixels
  penUp();                    // lifts the pen up so the turtle does not leave a trail behind it as it moves
  moveForward(25);            // moves the turtle forward 25 pixels
}

```

[/example]

____________________________________________________

[example]

**Example 3**

This example uses penUp and penDown to draw a pair of eyes.


```
speed(20);          // sets the speed to 20, so its easier to see the turtle's movement
hide();             // hides the turtle so it is no longer visible
penDown();          // puts the pen down so the turtle leaves a trail behind it as it moves
arcRight(360, 25);  // draws a circle with a 25 pixel diameter (first eye)
penUp();            // lifts the pen up so the turtle does not leave a trail behind it as it moves
move(25, 10);       // moves the turtle inside the circle (first eye)
dot(10);            // draws a 10 pixel dot (first pupil)
move(-100, -10);    // moves the turtle into position for the second eye
penDown();          // puts the pen back down so the turtle leaves a trail behind it as it moves
arcRight(360, 25);  // draws the second eye, a circle with a 25 pixel diameter (second eye)
penUp();            // lifts the pen up so the turtle does not leave a trail behind it as it moves
move(25, 10);       // moves the turtle inside the circle (second eye)
dot(10);            // draws a 10 pixel dot (second pupil)
```


[/example]

____________________________________________________


[syntax]

### Syntax

```
penDown();
```

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
- [penUp()](/applab/docs/penUp) is often used with penDown.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
