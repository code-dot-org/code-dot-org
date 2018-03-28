---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## return

[/name]

[category]

Category: Functions

[/category]

[description]

[short_description]

Returns a value from a function.

[/short_description]

When you **define** a function you give a name to a set of actions you want the computer to perform. When you **call** a function you are telling the computer to run (or execute) that set of actions. When that function is finished running, execution of the program returns to the point in the code where the function was called. When you use **return** you are able to specify a single value that will be "returned" to whatever code called the function in the first place. This is how your functions can generate output that other parts of your program can use.

[/description]

### Examples
____________________________________________________
[example]

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


**Example: Area of Circle** Calculate and return the area of a circle of a specified radius.

```
// Calculate and return the area of a circle of a specified radius.
var area = computeCircleArea(10);
console.log(area);

function computeCircleArea(radius) {
    return Math.PI * Math.pow(radius, 2);
}
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
return ___;
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| ___ | any | Yes | The return value can be a number, boolean or a string, or a variable containing a number, boolean or string, or the number, boolean or string returned by a function, or the numeric, boolean or string result of the evaluation of an expression. |

[/parameters]

[returns]

### Returns

The return value can be a number, boolean or a string.

[/returns]

### Tips
- If the function returns a value, you must assign the returned value to a variable or use the value as a parameter in another function call.
- The purpose of a function is to help you organize your code and to avoid writing the same code twice.
- You can call a function within another function.
- A function that does not explicitly return a value returns the JavaScript value undefined.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
