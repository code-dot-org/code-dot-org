---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## radioButton(id, checked, group)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a radio button and assigns it to a group for choosing from a predefined set of options. Only one radio button in a group can be selected at a time.

Each radioButton can be referenced by the specified id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**List of Favorite Colors**
Creates a list of colors to choose from.


```
// Creates a list of color options
textLabel("RedLabel","Red","Red");
radioButton("Red", true, "Color");
textLabel("BlueLabel","Blue","Blue");
radioButton("Blue", false, "Color");
textLabel("GreenLabel","Green","Green");
radioButton("Green", false, "Color");
textLabel("OrangeLabel","Orange","Orange");
radioButton("Orange", false, "Color");
```

[/example]

____________________________________________________
[example]

**Radio button click events**
Retrieve and display your favorite color each time the radio button is clicked.


```
// Creates a list of color options
textLabel("RedLabel","Red","Red");
radioButton("Red", true, "Color");
textLabel("BlueLabel","Blue","Blue");
radioButton("Blue", false, "Color");
textLabel("GreenLabel","Green","Green");
radioButton("Green", false, "Color");
textLabel("OrangeLabel","Orange","Orange");
radioButton("Orange", false, "Color");
write("Your Favorite Color is: ");
textLabel("favorite","Red");
// Attach click event for each of the buttons
// When clicked, update the label to display the favorite color
onEvent("Red", "click", function(event) {
  setText("favorite","Red");
});
onEvent("Blue", "click", function(event) {
  setText("favorite","Blue");
});
onEvent("Green", "click", function(event) {
  setText("favorite","Green");
});
onEvent("Orange", "click", function(event) {
  setText("favorite","Orange");
});
```

[/example]

____________________________________________________

[example]

**Finding the Checked Item**
In this example, we iterate over the radio buttons in a group to determine which one is selected each time the favorite button is clicked.


```
// Creates a list of color options
textLabel("RedLabel","Red","Red");
radioButton("Red", true, "Color");
textLabel("BlueLabel","Blue","Blue");
radioButton("Blue", false, "Color");
textLabel("GreenLabel","Green","Green");
radioButton("Green", false, "Color");
textLabel("OrangeLabel","Orange","Orange");
radioButton("Orange", false, "Color");
// Create a button for logging the favorite color
button("favorite","What's my favorite color?");
// Click handler for the favorite button
onEvent("favorite","click", function(event) {
    // Array of radio button IDs
    var radioIDs = ["Red","Blue","Green","Orange"];
    var index = 0;
    // Loop through radio buttons until one is checked
    while (index < radioIDs.length && !getChecked(radioIDs[index])) {
      index++;
    }
    // Log the checked button
    console.log("Your favorite color is: " + radioIDs[index])
})
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
radioButton(id,false,group)
```

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers. |
| checked | boolean | yes | Whether the radio button is initially checked. |
| group | string | yes | The group that the radio button is associated with. Only one button in a group can be checked at a time. |
[/parameters]

[returns]

### Returns

No Return Value

[/returns]

[tips]

### Tips
All radio buttons should always have an associated textLabel. If you are asked a Yes/No question, consider using a checkbox element instead..

The radioButton can also be used in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
