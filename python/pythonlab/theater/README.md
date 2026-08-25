# theater

The `theater` package gives Python Lab student code a `Scene` to draw pictures
and play sounds on, and `play_scenes()` to turn what was recorded into an
animation with a soundtrack. It is a port of javalab's
[`org.code.theater`](https://github.com/code-dot-org/javabuilder/tree/main/org-code-javabuilder/theater).

```python
from theater import Scene, play_scenes

scene = Scene()
scene.set_fill_color('blue')
scene.draw_ellipse(150, 150, 100, 100)
scene.play_note(60, 0.5)
scene.pause(0.5)
scene.draw_text('hello', 20, 380)
play_scenes(scene)
```

The package exports seven names: `Scene`, `play_scenes`, `Color`, `Image`,
`Font`, `FontStyle`, and `Instrument`. Everything under `theater.support` —
the renderer, the audio timeline, the action records — is machinery those seven
are built from, not something student code calls.

## Basic architecture

A `Scene` method call records an action, but draws nothing. `play_scenes()`
replays the recorded actions to produce two things:

- an **animated gif**, by drawing onto one 400x400 canvas, and
- a **WAV track**, by blending sounds onto one timeline.

It returns both as `(gif_bytes, wav_bytes)` and hands them to Python Lab to play
on the stage. `wav_bytes` is `None` for a program that made no sound.

Errors are thrown in two places. A bad argument — a note out of range, text too
large — throws at the `Scene` call that recorded it, so the traceback points at
the student's own line. A scene that is too *big* — too many frames, too much
audio — can only be caught once the whole recording is in hand, so it throws from
`play_scenes()`. See [Limits](#limits).

## The stage

The stage is always 400x400 pixels. `(0, 0)` is the top-left corner; `x` grows
right and `y` grows **down**.

```
      x: 0                    400
 y: 0  +----------------------+
       |                      |
       |        (200, 200)    |     the middle of the stage
       |                      |
  400  +----------------------+
```

Coordinates need not be whole numbers, and nothing has to stay on the stage.
Drawing that falls outside is not rendered, with no error.

## Drawing

Every shape is drawn with the scene's current stroke color, fill color, and
stroke width, as they stand at the moment of the call. Setting a color later does
not change a shape already recorded.

| | Default |
| --- | --- |
| stroke color | black |
| fill color | black |
| stroke width | 1 |

Coordinates and sizes must be numbers. They need not be whole — the drawing
methods round where they have to — but a coordinate that is not a number will
throw from `play_scenes()`, not at the call that recorded it.

## API

### `play_scenes(*scenes)`

```python
play_scenes(scene)                  # one scene
play_scenes(intro, middle, ending)  # several, in order
```

Several scenes make **one** animation, not one each: their action lists are
concatenated and rendered together. The canvas carries over, so a later scene
starts on whatever the previous one left behind — call `clear()` first if it
should start fresh.

Drawing style, on the other hand, is per-`Scene`. A fill color set in the first
scene does not apply to the second, which starts back at the defaults.

## Image

There are three supported ways to make an `Image`:

```python
Image('cat.png')     # load a file from the Python Lab file system
Image(other_image)   # copy an existing Image
Image(200, 100)      # a blank white image, 200 wide and 100 tall
```

A loaded image larger than 400x400 is scaled down to fit, keeping its shape.

The constructor will throw if given any invalid input, if
the file does not exist or cannot be read as an image, if a width or height is
negative, or if the image would exceed 16 Mi pixels.

| Methods | |
| --- | --- |
| `get_width() -> int`, `get_height() -> int` | Size in pixels. |
| `get_pixel(x, y) -> Pixel` | One pixel; `pixel.get_color()` gives its `Color`. |
| `set_pixel(x, y, color)` | Change one pixel. |
| `clear(color)` | Fill the whole image with one color. |

`get_pixel()` and `set_pixel()` will throw if given a coordinate outside the
image — unlike drawing on the stage, which quietly ignores what falls outside.
`set_pixel()` and `clear()` will throw if given an invalid color.

## Scene Methods
The bulk of the actions the user will take are in a `Scene`.

### Timing

#### `pause(seconds)`

The animation is a sequence of still frames, and `pause()` is what ends one.

It holds the current picture for `seconds`, then starts a new frame. Everything
drawn since the last pause appears in the frame the pause closes.

The method will throw if given a duration outside 0.1 - 655.35 seconds. A pause
is rounded to a hundredth of a second, which is the finest delay a gif frame can
express.

A scene with no pause at all is a single still picture. Whatever is drawn after
the last pause becomes a closing frame.

Pauses are also the clock the soundtrack runs on. Sound recorded between two
pauses starts where those pauses put it, so picture and sound stay together.
Sound does *not* advance the clock: a note and the drawing after it belong to the
same moment unless a `pause()` separates them.

### Canvas

#### `clear(color)`

Fills the whole stage with one color, painting over everything. The method will
throw if given an invalid color.

#### `get_width() -> int`, `get_height() -> int`

Always `400`.

### Drawing

#### `draw_line(start_x, start_y, end_x, end_y)`

A straight line in the stroke color. Draws nothing if the stroke color has been
removed.

#### `draw_rectangle(x, y, width, height)`

Draws a rectangle with `(x, y)` as the top-left corner. The method will throw
from `play_scenes()` if given a negative width or height.

#### `draw_ellipse(x, y, width, height)`

`(x, y)` is the top-left corner of the box the ellipse fits inside, *not* its
center. Equal width and height give a circle. As with a rectangle, the method
will throw from `play_scenes()` if given a negative width or height.

#### `draw_regular_polygon(x, y, sides, radius)`

A polygon with all sides the same length, centered on `(x, y)`, with its corners
`radius` from that center. The first corner sits directly right of the center.
The method will throw if given fewer than 3 sides.

#### `draw_shape(points, close)`

A shape through arbitrary points, given as one flat list — `[x1, y1, x2, y2,
...]`. `close` decides what it becomes:

- `close=True` — the last point joins back to the first and the interior is
  filled.
- `close=False` — a connected path of line segments in the stroke color, not
  filled.

The method will throw if given an odd number of values, or fewer than two
points.

#### `set_stroke_color(color)`, `set_fill_color(color)`, `set_stroke_width(width)`

Set the style for shapes recorded from here on. The two color methods will throw
if given an invalid color.

Stroke width is a whole number of pixels, at least 1. `set_stroke_width()` never
throws: a fractional width rounds, and a width under 1 still draws a 1-pixel
line.

#### `remove_stroke_color()`, `remove_fill_color()`

Draw shapes without an outline, or without a filled interior. A shape with
neither draws nothing at all.

### Text

#### `draw_text(text, x, y, rotation=0)`

Draws text in the current text color, font, and height. `(x, y)` is the left end
of the **baseline** — the line the letters sit on, so descenders in letters like
`g` and `y` fall below `y`.

`rotation` is in degrees, clockwise, about `(x, y)`.

A newline in `text` starts a new line below the first, which keeps the baseline
it was given — so the extra lines fall below `y`, they do not push the first one
up.

The method will throw if given something that is not a string, or a string too
long to draw at the current text height. See [Limits](#limits) for what "too
long" costs.

#### `set_text_color(color)`, `set_text_height(height)`

`height` is in pixels, between 1 and 1600, and defaults to 20.
`set_text_height()` will throw if given a height outside that range, and
`set_text_color()` will throw if given an invalid color.

#### `set_text_style(font, style)`

```python
from theater import Font, FontStyle
scene.set_text_style(Font.SERIF, FontStyle.BOLD_ITALIC)
```

`Font` is `MONO`, `SANS` (the default), or `SERIF`. `FontStyle` is `NORMAL` (the
default), `BOLD`, `ITALIC`, or `BOLD_ITALIC`.

The three families are Liberation Mono, Sans, and Serif, bundled with the
package. No other font is available, and the stage draws only the characters
those faces carry.

These two arguments must be the enum values; unlike the color and instrument
arguments elsewhere, the equivalent strings do not work. The method will throw on
anything else, but from `play_scenes()` rather than at the call.

### Images

#### `draw_image(image, x, y, size=None, width=None, height=None, rotation=0)`

Draws an Image — or a file, if `image` is a filename — with its top-left corner
at `(x, y)`. The size must be given one of two ways:

- `size=` sets the width, and the height follows so the image keeps its shape.
- `width=` and `height=` together stretch it to exactly that size.

The method will throw if given neither form, if either dimension is less than 1
or greater than 4000 pixels — including a height that `size=` works out to — or if `image` is a
filename that cannot be loaded.

`rotation` is in degrees, clockwise, about `(x, y)`.

The image is copied when it is recorded, so changing it afterwards does not
change what was drawn — draw, then edit, then draw again to animate an image
being altered.

### Sound

#### `play_note(note, seconds, instrument=Instrument.PIANO)`

Plays one note for `seconds`, cut off at that length. `note` is a MIDI number:
60 is middle C and each step is one semitone, over the range 48 to 84 (C3 to
C6). A fractional note rounds to the nearest semitone.

`instrument` is `Instrument.PIANO` or `Instrument.BASS`, or the name as a string
(`'piano'`, case-insensitive).

`seconds` has the same bounds as `pause()`, 0.1 to 655.35.

The method will throw if given a duration outside that range, a note outside
48 - 84, or an unrecognized instrument.

The note starts at the current moment and does not advance the clock. Notes
recorded with no pause between them play at once, as a chord.

#### `play_note_and_pause(note, seconds, instrument=Instrument.PIANO)`

`play_note()` followed by `pause()` of the same length — a note that plays
through to the end before the next thing happens. It throws on the same inputs
`play_note()` does.

#### `play_sound(sound)`

Plays a sound from either:

- a **filename** — a 16-bit PCM WAV file in the Python Lab file system. Stereo
  is mixed to mono, and any sample rate is converted.
- a **list of numbers** between -1.0 and 1.0, one per sample at 44100 samples
  per second, for a sound computed rather than loaded.

The method will throw if given a filename that does not exist, a file that is
not 16-bit PCM mono or stereo WAV, a sound longer than 300 seconds, or a
sequence that is not a flat run of numbers. An empty sequence is accepted and
makes no sound.

The sound starts at the current moment and, like a note, does not advance the
clock. Sounds that overlap are added together; the sum is clipped rather than
allowed past full volume. The samples are copied when recorded, so changing the
list afterwards does not change what plays.

## Color

Anywhere a color is taken, both a `Color` and a string work:

```python
scene.set_fill_color('teal')
scene.set_fill_color('#4B0082')
scene.set_fill_color(Color(75, 0, 130))
```

- a **name** from the palette below, case-insensitive
- a **hex** string, `'#rgb'` or `'#rrggbb'`
- three channel values, `Color(red, green, blue)`, each 0-255 and clamped into
  that range
- another `Color`, copied

The constructor will throw on anything else — an unrecognized name, a malformed
hex string, or two channel values instead of three. Note the palette is a fixed
list of 27 names:

```
white      silver     gray       black      red
maroon     yellow     olive      lime       green
aqua       teal       blue       navy       fuchsia
purple     pink       orange     gold       brown
chocolate  tan        turquoise  indigo     violet
beige      ivory
```

`get_red()`, `get_green()`, and `get_blue()` read the channels back.

## Limits

Every limit exists to keep one program from exhausting the browser tab Python
Lab runs in.

### Checked at the call

| Limit | Value | |
| --- | --- | --- |
| pause / note duration | 0.1 - 655.35 s | The ceiling is the longest delay a gif frame can hold. |
| note range | MIDI 48 - 84 | The notes bundled with the package. |
| text height | 1 - 1600 px | |
| one `draw_text()` call | 32 Mi pixels | Roughly `len(text) * height^2`. Long text costs what tall text costs, because the whole string is drawn before any of it is clipped to the stage. |
| image size | 16 Mi pixels | 4096x4096. Applies to loaded and blank images alike. |
| `draw_image()` width or height | 1-4000 px | Only the ceiling is checked; a dimension of zero or less draws one pixel instead of throwing. |
| one sound | 300 s | |

### Checked by `play_scenes()`

These depend on the whole recording, so nothing can be said about them until it
is complete.

| Limit | Value | |
| --- | --- | --- |
| frames | 600 | Counting the closing frame, so 599 pauses. |
| animation length | — | Unbounded, as long as the frame count holds. But a single picture cannot be held longer than 655.35 s in total: consecutive pauses with no drawing between them merge into one frame and add up. |
| audio timeline | 300 s | Measured to the end of the last sound, from the start. Silence costs what sound costs, so a long pause *before* a note counts; pauses after the last sound do not. |
| gif size | 30 MB | |

## Tests

```
uv run pytest
```

from this directory. The renderer runs anywhere Pillow and numpy are installed —
handing the result to the host is the only part that needs Python Lab — so the
tests render real gifs and WAVs and read the pixels and samples back.
