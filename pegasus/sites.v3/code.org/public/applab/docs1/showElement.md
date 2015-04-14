---
title: App Lab Docs
---

[name]

## showElement(id)

[/name]

[category]

Category: UI Controls

[/category]

[description]

[short_description]

Shows the element with the provided id.

[/short_description]

**Note**: [hideElement(id)](/applab/docs/hideElement) is often used with showElement.

[/description]

### Examples
____________________________________________________

[example]

**Example 1**

This example creates an image of the Code.org logo and two buttons. Clicking on the appropriate button will either hide or show the logo.

<pre>
image("logo", "http://code.org/images/logo.png"); // creates the Code.org logo

button("hideButton", "Hide logo"); // creates the hide logo button
button("showButton", "Show logo"); // creates the show logo button

onEvent("hideButton", "click", function(event) { // when the hide button is clicked, hide the logo
  hideElement("logo");
});

onEvent("showButton", "click", function(event) { // when the show button is clicked, show the logo
  showElement("logo");
});

</pre>

[/example]

____________________________________________________

[example]

**Example 2**

This example creates an image of the Code.org logo that blinks.

<pre>
image("logo", "http://code.org/images/logo.png"); // create an image of the Code.org logo

setInterval(function() { // create an interval timer that will hide the Code.org logo
  hideElement("logo"); // hide the Code.org logo

  // create a timer to show the hidden logo
  // a new timer will be created every time the interval timer runs
  setTimeout(function() {
    showElement("logo"); // show the Code.org logo
  }, 500); // Set the delay to 500 milliseconds (0.5 seconds)

}, 1000); // Set the interval to 1000 milliseconds (1 second)
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
showElement(id);
</pre>

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
