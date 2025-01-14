from neighborhood.support.grid_square import GridSquare
from neighborhood.support.neighborhood_runtime_exception import NeighborhoodRuntimeException

def test_can_set_valid_color():
    grid_square = GridSquare(1, 0)
    grid_square.set_color("red")
    assert grid_square.get_color() == "red"

def test_cannot_set_invalid_color():
    grid_square = GridSquare(1, 0)
    try:
        grid_square.set_color("invalid_color")
        assert False
    except NeighborhoodRuntimeException as e:
        assert str(e) == "NeighborhoodRuntimeException: INVALID_COLOR"

def test_cannot_set_color_on_wall():
    grid_square = GridSquare(0, 0)
    grid_square.set_color("red")
    assert grid_square.get_color() is None

def test_printable_description():
    passable_grid_square = GridSquare(1, 0)
    assert passable_grid_square.get_printable_description() == "0"
    passable_grid_square.set_color("red")
    assert passable_grid_square.get_printable_description() == "red"
    passable_grid_square.remove_paint()
    assert passable_grid_square.get_printable_description() == "0"

    wall_grid_square = GridSquare(0, 0)
    assert wall_grid_square.get_printable_description() == "x"

    bucket_grid_square = GridSquare(1, 0, 3)
    assert bucket_grid_square.get_printable_description() == "3"
    bucket_grid_square.collect_paint()
    assert bucket_grid_square.get_printable_description() == "2"

def test_contains_paint():
  grid_square = GridSquare(1, 0)
  assert not grid_square.contains_paint()
  grid_square = GridSquare(1, 0, 1)
  assert grid_square.contains_paint()
  grid_square.collect_paint()
  assert not grid_square.contains_paint()

def test_remove_paint():
  grid_square = GridSquare(1, 0)
  grid_square.set_color("blue")
  assert grid_square.get_color() == "blue"
  grid_square.remove_paint()
  assert grid_square.get_color() is None
