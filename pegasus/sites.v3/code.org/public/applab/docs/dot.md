---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## dot(radius)

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Draws a dot centered at the turtle's location with the specified radius.

[/short_description]

Drawing a dot is one of the ways to draw with the turtle. There are many things you can draw with just dots and lines, along wth the ability to change the pen color, line thickness and dot radius.

[/description]

### Examples
____________________________________________________

[example]

```
//  Draw a 5 pixel radius dot.
dot(5);
```

[/example]

____________________________________________________

[example]

**Example: Large Dot** Draw a really big dot.

```
// Draw a really big dot.
dot(150);
```

[/example]

____________________________________________________

[example]

**Example: Fill the Screen** Draw a huge dot to change the color of the entire screen.

```
// Draw a huge dot to change the color of the entire screen.
penColor("red");
dot(300);
```

[/example]

____________________________________________________

[example]

**Example: Mickey Mouse** Draw Mickey Mouse with three dots.

```
// Draw Mickey Mouse with three dots.
penUp();
dot(100);
moveForward(125);
turnLeft();
moveForward(75);
dot(50);
turnLeft(180);
moveForward(150);
dot(50);
```

[/example]

____________________________________________________

[example]

**Example: Dalmatian** Draw a lot of random sized dots at random locations.

```
// Draw a lot of random sized dots at random locations.
penUp();
for (var i = 0; i < 500; i++) {
  moveTo(randomNumber(320), randomNumber(480));
  dot(randomNumber(1, 10));
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
dot(radius);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| radius | number | Yes | The radius (in pixels) of the dot to draw  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- When drawing small dots, make sure you move or hide the turtle so you can actually see them.
- Draw a huge dot to color the screen all one color.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
