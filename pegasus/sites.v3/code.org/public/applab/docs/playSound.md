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
In most browsers you can simply *right-click (ctrl+click on a Mac)* on an image and you'll see a menu with a few option. One will be to copy the URL of the image. You could also choose to view the image in its own window and just copy the URL from there.

**2. Upload your own image to App Lab.**
You can upload images saved on your computer to your app in App Lab.

- Click the pulldown arrow in the image URL field and then click "Choose..."![](https://images.code.org/e726e56fd3e4c7cd4a0d58cba731a855-image-1444240440116.53.49%20PM.png)
- Then click the "Upload File" button the in the window.
![](https://images.code.org/4e33ebc4011b5eb6590f573ada3ed1da-image-1444241056243.04.04%20PM.png)
- Then choose the file from your computer by navigating to it
- Once its uploaded click "Choose" next to it.  This will insert the name of the file into the URL field.  Because you have uploaded it, it doesn't need to be an HTTP reference.

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
