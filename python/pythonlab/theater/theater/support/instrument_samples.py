from importlib.resources import files

from ..instrument import Instrument
from .audio import read_samples_from_wav_bytes

# Note range available per instrument, from InstrumentSampleLoader (C3-C6).
_MIN_NOTE = 48
_MAX_NOTE = 84

_FILE_PREFIX = {
  Instrument.PIANO: "piano-",
  Instrument.BASS: "bass-",
}


def load_note_samples(instrument, note):
  """Return normalized mono samples for an instrument note, or None if unavailable.

  Missing samples return None rather than raising, matching the Java loader,
  which lets the caller skip the note.
  """
  prefix = _FILE_PREFIX.get(instrument)
  if prefix is None or note < _MIN_NOTE or note > _MAX_NOTE:
    return None
  resource = files("theater").joinpath("instruments", f"{prefix}{note}.wav")
  if not resource.is_file():
    return None
  return read_samples_from_wav_bytes(resource.read_bytes())
