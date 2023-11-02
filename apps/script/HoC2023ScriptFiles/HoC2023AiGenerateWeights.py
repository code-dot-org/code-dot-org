# Please refer to the README.md file in this directory for more information
# on how to run this script to generate the cached association maps used by the client.

import json
from HoC2023AiHelperFunctions import *
from constants import *

# Get the list of emoji model_descriptive_names and their corresponding emoji ids.
emoji_model_descriptive_names_list, emojis_map = get_ai_emoji_inputs()

# Get the background effects, foreground effects, and palettes lists (blockly_ids and user_facing_names).
background_effect_blockly_ids_list, background_effect_user_facing_names_list = get_background_effects()
palette_blockly_ids_list, palette_user_facing_names_list = get_palettes()
foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list = get_foreground_effects()

# Constants for 4 option lists.
EMOJIS = 'emojis'
PALETTES = 'palettes'
BACKGROUND_EFFECTS = 'background_effects'
FOREGROUND_EFFECTS = 'foreground_effects'

blockly_ids_lists_map = {
    PALETTES: palette_blockly_ids_list,
    BACKGROUND_EFFECTS: background_effect_blockly_ids_list,
    FOREGROUND_EFFECTS: foreground_effect_blockly_ids_list
}

# We rename foreground/background effects and palettes as their model_descriptive_name
# to better reflect the actual output of the effect or color.
# Below, we store them in maps for which the key is the model_descriptive_name and the
# value is the corresponding blockly_id.
model_descriptive_names_map = {}
model_descriptive_names_map[BACKGROUND_EFFECTS] = BACKGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES
model_descriptive_names_map[PALETTES] = PALETTE_MODEL_DESCRIPTIVE_NAMES
model_descriptive_names_map[FOREGROUND_EFFECTS] = FOREGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES

# Create maps of model_descriptive_name to blockly_id and print lists
# as 'model_descriptive_name | blockly_id | blockly_user_facing_name'
# Updates lists in comments at bottom of this file.
create_map_print_options(PALETTES, model_descriptive_names_map[PALETTES], palette_blockly_ids_list, palette_user_facing_names_list)
create_map_print_options(BACKGROUND_EFFECTS, model_descriptive_names_map[BACKGROUND_EFFECTS], background_effect_blockly_ids_list, background_effect_user_facing_names_list)
create_map_print_options(FOREGROUND_EFFECTS, model_descriptive_names_map[FOREGROUND_EFFECTS], foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list)

# We use cache files to store ada's raw embedding outputs to reduce Open AI query costs.
# An embedding is a vector (list) of floating point numbers, and embeddings are used to
# measure the relatedness of text strings. The distance between two vectors measures
# their relatedness. https://platform.openai.com/docs/guides/embeddings
# These caches are stored as pickle files; python's native way to serialize data.
embeddings_paths = {
    EMOJIS: 'apps/static/dance/ai/model/input_embeddings.pkl',
    PALETTES: 'apps/static/dance/ai/model/palette_embeddings.pkl',
    BACKGROUND_EFFECTS: 'apps/static/dance/ai/model/background_embeddings.pkl',
    FOREGROUND_EFFECTS: 'apps/static/dance/ai/model/foreground_embeddings.pkl'
}

embeddings_caches = {}
for path in embeddings_paths.keys():
    embeddings_caches[path] = load_embeddings_cache(path)

# Retrieve embeddings using model_descriptive_names for input emojis, palettes, background effects, and foreground effects.
options_lists = {
    EMOJIS: emoji_model_descriptive_names_list,
    PALETTES: model_descriptive_names_map[PALETTES],
    BACKGROUND_EFFECTS: model_descriptive_names_map[BACKGROUND_EFFECTS],
    FOREGROUND_EFFECTS: model_descriptive_names_map[FOREGROUND_EFFECTS]
}

# embeddings is a dictionary with four lists of embeddings:
# EMOJIS: [[emoji1_embedding], [emoji2_embedding], ...]
# PALETTES: [[palette1_embedding], [palette2_embedding], ...]
# BACKGROUND_EFFECTS: [[background_effect1_embedding], [background_effect2_embedding], ...]
# FOREGROUND_EFFECTS: [[foreground_effect1_embedding], [foreground_effect2_embedding], ...]
embeddings = {}
for options_list_name in options_lists.keys():
    embeddings[options_list_name] = [retrieve_embedding(string=item,
                                                        cache_path=embeddings_paths[options_list_name],
                                                        embedding_cache=embeddings_caches[options_list_name])
                                                        for item in options_lists[options_list_name]]

# similarities_map is a dictionary of dictionaries, one dictionary for each output (palette, background effect, and foreground effect).
# Each of the output's dictionary contains keys which are the emoji id names and values which are the
# list of similarity scores comparing the emoji (key) and each of the output items.
# For example, similarities_map[PALETTES] is a dictionary with first key-value assigned as
# 'poopy': [0.772, 0.769, 0.775, 0.785, ...]
# 0.772 is the similarity score between the 'poopy' emoji and the first palette, 'autumn'.
# 0.769 is the similarity score between the 'poopy' emoji and the second palette, 'black and white'., etc.
similarities_map = {}
for outputs_list_name in [PALETTES, BACKGROUND_EFFECTS, FOREGROUND_EFFECTS]:
    similarities_map[outputs_list_name] = calculate_similarity_score(embeddings[EMOJIS], embeddings[outputs_list_name], emojis_map)

# association_output_map contains 3 dictionaries, one per output (palette, background effect, and foreground effect).
# The first key is 'emojiAssociations' and the value is the corresponding dictionary from similarities_map (see above).
# The second key is 'output' and the value is the corresponding blockly_ids list for the output.
association_output_map = {}
for outputs_list_name in [PALETTES, BACKGROUND_EFFECTS, FOREGROUND_EFFECTS]:
    association_output_map[outputs_list_name] = {'emojiAssociations': similarities_map[outputs_list_name], 'output': blockly_ids_lists_map[outputs_list_name]}
    # Write output to cache files storing associations and used by client.
    path = 'apps/static/dance/ai/model/cached_' + outputs_list_name + '_map.json'
    with open(path, "w") as json_file:
        json_file.write(json.dumps(association_output_map[outputs_list_name]))
