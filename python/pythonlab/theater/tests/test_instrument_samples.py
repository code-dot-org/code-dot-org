from importlib.resources import files

import numpy as np
import pytest

from theater import Instrument
from theater.support.constants import INSTRUMENT_SAMPLE_RATE, SAMPLE_RATE
from theater.support.instrument_samples import _decode, load_note_samples

_MU = 255.0


def mulaw_encode(samples):
  """The encoding tools/encode_instruments.py applies, for a round trip here."""
  compressed = np.sign(samples) * np.log1p(_MU * np.abs(samples)) / np.log1p(_MU)
  return (compressed * 127 + 128).round().clip(0, 255).astype(np.uint8)


def test_decode_recovers_the_encoded_signal():
  original = np.sin(np.linspace(0, 8 * np.pi, 500))
  decoded = _decode(mulaw_encode(original).tobytes())
  # _decode also lifts the samples to the output rate, so every other frame is
  # an original and the frames between them are interpolated. Mu-law spends its
  # 8 bits proportionally, so the error it introduces is relative, not absolute.
  assert np.allclose(decoded[::2], original, rtol=0.03, atol=0.002)


def test_decode_leaves_silence_silent():
  decoded = _decode(mulaw_encode(np.zeros(100)).tobytes())
  assert np.allclose(decoded, 0.0, atol=1e-3)


def test_note_is_lifted_to_the_output_rate():
  # Bundled notes are stored at half the output rate, so a note that came back
  # at the stored rate would play an octave high and half as long.
  stored = files("theater").joinpath("instruments", "piano-60.ulaw").read_bytes()
  samples = load_note_samples(Instrument.PIANO, 60)
  assert len(samples) == len(stored) * (SAMPLE_RATE // INSTRUMENT_SAMPLE_RATE)


def test_note_samples_stay_in_range():
  samples = load_note_samples(Instrument.BASS, 60)
  assert len(samples) > 0
  assert np.abs(samples).max() <= 1.0


def test_notes_outside_the_instrument_range_are_skipped():
  assert load_note_samples(Instrument.PIANO, 47) is None
  assert load_note_samples(Instrument.PIANO, 85) is None


def test_a_repeated_note_is_decoded_once():
  # A melody plays the same handful of pitches over and over; decoding each one
  # again costs a file read, a mu-law expansion, and an interpolation.
  load_note_samples.cache_clear()
  first = load_note_samples(Instrument.PIANO, 60)
  second = load_note_samples(Instrument.PIANO, 60)
  assert second is first
  assert load_note_samples.cache_info().hits == 1


def test_cached_samples_cannot_be_written_through():
  # Every player of a note holds the same array, so it must not be writable.
  samples = load_note_samples(Instrument.PIANO, 60)
  with pytest.raises(ValueError):
    samples[0] = 1.0
