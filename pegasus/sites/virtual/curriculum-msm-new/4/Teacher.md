---
title: Contracts
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unplugged=>true, :title=> 'Contracts',:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>(30-60)) %>

[content]

[together]

## Lesson Overview
Contracts provide a way for students to better understand and discuss functions. Through this lesson students will look at known functions and come up with the contracts that describe those functions.

[summary]

## Teaching Summary
### **What's in a Contract**
 
1) [Vocabulary](#Vocab)<br/>
2) [Figuring it Out](#GetStarted)  

### **Activity: Contracts**  

3) [Writing Contracts](#Activity1)<br/>
4) [Reading Contracts](#Activity2)  

### **Wrap-up**
5) [Flash Chat](#WrapUp) - What did we learn?  

### **Assessment**
6) [Contracts Assessment](#Assessment)

[/summary]

## Lesson Objectives 
### Students will:
- Describe a function in terms of its name, domain, and range
- Create contracts for arithmetic and image-producing functions

[/together]

[together]

# Teaching Guide

## Materials, Resources and Prep
### For the Student
- [Contract Log](needacontractlog.pdf)

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>

- **Contract** - a statement of the name, domain, and range of a function
- **Domain** - the type of data that a function expects
- **Range** - the type of data that a function produces

### <a name="GetStarted"></a> 2) Figuring it Out

You’ve already seen several functions that take in two Numbers, such as +, and -. On the other hand, the function "star" takes in a Number and two Strings. Different functions take in different inputs, and we need a way to keep track of the requirements for each function.

**The Domain of a function is the data that the function expects.**

By keeping a list of all the functions in a language, and their Domains, programmers can easily look up how each function is used. However, it’s also important to keep track of what each function produces! For example, a program wouldn’t use "star" if they were trying to produce a Number, because star only produces Images. 

**The Range of a function is the data that the function produces.**

Domains and Ranges help programmers write better code, by preventing silly mistakes and giving themselves hints about what to do next. A programmer who wants to use "star" can look up the Domain and immediately know that the first input has to be a Number (like 100), without having to remember it each time. Instead of writing a single value there, a programmer could write a whole expression, like (25 * 4). We know this code will return an appropriate value (Number) by looking at the Range for *; therefore, the result of * can be used in place of any Number value.

When programmers write down the Domains and Ranges of each function, they write what are called **contracts**, to keep track of what each function needs. 

**A Contract has three parts: the _Name_, _Domain_ and _Range_ of a function.**

[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Dissecting a Demo

Let's see if we can come up with contracts for some of the functions you've already seen. You'll want to make sure that you've got your [contracts log](needacontractlog.pdf), as this is where you'll keep a running document of all contracts you write - both for existing functions and ones of your own creation. When writing a contact on paper, we'll use this form:

**_Name_: _Domain_ -> _Range_**

Using that format, the contract for star is:  

**star: Number String String -> Image**
 
This means that the Name of the function is star, that it takes in a Number and two Strings as its Domain, and produces an Image as the Range. We use types instead of values when we write a Contract, because we want to be more general: a star could be of any size, so the Domain for star specifies that the first argument could be any Number. If we think of a language as a collection of lego pieces, the Contracts are like the tabs and slots that tell us how each piece can connect.
Contracts are sufficiently important and useful that we should keep a list of them somewhere. Using the Contract Log. Write the contract for star in the first row of your contracts table.

[tip]

# Lesson Tip

Common mistakes when students first write down contracts include: writing values (such as "red") instead of types (such as "String") and forgetting arguments. Read your students’ contracts carefully, as they often indicate misconceptions that will persist and affect them later on.

[/tip]

Here is the contract for a new function:  

**rectangle: Number Number String String -> Image**
 
- What is the Name of this function?
- How many things are the Domain of this function?
- What is the type of each thing in the Domain?
- What is the Range of this function?

A Contract tells you exactly how to use the function, by writing its Name and then using values for each of the arguments in the Domain. Here is an example of an Evaluation Block, written to use rectangle:  

(rectangle 100 50 "solid" "blue")
 
What do you think this code will produce?

The Contract for + is shown below.  

**+: Number Number -> Number**
 
Can you write the Contract for *, -, / and sqrt?


### <a name="Activity2"></a> 4) What Can Contracts Tell Us

Now that you know how to use a Contract to write an expression, here are the Contracts for several new functions that produce Images:  

ellipse:  Number Number String String -> Image
triangle: Number String String        -> Image
circle:   Number String String        -> Image
 
See if you can figure out how to use these new functions to draw other shapes! Here's an example to get you started

[/together]

[together]

## Wrap-up
### <a name="WrapUp"></a> 5) Brainstorming for a Game

This lesson expanded Evaluation Blocks, expressions, and code to include Strings and Images (as well as Numbers). You learned that everything you knew about functions on Numbers also works on Strings and Images (which will make your programs more interesting). You also learned how to use the Image functions to create your own images, and how to use existing Images in your programs (through bitmap/url).
In the next unit, you’ll learn how to create your own functions to save work in writing expressions (this will turn out to be an essential part of writing a game). You’ll also start customizing your game with images for the elements in your game design.

[/together]

[together]

## Assessment
### <a name="Assessment"></a>6) Contract Writing Assessment

Visit [MSM Stage 4](http://studio.code.org/s/msm/stage/4/puzzle/1) in Code Studio to complete the assessments.

[/together]

[standards]

## Connections and Background Information




[/standards]

[/content]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css"/>
