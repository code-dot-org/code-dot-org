---
title: App Lab Docs
---

[name]

## whileBlock

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Creates a loop consisting of a conditional expression and a block of statements executed for each iteration of the loop.
The loop continues to execute as long as the condition evaluates to true.

[/short_description]

**Note**: Ensure the while loop condition eventually evaluates to false to prevent an infinite loop.

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares an Array named `randoms`. The while loop executes 10 times.
Each iteration of the loop computes a random number and appends the value to the Array.
After the loop terminates, the contents of the Array is printed to the console.

<pre>
var randoms = [];
while (randoms.length < 10) {
    var num = randomNumber(0, 100);
    randoms.push(num);
}

console.log(randoms);
</pre>

[/example]
____________________________________________________

[example]
The following block of code is similar to the previous example.
Instead of creating an empty Array, however, it pre-allocates an Array of length 10.
The variable `index` is used to maintain the current position in the Array to populate next.
The while loop iterates through each index of the Array and sets the value at that index
to a random number between 0 and 100.
After the loop terminates, the numbers are printed to the console.

<pre>
var numbers = new Array(10);
var index = 0;
while (index < numbers.length) {
    var value = randomNumber(0, 100); // compute a random number between 0 and 100
    numbers[index] = value; // store the random number in the Array at the jth index
    index += 1; // increment the index by 1
}

console.log(numbers); // print the Array of numbers to the console.
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
while (condition) {
    statement
}
</pre>

[/syntax]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
