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

Draws a dot in the turtle's location with the specified radius.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]


```
dot(5);     //  Draws a radius 5 pixel dot
hide();     // Hide the turtle so we can actually see the dot
```

[/example]

____________________________________________________

[example]


```
dot(150);   // Draws a really big dot
```

[/example]

____________________________________________________

[example]


```
// Draw a lot of random dots!
penUp();        // We only want dots, no lines
while (true) {  // Loop forever
  moveTo(randomNumber(320), randomNumber(480)); // Jump to a random position on the display
  dot(randomNumber(1, 10));                     // draw a random sized dot there
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
| radius | number | Yes | The radius of the dot to draw  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- When drawing small dots, make sure you move or hide the turtle so you can actually see them.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
