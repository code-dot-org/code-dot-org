import os
import sys
from .reset_neighborhood import reset_neighborhood

def teardown_pythonlab(home_folder):
  flush_sysout()
  reset_neighborhood()
  go_home(home_folder)

# Ensure stdout is flushed so all of of a user's prints are visible to them.
def flush_sysout():
  sys.stdout.flush()
  os.fsync(sys.stdout.fileno())

def go_home(home_folder):
  os.chdir(home_folder)
