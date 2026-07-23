def publish(gif_bytes, wav_bytes):
  """Hand the rendered gif and audio to the host.

  In Pyodide, `_theater_bridge` is a JS module registered by the worker; the
  Python `bytes` arrive in JS as a Uint8Array. Outside Pyodide (e.g. unit
  tests) the module is absent, so publishing is a no-op.
  """
  try:
    import _theater_bridge
  except ImportError:
    return
  _theater_bridge.publish(gif_bytes, wav_bytes)
