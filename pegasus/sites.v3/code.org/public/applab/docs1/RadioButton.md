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

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
// Create a choice between male or female
radioButton("Male",false, "MaleFemale");
radioButton("Female", true, "MaleFemale");
</pre>

[/example]

____________________________________________________

[example]

**The Checked Item**
Determine which radio button within a group is checked.

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
| id | string | yes | A unique identifier for the radio button. The id is used for referencing the radio button text input. For example, to assign event handlers. |
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
