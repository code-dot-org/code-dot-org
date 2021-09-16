#!/usr/bin/env ruby
# Backfill existing ChannelTokens to set script_id if it can easily be inferred because there is only one script associated with the level_id

require_relative '../../../dashboard/config/environment'
require 'cdo/db'
require 'optparse'

# We started writing script_id to the table here: https://github.com/code-dot-org/code-dot-org/pull/39855
# so we don't need to backfill past that point
MAX_CHANNEL_TOKEN_ID_FOR_BACKFILL = 303_500_000

# Parse options
options = {
  start_id: 1,
  end_id: MAX_CHANNEL_TOKEN_ID_FOR_BACKFILL,
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

$start_id = options[:start_id]
$end_id = options[:end_id]
$is_dry_run = options[:dry_run]

$backfill_count = 0
$unable_to_backfill = 0

$level_to_script_ids = {}

def update_script_ids
  puts "Backfilling channel token script_ids..."

  ChannelToken.where(id: $start_id..$end_id).find_each do |channel_token|
    next if channel_token.script_id.present?

    level = channel_token.level
    user_id = user_id_for_storage_id(channel_token.storage_id)

    # get all the possible scripts the channel_token could be associated with
    associated_script_ids = get_associated_script_ids(level)

    # if the level is associated with only one script_level, use that script
    if associated_script_ids.length == 1
      script_id = associated_script_ids[0]
      update_channel_token(channel_token, script_id)
      next
    end

    if user_id.present?
      # get user_scripts for the associated_script_ids, if there is just one user_script, backfill with the
      # associated script_id
      script_ids_from_user_scripts = associated_script_ids_by_user_scripts(user_id, associated_script_ids)
      if script_ids_from_user_scripts.count == 1
        update_channel_token(channel_token, script_ids_from_user_scripts[0])
        next
      end

      # get user_levels for the associated_script_ids, if there is just one user_level, backfill with the
      # associated script_id
      script_ids_from_user_levels = associated_script_ids_from_user_levels(user_id, level)
      if script_ids_from_user_levels.count == 1
        update_channel_token(channel_token, script_ids_from_user_levels[0])
        next
      end

      # if the user has no associated user_levels or user_scripts, it's possible that the user visited a channel backed
      # level which generated a channel_token and then the user left the page without making any progress. In this case it doesn't
      # matter which script_id we pick, so backfill with the first associated_script_ids
      if associated_script_ids.count > 0 && script_ids_from_user_scripts.blank? && script_ids_from_user_levels.blank?
        update_channel_token(channel_token, associated_script_ids[0])
        next
      end
    end

    record_failed_script_id_backfill(level, channel_token, user_id)
  end

  puts
  puts "backfilled #{$backfill_count} script ids"
  puts "unable to backfill script id for #{$unable_to_backfill} channel tokens"
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

# record data used for debugging purposes
def record_failed_script_id_backfill(level, channel_token, user_id)
  if user_id.blank?
    print "-"
  else
    print "F"
    CDO.log.info("Could not update channel token with ID: #{channel_token.id}")
  end

  $unable_to_backfill += 1
end

def associated_script_ids_by_user_scripts(user_id, script_ids)
  user_scripts = UserScript.where(user_id: user_id, script_id: script_ids)
  return user_scripts.map(&:script_id).uniq
end

def associated_script_ids_from_user_levels(user_id, level)
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

  if associated_user_levels.count == 0 && level.parent_levels.any?
    parent_level_ids = level.parent_levels(&:id)
    associated_user_levels = UserLevel.where(user_id: user_id, level_id: parent_level_ids)
  end

  return associated_user_levels.map(&:script_id).uniq
end

update_script_ids
