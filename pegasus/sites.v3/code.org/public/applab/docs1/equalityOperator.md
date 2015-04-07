---
title: App Lab Docs
---

[name]

## x == y

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Test whether two values are equal

[/short_description]

Returns true or false if the value on the left-hand side of the expression equals the value on the right-hand side of the expression.  Note that JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5").

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = 5;
if(x == 5)
{
  console.log("equivalent")
}
else
{
  console.log("not equivalent")
}

</pre>

[/example]

____________________________________________________

[example]

<pre>
var x = 5;
var trueOrFalse = (x==5)
console.log("Expression was " + trueOrFalse)
if(trueOrFalse)
{
  console.log("equivalent")
}
else
{
  console.log("not equivalent")
}

</pre>

[/example]

____________________________________________________
[example]

<pre>
var x = 5;
var y = 5;
if(x == y)
{
  console.log("equivalent")
}
else
{
  console.log("not equivalent")
}
</pre>

[/example]

____________________________________________________
[example]

<pre>
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
</pre>

[/example]

____________________________________________________
[example]

<pre>
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
- Don't accidentally use just one equals sign or you'll be doing assignment instead of equivalence checking!  Bad things can happen if you mix them up.


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
