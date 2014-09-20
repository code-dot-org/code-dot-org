---
title: Lesson 2
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>2, :unittitle=>'Algorithms', :lesson=>2, :title=> 'Card Sorting', :time=>50, :days=>1) %>

[content]

## Lesson Overview (Discovery)
The algorithmic techniques and analysis involved in sorting data are seen over and over again in a variety of contexts. Sorting numbers in a list is challenging but foundational to many algorithms in computer science. This lesson is the first of several in which students explore and confront the difficulties of the problem of sorting in general and also the difficulties involved in expressing a clear algorithm for it.  The activities are also creative because there are many different ways to sort a list of things. The differences in students' solutions should provide good material for later discussions about algorithm analysis when we ask, "What is the "best" way to sort?"

[summary]

## Teaching Summary
### **Getting Started** - 10 minutes

1. Review: What is an algorithm?
2. Think-Pair-Share: How does Google find things so quickly?

### **Activity: Card sorting algorithm** - 35 minutes  
3. Explain the Card sorting challenge.
4. Solve the problem.


### **Wrap-up** - 5  minutes 
5. Complete the assignment.


[/summary]

## Lesson Objectives 
The students will...

- Relate the task of sorting card to sorting/organizing information in a computer.
- Develop an algorithm for sorting with a partner
- Reason about the correctness of their algorithm
- Compare and contrast different sorting algorithms
- Reason about the "speed" of an algorithm

# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Student Activity Guide: Card Sorting
- Playing cards (8 cards per group)
- Pencil and Paper for writing instructions

### For the Teacher
- Teaching guide: What to look for when students are writing instructions for sorting

## Getting Started (10 min) 
### 1) Review: What is an algorithm?
- Summarize the learning from Lesson 1. 
 -  It is impossible to write clear unambiguous instructions without some agreement about the meaning of certain words and phrases.
 -  The reader's interpretation of language can be unpredictable. 


### 2) Think-Pair-Share: How does Google find things so quickly?

- Prompt: Think about the last time you searched for something in a search engine (probably Google). How long did it take for you to get results back? (probably not long). How do you think Google is able to look up answers to your question so quickly?  
	*Alternative*: If you had 1 million books, and you had to find one by its title as fast as possible, how would you organize them?
- Discuss: Students will have many ideas but what you want to get out of this conversation is that the underlying information must be organized somehow. If we cannot order information, we cannot find it and things like Google would not be possible.  
	
## Activity: The Card Sorting Algorithm   (35 min)

### 3) Explain the card sorting activity. 
The focus should be directed more toward the problem-solving technique than nit-picking about the language used. Students are still writing instructions for a human to do something with a set of playing cards and they still need to be precise because the assumption is that the person doesn't know what they are doing. This problem is challenging and will require creativity.  
	
- Demonstrate the card sorting sorting task as you explain
- Clarify the goal: Today you and a partner are going to design an algorithm and list the instructions for a person to arrange a row of playing cards into order (from lowest to highest value).
- Explain the **basic rules**, which are similar to the rules of the Median of Three activity from Lesson 1:
	- If a card is on the table, it must be face down.
	- You can only see the value of a card by picking it up and looking at its face.
	- You can only be holding and looking at two cards at a time (1 in each hand).
	- You can compare the values of any of the cards you are holding in your hands and determine if one is greater, less than, or equal to the other card.
	- When you put a card down, try to be clear about *where* it should be put back down.
	- You will have 8 cards to practice with but the procedure should be general enough to work for *any number* of cards.
- Ask if there are questions about the rules.
- Emphasize to students that there are many ways to achieve this task. As a class they should try to come up with as many different ways of sorting as possible.  

[tip]
# Teaching Tip
Students may try to get more specifics about how their instructions will be interpreted. Be noncommittal in the early minutes of the students' work.  *Only* answer clarifying questions about basic rules and goals. You may need to clarify that:
	- The procedure should work correctly regardless of the original arrangement of the cards.
	- The procedure should work for *any number* of cards.

[/tip]
### 4) Solve the problem.
- Distribute the cards to student pairs.
- Distribute the Student Activity Guide: Card Sorting.
- The format of the instruction lists is up to the students; they  can create a numbered list, a flow chart, a diagram with text and arrows, or other means of communication.
- Students should be working productively for the rest of the class meeting designing and writing their card sorting algorithm.  
- Circulate the room to make sure students are on task and understand the rules and goals.

[tip]

# Teaching Tip
The sorting problem is hard. Encourage students by telling them that there are many, many ways to sort.  It can help if you act out their instructions so they can see more objectively if they are on the right track.


[/tip]

  
[tip]

# Teaching Tip
Students will have two main difficulties:  1) using language to describe the behaviors that they want the reader to perform, and  2) designing the algorithm itself. Designing the algorithm is more important at this time. If a group is having problems with language, encourage them to design a solution to the problem first and worry about how to explain it second.

[/tip]

[tip]

# Teaching Tip
Writing the instructions is quite difficult and time consuming.  If a group claims to be finished early, have them exchange their instructions with another group to see how well their instructions can be interpreted by others.

[/tip]


## Wrap-up (5 min)
### 5) Complete the assignment.
- Assign students to finish writing their instructions as homework.
- During the next class meeting, students will exchange instructions with another group (or perhaps, invite a non-class member) to evaluate the instructions.


[tip]

# Teaching Tip  
Clarify the level of specificity you require in the sorting "language" by acting out the instructions being written by a student pair. Deliberately  misinterpret ambiguous instructions to demonstrate how specific you want students to be in their writing.

[/tip]


## Extended Learning 

### Sorting Algorithms

- Find other in-place sorting algorithms online. Many can be  easily acted out with cards.

## Assessment Questions

- TBD

## Connections and Background Information
### CS Principles Learning Objectives:

- 4.1.1 Develop an algorithm for implementation in a program. [P2]  
- 4.1.1A Sequencing, selection, and iteration are building blocks of algorithms.  
- 4.1.1G Knowledge of standard algorithms can help in constructing new algorithms.   - 4.1.1H Different algorithms can be developed to solve the same problem.   - 4.1.1J Developing a new algorithm to solve a problem can yield insight into the problem.  
- 4.1.2 Express an algorithm in a language. [P5]  
- 4.1.2A Languages for algorithms include natural language, pseudocode, and visual and textual programming languages.   - 4.1.2B Natural language and pseudocode describe algorithms so that humans can understand them.   
- 4.1.2F The language used to express an algorithm can affect characteristics such as clarity or readability but not whether an algorithmic solution exists.  
- 4.1.2I Clarity and readability are important considerations when expressing an algorithm in a language.  

### Other standards 

*CSTA K-12 Computer Science Standards*

Computational Thinking

- 2-12. Use abstraction to decompose a problem into sub-problems.
- 2-6. Describe and analyze a sequence of instructions being followed.
- 3B-4. Evaluate algorithms by their efficiency, correctness, and clarity.

*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 8. Look for and express regularity in repeated reasoning.



[/content]
