---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## substring(id)

[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

The substring method returns a specified section of a string, from a user-defined beginning and endpoint (not including the endpoint). This doesn't change the original string, but instead outputs a new string which is contained within the original.

[/short_description]

[/description]

### Examples
____________________________________________________

[example]


<pre>
string1.substring(start,end);
</pre>

[/example]

____________________________________________________

[example]

**Basic Example**

Pulling from the middle of a string:

<pre>
var str1 = "The lazy red dog");        // Define a string
var substr1 = str1.substring(4,12);    // output only the string's characters from index 4 to 12

console.log(substr1);                  // this will output "lazy red"
</pre>

If you only give one argument to substring(), it will begin at the specified position and extract the rest:

<pre>
var str = "Hello world!";
var substr = str.substring(6);

console.log(substr);                    // this will output "world!"

</pre>

If the start index is greater than the end index, it will swap the two arguments:

<pre>
var str = "What's going on?";
var substr = str.substring(8,1);

console.log(substr);                   // this will output "hat's g"

</pre>

[/example]

____________________________________________________

[example]

**Interactive Example**

Many websites have a registration page where users are asked to accept the terms of service by checking a checkbox.

<pre>
checkbox("checkbox1", false);
textLabel("label1", "I accept the terms of service");

button("button1", "Register");                            // Create a "Register" button.

onEvent("button1", "click", function(){                   // Whenever the "Register" button is clicked ...

  var acceptedTermsOfService = getChecked("checkbox1");   // Get a boolean indicating whether the checkbox is checked or not.

  if(acceptedTermsOfService){                             // Based on the boolean, write a message to the screen.
    write("OK");
  } else {
    write("You must accept the terms of service");
  }
});
</pre>


[/example]

____________________________________________________


[syntax]

### Syntax
<pre>
substring(num,num);
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| num | int | Yes | A start point for the substring  |
| num | int | No | Indicates the end point for the substring extraction. Only 1 argument is required.  |

[/parameters]

[returns]

### Returns
Returns a string value.

[/returns]

[tips]

### Tips

If the start index is less than 0, it will start extracting from index point 0 (the beginning of the string).

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
