# UNIT 3 CODE STUDIO LEVEL INSTRUCTIONS

Jump to the level instructions for your project by following the link below: 

- <a href= #lesson15> Clicker Game, Lesson 15</a>
- <a href= #lesson18>Secret Number and Dice Game, Lesson 18</a>
- <a href= #lesson23>Coin Simulation, Lesson 23</a>
- <a href= #lesson2425>Image Scroller, Lesson 24 - 25</a>
- <a href= #lesson28act>Drawing App, Lesson 28</a>
<hr />

# <a name="lesson15"></a>Lesson 15 - Clicker Game

# Level 2 - Clicker Game Demo

Try out this clicker game! You'll be building your own version (with a theme you choose) at the end of the lesson.

## Things That Are Familiar
You know how to build many of the components of this game already:

- Multiple screens.
- Buttons that change the screen when clicked.
- Image that moves when you click it.

## Things That Are New

- Keeping track of and displaying the __changing score__.
- Keeping track of and displaying the __changing lives__.
- Changing to the __win screen if the score is 25__.
- Changing to the __lose screen if the lives is 0__.

<hr />
# Level 3 - Changing Elements on Screen 

There's another way to display text in your app besides `console.log` and `write`. 

There is a command called `setText` which will **change the text of a component on screen** given its id. This is a very powerful technique and one that you will use a lot. Here's what it looks like in action....

<img src="https://images.code.org/3e5dd320801720d5c62a49146d9ee3d2-image-1446056202170.gif" style="width: 500px">

Let's do a **very simple** example of using `setText`.

## Do This:
<img src="https://images.code.org/5fc22aef5e8f5161f95a2507c1ec006b-image-1446056758249.gif" style="float: right; width: 175px; border: solid 1px #AAAAAA">

* **Run the code** in the app.Look at the code for the "upArrow" event handler and how it sets the text of the label.
* **Modify the code.** When the down arrow is clicked, set the text of the label to something else.

**GOAL:**

* Your only goal is to successfully use `setText` in this example app.
* The app should do something similar to the animated example at right.

Once you've got it functional, click Finish to move on.

<hr />
# Level 4 - All the Basics You Need

<img src="https://images.code.org/abb09baa0b6ccc24ff141590c5b667c3-image-1446417655965.gif" style="float:right; width: 150px"> When you close these instructions, you'll get to play a little bit with the very simple app (shown at right) to demonstrate the basics of concepts involved in making the clicker game. We'll call it the **Count Up/Down App**. Yes, it's a boring "game," but it has all the pieces of a more sophisticated game.

This app demontrates a few new concepts. We'll step through each one, one at a time, explaining how each thing works. Along the way, we'll also encounter some common challenges, and learn how to solve them.

## Do This:

* Keeping clicking the up arrow until something happens (something besides the number increasing).
* Start over.
* Click the down arrow until something happens (something besides the number decreasing).
* Start over.

Once you think you've seen all the behavior click Finish to see the first part of how this is done.

<hr />
# Level 5 - Using Variables in Apps!
<img src="https://images.code.org/f156f8d8524c3c0316e4db394e331bdc-image-1446060829590.gif" style="float: right; width: 200px;">
The example program here has a small portion of the *Count Up/Down App* written. Right now, what the app should do is shown in the animation to the right.

## Important Concept!

This small functionality **demonstrates an important concept** - how to create a variable in the app and update it when an event occurs. It may seem fairly straightforward but there are some common misconceptions that we want to alert you to.

## Do This: Misconception Investigation
Over the next few levels you are going to do a small investigation of two apps that do almost the same thing but *one works as expected* and *one has with a bug* that demonstrates an important concept about using variables in apps. Here is what you'll do:

**Run this app, which works properly.**

* Study the code until you think you understand what's happening.
* Pay attention to the code that handles the up arrow being clicked.

**Run the app on the next screen, which has a bug.**

* On the next screen we show you almost the same app, but with a subtle problem.
* See if you can spot the difference and fix it.

**Report what you found!**

* We'll ask you to report what you found. It's not a quiz. You can go back and forth until you spot the problem, but you should find it and be able to write what it is.

<hr />
# Level 6 - Debugging Problem!

**Uh oh!** The code here is subtly different from the one in the previous example and **now there is a problem**.

## Do This:

* **Run the app** and try it to see the problem. 
* **See the error.**
* Note that **NaN** stands for "Not a Number" - why would it say this?
* **Note the difference** between this broken version and the previous one that worked.
* **Fix the problem** so that it works as before.

<hr />
# Level 9 - Make Count Down Work

<img src="https://images.code.org/0044a46a27f7af5da74daeae8de021f7-image-1446063781449.gif" style="float: right; width: 200px">You now know enough about using global variables (and some of the problems you might run into) to try it yourself.

Let's start with an easy task. Right now clicking the up arrow works as expected; **clicking the down arrow does not**. So...

## Do This:
**Make the count go down by 1 every time the down arrow is clicked**

* Study how the up arrow works, and use it as an example for writing the code for the down arrow.
* Add and modify the code so that when the down arrow is clicked the count goes down.
* When you're done the app should work like the animation shown to the right.
* HINT: Don't forget to set the text of the label.

<hr />
# Level 10 - Bug Squash!

This program has a bug that doesn't produce an error. It just doesn't do what's expected. The reason is a common mistake that all programmers make.

## Do This:

* **Run the program.**
* **To see the bug:**
* Click the up arrow about 5 times.
* Click the down arrow about 10 times.
* Click the up arrow again.
* **Look at the code and fix the problem.**
* **Read about the common mistake** by expanding the area below.
* **Once you've fixed the issue, move on.**
<p>

</p>
<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<big>...forgetting to update the display after changing something in the program</big>


<h1> Misconception Alert - Changing a Variable Doesn't Change the Display</h1>

A common misunderstanding about variables and displaying them is to think that a text label that's displaying a variable will change when the variable changes. NO. A text label is just "dumb" container for text. It's similar to a variable itself in that it won't change unless you explicitly tell it to.
<p></p>
<h1>Concept: Separation of Program Data from How It's Viewed</h1>
Maintaining variables and program data is a **different task** from maintaining the display of the app. Your program could actually run without updating the display at all - it would still be working behind the scenes; it just wouldn't be very fun or interesting to use.
<p></p>
</details>

<hr />
# Level 11 - Bug Squash!

This program has a few different bugs that are related to the same problem.

## Do This:

* **Run the program.**
* **To see the bug:**
* Click the up arrow several times.
* Click the down arrow.
* **Look at the code and fix the problem.**
* **Read about the common mistake** by expanding the area below.
* **Once you've fixed the issue, move on.**

<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<big>...thinking you're referencing a global variable when you're not.</big><br>

A common mistake is basically a syntax/spelling error. These mistakes can be really tricky to work out because you *think* you know what you wrote, but the computer doesn't see it that way :)
<p></p>
</details>

<hr />
# Level 12 - Bug Squash!

This program has a few different bugs. Find them and squash them!

## Do This:

* **Run the program.**
* **To see the bug:**
* Click the up arrow exactly twice.
* Restart the program and do this a few times - you'll notice nothing happens the first time you click.
* Click the down arrow several times.
* **Look at the code and fix the problem.**
* **Read about the common mistake** by expanding the area below.
* **Once you've fixed the issue, move on.**

<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<big>...updating the wrong thing in the wrong event handler.</big>
<p></p>
There are two common mistakes here:
<p></p>
1. Mixing up which event handler should do what.
<p></p>
2. Updating the display **before** any change is made to the underlying data of the program. 
This can make the app seem oddly out of sync where each event triggers an update to the display that reflects the **last** thing done, not the current thing.
<p></p>
</details>

<hr />
# Level 13 - Using Global Variables

You'll now look at a version of the clicker game. We've set up the basic functionality to move the apple around the screen, and have __created a global variable to keep track of the score.__

## Do This:
__Add code to update the score when the apple is clicked.__ Remember that you'll have to update both the global variable _and_ the label text!

<img src="https://images.code.org/001640fd24fc487af534ab769ed196e2-image-1446136596261.gif" style="width:200px">

<hr />
# Level 14 - Tracking Lives

In the game, the number of lives starts at 3 and decrements by 1 every time the background image is clicked. Add this functionality to your game!

## Do This:

- __Add your variable to keep track of lives.__
- __Add a click handler for the background image.__ _ID: "background"_
- __When the background is clicked, decrement the number of lives by 1.__

<img src="https://images.code.org/79f1352aebb2e40c302d1900aacd31f4-image-1446138180044.gif" style="width:200px;">

<hr />
# Level 16 -  Add Your Own *if* Statement

In most apps you want to make decisions based on the state of some data you're keeping track of in the app. 

We've **modified** the *Count Up/Down App* to add another screen. When the count reaches certain values, we'll switch screens. In the code you'll see an `if` statement has been added to the event handler for up arrow that states:

![](https://images.code.org/6e8acfef603fc7bd900d5ffb3a045150-image-1446125072632.png)

* **If** the value of `count` is equal to **20, then** set the screen to *"gameOverScreen"*.
<img src="https://images.code.org/b737f4a8924a114c8f320130e73949a6-image-1446124106409.gif" style="width: 150px; float: right">

## Do This:

** Add an `if` statement so that when counting down the app changes screens when the count reaches -5. **

* **Run the app** and click the up arrow 20 times to see what happens when the `if` statement is triggered.
* **Study the `if` statement** for the up arrow button to see how it works.
* **Add an `if` statement** to the down arrow event handler:
* **If** `count` is equal to **-5, then** set the screen to the "gameOverScreen."
* **Goal:** Once you're finished, clicking the down arrow in the app should work like the animation shown to the right.

<details><summary><strong><big>HINT:</big></strong> [click to expand]</summary>
There is a subtle challenge here that you need to set the text of the label on the <i>gameOverScreen</i> when you change screens.
<p>
</p>
<b>NOTE:</b> Your code can call <code>setText</code> for any UI element, on any screen, at any time - even if the element isn't on the screen that's currently showing.
</details>

<hr />
# Level 17 - Add a Reset Button
In most apps you want to provide a way to start over. 

To do this without having the user quit and restart your app, you need to add code to **reset variables and text displays to initial values** so the app can effectively start over.

We've **added a button** to the "gameOverScreen" in the *Count Up/Down App* and **added an empty event handler** for it. 

Right now clicking the "start over" button does nothing. You will write code to make it work.


## Do This:
**Add code to the startOverButton event handler to reset the app**. <img src="https://images.code.org/cb1569accb6a370d2258b5b14d624424-image-1446126849891.gif" style="width: 150px; float: right;">

The app should work like the animation shown to the right. **Notice** that when the "start over" button is clicked it goes back to the main screen and the count has been reset to 0. 

The code should:

* Set the screen to the gamePlayScreen.
* Set the count variable to 0.
* Set the correct text label on the gamePlayScreen to show the count is 0.

Once you get it to work, move on.

<hr />
# Level 18 - Bug Squash!

The *Count Up/Down App* has a bug! 

A **very common mistake** has been introduced into the code. It's one that vexes early programmers, but we're sure you'll find it.

## Do This:

**Run the program.**
**To see the bug:**

* Click the up arrow just once.
* Restart the program.
* Click the down arrow just once.

**Look at the code and fix the problem.**

**Read about the common mistake** by expanding the area below.

**Once you've fixed the issue, move on.**

<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<br><br>
<strong><big>...using `=` instead of `==`</big></strong>
<p>
<b>Yup,</b> we told you this is a common mistake! And it's an easy one to make.
</p>
<p>
Remember that the single `=` sign does assignment and it actually *also* evaluates to true. This means that if you stick it in an `if` statement, that `if` statement will <i>always</i> be true.
</p>
<p>
One strategy to avoid this mistake is to **read code aloud in your head** and don't even use the single word "equal":
<li> think **"gets"** every time you see <code>=</code></li>
<li> think **"equal-equal"** every time you see <code>==</code> </li>
</p>
<p>
If you get in the habit of thinking that way, these mistakes are easier to catch. For example you'd see this:<br>
<code>if (count = 20)</code><br>
and read:<br>
<i>"if count gets 20"</i> ...and know that that doesn't make sense.
</p>

<p></p>
</details>

<hr />

# Level 19 - Bug Squash!

The *Count Up/Down App* has a bug! 

A ** common mistake** has been introduced into the code.

It's a tricky one to find because at first it looks like everything is okay.

## Do This:

**Run the program.**
**To see the bug:**

* Click the up or down arrow until you get to the "gameOverScreen."
* Click "start over."
* Click the up or down arrow again... what the?

**Look at the code and fix the problem.**

**Read about the common mistake** by expanding the area below.

**Once you've fixed the issue, move on.**

<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<br><br>
<strong><big>...forgetting to reset <i>everything</i> you need to actually start over.</big></strong><br><br>
Frequently to actually reset you need to set a few variables back to initial values <i>and</i> update all the UI components, especially those that rely on those variables, so they reflect the new values.<br><br>

Another common mistake shown here is setting the text of a label to "0" rather than the value of the count variable. For example, these two lines of code are a little dangerous:<br><br>
<pre>
count = 0;
setText("countDisplayLabel", 0);
</pre>

To be safe, if a label is supposed to display the value of a variable, you should always use the variable <i>instead of hard-coding numbers</i> as a check on yourself. The general rule of thumb is: never hard-code a value instead of using a variable that holds the value you need to show.<br><br>

<b>A common strategy</b> for handling this is to put everything you need to reset the app into a function which you can call at both the beginning of your program, and from other screens later on. For example:<br><br>

<pre>
function resetAll(){
count = 0;
setText("countDisplayLabel", count);
setScreen("gamePlayScreen");
}
</pre>

Then in some other code like a button event handler you can just call your reset 
function:<br><br>

<pre>
onEvent("startOverButton", "click", 
function() {
<span style="background-color:yellow">resetAll();</span>
});
</pre>

</details>

<hr />
# Level 20 - Bug Squash!

The *Count Up/Down App* has a bug! 

A ** common mistake** has been introduced into the code.

We've changed the app so that it counts up and down by 3 rather than by 1.

## Do This:

**Run the program.**

**To see the bug:**

* Click the up or down arrow trying to get to the game over screen.
* It should be impossible to get to the game over screen.

**Look at the code and fix the problem.**

**Read about the common mistake** by expanding the area below.

**Once you've fixed the issue, move on.**

<details>
<summary><big><strong>Read about the common mistake here...</strong></big> [click to expand]</summary>
<br><br>
<strong><big>...the condition you're checking in your `if` statement is actually impossible to reach.</big></strong>
<p>
This problem was probably easy to see here, but in practice <b>logic errors</b> like this can be devilish to track down. It's especially hard because the program gives you no hints that anything is wrong - it is syntactially a correct program. The computer cannot tell ahead of time whether your `if` statements will ever be true. So you need to trace through the logic of your program step by step to try to figure out why something's not happening that you expect should have happened.
</p>

</details>

<hr />
# Level 21 - Make Your Own "Clicker" Game
You will be creating your own “clicker” game similar to the Apple Grabber game you worked on in this lesson. 
The general object of the game is to click on an element that jumps around every time you click it. You will pick your own theme and decide what the rules are and how to keep score.

** Your Main Tasks Are To:**

* Pick a theme for your game and add appropriate images and styling.
* Add variables to track some data during gameplay.
* Add code to event handlers to update the variables and display appropriately.

**See Activity Guide for Requirements**

There is a full activity guide and rubric for this project. You can find a link to it in the student resources section for this lesson. Or ask your teacher for it.

<img src="https://images.code.org/146107536c50b4a3317f3ebbe2e66f37-image-1446418612319.png" style="float: right; width: 300px">
** Template **

This level is a template for the app. You should **run it to see what it does** right now. You will modify *this* template, both the design elements and the code, for your project.

The template has 4 screens and some basic navigation functionality and event handlers set up for you. The game play screen uses the images from the Apple Grabber game, but you should replace these with images related to your chosen theme.

<hr />

# <a name ="lesson18"></a>Lesson 18: Secret Number 

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
# <a name ="lesson23"></a>Lesson 23 - Coin Simulation

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
# <a name ="lesson2425"></a>Image Scroller Part 1 - Lesson 24 

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

<hr />
# <a name ="lesson28"></a>Lesson 28 - Drawing App 

# Level 2 - Introducing Canvas

Today we are going to be building a drawing app around **a new UI element called the canvas**.![](https://images.code.org/26713ddcc9477e64c347c228d68cac0a-image-1447994134674.35.25 PM.png)

![](https://images.code.org/044ad7db1cb4101f54302bd4013d1cc2-image-1448241882228.gif)

**A canvas is simply a transparent rectangle on which you can draw basic shapes** like lines, circles, and rectangles. In fact, at first you might feel like we're going to end this unit in the way we started it, making turtle drawings. Don't worry, we'll quickly move into new and exciting things we can do with this new UI element.

## Do This:
<img src="https://images.code.org/3874f5e430a6290544466b2037490ae4-image-1448242142421.28.33 PM.png" style="float: right">

* **Starter code** is provided which places buttons on the bottom of your screen. **Ignore these for now; we'll be using them later**.
* **In Design Mode, drag a canvas element into the empty space at the top of your app**, resize it, and give it a descriptive ID.
* **Call `setActiveCanvas` with the ID you assigned to your canvas**, which makes it responsive to canvas commands.
* **Add a giant circle to the canvas.** Use the `circle` command. Make its radius large enough that it goes off the edge of your canvas.

Your code will look something like this:

![](https://images.code.org/f0cc22a1de686db72ebce90c720ae6e4-image-1447994225253.36.59 PM.png)

<hr />
# Level 3 - Loops on the Canvas

To make things interesting, we're going to quickly add 200 dots to our canvas by using a `for` loop. **Locations on the canvas are relative to the top-left corner of the canvas, not the screen**. Therefore you will need to know the dimensions of your canvas in order to randomly place dots throughout it. You can find this information in Design Mode:

![](https://images.code.org/8e0c868a21f5c674efb6adef1040ec2b-image-1448040822360.33.29 AM.png)

## Do This:

<img src="https://images.code.org/345b625e6954dc1ea2310c97aa08c59f-image-1448243004939.gif" style="float: right">

* Add a **`for` loop that runs 200 times.**
* Place the **`circle` command inside the loop** and **decrease the radius** (try 20).
* **Use `randomNumber` to randomize the `x` and `y` values used to place your dots**. The ranges you select should be the width and height of your canvas. 
* **COMMON MISTAKE ALERT:** If you test your code before setting the `x` and `y` values of the circle to random numbers, it will look like there's only one dot. But really you will have just drawn 200 dots all at the same (x,&nbsp;y) position.

<hr />
# Level 4 - Changing Colors in Canvas

We would like to make our dots transparent so that we can see when they are drawn on top of each other. To set the color and transparency of shapes you draw on your canvas, you need to change both the **stroke** or outline color and the **fill** color. The functions `setStrokeColor` and `setFillColor` can be used to set those colors. 

These functions **accept strings of the form `"rgba(100, 200, 100, 0.5)"` as input**. The first three values in the string are RGB values and the last value is the transparency, as represented by a decimal number between 0 and 1.0. All together it looks like this:

![](https://images.code.org/5f5692259df092ce4e000cbdf5a7df1b-image-1448077147778.png)
<img src="https://images.code.org/e833a63e31dca7d5e8357c0b856dc7cc-image-1448244247180.gif" style="float: right; width: 150px">

## Do This:

**Before the loop: ** 

* **Add a `setStrokeColor` command** to set the stroke to **fully transparent**.
* **Add a `setFillColor` command** to set your dots to full black and mostly transparent **(try a value of 0.2)**.

<hr />
# Level 5 - Click to Add Dots

Loops are one way of quickly adding dots to our canvas, but now we're going to change our app so that the user can decide when and how many dots to add. The canvas is a UI element, so **you can attach event handlers to it just like you would any other element**. We're going to move the circle command inside of a click event handler so that the user can click to add individual dots.

![](https://images.code.org/ecd25d3ff2bb50f0555ebd012e5c3b88-image-1448078111902.gif)

## Do This:

* **Add an `onEvent` handler**; set its ID to your canvas ID.
* **Move the `circle` command out of your `for` loop and into your new event handler**.
* **Remove the `for` loop from your program.**
* **Run your program** and confirm that a single dot is added everytime a user clicks your canvas.

![](https://images.code.org/0064f8ac406a9f09dc742c81d8510f16-image-1448244621879.gif)

<hr />
# Level 6 - The Event Parameter for Mouse Events

We'd like to change the app so that when the user clicks on the canvas we draw a circle right where they clicked. To do that, we need to learn more about the **parameter passed by our event handler function, which by default is called `event`**.

Recall that when we wanted to know what key the user pressed on a `keyPress` event, we checked the value stored in `event.key`. **The event parameter actually stores a great deal more information about each event**. 

When using the mouse, the event parameter carries information like the location of the mouse, how fast it's moving, and some other things as well. 

Let's get acquainted with the event parameter and what we can find out about the mouse.

## Do This:

* Add a `console.log` command inside the function of your event handler. Use it to display the `event` parameter.
* Run your program and click your canvas. **The full contents of the `event` parameter should be displayed in the console**. 
* **Which values do you think hold the x and y coordinates**? What else is there?
* We won't use all of these, but it's interesting to see just how much is available.
* Once you have experimented a little, move to the next level.
![](https://images.code.org/a6875e27019cb938a9576f0485648ca9-image-1448041792987.49.30 AM.png)

# Level 7 - Drawing Dots at Click

Currently the user can click to add dots, but they're drawn at random locations around the canvas. We're going to use information stored in the `event` parameter of the event handler function **to place dots wherever the user clicks the mouse on the canvas**.

The event parameter has two critical pieces of information we'll want, which are `event.offsetX` and `event.offsetY`. These hold **the location (relative to the top left corner of the canvas) that was clicked**. 

## Do This:

<img src="https://images.code.org/1c6109cfc1b02c3ba737519d3f01d1b4-image-1448301532145.gif" style="width: 200px; float: right">

* **Remove (or comment out) the `console.log` statement**.
* Replace the `x` and `y` parameters of the `circle` command with `event.offsetX` and `event.offsetY`.
* **Run your program** to confirm that dots are being drawn anywhere the user clicks the mouse.

<hr />
# Level 8 - Drawing on *mousemove*

Currently the user can click to add dots, but we want **to place dots wherever the user moves the mouse on the canvas**.

To place dots whenever the mouse is moved, we'll be **changing the event type from `click` to `mousemove`**.

## Do This:
<img src="https://images.code.org/960ac863ac908506724eeb9f11165672-image-1448246938599.gif" style="float: right">

* Change the event type in your event handler **from `click` to `mousemove`**.
* **Run your program** to confirm that dots are being drawn anywhere the user moves the mouse.

**Your user is now able to draw anywhere they want on the screen!**

<hr />
# Level 9 - Draw When a Key is Pressed

This app now lets the user draw, but they have no control of whether the pen is up or down. Let's give the user the ability to **choose when to put down the pen**. We won't even need to add a new event handler to our app! 

You may have noticed that the **`event` parameter includes information about whether certain keys were pressed when the event fired**. They are stored in variables with names like `shiftKey` or `altKey` and are stored as boolean values (true / false). We are going to use the `shiftKey` variable to decide when we should draw circles. 

## Do This:
<img src="https://images.code.org/1a4b8f12645e5e88dee96d5542933c84-image-1448248202626.gif" style="float:right">

* **Add an `if` statement inside your event handler function** where the condition is based on the value stored in `event.shiftKey`: **If `shiftKey` is true, then draw the circle.** <img src="https://images.code.org/a542766e8e52fed5ca992f2434ace086-image-1448307484936.37.32 PM.png" width="200">
* You might want to **decrease the radius of your circle** (for example to 5).
* **Run the program and confirm that dots are only drawn when the shift key is pressed.**
* The effect should be that the user can pick up and put down the pen to draw.
* Hold the shift key down and move the mouse to draw.
* Release the shift key to stop drawing.

(**NOTE:** If you wish, use `console.log` to display the values in `event` again. You'll see `event.shiftKey` is one of the values stored.)

<hr />
# Level 10 - Store Your Dots

Now we're going to get into the core of the activity. We will be **creating a record of every dot your user draws**.

To do this, we will append *every* `event` parameter to an array as events are generated. When we store every mouse location in an array, we can make many interesting effects and redraw the image in different ways, by looping over the array. First let's just make sure we can capture them all.

## Do This:

* Create a new array outside the event handler function: `var eventList = []`.
* In your event handler, before you call the `circle` command, use `appendItem` to add the `event` parameter to `eventList`.
![](https://images.code.org/98f98c0895fafa87b8f6617e5b4629af-image-1448080702748.gif)
* **Run the program** and draw some dots.
* In the Debug Console type `console.log(eventList)` and inspect the contents. You should have a record of every event parameter used to draw a dot! (It might be a lot.)
![](https://images.code.org/425bdde5f2d87b34c037b533600f19b4-image-1448080857409.gif)

<hr />
# Level 11 - Delete Button

We are finally going to use those buttons! Each one will trigger an event handler that **processes the array `eventList` to create a visual effect** with the mouse data you have stored. **The first effect we are going to create is delete.**

You may want to provide your user with a way to start over with their drawing. In order to do this, you will need to *both* **clear the canvas** and **delete all items from `eventList`.** The easiest way to delete everything from the list is to simply set the value of `eventList` to be a new empty list.

## Do This:

<img src="https://images.code.org/f8fca0d889ae9ddc3ac9b33ba27fadce-image-1448311933871.gif" style="width: 200px; float: right">

* In Design Mode, set the styling and text of one button to indicate it's the "delete" or "start over" button. Give your button **a descriptive ID**.
* **Add a click event handler** to your button.
* Within the event handler call `clearCanvas`.
* Set `eventList` to the empty array (i.e., `eventList = []`).

**Test your program** to make sure that starting over works the way it should. 

<hr />

# Level 12 - Redraw Random - Part 1

The next effect we are going to create is **"random."** We will be redrawing the image but with randomly sized dots.

We'll be doing this in two steps. For now, all you need to do is **change the first button in the row to have the proper styling and attach a click event handler to it**. **In addition, clear the canvas from inside the event handler** so we are ready to redraw our new image. We don't want to delete all the items from the array though, as we will use them to redraw. Once you've done that, move on to the next exercise where we'll write the actual code in our event handler.

## Do This:

<img src="https://images.code.org/0116a787b989df18b077cb4657a5d379-image-1448312365660.58.05 PM.png" style="width: 200px; float: right">

* In Design Mode, **pick a button to use for Random. Set the styling and text of the button**. The image below shows one possible option, but you can style it however you like.
* Give your button **a descriptive ID**.
* **Add a click event handler** to your button.
* **Call `clearCanvas`** from inside the event handler so the canvas is ready for the redraw.


<hr />

# Level 13 - Redraw Random - Part 2

Now we're ready to write the code for our "Random" effect. To do this, we will be clearing the canvas and then processing the array `eventList` to redraw all the dots with a random radius. 

You already set up the clear canvas, so next we'll need to process our array in order to find out the event information for each dot. You'll need to create a `for` loop that iterates through every index in `eventList` (recall the `length` command). Within your loop, you will be drawing dots referencing items stored in the array. 

As you write this code, remember that **you can treat an individual element of an array exactly like the kind of data it stores**. Inside a `for` loop, the event at index `i` can be accessed with the notation `eventList[i]` and the `offsetX` of that event can be accessed with `eventList[i].offsetX`. Again, you are essentially treating the array element as if it were the data it contains.

![](https://images.code.org/8ce01658ab31ce5f05101e58e3413681-image-1448250618520.gif)

## Do This:

<img src="https://images.code.org/6e081911348f3c1b07d17f83bd402249-image-1448312722857.gif" style="width: 200px; float: right">

(**NOTE:** Everything listed below is shown in code animation above.)

**Inside the "Random" button event handler...**
* **Add a `for` loop** that runs `i` from 0 up to `eventList.length` to process over the array.
* **Add a `circle`** command inside your loop.
* **Set the x and y parameters** of the `circle` to `eventList[i].offsetX` and `eventList[i].offsetY`, respectively.
* **Set the `radius` parameter** to some `randomNumber`. Pick any range you like. You can always change it later.
* **Test your program** by drawing a figure and then hitting your "Randomize" button. It should be the same drawing, but now with randomly sized dots!


<hr />

# Level 14 - Redraw Original

If you were able to get that working and understand what you did, congratulations! That was some serious programming! If not, take a moment to go back and talk through the different components with a classmate. Most of the work we'll be doing for the rest of this lesson uses similar patterns, and you'll want to be comfortable with them as we add more complexity to our app.

The first thing we are going to do is **create an "Original" button that will redraw the image with the same circle radius you used before**. The process will be nearly identical to how you added the "Random" button.

In fact, the code to redraw the original is *exactly* the same, except instead of making the radius of the circle be random, it will just be the fixed value you used originally (probably radius 5 or so).

![](https://images.code.org/9238e313e8f635e2e6b31ad19d0fdc41-image-1448290929994.gif)


## Do This:

<img src="https://images.code.org/6cf1d46af7cd92cc1faf1501366e2e1a-image-1448312993714.gif" style="width: 200px; float: right">
(**NOTE:** The instructions below are shown in the code animation above.)

* Style a button, give it label like "Original," give it a meaningful ID, and add a "click" event handler.
* Inside the event handler for your "Original" button...
* Copy the code from the "Random" button event handler.
* Paste it inside the event handler for the "Original" button.
* Set the `radius` parameter to **whatever value you used when you originally drew dots**.
* Test your program by drawing a figure and then hitting your "Randomize" button. Then hit the "Original" button. Your original drawing should appear.


<hr />

# Level 15 - Adjusting Circle Size

Among the other pieces of information contained in each `event` parameter are the values `movementX` and `movementY`. These numbers tell us how far (in pixels) the mouse moved since the last mouse event was triggered, and can be used to measure the speed of the mouse. ** If the movement is large, the mouse is moving fast; if the movement is small, the mouse is moving slowly.**

Let's use the mouse movement speed to make a cool effect. When we draw with a real pen or brush, the line usually gets thin when making quick strokes and is wider and darker when making slower ones. We can generate this effect by **using `movementX` and `movementY` to calculate the radius for the circle.** Since this calculation might be a little tricky, a smart thing to do would be to **write a function** that takes `movementX` and `movementY` as parameters and **returns** a value that should be used as the radius.

<img src="https://images.code.org/b9dc4c20d44af7b4e7725b71cd35fa2b-image-1448313734191.21.43 PM.png" style="width: 350px; float: right; border: solid 1px black">

There are several ways to do this. One possible way to write the function is provided on the right, which uses some arithmetic tricks. The function to the right is actually only three lines of code but is heavily commented to explain what it's doing. It makes use of a function called **`Math.abs` which returns the absolute value of a number.** Feel free to use this or another method of converting `movementX` and `movementY` into a radius.

<details> <summary><strong>What is Absolute Value?</strong> [click to expand]</summary>
`Math.abs` takes a number as input and returns the positive version of this number. 

In math, absolute value is often written with this | | symbol. So |10| is the absolute value of ten and |-10| is the absolute value of negative ten. Both evaluate to 10.

In Javascript we use `Math.abs` instead of | |. <code>Math.abs(-10)</code> and <code>Math.abs(10)</code> both evaluate to <strong>10</strong>.
</details> <br>

## Do This:

* **Write a function like the one above** that accepts two parameters (one each for `movementX` and `movementY`) and returns a radius. A higher speed should lead to a smaller radius.
* **Inside your `mousemove` event handler,** set the radius of the circle to the value returned by your function, where the function takes `event.movementX` and `event.movementY` as input. For example, if using the function above, your code would be: <br>![](https://images.code.org/94a379336084954ba2ab27e80b17dee3-image-1448314255797.30.22 PM.png)
* Run your program and confirm that **when you draw, the speed of the mouse affects the radius of the dots**. The effect should look something like what's below 

![](https://images.code.org/ee83d18f04e4d9d486428273b7321f9f-image-1448394071473.gif)


<hr />
# Level 16 - Fix the "Original" Button

Our "Original" button is now slightly broken because the effect it renders doesn't match our new free-form drawing which takes the movement of the mouse into account - it just draws fixed-size cricles.

Let's fix the "Original" button.

## Do This:

In the event handler function for the "Original" button:

* Change the value used for the radius from a fixed value to the same thing calculated for the free-form drawing. Since you wrote a function to do this calculation, it should be easy to call it from this code as well!
* The **slight difference will be that you will be looping over the array of events.** So the line of code that draws the circle might look like the one below. This line of code is certainly a mouthful, but it's basically the same as the line of code in your `mousemove` event handler; **it just references the event in the list instead.** <br><img src="https://images.code.org/dbb4cd9b98eba70aa2919a93544c1e03-image-1448314845862.40.21 PM.png" style="width: 600px">
* **Test your program** to confirm that clicking the "Original" button creates the same effect that occurs when doing free-form drawing.

![](https://images.code.org/4fcf033e87dc407d337941a7adc4766b-image-1448394246410.gif)


<hr />
# Level 17 - Making Spray Paint

The next effect we would like to create is a "spray paint" effect. Instead of drawing a single dot for every location stored in `eventList`, we'll draw many small dots randomly placed around each location.

We are going to start off just practicing **drawing a circle whose x and y locations use `offsetX` and `offsetY` with a small random value added**. This makes the line of code to draw the circle kind of long, but hopefully it's easy to understand if you read it carefully.

![](https://images.code.org/c0c0a9df4215be16953a26ec102b2f9c-image-1448294147046.png)

## Do This:

* **Set the style of another button** in Design Mode, give a label like "Spray Paint," give it a descriptive ID, and attach a click event handler to it.
* **Copy the code from the "Original"** button into the event handler for spray paint.
* Change the code for `circle` so that it will **draw a dot whose x and y locations use `offsetX` and `offsetY` with a small random value added. **

![](https://images.code.org/c0c0a9df4215be16953a26ec102b2f9c-image-1448294147046.png)

* **Run your app** to make sure it is drawing small dots close to the original position. Look at the example below.

![](https://images.code.org/d6279085a5c6689dd5c745a0d0e28136-image-1448386996780.gif)


<hr />
# Level 18 - Making Spray Paint with Nested Loops

In order to make "Spray Paint" look more real you will need to draw multiple dots randomly placed around the original x and y locations. In order to do this, you will place one `for` loop inside of another, also known as a **nested loop**. You already have the main loop which visits every index in `eventList`. The inner loop should **draw 5 circles whose x and y locations use `offsetX` and `offsetY` with a small random value added**. 

## Nested Loops

<img src="https://images.code.org/15d7590ed9d4c07a40f22da4decc396c-image-1448153719856.54.36 PM.png" width= 300px ; style="float: right">
**When nesting loops, it is important that you use different variables to count your iterations**. Look at the example at right. These nested loops effectively say: **"for every possible value in `eventList.length`, run a loop 5 times". **

Since `i` is used as the counter variable in the outer loop, we need to use a *different counter variable for the inner `for` loop*, or things will go haywire. Why? **If both loops used `i` as a counter variable, the inner loop would keep changing `i` and the outer loop wouldn't count properly.** The example uses `j` as the inner loop variable, but you could use anything that's *not* `i`.

<img src="https://images.code.org/b5184430a48ac55d8f6fe7280c983186-image-1448387927473.gif" style="width: 450px">

## Do This:

<img src="https://images.code.org/290adbb84a51b89ca27414746d3a4a93-image-1448395072342.gif" style="width: 200px; float: right">

(**Note:** Steps shown in animation above.)

* **Add a `for` loop inside the existing `for` loop** in the spray paint event handler. 
* **Change the counter variable** to something other than `i` for the inner `for` loop.
* **Change the boolean condition** so the inner loop will run **5 times.**
* **Move the circle** code inside both `for` loops.
* **Run your app** and confirm that your new button creates a spray paint effect, as shown below.


<hr />

# Level 19 - Relative Indexes

When looping over an array, we use a counter variable (typically `i`) to keep track of which index we're at. We can then access the contents at each index with the syntax `list[i]`.

If we want, however, we could access the contents of the next element as well, since its index is just one greater. For example, if we are currently focused on the element at index `i`, then `list[i+1]` gives us access to the next element in the array. In other words, you can **reference indexes relative to your counter variable**.

![](https://images.code.org/3bb5dfce60951040172bfe08d98a8750-image-1448393281688.png)

We are going to use relative indexing to create our final effect, which will look sort of like an etching of the image. The idea is simple: **for every (x,&nbsp;y) location in the event list, draw a straight line between that location and the location stored 10 spots further down the array.** You will use the **`line` command** to draw a line connecting these points.

## Do This:

* **Read the documentation for `line`**.
* **Set the style of the final button** in Design Mode, give a label like "Etch," give it a descriptive ID, and attach a click event handler to it.
* **Call `clearCanvas`** to clear the screen.
* Create a `for` loop that counts from **0 to `eventList.length - 10`**. 
* Why do you think we're not counting over the entire array?
* Use `line` to draw a line between the (x,&nbsp;y) locations of `eventList[i]` and `eventList[i+10]`. The full line of code will be another big one: ![](https://images.code.org/5de2c40b56042069379ff20ce5d10cab-image-1448393948598.38.49 PM.png)
* **Use `setStrokeColor` and/or `setStrokeWidth` inside the event handler** to make the lines visible; otherwise, they will be transparent, since we set the stroke color to transparent at the beginning of the program.
* **Run your app** and confirm that your new button creates a sketch effect, as shown below.

![](https://images.code.org/c06c268a4757e8838435e576a676a0a2-image-1448395181441.gif)

<hr />
# Level 20 - Create Your Own Effect!

You've just seen several ways that we can process our array `eventList` in order to create different effects. Now it's time to make your own! **Extend the functionality of one of the effects you just created, or create an entirely new one**. What else could you do with the information you've stored in your array? How else might you combine the programming tools you've developed?

## Do This:

* **Extend the functionality of one of the effects, or create an entirely new one of your own!**
