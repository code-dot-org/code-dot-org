from .support import actions
from .support.actions import UNSPECIFIED
from .support.color import Color, as_color
from .support.constants import MIN_PAUSE_SECONDS, THEATER_HEIGHT, THEATER_WIDTH
from .support.font import Font, FontStyle
from .support.image import Image

_DEFAULT_FONT = Font.SANS
_DEFAULT_FONT_STYLE = FontStyle.NORMAL
_DEFAULT_TEXT_HEIGHT = 20
_DEFAULT_STROKE_WIDTH = 1.0
_MIN_POLYGON_SIDES = 3


class Scene:
  """A single scene of drawing commands.

  Method calls record actions; play_scenes(scene) later renders them to a gif
  and displays it on the theater stage.
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

  def pause(self, seconds):
    self._actions.append(actions.Pause(max(seconds, MIN_PAUSE_SECONDS)))

  def draw_image(self, image, x, y, size=None, width=None, height=None, rotation=0.0):
    """Draw an Image (or a file by name) at (x, y).

    Provide size to set the width and scale height proportionally, or provide
    both width and height to stretch the image.
    """
    image_copy = Image(image)
    if size is not None:
      self._actions.append(
        actions.DrawImage(image_copy, x, y, size, UNSPECIFIED, UNSPECIFIED, rotation)
      )
    elif width is not None and height is not None:
      self._actions.append(
        actions.DrawImage(image_copy, x, y, UNSPECIFIED, width, height, rotation)
      )
    else:
      raise ValueError("draw_image needs either size, or both width and height")

  def set_text_style(self, font, style):
    self._font = font
    self._font_style = style

  def set_text_height(self, height):
    self._text_height = height

  def set_text_color(self, color):
    self._text_color = as_color(color)

  def draw_text(self, text, x, y, rotation=0.0):
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
    self._actions.append(
      actions.DrawShape(
        list(points), close, self._stroke_color, self._fill_color, self._stroke_width
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
