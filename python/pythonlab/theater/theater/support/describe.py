"""Turn a scene's actions into words, for a student who cannot see the stage."""

import os
from dataclasses import dataclass
from itertools import groupby

from .actions import SceneActionType
from .color import _NAMED_COLORS
from .constants import SAMPLE_RATE, THEATER_HEIGHT, THEATER_WIDTH
from .fonts import load_font
from .image import fit_to_width
from .renderer import _audio_length_bound, _frame_durations, _stroke

_NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")

_MAX_ITEMS_PER_GROUP = 8
_MAX_FRAMES_SHOWN = 50

# Thirds of the stage, as spoken: coarse enough to picture, unlike pixels.
_PLACES = (
  ("in the top left", "at the top", "in the top right"),
  ("on the left", "in the center", "on the right"),
  ("in the bottom left", "at the bottom", "in the bottom right"),
)

# Palette names as they appear in a phrase, for spotting a shared color.
_COLOR_WORDS = frozenset(name.lower() for name in _NAMED_COLORS)

# Which line of the transcript each drawing is listed on, and in what order.
_GROUPS = {
  SceneActionType.DRAW_RECTANGLE: "Shapes",
  SceneActionType.DRAW_ELLIPSE: "Shapes",
  SceneActionType.DRAW_LINE: "Shapes",
  SceneActionType.DRAW_POLYGON: "Shapes",
  SceneActionType.DRAW_SHAPE: "Shapes",
  SceneActionType.DRAW_IMAGE: "Images",
  SceneActionType.DRAW_TEXT: "Text",
  SceneActionType.PLAY_NOTE: "Sound",
  SceneActionType.PLAY_SOUND: "Sound",
}

# How each group counts repeats; only a shape phrase ends in a noun taking an s.
_COUNT_FORMS = {
  "Shapes": "{count} {phrase}s",
  "Images": "{phrase} {count} times",
  "Sound": "{phrase} {count} times",
  "Text": "{phrase} {count} times",
}

# Groups that stay on the canvas; a sound plays with its frame and is gone.
_PERSISTENT = frozenset({"Shapes", "Images", "Text"})

# Shapes drawn with a fill and an outline, either of which may be removed.
_FILLABLE = frozenset({
  SceneActionType.DRAW_RECTANGLE,
  SceneActionType.DRAW_ELLIPSE,
  SceneActionType.DRAW_POLYGON,
  SceneActionType.DRAW_SHAPE,
})

@dataclass
class SceneDescription:
  summary: str
  transcript: str


def describe(actions):
  """Describe what a scene draws and plays."""
  durations = _frame_durations(actions)
  background = None
  rest = actions
  if actions and actions[0].type is SceneActionType.CLEAR_SCENE:
    background = _color_name(actions[0].color)
    rest = actions[1:]
  frames = _group_into_frames(rest)
  return SceneDescription(
    _summary(actions, background, len(frames), durations),
    _transcript(frames, durations),
  )


def _group_into_frames(actions):
  """Split at each pause, where the renderer snapshots a frame."""
  frames = [[]]
  for action in actions:
    if action.type is SceneActionType.PAUSE:
      frames.append([])
    else:
      frames[-1].append(action)
  return frames


def _summary(actions, background, frame_count, durations):
  if frame_count == 1:
    sentence = "Still picture"
  else:
    sentence = f"Animation: {frame_count} frames over {_seconds(sum(durations) / 1000)}"
  if background:
    sentence += f", on {_article(background)} {background} background"
  audio_seconds = _audio_length_bound(actions)
  if audio_seconds:
    sentence += f", with {_seconds(audio_seconds)} of sound"
  return sentence + "."


def _transcript(frames, durations):
  if len(frames) == 1:
    lines, _ = _frame_lines(frames[0])
    # Silence would leave a student who drew only invisible shapes with nothing.
    return "\n".join(lines) or "Nothing was drawn on the stage."
  blocks = []
  onscreen = False
  for index, frame in enumerate(frames[:_MAX_FRAMES_SHOWN]):
    length = durations[index]
    held = "until the end" if length == 0 else _seconds(length / 1000)
    heading = f"Frame {index + 1} of {len(frames)}, {held}"
    lines, onscreen = _frame_lines(frame, onscreen)
    blocks.append("\n".join([heading] + lines))
  remaining = len(frames) - len(blocks)
  if remaining:
    plural = "frame" if remaining == 1 else "frames"
    blocks.append(f"and {remaining} more {plural}.")
  return "\n\n".join(blocks)


def _frame_lines(frame, onscreen=False):
  """The frame's lines, and whether any drawing is left on screen after it.

  The renderer keeps one canvas, so a drawing stays until a clear.
  """
  groups = {label: [] for label in dict.fromkeys(_GROUPS.values())}
  lines = []
  for action in frame:
    if action.type is SceneActionType.CLEAR_SCENE:
      lines.append(f"Cleared the stage to {_color_name(action.color)}.")
      # Drawings recorded earlier in this frame are wiped too; sound is not.
      for label in _PERSISTENT:
        groups[label].clear()
      onscreen = False
      continue
    phrase = _phrase(action)
    if phrase:
      groups[_GROUPS[action.type]].append((phrase, _position(action)))
  for label, items in groups.items():
    if items:
      name = f"Added {label.lower()}" if onscreen and label in _PERSISTENT else label
      items, shared = _factor_shared(items)
      lines.append(f"{name}{shared}: {_join(items, _COUNT_FORMS[label])}.")
  drawn = any(groups[label] for label in _PERSISTENT)
  return lines, onscreen or drawn


def _phrase(action):
  kind = action.type
  if _invisible(action):
    return None
  if kind is SceneActionType.DRAW_LINE:
    # A line carries one color and no fill, so it has no outline to contrast.
    return f"{_color_name(action.color)} line"
  if kind is SceneActionType.DRAW_RECTANGLE:
    return _painted(action, "rectangle")
  if kind is SceneActionType.DRAW_ELLIPSE:
    return _painted(action, "ellipse")
  if kind is SceneActionType.DRAW_POLYGON:
    return _painted(action, f"{action.sides}-sided polygon")
  if kind is SceneActionType.DRAW_SHAPE:
    if not action.close:
      return f"{_color_name(action.stroke_color)} open shape"
    return _painted(action, "shape")
  if kind is SceneActionType.DRAW_IMAGE:
    filename = action.image.get_filename()
    return os.path.basename(filename) if filename else "a picture made with code"
  if kind is SceneActionType.DRAW_TEXT:
    # A Scene paints black until told otherwise, so naming it says nothing.
    color = _color_name(action.color)
    quoted = f'"{action.text}"'
    return quoted if color == "black" else f"{color} {quoted}"
  if kind is SceneActionType.PLAY_NOTE:
    instrument = action.instrument.value.lower()
    return f"{instrument} note {_note_name(action.note)}"
  if kind is SceneActionType.PLAY_SOUND:
    if action.filename:
      return os.path.basename(action.filename)
    return f"a sound {_seconds(len(action.samples) / SAMPLE_RATE)} long"
  return None


def _invisible(action):
  """Say nothing about a shape the renderer draws nothing for."""
  kind = action.type
  if kind is SceneActionType.DRAW_LINE:
    return action.color is None
  if kind is SceneActionType.DRAW_SHAPE and not action.close:
    return action.stroke_color is None
  if kind in _FILLABLE:
    return action.fill_color is None and action.stroke_color is None
  return False


def _painted(action, noun):
  """Name a shape by its fill, plus an outline if wide and in a second color."""
  fill, stroke = action.fill_color, action.stroke_color
  primary = _color_name(fill or stroke)
  name = f"{primary} {noun}"
  # The renderer floors a stroke at a pixel, so every filled shape has an edge.
  if fill is None or stroke is None or _stroke(action.stroke_width) == 1:
    return name
  # Compared by name, so two hexes rounding to one palette word stay one word.
  outline = _color_name(stroke)
  # Noun last, so _COUNT_FORMS can pluralize a run by appending an s.
  return name if outline == primary else f"{outline}-outlined {name}"


def _position(action):
  """Where a drawing sits, or None for something with no place on the stage."""
  box = _bounds(action)
  if box is None:
    return None
  # Only the part on the stage counts, as that is all a sighted student sees.
  left, top, right, bottom = box
  left, top = max(left, 0), max(top, 0)
  right, bottom = min(right, THEATER_WIDTH - 1), min(bottom, THEATER_HEIGHT - 1)
  if left > right or top > bottom:
    return "off the stage"
  row = int((top + bottom) / 2 * 3 // THEATER_HEIGHT)
  column = int((left + right) / 2 * 3 // THEATER_WIDTH)
  return _PLACES[row][column]


def _bounds(action):
  """The box a drawing covers, as left, top, right, bottom; rotation is ignored."""
  kind = action.type
  if kind in (SceneActionType.DRAW_RECTANGLE, SceneActionType.DRAW_ELLIPSE):
    return _around((action.x, action.x + action.width), (action.y, action.y + action.height))
  if kind is SceneActionType.DRAW_POLYGON:
    r = action.radius
    return _around((action.x - r, action.x + r), (action.y - r, action.y + r))
  if kind is SceneActionType.DRAW_LINE:
    return _around((action.start_x, action.end_x), (action.start_y, action.end_y))
  if kind is SceneActionType.DRAW_SHAPE:
    # Points arrive flat: x, y, x, y.
    return _around(action.points[0::2], action.points[1::2])
  if kind is SceneActionType.DRAW_IMAGE:
    width, height = action.width, action.height
    if action.size is not None:
      image = action.image
      width, height = fit_to_width(image.get_width(), image.get_height(), action.size)
    return _around((action.x, action.x + width), (action.y, action.y + height))
  if kind is SceneActionType.DRAW_TEXT:
    font = load_font(action.font, action.font_style, action.height)
    left, top, right, bottom = font.getbbox(action.text, anchor="ls")
    return (action.x + left, action.y + top, action.x + right, action.y + bottom)
  return None


def _around(xs, ys):
  return (min(xs), min(ys), max(xs), max(ys))


def _color_name(color):
  """The closest palette name, since hex digits read aloud are noise."""
  target = color.to_rgb_tuple()
  return min(
    _NAMED_COLORS,
    key=lambda name: sum(
      (channel - value) ** 2 for channel, value in zip(_NAMED_COLORS[name], target)
    ),
  ).lower()


def _note_name(note):
  """A MIDI number as a pitch, where 60 is middle C."""
  return _NOTE_NAMES[note % 12] + str(note // 12 - 1)


def _factor_shared(items):
  """Move a color or place that every item shares into the group label."""
  if len(items) < 2:
    return items, ""
  shared = []
  # Color before place, so the group reads "all navy in the top left".
  color = items[0][0].partition(" ")[0]
  if color in _COLOR_WORDS and all(phrase.startswith(color + " ") for phrase, _ in items):
    shared.append(color)
    items = [(phrase.partition(" ")[2], place) for phrase, place in items]
  place = items[0][1]
  if place and all(other == place for _, other in items):
    shared.append(place)
    items = [(phrase, None) for phrase, _ in items]
  return items, f", all {' '.join(shared)}" if shared else ""


def _join(items, count_form):
  written = []
  # A repeat is the same thing in the same place, drawn back to back.
  for (phrase, place), run in groupby(items):
    count = len(list(run))
    # Count first, so "ellipses" gets its s before the place is added.
    text = count_form.format(phrase=phrase, count=count) if count > 1 else phrase
    written.append(f"{text} {place}" if place else text)
  shown = written[:_MAX_ITEMS_PER_GROUP]
  hidden = len(written) - len(shown)
  if hidden:
    shown.append(f"and {hidden} more")
  return ", ".join(shown)


def _article(word):
  return "an" if word[0] in "aeiou" else "a"


def _seconds(value):
  rounded = round(value, 2)
  unit = "second" if rounded == 1 else "seconds"
  return f"{rounded:g} {unit}"
