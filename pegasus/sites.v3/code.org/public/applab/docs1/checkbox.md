---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## checkbox(checkboxId, checked)

[/name]


[category]

Category: UI Controls

[/category]

[description]

[short_description]

Creates a checkbox with the specified `checkboxId`.
The initial state of the checkbox (checked/unchecked) is determined by the `checked` (true/false) parameter.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]


<pre>
checkbox("checkbox-1", true);
</pre>

[/example]

____________________________________________________

[example]

**Basic Example**

Getting the state of a checkbox:

<pre>
// Create a checked checkbox with id checkbox-1
checkbox("checkbox-1", true);

// isChecked will be assigned the boolean value true
var isChecked = getChecked("checkbox-1");
</pre>

[/example]

____________________________________________________

[example]

**Interactive Example**

Many websites have a registration page where users are asked to accept the terms of service by checking a checkbox.

<pre>
checkbox("checkbox-1", false);
textLabel("label-1", "I accept the terms of service");

button("button-1", "Register");

// Whenever the "Register" button is clicked ...
onEvent("button-1", "click", function(){

  // Get a boolean indicating whether the checkbox is checked or not.
  var acceptedTermsOfService = getChecked("checkbox-1");

  // Based on the boolean, write a message to the screen
  if(acceptedTermsOfService){
    write("OK");
  } else {
    write("You must accept the terms of service");
  }
});
</pre>


[/example]

____________________________________________________


[syntax]

### Syntax
<pre>
checkbox(checkboxId, checked);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| checkboxId | String | Yes | A unique identifier for the checkbox. The id is used for referencing the created checkbox. For example, getting the checkbox's state (checked/unchecked).  |
| checked | Boolean | No | Indicates the intial state (checked/unchecked) of the checkbox. Default value: `false`.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
