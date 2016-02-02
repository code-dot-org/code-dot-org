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

class UserCourseEnrollment < ActiveRecord::Base
  belongs_to :user
  belongs_to :professional_learning_course

  def self.enroll_user_in_course(user, course)
    enrollment = UserCourseEnrollment.find_or_create_by(user: user, professional_learning_course: course)

    enrollment.professional_learning_course.artifacts.each do |artifact|
      ArtifactAssignment.create_user_artifact_assignment(user, artifact)
    end
  end

  def complete_course
    self.status = :completed
  end
end
