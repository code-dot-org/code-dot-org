# == Schema Information
#
# Table name: plc_evaluation_questions
#
#  id                              :integer          not null, primary key
#  professional_learning_course_id :integer
#  question                        :string(255)
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#
# Indexes
#
#  plc_evaluation_plc_index  (professional_learning_course_id)
#

class PlcEvaluationQuestion < ActiveRecord::Base
  belongs_to :professional_learning_course
  has_many :plc_evaluation_answer, dependent: :destroy
end
