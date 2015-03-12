---
title: App Lab Docs
---

[name]

## moveForward()

[/name]

[description]

Moves the turtle forward a given number of pixels in its current direction.

[/description]



### Examples
____________________________________________________

[example]

    moveForward(); //Moves forward 25 pixels (default)

[/example]

____________________________________________________

[example]

    penUp(); //Lifts the pen so the turtle doesn't draw
    moveForward(200); //Moves the turtle forward 200 pixels

[/example]

____________________________________________________

[syntax]

### Syntax
    moveForward(numPixels);

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| numPixels | number | No | The number of pixels to move forward. If not provided, the turtle will move forward 25 pixels  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling moveForward() to have the turtle not draw as it moves.

[/tips]
