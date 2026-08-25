from functools import lru_cache
from importlib.resources import files

import numpy as np

from ..instrument import Instrument
from .constants import INSTRUMENT_SAMPLE_RATE, MAX_NOTE, MIN_NOTE, SAMPLE_RATE

_FILE_PREFIX = {
  Instrument.PIANO: "piano-",
  Instrument.BASS: "bass-",
}

# The mu-law companding constant, fixed by the G.711 standard that names it.
_MU = 255.0

_UPSAMPLE_FACTOR = SAMPLE_RATE // INSTRUMENT_SAMPLE_RATE

# How many decoded notes to keep. Each costs about 0.6 MB of float32 samples,
# and all 74 bundled notes would come to 42 MB. A melody rarely reaches for this
# many distinct pitches, so in practice every repeat is a hit.
_NOTE_CACHE_SIZE = 32


@lru_cache(maxsize=_NOTE_CACHE_SIZE)
def load_note_samples(instrument, note):
  """Return normalized mono samples for an instrument note, or None if unavailable.

  Missing samples return None rather than raising, which lets the caller skip
  the note. A note repeated by a melody is decoded once and shared, so the
  samples are handed back read-only.
  """
  prefix = _FILE_PREFIX.get(instrument)
  if prefix is None or note < MIN_NOTE or note > MAX_NOTE:
    return None
  resource = files("theater").joinpath("instruments", f"{prefix}{note}.ulaw")
  if not resource.is_file():
    return None
  samples = _decode(resource.read_bytes())
  samples.setflags(write=False)
  return samples


def _decode(data):
  """Turn one bundled note into normalized samples at the output rate.

  The bundled form is headerless: 8-bit mu-law at INSTRUMENT_SAMPLE_RATE, with
  nothing but this function to read it. The stdlib `wave` module cannot carry
  mu-law, and these files are never handed to anything else.
  """
  codes = np.frombuffer(data, dtype=np.uint8).astype(np.float64)
  if not len(codes):
    return codes
  compressed = (codes - 128) / 127
  samples = np.sign(compressed) * ((1 + _MU) ** np.abs(compressed) - 1) / _MU
  # float32 to match the timeline these are blended onto, which halves both the
  # note cache and the conversion each play would otherwise cost.
  return _to_output_rate(samples).astype(np.float32)


def _to_output_rate(samples):
  positions = np.arange(len(samples) * _UPSAMPLE_FACTOR) / _UPSAMPLE_FACTOR
  return np.interp(positions, np.arange(len(samples)), samples)
