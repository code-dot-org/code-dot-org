# == Schema Information
#
# Table name: artifact_assignments
#
#  id                     :integer          not null, primary key
#  artifact_submission_id :integer
#  artifact_id            :integer
#  user_id                :integer
#  status                 :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_artifact_assignments_on_artifact_id             (artifact_id)
#  index_artifact_assignments_on_artifact_submission_id  (artifact_submission_id)
#  index_artifact_assignments_on_user_id                 (user_id)
#

class ArtifactAssignment < ActiveRecord::Base
  belongs_to :artifact_submission
  belongs_to :artifact
  belongs_to :user

  enum artifact_statuses: [:assigned, :in_review, :completed]

  def self.create_user_artifact_assignment user, artifact
    assignment = ArtifactAssignment.find_or_create_by(user: user, artifact: artifact)
    assignment.status = :assigned
    assignment.save!
  end

  def complete_assignment
    self.status = :completed
    self.save!

    #Get all assignments a user has for this course
    course = artifact.learning_module.professional_learning_course
    artifacts_to_complete = course.artifacts
    course_completed = true

    #Surely there must be a better way to do this. Named scopes or something?
    artifacts_to_complete.each do |artifact|
      if (ArtifactAssignment.where(user: user, artifact: artifact).where.not(status: :completed).size > 0)
        course_completed = false
        break
      end
    end

    if (course_completed)
      UserCourseEnrollment.find_by(user: user, professional_learning_course: course).try(:complete_course)
    else
      puts 'Not complete'
    end
  end
end
