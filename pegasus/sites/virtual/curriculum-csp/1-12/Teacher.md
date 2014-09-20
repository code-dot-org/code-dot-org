---
title: "Unit 1 Day 12 Hexadecimal Representation of Files"
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'Sending Bits', :lesson=>12, :title=> 'Hexadecimal Representation of Files', :time=>50, :days=>1) %>

[content]

## Lesson Overview (Discovery)
In this lesson, students will examine different types of files with a hexadecimal (hex) viewer to look for clues about how the information in the file is stored. From their observations they will be able to identify similarities and differences of various file types and compare the file size to the hexadecimal representation. By the end of the lesson students will identify the file format elements required for file types. 

[summary]

## Teaching Summary
### **Getting Started** - 15 minutes
1)  A review of the hexadecimal number system.

### **Activity: Examining Hexadecimal Files** - 30  minutes  
2) View files with a hex viewer.

### **Wrap-up** - 5  minutes 
3) Reflect on student learning.
  


[/summary]

## Lesson Objectives 
The students will...

- Open files of different formats in a hex viewer.
- Identify different elements of the file by their hexadecimal representation.
- Compare the sizes of different files and connect the size of the file to the hexadecimal representation.
- Identify file format elements of each file type.

___


# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Journal
- Access to [http://webhex.net](http://webhex.net)
- Open and save [textfile1-12.txt](resources/textfile1-12.txt)
- Open and save [Unit1Lesson12.png](resources/Unit1Lesson12.png)
- Open and save [Unit1Lesson12.wav](resources/Unit1Lesson12.wav)

### For the Teacher
- Assist students in opening and saving the required txt, png, and wav files. It might be advisable to download and make them accessible through the classroom/school network.
- Access to [http://webhex.net](http://webhex.net)

## **Getting Started** (15 min)
### 1) Review of hexadecimal numbers. 
- Convert these numbers from hexadecimal to decimal:  1A, 20, 43
- What is the sum of hex(45) plus hex(0A)?


## **Activity: Examining Hexadecimal Files** (30 min)  
### 2) Viewing Files with a hex viewer.
- Open a hex viewer such as the one at: [http://webhex.net](http://webhex.net)
- How does this viewer work? What are its features?  
 - Open this text file (textfile1-12.txt) in the hex viewer. Make 3 observations about what you notice.
 - Open this PNG file (Unit1Lesson12.png)in the hex viewer. Make 3 observations about what you notice. 
 - Open this audio file (Unit1Lesson12.wav) in the hex viewer. Make 3 observations about what you notice.
- Record your observations in your journal.

## **Wrap-up** (5  min)
### 3) Reflect on student learning.
Engage students in a discussion about their observations during the student activity using the following questions or instruct them to record their answers in their journals.

- What do all of the formats have in common?
- What were you able to determine about what a text file, a PNG file, and an audio file have in common?  What is different about each?
- If you were making a file format, what elements would you need to include?  


## Extended Learning 
Use these activities to enhance student learning. They can be used as outside-of-class activities or other enrichment.

### Other Files
- Open other files of various file types in the hex viewer. Create a compare/contrast chart to communicate your observations across all of the file types you have viewed.


## Assessment Questions
- List three common features of the file formats.
- If you were going to make your own file format, what information would you try to encode? What would the data in your file look like?
- What elements are unique to text, image, and audio files?
- Why do you think that binary file viewer programs are not as popular as hexadecimal file viewers?

## Connections and Background Information
### CS Principle Learning Objectives

 2.1.2 Explain how binary sequences are used to represent digital data. [P5]


### Other standards 

*CSTA K-12 Computer Science Standards*

Computational Thinking

- 3B-7. Discuss the interpretation of binary sequences in a variety of forms.
- 3A-6. Analyze the representation o and trade-offs among various forms of digital information.
- 3A-5. Describe the relationship between binary and hexadecimal representations.

Computers and Communication Devices

- 3B-3. Identify and select the most appropriate file format based on trade-offs.


*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 5. Use appropriate tools strategically.
- 6. Attend to precision.
- 7. Look for and make use of structure.

[/content]
