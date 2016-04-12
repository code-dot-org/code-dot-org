# ---------Lesson 16----------	


## ------ Level 2------	
# Getting Text from the User

Up until now, the event-driven apps you have created responded to the user clicking an element or typing a number when you used `promptNum`. __What if we want the user to provide _text_ instead of a number?__ You can probably think of many apps and websites that ask you to provide text in order to do something.

In programming, we have to represent text in a specific way to distinguish it from other words in our code, such as variable names. But we'll cover that later...

At the beginning of class you created a Mad Libs on paper, which takes user input in the form of nouns, adjectives, and verbs to create a unique "How-to" manual. You'll be translating your own Mad Libs How-to into an app in this lesson.

# Do This:

- __Play with this Mad Libs app__ a couple of times to see a digital version of the paper game. 
- __Think about how the final text is created__ based on the input from the user. How would you describe in words the algorithm for creating it?"


## ------ Level 3------	
# Strings

The primary data type we have used so far is **Numbers**. If we want to interact with user-submitted text, however, we'll need to learn about a new data type called a **String**.  A string is a **sequence of ASCII characters**.

**Example** | **Rule**
---|---
`"aString"` | Strings **might** look a lot like a variable name but there are **many differences**.
`"look at all these spaces"` | Strings can **contain spaces**.
`"$2 bills are the coolest"` | Strings can **contain special characters** (and even start with them).
`"11"` | Strings might **contain only digits**. This looks like a number but it is really 2 ASCII characters.
`""` | Strings might **contain no characters**.
<br>
You can **store strings in a variable just like a number**. In this example the variable name is `str` but you should choose a name that is **descriptive and meaningful**.

![](https://images.code.org/56e6b30a51556aa3b516e0a49b51cbeb-image-1445894334432.18.40 PM.png)

**Combining Strings:** often you will want to combine multiple strings to create one longer string. You can do this with the `+` operator. The formal name of this process is **concatenation**.

The program you're about to see is a very simple Mad Libs app that uses strings that are created inside the program and  saved inside of variables. These strings are then **concatenated** with other strings to create a Mad Lib.

# Do This:

* The input words of this Mad Lib are **currently set to the empty string**.
* **Add your own input words** and run the program to generate the Mad Lib."


## ------ Level 4------	
# Importantance of Double Quotes

You may have noticed that the strings we've seen are **wrapped in double quotes**. These double quotes **are not part of the string**. Instead this is how you indicate that a sequence of characters **is a string and not the name of a variable**.

As you start writing programs with strings **it is common to generate errors from forgetting to place them in double quotes**. We're going to generate some of those errors now so that we can recognize them more easily later.

![](https://images.code.org/89235457b9b9bf76ac4f8221cae5a62e-image-1445987270682.07.24 PM.png)

# Do This:

* **This program generates many errors** because strings were not placed in quotes.
* **Run the program** before you change it to see the errors that are generated.
* **Add double quotes** around all the strings so that the program runs without errors.



## ------ Level 5------	
# Text Input Elements

So far we've been using `promptNum` as a simple way to get a number as input. Now that we know a little about strings we are going to create **user interface elements that users can use to submit text (i.e. strings) instead**. The first and simplest example is `textInput` which you can find in Design Mode.

<img src="https://images.code.org/4436a3ba2a7596c7724380c7c82d5c29-image-1445533665376.36.19 PM.png" style="width: 100px">

# Do This:

* **Add two text input elements to this program**, one for the name and one for the age of the user.
* **Give your text input elements descriptive and meaningful IDs**.
* **In Design Mode** set their default text to prompt the user for their name and age.
* **Compare your app to the example below**.

<img src="https://images.code.org/865403f21bdb27246caeb31afa7c0b5f-image-1445902764676.39.11 PM.png" style="float:left; width:200px;">
<br>"


## ------ Level 6------	
# Getting Text Input

As we saw a user can now type inside of a text input whenever they want, **but now we'll need a way to access that text**. In order to do that you'll need to use the `getText` command, which you can now find in the **UI Controls** tab.

<img src="https://images.code.org/0c6774f2b6d33f8107ec2936102b1a10-image-1445533677192.58.24 PM.png" style="width: 150px;">

You can use a `getText` command just like a string within a `console.log` or `write` command. Just like with `setText` you will refer to the UI element by its ID.

![](https://images.code.org/c17e419301d0cfeebf7f0ccee13e415f-image-1445892504376.47.54 PM.png)

# Do This:

* **Read the documentation **  for `getText`.
* **Add an event handler to the Submit button** that fires when your button is clicked.
* **Insider the event handler** place code that will **log the name your user input to the console**.



## ------ Level 7------	
# Saving Text Input in Variables

Often we want to save the information we pull in from the user for later use in our program. The best way to do this is to save it in a variable.

# Do This:

* **Create two variables inside your event handler** to store the **age** and **name** of the user.
* **Use `getText()` to update the values** stored in each of these variables.
* **Change your `console.log` statements to use your variable instead of `getText`**.

![](https://images.code.org/ca45dcb01ae2d1956ed2f87efeda0264-image-1445976691215.11.13 PM.png)"


## ------ Level 8------	
# Generating Text Output

So far we've been outputting our messages to the console, but now we'd like to display them in the app. In order to do so we're going to be using a new UI element called a `textArea`. You can use `setText` with a `textArea` just like you would with a `textLabel`.

![](https://images.code.org/45e6b6cdb1ca87f53cf1d6bba97cb812-image-1445977693641.24.43 PM.png)

If we want to combine user input with default text we can do so with **string concatenation**. Together with a `textArea` we can use this ability to compose longer messages based on user input.

# Do This:

* **Add a `textArea`** to your app and give it a descriptive and meaningful ID.
* **Create a variable inside your event handler** called `userMessage` to hold the full message that will be sent to the user.
* **Use string concatenation** to compose a message from the user input.
* **Use `setText`** to place your `userMessage` inside the `textArea` you created.

<img src="https://images.code.org/193af3e0c993dbf0b7af9c571ec5f56d-image-1445977696957.27.08 PM.png", style="width:250px;">"


## ------ Level 9------	
# String Capitalization

If you want to change the capitalization of a string you can do so with two new functions

![](https://images.code.org/d8523cdae7c07b34baa1c61809bb80d4-image-1445980407200.42.31 PM.png)

Note that the syntax is similar to `console.log` . This is because `toUpperCase` really only makes sense as a command when you are using a **string**, just as `log` only makes sense when you are talking about the console. This function **evaluates to a new string in which all characters have been made uppercase / lowercase**. If you want to update the value in your original variable you'll have to do so explicitly, as in

```
var myString = "lower case for now";
myString = myString.toUpperCase();
```

# Do This:

* **Update your application so that the user's name is printed in UPPERCASE**.

<img src="https://images.code.org/26d8ffb7c631c1c510f781b5bf46d494-image-1445980322936.04.55 PM.png", style="width:250px;">"


## ------ Level 10------	
# Back to Mad Libs: Design Your App
Now that you've had some practice getting user text and making new strings with it, you're ready to turn your How-to Mad Libs into an app. To get started, you'll set up the layout. There are two main screens:

__Screen 1: Collect User Input__  
- On this screen, you'll use __text labels__ and __text input__ design elements to set up the different words you want the user to provide.
- A __Next__ button takes you to Screen 2 to view the full Mad Libs.

__Screen 2: View Mad Libs__  
- On this screen, you'll use the __text area__ design element to create the space where the user's completed Mad Libs will be displayed.
- A __Play again__ button takes you to back Screen 1.
<br>
<br>



<table>
<tr>
<td>
<strong>Screen 1:</strong>
</td>
<td>
<strong>Screen 2:</strong>
</td>
</tr>
<tr>
<td>
<img src="https://images.code.org/ccea092b516047dff82fafa50b47bcc7-image-1447974038265.00.17 PM.png" style="width:150px;float:right;">
</td>
<td>
<img src="https://images.code.org/0f832e6314ad98170a3cddb317d26e41-image-1445898480304.27.45.png" style="width:151px;float:right;">
</td>
</tr>
</table>

# Do This:

- Create the two screens for your app, including the design elements in each one.
- Requirement: Request at least 3 separate words from the user on Screen 1.
- Create the event handlers for the __Next__ and __Play again__ buttons to respond to clicks.
- Use `setScreen` in the event handlers to get the screen navigation working.


## ------ Level 11------	
# Update the Text Area with Your Mad Libs Outline

When figuring out how to make progress with a program, it helps to break the problem down into smaller steps and test your program incrementally. So rather than jumping straight to getting the user input and __concatenating__ it with your Mad Libs outline, start first by just making sure that you can get your Mad Libs outline to appear in the text area when the __Next__ button is clicked on the first screen. 

But wait! If you just use `setText` and pass in the string of your Mad Libs outline, it will look like the screen on the left where all the steps are smushed together. You can use one or more newline characters, `"\n"`, in your string to create a line break in your text.

<table>
<tr>
<td>
<strong>Without newlines</strong>
</td>
<td>
<strong>With newlines</strong>
</td>
</tr>
<tr>
<td>

<img src="https://images.code.org/24fb1385d6199cd52c6e1d3d11e547fc-image-1448404478181.png" style="width:201px;float:right;">
</td>
<td>
<img src="https://images.code.org/3a627993f9e0e4a6d462c8a21b335058-image-1448404299215.png" style="width:200px;float:right;">
</td>
</tr>
</table>


# Do This:

- When the __Next__ button is clicked, you already switch to Screen 2, but now you should also call `setText` on the text area on Screen 2 to your Mad Libs outline. See the images above for one way to temporarily handle the word placeholders.
- Add in newline characters `"\n"` in your Mad Libs string to format it.

<details>
<summary>**Newline Examples**</summary>
<table style="width:100%; margin-left:25px;">
<tr>
<td style="vertical-align: text-top; border-right:1px solid #000">
	**Example1:**<br/><br/>
    
    <samp>console.log("How to Drive\nStep 1.");<br/><br/></samp>
    
    *will be displayed as...*<br/><br/>
    
    <samp>How to Drive<br/>Step 1.<br/><br/></samp>
    
    *...on your console.*
</td>
<td style="padding-left:20px;">
<samp>**Example2:**<br/><br/>
    
    var step1 = "Step 1: ...";<br/>
    
    var step2 = "Step 2: ...";<br/>
    
    console.log(step1 + "\n" + step2);<br/><br/></samp>
    
    *will be displayed as...*<br/><br/>
    
    <samp>Step 1: ...<br/>Step 2: ...<br/><br/></samp>
    
    *...on your console.*
</td>
</tr>
</table>
</details>"


## ------ Level 12------	
# Make It Mad! Add the User's Text to Your Mad Libs Outline

Now that you have your Mad Libs outline appearing in the text area, it's time to __incorporate the user's text__ to make your Mad Libs come alive.

# Do This:

- Did you pick good ID names for your text input elements? Update them now if you didn't!
- When the __Next__ button is clicked, __get the user's text from the text inputs on Screen 1 and store each in a separate variable__.
- Use string concatenation to __incorporate the user's text into your Mad Labs string__ before updating the text area on Screen 2. 

<details>
<summary>**Hint**</summary>
Use `getText` to get the text from each of the text inputs on Screen 1.
</details>
<details>
<summary>**Should I make local or global variables?**</summary>
Remember that the decision to create local variables or global variables is a question of _scope_. Where will you need to access these variables in your program? If you are only using the variables in the click callback function for the "Next" button, then they can be _local_ variables in that function. 
</details>"


## ------ Level 13------	
# Why Are You Yelling At Me?! *toUpperCase* and *toLowerCase*

The main functionality of the Mad Libs app is complete, but there are some finishing touches to add. The user may type input with random letter capitalization, but the Mad Libs output string should be consistently capitalized.

# Do This:

- Pick one or more pieces of the user's input text to transform into "yelling" or emphasize by __making it uppercase__ before displaying it.
- For the other pieces of the user's input text, __make it lowercase__ before displaying it.

<details>
<summary>**Hint**</summary>
Remember the rules of updating variables! You can update a variable after first getting its current value and then doing something with it. <br> Example: `song = song.toUpperCase();`
</details>"


## ------ Level 14------	
# Play It Again and Again!

When the user clicks the "Play again" button, the first screen should reset and not show the user's previous text.

# Do This:
- When the "Play again" button is clicked, __clear the text from each text input__ on Screen 1.
- __Free play:__ Add images, or more How-to steps for your Mad Libs, and invite others to play!

<img src="https://images.code.org/a49fe3eba4d2d2fb03e45d15aad53dbf-image-1450143105779.16.14 Mad Libs play again button.gif" style="width:200px">


<details>
<summary>**Hint**</summary>
Try setting the text to the empty string: `""`.
</details>


## ------ Level 15------	
# ---------Lesson 17----------	


## ------ Level 2------	


## ------ Level 3------	
# Introduction to the Digital Assistant

__While digital assistants may seem like magic, they are just elaborate computer programs that parse, or process, text__ looking for combinations of words to make decisions about what to reply.

Over the next few lessons, __you're going to build up your own digital assistant that responds "intelligently" to a user's question__, by making a decision about what to reply based on the contents.

You'll now __explore a demo digital assistant__, Movie Bot, that represents the kind of program that you'll build up to. Try out some of the prompts below and also try your own. You'll quickly find the limits of what this program can and can't do.

# Do This:
__Run Movie Bot. In the _'enter your question here'_ input, type each of the following prompts and hit 'enter.' __
- 'help'
- 'What is the best PG comedy movie ever?'
- 'What PG comedy movie should I watch next?'
- 'Could you please tell me the best romance movie?'
- 'I waNT To WatCH a MovIE!!!'
- 'What is the capital of Kentucky?'
- Play around! Ask more questions of Movie Bot and make a prediction about what logic it's using to reply.


## ------ Level 4------	
# Introducing the  *change* Event

Did you notice with the demo digital assistant that you could just __type a question, hit 'enter', and the assistant would respond__? Up until now you've been using the click of a button to trigger getting the text from an input or text area.

You can use a new event type to get this behavior: The __'change' event__ is triggered when the user hits 'enter' in a text input after typing.


<img src="https://images.code.org/7d1725b236471f8e2a0efed5870660da-image-1446071579670.32.36.png" style="width:350px;">

# Do This:
<img src="https://images.code.org/f8f1f7ae18acbc570a367886bcd6ca88-image-1445976541574.gif" style="width:250px;">
- A __text input__ has been created for you that asks for a user's name.
- Attach a __'change'__ event handler to the text input.
- When the 'change' event triggers, __write the user's name and a greeting__.


## ------ Level 5------	
# Getting Started with Your Digital Assistant

<img src="https://images.code.org/e875ff7b54c314a378cdb784f92371a0-image-1445989933171.52.04.png" style="width:200px;float:right;">
Over the course of the next few lessons, you'll be __developing your own digital assistant__. To make your digital assistant more useful, it needs to be able to make __decisions__ based on questions the user asks it, and respond intelligently.

To get started, __choose a topic__ you want your digital assistant to specialize in. It should be something you are interested in and know a lot about. Examples: Country Music, Sushi, College Football, Comedy Movies.

You'll next set up the layout for your app. __The basic layout contains just two primary design elements:__ a text input and a text area.

# Do This:

- __Choose a topic__ for your digital assistant to specialize in.
- __Create the layout__ for your app. Your digital assistant should have:
    - A name
    - A text input for the user to ask a question
    - A text area for the digital assistant to respond
    - The text area should have a greeting for the user (e.g. Ask me a question about movies!)


## ------ Level 6------	
# Respond to Basic User Input

<img src="https://images.code.org/2bed8002ff3c89afb02db5809de1c40e-image-1445996503055.gif" style="width:200px;float:right;">
Now you can have your digital assistant repeat what the user typed and add a __default response__. It's not the most intelligent response, but you'll build up to that over the next couple of lessons and it's important to build this program in pieces.  

# Looking Back to Move Forward
You're going to now add to your program without as much guidance as usual. Keep in mind that __this is very similar to programs you've already built__, so look back at your work for a refresher.
- __Mad Libs:__ In Mad Libs you got a user's text when the 'Next' button was clicked, filled in the outline with the responses, and displayed the completed Mad Lib
- __Introducing the 'change' event:__ You just learned about the 'change' event that triggers when the user hits 'enter' on a text input.

# Do This:
- __Take the user's question and output it to the text area__ when the 'enter' key is pressed in the text input
- The response should also __include a default phrase__ such as _"I don't know about that yet!"_
- __Format the response with newline characters__ to separate the user's response from the assistant's response.: `\n`
- The __text input should clear__ after the user hits 'enter'"


## ------ Level 7------	
# ---------Lesson 18----------	


## ------ Level 2------	


## ------ Level 3------	"<style>
td{
 border: solid 1px black;
}
</style>

# Explore Comparison Operators

True/false decisions are made using boolean expressions. A __boolean expression__ is an expression that only evaluates to TRUE or FALSE, and you can use __comparison operators__ to craft boolean expressions.  

# Do This:

Use `console.log` to **print out the different boolean expressions below to see what information they return**.

| Boolean Expressions |
| --- |
| 3 > 2 |
| 2 > 3 |
| 5 + 3 < 10 |
| ‘a’ < ‘b’ |
| ‘j’ > ‘c’ |
| 2 == 2 |
| 2 != 2 |
| true == false |
| "x" == x |
| "Blue" == "blue" |
| x < 10 |"


## ------ Level 4------	


## ------ Level 5------	


## ------ Level 6------	
# *if* Statement

<img src="https://images.code.org/040c8364e3795252194b816623e949e5-image-1446227663554.54.03 PM.png" style="width: 100px; float: right">

The boolean expression we tested on the last level allows us to make decisions. In order to make these decisions we need to use something called a conditional. **Conditionals check if a boolean expression is true and then will execute the code inside of the `if` statement.** 

<img src="https://images.code.org/84123a7c317c63d8876b6b56086d717e-image-1446228290588.png" style="width: 150px; float: right">

Over the number couple levels we are going to be creating a **Guess My Number game**. The starter code uses `promptNum` to ask the user for a number from 1 to 10. The `if` statement checks if the user guess is equal to the secret number.  Right now nothing happens when they guess the right number. Can you fix that?

# Do This:

* Read the code to identify the boolean expression.
* Add a text label to the screen. Have it start out with "Guess my secret number!"
* **Set the text label to say "You got it right!" from inside the `if` statement**. This will tell them they get it right only when that condition is true!
* **Test your code out** to make sure it works.

<img src="https://images.code.org/2f3487ec7a8d7cec1605f3da830c83f8-image-1446227512726.gif" style="width: 350px">"


## ------ Level 7------	
# Dropdown

On the last level we used `promptNum` to get the user's guess. However, we had no way to limit them to the numbers we wanted. They could have typed 11 even though we told them not to. A better way to get input with a limited set of options is the dropdown. The <img src="https://images.code.org/3b21b4288a2a155d1e9a3c2cf3a5b09b-image-1446229368079.28.23 PM.png" style="width: 75px"> is in your Design Mode Toolbox. You can control the list of options users can choose and then use `getText` to get the chosen number.

We are going to need an event handler in order to do this. The event handler will detect when the user has changed the value of the dropdown. 

# Do This:

* **Add a dropdown** for their guess instead of `promptNum`. Make sure to give it a good ID.

<img src="https://images.code.org/fea164f6e53d1ce0c50981565e066d4c-image-1446229598357.gif" style="width: 350px">

* Under properties **find the Options** and change it to the **numbers 1 to 10**

<img src="https://images.code.org/0cfecbcdcfb95fc30876155ec6a3a021-image-1446229593687.gif" style="width: 250px">

* Add an event handler to detect the `change` event on your dropdown.<br><br>
<img src="https://images.code.org/48cffda5b7ff3a446116a39b4dbcbe8c-image-1446232308751.gif" style="width: 150px; float: right">
* Move your `if` statement inside the event handler so it will check each time the dropdown is changed.<br><br>
* When the dropdown is changed **use `getText` to find out the user's guess**. Save the guess using a variable. **Don't forget about scope!**<br><br>
* Test your app -- it should work like the demo."


## ------ Level 8------	
# What happens after an *if* ?

You may have noticed that our flowchart for our game so far only does something if the condition is true. What happens after the `if` statement? Let's find out.

<img src="https://images.code.org/90b7a527091704a6ab4612b9f84db305-image-1446234882661.png" style="width: 200px">

# Do This:

* **Add a `setText` after the `if` statement** to "Nope. Guess again."

<img src="https://images.code.org/f5c5de1b77a9caf16027e65ed24f91ec-image-1446234785600.gif" style="width: 450px">

* **Run the program** a couple times to **look for a bug**. We will fix this on the next level."


## ------ Level 9------	


## ------ Level 10------	
# *else*

<img src="https://images.code.org/b7942d778a54465ad6f9f19fbab8d1ef-image-1446237289306.34.23 PM.png" style="width: 150px; float: right">

Let's add an `else` statement so we can tell the user when they are right and when they are wrong.

**Note:**  You can create an `else` statement by hitting the <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> at the bottom of an `if` statement.  There is also an `if-else` block in the toolbox. 


# Do This:

* **Add an `else` statement**

* **Move your `setText` inside the `else` statement.** So it should say "Nope that's not it. Guess again." when the user does not guess the secret number."


## ------ Level 11------	


## ------ Level 12------	
# *else-if*

Let's help the user even more by telling them if they were right or if their guess was high or low. There are **only 3 possible cases:** 
* They were right.
* Their guess was higher than the number.
* Their guess was lower than the number. 

Therefore, we can use a conditional set with one `if`, one `else-if`, and one `else` to implement this. Check out the flowchart below to see the logic. In order to check if something is high remember you can use the greater than `>` symbol.

**Remember:**  You can create an `else-if` statement by hitting the <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> at the bottom of an `if` statement. The first <img src="https://images.code.org/f762344bc839dd8385730bb7d909657f-image-1446237096776.31.12 PM.png" style="width: 40px"> will add an `else`, the second will add an `else-if`.


# Do This:

* **Add an `else-if` statement to accommodate the 3 conditions.**

* **Update the conditions** using `<`, `>`, and `==` to tell the user if their guess was correct, high, or low.

* **Test out the program** to make sure your updates worked.

<img src="https://images.code.org/f7e483414dfe1d4585841e653e44d8b0-image-1446169181724.png" style="width: 100%">"


## ------ Level 13------	
# Debug Conditionals

Help! **I was trying to give the player a hint when their guess was within 2 of the secret number but the code I wrote isn't working.** Can you fix it?

Check out the flow chart for the logic I wanted. **Hint:** The major problem here is that **conditional statements run in order from top to bottom**. Remember you have to check the smallest case first. Which set of numbers is larger (guess > secret number) or (guess > secret number + 2) ?


# Do This:

* Run the code to identify when the program is not working correctly.

* Fix the problem with the order of the conditionals.

<img src="https://images.code.org/49a498425a6bd482523123ef46a1a747-image-1446416359338.png" style="width: 100%; float: right">
<a href="https://images.code.org/49a498425a6bd482523123ef46a1a747-image-1446416359338.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 14------	
# Using `if` to Display Images

We are going to set up a dice game. We want to show a picture of a single die for each random number generated 1 to 6. We've already set up the screen in Design Mode, with a button to generate the roll and an image to show a picture of the die.

**Note:** The flowchart for the desired behavior is below.

# Do This:

* Add an event handler for the Roll! button so that when the button is clicked it generates a random number from 1 to 6. 

* Add conditionals (`if`, `else if`, and `else`) to change the picture of the image (ID: `dice_image`) to display the correct side of the die depending on the random number generated. You will need to use <img src="https://images.code.org/89f2c13ef4ead590475c863a087597f8-image-1446535826599.30.16.png" style="width:150px"> with the URLs below to set the images for the die.
	* <img src="https://code.org/images/dice/1.png" style="width: 50px"> Dice 1 Image URL -  https://code.org/images/dice/1.png
    * <img src="https://code.org/images/dice/2.png" style="width: 50px"> Dice 2 Image URL -  https://code.org/images/dice/2.png
    * <img src="https://code.org/images/dice/3.png" style="width: 50px"> Dice 3 Image URL - https://code.org/images/dice/3.png
    * <img src="https://code.org/images/dice/4.png" style="width: 50px"> Dice 4 Image URL - https://code.org/images/dice/4.png
    * <img src="https://code.org/images/dice/5.png" style="width: 50px"> Dice 5 Image URL - https://code.org/images/dice/5.png
    * <img src="https://code.org/images/dice/6.png" style="width: 50px"> Dice 6 Image URL -  https://code.org/images/dice/6.png

<img src="https://images.code.org/392c125a2620ac4949091fc075864f4c-image-1446174585241.png" style="width: 100%">
<a href="https://images.code.org/392c125a2620ac4949091fc075864f4c-image-1446174585241.png" target="_blank">Open diagram in a new tab</a>


## ------ Level 15------	
# Adding Guess and Score to Dice Game

Let's have the user guess the number that will come up when we roll a single die. 

You can have multiple `if` statements, one after another, if they have different purposes which are separate. 

** Note: ** Use the flowchart below to help you figure out the logic of the game.

# Do This:

* **Add a dropdown** to take in the user's guess from 1 to 6.

* **Add a set of `if` statements to check if the dice roll number is equal to the user guess.** Put this set of `if` statements after your set of `if` statements for the dice image. It should be completely separate from the other set of `if` statements. 

* Create a variable to **keep track of score**. Give 10 points if they guess right and take one point away when they guess wrong.

* **Display the score** on the screen and update it after each dice roll.

<img src="https://images.code.org/ac24917ca18606f6f3c31a6be1a16d73-image-1446174953979.png" style="width: 100%">
<a href="https://images.code.org/ac24917ca18606f6f3c31a6be1a16d73-image-1446174953979.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 16------	
# Adding Difficulty Levels: Dropdowns with Strings

Let's add another element to our dice game: **difficulty levels**. The user will pick either "Easy" or "Hard."  These are strings so you might be wondering how to check for equality. **The `==` works on strings as well!** It checks if the first string is exactly the same as the second string. **Strings must be the same letters and even have the same case to be equal**! So "dog" and "Dog" would not be equal. 

# Do This:

* **Add a dropdown** for difficulty level with the options of "Easy" or "Hard." 

* **Create an `if` statement for difficulty level** which prints the difficulty level to the console.

<img src="https://images.code.org/9db291c8dd4192390e008aa764576cd3-image-1446175136919.png" style="width: 100%">
<a href="https://images.code.org/9db291c8dd4192390e008aa764576cd3-image-1446175136919.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 17------	
# Nested *if* Statements

<img src="https://images.code.org/1774efb17571d3370662e34b705dde47-image-1446485939643.37.11 PM.png" style="width: 150px; float: right">

**Let's change the scoring of the game to match the difficulty level.** 

New scoring rules:
* _Easy: +10 points right answer / -1 point for wrong answer_
* _Hard: +1 point right answer / -1 point for wrong answer_

How do we check _both_ the difficulty level and if the user's guess was correct? **We can actually put `if` statements inside of other `if` statements!** So we first want to check what the difficulty level is and then check if the user was right or wrong to determine the score.

** Note: ** The flowchart below outlines the logic you are trying to implement.

# Do This:

* Move a copy of the score `if` statement inside of the difficulty levels. Be careful with indenting. All of the `if` statements for score need to be inside of the difficulty `if` statement (i.e. indented 1 level more than the difficulty `if` statement)

<img src="https://images.code.org/2125a027997aeca75d18b8423058063d-image-1446485524945.gif" style="width: 350px">


* Edit the `if` statements to give the correct scores
	* Easy level (+10 right, -1 wrong)
    * Hard level (+1 right, -1 wrong)

<img src="https://images.code.org/3b95a9f5cca60fc0ffbf7c2fb174d737-image-1446175290414.png" style="width: 100%">
<a href="https://images.code.org/3b95a9f5cca60fc0ffbf7c2fb174d737-image-1446175290414.png" target="_blank">Open diagram in a new tab</a>

# ---------Lesson 19----------	


## ------ Level 2------	
# Adding Intelligence Using Conditionals

So far the digital assistant you created responds with the same message no matter what the user types. Let's look at how to make the digital assistant smarter. Let's work on creating a Movie Bot example before returning to your digital assistant.

In the last lesson we learned about `if`, `else-if`, and `else` statements. These allow us to make decisions. In the digital assistant we want to make decisions based on keywords. **The first keywords we want the Movie Bot to respond to are the movie genres: comedy, romance, action, and horror. **

**Note: ** Check out the flowchart below to see the logic we are trying to add. The current portions of the diagram that we are creating are <mark>highlighted in yellow</mark>.

# Do This:

* **Run the code** to understand what it does.

* **Add `else-if` statements** to the `if` to check if the word the user typed matches **action, romance and horror**.  **Note:** Movie Bot will only understand input in the form of "comedy" not "Comedy" or "What is a comedy?" 

* **Add an `else` statement** to print a default answer for any other input.

<img src="https://images.code.org/8ec655795042a2a3a22a85f0886f0d21-image-1446067226646.png" style="width: 100%">

<a href="https://images.code.org/8ec655795042a2a3a22a85f0886f0d21-image-1446067226646.png" target="_blank">Open diagram in a new tab</a>


## ------ Level 3------	
# Dealing with Character Case

What if the user types **ACTION** instead of **action**? These are two different strings to the computer and therefore it won't recognize they are the same. We want Movie Bot to treat words the same ignoring the case of the letters. We can do this using the string command `toLowerCase`.

**Note: ** Check out the flowchart below to see the logic we are trying to add. 

# Do This:

* **Try typing COMEDY, ACtioN, horroR, and Romance** into Movie Bot.

* **Use the `toLowerCase` command** to change all user input into lowercase letters after they enter it.

* **Check that COMEDY, ACtioN, horroR, and Romance generate the same recommendations** as comedy, action, horror, and romance.

<img src="https://images.code.org/183082e89d296b88112a5a5380afac6c-image-1446069165327.png" style="width: 100%">

<a href="https://images.code.org/183082e89d296b88112a5a5380afac6c-image-1446069165327.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 4------	
# *includes*
<img src="https://images.code.org/7373ad2ad98b0d815ce0b8196c2ec177-image-1446070324010.11.43 PM.png" style="width: 250px; float:right">

We're going to explore a new function called `includes`. This function can be used to check if one string appears anywhere inside of another. Just like `toUpperCase` and `toLowerCase` this function is called using **dot notation**.

# *includes* Returns a Boolean
**`includes` is a function that returns a boolean.** In other words, when the function runs it will **evaulate to either `true` or `false`**. This function can be used **anywhere you would normally use a boolean expression**.

You've actually **seen a few functions that return a value before this**. `randomNumber` is a function that returns a number and `getText` is a function that returns a string. In every case we've used these functions **as if they were the data type they return (or evaulate to)**. Notice that in block mode these functions don't have the connectors that other commands do since they will be used as a piece of data within another function.

# Do This:

* **Read the documentation** for `includes`.
* **Starter code** has been provided which shows one instance where a string does include a `searchValue` and one where it does not.
* **Replicate the style** of these commands to check the rest of questions provided.
* **Create three statements of your own using `includes`** making use of the `console.log` statements provided.
* **Once you're comfortable with this command move on.**"


## ------ Level 5------	
# Adding *includes* to the Movie Bot

If our Movie Bot is asked a question like "What is a good comedy movie?" it currently won't know how to respond, **even though the question includes one of its keywords.** By using `includes` we can allow our Movie Bot to sense if a keyword appears anywhere in the question.

# Do This:

* **Suggestion: Switch to Text Mode.** This will be much easier in Text Mode.
* **Change all your boolean expressions to use `includes` instead of `==`**.
* **Test out a couple sentences with your keywords** to make sure the change worked.

![](https://images.code.org/0df459c4ccd9b613b23409af7ff5f59e-image-1446139233341.gif)

**Note: ** Check out the flowchart below to see the logic we are trying to change.


<img src="https://images.code.org/ea8340252f50774c352f58fa7cc12e5c-image-1446069734921.png" style="width: 100%">

<a href="https://images.code.org/ea8340252f50774c352f58fa7cc12e5c-image-1446069734921.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 6------	
# Checking for a Question

We're going to start adding some "intelligence" to our Movie Bot. Since we've added `includes` it can now tell if its keywords appear anywhere in the input. As a result some inputs may be questions while others might simply be statements. **We'd like the movie bot to respond differently to questions and statements.**

In order to tell when the user is asking a question **we will be checking whether the input includes a question mark **.

# Do This:

* Add a separate statement to **check if the input includes a "?"**. 
* If the input includes a question mark **print "That's a good question." before the recommendation.**
* Otherwise print **"I only answer questions." before the recommendation.**
* **Test out a couple sentences with your keywords** to make sure the change worked.

**Example Input --->** | **Output**
---|---
What's the best action movie? | That's a good question. The best action movie is any James Bond movie.
I love comedy | I only respond to questions. The best comedy movie is The Princess Bride.
<br>
**Note:** Check out the flowchart below to see the logic we are trying to change.

<img src="https://images.code.org/e32fd89b6e03b9d49c94e39e79120c03-image-1446072381510.png" style="width: 100%">

<a href="https://images.code.org/e32fd89b6e03b9d49c94e39e79120c03-image-1446072381510.png" target="_blank">Open diagram in a new tab</a>"


## ------ Level 7------	
# Nested Conditionals

The way we left the Movie Bot in the last exercise is a little strange to see as a user. **Currently when the input doesn't have a question mark the Movie Bot says "I only respond to questions." but it still provides a recommendation**. We're going to alter our code so that the movie recommendation is only provided if the user asks a question.

# Do This:

* **Nest your movie genre `if` statements** inside the "?" `if` statement so that **a recommendation is made only if a question was asked**.
* **Remove the "That's a good question."** output.
* Ensure that **if your input is not a question** then the response is **I only respond to questions.**
* **Test out a couple sentences with your keywords** to make sure the change worked.

**Example Input --->** | **Output**
---|---
What's the best action movie? | The best action movie is any James Bond movie.
I love comedy | I only respond to questions.
<br>
**Note: ** Check out the flowchart below to see the logic we are trying to change.

<img src="https://images.code.org/c319d7ba43112451a6b25aa9475cacb5-image-1446074593924.png" style="width: 100%">

<a href="https://images.code.org/c319d7ba43112451a6b25aa9475cacb5-image-1446074593924.png" target="_blank">Open diagram in a new tab</a>

# ---------Lesson 20----------	


## ------ Level 2------	
# OR Operator

<img src="https://images.code.org/c1ec7743b3c8a888d76380f789263851-image-1446155863558.57.24 PM.png" style="width: 100px; float: right">

You will now see the JavaScript boolean operators AND (`&&`)  and OR (`||`) in code toolbox. You can drag them out or simply type them.

Let's try OR right now.  As a reminder: the OR operator will evaluate to true if *either or both* statements are true. If both are false, the OR operator will evaluate to false. 

<img src="https://images.code.org/48d59f73e701d452dd74ae304db59d93-image-1446482464792.png" style="width: 200px; float:right"> 


# Do This:
We've provided you with starting code that prompts the user to enter a day of the week and stores it in a variable.

**Add an `if` statement that uses an OR (`||`)** 

 * The program should write **"It's the weekend!"** if the day entered by the user is a weekend day.  
 * Otherwise it should write **"Can't wait for the weekend to get here."**"


## ------ Level 3------	
# AND Operator

<img src="https://images.code.org/c1ec7743b3c8a888d76380f789263851-image-1446155863558.57.24 PM.png" style="width: 100px; float: right">

Again you will see the JavaScript boolean operators AND (`&&`)  and OR (`||`) in code toolbox. You can drag them out or simply type them.

Let's now try out using an **AND** operator. As a reminder: **if both statements are true** then AND evaluates to **true**.  **If either (or both) are false** the AND operator will evaluate to **false**.

<img src="https://images.code.org/4a461db916ded2acccfcdb9a75ef8838-image-1446483668310.png" style="width: 250px; float: right">

# Do This:
We've provided you with starting code that prompts the user to enter their **age** and stores it in a variable.

**Add an `if` statement that uses an AND operator (`&&`)**

 * The app should write "You are a teenager." if the age is between 13 and 19.
 * Otherwise it should write "You are not a teenager."


## ------ Level 4------	


## ------ Level 5------	
# Combining AND and OR

You can express more complex conditions by combining **AND** and **OR** in one statement.  Here is the example from the previous page which you can use as a reference. This statement will evaluate to **true** if the day is Tuesday or Thursday AND their age is 15 or 16.

![](https://images.code.org/3f3aba7828abd88fdbd90eda60611bd3-image-1448062956405.06.36.png)

#  Do This:
We've provided you with starting code that prompts the user to enter a **day** and their **age** and stores the result in variables.

**Add an `if` statement that uses both AND and OR operators**

 * The app should write "Sleep in!" if it's a weekend and the user is a teenager.
 * Otherwise it should write "Uh oh. Have to wake up."
 

Try it out!


## ------ Level 6------	
# Combining AND and OR and NOT

You can stick a NOT (`!`) in front of any boolean expression to invert its result. This opens the door to express the same logical statements in different ways.  

For example, let's say you want to determine if a person, based on his or her age (under 12 or over 65) gets to pay a reduced price for a movie ticket.  You might express that like this:

```
// If your age is less than 12 or greater than 65
if( (age < 12) || (age > 65) ){
	write("You qualify for a reduced price!");
}
```

But you might also figure out a way to determine if a person gets a reduced price ticket by determining if his or her age is between 12 and 65 (`(age >= 12) && (age <= 65)`) and then taking the inverse of that.  So using the NOT operator this would work as well:

```
// If your age is NOT between 12 and 65
if( !( (age >= 12) && (age <= 65) ) ){
	write("You qualify for a reduced price!");
}
```

**Why use one over the other?** Personal preference.  Use the one that makes the most sense to you, but it should be a clear expression of what you are trying to say.  


# Do This:
We've provided you with starting code that prompts the user to enter a **day** and their **age** and store it in variables.

**Add an `if` statement that uses both AND and OR operators**

 * The app should write "Time for school!" if it's a weekday and the user is under 18.
 	* Hint: one way to say that it's a weekday is to say that it's NOT a weekend.
 * Otherwise, if it's a weekday and the user is 18 or older, it should write "Time to go to work!"
 * Otherwise, it should write "Time to relax for the weekend!"
 
 
**WARNING** logic can get tricky sometimes.  Make sure to test your program with inputs that cover every possibility. There are 4 basic cases to test for:

 * It is a weekday and age is under 18
 * It is a weekday and age is not under 18
 * It's not a weekday and age is under 18
 * It's not a weekday and age is not under 18

Try it out!"


## ------ Level 7------	
# OR Operator in Movie Bot

Let's try to check for the keywords related to questions ("who", "what", "where", "when", "why", "how", and "?") to decide if the user asked a question. You could do this with a chain of `if-else-if` statements, but it would not be very efficient. 

Instead let's use a **series of OR operators (`||`)** to check whether "who", "what", "where", "when", "why", "how" or "?" show up in the user input. 

**Note: ** We've updated the the flowchart below to show the logic we are trying to add to the initial question.

# Do This:

* **Update the `if` statement** to check if **"who" OR "what" OR "where" OR "when" OR "why" OR "how" OR "?"** have been typed in by the user.

* **Test out a couple sentences with your keywords** to make sure the change worked.

<img src="https://images.code.org/6104c7fd0ecd31010d12be79bc350831-image-1446495141539.png" style="width=500px">


## ------ Level 8------	
# Adding Rating to Keywords

Up until now our movie suggestions have just been based on genre. Let's now also look for keywords related to the movie rating like "G", "PG", "PG-13", and "R" so we can give movie suggestions based on both genre and rating.
 
**Note: ** We've updated the flowchart below (highlighted in yellow) to see the logic we are trying to add.

**Note 2: ** The logic of the program right now will yield some odd results - there are some things you can type that will give 2 suggestions - this is expected, for now.  We are just taking a small step here.  We'll refine the code again in later levels.

# Do This:

* **Add another set of `if`, `else-if`, and `else` statements** inside the question `if` statement to **check for keywords for movie ratings (G, PG, PG-13, and R).**

* **Hint:** When checking for "G", "PG" and "R" you need to be a little clever.  R and G are are letters that will show up in lots of words and PG will get confused with PG-13. We want to check for "g" and "r" with spaces on either side. So make sure to use `" g "` where there is a space on either side of g instead of `"g"`. For "pg" you can just add a space after the pg to look for `"pg "`

* **Test out a couple sentences with your keywords** to make sure the change worked.

<img src="https://images.code.org/3e05d49d32afbcb578cc3945f229dd2f-image-1448403915931.png" style="width: 100%">

<a href="https://images.code.org/3e05d49d32afbcb578cc3945f229dd2f-image-1448403915931.png" target="_blank">Click to open in separate window.</a>"


## ------ Level 9------	
# AND Operator in Movie Bot

On the last level you may have noticed that if you typed in a question like "What is an R rated comedy movie?" It gives two movie suggestions! It would make more sense for it to give one suggestion.

We could use nested `if` statements to do this by nesting `if` statements about ratings inside of `if` statements about genre. However, you might be getting a sinking feeling that this could become a lot of nested `if` statements very quickly! 

**Instead let's use the AND operator (`&&`) to check for a genre and a rating at the same time.** 

<img src="https://images.code.org/a9307ead3b147e0a8016f2054f47f5f2-image-1446153610104.png" style="width: 200px; float:right">

Be careful about the order of the `if` statements. As a general principle you want to check the most specific conditions before checking more general ones.  For example, you want to have an `if` statement that checks for rating AND genre evaluated before one that just checks for genre on its own. Having a more general `if` statement checked first might cut off or prevent more specific conditions from being reached.

You still want your app to give suggestions when just a rating or just a genre is detected, so keep this principle of ordering in mind. (Try them in the reverse order if you're interested in seeing what happens :))

**Note: ** Check out the flowchart below to see the logic we are trying to add.

# Do This:

* **Try the question "What is an R rated comedy movie?** to see the result.

* **Update the code to give only one movie suggestion when a genre and a rating are detected in the input.**
	* Make one set of `if`, `else-if`, and `else` statements about genre and rating
    * Add conditional statements to check for a comedy movie AND a rating. You could do this for all the genres but stick to one for now.

* **Test out a couple sentences with your keywords** to make sure the change worked.

<img src="https://images.code.org/80f4a6b07c446896eef72b499a7eba55-image-1448403968703.png" style="width: 100%">

<a href="https://images.code.org/80f4a6b07c446896eef72b499a7eba55-image-1448403968703.png" target="_blank">Click to open in separate window.</a>"


## ------ Level 10------	
# Adding a Separate *if*

It's still the case that sometimes you want to have two completely separate groups of `if` statements because there are separate conditions you want to check and possibly have responses for both. You don't always just keep adding to a giant `if` statement forever.

In the Movie Bot demo you probably saw that if you type "please" and "thank you" it adds something extra to the response (it says something like "Thanks for being polite!"). Let's add this functionality to your movie bot as well. 

**Note: ** Check out the flowchart below to see the logic we are trying to add.

# Do This:

* ** Add an `if` and `else-if` statement that checks for "please" and "thank you"**. 
	* If the string includes "please" it should say "Thank you for being so polite!" before it gives its response.
    * If the string includes "thank you" it should say "You are very welcome!" before it gives its response.

* **Test out a couple sentences with your keywords** to make sure the change worked.

<img src="https://images.code.org/5363cae7e68cf0a4283087c3a6acebf0-image-1446152576829.png" style="width: 100%">

<a href="https://images.code.org/5363cae7e68cf0a4283087c3a6acebf0-image-1446152576829.png" target="_blank">Click to open in separate window.</a>

# ---------Lesson 21----------	


## ------ Level 2------	
# Digital Assistant Project

**Your Digital Assistant Project is back!** Now that you've learned how to use conditional logic to control your program flow, it's time to add functionality to the digital assistant you previously designed.

# Do This:

* You should have already created a flowchart to design the logic for your digital assistant. 
* **Use your flowchart to program your digital assistant so that it "intelligently" responds to user input.**
	* Feel free to make changes to your existing project in Design Mode, if needed.
* **Test your program thoroughly** to make sure your digital assistant responds to user input appropriately.
* Once you're done, **submit your project!**
"