from .grid_factory import GridFactory

# A singleton class that represents the world of the neighborhood.
# The first time it is created it will load the neighborhood grid from a file,
# and all subsequent references will return the same instance.
class World(object):
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
