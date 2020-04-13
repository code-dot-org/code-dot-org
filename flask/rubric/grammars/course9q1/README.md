# README

Grammar for question 1 of course 9.
https://studio.code.org/s/coursed-2019/stage/9/puzzle/1

NOTE: no extra commands allowed for correctness.

# Strategy:

= base template

Program
    when_run

= Choose if empty; if so, done.

= Choose if add useless loop.

    a) True: 

        Add Repeat(1) {...}.
    
    b) False:

        Nothing

= Choose Loop or Manual

    a) Loop:

        = Choose forward vs backward strategy 

        a) Forward: normal thing to do

            = Choose first move type {nothing, loop, manual}

                a) nothing: done

                b) loop: 

                    = Choose loop number (1, 2, 3, 4, 5). 
                    
                        Add Loop with only Move(Forward) as body.

                c) manual: 
                
                    = Choose loop number (1, 2, 3). 
                    
                        Add Move(Forward) that number of times.

            = Choose body type {nothing, loop, manual}

                a) nothing: done

                b) loop:

                    = Choose loop number (1, 2, 3, 4, 5). 

                        Add Loop with body:

                        = Choose if drop Move(Forward)

                        = Choose if drop getNectar()

                        Result is one of the following:

                            Move(Forward)
                            getNectar() 

                            OR 

                            Move(Forward)

                            OR 

                            getNectar() 

                        = Choose random command (in loop)

                            nothing, Move(Forward), getNectar(), or both

                    = Choose random commands

                        nothing, Move(Forward), getNectar(), or both

                c) manual: 

                    = Choose loop number (1, 2, 3). 

                        Add (times that number of times)

                            Move(Forward)
                            getNectar() 

                    = Choose random commands

                        Move(Forward), getNectar(), or both

        b) Backward: take 3 steps first and go backwards one

            = Choose first 3 move type {loop, manual}

                a) loop: 

                    Add Loop (3 times) with only Move(Forward) as body.

                b) manual: 
                
                    Add Move(Forward) 3 times

            = Choose if remember getNectar

                a) True: Add getNectar() block.

                b) False: done

            = Choose body type {nothing, loop, manual}

                a) nothing: done

                b) loop:

                    Add Loop (1) with body:

                        Move(Backward)
                        getNectar() 

                    = Choose random commands

                        Move(Forward), getNectar(), or both

                c) manual: 

                    Move(Backward)
                        getNectar() 

                    = Choose random commands

                        Move(Forward), getNectar(), or both

    b) Manual:

        = Choose if remember nectar

            a) True:

                = Choose if remember first Move
                
                = Choose if remember last getNectar

            b) False:

                = Pick number of moves: 1, 2, or 3.
        
        = Choose if add extra loop

            a) True: 

                = Choose repeat arg (1,2,3,4,5)
                (= Body defaults to empty)

            b) False: done

= Postprocess 1: Drop lines (not repeat) if correct solution
    
    a) Drop single line
        Repeat with some probability
    
    b) Drop all code after this point

= Postprocess 2: For every contiguous Move, getNectar statement, 
                 flip weighted coin
    
    a) Heads: swap them
    
    b) Tails: nothing

= Postprocess 3: Stitch programs (1,2 3)

    a) 1: do nothing

    b) 2: sample new body and append

    c) 3: sample 2 new bodies and append

# NOTES and Thoughts
Chicken scratch as I am thinkig about my grammar and looking through student solutions.

## Moves

Move(Forward), Move(Backward)
Turn(Right), Turn(Left)
getNectar()
Repeat(N) { ... }

## Choices

Choose if Empty
Choose if Forward or Backward Strategy
Loop or Manual
Choose if forget getNectar
(Decide how many times to iterate)
If Loop
    Decide Loop # (2,3,4,5)
    Decide first Move (statement or loop or missing)
    In Loop
        Missing commands
        Extra Commands
    After Loop
        Extra commands
    Randomly split things into multiple loops
        e.g. Loop2x: move, nectar; Loop 1x: move; nectar
        e.g. Loop1x: move; Loop 2x: move, nectar;
        e.g. move; Loop2x: move, nectar
    Randomly add loop 1x around bodies 
else
    Choose if trailing repeat statement (1, 2, 3, 5x)
    missing initial move
    missing last getNectar
    1,2,3 moves only

Good idea is take a correct program and
1) randomly dropout lines
2) drop remainder of program starting from a line

Good also randomly flip get nectar and move forward
REALLY wrong solutions concat solutions... so sample 2 or 3 
and glue them together!

## Data Analysis

Two forms of correct:

Loop

```
Move(Forward)
Repeat(2) {
    Move(Forward)
    getNectar()
}
```

No Loop

```
Move(Forward)
Move(Forward)
getNectar()
Move(Forward)
getNectar()
```

Forward and Backward Strategies:

Forward (See Above)

Backward 

```
Repeat(3) {
    Move(Forward)
}
getNectar()
Move(Backward)
getNectar()
```

or 

```
Move(Forward)
Move(Forward)
Move(Forward)
getNectar()
Move(Backward)
getNectar()
```

Possible errors:

Loop 2x Move; getNectar;Move,getNectar.

Add Loop 1 repeat statements around pieces of code.

Take a correct solution:
    Extra getNectar in Loop. (collect every stage)
    Extra Move(Forward) before/after loop
    Extra getNectar() before/after loop
    Double getNectar()s
    Double Move(Forward)s
    Missing getNectar completely
    Double Move(Forward) in loop

    Move(Forward)
    Repeat(2) {
        Move(Forward)
        getNectar()
    }
    [[Extra Code]]

Extra code could be an empty for loop
[[Main Code]]
Repeat(N) {
}

Empty code

Nested loops.. (program by wrapping code in loops)