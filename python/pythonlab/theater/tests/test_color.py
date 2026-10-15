import pytest

from theater.support.color import Color


def test_named_color():
  red = Color("red")
  assert red.to_rgb_tuple() == (255, 0, 0)


def test_named_color_is_case_insensitive():
  assert Color("WhItE").to_rgb_tuple() == (255, 255, 255)


def test_lime_palette_value():
  assert Color("lime").to_rgb_tuple() == (0, 255, 0)


def test_hex_long_and_short():
  assert Color("#ff8800").to_rgb_tuple() == (255, 136, 0)
  assert Color("#f80").to_rgb_tuple() == (255, 136, 0)


def test_rgb_channels_are_clamped():
  assert Color(300, -5, 40).to_rgb_tuple() == (255, 0, 40)


def test_rgb_channels_round_rather_than_truncate():
  assert Color(200 / 3, 10.4, 10.6).to_rgb_tuple() == (67, 10, 11)


def test_copy_constructor():
  original = Color(1, 2, 3)
  assert Color(original).to_rgb_tuple() == (1, 2, 3)


def test_equal_colors_share_a_hash():
  assert len({Color("red"), Color(255, 0, 0), Color("#f00")}) == 1
  assert {Color("blue"): "cold"}[Color(0, 0, 255)] == "cold"


def test_invalid_name_raises():
  with pytest.raises(ValueError):
    Color("notacolor")
