import neighborhood.support.grid_factory as grid_factory
from .neighborhood_context_type import NeighborhoodContextType


class World(object):
  """
  A singleton class that represents the world of the neighborhood.
  The first time it is created it will set the grid to None. Users of the world
  should check if the grid is None, and set it appropriately if it is.
  All subsequent references will reuse the same grid, so multiple painters can operate
  on the same grid.
  The grid can be removed by calling remove_grid.
  The world also tracks the context type of the neighborhood, which is RUN by default.
  """
  _instance = None

  def __new__(cls):
    if cls._instance is None:
      cls._instance = super(World, cls).__new__(cls)
      cls._instance.grid = None
      cls._instance.context_type = NeighborhoodContextType.RUN
      # Counts changes to the grid and the context type. Anything caching state
      # derived from the world compares this to tell one program run from the
      # next; see painter._get_default_painter. It only ever increases, so a
      # context type that changes and changes back still reads as a new run.
      cls._instance.generation = 0
    return cls._instance

  def set_grid_from_file(self, filename: str | None = None):
    self.grid = grid_factory.create_grid_from_file(filename)
    self.generation += 1

  def set_grid_from_string(self, description: str):
    self.grid = grid_factory.create_grid_from_string(description)
    self.generation += 1

  def remove_grid(self):
    self.grid = None
    self.generation += 1

  def set_context_type(self, context_type: NeighborhoodContextType):
    self.context_type = context_type
    self.generation += 1
