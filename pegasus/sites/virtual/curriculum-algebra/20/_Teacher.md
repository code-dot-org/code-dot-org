---
title: Play Lab Collision Detection Big Game
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg20'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Play Lab: Collision Decection Big Game**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources and Prep
### For the Student
- [Update-player Design Recipe](../docs/worksheets/update_player.pdf) (in the student workbook)
- [Key Code Reference](../docs/worksheets/keycode_ref.pdf)
- [Line-length Design Recipe](../docs/worksheets/line_length.pdf) (in the student workbook)
- [Distance Design Recipe](../docs/worksheets/distance.pdf) (in the student workbook)
- [Collide? Design Recipe](../docs/worksheets/collide.pdf) (in the student workbook)

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Let's get back into that Big Game from stages 7, 12, and 16.

Previous work with the game has created movement for the danger and target characters.  Conditional statements have been added to ensure the these characters reappear once the have moved off the screen.  

The students will now get their main character into the action.  They need to connect the main character's activity to keyboard events.  The students can customize their movements to any keys (see the [Key Code Reference](../docs/worksheets/keycode_ref.pdf)) but the suggested keys are the right, up, left, and down arrow keys (with key codes 37-40).

If the main character is not responding, two scenarios are good to trouble shoot:

1. Which key is designated compared to which the student is pressing?
2. What action results from this key press (is the character location changing or still just x?)?

The Pythagorean Theorem studied in the last lesson will be used to determine when the characters have made contact.  Students are not required to use the line-length function but it is set up for them.  They will need the sqrt function which has been added to the number functions.  They should be encouraged to create a square function although the can implement this part of the puzzle using just the times function.  After the students implement the distance formula, they will need to put the appropriate boolean tests in the collide function.

Once these last functions are put into place, scoring will automatically update based on target and danger collisions.

[/together]

[together]

## Activity: Eval Design Recipe
### <a name="Activity1"></a> 2) Online Puzzles

Return to your Big Game to use collision detection logic so that you know when your player is touching the target or the danger. Head to [MSM stage 20](http://studio.code.org/s/algebra/stage/20/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>