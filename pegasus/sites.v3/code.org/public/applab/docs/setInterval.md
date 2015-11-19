---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setInterval(callback, ms)

[/name]


[category]

Category: Control

[/category]

[description]

[short_description]

Execute code every time a certain number of milliseconds has elapsed, until canceled.

[/short_description]

**Note:** This function returns a value that can be used with the [clearInterval(interval)](/applab/docs/clearInterval) function.

[/description]

### Examples
____________________________________________________

[example]

Create a counter that increments by one every second.

```
var seconds = 0; //Initialize the seconds count to 0
setInterval(function() {
  seconds = seconds + 1; //Increment the seconds count
  //When the code runs, print the current seconds count to the debugging console
  console.log(seconds + " seconds have elapsed");
}, 1000); //Set the interval to 1000 milliseconds
```

[/example]

____________________________________________________

[example]

In this example, we use an interval functions to make the turtle move randomly.

```
show(); //Show the turtle
setInterval(function(){ //Start the interval timer
  //When the code runs, randomly select a point in a circle of radius 50
  var x = randomNumber(-50, 50);
  var y = randomNumber(-50, 50);
  //Print the results of the random calculation to the console
  console.log("Move " + x + " horizontally and " + y + " vertically.");
  move(x, y); //Move the turtle
}, 1000); //Set the interval to 1000 milliseconds
```


[/example]

____________________________________________________

[example]

Here we use the interval and timeout functions to make a text label blink.

```
textLabel("blinker", "This text blinks");
setInterval(function() { //Create an interval timer to show the blinker
  showElement("blinker"); //Show the blinker textLabel
  //Create a one-off timer to hide the blinker
  //A new timer will be created every time the interval timer runs
  setTimeout(function() {
    hideElement("blinker"); //Show the blinker textLabel
  }, 1000); //Set the timeout to 1000 milliseconds
}, 2000); //Set the interval to 2000 milliseconds
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
setInterval(callback, ms);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| callback | function | Yes | A function to execute.  |
| ms | number | Yes | The number of milliseconds between each execution of the function.  |

[/parameters]

[returns]

### Returns
A number identifying the interval timer, which can be used to cancel it when it is no longer needed.

[/returns]

[tips]

### Tips
- Use the [clearInterval(interval)](/applab/docs/clearInterval) function to no longer execute code scheduled using setInterval().

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
