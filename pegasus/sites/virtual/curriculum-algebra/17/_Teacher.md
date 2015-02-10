---
title: Conditionals and Piecewise Functions
view: page_curriculum
theme: none
---

<%
lesson_id = 'alg17'
lesson = DB[:cdo_lessons].where(id_s:lesson_id).first
%>

<%= partial('../docs/_header', :lesson => lesson) %>

[summary]

## Teaching Summary
### **Getting Started**
 
1) [Vocabulary](#Vocab)<br/>
2) [Conditionals](#GetStarted)  

### **Activity: Conditionals and Piecewise Functions**  

3) [Conditionals](#Activity1)   

### **Assessment**
4) [Conditionals Assessment](#Assessment)

[/summary]

[together]

# Teaching Guide

## Materials, Resources and Prep

### For the Teacher
- [Lesson Slide Deck](https://docs.google.com/a/code.org/presentation/d/1OnNkpXDU6GZreGRvquQU1qRKbEeH8WTvRU5DhlgI2Hk/)

[/together]

[together]

## Getting Started


### <a name="Vocab"></a> 1) Vocabulary
This lesson has three new and important words:<br/>

- **Clause** - a question and its corresponding answer in a conditional expression
- **Conditional** - a code expression made of questions and answers
- **Piecewise Function** - a function which evaluates the domain before choosing how to create the range

### <a name="GetStarted"></a> 2) Conditionals

- We can start this lesson off right away
  - Let the class know that if they can be completely quiet for thirty seconds, you will do something like:
     - Sing an opera song
     - Give five more minutes of recess
     - or Do a handstand
   - Start counting right away.
   - If the students succeed, point out right away that they succeeded, so they *do* get the reward.
   - Otherwise, point out that they were not completely quiet for a full thirty seconds, so they *do not* get the reward.
- Ask the class "What was the *condition* of the reward?"
  - The condition was *IF* you were quiet for 30 seconds
     - If you were, the condition would be true, then you would get the reward.
     - If you weren't, the condition would be false, then the reward woud not apply.
  - Can we come up with another conditional?
     - If I say "question," then you raise your hand
     - If I sneeze, then you say "Gesundheit."
     - What examples can you come up with?
- Sometimes, we want to have an extra condition, in case the "IF" statement is not true.
  - This extra condition is called an "ELSE" statement
  - When the "IF" condition isn't met, we can look at the "ELSE" for what to do
     - Example: IF I draw a 7, then everybody claps. Or ELSE, everyone says "Awwwwww"
     - Let's try it. (Draw a card and see if your class reacts appropriately.)
  - Ask the class to analyze what just happened. 
     - What was the IF?
     - What was the ELSE?
     - Which condition was met?
  - Believe it or not, we have even one more option.
     - What if I wanted you to clap if I draw a 7, or else if I draw something less than seven you say "YAY," or else you say "Awwwwwww"?
         - This is why we have the terms If, Else If, and Else.
         - If is the first condition
         - Else-if gets looked at only if the "If" isn't true.
         - Else gets looked at only if nothing before it is true.

Up to now, all of the functions you’ve seen have done the same thing to their inputs:

- green-triangle always made green triangles, no matter what the size was.
- safe-left? always compared the input coordinate to 0, no matter what that input was.
- update-danger always added or subtracted the same amount

Conditionals let our programs run differently based on the outcome of a condition. Each clause in a conditional evaluates to a boolean value - if that boolean is TRUE, then we run the associated expression, otherwise we check the next clause. We've actually done this before when we played the boolean game! If the boolean question was true for you, you remained standing, and if it was false you sat down.

Let's look at a conditional piece by piece:

(x > 10)  ->  "That's pretty big"
(x < 10)  ->  "That's pretty small"
else      ->  "That's exactly ten"

If we define x = 11, this conditional will first check if x > 10, which returns TRUE, so we get the String "that's big" - and because we found a true condition we don't need to keep looking.

If we define x = 10, then we first check if x > 10 (FALSE), then we check x < 10 (FALSE), so then we hit the _else_ statement, which only returns if none of the other conditions were true. The _else_ statement should be considered the catch-all response - with that in mind, what's wrong with replying "That's exactly ten"? What if x = "yellow"? If you can state a precise question for a clause, write the precise question instead of else. It would have been  for beginners to write the two questions (x > 10) and (x <= 10). Explicit questions make it easier to read and maintain programs.

Functions that use conditions are called piecewise functions, because each condition defines a separate piece of the function. Why are piecewise functions useful? Think about the player in your game: you’d like the player to move one way if you hit the "up" key, and another way if you hit the "down" key. Moving up and moving down need two different expressions! Without cond, you could only write a function that always moves the player up, or always moves it down, but not both.
     
Now let's play a game.

 
[/together]

[together]

## Activities:
### <a name="Activity1"></a> 3) Conditionals and Piecewise Functions

Say to the class:

- If I say *startAll*, then you all stand up and become computers that are obeying commands that are given.
- If I say *shutDownAll*, then you all sit down and are no longer processing commands.  This is how we end the game.
- If I say *shutDown*([“name1”,”name2”,...]), then any names listed must sit down.  When an individual makes a mistake, this is how they are removed from the game.  
- Other than these commands, there is only one other command you know:  
  *SimonSez*(“action”)

The contract for SimonSez looks like this:
SimonSez: String -> studentAction

Review the contract parts:  name, domain, range, parameters(input types), return types(output values)

Say to the class: “Here is what the initial code looks like.  We will add several clauses but the clauses that are there will always be there and the final else action (often called the default result) will always be Left Hand Down.”

>  if (“Right Hand Up”) -> RaiseRightHand  
>  elseif (“Right Hand Down”) -> LowerRightHand  
>  elseif(“Left Hand Up”) -> LeftHandUp  
>  else LeftHandDown  

Example Play: (before beginning, you may want to review right and left with them, perhaps even writing it on the board for the slightly dyslexic) 

- startAll
- SimonSez(“Right Hand Up”)
- SimonSez(“Right Hand Down”)
- SimonSez(“Left Hand Up”)
- SimonSez(“Right Hand Up”)
- SimonSez(“Hokey Pokey”)   // should put left hand down.
- SimonSez(“Left Hand Up”)
- SimonSez(“Right Down”)      // “trick”.  No matches. Goes to default

If anyone makes a mistake above make sure to say shutDown([“Sam”,”Pat”,Francis”...])

You will likely want to go one more round before doing a restartAll.

Say to the class:  “We will now add the following clauses to the middle of our code.  All the other pieces are still there.”

> elseif(“Turn 180”) -> Turn180Clockwise  
> elseif(“Turn 90”) -> Turn90Clockwise  

Possible “tricks” to throw in as you randomly call out commands:  “Raise Right Hand”, “Lower Left Hand”, “Turn -90”, “Turn 270”, “Spin”

Continue playing using both the commands in the clauses as well as the suggested “tricks” that will result in the default else of Left Hand Down.  Note that if Left Hand is already Down, this command still works but appears to do nothing.  Be sure to make students sit when then do things incorrectly.  Play until the students stop making errors and then add more clauses OR let one of the students be the controller and you join the ranks of the computers.

Other suggestions to add (all at once or two at a time):
> elseif(“Right Leg Forward”) -> RightLegForward  
> elseif(“Right Leg Normal”) -> RightLegNormal  
> elseif(“Left Leg Backward”) -> LeftLegBackward  
> elseif(“Left Leg Normal”) -> LeftLegNormal  
> elseif(“Head Look Up”) -> HeadLookUp  
> elseif(“Head Look Normal”) -> HeadLookNormal  

Note that if you want to add movement like step forward that you might want to add a sub-conditional such as “If way is blocked, ignore” or “If way is blocked, turn 180”.

### Connection to Mathematics and Life

There are piecewise functions in Mathematics as well.  The absolute value function y = |x| can be re-written as   
y = { -x : x<0 , x : x>0, 0 }  
Note that in mathematical terms, that the clause for the domain is usually listed second instead of first.  

A data plan on a phone bill might be structured as:

* $40 for less than 5 GB
* $ 8 per GB for 5-10 GB
* $12 per GB for using more than 10GB. 

This could be graphed with the following piecewise function y = { 40: x<5, 8x: 5 =< x =< 10, 12x: x>10 }

[/together]

[together]

## Assessment 
### <a name="Assessment"></a>4) Conditionals Assessment

Visit [MSM Stage 17](http://studio.code.org/s/algebra/stage/17/puzzle/1) in Code Studio to complete the assessments.

[/together]

<%= partial('../docs/_footer', :lesson => lesson) %>