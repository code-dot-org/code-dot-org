---
title: App Lab Docs
---

[name]

## var x = prompt("Enter a value");

[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

Declares that the code will now use a variable named x and assign it an initial value provided by the user.

[/short_description]

Variables are simply names you use to refer to stored values in your code.  You can name your variables whatever you want so long as the name is not already used by the system.  Variable names can not have spaces or special characters.  In practice, it is helpful to name your variables in a way that describes the value they store.  For instance, if the variable you create is to store a person's name you might name that variable personName.

Where you declare the variable defines the variable's "scope".  Scope refers to which blocks of code can access that variable by name.  For instance, if you create a variable inside a function, that variable name can only be accessed inside that function.  

With this type of assignment, the user is prompted to enter a variable value in a pop up window.
[/description]

### Examples
____________________________________________________

[example]

<pre>
// Famous people
var firstName = prompt("What's your famous person's first name?")
var lastName = prompt("What's your famous person's last name?")
console.log("Hi " + firstName + " " + lastName)
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
var x = prompt("Enter value")
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable  |
| "Enter value" | string | Yes | The string the user will see in the pop up when asked to enter a value  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- Your code will be more readable if you give your variables easy to understand variable names.  On the other hand, the longer the variable name, the more you have to type.
- Don't hesitate to rename a variable if you decide you don't like the name, better to have it be an accurate name so that future programmers in that code know what it means.  Because of this, often when writing code, you'll end up wanting to rename a variable using search and replace.  If you name one variable "square" and another named "squareWidth", if you have to do a search and replace on "square" to name it "fancySquare", search and replace will also name squareWidth to "fancySquareWidth".  This is one reason some programmers hate using one letter variable names like "i" or "x".  
- Because the scope is defined in the place where the variable is created, it is important to be very careful where you create variables.  Most programmers like to create their variables at the top of a block of code (top of the file, top of a function, etc) so they are less likely to get moved around in later edits.  
- Prompting the user all the time with pop ups can get annoying, use this sparingly.


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
