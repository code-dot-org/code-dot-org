require 'securerandom'
# == Schema Information
#
# Table name: learning_modules
#
#  id                              :integer          not null, primary key
#  name                            :string(255)
#  learning_module_type            :string(255)
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#  professional_learning_course_id :integer
#
# Indexes
#
#  index_learning_modules_on_professional_learning_course_id  (professional_learning_course_id)
#

class LearningModule < ActiveRecord::Base
  has_many :artifacts, class_name: 'Artifact', dependent: :destroy
  belongs_to :professional_learning_course

  def self.create_from_params(name, learning_module_type, course)
    LearningModule.find_or_create_by(name: name, learning_module_type: learning_module_type, professional_learning_course: course)
  end

  def self.create_random_learning_module course
    create_from_params(SecureRandom.hex, 'random', course)
  end

  def self.create_random_learning_module_with_artifacts course
    learning_module = create_random_learning_module course
    2.times { |_| Artifact.create_random_artifact learning_module }
  end

  def get_user_progress_for_module user
    completed_assignment_count = ArtifactAssignment.where(user: user, artifact: artifacts).count
    total_assignment_count = self.artifacts.count
    return "#{completed_assignment_count}/#{total_assignment_count}"
  end
end
