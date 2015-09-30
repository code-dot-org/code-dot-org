---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Define a function with parameters: function someFunction(param0, param1, ..., paramN)

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Declares a named block of code that accepts one or more parameters, performs some computation on those parameters, and optionally returns a value.

See documentation for [functions with no parameters](http://code.org/applab/docs/functionParams_none) for notes on:

 * The difference between *defining* a function and _calling_ it
 * Where you should define functions in your code.

[/short_description]

[/description]

### Examples
____________________________________________________
[example]

**Turtle Example**

In this example we show how you can make a function with a parameter that is used to control how far the turtle moves.


```
square(25);
turnRight();
square(50);
turnRight()
square(75);

function square(sideLength){
	for(var i=0; i<4; i++){
		moveForward(sideLength);
		turnLeft();
	}
}
```

[/example]

[example]

**Turtle Example 2**

In this example we show how you can make a function with *two parameters* one for setting how much the turtle moves and the other for setting how many-sided shape you want to draw.  NOTICE: we have to do some


```
rectangle(75, 45);
turnRight();
rectangle(100, 50);
turnRight();
rectangle(25, 25);

function rectangle(width, height){
	for(var i=0; i<2; i++){
		moveForward(width);
		turnLeft();
		moveForward(height);
		turnLeft();
	}
}
```

[/example]

[example]

The following block of code declares and invokes a function named `computeCircleArea`. The function computes the area of a circle with the specified radius.


```
var area = computeCircleArea(10); // compute the area of a circle with the radius 10
console.log(area);

function computeCircleArea(radius) {
    return Math.PI * Math.pow(radius, 2);
}
```

[/example]

____________________________________________________

[example]

The following block of code declares and invokes a function named `computeTriangleArea`. The function computes the area of a triangle with the specified base length and height.


```
// compute the area of a triangle with base 10 and height 5.
var area = computeTriangleArea(10, 5);
console.log(area);


function computeTriangleArea(base, height) {
    return height * base / 2;
}
```


[/example]

____________________________________________________

[syntax]

### Syntax

```
function functionName(param0, param1, ..., paramN) {
    // function body
}
```

[/syntax]

[returns]

### Returns
A function returns the value that follows the first executed return keyword within the function.

[/returns]

### Tips
- The purpose of a function is to help you organize your code and to avoid writing the same code twice.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
