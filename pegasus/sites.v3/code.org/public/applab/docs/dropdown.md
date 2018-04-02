---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## dropdown(id, option1, *option2, ..., optionX*)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a dropdown selection box on the screen displaying the *options* provided and referenced by the given *id* at default location (0,0).

[/short_description]

Your apps will sometimes need to collect specific input from the user, instead of unrestricted input using [textInput()](/applab/docs/textInput). You can code an event handler that is triggered by various events in the dropdown box. Use [getText()](/applab/docs/getText) to get the option currently chosen in the dropdown.

[/description]

### Examples
____________________________________________________

[example]

```
// Get the user's mood.
dropdown("id", "happy", "sad");
onEvent("id", "change", function(event) {
  write(getText("id"));
});
```

[/example]

____________________________________________________
[example]

**Example Simple Form** Demonstrate UI element modification and query functions.

```
// Demonstrate UI element modification and query functions.
textLabel("yearLabel", "What is your year in school?");
dropdown("yearId", "Freshman", "Sophomore", "Junior", "Senior");
button("submitID", "Submit");
onEvent("submitID", "click", function(event) {
  console.log(getText("yearId"));
  setText("yearId", "Freshman");
});
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
dropdown(id, option1, option2)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The unique identifier for the dropdown box. The id is used for referencing the text input box in event handlers or other UI element modification functions. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| option1| string | Yes | The text displayed within the dropdown box. |
| option2| string | No | The text displayed within the dropdown box. |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- If there is another UI element at location (0,0) the dropdown box is placed at the next available position to the right or below.
- There are various UI element modification functions available: [setText()](/applab/docs/setText), [showElement()](/applab/docs/showElement), [hideElement()](/applab/docs/hideElement), [deleteElement()](/applab/docs/deleteElement), [setPosition()](/applab/docs/setPosition), [setSize()](/applab/docs/setSize). 
- There are various UI element query functions available: [getText()](/applab/docs/getText), [getXPosition()](/applab/docs/getXPosition), [getYPosition()](/applab/docs/getYPosition).
- You should always provide a label for your dropdown box.
- Dropdown boxes can also be created and initialized in Design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
