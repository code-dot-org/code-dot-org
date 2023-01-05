#!/usr/bin/env ruby
# This script backfills existing ChannelTokens to set script_id
#
# This backfill was completed 10/27/21, about 3% of channel tokens could not be backfilled most of which were for signed-out
# users. It was run on production-daemon, which is where the CSV of unfilled channel tokens can be found:
# production/bin/oneoff/backfill_data/channel-token-backfill-failures.csv
#
# Background: previously, the channel token for a level was identified by the level_id column. However,
# levels are shared across scripts, so we need to identify the channel token by both level_id and script_id.
# A script_id column was added the the channel tokens table here: https://github.com/code-dot-org/code-dot-org/pull/39835
# New channel tokens that are generated, are generated with a script_id (https://github.com/code-dot-org/code-dot-org/pull/39855).
# The purpose of this script is to backfill the script_id for channel tokens created earlier.
#
# How this script works:
# This script will iterate over channel tokens and identify the script_id in several possible ways,
# 1. If the level only exists in 1 script, use that script_id
# 2. If an associated user exists, if the user has progress in one script that the level could be
# associated with, use that script_id
# 3. If an associated user exists, if the user has one user level that is associated with the channel
# token level, use the script_id from the user level
# 4. If an associated user exists but the user has no script progress or user levels possibly associated
# with the channel token, it's likely that the user visited the level page, which generated a channel token,
# and then left the page. In this case, assign any of the possible scripts to the channel token
#
# It's possible that we will not be able to determine a script_id for the channel token with the data in our database.
# Many of these cases are for logged-out users where we don't store user level or user script data, so there is no
# way to determine which of the scripts the channel token was generated for. We will be leaving the script_id column
# empty for these channel token records.
#

require_relative '../../../dashboard/config/environment'
require 'cdo/db'
require 'optparse'
require 'csv'

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

# We're storing channel token ids that failed backfill in a csv for easy lookup later
$csv_filename = "bin/oneoff/backfill_data/channel-token-backfill-failures.csv"
$start_id = options[:start_id]
$end_id = options[:end_id]
$is_dry_run = options[:dry_run]

$unable_to_backfill = 0

# This hash caches a mapping from level id to associated script ids
$level_to_script_ids = {}

# This hash caches a mapping from level id to level active record
$level_id_to_level = {}

# This hash caches a mapping from level id to parent levels
$level_id_to_parent_levels = {}

def update_script_ids
  puts "Backfilling channel token script_ids..."
  puts "Script started at #{Time.now}"

  CSV.open($csv_filename, "a") do |csv|
    csv.sync = true

    # find_each uses find_in_batches with a batch size of 1000 (https://apidock.com/rails/ActiveRecord/Batches/find_each)
    ChannelToken.where(id: $start_id..$end_id).find_each do |channel_token|
      next if channel_token.script_id.present?

      begin
        error = false
        level_id = channel_token.level_id

        # get all the possible scripts the channel_token could be associated with
        associated_script_ids = get_associated_script_ids(level_id)

        # if the level is associated with only one script_level, use that script
        if associated_script_ids.length == 1
          script_id = associated_script_ids[0]
          update_channel_token(channel_token, script_id, csv)
          next
        end

        user_id = user_id_for_storage_id(channel_token.storage_id)
        # it's possible the channel token was generated for a logged-out user, in which case no user_id will exist
        if user_id.present?
          # get user_scripts for the associated_script_ids, if there is just one user_script, backfill with the
          # associated script_id
          script_ids_from_user_scripts = associated_script_ids_from_user_scripts(user_id, associated_script_ids)
          if script_ids_from_user_scripts.count == 1
            update_channel_token(channel_token, script_ids_from_user_scripts[0], csv)
            next
          end

          # get user_levels for the associated_script_ids, if there is just one user_level, backfill with the
          # associated script_id
          script_ids_from_user_levels = associated_script_ids_from_user_levels(user_id, level_id)
          if script_ids_from_user_levels.count == 1
            update_channel_token(channel_token, script_ids_from_user_levels[0], csv)
            next
          end

          # if the user has no associated user_levels or user_scripts, it's possible that the user visited a channel backed
          # level which generated a channel_token and then the user left the page without making any progress. In this case it doesn't
          # matter which script_id we pick, so backfill with the first associated_script_ids
          if associated_script_ids.count > 0 && script_ids_from_user_scripts.blank? && script_ids_from_user_levels.blank?
            update_channel_token(channel_token, associated_script_ids[0], csv)
            next
          end
        end
      rescue StandardError
        print "[Err]"
        error = true
      end

      log_backfill_failed(channel_token_id: channel_token.id, csv: csv, is_logged_in: user_id.present?, was_error: error)
    end
  end
  puts
  puts "Script ended at #{Time.now}"
  puts
  puts "unable to backfill script id for #{$unable_to_backfill} channel tokens"
  puts "Failures exported to: #{$csv_filename}"
  puts
end

def get_associated_script_ids(level_id)
  unless $level_to_script_ids[level_id].nil?
    return $level_to_script_ids[level_id]
  end

  level = get_level(level_id)
  script_ids = level.script_levels.map(&:script_id)

  parent_levels = get_parent_levels(level_id)
  parent_levels.map do |parent_level|
    parent_level_script_ids = parent_level.script_levels.map(&:script_id)
    script_ids.concat(parent_level_script_ids)
  end

  $level_to_script_ids[level_id] = script_ids.uniq
  return $level_to_script_ids[level_id]
end

def get_level(level_id)
  unless $level_id_to_level[level_id].nil?
    return $level_id_to_level[level_id]
  end

  level = Level.find(level_id)
  $level_id_to_level[level_id] = level
  level
end

def get_parent_levels(level_id)
  unless $level_id_to_parent_levels[level_id].nil?
    return $level_id_to_parent_levels[level_id]
  end

  level = get_level(level_id)
  $level_id_to_parent_levels[level_id] = level.parent_levels
  $level_id_to_parent_levels[level_id]
end

def update_channel_token(channel_token, script_id, csv)
  unless $is_dry_run
    did_save = channel_token.update_attributes(script_id: script_id)

    unless did_save
      user_id = user_id_for_storage_id(channel_token.storage_id)
      log_backfill_failed(channel_token_id: channel_token.id, csv: csv, is_logged_in: user_id.present?, was_error: true)
      return
    end
  end
  print "#{channel_token.id},"
end

def log_backfill_failed(channel_token_id:, csv:, is_logged_in: false, was_error: false)
  print "[F] #{channel_token_id},"
  $unable_to_backfill += 1
  logged_in_value = is_logged_in ? "logged-in" : "logged-out"
  error_value = was_error ? "error" : "no error"
  csv << [channel_token_id, logged_in_value, error_value]
end

def associated_script_ids_from_user_scripts(user_id, script_ids)
  script_ids = UserScript.where(user_id: user_id, script_id: script_ids).pluck(:script_id)
  return script_ids.uniq
end

def associated_script_ids_from_user_levels(user_id, level_id)
  script_ids_from_user_levels = user_level_script_ids(user_id, level_id)

  level = get_level(level_id)

  if script_ids_from_user_levels.empty? && level.contained_levels.any?
    contained_level_id = level.contained_levels.first
    script_ids_from_user_levels = user_level_script_ids(user_id, contained_level_id)
  end

  if script_ids_from_user_levels.empty?
    parent_levels = get_parent_levels(level_id)
    script_ids_from_user_levels = user_level_script_ids(user_id, parent_levels.map(&:id)) if parent_levels.any?
  end

  return script_ids_from_user_levels.uniq
end

def user_level_script_ids(user_id, level_id)
  UserLevel.where(
    user_id: user_id,
    level_id: level_id
  ).pluck(:script_id)
end

update_script_ids
