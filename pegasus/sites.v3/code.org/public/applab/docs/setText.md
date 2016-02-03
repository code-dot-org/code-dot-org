---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setText(id, text)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Sets the text for the specified screen element.

[/short_description]

Your apps will sometimes need to change, or clear, the words displayed on screen elements. setText() can be used to update the text on a button, textInput, textLabel, or textArea.

[/description]

### Examples
____________________________________________________

[example]

```
// Create a label for a screen title.
textLabel("screenTitle","");
setText("screenTitle","My App");
```

[/example]
____________________________________________________
[example]

**Example: Click Counter** Update the number on a button with every click.

```
// Update the number on a button with every click
var count=0;
button("clickCounter","0");
onEvent("clickCounter", "click", function(event) {
  count=count+1;
  setText("clickCounter", count);
});
```

[/example]
____________________________________________________
[example]

**Example Random Thoughts** Demonstrate reading and then clearing a textInput box.

```
// Demonstrate reading and then clearing a textInput box.
textInput("yourThought","");
onEvent("yourThought", "change", function(event) {
  write(getText("yourThought"));
  setText("yourThought","");
});
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
setText(id, text)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The unique identifier for the screen element. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| text | string | Yes | The text displayed within the screen element. |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- To clear the text on a screen element set the text to be "". Make sure you [getText()](/applab/docs/getText) first if you need to save the data from a [textInput()](/applab/docs/textInput) to a variable.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
