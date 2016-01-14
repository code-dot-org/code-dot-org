---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## [string].toLowerCase()

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Returns a new string that is the original *string* converted to all lower case letters.

[/short_description]

Sometimes in a text processing app you need to convert all the letters in a message to be the same case, all lower or all upper case. This can make it easier to match keywords your app is looking for to text input by the user, without having to worry about what case the letters are.

[/description]

### Examples
____________________________________________________

[example]

```
// Convert a string and variable containing a string to lower case.
console.log("Hello World".toLowerCase());
var computingPioneer="Ada Lovelace";
console.log(computingPioneer.toLowerCase());
```

[/example]
____________________________________________________

[example]

**Example Colors of Fruits** Demonstrate matching keywords to user input regardless of case.

```
// Demonstrate matching keywords to user input regardless of case.
textLabel("fruitLabel","Fruit Name");
textInput("fruitInput","");
onEvent("fruitInput", "change", function(event) {
  var fruit=getText("fruitInput");
  var fruitLower=fruit.toLowerCase();
  if (fruitLower == "apple") write(fruit + " is red");
  else if (fruitLower == "banana") write(fruit + " is yellow");
  else if (fruitLower == "orange") write(fruit + " is orange");
  else write("sorry I do not know ." + fruit);
});
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
[string].toLowerCase()
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| string | string | Yes | The string to copy and convert to all lower case. |

[/parameters]

[returns]

### Returns
A copy of the string converted to all lower case.

[/returns]

[tips]

### Tips
- [toUpperCase()](/applab/docs/toUpperCase) copies and converts a string to all upper case.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
