# == Schema Information
#
# Table name: user_enrollment_module_assignments
#
#  id                                              :integer          not null, primary key
#  professional_learning_module_id                 :integer
#  user_professional_learning_course_enrollment_id :integer
#
# Indexes
#
#  module_assignment_enrollment_index  (user_professional_learning_course_enrollment_id)
#  module_assignment_module_index      (professional_learning_module_id)
#

class UserEnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :professional_learning_module
  belongs_to :user_professional_learning_course_enrollment

  has_many :user_module_task_assignment
end
