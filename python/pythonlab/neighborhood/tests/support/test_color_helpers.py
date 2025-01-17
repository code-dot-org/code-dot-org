from neighborhood.support.color_helpers import is_color

def test_can_identify_hex_colors():
  assert is_color("#000000")
  assert is_color("#ffffff")
  assert is_color("#f0f0f0")
  assert is_color("#a1b2c3")
  assert is_color("#A1B2C3")
  assert is_color("#000")
  assert is_color("#fff")
  assert is_color("#f0f")
  assert is_color("#abc")
  assert is_color("#ABC")
  assert not is_color("#00000")
  assert not is_color("000000")

def test_can_identify_web_colors():
  assert is_color("lightcyan")
  assert is_color("DEEPpink")
  assert not is_color("mycustomcolor")
