from neighborhood.painter import Painter
from neighborhood.support.world import World
from support.constants import SAMPLE_MAZE

def setUp():
  world = World()
  # Set up the world to be from a string rather than trying to load a file.
  world.set_grid_from_string(SAMPLE_MAZE)

def test_initialize_painter():
  painter1 = Painter()
  assert painter1.get_x() == 0
  assert painter1.get_y() == 0
  assert painter1.get_my_paint() == 0
  assert painter1.get_direction() == "east"
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

def test_get_initialization_message():
  painter4 = Painter()
  initialization_message = painter4._get_initialization_message(0,0,'east',0)
  assert initialization_message == '[PAINTER] INITIALIZE_PAINTER {"id": "painter-4", "direction": "east", "x": 0, "y": 0, "paint": 0}'

def test_turn_left():
  painter5 = Painter()
  assert painter5.direction.value == 'east'
  painter5.turn_left()
  assert painter5.direction.value == 'north'