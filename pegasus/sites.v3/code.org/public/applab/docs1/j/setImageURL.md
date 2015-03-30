only takes URL right now

---
title: App Lab Docs
---

[name]

## setImageURL(id, url)

[/name]


[category]

Category: UI Controls

[/category]

[description]

[short_description]

Set the URL for the specified image element id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

<pre>
image("id", "http://code.org/images/logo.png"); // Add image
setImageURL("id", "http://google.com/images/srpr/logo11w.png"); // returns true
</pre>

[/example]

____________________________________________________

[example]

<pre>
image("id", "http://code.org/images/logo.png");
setImageURL("wrong_id", "http://google.com/images/srpr/logo11w.png"); // returns false
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
rect(x, y, width, height);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x position in pixels of the upper left corner of the rectangle.  |
| y | number | Yes | The y position in pixels of the upper left corner of the rectangle.  |
| width | number | Yes | The horizontal width in pixels of the rectangle.  |
| height | number | Yes | The vertical height in pixels of the rectangle.  |

[/parameters]

[returns]

### Returns
Returns boolean value (true/false) indicating whether or not the assignment was successfull

[/returns]

[tips]

### Tips
- Remember that x:0 y:0 is at the top left of the display, so x values increase as you move right, and y values increase as you go down (which is different from math class!).
- If you're having trouble getting a rectangle to show up, make sure a [canvas is created](/applab/docs/createCanvas) first and that where you're trying to draw the rectangle fits within the coordinates of the canvas.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
