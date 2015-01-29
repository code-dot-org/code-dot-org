---
title: Play Lab Animation
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

### **Activity: Play Lab Animation**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game that we started in stage 7.

[/together]

[together]

## Activity: Eval Design Recpie
### <a name="Activity1"></a> 2) Online Puzzles

 Using what you've learned about the Design Recipe and, you'll be writing functions that add animation to your game. Head to [MSM stage 12](http://studio.code.org/s/algebra/stage/12/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>