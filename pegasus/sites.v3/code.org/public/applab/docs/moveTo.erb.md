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

Use moveTo(x,y) when drawing a picture where parts of the picture need to be at very specific positions on the screen. Unlike move(x,y), which moves the turtle *relative* to it's current position, moveTo(x,y) moves the turtle to an *absolute* position on the screen. The direction that the turtle is facing remains unchanged.

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
<td style="border-style:none; width:90%; padding:0px">
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
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/57fc8705526006cebcc8fe293b279474-image-1445618010540.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[example]

**Example: Parabola** Draw an half parabola opening downward.

```
// Draw an half parabola opening downward.
penUp();
for (var x = 0; x < 200; x++) {
  var y = x*x/100;
  moveTo(x,y);
  penDown();
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
- The screen default size is 320 pixels wide and 450 pixels high, but you can move the turtle off the screen by exceeding those dimensions.
- There are three ways to move the turtle in a straight line:
	- Specify the number of pixels to move the turtle in the direction it is facing using [moveForward(pixels)](/applab/docs/moveForward) or [moveBackward(pixels)](/applab/docs/moveBackward).
	- Specify a number of pixels in the x and y direction to move the turtle using [move(x,y)](/applab/docs/move), regardless of direction that the turtle is facing.
	- Specify an x and y pixel location on the screen to move the turtle to using moveTo(x,y), regardless of direction that the turtle is facing.

<img src='https://images.code.org/7de9a1ac26ad8630ebcb92e608c3803c-image-1445616750775.jpg'>

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
