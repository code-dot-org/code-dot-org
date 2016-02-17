# == Schema Information
#
# Table name: plc_tasks
#
#  id                     :integer          not null, primary key
#  name                   :string(255)
#  plc_learning_module_id :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_plc_tasks_on_plc_learning_module_id  (plc_learning_module_id)
#

class Plc::Task < ActiveRecord::Base
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
  has_many :task_assignments, class_name: '::Plc::EnrollmentTaskAssignment', foreign_key: 'plc_task_id', dependent: :destroy
  has_many :plc_evaluation_answers, class_name: '::Plc::EvaluationAnswer', foreign_key: 'plc_task_id', dependent: :destroy
end
