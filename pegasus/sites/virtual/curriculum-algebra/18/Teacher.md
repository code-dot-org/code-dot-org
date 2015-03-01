---
title: Conditionals
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

### **Activity: Conditionals**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Remind students of the game they played in the last stage, what were some of the tricky elements of constructing a good conditional statement?

- Order matters (the first condition in the list to return true wins!).
- Write clear and explicit conditions.
- Use the else clause as a catch all for conditions that you don't expect or can't write explicit conditions for.
- All conditionals must have at least on condition and an else statment, you can add or remove further condition as using the blue buttons.

<img src="conditional.png" style="max-width: 100%; min-width: 300px"/>

[/together]

[together]

## Activity: Conditionals
### <a name="Activity1"></a> 2) Online Puzzles

Head to [MSM stage 18](http://studio.code.org/s/algebra/stage/18/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>