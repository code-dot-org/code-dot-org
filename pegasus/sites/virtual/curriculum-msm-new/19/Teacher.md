---
title: Collision Detection and the Distance Formula
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Collision Detection and the Distance Formula',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>('30-60')) %>

[content]

[together]

## Lesson Overview
Booleans are the fourth and final data type that students will learn about in this course.

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Are they Touching?](#GetStarted)  

### **Activity: Collision Detection**  

3) [Collision Detection](#Activity1)   

### **Assessment**
4) [Boolean Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Apply the distance formula to understand the interaction of video game sprites

[/together]

[together]

# Teaching Guide

Materials

- Language Table (see below)
- Cutouts of Pythagorean Theorem packets ( [1](pythag1.png), [2](pythag2.png) ) - 1 per cluster of students working together
 


[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has one new and important word:<br/>

- **Hypoteneuse** - the side opposite the 90-degree angle in a right triangle

### <a name="GetStarted"></a> 2) Are they Touching?

Suppose two objects are moving through space, each one having its own (x,y) coordinates. When do their edges start to overlap? They certainly overlap if their coordinates are identical (x1=x2, y1=y2), but what if their coordinates are separated by a small distance? Just how small does that distance need to be before their edges touch?

Visual aids are key here: be sure to diagram this on the board!
imageIn one dimension, it’s easy to calculate when two objects overlap. In this example, the red circle has a radius of 1, and the blue circle has a radius of 1.5 The circles will overlap if the distance between their centers is less than the sum of their radii (1+1.5=2.5). How is the distance between their centers calculated? In this example, their centers are 3 units apart, because 4−1=3.

Would the distance between them change if the circles swapped places? Why or why not?

Work through a number of examples, using a number line on the board and asking students how they calculate the distance between the points. Having students act this out can also work well: draw a number line, have two students stand at different points on the line, using their arms or cutouts to give objects of different sizes. Move students along the number line until they touch, then compute the distance on the number line. The first few seconds of our Bootstrap video show this exercise in action.

Your game file provides a function called line-length that computes the difference between two points on a number line. Specifically, line-length takes two numbers as input and determines the distance between them

What answers would you expect from each of the following two uses of line-length:

- (line-length 2 5)
- (line-length 5 2)

Do you expect the same answer regardless of whether the larger or smaller input goes first?

If you have time and want to reinforce how conditionals arise from examples, you can have students fill in blanks in Examples such as (EXAMPLE (line-length 2 5) ___), circle what’s different, and notice that the circle labels are in different orders depending on whether the first or the second input is larger. This in turn suggests that the code for line-length will need a conditional. In this case, one could avoid the conditional by taking the absolute value of the difference (the function abs does this); if you are working with older students who already know about absolute value you could show it. Using cond, however, emphasizes how code structure arises from examples.

Scroll to the line-length and collide? functions in your game file. Notice that line-length uses a conditional so that it subtracts the smaller number from the bigger one.

Can you explain why line-length needs to use cond? What are the two conditions?

The two conditions are:

- A is less than B
- B is less than or equal to A

imageUnfortunately, line-length can only calculate the distance between points in a single dimension (x or y). How would the distance be calculated between objects moving in 2-dimensions (like your game elements)? line-length can calculate the vertical and horizontal lines in the graphic shown here, using the distance between the x-coordinates and the distance between the y-coordinates. Unfortunately, it doesn’t tell us how far apart the two centers are.

imageDrawing a line from the center of one object to the other creates a right-triangle, with sides A, B and C. A and B are the vertical and horizontal distances, with C being the distance between the two coordinates. line-length can be used to calculate A and B, but how can we calculate C?

Students’ gamefiles all have a value called *distances-color*, which is set to the empty string "". By changing this to a color such as "yellow" or "red", the game will draw right triangles between each game character, and fill in the lengths for each side. You may want to demonstrate this using your own game file, and have the students follow along. Hint: to make it as easy as possible to see these triangles, set your background to be a simple, black rectangle and slow down the animation functions.

In a right triangle, the side opposite the 90-degree angle is called the hypoteneuse. Thinking back to our collision detection, we know that the objects will collide if the hypoteneuse is less than the sum of their radii. Knowing the length of the hypoteneuse will be essential to determine when a collision occurs.
 

[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Collision Detection

**This really needs an unpluggedy activity**



[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) Collision Detection Assessment

Visit [MSM Stage 19](http://studio.code.org/s/msm/stage/19/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
