from .painter import Painter as Painter
# The functions below act on an implicit default painter, so student code can
# call move() and paint() without constructing a Painter. They live in the
# painter submodule, which means `from neighborhood import painter` gives a
# module supporting painter.move(). Never bind the name `painter` here: it would
# shadow the submodule for that import while `import neighborhood.painter` kept
# returning the module, leaving two different `painter`s in one program.
from .painter import move as move
from .painter import turn_left as turn_left
from .painter import paint as paint
from .painter import scrape_paint as scrape_paint
from .painter import take_paint as take_paint
from .painter import set_paint as set_paint
from .painter import get_my_paint as get_my_paint
from .painter import has_paint as has_paint
from .painter import can_move as can_move
from .painter import is_on_paint as is_on_paint
from .painter import is_on_bucket as is_on_bucket
from .painter import get_color as get_color
from .painter import is_facing_north as is_facing_north
from .painter import is_facing_east as is_facing_east
from .painter import is_facing_south as is_facing_south
from .painter import is_facing_west as is_facing_west
from .painter import get_x as get_x
from .painter import get_y as get_y
from .painter import get_direction as get_direction
from .painter import hide_painter as hide_painter
from .painter import show_painter as show_painter
from .painter import hide_buckets as hide_buckets
from .painter import show_buckets as show_buckets
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
