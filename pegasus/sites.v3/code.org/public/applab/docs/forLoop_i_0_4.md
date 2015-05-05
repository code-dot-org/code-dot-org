---
title: App Lab Docs
---

[name]

## for loop

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

The following definition is from [w3schools documentation on for-loops](http://www.w3schools.com/js/js_loop_for.asp)

____________________________________________________
[example]

The **for loop** is often the tool you will use when you want to create a loop. The for loop has the following syntax:
<pre>
for (statement 1; statement 2; statement 3) {
    code block to be executed
}
</pre>
**Statement 1** is executed before the loop (the code block) starts.

**Statement 2** defines the condition for running the loop (the code block).

**Statement 3** is executed each time after the loop (the code block) has been executed.


[/example]
____________________________________________________

The most common usage of a for-loop in JavaScript is simply to use it as a "repeat loop" - a block of code that defines how many times you want some lines of code to repeat.  Unfortunately, JavaScript does not have a simple "repeat" construct, so you need to use a for-loop.  Here is a typical construct used to repeat in which the loop uses a variable to count up to 10 and then stops: 

<code>for(var i = 0; i < 10; i++)</code>

Following the definition above here is a breakdown of the meaning the individual statements for this loop.

**Statement 1** <code>var i = 0;</code> "Create a variable called i and set it to 0" -- executed before the loop starts

**Statement 2** <code>i < 10;</code>"While i is less than 10" -- condition for continuing to run the loop

**Statement 3** <code>i++</code> "Increase (increment) i by 1" -- executed each time after the last line of code in the loop is run, before the condition is checked again.

The simple repeat behavior is shown in the first example.

 
[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The most common usage of a for-loop in javascript is simply to use it as a "repeat loop".  The loop below repeats the group of turtle moves 10 times.  You can change the 10 to any number. 
<pre>
penDown();
for(var i=0; i<10; i++){
	moveForward(25);
	dot(5);
}
</pre>

[/example]
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
