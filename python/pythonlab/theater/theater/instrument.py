from enum import Enum


class Instrument(Enum):
  """Instruments available to play_note."""
  PIANO = "PIANO"
  BASS = "BASS"


def as_instrument(instrument):
  """Accept an Instrument or an instrument name (case-insensitive)."""
  if isinstance(instrument, Instrument):
    return instrument
  if isinstance(instrument, str):
    try:
      return Instrument(instrument.upper())
    except ValueError:
      pass
  names = ", ".join(member.value for member in Instrument)
  raise ValueError(f"Unknown instrument {instrument!r}, expected one of {names}")
