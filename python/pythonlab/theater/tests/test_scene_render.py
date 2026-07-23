import io
import wave

from PIL import Image as PILImage

import theater
from theater import Instrument, Scene
from theater.support.audio import read_samples_from_wav_bytes
from theater.support.constants import SAMPLE_RATE, THEATER_HEIGHT, THEATER_WIDTH
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
  gif_bytes, wav_bytes = render(scene.get_actions())

  assert wav_bytes is None
  gif = PILImage.open(io.BytesIO(gif_bytes))
  assert gif.size == (THEATER_WIDTH, THEATER_HEIGHT)
  # Frame after each pause, plus the distinct closing frame.
  assert gif.n_frames == 3


def test_gif_only_when_no_pause_is_single_frame():
  scene = Scene()
  scene.draw_ellipse(10, 10, 50, 50)
  gif_bytes, wav_bytes = render(scene.get_actions())
  gif = PILImage.open(io.BytesIO(gif_bytes))
  assert gif.n_frames == 1
  assert wav_bytes is None


def test_play_note_produces_wav():
  scene = Scene()
  scene.play_note(60, 0.5, instrument=Instrument.PIANO)
  gif_bytes, wav_bytes = render(scene.get_actions())
  assert wav_bytes is not None
  with wave.open(io.BytesIO(wav_bytes), "rb") as reader:
    assert reader.getnchannels() == 1
    assert reader.getframerate() == SAMPLE_RATE
    assert reader.getsampwidth() == 2
  samples = read_samples_from_wav_bytes(wav_bytes)
  # Truncated to roughly the requested half second.
  assert abs(len(samples) - SAMPLE_RATE * 0.5) < SAMPLE_RATE * 0.1


def test_play_sound_samples():
  scene = Scene()
  scene.play_sound([0.1, 0.2, 0.3])
  _gif, wav_bytes = render(scene.get_actions())
  samples = read_samples_from_wav_bytes(wav_bytes)
  assert len(samples) == 3


def test_draw_text_renders():
  scene = Scene()
  scene.set_text_color("black")
  scene.draw_text("Hi", 50, 50)
  gif_bytes, _wav = render(scene.get_actions())
  assert len(gif_bytes) > 0


def test_play_scenes_returns_bytes_without_bridge():
  # The _theater_bridge module is absent outside Pyodide; play_scenes must
  # still render and return without error.
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  gif_bytes, wav_bytes = theater.play_scenes(scene)
  assert len(gif_bytes) > 0
  assert wav_bytes is None
