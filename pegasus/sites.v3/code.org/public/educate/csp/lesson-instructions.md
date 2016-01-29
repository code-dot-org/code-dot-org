# UNIT 3 CODE STUDIO LEVEL INSTRUCTIONS
<hr />

# Lesson 18: Secret Number 

# Level 6 - *if* Statement

<img src="https://images.code.org/040c8364e3795252194b816623e949e5-image-1446227663554.54.03 PM.png" style="width: 100px; float: right">

The boolean expression we tested on the last level allows us to make decisions. In order to make these decisions we need to use something called a conditional. **Conditionals check if a boolean expression is true and then will execute the code inside of the `if` statement.** 

<img src="https://images.code.org/84123a7c317c63d8876b6b56086d717e-image-1446228290588.png" style="width: 150px; float: right">

Over the number couple levels we are going to be creating a **Guess My Number game**. The starter code uses `promptNum` to ask the user for a number from 1 to 10. The `if` statement checks if the user guess is equal to the secret number. Right now nothing happens when they guess the right number. Can you fix that?

## Do This:

* Read the code to identify the boolean expression.
* Add a text label to the screen. Have it start out with "Guess my secret number!"
* **Set the text label to say "You got it right!" from inside the `if` statement**. This will tell them they get it right only when that condition is true!
* **Test your code out** to make sure it works.

<img src="https://images.code.org/2f3487ec7a8d7cec1605f3da830c83f8-image-1446227512726.gif" style="width: 350px">

<hr />
# Level 7 - Dropdown

On the last level we used `promptNum` to get the user's guess. However, we had no way to limit them to the numbers we wanted. They could have typed 11 even though we told them not to. A better way to get input with a limited set of options is the dropdown. The <img src="https://images.code.org/3b21b4288a2a155d1e9a3c2cf3a5b09b-image-1446229368079.28.23 PM.png" style="width: 75px"> is in your Design Mode Toolbox. You can control the list of options users can choose and then use `getText` to get the chosen number.

We are going to need an event handler in order to do this. The event handler will detect when the user has changed the value of the dropdown. 

## Do This:

* **Add a dropdown** for their guess instead of `promptNum`. Make sure to give it a good ID.

<img src="https://images.code.org/fea164f6e53d1ce0c50981565e066d4c-image-1446229598357.gif" style="width: 350px">

* Under properties **find the Options** and change it to the **numbers 1 to 10**

<img src="https://images.code.org/0cfecbcdcfb95fc30876155ec6a3a021-image-1446229593687.gif" style="width: 250px">

* Add an event handler to detect the `change` event on your dropdown.<br><br>
<img src="https://images.code.org/48cffda5b7ff3a446116a39b4dbcbe8c-image-1446232308751.gif" style="width: 150px; float: right">
* Move your `if` statement inside the event handler so it will check each time the dropdown is changed.<br><br>
* When the dropdown is changed **use `getText` to find out the user's guess**. Save the guess using a variable. **Don't forget about scope!**<br><br>
* Test your app -- it should work like the demo.

<hr />
# Level 8 - What happens after an *if* ?

You may have noticed that our flowchart for our game so far only does something if the condition is true. What happens after the `if` statement? Let's find out.

<img src="https://images.code.org/90b7a527091704a6ab4612b9f84db305-image-1446234882661.png" style="width: 200px">

## Do This:

* **Add a `setText` after the `if` statement** to "Nope. Guess again."

<img src="https://images.code.org/f5c5de1b77a9caf16027e65ed24f91ec-image-1446234785600.gif" style="width: 450px">

* **Run the program** a couple times to **look for a bug**. We will fix this on the next level.

<hr />

# Level 10 - *else*

<img src="https://images.code.org/b7942d778a54465ad6f9f19fbab8d1ef-image-1446237289306.34.23 PM.png" style="width: 150px; float: right">

Let's add an `else` statement so we can tell the user when they are right and when they are wrong.

**Note:** You can create an `else` statement by hitting the <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> at the bottom of an `if` statement. There is also an `if-else` block in the toolbox. 


## Do This:

* **Add an `else` statement**
* **Move your `setText` inside the `else` statement.** So it should say "Nope that's not it. Guess again." when the user does not guess the secret number.

<hr />

# Level 12 - *else-if*

Let's help the user even more by telling them if they were right or if their guess was high or low. There are **only 3 possible cases:** 

* They were right.
* Their guess was higher than the number.
* Their guess was lower than the number. 

Therefore, we can use a conditional set with one `if`, one `else-if`, and one `else` to implement this. Check out the flowchart below to see the logic. In order to check if something is high remember you can use the greater than `>` symbol.

**Remember:** You can create an `else-if` statement by hitting the <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> at the bottom of an `if` statement. The first <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> will add an `else`, the second will add an `else-if`.


## Do This:

* **Add an `else-if` statement to accommodate the 3 conditions.**
* **Update the conditions** using `<`, `>`, and `==` to tell the user if their guess was correct, high, or low.
* **Test out the program** to make sure your updates worked.

<img src="https://images.code.org/f7e483414dfe1d4585841e653e44d8b0-image-1446169181724.png" style="width: 100%">

<hr />

# Level 13 - Debug Conditionals

Help! **I was trying to give the player a hint when their guess was within 2 of the secret number but the code I wrote isn't working.** Can you fix it?

Check out the flow chart for the logic I wanted. **Hint:** The major problem here is that **conditional statements run in order from top to bottom**. Remember you have to check the smallest case first. Which set of numbers is larger (guess > secret number) or (guess > secret number + 2) ?


## Do This:

* Run the code to identify when the program is not working correctly.
* Fix the problem with the order of the conditionals.

<img src="https://images.code.org/49a498425a6bd482523123ef46a1a747-image-1446416359338.png" style="width: 100%; float: right">
<a href="https://images.code.org/49a498425a6bd482523123ef46a1a747-image-1446416359338.png" target="_blank">Open diagram in a new tab</a>

<hr />

# Lesson 18: Dice Game
# Level 14 - Using `if` to Display Images

We are going to set up a dice game. We want to show a picture of a single die for each random number generated 1 to 6. We've already set up the screen in Design Mode, with a button to generate the roll and an image to show a picture of the die.

**Note:** The flowchart for the desired behavior is below.

## Do This:

* Add an event handler for the Roll! button so that when the button is clicked it generates a random number from 1 to 6. 
* Add conditionals (`if`, `else if`, and `else`) to change the picture of the image (ID: `dice_image`) to display the correct side of the die depending on the random number generated. You will need to use <img src="https://images.code.org/89f2c13ef4ead590475c863a087597f8-image-1446535826599.30.16.png" style="width:150px"> with the URLs below to set the images for the die.
* <img src="https://code.org/images/dice/1.png" style="width: 50px"> Dice 1 Image URL - https://code.org/images/dice/1.png
* <img src="https://code.org/images/dice/2.png" style="width: 50px"> Dice 2 Image URL - https://code.org/images/dice/2.png
* <img src="https://code.org/images/dice/3.png" style="width: 50px"> Dice 3 Image URL - https://code.org/images/dice/3.png
* <img src="https://code.org/images/dice/4.png" style="width: 50px"> Dice 4 Image URL - https://code.org/images/dice/4.png
* <img src="https://code.org/images/dice/5.png" style="width: 50px"> Dice 5 Image URL - https://code.org/images/dice/5.png
* <img src="https://code.org/images/dice/6.png" style="width: 50px"> Dice 6 Image URL - https://code.org/images/dice/6.png

<img src="https://images.code.org/392c125a2620ac4949091fc075864f4c-image-1446174585241.png" style="width: 100%">
<a href="https://images.code.org/392c125a2620ac4949091fc075864f4c-image-1446174585241.png" target="_blank">Open diagram in a new tab</a>

<hr />

# Level 15 - Adding Guess and Score to Dice Game

Let's have the user guess the number that will come up when we roll a single die. 

You can have multiple `if` statements, one after another, if they have different purposes which are separate. 

** Note: ** Use the flowchart below to help you figure out the logic of the game.

## Do This:

* **Add a dropdown** to take in the user's guess from 1 to 6.
* **Add a set of `if` statements to check if the dice roll number is equal to the user guess.** Put this set of `if` statements after your set of `if` statements for the dice image. It should be completely separate from the other set of `if` statements. 
* Create a variable to **keep track of score**. Give 10 points if they guess right and take one point away when they guess wrong.
* **Display the score** on the screen and update it after each dice roll.

<img src="https://images.code.org/ac24917ca18606f6f3c31a6be1a16d73-image-1446174953979.png" style="width: 100%">
<a href="https://images.code.org/ac24917ca18606f6f3c31a6be1a16d73-image-1446174953979.png" target="_blank">Open diagram in a new tab</a>

<hr />
# Level 16 - Adding Difficulty Levels: Dropdowns with Strings

Let's add another element to our dice game: **difficulty levels**. The user will pick either "Easy" or "Hard." These are strings so you might be wondering how to check for equality. **The `==` works on strings as well!** It checks if the first string is exactly the same as the second string. **Strings must be the same letters and even have the same case to be equal**! So "dog" and "Dog" would not be equal. 

## Do This:

* **Add a dropdown** for difficulty level with the options of "Easy" or "Hard." 
* **Create an `if` statement for difficulty level** which prints the difficulty level to the console.

<img src="https://images.code.org/9db291c8dd4192390e008aa764576cd3-image-1446175136919.png" style="width: 100%">
<a href="https://images.code.org/9db291c8dd4192390e008aa764576cd3-image-1446175136919.png" target="_blank">Open diagram in a new tab</a>

<hr />
# Level 17 - Nested *if* Statements

<img src="https://images.code.org/1774efb17571d3370662e34b705dde47-image-1446485939643.37.11 PM.png" style="width: 150px; float: right">

**Let's change the scoring of the game to match the difficulty level.** 

New scoring rules:
* _Easy: +10 points right answer / -1 point for wrong answer_
* _Hard: +1 point right answer / -1 point for wrong answer_

How do we check _both_ the difficulty level and if the user's guess was correct? **We can actually put `if` statements inside of other `if` statements!** So we first want to check what the difficulty level is and then check if the user was right or wrong to determine the score.

** Note: ** The flowchart below outlines the logic you are trying to implement.

## Do This:

* Move a copy of the score `if` statement inside of the difficulty levels. Be careful with indenting. All of the `if` statements for score need to be inside of the difficulty `if` statement (i.e. indented 1 level more than the difficulty `if` statement)

<img src="https://images.code.org/2125a027997aeca75d18b8423058063d-image-1446485524945.gif" style="width: 350px">


* Edit the `if` statements to give the correct scores
* Easy level (+10 right, -1 wrong)
* Hard level (+1 right, -1 wrong)

<img src="https://images.code.org/3b95a9f5cca60fc0ffbf7c2fb174d737-image-1446175290414.png" style="width: 100%">
<a href="https://images.code.org/3b95a9f5cca60fc0ffbf7c2fb174d737-image-1446175290414.png" target="_blank">Open diagram in a new tab</a>

<hr />
# Lesson 23 - Coin Simulation

# Level 3 - Starting Small

To start, we're going to simulate flipping a coin 10 times. You might be thinking that isn't many coin flips, and that we could just do those flips in real life, but this is actually an important step in developing a simulation. At small scales we can make sure our code is working as intended because **we can still visually confirm its output**. Once we're convinced that the logic of our program is reliable we'll move up to simulating larger numbers of flips.

The core logic of our program will be focused on **a `while` loop** that simulates flipping a coin by repeatedly generating **random 0's or 1's using `randomNumber`**. This is a great opportunity to keep practicing using loops while applying your knowledge of variables, iteration, and `if` statements.

## Do This:

* When we want to flip a coin with a computer we will instead **generate a random number between 0 and 1**.
* Write a program that **uses a `while` loop** to **flip a coin 10 times** and writes the value of each flip to the screen. The example below shows how your program should run.
* **HINT:** you will need to use a counter variable in your `while` loop to keep track of how many times the coin has been flipped. 

![](https://images.code.org/970622047b06af13ea7bdd50ee86bcbf-image-1446739178483.gif)

< hr />
# Level 4 - Counting Heads

Let's say that a **1 is a heads**. If want our simulation to run until we reach a certain number of heads then **we will need a way to count the number of heads that have been flipped**. In order to do this you will need to add a variable that acts **as a counter**. Initialize it to 0, and every time you flip a heads (1) **increment your counter by 1**. At the end of your program you should write the value to the screen.

## Do This:

* Add a variable that **counts the number of heads (1's)** and write its value to the screen after each flip.
* Run your program severals times **and validate that the number of heads recorded is correct** by visually checking the flips you've printed to the screen.
* **Hint:** you will also need to store your current coin flip in a variable to complete this challenge.

![](https://images.code.org/0d99569cd223c63e2166d610d09fd525-image-1446859813702.gif)

<hr/>
# Level 5 - Changing the Loop Condition

Currently our loop condition is based on a counter variable that keeps track of the total number of flips, but our simulation should only run **while we have fewer than the target number of heads**. In this exercise you are going to change the condition used by your `while` loop so that your **simulation terminates once you have flipped 5 total heads**. At the end of the loop we will **write the total number of flips** to know how many flips it took to get 5 heads.

## Do This:

* Change the looping condition to use the variable you are using to keep track of the number of heads. **Your loop should run as long as you have fewer than 5 total heads**.
* Add code after your loop that **writes the total number of flips**.
* **Test your program** several times to make sure it works as expected. See the example below.
* **Note:** the simulation is always terminating once it flips its 5th heads. Sometimes this means the text output runs off the screen. We will address this in the next exercise.

![](https://images.code.org/878ff327142ebad8f81ecd8cdf58b14a-image-1446861064994.gif)

<hr /> 
# Level 6 - 10,000 Heads!

You're ready to increase the number of heads your simulation is looking for and **test your first hypothesis**. Before we move up to the full 10,000 heads, however, we're going to perform a quick check of our program logic. When you make changes to your program **it is possible that some portion of your programming logic will stop working as you expected**. In order to feel more confident about your model you will **first change the number of heads you are looking for to a number that we can still visually verify (7 heads)**. If our code still works after making changes then we should be confident that it should work at 10,000. We will remove the intermediate output and run the full simulation!

## Do This:

* **Increase the number of heads you are looking for to 7** and **visually confirm** that the code is still working as you expect.
* If everything seems to be working, **comment out the `write` command that displays the results of each flip.** You can use `//` to comment out a single line of code. Make sure that the total count of flips still prints though!
* **Run your simulation and find out how long it takes to get to 10,000 heads**. Then run it a few more times. What patterns are you noticing? Record your results and move on.

<hr />
# Level 8 - Streaks of Heads

We are going to alter our simulation so that it doesn't count the total number of heads, but rather the longest **streaks of heads**. This will allow us to simulate **how many flips it takes to get 12 heads in a row**. 

To begin with you will change your looping condition so that **the loop again only runs 10 times**. This will allow us to visually confirm our code is working.

**Keeping Track of Streaks:** We know we need to count streaks of heads, how do we do this in code? Do we need to keep track of all the previous flips so we know that we're on a streak?

The answer is: **no**. We can instead just **count in a clever way** that makes our code pretty simple. Make a variable to use as a counter and...

* every time you see heads, add 1 to a counter.
* every time you see tails, set the counter back to 0.

Here is some psuedocode showing how it works. You might take a minute to study and reason about why and how it works.

**Pseudocode**
```
// Ouside loop
headsCount <-- 0

// Inside loop 
IF (current flip is a heads)
headsCount <-- headsCount + 1
ELSE
headsCount <-- 0
DISPLAY (current flip)
DISPLAY (headsCount)
```
## Do This:

* Change your `while` loop's condition so that **it only runs 10 times**.
* Add code to the simulation that **displays the length of each streak of heads** following the logic described above. Note that pseudocode should translate to JavaScript pretty easily.
* The example below shows an example of what output from your program might look like.

![](https://images.code.org/22f1a29e9b6abd558198f4704e437498-image-1446751547621.25.07 PM.png)

<hr />
# Level 9 - Changing the Loop Condition: Streaks of Heads

We want our simulation to run** while the streak of heads is less than a target length**. In order to do this we'll need to change our looping condition to use the variables we've been using to count our streak of heads. To begin with **your simulation should look for a streak of 3 heads** so that you can still visually confirm the output.

## Do This:

* **Change the condition** used by your `while` loop so that it now runs **while the streak of heads is less than 3**.
* **Test your program** by running it and visually confirming that its output is correct. It should run like in the example below.
* **Note:** As before it's possible that your output will sometimes run off the screen. You can still confirm your code is working as you intend (it should never run after a streak of 3) and we will address this issue in the next exercise.

![](https://images.code.org/90ec4022f784ba136e59bb9b7c57a5c7-image-1446862623863.gif)
# Level 10 -  Streaks of Heads: 12 in a Row

We're almost ready to test **our second hypothesis** and find out how long it takes to get **12 heads in a row**. Just as before we're first going to **visually test our code with a different length streak (4)** before removing most of the visual output and running the code for a streak of 12.

## Do This:

* **Change your simulation to run until you get a streak of 4** and visually verify that the values calculated are accurate.
* **Comment out** the lines of code that write the current coin flip and the current streak count. You can use `//` to comment out a single line of code.
* **Change your simulation to run until you get a streak of 12 heads**. 
* **Run your simulation a few times and record your results!**

<hr />
# Image Scroller Part 1 - Lesson 24 

# Level 16 - My Favorite Things

Check out this simple app for creating a collection of your favorite things. **We're going to be working towards building this app** over the next several exercises. As you might expect, this application **uses an array** to store and organize information.

## Do This:

* Use the "My Favorite Things" app and try to **predict how arrays are used to create the functionality you observe.** 
* Some features to notice:
* The app keeps track of a **list of your favorite things**.
* You may use buttons to **move forward and backward through your list**.
* The **current entry and total number of entries** are indicated at the top.
* You may **add a new entry** at the current location in your list.

<hr />
# Level 17 - Getting Started: Creating IDs

To get your application off the ground we've provided **the user interface elements that you will use in your application**. Unfortunately they all currently have **default IDs** which don't reflect how the elements will be used.

## Do This:

* **Create a descriptive and meaningful ID** for each element in your app.

<hr />
# Level 18 - Create Your Array

Now that we've dealt with our design elements we'll need to start writing the actual code of our app. This app keeps track of a list of items, so we know that **we'll need to create an array** to store them. 

## Do This:

* **Create an array** that will hold your list of favorite things.
* **Add three of your own favorite things to your array.**

<hr />
# Level 19  - Displaying Information to the User

Before we make our application interactive, we'll want to practice creating some simple user output. When the app starts up, the first item in your list should be displayed. Let's write the code that will display this information to the screen. 

## Do This:

<img src="https://images.code.org/d93b2abfec64ce67e8ccfecee14bae3d-image-1447346228581.36.43 AM.png" style="width: 250px; float:right">

* Using `setText` set the main text area to show your first favorite thing.
* Using `setText` and `list.length` set the text indicating what item of the list the user is currently viewing.
* **Hint:** since arrays are zero-indexed **you will have to add one to your index** to generate the correct value to display.
* **Note:** neither of these outputs will be able to change yet. Don't worry, we'll be taking care of that in coming exercises!

<hr />
# Level 20 - Current Index

This app also allows a user to scroll through individual items in the array. In order to keep track of which index we are currently viewing, our application will need **a global variable that stores the current index**. In coming exercises we'll want our global index to change, so let's **make sure that your code references your global index** rather than fixed values.

## Do This:

<img src="https://images.code.org/d93b2abfec64ce67e8ccfecee14bae3d-image-1447346228581.36.43 AM.png" style="width: 250px; float: right">

* Create a **global variable** that will be used to keep track of the current index in the array. Set this variable to 0.
* Update `setText` which displays the words to show your first favorite thing using **the global index variable** instead of a hard-coded number. 
* Update `setText` which displays the current item number to use **the global index variable** instead of a hard-coded number.
* **Hint:** since arrays are zero-indexed **you will have to add one to your index** to generate the correct value to display.
* **Note:** neither of these outputs will be able to change yet. Don't worry, we'll be taking care of that in coming exercises!

<hr />
# Level 21 - Next Button

Nice work! Your application should now have some simple output displaying one of your favorite things and indicating which item of your list you are showing. To make things more interesting, however, **we want to be able to change which item we display**.

To change the item displayed, the user will use the "Next" and "Last" buttons. These should **increase or decrease the global index by one and then you should update the information displayed on the screen**. To start out with, however, we'll just be writing code for our Next Button. 

## Do This:

* **Add an event handler** to the "Next" button.
* Write code in this event handler that **increments your global index variable** and then **updates the output on the screen**.
* **Note:** If your code from the last exercise was written to reference this variable then you should just be able to reuse it once you've incremented your variable. We'll talk more about this in the next exercise.
* Run your program to **confirm that the user can move forward through the list and that the output displayed is correct**.
* **Note:** You may notice that your program throws an error if the global index variable goes out of bounds. Don't worry about this for now - we'll fix it in a later exercise.

<hr /> 
# Level 22 - Last Button

Our user can now move forward through our list of favorite things, and we're about to write code that allows them to move backwards as well. If you've written your code to reference your global index then this should only require you to decrease its value by one and reuse code that updates the screen output. Before we write the code for backwards let's work on cleaning up our code.

**Removing Repeated Code:** Once you add the code for moving backwards through your array, your program will have three places where it updates the screen by setting the text of your screen elements. Rather than repeating this code we should **create a function** that updates the screen and then call it every time we need to refresh those elements. This will not only make our program easier to read and avoids the errors that can arise from redundant code, but it also makes it easier to make changes to how our program runs, since all the code that updates the screen is in a single place.

## Do This:

* **Write a function** that contains the `setText` commands you have used to update the screen.
* **Replace** the places in your code where you used to have these commands with **calls to your new function**.
* **Add an event handler** to the "Last" button that decreases the **global index variable** by one and then updates the screen by calling your new function.
* Run your program to confirm that the user **can move forward AND backward** through the list and that the output displayed is correct.
* **Note:** You may notice that your program throws an error if the global index variable goes out of bounds. Don't worry about this for now - we'll fix it in a later exercise.

<hr />
# Level 23 - Adding New Items

Now we want our user to be able to add items of their own to the list. As you might have guessed, this is as easy as inserting an item into our array at the current index.

## Do This:

* **Add an event handler** to the "Add" button.
* **Write code** in your event handler that:
* Uses `getText` to access the user's new item.
* Uses`insertItem` to add that item to your array at the current index.
* Calls your update function to update the screen (the new item should be displayed).
* Run your program to confirm that the user **can add items to the list** and that the output displayed is correct.

<hr />
# Level 24 - *if* Statements: Staying in Bounds

Currently the user can increase or decrease the value in the global index **past the bounds of your array**. As a result you've probably already seen that errors are generated.

To prevent this from happening, we're going to **add `if` statements** to the event handlers on the "Next" and "Last" buttons. They should check the value of the global index variable before changing it. If the user is about to step out of the bounds of your array they should either:

* **Block:** Do not change the index if it will result in a value that is out of bounds.
* **Wrap:** Set the index to be the other end of the array. In other words, going past the end of the array moves the index back to 0 and going past the beginning of the array sets the index to the last in the array (`list.length` will be helpful here).

## Do This:

* **Add `if` statements** to the event handlers on the "Next" and "Last" buttons that **prevent the global index from going out of bounds** using one of the two strategies described above.
* Run your program to confirm that the user **cannot go out of bounds** and that the output displayed is correct.

<hr />
# Level 25 - Keeping Going!

Your app should now be fully functional - nice job! There are of course plenty of new pieces of functionality to add. If you have time feel free to make any improvements you wish. Here are some ideas:

* Allow the user to **append items** rather than add them at the current location.
* Give the user the ability to **remove** the item at the current index. This can be a little tricky if you **remove the item at the end of the list** so see if you can account for that.
* Only add words **if they are not blank**.
* **Improve the appearance** of the app.


<hr />
# Image Scroller Part 2 - Lesson 25


# Level 2 - Making our App an Image Scroller

Over the course of this lesson we are going to be working towards improving our "My Favorite Things" app to add some new features. Our improved app will be able to:

* Respond to **key events**.
* **Display images** by storing their URLs.

We'll call this new kind of app an **image scroller** but feel free to call it anything you like.

## Do This:

* Close these instructions.
* **Experiment with the improved "My Favorite Things" app** to understand the new features we'll be adding. 
* Make sure you try clicking the **left and right arrow keys!**

Once you think you've experimented enough, continue on to the next level.

### NOTE: levels 3 - 8 introduce different bells and whistles that can be added to the image scroller app, includ new types of user interaction and sounds. We'll skip those here, but feel free to check them out in Code Studio.

<hr />
# Level 9- Adding Image URLs

We're ready to start improving the "My Favorite Things" app. 

We'll do this in two steps:
1. We will change it from scrolling text to scrolling images.
2. We will add key events to scroll with the keyboard.

**Step 1:**

* The default values in your array should be image URLs.
* The large **text area** needs to be changed to an **image**.
* Instead of **setting the text**, you'll now be using `setImageURL` to set the URL of the image.

## Do This:
**NOTE: We've re-loaded the code from the "My Favorite Things" App you wrote in the previous lesson.** (If you want to refer to code you just wrote, you can go back to look at it.)

* **Set the default values** in your array to be image URLs. (You might need to take a minute to go collect a few if you didn't in preparation for this lesson.)
* In Design Mode **delete the text area** and replace it with an **image**. Make sure your image has a descriptive and meaningful ID.
* Inside your function that updates the display **replace `setText` with `setImageURL`**. Make sure you reference your new image element **by its correct ID**.<br>
<img src="https://images.code.org/9f7f4aeeb9b1a84ae781043602166865-image-1447337890448.gif" style="width: 350px">
* ** Test your app** to confirm that it's now showing the images in your array.

<hr />
# Level 10 - Final Image Scroller

You're now ready to add key event functionality to your app! As you are doing so, keep an eye out for places where you need to **refactor** old code in order to prevent redundancy. **Create functions** that carry out repeated tasks and make other changes to keep your code **readable and consistent**. 

If you want a reminder of how key events work, you can always go back to the example from earlier in this lesson. You will need to add `if` statements to check for which keys were pressed, just as before.

## Do This:

* Add the ability to respond to **key events** to your app.
* **Refactor your old code** to remove redundant portions.
* Keeping adding to your program. What other features do you want to include?
