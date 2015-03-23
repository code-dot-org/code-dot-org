---
title: App Lab Docs
---

[name]

## Math.round(x)

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Round to the nearest integer.

[/short_description]

**Note**: The tie-breaking rule for half-way numbers (ending in ".5") is to round them up.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = (-23.5); //Take an arbitrary number and store it in variable x
var y = (Math.round(x)); //Round that number to an integer and store the value in variable y
console.log(y); //Print the value of y to the debugging console, in this case "-23"
</pre>

[/example]

____________________________________________________

[example]

**Rounding variants.** In this more detailed example, we create a variant of the round function that always rounds down.
<pre>
// Define the function
function floor(n) {
  var m = (n-0.5); //If n is between a and a+1, subtracting 0.5 makes sure n is between a-0.5 and a+0.5
  return (Math.round(m)); //We use the behavior of the round function, which rounds to nearest integer, a
}
var x = (-23.5); //Take an arbitrary number and store it in variable x
var y = (floor(x)); //Take the floor value of variable x and store it in variable y
console.log(y); //Print the value of y to the debugging console, in this case "-24"
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
Math.round(x);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | An arbitrary number.  |

[/parameters]

[returns]

### Returns
A number representing the integer nearest to x, or NaN if x is not a number or no parameter is provided.

[/returns]

[tips]

### Tips
This function is identical to the native JavaScript [round Method](http://www.w3schools.com/jsref/jsref_round.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
