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

Takes the absolute value of x.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
var y = Math.abs(-23); //Get the absolute value of -23 and store it in variable y
console.log(y); //Print the value of y to the debugging console, in this case "23"
</pre>

[/example]

____________________________________________________

[example]

**Distance between two points.** In this example, we use coordinates to calculate the horizontal and vertical distance between two points. This example also uses [Math.round](/applab/docs1/mathRound) to display results.

<pre>
show(); //Display the turtle
var x1 = getX(); //Get the X coordinate of the turtle and store it in variable x1
var y1 = getX(); //Get the Y coordinate of the turtle and store it in variable x1
arcRight(123, 60); //Move the turtle along a 123° arc of radius 60 pixels
var x2 = getX(); //Get the new X coordinate of the turtle and store it in variable x2
var y2 = getY(); //Get the new Y coordinate of the turtle and store it in variable y2
//The absolute value of the difference between x1 and x2 is the horizontal distance traveled
var horizontalDistance = Math.abs(x2-x1);
//The absolute value of the difference between y1 and y2 is the vertical distance traveled
var verticalDistance = Math.abs(y2-y1);
//Print the horizontal distance, rounded to the nearest integer
console.log("The turtle traveled " + Math.round(horizontalDistance) + " pixels horizontally.");
//Print the vertical distance, rounded to the nearest integer
console.log("The turtle traveled " + Math.round(verticalDistance) + " pixels vertically");
</pre>

[/example]

____________________________________________________

[example]

**Increments of distance.** In this more advanced example, we move the turtle a number of times at random, and keep track of the total distance traveled.
<pre>
show(); //Display the turtle
var distance = 0; //Initialize the distance variable to 0 (no travel)
for (var i = 0; i < 4; i++) { //Move the turtle four times
  var y = randomNumber(-100, 100); //Generate a random number between -100 and 100 and store it in variable y
  // Note that when y is negative, the turtle travels backwards, and forwards when y is positive
  console.log("Move " + y + " units."); //Print the value of y to the debugging console
  moveForward(y); //Move the turtle by the value of y, in pixels
  distance = distance + Math.abs(y); //Increment the distance traveled by the absolute value of y
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
- This function is identical to the native JavaScript [abs Method](http://www.w3schools.com/jsref/jsref_abs.asp).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
