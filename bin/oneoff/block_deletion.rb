#!/usr/bin/env ruby

# This script is used to find and delete level-specific custom blocks that also
# exist in the block pool.
#
# Usage: ./block_deletion.rb
# Typically you would want to run this script directly on levelbuilder. Be sure
# to commit content first in case something goes wrong.
#
# It will run through all the blocks in the block pool, and compare them against
# all level-specific blocks. The level-specific block will be removed if it's
# exactly the same as the block pool block, or if the level it's in is not used
# in any script, nor is it the 'New Sprite Lab Project' level. Otherwise, the
# script will display a diff and prompt you to keep or delete the level-specific
# block.

require_relative '../../dashboard/config/environment'

def diff(block1, block2)
  block1.dup.
    delete_if {|k, v| block2[k] == v}.
    merge!(block2.dup.delete_if {|k, _| block1.key?(k)})
end

def get_name(block)
  block['name'] || block['func']
end

def format_custom_blocks(blocks)
  # You want a hack? I'll give you hack
  File.write('/tmp/blocks-formatter.js',  "console.log(JSON.stringify(#{JSON.pretty_generate blocks}, null, 2))")
  `node /tmp/blocks-formatter.js`
end

def remove_block(level, block_name)
  blocks = JSON.parse(level.custom_blocks)
  blocks.reject! {|block| block_name == get_name(block)}
  level.custom_blocks = format_custom_blocks(blocks)
  level.save!
end

Block.all.each do |shared_block|
  config = JSON.parse(shared_block.config)
  shared_name = get_name(config)
  config.delete('color')
  similar_blocks = [config]

  GamelabJr.all.each do |level|
    next unless level.custom_blocks
    blocks = JSON.parse level.custom_blocks
    blocks.each do |block|
      block.delete('color')
      name = block['name'] || block['func']
      next unless name == shared_name
      if level.script_levels.empty? && level.name != 'New Sprite Lab Project'
        remove_block(level, name)
        next
      end
      puts
      puts "Found a gamelab_#{name} block in #{level.name}"
      if similar_blocks.include? block
        puts "It's the same, deleting..."
        remove_block(level, name)
        next
      end
      puts "It's a different block. These fields changed in the level block:"
      puts JSON.pretty_generate(diff(block, config).sort.to_h)
      puts "Versus these values in the shared block:"
      puts JSON.pretty_generate(diff(config, block).sort.to_h)
      $stdin.flush
      puts "should I delete it anyway? Y/n"
      next if gets.downcase.starts_with? 'n'
      remove_block(level, name)
      similar_blocks << block
    end
  rescue => e
    puts "Failed on #{level.name}, #{e}"
  end
end
