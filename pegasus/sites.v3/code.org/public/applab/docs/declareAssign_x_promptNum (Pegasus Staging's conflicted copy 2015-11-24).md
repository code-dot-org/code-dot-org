---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Prompt the user for a numerical value and store it

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Declares a variable and prompts the user for its initial numeric value.

[/short_description]

Many apps process numerical data. To be able to process data your apps need to keep track of the data in memory. Variables are simply names you use to refer to stored data in your apps. You can name your variables whatever you want so long as the name is not already used by the system. Variable names can not have spaces or special characters. In practice, it is helpful to name your variables in a way that describes the value they store. For instance, if the variable you create is to store a person's name you might name that variable personName.

To process data in our apps we need to assign values to memory locations we have previously named using var to declare a variable. The promptNum() function causes a pop-up window to display with the given message and the app waits for the user to type a number in and click OK. The variable getting the value always goes on the left hand side of the assignment operator =.

[/description]

### Examples
____________________________________________________

[example]

```
// Compliment the user's age.
var age = prompt("What's your age?");
console.log("You don't look a day over " + (age-5));
```

[/example]

____________________________________________________

[example]

**Example: Change Counter** Count the amount of change a user has.

```
// Count the amount of change a user has.
var quarters = promptNum("How many quarters do you have?");
var dimes = promptNum("How many dimes do you have?");
var nickels = promptNum("How many nickels do you have?");
var pennies = promptNum("How many pennies do you have?");
var total = quarters*25 + dimes*10 + nickels*5 + pennies*1;
write("You have " + total + " cents.");
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
var x = promptNum("Enter a value")
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| "Enter a value" | string | Yes | The string the user will see in the pop-up window when asked to enter a value. |

[/parameters]

[returns]

### Returns
No return value. Variable created in memory and numeric value assigned.

[/returns]

[tips]

### Tips
- The pop-up window only allows the user to enter a number. Use [prompt()](/applab/docs/declareAssign_x_prompt) if the user is allowed to enter non-numeric data.
- The block of code where you declare the variable defines the variable's scope. Scope refers to which blocks of code can access that variable by name. For instance, if you declare a variable inside a function, that variable name can only be accessed inside that function. Variables decalred at the top of your program are global and can be accessed anywhere in your program.
- Excessive use of promptNum() can get annoying, use this sparingly.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
