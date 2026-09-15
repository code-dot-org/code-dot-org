import sys

def reset_kiosk():
  """
  Drop kiosk's default screen so the next run starts with nothing placed.
  Python Lab keeps one interpreter for the lifetime of the tab, and the module
  cache is only purged of the student's own files, so a screen left over from
  the previous run would still hold that run's buttons and labels.

  We look the module up in sys.modules rather than importing it. The kiosk
  wheel is loaded only for a program that imports kiosk: the host reads the
  imports out of the student's files and calls loadPackage before the run (see
  ON_DEMAND_PACKAGE_URLS). An import from Python fetches nothing under Pyodide,
  so importing kiosk here would just raise ModuleNotFoundError on every run
  that did not ask for it.
  """
  # A student file named kiosk.py takes this name in sys.modules, so check for
  # the function rather than assuming the real package is what we found.
  kiosk = sys.modules.get('kiosk')
  reset_default_screen = getattr(kiosk, 'reset_default_screen', None)
  if reset_default_screen is not None:
    reset_default_screen()
