---
title: Eval Fast Functions
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg8'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Eval Fast Functions**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Defining a _value_ is helpful when a program has lots of identical expressions. Sometimes, however, a program has expressions that aren’t identical, but are just _very similar_. A program that has fifty solid, green triangles can be simplified by defining a single value, _as long as they are all the same size_. But what if a program has fifty green triangles of different sizes?

Think about the Image functions you have already used, like star and circle. They take inputs and produce images. Similarly, we might want a green-triangle function that takes the size as an input and produces a green triangle. The programming language doesn’t provide this function, but it does let you define your own functions. We want to define our own function (let’s call it gt, for green triangle) that takes in a Number and produces a solid green triangle of whatever size we want. For example:
<img src="gtShortcuts.png" style="width: 100%" />
and so on...

[/together]

[together]

## Activity: Eval Fast Functions
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll define simple functions. Head to [MSM stage 8](http://studio.code.org/s/algebra/stage/8/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>