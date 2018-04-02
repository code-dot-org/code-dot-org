---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penUp()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Picks the pen up so the turtle does not draw a line as it moves.

[/short_description]

Just like you sometimes lift your pen when drawing, the turtle pen can be lifted using penUp so the turtle will not draw a line as it moves.

[/description]

### Examples
____________________________________________________

[example]

```
// Move the turtle up from the turtle starting postion at the center of the screen without drawing a line.
penUp();
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: Dotted Line** Use penUp and penDown to have the turtle draw a thick, dotted line.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Use penUp and penDown to have the turtle draw a thick, dotted line.
penWidth(3);
penDown();
moveForward();
penUp();
moveForward();
penDown();
moveForward();
penUp();
moveForward();
penDown();
moveForward();
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/89e8224609867d151d327efedefe84fc-image-1445476963436.gif'>
	
</td>
</tr>
</table>

[/example]

____________________________________________________

[example]

**Example: Pair of Eyes** Draw a picture that has disconnected parts (a pair of eyes) using penUp to move between parts.

```
// Draw a picture that has disconnected parts (a pair of eyes) using penUp to move between parts.
hide();
// first eye
penDown();          
arcRight(360, 25);			
penUp();
move(25, 10);
dot(10); 
           
move(-100, -10);
// second eye
penDown();
arcRight(360, 25);
penUp();
move(25, 10);
dot(10);
```


[/example]

____________________________________________________

[syntax]

### Syntax

```
penUp();
```

[/syntax]

[parameters]

### Parameters
penUp() does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Modifies turtle drawing only.

[/returns]

[tips]

### Tips
- [penDown()](/applab/docs/penDown) is often used with penUp. The default starting configuration for the turtle is with the pen down.
- [dot()](/applab/docs/dot) is not effected by penUp.
- Turtle drawing commands are not effected by the [show()](/applab/docs/show) and [hide()](/applab/docs/hide) commands, which control if the turtle icon is displayed or not.
- If you are not seeing the turtle's movement, slow the program execution down by adjusting the tortoise/hare slider bar in the Debug Console or by using the [speed()](/applab/docs/speed) command.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
