---
title: Play Lab Collision Detection Big Game
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

### **Play Lab: Collision Decection Big Game**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game from stages 7, 12, and 16.

Previous work with the game has created movement for both the main character and the danger and target characters.  Conditional statements have been added to ensure the characters all stay on the screen.  The last step being added now is to reward for making contact with target and to penalize for making contact with danger.

The Pythagorean Theorem studied in the last lesson will be used to determine when the characters have made contact.  A key point of trouble shooting will be getting this expression correct as constructing it in the drag and drop system is somewhat prone to errors.

[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use collision detection logic so that you know when your player is touching the target or the danger. Head to [MSM stage 20](http://studio.code.org/s/algebra/stage/20/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>