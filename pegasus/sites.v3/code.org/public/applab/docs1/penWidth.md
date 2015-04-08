---
title: App Lab Docs
---

[name]

## penWidth(x)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Changes the thickness of the line the turtle leaves behind as it moves on the screen.

[/short_description]


[/description]

### Examples
____________________________________________________

[example]

<pre>
penWidth(10);
moveForward(100);
</pre>

[/example]

____________________________________________________

[example]

<pre>
var amount_turned = 0;
while ((amount_turned < 360)) {
  var rand_amount = (randomNumber(50));
  penWidth(rand_amount);
  moveForward(100);
  moveBackward(100);
  turnRight(rand_amount);
  amount_turned = (amount_turned + rand_amount);
}
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
penWidth(x);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The thickness of the line drawn as the turtle moves  |

Note: A number less than or equal to zero will result in a thickness of 1

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
