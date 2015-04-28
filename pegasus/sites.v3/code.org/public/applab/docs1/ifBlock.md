---
title: App Lab Docs
---

[name]

## ifBlock

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Executes a block of statements if the specified condition is true.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code calculates a random number between `min` and `max` which are initialized to 0 and 100 respectively. The code block assigns the midpoint between these numbers to the variable `midpoint`.
The code block declares the variable `compareString` which is implicitly assigned the JavaScript value `undefined`.
Three conditional statements are executed to determine if the random number is equal to, less than, or greater than the midpoint. Finally, a message with that determination is printed to the console.

<pre>
var min = 0;
var max = 100;
var num = randomNumber(min, max);
var midpoint = Math.ceil(Math.abs(max-min)/2);
var compareString;
if (num === midpoint) {
    compareString = 'equal';
}

if (num < midpoint) {
    compareString = 'less';
}

if (num > midpoint) {
    compareString = 'greater';
}

var message = num + ' is ' + compareString + ' than ' + midpoint;
console.log(message);
</pre>

[/example]
____________________________________________________

[syntax]

### Syntax
<pre>
if (condition) {
    statement
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
