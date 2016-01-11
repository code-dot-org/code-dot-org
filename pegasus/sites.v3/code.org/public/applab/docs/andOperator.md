---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## And operator

[/name]

[category]

Category: Math

[/category]

[description]

[short_description]

Returns true only when both expressions are true and false otherwise.

[/short_description]

More complex decisions sometimes require two things to be true. The *&&* operator allows you to check if both operand expressions are true, and then possibly perform some specific action using an *if*, *if-else*, or *while* block.

[/description]

### Examples
____________________________________________________

[example]

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Truth table for the boolean AND operator.
console.log(true && true);
console.log(true && false);
console.log(false && true);
console.log(false && false);
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/aca44404d74a4d2a377fa30e699bfac6-image-1450178464068.jpg'>
</td>
</tr>
</table>

[/example]

____________________________________________________

[example]

**Example: Take Your Temperature** Check for temperature in a good range or not.

```
// Check for temperature in a good range or not.
textLabel("tempLabelID", "What is your temperature?");
textInput("tempID", "");
button("buttonID", "Submit");
textLabel("tempMessageID", "");
onEvent("buttonID", "click", function(event) {
  setText("tempMessageID","");
  var temp = getText("tempID");
  if (temp >= 98 && temp <= 99.5) {
    setText("tempMessageID", "Your temperature is fine.");
  }
  else {
    setText("tempMessageID", "You may be sick.");
  }
});
```

[/example]
____________________________________________________

[example]

**Example: Working 9 to 5** Determines if it is currently working hours.

```
// Determines if it is currently working hours.
var now = new Date();
var hours = now.getHours(); 
var workHours = false;
if (hours >= 9 && hours < 17) {
    workHours = true;
}
console.log(workHours);
```

[/example]
____________________________________________________

[syntax]

### Syntax

```
expression1 && expression2
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| expression1 | boolean | Yes | The first boolean expression to evaluate. |
| expression2 | boolean | Yes | The second boolean expression to evaluate |

[/parameters]

[returns]

### Returns
Boolean true or false

[/returns]

[tips]

### Tips
- Some complex decisions using an && operator can sometimes be rewritten to use an || operator. It is fine to choose whichever reads clearest.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
