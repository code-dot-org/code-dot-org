---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Greater than operator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Tests whether a value is greater than another value.

[/short_description]

Your apps will sometimes need to check the relative size of two values, and then possibly perform some specific action using an *if*, *if-else*, or *while* block. < returns true if the value on the left-hand side of the opertor is strictly greater than the value on the right-hand side of the operator.

[/description]

### Examples
____________________________________________________

[example]

```
// Basic numeric greater than check.
var x = 5;
var y = 4;
console.log(x > 4);
console.log(x > y);
```

[/example]

____________________________________________________

[example]

**Example: Comparing "apples" the "Apples"** Basic string greater than check. Case matters for string comparison.

```
// Basic string equality check. Case matters for string comparison.
var x = "apples";
var y = "Apples";
console.log(x > "bananas");
console.log(x > y);
```

[/example]

____________________________________________________

[example]

**Example: 2 is greater than "12"?** Numeric string to number conversion is automatic in App Lab.

```
// Numeric string to number conversion is automatic in App Lab.
var x = 2;
var y = "12";
if(x > y)
{
  console.log("less");
}
else
{
  console.log("not less");
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
___ > ___
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
- If you want to test if a value is less than OR equal, you can use the [>=](/applab/docs/greaterThenOrEqualOperator) operator.
- JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5").
- When comparing two strings, JavaScript will compare them alphabetically based on character by character comparison left to right. All the upper case letters come before the lower case letters.
- Comparison operators include < <= == > >= !=

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
  