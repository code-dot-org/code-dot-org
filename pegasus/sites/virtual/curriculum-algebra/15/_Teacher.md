---
title: Play Lab Booleans
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg15'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Play Lab: Booleans**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction
The functions being built for Sam the Bat are tied to his positioning.  When these functions evaluate as true, he can fly.  When these function evaluate as false, he is repositioned back to the last spot that had a “true” position. 

The students will incrementally check Sam's right, left, up, and down positions.  The final puzzle is the culmination of all of these Boolean functions in one grand complex evaluation.

[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

Using Boolean logic, you're going to write functions to help make sure Sam the Bat doesn't leave his mom's yard. Head to [MSM stage 15](http://studio.code.org/s/algebra/stage/15/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>