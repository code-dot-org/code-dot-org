from neighborhood.support.color_helpers import is_color, to_color_string

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

def test_color_strings_pass_through_unchanged():
  assert to_color_string("red") == "red"
  assert to_color_string("DEEPpink") == "DEEPpink"
  assert to_color_string("#A1B2C3") == "#A1B2C3"
  assert to_color_string("#abc") == "#abc"
  assert to_color_string("mycustomcolor") is None
  assert to_color_string("000000") is None

def test_rgb_components_become_hex():
  assert to_color_string(255, 0, 0) == "#ff0000"
  assert to_color_string(0, 0, 0) == "#000000"
  assert to_color_string(255, 255, 255) == "#ffffff"
  assert to_color_string(1, 2, 3) == "#010203"

def test_rejects_out_of_range_and_non_integer_components():
  assert to_color_string(256, 0, 0) is None
  assert to_color_string(-1, 0, 0) is None
  assert to_color_string(255.0, 0, 0) is None
  assert to_color_string("255", 0, 0) is None
  # bool is a subclass of int, so it needs rejecting explicitly.
  assert to_color_string(True, False, False) is None

def test_rejects_wrong_number_of_arguments():
  assert to_color_string() is None
  assert to_color_string(255, 0) is None
  assert to_color_string(255, 0, 0, 0) is None
  assert to_color_string((255, 0, 0)) is None
