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
color_palettes_map = {
  'rainbow pastel': 'default',  
  'green blue': 'cool',
  'electronic': 'elecronic',
  'creamy pastel': 'iceCream',
  'neon': 'neon',
  'black and white': 'rave',
  'sweet candy rainbow': 'tropical',
  'retro': 'vintage',
  'red orange': 'warm',
  'grayscale': 'grayscale',
  'pink blue': 'sky',
  'blue': 'ocean',
  'coral': 'sunrise',
  'purple': 'sunset',
  'green': 'spring',
  'flower': 'summer',
  'autumn': 'autumn',
  'icy blue': 'winter',
  'orange': 'twinkling',
  'bright rainbow': 'rainbow',
  'roses': 'roses',
}

# background_effects_map contains python name as key and blockly id as value.
background_effects_map = {
    'pulse': 'circles',
    'solid colors': 'color_cycle',
    'diamonds': 'diamonds',
    'disco':'disco_ball',
    'firework': 'fireworks',
    'swirl': 'swirl',
    'kaleidoscope': 'kaleidoscope',
    'laser beam': 'lasers',
    'paint splatter': 'splatter',
    'rainbow': 'rainbow',
    'snow fall': 'snowflakes',
    'words': 'text',
    'galaxy': 'galaxy',
    'sparkles': 'sparkles',
    'spiral': 'spiral',
    'squares': 'disco',
    'twinkle': 'stars',
    'sound wave': 'music_wave',
    'circles': 'ripples',
    'dots': 'ripples_random',
    'moving shapes': 'quads',
    'flowers': 'flowers',
    'squiggles': 'squiggles',
    'stars': 'growing_stars',
    'flower petals': 'blooming_petals',
    'clouds': 'clouds',
    'light grid': 'frosted_grid',
    'starburst': 'starburst',
    'groovy shapes': 'higher_power',
}

foreground_effects = {
    'bubbles': 'bubbles',
    'confetti': 'confetti',
    'red hearts': 'hearts_red',
    'music notes': 'music_notes',
    'pineapple': 'pineapples',
    'pizza': 'pizzas',
    'poop': 'smiling_poop',
    'rain': 'rain',
    'rainbow': 'floating_rainbows',
    'smily face': 'smile_face',
    'spotlight': 'spotlight',
    'stage lights': 'color_lights',
    'taco': 'raining_tacos',
    'emojis': 'emojis',
    'colorful hearts': 'hearts_colorful',
    'stars': 'exploding_stars'
    'rainbow paint': 'paint_drip',
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