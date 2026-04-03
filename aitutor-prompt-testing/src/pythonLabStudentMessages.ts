/**
 * Realistic student messages for each (level × state) combination.
 * Two variants per entry:
 *   - studentMessage: student asks for help naturally, no explicit video request
 *   - studentMessageVideoRequested: student explicitly asks for a video
 *
 * These are merged into the studio data at runtime by main.ts.
 * Key: `${levelId}_${StudioStateEnum}`
 */
export const pythonLabStudentMessages: Record<
  string,
  {studentMessage: string; studentMessageVideoRequested: string}
> = {
  // -------------------------------------------------------------------------
  // Level 1: programming-fundamentals-lesson5-level1_2025-launch_2025
  // Topic: Painter Object basics — predict/read-only level
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level1_2025-launch_2025_START': {
    studentMessage: `I haven't run the code yet. It says my_painter.move() a couple times and then turn_left() and move() again. I'm supposed to predict what happens but I don't really know what these do`,
    studentMessageVideoRequested: `I haven't run the code yet and I'm supposed to predict what the Painter does. Is there a video I can watch that explains how the Painter moves and turns?`,
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_STRUGGLING': {
    studentMessage: `I ran it and the painter moved but I thought it would end up going right but it went left instead. Why does turn_left make it go a different direction than I expected`,
    studentMessageVideoRequested: `I ran it and got confused about which way turn_left actually turns the painter. Can you show me a video about how the Painter works?`,
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I haven't clicked run yet. I'm just looking at the code and I don't understand what Painter() does. Like why do you need the parentheses`,
    studentMessageVideoRequested: `I'm looking at the code before running it and don't understand what Painter() means with the parentheses. Is there a video explaining this?`,
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I ran the code and the painter moved but it didn't end up where I thought it would. I counted 2 moves then a turn then 1 more move but it doesn't look right to me`,
    studentMessageVideoRequested: `The painter moved but ended up in the wrong spot from what I expected. Can I watch a video about how move and turn_left work together?`,
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `Ok so I ran it and I think the painter goes forward twice then turns left and goes forward one more time. Is that right? I'm just not 100% sure about the turn`,
    studentMessageVideoRequested: `I think I understand what happens — moves twice, turns left, moves once more. Is there a video I can watch to make sure I really get how Painter moves?`,
  },
  'programming-fundamentals-lesson5-level1_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I get that it moves twice then turns left and then moves one more space. I just want to double check — does turn_left rotate 90 degrees or does it like flip around?`,
    studentMessageVideoRequested: `I mostly get it but want to confirm turn_left is 90 degrees not 180. Can you show me a video that shows the Painter turning so I can see it clearly?`,
  },

  // -------------------------------------------------------------------------
  // Level 2: programming-fundamentals-lesson5-level2_2025-launch_2025
  // Topic: Create a Painter and move it one space
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level2_2025-launch_2025_START': {
    studentMessage: `I see the import line at the top but there's just a comment that says your code here. I don't know how to start`,
    studentMessageVideoRequested: `I don't know how to start. The instructions say to create a Painter and move it. Is there a video showing how to do this?`,
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote Painter() and move() but I'm getting an error that says name 'move' is not defined. I don't get what I did wrong`,
    studentMessageVideoRequested: `I wrote Painter() and then move() on the next line but it says move is not defined. Can I watch a video about how to use the Painter object?`,
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I'm getting a syntax error, it says the parenthesis was never closed. I wrote my_painter = Painter( on one line and my_painter.move() after but it's broken`,
    studentMessageVideoRequested: `I have a syntax error about an unclosed parenthesis. Can you show me a video that demonstrates the right way to write this?`,
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I made the painter and called move() like five times and now it says runtime error. Did I hit a wall? I didn't know there were walls`,
    studentMessageVideoRequested: `I called move too many times and got a runtime error. Is there a video explaining how the Painter and the neighborhood grid work?`,
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I created my_painter and moved it but I moved it twice. The level only wants me to move it once I think. Does it matter how many times I move it?`,
    studentMessageVideoRequested: `I got the Painter created and moving but moved it twice instead of once. Can I see a video that shows how to do this correctly?`,
  },
  'programming-fundamentals-lesson5-level2_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I wrote my_painter = Painter() and my_painter.move() and I think it looks right but I want to make sure before I submit`,
    studentMessageVideoRequested: `I think my code is right — my_painter = Painter() and then my_painter.move(). Can you show me a video just so I can double check I'm doing it the right way?`,
  },

  // -------------------------------------------------------------------------
  // Level 3: programming-fundamentals-lesson5-level5_2025-launch_2025
  // Topic: Fix missing Painter — code calls methods but no Painter object was created
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level5_2025-launch_2025_START': {
    studentMessage: `I see code with move() and turn_left() in it but there's no Painter created anywhere. The instructions say to add one but I don't know exactly where to put it`,
    studentMessageVideoRequested: `The code has move and turn_left but no Painter. I need to add one but I'm not sure how. Can you show me a video about creating a Painter?`,
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried adding a Painter but it's still not working. I added painter = Painter() at the top but the move() calls are still breaking. Am I doing this wrong?`,
    studentMessageVideoRequested: `I added painter = Painter() at the top but the moves still don't work. Can I watch a video about how Painter objects are supposed to be set up?`,
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I tried writing Painter = Painter() and now it's giving me a really weird error. I don't think that's right but I don't know what else to do`,
    studentMessageVideoRequested: `I wrote Painter = Painter() and got an error. Is there a video showing me the right way to create a Painter object?`,
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I'm getting a NameError that says Painter is not defined. But I can see it says from neighborhood import Painter at the top so isn't it imported already?`,
    studentMessageVideoRequested: `I'm getting NameError even though I have the import. Can I watch a video that explains how to create and use a Painter object?`,
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I added my_painter = Painter() but the existing code says painter.move() with a lowercase p and no underscore. Should I rename mine or change the existing calls?`,
    studentMessageVideoRequested: `I created my_painter but the rest of the code uses painter — do they need to match? Can I see a video about this?`,
  },
  'programming-fundamentals-lesson5-level5_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I think I fixed it. I added painter = Painter() and the variable names all match now. I just want to make sure I put it in the right place — should it go before the move calls?`,
    studentMessageVideoRequested: `I added the Painter and matched the variable names. Can I watch a video real quick to confirm I'm creating it in the right place in the code?`,
  },

  // -------------------------------------------------------------------------
  // Level 4: programming-fundamentals-lesson5-level6_2025-launch_2025
  // Topic: Variables — add 4 typed variables and print them
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level6_2025-launch_2025_START': {
    studentMessage: `There are already print statements in the code but I haven't added any variables yet. It says I need a string, an int, a boolean, and a float. I don't really know how to make them`,
    studentMessageVideoRequested: `I need to add 4 different types of variables but I don't know how. Is there a video explaining variables in Python?`,
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_STRUGGLING': {
    studentMessage: `I added my name as a string and an age as a number but when I try to print them together like print(my_name + my_age) it gives me an error`,
    studentMessageVideoRequested: `I'm getting an error when I try to print my name and age together. Can I watch a video about Python variables and how to print them?`,
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote print(my_name + my_age) and it says TypeError: can only concatenate str not int to str. I thought you could add things together to print them`,
    studentMessageVideoRequested: `I'm getting a TypeError when I try to combine a string and an int. Is there a video showing the right way to print different types of variables?`,
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I'm getting an error that says my variable is not defined but I thought I defined it. I used is_student = True but now it says NameError`,
    studentMessageVideoRequested: `I'm getting a NameError even though I defined my variable. Can you show me a video about how variables work in Python?`,
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I got 3 of the variables working and printing. I have a string, int, and boolean but I can't figure out what a float is supposed to look like`,
    studentMessageVideoRequested: `I have 3 variables working but I don't get what a float is. Can I watch a video about Python variable types?`,
  },
  'programming-fundamentals-lesson5-level6_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have all 4 variables — my_name is a string, my_age is an int, my_height is a float, and is_student is True. I just don't know if I'm printing them the right way`,
    studentMessageVideoRequested: `I have all 4 variables but I'm not sure I'm printing them correctly. Is there a video about variables I can watch to check?`,
  },

  // -------------------------------------------------------------------------
  // Level 5: programming-fundamentals-lesson5-level7a_2025-launch_2025
  // Topic: Debug — Painter turns twice (180°) instead of once (90°)
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_START': {
    studentMessage: `I can see the code has two turn_left() calls right next to each other. Is that the bug? It looks like it would turn all the way around`,
    studentMessageVideoRequested: `I see two turn_left() calls in a row and I think that might be the bug. Can I watch a video about how Painter turns to understand what's happening?`,
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_STRUGGLING': {
    studentMessage: `I deleted some of the move() calls but the painter is still turning the wrong way. There are still two turn_left() in there and I don't know which one to delete`,
    studentMessageVideoRequested: `I'm still confused about which turn_left to remove. Can I see a video that shows how the Painter moves and turns so I can figure out the bug?`,
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I tried adding an if statement to skip one of the turns but now I'm getting a syntax error. I think I forgot the colon but now the code looks really messy`,
    studentMessageVideoRequested: `I accidentally introduced a syntax error while trying to fix the turn bug. Can I watch a video about the Painter to help me think about this differently?`,
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I tried moving the painter more but now it hit a wall and I'm getting a runtime error. I think I made it worse by adding too many moves`,
    studentMessageVideoRequested: `I added moves to try to fix it but now it hit a wall. Can I see a video about the Painter to help me understand what I should be doing?`,
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I removed one turn_left and now the painter is going the right direction but it's stopping one space short. Did I also need to add or remove a move?`,
    studentMessageVideoRequested: `Fixed the double turn but now the painter stops one step too early. Can I watch a video about how Painter navigation works?`,
  },
  'programming-fundamentals-lesson5-level7a_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I think I fixed both bugs. I deleted one turn_left and adjusted the moves. The painter is almost there but I think it's ending one spot off still`,
    studentMessageVideoRequested: `I'm really close — deleted one turn_left and fixed the moves. Can I see a Painter video to double check I'm thinking about movement correctly?`,
  },

  // -------------------------------------------------------------------------
  // Level 6: programming-fundamentals-lesson5-level8_2025-launch_2025
  // Topic: Debug — Painter stops next to cone instead of in front
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level8_2025-launch_2025_START': {
    studentMessage: `The instructions say the painter stopped next to the cone instead of in front. I can see the move and turn commands but I don't know what order they're supposed to go in`,
    studentMessageVideoRequested: `The painter stopped in the wrong place and I need to fix the order of the commands. Is there a video that shows how Painter moves work?`,
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_STRUGGLING': {
    studentMessage: `I moved some of the commands around but now the painter is going somewhere completely different. I don't know how to figure out the right order`,
    studentMessageVideoRequested: `I shuffled the commands but made it worse. Can I watch a video about the Painter so I can think through the order better?`,
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I accidentally deleted a parenthesis when I was moving lines around and now I'm getting a syntax error. I'm not sure which line it's on`,
    studentMessageVideoRequested: `I got a syntax error while rearranging the code. Can I see a video about Painter just to get unstuck?`,
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I changed the order and now the painter moved into a wall. I didn't think about walls when I was changing things around`,
    studentMessageVideoRequested: `I rearranged the moves and the painter hit a wall. Can I watch a Painter video to help me visualize the grid better?`,
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I think I mostly have the right order now. The painter gets close to the cone but it's ending up one step to the side still instead of right in front`,
    studentMessageVideoRequested: `Almost there but the painter is still one step off from being in front of the cone. Can I watch a video to help me visualize this?`,
  },
  'programming-fundamentals-lesson5-level8_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `The painter is almost exactly right — it gets right next to the cone but I think the final turn is in the wrong spot. Should the turn come before or after the last move?`,
    studentMessageVideoRequested: `I'm really close but I'm not sure if the last turn should go before or after the last move. Can I see a Painter video to confirm?`,
  },

  // -------------------------------------------------------------------------
  // Level 7: programming-fundamentals-lesson5-level9_2025-launch_2025
  // Topic: Help the Painter navigate
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson5-level9_2025-launch_2025_START': {
    studentMessage: `I have the import line but that's it. I don't know how to get the Painter to do what it needs to do on this level`,
    studentMessageVideoRequested: `I'm just starting and don't know how to make the Painter navigate. Can I watch a video about how to use the Painter?`,
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_STRUGGLING': {
    studentMessage: `I'm just guessing move() and turn_left() in different orders but I can't figure out the right path. How am I supposed to know which direction the painter is facing?`,
    studentMessageVideoRequested: `I'm guessing at commands and it's not working. Is there a video that shows how to think about the Painter's direction and movement?`,
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I got a syntax error and I don't know what I did. It says something about an unexpected indent`,
    studentMessageVideoRequested: `I'm getting a syntax error about unexpected indent. Can I watch a Painter video to help me get back on track?`,
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `The painter hit a wall or ran out of paint or something. I keep getting a runtime error no matter what I try`,
    studentMessageVideoRequested: `I keep getting runtime errors — the painter either hits walls or runs out of paint. Can I see a video about how the Painter works?`,
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `The painter is mostly doing what it should but it's stopping one step too early. I have the right number of turns I think, just one move is off`,
    studentMessageVideoRequested: `The painter is almost doing the right thing but stops one step early. Can I watch a Painter video to help me figure out what I'm missing?`,
  },
  'programming-fundamentals-lesson5-level9_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I'm really close I think. The painter is doing almost exactly what it's supposed to, I just need to check if my last command is right`,
    studentMessageVideoRequested: `Almost done, just not 100% sure about my last command. Can I see a video about the Painter to double check my understanding?`,
  },

  // -------------------------------------------------------------------------
  // Level 8: programming-fundamentals-lesson6-level7_2025-launch_2025
  // Topic: Functions with parameters
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson6-level7_2025-launch_2025_START': {
    studentMessage: `I see there are some custom functions I'm supposed to use but I don't know how to call a function with parameters. Like what do I put inside the parentheses?`,
    studentMessageVideoRequested: `I need to call functions with parameters but I don't know how. Is there a video explaining functions with parameters in Python?`,
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried calling the function but I don't know what to put as the argument. I wrote move_forward() with nothing inside but it says it's missing a required argument`,
    studentMessageVideoRequested: `My function call is missing a required argument but I don't know what to pass. Can I watch a video about functions with parameters?`,
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote the function call but forgot a parenthesis or something and now it's giving me a syntax error. I'm not sure which line is wrong`,
    studentMessageVideoRequested: `I have a syntax error in my function call. Can I see a video about functions with parameters so I can see the right syntax?`,
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I called the function with an argument but it's giving me a runtime error. I think I passed the wrong type — I put a string instead of a number maybe?`,
    studentMessageVideoRequested: `I'm getting a runtime error from my function call — I think I passed the wrong type of argument. Can I watch a video about how to use functions with parameters?`,
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I'm calling the functions correctly I think but the painter isn't doing quite the right thing. I think I'm passing the wrong number as the parameter`,
    studentMessageVideoRequested: `Functions are being called correctly but the painter does the wrong thing — I think my parameter values are off. Can I watch a video on functions with parameters?`,
  },
  'programming-fundamentals-lesson6-level7_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `Almost everything is working but I think one of my function calls has the wrong parameter value. Like maybe I said 3 when I should have said 4`,
    studentMessageVideoRequested: `I'm really close but one parameter value is probably wrong. Can I see a video about functions with parameters to double check my thinking?`,
  },

  // -------------------------------------------------------------------------
  // Level 9: programming-fundamentals-lesson7-level6_2025-launch_2025
  // Topic: Debugging with strategies
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson7-level6_2025-launch_2025_START': {
    studentMessage: `I haven't run the code yet. The instructions say to run it and observe what happens and then decide on a debugging strategy. What does that even mean?`,
    studentMessageVideoRequested: `I need to debug this code but I don't know what debugging strategies are. Is there a video about debugging functions in Python?`,
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_STRUGGLING': {
    studentMessage: `I ran the code and something weird happened but I don't know what the bug is. The output doesn't look right but I can't figure out which function is causing the problem`,
    studentMessageVideoRequested: `I ran the code and something is wrong but I can't tell which function has the bug. Can I watch a video about functions to help me debug?`,
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I was trying to add a print statement to debug and accidentally broke the code. Now I'm getting a syntax error that wasn't there before`,
    studentMessageVideoRequested: `I introduced a syntax error while trying to debug. Can I see a video about functions that might help me fix this?`,
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I tried to fix what I thought was the bug but now I'm getting a different error. I feel like I'm making it worse`,
    studentMessageVideoRequested: `I tried to fix the bug and got a new runtime error. Can I watch a video about functions to help me understand what's going wrong?`,
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I think I found the bug — one of the functions is calling the wrong thing. I changed it and the test is almost passing but something is still a little off`,
    studentMessageVideoRequested: `I found most of the bug but the test still isn't fully passing. Can I see a video about functions to make sure I'm fixing it the right way?`,
  },
  'programming-fundamentals-lesson7-level6_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I'm almost done, just one more small thing that's failing the test. I think the function is returning the wrong value in one case`,
    studentMessageVideoRequested: `Almost passing all the tests, just one edge case is failing. Can I watch a functions video to check my understanding?`,
  },

  // -------------------------------------------------------------------------
  // Level 10: programming-fundamentals-lesson7-level9_2025-launch_2025
  // Topic: Define missing paint_spaces() function in custom.py, reorder actions
  // -------------------------------------------------------------------------
  'programming-fundamentals-lesson7-level9_2025-launch_2025_START': {
    studentMessage: `It says there's a call to paint_spaces() but the function doesn't exist yet. I need to define it in custom.py but I'm not sure how to write a function from scratch`,
    studentMessageVideoRequested: `I need to define a paint_spaces() function but don't know how to write one. Is there a video about defining functions in Python?`,
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_STRUGGLING': {
    studentMessage: `I defined paint_spaces() but I made it paint twice in a row before moving. The instructions say to paint once, then move, then paint again. How do I change the order inside the function?`,
    studentMessageVideoRequested: `I wrote the function but the paint and move are in the wrong order. Can I watch a video about functions to see how to structure the code inside them?`,
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I'm writing the def line for my function and I'm getting a syntax error. I think I might have forgotten the colon at the end`,
    studentMessageVideoRequested: `I got a syntax error on my def line — I think I'm missing the colon. Can I see a video about how to define functions in Python?`,
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I defined the function and called it but the painter hit a wall. I think my function is moving too far each time it runs`,
    studentMessageVideoRequested: `My function causes the painter to hit a wall. Can I watch a video about functions to help me figure out where it's going wrong?`,
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I defined paint_spaces and the order inside is mostly right — paint, move, paint. But I'm not sure if I have the right number of paints or if I need to move at the end too`,
    studentMessageVideoRequested: `My function structure is close but I'm not sure about the exact logic. Can I watch a functions video to check my thinking?`,
  },
  'programming-fundamentals-lesson7-level9_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I think my function is correct but the painter is only painting the right number of spaces most of the time. One of the spots is getting skipped and I don't know why`,
    studentMessageVideoRequested: `Almost working but one spot is getting skipped. Can I see a video about functions to help me figure out what's off?`,
  },


  // Level 11: programming-fundamentals-lesson8-level1_2025-launch_2025
  // Topic: While loops — replace repeated move() calls
  'programming-fundamentals-lesson8-level1_2025-launch_2025_START': {
    studentMessage: `I have my_painter.move() written like 5 times in a row. the instructions say to use a while loop but I don't really know what that means or how to start`,
    studentMessageVideoRequested: `I have my_painter.move() written like 5 times in a row. the instructions say to use a while loop but I don't know how. is there a video I can watch about while loops?`,
  },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried writing while my_painter.move(): and now I get a TypeError. what does that even mean`,
    studentMessageVideoRequested: `I tried while my_painter.move(): and got a TypeError. can you show me a video about while loops so I understand how they work?`,
  },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote while my_painter.can_move() and it says SyntaxError but I don't see what's wrong`,
    studentMessageVideoRequested: `getting a SyntaxError on my while line. can I watch a video on while loops to see the right way to write one?`,
  },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `my code runs but gives an IndentationError. I have the while line and then move() on the next line but it's not indented I think`,
    studentMessageVideoRequested: `I keep getting an IndentationError with my while loop. is there a video that shows how indentation works with while loops?`,
  },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `the loop is running now but the painter moves twice each time through the loop. I only have one move() inside there though, not sure why it's doing it twice`,
    studentMessageVideoRequested: `my loop works but the painter moves twice every loop instead of once. can you show me a video about while loops to help me figure out what's happening?`,
  },
  'programming-fundamentals-lesson8-level1_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I wrote while my_painter.can_move(): my_painter.move() and it seems to work! is this right or did I do something wrong`,
    studentMessageVideoRequested: `I think I got it — while my_painter.can_move(): my_painter.move() — but can I watch a video on while loops to make sure I understand it correctly?`,
  },

  // Level 12: programming-fundamentals-lesson8-level2_2025-launch_2025
  // Topic: While loops — replace repeated paint()+move() with while has_paint()
  'programming-fundamentals-lesson8-level2_2025-launch_2025_START': {
    studentMessage: `I have paint and move written like 4 times. the directions say use a while loop with has_paint() but I'm not sure how to set it up`,
    studentMessageVideoRequested: `I have paint() and move() repeated a bunch of times and need to use a while loop. can I watch a video about while loops?`,
  },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried while my_painter.paint("red"): and it's giving me a TypeError. paint doesn't return anything??`,
    studentMessageVideoRequested: `tried while my_painter.paint("red"): and got TypeError. can you show me a video about while loops so I understand what goes in the condition?`,
  },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote while my_painter.has_paint() and there's a SyntaxError. the line looks fine to me`,
    studentMessageVideoRequested: `SyntaxError on my while has_paint() line. is there a video I can watch to see the correct syntax for while loops?`,
  },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I put move() before paint() inside the loop and now the painter hits a wall. does the order matter?`,
    studentMessageVideoRequested: `my painter keeps hitting a wall when move() is before paint() in my loop. is there a video that explains how while loops work with the painter?`,
  },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `the loop works but it paints two squares every time it goes around. I only have one paint() call, why is it painting twice`,
    studentMessageVideoRequested: `loop is working but painting twice each time through. can I see a video about while loops to understand why this might happen?`,
  },
  'programming-fundamentals-lesson8-level2_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I think I almost have it. while my_painter.has_paint(): then paint and move inside. it's mostly working but something's still a little off`,
    studentMessageVideoRequested: `I have while my_painter.has_paint(): with paint and move inside and it's almost working. can you show me a video about while loops to check if I have the right idea?`,
  },

  // Level 13: programming-fundamentals-lesson8-level3_2025-launch_2025
  // Topic: While loops — replace repeated take_paint() with while is_on_bucket()
  'programming-fundamentals-lesson8-level3_2025-launch_2025_START': {
    studentMessage: `I have take_paint() written 3 times in my code. the instructions say to use is_on_bucket() as the loop condition but I don't know what to do`,
    studentMessageVideoRequested: `I need to replace 3 take_paint() calls with a while loop using is_on_bucket(). can I watch a video about while loops first?`,
  },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote while my_painter.take_paint(): but I get a TypeError. I thought take_paint would return true or false`,
    studentMessageVideoRequested: `while my_painter.take_paint(): gives me TypeError. can you show me a video about while loops so I know how to pick the right condition?`,
  },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I have while my_painter.is_on_bucket() without a colon I think. it says SyntaxError`,
    studentMessageVideoRequested: `SyntaxError on my while is_on_bucket() line. is there a video I can watch that shows the right syntax for while loops?`,
  },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I put move() inside the bucket collecting loop and the painter hits a wall. should move() be inside or outside the while loop?`,
    studentMessageVideoRequested: `painter hits a wall when I have move() inside the is_on_bucket loop. is there a video that helps explain where code goes in a while loop?`,
  },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `the loop collects the paint but then the painter just stops. I forgot something after the loop I think`,
    studentMessageVideoRequested: `my while loop collects paint correctly but the painter doesn't move after. can I watch a video about while loops to understand what I'm missing?`,
  },
  'programming-fundamentals-lesson8-level3_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have the bucket loop working and the move() after it. I think it's almost right, there's just one small thing I'm not sure about`,
    studentMessageVideoRequested: `almost there with my while is_on_bucket loop and move after it. can you show me a video about while loops to make sure I've got it right?`,
  },

  // Level 14: programming-fundamentals-lesson8-level4_2025-launch_2025
  // Topic: While loop indentation bug — move() is outside the loop
  'programming-fundamentals-lesson8-level4_2025-launch_2025_START': {
    studentMessage: `I have while has_paint(): paint("blue") and then move() on the next line but the painter just paints in one spot and doesn't move. what's wrong`,
    studentMessageVideoRequested: `my while loop only paints one spot and doesn't move. the move() is after the while loop. is there a video that shows how indentation works in while loops?`,
  },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_STRUGGLING': {
    studentMessage: `I added more paint calls inside the loop to try to fix it but it still doesn't move. I don't get what the problem is`,
    studentMessageVideoRequested: `I keep adding stuff inside the loop but the painter still doesn't move right. can I watch a video about while loops to understand how they work?`,
  },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I tried to fix the loop and accidentally deleted the colon and now I get a SyntaxError`,
    studentMessageVideoRequested: `got a SyntaxError after messing with my while loop. is there a video I can watch to see the correct way to write a while loop?`,
  },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I indented move() but now it says IndentationError because I think I indented too much. how much indentation is right`,
    studentMessageVideoRequested: `got IndentationError when I tried indenting move() into my while loop. can you show me a video about indentation and while loops?`,
  },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `okay I indented the move() under the while loop and it's moving now!! but there's an extra line after the loop that I'm not sure should be there`,
    studentMessageVideoRequested: `indented move() and it works now mostly. can I watch a video about while loops to understand the full picture?`,
  },
  'programming-fundamentals-lesson8-level4_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have while has_paint(): with paint() and move() both indented inside. looks correct to me, is this right?`,
    studentMessageVideoRequested: `I think I fixed it — while has_paint() with paint and move both inside. can you show me a video about while loops just to double check?`,
  },

  // Level 15: programming-fundamentals-lesson8-level5_2025-launch_2025
  // Topic: While loop never runs — Painter starts with 0 paint
  'programming-fundamentals-lesson8-level5_2025-launch_2025_START': {
    studentMessage: `my while loop just doesn't do anything. I have while has_paint(): paint() and move() but the painter doesn't move at all`,
    studentMessageVideoRequested: `my while loop isn't running at all even though I wrote it correctly I think. is there a video about while loops that explains when they run and when they don't?`,
  },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried adding my_painter.paint() before the loop to give it paint but that just gives me an error too`,
    studentMessageVideoRequested: `I tried painting before the loop to add paint but got an error. can I watch a video about while loops to understand what's happening?`,
  },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I tried writing Painter(set_paint=5) to give the painter paint but now it's a TypeError. how do you give the painter paint at the start`,
    studentMessageVideoRequested: `tried Painter(set_paint=5) to initialize paint and got TypeError. is there a video about the Painter that shows how to set it up with paint?`,
  },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I added set_paint(5) now and the loop runs but the painter hits a wall. I think I have move before paint maybe`,
    studentMessageVideoRequested: `set_paint works now but the painter hits a wall. is there a video about while loops I can watch to see the right order for stuff inside the loop?`,
  },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I used set_paint(5) and the loop is working and painting! but I have an extra paint("yellow") outside the loop and I'm not sure if I should remove it`,
    studentMessageVideoRequested: `my loop is mostly working now with set_paint(5). can I watch a video about while loops to make sure I understand it right?`,
  },
  'programming-fundamentals-lesson8-level5_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have set_paint(5) then while has_paint(): paint("yellow") then move() and I think it's working! did I do it right?`,
    studentMessageVideoRequested: `I have set_paint(5) and while has_paint(): paint and move inside. I think it's right! can I watch a video to confirm I understand while loops?`,
  },

  // Level 16: programming-fundamentals-lesson8-level6_2025-launch_2025
  // Topic: Write custom functions with while loops
  'programming-fundamentals-lesson8-level6_2025-launch_2025_START': {
    studentMessage: `I don't know how to start. the instructions say to create a function in custom.py but I have no idea what to put in there`,
    studentMessageVideoRequested: `I need to write a function in custom.py with a while loop and I have no idea where to start. is there a video about while loops or functions I can watch?`,
  },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote the functions in custom.py but when I call collect_and_move() in main.py I get an error about missing arguments. do I need to pass something to the function?`,
    studentMessageVideoRequested: `I defined my functions but get errors when calling them. can I watch a video about functions or while loops to understand how to set this up?`,
  },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote def collect_and_move() without the colon at the end and now there's a SyntaxError`,
    studentMessageVideoRequested: `SyntaxError on my def line in custom.py. is there a video about functions that shows the right syntax?`,
  },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I think my while loop inside the function is infinite. the program just freezes and doesn't do anything`,
    studentMessageVideoRequested: `I have an infinite loop inside my function and the program freezes. can I watch a video about while loops to understand how to stop them?`,
  },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `the functions are working now! but collect_and_move collects the paint but doesn't move to the next spot. did I forget a move() somewhere`,
    studentMessageVideoRequested: `my function collects paint but doesn't move after. can I watch a video about while loops to make sure I have the right structure?`,
  },
  'programming-fundamentals-lesson8-level6_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `everything seems to work but I think I have the wrong paint color or the loop goes one too many times. almost there though`,
    studentMessageVideoRequested: `almost done with the custom functions level! can I watch a video about while loops just to make sure my loop condition is right?`,
  },

  // Level 17: programming-fundamentals-lesson8-level8a_2025-launch_2025
  // Topic: Import custom.py from Backpack, define take_all_paint()
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_START': {
    studentMessage: `I don't know what "import from Backpack" means. my code just has Painter() and some move() calls and I'm not sure what I'm supposed to do first`,
    studentMessageVideoRequested: `I need to import custom.py from backpack and define a function but I'm lost. is there a video about while loops or functions that might help?`,
  },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote take_all_paint in main.py but then when I tried to import it from custom it didn't work. I think I put it in the wrong file`,
    studentMessageVideoRequested: `I put my function in the wrong file and can't import it. is there a video about functions that explains how imports work?`,
  },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I have take_all_paint(my_painter and it says SyntaxError. oh wait I think I'm missing the closing parenthesis`,
    studentMessageVideoRequested: `SyntaxError on my function call, missing a parenthesis I think. can I watch a video about functions or while loops to make sure I'm writing this right?`,
  },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `it says AttributeError — something about take_all_paint not being found. I defined it but maybe it's not in the right place`,
    studentMessageVideoRequested: `getting AttributeError when I call take_all_paint. can I watch a video about functions to understand how to define and use them in the right file?`,
  },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I got the import working and the function runs correctly! but I forgot to actually call it in main.py I think. it collects paint when I test the function but nothing happens in the program`,
    studentMessageVideoRequested: `function is working but I forgot to call it in main. is there a video about while loops or functions that could help me finish this up?`,
  },
  'programming-fundamentals-lesson8-level8a_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `almost done! everything is set up I think but I'm passing the wrong argument name or something small like that`,
    studentMessageVideoRequested: `so close to finishing this one! can I watch a video about while loops or functions just to make sure my logic is solid?`,
  },

  // Level 18: programming-fundamentals-lesson9-level1_2025-launch_2025
  // Topic: Conditionals — add if is_facing_west() inside a while loop
  'programming-fundamentals-lesson9-level1_2025-launch_2025_START': {
    studentMessage: `the code already has a while loop and the painter moves around. but the instructions say to add an if statement for is_facing_west(). I'm not sure where to put it or how to write it`,
    studentMessageVideoRequested: `I need to add an if statement inside a while loop but I'm not sure how conditionals work. is there a video about if statements I can watch?`,
  },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote if my_painter.is_facing_west: without the parentheses and now it paints everywhere, not just when facing west. why does it work wrong`,
    studentMessageVideoRequested: `I wrote if my_painter.is_facing_west without () and it paints everywhere. can I watch a video about conditionals to understand what I did wrong?`,
  },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote if my_painter.is_facing_west() and forgot the colon. SyntaxError again`,
    studentMessageVideoRequested: `SyntaxError on my if line. can I see a video about if statements so I don't keep making syntax mistakes?`,
  },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I added a move() inside the if block and now the painter goes to the wrong place. should there be a move() inside the if or not`,
    studentMessageVideoRequested: `added move() inside my if block and the painter goes the wrong way. can I watch a video about conditionals to understand what should go inside an if statement?`,
  },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I have the if block working but I put it after the while loop instead of inside it. does that make a difference? it only paints once`,
    studentMessageVideoRequested: `my if statement is after the loop instead of inside it so it only runs once. is there a video about conditionals that shows how to put an if inside a while?`,
  },
  'programming-fundamentals-lesson9-level1_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have the if inside the while loop now but I think I'm checking is_facing_east instead of is_facing_west. just have to switch the direction I think`,
    studentMessageVideoRequested: `almost there but checking the wrong direction in my if statement. can I watch a video about conditionals to make sure I'm using the right condition?`,
  },

  // Level 19: programming-fundamentals-lesson9-level2a_2025-launch_2025
  // Topic: Conditionals — modify if to check can_move("south")
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_START': {
    studentMessage: `the code already has an if statement but the painter doesn't turn when it should. the instructions say to modify the condition to use can_move. how do I do that`,
    studentMessageVideoRequested: `I need to change an if statement condition to use can_move("south") but I'm not sure about conditionals. is there a video about if statements I can watch?`,
  },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_STRUGGLING': {
    studentMessage: `I tried if my_painter.can_move("right"): and it gave me a ValueError. I thought right was a valid direction`,
    studentMessageVideoRequested: `tried can_move("right") and got ValueError. can I watch a video about conditionals to understand how to use can_move?`,
  },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I have if my_painter.can_move("south") without a colon and get SyntaxError`,
    studentMessageVideoRequested: `SyntaxError on my if can_move line. can I watch a video about conditionals to see the right syntax?`,
  },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I added turn_right() and then move() inside the if block but now the painter hits a wall. I think it's moving twice somehow`,
    studentMessageVideoRequested: `painter hits a wall after I added turn and move inside my if. is there a video about conditionals that shows what should go inside an if block?`,
  },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `the condition is can_move("south") now and the painter turns right. but I also have an extra move() inside the if block that I'm not sure about`,
    studentMessageVideoRequested: `painter turns right correctly now but there's an extra move in my if block. can I watch a video about conditionals to figure out what should be in there?`,
  },
  'programming-fundamentals-lesson9-level2a_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have if my_painter.can_move("south"): turn_right() and it mostly works! just one extra step somewhere I think`,
    studentMessageVideoRequested: `almost done! if can_move("south") with turn_right inside. can I watch a video about conditionals to double check my logic?`,
  },

  // Level 20: programming-fundamentals-lesson9-level3_2025-launch_2025
  // Topic: Conditionals — write if is_on_paint(): turn_right(); move()
  'programming-fundamentals-lesson9-level3_2025-launch_2025_START': {
    studentMessage: `I need to write an if statement at the bottom that checks is_on_paint() but I've never written an if statement from scratch before. how do I start`,
    studentMessageVideoRequested: `I need to write an if is_on_paint() statement from scratch. can I watch a video about conditionals so I know how to write one?`,
  },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_STRUGGLING': {
    studentMessage: `I wrote if my_painter.is_on_paint: without the parentheses and the painter turns right everywhere not just on paint. why`,
    studentMessageVideoRequested: `I wrote if my_painter.is_on_paint without () and it runs everywhere. can I watch a video about conditionals that explains how if statements check conditions?`,
  },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_SYNTAX_ERRORS': {
    studentMessage: `I wrote if my_painter.is_on_paint() but forgot the colon and got SyntaxError`,
    studentMessageVideoRequested: `SyntaxError on my if statement. can I watch a video about if statements to get the syntax right?`,
  },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_RUNTIME_ERRORS': {
    studentMessage: `I added an extra move() in my if block and now the painter hits a wall. the instructions only say turn_right and move but maybe I added too many moves`,
    studentMessageVideoRequested: `painter hits wall because of extra move() in my if block. is there a video about conditionals that explains what to put inside an if statement?`,
  },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_GOOD_PROGRESS': {
    studentMessage: `I have the if block and turn_right() inside it. but I forgot to add move() inside the if I think. the painter turns but then doesn't move`,
    studentMessageVideoRequested: `my if block has turn_right but I forgot to add move() inside it. can I watch a video about conditionals to see how to structure the if block?`,
  },
  'programming-fundamentals-lesson9-level3_2025-launch_2025_ALMOST_THERE': {
    studentMessage: `I have if my_painter.is_on_paint(): turn_right() and then move() but I think move() is outside the if block. they need to both be inside right?`,
    studentMessageVideoRequested: `I have turn_right inside my if block but move() is outside it. can I watch a video about conditionals to understand what needs to be indented inside the if?`,
  },
};
