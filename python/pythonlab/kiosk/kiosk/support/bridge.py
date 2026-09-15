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

  Returns None where there is no page to press anything, which is what lets
  start() return instead of looping forever under pytest.
  """
  try:
    import _kiosk_bridge
  except ImportError:
    return None
  return _kiosk_bridge.waitForEvent()
