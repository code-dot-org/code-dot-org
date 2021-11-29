---
title: The Big Game - Variables
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg7'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Teaching Notes](#GetStarted)  

### **Activity: The Big Game - Variables**  

3) [Online Puzzles](#Activity1)

[/summary]

[together]

# Teaching Guide

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>

- **Troubleshooting** -  when a program generates an unexpected result, a programmer must examine the code to determine the source of the unexpected results (usually an unanticipated input or incorrect handling of an expected input). Sometimes called **debugging**.  
- **Mod** -  Short for modification.  Games in the real world are often a mod of another game.  Othello (or Reversi) is usually considered a mod of the ancient game of “Go”.  A mod of a program is one that has been altered to do something slightly different than its original purpose.  
- **Stub** - A function whose domain and range have been designated, but the process to transform the domain into the range has not yet been defined.  

### <a name="GetStarted"></a> 2) Teaching Notes on the Big Game

The students will create a mod of an existing game. As they make changes to the game, it is possible that they will add code that will either “break” the program (cause nothing to happen) or cause an unexpected wutcome.  If either of these conditions exist, they will need to troubleshoot or debug the code to determine how to get it working in the proper way.  **If things go terribly awry and finding a problem is too frustrating, use the Clear Puzzle button in the upper right corner of the workspace.**  This button will clear your game back to its initial state, so it should only be used as a last resort.

This exercise is a simplified version of a very common real world programming task.  Programmers often create mods of programs about which they know very little.  They slowly unravel which pieces require further understanding in order to make the mod work the way they want, while leaving other parts of the program completely unexplored.

Many programs and functions are customizable through their arguments (which can be variables or values).  When a function is called, its arguments are passed in as variables into the function. In other cases, variables that someone might want to change (sometimes called constants) are often at the top of a piece of code.  Having access to the code allows the programmer to change the way the program behaves by setting these variables to different values.

In this lesson, we are creating the mod by changing the variables inside the code.  The student has access to the game code and is changing the initial value of the Title, Subtitle, Player, Danger, and Target.  As a reminder, the **ultimate** goal of this game will be to manipulate the player through pressing keys, to avoid the danger, and to make contact with the target.  The **current** lesson has no motion or interactivity. It only changes the look of the game.  The motion and interactivity function stubs, such as “update-target” and “danger?”, will be completed in later lessons.

The blocks menu displays a few new items (Boolean, Cond, and Functions) which will be examined in more detail in future lessons.  The students should be encouraged to explore each of the sub-menus.  However **the only navigation required for this level is editing the five color blocks at the top of the function:** Title, subtitle, bg (background), player, target, and danger.  The difference between the color and black blocks will also be explained in a future lesson.

[/together]

[together]

## Activity: The Big Game - Variables
### <a name="Activity1"></a> 3) Online Puzzles

In this stage you'll define and modify variables to changes how some games function. Head to [CS in Algebra stage 7](http://studio.code.org/s/algebra/lessons/7/levels/1) in Code Studio to get started programming.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>