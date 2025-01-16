from .grid_factory import GridFactory

class World(object):
  """
  A singleton class that represents the world of the neighborhood.
  The first time it is created it will set the grid to None. Users of the world
  should check if the grid is None, and set it appropriately if it is.
  All subsequent references will reuse the same grid, so multiple painters can operate
  on the same grid.
  The grid can be removed by calling remove_grid.
  """
  _instance = None

  def __new__(cls):
    if cls._instance is None:
      cls._instance = super(World, cls).__new__(cls)
      cls._instance.grid = None
    return cls._instance
  
  def set_grid_from_file(self, filename: str | None = None):
    self.grid = GridFactory.create_grid_from_file(filename)

  def set_grid_from_string(self, description: str):
    self.grid = GridFactory.create_grid_from_string(description)

  def remove_grid(self):
    self.grid = None
