from theater.support.font import Font, FontStyle
from theater.support.fonts import _FONT_CACHE_SIZE, load_font


def test_a_repeated_height_is_loaded_once():
  # A scene draws most of its text at a handful of sizes, and each load is a
  # file read and a face built from it.
  load_font.cache_clear()
  first = load_font(Font.SANS, FontStyle.NORMAL, 20)
  second = load_font(Font.SANS, FontStyle.NORMAL, 20)
  assert second is first
  assert load_font.cache_info().hits == 1


def test_the_cache_stops_growing():
  # Python Lab reuses one interpreter for the lifetime of the browser tab, so
  # an unbounded cache would hold a face for every height ever drawn, across
  # every run, until the page reloads.
  load_font.cache_clear()
  for height in range(1, 4 * _FONT_CACHE_SIZE):
    load_font(Font.SANS, FontStyle.NORMAL, height)
  assert load_font.cache_info().currsize == _FONT_CACHE_SIZE


def test_each_family_and_style_loads_its_own_face():
  load_font.cache_clear()
  plain = load_font(Font.SERIF, FontStyle.NORMAL, 20)
  bold = load_font(Font.SERIF, FontStyle.BOLD, 20)
  mono = load_font(Font.MONO, FontStyle.NORMAL, 20)
  assert plain is not bold
  assert plain is not mono
  assert load_font.cache_info().hits == 0
