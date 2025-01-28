import os
from unittest_runner.validation_procotol import ValidationProtocol
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
