---
title: App Lab Docs
---

[name]

## clearTimeout(timeout)

[/name]


[category]

Category: Control

[/category]

[description]

[short_description]

Clear an existing timer by passing in the value returned by `setTimeout`.

[/short_description]

**Note:** This function uses the value returned by the [setTimeout(function, milliseconds)](/applab/docs/setTimeout) function.

[/description]

### Examples
____________________________________________________

[example]

In this example, note how the timer is cancelled before the code has run: the text indicating that the timeout has completed does not get printed to the debugging console.
<pre>
var t = setTimeout(function() { //Save the timeout value in variable t
  console.log("The timeout has completed"); //When the code runs, print a message to the debugging console
}, 10000); //Set the delay to 10000 milliseconds
console.log("Timer ID: " + t); //Print the timer ID to the console
clearTimeout(t); //Use variable t to cancel the timeout
</pre>

[/example]

____________________________________________________

[example]

We can also use `clearTimeout` with this turtle example from the [setTimeout](http://staging.code.org/applab/docs1/setTimeout) page. Note how the turtle only moves once, instead of twice when the timeout is not cancelled.
<pre>
show(); //Display the turtle
moveForward(50); //Move the turtle 50 pixels
var t = setTimeout(function() { //Save the timeout value in variable t
  moveForward(100); //Move the turtle another 100 pixels after the timeout
}, 2000); //Set the delay to 2000 milliseconds
clearTimeout(t); //Use variable t to cancel the timeout
</pre>

[/example]

____________________________________________________

[example]

In this advanced example, we create UI controls to start and stop a timer. We use `onEvent` to react to clicks on the buttons.
<pre>
//Create a text label with instructions
textLabel("instructions", "Click Start to being the timer, then Stop to prevent it from completing");
//Create a text label to report status
textLabel("status", "");
//Create a button to start the timeout
button("startButton", "Start");
//Create a button to cancel the timeout
button("cancelButton", "Stop");
//Declare a variable to store the timeout return value
var t; //Note that t is declared outside of the two onEvent functions so that both can use it
//Start the timeout when the Start button is clicked
onEvent("startButton", "click", function(){
  t = setTimeout(function() { //Save the timeout value in variable t
    //If the timeout completes without being cancelled, update the status text
    setText("status", "The timer completed!");
   }, 10000); //Set the delay to 10000 milliseconds
   //Update the status text to indicate that the timeout has started
   setText("status", "Timer started!");
   console.log("Timer ID: " + t); //Print the timer ID to the console
});
//Cancel the timeout when the Cancel button is clicked
onEvent("cancelButton", "click", function(){
  if(t) { //Make sure that the variable t contains a timeout return value
    clearTimeout(t); //Use variable t to cancel the timeout
    setText("status", "The timer has been cancelled.");
  } else {
    setText("status", "You need to start the timer before you can stop it :)");
  }
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
clearTimeout(timeout);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| timeout | number | Yes | The value returned by the setTimeout function to cancel.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
