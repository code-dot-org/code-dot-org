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
    'Id of last entry to backfill (inclusive).'
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

$start_id = options[:start_id] || 1
$end_id = options[:end_id] || MAX_CHANNEL_TOKEN_ID_FOR_BACKFILL
$is_dry_run = options[:dry_run]

$backfill_count = 0
$unable_to_backfill = 0
$template_unable_to_backfill = 0
$levels_missing_backfills = []
$template_levels_missing_backfills = []

$level_to_script_ids = {}

def update_script_ids
  puts "backfilling script_ids..."

  ChannelToken.where(id: $start_id..$end_id).find_each do |channel_token|
    next if channel_token.script_id.present?

    level = channel_token.level
    user_id = user_id_for_storage_id(channel_token.storage_id)

    # get all the possible scripts the channel token could be associated with
    # search user scripts, if there's just one result use that script id
    # see what's left
    associated_script_ids = get_associated_script_ids(level)
    if user_id.present? && script_id_from_user_scripts = script_id_by_user_scripts(user_id, associated_script_ids)
      update_channel_token(channel_token, script_id_from_user_scripts)
      next
    end

    # if the user has only user_level associated with the level, use the script on that user_level
    if user_id.present? && user_level_script_id = script_id_from_user_level(user_id, level)
      update_channel_token(channel_token, user_level_script_id)
      next
    end

    # if the level is associated with only one script_level, use that script
    if associated_script_ids.length == 1
      script_id = associated_script_ids[0]
      update_channel_token(channel_token, script_id)
      next
    end

    #----- after this we could potentially just pick a script ID there may be multiple from user scripts
    # if we had a logged in user and they have no trace of progress

    record_failed_script_id_backfill(level, channel_token, user_id)
  end

  puts
  puts "backfilled #{$backfill_count} script ids"
  puts "unable to backfill script id for #{$unable_to_backfill} channel tokens (non-template)"
  puts "unable to backfill script id for #{$template_unable_to_backfill} channel tokens (template)"

  # for investigation purposes
  puts "unfilled levels:"
  print $levels_missing_backfills.uniq!
  puts

  puts "unfilled template levels:"
  print $template_levels_missing_backfills.uniq!

  puts
end

def get_associated_script_ids(level)
  if $level_to_script_ids[level.id].present?
    return $level_to_script_ids[level.id]
  end

  script_ids = level.script_levels.map(&:script_id)
  level.parent_levels.map do |parent_level|
    parent_level_script_ids = parent_level.script_levels.map(&:script_id)
    script_ids.concat(parent_level_script_ids)
  end
  $level_to_script_ids[level.id] = script_ids.uniq
  return $level_to_script_ids[level.id]
end

def update_channel_token(channel_token, script_id)
  print "."
  channel_token.update_attributes(script_id: script_id) unless $is_dry_run
  $backfill_count += 1
end

def record_failed_script_id_backfill(level, channel_token, user_id)
  print "f"
  if level.name.downcase.include?("template")
    $template_levels_missing_backfills.push(level.id)
    $template_unable_to_backfill += 1
  else
    if user_id.present?
      puts
      print "level_id: #{level.id}, channel_token_id: #{channel_token.id}, level_name: #{level.name}"
      puts
    end
    $levels_missing_backfills.push(level.id)
    $unable_to_backfill += 1
  end
end

def script_id_by_user_scripts(user_id, script_ids)
  user_scripts = UserScript.where(user_id: user_id, script_id: script_ids)
  return user_scripts[0].script_id if user_scripts.count == 1
end

# Given a channel token, this method returns the associated script_id if it can
# be identified based on user_level
def script_id_from_user_level(user_id, level)
  associated_user_levels = UserLevel.where(
    user_id: user_id,
    level_id: level.id
  )

  if associated_user_levels.count == 0 && level.contained_levels.any?
    contained_level_id = level.contained_levels.first
    associated_user_levels = UserLevel.where(
      user_id: user_id,
      level_id: contained_level_id
    )
  end

  if associated_user_levels.count == 1
    return associated_user_levels[0].script_id
  elsif associated_user_levels.count > 1
    recent_user_levels = associated_user_levels.order(updated_at: :desc)
    script_id = recent_user_levels[0].script_id
    # TODO: add logging so we can determine where we might have missing progress
    return script_id
  end
end

update_script_ids
