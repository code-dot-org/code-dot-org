import io
import struct
import wave

import numpy as np
import pytest

from theater.support.audio import (
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
  writer.add_delay(1.0)
  writer.write_audio_samples([1.0])
  samples = read_samples_from_wav_bytes(writer.to_wav_bytes())
  assert len(samples) == SAMPLE_RATE + 1
  assert samples[0] == 0.0


def test_empty_writer_returns_none():
  assert AudioWriter().to_wav_bytes() is None
