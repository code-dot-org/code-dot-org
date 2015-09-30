---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## move(x, y)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle from its current location.

[/short_description]

Adds x to the turtle's x position and y to the turtle's y position. Unlike moveForward(pixels), the turtle's direction does not change how the turtle is moved. The turtle's direction in not changed.

[/description]

### Examples
____________________________________________________

[example]


```
move(50, 50);	// Move the turtle down and to the right
```

[/example]

____________________________________________________

[example]


```
turnRight(90);	// turn the turtle right
move(50, 50);	// Still moves down and to the right
```

[/example]

____________________________________________________

[example]


```
// Draw a arrow pointing up from where the turtle is
penDown();
move(0, -100);
move(-25, 50);
move(50, 0);
move(-25, -50);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
move(x, y);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The number of pixels to move the turtle right.  |
| y | number | Yes | The number of pixels to move the turtle down.  |

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

<%= view :applab_docs_common %>
