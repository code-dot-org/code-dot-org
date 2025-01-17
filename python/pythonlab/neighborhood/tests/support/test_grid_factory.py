import os
import neighborhood.support.grid_factory as grid_factory
from neighborhood.support.neighborhood_runtime_exception import NeighborhoodRuntimeException
from neighborhood.support.square_type import SquareType
from constants import SAMPLE_MAZE

def test_cannot_create_invalid_grid_from_string():
  # non-square grid
  try:
    grid_factory.create_grid_from_string('[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}], [{"tileType":1,"value":0,"assetId":0}]]')
    assert False
  except NeighborhoodRuntimeException as e:
    assert str(e) == "NeighborhoodRuntimeException: INVALID_GRID: Grid is not a square"
  # empty grid
  try:
    grid_factory.create_grid_from_string('[]')
    assert False
  except NeighborhoodRuntimeException as e: 
    assert str(e) == "NeighborhoodRuntimeException: INVALID_GRID: Grid is empty"
  # invalid configuration, missing a tile type
  invalid_grid = '[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],[{"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]'
  try:
    grid_factory.create_grid_from_string(invalid_grid)
    assert False
  except NeighborhoodRuntimeException as e:
    assert str(e) == "NeighborhoodRuntimeException: INVALID_GRID"

def test_can_create_valid_grid_from_string():
  grid = grid_factory.create_grid_from_string(SAMPLE_MAZE)
  assert grid.get_size() == 2
  assert grid.valid_location(0, 0)
  assert grid.grid_squares[0][0].asset_id == 0
  assert grid.grid_squares[1][0].paint_count == 1
  assert grid.grid_squares[0][0].paint_count == 0
  assert grid.grid_squares[0][0].square_type == SquareType.OPEN
  assert not grid.grid_squares[0][1].is_passable()
  assert grid.grid_squares[0][0].is_passable()

def test_can_create_grid_from_json():
  test_file_path = os.path.join(os.path.dirname(__file__), 'serialized_maze.txt')
  grid = grid_factory.create_grid_from_file(test_file_path)
  assert grid.get_size() == 2
  assert grid.valid_location(0, 0)
  assert grid.grid_squares[0][0].asset_id == 0
  assert grid.grid_squares[1][0].paint_count == 1
  assert grid.grid_squares[0][0].paint_count == 0
  assert grid.grid_squares[0][0].square_type == SquareType.OPEN
  assert not grid.grid_squares[0][1].is_passable()
  assert grid.grid_squares[0][0].is_passable()
