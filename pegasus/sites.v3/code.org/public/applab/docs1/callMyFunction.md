---
title: App Lab Docs
---

[name]

## callMyFunction()

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Invokes a named function that takes no parameters.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

The following block of code declares and invokes a function named `sayHello`. The function prints the message `Hello, coder!` to the console.

<pre>
function sayHello() {
  console.log('Hello, coder!');
}

sayHello();
</pre>

[/example]
____________________________________________________

[example]

The following block of code declares and invokes a function named `getFortune`. The function returns a random string from an Array of three strings.

<pre>
function getFortune() {
  // Declare an Array of strings
  var predictions = [
    "The future is uncertain.",
    "The future looks bright.",
    "The future includes cookies."
  ];

  /*
   * Compute a random number between 0 and 2 inclusive.
   * If you add or remove an element from the above Array,
   *   the following formula does not need to be modified.
   */
  var index = randomNumber(0, predictions.length-1);

  // return the string in the Array at the computed index
  return predictions[index];
}

// invoke the getFortune function 6 times,
//   after each invokation print the value returned by the function to the console.
for (var i = 0; i < 6; i++) {
  var fortune = getFortune();
  console.log(fortune);
}
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
var retval = callMyFunction();
</pre>

[/syntax]

[returns]

### Returns
A function returns the value that follows the first executed return keyword within the function.

[/returns]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
