import io
import sys
import types

from PIL import Image

from theater import Scene, play_scenes


def make_scene():
  scene = Scene()
  scene.draw_rectangle(10, 10, 50, 50)
  return scene


def install_fake_bridge(monkeypatch):
  """Record what play_scenes publishes.

  Returns the list of (gif, wav, gif_ms, summary, transcript, still) tuples.
  """
  published = []
  fake_bridge = types.ModuleType("_theater_bridge")
  fake_bridge.publish = lambda *args: published.append(args)
  monkeypatch.setitem(sys.modules, "_theater_bridge", fake_bridge)
  return published


def test_play_scenes_returns_gif_bytes_without_a_bridge():
  # No _theater_bridge is installed here, so publishing must be a silent no-op.
  gif_bytes, _wav = play_scenes(make_scene())
  assert gif_bytes.startswith(b"GIF")


def test_play_scenes_publishes_the_rendered_gif(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  gif_bytes, _wav = play_scenes(make_scene())

  # A silent program still publishes, with no audio track alongside the gif.
  assert len(published) == 1
  assert published[0][:3] == (gif_bytes, None, 0)


def test_play_scenes_publishes_the_audio_track(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  scene = make_scene()
  scene.play_note(60, 0.5)
  gif_bytes, wav_bytes = play_scenes(scene)

  assert wav_bytes is not None
  assert published[0][:3] == (gif_bytes, wav_bytes, 0)


def test_play_scenes_concatenates_scene_actions(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  first = Scene()
  first.draw_rectangle(0, 0, 100, 100)
  first.pause(0.5)
  second = Scene()
  second.draw_ellipse(200, 200, 50, 50)

  play_scenes(first, second)

  # One gif covering both scenes, not one per scene.
  assert len(published) == 1


def test_play_scenes_publishes_the_gif_length(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  scene = make_scene()
  scene.pause(0.5)
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(1.25)
  play_scenes(scene)

  # The two pauses, in milliseconds; the closing frame carries no delay.
  assert published[0][2] == 1750


def test_play_scenes_publishes_the_description(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  play_scenes(make_scene())

  _gif, _wav, _ms, summary, transcript, _still = published[0]
  assert summary == "Still picture."
  assert transcript == "Shapes: black rectangle in the top left."


def test_play_scenes_describes_every_scene_it_was_given(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  first = Scene()
  first.draw_rectangle(0, 0, 100, 100)
  second = Scene()
  second.draw_ellipse(200, 200, 50, 50)

  play_scenes(first, second)

  transcript = published[0][4]
  assert "rectangle" in transcript
  assert "ellipse" in transcript


def test_play_scenes_publishes_a_png_still(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  play_scenes(make_scene())

  still = published[0][5]
  assert still.startswith(b"\x89PNG\r\n\x1a\n")


def test_still_is_the_last_frame_of_an_animation(monkeypatch):
  published = install_fake_bridge(monkeypatch)

  scene = Scene()
  scene.draw_rectangle(0, 0, 100, 100)
  scene.pause(0.5)
  scene.set_fill_color("red")
  scene.draw_ellipse(200, 200, 80, 80)
  play_scenes(scene)

  still = Image.open(io.BytesIO(published[0][5]))
  # The ellipse is centred at (240, 240) and drawn after the pause, so this is the last frame.
  assert still.getpixel((240, 240))[:3] == (255, 0, 0)
