#!/usr/bin/env ruby

require_relative '../../lib/cdo/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative '../../dashboard/config/environment'

# We currently have ~31592 un-reorganized level files; we want to batch this
# update a bit so GitHub doesn't have to deal with 30k files in a single PR.
#
# GitHub doesn't like a large number of single files in a single directory
# (which is why we're doing this work in the first place), but also doesn't
# like too many files in a single PR. By default, GitHub will only load the
# first 3000 changed files in a PR, so we want to limit the number of files we
# reorganize at once to be under that limit so the PRs in which these changes
# happen are still at least somewhat viewable.
#
# We plan to execute this script on the levelbuilder machine and capture the
# change with the regularly scheduled staging scoop PRs, so we want to leave a
# little headroom for our regular levelbuilder changes as well. Therefore, we
# limit this script to updating 2500 files per invocation.
files_updated = 0
file_update_limit = 2500
Level.includes(:game).find_each do |level|
  file_moved = Services::LevelFiles.reorganize_level_file_into_subdirectory(level)
  files_updated += 1 if file_moved
  break if files_updated >= file_update_limit
end

puts "Successfully reorganized #{files_updated} .level files"
