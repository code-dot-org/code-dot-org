---
title: Rocket Height
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg10'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Introduction](#GetStarted)  

### **Activity: Rocket Height**  

2) [Online Puzzles](#Activity1)

### **Extension Activities**

3) [Non-linear Animation](#Extension)

[/summary]

[together]

# Teaching Guide

## Materials, Resources, and Prep
### For the Student
- [Rocket-Height Design Recipe](../docs/worksheets/rocket_height.pdf) (in the student workbook)

## Getting Started


### <a name="GetStarted"></a> 1) Introduction

Functions are a key part of animation in computer programs. A function that draws a static picture of a bat, for example, can place the bat at a different location based on the input. When that input changes slightly based on time or user-interaction, the bat will appear to move. This is similar to the way that flip-book animations work, in which each page draws a static image that has changed by a small amount. When the pages are displayed quickly, the images appear to change smoothly.

<img src="bat_spritesheet.png" style="width: 100%" />

Putting these images together, we arrive at an animation of the bat turning around.

<img src="bat_animated_fast.gif" style="display: block; margin: 0 auto;"/>

<img src="function_pass.png" style="float:right; margin 0 0 40px 20px; max-width: 33%; min-width: 250px;"/>
In the online puzzles, students will find a black block for each function they create, in addition to the colored blocks they are used to. The black function box, which has no parameter inputs, represents the function as a Type of data. This allows you to pass your function into the 'start' function, where it can be used to control the rocket animation.

Another curiosity with this program is that the rocket-height function will be executed multiple times.  The periodic execution creates the flip-book effect.  As each second passes, the rocket-height function is executed again, the new location is calculated, and the rocket is re-drawn in its new location.  This drawing and re-drawing in different locations gives the appearance of motion.

[tip]

# Lesson Tip

After creating simple linear movement, students will be asked to write functions to animate simple acceleration. Students will be given an input/output table from which to write their new function. You may want to work through these problems as a whole class, so that students can see how you might analyze an input/output table in order understand the relationship between input and output values.

[/tip]

[/together]

[together]

## Activity: Rocket Height
### <a name="Activity1"></a> 2) Online Puzzles

In this stage you'll write functions that manipulate images to create animations. Head to [CS in Algebra stage 10](http://studio.code.org/s/algebra/lessons/10/levels/1) in Code Studio to get started programming.

[/together]

[together]

## Extension Activities
### <a name="Extension"></a> 3) Non-linear Animation

The final puzzle of this stage is a Free Play puzzle that will allow you amd your students to experiment with other variations on the rocket-height formula. One activity that students find particularly interesting (and often challenging) is to write functions that produce non-linear acceleration. If your students are familiar with quadratics then you can call this out as such, but even younger students who haven't yet seen quadratics can enjoy this extension challenge.

Place the following input/output tables on the board and see if students can come up with functions that will produce the appropriate animation.

<div style="float:left">

<h4>Challenge 1</h4>

<div id="input-table">
  <table>
    <tbody><tr>
      <th>Input</th>
      <th>Output</th>
    </tr>

    <tr>
      <td>1</td>
      <td>10</td>
    </tr>

    <tr>
      <td>2</td>
      <td>40</td>
    </tr>

    <tr>
      <td>3</td>
      <td>90</td>
    </tr>

    <tr>
      <td>4</td>
      <td>160</td>
    </tr>

  </tbody></table>
</div>
</div>
      
<div style="float: right">

<h4>Challenge 2</h4>

<div id="input-table">
  <table>
    <tbody><tr>
      <th>Input</th>
      <th>Output</th>
    </tr>

    <tr>
      <td>1</td>
      <td>15</td>
    </tr>

    <tr>
      <td>2</td>
      <td>45</td>
    </tr>

    <tr>
      <td>3</td>
      <td>95</td>
    </tr>

    <tr>
      <td>4</td>
      <td>165</td>
    </tr>

  </tbody></table>
</div>
</div>

<div style="clear:both"></div>

Once students have figured out the provided Input Output tables, encourage them to come up with non-linear animation functions of their own.

[together]

<%= partial('../docs/_footer', :lesson => lesson) %>