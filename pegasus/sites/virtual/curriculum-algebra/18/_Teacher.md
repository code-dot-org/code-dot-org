---
title: Eval Conditionals
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg18'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Eval: Conditionals**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction



[/together]

[together]

## Activity: Eval Conditionals
### <a name="Activity1"></a> 2) Online Puzzles

Head to [MSM stage 18](http://studio.code.org/s/algebra/stage/18/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>