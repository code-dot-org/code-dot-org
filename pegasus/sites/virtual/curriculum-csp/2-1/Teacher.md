---
title: Lesson 1
view: page_curriculum
theme: none
---
<%= partial('curriculum_header', :unitnumber=>2, :unittitle=>'Algorithms', :lesson=>2, :title=> 'What is an Algorithm?', :time=>50, :days=>1) %>


[content]

## Lesson Overview

In this lesson, students construct their own knowledge of algorithms by writing one of their own. The topic for their algorithm is the "Median of Three" problem. Students encounter the difficulty of having to specify exact actions with inexact or ambiguous language. This lesson also lays the foundation for motivating the need for a programming language.  Students develop algorithms to solve a task in pairs and then analyze each others' work. Students create a working definition of 'algorithm.'

[summary]

## Teaching Summary
### **Getting Started** - 10 minutes

1) Journal: Have you ever written instructions or told someone to do something and they didn't follow your directions as you intended?

### **Activity: "Median of Three" problem** - 25  minutes  

2) Write an algorithm.  
3) Compare algorithms.


### **Wrap-up** - 15  minutes
4) Share Median of Three algorithms.  
5) Class discussion: What is an algorithm?


[/summary]

## Lesson Objectives 
The students will:

 - Reason about the difficulty of writing instructions for anything - man or machine.
 - Describe an "algorithm."
 - Identify potentially ambiguous phrases in a written algorithm.
 - Recognize that some agreed-upon terms are necessary for both the correctness and efficiency of instructions/algorithms.
	

# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Playing cards (3 cards for each student pair)

### For the Teacher
 - A deck of playing cards to distribute to teams

## Getting Started (10 min)
### 1) Journal 
- Instruct students to respond to this prompt in their journals: Think of a time when you wrote instructions or told someone to do something and they didn't follow your directions as you intended? What did you wanted the person to do, what instructions did you give them, and what did they do instead?
- Discussion: Why is writing instructions difficult? What are the kinds of things that go wrong? 

  
[tip]

# Teaching Tip
 Students will be eager to share their stories, so allow for some sharing. Focus the discussion on the ambiguity of language that can get in the way of correctly interpreting instructions. Being aware of how a specific audience might interpret the message is important.


[/tip]


## Activity: "Median of Three" algorithm (25 min) 
### 2) Write an algorithm. 
- Form students pairs.
- Give each pair of students three playing cards that have three different face values.
- Ask students to create a set of instructions for a person to identify the card that has the middle value of the three cards (the median).
- RULES:
	- Assume the person you are writing instructions for is not very savvy with little real-world experience and takes everything literally. If there is an opportunity to misinterpret an ambiguous instruction it will happen.
	- The cards start face-down on the table.
	- Only two cards can be turned face-up at any point in time.
	- The last instruction listed must be **"DONE"**. This indicates the condition at which the median of the three cards is face-up and other two cards are face-down on the table.
	- The relative position or location of the cards on the table does not matter.
	- The format of the instructions is up to the students; the instructions can be communicated as a numbered list, a flow chart, a diagram with text and arrows, or any other readable format.
	 
[tip]

# Teaching Tip

Circulate among the pairs as students work to get a sense of how each group is solving the problem. Use this insight to group pairs for the next step.

[/tip]
  

### 3) Compare algorithms. 
- Join student pairs to form groups of 4 students each.
- Ask each pair to try the other pair's instructions without asking for any clarifications from the group that wrote the instructions.
- Instruct the group of 4 to analyze both algorithms:
	- Did each pair use *exactly* the same technique for finding the median?
	- Which instructions were difficult to follow and why?
	- Which instructions might be easily misinterpreted by someone who didn't know what they were doing ahead of time?
	- Find at least one instruction that relies on your experience as a human being to be correctly interpreted. How might a robot interpret that instruction? How would you re-write the instruction so that a robot would follow it correctly?
		

[tip]

# Teaching Tip
To increase the difficulty, modify the problem to write an algorithm to find the median of 5 cards. The Median of Five problem can also be assigned as homework for additional practice. 

[/tip]



## Wrap-up (15 min)
### 4) Share Median of Three algorithms.
- Engage groups in sharing their technique for finding the median of three cards.
- Do this by asking for someone to recommend and describe ANOTHER GROUP'S technique that is good.
- Quickly survey the class to discover if others used a similar strategy or if there are several very different strategies within the class.
- Spend only a few minutes on this step.

### 6) Class discussion: What is an algorithm?
- ASK: What does this activity have to do with computer science?
	- Relate the task of writing instructions for a task to programming a computer.
- ASK: What is the difference between writing instructions for a person and writing for a computer?
	- Relate the word **"algorithm"** to a list of precise instructions for completing a task.
- ASK: What were some of the instructions commonly used in algorithms for finding the median of 3 that were hard to interpret? Why?
	- You may want to act out one group's instructions making sure to deliberately misinterpret ambiguous instructions. Example: If there is an instruction such as "put card down," put it on the floor or on top of another card.  If the instruction says "look at card," look at the back of the card or at a card other than the one you're holding.
- ASK: What would make writing the Median of Three algorithm easier?
	- Draw out the idea that having a defined list of agreed-upon actions would be helpful. For example, if "put card down" had a particular meaning that we could rely on, it would greatly shorten the list of instructions.
- Engage the class in creating a working definition for the word **algorithm**.


## Assessment Questions
- Find a definition for the word "algorithm" from at least three different sources (on the web or in books) and relate it to your experience writing the Median of Three algorithm. Which of the three definitions makes the most sense to you? Why? If you were stuck in an elevator with someone for 60 seconds and they asked you, "What's an algorithm?", what would you say?  

- Create a list of defined instructional statements for manipulating cards on a table. Assuming that those instructions will be interpreted the way you want, use your instructions to write an algorithm to find the median of 5 cards. Your algorithm should be as succinct as possible. Turn in both the list of instructional statements with brief notes about their meaning and the algorithm.


## Connections and Background Information
### CS Principles Learning Objectives

- 4.1.1 Develop an algorithm for implementation in a program. [P2]
- 4.1.2 Express an algorithm in a language. [P5]
- 4.2.1 Explain the difference between algorithms that run in a reasonable time and those that do not run in a reasonable time. [P1]
- 4.2.2 Explain the difference between solvable and unsolvable problems in computer science. [P1]
- 4.2.3 Explain the existence of undecidable problems in computer science. [P1]
- 4.2.4 Evaluate algorithms analytically and empirically for efficiency, correctness, and clarity. [P4]
- 5.2.1 Explain how programs implement algorithms. [P3]
- 6.3.1 Identify existing cybersecurity concerns, and potential options that address these issues with the Internet and the systems built on it. [P1]


### Other standards 

*CSTA K-12 Computer Science Standards*

Collaboration   

- 2-4: Exhibit dispositions necessary for collaboration: providing useful feedback, integrating feedback, understanding and accepting multiple perspectives, socialization. 

Computational Thinking

- 2-12. Use abstraction to decompose a problem into sub-problems.  
- 2-6. Describe and analyze a sequence of instructions being followed.  
- 3B-4. Evaluate algorithms by their efficiency, correctness, and clarity.


*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 8. Look for and express regularity in repeated reasoning.

[/content]