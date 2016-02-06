# == Schema Information
#
# Table name: user_course_enrollments
#
#  id                              :integer          not null, primary key
#  user_id                         :integer
#  professional_learning_course_id :integer
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#  status                          :string(255)
#
# Indexes
#
#  index_user_course_enrollments_on_professional_learning_course_id  (professional_learning_course_id)
#  index_user_course_enrollments_on_user_id                          (user_id)
#
# Maps users to courses that they are enrolled in. For more information on PLC object model, see the wiki
# http://wiki.code.org/display/Operations/Explanation+of+PLC+Model

class PLC::UserCourseEnrollment < ActiveRecord::Base
  belongs_to :user
  belongs_to :professional_learning_course
  has_many :user_enrollment_module_assignment
  has_many :user_module_artifact_assignment, through: :user_enrollment_module_assignment

  def self.enroll_user_in_course_with_learning_modules(user, course, learning_modules)
    enrollment = PLC::UserCourseEnrollment.find_or_create_by(user: user, professional_learning_course: course, status: :in_progress)

    learning_modules.each do |learning_module|
      module_assignment = PLC::UserEnrollmentModuleAssignment.find_or_create_by(user_course_enrollment: enrollment, learning_module: learning_module)

      learning_module.artifacts.each do |artifact|
        PLC::UserModuleArtifactAssignment.find_or_create_by(user_enrollment_module_assignment: module_assignment, artifact: artifact, status: :not_started)
      end
    end

    enrollment
  end

  def complete_course
    self.status = :completed
    self.save!
  end
end
