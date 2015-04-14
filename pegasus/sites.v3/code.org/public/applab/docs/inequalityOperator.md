---
title: App Lab Docs
---

[name]

## Inequality operator: x != y

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Tests whether two values are not equal

[/short_description]

Returns true if the value on the left-hand side of the expression does not equal the value on the right-hand side of the expression.  Note that JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5").

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = 5;
if(x != 7)
{
  console.log("not equivalent")
}
else
{
  console.log("equivalent")
}

</pre>

[/example]

____________________________________________________

[example]

<pre>
var x = 5;
var trueOrFalse = (x!=7)
console.log("Expression was " + trueOrFalse)
if(trueOrFalse)
{
  console.log("not equivalent")
}
else
{
  console.log("equivalent")
}

</pre>

[/example]

____________________________________________________
[example]

<pre>
var x = 5;
var y = 7;
if(x != y)
{
  console.log("not equivalent")
}
else
{
  console.log("equivalent")
}
</pre>

[/example]

____________________________________________________
[example]

<pre>
var x = 5;
var y = "7";
if(x != y)
{
  console.log("not equivalent")
}
else
{
  console.log("equivalent")
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
x == y
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | any | Yes | The first value to use for comparison.  |
| y | any | Yes | The second value to use for comparison.  |

[/parameters]

[returns]

### Returns
True or false.

[/returns]

[tips]

### Tips
- In general, it is easier to think about equivalence testing than not equivalent testing.  Some programmers therefore prefer to avoid negative logic  and structure around equivalence tests and then use the else clause of the if statement to handle when the values aren't equivalent.  


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
