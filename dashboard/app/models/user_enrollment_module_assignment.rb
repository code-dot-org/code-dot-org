# == Schema Information
#
# Table name: user_enrollment_module_assignments
#
#  id                        :integer          not null, primary key
#  learning_module_id        :integer
#  user_course_enrollment_id :integer
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  user_id                   :integer
#
# Indexes
#
#  fk_rails_e5e86f5fd9                                             (user_course_enrollment_id)
#  index_user_enrollment_module_assignments_on_learning_module_id  (learning_module_id)
#  index_user_enrollment_module_assignments_on_user_id             (user_id)
#

class UserEnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :learning_module
  belongs_to :user_course_enrollment

  has_many :user_module_artifact_assignment
end
