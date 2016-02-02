# == Schema Information
#
# Table name: artifacts
#
#  id                 :integer          not null, primary key
#  name               :string(255)
#  description        :text(65535)
#  learning_module_id :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_artifacts_on_learning_module_id  (learning_module_id)
#

class Artifact < ActiveRecord::Base
  belongs_to :learning_module
  has_many :artifact_assignments, class_name: 'ArtifactAssignment', dependent: :destroy

  def self.create_from_params(learning_module, name, description)
    artifact = Artifact.new
    artifact.name = name
    artifact.description = description
    artifact.learning_module = learning_module

    artifact.save!
  end

  def self.create_random_artifact(learning_module)
    create_from_params(learning_module, SecureRandom.hex, 'random artifact requirement')
  end
end
