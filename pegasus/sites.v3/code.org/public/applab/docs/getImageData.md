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

Returns an object representing the image data captured from the canvas by the bounding rectangle that starts at *x*, *y*, with size *width*, and *height*.

[/short_description]

**Note**: A canvas element must exist before image data can be captured. Create a canvas element in Design mode first, or call [createCanvas()](/applab/docs/createCanvas) before calling getImageData().

[/description]

### Examples
____________________________________________________

[example]

**Print the red value of a single pixel**


```
//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480); //Make a canvas element with the name 'canvas1' and size 320x480 pixels
setFillColor('red'); //Set the fill color of future drawn shapes
rect(0, 0, 100, 200); //Draw a 100x200 pixel rectangle at x:0 y:0 on the screen
var imageData = getImageData(0, 0, 320, 480); //Get image data of the canvas (from x:0 y:0 to x:320 y:480)

//Get red value of pixel at x:50 y:50 from input imageData and store it in variable 'redValue'
var redValue = getRed(imageData, 50, 50);

//Print redValue to the debugging console. We will see 255 in the console.
console.log(redValue);
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

**Change the red value of a single pixel to half of its current value**


```
//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Divide the red value of pixel at x:50 y:50 in imageData by 2 and store as 'newRed'
var newRed = (getRed(imageData, 50, 50) / 2);

//First modify the red value at x:50 y:50 in the image data using 'newRed' then update the canvas
setRed(imageData, 50, 50, newRed);
putImageData(imageData, 0, 0);
```

[/example]

____________________________________________________

[example]

**Remove all red from the canvas**

In this more detailed example, we move through each pixel of the canvas and change the red value to zero in each. To do this, the function `removeRed(imageData)` is defined and called after a canvas element has been created with a rectangle drawn and image data captured.


```
//Define the removeRed function (which accepts image data to work on as variable 'thisImageData')
function removeRed(thisImageData){
    for(var y=0; y < thisImageData.height; y++) { //Loop over each pixel in y axis
        for(var x=0; x < thisImageData.width; x++) { //An inner loop over each pixel in x axis
            setRed(thisImageData, x, y, 0); //Use x and y in our loops to set each pixel's red value to 0
        }
        putImageData(thisImageData, 0, 0); //We update the whole canvas for every pixel in our loops
    }
}

//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Then we will call our function to remove all red from the canvas one pixel at a time
removeRed(imageData);
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
Returns an object representing the image data captured from the canvas in the coordinate range from startX, startY to endX, endY.

[/returns]

[tips]

### Tips
- Use this function with the get color functions: [getRed()](/applab/docs/getRed), [getGreen()](/applab/docs/getGreen), [getBlue()](/applab/docs/getBlue), and [getAlpha()](/applab/docs/getAlpha)
- Use this function with the set color functions: [setRed()](/applab/docs/setRed), [setGreen()](/applab/docs/setGreen), [setBlue()](/applab/docs/setBlue), and [setAlpha()](/applab/docs/setAlpha)
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
