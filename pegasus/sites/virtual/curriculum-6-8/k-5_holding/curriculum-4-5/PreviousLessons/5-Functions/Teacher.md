---
title: "Lesson 5: Functions"
view: page_curriculum
theme: none
---

<!--
live preview (once saved to dropbox) is at http://staging.code.org/curriculum/4-5/5-Functions/Teacher.  don't share this URL!
-->

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'A Bit of Everything', :lesson=>5, :title=> 'Functions', :time=>60, :days=>1) %>

[content]

## K-1 Lesson Overview (Discovery, New Learning, Guided Practice, Creative, Assessment -pick one)
In this lesson, students will make a suncatcher out of string, beads, and a special charm. The students will follow a series of repetitive steps, then be asked to identify certain sets of  “skills” that are duplicated several times. Once those skills are defined, they will be called from a main program and the whole beautiful process of creation will be recorded on a single sheet of paper.

The final program will be geared toward the entire class, whatever their type of string, beads, and charms. To effectively allow for this, students will need to “abstract out” the details of their specific materials and create vague terms for an individual’s supplies.  This use of generic placeholders is a wonderful introduction to variables.


[summary]
## Teaching Summary
Illustrate how repetitive tasks can be stored in a small group that can be “called” several times, instead of wasting space with lots of copies of the same instruction. 

### **Getting Started** - 15 minutes

1) Review  
2) Introduce 

### **Activities: Tangrams and Paper Folding** - 30  minutes  

4) 

### **Wrap-up** - 5  minutes 
6) Reflection


[/summary]

## Lesson Objectives 

Students will:

- Learn to find patterns in processes  
- Think about an artistic task in a different way

# Teaching Guide
## Materials, Resources and Prep

- One foot of string, thread, or fishing line per student  
- 2-4 beads per student  
- 2-4 other accessories (buttons, hoops, spacers) per student  
- One special bead, prism, or student-made sun charm per student  
- One Skills Sheet per group


### For the Teacher

It can be fun to have the students make their sun charms in a previous class.  This can be done with shrink film or waxed paper. If you’re thinking far enough ahead, you can create these during the Intro lesson by encoding binary initials onto graphs that have been laser printed onto parchment. 



## Getting Started (15 min)
### 1)Review 
This review segment is intended to get the class thinking back to the last lesson.  If you are covering these activities out of order, please substitute your own review subjects here.

> **Class Participation Questions**:  
 - What did we do in our last lesson?  
- Do you remember what an algorithm is?


> **Elbow Partner Discussion**:  
 - Can you discuss an algorithm for making a snowman? 

### 2) Introduce  
The beginning of this lecture takes a bit of finessing.  It can be a challenge to get everyone to sit still while the activity is being explained, especially if the materials are already in front of them.  For this reason, I generally will not hand out materials until the end.

Begin by holding up your example suncatcher.  Let the class know that we will be making these today.  Their materials may be slightly different than yours, but the steps will be pretty much the same.  Pointing to your bead, you can tell them that their beads may be shaped differently, or might even be a different color, but you will use the word “bead” to mean whatever it is that they ended up with.  Similarly, their spacers may be a different size, different texture, or maybe a different material altogether, but you will use the word “spacer” to refer to those things.  Finally, we will all have a “special charm.”  It could be a large bead, a handmade ornament, or even a random item from the room, but in all cases, we will just call it a “special charm.”

As you share those terms, feel free to write the associated words on the board. If you want to set them equal to the items you discussed, that works well, also.

**Example:**
>Bead = “Whatever style, color, or kind of bead that you have been given”  
Spacer = “A long item that is not a bead”  
Special Charm = “The crystal prism, or large glass sphere”


Now you can move in to discussing how you made your sparkling piece of art. You can say something like:  

>“See my suncatcher? It’s made to hang from the rearview mirror of a car, but it can also dangle from a window or a backpack zipper.   We are going to make these today, and in the process, learn about programs, variables and functions.

>The first thing that I’m going to do is explain how I made this. Then, we’ll figure out the individual skills that it’s going to take to copy it.  After that, we’ll put those skills into a list so that everyone can follow the steps needed to make their own suncatcher. 

>Are you ready to hear how I made this?

>First, I put a bead on the string, then I tied a knot. I put another bead on a string, and tied another knot. Then, I put a spacer on the string and tied another knot. (If working with very young children, you may want to use pipe cleaners instead of string to avoid the knot complication.) 

>After that, I did it all again. I put a bead on the string, then I tied a knot. I put another bead on a string, and tied another knot. Then, I put a spacer on the string and tied another knot.

>Finally, I put on the special charm, and tied one last knot. 

>There were a lot of steps there, so let me go through it one more time a little more quickly.

>Bead, knot, bead, knot, spacer, knot. (It helps to have a bit of a rhythm with the words as you go through.)
Bead, knot, bead, knot, spacer, knot.
Special charm, final knot.”


At this point, your students will likely have questions or just need to hear the rhythm again.  Ask them if they think they can remember the sequence, then say it one more time altogether as a class.   

>“Bead, knot, bead, knot, spacer, knot.   
Bead, knot, bead, knot, spacer, knot.  
Special charm, final knot.”

If the class did well in the chant, you should be able to assume that they’ll remember the steps.  Here is where you can take out the Skills Sheet. Using a document projector, place the sheet so that only the programming steps are available.

Indicate that you’re going to write the steps down in this program, so that everyone has the directions in front of them. Using one instruction per line, have the class shout the steps out for you.

1. Bead
2. Knot
3. Bead
4. Knot
5. Spacer
6. Knot

By now, the class should be noticing an issue. If they don’t, you can lead them to it.  How many instructions do we have left to go through? How many lines do we have left?  What should we do?
Generally, someone will say something along the lines of: “Why don’t we put more than one item per line?”

That’s a good method of thinking. We want to combine a bunch of instructions together to save space. How might we do that? What would we group together? 

This is where you might hand out the Skills Sheet to everyone. Point out that there are two “extra” sections where they can combine steps so that you can write one name to call them all.  For instance, everything that you put into the top section, you can call all at once by calling “Skill 1”; this is a function.

Challenge the class to fill out their sheet in a way that makes sense and allows them to fit the entire sequence under the “Program” list in some way.  Give them about five minutes to complete their sheet (more for younger students) then listen to their suggestions. There will likely be groups that need to have the process explained one-on-one.  Ask them what they would do if they had to repeat the sequence a thousand times:

1. Bead
2. Knot
3. Bead
4. Knot
5. Spacer
6. Knot

It might help them get the concept a little more easily.

When someone gets it, share their solution with the rest of the class to see if they understand it. Then ask if anyone has another solution that works. Select one, then use it as a class to go over.  Point to each step in the “Program.” When you get to “Skill 1” or “Skill 2,” expand the line by moving your finger to the top of the page where that term is defined, and walk through each of the steps in that section. Doing so will help some of the remaining students catch on.

Finally, once the class is on board, let them follow the steps on their own to actually make their suncatcher pieces.


## Activity: Suncatcher (30 min)


### 3) Steps

Skill 1:

1) __________________________

2) __________________________

3) __________________________

4) __________________________

5) __________________________

6) __________________________


Skill 2:

1) __________________________

2) __________________________

3) __________________________

4) __________________________

5) __________________________

6) __________________________


Program:

1) __________________________

2) __________________________

3) __________________________

4) __________________________

5) __________________________

6) __________________________

7) __________________________

8) __________________________



[tip]

# Teaching Tip
K-3: For younger students, feel free to use pictures.  You can indicate a bead by drawing a rectangle with a hole in it.  A spacer can be a circle with a hole in it, and a special bead can be a star.  The symbols don’t matter as much as the fact that the students can translate between the picture and the actual item.


4-6: This is the optimal age group for this activity. Some students may still have problems with knots, but with a small demonstration of the two-finger method, they should get it rather quickly.  You can also show them how to use the tip of a pen to help slide the knot where they need it.

7-8: If it’s clear toward the beginning that the class is moving quickly through this activity, evolve from the original suncatcher idea toward allowing them to come up with a pattern on their own.  How many different patterns can they come up with using only two skills and a program?


[/tip]

## Wrap-up (5 min)
### 6) Reflection 



## Extended Learning 


## Vocabulary

**Abstraction** - Removing details from a solution so that it can work for many problems

**Function** - A piece of code that can be called over and over

**Function Call** - The place in your program where you call a function you have defined

**Function Definition** - The place where you assign a series of actions to one easy-to-remember name

**Program** - Instructions that can be understood and followed by a machine

**Variable** - A placeholder for a value that can change

[/content]
