import io
import struct
import wave

import numpy as np
import pytest

from theater.support.audio import (
  _MAX_SAMPLES,
  _MIN_CAPACITY,
  _RESAMPLE_CHUNK,
  _to_output_rate,
  as_samples,
  AudioWriter,
  read_samples_from_wav_bytes,
  truncate_samples,
)
from theater.support.constants import MAX_AUDIO_SECONDS, SAMPLE_RATE


def _make_wav_bytes(samples, channels, frame_rate=SAMPLE_RATE):
  int_samples = (np.asarray(samples) * 32768).astype("<i2")
  buffer = io.BytesIO()
  with wave.open(buffer, "wb") as writer:
    writer.setnchannels(channels)
    writer.setsampwidth(2)
    writer.setframerate(frame_rate)
    writer.writeframes(int_samples.tobytes())
  return buffer.getvalue()


def test_read_mono_wav():
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.0, 0.5, -0.5], 1))
  assert np.allclose(samples, [0.0, 0.5, -0.5], atol=1e-4)


def test_read_stereo_wav_averages_channels():
  # Interleaved L/R: (0.2,0.6) and (0.4,-0.4) average to 0.4 and 0.0.
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.2, 0.6, 0.4, -0.4], 2))
  assert np.allclose(samples, [0.4, 0.0], atol=1e-4)


@pytest.mark.parametrize("frame_rate", [8000, 22050, 48000, 88200])
def test_read_resamples_to_the_output_rate(frame_rate):
  # One second in, one second out: without this the samples were spliced onto
  # the timeline verbatim, so 8 kHz input played 5.5x too fast.
  samples = read_samples_from_wav_bytes(
    _make_wav_bytes(np.full(frame_rate, 0.5), 1, frame_rate)
  )
  assert len(samples) == SAMPLE_RATE
  # A constant interpolates to itself, so resampling must not alter the level.
  assert np.allclose(samples, 0.5, atol=1e-4)


def test_read_leaves_output_rate_input_alone():
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.25, -0.25], 1))
  assert np.allclose(samples, [0.25, -0.25], atol=1e-4)


def _unblocked_resample(samples, source_rate):
  """The whole track at once, as a reference for the blocked version."""
  new_length = int(len(samples) * SAMPLE_RATE / source_rate)
  positions = np.arange(new_length) * source_rate / SAMPLE_RATE
  return np.interp(positions, np.arange(len(samples)), samples)


def test_read_returns_float32():
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.25, -0.25], 1))
  assert samples.dtype == np.float32


def test_stereo_averaging_is_exact():
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.25, -0.75, 0.5, 0.5], 2))
  assert samples.tolist() == [-0.25, 0.5]


@pytest.mark.parametrize("frame_rate", [8000, 22050, 48000, 88200])
@pytest.mark.parametrize(
  "length", [1, 2, _RESAMPLE_CHUNK - 1, _RESAMPLE_CHUNK, 3 * _RESAMPLE_CHUNK + 7]
)
def test_resampling_a_block_at_a_time_matches_the_whole_track(frame_rate, length):
  # Resampling a block at a time is what keeps interp's float64 working set off
  # the length of the track. An error at a block's edge would be inaudible in a
  # spot check, so compare against the unblocked arithmetic outright.
  samples = np.random.default_rng(length).uniform(-1.0, 1.0, length)
  samples = samples.astype(np.float32)
  assert np.allclose(
    _to_output_rate(samples, frame_rate),
    _unblocked_resample(samples, frame_rate),
    atol=1e-6,
  )


@pytest.mark.parametrize(
  "wav_bytes", [b"", b"hello world", b"RIFF" + b"\x00" * 40]
)
def test_read_rejects_data_that_is_not_a_wav_file(wav_bytes):
  with pytest.raises(ValueError, match="not a WAV sound file"):
    read_samples_from_wav_bytes(wav_bytes)


# The GUID a WAVE_FORMAT_EXTENSIBLE header carries for 32-bit float samples.
_IEEE_FLOAT_SUBFORMAT = (
  b"\x03\x00\x00\x00\x00\x00\x10\x00\x80\x00\x00\xaa\x00\x38\x9b\x71"
)

_PCM_SUBFORMAT = (
  b"\x01\x00\x00\x00\x00\x00\x10\x00\x80\x00\x00\xaa\x00\x38\x9b\x71"
)


def _make_wav_bytes_with_codec(
  format_tag, subformat=b"", leading_chunk=b"", bits_per_sample=16
):
  """A WAV whose fmt chunk names the given codec, built by hand.

  The wave module writes PCM only, and its reader rejects an unsupported codec
  before any of it can be patched in place.
  """
  fmt_body = struct.pack(
    "<HHIIHH", format_tag, 1, SAMPLE_RATE, SAMPLE_RATE * 2, 2, bits_per_sample
  )
  if subformat:
    fmt_body += struct.pack("<HHI", 22, 16, 0) + subformat
  chunks = (
    leading_chunk
    + b"fmt " + struct.pack("<I", len(fmt_body)) + fmt_body
    + b"data" + struct.pack("<I", 4) + b"\x00\x00\x01\x00"
  )
  return b"RIFF" + struct.pack("<I", 4 + len(chunks)) + b"WAVE" + chunks


# Codec tags the wave module refuses outright: 32-bit float, mu-law, ADPCM, and
# an extensible header whose subformat is float.
@pytest.mark.parametrize("format_tag", [0x0003, 0x0007, 0x0011, 0xFFFE])
def test_read_names_the_codec_rather_than_calling_the_file_damaged(format_tag):
  # These files are intact, so telling a student to go find an undamaged copy
  # sends them after a problem they don't have.
  subformat = _IEEE_FLOAT_SUBFORMAT if format_tag == 0xFFFE else b""
  wav = _make_wav_bytes_with_codec(format_tag, subformat)
  with pytest.raises(ValueError, match="integer PCM"):
    read_samples_from_wav_bytes(wav)


def test_read_accepts_an_extensible_header_carrying_pcm():
  # Same codec, written the long way; nothing here is unsupported.
  wav = _make_wav_bytes_with_codec(0xFFFE, _PCM_SUBFORMAT)
  assert np.allclose(read_samples_from_wav_bytes(wav), [0.0, 1 / 32768], atol=1e-4)


def test_read_finds_the_codec_behind_a_leading_chunk():
  # fmt is conventionally first, but writers pad with JUNK to align the data.
  junk = b"JUNK" + struct.pack("<I", 8) + b"\x00" * 8
  wav = _make_wav_bytes_with_codec(0x0003, leading_chunk=junk)
  with pytest.raises(ValueError, match="integer PCM"):
    read_samples_from_wav_bytes(wav)


def test_read_still_calls_a_truncated_header_damaged():
  # Cut inside the fmt chunk, so there is no codec in there to report.
  wav = _make_wav_bytes_with_codec(0x0003)
  with pytest.raises(ValueError, match="not a WAV sound file"):
    read_samples_from_wav_bytes(wav[:24])


def _encode_pcm(values, sample_width):
  """Integer sample values as little-endian bytes of the given width."""
  values = np.asarray(values, dtype="<i8")
  if sample_width == 1:
    # 8-bit is the one unsigned width, so its values arrive offset by 128.
    return values.astype(np.uint8).tobytes()
  if sample_width == 3:
    # Keep the low three bytes of each little-endian word.
    return values.astype("<i4").view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
  return values.astype(f"<i{sample_width}").tobytes()


def _make_wav_bytes_from_ints(values, channels, sample_width):
  buffer = io.BytesIO()
  with wave.open(buffer, "wb") as writer:
    writer.setnchannels(channels)
    writer.setsampwidth(sample_width)
    writer.setframerate(SAMPLE_RATE)
    writer.writeframes(_encode_pcm(values, sample_width))
  return buffer.getvalue()


def _full_scale(sample_width):
  return 2 ** (8 * sample_width - 1)


def _tolerance(sample_width):
  """A depth's own step, or float32's resolution once the depth outruns it."""
  return max(1 / _full_scale(sample_width), 1e-6)


def _make_wav_bytes_at_width(samples, channels, sample_width):
  """A WAV holding the given levels at the given depth."""
  values = np.round(np.asarray(samples) * _full_scale(sample_width))
  if sample_width == 1:
    values += 128
  return _make_wav_bytes_from_ints(values, channels, sample_width)


_LEVELS = [0.0, 0.5, -0.5, 0.25, -0.75, 0.75]


@pytest.mark.parametrize("sample_width", [1, 2, 3, 4])
def test_read_accepts_every_integer_pcm_width(sample_width):
  wav = _make_wav_bytes_at_width(_LEVELS, 1, sample_width)
  samples = read_samples_from_wav_bytes(wav)
  assert np.allclose(samples, _LEVELS, atol=_tolerance(sample_width))


@pytest.mark.parametrize("sample_width", [1, 2, 3, 4])
def test_read_averages_stereo_at_every_width(sample_width):
  # Interleaved L/R: (0.2,0.6) and (0.4,-0.4) average to 0.4 and 0.0.
  wav = _make_wav_bytes_at_width([0.2, 0.6, 0.4, -0.4], 2, sample_width)
  samples = read_samples_from_wav_bytes(wav)
  assert np.allclose(samples, [0.4, 0.0], atol=_tolerance(sample_width))


def test_read_treats_8_bit_data_as_unsigned():
  # 8-bit WAV is the odd one out: offset binary, where 128 is silence. Read as
  # signed it would come out inverted and shifted a half scale.
  wav = _make_wav_bytes_from_ints([0, 128, 255], 1, 1)
  assert read_samples_from_wav_bytes(wav).tolist() == [-1.0, 0.0, 127 / 128]


@pytest.mark.parametrize("sample_width", [1, 2, 3, 4])
def test_read_maps_the_extremes_of_each_width(sample_width):
  full_scale = _full_scale(sample_width)
  # 8-bit counts up from zero; the signed widths count from negative full scale.
  lowest, highest = (0, 255) if sample_width == 1 else (-full_scale, full_scale - 1)
  zero_point = 128 if sample_width == 1 else 0
  wav = _make_wav_bytes_from_ints([lowest, highest], 1, sample_width)
  samples = read_samples_from_wav_bytes(wav)
  assert samples[0] == -1.0
  # One step short of full scale -- except at 32 bits, where float32 has no room
  # for that step and it rounds to exactly 1.0, which the timeline clips to
  # anyway.
  assert samples[1] == np.float32((highest - zero_point) / full_scale)
  assert samples[1] <= 1.0


def test_read_widens_24_bit_samples_exactly():
  # float32 counts integers exactly to 2**24, and every step of the byte
  # assembly stays under that, so 24-bit input should not be approximate at
  # all: it either lands on the sample or the assembly is wrong.
  values = [0, 1, -1, 1234567, -1234567, 8388607, -8388608]
  wav = _make_wav_bytes_from_ints(values, 1, 3)
  samples = read_samples_from_wav_bytes(wav)
  expected = (np.asarray(values, dtype=np.float64) / 2 ** 23).astype(np.float32)
  assert samples.tolist() == expected.tolist()


@pytest.mark.parametrize("sample_width", [1, 2, 3, 4])
@pytest.mark.parametrize("channels", [1, 2])
def test_read_plays_what_a_short_file_holds_at_every_width(sample_width, channels):
  # A file cut mid-sample or mid-frame still plays what is there. The trailing
  # partial has to be dropped per width, not per 2-byte sample.
  wav = _make_wav_bytes_at_width([0.25, -0.25] * 4, channels, sample_width)
  whole = read_samples_from_wav_bytes(wav)
  for dropped in range(1, 2 * sample_width * channels):
    samples = read_samples_from_wav_bytes(wav[:-dropped])
    assert len(samples) <= len(whole)
    assert np.allclose(samples, whole[: len(samples)], atol=1e-6)


def test_read_rejects_a_width_it_cannot_decode():
  # 40-bit PCM: the wave module reports 5 bytes a sample and reads it happily,
  # so nothing but our own check turns it away.
  wav = _make_wav_bytes_with_codec(0x0001, bits_per_sample=40)
  with pytest.raises(ValueError, match="integer PCM"):
    read_samples_from_wav_bytes(wav)


@pytest.mark.parametrize(
  "channels,dropped,expected",
  [(1, 1, 7), (1, 2, 7), (1, 3, 6), (2, 1, 3), (2, 2, 3), (2, 3, 3)],
)
def test_read_plays_what_a_short_file_actually_holds(channels, dropped, expected):
  wav = _make_wav_bytes([0.25, -0.25] * 4, channels)
  samples = read_samples_from_wav_bytes(wav[:-dropped])
  assert len(samples) == expected
  # What survives is the head of the sound, unshifted.
  whole = read_samples_from_wav_bytes(wav)
  assert np.allclose(samples, whole[:expected], atol=1e-4)


def _with_channel_count(wav_bytes, num_channels):
  """Patch the header's channel count, which the wave module won't write."""
  wav = bytearray(wav_bytes)
  # Channel count sits at bytes 22:24 of the header the wave module emits.
  assert wav[22:24] == struct.pack("<H", 2)
  wav[22:24] = struct.pack("<H", num_channels)
  return bytes(wav)


def test_read_rejects_more_than_two_channels():
  wav = _with_channel_count(_make_wav_bytes([0.5] * 12, 2), 4)
  with pytest.raises(ValueError, match="mono or stereo"):
    read_samples_from_wav_bytes(wav)


def test_read_rejects_more_than_two_channels_before_reading_frames(monkeypatch):
  # The frame bytes are what we are refusing to allocate: the duration ceiling
  # bounds frames per second, not channels, so a 300-second file at the ceiling
  # holds 106 MB across 4 channels and more as the count climbs. In the Pyodide
  # worker that reads as a crash rather than as this message.
  def refuse_to_read(self, num_frames):
    raise AssertionError("frames were read before the channel count was checked")

  monkeypatch.setattr(wave.Wave_read, "readframes", refuse_to_read)
  wav = _with_channel_count(_make_wav_bytes([0.5] * 12, 2), 4)
  with pytest.raises(ValueError, match="mono or stereo"):
    read_samples_from_wav_bytes(wav)


def test_read_rejects_a_missing_sample_rate():
  # The wave module refuses to write a zero rate, so patch the field directly.
  # Sample rate sits at bytes 24:28 of the canonical header it emits.
  wav = bytearray(_make_wav_bytes([0.5], 1))
  assert wav[24:28] == struct.pack("<I", SAMPLE_RATE)
  wav[24:28] = struct.pack("<I", 0)
  with pytest.raises(ValueError):
    read_samples_from_wav_bytes(bytes(wav))


def test_read_rejects_a_sound_past_the_length_ceiling():
  # Refused from the header, before any frame is read: a file this long would
  # not fit on the timeline anyway.
  frame_rate = 8000
  long_wav = _make_wav_bytes(
    np.zeros(frame_rate * (MAX_AUDIO_SECONDS + 1)), 1, frame_rate
  )
  with pytest.raises(ValueError):
    read_samples_from_wav_bytes(long_wav)


@pytest.mark.parametrize(
  "sound", [[0.5, 0.25], (0.5, 0.25), np.array([0.5, 0.25]), iter([0.5, 0.25])]
)
def test_as_samples_accepts_any_sequence_or_iterator(sound):
  samples = as_samples(sound)
  assert samples.dtype == np.float32
  assert np.allclose(samples, [0.5, 0.25])


def test_as_samples_copies_what_it_is_given():
  # numpy hands back the same array for a same-dtype input unless told to copy,
  # which would leave the caller holding the scene's samples.
  original = np.array([0.5, 0.5], dtype=np.float32)
  samples = as_samples(original)
  original[0] = -1.0
  assert samples[0] == 0.5


def test_as_samples_rejects_a_sequence_past_the_length_ceiling():
  with pytest.raises(ValueError):
    as_samples(np.zeros(_MAX_SAMPLES + 1))


def test_as_samples_allows_a_sequence_at_the_length_ceiling():
  assert len(as_samples(np.zeros(_MAX_SAMPLES))) == _MAX_SAMPLES


def test_as_samples_rejects_an_endless_iterator():
  # Drawing on this without a bound exhausts the heap rather than raising, and
  # in the browser that takes the interpreter down with it. Counting what the
  # iterator was asked for proves the ceiling stopped it.
  drawn = 0

  def forever():
    nonlocal drawn
    while True:
      drawn += 1
      yield 0.5

  with pytest.raises(ValueError):
    as_samples(forever())
  assert drawn == _MAX_SAMPLES + 1


@pytest.mark.parametrize(
  "sound",
  [
    [[0.5, 0.25], [0.125, 0.0625]],
    ([0.5], [0.25]),
    np.zeros((2, 4), dtype=np.float32),
    np.zeros((2, 2, 2), dtype=np.float32),
  ],
)
def test_as_samples_rejects_a_nested_sequence(sound):
  # The timeline these blend onto is one-dimensional, and numpy's own complaint
  # about it -- a broadcast error naming shapes -- tells a student nothing.
  with pytest.raises(ValueError):
    as_samples(sound)


def test_as_samples_rejects_nesting_before_it_measures_length():
  # The outer length clears the ceiling, the total does not. Nesting has to be
  # caught on its own, or the copy the length check permits is unbounded.
  rows = 100
  sound = [[0.0] * (_MAX_SAMPLES // rows)] * rows
  assert len(sound) < _MAX_SAMPLES
  with pytest.raises(ValueError):
    as_samples(sound)


def test_as_samples_accepts_an_empty_sequence():
  # There is no first element to probe for nesting here.
  assert len(as_samples([])) == 0


def test_truncate_shortens_but_never_extends():
  samples = np.ones(SAMPLE_RATE)
  assert len(truncate_samples(samples, 0.5)) == SAMPLE_RATE // 2
  assert len(truncate_samples(samples, 2.0)) == SAMPLE_RATE


@pytest.mark.parametrize("length_seconds", [0.0, -0.001, -1.0, -1e6])
def test_truncate_never_trims_from_the_end(length_seconds):
  # A negative length reaching numpy unclamped would slice off the tail and
  # play most of the sample instead of none of it.
  assert len(truncate_samples(np.ones(SAMPLE_RATE), length_seconds)) == 0


def test_blend_adds_and_clamps():
  writer = AudioWriter()
  writer.write_audio_samples([0.8, 0.8])
  writer.write_audio_samples([0.8, -0.8])  # blended at cursor 0
  wav = writer.to_wav_bytes()
  samples = read_samples_from_wav_bytes(wav)
  # 0.8 + 0.8 clamps to 1.0; 0.8 + -0.8 = 0.0
  assert samples[0] > 0.99
  assert abs(samples[1]) < 0.01


def test_delay_inserts_silence():
  writer = AudioWriter()
  writer.add_delay_milliseconds(1000)
  writer.write_audio_samples([1.0])
  samples = read_samples_from_wav_bytes(writer.to_wav_bytes())
  assert len(samples) == SAMPLE_RATE + 1
  assert samples[0] == 0.0


@pytest.mark.parametrize("milliseconds", [10, 120, 430, 1000, 59000])
def test_delay_lands_on_a_whole_sample(milliseconds):
  # The gif counts centiseconds, so the cursor has to sit on the same sample a
  # frame delay of this length does, exactly, however long the scene runs.
  writer = AudioWriter()
  writer.add_delay_milliseconds(milliseconds)
  writer.write_audio_samples([1.0])
  samples = read_samples_from_wav_bytes(writer.to_wav_bytes())
  assert len(samples) - 1 == milliseconds * SAMPLE_RATE // 1000


def test_length_is_what_was_written_not_what_was_reserved():
  # The timeline is allocated ahead of the samples, so a writer measuring its
  # capacity would pad every program with a second of trailing silence.
  writer = AudioWriter()
  writer.write_audio_samples([1.0, 1.0])
  assert writer.get_total_audio_length() == 2 / SAMPLE_RATE
  assert len(read_samples_from_wav_bytes(writer.to_wav_bytes())) == 2


def test_a_long_melody_does_not_recopy_the_timeline():
  # Reserving exactly what each note needs re-copies everything written so far,
  # once per note: quadratic, and about 6 GB of copying over a 600-note melody.
  # Doubling keeps the reserved space within a constant factor of the track.
  note_samples = [0.5] * 100
  writer = AudioWriter()
  for _ in range(2000):
    writer.write_audio_samples(note_samples)
    writer.add_delay_milliseconds(10)
  written = 1999 * (10 * SAMPLE_RATE // 1000) + len(note_samples)
  assert writer.get_total_audio_length() == written / SAMPLE_RATE
  assert len(writer._samples) < 2 * written + _MIN_CAPACITY


def test_empty_writer_returns_none():
  assert AudioWriter().to_wav_bytes() is None
