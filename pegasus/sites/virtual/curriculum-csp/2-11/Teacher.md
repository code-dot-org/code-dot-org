---
title: Lesson 12
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unitnumber=>2, :unittitle=>'Algorithms', :lesson=>12, :title=> 'Internet Routing Game - Day 2', :time=>50, :days=>1) %>

[content]

## Lesson Overview (Discovery, New Learning, Guided Practice, Creative, Assessment -pick one)

In this lesson, students conclude the internet routing game by extrapolating from what they have learned in the game about how the Internet works. Students will try to develop algorithms for their routing strategies, and also consider the potential impacts of routers' ability to inspect information. Finally, as a preview for lessons to come, students will briefly analyze the graph algorithms learned so far in terms of computational complexity. The conclusion is that even though the algorithms might be complex and difficult to understand, in the worst case scenario, the problems can require processing a considerable amount of information, and that these are problems that can be computed.

[summary]

## Teaching Summary
### **Getting Started** - 10 minutes
1) Recap the Internet Routing Game.

### **Activity The Router's Routing Algorithm** - 25 minutes(?)  
2) Play the game - focus on the algorithm.  
3) Write an algorithm for building the routing table.  
4) Share routing algorithms.

### **Wrap up** - 15 minutes
5) Think-Write-Share: Classify the algorithms.


[/summary]

## Lesson Objectives 
The students will...

- Demonstrate...
- Explain ...

# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Journal
- [Internet Routing Game](resources/....) (UNDER DEVELOPMENT)

### For the Teacher
- [Internet Routing Game](resources/....) (UNDER DEVELOPMENT)

## Getting Started (10 min)
### 1) Recap the Internet Routing Game.
- Think-Pair-Share: What would happen if every router on the Internet operated the way you made yours operate?
	- What was the most difficult aspect of the Internet Routing Game?
	- What are the limitations of your ability to route packets properly in the Internet Routing Game?  How do you think this relates to "real" routers?
	- After playing the game for a while, do you think that you could draw an accurate picture of the internet based only on information from your routing table?

[tip]
# Teaching Tip
You may need to give students more time to play the game before they are able to answer the Getting Started questions. If you run out of time, you may assign students to play the game and answer the  questions for homework.

[/tip]
 

## Activity: The Router's Routing Algorithm (25 min)
### 2) Play the game - focus on the algorithm.
- Instruct students to open the Internet Routing Game and to start playing from the beginning with a new goal.
- Their goal is to describe the rules or algorithm for building the routing table.
- As before, they should think about writing semi-formal rules that a person who doesn't understand the problem might follow.

### 3) Write an algorithm for building the routing table.
- Instruct students to write or sketch their algorithms in their journals.

### 4) Share routing algorithms.
- Instruct students to exchange written algorithms to test or critique.
- Optional: Share in the large group, asking a team to present (or read) their algorithm as you or the students follow along and act it out as you play the game.

## Wrap-up (15 mins)
### Think-Write-Share: Classify the algorithms.
- Guide students to think back to when they created algorithms for searching and sorting playing cards and how they analyzed the algorithms.  They were concerned with how many times they looked at or visited a card. 
- In their journals students respond to: How should graph algorithms be analyzed? Think about the algorithms you have learned so far about graphs (MST, SSSP, routing tables).  How would you classify the 'hardness' of these algorithms? What are the measurable elements we should use? In for card sorting you counted the number of times you looked at or interact with a card; what is the corollary for  measuring graph algorithms?

- Trade analysis ideas with your elbow partner. Which algorithm is 'faster' to compute...the minimum spanning tree or the SSSP?

- Discuss: Invite student teams to share their conclusions and argue for correctness. Points to draw out:
	
	1)  In a graph algorithm you are frequently concerned with considering how many times you need to look at a node and its edges, or all of the nodes or all of the edges in order for the algorithm to stop.

	2) Consider the worst cases for MST and SSSP - that is, what does the graph look like that would make the algorithm do the most 'work'?

	3) In the worst case, both the MST and SSSP need to consider each edge in the graph once - the number of nodes is actually less important. So in most respects, both algorithms require relatively the same amount of 'work' from the computer.
	

## Extended Learning 

### title

- TBD

## Assessment Questions

- TBD


## Connections and Background Information
### CS Principles Learning Objectives

TBD 


### Other standards 

*CSTA K-12 Computer Science Standards*

 - TBD

*Common Core State Standards for Mathematical Practice*
  
- TBD  



[/content]