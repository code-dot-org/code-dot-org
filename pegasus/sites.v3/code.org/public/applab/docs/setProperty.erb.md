---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setProperty(id, property, value)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Sets a property to a new value for the specified element.

[/short_description]

You will generally want to define properties of UI elements using Design mode in App Lab.  But sometimes you will want to change the value of a property in your app based on the user or in response to an event.  *setProperty()* lets your app change any property listed in Design mode for a given UI element.   

[/description]

### Examples
____________________________________________________

[example]

```
// Change button color and font size
button("myButton", "Click me!");
setProperty("myButton", "background-color", "red");
setProperty("myButton", "font-size", 20);
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
setProperty(id, property, value);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI element to which this function applies. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| property | string | Yes | The property to change. |
| value| string, number, or boolean | Yes | The new value to set the property to.  The type will depend on which property you are trying to set. |

### Possible Properties

| Property  | Value | Works on| 
|-----------------|------|-----------|
| "width" | number | All Design mode elements except screens |
| "height" | number | All design mode elements except screens |
| "x" | number | All design mode elements except screens |
| "y" | number | All design mode elements except screens |
| "text-color" | color string | Button, text input, label, dropdown, and text area |
| "background-color" | color string | Button, text input, label, dropdown, screen, and text area |
| "font-size" | number|  Button, text input, label, dropdown, and text area |
| "text-align" | string ("left", "right", "center", or "justify") | Button, label, text area |
| "hidden" | boolean | All design mode elements except screens |
| "text" | string  | Button, label, text area |
| "placeholder" | string | Text input |
| "image" | string  | Button, image |
| "group-id" | string  | Radio button |
| "checked" | boolean  | Radio button, checkbox |
| "readonly" | boolean  | Text area |
| "options" | list of values | Dropdown |
| "value" | number | Slider |
| "min" | number | Slider |
| "max" | number | Slider |
| "step" | number | Slider |


[/parameters]

[returns]

### Returns
No return value. Modifies display only.

[/returns]

[tips]

### Tips

- If you select a UI element that was created in Design mode, the dropdown for property will filter to just the possible set of properties that can be set for the UI element.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
