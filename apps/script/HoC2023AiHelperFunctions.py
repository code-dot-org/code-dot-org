import json

def get_json_object(file):
    block_config_file = open(file)
    json_object = json.load(block_config_file)
    return json_object

def get_ai_emoji_inputs():
    emojis_json_object = get_json_object('apps/static/dance/ai/ai-inputs.json')
    emojis_map = {}
    emoji_names_list = []
    for emoji in emojis_json_object['items']:
        name = emoji['name']
        id = emoji['id']
        emojis_map[name] = id
        emoji_names_list.append(name)
    return emoji_names_list, emojis_map

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