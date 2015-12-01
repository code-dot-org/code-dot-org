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

Puts the input image data onto the active canvas element starting at position x, y.

[/short_description]

**Note**: Canvas and image data must exist before image data can be placed back on the canvas. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before using putImageData(). The size of the captured image data will be determined by the parameters of the getImageData() call and the putImageData() call will only take the starting x and y position to place that size of data back on the canvas.

[/description]

### Examples
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
        putImageData(thisImageData, 0, 0); //We update the whole canvas for every row of pixels in our loop
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
No return value. Only modifies the currently active canvas element on screen.

[/returns]

[tips]

### Tips
- Use this function with the get color functions: [getRed()](/applab/docs/getRed), [getGreen()](/applab/docs/getGreen), [getBlue()](/applab/docs/getBlue), and [getAlpha()](/applab/docs/getAlpha)
- Use this function with the set color functions: [setRed()](/applab/docs/setRed), [setGreen()](/applab/docs/setGreen), [setBlue()](/applab/docs/setBlue), and [setAlpha()](/applab/docs/setAlpha)
- You will have to use [getImageData()](/applab/docs/getImageData) to first capture image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
