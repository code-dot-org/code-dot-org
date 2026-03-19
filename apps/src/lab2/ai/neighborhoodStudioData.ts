/**
 * Studio data for AI tutor test dataset.
 *
 * Key: `${levelId}_${StudioStateEnum}` — represents a specific student conceptual
 * state on a specific level. Used to simulate realistic AI tutor contexts for
 * testing and prompt development.
 *
 * Covers 3 levels × 6 states = 18 entries.
 */

export type StudioStateEnum =
  | 'START'
  | 'STRUGGLING'
  | 'SYNTAX_ERRORS'
  | 'RUNTIME_ERRORS'
  | 'GOOD_PROGRESS'
  | 'ALMOST_THERE';

export const STUDIO_STATE_LABELS: Record<StudioStateEnum, string> = {
  START: 'Just started — has not edited or run anything yet',
  STRUGGLING: 'Completely lost — trying random things, no clear strategy',
  SYNTAX_ERRORS: 'Has syntax errors that prevent the code from running',
  RUNTIME_ERRORS: 'Code runs but crashes with a runtime error',
  GOOD_PROGRESS: 'Making solid progress but the solution is incomplete',
  ALMOST_THERE: 'Very close — one small issue away from correct',
};

export interface StudioStateData {
  studentCode: string;
  consoleOutput?: string;
  hasRun: boolean;
  hasEdited: boolean;
  validationResults?: string; // JSON string
}

// Key: `${levelId}_${StudioStateEnum}`
export const neighborhoodStudioData: Record<string, StudioStateData> = {
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
};
