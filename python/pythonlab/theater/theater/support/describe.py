"""Turn a scene's actions into words, for a student who cannot see the stage."""

import os
from dataclasses import dataclass

from .actions import SceneActionType
from .color import _NAMED_COLORS
from .constants import SAMPLE_RATE
from .renderer import _audio_length_bound, _frame_durations, _stroke

_NOTE_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")

_MAX_ITEMS_PER_GROUP = 8
_MAX_FRAMES_SHOWN = 50

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
      groups[_GROUPS[action.type]].append(phrase)
  for label, items in groups.items():
    if items:
      name = f"Added {label.lower()}" if onscreen and label in _PERSISTENT else label
      lines.append(f"{name}: {_join(items, _COUNT_FORMS.get(label))}.")
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
    return os.path.basename(filename) if filename else "a picture made in code"
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
  """Name a shape by its fill, adding an outline wide enough to show."""
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


def _join(items, count_form):
  if count_form:
    items = _with_counts(items, count_form)
  shown = items[:_MAX_ITEMS_PER_GROUP]
  hidden = len(items) - len(shown)
  if hidden:
    shown.append(f"and {hidden} more")
  return ", ".join(shown)


def _with_counts(items, count_form):
  counted = []
  for item in items:
    if counted and counted[-1][0] == item:
      counted[-1][1] += 1
    else:
      counted.append([item, 1])
  return [
    item if count == 1 else count_form.format(phrase=item, count=count)
    for item, count in counted
  ]


def _article(word):
  return "an" if word[0] in "aeiou" else "a"


def _seconds(value):
  rounded = round(value, 2)
  unit = "second" if rounded == 1 else "seconds"
  return f"{rounded:g} {unit}"
