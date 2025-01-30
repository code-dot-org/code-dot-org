from neighborhood import World, NeighborhoodContextType
from .stdout.stdout_tracker import StdoutTracker

class ValidationProtocol(object):

  def __init__(self):
    self.stdout_tracker = StdoutTracker()

  def invoke_main(self, file_path = None):
    world = World()
    world.set_context_type(NeighborhoodContextType.VALIDATE)
    self.stdout_tracker.clean_up()
    self.stdout_tracker.start_tracking()
    # Invoke main method. Catch all exceptions so we can reset the context type afterwards.
    file_path = file_path or 'main.py'
    try:
      with open(file_path) as main_file:
        exec(main_file.read())
    except Exception:
      pass

    world.set_context_type(NeighborhoodContextType.RUN)
    self.stdout_tracker.stop_tracking()

  def get_stdout_lines(self) -> list[str]:
    return self.stdout_tracker.get_stdout_lines()
  
  def clean_up(self):
    self.stdout_tracker.clean_up()
