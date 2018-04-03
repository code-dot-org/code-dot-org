---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## textLabel(id, text, *forId*)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a text label on the screen displaying the *text* provided and referenced by the given *id* at default location (0,0).

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

**Example: Label for a Text Input Box** Create a label and associate it with a text input box.

```
// Create a label and associate it with a text input box.
textLabel("YourNameLabel","Enter your name:", "YourName");
textInput("YourName","");
```

[/example]
____________________________________________________
[example]

**Example Opinion Survey** Demonstrate a label for each of the user input screen elements. No event handlers have been defined yet.

```
// Demonstrate a label for each of the user input screen elements. No event handlers have been defined yet.
textLabel("textInputLabel","Name:", "textInputName");
textInput("textInputName","");
write("<br>");
textLabel("dropdownLabel","Year In School","dropdownYear");
dropdown("dropdownYear","Freshman","Sophomore","Junior","Senior");
write("<br>");
textLabel("radioTitleLabel", "Gender");
radioButton("radioFemale","false","genderGroup");
textLabel("radioFemaleLabel","Female","radioFemale");
radioButton("radioMale","false","genderGroup");
textLabel("radioMaleLabel","Male","radioMale");
write("<br>");
textLabel("checkBoxLabel","Excited about programming?", "checkBoxProgramming");
checkbox("checkBoxProgramming",false);
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
textLabel(id, text, forId)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The unique identifier for the text label. The id is used for referencing the text label in event handlers or other UI element modification functions. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
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
	