---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## turnTo(angle)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the turtle's direction to a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left.

[/short_description]

Sometimes you need to orient the turtle in a certain direction before drawing something. turnTo changes the turtle's direction to be *angle* degrees clockwise from a line pointing up. The turtle's position remains the same. 
<img src='https://images.code.org/569c4a42322db34372bbbd2096cbb5d4-image-1445680553509.jpg'>

[/description]

### Examples
____________________________________________________

[example]


```
// Turtle faces right.
turnTo(90);    
```

[/example]

____________________________________________________

[example]

**Example: Look South** Turtle faces down.

```
// Turtle faces down.
turnTo(180);
```

[/example]

____________________________________________________

[example]

**Example: Clock Face** Draw a minute and hour marks on a clock face

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draw a minute and five minute marks on a clock face
for (var minute = 0; minute &lt;= 60; minute++) {
  penUp();
  moveTo(160, 240);
  turnTo(minute*6); // Every minute is 6 degrees.
  penUp();
  if(Math.round(minute/5)*5==minute) { // Must be a five minute mark.
    moveForward(50);
    penDown();
    moveForward(25);
  }
  else {
    moveForward(70);
    penDown();
    moveForward(5);   
  }
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/5021ac3ccb9e08af3b68046c47415e46-image-1445681906473.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
turnTo(angle);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle to point the turtle.  |

[/parameters]

[returns]

### Returns
No return value. Rotates turtle only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to rotate to, measured counterclockwise from up (0 angle).
- There are three ways to rotate the turtle in place
	- turnRight(*angle*) - Rotates the turtle right **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnLeft(*angle*) - Rotates the turtle left **by** the specified angle relative to the current turtle direction. The turtle’s position remains the same.
	- turnTo(*angle*) - Rotates the turtle **to** a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left. The turtle’s position remains the same.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
