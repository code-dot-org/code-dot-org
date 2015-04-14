---
title: App Lab Docs
---

[name]

## Declare a variable assigned to an array

[/name]


[category]

Category: Variables

[/category]

[description]

[short_description]

Declares a variable and assigns it to an array with the given initial values.  

[/short_description]

Variables are simply names you use to refer to stored values in your code.  You can name your variables whatever you want so long as the name is not already used by the system.  Variable names can not have spaces or special characters.  In practice, it is helpful to name your variables in a way that describes the value they store.  For instance, if the variable you create is to store a person's name you might name that variable personName.

Where you declare the variable defines the variable's "scope".  Scope refers to which blocks of code can access that variable by name.  For instance, if you create a variable inside a function, that variable name can only be accessed inside that function.  

With this type of assignment, the variable is assigned to an array of values.  The brackets denote the start and end of the array and the commas delimit the array values.  

Note that the first element in an array is has index 0 and the second had index 1 and so on.  

Also note that it is perfectly valid to have the value of an element in an array be another array.  See the "plot your path" example below.
[/description]

### Examples
____________________________________________________

[example]

<pre>
// flip a coin
var coinFaces = ["heads","tails"];
var myFlip = randomNumber(1);
console.log("You flipped " + coinFaces[myFlip]);
</pre>

[/example]

____________________________________________________

[example]

<pre>
// pick a prime
var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
var numberEndings = ["st","nd","rd","th","th","th","th","th","th","th"];
var myPick = prompt("Which of the first 10 prime numbers do you want");
if(myPick <= 10)
{
   console.log("The " + myPick + numberEndings[myPick-1] + " prime is " + primes[myPick-1]);
}
else
{
  console.log("I don't know the " + myPick + "th Prime");
}
</pre>

[/example]

____________________________________________________

[example]

<pre>
// plot your path
var coordinates = [[10,10], [100,10], [100,100], [10,100], [10,10]];
penUp();
moveTo(coordinates[0][0],coordinates[0][1]);
penDown();
penWidth(3);
penColor("red")
for(var i=0;i<5;i++)
{
  moveTo(coordinates[i][0], coordinates[i][1]);
}


</pre>

[/example]

____________________________________________________

[syntax]

### Syntax
<pre>
var x = [1,2,3,4];
</pre>

[/syntax]

[parameters]

### Parameters

| Name  | Type | Required? | Description |
|-----------------|------|-----------|-------------|
| x | variable name | Yes | The name you will use in the program to reference the variable  |
| [1,2,3,4] | array | Yes | The initial values to the array  |

[/parameters]

[returns]

### Returns
No return value.

[/returns]

[tips]

### Tips
- Your code will be more readable if you give your variables easy to understand variable names.  On the other hand, the longer the variable name, the more you have to type.
- Don't hesitate to rename a variable if you decide you don't like the name, better to have it be an accurate name so that future programmers in that code know what it means.  Because of this, often when writing code, you'll end up wanting to rename a variable using search and replace.  If you name one variable "square" and another named "squareWidth", if you have to do a search and replace on "square" to name it "fancySquare", search and replace will also name squareWidth to "fancySquareWidth".  This is one reason some programmers hate using one letter variable names like "i" or "x".  
- Because the scope is defined in the place where the variable is created, it is important to be very careful where you create variables.  Most programmers like to create their variables at the top of a block of code (top of the file, top of a function, etc) so they are less likely to get moved around in later edits.  
- Off-by-one errors are very common when referencing array elements. Always pay attention to making sure you start at zero and end one less than the length of the array.  


[/tips]

[bug]

Found a bug in the documentation? Let us know at documentation@code.org

[/bug]
