import io
import wave

import numpy as np

from .constants import CHANNELS, MAX_16_BIT_VALUE, SAMPLE_RATE


def read_samples_from_wav_bytes(wav_bytes):
  """Read a WAV file into normalized mono float samples in [-1.0, 1.0].

  Stereo input is averaged to mono, and any other sample rate is resampled to
  SAMPLE_RATE, since the timeline the samples land on carries no rate of its
  own.
  """
  with wave.open(io.BytesIO(wav_bytes), "rb") as reader:
    num_channels = reader.getnchannels()
    sample_width = reader.getsampwidth()
    frame_rate = reader.getframerate()
    frames = reader.readframes(reader.getnframes())
  if sample_width != 2:
    raise ValueError("Only 16-bit PCM WAV data is supported")
  if frame_rate <= 0:
    raise ValueError("WAV data declares no sample rate")
  raw = np.frombuffer(frames, dtype="<i2").astype(np.float64) / MAX_16_BIT_VALUE
  if num_channels == 1:
    mono = raw
  elif num_channels == 2:
    mono = (raw[0::2] + raw[1::2]) / 2.0
  else:
    raise ValueError("Only mono or stereo WAV data is supported")
  return _to_output_rate(mono, frame_rate)


def read_samples_from_file(filename):
  with open(filename, "rb") as handle:
    return read_samples_from_wav_bytes(handle.read())


def truncate_samples(samples, length_seconds):
  """Trim samples to the given duration; leave shorter samples untouched."""
  # Clamp at zero: a negative length would otherwise trim from the end.
  new_length = max(0, int(length_seconds * SAMPLE_RATE))
  if new_length > len(samples):
    return samples
  return samples[:new_length]


class AudioWriter:
  """Accumulates audio by additively blending sources onto a timeline.

  New samples are added at the current cursor and clamped to [-1.0, 1.0]; delays
  advance the cursor over silence.
  """

  def __init__(self):
    self._samples = np.zeros(0, dtype=np.float64)
    self._cursor = 0

  def write_audio_samples(self, samples, length_seconds=None):
    samples = np.asarray(samples, dtype=np.float64)
    if length_seconds is not None:
      samples = truncate_samples(samples, length_seconds)
    end = self._cursor + len(samples)
    if end > len(self._samples):
      self._samples = np.concatenate(
        [self._samples, np.zeros(end - len(self._samples), dtype=np.float64)]
      )
    blended = self._samples[self._cursor:end] + samples
    self._samples[self._cursor:end] = np.clip(blended, -1.0, 1.0)

  def add_delay(self, delay_seconds):
    self._cursor += int(delay_seconds * SAMPLE_RATE)

  def get_total_audio_length(self):
    return len(self._samples) / SAMPLE_RATE

  def to_wav_bytes(self):
    """Encode accumulated samples as a mono 16-bit WAV, or None if empty."""
    if len(self._samples) == 0:
      return None
    int_samples = _to_int16(self._samples)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as writer:
      writer.setnchannels(CHANNELS)
      writer.setsampwidth(2)
      writer.setframerate(SAMPLE_RATE)
      writer.writeframes(int_samples.tobytes())
    return buffer.getvalue()


def _to_output_rate(samples, source_rate):
  """Linearly resample to SAMPLE_RATE, preserving the sound's duration.

  Linear interpolation aliases when downsampling, which is audible on
  high-rate input but keeps the wheel free of a filter design.
  """
  if source_rate == SAMPLE_RATE or len(samples) == 0:
    return samples
  new_length = int(len(samples) * SAMPLE_RATE / source_rate)
  positions = np.arange(new_length) * source_rate / SAMPLE_RATE
  return np.interp(positions, np.arange(len(samples)), samples)


def _to_int16(samples):
  # 1.0 maps to the maximum signed 16-bit value; everything else scales by
  # 32768 and truncates toward zero.
  scaled = np.where(samples == 1.0, 32767.0, samples * MAX_16_BIT_VALUE)
  return scaled.astype(np.int16)
