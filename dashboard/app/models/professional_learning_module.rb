# == Schema Information
#
# Table name: professional_learning_modules
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  learning_module_type :string(255)
#

class ProfessionalLearningModule < ActiveRecord::Base
  has_many :professional_learning_tasks, class_name: 'ProfessionalLearningTask', dependent: :destroy
  belongs_to :professional_learning_course
end
