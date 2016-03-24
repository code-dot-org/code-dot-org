# == Schema Information
#
# Table name: plc_evaluation_answers
#
#  id                         :integer          not null, primary key
#  answer                     :string(255)
#  plc_evaluation_question_id :integer
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  plc_learning_module_id     :integer
#
# Indexes
#
#  index_plc_evaluation_answers_on_plc_evaluation_question_id  (plc_evaluation_question_id)
#  index_plc_evaluation_answers_on_plc_learning_module_id      (plc_learning_module_id)
#

class Plc::EvaluationAnswer < ActiveRecord::Base
  belongs_to :plc_evaluation_question, class_name: '::Plc::EvaluationQuestion'
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
end
