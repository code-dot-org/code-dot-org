---
title: App Lab Docs
---

[name]

## penColor(x)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Sets the color of the line drawn behind the turtle as it moves

[/short_description]


[/description]

### Examples
____________________________________________________

[example]

<pre>
penColor("cyan");   // sets the color of the turtles trail to cyan
moveForward(100);   // moves the turtle forward by 100 pixels
</pre>

[/example]

____________________________________________________

[example]

<pre>
var c = (prompt("Enter a color"));  // prompts the user for a color
penColor(c);                        // sets the color of the turtles trail to the color the user entered
moveForward(100);                   // moves the turtle forward by 100 pixels
</pre>


[/example]

____________________________________________________

[example]

<pre>
/*  This program draws a circle figure out of lines. It cycles
    through the colors every time it turns. Here we use <b>4</b> colors, so we say penColor(colors[i%<b>4</b>]).
*/

var colors = ["red", "magenta", "pink", "purple"];  // creates an array of 4 strings representing colors
for (var i = 0; i < 360; i++) {                     // loops 360 times
  penColor(colors[i%4]);                            // sets the color of the turtles line
                                                    // to a color from the array
  moveForward(100);                                 // moves the turtle forward by 100 pixels
  moveBackward(100);                                // moves the turtle backward by 100 pixels
  turnRight(1);                                     // turns the turtle 1 pixel to the right
}
</pre>


[/example]

____________________________________________________


[syntax]

### Syntax
<pre>
penColor(x);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | String | Yes | The color of the line left behind the turtle as it moves  |


Some example color options are listed below
<pre>
penColor("black")
penColor("gray")
penColor("red")
penColor("pink")
penColor("magenta")
penColor("green")
penColor("blue")
penColor("cyan")
penColor("purple")
penColor("yellow")
penColor("orange")
</pre>

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
