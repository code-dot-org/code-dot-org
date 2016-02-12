# == Schema Information
#
# Table name: professional_learning_tasks
#
#  id                              :integer          not null, primary key
#  name                            :string(255)
#  description                     :string(255)
#  professional_learning_module_id :integer
#
# Indexes
#
#  task_learning_module_index  (professional_learning_module_id)
#

class ProfessionalLearningTask < ActiveRecord::Base
  belongs_to :professional_learning_module
  has_many :user_module_task_assignments, class_name: 'UserModuleTaskAssignment', dependent: :destroy
end
