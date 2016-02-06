# == Schema Information
#
# Table name: user_module_artifact_assignments
#
#  id                                   :integer          not null, primary key
#  artifact_id                          :integer
#  user_enrollment_module_assignment_id :integer
#  created_at                           :datetime         not null
#  updated_at                           :datetime         not null
#  status                               :string(255)
#
# Indexes
#
#  fk_rails_3d81c8dc0f                                    (user_enrollment_module_assignment_id)
#  index_user_module_artifact_assignments_on_artifact_id  (artifact_id)
#
# Maps a given user's module assignment to the artifacts that they need to complete. More details are available on
# http://wiki.code.org/display/Operations/Explanation+of+PLC+Model

class PLC::UserModuleArtifactAssignment < ActiveRecord::Base
  belongs_to :artifact
  belongs_to :user_enrollment_module_assignment

  def complete_assignment
    self.status = :completed
    self.save!

    #Upon saving an artifact, there's a possibility that a course has been completed
    user_course_enrollment = self.user_enrollment_module_assignment.user_course_enrollment

    if (user_course_enrollment.user_module_artifact_assignment.where.not(status: :completed).count == 0)
      user_course_enrollment.complete_course
    end
  end
end
