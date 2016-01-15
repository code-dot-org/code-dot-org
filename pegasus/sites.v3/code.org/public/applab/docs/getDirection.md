---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## getDirection()

[/name]

[category]

Category: Turtle

[/category]

[description]

[short_description]

Returns the current direction that the turtle is facing. Zero degrees is pointing up and the durection increase clockwise.

[/short_description]

Sometimes the user controls the turtle and your app might need to know what direction the turtle is facing. The direction is a number between 0 and 359 degrees.

[/description]

### Examples
____________________________________________________

[example]

```
turnRight(randomNumber(359));
console.log(getDirection());
```

[/example]

____________________________________________________

[example]

**Turning on your Command** Turn the turtle in a random direction, and display the direction, on every user click of a button.

```
// Turn the turtle in a random direction, and display the direction, on every user click of a button.
textLabel("direction", "direction: " + getDirection());
button("random-direction", "Random Direction");
onEvent("random-direction", "click", function() {
  turnRight(randomNumber(359));
  setText("direction", "direction: " + getDirection());
});
```


[/example]

____________________________________________________

[syntax]

### Syntax

```
getDirection()
```

[/syntax]

[parameters]

### Parameters
getDirection() does not take any parameters.

[/parameters]

[returns]

### Returns
Returns an integer between 0 and 359 representing the direction the turtle is facing. 
[/returns]

[tips]

### Tips
- The values of the compass directions are: North:0, East:90, South:180, West:270.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
