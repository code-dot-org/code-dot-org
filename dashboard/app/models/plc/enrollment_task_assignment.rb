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

  def complete_assignment
    self.status = :completed
    self.save!

    #Upon saving an assignment, there's a possibility that a course has been completed
    enrollment = self.plc_enrollment_module_assignment.plc_user_course_enrollment

    if !enrollment.task_assignments.exists?(['status != ?', 'completed'])
      enrollment.complete_course
    end
  end
end
