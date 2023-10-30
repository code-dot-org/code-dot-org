# Script to generate the associated output weights contained in files like cached-spacy-background-map.json
# that are used to calculate final effects output HoC2023.
# Run this Python script from the code-dot-org root directory.
# python apps/script/HoC2023AiGenerateWeights.py
# At the bottom of this file are background effects, palettes and foreground effects in the order they appear in the dropdowns.
# When this file is run and the three cached data files are replaced in apps/static/dance/ai/model,
# please update comments lists below with output of this script.

import spacy
from HoC2023AiHelperFunctions import *

# Load the spaCy natural language processing model - English tokenizer, tagger, parser and NER (named entity recognition)
nlp = spacy.load("en_core_web_lg")

# Get the list of emoji names and their corresponding emoji ids
emoji_names_list, emojis_map = get_ai_emoji_inputs()
print(emoji_names_list)
print(emojis_map)

background_effect_blockly_ids_list, background_effect_user_facing_names_list = get_background_effects()
palette_blockly_ids_list, palette_user_facing_names_list = get_palettes()
foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list = get_foreground_effects()

# We rename foreground/background effects and palettes as their python_name
# to better reflect the actual output of the effect or color.
# Below, we store them in maps for which the key is the python_name and the
# value is the corresponding blockly_id.

background_effect_python_names = [
    'moving shapes',
    'flower petals',
    'pulse',
    'clouds',
    'solid colors',
    'diamonds',
    'disco',
    'firework',
    'flowers',
    'light grid',
    'stars',
    'groovy shapes',
    'swirl',
    'kaleidoscope',
    'laser beam',
    'paint splatter',
    'rainbow',
    'dots',
    'circles',
    'snow fall',
    'words',
    'galaxy',
    'sparkles',
    'spiral',
    'squares',
    'squiggles',
    'starburst',
    'twinkle',
    'sound wave'
]

# background_effects_map contains python_name as key and blockly_id as value.
background_effects_map = {}
print ('BACKGROUND EFFECTS')
print ('python_name | blockly_id | blockly_user_facing_name')
for i in range(len(background_effect_python_names)):
    python_name = background_effect_python_names[i]
    blockly_id = background_effect_blockly_ids_list[i]
    background_effects_map[python_name] = blockly_id
    print (python_name + ' | ' + blockly_id + ' | ' + background_effect_user_facing_names_list[i])

palette_python_names = [
    'autumn',
    'black and white',
    'green blue',
    'electronic',
    'grayscale',
    'creamy pastel',
    'rainbow pastel',
    'neon',
    'blue',
    'bright rainbow',
    'roses',
    'pink blue',
    'green',
    'flower',
    'coral',
    'purple',
    'sweet candy rainbow',
    'orange',
    'retro',
    'red orange',
    'icy blue'
]

# palettes_map contains python_name as key and blockly_id as value.
palettes_map = {}
print ('PALETTES')
print ('python_name | blockly_id | blockly_user_facing_name')
for i in range(len(palette_python_names)):
    python_name = palette_python_names[i]
    blockly_id = palette_blockly_ids_list[i]
    palettes_map[python_name] = blockly_id
    print (python_name + ' | ' + blockly_id + ' | ' + palette_user_facing_names_list[i])

foreground_effect_python_names = [
    'bubbles',
    'hearts',
    'confetti',
    'emojis',
    'heart',
    'music notes',
    'rainbow paint',
    'pineapple',
    'pizza',
    'poop',
    'rain',
    'rainbow',
    'smily face',
    'spotlight',
    'stage lights',
    'stars',
    'taco'
]

# foreground_effects_map contains python_name as key and blockly_id as value.
foreground_effects_map = {}
print ('FOREGROUND EFFECTS')
print ('python_name | blockly_id | blockly_user_facing_name')
for i in range(len(foreground_effect_python_names)):
    python_name = foreground_effect_python_names[i]
    blockly_id = foreground_effect_blockly_ids_list[i]
    foreground_effects_map[python_name] = blockly_id
    print (python_name + ' | ' + blockly_id + ' | ' + foreground_effect_user_facing_names_list[i])

palette_dict = {}
background_dict = {}
foreground_dict = {}

# Calculate and print similarity scores
for emoji_name in emoji_names_list:
    palette_scores = []
    for palette_word in palette_python_names:
        id_token = nlp(emoji_name)
        palette_token = nlp(palette_word)
        similarity_score = id_token.similarity(palette_token)
        palette_scores.append(round(similarity_score, 2))
    
    background_scores = []
    for background_word in background_effect_python_names:
        id_token = nlp(emoji_name)
        background_token = nlp(background_word)
        similarity_score = id_token.similarity(background_token)
        background_scores.append(round(similarity_score, 2))
        
    foreground_scores = []
    for foreground_word in foreground_effect_python_names:
        id_token = nlp(emoji_name)
        foreground_token = nlp(foreground_word)
        similarity_score = id_token.similarity(foreground_token)
        foreground_scores.append(round(similarity_score, 2))
    emoji_id = emojis_map[emoji_name]
    palette_dict[emoji_id] = palette_scores
    background_dict[emoji_id] = background_scores
    foreground_dict[emoji_id] = foreground_scores

background_output = {'emojiAssociations': background_dict, 'output': background_effect_python_names}
palette_output = {'emojiAssociations': palette_dict, 'output': palette_python_names}
foreground_output = {'emojiAssociations': foreground_dict, 'output': foreground_effect_python_names}

background_output['pythonNames'] = background_output['output']
palette_output['pythonNames'] = palette_output['output']
foreground_output['pythonNames'] = foreground_output['output']

# Modify output to reflect blockly id names.
background_output['output'] = [background_effects_map[bg] for bg in background_output['output']]
foreground_output['output'] = [foreground_effects_map[fg] for fg in foreground_output['output']]
palette_output['output'] = [palettes_map[pal] for pal in palette_output['output']]

with open("apps/static/dance/ai/model/cached-spacy-palette-map.json", "w") as json_file:
    json_file.write(json.dumps(palette_output))

with open("apps/static/dance/ai/model/cached-spacy-background-map.json", "w") as json_file:
    json_file.write(json.dumps(background_output))
    
with open("apps/static/dance/ai/model/cached-spacy-foreground-map.json", "w") as json_file:
    json_file.write(json.dumps(foreground_output))

# Below are background effects, palettes and foreground effects in the order they appear in the dropdowns.
# When this file is run and the three cached data files are replaced in apps/static/dance/ai/model,
# please update comments lists below with output of this script.
# This script is run from the code-dot-org root directory.
# python apps/script/HoC2023AiGenerateWeights.py

# BACKGROUND EFFECTS
# python_name | blockly_id | blockly_user_facing_name
# moving shapes | quads | Angles
# flower petals | blooming_petals | Blooming Petals
# pulse | circles | Circles
# clouds | clouds | Clouds
# solid colors | color_cycle | Colors
# diamonds | diamonds | Diamonds
# disco | disco_ball | Disco Ball
# firework | fireworks | Fireworks
# flowers | flowers | Flowers
# light grid | frosted_grid | Frosted Grid
# stars | growing_stars | Growing Stars
# groovy shapes | higher_power | Higher Power
# swirl | swirl | Hypno
# kaleidoscope | kaleidoscope | Kaleidoscope
# laser beam | lasers | Laser Dance Floor
# paint splatter | splatter | Paint Splatter
# rainbow | rainbow | Rainbow
# dots | ripples_random | Random Ripples
# circles | ripples | Ripples
# snow fall | snowflakes | Snow
# words | text | Song Names
# galaxy | galaxy | Space
# sparkles | sparkles | Sparkles
# spiral | spiral | Spiral
# squares | disco | Squares
# squiggles | squiggles | Squiggles
# starburst | starburst | Starburst
# twinkle | stars | Stars
# sound wave | music_wave | Waves

# PALETTES
# python_name | blockly_id | blockly_user_facing_name
# autumn | autumn | Autumn
# black and white | rave | Black and White
# green blue | cool | Cool
# electronic | electronic | Electronic
# grayscale | grayscale | Grayscale
# creamy pastel | iceCream | Ice Cream
# rainbow pastel | default | Light
# neon | neon | Neon
# blue | ocean | Ocean
# bright rainbow | rainbow | Rainbow
# roses | roses | Roses
# pink blue | sky | Sky
# green | spring | Spring
# flower | summer | Summer
# coral | sunrise | Sunrise
# purple | sunset | Sunset
# sweet candy rainbow | tropical | Tropical
# orange | twinkling | Twinkling
# retro | vintage | Vintage
# red orange | warm | Warm
# icy blue | winter | Winter

# FOREGROUND EFFECTS
# python_name | blockly_id | blockly_user_facing_name
# bubbles | bubbles | Bubbles
# hearts | hearts_colorful | Colorful Hearts
# confetti | confetti | Confetti
# emojis | emojis | Emojis
# heart | hearts_red | Hearts
# music notes | music_notes | Music Notes
# rainbow paint | paint_drip | Paint Drip
# pineapple | pineapples | Pineapples
# pizza | pizzas | Pizzas
# poop | smiling_poop | Poop
# rain | rain | Rain
# rainbow | floating_rainbows | Rainbows
# smily face | smile_face | Smiles
# spotlight | spotlight | Spotlight
# stage lights | color_lights | Stage Lights
# stars | exploding_stars | Starburst
# taco | raining_tacos | Tacos
