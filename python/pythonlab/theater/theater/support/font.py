from enum import Enum


class Font(Enum):
  """Font families available for drawn text."""
  MONO = "MONO"
  SANS = "SANS"
  SERIF = "SERIF"


class FontStyle(Enum):
  """Text styles."""
  NORMAL = "NORMAL"
  BOLD = "BOLD"
  ITALIC = "ITALIC"
  BOLD_ITALIC = "BOLD_ITALIC"


# Maps (Font, FontStyle) -> bundled TTF filename.
_FAMILY_PREFIX = {
  Font.MONO: "LiberationMono",
  Font.SANS: "LiberationSans",
  Font.SERIF: "LiberationSerif",
}

_STYLE_SUFFIX = {
  FontStyle.NORMAL: "-Regular.ttf",
  FontStyle.BOLD: "-Bold.ttf",
  FontStyle.ITALIC: "-Italic.ttf",
  FontStyle.BOLD_ITALIC: "-BoldItalic.ttf",
}


def font_filename(font, font_style):
  return _FAMILY_PREFIX[font] + _STYLE_SUFFIX[font_style]
