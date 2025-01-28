from unittest_runner.validation_procotol import ValidationProtocol
from neighborhood import World, NeighborhoodContextType

def test_invoke_main_method():
  validation_protocol = ValidationProtocol()
  validation_protocol.invoke_main_method()
  neighborhood_world = World()
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN