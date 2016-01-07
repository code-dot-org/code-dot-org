---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## arcLeft(angle, radius)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Moves the turtle forward and to the left in a smooth, circular arc.

[/short_description]

The turtle is not limited to only moving in a straight line. arcLeft(angle,radius) moves the turtle counterclockwise along an *angle* degree arc of a *radius* sized circle. The center of the circle is *radius* pixels to the left of the starting turtle position and direction.
 
[/description]

### Examples
____________________________________________________

[example]

```
// Draw a quarter circle counterclockwise.
arcLeft(90, 25);
```

[/example]

____________________________________________________

[example]

**Example: One Ring to Rule Them All** Draw a full circle counterclockwise.

```
// Draw a full circle counterclockwise.
penColor("gold");
penWidth(15);
arcLeft(360, 50);
```

[/example]

____________________________________________________

[example]

**Example: Negative Angle** arcLeft always moves the turtle counterclockwise. For a negative *angle* the turtle moves (360+*angle*) degrees.

```
// arcLeft always moves the turtle counterclockwise. 
// For a negative angle the turtle moves (360+angle) degrees.
arcLeft(-45, 100);
```

[/example]

____________________________________________________

[example]

**Example: Spiral** Spiral into the center of a circle.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Spiral into the center of a circle.
for (var radius=50; radius>0; radius=radius-5) {
  arcLeft(180, radius);
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/ceada786c67b4adf4d07b827ba636830-image-1445794379473.gif'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
arcLeft(angle, radius);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle degree arc to move the turtle counterclockwise in a circle.  |
| radius | number | Yes | The radius of the circle that is placed left of the turtle. radius must be >= 0.  |

[/parameters]

[returns]

### Returns
No return value. Moves turtle only.

[/returns]

[tips]

### Tips
- Use [penUp()](/applab/docs/penUp) before calling arcLeft() to have the turtle not draw as it moves.
- You can specify a radius of 0, which makes arcLeft() act the same as [turnLeft()](/applab/docs/turnLeft).
- Use alternating with [arcRight()](/applab/docs/arcRight) to make wavy lines.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
