def publish(gif_bytes, wav_bytes, gif_duration_ms, summary, transcript):
  """Hand the rendered gif and audio track to the host so it can play them.

  `_theater_bridge` is a JS module the Pyodide web worker registers; under
  Pyodide's `jsglobals: {}` it is the only way out of the interpreter. Outside
  Pyodide -- unit tests, or any other interpreter -- it is absent and
  publishing does nothing. `summary` and `transcript` are the scene in words,
  for a student who cannot see the stage.
  """
  try:
    import _theater_bridge
  except ImportError:
    return
  _theater_bridge.publish(gif_bytes, wav_bytes, gif_duration_ms, summary, transcript)
