# == Schema Information
#
# Table name: plc_enrollment_module_assignments
#
#  id                            :integer          not null, primary key
#  plc_user_course_enrollment_id :integer
#  plc_learning_module_id        :integer
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  module_assignment_enrollment_index  (plc_user_course_enrollment_id)
#  module_assignment_lm_index          (plc_learning_module_id)
#

class Plc::EnrollmentModuleAssignment < ActiveRecord::Base
  belongs_to :plc_user_course_enrollment, class_name: '::Plc::UserCourseEnrollment'
  belongs_to :plc_learning_module, class_name: '::Plc::LearningModule'
  has_many :plc_task_assignments, class_name: '::Plc::EnrollmentTaskAssignment', foreign_key: 'plc_enrollment_module_assignment_id', dependent: :destroy

  validates :plc_user_course_enrollment, presence: true
end
