#Course F Markdown 

(all in one place for now, will be split up at horizontal lines for each level)

-----------

1. Algorithms

-----

###What is an algorithm?

Is it a green, scary, and scaly alligator? A difficult, tricky computer term?

It's actually a lot simpler than you might think. **An algorithm is just a list of steps to finish a task**. The fun thing about algorithms is that you get to decide what happens, step by step. When you write an algorithm for a computer, this is called a program. 

A program is an algorithm that has been coded into something that can be run by a machine. Today you will be writing your very own programs! 

Here is an example of a program that makes your character move forward four times:

<xml>Four move forward blocks</xml>

#### Words to Know

Algorithm

- A list of steps to finish a task

Program

* An algorithm that has been coded into something that can be run by a machine

####Up Next 

Be careful! If your steps aren't just right, some bugs might crawl their way into your program.

------

2. Debugging

------

###What is a bug?

When most people think about bugs, they think about creepy crawly things. In computer science, bugs aren't alive, but they can still be tricky.

**A bug is something that goes wrong.** It is an error in a program. When you find and fix those errors, you are **debugging** a problem. You have to practice persistence, another word for not giving up, in order to find and fix all the bugs.

Debugging is a process:

1. Recognize that there is an error in your program. 
2. Work through the program step by step to find the error.
3. Try the first step- does it work?
4. Try the second step- how about now?
5. When you find where your bug is, you can work to fix, or debug, it!

The puzzles in this lesson have already been solved for you! But not so fast- they don't seem to be working yet. Can you find all the bugs *and* fix them?

#### Words to Know

Bug

- Part of a program that does not work correctly

Debugging

- Finding and fixing problems in an algorithm or program

Persistence

- Not giving up

#### Up Next

Have you ever wanted to repeat something over and over? Ever wish there was an easy way to do that? Your wait is almost over!

------

3. Loops

------

### What is a loop?

Have you ever wanted to repeat something over and over and over again? Ever wish there was an easy way to do that? Wait no more! 

**A loop is the action of doing something over and over again.** Another word for doing something again is **repeat**.

Imagine you want your character to move forward 5 times. This would be pretty easy- just drag out 5 move forward blocks. Now, imagine you want your character to move forward 5,000 times! How long would it take you to drag out 5,000 blocks? With loops, you can make this happen with just 2 blocks:

<xml> 5,000 repeat block with move forward inside</xml>

#####Pro tip: (want this to be colored orange)

Loops are really useful for repeating patterns. It might be helpful to write out the program without any loops first, then try to find a pattern. Once you see one, stick that pattern into a `repeat` block! 

#### Words to Know

Loop

- The action of doing something over and over again

Repeat

- Do something again

#### Up Next

This might blow your mind... what would happen if you put a loop *inside another loop*?!

------

4. Nested Loops

------

### What is a nested loop?

Have you ever wondered what would happen if you put a loop *inside another loop*? It might just make you go loopy!

**A nested loop is a loop within a loop.** Think of it like an outer loop, with another loop that got all comfy and cozy and nested inside the outer loop. 

If a normal loop is good at repeating patterns, what do you think a nested loop is good at? Nested loops are great for repeating patterns of patterns, like this program for moving in a *big* square. 

<gif>Repeat 4 times, repeat move forward 10 times, turn right (gif of it running so you can see the yellow highlight moving to show order of execution)</gif>

#### Words to Know

Nested Loop

- A loop within a loop

#### Up Next

Right now, all of the code is running when you press the Run button. Have you ever wondered how you could get your character to move when something else happens?

------

6. Events

------

### What is an event?

Right now, all of the code is running when you press the Run button. What if you wanted to make different code run when something new happens? This is where events come in.

**An event is an action that causes something to happen.** Think about your favorite video game. How do you control it? It probably uses arrow keys, a controller, or even your finger. Does the game know at what time the user will press and arrow key or move the controller? No! The game only knows what to do *when* the user does something. Events help us write programs that can respond to different actions. 

Here are some examples of event blocks you will be using in this lesson:

<xml>When left arrow</xml> <xml>When actor 1 touches actor 2</xml>

#### Words to Know

Event

- An action that causes something to happen

#### Up Next

Have you ever heard the phrase "under one condition"? What does it mean? Can you think of a way this can be used in computer science?

------

8. Conditionals

------

### What is a conditional?

"The class gets five minutes of extra recess under one condition- you all have to finish your worksheets." If your teacher said this, it means that *if* everyone finishes their worksheets, then everyone gets five extra minutes of recess. 

**A *conditional* is a statement that only runs under a certain condition.** A *condition* is a statement that a program checks to see if it is true or false. If true, an action is taken. Otherwise, the action is ignored.

Conditionals are super useful in computer science. Imagine logging in to your favorite website and typing in your password. In the background, the website has to use conditionals to check *if* the password you entered matches the password it has saved for your username. *If* it matches, log in! *Else*, give the user an error. 

Here is an example of a conditional you'll be using in this lesson:

<xml> If lava ahead </xml>

#### Words to Know

Condition

- A statement that a program checks to see if it is true or false

Conditionals

* Statements that only run under certain conditions

#### Up Next

Coming your way- ways to store information in your program so you can reuse it later.

------

9. Variables

------

### What is a variable?

Imagine you are trying to write a program that adds two numbers together. It would be no fun if the program added the same two numbers together every time. If we have a way to tell the program to always add the first number to the second number, no matter what the numbers are, wouldn't that be helpful?

**A variable is a placeholder for a piece of information that can change.** Variables can be helpful when you don't know what certain information will be until you press Run and the user is interacting with your program. They can also be helpful if you have lots of places that one piece of information will be used, but the information might change someday. 

In order to use a variable, it needs a name and a value. The name never changes, but the value can. This way you can just use the name of the variable as a placeholder wherever you want in your program! Now, when the value changes, you only have to change the value in one place. Here is an example of when you would use a variable in Artist:

<xml>Set length to 100</xml><xml>Move forward by length pixels</xml>

#### Words to Know

Variable

- A placeholder for a piece of information that can change

#### Up Next

Repeat loops- but with more control.

------

12. For Loops

------

### What is a for loop?

Sometimes you might want to repeat things over and over, but also want to keep track of how many time you have repeated it already. Sometimes, you don't want to start at one and count by ones. This new kind of repeat loop will give you more control of when your loop starts, when it ends, and what it should increase by every time it runs.

**For loops are loops where you set the beginning, end, and step values.** This is what a for loop looks like in this lesson:

![](https://code.org/curriculum/course4/8/loop.png)

*For*tunately, for loops will make solving puzzles like this really easy!

<screengrab or gif>https://studio.code.org/s/coursef/stage/19/puzzle/5 puzzle </gif>

#### Words to Know

For Loop

- For loops are loops that have a predetermined beginning, end, and increment (step interval)

#### Up Next

You will get to learn how to make... drumroll please... your own blocks!

------

22. Functions

------

### What is a function?

Have you ever wanted to create your own blocks? Today is your lucky day! You will learn how to create your own blocks, and define what should happen when each block is run. 

**A function is a piece of code that you can use over and over again.** There are two different parts to a function:

1. Create a newly named block that has all of the code you want to run inside it

   <xml> gray function box with green "do something" function inside, some blue do something block inside that </xml>

2. The single green block that you can use, or "call", to run the function you created

   <xml> single green "do something" block in between two move forward blocks</xml>

Functions are really helpful in computer science because you get to define what happens when you call it, and you can call it from anywhere in your program! You can put whatever you need to inside of functions, including: loops, actions, conditionals, and sometimes even *other functions*!

Prepare to have so much fun with *fun*ctions!

#### Words to Know

Function

- A named group of programming instructions. Functions are reusable abstractions that reduce the complexity of writing and maintaining programs

#### Up Next

Functions: leveled up!

------

15. Functions with Parameters

------

### What is a parameter?

Now that you know all about functions, what if you wanted to customize it some more? Imagine that you want to create a function that will draw triangles. You want to draw lots of triangles, but in different colors. Right now, you would have to make a separate function for each different colored triangle. Parameters will help us fix this problem!

**A parameter is an extra piece of information passed to a function to customize it for a specific need.** To help us use parameters, we now have a new function editor:

<gif> function editor opening with draw triangle, color parameter </gif>

Now, when you call your function, you need to define the parameter, like this:

<gif> green draw triangle function block with color block being passed in</gif>

Have fun parading around your new tool: *para*meters!

#### Words to Know

Function

- A named group of programming instructions

Parameter

- An extra piece of information passed to a function to customize it for a specific need