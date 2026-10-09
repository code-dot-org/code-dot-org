from .support import bridge
from .support.describe import describe
from .support.renderer import gif_duration_ms, render


def play_scenes(*scenes):
  """Render the given scene(s) into an animated gif and audio track.

  The scenes' actions are concatenated and rendered once. Both are handed to
  the host to play on the theater stage, along with the gif's length, and
  (gif_bytes, wav_bytes) are returned; wav_bytes is None when the program
  produced no audio. A description of the actions is published with them, since
  the host cannot call back into the interpreter after the run.
  """
  all_actions = []
  for scene in scenes:
    all_actions.extend(scene.get_actions())
  gif_bytes, wav_bytes, still_bytes = render(all_actions)
  description = describe(all_actions)
  bridge.publish(
    gif_bytes,
    wav_bytes,
    gif_duration_ms(all_actions),
    description.summary,
    description.transcript,
    still_bytes,
  )
  return gif_bytes, wav_bytes
