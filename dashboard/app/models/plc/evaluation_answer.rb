# == Schema Information
#
# Table name: plc_evaluation_answers
#
#  id                         :integer          not null, primary key
#  answer                     :string(255)
#  plc_evaluation_question_id :integer
#  plc_task_id                :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_plc_evaluation_answers_on_plc_evaluation_question_id  (plc_evaluation_question_id)
#  index_plc_evaluation_answers_on_plc_task_id                 (plc_task_id)
#

class Plc::EvaluationAnswer < ActiveRecord::Base
  belongs_to :plc_evaluation_question, class_name: '::Plc::EvaluationQuestion'
  belongs_to :plc_task, class_name: '::Plc::Task'
end
