from neighborhood.support.grid_factory import GridFactory

sample_maze = '[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":53},{"tileType":1,"value":0,"assetId":54},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":2,"value":0,"assetId":287},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":3,"assetId":303},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":0,"value":0,"assetId":47},{"tileType":0,"value":0,"assetId":1},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":0,"value":0,"assetId":2},{"tileType":0,"value":0,"assetId":3},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":0,"value":0,"assetId":4},{"tileType":0,"value":0,"assetId":5},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}],\
  [{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},\
  {"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}]]'

def test_can_create_grid_from_string():
  grid_factory = GridFactory()
  # non-square grid
  # try:
  #   grid = grid_factory.create_grid_from_string('[[{"tileType":1,"value":0,"assetId":0},{"tileType":1,"value":0,"assetId":0}], [{"tileType":1,"value":0,"assetId":0}]]')
