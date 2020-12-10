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
#  ideal_level_source_id :integer          unsigned
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

class Match < DSLDefined
  def dsl_default
    <<~ruby
      name 'unique level name here'
      title 'title'
      description 'description here'
      question 'Question'
      answer 'Answer 1'
    ruby
  end

  def questions
    properties['questions'] || []
  end

  def answers
    properties['answers'] || []
  end

  def height
    properties['height'] || '40'
  end

  def question
    properties['content1'] || properties['content2'] || properties['content3'] || properties['markdown'] || ''
  end

  def question_content_class
    question_content_blank = properties['content1'].blank? &&
      properties['content2'].blank? &&
      properties['content3'].blank? &&
      properties['markdown'].blank?

    return question_content_blank ? nil : "question"
  end

  # Shuffle the answers until they are different from the original answers (if
  # possible), but retain the original indexes for validation.
  def shuffled_answer_indexes
    answer_indexes = (0...answers.size).to_a
    return answer_indexes if answer_indexes.length <= 1 # avoid infinite loop

    shuffled_indexes = answer_indexes.shuffle until shuffled_indexes && shuffled_indexes != answer_indexes
    shuffled_indexes
  end

  def supports_markdown?
    true
  end

  def icon
    'fa fa-list-ul'
  end
end
