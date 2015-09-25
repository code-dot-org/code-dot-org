---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## write(text)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]
Appends the specified text to the bottom of the document. The text can also be formatted as HTML.
[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Display an Application Title**
Creates and displays a title at the top of your application.


```
write("My Awesome Application");
// Followed by the rest of your application
```

[/example]

____________________________________________________

[example]

**Ticker Tape Calculator**
Creates a simple ticker tape calculator.

```
textInput("value","0");
write("<br>");
button("plus","+");
button("minus","-");
button("clear","clear");
onEvent("plus");
var total = 0;
onEvent("plus","click", function(event) {
  total += parseFloat(getText("value"));
  write(total);
})
onEvent("minus","click", function(event) {
  total -= parseFloat(getText("value"));
  write(total);
})
onEvent("clear", "click", function(event) {
  total = 0;
  write(total);
})
write(total);
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
write(html)
```

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| text | string | yes | The text or HTML you want appended to the bottom of your application |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
The HTML can also include executable code so be careful adding any HTML to the page that may contain content entered by your users.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
