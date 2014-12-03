---
title: Videogames and Coordinate Planes
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Video Games and Coordinate Planes',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>'30-60') %>

[content]

[together]

## Lesson Overview
Students discuss the components of their favorite videogames, and discover that they can be reduced to a series of coordinates. They then explore coordinates in Cartesian space, and identify the coordinates for the characters in a game at various points in time. Once they are comfortable with coordinates, they brainstorm their own games and create sample coordinate lists for different points in time in their own game.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)
2) [Learning a Language](#GetStarted)  

### **Activity: Videogames and the Coordinate Plane**

3) [Dissecting a Demo](#Activity1)  
4) [Coordinate Planes](#Activity2)  

### **Wrap-up**
5) [Flash Chat](#WrapUp) - What did we learn?  

### **Assessment**
6) [Computational Thinking Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Create a data model that describes a simple videogame
- Describe the movements of videogame characters by their change in coordinates

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep
### For the Student
- Videogame description chart

### For the Teacher
- Example Game
- Character Cutouts

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has two new and important words:<br/>

- **Apply** - use a given function on some inputs
- **Arguments** - the inputs to a function; expressions for arguments follow the name of a function

### <a name="GetStarted"></a> 2) Learning a Language
Welcome to Code.org CS in Algebra! In this course, you’ll be learning a new programming language - a way to tell computers exactly what you want them to do. Just like English, Spanish or French, a programming language has its own vocabulary and grammar that you’ll have to learn. Fortunately, the language you’ll be using here has a lot in common with simple math that you already know!

_Connect the material that’s to come with things students already know:_

- What makes a language?
- Does anyone speak a second (or third) language? Do you speak a different language than your parents/grandparents?
- Are there languages that share features in common such as a common root (Romance, Germanic) or alphabet (Latin, Cyrillic, Arabic, Kanji)?
- Are there languages that are designed for specific purposes or within certain constraints (sign language, Esperanto)?
- Programming is very much a language, with its own syntax, semantics, etc


[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Dissecting a Demo

Let’s begin by exploring a simple videogame, and then figuring out how it works. Open this link to play the game, and spend a minute or two exploring it. You can use the arrow keys to move the ninja left, right and jump - try to catch the unicorn and avoid the dragon!

This game is made up of characters, each of which has its own behavior. The unicorn moves from the right to the left, as does the dragon. The ninja only moves when you hit the arrow keys, and can move left, right, up and down. We can figure out how the game works by first understanding how each character works.

**Directions:**

> 1) Divide students into groups of 2-4.

> 2) Provide each student with a copy of the reverse-engineering table.

> 3) As students demo the game, ask them to fill in the "Thing in the game..." column with every object they see in the game.

> 4)  Discuss whith the whole group which things they came up with. All for characters? Background? Score?

> 5)  Next, for each of the things in the game, fill in the column describing what changes. Size? Movement? Value?

> 6)  Ask students to share back with the whole group. Note how students described changes - how detailed were they? What words did they use to describe movement?


### <a name="Activity2"></a> 4) Coordinate Planes

Computers use numbers to represent a character’s position onscreen, using number lines as rulers to measure the distance from the bottom-left corner of the screen. For our videogame, we will place the numberline so that the screen runs from 0 (on the left) to 640 (on the right). We can take the image of the Dragon, stick it anywhere on the line, and measure the distance back to the lefthand edge. Anyone else who knows about our number line will be able to duplicate the exact position of the Dragon, knowing only the number. What is the coordinate of the Dragon on the righthand side of the screen? The center? What coordinate would place the Dragon beyond the lefthand edge of the screen?

[tip]

# Lesson Tip

The key point for students here is precision and objectivity. There are many possible correct answers, but students should understand why any solution should be accurate and unambiguous. This requires students to propose solutions that share a common "zero" (the starting point of their number line) and direction (literally, the direction from which a character’s position is measured).

[/tip]

By adding a second number line, we can locate a character anywhere on the screen in either dimension. The first line is called the x-axis, which runs from left to right. The second line, which runs up and down, is called the y-axis. A 2-dimensional coordinate consists of both the x- and y-locations on the axes. Suppose we wanted to locate NinjaCat’s position on the screen. We can find the x-coordinate by dropping a line down from the Ninja and read the position on the number line. The y-coordinate is found by running a line to the y-axis.

A coordinate represents a single point, and an image is (by definition) many points. Some students will ask whether a character’s coordinate refers to the center of the image, or one of the corners. In this particular program, the center serves as the coordinate - but other programs may use another location. The important point in discussion with students is that there is flexibility here, as long as the convention is used consistently.

When we write down these coordinates, we always put the x before the y (just like in the alphabet!). Most of the time, you’ll see coordinates written like this: (200, 50) meaning that the x-coordinate is 200 and the y-coordinate is 50.

Depending on how a character moves, their position might change only along the x-axis, only along the y-axis, or both. Look back to the table you made. Can the Ninja move up and down in the game? Can he move left and right? So what’s changing: his x-coordinate, his y-coordinate, or both? What about the clouds? Do they move up and down? Left and right? Both?
 
Fill in the rest of the table, identifying what is changing for each of your characters.

[/together]

[together]

## Wrap-up
### <a name="WrapUp"></a> 5) Brainstorming for a Game

Use the [game planning template](needatemplate.pdf) for you to make your own game. Just like we made a list of everything in the Ninja game, we’re going to start with a list of everything in your game.
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

## Assessment
### <a name="Assessment"></a>6) Videogames and Coordinate Planes Assessment

Visit [MSM Stage 1](http://studio.code.org/s/msm/stage/1/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
