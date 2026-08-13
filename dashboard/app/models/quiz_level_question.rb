# == Schema Information
#
# Table name: quiz_level_questions
#
#  id               :bigint           not null, primary key
#  level_id         :integer          not null
#  quiz_question_id :bigint           not null
#  page             :integer          default(1), not null
#  position         :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_quiz_level_questions_on_level_and_question  (level_id,quiz_question_id) UNIQUE
#  index_quiz_level_questions_on_quiz_question_id    (quiz_question_id)
#
class QuizLevelQuestion < ApplicationRecord
  belongs_to :level
  belongs_to :quiz_question

  default_scope {order(:page, :position)}

  validates :position, presence: true
end
