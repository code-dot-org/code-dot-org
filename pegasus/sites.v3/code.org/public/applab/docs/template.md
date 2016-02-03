---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## functionsignature(requiredparam1, requiredparam2, *optionalparam3*)


[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

1 sentence (2 max) that describes what the function does. This should be mirrored in the tooltip in App Lab. Be pithy.

[/short_description]

Here goes a very student friendly longer description. Why is this useful? Wherever possible, provide context that matches the first time the student is exposed to this topic.
Look to the lesson plan and Code Studio levels for language and scenarios we're having students use this block. 

If you feel compelled to go on a long tangent about an important topic related to this function (examples
color, data service, conditionals, variables, etc.) feel free to make a separate file and link to it from
each API. 

Don't repeat work! If we have a video on a topic then link it in here rather than repeating the content. Interesting
external resources (like a color picker) can go here too.

[/description]

### Examples
____________________________________________________

<!--Each example needs to be fully standalone, copy/pasteable into App Lab without errors. Examples should
always strive to do something visible, such as turtle drawing or console.logging the value of something.
Each piece of documentation should have two examples, with a third or beyond being optional.
-->

[example]


```
//Example 1 goes here. Example 1 should ideally use just the API where possible, so as not to presume
knowledge about other functions. This example should be self-documenting and not need an intro. For APIs
that have optional parameters, create two bare bones examples, one without the optional param and one with.
```

[/example]

____________________________________________________

[example]

**Example: descriptive title** Helper/intro text that explains what the sample program is doing. This implies that the program
has a purpose that is moderately interesting. Contrast this with the first example which would be 
doing something like printing out the value of a variable for its own sake, which is not a real program.

Do this:

```
//Draw 2 eyes <-- this is a comment that helps you understand the intent of the code. It is also on its own line
dot(50);
moveTo(100,100);
dot(50);
```

Don't do this:


```
dot(50); //Make a dot of radius 50<--this comment is obvious/not helpful AND is inline, which copies poorly in App Lab
moveTo(100,100); //move to x:100, y:100 <-- this comment is equally not helpful AND is inline, which copies poorly in App Lab
dot(50);
	
/*
When a block comment is necessary (for example to describe a function) make a proper block comment.
Thoughts on comments: Don't comment extraneously if you think it can survive without a comment. This
will also make the example look more digestable.
*/
```

[/example]

____________________________________________________

[example]

**Example: descriptive title** Helper/intro text. Optional example that would be more complex. 

```
Code here	
```


[/example]

____________________________________________________


[syntax]

### Syntax

```
functionsignature(requiredparam1, requiredparam2, *optionalparam3*)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| param 1 | number/string/arrays/object | Yes/No | Short description (gets pulled into tooltips)  |


[/parameters]

[returns]

### Returns
English description: Returns the number/string/array/object that...

[/returns]

[tips]

### Tips

- bulleted list
- of related APIs/documentation (use relative urls) or information and where to find it.


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
