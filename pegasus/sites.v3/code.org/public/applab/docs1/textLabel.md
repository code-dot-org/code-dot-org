---
title: App Lab Docs
---

[name]

## textLabel(id, text, for)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Creates and displays a text label. The text label is used to display a description for the following input controls: radio buttons, check boxes, text inputs, and drop down lists. You associate a text label with the input control by specifying the input control's id in the for argument. You can also reference the input control by the specified id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
// Create a label for the text box
textLabel("YourNameLabel","Enter your name:", "YourName");
textInput("YourName","");
</pre>

[/example]

____________________________________________________

[example]

**Demonstrate a label for each of the input types**
<pre>
textLabel("textInputLabel","Text Input:", "textInputCtrl");
textInput("textInputCtrl","");
write("&lt;br>");
checkbox("checkBoxCtrl",false);
textLabel("checkBoxLabel","Ok?", "checkBoxCtrl");
write("&lt;br>");
textLabel("dropdownLabel","dropdown List ","dropdownCtrl");
dropdown("dropdownCtrl","Option 1","Option 2","Option 3");
write("&lt;br>");
radioButton("radioCtrl1","true","radioGroup");
textLabel("radioLabel1","Radio 1","radioCtrl1");
write("&lt;br>");
radioButton("radioCtrl2","false","radioGroup");
textLabel("radioLabel2","Radio 2","radioCtrl2");
write("&lt;br>");
radioButton("radioCtrl3","false","radioGroup");
textLabel("radioLabel3","Radio 3","radioCtrl3");
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
textLabel(id, text, for)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | yes | A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers. |
| text | string | yes | The value to display for the label. |
| for | string | yes | The id to associate the label with. Clicking the label is the same as clicking on the control. |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
You should always provide a label for your text input, radio button, check box, and drop down controls

The textLabel can also be used in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
