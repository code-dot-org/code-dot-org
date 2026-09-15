"""The kiosk's two-way link to the page it is drawn on.

`_kiosk_bridge` is a JS module the Pyodide web worker registers; under
Pyodide's `jsglobals: {}` it is the only way in or out of the interpreter.
Outside Pyodide -- unit tests, or any other interpreter -- it is absent, so
publishing does nothing and waiting reports that no event will ever arrive.
"""


def publish(scene_json):
  """Hand the page the screen to draw, as a JSON string."""
  try:
    import _kiosk_bridge
  except ImportError:
    return
  _kiosk_bridge.publish(scene_json)


def wait_for_event():
  """Block until someone presses a button, and return that button's id.

  Returns None when no press is coming, which is what lets start() stop
  looping. That happens two ways: the host answers with an empty id to end a
  program that Stop caught waiting, and outside Pyodide there is no page to
  press anything at all.
  """
  try:
    import _kiosk_bridge
  except ImportError:
    return None
  # An element id is never empty -- add_button and add_label refuse one -- so an
  # empty answer can only be the host asking the program to end.
  return _kiosk_bridge.waitForEvent() or None
