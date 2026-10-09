# Constants for use in the image generation and validation scripts

require 'cdo/shared_constants'

# Bucket locations
BUCKET_NAME = 'cdo-curriculum'
BUCKET_PATH = 'media/spritelab/generate/images'

# Where generated images land locally, relative to this directory
OUTPUT_DIRECTORY = 'image_output'

# The cached output of dump_prompts.ts, rewritten on every run
PROMPTS_FILE = 'prompts.jsonl'

# The image services this script can ask (override with --provider).
# 'gemini' is what the lab itself generates with, through the AI Gateway;
# 'openai' can return a transparent background, which Gemini cannot.
PROVIDERS = %w[openai gemini]
DEFAULT_PROVIDER = 'openai'

# OpenAI image endpoints
OPENAI_GENERATIONS_URL = 'https://api.openai.com/v1/images/generations'
OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits'

# Gemini generates and edits through one endpoint; %<model>s is the model id.
GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/%{model}:generateContent'

# Default model per provider (override with --model). Gemini's comes from
# the shared constants the lab's image model is named in, so the two track.
DEFAULT_MODELS = {
  'openai' => 'gpt-image-1',
  'gemini' => SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_3_1_FLASH_IMAGE],
}.freeze

# The config key each provider's credentials come from (override with
# --key). Gemini has two; the tutor key is the one the 2025 music script
# generated with.
API_KEY_NAMES = {
  'openai' => 'openai_student_learning_api_key',
  'gemini' => 'google_gemini_ai_tutor_api_key',
}.freeze

# Only OpenAI can return an alpha channel; Gemini is asked for the flat key
# color the lab erases after a generation (see --no-transparent).
TRANSPARENT_PROVIDERS = %w[openai].freeze

# Gemini's output size, matching SINGLE_IMAGE_SIZE in modelHelpers.ts.
GEMINI_IMAGE_SIZE = '1K'

# Sampling wildness Gemini is asked for; the explore layout sends this.
# The OpenAI image API takes no temperature.
TEMPERATURE = 1.0

# OpenAI's output size. Matches MODEL_OUTPUT_PX in
# apps/src/p5lab/spritelab/lab2/ai/images/imagePrompts.ts; the pixel-art
# prompts and the client's post-processing both assume it.
SIZE = '1024x1024'

# Rendering quality ('low', 'medium', 'high', 'auto'); nil omits it
QUALITY = nil

# Styles the student form offers (see IMAGE_STYLE_LABELS in types.ts)
STYLES = %w[pixel smooth]

# What --list-words calls an optional slot's empty choice, matching
# NO_CHOICE in dump_prompts.ts.
NO_CHOICE = 'none'

# The image UIs whose choices dump_prompts.ts enumerates: the image
# dialog's adlib dropdowns, and the explore layout's word chips.
SOURCES = %w[adlib explore]

# The number of different images to produce per combo. Each live generation
# rolls a fresh seed, so one per combo understates the variety.
VARIANTS = 3

# Concurrent requests
JOBS = 4

# Attempts per request on a timeout, rate limit or server error
MAX_ATTEMPTS = 4
