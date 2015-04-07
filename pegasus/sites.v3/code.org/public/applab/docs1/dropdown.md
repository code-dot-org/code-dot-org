---
title: App Lab Docs
---

[name]

## dropDown(id, option1, option2, ..., optionX)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a dropDown list. A dropDown list is used to select from a list of options and can be referenced by the specified ID.
[/short_description]

[/description]

### Examples
____________________________________________________

[example]
**Choose a Month**
<pre>
// Create a list
textLabel("stateLabel","State ", "state");
dropDown("state","January","February","March","April","May","June","July","August","September","October","November","December");
onEvent("state", "change", function() {
  console.log(getText("state"));
});
</pre>

[/example]

____________________________________________________

[example]

**Color the Turtle**
<pre>

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
button("uniqueIdentifier",false, "GroupName")
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
All dropDown list should always have an associated textLabel.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
