---
title: App Lab Docs
---

[name]

## setBlue(imageData, x, y, blueValue)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Sets the amount of blue (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the blueValue input amount.

[/short_description]

**Note**: Canvas and image data must exist before image color functions can be used. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before calling setBlue().

**Displaying changed colors**: Using setBlue() on image data will not automatically update what you see on the screen. You will use setBlue() to change the contents of image data then call [putImageData()](/applab/docs/putImageData) to visually update what is in the canvas element and shown on screen.

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully blue (and only blue) pixel would be written as (0, 0, 255, 255). The alpha value is special because it shows how transparent the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples

____________________________________________________

[example]

**Change the blue value of a single pixel to zero**

<pre>
//Setup the canvas, draw a blue rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480); //Make a canvas element with the name 'canvas1' and size 320x480 pixels
setFillColor('blue'); //Set the fill color of future drawn shapes
rect(0, 0, 100, 200); //Draw a 100x200 pixel rectangle at x:0 y:0 on the screen
var imageData = getImageData(0, 0, 320, 480); //Get image data of the canvas (from x:0 y:0 to x:320 y:480)

//Print blue value of pixel at x:50 y:50 in imageData to the debugging console. Again we will see 255.
console.log(getBlue(imageData, 50, 50));

//First change the blue value of a pixel in the image data then update the canvas
setBlue(imageData, 50, 50, 0); //Set the blue value of pixel at x:50 y:50 in imageData to zero
putImageData(imageData, 0, 0); //Update the canvas with modified image data starting at x:0 y:0

//Print blue value at x:50 y:50 from imageData to the console again. We will see 0 in the console.
console.log(getBlue(imageData, 50, 50)); 
</pre>

[/example]

____________________________________________________

[example]

**Change the blue value of a single pixel to half of its current value**

<pre>
//Setup the canvas, draw a blue rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('blue');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Divide the blue value of pixel at x:50 y:50 in imageData by 2 and store as 'newBlue'
var newBlue = (getBlue(imageData, 50, 50) / 2);

//First modify the blue value at x:50 y:50 in the image data using 'newBlue' then update the canvas
setBlue(imageData, 50, 50, newBlue);
putImageData(imageData, 0, 0);
</pre>

[/example]

____________________________________________________

[example]

**Remove all blue from the canvas**

In this more detailed example, we move through each pixel of the canvas and change the blue value to zero in each. To do this, the function `removeBlue(imageData)` is defined and called after a canvas element has been created with a rectangle drawn and image data captured.

<pre>
//Define the removeBlue function (which accepts image data to work on as variable 'thisImageData')
function removeBlue(thisImageData){
    for(var y=0; y < thisImageData.height; y++) { //Loop over each pixel in y axis
        for(var x=0; x < thisImageData.width; x++) { //An inner loop over each pixel in x axis
            setBlue(thisImageData, x, y, 0); //Use x and y in our loops to set each pixel's blue value to 0
        }
        putImageData(thisImageData, 0, 0); //We update the whole canvas for every pixel in our loops
    }
}

//Setup the canvas, draw a blue rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('blue');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Then we will call our function to remove all blue from the canvas one pixel at a time
removeBlue(imageData);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setBlue(imageData, x, y, blueValue);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| imageData | object | Yes | The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))    |
| x | number | Yes | The x position in pixels starting from the upper left corner of image.  |
| y | number | Yes | The y position in pixels starting from the upper left corner of image.  |
| blueValue | number | Yes | The amount of blue (from 0 to 255) to set in the pixel.  |

[/parameters]

[returns]

### Returns
No return value. Only modifies the input image data object. setBlue() will not automatically update what you see on the canvas on screen.

[/returns]

[tips]

### Tips
- Get image data by using [getImageData()](/applab/docs/getImageData)
- Use this function with [getBlue()](/applab/docs/setBlue)
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
