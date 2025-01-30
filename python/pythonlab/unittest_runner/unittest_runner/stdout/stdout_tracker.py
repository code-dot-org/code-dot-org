from io import StringIO
import sys

class StdoutTracker(object):
  def __init__(self):
    self._stdout = None
    self._stdout_buffer = None

  def start_tracking(self):
    if (self._stdout is None):
      self._stdout = sys.stdout
    self._stdout_buffer = StringIO()
    sys.stdout = self._stdout_buffer

  def stop_tracking(self):
    if (self._stdout is not None):
      sys.stdout = self._stdout
  
  def get_stdout_lines(self) -> list[str]:
    if (self._stdout_buffer is None):
      return []
    return self._stdout_buffer.getvalue().splitlines()
  
  def clean_up(self):
    if (self._stdout_buffer is not None):
      self._stdout_buffer.close()