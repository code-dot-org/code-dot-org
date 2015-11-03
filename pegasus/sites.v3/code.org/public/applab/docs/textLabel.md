---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## textLabel(labelId, text, *forId*)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Create a text label on the screen displaying the *text* provided and referenced by the given *labelId* at default location (0,0).

[/short_description]

Your apps will sometimes need titles on a screen, or words next to other UI elements like radio buttons, check boxes, text inputs, and dropdown lists. If you want the text label to also trigger the events with a different UI element, you can reference that id using the optional third parameter *forId*.

[/description]

### Examples
____________________________________________________

[example]


```
// Create a label for a screen title.
textLabel("screenTitle","My App");
```

[/example]
____________________________________________________
[example]

**Example: Label for a Test Input Box** Create a label and associate it with a text input box.

```
// Create a label and associate it with a text input box.
textLabel("YourNameLabel","Enter your name:", "YourName");
textInput("YourName","");
```

[/example]
____________________________________________________
[example]

**Example Demonstrate a label for each of the input types**

```
textLabel("textInputLabel","Text Input:", "textInputCtrl");
textInput("textInputCtrl","");
write("<br>");
checkbox("checkBoxCtrl",false);
textLabel("checkBoxLabel","Ok?", "checkBoxCtrl");
write("<br>");
textLabel("dropdownLabel","dropdown List ","dropdownCtrl");
dropdown("dropdownCtrl","Option 1","Option 2","Option 3");
write("<br>");
radioButton("radioCtrl1","true","radioGroup");
textLabel("radioLabel1","Radio 1","radioCtrl1");
write("<br>");
radioButton("radioCtrl2","false","radioGroup");
textLabel("radioLabel2","Radio 2","radioCtrl2");
write("<br>");
radioButton("radioCtrl3","false","radioGroup");
textLabel("radioLabel3","Radio 3","radioCtrl3");
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
textLabel(labelId, text, forId)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| labelId | string | Yes | The unique identifier for the text label. The labelId is used for referencing the text label in event handlers or other UI element modification functions. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| text | string | Yes | The text displayed within the text label. |
| forId | string | No | The id of the other UI element to associate the label with. |

[/parameters]

[returns]

### Returns
No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- If there is another UI element at location (0,0) the text label is placed at the next available position to the right or below.
- There are various UI element modification functions available: [setText()](/applab/docs/setText), [showElement()](/applab/docs/showElement), [hideElement()](/applab/docs/hideElement), [deleteElement()](/applab/docs/deleteElement), [setPosition()](/applab/docs/setPosition), [setSize()](/applab/docs/setSize). 
- There are various UI element query functions available: [getText()](/applab/docs/getText), [getXPosition()](/applab/docs/getXPosition), [getYPosition()](/applab/docs/getYPosition).
- You should always provide a label for your text input, radio button, check box, and drop down controls
- Text labels can also be created and initialized in Design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
	