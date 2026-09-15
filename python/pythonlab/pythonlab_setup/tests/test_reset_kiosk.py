import subprocess
import sys
import types
from unittest import mock

from pythonlab_setup.reset_kiosk import reset_kiosk

def test_resets_the_default_screen():
  # Python Lab reuses one interpreter, so teardown between runs is what keeps
  # the next run from starting on the previous run's screen.
  import kiosk
  kiosk.add_button('go', 'Press me', 0, 0)
  reset_kiosk()
  # A fresh screen has nothing on it, so the same id is free again.
  kiosk.add_button('go', 'Press me', 0, 0)
  kiosk.reset_default_screen()

def test_leaves_kiosk_unimported():
  # The kiosk wheel is loaded only for a program that imports kiosk (see
  # ON_DEMAND_PACKAGE_URLS), so on any other run there is nothing for an import
  # to find. Run in a subprocess: this file imports kiosk above.
  program = '\n'.join([
    'import sys',
    'from pythonlab_setup.reset_kiosk import reset_kiosk',
    'reset_kiosk()',
    "assert 'kiosk' not in sys.modules",
    'print("kiosk untouched")',
  ])
  result = subprocess.run(
    [sys.executable, '-c', program], capture_output=True, text=True)
  assert result.returncode == 0, result.stderr
  assert result.stdout == 'kiosk untouched\n'

def test_tolerates_a_student_file_named_kiosk():
  # Pyodide runs student code with the working directory on sys.path, so a file
  # named kiosk.py takes the name in sys.modules. Teardown must still finish:
  # it runs before the stdout flush and the module-cache purge.
  shadow = types.ModuleType('kiosk')
  with mock.patch.dict(sys.modules, {'kiosk': shadow}):
    reset_kiosk()
