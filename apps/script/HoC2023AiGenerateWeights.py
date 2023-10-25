# Script to generate the associated output weights contained in files like cached-spacy-background-map.json that are used to calculate final effects output HoC2023
import spacy
import json

# Load the spaCy natural language processing model - English tokenizer, tagger, parser and NER (named entity recognition)
nlp = spacy.load("en_core_web_md")

# Define your "emoji_id" (emojis) and foreground/background/palette lists
# For items like background/foreground effects, certain values were adjusted to reflect the most context-rich but open-ended word within the phrase
# e.g. "ripples_random" is adjusted to "ripples", "smiling_poop" -> "poop", etc.
# This was done due to spacy interpreting underscored phrases as a unique word and phrases such as "smiling poop" not correlating highly with most anything within a internet scraped corpus
emoji_ids = ["poopy", "romantic", "party", "silly", "sparkle", "happy", "magic", "spooky", "cute", "funky", "wavy", "lights", "rainbow", "robot", "chaotic", "disco", "zen", "fast", "evil", "cold", "cosmic", "sad", "black-and-white", "warm", "cool"]

# color_palettes dictionary contains python name as key and blockly id as value.
# User-facing name is added as a comment for each color palette.
color_palettes_map = {
  'rainbow pastel': 'default', # Light
  'green blue': 'cool', # Cool
  'electronic': 'elecronic', # Electronic
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

# background_effects_map contains python name as key and blockly id as value.
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

foreground_effects_map = {
    'bubbles': 'bubbles', # Bubbles
    'confetti': 'confetti', # Confetti
    'red hearts': 'hearts_red', # Hearts
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
    'colorful hearts': 'hearts_colorful', # Colorful Hearts
    'stars': 'exploding_stars' # Starburst
    'rainbow paint': 'paint_drip', # Paint Drip
}

palettedict = {}
bgdict = {}
fgdict = {}

# Calculate and print similarity scores
for id_word in emoji_ids:
    palette_scores = []
    for palette_word in color_palettes:
        id_token = nlp(id_word)
        palette_token = nlp(palette_word)
        similarity_score = id_token.similarity(palette_token)
        palette_scores.append(round(similarity_score, 2))
    
    bg_scores = []
    for bg_word in background_effects:
        id_token = nlp(id_word)
        bg_token = nlp(bg_word)
        similarity_score = id_token.similarity(bg_token)
        bg_scores.append(round(similarity_score, 2))
        
    fg_scores = []
    for fg_word in foregrounds:
        id_token = nlp(id_word)
        fg_token = nlp(fg_word)
        similarity_score = id_token.similarity(fg_token)
        fg_scores.append(round(similarity_score, 2))
        
    palettedict[id_word] = palette_scores
    bgdict[id_word] = bg_scores
    fgdict[id_word] = fg_scores

paletteoutput = {'emojiAssociations': palettedict, 'output': color_palettes}
bgoutput = {'emojiAssociations': bgdict, 'output': background_effects}
fgoutput = {'emojiAssociations': fgdict, 'output': foregrounds}

# Modify output to reflect true file names as stored within our typescript codebase

    

with open("apps/static/dance/ai/model/cached-spacy-palette-map", "w") as json_file:
    json_file.write(json.dumps(paletteoutput))

with open("apps/static/dance/ai/model/cached-spacy-background-map", "w") as json_file:
    json_file.write(json.dumps(bgoutput))
    
with open("apps/static/dance/ai/model/cached-spacy-foreground-map", "w") as json_file:
    json_file.write(json.dumps(fgoutput))