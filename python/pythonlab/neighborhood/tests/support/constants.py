# 2x2 grids
SAMPLE_MAZE = '[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":1,"assetId":0}],[{"tileType":0,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]'
ALL_PASSABLE_MAZE = '[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":1,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]'
BUCKET_MAZE = '[[{"tileType":1,"value":3,"assetId":303},{"tileType":1,"value":1,"assetId":0}],[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]'

def get_large_maze():
  passable_tile = '{"tileType":1,"value":0,"assetId":0}'
  maze_str = '[['
  for row in range(20):
    for col in range(20):
      maze_str += passable_tile
      if col < 19:
        maze_str += ','
    maze_str += ']'
    if row < 19:
      maze_str += ',['
  maze_str += ']'
  return maze_str
  

LARGE_MAZE = get_large_maze()
