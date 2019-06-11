---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setAlpha(imageData, x, y, alphaValue)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Sets the amount of alpha (opacity) (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data.

[/short_description]

One advantage of using a canvas for apps containing images or drawing is that you can access the image data at the pixel level. This allows your app to process an image just like many image editing programs.

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully red (and only red) pixel would be written as (255, 0, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples
____________________________________________________

[example]

```
// Change the alpha value of a single pixel to zero.
createCanvas('canvas1');
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 100, 200);
console.log(getAlpha(imageData, 50, 50));
setAlpha(imageData, 50, 50, 0);
putImageData(imageData, 0, 0);
console.log(getAlpha(imageData, 50, 50));
```

[/example]

____________________________________________________

[example]

**Example: It's Getting Clearer** Halve all alpha values for an image and display it next to the original.

```
// Halve all alpha values for an image and display it next to the original.
createCanvas('canvas1');
drawImageURL("https://studio.code.org/blockly/media/skins/bee/static_avatar.png");
button("id", "Transparent");
setPosition('id', 200, 0);
onEvent("id", "click", function() {
  var imageData = getImageData(0, 0, 175, 200);
  putImageData(halveAlpha(imageData), 0, 225);
});

function halveAlpha(thisImageData){
    for(var y=0; y < thisImageData.height; y++) {
        for(var x=0; x < thisImageData.width; x++) {
            var newAlpha = (getAlpha(thisImageData, x, y) / 2);
            setAlpha(thisImageData, x, y, newAlpha);
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
setAlpha(imageData, x, y, alphaValue);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageData | object | Yes | The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData)). |
| x | number | Yes | The x position in pixels starting from the upper left corner of image. |
| y | number | Yes | The y position in pixels starting from the upper left corner of image. |
| alphaValue | number | Yes | The amount of alpha (opacity) (from 0 to 255) to set in the pixel. |

[/parameters]

[returns]

### Returns
No return value. Only modifies the input image data object. setAlpha() will not automatically update what you see on the canvas on screen.

[/returns]

[tips]

### Tips
- Get image data by using [getImageData()](/applab/docs/getImageData).
- Use this function with [getAlpha()](/applab/docs/getAlpha).
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
