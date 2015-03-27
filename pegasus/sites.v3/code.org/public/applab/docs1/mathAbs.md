---
title: App Lab Docs
---

[name]

## Math.abs(x)

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Absolute value.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = (-23.5); //Take an arbitrary number and store it in variable x
var y = (Math.abs(x)); //Get the absolute value of x and store it in variable y
console.log(y); //Print the value of y to the debugging console, in this case "23.5"
</pre>

[/example]

____________________________________________________

[example]

**Increments of distance.** In this more advanced example, we move the turtle a number of times at random, and keep track of the total distance traveled.
<pre>
show(); //Display the turtle
var distance = 0; //Initialize the distance variable to 0 (no travel)
for (var i = 0; i < 4; i++) { //Move the turtle four times
  var x = (randomNumber(-100, 100)); //Generate a random number between -100 and 100 and store it in variable x
  // Note that when x is negative, the turtle travels backwards, and forwards when x is positive
  console.log("Move " + x + " units."); //Print the value of x to the debugging console
  moveForward(x); //Move the turtle by the value of x, in pixels
  distance = distance + Math.abs(x); //Increment the distance traveled by the absolute value of x
}
console.log("The turtle has moved a total of " + distance + " units."); //Print the total distance
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
Math.abs(x);
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
A number representing the absolute value of x, or NaN if x is not a number, or 0 if no parameter is provided.

[/returns]

[tips]

### Tips
This function is identical to the native JavaScript [abs Method](http://www.w3schools.com/jsref/jsref_abs.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
