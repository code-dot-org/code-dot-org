import pytest
from PIL import Image as PILImage

from theater import Color, Image
from theater.support import image as image_module
from theater.support.constants import MAX_IMAGE_PIXELS


def test_blank_image_dimensions_round():
  image = Image(20 / 3, 10.6)
  assert (image.get_width(), image.get_height()) == (7, 11)


def test_blank_image_rejects_oversized_dimensions():
  with pytest.raises(ValueError):
    Image(MAX_IMAGE_PIXELS, 2)


def test_blank_image_rejects_negative_dimensions():
  with pytest.raises(ValueError):
    Image(-5, 10)


def test_blank_image_allows_the_largest_permitted_size():
  side = int(MAX_IMAGE_PIXELS**0.5)
  image = Image(side, side)
  assert (image.get_width(), image.get_height()) == (side, side)


def test_loading_rejects_an_oversized_file(tmp_path, monkeypatch):
  path = tmp_path / "big.png"
  PILImage.new("RGBA", (40, 40)).save(path)
  monkeypatch.setattr(image_module, "MAX_IMAGE_PIXELS", 100)
  with pytest.raises(ValueError):
    Image(str(path))


def test_pixel_access_accepts_floats():
  image = Image(10, 10)
  image.set_pixel(20 / 4, 3.6, Color("red"))
  assert image.get_pixel(5, 4).get_color().to_rgb_tuple() == (255, 0, 0)
  assert image.get_pixel(4.6, 3.6).get_color().to_rgb_tuple() == (255, 0, 0)


def test_color_arguments_accept_names_and_hex():
  image = Image(4, 4)
  image.clear("red")
  image.set_pixel(1, 1, "#00ff00")
  assert image.get_pixel(0, 0).get_color().to_rgb_tuple() == (255, 0, 0)
  assert image.get_pixel(1, 1).get_color().to_rgb_tuple() == (0, 255, 0)


def test_set_pixel_preserves_alpha():
  image = Image(4, 4)
  image.clear(Color("blue"))
  image.set_pixel(1, 1, Color("red"))
  assert image.to_pil().getpixel((1, 1)) == (255, 0, 0, 255)
