import io
import struct
import wave

import numpy as np
import pytest

from theater.support.audio import (
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
  # These land on a float32 timeline. A float64 decode doubled the heap at
  # every step, which for a track near the length ceiling ran to hundreds of
  # megabytes on a machine with none to spare.
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.25, -0.25], 1))
  assert samples.dtype == np.float32


def test_stereo_averaging_is_exact():
  # Not allclose, unlike its neighbours: a sum of two 16-bit values needs 17
  # bits and is scaled only by powers of two, so float32 carries the average
  # with nothing rounded away.
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
  # The wave module raises wave.Error, or EOFError for an empty file. Neither
  # is what a student's "except ValueError" catches, and both talk about RIFF
  # ids and chunks.
  with pytest.raises(ValueError):
    read_samples_from_wav_bytes(wav_bytes)


@pytest.mark.parametrize(
  "channels,dropped,expected",
  [(1, 1, 7), (1, 2, 7), (1, 3, 6), (2, 1, 3), (2, 2, 3), (2, 3, 3)],
)
def test_read_plays_what_a_short_file_actually_holds(channels, dropped, expected):
  # A header promising more frames than the data chunk carries is common, and
  # other players play what is there. numpy used to refuse the buffer's size,
  # or fail to line up two channels of unequal length.
  wav = _make_wav_bytes([0.25, -0.25] * 4, channels)
  samples = read_samples_from_wav_bytes(wav[:-dropped])
  assert len(samples) == expected
  # What survives is the head of the sound, unshifted.
  whole = read_samples_from_wav_bytes(wav)
  assert np.allclose(samples, whole[:expected], atol=1e-4)


def test_read_rejects_more_than_two_channels():
  wav = bytearray(_make_wav_bytes([0.5] * 12, 2))
  # Channel count sits at bytes 22:24 of the header the wave module emits.
  assert wav[22:24] == struct.pack("<H", 2)
  wav[22:24] = struct.pack("<H", 4)
  with pytest.raises(ValueError):
    read_samples_from_wav_bytes(bytes(wav))


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
