---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getRed(imageData, x, y)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Returns the amount of red (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data.

[/short_description]

One advantage of using a canvas for apps containing images or drawing is that you can access the image data at the pixel level. This allows your app to process an image just like many image editing programs.

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully red (and only red) pixel would be written as (255, 0, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples
____________________________________________________

[example]

```
// Print the red value of a single pixel from a drawing.
createCanvas('canvas1');
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 100, 200);
var redValue = getRed(imageData, 50, 50);
console.log(redValue);
```

[/example]

____________________________________________________

[example]

```
// Print the red value of single pixels from an image.
createCanvas('canvas1');
drawImageURL("https://studio.code.org/blockly/media/skins/bee/static_avatar.png");
var imageData = getImageData(0, 0, 100, 100);
console.log(getRed(imageData, 10, 10));
console.log(getRed(imageData, 50, 50));
```

[/example]

____________________________________________________

[example]

**Example: Get the Red Out** Change the red value of a single pixel to zero.

```
// Change the red value of a single pixel to zero.
createCanvas('canvas1');
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 100, 200);
console.log(getRed(imageData, 50, 50));
setRed(imageData, 50, 50, 0);
putImageData(imageData, 0, 0);
console.log(getRed(imageData, 50, 50));
```

[/example]

____________________________________________________

[example]

**Example: Not So Red** Halve all red values in the canvas.

```
// Halve all red values in the canvas.
createCanvas('canvas1');
drawImageURL("https://studio.code.org/blockly/media/skins/bee/static_avatar.png");
button("id", "Halve Red");
setPosition('id', 200, 0);
onEvent("id", "click", function() {
  var imageData = getImageData(0, 0, 320, 480);
  halveRed(imageData);
});

// Halves the red in every pixel from 'thisImageData' argument. Updates the image row by row.
function halveRed(thisImageData){
    for(var y=0; y < thisImageData.height; y++) {
        for(var x=0; x < thisImageData.width; x++) {
            var newRed = (getRed(thisImageData, x, y) / 2);
            setRed(thisImageData, x, y, newRed);
        }
        putImageData(thisImageData, 0, 0);
    }
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
getRed(imageData, x, y);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageData | object | Yes | The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))    |
| x | number | Yes | The x position in pixels starting from the upper left corner of image.  |
| y | number | Yes | The y position in pixels starting from the upper left corner of image.  |

[/parameters]

[returns]

### Returns
Returns a number representing the red value (between 0 and 255) of the pixel in the input image data at the input x and y coordinates.

[/returns]

[tips]

### Tips
- Canvas and image data must exist before image color functions can be used. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before calling getAlpha().
- Use the output of this function with [setRed()](/applab/docs/setRed) or [setRGB()](/applab/docs/setRGB).
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>