"""The kiosk's two-way link to the page it is drawn on.

`_kiosk_bridge` is a JS module the Pyodide web worker registers; under
Pyodide's `jsglobals: {}` it is the only way in or out of the interpreter.
Outside Pyodide -- unit tests, or any other interpreter -- it is absent, so
publishing does nothing and waiting reports that no event will ever arrive.
"""

import json


def publish(scene_json):
  """Hand the page the screen to draw, as a JSON string."""
  try:
    import _kiosk_bridge
  except ImportError:
    return
  _kiosk_bridge.publish(scene_json)


def wait_for_event():
  """Block until someone uses the screen, and return what they did.

  The answer is {"id": <element id>} for a press, with a "value" alongside it
  when a slider moved.

  Returns None when nothing more is coming, which is what lets start() stop
  looping. That happens two ways: the host answers with nothing at all to end a
  program that Stop caught waiting, and outside Pyodide there is no page to use
  at all.
  """
  try:
    import _kiosk_bridge
  except ImportError:
    return None
  # An event always names an element, so an empty answer can only be the host
  # asking the program to end.
  answer = _kiosk_bridge.waitForEvent()
  if not answer:
    return None
  return json.loads(answer)
