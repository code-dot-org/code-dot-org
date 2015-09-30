---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## turnLeft(angle)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the turtle's direction to the left by the specified angle in degrees.

[/short_description]

The turtle's position remains the same. The direction is turned left by angle degrees.

[/description]

### Examples
____________________________________________________

[example]


```
turnLeft(90);    // Makes the turtle face left
```

[/example]

____________________________________________________

[example]


```
turnLeft(-90);   // Makes the turtle face right
```

[/example]

____________________________________________________

[example]


```
// Draw a square
moveForward(100);   // Draw the right edge
turnLeft(90);       // Turn to face along the top edge
moveForward(100);   // Draw the top edge
turnLeft(90);       // Turn to face along the left edge
moveForward(100);   // Draw the left edge
turnLeft(90);       // Turn to face along the bottom edge
moveForward(100);   // draw the bottom edge
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
turnLeft(angle);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| angle | number | Yes | The angle to turn left.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to turn left, which makes the turtle turn right instead.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
