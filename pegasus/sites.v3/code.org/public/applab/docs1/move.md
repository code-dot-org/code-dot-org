---
title: App Lab Docs
---

[name]

## move(pixels)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle from its current location, ignoring which way the turtle is facing.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
move(50, 50);	// Move the turtle down and to the right
</pre>

[/example]

____________________________________________________

[example]

<pre>
turnRight(90);	// turn the turtle right
move(50, 50);	// Still moves down and to the right
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a arrow pointing up from where the turtle is
penDown();
move(0, -100);
move(-25, 50);
move(50, 0);
move(-25, -50);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
move(x, y);
</pre>

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
