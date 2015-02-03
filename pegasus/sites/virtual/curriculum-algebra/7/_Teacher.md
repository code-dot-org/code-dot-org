---
title: Play Lab Defining Variables
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg7'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Play Lab Defining Variables**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

It's time to start working on your video game! In this stage you'll see some incomplete variable definitions for various aspects of your game - such as the character images, title, and background.

[/together]

[together]

## Activity: Play Lab Defining Variables
### <a name="Activity1"></a> 3) Online Puzzles

In this stage you'll define and modify variables to changes how some games function. Head to [MSM stage 7](http://studio.code.org/s/algebra/stage/7/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>