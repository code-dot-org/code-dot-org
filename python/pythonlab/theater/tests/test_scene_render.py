import io
import wave

import pytest
from PIL import Image as PILImage

import theater
from theater import Image, Instrument, Scene
from theater.support.audio import read_samples_from_wav_bytes
from theater.support.constants import (
  MAX_AUDIO_SECONDS,
  MAX_DRAW_IMAGE_SIZE,
  MAX_FRAMES,
  MAX_NOTE,
  MAX_PAUSE_SECONDS,
  MAX_TEXT_HEIGHT,
  MAX_TEXT_PIXELS,
  MIN_NOTE,
  MIN_PAUSE_SECONDS,
  MIN_TEXT_HEIGHT,
  SAMPLE_RATE,
  THEATER_HEIGHT,
  THEATER_WIDTH,
)
from theater.support import renderer as renderer_module
from theater.support.renderer import (
  AudioTooLongError,
  PauseTooLongError,
  TooManyFramesError,
  gif_duration_ms,
  render,
)


def _explode_on_drawing(monkeypatch):
  """Make the drawing pass fail, to prove a ceiling was checked before it ran.

  Patched rather than provoked with malformed input, which Scene now turns away
  at the call.
  """

  def boom(*_args):
    raise AssertionError("drawing ran before the ceiling was checked")

  monkeypatch.setattr(renderer_module, "_draw_rectangle", boom)


def _render_gif(actions):
  """The gif half of render(), for the tests that ignore audio."""
  gif_bytes, _wav = render(actions)
  return gif_bytes


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


def test_play_sound_does_not_follow_the_callers_list():
  # The scene renders at play_scenes, long after this call, so a list the
  # student goes on to change must not change what plays.
  samples = [1.0, 1.0, 1.0]
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.play_sound(samples)
  samples[0] = -1.0
  samples.clear()

  _gif, wav_bytes = render(scene.get_actions())
  rendered = read_samples_from_wav_bytes(wav_bytes)
  assert len(rendered) == 3
  assert rendered[0] > 0.99


def test_draw_text_renders():
  scene = Scene()
  scene.set_text_color("black")
  scene.draw_text("Hi", 50, 50)
  gif_bytes, _wav = render(scene.get_actions())
  assert len(gif_bytes) > 0


def _paused_scene(pause_count):
  # Each frame must differ; Pillow collapses runs of identical gif frames.
  scene = Scene()
  for i in range(pause_count):
    scene.set_fill_color(theater.Color(i % 256, i // 256, 0))
    scene.draw_rectangle(0, 0, 10, 10)
    scene.pause(0.1)
  # A distinct closing frame, which otherwise collapses into the last pause.
  scene.set_fill_color("white")
  scene.draw_rectangle(0, 0, 10, 10)
  return scene


def test_frame_ceiling_allows_a_full_length_animation():
  # One pause short of the ceiling, since the closing frame occupies a slot.
  gif = PILImage.open(io.BytesIO(_render_gif(_paused_scene(MAX_FRAMES - 1).get_actions())))
  assert gif.n_frames == MAX_FRAMES


def test_too_many_pauses_raises():
  with pytest.raises(TooManyFramesError):
    render(_paused_scene(MAX_FRAMES).get_actions())


def test_frame_ceiling_is_checked_before_drawing(monkeypatch):
  _explode_on_drawing(monkeypatch)
  scene = _paused_scene(MAX_FRAMES)
  scene.draw_rectangle(0, 0, 10, 10)
  with pytest.raises(TooManyFramesError):
    render(scene.get_actions())


def test_removed_colors_draw_nothing():
  # Pillow's default ink is opaque white, so handing it no color at all draws a
  # white shape rather than nothing. Clearing to blue makes that visible.
  blue = (0, 0, 255)
  scene = Scene()
  scene.clear("blue")
  scene.remove_stroke_color()
  scene.remove_fill_color()
  scene.draw_line(0, 10, THEATER_WIDTH, 10)
  scene.draw_rectangle(50, 50, 100, 100)
  scene.draw_ellipse(50, 200, 100, 100)
  frame = PILImage.open(io.BytesIO(_render_gif(scene.get_actions()))).convert("RGB")
  # A point on the line, on the rectangle's edge, and inside the ellipse.
  assert frame.getpixel((100, 10)) == blue
  assert frame.getpixel((50, 50)) == blue
  assert frame.getpixel((100, 250)) == blue


def test_stroke_only_shapes_keep_their_interior():
  scene = Scene()
  scene.clear("blue")
  scene.set_stroke_color("red")
  scene.remove_fill_color()
  scene.draw_rectangle(50, 50, 100, 100)
  frame = PILImage.open(io.BytesIO(_render_gif(scene.get_actions()))).convert("RGB")
  assert frame.getpixel((50, 50)) == (255, 0, 0)
  assert frame.getpixel((100, 100)) == (0, 0, 255)


def _single_frame_scene(build_pauses):
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  build_pauses(scene)
  return PILImage.open(io.BytesIO(_render_gif(scene.get_actions())))


@pytest.mark.parametrize(
  "seconds",
  [0.01, 0, -1, MAX_PAUSE_SECONDS + 1, 1000, float("nan"), float("inf")],
)
def test_out_of_range_pause_raises_at_the_call(seconds):
  # A gif delay is 16 bits of centiseconds, so a student who meant milliseconds
  # would otherwise overflow that field inside Pillow. A nan compares false
  # against both bounds, so it used to reach the frame delay and raise there.
  scene = Scene()
  with pytest.raises(ValueError):
    scene.pause(seconds)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


@pytest.mark.parametrize(
  "seconds",
  [0.01, 0, -1, MAX_PAUSE_SECONDS + 1, 1000, float("nan"), float("inf")],
)
def test_out_of_range_note_duration_raises_at_the_call(seconds):
  # An unbounded duration reaches truncate_samples, where a negative once
  # trimmed the note's tail and played nearly all of it.
  scene = Scene()
  with pytest.raises(ValueError):
    scene.play_note(60, seconds)
  with pytest.raises(ValueError):
    scene.play_note_and_pause(60, seconds)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


@pytest.mark.parametrize("note", [MIN_NOTE - 1, MAX_NOTE + 1, 0, -1, 128, 84.6])
def test_out_of_range_note_raises_at_the_call(note):
  # Only notes with a bundled sample can sound; the renderer skips the rest in
  # silence, so the scene never plays and never says why.
  scene = Scene()
  with pytest.raises(ValueError):
    scene.play_note(note, 0.5)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


def test_note_rounds_to_a_whole_semitone():
  # Integer division is easy to miss: 120/2 is 60.0, and no 60.0 sample exists.
  scene = Scene()
  scene.play_note(120 / 2, 0.5)
  assert scene.get_actions()[0].note == 60


@pytest.mark.parametrize("instrument", ["BASS", "bass", Instrument.BASS])
def test_instrument_accepts_a_name_or_the_enum(instrument):
  scene = Scene()
  scene.play_note(60, 0.5, instrument=instrument)
  assert scene.get_actions()[0].instrument is Instrument.BASS


@pytest.mark.parametrize("instrument", ["TUBA", "", None, 3])
def test_unknown_instrument_raises_at_the_call(instrument):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.play_note(60, 0.5, instrument=instrument)
  assert scene.get_actions() == []


@pytest.mark.parametrize("seconds", [MIN_PAUSE_SECONDS, 1.5, MAX_PAUSE_SECONDS])
def test_pause_accepts_the_whole_documented_range(seconds):
  gif = _single_frame_scene(lambda scene: scene.pause(seconds))
  assert gif.info["duration"] == int(round(seconds * 1000))


def test_long_animation_is_not_capped_by_total_duration():
  # Only a single frame's delay is bounded, never the animation's total, so
  # frames that differ still encode however long they run.
  scene = Scene()
  for i in range(4):
    scene.set_fill_color(theater.Color(i * 20, 0, 0))
    scene.draw_rectangle(0, 0, 50, 50)
    scene.pause(MAX_PAUSE_SECONDS)
  gif = PILImage.open(io.BytesIO(_render_gif(scene.get_actions())))
  assert gif.n_frames == 4
  assert gif.info["duration"] == int(MAX_PAUSE_SECONDS * 1000)


def test_pauses_accumulating_on_one_picture_raise():
  # Pillow folds a frame identical to its predecessor into that earlier frame,
  # summing the delays, so clamping each pause alone does not bound the field.
  # Each pause is long enough to overflow well inside the frame ceiling, which
  # would otherwise be the error that fires.
  seconds_each = 2
  pause_count = int(MAX_PAUSE_SECONDS / seconds_each) + 1
  assert pause_count < MAX_FRAMES
  with pytest.raises(PauseTooLongError):
    _single_frame_scene(
      lambda scene: [scene.pause(seconds_each) for _ in range(pause_count)]
    )


def _gif_total_milliseconds(gif_bytes):
  gif = PILImage.open(io.BytesIO(gif_bytes))
  total = 0
  for index in range(gif.n_frames):
    gif.seek(index)
    total += gif.info["duration"]
  return total


@pytest.mark.parametrize("seconds_each", [0.125, 60 / 140, 0.333])
def test_audio_keeps_step_with_the_video(seconds_each):
  # A gif delay is a whole centisecond, so a 0.125 s pause is 0.12 s of video.
  # An audio cursor advancing by the exact seconds instead slid about 8 ms per
  # note at a typical tempo, some seconds over a long melody.
  scene = Scene()
  for index in range(20):
    scene.set_fill_color(theater.Color(index * 10, 0, 0))
    scene.draw_rectangle(0, 0, 50, 50)
    scene.pause(seconds_each)
  # A single sample at the end, so the audio's length is the cursor itself.
  scene.play_sound([1.0])
  gif_bytes, wav = render(scene.get_actions())
  cursor_samples = len(read_samples_from_wav_bytes(wav)) - 1
  video_ms = _gif_total_milliseconds(gif_bytes)
  assert cursor_samples == video_ms * SAMPLE_RATE // 1000


def _scene_sounding_after(pause_seconds):
  """A scene whose one note lands after the given delay."""
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(pause_seconds)
  scene.play_note(60, 0.5)
  return scene


def test_too_long_audio_raises():
  # A note after long pauses is silence all the way to the cursor, 8 bytes a
  # sample, so the array asked for here is larger than the worker's whole heap.
  with pytest.raises(AudioTooLongError):
    render(_scene_sounding_after(MAX_AUDIO_SECONDS + 1).get_actions())


def test_audio_ceiling_is_checked_before_drawing(monkeypatch):
  _explode_on_drawing(monkeypatch)
  scene = _scene_sounding_after(MAX_AUDIO_SECONDS + 1)
  scene.draw_rectangle(0, 0, 10, 10)
  with pytest.raises(AudioTooLongError):
    render(scene.get_actions())


def test_audio_ceiling_allows_a_full_length_track():
  _gif, wav = render(_scene_sounding_after(MAX_AUDIO_SECONDS - 1).get_actions())
  samples = read_samples_from_wav_bytes(wav)
  assert len(samples) / SAMPLE_RATE == pytest.approx(MAX_AUDIO_SECONDS - 0.5, abs=0.01)


def test_pauses_after_the_last_sound_do_not_count():
  # Silence past the final sound is never allocated, so it cannot exhaust the
  # heap and must not count against the ceiling.
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.play_note(60, 0.5)
  scene.pause(MAX_AUDIO_SECONDS)
  scene.pause(MAX_AUDIO_SECONDS)
  _gif, wav = render(scene.get_actions())
  assert len(read_samples_from_wav_bytes(wav)) / SAMPLE_RATE == pytest.approx(0.5, abs=0.01)


@pytest.mark.parametrize("points", [[], [0], [0, 0], [0, 0, 10], [0, 0, 10, 10, 20]])
def test_unusable_shape_points_raise_at_the_call(points):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_shape(points, True)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


@pytest.mark.parametrize(
  "points", [[(0, 0), (10, 10)], [[0, 0], [10, 10], [20, 0]], ((0, 0), (1, 1))]
)
def test_a_list_of_points_says_what_the_flat_form_is(points):
  # The flat run of coordinates reads easily as a list of points, and counting
  # the numbers that arrived is no help to a student who wrote pairs.
  scene = Scene()
  with pytest.raises(ValueError, match="flat list of coordinates"):
    scene.draw_shape(points, True)


def test_draw_shape_accepts_the_flat_form():
  scene = Scene()
  scene.draw_shape([0, 0, 10, 10], False)
  scene.draw_shape((0, 0, 10, 10, 20, 0), True)
  scene.draw_shape(iter([0, 0, 10, 10, 20, 0]), True)
  scene.pause(0.1)
  assert _render_gif(scene.get_actions())


@pytest.mark.parametrize(
  "height", [0, -1, -20, MAX_TEXT_HEIGHT + 1, 12000, float("nan"), float("inf")]
)
def test_out_of_range_text_height_raises_at_the_call(height):
  # Pillow builds a bitmap as tall as the text: a height of 12000 costs 163 MB
  # for one letter, and 20000 reaches Pillow's own decompression-bomb guard,
  # whose message is no help to a student. Zero and below Pillow simply refuses.
  scene = Scene()
  with pytest.raises(ValueError):
    scene.set_text_height(height)
  # The height was not kept, so a later draw_text still renders.
  scene.draw_text("hi", 10, 20)
  scene.pause(0.1)
  assert _render_gif(scene.get_actions())


@pytest.mark.parametrize("height", [MIN_TEXT_HEIGHT, 20, MAX_TEXT_HEIGHT])
def test_text_height_accepts_the_whole_documented_range(height):
  scene = Scene()
  scene.set_text_height(height)
  scene.draw_text("A", 0, THEATER_HEIGHT)
  scene.pause(0.1)
  assert _render_gif(scene.get_actions())


def test_text_too_long_for_its_height_raises_at_the_call():
  # Length costs what height costs, since the whole string is drawn into one
  # bitmap before any of it is clipped to the stage.
  scene = Scene()
  scene.set_text_height(400)
  characters = MAX_TEXT_PIXELS // (400 * 400) + 1
  with pytest.raises(ValueError):
    scene.draw_text("A" * characters, 0, 0)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


def test_a_paragraph_at_a_readable_height_is_allowed():
  # The extent ceiling must not stand in the way of ordinary text.
  scene = Scene()
  scene.set_text_height(20)
  scene.draw_text("The quick brown fox. " * 100, 0, 200)
  scene.pause(0.1)
  assert _render_gif(scene.get_actions())


@pytest.mark.parametrize("sides", [0, 1, 2, -3])
def test_too_few_polygon_sides_raises_at_the_draw_call(sides):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_regular_polygon(200, 200, sides, 50)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


def test_draw_regular_polygon_accepts_float_sides():
  scene = Scene()
  scene.set_fill_color("red")
  scene.draw_regular_polygon(200, 200, 12 / 2, 50)
  frame = PILImage.open(io.BytesIO(_render_gif(scene.get_actions()))).convert("RGB")
  assert frame.getpixel((200, 200)) == (255, 0, 0)


def test_draw_image_accepts_float_geometry():
  # Ordinary student arithmetic like 400 / 2 yields floats, which Pillow's
  # resize and paste reject outright.
  image = Image(20, 20)
  image.clear(theater.Color("red"))
  scene = Scene()
  scene.draw_image(image, 400 / 2, 100 / 2, size=60 / 2)
  scene.draw_image(image, 10.5, 10.5, width=30.5, height=30.5)
  scene.draw_image(image, 300 / 2, 50.5, size=40.5, rotation=45)
  gif_bytes = _render_gif(scene.get_actions())
  assert len(gif_bytes) > 0


@pytest.mark.parametrize("size", [-1, 0, 0.4, -100, float("nan")])
def test_unusable_draw_image_size_raises_at_the_call(size):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_image(Image(10, 10), 0, 0, size=size)
  # Nothing was recorded, so render() never sees the bad value.
  assert scene.get_actions() == []


@pytest.mark.parametrize("width,height", [(-1, 10), (10, -1), (0, 0), (0.4, 0.4)])
def test_unusable_draw_image_extent_raises_at_the_call(width, height):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_image(Image(10, 10), 0, 0, width=width, height=height)
  assert scene.get_actions() == []


def test_draw_image_records_one_dimension_and_leaves_the_other_unset():
  # The renderer picks its branch on which one is None, so a size and an
  # extent must never both be recorded.
  scene = Scene()
  scene.draw_image(Image(10, 10), 0, 0, size=50)
  scene.draw_image(Image(10, 10), 0, 0, width=20, height=30)
  by_size, by_extent = scene.get_actions()
  assert (by_size.size, by_size.width, by_size.height) == (50, None, None)
  assert (by_extent.size, by_extent.width, by_extent.height) == (None, 20, 30)


@pytest.mark.parametrize(
  "geometry",
  [
    {"size": MAX_DRAW_IMAGE_SIZE + 1},
    {"width": MAX_DRAW_IMAGE_SIZE + 1, "height": 10},
    {"width": 10, "height": MAX_DRAW_IMAGE_SIZE + 1},
  ],
)
def test_oversized_draw_image_raises_at_the_call(geometry):
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_image(Image(10, 10), 0, 0, **geometry)
  assert scene.get_actions() == []


def test_oversized_scaled_height_raises_at_the_call():
  # size only sets the width; a tall image's height is scaled past the ceiling.
  scene = Scene()
  with pytest.raises(ValueError):
    scene.draw_image(Image(1, 10), 0, 0, size=MAX_DRAW_IMAGE_SIZE)
  assert scene.get_actions() == []


def test_draw_image_accepts_the_largest_allowed_size():
  scene = Scene()
  scene.draw_image(Image(10, 10), 0, 0, size=MAX_DRAW_IMAGE_SIZE)
  scene.draw_image(
    Image(10, 10), 0, 0, width=MAX_DRAW_IMAGE_SIZE, height=MAX_DRAW_IMAGE_SIZE
  )
  scene.draw_image(Image(1, 10), 0, 0, size=MAX_DRAW_IMAGE_SIZE / 10)
  assert len(scene.get_actions()) == 3


def test_draw_image_lands_at_rounded_position():
  image = Image(10, 10)
  image.clear(theater.Color("red"))
  scene = Scene()
  scene.draw_image(image, 20.6, 30.6, size=10)
  frame = PILImage.open(io.BytesIO(_render_gif(scene.get_actions()))).convert("RGB")
  assert frame.getpixel((21, 31)) == (255, 0, 0)
  assert frame.getpixel((20, 30)) == (255, 255, 255)


def test_play_scenes_renders_and_returns_bytes():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  gif_bytes, wav_bytes = theater.play_scenes(scene)
  assert len(gif_bytes) > 0
  assert wav_bytes is None


def test_gif_duration_is_the_sum_of_the_pauses():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(0.5)
  scene.draw_rectangle(20, 20, 10, 10)
  scene.pause(0.125)

  # 0.125 rounds to a centisecond, the finest delay a gif frame can express.
  assert gif_duration_ms(scene.get_actions()) == 620


def test_gif_duration_is_zero_without_a_pause():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)

  assert gif_duration_ms(scene.get_actions()) == 0
