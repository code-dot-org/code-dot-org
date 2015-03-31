---
title: App Lab Docs
---

[name]

## onEvent(id, type, function)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Execute code in response to an event for the specified element.

[/short_description]

**Note:** A UI control must exist before the onEvent function can be used.

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

[syntax]

### Syntax
<pre>
onEvent(id, type, function() {
  Code to execute
});
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI control to which this function applies.  |
| type | string | Yes | The type of event to respond to.  |
| function | function | Yes | A function to execute.  |

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
