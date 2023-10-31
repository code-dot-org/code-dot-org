# Script to generate the associated output weights contained in files like cached-spacy-background-map.json
# that are used to calculate final effects output HoC2023.
# Run this Python script from the code-dot-org root directory.
from openai.embeddings_utils import (
    get_embedding,
    distances_from_embeddings,
    tsne_components_from_embeddings,
    chart_from_components,
    indices_of_nearest_neighbors_from_distances,
)
import pandas as pd
import pickle 
import json
from HoC2023AiHelperFunctions import *

# Load the most recent Ada model as of 10/23
EMBEDDING_MODEL = 'text-embedding-ada-002'

# Get the list of emoji names and their corresponding emoji ids
emoji_names_list, emojis_map = get_ai_emoji_inputs()

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

palette_dict = {}
background_dict = {}
foreground_dict = {}

# Define caches to store ada's raw embedding outputs to reduce query costs
# These caches are stored as pickle files; python's native way to serialize data
embedding_paths = ['apps/static/dance/ai/model/input_embeddings.pkl',
'apps/static/dance/ai/model/palette_embeddings.pkl',
'apps/static/dance/ai/model/background_embeddings.pkl',
'apps/static/dance/ai/model/foreground_embeddings.pkl']
input_path = embedding_paths[0]
palette_path = embedding_paths[1]
background_path = embedding_paths[2]
foreground_path = embedding_paths[3]

def load_embedding_cache(path):
    # load the cache if it exists, and save a copy to disk
    try:
        embedding_cache = pd.read_pickle(path)
    except FileNotFoundError:
        embedding_cache = {}
    with open(path, "wb") as embedding_cache_file:
        pickle.dump(embedding_cache, embedding_cache_file)
    return embedding_cache

caches = [load_embedding_cache(path) for path in embedding_paths]
input_cache = caches[0]
palette_cache = caches[1]
background_cache = caches[2]
foreground_cache = caches[3]

# Define a function to retrieve embeddings from the cache if present, and otherwise request via the API
def retrieve_embedding(string: str,
    cache_path: str,
    embedding_cache,
    model: str = EMBEDDING_MODEL,
) -> list:
    """Return embedding of given string, using a cache to avoid recomputing."""
    if (string, model) not in embedding_cache.keys():
        embedding_cache[(string, model)] = get_embedding(string, model)
        with open(cache_path, "wb") as embedding_cache_file:
            pickle.dump(embedding_cache, embedding_cache_file)
    return embedding_cache[(string, model)]

# Retrieve embeddings for input emojis, palettes, backgrounds, and foregrounds in that order
option_lists = [emoji_names_list, palette_model_descriptive_names, background_effect_model_descriptive_names, foreground_effect_model_descriptive_names]
embeddings = []
# Final output should be list of lists structured as [[[emoji1], [emoji2], ...], [[palette1]...]...]
# Where embeddings[0] = all emoji embeddings, [1] = palettes, [2] = background, [3] = foreground
for i in range (0, 4):
    embeddings.append([retrieve_embedding(string=item, 
                                          cache_path=embedding_paths[i],
                                          embedding_cache=caches[i])
                                          for item in option_lists[i]])

emoji_embeddings = embeddings[0]
palette_embeddings = embeddings[1]
background_embeddings = embeddings[2]
foreground_embeddings = embeddings[3]

def calculate_similarity_score(input_embeddings, output_embeddings):
    # Native cosine distance calculation outputs a value between 0 -> 1 where smaller values = greater similarity
    # We can redefine this into cosine similarity with a simple (x-1)*-1 due to their mathematical relationship
    # Cosine similarity is preferable as we can easily sum them together to take a max value later
    similarities = [distances_from_embeddings(input_vector, output_embeddings, distance_metric='cosine')
                            for input_vector in input_embeddings]
    
    # Conversion to pandas DataFrame for ease of manipulation
    similarities = pd.DataFrame(similarities)
    similarities.index = emoji_names_list
    similarities = similarities.apply(lambda x: round((x-1)*-1, 3), axis = 0)

    # Conversion to required JSON lookup format
    similarities_dict = similarities.transpose().to_dict()
    for emoji in similarities_dict:
        similarities_dict[emoji] = list(similarities_dict[emoji].values())
    return similarities_dict

palette_dict = calculate_similarity_score(emoji_embeddings, palette_embeddings)
background_dict = calculate_similarity_score(emoji_embeddings, background_embeddings)
foreground_dict = calculate_similarity_score(emoji_embeddings, foreground_embeddings)

background_output = {'emojiAssociations': background_dict, 'output': background_effect_model_descriptive_names}
palette_output = {'emojiAssociations': palette_dict, 'output': palette_model_descriptive_names}
foreground_output = {'emojiAssociations': foreground_dict, 'output': foreground_effect_model_descriptive_names}

background_output['modelDescriptiveNames'] = background_output['output']
palette_output['modelDescriptiveNames'] = palette_output['output']
foreground_output['modelDescriptiveNames'] = foreground_output['output']

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
