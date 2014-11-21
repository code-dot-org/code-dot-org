---
title: Eval Defining Functions
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>false, :title=> 'Eval: Defining Functions',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>45) %>

[content]

[together]

## Lesson Overview

In the past lessons students have defined Variables - containers for values that allow students to abstract out elements of their programs.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Eval Defining Functions**  

2) [Online Puzzles](#Activity1)

[/summary]

## Lesson Objectives 
### Students will:

- Decompose existing functions
- Write contracts that describe functions

[/together]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Defining a value is helpful when a program has lots of identical expressions. Sometimes, however, a program has expressions that aren’t identical, but are just very similar. A program that has fifty solid, green triangles can be simplified by defining a single value, as long as they are all the same size. But what if a program has fifty green triangles of different sizes?

Think about the Image functions you have already used, like star and circle. They take inputs and produce images. Similarly, we might want a green-triangle function that takes the size as an input and produces a green triangle. The programming language doesn’t provide this function, but it does let you define your own functions. We want to define our own function (let’s call it gt, for green triangle) that takes in a Number and produces a solid green triangle of whatever size we want.
(gt 10) would be a shortcut for (triangle 10 "solid" "green")
(gt 20) would be a shortcut for (triangle 20 "solid" "green")
(gt 1980) would be a shortcut for (triangle 1980 "solid" "green")
(gt 98) would be a shortcut for (triangle 98 "solid" "green")
and so on...

[/together]

[together]

## Activity: Eval Defining Functions
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll define simple functions. Head to [MSM stage 8](http://studio.code.org/s/msm/stage/8/puzzle/1) in Code Studio to get started programming.

[/together]


[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
