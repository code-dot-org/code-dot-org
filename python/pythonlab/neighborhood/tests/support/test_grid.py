from neighborhood.support.grid import Grid
from neighborhood.support.grid_square import GridSquare
from neighborhood.support.neighborhood_runtime_exception import NeighborhoodRuntimeException

passable_grid_square = GridSquare(1, 0)
bucket_grid_square = GridSquare(1, 0, 3)
obstacle_grid_square = GridSquare(4, 0)
wall_grid_square = GridSquare(0, 0)

sample_grid = [[wall_grid_square, passable_grid_square],
               [obstacle_grid_square, bucket_grid_square]]

def test_valid_location():
    grid = Grid(sample_grid)
    # wall
    assert not grid.valid_location(0, 0)
    # obstacle
    assert not grid.valid_location(1, 0)
    # passable
    assert grid.valid_location(0, 1)
    # bucket is valid
    assert grid.valid_location(1, 1)
    # out of range
    assert not grid.valid_location(2, 0)
    assert not grid.valid_location(1, 2)

def test_cannot_create_invalid_grid():
    try:
        Grid([[wall_grid_square, passable_grid_square], [obstacle_grid_square]])
        assert False
    except NeighborhoodRuntimeException as e:
        assert str(e) == "NeighborhoodRuntimeException: INVALID_GRID: Grid is not a square"
