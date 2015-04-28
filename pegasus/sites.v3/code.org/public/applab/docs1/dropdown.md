---
title: App Lab Docs
---

[name]

## dropdown(id, option1, option2, ..., optionX)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a dropdown list. A dropdown list is used to select from a list of options and can be referenced by the specified ID.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]
**Choose a Month**
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
dropdown(id, option1, option2, ..., optionX)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the checkbox button. The id is used for referencing the dropdown control. For example, to assign event handlers. |
| option1,...,optionX | String | yes | The list of choices. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
All dropdown list usually as an associated textLabel.

The dropdown list can also be used in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
