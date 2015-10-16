---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## moveForward(*pixels*)

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle forward a given number of pixels in its current direction.

[/short_description]

moveForward() is the easiest way to move the turtle in s straight line in the direction it is facing. When used with turnLeft() and turnRight() you can navigate the turtle anywhere or draw any striaght line pictures. 

[/description]

### Examples
____________________________________________________

[example]

```
// Move forward 25 pixels (default)
moveForward(); 
```

[/example]

____________________________________________________

[example]

**Example: Square** Draw a square with right turns only.

```
// Draw a square with right turns only.
moveForward();
turnRight();
moveForward();
turnRight();
moveForward();
turnRight();
moveForward();
turnRight();
```

[/example]

____________________________________________________

[example]

**Example: Long Line** Move forward 200 pixels.

```
// Move forward 200 pixels
moveForward(200); 
```

[/example]

____________________________________________________

[example]

**Example: Lemon Popsicle** Draw a lemon popsicle by changing the pen color and width, and by specifing how many pixels the turtle should move in the direction forwards and backwards.

```
// Draw a lemon popsicle by changing the pen color and width
// and by specifing how many pixels the turtle should move in the direction forwards and backwards.
penColor("yellow");
penWidth(40);
moveForward(100);
penWidth(5);
penColor("brown");
moveForward(-200);
```

<img src='https://images.code.org/9bbc8dc1d83ef8aa32029dab1237b6d5-image-1444559746146.gif' style='width: 150px;'> 

[/example]

[syntax]

### Syntax

```
moveForward(pixels);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| pixels | number | No | The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels  |

[/parameters]

[returns]

### Returns
No return value. Moves turtle only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling moveForward() to stop the turtle from drawing a line behind it as it moves.
- The screen is 320 pixels wide and 480 pixels high, but you can move the turtle off the screen by exceeding those dimensions.
- There are three ways to move the turtle in a straight line:
	- Specify the number of pixels to move the turtle in the direction it is facing using moveForward(pixels) or [moveBackward(pixels)](/applab/docs/moveBackward).
	- Specify a number of pixels in the x and y direction to move the turtle, regardless of direction that the turtle is facing [move(x,y)](/applab/docs/move).
	- Specify an x and y pixel location on the screen to move the turtle to, regardless of direction that the turtle is facing  [moveTo(x,y)](/applab/docs/moveTo).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
