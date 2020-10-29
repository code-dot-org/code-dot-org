#!/usr/bin/env ruby
require_relative '../../deployment'
require 'cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative './constants'
require 'securerandom'
require 'json'

# Regenerates the defaultSprites json file based on the Sprite Lab animation manifest
# located at apps/src/p5lab/spritelab/spriteCostumeLibrary.json and the list of sprites
# to include in the default set located in ./constants.rb

SPRITELAB_MANIFEST = "#{`git rev-parse --show-toplevel`.strip}/apps/src/p5lab/spritelab/spriteCostumeLibrary.json".freeze
OUTPUT_FILE = "#{`git rev-parse --show-toplevel`.strip}/apps/src/p5lab/spritelab/defaultSprites.json".freeze

def main
  ordered_keys = []
  props_by_key = {}
  parsed = JSON.parse(File.read(SPRITELAB_MANIFEST))
  animations = parsed['metadata']

  DEFAULT_SPRITES_LIST.each do |sprite|
    animation_metadata = animations[sprite[:key]]
    props = {}
    props['name'] = sprite[:name]
    props['sourceUrl'] = "https://studio.code.org#{animation_metadata['sourceUrl']}"
    props['frameSize'] = animation_metadata['frameSize']
    props['frameCount'] = animation_metadata['frameCount']
    props['looping'] = animation_metadata['looping']
    props['frameDelay'] = animation_metadata['frameDelay']
    props['version'] = animation_metadata['version']
    props['categories'] = animation_metadata['categories']
    key = SecureRandom.uuid
    ordered_keys.push(key)
    props_by_key[key] = props
  end

  File.open(OUTPUT_FILE, 'w') do |file|
    file.write(
      JSON.pretty_generate(
        {
          'orderedKeys': ordered_keys,
          'propsByKey': props_by_key
        }
      )
    )
  end
end

main
