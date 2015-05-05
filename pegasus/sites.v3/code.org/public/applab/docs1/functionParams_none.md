---
title: App Lab Docs
---

[name]

## function someFunction()

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Declares a named block of code that performs some computation and optionally returns a value.  Once you have defined a function with a name you can "call" the function to get the lines of code inside to run.  Writing a function is a good idea if you have pieces of code you want to reuse.

[/short_description]

**Note**: A function that does not explicitly return a value returns the JavaScript value undefined.

[/description]

### Examples
____________________________________________________
[example]
**Turtle Example**
In this example with turtles we show the main part of the program at the top.  It shows that you can provide the definition of the function, in this case the sqaure() function, anywhere in the code regardless of where you "call it" or use it from.

<pre>
square();
turnRight();
square();

function square(){
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
}
</pre>
[/example]


[example]

The following block of code declares and invokes a function named `sayFortune`. The function returns a simple message.

<pre>
function sayFortune() {
    return "Code wins";
}

var fortune = sayFortune();
console.log(fortune);
</pre>

[/example]

____________________________________________________

[example]

The following block of code declares and invokes a function named `getRandomNumbers`. The function computes five random numbers between zero and one hundred.

<pre>
function getRandomNumbers() {
    var count = 5; // declare how many random numbers to generate
    var nums = new Array(count); // create an empty Array to store the random numbers
    // use a loop to populate the Array with random numbers
    for (var i = 0; i < count; i++) {
        nums[i] = Math.round(Math.random()*100);
    }

    return nums;
}

var randoms = getRandomNumbers();
console.log(randoms);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
function functionName() {
    // function body
}
</pre>

[/syntax]

[returns]

### Returns
A function returns the value that follows the first executed return keyword within the function.

[/returns]

### Tips
- The purpose of a function is to help you organize your code and to avoid writing the same code twice.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
