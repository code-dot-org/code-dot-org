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



[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use collision detection logic so that you know when your player is touching the target or the danger. Head to [MSM stage 20](http://studio.code.org/s/algebra/stage/20/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>