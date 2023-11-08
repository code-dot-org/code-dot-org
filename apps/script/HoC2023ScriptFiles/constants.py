EMBEDDING_MODEL = 'text-embedding-ada-002' # The most recent Ada model as of October 2023.

# Constants for 4 option lists.
EMOJIS = 'emojis'
PALETTES = 'palettes'
BACKGROUND_EFFECTS = 'background_effects'
FOREGROUND_EFFECTS = 'foreground_effects'

# We rename foreground/background effects and palettes as their model_descriptive_name
# to better reflect the actual output of the effect or color.
# 29 total backgrounds
BACKGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES = [
    'angles',
    'flower petals',
    'round circle shapes',
    'clouds',
    'simple colors',
    'diamonds',
    'disco',
    'explosion celebration',
    'flowers',
    'light grid',
    'stars',
    'groovy shapes',
    'swirl',
    'kaleidoscope',
    'electronic',
    'paint splatter',
    'rainbow stripes',
    'dots',
    'round shapes',
    'snow fall',
    'words text print',
    'galaxy space',
    'bright cheery',
    'spiral swirl',
    'squares',
    'squiggles',
    'starburst',
    'twinkle',
    'music wave'
]

# 21 total palettes
PALETTE_MODEL_DESCRIPTIVE_NAMES = [
    'fall leaves',
    'black and white',
    'cool',
    'electronic',
    'grayscale',
    'ice cream pastel',
    'rainbow pastel',
    'neon',
    'ocean blue',
    'rainbow stripes',
    'roses',
    'sky pastel sunrise',
    'spring green plants',
    'summer flower',
    'sunrise',
    'sunset purple',
    'sweet candy',
    'fire warm',
    'groovy',
    'warm hot red orange',
    'winter icy blue'
]

# 17 total foregrounds
FOREGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES =  [
    'bubbles',
    'colored hearts',
    'party confetti',
    'faces',
    'red hearts',
    'music notes sound',
    'rainbow lines',
    'pineapple food hungry',
    'pizza food',
    'poop stinky',
    'rain water',
    'happy',
    'happy face',
    'spotlight',
    'stage lights',
    'stars',
    'taco food hungry'
]
