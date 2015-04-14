---
title: App Lab Docs
---

[name]

## show()
[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Shows the turtle by making it visible at its current location.

[/short_description]

**Note**: [hide()](/applab/docs/hide) is often used with show.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
show();              // shows the turtle by making it visible at its current location
moveForward(100);    // moves the turtle forward 100 pixels
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example creates two buttons that allow you to switch between showing and hiding the turtle.

<pre>
button("hide-turtle", "hide");                      // creates a hide button
button("show-turtle", "show");                      // creates a show button
onEvent("hide-turtle", "click", function(event) {   // when the hide button is clicked the turtle will
                                                    //    no longer be visible
  hide();
});
onEvent("show-turtle", "click", function(event) {   // when the show button is clicked the turtle will
                                                    //    be visible
  show();
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
show();
</pre>

[/syntax]

[parameters]

### Parameters
`show()` does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- [hide()](/applab/docs/hide) is often used with show.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
