---
title: App Lab Docs
---

[name]

## Math.max(n1, n2, ..., nX)

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Takes the maximum value among one or more values n1, n2, ..., nX.

[/short_description]

**Note**: You can call this function with zero, one or more parameters, depending on how many numbers you want to compare.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var a = Math.max(5,-2); //Get the greater of two values and store it in variable a
console.log(a); //Print the value of variable a to the debugging console, in this case "5"
</pre>

[/example]

____________________________________________________

[example]

We can also use `Math.max` with multiple parameters.
<pre>
var a = Math.max(5, 0, 21.5, 13, -2); //Get the maximum of five values and store it in variable a
console.log(a); //Print the value of variable a to the debugging console, in this case "21.5"
</pre>

[/example]

____________________________________________________

[example]

In this more advanced example, we generate random values between 0 and 100, and keep track of the highest of them.
<pre>
var maximum = 0; // Initialize the maximum at the lowest possible value
for (var i = 0; i < 4; i++) { //Generate four random values
  var y = randomNumber(0, 100); //Get a random number between 0 and 100 and store it in variable y
  console.log(y); //Print the value of y to the debugging console
  maximum = Math.max(maximum, y) //If the number is greater than our current maximum, it's the new maximum
  console.log("The current maximum is " + maximum); //Print the value of maximum to the debugging console
}
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
Math.max(n1, n2,..., nX);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| n1, n2,..., nX | number | No | One or more numbers to compare.  |

[/parameters]

[returns]

### Returns
A number representing the highest of the values given as parameters, or -Infinity if no arguments are given, or NaN if one or more arguments are not numbers.

[/returns]

[tips]

### Tips
- This function is identical to the native JavaScript [max Method](http://www.w3schools.com/jsref/jsref_max.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
