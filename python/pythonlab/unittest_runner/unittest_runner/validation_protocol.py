from neighborhood import World, NeighborhoodContextType
from .stdout.stdout_tracker import StdoutTracker

class ValidationProtocol(object):

  def __init__(self):
    self.stdout_tracker = StdoutTracker()

  def get_stdout_logs(self, file_path = None) -> list[str]:
    self.stdout_tracker.clean_up()
    self.stdout_tracker.start_tracking()

    self._invoke_main(file_path)

    self.stdout_tracker.stop_tracking()
    lines = self.stdout_tracker.get_stdout_lines()
    self.stdout_tracker.clean_up()
    return lines

  def get_neighborhood_log(self, file_path = None): 
    world = World()
    world.set_context_type(NeighborhoodContextType.VALIDATE)

    self._invoke_main(file_path)

    world.set_context_type(NeighborhoodContextType.RUN)
    # TODO: Actually return neighborhood log

  def _invoke_main(self, file_path = None):
    # Invoke main file. Catch all exceptions so we can clean up afterwards.
    file_path = file_path or 'main.py'
    try:
      with open(file_path) as main_file:
        exec(main_file.read())
    except Exception:
      pass
