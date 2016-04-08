# == Schema Information
#
# Table name: plc_enrollment_module_assignments
#
#  id                                :integer          not null, primary key
#  plc_enrollment_unit_assignment_id :integer
#  plc_learning_module_id            :integer
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#
# Indexes
#
#  module_assignment_enrollment_index  (plc_enrollment_unit_assignment_id)
#  module_assignment_lm_index          (plc_learning_module_id)
#

class Plc::EnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :plc_enrollment_unit_assignment, class_name: '::Plc::EnrollmentUnitAssignment'
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
  has_many :plc_task_assignments, class_name: '::Plc::EnrollmentTaskAssignment', foreign_key: 'plc_enrollment_module_assignment_id', dependent: :destroy

  validates :plc_enrollment_unit_assignment, presence: true
  validates :plc_learning_module, presence: true

  MODULE_ASSIGNMENT_STATUS_STATES = [
      NOT_STARTED = 'not_started',
      IN_PROGRESS = 'in_progress',
      COMPLETED = 'completed'
  ]

  # Rather than make a db field indicating status, let's just use the task assignments
  def status_and_style
    tasks_to_complete = plc_task_assignments.joins(:plc_task).where('plc_tasks.type != ?', 'Plc::LearningResourceTask')
    completed_tasks = tasks_to_complete.where(status: Plc::EnrollmentTaskAssignment::COMPLETED)

    if completed_tasks.empty?
      return NOT_STARTED.titleize, 'rgba(255, 0, 0, .3)'
    elsif completed_tasks.size == tasks_to_complete.size
      return COMPLETED.titleize, 'rgba(0, 255, 0, .3)'
    else
      return IN_PROGRESS.titleize, 'rgba(202, 165, 20, .3)'
    end
  end
end
