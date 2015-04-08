---
title: App Lab Docs
---

[name]

## checkbox(id, checked)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a checkbox button. A checkbox is used to choose between two options and can be referenced by the specified id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
// Create a checkbox with a corresponding label
checkbox("Agree",false);
textLabel("IAgreeLabel","I Agree","Agree");
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
button(id, checked)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the checkbox button. The id is used for referencing the checkBox control. For example, to assign event handlers. |
| checked | boolean | yes | Whether the checkbox is initially checked. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
All checkbox buttons should always have an associated textLabel. If you have more than 2 choices, consider using a radioButton or dropdown list.

The radioButton can also be used in design mode.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
