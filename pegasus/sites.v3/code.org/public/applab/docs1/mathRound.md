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

Rounds x to the nearest integer.

[/short_description]

**Note**: The tie-breaking rule for half-way numbers (ending in ".5") is to round them up.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var y = Math.round(23.5); //Round 23.5 to an integer and store the value in variable y
console.log(y); //Print the value of y to the debugging console, in this case "24"
</pre>

[/example]

____________________________________________________

[example]

This example shows how rounding a negative number is not symmetrical with rounding a positive number. The tie-breaking rule always rounds up, even when the number is negative.
<pre>
var y = Math.round(-23.5); //Round -23.5 to an integer and store the value in variable y
console.log(y); //Print the value of y to the debugging console, in this case "-23"
</pre>

[/example]

____________________________________________________

[example]

**Rounding variants.** In this more detailed example, we create a variant of the round function that always rounds down.
<pre>
// Define the function
function floor(n) {
  //Let a be an integer such that a <= n < a+1
  //The floor of n is a (it is the nearest integer smaller than n)
  //With a simple subtraction, we know that a-0.5 <= n-0.5 < a+0.5
  var m = n-0.5;
  //For every number m where a-0.5 <= m < a+0.5 and a is an integer, Math.round(m) = a
  return Math.round(m);
}
var y = floor(-23.5); //Take the floor value of -23.5 and store it in variable y
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
- This function is identical to the native JavaScript [round Method](http://www.w3schools.com/jsref/jsref_round.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
