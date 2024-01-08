import json
from constants import *
import pandas as pd
import pickle
from scipy.spatial.distance import cosine

# AWS Services Python Libraries
import boto3
import botocore

import sys
import os

module_path = ".."
sys.path.append(os.path.abspath(module_path))

# aws_utils contains a custom library file unique to their bedrock tutorial located here: https://github.com/aws-samples/amazon-bedrock-workshop/blob/109ed616fd14c9eb26eda9bef96eb78c490d5ef6/utils/bedrock.py
# See readme.md for more detailed access information and further amazon documentation links
from aws_utils import bedrock

# ---- ⚠️ Un-comment and edit the below lines as needed for your AWS setup ⚠️ ----

# os.environ["AWS_DEFAULT_REGION"] = "us-east-1"  # E.g. "us-east-1"
# os.environ["AWS_PROFILE"] = "codeorg-dev"
# os.environ["BEDROCK_ASSUME_ROLE"] = "arn:aws:iam::165336972514:user/Tyrone"  # E.g. "arn:aws:..."

bedrock_runtime = bedrock.get_bedrock_client(
    assumed_role=os.environ.get("BEDROCK_ASSUME_ROLE", None),
    region=os.environ.get("AWS_DEFAULT_REGION", None)
)

def get_json_object(file):
    block_config_file = open(file)
    json_object = json.load(block_config_file)
    return json_object

def get_ai_emoji_inputs():
    emojis_json_object = get_json_object('apps/static/dance/ai/ai-inputs.json')
    emojis = {}
    emoji_model_descriptive_names = []
    for emoji_item in emojis_json_object['items']:
        model_descriptive_name = emoji_item['modelDescriptiveName']
        id = emoji_item['id']
        emojis[model_descriptive_name] = id
        emoji_model_descriptive_names.append(model_descriptive_name)
    return emoji_model_descriptive_names, emojis

# options are either background_effect_options, foreground_effect_options, or palette_options.
# isEffects is `true` if the options are for foreground or background.
def get_blockly_ids_and_user_facing_names(options, isEffects):
    # If the options is an effects option, remove from options the elements which are 'None' and '(Random)'
    if isEffects:
        options.remove(['None', '"none"'])
        options.remove(['(Random)', '"rand"'])
    blockly_ids = []
    user_facing_names = []
    # option_pair is an array with two elements [blockly_id, user_facing_name]
    for option_pair in options:
        user_facing_name = option_pair[0]
        blockly_id = option_pair[1].replace('\"', '')
        blockly_ids.append(blockly_id)
        user_facing_names.append(user_facing_name)
    return blockly_ids, user_facing_names


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

def print_options(category, model_descriptive_names, blockly_ids, user_facing_names):
    # options_map contains model_descriptive_name as key and blockly_id as value.
    print(category.upper() + '  ')
    print('model_descriptive_name | blockly_id | blockly_user_facing_name  ')
    for i in range(len(model_descriptive_names)):
        print (model_descriptive_names[i] + ' | ' + blockly_ids[i] + ' | ' + user_facing_names[i] + '  ')

# This function loads the embeddings cache file if present, and otherwise creates a new file.
def load_embeddings_cache(path):
    try:
        embedding_cache = pd.read_pickle(path)
    except FileNotFoundError:
        embedding_cache = {}
        with open(path, "wb") as embedding_cache_file:
            pickle.dump(embedding_cache, embedding_cache_file)    
    return embedding_cache

# This function retrieves an embedding for a string from the cache if present, otherwise requests for the embedding through an available model
# As of 01/08/2024, the model being used is AWS's Titan v1 within their Bedrock framework; adjust function body as needed to replace with other models as necessary
def retrieve_embedding(string: str,
    cache_path: str,
    embedding_cache,
    model: str = EMBEDDING_MODEL,
) -> list:
    # If the string is not already in the embedding cache, request embedding and store in cache. Otherwise, retrieve from cache.
    if (string, model) not in embedding_cache.keys():
        body = json.dumps({"inputText": string})
        modelId = model 
        accept = "application/json"
        contentType = "application/json"

        try:

            response = bedrock_runtime.invoke_model(
                body=body, modelId=modelId, accept=accept, contentType=contentType
            )
            response_body = json.loads(response.get("body").read())

            embedding = response_body.get("embedding")
            embedding_cache[(string, model)] = embedding

        except botocore.exceptions.ClientError as error:

            if error.response['Error']['Code'] == 'AccessDeniedException':
                   print(f"\x1b[41m{error.response['Error']['Message']}\
                        \nTo troubeshoot this issue please refer to the following resources.\
                         \nhttps://docs.aws.amazon.com/IAM/latest/UserGuide/troubleshoot_access-denied.html\
                         \nhttps://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html\x1b[0m\n")

            else:
                raise error

        with open(cache_path, "wb") as embedding_cache_file:
            pickle.dump(embedding_cache, embedding_cache_file)
    return embedding_cache[(string, model)]

# This function calculates the similarity score between an input embedding and a list of output embeddings.
def calculate_similarity_score(input_embeddings, output_embeddings, emojis):
    # Creates matrix of cosine distances (similarities) where each subarray represents the distance between an input and each possible output
    # e.g. [[input1:output1, input1:output2...], [input2:output1, output2:output2...]...]
    vectors = []
    indexes = []
    for input_vector in input_embeddings:
        for output in output_embeddings:
            indexes.append(cosine(input_vector, output))
        vectors.append(indexes)
        indexes = []
        
    similarities = vectors
    
    # Conversion to pandas DataFrame for ease of manipulation
    similarities = pd.DataFrame(similarities)
    
    # We use the emoji_ids and not the emoji modelDescriptiveNames as index for use by client
    similarities.index = emojis.values()
    
    # Conversion from cosine distance to cosine similarity for ease of summation later in pipeline.
    # Math explanation: Cosine distance outputs a value between 0 -> 1 where smaller values = greater similarity
    # We can redefine this into cosine similarity with a simple (x-1)*-1 due to their mathematical relationship
    # Since we take the SUM(MAX(similarity)) value when determining which options to present the user, cosine similarity is preferable
    similarities = similarities.apply(lambda x: round((x-1)*-1, 3), axis = 0)

    # Conversion to required JSON lookup format
    similarities_dict = similarities.transpose().to_dict()
    for emoji_id in similarities_dict:
        similarities_dict[emoji_id] = list(similarities_dict[emoji_id].values())
    return similarities_dict
