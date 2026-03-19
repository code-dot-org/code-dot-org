/**
 * Representative test dataset for Python Neighborhood levels.
 *
 * Structured as three separate concerns:
 *   - templates: Mustache prompt templates for AI tutor
 *   - levelData: the level's configuration (scraped from real .level files)
 *   - studioData: studio/platform context (Painter API, neighborhood description)
 *
 * Usage example (with mustache):
 *   import Mustache from 'mustache';
 *   const ctx = buildContext(templates, levelData, studioData);
 *   const systemPrompt = Mustache.render(templates.systemPromptTemplate, ctx);
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MazeCell {
  tileType: number; // 0 = blocked/decoration, 1 = passable/empty
  value: number; // 0 = empty, 1-8 = paint bucket count
  assetId: number; // sprite ID (0=empty, 46=cone, 48=grass, 303=paint can, etc.)
}

export interface StartFile {
  id: string;
  name: string;
  language: 'py';
  contents: string;
  folderId: string;
  active: boolean;
  open: boolean;
  type?: 'locked_starter' | 'support' | 'validation';
}

export interface ValidationFile {
  id: string;
  name: string;
  language: 'py';
  contents: string;
  folderId: string;
  active: boolean;
  open: boolean;
  type: 'validation';
}

export interface LevelData {
  /** Source .level filename (for traceability) */
  sourceFile: string;
  /** Human-readable level title */
  displayName: string;
  /** Markdown instructions shown to the student */
  longInstructions: string;
  /** 8×8 grid of tiles; [row][col] */
  serializedMaze: MazeCell[][];
  /** Student-facing code files keyed by file id */
  startSources: Record<string, StartFile>;
  /** Optional auto-grading test file */
  validationFile?: ValidationFile;
  /** Whether the AI tutor feature is enabled for this level */
  aiTutorAvailable: boolean;
}

export interface PainterMethod {
  signature: string;
  description: string;
  example?: string;
}

export interface StudioData {
  /**
   * Human-readable name for this mini-app context.
   * Used in templates to describe the environment to the AI.
   */
  miniApp: 'neighborhood';
  /** Short blurb about what the Neighborhood is */
  environmentDescription: string;
  /** The Painter class API available to students */
  painterAPI: {
    constructor: PainterMethod;
    methods: PainterMethod[];
  };
  /** Valid color strings students can pass to paint() */
  validPaintColors: string[];
  /** Coordinate system explanation */
  coordinateSystem: string;
  /** Common error patterns seen in this environment */
  commonErrors: string[];
}

export interface Templates {
  /**
   * Top-level system prompt. References sub-templates via triple-mustache:
   *   {{{environmentContext}}}  → rendered from environmentContextTemplate
   *   {{{levelContext}}}        → rendered from levelContextTemplate
   *   {{{studentCodeContext}}}  → rendered from studentCodeContextTemplate
   */
  systemPromptTemplate: string;
  /** Renders the studio/Painter API context block */
  environmentContextTemplate: string;
  /** Renders the level's instructions and maze summary */
  levelContextTemplate: string;
  /** Renders the student's current code and any error */
  studentCodeContextTemplate: string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const templates: Templates = {
  systemPromptTemplate: `You are an AI tutor helping a middle school student learn Python programming through the Neighborhood coding environment. Target a 7th-grade reading level.

Use the Socratic method: guide the student toward the answer without giving it directly. Focus on the single most important issue. Respond with one clear, encouraging statement (not a question).

{{{environmentContext}}}

{{{levelContext}}}

{{{studentCodeContext}}}`,

  environmentContextTemplate: `## Environment: {{miniApp}}
{{environmentDescription}}

### Painter API
Constructor: \`{{painterAPI.constructor.signature}}\` — {{painterAPI.constructor.description}}

Methods:
{{#painterAPI.methods}}
- \`{{signature}}\`: {{description}}{{#example}} (e.g. \`{{example}}\`){{/example}}
{{/painterAPI.methods}}

Valid paint colors: {{#validPaintColors}}{{.}}, {{/validPaintColors}}

Coordinate system: {{coordinateSystem}}`,

  levelContextTemplate: `## Level: {{displayName}}

### Instructions given to student:
{{{longInstructions}}}

### Neighborhood grid (8×8, [row][col]):
The grid is laid out as rows from top (row 0) to bottom (row 7).
Notable cells:
{{#mazeHighlights}}
- Row {{row}}, Col {{col}}: {{description}}
{{/mazeHighlights}}`,

  studentCodeContextTemplate: `## Student's Current Code ({{fileName}}):
\`\`\`python
{{{code}}}
\`\`\`
{{#errorMessage}}
### Runtime Error:
\`\`\`
{{{errorMessage}}}
\`\`\`
{{/errorMessage}}
{{^errorMessage}}
(No runtime errors yet)
{{/errorMessage}}`,
};

// ---------------------------------------------------------------------------
// Studio Data
// ---------------------------------------------------------------------------

export const studioData: StudioData = {
  miniApp: 'neighborhood',

  environmentDescription:
    'The Neighborhood is a visual grid (8×8 tiles) where students write Python code to control a "Painter" character. The Painter can move around the grid, turn, paint tiles with colors, and interact with paint buckets. The Painter starts at position (0, 0) facing East (right) by default.',

  painterAPI: {
    constructor: {
      signature: 'Painter(x=0, y=0, direction="East", paint=0)',
      description:
        'Creates a new Painter at the given grid position, facing the given direction, with an optional initial paint supply.',
      example: "p = Painter(2, 3, 'South', 5)",
    },
    methods: [
      {
        signature: 'move()',
        description: 'Moves the Painter one tile in the direction it is facing.',
        example: 'p.move()',
      },
      {
        signature: 'turn_left()',
        description: 'Rotates the Painter 90° to the left (counter-clockwise).',
        example: 'p.turn_left()',
      },
      {
        signature: 'turn_right()',
        description: 'Rotates the Painter 90° to the right (clockwise).',
        example: 'p.turn_right()',
      },
      {
        signature: 'paint(color)',
        description: "Paints the current tile with the given color string. Requires the Painter to have paint (set_paint or is_on_bucket first).",
        example: "p.paint('Red')",
      },
      {
        signature: 'scrape_paint()',
        description: 'Removes the paint from the current tile.',
      },
      {
        signature: 'set_paint(amount)',
        description: 'Sets the Painter\'s paint supply to the given integer amount.',
        example: 'p.set_paint(8)',
      },
      {
        signature: 'get_my_paint()',
        description: "Returns the Painter's current paint supply as an integer.",
      },
      {
        signature: 'has_paint()',
        description: 'Returns True if the Painter has any paint remaining.',
      },
      {
        signature: 'is_on_bucket()',
        description: 'Returns True if the Painter is currently standing on a paint bucket tile.',
      },
      {
        signature: 'take_paint()',
        description: "Picks up paint from the bucket the Painter is standing on, adding it to the Painter's supply.",
      },
      {
        signature: 'can_move(direction=None)',
        description:
          'Returns True if the Painter can move in the given direction (or the direction it is facing if no argument). Blocked by obstacles and grid edges.',
        example: 'p.can_move("south")',
      },
      {
        signature: 'get_x()',
        description: 'Returns the Painter\'s current x (column) position.',
      },
      {
        signature: 'get_y()',
        description: 'Returns the Painter\'s current y (row) position.',
      },
    ],
  },

  validPaintColors: [
    'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White',
  ],

  coordinateSystem:
    'x increases left-to-right (columns 0–7), y increases top-to-bottom (rows 0–7). The Painter starts at (0,0), the top-left corner. Directions: "East" = right (+x), "West" = left (−x), "South" = down (+y), "North" = up (−y).',

  commonErrors: [
    'Calling move() into a blocked tile (cone, building) raises an error',
    'Calling move() off the edge of the grid raises an error',
    'Calling paint() when the Painter has no paint does nothing or raises an error',
    'Forgetting to import: `from neighborhood import Painter`',
    "Misspelling method names (e.g. turnLeft vs turn_left)",
    'Off-by-one errors when counting tiles to reach a target',
    'Incorrect direction after turning (losing track of which way the Painter faces)',
  ],
};

// ---------------------------------------------------------------------------
// Level Data — 4 representative examples
// ---------------------------------------------------------------------------

// Helper: empty cell
const E = (): MazeCell => ({tileType: 1, value: 0, assetId: 0});
// Helper: blocked decoration cell
const D = (assetId: number): MazeCell => ({tileType: 0, value: 0, assetId});
// Helper: paint bucket cell
const B = (paintCount: number): MazeCell => ({tileType: 1, value: paintCount, assetId: 303});

/**
 * Level 1: Simple navigation with cones
 * Source: jamila_pythonlab_neighborhood.level
 * Concept: Create a Painter, use move() and turn_left(), basic API intro
 */
export const levelSimpleNavigation: LevelData = {
  sourceFile: 'jamila_pythonlab_neighborhood.level',
  displayName: 'Explore the Neighborhood',
  aiTutorAvailable: false,
  longInstructions:
    '## Do This:\n1. Create a `Painter` object.\n2. Explore the Painter methods by calling `getX()`, `turnLeft()`, `paint()`, `scrapePaint()`, `move()`, `setPaint()`, and `getMyPaint()`.',

  serializedMaze: [
    // Row 0: paint bucket at (0,0)
    [{tileType: 1, value: 28, assetId: 303}, E(), E(), E(), E(), E(), E(), E()],
    // Row 1: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 2: cones at cols 1,3,5,7
    [E(), D(46), E(), D(46), E(), D(46), E(), D(46)],
    // Row 3: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 4: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 5: cones at cols 1,3,5,7
    [E(), D(46), E(), D(46), E(), D(46), E(), D(46)],
    // Row 6: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 7: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
  ],

  startSources: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'py',
      contents:
        'from neighborhood import Painter\n\np = Painter()\nprint(p.getX())\np.turnLeft()\np.paint(\'Blue\')\np.scrapePaint()\np.move()\np.setPaint(10)\nprint(p.getMyPaint())',
      folderId: '0',
      active: true,
      open: true,
    },
  },
};

/**
 * Level 2: Navigate around buildings to reach a cone
 * Source: programming-fundamentals-lesson5-level6b-aitutor-2023.level
 * Concept: Procedural navigation, planning a path, counting moves
 */
export const levelNavigateToCone: LevelData = {
  sourceFile: 'programming-fundamentals-lesson5-level6b-aitutor-2023.level',
  displayName: 'Practice Moving A to C',
  aiTutorAvailable: false,
  longInstructions:
    '## Do This:\n1. Create a `Painter` object.\n2. Add methods to move the `Painter` to the cone.\n\t- **Hint:** Use your pseudocode on the activity guide for Task 2: A to C.\n    \n---\n###AI Tutor Support\n\n::: details [**Not sure how to create and move a Painter?**]\nAsk AI: \n- How do I create a `Painter` object in Python?\n- Which method makes the Painter move forward?\n:::\n\n::: details [**Stuck on getting to the cone?**]\nAsk AI:\n- How do I move the Painter multiple steps?\n- How do I get the Painter to turn around?\n:::',

  serializedMaze: [
    // Row 0: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 1: buildings at cols 0-2, empty cols 3-7
    [D(10), D(8), D(6), E(), E(), E(), E(), E()],
    // Row 2: buildings at cols 0-2, passable at col 3, sidewalk at cols 4-7
    [D(11), D(9), D(7), E(), D(49), D(286), D(286), D(286)],
    // Row 3: empty, cone at col 1, empty, empty, grass/sidewalk at cols 4-7
    [E(), D(46), E(), E(), D(285), D(48), D(48), D(48)],
    // Row 4: empty x4, grass at cols 4-7
    [E(), E(), E(), E(), D(285), D(48), D(48), D(48)],
    // Row 5: buildings at cols 0-2, empty, grass at cols 4-7
    [D(24), D(22), D(20), E(), D(285), D(48), D(48), D(48)],
    // Row 6: buildings at cols 0-2, empty, sidewalk at cols 4-7
    [D(25), D(23), D(21), E(), D(52), D(283), D(283), D(283)],
    // Row 7: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
  ],

  startSources: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'py',
      contents:
        'from neighborhood import Painter\n#add the painter object below\n\n#add methods below to move the painter\n',
      folderId: '0',
      active: false,
      open: true,
      type: 'locked_starter',
    },
  },

  validationFile: {
    id: '2',
    name: 'main_test.py',
    language: 'py',
    contents: `import unittest
from unittest_runner import ValidationProtocol

class TestMoveToCone(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.neighborhood_log = ValidationProtocol().get_neighborhood_log()
        if cls.neighborhood_log.painter_logs:
            cls.painter_log = cls.neighborhood_log.painter_logs[0]
        else:
            cls.painter_log = None

    def test_create_painter_object(self):
        self.assertIsNotNone(
            self.painter_log,
            "We couldn't find a Painter object. Did you create one?"
        )

    def test_move_painter_to_cone(self):
        if self.painter_log is None:
            self.skipTest("No Painter object found.")
        self.assertTrue(
            self.painter_log.did_action_at_least("MOVE", 1),
            "It looks like your Painter never moved. Make sure to call the move() function."
        )
        final_position = self.painter_log.ending_position
        self.assertEqual(final_position.x, 2, "Your Painter didn't reach the cone.")
        self.assertEqual(final_position.y, 3, "Your Painter didn't reach the cone.")

if __name__ == '__main__':
    unittest.main()
`,
    folderId: '0',
    active: false,
    open: false,
    type: 'validation',
  },
};

/**
 * Level 3: Debug a conditional program
 * Source: test-intro-to-programming-lesson13-level6b-ai-tutor.level
 * Concept: Debugging, conditionals, user input, while loops
 */
export const levelDebugConditional: LevelData = {
  sourceFile: 'test-intro-to-programming-lesson13-level6b-ai-tutor.level',
  displayName: 'Debug Conditional Painter',
  aiTutorAvailable: true,
  longInstructions:
    "# Do This:\n\nHelp! There's something wrong with the program! It isn't doing exactly what it should be according to the algorithm flowchart below.\n1. Read through the flowchart to understand what the program should do.\n2. Run and test the program to debug the program so that it works as expected for all outcomes.\n\n---\n\n## AI Tutor Support:\n\n::: details [**Not sure why the program isn't following the flowchart?**]\n\n**Ask AI:**\n- If you're unsure why the Painter isn't painting the expected colors, use AI Tutor to analyze your program is using user input.\n- If you're having trouble making the Painter follow the flowchart logic, ask AI for debugging help.\n:::",

  serializedMaze: [
    // Row 0: all empty
    [E(), E(), E(), E(), E(), E(), E(), E()],
    // Row 1: buildings at cols 1-2 and 5-6
    [E(), D(12), D(13), E(), E(), D(43), D(42), E()],
    // Row 2: sidewalk/buildings
    [D(50), D(14), D(15), D(53), D(54), D(41), D(40), E()],
    // Row 3: buildings + sidewalk + fence
    [D(284), D(16), D(17), D(49), D(50), D(39), D(38), E()],
    // Row 4: buildings + grass
    [D(284), D(18), D(19), D(285), D(284), D(37), D(36), E()],
    // Row 5: wall + path
    [D(284), E(), E(), D(285), D(284), E(), E(), E()],
    // Row 6: fence/sidewalk
    [D(279), D(286), D(286), D(280), D(284), E(), E(), E()],
    // Row 7: grass border
    [D(48), D(48), D(48), D(48), D(284), E(), E(), E()],
  ],

  startSources: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'py',
      // Note: this code has a bug — the paint_line function ignores the color parameter
      contents: `from neighborhood import Painter

# Create Painter object
kellie = Painter()
kellie.set_paint(8)

# Function to paint a line based on movement conditions
# Parameter: color
def paint_line(color):
   if kellie.can_move("south"):
     kellie.paint("yellow")
     kellie.move()
   else:
     kellie.paint("pink")
     kellie.move()

# Get and store user input
color_choice = input("What color do you want to paint in front of the trucks? ")

# While painter has paint paint_line(color_choice)
while kellie.has_paint():
  paint_line(color_choice)
`,
      folderId: '0',
      active: true,
      open: true,
    },
  },
};

/**
 * Level 4: Collect paint from buckets and fill the grid using loops
 * Source: programming-fundamentals-lesson8-level6e-aitutor-2024.level
 * Concept: while loops, is_on_bucket(), can_move(), functions, decomposition
 */
export const levelLoopsAndPaint: LevelData = {
  sourceFile: 'programming-fundamentals-lesson8-level6e-aitutor-2024.level',
  displayName: 'Fill a Neighborhood Section',
  aiTutorAvailable: true,
  longInstructions:
    '## Do This\n1. In your `custom.py` file create four functions called `collect_paint`, `paint_a_row`, `move_to_next_row_right`, and `move_to_next_row_left`.\n2. `collect_paint` should use a `while painter.is_on_bucket` loop to collect all the paint from a bucket.\n3. `paint_a_row` should use a `while painter.can_move` loop, along with `paint()` and `move()` paint a straight line of a set length.\n4. `move_to_next_row_right` should use the `turn_right()` and `move()` methods to move the `Painter` down one row to begin painting again.\n    - Hint: Think about which direction the `Painter` will need to turn and move depending on whether it is on the far left or far right side of the grid.\n5. `move_to_next_row_left` should use the `turn_left()` and `move()` methods to move the `Painter` down one row to begin painting again.\n6. Use all three functions together to paint each row of The Neighborhood.\n\n**Reminder:** Make sure you import your `custom.py` file and save it to your backpack after adding any new functions!\n\n---\n\n## AI Tutor Support:\n\n::: details [**Not sure how to structure loops?**]\n\n**Ask AI:**\n- How do I make my `paint_a_row()` function stop at the end of the row?\n- How does `while painter.can_move():` help with painting a row?\n:::\n\n\n::: details [**Confused about turning at the end of a row?**]\n\n**Ask AI:**\n- How do I decide when to turn left or right to move to the next row?\n- How can I use `turn_right()` and `turn_left()` together to paint multiple rows?\n:::',

  // Paint buckets alternate between left and right edges
  // Even rows (0,2,4,6): bucket at col 0; Odd rows (1,3,5,7): bucket at col 7
  serializedMaze: [
    [B(8), E(), E(), E(), E(), E(), E(), E()],   // row 0
    [E(), E(), E(), E(), E(), E(), E(), B(8)],   // row 1
    [B(8), E(), E(), E(), E(), E(), E(), E()],   // row 2
    [E(), E(), E(), E(), E(), E(), E(), B(8)],   // row 3
    [B(8), E(), E(), E(), E(), E(), E(), E()],   // row 4
    [E(), E(), E(), E(), E(), E(), E(), B(8)],   // row 5
    [B(8), E(), E(), E(), E(), E(), E(), E()],   // row 6
    [E(), E(), E(), E(), E(), E(), E(), B(8)],   // row 7
  ],

  startSources: {
    '0': {
      id: '0',
      name: 'main.py',
      language: 'py',
      contents:
        'from neighborhood import Painter\n# ADD import custom BELOW\n\n\njohn = Painter()\n\n# ADD DEFINITIONS FOR YOUR FOUR NEW FUNCTIONS IN custom.py\n \n# Move through the Neighborhood using all three functions ',
      folderId: '0',
      active: false,
      open: true,
      type: 'locked_starter',
    },
  },

  validationFile: {
    id: '2',
    name: 'main_test.py',
    language: 'py',
    contents: `import unittest
from unittest_runner import ValidationProtocol

class TestRowPainting(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.log = ValidationProtocol().get_neighborhood_log()
        cls.painter_logs = cls.log.painter_logs if cls.log else []

    def test_step1_single_painter(self):
        self.assertEqual(len(self.painter_logs), 1,
            f"We expected exactly one Painter object, found {len(self.painter_logs)}.")

    def test_step2_collect_paint(self):
        if not self.painter_logs:
            self.skipTest("No Painter found.")
        self.assertTrue(self.painter_logs[0].did_action_at_least("IS_ON_BUCKET", 1),
            "It doesn't look like you used is_on_bucket(). Your collect_paint function should gather paint from a bucket.")

    def test_step3_paint_a_row(self):
        if not self.painter_logs:
            self.skipTest("No Painter found.")
        self.assertTrue(self.painter_logs[0].did_action_at_least("CAN_MOVE", 1),
            "We didn't see any can_move() calls. Your paint_a_row function should use can_move() to paint a line.")
        self.assertTrue(self.painter_logs[0].did_action_at_least("PAINT", 1),
            "We didn't see any paint actions. Make sure you're painting while moving along the row.")

    def test_step4_turn_left_for_next_row(self):
        if not self.painter_logs:
            self.skipTest("No Painter found.")
        self.assertTrue(self.painter_logs[0].did_action_at_least("TURN_LEFT", 1),
            "We expected at least one turn_left usage to move down a row on the left side.")

if __name__ == '__main__':
    unittest.main()
`,
    folderId: '0',
    active: false,
    open: false,
    type: 'validation',
  },
};

// ---------------------------------------------------------------------------
// Exported collection
// ---------------------------------------------------------------------------

export const neighborhoodLevels: LevelData[] = [
  levelSimpleNavigation,
  levelNavigateToCone,
  levelDebugConditional,
  levelLoopsAndPaint,
];

/**
 * Build the Mustache rendering context by merging level data, studio data,
 * and derived fields (mazeHighlights, etc.).
 *
 * @example
 * const ctx = buildContext(levelNavigateToCone, studioData);
 * const systemPrompt = Mustache.render(templates.systemPromptTemplate, ctx);
 */
export function buildContext(
  level: LevelData,
  studio: StudioData,
  studentCode?: string,
  errorMessage?: string
) {
  // Derive notable cells from the maze for the template
  const mazeHighlights: {row: number; col: number; description: string}[] = [];
  level.serializedMaze.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell.assetId === 46) {
        mazeHighlights.push({row: rowIdx, col: colIdx, description: 'Cone (obstacle/target)'});
      } else if (cell.assetId === 303) {
        mazeHighlights.push({row: rowIdx, col: colIdx, description: `Paint bucket (${cell.value} paint)`});
      } else if (cell.tileType === 0 && cell.assetId !== 0) {
        // Only log first few building tiles to keep it concise
        if (mazeHighlights.filter(h => h.description.startsWith('Building')).length < 4) {
          mazeHighlights.push({row: rowIdx, col: colIdx, description: `Building/decoration (sprite ${cell.assetId})`});
        }
      }
    });
  });

  const mainFile = Object.values(level.startSources).find(f => f.name === 'main.py');

  return {
    // Studio / environment context
    miniApp: studio.miniApp,
    environmentDescription: studio.environmentDescription,
    painterAPI: studio.painterAPI,
    validPaintColors: studio.validPaintColors,
    coordinateSystem: studio.coordinateSystem,

    // Level context
    displayName: level.displayName,
    longInstructions: level.longInstructions,
    mazeHighlights,

    // Student code context
    fileName: mainFile?.name ?? 'main.py',
    code: studentCode ?? mainFile?.contents ?? '',
    errorMessage: errorMessage ?? null,
  };
}
