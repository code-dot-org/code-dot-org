---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Divide operator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Divides two numbers.

[/short_description]

All programming languages support the basic arithmetic operations of addition, subtraction, multiplication and division of numbers.

[/description]

### Examples
____________________________________________________

[example]

```
// Divide two numbers.
console.log(3/5);
var x=3;
var y=5;
console.log(x/y);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
___ / ___
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| ___ | any | Yes | The operands can be a number, or a variable containing a number, or the number returned by a function, or the numeric result of the evaluation of an expression. |

[/parameters]

[returns]

### Returns
The quotient of two numbers.

[/returns]

[tips]

### Tips

- Operator precedence is the same as standard arithmetic - Expressions within a parentheses have the highest precedence, then multiplcation and division, then addition and subtraction.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
