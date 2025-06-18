from neighborhood.painter import Painter
from neighborhood.support.world import World
from neighborhood.support.neighborhood_context_type import NeighborhoodContextType
from support.constants import SAMPLE_MAZE, ALL_PASSABLE_MAZE, BUCKET_MAZE, LARGE_MAZE

def setUp():
  world = World()
  # Set up the world to be from a string rather than trying to load a file.
  world.set_grid_from_string(SAMPLE_MAZE)
  world.set_context_type(NeighborhoodContextType.RUN)

def test_initialize_painter():
  painter1 = Painter()
  assert painter1.get_x() == 0
  assert painter1.get_y() == 0
  assert painter1.get_my_paint() == 0
  assert painter1.get_direction() == "east"
  assert painter1.has_infinite_paint is False
  painter1.turn_left()
  assert painter1.get_direction() == "north"
  painter2 = Painter(1, 2, "south", 10)
  assert painter2.get_x() == 1
  assert painter2.get_y() == 2
  assert painter2.get_direction() == "south"
  assert painter1.get_direction() == "north"
  assert painter2.get_my_paint() == 10

def test_set_paint():
  painter3 = Painter()
  assert painter3.get_my_paint() == 0
  painter3.set_paint(5)
  assert painter3.get_my_paint() == 5

def test_get_initialization_message_detail():
  painter4 = Painter()
  initialization_detail = painter4._get_initialization_message_detail(0,0,'east',0)
  assert initialization_detail == {
    "x": 0,
    "y": 0,
    "direction": 'east',
    "paint": 0,
  }

def test_is_facing_directions():
  painter = Painter(0, 0, "north")
  assert painter.is_facing_north() is True
  assert painter.is_facing_east() is False
  assert painter.is_facing_south() is False
  assert painter.is_facing_west() is False
  painter.turn_left()
  assert painter.is_facing_west() is True

def test_turn_left():
  painter = Painter()
  assert painter.is_facing_east() is True
  painter.turn_left()
  assert painter.is_facing_north() is True

def test_move():
  world2 = World()
  world2.set_grid_from_string(ALL_PASSABLE_MAZE)
  world2.set_context_type(NeighborhoodContextType.RUN)
  painter = Painter() # Default direction is 'east'.
  painter.move()
  assert painter.get_x() == 1
  assert painter.get_y() == 0

  painter = Painter(direction="south")
  painter.world = world2
  painter.move()
  assert painter.get_x() == 0
  assert painter.get_y() == 1

  painter = Painter(1, 1, "north")
  painter.move()
  assert painter.get_x() == 1
  assert painter.get_y() == 0

  painter = Painter(1, 0, "west")
  painter.move()
  assert painter.get_x() == 0
  assert painter.get_y() == 0

def test_has_paint():
  painter = Painter(paint=3)
  assert painter.has_paint() is True
  painter.set_paint(0)
  assert painter.has_paint() is False

def test_bucket():
  world3 = World()
  # Square 0,0 is a bucket with paint_count = 3.
  world3.set_grid_from_string(BUCKET_MAZE)
  world3.set_context_type(NeighborhoodContextType.RUN)
  painter = Painter()
  painter.world = world3
  assert painter.is_on_bucket() is True

  assert painter.has_paint() is False
  painter.take_paint()
  assert painter.has_paint() is True
  assert painter.is_on_bucket() is True
  painter.take_paint()
  painter.take_paint()
  assert painter.is_on_bucket() is False

def test_scrape_paint():
  painter = Painter()
  assert painter.is_on_paint() is False
  assert painter.has_paint() is False
  painter.set_paint(3)
  assert painter.has_paint() is True
  painter.paint('Red')
  assert painter.is_on_paint() is True
  painter.scrape_paint()
  assert painter.is_on_paint() is False

def test_can_move():
  painter = Painter()
  # Painter is on 0,0 in a 2x2 grid.
  assert painter.can_move("north") is False
  assert painter.can_move("south") is True
  assert painter.can_move("east") is True
  assert painter.can_move("west") is False
  # Without a parameter, can_move checks if the painter can move in the direction it is facing.
  assert painter.can_move() is True
  painter.move() # Now painter is on 1,0.
  assert painter.can_move("east") is False

def test_has_paint_large_maze():
  # In a large maze, the painter has infinite paint, so has_paint should always return true.
  world = World()
  world.set_grid_from_string(LARGE_MAZE)
  painter = Painter()
  assert painter.has_paint() is True
  painter.paint("green")
  painter.paint("blue")
  assert painter.has_paint() is True
