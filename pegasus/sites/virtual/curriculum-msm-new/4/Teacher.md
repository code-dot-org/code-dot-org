---
title: Contracts
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Contracts',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>25) %>

[content]

[together]

## Lesson Overview
Contracts provide a way for students to better understand and discuss functions. Through this lesson students will look at known functions and come up with the contracts that describe those functions.

[summary]

## Teaching Summary
### **Getting Started** - 15 minutes
 
1) [Vocabulary](#Vocab)
2) [Figuring it Out](#GetStarted)  

### **Activity: Videogames and the Coordinate Plane** - 25  minutes  

3) [Dissecting a Demo](#Activity1)  
4) [Coordinate Planes](#Activity2)  

### **Wrap-up** - 10  minutes 
5) [Flash Chat](#WrapUp) - What did we learn?  

### **Assessment** - 5  minutes 
6) [Computational Thinking Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Describe a function in terms of its name, domain, and range
- Create contracts for arithmetic and image-producing functions

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep
### For the Student
- Contract Sheet

[/together]

[together]

## Getting Started (15 min)


### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>

- **Contract** - a statement of the name, domain, and range of a function
- **Domain** - the type of data that a function expects
- **Range** - the type of data that a function produces

### <a name="GetStarted"></a> 2) Figuring it Out

You’ve already seen several functions that take in two Numbers, such as +, and -. On the other hand, the function "star" takes in a Number and two Strings. Different functions take in different inputs, and we need a way to keep track of the requirements for each function. The Domain of a function is the data that the function expects. 

**The Domain of a function is the data that the function expects.**

By keeping a list of all the functions in a language, and their Domains, programmers can easily look up how each function is used. However, it’s also important to keep track of what each function produces! For example, a program wouldn’t use "star" if they were trying to produce a Number, because star only produces Images. 

**The Range of a function is the data that the function produces.**


[/together]

[together]

## Activities: (25 min)
### <a name="Activity1"></a> 3) Dissecting a Demo

Let’s begin by exploring a simple videogame, and then figuring out how it works. Open this link to play the game, and spend a minute or two exploring it. You can use the arrow keys to move the cat left, right and jump - try to catch the ruby and avoid the dog!

This game is made up of characters, each of which has its own behavior. The Ruby moves from the right to the left, as does the Dog. NinjaCat only moves when you hit the arrow keys, and she can move left, right, up and down. We can figure out how the game works by first understanding how each character works.

**Directions:**

> 1) Divide students into groups of 2-4.

> 2) Provide each student with a copy of the reverse-engineering table.

> 3) As students demo the game, ask them to fill in the "Thing in the game..." column with every object they see in the game.

> 4)  Discuss whith the whole group which things they came up with. All for characters? Background? Score?

> 5)  Next, for each of the things in the game, fill in the column describing what changes. Size? Movement? Value?

> 6)  Ask students to share back with the whole group. Note how students described changes - how detailed were they? What words did they use to describe movement?


### <a name="Activity2"></a> 4) Coordinate Planes

Computers use numbers to represent a character’s position onscreen, using number lines as rulers to measure the distance from the bottom-left corner of the screen. For our videogame, we will place the numberline so that the screen runs from 0 (on the left) to 640 (on the right). We can take the image of the Dog, stick it anywhere on the line, and measure the distance back to the lefthand edge. Anyone else who knows about our number line will be able to duplicate the exact position of the Dog, knowing only the number. What is the coordinate of the Dog on the righthand side of the screen? The center? What coordinate would place the Dog beyond the lefthand edge of the screen?

The key point for students here is precision and objectivity. There are many possible correct answers, but students should understand why any solution should be accurate and unambiguous. This requires students to propose solutions that share a common "zero" (the starting point of their number line) and direction (literally, the direction from which a character’s position is measured).

By adding a second number line, we can locate a character anywhere on the screen in either dimension. The first line is called the x-axis, which runs from left to right. The second line, which runs up and down, is called the y-axis. A 2-dimensional coordinate consists of both the x- and y-locations on the axes. Suppose we wanted to locate NinjaCat’s position on the screen. We can find the x-coordinate by dropping a line down from NinjaCat and read the position on the number line. The y-coordinate is found by running a line to the y-axis.

A coordinate represents a single point, and an image is (by definition) many points. Some students will ask whether a character’s coordinate refers to the center of the image, or one of the corners. In this particular program, the center serves as the coordinate - but other programs may use another location. The important point in discussion with students is that there is flexibility here, as long as the convention is used consistently.

When we write down these coordinates, we always put the x before the y (just like in the alphabet!). Most of the time, you’ll see coordinates written like this: (200, 50) meaning that the x-coordinate is 200 and the y-coordinate is 50.

Depending on how a character moves, their position might change only along the x-axis, only along the y-axis, or both. Look back to the table you wrote in the workbook (Page 2). Can NinjaCat move up and down in the game? Can she move left and right? So what’s changing: her x-coordinate, her y-coordinate, or both? What about the clouds? Do they move up and down? Left and right? Both?
 
Fill in the rest of the table, identifying what is changing for each of your characters.

[/together]

[together]

## Wrap-up (5 min)
### <a name="WrapUp"></a> 5) Brainstorming for a Game

Use the [game planning template](needatemplate.pdf) for you to make your own game. Just like we made a list of everything in the NinjaCat game, we’re going to start with a list of everything in your game.
To start, your game will have with four things in it:

- A Background, such as a forest, a city, space, etc.
- A Player, who can move when the user hits a key.
- A Target, which flies from the right to the left, and gives the player points for hitting it.
- A Danger, which flies from the right to the left, which the player must avoid.

[tip]

# Lesson Tip  

The structure of your students' games will very closely resemble the demo they've just played. Many students will want to reach for the stars and design the next Halo. Remind them that major games like that take massive teams many years to build. Some of the most fun and enduring games are built on very simple mechanics (think Pacman, Tetris, or even Flappy Bird).

[/tip]

[/together]

[together]

## Assessment (5 min)
### <a name="Assessment"></a>6) Videogames and Coordinate Planes Assessment

Visit [MSM Stage 1](http://studio.code.org/s/msm/stage/1/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
