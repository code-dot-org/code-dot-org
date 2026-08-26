import io
import math
import struct

from PIL import Image as PILImage
from PIL import ImageDraw

from .actions import UNSPECIFIED, SceneActionType
from .audio import AudioWriter
from .constants import (
  MAX_AUDIO_SECONDS,
  MAX_FRAMES,
  MAX_GIF_BYTES,
  SAMPLE_RATE,
  THEATER_HEIGHT,
  THEATER_WIDTH,
)
from .fonts import load_font
from .image import fit_to_width
from .instrument_samples import load_note_samples


class GifTooLargeError(Exception):
  """Raised when the rendered gif exceeds the size ceiling."""


class TooManyFramesError(Exception):
  """Raised when a scene pauses more times than the frame ceiling allows."""


class PauseTooLongError(Exception):
  """Raised when one picture is held longer than a gif delay can express."""


class AudioTooLongError(Exception):
  """Raised when a scene's audio timeline exceeds the length ceiling."""


def render(actions):
  """Execute a scene's action list into (gif_bytes, wav_bytes).

  Drawing accumulates on a single canvas, each pause snapshots a gif frame, and
  audio is blended onto one timeline. wav_bytes is None when the program
  produced no audio.
  """
  durations = _frame_durations(actions)
  if len(durations) > MAX_FRAMES:
    raise TooManyFramesError(
      f"The animation has too many frames; the limit is {MAX_FRAMES}"
    )
  if _audio_length_bound(actions) > MAX_AUDIO_SECONDS:
    raise AudioTooLongError(
      f"The audio is too long; the limit is {MAX_AUDIO_SECONDS} seconds"
    )
  gif_bytes = _encode_gif(_iter_frames(actions), durations)
  return gif_bytes, _render_audio(actions)


def gif_duration_ms(actions):
  """How long the gif rendered from these actions runs, in milliseconds.

  The host has no other way to know: an <img> reports nothing about the
  animation it is playing, and the theater's gifs carry no loop extension, so
  they run through their frames once and hold the last one.
  """
  return sum(_frame_durations(actions))


def _pause_milliseconds(seconds):
  """A pause in whole milliseconds, rounded to a centisecond.

  A gif frame delay counts centiseconds and Pillow truncates whatever it is
  handed down to that. Rounding here, and advancing the audio cursor by the
  same figure, is what keeps sound and picture together: a 0.125 s pause is
  0.12 s of video either way, so the error cannot accumulate.
  """
  return int(round(seconds * 100)) * 10


def _frame_durations(actions):
  """Frame delays in milliseconds, ending with the closing frame's zero.

  Delays depend only on the pauses, never on the drawing, so the whole list
  can be built up front. That is what lets the frame ceiling turn a scene away
  before any drawing is done.
  """
  durations = [
    _pause_milliseconds(action.seconds)
    for action in actions
    if action.type is SceneActionType.PAUSE
  ]
  # Final frame with no trailing delay.
  durations.append(0)
  return durations


def _audio_length_bound(actions):
  """Upper bound on the audio timeline in seconds, loading no samples.

  Follows the same cursor AudioWriter keeps: pauses advance it, and each sound
  reaches from wherever it sits. A note is bounded by its requested duration,
  since truncate_samples only ever shortens. Pauses past the last sound never
  become samples, so they do not count. Bounding this without decoding a note
  is what lets an impossible timeline be turned away before any drawing.
  """
  cursor = 0.0
  end = 0.0
  for action in actions:
    kind = action.type
    if kind is SceneActionType.PAUSE:
      cursor += _pause_milliseconds(action.seconds) / 1000
    elif kind is SceneActionType.PLAY_SOUND:
      end = max(end, cursor + len(action.samples) / SAMPLE_RATE)
    elif kind is SceneActionType.PLAY_NOTE:
      end = max(end, cursor + action.seconds)
  return end


def _render_audio(actions):
  """Blend the scene's audio onto one timeline; None when there is no audio.

  Like the frame delays, this depends only on the audio and pause actions, so
  it can be built without touching the canvas.
  """
  audio = AudioWriter()
  for action in actions:
    kind = action.type
    if kind is SceneActionType.PLAY_SOUND:
      audio.write_audio_samples(action.samples)
    elif kind is SceneActionType.PLAY_NOTE:
      samples = load_note_samples(action.instrument, action.note)
      if samples is not None:
        audio.write_audio_samples(samples, action.seconds)
    elif kind is SceneActionType.PAUSE:
      audio.add_delay_milliseconds(_pause_milliseconds(action.seconds))
  return audio.to_wav_bytes()


def _iter_frames(actions):
  """Yield each gif frame in turn, as RGB.

  Yielding rather than collecting leaves one frame alive at a time on this
  side; Pillow still holds a palette copy of every frame while it encodes.
  The canvas itself stays RGBA, since compositing needs the alpha channel.
  """
  canvas = PILImage.new("RGBA", (THEATER_WIDTH, THEATER_HEIGHT), (255, 255, 255, 255))
  draw = ImageDraw.Draw(canvas, "RGBA")

  for action in actions:
    kind = action.type
    if kind is SceneActionType.CLEAR_SCENE:
      _clear(canvas, action.color)
    elif kind is SceneActionType.PAUSE:
      yield canvas.convert("RGB")
    elif kind is SceneActionType.DRAW_IMAGE:
      _draw_image(canvas, action)
    elif kind is SceneActionType.DRAW_TEXT:
      _draw_text(canvas, action)
    elif kind is SceneActionType.DRAW_LINE:
      _draw_line(draw, action)
    elif kind is SceneActionType.DRAW_POLYGON:
      _draw_regular_polygon(draw, action)
    elif kind is SceneActionType.DRAW_SHAPE:
      _draw_shape(draw, action)
    elif kind is SceneActionType.DRAW_ELLIPSE:
      _draw_ellipse(draw, action)
    elif kind is SceneActionType.DRAW_RECTANGLE:
      _draw_rectangle(draw, action)

  yield canvas.convert("RGB")


def _clear(canvas, color):
  r, g, b = color.to_rgb_tuple()
  canvas.paste((r, g, b, 255), (0, 0, canvas.width, canvas.height))


def _draw_image(canvas, action):
  source = action.image.to_pil()
  # resize and paste reject floats, so round here rather than in every caller.
  x = int(round(action.x))
  y = int(round(action.y))
  if action.size != UNSPECIFIED:
    width, height = fit_to_width(source.width, source.height, action.size)
  else:
    width = int(round(action.width))
    height = int(round(action.height))
  scaled = source.resize((max(width, 1), max(height, 1)), PILImage.LANCZOS)
  if action.rotation:
    layer = PILImage.new("RGBA", (canvas.width, canvas.height), (0, 0, 0, 0))
    layer.paste(scaled, (x, y), scaled)
    # Rotate clockwise about the image's top-left corner. Pillow rotates
    # counterclockwise, hence the negated angle. rotate rejects LANCZOS, so
    # bicubic is the smoothest filter available here.
    layer = layer.rotate(-action.rotation, center=(x, y), resample=PILImage.BICUBIC)
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
  layer = layer.rotate(
    -action.rotation, center=(action.x, action.y), resample=PILImage.BICUBIC
  )
  canvas.alpha_composite(layer)


def _draw_line(draw, action):
  # Pillow falls back to its default ink, opaque white, when it is handed no
  # color at all, so a removed color has to skip the call rather than pass None.
  if action.color is None:
    return
  draw.line(
    [action.start_x, action.start_y, action.end_x, action.end_y],
    fill=_rgba(action.color),
    width=_stroke(action.stroke_width),
  )


def _draw_ellipse(draw, action):
  if action.stroke_color is None and action.fill_color is None:
    return
  draw.ellipse(
    [action.x, action.y, action.x + action.width, action.y + action.height],
    fill=_rgba(action.fill_color),
    outline=_rgba(action.stroke_color),
    width=_stroke(action.stroke_width),
  )


def _draw_rectangle(draw, action):
  if action.stroke_color is None and action.fill_color is None:
    return
  draw.rectangle(
    [action.x, action.y, action.x + action.width, action.y + action.height],
    fill=_rgba(action.fill_color),
    outline=_rgba(action.stroke_color),
    width=_stroke(action.stroke_width),
  )


def _draw_regular_polygon(draw, action):
  if action.stroke_color is None and action.fill_color is None:
    return
  # range rejects floats, and Scene has already rejected anything under 3.
  sides = int(round(action.sides))
  theta = 2 * math.pi / sides
  points = []
  for i in range(sides):
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
  """Encode an iterator of RGB frames. Pillow pulls from append_images lazily,
  so the frames are drawn one at a time rather than all up front.
  """
  first = next(frames)
  buffer = io.BytesIO()
  try:
    first.save(
      buffer,
      format="GIF",
      save_all=True,
      append_images=frames,
      duration=durations,
      disposal=1,
    )
  except struct.error as error:
    # Pillow drops a frame identical to the one before it and adds its delay to
    # that earlier frame instead. Individual pauses are clamped, but a long run
    # of them with no drawing in between accumulates past the 16-bit delay field.
    raise PauseTooLongError(
      "The animation stays on one picture for too long; draw something between "
      "the pauses, or make them shorter"
    ) from error
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
