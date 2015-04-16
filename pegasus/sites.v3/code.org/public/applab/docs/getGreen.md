---
title: App Lab Docs
---

[name]

## getGreen(imageData, x, y)

[/name]


[category]

Category: Canvas

[/category]

[description]

[short_description]

Returns the amount of green (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data.

[/short_description]

**Note**: Canvas and image data must exist before image color functions can be used. Create a canvas element in Design mode first or call [createCanvas()](/applab/docs/createCanvas), and then you can capture image data using [getImageData()](/applab/docs/getImageData) before calling getGreen().

**How pixel colors work**: The color you see in a pixel on the screen is made up of 4 values. The red, green, blue, and alpha values of a pixel determine exactly the shade of color that appears on the screen. Each of these values ranges from a minimum of 0 up to a maximum of 255. They are usually listed in the order of Red, Green, Blue, then Alpha - or RGBA. A fully green (and only green) pixel would be written as (0, 255, 0, 255). A black pixel is (0, 0, 0, 255). So reducing a pixel's color values will cause it to be closer to black. The alpha value is special because it shows how opaque the pixel should be in comparison to other pixels on the same spot at the screen. So an alpha value of 0 would make a pixel fully transparent (regardless of the other color values) and 255 is fully visible.

[/description]

### Examples
____________________________________________________

[example]

**Print the green value of a single pixel**

<pre>
//Setup the canvas, draw a green rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480); //Make a canvas element with the name 'canvas1' and size 320x480 pixels
setFillColor('green'); //Set the fill color of future drawn shapes
rect(0, 0, 100, 200); //Draw a 100x200 pixel rectangle at x:0 y:0 on the screen
var imageData = getImageData(0, 0, 320, 480); //Get image data of the canvas (from x:0 y:0 to x:320 y:480)

//Get green value of pixel at x:50 y:50 from input imageData and store it in variable 'greenValue'
var greenValue = getGreen(imageData, 50, 50);

//Print greenValue to the debugging console. We will see 255 in the console.
console.log(greenValue);
</pre>

[/example]

____________________________________________________

[example]

**Change the green value of a single pixel to zero**

<pre>
//Setup the canvas, draw a green rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('green');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Print green value of pixel at x:50 y:50 in imageData to the debugging console. Again we will see 255.
console.log(getGreen(imageData, 50, 50));

//First modify the green value at x:50 y:50 in the image data then update the canvas
setGreen(imageData, 50, 50, 0); //Set the green value of pixel at x:50 y:50 in imageData to zero
putImageData(imageData, 0, 0); //Update the canvas with modified image data starting at x:0 y:0

//Print green value at x:50 y:50 from imageData to the console again. We will see 0 in the console.
console.log(getGreen(imageData, 50, 50)); 
</pre>

[/example]

____________________________________________________

[example]

**Change the green value of a single pixel to half of its current value**

<pre>
//Setup the canvas, draw a green rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('green');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Divide the green value of pixel at x:50 y:50 in imageData by 2 and store as 'newGreen'
var newGreen = (getGreen(imageData, 50, 50) / 2);

//First modify the green value at x:50 y:50 in the image data using 'newGreen' then update the canvas
setGreen(imageData, 50, 50, newGreen);
putImageData(imageData, 0, 0);
</pre>

[/example]

____________________________________________________

[example]

**Halve all green values in the canvas**

In this more detailed example, we move through each pixel of the canvas and halve the green value in each. To do this, the function `halveGreen(imageData)` is defined and called after a canvas element has been created with a rectangle drawn and image data captured.

<pre>
//Define the halveGreen function (which accepts image data to work on as variable 'thisImageData')
function halveGreen(thisImageData){
    for(var y=0; y < thisImageData.height; y++) { //Loop over each pixel in y axis
        for(var x=0; x < thisImageData.width; x++) { //An inner loop over each pixel in x axis
            var newGreen = (getGreen(thisImageData, x, y) / 2); //Calculate half the green value
            setGreen(thisImageData, x, y, newGreen); //Use x, y from our loops to set each green value
        }
        putImageData(thisImageData, 0, 0); //We update the whole canvas for each pixel of our loops
    }
}

//Setup the canvas, draw a green rectangle, and capture the image data of the whole canvas
createCanvas('canvas1', 320, 480);
setFillColor('green');
rect(0, 0, 100, 200);
var imageData = getImageData(0, 0, 320, 480);

//Then we will call our function to halve all green values in the canvas one pixel at a time
halveGreen(imageData);
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
getGreen(imageData, x, y);
</pre>

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
Returns a number representing the green value (between 0 and 255) of the pixel in the input image data at the input x and y coordinates.

[/returns]

[tips]

### Tips
- Get image data by using [getImageData()](/applab/docs/getImageData)
- Use the output of this function with [setGreen()](/applab/docs/setGreen) or [setRGB()](/applab/docs/setRGB)
- You will have to use [putImageData()](/applab/docs/putImageData) to update the canvas with modified image data

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
