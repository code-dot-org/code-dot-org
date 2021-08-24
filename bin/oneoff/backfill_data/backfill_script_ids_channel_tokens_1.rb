#!/usr/bin/env ruby
# Backfill existing ChannelTokens to set script_id if it can easily be inferred because there is only one script associated with the level_id

require_relative '../../../dashboard/config/environment'

def channel_tokens_without_script_ids
  ChannelToken.where(script_id: nil)
end

def puts_count
  puts "There are #{channel_tokens_without_script_ids.count} channel_tokens without a script_id"
end

def update_script_ids
  puts "backfilling script_ids..."
  channel_tokens_without_script_ids.find_each do |channel_token|
    associated_script_levels = channel_token.level.script_levels
    if associated_script_levels.length == 1
      script_id = associated_script_levels[0].script_id
      channel_token.update_attributes(script_id: script_id)
    end
  end
end

ChannelToken.transaction do
  puts_count
  update_script_ids
  puts_count
end
