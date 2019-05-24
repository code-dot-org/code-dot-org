---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## turnLeft(*angle*)

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Rotates the turtle left by the specified angle. The turtle’s position remains the same.

[/short_description]

turnLeft() is one of the ways to change the turtle's orientation. When used with moveForward(), you can move, and draw with, the turtle anywhere on the screen.

[/description]

### Examples
____________________________________________________

[example]

```
// Rotate the turtle left 90 degrees (the default angle) from the current direction.
turnLeft();  
```

[/example]

____________________________________________________

[example]

**Example: Square** Draw a square with left turns only. 

```
// Draw a square with left turns only.
moveForward();
turnLeft();
moveForward();
turnLeft();
moveForward();
turnLeft();
moveForward();
turnLeft(); 
```

[/example]

____________________________________________________

[example]

**Example: Checkmark** Draw a checkmark with left turns using angle parameters. 

```
// Draw a checkmark with left turns using angle parameters. 
turnLeft(120);
moveForward(100);
turnLeft(270);
moveForward(25);
```

[/example]

____________________________________________________

[example]

**Example: House** Draw a house with left turns only. 

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a house with left turns only.
turnLeft(45);
moveForward(50);
turnLeft(90);
moveForward(50);
turnLeft(45);
moveForward(75);
turnLeft(-270); // same as turnLeft(90);
moveForward(70);
turnLeft(90);
moveForward(75);
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/db1170b1ee761ac5f4541a6aa8a72748-image-1445625001095.gif'>
</td>
</tr>
</table>

[/example]

[syntax]

### Syntax

```
turnLeft(angle)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | No | The angle to rotate left (90 degrees is default).  |

[/parameters]

[returns]

### Returns
No return value. Rotates turtle only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to rotate left, which makes the turtle turn right instead.
- There are three ways to rotate the turtle in place
	- turnRight(*angle*) - Rotates the turtle right **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnLeft(*angle*) - Rotates the turtle left **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnTo(*angle*) - Rotates the turtle **to** a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left. The turtle’s position remains the same.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
