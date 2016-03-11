# == Schema Information
#
# Table name: plc_enrollment_task_assignments
#
#  id                                  :integer          not null, primary key
#  status                              :string(255)
#  plc_enrollment_module_assignment_id :integer
#  plc_task_id                         :integer
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#
# Indexes
#
#  task_assignment_module_assignment_index  (plc_enrollment_module_assignment_id)
#  task_assignment_task_index               (plc_task_id)
#

class Plc::EnrollmentTaskAssignment < ActiveRecord::Base
  belongs_to :plc_enrollment_module_assignment, class_name: '::Plc::EnrollmentModuleAssignment'
  belongs_to :plc_task, class_name: '::Plc::Task'

  validates :plc_enrollment_module_assignment, presence: true

  after_update :check_course_completion

  def complete_assignment!
    update!(status: :completed)
  end

  def check_course_completion
    plc_enrollment_module_assignment.plc_user_course_enrollment.check_for_course_completion
  end
end
