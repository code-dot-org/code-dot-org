---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getImageURL(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Get the URL for the provided image element id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

Add the Code.org logo to the screen


```
// add the Code.org logo to the screen from the url
image("logo", "http://code.org/images/logo.png");

// get the url for the image element with the provided url
// store the url in the variable imageURL
var imageURL = getImageURL("logo");

// output the contents of the variable ("http://code.org/images/logo.png") to the console
console.log(imageURL);
```

[/example]

____________________________________________________

[example]

**Example 2**

Click the button to change the character image on the screen from the dog to the bee and back again.
Use getImageURL to determine which character is currently displayed.


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
getImageURL(id);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the image element. |

[/parameters]

[returns]

### Returns
Returns the first url matching the provided id.

[/returns]

[tips]

### Tips
- getImageURL("id") returns the first URL that matches the provided id.

```
var dogImageURL = "http://studio.code.org/blockly/media/skins/applab/static_avatar.png";
var beeImageURL = "http://studio.code.org/blockly/media/skins/bee/static_avatar.png";

// create two image elements with the same id but different urls
// the first image will display the dog character
// the second image will display the bee character
image("image", dogImageURL);
image("image", beeImageURL);

// get the url from the image element with the id "image"
var url = getImageURL("image");

// output the contents of the variable ("http://studio.code.org/blockly/media/skins/applab/static_avatar.png") to the console
console.log(url);
```

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
