---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getTime()

[/name]

[category]

Category: Control

[/category]

[description]

[short_description]

Gets the number of milliseconds elapsed since January 1, 1970.

[/short_description]

Time on a computer is calculated from the number of milliseconds elapsed since January 1, 1970. Every computer has a counter that is counting these milliseconds. You can use *getTime()* to calculate the elapsed time between two events.

[/description]

### Examples
____________________________________________________

[example]

```
console.log(getTime());
```

[/example]
____________________________________________________

[example]

**How Fast?** Calculate how long it takes to execute two statements. Use the speed slider in the Debug Console to slow dowen execution.

```
// Calculate how long it takes to execute two statements. Use the speed slider in the Debug Console to slow dowen execution.
var start=getTime();
var stop=getTime();
console.log(stop-start);
```

[/example]

____________________________________________________

[example]

**Five Clicks** Calculate the elapsed time for 5 clicks.

```
// Calculate the elapsed time for 5 clicks.
var start=0;
var stop=0;
textLabel("instructions", "Click the button five times as fast as you can");
button("gameButton", "Click me!");
textLabel("results", "");
var count = 0;
onEvent("gameButton", "click", function(){
  if (count==0) start=getTime();
  count = count + 1;
  if (count==5) {
    stop=getTime();
    setText("results", "You clicked 5 times in " + (stop-start) + " milliseconds.");
  }
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
getTime();
```

[/syntax]

[parameters]

### Parameters

getTime() does not take any parameters.

[/parameters]

[returns]

### Returns
Returns the number of milliseconds elapsed since January 1, 1970.

[/returns]

[tips]

### Tips
- It is difficult to calculate today's date from *getTime()*. See the full javascript *Date()* class instead.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
