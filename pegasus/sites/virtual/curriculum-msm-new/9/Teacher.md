---
title: The Design Recipe
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'The Design Recipe',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>('30-60')) %>

[content]

[together]

## Lesson Overview
In the last stage students wrote some very simple functions - but more sophisticated functions demand a more thoughtful approach. The Design Recipe is a structured approach to writing functions that includes writing test cases to ensure that the function works as expected.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [What is the Design Recipe](#GetStarted)  

### **Activity: The Design Recipe**  

3) [Collaborative Design](#Activity1)   

### **Assessment**
4) [Design Recipe Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Use the Design Recipe to define functions to solve word problems

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep

### For the Teacher
- [Lesson Slide Deck](https://docs.google.com/a/code.org/presentation/d/1pKZEo764Rrr39fVnOJkjSFRRbqA_cq_vTCxP0dpbAy4)

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has two new and important words:<br/>

- **Design Recipe** - a sequence of steps to document, test, and write functions
- **Purpose Statement** - a brief description of what the function does

### <a name="GetStarted"></a> 2) What is the Design Recipe

The Design Recipe is a roadmap for defining functions, which programmers use to make sure the code they write does what they want it to do. Each step builds on the last, so any mistakes can be caught early in the process. This roadmap has a series of steps:

1. Write a Contract that describes the word problem
2. Write Examples based on the contract
3. Define a function that matches the examples

Let's start out by applying the Design Recipe together to the following problem:

**Define a function ’purple-star’, that takes in the size of the star and produces an outlined, purple star of the given size.**

#### Step 1 - The Contract

**purple-star: <span class="func-number">Number</span> -> <span class="func-image">Image</span>**

Be sure to include a good Name for each function, and remember that the Domain and Range can only include types like Numbers, Images, Strings, etc.

A Contract is the foundation for a function, which gives programmers just enough information to use them: the name of the function, the types of data it expects and the type of data it returns.

#### Step 2 - Examples

<img src="purpleStarEx1.png" style="max-width: 100%; max-height: 200px"/><br/>
<img src="purpleStarEx2.png" style="max-width: 100%; max-height: 200px"/><br/>

- Every Example begins with the name of the function. Where could you find the name of the function?
- Every Example has to include sample inputs. Where could you find out how many inputs this function needs, and what types they are?
- Every Example has to include an expression for what the function should do when given an input. Where could you look to find out what this function does?

Once you have two or more Examples, it should be easy to identify what has changed between them. In fact, the number of things that change should match the number of things in the function’s Domain: if the Domain has a Number and a String in it, then those two values should be the things that differ between your Examples.

#### Step 3 - Function Definition

<img src="purpleStarFunc.png" style="max-width: 100%; max-height: 200px"/><br/>

By identifying what has changed between these Examples, we can define our actual function.

Challenge students to explain why this function does not need to know the color of the star, or whether or not it is solid. They main idea here is that the function already "knows" these things, so the only thing that is changing is the size of the star.

Remember that the Contract and Purpose Statement can be used to write the Examples, even if a programmer isn’t sure how to begin.


[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Collaborative Design


- Define a function ’spot’, that takes in a color and produces a solid circle of radius 50, filled in with that color
- To find the average of two numbers, they should be added together and divided by two. Define a function ’average’, which takes in two numbers and produces their average
- A company logo is a word drawn in big, red letters, rotated some number of degrees. Define a function ’logo’, that takes in a company name and a rotation, and produces a logo for that company

Put students into groups of 3 - each member of the group will represent one step of the Design Recipe

1. Contract
2. Examples
3. Function

Each group will work through the word problems on the [Design Recipe Worksheet](needadesignrecipeworksheet.pdf). Each group member should stay true to their role and make sure to complete the steps in the right order.

[tip]

# Lesson Tip

Challenge students to defend their Examples (their function name, the number of inputs, their types and the type of the returned value). Make sure that the two Examples for each function have different input values! For each of these questions, students must be able to point to the specific part of their Contract as the justification for their Example.

Make sure students have chosen good variable names for their function definitions, and ask students to justify every part of the function body. The only acceptable answers should be "I copied this because it’s the same in both Examples", or "I used a variable name because it differs between Examples."

[/tip]

[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) The Design Recipe Assessment

Visit [MSM Stage 9](http://studio.code.org/s/msm/stage/9/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
