---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Math.abs(x)

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Returns the absolute value of x.

[/short_description]

There are some math calculations that require you to find the absolute value of a value, ignoring the negative sign. *Math.abs(x)* does not change the value of x, rather it returns the absolute value of x.

[/description]

### Examples
____________________________________________________

[example]

```
var y = Math.abs(-23);
console.log(y);
```

[/example]

____________________________________________________

[example]

**Distance between two points** Use coordinates to calculate the horizontal and vertical distance between two points. This example also uses [Math.round](/applab/docs/mathRound) to display results.

```
// Use coordinates to calculate the horizontal and vertical distance between two points. This example also uses Math.round to display results.
var x1 = getX();
var y1 = getX();
arcRight(123, 60);
var x2 = getX();
var y2 = getY();
var horizontalDistance = Math.abs(x2-x1);
var verticalDistance = Math.abs(y2-y1);
console.log("The turtle traveled " + Math.round(horizontalDistance) + " pixels horizontally.");
console.log("The turtle traveled " + Math.round(verticalDistance) + " pixels vertically");
```

[/example]

____________________________________________________

[example]

**Increments of distance** Move the turtle a number of times at random, and keep track of the total distance traveled.

```
// Move the turtle a number of times at random, and keep track of the total distance traveled.
var distance = 0;
for (var i = 0; i < 4; i++) {
  var y = randomNumber(-100, 100);
  console.log("Move " + y + " units.");
  moveForward(y);
  distance = distance + Math.abs(y);
}
console.log("The turtle has moved a total of " + distance + " units.");
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
Math.abs(x);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | An arbitrary number or variable.  |

[/parameters]

[returns]

### Returns
A number representing the absolute value of x, or NaN if x is not a number, or 0 if no parameter is provided.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
