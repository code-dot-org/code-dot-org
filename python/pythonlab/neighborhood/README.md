# neighborhood

The `neighborhood` package gives Python Lab student code a `Painter` that walks a
square grid and colors squares. It is a port of javalab's
[`org.code.neighborhood`](https://github.com/code-dot-org/javabuilder/tree/main/org-code-javabuilder/neighborhood/src/main/java/org/code/neighborhood).

Student code works with painters two ways. The object form constructs them:

```python
from neighborhood import Painter
```

The function form skips the constructor and acts on one implicit painter — see
[The default painter](#the-default-painter).

Everything else the package exports (`World`, `NeighborhoodTracker`,
`NeighborhoodLog`, ...) exists for the harness that runs and validates student
code, not for students. `from neighborhood import *` brings in only the
student-facing names.

## The grid

The grid is always square. `(0, 0)` is the top-left (north-west) corner. `x`
grows east, `y` grows south. Moving north decreases `y`.

```
      x: 0   1   2
 y: 0  +---+---+---+
       | . | . | . |
    1  +---+---+---+
       | . | # | . |     # = wall or obstacle, not passable
    2  +---+---+---+
       | . | . | . |
       +---+---+---+
```

A square is passable if its tile type is open, start, finish, or start-and-finish.
Walls and obstacles are not passable. Off-grid coordinates count as not passable, so the
grid edge and a wall behave identically.

Squares carry two independent things:

- a **color**, set by `paint()` and cleared by `scrape_paint()`, and
- a **paint bucket** holding some number of units, drawn down by `take_paint()`.

A square can never hold both at once, see `paint()` below.

## The world is a singleton

All `Painter` instances share one `World`, and therefore one grid. Two painters
on the same grid see the same grid state (bucket contents, painted squares).
The first `Painter` constructed loads the grid from `serialized_maze.txt` in the
working directory if the harness has not already set one.

## Constructing a Painter

```python
Painter(x=0, y=0, direction='east', paint=None)
```

| Argument | Type | Meaning |
| --- | --- | --- |
| `x` | `int` | Starting column. Defaults to `0`. |
| `y` | `int` | Starting row. Defaults to `0`. |
| `direction` | `str` | One of `"north"`, `"east"`, `"south"`, `"west"`, matched case-insensitively. Defaults to `"east"`. |
| `paint` | `int \| None` | Starting units of paint. `None` means "decide from the grid size" — see [Paint accounting](#paint-accounting). |

An unrecognized `direction` raises `INVALID_DIRECTION`. The constructor does
**not** check that `(x, y)` is on the grid or passable; a painter placed off-grid
fails later, on the first call that touches its square.

## The default painter

Every method documented below is also available as a plain function acting on
one implicit painter. Three import forms reach the same functions:

```python
from neighborhood import painter
painter.move()

from neighborhood import move, turn_left, paint
move()

from neighborhood import *
move()
```

The implicit painter starts at `(0, 0)` facing east and is created the first
time one of the functions is called, not when the module is imported. That
matters because `NeighborhoodLog` lists painters in construction order and
validation code indexes into that list: a program that never calls one of these
functions has no default painter, so `painter_logs[0]` means what it always did.

The painter is discarded and rebuilt whenever the grid or the run context
changes, which is how each run of a program — and each pass validation makes
over `main.py` — starts with it back at `(0, 0)`.

Paint works exactly as it does for a `Painter()` built with no arguments — see
[Paint accounting](#paint-accounting).

Both styles work in one program. The implicit painter takes its place in
`painter_logs` at the point it is created — so a bare `move()` before an
explicit `Painter()` puts the implicit one first.

## Movement

### `move()`

Advances one square in the direction faced. Raises `INVALID_MOVE` if the target
square is off-grid or not passable — check with `can_move()` first if that is a
possibility.

### `turn_left()`

Rotates 90° counter-clockwise (north → west → south → east → north). This is the
only rotation primitive; turning right means calling it three times.

## Painting

### `paint(color)`

Colors the current square and spends one unit of paint.

`color` is either a CSS named color (case-insensitive, e.g. `"red"`,
`"MediumVioletRed"`) or a hex string in `#RGB` or `#RRGGBB` form. Anything else
raises `INVALID_COLOR`.

Two ways this does not paint:

- The painter has no paint. It prints `There is no more paint in the painter's
  bucket.` and returns. It does not throw an exception.
- The current square holds a paint bucket with units remaining. It raises
  `INVALID_PAINT_LOCATION`. The painter's paint is *not* spent, because the
  square rejects the color before the counter is decremented.

### `scrape_paint()`

Clears the current square's color. Prints `There's no paint to remove here.` if
the square had none. The removed paint is destroyed, not returned to the
painter's bucket.

### `take_paint()`

Moves one unit from the paint bucket on the current square into the painter's
bucket. If the square has no bucket, or the bucket is empty, it prints `There is
no paint to collect here.` and changes nothing.

## Paint accounting

`paint` defaults to `None`, which is not the same as `0`. When `paint is None`
**and** the grid is 20×20 or larger, the painter gets infinite paint: `has_paint()`
always returns `True` and `paint()` never runs out. On a smaller grid, `None`
means zero units.

Passing `paint` explicitly always yields a finite amount of paint, whatever the grid size.

Two consequences of how infinite paint is implemented, both worth knowing before
you write a test that asserts on paint counts:

- `get_my_paint()` still counts down, so it goes negative. Two `paint()` calls on
  a 20×20 grid leave it at `-2`.
- `set_paint()` is a no-op on an infinite painter.

### `get_my_paint() -> int`

Units of paint in the painter's bucket. See the caveat above.

### `set_paint(paint)`

Sets the painter's bucket to `paint` units. A negative value prints `Paint amount
must not be a negative number.` and changes nothing. Ignored entirely on an
infinite painter.

### `has_paint() -> bool`

`True` if the painter has infinite paint or at least one unit left.

## Queries

### `can_move(direction=None) -> bool`

`True` if the square one step away is on the grid and passable. Checks the
direction faced when `direction` is omitted. An unrecognized `direction` raises
`INVALID_DIRECTION`.

### `is_on_paint() -> bool`

`True` if the current square has a color.

### `is_on_bucket() -> bool`

`True` if the current square holds a paint bucket with units remaining.

### `get_color() -> str | None`

The current square's color, or `None` if unpainted. Unlike the other queries,
this one emits no signal, so a validator watching the signal stream cannot see
that it was called.

### `is_facing_north() -> bool`, `is_facing_east()`, `is_facing_south()`, `is_facing_west()`

Check which direction the painter is facing.

### `get_x() -> int`, `get_y() -> int`

Get the painter's current coordinates.

### `get_direction() -> str`

Direction faced, always lowercase: `"north"`, `"east"`, `"south"`, or `"west"`.

## Display

These four affect only what the front end draws. They change no grid or painter
state, and a hidden painter still moves and paints.

| Method | Effect |
| --- | --- |
| `hide_painter()` | Hides this painter's sprite. |
| `show_painter()` | Shows it again. |
| `hide_buckets()` | Hides every paint bucket on the grid. |
| `show_buckets()` | Shows them again. |

## Errors

Failures raise `NeighborhoodRuntimeException`, carrying an `ExceptionKey` the
front end maps to a student-facing message.

| Key | Raised when |
| --- | --- |
| `INVALID_DIRECTION` | A direction string is not one of the four compass names. |
| `INVALID_MOVE` | `move()` is called into a wall or off the grid. |
| `INVALID_COLOR` | `paint()` is given something that is neither a CSS color name nor a hex value. |
| `INVALID_PAINT_LOCATION` | `paint()` is called on a square holding a paint bucket with paint remaining. |
| `GET_SQUARE_FAILED` | A painter's own coordinates are off-grid or impassable. Reachable only from a bad constructor call, since `move()` refuses to enter such a square. |
| `INVALID_GRID` | The grid file or string is missing, malformed, empty, or not square. |

Conditions a student can hit through ordinary play — an empty bucket, scraping
bare ground, taking paint where there is none — print a message instead of
raising, so the program continues.

## Signals

Every state change prints a line the front end parses to animate the grid:

```
[NEIGHBORHOOD] MOVE {"direction": "east", "id": "painter-1"}
```

`id` distinguishes painters; it is assigned from a class counter, so the first
painter constructed in a process is `painter-1`.

Query methods (`can_move`, `has_paint`, `is_on_paint`, `is_on_bucket`) produce
*boolean* signals, which behave differently depending on the world's context type:

- `RUN` (a normal student run) — action signals print; boolean signals are
  suppressed, since there is nothing to animate.
- `VALIDATE` (a validation run) — nothing prints. All signals, boolean included,
  go to `NeighborhoodTracker`, which reconstructs the grid state and per-painter
  history that validation code inspects via `NeighborhoodLog`.

## Tests

```
uv run pytest
```

from this directory.
