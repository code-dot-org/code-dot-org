---
title: App Lab Docs
embedded_layout: simple_embedded
---

[name]

## Declare and assign an array to a variable

[/name]

[category]

Category: Variables

[/category]

[description]

[short_description]

Declares a variable and assigns it to an array with the given initial values.

[/short_description]

Many apps process collections of data. To be able to process collections of data your apps need to keep track of the data in memory. Array variables are simply names you use to refer to stored data in your apps. You can name your variables whatever you want so long as the name is not already used by the system. Variable names can not have spaces or special characters. In practice, it is helpful to name your variables in a way that describes the value they store. For instance, if the array variable you create is to store a days of the week you might name that array variable daysOfWeek.

In addition to the array variable name, items in your array are numbered with an index. The first element in an array is has index 0 and the second had index 1 and so on. As a result the last index is always one less than the length of the array.

To process collections of data in our apps we need to assign values to memory locations we have previously named using var to declare an array variable. Programmers read the statement "days = ["Monday", "Tuesday"];" as "days gets the array containing the strings "Monday" and "Tuesday". With this type of assignment, the variable is assigned to an array of values. The brackets denote the start and end of the array and the commas delimit the array values.

[/description]

### Examples
____________________________________________________

[example]


```
// Flip a coin
var coinFaces = ["heads","tails"];
var myFlip = randomNumber(1);
console.log("You flipped " + coinFaces[myFlip]);
```

[/example]

____________________________________________________

[example]

**Example: Prime Choice** Pick a prime number from an array.

```
// Pick a prime number from an array.
var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
var numberEndings = ["st","nd","rd","th","th","th","th","th","th","th"];
var myPick = prompt("Which of the first 10 prime numbers do you want");
if(myPick <= primes.length)
{
   console.log("The " + myPick + numberEndings[myPick-1] + " prime is " + primes[myPick-1]);
}
else
{
  console.log("I don't know the " + myPick + "th Prime");
}
```

[/example]

____________________________________________________

[example]

**Example: Connect the Dots** Plot a path along verticies in an array. Each vertex is also an array of two values.

```
// Plot a path along verticies in an array. Each vertex is also an array of two values.
var coordinates = [[10,10], [100,10], [100,100], [10,100], [10,10]];
penUp();
moveTo(coordinates[0][0],coordinates[0][1]);
penDown();
penWidth(3);
penColor("red")
for(var i=0;i<coordinates.length;i++)
{
  moveTo(coordinates[i][0], coordinates[i][1]);
}
```

[/example]

____________________________________________________

[syntax]

### Syntax

```
var x = [1,2,3,4];
```

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable. Must begin with a letter, contain no spaces, and may contain letters, digits, - and _. |
| [1,2,3,4] | array of numbers | Yes | The initial values to the array enclosed in square brackets and separated by commas. |

[/parameters]

[returns]

### Returns
No return value. Array variable created in memory and values assigned.

[/returns]

[tips]

### Tips
- Your code will be more readable if you give your variables easy to understand variable names.  On the other hand, the longer the variable name, the more you have to type.
- Because the scope is defined in the place where the variable is created, it is important to be very careful where you create variables.  Most programmers like to create their variables at the top of a block of code (top of the file, top of a function, etc) so they are less likely to get moved around in later edits.
- Off-by-one errors are very common when referencing array elements. Always pay attention to making sure you start at zero and end one less than the length of the array.
- It is perfectly valid to have the value of an element in an array be another array.  See the "Connect the Dots" example above.
- In addition to refering to a particular item in an array using its index (list[index]), [length](/applab/docs/length), [appendItem()](/applab/docs/appendItem), [insertItem()](/applab/docs/insertItem), and [removeItem()](/applab/docs/removeItem) are available array functions.

[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]

<%= view :applab_docs_common %>
