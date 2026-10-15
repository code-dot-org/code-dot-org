import os
import sys
from contextlib import suppress
from .reset_neighborhood import reset_neighborhood
from .reset_theater import reset_theater

def teardown_pythonlab(home_folder):
  # A reset reaches into whatever holds its package name, which a student file
  # of the same name can take over, so it can raise anything. Teardown swallows
  # that and carries on: the host appends the module-cache purge to this same
  # script, and a raise here would skip it and leave the next run importing the
  # previous run's code.
  with suppress(Exception):
    reset_neighborhood()
  with suppress(Exception):
    reset_theater()
  flush_sysout()
  go_home(home_folder)

# Ensure stdout is flushed so all of of a user's prints are visible to them.
def flush_sysout():
  sys.stdout.flush()
  os.fsync(sys.stdout.fileno())

def go_home(home_folder):
  os.chdir(home_folder)
