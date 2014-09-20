---
title: "Unit 1 Day 15: Compression"
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'Sending Bits', :lesson=>15, :title=> 'Compression', :time=>50, :days=>1) %>

[content]

## Lesson Overview (New Learning)
In this lesson, students will describe some of their own experiences downloading files to illustrate and motivate the need for compression techniques. After clarifying how big gigabytes, terabytes, and petabytes are, they will learn a formula for calculating the "space savings" from a theoretical compression and from one on their desktop.  A CS Unplugged activity will guide the students to compression an image  by hand using Run Length Encoding. Students can research other compression algorithms in the extended activity. 

[summary]

## Teaching Summary
### **Getting Started: Downloading Files** - 5 minutes
1) Class discussion: What experiences have you had in downloading large compressed files?

### **Activity: Units for Measuring File Size** - 10  minutes  
2) Define kilobyte, megabyte, gigabyte, terabyte, petabyte

### **Activity: Calculate Space Savings from Compression**  - 10 minutes
3) Learn a formula to compute space savings from compression. 

### **Activity: Desktop Compression Tools** - 5  minutes 
4) Optional: Use a desktop compression tool and compute the space savings.

### **Activity: Computer Science Unplugged** - 15  minutes 
5) Use Run Length Encoding to represent and compress a black-and-white image.

### **Wrap-up** - 5 minutes
6) Search for other compression algorithms.

[/summary]

## Lesson Objectives 
The student will...   

- Explain the need for data compression.
- Compute the number of bytes in a gigabyte, terabyte, and petabyte.
- Calculate the space savings in a given compression of data.
- Explain how a black and white image can be compressed using Run Length Encoding


___


# Teaching Guide
## Materials, Resources, and Prep
### For the Student
- Access to a desktop compression tool
- **Activity 2: Color by Numbers** activity guide from [Computer Science Unplugged](http://csunplugged.org/sites/default/files/activity_pdfs_full/unplugged-02-image_representation.pdf)

### For the Teacher
- Resource: [Wikipedia: Petabyte](http://en.wikipedia.org/wiki/Petabyte)
- Video: [Computer Science Unplugged - Image Compression](https://www.youtube.com/watch?v=uaV2RuAJTjQ)
- Download the **Activity 2** document and read the teaching directions from [Computer Science Unplugged](http://csunplugged.org/image-representation)



## **Getting Started: Downloading Files** (5 min)

### 1) Class discussion

- Ask the class: "What experiences have you had in downloading large compressed files?"
- Try to get a variety of experiences from a range of students.
- Ask the class why they think these files were compressed.
- Ask the class what they think the word "compress" means.

## **Activity: Units for Measuring File Size** (10 min)  
### 2) Define kilobyte, megabyte, gigabyte, terabyte, petabyte.
- Define: kilobyte = 1000 bytes, megabyte = 10^6 bytes, gigabyte = 10^9 bytes, terabyte = 10^12 bytes, petabyte = 10^15 bytes
- Depending on the experiences of your students, you may need to provide additional learning opportunities on this topic.


## **Activity: Calculate Space Savings from Compression** (10 min)  
### 3) Use a compression formula on large files. 
- Learn the formula and practice it using file of various sizes (GB, TB, PB)
- Compute the space savings that result from the compression by calculating the following: **1 - CompressedFileSize / UncompressedFileSize**
- As an example, the space savings from compressing a 10 GB file down to 8 GB would be **1 - 8/10** or 0.2, which is 20 percent.
- You can make up file size examples or use the file sizes from the optional activity #4.


## **Activity: Desktop Compression Tools** (5 min) 
### 4) Optional:  Use a desktop compression tool and compute the space savings.
- Use an a compression system on the local computer to compress a few personal files.
- Compute the space savings that result form the compression by calculating the following:  **1 - CompressedFileSize / UncompressedFileSize** 


## **Activity: Computer Science Unplugged**  (15 min)  
### 5) Use Run Length Encoding to represent and compress a black-and-white image.
- Use an unplugged activity such as [CS Unplugged: Image Compression](http://csunplugged.org/image-representation) to show students one way to manually compress an image.
- Students can use the *Activity 2: Color by numbers* activity guide from the CS Unplugged page. This activity explores how images are displayed, based on the pixel as a building block. In particular, the great quantity of data in an image means that we need to use compression to be able to store and transmit it efficiently.

## **Wrap up** (5 min)
### 6) Search for other compression algorithms.
- Ask students to quickly search online for other compression algorithms.
- Depending on the time you have left, this could be an out of class assignment.

## Extended Learning 
Use these activities to enhance student learning. They can be used as outside-of-class activities or other enrichment.

### Other Compression Algorithms
Research another compression algorithm used by computers. Record the URL of the website or video with a good explanation of how it works. List what you think are advantages and disadvantages of this type of compression.


## Assessment Questions  

- Why do we need data compression?
- How many bytes are in a gigabyte, terabyte, and petabyte? 
- If a 20 GB file was compressed to 15 GB, what is the percent of space savings? 
- How can a black and white image can be compressed using Run Length Encoding?


## Connections and Background Information
### CS Principles Learning Objectives

2.1.2 Explain how binary sequences are used to represent digital data. [P5]  
3.3.1 Analyze how data representation, storage, security, and transmission of data involve computational manipulation of information. [P4]  
	
### Other Standards

*CSTA K-12 Computer Science Standards*

Computational Thinking

-  3B-4. Evaluate algorithms by their efficiency, correctness, and clarity.

*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.
- 5. Use appropriate tools strategically.
- 7. Look for and make use of structure.



[/content]
