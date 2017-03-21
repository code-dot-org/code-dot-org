#!/usr/bin/env ruby

# This script finds all UserLevels for contained levels, and updates their best
# result.
# This is done in dashboard/db/migrate/20170118223108_change_best_result_for_contained_levels.rb
# for non-prod environments.

require_relative '../../dashboard/config/environment'
require src_dir 'database'

CONTAINED_LEVEL_RESULT = 101 # see constants.js

containers = Level.all.select {|x| !x.contained_levels.empty?}
contained_level_ids = containers.map {|x| x.contained_levels[0].id}

ActiveRecord::Base.transaction do
  UserLevel.where(level_id: contained_level_ids).update_all(best_result: CONTAINED_LEVEL_RESULT)
end
