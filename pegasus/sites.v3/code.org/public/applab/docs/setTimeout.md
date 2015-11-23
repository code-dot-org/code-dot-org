---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setTimeout(callback, ms)

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


```
setTimeout(function() {
  console.log("1000 milliseconds have elapsed"); //When the code runs, print a message to the debugging console
}, 1000); //Set the delay to 1000 milliseconds
```

[/example]

____________________________________________________

[example]

Here we use the timeout function to make the turtle pause between two moves.

```
show(); //Display the turtle
moveForward(50); //Move the turtle 50 pixels
setTimeout(function() {
  moveForward(100); //Move the turtle another 100 pixels after the timeout
}, 2000); //Set the delay to 2000 milliseconds
```

[/example]

____________________________________________________

[example]

In this variant from the previous example, we add an instruction to turn right after we start the timeout. Note how the turtle turns right before moving forward again. When using `setTimeout`, things don't always happen in the intuitive order.

```
show(); //Display the turtle
moveForward(50); //Move the turtle 50 pixels
setTimeout(function() {
  moveForward(100); //Move the turtle another 100 pixels after the timeout
}, 2000); //Set the delay to 2000 milliseconds
turnRight(90); //Make the turtle turn right
```

[/example]

____________________________________________________

[example]

In this more advanced example, we build a simple game where you must click a button as many times as possible in less than 10 seconds. We use `setTimeout` to hide the button after 10 seconds and end the game.

```
//Write text explaining the game rules
textLabel("instructions", "Click the button as many times as possible in 10 seconds");
//Create a button to click
button("gameButton", "Click me!");
//Create an empty text label where we will show the game results
textLabel("results", "");
//Create a variable to count the number of times the button is clicked
var counter = 0;
//Define the actions to do once 10 seconds have elapsed
setTimeout(function() {
  hideElement("gameButton"); //Hide the game button so it can no longer be clicked
  console.log("10000 milliseconds have elapsed"); //Print a message to the debugging console
}, 10000); //Set the timeout to 10000 milliseconds
//Define the actions to do when the button is clicked
onEvent("gameButton", "click", function(){
  counter = counter + 1; //Add 1 to the click counter variable
  setText("results", "You have clicked " + counter + " times."); //Display the current click counter
});
```


[/example]

____________________________________________________

[syntax]

### Syntax

```
setTimeout(callback, ms);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| callback | function | Yes | A function to execute.  |
| ms | number | Yes | The number of milliseconds to wait before executing the function.  |

[/parameters]

[returns]

### Returns
A number identifying the timer, which can be used to cancel the timer before it executes.

[/returns]

[tips]

### Tips
- Use the [clearTimeout(timeout)](/applab/docs/clearTimeout) function to cancel the execution of code scheduled using setTimeout().

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
