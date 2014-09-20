---
title: "Unit 1 Day 8: Limitations of Representing Numbers with Bits"
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'Sending Bits', :lesson=>8, :title=> 'Limitations of Representing Numbers with Bits', :time=>50, :days=>1) %>

[content]

## Lesson Overview (New Learning)
In this lesson, students will learn about the limitations of representing values with a fixed number of bits and the resulting errors. They will explore overflow errors using calculators and simulate with a very limited calculator. They will explore the JavaScript alert() statement on a website and use it to produce precision errors in representing decimals between 0 and 1. Students will experience additional precision errors using an online binary/decimal conversion too. Understanding WHY the errors occur is fundamental to their complete understanding of using bits to represent values.

[summary]

## Teaching Summary

### **Getting Started** - 5 minutes

1) Journal prompt: When do computers and calculators make arithmetic mistakes?  

### **Activity: A Limited Number of Bits**  - 15 minutes
2) Discuss overflow errors in addition.

### **Activity: JSFiddle and the Alert Function** - 10  minutes  
3) Introduce JavaScript in the browser with JSFiddle.

### **Activity: Errors in Precision** - 15  minutes  
4) Detect precision errors in addition. 

### **Wrap-up** - 5  minutes 
5)  Reflect on student learning.


[/summary]

## Lesson Objectives 
The students will... 

- Describe errors that occur when performing addition with a fixed number of bits.
- Explain why the errors occur.
- Predict other errors that can occur in addition.
- Use the JavaScript alert() command to perform arithmetic calculations.

***************************************

# Teaching Guide
## Materials, Resources and Prep
### For the Student

- Journal
- Access to [http://jsfiddle.net](http://jsfiddle.net) 
- Access to [http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html](http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html)
- [*Student Activity Guide: Limitations of Representing Numbers with Bits*](resources/U1_L8_Student_Practice_Exercises.pdf)

### For the Teacher
- Access to a web browser. 
- Practice with JSFiddle and the alert() command.
- Projection system for guiding student activities

## **Getting Started** (5 min)

### 1) Journal prompt: 
- Under what conditions do computers and calculators make arithmetic mistakes? Recall instances when you have experienced this.

## **Activity: A Limited Number of Bits** (15 min)   

### 2) Discuss overflow errors in addition.

- Ask students to share their journal entries with the class.  
- Remind students that all computers (including calculators) have a limited number of bits.
- When a student brings up the idea of numbers being "too big" for their calculator, discuss with the class why this happens
   -  Many basic calculators only show a fixed number of digits.
   -  Calculations that go beyond this number of digits will produce errors.
   -  Try to simulate some errors with a "pretend" calculator that only shows 3 digits.
   
## **Activity: JSFiddle and the Alert Function** (10 min)

### 3) Introduce JavaScript in the browser with JS Fiddle.  

-  Instructions in the *Student Activity Guide: Limitations of Representing Numbers with Bits* elaborate on the following:
   -  Introduce JSFiddle [http://jsfiddle.net](http://jsfiddle.net).
   -  Explain how to use the alert() command to create output.
   -  Experiment with different uses of alert() to perform calculations. 

## **Activity: Errors in Precision** (15 min)  

### 4) Detect precision errors in addition.
-  Instructions in the *Student Activity Guide* elaborate on the following:
   -  Use the alert() command to add 0.1 and 0.2.
   -  Check the accuracy of the result. 
   -  Visit a binary conversion web site such as [http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html](http://www.mathsisfun.com/binary-decimal-hexadecimal-converter.html) to make conjectures about why these errors occur. 
   -  As a class, discuss the reasons for overflow errors. 
      

[tip]

# Teaching Tip
Some students will struggle with the concepts of rational numbers. Be ready to discuss the place value of numbers such as 1/10 and 1/100.

[/tip]



## **Wrap-up** (5 min) 
5) Reflect on student learning  

- Summarize what you learned by answering this question in your journal: Why do computers make mistakes in addition?
- Share your answer with an elbow partner or in a class discussion.


## Extended Learning 
Use these activities to enhance student learning. They can be used as outside-of-class activities or other enrichment.

### Patterns with Rationals

- Locate a website that converts binary to decimal or use a calculator that converts binary to decimal. 
- Try to generate the kind of errors that were discussed in this lesson in that environment. Record your observations and conclusions.

### Representing Rational Numbers in Binary
-  Research the process used to represent rational numbers in binary. Prepare a presentation for your class illustrated with examples. Consider reporting your findings in any format that enables you to clearly communicate your learning (report, interview, diagram/work of art, skit, recording).

## Assessment Questions
- Why do computers make mistakes in addition?  
- List three specific examples of mistakes that computers make when adding two numbers. 
- What is an overflow error?  Give an example.
- What is a precision error?  Give an example. 

	
## Connections and Background Information
### CS Principle Learning Objectives

2.1.2 Explain how binary sequences are used to represent digital data. [P5]  

### Other Standards

*CSTA K-12 Computer Science Standards*

Computational Thinking

- 3B-7. Discuss the interpretation of binary sequences in a variety of forms.
- 2-12. Use abstraction to decompose a problem into sub-problems.

*Common Core State Standards for Mathematical Practice*  

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 8. Look for and express regularity in repeated reasoning.

[/content]