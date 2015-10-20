---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## moveTo(x, y)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle to a specific (x,y) position on the screen.

[/short_description]

Use moveTo(x,y) when drawing a picture that has objects, or corners of objects, at specific positions on the screen. Unlike move(x,y), which moves the turtle *relative* to it's current position, moveTo(x,y) moves the turtle to an *absolute* position on the screen. The direction that the turtle is facing remains unchanged.

[/description]

### Examples
____________________________________________________

[example]

```
// Move the turtle near the top, left of the screen.
moveTo(50, 50);
```

[/example]

____________________________________________________

[example]

**Example: Square** Draw a square by connecting the four corners in counterclockwise order.

<table>
<tr>
<td>
<pre>
// Draw a square by connecting the four corners in counterclockwise order.
penUp();
moveTo(50, 50);
penDown();
moveTo(50, 270);
moveTo(270, 270);
moveTo(270, 50);
moveTo(50, 50);
</pre>
</td>
<td>
<img src='https://images.code.org/d8fb09333bcb26127856b2e948d2ed98-image-1445213125116.gif' style='width: 150px;'> 
</td>
</tr>
</table>

[/example]

____________________________________________________

[example]

**Example: Octogon** Draw an octogon at the center of the screen using polar to cartesion conversion.

```
// Draw an octogon at the center of the screen using polar to cartesian conversion.
var sides = 8;
var radius = 100;
var centerX = 160;
var centerY = 240;
for (var i = 0; i < sides + 1; i++) {
  var angle = ((i / sides) * 2 * Math.PI);
  moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
moveTo(x, y);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x coordinate on the screen to move the turtle to.  |
| y | number | Yes | The y coordinate on the screen to move the turtle to.  |

[/parameters]

[returns]

### Returns
No return value. Moves turtle only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling moveTo(x,y) to have the turtle not draw as it moves.
- (0,0) is upper left corner and x increases from left to right and y increases from top to bottom. 
- The screen default size is 320 pixels wide and 480 pixels high, but you can move the turtle off the screen by exceeding those dimensions.
- There are three ways to move the turtle in a straight line:
	- Specify the number of pixels to move the turtle in the direction it is facing using [moveForward(pixels)](/applab/docs/moveForward) or [moveBackward(pixels)](/applab/docs/moveBackward).
	- Specify a number of pixels in the x and y direction to move the turtle using [move(x,y)](/applab/docs/move), regardless of direction that the turtle is facing.
	- Specify an x and y pixel location on the screen to move the turtle to using moveTo(x,y), regardless of direction that the turtle is facing.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
