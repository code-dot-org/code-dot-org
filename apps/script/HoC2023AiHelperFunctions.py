import json

def get_ai_emoji_inputs():
    ai_inputs_file = open('apps/static/dance/ai/ai-inputs.json')
    emojis_json_object = json.load(ai_inputs_file)
    emojis_map = {}
    emoji_names_list = []
    for emoji in emojis_json_object['items']:
        name = emoji['name']
        id = emoji['id']
        emojis_map[name] = id
        emoji_names_list.append(name)
    return emoji_names_list, emojis_map
    
def get_background_effect_json_object():
    set_background_effect_block_config_file = open('dashboard/config/blocks/Dancelab/Dancelab_setBackgroundEffectWithPaletteAI.json')
    set_background_effect_json_object = json.load(set_background_effect_block_config_file)
    return set_background_effect_json_object

def get_foreground_effect_json_object():
    set_foreground_effect_block_config_file = open('dashboard/config/blocks/Dancelab/Dancelab_setForegroundEffectExtended.json')
    set_foreground_effect_json_object = json.load(set_foreground_effect_block_config_file)
    return set_foreground_effect_json_object

def get_background_effects():
    set_background_effect_json_object = get_background_effect_json_object()
    background_effect_options = set_background_effect_json_object['config']['args'][0]['options']
    # Remove from background_effect_options the elements which are 'None' and '(Random)'
    background_effect_options.remove(['None', '"none"'])
    background_effect_options.remove(['(Random)', '"rand"'])
    background_effect_blockly_ids_list = []
    background_effect_user_facing_names_list = []
    # background array is an array with two elements [blockly_id, user_facing_name]
    for background_effect_array in background_effect_options:
        user_facing_name = background_effect_array[0]
        blockly_id = background_effect_array[1].replace('\"', '')
        background_effect_blockly_ids_list.append(blockly_id)
        background_effect_user_facing_names_list.append(user_facing_name)
    return background_effect_blockly_ids_list, background_effect_user_facing_names_list

def get_palettes():
    set_background_effect_json_object = get_background_effect_json_object()
    palette_options = set_background_effect_json_object['config']['args'][1]['options']
    palette_blockly_ids_list = []
    palette_user_facing_names_list = []
    # palette array is an array with two elements [blockly_id, user_facing_name]
    for palette_array in palette_options:
        user_facing_name = palette_array[0]
        blockly_id = palette_array[1].replace('\"', '')
        palette_blockly_ids_list.append(blockly_id)
        palette_user_facing_names_list.append(user_facing_name)
    return palette_blockly_ids_list, palette_user_facing_names_list

def get_foreground_effects():
    set_foreground_effect_json_object = get_foreground_effect_json_object()
    foreground_effect_options = set_foreground_effect_json_object['config']['args'][0]['options']
    # Remove from foreground_effect_options the elements which are 'None' and '(Random)'
    foreground_effect_options.remove(['None', '"none"'])
    foreground_effect_options.remove(['(Random)', '"rand"'])
    foreground_effect_blockly_ids_list = []
    foreground_effect_user_facing_names_list = []
    # foreground array is an array with two elements [blockly_id, user_facing_name]
    for foreground_effect_array in foreground_effect_options:
        user_facing_name = foreground_effect_array[0]
        blockly_id = foreground_effect_array[1].replace('\"', '')
        foreground_effect_blockly_ids_list.append(blockly_id)
        foreground_effect_user_facing_names_list.append(user_facing_name)
    return foreground_effect_blockly_ids_list, foreground_effect_user_facing_names_list
