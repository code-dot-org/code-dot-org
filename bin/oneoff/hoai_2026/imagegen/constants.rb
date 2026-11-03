# Constants for use in the image generation, validation and review scripts

require 'cdo/shared_constants'

# Bucket locations. curriculum.code.org serves the production bucket through
# CloudFront; the devel bucket is read straight from S3.
BUCKET_NAME = 'cdo-curriculum'
BUCKET_PATH = 'media/spritelab/generate/images'
PUBLIC_URLS = {
  'production' => "https://curriculum.code.org/#{BUCKET_PATH}/",
  'devel' => "https://#{BUCKET_NAME}-devel.s3.amazonaws.com/#{BUCKET_PATH}/",
}.freeze

# Everything a preview needs beyond the lab's tree: the drawings moderation
# flagged or review rejected, held-back current ones, and a manifest per
# sentence. A sibling of BUCKET_PATH, so none of it can land in the tree
# the lab reads. Paths in a manifest are relative to GENERATE_PATH.
GENERATE_PATH = 'media/spritelab/generate'
REVIEW_PATH = "#{GENERATE_PATH}/review"
PUBLIC_GENERATE_URLS = {
  'production' => "https://curriculum.code.org/#{GENERATE_PATH}/",
  'devel' => "https://#{BUCKET_NAME}-devel.s3.amazonaws.com/#{GENERATE_PATH}/",
}.freeze

# What has been uploaded, per bucket, so a review file goes up once.
UPLOAD_LEDGER_FILE = 'upload_ledger.json'

# Where --publish-review writes the manifests it uploads, for reading
# locally; a dry run writes them here too.
REVIEW_MANIFESTS_DIRECTORY = 'review_manifests'

# The tree's version, a folder above everything else. Matches
# IMAGE_CACHE_VERSION in apps/src/p5lab/spritelab/lab2/ai/images/imageCache.ts:
# bump both when the words or the prompts change, so a browser holding the
# old files never mixes them with the new.
CACHE_VERSION = 'v1'

# Where things land locally, relative to this directory. image_output holds
# exactly the published tree; image_records holds what the tree may not
# (prompts, seeds, verdicts); image_attic holds every image a redraw
# replaced, since nothing here deletes an image.
OUTPUT_DIRECTORY = 'image_output'
RECORDS_DIRECTORY = 'image_records'
ATTIC_DIRECTORY = 'image_attic'

# The cached output of dump_prompts.ts, rewritten on every run
PROMPTS_FILE = 'prompts.jsonl'

# The prompt judge's verdicts, by model and prompt; a prompt is judged once.
PROMPT_VERDICTS_FILE = 'prompt_verdicts.json'

# Stands in a path for an optional slot left empty, as EMPTY_WORD_ID does in
# imageCache.ts.
EMPTY_WORD_ID = '_'

# How many variants the lab looks for per filling, numbered from 00
# (VARIANT_COUNT in imageCache.ts). More are drawn only on request and the
# lab never shows them.
VARIANTS = 3

# Styles the lab can ask for; the sentence layout asks only for pixel art.
STYLES = %w[pixel smooth]

# The image services this script can ask (override with --provider).
# 'vertex' is Gemini on Vertex AI, where the AI Gateway draws the lab's live
# pictures; 'gemini' is the same model through the Gemini API.
PROVIDERS = %w[vertex gemini openai]
DEFAULT_PROVIDER = 'vertex'

# The providers that are Gemini, by either of Google's routes (google.rb).
GOOGLE_PROVIDERS = %w[vertex gemini].freeze

# OpenAI image endpoints
OPENAI_GENERATIONS_URL = 'https://api.openai.com/v1/images/generations'
OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits'

# Gemini generates, edits and judges through one endpoint on each route;
# %{model} is the model id, and %{project} the service account's project.
GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/%{model}:generateContent'
VERTEX_URL = 'https://aiplatform.googleapis.com/v1/projects/%{project}/locations/global/publishers/google/models/%{model}:generateContent'

# Default model per provider (override with --model). Gemini's comes from
# the shared constants the lab's image model is named in, so the two track.
DEFAULT_MODELS = {
  'vertex' => SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_3_1_FLASH_IMAGE],
  'gemini' => SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_3_1_FLASH_IMAGE],
  'openai' => 'gpt-image-1',
}.freeze

# The config key each provider's credentials come from (override with
# --key): a service account key for Vertex, an API key otherwise. The tutor
# service account is the one Rails' AI Tutor calls Vertex with.
API_KEY_NAMES = {
  'vertex' => 'google_vertex_ai_tutor_service_account_key',
  'gemini' => 'google_gemini_ai_tutor_api_key',
  'openai' => 'openai_student_learning_api_key',
}.freeze

# Only OpenAI can return an alpha channel, and only with --transparent: the
# lab keys a cached set on the colour chooseKeyColor() names in its prompt,
# so a published image must be drawn on that colour as a live one is.
TRANSPARENT_PROVIDERS = %w[openai].freeze

# The safety judges run on Gemini whatever draws the images: on the drawing
# provider's route when it is Google's, else on this one.
DEFAULT_JUDGE_PROVIDER = 'vertex'

# Gemini's output size, matching SINGLE_IMAGE_SIZE in modelHelpers.ts.
GEMINI_IMAGE_SIZE = '1K'

# Sampling wildness Gemini is asked for; SentenceScene sends this.
# The OpenAI image API takes no temperature.
TEMPERATURE = 1.0

# OpenAI's output size. Matches MODEL_OUTPUT_PX in
# apps/src/p5lab/spritelab/lab2/ai/images/imagePrompts.ts; the pixel-art
# prompts and the client's post-processing both assume it.
SIZE = '1024x1024'

# Rendering quality ('low', 'medium', 'high', 'auto'); nil omits it
QUALITY = nil

# The model both safety judges run on, as DEFAULT_SAFETY_CONFIG and
# DEFAULT_IMAGE_SAFETY_CONFIG name it in aichat's safetyHelpers.ts.
JUDGE_MODEL = SharedConstants::AI_CHAT_MODEL_IDS[:GEMINI_2_5_FLASH]

# Azure severity at or above which an image is flagged, per category: the
# lab's CATEGORY_SEVERITY_LEVEL_BLOCKED in util/moderateImage.ts with the
# {Violence: 2} that getImageModerationStatus() in safetyHelpers.ts applies
# to generated images. Severities are 0, 2, 4 and 6.
AZURE_BLOCKED_SEVERITY = {
  'Hate' => 2,
  'SelfHarm' => 2,
  'Sexual' => 2,
  'Violence' => 2,
}.freeze

# Times a flagged variant is redrawn before it is left out.
MAX_REDRAWS = 2

# Concurrent requests
JOBS = 4

# Attempts per request on a timeout, rate limit or server error
MAX_ATTEMPTS = 4
