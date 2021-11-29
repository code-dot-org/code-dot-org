---
title: Solving Word Problems with the Design Recipe
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg11'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Solving Word Problems with the Design Recipe**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started

### <a name="GetStarted"></a> 1) Introduction

The students will do lots of dragging and dropping as they fill in the missing pieces of different parts of various contracts.  It should be noted that the examples must be filled in completely.  The error message when the example is incomplete is "You have a block with an unfilled input."

[/together]


[together]

## Activity: Solving Word Problems with the Design Recipe
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll use the Design Recipe to create functions that solve word problems. Head to [CS in Algebra stage 11](http://studio.code.org/s/algebra/lessons/11/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>