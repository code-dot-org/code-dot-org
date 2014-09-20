---
title: "Unit 1 Day 9: Hexadecimal Number System"
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'Sending Bits', :lesson=>9, :title=> 'Hexadecimal Number System', :time=>50, :days=>1) %>


[content]

## Lesson Overview (New Learning) 
In this lesson, students will learn about hexadecimal representation of values in two environments in which they are very comfortable thinking about--color and Unicode characters. They will use JavaScript to analyze representing colors in a variety of systems including RGB color names and values. Unicode character hexadecimal representation provides a unique opportunity to deduce numeric patterns. At the end of the lesson, students are invited to think about an algorithm for converting between decimal and hexadecimal numbers. The activity continues in Lesson 10.

[summary]

## Teaching Summary
### **Getting Started** - 5 minutes
1) Recall past experiences.

### **Activity: RGB Color System** - 15  minutes  
2) Represent color in decimal and hexadecimal values.

### **Activity: Color in a Web Page** - 10  minutes  
3) Explore HTML color in hexadecimal.

### **Activity: Unicode in a Web Page** - 15  minutes  
4) Explore Unicode characters in hexadecimal. 

### **Wrap-up** - 5  minutes 
5) A conversion algorithm.  

[/summary]

## Lesson Objectives 
The students will... 

- Explain how color is represented using the RGB system.
- Write JavaScript code that sets the background color and font color by name and in hexadecimal.
- Write JavaScript code to print characters by their Unicode hexadecimal number.
- Analyze the numbering of Unicode characters to deduce patterns in the hexadecimal system.
- Predict how hexadecimal and decimal numbers relate to each other.

*******************


# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Access to [http://jsfiddle.net](http://jsfiddle.net) 
- Access to [unicode-table.com](http://unicode-table.com/en/) 
- [*Student Activity Guide: Hexadecimal Number System*](resources/U1_L9_Student_Practice_Exercises.pdf) 

### For the Teacher
- Projection system for guiding student activities

## Getting Started (5 min)
### 1) Recall past experiences.
 
- Engage students in creating a list of the various ways they have included color in applications.This might include using color names, values, or selecting from a palette.

## Activity: RGB Color System (15 min)  

### 2) Represent color in decimal and hexadecimal.

-  Access a website that enables the students to convert colors to numeric values.
-  Explain the RGB color system.
-  Instruct students to select a common color and record it in RGB in both decimal and hexadecimal values.
-  Engage students in identifying and discussing the pattern they see between the decimal and hexadecimal values.


## Activity: Color in a Web Page (10 min)  

### 3) Explore HTML color in hexidecimal.

-  Guide students to [JSFiddle.net](http://jsfiddle.net); place the cursor in the HTML panel.
-  Work together with students following the *Student Activity Guide: Hexadecimal Number System* to enter HTML for background and font colors using both hexadecimal values and color names. Enter text and click 'Run' to see the results.
-  Ask students why they think both methods are allowed.


## Activity: Unicode in a Web Page (15 min)  

### 4) Explore Unicode characters in hexadecimal. 

-  In the HTML panel, enter a Unicode character such as &#9835
-  Use a Unicode website to identify more Unicode characters. Try several using the alert() command. [unicode-table.com](http://unicode-table.com/en/)  


## Wrap-up (5  min) 
### 5) A conversion algorithm. 
Ask the class to speculate about the relationship between hexadecimal and decimal numbers. Note: the formal algorithms will be taught in the next class meeting. 


## Extended Learning 
Use these activities to enhance student learning. They can be used as outside-of-class activities or other enrichment.

### Unicode Table
- Explore the Unicode Table. Write a complete paragraph in your journal as a mini-report on what you discovered.  

### History of Encoding Text
- The representation of text characters has changed over time. Investigate what systems came before the current system.  Explain what changes were made, and why they were made.



## Assessment Questions
- Explain how color is represented using the RGB system.
- Why do you think values are represented in hexadecimal?  What are the benefits? Are there any disadvantages? 
- Write an example of JavaScript code to print characters by their Unicode hexadecimal number.
- Describe the pattern for numbering of Unicode characters in the hexadecimal system.
- How are hexadecimal and decimal numbers related
 

## Connections and Background Information
### CS Principle Learning Objectives
 - 2.1.1 Describe the variety of abstractions used to represent data. [P3]	
 - 2.1.2 Explain how binary sequences are used to represent digital data. [P5]
 

### Other standards 

*CSTA K-12 Computer Science Standards*

Computational Thinking

- 3B-7. Discuss the interpretation of binary sequences in a variety of forms.
- 3A-6. Analyze the representation o and trade-offs among various forms of digital information.
- 3A-5. Describe the relationship between binary and hexadecimal representations.

*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 5. Use appropriate tools strategically.


[/content]
