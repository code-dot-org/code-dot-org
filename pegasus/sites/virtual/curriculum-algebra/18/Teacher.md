---
title: Conditionals
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg18'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Conditionals**  

2) [Online Puzzles](#Activity1)

### **Extension Activities**

3) [Improving Luigi's Pizza](#Extension1)

4) [Update Player](#Extension2)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Cost Design Recipe](../docs/worksheets/cost.pdf) (in the student workbook)
- [Update-player Design Recipe](../docs/worksheets/update_player.pdf) (in the student workbook)
- [Key Code Reference](../docs/worksheets/keycode_ref.pdf) (in the student workbook)

## Getting Started

### <a name="GetStarted"></a> 1) Introduction

Remind students of the game they played in the last stage. What were some of the tricky elements of constructing a good conditional statement?

- Order matters (the first condition in the list to return true wins).
- Write clear and explicit conditions.
- Use the else clause as a catch-all for conditions that you don't expect or can't write explicit conditions for.
- All conditionals must have at least one condition and an else statement, you can add or remove further conditions using the blue buttons.

<img src="conditional.png" style="max-width: 100%; min-width: 300px"/>

At the end of this stage, students will return to their Big Game to complete the [update-player](../docs/worksheets/update_player.pdf) function. This function contains a conditional that will check which key was pressed (using key codes), and move the player up or down accordingly. We've provided a [key code reference](../docs/worksheets/keycode_ref.pdf) for students in case they wish to use keys other than the default up (38) and down (40) arrows.

[tip]

# Lesson Tip

Be sure to check students’ Contracts and Examples during this exercise, especially when it’s time for them to circle and label what changes between examples. This is the crucial step in the Design Recipe where they should discover the need for `cond`.

[/tip]

[/together]

[together]

## Activity: Conditionals
### <a name="Activity1"></a> 2) Online Puzzles

Head to [CS in Algebra stage 18](http://studio.code.org/s/algebra/lessons/18/levels/1) in Code Studio to get started programming.

[/together]

[together]

## Extension Activities
### <a name="Extension1"></a> 3) Improving Luigi's Pizza

The final puzzle in the Luigi's Pizza sequence is a Free Play puzzle that allows for students to extend the program in a number of different ways. While some of the potential extensions seem simple, they can be deceptively challenging to get working. Allow students to explore extensions individually, or choose one to work through as a whole class.


- **Coupon Code**: Write a function `coupon` that takes in a topping and a coupon code and returns the price of a pizza with that topping, with %40 off is the code is correct.
- **Multiple Toppings**: Write a function `two-toppings` that takes in two toppings and returns the price of a pizza with those toppings.
- **Picture Menu**: Write a function `pizza-pic` that takes in a topping and returns a simple image representing a pizza with that topping.

### <a name="Extension2"></a> 3) Update Player

The `update-player` function is one of the most extensible in the Big Game. Here's a brief list of potential challenge extensions to give students:

- **Warping**: instead of having the player’s y-coordinate change by adding or subtracting, replace it with a Number to have the player suddenly appear at that location. (For example, hitting the "c" key causes the player to warp back to the center of the screen, at y=200.)
- **Boundary-detection**: Keep the player on screen  by changing the condition for moving up so that the player only moves up if the up ke was pressed AND player-y is below the top border. Likewise, change the condition for down to also check that player-y is above the bottom.
- **Wrapping**: Add a condition (before any of the keys) that checks to see if the player’s y-coordinate is above the screen. If it is, have the player warp to the bottom. Add another condition so that the player warps back up to the top of the screen if it moves below the bottom.
- **Dissapear/Reappear**: Have the player hide when the "h" key is pressed, only to re-appear when it is pressed again!

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>