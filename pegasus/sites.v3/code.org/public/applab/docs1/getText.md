---
title: App Lab Docs
---

[name]

## getText(id)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Gets the text value of the input control specified by the id. This returns the displayed value. For drop down lists, getText returns the currently selected option.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Count the clicks**
Every time the button is clicked, the value will increment.
<pre>
button("counter","1");
onEvent("counter", "click", function(event) {
  // Get the current value and convert it to a number
  var currentValue = parseInt(getText("counter"));
  // Increment and update the button's value
  setText("counter",currentValue+1);
});
</pre>

[/example]

____________________________________________________

[example]

**Choose a Month**
Demonstrates how to use getText with a dropdown list to retrieve the selected item.
<pre>
// Create a drop down for each month
textLabel("stateLabel","State ", "state");
dropdown("state","January","February","March","April","May","June","July","August","September","October","November","December");
// Log each time a new month is selected.
onEvent("state", "change", function() {
  console.log(getText("state"));
});
</pre>

[/example]

____________________________________________________
[syntax]

### Syntax
<pre>
getText(id)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | Retrieves the text value of the control with the specified id |
[/parameters]

[returns]

### Returns
The string text value of the specified control.

[/returns]

[tips]

### Tips
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
