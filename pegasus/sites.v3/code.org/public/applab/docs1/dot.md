---
title: App Lab Docs
---

[name]

## dot(radius)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Draws a dot under the turtle with the given radius.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
dot(5);     //  Draws a radius 5 pixel dot
hide();     // Hide the turtle so we can actually see the dot
</pre>

[/example]

____________________________________________________

[example]

<pre>
dot(150);   // Draws a really big dot
</pre>

[/example]

____________________________________________________

[example]

<pre>
// Draw a lot of random dots!
penUp();        // We only want dots, no lines
while (true) {  // Loop forever
  moveTo(randomNumber(320), randomNumber(480)); // Jump to a random position on the display
  dot(randomNumber(1, 10));                     // draw a random sized dot there
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
dot(radius);
</pre>

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
