import os
from unittest_runner.validation_protocol import ValidationProtocol
from neighborhood import World, NeighborhoodContextType

def test_get_neighborhood_log_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  validation_protocol.get_neighborhood_log(main_path)
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN

def test_get_neighborhood_log_with_invalid_main_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = 'non_existent_main.py'
  validation_protocol.get_neighborhood_log(main_path)
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN

def test_get_stdout_logs():
  validation_protocol = ValidationProtocol()
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  lines = validation_protocol.get_stdout_logs(main_path)
  assert len(lines) == 1
  assert lines[0] == 'Hello world'
