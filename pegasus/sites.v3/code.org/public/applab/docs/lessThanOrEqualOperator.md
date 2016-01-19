---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Less than or equal operator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Tests whether a value is less than or equal to another value.

[/short_description]

Your apps will sometimes need to check the relative size of two values, and then possibly perform some specific action using an *if*, *if-else*, or *while* block. < returns true if the value on the left-hand side of the opertor is less than or equal to the value on the right-hand side of the operator.

[/description]

### Examples
____________________________________________________

[example]

```
// Basic numeric less than or equal to check.
var x = 5;
var y = 4;
console.log(x <= 5);
console.log(x <= 6);
console.log(x <= y);
```

[/example]

____________________________________________________

[example]

**Example: Comparing "apples" the "Apples"** Basic string less than or equal to check. Case matters for string comparison.

```
// Basic string less than or equal to check. Case matters for string comparison.
var x = "apples";
var y = "Apples";
console.log(x <= "apples");
console.log(x <= "bananas");
console.log(x <= y);
```

[/example]

____________________________________________________


[syntax]

### Syntax

```
___ <= ___
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| ___ | any | Yes | The operands can be a number/string/boolean, or a variable containing a number/string/boolean, or the number/string/boolean returned by a function, or the number/string/boolean result of the evaluation of an expression. |

[/parameters]

[returns]

### Returns
Boolean true or false

[/returns]

[tips]

### Tips
- If you want to test if a value is less than, you can use the [<](/applab/docs/lessThenOperator) operator.
- JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5").
- When comparing two strings, JavaScript will compare them alphabetically based on character by character comparison left to right. All the upper case letters come before the lower case letters.
- Comparison operators include < <= == > >= !=

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
  