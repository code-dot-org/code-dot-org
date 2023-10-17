import spacy
import json

# Load the spaCy model
nlp = spacy.load("en_core_web_md")

# Define your "id" and "palettes" lists
id = ["poopy", "romantic", "party", "silly", "sparkle", "happy", "magic", "spooky", "cute", "funky", "wavy", "lights", "rainbow", "robot", "chaotic", "disco", "zen", "fast", "evil", "cold", "cosmic", "sad", "black-and-white", "warm", "cool"]
palettes = ["cool", "electronic", "ice cream", "neon", 'rave', "tropical","vintage",'warm']
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

# Modify output to reflect true file names
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