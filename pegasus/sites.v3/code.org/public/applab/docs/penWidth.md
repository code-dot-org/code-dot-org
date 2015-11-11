---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penWidth(width)

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Sets the width of the line in pixels that the turtle draws behind it as it moves.

[/short_description]

When artists draw pictures they use many different pens that can draw different line thicknesses. You can also change the thickness of the lines that the turtle draws. The default pen width is one pixel and the pen is by default in the down (drawing) position.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a line 10 pixels wide and 100 pixels long
penWidth(10);
moveForward(100);
```

[/example]

____________________________________________________

[example]

**Example: Skyscraper** Draws a skyscraper.

```
// Draw a skyscraper.
penWidth(20);
moveForward();
penWidth(15);
moveForward();
penWidth(10);
moveForward();
penWidth(5);
moveForward();
penWidth(1);
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: Sample Line Thicknesses** Draws horizontal lines with thickness 10 pixels to 90 pixels, counting by 10.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Draws horizontal lines with thickness 10 pixels to 90 pixels, counting by 10.
penUp();
moveTo(0, 0);
turnRight(90);
for (var i = 1; i &lt; 10; i++) {
  penDown();
  penWidth(i * 10);
  moveForward(250);
  moveBackward(250);
  penUp();
  turnRight(90);
  moveForward(i * 10 + 10);
  turnLeft(90);
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/03cfbdabcc8ad16e00d8fac04b6965f6-image-1445170155057.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
penWidth(width);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| width | number | Yes | The width of the line in pixels that the turtle draws behind it as it moves.  |

[/parameters]

[returns]

### Returns
No return value. Modifies turtle drawing only.

[/returns]

[tips]

### Tips
- [penUp()](/applab/docs/penUp) causes no line to be drawn.
- Turtle drawing commands are not effected by the [show()](/applab/docs/show) and [hide()](/applab/docs/hide) commands, which control if the turtle icon is displayed or not.
- Even though it may look like a line, circles are actually being drawn behind the turtle as it moves. The width passed to penWidth sets the diameter of these circles.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
