---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## drawImageURL(url)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Draws the image from the URL onto the active canvas.

[/short_description]

One advantage of using a canvas for apps containing images or drawing is that you can access the image data at the pixel level. This allows your app to process an image just like many image editing programs. The *drawImageURL* function draws the image onto the canvas with upper left corner of the image at position (0,0).

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully red (and only red) pixel would be written as (255, 0, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

There are two ways to fill in the url string for the second parameter.

**1. Copy the URL of an image on the web.**
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

[example]

```
// Draw an image of a cat on the canvas.
createCanvas('canvas1');
drawImageURL("http://studio.code.org/blockly/media/skins/studio/cat_thumb.png");
```

[/example]

____________________________________________________

[example]

**Example: Squish** Copy and canvas image, alter the image width, and output to a second canvas.

```
// Copy and canvas image, alter the image width, and output to a second canvas.
createCanvas('canvas1');
drawImageURL("http://studio.code.org/blockly/media/skins/studio/octopus_thumb.png");
button("id", "Squish");
setPosition('id', 100, 0);
onEvent("id", "click", function() {
  var canvasData=getImageData(0, 0, 100, 100);
  canvasData.width=400;
  createCanvas('canvas2', 100, 100);
  setPosition('canvas2', 0, 150);
  setActiveCanvas('canvas2');
  putImageData(canvasData, 0, 0);
});
```

[/example]

____________________________________________________

[example]

**Example: Greyscale** Change an image to greyscale by averaging the non-white RGB values.

```
// Change an image to greyscale by averaging the non-white RGB values.
createCanvas('canvas1');
drawImageURL("https://studio.code.org/blockly/media/skins/bee/static_avatar.png");
button("id", "Greyscale");
setPosition('id', 200, 0);
onEvent("id", "click", function() {
  var imageData = getImageData(0, 0, 175, 200);
  putImageData(makeBlackAndWhite(imageData), 0, 225);
});

function makeBlackAndWhite(thisImageData){
    for(var y=0; y < thisImageData.height; y++) {
      for(var x=0; x < thisImageData.width; x++) {
        if (getRed(thisImageData, x, y)!=0 && getGreen(thisImageData, x, y)!=0 && getBlue(thisImageData, x, y)!=0) {
          var newRGB=(getRed(thisImageData, x, y)+getGreen(thisImageData, x, y)+getBlue(thisImageData, x, y) ) / 3;
          setRGB(thisImageData, x, y, newRGB, newRGB, newRGB);
         }
      }
    }
  return thisImageData;
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
drawImageURL(url);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| url | string | Yes | The source URL (or filename for an uploaded file) of the image to be loaded onto the active canvas. |

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- Image URL requires the full http:// prefix.
- A canvas must exist before image data can be placed on the canvas. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas)
- You will have to use [getImageData()](/applab/docs/getImageData) to capture image data for manipulation.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
