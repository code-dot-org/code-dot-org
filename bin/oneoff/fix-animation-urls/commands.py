"""
Used to implement https://github.com/code-dot-org/code-dot-org/pull/31940

One-off script to help fix issue where we needed to replace some bad animation URLs across many level files.
Reads in an old level json from old.json, and the "new" level json (with the fixed URLs) from new.json.
For each name which matches, e.g. bear, bee, etc., outputs a sed command which will replace the old url with the new url
for all the files listed in level_names.

The sed commands can then be pasted into a bash script, which should be run in the script/levels directory.
"""

import json
import sys

def read_file(filename):
    with open(filename, 'r') as f:
        old = json.loads(f.read())
        return old['propsByKey']

def names_to_urls(props_by_key):
    name_to_url = {}

    for guid, entry in props_by_key.items():
        name_to_url[entry['name']] = entry['sourceUrl']
    return name_to_url

old_props_by_key = read_file('old.json')
old_names_to_urls = names_to_urls(old_props_by_key)
#print(old_names_to_urls)

new_props_by_key = read_file('new.json')
new_names_to_urls = names_to_urls(new_props_by_key)
#print(new_names_to_urls)

def escape(str):
    return str.replace('/', '\/')

level_names = ["Dance Party 2.level", "Dance Party 1.level", "Dance Party Freeplay.level", "Dance Party 3.level", "Dance Party 4.level", "Dance Party 7.level", "Dance Party 5.level", "Dance Party 6.level", "Virtual Pet Freeplay.level", "Virtual Pet 1.level", "Virtual Pet 6.level", "Virtual Pet 4.level", "Virtual Pet 3.level", "Virtual Pet 5.level", "Virtual Pet 2.level", "New Game Lab Jr Project Sprites Where.level", "Fish Tank 7.level", "New Sprite Lab Project Sprites Where.level", "Ram Sprite Lab Timers.level", "Sprite Lab Color Mixing.level", "Dance Party 5_simple.level", "Dance Party 6_simple.level", "Dance Party 7_simple.level", "Fish Tank 7-validated_simple.level", "Virtual Pet 1_simple.level", "Virtual Pet 2_simple.level", "Virtual Pet 3_simple.level", "Virtual Pet 4_simple.level", "Virtual Pet 5_simple.level", "Virtual Pet 6_simple.level", "Virtual Pet Freeplay_simple.level", "Dance Party 1-validated.level", "Dance Party 1-validated_simple.level", "Dance Party 2 Validated.level", "Dance Party 2_simple.level", "Dance Party 3 - Validated.level", "Dance Party 1-validated_2019.level", "Dance Party 5 - Validated.level", "Virtual Pet 2 - Validated.level", "Fish Tank 7-validated_2019.level", "Dance Party 3_simple.level", "Dance Party 4 Validated.level", "Dance Party 4_simple.level", "Dance Party 6 - Validated.level", "Dance Party 7 - Validated.level", "Dance Party Freeplay_simple.level", "(joshl) Dance Party 1-validated_2019.level", "Fish Tank 7-validated.level", "Virtual Pet 2 - Validated (Ram).level", "Sprite Lab Block Pool Only.level", "Sprite Lab Blockly Behaviors.level", "Virtual Pet 1-validated.level", "Virtual Pet 5 - Validated.level", "CourseF_Project_SpriteLab_2019.level", "New 2019 Sprite Lab Project.level", "Virtual Pet 1 fix.level", "Virtual Pet 2_simple_clone.level", "Virtual Pet Freeplay_2019.level", "timeforcs_demo_sl_1.level", "timeforcs_demo_sl_2.level", "timeforcs_demo_sl_4.level", "timeforcs_demo_sl_5.level", "timeforcs_demo_sl_6.level", "timeforcs_demo_sl_7.level", "timeforcs_demo_sl_8.level", "timeforcs_demo_sl_9.level"]
level_files = ["'{}'".format(n) for n in level_names]

for name in old_names_to_urls.keys():
    sed_command = "sed -i '' -e 's/{}/{}/g' {}".format(escape(old_names_to_urls[name]), escape(new_names_to_urls[name]), ' '.join(level_files))
    print(sed_command)
