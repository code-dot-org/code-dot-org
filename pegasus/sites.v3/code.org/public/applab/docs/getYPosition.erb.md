---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getYPosition(id)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Gets the element's y position.

[/short_description]

Since the UI elements in your app are not static but can be moved, your app may need to know where a UI element currently is placed on the screen. All UI elements (button(), textInput(), textLabel(), dropDown(), checkbox(), radioButton(), image()), can be queried for their current position.

[/description]

### Examples
____________________________________________________

[example]

```
// add the Code.org logo at a random position on the screen and display it's position.
image("logo", "http://code.org/images/logo.png");
setPosition("logo", randomNumber(0,320), randomNumber(0,450));
write(getYPosition("logo"));
```

[/example]
____________________________________________________

[example]

**Am I off the screen?** Check whether the logo has been displayed too close to the bottom edge.

```
// Check whether the logo has been displayed too close to the bottom edge.
image("logo", "http://code.org/images/logo.png");
setPosition("logo", randomNumber(0,320), randomNumber(0,450));
if (isCloseToEdge()){
  write("Too Close to Edge");
}
function isCloseToEdge(){
  if (getYPosition("logo")>=400) {
    return true;
  } else{
    return false;
  }
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
getYPosition(id);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI element to find the x position. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |

[/parameters]

[returns]

### Returns
Returns a number representing the current y coordinate in pixels of the UI element within the app display.

[/returns]

[tips]

### Tips
- The screen default size is 320 pixels wide and 450 pixels high, but you can move a UI element off the screen by exceeding those dimensions.
- A UI element can be moved off the screen so *getYPosition()* can return a negative number if the element is off the screen to the top and *getYPosition()* can return a number greater than 320 if the element is off the screen to the bottom.

<img src='https://images.code.org/7de9a1ac26ad8630ebcb92e608c3803c-image-1445616750775.jpg'>

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
