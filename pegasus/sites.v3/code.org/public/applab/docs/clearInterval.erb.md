---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## clearInterval(interval)

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Clears an existing interval timer by passing in the numeric value returned by *setInterval()*.

[/short_description]

Some interval timers do not run forever, but need to be stopped at some time (maybe like a countdown, see the first example). *clearInterval()* uses the value returned by the [setInterval(function, milliseconds)](/applab/docs/setInterval) function.

[/description]

### Examples
____________________________________________________

[example]

```
var countdown = 10;
textLabel("countdown", countdown);
var i = setInterval(function() {
  countdown = countdown - 1;
  setText("countdown", countdown);
  if(countdown === 0) {
    clearInterval(i);
  }
}, 1000);
console.log("Interval timer ID: " + i);
```

[/example]

____________________________________________________

[example]

**Example: Stop the Presses!** Run a half second interval timer until a button is pressed.

```
// Run a half second interval timer until a button is pressed.
button("stop", "Stop the timer");
var i = setInterval(function() {
  write("Timer code ran!");
}, 500);
onEvent("stop", "click", function(){
  clearInterval(i);
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
clearInterval(interval);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| interval | number | Yes | The value returned by the setInterval function that you want clear.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- If you want to clear an interval you need to save the value returned by setInterval, var i = setInterval(callback, ms);

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
