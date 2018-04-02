---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Declare a variable

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Declares a variable with the given name.

[/short_description]

Many apps process data. To be able to process data your apps need to keep track of the data in memory. Variables are simply names you use to refer to stored data in your apps.  You can name your variables whatever you want so long as the name is not already used by the system.  Variable names can not have spaces or special characters.  In practice, it is helpful to name your variables in a way that describes the value they store.  For instance, if the variable you create is to store a person's name you might name that variable personName.

[/description]

### Examples
____________________________________________________

[example]

```
// Pioneering computer scientist.
var name;
var birthYear;
name = "Alan Turing";
birthYear = 1912;
console.log(name + " was born in the year " + birthYear);
```

[/example]

____________________________________________________

[example]

**Example: Count Sixes** Count the number of sixes rolled in 5 random die rolls.

```
// Count the number of sixes rolled in 5 random die rolls.
var counter;
counter=0;
if (randomNumber(1,6)==6) counter = counter + 1;
if (randomNumber(1,6)==6) counter = counter + 1;
if (randomNumber(1,6)==6) counter = counter + 1;
if (randomNumber(1,6)==6) counter = counter + 1;
if (randomNumber(1,6)==6) counter = counter + 1;
console.log("You threw " + counter + " sixes out of 5 throws of a die.");
```

[/example]

____________________________________________________

[example]

**Example: Simple Average** Average three tempertatures prompted from the user.

```
// Average three tempertatures prompted from the user.
var temperatureSum;
temperatureSum=0;
temperatureSum = temperatureSum + promptNum("Enter the first temperature");
temperatureSum = temperatureSum + promptNum("Enter the second temperature");
temperatureSum = temperatureSum + promptNum("Enter the third temperature");
console.log ("The average temperature is " + temperatureSum/3 );
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
var x;
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |

[/parameters]

[returns]

### Returns
No return value. Variable created in memory.

[/returns]

[tips]

### Tips
- If you do not assign a value to declared variable, the variable value is "undefined" or "null" and you can get unpredictable results.
- Variables can store numbers, strings, arrays or objects.
- The block of code where you declare the variable defines the variable's *scope*.  Scope refers to which blocks of code can access that variable by name.  For instance, if you declare a variable inside a function, that variable name can only be accessed inside that function. Variables decalred at the top of your program are *global* and can be accessed anywhere in your program.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
