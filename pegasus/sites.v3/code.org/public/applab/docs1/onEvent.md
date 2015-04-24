---
title: App Lab Docs
---

[name]

## onEvent(id, type, function)

[/name]


[category]

Category: UI controls

[/category]

[description]

[short_description]

Execute code in response to an event for the specified element.

[/short_description]

**Note:** A UI control must exist before the onEvent function can be used.

There are many events that can be used with this function to respond to all kinds of actions that a user can take. You can find the full list [here](http://www.w3schools.com/jsref/dom_obj_event.asp) but some of the most commonly used are:

| Name  | Description                   |
|-------|-------------------------------|
| change | The specified element has been modified.  |
| click | The user clicked on the specified element.  |
| mouseover | The user moved the mouse cursor over the specified element. |
| keydown | The user pressed a keyboard key while the element was selected.  |

The callback function executed in response to an event receives an event object as its parameter, which can be used to gain more information about the event.

[/description]

### Examples
____________________________________________________

[example]

In this example, we use `onEvent` to write a message to the screen every time a button is clicked.
<pre>
button("myButton", "Click me"); //Create a button element
onEvent("myButton", "click", function(event){ //Register a click callback for "myButton"
  write("You clicked the button!"); //Display text on the screen
});
</pre>

[/example]

____________________________________________________

[example]

In this second example, we use `onEvent` to move an image to the coordinates specified in a textbox. Note that we declare only one function that we use for two different callback.
<pre>
textLabel("xLabel", "X coordinate:", "xCoordinate"); //Create a label for the X coordinate text box
textInput("xCoordinate", "160"); //Create a text box where the X coordinate can be modified
textLabel("yLabel", "Y coordinate:", "yCoordinate"); //Create a label for the Y coordinate text box
textInput("yCoordinate", "240"); //Create a text box where the Y coordinate can be modified
image("logo", "http://code.org/images/logo.png"); //Create an image element
setPosition("logo", 160, 240, 32, 32); //Set the start location and size of the image
function moveFromText(event) { //Define a funtion that moves the image based on the text box value
  var x = getText("xCoordinate"); //Get the X coordinate
  var y = getText("yCoordinate"); //Get the Y coordinate
  setPosition("logo", x, y); //Change the position of the image
  //Note that if the text boxes don't contain numbers, the position won't be changed!
}
//Set our moveFromText function as the callback whenever one of the text boxes is modified
onEvent("xCoordinate", "change", moveFromText);
onEvent("yCoordinate", "change", moveFromText);
</pre>

[/example]

____________________________________________________

[example]

We can also write a variant of the previous example, where the image can respond to different events like mouse hover and click.
<pre>
textLabel("xLabel", "X coordinate:", "xCoordinate"); //Create a label for the X coordinate text box
textInput("xCoordinate", "160"); //Create a text box where the X coordinate can be modified
textLabel("yLabel", "Y coordinate:", "yCoordinate"); //Create a label for the Y coordinate text box
textInput("yCoordinate", "240"); //Create a text box where the Y coordinate can be modified
image("logo", "http://code.org/images/logo.png"); //Create an image element
setPosition("logo", 160, 240, 32, 32); //Set the start location and size of the image
function moveFromText(event) { //Define a funtion that moves the image based on the text box value
  var x = getText("xCoordinate"); //Get the X coordinate
  var y = getText("yCoordinate"); //Get the Y coordinate
  setPosition("logo", x, y); //Change the position of the image
  //Note that if the text boxes don't contain numbers, the position won't be changed!
}
//Set our moveFromText function as the callback whenever one of the text boxes is modified
onEvent("xCoordinate", "change", moveFromText);
onEvent("yCoordinate", "change", moveFromText);
//Register a callback for when the mouse comes over the image
onEvent("logo", "mouseover", function(event){
  //We will increase the size of the logo on hover by 16px
  //Get the position of the image and adjust it by 8px in each direction to keep it centered
  var x = getXPosition("logo") - 8;
  var y = getYPosition("logo") - 8;
  setPosition("logo", x, y, 48, 48); //Change the size of the image
});
//We also need to register a callback when the mouse moves out so we can revert our changes
onEvent("logo", "mouseout", function(event){
  //We will decrease the size of the logo on hover by 16px, back to its original size
  //Get the position of the image and adjust it by 8px in each direction to keep it centered
  var x = getXPosition("logo") + 8;
  var y = getYPosition("logo") + 8;
  setPosition("logo", x, y, 32, 32); //Change the size of the image
});
//Finally, we declare a callback to play a sound when the image is clicked
onEvent("logo", "click", function(event){
  playSound("http://soundbible.com/mp3/neck_snap-Vladimir-719669812.mp3");
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
onEvent(id, type, function(event) {
  Code to execute
});
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The ID of the UI control to which this function applies.  |
| type | string | Yes | The type of event to respond to.  |
| function | function | Yes | A function to execute.  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
