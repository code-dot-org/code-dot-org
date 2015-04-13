---
title: App Lab Docs
---

[name]

## x = 0

[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

Assigns a value to a variable.  

[/short_description]

**Note**: The variable must be declared using "var x" before it can be assigned another value.  Variables can be assigned to a static value or the result of a function or expression.

[/description]

### Examples
____________________________________________________

[example]

<pre>
var x = 0;
x = 5;
console.log("x has the value " + x)
</pre>

[/example]

____________________________________________________

[example]

<pre>
// simple Fibonacci
var x = 1;
var y = 1;
var z = 2;
console.log(x + " " + y + " " + z)

x = y + z;
y = z + x;
z = x + y;
console.log(x + " " + y + " " + z)

x = y + z;
y = z + x;
z = x + y;
console.log(x + " " + y + " " + z)
</pre>

[/example]

____________________________________________________

[example]

<pre>
textInput("myTextInput", "Hi")
button("myButton","Click Me")
onEvent("myButton", "click", function(event) {
  var myText;
  myText = getText("myTextInput");
  console.log(myText)
})
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
x = 5
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The variable name being assigned to  |
| value | any type | Yes | The value the variable is being assigned to.  |

[/parameters]

[returns]

### Returns
Usually you do not think of assignment returning a value, you simply think of it as completing the assignment of the variable to the value.  However, the expression technically does return the value that the variable was assigned to.
For instance the following code displays "Value is 4"
<pre>
var x = 1;
var y = 2*(x=2)
console.log("Value is " + y)
</pre>

[/returns]

[tips]

### Tips
- You can use the current value of a variable in the calculation of the new value of a variable.  
- Be careful in your if statements that you don't accidentally do an assignment.  if(x=1) is very different than if(x==1).  These bugs can be very hard to catch because if(x=1) is a valid statement, but isn't probably what you intended.
- In some programming languages, the return result of assignment is 'true' or 'false', so you can test if your assignment happened using an if statement.  That is not the case in Javascript.  
- If you're assigning a value to some complicated mathematical expression (say E = m*c*c) it can be helpful to add a comment letting the next developer know you're calculating the energy in the mass using Einstein's theory of relativity.
- Puzzler for you: what does the following code print...

<pre>
var x = 1
x = x + (x=3)
console.log(x)

x = 1
x = (x=3) + x
console.log(x)
// Neat isn't it!  
</pre>


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
