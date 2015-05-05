---
title: App Lab Docs
---

[name]

## randomNumber(min, max)

[/name]


[category]

Category: Math

[/category]

[description]

[short_description]

Returns a [pseudorandom](http://en.wikipedia.org/wiki/Pseudorandom_number_generator) number ranging from the first number (min) to the second number (max), including both numbers in the range.

[/short_description]

The number returned is not truly random as defined in mathematics.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

turtle example
<pre>
moveForward(randomNumber(25, 150));
</pre>

console example
<pre>
console.log(randomNumber(5, 20));       // generates a pseudorandom number in the range 5 to 20 (inclusive)
                                        //    and then prints it to the console
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

Turtle example.  Do a "random walk" of 25 steps, turning a random number of degrees after each step.
<pre>
for (var i = 0; i < 25; i++) {
  moveForward(25);
  turnRight(randomNumber(-90, 90));
}
</pre>

This example prints out 5 pseudorandom numbers in the range -10 to 10 to the console.

<pre>
for (var i = 0; i < 5; i++) {           // repeats the code inside of this block 5 times
  console.log(randomNumber(-10, 10));   // calculates a pseudorandom number in the range -10 to 10
                                        //    and then prints it to the console
}
</pre>

[/example]

____________________________________________________

[example]

**Example 3**

This example asks the user for a number and then draws that number of bird images on the screen in random locations.

<pre>
textLabel("birds_label", "How many birds would you like to create?"); // creates a text label for the number
                                                                      // of birds input

textInput("birds_input", "", 100);                                    // creates a text box for the user
                                                                      // to enter the number of birds they
                                                                      // want drawn on the canvas

image("bird", "http://studio.code.org/blockly/media/skins/studio/bird_thumb.png");  // creates the bird image
setPosition("bird", 0, 60, 100, 100);                                 // sets the location of the bird image
                                                                      // so that it is below the text label
                                                                      // and text box

createCanvas("id", 320, 480);                                         // creates the canvas

function moveFromText(event) {                                        // creates a function for when the user
                                                                      // moves out of the text box

  hideElement("bird");                                                // hides the original bird image
  var birds = getText("birds_input");                                 // gets the number the user entered and
                                                                      // stores it into the birds variable

  clearCanvas();                                                      // clears the canvas, this allows the
                                                                      // user to change the value in the
                                                                      // text box
  for (var i = 0; i < birds; i++) {                                   // this loop will draw the
                                                                      // correct number of birds based on
                                                                      // what the user entered
    drawImage("bird", randomNumber(-5, 220), randomNumber(60, 370));  // this draws the birds at random
                                                                      // location within the size of
                                                                      // the canvas
  }
}
onEvent("birds_input", "change", moveFromText);                       // when the user moves from the
                                                                      // text box, the function moveFromText
                                                                      // will be called
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
randomNumber(min, max);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| min | number | Yes | The minimum number returned  |
| max | number | Yes | The maximum number returned  |


[/parameters]

[returns]

### Returns
Returns a pseudorandom number in the range min to max (inclusive). The number returned will always be an integer.

[/returns]

[tips]

### Tips


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
