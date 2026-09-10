import subprocess
import sys
import types
from unittest import mock

from pythonlab_setup.reset_theater import reset_theater

def test_resets_the_default_scene():
  # Python Lab reuses one interpreter, so teardown between runs is what keeps a
  # scene from replaying the previous run's drawing.
  from theater import scene
  scene.draw_rectangle(10, 10, 50, 50)
  assert scene.get_actions() != []
  reset_theater()
  assert scene.get_actions() == []

def test_leaves_theater_unimported():
  # The theater wheel is loaded only for a program that imports theater (see
  # ON_DEMAND_PACKAGE_URLS), so on any other run there is nothing for an import
  # to find. Run in a subprocess: this file imports theater above.
  program = '\n'.join([
    'import sys',
    'from pythonlab_setup.reset_theater import reset_theater',
    'reset_theater()',
    "assert 'theater' not in sys.modules",
    'print("theater untouched")',
  ])
  result = subprocess.run(
    [sys.executable, '-c', program], capture_output=True, text=True)
  assert result.returncode == 0, result.stderr
  assert result.stdout == 'theater untouched\n'

def test_tolerates_a_student_file_named_theater():
  # Pyodide runs student code with the working directory on sys.path, so a file
  # named theater.py takes the name in sys.modules. Teardown must still finish:
  # it runs before the stdout flush and the module-cache purge.
  shadow = types.ModuleType('theater')
  with mock.patch.dict(sys.modules, {'theater': shadow}):
    reset_theater()
