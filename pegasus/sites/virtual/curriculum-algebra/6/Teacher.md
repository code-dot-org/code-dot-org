---
title: Defining Variables and Substitution
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg6'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Introduction](#GetStarted)  

### **Activity: Defining Variables and Substitution**  

3) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has two new and important words:<br/>

- **Define** - associate a descriptive name with a value
- **Variable** - a container for a value or expression that can be used repeatedly throughout a program

### <a name="GetStarted"></a> 2) Introduction

<img src="tri50SolidRed.png" style="float:right; padding-left: 20px; max-width: 50%;"/>
Suppose we want to make an image with fifty identical, solid red triangles. To do so you'd have to create this Evaluation Block fifty times!

Even worse, if you decided you wanted fifty blue triangles instead, you'd have to go through and change each and every block. There must be a better way!

We can store that red triangle Evaluation Block in a Variable, let's call it "red-triangle." That name "red-triangle" now becomes a shortcut for the blocks inside the variable, and we can use that shortcut over and over in our program. If we decide that we want that red triangle to be 100 pixels instead of 50, we only need to change it in the variable definition.


[tip]

# Lesson Tip
 If students have used variables in other programming languages, it's essential to note that in functional programming, as in math, variables are considered **immutable** - meaning the value can't be changed during the execution of a program. Think about it this way: saying x = 50, and then x = x + 1 might make sense in Javascript, but it's impossible in Algebra.

[/together]

[together]

## Activity: Defining Variables and Substitution
### <a name="Activity1"></a> 3) Online Puzzles

In this stage you'll use variables to reference a variety of values and expressions. Head to [CS in Algebra stage 6](http://studio.code.org/s/algebra/stage/6/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>
