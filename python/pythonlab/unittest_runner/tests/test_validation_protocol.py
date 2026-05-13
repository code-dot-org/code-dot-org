import os
from unittest_runner.validation_protocol import ValidationProtocol
from neighborhood import World, NeighborhoodContextType
from .constants import SAMPLE_MAZE

def test_get_neighborhood_log_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  validation_protocol.get_neighborhood_log(main_path)
  assert neighborhood_world.context_type is NeighborhoodContextType.RUN

def test_get_neighborhood_log_returns_expected_info():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main.py')
  neighborhood_log = validation_protocol.get_neighborhood_log(main_path)
  painter_logs = neighborhood_log.painter_logs
  assert len(painter_logs) == 2
  painter_log_1 = painter_logs[0]
  painter_log_2 = painter_logs[1]
  assert painter_log_1.did_action_exactly('TURN_LEFT', 2) is True
  assert painter_log_2.did_action_exactly('TAKE_PAINT', 0) is True
  assert painter_log_2.did_action_exactly('MOVE', 2) is True
  grid_size = 2
  expected_neighborhood_state = [[None for _ in range(grid_size)] for _ in range(grid_size)]
  expected_neighborhood_state[1][0] = 'Red'
  expected_neighborhood_state[1][1] = 'Blue'
  assert neighborhood_log.final_output_matches(expected_neighborhood_state)
  assert neighborhood_log.one_painter_did_action('TURN_LEFT', 1)
  assert neighborhood_log.one_painter_did_action('TURN_LEFT', 2)
  assert neighborhood_log.action_happened('TURN_LEFT', 3)

def test_main_with_function_returns_expected_info():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
  neighborhood_world.set_context_type(NeighborhoodContextType.VALIDATE)
  main_path = os.path.join(os.path.dirname(__file__), 'sample_main_with_function.py')
  neighborhood_log = validation_protocol.get_neighborhood_log(main_path)
  painter_logs = neighborhood_log.painter_logs
  assert len(painter_logs) == 2
  painter_log_1 = painter_logs[0]
  assert painter_log_1.did_action_exactly

def test_get_neighborhood_log_with_invalid_main_resets_context():
  validation_protocol = ValidationProtocol()
  neighborhood_world = World()
  neighborhood_world.set_grid_from_string(SAMPLE_MAZE)
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
