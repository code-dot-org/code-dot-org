---
title: Evaluation Blocks and Arithmetic Expressions
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg2'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Introduction](#GetStarted)  

### **Activity: Evaluation Blocks**  

3) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep

### For the Student
- [Evaluation Blocks Worksheet](../docs/worksheets/evaluation_blocks.pdf) (in the student workbook)

### For the Teacher
- [Lesson slide deck](https://docs.google.com/a/code.org/presentation/d/1_0OPjfAQUfp0NIOHOnHqIegnw96trR-GUT1qg-rpcjw/)

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has five new and important words:<br/>

- **Evaluation Block** - a block of code that represents the structure of an expression
- **Evaluate** - perform the computation in an expression, producing an answer
- **Expression** - a computation written in the rules of some language (such as arithmetic, code, or an Evaluation Block)
- **Function** - a mathematical object that takes in some inputs and produces an output
- **Value** - a specific piece of data, like 5 or "hello"

### <a name="GetStarted"></a> 2) Introduction

A mathematical expression is like a sentence: it’s an instruction for doing something. The expression 4 + 5 tells us to add 4 and 5. To evaluate an expression, we follow the instructions in the expression. The expression 4 + 5 evaluates to 9.

Sometimes, we need multiple expressions to accomplish a task. If you were to write instructions for making a sandwich, it could matter very much which came first: melting the cheese, slicing the bread, spreading the mustard, etc. The order of functions matters in mathematics, too. If someone says "four minus two plus one," they could mean several things:

- Subtract two from four, then add one: **(4 - 2) + 1**
- Add two and one, and subtract the result from four: **4 - (2 + 1)**

Depending on which way you read the expression, you might have very different results! This is a problem, because we often use math to share calculations between people. For example, you and your cell phone company should agree upfront on how much you will pay for sending text messages and making calls. Different results might mean that your bill looks wrong. We avoid problems by agreeing on the order in which to use the different operations in an expression. There are two ways to do this:

1. We can all agree on an order to use
2. We can add detail to expressions that indicate the order

<img src="pyramid.png" style="float: right" />

Mathematicians didn’t always agree on the order of operations, but now we have a common set of rules for how to evaluate expressions. When evaluating an expression, we begin by applying the operations written at the top of the pyramid (multiplication and division). Only after we have completed all of those operations can we move down to the lower level. If both operations are present (as in 4 - 2 + 1), we read the expression from left to right, applying the operations in the order in which they appear.

Evaluation Blocks provide a visual way to indicate the order of operations in an expression.

All Evaluation Blocks follow three rules: 

- Rule 1: Each block must have one function, which is displayed at the top of the block.
- Rule 2: The values for that function are placed below, in order from left to right.
- Rule 3: If a block contains another block as a value, that inner block must be evaluated before the outer block.

Before students get started on the computers, you can have them work through the [evaluation blocks worksheet](../docs/worksheets/evaluation_blocks.pdf) in the student workbook.

[/together]


[together]

## Activity: Evaluation Blocks
### <a name="Activity1"></a> 3) Online Puzzles

The programming language you are going to learn uses Evaluation Blocks to visually represent mathematical functions. Each block of code is either a Function, or a Value - head to [CS in Algebra Stage 2](http://studio.code.org/s/algebra/lessons/2/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>