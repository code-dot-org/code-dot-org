---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Assign a value to a variable

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Assigns a value to a previously declared variable.

[/short_description]

To process data in our apps we need to assign values to memory locations we have previously named using *var* to declare a variable. Programmers read the statement "area = length * width;" as "area gets length times width". The variable getting the value always goes on the left hand side of the assignment operator =. The right hand side of the assignment operator can be a number or a string, or the number or string returned by a function, or the numeric or string result of the evaluation of an expression.

[/description]

### Examples
____________________________________________________

[example]

```
// Declare, assign, and output the value of a variable.
var x;
x = 5;
console.log("x has the value " + x)
```

[/example]

____________________________________________________

[example]

**Example: Circumference and Area** Calculate the circumference and area of a circle with radius 10.

```
// Calculate the circumference and area of a circle with radius 10.
var radius, circumference, area;
radius = 10;
circumference = 2 * Math.PI * radius;
area = Math.PI * radius * radius;
console.log("Circle radius 10 has circumference of " + circumference + " and area of " + area);
```

[/example]

____________________________________________________

[example]

**Example: Fibonacci** Generate the first nine terms of the Fibonacci series.

```
// Generate the first 9 terms of the Fibonacci series.
var termA, termB, termC;
termA = 1;
termB = 1;
termC = termA + termB;
console.log(termA + " " + termB + " " + termC);
termA = termB + termC;
termB = termC + termA;
termC = termA + termB;
console.log(termA + " " + termB + " " + termC);
termA = termB + termC;
termB = termC + termA;
termC = termA + termB;
console.log(termA + " " + termB + " " + termC);
```

[/example]

____________________________________________________

[example]

**Example: Message Board** Collect, count and display messages from friends.

```
// Collect, count and display messages from friends.
textLabel("myTextLabel", "Type a message and press press enter");
textInput("myTextInput", "");
var count;
count=1;
onEvent("myTextInput", "change", function(event) {
  var myText;
  myText = getText("myTextInput");
  write("Message #" + count + ": " + myText);
  setText("myTextInput", "");
  count = count + 1;
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
x = ___;
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| ___ | any type | Yes | The right hand side of the assignment operator can be a number or a string, or the number or string returned by a function, or the numeric or string result of the evaluation of an expression. |

[/parameters]

[returns]

### Returns
No return value. Variable assigned value in memory.

[/returns]

[tips]

### Tips

- The variable must be declared using *var* before it can be assigned its initial value. 
- You can use the same variable on both the right hand side of the assignment operator = and the left hand side. This is sometimes used for a counter *count = count + 1;*
- = is the assignment operator. == is the boolean check for equivalency operator.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
