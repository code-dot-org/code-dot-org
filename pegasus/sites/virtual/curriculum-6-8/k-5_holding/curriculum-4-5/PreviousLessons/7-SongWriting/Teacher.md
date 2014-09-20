---
title: "Lesson 7: Song Writing"
view: page_curriculum
theme: none
---

<!--
live preview (once saved to dropbox) is at http://staging.code.org/curriculum/4-5/7-SongWriting/Teacher.  don't share this URL!
-->

<%= partial('curriculum_header', :unitnumber=>1, :unittitle=>'A Bit of Everything', :lesson=>7, :title=> 'Song Writing', :time=>60, :days=>1) %>

[content]

## K-1 Lesson Overview (Discovery, New Learning, Guided Practice, Creative, Assessment -pick one)
Reading lyrics is a pretty intuitive venture for most students.  We’ll take an activity that’s already common knowledge and shift it into a solid education on defining and calling functions. Once students are familiar with the define/call process, we will add the extra capabilities that come along with passing parameters within those function calls.


[summary]
## Teaching Summary
Learn how to define and call functions.


### **Getting Started** - 15 minutes

1) Review  
2) Introduce 

### **Activity: Song Writing** - 30  minutes  

3) 

### **Wrap-up** - 5  minutes 
4) Reflection


[/summary]

## Lesson Objectives 

Students will:

  - Learn about defining functions  
- Practice calling functions  
- See the practicality of passing variables as parameters



# Teaching Guide
## Materials, Resources and Prep

- Paper and pencils for writing songs  
- Printouts of famous children’s songs with lyrics that change slightly



### For the Teacher

- If possible, introduce students to the songs in the lesson at least a day ahead of time.  
- Have some song lyrics ready for display, and others printed as handouts



## Getting Started (15 min)
### 1)Review 
This review segment is intended to get the class thinking back to the last lesson.  If you are covering these activities out of order, please substitute your own review subjects here.

> **Class Participation Questions**:  
 - What did we do in our last lesson?  
- What is a function?  
- What does it mean to call a function?  
- What is a counter block?


> **Elbow Partner Discussion**:  
 - In many languages, “counter blocks” are called “for loops.” They’re called that because you do *something* **FOR** all values of the counter from the minimum to the maximum. 
Pretend you have a counter block that  keeps track of your age. From age 5 to age 10, you grow two inches a year.  From age 11 to age 17, you grow an inch every two years. 
This requires two blocks.  What is the minimum value, maximum value, and add-on amount for each block?

### 2) Introduce  
This lesson works best if you leap right in.  Write the following on the board, or project with a document camera.

>CHORUS:  
> > Oh, dear! What can the matter be?  
Dear, dear! What can the matter be?  
Oh, dear! What can the matter be?  
Johnny's so long at the fair.  


>SONG:
> > CHORUS  
He promised to buy me a trinket to please me,
And then for a smile, oh, he vowed he would tease me,
He promised to buy me a bunch of blue ribbons
To tie up my bonnie brown hair.

> > CHORUS  
He promised to bring me a basket of posies,
A garland of lilies, a gift of red roses,
A little straw hat to set off the blue ribbons
That tie up my bonnie brown hair.

> > CHORUS


Hopefully you’ve had the chance to set the stage by listening to this song inconspicuously a time or two before the lesson (probably a difficult task in grades 6+). Let the class know that you’re going to sing the song together really quickly.  For older kids, you may have to let them know you’ll be checking to make sure everyone has sound coming out of their mouths!

Sing through the song once, then after the applause (let them be loud and proud about it) slyly point out a fact to them: 

> “Oddly, none of you (or very few of you) sang the actual word ‘CHORUS’.  You didn’t say, ‘CHORUS. He promised to buy me a trinket…’  Why is that?”


Your class may not exactly know why they sang the way they sang.  Some may know the song, others may have figured out the technique. This is a great time to point out the terminology of “function definition” and “function call.”
<hr>




The second part of this is introducing a song where the chorus lyrics change slightly for each round:

> CHORUS **(sound)**:  
> > With a **sound sound** here  
And a **sound sound** there  
Here a **sound**, there a **sound**  
Everywhere a **sound sound**  
Old MacDonald had a farm  
E-I-E-I-O


> SONG:  
> > Old MACDONALD had a farm  
E-I-E-I-O  
And on his farm he had a cow  
E-I-E-I-O

> > CHORUS(**“Moo”**)

> > Old MACDONALD had a farm  
E-I-E-I-O  
And on his farm he had a pig  
E-I-E-I-O

> > CHORUS(**“Oink”**)

> > Old MACDONALD had a farm  
E-I-E-I-O  
And on his farm he had a duck  
E-I-E-I-O  

> > CHORUS(**“Quack”**)


Go through a few of these verses together, then allow the students to add-on to the song with lyrics about other animals.  What would you put in the chorus parentheses for a dog? A cat? Hopefully they will intuitively know what happens with the sounds that they provide, but if they aren’t making a connection between passing a word in through the parentheses and calling that word inside the definition of the chorus, show them explicitly by using one finger to indicate which sound you are using, and another to trace where you are in the chorus.

Your students probably won’t have realized it, but they have just learned how to pass a parameter to a function! Point that out in so many words, and show them that this is exactly how programmers share bits of information with functions that they have written.  You can pass certain values into a function, so that the function can use the information with the code inside.  The function will just replace the reserved word (which, in our song, it created in the form of the variable sound) with whatever word you gave it inside the parentheses.

Let’s test that newfound knowledge:

CHORUS(**thing**, **place**, **did**):
> ‘Cause I stuck a **thing** in a hole in the **place** and it **did**, and **did**, and **did**.


SONG:
> I’m going to be the most famous kid, because of the thing that I just did.  
CHORUS(“**seed**”, “**ground**”, “**grew**”)

> I’m going to be the most famous kid, because of the thing that I just did.  
CHORUS(“**plug**”, “**boat**”, “**floats**”)

> I’m going to be the most famous kid, because of the thing that I just did.  
CHORUS(“**head**”, “**sky**”, “**flies**”)

Now, this song is completely made up.  It’s here to give an opportunity to the class to figure out what happens when you pass more than one parameter to a function.  Feel free to use it, making up your own tune, or recreate the song altogether with three different opportunities for variables in the chorus.

When the students are able to sing through the song, understanding which variable goes where, break them into groups and have them figure out how to rewrite other children’s songs:

> 1.  Five Little Monkeys  ← Most Simple  
2.  Farmer in the Dell  ← Tougher  
3.  Hickory Dickory Dock ← More Complicated

After the students have had a while to work, bring them together to share their results.  How many people did it the same way?  How many had different solutions?



## Activity: Song Writing (30 min)



[tip]
# Teaching Tip
K-3: For younger students, feel free to use pictures.  You can indicate a bead by drawing a rectangle with a hole in it.  A spacer can be a circle with a hole in it, and a special bead can be a star.  The symbols don’t matter as much as the fact that the students can translate between the picture and the actual item.

4-6: This is the optimal age group for this activity. Some students may still have problems with knots, but with a small demonstration of the two-finger method, they should get it rather quickly.  You can also show them how to use the tip of a pen to help slide the knot where they need it.

7-8: If it’s clear toward the beginning that the class is moving quickly through this activity, evolve from the original suncatcher idea toward allowing them to come up with a pattern on their own.  How many different patterns can they come up with using only two skills and a program?

[/tip]


## Wrap-up (5 min)
### 4) Reflection 



## Extended Learning 


## Vocabulary


**Chorus** - A piece of music that repeats often

**Function** - A piece of code that can be called over and over

**Function Call** - The piece of a program that sends the computer to a function

**Function Definition** - The piece of a program that tells the computer what to do when the code calls a function

**Parameters** - Extra information that you can give to a function to customize it

**Recursive** - A definition that refers to the word it is trying to define

[/content]
