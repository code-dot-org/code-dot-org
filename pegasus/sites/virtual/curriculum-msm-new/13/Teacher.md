---
title: Booleans
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Booleans',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>('30-60')) %>

[content]

[together]

## Lesson Overview
Booleans are the fourth and final data type that students will learn about in this course.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Booleans - True or False?](#GetStarted)  

### **Activity: Booleans**  

3) [Boolean 20 Questions](#Activity1)   

### **Assessment**
4) [Boolean Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Use the Design Recipe to define functions to solve word problems

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep

### For the Teacher
- [Lesson Slide Deck](https://docs.google.com/a/code.org/presentation/d/1pKZEo764Rrr39fVnOJkjSFRRbqA_cq_vTCxP0dpbAy4/)

### For the Students
- 3x5 cards, pens or pencils

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has one new and important word:<br/>

- **Boolean** - a type of data with two values: true and false

### <a name="GetStarted"></a> 2) Booleans - True or False?

What types of data have we used in our programs so far?

- Can you think of Number values?
- String values? Image values?
- What are some expressions that evaluate to a Number?
- How about the other datatypes?

What would each of the following expressions evaluate to?

<img src="oneplusfour.png" style="max-width: 100%"/><br/>
<img src="fourdivtwo.png" style="max-width: 100%"/><br/>
<img src="string-append.png" style="max-width: 100%"/><br/>
<img src="circleten.png" style="max-width: 100%"/><br/>
<img src="threelessthanfour.png" style="max-width: 100%"/>

The last expression, **(3 < 4)**, uses a new function that compares Numbers, returning **true** if 3 is less than 4. What do you think it would return if the numbers were swapped?

The function **<** tests if one number is less than another. Can you think of some other tests?

Functions like **<**, **>** and **=** all consume two Numbers as their Domain, and produce a special value called a Boolean as their Range. Booleans are answers to a yes-or-no question, and Boolean functions are used to perform tests. In a videogame, you might test if a player has walked into a wall, or if their health is equal to zero. A machine in a doctor’s office might use Booleans to test if a patient’s heartrate is above or below a certain level. 

**Boolean values can only be true or false.**
 

[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Boolean 20 Questions

Give each student a card and have them answer the following questions on it (feel free to add some of your own)

1. What is your hair color?
2. Do you wear glasses or contacts?
3. What is your favorite number?
4. What is your favorite color?
5. What month were you born?
6. Do you have any siblings?
7. What is the last digit of your phone number?
8. What is something about you that people here don't know and can't tell by looking at you?

Then collect the cards and shuffle them. To play the game, follow these steps:

- Select a card
- Read the answer to #8 and say this is the person we are looking for
- Have all the students stand up.
- Begin asking true/false based on the card questions
    - Start with simple true/false questions like "is your hair brown?" or "is your favorite number greater than 7?"
    - After a few simple questions, move on to questions using "and," "or," and "not." eg:
        - Do you have siblings OR wear glasses?
        - Is the last digit of your phone number greater than 5 AND less than 8?
        - Is your favorite color NOT purple?
    - Students who answer False to a question must sit down.
    - The person who is still standing at the end is the person.

After one round, explain about boolean logic and how x and y means both x and y are true. X or Y means only x or y has to be true. You can also talk about the amount of information you get from a question. If you have time, let students take turns as the quizmaster, coming up with their own Boolean questions.

[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) Booleans Assessment

Visit [MSM Stage 13](http://studio.code.org/s/msm/stage/13/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
