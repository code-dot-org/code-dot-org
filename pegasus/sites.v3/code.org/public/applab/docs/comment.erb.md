---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## // Comment

[/name]

[category]

Category: Functions

[/category]

[description]

[short_description]

Writes a decription of some code.

[/short_description]

// Comments are used document your code so it is easier for humans to understand. You should include a comment at the start of each function to explain what the function does, if it takes any arguments, and if it returns any values. It is also a good idea to comment any complex blocks of code so you, or another programmer, can more easily maintain or modify the code in the future.

[/description]

### Examples
____________________________________________________

[example]

```
// Let's you know your code is running.
console.log("It's Alive!");
```

[/example]

____________________________________________________

[example]

**Example: Roll Two Die** Call functions that use randomNumber(1,6) to simulate rolling two die and summing the results.

```
// Call functions to generate two die rolls and sum the result. Display the value on the console.
console.log(rollDie() + rollDie());

function rollDie() { 
// Define a function that uses randomNumber(1,6) to randomly generate a die roll, 1 to 6, and return the value.
  var roll = randomNumber(1,6);
  return roll;
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
// Comment
```

[/syntax]

[parameters]

### Parameters
You can type whatever you want on a comment line.

[/parameters]

[returns]

### Returns
Comments are ignored by the computer.

[/returns]

[tips]

### Tips

- You can comment out a block of statements using /* before the first statement and */ after the last statement.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
