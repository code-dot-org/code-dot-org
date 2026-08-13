from theater import Color, Image


def test_blank_image_dimensions_round():
  image = Image(20 / 3, 10.6)
  assert (image.get_width(), image.get_height()) == (7, 11)


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
