from .screen import (
  add_button, add_label,
  set_text, on_click,
  start,
)
# Exported so pythonlab_setup can drop the default screen between runs.
from .screen import reset_default_screen as reset_default_screen

# `from kiosk import *` is a supported way for student code to reach these, so
# it lists only what students use. reset_default_screen stays importable by
# name. Never bind the name `screen` here: it would shadow the submodule for
# that import while `import kiosk.screen` kept returning the module, leaving
# two different `screen`s in one program.
__all__ = [
  'add_button',
  'add_label',
  'set_text',
  'on_click',
  'start',
]
