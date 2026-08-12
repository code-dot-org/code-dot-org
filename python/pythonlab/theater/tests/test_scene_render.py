import io

from PIL import Image as PILImage

import theater
from theater import Image, Scene
from theater.support.constants import THEATER_HEIGHT, THEATER_WIDTH
from theater.support.renderer import render


def test_scene_records_actions():
  scene = Scene()
  scene.draw_rectangle(10, 10, 50, 50)
  scene.pause(1)
  assert len(scene.get_actions()) == 2
  assert scene.get_width() == THEATER_WIDTH
  assert scene.get_height() == THEATER_HEIGHT


def test_pause_produces_multiframe_gif():
  scene = Scene()
  scene.set_fill_color("red")
  scene.draw_rectangle(0, 0, 100, 100)
  scene.pause(0.5)
  scene.set_fill_color("blue")
  scene.draw_rectangle(200, 200, 100, 100)
  scene.pause(0.5)
  # A final draw with no trailing pause is captured by the closing frame.
  scene.set_fill_color("green")
  scene.draw_rectangle(100, 100, 50, 50)
  gif_bytes = render(scene.get_actions())

  gif = PILImage.open(io.BytesIO(gif_bytes))
  assert gif.size == (THEATER_WIDTH, THEATER_HEIGHT)
  # Frame after each pause, plus the distinct closing frame.
  assert gif.n_frames == 3


def test_gif_only_when_no_pause_is_single_frame():
  scene = Scene()
  scene.draw_ellipse(10, 10, 50, 50)
  gif_bytes = render(scene.get_actions())
  gif = PILImage.open(io.BytesIO(gif_bytes))
  assert gif.n_frames == 1


def test_draw_text_renders():
  scene = Scene()
  scene.set_text_color("black")
  scene.draw_text("Hi", 50, 50)
  gif_bytes = render(scene.get_actions())
  assert len(gif_bytes) > 0


def test_draw_image_accepts_float_geometry():
  # Ordinary student arithmetic like 400 / 2 yields floats, which Pillow's
  # resize and paste reject outright.
  image = Image(20, 20)
  image.clear(theater.Color("red"))
  scene = Scene()
  scene.draw_image(image, 400 / 2, 100 / 2, size=60 / 2)
  scene.draw_image(image, 10.5, 10.5, width=30.5, height=30.5)
  scene.draw_image(image, 300 / 2, 50.5, size=40.5, rotation=45)
  gif_bytes = render(scene.get_actions())
  assert len(gif_bytes) > 0


def test_draw_image_lands_at_rounded_position():
  image = Image(10, 10)
  image.clear(theater.Color("red"))
  scene = Scene()
  scene.draw_image(image, 20.6, 30.6, size=10)
  frame = PILImage.open(io.BytesIO(render(scene.get_actions()))).convert("RGB")
  assert frame.getpixel((21, 31)) == (255, 0, 0)
  assert frame.getpixel((20, 30)) == (255, 255, 255)


def test_play_scenes_renders_and_returns_bytes():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  gif_bytes = theater.play_scenes(scene)
  assert len(gif_bytes) > 0
