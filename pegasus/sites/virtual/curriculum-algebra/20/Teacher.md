---
title: The Big Game - Collision Detection
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg20'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: The Big Game - Collision Detection**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Line-length Design Recipe](../docs/worksheets/line_length.pdf) (in the student workbook)
- [Distance Design Recipe](../docs/worksheets/distance.pdf) (in the student workbook)
- [Collide? Design Recipe](../docs/worksheets/collide.pdf) (in the student workbook)

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game from stages 7, 12, and 16.

Previous work with the game has created movement for the danger and target characters, using Booleans to check if they have left the screen. The last time students worked on their game they used a conditional to check which key was pressed and make the player move accordingly. At this point the only thing left to do is to decide when the player is touching either the target or danger. Once students have successfully completed the **distance** and **collide?** functions, their score will increase when the player touches the target, and decrease when it touches the danger.

The Pythagorean Theorem studied in the last lesson will be used to determine when the characters have made contact. Students are not required to write their own [line-length](../docs/worksheets/line_length.pdf) function, but you may ask them to complete the Design Recipe for it anyway.

Students will first complete the [distance](../docs/worksheets/distance.pdf) function so that it measures the distance between two points, (px, py) and (cx, cy). After the students implement the distance formula, they will need to implement the  tests in the [collide?](../docs/worksheets/collide.pdf) function.

Once these last functions are put into place, scoring will automatically update based on collisions between target and danger.

[/together]

[together]

## Activity: The Big Game - Collision Detection
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use collision detection logic so that you know when your player is touching the target or the danger. Head to [CS in Algebra stage 20](http://studio.code.org/s/algebra/lessons/20/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>