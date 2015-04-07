---
title: App Lab Docs
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
**Favorite Color**
Creates a list of colors to choose from.
<pre>
// Creates a list of color options
textLabel("RedLabel","Red","Red");
radioButton("Red", true, "Color");
textLabel("BlueLabel","Blue","Blue");
radioButton("Blue", false, "Color");
textLabel("GreenLabel","Green","Green");
radioButton("Green", false, "Color");
textLabel("OrangeLabel","Orange","Orange");
radioButton("Orange", false, "Color");
</pre>

[/example]

____________________________________________________
[example]
**Favorite Color**
In this example, we retrieve and display your favorite color.
<pre>
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
  displayFavorite("Orange");
});
</pre>

[/example]

____________________________________________________

[example]

**The Checked Item**
Determine which radio button within a group is checked.

<pre>
**Favorite Color**
In this example, we retrieve and display your favorite color when the "favorite" button is clicked.
<pre>
// Creates a list of color options
textLabel("RedLabel","Red","Red");
radioButton("Red", true, "Color");
textLabel("BlueLabel","Blue","Blue");
radioButton("Blue", false, "Color");
textLabel("GreenLabel","Green","Green");
radioButton("Green", false, "Color");
textLabel("OrangeLabel","Orange","Orange");
radioButton("Orange", false, "Color");
button("favorite","What's my favorite color?")

onEvent("favorite","click", function(event) {
    var radioIDs["Red","Blue","Green","Orange"],
         index = 0;
    while (index<radioIDs.length && getChecked(radioIDs[index])) {
      index++;
    }
    console.log("Your favorite color is: " + radioIDs[index])
})

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
radioButton(id,false,group)
</pre>

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

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
