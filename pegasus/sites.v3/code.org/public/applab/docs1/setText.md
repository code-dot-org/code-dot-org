---
title: App Lab Docs
---

[name]

## setText(id,text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]
Sets the text value of the input control specified by the id. For buttons, text inputs, and text label controls setting the text value changes the value being displayed.  For drop down lists, if the specified value is an option in the list, it will be selected (or it will be added to the end? - need to test)
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
| id | string | yes | The id of an existing input control you are referencing. |
| text | string | yes | The value to assign to the specified control.  |
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
