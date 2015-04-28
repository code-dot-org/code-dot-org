---
title: App Lab Docs
---

[name]

## deleteElement(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Delete the element with the provided id.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

Squash the ant!
Clicking on the ant will squash it and remove it from the screen.

<pre>
// create an ant and place it on the screen
image("ant", "http://www.pdclipart.org/albums/Animals_Bugs_Insects/ant.png");

// add a click event to the ant to remove it from the screen
onEvent("ant", "click", function(event) {
  // delete the ant
  deleteElement("ant");
});
</pre>

[/example]

____________________________________________________

[example]

**Example 2**

Squash the ant swarm!
Ants will randomly appear on the screen every second for one minute. Click on the ant to squash it and remove it from the screen.

<pre>
// define a function to create an ant and place it on screen. 
function createAnt() {
  var antId = "ant" + randomNumber(0, 1000); // create an id for the ant. The id is appended with a random number so only one ant is deleted at a time.
  var antHeight = randomNumber(35,100); // randomly generate a number between 35 and 100 to represent the pixel hight for the ant
  var antWidth = randomNumber(35, 100); // randomly generate a number between 35 and 100 to represent the pixel width for the ant
  var antXPosition = randomNumber(0, 300); // randomly generate a number between 0 and 300 to represent the x position coordinate for the ant
  var antYPosition = randomNumber(0, 400); // randomly generate a number between 0 and 400 to represent the y position coordinate for the ant
  
  // create the ant with the appropraite id
  image(antId, "http://www.pdclipart.org/albums/Animals_Bugs_Insects/ant.png"); 
  
  // position the ant with the appropraite position coordinates and dimensions
  setPosition(antId, antXPosition, antYPosition, antHeight, antWidth); 
  
  // Clicking on the ant will delete it
  onEvent(antId, "click", function(event) {
    deleteElement(antId);
  })
}

var oneSecondInMilliseconds = 1000; // 1 Second = 1000 Milliseconds
var oneMinuteInMilliseconds = 60 * oneSecondInMilliseconds; // 1 Minute = 60 Seconds

// create an interval timer that will call the createAnt function every second
// store the interval timer in a variable to be used later
var createAntInterval = setInterval(createAnt, oneSecondInMilliseconds);

// create a timeout timer to stop creating ants
setTimeout(function() {
  // use the variable to cancel the interval and stop creating ants
  clearInterval(createAntInterval);
}, oneMinuteInMilliseconds);
</pre>


[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
deleteElement(id);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the element to delete.  |

[/parameters]

[returns]

### Returns
Returns true if the id parameter refers to the id of an element that exists.
Returns false if the id parameter refers to the id of an element that does not exist. 

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
