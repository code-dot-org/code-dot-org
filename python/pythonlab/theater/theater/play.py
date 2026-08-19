from .support import bridge
from .support.renderer import render


def play_scenes(*scenes):
  """Render the given scene(s) into an animated gif and display it.

  The scenes' actions are concatenated and rendered once. The gif is handed to
  the host to play on the theater stage, and its bytes are also returned.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  gif_bytes = render(all_actions)
  bridge.publish(gif_bytes)
  return gif_bytes
