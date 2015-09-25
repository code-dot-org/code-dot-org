---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## turnRight(angle)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the turtle's direction to the right by the specified angle in degrees.

[/short_description]

The turtle's position remains the same. The direction is turned right by angle degrees.

[/description]

### Examples
____________________________________________________

[example]


```
turnRight(90);    // Makes the turtle face left
```

[/example]

____________________________________________________

[example]


```
// Draw a Triangle
moveForward(100);   // Move along the left edge
turnRight(120);     // Turn to face the top right edge. Interior angle is 60, so turn 180 - 60
moveForward(100);   // Move along the top right edge
turnRight(120);     // Turn to face the bottom right edge
moveForward(100);   // Move along the bottom right edge
```

[/example]

____________________________________________________

[example]


```
// Draw a 25 pointed star
var points = 25;                        // Number of points to draw, must be odd
var angle = 180.0 - (180.0 / points);   // We want to almost turn around every time, and do a complete 180 in our 25 steps
for (var i = 0; i < points; i++) {      // Loop through all the points
  moveForward(200);                     // Move forward
  turnRight(angle);                     // Turn almost all the way around
}
```

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
| angle | number | Yes | The angle to turn right.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- You can specify a negative angle to turn right, which makes the turtle turn left instead.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
