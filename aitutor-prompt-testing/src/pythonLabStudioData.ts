/**
 * Studio state data for AI tutor test dataset.
 *
 * Key: `${levelId}_${StudioStateEnum}` — represents a specific student conceptual
 * state on a specific level. Used to simulate realistic AI tutor contexts for
 * testing and prompt development.
 *
 * Covers student-facing AIF U2 / standalone Python Lab levels.
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
  // Level: programming-fundamentals-lesson5-level5_2025-launch_2025

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

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson5-level7a_2025-launch_2025
  // Task: Debug buggy code — Painter turns twice (180°) instead of once (90°)
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
if my_painter.turn_left()
my_painter.move()
my_painter.move()`,
    consoleOutput: `  File "main.py", line 5
    if my_painter.turn_left()
                             ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall at position (4, 0).`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level7a_2025-launch_2025_ALMOST_THERE': {
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

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson5-level8_2025-launch_2025
  // Task: Debug — instructions in wrong order, Painter stops next to cone
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson5-level8_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson5-level8_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level8_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move(
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: `  File "main.py", line 4
    my_painter.turn_left()
               ^
SyntaxError: invalid syntax`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level8_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.turn_left()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall at position (3, 0).`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level8_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.turn_left()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson5-level8_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.turn_left()
my_painter.move()
my_painter.move()
my_painter.turn_left()
my_painter.turn_left()
my_painter.turn_left()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson7-level9_2025-launch_2025
  // Task: Define missing paint_spaces() in custom.py; fix action order
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson7-level9_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import take_paint

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson7-level9_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import take_paint, paint_spaces

def paint_spaces(painter):
    painter.paint("red")
    painter.paint("red")
    painter.move()

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson7-level9_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import take_paint

def paint_spaces(painter)
    painter.paint("red")
    painter.move()
    painter.paint("red")
    painter.move()
    painter.paint("red")

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    consoleOutput: `  File "main.py", line 4
    def paint_spaces(painter)
                             ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson7-level9_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import take_paint

def paint_spaces(painter):
    painter.paint("red")
    painter.move()
    painter.paint("red")
    painter.move()
    painter.paint("red")
    painter.move()

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson7-level9_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import take_paint

def paint_spaces(painter):
    painter.paint("red")
    painter.move()
    painter.paint("red")
    painter.move()
    painter.paint("red")

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson7-level9_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import take_paint

def paint_spaces(painter):
    painter.paint("red")
    painter.move()
    painter.paint("red")

my_painter = Painter()
take_paint(my_painter)
paint_spaces(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level1_2025-launch_2025
  // Task: Replace repeated move() calls with while can_move(): move()
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level1_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level1_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.move():
    my_painter.move()`,
    consoleOutput: `TypeError: 'NoneType' object is not iterable`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move()
    my_painter.move()`,
    consoleOutput: `  File "main.py", line 3
    while my_painter.can_move()
                               ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
my_painter.move()`,
    consoleOutput: `  File "main.py", line 4
    my_painter.move()
                     ^
IndentationError: expected an indented block after 'while' statement on line 3`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level1_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level2_2025-launch_2025
  // Task: Replace repeated paint()+move() with while has_paint(): ...
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level2_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.paint("red")
my_painter.move()
my_painter.paint("red")
my_painter.move()
my_painter.paint("red")
my_painter.move()
my_painter.paint("red")`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level2_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.paint("red"):
    my_painter.move()`,
    consoleOutput: `TypeError: 'NoneType' object is not iterable`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level2_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint()
    my_painter.paint("red")
    my_painter.move()`,
    consoleOutput: `  File "main.py", line 3
    while my_painter.has_paint()
                                ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level2_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.move()
    my_painter.paint("red")`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level2_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("red")
    my_painter.move()
    my_painter.paint("red")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level2_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("red")
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level3_2025-launch_2025
  // Task: Replace repeated take_paint() with while is_on_bucket(): take_paint()
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level3_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.take_paint()
my_painter.take_paint()
my_painter.take_paint()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level3_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.take_paint():
    my_painter.move()`,
    consoleOutput: `TypeError: 'NoneType' object is not iterable`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level3_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.is_on_bucket()
    my_painter.take_paint()
my_painter.move()`,
    consoleOutput: `  File "main.py", line 3
    while my_painter.is_on_bucket()
                                   ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level3_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take_paint()
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level3_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take_paint()
my_painter.paint("red")
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level3_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.is_on_bucket():
    my_painter.take_paint()
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level4_2025-launch_2025
  // Task: Fix indentation bug — move() outside while loop instead of inside
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level4_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("blue")
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level4_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("blue")
    my_painter.paint("blue")
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level4_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint()
    my_painter.paint("blue")
    my_painter.move()`,
    consoleOutput: `  File "main.py", line 3
    while my_painter.has_paint()
                                ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level4_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
        my_painter.paint("blue")
        my_painter.move()`,
    consoleOutput: `  File "main.py", line 4
    my_painter.paint("blue")
IndentationError: unexpected indent`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level4_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("blue")
    my_painter.move()
my_painter.paint("blue")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level4_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("blue")
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level5_2025-launch_2025
  // Task: Fix while loop that never runs — Painter starts with 0 paint
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level5_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.has_paint():
    my_painter.paint("yellow")
    my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level5_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.paint("yellow")
while my_painter.has_paint():
    my_painter.paint("yellow")
    my_painter.move()`,
    consoleOutput: `RuntimeError: Painter has no paint.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level5_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter(set_paint = 5)
while my_painter.has_paint():
    my_painter.paint("yellow")
    my_painter.move()`,
    consoleOutput: `TypeError: Painter.__init__() got an unexpected keyword argument 'set_paint'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level5_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.set_paint(5)
while my_painter.has_paint():
    my_painter.move()
    my_painter.paint("yellow")`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level5_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.set_paint(5)
while my_painter.has_paint():
    my_painter.paint("yellow")
    my_painter.move()
    my_painter.paint("yellow")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level5_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.set_paint(5)
while my_painter.has_paint():
    my_painter.paint("yellow")
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson8-level8a_2025-launch_2025
  // Task: Import custom.py, define take_all_paint(), import and call it
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import take_all_paint

def take_all_paint(painter):
    while painter.is_on_bucket():
        painter.take_paint()

my_painter = Painter()
take_all_paint(my_painter)`,
    consoleOutput: `NameError: name 'take_all_paint' is not defined`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import take_all_paint

my_painter = Painter()
take_all_paint(my_painter`,
    consoleOutput: `  File "main.py", line 5
    take_all_paint(my_painter
                             ^
SyntaxError: '(' was never closed`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()
custom.take_all_paint(my_painter)`,
    consoleOutput: `AttributeError: module 'custom' has no attribute 'take_all_paint'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import take_all_paint

my_painter = Painter()
take_all_paint(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson8-level8a_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import take_all_paint

my_painter = Painter()
take_all_paint(my_painter)
my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson9-level1_2025-launch_2025
  // Task: Add if is_facing_west(): paint("blue") inside existing loop
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson9-level1_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.turn_left()
my_painter.paint("blue")`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson9-level1_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.turn_left()
if my_painter.is_facing_west:
    my_painter.paint("blue")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.turn_left()
    if my_painter.is_facing_west()
        my_painter.paint("blue")`,
    consoleOutput: `  File "main.py", line 6
    if my_painter.is_facing_west()
                                  ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.turn_left()
    if my_painter.is_facing_west():
        my_painter.paint("blue")
        my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    my_painter.turn_left()
    if my_painter.is_facing_west():
        my_painter.paint("blue")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level1_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    if my_painter.is_facing_west():
        my_painter.paint("blue")
    my_painter.turn_left()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson9-level2a_2025-launch_2025
  // Task: Modify if statement to check can_move("south") so Painter turns right
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    if my_painter.can_move():
        turn_right(my_painter)
    my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    if my_painter.can_move("right"):
        turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: `ValueError: invalid direction 'right'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    if my_painter.can_move("south")
        turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: `  File "main.py", line 6
    if my_painter.can_move("south")
                                   ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    if my_painter.can_move("south"):
        turn_right(my_painter)
        my_painter.move()
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    if my_painter.can_move("south"):
        turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level2a_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
while my_painter.can_move():
    my_painter.move()
    if my_painter.can_move("south"):
        turn_right(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson9-level3_2025-launch_2025
  // Task: Write if is_on_paint(): turn_right() then move()
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson9-level3_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson9-level3_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
if my_painter.is_on_paint:
    turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level3_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
if my_painter.is_on_paint()
    turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: `  File "main.py", line 8
    if my_painter.is_on_paint()
                               ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level3_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
if my_painter.is_on_paint():
    turn_right(my_painter)
    my_painter.move()
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level3_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
if my_painter.is_on_paint():
    turn_right(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level3_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import turn_right

my_painter = Painter()
my_painter.move()
my_painter.move()
my_painter.move()
if my_painter.is_on_paint():
    turn_right(my_painter)
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson9-level6_2025-launch_2025
  // Task: Debug multiple bugs — indentation, missing colon, condition placement
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson9-level6_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(4)
while my_painter.can_move():
paint_if_has_paint(my_painter)
move_south_if_can(my_painter)`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson9-level6_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(4)
while my_painter.can_move():
    paint_if_has_paint(my_painter)
move_south_if_can(my_painter)
move_south_if_can(my_painter)
move_south_if_can(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level6_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(4)
while my_painter.can_move()
    paint_if_has_paint(my_painter)
    move_south_if_can(my_painter)`,
    consoleOutput: `  File "main.py", line 6
    while my_painter.can_move()
                               ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level6_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(4)
while my_painter.can_move():
    paint_if_has_paint(my_painter)
    move_south_if_can(my_painter)
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level6_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(4)
while my_painter.can_move():
    paint_if_has_paint(my_painter)
    move_south_if_can(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson9-level6_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import paint_if_has_paint, move_south_if_can

my_painter = Painter()
my_painter.set_paint(3)
while my_painter.can_move():
    paint_if_has_paint(my_painter)
    move_south_if_can(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson11-level1_2025
  // Task: Open-ended — add code using set_paint() and custom functions
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson11-level1_2025_START': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson11-level1_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()
my_painter.set_paint(5)
custom.collect_and_move(my_painter)
custom.paint_or_turn(my_painter)`,
    consoleOutput: `TypeError: paint_or_turn() missing 1 required positional argument: 'color'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson11-level1_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()
my_painter.set_paint(5
custom.collect_and_move(my_painter)`,
    consoleOutput: `  File "main.py", line 6
    custom.collect_and_move(my_painter)
    ^
SyntaxError: '(' was never closed`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson11-level1_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()
my_painter.set_paint(5)
while my_painter.can_move():
    custom.collect_and_move(my_painter)
    custom.paint_or_turn(my_painter, "red")
    my_painter.move()`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson11-level1_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
import custom

my_painter = Painter()
my_painter.set_paint(5)
while my_painter.can_move():
    custom.collect_and_move(my_painter)
    custom.paint_or_turn(my_painter, "red")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson11-level1_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import collect_and_move, paint_or_turn

my_painter = Painter()
my_painter.set_paint(5)
while my_painter.can_move():
    collect_and_move(my_painter)
    paint_or_turn(my_painter, "red")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson12-level1_2025-launch_2025
  // Task: Predict/read-only level — student reads code and says what it does
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson12-level1_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move():
    collect_and_move(my_painter)
if my_painter.has_paint():
    my_painter.paint("green")`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson12-level1_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move():
    collect_and_move(my_painter)
my_painter.paint("green")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level1_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move()
    collect_and_move(my_painter)
if my_painter.has_paint():
    my_painter.paint("green")`,
    consoleOutput: `  File "main.py", line 5
    while my_painter.can_move()
                               ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level1_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move():
    collect_and_move(my_painter)
    my_painter.paint("green")`,
    consoleOutput: `RuntimeError: Painter has no paint.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level1_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move():
    collect_and_move(my_painter)
if my_painter.has_paint():
    my_painter.paint("green")
    my_painter.move()`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level1_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import turn_right, collect_and_move

my_painter = Painter(0, 0, "east", 0)
while my_painter.can_move():
    collect_and_move(my_painter)
if my_painter.has_paint():
    my_painter.paint("green")`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Level: programming-fundamentals-lesson12-level4_2025-launch_2025
  // Task: Fix move_or_turn() — add else so Painter only turns when it can't move
  // ─────────────────────────────────────────────────────────────────────────

  'programming-fundamentals-lesson12-level4_2025-launch_2025_START': {
    studentCode: `from neighborhood import Painter
from custom import move_or_turn

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    hasRun: false,
    hasEdited: false,
  },

  'programming-fundamentals-lesson12-level4_2025-launch_2025_STRUGGLING': {
    studentCode: `from neighborhood import Painter

def move_or_turn(painter):
    if painter.can_move():
        painter.move()
    painter.turn_left()

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level4_2025-launch_2025_SYNTAX_ERRORS': {
    studentCode: `from neighborhood import Painter

def move_or_turn(painter):
    if painter.can_move():
        painter.move()
    else
        painter.turn_left()

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    consoleOutput: `  File "main.py", line 6
    else
        ^
SyntaxError: expected ':'`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level4_2025-launch_2025_RUNTIME_ERRORS': {
    studentCode: `from neighborhood import Painter

def move_or_turn(painter):
    if painter.can_move():
        painter.move()
        painter.turn_left()

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    consoleOutput: `RuntimeError: The Painter moved into a wall.`,
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level4_2025-launch_2025_GOOD_PROGRESS': {
    studentCode: `from neighborhood import Painter

def move_or_turn(painter):
    if painter.can_move():
        painter.move()
    else:
        painter.turn_left()

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },

  'programming-fundamentals-lesson12-level4_2025-launch_2025_ALMOST_THERE': {
    studentCode: `from neighborhood import Painter
from custom import move_or_turn

my_painter = Painter()
while my_painter.can_move():
    move_or_turn(my_painter)`,
    consoleOutput: '',
    hasRun: true,
    hasEdited: true,
  },
};
