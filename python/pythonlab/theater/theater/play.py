from .support import bridge
from .support.renderer import render


def play_scenes(*scenes):
  """Render the given scene(s) into an animated gif and audio track.

  The scenes' actions are concatenated and rendered once. Both are handed to
  the host to play on the theater stage, and (gif_bytes, wav_bytes) are
  returned; wav_bytes is None when the program produced no audio.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  gif_bytes, wav_bytes = render(all_actions)
  bridge.publish(gif_bytes, wav_bytes)
  return gif_bytes, wav_bytes
