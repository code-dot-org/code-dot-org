---
title: App Lab Docs
---

[name]

## button(id, text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a button that you can click on.  

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

**Interactive Turtle**
A button is often used with a click event. The click event is where you write code to execute when the button is clicked.
In this example, we allow you to interact with the turtle. Each time you click the button, the turtle either changes direction or moves the specified number of pixels.

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
  moveForward(getText("moveAmount"))
});
onEvent("turnLeft", "click", function(event) {
  // Turn left 90 degrees
  turnLeft(90)
});
onEvent("turnRight", "click", function(event) {
  // Turn right 90 degress
  turnRight(90)
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
button("uniqueIdentifier","Text Label")
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers. |
| text | string | yes | The text displayed within the button. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
