---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getImageData(x, y, width, height)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Gets an object representing the image data captured from the active canvas by the bounding rectangle that starts at *x*, *y*, with size *width*, and *height* pixels.

[/short_description]

One advantage of using a canvas for apps containing images or drawing is that you can access the image data at the pixel level. This allows your app to process an image just like many image editing programs.

The object returned contains the following fields:

- data - An array of pixel color values, four values for each pixel (red, green, blue, alpha/opacity).
- width - The width of the image in pixels.
- height - The height of the image in pixels.

[/description]

### Examples
____________________________________________________

[example]

```
// Output the object of a 5 pixel by 5 pixel image of a rectangle. 
createCanvas('canvas1');
setStrokeColor('red');
rect(0,0,5,5);
var canvasData=getImageData(0, 0, 5, 5);
console.log(canvasData);
```

[/example]

____________________________________________________

[example]

**Example: Duplicate** Copy the canvas image to a second canvas.

```
// Copy and canvas image to a second canvas. 
createCanvas('canvas1', 200, 200);
setFillColor("red");
circle(100, 100, 50);
var canvasData=getImageData(0, 0, 200, 200);
createCanvas('canvas2', 200, 200);
setPosition('canvas2', 0, 200);
setActiveCanvas('canvas2');
putImageData(canvasData, 0, 0);
```

[/example]

____________________________________________________

[example]

**Example: Squish** Copy and canvas image, alter the image width, and output to a second canvas.

```
// Copy and canvas image, alter the image width, and output to a second canvas.
createCanvas('canvas1', 200, 200);
setFillColor("red");
circle(100, 100, 50);
var canvasData=getImageData(0, 0, 200, 200);
canvasData.width=400;
createCanvas('canvas2', 200, 200);
setPosition('canvas2', 0, 200);
setActiveCanvas('canvas2');
putImageData(canvasData, 0, 0);
```

[/example]

____________________________________________________

[example]

**Example: Seeing Red** Print the red value of a single pixel.

```
// Print the red value of a single pixel
createCanvas('canvas1', 200, 200);
setFillColor("red");
circle(100, 100, 50);
var canvasData=getImageData(0, 0, 200, 200);
var redValue = getRed(canvasData, 100, 100);
console.log(redValue);
```

[/example]

____________________________________________________

[example]

**Example: Center Black** Change the red value of a single pixel to zero.

```
// Change the red value of a single pixel to zero.
createCanvas('canvas1', 200, 200);
setFillColor("red");
circle(100, 100, 50);
var canvasData=getImageData(0, 0, 200, 200);
var redValue = getRed(canvasData, 100, 100);
console.log(redValue);
setRed(canvasData, 100, 100, 0);
putImageData(canvasData, 0, 0);
console.log(getRed(canvasData, 50, 50));
```

[/example]

____________________________________________________

[example]

**Example: Red Out** Remove all red from the canvas.

```
// Remove all red from the canvas.
createCanvas('canvas1', 200, 200);
setFillColor("red");
circle(100, 100, 50);
var canvasData=getImageData(0, 0, 200, 200);
removeRed(canvasData);

// Removes red in every pixel from 'thisImageData' argument. Updates the image row by row.
function removeRed(thisImageData){
    for(var y=0; y < thisImageData.height; y++) {
        for(var x=0; x < thisImageData.width; x++) {
            setRed(thisImageData, x, y, 0);
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
getImageData(startX, startY, endX, endY);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | number | Yes | The x position in pixels to start the capture.  |
| y | number | Yes | The y position in pixels to start the capture.  |
| width | number | Yes | The width of the bounding rectangle to capture the image data.  |
| height | number | Yes | The height of the bounding rectangle to capture the image data.  |

[/parameters]

[returns]

### Returns
Returns an object representing the image data captured from the active canvas within the pixel range specified.

[/returns]

[tips]

### Tips
- A canvas element must exist before image data can be captured. Create a canvas element in Design mode first, or call [createCanvas()](/applab/docs/createCanvas) before calling getImageData().
- Use this function with the get color functions: [getRed()](/applab/docs/getRed), [getGreen()](/applab/docs/getGreen), [getBlue()](/applab/docs/getBlue), and [getAlpha()](/applab/docs/getAlpha)
- Use this function with the set color functions: [setRed()](/applab/docs/setRed), [setGreen()](/applab/docs/setGreen), [setBlue()](/applab/docs/setBlue), and [setAlpha()](/applab/docs/setAlpha)
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
