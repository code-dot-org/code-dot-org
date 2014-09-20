---
title: Lesson 13
view: page_curriculum
theme: none
---


<%= partial('curriculum_header', :unitnumber=>2, :unittitle=>'Algorithms', :lesson=>13, :title=> 'Algorithms: Graph Algorithms that are "hard" - Map Coloring', :time=>50, :days=>1) %>

[content]

## Lesson Overview (Discovery)

In this lesson, students explore another graph algorithm: the map coloring problem and various questions related to it. The major goal is for students to discover the types of tasks and questions that are easy for a computer to solve and those that are hard for a computer to solve. Students will write an algorithm for a series of problems related to maps to generate a better understanding of algorithms that are hard - meaning they take a long time to solve. They will also learn about decision versus optimization problems.  

### Baker's NOTE
- I think I want to replace this with an exploration of Traveling Salesman Problem (TSP) instead.
- TSP can prove the same points, and is more similar to the path-finding problems studied before and after this.
- TSP also has simple heuristics that are fairly easy to understand and implement "by hand" in a widget.
- This lesson as Map Coloring is ok and makes the point, and would be fine with a widget
	

[summary]

## Teaching Summary
### **Getting Started** - 15 minutes  
1) Review of graph algorithm description and analysis.  
2) Share and discuss algorithms.

### **Activity: Harder Map Coloring Problems** - 25 minutes 
3) Map Coloring Challenge.

### **Wrap up** - 10 minutes
4) Journal entry: What is harder about map coloring problems than the SSSP problem? 



[/summary]

## Lesson Objectives 
The students will... 

- Demonstrate...
- Explain ...

# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Journal
- [*Student Activity Guide: Map Coloring Challenges*](resources/...)


### For the Teacher
- Prepare the *Student Activity Guide: Map Coloring Challenges*


## Getting Started (15 min)
### 1) Review of graph algorithm description and analysis.
- Review what students have learned about graphs so far by analyzing a new set of related problems known collectively as "Map Coloring" problems.
- The problems concern coloring in regions of a map so that no bordering regions have the same color.
	- Show example.
- A map on paper can be described as an abstract graph where nodes represent regions and edges represent a border between them.
	- The "coloring" is then represented by assigning a color to a node such that no node has a neighbor with the same color.
- Before solving the map coloring problem itself, practice the algorithm writing by considering a related problem: confirming a coloring solution.
	- Distribute or show the [Student Activity Guide: Map Coloring Challenges](resources/...).
	- It includes 4 different problems, each of which asks a slightly different (but equally hard) question about map coloring, that will be used throughout the lesson.
- In problems #1, A map that has already been colored needs to be confirmed as correct according to the rules.
- Write an algorithm that stops with the answer 'yes' or 'no' that the map you have been given is in fact colored with k-colors. 

### 2) Share and discuss algorithms
- Questions to ask about students' algorithms:
	- Where do you start (which node)?
	- Is your algorithm specific enough for a computer to follow?
	- How much "work" does the computer have to do to confirm that the map has been colored with k-colors in the words case?


## Activity: Harder Map Coloring Problems (25 min)
### 2) Map Coloring Challenges.
- Baker NOTE: these should be POGIL style-worksheets, or could be done in a widget.

- The students' task is to write an algorithm to solve the problem and state how much work it is to find the solution.
- Form student teams of two and give each team a Student Activity Guide.
	- Problem 2: Can you k-color this map?
		- Example: Here is a map. Can it be colored with 4 colors?  Write an algorithm to color the map with 4 colors.
	- Problem 3: What is the minimum number of colors you need to color this map?
		- Example: here is map. What is the minimum number of colors to color it with? Write an algorithm to color it with the minimum number of colors possible.
	- Problem 4: Make a map.
		- Example: Can you write an algorithm for a person to draw a (nontrivial) map (or construct a graph that represents a map) of n-regions that requires exactly 3 colors to color?


## Wrap-up (10 min)
- Journal: What is harder about these problems than the SSSP problem?  What made writing the algorithm harder?

- Discuss: In the following discussion you want to ask questions that highlight the following:
	1. These problems are hard, because the only known algorithm is essentially to try every possibility. In some ways that makes the algorithm easy to express.
	2. Analysis: Even if you have an algorithm it takes a VERY VERY VERY long time to finish. The number of possibilities is very large.
	3. The differences between the three problems
		- Problem 1: even though it might take a long time to find a k-coloring for a map, when the algorithm completed we could verify that it came up with a correct coloring in a reasonable amount of time (using algorithm from first part of class)
		
		- Problem 2: this one is hard because we don't know what the minimum is.  Even if the algorithm completed, how could we verify it was correct?
		
		- Problem 3: is hard because there is not really a way to construct a random map that can be 3-colored without building some map and trying to 3-color it.  There are clever, very structured ways to ensure that a map is 3 colored but those maps aren't random.

- Invite a group that worked on problem 1 present the problem and their solution. Ask questions to draw out the discussion points above.
- Repeat with problems 2 and 3.


## Extended Learning 
### Real-world Applications

- It is an interesting exercise to look at problems from the real-world that reduce to the map coloring problem. It is a special kind of dependency graph that appears over and over again.
- Guide students think about the values in the nodes, the connections between then, and what colors could depict to represent a real-world problem.  An example might be school scheduling. The nodes represent a class of students in a room with a teacher. A node is connected to any other node that uses that room, teacher or any of the students. The colors represent periods of the school day. If you can color that graph you can schedule the school.

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