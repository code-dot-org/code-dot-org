---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getX()

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Gets the current x coordinate in pixels of the turtle.

[/short_description]

The x coordinate is the distance from the turtle to the left of the screen.

[/description]

### Examples
____________________________________________________

[example]


```
var xLocation = getX(); //Get x coordinate of the turtle and store it in variable 'xLocation'
console.log(xLocation); //Print value of the variable to the debugging console
```

[/example]

____________________________________________________

[example]


```
console.log(getX()); //Get x coordinate of the turtle and print it to the debugging console
moveTo(100, 100); //Move  turtle to x:100, y:100
console.log(getX()); //Print x coordinate of the turtle to the console again. Will see 100 in the console.
```

[/example]

____________________________________________________

[example]


```
var newX = getX() + 50; //Add 50 to the current x coordinate of turtle and store it as 'newX'
moveTo(newX, 100); //Move the turtle to the new x location, and y:100
```

[/example]

____________________________________________________

[example]

**Am I off the screen?** In this more detailed example, we check whether the turtle has moved off the right side of the screen, assuming the app is 320 pixels wide. To check this, the function `isOffRight()` is defined and returns `true` if the turtle's x coordinate is greater than 320. Otherwise, it returns `false`. The function is then called in a loop as the turtle moves towards the right side.

```
//Define the function
function isOffRight(){
  if (getX() > 320) {
    return true
  } else{
    return false
  }
}
turnRight(90); //Turn the turtle to the East
for(var i=0; i<10; i++){
  moveForward(50); //Move forward 50 pixels
  console.log("Am I off the screen? "+ isOffRight()); //Print if turtle is off right side of screen
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
getX();
```

[/syntax]

[parameters]

### Parameters

`getX()` does not take any parameters.

[/parameters]

[returns]

### Returns
Returns a number representing the current x coordinate in pixels of the turtle within the app display.

[/returns]

[tips]

### Tips

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
