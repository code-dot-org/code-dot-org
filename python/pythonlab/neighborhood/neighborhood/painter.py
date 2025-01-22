from .support.neighborhood_signal_key import NeighborhoodSignalKey
from .support.signal_message_type import SignalMessageType
from .support.neighborhood_signal_message import NeighborhoodSignalMessage
from .support.world import World
from .support.direction import Direction

class Painter:
  last_id = 0
  def __init__(self, x=0, y=0, direction='east', paint=0):
    """
    Initialize the painter with the given x, y, direction, and paint.

    Args:
      x (int): The x-coordinate of the painter. Defaults to 0.
      y (int): The y-coordinate of the painter. Defaults to 0.
      direction (str): The direction the painter is facing. Defaults to "East".
      paint (int): The amount of paint the painter has. Defaults to 0.
    """
    self.x = x
    self.y = y
    self.direction = Direction(direction)
    self.remaining_paint = paint
    # Create a reference to the world singleton
    self.world = World()
    # If the grid is not set, set it from the default file
    if (self.world.grid is None):
      self.world.set_grid_from_file()
    Painter.last_id += 1
    self.id = f"painter-{Painter.last_id}"
    self._send_initialization_message(x, y, direction, paint)

  def turn_left(self):
    """
    Turn the painter one compass direction left (i.e. North -> West).
    """
    self.direction.turn_left()
    self._send_signal(NeighborhoodSignalKey.TURN_LEFT.value, {'direction': self.direction.value})

  def move(self):
    """
    Move the painter one square forward in the direction it is facing.
    """
    self._send_signal(NeighborhoodSignalKey.MOVE.value, {'direction': self.direction.value})

  def paint(self, color):
    """
    Paint the square the painter is on with the given color.

    Args:
      color (str): The color to paint the square.
    """
    self._send_signal(NeighborhoodSignalKey.PAINT.value, {'color': color})

  def scrape_paint(self):
    """
    Removes all the paint off the square the painter is on.
    """
    self._send_signal(NeighborhoodSignalKey.REMOVE_PAINT.value)

  def hide_painter(self):
    """
    Hides the painter on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.HIDE_PAINTER.value)

  def show_painter(self):
    """
    Shows the painter on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.SHOW_PAINTER.value)

  def take_paint(self):
    """
    The Painter adds a single unit of paint to their personal bucket.
    The counter on the bucket on the screen goes down.
    If the painter is not standing on a paint bucket, nothing happens.
    """
    self._send_signal(NeighborhoodSignalKey.TAKE_PAINT.value)

  def show_buckets(self):
    """
    Show all the paint buckets on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.SHOW_BUCKETS.value)

  def hide_buckets(self):
    """
    Hide all the paint buckets on the screen.
    """
    self._send_signal(NeighborhoodSignalKey.HIDE_BUCKETS.value)

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
    return False
  
  def is_on_bucket(self):
    """
    Returns:
      True if there is a paint bucket in the square where the painter is standing
    """
    return False
  
  def has_paint(self):
    """
    Returns:
      True if the painter has any paint in their personal bucket
    """
    return False
  
  def can_move(self, direction):
    """
    Returns:
      True if the painter can move in the given direction
    """
    return False
  
  def get_color(self):
    """
    Returns:
      The color of the square where the painter is standing
    """
    return None
  
  def is_facing_north(self):
    """
    Returns:
      True if the painter is facing North
    """
    return self.direction.is_north() == 'north'
  
  def is_facing_east(self):
    """
    Returns:
      True if the painter is facing East
    """
    return self.direction.is_east() == 'east'
  
  def is_facing_south(self):
    """
    Returns:
      True if the painter is facing South
    """
    return self.direction.is_south() == 'south'
  
  def is_facing_west(self):
    """
    Returns:
      True if the painter is facing West
    """
    return self.direction.is_west() == 'west'
  
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
    self.remaining_paint = paint

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

  def _send_signal(self, key, detail=None):
    """
    Helper method to create and print a signal message.

    Args:
      key (str): The key for the signal message (e.g., NeighborhoodSignalKey).
      detail (dict): Optional additional details for the signal message.
    """
    detail = detail or {}
    detail['id'] = self.id
    signal_message = NeighborhoodSignalMessage(SignalMessageType.PAINTER, key, detail)
    print(signal_message.get_formatted_message())
