# == Schema Information
#
# Table name: plc_evaluation_questions
#
#  id                 :integer          not null, primary key
#  question           :string(255)
#  plc_course_unit_id :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_plc_evaluation_questions_on_plc_course_unit_id  (plc_course_unit_id)
#

class Plc::EvaluationQuestion < ActiveRecord::Base
  belongs_to :plc_course_unit, class_name: '::Plc::CourseUnit'
  has_many :plc_evaluation_answers, class_name: '::Plc::EvaluationAnswer', foreign_key: 'plc_evaluation_question_id', dependent: :destroy
end
