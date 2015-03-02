---
title: Strings and Images
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg3'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Introduction](#GetStarted)  

### **Activity: Strings and Images**  

3) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has four new and important words:<br/>

- **String** - any sequence of characters between quotation marks (examples: "hello", "42", "this is a string!")
- **Image** - a type of data for pictures
- **Type** - refers to a general kind of data, like Number, String, Image, or Boolean

### <a name="GetStarted"></a> 2) Introduction

In the previous stage, you only worked with a single type of value - Numbers. In this next stage you'll get a chance to write programs that with new data types to output text (Strings) and pictures (Images). Students should see Strings as an analog to Numbers: a different type of value, but one that is still a simple program that evaluates to itself and can be passed as an argument to a function. Note that the Number 42 and the String "42" are different values! You could add the Number 42 to another number, but you cannot add the String "42" to another number.

[/together]

[together]

## Activity: Strings and Images
### <a name="Activity1"></a> 3) Online Puzzles

In this activity you'll use the new data types String and Image to compose art with Blocks of Evaluation - head to [MSM Stage 3](http://studio.code.org/s/algebra/stage/3/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>