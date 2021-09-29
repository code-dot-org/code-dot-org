---
title: The Big Game - Booleans
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg16'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: The Big Game - Booleans**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Safe-left? Design Recipe](../docs/worksheets/safe_left.pdf) (in the student workbook)
- [Safe-right? Design Recipe](../docs/worksheets/safe_right.pdf) (in the student workbook)
- [Onscreen? Design Recipe](../docs/worksheets/onscreen.pdf) (in the student workbook)

## Getting Started

### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game that we started in stage 7 and continued in stage 12.

When we last worked on the game, our danger and target were moving off the screen in opposite directions.  Unfortunately, their update functions move them in one direction forever, so they never come back on screen once they've left! We'd actually like them to have a recurring role in this game, so we'll use some boolean logic to move them back to their starting points once they go off screen.

Once the students correctly implement [on-screen?](../docs/worksheets/onscreen.pdf) (and its sub-parts [safe-left?](../docs/worksheets/safe_left.pdf) and [safe-right?](../docs/worksheets/safe_right.pdf)), the new behavior of target and danger is that once they are off the screen they return to their starting position but with a new y-value.  From this new vertical position they will continue to move across the screen.  If one (or both) of the characters go off the screen and never reappear, the most likely source of the error is that one of the newly implemented boolean statements is incorrect.


[/together]

[together]

## Activity: The Big Game - Booleans
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use Booleans to keep your player character on screen. Head to [CS in Algebra stage 16](http://studio.code.org/s/algebra/lessons/16/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>