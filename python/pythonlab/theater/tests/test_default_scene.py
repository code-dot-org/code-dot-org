import inspect
import pathlib
import subprocess
import sys

import pytest

import theater
from theater import Scene, scene
from theater.support.actions import SceneActionType


@pytest.fixture(autouse=True)
def fresh_default_scene():
  """Every test starts and ends with nothing recorded on the default scene."""
  scene.reset_default_scene()
  yield
  scene.reset_default_scene()


def action_types(actions):
  return [action.type for action in actions]


def test_import_does_not_create_a_scene():
  # Run in a subprocess: this file's own imports happened before the test
  # started, so nothing measured in-process can rule out a scene having been
  # built at import time.
  program = '\n'.join([
    'from theater import scene',
    'assert scene._default_scene is None',
    'print("no scene")',
  ])
  result = subprocess.run(
    [sys.executable, '-c', program], capture_output=True, text=True)
  assert result.returncode == 0, result.stderr
  assert result.stdout == 'no scene\n'


def test_scene_is_created_on_first_call():
  assert scene._default_scene is None
  scene.draw_rectangle(10, 10, 50, 50)
  assert scene._default_scene is not None


def test_repeated_calls_record_on_one_scene():
  scene.draw_rectangle(10, 10, 50, 50)
  first = scene._get_default_scene()
  scene.pause(0.5)
  scene.draw_ellipse(0, 0, 20, 20)
  assert scene._get_default_scene() is first
  assert action_types(scene.get_actions()) == [
    SceneActionType.DRAW_RECTANGLE,
    SceneActionType.PAUSE,
    SceneActionType.DRAW_ELLIPSE,
  ]


def test_style_carries_across_calls():
  # The functions share one scene, so a color set by one applies to the next
  # shape drawn, exactly as it does through a Scene.
  scene.set_fill_color('blue')
  scene.set_stroke_color('red')
  scene.set_stroke_width(4)
  scene.draw_rectangle(0, 0, 10, 10)

  drawn = scene.get_actions()[-1]
  assert (drawn.fill_color.get_red(), drawn.fill_color.get_blue()) == (0, 255)
  assert (drawn.stroke_color.get_red(), drawn.stroke_color.get_blue()) == (255, 0)
  assert drawn.stroke_width == 4


def test_stage_size_functions():
  assert scene.get_width() == 400
  assert scene.get_height() == 400


def test_validation_still_raises_at_the_call():
  # A wrapper must not swallow or relocate the error the Scene method raises:
  # the traceback has to point at the student's own line.
  with pytest.raises(ValueError, match='play_note needs a note between'):
    scene.play_note(200, 0.5)
  with pytest.raises(ValueError, match='set_text_height needs a height'):
    scene.set_text_height(0)
  with pytest.raises(ValueError, match='draw_image needs either size'):
    scene.draw_image(theater.Image(10, 10), 0, 0)
  # Nothing was recorded by any of the three.
  assert scene.get_actions() == []


def test_play_renders_the_default_scene():
  scene.draw_rectangle(10, 10, 50, 50)
  gif_bytes, wav_bytes = scene.play()
  assert gif_bytes.startswith(b'GIF')
  assert wav_bytes is None


def test_play_renders_audio():
  scene.draw_rectangle(10, 10, 50, 50)
  scene.play_note(60, 0.5)
  _gif, wav_bytes = scene.play()
  assert wav_bytes is not None


def test_play_matches_play_scenes_on_the_same_actions():
  explicit = Scene()
  explicit.draw_rectangle(10, 10, 50, 50)
  explicit.pause(0.5)
  explicit.draw_ellipse(0, 0, 20, 20)

  scene.draw_rectangle(10, 10, 50, 50)
  scene.pause(0.5)
  scene.draw_ellipse(0, 0, 20, 20)

  assert scene.play() == theater.play_scenes(explicit)


def test_play_keeps_the_recording():
  # play() renders what has been recorded and leaves it in place, so a second
  # call gives the same animation rather than an empty one.
  scene.draw_rectangle(10, 10, 50, 50)
  first, _wav = scene.play()
  second, _wav = scene.play()
  assert second == first


def test_reset_drops_the_recording():
  scene.draw_rectangle(10, 10, 50, 50)
  first = scene._get_default_scene()
  scene.reset_default_scene()
  assert scene._default_scene is None
  assert scene.get_actions() == []
  assert scene._get_default_scene() is not first


def test_reset_drops_the_drawing_style():
  # Style lives on the scene, so the reset that clears the actions has to clear
  # the colors with them; a run starting on the previous run's fill color would
  # be a subtler bug than one starting on its drawing.
  scene.set_fill_color('blue')
  scene.reset_default_scene()
  scene.draw_rectangle(0, 0, 10, 10)
  fill = scene.get_actions()[-1].fill_color
  assert (fill.get_red(), fill.get_green(), fill.get_blue()) == (0, 0, 0)


def test_scene_play_renders_one_scene():
  explicit = Scene()
  explicit.draw_rectangle(10, 10, 50, 50)
  assert explicit.play() == theater.play_scenes(explicit)


def test_scene_name_refers_to_the_submodule():
  # `from theater import scene` must keep resolving to the module, so
  # scene.draw_ellipse() and theater.scene.draw_ellipse() are the same function.
  assert scene is sys.modules['theater.scene']
  assert theater.scene is sys.modules['theater.scene']


def test_no_exported_name_shadows_a_submodule():
  # theater exports a play() function, so a submodule named play.py would end up
  # with theater.play the function and sys.modules['theater.play'] the module --
  # two different `play`s in one program. Only `scene` may be both, and there it
  # is the module that wins.
  package_dir = pathlib.Path(theater.__file__).parent
  submodules = {path.stem for path in package_dir.glob('*.py')} - {'__init__'}
  assert submodules & set(theater.__all__) == {'scene'}


def test_star_import_names_all_exist():
  for name in theater.__all__:
    assert hasattr(theater, name)


def test_every_scene_method_has_a_function():
  # Adding a method to Scene means adding a function for it and an __all__
  # entry. Deriving __all__ from Scene instead would turn a forgotten function
  # into an AttributeError on `from theater import *`, which students would hit
  # before we did.
  methods = {name for name, value in vars(Scene).items()
             if not name.startswith('_') and callable(value)}
  functions = {name for name, value in vars(scene).items()
               if inspect.isfunction(value) and not name.startswith('_')
               and value.__module__ == scene.__name__}
  # get_actions() and reset_default_scene() are harness machinery, not student
  # API, so they are the one pair that exists without an __all__ entry.
  assert functions == methods | {'reset_default_scene'}
  assert set(theater.__all__) == (
    (methods - {'get_actions'})
    | {'Scene', 'scene', 'play_scenes', 'Color', 'Font', 'FontStyle', 'Image',
       'Instrument'}
  )


def test_function_signatures_match_their_methods():
  # A wrapper whose defaults drifted from the method's would silently change
  # what a student's call does.
  for name, method in vars(Scene).items():
    if name.startswith('_') or not callable(method):
      continue
    function = getattr(scene, name)
    method_parameters = list(inspect.signature(method).parameters.values())[1:]
    assert method_parameters == list(inspect.signature(function).parameters.values()), name
