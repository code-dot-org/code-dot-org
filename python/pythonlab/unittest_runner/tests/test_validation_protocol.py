import os
from unittest_runner.validation_protocol import ValidationProtocol
from neighborhood import World, NeighborhoodContextType

def test_invoke_main_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  validation_protocol.invoke_main(main_path)
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN

def test_invoke_invalid_main_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = 'non_existent_main.py'
  validation_protocol.invoke_main(main_path)
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN

def test_collects_system_out():
  validation_protocol = ValidationProtocol()
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  validation_protocol.invoke_main(main_path)
  lines = validation_protocol.get_stdout_lines()
  assert len(lines) == 1
  assert lines[0] == 'Hello world'
  validation_protocol.clean_up()
