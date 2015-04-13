---
title: Sam the Bat
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg15'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Sam the Bat**  

2) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Safe-left? Design Recipe](../docs/worksheets/safe_left.pdf) (in the student workbook)
- [Safe-right? Design Recipe](../docs/worksheets/safe_right.pdf) (in the student workbook)
- [Onscreen? Design Recipe](../docs/worksheets/onscreen.pdf) (in the student workbook)

## Getting Started

### <a name="GetStarted"></a> 1) Introduction

<img src="bat_animated.gif" style="float:right; margin: 0 10px 10px 0"/>This is Sam the Bat, and his mother tells him that it’s okay for him to step outside of the yard, but only by a short distance! Specifically, she wants to make sure that she can always see at least a little piece of him. Sam is safe as long as some piece of him is onscreen. That means he can go a little past zero on the left hand side, or a little past 400 on the right - but how far can he go?

In this stage students write functions that will take in Sam the Bat's next x-coordinate and a return a boolean.  That function should return _true_ if part of Sam will still be visible, or _false_ if he would go too far off-screen. If the function returns _false_, Sam isn't allowed to move. 

Students will start by writing functions to check the [left](../docs/worksheets/safe_left.pdf) and [right](../docs/worksheets/safe_right.pdf) side of the screen independently, before combining those with a single [onscreen?](../docs/worksheets/onscreen.pdf) function that prevents Sam from leaving on both the left and right.

For each stage, make sure students try to get Sam to leave through the side they are checking. If Sam makes it all the way off-screen when he shouldn't, they'll get an error, but if he is successfully stopped they'll succeed and move to the next puzzle.

The final puzzle adds a parameter for Sam's y-coordinate to the **onscreen?** function, and asks students to update the **onscreen?** function to prevent him leaving from the top and bottom. It is left up to the student to decide how to design this modification, but you can encourage them to approach it in the same modular fashion as they did the left and right - some ideas for struggling students:

- Write functions to check **safe-up?** and **safe-down?**
- Replace **safe-left?** and **safe-right?** with **safe-x?** and **safe-y?**

[tip]

# Lesson Tip

Poorly designed programs can work just fine, but they are hard to read, hard to test, and easily cause errors if things change. As students work to solve this final puzzle, encourage them to think beyond just "making the code work". It’s not good enough if it just works - as artists, we should care about whether or not code is well designed, too. This is what functions allow us to do! Everyone from programmers to mathematicians use functions to carve up complex problems into simpler pieces, which make it possible to design elegant solutions to difficult problems. Encourage students to break up this problem into smaller functions, instead of just cramming all of the new logic into the **onscreen?** function.

[/tip]

[/together]

[together]

## Activity: Sam the Bat
### <a name="Activity1"></a> 2) Online Puzzles

Using Boolean logic, you're going to write functions to help make sure Sam the Bat doesn't leave his mom's yard. Head to [CS in Algebra stage 15](http://studio.code.org/s/algebra/stage/15/puzzle/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>