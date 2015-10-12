---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## image(id, url)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Displays the image from the provided URL on the screen.

To use an image in an app in App Lab you have two options:

#### 1. Find the URL of an image on the web
<img src="https://images.code.org/547f76e741252ca45201e8c70bf0075d-image-1444494509352.png" style="float:right; width: 200px">

In most browsers you can simply **right-click (ctrl+click on a Mac)** on an image and you'll see a menu with a few option. One will be to copy the URL of the image.  You could also choose to view the image in its own window and just copy the URL from there.

#### 2. Upload your own image to App Lab
You can upload images from your computer to App Lab as well.  

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example 1**


```
// add the Code.org logo to the screen from the url
image("logo", "http://code.org/images/logo.png");
```

[/example]

____________________________________________________

[example]

**Example 2**

Click the button to change the character image on the screen from the dog to the bee and back again.


```
// use variables to store the ids for the image and button elements
var imageId = "character";
var buttonId = "changeButton";

// use variables store the urls for the dog and bee character images
var dogImageURL = "http://studio.code.org/blockly/media/skins/applab/static_avatar.png";
var beeImageURL = "http://studio.code.org/blockly/media/skins/bee/static_avatar.png";

// create an image element with the dog character
image(imageId, dogImageURL);

// create a button element
button(buttonId, "Change Character");

// add a click event to the button to change the character
onEvent(buttonId, "click", function(event) {

  // get the current character image URL
  var currentCharacterURL = getImageURL(imageId);

  // determine which character is currently displayed on the screen
  // check if the current character URL is the same URL as the dog character's
  if (currentCharacterURL == dogImageURL) {
    // current character displayed on screen is the dog
    // change the character to the bee
    setImageURL(imageId, beeImageURL);
  } else {
    // the current character url is not the dog character's url
    // the current character url is the bee
    // change the character to the dog
    setImageURL(imageId, dogImageURL);
  }
});
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
image(id, url);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the image element. |
| url | string | Yes | The source URL of the image to be displayed on screen. |

[/parameters]

[returns]

### Returns
Returns boolean value true.

[/returns]

[tips]

### Tips
- Image URL requires the full http:// prefix.

```
// image displayed on screen
image("logo", "http://code.org/images/logo.png");

// image not displayed on screen
image("logo", "code.org/images/logo.png");
```

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
