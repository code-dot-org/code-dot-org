# Script to generate the associated output weights contained in files like cached-spacy-background-map.json that are used to calculate final effects output HoC2023
import spacy
import json

# Load the spaCy model
nlp = spacy.load("en_core_web_md")

# Define your "id" (emojis) and foreground/background/palette lists
# For items like backgrounds/foregrounds, certain values were adjusted to reflect the most context-rich but open-ended word within the phrase
# e.g. "ripples_random" is adjusted to "ripples", "smiling_poop" -> "poop", etc.
# This was done due to spacy interpreting underscored phrases as a unique word and phrases such as "smiling poop" not correlating highly with most anything within a internet scraped corpus
id = ["poopy", "romantic", "party", "silly", "sparkle", "happy", "magic", "spooky", "cute", "funky", "wavy", "lights", "rainbow", "robot", "chaotic", "disco", "zen", "fast", "evil", "cold", "cosmic", "sad", "black-and-white", "warm", "cool"]
palettes = ["cool", "electronic", "ice cream", "neon", 'rave', "tropical","vintage",'warm', 'greyscale', 'sky', 'ocean', 'sunrise', 'sunset', 'spring', 'summer', 'autumn', 'winter', 'twinkling', 'rainbow', 'roses']
backgrounds = ['circles',
    'color',
    'diamonds',
    'disco',
    'fireworks',
    'swirl',
    'kaleidoscope',
    'lasers',
    'splatter',
    'rainbow',
    'snowflakes',
    'text',
    'galaxy',
    'sparkles',
    'spiral',
    'disco',
    'stars',
    'music',
    'ripples',
    'random',
    'quads',
    'flowers',
    'squiggles',
    'stars',
    'petals',
    'clouds',
    'grid',
    'starburst',
  ]

foregrounds = [
    'bubbles',
    'confetti',
    'hearts',
    'music',
    'pineapples',
    'pizzas',
    'poop',
    'rain',
    'rainbows',
    'smile',
    'spotlight',
    'lights',
    'tacos',
    'emojis',
    'hearts',
    'stars',
    'paint',
  ]

palettedict = {}
bgdict = {}
fgdict = {}

# Calculate and print similarity scores
for id_word in id:
    palette_scores = []
    for palette_word in palettes:
        id_token = nlp(id_word)
        palette_token = nlp(palette_word)
        similarity_score = id_token.similarity(palette_token)
        palette_scores.append(round(similarity_score, 2))
    
    bg_scores = []
    for bg_word in backgrounds:
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

paletteoutput = {'emojiAssociations': palettedict, 'output': palettes}
bgoutput = {'emojiAssociations': bgdict, 'output': backgrounds}
fgoutput = {'emojiAssociations': fgdict, 'output': foregrounds}

# Modify output to reflect true file names as stored within our typescript codebase
bgoutput['output'] = [
    'circles',
    'color_cycle',
    'diamonds',
    'disco_ball',
    'fireworks',
    'swirl',
    'kaleidoscope',
    'lasers',
    'splatter',
    'rainbow',
    'snowflakes',
    'text',
    'galaxy',
    'sparkles',
    'spiral',
    'disco',
    'stars',
    'music_wave',
    'ripples',
    'ripples_random',
    'quads',
    'flowers',
    'squiggles',
    'growing_stars',
    'blooming_petals',
    'clouds',
    'frosted_grid',
    'starburst',
  ]

fgoutput['output'] = [
    'bubbles',
    'confetti',
    'hearts_red',
    'music_notes',
    'pineapples',
    'pizzas',
    'smiling_poop',
    'rain',
    'floating_rainbows',
    'smile_face',
    'spotlight',
    'color_lights',
    'raining_tacos',
    'emojis',
    'hearts_colorful',
    'exploding_stars',
    'paint_drip',
]

with open("apps/static/dance/ai/model/cached-spacy-palette-map", "w") as json_file:
    json_file.write(json.dumps(paletteoutput))

with open("apps/static/dance/ai/model/cached-spacy-background-map", "w") as json_file:
    json_file.write(json.dumps(bgoutput))
    
with open("apps/static/dance/ai/model/cached-spacy-foreground-map", "w") as json_file:
    json_file.write(json.dumps(fgoutput))