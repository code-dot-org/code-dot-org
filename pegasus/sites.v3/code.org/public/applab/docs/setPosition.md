---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setPosition(id, x, y, *width*, *height*)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Positions an element at an *x,y* screen coordinate, and optionally sets a new *width* and *height* for the element.

[/short_description]

Your app sometimes needs to move, and possibly resize, the UI elements on a screen. All UI elements (button(), textInput(), textLabel(), dropDown(), checkBox(), radioButton(), image()), can be moved and resized. It is usually easier to place UI elements in their initial positions, with initial sizes, using Design mode in App Lab. In Design mode you can also specify font size, font color and background color for UI elements.

[/description]

### Examples
____________________________________________________

[example]

```
// You can't catch the gingerbread man.
image("id", "gingerbread-man-running.jpg");
onEvent("id", "mouseover", function(event){
  setPosition("id", randomNumber(0,320), randomNumber(0,450));
});
```

[/example]
____________________________________________________
[example]

**Example: Harder Gingerbread Capture** Vary both the location and size of the image. 

```
// Vary both the location and size of the image.
image("id", "gingerbread-man-running.jpg");
onEvent("id", "mouseover", function(event){
  var newSize=randomNumber(50,100);
  setPosition("id", randomNumber(0,320), randomNumber(0,450), newSize, newSize);
});
```

[/example]
____________________________________________________
[example]

**Example: Find the Gingerbread Man** Play find the gingerbread man by placing images at specific locations. 

<table>
<tr>
<td style="border-style:none; width:90%; padding:0px">
<pre>
// Play find the gingerbread man by placing images at specific locations.
image("id", "gingerbread-man-running.jpg");
var randomXPosition=randomNumber(0,2)*100;
setPosition("id", randomXPosition+10, 170);
image("id1", "codeorg.jpg");
setPosition("id1", 10, 175);
image("id2", "codeorg.jpg");
setPosition("id2", 110, 175);
image("id3", "codeorg.jpg");
setPosition("id3", 210, 175);

onEvent("id1", "click", function(event){
  hideElement("id1");
});

onEvent("id2", "click", function(event){
  hideElement("id2");
});

onEvent("id3", "click", function(event){
  hideElement("id3");
});
</pre>
</td>
<td style="border-style:none; width:10%; padding:0px">
<img src='https://images.code.org/58f0652068840389f12799f842414cc4-image-1446488807780.gif'>
</td>
</tr>
</table>

[/example]
____________________________________________________

[syntax]

### Syntax

```
setPosition(id, x, y, width, height)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI element to which this event handler applies. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| x | number | Yes | The x coordinate on the screen to move the UI element to. |
| y | number | Yes | The y coordinate on the screen to move the UI element to. |
| width | number | No | The width to set the UI element to, in pixels. |
| height | number | No | The height to set the UI element to, in pixels. |

[/parameters]

[returns]

### Returns
No return value. Modifies display only.

[/returns]

[tips]

### Tips

- The upper left corner of the UI element is placed at the (x,y) coordinate location.
- The screen default size is 320 pixels wide and 450 pixels high, but you can move a UI element off the screen by exceeding those dimensions.

<img src='https://images.code.org/7de9a1ac26ad8630ebcb92e608c3803c-image-1445616750775.jpg'>

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
