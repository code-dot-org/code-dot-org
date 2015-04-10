Say to the class:

- Let's play a game - I'll be a programmer, and you will all be my computers
- I'll be using a function called simon_says, which takes in a single Number and returns String
- As highly intelligent computers, your job is to interpret that string you bodies to display it
  - For example, if you recieve the string "Left Hand Up" your left hand should be up
  - Unless you recieve the string "Reset" you should maintain your prievious display, updating only what is necessary
  - If you fail to show the correct dispaly, your computer will be considered "crashed" and you must sit down and wait for the next game to reboot.
  
Walk through some examples with the class to see how the Strings are intepreted
- Everyone starts stand up, hands at their sides
- The simon_says function returns "Left Hand Up" - students should have their left hand up in the air
- The simon_says function returns "Right Hand Up" - students should have BOTH hands up in the air
- The simon_says function returns "Left Hand Down" - students should have their left hand down and their right hand up
- The simon_says function returns "Right Hand Up" - students should still have their left hand down and their right hand up
- The simon_says funtion returns "Reset" - students should have both hands at their sides

Now that 

The contract for SimonSez looks like this:
SimonSez: String -> studentAction

Review the contract parts:  name, domain, range, parameters(input types), return types(output values)

Say to the class: “Here is what the initial code looks like.  We will add several clauses but the clauses that are there will always be there and the final else action (often called the default result) will always be Left Hand Down.”

<pre><code>
if      (cmd == 1) -> "Right Hand Up"
elseif  (cmd == 2) -> "Right Hand Down"
elseif  (cmd == 3) -> "Left Hand Up"
elseif  (cmd == 4) -> "Left Hand Down"
else               -> "Reset"  
</code></pre>

Example Play: (before beginning, you may want to review right and left with them, perhaps even writing it on the board for the slightly dyslexic) 

- startAll
- `simon_says(1)`
- `simon_says(5)`
- `simon_says(2)`
- `simon_says(2)`
- `simon_says(“Hokey Pokey”)`   // should put left hand down.
- `simon_says(“Left Hand Up”)`
- `simon_says(“Right Down”)`      // “trick”.  No matches. Goes to default

If anyone makes a mistake above make sure to say `shutDown([“Sam”,”Pat”,Francis”...])`

You will likely want to go one more round before doing a restartAll.

Say to the class:  “We will now add the following clauses to the middle of our code.  All the other pieces are still there.”

> elseif(“Turn 180”) -> Turn180Clockwise  
> elseif(“Turn 90”) -> Turn90Clockwise  

Possible “tricks” to throw in as you randomly call out commands:  “Raise Right Hand”, “Lower Left Hand”, “Turn -90”, “Turn 270”, “Spin”

Continue playing using both the commands in the clauses as well as the suggested “tricks” that will result in the default else of Left Hand Down.  Note that if Left Hand is already Down, this command still works but appears to do nothing.  Be sure to make students sit when then do things incorrectly.  Play until the students stop making errors and then add more clauses OR let one of the students be the controller and you join the ranks of the computers.

The next suggestion is a little tricky but will help them both process ands as well as realize that once a condition has been met that no additional else statements are evaluated.

> elseif(“hands ”+# and #>1) -> TwoThumbsUp  
> elseif(anything+# and #&lt;5) -> BothHandsDown 

Remind students that this is really pseudocode.  To evaluate the conditionals properly, there would need to be some extra work to parse out the parts of the input string.

The two new conditionals work like this.  
If the command contains “hands” plus a number and that number is greater than 2 then they do two thumbs up (elbows bent).
If the command contains ANY text (which includes none at all) and a number and that number is less than 5 then they put both hands back down in the relaxed position
Example:

> SimonSez(“hands 2”) -> TwoThumbsUp  (only!! Will not evaluate the #&lt;5)   
> SimonSez(“whatever 2”) -> BothHandsDown  
> SimonSez(“blah blah blah -1”) -> BothHandsDown  
> SimonSez(“hands 1”) ->  BothHandsDown  
> SimonSez(“hands 7”) ->  TwoThumbsUp  
> SimonSez(“whatever 7”) -> LeftHandDown (falls all the way through)  
> SimonSez(“4”)->BothHandsDown  


Other suggestions to add (all at once or two at a time):
> elseif(“Right Leg Forward”) -> RightLegForward  
> elseif(“Right Leg Normal”) -> RightLegNormal  
> elseif(“Left Leg Backward”) -> LeftLegBackward  
> elseif(“Left Leg Normal”) -> LeftLegNormal  
> elseif(“Head Look Up”) -> HeadLookUp  
> elseif(“Head Look Normal”) -> HeadLookNormal  

Note that if you want to add movement like step forward that you might want to add a sub-conditional such as “If way is blocked, ignore” or “If way is blocked, turn 180”.