#!/usr/bin/env ruby
# Backfill existing ChannelTokens to set script_id if it can easily be inferred because there is only one script associated with the level_id

require_relative '../../../dashboard/config/environment'

def channel_tokens_without_script_ids
  ChannelToken.where(script_id: nil)
end

def puts_count
  puts "There are #{channel_tokens_without_script_ids.count} channel_tokens without a script_id"
end

# TODO: not filter by script ID run through all, keep track with a counter

def update_script_ids
  puts "backfilling script_ids..."
  channel_tokens_without_script_ids.find_each do |channel_token|
    associated_script_levels = channel_token.level.script_levels

    # if the level is associated with only one script_level, use that script
    if associated_script_levels.length == 1
      script_id = associated_script_levels[0].script_id
      channel_token.update_attributes(script_id: script_id)
      next
    end

    potential_associated_scripts = associated_script_levels.map(&:script_id)

    # if the level is associated with only one script_level where the script is visible,
    # use that script
    if visible_script_id = script_id_by_visible_scripts(potential_associated_scripts)
      channel_token.update_attributes(script_id: visible_script_id)
      next
    end

    user_id = user_id_for_storage_id(channel_token.storage_id)
    next unless user_id

    # if the user has only user_level associated with the level, use the script on that user_level
    if user_level_script_id = script_id_by_user_level(user_id, channel_token.level_id)
      channel_token.update_attributes(script_id: user_level_script_id)
      next
    end

    # if the user is in or owns a section where the script assigned matches a potential script
    # that could be associated with the level, use that script
    if section_script_id = script_id_by_section(user_id, potential_associated_scripts)
      channel_token.update_attributes(script_id: section_script_id)
      next
    end
  end
end

# Given the script_levels that a channel token may be associated with, this method
# returns the script_id for the associated script if there is only one publicly visible script
def script_id_by_visible_scripts(associated_script_ids)
  visible_published_states = [
    SharedConstants::PUBLISHED_STATE.stable,
    SharedConstants::PUBLISHED_STATE.preview,
    SharedConstants::PUBLISHED_STATE.beta,
    SharedConstants::PUBLISHED_STATE.in_development
  ]

  visible_associated_scripts = Script.where(
    id: associated_script_ids,
    published_state: visible_published_states
  )

  return visible_associated_scripts[0].id if visible_associated_scripts.count == 1
end

# Given a channel token, this method returns the associated script_id if it can
# be identified based on user_level
def script_id_by_user_level(user_id, level_id)
  associated_user_levels = UserLevel.where(
    user_id: user_id,
    level_id: level_id
  )

  if associated_user_levels.count == 1
    script_id = associated_user_levels[0].script_id
    return script_id if script_id.present?
  end
end

# Given a user_id and script ids that could be associated with the channel token, this
# method returns a script id if the user is in a section assigned to a script that matches
# the potential scripts for the channel token
def script_id_by_section(user_id, associated_script_ids)
  user = User.find(user_id)

  user_sections = user.sections_as_student + user.sections
  return if user_sections.empty?

  user_section_script_ids = user_sections.map(&:script_id)
  script_id_intersection = associated_script_ids & user_section_script_ids

  return script_id_intersection[0] if script_id_intersection.length == 1
end

ChannelToken.transaction do
  puts_count
  update_script_ids
  puts_count
end
