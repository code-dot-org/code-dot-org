from neighborhood.support.world import World

def test_world_always_returns_same_grid():
  world_1 = World()
  world_1.set_grid_from_string('[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":1,"assetId":0}],[{"tileType":0,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]')
  world_2 = World()
  assert world_1 is world_2
  assert world_1.grid is world_2.grid