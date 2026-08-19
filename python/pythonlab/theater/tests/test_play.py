import sys
import types

from theater import Scene, play_scenes


def make_scene():
  scene = Scene()
  scene.draw_rectangle(10, 10, 50, 50)
  return scene


def test_play_scenes_returns_gif_bytes_without_a_bridge():
  # No _theater_bridge is installed here, so publishing must be a silent no-op.
  gif_bytes = play_scenes(make_scene())
  assert gif_bytes.startswith(b"GIF")


def test_play_scenes_publishes_the_rendered_gif(monkeypatch):
  published = []
  fake_bridge = types.ModuleType("_theater_bridge")
  fake_bridge.publish = published.append
  monkeypatch.setitem(sys.modules, "_theater_bridge", fake_bridge)

  gif_bytes = play_scenes(make_scene())

  assert published == [gif_bytes]


def test_play_scenes_concatenates_scene_actions(monkeypatch):
  published = []
  fake_bridge = types.ModuleType("_theater_bridge")
  fake_bridge.publish = published.append
  monkeypatch.setitem(sys.modules, "_theater_bridge", fake_bridge)

  first = Scene()
  first.draw_rectangle(0, 0, 100, 100)
  first.pause(0.5)
  second = Scene()
  second.draw_ellipse(200, 200, 50, 50)

  play_scenes(first, second)

  # One gif covering both scenes, not one per scene.
  assert len(published) == 1
