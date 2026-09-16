from unittest import mock

from pythonlab_setup import teardown_pythonlab

def test_finishes_when_a_reset_raises():
  # A student file can take over the `theater` name, so a reset can raise
  # anything. Teardown must still flush, go home, and return without raising:
  # the host appends the module-cache purge to the same script.
  with (
    mock.patch('pythonlab_setup.teardown_pythonlab.reset_theater',
               side_effect=TypeError("'bool' object is not callable")),
    mock.patch('pythonlab_setup.teardown_pythonlab.flush_sysout') as flush_sysout,
    mock.patch('pythonlab_setup.teardown_pythonlab.go_home') as go_home,
  ):
    teardown_pythonlab('/home/pyodide')

  flush_sysout.assert_called_once_with()
  go_home.assert_called_once_with('/home/pyodide')

def test_one_failing_reset_does_not_skip_the_other():
  with (
    mock.patch('pythonlab_setup.teardown_pythonlab.reset_neighborhood',
               side_effect=RuntimeError('shadowed')),
    mock.patch('pythonlab_setup.teardown_pythonlab.reset_theater') as reset_theater,
    mock.patch('pythonlab_setup.teardown_pythonlab.flush_sysout'),
    mock.patch('pythonlab_setup.teardown_pythonlab.go_home'),
  ):
    teardown_pythonlab('/home/pyodide')

  reset_theater.assert_called_once_with()
