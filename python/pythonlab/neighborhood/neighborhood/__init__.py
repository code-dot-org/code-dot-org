from .painter import Painter as Painter
# The functions below act on an implicit default painter, so student code can
# call move() and paint() without constructing a Painter. They live in the
# painter submodule, which means `from neighborhood import painter` gives a
# module supporting painter.move(). Never bind the name `painter` here: it would
# shadow the submodule for that import while `import neighborhood.painter` kept
# returning the module, leaving two different `painter`s in one program.
from .painter import (
  move, turn_left,
  paint, scrape_paint, take_paint, set_paint, get_my_paint, has_paint,
  can_move, is_on_paint, is_on_bucket, get_color,
  is_facing_north, is_facing_east, is_facing_south, is_facing_west,
  get_x, get_y, get_direction,
  hide_painter, show_painter, hide_buckets, show_buckets,
)
from .neighborhood_log import NeighborhoodLog as NeighborhoodLog
from .painter_log import PainterLog as PainterLog
from .painter_event import PainterEvent as PainterEvent
from .position import Position as Position
# We export World so we can clear the world in pythonlab_setup and
# handle setting the context type in unittest_runner
from .support.world import World as World
# We export NeighborhoodContextType so we can set the context type in unittest_runner
from .support.neighborhood_context_type import NeighborhoodContextType as NeighborhoodContextType
from .support.neighborhood_tracker import NeighborhoodTracker as NeighborhoodTracker

# `from neighborhood import *` is a supported way for student code to reach the
# painter functions, so it lists only what students use. The harness names above
# stay importable by name.
__all__ = [
  'Painter',
  'painter',
  'move',
  'turn_left',
  'paint',
  'scrape_paint',
  'take_paint',
  'set_paint',
  'get_my_paint',
  'has_paint',
  'can_move',
  'is_on_paint',
  'is_on_bucket',
  'get_color',
  'is_facing_north',
  'is_facing_east',
  'is_facing_south',
  'is_facing_west',
  'get_x',
  'get_y',
  'get_direction',
  'hide_painter',
  'show_painter',
  'hide_buckets',
  'show_buckets',
]
