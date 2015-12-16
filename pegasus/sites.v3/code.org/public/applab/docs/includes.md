---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## [string].includes(searchValue)

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Returns true if the *searchValue* string is found in the *string*, else returns false.

[/short_description]

In apps you sometimes need to check if one string is contained in another string; for example if a userid contains a space or not since spaces are not allowed. *includes()* returns a boolean true or false and is sometimes used similarly to a boolean expression in the condition of an if, if-else, or while statement. To call the *includes* function you need use a variable containing a string, followed by a dot ("."), followed by the function name "includes()" with a string argument or variable of what to search for.

[/description]

### Examples
____________________________________________________

[example]

```
// See if a sentence is a question or not.
var sentence="How old are you?";
console.log(sentence.includes("?"));
```

[/example]
____________________________________________________

[example]

**Example Original Gettysburg Address** Demonstrate that includes() is case sensitive.

```
// Demonstrate that includes is case sensitive.
var gettysburgAddress="Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.";
console.log(gettysburgAddress.includes("Four"));
console.log(gettysburgAddress.includes("four"));
```

[/example]
____________________________________________________
[example]

**Example Original Movie > Sequels** Check if a movie is a sequel or not.

```
// Check if a movie is a sequel or not.
textLabel("movieLabelID", "Favorite Movie: ");
textInput("movieInputID", "");
onEvent("movieInputID", "change", function(event) {
  if (getText("movieInputID").includes("2") || getText("movieInputID").includes("II")) {
    write("Sequels are never as good as the original.");
  } else {
    write("I like that one also.");
  }
});
```

[/example]
____________________________________________________
[syntax]

### Syntax

```
[string].includes(searchValue)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| string | string | Yes | The string to search. |
| searchValue | string | Yes | The string to search for. |

[/parameters]

[returns]

### Returns
Boolean true or false

[/returns]

[tips]

### Tips
- The search is a case-sensitive search. 

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
