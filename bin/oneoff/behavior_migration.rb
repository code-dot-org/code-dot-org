#!/usr/bin/env ruby

# This script was used to update custom block configs across all spritelab
# levels. In particular, a bunch of blocks returned type 'Function' when they
# really returned a 'Behavior', or had an arg named 'BEHAVIOR' that wasn't
# correctly typed.

require_relative '../../dashboard/config/environment'

GamelabJr.all.each do |level|
  next unless level.custom_blocks
  blocks = JSON.parse level.custom_blocks
  blocks.each do |block|
    if block['returnType'] && block['returnType'].downcase == 'function'
      block['returnType'] = 'Behavior'
    end
    next unless block['args']
    block['args'].each do |arg|
      if arg['name'] == 'BEHAVIOR'
        arg['type'] = 'Behavior'
      end
    end
  end
  File.write('/tmp/blocks-formatter.js',  "console.log(JSON.stringify(#{JSON.pretty_generate blocks}, null, 2))")
  new_blocks = `node /tmp/blocks-formatter.js`
  exit unless $?.success?
  next if new_blocks == level.custom_blocks
  if ARGV[0] == '-f'
    puts "Updating #{level.name}..."
    level.custom_blocks = new_blocks
    level.save
  else
    File.write('/tmp/blocks-old', level.custom_blocks)
    File.write('/tmp/blocks-new', new_blocks)
    puts `diff -w /tmp/blocks-old /tmp/blocks-new`
  end
rescue
  puts "Failed on #{level.name}"
end
