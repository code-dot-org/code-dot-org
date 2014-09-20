---
title: "Unit 1 Day 16: Lossy and Lossless Compression"
view: page_curriculum
theme: none
---

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'Sending Bits', :lesson=>16, :title=> 'Lossy and Lossless Compression', :time=>50, :days=>1) %>

[content]


## Lesson Overview (New learning)
This lesson expands on the concepts of Lesson 15. After learning about compression and how to compute a compression percentage, students will consider the difference between lossy and lossless compression. Students see one example of lossy and one example of lossless compression in the context of text, while reinforcing their knowledge of how to compute compression. Students will then investigate the pixelation of images with an online tool, and will independently compute compression. The lesson ends with a group discussion about whether pixelation is lossy or lossless. 

[summary]

## Teaching Summary
### **Getting Started** - 5 minutes
1) Think-Pair-Share: Are you using compression when you send a text? 

### **Activity: Lossy Compression of Text** - 10  minutes  
2) Send messages with lossy Compression.

### **Activity: Lossless Compression of Text** - 15  minutes  
3) Use an online text compression tool.

### **Activity: Pixelation as a form of Compression**  - 15 minutes
4) Use an online pixelation tool and compute the  compression. 

### **Wrap-up** - 5  minutes 
5) Group discussion:  Is pixelation a lossy or lossless form  of compression?


[/summary]

## Lesson Objectives 
The students will...   

- Explain the difference between lossy and lossless compression.
- Compute compression with a calculator.
- Determine whether pixelation is a lossy or lossless form of compression.
 
 
# Teaching Guide
## Materials, Resources and Prep
### For the Student
- Strips of paper to send compressed messages to another student 
- [Text compression tool](resources/TextCompressionTool.html)
- Online [Pixelation Tool](http://www131.lunapic.com/editor/?action=pixels)
- Access to a digital image to upload to the online Pixelation Tool
- Ability to download an image from the web onto their computer

### For the Teacher
- Background reading [How Stuff Works](http://computer.howstuffworks.com/file-compression.htm)


## Getting Started (5 min)
### 1) Think-Pair-Share  
- Remind students of the activity is the previous class meeting. "Recall what you learned about compression in the last class meeting. Are you using compression When you send a text message?"  
- Don't focus on resolving all of the students' questions. Use these questions to lead into the activity.

## Activity: Lossy Compression of Text (10 min)
### 2) Send messages with lossy Compression
- Demonstrate compressing a segment of text by removing the vowels.
- Ask students to write a message and compress it using this method. 
- Use rotation to pass the messages around the room, ensuring that each students sends and receives a message.  
- Ask the student receiving the message to de-compress the message by writing out the original message.
- Pass the original back to the sender. Instruct the sender to compute the compression using the formula:  **(OldSide - NewSize)/ OldSize**. Multiply the answer by 100 to express it as a percent.
- Ask the students: Did you count spaces? Should they be counted? 

[tip]

# Teaching Tip  
Sending messages to other students is motivational, especially when  the receiver must work to determine the content of the original message. Before this activity, you may want to discuss "message appropriateness."  

[/tip]

## Activity: Lossless Compression of Text (15 min)
### 3) Use an online text compression tool.
- Direct students to the [Text Compression Tool](resources/TextCompressionTool.html).
- As a whole class, demonstrate how to use the tool. Explain what the term "dictionary"  means here.  Explain how the compression is computed.
- Working in pairs, have students choose one of examples on the page and make the best compression possible. 
- As students work, walk around the room and ask them questions about what they are doing.
- If you have time, have students write their best compression rates on the board, to see if other teams can improve on their result.

## Activity: Pixelation as a Form of Compression (15 min)
### 4)  Use an online pixelation tool and compute the  compression.
- Direct students to [http://www131.lunapic.com/editor/?action=pixels](http://www131.lunapic.com/editor/?action=pixels).
- Demonstrate how to upload an image file, or use an image from Facebook or Picassa.
- Demonstrate how to pixelate the image using Adjust->Pixelate function.
- Demonstrate how to download the file to your computer and compute the compression.
- Give students time to work on a file of their own. 
- If time permits, ask students share their pixelated files with the class. Ask the students to guess what the original image contained.

## Wrap-up (5 min)
### 5) Share and summarize.
- What kinds of compression rates did you achieve with the various compression schemes?
- Is pixelation a lossy or lossless compression scheme?

## Extended Learning 
Use these activities to enhance student learning. They can be used as outside-of-class activities or other enrichment.

### Research Compression
Read about different forms of compression. Find a website that explains or demonstrates various compression schemes. Demonstrate the compression scheme websites to the class.

## Assessment Questions
- What is the difference between lossy and lossless compression?
- Is pixelation a form of lossy or lossless compression? Defend your answer. 
- If a file was originally 500 bytes, but was compressed to 400 bytes. What is the rate of compression?


## Connections and Background Information
### CS Principles Learning Objectives

 2.1.2 Explain how binary sequences are used to represent digital data. [P5]  
 3.3.1 Analyze how data representation, storage, security, and transmission of data involve computational manipulation of information. [P4] 

### Other Standards

*CSTA K-12 Computer Science Standards*

Collaboration   

- 2-4: Exhibit dispositions necessary for collaboration: providing useful feedback, integrating feedback, understanding and accepting multiple perspectives, socialization.

 Computational Thinking

-  3B-4. Evaluate algorithms by their efficiency, correctness, and clarity.
 

*Common Core State Standards for Mathematical Practice*

- 2. Reason abstractly and quantitatively.
- 4. Model with mathematics.

[/content]
