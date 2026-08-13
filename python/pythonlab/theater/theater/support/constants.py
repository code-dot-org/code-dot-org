# Canvas dimensions.
THEATER_WIDTH = 400
THEATER_HEIGHT = 400

# Smallest pause/frame duration in seconds; pause() clamps up to this.
MIN_PAUSE_SECONDS = 0.1

# Gif stream size ceiling (30 MB).
MAX_GIF_BYTES = 31457280

# Frame ceiling, counting the closing frame. Frames are held in memory until
# the gif is encoded, at ~480 KB each, so this bounds the worker's heap far
# more tightly than MAX_GIF_BYTES does: simple frames compress to almost
# nothing, and thousands of them fit under the byte ceiling.
MAX_FRAMES = 600
