#!/usr/bin/env ruby
# Backfill existing ChannelTokens to set script_id if it can easily be inferred because there is only one script associated with the level_id

require_relative '../../../dashboard/config/environment'
require 'optparse'

# We started writing script_id to the table here: https://github.com/code-dot-org/code-dot-org/pull/39855
# so we don't need to backfill past that point
MAX_CHANNEL_TOKEN_ID_FOR_BACKFILL = 303_500_000

# Parse options
options = {
  start_id: nil,
  end_id: nil,
  dry_run: false,
}

OptionParser.new do |opts|
  opts.banner = <<~BANNER
    Usage: #{File.basename(__FILE__)} [options]

    This script backfills script_id on the Channel Tokens table.

    Options:
  BANNER

  opts.on('--start-id=1234567',
    Integer,
    'Id of first entry to backfill (inclusive).'
  ) do |start_id|
    options[:start_id] = start_id
  end

  opts.on('--end-id=1234567',
    Integer,
    'Id of last entry to backfill (exclusive).'
  ) do |end_id|
    options[:end_id] = end_id
  end

  opts.on('--dry-run',
    'Enables read-only mode where no changes are written to the database'
  ) do |dry_run|
    options[:dry_run] = dry_run
  end

  opts.on('-h', '--help', 'Prints this help message') do
    puts opts
    exit
  end
end.parse!
puts "Options: #{options}"
options.freeze

def update_script_ids(start_id, end_id, is_dry_run)
  puts "backfilling script_ids..."
  backfill_count = 0
  unable_to_backfill = 0

  ChannelToken.where(id: start_id..end_id).find_each do |channel_token|
    next if channel_token.script_id.present?

    level = channel_token.level
    associated_script_levels = level.script_levels
    user_id = user_id_for_storage_id(channel_token.storage_id)

    # if the level is not in any script_levels, check to see if it's a level
    # within a level
    if associated_script_levels.empty?
      parent_level_ids = get_parent_level_ids(level)

      if parent_level_ids.blank? || user_id.blank?
        unable_to_backfill += 1
        next
      end

      script_id_by_parent_user_levels = get_script_id_by_parent_levels(parent_level_ids, user_id)
      if script_id_by_parent_user_levels
        channel_token.update_attributes(script_id: script_id_by_parent_user_levels) unless is_dry_run
        backfill_count += 1
      end
    end

    # if the level is associated with only one script_level, use that script
    if associated_script_levels.length == 1
      script_id = associated_script_levels[0].script_id
      channel_token.update_attributes(script_id: script_id) unless is_dry_run
      backfill_count += 1
      next
    end

    potential_associated_scripts = associated_script_levels.map(&:script_id)

    # if the level is associated with only one script_level where the script is visible,
    # use that script
    if visible_script_id = script_id_by_visible_scripts(potential_associated_scripts)
      channel_token.update_attributes(script_id: visible_script_id) unless is_dry_run
      backfill_count += 1
      next
    end

    if user_id.blank?
      unable_to_backfill += 1
      next
    end

    # if the user has only user_level associated with the level, use the script on that user_level
    if user_level_script_id = script_id_by_user_level(user_id, level.id)
      channel_token.update_attributes(script_id: user_level_script_id) unless is_dry_run
      backfill_count += 1
      next
    end

    # if the user is in or owns a section where the script assigned matches a potential script
    # that could be associated with the level, use that script
    if section_script_id = script_id_by_section(user_id, potential_associated_scripts)
      channel_token.update_attributes(script_id: section_script_id) unless is_dry_run
      backfill_count += 1
      next
    end

    unable_to_backfill += 1
  end

  puts "backfilled #{backfill_count} script ids, unable to backfill script id for #{unable_to_backfill} channel tokens"
end

def get_parent_level_ids(level)
  parent_level_child_levels = level.levels_parent_levels
  return unless parent_level_child_levels.any?

  parent_level_child_levels.map(&:parent_level_id)
end

def get_script_id_by_parent_levels(parent_level_ids, user_id)
  parent_level_ids.each do |level_id|
    script_id = script_id_by_user_level(user_id, level_id)
    return script_id if script_id
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
  elsif associated_user_levels.count > 1
    recent_user_levels = associated_user_levels.order(updated_at: :desc)
    script_id = recent_user_levels[0].script_id
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

start_id = options[:start_id] || 1
end_id = options[:end_id] || MAX_CHANNEL_TOKEN_ID_FOR_BACKFILL
is_dry_run = options[:dry_run]
ChannelToken.transaction do
  update_script_ids(start_id, end_id, is_dry_run)
end
