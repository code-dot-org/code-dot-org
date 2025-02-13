from unittest_runner.stdout.stdout_tracker import StdoutTracker

def test_captures_stdout():
  stdout_tracker = StdoutTracker()
  stdout_tracker.start_tracking()
  print('line 1')
  print('line 2')
  lines = stdout_tracker.get_stdout_lines()
  assert len(lines) == 2
  assert lines[0] == 'line 1'
  assert lines[1] == 'line 2'
  stdout_tracker.clean_up()
  stdout_tracker.stop_tracking()

def test_does_not_capture_after_stopping():
  stdout_tracker = StdoutTracker()
  stdout_tracker.start_tracking()
  stdout_tracker.stop_tracking()
  print('line 1')
  lines = stdout_tracker.get_stdout_lines()
  assert len(lines) == 0
  stdout_tracker.clean_up()
