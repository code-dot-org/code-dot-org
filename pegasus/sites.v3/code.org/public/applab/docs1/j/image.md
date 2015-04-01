/* JEFF NOTES

Will also be able to be created in "Design mode" so docs should reference that

Design mode = button at bottom - under construction, allows drag and drop onto canvas
can edit properties of object using fields

*/


---
title: App Lab Docs
---

[name]

## image(id, url)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Create an image and assign it an element id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
image("id", "http://code.org/images/logo.png"); // Add an image to the canvas with an imageId of "id"
</pre>

[/example]

____________________________________________________

[example]

<pre>

</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
image(imageId, ImageURL);
</pre>

[/syntax]

[parameters]

### Parameters

<!-- TODO: Rephrase -->
| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageId | string | Yes | The html 'id' of the image.  |
| imageURL | string | Yes | The html 'src' of the image.  | 

[/parameters]

[returns]

### Returns
<!-- No return value. Outputs to the display only. -->
Returns boolean value true.

[/returns]

[tips]

<!-- TODO: Rephrase -->
### Tips
- Image URL may require the full http prefix. 
<pre>
image("id", "http://code.org/images/logo.png"); // image displayed
image("id", "code.org/images/logo.png"); // image not displayed
</pre>

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
