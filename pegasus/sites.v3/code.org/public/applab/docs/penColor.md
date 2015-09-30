---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## penColor(color)

[/name]


[category]

Category: Turtle

[/category]

[description]

[short_description]

Sets the color of the trail drawn behind the turtle as it moves.

[/short_description]

**Note**: If no lines are appearing on screen use [penDown()](/applab/docs/penDown) first.
**Note**: The color can be the name of the color, the hex value of the color, or the rgb value of the color. Reference [HTML named colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Color_keywords) for a complete list of all available colors.
**Note**: You can also use any of the valid CSS color naming conventions, especially, rgba(...) which allows you set a color with some amount of transparency. Reference [CSS colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)

[/description]

### Examples
____________________________________________________

[example]

**Example 1**


```
penColor("cyan");   // sets the color of the trail drawn behind the turtle to cyan
moveForward(100);   // moves the turtle forward by 100 pixels
```

[/example]

____________________________________________________

[example]

**Example 2**

This demonstrates all 4 ways to give a color to the penColor() function.


```
penColor("chartreuse");     		 // sets the color using a string
moveForward(50);            	 	 // moves the turtle forward 50 pixels

penColor("7fff00");          		 // sets the color using a hex value
moveForward(50);              		 // moves the turtle forward 50 pixels

penColor("rgb(127, 255, 0)"); 		 // sets the color using a rgb value
moveForward(50);              		 // moves the turtle forward 50 pixels

penColor("rgba(127, 255, 0, 0.5)"); // sets the color using a rgba value, the last value is amount
									 //   of transparency, a percentage between 0.0 and 1.0
moveForward(50);              		 // moves the turtle forward 50 pixels
```

[/example]

____________________________________________________

[example]

**Example 3**


```
var c = (prompt("Enter a color"));  // prompts the user for a color
penColor(c);                        // sets the color of trail drawn behind the turtle to the color
                                    // the user entered
moveForward(100);                   // moves the turtle forward by 100 pixels
```


[/example]

____________________________________________________

[example]

**Example 4**

This program draws a circle figure out of lines. It cycles through the colors every time it turns. Here we use **4** colors, so we say penColor(colors[i%**4**]).


```
var colors = ["red", "magenta", "pink", "purple"];  // creates an array of 4 strings representing colors
for (var i = 0; i < 360; i++) {                     // loops 360 times
  penColor(colors[i%4]);                            // sets the color of the turtles trail
                                                    // to a color from the array
  moveForward(100);                                 // moves the turtle forward by 100 pixels
  moveBackward(100);                                // moves the turtle backward by 100 pixels
  turnRight(1);                                     // turns the turtle 1 pixel to the right
}
```


[/example]

____________________________________________________


[syntax]

### Syntax

```
penColor(color);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| color | String | Yes | The color of the line left behind the turtle as it moves  |
<br />
`penColor()` can be passed the name of the color, the hex value of the color, or the rgb value of the color. Reference Example 2 above for more specifics.

[/parameters]

[returns]

### Returns
No return value. Outputs to the display only.

[/returns]

[tips]

### Tips
- If no lines are appearing on screen use [penDown()](/applab/docs/penDown) first.
- The color value being passed can be the name of the color, the hex value of the color, or the rgb value of the color. Reference [colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) for a complete list of all available colors.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
