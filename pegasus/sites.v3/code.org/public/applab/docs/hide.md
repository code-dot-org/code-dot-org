---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## show()

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Makes the turtle invisible at its current location.

[/short_description]

Sometimes seeing the turtle icon is helpful when it is drawing something, other times you might want to hide the turtle so it does not obscure the picture.

[/description]

### Examples
____________________________________________________

[example]

```
// Hide the turtle and move it up from the turtle starting postion at the center of the screen.
hide();
moveForward();
```

[/example]

____________________________________________________

[example]

**Example: Peek-a-Boo** Use buttons to hide and show the turtle.

<table>
<tr>
<td>
<pre>
// Use buttons to hide and show the turtle.
button("hide-turtle", "hide");
button("show-turtle", "show");
onEvent("hide-turtle", "click", function() {
  hide();
});
onEvent("show-turtle", "click", function() {
  show();
});
</pre>
</td>
<td>
<img src='https://images.code.org/484f7e8b701e3da1ae581adfd05371f9-image-1445110723991.gif' style='width: 150px;'> 
</td>
</tr>
</table>

[/example]

____________________________________________________

[syntax]

### Syntax

```
hide();
```

[/syntax]

[parameters]

### Parameters
hide() does not take any parameters.

[/parameters]

[returns]

### Returns
No return value. Alters the display only.

[/returns]

[tips]

### Tips
- [show()](/applab/docs/show) is often used with hide.
- The turtle's ability to draw is not effected by the show() or hide() commands, which only control if the turtle icon is displayed or not.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
