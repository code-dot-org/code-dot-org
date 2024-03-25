EMBEDDING_MODEL = 'amazon.titan-embed-text-v1' # Most recent stable model as of 01/08/2024.

# Constants for 4 option lists.
EMOJIS = 'emojis'
PALETTES = 'palettes'
BACKGROUND_EFFECTS = 'background_effects'
FOREGROUND_EFFECTS = 'foreground_effects'

# We rename foreground/background effects and palettes as their model_descriptive_name
# to better reflect the actual output of the effect or color.
# 29 total backgrounds
BACKGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES = [
    'geometric shapes',
    'flower petals',
    'round circle geometric',
    'clouds',
    'simple',
    'diamonds',
    'disco',
    'explosion celebration',
    'flowers plants',
    'light grid',
    'stars',
    'groovy',
    'swirl twist',
    'kaleidoscope',
    'electronic',
    'paint splatter',
    'rainbow stripes',
    'dots geometric pattern',
    'round shapes geometric',
    'snow',
    'words song music',
    'galaxy space',
    'bright',
    'spiral twisty',
    'grid geometric',
    'squiggles',
    'starburst',
    'twinkle',
    'music wave geometric'
]

# 21 total palettes
PALETTE_MODEL_DESCRIPTIVE_NAMES = [
    'fall leaves',
    'black and white',
    'cool',
    'electronic',
    'black and white grayscale',
    'ice cream pastel',
    'rainbow pastel',
    'neon',
    'ocean water',
    'rainbow stripes',
    'roses romantic warm',
    'sky sunrise',
    'spring green plants',
    'summer flower',
    'sunrise cozy',
    'sunset cozy',
    'sweet candy',
    'fire warm',
    'groovy',
    'warm hot red orange',
    'winter icy blue'
]

# 17 total foregrounds
FOREGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES =  [
    'bubbles',
    'hearts',
    'party confetti',
    'happy silly faces emojis',
    'red hearts',
    'music notes sound',
    'rainbow lines',
    'pineapple sweet food',
    'pizza food',
    'poop stinky',
    'rain water',
    'happy',
    'happy emojis faces',
    'spot light focus',
    'stage lights',
    'stars',
    'taco food'
]
