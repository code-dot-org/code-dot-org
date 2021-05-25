#!/usr/bin/env ruby
require 'json'
require 'optparse'
require_relative '../../lib/cdo/cdo_cli'
include CdoCli

#
# This script is for updating the aliases in the metadata for each animation
# using spriteCostumeLibrary as the source of truth.
# Usage:
# 1. Download the Sprite Lab animation library from S3 and put it in this directory
# 2. Make any desired changes to the aliases in cdo/apps/srce/p5lab/spritelab/spriteCostumeLibrary
# 3. Run ./update_animation_aliases
# Options:
#   -s or --spritelab : Update aliases for Sprite Lab (default is Game Lab)
# 4. Upload the new animation metadata files to S3
#

SPRITELAB_MANIFEST_FILE = '../../apps/src/p5lab/spritelab/spriteCostumeLibrary.json'.freeze
SPRITELAB_ANIMATION_LIBRARY_PATH = './cdo-animation-library/spritelab/'.freeze

GAMELAB_MANIFEST_FILE = '../../apps/src/p5lab/gamelab/animationLibrary.json'.freeze
GAMELAB_ANIMATION_LIBRARY_PATH = './cdo-animation-library/gamelab/'.freeze

class AliasUpdater
  def initialize(options)
    @options = options
  end

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
    library_path = @options[:spritelab] ? SPRITELAB_ANIMATION_LIBRARY_PATH : GAMELAB_ANIMATION_LIBRARY_PATH
    filepath = "#{library_path}#{animation_name}.json"
    metadata_file = File.read(filepath)
    json_data = JSON.parse(metadata_file)
    json_data["aliases"] = new_aliases
    output_file = File.open(filepath, "w")
    output_file.write(JSON.pretty_generate(json_data))
  end

  def update_all_animation_aliases
    all_animations = Dir.glob("./cdo-animation-library/#{@options[:spritelab] ? 'spritelab' : 'gamelab'}/*/*.json")
    manifest_file = File.read(@options[:spritelab] ? SPRITELAB_MANIFEST_FILE : GAMELAB_MANIFEST_FILE)
    json_data = JSON.parse(manifest_file)
    all_aliases = json_data['aliases']
    animation_path_regex = /cdo-animation-library\/#{@options[:spritelab] ? 'spritelab' : 'gamelab'}\/(.*)\.json/
    all_animations.each do |animation_path|
      animation_name = animation_path_regex.match(animation_path)[1]
      new_aliases = get_update_aliases_for_animation(all_aliases, animation_name)
      write_updated_metadata(animation_name, new_aliases)
    end
  end
end

options = {}
cli_parser = OptionParser.new do |opts|
  opts.banner = "Usage: ./updateAnimationAliases.rb [options]"
  opts.separator ""
  opts.separator "Options:"

  opts.on('-s', '--spritelab', 'Update aliases for Sprite Lab (default is Game Lab)') do
    options[:spritelab] = true
  end
end
cli_parser.parse!(ARGV)

AliasUpdater.new(options).update_all_animation_aliases
