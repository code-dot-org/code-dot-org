from PIL import Image as PILImage

from .color import Color, as_color
from .constants import MAX_IMAGE_PIXELS

# Loaded images larger than this are scaled down, preserving aspect ratio.
MAX_WIDTH = 400
MAX_HEIGHT = 400


class Pixel:
  """A single pixel's color."""

  def __init__(self, color):
    self._color = color

  def get_color(self):
    return self._color


class Image:
  """A bitmap image.

  Construct from a filename (read from the Pyodide filesystem), from another
  Image (copy), or from width/height (a blank white image).
  """

  def __init__(self, *args):
    if len(args) == 1 and isinstance(args[0], str):
      self._pil = _load_and_fit(args[0])
    elif len(args) == 1 and isinstance(args[0], Image):
      self._pil = args[0]._pil.copy()
    elif len(args) == 1 and isinstance(args[0], PILImage.Image):
      self._pil = args[0].convert("RGBA")
    elif len(args) == 2:
      width, height = int(round(args[0])), int(round(args[1]))
      _check_dimensions(width, height)
      self._pil = PILImage.new("RGBA", (width, height), (255, 255, 255, 255))
    else:
      raise TypeError("Image expects a filename, an Image, or (width, height)")

  def get_width(self):
    return self._pil.width

  def get_height(self):
    return self._pil.height

  def get_pixel(self, x, y):
    r, g, b, _a = self._pil.getpixel((int(round(x)), int(round(y))))
    return Pixel(Color(r, g, b))

  def set_pixel(self, x, y, color):
    # putpixel rejects floats outright, and getpixel would truncate rather
    # than round, so both ends agree on the pixel only if we round here.
    x, y = int(round(x)), int(round(y))
    r, g, b = as_color(color).to_rgb_tuple()
    existing = self._pil.getpixel((x, y))
    alpha = existing[3] if len(existing) == 4 else 255
    self._pil.putpixel((x, y), (r, g, b, alpha))

  def clear(self, color):
    r, g, b = as_color(color).to_rgb_tuple()
    self._pil.paste((r, g, b, 255), (0, 0, self._pil.width, self._pil.height))

  def to_pil(self):
    """Return the backing Pillow image (RGBA). Internal use for rendering."""
    return self._pil


def _check_dimensions(width, height):
  # Zero is refused along with the negatives: an image with no pixels cannot be
  # drawn, and draw_image() divides by the width to hold the aspect ratio.
  if width < 1 or height < 1:
    raise ValueError("An image's width and height must be at least 1")
  if width * height > MAX_IMAGE_PIXELS:
    raise ValueError(
      f"The image is too large; the limit is {MAX_IMAGE_PIXELS} pixels"
    )


def _load_and_fit(filename):
  # open() only reads the header, so the size check happens before convert()
  # spends memory decoding the file.
  pil = PILImage.open(filename)
  _check_dimensions(pil.width, pil.height)
  pil = pil.convert("RGBA")
  width, height = pil.width, pil.height
  if width <= MAX_WIDTH and height <= MAX_HEIGHT:
    return pil
  if height >= width:
    target_height = MAX_HEIGHT
    target_width = int(round(width / height * MAX_HEIGHT))
  else:
    target_width = MAX_WIDTH
    target_height = int(round(height / width * MAX_WIDTH))
  return pil.resize((target_width, target_height), PILImage.LANCZOS)
