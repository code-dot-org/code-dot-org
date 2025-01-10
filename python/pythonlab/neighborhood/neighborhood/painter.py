from .support.neighborhood_signal_key import NeighborhoodSignalKey

PAINTER_MESSAGE_PREFIX = "[PAINTER]"

class Painter:
  def __init__(self, x=0, y=0, direction="East", paint=0):
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
    self.direction = direction
    self.remaining_paint = paint

  def turn_left(self):
    """
    Turn the painter one compass direction left (i.e. North -> West).
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.TURN_LEFT.value}')

  def move(self):
    """
    Move the painter one square forward in the direction it is facing.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.MOVE.value}')

  def paint(self, color):
    """
    Paint the square the painter is on with the given color.

    Args:
      color (str): The color to paint the square.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.PAINT.value} {color}')

  def scrape_paint(self):
    """
    Removes all the paint off the square the painter is on.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.REMOVE_PAINT.value}')

  def get_my_paint(self):
    """
    Returns the amount of paint the painter has.
    """
    return self.remaining_paint
  
  def hide_painter(self):
    """
    Hides the painter on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.HIDE_PAINTER.value}')

  def show_painter(self):
    """
    Shows the painter on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.SHOW_PAINTER.value}')

  def take_paint(self):
    """
    The Painter adds a single unit of paint to their personal bucket. The counter on the bucket on
    the screen goes down. If the painter is not standing on a paint bucket, nothing happens.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.TAKE_PAINT.value}')

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
    return False
  
  def is_facing_east(self):
    """
    Returns:
      True if the painter is facing East
    """
    return False
  
  def is_facing_south(self):
    """
    Returns:
      True if the painter is facing South
    """
    return False
  
  def is_facing_west(self):
    """
    Returns:
      True if the painter is facing West
    """
    return False
  
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
    return self.direction
  
  def show_buckets():
    """
    Show all the paint buckets on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.SHOW_BUCKETS.value}')

  def hide_buckets():
    """
    Hide all the paint buckets on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.HIDE_BUCKETS.value}')

  def set_paint(self, paint):
    """
    Set the amount of paint in the painter's bucket. Does nothing if paint is negative.

    Args:
      paint (int): The amount of paint that should be in the painter's bucket.
    """
    self.remaining_paint = paint
