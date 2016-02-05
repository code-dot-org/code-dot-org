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
#
# This class represents artifacts that are associated with a given learning module.
# For more details about PLC Class structure, visit http://wiki.code.org/display/Operations/Explanation+of+PLC+Model

class Artifact < ActiveRecord::Base
  belongs_to :learning_module
  has_many :artifact_assignments, class_name: 'ArtifactAssignment', dependent: :destroy
end
