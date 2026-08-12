# Canvas dimensions.
THEATER_WIDTH = 400
THEATER_HEIGHT = 400

# Audio format.
SAMPLE_RATE = 44100
BITS_PER_SAMPLE = 16
CHANNELS = 1  # output is mono
MAX_16_BIT_VALUE = 32768

# Smallest pause/frame duration in seconds; pause() rejects anything shorter.
MIN_PAUSE_SECONDS = 0.1

# Largest pause/frame duration in seconds; pause() rejects anything longer. A
# gif frame delay is an unsigned 16-bit count of centiseconds, so 65535
# centiseconds is the longest delay the format can hold.
MAX_PAUSE_SECONDS = 655.35

# Gif stream size ceiling (30 MB).
MAX_GIF_BYTES = 31457280

# Pixel ceiling for a single image, blank or loaded (4096x4096, or 64 MB of
# RGBA).
MAX_IMAGE_PIXELS = 16777216

# Frame ceiling, counting the closing frame. Pillow holds a palette copy of
# every frame while encoding, ~160 KB each, so this bounds the worker's heap
# far more tightly than MAX_GIF_BYTES does: simple frames compress to almost
# nothing, and thousands of them fit under the byte ceiling.
# TODO: determine if we can increase this limit.
MAX_FRAMES = 600
