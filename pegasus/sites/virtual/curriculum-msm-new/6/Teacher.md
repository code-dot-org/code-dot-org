---
title: Calc Defining Variables
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unittitle=> 'MSM', :lesson=> 6, :unplugged=>false, :title=> 'Calc: Defining Variables',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>('30-60')) %>

[content]

[together]

## Lesson Overview

In this plugged activity, students will learn to define variables that store values and expressions that can be used repeatedly throughout a program. It's important to note that in some programming languages variables are consider mutable, in that their value can be changed throughout the running of the programming. In Evaluation Blocks, as in Algebra, variables are considered immutable - the value of a variable cannot be modified during the excecution of the program.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Introduction](#GetStarted)  

### **Activity: Calc Defining Variables**  

3) [Online Puzzles](#Activity1)

[/summary]

## Lesson Objectives 
### Students will:

- Decompose existing functions
- Write contracts that describe functions

[/together]

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

We can store that red triangle Evaluation Block in a Variable, let's call it "red_triangle." That name "red_triangle" now becomes a shortcut for the blocks inside the variable, and we can use that shortcut over and over in our program. If we decide that we want that red triangle to be 100 pixels instead of 50, we only need to change it in the variable definition!

[tip]

# Lesson Tip
 If students have used variables in other languages
It's really imporant to note that in functional programming, variables are considered immutable - meaning the value can't be changed during the execuation of a program. Think about it this way: x = x + 1 might make sense in Javascript, but it's impossible in Algebra.

[/together]

[together]

## Activity: Eval Writing Contracts
### <a name="Activity1"></a> 3) Online Puzzles

In this stage you'll create some Variables to store a variety of values and expressions. Head to [MSM stage 6](http://studio.code.org/s/msm/stage/6/puzzle/1) in Code Studio to get started programming.

[/together]


[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
