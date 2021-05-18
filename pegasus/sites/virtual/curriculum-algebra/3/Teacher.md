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

In the previous stage, students only worked with a single type of value - Numbers. In this next stage they will get a chance to write programs with new data types to output text (Strings) and pictures (Images).

<img src="purplestar.png" class="right-img" />

Show students the 'star' function, and ask them to discuss the following questions:

- What is the name of this function?
- How many arguments are being given to this function?
- What do you think this function will do?

Students are not expected to know all the answers here - the goal is for them to apply what they know about Evaluation Blocks to a novel expression, and discuss for themselves what they think it might mean. Ask them to justify their answers, and to explain why they think they are correct. Encourage students to look for patterns among these new blocks (such as colors, or quotation marks around the words "solid" and "purple" - what might those patterns mean?

[/together]


[together]

## Activity: Strings and Images
### <a name="Activity1"></a> 3) Online Puzzles

In this activity you'll use the new data types String and Image to compose art with Blocks of Evaluation - head to [CS in Algebra Stage 3](http://studio.code.org/s/algebra/lessons/3/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>
