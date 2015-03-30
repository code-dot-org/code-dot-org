---
title: App Lab Docs
---

[name]

## getImageURL(id)

[/name]


[category]

Category: UI Controls

[/category]

[description]

[short_description]

Get the URL associated with an image element id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
image("id", "http://code.org/images/logo.png"); // Add an image to the canvas with an imageId of "id"
var imageURL = getImageURL("id"); // Get the imageURL for the imageID "id" and store it in the variable imageURL
console.log(imageURL); // Outputs "http://code.org/images/logo.png"
</pre>

[/example]

____________________________________________________

[example]

<pre>
image("id", "http://code.org/images/logo.png"); // Add image to canvas with imageID of "id"
<!-- TODO: CAN I USE THIS IMAGE? -->
image("id", "http://google.com/images/srpr/logo11w.png"); // Add second image to canvas with imageID of "id"
var imageURL = getImageURL("id"); // Get imageURL for images with imageID of "id"
console.log(imageURL); // Outputs "http://code.org/images/logo.png"
var imageURL2 = getImageURL("id");
console.log(imageURL2); // Outputs "http://code.org/images/logo.png"
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getImageURL(imageId);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageId | string | Yes | The html id for an image added to the canvas.  |

[/parameters]

[returns]

### Returns
Returns the first url string matching a given id.

[/returns]

[tips]

### Tips
- getImageURL("id") returns the first imageURL that matches the provided imageID.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
