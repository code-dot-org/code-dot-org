#!/usr/bin/env ruby
#
# This script iterates over user_levels between FIRST_TIME_TO_PROCESS and
# LAST_TIME_TO_PROCESS, incrementing the user_proficiency table as appropriate.
#
# The script is intended to be run exactly once in production to account for
# user_proficiency preceding its incremental tracking. As the script iterates
# over a significant percentage of the user_levels table, it is expected to take
# a significant amount of time (several hours) to finish.
#
# WARNING: This script is imprecise in multiple ways. It fails to account for
# some of the user activity occuring during the rollout to the frontends of the
# code performing incremental tracking. It incorrectly accounts for incremental
# proficiency when computing basic_proficiency? when deciding to set
# basic_proficiency_at from historical activity.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'

# Since (a) we are concerned with year over year data for reporting and (b) we
# do not have hint data for most of the 2015 calendar year, we are back
# calculating only for 2016 data.
FIRST_TIME_TO_PROCESS = '2016-01-01'
# From running `SELECT MIN(created_at) FROM user_proficiencies;`.
LAST_TIME_TO_PROCESS = '2016-04-26 21:49:45'
# TODO(asher): Make these appropriate numbers.
FIRST_ID_TO_PROCESS = 0
LAST_ID_TO_PROCESS = 1_000_000_000

def main()
  return unless only_one_running?(__FILE__)

  level_concept_difficulties = DASHBOARD_DB[:level_concept_difficulties]

  DASHBOARD_DB[:user_levels].
      where(id: [FIRST_ID_TO_PROCESS, LAST_ID_TO_PROCESS]).
      where(updated_at: [FIRST_TIME_TO_PROCESS, LAST_TIME_TO_PROCESS]).
      where(best_result: 100).
      select(:user_id, :script_id, :level_id, :updated_at).
      each do |user_level|

    # If a hint was used, the level does not count towards proficiency.
    authored_hint_view_request = DASHBOARD_DB[:authored_hint_view_requests].
      where(user_id: user_level[:user_id]).
      where(level_id: user_level[:level_id]).
      where(script_id: user_level[:script_id]).
      any?
    hint_view_request = DASHBOARD_DB[:hint_view_requests].
      where(user_id: user_level[:user_id]).
      where(level_id: user_level[:level_id]).
      where(script_id: user_level[:script_id]).
      any?
    if authored_hint_view_request || hint_view_request
      next
    end

    # Grab the appropriate level_concept_difficulty, if it exists.
    level_concept_difficulty = level_concept_difficulties.
      where(level_id: user_level[:level_id], script_id: user_level[:script_id]).
      first
    if level_concept_diffulty.nil?
      break
    end

    # Increment and save the user proficiency.
    user_proficiency = UserProficiency.where(user_id: user_level[:user_id]).first_or_create!
    user_proficiency.last_progress_at = [
      user_proficiency.last_progress_at, user_level[:updated_at]].max
    ConceptDifficulties::CONCEPTS.each do |concept|
      difficulty_number = level_concept_difficulty.send(concept)
      if !difficulty_number.nil?
        user_proficiency.increment_level_count(concept, difficulty_number)
      end
    end
    if user_proficiency.basic_proficiency_at.nil? &&
        user_proficiency.basic_proficiency?
      user_proficiency.basic_proficiency_at = user_level[:updated_at]
    end
    user_proficiency.save!

    # Occasionally produce some output to indicate current progress.
    if user_level.id % 100000 == 0
      puts "Finished processing user_level with id: #{user_level.id}."
    end
  end
end

main()
