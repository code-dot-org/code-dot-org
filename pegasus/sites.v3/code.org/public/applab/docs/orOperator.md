---
title: App Lab Docs
---

[name]

## orOperator

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

A logical operator typically used with Boolean expressions. Returns true when either expression is true and false otherwise.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code determines if it is currently the weekend.

<pre>
var now = new Date(); // get the current date and time
var dayOfWeek = now.getDay(); // get the current day of the week
var isWeekend = false;
if (dayOfWeek === 0 || dayOfWeek === 6) {
    isWeekend = true;  // set isWeekend to true if the current day is sunday (0) or saturday (6)
}

console.log(isWeekend);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
expression1 || expression2
</pre>

[/syntax]

[returns]

### Returns
Returns expression1 if it can be converted to true; otherwise, returns expression2.
When used with Boolean values, returns true if either expressions is true; otherwise, returns false.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
