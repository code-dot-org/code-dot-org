import io
from functools import lru_cache
from importlib.resources import files

from PIL import ImageFont

from .font import font_filename

_FONT_CACHE_SIZE = 32

@lru_cache(maxsize=_FONT_CACHE_SIZE)
def load_font(font, font_style, height):
  """Load a bundled Liberation TTF at the given pixel height (cached)."""
  filename = font_filename(font, font_style)
  data = files("theater").joinpath("fonts", filename).read_bytes()
  return ImageFont.truetype(io.BytesIO(data), size=height)
