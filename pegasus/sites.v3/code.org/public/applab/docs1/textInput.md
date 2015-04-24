---
title: App Lab Docs
---

[name]

## textInput(id, text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates a text field for entering values. The text argument specifies the initial value to be displayed. The textInput can be referenced by the given id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
// Display Label
textLabel("demoLabel", "Enter Value:", "demo");
textInput("demo","Type Here"); // Create a text input with the initial value "Type Here"
</pre>

[/example]

____________________________________________________

[example]

<pre>
textLabel("firstLabel", "First Name:", "first");
textInput("first","John");
textLabel("lastLabel", "Last Name:", "last");
textInput("last","Smith");
function outputName() {
  console.log(getText("first") + " " + getText("last"));
}
// Output the name to the console everytime it changes.
onEvent("first","change", function(event) {
  outputName();
})
onEvent("last","change", function(event) {
  outputName();
})
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
textInput(id, text)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the text input. The id is used for referencing the created text input. For example, to assign event handlers. |
| text | string | yes | The initial value to display in the text input. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
You should associate a textLabel with your textInput to describe the purpose of the text field.


The textInput can also be used in design mode.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
