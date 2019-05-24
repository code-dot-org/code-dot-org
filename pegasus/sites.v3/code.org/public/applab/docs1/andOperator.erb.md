---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## andOperator

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

A logical operator typically used with Boolean expressions. Returns true when both expressions are true and false otherwise.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code determines if it is currently working hours.


```
var now = new Date(); // get the current date and time
var hours = now.getHours(); // get the current hour
var workHours = false;
if (hours >= 9 && hours < 17) {
    workHours = true;  // set workHours to true if the current hour is between 9am and 5pm
}

console.log(workHours);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
expression1 && expression2
```

[/syntax]

[returns]

### Returns
Returns expression1 if it can be converted to false; otherwise, returns expression2.
When used with Boolean values, returns true if both expressions are true; otherwise, returns false.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
