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
#  ideal_level_source_id :integer
#  user_id               :integer
#  properties            :text(65535)
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
    <<ruby
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
  def shuffled_indexed_answers
    indexed_answers = answers.each_with_index.map do |answer, i|
      answer.merge({'index' => i})
    end
    return indexed_answers if indexed_answers.length <= 1 # avoid infinite loop

    shuffled_answers = indexed_answers.shuffle until shuffled_answers && shuffled_answers != indexed_answers
    shuffled_answers
  end

  def supports_markdown?
    true
  end

  def icon
    'fa fa-list-ul'
  end
end
