---
title: App Lab Docs
---

[name]

## getDirection()

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Returns (gets) the current direction that the turtle is facing.

[/short_description]



[/description]

### Examples
____________________________________________________

[example]

<pre>
turnRight(randomNumber(359));
textLabel("direction", getDirection(), "forId");
</pre>

[/example]

____________________________________________________

[example]

<pre>
textLabel("direction", "direction: " + getDirection(), "forId");
button("random-direction", "Random Direction");
onEvent("random-direction", "click", function(event) {
  turnRight(randomNumber(359));
  setText("direction", "direction: " + getDirection());
});
</pre>


[/example]

____________________________________________________

[example]

<pre>
textLabel("direction", "direction: " + getDirection(), "forId");
button("turn-left", "Turn Left");
button("turn-right", "Turn Right");
onEvent("turn-left", "click", function(event) {
  turnLeft(1);
  setText("direction", getDirection());
});
onEvent("turn-right", "click", function(event) {
  turnRight(1);
  setText("direction", getDirection());
});
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getDirection()
</pre>

[/syntax]

[parameters]

### Parameters
`getDirection()` does not take any parameters.

[/parameters]

[returns]

### Returns
Returns an integer representing the direction the turtle is facing.
North: 0
East: 90
South: 180
West: 270

[/returns]

[tips]

### Tips


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
