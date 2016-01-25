---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Math.max(n1, n2, ..., nX)

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Returns the maximum value among one or more values n1, n2, ..., nX.

[/short_description]

Some apps need to know the maximum number from a collection of numbers or variables. You can call *Math.max* with zero, one or more parameters, depending on how many numbers you want to compare.

[/description]

### Examples
____________________________________________________

[example]

```
var a = Math.max(5,-2);
console.log(a);
var x=9;
var y=12;
var b = Math.max(x,y);
console.log(b);
```

[/example]

____________________________________________________

[example]

```
var a = Math.max(5, 0, 21.5, 13, -2);
console.log(a);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
Math.max(n1, n2,..., nX);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| n1, n2,..., nX | number | No | One or more numbers or variables to compare. |

[/parameters]

[returns]

### Returns
A number representing the highest of the values given as parameters, or -Infinity if no arguments are given, or NaN if one or more arguments are not numbers.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
