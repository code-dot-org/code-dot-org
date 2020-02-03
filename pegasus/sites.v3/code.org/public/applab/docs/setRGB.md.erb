---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## setRGB(imageData, x, y, red, green, blue, *alpha*)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Sets the RGBA color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue, and alpha (opacity) amounts. If the optional alpha parameter is not provided it will default to 255 (full opacity).

[/short_description]

One advantage of using a canvas for apps containing images or drawing is that you can access the image data at the pixel level. This allows your app to process an image just like many image editing programs.

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully red (and only red) pixel would be written as (255, 0, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples

____________________________________________________

[example]

```
// Radomize the color values of a single pixel
createCanvas('canvas1');
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 100, 200);
console.log(getRed(imageData, 50, 50) + " "+ getGreen(imageData, 50, 50) + " "+ getBlue(imageData, 50, 50));
setRGB(imageData, 50, 50, randomNumber(0,255), randomNumber(0,255), randomNumber(0,255));
putImageData(imageData, 0, 0);
console.log(getRed(imageData, 50, 50) + " "+ getGreen(imageData, 50, 50) + " "+ getBlue(imageData, 50, 50));
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
setRGB(imageData, x, y, red, green, blue, alpha);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageData | object | Yes | The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))    |
| x | number | Yes | The x position in pixels starting from the upper left corner of image.  |
| y | number | Yes | The y position in pixels starting from the upper left corner of image.  |
| red | number | Yes | The amount of red (from 0 to 255) to set in the pixel.  |
| green | number | Yes | The amount of green (from 0 to 255) to set in the pixel.  |
| blue | number | Yes | The amount of blue (from 0 to 255) to set in the pixel.  |
| alpha | number | No | Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity).  |

[/parameters]

[returns]

### Returns
No return value. Only modifies the input image data object. setRGB() will not automatically update what you see on the canvas on screen.

[/returns]

[tips]

### Tips
- Get image data by using [getImageData()](/applab/docs/getImageData)
- Use this function with the get color functions: [getRed()](/applab/docs/getRed), [getGreen()](/applab/docs/getGreen), [getBlue()](/applab/docs/getBlue), and [getAlpha()](/applab/docs/getAlpha)
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
