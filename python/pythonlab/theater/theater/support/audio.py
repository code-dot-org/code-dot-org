import io
import wave
from itertools import islice

import numpy as np

from .constants import CHANNELS, MAX_16_BIT_VALUE, MAX_AUDIO_SECONDS, SAMPLE_RATE


_ONLY_INTEGER_PCM = "Only integer PCM WAV data is supported (8, 16, 24, or 32-bit)"

# Silence and full scale for each width we decode. 8-bit WAV data is unsigned
# with 128 as silence; 9 bits and up are signed two's complement.
_PCM_SCALE = {
  1: (128.0, 128.0),
  2: (0.0, MAX_16_BIT_VALUE),
  3: (0.0, 2 ** 23),
  4: (0.0, 2 ** 31),
}

# numpy offers no 3-byte integer, so 24-bit is absent here and widened by hand.
_PCM_DTYPES = {1: np.uint8, 2: "<i2", 4: "<i4"}

_WIDTH_24_BIT = 3

# Codecs a fmt chunk can name that the wave module reads: uncompressed PCM, and
# the extensible header whose subformat GUID is PCM.
_WAVE_FORMAT_PCM = 0x0001
_WAVE_FORMAT_EXTENSIBLE = 0xFFFE
_SUBFORMAT_PCM = b"\x01\x00\x00\x00\x00\x00\x10\x00\x80\x00\x00\xaa\x00\x38\x9b\x71"

# Fields of a PCM fmt chunk, and where the extensible one keeps its subformat.
_MIN_FMT_CHUNK_SIZE = 16
_SUBFORMAT_RANGE = slice(24, 40)


def read_samples_from_wav_bytes(wav_bytes):
  """Read a WAV file into normalized mono float samples in [-1.0, 1.0].

  Stereo input is averaged to mono, and any other sample rate is resampled to
  SAMPLE_RATE, since the timeline the samples land on carries no rate of its
  own.
  """
  try:
    with wave.open(io.BytesIO(wav_bytes), "rb") as reader:
      num_channels = reader.getnchannels()
      sample_width = reader.getsampwidth()
      frame_rate = reader.getframerate()
      num_frames = reader.getnframes()
      if sample_width not in _PCM_SCALE:
        raise ValueError(_ONLY_INTEGER_PCM)
      if num_channels not in (1, 2):
        raise ValueError("Only mono or stereo WAV data is supported")
      if frame_rate <= 0:
        raise ValueError("WAV data declares no sample rate")
      # Check the header's length before reading, so an outsized file costs
      # nothing; the timeline it would land on is bounded by the same ceiling.
      if num_frames / frame_rate > MAX_AUDIO_SECONDS:
        raise ValueError(
          f"The sound is too long; the limit is {MAX_AUDIO_SECONDS} seconds"
        )
      # Passed straight in, so the frame bytes are released when it returns
      # rather than sitting alongside the resample that follows.
      mono = _decode_frames(
        reader.readframes(num_frames), num_channels, sample_width
      )
  except (wave.Error, EOFError) as error:
    # The wave module's own wording is about RIFF ids and chunks, and neither
    # of its exceptions is one a student's except ValueError would catch.
    if _declares_unsupported_codec(wav_bytes):
      raise ValueError(_ONLY_INTEGER_PCM) from error
    # An empty file reaches the end of the stream looking for the first chunk.
    raise ValueError("This is not a WAV sound file, or it is damaged") from error
  return _to_output_rate(mono, frame_rate)


def _find_fmt_chunk(wav_bytes):
  """The body of the RIFF fmt chunk, or None if there is no readable one."""
  if wav_bytes[0:4] != b"RIFF" or wav_bytes[8:12] != b"WAVE":
    return None
  # Chunks follow the 12-byte RIFF header, each with an 8-byte id and length.
  # fmt is conventionally first, but a LIST or JUNK chunk may precede it.
  offset = 12
  while offset + 8 <= len(wav_bytes):
    size = int.from_bytes(wav_bytes[offset + 4:offset + 8], "little")
    if wav_bytes[offset:offset + 4] == b"fmt ":
      return wav_bytes[offset + 8:offset + 8 + size]
    # Chunks are padded to an even length, and the pad byte is not in the size.
    offset += 8 + size + size % 2
  return None


def _declares_unsupported_codec(wav_bytes):
  """Whether the header names a codec other than PCM.

  The wave module raises the same exception for "a WAV whose codec I don't
  read" and "not a WAV at all", so read the codec out of the header ourselves
  rather than tell a student an intact file is damaged.
  """
  fmt_chunk = _find_fmt_chunk(wav_bytes)
  # Short of the PCM fields, nothing in there is a codec to report; that file
  # is damaged.
  if fmt_chunk is None or len(fmt_chunk) < _MIN_FMT_CHUNK_SIZE:
    return False
  format_tag = int.from_bytes(fmt_chunk[0:2], "little")
  if format_tag == _WAVE_FORMAT_EXTENSIBLE:
    return fmt_chunk[_SUBFORMAT_RANGE] != _SUBFORMAT_PCM
  return format_tag != _WAVE_FORMAT_PCM


def _decode_frames(frames, num_channels, sample_width):
  """Normalized mono float32 samples from integer PCM frame bytes.

  Mono or stereo only; the caller rejects anything else from the header, before
  the frames these come from are read.
  """
  # Count whole samples, then whole frames, dropping a partial one of either. A
  # frame is one sample per channel. Data running short of what the header
  # promised is common enough that the wave module allows it and other players
  # play what is there; numpy would otherwise refuse the buffer's size, or fail
  # to line up two channels of different lengths.
  num_samples = len(frames) // sample_width
  num_samples -= num_samples % num_channels
  if sample_width == _WIDTH_24_BIT:
    mono = _decode_24_bit_frames(frames, num_samples, num_channels)
  else:
    raw = np.frombuffer(frames, dtype=_PCM_DTYPES[sample_width], count=num_samples)
    if num_channels == 1:
      mono = raw.astype(np.float32)
    else:
      mono = raw[0::2].astype(np.float32)
      # Added straight from the integer view: numpy converts it in buffered
      # pieces rather than as a second copy of the track.
      mono += raw[1::2]
      mono *= 0.5
  # Averaging is linear, so an unsigned format's offset survives it and can be
  # removed here, from half as many samples.
  zero_point, full_scale = _PCM_SCALE[sample_width]
  if zero_point:
    mono -= zero_point
  mono /= full_scale
  return mono


def _decode_24_bit_frames(frames, num_samples, num_channels):
  """Mono float32 from 24-bit samples, still at the format's integer scale."""
  triples = np.frombuffer(frames, dtype=np.uint8, count=num_samples * 3)
  triples = triples.reshape(-1, 3)
  mono = _widen_24_bit(triples[0::num_channels])
  if num_channels == 2:
    mono += _widen_24_bit(triples[1::2])
    mono *= 0.5
  return mono


def _widen_24_bit(triples):
  """One channel's 24-bit samples as float32, from its rows of three bytes.

  numpy has no 3-byte integer dtype, so each sample is rebuilt from its bytes,
  accumulating in the float32 array that is returned rather than in a
  full-width integer copy of the track.
  """
  # An integer cast wraps rather than clamps, so reading the top byte as int8 is
  # what carries the sign; the two below it are unsigned place values under it.
  # No step exceeds 2**24, which float32 still counts exactly.
  samples = triples[:, 2].astype(np.int8).astype(np.float32)
  samples *= 256.0
  samples += triples[:, 1]
  samples *= 256.0
  samples += triples[:, 0]
  return samples


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


# How much of the track to resample at a time.
_RESAMPLE_CHUNK = SAMPLE_RATE


def _to_output_rate(samples, source_rate):
  """Linearly resample to SAMPLE_RATE, preserving the sound's duration.

  Linear interpolation aliases when downsampling, which is audible on
  high-rate input but keeps the wheel free of a filter design.
  """
  if source_rate == SAMPLE_RATE or len(samples) == 0:
    return samples
  new_length = int(len(samples) * SAMPLE_RATE / source_rate)
  step = source_rate / SAMPLE_RATE
  resampled = np.empty(new_length, dtype=np.float32)
  for start in range(0, new_length, _RESAMPLE_CHUNK):
    stop = min(start + _RESAMPLE_CHUNK, new_length)
    positions = np.arange(start, stop) * step
    # The input this block reads from, plus the one sample interpolation looks
    # ahead to. Positions are absolute, so the indices handed to interp are too.
    first = int(positions[0])
    last = min(int(positions[-1]) + 2, len(samples))
    resampled[start:stop] = np.interp(
      positions, np.arange(first, last), samples[first:last]
    )
  return resampled


def _to_int16(samples):
  # 1.0 maps to the maximum signed 16-bit value; everything else scales by
  # 32768 and truncates toward zero.
  scaled = np.where(samples == 1.0, 32767.0, samples * MAX_16_BIT_VALUE)
  return scaled.astype(np.int16)
