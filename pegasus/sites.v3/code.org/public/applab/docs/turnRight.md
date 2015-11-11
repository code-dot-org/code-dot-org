---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## turnRight(*angle*)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Rotates the turtle right by the specified angle. The turtle’s position remains the same.

[/short_description]

turnRight() is one of the ways to change the turtle's orientation. When used with moveForward(), you can move, and draw with, the turtle anywhere on the screen.

[/description]

### Examples
____________________________________________________

[example]


```
// Rotate the turtle right 90 degrees (the default angle) from the current direction.
turnRight();
```

[/example]

____________________________________________________

[example]

**Example: Step** Draw a step with a right turn and a left turn. 

```
// Draw a step with a right turn and a left turn.
moveForward();
turnRight();
moveForward();
turnLeft();
```

[/example]
____________________________________________________

[example]

**Example: Letter W** Draw the letter W with right turns only. 

```
// Draw the letter W with right turns only.
turnRight(150);
moveForward();
turnRight(-120);
moveForward();
turnRight(120);
moveForward();
turnRight(-120);
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: Star** Draw a 25 pointed star by first calculating the exterior angle turn necessary. 

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a 25 pointed star by first calculating the exterior angle turn necessary. 
var points = 25;
var exteriorAngle = 180.0 - (180.0 / points);
for (var i = 0; i &lt; points; i++) {
  moveForward(200);
  turnRight(exteriorAngle);
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/3fae81b2ff35c4dcfe7c784b186b39c9-image-1445619726798.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
turnRight(angle);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | No | The angle to rotate right (90 degrees is default).  |

[/parameters]

[returns]

### Returns
No return value. Rotates turtle only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to turn right, which makes the turtle turn left instead.
- There are three ways to rotate the turtle in place
	- turnRight(*angle*) - Rotates the turtle right **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnLeft(*angle*) - Rotates the turtle left **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnTo(*angle*) - Rotates the turtle **to** a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left. The turtle’s position remains the same.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
