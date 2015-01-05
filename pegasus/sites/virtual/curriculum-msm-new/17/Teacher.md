---
title: Conditionals and Piecewise Functions
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Conditionals and Piecewise Functions',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>('30-60')) %>

[content]

[together]

## Lesson Overview
We don’t always know ahead of time what things will be like when we run our computer programs.  Different users have different needs, and sometimes you will want to do something based off of one user's need that you don’t want to do with someone else.  That is where conditionals come in. This lesson demonstrates how conditionals can be used to tailor a program to specific information.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Conditionals](#GetStarted)  

### **Activity: Conditionals and Piecewise Functions**  

3) [Conditionals](#Activity1)   

### **Assessment**
4) [Conditionals Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Articulate how conditionals can be used to program logic choices

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep
### For the Student
- Playing Cards
- Paper for keeping track of how a program reacts to a card
- Pens & Pencils

### For the Teacher
- One [Sample Program](/curriculum/course2/12/Activity12-Conditionals.pdf) for the class to look at
- Print one [Conditionals with Cards Assessment](/curriculum/course2/12/Assessment12-Conditionals.pdf) for each student

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>

- **Clause** - a question and its corresponding answer in a conditional expression
- **Conditional** - a code expression made of questions and answers
- **Piecewise Function** - a function that computes different expressions based on its input

### <a name="GetStarted"></a> 2) Conditionals

Up to now, all of the functions you’ve seen have done the same thing to their inputs:

- green-triangle always made green triangles, no matter what the size was.
- safe-left? always compared the input coordinate to 0, no matter what that input was.
- update-danger always added or subtracted the same amount

and so on...
This was evident when going from EXAMPLEs to the function definition: circling what changes essentially gives away the definition, and the number of variables would always match the number of things in the Domain.

Each conditional has at least one clause. Each clause has a Boolean question and a result. In Luigi’s function, there is a clause for cheese, another for pepperoni, and so on. If the question evaluates to true, the expression gets evaluated and returned. If the question is false, the computer will skip to the next clause

Else clauses are best used as a catch-all for cases that you can’t otherwise enumerate. If you can state a precise question for a clause, write the precise question instead of else. For example, if you have a function that does different things depending on whether some variable x is larger than 5, it is better for beginners to write the two questions (> x 5) and (<= x 5) rather than have the second question be else. Explicit questions make it easier to read and maintain programs.

Functions that use conditions are called piecewise functions, because each condition defines a separate piece of the function. Why are piecewise functions useful? Think about the player in your game: you’d like the player to move one way if you hit the "up" key, and another way if you hit the "down" key. Moving up and moving down need two different expressions! Without cond, you could only write a function that always moves the player up, or always moves it down, but not both.
 
[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Conditionals and Piecewise Functions

**This really needs an unpluggedy activity**


[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) Conditionals Assessment

Visit [MSM Stage 13](http://studio.code.org/s/msm/stage/17/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
