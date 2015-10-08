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

The turtle rotates left in place by the specified angle in degrees from the current turtle direction. The turtle's (x,y) position remains the same.

[/short_description]

There are three different ways to rotate the turtle in place

- turnRight(angle) - The turtle rotates right in place by the specified angle in degrees from the current turtle direction.
- turnLeft(angle) - The turtle rotates left in place by the specified angle in degrees from the current turtle direction.
- turnTo(angle) - The turtle rotates in place to a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left.

[/description]

### Examples
____________________________________________________

[example]

```
// Rotate the turtle to the left 90 degrees (the default angle) from the current direction.
turnLeft();  
```

[/example]

____________________________________________________

[example]

**Example: House** Draw a house with left turns only. [Watch it run!](https://images.code.org/4afefb9917316e867fac7402801e1200-image-1444297810014.gif)

```
// Draw a house with left turns only.
speed(20);
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
```

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

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
