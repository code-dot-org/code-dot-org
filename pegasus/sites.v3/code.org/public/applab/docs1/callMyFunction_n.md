---
title: App Lab Docs
---

[name]

## callMyFunction_n(param0, param1, ... paramN)

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Invokes a named function that takes one or more parameters.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares and invokes a function named `sayHello`. The function takes a single parameter named `name`, constructs a personal greeting using the name, and writes it to the console.

<pre>
function sayHello(name) {
  var greeting = 'Hello, ' + name + '!';
  console.log(greeting);
}

sayHello('Bob');
</pre>

[/example]
____________________________________________________

[example]

<pre>
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
var retval = callMyFunction_n(param0, param1, ... paramN);
</pre>

[/syntax]

[returns]

### Returns
A function returns the value that follows the first executed return keyword within the function.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
