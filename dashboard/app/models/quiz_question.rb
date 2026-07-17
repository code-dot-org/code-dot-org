# == Schema Information
#
# Table name: quiz_questions
#
#  id             :bigint           not null, primary key
#  question_type  :string(255)      not null
#  survey_element :json             not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class QuizQuestion < ApplicationRecord
  has_many :quiz_level_questions, dependent: :destroy
  has_many :levels, through: :quiz_level_questions
end
