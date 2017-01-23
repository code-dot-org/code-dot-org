---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## clearTimeout(timeout)

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Clears an existing timer by passing in the numeric value returned by setTimeout().

[/short_description]

Sometimes you need to clear a timeout timer before it executes. clearTimeout() uses the value returned by the [setTimeout(function, milliseconds)](/applab/docs/setTimeout) function.

[/description]

### Examples
____________________________________________________

[example]

```
// Timeout is cleared immediately.
var t = setTimeout(function() {
  console.log("The timeout has completed");
}, 10000);
console.log("Timer ID: " + t);
clearTimeout(t);
```

[/example]

____________________________________________________

[example]

**Example: Stop the Countdown** The user controls whether to clear the 3 second timeout timer.

```
// The user controls whether to clear the 3 second timeout timer.
textLabel("instructions", "Click Start to begin a 3 second timeout timer, then Stop to prevent it from completing");
textLabel("status", "");
button("startButton", "Start");
button("cancelButton", "Stop");
var t;
onEvent("startButton", "click", function(){
  t = setTimeout(function() {
    setText("status", "The timer completed!");
   }, 3000);
   setText("status", "Timer started!");
   console.log("Timer ID: " + t);
});
onEvent("cancelButton", "click", function(){
  if(t) {
    clearTimeout(t);
    setText("status", "The timer has been cancelled.");
  } else {
    setText("status", "You need to start the timer before you can stop it :)");
  }
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
clearTimeout(timeout);
```

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
- If you want to clear a timeout interval you need to save the value returned by setTimeout, var i = setTimeout(callback, ms);

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
