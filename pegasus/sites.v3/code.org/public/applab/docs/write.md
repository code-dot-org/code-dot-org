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

Displays a string and/or variable values to the app screen. The text can also be formatted as HTML.

[/short_description]

write() can be used as a debugging tool to help you understand what your code is doing. By displaying a message containing either descriptive text that tells you what is happening or the value of particular variables, you can follow along as your code executes. The user of your app will see the write() messages, so it can also be used to write large blocks of HTML formatted text to the screen instead of using textLabel().

[/description]

### Examples
____________________________________________________

[example]

```
// Let's you know your code is running.
write("It's Alive!");
```

[/example]

____________________________________________________

[example]

**Example: Message Board** Collect, count and display messages from friends.

```
// Collect, count and display messages from friends.
textLabel("myTextLabel", "Type a message and press press enter");
textInput("myTextInput", "");
var count = 1;
onEvent("myTextInput", "change", function(event) {
  var myText = getText("myTextInput");
  write("Message #" + count + ": " + myText);
  setText("myTextInput", "");
  count = count + 1;
});
```

[/example]

____________________________________________________

[example]

**Example: Ticker Tape Calculator** Creates a simple ticker tape calculator.

```
// Creates a simple ticker tape calculator.
var total = 0;
textInput("value","0");
write("<br>");
button("plus","+");
button("minus","-");
button("clear","clear");
write(total);
onEvent("plus","click", function(event) {
  total += parseFloat(getText("value"));
  write(total);
});
onEvent("minus","click", function(event) {
  total -= parseFloat(getText("value"));
  write(total);
});
onEvent("clear", "click", function(event) {
  total = 0;
  write(total);
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
write(text)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| text | string | Yes | The message string and/or variable values to display to the app screen. |

[/parameters]

[returns]

### Returns
No return value. Displays to the app screen only.

[/returns]

[tips]

### Tips

- You can use the string concatentation operator + to make long strings containing both words (enclosed in " "), variables (the current value will be displayed), and function return values.
- Remember that the + operator works differently for numbers than strings.  For instance write(5 + 3) will display "8" because the integers 5 and 3 will be added together then automatically converted to a string, but write("5" + "3") will simply concatenate the two strings to display "53".
- If you write() too many messages they will eventually scroll off the screen.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
