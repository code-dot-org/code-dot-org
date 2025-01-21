from neighborhood.painter import Painter
from neighborhood.support.world import World
from support.constants import SAMPLE_MAZE

def setUp():
  world = World()
  # Set up the world to be from a string rather than trying to load a file.
  world.set_grid_from_string(SAMPLE_MAZE)

def test_initialize_painter():
  painter = Painter()
  assert painter.get_x() == 0
  assert painter.get_y() == 0
  assert painter.get_direction() == "east"
  assert painter.get_my_paint() == 0
  painter2 = Painter(1, 2, "west", 10)
  assert painter2.get_x() == 1
  assert painter2.get_y() == 2
  assert painter2.get_direction() == "west"
  assert painter2.get_my_paint() == 10

def test_set_paint():
  painter3 = Painter()
  assert painter3.get_my_paint() == 0
  painter3.set_paint(5)
  assert painter3.get_my_paint() == 5

def test_get_initialization_message():
  painter4 = Painter()
  initialization_message = painter4.get_initialization_message()
  assert initialization_message.get_formatted_message() == '[PAINTER] INITIALIZE_PAINTER {"id": "painter-4", "direction": "east", "x": 0, "y": 0, "paint": 0}'

def test_turn_left():
  painter5 = Painter()
  assert painter5.direction.value == 'east'
  painter5.turn_left()
  assert painter5.direction.value == 'north'