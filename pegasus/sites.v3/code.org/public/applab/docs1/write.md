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
Appends the specified HTML within a DIV element to the bottom of the document.
[/short_description]

[/description]

### Examples
____________________________________________________

[example]

** Display an Application Title **
Creates and displays a title at the top of your application.

<pre>
write("<H1>My Awesome Application</H1>");
// Followed by the rest of your application
</pre>

[/example]

____________________________________________________

[example]

**Ticker Tape Calculator**
Creates a simple ticker tape calculator.
<pre>

</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
write(html)
</pre>

[/syntax]


[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| html | string | yes | The HTML you want appended to the bottom of your application |
[/parameters]

[returns]

### Returns
No Return Value

[/returns]

[tips]

### Tips
The HTML added to the bottom of your page can execute code. Be careful adding HTML to the page that may contain content entered by your users.
[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
