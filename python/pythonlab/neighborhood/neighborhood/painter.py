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
    self.paint = paint

  def turnLeft():
    """
    Turn the painter one compass direction left (i.e. North -> West).
    """
    print(f'{PAINTER_MESSAGE_PREFIX} TURN_LEFT')
