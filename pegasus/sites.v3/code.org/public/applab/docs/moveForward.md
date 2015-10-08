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

There are three ways to move the turtle in a straight line:

- specify the number of pixels to move the turtle in the direction it is facing (moveForward(pixels) or moveBackward(pixels)).
- specify a number of pixels in the x and y direction to move the turtle, irregardless of direction that the turtle is facing (move(x,y)).
- specify an x and y pixel location on the screen to move the turtle to, irregardless of direction that the turtle is facing (moveTo(x,y)).

[/description]

### Examples
____________________________________________________

[example]

```
// Moves forward 25 pixels (default)
moveForward(); 
```

[/example]

____________________________________________________

[example]

**Example: Draw a Popsicle** Specify how many pixels the turtle should move in the direction it is facing with a positive number parameter, or use a negative number parameter to move backwards. [Watch it run!](https://images.code.org/ae9e0d573ff39549f4f9e0dd35e3e38d-image-1444261315399.gif)

```
// Specify how many pixels the turtle should move in the direction it is facing with a positive number parameter
// or use a negative number parameter to move backwards.
speed(20);
penColor("yellow");
penWidth(40);
moveForward(100);
penWidth(5);
penColor("brown");
moveForward(-200);
```

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
- Use [penUp()](/applab/docs/penUp) before calling moveForward() to stop the turtle from drawing a line behind it as it moves

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
