---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penUp()

[/name


[category]

Category: Turtle

[/category]

[description]

[short_description]

Stops the turtle from drawing a trail behind it as it moves.

[/short_description]

Just like you lift your pen sometimes when drawing, the turtle pen can be lifted using penUp so the turtle will not leave a drawing trail behind it as it moves.

[/description]

### Examples
____________________________________________________

[example]

```
// Move the turtle without drawing a line.
speed(20);
penUp();
moveForward(100);
```

[/example]

____________________________________________________

[example]

**Example: Dotted Line** Use penUp and penDown to have the turtle draw a thick, dotted line. [Watch it run!](https://images.code.org/702651fbafa3b4c9f46b004449f29eb1-image-1444224244090.gif)

```
// Use penUp and penDown to have the turtle draw a thick, dotted line.
speed(20);
penWidth(3);
penDown();
moveForward(25);
penUp();
moveForward(25);
penDown();
moveForward(25);
penUp();
moveForward(25);
penDown();
moveForward(25);
```

[/example]

____________________________________________________

[example]

**Example: Pair of Eyes** Draw a picture that has disconnected parts (a pair of eyes) using penUp to move between parts.

```
// Draw a picture that has disconnected parts (a pair of eyes) using penUp to move between parts.
speed(20);
hide();
// first eye
penDown();          
arcRight(360, 25);			
penUp();
move(25, 10);
dot(10); 
           
move(-100, -10);
// second eye
penDown();
arcRight(360, 25);
penUp();
move(25, 10);
dot(10);
```


[/example]

____________________________________________________

[syntax]

### Syntax

```
penUp();
```

[/syntax]

[parameters]

### Parameters
penUp() does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Modifies turtle drawing only.

[/returns]

[tips]

### Tips
- [penDown()](/applab/docs/penDown) is often used with penUp. The default starting configuration for the turtle is with the pen down.
- [dot()](/applab/docs/dot) is not effected by penUp.
- If you are not seeing the turtle's movement, slow the program execution down by adjusting the slider bar under the blue reset button or by using the [speed()](/applab/docs/speed) command.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
