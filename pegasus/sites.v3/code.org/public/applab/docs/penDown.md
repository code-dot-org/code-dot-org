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

Puts the pen down so the turtle draws a line behind it as it moves.

[/short_description]

Just like you need to put the pen down on the paper to draw, the turtle pen needs to be put down to draw a line as it moves.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a line up from the turtle starting postion at the center of the screen.
penDown();
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: Another Line** Move the turtle from the center of the screen without drawing a line, then draw a line up.

```
// Move the turtle from the center of the screen without drawing a line, then draw a line up.
penUp();
moveForward();
penDown();
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: X Marks the Spot** Use penUp and penDown to have the turtle draw an 'X', returning the turtle to the starting point.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Use penUp and penDown to have the turtle draw an 'X', returning the turtle to the starting point.
penUp();
move(-100,-100);
penDown();
move(200,200);
penUp();
move(-100,-100);
move(-100,100);
penDown();
move(200,-200);
penUp();
move(-100,100);
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/daa77ab1948749cd25db8d1022f1497d-image-1445602642474.gif'> 
</td>
</tr>
</table>
 
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
penDown() does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Modifies turtle drawing only.

[/returns]

[tips]

### Tips
- [penUp()](/applab/docs/penUp) is often used with penDown. 
- The default starting configuration for the turtle is with the pen down.
- The color and width of the turtle line can be changed using [penColor(color)](/applab/docs/penColor) and [penWidth(width)](/applab/docs/penWidth).
- Turtle drawing commands are not effected by the [show()](/applab/docs/show) and [hide()](/applab/docs/hide) commands, which control if the turtle icon is displayed or not.
- If you are not seeing the turtle's movement, slow the program execution down by adjusting the tortoise/hare slider bar in the Debug Console or by using the [speed()](/applab/docs/speed) command.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
