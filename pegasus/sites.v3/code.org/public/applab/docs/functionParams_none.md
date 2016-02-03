---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Define a function

[/name]

[category]

Category: Functions

[/category]

[description]

[short_description]

Gives a name to a set of actions you want the computer to perform, and optionally return a value.

[/short_description]

When you **define** a function you give a name to a set of actions you want the computer to perform. When you **call** a function you are telling the computer to run (or execute) that set of actions. 

A function definition can be provided *anywhere* in your code - in some ways the function definition lives independently of the code around it. It actually doesn't matter where you put a function definition. And you can call it from anywhere, either before or after the function definition.  We will follow the convention of always putting function definitions at the bottom of our program, and the code for calling functions at the top of our program.

[/description]

### Examples
____________________________________________________
[example]

```
// Call functions to draw a dotted line of two dashes.
dashSpace();
dashSpace();

function dashSpace(){ // Define a function to draw and dash and a space.
  penDown();
  moveForward();
  penUp();
  moveForward();
}
```
[/example]
____________________________________________________
[example]

**Example: Figure Eight** Call functions to draw a figure eight using two squares.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Call functions to draw a figure eight using two squares.
square();
turnLeft();
turnLeft();
square();

function square(){ // Define a function to draw a square using left turns.
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
	moveForward();
	turnLeft();
}
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/9632aa931889133f245df1a1b85408ab-image-1445612030986.gif'>
</td>
</tr>
</table>

[/example]
____________________________________________________
[example]

**Example: Flip a coin** Define a function that uses randomNumber(1) to randomly generate a one (heads) or zero (tails) and return the appropriate word.

```
// Call a function to flip a fair coin. Display the returned value on the console.
console.log(coinFlip());

function coinFlip() { // Define a function that uses randomNumber(1) to randomly generate a one (heads) or zero (tails) and return the appropriate word.
  if (randomNumber(1)==1) return "HEADS";
  else return "TAILS";
}
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
function myFunction() {
    // function body, including optional "return" command.
}
```

[/syntax]

[parameters]

### Parameters
function myFunction() does not take any parameters.

[/parameters]

[returns]

### Returns
Optional: A function can return a value by using the [return](/applab/docs/return) command.

[/returns]

### Tips
- The purpose of a function is to help you organize your code and to avoid writing the same code twice. You can you define a function once, and then call the function a number of times.
- A common error is defining a function but forgetting to call the function. A function does not automatically get executed.
- A function that does not explicitly return a value returns the JavaScript value undefined.

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
