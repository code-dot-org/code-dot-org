import io
import wave
from itertools import islice

import numpy as np

from .constants import CHANNELS, MAX_16_BIT_VALUE, MAX_AUDIO_SECONDS, SAMPLE_RATE


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
    num_frames = reader.getnframes()
    if sample_width != 2:
      raise ValueError("Only 16-bit PCM WAV data is supported")
    if frame_rate <= 0:
      raise ValueError("WAV data declares no sample rate")
    # Check the header's length before reading, so an outsized file costs
    # nothing; the timeline it would land on is bounded by the same ceiling.
    if num_frames / frame_rate > MAX_AUDIO_SECONDS:
      raise ValueError(
        f"The sound is too long; the limit is {MAX_AUDIO_SECONDS} seconds"
      )
    frames = reader.readframes(num_frames)
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


# Longest sample sequence play_sound accepts, in samples. The same ceiling the
# timeline these land on is bounded by.
_MAX_SAMPLES = MAX_AUDIO_SECONDS * SAMPLE_RATE

_TOO_LONG = f"The sound is too long; the limit is {MAX_AUDIO_SECONDS} seconds"

_NOT_FLAT = "play_sound needs a flat sequence of numbers"


def _reject_unless_flat(sound):
  """Turn away a nested sequence before any of it is copied.

  len() measures the outer dimension alone, so a list of rows, or an array
  shaped (2, N), would clear the length ceiling and then allocate whatever the
  caller had built. We don't allow nested sequences as valid input.
  """
  if getattr(sound, "ndim", 1) != 1:
    raise ValueError(_NOT_FLAT)
  if hasattr(next(iter(sound), 0.0), "__len__"):
    raise ValueError(_NOT_FLAT)


def as_samples(sound):
  """Snapshot a caller's samples as a float32 array.

  A scene renders long after play_sound records it, so samples the student goes
  on to change must not change what plays. An array rather than a list holds a
  minute of audio in 10 MB instead of 106 MB and matches the timeline it lands
  on.

  Length is checked here rather than at render time: an endless iterator has to
  be turned away before it is drawn from, and the traceback then points at the
  student's own play_sound call.
  """
  if hasattr(sound, "__len__"):
    _reject_unless_flat(sound)
    if len(sound) > _MAX_SAMPLES:
      raise ValueError(_TOO_LONG)
    return np.array(sound, dtype=np.float32)
  samples = np.fromiter(islice(sound, _MAX_SAMPLES + 1), dtype=np.float32)
  if len(samples) > _MAX_SAMPLES:
    raise ValueError(_TOO_LONG)
  return samples


def truncate_samples(samples, length_seconds):
  """Trim samples to the given duration; leave shorter samples untouched."""
  # Clamp at zero: a negative length would otherwise trim from the end.
  new_length = max(0, int(length_seconds * SAMPLE_RATE))
  if new_length > len(samples):
    return samples
  return samples[:new_length]


# Smallest timeline allocation, so growth never proceeds in slivers.
_MIN_CAPACITY = SAMPLE_RATE

# How much of the timeline to convert to 16-bit at a time when encoding. Any
# block size keeps the conversion's working set off the length of the track.
_ENCODE_CHUNK = SAMPLE_RATE


class AudioWriter:
  """Accumulates audio by additively blending sources onto a timeline.

  New samples are added at the current cursor and clamped to [-1.0, 1.0]; delays
  advance the cursor over silence.

  The timeline is float32, which still carries 24 bits of mantissa into a 16-bit
  format, and it is reserved ahead of the samples written onto it. Length and
  capacity are therefore separate: len(self._samples) is what is allocated,
  self._length is what has been written.
  """

  def __init__(self):
    self._samples = np.zeros(0, dtype=np.float32)
    self._length = 0
    self._cursor = 0

  def write_audio_samples(self, samples, length_seconds=None):
    samples = np.asarray(samples, dtype=np.float32)
    if length_seconds is not None:
      samples = truncate_samples(samples, length_seconds)
    end = self._cursor + len(samples)
    self._reserve(end)
    # A view, blended in place. Nothing may hold a view of the timeline across
    # a write, since _reserve is free to move the whole buffer.
    region = self._samples[self._cursor:end]
    region += samples
    np.clip(region, -1.0, 1.0, out=region)
    self._length = max(self._length, end)

  def add_delay_milliseconds(self, delay_milliseconds):
    """Advance the cursor over silence.

    Milliseconds, and integer arithmetic, so the cursor lands on exactly the
    sample a gif frame delay of the same length implies.
    """
    self._cursor += delay_milliseconds * SAMPLE_RATE // 1000

  def get_total_audio_length(self):
    return self._length / SAMPLE_RATE

  def to_wav_bytes(self):
    """Encode accumulated samples as a mono 16-bit WAV, or None if empty."""
    if self._length == 0:
      return None
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as writer:
      writer.setnchannels(CHANNELS)
      writer.setsampwidth(2)
      writer.setframerate(SAMPLE_RATE)
      # A chunk at a time: converting the whole track at once needs several
      # more copies of it, all as wide as the timeline itself.
      for start in range(0, self._length, _ENCODE_CHUNK):
        block = self._samples[start:min(start + _ENCODE_CHUNK, self._length)]
        writer.writeframes(_to_int16(block).tobytes())
    return buffer.getvalue()

  def _reserve(self, end):
    """Grow the timeline to hold at least `end` samples.

    Doubling, resized in place: numpy reallocs, which usually extends the block
    rather than copying it, and never holds two full copies the way concatenate
    does. Growing by exactly what each sound needs instead would re-copy the
    whole timeline once per note, which is quadratic in the notes played.
    """
    if end <= len(self._samples):
      return
    capacity = max(end, 2 * len(self._samples), _MIN_CAPACITY)
    self._samples.resize(capacity, refcheck=False)


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
