import io
import wave

import numpy as np

from theater.support.audio import (
  AudioWriter,
  read_samples_from_wav_bytes,
  truncate_samples,
)
from theater.support.constants import SAMPLE_RATE


def _make_wav_bytes(samples, channels):
  int_samples = (np.asarray(samples) * 32768).astype("<i2")
  buffer = io.BytesIO()
  with wave.open(buffer, "wb") as writer:
    writer.setnchannels(channels)
    writer.setsampwidth(2)
    writer.setframerate(SAMPLE_RATE)
    writer.writeframes(int_samples.tobytes())
  return buffer.getvalue()


def test_read_mono_wav():
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.0, 0.5, -0.5], 1))
  assert np.allclose(samples, [0.0, 0.5, -0.5], atol=1e-4)


def test_read_stereo_wav_averages_channels():
  # Interleaved L/R: (0.2,0.6) and (0.4,-0.4) average to 0.4 and 0.0.
  samples = read_samples_from_wav_bytes(_make_wav_bytes([0.2, 0.6, 0.4, -0.4], 2))
  assert np.allclose(samples, [0.4, 0.0], atol=1e-4)


def test_truncate_shortens_but_never_extends():
  samples = np.ones(SAMPLE_RATE)
  assert len(truncate_samples(samples, 0.5)) == SAMPLE_RATE // 2
  assert len(truncate_samples(samples, 2.0)) == SAMPLE_RATE


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
