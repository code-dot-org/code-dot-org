from neighborhood.painter import Painter
from neighborhood.support.world import World

# Set up the world to be from a string rather than trying to load a file.
def setUp():
  world = World()
  world.set_grid_from_string('[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":1,"assetId":0}],[{"tileType":0,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]')

def test_initialize_painter():
  painter = Painter()
  assert painter.get_x() == 0
  assert painter.get_y() == 0
  assert painter.get_direction() == "East"
  assert painter.get_my_paint() == 0

def test_set_paint():
  painter = Painter()
  assert painter.get_my_paint() == 0
  painter.set_paint(5)
  assert painter.get_my_paint() == 5
