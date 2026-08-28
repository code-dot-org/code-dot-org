from .instrument import Instrument, as_instrument
from .support import actions
from .support.audio import as_samples, read_samples_from_file
from .support.color import Color, as_color
from .support.constants import (
  MAX_DRAW_IMAGE_SIZE,
  MAX_NOTE,
  MAX_PAUSE_SECONDS,
  MAX_TEXT_HEIGHT,
  MAX_TEXT_PIXELS,
  MIN_NOTE,
  MIN_PAUSE_SECONDS,
  MIN_TEXT_HEIGHT,
  THEATER_HEIGHT,
  THEATER_WIDTH,
)
from .support.font import Font, FontStyle, as_font, as_font_style
from .support.image import Image, fit_to_width

_DEFAULT_FONT = Font.SANS
_DEFAULT_FONT_STYLE = FontStyle.NORMAL
_DEFAULT_TEXT_HEIGHT = 20
_DEFAULT_STROKE_WIDTH = 1.0
_MIN_POLYGON_SIDES = 3
_MIN_DRAW_SIZE = 1
_MIN_SHAPE_POINTS = 2


def _validate_duration(method_name, seconds):
  """Bound a note or pause duration.

  Raise here rather than at render time so the traceback points at the
  student's own call. Notes share the pause range: play_note_and_pause() hands
  the same value to both, and the ceiling is what a gif frame delay can hold.
  """
  # Checking a range turns away a nan: every comparison against one is false,
  # so a nan can clear individual checks and reach the frame delay, where rounding 
  # it to an integer raised from the renderer.
  if not MIN_PAUSE_SECONDS <= seconds <= MAX_PAUSE_SECONDS:
    raise ValueError(
      f"{method_name} needs between {MIN_PAUSE_SECONDS} and "
      f"{MAX_PAUSE_SECONDS} seconds, got {seconds}"
    )


def _validate_draw_size(name, value):
  """Bound one dimension draw_image() will scale to.

  Raise here rather than at render time so the traceback points at the
  student's own call. A range rather than two comparisons, so a nan fails too.
  """
  if not _MIN_DRAW_SIZE <= value <= MAX_DRAW_IMAGE_SIZE:
    raise ValueError(
      f"draw_image needs a {name} between {_MIN_DRAW_SIZE} and "
      f"{MAX_DRAW_IMAGE_SIZE}, got {value}"
    )


def _validate_shape_points(points):
  """Check a shape's coordinates at the call rather than at render time.

  Coordinates are one flat run -- x1, y1, x2, y2 and so on -- which reads
  easily as a list of points instead, so that mistake gets its own answer
  rather than a complaint about how many numbers arrived.
  """
  if points and hasattr(points[0], "__len__"):
    raise ValueError(
      "draw_shape needs one flat list of coordinates, x1, y1, x2, y2 and so "
      "on, rather than a list of points"
    )
  if len(points) < 2 * _MIN_SHAPE_POINTS or len(points) % 2 != 0:
    raise ValueError(
      f"draw_shape needs an even number of coordinates, at least "
      f"{2 * _MIN_SHAPE_POINTS} of them for {_MIN_SHAPE_POINTS} points, "
      f"got {len(points)}"
    )


def _validate_text_height(height):
  """Bound the text height.

  Raise here rather than at render time so the traceback points at the
  student's own call. Pillow builds a bitmap as tall as the text before it
  clips anything to the stage, so the height is what that costs. Written as a
  range rather than two comparisons, which is also what turns away a nan.
  """
  if not MIN_TEXT_HEIGHT <= height <= MAX_TEXT_HEIGHT:
    raise ValueError(
      f"set_text_height needs a height between {MIN_TEXT_HEIGHT} and "
      f"{MAX_TEXT_HEIGHT}, got {height}"
    )


def _validate_text_extent(text, height):
  """Bound the bitmap one draw_text() call needs.

  Long text costs what tall text costs: the whole string is drawn into one
  bitmap and only then clipped to the stage, so a line reaching well past the
  edge is paid for in full.
  """
  if len(text) * height * height > MAX_TEXT_PIXELS:
    raise ValueError(
      f"draw_text cannot draw {len(text)} characters at a height of {height}; "
      f"use shorter text, or a smaller text height"
    )


class Scene:
  """A single scene of drawing and audio commands.

  Method calls record actions; play_scenes(scene) later renders them to a gif
  and audio track and plays them on the theater stage.
  """

  def __init__(self):
    self._actions = []
    self._font = _DEFAULT_FONT
    self._font_style = _DEFAULT_FONT_STYLE
    self._text_height = _DEFAULT_TEXT_HEIGHT
    self._text_color = Color("black")
    self._stroke_color = Color("black")
    self._fill_color = Color("black")
    self._stroke_width = _DEFAULT_STROKE_WIDTH

  def get_actions(self):
    return self._actions

  def get_width(self):
    return THEATER_WIDTH

  def get_height(self):
    return THEATER_HEIGHT

  def clear(self, color):
    self._actions.append(actions.ClearScene(as_color(color)))

  def play_sound(self, sound):
    """Play a list of normalized samples, or a WAV file by name."""
    if isinstance(sound, str):
      samples = read_samples_from_file(sound)
    else:
      samples = as_samples(sound)
    self._actions.append(actions.PlaySound(samples))

  def play_note(self, note, seconds, instrument=Instrument.PIANO):
    """Play one instrument note, cut to the given duration.

    The note is a MIDI number: 60 is middle C, and each step is a semitone.
    """
    _validate_duration("play_note", seconds)
    # Only whole semitones are bundled, so round as the drawing calls do; the
    # renderer would otherwise look for a note file that cannot exist and skip
    # the note without a word.
    note = int(round(note))
    if note < MIN_NOTE or note > MAX_NOTE:
      raise ValueError(
        f"play_note needs a note between {MIN_NOTE} and {MAX_NOTE}, got {note}"
      )
    self._actions.append(actions.PlayNote(as_instrument(instrument), note, seconds))

  def play_note_and_pause(self, note, seconds, instrument=Instrument.PIANO):
    self.play_note(note, seconds, instrument)
    self.pause(seconds)

  def pause(self, seconds):
    _validate_duration("pause", seconds)
    self._actions.append(actions.Pause(seconds))

  def draw_image(self, image, x, y, size=None, width=None, height=None, rotation=0.0):
    """Draw an Image (or a file by name) at (x, y).

    Provide size to set the width and scale height proportionally, or provide
    both width and height to stretch the image.
    """
    image_copy = Image(image)
    if size is not None:
      _validate_draw_size("size", size)
      # size sets the width and scales the height by the image's aspect ratio,
      # so a tall image can cross the ceiling on a size that is under it.
      _, scaled_height = fit_to_width(
        image_copy.get_width(), image_copy.get_height(), size
      )
      if scaled_height > MAX_DRAW_IMAGE_SIZE:
        raise ValueError(
          f"draw_image with size={size} would make this image {scaled_height} "
          f"tall, and the limit is {MAX_DRAW_IMAGE_SIZE}"
        )
      self._actions.append(
        actions.DrawImage(image_copy, x, y, size, None, None, rotation)
      )
    elif width is not None and height is not None:
      _validate_draw_size("width", width)
      _validate_draw_size("height", height)
      self._actions.append(
        actions.DrawImage(image_copy, x, y, None, width, height, rotation)
      )
    else:
      raise ValueError("draw_image needs either size, or both width and height")

  def set_text_style(self, font, style):
    # Coerce both before assigning either, so a call that throws leaves the
    # text style as it was rather than half-applied.
    font, style = as_font(font), as_font_style(style)
    self._font = font
    self._font_style = style

  def set_text_height(self, height):
    _validate_text_height(height)
    self._text_height = height

  def set_text_color(self, color):
    self._text_color = as_color(color)

  def draw_text(self, text, x, y, rotation=0.0):
    _validate_text_extent(text, self._text_height)
    self._actions.append(
      actions.DrawText(
        text, x, y, rotation, self._text_height, self._font, self._font_style,
        self._text_color,
      )
    )

  def draw_line(self, start_x, start_y, end_x, end_y):
    self._actions.append(
      actions.DrawLine(start_x, start_y, end_x, end_y, self._stroke_color, self._stroke_width)
    )

  def draw_regular_polygon(self, x, y, sides, radius):
    if sides < _MIN_POLYGON_SIDES:
      raise ValueError(
        f"draw_regular_polygon needs at least {_MIN_POLYGON_SIDES} sides, got {sides}"
      )
    self._actions.append(
      actions.DrawPolygon(
        x, y, sides, radius, self._stroke_color, self._fill_color, self._stroke_width
      )
    )

  def draw_shape(self, points, close):
    points = list(points)
    _validate_shape_points(points)
    self._actions.append(
      actions.DrawShape(
        points, close, self._stroke_color, self._fill_color, self._stroke_width
      )
    )

  def draw_ellipse(self, x, y, width, height):
    self._actions.append(
      actions.DrawEllipse(
        x, y, width, height, self._stroke_color, self._fill_color, self._stroke_width
      )
    )

  def draw_rectangle(self, x, y, width, height):
    self._actions.append(
      actions.DrawRectangle(
        x, y, width, height, self._stroke_color, self._fill_color, self._stroke_width
      )
    )

  def set_stroke_width(self, width):
    self._stroke_width = width

  def set_fill_color(self, color):
    self._fill_color = as_color(color)

  def set_stroke_color(self, color):
    self._stroke_color = as_color(color)

  def remove_stroke_color(self):
    self._stroke_color = None

  def remove_fill_color(self):
    self._fill_color = None
