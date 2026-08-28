import os
import sys
from .reset_neighborhood import reset_neighborhood
from .reset_theater import reset_theater

def teardown_pythonlab(home_folder):
  reset_neighborhood()
  reset_theater()
  flush_sysout()
  go_home(home_folder)

# Ensure stdout is flushed so all of of a user's prints are visible to them.
def flush_sysout():
  sys.stdout.flush()
  os.fsync(sys.stdout.fileno())

def go_home(home_folder):
  os.chdir(home_folder)
