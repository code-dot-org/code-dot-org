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

Moves the turtle forward a given number of pixels in the current direction.

[/short_description]

moveForward() is the easiest way to move the turtle in a straight line in the direction it is facing. When used with turnLeft() and turnRight() you can navigate the turtle anywhere or draw any straight line pictures. 

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

**Example: Letter L** Draw the letter L with moveForward() and turnLeft() only.

```
// Draw the letter L with moveForward() and turnLeft() only.
turnLeft();
turnLeft();
moveForward();
moveForward();
turnLeft();
moveForward();
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

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a lemon popsicle by changing the pen color and width
// and by specifing how many pixels the turtle should move in the direction forwards and backwards.
penColor("yellow");
penWidth(40);
moveForward(100);
penWidth(5);
penColor("brown");
moveForward(-200);
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/0d47dda8effd331957863ddbee33820a-image-1445603074466.gif'>
</td>
</tr>
</table>

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
- The screen default size is 320 pixels wide and 450 pixels high, but you can move the turtle off the screen by exceeding those dimensions.
- There are three ways to move the turtle in a straight line:
	- Specify the number of pixels to move the turtle in the direction it is facing using moveForward(pixels) or [moveBackward(pixels)](/applab/docs/moveBackward).
	- Specify a number of pixels in the x and y direction to move the turtle using [move(x,y)](/applab/docs/move), regardless of direction that the turtle is facing.
	- Specify an x and y pixel location on the screen to move the turtle to using [moveTo(x,y)](/applab/docs/moveTo), regardless of direction that the turtle is facing.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
