from neighborhood.support.world import World
from constants import SAMPLE_MAZE

def test_world_always_returns_same_grid():
  world_1 = World()
  world_1.set_grid_from_string(SAMPLE_MAZE)
  world_2 = World()
  assert world_1 is world_2
  assert world_1.grid is world_2.grid