---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Call a function with parameters

[/name]

[category]

Category: Functions

[/category]

[description]

[short_description]

Calls a user defined function that takes one or more parameters, and optionally generates a return value.

[/short_description]

When you **define** a function you give a name to a set of actions you want the computer to perform. When you **call** a function you are telling the computer to run (or execute) that set of actions. When you call a function with parameters you must match the order of parameters in the function definition.

A function definition can be provided anywhere in your code - in some ways the function definition lives independently of the code around it. It actually doesn't matter where you put a function definition. And you can call it from anywhere, either before or after the function definition. We will follow the convention of always putting function definitions at the bottom of our program, and the code for calling functions at the top of our program.

[/description]

### Examples
____________________________________________________

[example]

```
// Call a function to draw a circle of a given radius.
drawCircle(37);

function drawCircle(radius) {
  dot(radius);
  penColor("white");
  dot(radius-1);
  penColor("black");
}
```

[/example]
____________________________________________________

[example]

**Example: Circle using Two Dots** Call a function to draw a circle of a given radius and pen thickness in pixels.

```
// Call a function to draw a circle of a given radius and pen thickness in pixels..
drawCircle(37, 10);

function drawCircle(radius, thickness) {
  dot(radius);
  penColor("white");
  dot(radius-thickness);
  penColor("black");
}
```

[/example]
____________________________________________________
[example]

**Example: Cylinder Area** Call a function to calculate and return the surface area of a right cylinder given its radius and height.

```
// Call a function to calculate and return the surface area of a right cylinder given its radius and height.
var area = cylinderSurfaceArea(5, 7);
console.log(area);

function cylinderSurfaceArea(radius, height) {
  var topBottom = Math.PI * Math.pow(radius, 2);
  var sides = 2 * Math.PI * radius * height;
  return  2*topBottom + sides;
}

```

[/example]
____________________________________________________
[syntax]

### Syntax

```
myFunction(param1, ... paramN);  // No value returned.  
// OR
var returnValue = myFunction(param1, ... paramN);  // Value returned and saved.
```

[/syntax]

[parameters]

### Parameters
When calling a function the order of the parameters must match the function definition.

[/parameters]

[returns]

### Returns
If the function returns a value, you must assign the returned value to a variable or use the value as a parameter in another function call.

[/returns]

### Tips
- The purpose of a function is to help you organize your code and to avoid writing the same code twice.
- You can call a function within another function.
- A function that does not explicitly return a value returns the JavaScript value undefined.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
