# Please refer to the README.md file in this directory for more information
# on how to run this script to generate the cached association maps used by the client.
import json
import os
import sys

from HoC2023AiHelperFunctions import *
from constants import *

emoji_model_descriptive_names, emojis_map = get_ai_emoji_inputs()

background_effect_blockly_ids, background_effect_user_facing_names = get_background_effects()
palette_blockly_ids, palette_user_facing_names = get_palettes()
foreground_effect_blockly_ids, foreground_effect_user_facing_names = get_foreground_effects()

blockly_ids = {
    PALETTES: palette_blockly_ids,
    BACKGROUND_EFFECTS: background_effect_blockly_ids,
    FOREGROUND_EFFECTS: foreground_effect_blockly_ids
}

# Below, we store them in maps for which the key is the model_descriptive_name and the
# value is the corresponding blockly_id.
model_descriptive_names = {}
model_descriptive_names[EMOJIS] = emoji_model_descriptive_names
model_descriptive_names[BACKGROUND_EFFECTS] = BACKGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES
model_descriptive_names[PALETTES] = PALETTE_MODEL_DESCRIPTIVE_NAMES
model_descriptive_names[FOREGROUND_EFFECTS] = FOREGROUND_EFFECT_MODEL_DESCRIPTIVE_NAMES

# Print lists for documentation as
# 'model_descriptive_name | blockly_id | blockly_user_facing_name'
print_options(PALETTES, model_descriptive_names[PALETTES], palette_blockly_ids, palette_user_facing_names)
print_options(BACKGROUND_EFFECTS, model_descriptive_names[BACKGROUND_EFFECTS], background_effect_blockly_ids, background_effect_user_facing_names)
print_options(FOREGROUND_EFFECTS, model_descriptive_names[FOREGROUND_EFFECTS], foreground_effect_blockly_ids, foreground_effect_user_facing_names)

# We use cache files to store ada's raw embedding outputs to reduce Open AI query costs.
# More info available in README.
embeddings_paths = {
    EMOJIS: 'apps/static/dance/ai/model/input_embeddings.pkl',
    PALETTES: 'apps/static/dance/ai/model/palette_embeddings.pkl',
    BACKGROUND_EFFECTS: 'apps/static/dance/ai/model/background_embeddings.pkl',
    FOREGROUND_EFFECTS: 'apps/static/dance/ai/model/foreground_embeddings.pkl'
}

embeddings_caches = {}
for category, path in embeddings_paths.items():
    embeddings_caches[category] = load_embeddings_cache(path)

# Retrieve embeddings using model_descriptive_names for input emojis, palettes, background effects, and foreground effects.
options = {
    EMOJIS: model_descriptive_names[EMOJIS],
    PALETTES: model_descriptive_names[PALETTES],
    BACKGROUND_EFFECTS: model_descriptive_names[BACKGROUND_EFFECTS],
    FOREGROUND_EFFECTS: model_descriptive_names[FOREGROUND_EFFECTS]
}

# embeddings is a dictionary with four lists of embeddings: one for each of the four options above.
embeddings = {}
for category, descriptive_names in options.items():
    embeddings[category] = [retrieve_embedding(string=descriptive_name,
                                                cache_path=embeddings_paths[category],
                                                embedding_cache=embeddings_caches[category])
                                for descriptive_name in descriptive_names
                            ]

# similarities is a dictionary of dictionaries, one dictionary for each output (palette, background effect, and foreground effect).
# Each of the output's dictionary contains keys which are the emoji id names and values which are the
# list of similarity scores comparing the emoji (key) and each of the output items.
similarities = {}
for output_category in [PALETTES, BACKGROUND_EFFECTS, FOREGROUND_EFFECTS]:
    similarities[output_category] = calculate_similarity_score(embeddings[EMOJIS], embeddings[output_category], emojis_map)

# association_output contains 3 dictionaries, one per output (palette, background effect, and foreground effect).
# Write output to cache files storing associations and used by client.
association_output = {}
for output_category in [PALETTES, BACKGROUND_EFFECTS, FOREGROUND_EFFECTS]:
    association_output[output_category] = {'emojiAssociations': similarities[output_category], 'output': blockly_ids[output_category], 'modelDescriptiveNames': model_descriptive_names[output_category]}
    path = 'apps/static/dance/ai/model/cached_' + output_category + '_map.json'
    with open(path, "w") as json_file:
        json_file.write(json.dumps(association_output[output_category], sort_keys=True))
