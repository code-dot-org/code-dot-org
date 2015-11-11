---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Define a function with parameters

[/name]

[category]

Category: Functions

[/category]

[description]

[short_description]

Gives a name to a set of parameter driven actions you want the computer to perform, and optionally return a value.

[/short_description]

Some functions take parameter values as input to be able to abstract multiple different actions.

When you **define** a function you give a name to a set of actions you want the computer to perform. When you **call** a function you are telling the computer to run (or execute) that set of actions. 

A function definition can be provided *anywhere* in your code - in some ways the function definition lives independently of the code around it. It actually doesn't matter where you put a function definition. And you can call it from anywhere, either before or after the function definition.  We will follow the convention of always putting function definitions at the bottom of our program, and the code for calling functions at the top of our program.

[/description]

### Examples
____________________________________________________
[example]

```
// Draw a square of any size.
square(75);

function square(sideLength){
	moveForward(sideLength);
	turnLeft();
	moveForward(sideLength);
	turnLeft();
	moveForward(sideLength);
	turnLeft();
	moveForward(sideLength);
	turnLeft();
}
```

[/example]
____________________________________________________
[example]

**Example: Rectangle** Draw a rectangle with a function with *two parameters*, the length and width of the rectangle.

```
// Draw a rectangle with a function with *two parameters*, the length and width of the rectangle.
rectangle(75, 45);

function rectangle(width, height){
	moveForward(width);
	turnLeft();
	moveForward(height);
	turnLeft();
	moveForward(width);
	turnLeft();
	moveForward(height);
	turnLeft();
}
```

[/example]
____________________________________________________
[example]

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
function myFunction(param1, param2, ..., paramN) {
    // function body, including optional "return" command.
}
```

[/syntax]

[parameters]

### Parameters
function myFunction(param1, param2, ..., paramN) can use any number of parameters.

[/parameters]

[returns]

### Returns
Optional: A function can return a value by using the [return](/applab/docs/return) command.

[/returns]

### Tips
- The purpose of a function is to help you organize your code and to avoid writing the same code twice. You can you define a function once, and then call the function a number of times.
- The order of the parameters when calling a function must match the order of parameters in the function definition.
- A common error is defining a function but forgetting to call the function. A function does not automatically get executed.
- A function that does not explicitly return a value returns the JavaScript value undefined.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
