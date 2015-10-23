---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## moveBackward(*pixels*)

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle backward a given number of pixels from the current direction.

[/short_description]

Sometimes it is more natural to tell the turtle to moveBackward() in a straight line instead of telling the turtle to moveForward() a negative number of pixels.

[/description]

### Examples
____________________________________________________

[example]

```
// Move backward 25 pixels (default)
moveBackward();
```

[/example]

____________________________________________________

[example]

**Example: Letter L** Draw the letter L with moveBackward() and turnLeft() only.

```
// Draw the letter L with moveBackward() and turnLeft() only.
moveBackward();
moveBackward();
turnLeft();
moveBackward();
```

[/example]

____________________________________________________

[example]

**Example: Long Line** Move backward 200 pixels.

```
// Move backward 200 pixels.
moveBackward(200);
```

[/example]

____________________________________________________

[example]

**Example: Barbell** Draw a barbell using moveForward(), moveBackward() and dot().

```
// Draw a barbell using moveForward(), moveBackward() and dot().
moveForward(50);
dot(10);
moveBackward(100);
dot(10);
moveForward(50);
```

[/example]

____________________________________________________

[example]

**Example: Parallel Park the Turtle** Use canvas drawing and moveBackward() to parallel park.

<table>
<tr>
<td>
<pre>
// Use canvas drawing and moveBackward() to parallel park.
speed(10);
createCanvas("id", 320, 480);
setFillColor("yellow");
rect(180, 100, 60, 100);
setFillColor("red");
rect(180, 300, 60, 100);
show();
moveForward(75);
moveBackward(50);
turnLeft(45);
moveBackward(75);
turnRight(45);
moveForward();
</pre>
</td>
<td>
<img src='https://images.code.org/7537a5e6a8cbd32129451bd33c9ae549-image-1445198398879.gif' style='width: 150px;'> 
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
moveBackward(pixels);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| pixels | number | No | The number of pixels to move the turtle backward from its current direction. If not provided, the turtle will move forward 25 pixels  |

[/parameters]

[returns]

### Returns
No return value. Moves turtle only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling moveBackward() to have the turtle not draw as it moves.
- The screen default size is 320 pixels wide and 480 pixels high, but you can move the turtle off the screen by exceeding those dimensions.
- There are three ways to move the turtle in a straight line:
	- Specify the number of pixels to move the turtle in the direction it is facing using [moveForward(pixels)](/applab/docs/moveForward) or moveBackward(pixels).
	- Specify a number of pixels in the x and y direction to move the turtle using [move(x,y)](/applab/docs/move), regardless of direction that the turtle is facing.
	- Specify an x and y pixel location on the screen to move the turtle to using [moveTo(x,y)](/applab/docs/moveTo), regardless of direction that the turtle is facing.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
