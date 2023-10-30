# Script to generate the associated output weights contained in files like cached-spacy-background-map.json
# that are used to calculate final effects output HoC2023
# Run this Python script from the code-dot-org root directory.
import spacy
import json

# Load the spaCy natural language processing model - English tokenizer, tagger, parser and NER (named entity recognition)
nlp = spacy.load("en_core_web_lg")

ai_inputs_file = open('apps/static/dance/ai/ai-inputs.json')
emojis_data = json.load(ai_inputs_file)
emojis_map = {}
emojis_list = []
for emoji in emojis_data['items']:
    name = emoji['name']
    id = emoji['id']
    emojis_map[name] = id
    emojis_list.append(name)

# We rename foreground/background effects and palettes as their python_name
# to better reflect the actual output of the effect or color.
# Below, we store them in maps for which the key is the python_name and the
# value is the corresponding blockly_id.

# color_palettes dictionary contains python_name as key and blockly_id as value.
# The user-facing name is added as a comment for each color palette.
color_palettes_map = {
  'rainbow pastel': 'default', # Light
  'green blue': 'cool', # Cool
  'electronic': 'electronic', # Electronic
  'creamy pastel': 'iceCream', # Ice Cream
  'neon': 'neon', # Neon
  'black and white': 'rave', # Black and White
  'sweet candy rainbow': 'tropical', # Tropical
  'retro': 'vintage', # Vintage
  'red orange': 'warm', # Warm
  'grayscale': 'grayscale', # Grayscale
  'pink blue': 'sky', # Sky
  'blue': 'ocean', # Ocean
  'coral': 'sunrise', # Sunrise
  'purple': 'sunset', # Sunset
  'green': 'spring', # Spring
  'flower': 'summer', # Summer
  'autumn': 'autumn', # Autumn
  'icy blue': 'winter', # Winter
  'orange': 'twinkling', # Twinkling
  'bright rainbow': 'rainbow', # Rainbow
  'roses': 'roses', # Roses
}

# background_effects_map contains python_name as key and blockly_id as value.
# The user-facing name is added as a comment for each background effect.
background_effects_map = {
    'pulse': 'circles', # Circles
    'solid colors': 'color_cycle', # Colors
    'diamonds': 'diamonds', # Diamonds
    'disco':'disco_ball', # Disco Ball
    'firework': 'fireworks', # Fireworks
    'swirl': 'swirl', # Hypno
    'kaleidoscope': 'kaleidoscope', # Kaleidoscope
    'laser beam': 'lasers', # Laser Dance Floor
    'paint splatter': 'splatter', # Paint Splatter
    'rainbow': 'rainbow', # Rainbow
    'snow fall': 'snowflakes', # Snow
    'words': 'text', # Song Names
    'galaxy': 'galaxy', # Space
    'sparkles': 'sparkles', # Sparkles
    'spiral': 'spiral', # Spiral
    'squares': 'disco', # Squares
    'twinkle': 'stars', # Stars
    'sound wave': 'music_wave', # Waves
    'circles': 'ripples', # Ripples
    'dots': 'ripples_random', # Random Ripples
    'moving shapes': 'quads', # Angles
    'flowers': 'flowers', # Flowers
    'squiggles': 'squiggles', # Squiggles
    'stars': 'growing_stars', # Growing Stars
    'flower petals': 'blooming_petals', # Blooming Petals
    'clouds': 'clouds', # Clouds
    'light grid': 'frosted_grid', # Frosted Grid
    'starburst': 'starburst', # Starburst
    'groovy shapes': 'higher_power', # Higher Power
}

# foreground_effects_map contains python_name as key and blockly_id as value.
# The user-facing name is added as a comment for each foreground effect.
foreground_effects_map = {
    'bubbles': 'bubbles', # Bubbles
    'confetti': 'confetti', # Confetti
    'heart': 'hearts_red', # Hearts
    'music notes': 'music_notes', # Music Notes
    'pineapple': 'pineapples', # Pineapples
    'pizza': 'pizzas', # Pizzas
    'poop': 'smiling_poop', # Poop
    'rain': 'rain', # Rain
    'rainbow': 'floating_rainbows', # Rainbows
    'smily face': 'smile_face', # Smiles
    'spotlight': 'spotlight', # Spotlight
    'stage lights': 'color_lights', # Stage Lights
    'taco': 'raining_tacos', # Tacos
    'emojis': 'emojis', # Emojis
    'hearts': 'hearts_colorful', # Colorful Hearts
    'stars': 'exploding_stars', # Starburst
    'rainbow paint': 'paint_drip', # Paint Drip
}

palette_dict = {}
background_dict = {}
foreground_dict = {}

# Create lists of python names from each map.
color_palettes = list(color_palettes_map.keys())
background_effects = list(background_effects_map.keys())
foreground_effects = list(foreground_effects_map.keys())

# Calculate and print similarity scores
for emoji_name in emojis_list:
    palette_scores = []
    for palette_word in color_palettes:
        id_token = nlp(emoji_name)
        palette_token = nlp(palette_word)
        similarity_score = id_token.similarity(palette_token)
        palette_scores.append(round(similarity_score, 2))

    background_scores = []
    for background_word in background_effects:
        id_token = nlp(emoji_name)
        background_token = nlp(background_word)
        similarity_score = id_token.similarity(background_token)
        background_scores.append(round(similarity_score, 2))

    foreground_scores = []
    for foreground_word in foreground_effects:
        id_token = nlp(emoji_name)
        foreground_token = nlp(foreground_word)
        similarity_score = id_token.similarity(foreground_token)
        foreground_scores.append(round(similarity_score, 2))

    emoji_id = emojis_map[emoji_name]
    palette_dict[emoji_id] = palette_scores
    background_dict[emoji_id] = background_scores
    foreground_dict[emoji_id] = foreground_scores

palette_output = {'emojiAssociations': palette_dict, 'output': color_palettes}
background_output = {'emojiAssociations': background_dict, 'output': background_effects}
foreground_output = {'emojiAssociations': foreground_dict, 'output': foreground_effects}

background_output['pythonNames'] = background_output['output']
foreground_output['pythonNames'] = foreground_output['output']
palette_output['pythonNames'] = palette_output['output']

# Modify output to reflect blockly id names.
background_output['output'] = [background_effects_map[bg] for bg in background_output['output']]
foreground_output['output'] = [foreground_effects_map[fg] for fg in foreground_output['output']]
palette_output['output'] = [color_palettes_map[pal] for pal in palette_output['output']]

with open("apps/static/dance/ai/model/cached-spacy-palette-map.json", "w") as json_file:
    json_file.write(json.dumps(palette_output))

with open("apps/static/dance/ai/model/cached-spacy-background-map.json", "w") as json_file:
    json_file.write(json.dumps(background_output))

with open("apps/static/dance/ai/model/cached-spacy-foreground-map.json", "w") as json_file:
    json_file.write(json.dumps(foreground_output))
