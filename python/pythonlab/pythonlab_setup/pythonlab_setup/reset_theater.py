import sys

def reset_theater():
  """
  Drop theater's default scene so the next run starts with nothing recorded.
  Python Lab keeps one interpreter for the lifetime of the tab, and the module
  cache is only purged of the student's own files, so a scene left over from the
  previous run would replay that run's drawing and sound.

  We look the module up in sys.modules rather than importing it: the theater
  wheel is fetched only for a program that imports theater (see
  ON_DEMAND_PACKAGE_URLS), and importing it here would charge every run for it.
  An explicit Scene needs no reset -- student code that built one drops it with
  the rest of the program's globals.
  """
  # A student file named theater.py takes this name in sys.modules, so check for
  # the function rather than assuming the real package is what we found.
  theater = sys.modules.get('theater')
  reset_default_scene = getattr(theater, 'reset_default_scene', None)
  if reset_default_scene is not None:
    reset_default_scene()
