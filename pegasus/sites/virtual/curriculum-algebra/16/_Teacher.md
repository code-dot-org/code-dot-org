---
title: Play Lab Booleans Big Game
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

### **Play Lab: Booleans Big Game**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game that we started in stage 7 and continued in stage 12.

When we last left our heroes (danger and target), they were moving off the screen in opposite directions.  Their functions continued to infinity and beyond! We'd actually like them to have a recurring role in this game so we need to add some conditionals to move them back to their starting points once they go off screen.

Once the students correctly implementing on-screen (and its sub-parts safe-left and safe-right), the new behavior of target and danger is once they are off the screen they return to their starting position but with a new y value.  From this new vertical position they will continue to move across the screen.  If one (or both) of the characters go off the screen and never re-appear, the most likely source of the bug is one of the newly implemented boolean statements is incorrect.

[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use Booleans to keep your player character on screen. Head to [MSM stage 16](http://studio.code.org/s/algebra/stage/16/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>