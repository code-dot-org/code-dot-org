---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penDown()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Draws a trail behind the turtle as it moves.

[/short_description]

Just like you need to put the pen down on the paper to draw, the turtle pen needs to be put down to leave a drawing trail behind it as it moves.

[/description]

### Examples
____________________________________________________

[example]

```
// Draw a line while moving the turtle to the right.
speed(20);
penDown();
turnRight(90);
moveForward(100);
```

[/example]

____________________________________________________

[example]

**Example: X Marks the Spot** Use penUp and penDown to have the turtle draw an 'X', returning the turtle to the starting point. [Watch it run!](https://images.code.org/6f6426d0b269862685e0b4f93bc060c3-image-1444249412298.gif)

```
// Use penUp and penDown to have the turtle draw an 'X', returning the turtle to the starting point.
speed(20);
penUp();
move(-100,-100);
penDown();
move(200,200);
penUp();
move(-100,-100);
move(-100,100);
penDown();
move(200,-200);
penUp();
move(-100,100);
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
penDown();
```

[/syntax]

[parameters]

### Parameters
penDown() does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Modifies turtle drawing only.

[/returns]

[tips]

### Tips
- [penUp()](/applab/docs/penUp) is often used with penDown. The default starting configuration for the turtle is with the pen down.
- The color and width of the turtle trail can be changed using [penColor(color)](/applab/docs/penColor) and [penWidth(width)](/applab/docs/penWidth).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
