/**
 * Neighborhood level data for 2025 Python Lab levels in published units.
 *
 * 98 levels scraped from dashboard/config/levels/custom/pythonlab/
 * unitId sourced from dashboard/config/scripts_json/
 * documentation sourced from dashboard/config/programming_classes/pythonlab/painter.json
 */

/** Serialized Painter class documentation from painter.json */
export const painterDocumentation = {"category_key": "neighborhood", "content": "## Meet the Painter\n\nThe `Painter` is a programmable object you can control with code. Think of it as a digital avatar or a cursor whose world is in a grid called the **Neighborhood**. Your code will serve as the instructions that direct the `Painter`'s every move.\n\nYou control the `Painter` by calling its methods, which are its built-in actions. The fundamental methods are:\n\n* `move()`: Moves the `Painter` one square forward in the direction it is facing.\n* `turn_left()`: Rotates the `Painter` 90 degrees to the left.\n* `paint()`: Applies color to the square the `Painter` is currently on.\n\nCombining these methods will allow you to solve puzzles, create complex digital patterns, and visualize how programming logic works in a tangible way.\n\nImport the `Painter` in Python Lab with `from neighborhood import Painter` ", "examples": "[]", "external_documentation": "", "fields": "[{\"name\":\"x_location\",\"type\":\"int\",\"description\":\"the x coordinate of the `Painter` object\"},{\"name\":\"y_location\",\"type\":\"int\",\"description\":\"the y coordinate of the `Painter` object\"},{\"name\":\"direction\",\"type\":\"str\",\"description\":\"the direction the `Painter` object is facing (`\\\"North\\\"`, `\\\"South\\\"`, `\\\"East\\\"`, or `\\\"West\\\"`)\"}]", "key": "painter", "name": "Painter", "syntax": "", "tips": "", "methods": [{"key": "painter", "position": 0, "name": "Painter", "content": "Creates a `Painter` object at `(0, 0)` facing `\"East\"` with `0` units of paint", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\n```\",\"image\":\"https://images.code.org/e4916207b91ecdd04443697eede4a5fb-default.png\"}]", "syntax": "", "external_link": null, "overload_of": null, "return_value": null}, {"key": "painter2", "position": 1, "name": "Painter(x, y, direction, paint)", "content": "Creates a `Painter` at specific x and y coordinates facing a specified direction with a given number of units of paint.", "parameters": "[{\"name\":\"x\",\"type\":\"int\",\"required\":false,\"description\":\"the x coordinate to place the `Painter` object\"},{\"name\":\"y\",\"type\":\"int\",\"description\":\"the y coordinate to place the `Painter` object\"},{\"name\":\"direction\",\"type\":\"str\",\"required\":false,\"description\":\"the direction for the `Painter` object to face\"},{\"name\":\"paint\",\"type\":\"int\",\"required\":false,\"description\":\"the number of units of paint the `Painter` object starts with\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\n```\",\"image\":\"https://images.code.org/1c32a72231bec7eeda7e082abb5298f7-parameterized.png\"}]", "syntax": null, "external_link": null, "overload_of": "painter", "return_value": null}, {"key": "move", "position": 2, "name": "move", "content": "Moves the `Painter` object one space forward in the direction it is facing.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.move()\\n```\",\"image\":\"https://images.code.org/54dfd250f1e30fa920e49e60c81a04b2-painter_move.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "turn-left", "position": 3, "name": "turn_left", "content": "Turns a `Painter` object to the left.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = new Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.move()\\nmy_painter.turn_left()\\n```\",\"image\":\"https://images.code.org/285693b2899683eeaa015837334f7355-painter_turnleft.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "paint", "position": 4, "name": "paint", "content": "Paints the space the `Painter` object is standing on.", "parameters": "[{\"name\":\"color\",\"type\":\"str\",\"required\":true,\"description\":\"the color of the paint - can be a hex color value or color name (CSS named color - case insensitive)\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n```\",\"image\":\"https://images.code.org/d66489311bf586df08f4b294621acc95-painter_paint.gif\"},{\"code\":\"![](https://images.code.org/b5f030c497b6f6f61470fc3ab6dd7538-newColorChart.png)\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "take-paint", "position": 5, "name": "take_paint", "content": "Takes paint from the paint bucket the `Painter` object is currently standing on and adds a single unit of paint to their paint bucket. The number of units of paint in the paint bucket decreases by `1`. If the `Painter` object is not on a paint bucket, nothing happens.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move()\\nmy_painter.take_paint()\\nmy_painter.move()\\n```\",\"image\":\"https://images.code.org/39e03713f0674462f0c07c3f4201326f-painter_takepaint.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "scrape-paint", "position": 6, "name": "scrape_paint", "content": "Removes the paint from the space the `Painter` object is standing on.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\n\\nmy_painter.paint(\\\"white\\\")\\nmy_painter.move()\\nmy_painter.paint(\\\"white\\\")\\n\\nmy_painter.turn_left()\\nmy_painter.turn_left()\\nmy_painter.move()\\n\\nmy_painter.scrape_paint()\\n```\\n\",\"image\":\"https://images.code.org/f188339711730bd441607e3ea4794d0f-painter_scrapepaint.gif\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "can-move", "position": 7, "name": "can_move", "content": "Returns `true` if there is no barrier one space ahead in the direction the `Painter` object is currently facing.", "parameters": "[]", "examples": "[{\"name\":\"can_move() Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move()\\n\\nprint(\\\"Painter can move forward: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/7bb491d4ce769ee30fe6853d5ab64492-canmove.png)\\n\\nPainter can move forward: false\"},{\"name\":\"can_move() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move()\\n\\nprint(\\\"Painter can move forward: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/2b3e41e537a3a1f55b903788b922671e-canmove2.png)\\n\\nPainter can move forward: true\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "can-move2", "position": 8, "name": "can_move(direction)", "content": "Returns `true` if there is no barrier one space ahead in the specified direction.", "parameters": "[{\"name\":\"direction\",\"type\":\"str\",\"required\":true,\"description\":\"the direction to check\"}]", "examples": "[{\"name\":\"can_move(\\\"south\\\") Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move(\\\"south\\\")\\n\\nprint(\\\"Painter can move south: \\\", move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/8a67f0c913a130dd5107748f522f71c9-canmovesouth.png)\\n\\nPainter can move south: false\"},{\"name\":\"can_move(\\\"south\\\") Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 3, \\\"east\\\", 0)\\nmove_status = my_painter.can_move(\\\"south\\\")\\n\\nprint(\\\"Painter can move south: \\\" + move_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/20159154948642958952307badcf3e37-canmovesouth2.png)\\n\\nPainter can move south: true\"}]", "syntax": null, "external_link": null, "overload_of": "can-move", "return_value": null}, {"key": "is-on-paint", "position": 9, "name": "is_on_paint", "content": "Returns `true` if there is paint on the space the `Painter` object is currently standing on.", "parameters": "[]", "examples": "[{\"name\":\"is_on_paint() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n\\non_paint_status = my_painter.is_on_paint()\\n\\nprint(\\\"Painter is on paint: \\\", on_paint_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/0bc4fdebb564d6c814417e5ad6f64e85-isonpaint.png)\\n\\nPainter is on paint: true\"},{\"name\":\"is_on_paint() Returns false\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"South\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\nmy_painter.move()\\n\\non_paint_status = my_painter.is_on_paint()\\n\\nprint(\\\"Painter is on paint: \\\", on_paint_status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/c04f1f99e73b2b6caf432d7b8b399e98-isonpaint2.png)\\n\\nPainter is on paint: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-on-bucket", "position": 10, "name": "is_on_bucket", "content": "Returns `true` if there is a paint bucket on the space the `Painter` object is currently standing on and the paint bucket has paint in it.", "parameters": "[]", "examples": "[{\"name\":\"is_on_bucket() Returns true\",\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move();\\n\\nstatus = my_painter.is_on_bucket()\\n\\nprint(\\\"Painter is on a paint bucket: \\\", status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/a275d22ba722ccd29816d2d9af6cc95d-isonbucket.png)\\n\\nPainter is on a paint bucket: true\"},{\"name\":\"is_on_bucket() Returns false\",\"code\":\"```\\nmy_painter = Painter()\\nmy_painter.move()\\nmy_painter.move()\\n\\nstatus = my_painter.is_on_bucket()\\n\\nprint(\\\"Painter is on a paint bucket: \\\", status)\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/923cc3f5982006a61b96f82e8625be9a-isonbucket2.png)\\n\\nPainter is on a paint bucket: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "has-paint", "position": 11, "name": "has_paint", "content": "Returns `true` if the `Painter` object has paint in their paint bucket.", "parameters": "[]", "examples": "[{\"name\":\"has_paint() Returns true\",\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\n\\nresult = my_painter.has_paint()\\n\\nprint(\\\"Painter has paint: \\\", result)\\n```\\n\\n**Output**\\n\\nPainter has paint: true\"},{\"name\":\"has_paint() Returns false\",\"code\":\"```\\nmy_painter = Painter()\\n\\nresult = my_painter.has_paint()\\n\\nprint(\\\"Painter has paint: \\\", result)\\n```\\n\\n**Output**\\n\\nPainter has paint: false\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-north", "position": 12, "name": "is_facing_north", "content": "Returns `true` if the `Painter` object is currently facing `\"North\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/040dd0b55ad97a20c4344297fedd1e00-isfacingnorth.png)\\n\\n`is_facing_north()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-south", "position": 13, "name": "is_facing_south", "content": "Returns `true` if the `Painter` object is currently facing `\"South\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/b48d085f08d362d5941ae20fa3b5aea3-isfacingsouth.png)\\n\\n`is_facing_south()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-east", "position": 14, "name": "is_facing_east", "content": "Returns `true` if the `Painter` object is currently facing `\"East\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/182c1395dddaafb79c1e9ab27693094a-isfacingeast.png)\\n\\n`is_facing_east()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "is-facing-west", "position": 15, "name": "is_facing_west", "content": "Returns `true` if the `Painter` object is currently facing `\"West\"`.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/3621acb058214516d9b78c0008f4c0b0-isfacingwest.png)\\n\\n`is_facing_west()` returns `true`\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-my-paint", "position": 16, "name": "get_my_paint", "content": "Returns the number of units of paint that the `Painter` object has in their paint bucket.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 10 units of paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-color", "position": 17, "name": "get_color", "content": "Returns the color of the space the `Painter` object is currently standing on.", "parameters": "[]", "examples": "[{\"code\":\"```\\nmy_painter = Painter(2, 4, \\\"south\\\", 10)\\nmy_painter.paint(\\\"white\\\")\\n\\ncurrent_paint_color = my_painter.get_color()\\n\\nprint(\\\"Painter is standing on \\\" + current_paint_color + \\\" paint.\\\")\\n```\\n\\n**Output**\\n\\n![](https://images.code.org/e5a7dcdb917c87d4d083798ca185f1cb-isonpaint.png)\\n\\nPainter is standing on white paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-x", "position": 18, "name": "get_x", "content": "Returns the x coordinate for the current position of the `Painter` object.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_x_location = my_painter.get_x()\\nprint(\\\"Painter is at x location \\\", current_x_location)\\n```\\n\\n**Output**\\n\\nPainter is at x location 2\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-y", "position": 19, "name": "get_y", "content": "Returns the y coordinate for the current position of the `Painter` object.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_y_location = my_painter.get_y()\\nprint(\\\"Painter is at y location \\\", current_y_location)\\n```\\n\\n**Output**\\n\\nPainter is at y location 4\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "get-direction", "position": 20, "name": "get_direction", "content": "Returns the direction that the `Painter` object is currently facing.", "parameters": "[]", "examples": "[{\"code\":\"![](https://images.code.org/c719dbdf1bac79a78eb35b617572124d-isfacingnorth.png)\\n\\n```\\ncurrent_direction = my_painter.get_direction();\\nprint(\\\"Painter is facing \\\" + current_direction)\\n```\\n\\n**Output**\\n\\nPainter is facing north\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}, {"key": "set-paint", "position": 21, "name": "set_paint", "content": "Sets the number of units of paint in the `Painter` object's paint bucket. If the value passed is a negative number, nothing happens.", "parameters": "[{\"name\":\"paint\",\"type\":\"int\",\"required\":true,\"description\":\"the number of units of paint that should be in the `Painter` object's paint bucket\"}]", "examples": "[{\"code\":\"```\\nmy_painter = Painter()\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 0 units of paint.\\n\\n```\\nmy_painter.set_paint(10)\\n\\npaint_amount = my_painter.get_my_paint()\\nprint(\\\"Painter has \\\", paint_amount, \\\" units of paint.\\\")\\n```\\n\\n**Output**\\n\\nPainter has 10 units of paint.\"}]", "syntax": null, "external_link": null, "overload_of": null, "return_value": null}]} as const;

export const neighborhoodLevelData: Record<string, {
  unitId: string;
  longInstructions?: string;
  documentationUrl: string;
}> = {
  "aif-pl-conditional1-L10-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
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

For this problem, your condition will be \`is_facing_west()\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-conditionals2-L11-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Read the existing code -- notice that the \`Painter\` doesn't turn when it should.

2. Modify the \`if\` statement that checks whether the \`Painter\` \`can_move("south")\`

3. Run the program to see if the \`Painter\` turns right through the opening in the wall.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-object-predict-L16-2-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `What do you think the \`Painter\` will do when the code is run?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-objects-create-L17-2-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
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

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can name the \`Painter\` whatever you want! Give it a name that is meaningful to you, like your own name, your best friend's name, your pet's name, or the name of someone you look up to.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-two-waySelection-L16-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Read the program. Notice how the \`Painter\` moves forward, turns right, then enters a \`while\` loop.

   * Inside the loop, the \`Painter\` checks if it can move.
   
   * If it can, it turns left and keeps moving.
   
   * If it can't move east, the code still tries to move forward anyway.

2. Modify the \`if\` statement so the \`Painter\` only turns and moves if it \`can_move("east")\`

3. Add an \`else\` statement so the \`Painter\` only moves forward if it **can't** move east.

&nbsp;

![](https://images.code.org/a98abc56e7669d2eac95b47cb3d67c3c-choiceA.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

Use \`else\` to control what happens when a condition is false. This way, the \`Painter\` only chooses *one* path, never both.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-while1-L3-Python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Replace the repeated \`move()\` commands with a \`while\` loop.

2. Use \`painter_name.can_move()\` as the loop condition.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` reaches a wall or obstacle using

\`\`\`
while painter_name.can_move():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-while2-L4-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Replace the repeated lines of code with a \`while\` loop.

2. Use \`painter_name.has_paint()\` as the loop condition.

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can repeat actions until the \`Painter\` is out of paint using:

\`\`\`
while painter_name.has_paint():
   # CODE TO REPEAT
\`\`\``,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "aif-pl-whileloops3-L5-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

The \`Painter\` is supposed to move and paint while it still has paint, but something isn't working. Help fix the code so it runs correctly.

&nbsp;

![](https://images.code.org/fde9632335bf10f4c48f2f65a0c4758c-image-1744861268117.gif)

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

In Python, all the code you want to repeat must be indented under the \`while\` statement. If it's not indented, it won't run as part of the loop!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-PL-debug-L23-Python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

**Refer to Strategy 1 and 3**

1. Run the code and compare the output to the comments describing what should be happening. Take note of any unexpected behavior.
2. *Identify what might be causing the issue. Consider what is happening differently than expected.*
2. Since there is no error message, use AI Tutor to help analyze your code and find the bug. Ask for debugging advice or explanations of why the code isn't behaving as expected.
3. Modify the code to fix the issue.
	- **Hint:** Focus on checking the logic of your code rather than just syntax errors!
    
---

::: details [**🔎 Show me how**]
There could be several ways to fix this bug! In programming solutions can look different. Here is one way to get the code to function properly:

To enlarge the code drag out the side bar of the instruction box.
![](https://images.code.org/783334016131df64ccdfc38934d0a352-image-1743523114653.png)
:::


`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-PL-predict-nested-L13-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `# Predict and Run

**What do you think this program does?**

Take a look at the code in this program. Write down what you think this program will do. There are no wrong answers!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-bkpk-function-L19-Python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Add \`import custom\` at the top of the program to be able to use your \`custom.py\` file
2. Import your \`custom.py\` file:
	- Click the \`+\` in the File menu.
    - Select "Import from backpack"
    - Select your \`custom.py\` file from the list and click "Import to project"
    
*(If you did not save to backpack, you can go back to  <a href="https://studio.code.org/s/sandbox-csaif-pl-python/lessons/3/levels/29" target="blank" rel="noopener noreferrer">Level 29</a> and save it to try this feature.)*
3. Code the \`turn_around()\` function in the \`custom.py\` file so that the \`Painter\` will turn around to face the opposite direction

::: details [**🔎 Show me how**]
To enlarge the code drag out the side bar of the instruction box.
![](https://images.code.org/3ed6e90e35d4c81a668b45f89115602d-image-1743521837137.png)
:::

4. Run and test your code in \`main.py\`
5. Use your new function with other functions and \`Painter\` methods to paint the end of each street. Continue when you are ready.

::: details [**🔎 Show me how**]
To enlarge the code drag out the side bar of the instruction box.
![](https://images.code.org/f665cee8eeb4bd1701f7b0a14c3476c1-image-1743521700001.png)
:::


**Remember: Save your code to the Backpack!**  

::: details [**Click Here to Learn How To Import from the Backpack!**]

- Click the \`+\` icon next to the File menu.
- Select "Import from backpack" from the drop-down menu.
- Select your file and click the "Import to project" button.

<img src="https://images.code.org/f53f681651f42c532cf0c7078fc14099-image-1740078209718.gif" style="width:450px;">
:::

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-conditional-practice-L10-python_2025": {
    unitId: "self-paced-pl-aif2-2025",
    longInstructions: `## Do This:

1. **Run and Consider:**
   - What happens when the \`Painter\` moves?
   - Does the \`Painter\` paint along all sides of the sidewalk like the image below?
   - What seems to be missing?
2. The function \`move_and_paint_if_facing()\` is not complete:
   - Add the missing \`if\` statements so the \`Painter\` paints in all four directions.
   - Test your code. Click Run to make sure you don't have any errors.
   
::: details [**🔎 Show me how**]
To enlarge the code drag out the sidebar of the instruction box.

![](https://images.code.org/5f678d18acd74d21c7a3c511057084af-image-1743449344331.png)
:::


3. The function \`move_and_paint_if_facing()\` needs to be called more times in order for the \`Painter\` to paint in all four directions.  
    - Add the missing \`while\` loops at the bottom so the \`Painter\` moves around the entire sidewalk.
   - Test your changes by running the program after each addition.
   
::: details [**🔎 Show me how**]
![](https://images.code.org/e1103708adf152dc1232fc3840234196-image-1743449438164.png)
:::

4. *Consider: What would happen if the \`if\` statements were in a different order? Would the program behave the same way? Why or why not?*
   - What would happen if the \`Painter\` checked for \`is_facing_south()\` before checking \`is_facing_east()\`? 
   - Could the \`Painter\` ever skip an \`if\` statement?

<img src="https://images.code.org/7d7ddded9e3a7a19bd1c191feb4dd975-conditionalsL3.png" style="width:200px"> 

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-function-trn-rght-L17-Python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `>This level uses two files, \`custom.py\` and \`main.py\`. This is a common practice when using objects to code. 
> \`custom.py\` is used to define new functions and \`main.py\` is where the main program runs. 


## Do This:
1. Find the \`custom.py\` file and define a \`turn_right()\` function.
   - **Hint:** Refer to the \`move_fast()\` function from the <a href="https://studio.code.org/s/sandbox-csaif-pl-python/lessons/3/levels/17" target="blank" rel="noopener noreferrer">previous level</a> as a guide.

::: details [**🔎 Show me how**]

When defining a function in the \`custom.py\` file, the \`painter\` object is added inside the parentheses. 

This makes the code usable for any painter object.

To enlarge the code drag out the side bar of the instruction box.
![](https://images.code.org/8658ecc23b62e56425b3894ba3ee17c0-image-1741365862125.png)

:::
   
2. Run and test your code.
   
3. Toggle to the \`main.py\` file and try calling your function.
    - *Can you call the \`move_fast()\` and \`turn_right()\` functions multiple times in sequence? Try it!*
	
    
::: details [**🔎 Show me how**]

In the \`main.py\` file, notice the \`custom.py\` is imported. This is so we can access the \`custom.py\` file.

When using the custom file, calling a function looks a little different. 

First, use \`custom\` to signify where the function is coming from and then the dot (.) to connect the function you want to use. 

After creating a painter, you then put that name in the parenthesis of the new function to show which painter to use.


To enlarge the code drag out the side bar of the instruction box.
![](https://images.code.org/6c182df596a72e252d544132ef733a43-image-1743183092580.png)
:::

4. Spend some time creating methods in \`custom.py\` and calling methods in \`main.py\` and continue when you are ready.
    

::: details [**Click Here to Learn How To Save your code to the Backpack!**]

- Click the three-dot menu icon next to the \`custom.py\` file name.
- Select "Save to backpack" from the drop-down menu.
- Click the "Save to backpack" button in the pop-up dialog box.

<img src="https://images.code.org/a5083c7ccc54bfa4ea561fa29adf2902-image-1740077664809.gif" style="width:450px;">
:::

---

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-functions-L15-1-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `# Predict and Run

Let's take a look at functions in the neighborhood.

**What do you think this program does?**

Take a look at the code in this program. Write down what you think this program will do. There are no wrong answers!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-loop-code-L4-python_2025": {
    unitId: "self-paced-pl-aif2-2025",
    longInstructions: `## Do This:
1. Run your code and observe the outcome.
2. Rename the \`collect_paint()\` function to \`collect_and_move()\`. Add a call to move the painter (\`luis.move()\`) after the \`while\` loop is done executing.
3. Call \`collect_and_move()\` multiple times to test the updated behavior. Run your code and observe the outcome.
4. *Consider*: 
    - How is the \`while painter.is_on_bucket()\` loop useful?
    - Why is it useful to use the function \`collect_and_move()\` instead of writing the loop directly each time?


::: details [**🔎 Show me how**]
To enlarge the code drag out the sidebar of the instruction box. 

![](https://images.code.org/df25c7337ef727d3c119c7633c82d571-image-1743443721002.png)
:::

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-loop-modify-code_L3-python_2025": {
    unitId: "self-paced-pl-aif2-2025",
    longInstructions: `## Do This:
1. Run your code and observe the outcome.
    - *How do the \`while\` loops simplify your code?*
2. Add a comment on line 9 to explain what the \`while\` loop does.
3. Comment out lines 9-12 and uncomment the second section, lines 14-17. Run the code and observe how it performs the same task.
    - *How does using the \`move_and_paint()\` function simplify your code?*
4. Add a \`painter.turn_right()\` method after the \`move_and_paint()\` function call. Then call the \`move_and_paint()\` function a second time.
    - *Hint: You'll need a \`turn_right\` function.*
    - *What happens when you reuse the \`move_and_paint\` function after making the \`Painter\` turn?*

::: details [**🔎 Show me how**]
To enlarge the code drag out the side of the instruction box.

![](https://images.code.org/3d65f0c0e41a15794fe11d0edbea371a-image-1743438502132.png)
:::

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-nested-L15-python_2025": {
    unitId: "self-paced-pl-aif2-2025",
    longInstructions: `## Do This:

1. Run your code and observe the outcome. 
    - *Tip: Make sure to run the program with both "grass" and "flower" for user inputs.*
2. *Discuss: If we want the program to do one thing when the user enters "grass" and something **else** when the user enters "flower", what might be missing from the conditional statement?*
3. Add the missing \`else\` statement with code to make the \`Painter\` plant a flower of your choice.
4. Run your code again to make sure the \`Painter\` plants a flower.

---
::: details [**🔎 Show me how**]
Drag out the sidebar of the instruction box to make the code larger. 

![](https://images.code.org/a2cca4fa02e4af46578976b742dafb8b-image-1743541599139.png)
:::

`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "csaif-pl-predict-conditional-L5-2-python_2025": {
    unitId: "self-paced-pl-teaching-foundations-ai-programming",
    longInstructions: `## Do This:

1. Run the code without making any changes. Observe what happens.
2. Comment out the two conditional statements (lines 11-17) and uncomment the \`move_if_can()\` function on lines 20-26. Then click Run.
3. *Discuss: What do you think will happen when you call the function with a \`north\` argument? What will the \`Painter\` do? Give it a try!*
4. Call the function with different directions as the argument (e.g. \`move_if_can("west")\`, \`move_if_can("east")\`, etc).
- *Discuss:*
	- How does the function simplify controlling the \`Painter\`’s movement?
	- Why does the \`Painter\` skip moving if the condition is \`False\`?

---


`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
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
  "programming-fundamentals-lesson12-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run your code and observe the outcome. 
    - *Hint: Make sure to type a number into the console to set the amount of paint you want.* 
2. *Discuss: Why does the \`Painter\` only paint one square regardless of how much paint you give it?*
3. Update the code to use the variable holding the user input for the amount of paint as the argument for the \`set_paint()\` method.
    - *Hint: Where in your code is the user's input being stored?*
 `,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson12-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run your code and observe the outcome. 
    - *Tip: Make sure to run the program with both "grass" and "flower" for user inputs.*
2. *Discuss: If we want the program to do one thing when the user enters "grass" and something **else** when the user enters "flower", what might be missing from the conditional statement?*
3. Add the missing \`else\` statement with code to make the \`Painter\` plant a flower of your choice.
4. Run your code again to make sure the \`Painter\` plants a flower.
`,
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
  "programming-fundamentals-lesson5-level1_2025-launch": {
    unitId: "csaif2-2025",
    longInstructions: `What do you think the \`Painter\` will do when the code is run?`,
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
  "programming-fundamentals-lesson5-level2_2025-launch": {
    unitId: "csaif2-2025",
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

---

<i class="fa-solid fa-laptop"></i> **Coding Tip**

You can name the \`Painter\` whatever you want! Give it a name that is meaningful to you, like your own name, your best friend's name, your pet's name, or the name of someone you look up to.`,
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
  "programming-fundamentals-lesson5-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This: 
1. Add \`painter = Painter()\` to create a \`Painter\` object.
    - Hint: Look at the the code comments.
    - Press Run to test your code.
    - *Discuss: Did the \`Painter\` object appear where you expected it to?*
2. Add \`painter.move()\` to make the \`Painter\` move forward.
    - *Discuss: Which direction do you expect the \`Painter\` to move?*
    - Press Run to test your code.
3. Add more \`painter.move()\` methods to move the \`Painter\` to the cone.
	- Press Run to test your code.`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson5-level4_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Run the code and observe.
2. *Discuss: The \`Painter\` passed over a paint bucket. What do you think its purpose is?*
3. Uncomment (delete the \`#\`'s) the code on lines 11-14, 18, 20, and 22. Then run the program. 
4. *Discuss:* 
	- *Was your prediction about the bucket accurate?*
    - *What does the number on the bucket represent?*
5. Paint a yellow line to the cone.
	- See the [documentation](https://docs.google.com/document/d/1x3xmKI_ADq8GaGoI0XGX9pJIE4VmPM3iXq_qIHeo7r4/edit?usp=sharing) for how to change the color of the paint.`,
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
  "programming-fundamentals-lesson6-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `# Predict and Run

**What do you think this program does?**

Take a look at the code in this program. Write down what you think this program will do. There are no wrong answers!`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. Find the \`custom.py\` file and define a \`turn_right()\` function.
   - **Hint:** Refer to the \`move_fast()\` function as a guide.
   - *Discuss: How do you add a comment about this function, and what should it say?*
2. Run and test your code.
   - *Discuss: Where should you call your \`turn_right()\` function? Try it!*
   - *Discuss: Can you call the \`move_fast()\` and \`turn_right()\` functions multiple times in sequence? Try it!*
3. **Discuss:** How does defining your own function make your code easier to reuse?
4. Save your code to the Backpack! Click below to see how!

::: details [**Click Here to Learn How To Save your code to the Backpack!**]

- Click the three-dot menu icon next to the \`custom.py\` file name.
- Select "Save to backpack" from the drop-down menu.
- Click the "Save to backpack" button in the pop-up dialog box.

<img src="https://images.code.org/a5083c7ccc54bfa4ea561fa29adf2902-image-1740077664809.gif" style="width:450px;">
:::`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Add \`import custom\` at the top of the program to be able to use your \`custom.py\` file
2. Import your \`custom.py\` file:
	- Click the \`+\` in the File menu.
    - Select "Import from backpack"
    - Select your \`custom.py\` file from the list and click "Import to project"
3. *Discuss: What code would you need to add to the \`turn_around()\` function definition in the \`custom.py\` file that would make the \`Painter\` turn around to face the opposite direction?*
4. Implement your ideas, run and test your code.
5. Use the \`#\` to add a comment above the \`turn_around()\` function to explain what it does.
6. Use your new function with other functions and \`Painter\` methods to paint the end of each street.
7. **Save your code to the Backpack!**  

::: details [**Click Here to Learn How To Import from the Backpack!**]

- Click the \`+\` icon next to the File menu.
- Select "Import from backpack" from the drop-down menu.
- Select your file and click the "Import to project" button.

<img src="https://images.code.org/f53f681651f42c532cf0c7078fc14099-image-1740078209718.gif" style="width:450px;">
:::
`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level4_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:
1. **Discuss:** How easy would it be to change the color being painted?
2. Import your \`custom.py\` file.
    - **Hint:** Remember to include \`import custom\` at the top of \`main.py\`.
3. Define a function called \`paint_line(painter, color)\` where \`color\` represents the color to be painted.
   - **Hint:** Move the starter code from \`main.py\` into this function. *Remember to indent each line within the function definition!*
   - *Discuss: What code now in the function needs to be modified? See the [documentation](https://docs.google.com/document/d/1x3xmKI_ADq8GaGoI0XGX9pJIE4VmPM3iXq_qIHeo7r4/edit?usp=sharing) for how to use a parameter within a function definition.*
4. Add a comment explaining the purpose of the \`paint_line(painter, color)\` function and how the parameter \`color\` is used.
5. Run and test your code:
   - **Hint:** Call the function multiple times with different colors (e.g. \`paint_line(painter, "yellow")\`, \`paint_line(painter, "red")\`)
   - *Discuss: How did adding the parameter \`color\` make the function more flexible?*
6. **Save your code to the Backpack!**`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson6-level6_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

**Write a program using the functions created today to create a unique pattern in The Neighborhood.**
- Import \`custom.py\`.
- Use at least three functions you have created.
- In \`main.py\`, call each function more than once to create a pattern.
- Make sure you comment your code to explain each segment's purpose.

**TAG Feedback**

Swap programs with a partner and provide TAG feedback on a sticky note.
   - T (Tell): Tell something you liked about their program
   - A (Ask): Ask a question about their program
   - G (Give): Give a suggestion for improvement.

::: details [**See TAG feedback example here!**]
   - T: *I liked how you alternated the colors red and blue.*
   - A: *Why did you decide to move forward twice before turning right?*
   - G: *You could try adding another color to your pattern.*
:::`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level1_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

**Refer to Strategy 1 and 2**

1. *Discuss: Take a look at the code and discuss what might go wrong before running it.*
2. Walk through the program line by line with your partner, explaining aloud what each line does and what you expect to happen.
3. Add \`print\` statements to check when and where different pieces of code run.
    - **Hint:** Try adding \`print\` statements inside the function definition, after the object is created, or after the function is called.
    - Run and test to see what your \`print\` statements reveal.
4. Modify the code to fix the issue.
	- **Hint:** Can you use a method on an object before it's created?

---

**Unit Guide**

Document your experience with this debugging strategy:
- What worked? 
- What challenges did you face? 
- How did this strategy help? 
- When might it be most useful in the future?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

**Refer to Strategy 1 and 3**

1. Run the code and compare the output to the comments describing what should be happening. Take note of any unexpected behavior.
2. *Discuss: With a partner, identify what might be causing the issue. Consider what is happening differently than expected.*
2. Since there is no error message, use the chatbot on Level 4 to help analyze your code and find the bug. Ask for debugging advice or explanations of why the code isn't behaving as expected.
3. Modify the code to fix the issue.
	- **Hint:** Focus on checking the logic of your code rather than just syntax errors!

---

**Unit Guide**

Document your experience with this debugging strategy:
- What worked? 
- What challenges did you face? 
- How did this strategy help? 
- When might it be most useful in the future?`,
    documentationUrl: "/docs/ide/pythonlab/classes/painter/get_serialized",
  },
  "programming-fundamentals-lesson7-level3_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

**Refer to Strategy 1 and 4**

1. Run the code and carefully read the first error message in the console log. Try to find the most useful information among the large error message.
2. *Discuss: What do you think the error message is telling you? Identify where in the code the issue is occurring.*
2. If the error message is unclear, go to Level 4 and ask the chatbot for help in understanding what part of the error message is the most important and what the error message means.
3. Modify the code to fix the issue.
	- **Hint:** There are multiple errors! Fix one error at a time, running the program after each change to check your progress.

---

**Unit Guide**

Document your experience with this debugging strategy:
- What worked? 
- What challenges did you face? 
- How did this strategy help? 
- When might it be most useful in the future?`,
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
  "programming-fundamentals-lesson9-level2_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. Add two conditionals to the \`check_square(painter)\` function definition:
   - First, check if the \`Painter\` \`is_on_paint()\`, and if it is, then the \`Painter\` should \`scrape_paint()\`.
   - Second, check if the \`Painter\` \`can_move()\`, and if it can, then the \`Painter\` should \`move()\`. 
2. Call the \`check_square(painter)\` function after the \`turn_around()\` function call.
3. *Discuss:* What can you use to continue to call the \`check_square(painter)\` function repeatedly so that the \`Painter\` scrapes up the line of paint it just put down like the image below?*
4. Give your ideas a try!
   - *Discuss: How do \`if\` statements and \`while\` loops work together in this program? What would happen if we moved the conditionals outside the loop?*

<img src="https://images.code.org/143dc2209f3ac15665dc9b11545bfb46-image-1738551358664.gif" style="width: 200px;"> `,
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
  "programming-fundamentals-lesson9-level4_2025-preview": {
    unitId: "csaif2-preview",
    longInstructions: `## Do This:

1. **Run and Discuss:** Look at the \`paint_diagonal(color)\` function:
   - How does the first \`if\` statement control whether the \`Painter\` paints and moves? 
   - What does each ***nested*** \`if\` inside it do?
2. Finish the code inside the \`paint_diagonal(color)\` function definition:
   - Add a "parent" \`if\` statement to check if the \`Painter\` \`has_paint()\`. 
   - Inside this "parent" \`if\` statement, add an \`if\` to check if the \`Painter\` is facing south, and if so: 
      - Paint using the parameter \`color\`.
      - Check if the \`Painter\` can move, and if so, move.
      - Turn left.
      - Check again if the \`Painter\` can  move, and if so, move.
3. Run your program and check if the \`Painter\` paints a diagonal line from the top left to the bottom right of the Neighborhood.
4. **Discuss:** Why isn't the \`Painter\` painting a diagonal line?*
	- **Hint:** What does calling \`paint_diagonal(color)\` once do? What would happen if you called it repeatedly?
`,
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
};