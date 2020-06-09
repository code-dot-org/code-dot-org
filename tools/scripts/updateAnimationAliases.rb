#!/usr/bin/env ruby
require 'json'

#
# This script is for updating the aliases in the metadata for each animation
# using spriteCostumeLibrary as the source of truth.
# Usage:
# 1. Download the Sprite Lab animation library from S3 and put it in this directory
# 2. Make any desired changes to the aliases in cdo/apps/srce/p5lab/spritelab/spriteCostumeLibrary
# 3. Run ./updateAnimationAliases
# 4. Upload the new animation metadata files to S3
#

SPRITEALB_MANIFEST_FILE = '../../apps/src/p5lab/spritelab/spriteCostumeLibrary.json'.freeze
ANIMATION_LIBRARY_PATH = './cdo-animation-library/spritelab/'

class AliasUpdater
  def get_update_aliases_for_animation(all_aliases, animation_name)
    aliases = []
    all_aliases.each do |aliaz, animations|
      if animations.include? animation_name
        aliases.push aliaz
      end
    end
    return aliases
  end

  def write_updated_metadata(animation_name, new_aliases)
    filepath = "#{ANIMATION_LIBRARY_PATH}#{animation_name}.json"
    metadata_file = File.read(filepath)
    json_data = JSON.parse(metadata_file)
    json_data["aliases"] = new_aliases
    output_file = File.open(filepath, "w")
    output_file.write(JSON.pretty_generate(json_data))
  end

  def update_all_animation_aliases
    all_animations = Dir.glob("./cdo-animation-library/spritelab/*/*.json")
    manifest_file = File.read(SPRITEALB_MANIFEST_FILE)
    json_data = JSON.parse(manifest_file)
    all_aliases = json_data['aliases']
    animation_path_regex = /cdo-animation-library\/spritelab\/(.*)\.json/
    all_animations.each do |animation_path|
      animation_name = animation_path_regex.match(animation_path)[1]
      new_aliases = get_update_aliases_for_animation(all_aliases, animation_name)
      write_updated_metadata(animation_name, new_aliases)
    end
  end
end

AliasUpdater.new.update_all_animation_aliases
