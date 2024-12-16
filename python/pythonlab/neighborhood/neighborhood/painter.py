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
    self.remainingPaint = paint

  def turnLeft(self):
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

  def scrapePaint(self):
    """
    Removes all the paint off the square the painter is on.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.REMOVE_PAINT.value}')

  def getMyPaint(self):
    """
    Returns the amount of paint the painter has.
    """
    return self.remainingPaint
  
  def hidePainter(self):
    """
    Hides the painter on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.HIDE_PAINTER.value}')

  def showPainter(self):
    """
    Shows the painter on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.SHOW_PAINTER.value}')

  def takePaint(self):
    """
    The Painter adds a single unit of paint to their personal bucket. The counter on the bucket on
    the screen goes down. If the painter is not standing on a paint bucket, nothing happens.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.TAKE_PAINT.value}')

  def isOnPaint(self):
    """
    Returns:
      True if there is paint in the square where the painter is standing
    """
    return False
  
  def isOnBucket(self):
    """
    Returns:
      True if there is a paint bucket in the square where the painter is standing
    """
    return False
  
  def hasPaint(self):
    """
    Returns:
      True if the painter has any paint in their personal bucket
    """
    return False
  
  def canMove(self, direction):
    """
    Returns:
      True if the painter can move in the given direction
    """
    return False
  
  def getColor(self):
    """
    Returns:
      The color of the square where the painter is standing
    """
    return None
  
  def isFacingNorth(self):
    """
    Returns:
      True if the painter is facing North
    """
    return False
  
  def isFacingEast(self):
    """
    Returns:
      True if the painter is facing East
    """
    return False
  
  def isFacingSouth(self):
    """
    Returns:
      True if the painter is facing South
    """
    return False
  
  def isFacingWest(self):
    """
    Returns:
      True if the painter is facing West
    """
    return False
  
  def getX(self):
    """
    Returns:
      The x-coordinate of the painter's current position
    """
    return self.x
  
  def getY(self):
    """
    Returns:
      The y-coordinate of the painter's current position
    """
    return self.y
  
  def getDirection(self):
    """
    Returns:
      The direction the painter is facing
    """
    return self.direction
  
  def showBuckets():
    """
    Show all the paint buckets on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.SHOW_BUCKETS.value}')

  def hideBuckets():
    """
    Hide all the paint buckets on the screen.
    """
    print(f'{PAINTER_MESSAGE_PREFIX} {NeighborhoodSignalKey.HIDE_BUCKETS.value}')

  def setPaint(self, paint):
    """
    Set the amount of paint in the painter's bucket. Does nothing if paint is negative.

    Args:
      paint (int): The amount of paint that should be in the painter's bucket.
    """
    self.remainingPaint = paint
