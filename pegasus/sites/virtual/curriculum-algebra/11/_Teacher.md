---
title: Eval Design Recipe
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

### **Activity: Eval Design Recipe**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction


[/together]

[together]

## Activity: Eval Design Recipe
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll use the Design Recipe to create functions that solve word problems. Head to [MSM stage 11](http://studio.code.org/s/algebra/stage/11/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>