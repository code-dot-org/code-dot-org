---
title: Play Lab Design Recipe
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg10'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Play Lab Design Recipe**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Functions are a key part of animation in computer programs. A function that draws a static picture of a bat, for example, can place the bat at a different location based on the input. When that input changes slightly based on time or user-interaction, the bat will appear to move. This is similar to the way that flip-book animations work, in which each page draws a static image that has changed by a small amount. When the pages are displayed quickly, the images appear to change smoothly.

<img src="bat_spritesheet.png" style="width: 100%" />

Putting these images together, we arrive at an animation of the bat turning around.

<img src="bat_animated_fast.gif" style="display: block; margin: 0 auto;"/>

[/together]

[together]

## Activity: Play Lab Design Recipe
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll write functions that manipulate images to create animations. Head to [MSM stage 10](http://studio.code.org/s/algebra/stage/10/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>