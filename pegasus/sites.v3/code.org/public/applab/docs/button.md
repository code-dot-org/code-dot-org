---
title: App Lab Docs
---

[name]

## button(buttonId, text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a button that you can click on. The button will display the text provided and can be referenced by the given id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
button("demo","Click Me!"); // Create a button "Click Me"
</pre>

[/example]

____________________________________________________

[example]

**Simple Turtle**
A button is often used with a click event. The click event is where you write code to execute when the button is clicked.
In this example, every time you click the button the turtle will move forward 10 pixels.

<pre>
// Buttons
button("move10", "Move Forward 10"); // Go 10 pixels when clicked

// Attach click event for each of the buttons
onEvent("move10", "click", function(event) {
  // Move forward 10 pixels
  moveForward(10);
});
</pre>

[/example]
____________________________________________________


[example]

**Interactive Turtle**
In this example, we provide a more interactive turtle. Each time you click the button, the turtle either changes direction or moves the specified number of pixels.

<pre>
// Display Label
textLabel("moveAmountLabel", "How Much?", "moveAmount");
// User-specified number of pixels to move
textInput("moveAmount", "10");
// Buttons
button("move", "Go");              // Go when clicked
button("turnLeft", "Turn Left");   // Turn left when clicked
button("turnRight", "Turn Right"); // Turn right when clicked

// Attach click event for each of the buttons
onEvent("move", "click", function(event) {
  // Move forward specified pixels
  moveForward(getText("moveAmount"));
});
onEvent("turnLeft", "click", function(event) {
  // Turn left 90 degrees
  turnLeft(90);
});
onEvent("turnRight", "click", function(event) {
  // Turn right 90 degrees
  turnRight(90);
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
button(buttonId,text)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| buttonId | string | yes | A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers. |
| text | string | yes | The text displayed within the button. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
The button can also be used in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
