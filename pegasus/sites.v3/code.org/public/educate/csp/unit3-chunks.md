<link rel="stylesheet" type="text/css" href="https://staging.code.org/curriculum/docs/web/k5online.css">


# Unit 3 Chunk Overview


## Chunk 3 Overview: Introduction to Variables and Strings 

<br/>
<img src="https://images.code.org/bc6a9eaac1db12b04e71f1fc2fa3e2ab-image-1446414947705.png" width="550" style="float:right; margin-left:30px">

#### Content Overview

In the previous two chunks, students explored functions and event-driven programming. The third chunk picks up after students have created their own games that respond to the mouse, and introduces the concept of **variables** in the form a score tracker in a game. 
<br><br>
Once students have some experience with variables as numbers, they learn about **Strings**, which are another data type we use often in programming. Students focus on collecting string input from the user, storing that input in a variable, and combining (or concatenating) the different strings into one string. The use of concatenation gives students the ability to write programs that combine the user input with pre-written strings that are already defined in the program (for example: the program might ask the user to input a name, then customize messages with the user’s name.)
<br><br>

#### What it looks like
<img src="https://images.code.org/177fb6b67dc1a09d0e30a6f6c800b0b3-image-1446470853676.gif" width=“175px” style="float:left; margin-right:30px">

In this chunk of lessons students work on two projects— the first one helps introduce variables in a way that’s based on the popular genre of apps generally called “clicker games”. Clicker games are a genre where the user clicks some item on the screen and gets points for each time they successfully click the the item. Sometimes the player loses points or lives if they don’t click the right thing on the screen. In this project, students will create an app with 4 screens (welcome, main game, win screen, lose screen), they will keep track of how many times the item is successfully clicked (these are the user’s points), and how many times the user clicks the wrong thing (this action costs lives). Check out this behavior in the demo app on the left. 

<img src="https://images.code.org/c0906418ae1dfacbf550c3b901fb794e-image-1446471147148.gif" width=“175px” style="float:right; margin-left:30px">

<br>
The second App students build in this chunk is focused on teaching how to use strings, which is another type of variable that can be implemented in JavaScript programs. This project is based on Mad Libs, which prompts users to input a word that is a specific part of speech, and puts the users' input into a pre-written statement to make a silly phrase. In this project students learn how to concatenate, or join together, two strings. Check out a demo app on the right. 
<br><br>

##### Introduction to Variables
In these two lessons, students learn how to use variables to control the computer’s memory and implement a simple if-statement to control the program flow based on the value of the variables. **Note that students learn about conditional statements in much more detail in the next chunk of lessons, and we’re looking here at conditionals as a way to talk about the differences between assigning a value to a variable and checking to see if a variable currently contains a particular value.** This is the difference between the `=` operator and the `==` operator. The key pieces here are understanding that when a variable is assigned a value, we say the the variables GETS the value and we use the = operator (for example: `x = 5;` assigns the value of 5 to the variable x). When we want to check to see if the current value of a variable is some particular value, we use the == operator (for example: `x == 10;` is a boolean expression that will evaluate to true if x is currently 10, and otherwise will evaluate to false).

<br>
##### User Interaction and Data Types
In this lesson students develop a program that collects string input from the user and drops that input into a Mad Libs-style game. The focus of this lesson is to teach how to store string values for later use in a program, and how to concatenate strings. 

<br>

<hr />


## Chunk 4 Overview: Introduction to Conditionals

<br/>
<img src="https://images.code.org/0db2fa9734b360e15d1844ee80f4001e-image-1446419997098.png" width="550" style="float:left; margin-right:30px">

#### Content Overview
In the preceding chunks, students learned about functions, events, and controlling the computer’s memory with variables. The focus of this unit is **conditional statements**, which are used to control the program flow. Conditionals are used in programs to construct trees of possible scenarios and associated outcomes that are executed at runtime based on how a *conditional statement* evaluates. 
<br><br>
This is a new paradigm for the programs we’re writing in this unit. In the first chunk of lessons, every line of code was executed, starting at the top and going to the bottom. In the second chunk of lessons the flow of the program was structured through events, and the outcomes were controlled at runtime based on the events that were triggered (mouse clicks, button presses, etc.). The code associated with each of these events would run *any time* the event occurred. Now, with conditionals, we have another way to control the program flow that merges the sequential execution we saw in chunk one with the multiple-possible-outcome structure we see with events. 
<br>
<img src="https://images.code.org/53a46fef1ba05ece7e22a97ad23b52cd-image-1446469166375.gif" width="150" style="float:right; margin-left:30px">

#### What it looks like
There are 5 lessons in this chunk, which build up to a culminating project where students build a “digital assistant” for the topic of their choice, which functions like siri or cortana to programmatically provide answers to questions that are stated in natural human language. For example, students might make a digital assistant that answers questions about movies or music. 
<br>
This project leverages conditionals because students will need to be able to parse the human language that the questions are asked in. This is done here by looking for keywords, and giving answers based on the keywords present in the question. 
<br>
##### Intelligent Text Processing
This one-lesson introduction to the chunk serves provide background about natural language processing (NLP) and give students time to explore tools that use NLP and learn more about how they work. 
<br>
##### Introduction to Conditionals
In these 4 lessons students move through making small programs that use conditionals. After several skill-building lessons to become comfortable with chained, nested, and compound conditionals, students use each of these types of conditionals to create a digital assistant that can answer questions about the topic of their choice. 
<br>

<hr />

## Chunk 5 Overview: Introduction to Loops and Arrays

<br/>
<img src="https://images.code.org/bdea1a079f63a4e55d6ef30efa9d47fe-image-1448049415486.56.04 AM.png" width="550" style="float:right; margin-left:30px">
#### Content Overview
So far in this unit students have learned about functions, how to program with events, use variables, and how to use conditionals to control the flow of a program. In the final instructional chunk of unit 3, students learn about **while loops** and go into more depth with **for loops**, **arrays** and how to **write functions that return values.**
<br><br>

#### What it looks like
This chunk starts with structured activities to motivate the concepts of loops and arrays, and then builds up to an open-ended project where students manipulate pixels on the app's screen. 

##### Introduction to While Loops
Earlier in the unit, students use for loops to simply repeat lines of code some number of times. In this chunk of lessons students are introduced to the `while` loop, which builds on the work they’ve just done with conditionals, but now rather than executing a piece of code one time when the condition is true, the code is repeated until the condition becomes false. 

##### Introduction to Arrays
Arrays are effectively lists of values.  As students are generating more data in their programs and need to store more and more information, the prospect of creating individual variables for each piece of data becomes less appealing and harder to keep track of. 

In these lessons, students learn how to construct an array to use as a list in a program, and add, remove and insert items into the list.  They build a simple app that stores text or image information in an array that can be controlled by and displayed to the user.

##### Processing Arrays and Functions with return values
This chunk ends with a three-lesson sequence where students learn how to use and control `for` loops to iterate over an array of values.   
<br>
Many common techniques in programming involving writing loops that read, write, or compute things on lists (arrays) of data.  We introduce students to some of the classic algorithms of array processing: linear search, counting items in an array, finding the smallest or largest value in a list.
<br>
We then briefly re-visit functions and learn to create functions that `return` values.  Students have used many functions that return values in programs so far (randomNumber, getText, includes, etc.) but they have never written their own function that returns a value.  We have students practice writing small functions that accept input, calculate something and return a value.  These functions will be useful in the final project of the unit.
<br>
In the last lesson, students bring it all together in making a drawing app (using the **canvas** UI element) that tracks the user's mouse moves in an array, so that after the drawing is completed, different effects can be applied to the drawing by processing the array of mouse locations.  Students manage the complexity of this task by writing functions that return values to handle some of the more complex mathematical calculations.

