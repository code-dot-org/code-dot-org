---
title: App Lab Docs
---

[name]

## write("html")

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]
Appends the specified HTML to the bottom of the document.
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
| id | string | yes | A unique identifier for the checkbox button. The id is used for referencing the radio button text input. For example, to assign event handlers. |
| options | string | yes | Whether the checkbox is initially checked. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
Be careful writing HTML in the page that may contain content inputted by your users.  The HTML can cause additional code to be executed.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
