<link rel="stylesheet" type="text/css" href="https://staging.code.org/curriculum/docs/web/k5online.css">

# Unit 3 Content Overview


## Chunk 3 Concepts: Introduction to Variables and Strings 

Variables are one way we control the computer’s memory in a program. They can store different types of data, including numbers (which is what we’ll look at in these early lessons).  In fact, we can do more than just store numbers for later use - we can actually do calculations and use the value stored in a variable to help make decisions!
<br><br>
By introducing variables into an app, we can begin to keep track of how many times a particular action occurs. For example, we could keep track of how many times a button is clicked by setting up a counter variable and increasing the value by one each time the button event handler is run. Students learn here that the value of a variable can change as the game is played, and you can even perform different actions based on the value of the variable. In this lesson we use a **very simple if-statement** to check to see if a particular score threshold has been reached to end the game (for example: you might win the game after accruing 25 points). 
<br>

**CS Concepts:** What are variables and how are they used? 

- **Variables** can be used in a program to store information like numeric values 
- Variables can be used to store the value returned by a function (for example: randomNumber, promptNum), values inputted by the user, specific values set manually in the code (for example: x = 5), or the result of an operation carried out in the program (for example x = 5+7) 
- The value stored in a variable can change, or be **reassigned**, as the program runs 
- The data stored in a variable is available in different parts of the program depending on where the variable is declared (this is called **scope**)
- In programming a variable is assigned a value using the “**=**“ operator
- In programming we evaluate an equality using the “**==**“ operator 
- Simple if-statements (or **conditionals**) can be used to make your program behave differently given different conditions

**CS Concepts:** What are strings and how are they used? 

- **Strings** are a data type made up of a sequence of ASCII characters 
- Variables can be assigned strings
- Strings can be **manipulated** in a program to generate **dynamic output**

<hr />

## Chunk 4 Concepts: Introduction to Conditionals


Conditional logic is particularly useful for situations where we want to compare the current state of a variable or other element to some value and execute particular code depending on the state. For example, we might construct a tree of possible states and associated outcomes for the current weather if we were trying to determine what we need to leave the house in the morning. A few possible states of weather could be sunny, raining, or snowing, and the associated outcomes we want to plan for might be to wear sun glasses,  bring an umbrella, or wear a heavy coat. The more you work with conditionals, the more you’ll notice that we use conditional logic in real life all of the time!
<br><br>
Conditionals in their simplest form are just a structure to say IF this is true, THEN perform that action (if it is sunny outside, bring sunglasses). From the basic **if-statement** we build up to the **if/else statement** which says IF this is true, THEN perform that action, OTHERWISE perform a different action. We can then combine conditional statements together to implement more sophisticated circumstances for executing the code, including **chained conditionals** (using multiple if/else statements in sequence), **nested conditionals** (putting if/else statements inside other if/else branches, so the internal statement is only evaluated if the first condition is true), and **compound conditionals** (a conditional based on more than one statement evaluating to true). 
<br><br>
##### Conditionals VS Events
Notice that conditionals and events both serve to control the flow of the program, but they function differently when the program is run. 
<br>

- Events are used when we want to monitor for a particular action ALL OF THE TIME
- Conditionals are only evaluated when they’re executed in the code. This means you have to actively check a conditional statement in order to evaluate it. 

Luckily you can write code that uses both events and conditionals!

<br>
**CS Concepts:** 

- **Natural Language Processor (NLP) algorithms** are used to parse things humans say and write in order to make that information usable in a program. We use tools built on NLP algorithms when we use voice-activated digital assistants like Siri and Cortana.
- NLP algorithms use **keywords** as markers to determine what the user is looking for

**CS Concepts:** 

- **Conditional statements** (or if-statements) can be mapped out using flow charts
- Different **boolean operators** can be used in a program to implement decision logic
- Multiple conditionals can be used together to carry out decision logic. Two methods of mapping out conditional branches are **chained conditionals** and **nested conditionals**  
- If a function returns a boolean value (true or false, 0 or 1), that return value can be used in place of a boolean expression to control the decision logic in a conditional
- When we evaluate more than one condition in an if-statement (for example: if(itsRaining AND itsCold)) it’s called a **compound conditional**

<hr />

## Chunk 5 Concepts: Introduction to Loops and Arrays

Students have used **for loops** already but only as simple "repeat loops" - we controlled the syntax of the code block so students only had to type in the number of times they wanted the loop to repeat.  In this chunk we break down what's happening with all the parts of the for-loop statement. 
<br><br>
A **while loop** is a more general looping structure that runs as long as some supplied condition is `true`.  For example, while it’s raining outside, you will wear a raincoat.  Or "while I haven't rolled a 2 or 12, keep rolling the dice".  While loops are useful when you encounter situations when you want to repeat a block of code but you're not sure how long or how many times you need to repeat - instead you simply want to keep going as long as something is true.
<br><br>
**Arrays** are a data type that can store *multiple values* at the same time in *one variable*— in other words, arrays are lists of items. This is useful for situations where a program is keeping track of many pieces of data, but it would get tedious for the programmer to assign each value to a different variable. 
<br>
**CS Concepts:** 

- **While Loops** are a way for us to easily represent a process made up of ***many repeated steps***. 
- Flow charts can be used to represent the logic used with a while loop. 
- Loops can help us write programs that **simulate an experiment** that has a lot of data points (for example: flipping a coin 10,000 times)

**CS Concepts:** 

- An **array** is a data type that is very useful when writing a program that has a list of items that need to be stored. Without arrays, each items would need to be stored in its own variable, which means as the list grows the number of variables needed grows. An array allows us to store the whole list, or collection of elements, in one place. 
- The contents of an array can change as the program runs.

**CS Concepts:** 

- Looping over arrays to process their values (search, find min, find max)
- Writing functions that return values
- Using arrays in a novel way in an app
- Employing mathematical concepts in a program
- Developing a "complex" algorithm
