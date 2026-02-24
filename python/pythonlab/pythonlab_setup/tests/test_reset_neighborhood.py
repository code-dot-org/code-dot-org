from neighborhood import World
from pythonlab_setup.reset_neighborhood import reset_neighborhood

def test_resets_world():
  world = World()
  world.set_grid_from_string('[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":1,"assetId":0}],[{"tileType":0,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]')
  assert world.grid is not None
  reset_neighborhood()
  assert world.grid is None
