---
title: App Lab Docs
---

[name]

## Define a function: function someFunction()

[/name]


[category]

Category: Functions

[/category]

[description]

[short_description]

Declares a named block of code that performs some computation and optionally returns a value.

[/short_description]

**Note**: A function that does not explicitly return a value returns the JavaScript value undefined.

**The difference between *defining* a function and _calling_ it** ([copied from here]

You should think of a function definition as a way to give a name or label to a group of lines of code that you wish to execute at some point in your program.  The function definition itself doesn't run at all - it's merely a definition of what *should* happen.  The function will not execute until you "call" it from some other place in your program.   

**Where should you define functions in your code? -- a note about order**
A function definition can be provided *anywhere* in your code - in some ways the function definition lives independently of the code around it. It actually doesn't matter where you put them. And you can call it from anywhere, either before or after the function definition.  The following three code segments all do the same thing.  The function definition is trivial, but notice how it's called.

<table>
<tr>
<td width=33%><pre>
moveTwice();  
moveTwice();  
function moveTwice(){  
  moveForward();
  moveForward():
}    
</pre></td>
<td width=33%><pre>
moveTwice(); 
function moveTwice(){  
  moveForward();
  moveForward():
}    
moveTwice();</pre></td>
<td width=33%><pre>
function moveTwice(){  
  moveForward();
  moveForward():
}    
moveTwice();  
moveTwice();  
</pre></td></tr></table>



[/description]

### Examples
____________________________________________________
[example]

**Turtle Example**

In this example with turtles we show the main part of the program at the top.  It shows that you can provide the definition of the function, in this case the square() function, anywhere in the code regardless of where you "call it" or use it from.

<pre>
square();
turnRight();
square();

function square(){
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
[/example]

[example]

The following block of code declares and invokes a function named `sayFortune`. The function returns a simple message.

<pre>
function sayFortune() {
    return "Code wins";
}

var fortune = sayFortune();
console.log(fortune);
</pre>

[/example]

____________________________________________________

[example]

The following block of code declares and invokes a function named `getRandomNumbers`. The function computes five random numbers between zero and one hundred.

<pre>
function getRandomNumbers() {
    var count = 5; // declare how many random numbers to generate
    var nums = new Array(count); // create an empty Array to store the random numbers
    // use a loop to populate the Array with random numbers
    for (var i = 0; i < count; i++) {
        nums[i] = Math.round(Math.random()*100);
    }

    return nums;
}

var randoms = getRandomNumbers();
console.log(randoms);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
function functionName() {
    // function body
}
</pre>

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
