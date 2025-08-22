export const painterDocsMarkdown = `# Painter

## Fields

- **\`x_location\`** (\`int\`) – the x coordinate of the \`Painter\` object
- **\`y_location\`** (\`int\`) – the y coordinate of the \`Painter\` object
- **\`direction\`** (\`string\`) – the direction the \`Painter\` object is facing (\`"North"\`, \`"South"\`, \`"East"\`, or \`"West"\`)

## Methods

### \`Painter()\`
Creates a \`Painter\` object at \`(0, 0)\` facing \`"East"\` with \`0\` units of paint

\`\`\`
my_painter = Painter()
\`\`\`

### \`Painter2()\`
Creates a \`Painter\` at specific x and y coordinates facing a specified direction with a given number of units of paint.

**Parameters:**
- **\`x\`** (\`int\`, required) – the x coordinate to place the \`Painter\` object
- **\`y\`** (\`int\`) – the y coordinate to place the \`Painter\` object
- **\`direction\`** (\`String\`, required) – the direction for the \`Painter\` object to face
- **\`paint\`** (\`int\`, required) – the number of units of paint the \`Painter\` object starts with

\`\`\`
my_painter = Painter(2, 4, "South", 10)
\`\`\`

### \`move()\`
Moves the \`Painter\` object one space forward in the direction it is facing.

\`\`\`
my_painter = Painter(2, 4, "South", 10)
my_painter.move()
\`\`\`

### \`turn_left()\`
Turns a \`Painter\` object to the left.

\`\`\`
my_painter = new Painter(2, 4, "South", 10)
my_painter .move()
my_painter .turn_left()
\`\`\`

### \`paint()\`
Paints the space the \`Painter\` object is standing on.

**Parameters:**
- **\`color\`** (\`String\`, required) – the color of the paint - can be a hex color value or color name (any CSS named color in any case is valid, but lowercase and PascalCase are preferred) or a .  

\`\`\`
my_painter = Painter(2, 4, "South", 10)
my_painter.paint("white")
\`\`\`



### \`take_paint()\`
Takes paint from the paint bucket the \`Painter\` object is currently standing on and adds a single unit of paint to their paint bucket. The number of units of paint in the paint bucket decreases by \`1\`. If the \`Painter\` object is not on a paint bucket, nothing happens.

\`\`\`
my_painter = Painter()
my_painter.move()
my_painter.take_paint()
my_painter.move()
\`\`\`

### \`scrape_paint()\`
Removes the paint from the space the \`Painter\` object is standing on.

\`\`\`
my_painter = Painter(2, 4, "South", 10)

my_painter.paint("white")
my_painter.move()
my_painter.paint("white")

my_painter.turn_left()
my_painter.turn_left()
my_painter.move()

my_painter.scrape_paint()
\`\`\`


### \`can_move()\`
Returns \`true\` if there is no barrier one space ahead in the direction the \`Painter\` object is currently facing.

can_move() Returns false
\`\`\`
my_painter = Painter(2, 3, "east", 0)
move_status = my_painter.can_move()

print("Painter can move forward:", move_status)
\`\`\`

**Output**



Painter can move forward: false

can_move() Returns true
\`\`\`
my_painter = Painter(2, 3, "east", 0)
move_status = my_painter.can_move()

print("Painter can move forward:", move_status)
\`\`\`

**Output**



Painter can move forward: true

### \`can_move2()\`
Returns \`true\` if there is no barrier one space ahead in the specified direction.

**Parameters:**
- **\`direction\`** (\`String\`, required) – the direction to check

can_move("south") Returns false
\`\`\`
my_painter = Painter(2, 3, "east", 0)
move_status = my_painter.can_move("south")

print("Painter can move south:", move_status)
\`\`\`

**Output**



Painter can move south: false

can_move("south") Returns true
\`\`\`
my_painter = Painter(2, 3, "east", 0)
move_status = my_painter.can_move("south")

print("Painter can move south: " + move_status)
\`\`\`

**Output**



Painter can move south: true

### \`is_on_paint()\`
Returns \`true\` if there is paint on the space the \`Painter\` object is currently standing on.

is_on_paint() Returns true
\`\`\`
my_ainter = Painter(2, 4, "South", 10)
my_painter.paint("white")

on_paint_status = my_painter.is_on_paint()

print("Painter is on paint:", on_paint_status)
\`\`\`

**Output**



Painter is on paint: true

is_on_paint() Returns false
\`\`\`
my_painter = Painter(2, 4, "South", 10)
my_painter.paint("white")
my_painter.move()

on_paint_status = my_painter.is_on_paint()

print("Painter is on paint:", on_paint_status)
\`\`\`

**Output**



Painter is on paint: false

### \`is_on_bucket()\`
Returns \`true\` if there is a paint bucket on the space the \`Painter\` object is currently standing on and the paint bucket has paint in it.

is_on_bucket() Returns true
\`\`\`
my_painter = Painter()
my_painter.move();

status = my_painter.is_on_bucket()

print("Painter is on a paint bucket:", status)
\`\`\`

**Output**



Painter is on a paint bucket: true

is_on_bucket() Returns false
\`\`\`
my_painter = Painter()
my_painter.move()
my_painter.move()

status = my_painter.is_on_bucket()

print("Painter is on a paint bucket: ", status)
\`\`\`

**Output**



Painter is on a paint bucket: false

### \`has_paint()\`
Returns \`true\` if the \`Painter\` object has paint in their paint bucket.

has_paint() Returns true
\`\`\`
my_painter = Painter(2, 4, "south", 10)

result = my_painter.has_paint()

print("Painter has paint: ", result)
\`\`\`

**Output**

Painter has paint: true

has_paint() Returns false
\`\`\`
my_painter= Painter()

result = my_painter.has_paint()

print("Painter has paint: ", result)
\`\`\`

**Output**

Painter has paint: false

### \`is_facing_north()\`
Returns \`true\` if the \`Painter\` object is currently facing \`"North"\`.



\`isFacingNorth()\` returns \`true\`

### \`is_facing_south()\`
Returns \`true\` if the \`Painter\` object is currently facing \`"South"\`.



\`isFacingSouth()\` returns \`true\`

### \`is_facing_east()\`
Returns \`true\` if the \`Painter\` object is currently facing \`"East"\`.



\`isFacingEast()\` returns \`true\`

### \`is_facing_west()\`
Returns \`true\` if the \`Painter\` object is currently facing \`"West"\`.



\`isFacingWest()\` returns \`true\`

### \`get_my_paint()\`
Returns the number of units of paint that the \`Painter\` object has in their paint bucket.

\`\`\`
my_painter = Painter(2, 4, "south", 10)
paint_amount = my_painter.get_my_paint()
print("Painter has ", paint_amount, " units of paint.")
\`\`\`

**Output**

Painter has 10 units of paint.

### \`get_color()\`
Returns the color of the space the \`Painter\` object is currently standing on.

\`\`\`
my_painter = Painter(2, 4, "south", 10)
my_painter.paint("white")

current_paint_color = my_painter.get_color()

print("Painter is standing on " + current_paint_color + " paint.")
\`\`\`

**Output**



Painter is standing on white paint.

### \`get_x()\`
Returns the x coordinate for the current position of the \`Painter\` object.



\`\`\`
current_x_location = my_painter.get_x()
print("Painter is at x location", current_x_location)
\`\`\`

**Output**

Painter is at x location 2

### \`get_y()\`
Returns the y coordinate for the current position of the \`Painter\` object.



\`\`\`
current_y_location = my_painter.get_y()
print("Painter is at y location ", current_y_location)
\`\`\`

**Output**

Painter is at y location 4

### \`get_direction()\`
Returns the direction that the \`Painter\` object is currently facing.



\`\`\`
current_direction = my_painter.get_direction();
print("Painter is facing " + current_direction)
\`\`\`

**Output**

Painter is facing north

### \`set_paint()\`
Sets the number of units of paint in the \`Painter\` object's paint bucket. If the value passed is a negative number, nothing happens.

**Parameters:**
- **\`paint\`** (\`int\`, required) – the number of units of paint that should be in the \`Painter\` object's paint bucket

\`\`\`
my_painter = Painter(0)
paint_amount = my_painter.get_my_paint()
print("Painter has ", paint_amount, " units of paint.")
\`\`\`

**Output**

Painter has 0 units of paint.

\`\`\`
my_painter.set_paint(10)

paint_amount = my_painter.get_my_paint()
print("Painter has ", paint_amount, " units of paint.")
\`\`\`

**Output**

Painter has 10 units of paint.

`;
