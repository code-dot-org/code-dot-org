---
title: App Lab Docs
---

[name]

## hide()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Hides the turtle so it is not shown on the screen.

[/short_description]

**Note**: When the turtle is hidden [penDown()](/applab/docs/penDown) can still be used to draw a line behind the turtle as it moves.
<br />
**Note**: [show()](/applab/docs/show) is often used with hide

[/description]

### Examples
____________________________________________________

[example]

<pre>
/*  Example 1
*/

hide();               // hides the turtle so it is no longer visible on the screen
moveForward(100);     // moves the turtle forward 100 pixels
</pre>

[/example]

____________________________________________________

[example]

<pre>
/*  Example 2

    This example creates two buttons that allow you to switch between showing and hiding the turtle
*/

button("hide-turtle", "hide");                    // creates a hide button
button("show-turtle", "show");                    // creates a show button
onEvent("hide-turtle", "click", function(event) { // when the hide button is clicked the turtle will hide
  hide();
});
onEvent("show-turtle", "click", function(event) { // when the show button is clicked the turtle will show
  show();
});
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
hide();
</pre>

[/syntax]

[parameters]

### Parameters
`hide()` does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- [show()](/applab/docs/show) is often used with hide

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
