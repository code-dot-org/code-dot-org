---
title: App Lab Docs
---

[name]

## textInput(id, text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a text field for entering values.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
textInput("demo","Type Here"); // Create a text input with the initial value "Type Here"
</pre>

[/example]

____________________________________________________

[example]

**Interactive Turtle**
A textInput field is used to get input from your users.

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
| id | string | yes | A unique identifier for the text input. The id is used for referencing the created text input. For example, to assign event handlers. |
| text | string | yes | The initial value to display in the text input. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
You should associate a textLabel with your textInput to describe the purpose of the text field.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
