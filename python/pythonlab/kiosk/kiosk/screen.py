"""A screen of buttons, labels and sliders, and the loop that reacts to them.

Every change to the screen is published to the page right away, so a program
that only places elements still shows them. start() then blocks, running the
handler for each press or slider move and publishing whatever that handler
changed.
"""

import json

from .support import bridge
from .support.constants import (
  BUTTON, LABEL, SLIDER, MAX_COORDINATE, MIN_COORDINATE
)


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


def _validate_range(minimum, maximum):
  for name, bound in (("minimum", minimum), ("maximum", maximum)):
    if not isinstance(bound, (int, float)):
      raise ValueError(f"a slider's {name} must be a number, got {bound!r}")
  if not minimum < maximum:
    raise ValueError(
      f"a slider's minimum must be below its maximum, got {minimum} and "
      f"{maximum}"
    )


def _validate_value(value, minimum, maximum):
  if not isinstance(value, (int, float)):
    raise ValueError(f"a slider's value must be a number, got {value!r}")
  # A range rather than two comparisons, so a nan fails too.
  if not minimum <= value <= maximum:
    raise ValueError(
      f"a slider's value must be between {minimum} and {maximum}, got {value}"
    )


class _Screen:
  def __init__(self):
    # Insertion order is the order the page draws in, which is also the order
    # the keyboard tabs through.
    self._elements = {}
    self._handlers = {}
    # An empty screen still has to reach the page once, so it starts changed.
    self._changed = True

  def add(self, kind, element_id, text, x, y, extra=None):
    _validate_id(element_id)
    if element_id in self._elements:
      raise ValueError(f"there is already an element with the id {element_id!r}")
    _validate_text(text)
    _validate_coordinate("x", x)
    _validate_coordinate("y", y)
    element = {
      "type": kind,
      "id": element_id,
      "text": text,
      "x": x,
      "y": y,
    }
    # Whatever this kind of element carries beyond the common fields, folded in
    # before the first publish so the page never sees a half-built element.
    element.update(extra or {})
    self._elements[element_id] = element
    self._changed = True
    self.publish()

  def add_slider(self, slider_id, text, x, y, minimum, maximum, value):
    _validate_range(minimum, maximum)
    _validate_value(value, minimum, maximum)
    self.add(
      SLIDER, slider_id, text, x, y,
      {"min": minimum, "max": maximum, "value": value},
    )

  def set_text(self, element_id, text):
    element = self._elements.get(element_id)
    if element is None:
      raise ValueError(f"there is no element with the id {element_id!r}")
    _validate_text(text)
    element["text"] = text
    self._changed = True
    self.publish()

  def set_value(self, slider_id, value):
    element = self._slider(slider_id)
    _validate_value(value, element["min"], element["max"])
    element["value"] = value
    self._changed = True
    self.publish()

  def get_value(self, slider_id):
    return self._slider(slider_id)["value"]

  def on_click(self, button_id, handler):
    element = self._elements.get(button_id)
    if element is None or element["type"] != BUTTON:
      raise ValueError(f"there is no button with the id {button_id!r}")
    self._set_handler(button_id, handler, "on_click", "the button is pressed")

  def on_change(self, slider_id, handler):
    self._slider(slider_id)
    self._set_handler(slider_id, handler, "on_change", "the slider moves")

  def _slider(self, slider_id):
    element = self._elements.get(slider_id)
    if element is None or element["type"] != SLIDER:
      raise ValueError(f"there is no slider with the id {slider_id!r}")
    return element

  def _set_handler(self, element_id, handler, name, occasion):
    if not callable(handler):
      raise ValueError(
        f"{name} needs a function to run when {occasion}, got {handler!r}"
      )
    self._handlers[element_id] = handler

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
      event = bridge.wait_for_event()
      if event is None:
        return
      self._dispatch(event)
      self.publish()

  def _dispatch(self, event):
    element = self._elements.get(event["id"])
    if element is None:
      return
    handler = self._handlers.get(event["id"])
    if element["type"] != SLIDER:
      if handler is not None:
        handler()
      return
    # Record where the slider was left before the handler runs, so get_value()
    # agrees with what the page is showing whichever element's handler asks.
    element["value"] = event["value"]
    if handler is not None:
      handler(event["value"])


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


def add_slider(slider_id, text, x, y, minimum=0, maximum=100, value=0):
  """Place a slider, with x and y as percentages of the screen.

  text labels the slider, and the handle starts at value.
  """
  _get_default_screen().add_slider(
    slider_id, text, x, y, minimum, maximum, value
  )


def set_text(element_id, text):
  """Change what a button, label or slider says."""
  _get_default_screen().set_text(element_id, text)


def set_value(slider_id, value):
  """Move a slider's handle."""
  _get_default_screen().set_value(slider_id, value)


def get_value(slider_id):
  """Return where a slider's handle is now."""
  return _get_default_screen().get_value(slider_id)


def on_click(button_id, handler):
  """Run handler, a function taking no arguments, when the button is pressed."""
  _get_default_screen().on_click(button_id, handler)


def on_change(slider_id, handler):
  """Run handler with the slider's new value each time the slider moves."""
  _get_default_screen().on_change(slider_id, handler)


def start():
  """Show the screen and react to it until the program is stopped."""
  _get_default_screen().start()
