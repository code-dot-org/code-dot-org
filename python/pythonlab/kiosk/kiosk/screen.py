"""A screen of buttons and labels, and the loop that reacts to presses.

Every change to the screen is published to the page right away, so a program
that only places elements still shows them. start() then blocks, running the
handler for each press and publishing whatever that handler changed.
"""

import json

from .support import bridge
from .support.constants import BUTTON, LABEL, MAX_COORDINATE, MIN_COORDINATE


def _validate_id(element_id):
  if not isinstance(element_id, str) or not element_id:
    raise ValueError(
      f"an element's id must be a piece of text that is not empty, "
      f"got {element_id!r}"
    )


def _validate_text(text):
  if not isinstance(text, str):
    raise ValueError(f"an element's text must be a piece of text, got {text!r}")


def _validate_coordinate(name, value):
  if not isinstance(value, (int, float)):
    raise ValueError(
      f"{name} must be a number between {MIN_COORDINATE} and "
      f"{MAX_COORDINATE}, got {value!r}"
    )
  # Checking a range turns away a nan: every comparison against one is false,
  # so a nan clears an ordinary pair of comparisons.
  if not MIN_COORDINATE <= value <= MAX_COORDINATE:
    raise ValueError(
      f"{name} must be between {MIN_COORDINATE} and {MAX_COORDINATE}, "
      f"got {value}"
    )


class _Screen:
  def __init__(self):
    # Insertion order is the order the page draws in, which is also the order
    # the keyboard tabs through.
    self._elements = {}
    self._handlers = {}
    # An empty screen still has to reach the page once, so it starts changed.
    self._changed = True

  def add(self, kind, element_id, text, x, y):
    _validate_id(element_id)
    if element_id in self._elements:
      raise ValueError(f"there is already an element with the id {element_id!r}")
    _validate_text(text)
    _validate_coordinate("x", x)
    _validate_coordinate("y", y)
    self._elements[element_id] = {
      "type": kind,
      "id": element_id,
      "text": text,
      "x": x,
      "y": y,
    }
    self._changed = True
    self.publish()

  def set_text(self, element_id, text):
    element = self._elements.get(element_id)
    if element is None:
      raise ValueError(f"there is no element with the id {element_id!r}")
    _validate_text(text)
    element["text"] = text
    self._changed = True
    self.publish()

  def on_click(self, button_id, handler):
    element = self._elements.get(button_id)
    if element is None or element["type"] != BUTTON:
      raise ValueError(f"there is no button with the id {button_id!r}")
    if not callable(handler):
      raise ValueError(
        f"on_click needs a function to run when the button is pressed, "
        f"got {handler!r}"
      )
    self._handlers[button_id] = handler

  def publish(self):
    """Send the page the screen, if it is not already showing this one.

    Every change publishes as it happens, so the calls that bracket a press --
    start(), and the one after a handler returns -- are usually redundant. The
    page would only redraw what it already has.
    """
    if not self._changed:
      return
    self._changed = False
    bridge.publish(json.dumps({"elements": list(self._elements.values())}))

  def start(self):
    self.publish()
    while True:
      element_id = bridge.wait_for_event()
      if element_id is None:
        return
      handler = self._handlers.get(element_id)
      if handler is not None:
        handler()
      self.publish()


# The functions below let student code skip constructing a screen:
#
#   import kiosk  ->  kiosk.add_button(...); kiosk.start()
#
# They all act on one implicit screen, which holds everything placed so far, so
# it must be dropped between runs -- see reset_default_screen() and
# pythonlab_setup's teardown.

_default_screen = None


def _get_default_screen():
  global _default_screen
  if _default_screen is None:
    _default_screen = _Screen()
  return _default_screen


def reset_default_screen():
  """Drop the implicit screen, so the next call starts a fresh one."""
  global _default_screen
  _default_screen = None


def add_button(button_id, text, x, y):
  """Place a button, with x and y as percentages of the screen."""
  _get_default_screen().add(BUTTON, button_id, text, x, y)


def add_label(label_id, text, x, y):
  """Place a label, with x and y as percentages of the screen."""
  _get_default_screen().add(LABEL, label_id, text, x, y)


def set_text(element_id, text):
  """Change what a button or label says."""
  _get_default_screen().set_text(element_id, text)


def on_click(button_id, handler):
  """Run handler, a function taking no arguments, when the button is pressed."""
  _get_default_screen().on_click(button_id, handler)


def start():
  """Show the screen and react to presses until the program is stopped."""
  _get_default_screen().start()
