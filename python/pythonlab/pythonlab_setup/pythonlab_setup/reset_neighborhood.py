from neighborhood import World

def reset_neighborhood():
  """
  Reset the neighborhood so the world will be re-generated on next painter initialization.
  We can safely run this even if the neighborhood is not being used, World is a small singleton
  with a single reference to a grid. If the neighborhood is not used by the user's program,
  the grid will remain None.
  """
  world = World()
  world.remove_grid()
