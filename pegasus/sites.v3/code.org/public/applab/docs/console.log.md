---
title: App Lab Docs
---

[name]

## console.log(message)

[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

Displays the string or variable in the console display

[/short_description]

console.log() is used to help you understand what your code is doing.  By displaying a message containing either descriptive text that tells you what is happening or the value of particular variables, you can follow along as your code executes.

[/description]

### Examples
____________________________________________________

[example]

<pre>
console.log("It's Alive!") // Let's you know your code is running
</pre>

[/example]

____________________________________________________

[example]

<pre>
// I'm thinking of a number between 0 and 10
var myRandomNumber = randomNumber(10)
console.log("My random number is: " + myRandomNumber)
</pre>

[/example]

____________________________________________________
[example]

<pre>
// Display the true/false state of a checkbox
checkbox("myCheckbox", false);
textLabel("myLabel", "Click on or off", "myCheckbox");
onEvent("myCheckbox", "click", function(event) {
  console.log("Checkbox is: " + getChecked("myCheckbox"));
});
</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
console.log(message)
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| message | string | Yes | The message string to display in the console.  |

[/parameters]

[returns]

### Returns
No return value. Outputs to the console only.

[/returns]

[tips]

### Tips
- Code that has a lot of console.log() messages is considered "chatty" because it talks to you a lot.  Chatty code is good when you first write a new block of code because it helps you know what is happening, so don't hesitate to use console.log() a lot.  But chatty code can be irritating after a while, so once your code is working the way you want, it is a good idea to go back through and clean up by removing console.log() messages that are no longer helpful.  
- Remember that the + operator works differently for numbers than strings.  For instance console.log(5 + 3) will display "8" because the integers 5 and 3 will be added together then automatically converted to a string, but console.log("5" + "3") will simply concatenate the two strings to display "53".

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
