---
title: App Lab Docs
---

[name]

## setRGB(imageData, x, y, red, green, blue, alpha)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Sets the RGBA color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue, and alpha (opacity) amounts. If the optional alpha parameter is not provided it will default to 255 (full opacity).

[/short_description]

**Note**: Canvas and image data must exist before image color functions can be used. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before calling setRGB().

**Displaying changed colors**: Using setRGB() on image data will not automatically update what you see on the screen. You will use setRGB() to change the contents of image data then call [putImageData()](/applab/docs/putImageData) to visually update what is in the canvas element and shown on screen.

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully red (and only red) pixel would be written as (255, 0, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples

____________________________________________________

[example]

**Change the color values of a single pixel to zero**

<pre>
//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480); //Make a canvas element with the name 'canvas1' and size 320x480 pixels
setFillColor('red'); //Set the fill color of future drawn shapes
rect(0, 0, 100, 200); //Draw a 100x200 pixel rectangle at x:0 y:0 on the screen
var imageData = getImageData(0, 0, 320, 480); //Get image data of the canvas (from x:0 y:0 to x:320 y:480)

//Print red value of pixel at x:50 y:50 in imageData to the debugging console. We will see 255.
console.log(getRed(imageData, 50, 50));

//First change the color values of a pixel in the image data then update the canvas
setRGB(imageData, 50, 50, 0, 0, 0); //Set the RGB values of pixel at x:50 y:50 in imageData to 0, 0, 0
putImageData(imageData, 0, 0); //Update the canvas with modified image data starting at x:0 y:0

//Print red value at x:50 y:50 from imageData to the console again. We will see 0 in the console.
console.log(getRed(imageData, 50, 50));
//Print green value at x:50 y:50 from imageData to the console. We will see 0 in the console.
console.log(getGreen(imageData, 50, 50));
//Print blue value at x:50 y:50 from imageData to the console. We will see 0 in the console.
console.log(getBlue(imageData, 50, 50));
</pre>

[/example]

____________________________________________________

[example]

**Change a single red pixel to purple**

<pre>
//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Get the red value of pixel at x:50 y:50 in imageData and store as 'redValue'
var redValue = getRed(imageData, 50, 50);
//Print redValue to the debugging console. We will see 255.
console.log(redValue);
//To make purple we will use the maximum blue value (255 red plus 255 blue makes purple)
var newBlue = 255;
//Purple has no green in it, so we use 0 for green
var newGreen = 0;

//First modify the color values at x:50 y:50 in the image data then update the canvas
setRGB(imageData, 50, 50, redValue, newGreen, newBlue);
putImageData(imageData, 0, 0);
</pre>

[/example]

____________________________________________________

[example]

**Remove all color from the canvas**

In this more detailed example, we move through each pixel of the canvas and change the color values to zero in each. To do this, the function `removeColor(imageData)` is defined and called after a canvas element has been created with a rectangle drawn and image data captured.

<pre>
//Define the removeColor function (which accepts image data to work on as variable 'thisImageData')
function removeColor(thisImageData){
    for(var y=0; y < thisImageData.height; y++) { //Loop over each pixel in y axis
        for(var x=0; x < thisImageData.width; x++) { //An inner loop over each pixel in x axis
            setRGB(thisImageData, x, y, 0, 0, 0); //Use x, y from loops to set each pixel's RGB to 0,0,0
        }
        putImageData(thisImageData, 0, 0); //We update the whole canvas for every pixel in our loops
    }
}

//Setup the canvas, draw a red rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('red');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Then we will call our function to remove all color from the canvas one pixel at a time
removeColor(imageData);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
setRGB(imageData, x, y, red, green, blue, alpha);
</pre>

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
