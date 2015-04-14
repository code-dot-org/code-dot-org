---
title: App Lab Docs
---

[name]

## clearInterval(interval)

[/name]


[category]

Category: Control

[/category]

[description]

[short_description]

Clear an existing interval timer by passing in the value returned by `setInterval`.

[/short_description]

**Note:** This function uses the value returned by the [setInterval(function, milliseconds)](/applab/docs/setInterval) function.

[/description]

### Examples
____________________________________________________

[example]

In this example, we display a countdown from 10 to 0, then stop the interval timer.
<pre>
var countdown = 10; //Initialize the countdown variable to 10
textLabel("countdown", countdown); //Display the value of the countdown in a text label
var i = setInterval(function() { //Save the interval timer value in variable i
  //When the code runs, update the value of the countdown
  countdown = countdown - 1;
  //Then update the display text
  setText("countdown", countdown);
  //If the countdown has arrived to 0, cancel the interval using variable i
  if(countdown === 0) {
    clearInterval(i);
  }
}, 1000); //Set the delay to 1000 milliseconds
console.log("Interval timer ID: " + i); //Print the timer ID to the console
</pre>

[/example]

____________________________________________________

[example]

In this example, we run an interval timer and provide a button that can be used to interrupt it.
<pre>
button("stop", "Stop the timer");
var i = setInterval(function() { //Save the interval timer value in variable i
  //Write text to the display to indicate that the timer code was executed
  write("Timer code ran!");
}, 1000); //Set the delay to 1000 milliseconds
onEvent("stop", "click", function(event){
  clearInterval(i); //Use variable i to cancel the interval timer  
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
clearInterval(interval);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| interval | number | Yes | The value returned by the setInterval function to clear.  |

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
