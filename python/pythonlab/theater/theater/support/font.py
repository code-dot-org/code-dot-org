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


def _as_member(enum_class, value, label):
  """Accept an enum member or its name (case-insensitive)."""
  if isinstance(value, enum_class):
    return value
  if isinstance(value, str):
    try:
      return enum_class(value.upper())
    except ValueError:
      pass
  names = ", ".join(member.value for member in enum_class)
  raise ValueError(f"Unknown {label} {value!r}, expected one of {names}")


def as_font(font):
  """Accept a Font or a font name (case-insensitive)."""
  return _as_member(Font, font, "font")


def as_font_style(font_style):
  """Accept a FontStyle or a style name (case-insensitive)."""
  return _as_member(FontStyle, font_style, "text style")


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
