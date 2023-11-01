# Script to generate the associated output weights contained in files like cached-spacy-background-map.json
# that are used to calculate final effects output HoC2023.
# Run this Python script from the code-dot-org root directory.
import json
from HoC2023AiHelperFunctions import *

# Get the list of emoji names and their corresponding emoji ids
emojis_list, emojis_map = get_ai_emoji_inputs()

background_effect_blockly_ids_list, background_effect_user_facing_names_list = get_background_effects()
palette_blockly_ids_list, palette_user_facing_names_list = get_palettes()
foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list = get_foreground_effects()

# We rename foreground/background effects and palettes as their model_descriptive_name
# to better reflect the actual output of the effect or color.
# Below, we store them in maps for which the key is the model_descriptive_name and the
# value is the corresponding blockly_id.

background_effect_model_descriptive_names = [
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
background_effects_map = create_map_print_options('background_effects', background_effect_model_descriptive_names, background_effect_blockly_ids_list, background_effect_user_facing_names_list)

palette_model_descriptive_names = [
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
palettes_map = create_map_print_options('palettes', palette_model_descriptive_names, palette_blockly_ids_list, palette_user_facing_names_list)

foreground_effect_model_descriptive_names = [
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
foreground_effects_map = create_map_print_options('foreground_effects', foreground_effect_model_descriptive_names, foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list)

# We use cache files to store ada's raw embedding outputs to reduce Open AI query costs.
# An embedding is a vector (list) of floating point numbers, and embeddings are used to
# measure the relatedness of text strings. The distance between two vectors measures
# their relatedness. https://platform.openai.com/docs/guides/embeddings
# These caches are stored as pickle files; python's native way to serialize data.
embedding_paths = {
    'emojis': 'apps/static/dance/ai/model/input_embeddings.pkl',
    'palettes': 'apps/static/dance/ai/model/palette_embeddings.pkl',
    'background_effects': 'apps/static/dance/ai/model/background_embeddings.pkl',
    'foreground_effects': 'apps/static/dance/ai/model/foreground_embeddings.pkl'
}

embeddings_caches = {}
for path in embedding_paths.keys():
    embeddings_caches[path] = load_embedding_cache(path)

# Retrieve embeddings for input emojis, palettes, background efects, and foreground effects.
# Use emojis as inputs.
options_lists = {
    'emojis': emojis_list,
    'palettes': palette_model_descriptive_names,
    'background_effects': background_effect_model_descriptive_names,
    'foreground_effects': foreground_effect_model_descriptive_names
}

embeddings = {}
# embeddings is a dictionary with four lists
# 'emojis': [[emoji1_embedding], [emoji2_embedding], ...]
# 'palettes: [[palette1+embedding], [palette2_embedding], ...]
for options_list_name in options_lists.keys():
    embeddings[options_list_name] = [retrieve_embedding(string=item,
                                                        cache_path=embedding_paths[options_list_name],
                                                        embedding_cache=embeddings_caches[options_list_name])
                                                        for item in options_lists[options_list_name]]
                                    

palette_dict = calculate_similarity_score(embeddings['emojis'], embeddings['palettes'], emojis_map)
background_dict = calculate_similarity_score(embeddings['emojis'], embeddings['background_effects'], emojis_map)
foreground_dict = calculate_similarity_score(embeddings['emojis'], embeddings['foreground_effects'], emojis_map)

background_output = {'emojiAssociations': background_dict, 'output': background_effect_model_descriptive_names}
palette_output = {'emojiAssociations': palette_dict, 'output': palette_model_descriptive_names}
foreground_output = {'emojiAssociations': foreground_dict, 'output': foreground_effect_model_descriptive_names}

# Modify output to reflect blockly id names.
background_output['output'] = [background_effects_map[bg] for bg in background_output['output']]
foreground_output['output'] = [foreground_effects_map[fg] for fg in foreground_output['output']]
palette_output['output'] = [palettes_map[pal] for pal in palette_output['output']]

# For testing purposes (temporary until model is decided):
ada_emoji = 'ada-emoji'
ada_phrase = 'ada-phrase'
spacy_emoji = 'space-emoji'
spacy_phrase = 'spacy-phrase'
test_model = ada_emoji
# Write output to cached files
cached_palette_map = 'apps/static/dance/ai/model/' + test_model + '/cached-palette-map-' + test_model + '.json'
cached_background_map = 'apps/static/dance/ai/model/' + test_model + '/cached-background-map-' + test_model + '.json'
cached_foreground_map = 'apps/static/dance/ai/model/' + test_model + '/cached-foreground-map-' + test_model + '.json'

with open(cached_palette_map, "w") as json_file:
    json_file.write(json.dumps(palette_output))

with open(cached_background_map, "w") as json_file:
    json_file.write(json.dumps(background_output))
    
with open(cached_foreground_map, "w") as json_file:
    json_file.write(json.dumps(foreground_output))

# Below are background effects, palettes and foreground effects in the order they appear in the dropdowns.
# When this file is run and the three cached data files are replaced in apps/static/dance/ai/model,
# please update comments lists below with output of this script.
# This script is run from the code-dot-org root directory.
# python apps/script/HoC2023AiGenerateWeights.py

# BACKGROUND EFFECTS
# model_descriptive_name | blockly_id | blockly_user_facing_name
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
# model_descriptive_name | blockly_id | blockly_user_facing_name
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
# model_descriptive_name | blockly_id | blockly_user_facing_name
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
