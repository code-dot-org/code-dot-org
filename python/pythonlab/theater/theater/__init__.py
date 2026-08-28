from .instrument import Instrument as Instrument
# The module is playback.py rather than play.py because this package exports a
# play() function: binding it here would shadow a `play` submodule for
# `import theater.play`, leaving the attribute and sys.modules disagreeing.
from .playback import play_scenes as play_scenes
from .scene import Scene as Scene
# The functions below act on an implicit default scene, so student code can call
# draw_ellipse() and play() without constructing a Scene. They live in the scene
# submodule, which means `from theater import scene` gives a module supporting
# scene.draw_ellipse(). Never bind the name `scene` here: it would shadow the
# submodule for that import while `import theater.scene` kept returning the
# module, leaving two different `scene`s in one program.
from .scene import (
  play, pause,
  clear, get_width, get_height,
  draw_line, draw_rectangle, draw_ellipse, draw_regular_polygon, draw_shape,
  set_stroke_color, set_fill_color, set_stroke_width,
  remove_stroke_color, remove_fill_color,
  draw_text, set_text_color, set_text_height, set_text_style,
  draw_image,
  play_note, play_note_and_pause, play_sound,
)
# Exported so pythonlab_setup can drop the default scene between runs.
from .scene import reset_default_scene as reset_default_scene
from .support.color import Color as Color
from .support.font import Font as Font
from .support.font import FontStyle as FontStyle
from .support.image import Image as Image

# `from theater import *` is a supported way for student code to reach the scene
# functions, so it lists only what students use. The harness names above stay
# importable by name.
__all__ = [
  'Scene',
  'scene',
  'play_scenes',
  'Color',
  'Font',
  'FontStyle',
  'Image',
  'Instrument',
  'play',
  'pause',
  'clear',
  'get_width',
  'get_height',
  'draw_line',
  'draw_rectangle',
  'draw_ellipse',
  'draw_regular_polygon',
  'draw_shape',
  'set_stroke_color',
  'set_fill_color',
  'set_stroke_width',
  'remove_stroke_color',
  'remove_fill_color',
  'draw_text',
  'set_text_color',
  'set_text_height',
  'set_text_style',
  'draw_image',
  'play_note',
  'play_note_and_pause',
  'play_sound',
]
