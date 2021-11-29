---
title: The Big Game - Animation
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg12'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: The Big Game - Animation**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Update-target Design Recipe](../docs/worksheets/update_target.pdf) (in the student workbook)
- [Update-danger Design Recipe](../docs/worksheets/update_danger.pdf) (in the student workbook)

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game that we started in stage 7.

The primary goal here is to get the _target_ (starting in the upper left) to travel from left to right and the _danger_ (starting in the lower right) to travel from right to left.  This is accomplished in the update-target and update-danger blocks by changing the output of the function from its current default value of an unchanging x to some value relative to x.

Similar to the rocket-height puzzle, the update-target and update-danger functions are executed in order about every 10th of a second, to create the flip-book effect of movement.  Each time these updates are executed, the functions take the CURRENT x coordinate as input and then return a new x coordinate such that the image's position changes.  For each new execution of the update, the x coordinate set by the previous execution becomes the starting point.

One new thing the students should notice is that their modifications from stage 7 should still be in place.  The Big Game will save a file for each student, and each level that they work on will benefit from the the changes made in previous levels.  This means that it is very important that every student gets each Big Game level working correctly before moving on to the next stage.

It should also be noted that if a student returns to a previous level, or even a previous stage, that the MOST RECENT changes which they made will be the ones that they will see.  Backing up to a previous level does NOT restore the previous state of the student's Big Game. Students are always looking at their most recent changes no matter which puzzle they are in. 


[tip]

# Lesson Tip

A contract can be quite long and often scrolls off the screen.  To make dragging into the Definition area easier, consider collapsing the "1. Contract" and "2. Examples" areas by clicking on the arrow to the left of them.

[/tip]

[/together]

[together]

## Activity: The Big Game - Animation
### <a name="Activity1"></a> 2) Online Puzzles

 Using what you've learned about the Design Recipe you'll be writing functions that add animation to your game. Head to [CS in Algebra stage 12](http://studio.code.org/s/algebra/lessons/12/levels/1) in Code Studio to get started programming.  Note that when you click run, the title and subtitle will display for about 5 seconds before the other functions start.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>
