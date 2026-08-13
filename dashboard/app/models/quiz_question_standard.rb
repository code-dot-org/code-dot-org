# == Schema Information
#
# Table name: quiz_question_standards
#
#  id               :bigint           not null, primary key
#  quiz_question_id :bigint           not null
#  standard_id      :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_quiz_question_standards_on_quiz_question_and_standard  (quiz_question_id,standard_id) UNIQUE
#  index_quiz_question_standards_on_standard_id                 (standard_id)
#
class QuizQuestionStandard < ApplicationRecord
  belongs_to :quiz_question
  belongs_to :standard
end
