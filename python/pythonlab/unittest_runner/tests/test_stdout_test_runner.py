import os
from unittest_runner.stdout.stdout_test_runner import run_and_get_stdout

def test_collects_stdout():
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  lines = run_and_get_stdout(main_path)
  assert len(lines) == 1
  assert lines[0] == 'Hello world'

def test_returns_empty_if_no_main():
  lines = run_and_get_stdout()
  assert len(lines) == 0
  assert lines == []
