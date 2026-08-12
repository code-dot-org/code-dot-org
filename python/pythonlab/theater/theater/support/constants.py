# Canvas dimensions, from org.code.theater.support.Constants.
THEATER_WIDTH = 400
THEATER_HEIGHT = 400

# Audio format, from org.code.media.util.AudioUtils.
SAMPLE_RATE = 44100
BITS_PER_SAMPLE = 16
CHANNELS = 1  # output is mono
MAX_16_BIT_VALUE = 32768

# Smallest pause/frame duration, from Scene.pause (Java clamps to 0.1s).
MIN_PAUSE_SECONDS = 0.1

# Gif stream size ceiling, from org.code.theater.support.GifWriter (30 MB).
MAX_GIF_BYTES = 31457280
