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

class EvaluationMulti < Multi
  def dsl_default
    <<ruby
name 'Unique question name here'
question 'Question'
answer 'Answer1', weight: 1, stage_name: 'stage_name'
answer 'Answer2', weight: 1, stage_name: 'stage_name'
ruby
  end

  def answers
    properties['answers']
  end
end
