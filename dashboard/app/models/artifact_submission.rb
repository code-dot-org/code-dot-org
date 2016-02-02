# == Schema Information
#
# Table name: artifact_submissions
#
#  id         :integer          not null, primary key
#  type       :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ArtifactSubmission < ActiveRecord::Base

end
