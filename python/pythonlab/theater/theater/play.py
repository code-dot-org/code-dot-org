from .support.renderer import render


def play_scenes(*scenes):
  """Render the given scene(s) into an animated gif.

  The scenes' actions are concatenated and rendered once. Returns the rendered
  gif bytes.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  return render(all_actions)
