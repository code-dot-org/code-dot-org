# == Schema Information
#
# Table name: quiz_level_questions
#
#  id                :bigint           not null, primary key
#  level_id          :integer          not null
#  quiz_question_id  :bigint           not null
#  page_number       :integer          not null
#  position          :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
class QuizLevelQuestion < ApplicationRecord
  belongs_to :level
  belongs_to :quiz_question
end
