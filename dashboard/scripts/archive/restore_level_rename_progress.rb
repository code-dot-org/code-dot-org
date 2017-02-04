#!/usr/bin/env ruby

# Resolves https://www.pivotaltracker.com/story/show/95174118

# In https://github.com/code-dot-org/code-dot-org/pull/2462 we
# renamed a number of levels, destroying ScriptLevel and Level objects,
# but not the old UserLevel objects.

# This script maps existing UserLevel progress from one set of script+level
# combos to another set of script + level combos

require_relative '../../config/environment'

course_names_to_old_new_renames = {
  'course1' => {
    'Course1MazeAssessment1' => 'K-1 Maze Sequence Assessment 1',
    'Course1MazeAssessment2' => 'K-1 Maze Sequence Assessment 2',
    'Course1BeePuzzle12' => 'K-1 Bee Puzzle 12',
    'course 1 artist 1 level 9' => 'K-1 artist 1 level 9',
    'course 1 artist 1 level 10' => 'K-1 artist 1 level 10',
    'Building a Foundation Assessment' => 'K-1 Building a Foundation Assessment'
  },
  'course2' => {
    'Course 2 Maze Loops 1' => '2-3 Maze Loops 1',
    'Course 2 Bee Loops 1' => '2-3 Bee Loops 1A',
    'Course 2 Bee Loops 2' => '2-3 Bee Loops 2A',
    'Course 2 Bee Loops 3_' => '2-3 Bee Loops 3A',
    'Course 2 Bee Loops 3' => '2-3 Bee Loops 3B',
    'Course 2 Bee Loops 4' => '2-3 Bee Loops 4A',
    'Course 2 Bee Loops 13' => '2-3 Bee Loops 13'
  },
  'course3' => {
    'Artist - Nested Loops 1' => '4-5 Nested Loops 1',
    'Artist - Nested Loops 2' => '4-5 Nested Loops 2',
    'Artist - Nested Loops 6' => '4-5 Nested Loops 6',
    'Artist - Nested Loops 9' => '4-5 Nested Loops 9',
    'Artist - Nested Loops 3' => '4-5 Nested Loops 3',
    'Artist - Nested Loops 5' => '4-5 Nested Loops 5',
    'Artist - Nested Loops 7' => '4-5 Nested Loops 7',
    'Artist - Nested Loops 11' => '4-5 Nested Loops 11',
    'Artist - Nested Loops 8' => '4-5 Nested Loops 8',
    'Artist - Nested Loops 12' => '4-5 Nested Loops 12',
    'Artist - Nested Loops Assessment 1' => '4-5 Nested Loops Assessment 1',
    'C3-Farmer While Loops 1' => '4-5 While Loops 1',
    'C3-Farmer While Loops 2' => '4-5 While Loops 2',
    'C3-Farmer While Loops 3' => '4-5 While Loops 3',
    'C3-Farmer While Loops 4' => '4-5 While Loops 4',
    'C3-Farmer While Loops 5' => '4-5 While Loops 5',
    'C3-Farmer While Loops 6' => '4-5 While Loops 6',
    'C3-Farmer While Loops 7' => '4-5 While Loops 7',
    'C3-Farmer While Loops 8' => '4-5 While Loops 8',
    'C3-Farmer While Loops Assessment 1' => '4-5 While Loops Assessment 1'
  }
}

course_names_to_old_new_renames.each do |course_name, old_to_new_levels|
  script_id = Script.find_by(name: course_name).id

  old_to_new_levels.each do |old_name, new_name|
    old_level_id = Level.find_by('name' => old_name).id
    new_level_id = Level.find_by('name' => new_name).id

    puts "#{Time.now} Converting level progress from #{old_name} to #{new_name}"

    UserLevel.where(
      level_id: old_level_id,
      script_id: script_id
    ).find_each do |old_user_level|
      new_user_level = UserLevel.find_by(
        level_id: new_level_id,
        script_id: script_id,
        user_id: old_user_level.user_id
      )
      if new_user_level
        # They have also played since we made the change
        new_user_level.attempts = new_user_level.attempts + old_user_level.attempts
        new_user_level.best_result = [
          new_user_level.best_result || 0,
          old_user_level.best_result || 0
        ].max
        new_user_level.save
        old_user_level.destroy
      else
        # Just move their progress to the new version
        old_user_level.level_id = new_level_id
        old_user_level.save
      end
    end
  end
end
