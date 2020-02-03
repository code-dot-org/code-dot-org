---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## onEvent(id, type, callback)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Executes the *callback* function code when a specific event *type* occurs for the specified UI element *id*.

[/short_description]

Interactive apps need both UI elements ([button()](/applab/docs/button), [textInput()](/applab/docs/textInput), [textLabel()](/applab/docs/textLabel), [dropDown()](/applab/docs/dropdown), [checkBox()](/applab/docs/checkbox), [radioButton()](/applab/docs/radioButton), [image()](/applab/docs/image)), and event handlers for those UI elements and each type of user interaction needed. The UI element, with unique id, must exist before the onEvent function can be used.

[/description]

### Examples
____________________________________________________

[example]

```
// Move the turtle forward on every click of the button.
button("forward", "Move Forward");
onEvent("forward", "click", function(event) {
  moveForward();
});
```

[/example]
____________________________________________________

[example]

**Example: Two Different Types** Move the turtle forward on each click or backward on each key press. 

```
// Move the turtle forward on each click or backward on each key press.
button("move", "Move");
onEvent("move", "click", function(event) {
  moveForward();
});
onEvent("move", "keypress", function(event) {
  moveBackward();
});
```

[/example]
____________________________________________________
[example]

**Example: Event Details** Show the details of the callback function *event* parameter.

```
// Show the details of the callback function event parameter.
button("data", "Show Me Event Details");
onEvent("data", "click", function(event) {
  console.log(JSON.stringify(event));
});
```

[/example]
____________________________________________________
[example]

**Example: Shrink and Grow** Grow an image on mouseover, back to normal size on mouseout.

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Grow an image on mouseover, back to normal size on mouseout.
image("logo", "https://code.org/images/logo.png");
setPosition("logo", 160, 240, 32, 32);

onEvent("logo", "mouseover", function(event){
  setSize("logo", 48, 48);
});

onEvent("logo", "mouseout", function(event){
  setSize("logo", 32, 32);
});
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/1d88a87cbc475a0c6cec4696d5b01e47-image-1446466358980.gif'>
</td>
</tr>
</table>

[/example]
____________________________________________________
[example]

**Example: Where do you want it?** Move an image to the coordinates specified in a textboxes. Note that we declare one function that we use as callback for two different event handlers.

```
// Move an image to the coordinates specified in a textboxes.
// Note that we declare one function that we use as callback for two different event handlers.
textLabel("xLabel", "X coordinate:");
textInput("xCoordinate", 160);
textLabel("yLabel", "Y coordinate:");
textInput("yCoordinate", 240);
image("logo", "https://code.org/images/logo.png");
setPosition("logo", 160, 240, 32, 32);

onEvent("xCoordinate", "change", moveFromText);
onEvent("yCoordinate", "change", moveFromText);

// Define a funtion that moves the image based on the text box values
function moveFromText() { 
  var x = getText("xCoordinate");
  var y = getText("yCoordinate");
  setPosition("logo", x, y);
}
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
onEvent(id, type, function(event) {
  // Code to execute
});
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI control to which this event handler applies. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _.  |
| type | string | Yes | The type of event to respond to. There are many events that can be used with an event handler to respond to all kinds of actions that a user can take. In block mode you can choose from a dropdown list of more than 10, but some of the most commonly used are shown below. |
| callback | function | Yes | The callback function executed in response to an event for the matching UI element *id* of the matching *type*. The function can be inline, or separately defined in your app and called from onEvent(). |


| Event Type  | Description                   |
|-------|-------------------------------|
| change | The specified element has been modified and enter has been pressed.  |
| click | The user clicked on the specified element.  |
| mouseover | The user moved the mouse cursor over the specified element. |
| keydown | The user pressed a keyboard key while the mouse was over the element.  |


[/parameters]

[returns]

### Returns
No return value, callback function executed.

[/returns]

[tips]

### Tips
- The UI element must be defined in your code before the matching onEvent() event handler.
- The callback function receives an event object as its parameter, which can be used to gain more information about the event. You can ignore the App Lab warning *event is defined but not called in your program*.
- The preferred placement in your code is screen elements at the top, event handlers in middle, other code/functions at end.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
