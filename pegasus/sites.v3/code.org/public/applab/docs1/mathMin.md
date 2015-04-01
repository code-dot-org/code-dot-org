---
title: App Lab Docs
---

[name]

## Math.min(n1, n2, ..., nX)

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Takes the minimum value among one or more values n1, n2, ..., nX.

[/short_description]

**Note**: You can call this function with zero, one or more parameters, depending on how many numbers you want to compare.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var a = Math.min(5, -2); //Get the smaller of two values and store it in variable a
console.log(a); //Display the result, in this case "-2"
</pre>

[/example]

____________________________________________________

[example]

We can also use `Math.min` with multiple parameters.
<pre>
var a = Math.min(5, 0, 21.5, 13, -2); //Get the minimum of five values and store it in variable a
console.log(a); //Print the value of variable a to the debugging console, in this case "-2"
</pre>

[/example]

____________________________________________________

[example]

In this more advanced example, we generate random values between 0 and 100 and keep track of the lowest of them.
<pre>
var minimum = 100; //Initialize the minimum at the highest possible value
for (var i = 0; i < 4; i++) { //Generate four random values
  var y = randomNumber(0, 100); //Get a random number between 0 and 100 and store it in variable y
  console.log(y); //Print the value of y to the debugging console
  minimum = Math.min(minimum, y); //If the number is smaller than our current minimum, it's the new minimum
  console.log("The current minimum is " + minimum); //Print the value of minimum to the debugging console
}
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
Math.min(n1, n2,..., nX);
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
A number representing the lowest of the values given as parameters, or Infinity if no arguments are given, or NaN if one or more arguments are not numbers.

[/returns]

[tips]

### Tips
- This function is identical to the native JavaScript [min Method](http://www.w3schools.com/jsref/jsref_min.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
