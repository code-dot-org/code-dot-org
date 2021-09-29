---
title: Writing Contracts
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg5'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**

1) [Vocabulary](#Vocab)<br/> 
2) [Introduction](#GetStarted)  

### **Activity: Writing Contracts**  

3) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started

### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>


- **Rotate** - to turn a shape about a point.
- **Scale** - to increase the dimensions of a shape by the same factor in all directions.  Also known as dilate.
- **Translate** - to move a shape from one location to another.  The **offset** function performed this transformation.

### <a name="GetStarted"></a> 2) Introduction

Review with students the purpose of a Contract:

- Describes three elements of a function
    - Name (what is the function called)
    - Domain (what inputs does it take)
    - Range (what does it output)
- As a class, describe the Contracts for some basic mathematical operators
    - Addition (name +, domain Number Number, range Number)
    - Subtraction (name -, domain Number Number, range Number)
    - Multiplication (name *, domain Number Number, range Number)
    - Power of two (name sqr, domain Number, range Number)

[/together]

[together]

## Activity: Writing Contracts
### <a name="Activity1"></a> 3) Online Puzzles

In this stage you'll be looking at some functions, some of which you've seen before and some which are brand new. For each function you'll first get a chance to use the function, and then you'll write a Contract for it. Make sure to document any new Contracts on your Contract Log. Head to [CS in Algebra stage 5](http://studio.code.org/s/algebra/lessons/5/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>