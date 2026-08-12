import re

_HEX_PATTERN = re.compile(r"^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$")

_MAX_VALUE = 255
_MIN_VALUE = 0


def _sanitize(value):
  """Clamp a channel value into the 0-255 range."""
  if value < _MIN_VALUE:
    return _MIN_VALUE
  return min(value, _MAX_VALUE)


class Color:
  """An RGB color.

  Construct from three channel values, a copy of another Color, or a name/hex
  string. Names come from the fixed palette below (case-insensitive); hex may be
  '#rgb' or '#rrggbb'.
  """

  def __init__(self, *args):
    if len(args) == 1 and isinstance(args[0], Color):
      other = args[0]
      self.red, self.green, self.blue = other.red, other.green, other.blue
    elif len(args) == 1 and isinstance(args[0], str):
      self.red, self.green, self.blue = _from_string(args[0])
    elif len(args) == 3:
      self.red = _sanitize(int(round(args[0])))
      self.green = _sanitize(int(round(args[1])))
      self.blue = _sanitize(int(round(args[2])))
    else:
      raise TypeError("Color expects (r, g, b), a Color, or a name/hex string")

  def get_red(self):
    return self.red

  def get_green(self):
    return self.green

  def get_blue(self):
    return self.blue

  def to_rgb_tuple(self):
    """Return an (r, g, b) tuple for use with Pillow."""
    return (self.red, self.green, self.blue)

  def __eq__(self, other):
    return (
      isinstance(other, Color)
      and self.red == other.red
      and self.green == other.green
      and self.blue == other.blue
    )

  def __repr__(self):
    return f"Color({self.red}, {self.green}, {self.blue})"


def _from_string(color):
  key = color.upper()
  if key in _NAMED_COLORS:
    return _NAMED_COLORS[key]
  hex_match = _HEX_PATTERN.match(color)
  if hex_match:
    digits = hex_match.group(1)
    if len(digits) == 3:
      digits = "".join(c * 2 for c in digits)
    return (int(digits[0:2], 16), int(digits[2:4], 16), int(digits[4:6], 16))
  raise ValueError(f"Invalid color {color}")


# The fixed named palette.
_NAMED_COLORS = {
  "WHITE": (255, 255, 255),
  "SILVER": (192, 192, 192),
  "GRAY": (128, 128, 128),
  "BLACK": (0, 0, 0),
  "RED": (255, 0, 0),
  "MAROON": (128, 0, 0),
  "YELLOW": (255, 255, 0),
  "OLIVE": (128, 128, 0),
  "LIME": (0, 255, 0),
  "GREEN": (0, 128, 0),
  "AQUA": (0, 255, 255),
  "TEAL": (0, 128, 128),
  "BLUE": (0, 0, 255),
  "NAVY": (0, 0, 128),
  "FUCHSIA": (255, 0, 255),
  "PURPLE": (128, 0, 128),
  "PINK": (255, 192, 203),
  "ORANGE": (255, 165, 0),
  "GOLD": (255, 215, 0),
  "BROWN": (165, 42, 42),
  "CHOCOLATE": (210, 105, 30),
  "TAN": (210, 180, 140),
  "TURQUOISE": (64, 224, 208),
  "INDIGO": (75, 0, 130),
  "VIOLET": (238, 130, 238),
  "BEIGE": (245, 245, 220),
  "IVORY": (255, 255, 240),
}

# Convenient module-level color constants.
WHITE = Color("white")
BLACK = Color("black")
