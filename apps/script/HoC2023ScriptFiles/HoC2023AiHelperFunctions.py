import json
from openai.embeddings_utils import (
    get_embedding,
    distances_from_embeddings,
    tsne_components_from_embeddings,
    chart_from_components,
    indices_of_nearest_neighbors_from_distances,
)
from constants import *
import pandas as pd
import pickle 
import openai
openai.api_key = '' # Replace with your OpenAI API key

def get_json_object(file):
    block_config_file = open(file)
    json_object = json.load(block_config_file)
    return json_object

def get_ai_emoji_inputs():
    emojis_json_object = get_json_object('apps/static/dance/ai/ai-inputs.json')
    emojis_map = {}
    emoji_model_descriptive_names_list = []
    for emoji_item in emojis_json_object['items']:
        model_descriptive_name = emoji_item['modelDescriptiveName']
        id = emoji_item['id']
        emojis_map[model_descriptive_name] = id
        emoji_model_descriptive_names_list.append(model_descriptive_name)
    return emoji_model_descriptive_names_list, emojis_map

# options are either background_effect_options, foreground_effect_options, or palette_options.
# isEffects is `true` if the options are for foreground or background.
def get_blockly_ids_and_user_facing_names(options, isEffects):
    # If the options is an effects option, remove from options the elements which are 'None' and '(Random)'
    if isEffects:
        options.remove(['None', '"none"'])
        options.remove(['(Random)', '"rand"'])
    blockly_ids_list = []
    user_facing_names_list = []
    # option_pair is an array with two elements [blockly_id, user_facing_name]
    for option_pair in options:
        user_facing_name = option_pair[0]
        blockly_id = option_pair[1].replace('\"', '')
        blockly_ids_list.append(blockly_id)
        user_facing_names_list.append(user_facing_name)
    return blockly_ids_list, user_facing_names_list


def get_background_effects():
    set_background_effect_json_object = get_json_object('dashboard/config/blocks/Dancelab/Dancelab_setBackgroundEffectWithPaletteAI.json')
    background_effect_options = set_background_effect_json_object['config']['args'][0]['options']
    return get_blockly_ids_and_user_facing_names(background_effect_options, True)


def get_foreground_effects():
    set_foreground_effect_json_object = get_json_object('dashboard/config/blocks/Dancelab/Dancelab_setForegroundEffectExtended.json')
    foreground_effect_options = set_foreground_effect_json_object['config']['args'][0]['options']
    return get_blockly_ids_and_user_facing_names(foreground_effect_options, True)

def get_palettes():
    set_background_effect_json_object = get_json_object('dashboard/config/blocks/Dancelab/Dancelab_setBackgroundEffectWithPaletteAI.json')
    palette_options = set_background_effect_json_object['config']['args'][1]['options']
    return get_blockly_ids_and_user_facing_names(palette_options, False)

def create_map_print_options(options_name, model_descriptive_names, blockly_ids_list, user_facing_names_list):
    # options_map contains model_descriptive_name as key and blockly_id as value.
    options_map = {}
    print(options_name.upper())
    print('model_descriptive_name | blockly_id | blockly_user_facing_name')
    for i in range(len(model_descriptive_names)):
        model_descriptive_name = model_descriptive_names[i]
        blockly_id = blockly_ids_list[i]
        options_map[model_descriptive_name] = blockly_id
        print (model_descriptive_name + ' | ' + blockly_id + ' | ' + user_facing_names_list[i])
    return options_map

# This function loads the embeddings cache file if present, and otherwise creates a new file.
def load_embeddings_cache(path):
    try:
        embedding_cache = pd.read_pickle(path)
    except FileNotFoundError:
        embedding_cache = {}
    with open(path, "wb") as embedding_cache_file:
        pickle.dump(embedding_cache, embedding_cache_file)    
    return embedding_cache

# This function retrieves an embedding for a string from the cache if present, and otherwise requests
# the embedding via the Open AI API
def retrieve_embedding(string: str,
    cache_path: str,
    embedding_cache,
    model: str = EMBEDDING_MODEL,
) -> list:
    # If the string is not already in the embedding cache, request embedding via
    # get_embedding and store in cache. Otherwise, retrieve from cache.
    if (string, model) not in embedding_cache.keys():
        embedding_cache[(string, model)] = get_embedding(string, model)
        with open(cache_path, "wb") as embedding_cache_file:
            pickle.dump(embedding_cache, embedding_cache_file)
    return embedding_cache[(string, model)]

# This function calculates the similarity score between an input enmbedding and a list of output embeddings.
def calculate_similarity_score(input_embeddings, output_embeddings, emojis_map):
    # distance_from_embeddings returns a list of distances between the input embedding and each output embedding
    # https://github.com/openai/openai-python/blob/284c1799070c723c6a553337134148a7ab088dd8/openai/embeddings_utils.py#L139
    # Thus, similarities is an array of arrays of distances, with each subarray representing the distances between
    # from an input embedding to each output embedding.    
    similarities = [distances_from_embeddings(input_vector, output_embeddings, distance_metric='cosine')
                            for input_vector in input_embeddings]
    
    # Conversion to pandas DataFrame for ease of manipulation
    similarities = pd.DataFrame(similarities)
    
    # We use the emoji_ids and not the emoji Unicode as index for use by client
    similarities.index = emojis_map.values()
    
    # Native cosine distance calculation outputs a value between 0 -> 1 where smaller values = greater similarity
    # We can redefine this into cosine similarity with a simple (x-1)*-1 due to their mathematical relationship
    # Cosine similarity is preferable as we can easily sum them together to take a max value later
    similarities = similarities.apply(lambda x: round((x-1)*-1, 3), axis = 0)

    # Conversion to required JSON lookup format
    similarities_dict = similarities.transpose().to_dict()
    for emoji_id in similarities_dict:
        similarities_dict[emoji_id] = list(similarities_dict[emoji_id].values())
    return similarities_dict
