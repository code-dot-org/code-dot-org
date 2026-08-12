import io
import math

from PIL import Image as PILImage
from PIL import ImageDraw

from .actions import UNSPECIFIED, SceneActionType
from .constants import (
  MAX_GIF_BYTES,
  MIN_PAUSE_SECONDS,
  THEATER_HEIGHT,
  THEATER_WIDTH,
)
from .fonts import load_font


class GifTooLargeError(Exception):
  """Raised when the rendered gif exceeds the size ceiling."""


def render(actions):
  """Execute a scene's action list into gif bytes.

  Drawing accumulates on a single canvas and each pause snapshots a gif frame.
  """
  canvas = PILImage.new("RGBA", (THEATER_WIDTH, THEATER_HEIGHT), (255, 255, 255, 255))
  draw = ImageDraw.Draw(canvas, "RGBA")

  frames = []
  durations = []

  for action in actions:
    kind = action.type
    if kind is SceneActionType.CLEAR_SCENE:
      _clear(canvas, action.color)
    elif kind is SceneActionType.PAUSE:
      seconds = max(action.seconds, MIN_PAUSE_SECONDS)
      frames.append(canvas.copy())
      durations.append(int(round(seconds * 1000)))
    elif kind is SceneActionType.DRAW_IMAGE:
      _draw_image(canvas, action)
    elif kind is SceneActionType.DRAW_TEXT:
      _draw_text(canvas, action)
    elif kind is SceneActionType.DRAW_LINE:
      draw.line(
        [action.start_x, action.start_y, action.end_x, action.end_y],
        fill=_rgba(action.color),
        width=_stroke(action.stroke_width),
      )
    elif kind is SceneActionType.DRAW_POLYGON:
      _draw_regular_polygon(draw, action)
    elif kind is SceneActionType.DRAW_SHAPE:
      _draw_shape(draw, action)
    elif kind is SceneActionType.DRAW_ELLIPSE:
      draw.ellipse(
        [action.x, action.y, action.x + action.width, action.y + action.height],
        fill=_rgba(action.fill_color),
        outline=_rgba(action.stroke_color),
        width=_stroke(action.stroke_width),
      )
    elif kind is SceneActionType.DRAW_RECTANGLE:
      draw.rectangle(
        [action.x, action.y, action.x + action.width, action.y + action.height],
        fill=_rgba(action.fill_color),
        outline=_rgba(action.stroke_color),
        width=_stroke(action.stroke_width),
      )

  # Final frame with no trailing delay.
  frames.append(canvas.copy())
  durations.append(0)

  return _encode_gif(frames, durations)


def _clear(canvas, color):
  r, g, b = color.to_rgb_tuple()
  canvas.paste((r, g, b, 255), (0, 0, canvas.width, canvas.height))


def _draw_image(canvas, action):
  source = action.image.to_pil()
  # resize and paste reject floats, so round here rather than in every caller.
  x = int(round(action.x))
  y = int(round(action.y))
  if action.size != UNSPECIFIED:
    width = int(round(action.size))
    height = int(round(source.height * (width / source.width)))
  else:
    width = int(round(action.width))
    height = int(round(action.height))
  scaled = source.resize((max(width, 1), max(height, 1)))
  if action.rotation:
    layer = PILImage.new("RGBA", (canvas.width, canvas.height), (0, 0, 0, 0))
    layer.paste(scaled, (x, y), scaled)
    # Rotate clockwise about the image's top-left corner. Pillow rotates
    # counterclockwise, hence the negated angle.
    layer = layer.rotate(-action.rotation, center=(x, y))
    canvas.alpha_composite(layer)
  else:
    canvas.paste(scaled, (x, y), scaled)


def _draw_text(canvas, action):
  font = load_font(action.font, action.font_style, action.height)
  fill = _rgba(action.color)
  if not action.rotation:
    draw = ImageDraw.Draw(canvas, "RGBA")
    # anchor 'ls' = left baseline, so (x, y) is the text's baseline origin.
    draw.text((action.x, action.y), action.text, fill=fill, font=font, anchor="ls")
    return
  layer = PILImage.new("RGBA", (canvas.width, canvas.height), (0, 0, 0, 0))
  layer_draw = ImageDraw.Draw(layer)
  layer_draw.text((action.x, action.y), action.text, fill=fill, font=font, anchor="ls")
  layer = layer.rotate(-action.rotation, center=(action.x, action.y))
  canvas.alpha_composite(layer)


def _draw_regular_polygon(draw, action):
  if action.stroke_color is None and action.fill_color is None:
    return
  theta = 2 * math.pi / action.sides
  points = []
  for i in range(action.sides):
    px = int(round(math.cos(theta * i) * action.radius + action.x))
    py = int(round(math.sin(theta * i) * action.radius + action.y))
    points.append((px, py))
  draw.polygon(
    points,
    fill=_rgba(action.fill_color),
    outline=_rgba(action.stroke_color),
    width=_stroke(action.stroke_width),
  )


def _draw_shape(draw, action):
  points = action.points
  if len(points) % 2 != 0 or len(points) < 4:
    raise ValueError("A shape needs an even number of coordinates, at least 4")
  pairs = [(points[i], points[i + 1]) for i in range(0, len(points), 2)]
  if action.close:
    if action.stroke_color is None and action.fill_color is None:
      return
    draw.polygon(
      pairs,
      fill=_rgba(action.fill_color),
      outline=_rgba(action.stroke_color),
      width=_stroke(action.stroke_width),
    )
  elif action.stroke_color is not None:
    draw.line(pairs, fill=_rgba(action.stroke_color), width=_stroke(action.stroke_width))


def _encode_gif(frames, durations):
  rgb_frames = [frame.convert("RGB") for frame in frames]
  buffer = io.BytesIO()
  rgb_frames[0].save(
    buffer,
    format="GIF",
    save_all=True,
    append_images=rgb_frames[1:],
    duration=durations,
    disposal=1,
  )
  data = buffer.getvalue()
  if len(data) > MAX_GIF_BYTES:
    raise GifTooLargeError("The generated video is too large")
  return data


def _rgba(color):
  if color is None:
    return None
  r, g, b = color.to_rgb_tuple()
  return (r, g, b, 255)


def _stroke(stroke_width):
  return max(1, int(round(stroke_width)))
