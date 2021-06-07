# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class EvaluationMulti < Multi
  def dsl_default
    <<~ruby
      name 'Unique question name here'
      question 'Question'
      answer 'Answer1', weight: 1, lesson_name: 'lesson_name'
      answer 'Answer2', weight: 1, lesson_name: 'lesson_name'
    ruby
  end

  def answers
    properties['answers']
  end
end
