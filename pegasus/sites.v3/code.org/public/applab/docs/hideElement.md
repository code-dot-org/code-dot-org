---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## hideElement(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Hides the element with the provided id so it is not shown on the screen.

[/short_description]

**Note**: [showElement(id)](/applab/docs/showElement) is often used with hideElement.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

This example creates an image of the Code.org logo and two buttons. Clicking on the appropriate button will either hide or show the logo.


```
image("logo", "http://code.org/images/logo.png"); // creates the Code.org logo

button("hideButton", "Hide logo"); // creates the hide logo button
button("showButton", "Show logo"); // creates the show logo button

onEvent("hideButton", "click", function(event) { // when the hide button is clicked, hide the logo
  hideElement("logo");
});

onEvent("showButton", "click", function(event) { // when the show button is clicked, show the logo
  showElement("logo");
});

```

[/example]

____________________________________________________

[example]

**Example 2**

This example creates an image of the Code.org logo that blinks.


```
image("logo", "http://code.org/images/logo.png"); // create an image of the Code.org logo

setInterval(function() { // create an interval timer that will hide the Code.org logo
  hideElement("logo"); // hide the Code.org logo

  // create a timer to show the hidden logo
  // a new timer will be created every time the interval timer runs
  setTimeout(function() {
    showElement("logo"); // show the Code.org logo
  }, 500); // Set the delay to 500 milliseconds (0.5 seconds)

}, 1000); // Set the interval to 1000 milliseconds (1 second)
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
hideElement(id);
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| id | string | Yes | The id of the element to hide.  |

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

<%= view :applab_docs_common %>
