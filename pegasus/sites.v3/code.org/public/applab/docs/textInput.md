---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## textInput(id, text)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a text input box on the screen displaying the *text* provided and referenced by the given *id* at default location (0,0).

[/short_description]

Your apps will sometimes need to collect text input from the user. You can code an event handler that is triggered by various events in the textInput box. Use [getText()](/applab/docs/getText) to get the text currently in the textInput box.

[/description]

### Examples
____________________________________________________

[example]

```
// Acknowledge keystrokes.
textInput("id", "type here");
onEvent("id", "keypress", function(event) {
  console.log("You typed a letter.");
});
```

[/example]
____________________________________________________
[example]

**Example: Label for a Text Input Box** Create a label and associate it with a text input box.

```
// Create a label and associate it with a text input box.
textLabel("YourNameLabel","Enter your name:", "YourName");
textInput("YourName","");
```

[/example]
____________________________________________________
[example]

**Example Simple Form** Demonstrate UI element modification and query functions.

```
// Demonstrate UI element modification and query functions.
textInput("id", "Enter your name");
setPosition("id", 50, 200, 200, 50);
onEvent("id", "change", function(event) {
  hideElement("id");
  write("Hi " + getText("id"));
});
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
textInput(id, text)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The unique identifier for the text input box. The id is used for referencing the text input box in event handlers or other UI element modification functions. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| text | string | Yes | The text displayed within the text input box. |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- If there is another UI element at location (0,0) the text input box is placed at the next available position to the right or below.
- There are various UI element modification functions available: [setText()](/applab/docs/setText), [showElement()](/applab/docs/showElement), [hideElement()](/applab/docs/hideElement), [deleteElement()](/applab/docs/deleteElement), [setPosition()](/applab/docs/setPosition), [setSize()](/applab/docs/setSize). 
- There are various UI element query functions available: [getText()](/applab/docs/getText), [getXPosition()](/applab/docs/getXPosition), [getYPosition()](/applab/docs/getYPosition).
- You should always provide a label for your text input box.
- Text input boxes can also be created and initialized in Design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
	