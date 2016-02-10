# == Schema Information
#
# Table name: user_module_task_assignments
#
#  id                                   :integer          not null, primary key
#  user_enrollment_module_assignment_id :integer
#  professional_learning_task_id        :integer
#  status                               :string(255)
#
# Indexes
#
#  task_assignment_to_module_assignment_index  (user_enrollment_module_assignment_id)
#  task_assignment_to_task_index               (professional_learning_task_id)
#

# Maps a given user's module assignment to the tasks that they need to complete. More details are available on
# http://wiki.code.org/display/Operations/Explanation+of+plc+Model

class UserModuleTaskAssignment < ActiveRecord::Base
  belongs_to :user_enrollment_module_assignment
  belongs_to :professional_learning_task

  def complete_assignment
    self.status = :completed
    self.save!

    #Upon saving an assignment, there's a possibility that a course has been completed
    enrollment = self.user_enrollment_module_assignment.user_professional_learning_course_enrollment

    if !enrollment.user_module_task_assignment.exists?(['status != ?', 'completed'])
      enrollment.complete_course
    end
  end
end
