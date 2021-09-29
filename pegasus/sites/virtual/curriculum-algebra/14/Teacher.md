---
title: Boolean Operators
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg14'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Boolean Operators**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Creating some sample boolean expressions - both simple and complex - is an excellent warm-up activity before the puzzle stages.  Some examples have been included in the slide deck.  The slide deck also has extra practice related to expressions that the students will have seen in the puzzles.

[/together]

[together]

## Activity: Boolean Operators
### <a name="Activity1"></a> 2) Online Puzzles

Head to [CS in Algebra stage 14](http://studio.code.org/s/algebra/lessons/14/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>