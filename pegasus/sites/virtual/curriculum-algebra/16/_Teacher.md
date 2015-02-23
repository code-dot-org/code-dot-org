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

In addition, we'd like to get our main character into the action.  We need to connect the main characters activity to key events.  The students can customize their movements to any keys but the suggested keys are the right, up, left, and down arrow keys (with key codes 37-40).  If the main character is not responding, two scenarios are good to trouble shoot: 1) What key is designated compared to what the student is pressing and 2) what action results from this key press (is the character location changing or still just x?)?

[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use Booleans to keep your player character on screen. Head to [MSM stage 16](http://studio.code.org/s/algebra/stage/16/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>