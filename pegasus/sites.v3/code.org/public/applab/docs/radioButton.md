---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## radioButton(id, checked, *group*)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a radio button on the screen with the initial *checked* boolean value and referenced by the given *id* at default location (0,0). Only one radio button in a group can be selected at a time.

[/short_description]

Some apps require the user to choose one item from a predefined group of options. Usually radio buttons are used for this. Any radio buttons without a group specified will be in the same default, unnamed group.

[/description]

### Examples
____________________________________________________

[example]

```
// Creates a list of color options in an unnamed group.
radioButton("RedButton", false);
textLabel("RedLabel","Red","RedButton");
radioButton("BlueButton", false);
textLabel("BlueLabel","Blue","BlueButton");
radioButton("GreenButton", false);
textLabel("GreenLabel","Green","GreenButton");
radioButton("OrangeButton", false);
textLabel("OrangeLabel","Orange","OrangeButton");
```

[/example]

____________________________________________________
[example]

**Example: Radio Button Click Events** Retrieve and display your favorite color, in a named group, each time a radio button is clicked.

```
// Retrieve and display your favorite color, in a named group, each time a radio button is clicked.
radioButton("RedButton", false,"ColorGroup");
textLabel("RedLabel","Red","RedButton");
radioButton("BlueButton", false,"ColorGroup");
textLabel("BlueLabel","Blue","BlueButton");
radioButton("GreenButton", false,"ColorGroup");
textLabel("GreenLabel","Green","GreenButton");
radioButton("OrangeButton", false,"ColorGroup");
textLabel("OrangeLabel","Orange","OrangeButton");

textLabel("favorite1","Your Favorite Color is: ");
textLabel("favorite2","");
onEvent("RedButton", "click", function() {
  setText("favorite2","Red");
});
onEvent("BlueButton", "click", function() {
  setText("favorite2","Blue");
});
onEvent("GreenButton", "click", function() {
  setText("favorite2","Green");
});
onEvent("OrangeButton", "click", function() {
  setText("favorite2","Orange");
});

```

[/example]

____________________________________________________

[example]

**Example: Finding the Checked Item** Iterate over the radio buttons in a group to determine which one is selected each time the favorite button is clicked.

```
// Iterate over the radio buttons in a group to determine which one is selected each time the favorite button is clicked.
radioButton("Red", false,"ColorGroup");
textLabel("RedLabel","Red","Red");
radioButton("Blue", false,"ColorGroup");
textLabel("BlueLabel","Blue","Blue");
radioButton("Green", false,"ColorGroup");
textLabel("GreenLabel","Green","Green");
radioButton("Orange", false,"ColorGroup");
textLabel("OrangeLabel","Orange","Orange");

button("favorite","What's my favorite color?");
onEvent("favorite","click", function() {
    var radioIDs = ["Red","Blue","Green","Orange"];
    var index = 0;
    while (index < radioIDs.length && !getChecked(radioIDs[index])) {
      index++;
    }
    console.log("Your favorite color is: " + radioIDs[index]);
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
radioButton(id, checked, group)
```

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The unique identifier for the screen element. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| checked | boolean | yes | Whether the radio button is initially checked. |
| group | string | no | The group that the radio button is associated with. Only one button in a group can be checked at a time. Any radio buttons without a group specified will be in the same default, unnamed group. |

[/parameters]

[returns]

### Returns

No return value. Modifies screen only.

[/returns]

[tips]

### Tips
- If there is another UI element at location (0,0) the radio button is placed at the next available position to the right or below.
- There are various UI element modification functions available: [setChecked()](/applab/docs/setChecked), [showElement()](/applab/docs/showElement), [hideElement()](/applab/docs/hideElement), [deleteElement()](/applab/docs/deleteElement), [setPosition()](/applab/docs/setPosition), [setSize()](/applab/docs/setSize). 
- There are various UI element query functions available: [getChecked()](/applab/docs/getChecked), [getXPosition()](/applab/docs/getXPosition), [getYPosition()](/applab/docs/getYPosition).
- Radio buttons usually have an associated textLabel.
- If you are asking the user something with a single response, consider using a single checkbox screen element instead.
- The radio button can also be created in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
