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

- We can start this lesson off right away
  - Let the class know that if they can be completely quiet for thirty seconds, you will do something like:
     - Sing an opera song
     - Give five more minutes of recess
     - or Do a handstand
   - Start counting right away.
   - If the students succeed, point out right away that they succeeded, so they *do* get the reward.
   - Otherwise, point out that they were not completely quiet for a full thirty seconds, so they *do not* get the reward.
- Ask the class "What was the *condition* of the reward?"
  - The condition was *IF* you were quiet for 30 seconds
     - If you were, the condition would be true, and you would get the reward.
     - If you weren't, the condition would be false, so the reward woud not apply.
  - Can we come up with another conditional?
     - If I say "question," you raise your hand
     - If I sneeze, you say "Gesundheit."
     - What examples can you come up with?
- Sometimes, we want to have an extra condition, in case the "IF" statement is not true.
  - This extra condition is called an "ELSE" statement
  - When the "IF" condition isn't met, we can look at the "ELSE" for what to do
     - Example: IF I draw a 7, everybody claps. Or ELSE, everyone says "Awwwwwwe."
     - Let's try it. (Draw a card and see if your class reacts appropriately.)
  - Ask the class to analyze what just happened. 
     - What was the IF?
     - What was the ELSE?
     - Which condition was met?
  - Believe it or not, we have even one more option.
     - What if I wanted you to clap if I draw a 7, or else if I draw something less than seven you say "YAY," or else you say "Awwwwwwwe"?
         - This is why we have the terms If, Else If, and Else.
         - If is the first condition
         - Else-if gets looked at only if the "If" isn't true.
         - Else gets looked at only if nothing before it is true.

Up to now, all of the functions you’ve seen have done the same thing to their inputs:

- green-triangle always made green triangles, no matter what the size was.
- safe-left? always compared the input coordinate to 0, no matter what that input was.
- update-danger always added or subtracted the same amount

Conditionals let our programs run differently based on the outcome of a condition. Each clause in a conditional evaluates to a boolean value - if that boolean is TRUE, then we run the associated expression, otherwise we check the next clause. We've actually done this before when we played the boolean game! If the boolean question was true for you, you remained standing, and if it was false you sat down.

Let's look at a conditional piece by piece:

(x > 10)  ->  "That's pretty big"
(x < 10)  ->  "That's pretty small"
else      ->  "That's exactly ten"

If we define x = 11, this conditional will first check if x > 10, which returns TRUE, so we get the String "that's big" - and because we found a true condition we don't need to keep looking.

If we define x = 10, then we first check if x > 10 (FALSE), then we check x < 10 (FALSE), so then we hit the _else_ statement, which only returns if none of the other conditions were true. The _else_ statement should be considered the catch-all response - with that in mind, what's wrong with replying "That's exactly ten"? What if x = "yellow"? If you can state a precise question for a clause, write the precise question instead of else. It would have been  for beginners to write the two questions (x > 10) and (x <= 10). Explicit questions make it easier to read and maintain programs.

Functions that use conditions are called piecewise functions, because each condition defines a separate piece of the function. Why are piecewise functions useful? Think about the player in your game: you’d like the player to move one way if you hit the "up" key, and another way if you hit the "down" key. Moving up and moving down need two different expressions! Without cond, you could only write a function that always moves the player up, or always moves it down, but not both.
     
Now let's play a game.

 
[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Conditionals and Piecewise Functions

**This really needs an unpluggedy activity**


[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) Conditionals Assessment

Visit [MSM Stage 17](http://studio.code.org/s/algebra/stage/17/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

<details>
<summary>Standards Alignment</summary>

### Common Core Mathematical Practices
 
- 1. Make sense of problems and persevere in solving them.
- 2. Reason abstractly and quantitatively.
- 3. Construct viable arguments and critique the reasoning of others.
- 4. Model with mathematics.
- 5. Use appropriate tools strategically.
- 6. Attend to precision.
- 7. Look for and make use of structure.
- 8. Look for and express regularity in repeated reasoning.

### Common Core Math Standards

- A-SSE.1-2: The student interprets the structure of expressions to solve problems in context.

</details>

[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
