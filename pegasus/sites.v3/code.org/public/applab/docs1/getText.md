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

** Count the clicks **
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

[syntax]

### Syntax
<pre>
setText(id,text)
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
No Return Value

[/returns]

[tips]

### Tips
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
