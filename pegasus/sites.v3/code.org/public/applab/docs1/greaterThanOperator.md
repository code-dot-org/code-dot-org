---
title: App Lab Docs
---

[name]

## x > y

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Test whether x is greater than y

[/short_description]

Returns true if the value on the left-hand side of the expression is strictly greater than the value on the right-hand side of the expression.  Note that JavaScript will automatically perform type conversion for you when comparing two values (e.g. the integer 5 will register as equivalent to the string "5"). When comparing two strings, JavaScript will compare them alphabetically based on the first character in the string.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = 5;
if(x > 3)
{
  console.log("bigger")
}
else
{
  console.log("not bigger")
}

</pre>

[/example]

____________________________________________________

[example]

<pre>
var x = 5;
if(x > 5)
{
  console.log("bigger")
}
else
{
  console.log("not bigger")
}

</pre>

[/example]

____________________________________________________
[example]

<pre>
var x = 5;
var y = 7;
if(x > y)
{
  console.log("bigger")
}
else
{
  console.log("not bigger")
}
</pre>

[/example]

____________________________________________________
[example]

<pre>
var x = "2";
var y = "12";
if(x > y)
{
  console.log("bigger")
}
else
{
  console.log("not bigger")
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
x > y
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
- If you want to test if a value is greater than OR equal, you can use the >= operator for comparison.
- Be careful when comparing strings as the precedence order for symbols and other characters may not be consistent dependent on language encoding.


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
