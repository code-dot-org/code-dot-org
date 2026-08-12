from .support.renderer import render


def play_scenes(*scenes):
  """Render the given scene(s) into a gif and audio track.

  Mirrors org.code.theater.Theater.playScenes: the scenes' actions are
  concatenated and rendered once. Returns the rendered (gif_bytes, wav_bytes),
  where wav_bytes is None when the program produced no audio.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  return render(all_actions)
