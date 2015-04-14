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

Displays the image from the provided url on the screen.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

<pre>
// add the Code.org logo to the screen from the url
image("logo", "http://code.org/images/logo.png");
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

Click the button to change the character image on the screen from the dog to the bee and back again.

<pre>
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
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
image(id, url);
</pre>

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
<pre>
// image displayed on screen
image("logo", "http://code.org/images/logo.png");

// image not displayed on screen
image("logo", "code.org/images/logo.png"); 
</pre>

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
