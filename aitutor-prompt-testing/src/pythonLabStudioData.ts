/**
 * Studio state data for AI tutor test dataset.
 *
 * Key: `${levelId}_${StudioStateEnum}` — represents a specific student conceptual
 * state on a specific level. Used to simulate realistic AI tutor contexts for
 * testing and prompt development.
 *
 * Covers 3 neighborhood levels × 6 states = 18 entries.
 * Expand by adding entries for additional pythonlab levels as needed.
 */
import {
  PythonLabStudioStateData,
  StudioStateEnum,
  STUDIO_STATE_LABELS,
} from './aiTutorTestTypes';

export type {StudioStateEnum};
export {STUDIO_STATE_LABELS};

// Key: `${levelId}_${StudioStateEnum}`
export const pythonLabStudioData: Record<string, PythonLabStudioStateData> = {
  // ─────────────────────────────────────────────────────────────────────────
  // Level: aif-pl-objects-create-L17-2-python_2025
  // Task: Create a Painter object and move it forward one space
  // ─────────────────────────────────────────────────────────────────────────

  'aif-pl-objects-create-L17-2-python_2025_START': {
    studentCode: `from neighborhood import Painter

# Your code here`,
    hasRun: false,
    hasEdited: false,
  },

  'aif-pl-objects-create-L17-2-python_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

Painter
move`,
    consoleOutput: `NameError: name 'move' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  'aif-pl-objects-create-L17-2-python_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(
my_painter.move()`,
    consoleOutput: `SyntaxError: '(' was never closed (line 3)`,
    hasRun: true,
    hasEdited: true,
  },

  'aif-pl-objects-create-L17-2-python_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.Move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'Move'. Did you mean: 'move'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Student created the Painter correctly but forgot to call move()
  'aif-pl-objects-create-L17-2-python_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Student called move() twice instead of once
  'aif-pl-objects-create-L17-2-python_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.move()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: aif-pl-conditional1-L10-python_2025
  // Task: Add if statement checking is_facing_west(); move paint("blue") inside it
  // ─────────────────────────────────────────────────────────────────────────

  'aif-pl-conditional1-L10-python_2025_START': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.paint("blue")`,
    hasRun: false,
    hasEdited: false,
  },

  // Student confused about if syntax — used bare variable name instead of method call
  'aif-pl-conditional1-L10-python_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
if west:
    my_painter.paint("blue")`,
    consoleOutput: `NameError: name 'west' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Student has the right method but forgot the colon at the end of the if
  'aif-pl-conditional1-L10-python_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
if my_painter.is_facing_west()
    my_painter.paint("blue")`,
    consoleOutput: `SyntaxError: expected ':' after condition (line 7)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student forgot quotes around the color name
  'aif-pl-conditional1-L10-python_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
if my_painter.is_facing_west():
    my_painter.paint(blue)`,
    consoleOutput: `NameError: name 'blue' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Student added the if with correct condition but paint is still outside the block
  'aif-pl-conditional1-L10-python_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
if my_painter.is_facing_west():
    pass
my_painter.paint("blue")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Student has the if structure correct but used the wrong color
  'aif-pl-conditional1-L10-python_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
if my_painter.is_facing_west():
    my_painter.paint("red")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: aif-pl-two-waySelection-L16-python_2025
  // Task: Fix if condition to use can_move("east"); add else for forward movement
  // ─────────────────────────────────────────────────────────────────────────

  'aif-pl-two-waySelection-L16-python_2025_START': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move():
        my_painter.turn_left()
        my_painter.move()
    my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  // Student attached else to the while loop instead of the if
  'aif-pl-two-waySelection-L16-python_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move():
        my_painter.turn_left()
        my_painter.move()
    my_painter.move()
else:
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Student added else but forgot the colon
  'aif-pl-two-waySelection-L16-python_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move("east"):
        my_painter.turn_left()
        my_painter.move()
    else
        my_painter.move()`,
    consoleOutput: `SyntaxError: expected ':' after 'else' (line 11)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student has correct structure but used wrong capitalization on method
  'aif-pl-two-waySelection-L16-python_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move("east"):
        my_painter.turn_left()
        my_painter.move()
    else:
        my_painter.Move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'Move'. Did you mean: 'move'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Student fixed the if condition to use "east" but hasn't added else yet
  'aif-pl-two-waySelection-L16-python_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move("east"):
        my_painter.turn_left()
        my_painter.move()
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Student has both if/else but forgot turn_left() inside the if branch
  'aif-pl-two-waySelection-L16-python_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(0, 0, "East", 10)
my_painter.move()
my_painter.turn_left()

while my_painter.can_move():
    if my_painter.can_move("east"):
        my_painter.move()
    else:
        my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson5-level5_2025-launch_2025
  // Task: The Painter methods are called but no Painter has been created yet.
  //       Fix the program by adding my_painter = Painter().
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson5-level5_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter

# TODO: create a Painter here!
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  // Student just wrote "Painter" on its own line — didn't call Painter()
  'programming-fundamentals-lesson5-level5_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

Painter
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `NameError: name 'my_painter' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Student started writing Painter() but forgot to close the parenthesis
  'programming-fundamentals-lesson5-level5_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter(
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `SyntaxError: '(' was never closed (line 3)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student created Painter correctly but capitalized the method name
  'programming-fundamentals-lesson5-level5_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.Move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'Move'. Did you mean: 'move'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Student created a Painter but used a different variable name than the rest of the code
  'programming-fundamentals-lesson5-level5_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

artist = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `NameError: name 'my_painter' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Student created Painter correctly but added an extra move, making the path wrong
  'programming-fundamentals-lesson5-level5_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson5-level6_2025-launch_2025
  // Task: Add 4 typed variables (String, Integer, Boolean, Float) and update
  //       the print statements to print each one. (console mini-app)
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson5-level6_2025-launch_2025_START': {
    studentCode: `# Add your 4 variables here


# Print each variable
print()
print()
print()
print()`,
    hasRun: false,
    hasEdited: false,
  },

  // Student wrote variable values without quotes for the string
  'programming-fundamentals-lesson5-level6_2025-launch_2025_STRUGGLING': {
    studentCode: `# Add your 4 variables here
string = hello
integer = 42
boolean = True
float = 3.14

# Print each variable
print(string)
print(integer)
print(boolean)
print(float)`,
    consoleOutput: `NameError: name 'hello' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Student forgot to close the string literal
  'programming-fundamentals-lesson5-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `# Add your 4 variables here
my_string = "hello
my_integer = 42
my_boolean = True
my_float = 3.14

# Print each variable
print(my_string)
print(my_integer)
print(my_boolean)
print(my_float)`,
    consoleOutput: `SyntaxError: EOL while scanning string literal (line 2)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student tries to concatenate string + integer directly in the print call
  'programming-fundamentals-lesson5-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `# Add your 4 variables here
my_string = "hello"
my_integer = 42
my_boolean = True
my_float = 3.14

# Print each variable
print(my_string + my_integer)
print(my_boolean)
print(my_float)`,
    consoleOutput: `TypeError: can only concatenate str (not "int") to str`,
    hasRun: true,
    hasEdited: true,
  },

  // Has all 4 variables but only updated 3 of the 4 print statements
  'programming-fundamentals-lesson5-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `# Add your 4 variables here
my_string = "hello"
my_integer = 42
my_boolean = True
my_float = 3.14

# Print each variable
print(my_string)
print(my_integer)
print(my_boolean)
print()`,
    consoleOutput: `hello
42
True`,
    hasRun: true,
    hasEdited: true,
  },

  // All 4 variables and prints, but float is defined as a string "3.14" instead of float 3.14
  'programming-fundamentals-lesson5-level6_2025-launch_2025_ALMOST_THERE': {
    studentCode: `# Add your 4 variables here
my_string = "hello"
my_integer = 42
my_boolean = True
my_float = "3.14"

# Print each variable
print(my_string)
print(my_integer)
print(my_boolean)
print(my_float)`,
    consoleOutput: `hello
42
True
3.14`,
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson5-level9_2025-launch_2025
  // Task: Create a Painter and navigate through The Neighborhood to the food
  //       truck using move() and turn_left().
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson5-level9_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter

# Create a Painter and navigate to the food truck!`,
    hasRun: false,
    hasEdited: false,
  },

  // Student calls move() on the class itself instead of an instance
  'programming-fundamentals-lesson5-level9_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

Painter.move()
Painter.turn_left()
Painter.move()`,
    consoleOutput: `TypeError: Painter.move() missing 1 required positional argument: 'self'`,
    hasRun: true,
    hasEdited: true,
  },

  // Student misplaced the closing parenthesis
  'programming-fundamentals-lesson5-level9_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter)
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `SyntaxError: invalid syntax (line 3)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student keeps moving forward without turning, walks off the grid
  'programming-fundamentals-lesson5-level9_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()`,
    consoleOutput: `Error: The Painter tried to move off the edge of the grid`,
    hasRun: true,
    hasEdited: true,
  },

  // Created Painter and starting to navigate but only partway to the food truck
  'programming-fundamentals-lesson5-level9_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Almost at the food truck but has one extra turn_left at the end that overshoots
  'programming-fundamentals-lesson5-level9_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson6-level7_2025-launch_2025
  // Task: Write a program using custom functions (from custom.py) to get the
  //       Painter to the traffic cone and paint the path.
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson6-level7_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import *

# Write your program below`,
    hasRun: false,
    hasEdited: false,
  },

  // Student calls a custom function without passing the Painter as an argument
  'programming-fundamentals-lesson6-level7_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
move_forward()
move_forward()
paint_square()`,
    consoleOutput: `TypeError: move_forward() missing 1 required positional argument: 'this_painter'`,
    hasRun: true,
    hasEdited: true,
  },

  // Student uses def syntax where they should be calling a function
  'programming-fundamentals-lesson6-level7_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import *

def my_painter = Painter()
my_painter.move()
turn_right(my_painter)`,
    consoleOutput: `SyntaxError: invalid syntax (line 4)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student calls a method that doesn't exist on the Painter
  'programming-fundamentals-lesson6-level7_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
move_forward(my_painter)
move_forward(my_painter)
my_painter.paint_color("red")`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'paint_color'. Did you mean: 'paint'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Moving toward the cone and painting but hasn't completed the full path
  'programming-fundamentals-lesson6-level7_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
move_forward(my_painter)
move_forward(my_painter)
my_painter.paint("red")
turn_right(my_painter)
move_forward(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Reaches the cone and paints most of the path but misses the final square
  'programming-fundamentals-lesson6-level7_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
move_forward(my_painter)
my_painter.paint("red")
move_forward(my_painter)
my_painter.paint("red")
turn_right(my_painter)
move_forward(my_painter)
my_painter.paint("red")
move_forward(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson7-level6_2025-launch_2025
  // Task: Debugging challenge — the Painter should collect all paint buckets
  //       using a while loop, but the program uses if (only collects one).
  // ─────────────────────────────────────────────────────────────────────────

  // Buggy starting code: uses if instead of while, so only picks up one bucket
  'programming-fundamentals-lesson7-level6_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
if my_painter.is_on_bucket():
    my_painter.take()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  // Student removed the conditional entirely and just calls take() unconditionally
  'programming-fundamentals-lesson7-level6_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
my_painter.take()
my_painter.take()
my_painter.take()
my_painter.move()`,
    consoleOutput: `Error: No paint bucket here to take`,
    hasRun: true,
    hasEdited: true,
  },

  // Student tries to add a while loop but forgets the colon
  'programming-fundamentals-lesson7-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.is_on_bucket()
    my_painter.take()
my_painter.move()`,
    consoleOutput: `SyntaxError: expected ':' after 'while' condition (line 4)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student tries a method that doesn't exist
  'programming-fundamentals-lesson7-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take_all()
my_painter.move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'take_all'. Did you mean: 'take'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Changed if to while but forgot to add move() after the loop
  'programming-fundamentals-lesson7-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Correct structure but move() is inside the while loop instead of after it
  'programming-fundamentals-lesson7-level6_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take()
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level6_2025-launch_2025
  // Task: Write collect_and_move() in custom.py — loops taking paint while
  //       on a bucket, then moves forward. Use it in a loop in main.py.
  // ─────────────────────────────────────────────────────────────────────────

  // Starting state: main.py calls collect_and_move; custom.py just has pass
  'programming-fundamentals-lesson8-level6_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)`,
    hasRun: false,
    hasEdited: false,
  },

  // Student defines the function inside main.py instead of custom.py, then gets confused
  'programming-fundamentals-lesson8-level6_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

def collect_and_move():
    my_painter.take()
    my_painter.move()

while my_painter.can_move():
    collect_and_move()`,
    consoleOutput: `Error: No paint bucket here to take`,
    hasRun: true,
    hasEdited: true,
  },

  // Student forgot the colon after the function definition
  'programming-fundamentals-lesson8-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move

my_painter = Painter()

def collect_and_move(this_painter)
    while this_painter.is_on_bucket():
        this_painter.take()
    this_painter.move()

while my_painter.can_move():
    collect_and_move(my_painter)`,
    consoleOutput: `SyntaxError: expected ':' after function definition (line 6)`,
    hasRun: true,
    hasEdited: true,
  },

  // Student uses a method name that doesn't exist for taking paint
  'programming-fundamentals-lesson8-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)

# custom.py:
# def collect_and_move(this_painter):
#     while this_painter.is_on_bucket():
#         this_painter.collect()
#     this_painter.move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'collect'. Did you mean: 'take'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Function body collects paint correctly but forgot to add move() at the end
  'programming-fundamentals-lesson8-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)

# custom.py:
# def collect_and_move(this_painter):
#     while this_painter.is_on_bucket():
#         this_painter.take()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Function is correct but uses can_move() instead of is_on_bucket() for the inner while
  'programming-fundamentals-lesson8-level6_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)

# custom.py:
# def collect_and_move(this_painter):
#     while this_painter.can_move():
#         this_painter.take()
#     this_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson10-level1_2025
  // Task: Explore the move_if_can(direction) function — comment out the two
  //       if-statements, uncomment the function definition and call, then
  //       test with different direction arguments.
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson10-level1_2025_START': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

if my_painter.can_move("north"):
    my_painter.move()
if my_painter.can_move("east"):
    my_painter.move()

# def move_if_can(this_painter, direction):
#     if this_painter.can_move(direction):
#         this_painter.move()

# move_if_can(my_painter, "north")`,
    hasRun: false,
    hasEdited: false,
  },

  // Uncommented the function call but not the definition — NameError
  'programming-fundamentals-lesson10-level1_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

if my_painter.can_move("north"):
    my_painter.move()
if my_painter.can_move("east"):
    my_painter.move()

# def move_if_can(this_painter, direction):
#     if this_painter.can_move(direction):
#         this_painter.move()

move_if_can(my_painter, "north")`,
    consoleOutput: `NameError: name 'move_if_can' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Removed # from some lines of the function but not all — syntax error from partial uncomment
  'programming-fundamentals-lesson10-level1_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

if my_painter.can_move("north"):
    my_painter.move()
if my_painter.can_move("east"):
    my_painter.move()

def move_if_can(this_painter, direction):
#     if this_painter.can_move(direction):
#         this_painter.move()

move_if_can(my_painter, "north")`,
    consoleOutput: `SyntaxError: unexpected character after line continuation character (line 11)`,
    hasRun: true,
    hasEdited: true,
  },

  // Uncommented and called correctly but forgot quotes around the direction argument
  'programming-fundamentals-lesson10-level1_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

# if my_painter.can_move("north"):
#     my_painter.move()
# if my_painter.can_move("east"):
#     my_painter.move()

def move_if_can(this_painter, direction):
    if this_painter.can_move(direction):
        this_painter.move()

move_if_can(my_painter, north)`,
    consoleOutput: `NameError: name 'north' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Function uncommented and working but forgot to comment out the original if-statements
  'programming-fundamentals-lesson10-level1_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

if my_painter.can_move("north"):
    my_painter.move()
if my_painter.can_move("east"):
    my_painter.move()

def move_if_can(this_painter, direction):
    if this_painter.can_move(direction):
        this_painter.move()

move_if_can(my_painter, "north")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Everything correct but calls with uppercase "NORTH" instead of "north"
  'programming-fundamentals-lesson10-level1_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()

# if my_painter.can_move("north"):
#     my_painter.move()
# if my_painter.can_move("east"):
#     my_painter.move()

def move_if_can(this_painter, direction):
    if this_painter.can_move(direction):
        this_painter.move()

move_if_can(my_painter, "NORTH")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson12-level5_2025-launch_2025
  // Task: Write take_or_move(this_painter) in custom.py — if on a bucket,
  //       call take_all_paint(); else move forward. Use in main.py loop.
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson12-level5_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)`,
    hasRun: false,
    hasEdited: false,
  },

  // Wrote if without else — Painter only takes paint and never moves
  'programming-fundamentals-lesson12-level5_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)

# custom.py:
# def take_or_move(this_painter):
#     if this_painter.is_on_bucket():
#         take_all_paint(this_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Missing colon after if condition
  'programming-fundamentals-lesson12-level5_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)

# custom.py:
# def take_or_move(this_painter):
#     if this_painter.is_on_bucket()
#         take_all_paint(this_painter)
#     else:
#         this_painter.move()`,
    consoleOutput: `SyntaxError: expected ':' after 'if' condition`,
    hasRun: true,
    hasEdited: true,
  },

  // Calls take_all_paint() but hasn't imported it — NameError
  'programming-fundamentals-lesson12-level5_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)

# custom.py:
# from custom import take_all_paint
#
# def take_or_move(this_painter):
#     if this_painter.is_on_bucket():
#         take_all_paint(this_painter)
#     else:
#         this_painter.move()`,
    consoleOutput: `NameError: name 'take_all_paint' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  // Correct structure but condition checks can_move() instead of is_on_bucket()
  'programming-fundamentals-lesson12-level5_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)

# custom.py:
# def take_or_move(this_painter):
#     if this_painter.can_move():
#         take_all_paint(this_painter)
#     else:
#         this_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Correct condition but moves in both branches instead of only in else
  'programming-fundamentals-lesson12-level5_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import take_or_move

my_painter = Painter()
while my_painter.can_move():
    take_or_move(my_painter)

# custom.py:
# def take_or_move(this_painter):
#     if this_painter.is_on_bucket():
#         take_all_paint(this_painter)
#         this_painter.move()
#     else:
#         this_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson12-level6_2025-launch_2025
  // Task: Debugging challenge — the if/else logic is inverted relative to
  //       the flowchart (moves when on bucket, takes when not on bucket).
  // ─────────────────────────────────────────────────────────────────────────

  // Buggy starting code: if/else bodies are swapped
  'programming-fundamentals-lesson12-level6_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    if my_painter.is_on_bucket():
        my_painter.move()
    else:
        my_painter.take()`,
    hasRun: false,
    hasEdited: false,
  },

  // Student removed the if/else entirely and just calls move() in a loop
  'programming-fundamentals-lesson12-level6_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    my_painter.take()
    my_painter.move()`,
    consoleOutput: `Error: No paint bucket here to take`,
    hasRun: true,
    hasEdited: true,
  },

  // Tries to add not keyword but puts it in the wrong place
  'programming-fundamentals-lesson12-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    if not my_painter.is_on_bucket:
        my_painter.take()
    else:
        my_painter.move()`,
    consoleOutput: `TypeError: argument of type 'builtin_function_or_method' is not iterable`,
    hasRun: true,
    hasEdited: true,
  },

  // Swapped the bodies correctly but used wrong method name in the take branch
  'programming-fundamentals-lesson12-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    if my_painter.is_on_bucket():
        my_painter.take_paint()
    else:
        my_painter.move()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'take_paint'. Did you mean: 'take'?`,
    hasRun: true,
    hasEdited: true,
  },

  // Swapped correctly but forgot to add move() after take() — Painter gets stuck
  'programming-fundamentals-lesson12-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    if my_painter.is_on_bucket():
        my_painter.take()
    else:
        my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Logic almost right but calls take() twice on bucket squares
  'programming-fundamentals-lesson12-level6_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter

my_painter = Painter()
while my_painter.can_move():
    if my_painter.is_on_bucket():
        my_painter.take()
        my_painter.take()
        my_painter.move()
    else:
        my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson12-level8_2025-launch_2025
  // Task: Write paint_or_turn(this_painter, color) in custom.py — while
  //       facing east: if has_paint(), paint+move; else turn_right().
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson12-level8_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")`,
    hasRun: false,
    hasEdited: false,
  },

  // Wrote the if/else without the while loop — only executes once
  'programming-fundamentals-lesson12-level8_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")

# custom.py:
# def paint_or_turn(this_painter, color):
#     if this_painter.has_paint():
#         this_painter.paint(color)
#         this_painter.move()
#     else:
#         turn_right(this_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Missing colon after while condition
  'programming-fundamentals-lesson12-level8_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")

# custom.py:
# def paint_or_turn(this_painter, color):
#     while this_painter.is_facing_east()
#         if this_painter.has_paint():
#             this_painter.paint(color)
#             this_painter.move()
#         else:
#             turn_right(this_painter)`,
    consoleOutput: `SyntaxError: expected ':' after 'while' condition`,
    hasRun: true,
    hasEdited: true,
  },

  // Student calls this_painter.turn_right() instead of the custom turn_right(this_painter)
  'programming-fundamentals-lesson12-level8_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")

# custom.py:
# def paint_or_turn(this_painter, color):
#     while this_painter.is_facing_east():
#         if this_painter.has_paint():
#             this_painter.paint(color)
#             this_painter.move()
#         else:
#             this_painter.turn_right()`,
    consoleOutput: `AttributeError: 'Painter' object has no attribute 'turn_right'`,
    hasRun: true,
    hasEdited: true,
  },

  // Has while loop and if/else but forgot to call move() inside the if branch
  'programming-fundamentals-lesson12-level8_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")

# custom.py:
# def paint_or_turn(this_painter, color):
#     while this_painter.is_facing_east():
#         if this_painter.has_paint():
#             this_painter.paint(color)
#         else:
#             turn_right(this_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Everything correct but uses can_move() instead of is_facing_east() for the while condition
  'programming-fundamentals-lesson12-level8_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import paint_or_turn, turn_right

my_painter = Painter()
collect_and_move(my_painter)
paint_or_turn(my_painter, "red")

# custom.py:
# def paint_or_turn(this_painter, color):
#     while this_painter.can_move():
#         if this_painter.has_paint():
#             this_painter.paint(color)
#             this_painter.move()
#         else:
#             turn_right(this_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson13-level1_2025
  // Task: Open-ended final project — bring code from backpack, run it,
  //       and iterate until it works as expected.
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson13-level1_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import *

# Add your code to the workspace.`,
    hasRun: false,
    hasEdited: false,
  },

  // Student pasted from backpack but forgot to save custom.py — ImportError
  'programming-fundamentals-lesson13-level1_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move, paint_or_turn, turn_right

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)
    paint_or_turn(my_painter, "red")`,
    consoleOutput: `ImportError: cannot import name 'collect_and_move' from 'custom'`,
    hasRun: true,
    hasEdited: true,
  },

  // Indentation error introduced while editing the copied code
  'programming-fundamentals-lesson13-level1_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)
  paint_or_turn(my_painter, "red")`,
    consoleOutput: `IndentationError: unindent does not match any outer indentation level (line 7)`,
    hasRun: true,
    hasEdited: true,
  },

  // Code runs but a function is called with wrong number of arguments
  'programming-fundamentals-lesson13-level1_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)
    paint_or_turn(my_painter)`,
    consoleOutput: `TypeError: paint_or_turn() missing 1 required positional argument: 'color'`,
    hasRun: true,
    hasEdited: true,
  },

  // Project mostly working — collects paint and paints some squares but loop ends early
  'programming-fundamentals-lesson13-level1_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)
paint_or_turn(my_painter, "red")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // Almost complete — everything works but paints with wrong color
  'programming-fundamentals-lesson13-level1_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import *

my_painter = Painter()
while my_painter.can_move():
    collect_and_move(my_painter)
    paint_or_turn(my_painter, "blue")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },
};
