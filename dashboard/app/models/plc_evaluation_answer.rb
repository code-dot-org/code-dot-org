# == Schema Information
#
# Table name: plc_evaluation_answers
#
#  id                            :integer          not null, primary key
#  plc_evaluation_question_id    :integer
#  answer                        :string(255)
#  professional_learning_task_id :integer
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  plc_answer_plc_index       (professional_learning_task_id)
#  plc_answer_question_index  (plc_evaluation_question_id)
#

class PlcEvaluationAnswer < ActiveRecord::Base
  belongs_to :plc_evaluation_question
  belongs_to :professional_learning_task
end
