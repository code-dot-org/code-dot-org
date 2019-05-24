---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Equality operator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Tests whether two values are equal.

[/short_description]

Your apps will sometimes need to check if the values in their code are equivalent or not, and then possibly perform some specific action using an *if*, *if-else*, or *while* block. *==* returns true if the value on the left-hand side of the operator is equal to the value on the right-hand side of the operator.

[/description]

### Examples
____________________________________________________

[example]

```
// Basic numeric equality check.
var x = 5;
var y = 4;
console.log(x == 5);
console.log(x == y);
```

[/example]

____________________________________________________

[example]

**Example: "Alan Turing" equals "ALAN TURING"?** Basic string equality check. Case matters for string comparison.

```
// Basic string equality check. Case matters for string comparison.
var x = "Alan Turing";
var y = "ALAN TURING";
console.log(x == "Alan Turing");
console.log(x == y);
```

[/example]

____________________________________________________

[example]

**Example: 5 equals "5"?** Numeric string to number conversion is automatic in App Lab.

```
// Numeric string to number conversion is automatic in App Lab.
var x = 5;
var y = "5";
if(x == y)
{
  console.log("equivalent")
}
else
{
  console.log("not equivalent")
}
```

[/example]

____________________________________________________
[example]

**Example: 5 equals "five"?** Word string to number conversion is not automatic in App Lab.

```
// Word string to number conversion is not automatic in App Lab.
var x = 5;
var y = "five";
if(x == y)
{
  console.log("equivalent")
}
else
{
  console.log("not equivalent")
}
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
___ == ___
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
- = is the assignment operator. == is the boolean check for equivalency operator.
- JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5").
- Comparison operators include < <= == > >= !=

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
