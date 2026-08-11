from .support.neighborhood_signal_key import NeighborhoodSignalKey
from .support.signal_message_type import SignalMessageType
from .support.neighborhood_signal_message import NeighborhoodSignalMessage
from .support.world import World
from .support.direction import Direction
from .support.neighborhood_runtime_exception import NeighborhoodRuntimeException
from .support.exception_key import ExceptionKey
from .support.neighborhood_tracker import NeighborhoodTracker

class Painter:
  LARGE_GRID_SIZE = 20
  last_id = 0 # Used to assign unique id to Painter instance.

  def __init__(self, x=0, y=0, direction='east', paint=None):
    """
    Initialize the painter with the given x, y, direction, and paint.

    Args:
      x (int): The x-coordinate of the painter. Defaults to 0.
      y (int): The y-coordinate of the painter. Defaults to 0.
      direction (str): The direction the painter is facing. Defaults to "East".
      paint (int | None): The amount of paint the painter has. Defaults to None
        and assigned an int based on param value.
    """
    self.x = x
    self.y = y
    self.direction = Direction(direction)
    if paint is None:
      self.remaining_paint = 0
      could_have_infinite_paint = True
    else:
      self.remaining_paint = paint
      could_have_infinite_paint = False
    # Create a reference to the world singleton
    self.world = World()
    # If the grid is not set, set it from the default file
    if (self.world.grid is None):
      self.world.set_grid_from_file()
    Painter.last_id += 1
    self.id = f"painter-{Painter.last_id}"
    init_detail = self._get_initialization_message_detail(x, y, direction, paint)
    self._send_signal(NeighborhoodSignalKey.INITIALIZE_PAINTER, init_detail)      
    self.has_infinite_paint = self.world.grid.get_size() >= Painter.LARGE_GRID_SIZE if could_have_infinite_paint else False

  def turn_left(self):
    """
    Turn the painter one compass direction left (i.e. North -> West).
    """
    self.direction.turn_left()
    self._send_signal(NeighborhoodSignalKey.TURN_LEFT, {'direction': self.direction.value})

  def move(self):
    """
    Move the painter one square forward in the direction it is facing.
    """
    if self._is_valid_movement(self.direction):
      if self.direction.is_north():
        self.y-=1
      elif self.direction.is_south():
        self.y+=1
      elif self.direction.is_east():
        self.x+=1
      else:
        self.x-=1
      self._send_signal(NeighborhoodSignalKey.MOVE, {'direction': self.direction.value})
    else:
      raise NeighborhoodRuntimeException(ExceptionKey.INVALID_MOVE)
    
  def paint(self, color):
    """
    Paint the square the painter is on with the given color.

    Args:
      color (str): The color to paint the square.
    """
    if self.has_paint():
      self.world.grid.get_square(self.x, self.y).set_color(color)
      self.remaining_paint-=1
      self._send_signal(NeighborhoodSignalKey.PAINT, {'color': color})
    else:
      print("There is no more paint in the painter's bucket.")

  def scrape_paint(self):
    """
    Removes all the paint off the square the painter is on.
    """
    self.world.grid.get_square(self.x, self.y).remove_paint()
    self._send_signal(NeighborhoodSignalKey.REMOVE_PAINT)

  def hide_painter(self):
    """
    Hides the painter on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.HIDE_PAINTER)

  def show_painter(self):
    """
    Shows the painter on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.SHOW_PAINTER)

  def take_paint(self):
    """
    The Painter adds a single unit of paint to their personal bucket.
    The counter on the bucket on the screen goes down.
    If the painter is not standing on a paint bucket, nothing happens.
    """
    current_square = self.world.grid.get_square(self.x, self.y)
    if current_square.contains_paint():
      current_square.collect_paint()
      self.remaining_paint+=1
      self._send_signal(NeighborhoodSignalKey.TAKE_PAINT)
    else:
      print("There is no paint to collect here.")

  def show_buckets(self):
    """
    Show all the paint buckets on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.SHOW_BUCKETS)

  def hide_buckets(self):
    """
    Hide all the paint buckets on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.HIDE_BUCKETS)

  def get_my_paint(self):
    """
    Returns the amount of paint the painter has.
    """
    return self.remaining_paint

  def is_on_paint(self):
    """
    Returns:
      True if there is paint in the square where the painter is standing
    """
    is_on_paint = self.world.grid.get_square(self.x, self.y).has_color()
    self._send_boolean_message(NeighborhoodSignalKey.IS_ON_PAINT, is_on_paint)
    return is_on_paint
  
  def is_on_bucket(self):
    """
    Returns:
      True if there is a paint bucket in the square where the painter is standing
    """
    is_on_bucket = self.world.grid.get_square(self.x, self.y).contains_paint()
    self._send_boolean_message(NeighborhoodSignalKey.IS_ON_BUCKET, is_on_bucket)
    return is_on_bucket
  
  def has_paint(self):
    """
    Returns:
      True if the painter has any paint in their personal bucket
    """
    has_paint = self.has_infinite_paint or self.remaining_paint > 0
    self._send_boolean_message(NeighborhoodSignalKey.HAS_PAINT, has_paint)
    return has_paint
  
  def can_move(self, direction=None):
    """
    Returns:
      True if the painter can move in the given direction
    Args:
      direction (str): The direction of movement that is being checked
    """
    can_move = self._is_valid_movement(self.direction if direction is None else Direction(direction))
    self._send_boolean_message(NeighborhoodSignalKey.CAN_MOVE, can_move)
    return can_move
  
  def get_color(self):
    """
    Returns:
      The color of the square where the painter is standing
    """
    return self.world.grid.get_square(self.x, self.y).get_color()
  
  def is_facing_north(self):
    """
    Returns:
      True if the painter is facing North
    """
    return self.direction.is_north()
  
  def is_facing_east(self):
    """
    Returns:
      True if the painter is facing East
    """
    return self.direction.is_east()
  
  def is_facing_south(self):
    """
    Returns:
      True if the painter is facing South
    """
    return self.direction.is_south()
  
  def is_facing_west(self):
    """
    Returns:
      True if the painter is facing West
    """
    return self.direction.is_west()
  
  def get_x(self):
    """
    Returns:
      The x-coordinate of the painter's current position
    """
    return self.x
  
  def get_y(self):
    """
    Returns:
      The y-coordinate of the painter's current position
    """
    return self.y
  
  def get_direction(self):
    """
    Returns:
      The direction the painter is facing
    """
    return self.direction.value
  
  def set_paint(self, paint):
    """
    Set the amount of paint in the painter's bucket. Does nothing if paint is negative.

    Args:
      paint (int): The amount of paint that should be in the painter's bucket.
    """
    if self.has_infinite_paint:
      return
    if paint >= 0:
      self.remaining_paint = paint
    else:
      print("Paint amount must not be a negative number.")

  def _get_initialization_message_detail(self, x, y, direction, paint):
    return {
              'direction': direction,
              'x': x,
              'y': y,
              'paint': paint,
            }

  def _send_signal(self, signal_key, detail=None, is_boolean_message=False):
    """
    Helper method to create and print a signal message.

    Args:
      signal_key (NeighborhoodSignalKey): The key for the signal message.
      detail (dict): Optional additional details for the signal message.
    """
    detail = detail or {}
    detail['id'] = self.id
    signal_message = NeighborhoodSignalMessage(SignalMessageType.NEIGHBORHOOD, signal_key, detail)
    signal_message.send(self.world.context_type, NeighborhoodTracker(self.world), is_boolean_message)

  def _send_boolean_message(self, signal_key, result):
    """
    Sends a boolean message with the specified signal key and result.
    Args:
      signal_key (NeighborhoodSignalKey): The signal key for the message.
      result (bool): The boolean result to include in the message.
    """
    detail = {
        "boolean_result": str(result)  # Convert the boolean to a string.
    }
    self._send_signal(signal_key, detail, True)
    
  def _is_valid_movement(self, direction):
    """
    Helper method to check if the painter can move in the direction of direction).
    Args:
      direction (Direction): The direction to check
    """
    if direction.is_north():
      return self.world.grid.valid_location(self.x, self.y - 1)
    elif direction.is_south():
      return self.world.grid.valid_location(self.x, self.y + 1)
    elif direction.is_west():
      return self.world.grid.valid_location(self.x - 1, self.y)
    elif direction.is_east():
      return self.world.grid.valid_location(self.x + 1, self.y)
    else:
      # Invalid movement
      return False


# The functions below let student code skip constructing a Painter:
#
#   from neighborhood import painter   ->  painter.move()
#   from neighborhood import move      ->  move()
#
# They all act on one implicit painter, which starts at (0, 0) facing east.

_default_painter = None
# The world the cached painter was built against, as (generation, grid).
_default_painter_world = None

def _current_world_key(world):
  # The grid is part of the key as a backstop: a future path that swaps the grid
  # without going through World's setters still invalidates the painter.
  return (world.generation, world.grid)

def _get_default_painter():
  """
  Returns the implicit painter the functions below act on, creating it if there
  isn't a usable one yet.

  Creation is deferred until the first call rather than done at import, because
  NeighborhoodLog lists painters in the order they were constructed and
  validation code indexes into that list. A painter built at import time would
  take the first slot in every program that imports this package.

  The painter is rebuilt whenever the world's grid or context type changes,
  since either means we are in a new program. A stale painter would hold
  coordinates from a grid that no longer exists, and would emit no
  INITIALIZE_PAINTER signal for the tracker watching the new one, so every
  signal it sent would be discarded.
  """
  global _default_painter, _default_painter_world
  world = World()
  if _default_painter is None or _default_painter_world != _current_world_key(world):
    _default_painter = Painter()
    # A no-argument Painter only gets paint on grids 20x20 and larger, which
    # almost no level uses. There is no constructor call here to pass an amount
    # to, so give the implicit painter paint unconditionally.
    _default_painter.has_infinite_paint = True
    # Painter() loads the grid if the world had none, so read the key back
    # after constructing rather than before.
    _default_painter_world = _current_world_key(world)
  return _default_painter

def move():
  """
  Move one square forward in the direction the painter is facing.
  """
  _get_default_painter().move()

def turn_left():
  """
  Turn one compass direction left (i.e. North -> West).
  """
  _get_default_painter().turn_left()

def paint(color):
  """
  Paint the current square with the given color.

  Args:
    color (str): The color to paint the square.
  """
  _get_default_painter().paint(color)

def scrape_paint():
  """
  Remove all the paint from the current square.
  """
  _get_default_painter().scrape_paint()

def take_paint():
  """
  Add a single unit of paint from the current square's bucket to the painter's
  personal bucket.
  """
  _get_default_painter().take_paint()

def set_paint(paint):
  """
  Set the amount of paint in the painter's bucket. Does nothing if paint is negative.

  Args:
    paint (int): The amount of paint that should be in the painter's bucket.
  """
  _get_default_painter().set_paint(paint)

def get_my_paint():
  """
  Returns the amount of paint the painter has.
  """
  return _get_default_painter().get_my_paint()

def has_paint():
  """
  Returns:
    True if the painter has any paint in their personal bucket
  """
  return _get_default_painter().has_paint()

def can_move(direction=None):
  """
  Returns:
    True if the painter can move in the given direction
  Args:
    direction (str): The direction of movement that is being checked
  """
  return _get_default_painter().can_move(direction)

def is_on_paint():
  """
  Returns:
    True if there is paint in the square where the painter is standing
  """
  return _get_default_painter().is_on_paint()

def is_on_bucket():
  """
  Returns:
    True if there is a paint bucket in the square where the painter is standing
  """
  return _get_default_painter().is_on_bucket()

def get_color():
  """
  Returns:
    The color of the square where the painter is standing
  """
  return _get_default_painter().get_color()

def is_facing_north():
  """
  Returns:
    True if the painter is facing North
  """
  return _get_default_painter().is_facing_north()

def is_facing_east():
  """
  Returns:
    True if the painter is facing East
  """
  return _get_default_painter().is_facing_east()

def is_facing_south():
  """
  Returns:
    True if the painter is facing South
  """
  return _get_default_painter().is_facing_south()

def is_facing_west():
  """
  Returns:
    True if the painter is facing West
  """
  return _get_default_painter().is_facing_west()

def get_x():
  """
  Returns:
    The x-coordinate of the painter's current position
  """
  return _get_default_painter().get_x()

def get_y():
  """
  Returns:
    The y-coordinate of the painter's current position
  """
  return _get_default_painter().get_y()

def get_direction():
  """
  Returns:
    The direction the painter is facing
  """
  return _get_default_painter().get_direction()

def hide_painter():
  """
  Hides the painter on the screen.
  """
  _get_default_painter().hide_painter()

def show_painter():
  """
  Shows the painter on the screen.
  """
  _get_default_painter().show_painter()

def hide_buckets():
  """
  Hide all the paint buckets on the screen.
  """
  _get_default_painter().hide_buckets()

def show_buckets():
  """
  Show all the paint buckets on the screen.
  """
  _get_default_painter().show_buckets()
