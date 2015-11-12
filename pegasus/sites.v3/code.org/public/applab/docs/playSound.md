---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## playSound(url)

[/name]

[category]

Category: UI controls

[/category]

[description]

[short_description]

Plays the MP3, OGG or WAV sound file from the specified URL.

[/short_description]

Today's apps play sounds to make them more engaging. You can add sounds to your apps that are triggered by events on UI elements, or based on turtle movements, or just based on other app code. There are two ways to fill in the url string for the parameter.

**1. Copy the URL of a sound on the web.**
In most browsers you can simply *right-click (ctrl+click on a Mac)* on a sound file and you'll see a menu with a few option. One will be to copy the URL of the sound.

**2. Upload your own spunds file to App Lab.**
You can upload sound files saved on your computer to your app in App Lab.

- Click the pulldown arrow in the image URL field and then click "Choose..."![](https://images.code.org/fd732bd6408f4b057f25b1dad946cb13-image-1447331874346.jpg)
- Then click the "Upload File" button the in the window.
![](https://images.code.org/4e33ebc4011b5eb6590f573ada3ed1da-image-1444241056243.04.04%20PM.png)
- Then choose the file from your computer by navigating to it
- Once its uploaded click "Choose" next to it.  This will insert the name of the file into the URL field.  Because you have uploaded it, it doesn't need to be an HTTP reference.

[/description]

### Examples
____________________________________________________

[example]

```
// Play a goal sound.
playSound("https://studio.code.org/blockly/media/skins/studio/1_goal.mp3");
```

[/example]

____________________________________________________

[example]

**Example: Don't Go Too Far** Beep whenever the turtle moves to a position outside a rectangle at the center of the screen.

```
// Beep whenever the turtle moves to a position outside a rectangle at the center of the screen.
var count = 1;
while ((count <= 3)) {
  turnTo(randomNumber(1, 360));
  moveForward(randomNumber(25, 50));
  if (getX() < 100 || getX() > 220 || getY() < 165 || getY() > 285) {
    playSound("beep-01a.mp3");
    count = count+1;
  }
}
```

[/example]

____________________________________________________


[syntax]

### Syntax

```
playSound(url)
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| url | string | Yes | The source URL (or filename for an uploaded file) of the MP3, OGG or WAV sound file to be played. |

[/parameters]

[returns]

### Returns
No return value. Plays a sound only.

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
