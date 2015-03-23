---
title: App Lab Docs
---

[name]

## setTimeout(function, milliseconds)

[/name]


[category]

Category: Control

[/category]

[description]

[short_description]

Set a timer and execute code when that number of milliseconds has elapsed.

[/short_description]

**Note:** This function returns a value that can be used with the [clearTimeout(timeout)](/applab/docs/clearTimeout) function.

[/description]

### Examples
____________________________________________________

[example]

<pre>
setTimeout(function() {
  console.log("1000 milliseconds have elapsed"); //When the code runs, print a message to the debugging console
}, 1000); //Set the delay to 1000 milliseconds
</pre>

[/example]

____________________________________________________


[example]

In this more advanced example, we build a simple game where you must click a button as many times as possible in less than 10 seconds. We use `setTimeout` to hide the button after 10 seconds and end the game.
<pre>
textLabel("instructions", "Click the button as many times as possible in 10 seconds");
button("gameButton", "Click me!"); //Create a button to click, then add a label for it
textLabel("results", ""); //Create an empty text label where we will show the game results
var counter = 0; //Create a variable to count the number of times the button is clicked
//Define the actions to do when 10 seconds have elapsed
setTimeout(function() {
  hideElement("gameButton"); //Hide the game button so it can no longer be clicked
  console.log("10000 milliseconds have elapsed"); //Print a message to the debugging console
}, 10000); //Set the delay to 10000 milliseconds
//Define the actions to do when the button is clicked
onEvent("gameButton", "click", function(){
  counter = counter + 1; //Add 1 to the click counter variable
  setText("results", "You have clicked " + counter + " times."); //Display the current click counter
});
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setTimeout(function, milliseconds);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| function | function | Yes | A function to execute.  |
| milliseconds | number | Yes | The number of milliseconds to wait before executing the function.  |

[/parameters]

[returns]

### Returns
A number identifying the timeout, which can be used to cancel the timeout before it executes.

[/returns]

[tips]

### Tips
Use the [clearTimeout(timeout)](/applab/docs/clearTimeout) function to cancel the execution of code scheduled using setTimeout().

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
