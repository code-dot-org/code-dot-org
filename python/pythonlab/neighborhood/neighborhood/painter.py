from .support.neighborhood_signal_key import NeighborhoodSignalKey
from .support.signal_message_type import SignalMessageType
from .support.neighborhood_signal_message import NeighborhoodSignalMessage
from .support.world import World
from .support.direction import Direction
from .support.neighborhood_runtime_exception import NeighborhoodRuntimeException
from .support.exception_key import ExceptionKey

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
    self._send_initialization_message(x, y, direction, paint)
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
    return is_on_paint
  
  def is_on_bucket(self):
    """
    Returns:
      True if there is a paint bucket in the square where the painter is standing
    """
    is_on_bucket = self.world.grid.get_square(self.x, self.y).contains_paint()
    return is_on_bucket
  
  def has_paint(self):
    """
    Returns:
      True if the painter has any paint in their personal bucket
    """
    if self.has_infinite_paint:
      return True
    return self.remaining_paint > 0
  
  def can_move(self, direction):
    """
    Returns:
      True if the painter can move in the given direction
    Args:
      direction (str): The direction of movement that is being checked
    """
    can_move_result = self._is_valid_movement(Direction(direction))
    return can_move_result
  
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

  def _get_initialization_message(self, x, y, direction, paint):
    detail = {
                'id': self.id,
                'direction': direction,
                'x': x,
                'y': y,
                'paint': paint,
              }
    signal_message = NeighborhoodSignalMessage(SignalMessageType.PAINTER, NeighborhoodSignalKey.INITIALIZE_PAINTER.value, detail)
    return signal_message.get_formatted_message()

  def _send_initialization_message(self, x, y, direction, paint):
    print(self._get_initialization_message(x, y, direction, paint))

  def _send_signal(self, signal_key, detail=None):
    """
    Helper method to create and print a signal message.

    Args:
      signal_key (NeighborhoodSignalKey): The key for the signal message.
      detail (dict): Optional additional details for the signal message.
    """
    detail = detail or {}
    detail['id'] = self.id
    signal_message = NeighborhoodSignalMessage(SignalMessageType.PAINTER, signal_key.value, detail)
    print(signal_message.get_formatted_message())

  def _send_boolean_message(self, signal_key, result):
    """
    Sends a boolean message with the specified signal key and result.
    Args:
      signal_key (NeighborhoodSignalKey): The signal key for the message.
      result (bool): The boolean result to include in the message.
    """
    details = {
        "id": self.id,
        "boolean_result": str(result)  # Convert the boolean to a string.
    }
    self._send_signal(signal_key, details)
    
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