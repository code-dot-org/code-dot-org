# Script to generate the associated output weights contained in files like cached-spacy-background-map.json
# that are used to calculate final effects output HoC2023
# Run this Python script from the code-dot-org root directory.
from openai.embeddings_utils import (
    get_embedding,
    distances_from_embeddings,
    tsne_components_from_embeddings,
    chart_from_components,
    indices_of_nearest_neighbors_from_distances,
)
import pickle 
import json
import pandas as pd

# Load the most recent Ada model as of 10/23
EMBEDDING_MODEL = 'text-embedding-ada-002'

ai_inputs_file = open('./ai-inputs.json')
data = json.load(ai_inputs_file)
emoji_ids = []
for emoji in data['items']:
    emoji_ids.append(emoji['name'])

# We rename foreground/background effects and palettes as their python_name
# to better reflect the actual output of the effect or color.
# Below, we store them in maps for which the key is the python_name and the
# value is the corresponding blockly_id.

# color_palettes dictionary contains python_name as key and blockly_id as value.
# The user-facing name is added as a comment for each color palette.
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
option_lists = [emoji_ids, color_palettes, background_effects, foreground_effects]
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
    similarities.index = emoji_ids
    similarities = similarities.apply(lambda x: round((x-1)*-1, 3), axis = 0)

    # Conversion to required JSON lookup format
    similarities_dict = similarities.transpose().to_dict()
    for emoji in similarities_dict:
        similarities_dict[emoji] = list(similarities_dict[emoji].values())
    return similarities_dict

palette_dict = calculate_similarity_score(emoji_embeddings, palette_embeddings)
background_dict = calculate_similarity_score(emoji_embeddings, background_embeddings)
foreground_embeddings = calculate_similarity_score(emoji_embeddings, foreground_embeddings)

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