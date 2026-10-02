import wave

from PIL import Image as PILImage

from theater import Image, Instrument, Scene
from theater.support.constants import SAMPLE_RATE
from theater.support.describe import describe


def _transcript(scene):
  return describe(scene.get_actions()).transcript


def _summary(scene):
  return describe(scene.get_actions()).summary


def test_a_scene_that_draws_nothing_says_so():
  assert _transcript(Scene()) == "Nothing was drawn on the stage."


def test_a_background_alone_leaves_the_stage_empty():
  scene = Scene()
  scene.clear("red")
  assert _summary(scene) == "Still picture, on a red background."
  assert _transcript(scene) == "Nothing was drawn on the stage."


def test_a_scene_with_no_pause_is_summarized_as_a_still_picture():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  assert _summary(scene) == "Still picture."


def test_the_summary_reports_the_background_frame_count_and_lengths():
  scene = Scene()
  scene.clear("red")
  scene.play_note(60, 0.5)
  scene.pause(0.25)
  scene.pause(0.25)
  assert _summary(scene) == (
    "Animation: 3 frames over 0.5 seconds, on a red background, "
    "with 0.5 seconds of sound."
  )


def test_each_frame_is_headed_with_how_long_it_holds():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(0.25)
  scene.draw_ellipse(0, 0, 10, 10)
  lines = _transcript(scene).splitlines()
  headings = [line for line in lines if line.startswith("Frame ")]
  assert headings == ["Frame 1 of 2, 0.25 seconds", "Frame 2 of 2, until the end"]


def test_only_a_leading_clear_is_folded_into_the_summary():
  scene = Scene()
  scene.clear("red")
  scene.clear("blue")
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Cleared the stage to blue.\nShapes: black rectangle."


def test_a_clear_drops_what_the_same_frame_drew_before_it():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.clear("blue")
  scene.pause(0.25)
  scene.draw_ellipse(0, 0, 10, 10)
  assert _transcript(scene) == (
    "Frame 1 of 2, 0.25 seconds\nCleared the stage to blue.\n\n"
    "Frame 2 of 2, until the end\nShapes: black ellipse."
  )


def test_a_clear_keeps_sound_the_same_frame_already_played():
  scene = Scene()
  scene.play_note(60, 0.25)
  scene.clear("blue")
  assert _transcript(scene) == "Cleared the stage to blue.\nSound: piano note C4."


def test_a_later_frame_says_added_for_drawing_but_not_for_sound():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(0.25)
  scene.draw_ellipse(0, 0, 10, 10)
  scene.play_note(60, 0.25)
  assert _transcript(scene).splitlines()[-2:] == [
    "Added shapes: black ellipse.",
    "Sound: piano note C4.",
  ]


def test_a_frame_that_clears_starts_over_rather_than_adding():
  scene = Scene()
  scene.draw_rectangle(0, 0, 10, 10)
  scene.pause(0.25)
  scene.clear("red")
  scene.draw_ellipse(0, 0, 10, 10)
  assert _transcript(scene).splitlines()[-1] == "Shapes: black ellipse."


def test_drawings_are_grouped_by_kind(tmp_path):
  path = tmp_path / "cat.png"
  PILImage.new("RGBA", (10, 10)).save(path)
  scene = Scene()
  scene.set_fill_color("red")
  scene.draw_ellipse(0, 0, 10, 10)
  scene.draw_text("Hi", 0, 0)
  scene.draw_image(str(path), 0, 0, size=50)
  scene.play_note(60, 0.25)
  assert _transcript(scene) == (
    'Shapes: red ellipse.\nImages: cat.png.\nText: "Hi".\nSound: piano note C4.'
  )


def test_only_text_that_is_not_the_default_black_is_named_by_its_color():
  scene = Scene()
  scene.draw_text("Hi", 0, 0)
  scene.set_text_color("red")
  scene.draw_text("Bye", 0, 0)
  assert _transcript(scene) == 'Text: "Hi", red "Bye".'


def test_repeated_text_puts_the_count_after_the_label():
  scene = Scene()
  for _ in range(3):
    scene.draw_text("Hi", 0, 0)
  assert _transcript(scene) == 'Text: "Hi" 3 times.'


def test_a_line_is_named_by_its_stroke_color():
  scene = Scene()
  scene.set_stroke_color("red")
  scene.draw_line(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: red line."


def test_a_wide_outline_in_another_color_is_named():
  scene = Scene()
  scene.set_fill_color("red")
  scene.set_stroke_color("blue")
  scene.set_stroke_width(4)
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: blue-outlined red rectangle."


def test_a_hairline_outline_is_left_unsaid():
  scene = Scene()
  scene.set_fill_color("red")
  scene.set_stroke_color("blue")
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: red rectangle."


def test_a_wide_outline_matching_the_fill_is_left_unsaid():
  scene = Scene()
  scene.set_fill_color("red")
  scene.set_stroke_color("red")
  scene.set_stroke_width(4)
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: red rectangle."


def test_repeated_outlined_shapes_pluralize_the_shape_name():
  scene = Scene()
  scene.set_fill_color("red")
  scene.set_stroke_color("blue")
  scene.set_stroke_width(4)
  for offset in range(3):
    scene.draw_rectangle(offset, 0, 10, 10)
  assert _transcript(scene) == "Shapes: 3 blue-outlined red rectangles."


def test_a_shape_is_named_by_its_fill_color():
  scene = Scene()
  scene.set_fill_color("red")
  scene.draw_rectangle(40, 100, 320, 200)
  assert _transcript(scene) == "Shapes: red rectangle."


def test_a_shape_without_fill_is_named_by_its_outline():
  scene = Scene()
  scene.remove_fill_color()
  scene.set_stroke_color("blue")
  scene.draw_ellipse(0, 0, 10, 20)
  assert _transcript(scene) == "Shapes: blue ellipse."


def test_an_open_shape_is_named_by_its_outline():
  scene = Scene()
  scene.set_fill_color("red")
  scene.set_stroke_color("blue")
  scene.draw_shape([0, 0, 10, 10, 20, 0], False)
  assert _transcript(scene) == "Shapes: blue open shape."


def test_an_off_palette_color_takes_the_nearest_name():
  scene = Scene()
  scene.set_fill_color("#4c42cf")
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: indigo rectangle."


def test_a_line_with_no_color_is_left_out():
  scene = Scene()
  scene.remove_stroke_color()
  scene.draw_line(0, 0, 50, 50)
  assert _transcript(scene) == "Nothing was drawn on the stage."


def test_a_shape_with_no_fill_and_no_outline_is_left_out():
  scene = Scene()
  scene.remove_fill_color()
  scene.remove_stroke_color()
  scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Nothing was drawn on the stage."


def test_a_polygon_reports_its_number_of_sides():
  scene = Scene()
  scene.set_fill_color("lime")
  scene.draw_regular_polygon(1, 1, 6, 40)
  assert _transcript(scene) == "Shapes: lime 6-sided polygon."


def test_a_note_names_the_instrument_and_pitch():
  scene = Scene()
  scene.play_note(60, 0.25, Instrument.BASS)
  assert _transcript(scene) == "Sound: bass note C4."


def test_a_sound_read_from_a_file_is_named(tmp_path):
  path = tmp_path / "bark.wav"
  with wave.open(str(path), "wb") as writer:
    writer.setnchannels(1)
    writer.setsampwidth(2)
    writer.setframerate(SAMPLE_RATE)
    writer.writeframes(b"\x00\x00" * SAMPLE_RATE)
  scene = Scene()
  scene.play_sound(str(path))
  assert _transcript(scene) == "Sound: bark.wav."


def test_a_sound_built_from_samples_reports_its_length():
  scene = Scene()
  scene.play_sound([0.1] * SAMPLE_RATE)
  assert _transcript(scene) == "Sound: a sound 1 second long."


def test_an_image_drawn_in_code_has_no_name():
  scene = Scene()
  scene.draw_image(Image(8, 8), 0, 0, width=10, height=20)
  assert _transcript(scene) == "Images: a picture made in code."


def test_repeated_shapes_are_counted_rather_than_listed():
  scene = Scene()
  for _ in range(12):
    scene.draw_rectangle(0, 0, 10, 10)
  assert _transcript(scene) == "Shapes: 12 black rectangles."


def test_repeated_sounds_put_the_count_after_the_name():
  scene = Scene()
  scene.play_note(60, 0.25)
  scene.play_note(60, 0.25)
  assert _transcript(scene) == "Sound: piano note C4 2 times."


def test_one_frame_past_the_cutoff_is_singular():
  scene = Scene()
  for _ in range(50):
    scene.pause(0.1)
  assert _transcript(scene).endswith("and 1 more frame.")


def test_a_long_list_of_drawings_is_cut_off():
  scene = Scene()
  for size in range(1, 12):
    scene.draw_text(f"line {size}", 0, 0)
  assert _transcript(scene).endswith("and 3 more.")


def test_a_long_animation_is_cut_off():
  scene = Scene()
  for _ in range(60):
    scene.pause(0.1)
  assert _transcript(scene).endswith("and 11 more frames.")
