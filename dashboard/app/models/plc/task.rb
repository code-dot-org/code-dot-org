# == Schema Information
#
# Table name: plc_tasks
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  type       :string(255)      default("Plc::Task"), not null
#  properties :text(65535)
#

class Plc::Task < ActiveRecord::Base
  has_and_belongs_to_many :plc_learning_modules, class_name: '::Plc::LearningModule', foreign_key: 'plc_task_id', association_foreign_key: 'plc_learning_module_id'
  has_many :plc_task_assignments, class_name: '::Plc::EnrollmentTaskAssignment', foreign_key: 'plc_task_id', dependent: :destroy

  include SerializedProperties
  include StiFactory

  attr_readonly :type

  # Can be overridden by subclasses, otherwise they will default to something like Learning Resource Task
  def self.titleized_task_type
    self.name.demodulize.titleize
  end

  def self.underscored_task_type
    self.name.demodulize.underscore
  end

  def self.task_assignment_type
    Plc::EnrollmentTaskAssignment
  end
end
