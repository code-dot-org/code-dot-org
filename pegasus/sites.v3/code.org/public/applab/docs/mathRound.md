---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Math.round(x)

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Returns the number rounded to the nearest integer.

[/short_description]

Some apps need to know the round a number to the nearest integer. The tie-breaking rule for half-way numbers (ending in ".5") is to round them up to the next largest integer. 

[/description]

### Examples
____________________________________________________

[example]

```
var x = Math.round(15.2);
console.log(x);
var y = Math.round(23.5);
console.log(y);
var z = Math.round(-7.8);
console.log(z);
```

[/example]

____________________________________________________

[example]

**Floor** Write a functions that uses arithmetic and round() to round a number down to the next smallest integer.

```
// Write a functions that uses arithmetic and round() to round a number down to the next smallest integer.
function floor(n) {
  return Math.round(n-0.5);
}
console.log(floor(24.8));
console.log(floor(-23.5));
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
Math.round(x);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | An arbitrary number or vasriable.  |

[/parameters]

[returns]

### Returns
A number representing the integer nearest to x, or NaN if x is not a number or no parameter is provided.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
