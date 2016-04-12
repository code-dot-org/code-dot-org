---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## [string].length

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Returns the length of the string.

[/short_description]

When doing string parsing or manipulation you usually need to know how long a string is. *length* is actually not a function, but an attribute of a string object. You need to use a variable containing a string, followed by a dot ("."), followed by the attribute name *length*.

[/description]

### Examples
____________________________________________________

[example]

```
var word="supercalifragilisticexpialidocious";
console.log(word.length);
```

[/example]
____________________________________________________

[example]

**Example: First and Last** See if the first letter is the same as the last letter in a word.

```
// See if the first letter is the same as the last letter in a word.
var word="racecar";
var first=word.substring(0,1);
var last=word.substring(word.length-1,word.length);
console.log(first == last);
```

[/example]
____________________________________________________
[example]

**Example: Palindrome** Check if a word is a palindrome.

```
// Check if a word is a palindrome.
var word="racecar";
while(word.length>1 && word.substring(0,1)==word.substring(word.length-1,word.length)) {
  word=word.substring(1,word.length-1);
}
if(word.length==0 || word.length==1) console.log("palindrome");
else console.log("not palindrome");
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
[string].length
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| string | string | Yes | The string to find the length of. |

[/parameters]

[returns]

### Returns
The length of the string

[/returns]

[tips]

### Tips
- *length* is always >= 0

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
