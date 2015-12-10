---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Declare and assign a string to a variable

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Declares and assigns an initial string to a variable.

[/short_description]

Many apps process textual data. To be able to process string data your apps need to keep track of the strings in memory. Variables are simply names you use to refer to stored data in your apps. You can name your variables whatever you want so long as the name is not already used by the system. Variable names can not have spaces or special characters. In practice, it is helpful to name your variables in a way that describes the value they store. For instance, if the variable you create is to store a person's name you might name that variable personName.

To process data in our apps we need to assign values to memory locations we have previously named using var to declare a variable. Programmers read the statement 'state = "Illinois";' as 'state gets the string "Illinois"'. The variable getting the value always goes on the left hand side of the assignment operator =. The right hand side of the assignment operator can be a number or a string, or the number or string returned by a function, or the numeric or string result of the evaluation of an expression.

[/description]

### Examples
____________________________________________________

[example]


```
// Pioneering computer scientist.
var name = "Alan Turing";
var birthYear = 1912;
console.log(name + " was born in the year " + birthYear);
```

[/example]

____________________________________________________

[example]

**Example: Flip your name** Convert a name to Last, First format.

```
// Convert a name to Last, First.
var myName = prompt("Enter your first name and last name");
var blankIndex = myName.indexOf(' ');
var lastFirst = myName.substring(blankIndex,myName.length) + ", " + myName.substring(0, blankIndex);
console.log(lastFirst);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
var str = "___";
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| str | variable name | Yes | The name you will use in the program to reference the variable. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| "___" | anything | Yes | The right hand side of the assignment operator can be any string, or the string returned by a function, or the string result of the evaluation of an expression. |

[/parameters]

[returns]

### Returns
No return value. Variable created in memory and string value assigned.

[/returns]

[tips]

### Tips
- You don't strictly need to provide a variable with an initial value when you create it, but it is a good practice, because if you accidentally use a variable that has never been assigned a value you can get unpredictable results in your code.
- Variables can store numbers, strings, arrays or objects.
- The block of code where you declare the variable defines the variable's scope. Scope refers to which blocks of code can access that variable by name. For instance, if you declare a variable inside a function, that variable name can only be accessed inside that function. Variables decalred at the top of your program are global and can be accessed anywhere in your program.
- = is the assignment operator. == is the boolean check for equivalency operator.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
