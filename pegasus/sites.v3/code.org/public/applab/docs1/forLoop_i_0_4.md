---
title: App Lab Docs
---

[name]

## forLoop_i_0_4

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Creates a loop consisting of an initialization expression, a conditional expression, an incrementing expression, and a block of statements executed for each iteration of the loop.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares a for loop that executes a block of code 5 times.
Each iteration of the loop computes a random number and adds the value to the variable named `sum`.
After the loop terminates, the average is computed and the result is printed to the console.

<pre>
var count = 5;
var sum = 0;
for (var idx = 0; idx < count; idx++) {
    var value = Math.random(); // computes a random number
    sum += value; // adds the random number to the variable sum
}

var average = sum / count; // computes the average of the five random numbers
console.log(average); // prints the average to the console
</pre>

[/example]
____________________________________________________

[example]

The following block of code declares an empty Array of length 10.
The for loop iterates through each index of the Array and sets the value at that index
to a random number between 0 and 100.
After the loop terminates, the numbers are printed to the console.

<pre>
var numbers = new Array(10);
for (var j = 0; j < numbers.length; j++) {
    var value = randomNumber(0, 100); // compute a random number between 0 and 100
    numbers[j] = value; // store the random number in the Array at the jth index
}

console.log(numbers); // print the Array of numbers to the console.
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
for (initialization; condition; expression) {
  statement
}
</pre>

[/syntax]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
