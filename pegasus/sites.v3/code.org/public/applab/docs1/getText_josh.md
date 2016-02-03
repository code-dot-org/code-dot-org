---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getText_josh(id)

[/name]


[category]

Category: UI Controls

[/category]

[description]

[short_description]

Get the text from a specified element.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]



```
getText(button1);
```

[/example]

____________________________________________________

[example]

**Basic Example**

Pull the text from a specified button or radio button:


```
button("button12", "this here is a button");        // define a button
textLabel("label9", "Here's a label");              // define a text label
console.log(getText("button12"));                   // this will print "this here is a button"           
console.log(getText("label9"));                     // this will print "Here's a label"
```

[/example]

____________________________________________________

[example]

**Interactive Example**

Many websites have a registration page where users are asked to accept the terms of service by checking a checkbox.


```
checkbox("checkbox1", false);
textLabel("label1", "I accept the terms of service");

button("button1", "Register");                            // Create a "Register" button.

onEvent("button1", "click", function(){                   // Whenever the "Register" button is clicked ...

  var acceptedTermsOfService = getChecked("checkbox1");   // Get a boolean indicating whether the checkbox is checked or not.

  if(acceptedTermsOfService){                             // Based on the boolean, write a message to the screen.
    write("OK");
  } else {
    write("You must accept the terms of service");
  }
});
```


[/example]

____________________________________________________


[syntax]

### Syntax

```
getText(id);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | String | Yes | an element (such as a button or label or image name) with associated text that will return said text with getText(id).

[/parameters]

[returns]

### Returns
Returns a string value.

[/returns]

[tips]

### Tips

The checkbox can also be used in design mode.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
