---
title: App Lab Docs
---

[name]

## notOperator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

A unary negation operator typically used with a Boolean expression. Returns false if the expression can be converted to true; otherwise, returns true.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares a function `IsWorkingHours` that returns true between 9am and 5pm and false otherwise. The variable `timeOff` is assigned the result of invoking and negating the function.
A conditional is used to print an appropriate message to the console.

<pre>
function IsWorkingHours() {
    var now = new Date(); // get the current date and time
    var hours = now.getHours(); // get the current hour
    var workHours = false;
    if (hours >= 9 && hours < 17) {
        workHours = true;  // set workHours to true if the current hour is between 9am and 5pm
    }

    return workHours;
}

var timeOff = !IsWorkingHours();
if (timeOff) {
    console.log('take a break');
} else {
    console.log('get to work');
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
!expression
</pre>

[/syntax]

[returns]

### Returns
Returns true if the expression evaluates to false; returns false otherwise.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
