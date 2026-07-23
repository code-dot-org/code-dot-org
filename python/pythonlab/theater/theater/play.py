from .support import bridge
from .support.renderer import render


def play_scenes(*scenes):
  """Render the given scene(s) into a gif and audio track and play them.

  Mirrors org.code.theater.Theater.playScenes: the scenes' actions are
  concatenated and rendered once, then handed to the host to display.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  gif_bytes, wav_bytes = render(all_actions)
  bridge.publish(gif_bytes, wav_bytes)
  return gif_bytes, wav_bytes
