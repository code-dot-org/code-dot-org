def publish(gif_bytes):
  """Hand the rendered gif to the host so it can be displayed.

  `_theater_bridge` is a JS module the Pyodide web worker registers; under
  Pyodide's `jsglobals: {}` it is the only way out of the interpreter. Outside
  Pyodide -- unit tests, or any other interpreter -- it is absent and
  publishing does nothing.
  """
  try:
    import _theater_bridge
  except ImportError:
    return
  _theater_bridge.publish(gif_bytes)
