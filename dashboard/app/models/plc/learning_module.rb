# == Schema Information
#
# Table name: plc_learning_modules
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Plc::LearningModule < ActiveRecord::Base
  #I don't like having to specify the foreign key here
  has_many :plc_tasks, class_name: '::Plc::Task', foreign_key: 'plc_learning_module_id', dependent: :destroy
  has_many :plc_module_assignments, class_name: '::Plc::EnrollmentModuleAssignment', foreign_key: 'plc_learning_module_id', dependent: :destroy
end
