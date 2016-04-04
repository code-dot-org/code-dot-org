# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

require "csv"

class Multi < Match
  def dsl_default
    <<ruby
name 'unique level name here'
title 'title'
description 'description here'
question 'Question'
wrong 'wrong answer'
right 'right answer'
ruby
  end

  # Return a string containing the correct indexes.  e.g. "3" or "0,1"
  def correct_answer_indexes
    # We use variable name _index so that the linter ignores the fact that it's not explicitly used.
    properties["answers"].each_with_index.select {|a, _index| a["correct"] == true}.map(&:last).join(",")
  end
end
