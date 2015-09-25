---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Call a function with parameters: myFunction(param0, param1, ... paramN)

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Calls a named function that takes one or more parameters.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares and invokes a function named `sayHello`. The function takes a single parameter named `name`, constructs a personal greeting using the name, and writes it to the console.


```
function sayHello(name) {
  var greeting = 'Hello, ' + name + '!';
  console.log(greeting);
}

sayHello('Bob'); // prints 'Hello, Bob' to the console
sayHello('Alice'); // prints 'Hello, Alice' to the console
```

[/example]
____________________________________________________

[example]

The following block of code declares and invokes a function named `computeCylinderArea`.
The function takes two parameters - `radius` and `height`.
The function uses the parameters to compute and return the area of a right cylinder.


```
function computeCylinderArea(radius, height) {
    var area = 2 * Math.PI * radius * height + 2 * Math.PI * Math.pow(radius, 2);
    return area;
}

var area = computeCylinderArea(5, 7); // computes the area of a cylinder with radius 5 and height 7
console.log(area.toFixed(2)); // prints the area (376.99) to the console.
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
var retval = callMyFunction_n(param0, param1, ... paramN);
```

[/syntax]

[returns]

### Returns
A function returns the value that follows the first executed return keyword within the function.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
