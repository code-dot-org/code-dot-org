# Constants for use in the image generation and validation scripts

# Bucket locations
BUCKET_NAME = 'cdo-curriculum'
BUCKET_PATH = 'media/spritelab/generate/images'

# Where generated images land locally, relative to this directory
OUTPUT_DIRECTORY = 'image_output'

# The cached output of dump_prompts.ts, rewritten on every run
PROMPTS_FILE = 'prompts.jsonl'

# OpenAI image endpoints
OPENAI_GENERATIONS_URL = 'https://api.openai.com/v1/images/generations'
OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits'

# Default model to use (override with --model)
MODEL = 'gpt-image-1'

# Matches MODEL_OUTPUT_PX in apps/src/p5lab/spritelab/lab2/ai/images/imagePrompts.ts;
# the pixel-art prompts and the client's post-processing both assume it.
SIZE = '1024x1024'

# Rendering quality ('low', 'medium', 'high', 'auto'); nil omits it
QUALITY = nil

# Styles the student form offers (see IMAGE_STYLE_LABELS in types.ts)
STYLES = %w[pixel smooth]

# The number of different images to produce per combo. Each live generation
# rolls a fresh seed, so one per combo understates the variety.
VARIANTS = 3

# Concurrent requests
JOBS = 4

# Attempts per request on a timeout, rate limit or server error
MAX_ATTEMPTS = 4
