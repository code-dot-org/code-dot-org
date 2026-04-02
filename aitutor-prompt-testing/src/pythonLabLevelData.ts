/**
 * Python Lab level metadata for published AIF U2 / standalone Python Lab units.
 *
 * Covers all neighborhood mini-app levels (and will expand to console/datascience).
 * unitId sourced from dashboard/config/scripts_json/
 * documentation sourced from dashboard/config/programming_classes/pythonlab/painter.json
 */
import {PythonLabLevelEntry} from './aiTutorTestTypes';

/** Serialized Painter class documentation from painter.json */
export const painterDocumentation = {"category_key": "neighborhood", "content": "## Meet the Painter\n\nThe `Painter` is a programmable object you can control with code. Think of it as a digital avatar or a cursor whose world is in a grid called the **Neighborhood**. Your code will serve as the instructions that direct the `Painter`'s every move.\n\nYou control the `Painter` by calling its methods, which are its built-in actions. The fundamental methods are:\n\n* `move()`: Moves the `Painter` one square forward in the direction it is facing.\n* `turn_left()`: Rotates the `Painter` 90 degrees to the left.\n* `paint()`: Applies color to the square the `Painter` is currently on.\n\nCombining these methods will allow you to solve puzzles, create complex digital patterns, and visualize how programming logic works in a tangible way.\n\nImport the `Painter` in Python Lab with `from neighborhood import Painter` ", "examples": "[]", "external_documentation": "", "fields": "[{\"name\":\"x_location\",\"type\":\"int\",\"description\":\"the x coordinate of the `Painter` object\"},{\"name\":\"y_location\",\"type\":\"int\",\"description\":\"the y coordinate of the `Painter` object\"},{\"name\":\"direction\",\"type\":\"str\",\"description\":\"the direction the `Painter` object is facing (`\\\"North\\\"`, `\\\"South\\\"`, `\\\"East\\\"`, or `\\\"West\\\"`)\"}]", "key": "painter", "name": "Painter", "syntax": "", "tips": "", "methods": [{"key": "painter", "position": 0, "name": "Painter", "content": "Creates a `Painter` object at `(0, 0)` facing `\"East\"` with `0` units of paint", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\n```\",\"image\":\"https://images.code.org/e4916207b91ecdd04443697eede4a5fb-default.png\"}]", "syntax": "", "external_link": null, "overload_of": null, "return_value": null}, {"key": "painter2", "position": 1, "name": "Painter(x, y, direction, paint)", "content": "Creates a `Painter` at specific x and y coordinates facing a specified direction with a given number of units of paint.", "parameters": "[{\"name\":\"x\",\"type\":\"int\",\"required\":false,\"description\":\"the x coordinate to place the `Painter` object\"},{\"name\":\"y\",\"type\":\"int\",\"description\":\"the y coordinate to place the `Painter` object\"},{\"name\":\"direction\",\"type\":\"str\",\"required\":false,\"description\":\"the direction for the `Painter` object to face\"},{\"name\":\"paint\",\"type\":\"int\",\"required\":false,\"description\":\"the number of units of paint the `Painter` object starts with\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\n```\",\"image\":\"https://images.code.org/1c32a72231bec7eeda7e082abb5298f7-parameterized.png\"}]", "syntax": null, "external_link": null, "overload_of": "painter", "return_value": null}, {"key": "move", "position": 2, "name": "move", "content": "Moves the `Painter` object one space forward in the direction it is facing.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.move()\\n```\",\"image\":\"https://images.code.org/54dfd250f1e30fa920e49e60c81a04b2-painter_move.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "turn-left", "position": 3, "name": "turn_left", "content": "Turns a `Painter` object to the left.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = new Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.move()\\nmy_painter.turn_left()\\n```\",\"image\":\"https://images.code.org/285693b2899683eeaa015837334f7355-painter_turnleft.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "paint", "position": 4, "name": "paint", "content": "Paints the space the `Painter` object is standing on.", "parameters": "[{\"name\":\"color\",\"type\":\"str\",\"required\":true,\"description\":\"the color of the paint - can be a hex color value or color name (CSS named color - case insensitive)\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n```\",\"image\":\"https://images.code.org/d66489311bf586df08f4b294621acc95-painter_paint.gif\"},{\"code\":\"![](https://images.code.org/b5f030c497b6f6f61470fc3ab6dd7538-newColorChart.png)\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "take-paint", "position": 5, "name": "take_paint", "content": "Takes paint from the paint bucket the `Painter` object is currently standing on and adds a single unit of paint to their paint bucket. The number of units of paint in the paint bucket decreases by `1`. If the `Painter` object is not on a paint bucket, nothing happens.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move()\\nmy_painter.take_paint()\\nmy_painter.move()\\n```\",\"image\":\"https://images.code.org/39e03713f0674462f0c07c3f4201326f-painter_takepaint.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "scrape-paint", "position": 6, "name": "scrape_paint", "content": "Removes the paint from the space the `Painter` object is standing on.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\n\\nmy_painter.paint(\\\"white\\\")\\nmy_painter.move()\\nmy_painter.paint(\\\"white\\\")\\n\\nmy_painter.turn_left()\\nmy_painter.turn_left()\\nmy_painter.move()\\n\\nmy_painter.scrape_paint()\\n```\\n\",\"image\":\"https://images.code.org/f188339711730bd441607e3ea4794d0f-painter_scrapepaint.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "can-move", "position": 7, "name": "can_move", "content": "Returns `true` if there is no barrier one space ahead in the direction the `Painter` object is currently facing.", "parameters": "[]", "examples": "[{\"name\":\"can_move() Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move()\\n\\nprint(\\\"Painter can move forward: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/7bb491d4ce769ee30fe6853d5ab64492-canmove.png)\\n\\nPainter can move forward: false\"},{\"name\":\"can_move() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move()\\n\\nprint(\\\"Painter can move forward: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/2b3e41e537a3a1f55b903788b922671e-canmove2.png)\\n\\nPainter can move forward: true\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "can-move2", "position": 8, "name": "can_move(direction)", "content": "Returns `true` if there is no barrier one space ahead in the specified direction.", "parameters": "[{\"name\":\"direction\",\"type\":\"str\",\"required\":true,\"description\":\"the direction to check\"}]", "examples": "[{\"name\":\"can_move(\\\"south\\\") Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move(\\\"south\\\")\\n\\nprint(\\\"Painter can move south: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/8a67f0c913a130dd5107748f522f71c9-canmovesouth.png)\\n\\nPainter can move south: false\"},{\"name\":\"can_move(\\\"south\\\") Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move(\\\"south\\\")\\n\\nprint(\\\"Painter can move south: \\\" + move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/20159154948642958952307badcf3e37-canmovesouth2.png)\\n\\nPainter can move south: true\"}]", "syntax": null, "external_link": null, "overload_of": "can-move", "return_value": null}, {"key": "is-on-paint", "position": 9, "name": "is_on_paint", "content": "Returns `true` if there is paint on the space the `Painter` object is currently standing on.", "parameters": "[]", "examples": "[{\"name\":\"is_on_paint() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n\\non_paint_status = my_painter.is_on_paint()\\n\\nprint(\\\"Painter is on paint: \\\", on_paint_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/0bc4fdebb564d6c814417e5ad6f64e85-isonpaint.png)\\n\\nPainter is on paint: true\"},{\"name\":\"is_on_paint() Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\nmy_painter.move()\\n\\non_paint_status = my_painter.is_on_paint()\\n\\nprint(\\\"Painter is on paint: \\\", on_paint_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/c04f1f99e73b2b6caf432d7b8b399e98-isonpaint2.png)\\n\\nPainter is on paint: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-on-bucket", "position": 10, "name": "is_on_bucket", "content": "Returns `true` if there is a paint bucket on the space the `Painter` object is currently standing on and the paint bucket has paint in it.", "parameters": "[]", "examples": "[{\"name\":\"is_on_bucket() Returns true\",\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move();\\n\\nstatus = my_painter.is_on_bucket()\\n\\nprint(\\\"Painter is on a paint bucket: \\\", status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/a275d22ba722ccd29816d2d9af6cc95d-isonbucket.png)\\n\\nPainter is on a paint bucket: true\"},{\"name\":\"is_on_bucket() Returns false\",\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move()\\nmy_painter.move()\\n\\nstatus = my_painter.is_on_bucket()\\n\\nprint(\\\"Painter is on a paint bucket: \\\", status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/923cc3f5982006a61b96f82e8625be9a-isonbucket2.png)\\n\\nPainter is on a paint bucket: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "has-paint", "position": 11, "name": "has_paint", "content": "Returns `true` if the `Painter` object has paint in their paint bucket.", "parameters": "[]", "examples": "[{\"name\":\"has_paint() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\n\\nresult = my_painter.has_paint()\\n\\nprint(\\\"Painter has paint: \\\", result)\\n```\\n\\n**Output**\\n\\nPainter has paint: true\"},{\"name\":\"has_paint() Returns false\",\"code\":\"```\\nmy_painter = Painter()\\n\\nresult = my_painter.has_paint()\\n\\nprint(\\\"Painter has paint: \\\", result)\\n```\\n\\n**Output**\\n\\nPainter has paint: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-north", "position": 12, "name": "is_facing_north", "content": "Returns `true` if the `Painter` object is currently facing `\"North\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/040dd0b55ad97a20c4344297fedd1e00-isfacingnorth.png)\\n\\n`is_facing_north()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-south", "position": 13, "name": "is_facing_south", "content": "Returns `true` if the `Painter` object is currently facing `\"South\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/b48d085f08d362d5941ae20fa3b5aea3-isfacingsouth.png)\\n\\n`is_facing_south()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-east", "position": 14, "name": "is_facing_east", "content": "Returns `true` if the `Painter` object is currently facing `\"East\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/182c1395dddaafb79c1e9ab27693094a-isfacingeast.png)\\n\\n`is_facing_east()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-west", "position": 15, "name": "is_facing_west", "content": "Returns `true` if the `Painter` object is currently facing `\"West\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/3621acb058214516d9b78c0008f4c0b0-isfacingwest.png)\\n\\n`is_facing_west()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-my-paint", "position": 16, "name": "get_my_paint", "content": "Returns the number of units of paint that the `Painter` object has in their paint bucket.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 10 units of paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-color", "position": 17, "name": "get_color", "content": "Returns the color of the space the `Painter` object is currently standing on.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n\\ncurrent_paint_color = my_painter.get_color()\\n\\nprint(\\\"Painter is standing on \\\" + current_paint_color + \\\" paint.\\\")\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/e5a7dcdb917c87d4d083798ca185f1cb-isonpaint.png)\\n\\nPainter is standing on white paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-x", "position": 18, "name": "get_x", "content": "Returns the x coordinate for the current position of the `Painter` object.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_x_location = my_painter.get_x()\\nprint(\\\"Painter is at x location \\\", current_x_location)\\n```\\n\\n**Output**\\n\\nPainter is at x location 2\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-y", "position": 19, "name": "get_y", "content": "Returns the y coordinate for the current position of the `Painter` object.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_y_location = my_painter.get_y()\\nprint(\\\"Painter is at y location \\\", current_y_location)\\n```\\n\\n**Output**\\n\\nPainter is at y location 4\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-direction", "position": 20, "name": "get_direction", "content": "Returns the direction that the `Painter` object is currently facing.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_direction = my_painter.get_direction();\\nprint(\\\"Painter is facing \\\" + current_direction)\\n```\\n\\n**Output**\\n\\nPainter is facing north\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "set-paint", "position": 21, "name": "set_paint", "content": "Sets the number of units of paint in the `Painter` object's paint bucket. If the value passed is a negative number, nothing happens.", "parameters": "[{\"name\":\"paint\",\"type\":\"int\",\"required\":true,\"description\":\"the number of units of paint that should be in the `Painter` object's paint bucket\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 0 units of paint.\\n\\n```\\nmy_painter.set_paint(10)\\n\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 10 units of paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}]} as const;

export const pythonLabLevelData: Record<string, PythonLabLevelEntry> = {
  "programming-fundamentals-lesson11-level1_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Add your code to the workspace. 
    - Hint: Remember to use the \`set_paint()\` method to give your \`Painter\` a specific amount of paint.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!

- *Don't have it, or it doesn't work? That's ok! Copy the code from* <a href="https://studio.code.org/projects/pythonlab/lEeO0M85P_A_B2Jcx0d2yC2yibkCG10AF_gD4ioh5Ws/view" target="_blank">***here***</a> *and paste it into a new file in your project.*

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to remind yourself how the \`Painter\` object and methods work.
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson11-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Add your code to the workspace. 
    - Hint: Remember to use the \`set_paint()\` method to give your \`Painter\` a specific amount of paint.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson11-level1_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Add your code to the workspace. 
    - Hint: Remember to use the \`set_paint()\` method to give your \`Painter\` a specific amount of paint.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!

- *Don't have it, or it doesn't work? That's ok! Copy the code from* <a href="https://studio.code.org/projects/pythonlab/lEeO0M85P_A_B2Jcx0d2yC2yibkCG10AF_gD4ioh5Ws/view" target="_blank">***here***</a> *and paste it into a new file in your project.*

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to remind yourself how the \`Painter\` object and methods work.
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson11-level1_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Add your code to the workspace. 
    - Hint: Remember to use the \`set_paint()\` method to give your \`Painter\` a specific amount of paint.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!

- *Don't have it, or it doesn't work? That's ok! Copy the code from* <a href="https://studio.code.org/projects/pythonlab/lEeO0M85P_A_B2Jcx0d2yC2yibkCG10AF_gD4ioh5Ws/view" target="_blank">***here***</a> *and paste it into a new file in your project.*

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to remind yourself how the \`Painter\` object and methods work.
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level1_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `What do you think this program will do when it runs?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level1_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `What do you think this program will do when it runs?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level1_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `What do you think this program will do when it runs?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `# Predict and Run

**What do you think this program does?**

Take a look at the code in this program. Write down what you think this program will do. There are no wrong answers!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },


  "programming-fundamentals-lesson12-level4_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

The \`Painter\` is trying to follow a winding path, but something's off! The \`Painter\` turns left *no matter what*, even when the \`Painter\` is supposed to move forward.

1. Look at the \`move_or_turn()\` function in \`custom.py\`.

   * It checks if the \`Painter\` can move. If so, the \`Painter\` moves forward.
   
   * But right now, the \`Painter\` *always* turns left, *even when moving forward*, which causes problems!
   
2. Find and fix the bug by adding an \`else\` statement so the \`Painter\` only turns left when it can't move forward.

&nbsp;

![](https://images.code.org/62b990764f2a161d41522ea3d621a0d8-image-1745168571995.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

If both the \`if\` and the following line run every time, it's not really a choice! Use \`else\` to make sure **only one** action happens each time the function runs.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level4_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

The \`Painter\` is trying to follow a winding path, but something's off! The \`Painter\` turns left *no matter what*, even when the \`Painter\` is supposed to move forward.

1. Look at the \`move_or_turn()\` function in \`custom.py\`.

   * It checks if the \`Painter\` can move. If so, the \`Painter\` moves forward.
   
   * But right now, the \`Painter\` *always* turns left, *even when moving forward*, which causes problems!
   
2. Find and fix the bug by adding an \`else\` statement so the \`Painter\` only turns left when it can't move forward.

&nbsp;

![](https://images.code.org/62b990764f2a161d41522ea3d621a0d8-image-1745168571995.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

If both the \`if\` and the following line run every time, it's not really a choice! Use \`else\` to make sure **only one** action happens each time the function runs.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level4_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

The \`Painter\` is trying to follow a winding path, but something's off! The \`Painter\` turns left *no matter what*, even when the \`Painter\` is supposed to move forward.

1. Look at the \`move_or_turn()\` function in \`custom.py\`.

   * It checks if the \`Painter\` can move. If so, the \`Painter\` moves forward.
   
   * But right now, the \`Painter\` *always* turns left, *even when moving forward*, which causes problems!
   
2. Find and fix the bug by adding an \`else\` statement so the \`Painter\` only turns left when it can't move forward.

&nbsp;

![](https://images.code.org/62b990764f2a161d41522ea3d621a0d8-image-1745168571995.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

If both the \`if\` and the following line run every time, it's not really a choice! Use \`else\` to make sure **only one** action happens each time the function runs.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level4_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run your code and discuss the outcome. 
   - *Discuss: What error occurred when running this code?*
    - *Tip: Debug by reading the error message.*
2. Turn the current \`if/else\` statement into a *nested* condtional.
   - Add an \`if\` statement to check if the Painter can move *before* the current \`if/else\` statement that is checking user input. 
   - Run your code to make sure the error doesn't occur anymore.
3. *Discuss: There's no more error message, so why does the \`Painter\`* ***still*** *not do anything?*
    - *Discuss: What is the \`Painter\` supposed to do if it can't move?*
    - *Tip: Since your \`Painter\` hasn't been able to paint anything, your code is in an infinite while loop ... press "Stop" to be able to modify your program in the next step.*
4. Add the \`else\` statement to move the \`Painter\` to a spot where they *can* move and plant with no obstacles.
   - *Tip: Make sure your indentation in correct for your \`if jordan.can_move() / else\` conditional and the nested \`if what_to_plant / else\` conditional.*
5. Run and test your code again to make sure the \`Painter\` can plant something.
 `,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level1_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `What do you think the \`Painter\` will do when the code is run?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level1_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `What do you think the \`Painter\` will do when the code is run?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level1_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `What do you think the \`Painter\` will do when the code is run?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level2_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Create a \`Painter\` using

   \`\`\`
   painter_name = Painter()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia = Painter()
   \`\`\`

&nbsp;

2. Move the \`Painter\` forward **one space** using

   \`\`\`
   painter_name.move()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia.move()
   \`\`\`
   <i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Click the book icon above the workspace to learn more about the \`Painter\` object and \`move()\` method in the Python documentation.
   
   ![python documentation book icon](https://images.code.org/901506f120f08a705ac5c65077f31e2b-image-1746033222447.12.23 AM.png)
---
 
---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can name the \`Painter\` whatever you want! Give it a name that is meaningful to you, like your own name, your best friend's name, your pet's name, or the name of someone you look up to.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level2_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Create a \`Painter\` using

   \`\`\`
   painter_name = Painter()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia = Painter()
   \`\`\`

&nbsp;

2. Move the \`Painter\` forward **one space** using

   \`\`\`
   painter_name.move()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia.move()
   \`\`\`
   <i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Click the book icon above the workspace to learn more about the \`Painter\` object and \`move()\` method in the Python documentation.
   
   ![python documentation book icon](https://images.code.org/901506f120f08a705ac5c65077f31e2b-image-1746033222447.12.23 AM.png)
---
 
---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can name the \`Painter\` whatever you want! Give it a name that is meaningful to you, like your own name, your best friend's name, your pet's name, or the name of someone you look up to.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level2_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Create a \`Painter\` using

   \`\`\`
   painter_name = Painter()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia = Painter()
   \`\`\`

&nbsp;

2. Move the \`Painter\` forward **one space** using

   \`\`\`
   painter_name.move()
   \`\`\`
   
   For example:
   
   \`\`\`
   alicia.move()
   \`\`\`
   <i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Click the book icon above the workspace to learn more about the \`Painter\` object and \`move()\` method in the Python documentation.
   
   ![python documentation book icon](https://images.code.org/901506f120f08a705ac5c65077f31e2b-image-1746033222447.12.23 AM.png)
---
 
---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can name the \`Painter\` whatever you want! Give it a name that is meaningful to you, like your own name, your best friend's name, your pet's name, or the name of someone you look up to.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This: 
1. Click on \`painter.py\` to look at the contents of the file.
2. Look at lines 4-7 to determine the default values given to a Painter object.
    - **Discuss:** What X and Y position do you expect the Painter to start at?
    - Which direction will it face?
    - How much paint will it have?
3. Take a look at the 4 methods shown: \`move()\`, \`turn_left()\`, \`paint\`, and \`take_paint\`. 
    - **Discuss:** What do you think each one does?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },


  "programming-fundamentals-lesson5-level7a_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

Hmmm . . . there are some issues with this code that's preventing the \`Painter\` from getting to the other end of The Neighborhood. Find and fix the bugs!

![](https://images.code.org/fb9b77e97ce9d69299230a1cf6f44f10-image-1744678546469.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level7a_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

Hmmm . . . there are some issues with this code that's preventing the \`Painter\` from getting to the other end of The Neighborhood. Find and fix the bugs!

![](https://images.code.org/fb9b77e97ce9d69299230a1cf6f44f10-image-1744678546469.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level7a_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

Hmmm . . . there are some issues with this code that's preventing the \`Painter\` from getting to the other end of The Neighborhood. Find and fix the bugs!

![](https://images.code.org/fb9b77e97ce9d69299230a1cf6f44f10-image-1744678546469.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level8_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to stop in front of the traffic cone, but it stopped next to it instead. Maybe the instructions got mixed up?

![](https://images.code.org/b2fe0af49dd0a8390420848dc2687ec6-image-1744677255860.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level8_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to stop in front of the traffic cone, but it stopped next to it instead. Maybe the instructions got mixed up?

![](https://images.code.org/b2fe0af49dd0a8390420848dc2687ec6-image-1744677255860.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level8_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to stop in front of the traffic cone, but it stopped next to it instead. Maybe the instructions got mixed up?

![](https://images.code.org/b2fe0af49dd0a8390420848dc2687ec6-image-1744677255860.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },








  "programming-fundamentals-lesson7-level9_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

The \`Painter\` has been asked to help repaint the street outside the school. You planned ahead by storing helper functions in \`custom.py\` -- one to take paint and one to paint the street - but something isn't working.

1. Look at the bottom of \`main.py\`. You'll see a call to \`paint_spaces()\` . . . but that function doesn't exist in \`custom.py\`!

2. Right now, the function paints twice before moving — that's not what we want! Change the order so the \`Painter\` paints, moves, paints again, and repeats until three spaces are painted.

&nbsp;

![](https://images.code.org/78cf07363ea224785d4b59690a4cc85e-image-1744815714223.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level9_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

The \`Painter\` has been asked to help repaint the street outside the school. You planned ahead by storing helper functions in \`custom.py\` -- one to take paint and one to paint the street - but something isn't working.

1. Look at the bottom of \`main.py\`. You'll see a call to \`paint_spaces()\` . . . but that function doesn't exist in \`custom.py\`!

2. Right now, the function paints twice before moving — that's not what we want! Change the order so the \`Painter\` paints, moves, paints again, and repeats until three spaces are painted.

&nbsp;

![](https://images.code.org/78cf07363ea224785d4b59690a4cc85e-image-1744815714223.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level9_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

The \`Painter\` has been asked to help repaint the street outside the school. You planned ahead by storing helper functions in \`custom.py\` -- one to take paint and one to paint the street - but something isn't working.

1. Look at the bottom of \`main.py\`. You'll see a call to \`paint_spaces()\` . . . but that function doesn't exist in \`custom.py\`!

2. Right now, the function paints twice before moving — that's not what we want! Change the order so the \`Painter\` paints, moves, paints again, and repeats until three spaces are painted.

&nbsp;

![](https://images.code.org/78cf07363ea224785d4b59690a4cc85e-image-1744815714223.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level1_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Replace the repeated \`move()\` commands with a \`while\` loop.

2. Use \`painter_name.can_move()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`can_move()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` reaches a wall or obstacle using

\`\`\`
while painter_name.can_move():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level1_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Replace the repeated \`move()\` commands with a \`while\` loop.

2. Use \`painter_name.can_move()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`can_move()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` reaches a wall or obstacle using

\`\`\`
while painter_name.can_move():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level1_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Replace the repeated \`move()\` commands with a \`while\` loop.

2. Use \`painter_name.can_move()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`can_move()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` reaches a wall or obstacle using

\`\`\`
while painter_name.can_move():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `# Predict and Run

**What do you think this program does?**

Take a look at the code in this program. Write down what you think this program will do. There are no wrong answers!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level2_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.has_paint()\` as the loop condition.


<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`has_paint()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is out of paint using:

\`\`\`
while painter_name.has_paint():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level2_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.has_paint()\` as the loop condition.


<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`has_paint()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is out of paint using:

\`\`\`
while painter_name.has_paint():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level2_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.has_paint()\` as the loop condition.


<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`has_paint()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is out of paint using:

\`\`\`
while painter_name.has_paint():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. Run your code and observe the outcome.
    - *Discuss: How do the \`while\` loops simplify your code?*
2. Add a comment on line 9 to explain what the \`while\` loop does.
3. Comment out lines 9-12 and uncomment the second section, lines 10-15. Run the code and observe how it performs the same task.
    - *Discuss: How does using the \`move_and_paint()\` function simplify your code?*
4. Add a \`painter.turn_right()\` method after the \`move_and_paint()\` function call. Then call the \`move_and_paint()\` function a second time.
    - *Hint: You'll need a \`turn_right\` function.*
    - *Discuss: *What happens when you reuse the \`move_and_paint\` function after making the \`Painter\` turn?*
 `,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level3_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.is_on_bucket()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`is_on_bucket()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is no longer standing on a paint bucket using:

\`\`\`
while painter_name.is_on_bucket():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level3_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.is_on_bucket()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`is_on_bucket()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is no longer standing on a paint bucket using:

\`\`\`
while painter_name.is_on_bucket():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level3_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.is_on_bucket()\` as the loop condition.

<br/>

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to learn more about the \`is_on_bucket()\`.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is no longer standing on a paint bucket using:

\`\`\`
while painter_name.is_on_bucket():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. Run your code and observe the outcome.
2. Rename the \`collect_paint()\` function to \`collect_and_move()\`. Add a call to \`painter.move()\` after the \`while\` loop is done executing.
3. Call \`collect_and_move()\` multiple times to test the updated behavior. Run your code and observe the outcome.
4. *Discuss*: 
    - How is the \`while painter.is_on_bucket()\` loop useful?
    - Why is it useful to use the function \`collect_and_move()\` instead of writing the loop directly each time?
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level4_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to move and paint while it still has paint, but something isn't working. Help fix the code so it runs correctly.

&nbsp;

![](https://images.code.org/fde9632335bf10f4c48f2f65a0c4758c-image-1744861268117.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

In Python, all the code you want to repeat must be indented under the \`while\` statement. If it's not indented, it won't run as part of the loop!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level4_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to move and paint while it still has paint, but something isn't working. Help fix the code so it runs correctly.

&nbsp;

![](https://images.code.org/fde9632335bf10f4c48f2f65a0c4758c-image-1744861268117.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

In Python, all the code you want to repeat must be indented under the \`while\` statement. If it's not indented, it won't run as part of the loop!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level4_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to move and paint while it still has paint, but something isn't working. Help fix the code so it runs correctly.

&nbsp;

![](https://images.code.org/fde9632335bf10f4c48f2f65a0c4758c-image-1744861268117.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

In Python, all the code you want to repeat must be indented under the \`while\` statement. If it's not indented, it won't run as part of the loop!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level4_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run your code and observe the outcome.
2. *Discuss: How could a \`while\` loop with \`painter.has_paint()\` be used in this function to remove repetitive lines of code?*
3. Modify the code by adding a \`while\` loop. Then click Run to test your code.
4. *Discuss: What do you think will happen when \`paint_line\` is run and the \`Painter\` runs out of paint or reaches an obstacle?*
5. Reverse the order of the actions inside the loop to make the \`Painter\` **move first** and then paint. Run your code and observe the \`Painter\`'s behavior.
    
**Optional Extension:** After the loop, have the \`Painter\` perform a single action, such as turning or moving, to prepare for a new task.
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level5_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to paint a path to the taxi, but it's not working! Figure out why the \`Painter\` is not painting and fix the code so it paints while it has paint.

&nbsp;

![](https://images.code.org/919ee91f65fc96fa6b85ff42f9d2fd03-image-1744861774383.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

A \`while\` loop only runs if the condition is true at the beginning. If it's false right away, the loop is skipped completely.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level5_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to paint a path to the taxi, but it's not working! Figure out why the \`Painter\` is not painting and fix the code so it paints while it has paint.

&nbsp;

![](https://images.code.org/919ee91f65fc96fa6b85ff42f9d2fd03-image-1744861774383.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

A \`while\` loop only runs if the condition is true at the beginning. If it's false right away, the loop is skipped completely.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level5_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

The \`Painter\` is supposed to paint a path to the taxi, but it's not working! Figure out why the \`Painter\` is not painting and fix the code so it paints while it has paint.

&nbsp;

![](https://images.code.org/919ee91f65fc96fa6b85ff42f9d2fd03-image-1744861774383.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

A \`while\` loop only runs if the condition is true at the beginning. If it's false right away, the loop is skipped completely.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level8a_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

Let's take this one step at a time! Click the arrow to expand the step when you're ready.

:::details [<span style="font-size:1.3em;">1. Import <code>custom.py</code> from your Backpack</span>]
Import \`custom.py\` into your project so you can use the functions you've written already -- and add new functions too!

   <details style="margin-left:1.5em;">
   		<summary>How do I import from my Backpack?</summary>
        <img src="https://images.code.org/4179baede41d67d2a0eb6a4e58209428-image-1744826414428.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">2. Define the <code>take\\_all\\_paint()</code> function</span>]
In \`custom.py\`, define the \`take_all_paint(this_painter)\` function to make the \`Painter\` \`take_paint()\` from the paint bucket while it \`is_on_bucket()\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">3. Save <code>custom.py</code> to your Backpack</span>]
Save \`custom.py\` to your **Backpack** so you can reuse your new functions later!

   <details>
   		<summary>How do I save files to my Backpack?</summary>
        <img src="https://images.code.org/5d21b631aa68d348a70dec9024a8f086-image-1744817649137.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">4. Import your functions</span>]
In \`main.py\`, import your functions using this format:

\`\`\`
from custom import function_name, function_name, function_name
\`\`\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">5. Use your new function to take all the paint from the paint bucket</span>]
In your main program, use your new function to take the paint from the paint bucket.

&nbsp;
:::

<span></span>

![](https://images.code.org/efc0a3d02b7f4c0aeb105349bd68739f-takepaint.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level8a_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

Let's take this one step at a time! Click the arrow to expand the step when you're ready.

:::details [<span style="font-size:1.3em;">1. Import <code>custom.py</code> from your Backpack</span>]
Import \`custom.py\` into your project so you can use the functions you've written already -- and add new functions too!

   <details style="margin-left:1.5em;">
   		<summary>How do I import from my Backpack?</summary>
        <img src="https://images.code.org/4179baede41d67d2a0eb6a4e58209428-image-1744826414428.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">2. Define the <code>take\\_all\\_paint()</code> function</span>]
In \`custom.py\`, define the \`take_all_paint(this_painter)\` function to make the \`Painter\` \`take_paint()\` from the paint bucket while it \`is_on_bucket()\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">3. Save <code>custom.py</code> to your Backpack</span>]
Save \`custom.py\` to your **Backpack** so you can reuse your new functions later!

   <details>
   		<summary>How do I save files to my Backpack?</summary>
        <img src="https://images.code.org/5d21b631aa68d348a70dec9024a8f086-image-1744817649137.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">4. Import your functions</span>]
In \`main.py\`, import your functions using this format:

\`\`\`
from custom import function_name, function_name, function_name
\`\`\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">5. Use your new function to take all the paint from the paint bucket</span>]
In your main program, use your new function to take the paint from the paint bucket.

&nbsp;
:::

<span></span>

![](https://images.code.org/efc0a3d02b7f4c0aeb105349bd68739f-takepaint.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level8a_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

Let's take this one step at a time! Click the arrow to expand the step when you're ready.

:::details [<span style="font-size:1.3em;">1. Import <code>custom.py</code> from your Backpack</span>]
Import \`custom.py\` into your project so you can use the functions you've written already -- and add new functions too!

   <details style="margin-left:1.5em;">
   		<summary>How do I import from my Backpack?</summary>
        <img src="https://images.code.org/4179baede41d67d2a0eb6a4e58209428-image-1744826414428.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">2. Define the <code>take\\_all\\_paint()</code> function</span>]
In \`custom.py\`, define the \`take_all_paint(this_painter)\` function to make the \`Painter\` \`take_paint()\` from the paint bucket while it \`is_on_bucket()\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">3. Save <code>custom.py</code> to your Backpack</span>]
Save \`custom.py\` to your **Backpack** so you can reuse your new functions later!

   <details>
   		<summary>How do I save files to my Backpack?</summary>
        <img src="https://images.code.org/5d21b631aa68d348a70dec9024a8f086-image-1744817649137.png" />
   </details>

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">4. Import your functions</span>]
In \`main.py\`, import your functions using this format:

\`\`\`
from custom import function_name, function_name, function_name
\`\`\`

&nbsp;
:::

<span></span>

:::details [<span style="font-size:1.3em;">5. Use your new function to take all the paint from the paint bucket</span>]
In your main program, use your new function to take the paint from the paint bucket.

&nbsp;
:::

<span></span>

![](https://images.code.org/efc0a3d02b7f4c0aeb105349bd68739f-takepaint.gif)`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level1_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Read the existing code to see what the \`Painter\` currently does.

2. Add an \`if\` statement to check if the \`Painter\` \`is_facing_west()\`

3. Move the \`paint("blue")\`command inside the \`if\` statement so it only runs when the condition is true.

4. Run the program to check your result.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

For this problem, your condition will be \`is_facing_west()\`

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level1_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Read the existing code to see what the \`Painter\` currently does.

2. Add an \`if\` statement to check if the \`Painter\` \`is_facing_west()\`

3. Move the \`paint("blue")\`command inside the \`if\` statement so it only runs when the condition is true.

4. Run the program to check your result.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

For this problem, your condition will be \`is_facing_west()\`

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level1_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Read the existing code to see what the \`Painter\` currently does.

2. Add an \`if\` statement to check if the \`Painter\` \`is_facing_west()\`

3. Move the \`paint("blue")\`command inside the \`if\` statement so it only runs when the condition is true.

4. Run the program to check your result.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

For this problem, your condition will be \`is_facing_west()\`

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. **Run the code without making any changes.** Observe what happens.
2. Comment out the two conditional statements (lines 11-17) and uncomment the \`move_if_can()\` function on lines 20-26. Then click Run.
3. *Discuss: What do you think will happen when you call the function with a \`north\` argument? What will the \`Painter\` do? Give it a try!*
4. Call the function with different directions as the argument (e.g. \`move_if_can("west")\`, \`move_if_can("east")\`, etc).
- *Discuss:*
	- How does the function simplify controlling the \`Painter\`’s movement?
	- Why does the \`Painter\` skip moving if the condition is \`False\`?
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  "programming-fundamentals-lesson9-level2a_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Read the existing code -- notice that the \`Painter\` doesn't turn when it should.

2. Modify the \`if\` statement that checks whether the \`Painter\` \`can_move("south")\`

3. Run the program to see if the \`Painter\` turns right through the opening in the wall.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level2a_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Read the existing code -- notice that the \`Painter\` doesn't turn when it should.

2. Modify the \`if\` statement that checks whether the \`Painter\` \`can_move("south")\`

3. Run the program to see if the \`Painter\` turns right through the opening in the wall.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level2a_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Read the existing code -- notice that the \`Painter\` doesn't turn when it should.

2. Modify the \`if\` statement that checks whether the \`Painter\` \`can_move("south")\`

3. Run the program to see if the \`Painter\` turns right through the opening in the wall.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level3_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Review the existing code -- it sets up a \`Painter\` and performs a series of actions.

2. At the bottom, write an \`if\` statement that checks if the \`Painter\` \`is_on_paint()\`

   * If the condition is true, the \`Painter\` should \`turn_right()\` and \`move()\`
   
3. Run the program and observe whether the \`Painter\` moves only when it is on paint.

&nbsp;

![](https://images.code.org/ac3c2976bccac2a5c9d65b0d7b39868b-image-1745027474432.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

Remember to indent both actions under the \`if\`!

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level3_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Review the existing code -- it sets up a \`Painter\` and performs a series of actions.

2. At the bottom, write an \`if\` statement that checks if the \`Painter\` \`is_on_paint()\`

   * If the condition is true, the \`Painter\` should \`turn_right()\` and \`move()\`
   
3. Run the program and observe whether the \`Painter\` moves only when it is on paint.

&nbsp;

![](https://images.code.org/ac3c2976bccac2a5c9d65b0d7b39868b-image-1745027474432.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

Remember to indent both actions under the \`if\`!

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level3_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Review the existing code -- it sets up a \`Painter\` and performs a series of actions.

2. At the bottom, write an \`if\` statement that checks if the \`Painter\` \`is_on_paint()\`

   * If the condition is true, the \`Painter\` should \`turn_right()\` and \`move()\`
   
3. Run the program and observe whether the \`Painter\` moves only when it is on paint.

&nbsp;

![](https://images.code.org/ac3c2976bccac2a5c9d65b0d7b39868b-image-1745027474432.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use this format for writing an \`if\` statement:

\`\`\`
if condition:
   do_something()
\`\`\`

Remember to indent both actions under the \`if\`!

<br/>`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. **Run and Discuss:**
   - What happens when the \`Painter\` moves?
   - Does the \`Painter\` paint along all sides of the sidewalk like the image below?
   - What seems to be missing?
2. The function \`move_and_paint_if_facing()\` is not complete:
   - Add the missing \`if\` statements so the \`Painter\` paints in all four directions.
   - Test your code. Click Run to make sure you don't have any errors.
3. The function \`move_and_paint_if_facing()\` needs to be called more times in order for the \`Painter\` to paint in all four directions.  
    - Add the missing \`while\` loops at the bottom so the \`Painter\` moves around the entire sidewalk.
   - Test your changes by running the program after each addition.
4. *Discuss: What would happen if the \`if\` statements were in a different order? Would the program behave the same way? Why or why not?*
   - What would happen if the \`Painter\` checked for \`is_facing_south()\` before checking \`is_facing_east()\`? 
   - Could the \`Painter\` ever skip an \`if\` statement?

<img src="https://images.code.org/7d7ddded9e3a7a19bd1c191feb4dd975-conditionalsL3.png" style="width:200px"> `,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  "programming-fundamentals-lesson9-level6_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Read the code in both \`main.py\` and \`custom.py\`

2. Identify and fix the bugs. Look for issues with indentation, condition placement, and syntax.

3. Make sure the \`Painter\` only paints when it has paint, and only moves south if it can.

&nbsp;

![](https://images.code.org/00dccf64eb36a7931327f30ff6cef04f-image-1745029422554.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use \`while\` to repeat actions and be sure your \`if\` statements only run when the condition is true. Every \`if\` and \`while\` needs a colon and an indented block.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level6_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Read the code in both \`main.py\` and \`custom.py\`

2. Identify and fix the bugs. Look for issues with indentation, condition placement, and syntax.

3. Make sure the \`Painter\` only paints when it has paint, and only moves south if it can.

&nbsp;

![](https://images.code.org/00dccf64eb36a7931327f30ff6cef04f-image-1745029422554.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use \`while\` to repeat actions and be sure your \`if\` statements only run when the condition is true. Every \`if\` and \`while\` needs a colon and an indented block.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson9-level6_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Read the code in both \`main.py\` and \`custom.py\`

2. Identify and fix the bugs. Look for issues with indentation, condition placement, and syntax.

3. Make sure the \`Painter\` only paints when it has paint, and only moves south if it can.

&nbsp;

![](https://images.code.org/00dccf64eb36a7931327f30ff6cef04f-image-1745029422554.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use \`while\` to repeat actions and be sure your \`if\` statements only run when the condition is true. Every \`if\` and \`while\` needs a colon and an indented block.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // ─── Previously missing levels ───────────────────────────────────────────────
  // lesson5-level5: create a missing Painter so the existing code works

  "programming-fundamentals-lesson5-level5_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `A \`Painter\` has been given instructions to move and turn, but the \`Painter\` hasn't yet been created! Fix the program by creating another \`Painter\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level5_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `A \`Painter\` has been given instructions to move and turn, but the \`Painter\` hasn't yet been created! Fix the program by creating another \`Painter\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level5_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `A \`Painter\` has been given instructions to move and turn, but the \`Painter\` hasn't yet been created! Fix the program by creating another \`Painter\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level5_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `A \`Painter\` has been given instructions to move and turn, but the \`Painter\` hasn't yet been created! Fix the program by creating another \`Painter\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson5-level6: add typed variables and update print statements

  "programming-fundamentals-lesson5-level6_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:
1. Add 4 new variables, one for each type:
    - **String** (text)
    - **Integer** (whole number)
    - **Boolean** (\`True\` or \`False\`)
    - **Float** (decimal number)
2. Modify the \`print\` statements so that they print out each variable.
\t- *Hint: What do you need to add to your code when printing out a string?*`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level6_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:
1. Add 4 new variables, one for each type:
    - **String** (text)
    - **Integer** (whole number)
    - **Boolean** (\`True\` or \`False\`)
    - **Float** (decimal number)
2. Modify the \`print\` statements so that they print out each variable.
\t- *Hint: What do you need to add to your code when printing out a string?*`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level6_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:
1. Add 4 new variables, one for each type:
    - **String** (text)
    - **Integer** (whole number)
    - **Boolean** (\`True\` or \`False\`)
    - **Float** (decimal number)
2. Modify the \`print\` statements so that they print out each variable.
\t- *Hint: What do you need to add to your code when printing out a string?*`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level6_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. Add 4 new variables, one for each type:
    - **String** (text)
    - **Integer** (whole number)
    - **Boolean** (\`True\` or \`False\`)
    - **Float** (decimal number)
2. Modify the \`print\` statements so that they print out each variable.
\t- *Hint: What do you need to add to your code when printing out a string?*`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson5-level9: free-navigate to a destination

  "programming-fundamentals-lesson5-level9_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `Help the \`Painter\` navigate through The Neighborhood to reach the food truck!
1. Create a \`Painter\` object.
2. Use the \`move()\` and \`turn_left()\` methods to navigate through The Neighborhood to reach the food truck.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level9_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `Help the \`Painter\` navigate through The Neighborhood to reach the food truck!
1. Create a \`Painter\` object.
2. Use the \`move()\` and \`turn_left()\` methods to navigate through The Neighborhood to reach the food truck.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level9_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `Help the \`Painter\` navigate through The Neighborhood to reach the food truck!
1. Create a \`Painter\` object.
2. Use the \`move()\` and \`turn_left()\` methods to navigate through The Neighborhood to reach the food truck.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson6-level7: write a program using student-defined functions

  "programming-fundamentals-lesson6-level7_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

**Write a program using the functions created today to get the \`Painter\` to the traffic cone and paint the path.**

- You can even create **new** functions in your \`custom.py\` file if you need to!
   - *Do you need to create a new function to take all the paint?*
- Don't forget to add comments to your program to explain the purpose of your functions and code segments.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level7_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

**Write a program using the functions created today to get the \`Painter\` to the traffic cone and paint the path.**

- You can even create **new** functions in your \`custom.py\` file if you need to!
- Don't forget to add comments to your program to explain the purpose of your functions and code segments.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level7_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

**Write a program using the functions created today to get the \`Painter\` to the traffic cone and paint the path.**

- You can even create **new** functions in your \`custom.py\` file if you need to!
- Don't forget to add comments to your program to explain the purpose of your functions and code segments.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level7_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

**Write a program using the functions created today to get the \`Painter\` to the traffic cone and paint the path.**

- You can even create **new** functions in your \`custom.py\` file if you need to!
- Don't forget to add comments to your program to explain the purpose of your functions and code segments.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson7-level6: debugging challenge

  "programming-fundamentals-lesson7-level6_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Run the code and observe what happens.
2. Run the test to see if that gives you any insights into the bug.
3. Decide which debugging strategy would be useful for this buggy program.
4. Iteratively refine and test the updates you make to the code.

---

**Unit Guide**

Document your experience with this debugging challenge:
- What strategy did you use?
- How did it help?
- When might it be most useful in the future?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level6_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Run the code and observe what happens.
2. Run the test to see if that gives you any insights into the bug.
3. Decide which debugging strategy would be useful for this buggy program.
4. Iteratively refine and test the updates you make to the code.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level6_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Run the code and observe what happens.
2. Run the test to see if that gives you any insights into the bug.
3. Decide which debugging strategy would be useful for this buggy program.
4. Iteratively refine and test the updates you make to the code.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level6_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run the code and observe what happens.
2. Run the test to see if that gives you any insights into the bug.
3. Decide which debugging strategy would be useful for this buggy program.
4. Iteratively refine and test the updates you make to the code.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson8-level6: write collect_and_move() function

  "programming-fundamentals-lesson8-level6_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This

1. In your \`custom.py\` file create a function called \`collect_and_move()\` that repeatedly collects paint from a bucket and moves forward.
    - Hint: Use the \`while painter.is_on_bucket()\` to collect multiple buckets of paint at once.
2. Use the \`collect_and_move()\` function inside a loop to navigate through The Neighborhood.
    - Hint: Remember to use the \`turn_left()\` method and \`turn_right()\` function as needed.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level6_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This

1. In your \`custom.py\` file create a function called \`collect_and_move()\` that repeatedly collects paint from a bucket and moves forward.
    - Hint: Use the \`while painter.is_on_bucket()\` to collect multiple buckets of paint at once.
2. Use the \`collect_and_move()\` function inside a loop to navigate through The Neighborhood.
    - Hint: Remember to use the \`turn_left()\` method and \`turn_right()\` function as needed.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level6_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This

1. In your \`custom.py\` file create a function called \`collect_and_move()\` that repeatedly collects paint from a bucket and moves forward.
    - Hint: Use the \`while painter.is_on_bucket()\` to collect multiple buckets of paint at once.
2. Use the \`collect_and_move()\` function inside a loop to navigate through The Neighborhood.
    - Hint: Remember to use the \`turn_left()\` method and \`turn_right()\` function as needed.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson8-level6_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This

1. In your \`custom.py\` file create a function called \`collect_and_move()\` that repeatedly collects paint from a bucket and moves forward.
    - Hint: Use the \`while painter.is_on_bucket()\` to collect multiple buckets of paint at once.
2. Use the \`collect_and_move()\` function inside a loop to navigate through The Neighborhood.
    - Hint: Remember to use the \`turn_left()\` method and \`turn_right()\` function as needed.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson10-level1: explore parameterized move_if_can() function

  "programming-fundamentals-lesson10-level1_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. **Run the code without making any changes.** Observe what happens.
2. Comment out the two conditional statements (lines 11-17) and uncomment the \`move_if_can()\` function on lines 20-26. Then click Run.
3. *Discuss: What do you think will happen when you call the function with a \`north\` argument? What will the \`Painter\` do? Give it a try!*
4. Call the function with different directions as the argument (e.g. \`move_if_can("west")\`, \`move_if_can("east")\`, etc).
- *Discuss:*
\t- How does the function simplify controlling the \`Painter\`'s movement?
\t- Why does the \`Painter\` skip moving if the condition is \`False\`?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson10-level1_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. **Run the code without making any changes.** Observe what happens.
2. Comment out the two conditional statements (lines 11-17) and uncomment the \`move_if_can()\` function on lines 20-26. Then click Run.
3. *Discuss: What do you think will happen when you call the function with a \`north\` argument?*
4. Call the function with different directions as the argument (e.g. \`move_if_can("west")\`, \`move_if_can("east")\`, etc).`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson10-level1_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. **Run the code without making any changes.** Observe what happens.
2. Comment out the two conditional statements (lines 11-17) and uncomment the \`move_if_can()\` function on lines 20-26. Then click Run.
3. *Discuss: What do you think will happen when you call the function with a \`north\` argument?*
4. Call the function with different directions as the argument (e.g. \`move_if_can("west")\`, \`move_if_can("east")\`, etc).`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson12-level5: write take_or_move() if/else function

  "programming-fundamentals-lesson12-level5_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`take_or_move()\` function. Inside this function, write an \`if/else\` statement:

   * If the \`Painter\` \`is_on_bucket()\`, call \`take_all_paint()\` to collect the paint.

   * Else, call \`this_painter.move()\` to continue forward.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import your \`take_or_move()\` function. Create a \`Painter\` and call your function while your \`Painter\` \`can_move()\`.

---

**Coding Tip**

Use \`this_painter.is_on_bucket()\` to check if the \`Painter\` is on a paint bucket. Then decide what to do using \`if\` and \`else\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level5_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`take_or_move()\` function with an \`if/else\` statement:
   * If the \`Painter\` \`is_on_bucket()\`, call \`take_all_paint()\`.
   * Else, call \`this_painter.move()\`.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import and use \`take_or_move()\` while the \`Painter\` \`can_move()\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level5_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`take_or_move()\` function with an \`if/else\` statement:
   * If the \`Painter\` \`is_on_bucket()\`, call \`take_all_paint()\`.
   * Else, call \`this_painter.move()\`.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import and use \`take_or_move()\` while the \`Painter\` \`can_move()\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level5_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`take_or_move()\` function with an \`if/else\` statement:
   * If the \`Painter\` \`is_on_bucket()\`, call \`take_all_paint()\`.
   * Else, call \`this_painter.move()\`.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import and use \`take_or_move()\` while the \`Painter\` \`can_move()\`.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson12-level6: debug a program using a flowchart

  "programming-fundamentals-lesson12-level6_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `# Do This:

Help! There's something wrong with the program! It isn't doing exactly what it should be according to the algorithm flowchart below.
1. Read through the flowchart to understand what the program should do.
2. Run and test the program to debug the program so that it works as expected for all outcomes.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level6_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `# Do This:

Help! There's something wrong with the program! It isn't doing exactly what it should be according to the algorithm flowchart below.
1. Read through the flowchart to understand what the program should do.
2. Run and test the program to debug the program so that it works as expected for all outcomes.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level6_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `# Do This:

Help! There's something wrong with the program! It isn't doing exactly what it should be according to the algorithm flowchart below.
1. Read through the flowchart to understand what the program should do.
2. Run and test the program to debug the program so that it works as expected for all outcomes.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson12-level8: write paint_or_turn() function combining loops and conditionals

  "programming-fundamentals-lesson12-level8_2025-launch_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`paint_or_turn(this_painter, color)\` function. Inside your function:

   * Write a \`while\` loop that runs while the \`Painter\` \`is_facing_east()\`

   * If the \`Painter\` \`has_paint()\`, paint the space and then move forward

   * Else, call your \`turn_right(this_painter)\` function

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import the functions you need and collect the paint and paint in The Neighborhood.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level8_2025-launch_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`paint_or_turn(this_painter, color)\` function:
   * \`while\` the \`Painter\` \`is_facing_east()\`: if \`has_paint()\`, paint and move; else call \`turn_right()\`.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import the functions and complete the task.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level8_2025-launch_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:

1. Import your \`custom.py\` into your project.

2. In \`custom.py\`, write the \`paint_or_turn(this_painter, color)\` function:
   * \`while\` the \`Painter\` \`is_facing_east()\`: if \`has_paint()\`, paint and move; else call \`turn_right()\`.

3. Save \`custom.py\` to your Backpack.

4. In \`main.py\`, import the functions and complete the task.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },

  // lesson13-level1: open-ended project — add code, run, iterate

  "programming-fundamentals-lesson13-level1_2025": {
    unitId: "aif2-2025",
    longInstructions: `## Do This:
1. Add your code to the workspace.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!

- *Don't have it, or it doesn't work? That's ok! Copy the code from* <a href="https://studio.code.org/projects/pythonlab/9dJ8tm4IBBuPZGDmBsrCLljUC2VI-79EgkHn6b-r8KQ/view" target="_blank">***here***</a> *and paste it into a new file in your project.*

<i class="fa-solid fa-hand-back-point-right"></i> **By the way!** Reference the Python documentation to remind yourself how the \`Painter\` object and methods work.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson13-level1_pilot-2025": {
    unitId: "aif2-tutor-pilot-2025",
    longInstructions: `## Do This:
1. Add your code to the workspace.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson13-level1_v2-2025": {
    unitId: "aif2-v2-2025",
    longInstructions: `## Do This:
1. Add your code to the workspace.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson13-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. Add your code to the workspace.
2. Click Run and observe the outcome.
    - Keep revising and testing your code until it runs as expected.

**Reminder:** Make sure you import your \`custom.py\` file and save it to your backpack after adding any new functions!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
};