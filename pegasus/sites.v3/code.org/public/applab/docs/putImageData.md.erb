---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## putImageData(imgData, x, y)

[/name]

[category]

Category: Canvas

[/category]

[description]

[short_description]

Puts the input image data onto the active canvas starting at position x, y.

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
// Copy part of the image on the canvas to new locations on the canvas. 
createCanvas('canvas1', 200, 200);
setFillColor("blue");
rect(0, 0, 50, 50);
var canvasData=getImageData(0, 0, 50, 50);
putImageData(canvasData, 100, 0);
putImageData(canvasData, 50, 50);
putImageData(canvasData, 0, 100);
putImageData(canvasData, 100, 100);
```

[/example]

____________________________________________________

[example]

**Change the red value of a single pixel to zero**

```
//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Print red value of pixel at x:50 y:50 in imageData to the debugging console. Again we will see 255.
console.log(getRed(imageData, 50, 50));

//First change the red value of a pixel in the image data then update the canvas
setRed(imageData, 50, 50, 0); //Set the red value of pixel at x:50 y:50 in imageData to zero
putImageData(imageData, 0, 0); //Update the canvas with modified image data starting at x:0 y:0

//Print red value at x:50 y:50 from imageData to the console again. We will see 0 in the console.
console.log(getRed(imageData, 50, 50));
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
putImageData(imgData, x, y);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imgData | object | Yes | The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))    |
| x | number | Yes | The x position in pixels starting from the upper left corner of image to place the data on the canvas.  |
| y | number | Yes | The y position in pixels starting from the upper left corner of image to place the data on the canvas.  |

[/parameters]

[returns]

### Returns
No return value. Only modifies the currently active canvas on screen.

[/returns]

[tips]

### Tips
- Canvas and image data must exist before image data can be placed back on the canvas. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before using putImageData(). The size of the captured image data will be determined by the parameters of the getImageData() call and the putImageData() call will only take the starting x and y position to place that size of data back on the canvas.
- Use this function with the get color functions: [getRed()](/applab/docs/getRed), [getGreen()](/applab/docs/getGreen), [getBlue()](/applab/docs/getBlue), and [getAlpha()](/applab/docs/getAlpha)
- Use this function with the set color functions: [setRed()](/applab/docs/setRed), [setGreen()](/applab/docs/setGreen), [setBlue()](/applab/docs/setBlue), and [setAlpha()](/applab/docs/setAlpha)
- You will have to use [getImageData()](/applab/docs/getImageData) to first capture image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
