---
title: App Lab Docs
---

[name]

## if/else statement

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Executes a block of statements if the specified condition is true; otherwise, the block of statements in the else clause are executed.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code calculates a random number between 0 and 100.
The code declares a variable `evenOrOdd` which is implicitly initialized to the JavaScript value `undefined`.
The code declares a variable `remainder` which is assigned the result of calculating `num` modulo `2`.
A number divided by 2 which results in no remainder is even.
The condition within the if statement compares `remainder` with 0. When that condition is true the variable `evenOrOdd` is assigned the string value `even`; otherwise, the block within the else clause is executed and the variable `evenOrOdd` is assigned the string value `odd`.
Finally, a message with that determination is constructed using the concatenation operator (`+`) and is printed to the console.

<pre>
var num = randomNumber(0, 100);
var evenOrOdd;
var remainder = num % 2;
if (remainder === 0) {
  evenOrOdd = 'even';
} else {
  evenOrOdd = 'odd';
}

var message = num + ' is ' + evenOrOdd = '.';
console.log(message);
</pre>

[/example]
____________________________________________________

[syntax]

### Syntax
<pre>
if (condition) {
    statement1
} else {
    statement2
}
</pre>

[/syntax]

[tips]

### Tips
- Watch out for an accidental assignment statement in the if condition. A single equals (`=`) is an assignment operator.
Double (`==`) or triple (`===`) equals are comparison and identity operators respectively.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
