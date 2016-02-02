# == Schema Information
#
# Table name: user_artifact_assignments
#
#  id             :integer          not null, primary key
#  user_id        :integer
#  artifact_id    :integer
#  assigned_date  :time
#  completed_date :time
#  status         :string(255)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_user_artifact_assignments_on_artifact_id  (artifact_id)
#  index_user_artifact_assignments_on_user_id      (user_id)
#

class UserArtifactAssignment < ActiveRecord::Base
  belongs_to :user
  belongs_to :artifact
end
